import { expect, test } from "@playwright/test";

/**
 * Company reports moved inside Studio on 2026-09-10.
 *
 * None of these checks needs the network. A redirect is answered before any page
 * renders, and the search page draws its frame and form without asking the SEC
 * for anything.
 */

test("old company-report links land on the same place inside Studio", async ({ request }) => {
  const list = await request.get("/filings?ticker=NFLX", { maxRedirects: 0 });
  expect(list.status()).toBe(308);
  expect(list.headers()["location"]).toMatch(/\/studio\/filings\?ticker=NFLX$/);

  const report = await request.get(
    "/filings/0001666138/0001628280-25-054049?doc=atkr-20250930.htm&ticker=ATKR",
    { maxRedirects: 0 },
  );
  expect(report.status()).toBe(308);
  expect(report.headers()["location"]).toMatch(
    /\/studio\/filings\/0001666138\/0001628280-25-054049\?doc=atkr-20250930\.htm&ticker=ATKR$/,
  );
});

test("company reports open inside the workspace, under Research", async ({ page }) => {
  await page.goto("/studio/filings");
  await expect(page.getByRole("heading", { level: 1, name: "Read what a company actually filed" })).toBeVisible();
  await expect(page.getByLabel("Ticker symbol")).toBeVisible();

  // A page inside a section marks that section "true"; "page" is for the section's own page.
  const sections = page.getByRole("navigation", { name: "Studio sections" }).first();
  await expect(sections.getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "true");

  // Company reports sits inside Studio, so both match the path. Only one may be current.
  const main = page.getByRole("navigation", { name: "Main navigation" });
  await expect(main.getByRole("link", { name: "Company reports" })).toHaveAttribute("aria-current", "page");
  await expect(main.getByRole("link", { name: "Studio", exact: true })).not.toHaveAttribute("aria-current", "page");
});

test("Investigate links to the reports it needs, and going there is not leaving Studio", async ({ page }) => {
  await page.goto("/studio/investigate");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Typing starts a save that waits for typing to settle. Clicking during that wait
  // is exactly when a "leave this page?" warning would fire if Company reports
  // counted as outside the workspace.
  let warned = false;
  page.on("dialog", (dialog) => {
    warned = true;
    void dialog.dismiss();
  });
  await page.getByPlaceholder("Its ticker, such as ATKR").fill("Atkore");
  await page.getByRole("main").getByRole("link", { name: "Company reports" }).click();

  await expect(page).toHaveURL(/\/studio\/filings$/);
  expect(warned).toBe(false);
});
