import { expect, test, type Page } from "@playwright/test";

/**
 * Review is three jobs, one at a time.
 *
 * Stacked, the rules, the check-in and the downloads made Review 2.4 screens
 * on a phone. As tabs, each fits within a screen and a half -- measured here
 * with a holding in the portfolio, so the limits line is on the page too.
 */

async function addToPortfolio(page: Page, symbol: string) {
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
}

test("Review's three tabs move by keyboard and each keeps its own work", async ({ page }) => {
  await page.goto("/studio/review");
  const tabs = page.getByRole("tablist", { name: "Review" });
  await expect(tabs.getByRole("tab", { selected: true })).toHaveText("Your rules");
  await expect(page.getByLabel("What I do with new money")).toBeVisible();

  await tabs.getByRole("tab", { name: "Your rules" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "When you check" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "review-tab-check");
  await expect(page.getByLabel("How often you will check")).toBeVisible();
  await expect(page.getByLabel("New money to put in now")).toBeVisible();
  await expect(page.getByLabel("What I do with new money")).toHaveCount(0);

  await page.keyboard.press("End");
  await expect(tabs.getByRole("tab", { selected: true })).toHaveText("Keep a copy");
  await expect(page.getByRole("button", { name: "Download the readable plan" })).toBeVisible();
});

test("each Review tab fits a screen and a half on a phone and a desktop", async ({ page }) => {
  await page.goto("/studio/research");
  await addToPortfolio(page, "VTI");
  await page.goto("/studio/portfolio");
  await page.getByLabel("VTI target percentage").fill("100");
  await expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
  const report: string[] = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/studio/review");
    for (const name of ["Your rules", "When you check", "Keep a copy"]) {
      await page.getByRole("tab", { name }).click();
      const size = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      report.push(`${width} ${name}: ${size.screens.toFixed(2)}`);
      expect.soft(size.screens, `${name} at ${width}`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `${name} at ${width}`).toBe(0);
    }
  }
  console.log(report.join("\n"));
});
