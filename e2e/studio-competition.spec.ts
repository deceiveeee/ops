import { expect, test, type Page } from "@playwright/test";

/**
 * Findings about competition, on the company they belong to.
 *
 * The surface exists to stop a learner listing pluses and minuses against five
 * forces, which is what the paper it follows warns against. So the tests that
 * matter are: a half-finding is refused and says what it lacks, a whole one
 * reaches storage, and it is still there after a reload — and after typing in
 * Investigate, which rebuilds the same record from its own edit and would drop
 * anything it did not carry forward.
 */

const COMPETITION = "/studio/competition";
const INVESTIGATE = "/studio/investigate";
const DATABASE = "ops-studio-projects";

/** Findings on disk, which is the only thing that can answer "was it kept?". */
async function storedFindings(page: Page): Promise<Record<string, unknown>[]> {
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
        if (investigation) return investigation.forces ?? [];
      } catch {
        // Not a project row; the recovery store keeps unparsed text by design.
      }
    }
    return [];
  }, DATABASE);
}

/** How many investigations are on disk. The save line on screen cannot be waited on. */
async function storedCompanies(page: Page): Promise<number> {
  return page.evaluate<number, string>(async (name) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (!db.objectStoreNames.contains("projects")) {
      db.close();
      return 0;
    }
    const rows = await new Promise<Record<string, string>[]>((resolve) => {
      const request = db.transaction("projects").objectStore("projects").getAll();
      request.onsuccess = () => resolve(request.result);
    });
    db.close();
    for (const row of rows) {
      try {
        const project = JSON.parse(row.raw ?? JSON.stringify(row));
        if (project.investigations) return project.investigations.length;
      } catch {
        // Not a project row.
      }
    }
    return 0;
  }, DATABASE);
}

/**
 * One company to hang findings on, made the way a learner would.
 *
 * Waited on through storage rather than the page's own "Saved in this browser",
 * which is already showing from the previous keystroke and would let this
 * return before anything was written — leaving the competition surface on its
 * empty state and every test after it failing for the wrong reason.
 */
async function startCompany(page: Page, name = "Atkore") {
  await page.goto(INVESTIGATE);
  await page.getByPlaceholder("Its ticker symbol").fill(name);
  await page.getByPlaceholder("0", { exact: true }).first().fill("1000");
  await page.getByPlaceholder("Its ticker symbol").click();
  await expect.poll(() => storedCompanies(page), { timeout: 15_000 }).toBeGreaterThan(0);
}

async function writeFinding(page: Page) {
  await page.getByRole("button", { name: "Are there fewer suppliers than there are companies buying from them?" }).click();
  await page.getByLabel("How it works").fill("Two firms make the part and it cannot buy the part anywhere else.");
  await page.getByText("Costs", { exact: true }).click();
  await page.getByText("Built into the business", { exact: true }).click();
  await page.getByLabel("What would change your mind").fill("A third supplier qualifying.");
}

test("a finding needs a mechanism and what would change it, not a plus or a minus", async ({ page }) => {
  await startCompany(page);
  await page.goto(COMPETITION);

  await page.getByRole("button", { name: "Who it buys from" }).click();
  await page.getByRole("button", { name: "How much leverage do the businesses it buys from have?" }).click();

  // Nothing written: the paper's objection to this framework, enforced.
  await page.getByRole("button", { name: "Record this finding" }).click();
  await expect(page.getByText(/^Still needs/)).toContainText("how it works, in your own words");
  await expect(page.getByText(/^Still needs/)).toContainText("what would change your mind");
  expect(await storedFindings(page)).toHaveLength(0);
});

test("a whole finding is kept, and survives a reload", async ({ page }) => {
  await startCompany(page);
  await page.goto(COMPETITION);
  await page.getByRole("button", { name: "Who it buys from" }).click();
  await writeFinding(page);
  await page.getByRole("button", { name: "Record this finding" }).click();

  await expect.poll(async () => (await storedFindings(page)).length, { timeout: 15_000 }).toBe(1);
  const [finding] = await storedFindings(page);
  expect(finding).toMatchObject({ force: "suppliers", question: "concentration", effect: "costs", standing: "structural" });

  await expect(page.getByText("Two firms make the part and it cannot buy the part anywhere else.")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Two firms make the part and it cannot buy the part anywhere else.")).toBeVisible();
  await expect(page.getByText("Moves costs")).toBeVisible();
});

test("typing in Investigate afterwards does not drop it", async ({ page }) => {
  await startCompany(page);
  await page.goto(COMPETITION);
  await page.getByRole("button", { name: "Who it buys from" }).click();
  await writeFinding(page);
  await page.getByRole("button", { name: "Record this finding" }).click();
  await expect.poll(async () => (await storedFindings(page)).length, { timeout: 15_000 }).toBe(1);

  // Investigate rebuilds the investigation from its own edit on every keystroke.
  await page.goto(INVESTIGATE);
  await page.getByPlaceholder("0", { exact: true }).nth(1).fill("150");
  await page.getByPlaceholder("Its ticker symbol").click();
  await expect.poll(async () => (await storedFindings(page)).length, { timeout: 15_000 }).toBe(1);
});

test("the worked example is Porter's, on airlines, and says so", async ({ page }) => {
  await startCompany(page);
  await page.goto(COMPETITION);
  await page.getByRole("button", { name: "Who it buys from" }).click();
  // A summary is not exposed as a button, so it is opened by its words.
  await page.getByText("How Porter read this for airlines").click();
  await expect(page.getByRole("main")).toContainText("airports operate as local monopolies");
  await expect(page.getByRole("main")).toContainText("Not a verdict on your company");

  // Rivalry has no airline verdict in the paper, and the surface does not invent one.
  await page.getByRole("button", { name: "Rivals here now" }).click();
  await expect(page.getByRole("main")).toContainText("The paper gives no airline verdict for this one");
});

test("with nothing investigated it sends you to start a company", async ({ page }) => {
  await page.goto(COMPETITION);
  await expect(page.getByRole("link", { name: /Start with a company.s figures/ })).toBeVisible();
});

test("a finding can be taken back", async ({ page }) => {
  await startCompany(page);
  await page.goto(COMPETITION);
  await page.getByRole("button", { name: "Who it buys from" }).click();
  await writeFinding(page);
  await page.getByRole("button", { name: "Record this finding" }).click();
  await expect.poll(async () => (await storedFindings(page)).length, { timeout: 15_000 }).toBe(1);

  await page.getByRole("button", { name: "Remove" }).click();
  await expect.poll(async () => (await storedFindings(page)).length, { timeout: 15_000 }).toBe(0);
});
