import { describe, expect, it } from "vitest"
import { BOOTSTRAP_ADMIN_EMAIL, isBootstrapAdmin } from "./auth-roles"

describe("TEST-F019 / TEST-F021 bootstrap admin", () => {
  it("TEST-F021-01 reconnaît l'e-mail bootstrap public", () => {
    expect(isBootstrapAdmin(BOOTSTRAP_ADMIN_EMAIL)).toBe(true)
    expect(isBootstrapAdmin("   Admin@Example.com  ")).toBe(true)
  })

  it("TEST-F019-01 ignore un e-mail quelconque", () => {
    expect(isBootstrapAdmin("visitor@knifehub.test")).toBe(false)
    expect(isBootstrapAdmin(null)).toBe(false)
  })
})
