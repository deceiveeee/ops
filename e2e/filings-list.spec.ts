import { expect, test } from "@playwright/test";

/**
 * What the reader opens on.
 *
 * Equal rows told a beginner that any filing was as good a place to start as
 * another, which is not true: the business description, the risk factors and
 * the audited statements are in the annual report, and it is the document
 * Studio's own investigation asks for figures from. Someone opening the most
 * recent quarterly instead finds an update to a story they have not read. It
 * was also three screens on a phone.
 *
 * The filing history is Atkore’s own, as EDGAR lists it: the eight most recent
 * annual and quarterly reports, served from `e2e/fixtures/edgar` so a run
 * cannot depend on whether sec.gov answered that minute. Real entries rather
 * than invented ones, because the shape being checked is a real filer’s. Only
 * the annual report’s own document is stored, so the card’s target is asserted
 * rather than followed.
 */

const ATKORE = "/studio/filings?ticker=ATKR";

test.describe("the filing list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ATKORE);
    const disconnected = await page.getByText("Reports cannot be fetched yet").isVisible();
    test.skip(disconnected, "OPS_SEC_CONTACT is not set, so EDGAR was not queried");
  });

  test("opens on the annual report and says why that one", async ({ page }) => {
    await expect(page.getByText("Start here", { exact: true })).toBeVisible();
    await expect(page.getByText(/^Annual report \((10-K|20-F|40-F)\), filed \d{4}-\d{2}-\d{2}$/)).toBeVisible();
    // Named, not merely first. A learner has to know what is in the document
    // before opening several hundred pages of it.
    await expect(
      page.getByText(/What the business says it does, the risks management is required to admit/),
    ).toBeVisible();
  });

  test("keeps every other report, one disclosure away", async ({ page }) => {
    // Disclosed rather than dropped: comparing two years, or reading what
    // changed last quarter, is real work — the page just should not open on it.
    const more = page.getByRole("group").filter({ hasText: "Earlier and quarterly reports" });
    await expect(more).toBeVisible();

    // Located by element rather than by role: a closed `details` takes its
    // contents out of the accessibility tree entirely, so a role query would
    // find nothing and could not tell "hidden" from "absent" — which is the
    // distinction this test exists to make.
    const rows = more.locator("li");
    // Every report but the annual one the page opens on.
    await expect(rows).toHaveCount(7);
    // Present, and not on screen. That is the whole reason the page fits.
    await expect(rows.first()).toBeHidden();

    await more.getByText(/Earlier and quarterly reports/).click();
    await expect(rows.first()).toBeVisible();
  });

  test("points the annual card at this reader, not at EDGAR", async ({ page }) => {
    /*
     * The target is asserted rather than followed. Opening a filing fetches the
     * whole document and sections it — a 10-K is megabytes —
     * so a click here spends a minute proving something already covered: that
     * the reader renders. What this change actually introduced is which
     * document the card points at, and that is what is checked.
     */
    const card = page.getByText(/^Annual report \(.*\), filed/).locator("xpath=ancestor::a[1]");
    const href = await card.getAttribute("href");
    // The sectioned reader inside Studio, carrying the document and the ticker.
    expect(href).toMatch(/^\/studio\/filings\/\d+\/[\d-]+\?doc=[^&]+&ticker=ATKR$/);
  });
});
