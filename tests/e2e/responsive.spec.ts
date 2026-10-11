import { expect, test } from "@playwright/test"
import { assertNoHorizontalOverflow } from "./overflow"

const WIDTHS = [320, 375, 430, 768, 1280] as const

test.describe("TEST-F022 responsive", () => {
  for (const width of WIDTHS) {
    test(`fil, login et artisans à ${width}px sans débordement`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })

      await page.goto("/")
      await expect(page.getByRole("link", { name: "KnifeHub" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Fil" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Artisans" })).toBeVisible()
      await expect(page.getByRole("searchbox", { name: "Rechercher" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Connexion" })).toBeVisible()
      await expect(page.getByRole("heading", { name: "Gyuto de test" })).toBeVisible()
      await assertNoHorizontalOverflow(page)

      await page.goto("/login")
      await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible()
      await expect(page.getByLabel("E-mail")).toBeVisible()
      await assertNoHorizontalOverflow(page)

      await page.goto("/artisans")
      await expect(page.getByRole("heading", { name: "Artisans" })).toBeVisible()
      await expect(page.getByRole("link", { name: /Atelier Test/ })).toBeVisible()
      await assertNoHorizontalOverflow(page)

      await page.getByRole("link", { name: /Atelier Test/ }).click()
      await expect(page.getByRole("heading", { name: "Atelier Test" })).toBeVisible()
      await assertNoHorizontalOverflow(page)
    })
  }

  test("fiche couteau 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto("/")
    await page.getByRole("heading", { name: "Gyuto de test" }).click()
    await expect(page.getByRole("heading", { name: "Gyuto de test" })).toBeVisible()
    await assertNoHorizontalOverflow(page)
  })

  test("menu compte sur 375px après connexion", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto("/login")
    await page.getByLabel("E-mail").fill("e2e-mobile@knifehub.test")
    await page.getByRole("button", { name: "Continuer" }).click()
    await page.waitForURL((url) => url.pathname === "/")
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible()
    await page.getByRole("button", { name: "Menu" }).click()
    await expect(page.getByRole("link", { name: "Devenir artisan" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Déconnexion" })).toBeVisible()
    await assertNoHorizontalOverflow(page)
  })
})
