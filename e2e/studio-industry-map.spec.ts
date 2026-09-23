import { expect, test, type Page } from "@playwright/test";

/**
 * The industry map around one company.
 *
 * What matters here: an entry needs a path to the profits and not just a name,
 * the zones with no counterparty never ask what kind of arrangement it is, and
 * what reaches disk survives Investigate rebuilding the record on the next
 * keystroke. The paper's own airline map is on the page whether or not a
 * company has been started.
 */

const MAP = "/studio/map";
const INVESTIGATE = "/studio/investigate";
const DATABASE = "ops-studio-projects";

async function storedEntries(page: Page): Promise<Record<string, unknown>[]> {
  return page.evaluate<Record<string, unknown>[], string>(async (name) => {
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
        if (investigation) return investigation.mapEntries ?? [];
      } catch {
        // Not a project row.
      }
    }
    return [];
  }, DATABASE);
}

async function startCompany(page: Page) {
  await page.goto(INVESTIGATE);
  await page.getByPlaceholder("Its ticker symbol").fill("Atkore");
  await page.getByPlaceholder("0", { exact: true }).first().fill("1000");
  await page.getByPlaceholder("Its ticker symbol").click();
  await page.waitForTimeout(1500);
}

test("the paper's own map is there, in its zones", async ({ page }) => {
  await page.goto(MAP);
  await page.getByText("The paper's own map: U.S. airlines").click();
  const main = page.getByRole("main");
  await expect(main).toContainText("Jet fuel");
  await expect(main).toContainText("Southwest (LCC)");
  await expect(main).toContainText("Global pandemic");
  // The paper's own note on the exhibit, not Studio's gloss.
  await expect(main).toContainText("low-cost carrier");
});

test("an entry needs a path to the profits, not just a name", async ({ page }) => {
  await startCompany(page);
  await page.goto(MAP);

  await page.getByRole("region", { name: "Who buys from it" }).getByRole("button", { name: "+ Add" }).click();
  await page.getByLabel("What is it called").fill("Electrical distributors");
  await page.getByRole("button", { name: "Put it on the map" }).click();

  await expect(page.getByText(/^Still needs/)).toContainText("how it reaches");
  await expect(page.getByText(/^Still needs/)).toContainText("what kind of arrangement it is");
  expect(await storedEntries(page)).toHaveLength(0);
});

test("a whole entry reaches the map and survives typing in Investigate", async ({ page }) => {
  await startCompany(page);
  await page.goto(MAP);

  await page.getByRole("region", { name: "Who buys from it" }).getByRole("button", { name: "+ Add" }).click();
  await page.getByLabel("What is it called").fill("Electrical distributors");
  await page.getByText("No contract", { exact: true }).click();
  await page.getByLabel(/How it reaches/).fill("Four of them buy most of what it makes, so their stocking reaches its volumes first.");
  await page.getByRole("button", { name: "Put it on the map" }).click();

  await expect.poll(async () => (await storedEntries(page)).length, { timeout: 15_000 }).toBe(1);
  expect((await storedEntries(page))[0]).toMatchObject({ zone: "customers", relationship: "non-contractual" });
  await expect(page.getByRole("region", { name: "Who buys from it" })).toContainText("Electrical distributors");

  await page.goto(INVESTIGATE);
  await page.getByPlaceholder("0", { exact: true }).nth(1).fill("150");
  await page.getByPlaceholder("Its ticker symbol").click();
  await expect.poll(async () => (await storedEntries(page)).length, { timeout: 15_000 }).toBe(1);
});

test("the zones with no counterparty never ask what kind of arrangement it is", async ({ page }) => {
  await startCompany(page);
  await page.goto(MAP);

  await page.getByRole("region", { name: "Things that affect everyone" }).getByRole("button", { name: "+ Add" }).click();
  await expect(page.getByRole("main")).toContainText("there is no kind to choose");

  await page.getByLabel("What is it called").fill("The copper price");
  await page.getByLabel(/How it reaches/).fill("It is the input its margin turns on.");
  await page.getByRole("button", { name: "Put it on the map" }).click();

  await expect.poll(async () => (await storedEntries(page)).length, { timeout: 15_000 }).toBe(1);
  expect((await storedEntries(page))[0]).toMatchObject({ zone: "other" });
  expect((await storedEntries(page))[0].relationship).toBeUndefined();
});

test("it says which sides are still empty, and that the names are in the filings", async ({ page }) => {
  await startCompany(page);
  await page.goto(MAP);
  await expect(page.getByRole("main")).toContainText("Nothing yet on:");
  await expect(page.getByRole("main")).toContainText("in its own filings, not in Studio");
});
