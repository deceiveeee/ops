import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const valuePanel = (page: Page) => page.getByRole("region", { name: "Value and market price" });
const cashFlow = (page: Page) => page.getByRole("region", { name: "How profit becomes value" });
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
async function scenarioAction(page: Page, name: string) {
  const action = page.getByRole("button", { name, exact: true });
  if (!await action.isVisible()) await page.getByText("Scenario options", { exact: true }).click();
  await action.click();
}
async function openIndustryReference(page: Page) {
  const reference = page.getByRole("combobox", { name: "Industry cost reference", exact: true });
  if (!await reference.isVisible()) await page.getByText(/^(Industry reference:|Use an industry cost reference$)/).click();
  return reference;
}
// Match peer-figures' complete response shape. These extra API fields must not
// leak into the stricter saved source snapshot and make a real company unsavable.
const figure = (key: string, value: number) => ({ key, value: value * 1e6, concepts: [`Filed${key}`], addedUp: null, periodEnd: "2025-09-30" });
const company = {
  cik: "0001666138", name: "Atkore Inc.", sic: "3690", sector: "general", periodEnd: "2025-09-30",
  figures: [figure("revenue", 1000), figure("operatingProfit", 200), figure("pretaxProfit", 160), figure("taxExpense", 40), figure("totalDebt", 300), figure("equity", 700), figure("cash", 100)],
  shares: { value: 100e6, concept: "WeightedAverageNumberOfDilutedSharesOutstanding" },
  filing: { url: "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm" },
};
async function sourceCompany(page: Page, payload: unknown = company) {
  await page.route("**/api/studio/company-search*", (route) => route.fulfill({ json: { companies: [{ cik: company.cik, name: company.name, ticker: "ATKR" }] } }));
  await page.route("**/api/studio/peer-figures*", (route) => route.fulfill({ json: { companies: [payload] } }));
  await page.goto("/studio/valuation?ticker=ATKR");
  await page.getByRole("button", { name: /ATKR.*Load figures/ }).click();
}

test("valuation persists edits, separate scenarios and reasoning without adding a holding", async ({ page }) => {
  await page.goto("/studio/valuation");
  await page.getByRole("button", { name: "Try a worked example" }).click();
  await expect(valuePanel(page)).toContainText("$14.50");
  await expect(cashFlow(page)).toContainText("12.0%");
  await page.getByLabel("Growth each year (%)", { exact: true }).fill("0");
  await expect(valuePanel(page)).toContainText("$13.00");
  await expect(cashFlow(page)).toContainText("0.0%");
  await page.getByRole("button", { name: "Continue to value and price" }).click();
  await page.getByLabel("Market price per traded share ($)", { exact: true }).fill("12");
  await page.getByLabel("Price date", { exact: true }).fill("2026-09-18");
  // Copy immediately after the last edit: queued writes must be included.
  await scenarioAction(page, "Copy scenario");
  await page.getByLabel("Growth each year (%)", { exact: true }).fill("2");
  await page.getByText("Scenario name and reasoning", { exact: true }).click();
  await page.getByLabel("Scenario name", { exact: true }).fill("Steady growth");
  await page.getByLabel("Why these assumptions?", { exact: true }).pressSequentially("New capital can earn its historical return.");
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Growth each year (%)", { exact: true })).toHaveValue("2");
  await page.getByRole("tab", { name: "Value and price", exact: true }).click();
  await expect(page.getByLabel("Market price per traded share ($)", { exact: true })).toHaveValue("12");
  await expect(page.getByLabel("Price date", { exact: true })).toHaveValue("2026-09-18");
  await page.getByRole("tab", { name: "Assumptions", exact: true }).click();
  await page.getByText("Scenario name and reasoning", { exact: true }).click();
  await expect(page.getByLabel("Why these assumptions?", { exact: true })).toHaveValue("New capital can earn its historical return.");
  await page.getByText("Scenario name and reasoning", { exact: true }).click();
  await scenarioAction(page, "Compare scenarios");
  await expect(page.getByRole("row", { name: /Worked example/ })).toContainText("$13.00");
  await expect(page.getByRole("row", { name: /Steady growth/ })).toContainText("$14.50");
  await page.getByRole("tab", { name: "Figures", exact: true }).click();
  await page.getByLabel("Company shares per traded share", { exact: true }).fill("0");
  await expect(valuePanel(page)).toContainText("must be above zero");
  await saved(page);
  await page.reload();
  await expect(valuePanel(page)).toContainText("must be above zero");
});

test("a sourced company keeps original figures and industry reference after reload", async ({ page }) => {
  await sourceCompany(page);
  await expect(valuePanel(page)).toContainText("Next:");
  await page.getByRole("tab", { name: "Figures", exact: true }).click();
  await expect(page.getByLabel("Annual operating profit after tax ($m)", { exact: true })).toHaveValue("150");
  await expect(page.getByLabel("Shares (millions)", { exact: true })).toHaveValue("100");
  await expect(page.getByLabel("Company shares per traded share", { exact: true })).toHaveValue("");
  await page.getByRole("button", { name: "Use 1 for an ordinary share", exact: true }).click();
  await expect(page.getByLabel("Company shares per traded share", { exact: true })).toHaveValue("1");
  await page.getByRole("button", { name: "Continue to assumptions", exact: false }).click();
  await page.getByLabel("Growth each year (%)", { exact: true }).fill("2");
  await page.getByLabel("Cost of capital (%)", { exact: true }).fill("10");
  await expect(valuePanel(page)).toContainText("$14.50");
  await (await openIndustryReference(page)).selectOption({ label: "Advertising" });
  await saved(page);
  await page.route("**/api/studio/peer-figures*", (route) => route.abort());
  // Research links become case links. Reloading restores the snapshot without a refetch.
  await expect(page).toHaveURL(/\/studio\/valuation\?case=/);
  await page.reload();
  await expect(await openIndustryReference(page)).toHaveValue("Advertising");
  await scenarioAction(page, "Sources");
  await expect(page.getByRole("link", { name: "SEC filing · year to 2025-09-30" })).toHaveAttribute("href", company.filing.url);
  await page.getByLabel("Inspect a source figure").selectOption({ label: "Share count" });
  await expect(page.getByRole("region", { name: "Sources for this valuation" })).toContainText(company.shares.concept);
  await page.getByLabel("Source to inspect").selectOption("method");
  await expect(page.getByRole("region", { name: "Sources for this valuation" })).toContainText("Advertising:");
});

test("unsupported company models are explained before a case is saved", async ({ page }) => {
  await sourceCompany(page, { ...company, sector: "banking" });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("does not support financial or property companies");
  await expect(page.getByLabel("Saved scenario")).toHaveCount(0);
});

test("reads a figure as the report prints it, and names one it cannot read", async ({ page }) => {
  await page.goto("/studio/valuation");
  await page.getByRole("button", { name: "Try a worked example" }).click();
  await page.getByRole("tab", { name: "Figures", exact: true }).click();
  const profit = page.getByLabel("Annual operating profit after tax ($m)", { exact: true });
  await profit.fill("1,500");
  await page.getByLabel("Shares (millions)", { exact: true }).fill("1,000");
  // 1,500 of profit over 1,000 shares is the example's 150 over 100, with net debt ten times smaller per share.
  await expect(valuePanel(page)).toContainText("$16.30");
  await page.getByLabel("Borrowings ($m)", { exact: true }).fill("30o");
  await expect(valuePanel(page)).toContainText("Borrowings ($m) is not a number");
});

test("the view switches are tabs a keyboard can move between", async ({ page }) => {
  await page.goto("/studio/valuation");
  await page.getByRole("button", { name: "Try a worked example" }).click();
  const views = page.getByRole("tablist", { name: "Valuation views" });
  await expect(views.getByRole("tab", { selected: true })).toHaveAccessibleName("Assumptions");
  await views.getByRole("tab", { name: "Assumptions" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(views.getByRole("tab", { name: "Value and price" })).toBeFocused();
  await expect(views.getByRole("tab", { selected: true })).toHaveAccessibleName("Value and price");
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "valuation-tab-Value");
  await page.keyboard.press("End");
  await expect(views.getByRole("tab", { selected: true })).toHaveAccessibleName("Value and price");
  await page.keyboard.press("Home");
  await expect(views.getByRole("tab", { selected: true })).toHaveAccessibleName("Figures");
  // Growth of 100 is a phone's view; at this width the arrow skips it.
  await page.goto("/studio/portfolio/returns");
  await page.getByRole("tab", { name: "Inspect history" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Import a local history" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveAccessibleName("Import a total-return history");
});

test("public returns include distributions; local adjusted imports require confirmation and survive reload", async ({ page }) => {
  await page.goto("/studio/portfolio/returns");
  await expect(page.getByRole("region", { name: "History source and months" })).toContainText("C000007808");
  await expect(page.getByRole("region", { name: "History source and months" })).toContainText("18 months");
  await expect(page.getByRole("link", { name: "Read this month’s SEC source" })).toHaveAttribute("href", /^https:\/\/www.sec.gov\/Archives\//);
  await page.getByRole("tab", { name: "Import a local history" }).click();
  await page.getByLabel("Source name", { exact: true }).fill("Verified broker export");
  await page.getByRole("button", { name: "Continue to file" }).click();
  const file = (content: string) => page.getByLabel("Monthly CSV file").setInputFiles({ name: "history.csv", mimeType: "text/csv", buffer: Buffer.from(content) });
  await file("month,close\n2025-01,100\n2025-02,98");
  await page.getByRole("button", { name: "Validate and save history" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Raw close prices");
  await file("month,adjusted_close\n2024-12,100\n2025-01,102\n2025-02,99");
  await page.getByRole("button", { name: "Validate and save history" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Confirm that your source");
  await page.getByRole("checkbox", { name: /both distributions and stock splits/ }).check();
  await page.getByRole("button", { name: "Validate and save history" }).click();
  await expect(page.getByRole("region", { name: "Reinvested return chart" })).toContainText("-1.00%");
  await saved(page);
  await page.reload();
  await page.getByLabel("Return series").selectOption({ label: "AAPL · Verified broker export · local import" });
  await expect(page.getByRole("region", { name: "Reinvested return chart" })).toContainText("100 becomes 99.00");
});

test("new valuation and return surfaces fit six widths with usable controls", async ({ page }) => {
  test.setTimeout(120_000);
  const out = ".agent-shots";
  mkdirSync(out, { recursive: true });
  const report: string[] = ["# Valuation and return history visual evidence", ""];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await sourceCompany(page);
  await page.getByRole("tab", { name: "Figures", exact: true }).click();
  await page.getByLabel("Company shares per traded share", { exact: true }).fill("1");
  await page.getByRole("tab", { name: "Assumptions", exact: true }).click();
  await page.getByLabel("Growth each year (%)", { exact: true }).fill("2");
  await (await openIndustryReference(page)).selectOption({ label: "Advertising" });
  await expect(valuePanel(page)).not.toContainText("Next:");
  await saved(page);
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/studio/valuation");
    await expect(page.getByLabel("Growth each year (%)", { exact: true })).toHaveValue("2");
    const capture = async (name: string) => {
      await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });
      const dimensions = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      report.push(`- ${name}, ${width}px: ${dimensions.screens.toFixed(2)} screens; horizontal overflow ${dimensions.overflow}px`);
      expect.soft(dimensions.overflow, `${name}, ${width}`).toBe(0);
      expect.soft(dimensions.screens, `${name}, ${width}`).toBeLessThanOrEqual(1.5);
    };
    await capture("valuation-assumptions");
    await page.getByRole("tab", { name: "Value and price", exact: true }).click();
    await expect(valuePanel(page)).toBeVisible();
    await capture("valuation-value");
    await page.getByLabel("Market price per traded share ($)", { exact: true }).fill("13");
    await page.getByLabel("Price date", { exact: true }).fill("2026-09-18");
    await capture("valuation-priced");
    if (width < 768) {
      await page.getByRole("button", { name: "See calculation", exact: true }).click();
      await expect(cashFlow(page)).toBeVisible();
      await capture("valuation-calculation");
      await page.getByRole("button", { name: "Back to price comparison", exact: true }).click();
    } else await expect(cashFlow(page)).toBeVisible();
    await page.getByRole("tab", { name: "Figures", exact: true }).click();
    await capture("valuation-figures");
    await scenarioAction(page, "Sources");
    await capture("valuation-sources");
    await page.getByLabel("Source to inspect").selectOption("method");
    await capture("valuation-method");
    await scenarioAction(page, "Compare scenarios");
    await capture("valuation-compare");
    await page.goto("/studio/portfolio/returns");
    await expect(page.getByLabel("Return series")).toBeVisible();
    await capture("total-return-history");
    if (width < 768) {
      await page.getByRole("tab", { name: "Growth of 100" }).click();
      await capture("total-return-growth");
    }
    await page.getByRole("tab", { name: "Import a local history" }).click();
    await capture("total-return-import");
    await page.getByLabel("Source name", { exact: true }).fill("Broker export");
    await page.getByRole("button", { name: "Continue to file" }).click();
    await capture("total-return-import-file");
  }
  report.push(`\nPage errors: ${errors.length ? errors.join("; ") : "none"}`);
  writeFileSync(`${out}/valuation-history-report.md`, report.join("\n"));
  expect(errors).toEqual([]);
});
