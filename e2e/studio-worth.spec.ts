import { expect, test, type Page } from "@playwright/test";

/**
 * What a price assumes, in the report reader.
 *
 * The figures are answered from a fixed payload with round numbers, so every
 * expectation below can be worked out by hand: after-tax operating profit of
 * 150 on capital of 900 is a 16⅔% return, and at a 10% cost of capital the
 * business standing still is worth 150 ÷ 0.10 = 1,500, less 200 of net debt,
 * across 100 shares — $13.00 a share.
 */

const REPORT = "/studio/filings/0001666138/0001628280-25-054049?doc=atkr-20250930.htm&ticker=ATKR";
const WORTH = `${REPORT}&section=worth`;

const figure = (key: string, value: number) => ({ key, value, concepts: [`Test${key}`], addedUp: null, periodEnd: "2025-09-30" });

const PAYLOAD = {
  companies: [
    {
      cik: "0001666138",
      name: "Atkore Inc.",
      sector: "general",
      periodEnd: "2025-09-30",
      figures: [
        figure("revenue", 1000),
        figure("operatingProfit", 200),
        figure("pretaxProfit", 160),
        figure("taxExpense", 40),
        figure("totalDebt", 300),
        figure("equity", 700),
        figure("cash", 100),
      ],
      missing: [],
      netProfit: { value: 120, concept: "NetIncomeLoss", periodEnd: "2025-09-30" },
      shares: { value: 100, concept: "WeightedAverageNumberOfDilutedSharesOutstanding", periodEnd: "2025-09-30" },
      filing: null,
    },
  ],
};

const section = (page: Page) => page.getByRole("region", { name: "What a price for this company assumes" });

async function readFigures(page: Page, body: unknown = PAYLOAD) {
  await page.route("**/api/studio/peer-figures*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto(WORTH);
  await section(page).getByRole("button", { name: "Read this company's figures" }).click();
  await page.getByLabel("What money costs it", { exact: true }).fill("10");
}

test("asks for the figures before it says anything, and names what it will read", async ({ page }) => {
  await page.route("**/api/studio/peer-figures*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PAYLOAD) });
  });
  await page.goto(WORTH);
  await expect(section(page)).toContainText("Its operating profit, tax, borrowings, cash and shares");
  await expect(page.getByLabel("Price someone is asking", { exact: true })).toHaveCount(0);
});

test("values the business standing still, and bridges to one share", async ({ page }) => {
  await readFigures(page);
  // 150 ÷ 0.10 = 1,500 for the business; 300 of debt less 100 of cash leaves 1,300 for 100 shares.
  await expect(section(page)).toContainText("$13.00");
  await expect(section(page)).toContainText("A share, with no growth at all");
  // Its own return on capital, 150 ÷ 900, is offered as the starting point for new money.
  await expect(page.getByLabel("Return on new money", { exact: true })).toHaveValue("16.7");
});

test("says what growth a price is asking for", async ({ page }) => {
  await readFigures(page);
  // $13.00 is the business standing still, so that price assumes no growth at all.
  await page.getByLabel("Price someone is asking", { exact: true }).fill("13");
  await expect(section(page)).toContainText("0.0% growth");

  // 2% growth costs 12% of the profit and is worth 1,650, or $14.50 a share.
  await page.getByLabel("Price someone is asking", { exact: true }).fill("14.50");
  await expect(section(page)).toContainText("2.0% growth");
  await expect(section(page)).toContainText("Every year, for ever");
});

test("reads a price below the standing-still value as needing less than nothing", async ({ page }) => {
  await readFigures(page);
  await page.getByLabel("Price someone is asking", { exact: true }).fill("11");
  await expect(section(page)).toContainText("Less than standing still");
});

test("shows a grid of values, falling as money costs more", async ({ page }) => {
  await readFigures(page);
  const rows = section(page).getByRole("table").getByRole("row");
  // No growth: 150 ÷ 0.09 = 1,666.67 less 200, over 100 shares; then 0.10; then 0.11.
  await expect(rows.nth(1)).toContainText("$14.67");
  await expect(rows.nth(1)).toContainText("$13.00");
  await expect(rows.nth(1)).toContainText("$11.64");
  // Growth adds value here, because new money earns more than it costs.
  await expect(rows.nth(2)).toContainText("$14.50");
  await expect(section(page)).toContainText("adds value");
});

test("refuses growth the business cannot pay for, and says why", async ({ page }) => {
  await readFigures(page);
  await page.getByLabel("Return on new money", { exact: true }).fill("1");
  // At a 1% return, 2% growth would need twice the profit put back in.
  await expect(section(page)).toContainText("put back more than it earns");
  await expect(section(page)).toContainText("An empty cell is growth this business cannot pay for");
  // Growth cannot be valued at all here, so the page says what is wrong rather than scoring it.
  await expect(section(page)).toContainText("New money earns less than it costs");
});

test("counts five company shares behind one receipt when told to", async ({ page }) => {
  await readFigures(page);
  await section(page).getByText("Where every figure came from").click();
  await page.getByLabel("Company shares behind one traded share", { exact: true }).fill("5");
  // $13.00 a share is $65.00 a receipt.
  await expect(section(page)).toContainText("$65.00");
});

test("shows where every figure came from, tag by tag", async ({ page }) => {
  await readFigures(page);
  await section(page).getByText("Where every figure came from").click();
  const details = section(page).getByRole("group");
  await expect(details).toContainText("taxed at 25.0%");
  await expect(details).toContainText("WeightedAverageNumberOfDilutedSharesOutstanding");
  await expect(details).toContainText("the year\u2019s diluted average");
  await expect(details).toContainText("your judgement, not a fact");
});

test("says it is not a price target", async ({ page }) => {
  await readFigures(page);
  await expect(section(page)).toContainText("It is not a price target");
});

test("keeps the tab within the screen budget at 1440, and off the page edge on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await readFigures(page);
  await page.getByLabel("Price someone is asking", { exact: true }).fill("14.50");
  await expect(section(page).getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1_350);

  await page.setViewportSize({ width: 390, height: 900 });
  await expect(section(page).getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
