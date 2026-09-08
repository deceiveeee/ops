import { expect, test, type Page } from "@playwright/test";

/**
 * Studio works on one portfolio at a time, and every surface agrees which.
 *
 * It did not. The workspace read a practice portfolio and the investigation
 * view read a personal one, so a company investigated on one was filed against
 * a record the other could not see — and neither screen offered a way to change
 * which, so nobody had chosen either. These tests hold both halves of the fix:
 * the choice is a control, and both surfaces obey it.
 */

const STUDIO = "/studio";
const INVESTIGATE = "/studio/investigate";
const DATABASE = "ops-studio-projects";

const PRACTICE_PURPOSE = "A worked example";
const PERSONAL_PURPOSE = "My own deposit";

test.use({ viewport: { width: 1440, height: 900 } });

const modeSwitch = (page: Page) => page.getByRole("group", { name: "Which portfolio you are working on" });
const destinations = (page: Page) => page.locator("nav[aria-label='Studio destinations']").first();
const go = (page: Page, label: string) => destinations(page).getByRole("button", { name: label }).click();

async function choose(page: Page, label: "Practice" | "Your own") {
  await modeSwitch(page).getByRole("button", { name: label, exact: true }).click();
  await expect(modeSwitch(page).getByRole("button", { name: label, exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
}

/** Every stored project, keyed by the mode it belongs to. */
async function storedByMode(page: Page): Promise<Record<string, Record<string, unknown>>> {
  return page.evaluate<Record<string, Record<string, unknown>>, string>(async (name) => {
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
    const byMode: Record<string, Record<string, unknown>> = {};
    for (const row of rows) {
      try {
        const project = JSON.parse(row.raw);
        byMode[project.mode] = project;
      } catch {
        // Not a project row.
      }
    }
    return byMode;
  }, DATABASE);
}

async function openEmpty(page: Page) {
  await page.goto("/");
  await page.evaluate(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Private modes throw on access, not on write.
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

test("each portfolio is kept separately, and switching loses neither", async ({ page }) => {
  await openEmpty(page);

  // Practice is where everyone starts, because it is what every portfolio saved
  // before the switch existed already is.
  await expect(modeSwitch(page).getByRole("button", { name: "Practice", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await go(page, "Goal");
  await page.getByLabel("What is this money for?").fill(PRACTICE_PURPOSE);
  await go(page, "Overview");
  await expect(page.getByRole("heading", { level: 2, name: PRACTICE_PURPOSE })).toBeVisible();

  // Switching opens the other record rather than renaming this one.
  await choose(page, "Your own");
  await expect(page.getByRole("heading", { level: 2, name: "Your portfolio" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Give the money a job/ })).toBeVisible();

  await go(page, "Goal");
  await page.getByLabel("What is this money for?").fill(PERSONAL_PURPOSE);
  await go(page, "Overview");
  await expect(page.getByRole("heading", { level: 2, name: PERSONAL_PURPOSE })).toBeVisible();

  // And the first one is exactly where it was left.
  await choose(page, "Practice");
  await expect(page.getByRole("heading", { level: 2, name: PRACTICE_PURPOSE })).toBeVisible();

  // The choice outlives the page, or moving between Studio's screens would undo it.
  await choose(page, "Your own");
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: PERSONAL_PURPOSE })).toBeVisible();
  await expect(modeSwitch(page).getByRole("button", { name: "Your own", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the investigation view works on the portfolio the workspace is on", async ({ page }) => {
  await openEmpty(page);

  /*
   * Practice is the portfolio on screen, and personal exists too.
   *
   * The direction matters. This page used to ask for `personal` outright, so a
   * test that investigated while personal was selected would pass either way
   * and prove nothing. Practice is the case that can tell the two apart, and
   * it is also the ordinary one: it is what every learner opens Studio on.
   */
  await go(page, "Goal");
  await page.getByLabel("What is this money for?").fill(PRACTICE_PURPOSE);
  await choose(page, "Your own");
  await go(page, "Goal");
  await page.getByLabel("What is this money for?").fill(PERSONAL_PURPOSE);
  await choose(page, "Practice");
  await expect(page.getByRole("heading", { level: 2, name: PRACTICE_PURPOSE })).toBeVisible();

  await page.goto(INVESTIGATE);
  await page.getByPlaceholder("The one you want to understand").fill("Nordic Pulp");
  await page.getByPlaceholder("0", { exact: true }).first().fill("1200");

  await expect
    .poll(async () => (await storedByMode(page)).practice?.investigations as unknown[] | undefined, {
      timeout: 15_000,
      message: "the investigation never reached the practice portfolio",
    })
    .toHaveLength(1);

  const stored = await storedByMode(page);
  // Filed against the portfolio that was on screen, and the other record left
  // alone. Before this, every investigation went to personal no matter which
  // portfolio the learner thought they were working on.
  expect((stored.practice.investigations as { company: string }[])[0].company).toBe("Nordic Pulp");
  expect(stored.personal.investigations).toEqual([]);
  expect((stored.personal.goal as { purpose: string }).purpose).toBe(PERSONAL_PURPOSE);
});
