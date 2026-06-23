import { createClient } from "@/utils/supabase/server-admin";
import { itineraryDataToPdfBuffer } from "@/lib/utils/itinerary-pdf-document";

function safePdfFilename(title: string): string {
  const base = title
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .trim()
    .replace(/\.pdf$/i, "");
  const shortened = base.length > 90 ? base.slice(0, 90) : base;
  return `${shortened || "itinerary"}.pdf`;
}

/**
 * Loads full itinerary payload (same RPC as getItineraryById) with service role
 * and builds the PDF used by the export button, for purchase confirmation email.
 */
export async function getItineraryPdfAttachmentForEmail(
  itineraryId: string,
  displayTitle: string
): Promise<{ filename: string; buffer: Buffer } | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_itinerary", {
    p_itinerary_id: itineraryId,
  });

  if (error) {
    console.error("get_itinerary for purchase email:", error.message);
    return null;
  }
  if (!data) {
    console.error("get_itinerary for purchase email: no data", itineraryId);
    return null;
  }

  try {
    const buffer = await itineraryDataToPdfBuffer(data);
    return { filename: safePdfFilename(displayTitle), buffer };
  } catch (e) {
    console.error("PDF build for purchase email:", e);
    return null;
  }
}
