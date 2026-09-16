import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "knives")
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

/** Persists an image file locally. Swap this module for S3/R2/B2 later — DB stores URLs only. */
export async function persistImageFile(file: File): Promise<{ url: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Type de fichier non pris en charge")
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Fichier trop volumineux (max 5 Mo)")
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const ext = extensionForMime(file.type)
  const filename = `${randomUUID()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(path.join(UPLOAD_DIR, filename), buffer)

  return { url: `/uploads/knives/${filename}` }
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
    case "image/gif":
      return ".gif"
    default:
      return ".bin"
  }
}
