import { describe, expect, it } from "vitest"
import { formatKnifeStatus, formatPrice } from "./format"

describe("TEST-F009 formatage", () => {
  it("formate le prix EUR", () => {
    expect(formatPrice(null)).toBeNull()
    expect(formatPrice(25000)).toMatch(/250/)
  })

  it("formate le statut", () => {
    expect(formatKnifeStatus("AVAILABLE")).toBe("Disponible")
    expect(formatKnifeStatus("SOLD")).toBe("Vendu")
  })
})
