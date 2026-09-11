import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

test("homepage teaches a rate comparison and links the real destinations", async ({ page }) => {
  await page.goto("/");
  const demo = page.getByRole("region", { name: "What is a future payment worth today?" });
  await expect(demo.getByRole("status")).toContainText("$821.93");
  await demo.getByRole("button", { name: "8%", exact: true }).click();
  await expect(demo.getByRole("status")).toContainText("$680.58");
  await expect(demo.getByRole("status")).toContainText("$141.34 less");
  await demo.getByText("See the calculation", { exact: true }).click();
  await expect(demo.getByText(/Value today =/)).toContainText("0.08");
  await demo.getByRole("button", { name: "4%", exact: true }).click();
  await expect(demo.getByRole("status")).toContainText("$821.93");
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
