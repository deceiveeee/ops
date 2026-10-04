import { expect, test, type Page } from "@playwright/test";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { createStudioProject } from "../lib/studio-project/create";
import { addPosition } from "../lib/studio-project/operations";
import type { StudioProject } from "../lib/studio-project/schema";

/**
 * Working out what to buy without leaving Studio.
 *
 * "What to buy" used to say Studio holds no market prices and ask for the quote a
 * broker shows, which was the last outside website on the Atkore journey. It now
 * starts every investment from its last price on record — a month-end closing
 * price from SEC holdings filings, or a Treasury auction price — with the date
 * beside it, and a learner's own broker price replaces it when entered.
 *
 * Every investment is a line of one list, and its worksheet opens from it: side
 * by side from 1440px, one at a time on anything narrower. Every worksheet open
 * at once made the page 3.2 screens on a phone with three holdings, and beside
 * the list in half a tablet's width a bond's worksheet was 1.76.
 *
 * No test here depends on the price itself, which changes whenever the data is
 * refreshed; the arithmetic is covered in lib/studio-catalog.test.ts.
 */

// Wide enough for the list and a worksheet side by side, unless a test says otherwise.
test.use({ viewport: { width: 1440, height: 900 } });

async function addToPortfolio(page: Page, symbol: string) {
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
}

async function portfolioOfVtiAndAgg(page: Page) {
  await page.goto("/studio/research");
  await addToPortfolio(page, "VTI");
  await addToPortfolio(page, "AGG");
  await page.goto("/studio/portfolio");
  await page.getByLabel("VTI target percentage").fill("60");
  await page.getByLabel("AGG target percentage").fill("40");
  // Moving by the page's own link keeps the workspace open, so the weights just typed come too.
  await page.getByRole("link", { name: "What to buy" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Work out what to buy" })).toBeVisible();
}

const researchPriceLine = (page: Page) =>
  page.getByRole("main").getByText(/^Worked out from \$[\d,]+\.\d{2} a share, the price on \d{1,2} [A-Z][a-z]+ 20\d\d: what funds holding it reported in their SEC holdings filings\. Not today’s price: check your broker’s before you buy\.$/);
const list = (page: Page) => page.getByRole("table", { name: "What to buy, investment by investment" });
const sheet = (page: Page, symbol: string) => page.getByRole("heading", { level: 2, name: symbol, exact: true });
const money = (text: string) => Number(text.replace(/[^0-9.-]/g, ""));

test("starts each investment from a dated price, so no broker quote is needed", async ({ page }) => {
  await portfolioOfVtiAndAgg(page);
  const main = page.getByRole("main");

  await expect(main).not.toContainText("Studio holds no market prices");
  await expect(main).not.toContainText("Enter a dated broker quote");
  // Each dated price is flagged as a price on record rather than today's: in the list once, and in each worksheet.
  await expect(main.getByText("A price on record is not today’s.", { exact: false })).toBeVisible();
  await expect(sheet(page, "VTI")).toBeVisible();
  await expect(researchPriceLine(page)).toHaveCount(1);
  await list(page).getByRole("button", { name: "AGG", exact: true }).click();
  await expect(sheet(page, "AGG")).toBeVisible();
  await expect(researchPriceLine(page)).toHaveCount(1);
});

test("uses the learner's broker price instead, once one is entered", async ({ page }) => {
  await portfolioOfVtiAndAgg(page);
  const main = page.getByRole("main");

  await page.getByText("Use your broker’s price, date and fee", { exact: true }).click();
  await page.getByLabel("Your broker's price per share (optional)").fill("250");
  await page.getByLabel("Date of your broker's price").fill("2026-09-13");

  await expect(main.getByText("Worked out from your broker's price, $250.00, from 2026-09-13.")).toBeVisible();
  // Only AGG is still on its price on record.
  await list(page).getByRole("button", { name: "AGG", exact: true }).click();
  await expect(researchPriceLine(page)).toHaveCount(1);
  // VTI's worksheet keeps its broker's price open where it was entered.
  await list(page).getByRole("button", { name: "VTI", exact: true }).click();
  await expect(page.getByLabel("Your broker's price per share (optional)")).toHaveValue("250");
});

test("the list adds up: what is spent and what stays in cash make the whole amount", async ({ page }) => {
  await portfolioOfVtiAndAgg(page);
  const rows = list(page).locator("tbody tr");
  await expect(rows).toHaveCount(2);
  const totals = await rows.locator("td:last-child").allInnerTexts();
  const spent = money(await list(page).locator("tfoot tr").first().locator("td").innerText());
  const cash = money(await list(page).locator("tfoot tr").nth(1).locator("td").innerText());
  // The list's total is its lines, and with what stays in cash it is the practice portfolio's $10,000.
  expect(Math.round(totals.reduce((sum, text) => sum + money(text), 0) * 100)).toBe(Math.round(spent * 100));
  expect(Math.round((spent + cash) * 100)).toBe(1_000_000);
});

// A phone, and a laptop whose working column is no wider than a tablet.
for (const width of [390, 1280]) {
  test(`at ${width}px the list comes first, and a worksheet opens from it and goes back`, async ({ page }) => {
    await portfolioOfVtiAndAgg(page);
    await page.setViewportSize({ width, height: 900 });
    await expect(list(page)).toBeVisible();
    await expect(sheet(page, "VTI")).toBeHidden();

    const agg = list(page).getByRole("button", { name: "AGG", exact: true });
    await agg.click();
    await expect(list(page)).toBeHidden();
    await expect(sheet(page, "AGG")).toBeFocused();
    // While a worksheet is open in the list's place, the title stays and the explanation read above the list does not.
    await expect(page.getByText("Nothing here places an order", { exact: false })).toBeHidden();

    await page.getByRole("button", { name: "← All investments", exact: true }).click();
    await expect(list(page)).toBeVisible();
    await expect(agg).toBeFocused();
    await expect(page.getByText("Nothing here places an order", { exact: false })).toBeVisible();
  });
}

test("from 1440px the list and a worksheet sit side by side", async ({ page }) => {
  await portfolioOfVtiAndAgg(page);
  await expect(list(page)).toBeVisible();
  await expect(sheet(page, "VTI")).toBeVisible();
  await expect(page.getByRole("button", { name: "← All investments", exact: true })).toBeHidden();

  await list(page).getByRole("button", { name: "AGG", exact: true }).click();
  await expect(sheet(page, "AGG")).toBeVisible();
  await expect(list(page)).toBeVisible();
  await expect(page.getByText("Nothing here places an order", { exact: false })).toBeVisible();
});

test("clearing a broker's price leaves its box open and the cursor in it", async ({ page }) => {
  await portfolioOfVtiAndAgg(page);
  const inputs = page.getByText("Use your broker’s price, date and fee", { exact: true });
  const price = page.getByLabel("Your broker's price per share (optional)");
  await inputs.click();
  await price.click();
  await page.keyboard.type("250");
  await expect(page.getByRole("main").getByText("Worked out from your broker's price, $250.00.")).toBeVisible();

  // A price typed wrong is deleted to be typed again: nothing is set any more, and the box must not close under the cursor.
  for (let press = 0; press < 3; press += 1) await page.keyboard.press("Backspace");
  await expect(researchPriceLine(page)).toHaveCount(1);
  await expect(price).toBeVisible();
  await expect(price).toBeFocused();
  await page.keyboard.type("251");
  await expect(page.getByRole("main").getByText("Worked out from your broker's price, $251.00.")).toBeVisible();

  // The same for the date, with the price cleared again so the date is all that is set.
  for (let press = 0; press < 3; press += 1) await page.keyboard.press("Backspace");
  const date = page.getByLabel("Date of your broker's price");
  await date.click();
  await page.keyboard.type("2");
  await page.keyboard.press("Backspace");
  await expect(date).toBeVisible();
  await expect(date).toBeFocused();

  // Open for the investment it was opened on, and only that one.
  await list(page).getByRole("button", { name: "AGG", exact: true }).click();
  await expect(sheet(page, "AGG")).toBeVisible();
  await expect(price).toBeHidden();
});

// ---------------------------------------------------------------------------
// The screen budget, with five holdings: three funds, a company and the Treasury note.
// ---------------------------------------------------------------------------

const NOW = "2026-10-01T12:00:00.000Z";
const FIVE: [string, number][] = [["vti", 40], ["vxus", 20], ["agg", 20], ["aapl", 5], ["ust-91282crf0", 10]];
const EIGHT: [string, number][] = [["vti", 25], ["voo", 10], ["vxus", 15], ["aapl", 5], ["tsm", 5], ["agg", 15], ["sgov", 10], ["ust-91282crf0", 10]];

async function openPortfolio(page: Page, count = 5) {
  const held = count === 8 ? EIGHT : FIVE;
  let project = createStudioProject("practice", NOW);
  for (const [id] of held) project = addPosition(project, id, undefined, NOW);
  project = {
    ...project,
    goal: { ...project.goal, budget: 10_000, cashReserve: 1_000 },
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative, positions: alternative.positions.map((position) => ({ ...position, targetWeightPct: held.find(([id]) => id === position.instrumentId)![1] })),
    })),
  };
  const backup = exportProjectBackup(project);
  if (!backup.ok) throw new Error(backup.error);
  const saved = page.getByRole("status").filter({ hasText: /^Saved in this browser$/ });
  await page.goto("/studio/portfolio/buying");
  await expect(saved).toBeVisible();
  await page.evaluate(async (raw) => {
    window.localStorage.setItem("ops-studio-mode", "practice");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("ops-studio-projects");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("projects", "readwrite");
      transaction.objectStore("projects").put({ mode: "practice", revision: "buying-test", raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, backup.raw);
  await page.reload();
  await expect(saved).toBeVisible();
}

const screens = (page: Page) => page.evaluate(() => ({
  screens: document.documentElement.scrollHeight / innerHeight,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));

test("five and eight holdings fit a screen and a half at every width", async ({ page }) => {
  test.setTimeout(120_000);
  const report: string[] = [];
  for (const count of [5, 8]) {
    await openPortfolio(page, count);
    for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(list(page)).toBeVisible();
      const size = await screens(page);
      report.push(`${count} at ${width} ${size.screens.toFixed(2)}`);
      expect.soft(size.screens, `list at ${width}`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `list at ${width}`).toBe(0);
      if (count === 8) {
        await page.getByRole("button", { name: "Next investments", exact: true }).click();
        const last = await screens(page);
        expect.soft(last.screens, `last list page at ${width}`).toBeLessThanOrEqual(1.5);
        await expect(list(page)).toContainText("6–8 of 8");
        await page.getByRole("button", { name: "Previous investments", exact: true }).click();
      }
    }
  }
  console.log(report.join(" · "));
});

/*
 * Every worksheet, at every width, closed and with its broker's inputs open:
 * the first version of this measured a phone only, and beside the list at a
 * tablet's width the same worksheets were up to 1.76 screens. A coarse pointer
 * makes the rows and boxes 44px, the tallest the page gets.
 */
for (const touch of [false, true]) {
  test.describe(touch ? "with a finger" : "with a mouse", () => {
    test.use({ hasTouch: touch, isMobile: touch, viewport: { width: 390, height: 900 } });
    test("every worksheet fits a screen and a half at every width, with its broker's inputs open too", async ({ page }) => {
      test.setTimeout(120_000);
      await openPortfolio(page);
      const back = page.getByRole("button", { name: "← All investments", exact: true });
      const report: string[] = [];
      for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        const line: string[] = [];
        for (const symbol of ["VTI", "VXUS", "AGG", "AAPL", "91282CRF0"]) {
          await list(page).getByRole("button", { name: symbol, exact: true }).click();
          await expect(sheet(page, symbol)).toBeVisible();
          const closed = await screens(page);
          await page.getByText("Use your broker’s price, date and fee", { exact: true }).click();
          await expect(page.getByLabel("Date of your broker's price")).toBeVisible();
          const open = await screens(page);
          line.push(`${symbol} ${closed.screens.toFixed(2)}/${open.screens.toFixed(2)}`);
          expect.soft(closed.screens, `${symbol} at ${width}`).toBeLessThanOrEqual(1.5);
          expect.soft(open.screens, `${symbol} at ${width}, inputs open`).toBeLessThanOrEqual(1.5);
          expect.soft(open.overflow, `${symbol} at ${width}, inputs open`).toBe(0);
          // Side by side there is nothing to go back from.
          if (await back.isVisible()) await back.click();
        }
        report.push(`${width}: ${line.join(" · ")}`);
      }
      console.log(report.join("\n"));
    });
});
}

for (const width of [390, 1440]) {
  test(`at ${width}px buying totals include other pages and preserve a second-page broker price`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openPortfolio(page, 8);
    const total = () => list(page).locator("tfoot tr").first().locator("td");
    const cash = () => list(page).locator("tfoot tr").nth(1).locator("td");
    const initial = money(await total().innerText());
    await expect(list(page).locator("tbody tr")).toHaveCount(5);
    await page.getByRole("button", { name: "Next investments", exact: true }).click();
    await expect(list(page).locator("tbody tr")).toHaveCount(3);
    expect(money(await total().innerText())).toBe(initial);

    const sgov = list(page).getByRole("button", { name: "SGOV", exact: true });
    await sgov.click();
    await page.getByText("Use your broker’s price, date and fee", { exact: true }).click();
    await page.getByLabel("Your broker's price per share (optional)").fill("250");
    await expect(page.getByRole("main").getByText("Worked out from your broker's price, $250.00.")).toBeVisible();
    const back = page.getByRole("button", { name: "← All investments", exact: true });
    if (await back.isVisible()) await back.click();
    await expect(sgov).toBeVisible();
    const spent = money(await total().innerText());
    expect(spent).not.toBe(initial);
    expect(Math.round((spent + money(await cash().innerText())) * 100)).toBe(1_000_000);
    await page.getByRole("button", { name: "Previous investments", exact: true }).click();
    expect(money(await total().innerText())).toBe(spent);

    await page.reload();
    await expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();
    await page.getByRole("button", { name: "Next investments", exact: true }).click();
    await sgov.click();
    await expect(page.getByLabel("Your broker's price per share (optional)")).toHaveValue("250");
  });
}

test.describe("longer buying list on a touch phone", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 900 } });
  test("eight holdings fit on both pages", async ({ page }) => {
    await openPortfolio(page, 8);
    expect((await screens(page)).screens).toBeLessThanOrEqual(1.5);
    await page.getByRole("button", { name: "Next investments", exact: true }).click();
    expect((await screens(page)).screens).toBeLessThanOrEqual(1.5);
  });
});

test("after desktop paging and a resize, returning to the list reveals and focuses the open investment", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPortfolio(page, 8);
  const vti = list(page).getByRole("button", { name: "VTI", exact: true });
  await vti.click();
  await page.getByRole("button", { name: "Next investments", exact: true }).click();
  await expect(vti).toBeHidden();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(sheet(page, "VTI")).toBeVisible();
  await page.getByRole("button", { name: "← All investments", exact: true }).click();
  await expect(list(page)).toContainText("1–5 of 8");
  await expect(vti).toBeFocused();
});
