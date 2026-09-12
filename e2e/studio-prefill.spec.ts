import { expect, test, type Page } from "@playwright/test";

/**
 * Filling Investigate's seven figures from what the company filed.
 *
 * The lookup is mocked here rather than left to reach the SEC. Not to make the
 * tests easier — the route was driven against live EDGAR while it was built,
 * and `prefill.test.ts` runs on real filings trimmed to size — but because a
 * test that fails when sec.gov is slow, rate-limits, or restates a filing is a
 * test nobody trusts. What these check is the part the mock cannot fake: that
 * the figures land in the right boxes, that each one keeps its source across a
 * reload, and that overtyping one takes its source away.
 */

const INVESTIGATE = "/studio/investigate";
const DATABASE = "ops-studio-projects";
const ROUTE = "**/api/studio/company-figures*";

/** Atkore's FY2025 figures, exactly as the live route returned them. */
const ATKORE = {
  ticker: "ATKR",
  cik: "0001666138",
  entityName: "Atkore Inc.",
  sic: "3690",
  sicDescription: "Miscellaneous Electrical Machinery, Equipment & Supplies",
  periodEnd: "2025-09-30",
  filing: { accession: "0001628280-25-054049", form: "10-K", filed: "2025-11-26", primaryDocument: "atkr-20250930.htm" },
  supplied: [
    ["revenue", 2_850_378_000, ["RevenueFromContractWithCustomerExcludingAssessedTax"], null],
    ["operatingProfit", 23_173_000, ["OperatingIncomeLoss"], null],
    ["pretaxProfit", -18_590_000, ["IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest"], null],
    ["taxExpense", -3_415_000, ["IncomeTaxExpenseBenefit"], null],
    ["equity", 1_398_341_000, ["StockholdersEquity"], null],
    ["cash", 506_699_000, ["CashAndCashEquivalentsAtCarryingValue"], null],
    ["totalDebt", 760_532_000, ["LongTermDebt"], null],
  ].map(([key, value, concepts, addedUp]) => ({
    key,
    value,
    concepts,
    addedUp,
    periodStart: null,
    periodEnd: "2025-09-30",
    accession: "0001628280-25-054049",
    form: "10-K",
    filed: "2025-11-26",
  })),
  missing: [] as unknown[],
};

const tickerBox = (page: Page) => page.getByPlaceholder("Its ticker, such as ATKR");
const fillButton = (page: Page) => page.getByRole("button", { name: "Fill these from the SEC" });
const filed = (page: Page, label: string) => page.getByLabel(`${label}, as the company filed it`, { exact: true });

async function answerWith(page: Page, body: unknown, status = 200) {
  await page.route(ROUTE, (route) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }));
}

/** What reached storage, which is the only thing that can answer "was it kept?". */
async function storedSource(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate<Record<string, unknown> | null, string>(async (name) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const rows = await new Promise<Record<string, string>[]>((resolve) => {
      const request = db.transaction("projects").objectStore("projects").getAll();
      request.onsuccess = () => resolve(request.result);
    });
    db.close();
    for (const row of rows) {
      try {
        const project = JSON.parse(row.raw ?? JSON.stringify(row));
        const investigation = project.investigations?.[0];
        if (investigation) return investigation.source ?? null;
      } catch {
        // Not a project row; the recovery store holds unparsed text by design.
      }
    }
    return null;
  }, DATABASE);
}

test.describe("filling the seven from a filing", () => {
  test("puts each figure in its own box, and says which filing it came from", async ({ page }) => {
    await answerWith(page, ATKORE);
    await page.goto(INVESTIGATE);

    await tickerBox(page).fill("ATKR");
    await fillButton(page).click();

    await expect(filed(page, "Revenue")).toHaveValue("2850378000");
    await expect(filed(page, "Operating profit")).toHaveValue("23173000");
    await expect(filed(page, "Profit before tax")).toHaveValue("-18590000");
    await expect(filed(page, "Tax charge")).toHaveValue("-3415000");
    await expect(filed(page, "Total borrowings")).toHaveValue("760532000");
    await expect(filed(page, "Shareholders' equity")).toHaveValue("1398341000");
    await expect(filed(page, "Cash")).toHaveValue("506699000");

    // EDGAR's own name for the company replaces the ticker that was typed.
    await expect(tickerBox(page)).toHaveValue("Atkore Inc.");

    const main = page.getByRole("main");
    await expect(main).toContainText("the year to 30 September 2025");
    await expect(main).toContainText("from its 10-K filed 26 November 2025");
    await expect(main.getByRole("link", { name: "open the filing" })).toHaveAttribute(
      "href",
      "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/0001628280-25-054049-index.htm",
    );

    // The whole point: a reading the learner did not have to type seven numbers for.
    await expect(main).toContainText("Atkore Inc. earns");
  });

  test("opens a figure to the tag it was read from", async ({ page }) => {
    await answerWith(page, ATKORE);
    await page.goto(INVESTIGATE);
    await tickerBox(page).fill("ATKR");
    await fillButton(page).click();
    await expect(filed(page, "Total borrowings")).toHaveValue("760532000");

    await page.getByRole("button", { name: /^Total borrowings/ }).click();
    await expect(page.getByRole("main")).toContainText("LongTermDebt");
    await expect(page.getByRole("main")).toContainText("for the year to 30 September 2025");
  });

  test("says when the company's industry is not one Studio has researched", async ({ page }) => {
    await answerWith(page, ATKORE);
    await page.goto(INVESTIGATE);
    await tickerBox(page).fill("ATKR");
    await fillButton(page).click();
    await expect(filed(page, "Revenue")).toHaveValue("2850378000");

    // SIC 3690 is mostly battery and EV-charging makers. Comparing Atkore with
    // semiconductors without saying so was the dead end this removes.
    await expect(page.getByRole("main")).toContainText("not one of the five industries Studio has researched");
  });

  test("keeps every source across a reload", async ({ page }) => {
    await answerWith(page, ATKORE);
    await page.goto(INVESTIGATE);
    await tickerBox(page).fill("ATKR");
    await fillButton(page).click();
    await expect(filed(page, "Revenue")).toHaveValue("2850378000");

    // Written, not merely rendered: a source that lives in React state alone
    // would leave a reopened investigation showing seven numbers from nowhere.
    await expect.poll(async () => (await storedSource(page))?.accession).toBe("0001628280-25-054049");

    await page.reload();
    await expect(filed(page, "Revenue")).toHaveValue("2850378000");
    await expect(page.getByRole("main")).toContainText("from its 10-K filed 26 November 2025");
    await expect(page.getByRole("main")).toContainText("Atkore Inc. earns");
  });

  test("overtyping one figure takes away its source and leaves the rest alone", async ({ page }) => {
    await answerWith(page, ATKORE);
    await page.goto(INVESTIGATE);
    await tickerBox(page).fill("ATKR");
    await fillButton(page).click();
    await expect(filed(page, "Cash")).toHaveValue("506699000");

    await filed(page, "Cash").fill("1234");

    // No longer the company's figure, so it must not be labelled as one.
    await expect(page.getByLabel("Cash", { exact: true })).toHaveValue("1234");
    await expect(filed(page, "Cash")).toHaveCount(0);
    await expect(filed(page, "Revenue")).toHaveValue("2850378000");

    await expect.poll(async () => {
      const source = await storedSource(page);
      return source ? Object.keys(source.figures as object).sort() : null;
    }).toEqual(["equity", "operatingProfit", "pretaxProfit", "revenue", "taxExpense", "totalDebt"]);
  });
});

test.describe("when the lookup cannot answer", () => {
  test("shows the reason and leaves the boxes as they were", async ({ page }) => {
    await answerWith(page, { error: 'No company files with EDGAR under the ticker "ZZZZQQ".' }, 404);
    await page.goto(INVESTIGATE);

    await tickerBox(page).fill("ZZZZQQ");
    await fillButton(page).click();

    await expect(page.getByRole("main").getByRole("alert")).toContainText("No company files with EDGAR");
    await expect(page.getByLabel("Revenue", { exact: true })).toHaveValue("");
  });

  test("asks for a ticker rather than sending a company's name as one", async ({ page }) => {
    let asked = false;
    await page.route(ROUTE, (route) => { asked = true; return route.fulfill({ status: 200, contentType: "application/json", body: "{}" }); });
    await page.goto(INVESTIGATE);

    await tickerBox(page).fill("Atkore Electrical");
    await fillButton(page).click();

    await expect(page.getByRole("main").getByRole("alert")).toContainText("looks companies up by ticker symbol");
    expect(asked).toBe(false);
  });

  test("names the figures a filing did not tag", async ({ page }) => {
    // Exxon files no operating income and no lease-free borrowing tag.
    await answerWith(page, {
      ...ATKORE,
      entityName: "Exxon Mobil Corporation",
      supplied: ATKORE.supplied.filter((figure) => figure.key !== "operatingProfit" && figure.key !== "totalDebt"),
      missing: [
        { key: "operatingProfit", reason: "Not among the tags this company files under US accounting rules. Read it off the statement and type it in.", tried: ["OperatingIncomeLoss"] },
        { key: "totalDebt", reason: "No borrowing figure that excludes finance leases is tagged for the year ending 2025-12-31.", tried: ["LongTermDebt"] },
      ],
    });
    await page.goto(INVESTIGATE);
    await tickerBox(page).fill("XOM");
    await fillButton(page).click();

    await expect(filed(page, "Revenue")).toHaveValue("2850378000");
    await expect(page.getByRole("main")).toContainText("Not tagged in this filing: operating profit, total borrowings");
    await expect(page.getByLabel("Operating profit", { exact: true })).toHaveValue("");
    // A gap is a gap, never a zero the learner has no reason to doubt.
    await expect(page.getByLabel("Total borrowings", { exact: true })).toHaveValue("");
  });
});

test("the page at rest is no taller for having a lookup on it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(INVESTIGATE);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  // Measured at 1302px on 2026-09-11, unchanged by the lookup, against the
  // 1.5-screen budget. The margin is for font and rounding drift, not for a
  // new block of copy.
  expect(height).toBeLessThanOrEqual(1350);
});
