import { expect, type Page } from "@playwright/test"

export async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(
    metrics.scrollWidth,
    `débordement horizontal ${metrics.scrollWidth}px > ${metrics.clientWidth}px`
  ).toBeLessThanOrEqual(metrics.clientWidth + 1)
}
