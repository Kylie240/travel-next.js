import { NextRequest, NextResponse } from "next/server";
import { optimizeImageBuffer } from "@/lib/utils/optimize-image";
import createClient from "@/utils/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_INPUT_BYTES = 12 * 1024 * 1024; // slightly above UI 10MB for headers overhead
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/octet-stream", // some browsers omit type
]);

type Purpose = "itinerary" | "avatar";

function optionsForPurpose(purpose: Purpose) {
  if (purpose === "avatar") {
    return { maxDimension: 800, quality: 82 };
  }
  return { maxDimension: 1920, quality: 80 };
}

/**
 * POST multipart/form-data:
 *  - file: image blob
 *  - purpose?: "itinerary" | "avatar" (default itinerary)
 *
 * Returns optimized image/webp bytes.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const purposeRaw = String(form.get("purpose") || "itinerary");
    const purpose: Purpose =
      purposeRaw === "avatar" ? "avatar" : "itinerary";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file" },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    if (file.size > MAX_INPUT_BYTES) {
      return NextResponse.json(
        { error: "File is too large (max 10MB)" },
        { status: 400 }
      );
    }

    const type = (file.type || "").toLowerCase();
    if (type && !ALLOWED_TYPES.has(type) && !type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    const input = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImageBuffer(
      input,
      optionsForPurpose(purpose)
    );

    return new NextResponse(new Uint8Array(optimized.buffer), {
      status: 200,
      headers: {
        "Content-Type": optimized.contentType,
        "Cache-Control": "no-store",
        "X-Image-Width": String(optimized.width),
        "X-Image-Height": String(optimized.height),
        "X-Original-Bytes": String(optimized.originalBytes),
        "X-Optimized-Bytes": String(optimized.optimizedBytes),
      },
    });
  } catch (e) {
    console.error("optimize-image:", e);
    const message =
      e instanceof Error ? e.message : "Image optimization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
