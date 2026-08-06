import { test, expect } from "@playwright/test";

async function stabilize(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

test.describe("Onboarding flow", () => {
  test("guest completes the full survey and sees a recommendation", async ({ page }) => {
    await page.goto("/start");
    await stabilize(page);
    await expect(
      page.getByRole("heading", { name: "Let's find your starting point." }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Begin" }).click();
    await expect(
      page.getByRole("heading", { name: "What brought you to OPS?" }),
    ).toBeVisible();

    await page.getByRole("radio", { name: "Learn to analyze companies" }).click();
    await expect(
      page.getByRole("heading", { name: "Where are you starting from?" }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "I know some basic investing terms" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Which best describes your current investing access?",
      }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "I use a paper-trading or simulation account" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "What would meaningful progress look like for you?",
      }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "Evaluate whether a company is attractive" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "How confident do you currently feel making an investment decision?",
      }),
    ).toBeVisible();

    await page.getByRole("radio", { name: "Somewhat confident" }).click();
    await expect(
      page.getByRole("heading", { name: "Which best describes you?" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Skip" }).click();

    await expect(page.getByText("Your OPS starting point")).toBeVisible();
    await expect(page.getByText("Goal")).toBeVisible();
    await expect(page.getByText("Recommended starting point")).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Finance Foundations"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Begin my first lesson" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore all courses" }),
    ).toHaveAttribute("href", "/courses");
  });

  test("guest answer persists across reload; resumes at first unanswered", async ({ page }) => {
    await page.goto("/start");
    await stabilize(page);
    await page.getByRole("button", { name: "Begin" }).click();
    await page
      .getByRole("radio", { name: "Understand how investing works" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Where are you starting from?" }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Where are you starting from?" }),
    ).toBeVisible();
  });

  test("retake flag forces restart at Q1", async ({ page }) => {
    await page.goto("/start");
    await stabilize(page);
    await page.getByRole("button", { name: "Begin" }).click();
    await page
      .getByRole("radio", { name: "Understand how investing works" })
      .click();

    await page.goto("/start?retake=1");

    await expect(
      page.getByRole("heading", { name: "What brought you to OPS?" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Begin" })).toBeHidden();
  });
});
