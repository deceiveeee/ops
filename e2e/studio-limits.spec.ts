import { expect, test, type Page } from "@playwright/test";

/**
 * A portfolio checked against the learner's own limits, on Portfolio.
 *
 * Worked by hand. A new practice portfolio holds $10,000 with nothing set
 * aside, so each weight is also its share of the whole. VTI 60% and AAPL 10%
 * leave 30% as cash. The default scenario drops stocks 30%:
 *   loss = $6,000 x 30% + $1,000 x 30% = $1,800 + $300 = $2,100
 * The loss you could live with starts at 20%, a $2,000 loss budget.
 *   AAPL: cap 5%, 5.0 points over.
 *   VTI: 60 + (20 - 21) / 0.30 = 56.67%, 3.3 points over the loss budget.
 * With AAPL at 5%: loss $1,950, within budget; VTI can rise to 60 + 0.5 / 0.30 = 61.67%.
 */

async function addToPortfolio(page: Page, symbol: string) {
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
}

test("says beside each weight which limit holds it back, and lists every check", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/studio/goals");
  await page.getByRole("tab", { name: /Your mix/ }).click();
  await page.getByLabel("Cap for one company").fill("5");
  await expect(page.getByRole("status").filter({ hasText: "Saved in this browser" })).toBeVisible();
  await page.goto("/studio/research");
  await addToPortfolio(page, "VTI");
  await addToPortfolio(page, "AAPL");
  await page.goto("/studio/portfolio");
  await page.getByLabel("VTI target percentage").fill("60");
  await page.getByLabel("AAPL target percentage").fill("10");

  const table = page.getByRole("table", { name: "Target weight and dollar amount for each investment" });
  await expect(table).toContainText("VTI: 3.3 points over what your loss budget allows (56.7% of the whole portfolio).");
  await expect(table).toContainText("AAPL: 5.0 points over what your cap for one company allows (5.0% of the whole portfolio).");

  // Beside the work at this width, closed to one line until opened.
  const limits = page.getByRole("complementary", { name: "About this page" }).locator("details").filter({ hasText: "Your limits" });
  await expect(limits.locator("summary")).toContainText("2 not met · 2 not checked");
  await limits.locator("summary").click();
  await expect(limits).toContainText("Bills are covered · Not checked");
  await expect(limits).toContainText("No bills listed.");
  await expect(limits).toContainText("Slices are inside their ranges · Not checked");
  await expect(limits).toContainText("AAPL is 10.0%, 5.0 points over your cap for one company (5%).");
  await expect(limits).toContainText("The scenario on the Risk page loses $2,100. Your loss budget is $2,000, the loss you could live with. Most of the loss: VTI $1,800, AAPL $300.");

  await page.getByLabel("AAPL target percentage").fill("5");
  await expect(table).toContainText("AAPL: At the most your cap for one company allows (5.0% of the whole portfolio).");
  await expect(table).toContainText("VTI: Can rise to 61.7% of the whole portfolio before it reaches your loss budget.");
  await expect(limits.locator("summary")).toContainText("2 met · 2 not checked");
  await expect(limits).toContainText("The scenario on the Risk page loses $1,950. Your loss budget is $2,000, the loss you could live with.");
});

test("a phone keeps the list under the table, closed to one line", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/studio/research");
  await addToPortfolio(page, "VTI");
  await page.goto("/studio/portfolio");
  await page.getByLabel("VTI target percentage").fill("100");
  const limits = page.getByRole("main").locator("details").filter({ hasText: "Your limits" }).filter({ visible: true });
  await expect(limits).toHaveCount(1);
  await expect(limits).not.toHaveAttribute("open", "");
  // $10,000 in VTI falls $3,000 in the scenario: over the $2,000 budget.
  await expect(limits.locator("summary")).toContainText("1 not met · 3 not checked");
  const size = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(size).toBe(0);
});
