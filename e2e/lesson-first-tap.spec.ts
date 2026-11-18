import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * How far a visitor scrolls before a lesson gives them something to do.
 *
 * Why this exists: a tester opened lesson 1 on a phone and reported three
 * screens of reading before the first thing they could tap. Measured on the
 * live site at 375x812 the first activity sat 3.93 screens down and the lesson
 * title itself 1.29 screens down, behind the module's lesson list and source
 * card. Every other check passed, because nothing measured position.
 *
 * AGENTS.md, Screen Budget Rule: "The learner should be able to act without
 * scrolling." This spec verifies the Lesson 1 opening at seven viewport sizes.
 */

const LESSON_1 = "/lessons/what-is-finance-value-time-risk";
const MODULE_1 = [
  "what-is-finance-value-time-risk",
];

/** Width, height. The first is a 4.7-inch phone; the rest are the widths AGENTS.md requires. */
const SIZES: [number, number][] = [
  [375, 667],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
];

async function open(page: Page, route: string, width: number, height: number) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width, height });
  await page.goto(route);
  // The lesson is loaded lazily; its title arrives with it. A cold dev server
  // also compiles the route on first request.
  await expect(page.locator("main h1")).toBeVisible({ timeout: 45_000 });
  await page.evaluate(() => document.fonts.ready);
  // On the dev server the lesson is drawn, removed while its chunk loads, and
  // drawn again (measured: title present, then no title and a one-screen page,
  // then back). A position read in that gap is a position of nothing, so wait
  // until the title is laid out and the page height has held still.
  await page.waitForFunction(
    () => {
      const state = window as unknown as { __height?: number; __since?: number };
      const title = document.querySelector("main h1");
      const height = document.documentElement.scrollHeight;
      const now = performance.now();
      if (!title || title.getBoundingClientRect().height === 0 || state.__height !== height) {
        state.__height = height;
        state.__since = now;
        return false;
      }
      return now - (state.__since ?? now) > 600;
    },
    undefined,
    { timeout: 45_000, polling: 100 },
  );
}

/**
 * Where an element is on the page. Read from the page itself: Playwright's own
 * boundingBox() returned null for the lesson list here while the element was
 * plainly laid out (a 300x454 box by getBoundingClientRect), so it cannot be
 * trusted for a position check.
 */
async function boxOf(target: Locator) {
  return target.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y + scrollY, width: box.width, height: box.height };
  });
}

/**
 * The first thing in the lesson a learner can act on, as a learner would count
 * it: a button, field or slider that belongs to the lesson. Links, the lesson
 * list, the source card, the share menu and fold-open summaries are ways to
 * move around or read more, not something to do, so they are left out.
 */
async function firstActivity(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return null;
    const controls = [...main.querySelectorAll<HTMLElement>("button, input, select, textarea, [role=button], [role=slider], [role=radio], [role=checkbox]")].filter((element) => {
      if (element.closest("nav, aside, [data-share-menu], summary, [data-lesson-chrome]")) return false;
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== "hidden";
    });
    const first = controls[0];
    if (!first) return null;
    const box = first.getBoundingClientRect();
    return {
      text: (first.innerText || first.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 60),
      top: box.top + scrollY,
      bottom: box.bottom + scrollY,
      screens: (box.top + scrollY) / innerHeight,
      viewport: innerHeight,
      scrolled: scrollY,
    };
  });
}

/**
 * What each Module 1 lesson opens on. `first` is the control that must be the
 * first activity on the page, so the check cannot be satisfied by some other
 * control that happens to sit high up. `alsoOnScreen` is the last control the
 * learner needs to see to answer the opening question, so the check cannot be
 * satisfied by one choice peeking over the fold.
 */
const OPENINGS: { n: number; slug: string; first: RegExp; alsoOnScreen: { name: RegExp | string; exact?: boolean; what: string } }[] = [
  { n: 1, slug: MODULE_1[0], first: /business analyst/i, alsoOnScreen: { name: /corporate manager/i, what: "the third lens choice" } },
];

for (const { n, slug, first: expected, alsoOnScreen } of OPENINGS) {
  for (const [width, height] of SIZES) {
    test(`lesson ${n}: the first activity is on the first screen at ${width}x${height}`, async ({ page }) => {
      await open(page, `/lessons/${slug}`, width, height);
      const first = await firstActivity(page);
      expect(first, `lesson ${n} has no activity control`).not.toBeNull();
      expect(first!.scrolled, "the page should open at the top").toBe(0);
      expect(first!.text).toMatch(expected);
      expect(
        first!.bottom,
        `first activity "${first!.text}" ends ${(first!.bottom / first!.viewport).toFixed(2)} screens down; it must be whole on the first screen`,
      ).toBeLessThanOrEqual(first!.viewport);
      const last = await boxOf(page.locator("main").getByRole("button", { name: alsoOnScreen.name, exact: alsoOnScreen.exact }).first());
      expect(last.height, `${alsoOnScreen.what} is not laid out`).toBeGreaterThan(0);
      expect(
        last.y + last.height,
        `${alsoOnScreen.what} ends ${((last.y + last.height) / height).toFixed(2)} screens down; it must also be on the first screen`,
      ).toBeLessThanOrEqual(height);
      const sideways = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(sideways, "the page scrolls sideways").toBeLessThanOrEqual(0);
    });
  }

  // AGENTS.md: "Preamble before the first interactive control must not exceed
  // half a viewport", measured at 1440x900.
  test(`lesson ${n}: no more than half a screen comes before the first activity at 1440x900`, async ({ page }) => {
    await open(page, `/lessons/${slug}`, 1440, 900);
    const first = await firstActivity(page);
    expect(first, `lesson ${n} has no activity control`).not.toBeNull();
    expect(first!.top, `first activity "${first!.text}" starts ${first!.screens.toFixed(2)} screens down`).toBeLessThanOrEqual(450);
  });
}

test("lesson 1: picking a lens answers at once and ticks the first objective", async ({ page }) => {
  await open(page, LESSON_1, 390, 844);
  await expect(page.getByText(/0 of 3 covered/i)).toBeVisible();
  const choice = page.getByRole("button", { name: /quant investor/i });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/All three are finance/i)).toBeVisible();
  await expect(page.getByText(/1 of 3 covered/i)).toBeVisible();
  // The tap must not throw the learner somewhere else on the page.
  await expect(choice).toBeInViewport();
});

test("lesson 1: nothing the old opening taught has been dropped", async ({ page }) => {
  await open(page, LESSON_1, 390, 844);
  const main = page.locator("main");
  // Shown, not merely present in the markup: each must be something a learner
  // can read on the page as it opens.
  for (const sentence of [
    "Finance is not only about stocks, banks, or Wall Street.",
    "the systematic and disciplined study of financial transactions involving money",
    "Inspired by Warren Buffett",
    "Inspired by James Simons",
    "Inspired by Jack Welch",
  ]) {
    await expect(main.getByText(sentence)).toBeVisible();
  }
  await expect(main.getByText("Mathematics", { exact: true })).toBeVisible();
  for (const concept of ["Value", "Time", "Risk"]) {
    await expect(main.locator("li", { hasText: new RegExp(`^${concept}$`) })).toBeVisible();
  }
  // The objectives are one tap away, and all seven are still there. What the
  // lesson covers moved in with them on 2026-11-16: it describes the lesson
  // rather than teaching, and it stood between the first two activities.
  await main.getByText("Learning objectives").click();
  await expect(main.getByText("This lesson introduces the core framework used throughout finance")).toBeVisible();
  for (const objective of [
    "Explain why finance applies to both personal and corporate decisions.",
    "Identify the main participants in the financial system.",
    "Distinguish between valuation and management.",
    "Explain why accounting is the language of finance.",
    "Distinguish between stock variables and flow variables.",
    "Explain why time and risk make finance difficult.",
    "Describe the six fundamental principles of finance.",
  ]) {
    await expect(main.getByText(objective)).toBeVisible();
  }
  // Each lens keeps its full description, one tap away.
  for (const [name, description] of [
    [/business analyst/i, "This side of finance relies on reading financial statements"],
    [/quant investor/i, "This side of finance uses data, statistics, algorithms, and models"],
    [/corporate manager/i, "This side of finance focuses on capital allocation"],
  ] as const) {
    await main.getByRole("button", { name }).click();
    await expect(main.getByText(description)).toBeVisible();
  }
  // A note to ourselves that used to be shown to learners.
  await expect(main).not.toContainText("No portraits");
});

/*
 * Lesson 1's next activity, the financial-system diagram, was a 680px-wide
 * drawing in a box that scrolled sideways: on a phone three of its six
 * participants started off-screen, and even at 1440px Capital Markets was cut
 * off, though the mini-check after it asks about capital markets. Each
 * participant must sit inside the diagram's own frame, and all six must be
 * reachable by tapping.
 */
const PARTICIPANTS = ["Households", "Nonfinancial Corporations", "Financial Intermediaries", "Capital Markets", "Labor Markets", "Product Markets"];
for (const [width, height] of [[390, 844], [1024, 768], [1440, 900]] as const) {
  test(`lesson 1: all six participants of the financial-system diagram fit its frame at ${width}x${height}`, async ({ page }) => {
    await open(page, LESSON_1, width, height);
    const main = page.locator("main");
    const participant = (name: string) => main.getByRole("button", { name: new RegExp(`^${name}`) }).first();
    const frame = await boxOf(participant("Households").locator("xpath=ancestor::*[contains(@class,'ops-interactive-frame')][1]"));
    for (const name of PARTICIPANTS) {
      const box = await boxOf(participant(name));
      expect(box.width, `${name} is not laid out`).toBeGreaterThan(0);
      expect(box.x, `${name} starts left of the diagram's frame`).toBeGreaterThanOrEqual(frame.x - 0.5);
      expect(box.x + box.width, `${name} runs past the right of the diagram's frame`).toBeLessThanOrEqual(frame.x + frame.width + 0.5);
    }
    for (const name of PARTICIPANTS) await participant(name).click();
    await expect(main.getByText("6/6 explored")).toBeVisible();
  });
}

/*
 * The same tester's second point: after the first tap, the lesson went back to
 * reading. On 2026-11-16 the financial-system diagram, lesson 1's next
 * activity, started 2.24 screens below the last lens choice on a phone; with
 * the repeated "what finance is" text folded together it starts 1.93 below.
 * This holds it to two screens of reading at most.
 */
test("lesson 1: the next activity follows the opening pick within two screens on a phone", async ({ page }) => {
  await open(page, LESSON_1, 390, 844);
  const main = page.locator("main");
  await main.getByRole("button", { name: /business analyst/i }).click();
  await expect(page.getByText(/All three are finance/i)).toBeVisible();
  const lastChoice = await boxOf(main.getByRole("button", { name: /corporate manager/i }));
  const firstNode = await boxOf(main.getByRole("button", { name: /^Households/ }).first());
  expect(firstNode.height, "the diagram is not laid out").toBeGreaterThan(0);
  const screens = (firstNode.y - (lastChoice.y + lastChoice.height)) / 844;
  expect(screens, `the diagram starts ${screens.toFixed(2)} screens below the last lens choice`).toBeLessThanOrEqual(2);
});

for (const slug of MODULE_1) {
  test(`module 1 layout: ${slug} shows its title first on a phone and keeps the lesson list`, async ({ page }, info) => {
    await open(page, `/lessons/${slug}`, 390, 844);
    const title = await boxOf(page.locator("main h1"));
    expect(title.height, "the lesson title is not laid out").toBeGreaterThan(0);
    expect(title.y + title.height, "the lesson title must be whole on the first screen").toBeLessThanOrEqual(844);
    const list = page.getByRole("navigation", { name: "Module progress" });
    await expect(list).toHaveCount(1);
    await expect(list.getByRole("link")).toHaveCount(5);
    const listBox = await boxOf(list);
    expect(listBox.height, "the lesson list is not laid out").toBeGreaterThan(0);
    expect(listBox.y, "on a phone the lesson list comes after the lesson, not before it").toBeGreaterThan(title.y);
    await expect(page.locator("main")).toContainText("MIT OCW 15.401 Finance Theory I");
    const first = await firstActivity(page);
    info.annotations.push({ type: "first activity", description: first ? `${slug}: "${first.text}" at ${first.screens.toFixed(2)} screens` : `${slug}: none` });
    console.log(first ? `${slug}: first activity "${first.text}" at ${first.screens.toFixed(2)} screens (390x844)` : `${slug}: no activity control`);
  });
}

test("module 1 layout: on a phone the title row leads to the lesson list", async ({ page }) => {
  await open(page, LESSON_1, 390, 844);
  const list = page.getByRole("navigation", { name: "Module progress" });
  await expect(list).not.toBeInViewport();
  const link = page.getByRole("link", { name: /All 5 lessons/ });
  const linkBox = await boxOf(link);
  expect(linkBox.height, "the link must be tall enough to tap").toBeGreaterThanOrEqual(44);
  await link.click();
  await expect(list).toBeInViewport();
  // The site header is sticky; the list must land below it, not under it.
  const top = await list.evaluate((element) => element.getBoundingClientRect().top);
  const header = await page.locator("header").first().evaluate((element) => element.getBoundingClientRect().bottom);
  expect(top, "the lesson list is hidden under the site header").toBeGreaterThanOrEqual(header);
});

test("module 1 layout: the lesson list sits beside the lesson on a wide screen", async ({ page }) => {
  await open(page, LESSON_1, 1440, 900);
  const list = await boxOf(page.getByRole("navigation", { name: "Module progress" }));
  const title = await boxOf(page.locator("main h1"));
  expect(list.height, "the lesson list is not laid out").toBeGreaterThan(0);
  expect(list.x + list.width, "the lesson list should be in the left column").toBeLessThan(title.x);
  expect(list.y, "the lesson list should start on the first screen").toBeLessThan(900);
});
