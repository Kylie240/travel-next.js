import "server-only";
import sharp from "sharp";

export type OptimizeImageOptions = {
  /** Longest edge in pixels. Default 1920 for itinerary photos. */
  maxDimension?: number;
  /** WebP quality 1–100. Default 80. */
  quality?: number;
};

export type OptimizedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
  width: number;
  height: number;
  originalBytes: number;
  optimizedBytes: number;
};

/**
 * Convert any supported raster image to WebP, resize oversized edges,
 * and strip metadata (EXIF/GPS). Tuned for speed (effort 2, single pass).
 */
export async function optimizeImageBuffer(
  input: Buffer,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImage> {
  const maxDimension = options.maxDimension ?? 1920;
  const quality = options.quality ?? 80;

  // Single pipeline: no separate metadata() round-trip
  const { data, info } = await sharp(input, {
    failOn: "none",
    sequentialRead: true,
    limitInputPixels: 40_000_000,
  })
    .rotate() // apply EXIF orientation, then metadata is dropped on output
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 2, // 0–6; 2 is much faster than 4 with little quality loss
      smartSubsample: true,
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: "image/webp",
    extension: "webp",
    width: info.width,
    height: info.height,
    originalBytes: input.byteLength,
    optimizedBytes: data.byteLength,
  };
}
