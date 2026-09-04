import { expect, test, type Page } from "@playwright/test";

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

/** Reach the Filing stage, whose radiogroup has three options. */
async function openFilingStage(page: Page) {
  await page.goto(MISSION_12);
  await page.getByRole("button", { name: /Look up/ }).click();
  await page.getByRole("button", { name: /I can tell a filer/ }).click();
  await page.getByRole("button", { name: /Continue to the fund identity/ }).click();
  await page.getByRole("button", { name: /Now let me fill one in/ }).click();
  await page.getByRole("button", { name: /Continue to the filing/ }).click();
  await expect(page.getByRole("radiogroup")).toBeVisible();
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
