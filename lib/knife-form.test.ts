import { describe, expect, it } from "vitest"
import { parseKnifePrice } from "./knife-form"
import { buildKnifeFields, parseKnifeStatus } from "./knife-actions"

describe("TEST-F012 / TEST-F009 prix et statut", () => {
  it("TEST-F009-01 convertit les euros en centimes", () => {
    const form = new FormData()
    form.set("price", "250.00")
    expect(parseKnifePrice(form)).toBe(25000)
  })

  it("prix vide ou invalide → null", () => {
    expect(parseKnifePrice(new FormData())).toBeNull()
    const form = new FormData()
    form.set("price", "-1")
    expect(parseKnifePrice(form)).toBeNull()
  })

  it("TEST-F012-01 statut par défaut AVAILABLE", () => {
    expect(parseKnifeStatus(null)).toBe("AVAILABLE")
    expect(parseKnifeStatus("SOLD")).toBe("SOLD")
    expect(parseKnifeStatus("nope")).toBe("AVAILABLE")
  })

  it("buildKnifeFields assemble nom et matériaux", () => {
    const form = new FormData()
    form.set("name", "  Gyuto  ")
    form.set("bladeSteel", "AEB-L")
    form.set("status", "RESERVED")
    expect(buildKnifeFields(form)).toMatchObject({
      name: "Gyuto",
      bladeSteel: "AEB-L",
      status: "RESERVED",
      price: null,
    })
  })
})
