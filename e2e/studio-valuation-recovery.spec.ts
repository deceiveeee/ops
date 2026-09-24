import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const apple = { cik: "0000320193", ticker: "AAPL", name: "Apple Inc." };

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
  await page.getByRole("button", { name: "Choose company", exact: true }).click();
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
  await page.getByRole("button", { name: "Sources", exact: true }).click();
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
