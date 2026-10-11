import { describe, expect, it } from "vitest"
import { buildKnifeMaterialSpecs, parseKnifeMaterials } from "./knife-materials"

describe("matériaux couteau", () => {
  it("parse les champs vides en null", () => {
    const form = new FormData()
    form.set("bladeSteel", "  VG-10  ")
    const parsed = parseKnifeMaterials(form)
    expect(parsed.bladeSteel).toBe("VG-10")
    expect(parsed.handleMaterial).toBeNull()
  })

  it("n'affiche que les specs renseignées", () => {
    const specs = buildKnifeMaterialSpecs({
      bladeSteel: "AEB-L",
      handleMaterial: null,
      mitre: null,
      mitreArriere: null,
      platines: null,
      ressort: null,
      faussePiece: null,
      inserts: null,
      intercalaires: null,
    })
    expect(specs).toEqual([{ label: "Acier de lame", value: "AEB-L" }])
  })
})
