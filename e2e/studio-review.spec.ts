import { expect, test, type Page } from "@playwright/test";
import { seedProject, typedProject } from "./studio-seed";

test("Review tabs move by keyboard and show the selected task", async ({ page }) => {
  await page.goto("/studio/review");
  const tabs = page.getByRole("tablist", { name: "Review" });
  await expect(tabs.getByRole("tab", { selected: true })).toHaveText("Your rules");
  await expect(page.getByLabel("What I do with new money")).toBeVisible();

  await tabs.getByRole("tab", { name: "Your rules" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "When you check" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "review-tab-check");
  await expect(page.getByLabel("How often you will check")).toBeVisible();
  await expect(page.getByLabel("New money to put in now")).toBeVisible();
  await expect(page.getByLabel("What I do with new money")).toHaveCount(0);

  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "Holdings today" })).toBeFocused();
  await expect(page.getByLabel("Cash in this portfolio today")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Portfolio" })).toBeVisible();

  await page.keyboard.press("End");
  await expect(tabs.getByRole("tab", { selected: true })).toHaveText("Keep a copy");
  await expect(page.getByRole("button", { name: "Download the readable plan" })).toBeVisible();

  await page.getByRole("button", { name: "Your own", exact: true }).click();
  await tabs.getByRole("tab", { name: "When you check" }).click();
  await page.getByLabel("New money to put in now").fill("1000");
  const check = page.getByRole("tabpanel");
  await expect(check.getByRole("link", { name: "Open Goals" })).toHaveAttribute("href", "/studio/goals");
  await expect(check.getByText("stays in cash", { exact: false })).toHaveCount(0);
});

test("each Review tab fits a screen and a half at the six supported widths", async ({ page }, info) => {
  test.setTimeout(90_000);
  await seedProject(page, typedProject([["vti", 100]]), "/studio/review");
  await page.getByRole("tab", { name: "Holdings today" }).click();
  await page.getByLabel("VTI value today").fill("9000");
  await page.getByLabel("Cash in this portfolio today").fill("1000");
  await expect(page.getByText("10 percentage points below target.", { exact: false })).toBeVisible();
  await page.getByRole("checkbox", { name: "I’ve entered all holdings and cash" }).check();
  const report: string[] = [];
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ["Your rules", "When you check", "Keep a copy", "Holdings today"]) {
      await page.getByRole("tab", { name }).click();
      if (name === "Holdings today") {
        await page.getByRole("checkbox", { name: "I’ve entered all holdings and cash" }).check();
      }
      const size = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      report.push(`${width} ${name}: ${size.screens.toFixed(2)}`);
      expect.soft(size.screens, `${name} at ${width}`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `${name} at ${width}`).toBe(0);
      if (name === "Holdings today" && process.env.OPS_CAPTURE_REVIEW === "1") {
        await page.screenshot({ path: info.outputPath(`holdings-${width}.png`), fullPage: true });
      }
    }
  }
  console.log(report.join("\n"));
});

test("Review keeps each holding value and uses cash and holdings to plan a contribution", async ({ page }) => {
  test.setTimeout(90_000);
  await seedProject(page, typedProject([["vti", 60], ["vxus", 40]]), "/studio/review");
  await page.getByRole("tab", { name: "When you check" }).click();
  await page.getByRole("button", { name: "Enter current values" }).press("Enter");
  await expect(page.getByRole("tab", { name: "Holdings today" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Cash in this portfolio today")).toBeFocused();
  await expect(page.getByText("Enter values to compare", { exact: false })).toBeVisible();
  const holding = page.getByRole("combobox", { name: "Holding to check" });
  await expect(holding).toHaveValue("vti");
  await page.getByLabel("VTI value today").fill("6200");
  await holding.press("End");
  await expect(holding).toHaveValue("vxus");
  await page.keyboard.press("Tab");
  const vxusValue = page.getByLabel("VXUS value today");
  await expect(vxusValue).toBeFocused();
  await vxusValue.fill("2800");
  await page.getByLabel("Cash in this portfolio today").fill("1000");
  await expect(page.getByText("12 percentage points below target.", { exact: false })).toBeVisible();
  const confirmBalances = page.getByRole("checkbox", { name: "I’ve entered all holdings and cash" });
  await expect(page.getByText("Meets your 5-point threshold for action.", { exact: false })).toHaveCount(0);
  await confirmBalances.check();
  await expect(page.getByText("Meets your 5-point threshold for action.", { exact: false })).toBeVisible();
  await vxusValue.fill("");
  await vxusValue.press("Tab");
  await expect(vxusValue).toHaveValue("2800");
  await vxusValue.fill("2800.01");
  await expect(confirmBalances).not.toBeChecked();
  await vxusValue.fill("2800");
  await holding.selectOption("vti");
  await expect(page.getByText("2 percentage points above target.", { exact: false })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();

  await page.reload();
  await page.getByRole("tab", { name: "Holdings today" }).click();
  await holding.selectOption("vxus");
  await expect(vxusValue).toHaveValue("2800");
  await expect(page.getByLabel("Cash in this portfolio today")).toHaveValue("1000");
  await holding.selectOption("vti");
  await expect(page.getByLabel("VTI value today")).toHaveValue("6200");
  await page.getByRole("tab", { name: "When you check" }).click();
  await page.getByLabel("New money to put in now").fill("1000");
  await expect(page.getByText("$200.00 toward VTI", { exact: true })).toBeVisible();
  await expect(page.getByText("$800.00 toward VXUS", { exact: true })).toBeVisible();
});
