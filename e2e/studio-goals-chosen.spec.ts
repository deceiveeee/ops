import { expect, test, type Page } from "@playwright/test";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { createStudioProject } from "../lib/studio-project/create";
import { emptyLimits } from "../lib/studio-project/limits";
import { addPosition } from "../lib/studio-project/operations";
import { chooseWeightProposal, saveWeightProposal } from "../lib/studio-project/portfolio-weights";

/**
 * Goals names the allocation a change predates.
 *
 * An allocation is chosen on Compare allocations under one set of goals,
 * limits and scenario. Changing one of them on Goals, where they are changed,
 * says which chosen allocation was decided under the old one; undoing the
 * change says nothing again. Chosen at 18:00 UTC so the date reads the same in
 * any timezone from UTC-12 to UTC+5.
 */
const SAVED = "2026-09-25T12:00:00.000Z";
const CHOSEN = "2026-09-26T18:00:00.000Z";
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();

async function openChosen(page: Page, { secondScenario = false } = {}) {
  let project = createStudioProject("practice", SAVED);
  for (const id of ["aapl", "vti", "agg"]) project = addPosition(project, id, undefined, SAVED);
  project = {
    ...project,
    goal: { ...project.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 },
    limits: { ...emptyLimits(), companyCapPct: 5, lossCapacityPct: 15 },
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative, name: "Original allocation",
      positions: alternative.positions.map((position, index) => ({ ...position, targetWeightPct: [10, 50, 25][index] })),
    })),
    // Chosen under two scenarios, when asked for.
    ...(secondScenario ? { scenarios: [{ id: "rates", name: "Rates rise", stress: { ...project.stress, bondsPct: -12 } }] } : {}),
  };
  project = saveWeightProposal(project, project.alternatives[0].id,
    { name: "Lower company concentration", reasoning: "Apple down to the cap.", weights: { aapl: "6.25" }, valuationCaseIds: {} }, SAVED);
  project = chooseWeightProposal(project, project.alternatives[1].id, "Keep one company under 5%.", CHOSEN);
  const backup = exportProjectBackup(project);
  if (!backup.ok) throw new Error(backup.error);

  await page.goto("/studio/goals");
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
      transaction.objectStore("projects").put({ mode: "practice", revision: "goals-chosen-test", raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, backup.raw);
  await page.reload();
  await saved(page);
}

const notice = (page: Page) => page.getByRole("status").filter({ hasText: /^You chose/ });

test("Goals names the chosen allocation once a limit it was chosen under changes", async ({ page }) => {
  await openChosen(page);
  await expect(notice(page)).toHaveCount(0);

  await page.getByRole("tab", { name: /Your mix/ }).click();
  await page.getByLabel("Cap for one company").fill("4");
  await expect(notice(page)).toHaveText("You chose Lower company concentration on 26 Sep 2026, and your limits have changed since. Check it still fits →");
  await expect(notice(page).getByRole("link", { name: "Check it still fits →" })).toHaveAttribute("href", "/studio/portfolio/weights");

  await page.getByRole("tab", { name: /Your limits/ }).click();
  await page.getByLabel("Loss you could live with").fill("25");
  await expect(notice(page)).toContainText("and your goal and your limits have changed since.");

  // Put both back: nothing has changed since the choice, so nothing is said.
  await page.getByLabel("Loss you could live with").fill("20");
  await page.getByRole("tab", { name: /Your mix/ }).click();
  await page.getByLabel("Cap for one company").fill("5");
  await expect(notice(page)).toHaveCount(0);
  await saved(page);
  await page.reload();
  await expect(notice(page)).toHaveCount(0);
});

test("with two scenarios, Goals names a change to the second, and not a rename", async ({ page }) => {
  await openChosen(page, { secondScenario: true });
  await expect(notice(page)).toHaveCount(0);
  const bonds = page.getByLabel("Bonds", { exact: true });

  // The second scenario's bonds move from -12% to -20%: a figure it was chosen under.
  await page.goto("/studio/portfolio/risk");
  await page.getByRole("button", { name: "Rates rise" }).click();
  await expect(bonds).toHaveValue("-12");
  await bonds.fill("-20");
  await saved(page);
  await page.goto("/studio/goals");
  await expect(notice(page)).toHaveText("You chose Lower company concentration on 26 Sep 2026, and your loss scenarios have changed since. Check it still fits →");

  // Back to -12%, and renamed: a name changes no figure, so nothing is said.
  await page.goto("/studio/portfolio/risk");
  await page.getByRole("button", { name: "Rates rise" }).click();
  await bonds.fill("-12");
  await saved(page);
  await page.getByLabel("Scenario name").fill("Rates jump");
  await page.getByLabel("Scenario name").press("Tab");
  await expect(page.getByRole("button", { name: "Rates jump" })).toBeVisible();
  await saved(page);
  await page.goto("/studio/goals");
  await saved(page);
  await expect(notice(page)).toHaveCount(0);
});

test("the notice fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openChosen(page);
  await page.getByRole("tab", { name: /Your mix/ }).click();
  await page.getByLabel("Cap for one company").fill("4");
  await expect(notice(page)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
