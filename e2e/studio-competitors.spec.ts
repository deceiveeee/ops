import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { filerIndex, suggestCompetitors } from "../lib/filings/competitors";
import { extractFilingSections } from "../lib/filings/sections";

/**
 * Who a company says it competes with, in the company-report reader.
 *
 * The tab works on any company's annual report. The tests use the one the test
 * server holds, Atkore's, with a trimmed copy of EDGAR's ticker file
 * (e2e/fixtures/edgar, see its README). What the page should list is not typed
 * in: it is worked out from those same files by the same rules the page uses.
 * What was counted is read from IndexedDB, where the learner's work is kept.
 */

const REPORT = "/studio/filings/0001666138/0001628280-25-054049?doc=atkr-20250930.htm&ticker=ATKR";
const COMPETITORS = `${REPORT}&section=competitors`;
const DATABASE = "ops-studio-projects";
const FIXTURES = join(process.cwd(), "e2e", "fixtures", "edgar");

const html = readFileSync(join(FIXTURES, "https___www.sec.gov_Archives_edgar_data_1666138_000162828025054049_atkr-20250930.htm"), "utf8");
const business = extractFilingSections(html).sections.find((section) => section.id === "business");
if (!business) throw new Error("the fixture has no Business section");
const filers = filerIndex(JSON.parse(readFileSync(join(FIXTURES, "https___www.sec.gov_files_company_tickers.json"), "utf8")));
const { suggestions } = suggestCompetitors(business, filers, { cik: "0001666138", name: "Atkore Inc." });
const nucor = suggestions.find((entry) => entry.filer?.ticker === "NUE");
if (!nucor?.filer) throw new Error("Nucor is not among the suggestions");
const SHOWN = 8;

type StoredInvestigation = {
  company: string;
  passages: { id: string; quote: string }[];
  peers: { name: string; cik: string; ticker: string; passageId: string }[];
};

async function stored(page: Page): Promise<StoredInvestigation[]> {
  return page.evaluate<StoredInvestigation[], string>(async (name) => {
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
        if (Array.isArray(project.investigations)) {
          return project.investigations.map((item: Record<string, unknown>) => ({
            company: item.company,
            passages: item.passages ?? [],
            peers: item.peers ?? [],
          }));
        }
      } catch {
        // Not a project row.
      }
    }
    return [];
  }, DATABASE);
}

const section = (page: Page) => page.getByRole("region", { name: "Who this company says it competes with" });

test("offers every company tab on an annual report, after where its revenue comes from", async ({ page }) => {
  await page.goto(REPORT);
  const tabs = page.getByRole("navigation", { name: "Sections of this report" }).getByRole("link");
  await expect(tabs.nth(1)).toHaveText("Where revenue comes from");
  await expect(tabs.nth(2)).toHaveText("Competitors");
  await expect(tabs.nth(3)).toHaveText("Side by side");
  await expect(tabs.nth(4)).toHaveText("What a price assumes");
  await expect(tabs.nth(5)).toHaveText("Input costs");

  await tabs.nth(2).click();
  await expect(tabs.nth(2)).toHaveAttribute("aria-current", "page");
  await expect(section(page)).toBeVisible();
});

test("lists every company the report names, each with what the SEC's list says of it", async ({ page }) => {
  expect(suggestions.length).toBeGreaterThan(SHOWN);
  await page.goto(COMPETITORS);
  const items = section(page).getByRole("list", { name: `Named in its words about competition (${suggestions.length})` }).getByRole("listitem");
  await expect(items).toHaveCount(SHOWN);
  await section(page).getByRole("button", { name: `Show all ${suggestions.length}` }).click();
  await expect(items).toHaveCount(suggestions.length);
  for (const [index, suggestion] of suggestions.entries()) {
    await expect(items.nth(index), suggestion.name).toContainText(suggestion.name);
    await expect(items.nth(index), suggestion.name).toContainText(
      suggestion.filer
        ? `In the SEC’s list as ${suggestion.filer.name}`
        : suggestion.ambiguous
          ? "More than one company in the SEC's list goes by this name"
          : "No company in the SEC's list goes by this name",
    );
  }
});

test("counts a named competitor with the passage that names it, and keeps it across a reload", async ({ page }) => {
  await page.goto(COMPETITORS);
  await section(page).getByRole("button", { name: `Count ${nucor.name} as a competitor` }).click();
  const yours = section(page).getByRole("list", { name: "Your competitors for this company (1)" });
  await expect(yours).toContainText(nucor.name);
  await expect(yours).toContainText("named in this report");
  await expect(yours.getByRole("link", { name: "NUE reports" })).toHaveAttribute("href", "/studio/filings?ticker=NUE");

  await expect.poll(async () => (await stored(page))[0]?.peers.length ?? 0).toBe(1);
  const [investigation] = await stored(page);
  expect(investigation.company).toBe("Atkore Inc.");
  expect(investigation.peers[0]).toMatchObject({ name: nucor.name, cik: nucor.filer!.cik, ticker: "NUE" });
  expect(investigation.passages.find((passage) => passage.id === investigation.peers[0].passageId)?.quote).toBe(nucor.passage.quote);

  await page.reload();
  await expect(section(page).getByRole("button", { name: `${nucor.name} is counted` })).toBeDisabled();
  await expect(section(page).getByRole("list", { name: "Your competitors for this company (1)" })).toContainText(nucor.name);
});

test("opens the passage that names a competitor, marked in the report", async ({ page }) => {
  await page.goto(COMPETITORS);
  const href = await section(page).getByRole("link", { name: `Where the report names ${nucor.name}` }).getAttribute("href");
  await page.goto(`${REPORT.split("?")[0]}${href}`);
  const lines = nucor.passage.quote.split("\n").map((line) => line.trim()).filter(Boolean);
  await expect(page.locator("mark")).toHaveText(lines);
});

test("adds a company by its ticker, refuses the company itself, and lets one go", async ({ page }) => {
  await page.goto(COMPETITORS);
  const box = section(page).getByLabel("Add a company by its ticker");
  const add = section(page).getByRole("button", { name: "Add", exact: true });

  await box.fill("ETN");
  await add.click();
  const yours = section(page).getByRole("list", { name: /^Your competitors for this company/ });
  await expect(yours).toContainText("Eaton Corp plc");
  await expect(yours).toContainText("added by ticker");
  await expect(box).toHaveValue("");
  // The same company among the names the report gives is now counted too.
  await expect(section(page).getByRole("button", { name: "Eaton Corporation plc is counted" })).toBeDisabled();

  await box.fill("ATKR");
  await add.click();
  await expect(section(page).getByRole("alert")).toHaveText("ATKR is this company itself.");

  await section(page).getByRole("button", { name: "Stop counting Eaton Corp plc" }).click();
  await expect(section(page).getByText("None counted yet.")).toBeVisible();
  await expect.poll(async () => (await stored(page))[0]?.peers.length ?? -1).toBe(0);
});

test("fits a phone without the page scrolling sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(COMPETITORS);
  await expect(section(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("keeps the tab within the screen budget at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(COMPETITORS);
  await expect(section(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1_350);
});
