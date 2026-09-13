import { expect, test, type Page } from "@playwright/test";

/**
 * What a learner worked out, kept whether or not they buy the thing.
 *
 * Until this shipped the three note boxes appeared only for an investment
 * already in the portfolio, so the conclusion a beginner most needs to
 * record — "I read this and decided against it" — had nowhere to go, and the
 * status, rejection reason and evidence fields in the stored record were
 * written by nothing at all.
 *
 * Every assertion here reads IndexedDB or the app's own backup file rather than
 * the screen. What is on screen a moment after typing proves only that React
 * has state; the question worth asking is whether the reasoning is still there
 * after the position is removed, after a reload, and after a restore.
 */

const RESEARCH = "/studio/research";
const DATABASE = "ops-studio-projects";

type StoredCandidate = {
  id: string;
  status: string;
  why: string;
  rejectedBecause: string;
  evidence: { role: string; note: string; sourceId: string; locator: string }[];
};

/** The saved record, out of the store the app actually writes to. */
async function stored(page: Page): Promise<StoredCandidate[]> {
  return page.evaluate<StoredCandidate[], string>(async (name) => {
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
        if (Array.isArray(project.candidates)) {
          return project.candidates.map((candidate: Record<string, unknown>) => ({
            id: candidate.instrumentId as string,
            status: candidate.status as string,
            why: candidate.why as string,
            rejectedBecause: candidate.rejectedBecause as string,
            evidence: (candidate.evidence as Record<string, string>[]).map((entry) => ({
              role: entry.role,
              note: entry.note,
              sourceId: entry.sourceId,
              locator: entry.locator,
            })),
          }));
        }
      } catch {
        // Not a project row. The recovery store holds unparsed text by design.
      }
    }
    return [];
  }, DATABASE);
}

const openCard = async (page: Page, symbol: string) => {
  await page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).first().click();
  await expect(page.getByRole("heading", { name: /Your record/ })).toBeVisible();
};

/** The radio input is visually hidden inside its label, which is what a person clicks. */
const choose = (page: Page, label: string) => page.getByText(label, { exact: true }).click();

const vti = (rows: StoredCandidate[]) => rows.find((row) => row.id === "vti");

test.describe("recording research on something you do not own", () => {
  test("keeps a note for an investment that is in no portfolio", async ({ page }) => {
    await page.goto(RESEARCH);
    await openCard(page, "VTI");

    await page.getByLabel("Why it belongs").fill("The whole US market in one purchase");
    await expect.poll(async () => vti(await stored(page))?.why).toBe("The whole US market in one purchase");

    // Nothing was added to a portfolio to make this possible.
    await expect(page.getByRole("button", { name: "Remove", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add to portfolio" }).first()).toBeVisible();
  });

  test("records a decision against it, with the reason", async ({ page }) => {
    await page.goto(RESEARCH);
    await openCard(page, "VTI");

    await choose(page, "Decided against");
    await page.getByLabel("Why you decided against it").fill("I already hold this exposure through my pension");

    await expect.poll(async () => vti(await stored(page))?.status).toBe("rejected");
    await expect.poll(async () => vti(await stored(page))?.rejectedBecause).toBe(
      "I already hold this exposure through my pension",
    );
  });

  test("keeps the reason when the standing moves off rejected, so a misclick costs nothing", async ({ page }) => {
    await page.goto(RESEARCH);
    await openCard(page, "VTI");

    await choose(page, "Decided against");
    await page.getByLabel("Why you decided against it").fill("Too broad for what I want");
    await expect.poll(async () => vti(await stored(page))?.rejectedBecause).toBe("Too broad for what I want");

    await choose(page, "Worth a closer look");
    await expect.poll(async () => vti(await stored(page))?.status).toBe("shortlisted");
    // The sentence the learner thought about is not collateral damage.
    expect(vti(await stored(page))?.rejectedBecause).toBe("Too broad for what I want");
  });
});

test.describe("evidence for and against", () => {
  test("saves what was read against the source it came from", async ({ page }) => {
    await page.goto(RESEARCH);
    await openCard(page, "VTI");

    await page.getByText("Save something you read").click();
    await choose(page, "Against it");
    await page.getByLabel("Where in it").fill("Fees and expenses");
    await page.getByLabel("What it shows").fill("Costs 0.03% a year, small but not nothing");
    await page.getByRole("button", { name: "Keep this" }).click();

    await expect.poll(async () => vti(await stored(page))?.evidence.length).toBe(1);
    const [saved] = vti(await stored(page))!.evidence;
    expect(saved.role).toBe("challenges");
    expect(saved.note).toBe("Costs 0.03% a year, small but not nothing");
    expect(saved.locator).toBe("Fees and expenses");
    // An SEC accession, so the same id names the same filing wherever it appears.
    expect(saved.sourceId).toMatch(/^\d{10}-\d{2}-\d{6}$/);

    // On screen it shows which way it argues and which filing it came from.
    const record = page.getByRole("main");
    await expect(record).toContainText("Costs 0.03% a year");
    await expect(record).toContainText("Against it");
    await expect(record).toContainText(saved.sourceId);
  });

  test("keeps both sides without balancing them", async ({ page }) => {
    await page.goto(RESEARCH);
    await openCard(page, "VTI");
    await page.getByText("Save something you read").click();

    await choose(page, "For it");
    await page.getByLabel("What it shows").fill("No manager picks the winners");
    await page.getByRole("button", { name: "Keep this" }).click();
    await expect.poll(async () => vti(await stored(page))?.evidence.length).toBe(1);

    await choose(page, "Against it");
    await page.getByLabel("What it shows").fill("Falls with the whole market");
    await page.getByRole("button", { name: "Keep this" }).click();
    await expect.poll(async () => vti(await stored(page))?.evidence.length).toBe(2);

    expect(vti(await stored(page))!.evidence.map((entry) => entry.role)).toEqual(["supports", "challenges"]);
    // No score, no tally, no verdict drawn from which side has more.
    await expect(page.getByRole("main")).not.toContainText(/\b1 for\b|\bscore\b|\bverdict\b/i);
  });

  test("removes one piece and leaves the other", async ({ page }) => {
    await page.goto(RESEARCH);
    await openCard(page, "VTI");
    await page.getByText("Save something you read").click();
    for (const note of ["First thing", "Second thing"]) {
      await page.getByLabel("What it shows").fill(note);
      await page.getByRole("button", { name: "Keep this" }).click();
      await page.waitForTimeout(150);
    }
    await expect.poll(async () => vti(await stored(page))?.evidence.length).toBe(2);

    await page.getByRole("button", { name: "Remove this note" }).first().click();
    await expect.poll(async () => vti(await stored(page))?.evidence.map((entry) => entry.note)).toEqual(["Second thing"]);
  });
});

test("a rejection outlives the position and a reload", async ({ page }) => {
  await page.goto(RESEARCH);

  // Put it in the portfolio first, which is the only way research could be
  // written before this existed.
  await page.getByRole("button", { name: "Add to portfolio" }).first().click();
  await openCard(page, "VTI");
  await page.getByLabel("Why it belongs").fill("Wanted one broad fund");
  await choose(page, "Decided against");
  await page.getByLabel("Why you decided against it").fill("Doubles up with what I already own");
  await page.getByText("Save something you read").click();
  await page.getByLabel("What it shows").fill("Holds the same companies as my pension fund");
  await page.getByRole("button", { name: "Keep this" }).click();
  await expect.poll(async () => vti(await stored(page))?.evidence.length).toBe(1);

  // Now take it out of the portfolio. Under v1 this deleted the research.
  // "Remove this note" is the evidence control; this one is the position.
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.waitForTimeout(400);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const after = vti(await stored(page));
  expect(after?.status).toBe("rejected");
  expect(after?.rejectedBecause).toBe("Doubles up with what I already own");
  expect(after?.why).toBe("Wanted one broad fund");
  expect(after?.evidence).toHaveLength(1);

  // And it is findable, not merely stored: the Overview says where it got to.
  await page.goto("/studio");
  const investments = page.getByRole("region", { name: "Investments you have read about" });
  await expect(investments).toContainText("Decided against");
  await expect(investments).toContainText("1 thing you read");
});

test("evidence survives a backup and a restore", async ({ page }) => {
  await page.goto(RESEARCH);
  await openCard(page, "VTI");
  await choose(page, "Decided against");
  await page.getByLabel("Why you decided against it").fill("Kept for the restore");
  await page.getByText("Save something you read").click();
  await page.getByLabel("Where in it").fill("Principal risks");
  await page.getByLabel("What it shows").fill("Tracks the market down as well as up");
  await page.getByRole("button", { name: "Keep this" }).click();
  await expect.poll(async () => vti(await stored(page))?.evidence.length).toBe(1);

  // The app's own backup, taken through the button a learner would press.
  await page.goto("/studio/review");
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download a backup" }).click(),
  ]).then(([event]) => event);
  const file = await download.path();
  expect(file).toBeTruthy();

  // Start again, so a restore has something to actually restore.
  page.on("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: /Start again/ }).click();
  await expect.poll(async () => (await stored(page)).length).toBe(0);

  await page.setInputFiles('input[type="file"]', file!);
  await expect.poll(async () => vti(await stored(page))?.evidence.length).toBe(1);

  const restored = vti(await stored(page))!;
  expect(restored.status).toBe("rejected");
  expect(restored.rejectedBecause).toBe("Kept for the restore");
  expect(restored.evidence[0].note).toBe("Tracks the market down as well as up");
  expect(restored.evidence[0].locator).toBe("Principal risks");
});
