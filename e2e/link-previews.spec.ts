import { expect, test, type Page } from "@playwright/test";
import { findLesson } from "../data/courses/courses";

/*
 * What a link says when it is posted somewhere, and the Share control that
 * posts it. Chat apps read these tags from the page's HTML, so the tests read
 * the same tags rather than anything drawn on the page.
 */
const LESSON = "if-2-2-why-market-rates-change-bond-prices";

async function tags(page: Page, path: string) {
  await page.goto(path);
  return page.evaluate(() => {
    const read = (key: string) => document.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute("content") ?? null;
    return {
      title: read("og:title"),
      description: read("og:description"),
      image: read("og:image"),
      card: read("twitter:card"),
      type: read("og:type"),
    };
  });
}

async function expectImage(page: Page, url: string | null) {
  expect(url, "an og:image").not.toBeNull();
  const response = await page.request.get(url!.replace(/^https?:\/\/[^/]+/, ""));
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect((await response.body()).length).toBeGreaterThan(10_000);
}

test("a lesson link shows the lesson's own title, question and picture", async ({ page }) => {
  const { lesson } = findLesson(LESSON)!;
  const meta = await tags(page, `/lessons/${LESSON}`);
  expect(meta.title).toBe(lesson.title);
  expect(meta.description).toBe(lesson.subtitle);
  expect(meta.type).toBe("article");
  expect(meta.card).toBe("summary_large_image");
  await expectImage(page, meta.image);
});

test("a course link and the puzzle link each describe themselves", async ({ page }) => {
  const course = await tags(page, "/courses/investment-foundations");
  expect(course.title).toBe("Investment Foundations");
  await expectImage(page, course.image);

  const daily = await tags(page, "/daily/1");
  expect(daily.title).toBe("Which company is this? Puzzle #1");
  await expectImage(page, daily.image);
});

test("Share copies the lesson's link and offers Google Classroom", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  // The browser's own share sheet would open a dialog the test cannot answer.
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "share", { value: undefined, configurable: true });
  });
  await page.goto(`/lessons/${LESSON}`);
  const share = page.getByRole("button", { name: "Share this lesson" });
  await share.click();
  await expect(share).toHaveAttribute("aria-expanded", "true");

  const classroom = page.getByRole("link", { name: /Share to Google Classroom/ });
  const href = new URL((await classroom.getAttribute("href"))!);
  expect(href.origin + href.pathname).toBe("https://classroom.google.com/share");
  expect(new URL(href.searchParams.get("url")!).pathname).toBe(`/lessons/${LESSON}`);
  await expect(classroom).toHaveAttribute("target", "_blank");

  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toBeVisible();
  expect(new URL(await page.evaluate(() => navigator.clipboard.readText())).pathname).toBe(`/lessons/${LESSON}`);
  // Copying closes the menu and hands focus back to the button that opened it.
  await expect(share).toHaveAttribute("aria-expanded", "false");
  await expect(share).toBeFocused();
});

test("Escape closes the Share menu without leaving the page", async ({ page }) => {
  await page.goto(`/lessons/${LESSON}`);
  const share = page.getByRole("button", { name: "Share this lesson" });
  await share.click();
  await expect(page.getByRole("button", { name: "Copy link" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(share).toHaveAttribute("aria-expanded", "false");
  await expect(share).toBeFocused();
  await expect(page.getByRole("button", { name: "Copy link" })).toBeHidden();
});
