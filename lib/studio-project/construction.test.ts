import { describe, expect, it } from "vitest";
import { calculateStudio } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import {
  aboveInflation, applyBuilds, buildPortfolio, emptyBuild, emptyConstruction, futureValue, mixRange, mixScenarioPct,
  lookThrough, neededReturn, partOf, positionsFromBuild, rangeVerdict, startingPoint, storedWeights, validBuild, validConstruction,
  type AlternativeBuild, type Mix,
} from "./construction";
import { createStudioProject } from "./create";
import { emptyLimits } from "./limits";
import type { PortfolioPosition, StudioProject } from "./schema";
import { validateStudioProject } from "./validate";
import { projectToPlan } from "./workspace";

/*
 * Every expected number here was worked out before the code, by hand or by a
 * separate script (a plain loop on a monthly rate), never by this module.
 *
 * The plan's picks example: $20,000, $1,000 kept aside as cash.
 *   Mix Ready 5 / Steady 25 / Grow 70        -> $1,000 / $5,000 / $14,000
 *   Grow 30% international                   -> international $4,200, US $9,800
 *   Steady 20% short-term                    -> short $1,000, longer $4,000
 *   Picks budget 10%: AAPL 5%, TSM 5%        -> $1,000 each, out of US and international
 *   So VTI $8,800, VXUS $3,200, SGOV $1,000, AGG $4,000, AAPL $1,000, TSM $1,000.
 *   Index money in Grow after picks: $8,800 + $3,200 = $12,000.
 *   Stored weights are a share of the $19,000 after the cash kept aside:
 *   VTI 8,800 / 19,000 = 46.315789...%.
 */
const NOW = "2026-11-17T12:00:00.000Z";
const MIX: Mix = { ready: 5, steady: 25, grow: 70 };
const BUILD: AlternativeBuild = {
  growInternationalPct: 30,
  steadyShortPct: 20,
  fills: { "us-stocks": "vti", "international-stocks": "vxus", "short-bonds": "sgov", "longer-bonds": "agg" },
  picksBudgetPct: 10,
  picks: [{ instrumentId: "aapl", pct: 5 }, { instrumentId: "tsm", pct: 5 }],
};
const build = (patch: Partial<Parameters<typeof buildPortfolio>[0]> = {}) =>
  buildPortfolio({ whole: 20_000, cashKept: 1_000, mix: MIX, build: BUILD, catalog: STUDIO_CATALOG, ...patch });
const money = (result: ReturnType<typeof build>) => Object.fromEntries(result.holdings.map((holding) => [holding.instrumentId, holding.money]));

describe("the return a goal needs (step 2)", () => {
  it("finds about 5.9% a year for $10,000 plus $200 a month reaching $50,000 in 10 years", () => {
    const result = neededReturn({ start: 10_000, monthly: 200, years: 10, target: 50_000 });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    // A separate script gives 0.4772% a month, 5.88% a year; start-of-month additions would give less.
    expect(result.annualPct).toBeCloseTo(5.88, 2);
    expect(result.withoutGrowth).toBe(34_000);
  });

  it("matches the growth it was solved from", () => {
    // $10,000 and $200 a month at 3% a year come to about $41,300, and at 5% about $47,200 (the plan's figures).
    expect(futureValue(10_000, 200, 120, 0.03)).toBeCloseTo(41_329, -1);
    expect(futureValue(10_000, 200, 120, 0.05)).toBeCloseTo(47_162, -1);
  });

  it("says saving alone reaches a target that needs no growth", () => {
    const result = neededReturn({ start: 10_000, monthly: 200, years: 10, target: 30_000 });
    expect(result.status).toBe("reached");
    if (result.status === "reached") expect(result.annualPct).toBeLessThan(0);
  });

  it("refuses to call more than 100% a year a plan", () => {
    expect(neededReturn({ start: 100, monthly: 0, years: 1, target: 1_000_000 }).status).toBe("too-high");
  });

  it("needs a target, time and some money", () => {
    expect(neededReturn({ start: 10_000, monthly: 0, years: 10, target: null }).status).toBe("unset");
    expect(neededReturn({ start: 10_000, monthly: 0, years: 0, target: 20_000 }).status).toBe("no-time");
    expect(neededReturn({ start: 0, monthly: 0, years: 5, target: 20_000 }).status).toBe("no-money");
  });
});

describe("a mix against the goal (step 3)", () => {
  // Invented ranges, not forecasts: Ready 0-1%, Steady 2-4%, Grow 4-8% a year before inflation.
  const construction = {
    ...emptyConstruction(),
    inflationPct: 2,
    estimates: { ready: { lowPct: 0, highPct: 1 }, steady: { lowPct: 2, highPct: 4 }, grow: { lowPct: 4, highPct: 8 } },
  };

  it("weights each slice's range: 3.3% at the low ends, 6.65% at the high ends", () => {
    const range = mixRange(MIX, construction);
    expect(range.status).toBe("ok");
    if (range.status !== "ok") return;
    expect(range.lowPct).toBeCloseTo(3.3, 9);
    expect(range.highPct).toBeCloseTo(6.65, 9);
    // 1.033 / 1.02 - 1 and 1.0665 / 1.02 - 1, by hand.
    expect(range.lowRealPct).toBeCloseTo(1.2745, 3);
    expect(range.highRealPct).toBeCloseTo(4.5588, 3);
    expect(aboveInflation(5, 2)).toBeCloseTo(2.9412, 3);
  });

  it("places the needed return below, inside or above the range", () => {
    const range = mixRange(MIX, construction);
    expect(rangeVerdict(1, range)).toBe("covered");
    expect(rangeVerdict(3, range)).toBe("inside");
    expect(rangeVerdict(5.88, range)).toBe("above");
  });

  it("asks only for the estimates the mix uses", () => {
    const missing = mixRange(MIX, { ...construction, estimates: { ...construction.estimates, grow: { lowPct: 4, highPct: null } } });
    expect(missing).toEqual({ status: "incomplete", missing: ["grow"] });
    const noReady = mixRange({ ready: 0, steady: 30, grow: 70 }, { ...construction, estimates: { ...construction.estimates, ready: { lowPct: null, highPct: null } } });
    expect(noReady.status).toBe("ok");
  });

  it("gives no range above inflation until inflation is set", () => {
    const range = mixRange(MIX, { ...construction, inflationPct: null });
    expect(range.status === "ok" && range.lowRealPct).toBeNull();
    expect(rangeVerdict(3, range)).toBeNull();
  });

  it("prices a scenario on the mix, with Grow split once it is", () => {
    const stress = { usStocksPct: -30, internationalStocksPct: -40, globalStocksPct: -35, bondsPct: -10, cashPct: 0 };
    // 70% x -35% + 25% x -10% = -27%.
    expect(mixScenarioPct(MIX, stress, null)).toBeCloseTo(-27, 9);
    // Grow: 70% of -30% and 30% of -40% is -33%; 70% x -33% + 25% x -10% = -25.6%.
    expect(mixScenarioPct(MIX, stress, 30)).toBeCloseTo(-25.6, 9);
    expect(mixScenarioPct({ ready: 5, steady: 25, grow: null }, stress, null)).toBeNull();
  });
});

describe("parts, funds and picks (steps 4 to 6)", () => {
  it("works the plan's example out to the dollar", () => {
    const result = build();
    expect(result.problems).toEqual([]);
    expect(result.notes).toEqual([]);
    expect(money(result)).toEqual({ vti: 8_800, vxus: 3_200, sgov: 1_000, agg: 4_000, aapl: 1_000, tsm: 1_000 });
    expect(result.ready).toBe(1_000);
    expect(result.unassigned).toBe(0);
    const grow = result.parts.filter((part) => part.part.endsWith("stocks"));
    expect(grow.reduce((sum, part) => sum + part.fundMoney, 0)).toBe(12_000);
    expect(result.parts.find((part) => part.part === "us-stocks")).toMatchObject({ money: 9_800, fundMoney: 8_800, picksMoney: 1_000 });
  });

  it("stores weights as a share of the money after the cash kept aside, never past 100%", () => {
    const weights = storedWeights(build(), 1_000);
    expect(weights.get("vti")).toBeCloseTo(46.315789, 6);
    const total = [...weights.values()].reduce((sum, weight) => sum + weight, 0);
    expect(total).toBeLessThanOrEqual(100);
    expect(total).toBeGreaterThan(99.9999);
  });

  it("gives the existing calculation back the same dollars", () => {
    let project = createStudioProject("practice", NOW);
    project = { ...project, goal: { ...project.goal, budget: 20_000, cashReserve: 1_000 } };
    const positions = positionsFromBuild([], build(), 1_000)!;
    project = { ...project, alternatives: [{ ...project.alternatives[0], positions }] };
    const calculation = calculateStudio(projectToPlan(project), STUDIO_CATALOG);
    expect(calculation.valid).toBe(true);
    const value = (id: string) => calculation.rows.find((row) => row.holding.instrumentId === id)!.targetValue;
    expect(value("vti")).toBeCloseTo(8_800, 1);
    expect(value("tsm")).toBeCloseTo(1_000, 1);
    expect(calculation.targetCash).toBeCloseTo(1_000, 1);
  });

  it("is the benchmark with the picks' money back in the index funds", () => {
    const result = build({ withoutPicks: true });
    expect(money(result)).toEqual({ vti: 9_800, vxus: 4_200, sgov: 1_000, agg: 4_000 });
  });

  it("keeps unsplit and unfilled money in cash, and says so", () => {
    const unsplit = build({ build: { ...BUILD, growInternationalPct: null, picks: [], picksBudgetPct: null } });
    expect(unsplit.problems).toEqual([]);
    expect(unsplit.notes[0]).toMatch(/Grow's \$14,000 is not split yet/);
    expect(unsplit.unassigned).toBe(14_000);
    const unfilled = build({ build: { ...BUILD, fills: { ...BUILD.fills, "longer-bonds": null } } });
    expect(unfilled.notes[0]).toMatch(/longer-term bonds yet, so its \$4,000 stays in cash/);
    expect(money(unfilled).agg).toBeUndefined();
  });

  it("refuses a fund in the wrong part", () => {
    const result = build({ build: { ...BUILD, fills: { ...BUILD.fills, "short-bonds": "vti" } } });
    expect(result.notes.some((note) => /short-term bonds/.test(note))).toBe(true);
    expect(money(result).vti).toBe(8_800);
  });

  it("reports what does not add up and works nothing out", () => {
    expect(build({ mix: { ready: 5, steady: 25, grow: 60 } }).problems[0]).toMatch(/adding up to 100%/);
    expect(build({ cashKept: 2_000 }).problems[0]).toMatch(/Ready is \$1,000, less than the \$2,000/);
    expect(build({ companyCapPct: 4 }).problems.some((problem) => /AAPL|aapl/.test(problem) && /cap/.test(problem))).toBe(true);
    expect(build({ build: { ...BUILD, picksBudgetPct: 8 } }).problems[0]).toMatch(/add up to 10%, more than the 8% budget/);
    expect(build({ build: { ...BUILD, picksBudgetPct: 80 } }).problems[0]).toMatch(/more than Grow's 70%/);
    // International stocks at 10% of Grow's $14,000 hold $1,400: TSM's $1,000 fits. At 5% they hold $700: it does not.
    expect(build({ build: { ...BUILD, growInternationalPct: 10 } }).problems).toEqual([]);
    expect(build({ build: { ...BUILD, growInternationalPct: 5 } }).problems).toEqual(["Picks from international stocks come to $1,000, more than the part's $700."]);
    expect(build({ whole: 0 }).holdings).toEqual([]);
  });
});

describe("positions follow the build", () => {
  const position = (instrumentId: string, patch: Partial<PortfolioPosition> = {}): PortfolioPosition => ({
    instrumentId, targetWeightPct: 10, currentValue: 0, quotePrice: null, quoteAsOf: "", quantityMode: "whole", accruedInterestPer100: null, tradeFee: 0, ...patch,
  });

  it("keeps what the learner entered, and keeps anything unused at 0% rather than removing it", () => {
    const next = positionsFromBuild(
      [position("vti", { currentValue: 500, quotePrice: 300, quoteAsOf: "2026-11-01" }), position("voo", { currentValue: 200 }), position("ust-91282crf0")],
      build(), 1_000,
    )!;
    expect(next.find((item) => item.instrumentId === "vti")).toMatchObject({ currentValue: 500, quotePrice: 300, quoteAsOf: "2026-11-01" });
    expect(next.find((item) => item.instrumentId === "voo")).toMatchObject({ targetWeightPct: 0, currentValue: 200 });
    // Added from Research and not used by the build: still there, at 0%, so the next save does not undo the add.
    expect(next.find((item) => item.instrumentId === "ust-91282crf0")).toMatchObject({ targetWeightPct: 0 });
    expect(next.map((item) => item.instrumentId).sort()).toEqual(["aapl", "agg", "sgov", "tsm", "ust-91282crf0", "voo", "vti", "vxus"]);
  });

  it("leaves positions alone when the build has a problem", () => {
    expect(positionsFromBuild([position("vti")], build({ cashKept: 5_000 }), 5_000)).toBeNull();
  });

  function projectWithBuild(): StudioProject {
    const project = createStudioProject("practice", NOW);
    const limits = emptyLimits();
    return {
      ...project,
      goal: { ...project.goal, budget: 20_000, cashReserve: 1_000 },
      limits: { ...limits, slices: { ready: { ...limits.slices.ready, targetPct: 5 }, steady: { ...limits.slices.steady, targetPct: 25 }, grow: { ...limits.slices.grow, targetPct: 70 } } },
      alternatives: [{ ...project.alternatives[0], build: BUILD }],
    };
  }

  it("rewrites every portfolio with a build, starts research records, and saves", () => {
    const applied = applyBuilds(projectWithBuild(), STUDIO_CATALOG, NOW);
    const ids = applied.alternatives[0].positions.map((item) => item.instrumentId).sort();
    expect(ids).toEqual(["aapl", "agg", "sgov", "tsm", "vti", "vxus"]);
    expect(applied.candidates.map((candidate) => candidate.instrumentId).sort()).toEqual(ids);
    expect(validateStudioProject(applied)).toEqual([]);
  });

  it("follows a change of goal: more money, same shares", () => {
    const applied = applyBuilds(projectWithBuild(), STUDIO_CATALOG, NOW);
    const richer = applyBuilds({ ...applied, goal: { ...applied.goal, budget: 40_000 } }, STUDIO_CATALOG, NOW);
    const calculation = calculateStudio(projectToPlan(richer), STUDIO_CATALOG);
    // $40,000 with Grow 70% and 30% international: US $19,600 less AAPL's $2,000 = $17,600.
    expect(calculation.rows.find((row) => row.holding.instrumentId === "vti")!.targetValue).toBeCloseTo(17_600, 1);
  });

  it("leaves a portfolio without a build exactly as typed", () => {
    const project = createStudioProject("practice", NOW);
    expect(applyBuilds(project, STUDIO_CATALOG, NOW)).toBe(project);
  });
});

describe("starting from a portfolio typed by hand", () => {
  const find = (id: string) => STUDIO_CATALOG.find((instrument) => instrument.id === id)!;
  it("adds the holdings up into a mix, a split, one fund per part and picks", () => {
    // Whole-portfolio shares: VTI 36, VOO 9, VXUS 18, AAPL 4.5, AGG 18, the 2036 Treasury 9, cash 5.5.
    const rows = [["vti", 36], ["voo", 9], ["vxus", 18], ["aapl", 4.5], ["agg", 18], ["ust-91282crf0", 9]] as const;
    const start = startingPoint(rows.map(([id, wholePct]) => ({ instrumentId: id, instrument: find(id), wholePct })));
    // Grow 36 + 9 + 18 + 4.5 = 67.5; Steady 18 + 9 = 27; Ready 5.5.
    expect(start.mix).toEqual({ ready: 5.5, steady: 27, grow: 67.5 });
    // International 18 of 67.5 = 26.67%; no short-term bonds.
    expect(start.build.growInternationalPct).toBe(26.67);
    expect(start.build.steadyShortPct).toBe(0);
    expect(start.build.fills).toEqual({ "us-stocks": "vti", "international-stocks": "vxus", "short-bonds": null, "longer-bonds": "agg" });
    expect(start.build.picks).toEqual([{ instrumentId: "aapl", pct: 4.5 }]);
    expect(start.build.picksBudgetPct).toBe(4.5);
    expect(start.merged).toEqual([{ from: "voo", into: "vti" }, { from: "ust-91282crf0", into: "agg" }]);
  });

  it("calls a Treasury bill short-term and a ten-year note longer-term", () => {
    expect(partOf(find("ust-91282crf0"), "2026-11-17")).toBe("longer-bonds");
    expect(partOf({ id: "bill", kind: "bond", assetClass: "fixed-income", bond: { ...find("ust-91282crf0").bond!, maturity: "2027-05-01" } }, "2026-11-17")).toBe("short-bonds");
    expect(partOf(find("sgov"))).toBe("short-bonds");
    expect(partOf(find("aapl"))).toBeNull();
  });
});

describe("looking inside the funds (step 7)", () => {
  it("adds one company held directly and through a fund", () => {
    // AAPL 5% held directly; VTI 40% of the whole with Apple at 6% of the fund adds 2.4%: 7.4% in all.
    const rows = lookThrough([
      { instrumentId: "vti", wholePct: 40, exposures: [{ label: "Apple Inc", key: "lei-apple", weightPct: 6 }, { label: "Microsoft", key: "lei-msft", weightPct: 5 }] },
      { instrumentId: "aapl", wholePct: 5, exposures: [{ label: "Apple Inc.", key: "LEI-APPLE", weightPct: 100 }] },
      { instrumentId: "sgov", wholePct: 10, exposures: [{ label: "United States of America", key: "us", weightPct: 107.8756 }] },
    ]);
    expect(rows[0]).toEqual({ key: "us", label: "United States of America", pct: 10, through: ["sgov"] });
    expect(rows[1]).toEqual({ key: "lei-apple", label: "Apple Inc", pct: 7.4, through: ["vti", "aapl"] });
    expect(rows[2].pct).toBe(2);
  });
});

describe("validation", () => {
  it("accepts unfinished choices and refuses wrong shapes", () => {
    expect(validConstruction(emptyConstruction())).toBe(true);
    expect(validBuild(emptyBuild())).toBe(true);
    expect(validBuild(BUILD)).toBe(true);
    expect(validConstruction({ ...emptyConstruction(), extra: 1 })).toBe(false);
    expect(validConstruction({ ...emptyConstruction(), targetAmount: -1 })).toBe(false);
    expect(validConstruction({ ...emptyConstruction(), compare: [{ id: "a", name: "", ready: 1, steady: 2, grow: 3 }, { id: "a", name: "", ready: 1, steady: 2, grow: 3 }] })).toBe(false);
    expect(validBuild({ ...BUILD, picks: [{ instrumentId: "aapl", pct: 1 }, { instrumentId: "aapl", pct: 2 }] })).toBe(false);
    expect(validBuild({ ...BUILD, growInternationalPct: 101 })).toBe(false);
    expect(validBuild({ ...BUILD, fills: { ...BUILD.fills, cash: null } })).toBe(false);
  });

  it("is part of saving a project", () => {
    const project = createStudioProject("practice", NOW);
    expect(validateStudioProject({ ...project, construction: emptyConstruction() })).toEqual([]);
    expect(validateStudioProject({ ...project, construction: { ...emptyConstruction(), inflationPct: 99 } })).not.toEqual([]);
    expect(validateStudioProject({ ...project, alternatives: [{ ...project.alternatives[0], build: { ...BUILD, picksBudgetPct: -1 } }] })).not.toEqual([]);
  });
});
