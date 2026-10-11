import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export const UPLOAD_FOLDERS = ["knives", "profiles"] as const
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

/** Persists an image file locally. Swap this module for S3/R2/B2 later — DB stores URLs only. */
export async function persistImageFile(
  file: File,
  folder: UploadFolder = "knives"
): Promise<{ url: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Type de fichier non pris en charge")
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Fichier trop volumineux (max 5 Mo)")
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder)
  await mkdir(uploadDir, { recursive: true })

  const ext = extensionForMime(file.type)
  const filename = `${randomUUID()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(path.join(uploadDir, filename), buffer)

  return { url: `/uploads/${folder}/${filename}` }
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
