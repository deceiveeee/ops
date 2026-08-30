import { expect, test, type Page } from "@playwright/test";
import {
  PORTFOLIO_WORKBENCH_STORAGE_KEY,
  createEmptyPortfolioWorkbench,
} from "../lib/portfolio-workbench";

const MISSION_5 = "/lessons/if-pb-05-set-allocation-and-risk-limits";

/**
 * Choose the portfolio mode the way the course now asks for it.
 *
 * Mission 5's readiness runway is the only place this choice is offered. The
 * workbench rail used to carry a duplicate segmented toggle and this spec drove
 * that, but it flipped a global setting from every lesson page with nothing on
 * the page confirming the change, so it was removed. The runway's radio is
 * `sr-only` inside its card, so the click goes through the rendered label.
 *
 * Switching remounts the journey — the mode is part of its React key — so the
 * caller lands on whichever stage that mode had restored, not necessarily this
 * one.
 */
async function chooseMode(page: Page, mode: "personal" | "practice") {
  await page
    .locator(`label:has(input[type='radio'][value='${mode}'])`)
    .first()
    .click();
  /*
   * Read the switch back off the rail, not off the radio. Choosing a mode
   * remounts the journey on whichever stage that mode had restored, so the
   * runway — and the radio with it — can leave the page before it can be
   * asserted on. The rail is mounted on every lesson page and names the case.
   */
  if (mode === "practice") await expectPracticeCase(page);
  else await expect(rail(page)).not.toContainText("Practice case");
}

function rail(page: Page) {
  return page
    .getByRole("region", { name: "Build while you learn" })
    .filter({ visible: true });
}

/** The rail names the active case only when it is not the default. */
async function expectPracticeCase(page: Page) {
  await expect(rail(page)).toContainText("Practice case");
}

async function choose(page: Page, text: string | RegExp) {
  await page.getByText(text, { exact: typeof text === "string" }).last().click();
}

async function fillRepair(
  page: Page,
  weights: [number, number, number],
  submit: string,
  rationale?: string,
) {
  await page.getByLabel("Ready weight", { exact: true }).fill(String(weights[0]));
  await page.getByLabel("Steady weight", { exact: true }).fill(String(weights[1]));
  await page.getByLabel("Grow weight", { exact: true }).fill(String(weights[2]));
  if (rationale) {
    await page
      .getByLabel("Explain one trade-off in this repair", { exact: true })
      .fill(rationale);
  }
  await page.getByRole("button", { name: submit }).click();
}

/**
 * Press a stage advance only if the lesson has not advanced on its own. Mission
 * 5 moves to the next stage when a stage saves, so an unconditional click waits
 * forever for a button that has already been replaced by the next scene.
 */
async function advanceIfStillOnStage(page: Page, name: RegExp) {
  const advance = page.getByRole("button", { name });
  if (await advance.count()) {
    await advance.first().click();
  }
}

async function completePracticeReadiness(page: Page) {
  await chooseMode(page, "practice");

  for (const name of [
    "Continue to Goal",
    "Continue to Runway",
    "Continue to Loss",
    "Continue to Access",
    "Continue to Change",
  ]) {
    await page.getByRole("button", { name }).click();
  }
  await choose(page, "Capacity and liquidity changed; willingness may be unchanged");
  await choose(page, /Record the \$12,000 as near-term cash/);
  await page.getByRole("button", { name: "Save readiness route" }).click();
}

async function completePracticeMission(page: Page) {
  await completePracticeReadiness(page);
  // Saving readiness advances the lesson by itself. Pressing the shell advance
  // as well is only correct when it has not already moved, and when it has the
  // button is gone entirely — which is what timed this out.
  await advanceIfStillOnStage(page, /Run the theory preflight/);

  for (const answer of [
    "Their weights, each asset's volatility, and how their returns move together",
    "Reduce some asset-specific risk, while common risks and loss remain",
    "An estimate-based opportunity set—not a personal suitability answer",
    "As estimates that depend on inputs and assumptions",
  ]) {
    await choose(page, answer);
  }
  await page.getByRole("button", { name: "Check the four relationships" }).click();
  await page.getByRole("button", { name: /Watch the policy form/ }).click();

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Reveal next contribution" }).click();
  }
  await page.getByRole("button", { name: "Use the model" }).click();
  await page.getByRole("button", { name: /Repair three faults/ }).click();

  await fillRepair(page, [15, 30, 55], "Lock the weight repair");
  await fillRepair(
    page,
    [30, 30, 40],
    "Lock the liquidity repair",
    "Ready covers the dated cash need; Grow gives up some upside.",
  );
  await fillRepair(
    page,
    [20, 35, 45],
    "Lock the stress repair",
    "Lower Grow brings the supplied stress inside the stated budget.",
  );
  await page.getByRole("button", { name: /Build the policy/ }).click();

  await expect(page.locator("#allocation-portfolio-amount")).toHaveAttribute("readonly", "");
  await expect(page.locator("#allocation-near-term-need")).toHaveAttribute("readonly", "");
  await page
    .getByRole("checkbox", { name: /I understand that the weights and budget/ })
    .check();
  await page.getByRole("button", { name: "Lock this draft for transfer" }).click();
  await page.getByRole("button", { name: /Face a changed mandate/ }).click();

  await fillRepair(
    page,
    [25, 35, 40],
    "Lock the independent repair",
    "Ready funds the dated payment; Grow is lower under the stated stress.",
  );
  await choose(page, "Capacity and liquidity changed; willingness may be unchanged");
  await choose(page, /Allocation and every dependent architecture/);
  await page.getByRole("button", { name: "Check the unfamiliar case" }).click();
  await page.getByRole("button", { name: /Defend and save/ }).click();

  await choose(page, "A · 15% Ready / 35% Steady / 50% Grow");
  await page.getByLabel(/candidate weight ceiling results/).fill("3");
  await choose(
    page,
    "A learner/OPS policy from a hypothetical loss—not a regulator threshold or guarantee",
  );
  await page.getByRole("button", { name: "Save Allocation and Risk Policy" }).click();
}

test("Mission 5 persists a practice policy, restores completion, and keeps modes isolated", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(MISSION_5);
  await completePracticeMission(page);

  await expect(page.getByText("7 of 7 stages complete", { exact: false })).toBeVisible();
  const workbench = page.getByRole("region", { name: "Build while you learn" }).filter({ visible: true });
  await expect(workbench).toContainText("2 / 7");
  await expect(workbench).toContainText("Research checked");

  await page.reload();
  await expectPracticeCase(page);
  await expect(page.getByText("7 of 7 stages complete", { exact: false })).toBeVisible();

  await Promise.all([
    page.waitForURL("**/dossier"),
    page.getByRole("link", { name: /Open the Portfolio Dossier/ }).last().click(),
  ]);
  await expect(page.getByRole("heading", { name: "Allocation & risk policy" })).toBeVisible();
  await page.getByRole("button", { name: "Expand all" }).click();
  await expect(page.getByText("Mina protects the dated tuition need", { exact: false })).toBeVisible();
  await expect(page.getByText("Range 15% to 25%; target 20%", { exact: false })).toBeVisible();

  await page.goto(MISSION_5);
  // The choice lives on the runway now, so reach it before switching. Practice
  // has finished the lesson, so its stage nav offers the completed runway.
  await page.getByRole("button", { name: "Runway, complete" }).click();
  await chooseMode(page, "personal");
  await expect(workbench).toContainText("0 / 7");
  await chooseMode(page, "practice");
  await expect(workbench).toContainText("2 / 7");

  // Switching back remounted practice on its own restored stage, not the runway.
  await page.getByRole("button", { name: "Runway, complete" }).click();
  await page.getByRole("button", { name: "Continue to Goal" }).click();
  await page.getByLabel("Required within two years", { exact: true }).fill("9000");
  for (const name of [
    "Continue to Runway",
    "Continue to Loss",
    "Continue to Access",
    "Continue to Change",
  ]) {
    await page.getByRole("button", { name }).click();
  }
  await page.getByRole("button", { name: "Save readiness route" }).click();

  await expect(page.getByText("4 of 7 stages complete", { exact: false })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Give every dollar a role", exact: false }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Lesson stages" })
      .getByRole("button", { name: "Defend", exact: true }),
  ).toBeDisabled();

  await page.reload();
  await expect(page.getByText("4 of 7 stages complete", { exact: false })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Give every dollar a role", exact: false }),
  ).toBeVisible();
});

test("Mission 5 does not credit a migrated v1 mandate without exact readiness evidence", async ({ page }) => {
  const legacy = createEmptyPortfolioWorkbench("2026-08-12T12:00:00.000Z");
  legacy.activeMode = "practice";
  legacy.cases.practice.mandate = {
    ...legacy.cases.practice.mandate,
    goal: "Fund a future education expense",
    targetDate: "more-than-five-years",
    horizon: "more than five years",
    contributionPlan: "$500 monthly",
    plannedWithdrawals: "$12,000 in 18 months",
    nearTermCashNeeds: "12000",
    emergencyReserve: {
      target: "$8,000 fictional target",
      current: "$8,000",
      status: "on-track",
    },
    capacityForLoss: "moderate",
    willingnessForLoss: "moderate",
    route: "practice-only",
    acknowledgedAt: "2026-08-12T12:00:00.000Z",
  };
  legacy.cases.practice.checkpoints.mandate = {
    status: "coherent",
    revision: 1,
    updatedAt: "2026-08-12T12:00:00.000Z",
    acceptedDependencyRevisions: {},
  };
  const serializedLegacy = JSON.stringify(legacy, (key, value) =>
    key === "readinessDetails" ? undefined : value,
  );

  await page.addInitScript(
    ({ storageKey, value }) => window.localStorage.setItem(storageKey, value),
    { storageKey: PORTFOLIO_WORKBENCH_STORAGE_KEY, value: serializedLegacy },
  );
  await page.goto(MISSION_5);

  await expectPracticeCase(page);
  await expect(page.getByText("0 of 7 stages complete", { exact: false })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Define what this portfolio must protect." }),
  ).toBeVisible();
});

test("Mission 5 teaches and retries an incorrect Preflight relationship", async ({ page }) => {
  await page.goto(MISSION_5);
  await completePracticeReadiness(page);
  // Saving readiness advances the lesson by itself. Pressing the shell advance
  // as well is only correct when it has not already moved, and when it has the
  // button is gone entirely — which is what timed this out.
  await advanceIfStillOnStage(page, /Run the theory preflight/);

  await page
    .getByRole("group", {
      name: "1. What determines how two risky assets behave together in a portfolio?",
    })
    .getByRole("radio", { name: "I don't know yet" })
    .check();
  for (const answer of [
    "Reduce some asset-specific risk, while common risks and loss remain",
    /An estimate-based opportunity set/,
    "As estimates that depend on inputs and assumptions",
  ]) {
    await choose(page, answer);
  }
  await page.getByRole("button", { name: "Check the four relationships" }).click();
  await expect(page.getByText("1 concept to bridge", { exact: true })).toBeVisible();

  const freshCheck = page.getByRole("group", {
    name: /Fresh check: two equally weighted assets usually fall together/,
  });
  await freshCheck
    .getByRole("radio", { name: "Owning two tickers removes the shared risk" })
    .check();
  await page.getByRole("button", { name: "Check fresh answers" }).click();
  await expect(page.getByText("Try this relationship again", { exact: true })).toBeVisible();

  await freshCheck
    .getByRole("radio", { name: /Their positive co-movement can make the portfolio fall more/ })
    .check();
  await page.getByRole("button", { name: "Check fresh answers" }).click();
  await expect(
    page.getByRole("button", { name: "Continue with preflight passed" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue with preflight passed" }).click();
  // Only the readiness save auto-advances. Clearing the preflight — by the bridge
  // and fresh check here, or all-correct in completePracticeMission — marks the
  // stage complete and deliberately leaves the learner on the confirmed result,
  // so both paths move on from the shell.
  await page.getByRole("button", { name: /Watch the policy form/ }).click();
  await expect(
    page.getByRole("heading", { name: "Watch weights turn into a goal consequence." }),
  ).toBeVisible();
});

test("Mission 5 removes the decorative scan when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(MISSION_5);

  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await expect(page.getByTestId("policy-scan-beam")).toBeHidden();
  for (const role of ["ready", "steady", "grow"]) {
    await expect(page.getByTestId(`policy-role-${role}`)).toHaveCSS("opacity", "1");
  }
  await expect(page.getByRole("heading", { name: "Set allocation. Make the loss visible." })).toBeVisible();
});
