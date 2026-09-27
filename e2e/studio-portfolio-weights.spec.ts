import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { createStudioProject } from "../lib/studio-project/create";
import { emptyLimits } from "../lib/studio-project/limits";
import { addPosition } from "../lib/studio-project/operations";
import { saveWeightProposal } from "../lib/studio-project/portfolio-weights";
import type { StudioProject } from "../lib/studio-project/schema";
import { newValuation, type ValuationCase } from "../lib/studio-project/valuation-cases";

const NOW = "2026-09-25T12:00:00.000Z";
const ROUTE = "/studio/portfolio/weights";
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
const picker = (page: Page) => page.getByRole("combobox", { name: "Start from allocation", exact: true });
const view = (page: Page, name: "Weights" | "Limits" | "Loss scenario") => page.getByRole("tab", { name, exact: true });
const appleRow = (page: Page) => page.getByRole("table", { name: "Saved and proposed weights after the cash reserve", exact: true }).getByRole("row").filter({ has: page.getByRole("rowheader", { name: /^AAPL/ }) });

/** Three holdings with deliberately invented valuation inputs, never a market quote. */
function fixture(): StudioProject {
  let project = createStudioProject("practice", NOW);
  for (const id of ["aapl", "vti", "agg"]) project = addPosition(project, id, undefined, NOW);
  const base: ValuationCase = {
    ...newValuation(true, NOW), id: "weights-apple", company: "Apple Inc.", ticker: "AAPL", cik: "0000320193",
    name: "Apple base case", example: false, reasoning: "Invented figures for the portfolio weights browser test.",
    inputs: { nopat: "1500", debt: "3000", cash: "1000", shares: "1000", receipt: "1", growth: "2", returnOnCapital: "20", costOfCapital: "10", price: "15" },
    priceAsOf: "2026-09-24", source: null,
  };
  return {
    ...project,
    goal: { ...project.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 },
    stress: { usStocksPct: -30, internationalStocksPct: -40, globalStocksPct: -35, bondsPct: -10, cashPct: 0 },
    limits: { ...emptyLimits(), companyCapPct: 5, lossCapacityPct: 15 },
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative, name: "Original allocation",
      positions: alternative.positions.map((position, index) => ({ ...position, targetWeightPct: [10, 50, 25][index] })),
    })),
    valuations: [
      base,
      { ...base, id: "weights-wrong-issuer", name: "Wrong issuer", cik: "1046179" },
      { ...base, id: "weights-wrong-unit", name: "Wrong traded share", inputs: { ...base.inputs, receipt: "5" } },
      { ...base, id: "weights-example", name: "Worked example", example: true },
    ],
  };
}

/** Seed only a new browser-test context with the production backup envelope. */
async function openFixture(page: Page, project = fixture()) {
  const backup = exportProjectBackup(project);
  if (!backup.ok) throw new Error(backup.error);
  await page.goto(ROUTE);
  await expect(page.getByRole("heading", { name: "Compare allocations", exact: true })).toBeVisible();
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
      transaction.objectStore("projects").put({ mode: "practice", revision: "portfolio-weights-test", raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, backup.raw);
  await page.reload();
  await expect(page.getByLabel("AAPL proposed percentage", { exact: true })).toHaveValue("10");
  await saved(page);
  return storedProject(page);
}

async function storedProject(page: Page): Promise<StudioProject> {
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
    return JSON.parse(raw);
  });
}

async function openEvidence(page: Page) {
  await view(page, "Weights").click();
  await appleRow(page).getByRole("button", { name: /^(Add valuation|Valuation kept) for AAPL$/ }).click();
  await expect(page.getByRole("heading", { name: "Keep the valuation you used", exact: true })).toBeFocused();
}

test("previews weights, explains limits and scenario dollars, then saves and explicitly chooses a proposal", async ({ page }) => {
  const original = await openFixture(page);
  await expect(picker(page)).not.toBeFocused();
  await expect(appleRow(page).getByRole("button", { name: "Add valuation for AAPL", exact: true })).toBeVisible();
  await expect(appleRow(page)).toContainText("$8,000 · 8% of all money");
  await expect(page.getByLabel("Cash and investment comparison", { exact: true })).toContainText("$32,000 cash · 32%");
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("6.25");
  await expect(appleRow(page)).toContainText("$5,000 · 5% of all money");
  await expect(appleRow(page).getByRole("cell").first()).toHaveText("10%");
  await expect(page.getByText("Preview only · not saved", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Cash and investment comparison", { exact: true })).toContainText("$35,000 cash · 35%");
  expect(await storedProject(page)).toEqual(original);

  await view(page, "Limits").click();
  const checks = page.getByRole("table", { name: "Selected and proposed allocation limit checks", exact: true });
  await expect(checks.getByRole("row").filter({ hasText: "No holding is over its cap" }).getByRole("cell")).toHaveText(["Not met", "Met"]);
  await expect(checks.getByRole("row").filter({ hasText: "The scenario stays within your loss budget" }).getByRole("cell")).toHaveText(["Not met", "Not met"]);
  await expect(page.getByText("This allocation loses $15,500 in the scenario.", { exact: false })).toBeVisible();
  const checkPicker = page.getByRole("combobox", { name: "Explain a check", exact: true });
  await expect(checkPicker.getByRole("option")).toHaveText(["Bills", "Slice ranges", "Holding caps", "Loss budget"]);
  await checkPicker.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(checkPicker).toHaveValue("caps");
  await expect(page.getByText("No company above 5%.", { exact: false })).toBeVisible();

  await view(page, "Loss scenario").click();
  const contributions = page.getByRole("table", { name: "Contribution to the scenario change, largest first", exact: true });
  // Original: $8k*30% + $40k*30% + $20k*10% = $16,400.
  // Proposal: $5k*30% + $40k*30% + $20k*10% = $15,500; $35k cash at 0% adds $0.
  const rows = [
    ["AAPL", "-$2,400-2.4 points", "-$1,500-1.5 points"],
    ["VTI", "-$12,000-12 points", "-$12,000-12 points"],
    ["AGG", "-$2,000-2 points", "-$2,000-2 points"],
    ["Cash reserve + unassigned", "$00 points", "$00 points"],
  ];
  for (const [name, before, after] of rows) {
    const row = contributions.getByRole("row").filter({ has: page.getByRole("rowheader", { name, exact: true }) });
    await expect(row.getByRole("cell")).toHaveText([before, after]);
  }
  const scenario = page.getByRole("tabpanel", { name: "Loss scenario", exact: true });
  await expect(scenario).toContainText("-$16,400");
  await expect(scenario).toContainText("-16.4% of all money");
  await expect(scenario).toContainText("-$15,500");
  await expect(scenario).toContainText("-15.5% of all money");

  await openEvidence(page);
  const valuations = page.getByRole("combobox", { name: "Saved valuation", exact: true });
  await expect(valuations.getByRole("option")).toHaveText(["No valuation attached", "Apple base case · AAPL"]);
  await valuations.selectOption("weights-apple");
  await expect(page.getByText("1 company share per traded share · saved 2026-09-25.", { exact: true })).toBeVisible();
  await expect(page.getByText("2% growth · 20% return on new capital · 10% cost of capital.", { exact: true })).toBeVisible();
  await expect(page.getByText("Price you entered: $15.00 on Sep 24, 2026.", { exact: true })).toBeVisible();
  await expect(page.getByText("1 company share per traded share · saved Sep 25, 2026.", { exact: true })).toBeVisible();
  expect(await storedProject(page)).toEqual(original);

  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  await page.getByLabel("Proposal name", { exact: true }).fill("Lower company concentration");
  await page.getByLabel("Why these weights?", { exact: true }).fill("Reduce Apple to my 5% cap while keeping the remaining loss-budget breach visible.");
  await expect(page.getByRole("region", { name: "Keep for this allocation", exact: true })).toContainText("1 limit not met · 2 not checked.");
  await page.getByRole("button", { name: "Save proposal", exact: true }).click();
  await expect(picker(page).getByRole("option")).toHaveCount(2);
  await expect(page.getByText("Saved as a separate proposal. Your selected allocation has not changed.", { exact: true })).toBeVisible();
  await saved(page);
  const afterSave = await storedProject(page);
  const proposal = afterSave.alternatives[1];
  expect(afterSave.selectedAlternativeId).toBe(original.selectedAlternativeId);
  expect(afterSave.alternatives[0]).toEqual(original.alternatives[0]);
  expect(afterSave.decisions).toEqual(original.decisions);
  expect(proposal.positions.map((holding) => holding.targetWeightPct)).toEqual([6.25, 50, 25]);
  expect(proposal.valuationLinks).toEqual([{ instrumentId: "aapl", snapshot: original.valuations![0] }]);
  await expect(picker(page)).toHaveValue(proposal.id);

  await page.reload();
  await expect(picker(page)).toHaveValue(proposal.id);
  await view(page, "Weights").click();
  await expect(page.getByLabel("AAPL proposed percentage", { exact: true })).toHaveValue("6.25");
  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  const decisionReason = "Choose the smaller company holding; review the remaining $500 scenario loss-budget excess.";
  await page.getByLabel("Why these weights?", { exact: true }).fill(decisionReason);
  await page.getByRole("button", { name: "Use this allocation", exact: true }).click();
  await expect(page.getByText("This is now your selected allocation. Your other allocations remain saved.", { exact: true })).toBeVisible();
  await expect(picker(page)).toBeFocused();
  // Nothing is left to save: the page must not offer a duplicate of what was just chosen.
  await expect(page.getByText("Your selected allocation", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save proposal", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Use this allocation", exact: true })).toHaveCount(0);
  await saved(page);
  const chosen = await storedProject(page);
  expect(chosen.selectedAlternativeId).toBe(proposal.id);
  expect(chosen.alternatives).toHaveLength(2);
  expect(chosen.alternatives[0]).toEqual(original.alternatives[0]);
  expect(chosen.decisions.at(-1)).toMatchObject({ reason: decisionReason, affects: [original.alternatives[0].id, proposal.id] });

  // Change the live valuation through its normal form. The proposal still holds
  // its original evidence and explicitly flags that the saved version is older.
  await page.goto("/studio/valuation?case=weights-apple");
  await expect(page.getByRole("combobox", { name: "Saved scenario", exact: true })).toHaveValue("weights-apple");
  await page.getByLabel("Growth each year (%)", { exact: true }).fill("3");
  await expect.poll(async () => (await storedProject(page)).valuations?.find((value) => value.id === "weights-apple")?.inputs.growth).toBe("3");
  await page.goto(`${ROUTE}?proposal=${proposal.id}`);
  await expect(picker(page)).toHaveValue(proposal.id);
  await openEvidence(page);
  await expect(page.getByText("Valuation changed · review this saved version", { exact: true })).toBeVisible();
  await expect(page.getByText("2% growth · 20% return on new capital · 10% cost of capital.", { exact: true })).toBeVisible();
  const final = await storedProject(page);
  expect(final.alternatives[1].valuationLinks![0].snapshot).toEqual(original.valuations![0]);
});

test("opens the matching holding from valuation without changing saved allocations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const original = await openFixture(page);
  await page.goto("/studio/valuation?case=weights-apple");
  await expect(page.getByRole("combobox", { name: "Saved scenario", exact: true })).toHaveValue("weights-apple");
  await page.getByRole("tab", { name: "Value and price", exact: true }).click();
  const link = page.getByRole("link", { name: "Compare allocations →", exact: true });
  await expect(link).toHaveAttribute("href", "/studio/portfolio/weights?valuation=weights-apple");
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/portfolio\/weights\?valuation=weights-apple$/);
  await expect(page.getByRole("heading", { name: "Keep the valuation you used", exact: true })).toBeFocused();
  await expect(page.getByRole("combobox", { name: "Company holding", exact: true })).toHaveValue("aapl");
  const valuation = page.getByRole("combobox", { name: "Saved valuation", exact: true });
  await expect(valuation).toHaveValue("");
  await valuation.selectOption("weights-apple");
  await expect(page.getByText("Preview of the valuation to keep", { exact: true })).toBeVisible();
  await view(page, "Weights").click();
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("6.25");
  await expect(appleRow(page)).toContainText("$5,000 · 5% of all money");
  expect(await storedProject(page)).toEqual(original);
});

test("unfinished and excessive weights cannot be saved and tabs work from the keyboard", async ({ page }) => {
  const original = await openFixture(page);
  const weights = view(page, "Weights");
  await weights.focus();
  await page.keyboard.press("ArrowRight");
  await expect(view(page, "Limits")).toBeFocused();
  await expect(view(page, "Limits")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(view(page, "Loss scenario")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(weights).toBeFocused();
  await expect(weights).toHaveAttribute("aria-selected", "true");

  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("");
  await expect(page.getByText("Enter each weight as a number from 0 to 100. Blank weights stay unfinished.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  await page.getByLabel("Why these weights?", { exact: true }).fill("An unfinished preview must not be saved.");
  await expect(page.getByRole("button", { name: "Save proposal", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Back to weights", exact: true }).click();
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("30");
  await expect(page.getByText("Investment targets exceed 100% of the amount available after the cash reserve.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save proposal", exact: true })).toBeDisabled();
  expect(await storedProject(page)).toEqual(original);
});

test("preview edits survive visiting goals and valuation, reloading and changing portfolio mode", async ({ page }) => {
  const original = await openFixture(page);
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("6.25");
  await openEvidence(page);
  await page.getByRole("combobox", { name: "Saved valuation", exact: true }).selectOption("weights-apple");
  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  await page.getByLabel("Proposal name", { exact: true }).fill("Keep this preview");
  await page.getByLabel("Why these weights?", { exact: true }).fill("Review the limits before committing this proposal.");
  await view(page, "Limits").click();
  await page.getByRole("link", { name: "Edit limits ↗", exact: true }).click();
  await expect(page).toHaveURL(/\/studio\/goals/);
  await page.goto(ROUTE);
  await expect(page.getByLabel("AAPL proposed percentage", { exact: true })).toHaveValue("6.25");
  await openEvidence(page);
  await expect(page.getByRole("combobox", { name: "Saved valuation", exact: true })).toHaveValue("weights-apple");
  await page.getByRole("link", { name: "Open valuation →", exact: true }).click();
  await expect(page).toHaveURL(/\/studio\/valuation\?case=weights-apple/);
  await page.goto(ROUTE);
  await page.reload();
  await expect(page.getByLabel("AAPL proposed percentage", { exact: true })).toHaveValue("6.25");
  await page.getByRole("button", { name: "Your own", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Add investments to compare", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await expect(page.getByLabel("AAPL proposed percentage", { exact: true })).toHaveValue("6.25");
  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  await expect(page.getByLabel("Proposal name", { exact: true })).toHaveValue("Keep this preview");
  await expect(page.getByLabel("Why these weights?", { exact: true })).toHaveValue("Review the limits before committing this proposal.");
  expect(await storedProject(page)).toEqual(original);
  await page.getByRole("button", { name: "Back to weights", exact: true }).click();
  await page.getByRole("button", { name: "Reset preview", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("AAPL proposed percentage", { exact: true })).toHaveValue("10");
});

test("changed limits require a fresh proposal and changed buying inputs cannot be restored", async ({ page }) => {
  const start = fixture();
  const withProposal = saveWeightProposal(start, start.alternatives[0].id, {
    name: "Saved proposal", reasoning: "Smaller direct company holding.", weights: { aapl: "6.25" }, valuationCaseIds: {},
  }, NOW);
  const proposalId = withProposal.alternatives[1].id;
  withProposal.limits = { ...withProposal.limits!, companyCapPct: 4 };
  await openFixture(page, withProposal);
  await picker(page).selectOption(proposalId);
  await expect(page.getByText("Goals, limits or scenario assumptions changed since this proposal was saved.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use this allocation", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Save proposal", exact: true }).click();
  await expect(picker(page).getByRole("option")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Use this allocation", exact: true })).toBeEnabled();
  const latest = await storedProject(page);
  expect(latest.alternatives[2].comparisonBasis?.limits.companyCapPct).toBe(4);
  expect(latest.selectedAlternativeId).toBe(start.selectedAlternativeId);

  // Simulate a newer saved buying input in this isolated test context.
  latest.alternatives[0].currentCash += 500;
  await openFixture(page, latest);
  await picker(page).selectOption(latest.alternatives[2].id);
  await expect(page.getByText("Holdings or buying inputs changed. Start from the selected allocation before saving or choosing a new proposal.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use this allocation", exact: true })).toBeDisabled();
  expect((await storedProject(page)).selectedAlternativeId).toBe(start.selectedAlternativeId);
});

test("portfolio weights, checks, scenario, evidence and saving fit six screen widths", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const project = fixture();
  project.alternatives[0].name = "Original allocation for long-term goals";
  project.valuations![0].name = "Apple base case with conservative assumptions";
  await openFixture(page, project);
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("6.25");
  const report = ["# Portfolio weights visual measurements", "", "Three holdings, $100,000 budget, $20,000 reserve. Preview reduces AAPL from 8% to 5% of all money. Long allocation and valuation names exercise wrapping.", ""];
  mkdirSync(".agent-shots", { recursive: true });
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const state of ["weights", "limits", "scenario", "evidence", "keep"] as const) {
      if (state === "weights") await view(page, "Weights").click();
      else if (state === "limits") await view(page, "Limits").click();
      else if (state === "scenario") await view(page, "Loss scenario").click();
      else if (state === "evidence") {
        await openEvidence(page);
        await page.getByRole("combobox", { name: "Saved valuation", exact: true }).selectOption("weights-apple");
      } else {
        await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
        await page.getByLabel("Proposal name", { exact: true }).fill("Lower company concentration");
        await page.getByLabel("Why these weights?", { exact: true }).fill("Reduce the direct company holding to my cap, then review the remaining loss-budget excess.");
      }
      await page.screenshot({ path: `.agent-shots/portfolio-weights-${state}-${width}.png`, fullPage: true });
      const size = await page.evaluate(() => ({
        screens: document.documentElement.scrollHeight / innerHeight,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      report.push(`- ${width}px · ${state}: ${size.screens.toFixed(2)} screens; overflow ${size.overflow}px`);
      expect.soft(size.screens, `${state} at ${width}px`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `${state} at ${width}px`).toBe(0);
    }
  }
  report.push("", `Page errors: ${errors.length}`);
  writeFileSync(".agent-shots/portfolio-weights-report.md", report.join("\n"));
  expect(errors).toEqual([]);
});

/** The three-holding fixture plus TSM at 5%: one holding more than a page. */
function fourHoldings(): StudioProject {
  const project = fixture();
  return {
    ...project,
    candidates: [...project.candidates, { ...project.candidates[0], id: "cand-weights-tsm", instrumentId: "tsm" }],
    alternatives: project.alternatives.map((alternative) => ({ ...alternative, positions: [...alternative.positions, { ...alternative.positions[0], instrumentId: "tsm", targetWeightPct: 5 }] })),
  };
}

test("with more holdings than fit, the loss scenario still adds up to its total", async ({ page }) => {
  await openFixture(page, fourHoldings());
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("6.25");
  await view(page, "Loss scenario").click();
  const scenario = page.getByRole("tabpanel", { name: "Loss scenario", exact: true });
  // Selected: $8k*30% + $40k*30% + $20k*10% + $4k*40% = $18,000.
  // Proposed: $5k*30% + $40k*30% + $20k*10% + $4k*40% = $17,100; cash at 0% adds $0.
  await expect(scenario).toContainText("-$18,000");
  await expect(scenario).toContainText("-$17,100");
  const contributions = page.getByRole("table", { name: "Contribution to the scenario change, largest first", exact: true });
  const body = contributions.locator("tbody tr");
  // Largest first; TSM, the smallest, is summed in its own row rather than left off.
  await expect(body.locator("th")).toHaveText(["VTI", "AAPL", "AGG", /^1 more holding/, "Cash reserve + unassigned"]);
  await expect(body.nth(3).getByRole("cell")).toHaveText(["-$1,600-1.6 points", "-$1,600-1.6 points"]);
  // Every row shown adds up to the total above it.
  const sums = await body.evaluateAll((rows) => [1, 2].map((column) => rows.reduce((sum, row) => sum + Number(row.children[column].childNodes[0].textContent!.replace(/[$,]/g, "")), 0)));
  expect(sums).toEqual([-18_000, -17_100]);

  const more = page.getByRole("button", { name: "Show 1 more holding", exact: true });
  await more.focus();
  await page.keyboard.press("Enter");
  await expect(body.locator("th")).toHaveText(["VTI", "AAPL", "AGG", "TSM", "Cash reserve + unassigned"]);
  const fewer = page.getByRole("button", { name: "Show the largest 3 only", exact: true });
  await expect(fewer).toBeFocused();
  await expect(fewer).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Enter");
  await expect(more).toBeFocused();
  await expect(more).toHaveAttribute("aria-expanded", "false");
});

test("weights that add up to exactly 100% save, and a missing reason is explained", async ({ page }) => {
  const original = await openFixture(page);
  // 5.4 + 69.9 + 24.7 is 100, but adds to 100.00000000000001 in binary floating point.
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("5.4");
  await page.getByLabel("VTI proposed percentage", { exact: true }).fill("69.9");
  await page.getByLabel("AGG proposed percentage", { exact: true }).fill("24.7");
  await expect(page.getByLabel("Cash and investment comparison", { exact: true })).toContainText("$20,000 cash · 20%");
  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save proposal", exact: true })).toBeDisabled();
  await expect(page.getByText("Write your reason to save it.", { exact: true })).toBeVisible();
  await page.getByLabel("Why these weights?", { exact: true }).fill("Invest everything after the reserve.");
  await expect(page.getByText("Write your reason to save it.", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Save proposal", exact: true }).click();
  await expect(page.getByText("Saved as a separate proposal. Your selected allocation has not changed.", { exact: true })).toBeVisible();
  await saved(page);
  const stored = await storedProject(page);
  expect(stored.alternatives).toHaveLength(2);
  expect(stored.alternatives[0]).toEqual(original.alternatives[0]);
  expect(stored.alternatives[1].positions.map((holding) => holding.targetWeightPct)).toEqual([5.4, 69.9, 24.7]);
});

test("the unchanged selected allocation offers nothing to save", async ({ page }) => {
  const original = await openFixture(page);
  await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Original allocation", exact: true })).toBeFocused();
  await expect(page.getByText("Your selected allocation", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save proposal", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Back to weights", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Try a different mix", exact: true })).toBeFocused();
  expect(await storedProject(page)).toEqual(original);
});

test("four holdings, their pages and every view fit six screen widths", async ({ page }) => {
  test.setTimeout(150_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openFixture(page, fourHoldings());
  await page.getByLabel("AAPL proposed percentage", { exact: true }).fill("6.25");
  const report = ["# Portfolio weights with four holdings", "", "One holding more than a page: Weights pages its rows; the loss scenario sums the smallest in one row.", ""];
  mkdirSync(".agent-shots", { recursive: true });
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const state of ["weights", "limits", "scenario", "evidence", "keep"] as const) {
      if (state === "weights") await view(page, "Weights").click();
      else if (state === "limits") await view(page, "Limits").click();
      else if (state === "scenario") await view(page, "Loss scenario").click();
      else if (state === "evidence") {
        await openEvidence(page);
        await page.getByRole("combobox", { name: "Saved valuation", exact: true }).selectOption("weights-apple");
      } else {
        await page.getByRole("button", { name: "Review proposal →", exact: true }).click();
        await page.getByLabel("Proposal name", { exact: true }).fill("Lower company concentration");
        await page.getByLabel("Why these weights?", { exact: true }).fill("Reduce the direct company holding to my cap, then review the remaining loss-budget excess.");
      }
      await page.screenshot({ path: `.agent-shots/portfolio-weights-four-${state}-${width}.png`, fullPage: true });
      const size = await page.evaluate(() => ({
        screens: document.documentElement.scrollHeight / innerHeight,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      report.push(`- ${width}px · ${state}: ${size.screens.toFixed(2)} screens; overflow ${size.overflow}px`);
      expect.soft(size.screens, `${state} at ${width}px`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `${state} at ${width}px`).toBe(0);
    }
  }
  report.push("", `Page errors: ${errors.length}`);
  writeFileSync(".agent-shots/portfolio-weights-four-report.md", report.join("\n"));
  expect(errors).toEqual([]);
});
