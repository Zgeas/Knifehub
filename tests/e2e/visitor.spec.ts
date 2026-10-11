import { expect, test } from "@playwright/test"

test.describe("parcours visiteur", () => {
  test("TEST-F018-01 / TEST-F005-01 header et fil", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: "KnifeHub" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Fil" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Gyuto de test" })).toBeVisible()
  })

  test("TEST-F019-02 / TEST-F004-01 /profile anonyme → login", async ({ page }) => {
    await page.goto("/profile")
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible()
  })

  test("TEST-F011-05 /admin anonyme → login", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/login/)
  })

  test("TEST-F008-02 artisan inconnu → 404", async ({ page }) => {
    const response = await page.goto("/artisan/does-not-exist-id")
    expect(response?.status()).toBe(404)
  })

  test("TEST-F009-02 couteau inconnu → 404", async ({ page }) => {
    const response = await page.goto("/knives/does-not-exist-id")
    expect(response?.status()).toBe(404)
  })
})
