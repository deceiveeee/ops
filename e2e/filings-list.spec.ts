import { expect, test } from "@playwright/test";

/**
 * What the reader opens on.
 *
 * Twelve equal rows told a beginner that any filing was as good a place to
 * start as another, which is not true: the business description, the risk
 * factors and the audited statements are in the annual report, and it is the
 * document Studio's own investigation asks for figures from. Someone opening
 * the most recent quarterly instead finds an update to a story they have not
 * read. It was also three screens on a phone.
 *
 * These tests hit EDGAR, because the structure being checked is built from a
 * real company's filing history and a fixture would only prove the fixture.
 * They skip rather than fail where the reader is not connected — the SEC
 * requires a contact address, so a checkout without `OPS_SEC_CONTACT` has no
 * filings to arrange, which is a missing setting rather than a broken page.
 */

const APPLE = "/filings?ticker=AAPL";

test.describe("the filing list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APPLE);
    const disconnected = await page.getByText("This reader is not connected yet").isVisible();
    test.skip(disconnected, "OPS_SEC_CONTACT is not set, so EDGAR was not queried");
  });

  test("opens on the annual report and says why that one", async ({ page }) => {
    const start = page.getByText(/^Start here · (10-K|20-F|40-F)$/);
    await expect(start).toBeVisible();
    await expect(page.getByText(/^The annual report, filed \d{4}-\d{2}-\d{2}$/)).toBeVisible();
    // Named, not merely first. A learner has to know what is in the document
    // before opening several hundred pages of it.
    await expect(
      page.getByText(/What the business says it does, the risks management is required to admit/),
    ).toBeVisible();
  });

  test("keeps every other filing, one disclosure away", async ({ page }) => {
    // Disclosed rather than dropped: comparing two years, or reading what
    // changed last quarter, is real work — the page just should not open on it.
    const more = page.getByRole("group").filter({ hasText: "Earlier and quarterly filings" });
    await expect(more).toBeVisible();

    // Located by element rather than by role: a closed `details` takes its
    // contents out of the accessibility tree entirely, so a role query would
    // find nothing and could not tell "hidden" from "absent" — which is the
    // distinction this test exists to make.
    const rows = more.locator("li");
    await expect(rows).toHaveCount(11);
    // Present, and not on screen. That is the whole reason the page fits.
    await expect(rows.first()).toBeHidden();

    await more.getByText(/Earlier and quarterly filings/).click();
    await expect(rows.first()).toBeVisible();
  });

  test("points the annual card at this reader, not at EDGAR", async ({ page }) => {
    /*
     * The target is asserted rather than followed. Opening a filing fetches the
     * whole document from the SEC and sections it — Apple's 10-K is megabytes —
     * so a click here spends a minute proving something already covered: that
     * the reader renders. What this change actually introduced is which
     * document the card points at, and that is what is checked.
     */
    const card = page.getByText(/^The annual report, filed/).locator("xpath=ancestor::a[1]");
    const href = await card.getAttribute("href");
    // The sectioned reader inside OPS, carrying the document and the ticker.
    expect(href).toMatch(/^\/filings\/\d+\/[\d-]+\?doc=[^&]+&ticker=AAPL$/);
  });
});
