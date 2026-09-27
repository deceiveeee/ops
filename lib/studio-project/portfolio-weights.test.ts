import { describe, expect, it } from "vitest";
import { removeStudioHolding, updateStudioHolding, validateStudioPlan } from "@/lib/studio";
import { exportProjectBackup, importProjectBackup } from "./backup";
import { createStudioProject } from "./create";
import { emptyLimits } from "./limits";
import { addInvestigatedCompany, addPosition, duplicateAlternative, removePosition, saveInvestigation } from "./operations";
import { allocationView, chooseWeightProposal, comparisonNeedsReview, eligibleValuations, holdingInputsChanged, saveWeightProposal, type WeightProposalEdits } from "./portfolio-weights";
import type { FigureSource, StudioProject } from "./schema";
import { newValuation, saveValuation, type ValuationCase } from "./valuation-cases";
import { validateStudioProject } from "./validate";
import { applyPlanChange, projectToPlan } from "./workspace";

const NOW = "2026-09-25T12:00:00.000Z";
const LATER = "2026-09-25T13:00:00.000Z";

function apple(patch: Partial<ValuationCase> = {}): ValuationCase {
  const base = newValuation(true, NOW);
  return { ...base, id: "value-apple", company: "Apple Inc.", ticker: "AAPL", cik: "0000320193", name: "My Apple assumptions", example: false, ...patch };
}

function project(): StudioProject {
  let value = createStudioProject("practice", NOW);
  for (const id of ["vti", "aapl", "agg"]) value = addPosition(value, id, undefined, NOW);
  return {
    ...value, goal: { ...value.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 },
    stress: { usStocksPct: -30, internationalStocksPct: -40, globalStocksPct: -35, bondsPct: -10, cashPct: 0 },
    limits: { ...emptyLimits(), companyCapPct: 10 },
    valuations: [apple()],
    alternatives: value.alternatives.map((item) => ({
      ...item, positions: item.positions.map((position, index) => ({ ...position, targetWeightPct: [50, 10, 25][index] })),
    })),
  };
}

const edits = (patch: Partial<WeightProposalEdits> = {}): WeightProposalEdits => ({
  name: "More diversified weights", reasoning: "Keep company exposure inside my chosen cap.",
  weights: { vti: "45", aapl: "5", agg: "30" }, valuationCaseIds: { aapl: "value-apple" }, ...patch,
});
const save = (value = project(), patch: Partial<WeightProposalEdits> = {}) => saveWeightProposal(value, value.alternatives[0].id, edits(patch), LATER);

describe("portfolio weight comparisons", () => {
  it("keeps reserve dollars separate and uses whole-portfolio stress and checks", () => {
    // $100k minus $20k reserve leaves $80k. 50/10/25% weights invest
    // $40k/$8k/$20k, leaving $32k cash. Loss: $12k+$2.4k+$2k=$16.4k.
    const value = project();
    const current = allocationView(value, value.alternatives[0]);
    expect(current.calculation.valid).toBe(true);
    expect(current.calculation.rows.map((row) => [row.targetValue, row.targetPortfolioWeightPct])).toEqual([[40_000, 40], [8_000, 8], [20_000, 20]]);
    expect(current.calculation.targetCash).toBe(32_000);
    expect(current.calculation.stress.rows.map((row) => row.changeDollars)).toEqual([-12_000, -2_400, -2_000]);
    expect(current.calculation.stress.changeDollars).toBe(-16_400);
    expect(current.checks.sliceShares).toEqual({ ready: 32, steady: 20, grow: 48 });
    const saved = save(value);
    const proposed = allocationView(saved, saved.alternatives[1]);
    // 45/5/30% of $80k: $36k/$4k/$24k, $36k cash, loss $14.4k.
    expect(proposed.calculation.rows.map((row) => row.targetValue)).toEqual([36_000, 4_000, 24_000]);
    expect(proposed.calculation.targetCash).toBe(36_000);
    expect(proposed.calculation.stress.changeDollars).toBe(-14_400);
    expect(proposed.calculation.stress.changePct).toBe(-14.4);
    expect(proposed.checks.sliceShares).toEqual({ ready: 36, steady: 24, grow: 40 });
  });

  it("includes the entered cash shock when proposed weights leave more unassigned", () => {
    const value = project();
    value.stress.cashPct = -2;
    const saved = save(value);
    // $14,400 from holdings + $36,000 * 2% from cash = $15,120.
    expect(allocationView(saved, saved.alternatives[1]).calculation.stress.changeDollars).toBe(-15_120);
  });

  it("saves a new alternative without changing the original or selecting it", () => {
    const value = project();
    const before = structuredClone(value);
    const saved = save(value);
    expect(value).toEqual(before);
    expect(saved.alternatives[0]).toEqual(before.alternatives[0]);
    expect(saved.selectedAlternativeId).toBe(value.selectedAlternativeId);
    expect(saved.alternatives[1].id).not.toBe(saved.alternatives[0].id);
    expect(saved.alternatives[1]).toMatchObject({ createdAt: LATER, updatedAt: LATER, reasoning: edits().reasoning });
    expect(saved.alternatives[1].positions.map((row) => row.instrumentId)).toEqual(["vti", "aapl", "agg"]);
    expect(saved.alternatives[1].valuationLinks?.[0].snapshot).toEqual(value.valuations![0]);
    expect(saved.alternatives[1].valuationLinks?.[0].snapshot).not.toBe(value.valuations![0]);
    expect(saved.decisions).toHaveLength(0);
  });

  it("uses the latest queued record and rejects a stale source revision", () => {
    const value = project();
    const original = value.alternatives[0];
    const latest = {
      ...value, alternatives: [{ ...original, updatedAt: LATER, currentCash: 777, positions: original.positions.map((position) => ({ ...position, tradeFee: 4 })) }],
    };
    expect(() => saveWeightProposal(latest, original.id, edits(), LATER, original.updatedAt)).toThrow(/changed while/);
    const saved = saveWeightProposal(latest, original.id, edits({ weights: {} }), LATER, LATER);
    expect(saved.alternatives[1].currentCash).toBe(777);
    expect(saved.alternatives[1].positions.map((row) => [row.targetWeightPct, row.tradeFee])).toEqual([[50, 4], [10, 4], [25, 4]]);
  });

  it.each(["", " ", "NaN", "Infinity", "1e309", "0x10", "1,5", "-1", "101"])("refuses the invalid weight %j without touching the project", (weight) => {
    const value = project();
    const before = JSON.stringify(value);
    expect(() => save(value, { weights: { vti: weight } })).toThrow(/Every weight/);
    expect(JSON.stringify(value)).toBe(before);
  });

  it("refuses overweight, unknown positions, unknown sources and invalid portfolio calculations", () => {
    expect(() => save(project(), { weights: { vti: "90" } })).toThrow(/exceed 100/);
    expect(() => save(project(), { weights: { missing: "5" } })).toThrow(/no longer in/);
    expect(() => save(project(), { valuationCaseIds: { missing: "value-apple" } })).toThrow(/no longer in/);
    expect(() => saveWeightProposal(project(), "missing", edits())).toThrow(/no longer available/);
    const invalid = project();
    invalid.goal.cashReserve = 100_001;
    expect(() => save(invalid)).toThrow(/reserve cannot exceed/);
    expect(() => save(project(), { name: " " })).toThrow(/name/);
  });

  it("requires an explicit valid valuation choice and reads it at save time", () => {
    const value = project();
    expect(save(value, { valuationCaseIds: {} }).alternatives[1].valuationLinks).toEqual([]);
    expect(() => save(value, { valuationCaseIds: { aapl: "missing" } })).toThrow(/no longer matches/);
    value.valuations![0].inputs.growth = "12";
    expect(() => save(value)).toThrow(/needs its inputs/);
  });

  it("selects only on request, logs both alternative ids and the reason, and preserves limits", () => {
    const saved = save(project(), { weights: { vti: "25", aapl: "50", agg: "25" } });
    const proposal = saved.alternatives[1];
    expect(allocationView(saved, proposal).checks.checks.find((item) => item.key === "caps")?.status).toBe("not-met");
    const chosen = chooseWeightProposal(saved, proposal.id, "I accept the concentration and will review the position.", LATER);
    expect(chosen.selectedAlternativeId).toBe(proposal.id);
    expect(chosen.limits).toEqual(saved.limits);
    expect(chosen.decisions).toHaveLength(1);
    expect(chosen.decisions[0]).toMatchObject({ reason: "I accept the concentration and will review the position.", affects: [saved.alternatives[0].id, proposal.id] });
    expect(saved.selectedAlternativeId).toBe(saved.alternatives[0].id);
    expect(chooseWeightProposal(chosen, proposal.id, "Already chosen")).toBe(chosen);
  });

  it("refuses unknown, invalid or unexplained selections", () => {
    const value = save();
    expect(() => chooseWeightProposal(value, "missing", "My choice")).toThrow(/no longer available/);
    expect(() => chooseWeightProposal(value, value.alternatives[1].id, " ")).toThrow(/why/);
    value.alternatives[1].positions[0].targetWeightPct = 100;
    expect(() => chooseWeightProposal(value, value.alternatives[1].id, "My choice")).toThrow(/exceed 100/);
  });
});

describe("saved comparison assumptions and operational inputs", () => {
  const changes: { label: string; apply: (value: StudioProject) => void }[] = [
    { label: "portfolio budget", apply: (value) => { value.goal.budget = 120_000; } },
    { label: "reserve", apply: (value) => { value.goal.cashReserve = 25_000; } },
    { label: "goal horizon", apply: (value) => { value.goal.horizonYears += 1; } },
    { label: "company cap", apply: (value) => { value.limits!.companyCapPct = 5; } },
    { label: "zero loss capacity", apply: (value) => { value.limits!.lossCapacityPct = 0; } },
    { label: "stock scenario", apply: (value) => { value.stress.usStocksPct = -45; } },
    { label: "cash scenario", apply: (value) => { value.stress.cashPct = -2; } },
  ];

  it.each(changes)("requires a fresh reviewed proposal after changing $label", ({ apply }) => {
    const saved = save();
    const old = saved.alternatives[1];
    const basis = structuredClone(old.comparisonBasis);
    expect(comparisonNeedsReview(saved, old)).toBe(false);
    const changed = structuredClone(saved);
    apply(changed);
    expect(comparisonNeedsReview(changed, changed.alternatives[1])).toBe(true);
    expect(holdingInputsChanged(changed, changed.alternatives[1])).toBe(false);
    expect(() => chooseWeightProposal(changed, old.id, "I reviewed this.")).toThrow(/Goals, limits or scenario assumptions changed/);
    expect(changed.selectedAlternativeId).toBe(saved.selectedAlternativeId);
    const refreshed = saveWeightProposal(changed, old.id, edits({ weights: {}, valuationCaseIds: {} }), LATER);
    const fresh = refreshed.alternatives[2];
    expect(comparisonNeedsReview(refreshed, fresh)).toBe(false);
    expect(refreshed.alternatives[1].comparisonBasis).toEqual(basis);
    expect(chooseWeightProposal(refreshed, fresh.id, "Reviewed with the changed assumptions.").selectedAlternativeId).toBe(fresh.id);
  });

  // JSON imports can reorder object fields without changing financial meaning.
  const reordered = <T,>(value: T): T => {
    if (Array.isArray(value)) return value.map(reordered) as T;
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reordered(item)])) as T;
    return value;
  };

  it("ignores object key order in imported comparison snapshots", () => {
    const saved = save();
    const proposal = saved.alternatives[1];
    proposal.comparisonBasis = reordered(proposal.comparisonBasis);
    expect(validateStudioProject(saved)).toEqual([]);
    expect(comparisonNeedsReview(saved, proposal)).toBe(false);
    expect(chooseWeightProposal(saved, proposal.id, "Same inputs, reordered JSON.").selectedAlternativeId).toBe(proposal.id);
  });

  it("ignores target weights, holding order and object key order when checking buying inputs", () => {
    const saved = save();
    const proposal = saved.alternatives[1];
    proposal.positions = proposal.positions.map((position) => reordered(position)).reverse();
    expect(proposal.positions.map((position) => position.targetWeightPct)).not.toEqual(saved.alternatives[0].positions.map((position) => position.targetWeightPct));
    expect(holdingInputsChanged(saved, proposal)).toBe(false);
    expect(chooseWeightProposal(saved, proposal.id, "Only target weights differ.").selectedAlternativeId).toBe(proposal.id);
  });

  const operationalChanges: { label: string; apply: (value: StudioProject) => StudioProject }[] = [
    { label: "current cash", apply: (value) => applyPlanChange(value, (plan) => ({ ...plan, currentCash: 500 })) },
    { label: "contribution amount", apply: (value) => applyPlanChange(value, (plan) => ({ ...plan, contributionAmount: 100 })) },
    { label: "current holding value", apply: (value) => applyPlanChange(value, (plan) => updateStudioHolding(plan, "aapl", { currentValue: 1200 })) },
    { label: "quote price", apply: (value) => applyPlanChange(value, (plan) => updateStudioHolding(plan, "aapl", { quotePrice: 175 })) },
    { label: "quote date", apply: (value) => applyPlanChange(value, (plan) => updateStudioHolding(plan, "aapl", { quoteAsOf: "2026-09-25" })) },
    { label: "quantity mode", apply: (value) => applyPlanChange(value, (plan) => updateStudioHolding(plan, "aapl", { quantityMode: "fractional" })) },
    { label: "accrued interest", apply: (value) => applyPlanChange(value, (plan) => updateStudioHolding(plan, "agg", { accruedInterestPer100: 2 })) },
    { label: "trade fee", apply: (value) => applyPlanChange(value, (plan) => updateStudioHolding(plan, "aapl", { tradeFee: 4 })) },
    { label: "added holding", apply: (value) => addPosition(value, "voo", undefined, LATER) },
    { label: "removed holding", apply: (value) => removePosition(value, "aapl", undefined, LATER) },
  ];

  it.each(operationalChanges)("prevents an old proposal from restoring changed $label", ({ apply }) => {
    const saved = save();
    const old = structuredClone(saved.alternatives[1]);
    const changed = apply(saved);
    expect(validateStudioProject(changed)).toEqual([]);
    expect(comparisonNeedsReview(changed, changed.alternatives[1])).toBe(false);
    expect(holdingInputsChanged(changed, changed.alternatives[1])).toBe(true);
    expect(() => chooseWeightProposal(changed, old.id, "Try the older weights.")).toThrow(/Holdings or buying inputs changed/);
    expect(changed.alternatives[1]).toEqual(old);
    const freshProject = saveWeightProposal(changed, changed.selectedAlternativeId!, edits({ weights: {}, valuationCaseIds: {} }), LATER);
    const fresh = freshProject.alternatives[2];
    expect(holdingInputsChanged(freshProject, fresh)).toBe(false);
    expect(chooseWeightProposal(freshProject, fresh.id, "Reviewed the current holdings and buying inputs.").selectedAlternativeId).toBe(fresh.id);
  });

  it("deep copies saved comparison assumptions when saving and duplicating", () => {
    const value = project();
    value.limits!.cashNeeds = [{ id: "bill", label: "Tuition", amount: 10_000, dueDate: "2028-01-01" }];
    const saved = save(value);
    const proposal = saved.alternatives[1];
    expect(proposal.comparisonBasis!.goal).not.toBe(saved.goal);
    expect(proposal.comparisonBasis!.limits.cashNeeds[0]).not.toBe(saved.limits!.cashNeeds[0]);
    const duplicate = duplicateAlternative(saved, proposal.id, "Another proposal", LATER);
    const copy = duplicate.alternatives[2];
    expect(copy.comparisonBasis).toEqual(proposal.comparisonBasis);
    expect(copy.comparisonBasis).not.toBe(proposal.comparisonBasis);
    copy.comparisonBasis!.goal.budget = 120_000;
    copy.comparisonBasis!.limits.cashNeeds[0].amount = 20_000;
    copy.comparisonBasis!.stress.cashPct = -3;
    expect(proposal.comparisonBasis!.goal.budget).toBe(100_000);
    expect(proposal.comparisonBasis!.limits.cashNeeds[0].amount).toBe(10_000);
    expect(proposal.comparisonBasis!.stress.cashPct).toBe(0);
    expect(saved.limits!.cashNeeds[0].amount).toBe(10_000);
  });

  it("accepts legacy alternatives without comparison snapshots", () => {
    const value = project();
    expect(value.alternatives[0].comparisonBasis).toBeUndefined();
    expect(comparisonNeedsReview(value, value.alternatives[0])).toBe(false);
    expect(validateStudioProject(value)).toEqual([]);
  });

  it("rejects malformed comparison snapshots on import", () => {
    const value = save();
    const basis = value.alternatives[1].comparisonBasis!;
    for (const comparisonBasis of [
      null, {}, { ...basis, extra: true }, { ...basis, goal: undefined },
      { ...basis, goal: { ...basis.goal, budget: "100000" } },
      { ...basis, limits: { ...basis.limits, companyCapPct: 101 } },
      { ...basis, stress: { ...basis.stress, cashPct: NaN } },
    ]) {
      const invalid = { ...value, alternatives: [value.alternatives[0], { ...value.alternatives[1], comparisonBasis }] };
      expect(validateStudioProject(invalid).join(" ")).toMatch(/saved allocation comparison/);
    }
  });
});

describe("valuation identity and retained evidence", () => {
  it("requires the catalog ticker, issuer and traded-share ratio, with no examples or invalid models", () => {
    const value = project();
    const valid = apple({ ticker: " aapl ", cik: "320193", inputs: { ...apple().inputs, receipt: "1.0" } });
    value.valuations = [
      valid, apple({ id: "wrong-issuer", cik: "1046179" }), apple({ id: "wrong-ticker", ticker: "AAPL.B" }),
      apple({ id: "wrong-unit", inputs: { ...valid.inputs, receipt: "5" } }),
      apple({ id: "example", example: true }), apple({ id: "invalid", inputs: { ...valid.inputs, growth: "20" } }),
      apple({ id: "empty-cik", cik: "" }),
    ];
    expect(eligibleValuations(value, "aapl").map((record) => record.id)).toEqual([valid.id]);
    expect(eligibleValuations(value, "vti")).toEqual([]);
    expect(eligibleValuations(value, "missing")).toEqual([]);
  });

  it("matches the receipt ratio from the TSM filing rather than assuming one share", () => {
    const value = project();
    const tsm = apple({ id: "tsm-correct", company: "TSMC", ticker: "TSM", cik: "1046179", inputs: { ...apple().inputs, receipt: "5" } });
    value.valuations = [tsm, { ...tsm, id: "tsm-common", inputs: { ...tsm.inputs, receipt: "1" } }];
    expect(eligibleValuations(value, "tsm").map((record) => record.id)).toEqual(["tsm-correct"]);
  });

  it("uses an investigated company's known issuer and ticker, never a matching name over contrary identity", () => {
    const source: FigureSource = { ticker: "NORD", cik: "1234", entityName: "Nordic Pulp", sic: "", sicDescription: "", periodEnd: "2025-12-31", accession: "", form: "10-K", filed: "", figures: {} };
    let value = saveInvestigation(project(), { company: "Nordic Pulp", sic: "", figures: {}, riskFreePct: null, source }, "inv-nordic", NOW);
    value = addInvestigatedCompany(value, "inv-nordic", "us-equity", NOW);
    const valid = apple({ id: "nordic", company: "Nordic Pulp plc", ticker: "NORD", cik: "0001234" });
    value.valuations = [valid, { ...valid, id: "contrary-issuer", cik: "9999", company: "Nordic Pulp" }, { ...valid, id: "wrong-listing", ticker: "NORD.B" }];
    expect(eligibleValuations(value, "own-inv-nordic").map((record) => record.id)).toEqual(["nordic"]);
    value.investigations[0].source = null;
    value.valuations = [valid, { ...valid, id: "exact-name", company: " nordic pulp " }];
    expect(eligibleValuations(value, "own-inv-nordic").map((record) => record.id)).toEqual(["exact-name"]);
  });

  it("preserves a snapshot after the source valuation changes or disappears; refresh and unlink are explicit", () => {
    const saved = save();
    const proposal = saved.alternatives[1];
    const snapshot = structuredClone(proposal.valuationLinks![0].snapshot);
    const changedRecord = { ...saved.valuations![0], inputs: { ...saved.valuations![0].inputs, growth: "3" }, updatedAt: LATER };
    const changed = saveValuation(saved, changedRecord);
    const preserved = saveWeightProposal(changed, proposal.id, edits({ weights: {}, valuationCaseIds: {} }), LATER);
    expect(preserved.alternatives[2].valuationLinks![0].snapshot).toEqual(snapshot);
    const refreshed = saveWeightProposal(changed, proposal.id, edits({ weights: {} }), LATER);
    expect(refreshed.alternatives[2].valuationLinks![0].snapshot.inputs.growth).toBe("3");
    expect(changed.alternatives[1].valuationLinks![0].snapshot).toEqual(snapshot);
    const removedSource = { ...changed, valuations: [] };
    expect(validateStudioProject(removedSource)).toEqual([]);
    const unlinked = saveWeightProposal(removedSource, proposal.id, edits({ weights: {}, valuationCaseIds: { aapl: "" } }), LATER);
    expect(unlinked.alternatives[2].valuationLinks).toEqual([]);
  });

  it("keeps links through edits, deep copies on duplication, and removes only the deleted position's link", () => {
    const saved = save();
    const chosen = { ...saved, selectedAlternativeId: saved.alternatives[1].id };
    const edited = applyPlanChange(chosen, (plan) => updateStudioHolding(plan, "aapl", { targetWeightPct: 7 }));
    expect(edited.alternatives[1].valuationLinks).toEqual(chosen.alternatives[1].valuationLinks);
    expect(validateStudioPlan(projectToPlan(edited))).toEqual([]);
    const duplicated = duplicateAlternative(edited, edited.alternatives[1].id, "Copy", LATER);
    expect(duplicated.alternatives[2].valuationLinks).toEqual(edited.alternatives[1].valuationLinks);
    expect(duplicated.alternatives[2].valuationLinks![0].snapshot.inputs).not.toBe(edited.alternatives[1].valuationLinks![0].snapshot.inputs);
    const direct = removePosition(duplicated, "aapl", duplicated.alternatives[1].id, LATER);
    expect(direct.alternatives[1].valuationLinks).toEqual([]);
    expect(direct.alternatives[2].valuationLinks).toHaveLength(1);
    const adapter = applyPlanChange(edited, (plan) => removeStudioHolding(plan, "aapl"));
    expect(adapter.alternatives[1].valuationLinks).toEqual([]);
    expect(adapter.valuations).toEqual(edited.valuations);
  });

  it("round-trips linked snapshots and still accepts backups with no links", () => {
    for (const value of [project(), save()]) {
      const backup = exportProjectBackup(value);
      if (!backup.ok) throw new Error(backup.error);
      const restored = importProjectBackup(backup.raw);
      if (!restored.ok) throw new Error(restored.error);
      expect(restored.project).toEqual(value);
    }
  });

  it("refuses malformed, repeated, dangling or excessive snapshot links", () => {
    const value = save();
    const link = value.alternatives[1].valuationLinks![0];
    for (const valuationLinks of [
      [link, link], [{ ...link, instrumentId: "missing" }], [{ ...link, extra: true }],
      [{ ...link, snapshot: { ...link.snapshot, model: "unknown-model" } }], Array(101).fill(link),
    ]) {
      const altered = { ...value, alternatives: [value.alternatives[0], { ...value.alternatives[1], valuationLinks }] };
      expect(validateStudioProject(altered).join(" ")).toMatch(/valuation link/);
    }
  });
});
