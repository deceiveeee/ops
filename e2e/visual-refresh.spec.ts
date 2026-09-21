import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

test("homepage experiment responds without moving the page at phone and tablet breakpoints", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const experiment = page.getByRole("region", { name: "What can time do to $100?" });
    await expect(experiment.getByRole("button", { name: "5 years", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => document.fonts.ready);
    const geometry = () => page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      evidence: Math.round(document.getElementById("evidence-title")!.getBoundingClientRect().top + scrollY),
      paths: Math.round(document.getElementById("paths-title")!.getBoundingClientRect().top + scrollY),
    }));
    const baseline = await geometry();
    for (const [name, expected] of [["1 year", "$105.00"], ["10 years", "$162.89"], ["5 years", "$127.63"]]) {
      await experiment.getByRole("button", { name, exact: true }).click();
      await expect(experiment.getByRole("status")).toContainText(expected);
      await expect(experiment.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
      expect(await geometry(), `${width}px after ${name}`).toEqual(baseline);
    }
    const note = page.getByRole("article", { name: "Atkore historical financial results" }).getByRole("status");
    await page.getByRole("button", { name: "Operating income", exact: true }).click();
    await expect(note).toContainText("Why did profit change so much?");
    expect(await geometry(), `${width}px after changing report line`).toEqual(baseline);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await experiment.getByText("How this example works", { exact: false }).click();
    await expect(experiment.getByText(/Real investment returns vary/)).toBeVisible();
    await expect(experiment.locator("svg path[style]").first()).toHaveCSS("transition-duration", "0s");
  }
});

test("homepage experiment supports keyboard input and every learning destination", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const experiment = page.getByRole("region", { name: "What can time do to $100?" });
  await experiment.getByRole("button", { name: "10 years", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(experiment.getByRole("status")).toContainText("$162.89");
  const paths = page.getByRole("region", { name: "A curious mind. A place to start." });
  await expect(paths.getByRole("link", { name: /Start with the why/ })).toHaveAttribute("href", "/courses/finance-foundations");
  await expect(paths.getByRole("link", { name: /Build your approach/ })).toHaveAttribute("href", "/courses/investment-foundations");
  await expect(paths.getByRole("link", { name: "Open Studio", exact: true })).toHaveAttribute("href", "/studio");
  await page.getByRole("link", { name: "Find your starting point", exact: true }).click();
  await expect(page).toHaveURL(/\/start$/);
});

test("homepage introduces real interest-rate history and links the real destinations", async ({ page }) => {
  await page.goto("/");
  const chart = page.getByRole("figure", { name: "Banks’ overnight borrowing rate" });
  await expect(chart).toBeVisible();
  for (const value of ["0.08%", "5.33%", "4.48%"])
    await expect(chart.getByText(value, { exact: true })).toBeVisible();
  await expect(chart.getByRole("button")).toHaveCount(0);
  await expect(chart.getByRole("table")).toHaveCount(0);
  await expect(chart.getByRole("link", { name: "Explore why" })).toHaveAttribute("href", /federalreserve\.gov\/monetarypolicy\//);
  await page.getByRole("button", { name: "Operating income" }).click();
  // Scoped to the live region: the note now sits beside an aria-hidden sizer
  // holding every variant, so a page-wide text lookup matches twice. Asserting
  // on the region also checks what a screen reader is told, not just presence.
  const note = page.getByRole("article", { name: "Atkore historical financial results" }).getByRole("status");
  await expect(note).toBeVisible();
  await expect(note).toContainText("Why did profit change so much?");
  await expect(page.getByRole("link", { name: "Read the original SEC report" })).toHaveAttribute("href", /sec\.gov\/Archives/);
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
