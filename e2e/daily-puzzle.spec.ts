import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { PUZZLES } from "../data/daily-puzzle/puzzles";
import { dateOfPuzzle, todaysNumber } from "../lib/daily-puzzle/schedule";

/*
 * The daily company puzzle, played the way a learner plays it. Puzzle #1 has
 * opened on every date these tests can run on, so it is the one played here;
 * today's puzzle depends on the date and is only checked to be there.
 */
const FIRST = PUZZLES[0];
const WRONG = "Starbucks";
const SHOTS = ".agent-shots/daily-puzzle";

/** The browser's own share sheet would open a dialog the test cannot answer, so the copy path is tested. */
async function withoutShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "share", { value: undefined, configurable: true });
  });
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    // Vercel injects its analytics scripts only on its own host; locally they 404.
    if (message.type() === "error" && !/_vercel\//.test(message.location().url ?? "")) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function guess(page: Page, name: string) {
  await page.getByRole("textbox", { name: "Your guess" }).fill(name);
  await page.getByRole("list", { name: "Matching companies" }).getByRole("button", { name: new RegExp(`^${name}`) }).click();
}

const clue = (page: Page, id: string) => page.locator(`[data-clue="${id}"]`);

test("a wrong guess or a skip shows the next clue, and the right guess names the company", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(`/daily/${FIRST.number}`);
  await expect(page.getByRole("heading", { level: 1, name: "Which company is this?" })).toBeVisible();
  await expect(clue(page, "revenue")).toHaveAttribute("data-state", "shown");
  await expect(clue(page, "revenue")).toContainText("of revenue in the year ending");
  // The first clue's term is defined where it appears.
  await expect(clue(page, "revenue")).toContainText("Revenue is the money a company takes in");
  await expect(clue(page, "margin")).toHaveAttribute("data-state", "hidden");
  await expect(page.getByText(FIRST.answer.name, { exact: true })).toHaveCount(0);

  await guess(page, WRONG);
  await expect(clue(page, "margin")).toHaveAttribute("data-state", "shown");
  await expect(clue(page, "margin")).toContainText("Operating profit, also called operating income, is");
  await expect(page.getByText("2 of 6 clues showing")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: WRONG })).toBeVisible();
  // A company already guessed is not offered again.
  await page.getByRole("textbox", { name: "Your guess" }).fill(WRONG);
  await expect(page.getByRole("list", { name: "Matching companies" }).getByRole("button")).toHaveCount(0);
  await expect(page.getByText("You have already guessed that one.")).toBeVisible();

  await page.getByRole("button", { name: "Show the next clue" }).click();
  await expect(clue(page, "assets")).toHaveAttribute("data-state", "shown");
  await expect(clue(page, "industry")).toHaveAttribute("data-state", "hidden");

  await page.getByRole("textbox", { name: "Your guess" }).fill(FIRST.answer.name);
  await page.getByRole("textbox", { name: "Your guess" }).press("Enter");
  const answer = page.getByRole("heading", { name: `It was ${FIRST.answer.name}.` });
  await expect(answer).toBeVisible();
  await expect(answer).toBeFocused();
  await expect(page.getByText("Solved with 3 of 6 clues.")).toBeVisible();
  // Every clue is open once the puzzle is over, for the learner to read.
  for (const id of ["revenue", "margin", "assets", "industry", "mix", "description"]) {
    await expect(clue(page, id)).toHaveAttribute("data-state", "shown");
  }

  // Progress is kept in this browser.
  await page.reload();
  await expect(page.getByRole("heading", { name: `It was ${FIRST.answer.name}.` })).toBeVisible();
  await expect(page.getByText("Solved with 3 of 6 clues.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("a shared result says how it went and never which company it was", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await withoutShareSheet(page);
  await page.goto(`/daily/${FIRST.number}`);
  await page.getByRole("button", { name: "Show the next clue" }).click();
  await page.getByRole("textbox", { name: "Your guess" }).fill(FIRST.answer.name);
  await page.getByRole("textbox", { name: "Your guess" }).press("Enter");
  await page.getByRole("button", { name: "Share result" }).click();
  await expect(page.getByText("Result copied.")).toBeVisible();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toContain(`Investing Studio daily company puzzle #${FIRST.number}`);
  expect(shared).toContain("Solved with 2 of 6 clues");
  expect(shared).toContain("🟥🟩⬜⬜⬜⬜");
  expect(shared).toMatch(new RegExp(`/daily/${FIRST.number}$`));
  expect(shared.toLowerCase()).not.toContain(FIRST.answer.name.toLowerCase());
  expect(shared).not.toContain(FIRST.answer.ticker);
});

test("the answer opens the quoted words in the company's report", async ({ page }) => {
  await page.goto(`/daily/${FIRST.number}`);
  for (let index = 0; index < 6; index += 1) await page.getByRole("button", { name: /Show the next clue|Give up and see the answer/ }).click();
  await expect(page.getByText("Not solved this time.")).toBeVisible();

  // The real route fetches the report from the SEC; here it answers with a place, as it does when the words are found.
  let sent: Record<string, unknown> | null = null;
  await page.route("**/api/studio/locate-passage", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { found: true, strategy: "position", sectionId: "business", start: 145, end: 321 } });
  });
  await page.getByRole("button", { name: "Open the quote" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/studio/filings/${FIRST.answer.cik}/${FIRST.report.accession}\\?doc=${FIRST.report.document.replace(/\./g, "\\.")}&ticker=${FIRST.answer.ticker}&section=business&at=145&len=176`),
  );
  expect(sent).toMatchObject({
    cik: FIRST.answer.cik,
    accession: FIRST.report.accession,
    document: FIRST.report.document,
    sectionId: "business",
    quote: FIRST.description.anchor.quote,
  });
});

test("a passage that cannot be found offers a search of the report instead", async ({ page }) => {
  await page.goto(`/daily/${FIRST.number}`);
  for (let index = 0; index < 6; index += 1) await page.getByRole("button", { name: /Show the next clue|Give up and see the answer/ }).click();
  await page.route("**/api/studio/locate-passage", (route) => route.fulfill({ json: { found: false, message: "This passage could not be found in the report any more." } }));
  await page.getByRole("button", { name: "Open the quote" }).click();
  const alert = page.getByRole("alert").filter({ hasText: /could not be found/ });
  await expect(alert).toBeVisible();
  await expect(alert.getByRole("link", { name: "Search the report for it" })).toHaveAttribute("href", /&q=/);
});

test("past puzzles list how each went without naming an answer", async ({ page }) => {
  await page.goto(`/daily/${FIRST.number}`);
  await guess(page, FIRST.answer.name);
  await expect(page.getByRole("heading", { name: `It was ${FIRST.answer.name}.` })).toBeVisible();
  await page.goto("/daily/past");
  await expect(page.getByRole("heading", { level: 1, name: "Past puzzles" })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(`^Puzzle ${FIRST.number},.*Solved with 1 of 6$`) })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(FIRST.answer.name);
});

test("today's puzzle is in the main navigation and opens", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Daily puzzle" }).click();
  // Generous for the dev server, which compiles the page on its first visit.
  await expect(page).toHaveURL(/\/daily$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Which company is this?" })).toBeVisible();
});

test("a puzzle whose day has not come says when it opens and shows no clue", async ({ page }) => {
  const next = todaysNumber(new Date()) + 1;
  test.skip(next < 1 || next > PUZZLES.length, "No published puzzle opens tomorrow.");
  const puzzle = PUZZLES[next - 1];
  await page.goto(`/daily/${next}`);
  await expect(page.getByText(/This puzzle opens on/)).toBeVisible();
  await expect(page.locator("[data-clue]")).toHaveCount(0);
  // Nothing that identifies the puzzle reaches the page: not its report, not its quoted words.
  const html = await page.content();
  expect(html).not.toContain(puzzle.report.accession);
  expect(html).not.toContain(puzzle.description.anchor.quote.slice(0, 40));
  void dateOfPuzzle;
});

const WIDTHS = [390, 768, 1024, 1280, 1440, 1920];
const HEIGHT: Record<number, number> = { 390: 844, 768: 1024 };

async function measure(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const texts = [...document.querySelectorAll<HTMLElement>("main *")].filter((element) => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent?.trim());
    });
    return {
      screens: doc.scrollHeight / window.innerHeight,
      overflow: doc.scrollWidth - doc.clientWidth,
      small: texts.filter((element) => Number.parseFloat(getComputedStyle(element).fontSize) < 12).map((element) => element.textContent?.trim().slice(0, 40)),
      mono: texts.filter((element) => /mono|courier|consolas/i.test(getComputedStyle(element).fontFamily)).length,
    };
  });
}

test("every state of the puzzle fits a screen and a half at six widths", async ({ page }) => {
  test.setTimeout(600_000);
  mkdirSync(SHOTS, { recursive: true });
  const report: Record<string, unknown>[] = [];
  const states: { name: string; reach: (page: Page) => Promise<void> }[] = [
    { name: "start", reach: async () => {} },
    {
      name: "all-clues",
      reach: async (current) => {
        for (let index = 0; index < 5; index += 1) await current.getByRole("button", { name: "Show the next clue" }).click();
        await expect(current.getByText("6 of 6 clues showing")).toBeVisible();
      },
    },
    {
      name: "solved",
      reach: async (current) => {
        for (let index = 0; index < 5; index += 1) await current.getByRole("button", { name: "Show the next clue" }).click();
        await current.getByRole("textbox", { name: "Your guess" }).fill(FIRST.answer.name);
        await current.getByRole("textbox", { name: "Your guess" }).press("Enter");
        await expect(current.getByRole("heading", { name: `It was ${FIRST.answer.name}.` })).toBeVisible();
      },
    },
  ];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: HEIGHT[width] ?? 900 });
    for (const state of states) {
      await page.goto(`/daily/${FIRST.number}`);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await expect(page.getByRole("textbox", { name: "Your guess" })).toBeEnabled();
      await state.reach(page);
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo(0, 0);
      });
      // Below 1024px one clue shows at a time, so each is selected in turn and the tallest counts.
      const tabs = page.getByRole("group", { name: "Choose a clue to read" }).getByRole("button");
      let size = await measure(page);
      let tallest = "";
      if (await tabs.first().isVisible()) {
        for (const tab of await tabs.all()) {
          if (!(await tab.isEnabled())) continue;
          await tab.click();
          const next = await measure(page);
          if (next.screens > size.screens) {
            size = next;
            tallest = ((await tab.textContent()) ?? "").replace(/\D/g, "");
          }
        }
        if (tallest) await tabs.nth(Number(tallest) - 1).click();
      }
      await page.screenshot({ path: `${SHOTS}/${state.name}-${width}.png`, fullPage: true });
      // Recorded, not gated: with every "What this means" and the sources opened by hand. Opening one
      // removes it from the list, so the first closed one is clicked each time.
      const closed = page.locator("details:not([open]) > summary").filter({ visible: true });
      for (let guard = 0; guard < 12 && (await closed.count()) > 0; guard += 1) await closed.first().click();
      const opened = (await measure(page)).screens;
      report.push({ state: state.name, width, tallest, ...size, opened });
      writeFileSync(`${SHOTS}/report.json`, JSON.stringify(report, null, 2));
      expect.soft(size.screens, `${state.name} at ${width}`).toBeLessThanOrEqual(1.5);
      expect.soft(size.overflow, `${state.name} at ${width}`).toBeLessThanOrEqual(0);
      expect.soft(size.small, `${state.name} at ${width}`).toEqual([]);
      expect.soft(size.mono, `${state.name} at ${width}`).toBe(0);
    }
    await page.goto("/daily/past");
    const past = await measure(page);
    report.push({ state: "past", width, ...past });
    await page.screenshot({ path: `${SHOTS}/past-${width}.png`, fullPage: true });
    expect.soft(past.screens, `past at ${width}`).toBeLessThanOrEqual(1.5);
    expect.soft(past.overflow, `past at ${width}`).toBeLessThanOrEqual(0);
  }
  writeFileSync(`${SHOTS}/report.json`, JSON.stringify(report, null, 2));
});
