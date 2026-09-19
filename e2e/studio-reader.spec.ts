import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * The company-report reader: whole sections, search, and passages kept as evidence.
 *
 * The filing is Atkore's own FY2025 10-K, served from e2e/fixtures/edgar rather
 * than sec.gov (see its README), so these pass or fail on the code.
 *
 * Assertions about what was kept read IndexedDB, not the page. A "Kept" message
 * proves React has state; the passage being in storage, attached to the right
 * investigation, surviving Investigate's autosave, and being found again in a
 * freshly fetched filing are the things worth proving.
 */

const REPORT = "/studio/filings/0001666138/0001628280-25-054049?doc=atkr-20250930.htm&ticker=ATKR";
const DATABASE = "ops-studio-projects";
const LIVE = JSON.parse(readFileSync(join(process.cwd(), "e2e", "fixtures", "edgar", "live-anchors.json"), "utf8")) as {
  anchors: { sectionId: string; quote: string; prefix: string; suffix: string; offset: number }[];
};

type StoredPassage = { id: string; sectionId: string; quote: string; offset: number; role: string; note: string };
type StoredInvestigation = { id: string; company: string; figures: Record<string, number>; passages: StoredPassage[] };

async function stored(page: Page): Promise<StoredInvestigation[]> {
  return page.evaluate<StoredInvestigation[], string>(async (name) => {
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
            id: item.id,
            company: item.company,
            figures: item.figures,
            passages: (item.passages as StoredPassage[] | undefined) ?? [],
          }));
        }
      } catch {
        // Not a project row.
      }
    }
    return [];
  }, DATABASE);
}

const main = (page: Page) => page.getByRole("main");

/**
 * The Kept note, found by what it says. The workspace frame's "Saved in this
 * browser" line is a status inside the same main region, so an unscoped status
 * lookup matches two things once keeping actually works.
 */
const keptNote = (page: Page) => main(page).getByRole("status").filter({ hasText: "Kept in your investigation" });

/** Search the report and open the hit in Business, which is where most learners start. */
async function openBusinessHit(page: Page) {
  await page.goto(REPORT);
  await page.getByLabel("Find in this report").fill("PVC resin");
  await page.getByRole("button", { name: "Find", exact: true }).click();
  await main(page).getByRole("link", { name: /Business · page \d+/ }).click();
  await expect(page.locator("#passage mark")).toBeVisible();
}

const keepButton = (page: Page) => page.locator("#passage").getByRole("button", { name: /^Keep paragraph [0-9]+, which begins/ });

test.describe("reading a whole report", () => {
  test("pages through a section rather than stopping at an excerpt", async ({ page }) => {
    await page.goto(REPORT);
    await expect(main(page).getByRole("heading", { level: 2, name: /^Item 1\./ })).toBeVisible();
    await expect(main(page)).toContainText(/Page 1 of \d+/);

    await main(page).getByRole("link", { name: "Next page →" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(main(page)).toContainText(/Page 2 of \d+/);
    await expect(main(page).getByRole("link", { name: "← Previous page" })).toBeVisible();
  });

  test("finds PVC resin in the four sections that mention it, and opens the passage", async ({ page }) => {
    await page.goto(REPORT);
    await page.getByLabel("Find in this report").fill("PVC resin");
    await page.getByRole("button", { name: "Find", exact: true }).click();

    await expect(main(page).getByRole("heading", { level: 2, name: /^4 places mention/ })).toBeVisible();
    const hits = main(page).locator("section[aria-labelledby=find-results] ol > li");
    await expect(hits).toHaveCount(4);

    await main(page).getByRole("link", { name: /Business · page \d+/ }).click();
    await expect(page).toHaveURL(/section=business.*at=\d+.*len=9/);
    await expect(page.locator("#passage mark")).toHaveText("PVC resin");
    await expect(page.locator("#passage")).toBeInViewport();
  });

  test("gives every Keep a name of its own", async ({ page }) => {
    await page.goto(REPORT);
    // evaluateAll does not wait for anything, so wait for the paragraphs first.
    const keeps = main(page).getByRole("button", { name: /^Keep paragraph [0-9]+, which begins/ });
    await expect(keeps.first()).toBeVisible();
    const names = await keeps.evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label")),
    );
    // Pages are sized to the screen, so a page can hold few paragraphs; two are enough to compare.
    expect(names.length).toBeGreaterThan(1);
    expect(new Set(names).size).toBe(names.length);
  });

  test("keeps each view within the screen budget at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const view of [
      REPORT,
      `${REPORT}&section=business&page=4`,
      `${REPORT}&section=risk-factors&page=14`,
      `${REPORT}&section=mdna&page=11`,
      `${REPORT}&q=PVC+resin`,
      `${REPORT}&q=steel`,
    ]) {
      await page.goto(view);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      // Soft, so one run names every view over budget rather than stopping at the first.
      expect.soft(height, view).toBeLessThanOrEqual(1_350);
    }
  });

  test("pages a section to a phone's screen, and not again for a scrolling thumb", async ({ page }) => {
    // Until the reader has measured its column and the room its frame leaves,
    // a page is sized for 1440, and on a phone runs to well over the budget.
    await page.setViewportSize({ width: 390, height: 844 });
    let paged = 0;
    page.on("request", (request) => {
      if (request.url().includes("_rsc=")) paged += 1;
    });
    await page.goto(`${REPORT}&section=risk-factors&page=3`);
    await expect
      .poll(async () => (await page.context().cookies()).find((cookie) => cookie.name === "ops-reader-fit")?.value)
      .toMatch(/^\d+x\d+$/);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(Math.floor(844 * 1.5));

    // A phone's address bar sliding away as the reader scrolls changes the
    // window's height alone, and the page is not fetched again under them.
    const settled = paged;
    await page.setViewportSize({ width: 390, height: 900 });
    await page.waitForTimeout(1_000);
    expect(paged, "paged again for a change of height alone").toBe(settled);

    // Turning the phone is a new width, and the section is paged for it.
    await page.setViewportSize({ width: 844, height: 390 });
    await expect.poll(() => paged).toBeGreaterThan(settled);
  });
});

test.describe("keeping a passage", () => {
  test("starts an investigation of the company and puts the passage in it", async ({ page }) => {
    await openBusinessHit(page);
    const paragraph = (await page.locator("#passage > span").first().textContent()) ?? "";

    await keepButton(page).click();
    await expect(keptNote(page)).toContainText("Kept in your investigation of Atkore Inc., which this started");

    await expect.poll(async () => (await stored(page)).length).toBe(1);
    const [investigation] = await stored(page);
    expect(investigation.company).toBe("Atkore Inc.");
    expect(investigation.passages).toHaveLength(1);
    expect(investigation.passages[0].sectionId).toBe("business");
    expect(investigation.passages[0].quote).toBe(paragraph.trim());
    expect(investigation.passages[0].role).toBe("context");
  });

  test("keeps just the words selected inside a paragraph", async ({ page }) => {
    await openBusinessHit(page);
    await page.evaluate(() => {
      const mark = document.querySelector("#passage mark")!;
      const range = document.createRange();
      range.selectNodeContents(mark);
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    });

    await keepButton(page).click();
    await expect.poll(async () => (await stored(page))[0]?.passages[0]?.quote).toBe("PVC resin");
  });

  test("keeps the same passage once, however many times Keep is pressed", async ({ page }) => {
    await openBusinessHit(page);
    await keepButton(page).click();
    await expect(keptNote(page)).toBeVisible();
    await keepButton(page).click();
    await page.waitForTimeout(400);
    expect((await stored(page))[0].passages).toHaveLength(1);
  });

  test("undo takes the passage back, and the investigation it started", async ({ page }) => {
    await openBusinessHit(page);
    await keepButton(page).click();
    await expect.poll(async () => (await stored(page)).length).toBe(1);

    await main(page).getByRole("button", { name: "Undo" }).click();
    await expect.poll(async () => (await stored(page)).length).toBe(0);
  });

  test("goes to an existing investigation of the company rather than starting another", async ({ page }) => {
    await page.goto("/studio/investigate");
    await page.getByPlaceholder("Its ticker symbol").fill("Atkore Inc.");
    await page.getByLabel("Revenue", { exact: true }).fill("2850378000");
    await expect.poll(async () => (await stored(page)).length).toBe(1);

    await openBusinessHit(page);
    await keepButton(page).click();
    await expect(keptNote(page)).toContainText("Kept in your investigation of Atkore Inc.");
    await expect(keptNote(page)).not.toContainText("which this started");

    await expect.poll(async () => (await stored(page))[0]?.passages.length).toBe(1);
    expect(await stored(page)).toHaveLength(1);
  });
});

test.describe("kept passages in Investigate", () => {
  test("survive Investigate saving the figures as they are typed", async ({ page }) => {
    await openBusinessHit(page);
    await keepButton(page).click();
    await main(page).getByRole("link", { name: "Open it", exact: true }).click();

    await expect(main(page).getByRole("heading", { name: /From its own filings \(1\)/ })).toBeVisible();
    // Investigate rebuilds its record from what is on its page on every save,
    // and its page has never heard of passages.
    await page.getByLabel("Cash", { exact: true }).fill("506699000");
    await expect.poll(async () => (await stored(page))[0]?.figures.cash).toBe(506_699_000);
    expect((await stored(page))[0].passages).toHaveLength(1);
  });

  test("record which way a passage argues, in the learner's words", async ({ page }) => {
    await openBusinessHit(page);
    await keepButton(page).click();
    await main(page).getByRole("link", { name: "Open it", exact: true }).click();

    await page.getByText("Against it", { exact: true }).click();
    await page.getByLabel("What it shows").fill("Three suppliers set the price of my biggest input");
    await expect.poll(async () => (await stored(page))[0]?.passages[0]?.role).toBe("challenges");
    await expect.poll(async () => (await stored(page))[0]?.passages[0]?.note).toBe("Three suppliers set the price of my biggest input");
  });

  test("open where they were kept, in a freshly fetched report", async ({ page }) => {
    await openBusinessHit(page);
    await keepButton(page).click();
    await main(page).getByRole("link", { name: "Open it", exact: true }).click();
    const [investigation] = await stored(page);

    await main(page).getByRole("button", { name: "Open it in the report" }).click();
    await expect(page).toHaveURL(/\/studio\/filings\/0001666138\/0001628280-25-054049\?.*#passage$/);
    await expect(page.locator("#passage mark")).toHaveText(investigation.passages[0].quote);
    // Found exactly where it was left, so nothing to warn about.
    await expect(main(page)).not.toContainText("has moved since you kept it");
  });
});

test("a passage kept against the live filing is found again after the text shifted", async ({ page }) => {
  // Build a project holding passages anchored in the live filing's text, whose
  // spacing differs from the fixture's, and restore it through the app's own
  // backup and restore — the same way a learner's work would arrive from
  // another browser.
  await page.goto("/studio/review");
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download a backup" }).click(),
  ]).then(([event]) => event);
  const project = JSON.parse(readFileSync((await download.path())!, "utf8"));

  const business = LIVE.anchors.find((anchor) => anchor.sectionId === "business")!;
  const passage = (id: string, anchor: typeof business) => ({
    id,
    savedAt: "2026-09-13T00:00:00.000Z",
    cik: "0001666138",
    accession: "0001628280-25-054049",
    document: "atkr-20250930.htm",
    form: "10-K",
    filed: "2025-11-26",
    ...anchor,
    role: "context",
    note: "",
  });
  project.investigations = [
    {
      id: "inv-live",
      createdAt: "2026-09-13T00:00:00.000Z",
      updatedAt: "2026-09-13T00:00:00.000Z",
      company: "Atkore Inc.",
      sic: "3690",
      figures: {},
      riskFreePct: null,
      source: null,
      passages: [
        passage("psg-live", business),
        passage("psg-gone", { ...business, quote: "Words this report has never contained anywhere", offset: 100 }),
      ],
    },
  ];
  const file = join(tmpdir(), `ops-reader-restore-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(project), "utf8");

  page.on("dialog", (dialog) => void dialog.accept());
  await page.setInputFiles('input[type="file"]', file);
  await expect.poll(async () => (await stored(page)).find((item) => item.id === "inv-live")?.passages.length).toBe(2);

  await page.goto("/studio/investigate?company=inv-live");
  const opens = main(page).getByRole("button", { name: "Open it in the report" });

  // The live filing put this sentence at a different offset. It must be found
  // by its words and their surroundings, and the learner told it moved.
  await opens.nth(0).click();
  await expect(page.locator("#passage mark")).toHaveText(business.quote);
  await expect(main(page).getByRole("status").filter({ hasText: "has moved since you kept it" })).toBeVisible();

  // Words that are not in the report are said to be missing, with a way to look.
  await page.goto("/studio/investigate?company=inv-live");
  await opens.nth(1).click();
  await expect(main(page).getByRole("alert").filter({ hasText: "no longer in that section" })).toBeVisible();
  await expect(main(page).getByRole("link", { name: "Search the report for it" })).toBeVisible();
});
