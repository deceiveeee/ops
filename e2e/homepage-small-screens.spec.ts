import { expect, test, type Page } from "@playwright/test";

/**
 * The homepage chapters have to fit the screen they are pinned to.
 *
 * Each one is a tall section holding a `sticky` pane exactly one screen high,
 * with its content vertically centred. That is a fixed budget, and three things
 * were spending more than it: the stack itself on a short phone, a 68px sticky
 * site header taking a bite out of the top, and `overflow-hidden` on the pane —
 * which meant the excess was not merely present but silently trimmed, equally
 * at both ends. The headline disappeared upward, which reads as the section
 * above covering it, and the chart below was cut in half.
 *
 * None of it showed on a large phone. It failed on an iPhone SE and passed on
 * an iPhone 14 at nearly the same width, so nothing keyed on width could catch
 * it and looking at one device could not either. These sizes are the real ones
 * people hold.
 */

const PHONES = [
  { name: "iPhone 14 Pro", width: 393, height: 844 },
  { name: "iPhone 13 mini", width: 375, height: 812 },
  { name: "Android with chrome visible", width: 393, height: 727 },
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "small Android", width: 360, height: 640 },
];

/** Where each pinned chapter sits in the document. */
async function stickyChapters(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("section"))
      .map((section) => ({
        heading: section.querySelector("h2")?.textContent?.trim() ?? "",
        top: Math.round(section.getBoundingClientRect().top + window.scrollY),
        height: Math.round(section.getBoundingClientRect().height),
        hasSticky: Boolean(section.querySelector(".sticky")),
      }))
      .filter((s) => s.hasSticky),
  );
}

for (const phone of PHONES) {
  test(`every chapter fits a ${phone.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: phone.width, height: phone.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const chapters = await stickyChapters(page);
    // A guard against the guard: if the homepage stops using pinned chapters,
    // this file must fail rather than quietly assert nothing.
    expect(chapters.length).toBeGreaterThan(0);

    for (const chapter of chapters) {
      await page.evaluate((y) => window.scrollTo(0, y), chapter.top + Math.round(chapter.height / 2));
      await page.waitForTimeout(400);

      const fit = await page.evaluate(() => {
        const header = document.querySelector("header");
        const headerBottom = header ? Math.round(header.getBoundingClientRect().bottom) : 0;
        const pinned = Array.from(document.querySelectorAll("section .sticky")).find((el) => {
          const box = el.getBoundingClientRect();
          return box.top <= 1 && box.bottom >= window.innerHeight - 1;
        });
        const canvas = pinned?.querySelector<HTMLElement>(".hp-canvas");
        if (!canvas) return null;
        const box = canvas.getBoundingClientRect();
        return {
          // The site header is pinned above the chapter and paints over it, so
          // anything starting higher than its bottom edge is behind it.
          hiddenByHeader: Math.max(0, headerBottom - Math.round(box.top)),
          belowTheFold: Math.max(0, Math.round(box.bottom) - window.innerHeight),
          clips: getComputedStyle(pinned!).overflow !== "visible",
        };
      });

      expect(fit, `no pinned chapter found for "${chapter.heading}"`).not.toBeNull();
      // A pane that clips is a pane that can hide this failure instead of
      // showing it, which is how the bug survived: the excess was cut, so
      // nothing overflowed and nothing looked wrong from the outside.
      expect(fit!.clips, `${chapter.heading} clips its own content`).toBe(false);
      // One pixel of leading is not a covered word; a line of text is.
      expect(fit!.hiddenByHeader, `${chapter.heading} runs under the site header`).toBeLessThan(8);
      expect(fit!.belowTheFold, `${chapter.heading} runs past the bottom of the screen`).toBe(0);
    }
  });
}
