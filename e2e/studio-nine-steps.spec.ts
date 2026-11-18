import { expect, test, type Page } from "@playwright/test";
import { STUDIO_CATALOG } from "../lib/studio-catalog";
import { applyBuilds, emptyConstruction, type AlternativeBuild } from "../lib/studio-project/construction";
import { createStudioProject } from "../lib/studio-project/create";
import { emptyLimits } from "../lib/studio-project/limits";
import { addPosition } from "../lib/studio-project/operations";
import type { StudioProject } from "../lib/studio-project/schema";
import { saved, seedProject } from "./studio-seed";

/**
 * The nine steps of building a portfolio, in the order professionals use.
 * Plan: docs/design/studio-portfolio-top-down-plan-2026-11-16.md.
 *
 * Every number was worked out before the page existed (and is unit-tested in
 * lib/studio-project/construction.test.ts):
 *   $10,000 now, $200 a month, 10 years, $50,000 wanted -> 5.88% a year above inflation.
 *   Mix Ready 5 / Steady 25 / Grow 70 with estimates 0-1, 2-4, 4-8% and 2% inflation
 *     -> 1.3% to 4.6% above inflation, below the 5.88% needed.
 *   Grow 30% international: $2,100 of Grow's $7,000. Steady 20% short-term: $500 of $2,500.
 *   AAPL 5% = $500 out of US stocks; with Apple about 6% of VTI, Apple is 7.6% of the
 *   portfolio against 2.9% in the index-only benchmark: +4.7 points.
 */
const NOW = "2026-11-17T12:00:00.000Z";

function goalOnly(): StudioProject {
  const project = createStudioProject("practice", NOW);
  return { ...project, goal: { ...project.goal, purpose: "A first home deposit", budget: 10_000, cashReserve: 0, monthlyContribution: 200, horizonYears: 10 } };
}

const BUILD: AlternativeBuild = {
  growInternationalPct: 30,
  steadyShortPct: 20,
  fills: { "us-stocks": "vti", "international-stocks": "vxus", "short-bonds": "sgov", "longer-bonds": "agg" },
  picksBudgetPct: 10,
  picks: [{ instrumentId: "aapl", pct: 5 }, { instrumentId: "tsm", pct: 5 }],
};

/** The same portfolio, every step done, as the screen-budget check needs it. */
function finished(): StudioProject {
  const limits = emptyLimits();
  const project: StudioProject = {
    ...goalOnly(),
    limits: { ...limits, companyCapPct: 5, slices: { ready: { minPct: 0, targetPct: 5, maxPct: 10 }, steady: { minPct: 20, targetPct: 25, maxPct: 30 }, grow: { minPct: 65, targetPct: 70, maxPct: 75 } } },
    construction: {
      ...emptyConstruction(), targetAmount: 50_000, inflationPct: 2, estimateSource: "Invented for this test",
      estimates: { ready: { lowPct: 0, highPct: 1 }, steady: { lowPct: 2, highPct: 4 }, grow: { lowPct: 4, highPct: 8 } },
      compare: [{ id: "mix-more-grow", name: "More Grow", ready: 0, steady: 10, grow: 90 }],
    },
  };
  return applyBuilds({ ...project, alternatives: [{ ...project.alternatives[0], build: BUILD }] }, STUDIO_CATALOG, NOW);
}

const canvas = (page: Page, id: string) => page.locator(`[aria-labelledby="${id}"]`);

test("a learner builds a portfolio in the nine steps, without typing a weight for any fund", async ({ page }) => {
  test.setTimeout(180_000);
  await seedProject(page, goalOnly(), "/studio/goals");

  // Steps 1 and 2 are Goals: the rules first, then the return they need.
  await expect(page.getByText("Goals · Step 1 of 9: write the rules first")).toBeVisible();
  await page.getByRole("tab", { name: "Return needed" }).click();
  await expect(page.getByText("Goals · Step 2 of 9: the return your goal needs")).toBeVisible();
  await page.getByLabel("Amount you want by then").fill("50000");
  await expect(canvas(page, "money-canvas-heading")).toContainText("needs about 5.88% a year more than prices rise");
  await saved(page);

  // Step 3: the mix, then estimates against the goal.
  await page.goto("/studio/portfolio");
  await expect(page.getByRole("heading", { name: "Choose your mix." })).toBeVisible({ timeout: 20_000 });
  await page.getByLabel("Ready target, % of the whole portfolio").fill("5");
  await page.getByLabel("Steady target, % of the whole portfolio").fill("25");
  await page.getByLabel("Grow target, % of the whole portfolio").fill("70");
  await page.getByRole("tab", { name: "Estimates" }).click();
  for (const [slice, low, high] of [["Ready", "0", "1"], ["Steady", "2", "4"], ["Grow", "4", "8"]]) {
    await page.getByLabel(`${slice} low estimate, % a year`).fill(low);
    await page.getByLabel(`${slice} high estimate, % a year`).fill(high);
  }
  await page.getByLabel("Prices rising each year").fill("2");
  await expect(canvas(page, "mix-canvas-heading")).toContainText("1.3–4.6%");
  await expect(canvas(page, "mix-canvas-heading")).toContainText("Your goal needs 5.9% a year above inflation, more than this mix's 4.6%");
  // The default scenario: stocks -30%, bonds -10%. 70% x 30% + 25% x 10% = 23.5% of $10,000.
  await expect(canvas(page, "mix-canvas-heading")).toContainText("-$2,350 (-23.5%)");
  await saved(page);

  // Step 4: split each slice.
  await page.getByRole("link", { name: /Step 4: split each slice/ }).click();
  await page.getByLabel("Grow: share in international stocks, % of Grow").fill("30");
  await page.getByLabel("Steady: share in short-term bonds, % of Steady").fill("20");
  await expect(page.getByText("30% of Grow's $7,000 is $2,100")).toBeVisible();
  await expect(page.getByText("20% of Steady's $2,500 is $500")).toBeVisible();
  await saved(page);

  // Step 5: one fund for each part, chosen, not weighted.
  await page.getByRole("link", { name: /Step 5: fill each part/ }).click();
  for (const [part, fund] of [["US stocks", /^VTI ·/], ["International stocks", /^VXUS ·/], ["Short-term bonds", /^SGOV ·/], ["Longer-term bonds", /^AGG ·/]] as const) {
    await page.getByRole("tab", { name: part, exact: true }).click();
    await page.getByRole("radio", { name: fund }).check();
  }
  await expect(canvas(page, "fill-canvas-heading")).toContainText("US stocks · VTI");
  await expect(page.getByLabel(/target percentage$/)).toHaveCount(0);
  await saved(page);

  // Step 6: picks inside a budget, each against the fund it replaces.
  await page.getByRole("link", { name: /Step 6: your picks/ }).click();
  await page.getByLabel("Picks budget, % of the whole portfolio").fill("10");
  await page.getByLabel("AAPL, % of the whole portfolio").fill("5");
  await page.getByLabel("TSM, % of the whole portfolio").fill("5");
  await expect(canvas(page, "picks-canvas-heading")).toContainText("replaces $500 of VTI");
  await expect(canvas(page, "picks-canvas-heading")).toContainText("replaces $500 of VXUS");
  await saved(page);

  // Step 7: look inside, and the bet each pick makes against the benchmark.
  await page.getByRole("link", { name: /Step 7: check the whole portfolio/ }).click();
  await expect(page.getByText(/Apple Inc/).first()).toBeVisible({ timeout: 20_000 });
  await page.getByRole("tab", { name: "Benchmark" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("+4.7 points");

  // Step 8: the worksheet works from the holdings the steps produced.
  await page.getByRole("link", { name: /Step 8: carry it out/ }).click();
  await expect(page.getByRole("heading", { name: "Work out what to buy" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("table", { name: "What to buy, investment by investment" })).toContainText("VTI");
  await expect(page.getByText(/a worksheet to carry to your taxable account./)).toBeVisible();

  // Step 9: Review compares each slice before each holding.
  await page.goto("/studio/review");
  await expect(page.getByText("Review · Step 9 of 9")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("tab", { name: "Holdings today" }).click();
  await page.getByLabel("Cash in this portfolio today").fill("500");
  await page.getByLabel("VTI value today").fill("5000");
  // $5,500 entered: Grow is $5,000, 90.9%, against 70%.
  await expect(page.getByLabel("Each slice today against its target")).toContainText("90.9% today, target 70%");
  await expect(page.getByLabel("Each slice today against its target")).toContainText("20.9 points above");
});

test("a portfolio typed by hand starts the steps from its own holdings, and says what moves", async ({ page }) => {
  test.setTimeout(120_000);
  // $10,000 with $1,000 kept aside leaves $9,000: VTI 40%, VOO 10%, VXUS 20%, AGG 20%, AAPL 5%.
  // Whole-portfolio shares: VTI 36, VOO 9, VXUS 18, AGG 18, AAPL 4.5, cash 14.5.
  let project = createStudioProject("practice", NOW);
  const typed: [string, number][] = [["vti", 40], ["voo", 10], ["vxus", 20], ["agg", 20], ["aapl", 5]];
  for (const [id] of typed) project = addPosition(project, id, undefined, NOW);
  project = {
    ...project, goal: { ...project.goal, purpose: "Testing", budget: 10_000, cashReserve: 1_000 },
    alternatives: project.alternatives.map((alternative) => ({ ...alternative, positions: alternative.positions.map((position) => ({ ...position, targetWeightPct: typed.find(([id]) => id === position.instrumentId)![1] })) })),
  };
  await seedProject(page, project, "/studio/portfolio/split");

  const start = page.getByRole("region", { name: "Start from the weights you typed" });
  await expect(start).toContainText("Ready 14.5%, Steady 18% and Grow 67.5%");
  await expect(start).toContainText("VOO's money moves into VTI");
  await start.getByRole("button", { name: "Build from these holdings" }).click();
  await saved(page);
  await expect(start).toHaveCount(0);

  // US stocks: 67.5% of Grow less 26.67% international is $4,950; AAPL's $450 comes out of it, leaving VTI $4,500 = 36% + 9%.
  await page.goto("/studio/portfolio/fill");
  await expect(canvas(page, "fill-canvas-heading")).toContainText("US stocks · VTI$4,500", { timeout: 20_000 });
  // The typed weights became the targets of step 3.
  await page.goto("/studio/portfolio");
  await expect(page.getByLabel("Grow target, % of the whole portfolio")).toHaveValue("67.5", { timeout: 20_000 });
  await expect(page.getByLabel("Ready target, % of the whole portfolio")).toHaveValue("14.5");
});

test("typed weights that add up to more than 100% are not built from, and can start afresh", async ({ page }) => {
  test.setTimeout(90_000);
  let project = createStudioProject("practice", NOW);
  for (const id of ["vti", "agg"]) project = addPosition(project, id, undefined, NOW);
  project = { ...project, goal: { ...project.goal, purpose: "Testing" }, alternatives: project.alternatives.map((alternative) => ({ ...alternative, positions: alternative.positions.map((position) => ({ ...position, targetWeightPct: position.instrumentId === "vti" ? 80 : 45 })) })) };
  await seedProject(page, project, "/studio/portfolio/split");
  const start = page.getByRole("region", { name: "Start from the weights you typed" });
  await expect(start).toContainText("Investment targets exceed 100% of the amount available after the cash reserve.");
  await expect(start.getByRole("button", { name: "Build from these holdings" })).toHaveCount(0);
  await start.getByRole("button", { name: "Start afresh" }).click();
  await saved(page);
  await expect(start).toHaveCount(0);
  // Both holdings are still there, at 0%, waiting for their parts.
  await page.goto("/studio/portfolio/fill");
  await expect(page.getByText("Also in this portfolio at 0%, filling no part:")).toBeVisible({ timeout: 20_000 });
});

test("every step fits a screen and a half at six widths, with nothing scrolling sideways", async ({ page }) => {
  test.setTimeout(240_000);
  await seedProject(page, finished(), "/studio/portfolio");
  const pages: { path: string; heading: string; tabs?: string[] }[] = [
    { path: "/studio/goals", heading: "Give the money a job.", tabs: ["Checking", "Return needed"] },
    { path: "/studio/portfolio", heading: "Choose your mix.", tabs: ["Targets", "Estimates", "Compare"] },
    { path: "/studio/portfolio/split", heading: "Split each slice." },
    { path: "/studio/portfolio/fill", heading: "Fill each part.", tabs: ["US stocks", "Longer-term bonds"] },
    { path: "/studio/portfolio/picks", heading: "Your picks." },
    { path: "/studio/portfolio/check", heading: "Check the whole portfolio.", tabs: ["Look inside", "Benchmark", "Limits"] },
  ];
  const report: string[] = [];
  const failures: string[] = [];
  for (const { path, heading, tabs } of pages) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible({ timeout: 20_000 });
    for (const tab of tabs ?? [null]) {
      if (tab) await page.getByRole("tab", { name: tab, exact: true }).click();
      const line: string[] = [];
      for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        const size = await page.evaluate(() => ({
          screens: document.documentElement.scrollHeight / innerHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        }));
        line.push(`${width}: ${size.screens.toFixed(3)}${size.overflow > 0 ? ` (+${size.overflow}px sideways)` : ""}`);
        if (size.overflow > 0 || size.screens > 1.5) failures.push(`${path}${tab ? ` (${tab})` : ""} at ${width}px: ${size.screens.toFixed(2)} screens, ${size.overflow}px sideways`);
      }
      report.push(`${path}${tab ? ` (${tab})` : ""}: ${line.join(", ")}`);
    }
  }
  console.log(report.join("\n"));
  expect(failures).toEqual([]);
});
