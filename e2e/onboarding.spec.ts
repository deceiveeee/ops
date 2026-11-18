import { test, expect, type Page } from "@playwright/test";
import { learningPath } from "../lib/learning-path";

/**
 * The start guide (/start) and the greetings that read it.
 *
 * Greetings come from the visitor's own clock, so every test that checks one
 * fixes the clock first. Without that, a test written at 9 a.m. would fail
 * when the suite runs in the evening.
 */

const at = (hour: number) => new Date(2026, 10, 13, hour, 0, 0);

async function answer(page: Page, choice: string) {
  await page.getByRole("radio", { name: choice }).check();
  await page.getByRole("button", { name: /^Next/ }).click();
}

test.describe("Start guide", () => {
  test("a newcomer answers two questions and gets lesson 1 and the course path", async ({ page }) => {
    await page.goto("/start");
    await expect(page.getByRole("heading", { level: 1, name: "What brought you here?" })).toBeVisible();
    await expect(page.getByText("Find where to start · Step 1 of 3")).toBeVisible();

    await page.getByRole("button", { name: /^Next/ }).click();
    // Next.js renders its own empty role="alert" route announcer, so match by text.
    await expect(page.getByRole("alert").filter({ hasText: "Pick one to continue." })).toBeVisible();

    await page.getByRole("radio", { name: "Learn how investing works" }).check();
    await expect(page.getByText(/That is Courses/)).toBeVisible();
    await page.getByRole("button", { name: /^Next/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Where are you starting from?" })).toBeFocused();
    await answer(page, "I am new to finance");

    await expect(page.getByRole("heading", { level: 1, name: "Your first step" })).toBeVisible();
    const lesson = page.getByRole("link", { name: /Start lesson 1/ });
    await expect(lesson).toHaveAttribute("href", "/lessons/what-is-finance-value-time-risk");
    await expect(page.getByText(/^Lesson 1: What Is Finance\? Value, Time, and Risk · \d+ min$/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Investment Foundations" })).toHaveAttribute("href", "/courses/investment-foundations");
  });

  test("answers survive a reload, and the finished guide reopens on its result", async ({ page }) => {
    await page.goto("/start");
    await answer(page, "Try building a portfolio");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Where are you starting from?" })).toBeVisible();
    await answer(page, "I know the basics, or I have invested");
    await expect(page.getByRole("link", { name: /Start mission 1/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Your first step" })).toBeVisible();
    await page.getByRole("button", { name: "Change my answers" }).click();
    await expect(page.getByRole("radio", { name: "Try building a portfolio" })).toBeChecked();
  });

  test("the account menu's retake link starts again at question 1", async ({ page }) => {
    await page.goto("/start");
    await answer(page, "Look inside a real company");
    await answer(page, "I am new to finance");
    await page.goto("/start?retake=1");
    await expect(page.getByRole("heading", { level: 1, name: "What brought you here?" })).toBeVisible();
  });

  test("keeps the answers in this browser and sends nothing to the server", async ({ page }) => {
    const sent: string[] = [];
    page.on("request", (request) => {
      if (/supabase|user_onboarding/.test(request.url()) && request.method() !== "GET") sent.push(request.url());
    });
    await page.goto("/start");
    await answer(page, "Learn how investing works");
    await answer(page, "I am new to finance");
    await expect(page.getByRole("heading", { level: 1, name: "Your first step" })).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("ops-start-guide-v1") ?? "null"));
    expect(saved.answers).toEqual({ goal: "learn", start: "new" });
    expect(sent).toEqual([]);
  });
});

test.describe("Greetings", () => {
  const greeting = (page: Page) => page.locator('[data-greeting="ready"]');
  // What to do next is the line under the buttons, not part of the hello.
  const nextLine = (page: Page) => page.locator('[data-next-line="ready"]');

  test("the homepage greets a first-time visitor by the time of day and points to the guide", async ({ page }) => {
    await page.clock.setFixedTime(at(9));
    await page.goto("/");
    await expect(greeting(page)).toHaveText("Good morning, and welcome.");
    await expect(nextLine(page)).toHaveText("Two questions, then your first step. Free, and no account needed.");
  });

  test("after the guide, the homepage offers the first step it chose", async ({ page }) => {
    await page.clock.setFixedTime(at(14));
    await page.goto("/start");
    await answer(page, "Look inside a real company");
    await answer(page, "I am new to finance");
    await page.goto("/");
    await expect(greeting(page)).toHaveText("Good afternoon, welcome back.");
    await expect(nextLine(page)).toHaveText("Your first step: Play today's puzzle");
    await expect(nextLine(page).getByRole("link", { name: "Play today's puzzle" })).toHaveAttribute("href", "/daily");
  });

  test("a returning learner is offered the lesson after the last one finished", async ({ page }) => {
    const steps = learningPath()["finance-foundations"];
    const done = steps.findIndex((step) => step.requires[0] === "present-value-cashflows-assets-npv");
    const next = steps[done + 1];
    await page.clock.setFixedTime(at(21));
    await page.goto("/");
    await page.evaluate(([key, slug]) => localStorage.setItem(key, JSON.stringify({ [slug]: true })), [steps[done].key, steps[done].requires[0]]);
    await page.reload();
    await expect(greeting(page)).toHaveText("Good evening, welcome back.");
    await expect(nextLine(page)).toHaveText(`Next up: ${next.title}`);
    await expect(nextLine(page).getByRole("link")).toHaveAttribute("href", next.href);
  });

  test("Studio greets by the time of day", async ({ page }) => {
    await page.clock.setFixedTime(at(21));
    await page.goto("/studio");
    await expect(page.getByRole("heading", { level: 1, name: "Good evening. What should we work on?" })).toBeVisible();
  });
});
