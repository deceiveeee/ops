import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

test("goal tabs keep rapid edits and show the actual cash split after reload", async ({ page }) => {
  await page.goto("/studio/goals");
  await page.getByLabel("What is this money for?").fill("A first home");
  await page.getByLabel("When do you expect to use it?").fill("8");
  await page.getByRole("tab", { name: /Your goal/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Your money/ })).toBeFocused();
  await page.getByLabel("Money available now").fill("12500");
  await page.getByLabel("Keep aside as cash").fill("2500");
  await page.getByLabel("Adding each month").fill("150");
  const canvas = page.getByRole("region", { name: "A plan with room to breathe." });
  await expect(canvas).toContainText("$12,500 available − $2,500 set aside = $10,000 for investments.");
  await expect(canvas).toContainText("$1,800");
  await page.getByRole("tab", { name: /Your limits/ }).click();
  await page.getByLabel("Loss you could live with").fill("15");
  // Of the whole $12,500, cash included: every limit is a share of the whole portfolio.
  await expect(canvas).toContainText("$1,875 loss");
  await page.getByLabel("Anything that limits your choices").fill("Keep the emergency money separate.");
  await expect(page.getByRole("status").filter({ hasText: "Saved in this browser" })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("What is this money for?")).toHaveValue("A first home");
  await expect(page.getByLabel("When do you expect to use it?")).toHaveValue("8");
  await page.getByRole("tab", { name: /Your money/ }).click();
  await expect(page.getByLabel("Money available now")).toHaveValue("12500");
  await expect(page.getByLabel("Keep aside as cash")).toHaveValue("2500");
  await page.getByRole("tab", { name: /Your limits/ }).click();
  await expect(page.getByLabel("Anything that limits your choices")).toHaveValue("Keep the emergency money separate.");
});

test("limits are entered on Goals, checked there, and come back after a reload", async ({ page }) => {
  await page.goto("/studio/goals");
  const canvas = page.getByRole("region", { name: "A plan with room to breathe." });
  await page.getByRole("tab", { name: /Your money/ }).click();
  await page.getByRole("button", { name: "+ Add a bill" }).click();
  await page.getByLabel("What for").fill("Tuition");
  await page.getByLabel("Amount").fill("12000");
  await page.getByLabel("Due").fill("2028-03-01");
  // A new practice portfolio holds all $10,000 as cash until weights are set.
  await expect(canvas).toContainText("Your bills total $12,000. The portfolio holds $10,000 as cash, $2,000 short.");
  await page.getByRole("tab", { name: /Your mix/ }).click();
  await page.getByLabel("Ready target, % of the whole portfolio").fill("20");
  await page.getByLabel("Steady target, % of the whole portfolio").fill("25");
  await page.getByLabel("Grow target, % of the whole portfolio").fill("70");
  await expect(canvas).toContainText("115%");
  await expect(canvas).toContainText("They need to add up to 100%.");
  await page.getByLabel("Grow target, % of the whole portfolio").fill("55");
  await expect(canvas).not.toContainText("They need to add up to 100%.");
  await page.getByLabel("Grow lowest, % of the whole portfolio").fill("60");
  await expect(canvas).toContainText("Grow: the target is outside its range.");
  await page.getByLabel("Cap for one company").fill("5");
  await page.getByRole("tab", { name: /Your limits/ }).click();
  await expect(canvas).toContainText("Your loss budget: the loss you could live with");
  await expect(canvas).toContainText("$2,000 loss");
  await page.getByLabel("Loss you could afford").fill("15");
  await expect(canvas).toContainText("Your loss budget: the loss you could afford");
  await expect(canvas).toContainText("$1,500 loss");
  await expect(page.getByRole("status").filter({ hasText: "Saved in this browser" })).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: /Your money/ }).click();
  await expect(page.getByLabel("What for")).toHaveValue("Tuition");
  await expect(page.getByLabel("Due")).toHaveValue("2028-03-01");
  await page.getByRole("tab", { name: /Your mix/ }).click();
  await expect(page.getByLabel("Grow target, % of the whole portfolio")).toHaveValue("55");
  await expect(page.getByLabel("Cap for one company")).toHaveValue("5");
  await page.getByRole("tab", { name: /Your limits/ }).click();
  await expect(page.getByLabel("Loss you could afford")).toHaveValue("15");
});

test("cash set aside beyond the budget has an explicit explanation", async ({ page }) => {
  await page.goto("/studio/goals");
  await page.getByRole("tab", { name: /Your money/ }).click();
  await page.getByLabel("Money available now").fill("1000");
  await page.getByLabel("Keep aside as cash").fill("1200");
  await expect(page.getByRole("region", { name: "A plan with room to breathe." })).toContainText("More cash set aside than you have");
});

test("search and filters find every investment and recover from no matches", async ({ page }) => {
  await page.goto("/studio/research");
  const search = page.getByRole("searchbox", { name: "Find an investment" });
  await search.fill("TSM");
  await expect(page.getByRole("button", { expanded: false }).filter({ hasText: /^TSM/ })).toBeVisible();
  await page.getByRole("button", { name: "Bonds", exact: true }).click();
  await expect(page.getByText("None of the 8 investments in this library matches that search.")).toBeVisible();
  await page.getByRole("button", { name: "Clear the search and filters" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Show all \d+ investments/ }).click();
  await expect(page.getByRole("button", { expanded: false }).filter({ hasText: /^TSM/ })).toBeVisible();
});

async function openInvestment(page: Page, symbol: string) {
  await page.getByRole("searchbox", { name: "Find an investment" }).fill(symbol);
  await page.getByRole("button", { expanded: false }).filter({ hasText: new RegExp(`^${symbol}`) }).click();
}

test("source facts and saved reasoning remain reachable when changing views", async ({ page }) => {
  await page.goto("/studio/research");
  await openInvestment(page, "TSM");
  await page.getByRole("button", { name: "Holdings and sources", exact: true }).click();
  const article = page.getByRole("article", { name: "TSM research" });
  await expect(article).toContainText("Incorporated in");
  await expect(article).toContainText("Taiwan");
  await expect(article.getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
  await page.getByRole("button", { name: "Your record", exact: true }).click();
  await page.getByLabel("Why it belongs").fill("I want to understand where the business earns its money.");
  await page.getByRole("button", { name: "Facts and sources", exact: true }).click();
  await page.getByRole("button", { name: "Your record", exact: true }).click();
  await expect(page.getByLabel("Why it belongs")).toHaveValue("I want to understand where the business earns its money.");
  await page.getByRole("button", { name: "← All investments", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Find an investment" })).toBeFocused();
  await expect(page.getByRole("searchbox", { name: "Find an investment" })).toHaveValue("TSM");
});

test("capture the working pages at all six widths", async ({ page }) => {
  test.skip(process.env.OPS_STUDIO_CAPTURE !== "1", "optional visual evidence capture");
  test.setTimeout(180_000);
  mkdirSync(".agent-shots", { recursive: true });
  const report: object[] = [];
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const capture = async (name: string, width: number) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.agent-shots/studio-${name}-${width}.png`, fullPage: true });
    const measured = await page.evaluate(() => ({
      screens: document.documentElement.scrollHeight / innerHeight,
      sideways: document.documentElement.scrollWidth > innerWidth,
      nested: [...document.querySelectorAll("main *")].filter(element => {
        const style = getComputedStyle(element);
        return /auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 24;
      }).length,
    }));
    report.push({ name, width, ...measured });
    expect(measured.sideways, `${name} at ${width}`).toBe(false);
    expect(measured.nested, `${name} at ${width}`).toBe(0);
    expect(measured.screens, `${name} at ${width}`).toBeLessThanOrEqual(1.5);
  };
  for (const width of [390,768,1024,1280,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/studio/goals");
    await expect(page.getByLabel("What is this money for?")).toBeVisible();
    await capture("goals-purpose", width);
    await page.getByRole("tab", { name: /Your money/ }).click();
    await capture("goals-money", width);
    await page.getByRole("tab", { name: /Your mix/ }).click();
    await capture("goals-mix", width);
    await page.getByRole("tab", { name: /Your limits/ }).click();
    await capture("goals-limits", width);
    await page.goto("/studio/research");
    await expect(page.getByRole("searchbox", { name: "Find an investment" })).toBeVisible();
    await capture("research-library", width);
    await openInvestment(page, "VTI");
    await capture("research-facts", width);
    await page.getByRole("button", { name: "Returns and costs", exact: true }).click();
    await capture("research-returns", width);
    await page.getByRole("button", { name: "Holdings and sources", exact: true }).click();
    await capture("research-sources", width);
    await page.getByRole("button", { name: "Your record", exact: true }).click();
    await capture("research-record", width);
  }
  writeFileSync(".agent-shots/studio-working-report.json", JSON.stringify({ report, errors }, null, 2));
  expect(errors).toEqual([]);
});
