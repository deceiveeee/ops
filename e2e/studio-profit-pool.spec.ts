import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { storedProjects } from "./project-store";

/**
 * See where the money is made: the profit pool for each researched industry.
 *
 * What matters here: the page works the arithmetic for a block before asking
 * anyone to read the picture, every block can be reached without a mouse, and
 * a pool never passes for more of its industry than it covers. The companies it
 * leaves out are named with their reasons, and the one a learner investigated
 * is marked on its block.
 *
 * Expected figures are from the separate calculation recorded in
 * lib/studio-project/profit-pool.test.ts.
 */

const POOL = "/studio/pool";
const main = (page: Page) => page.getByRole("main");
const readout = (page: Page) => main(page).getByRole("status", { name: "The arithmetic for one block" });

async function openDisclosure(page: Page, name: string) {
  await main(page).locator("summary").filter({ hasText: name }).click();
}

test("the page opens on a worked example before anything else is asked", async ({ page }) => {
  await page.goto(POOL);
  await expect(page.getByRole("heading", { level: 1, name: "See where the money is made" })).toBeVisible();
  // The definition comes before the chart that uses it.
  await expect(main(page)).toContainText("is its economic profit");

  // Semiconductors first; the widest block that creates value is Nvidia's.
  await expect(readout(page)).toContainText("Nvidia");
  await expect(readout(page)).toContainText("It earned 71.3% on $155.2B of capital");
  await expect(readout(page)).toContainText("capital in this industry costs 11.4%");
  await expect(readout(page)).toContainText("$93.0B of economic profit a year");
  await expect(main(page)).toContainText("Together these 9 companies made $90.0B of economic profit on $635.4B of capital");
  await expect(main(page)).toContainText("They made 77% of this industry’s revenue counted for 2024.");
});

test("every block can be chosen from the keyboard, and its arithmetic follows", async ({ page }) => {
  await page.goto(POOL);
  const intel = main(page).getByRole("button", { name: /^Intel: 11\.4 points below its cost of capital/ });
  await intel.focus();
  await expect(intel).toHaveAttribute("aria-pressed", "true");
  // A loss is said as a loss, not as a negative amount of profit.
  await expect(readout(page)).toContainText("Intel");
  await expect(readout(page)).toContainText("11.4 points less than it costs");
  await expect(readout(page)).toContainText("$16.8B a year short of what its capital costs");

  // Moving on with the keyboard moves the readout with it.
  await page.keyboard.press("Shift+Tab");
  await expect(readout(page)).not.toContainText("Intel");
});

test("a pool that covers little of its industry says so, and names who is missing", async ({ page }) => {
  await page.goto(POOL);
  await main(page).getByRole("button", { name: "Pharmaceutical preparations", exact: true }).click();
  await expect(main(page)).toContainText(
    "They made 22% of this industry’s revenue counted for 2024: most of it is not here.",
  );

  await openDisclosure(page, "Every company, and who is not drawn");
  await expect(main(page)).toContainText("Not drawn: Johnson & Johnson.");
  await expect(main(page)).toContainText("do not carry the operating profit line");
  // The figure Studio cannot stand behind is named, with the numbers that raised it.
  await expect(main(page)).toContainText("Not drawn: Universe Pharmaceuticals.");
  await expect(main(page)).toContainText("went from 0.008% to 3.9%");
});

test("figures in another currency are named rather than drawn several times too wide", async ({ page }) => {
  await page.goto(POOL);
  await main(page).getByRole("button", { name: "Prepackaged software", exact: true }).click();
  await openDisclosure(page, "Every company, and who is not drawn");
  await expect(main(page)).toContainText("Not drawn: Netease.");
  await expect(main(page)).toContainText("7.8 times the revenue the SEC records for it in dollars");
  // The table lists what is drawn, and Netease is not among it.
  await expect(main(page).getByRole("table").getByRole("row")).toHaveCount(10);
  await expect(main(page).getByRole("table")).not.toContainText("Netease");
});

test("a railroad the industry figures never counted is named, so 99% is not misread", async ({ page }) => {
  await page.goto(POOL);
  await main(page).getByRole("button", { name: "Railroads", exact: true }).click();
  await expect(main(page)).toContainText("They made 99% of this industry’s revenue counted for 2024.");
  await openDisclosure(page, "Every company, and who is not drawn");
  await expect(main(page)).toContainText("Not drawn: Burlington Northern Santa Fe.");
  await expect(main(page)).toContainText("two revenue figures too far apart");
});

test("the company a learner investigated is marked on its block", async ({ page }) => {
  // Restored through the app's own backup, the way a learner's work arrives
  // from another browser: a Walmart investigation filled from the SEC.
  await page.goto("/studio/review");
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download a backup" }).click(),
  ]).then(([event]) => event);
  const project = JSON.parse(readFileSync((await download.path())!, "utf8"));
  project.investigations = [
    {
      id: "inv-walmart",
      createdAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:00:00.000Z",
      company: "Walmart",
      sic: "",
      figures: {},
      riskFreePct: null,
      source: {
        ticker: "WMT",
        cik: "0000104169",
        entityName: "Walmart Inc.",
        sic: "5331",
        sicDescription: "Retail-Variety Stores",
        periodEnd: "2026-01-31",
        accession: "0000104169-26-000001",
        form: "10-K",
        filed: "2026-03-13",
        figures: {},
      },
    },
  ];
  const file = join(tmpdir(), `ops-pool-restore-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(project), "utf8");
  page.on("dialog", (dialog) => void dialog.accept());
  await page.setInputFiles('input[type="file"]', file);
  await expect
    .poll(async () => (await storedProjects(page)).some((item) => item.investigations?.some((inv) => inv.id === "inv-walmart")))
    .toBe(true);

  await page.goto(POOL);
  // It opens on Walmart's industry and on Walmart, not on the first industry.
  await expect(main(page).getByRole("button", { name: "Variety stores", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(readout(page)).toContainText("Walmart (the company you investigated)");
  await expect(readout(page)).toContainText("$11.7B of economic profit a year");
  await expect(main(page)).toContainText("The company you investigated");
  await openDisclosure(page, "Every company, and who is not drawn");
  await expect(main(page).getByRole("row").filter({ hasText: "Walmart" })).toContainText("yours");
});

test("it is step 2 of the research path, after the industry", async ({ page }) => {
  await page.goto("/studio/research");
  await page.getByRole("link", { name: /Step 1: See who is in an industry/ }).click();
  await expect(page).toHaveURL(/\/studio\/industry$/);
  await page.getByRole("navigation", { name: /Research steps/ }).getByRole("link", { name: /Next: See where the money is made/ }).click();
  await expect(page).toHaveURL(/\/studio\/pool$/);
  await expect(page.getByRole("heading", { level: 1, name: "See where the money is made" })).toBeVisible();
});
