import { expect, test, type Page } from "@playwright/test";

/**
 * Mission 10’s whole point is that an active slice cannot be talked open. These tests
 * exist to keep that true: that the switchboard names every unmet condition
 * rather than the first, that a fully passive decision is a complete outcome,
 * and that the saved decision survives a reload into the plan.
 */

const MISSION_10 = "/lessons/if-8-1-choose-passive-or-prove-an-edge";

/** Plain action buttons. */
async function pick(page: Page, name: string | RegExp) {
  await page.getByRole("button", { name }).first().click();
}

/** Select an option and confirm it took, rather than clicking into hydration. */
async function select(page: Page, name: string | RegExp) {
  const option = page.getByRole("button", { name }).first();
  await expect(async () => {
    await option.click();
    await expect(option).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

async function advance(page: Page, next: RegExp, arrivedHeading: string) {
  await page.getByRole("button", { name: next }).click();
  await expect(page.getByRole("heading", { name: arrivedHeading })).toBeVisible();
}

/** A learner who finished missions 7, 8 and 9, as mission 10 requires. */
async function seedPriorMissions(page: Page, annualDrag = 0.012) {
  await page.addInitScript((drag) => {
    const stamp = "2026-08-14T00:00:00.000Z";
    localStorage.setItem(
      "ops-if-valuation-range-v1",
      JSON.stringify({ claim: "Seeded", updatedAt: stamp }),
    );
    localStorage.setItem(
      "ops-if-friction-budget-v1",
      JSON.stringify({ estimatedAnnualDrag: drag, hurdleRule: "Seeded", updatedAt: stamp }),
    );
    localStorage.setItem(
      "ops-if-evidence-checklist-v1",
      JSON.stringify({
        testDesign: "Portfolio study — my claim is about a characteristic",
        holdoutRule: "Both a different period and a different universe",
        samplingRule: "Form the sample from what existed at the start, failures included",
        updatedAt: stamp,
      }),
    );
  }, annualDrag);
}

/** Stages 1-3 are the same on every path. */
async function walkToLicence(page: Page) {
  await select(page, /Passive is the right default/);
  await advance(page, /Test a proposal/, "A strategy can beat the market and still lose.");

  await select(page, /It depends on what its risk demanded/);
  await advance(page, /Judge a streak/, "Four good years is what randomness looks like.");

  await select(page, /Any of the four, at about 25% each/);
  await advance(page, /Build the licence/, "Take one claim apart.");
}

/**
 * The licence stage shows one question at a time, so a test cannot fill eleven
 * fields in one pass — it answers, presses Next, and repeats. That mirrors what
 * the learner does, which is the point of the redesign.
 */
const EDGE_ANSWERS: [string, string][] = [
  ["edge-pocket", "Small companies in the year after they are spun off from a parent."],
  ["edge-who", "Index funds must sell the stub because it is not in their index."],
  ["edge-mechanism", "Forced selling ends within months and coverage resumes in a year."],
  ["edge-capability", "Spin-offs are announced ahead, and I can hold for a full year."],
  ["edge-claim", "Spin-off stubs beat the world index by four points in year one."],
  ["edge-disconfirming", "Two years of stubs failing to beat the index after my costs."],
  ["edge-gross", "4"],
  ["edge-allocation", "10"],
  ["edge-durability", "More funds copy it each year, so the discount narrows."],
  ["edge-thesis-break", "Index rules change and the forced selling stops happening."],
  ["edge-review", "2027-08-14"],
];

async function answerEdgeQuestions(
  page: Page,
  overrides: Record<string, string> = {},
) {
  for (const [id, value] of EDGE_ANSWERS) {
    const field = page.locator(`#${id}`);
    await expect(field).toBeVisible();
    await field.fill(overrides[id] ?? value);
    const next = page.getByRole("button", { name: /Next question|See the verdict/ });
    await expect(next).toBeEnabled();
    await next.click();
  }
}

async function clearTransferStage(page: Page) {
  await select(page, "Leave it disabled");
  await page
    .locator("#transfer-reason")
    .fill("A named mispricing with a correction mechanism, and a net edge after her fee.");
  await pick(page, "Continue");
  await advance(page, /Write your decision/, "Set the architecture you will actually run.");
}

test("the model stage charges risk and friction until a market-beating strategy loses", async ({
  page,
}) => {
  await page.goto(MISSION_10);
  await select(page, /Passive is the right default/);
  await advance(page, /Test a proposal/, "A strategy can beat the market and still lose.");
  await select(page, /It depends on what its risk demanded/);

  // 11% gross, less the source's 1% costs, against a CAPM required 10.2%.
  await expect(page.getByText("10.2%").first()).toBeVisible();
  await expect(page.getByText("-0.2%").first()).toBeVisible();
  await expect(page.getByText(/beat the market and destroyed value/)).toBeVisible();
});

test("no single impressive number unlocks the slice", async ({ page }) => {
  // Same budget as the other two tests that walk to the licence and answer all
  // eleven edge questions. The default 30s covers that work on an idle machine
  // and does not when the suite runs five browsers against one dev server, so
  // this failed intermittently -- and reported wherever it happened to be, in a
  // walk helper or mid-questionnaire, which read as a different bug each run.
  test.setTimeout(90_000);
  await page.goto(MISSION_10);
  await walkToLicence(page);

  // A large claimed edge and nothing else behind it: skip straight past the
  // qualitative questions, answer only the number, then read the verdict.
  // A huge claimed edge, and a token answer to everything else. Each token
  // advances the step — the lesson will not let you skip a question — but none
  // of them is long enough to be an answer, so no condition is actually met.
  for (const [id] of EDGE_ANSWERS) {
    const field = page.locator(`#${id}`);
    await expect(field).toBeVisible();
    if (id === "edge-gross") await field.fill("40");
    else if (id === "edge-allocation") await field.fill("1");
    else if (id === "edge-review") await field.fill("2027-08-14");
    else await field.fill("no");
    await page.getByRole("button", { name: /Next question|See the verdict/ }).click();
  }

  const status = page.getByText(/Slice disabled ·/);
  await expect(status).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with the slice licensed/ })).toBeDisabled();

  // Every unmet condition is named, not just the first. A 40% claimed edge
  // clears the net-edge test on its own and still licenses nothing.
  for (const label of [
    "Specific mispricing",
    "Correction mechanism",
    "Your capability",
    "A claim you could disprove",
    "Evidence design",
    "Your friction",
    "Valuation range",
    "Thesis break",
  ]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
});

test("an active slice licenses only once every condition is met", async ({ page }) => {
  test.setTimeout(90_000);
  await seedPriorMissions(page);
  await page.goto(MISSION_10);
  await walkToLicence(page);

  await answerEdgeQuestions(page);

  // 4% gross less the seeded 1.2% friction.
  await expect(page.getByText("2.80%").first()).toBeVisible();
  await expect(page.getByText(/Every condition met/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Continue with the slice licensed/ }),
  ).toBeEnabled();
});

test("a slice breaching mission 5’s loss budget stays disabled", async ({ page }) => {
  test.setTimeout(90_000);
  await seedPriorMissions(page);
  await page.goto(MISSION_10);
  await walkToLicence(page);

  // 20% of the portfolio at the 40% stress assumption is 8 points of loss,
  // against a 6-point budget — and it also breaches the 15% ceiling.
  await answerEdgeQuestions(page, { "edge-allocation": "20" });

  await expect(page.getByText("Loss budget", { exact: true })).toBeVisible();
  await expect(page.getByText("Position ceiling", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Continue with the slice licensed/ }),
  ).toBeDisabled();
});

/**
 * Open every artifact on the plan, once React is actually listening.
 *
 * Playwright's actionability check sees a rendered button and clicks it, which
 * on a freshly navigated page can land before hydration has attached the
 * handler. The click is swallowed, every later assertion reads a still-collapsed
 * record, and because it is a race it fails only sometimes — it survived four
 * five-worker runs and failed at two workers, where hydration has less headroom.
 *
 * The label only flips to "Collapse all" once the state genuinely changed, so
 * that is the signal worth retrying against.
 */
async function expandPlan(page: Page) {
  await expect(async () => {
    const expand = page.getByRole("button", { name: "Expand all" });
    if (await expand.count()) await expand.click();
    // Both halves matter. The plan gates its first paint on the Workbench
    // loading, so a page still showing the skeleton has no `details` at all --
    // and "none are closed" is vacuously true of nothing, which let this return
    // against an empty page, click nothing, and leave every assertion after it
    // reading a collapsed record.
    expect(await page.locator("details").count()).toBeGreaterThan(0);
    expect(await page.locator("details:not([open])").count()).toBe(0);
  }).toPass({ timeout: 15_000 });
}

test("a fully passive decision is a complete outcome that reaches the plan", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto(MISSION_10);
  await walkToLicence(page);

  // Passive is a legitimate exit from the licence stage, not a failure state.
  await pick(page, "Continue with a passive core only");
  await advance(page, /Face a new proposal/, "A proposal you have not seen before.");
  await clearTransferStage(page);

  await select(page, /Passive core only/);
  await page.locator("#core-exposure").fill("A single total world equity index fund.");
  await page.locator("#core-benchmark").fill("The total world equity index, net of fees.");
  await page.locator("#passive-review").fill("2027-08-14");
  await pick(page, "Save the architecture decision");
  await expect(page.getByRole("button", { name: /Architecture saved/ })).toBeVisible();
  await expect(page.getByText("6 of 6 stages complete", { exact: false })).toBeVisible();

  await page.reload();
  await expect(page.getByText("6 of 6 stages complete", { exact: false })).toBeVisible();

  await page.goto("/plan");
  await expandPlan(page);
  await expect(page.getByText("Passive core only", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("A single total world equity index fund.")).toBeVisible();
  await expect(page.getByText("30 June 2026", { exact: true }).first()).toBeVisible();
  // A passive decision records no active slice, so those rows must not appear at all.
  await expect(page.getByText("Mispricing", { exact: true })).toHaveCount(0);
});
