import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { readRevenue } from "../lib/filings/revenue";

/**
 * Where Atkore's revenue comes from, in the company-report reader.
 *
 * The research report's R8: what Atkore sells, where, and to whom, from its
 * annual report's own data file, with every list's shares adding up to total
 * revenue. The figures here are not typed in. They are worked out by the same
 * rules the page uses, from the same trimmed data and label files the test
 * server reads (e2e/fixtures/edgar, see its README), so the test checks that
 * the page shows exactly what the filing adds up to, and nothing else.
 *
 * Rows are found inside the list their heading names, by their exact name: the
 * first version matched the product line "Metal Electrical Conduit and
 * Fittings" when it meant the Electrical segment.
 */

const REPORT = "/studio/filings/0001666138/0001628280-25-054049?doc=atkr-20250930.htm&ticker=ATKR";
const REVENUE = `${REPORT}&section=revenue`;
const BASE = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/";
const TITLE = { products: "By product line", regions: "By region", segments: "By segment" } as const;

const fixture = (url: string) =>
  readFileSync(join(process.cwd(), "e2e", "fixtures", "edgar", url.replace(/[^A-Za-z0-9._-]/g, "_")), "utf8");

const expected = readRevenue(fixture(`${BASE}atkr-20250930_htm.xml`), fixture(`${BASE}atkr-20250930_lab.xml`));
if (!expected.found) throw new Error(`the fixture does not read: ${expected.reason}`);
const { revenue } = expected;
const percent = (share: number) => `${(share * 100).toFixed(1)}%`;

test("offers the tab on an annual report, beside the sections it reads", async ({ page }) => {
  await page.goto(REPORT);
  const tab = page.getByRole("navigation", { name: "Sections of this report" }).getByRole("link", { name: "Where revenue comes from" });
  await expect(tab).toHaveAttribute("href", /section=revenue/);
  // Right after Business, which it complements, so it is in view without scrolling the row.
  await expect(page.getByRole("navigation", { name: "Sections of this report" }).getByRole("link").nth(1)).toHaveText("Where revenue comes from");

  await tab.click();
  await expect(tab).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 2, name: /^Where .+ revenue comes from$/ })).toBeVisible();
});

test("shows each breakdown exactly as the report's data file adds it up", async ({ page }) => {
  await page.goto(REVENUE);
  const section = page.getByRole("region", { name: /revenue comes from/ });

  await expect(section).toContainText(`revenue was $${Math.round(revenue.total / 1_000_000).toLocaleString("en-US")}m`);
  const found = revenue.breakdowns.filter((entry) => entry.found);
  expect(found.map((entry) => entry.kind)).toEqual(["products", "regions", "segments"]);
  for (const entry of found) {
    if (!entry.found) continue;
    const items = section.getByRole("list", { name: TITLE[entry.kind] }).getByRole("listitem");
    await expect(items, entry.kind).toHaveCount(entry.rows.length);
    for (const row of entry.rows) {
      const item = items.filter({ has: page.getByText(row.label, { exact: true }) });
      await expect(item, `${entry.kind}: ${row.label}`).toHaveCount(1);
      await expect(item, `${entry.kind}: ${row.label}`).toContainText(percent(row.share));
    }
  }
});

test("names the customers Atkore depends on, and what each share is of", async ({ page }) => {
  await page.goto(REVENUE);
  const items = page.getByRole("list", { name: "Customers it depends on" }).getByRole("listitem");

  expect(revenue.customers.length).toBeGreaterThan(0);
  await expect(items).toHaveCount(revenue.customers.length);
  for (const customer of revenue.customers) {
    const share = `${Number((customer.share * 100).toFixed(1))}% of ${customer.of === "sales" ? "sales" : "what customers owed"}`;
    await expect(items.filter({ hasText: customer.customer }).filter({ hasText: share })).toHaveCount(1);
  }
});

test("links to the data file the figures come from", async ({ page }) => {
  await page.goto(REVENUE);
  await expect(page.getByRole("region", { name: /revenue comes from/ }).getByRole("link", { name: "data file" })).toHaveAttribute(
    "href",
    `${BASE}atkr-20250930_htm.xml`,
  );
});

test("keeps the report's heading readable on a phone", async ({ page }) => {
  // The facts under the heading once kept their row beside the search box at 390px, one word to a line.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(REVENUE);
  const facts = page.getByText(/SEC reference/).first();
  await expect(facts).toBeVisible();
  expect(await facts.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(280);
});

test("keeps the view within the screen budget at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(REVENUE);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1_350);
});
