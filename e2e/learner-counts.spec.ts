import { expect, test, type Page } from "@playwright/test";
import { PUZZLES } from "../data/daily-puzzle/puzzles";

/*
 * The six counts (lib/counts), seen the way they leave a real page: each is
 * announced as an `ops-count` event with exactly what would be sent. Every
 * test checks the count appears once for one real action, and not again on a
 * reload or a repeat. "First stage finished" and "Lesson finished" are also
 * checked for all 29 staged lessons by the lesson walk in lesson-typography.
 */
const FIRST = PUZZLES[0];
const LESSON = "if-1-2-where-philosophy-enters-the-investment-process";

type Count = { name: string; props: Record<string, string | number> };

/** Records counts in `sessionStorage`, so they survive the reloads these tests use to prove nothing is counted twice. */
async function recordCounts(page: Page) {
  await page.addInitScript(() => {
    window.addEventListener("ops-count", (event) => {
      const kept = JSON.parse(sessionStorage.getItem("test-counts") ?? "[]");
      kept.push((event as CustomEvent).detail);
      sessionStorage.setItem("test-counts", JSON.stringify(kept));
    });
  });
}

const counts = (page: Page) => page.evaluate(() => JSON.parse(sessionStorage.getItem("test-counts") ?? "[]") as Count[]);
const named = async (page: Page, name: string) => (await counts(page)).filter((c) => c.name === name);

/** Waits until React is listening, so a click is not dropped on server-rendered HTML. */
async function hydrated(page: Page, selector: string) {
  await expect
    .poll(() => page.evaluate((s) => [...document.querySelectorAll(s)].some((n) => Object.keys(n).some((k) => k.startsWith("__reactProps$"))), selector), {
      timeout: 45_000,
    })
    .toBe(true);
}

async function withoutShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "share", { value: undefined, configurable: true });
  });
}

test("a solved puzzle counts once with its clues; a share counts and its link counts the arrival once", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await withoutShareSheet(page);
  await recordCounts(page);

  await page.goto(`/daily/${FIRST.number}`);
  await hydrated(page, "main button");
  await page.getByRole("button", { name: "Show the next clue" }).click();
  await page.getByRole("textbox", { name: "Your guess" }).fill(FIRST.answer.name);
  await page.getByRole("textbox", { name: "Your guess" }).press("Enter");
  await expect(page.getByRole("heading", { name: `It was ${FIRST.answer.name}.` })).toBeVisible();
  expect(await named(page, "Puzzle solved")).toEqual([{ name: "Puzzle solved", props: { puzzle: FIRST.number, clues: 2 } }]);

  await page.reload();
  await expect(page.getByRole("heading", { name: `It was ${FIRST.answer.name}.` })).toBeVisible();
  expect(await named(page, "Puzzle solved"), "reopening a solved puzzle is not a second solve").toHaveLength(1);

  await page.getByRole("button", { name: "Share result" }).click();
  await expect(page.getByText("Result copied.")).toBeVisible();
  expect(await named(page, "Shared")).toEqual([{ name: "Shared", props: { page: "puzzle", how: "link" } }]);
  const link = (await page.evaluate(() => navigator.clipboard.readText())).split("\n").at(-1)!;
  expect(new URL(link).searchParams.get("via")).toBe("link");

  // Whoever the result is posted to opens the link: its path and mark, on this test server (the
  // canonical origin in it can be another machine's, or another server on this one).
  await page.goto(new URL(link).pathname + new URL(link).search);
  await expect(page.getByRole("heading", { name: `It was ${FIRST.answer.name}.` })).toBeVisible();
  await expect.poll(() => named(page, "Arrived from a share")).toEqual([{ name: "Arrived from a share", props: { page: "puzzle", how: "link" } }]);
  await expect.poll(() => page.evaluate(() => window.location.search)).toBe("");
  await page.reload();
  await expect(page.getByRole("heading", { name: `It was ${FIRST.answer.name}.` })).toBeVisible();
  expect(await named(page, "Arrived from a share"), "a reload of a shared link is not a second arrival").toHaveLength(1);

  // Nothing a learner typed or guessed, and no company, is in any count.
  const sent = JSON.stringify(await counts(page)).toLowerCase();
  expect(sent).not.toContain(FIRST.answer.name.toLowerCase());
  expect(sent).not.toContain(FIRST.answer.ticker.toLowerCase());
});

test("a lesson's Share menu marks each way out, and a Classroom link counts its arrival", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await withoutShareSheet(page);
  await recordCounts(page);
  await page.goto(`/lessons/${LESSON}`);
  await hydrated(page, "[data-share-menu] button");

  const share = page.getByRole("button", { name: "Share this lesson" });
  await share.click();
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toBeVisible();
  expect(new URL(await page.evaluate(() => navigator.clipboard.readText())).searchParams.get("via")).toBe("link");

  await share.click();
  const classroom = page.getByRole("link", { name: /Share to Google Classroom/ });
  const posted = new URL((await classroom.getAttribute("href"))!).searchParams.get("url")!;
  expect(new URL(posted).searchParams.get("via")).toBe("classroom");
  // Opening Classroom is the hand-off; the test keeps the new tab from loading Google.
  await context.route("https://classroom.google.com/**", (route) => route.abort());
  await classroom.click();
  await expect
    .poll(() => named(page, "Shared"))
    .toEqual([
      { name: "Shared", props: { page: "lesson", how: "link" } },
      { name: "Shared", props: { page: "lesson", how: "classroom" } },
    ]);

  // A student opens the link the teacher posted.
  const student = await context.newPage();
  await recordCounts(student);
  await student.goto(new URL(posted).pathname + new URL(posted).search);
  await expect.poll(() => named(student, "Arrived from a share")).toEqual([{ name: "Arrived from a share", props: { page: "lesson", how: "classroom" } }]);
  await expect.poll(() => student.evaluate(() => window.location.search)).toBe("");
});

test("finishing a lesson's first stage counts once in this browser, even after a reload and a second answer", async ({ page }) => {
  test.setTimeout(120_000);
  await recordCounts(page);
  const answerStageOne = async () => {
    await page.goto(`/lessons/${LESSON}`);
    await hydrated(page, "#lesson-journey button");
    const add = page.getByRole("button", { name: /^Add stage \d/ });
    while (await add.count()) await add.click();
    await page.getByRole("button", { name: "The portfolio’s broad asset allocation." }).click();
    // Each shell words it its own way: "Step complete." here, "Stage complete." in others.
    await expect(page.getByText(/(Stage|Step) complete\./).first()).toBeVisible();
  };
  await answerStageOne();
  expect(await named(page, "First stage finished")).toEqual([{ name: "First stage finished", props: { lesson: LESSON } }]);
  await answerStageOne();
  expect(await named(page, "First stage finished"), "answering stage 1 again is not a second first stage").toHaveLength(1);
  expect(await named(page, "Lesson finished"), "one stage of six is not a finished lesson").toEqual([]);
});

test("coming back within a week counts once that day; a first visit counts nothing", async ({ page }) => {
  await recordCounts(page);
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ops-last-visit-v1"))).not.toBeNull();
  expect(await named(page, "Came back within 7 days"), "a first visit is not a return").toEqual([]);

  // Three days ago, as this browser would have kept it.
  await page.evaluate(() => {
    const d = new Date(Date.now() - 3 * 86_400_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    localStorage.setItem("ops-last-visit-v1", `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  });
  await page.goto("/courses");
  await expect.poll(() => named(page, "Came back within 7 days")).toEqual([{ name: "Came back within 7 days", props: {} }]);
  await page.goto("/daily");
  await page.reload();
  await page.waitForLoadState("load");
  expect(await named(page, "Came back within 7 days"), "later loads the same day are not more returns").toHaveLength(1);
  // Only the day is kept.
  expect(await page.evaluate(() => localStorage.getItem("ops-last-visit-v1"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
