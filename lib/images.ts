import { KnifeImage } from "@prisma/client"
import { getCoverImage } from "@/lib/knife-images"

export function getCoverImageUrl(images: Pick<KnifeImage, "url" | "alt" | "isCover" | "displayOrder">[]): string | null {
  return getCoverImage(images)?.url ?? null
}

export function getCoverImageAlt(
  images: Pick<KnifeImage, "url" | "alt" | "isCover" | "displayOrder">[],
  fallback: string
): string {
  return getCoverImage(images)?.alt ?? fallback
}
