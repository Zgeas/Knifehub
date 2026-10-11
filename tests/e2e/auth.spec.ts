import { expect, test } from "@playwright/test"

test.describe("TEST-F001 / TEST-F002 / TEST-F003 auth", () => {
  test("TEST-F002-02 e-mail invalide", async ({ page }) => {
    await page.goto("/login")
    const email = page.getByLabel("E-mail")
    await email.fill("pas-un-email")
    await page.getByRole("button", { name: "Continuer" }).click()
    await expect(page).toHaveURL(/\/login/)
    const valid = await email.evaluate((el) => (el as HTMLInputElement).validity.valid)
    expect(valid).toBe(false)
  })

  test("TEST-F001-01 / TEST-F002-01 connexion crée la session USER", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("E-mail").fill("e2e-user@knifehub.test")
    await page.getByRole("button", { name: "Continuer" }).click()
    await page.waitForURL((url) => url.pathname === "/")
    await expect(page.getByRole("button", { name: "Déconnexion" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Devenir artisan" })).toBeVisible()
  })

  test("TEST-F002-03 déjà connecté quitte /login", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("E-mail").fill("e2e-again@knifehub.test")
    await page.getByRole("button", { name: "Continuer" }).click()
    await page.waitForURL((url) => url.pathname === "/")
    await page.goto("/login")
    await expect(page).not.toHaveURL(/\/login/)
  })

  test("TEST-F003-01 déconnexion", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("E-mail").fill("e2e-logout@knifehub.test")
    await page.getByRole("button", { name: "Continuer" }).click()
    await page.waitForURL((url) => url.pathname === "/")
    await page.getByRole("button", { name: "Déconnexion" }).click()
    await expect(page.getByRole("link", { name: "Connexion" })).toBeVisible()
  })
})
