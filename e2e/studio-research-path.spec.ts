import { expect, test, type Page } from "@playwright/test";
import { storedProjects } from "./project-store";

/**
 * Research as one path: where to start, where you are, and what comes next.
 *
 * Research had grown seven pages linked as equals, and a learner met them with
 * nothing to say which came first, which needed a company, or what followed
 * the one in front of them. These pin the three things that fixed it: one
 * place to start, a step bar on every page of the path saying where you are
 * and what is next, and no page that sends a learner away without saying
 * where to go instead.
 */

const STEPS = [
  { path: "/studio/industry", title: "See who is in an industry" },
  { path: "/studio/pool", title: "See where the money is made" },
  { path: "/studio/investigate", title: "Choose a company and check its numbers" },
  { path: "/studio/filings", title: null },
  { path: "/studio/map", title: "Map who it deals with" },
  { path: "/studio/competition", title: "Test its competition" },
  { path: "/studio/value", title: "Find where its value comes from" },
  { path: "/studio/decide", title: "Decide: own it or turn it down" },
];

const bar = (page: Page) => page.getByRole("navigation", { name: /Research steps/ });

test("the Research page lays the company path out in order, with one place to start", async ({ page }) => {
  await page.goto("/studio/research");
  const path = page.getByRole("region", { name: "Research one company, step by step" });
  const steps = path.getByRole("listitem");
  await expect(steps).toHaveCount(8);
  await expect(steps.nth(0)).toContainText("See who is in an industry");
  await expect(steps.nth(2)).toContainText("Choose a company and check its numbers");
  await expect(steps.nth(7)).toContainText("Decide: own it or turn it down");
  // The steps that need a company say so before a learner opens them.
  await expect(steps.nth(4)).toContainText("After step 3");

  await path.getByRole("link", { name: "Start with step 1" }).click();
  await expect(page).toHaveURL(/\/studio\/industry$/);
});

test("every page on the path says which step it is and what comes next", async ({ page }) => {
  for (const [index, step] of STEPS.entries()) {
    await page.goto(step.path);
    const current = bar(page).locator('[aria-current="step"]');
    await expect(current, step.path).toHaveAttribute("aria-label", new RegExp(`^Step ${index + 1}:`));
    if (step.title) await expect(page.getByRole("heading", { level: 1, name: step.title })).toBeVisible();
    // One thing to press, always.
    await expect(bar(page).getByRole("link", { name: /^(Next: |First, choose a company|Record your decision below)/ })).toBeVisible();
  }
});

test("a step that needs a company, reached without one, sends you to where one is chosen", async ({ page }) => {
  await page.goto("/studio/map");
  await expect(page.getByRole("main").getByText("This step needs a company first.")).toBeVisible();
  await bar(page).getByRole("link", { name: /First, choose a company/ }).click();
  await expect(page).toHaveURL(/\/studio\/investigate$/);
  await expect(page.getByRole("heading", { level: 1, name: "Choose a company and check its numbers" })).toBeVisible();
});

test("once a company's numbers are in, Research says where to carry on", async ({ page }) => {
  await page.goto("/studio/investigate");
  await page.getByPlaceholder("Its ticker symbol").fill("Nordic Pulp");
  const figures = page.getByPlaceholder("0", { exact: true });
  const values = ["5200", "780", "690", "165", "900", "2600", "180"];
  for (let index = 0; index < values.length; index += 1) await figures.nth(index).fill(values[index]);
  await figures.nth(6).blur();
  await expect
    .poll(async () => Object.keys((await storedProjects(page))[0]?.investigations?.[0]?.figures ?? {}).length, { timeout: 15_000 })
    .toBe(7);

  // Step 3 is ticked in the bar, and the next step is the report.
  await expect(bar(page).getByRole("link", { name: /^Step 3: .*Done$/ })).toBeVisible();
  await expect(bar(page).getByRole("link", { name: /Next: Read its annual report/ })).toBeVisible();

  await page.goto("/studio/research");
  const path = page.getByRole("region", { name: "Research one company, step by step" });
  await expect(path).toContainText("You are researching Nordic Pulp.");
  await expect(path.getByRole("link", { name: "Continue: step 4, Read its annual report" })).toBeVisible();
  await expect(path.getByRole("listitem").nth(2)).toContainText("7 of 7 figures");
});

test("the parts of Portfolio and Review each end on where to go next", async ({ page }) => {
  await page.goto("/studio/research");
  await page.getByRole("searchbox", { name: "Find an investment" }).fill("VTI");
  const card = page.getByRole("button", { expanded: false }).filter({ hasText: /^VTI/ }).first().locator("xpath=..");
  await card.getByRole("button", { name: "Add to portfolio" }).click();
  await expect(card.getByRole("button", { name: "Remove", exact: true })).toBeVisible();

  await page.goto("/studio/portfolio");
  await page.getByRole("link", { name: "Next: Check the risk and the cost" }).click();
  await expect(page).toHaveURL(/\/studio\/portfolio\/risk$/);
  await page.getByRole("link", { name: "Next: Work out what to buy" }).click();
  await expect(page).toHaveURL(/\/studio\/portfolio\/buying$/);
  await page.getByRole("link", { name: "Next: Write the rules and keep a copy" }).click();
  await expect(page).toHaveURL(/\/studio\/review$/);
  // The last page says it is the last, where the last thing to do is.
  await expect(page.getByRole("main")).toContainText("That is the whole plan. Keep a copy now");
});
