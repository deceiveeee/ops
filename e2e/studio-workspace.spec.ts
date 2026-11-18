import { expect, test, type Page } from "@playwright/test";

/**
 * The workspace's end-to-end baseline.
 *
 * The surface a learner actually builds a portfolio in, walked the way they
 * walk it: the goal, the mix, the split, the funds and picks, the rules, and
 * the overview's reading of all of it.
 *
 * Every assertion here is deliberately blind to how the work is stored. It
 * never reads a storage key, parses a record or names a database: it types what
 * a learner types and asserts what a learner sees, so it keeps its meaning
 * through any change underneath it (`studio-storage.spec.ts` covers the session
 * layer, and `studio-migration.spec.ts` the record brought forward from v1).
 *
 * Two consequences of that rule are worth stating, because they are easy to
 * undo by accident:
 *
 * 1. `Field` keeps keystrokes in local state while a write is in flight, so an
 *    input showing what you typed proves nothing about whether it was kept.
 *    Everything here is proved either by a *derived* figure — the summary panel
 *    and the overview's next step are rendered from the calculation, which is
 *    recomputed only after a write is accepted — or by a reload.
 *
 * 2. The multi-tab and conflict paths are deliberately absent: they are covered
 *    at the session layer, where they can be driven rather than raced.
 */

const STUDIO = "/studio";
const GOALS = "/studio/goals";
const RESEARCH = "/studio/research";
const PORTFOLIO = "/studio/portfolio";
const SPLIT = "/studio/portfolio/split";
const FILL = "/studio/portfolio/fill";
const PICKS = "/studio/portfolio/picks";
const REVIEW = "/studio/review";

const PURPOSE = "A deposit on a flat";
const CONTRIBUTION_RULE = "Each month, into whichever holding is furthest below its target.";
const AAPL_WHY = "It earns more than its capital costs and has done for a decade.";

/** Studio's figures, worked out from the saved portfolio rather than from the form. */
const summary = (page: Page) => page.getByRole("complementary", { name: "About this page" });
const stat = (page: Page, label: string) =>
  summary(page).getByText(label, { exact: true }).locator("xpath=following-sibling::div[1]");

/** Steps 3 and 4: a mix, and a split inside each slice, typed as a learner types them. */
async function mixAndSplit(page: Page, mix: [string, string, string], split: [string, string]) {
  await page.goto(PORTFOLIO);
  await page.getByLabel("Ready target, % of the whole portfolio").fill(mix[0]);
  await page.getByLabel("Steady target, % of the whole portfolio").fill(mix[1]);
  await page.getByLabel("Grow target, % of the whole portfolio").fill(mix[2]);
  await page.goto(SPLIT);
  await page.getByLabel("Grow: share in international stocks, % of Grow").fill(split[0]);
  await page.getByLabel("Steady: share in short-term bonds, % of Steady").fill(split[1]);
}

/** One of the library's investments, found by its ticker. */
async function openInvestment(page: Page, symbol: string) {
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  await page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).click();
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
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
}

test.use({ viewport: { width: 1440, height: 900 } });

test("work entered across the sections survives a reload", async ({ page }) => {
  test.setTimeout(120_000);
  await openEmpty(page);

  await page.goto(GOALS);
  await page.getByLabel("What is this money for?").fill(PURPOSE);
  await page.getByRole("tab", { name: /Your money/ }).click();
  await page.getByLabel("Money available now").fill("20000");
  await page.getByLabel("Keep aside as cash").fill("4000");
  // The first thing that can fail: the figures are rendered from the
  // calculation, so $16,000 appears only once both numbers were written.
  await expect(page.getByRole("main")).toContainText("$16,000");

  await page.goto(RESEARCH);
  await openInvestment(page, "AAPL");
  await page.getByRole("button", { name: "Add to portfolio" }).click();
  await page.getByRole("button", { name: "Your record", exact: true }).click();
  await page.getByLabel("Why it belongs").fill(AAPL_WHY);

  // $4,000 kept aside of $20,000 is Ready's 20%; the other 80% is Grow, all of it AAPL as a pick.
  await mixAndSplit(page, ["20", "0", "80"], ["0", "0"]);
  await page.goto(PICKS);
  await page.getByLabel("Picks budget, % of the whole portfolio").fill("80");
  await page.getByLabel("AAPL, % of the whole portfolio").fill("80");
  await expect(stat(page, "Assigned")).toHaveText("100.0%");
  await expect(stat(page, "Held as cash")).toHaveText("$4,000");

  await page.goto(REVIEW);
  await page.getByLabel("What I do with new money").fill(CONTRIBUTION_RULE);
  // Free text with no figure of its own: the reload below is what proves it kept.
  await expect(page.getByRole("status").filter({ hasText: "Saved in this browser" }).first()).toBeVisible({
    timeout: 15_000,
  });

  await page.reload();

  await page.goto(GOALS);
  await expect(page.getByLabel("What is this money for?")).toHaveValue(PURPOSE, { timeout: 15_000 });
  await page.getByRole("tab", { name: /Your money/ }).click();
  await expect(page.getByLabel("Money available now")).toHaveValue("20000");
  await expect(page.getByLabel("Keep aside as cash")).toHaveValue("4000");

  await page.goto(RESEARCH);
  await openInvestment(page, "AAPL");
  await page.getByRole("button", { name: "Your record", exact: true }).click();
  await expect(page.getByLabel("Why it belongs")).toHaveValue(AAPL_WHY);

  await page.goto(PICKS);
  await expect(page.getByLabel("AAPL, % of the whole portfolio")).toHaveValue("80", { timeout: 15_000 });
  await expect(stat(page, "Assigned")).toHaveText("100.0%");

  await page.goto(REVIEW);
  await expect(page.getByLabel("What I do with new money")).toHaveValue(CONTRIBUTION_RULE, { timeout: 15_000 });
});

test("the overview names one next thing to do, and it changes as the work lands", async ({ page }) => {
  test.setTimeout(120_000);
  await openEmpty(page);

  // Empty: the goal comes first, because every later choice is judged against it.
  await expect(page.getByRole("heading", { name: "Say what this money is for" })).toBeVisible();

  await page.goto(GOALS);
  await page.getByLabel("What is this money for?").fill(PURPOSE);
  await page.goto(STUDIO);
  // The rules exist, so the mix comes before any investment.
  await expect(page.getByRole("heading", { name: "Choose your mix" })).toBeVisible({ timeout: 15_000 });

  await page.goto(PORTFOLIO);
  await page.getByLabel("Ready target, % of the whole portfolio").fill("30");
  await page.getByLabel("Steady target, % of the whole portfolio").fill("0");
  await page.getByLabel("Grow target, % of the whole portfolio").fill("70");
  await expect(page.getByRole("status").filter({ hasText: "Saved in this browser" }).first()).toBeVisible();
  await page.goto(STUDIO);
  await expect(page.getByRole("heading", { name: "Split each slice" })).toBeVisible({ timeout: 15_000 });

  await page.goto(SPLIT);
  await page.getByLabel("Grow: share in international stocks, % of Grow").fill("0");
  await expect(page.getByRole("status").filter({ hasText: "Saved in this browser" }).first()).toBeVisible();
  await page.goto(STUDIO);
  await expect(page.getByRole("heading", { name: "Fill each part" })).toBeVisible({ timeout: 15_000 });

  await page.goto(FILL);
  await page.getByRole("radio", { name: /^VTI ·/ }).check();
  await expect(stat(page, "Assigned")).toHaveText("70.0%");
  await page.goto(STUDIO);
  // Every part has its fund, so what is left is saying how the plan will be followed.
  await expect(page.getByRole("heading", { name: "Write the rules you will follow" })).toBeVisible({ timeout: 15_000 });

  // The advice is a link, and it goes where it says it goes.
  await page.getByRole("link", { name: /Open Review/ }).click();
  await expect(page).toHaveURL(/\/studio\/review$/);
});

test("a choice shows its consequence without leaving the page", async ({ page }) => {
  test.setTimeout(120_000);
  await openEmpty(page);
  // Grow 100%, split 70% US and 30% international.
  await mixAndSplit(page, ["0", "0", "100"], ["30", "0"]);

  await page.goto(FILL);
  await page.getByRole("tab", { name: "US stocks", exact: true }).click();
  await page.getByRole("radio", { name: /^VTI ·/ }).check();
  await expect(stat(page, "Assigned")).toHaveText("70.0%");
  // Built in the steps, money not yet in a fund is cash by design, not an error.
  await expect(summary(page)).toContainText("The rest stays as cash");

  // The panel is the reason the figures sit beside the work rather than under
  // it: the second choice's effect has to be visible without navigating away.
  await page.getByRole("tab", { name: "International stocks", exact: true }).click();
  await page.getByRole("radio", { name: /^VXUS ·/ }).check();
  await expect(stat(page, "Assigned")).toHaveText("100.0%");
  await expect(summary(page)).toContainText("Fully assigned");
  await expect(stat(page, "Investments")).toHaveText("2");
});
