import { expect, test, type Page } from "@playwright/test";

/**
 * A portfolio saved by the previous version has to come across intact.
 *
 * The workspace now opens a project session instead of reading localStorage
 * directly. On first open with nothing in the database that session reads the
 * old record, migrates it, and saves the result — a path that existed and was
 * unit-tested for a long time before anything on screen could reach it, because
 * the only view that opened a session asked for a mode no v1 record ever had.
 *
 * This lives apart from `studio-workspace.spec.ts` on purpose. That file is the
 * migration's oracle and is deliberately blind to which schema is in use; this
 * one is the opposite, and has to name the storage key, the database and the
 * shape of both records to say anything worth saying.
 */

const STUDIO = "/studio";
const LEGACY_KEY = "ops-studio-portfolio-v1";
const DATABASE = "ops-studio-projects";

const PURPOSE = "A deposit on a flat";
const AAPL_WHY = "It earns more than the capital it uses, and has for a decade.";

/** A complete, valid v1 portfolio, as the previous version would have written it. */
const LEGACY_PLAN = {
  schemaVersion: 1,
  id: "plan-legacy-fixture",
  createdAt: "2026-01-05T09:00:00.000Z",
  updatedAt: "2026-02-11T09:00:00.000Z",
  mode: "practice",
  name: "My practice portfolio",
  goal: {
    purpose: PURPOSE,
    horizonYears: 8,
    budget: 20000,
    cashReserve: 4000,
    monthlyContribution: 250,
    accountType: "taxable",
    lossTolerancePct: 25,
    constraints: "",
  },
  holdings: [
    {
      instrumentId: "aapl",
      targetWeightPct: 60,
      currentValue: 0,
      research: {
        why: AAPL_WHY,
        mainRisk: "One product line carries most of the profit.",
        whatWouldChangeMyMind: "Two years of falling returns on capital.",
        reviewedSources: true,
      },
      quotePrice: null,
      quoteAsOf: "",
      quantityMode: "whole",
      accruedInterestPer100: null,
      tradeFee: 0,
    },
    {
      instrumentId: "vxus",
      targetWeightPct: 40,
      currentValue: 0,
      research: {
        why: "Everything else I own is American.",
        mainRisk: "The dollar moves against me.",
        whatWouldChangeMyMind: "",
        reviewedSources: false,
      },
      quotePrice: null,
      quoteAsOf: "",
      quantityMode: "whole",
      accruedInterestPer100: null,
      tradeFee: 0,
    },
  ],
  currentCash: 0,
  contributionAmount: 0,
  rules: {
    reviewFrequency: "quarterly",
    driftThresholdPct: 5,
    contributionRule: "Into whichever holding is furthest below its target.",
    sellRule: "",
    guardrails: "",
  },
  stress: {
    usStocksPct: -30,
    internationalStocksPct: -30,
    globalStocksPct: -30,
    bondsPct: -10,
    cashPct: 0,
  },
};

/** Exactly the bytes the previous version would have left behind. */
const LEGACY_RAW = JSON.stringify(LEGACY_PLAN, null, 2);

/**
 * A browser holding the previous version's portfolio and nothing else.
 *
 * The database is cleared from another route so no Studio session is holding it
 * open: deleting a database a live page still has a connection to blocks rather
 * than completing, which would leave the last test's project in place and make
 * "the work came across" true before this test seeded anything.
 */
async function seedLegacyOnly(page: Page) {
  await page.goto("/");
  await page.evaluate(
    async ([key, raw, database]) => {
      localStorage.clear();
      const databases = (await indexedDB.databases?.()) ?? [];
      await Promise.all(
        databases
          .filter((item) => item.name === database)
          .map(
            () =>
              new Promise<void>((resolve) => {
                const request = indexedDB.deleteDatabase(database);
                request.onsuccess = () => resolve();
                request.onerror = () => resolve();
                request.onblocked = () => resolve();
              }),
          ),
      );
      localStorage.setItem(key, raw);
    },
    [LEGACY_KEY, LEGACY_RAW, DATABASE] as const,
  );
}

const summary = (page: Page) => page.getByRole("complementary");
const stat = (page: Page, label: string) =>
  summary(page).getByText(label, { exact: true }).locator("xpath=following-sibling::div[1]");
const destinations = (page: Page) => page.locator("nav[aria-label='Studio destinations']").first();
const go = (page: Page, label: string) => destinations(page).getByRole("button", { name: label }).click();

/** The saved v2 project, read straight out of the database. */
async function storedProject(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate<Record<string, unknown> | null, string>(async (name) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const rows = await new Promise<Record<string, string>[]>((resolve) => {
      const request = db.transaction("projects").objectStore("projects").getAll();
      request.onsuccess = () => resolve(request.result);
    });
    db.close();
    for (const row of rows) {
      try {
        return JSON.parse(row.raw);
      } catch {
        // Not a project row.
      }
    }
    return null;
  }, DATABASE);
}

test.use({ viewport: { width: 1440, height: 900 } });

test("a portfolio saved by the previous version opens with its work intact", async ({ page }) => {
  await seedLegacyOnly(page);
  await page.goto(STUDIO);

  // The overview is what a returning learner lands on, and it is titled with
  // the goal they wrote. The summary rail is deliberately not on this view, so
  // the figures are read from the steps that own them.
  await expect(page.getByRole("heading", { level: 2, name: PURPOSE })).toBeVisible();

  await go(page, "Goal");
  await expect(page.getByLabel("What is this money for?")).toHaveValue(PURPOSE);
  await expect(page.getByLabel("Money available now")).toHaveValue("20000");
  await expect(page.getByLabel("Keep aside as cash")).toHaveValue("4000");
  // $20,000 less the $4,000 held back is what the weights are a share of.
  await expect(stat(page, "To invest")).toHaveText("$16,000");
  await expect(stat(page, "Investments")).toHaveText("2");

  await go(page, "Build");
  await expect(page.getByLabel("AAPL target percentage")).toHaveValue("60");
  await expect(page.getByLabel("VXUS target percentage")).toHaveValue("40");
  await expect(stat(page, "Assigned")).toHaveText("100.0%");

  // Research is the part that changes shape. In the old record it hung off the
  // holding; in the new one it is a candidate keyed by instrument, and it has to
  // read back as the same sentence the learner wrote.
  await go(page, "Research");
  await page.getByRole("button", { name: /^AAPL\b/ }).click();
  await expect(page.getByLabel("Why I chose it")).toHaveValue(AAPL_WHY);

  await go(page, "Rules");
  await expect(page.getByLabel("What I do with new money")).toHaveValue(LEGACY_PLAN.rules.contributionRule);
});

test("migrating keeps the original record and says where it came from", async ({ page }) => {
  await seedLegacyOnly(page);
  await page.goto(STUDIO);
  await expect(page.getByRole("heading", { level: 2, name: PURPOSE })).toBeVisible();

  /*
   * The old record is left exactly as it was, byte for byte.
   *
   * This is the whole rollback story. A migration bug must never be the reason
   * a learner loses work, so the previous version's file stays readable by the
   * previous version -- not an equivalent object re-serialised, the same text.
   */
  expect(await page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY)).toBe(LEGACY_RAW);

  const project = await expect
    .poll(async () => await storedProject(page), { timeout: 15_000, message: "no migrated project was saved" })
    .not.toBeNull()
    .then(() => storedProject(page));

  expect(project).toMatchObject({
    schemaVersion: 2,
    mode: "practice",
    migratedFrom: { schemaVersion: 1, raw: LEGACY_RAW },
  });

  // Both holdings became candidates carrying their research, and neither was
  // invented into a state the old record could not describe: v1 had no way to
  // record a rejection, so everything it held is selected.
  const candidates = (project?.candidates ?? []) as { instrumentId: string; status: string; why: string }[];
  expect(candidates.map((candidate) => candidate.instrumentId).sort()).toEqual(["aapl", "vxus"]);
  expect(candidates.every((candidate) => candidate.status === "selected")).toBe(true);
  expect(candidates.find((candidate) => candidate.instrumentId === "aapl")?.why).toBe(AAPL_WHY);

  // Fields v1 could not have filled start empty rather than being back-filled
  // with something plausible-looking.
  expect(project?.investigations).toEqual([]);
  expect(project?.decisions).toEqual([]);
});

test("the migration says what it did to the work, once", async ({ page }) => {
  await seedLegacyOnly(page);
  await page.goto(STUDIO);

  /*
   * These sentences have existed in `migrate.ts` all along and were written to
   * nobody. A portfolio that quietly comes back in a different shape is how
   * someone stops trusting that it came back at all -- particularly the second
   * line, which explains a status the learner never chose and would otherwise
   * find attached to every holding they own.
   */
  const notice = page.getByText("This portfolio was brought forward from an older version of Studio");
  await expect(notice).toBeVisible();
  await expect(page.getByText("2 holdings became candidates, 2 carrying written research.")).toBeVisible();
  await expect(
    page.getByText("Every migrated candidate is marked selected: the previous version could not record a rejection."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Got it" }).click();
  await expect(notice).toBeHidden();

  // Said once. The next load migrates nothing, so it has nothing to announce.
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: PURPOSE })).toBeVisible();
  await expect(notice).toBeHidden();
});
