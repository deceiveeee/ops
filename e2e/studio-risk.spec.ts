import { expect, test, type Page } from "@playwright/test";

/**
 * Risk and cost: the loss scenario, the funds' yearly costs and the overlap,
 * one at a time.
 *
 * Stacked, the three made the page 2.3 screens on a phone. The dollar figures
 * here are worked by hand from the practice portfolio's own numbers, not read
 * back from Studio: $10,000, nothing set aside, and a loss you could live with
 * of 20%, so a loss budget of $2,000.
 */

async function addToPortfolio(page: Page, symbol: string) {
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
}

async function hold(page: Page, weights: [string, string][]) {
  await page.goto("/studio/research");
  for (const [symbol] of weights) await addToPortfolio(page, symbol);
  await page.goto("/studio/portfolio");
  for (const [symbol, pct] of weights) await page.getByLabel(`${symbol} target percentage`).fill(pct);
  await expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
}

test("Risk's three tabs move by keyboard, with the scenario first", async ({ page }) => {
  await page.goto("/studio/portfolio/risk");
  const tabs = page.getByRole("tablist", { name: "Risk and cost" });
  await expect(tabs.getByRole("tab", { selected: true })).toHaveText("Loss scenario");
  await expect(page.getByLabel("US stocks", { exact: true })).toBeVisible();

  await tabs.getByRole("tab", { name: "Loss scenario" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "Fund costs" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "risk-tab-costs");
  await expect(page.getByText("What the funds you hold charge each year.")).toBeVisible();
  await expect(page.getByLabel("US stocks", { exact: true })).toHaveCount(0);

  await page.keyboard.press("End");
  await expect(tabs.getByRole("tab", { selected: true })).toHaveText("Overlap");
  await expect(page.getByText("The same company or government, held through more than one of your investments.")).toBeVisible();
});

test("the scenario sits beside the loss budget, and a gain is never called a loss", async ({ page }) => {
  await hold(page, [["VTI", "100"]]);
  await page.goto("/studio/portfolio/risk");
  const over = page.getByText(/than your loss budget/);

  // $10,000 of US stocks falling 30% loses $3,000: $1,000 past the $2,000 budget.
  await page.getByLabel("US stocks", { exact: true }).fill("-30");
  await expect(page.getByText("-$3,000.00", { exact: true })).toBeVisible();
  await expect(over).toBeVisible();

  // The same move upwards gains $3,000. Nothing is lost, so nothing is over.
  await page.getByLabel("US stocks", { exact: true }).fill("30");
  await expect(page.getByText("$3,000.00", { exact: true })).toBeVisible();
  await expect(over).toHaveCount(0);

  // A 15% fall loses $1,500, inside the budget.
  await page.getByLabel("US stocks", { exact: true }).fill("-15");
  await expect(page.getByText("-$1,500.00", { exact: true })).toBeVisible();
  await expect(over).toHaveCount(0);
});

test("every Risk tab fits a screen and a half at every width", async ({ page }) => {
  test.setTimeout(120_000);
  // Funds, a bond fund and the Treasury note: a fund cost and an overlap to show,
  // and the default scenario takes this portfolio past its loss budget, so the
  // warning is on the page too.
  await hold(page, [["VTI", "40"], ["VXUS", "20"], ["AGG", "20"], ["91282CRF0", "10"]]);
  const report: string[] = [];
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/studio/portfolio/risk");
    await expect(page.getByText(/than your loss budget/)).toBeVisible();
    for (const name of ["Loss scenario", "Fund costs", "Overlap"]) {
      await page.getByRole("tab", { name }).click();
      const size = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      report.push(`${width} ${name}: ${size.screens.toFixed(2)}`);
      expect.soft(size.screens, `${name} at ${width}`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `${name} at ${width}`).toBe(0);
    }
  }
  console.log(report.join("\n"));
});
