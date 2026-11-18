import { expect, test } from "@playwright/test";
import { HOMEPAGE } from "../lib/homepage-version";

/**
 * Two homepages, one live.
 *
 * lib/homepage-version.ts chooses which one "/" shows. Both stay reachable at
 * /homepage/current and /homepage/classic so they can be compared before
 * switching, and neither preview address may be indexed: the site must never
 * offer search engines two homepages. The classic one is the homepage main had
 * before November 2026, kept whole so switching back is one line.
 */
const TITLES = {
  current: "Learn investing, then practice on real company reports.",
  // A line break, not a space, separates the two sentences in the heading.
  classic: /^Your money\.\s*Your move\.$/,
} as const;

test("each version renders at its preview address, kept out of search results", async ({ page }) => {
  for (const version of ["current", "classic"] as const) {
    await page.goto(`/homepage/${version}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TITLES[version]);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("the classic homepage still works: its experiment answers a choice", async ({ page }) => {
  await page.goto("/homepage/classic");
  await expect(page.getByText("What can time do to $100?")).toBeVisible();
  await page.getByRole("button", { name: "10 years", exact: true }).click();
  // $100 growing 5% a year for 10 years: 100 x 1.05^10 = $162.89.
  await expect(page.getByText("$162.89").first()).toBeVisible();
});

test("the homepage shows the chosen version, and an unknown version is not found", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(TITLES[HOMEPAGE]);
  // "/" asks for no special treatment: no robots tag that would keep it out of search results.
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  const missing = await page.goto("/homepage/other");
  expect(missing?.status()).toBe(404);
});
