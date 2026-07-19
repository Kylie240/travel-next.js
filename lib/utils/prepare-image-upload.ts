const UPLOADABLE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
])

const UPLOADABLE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"])

let cachedWebpSupport: boolean | null = null

function getExtension(fileName: string): string | null {
  const parts = fileName.split(".")
  if (parts.length < 2) return null
  return parts.pop()?.toLowerCase() ?? null
}

/** Sync WebP encode check — avoids hanging toBlob probes. */
export function browserSupportsWebpEncode(): boolean {
  if (cachedWebpSupport !== null) return cachedWebpSupport
  if (typeof document === "undefined") {
    cachedWebpSupport = false
    return false
  }
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    cachedWebpSupport = canvas
      .toDataURL("image/webp")
      .startsWith("data:image/webp")
  } catch {
    cachedWebpSupport = false
  }
  return cachedWebpSupport
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    // Some browsers never call back — don't hang forever
    const timer = window.setTimeout(() => resolve(null), 20_000)
    canvas.toBlob(
      (blob) => {
        window.clearTimeout(timer)
        resolve(blob)
      },
      type,
      quality
    )
  })
}

/**
 * Fast local optimize: resize + WebP (or JPEG), strips EXIF/GPS via canvas redraw.
 * No server round-trip — avoids the optimize API timeout on large photos.
 */
export async function optimizeImageInBrowser(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const maxDimension = options.maxDimension ?? 1600
  const quality = options.quality ?? 0.8
  const preferWebp = browserSupportsWebpEncode()

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = "async"
    img.src = objectUrl

    await Promise.race([
      img.decode(),
      new Promise<never>((_, reject) =>
        window.setTimeout(
          () =>
            reject(
              new Error(
                "This photo took too long to process. Try a smaller image."
              )
            ),
          25_000
        )
      ),
    ])

    let width = img.naturalWidth || img.width
    let height = img.naturalHeight || img.height
    if (!width || !height) {
      throw new Error("Could not read image dimensions")
    }

    if (width > maxDimension || height > maxDimension) {
      const scale = Math.min(maxDimension / width, maxDimension / height)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
    }

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) throw new Error("Could not process image")

    ctx.drawImage(img, 0, 0, width, height)

    if (preferWebp) {
      const webp = await canvasToBlob(canvas, "image/webp", quality)
      if (webp && webp.size > 0) {
        return new File([webp], `upload-${Date.now()}.webp`, {
          type: "image/webp",
        })
      }
    }

    const jpeg = await canvasToBlob(canvas, "image/jpeg", quality)
    if (!jpeg || jpeg.size === 0) {
      throw new Error("Could not compress image")
    }
    return new File([jpeg], `upload-${Date.now()}.jpg`, {
      type: "image/jpeg",
    })
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "Could not read this image. Try JPG or PNG."
    throw new Error(message)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function getUploadExtension(file: File): string {
  if (file.type === "image/webp") return "webp"
  if (file.type === "image/png") return "png"
  const ext = getExtension(file.name)
  if (ext === "jpeg") return "jpg"
  if (ext && UPLOADABLE_EXTENSIONS.has(ext)) return ext
  return "jpg"
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

/** @deprecated kept for any remaining imports */
export async function prepareImageForUpload(file: File): Promise<File> {
  return optimizeImageInBrowser(file)
}

export { UPLOADABLE_TYPES }
