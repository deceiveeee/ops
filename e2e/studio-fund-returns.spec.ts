import { expect, test, type Page } from "@playwright/test";
import fundReports from "../lib/studio-project/data/fund-reports.json";

/**
 * A fund's returns and costs, read in Research from its own annual report.
 *
 * Research showed a fund's prospectus cost and nothing about what it had
 * returned, so comparing funds meant leaving Studio. Each fund's card now
 * shows its 1-, 5- and 10-year returns, or since a younger share class began,
 * with their period, the year's cost, and the report's own statement that past
 * performance does not predict.
 *
 * The figures on screen are checked here against the data file; the data file
 * is checked against the filings in lib/studio-project/fund-reports.data.test.ts.
 */

type Extract = {
  returns: { periods: { value: number }[] };
  costs: { paidPer10000Usd: number; ratio: number };
  pastPerformance: string;
};
const extractOf = (id: string) => (fundReports.funds as unknown as Record<string, { extract: Extract }>)[id].extract;
const printed = (value: number) => `${(Math.round(value * 10000) / 100).toFixed(2)}%`;
const DATE = String.raw`\d{1,2} [A-Z][a-z]+ 20\d\d`;

async function openCard(page: Page, symbol: string) {
  await page.goto("/studio/research");
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  const toggle = page.getByRole("main").getByRole("button").filter({ hasText: new RegExp(`^${symbol}`) }).first();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  if (symbol !== "AAPL") await page.getByRole("button", { name: "Returns and costs", exact: true }).click();
  return toggle.locator("xpath=..");
}

test("shows a fund's 1-, 5- and 10-year returns as its report gives them, with the period and the year's cost", async ({ page }) => {
  const card = await openCard(page, "VTI");
  const vti = extractOf("vti");
  const table = card.getByRole("table");

  await expect(table.getByRole("columnheader")).toHaveText(["1 year", "5 years", "10 years"]);
  await expect(table.getByRole("rowheader")).toHaveText("Average a year");
  await expect(table.locator("tbody").getByRole("cell")).toHaveText(vti.returns.periods.map((period) => printed(period.value)));

  const facts = card.getByText(/^Periods ending /);
  await expect(facts).toContainText(new RegExp(`^Periods ending ${DATE}, before any tax you would pay\\.`));
  await expect(facts).toContainText(`Over that year it cost $${vti.costs.paidPer10000Usd} for every $10,000 invested (${printed(vti.costs.ratio)}).`);
  await expect(facts).toContainText("kinds of shares, each with its own costs, so these are VTI's figures.");
  await expect(card.getByText(`Its report says: “${vti.pastPerformance}”`, { exact: true })).toBeVisible();
});

test("gives a younger share class's return since it began, instead of ten years, and fits a phone", async ({ page }) => {
  // At 390px SGOV's "Since" heading once widened every card in the list, and the
  // whole page scrolled sideways.
  await page.setViewportSize({ width: 390, height: 900 });
  const card = await openCard(page, "SGOV");
  const headers = card.getByRole("table").getByRole("columnheader");

  await expect(headers).toHaveCount(3);
  await expect(headers.nth(2)).toHaveText(new RegExp(`^Since ${DATE}$`));
  // Only the "Since" heading may wrap. "5 years" split over two lines reads as two labels.
  const lines = (index: number) =>
    headers.nth(index).evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
  expect([await lines(0), await lines(1)]).toEqual([1, 1]);
  // SGOV is its fund's only share class, so there is no sentence about others.
  await expect(card).not.toContainText("kinds of shares");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("fits every fund's returns table on a phone without scrolling it sideways", async ({ page }) => {
  // At 390px VTI's table was once 10px wider than the card, and scrolled inside it.
  await page.setViewportSize({ width: 390, height: 900 });
  for (const symbol of ["VTI", "VOO", "VXUS", "AGG", "SGOV"]) {
    const card = await openCard(page, symbol);
    const scroller = card.getByRole("table").locator("xpath=..");
    expect(await scroller.evaluate((el) => el.scrollWidth - el.clientWidth), symbol).toBe(0);
  }
});

test("says where each cost comes from when the report and the prospectus differ", async ({ page }) => {
  const card = await openCard(page, "VXUS");
  await expect(card.getByText(/^Periods ending /)).toContainText(new RegExp(`The 0\\.05% a year above is from its prospectus dated ${DATE}\\.`));
});

test("shows no returns for a company share, which has no fund report", async ({ page }) => {
  const card = await openCard(page, "AAPL");
  await expect(card.getByText("What the filing calls its main risks")).toBeVisible();
  await expect(card).not.toContainText("What it returned and cost");
});
