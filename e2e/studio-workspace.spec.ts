import { expect, test, type Page } from "@playwright/test";

/**
 * The workspace's end-to-end baseline.
 *
 * Until this file existed no test had ever opened `/studio`. The suite reached
 * `/plan` and `/studio/investigate`, and the six-step workspace between them —
 * the surface a learner actually builds a portfolio in — was covered only by
 * unit tests of the arithmetic underneath it. Three rounds of layout work went
 * in without anything that could have told us the form stopped saving.
 *
 * It is also written to be the oracle for the v1 -> v2 storage migration, which
 * swaps localStorage for IndexedDB underneath this UI. That gives every
 * assertion here one hard constraint: **it must not know which schema is in
 * use.** So this file never reads a storage key, never parses a stored record,
 * and never names a database. It types what a learner types and asserts what a
 * learner sees. When the migration lands, this file must pass unmodified; if it
 * has to be edited to go green, the edit is the bug report.
 *
 * Two consequences of that rule are worth stating, because they are easy to
 * undo by accident:
 *
 * 1. `Field` keeps keystrokes in local state while a write is in flight, so an
 *    input showing what you typed proves nothing about whether it was kept.
 *    Everything here is proved either by a *derived* figure — the summary rail
 *    and the overview's next action are rendered from the calculation, which is
 *    recomputed only after a write is accepted — or by a reload.
 *
 * 2. The multi-tab and conflict paths are deliberately absent. v1 silently
 *    adopts another tab's write; v2 flags `externalChange` and protects the
 *    draft instead. Those are different behaviours on purpose, so a test
 *    asserting either would fail at migration for the wrong reason. v2's side
 *    is covered at the session layer by `studio-storage.spec.ts`.
 */

const STUDIO = "/studio";
const PURPOSE = "A deposit on a flat";
const CONTRIBUTION_RULE = "Each month, into whichever holding is furthest below its target.";
const AAPL_WHY = "It earns more than its capital costs and has done for a decade.";
const VXUS_WHY = "Everything else I own is American.";

// The sidebar needs 1024 and the summary rail 1280. Fixing the viewport above
// both keeps the assertions about them from depending on the runner's default.
test.use({ viewport: { width: 1440, height: 900 } });

/** The portfolio summary beside the work. `<aside>` is the only complementary landmark. */
const summary = (page: Page) => page.getByRole("complementary");

/**
 * One figure from the summary, read by the label printed above it.
 *
 * Asserting on the rail's whole text would pass on a number that happens to
 * appear anywhere in it — "2" is in "$16,000" — so each figure is addressed
 * through its own label.
 */
const stat = (page: Page, label: string) =>
  summary(page).getByText(label, { exact: true }).locator("xpath=following-sibling::div[1]");

/**
 * The sidebar, not the phone tab bar.
 *
 * Both carry the same label and the same button names; only the sidebar is on
 * screen at this width, and it is first in the document.
 */
const destinations = (page: Page) => page.locator("nav[aria-label='Studio destinations']").first();

const go = (page: Page, label: string) =>
  destinations(page).getByRole("button", { name: label }).click();

/**
 * The row holding one instrument's controls.
 *
 * Every card's action is named "Add to portfolio", so the button has to be
 * found through the instrument it sits beside rather than by its own name.
 */
const addOrRemove = (page: Page, symbol: string) =>
  page
    .getByRole("button", { name: new RegExp(`^${symbol}\\b`) })
    .locator("xpath=..")
    .getByRole("button", { name: /Add to portfolio|Remove/ });

/**
 * Open one instrument's card. Only one is open at a time, which is what keeps
 * the research fields inside it unambiguous.
 */
const expand = (page: Page, symbol: string) =>
  page.getByRole("button", { name: new RegExp(`^${symbol}\\b`) }).click();

/**
 * Write the reason a holding is in the portfolio.
 *
 * These three fields are the ones that become a `CandidateInvestigation` when
 * the project schema lands, so a portfolio that carries them is the case worth
 * putting through a reload.
 */
async function explain(page: Page, symbol: string, why: string) {
  await expand(page, symbol);
  await page.getByLabel("Why I chose it").fill(why);
}

/**
 * Start from a browser with nothing saved, whatever "saved" currently means.
 *
 * The clearing runs from another route so no Studio storage connection is open
 * while it happens — deleting an IndexedDB database that a live page still
 * holds open blocks rather than completing, which would leave the previous
 * test's portfolio in place and make "the work came back" true before this
 * test typed anything.
 */
async function openEmpty(page: Page) {
  await page.goto("/");
  await page.evaluate(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Private modes throw on access rather than on write.
    }
    const databases = (await indexedDB.databases?.()) ?? [];
    await Promise.all(
      databases
        .filter((database): database is { name: string } => Boolean(database.name))
        .map(
          (database) =>
            new Promise<void>((resolve) => {
              const request = indexedDB.deleteDatabase(database.name);
              request.onsuccess = () => resolve();
              request.onerror = () => resolve();
              request.onblocked = () => resolve();
            }),
        ),
    );
  });
  await page.goto(STUDIO);
  await expect(page.getByRole("heading", { level: 1, name: "Build a portfolio you can explain" })).toBeVisible();
}

test("a portfolio built across the six steps survives a reload", async ({ page }) => {
  await openEmpty(page);

  await go(page, "Goal");
  await page.getByLabel("What is this money for?").fill(PURPOSE);
  await page.getByLabel("Money available now").fill("20000");
  await page.getByLabel("Keep aside as cash").fill("4000");
  // The first thing that can fail: the rail is rendered from the calculation,
  // so it only reaches $16,000 once both numbers have actually been written.
  await expect(stat(page, "To invest")).toHaveText("$16,000");

  await go(page, "Research");
  await addOrRemove(page, "AAPL").click();
  await addOrRemove(page, "VXUS").click();
  await expect(stat(page, "Investments")).toHaveText("2");
  await explain(page, "AAPL", AAPL_WHY);
  await explain(page, "VXUS", VXUS_WHY);

  await go(page, "Build");
  await page.getByLabel("AAPL target percentage").fill("60");
  await page.getByLabel("VXUS target percentage").fill("40");
  await expect(stat(page, "Assigned")).toHaveText("100.0%");
  await expect(stat(page, "Held as cash")).toHaveText("$4,000");

  /*
   * The overview's advice is the receipt for everything above it.
   *
   * It is worked out from the portfolio, in the order the work depends on:
   * weights before reasons, reasons before rules. Reaching "write the rules"
   * therefore means the weights total 100 *and* both reasons were written --
   * free text with no figure of its own, which nothing else here could prove
   * was kept.
   */
  await go(page, "Overview");
  await expect(page.getByRole("button", { name: /Write the rules you will follow/ })).toBeVisible();

  await go(page, "Rules");
  await page.getByLabel("What I do with new money").fill(CONTRIBUTION_RULE);
  await go(page, "Overview");
  await expect(page.getByRole("button", { name: /Read it back/ })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { level: 2, name: PURPOSE })).toBeVisible();
  await go(page, "Goal");
  await expect(page.getByLabel("What is this money for?")).toHaveValue(PURPOSE);
  await expect(page.getByLabel("Money available now")).toHaveValue("20000");
  await expect(page.getByLabel("Keep aside as cash")).toHaveValue("4000");
  await expect(stat(page, "To invest")).toHaveText("$16,000");

  await go(page, "Research");
  await expand(page, "AAPL");
  await expect(page.getByLabel("Why I chose it")).toHaveValue(AAPL_WHY);
  await expand(page, "VXUS");
  await expect(page.getByLabel("Why I chose it")).toHaveValue(VXUS_WHY);

  await go(page, "Build");
  await expect(page.getByLabel("AAPL target percentage")).toHaveValue("60");
  await expect(page.getByLabel("VXUS target percentage")).toHaveValue("40");
  await expect(stat(page, "Assigned")).toHaveText("100.0%");

  await go(page, "Rules");
  await expect(page.getByLabel("What I do with new money")).toHaveValue(CONTRIBUTION_RULE);
});

test("the destination comes from the URL, and moving updates it", async ({ page }) => {
  await openEmpty(page);

  // A destination is something you can link straight to. Deep links are the
  // reason the open stage lives in the URL rather than in component state.
  await page.goto(`${STUDIO}?view=build`);
  await expect(page.getByRole("heading", { level: 2, name: "Decide how much goes where" })).toBeVisible();
  await expect(page.getByText("Step 3 of 6")).toBeVisible();

  // Overview is a place you read, not a step you work, so it is not numbered.
  await page.goto(`${STUDIO}?view=overview`);
  await expect(page.getByText(/Step \d of 6/)).toHaveCount(0);

  // An unknown view falls back to the first destination rather than rendering
  // nothing, which is what a stale or hand-edited link produces.
  await page.goto(`${STUDIO}?view=not-a-destination`);
  await expect(page.getByRole("button", { name: "Overview" }).first()).toHaveAttribute("aria-current", "page");

  await go(page, "Risk and cost");
  await expect(page).toHaveURL(/\?view=risk$/);
  await expect(page.getByRole("heading", { level: 2, name: "Check the risk and the cost" })).toBeVisible();

  // And the browser's own Back button works, because these were real navigations.
  await page.goBack();
  await expect(page.getByRole("heading", { level: 2, name: "Your portfolio" })).toBeVisible();
});

test("the overview names one next thing to do, and it changes as the work lands", async ({ page }) => {
  await openEmpty(page);

  // Empty: the goal comes first because every later choice is judged against it.
  await expect(page.getByRole("button", { name: /Give the money a job/ })).toBeVisible();

  await go(page, "Goal");
  await page.getByLabel("What is this money for?").fill(PURPOSE);
  await go(page, "Overview");
  // The practice portfolio starts with a budget, so the next gap is holdings.
  await expect(page.getByRole("button", { name: /Find something to buy/ })).toBeVisible();

  await go(page, "Research");
  await addOrRemove(page, "AAPL").click();
  await go(page, "Overview");
  await expect(page.getByRole("button", { name: /Assign the last 100.0 points/ })).toBeVisible();

  await go(page, "Build");
  await page.getByLabel("AAPL target percentage").fill("100");
  await go(page, "Overview");
  // Weights total 100 but nothing says why the holding is there.
  await expect(page.getByRole("button", { name: /Say why you would own it/ })).toBeVisible();

  // The advice is a button, and it goes where it says it goes.
  await page.getByRole("button", { name: /Say why you would own it/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Research what you might buy" })).toBeVisible();
});

test("a weight change shows its consequence without leaving the form", async ({ page }) => {
  await openEmpty(page);

  await go(page, "Research");
  await addOrRemove(page, "AAPL").click();
  await addOrRemove(page, "VXUS").click();

  await go(page, "Build");
  await page.getByLabel("AAPL target percentage").fill("70");
  await expect(stat(page, "Assigned")).toHaveText("70.0%");
  await expect(summary(page)).toContainText("Needs to total 100%");

  // The rail is the reason the summary sits beside the work rather than under
  // it: the second weight's effect has to be visible without navigating away.
  await page.getByLabel("VXUS target percentage").fill("30");
  await expect(stat(page, "Assigned")).toHaveText("100.0%");
  await expect(summary(page)).toContainText("Fully assigned");

  // Removing a holding is a change like any other and must show the same way.
  await go(page, "Research");
  await addOrRemove(page, "VXUS").click();
  await expect(stat(page, "Investments")).toHaveText("1");
  await expect(stat(page, "Assigned")).toHaveText("70.0%");
});
