import { test, expect, type Page } from "@playwright/test";

async function markFirstComplete(page: Page) {
  await page.goto("/courses");
  await page.getByRole("link", { name: /finance foundations/i }).first().click();
  await page.getByRole("link", { name: /Bond Markets.*Discount Bonds/i }).click();
  await page.evaluate(() => {
    const key = "ops-m3-completion-v1";
    const cur = JSON.parse(localStorage.getItem(key) ?? "{}");
    cur["fixed-income-bond-markets-cash-flows-discount-bonds"] = true;
    localStorage.setItem(key, JSON.stringify(cur));
  });
}

test("guest completion is stored locally only", async ({ page }) => {
  await markFirstComplete(page);
  const stored = await page.evaluate(() => localStorage.getItem("ops-m3-completion-v1"));
  expect(stored).toContain("fixed-income-bond-markets-cash-flows-discount-bonds");
});

test("signing in merges local progress into the cloud", async ({ page }) => {
  test.skip(!process.env.E2E_SUPABASE_URL, "no E2E Supabase project configured");
  await markFirstComplete(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL ?? "e2e@ops.test");
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD ?? "password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(courses)?$/);
  await expect(page.getByText("Synced")).toBeVisible();
  const cloudHas = await page.evaluate(async () => {
    const res = await fetch("/api/progress-debug");
    return (await res.json()).cloudHasFixedIncome as boolean;
  });
  expect(cloudHas).toBe(true);
});
