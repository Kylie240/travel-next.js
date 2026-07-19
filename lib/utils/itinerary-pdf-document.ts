import jsPDF from "jspdf";
import { formatDateToText } from "./date";
import { itineraryTagsMap } from "@/lib/constants/tags";

const CREAM: [number, number, number] = [252, 248, 241];
const BEIGE: [number, number, number] = [235, 228, 216];
const INK: [number, number, number] = [28, 28, 28];
const MUTED: [number, number, number] = [100, 100, 100];
const LINE: [number, number, number] = [210, 205, 196];

const MARGIN = 18;
const DINING_ACTIVITY_TYPES = new Set([2, 11]);

type TocEntry = { label: string; page: number };

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setText(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function imageFormatFromDataUrl(dataUrl: string): "JPEG" | "PNG" | "WEBP" {
  if (dataUrl.includes("image/png")) return "PNG";
  if (dataUrl.includes("image/webp")) return "WEBP";
  return "JPEG";
}

/**
 * jsPDF reads raw pixel dimensions and ignores EXIF orientation, so phone
 * photos often appear rotated 90°. Re-encode with orientation applied.
 */
async function bakeImageOrientation(
  bytes: ArrayBuffer
): Promise<string | null> {
  // Server (purchase email PDF): Sharp .rotate() applies EXIF then strips it
  if (typeof window === "undefined") {
    try {
      const sharp = (await import("sharp")).default;
      const out = await sharp(Buffer.from(bytes))
        .rotate()
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();
      return `data:image/jpeg;base64,${out.toString("base64")}`;
    } catch (e) {
      console.error("PDF image orientation (sharp):", e);
      return null;
    }
  }

  // Browser (in-app export): decode via ImageBitmap / canvas (honors EXIF)
  try {
    const blob = new Blob([bytes]);
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(blob, {
        // Ensure EXIF orientation is applied when supported
        imageOrientation: "from-image",
      } as ImageBitmapOptions);
    } catch {
      bitmap = await createImageBitmap(blob);
    }

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    return dataUrl.startsWith("data:image/jpeg") ? dataUrl : null;
  } catch (e) {
    console.error("PDF image orientation (canvas):", e);
    return null;
  }
}

async function fetchImageDataUrl(
  url: string | null | undefined
): Promise<string | null> {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  try {
    let bytes: ArrayBuffer;
    if (url.startsWith("data:")) {
      const base64 = url.split(",")[1];
      if (!base64) return url;
      const binary = atob(base64);
      const arr = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
      bytes = arr.buffer;
    } else {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      if (!res.ok) return null;
      bytes = await res.arrayBuffer();
    }

    const oriented = await bakeImageOrientation(bytes);
    if (oriented) return oriented;

    // Fallback: original bytes (may still be rotated if bake failed)
    if (url.startsWith("data:")) return url;
    const u8 = new Uint8Array(bytes);
    let binary = "";
    for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
    return `data:image/jpeg;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function formatTripDateRange(days: any[] | undefined): string {
  if (!days?.length) return "";
  const sorted = [...days]
    .map((d) => d?.date)
    .filter(Boolean)
    .sort() as string[];
  if (!sorted.length) return "";
  const a = formatDateToText(sorted[0]);
  const b = formatDateToText(sorted[sorted.length - 1]);
  if (!a) return "";
  if (a === b) return a;
  return `${a} – ${b}`;
}

function activityVisible(a: any): boolean {
  return a?.showActivity !== false;
}

function collectDiningRows(days: any[] | undefined) {
  const rows: { dayLabel: string; activity: any }[] = [];
  if (!days?.length) return rows;
  days.forEach((day, index) => {
    const dayLabel = day?.title?.trim() || `Day ${index + 1}`;
    day?.activities?.forEach((act: any) => {
      if (!activityVisible(act)) return;
      const t = act?.type;
      if (!DINING_ACTIVITY_TYPES.has(t)) return;
      if (!act?.title?.trim()) return;
      rows.push({ dayLabel, activity: act });
    });
  });
  return rows;
}

function collectAccommodationRows(days: any[] | undefined) {
  const rows: { dayLabel: string; acc: any }[] = [];
  const seen = new Set<string>();
  if (!days?.length) return rows;
  days.forEach((day, index) => {
    const name = day?.accommodation?.name?.trim();
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      dayLabel: day?.title?.trim() || `Day ${index + 1}`,
      acc: day.accommodation,
    });
  });
  return rows;
}

function hasMeaningfulNotes(notes: any[] | undefined): boolean {
  if (!notes?.length) return false;
  return notes.some((n) => n?.title?.trim() || n?.content?.trim());
}

async function preloadItineraryImages(itinerary: any) {
  const urls: { key: string; url: string }[] = [];
  if (itinerary?.mainImage) urls.push({ key: "main", url: itinerary.mainImage });
  const unique = new Map<string, string>();
  for (const { key, url } of urls) {
    if (unique.has(key)) continue;
    const data = await fetchImageDataUrl(url);
    if (data) unique.set(key, data);
  }
  return unique;
}

function drawFooterBar(
  doc: jsPDF,
  pageW: number,
  pageH: number,
  line: string,
  pageIndex: number,
  totalPages: number
) {
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, pageH - 14, pageW - MARGIN, pageH - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setText(doc, MUTED);
  const left = line.length > 90 ? `${line.slice(0, 87)}…` : line;
  doc.text(left, MARGIN, pageH - 7);
  doc.text(`Page ${pageIndex} of ${totalPages}`, pageW - MARGIN, pageH - 7, {
    align: "right",
  });
}

/** Side length of the square cover image: ⅔ of page height, capped by horizontal margins only. */
function coverMainImageSquareSide(pageW: number, pageH: number) {
  return Math.min((2 / 3) * pageH, pageW - 2 * MARGIN);
}

/**
 * Square frame (side × side); photo uses object-fit: cover (uniform scale, center-cropped) so the
 * visible area is always a full square — no letterboxing rectangle inside the frame.
 */
function drawCoverSquareImage(
  doc: jsPDF,
  mainImage: string,
  pageW: number,
  pageH: number,
  side: number
) {
  const fmt = imageFormatFromDataUrl(mainImage);
  const props = doc.getImageProperties(mainImage);
  const iw = props.width;
  const ih = props.height;
  if (!(iw > 0 && ih > 0) || side <= 0) return;

  const sqX = (pageW - side) / 2;
  const sqY = pageH - MARGIN - side;

  setFill(doc, CREAM);
  doc.rect(sqX, sqY, side, side, "F");

  const imgRatio = iw / ih;
  let drawW: number;
  let drawH: number;
  let drawX: number;
  let drawY: number;
  if (imgRatio >= 1) {
    drawH = side;
    drawW = side * imgRatio;
    drawX = sqX + (side - drawW) / 2;
    drawY = sqY;
  } else {
    drawW = side;
    drawH = side / imgRatio;
    drawX = sqX;
    drawY = sqY + (side - drawH) / 2;
  }

  doc.saveGraphicsState();
  doc.rect(sqX, sqY, side, side, null).clip().discardPath();
  doc.addImage(mainImage, fmt, drawX, drawY, drawW, drawH, undefined, "FAST");
  doc.restoreGraphicsState();

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.rect(sqX, sqY, side, side, "S");
}

function drawCoverPage(
  doc: jsPDF,
  itinerary: any,
  pageW: number,
  pageH: number,
  mainImage: string | undefined,
  dateRange: string
) {
  setFill(doc, CREAM);
  doc.rect(0, 0, pageW, pageH, "F");

  const title = itinerary?.title?.trim() || "Your itinerary";
  const topThird = pageH / 3;
  const coverSide = coverMainImageSquareSide(pageW, pageH);
  const coverImgTop = pageH - MARGIN - coverSide;

  if (mainImage) {
    try {
      drawCoverSquareImage(doc, mainImage, pageW, pageH, coverSide);
    } catch {
      /* skip broken image */
    }
  }

  const titleUpper = title.toUpperCase();
  const titleMaxW = pageW - MARGIN * 2;
  const textBottomLimit = Math.min(topThird - 12, coverImgTop - 8);

  doc.setFont("times", "bold");
  setText(doc, INK);
  doc.setFontSize(52);
  let ty = MARGIN + 28;
  const titleLines = doc.splitTextToSize(titleUpper, titleMaxW);
  for (const ln of titleLines) {
    if (ty > textBottomLimit) break;
    doc.text(ln, pageW / 2, ty, { align: "center" });
    ty += 20;
  }

  if (dateRange) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    setText(doc, MUTED);
    ty += 8;
    if (ty <= textBottomLimit) {
      doc.text(dateRange.toUpperCase(), pageW / 2, ty, { align: "center" });
    }
  }
}

function drawTocPage(
  doc: jsPDF,
  pageW: number,
  pageH: number,
  entries: TocEntry[]
) {
  doc.setPage(2);
  setFill(doc, CREAM);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setFont("times", "bold");
  setText(doc, INK);
  doc.setFontSize(20);
  doc.text("TABLE OF CONTENTS", pageW / 2, 42, { align: "center" });

  let y = 58;
  const pillW = pageW - MARGIN * 2;
  const pillH = 11;
  doc.setFont("helvetica", "normal");
  entries.forEach((e) => {
    setFill(doc, BEIGE);
    doc.roundedRect(MARGIN, y - 6, pillW, pillH, 3, 3, "F");
    doc.setFontSize(10);
    setText(doc, INK);
    const label =
      e.label.length > 75 ? `${e.label.slice(0, 72)}…` : e.label;
    doc.text(label, MARGIN + 5, y);
    doc.setFont("times", "normal");
    setText(doc, MUTED);
    doc.text(String(e.page), pageW - MARGIN - 5, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += pillH + 5;
  });
}

function drawSectionHeading(doc: jsPDF, text: string, pageW: number, y: number) {
  doc.setFont("times", "bold");
  setText(doc, INK);
  doc.setFontSize(16);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y + 4, pageW - MARGIN, y + 4);
  return y + 14;
}

function ensureSpace(
  doc: jsPDF,
  y: number,
  need: number,
  pageH: number
): number {
  if (y + need > pageH - 20) {
    doc.addPage();
    setFill(doc, CREAM);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), pageH, "F");
    return MARGIN + 6;
  }
  return y;
}

function normalizeExternalUrl(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
  return `https://${s}`;
}

const LINK_BLUE: [number, number, number] = [30, 64, 175];
/** Horizontal space reserved so a trailing link icon fits on the last wrapped line. */
const LINK_ICON_RESERVE = 6.2;

/**
 * Draw a small chain-link style icon (vector) with a clickable hit area. Returns width consumed (gap + icon).
 */
function addExternalLinkIcon(doc: jsPDF, x: number, yBaseline: number, url: string): number {
  const gapBefore = 1.2;
  const left = x + gapBefore;
  const top = yBaseline - 2.85;
  const w = 3.15;
  const h = 3.15;
  const rx = 1.05;
  doc.setDrawColor(LINK_BLUE[0], LINK_BLUE[1], LINK_BLUE[2]);
  doc.setLineWidth(0.22);
  doc.roundedRect(left, top, w, h, rx, rx, "S");
  doc.roundedRect(left + w * 0.38, top - 0.45, w, h, rx, rx, "S");
  const pad = 0.45;
  const hitW = w * 1.38 + pad * 2;
  const hitH = h + 0.55;
  doc.link(left - pad, top - 0.55, hitW, hitH, { url });
  return gapBefore + hitW + 0.35;
}

/**
 * Draw wrapped text. If `url` is set, text is plain (ink); a clickable icon is drawn after the last line only.
 * Returns the y position below the block.
 */
function drawWrappedTitleWithOptionalLink(
  doc: jsPDF,
  x: number,
  y: number,
  textW: number,
  pageH: number,
  text: string,
  font: "helvetica" | "times",
  fontStyle: "normal" | "bold" | "italic",
  fontSize: number,
  lineStep: number,
  url: string | null
): number {
  doc.setFont(font, fontStyle);
  doc.setFontSize(fontSize);
  const wrapW = url ? Math.max(8, textW - LINK_ICON_RESERVE) : textW;
  const lines = doc.splitTextToSize(text, wrapW);
  if (url) {
    setText(doc, INK);
    lines.forEach((ln: string, i: number) => {
      y = ensureSpace(doc, y, lineStep + 1, pageH);
      doc.text(ln, x, y);
      if (i === lines.length - 1) {
        addExternalLinkIcon(doc, x + doc.getTextWidth(ln), y, url);
      }
      y += lineStep;
    });
    return y;
  }
  setText(doc, INK);
  lines.forEach((ln: string) => {
    y = ensureSpace(doc, y, lineStep + 1, pageH);
    doc.text(ln, x, y);
    y += lineStep;
  });
  return y;
}

function drawHighlightsPage(
  doc: jsPDF,
  itinerary: any,
  pageW: number,
  pageH: number
) {
  setFill(doc, CREAM);
  doc.rect(0, 0, pageW, pageH, "F");

  let y = drawSectionHeading(doc, "Trip highlights & overview", pageW, MARGIN + 8);
  const textW = pageW - MARGIN * 2;

  doc.setFont("helvetica", "bold");
  setText(doc, INK);
  doc.setFontSize(11);
  doc.text("TRIP HIGHLIGHTS", MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, MUTED);
  const highlights =
    itinerary?.shortDescription?.trim() ||
    "A curated day-by-day plan for your trip.";
  doc.splitTextToSize(highlights, textW).forEach((ln: string) => {
    y = ensureSpace(doc, y, 6, pageH);
    doc.text(ln, MARGIN, y);
    y += 5;
  });
  y += 6;

  if (itinerary?.detailedOverview?.trim()) {
    y = ensureSpace(doc, y, 14, pageH);
    doc.setFont("helvetica", "bold");
    setText(doc, INK);
    doc.setFontSize(11);
    doc.text("DETAILED OVERVIEW", MARGIN, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    setText(doc, MUTED);
    doc
      .splitTextToSize(itinerary.detailedOverview.trim(), textW)
      .forEach((ln: string) => {
        y = ensureSpace(doc, y, 6, pageH);
        doc.text(ln, MARGIN, y);
        y += 5;
      });
    y += 4;
  }

  y = ensureSpace(doc, y, 20, pageH);
  doc.setFont("helvetica", "bold");
  setText(doc, INK);
  doc.setFontSize(11);
  doc.text("AT A GLANCE", MARGIN, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, MUTED);
  const meta: string[] = [];
  if (itinerary?.duration)
    meta.push(
      `${itinerary.duration} ${itinerary.duration === 1 ? "day" : "days"}`
    );
  if (itinerary?.countries?.length)
    meta.push(`Countries: ${itinerary.countries.join(", ")}`);
  if (itinerary?.cities?.length) {
    const cities = itinerary.cities
      .map((c: any) => [c?.city, c?.country].filter(Boolean).join(", "))
      .filter(Boolean)
      .join(" · ");
    if (cities) meta.push(`Cities: ${cities}`);
  }
  if (itinerary?.budget != null)
    meta.push(`Est. budget: $${Number(itinerary.budget).toLocaleString()}`);
  if (itinerary?.itineraryTags?.length) {
    const names = itinerary.itineraryTags
      .map((id: number) => itineraryTagsMap.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    if (names) meta.push(`Style: ${names}`);
  }
  meta.forEach((line) => {
    y = ensureSpace(doc, y, 6, pageH);
    doc.text(line, MARGIN, y);
    y += 5;
  });
}

/** Continuous day-by-day section (may span multiple pages). */
function drawCombinedDaysSection(
  doc: jsPDF,
  days: any[],
  pageW: number,
  pageH: number
): TocEntry[] {
  setFill(doc, CREAM);
  doc.rect(0, 0, pageW, pageH, "F");
  const textW = pageW - MARGIN * 2;
  const dayEntries: TocEntry[] = [];

  let y = drawSectionHeading(doc, "Day by day", pageW, MARGIN + 8);

  days.forEach((day: any, dayIndex: number) => {
    if (dayIndex > 0) {
      y = ensureSpace(doc, y, 10, pageH);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y, pageW - MARGIN, y);
      y += 10;
    }

    const dayTitle = day?.title?.trim() || `Day ${dayIndex + 1}`;
    const dayPage = doc.getCurrentPageInfo().pageNumber;
    dayEntries.push({
      label: `Day ${dayIndex + 1}: ${dayTitle}`,
      page: dayPage,
    });

    doc.setFont("times", "bold");
    setText(doc, INK);
    doc.setFontSize(11);
    y = ensureSpace(doc, y, 7, pageH);
    doc.text(`DAY ${String(dayIndex + 1).padStart(2, "0")}`, MARGIN, y);
    y += 6;

    y = drawWrappedTitleWithOptionalLink(
      doc,
      MARGIN,
      y,
      textW,
      pageH,
      dayTitle,
      "helvetica",
      "bold",
      13,
      6,
      null
    );
    y += 4;

    if (day?.date) {
      const fd = formatDateToText(day.date);
      if (fd) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        setText(doc, MUTED);
        y = ensureSpace(doc, y, 6, pageH);
        doc.text(fd, MARGIN, y);
        y += 6;
      }
    }

    const loc = [day?.cityName, day?.provinceName, day?.countryName]
      .filter(Boolean)
      .join(", ");
    if (loc) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(doc, MUTED);
      y = ensureSpace(doc, y, 6, pageH);
      doc.text(loc, MARGIN, y);
      y += 7;
    }

    if (day?.description?.trim()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setText(doc, MUTED);
      doc.splitTextToSize(day.description.trim(), textW).forEach((ln: string) => {
        y = ensureSpace(doc, y, 6, pageH);
        doc.text(ln, MARGIN, y);
        y += 5;
      });
      y += 4;
    }
    
    const activities = (day?.activities || []).filter(activityVisible);
    if (activities.length) {
      y = ensureSpace(doc, y, 10, pageH);
      doc.setFont("helvetica", "bold");
      setText(doc, INK);
      doc.setFontSize(10);
      doc.text("Schedule", MARGIN, y);
      y += 7;

      activities.forEach((activity: any) => {
        const time =
          activity?.time && typeof activity.time === "string"
            ? activity.time.substring(0, 5)
            : "";
        const title = (activity.title || "Activity").trim() || "Activity";
        const actLine = time ? `- ${time}  ${title}` : `- ${title}`;
        const link = normalizeExternalUrl(activity.link);
        y = drawWrappedTitleWithOptionalLink(
          doc,
          MARGIN + 3,
          y,
          textW - 3,
          pageH,
          actLine,
          "helvetica",
          "bold",
          10,
          5,
          link
        );
        y += 2;
        const actDetails = String(
          activity?.details ?? activity?.description ?? ""
        ).trim();
        if (actDetails) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          setText(doc, MUTED);
          doc.splitTextToSize(actDetails, textW - 6).forEach((ln: string) => {
            y = ensureSpace(doc, y, 5, pageH);
            doc.text(ln, MARGIN + 6, y);
            y += 4;
          });
          y += 1;
        }
      });
    }

    const acc = day?.accommodation;
    const accName = acc?.name?.trim();
    if (accName) {
      const ACC_PREFIX = "Accommodation: ";
      const accLink = normalizeExternalUrl(acc?.link);
      const iconReserve = accLink ? LINK_ICON_RESERVE : 0;
      y = ensureSpace(doc, y, 6, pageH);
      const titleX = MARGIN;
      const accRight = MARGIN + textW;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(doc, MUTED);
      doc.text(ACC_PREFIX, titleX, y);
      let cx = titleX + doc.getTextWidth(ACC_PREFIX);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setText(doc, INK);

      const nameMaxW = Math.max(8, accRight - cx - iconReserve - 0.5);
      let displayName = accName;
      while (displayName.length > 1 && doc.getTextWidth(displayName) > nameMaxW) {
        displayName = `${displayName.slice(0, -2)}…`;
      }
      doc.text(displayName, cx, y);
      let afterName = cx + doc.getTextWidth(displayName);
      if (accLink) {
        afterName += addExternalLinkIcon(doc, afterName, y, accLink);
      }
      y += 6;
    }
  });
  return dayEntries;
}

function drawListSection(
  doc: jsPDF,
  pageW: number,
  pageH: number,
  heading: string,
  drawRows: (y: number) => number
) {
  setFill(doc, CREAM);
  doc.rect(0, 0, pageW, pageH, "F");
  let y = drawSectionHeading(doc, heading, pageW, MARGIN + 8);
  y = drawRows(y);
  return y;
}

function drawAccommodationsSection(
  doc: jsPDF,
  rows: { dayLabel: string; acc: any }[],
  pageW: number,
  pageH: number
) {
  drawListSection(doc, pageW, pageH, "Accommodations", (startY) => {
    let y = startY;
    rows.forEach(({ dayLabel, acc }) => {
      y = ensureSpace(doc, y, 28, pageH);
      setFill(doc, BEIGE);
      doc.roundedRect(MARGIN, y - 5, pageW - MARGIN * 2, 22, 2, 2, "F");
      const titleY = y + 2;
      const titleX = MARGIN + 4;
      const maxTitleW = pageW - MARGIN * 2 - 8;
      const accName = (acc.name || "").trim();
      const accType = (acc.type || "").trim();
      const suffix = accType ? ` - ${accType.toLowerCase()}` : "";

      let suffixW = 0;
      if (suffix) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        suffixW = doc.getTextWidth(suffix);
      }
      const accLink = normalizeExternalUrl(acc.link);
      const iconReserve = accLink ? LINK_ICON_RESERVE : 0;
      const nameMaxW = Math.max(10, maxTitleW - suffixW - iconReserve);
      let displayName = accName;
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      while (
        displayName.length > 1 &&
        doc.getTextWidth(displayName) > nameMaxW
      ) {
        displayName = `${displayName.slice(0, -2)}…`;
      }

      doc.setFont("times", "bold");
      doc.setFontSize(11);
      setText(doc, INK);
      doc.text(displayName, titleX, titleY);
      // Measure name width in Times (before icon or suffix; icon uses a different font)
      let afterNameX = titleX + doc.getTextWidth(displayName);
      if (accLink) {
        afterNameX += addExternalLinkIcon(doc, afterNameX, titleY, accLink);
      }

      if (suffix) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setText(doc, MUTED);
        doc.text(suffix, afterNameX + 0.4, titleY);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setText(doc, MUTED);
      doc.text(dayLabel, MARGIN + 4, y + 8);
      let ty = y + 13;
      if (acc.location?.trim()) {
        doc.splitTextToSize(acc.location.trim(), pageW - MARGIN * 2 - 8).forEach((ln: string) => {
          doc.text(ln, MARGIN + 4, ty);
          ty += 4;
        });
      }
      y += 26;
    });
    return y;
  });
}

function drawRestaurantsSection(
  doc: jsPDF,
  rows: { dayLabel: string; activity: any }[],
  pageW: number,
  pageH: number
) {
  drawListSection(doc, pageW, pageH, "Places to eat", (startY) => {
    let y = startY;
    rows.forEach(({ dayLabel, activity }) => {
      y = ensureSpace(doc, y, 28, pageH);
      setFill(doc, BEIGE);
      doc.roundedRect(MARGIN, y - 5, pageW - MARGIN * 2, 22, 2, 2, "F");
      const eatLink = normalizeExternalUrl(activity.link);
      const titleX = MARGIN + 4;
      const titleBaseline = y + 2;
      const titleMaxW = pageW - MARGIN * 2 - 8;
      const titleText = (activity.title || "").trim();
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      if (eatLink) {
        const tw = Math.max(8, titleMaxW - LINK_ICON_RESERVE);
        const lines = doc.splitTextToSize(titleText, tw);
        const line =
          lines.length > 1 ? `${String(lines[0]).trim()}…` : String(lines[0] || "").trim();
        setText(doc, INK);
        doc.text(line, titleX, titleBaseline);
        addExternalLinkIcon(doc, titleX + doc.getTextWidth(line), titleBaseline, eatLink);
      } else {
        setText(doc, INK);
        const lines = doc.splitTextToSize(titleText, titleMaxW);
        const line =
          lines.length > 1 ? `${String(lines[0]).trim()}…` : String(lines[0] || "").trim();
        doc.text(line, titleX, titleBaseline);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setText(doc, MUTED);
      doc.text(dayLabel, MARGIN + 4, y + 8);
      let ty = y + 13;
      if (activity.description?.trim()) {
        const descLines = doc.splitTextToSize(
          activity.description.trim(),
          pageW - MARGIN * 2 - 8
        );
        const descLine =
          descLines.length > 1 ? `${String(descLines[0]).trim()}…` : String(descLines[0] || "").trim();
        if (descLine) {
          doc.text(descLine, MARGIN + 4, ty);
          ty += 4;
        }
      }
      if (activity.location?.trim()) {
        doc.setFont("italic");
        const locLines = doc.splitTextToSize(
          activity.location.trim(),
          pageW - MARGIN * 2 - 8
        );
        const locLine =
          locLines.length > 1 ? `${String(locLines[0]).trim()}…` : String(locLines[0] || "").trim();
        if (locLine) doc.text(locLine, MARGIN + 4, ty);
        doc.setFont("normal");
      }
      y += 26;
    });
    return y;
  });
}

function drawNotesSection(doc: jsPDF, notes: any[], pageW: number, pageH: number) {
  drawListSection(doc, pageW, pageH, "Notes from the creator", (startY) => {
    let y = startY;
    notes.forEach((note) => {
      const t = note?.title?.trim();
      const c = note?.content?.trim();
      if (!t && !c) return;
      y = ensureSpace(doc, y, 16, pageH);
      if (t) {
        doc.setFont("times", "bold");
        setText(doc, INK);
        doc.setFontSize(11);
        doc.splitTextToSize(t, pageW - MARGIN * 2).forEach((ln: string) => {
          y = ensureSpace(doc, y, 6, pageH);
          doc.text(ln, MARGIN, y);
          y += 5;
        });
      }
      if (c) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setText(doc, MUTED);
        doc.splitTextToSize(c, pageW - MARGIN * 2).forEach((ln: string) => {
          y = ensureSpace(doc, y, 5, pageH);
          doc.text(ln, MARGIN, y);
          y += 4;
        });
      }
      y += 6;
    });
    return y;
  });
}

/**
 * Magazine-style itinerary PDF: cover, TOC, overview, a continuous day-by-day
 * section (flows across pages), optional stays / dining / notes sections.
 * Shared by export and purchase emails.
 */
export async function buildItineraryJsPdfFromData(itinerary: any): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const dateRange = formatTripDateRange(itinerary?.days);
  const footerLine = `${(itinerary?.title || "Itinerary").trim()}${dateRange ? `  ·  ${dateRange}` : ""}`;

  const images = await preloadItineraryImages(itinerary);
  const mainImg = images.get("main");
  const days = itinerary?.days || [];
  const accRows = collectAccommodationRows(days);
  const diningRows = collectDiningRows(days);
  const notes = itinerary?.notes || [];
  const showAccPage = accRows.length > 0;
  const showDiningPage = diningRows.length > 0;
  const showNotesPage = hasMeaningfulNotes(notes);

  const tocEntries: TocEntry[] = [];

  drawCoverPage(doc, itinerary, pageW, pageH, mainImg, dateRange);
  doc.addPage();
  setFill(doc, CREAM);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.addPage();

  const recordToc = (label: string) => {
    tocEntries.push({
      label,
      page: doc.getCurrentPageInfo().pageNumber,
    });
  };

  recordToc("Trip highlights & overview");
  drawHighlightsPage(doc, itinerary, pageW, pageH);

  if (days.length > 0) {
    doc.addPage();
    const dayTocEntries = drawCombinedDaysSection(doc, days, pageW, pageH);
    tocEntries.push(...dayTocEntries);
  }

  if (showAccPage) {
    doc.addPage();
    recordToc("Accommodations");
    drawAccommodationsSection(doc, accRows, pageW, pageH);
  }

  if (showDiningPage) {
    doc.addPage();
    recordToc("Places to eat");
    drawRestaurantsSection(doc, diningRows, pageW, pageH);
  }

  if (showNotesPage) {
    doc.addPage();
    recordToc("Notes");
    drawNotesSection(doc, notes, pageW, pageH);
  }

  drawTocPage(doc, pageW, pageH, tocEntries);

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    if (i === 1) continue;
    drawFooterBar(doc, pageW, pageH, footerLine, i, total);
  }

  return doc;
}

/** PDF bytes for email attachments (same layout as Export). */
export async function itineraryDataToPdfBuffer(itinerary: any): Promise<Buffer> {
  const doc = await buildItineraryJsPdfFromData(itinerary);
  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}
