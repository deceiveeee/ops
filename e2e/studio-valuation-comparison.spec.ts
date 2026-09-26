import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createStudioProject } from "../lib/studio-project/create";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { newValuation, type ValuationCase } from "../lib/studio-project/valuation-cases";

const NOW = "2026-09-25T12:00:00.000Z";
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
const comparison = (page: Page) => page.getByRole("region", { name: "Compare for this valuation", exact: true });
const estimateSummary = (page: Page) => comparison(page).locator('[aria-label="Summary of saved estimates"]');

async function scenarioAction(page: Page, name: string) {
  const action = page.getByRole("button", { name, exact: true });
  if (!await action.isVisible()) await page.getByText("Scenario options", { exact: true }).click();
  await action.click();
}

/** Invented financial cases, with deliberately different identity/source metadata. */
function savedCases(): ValuationCase[] {
  const base: ValuationCase = {
    ...newValuation(true, NOW), id: "comparison-base", name: "Steady growth", company: "OPS comparison company", ticker: "OPS", cik: "0000001234", example: false,
    inputs: { nopat: "1500", debt: "3000", cash: "1000", shares: "1000", receipt: "1", growth: "2", returnOnCapital: "20", costOfCapital: "10", price: "15" },
    priceAsOf: "2026-09-24", reasoning: "Invented figures for this browser test; steady reinvestment assumptions.",
    source: { url: "https://www.sec.gov/Archives/comparison-example.htm", periodEnd: "2025-12-31", fetchedAt: NOW, sharesConcept: "TestShares", figures: [{ key: "operatingProfit", value: 2_000_000_000, concepts: ["TestOperatingProfit"] }] },
  };
  return [
    base,
    { ...base, id: "comparison-equivalent", name: "No growth, same figures", inputs: { ...base.inputs, nopat: "1,500", debt: "3,000", cash: "1,000", shares: "1,000", receipt: "1.0", growth: "0" } },
    { ...base, id: "comparison-changed", name: "Different report and traded share", ticker: "OPS.A", inputs: { ...base.inputs, nopat: "1800", receipt: "100", growth: "3", returnOnCapital: "15", costOfCapital: "12" }, source: { ...base.source!, periodEnd: "2024-12-31" }, reasoning: "A separate source year and 100 company shares per traded share." },
    { ...base, id: "comparison-incomplete", name: "Growth still missing", inputs: { ...base.inputs, nopat: "900000", growth: "" } },
    { ...base, id: "comparison-high", name: "Higher growth, lower cost", inputs: { ...base.inputs, growth: "5", returnOnCapital: "20", costOfCapital: "8" } },
    // The same display name must not combine distinct SEC company identities.
    { ...base, id: "comparison-other-company", name: "Other company estimate", cik: "0000005678", inputs: { ...base.inputs, nopat: "9000000" } },
  ];
}

/** Seed only the fresh test context, using the production project's database envelope. */
async function openSavedCases(page: Page, cases: ValuationCase[], current = cases[0].id) {
  const project = { ...createStudioProject("practice", NOW), valuations: cases };
  const backup = exportProjectBackup(project);
  if (!backup.ok) throw new Error(backup.error);
  await page.goto("/studio/valuation");
  await expect(page.getByRole("button", { name: "Try a worked example" })).toBeVisible();
  await saved(page);
  await page.evaluate(async (raw) => {
    window.localStorage.setItem("ops-studio-mode", "practice");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("ops-studio-projects");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("projects", "readwrite");
      transaction.objectStore("projects").put({ mode: "practice", revision: "valuation-comparison-test", raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, backup.raw);
  await page.goto(`/studio/valuation?case=${current}`);
  await expect(page.getByRole("combobox", { name: "Saved scenario", exact: true })).toHaveValue(current);
}

async function storedCases(page: Page): Promise<ValuationCase[]> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("ops-studio-projects");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const raw = await new Promise<string>((resolve, reject) => {
      const request = db.transaction("projects", "readonly").objectStore("projects").get("practice");
      request.onsuccess = () => resolve(request.result.raw);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return JSON.parse(raw).valuations;
  });
}

test("compares every saved company case, then opens and copies an exact scenario without altering its source", async ({ page }) => {
  const cases = savedCases();
  let figureRequests = 0;
  await page.route("**/api/studio/peer-figures*", (route) => { figureRequests += 1; return route.abort(); });
  await openSavedCases(page, cases);
  await scenarioAction(page, "Compare scenarios");
  const panel = comparison(page);
  // The $35.50 maximum is on page two; another unit's $1,400 and the huge incomplete/other-company cases cannot widen this range.
  await expect(estimateSummary(page)).toContainText("$13.00 – $35.50");
  await expect(estimateSummary(page)).toContainText("3 comparable · 1 other basis · 1 needs inputs");
  await expect(panel.getByRole("button", { name: /^Open scenario / })).toHaveCount(3);
  await expect(panel.getByRole("button", { name: "Open scenario Other company estimate", exact: true })).toHaveCount(0);
  await expect(panel.getByRole("columnheader", { name: "Growth", exact: true })).toBeVisible();
  await expect(panel.getByRole("columnheader", { name: "Return on new capital", exact: true })).toBeVisible();
  await expect(panel.getByRole("columnheader", { name: "Cost of capital", exact: true })).toBeVisible();
  const equivalent = panel.getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario No growth, same figures", exact: true }) });
  await expect(equivalent).toContainText("Same financial figures");
  await expect(equivalent.getByRole("cell").last().locator('[aria-hidden="true"]')).toHaveCount(1);
  await expect(equivalent.getByRole("cell").nth(0)).toContainText("0%");
  await expect(equivalent.getByRole("cell").nth(1)).toContainText("20%");
  await expect(equivalent.getByRole("cell").nth(2)).toContainText("10%");
  const changed = panel.getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario Different report and traded share", exact: true }) });
  await expect(changed).toContainText("Financial figures differ");
  await expect(changed).toContainText("Traded-share basis differs");
  await expect(changed).toContainText("Report dates differ");
  await expect(changed).toContainText("$1,400.00");
  await expect(changed).toContainText("Other basis: OPS.A · 100:1");
  await expect(changed.getByRole("cell").last().locator('[aria-hidden="true"]')).toHaveCount(0);
  await panel.getByRole("button", { name: "Next cases", exact: true }).click();
  await expect(panel).toContainText("4–5 of 5");
  await expect(panel.getByRole("button", { name: /^Open scenario / })).toHaveCount(2);
  await expect(panel.getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario Growth still missing", exact: true }) })).toContainText("Needs inputs");
  await expect(panel.getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario Higher growth, lower cost", exact: true }) })).toContainText("$35.50");
  await expect(panel.getByRole("button", { name: "Next cases", exact: true })).toBeDisabled();
  await expect(panel).toContainText("$13.00 – $35.50");
  await panel.getByRole("button", { name: "Previous cases", exact: true }).click();

  // Opening the already-current row must leave Compare and focus a usable assumption.
  await panel.getByRole("button", { name: "Open scenario Steady growth", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Growth each year (%)", { exact: true })).toBeFocused();
  await scenarioAction(page, "Compare scenarios");
  await panel.getByRole("button", { name: "Open scenario Different report and traded share", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("combobox", { name: "Saved scenario", exact: true })).toBeFocused();
  await expect(page).toHaveURL(/\?case=comparison-changed$/);
  await expect(page.getByLabel("Growth each year (%)", { exact: true })).toHaveValue("3");
  await expect(page.getByLabel("Return on new capital (%)", { exact: true })).toHaveValue("15");
  await expect(page.getByLabel("Cost of capital (%)", { exact: true })).toHaveValue("12");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Saved scenario", exact: true })).toHaveValue("comparison-changed");
  await scenarioAction(page, "Sources");
  await expect(page.getByRole("link", { name: "SEC filing · year to 2024-12-31", exact: true })).toHaveAttribute("href", cases[2].source!.url);
  expect(await storedCases(page)).toEqual(cases);
  expect(figureRequests).toBe(0);

  await scenarioAction(page, "Compare scenarios");
  await expect(estimateSummary(page)).toContainText("$1,400.00");
  await expect(estimateSummary(page)).toContainText("1 comparable · 3 other basis · 1 needs inputs");
  await panel.getByRole("button", { name: "Copy scenario", exact: true }).click();
  await saved(page);
  const copied = await storedCases(page);
  expect(copied.slice(0, cases.length)).toEqual(cases);
  expect(copied).toHaveLength(cases.length + 1);
  expect(copied.at(-1)).toMatchObject({ name: `${cases[2].name} copy`, inputs: cases[2].inputs, source: cases[2].source, reasoning: cases[2].reasoning, priceAsOf: cases[2].priceAsOf });
  expect(copied.at(-1)!.id).not.toBe(cases[2].id);
  await expect(page.getByRole("combobox", { name: "Saved scenario", exact: true })).toHaveValue(copied.at(-1)!.id);
});

for (const difference of ["ticker", "ratio"] as const) {
  test(`a ${difference}-only share-basis difference is excluded from the common range and bars`, async ({ page }) => {
    const [base, equivalent] = savedCases();
    const other: ValuationCase = {
      ...base, id: "comparison-other-basis", name: "Another traded-share basis",
      ticker: difference === "ticker" ? "OPS.B" : base.ticker,
      inputs: { ...base.inputs, receipt: difference === "ratio" ? "100" : base.inputs.receipt },
    };
    await openSavedCases(page, [base, equivalent, other]);
    await scenarioAction(page, "Compare scenarios");
    await expect(estimateSummary(page)).toContainText("$13.00 – $14.88");
    await expect(estimateSummary(page)).toContainText("2 comparable · 1 other basis · 0 need inputs");
    const row = comparison(page).getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario Another traded-share basis", exact: true }) });
    await expect(row).toContainText("Traded-share basis differs");
    await expect(row).not.toContainText("Financial figures differ");
    await expect(row).toContainText(`Other basis: ${other.ticker} · ${other.inputs.receipt}:1`);
    await expect(row.getByRole("cell").last().locator('[aria-hidden="true"]')).toHaveCount(0);
  });
}

for (const invalidRatio of ["0", "Infinity"]) {
  test(`matching invalid share ratios (${invalidRatio}) do not establish a comparison basis`, async ({ page }) => {
    const base = savedCases()[0];
    const invalid = { ...base, inputs: { ...base.inputs, receipt: invalidRatio } };
    await openSavedCases(page, [invalid, { ...invalid, id: "comparison-invalid-ratio", name: "Another invalid ratio" }, { ...base, id: "comparison-valid-ratio", name: "Confirmed ratio" }]);
    await scenarioAction(page, "Compare scenarios");
    await expect(estimateSummary(page)).toContainText("No estimate yet");
    await expect(estimateSummary(page)).toContainText("0 comparable · 1 other basis · 2 need inputs");
    await expect(estimateSummary(page)).toContainText("Confirm the current share ratio in Figures");
    const invalidRow = comparison(page).getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario Another invalid ratio", exact: true }) });
    await expect(invalidRow).toContainText("Traded-share basis differs");
  });
}

test("a single unfinished scenario has no invented estimate or empty pagination", async ({ page }) => {
  const unfinished = { ...newValuation(false, NOW), id: "comparison-blank", company: "Unfinished company", name: "Starting figures" };
  await openSavedCases(page, [unfinished]);
  await scenarioAction(page, "Compare scenarios");
  const panel = comparison(page);
  await expect(panel).toContainText("No estimate yet");
  await expect(panel).toContainText("1 needs inputs");
  await expect(panel).toContainText("Copy a scenario and change an assumption");
  await expect(panel.getByRole("button", { name: /^Open scenario / })).toHaveCount(1);
  await expect(panel.getByRole("navigation", { name: "Scenario pages" })).toHaveCount(0);
  const row = panel.getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario Starting figures", exact: true }) });
  for (const index of [0, 1, 2]) await expect(row.getByRole("cell").nth(index)).toContainText("—");
  await expect(row).toContainText("Needs inputs");
  expect(await storedCases(page)).toEqual([unfinished]);
});

test("three dense comparison rows fit all six widths with visible rates and differences", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openSavedCases(page, savedCases());
  await scenarioAction(page, "Compare scenarios");
  const panel = comparison(page);
  const report = ["# Valuation comparison", "", "Three visible scenarios, all three rates, different financial figures, traded-share basis and report dates.", ""];
  mkdirSync(".agent-shots", { recursive: true });
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(panel.getByRole("button", { name: /^Open scenario / })).toHaveCount(3);
    const changed = panel.getByRole("row").filter({ has: page.getByRole("button", { name: "Open scenario Different report and traded share", exact: true }) });
    await expect(changed.getByText("Financial figures differ · Traded-share basis differs · Report dates differ", { exact: true })).toBeVisible();
    for (const index of [0, 1, 2]) await expect(changed.getByRole("cell").nth(index)).toBeVisible();
    await page.screenshot({ path: `.agent-shots/valuation-comparison-${width}.png`, fullPage: true });
    const size = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    report.push(`- ${width}px: ${size.screens.toFixed(2)} screens; overflow ${size.overflow}px`);
    expect.soft(size.screens).toBeLessThanOrEqual(1.5);
    expect.soft(size.overflow).toBe(0);
  }
  report.push("", `Page errors: ${errors.length}`);
  writeFileSync(".agent-shots/valuation-comparison-report.md", report.join("\n"));
  expect(errors).toEqual([]);
});
