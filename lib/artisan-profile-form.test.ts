import { describe, expect, it } from "vitest"
import { apiErrors } from "./messages"
import { parseArtisanProfileBody, parseArtisanProfileFormData } from "./artisan-profile-form"

describe("TEST-F010 / TEST-F016 profil artisan", () => {
  it("TEST-F010-01 exige le nom affiché", () => {
    const result = parseArtisanProfileBody({ displayName: "  " })
    expect(result.data).toBeNull()
    expect(result.error).toBe(apiErrors.displayNameRequired)
  })

  it("TEST-F010-02 conserve les optionnels renseignés", () => {
    const result = parseArtisanProfileBody({
      displayName: "Atelier",
      bio: "Forge",
      location: "Lyon",
    })
    expect(result.data).toMatchObject({
      displayName: "Atelier",
      bio: "Forge",
      location: "Lyon",
    })
  })

  it("TEST-F016-01 vide les champs optionnels avec null", () => {
    const form = new FormData()
    form.set("displayName", "Atelier")
    form.set("bio", "  ")
    form.set("location", "")
    const result = parseArtisanProfileFormData(form)
    expect(result.data?.bio).toBeNull()
    expect(result.data?.location).toBeNull()
  })
})
