const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
}

const UPLOADABLE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
])

const UPLOADABLE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"])

function getExtension(fileName: string): string | null {
  const parts = fileName.split(".")
  if (parts.length < 2) return null
  return parts.pop()?.toLowerCase() ?? null
}

function needsNormalization(file: File, ext: string | null): boolean {
  if (!ext || !UPLOADABLE_EXTENSIONS.has(ext)) return true
  if (!file.type) return true
  if (file.type === "image/heic" || file.type === "image/heif") return true
  if (!UPLOADABLE_TYPES.has(file.type)) return true
  return false
}

function convertImageToJpeg(file: File, maxDimension = 4096): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    const cleanup = () => URL.revokeObjectURL(url)

    img.onload = () => {
      let { width, height } = img

      if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        cleanup()
        reject(new Error("Could not process image"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          cleanup()
          if (!blob) {
            reject(new Error("Could not convert image"))
            return
          }
          resolve(
            new File([blob], `upload-${Date.now()}.jpg`, { type: "image/jpeg" })
          )
        },
        "image/jpeg",
        0.92
      )
    }

    img.onerror = () => {
      cleanup()
      reject(
        new Error(
          "Could not read this image. Try saving it as JPG or PNG and upload again."
        )
      )
    }

    img.src = url
  })
}

export async function prepareImageForUpload(file: File): Promise<File> {
  const ext = getExtension(file.name)
  const mimeFromExt = ext ? EXT_TO_MIME[ext] : null
  const resolvedMime = file.type || mimeFromExt || ""

  if (!needsNormalization(file, ext)) {
    const uploadExt = ext === "jpeg" ? "jpg" : ext!
    const normalizedName =
      ext && file.name.includes(".")
        ? file.name
        : `upload-${Date.now()}.${uploadExt}`

    if (file.type) return file

    return new File([file], normalizedName, { type: resolvedMime })
  }

  return convertImageToJpeg(file)
}

export function getUploadExtension(file: File): string {
  const ext = getExtension(file.name)
  if (ext === "jpeg") return "jpg"
  if (ext && UPLOADABLE_EXTENSIONS.has(ext)) return ext
  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"
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
