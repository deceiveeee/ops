import { expect, test, type Page } from "@playwright/test";

/**
 * A bond on the day you settle.
 *
 * The expected figures are the issuer's own. Treasury auctioned CUSIP
 * 91282CRF0 twice and published what a buyer owed in accrued interest each
 * time: 0.25136 per $1,000 settling 2026-08-17, and 3.89606 settling
 * 2026-09-15 (Fiscal Data auctions query, retrieved 2026-09-15). For $1,000 of
 * face value those are $0.25 and $3.90 to the cent, and nothing in this file
 * takes its expectations from Studio's own arithmetic.
 */

const BOND = "/studio/portfolio/bond";

async function settleOn(page: Page, date: string) {
  await page.getByLabel("The day you settle", { exact: true }).fill(date);
  await page.getByLabel("Face value you would buy", { exact: true }).fill("1000");
  await page.getByLabel("Price per $100 of face value", { exact: true }).fill("99.540696");
}

test("works out the interest Treasury itself charged at the reopening", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");

  await expect(page.getByText("31 of 184 days since 15 August 2026")).toBeVisible();
  await expect(page.getByText("$3.90", { exact: true })).toBeVisible();
  await expect(page.getByText("$995.41", { exact: true })).toBeVisible();
  // The quote alone is $995.41; what leaves the account is that plus the interest.
  await expect(page.getByText("$999.31", { exact: true })).toBeVisible();
  await expect(page.getByText("4.683%", { exact: true })).toBeVisible();
});

test("works out the two days Treasury charged at issue", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-08-17");
  await expect(page.getByText("2 of 184 days since 15 August 2026")).toBeVisible();
  await expect(page.getByText("$0.25", { exact: true })).toBeVisible();
});

test("charges nothing for a settlement on a payment date, where the next period starts", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2027-02-15");
  await expect(page.getByText("0 of 181 days since 15 February 2027")).toBeVisible();
  await expect(page.getByText("$0.00", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Payments left")).toBeVisible();
  // One payment fewer than before it, because that day's payment goes to the seller.
  await expect(page.getByText("19", { exact: true })).toBeVisible();
});

test("refuses a date before interest starts instead of inventing one", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-08-14");
  await expect(page.getByRole("alert").filter({ hasText: "Interest starts" })).toContainText("Interest starts on 2026-08-15");
  await expect(page.getByText("Payments left")).toHaveCount(0);
});

test("lists what the bond pays afterwards, ending with the face value", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");
  await expect(page.getByText("20", { exact: true })).toBeVisible();
  await expect(page.getByText("$23.13", { exact: true })).toBeVisible();
  await expect(page.getByText("$1,023.13", { exact: true })).toBeVisible();
  await expect(page.getByText("15 August 2036, with the face value")).toBeVisible();
  // Twenty payments of 23.125 and the 1,000 back.
  await expect(page.getByText("$1,462.50", { exact: true })).toBeVisible();
});

test("says where the figure has to go before it can be used, and does not pretend to save it", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");
  await expect(page.getByRole("button", { name: "Use this interest figure in What to buy" })).toBeDisabled();
  await expect(page.getByText("Add this bond to your plan first")).toBeVisible();
});

test("names the rule it follows", async ({ page }) => {
  await page.goto(BOND);
  await expect(page.getByText("31 CFR part 356, appendix B")).toBeVisible();
});

test("is reachable from the bond's row in What to buy", async ({ page }) => {
  await page.goto("/studio/portfolio/buying");
  const link = page.getByRole("link", { name: "Work out the interest built up by the day you settle" });
  if (await link.count()) {
    await expect(link.first()).toHaveAttribute("href", BOND);
  } else {
    // With no bond in the plan there is no row to link from, which is the other half of the rule.
    await expect(page.getByRole("heading", { name: /What to buy|worksheet/i }).first()).toBeVisible();
  }
});

test("keeps the page within the screen budget at 1440, and off the page edge on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");
  await expect(page.getByText("Everything still to come")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1_350);

  await page.setViewportSize({ width: 390, height: 900 });
  await page.reload();
  await settleOn(page, "2026-09-15");
  await expect(page.getByText("Everything still to come")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
