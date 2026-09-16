import { Prisma } from "@prisma/client"
import {
  KnifeImagePayload,
  normalizeCoverImages,
  parseImagesPayload,
} from "@/lib/knife-images"

export async function syncKnifeImages(
  tx: Prisma.TransactionClient,
  knifeId: string,
  rawPayload: FormDataEntryValue | null
) {
  const drafts = normalizeCoverImages(parseImagesPayload(rawPayload))

  await tx.knifeImage.deleteMany({ where: { knifeId } })

  if (drafts.length === 0) return

  await tx.knifeImage.createMany({
    data: drafts.map((img) => ({
      knifeId,
      url: img.url,
      alt: img.alt ?? null,
      angle: img.angle ?? null,
      focus: img.focus ?? null,
      isCover: img.isCover,
      displayOrder: img.displayOrder,
    })),
  })
}

export function parseKnifePrice(formData: FormData): number | null {
  const priceInput = formData.get("price")?.toString().trim()
  if (!priceInput) return null

  const parsed = parseFloat(priceInput)
  if (Number.isNaN(parsed) || parsed < 0) return null

  return Math.round(parsed * 100)
}
