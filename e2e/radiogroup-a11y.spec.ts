import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The lesson radiogroup follows the ARIA authoring practice, and these tests
 * exist so it keeps doing so.
 *
 * It did not, until 2026-08-17. Every option was a `role="radio"` button with
 * its own tab stop and the arrow keys did nothing: operable, but not what a
 * screen reader user is told a radiogroup will do, and a five-option group cost
 * five tab stops on the way to the next control. Browser QA of Mission 12
 * surfaced it; `ChoiceGroup.tsx` replaced both journeys' hand-rolled copies.
 *
 * Each assertion below fails against the old implementation, which is the point.
 */

const MISSION_12 = "/lessons/if-pb-12-choose-the-actual-holdings";

const button = (page: Page, name: RegExp) =>
  page.getByRole("button", { name }).first();

/** Present and rendered. Immediate, because it is called inside a retry loop. */
const appears = (target: Locator) => () => target.isVisible().catch(() => false);

/** Present and not disabled — the shell renders its advance button either way. */
const enables = (target: Locator) => () => target.isEnabled().catch(() => false);

/**
 * Click a control and confirm it did something, clicking again if it did not.
 *
 * Playwright's actionability check passes as soon as a button is rendered and
 * stable, which on a freshly navigated lesson can be before React has attached
 * its handler. The click is swallowed, the stage never advances, and the run
 * fails thirty seconds later pointing at the *next* control. That is what three
 * of these four tests did on 2026-09-06 under seven parallel workers, while
 * passing every time the file ran alone.
 *
 * Re-clicking is safe only because every control on this walk is one-way:
 * `setLooked(true)`, and a `completeStage` that returns the current state
 * untouched once the stage is done. A toggle would need a different helper.
 *
 * The consequence is re-checked before each click so a second one is never sent
 * into a stage that has already moved on, and `landed` is always a state change
 * rather than mere presence — see `enables`. Waiting on the advance button
 * merely existing would be satisfied before the stage was answered, which would
 * turn this walk back into the guessing it replaces.
 */
async function step(page: Page, control: RegExp, landed: () => Promise<boolean>) {
  await expect(async () => {
    if (!(await landed())) await button(page, control).click({ timeout: 2_000 });
    expect(await landed(), `clicking ${control} changed nothing`).toBe(true);
  }).toPass({ timeout: 20_000 });
}

/** Reach the Filing stage, whose radiogroup has three options. */
async function openFilingStage(page: Page) {
  await page.goto(MISSION_12);

  // Identity. The lookup result — and the answer button inside it — are
  // rendered only once the search has been run.
  await step(page, /Look up/, appears(button(page, /I can tell a filer/)));
  await step(
    page,
    /I can tell a filer/,
    enables(button(page, /Continue to the fund identity/)),
  );

  // Fund identity.
  await step(
    page,
    /Continue to the fund identity/,
    appears(button(page, /Now let me fill one in/)),
  );
  await step(
    page,
    /Now let me fill one in/,
    enables(button(page, /Continue to the filing/)),
  );

  // Filing — the stage these tests are about.
  await step(
    page,
    /Continue to the filing/,
    appears(page.getByRole("radiogroup").first()),
  );
  await expect(page.getByRole("radiogroup").first()).toBeVisible();
}

const tabIndexes = (page: Page) =>
  page
    .getByRole("radiogroup")
    .first()
    .locator('[role="radio"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex));

test("a radiogroup exposes exactly one tab stop", async ({ page }) => {
  await openFilingStage(page);

  // Nothing chosen yet: the first option is the way in, the rest are not.
  expect(await tabIndexes(page)).toEqual([0, -1, -1]);

  // Once an option is chosen, the tab stop follows the selection, so returning
  // to the group lands on the current answer rather than the top.
  await page.getByRole("radio").nth(1).click();
  expect(await tabIndexes(page)).toEqual([-1, 0, -1]);
});

test("arrow keys move through the options and select as they go", async ({
  page,
}) => {
  await openFilingStage(page);
  const radios = page.getByRole("radiogroup").first().locator('[role="radio"]');

  await radios.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(1)).toBeFocused();
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");

  await page.keyboard.press("ArrowRight");
  await expect(radios.nth(2)).toBeFocused();
  await expect(radios.nth(2)).toHaveAttribute("aria-checked", "true");

  // Only ever one selection.
  await expect(radios.nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "false");

  await page.keyboard.press("ArrowUp");
  await expect(radios.nth(1)).toBeFocused();
});

test("arrow keys wrap at both ends, and Home and End jump", async ({ page }) => {
  await openFilingStage(page);
  const radios = page.getByRole("radiogroup").first().locator('[role="radio"]');

  await radios.first().focus();
  await page.keyboard.press("ArrowUp");
  await expect(radios.nth(2)).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(0)).toBeFocused();

  await page.keyboard.press("End");
  await expect(radios.nth(2)).toBeFocused();

  await page.keyboard.press("Home");
  await expect(radios.nth(0)).toBeFocused();
});

test("Tab leaves the group in one press rather than one per option", async ({
  page,
}) => {
  await openFilingStage(page);
  const radios = page.getByRole("radiogroup").first().locator('[role="radio"]');

  await radios.first().focus();
  await page.keyboard.press("Tab");

  // The old implementation landed on the second option here.
  const stillInside = await page.evaluate(
    () => document.activeElement?.getAttribute("role") === "radio",
  );
  expect(stillInside).toBe(false);
});
