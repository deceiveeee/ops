import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createStudioProject } from "../lib/studio-project/create";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { newValuation, type ValuationCase } from "../lib/studio-project/valuation-cases";

const NOW = "2026-09-25T12:00:00.000Z";
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
const sensitivity = (page: Page) => page.getByRole("region", { name: "Sensitivity for this valuation", exact: true });
const preview = (page: Page) => page.getByRole("region", { name: "Selected assumption preview", exact: true });
const cell = (page: Page, name: string) => sensitivity(page).getByRole("button", { name, exact: true });

async function scenarioAction(page: Page, name: string) {
  const action = page.getByRole("button", { name, exact: true });
  if (!await action.isVisible()) await page.getByText("Scenario options", { exact: true }).click();
  await action.click();
}

/** Invented figures: 1,500 profit, 3,000 borrowings, 1,000 cash, 1,000 shares, 20% return on new capital. */
function savedCases(): ValuationCase[] {
  const base: ValuationCase = {
    ...newValuation(true, NOW), id: "sensitivity-base", name: "Steady growth", company: "OPS sensitivity company", ticker: "OPS", cik: "0000004321", example: false,
    inputs: { nopat: "1500", debt: "3000", cash: "1000", shares: "1000", receipt: "1", growth: "2", returnOnCapital: "20", costOfCapital: "10", price: "15" },
    priceAsOf: "2026-09-24", reasoning: "Invented figures for this browser test.",
    source: { url: "https://www.sec.gov/Archives/sensitivity-example.htm", periodEnd: "2025-12-31", fetchedAt: NOW, sharesConcept: "TestShares", figures: [{ key: "operatingProfit", value: 2_000_000_000, concepts: ["TestOperatingProfit"] }] },
  };
  return [
    base,
    { ...base, id: "sensitivity-near", name: "Growth near its cost", inputs: { ...base.inputs, growth: "5", costOfCapital: "8" } },
    { ...base, id: "sensitivity-incomplete", name: "Growth still missing", inputs: { ...base.inputs, growth: "" } },
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
      transaction.objectStore("projects").put({ mode: "practice", revision: "valuation-sensitivity-test", raw });
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

test("tests nearby assumptions, previews one, and saves it as a separate scenario", async ({ page }) => {
  const cases = savedCases();
  await openSavedCases(page, cases);
  await scenarioAction(page, "Test assumptions");
  await expect(page.getByRole("heading", { name: "How much does the value change?", exact: true })).toBeFocused();
  await expect(sensitivity(page)).toContainText("the 20% return on new capital stay fixed");

  // Worked by hand: cash flow = 1,500 × (1 − growth ÷ 20%); value = cash flow ÷ (cost − growth);
  // per share = (value − 3,000 + 1,000) ÷ 1,000. For example 1,275 ÷ 6% = 21,250 → $19.25.
  const expected: [string, string, string][] = [
    ["1%", "9%", "$15.81"], ["1%", "10%", "$13.83"], ["1%", "11%", "$12.25"],
    ["2%", "9%", "$17.29"], ["2%", "10%", "$14.88"], ["2%", "11%", "$13.00"],
    ["3%", "9%", "$19.25"], ["3%", "10%", "$16.21"], ["3%", "11%", "$13.94"],
  ];
  await expect(sensitivity(page).getByRole("table").getByRole("button")).toHaveCount(9);
  for (const [growth, cost, value] of expected) {
    const current = growth === "2%" && cost === "10%" ? ", current case" : "";
    await expect(cell(page, `${growth} growth, ${cost} cost of capital: ${value}${current}`)).toBeVisible();
  }
  const centre = cell(page, "2% growth, 10% cost of capital: $14.88, current case");
  await expect(centre).toHaveAttribute("aria-pressed", "true");
  await expect(preview(page)).toContainText("Current case");
  await expect(preview(page).getByRole("button", { name: "Save as new scenario", exact: true })).toBeDisabled();

  // The keyboard selects a cell as a click would.
  const chosen = cell(page, "3% growth, 9% cost of capital: $19.25");
  await chosen.focus();
  await page.keyboard.press("Enter");
  await expect(chosen).toHaveAttribute("aria-pressed", "true");
  await expect(centre).toHaveAttribute("aria-pressed", "false");
  await expect(preview(page)).toContainText("Preview only");
  await expect(preview(page)).toContainText("3% growth · 9% cost of capital");
  await expect(preview(page)).toContainText("$19.25");
  await expect(preview(page)).toContainText("$4.38 above the current estimate of $14.88.");
  // Previewing alone changes nothing that is saved.
  expect(await storedCases(page)).toEqual(cases);

  await preview(page).getByRole("button", { name: "Save as new scenario", exact: true }).click();
  await saved(page);
  const stored = await storedCases(page);
  expect(stored.slice(0, cases.length)).toEqual(cases);
  expect(stored).toHaveLength(cases.length + 1);
  const copy = stored.at(-1)!;
  expect(copy.id).not.toBe(cases[0].id);
  expect(copy).toMatchObject({
    name: "Steady growth · 3% growth, 9% cost",
    inputs: { ...cases[0].inputs, growth: "3", costOfCapital: "9" },
    source: cases[0].source, company: cases[0].company, ticker: cases[0].ticker, cik: cases[0].cik, priceAsOf: cases[0].priceAsOf,
  });
  expect(copy.reasoning).toContain("Assumption test copied from Steady growth.");
  expect(copy.reasoning).toContain(cases[0].reasoning);
  await expect(page.getByRole("combobox", { name: "Saved scenario", exact: true })).toHaveValue(copy.id);
});

test("a wider step can reach the model's limit, which is explained and cannot be saved", async ({ page }) => {
  await openSavedCases(page, savedCases(), "sensitivity-near");
  await scenarioAction(page, "Test assumptions");
  await cell(page, "6% growth, 7% cost of capital: $103.00").click();
  await sensitivity(page).getByLabel("Change by").selectOption({ label: "2 percentage points" });
  // Changing the step returns the selection to the saved assumptions.
  await expect(cell(page, "5% growth, 8% cost of capital: $35.50, current case")).toHaveAttribute("aria-pressed", "true");
  await expect(cell(page, "5% growth, 6% cost of capital: $110.50")).toBeVisible();
  await expect(cell(page, "7% growth, 8% cost of capital: $95.50")).toBeVisible();

  const beyond = cell(page, "7% growth, 6% cost of capital: outside model");
  await expect(beyond).toContainText("Outside model");
  await beyond.click();
  await expect(preview(page)).toContainText("Nothing grows at or above its cost of capital");
  await expect(preview(page).getByRole("button", { name: "Save as new scenario", exact: true })).toBeDisabled();
});

test("an unfinished scenario has no grid and leads back to the missing input", async ({ page }) => {
  await openSavedCases(page, savedCases(), "sensitivity-incomplete");
  await scenarioAction(page, "Test assumptions");
  await expect(sensitivity(page)).toContainText("Complete a valid starting case to test nearby assumptions.");
  await expect(sensitivity(page).getByRole("table")).toHaveCount(0);
  await sensitivity(page).getByRole("button", { name: "Review inputs", exact: true }).click();
  await expect(page.getByLabel("Growth each year (%)", { exact: true })).toBeFocused();
});

test("the grid and preview fit all six widths without breaking a value", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openSavedCases(page, savedCases(), "sensitivity-near");
  await scenarioAction(page, "Test assumptions");
  // The widest one-point value for this case: 6% growth at 7% cost.
  await cell(page, "6% growth, 7% cost of capital: $103.00").click();
  const report = ["# Valuation sensitivity", "", "Nine cells (widest value $103.00) with a selected preview.", ""];
  mkdirSync(".agent-shots", { recursive: true });
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(preview(page)).toContainText("$103.00");
    await expect(preview(page).getByRole("button", { name: "Save as new scenario", exact: true })).toBeVisible();
    await page.screenshot({ path: `.agent-shots/valuation-sensitivity-${width}.png`, fullPage: true });
    const size = await page.evaluate(() => {
      const panel = document.querySelector('[aria-label="Sensitivity for this valuation"]')!;
      // A value is broken if it wraps onto a second line or spills out of its cell.
      const broken = [...panel.querySelectorAll("table button strong")].filter((value) => {
        const button = value.parentElement!;
        const lineHeight = parseFloat(getComputedStyle(value).lineHeight) || parseFloat(getComputedStyle(value).fontSize) * 1.3;
        return value.getBoundingClientRect().height > lineHeight * 1.5 || button.scrollWidth > button.clientWidth;
      }).map((value) => value.textContent);
      return { screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, broken };
    });
    report.push(`- ${width}px: ${size.screens.toFixed(2)} screens; overflow ${size.overflow}px; broken values ${size.broken.length ? size.broken.join(", ") : "none"}`);
    expect.soft(size.screens).toBeLessThanOrEqual(1.5);
    expect.soft(size.overflow).toBe(0);
    expect.soft(size.broken).toEqual([]);
  }
  report.push("", `Page errors: ${errors.length}`);
  writeFileSync(".agent-shots/valuation-sensitivity-report.md", report.join("\n"));
  expect(errors).toEqual([]);
});
