import { describe, expect, it } from "vitest"
import { collectFeedFilterOptions, filterKnives, parseFeedFilters } from "./feed-filters"
import type { FeedFilterKnife } from "./feed-filters"

function knife(partial: Partial<FeedFilterKnife> & Pick<FeedFilterKnife, "id" | "name" | "artisanProfileId">): FeedFilterKnife {
  return {
    description: null,
    style: null,
    bladeSteel: null,
    handleMaterial: null,
    mitre: null,
    mitreArriere: null,
    platines: null,
    ressort: null,
    faussePiece: null,
    inserts: null,
    intercalaires: null,
    price: null,
    status: "AVAILABLE",
    createdAt: new Date(),
    updatedAt: new Date(),
    artisanProfile: { id: partial.artisanProfileId, displayName: "Maker" },
    ...partial,
  }
}

const emptyMaterials = {
  bladeSteel: [] as string[],
  handleMaterial: [] as string[],
  mitre: [] as string[],
  mitreArriere: [] as string[],
  platines: [] as string[],
  ressort: [] as string[],
  faussePiece: [] as string[],
  inserts: [] as string[],
  intercalaires: [] as string[],
}

describe("TEST-F006 feed filters", () => {
  const gyuto = knife({
    id: "1",
    name: "Gyuto",
    artisanProfileId: "a1",
    bladeSteel: "AEB-L",
    artisanProfile: { id: "a1", displayName: "Elena" },
  })
  const hunter = knife({
    id: "2",
    name: "Hunter",
    artisanProfileId: "a2",
    bladeSteel: "N690",
    artisanProfile: { id: "a2", displayName: "Marcus" },
  })

  it("TEST-F006-01 filtre le nom", () => {
    const result = filterKnives([gyuto, hunter], {
      query: "gyuto",
      artisanIds: [],
      materials: emptyMaterials,
    })
    expect(result.map((k) => k.id)).toEqual(["1"])
  })

  it("TEST-F006-02 filtre l'artisan", () => {
    const result = filterKnives([gyuto, hunter], {
      query: "",
      artisanIds: ["a2"],
      materials: emptyMaterials,
    })
    expect(result.map((k) => k.id)).toEqual(["2"])
  })

  it("TEST-F006-03 filtre le matériau", () => {
    const result = filterKnives([gyuto, hunter], {
      query: "",
      artisanIds: [],
      materials: { ...emptyMaterials, bladeSteel: ["AEB-L"] },
    })
    expect(result.map((k) => k.id)).toEqual(["1"])
  })

  it("TEST-F006-04 parse la querystring", () => {
    const filters = parseFeedFilters({
      q: "acier",
      artisan: ["a1", "a2"],
      bladeSteel: "AEB-L",
    })
    expect(filters.query).toBe("acier")
    expect(filters.artisanIds).toEqual(["a1", "a2"])
    expect(filters.materials.bladeSteel).toEqual(["AEB-L"])
  })

  it("collecte les options", () => {
    const { artisans, materials } = collectFeedFilterOptions([gyuto, hunter])
    expect(artisans.map((a) => a.id).sort()).toEqual(["a1", "a2"])
    expect(materials.some((g) => g.name === "bladeSteel" && g.values.includes("AEB-L"))).toBe(true)
  })
})
