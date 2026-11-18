import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { PUZZLES } from "../data/daily-puzzle/puzzles";
import { todaysNumber } from "../lib/daily-puzzle/schedule";

/*
 * The homepage opens on the daily company puzzle. Which puzzle that is depends
 * on the date, so the expected one is worked out here the way the page works
 * it out: today's number in New York, or the newest once the published
 * puzzles run out.
 */
const shownPuzzle = () => PUZZLES[Math.min(todaysNumber(new Date()), PUZZLES.length) - 1];
const clue = (page: import("@playwright/test").Page, id: string) => page.locator(`[data-clue="${id}"]`);

test("homepage opens on today's company puzzle at every width, without the answer", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const puzzle = shownPuzzle();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn investing, then practice on real company reports.");
    const region = page.getByRole("region", { name: "Which company is this?" });
    await expect(region).toContainText(`#${puzzle.number}`);
    await expect(clue(page, "revenue")).toHaveAttribute("data-state", "shown");
    await expect(clue(page, "revenue")).toContainText("of revenue in the year ending");
    await expect(clue(page, "margin")).toHaveAttribute("data-state", "hidden");
    await expect(page.getByText(puzzle.answer.name, { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${width}px scrolls sideways`).toBe(true);
  }
});

test("a clue shown on the homepage is still shown on the puzzle page", async ({ page }) => {
  const puzzle = shownPuzzle();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("region", { name: "Which company is this?" }).getByRole("button", { name: "Show the next clue" }).click();
  await expect(clue(page, "margin")).toHaveAttribute("data-state", "shown");
  await expect(page.getByText("2 of 6 clues showing")).toBeVisible();
  await page.goto(`/daily/${puzzle.number}`);
  await expect(clue(page, "margin")).toHaveAttribute("data-state", "shown");
  await expect(page.getByText("2 of 6 clues showing")).toBeVisible();
});

/*
 * The design check measures a fresh page. The tallest homepage is a finished
 * puzzle: all six clues open, their "What this means" links and the result.
 * The budget is in docs/design/anti-template-restructure-plan-2026-11-04.md.
 */
for (const [width, height, budget] of [[1440, 900, 3.5], [390, 844, 5]] as const) {
  test(`a finished puzzle keeps the homepage within ${budget} screens at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const region = page.getByRole("region", { name: "Which company is this?" });
    for (let shown = 1; shown < 6; shown++) await region.getByRole("button", { name: "Show the next clue" }).click();
    await region.getByRole("button", { name: "Give up and see the answer" }).click();
    await expect(page.getByRole("heading", { name: /^It was / })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const screens = await page.evaluate(() => document.documentElement.scrollHeight / innerHeight);
    expect(screens, `${screens.toFixed(2)} screens`).toBeLessThanOrEqual(budget);
  });
}

test("homepage links every destination it names", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const contents = page.getByRole("region", { name: "Two courses, Studio and company reports" });
  for (const [name, href] of [
    ["Finance Foundations", "/courses/finance-foundations"],
    ["Investment Foundations", "/courses/investment-foundations"],
    ["Studio", "/studio"],
    ["Company reports", "/studio/filings"],
  ]) await expect(contents.getByRole("link", { name: new RegExp(`^${name}`) })).toHaveAttribute("href", href);
  await expect(page.getByRole("link", { name: "Fixed-income securities" })).toHaveAttribute("href", "/courses/finance-foundations#module-3");
  await expect(page.getByRole("link", { name: /See both courses/ })).toHaveAttribute("href", "/courses");
  await page.getByRole("region", { name: "Learn investing, then practice on real company reports." }).getByRole("link", { name: "Find where to start", exact: true }).click();
  await expect(page).toHaveURL(/\/start$/);
});

test("the homepage's bond link opens Finance Foundations at module 3, with only that module open", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Fixed-income securities" }).click();
  await expect(page).toHaveURL(/\/courses\/finance-foundations#module-3$/);
  await expect(page.locator("#module-3")).toHaveAttribute("open", "");
  await expect(page.locator("details[id^=module-][open]")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Bond Markets.*Discount Bonds/ })).toBeVisible();
});

test("course pages fold to one open module or mission at a time", async ({ page }) => {
  await page.goto("/courses/finance-foundations");
  await expect(page.locator("details[id^=module-][open]")).toHaveCount(1);
  await page.locator("#module-4 > summary").click();
  await expect(page.locator("#module-4")).toHaveAttribute("open", "");
  await expect(page.locator("details[id^=module-][open]")).toHaveCount(1);
  await page.goto("/courses/investment-foundations");
  const missions = page.locator("details[name] > summary");
  await missions.nth(0).click();
  await missions.nth(1).click();
  await expect(page.locator("details[name][open]")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Set your goal and your limits" })).toHaveAttribute("href", /^\/lessons\//);
  await expect(page.getByRole("link", { name: /journey/i })).toHaveCount(0);
});

test("homepage introduces real interest-rate history and links the real destinations", async ({ page }) => {
  await page.goto("/");
  const chart = page.getByRole("figure", { name: "Banks’ overnight borrowing rate" });
  await expect(chart).toBeVisible();
  for (const value of ["0.08%", "5.33%", "4.48%"])
    await expect(chart.getByText(value, { exact: true })).toBeVisible();
  await expect(chart.getByRole("button")).toHaveCount(0);
  await expect(chart.getByRole("table")).toHaveCount(0);
  await expect(chart.getByRole("link", { name: "How the Fed sets this rate" })).toHaveAttribute("href", /federalreserve\.gov\/monetarypolicy\//);
  await expect(chart.getByRole("link", { name: /Federal Reserve Board, H\.15/ })).toHaveAttribute("href", /federalreserve\.gov/);
  await page.getByRole("banner").getByRole("link", { name: "Open Studio", exact: true }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByRole("navigation", { name: "Studio sections" })).toBeVisible();
  await expect(page.locator(".site-shell")).toHaveCSS("background-color", "rgb(245, 245, 247)");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Courses", exact: true }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.locator(".site-shell")).toHaveCSS("background-color", "rgb(245, 245, 247)");
});

test("mobile navigation works with keyboard and closes on navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.click();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Courses", exact: true }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("capture the shared visual system", async ({ page }) => {
  test.skip(process.env.OPS_REFRESH_CAPTURE !== "1", "optional screenshot evidence");
  test.setTimeout(240_000);
  mkdirSync(".agent-shots", { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const report: object[] = [];
  for (const [name, route] of [
    ["home", "/"], ["courses", "/courses"], ["studio", "/studio"],
    ["lesson", "/lessons/present-value-cashflows-assets-npv"],
    ["industry", "/studio/industry"], ["investigate", "/studio/investigate"],
    ["reports", "/filings"], ["plan", "/plan"],
  ]) {
    for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      await page.screenshot({ path: ".agent-shots/refresh-" + name + "-" + width + ".png", fullPage: true, animations: "disabled" });
      report.push({ name, width, ...await page.evaluate(() => ({
        screens: Number((document.documentElement.scrollHeight / innerHeight).toFixed(2)),
        sideways: document.documentElement.scrollWidth > innerWidth,
        theme: getComputedStyle(document.querySelector(".site-shell")!).backgroundColor,
      })) });
    }
  }
  writeFileSync(".agent-shots/refresh-report.json", JSON.stringify({ report, errors }, null, 2));
  expect(errors).toEqual([]);
});
