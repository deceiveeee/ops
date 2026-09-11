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
  // The row itself is always there, holding the company in hand, so that it cannot
  // appear under a learner's cursor. With nothing saved it lists no company to
  // open or delete, and offers no second one.
  await expect(chips(page)).toHaveCount(0);
});

/**
 * The row used to appear with the first save. Leaving the company box saves, so a
 * click on anything below it moved 66px between the press and the release and
 * landed on empty space. Found 2026-09-10 through the Company reports link; the
 * "?" beside each figure lost its first click the same way.
 */
test("the first click after naming a new company is not lost", async ({ page }) => {
  test.setTimeout(60_000);
  await openEmpty(page);
  await companyBox(page).fill("Ampere Instruments");
  const hint = page.getByRole("button", { name: /^Revenue/ });
  await hint.click();
  await expect(hint).toHaveAttribute("aria-expanded", "true");
  await expect.poll(async () => (await stored(page)).length, { timeout: 10_000 }).toBe(1);
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
