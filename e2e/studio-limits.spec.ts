import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { createStudioProject } from "../lib/studio-project/create";
import { emptyLimits } from "../lib/studio-project/limits";
import { addPosition } from "../lib/studio-project/operations";
import type { StudioProject } from "../lib/studio-project/schema";
import { saved, seedProject } from "./studio-seed";

/**
 * A portfolio checked against the learner's own limits.
 *
 * Worked by hand. A practice portfolio holds $10,000 with nothing set aside, so
 * each weight is also its share of the whole. VTI 60% and AAPL 10% leave 30% as
 * cash. The default scenario drops stocks 30%:
 *   loss = $6,000 x 30% + $1,000 x 30% = $1,800 + $300 = $2,100
 * The loss you could live with starts at 20%, a $2,000 loss budget. AAPL is
 * 5.0 points over a 5% cap for one company.
 *
 * Weights typed by hand are older work: the limits are checked in step 7 and
 * on Review whether or not a portfolio was built in the nine steps.
 */
const NOW = "2026-11-17T12:00:00.000Z";

function typed(weights: [string, number][], companyCapPct: number | null): StudioProject {
  let project = createStudioProject("practice", NOW);
  for (const [id] of weights) project = addPosition(project, id, undefined, NOW);
  return {
    ...project,
    limits: { ...emptyLimits(), companyCapPct },
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative, positions: alternative.positions.map((position) => ({ ...position, targetWeightPct: weights.find(([id]) => id === position.instrumentId)![1] })),
    })),
  };
}

test("step 7 lists every check beside the work, and says what is not met", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedProject(page, typed([["vti", 60], ["aapl", 10]], 5), "/studio/portfolio/check");

  // Beside the work at this width, closed to one line until opened.
  const limits = page.getByRole("complementary", { name: "About this page" }).locator("details").filter({ hasText: "Your limits" });
  await expect(limits.locator("summary")).toContainText("2 not met · 2 not checked");
  await limits.locator("summary").click();
  await expect(limits).toContainText("Bills are covered · Not checked");
  await expect(limits).toContainText("No bills listed.");
  await expect(limits).toContainText("Slices are inside their ranges · Not checked");
  await expect(limits).toContainText("AAPL is 10.0%, 5.0 points over your cap for one company (5%).");
  await expect(limits).toContainText("This allocation loses $2,100 in the scenario. Your loss budget is $2,000, the loss you could live with. Most of the loss: VTI $1,800, AAPL $300.");

  // The step's own summary counts the same checks.
  await expect(page.getByRole("region", { name: "Ready to buy?" })).toContainText("2 not met");
});

test("a phone keeps the list in step 7's limits tab, closed to one line", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await seedProject(page, typed([["vti", 100]], null), "/studio/portfolio/check");
  await page.getByRole("tab", { name: "Limits", exact: true }).click();
  const limits = page.getByRole("main").locator("details").filter({ hasText: "Your limits" }).filter({ visible: true });
  await expect(limits).toHaveCount(1);
  await expect(limits).not.toHaveAttribute("open", "");
  // $10,000 in VTI falls $3,000 in the scenario: over the $2,000 budget.
  await expect(limits.locator("summary")).toContainText("1 not met · 3 not checked");
  const size = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(size).toBe(0);
});

test("a pick over the cap for one company is refused in step 6, and nothing is rewritten", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const project = typed([], 5);
  const limits = project.limits!;
  await seedProject(page, {
    ...project,
    limits: { ...limits, slices: { ready: { ...limits.slices.ready, targetPct: 10 }, steady: { ...limits.slices.steady, targetPct: 20 }, grow: { ...limits.slices.grow, targetPct: 70 } } },
    alternatives: [{ ...project.alternatives[0], build: {
      growInternationalPct: 0, steadyShortPct: 0, picksBudgetPct: 10, picks: [],
      fills: { "us-stocks": "vti", "international-stocks": null, "short-bonds": null, "longer-bonds": "agg" },
    } }],
  }, "/studio/portfolio/picks");
  await page.getByLabel("AAPL, % of the whole portfolio").fill("8");
  const canvas = page.getByRole("region", { name: "Each pick against its index fund." });
  await expect(canvas).toContainText("AAPL is 8%, over your 5% cap for one company.");
  await page.getByLabel("AAPL, % of the whole portfolio").fill("5");
  await expect(canvas).toContainText("replaces $500 of VTI");
  await saved(page);
});

test("Review carries the limits, and the readable plan writes them out with each portfolio's checks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await seedProject(page, typed([["vti", 60], ["aapl", 10]], 5), "/studio/review");

  // AAPL is over its cap and the scenario loses $2,100 against $2,000; bills and slices are not set.
  const limits = page.getByRole("main").locator("details").filter({ hasText: "Your limits" }).filter({ visible: true });
  await expect(limits.locator("summary")).toContainText("2 not met · 2 not checked");

  await page.getByRole("tab", { name: "Keep a copy" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download the readable plan" }).click();
  const text = readFileSync(await (await download).path(), "utf8");
  expect(text.indexOf("YOUR LIMITS")).toBeLessThan(text.indexOf("PORTFOLIO: "));
  expect(text).toContain("Cap for one company: 5%. Cap for one fund: not set.");
  expect(text).toContain("No holding is over its cap: not met. AAPL is 10.0%, 5.0 points over your cap for one company (5%).");
  expect(text).toContain("The scenario stays within your loss budget: not met. This allocation loses $2,100 in the scenario.");
  expect(text).toContain("AAPL: 5.0 points over what your cap for one company allows (5.0% of the whole portfolio).");
});
