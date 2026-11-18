import { expect, test, type Page } from "@playwright/test";

/**
 * "Report a problem" lives on the footer's copyright line. The footer is
 * load-bearing: many Studio pages sit just under the 1.5-screen limit, and one
 * more link in the footer's link row once pushed fourteen of them over. These
 * tests hold the control to adding no height at all, and check the form works
 * without ever reaching the real database (the request is answered here).
 */

const LESSON = "/lessons/what-is-finance-value-time-risk";
const WIDTHS = [390, 768, 1024, 1280, 1440, 1920] as const;
const height = (width: number) => (width < 768 ? 844 : 900);

const trigger = (page: Page) => page.locator("footer").getByRole("button", { name: "Report a problem" });

for (const path of ["/studio", LESSON, "/"]) {
  test(`report a problem adds no height to the footer on ${path}`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: height(width) });
      await page.goto(path);
      await expect(trigger(page)).toBeVisible();
      const [withButton, without] = await page.evaluate(() => {
        const footer = document.querySelector<HTMLElement>(".site-footer")!;
        const button = [...footer.querySelectorAll("button")].find((b) => b.textContent === "Report a problem")!;
        const before = footer.getBoundingClientRect().height;
        const parent = button.parentElement!;
        const next = button.nextSibling;
        button.remove();
        const after = footer.getBoundingClientRect().height;
        parent.insertBefore(button, next);
        return [before, after];
      });
      expect(withButton, `${path} at ${width}px`).toBeCloseTo(without, 0);
      const box = await trigger(page).boundingBox();
      expect(box!.height, `tap height at ${width}px`).toBeGreaterThanOrEqual(24);
    }
  });
}

test("a phone visitor can send a report from a lesson", async ({ page }) => {
  const sent: unknown[] = [];
  await page.route("**/api/report-problem", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(LESSON);
  await trigger(page).click();

  const dialog = page.getByRole("dialog", { name: "Report a problem" });
  await expect(dialog).toBeVisible();
  const field = dialog.getByRole("textbox", { name: "What happened?" });
  await expect(field).toBeFocused();
  const box = (await dialog.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.y + box.height, "the whole form fits on a phone screen").toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await field.fill("The diagram is cut off on the right.");
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Report sent. Thank you.");
  expect(sent).toEqual([{ message: "The diagram is cut off on the right.", page: LESSON, viewport: "390x844" }]);

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger(page)).toBeFocused();
});

test("Escape closes the form, keeps the words, and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/studio");
  await trigger(page).click();
  const dialog = page.getByRole("dialog", { name: "Report a problem" });
  await dialog.getByRole("textbox", { name: "What happened?" }).fill("Half-written");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await trigger(page).press("Enter");
  await expect(dialog.getByRole("textbox", { name: "What happened?" })).toHaveValue("Half-written");
});

test("a report that cannot be stored says so and keeps the words", async ({ page }) => {
  await page.route("**/api/report-problem", (route) => route.fulfill({
    status: 502,
    contentType: "application/json",
    body: JSON.stringify({ error: "The report did not send. Try again in a minute, or write to the address on the terms page." }),
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await trigger(page).click();
  const dialog = page.getByRole("dialog", { name: "Report a problem" });
  await dialog.getByRole("textbox", { name: "What happened?" }).fill("Something broke");
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByRole("alert")).toContainText("did not send");
  await expect(dialog.getByRole("link", { name: "Terms page" })).toHaveAttribute("href", "/terms");
  await expect(dialog.getByRole("textbox", { name: "What happened?" })).toHaveValue("Something broke");
});
