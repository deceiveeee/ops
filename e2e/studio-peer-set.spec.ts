import { expect, test, type Page } from "@playwright/test";
import peerSets from "../lib/studio-project/data/peer-sets.json";

/**
 * Atkore's peers in the Find step, each with the reason it is there.
 *
 * The industry view offered five SEC industries, none of them Atkore's, and
 * Atkore's own industry code would have compared it with battery makers. The
 * roadmap's check for this (R7): the Find step can show why Atkore appears, and
 * every peer has a stated reason. What the reasons say is checked against the
 * filings in lib/studio-project/peer-sets.data.test.ts; this checks that a
 * learner can see them, within the screen budget.
 */

type SetData = {
  id: string;
  label: string;
  subject: { named: { names: string[] }[]; makes: { quote: string }[] };
  peers: { name: string; filing: { periodEnd: string } }[];
  missing: { namedAs: string; note: string }[];
  leftOut: { name: string }[];
};

const found = (peerSets.sets as unknown as SetData[]).find((set) => set.id === "atkore");
if (!found) throw new Error("no Atkore peer set in the data");
const atkore = found;
const INDUSTRY = "/studio/industry";

async function openSet(page: Page) {
  await page.goto(INDUSTRY);
  const chip = page.getByRole("button", { name: atkore.label });
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
}

test("shows why Atkore is in the set, with its own annual report's words one click away", async ({ page }) => {
  await openSet(page);
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { name: "Why Atkore is here" })).toBeVisible();
  await expect(main).toContainText("industry code 3690");
  await expect(main.getByRole("link", { name: /^annual report for the year to \d{1,2} [A-Z][a-z]+ 20\d\d$/ })).toHaveAttribute(
    "href",
    /atkr-20250930\.htm$/,
  );
  await main.getByText("Its own words", { exact: true }).click();
  for (const entry of atkore.subject.makes) await expect(main).toContainText(entry.quote);
  // A chosen set is not a market, so the SEC-industry share figures are not shown beside it.
  await expect(main).not.toContainText("Companies filing");
});

test("gives every company in the set a stated reason and a filing to check it in", async ({ page }) => {
  await openSet(page);
  const items = page.getByRole("region", { name: "In the set, and why" }).getByRole("listitem");

  await expect(items).toHaveCount(atkore.peers.length);
  for (const [index, peer] of atkore.peers.entries()) {
    const item = items.nth(index);
    await expect(item).toContainText(peer.name);
    await expect(item).toContainText(/Named by Atkore in|Found by searching annual reports for/);
    await expect(item.getByRole("link", { name: `${peer.name}'s annual report for ${peer.filing.periodEnd.slice(0, 4)}` })).toHaveAttribute(
      "href",
      /^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\//,
    );
  }
});

test("names the competitors Atkore lists that no SEC filing covers, and why each is missing", async ({ page }) => {
  await openSet(page);
  const main = page.getByRole("main");
  const named = new Set(atkore.subject.named.flatMap((group) => group.names)).size;

  await expect(main).toContainText("Named by Atkore, and missing.");
  await expect(main).toContainText(`${atkore.missing.length} of the ${named} competitors Atkore names file no annual report with the SEC`);
  for (const entry of atkore.missing) await expect(main).toContainText(entry.namedAs);
  await main.getByText("Why each is missing", { exact: true }).click();
  for (const entry of atkore.missing) await expect(main).toContainText(entry.note);
});

test("shows who the searches found, and why each was left out", async ({ page }) => {
  await openSet(page);
  await page.getByText(`Found by the same searches, and left out (${atkore.leftOut.length})`).click();

  for (const entry of atkore.leftOut) {
    await expect(page.getByRole("main").getByRole("listitem").filter({ hasText: entry.name })).toContainText("found by");
  }
});

test("opens on the set from a link, which is where Investigate's note sends a learner", async ({ page }) => {
  await page.goto(`${INDUSTRY}?set=atkore`);

  await expect(page.getByRole("button", { name: atkore.label })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Why Atkore is here" })).toBeVisible();
});

test("keeps the industry view, and Atkore's set, within a screen and a half at 1440", async ({ page }) => {
  // The first version of the set ran to 2.47 screens, and its chip pushed the industry view to 1.51.
  await page.setViewportSize({ width: 1440, height: 900 });
  const screens = () => page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);

  await page.goto(INDUSTRY);
  const chip = page.getByRole("button", { name: atkore.label });
  await expect(chip).toBeVisible();
  expect(await screens(), "the industry view").toBeLessThanOrEqual(1.5);

  await chip.click();
  await expect(page.getByRole("heading", { name: "Why Atkore is here" })).toBeVisible();
  expect(await screens(), "Atkore's set").toBeLessThanOrEqual(1.5);
});
