import { expect, test } from "@playwright/test";

/**
 * Research's search reaches any company at the SEC, not only the library.
 *
 * The companies come from the EDGAR fixture's ticker file (Atkore and the
 * companies its peer work needed), so the search runs on the server exactly as
 * it does live without sending the SEC a request. Investigate's figure lookup is
 * answered here, as `studio-prefill.spec.ts` answers it, because no company-facts
 * file is kept as a fixture.
 */

const ROUTE = "**/api/studio/company-figures*";

/** Enough of the live route's answer for Atkore to fill a box and name its source. */
const ATKORE = {
  ticker: "ATKR",
  cik: "0001666138",
  entityName: "Atkore Inc.",
  sic: "3690",
  sicDescription: "Miscellaneous Electrical Machinery, Equipment & Supplies",
  periodEnd: "2025-09-30",
  filing: { accession: "0001628280-25-054049", form: "10-K", filed: "2025-11-26", primaryDocument: "atkr-20250930.htm" },
  supplied: [
    {
      key: "revenue",
      value: 2_850_378_000,
      concepts: ["RevenueFromContractWithCustomerExcludingAssessedTax"],
      addedUp: null,
      periodStart: null,
      periodEnd: "2025-09-30",
      accession: "0001628280-25-054049",
      form: "10-K",
      filed: "2025-11-26",
    },
  ],
  missing: [],
};

test("finds a company outside the library by name, and says what it can be used for", async ({ page }) => {
  await page.goto("/studio/research");
  await page.getByRole("searchbox", { name: "Find an investment or a company" }).fill("atkore");

  await expect(page.getByText("None of the 8 investments in this library matches that search.")).toBeVisible();
  const others = page.getByRole("region", { name: "Other companies" });
  await expect(others).toContainText("They cannot go in your portfolio yet.");
  await expect(others.getByRole("status")).toHaveText("1 company at the SEC");
  await expect(others.getByRole("listitem")).toHaveCount(1);
  await expect(others.getByRole("listitem")).toContainText("ATKR");
  await expect(others.getByRole("listitem")).toContainText("Atkore Inc.");
  await expect(others.getByRole("link", { name: "Investigate Atkore Inc." })).toHaveAttribute("href", "/studio/investigate?ticker=ATKR");

  await others.getByRole("link", { name: "Read Atkore Inc.'s reports" }).click();
  await expect(page).toHaveURL(/\/studio\/filings\?ticker=ATKR$/);
  await expect(page.getByRole("heading", { name: "Atkore Inc." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Annual report \(10-K\)/ }).first()).toBeVisible();
});

test("says so when no company matches, and searches nothing for a single letter", async ({ page }) => {
  await page.goto("/studio/research");
  const search = page.getByRole("searchbox", { name: "Find an investment or a company" });
  await search.fill("zzzz");
  await expect(page.getByRole("region", { name: "Other companies" }).getByRole("status")).toHaveText("No other company at the SEC matches “zzzz”.");

  let asked = false;
  await page.route("**/api/studio/company-search*", (route) => {
    asked = true;
    return route.continue();
  });
  await search.fill("a");
  await expect(page.getByRole("region", { name: "Other companies" })).toHaveCount(0);
  await page.waitForTimeout(600);
  expect(asked).toBe(false);
});

test("Investigate looks the company up, and reopens it rather than starting another", async ({ page }) => {
  await page.route(ROUTE, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ATKORE) }));
  await page.goto("/studio/research");
  await page.getByRole("searchbox", { name: "Find an investment or a company" }).fill("ATKR");
  await page.getByRole("region", { name: "Other companies" }).getByRole("link", { name: "Investigate Atkore Inc." }).click();

  await expect(page.getByPlaceholder("Its ticker symbol")).toHaveValue("Atkore Inc.");
  const saved = page.getByRole("navigation", { name: "Companies you have looked at" });
  await expect(saved).toContainText("Atkore Inc.");
  await expect(page.getByRole("status").filter({ hasText: "Saved in this browser" })).toBeVisible();

  // The ticker is carried out once: it leaves the address.
  await expect(page).toHaveURL(/\/studio\/investigate$/);

  await page.goto("/studio/investigate?ticker=atkr");
  await expect(page.getByPlaceholder("Its ticker symbol")).toHaveValue("Atkore Inc.");
  await expect(saved.getByRole("button", { name: /^Delete / })).toHaveCount(1);

  // Deleted, it stays deleted after a reload: the address no longer asks for it.
  page.once("dialog", (dialog) => void dialog.accept());
  await saved.getByRole("button", { name: "Delete Atkore Inc." }).click();
  await expect(saved.getByRole("button", { name: /^Delete / })).toHaveCount(0);
  await page.reload();
  await expect(page.getByPlaceholder("Its ticker symbol")).toBeVisible();
  await expect(page.getByPlaceholder("Its ticker symbol")).toHaveValue("");
  await expect(page.getByRole("navigation", { name: "Companies you have looked at" }).getByRole("button", { name: /^Delete / })).toHaveCount(0);
});

test("with the library's own matches listed, the companies wait behind one button", async ({ page }) => {
  // "Vanguard" names three of the library's funds; the answer names two companies.
  await page.route("**/api/studio/company-search*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ companies: [
        { cik: "0000102909", ticker: "VGRD", name: "Vanguard Example Holdings" },
        { cik: "0000102910", ticker: "VGX", name: "Vanguard Example Trust" },
      ] }),
    }),
  );
  await page.goto("/studio/research");
  await page.getByRole("searchbox", { name: "Find an investment or a company" }).fill("vanguard");
  const show = page.getByRole("button", { name: "Show 2 companies at the SEC" });
  await expect(show).toBeVisible();
  await expect(page.getByRole("region", { name: "Other companies" })).toHaveCount(0);
  await show.click();
  await expect(page.getByRole("region", { name: "Other companies" }).getByRole("listitem")).toHaveCount(2);
});
