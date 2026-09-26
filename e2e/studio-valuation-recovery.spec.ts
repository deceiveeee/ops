import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const apple = { cik: "0000320193", ticker: "AAPL", name: "Apple Inc." };
async function scenarioAction(page: Page, name: string) {
  const action = page.getByRole("button", { name, exact: true });
  if (!await action.isVisible()) await page.getByText("Scenario options", { exact: true }).click();
  await action.click();
}

test("invalid figures on a phone lead back to the right input and secondary views receive focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/studio/valuation");
  await page.getByRole("button", { name: "Try a worked example" }).click();
  await page.getByRole("tab", { name: "Figures", exact: true }).click();
  const borrowings = page.getByLabel("Borrowings ($m)", { exact: true });
  const receipt = page.getByLabel("Company shares per traded share", { exact: true });
  await borrowings.fill("30o");
  // Mobile hides the result panel here; the problem must still be visible beside the inputs.
  await expect(page.getByRole("region", { name: "Figures for this valuation" }).getByRole("status")).toContainText("Borrowings ($m) is not a number");
  await page.getByRole("tab", { name: "Value and price", exact: true }).click();
  await page.getByRole("button", { name: "Review this input →", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Figures", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(borrowings).toBeFocused();
  await borrowings.fill("300");
  await receipt.fill("0");
  await page.getByRole("tab", { name: "Value and price", exact: true }).click();
  await page.getByRole("button", { name: "Review this input →", exact: true }).click();
  await expect(receipt).toBeFocused();
  await receipt.fill("1");

  await page.getByText("Scenario options", { exact: true }).click();
  await page.getByRole("button", { name: "Sources", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Where the figures came from", exact: true })).toBeFocused();
});

test("a pending company load cannot replace a reopened saved scenario", async ({ page }) => {
  let finishRequest!: () => void;
  const pending = new Promise<void>((resolve) => { finishRequest = resolve; });
  await page.route("**/api/studio/company-search*", (route) => route.fulfill({ json: { companies: [apple] } }));
  await page.route("**/api/studio/peer-figures*", async (route) => {
    await pending;
    await route.fulfill({ status: 503, json: {} });
  });
  await page.goto("/studio/valuation");
  await page.getByRole("button", { name: "Try a worked example" }).click();
  await scenarioAction(page, "Choose company");
  await page.getByRole("searchbox", { name: "Find a company" }).fill("Apple");
  await page.getByRole("button", { name: /AAPL.*Load figures/ }).click();
  await expect(page.getByLabel("Open a saved scenario")).toBeDisabled();
  finishRequest();
  await expect(page.getByLabel("Open a saved scenario")).toBeEnabled();
  await page.getByLabel("Open a saved scenario").selectOption({ label: "OPS example company · Worked example" });
  await expect(page.getByRole("region", { name: "Value and market price" })).toContainText("$14.50");
});

test("search failure offers retry and a manual company that survives reload", async ({ page }) => {
  await page.route("**/api/studio/company-search*", (route) => route.fulfill({ status: 502, json: { error: "Connection failed" } }));
  await page.goto("/studio/valuation");
  await page.getByRole("searchbox", { name: "Find a company" }).fill("Apple");
  await expect(page.getByRole("button", { name: "Retry company search" })).toBeVisible();
  await page.getByRole("button", { name: "Enter figures yourself" }).click();
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue("Apple");
  await page.getByLabel("Ticker (optional)").fill("AAPL");
  await page.getByRole("button", { name: "Continue to figures", exact: true }).click();
  await expect(page.getByRole("region", { name: "Figures for this valuation" })).toBeVisible();
  await expect(page.getByLabel("Annual operating profit after tax ($m)", { exact: true })).toHaveValue("");
  await page.getByLabel("Annual operating profit after tax ($m)", { exact: true }).fill("150");
  await expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Annual operating profit after tax ($m)", { exact: true })).toHaveValue("150");
  await scenarioAction(page, "Sources");
  await expect(page.getByRole("region", { name: "Sources for this valuation" })).toContainText("entered by you");
});

test("search retries the same query and failed figures retain the selected identity", async ({ page }) => {
  let requests = 0;
  let figureRequests = 0;
  await page.route("**/api/studio/company-search*", (route) => {
    requests += 1;
    return requests === 1 ? route.fulfill({ status: 502, json: {} }) : route.fulfill({ json: { companies: [apple], source: { kind: "saved", fetchedAt: "2026-09-21T00:00:00Z" } } });
  });
  await page.route("**/api/studio/peer-figures*", (route) => { figureRequests += 1; return route.fulfill({ json: { companies: [{ cik: apple.cik, unavailable: "EDGAR could not be reached." }] } }); });
  await page.goto("/studio/valuation");
  await page.getByRole("searchbox", { name: "Find a company" }).fill("apple");
  await page.getByRole("button", { name: "Retry company search" }).click();
  await expect(page.getByText(/Using the saved SEC company list from 2026-09-21/)).toBeVisible();
  await page.getByRole("button", { name: /AAPL.*Load figures/ }).click();
  await expect(page.getByRole("button", { name: "Retry loading figures" })).toBeVisible();
  await page.getByRole("button", { name: "Retry loading figures" }).click();
  await expect.poll(() => figureRequests).toBe(2);
  await page.getByRole("button", { name: "Enter figures yourself" }).click();
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue("Apple Inc.");
  await expect(page.getByLabel("Ticker (optional)")).toHaveValue("AAPL");
});

test("company search and recovery fit all six widths", async ({ page }) => {
  test.setTimeout(60_000);
  const report = ["# Valuation search and recovery", ""];
  mkdirSync(".agent-shots", { recursive: true });
  // The actual Apple query returns several similarly named companies.
  const matches = [apple,
    { cik: "0001418121", ticker: "APLE", name: "Apple Hospitality REIT, Inc." },
    { cik: "0001134982", ticker: "AAPI", name: "Apple iSports Group, Inc." },
    { cik: "0000063330", ticker: "MLP", name: "MAUI LAND & PINEAPPLE CO INC" },
  ];
  await page.route("**/api/studio/company-search*", (route) => route.fulfill({ json: { companies: matches, source: { kind: "saved", fetchedAt: "2026-09-21T00:00:00Z" } } }));
  await page.route("**/api/studio/peer-figures*", (route) => route.fulfill({ status: 503, json: {} }));
  await page.goto("/studio/valuation");
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("searchbox", { name: "Find a company" }).fill("");
    await page.getByRole("searchbox", { name: "Find a company" }).fill("apple");
    await expect(page.getByRole("button", { name: /AAPL.*Load figures/ })).toBeVisible();
    for (const state of ["results", "recovery", "manual"]) {
      if (state === "recovery") {
        await page.getByRole("button", { name: /AAPL.*Load figures/ }).click();
        await expect(page.getByRole("button", { name: "Retry loading figures" })).toBeVisible();
      }
      if (state === "manual") await page.getByRole("button", { name: "Enter figures yourself" }).click();
      await page.screenshot({ path: `.agent-shots/valuation-${state}-${width}.png`, fullPage: true });
      const size = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      report.push(`- ${state}, ${width}px: ${size.screens.toFixed(2)} screens; overflow ${size.overflow}px`);
      expect.soft(size.screens).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow).toBe(0);
    }
    await page.getByRole("button", { name: "Back to search" }).click();
  }
  writeFileSync(".agent-shots/valuation-recovery-report.md", report.join("\n"));
});
