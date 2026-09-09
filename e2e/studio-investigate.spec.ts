import { expect, test, type Page } from "@playwright/test";

/**
 * The investigate loop has to keep what the learner typed.
 *
 * Until this shipped the page said so itself — "Nothing here is saved yet" —
 * and seven figures read out of an annual report died on refresh. These tests
 * exist because that is the failure the whole surface is built to remove, and
 * because the defects found while building it were invisible to unit tests:
 * they lived in the gap between React state and a write.
 */

const INVESTIGATE = "/studio/investigate";
const DATABASE = "ops-studio-projects";

/** Every figure input, in the order the page asks for them. */
const figureBoxes = (page: Page) => page.getByPlaceholder("0", { exact: true });

const companyBox = (page: Page) => page.getByPlaceholder("The one you want to understand");

/** One saved investigation, as much of it as these tests care about. */
type StoredRow = { id: string; company: string; figures: number };

const chips = (page: Page) =>
  page.getByRole("navigation", { name: "Companies you have looked at" }).getByRole("button");

/**
 * What is actually on disk, read out of IndexedDB.
 *
 * The page's own "Saved in this browser" line cannot be waited on: it is
 * already showing from the previous keystroke, so an assertion on it passes
 * instantly and proves nothing about the edit just made. That mistake made the
 * first version of this file green while the last figure went unsaved. The
 * store is the only thing that can answer "is this kept?" and can still fail.
 */
async function stored(page: Page): Promise<StoredRow[]> {
  return page.evaluate<StoredRow[], string>(async (name) => {
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
        const project = JSON.parse(row.raw ?? JSON.stringify(row));
        if (Array.isArray(project.investigations)) {
          return project.investigations.map((item: Record<string, unknown>) => ({
            id: item.id as string,
            company: item.company as string,
            figures: Object.keys(item.figures as object).length,
          }));
        }
      } catch {
        // Not a project row. The recovery store holds unparsed text by design.
      }
    }
    return [];
  }, DATABASE);
}

/** Wait until one company is on disk carrying the number of figures expected. */
async function savedWith(page: Page, company: string, figures: number) {
  await expect
    .poll(async () => (await stored(page)).find((item) => item.company === company)?.figures ?? -1, {
      timeout: 15_000,
      message: `"${company}" never reached storage with ${figures} figure(s)`,
    })
    .toBe(figures);
}

/**
 * Start from an empty browser.
 *
 * The suite shares an origin, so a project left by another test would make
 * "the figures came back" true before this test typed anything.
 */
async function openEmpty(page: Page) {
  await page.goto(INVESTIGATE);
  await page.evaluate(
    (name) =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      }),
    DATABASE,
  );
  await page.goto(INVESTIGATE);
  await expect(companyBox(page)).toBeVisible();
  await expect.poll(async () => (await stored(page)).length, { timeout: 15_000 }).toBe(0);
}

/** Enter a company and one figure, and wait for it to actually be kept. */
async function enter(page: Page, company: string, revenue: string) {
  await companyBox(page).fill(company);
  await figureBoxes(page).first().fill(revenue);
  await figureBoxes(page).first().blur();
  await savedWith(page, company, 1);
}

test("seven figures survive a reload", async ({ page }) => {
  test.setTimeout(90_000);
  await openEmpty(page);

  await companyBox(page).fill("Ampere Instruments");
  const values = ["5200", "780", "690", "165", "900", "2600", "180"];
  for (let index = 0; index < values.length; index += 1) {
    await figureBoxes(page).nth(index).fill(values[index]);
  }
  await figureBoxes(page).nth(values.length - 1).blur();
  await savedWith(page, "Ampere Instruments", values.length);

  await page.reload();

  await expect(companyBox(page)).toHaveValue("Ampere Instruments", { timeout: 15_000 });
  for (let index = 0; index < values.length; index += 1) {
    await expect(figureBoxes(page).nth(index)).toHaveValue(values[index]);
  }
});

/**
 * One record per company, which is not something to take on trust.
 *
 * Browser testing turned up duplicates — three companies producing six chips —
 * and holding the record's id in a ref rather than in React state stopped
 * them. But an attempt to reintroduce the defect and watch this fail did not
 * reproduce it, so treat this as a check on the behaviour, not as proof that
 * the original cause is caught.
 *
 * The ids are compared, not only the names: two records for one company is
 * precisely what a list of names would not reveal.
 */
test("each company is saved once, however the saves land", async ({ page }) => {
  test.setTimeout(90_000);
  await openEmpty(page);

  const names = ["Ampere Instruments", "Northwind Rail", "Calder Pharmaceuticals"];
  await enter(page, names[0], "5200");
  for (const name of names.slice(1)) {
    await page.getByRole("button", { name: "+ Another company" }).click();
    await expect(companyBox(page)).toHaveValue("");
    await enter(page, name, "3100");
  }

  const rows = await stored(page);
  expect(rows).toHaveLength(names.length);
  expect(new Set(rows.map((row) => row.id)).size).toBe(names.length);
  expect(rows.map((row) => row.company).sort()).toEqual([...names].sort());

  // One chip each, plus the delete on the open one and "+ Another company".
  await expect(chips(page)).toHaveCount(names.length + 2);
});

/**
 * Switching away mid-edit, which runs two saves close together: the one the
 * switch forces, and the one the debounce was already going to run.
 *
 * The other tests wait for storage before clicking, which lets the timer
 * settle and would hide anything that only happens under overlap. This one
 * deliberately does not wait, so the two saves land together.
 */
test("switching away mid-edit does not write the company twice", async ({ page }) => {
  test.setTimeout(90_000);
  await openEmpty(page);

  await companyBox(page).fill("Ampere Instruments");
  await figureBoxes(page).first().fill("5200");
  await page.getByRole("button", { name: "+ Another company" }).click();

  // Long past the 600ms debounce and any write behind it, so a second record
  // would have appeared by now if one were coming.
  await page.waitForTimeout(3_000);
  const rows = await stored(page);
  expect(rows.map((row) => row.company)).toEqual(["Ampere Instruments"]);
});

test("a company can be reopened with its own figures", async ({ page }) => {
  test.setTimeout(90_000);
  await openEmpty(page);

  await enter(page, "Ampere Instruments", "5200");
  await page.getByRole("button", { name: "+ Another company" }).click();
  await expect(companyBox(page)).toHaveValue("");
  await enter(page, "Northwind Rail", "3100");

  await page.getByRole("button", { name: /^Ampere Instruments/ }).click();
  await expect(companyBox(page)).toHaveValue("Ampere Instruments");
  await expect(figureBoxes(page).first()).toHaveValue("5200");

  await page.getByRole("button", { name: /^Northwind Rail/ }).click();
  await expect(companyBox(page)).toHaveValue("Northwind Rail");
  await expect(figureBoxes(page).first()).toHaveValue("3100");
});

/**
 * Opening the page is not work. A nameless, figureless record for every
 * passer-by would be worse than none, and would make the list useless.
 */
test("an idle visit records nothing", async ({ page }) => {
  test.setTimeout(60_000);
  await openEmpty(page);
  // Well past the 600ms the page waits for typing to settle.
  await page.waitForTimeout(2_500);
  expect(await stored(page)).toEqual([]);
  await expect(
    page.getByRole("navigation", { name: "Companies you have looked at" }),
  ).toHaveCount(0);
});

test("deleting asks first, and keeps the work when refused", async ({ page }) => {
  test.setTimeout(90_000);
  await openEmpty(page);
  await enter(page, "Ampere Instruments", "5200");

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain("Ampere Instruments");
    void dialog.dismiss();
  });
  await page.getByRole("button", { name: "Delete Ampere Instruments" }).click();
  await expect(page.getByRole("button", { name: /^Ampere Instruments/ })).toHaveCount(1);
  expect(await stored(page)).toHaveLength(1);

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Delete Ampere Instruments" }).click();
  await expect(page.getByRole("button", { name: /^Ampere Instruments/ })).toHaveCount(0);
  await expect(companyBox(page)).toHaveValue("");
  await expect.poll(async () => (await stored(page)).length, { timeout: 10_000 }).toBe(0);
});

const industryPicker = (page: Page) => page.getByLabel("Industry");

/**
 * Any company, not five industries' worth.
 *
 * The picker used to offer only the industries Studio had built peer figures
 * for, so a company in any other one could not be investigated at all — the
 * scarcer fact was gating the commoner one. Cost of capital is published for
 * every industry here, and it is the figure the whole investigation turns on.
 */
test("a company in any industry can be investigated", async ({ page }) => {
  test.setTimeout(90_000);
  await openEmpty(page);

  await expect(industryPicker(page).locator("option")).toHaveCount(96);
  // One with peer figures and one without, to show the list is not the old five.
  await expect(industryPicker(page).locator("option", { hasText: "Semiconductor" }).first()).toBeAttached();
  await expect(industryPicker(page).locator("option", { hasText: "Air Transport" }).first()).toBeAttached();

  await industryPicker(page).selectOption("Air Transport");
  await expect(page.getByText(/Studio has not built peer figures for this industry yet/)).toBeVisible();

  // The answer still arrives in full: a cost of capital to judge a return by.
  await expect(page.getByRole("heading", { name: "What the money costs" })).toBeVisible();
  await expect(page.getByText(/%/).first()).toBeVisible();

  // And an industry that does have peers says so rather than staying silent.
  await industryPicker(page).selectOption("Semiconductor");
  await expect(page.getByText(/Studio has figures for \d+ companies in this industry/)).toBeVisible();
});

/**
 * Opening the picker means a learner can now choose a bank, and return on
 * capital is not a meaningful measure for one. The failure this guards against
 * is not a missing answer, it is a confident wrong one.
 */
test("a bank is refused rather than mismeasured", async ({ page }) => {
  test.setTimeout(90_000);
  await openEmpty(page);

  await companyBox(page).fill("Northgate Savings");
  await industryPicker(page).selectOption("Banks (Regional)");
  const values = ["5200", "780", "690", "165", "900", "2600", "180"];
  for (let index = 0; index < values.length; index += 1) {
    await figureBoxes(page).nth(index).fill(values[index]);
  }
  await figureBoxes(page).nth(values.length - 1).blur();

  /*
   * Said twice, on purpose: once as a stop above the figures, and once where
   * the return itself would have appeared. Someone who scrolled straight to the
   * answer needs it as much as someone reading from the top.
   */
  const refusal = page.getByText(/Return on capital is not a meaningful measure for a bank/);
  await expect(refusal.first()).toBeVisible();
  await expect(refusal).toHaveCount(2);
  // Its own explanation, not a generic refusal.
  await expect(page.getByText(/Borrowing is its raw material rather than its funding/).first()).toBeVisible();

  // The same figures in an ordinary industry are measured, so the refusal is
  // about the industry rather than about the numbers being unusable.
  await industryPicker(page).selectOption("Air Transport");
  await expect(refusal).toHaveCount(0);
});

/**
 * The bridge between researching a company and owning one.
 *
 * These were separate activities that could not reach each other: Studio would
 * investigate any business and would hold any of eight, so the work of reading
 * an annual report ended on a screen the portfolio could not see. This walks
 * the whole way across, because every step of it is new and the last one — the
 * portfolio actually computing with a company Studio does not carry — is the
 * one that used to be impossible.
 */
test("a company you investigated can be held in the portfolio", async ({ page }) => {
  test.setTimeout(120_000);
  await openEmpty(page);
  await enter(page, "Nordic Pulp", "4200");

  await page.getByRole("radio", { name: "A US-listed company" }).check();
  await page.getByRole("button", { name: /Add Nordic Pulp to your portfolio/ }).click();
  await expect(page.getByText("Already in your portfolio")).toBeVisible();

  // It arrives owning nothing: how much to hold is a decision of its own.
  await page.goto("/studio?view=build");
  const weight = page.getByLabel("Nordic Pulp target percentage");
  await expect(weight).toBeVisible();
  await expect(weight).toHaveValue("0");

  await weight.fill("100");
  const summary = page.getByRole("complementary");
  await expect(summary.getByText("Assigned", { exact: true }).locator("xpath=following-sibling::div[1]")).toHaveText(
    "100.0%",
  );
  // The figure that proves the calculation resolved it. An unresolved holding
  // does not error, it silently zeroes every target in the portfolio.
  await expect(summary.getByText("To invest", { exact: true }).locator("xpath=following-sibling::div[1]")).toHaveText(
    "$10,000",
  );

  // And the reason it is owned is asked for in the same words as any other
  // holding, on the step the overview sends people to.
  await page.goto("/studio?view=research");
  await expect(page.getByRole("heading", { name: "Companies you investigated yourself" })).toBeVisible();
  await page.getByLabel("Why I chose it").fill("It earns more than its capital costs.");
  await page.reload();
  await expect(page.getByLabel("Why I chose it")).toHaveValue("It earns more than its capital costs.");
});
