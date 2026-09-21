import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { extractFilingSections } from "../lib/filings/sections";
import { fiscalYearFor, formatChange, monthsOf, suggestInputs, yearOnYear, type InputCostLibrary } from "../lib/studio-project/input-costs";

/**
 * What a company's inputs cost, in the company-report reader.
 *
 * The tab works on any company's annual report. The tests use the one the test
 * server holds, Atkore's (e2e/fixtures/edgar). What it lists, and each change by
 * fiscal year, is worked out from the same report and the same library data file
 * by the same functions the page uses. Nothing is linked until the learner says
 * a sentence shows the company buys the input, and the link and its sentence are
 * read back from IndexedDB, where the learner's work is kept.
 */

const REPORT = "/studio/filings/0001666138/0001628280-25-054049?doc=atkr-20250930.htm&ticker=ATKR";
const INPUTS = `${REPORT}&section=inputs`;
const DATABASE = "ops-studio-projects";
const FIXTURES = join(process.cwd(), "e2e", "fixtures", "edgar");
const INPUT_SECTIONS = new Set(["business", "risk-factors", "mdna", "market-risk"]);

const library = JSON.parse(readFileSync(join(process.cwd(), "lib", "studio-project", "data", "input-cost-library.json"), "utf8")) as InputCostLibrary;
const html = readFileSync(join(FIXTURES, "https___www.sec.gov_Archives_edgar_data_1666138_000162828025054049_atkr-20250930.htm"), "utf8");
const suggestions = suggestInputs(extractFilingSections(html).sections.filter((section) => INPUT_SECTIONS.has(section.id)), library.series);
const recent = JSON.parse(readFileSync(join(FIXTURES, "https___data.sec.gov_submissions_CIK0001666138.json"), "utf8")).filings.recent;
const fiscal = fiscalYearFor(recent.reportDate[recent.accessionNumber.indexOf("0001628280-25-054049")]);
if (!fiscal) throw new Error("the fixture report's period end does not read");
const steelSeries = library.series.find((series) => series.id === "WPU1017");
const steel = suggestions.find((entry) => entry.seriesId === "WPU1017");
if (!steelSeries || !steel) throw new Error("the report's mentions of steel are not suggested");
const buying = steel.sentences[0];
const years = [fiscal.fiscalYear - 1, fiscal.fiscalYear];
const expectedChanges = years.map((year) => {
  const moved = yearOnYear(monthsOf(steelSeries), year, fiscal.endMonth);
  if (!moved) throw new Error(`steel has no fiscal ${year} change`);
  return formatChange(moved.change);
});

type StoredInvestigation = {
  company: string;
  passages: { id: string; quote: string }[];
  inputs: { seriesId: string; passageId: string }[];
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
            inputs: item.inputs ?? [],
          }));
        }
      } catch {
        // Not a project row.
      }
    }
    return [];
  }, DATABASE);
}

const section = (page: Page) => page.getByRole("region", { name: "What this company’s inputs cost" });
const mentioned = (page: Page) => section(page).getByRole("list", { name: /What the report mentions/ }).locator(":scope > li");

async function linkSteel(page: Page) {
  await mentioned(page).nth(suggestions.indexOf(steel!)).locator("summary").click();
  await section(page).getByRole("button", { name: "This sentence shows it buys steel: link the index" }).first().click();
  await expect(section(page).getByRole("table", { name: "Inputs you linked (1)" })).toBeVisible();
}

test("lists what the report mentions from the library, most mentioned first, and links nothing on its own", async ({ page }) => {
  await page.goto(INPUTS);
  await expect(mentioned(page)).toHaveCount(suggestions.length);
  for (const [index, suggestion] of suggestions.entries()) {
    const series = library.series.find((entry) => entry.id === suggestion.seriesId)!;
    await expect(mentioned(page).nth(index), series.name).toContainText(`${series.name}${suggestion.count} ${suggestion.count === 1 ? "mention" : "mentions"}`);
  }
  await expect(section(page)).toContainText("A mention is not a purchase");
  await expect(section(page)).toContainText("None linked yet.");
  expect(await stored(page)).toEqual([]);
});

test("links an index through the sentence the learner chooses, shows its change by fiscal year, and keeps both", async ({ page }) => {
  await page.goto(INPUTS);
  await linkSteel(page);

  const row = section(page).getByRole("table", { name: "Inputs you linked (1)" }).getByRole("row").filter({ hasText: steelSeries.title });
  await expect(row).toHaveCount(1);
  await expect(row.getByRole("cell").nth(0)).toContainText(expectedChanges[0]);
  await expect(row.getByRole("cell").nth(1)).toContainText(expectedChanges[1]);
  await expect(section(page).getByRole("button", { name: "Steel is linked through this sentence" })).toBeDisabled();

  await expect.poll(async () => (await stored(page))[0]?.inputs.length ?? 0).toBe(1);
  const [investigation] = await stored(page);
  expect(investigation.company).toBe("Atkore Inc.");
  expect(investigation.inputs[0].seriesId).toBe("WPU1017");
  expect(investigation.passages.find((passage) => passage.id === investigation.inputs[0].passageId)?.quote).toBe(buying.quote);
});

test("opens the linked sentence in the report, marked", async ({ page }) => {
  await page.goto(INPUTS);
  await linkSteel(page);
  const href = await section(page).getByRole("table", { name: "Inputs you linked (1)" }).locator('a[href*="section="]').getAttribute("href");
  await page.goto(`${REPORT.split("?")[0]}${href}`);
  await expect(page.locator("mark")).toHaveText(buying.quote);
});

test("unlinks an index and keeps the sentence it rested on", async ({ page }) => {
  await page.goto(INPUTS);
  await linkSteel(page);
  await section(page).getByRole("button", { name: "Unlink Steel" }).click();
  await expect(section(page)).toContainText("None linked yet.");
  await expect.poll(async () => (await stored(page))[0]?.inputs.length ?? -1).toBe(0);
  expect((await stored(page))[0].passages).toHaveLength(1);
});

test("says moving together is not proof, draws the linked index and names its source", async ({ page }) => {
  await page.goto(INPUTS);
  await linkSteel(page);
  await expect(section(page).getByText("Moving the same way is not proof, and moving differently is not disproof.")).toBeVisible();
  await expect(section(page).getByRole("img", { name: `fiscal ${fiscal.fiscalYear - 2}'s average set to 100` })).toBeVisible();
  await expect(section(page).getByRole("link", { name: `BLS WPU1017: ${steelSeries.title}` })).toHaveAttribute("href", "https://data.bls.gov/timeseries/WPU1017");
  await expect(section(page)).toContainText("Source: US Bureau of Labor Statistics");
});

test("fits a phone: no sideways scroll, every change on screen, and the chart open on its latest months", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(INPUTS);
  await linkSteel(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  const cells = section(page).getByRole("table", { name: "Inputs you linked (1)" }).getByRole("cell");
  for (const index of [0, 1]) {
    const box = await cells.nth(index).boundingBox();
    expect(box ? box.x + box.width : Infinity).toBeLessThanOrEqual(390);
  }
  const edges = await section(page).getByRole("img", { name: /average set to 100/ }).evaluate((svg) => ({
    chart: svg.getBoundingClientRect().right,
    frame: (svg.parentElement as HTMLElement).getBoundingClientRect().right,
  }));
  expect(edges.chart).toBeLessThanOrEqual(edges.frame + 1);
});

test("keeps the tab within the screen budget at 1440, with an index linked", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(INPUTS);
  await linkSteel(page);
  // The sentences open for linking are closed again, as a learner arriving at the tab would find them.
  await mentioned(page).nth(suggestions.indexOf(steel!)).locator("summary").click();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1_350);
});
