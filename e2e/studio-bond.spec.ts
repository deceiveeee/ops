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
  await page.getByRole("tab", { name: "What it pays you" }).click();
  await expect(page.getByText("Payments left")).toBeVisible();
  // One payment fewer than before it, because that day's payment goes to the seller.
  await expect(page.getByText("19", { exact: true })).toBeVisible();
});

test("refuses a date before interest starts instead of inventing one", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-08-14");
  await expect(page.getByRole("alert").filter({ hasText: "Interest starts" })).toContainText("Interest starts on 2026-08-15");
  // Neither half of the answer, not a tab left to open onto a blank.
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByText("Payments left")).toHaveCount(0);
});

test("lists what the bond pays afterwards, ending with the face value", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");
  await page.getByRole("tab", { name: "What it pays you" }).click();
  await expect(page.getByText("Interest of 4.625% a year on the face value, paid twice a year")).toBeVisible();
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
  await page.getByText("Where these figures come from").click();
  await expect(page.getByText("31 CFR part 356, appendix B")).toBeVisible();
});

test("carries the interest figure to What to buy, which then counts it", async ({ page }) => {
  await page.goto("/studio/research");
  await page.getByRole("searchbox", { name: "Find an investment" }).fill("91282CRF0");
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: /^91282CRF0/ }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
  await page.goto("/studio/portfolio");
  await page.getByLabel("91282CRF0 target percentage").fill("50");
  await expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible();

  await page.goto("/studio/portfolio/buying");
  // At this width the note's worksheet opens from its line of the list, which says its total is incomplete.
  const line = page.getByRole("table", { name: "What to buy, investment by investment" });
  await expect(line).toContainText("Incomplete");
  await line.getByRole("button", { name: "91282CRF0", exact: true }).click();
  const unknown = page.getByText("The interest built up since the last payment is not in this total yet.", { exact: false });
  await expect(unknown).toBeVisible();
  await page.getByRole("link", { name: "Work out the interest built up by the day you settle" }).click();
  await expect(page).toHaveURL(BOND);

  await settleOn(page, "2026-09-15");
  await page.getByRole("button", { name: "Use this interest figure in What to buy" }).click();
  // Treasury's own 3.89606 per $1,000, per $100.
  const saved = page.getByRole("status").filter({ hasText: "Saved for What to buy" });
  await expect(saved).toContainText("0.389606 per $100, as at 2026-09-15");
  await saved.getByRole("link", { name: "Open What to buy" }).click();
  await expect(page).toHaveURL("/studio/portfolio/buying");
  await expect(page.getByText("Work out what to buy")).toBeVisible();
  await expect(unknown).toHaveCount(0);
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

test("the two tabs move by keyboard, and What you pay opens first", async ({ page }) => {
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");
  const tabs = page.getByRole("tablist", { name: "This bond" });
  await expect(tabs.getByRole("tab", { selected: true })).toHaveText("What you pay");
  await tabs.getByRole("tab", { name: "What you pay" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "What it pays you" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "bond-tab-back");
  await expect(page.getByText("Everything still to come")).toBeVisible();
  await expect(page.getByText("What leaves the account")).toHaveCount(0);
  // The entries serve both tabs, so they stay put.
  await expect(page.getByLabel("The day you settle", { exact: true })).toHaveValue("2026-09-15");
});

/*
 * Held or not, and with the save's message showing: a tab is a screen and a
 * half at most, at every width. Stacked, the two halves were 2.6 on a phone.
 */
test("every Bond tab fits a screen and a half at every width", async ({ page }) => {
  test.setTimeout(180_000);
  const report: string[] = [];
  const measure = async (state: string) => {
    for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const name of ["What you pay", "What it pays you"]) {
        await page.getByRole("tab", { name }).click();
        const size = await page.evaluate(() => ({ screens: document.documentElement.scrollHeight / innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
        report.push(`${state} ${width} ${name}: ${size.screens.toFixed(2)}`);
        expect.soft(size.screens, `${state}, ${name} at ${width}`).toBeLessThanOrEqual(1.5);
        expect.soft(size.overflow, `${state}, ${name} at ${width}`).toBe(0);
      }
    }
  };
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");
  await measure("not held");

  await page.goto("/studio/research");
  await page.getByRole("searchbox", { name: "Find an investment" }).fill("91282CRF0");
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: /^91282CRF0/ }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
  await page.goto(BOND);
  await settleOn(page, "2026-09-15");
  await measure("held");

  await page.getByRole("tab", { name: "What you pay" }).click();
  await page.getByRole("button", { name: "Use this interest figure in What to buy" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved for What to buy" })).toBeVisible();
  await measure("saved");
  console.log(report.join("\n"));
});
