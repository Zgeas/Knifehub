import { ImageAngle, ImageFocus, KnifeImage } from "@prisma/client"

export const MAX_KNIFE_IMAGES = 5

export const IMAGE_ANGLES = [
  "LEFT",
  "RIGHT",
  "TOP",
  "BOTTOM",
  "FRONT",
  "BACK",
  "UNKNOWN",
] as const satisfies readonly ImageAngle[]

export const IMAGE_FOCUSES = [
  "FULL",
  "BLADE",
  "HANDLE",
  "DETAIL",
  "OTHER",
] as const satisfies readonly ImageFocus[]

export const imageAngleLabels: Record<ImageAngle, string> = {
  LEFT: "Gauche",
  RIGHT: "Droite",
  TOP: "Dessus",
  BOTTOM: "Dessous",
  FRONT: "Face",
  BACK: "Dos",
  UNKNOWN: "Inconnu",
}

export const imageFocusLabels: Record<ImageFocus, string> = {
  FULL: "Vue complète",
  BLADE: "Lame",
  HANDLE: "Manche",
  DETAIL: "Détail",
  OTHER: "Autre",
}

export type KnifeImageDraft = {
  clientId: string
  url: string
  alt?: string
  angle?: ImageAngle | ""
  focus?: ImageFocus | ""
  isCover: boolean
  displayOrder: number
}

export type KnifeImagePayload = {
  url: string
  alt?: string
  angle?: ImageAngle
  focus?: ImageFocus
  isCover: boolean
  displayOrder: number
}

export function createEmptyImageDraft(order: number, isCover = false): KnifeImageDraft {
  return {
    clientId: crypto.randomUUID(),
    url: "",
    alt: "",
    angle: "",
    focus: "",
    isCover,
    displayOrder: order,
  }
}

export function knifeImageToDraft(image: KnifeImage): KnifeImageDraft {
  return {
    clientId: image.id,
    url: image.url,
    alt: image.alt ?? "",
    angle: image.angle ?? "",
    focus: image.focus ?? "",
    isCover: image.isCover,
    displayOrder: image.displayOrder,
  }
}

export function parseImagesPayload(raw: FormDataEntryValue | null): KnifeImagePayload[] {
  if (!raw || typeof raw !== "string" || !raw.trim()) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) return []

  const drafts: KnifeImagePayload[] = []

  for (const item of parsed) {
    if (!item || typeof item !== "object") continue
    const record = item as Record<string, unknown>
    const url = record.url?.toString().trim()
    if (!url) continue

    const angle = record.angle?.toString()
    const focus = record.focus?.toString()

    drafts.push({
      url,
      alt: record.alt?.toString().trim() || undefined,
      angle: IMAGE_ANGLES.includes(angle as ImageAngle) ? (angle as ImageAngle) : undefined,
      focus: IMAGE_FOCUSES.includes(focus as ImageFocus) ? (focus as ImageFocus) : undefined,
      isCover: Boolean(record.isCover),
      displayOrder: Number(record.displayOrder) || drafts.length,
    })
  }

  return drafts.slice(0, MAX_KNIFE_IMAGES)
}

/** Ensures displayOrder is sequential and exactly one cover (defaults to first). */
export function normalizeCoverImages(images: KnifeImagePayload[]): KnifeImagePayload[] {
  if (images.length === 0) return []

  const ordered = [...images]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((img, index) => ({ ...img, displayOrder: index }))

  const coverIndex = ordered.findIndex((img) => img.isCover)
  const resolvedCover = coverIndex >= 0 ? coverIndex : 0

  return ordered.map((img, index) => ({
    ...img,
    isCover: index === resolvedCover,
  }))
}

export function getCoverImage(images: Pick<KnifeImage, "isCover" | "displayOrder" | "url" | "alt">[]): Pick<
  KnifeImage,
  "url" | "alt" | "isCover" | "displayOrder"
> | null {
  if (images.length === 0) return null

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder)
  return sorted.find((img) => img.isCover) ?? sorted[0] ?? null
}

export function splitGalleryImages<T extends Pick<KnifeImage, "id" | "isCover" | "displayOrder">>(
  images: T[]
): { cover: T | null; gallery: T[] } {
  if (images.length === 0) return { cover: null, gallery: [] }

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder)
  const cover = sorted.find((img) => img.isCover) ?? sorted[0]
  const gallery = sorted.filter((img) => img.id !== cover.id)

  return { cover, gallery }
}

export const knifeImagesInclude = {
  images: { orderBy: { displayOrder: "asc" as const } },
} as const

/** Feed card gallery — sorted, max 5. */
export function sortFeedGalleryImages(images: KnifeImage[]): KnifeImage[] {
  return [...images].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, MAX_KNIFE_IMAGES)
}

export function getDefaultFeedGalleryIndex(images: KnifeImage[]): number {
  if (images.length === 0) return 0
  const coverIdx = images.findIndex((img) => img.isCover)
  return coverIdx >= 0 ? coverIdx : 0
}
