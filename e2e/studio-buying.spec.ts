import { expect, test, type Page } from "@playwright/test";

/**
 * Working out what to buy without leaving Studio.
 *
 * "What to buy" used to say Studio holds no market prices and ask for the quote a
 * broker shows, which was the last outside website on the Atkore journey. It now
 * starts every investment from its last price on record — a month-end closing
 * price from SEC holdings filings, or a Treasury auction price — with the date
 * beside it, and a learner's own broker price replaces it when entered.
 *
 * No test here depends on the price itself, which changes whenever the data is
 * refreshed; the arithmetic is covered in lib/studio-catalog.test.ts.
 */

async function addToPortfolio(page: Page, symbol: string) {
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
}

async function portfolioOfVtiAndAgg(page: Page) {
  await page.goto("/studio/research");
  await addToPortfolio(page, "VTI");
  await addToPortfolio(page, "AGG");
  await page.goto("/studio/portfolio");
  await page.getByLabel("VTI target percentage").fill("60");
  await page.getByLabel("AGG target percentage").fill("40");
  // Moving by the page's own link keeps the workspace open, so the weights just typed come too.
  await page.getByRole("link", { name: "What to buy" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Work out what to buy" })).toBeVisible();
}

const researchPriceLine = (page: Page) =>
  page.getByRole("main").getByText(/^Worked out from \$[\d,]+\.\d{2} a share, the price on \d{1,2} [A-Z][a-z]+ 20\d\d: what funds holding it reported in their SEC holdings filings\.$/);

test("starts each investment from a dated price, so no broker quote is needed", async ({ page }) => {
  await portfolioOfVtiAndAgg(page);
  const main = page.getByRole("main");

  await expect(main).not.toContainText("Studio holds no market prices");
  await expect(researchPriceLine(page)).toHaveCount(2);
  await expect(main).not.toContainText("Enter a dated broker quote");
  // Each dated price is flagged as a price on record rather than today's.
  await expect(main.getByText(/last price on record, not today's/)).toHaveCount(2);
});

test("uses the learner's broker price instead, once one is entered", async ({ page }) => {
  await portfolioOfVtiAndAgg(page);
  const main = page.getByRole("main");

  await page.getByLabel("Your broker's price per share (optional)").first().fill("250");
  await page.getByLabel("Date of your broker's price").first().fill("2026-09-13");

  await expect(main.getByText("Worked out from your broker's price, $250.00, from 2026-09-13.")).toBeVisible();
  // Only AGG is still on its price on record.
  await expect(researchPriceLine(page)).toHaveCount(1);
  await expect(main.getByText(/last price on record, not today's/)).toHaveCount(1);
});
