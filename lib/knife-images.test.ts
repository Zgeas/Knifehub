import { describe, expect, it } from "vitest"
import { MAX_KNIFE_IMAGES, normalizeCoverImages, parseImagesPayload } from "./knife-images"

describe("TEST-F014 images couteau", () => {
  it("TEST-F014-03 JSON invalide → []", () => {
    expect(parseImagesPayload("not-json")).toEqual([])
    expect(parseImagesPayload(null)).toEqual([])
  })

  it("TEST-F014-01 parse un payload valide", () => {
    const raw = JSON.stringify([
      { url: "https://ex.com/a.jpg", isCover: true, displayOrder: 0, angle: "LEFT" },
      { url: "https://ex.com/b.jpg", isCover: false, displayOrder: 1 },
    ])
    const parsed = parseImagesPayload(raw)
    expect(parsed).toHaveLength(2)
    expect(parsed[0]?.angle).toBe("LEFT")
  })

  it("TEST-F014-02 limite à 5 et une seule couverture", () => {
    const raw = JSON.stringify(
      Array.from({ length: 7 }, (_, i) => ({
        url: `https://ex.com/${i}.jpg`,
        isCover: true,
        displayOrder: 7 - i,
      }))
    )
    const parsed = parseImagesPayload(raw)
    expect(parsed).toHaveLength(MAX_KNIFE_IMAGES)
    const normalized = normalizeCoverImages(parsed)
    expect(normalized.filter((img) => img.isCover)).toHaveLength(1)
    expect(normalized.map((img) => img.displayOrder)).toEqual([0, 1, 2, 3, 4])
  })
})
