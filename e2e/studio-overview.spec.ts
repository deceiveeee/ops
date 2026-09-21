import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createStudioProject } from "../lib/studio-project/create";
import { addPosition, saveInvestigation, startCandidate } from "../lib/studio-project/operations";
import type { StudioProject } from "../lib/studio-project/schema";

const NOW = "2026-09-14T12:00:00.000Z";

function savedWork(weight = 70): StudioProject {
  let project = addPosition(createStudioProject("practice", NOW), "vti", undefined, NOW);
  project.goal = { ...project.goal, purpose: "A place of my own", budget: 10000, cashReserve: 2000, horizonYears: 8, monthlyContribution: 150 };
  project.alternatives[0].positions[0].targetWeightPct = Math.min(weight, 100);
  if (weight > 100) {
    project = addPosition(project, "bnd", undefined, NOW);
    project.alternatives[0].positions[1].targetWeightPct = weight - 100;
  }
  project = startCandidate(project, "aapl", NOW);
  project.candidates = project.candidates.map(candidate => candidate.instrumentId === "aapl" ? { ...candidate, status: "rejected", rejectedBecause: "Too much exposure to one business" } : candidate);
  return saveInvestigation(project, { company: "Ampere Instruments", sic: "3674", figures: { revenue: 4200, operatingProfit: 610 }, riskFreePct: null }, "company-ampere", NOW);
}

/** Seed only this test's fresh browser context, through the same database envelope the app reads. */
async function openSavedWork(page: Page, project: StudioProject) {
  await page.goto("/studio");
  await expect(page.getByRole("heading", { name: "Your next move." })).toBeVisible();
  await page.evaluate(async (raw) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("ops-studio-projects");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("projects", "readwrite");
      transaction.objectStore("projects").put({ mode: "practice", revision: "overview-test", raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, JSON.stringify(project));
  await page.reload();
  await expect(page.getByRole("region", { name: "What this money is for", exact: true })).toContainText(project.goal.purpose);
}

test("overview shows the saved allocation after the cash reserve and keeps rejected research", async ({ page }) => {
  await openSavedWork(page, savedWork());
  const portfolio = page.getByRole("region", { name: "Your portfolio, taking shape" });
  await expect(portfolio).toContainText("$8,000");
  await expect(portfolio).toContainText("70.0% of the amount after your cash reserve");
  await expect(portfolio).toContainText("30.0% left to assign");
  await expect(page.getByRole("region", { name: "Investments you have read about" })).toContainText("Decided against · not in your portfolio; your notes are kept");
  await expect(page.getByRole("link", { name: /Ampere Instruments/ })).toHaveAttribute("href", "/studio/investigate?company=company-ampere");
  await page.getByRole("link", { name: "Open Portfolio", exact: true }).click();
  await expect(page).toHaveURL(/\/studio\/portfolio$/);
});

test("an over-assigned portfolio states the excess instead of looking complete", async ({ page }) => {
  await openSavedWork(page, savedWork(125));
  const portfolio = page.getByRole("region", { name: "Your portfolio, taking shape" });
  await expect(portfolio).toContainText("25.0% over the available amount");
  await expect(portfolio).toContainText("125.0% of the amount after your cash reserve");
  await expect(page.getByRole("link", { name: "Open Portfolio", exact: true })).toBeVisible();
});

test("older research stays discoverable with a keyboard and survives a mode switch", async ({ page }) => {
  let project = savedWork();
  for (let i = 0; i < 4; i++) {
    project = saveInvestigation(project, { company: `Earlier company ${i}`, sic: "3674", figures: {}, riskFreePct: null }, `earlier-${i}`, `2026-09-1${i}T12:00:00.000Z`);
  }
  await openSavedWork(page, project);
  const companies = page.getByRole("region", { name: "Companies you have looked into" });
  await expect(companies.getByRole("listitem")).toHaveCount(3);
  const more = companies.getByRole("button", { name: "Show all 5 companies" });
  await more.focus();
  await page.keyboard.press("Enter");
  await expect(companies.getByRole("listitem")).toHaveCount(5);
  await page.getByRole("button", { name: "Your own", exact: true }).click();
  await expect(page.getByRole("region", { name: "Your portfolio, taking shape" })).toContainText("Planning amount");
  await expect(page.getByRole("region", { name: "What this money is for", exact: true })).not.toContainText("A place of my own");
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await expect(page.getByRole("region", { name: "What this money is for", exact: true })).toContainText("A place of my own");
});

test("mobile menus stay inside the viewport and close with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/studio");
  await expect(page.getByRole("heading", { name: "Your next move." })).toBeVisible();
  await page.getByRole("button", { name: "Backup and restore", exact: true }).click();
  const menu = page.getByRole("group", { name: "Backup and restore", exact: true });
  const bounds = await menu.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await expect(menu.getByRole("button", { name: "Download a backup" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: "Backup and restore", exact: true })).toBeFocused();
});

test("mobile research opens with a keyboard and keeps saved decisions reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openSavedWork(page, savedWork());
  const research = page.locator("summary").filter({ hasText: "Your research" });
  await expect(research).toContainText("1 company · 2 investments");
  await research.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Investments you have read about" })).toContainText("Decided against");
  await page.getByRole("link", { name: /Ampere Instruments/ }).click();
  await expect(page).toHaveURL(/\/studio\/investigate\?company=company-ampere$/);
});

test("saved overview fits the six required widths and respects reduced motion", async ({ page }) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  const failedResources: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400) failedResources.push(response.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openSavedWork(page, savedWork());
  mkdirSync(".agent-shots", { recursive: true });
  const report: object[] = [];
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.agent-shots/studio-saved-${width}.png`, fullPage: true });
    const dimensions = await page.evaluate(() => ({ width: innerWidth, contentWidth: document.documentElement.scrollWidth, screens: document.documentElement.scrollHeight / innerHeight }));
    report.push(dimensions);
    expect(dimensions.contentWidth).toBeLessThanOrEqual(width);
    expect(dimensions.screens).toBeLessThanOrEqual(1.5);
    const moving = await page.locator("main").evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length);
    expect(moving).toBe(0);
  }
  writeFileSync(".agent-shots/studio-saved-report.json", JSON.stringify(report, null, 2));
  writeFileSync(".agent-shots/studio-runtime-report.json", JSON.stringify({ pageErrors, failedResources }, null, 2));
  expect(pageErrors).toEqual([]);
  // Vercel injects these scripts on its host; a local production server has neither endpoint.
  const localOnly = new Set(["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"]);
  expect(failedResources.filter(url => !localOnly.has(new URL(url).pathname))).toEqual([]);
});
