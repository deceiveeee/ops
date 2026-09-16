import { expect, test, type Page } from "@playwright/test";

/**
 * The company beside the competitors it names, in the report reader.
 *
 * The figures come from the SEC through `/api/studio/peer-figures`, which reads
 * company facts of a few megabytes a company, so the route is answered here with
 * a small hand-built payload instead. Its numbers are round on purpose: every
 * score below was worked out by hand from them and is written out in the
 * comments, so this checks the page's arithmetic rather than repeating it.
 *
 * The competitors themselves are counted the way a learner counts them, on the
 * Competitors tab of the report the test server holds (e2e/fixtures/edgar).
 */

const REPORT = "/studio/filings/0001666138/0001628280-25-054049?doc=atkr-20250930.htm&ticker=ATKR";
const COMPETITORS = `${REPORT}&section=competitors`;
const PEERS = `${REPORT}&section=side-by-side`;

const figure = (key: string, value: number) => ({ key, value, concepts: [`Test${key}`], addedUp: null, periodEnd: "2025-09-30" });

/**
 * Atkore, Nucor and Eaton, with only what each one needs to show a different case.
 *
 * - Atkore has all seven, so every measure resolves.
 * - Nucor has no operating profit and no borrowings, so only the bottom line does.
 * - Eaton has no operating profit, so the two profit-and-capital measures do not,
 *   but how hard it works its capital still does.
 */
const PAYLOAD = {
  companies: [
    {
      cik: "0001666138",
      name: "Atkore Inc.",
      sector: "general",
      periodEnd: "2025-09-30",
      // Tax 50 ÷ 200 = 25%, so NOPAT is 225; capital is 800 + 1,000 − 300 = 1,500.
      // Return 15.0%, margin 7.5%, turnover 2.00, bottom line 5.0%, borrowings 0.80.
      figures: [
        figure("revenue", 3000),
        figure("operatingProfit", 300),
        figure("pretaxProfit", 200),
        figure("taxExpense", 50),
        figure("totalDebt", 800),
        figure("equity", 1000),
        figure("cash", 300),
      ],
      missing: [],
      netProfit: { value: 150, concept: "NetIncomeLoss", periodEnd: "2025-09-30" },
      filing: null,
    },
    {
      cik: "0000073309",
      name: "NUCOR CORP",
      sector: "general",
      periodEnd: "2025-12-31",
      // Bottom line 300 ÷ 2,000 = 15.0%, and nothing else.
      figures: [figure("revenue", 2000), figure("pretaxProfit", 400), figure("taxExpense", 100), figure("equity", 1200), figure("cash", 200)],
      missing: [
        { key: "operatingProfit", reason: "Not among the tags this company files under US accounting rules." },
        { key: "totalDebt", reason: "No borrowing figure that excludes finance leases is tagged." },
      ],
      netProfit: { value: 300, concept: "NetIncomeLoss", periodEnd: "2025-12-31" },
      filing: null,
    },
    {
      cik: "0001551182",
      name: "Eaton Corp plc",
      sector: "general",
      periodEnd: "2025-12-31",
      // Capital 1,000 + 2,000 − 500 = 2,500, so turnover 1.60; bottom line 11.25%; borrowings 0.50.
      figures: [
        figure("revenue", 4000),
        figure("pretaxProfit", 600),
        figure("taxExpense", 150),
        figure("totalDebt", 1000),
        figure("equity", 2000),
        figure("cash", 500),
      ],
      missing: [{ key: "operatingProfit", reason: "Not among the tags this company files under US accounting rules." }],
      netProfit: { value: 450, concept: "NetIncomeLoss", periodEnd: "2025-12-31" },
      filing: null,
    },
  ],
};

const section = (page: Page) => page.getByRole("region", { name: "How they compare on the same figures" });

/** Count Nucor and Eaton on the Competitors tab, as a learner would. */
async function countTwo(page: Page) {
  await page.goto(COMPETITORS);
  const competitors = page.getByRole("region", { name: "Who this company says it competes with" });
  await competitors.getByRole("button", { name: "Count Nucor Corporation as a competitor" }).click();
  await competitors.getByRole("button", { name: "Count Eaton Corporation plc as a competitor" }).click();
  await expect(competitors.getByRole("list", { name: "Your competitors for this company (2)" })).toBeVisible();
}

async function answerWith(page: Page, body: unknown = PAYLOAD) {
  await page.route("**/api/studio/peer-figures*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
}

test("says there is nothing to compare until competitors are counted, and points at where to count them", async ({ page }) => {
  await page.goto(PEERS);
  await expect(section(page)).toContainText("Nothing to compare yet");
  await expect(section(page).getByRole("link", { name: "Count the competitors this report names" })).toHaveAttribute(
    "href",
    /section=competitors/,
  );
  await expect(section(page).getByRole("button", { name: /Read the annual figures/ })).toHaveCount(0);
});

test("sets the company beside the competitors it names, in the order the scores put them", async ({ page }) => {
  await countTwo(page);
  await answerWith(page);
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: "Read the annual figures for these 3 companies" }).click();

  const rows = section(page).getByRole("table").getByRole("row");
  // Composites: Nucor +0.91 on one measure, Eaton +0.05 on three, Atkore −0.36 on three.
  await expect(rows.nth(1)).toContainText("NUCOR CORP");
  await expect(rows.nth(2)).toContainText("Eaton Corp plc");
  await expect(rows.nth(3)).toContainText("Atkore Inc.");
  await expect(rows.nth(3)).toContainText("this company");

  // Atkore: turnover 2.00 scoring +0.71, bottom line 5.0% scoring −1.07, borrowings 0.80
  // scoring −0.71 once the direction is turned round. Averaged: −0.36 on three of five.
  await expect(rows.nth(3)).toContainText("2.00");
  await expect(rows.nth(3)).toContainText("score +0.71");
  await expect(rows.nth(3)).toContainText("5.0%");
  await expect(rows.nth(3)).toContainText("score −1.07");
  await expect(rows.nth(3)).toContainText("−0.36");
  await expect(rows.nth(3)).toContainText("on 3 of 5 measures");
  await expect(rows.nth(1)).toContainText("+0.91");
  await expect(rows.nth(1)).toContainText("on 1 of 5 measures");
});

test("says why a figure is not there instead of showing a zero", async ({ page }) => {
  await countTwo(page);
  await answerWith(page);
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();

  const nucor = section(page).getByRole("table").getByRole("row").nth(1);
  await expect(nucor).toContainText("could not read its operating profit and total borrowings");
  await expect(nucor).not.toContainText("0.0%");
  // Only Atkore has a return on capital, so nothing is scored on it rather than Atkore winning it.
  await expect(nucor).toContainText("—");
  const atkore = section(page).getByRole("table").getByRole("row").nth(3);
  await expect(atkore).toContainText("only this company has this figure");
});

test("shows the working, including that a small group is not clipped", async ({ page }) => {
  await countTwo(page);
  await answerWith(page);
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();
  await section(page).getByText("How this order was worked out").click();

  const working = section(page).getByRole("group");
  await expect(working).toContainText("fewer than four, so nothing was pulled in");
  await expect(working).toContainText("with two companies every score is +0.71 or −0.71");
  // The bottom line is the one measure three companies hold: average 10.4%, spread 5.1%.
  await expect(working).toContainText("3 companies");
  await expect(working).toContainText("average 10.4%, spread 5.1%");
  await expect(working).toContainText("only one company here has this figure");
});

test("says when the years compared do not line up", async ({ page }) => {
  await countTwo(page);
  await answerWith(page);
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();
  await expect(section(page)).toContainText("years end on different dates");
  await expect(section(page).getByRole("table")).toContainText("year to 30 Sept 2025");
  await expect(section(page).getByRole("table")).toContainText("year to 31 Dec 2025");
});

test("marks a company whose newest tagged year is far older than this report's", async ({ page }) => {
  await countTwo(page);
  // ABB is the real case: its US accounting figures stop in 2023 while its rivals file for 2025.
  await answerWith(page, {
    companies: [
      PAYLOAD.companies[0],
      PAYLOAD.companies[1],
      { ...PAYLOAD.companies[2], periodEnd: "2023-12-31" },
    ],
  });
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();
  const eaton = section(page).getByRole("row").filter({ hasText: "Eaton Corp plc" });
  await expect(eaton).toContainText("year to 31 Dec 2023");
  await expect(eaton).toContainText("an older year than this report");
  // Atkore's own year is the one the others are read against, so it is never marked.
  await expect(section(page).getByRole("row").filter({ hasText: "Atkore Inc." })).not.toContainText("an older year");
});

test("keeps a company that could not be read in the list, with its reason", async ({ page }) => {
  await countTwo(page);
  await answerWith(page, {
    companies: [
      PAYLOAD.companies[0],
      PAYLOAD.companies[2],
      { cik: "0000073309", name: "NUCOR CORP", unavailable: "The SEC holds no annual figures for this company under US accounting rules." },
    ],
  });
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();
  await expect(section(page).getByRole("table")).not.toContainText("NUCOR");
  await expect(section(page)).toContainText("Not compared");
  await expect(section(page)).toContainText("The SEC holds no annual figures");
});

test("says so rather than showing an empty table when the SEC cannot be reached", async ({ page }) => {
  await countTwo(page);
  await page.route("**/api/studio/peer-figures*", async (route) => {
    await route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "Those figures could not be read just now." }) });
  });
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();
  await expect(section(page).getByRole("alert")).toContainText("could not be read just now");
  await expect(section(page).getByRole("table")).toHaveCount(0);
});

test("keeps the tab within the screen budget at 1440, with the figures read", async ({ page }) => {
  await countTwo(page);
  await answerWith(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();
  await expect(section(page).getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1_350);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("fits a phone, with the table scrolling inside itself rather than the page", async ({ page }) => {
  await countTwo(page);
  await answerWith(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(PEERS);
  await section(page).getByRole("button", { name: /Read the annual figures/ }).click();
  await expect(section(page).getByRole("table")).toBeVisible();

  // The table is wider than a phone on purpose; its own container carries that width.
  const holder = section(page).getByRole("table").locator("xpath=..");
  expect(await holder.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
