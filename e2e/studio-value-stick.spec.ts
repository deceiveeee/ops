import { expect, test, type Page } from "@playwright/test";

/**
 * The value stick, and claims about the levers on it.
 *
 * Two things this surface must never do, and both are tested here: put a
 * willingness to pay or to sell on a real company, and accept a lever ticked off
 * a list as research. The rest is the same storage bar as every other Studio
 * record — it reaches disk, and it survives Investigate rebuilding the same
 * record on the next keystroke.
 */

const VALUE = "/studio/value";
const INVESTIGATE = "/studio/investigate";
const DATABASE = "ops-studio-projects";

async function stored(page: Page, field: "valueClaims" | "forces" = "valueClaims"): Promise<Record<string, unknown>[]> {
  return page.evaluate<Record<string, unknown>[], [string, string]>(async ([name, key]) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (!db.objectStoreNames.contains("projects")) {
      db.close();
      return [];
    }
    const rows = await new Promise<Record<string, string>[]>((resolve) => {
      const request = db.transaction("projects").objectStore("projects").getAll();
      request.onsuccess = () => resolve(request.result);
    });
    db.close();
    for (const row of rows) {
      try {
        const project = JSON.parse(row.raw ?? JSON.stringify(row));
        const investigation = project.investigations?.[0];
        if (investigation) return investigation[key] ?? [];
      } catch {
        // Not a project row.
      }
    }
    return [];
  }, [DATABASE, field] as [string, string]);
}

async function startCompany(page: Page) {
  await page.goto(INVESTIGATE);
  await page.getByPlaceholder("Its ticker symbol").fill("Atkore");
  await page.getByPlaceholder("0", { exact: true }).first().fill("1000");
  await page.getByPlaceholder("Its ticker symbol").click();
  await expect
    .poll(async () => (await page.evaluate(() => document.title)).length, { timeout: 15_000 })
    .toBeGreaterThan(0);
  await expect.poll(async () => (await stored(page, "forces")).length + 1, { timeout: 15_000 }).toBeGreaterThan(0);
}

test("the worked example moves when a lever is pulled, and says whose numbers they are", async ({ page }) => {
  await page.goto(VALUE);

  const main = page.getByRole("main");
  await expect(main).toContainText("Made-up figures for a made-up bakery");

  // The stick starts at the example's own marks.
  await expect(main).toContainText("£30");
  await page.getByRole("button", { name: "Network effects" }).click();

  // Willingness to pay rises; the price does not, because what the company
  // charges is its own decision and not the lever's.
  await expect(main).toContainText("£44");
  await expect(main).toContainText("£22");
  await expect(main).toContainText("Neither the price nor the cost moved");
});

test("nothing anywhere asks what a real company's customers would pay", async ({ page }) => {
  await startCompany(page);
  await page.goto(VALUE);

  // The only numbers on the page belong to the made-up bakery.
  const labels = await page.getByRole("main").getByRole("textbox").all();
  for (const box of labels) {
    const name = (await box.getAttribute("aria-label")) ?? "";
    expect(name.toLowerCase()).not.toContain("willingness");
  }
  await expect(page.getByRole("main")).not.toContainText("What would a customer pay");
});

test("a claim needs a mechanism and what would change it", async ({ page }) => {
  await startCompany(page);
  await page.goto(VALUE);

  await page.getByRole("button", { name: /Needing less to make the same thing/ }).click();
  await page.getByRole("button", { name: "Record this" }).click();
  await expect(page.getByText(/^Still needs/)).toContainText("how it works here, in your own words");
  expect(await stored(page)).toHaveLength(0);
});

test("a whole claim is kept, survives a reload, and survives typing in Investigate", async ({ page }) => {
  await startCompany(page);
  await page.goto(VALUE);

  await page.getByRole("button", { name: /Needing less to make the same thing/ }).click();
  await page.getByLabel(/How it works at/).fill("It runs the same machines with fewer people than the two rivals it names.");
  await page.getByLabel("What would change your mind").fill("Its cost per tonne rising towards theirs.");
  await page.getByRole("button", { name: "Record this" }).click();

  await expect.poll(async () => (await stored(page)).length, { timeout: 15_000 }).toBe(1);
  expect((await stored(page))[0]).toMatchObject({ lever: "productivity" });
  await expect(page.getByText("It runs the same machines with fewer people than the two rivals it names.")).toBeVisible();

  await page.reload();
  await expect(page.getByText("It runs the same machines with fewer people than the two rivals it names.")).toBeVisible();

  // Investigate rebuilds the investigation from its own edit on every keystroke.
  await page.goto(INVESTIGATE);
  await page.getByPlaceholder("0", { exact: true }).nth(1).fill("150");
  await page.getByPlaceholder("Its ticker symbol").click();
  await expect.poll(async () => (await stored(page)).length, { timeout: 15_000 }).toBe(1);
});

test("with no company started it says what to do first", async ({ page }) => {
  await page.goto(VALUE);
  await expect(page.getByRole("link", { name: /Start with a company.s figures/ })).toBeVisible();
  // The example is still there to read: it needs no company at all.
  await expect(page.getByRole("main")).toContainText("One cake, from a bakery Studio made up");
});
