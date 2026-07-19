import { optimizeImageInBrowser } from "@/lib/utils/prepare-image-upload"

export type OptimizePurpose = "itinerary" | "avatar"

function purposeOptions(purpose: OptimizePurpose) {
  if (purpose === "avatar") {
    return { maxDimension: 800, quality: 0.8 }
  }
  // 1600px is sharp on most screens and encodes quickly in-browser
  return { maxDimension: 1600, quality: 0.8 }
}

/**
 * Optimize locally (resize + WebP/JPEG, strip EXIF). No server round-trip.
 * Sharp `/api/optimize-image` remains available for other uses but is not
 * on the upload hot path (it was causing timeouts on large photos).
 */
export async function optimizeImageOnServer(
  file: File,
  purpose: OptimizePurpose = "itinerary"
): Promise<File> {
  return optimizeImageInBrowser(file, purposeOptions(purpose))
}
