import { expect, test, type Page } from "@playwright/test";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { createStudioProject } from "../lib/studio-project/create";
import { addPosition } from "../lib/studio-project/operations";
import type { StudioProject } from "../lib/studio-project/schema";

/**
 * How much goes where, within a screen and a half.
 *
 * Five holdings were 2.17 screens on a phone and 1.86 at 1024px: each was five
 * lines, with what limits it in a sentence of its own. Each is now two lines
 * and its limit one, the total is the table's last line, and below 1280px the
 * table shows three at a time, as Compare allocations does.
 *
 * $10,000 with $1,000 set aside leaves $9,000: VTI 40% is $3,600, 36% of all
 * money; the practice portfolio's loss you could live with is 20%.
 */
const NOW = "2026-10-01T12:00:00.000Z";
const FIVE: [string, number][] = [["vti", 40], ["vxus", 20], ["agg", 20], ["aapl", 5], ["ust-91282crf0", 10]];
const EIGHT: [string, number][] = [["vti", 25], ["voo", 10], ["vxus", 15], ["aapl", 5], ["tsm", 5], ["agg", 15], ["sgov", 10], ["ust-91282crf0", 10]];
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();

async function open(page: Page, count: number) {
  const held = count === 8 ? EIGHT : FIVE.slice(0, count);
  let project: StudioProject = createStudioProject("practice", NOW);
  for (const [id] of held) project = addPosition(project, id, undefined, NOW);
  project = {
    ...project,
    goal: { ...project.goal, budget: 10_000, cashReserve: 1_000 },
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative, positions: alternative.positions.map((position) => ({ ...position, targetWeightPct: held.find(([id]) => id === position.instrumentId)![1] })),
    })),
  };
  const backup = exportProjectBackup(project);
  if (!backup.ok) throw new Error(backup.error);
  await page.goto("/studio/portfolio");
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
      transaction.objectStore("projects").put({ mode: "practice", revision: "how-much-test", raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, backup.raw);
  await page.reload();
  await saved(page);
}

const table = (page: Page) => page.getByRole("table", { name: "Target weight and dollar amount for each investment" });
const box = (page: Page, symbol: string) => page.getByLabel(`${symbol} target percentage`, { exact: true });

test("below 1280px, five holdings show three at a time, with the total always on screen", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await open(page, 5);
  const total = table(page).locator("tfoot");
  await expect(total).toContainText("Total95.0%");
  await expect(total).toContainText("1–3 of 5");
  await expect(box(page, "VTI")).toBeVisible();
  await expect(box(page, "AAPL")).toBeHidden();

  await page.getByRole("button", { name: "Next investments", exact: true }).click();
  await expect(total).toContainText("4–5 of 5");
  await expect(box(page, "VTI")).toBeHidden();
  // A weight on the second page still adds to the one total: 40 + 20 + 20 + 10 + 10 is 100%.
  await box(page, "AAPL").fill("10");
  await expect(total).toContainText("Total100.0%");
  await expect(page.getByText("The percentages total 100%: every dollar after your cash reserve has a job.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next investments", exact: true })).toBeDisabled();

  // From 1280px there is room for all five, and nothing to page through.
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const symbol of ["VTI", "VXUS", "AGG", "AAPL", "91282CRF0"]) await expect(box(page, symbol)).toBeVisible();
  await expect(page.getByRole("button", { name: "Next investments", exact: true })).toBeHidden();
});

test("on a phone each holding says what it comes to and what limits it, a line each", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page, 3);
  const amounts = page.getByText("36.0% of all money · $3,600.00", { exact: true });
  await expect(amounts).toBeVisible();
  expect((await amounts.boundingBox())!.height).toBeLessThan(24);
  // The readable plan's sentence, in its one-line form, under the holding.
  const limit = table(page).getByText(/^VTI: .*your loss budget/);
  await expect(limit.filter({ visible: true })).toHaveCount(1);
  expect((await limit.filter({ visible: true }).boundingBox())!.height).toBeLessThan(24);
});

test("a phone reveals the full investment name and returns keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await open(page, 3);
  const name = page.getByRole("button", { name: "Full name for VTI", exact: true });
  await name.click();
  const dialog = page.getByRole("dialog", { name: "Full investment name" });
  await expect(dialog).toContainText("Vanguard Total Stock Market Index Fund");
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(name).toBeFocused();
});

test("editing the second desktop page counts every holding and survives resizing and reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, 8);
  const total = table(page).locator("tfoot");
  await expect(total).toContainText("1–5 of 8");
  await expect(box(page, "SGOV")).toBeHidden();
  await page.getByRole("button", { name: "Next investments", exact: true }).click();
  await expect(total).toContainText("6–8 of 8");
  await box(page, "SGOV").fill("15");
  await expect(total).toContainText("Total100.0%");
  await saved(page);

  await page.setViewportSize({ width: 390, height: 900 });
  await expect(total).toContainText("4–6 of 8");
  await page.getByRole("button", { name: "Next investments", exact: true }).click();
  await expect(total).toContainText("7–8 of 8");
  await expect(box(page, "SGOV")).toHaveValue("15");
  await expect(page.getByRole("button", { name: "Next investments", exact: true })).toBeDisabled();

  await page.reload();
  await saved(page);
  await page.getByRole("button", { name: "Next investments", exact: true }).click();
  await page.getByRole("button", { name: "Next investments", exact: true }).click();
  await expect(box(page, "SGOV")).toHaveValue("15");
  await expect(total).toContainText("Total100.0%");
});

test("three, five and eight holdings fit at every width and keep dollar columns in view", async ({ page }) => {
  test.setTimeout(120_000);
  const report: string[] = [];
  for (const count of [3, 5, 8]) {
    await open(page, count);
    const line: string[] = [];
    for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(box(page, "VTI")).toBeVisible();
      const size = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      line.push(`${width} ${size.screens.toFixed(2)}`);
      expect.soft(size.screens, `${count} at ${width}`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `${count} at ${width}`).toBe(0);
      if (width >= 768) {
        expect.soft(await table(page).evaluate((element) => element.parentElement!.scrollWidth - element.parentElement!.clientWidth), `dollar columns at ${width}`).toBeLessThanOrEqual(1);
      }
      // The final page must fit too; the total continues to cover every holding.
      const next = page.getByRole("button", { name: "Next investments", exact: true });
      while (await next.isVisible() && await next.isEnabled()) {
        await next.click();
        expect.soft(await page.evaluate(() => document.documentElement.scrollHeight / innerHeight), `${count} at ${width}, later page`).toBeLessThanOrEqual(1.5);
        await expect(table(page).locator("tfoot")).toContainText(count === 3 ? "Total80.0%" : "Total95.0%");
      }
      const previous = page.getByRole("button", { name: "Previous investments", exact: true });
      while (await previous.isVisible() && await previous.isEnabled()) await previous.click();
    }
    report.push(`${count}: ${line.join(" · ")}`);
  }
  console.log(report.join("\n"));
});

test.describe("on a touch phone", () => {
  // A coarse pointer makes the paging buttons and boxes 44px: the tallest the page gets.
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 900 } });
  test("five and eight holdings fit a screen and a half", async ({ page }) => {
    for (const count of [5, 8]) {
      await open(page, count);
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollHeight / innerHeight)).toBeLessThanOrEqual(1.5);
    }
  });
});
