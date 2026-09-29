import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { createStudioProject } from "../lib/studio-project/create";
import { emptyLimits } from "../lib/studio-project/limits";
import { addPosition } from "../lib/studio-project/operations";
import type { StudioProject, StudioScenario } from "../lib/studio-project/schema";

const NOW = "2026-09-26T12:00:00.000Z";
const RISK = "/studio/portfolio/risk";
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
const table = (page: Page) => page.getByRole("table", { name: "Your scenarios, largest loss first", exact: true });

/**
 * $100,000 with $20,000 in reserve leaves $80,000: AAPL 10%, VTI 50%, AGG 25%
 * is $8,000, $40,000 and $20,000, with $32,000 cash. The loss you could
 * afford, 15%, is the budget: $15,000. The first scenario (US -30%, bonds
 * -10%, cash 0%) loses $2,400 + $12,000 + $2,000 = $16,400.
 */
function fixture(weights = [10, 50, 25], scenarios?: StudioScenario[]): StudioProject {
  let project = createStudioProject("practice", NOW);
  for (const id of ["aapl", "vti", "agg"]) project = addPosition(project, id, undefined, NOW);
  return {
    ...project,
    goal: { ...project.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 },
    stress: { usStocksPct: -30, internationalStocksPct: -40, globalStocksPct: -35, bondsPct: -10, cashPct: 0 },
    limits: { ...emptyLimits(), lossCapacityPct: 15 },
    ...(scenarios ? { scenarioName: "Stocks fall", scenarios } : {}),
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative, positions: alternative.positions.map((position, index) => ({ ...position, targetWeightPct: weights[index] })),
    })),
  };
}

/** Seed only this test's browser context, using the production backup envelope. */
async function open(page: Page, project: StudioProject, route = RISK) {
  const backup = exportProjectBackup(project);
  if (!backup.ok) throw new Error(backup.error);
  await page.goto(route);
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
      transaction.objectStore("projects").put({ mode: "practice", revision: "scenarios-test", raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, backup.raw);
  await page.reload();
  await saved(page);
}

async function stored(page: Page): Promise<StudioProject> {
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

/** Type into a buffered field and leave it, as a learner would. */
async function enter(page: Page, label: string, value: string) {
  const field = page.getByLabel(label, { exact: true });
  await field.fill(value);
  await field.press("Tab");
}

test("scenarios can be added, named, edited and removed, and the worst is held against the loss budget everywhere", async ({ page }) => {
  await open(page, fixture());
  await expect(page.getByRole("tab", { name: "Loss scenario", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("-$16,400.00", { exact: true })).toBeVisible();
  await expect(page.getByText("That loss is $1,400.00 more than your loss budget.", { exact: false })).toBeVisible();

  // A second scenario starts as a copy of the first and takes focus for its name.
  await page.getByRole("button", { name: "Add a second scenario", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Loss scenarios (2)", exact: true })).toBeVisible();
  const name = page.getByLabel("Scenario name", { exact: true });
  await expect(name).toBeFocused();
  await expect(name).toHaveValue("Scenario 2");
  await name.fill("Rates rise");
  await name.press("Tab");
  // Rates rise: $8,000 x -15% + $40,000 x -15% + $20,000 x -12% = -$1,200 - $6,000 - $2,400 = -$9,600.
  await enter(page, "US stocks", "-15");
  await enter(page, "International stocks", "-15");
  await enter(page, "Bonds", "-12");
  await expect(table(page).locator("tbody tr")).toHaveText([
    /^Scenario 1\s*-\$16,400\s*-16\.4%\s*Over · worst$/,
    /^Rates rise\s*-\$9,600\s*-9\.6%\s*Within$/,
  ]);
  await expect(page.getByText("“Scenario 1” is the worst you set, not the worst that could happen.", { exact: false })).toBeVisible();

  // Open the first from the table, by keyboard, and name it.
  await table(page).getByRole("button", { name: "Scenario 1", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(table(page).getByRole("button", { name: "Scenario 1", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(name).toBeFocused();
  await name.fill("Stocks fall");
  await name.press("Tab");

  // Rates rise with US stocks -40%: -$3,200 - $16,000 - $2,400 = -$21,600, now the worst.
  await table(page).getByRole("button", { name: "Rates rise", exact: true }).click();
  await enter(page, "US stocks", "-40");
  await expect(table(page).locator("tbody tr").first()).toHaveText(/^Rates rise\s*-\$21,600\s*-21\.6%\s*Over · worst$/);
  await expect(page.getByText("It costs $21,600, more than your loss budget of $15,000, the loss you could afford.", { exact: false })).toBeVisible();
  await saved(page);
  const two = await stored(page);
  expect(two.scenarioName).toBe("Stocks fall");
  expect(two.stress).toEqual(fixture().stress);
  expect(two.scenarios).toHaveLength(1);
  expect(two.scenarios![0]).toMatchObject({ name: "Rates rise", stress: { usStocksPct: -40, internationalStocksPct: -15, bondsPct: -12, cashPct: 0 } });

  // Portfolio: VTI's room is set by the worst scenario for it.
  // Rates rise: 40% + (15% - 21.6%) / 0.40 = 23.5%; Stocks fall: 40% + (15% - 16.4%) / 0.30 = 35.3%.
  await page.goto("/studio/portfolio");
  await expect(page.getByText("VTI: 16.5 points over what your loss budget in “Rates rise” allows (23.5% of the whole portfolio).", { exact: true })).toBeVisible();

  // Compare allocations opens its loss view on the scenario worst for the proposal.
  await page.goto("/studio/portfolio/weights");
  await page.getByRole("tab", { name: "Loss scenario", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Scenario", exact: true })).toHaveValue(two.scenarios![0].id);
  await expect(page.getByRole("tabpanel", { name: "Loss scenario", exact: true })).toContainText("-$21,600");
  await page.getByRole("tab", { name: "Limits", exact: true }).click();
  await expect(page.getByText("This allocation loses $21,600 in “Rates rise”, the worst of your 2 scenarios.", { exact: false })).toBeVisible();

  // Removing it returns to one scenario; the first keeps its name.
  await page.goto(RISK);
  await table(page).getByRole("button", { name: "Rates rise", exact: true }).click();
  await page.getByRole("button", { name: "Remove this scenario", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Loss scenario", exact: true })).toBeVisible();
  await expect(table(page)).toHaveCount(0);
  await saved(page);
  const one = await stored(page);
  expect(one.scenarios).toEqual([]);
  expect(one.stress).toEqual(fixture().stress);
});

test("a gain is not a loss, and weights over 100% show no scenario result", async ({ page }) => {
  await open(page, fixture());
  // US +40%, bonds +5%: $3,200 + $16,000 + $1,000 = +$20,200, larger than the $15,000 budget but a gain.
  await enter(page, "US stocks", "40");
  await enter(page, "Bonds", "5");
  await expect(page.getByText("$20,200.00", { exact: true })).toBeVisible();
  await expect(page.getByText(/more than your loss budget/)).toHaveCount(0);

  await open(page, fixture([50, 50, 25]));
  await expect(page.getByText("Fix the weights first", { exact: true })).toBeVisible();
  await expect(page.getByText("Change in this scenario", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/more than your loss budget/)).toHaveCount(0);
});

test("fund costs and overlap each sit in their own view", async ({ page }) => {
  await open(page, fixture());
  await page.getByRole("tab", { name: "Loss scenario", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  const costs = page.getByRole("tab", { name: "Fund costs", exact: true });
  await expect(costs).toBeFocused();
  await expect(costs).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("What the funds you hold charge each year.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("US stocks", { exact: true })).toHaveCount(0);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Overlap", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("The same company or government, held through more than one of your investments.", { exact: true })).toBeVisible();
});

test("the scenario page with one, three and five scenarios, at six widths", async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const extra: StudioScenario[] = [
    { id: "rates", name: "Rates rise", stress: { usStocksPct: -15, internationalStocksPct: -15, globalStocksPct: -15, bondsPct: -12, cashPct: 0 } },
    { id: "inflation", name: "Inflation", stress: { usStocksPct: -10, internationalStocksPct: -10, globalStocksPct: -10, bondsPct: -15, cashPct: -3 } },
    { id: "abroad", name: "Trouble abroad", stress: { usStocksPct: -5, internationalStocksPct: -35, globalStocksPct: -20, bondsPct: 2, cashPct: 0 } },
    { id: "mild", name: "A mild fall", stress: { usStocksPct: -10, internationalStocksPct: -10, globalStocksPct: -10, bondsPct: 0, cashPct: 0 } },
  ];
  const report = ["# Risk and cost: several scenarios", "", "Screens at a 900px viewport height. Below 1280px, Studio's shared guidance and summary sit above the work.", ""];
  mkdirSync(".agent-shots", { recursive: true });
  for (const count of [1, 3, 5]) {
    await open(page, fixture(undefined, count > 1 ? extra.slice(0, count - 1) : undefined));
    const line: string[] = [];
    for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole("heading", { name: "Check the risk and the cost", exact: true })).toBeVisible();
      await page.screenshot({ path: `.agent-shots/risk-scenarios-${count}-${width}.png`, fullPage: true });
      const size = await page.evaluate(() => ({
        screens: document.documentElement.scrollHeight / innerHeight,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      line.push(`${width}px ${size.screens.toFixed(2)}`);
      expect.soft(size.overflow, `overflow with ${count} at ${width}px`).toBe(0);
      // The page's own content fits where Studio puts its guidance beside the work.
      if (width >= 1280) expect.soft(size.screens, `${count} scenario(s) at ${width}px`).toBeLessThanOrEqual(1.5);
    }
    report.push(`- ${count} scenario${count === 1 ? "" : "s"}: ${line.join(" · ")}`);
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  report.push("", `Page errors: ${errors.length}`);
  writeFileSync(".agent-shots/risk-scenarios-report.md", report.join("\n"));
  expect(errors).toEqual([]);
});
