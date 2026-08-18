import { expect, test, type Page } from "@playwright/test";

/**
 * Mission 9's release evidence closed at `Blocked - implementation` with three
 * gates unrun: browser-level hard-refresh persistence, the keyboard-only path,
 * and reduced motion. They were left as manual checks, which is why they were
 * never re-run after the Stage 2 Sharpe correction. They are tests now.
 */

const MISSION_9 = "/lessons/if-7-1-test-the-claim";

/**
 * Sample the stage container's opacity every frame across a stage change.
 *
 * The shell declares a 240ms enter transition, so sampling is armed before the
 * click rather than after it — a single reading taken afterwards would miss a
 * fade entirely and report a stuck stage as fine.
 */
async function sampleOpacityAcrossAdvance(page: Page, next: RegExp) {
  await page.evaluate(() => {
    const w = window as unknown as { __opacity: string[] };
    w.__opacity = [];
    const start = performance.now();
    const tick = () => {
      const heading = document.querySelector("h2.ops-section-title");
      const el = heading?.parentElement;
      if (el) w.__opacity.push(getComputedStyle(el).opacity);
      if (performance.now() - start < 700) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.getByRole("button", { name: next }).click();
  await page.waitForTimeout(800);
  return page.evaluate(
    () => (window as unknown as { __opacity: string[] }).__opacity,
  );
}

/** Plain action buttons — check, save, advance. */
async function pick(page: Page, name: string | RegExp) {
  await page.getByRole("button", { name }).first().click();
}

/**
 * Select an option and confirm it took.
 *
 * A bare click can land before hydration, leaving the option unselected and the
 * check button disabled — which then fails 30 seconds later pointing at the
 * wrong line. Options carry `aria-pressed`, so retry until it flips.
 */
async function select(page: Page, name: string | RegExp) {
  const option = page.getByRole("button", { name }).first();
  await expect(async () => {
    await option.click();
    await expect(option).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

/**
 * Answering a stage marks it complete but does not advance — the learner reads
 * the feedback and moves on from the shell. Asserting the next stage's title
 * after each advance keeps a silently stalled walk from looking like a pass.
 */
async function advance(page: Page, next: RegExp, arrivedHeading: string) {
  await page.getByRole("button", { name: next }).click();
  await expect(page.getByRole("heading", { name: arrivedHeading })).toBeVisible();
}

async function walkToChecklist(page: Page) {
  // 1 · Joint test
  await select(page, "Any of the above — the test cannot separate them");
  await pick(page, "Check the reasoning");
  await advance(page, /Pick the yardstick/, "Beating the index is not the same as beating the market.");

  // 2 · Yardstick — raw return and risk-adjusted return disagree
  await select(page, "No — it earned less per unit of risk than the index did");
  await advance(page, /Run an event study/, "Some claims are about a moment.");

  // 3 · Event study — assign a cause to each segment of the window
  await select(page, "People who already knew are trading on it");
  await select(page, "The news is still a surprise to most of the market");
  await select(page, "Investors are adjusting to the news gradually");
  await advance(page, /Run a portfolio study/, "Some claims are about a characteristic.");

  // 4 · Portfolio study — the extreme spread, 2.61% − (−1.95%)
  await page.locator("#pe-spread").fill("4.56");
  await pick(page, "Check the spread");
  await advance(page, /Reach for a regression/, "When the claim has more than one moving part.");

  // 5 · Regression — returns are the dependent variable; significance is association
  await select(page, "The returns on the stocks — that is what you are explaining");
  await select(page, "That the variable is associated with returns in this sample");
  await advance(page, /Name the sins/, "Most beat-the-market evidence fails on the same few faults.");

  // 6 · The sins — the only survivor-safe sampling design
  await select(page, /Take the companies listed five years ago, find the ones small and lightly held then/);
  await advance(page, /Write your checklist/, "Charge the claim for risk and for your own friction.");
}

const ABANDON_RULE = "Two consecutive years below the hurdle after costs, and I close the sleeve.";

async function saveChecklist(page: Page) {
  await select(page, "Sharpe ratio — excess return per unit of total risk");
  await select(page, "Portfolio study — my claim is about a characteristic");
  await select(page, "Both a different period and a different universe");
  await select(page, "As above, and assign delisted companies their actual loss");
  await page.locator("#abandon-rule").fill(ABANDON_RULE);
  await pick(page, "Save the evidence test checklist");
  await expect(page.getByRole("button", { name: /Checklist saved/ })).toBeVisible();
}

test("Mission 9 checklist survives a hard refresh and reaches the dossier", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(MISSION_9);
  await walkToChecklist(page);
  await saveChecklist(page);
  await expect(page.getByText("7 of 7 stages complete", { exact: false })).toBeVisible();

  // The gate mission 9 could not close: a real browser reload on a normal
  // origin, not the in-app LAN preview whose result was not trustworthy.
  await page.reload();
  await expect(page.getByText("7 of 7 stages complete", { exact: false })).toBeVisible();

  await page.goto("/dossier");
  for (const label of ["Benchmark", "Test design", "Holdout", "Sampling", "Hurdle", "Abandon if"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("Sharpe ratio — excess return per unit of total risk")).toBeVisible();
  await expect(page.getByText(ABANDON_RULE)).toBeVisible();
});

test("Mission 9 stage 1 is answerable with the keyboard alone", async ({ page }) => {
  await page.goto(MISSION_9);
  await expect(
    page.getByRole("heading", { name: "You are always testing two things at once." }),
  ).toBeVisible();

  const target = "Any of the above — the test cannot separate them";
  const choice = page.getByRole("button", { name: target });

  // Tab to the option and activate it — no mouse anywhere in this test.
  let reached = false;
  for (let i = 0; i < 80 && !reached; i += 1) {
    await page.keyboard.press("Tab");
    reached = await choice.evaluate((el) => el === document.activeElement);
  }
  expect(reached, "the correct option was never reachable by Tab").toBe(true);
  await page.keyboard.press("Enter");
  await expect(choice).toHaveAttribute("aria-pressed", "true");

  const check = page.getByRole("button", { name: "Check the reasoning" });
  let onCheck = false;
  for (let i = 0; i < 20 && !onCheck; i += 1) {
    await page.keyboard.press("Tab");
    onCheck = await check.evaluate((el) => el === document.activeElement);
  }
  expect(onCheck, "the check button was never reachable by Tab").toBe(true);
  await page.keyboard.press("Enter");

  // Completing by keyboard must offer the same shell advance a mouse gets.
  await expect(page.getByRole("button", { name: /Pick the yardstick/ })).toBeVisible();
});

/**
 * This is a content-visibility gate, NOT a differential motion gate, and the
 * difference is deliberate.
 *
 * Two candidate differential assertions were tried and both proved vacuous: the
 * shell's pulsing guide mark and its stage enter transition are each gated on
 * `useReducedMotion()`, and neither actually animates. Probed on 2026-08-14
 * with `prefers-reduced-motion: no-preference` (media query confirmed false),
 * the stage container is only ever `opacity:1;transform:none` — the declared
 * `initial={{ opacity: 0, x: 18 }}` never lands — and `document.getAnimations()`
 * is empty. A test asserting "reduced motion removes the animation" would
 * therefore pass on a still element and prove nothing.
 *
 * So this asserts the requirement that is real for the learner: under reduced
 * motion every stage is fully opaque and the lesson stays completable. It fails
 * if a stage is left faded out or a stage change stops arriving.
 */
test("Mission 9 stays fully visible and completable under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(MISSION_9);
  await expect(
    page.getByRole("heading", { name: "You are always testing two things at once." }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches))
    .toBe(true);

  await select(page, "Any of the above — the test cannot separate them");
  await pick(page, "Check the reasoning");
  const samples = await sampleOpacityAcrossAdvance(page, /Pick the yardstick/);

  expect(samples.length, "the opacity sampler never ran").toBeGreaterThan(5);
  expect(
    samples.filter((value) => value !== "1"),
    "a stage was left partly transparent under reduced motion",
  ).toEqual([]);
  await expect(
    page.getByRole("heading", { name: "Beating the index is not the same as beating the market." }),
  ).toBeVisible();
});
