import { describe, expect, it } from "vitest"
import { buildProfileLinks, defaultDisplayName, toExternalHref } from "./profile"

describe("TEST-F008 liens profil", () => {
  it("préfixe https si besoin", () => {
    expect(toExternalHref("example.com")).toBe("https://example.com")
    expect(toExternalHref("https://x.com/a")).toBe("https://x.com/a")
  })

  it("construit les liens renseignés seulement", () => {
    const links = buildProfileLinks({ website: "https://forge.test", instagram: null, facebook: null, x: null })
    expect(links).toHaveLength(1)
    expect(links[0]?.label).toBe("Site web")
  })

  it("nom affiché par défaut", () => {
    expect(defaultDisplayName({ name: "Elena", email: "e@x.test" })).toBe("Elena")
    expect(defaultDisplayName({ name: null, email: "atelier@x.test" })).toBe("atelier")
    expect(defaultDisplayName({ name: null, email: null })).toBe("Artisan")
  })
})
