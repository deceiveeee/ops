import { describe, expect, it } from "vitest";
import { exportProjectBackup, importProjectBackup } from "./backup";
import { createStudioProject } from "./create";
import { addPosition } from "./operations";
import { allocationSnapshot, alignHistories, computeComparison, seriesSnapshots, type ComparisonInput, type CoverageRow } from "./return-comparison";
import { comparisonChanges, historyOptions } from "./return-comparison-sources";
import { createSavedComparison, MAX_SAVED_COMPARISONS, removeReturnComparison, saveReturnComparison, validSavedComparison } from "./return-comparison-saved";
import { addScenario, FIRST_SCENARIO_ID } from "./scenarios";
import type { StudioProject } from "./schema";
import { createProjectSession } from "./session";
import type { ProjectStorage, StorageResult, StoredProject } from "./storage";
import { validateStudioProject } from "./validate";

const NOW = "2026-09-27T12:00:00.000Z";
const LATER = "2026-09-28T12:00:00.000Z";

/**
 * Two allocations of VTI (bundled public history) and AAPL (a synthetic local
 * import labelled as such, 2025-01 to 2025-06). The comparison therefore runs
 * over 2025-01 to 2025-06, the months both histories share.
 */
function project(): StudioProject {
  let value = createStudioProject("practice", NOW);
  for (const id of ["vti", "aapl"]) value = addPosition(value, id, undefined, NOW);
  const first = value.alternatives[0];
  const second = { ...first, id: "alt-second", name: "More VTI", positions: first.positions.map((position) => ({ ...position, targetWeightPct: position.instrumentId === "vti" ? 90 : 10 })) };
  return {
    ...value,
    goal: { ...value.goal, budget: 100_000, cashReserve: 20_000 },
    alternatives: [{ ...first, name: "Even split", positions: first.positions.map((position) => ({ ...position, targetWeightPct: 50 })) }, second],
    returnHistories: [{
      id: "returns-aapl", instrumentId: "aapl", sourceName: "Synthetic OPS test series", sourceUrl: "", currency: "USD", basis: "net-asset-value",
      method: "reported-total-return", importedAt: NOW,
      observations: [0.02, -0.03, 0.01, 0.04, -0.02, 0.015].map((value, i) => ({ month: `2025-0${i + 1}`, value })),
    }],
  };
}

function comparisonInput(value: StudioProject): ComparisonInput {
  const a = allocationSnapshot(value, value.alternatives[0]);
  const b = allocationSnapshot(value, value.alternatives[1]);
  const rows: CoverageRow[] = ["vti", "aapl"].map((id) => {
    const options = historyOptions(value, id, id.toUpperCase());
    return { instrumentId: id, symbol: id.toUpperCase(), bond: false, options, chosen: options[0] };
  });
  const aligned = alignHistories(rows);
  if (!aligned.ok) throw new Error(aligned.error);
  return { a, b, series: seriesSnapshots(rows, { start: aligned.start, months: aligned.months }), period: { start: aligned.start, months: aligned.months } };
}

const saved = (value = project()) => createSavedComparison(comparisonInput(value), "Even split against more VTI", "See how much the extra VTI moved things.", NOW, "comparison-1");

describe("saving a comparison", () => {
  it("keeps its own months, histories, weights and method, and leaves the selected allocation alone", () => {
    const value = project();
    const record = saved(value);
    expect(record.input.period).toEqual({ start: "2025-01", months: 6 });
    expect(record.input.series.map((item) => [item.instrumentId, item.kind, item.values.length])).toEqual([["vti", "public", 6], ["aapl", "import", 6]]);
    expect(record.input.series[0]).toMatchObject({ classId: "C000007808", seriesId: "S000002848", currency: "USD", basis: "net-asset-value" });
    expect(record.input.series[0].accessions).toHaveLength(6);
    expect(record.method).toBe("monthly-rebalanced-cash-zero-v1");
    const next = saveReturnComparison(value, record, LATER);
    expect(next.selectedAlternativeId).toBe(value.selectedAlternativeId);
    expect(next.alternatives).toEqual(value.alternatives);
    expect(validateStudioProject(next)).toEqual([]);
    expect(next.returnComparisons![0]).not.toBe(record);
  });

  it("refuses to save fewer than two months, or without a name and reason", () => {
    const input = comparisonInput(project());
    const short = { ...input, period: { start: input.period.start, months: 1 }, series: input.series.map((item) => ({ ...item, values: item.values.slice(0, 1), accessions: item.accessions?.slice(0, 1) ?? null })) };
    expect(() => createSavedComparison(short, "One month", "Too short", NOW)).toThrow(/at least 2 months/);
    expect(() => createSavedComparison(input, " ", "Reason", NOW)).toThrow(/Name/);
    expect(() => createSavedComparison(input, "Name", " ", NOW)).toThrow(/why/);
  });

  it("keeps at most twenty", () => {
    let value = project();
    for (let i = 0; i < MAX_SAVED_COMPARISONS; i++) value = saveReturnComparison(value, { ...saved(value), id: `comparison-${i}` }, LATER);
    expect(() => saveReturnComparison(value, { ...saved(value), id: "comparison-extra" }, LATER)).toThrow(/at most 20/);
    expect(removeReturnComparison(value, "comparison-3", LATER).returnComparisons).toHaveLength(MAX_SAVED_COMPARISONS - 1);
  });
});

describe("reopening a comparison", () => {
  it("reproduces its results from its own data after the inputs change or disappear", () => {
    const base = project();
    const value = saveReturnComparison(base, saved(base), LATER);
    const record = value.returnComparisons![0];
    // Edit an allocation, remove the import, and change today's public data.
    const edited = {
      ...value,
      alternatives: value.alternatives.map((item) => item.id === "alt-second" ? { ...item, positions: item.positions.map((position) => ({ ...position, targetWeightPct: 40 })) } : item),
      returnHistories: [],
    };
    const again = computeComparison(record.input);
    if (!again.ok) throw new Error(again.error);
    expect(again.a.periodReturn).toBe(record.results.a.periodReturn);
    expect(again.b.volatility).toBe(record.results.b.volatility);
    expect(validateStudioProject(edited)).toEqual([]);
    expect(edited.returnComparisons![0]).toEqual(record);
    const changes = comparisonChanges(edited, record);
    expect(changes.affects).toEqual([
      "“More VTI” now has different weights, starting amount or reserve.",
      "Your imported history for AAPL has been removed.",
    ]);
  });

  it("notes a rename, and ignores an unrelated scenario, without calling either a change to the numbers", () => {
    const base = project();
    const value = saveReturnComparison(base, saved(base), LATER);
    const renamed = { ...addScenario(value, FIRST_SCENARIO_ID, LATER, "scenario-2"), alternatives: value.alternatives.map((item, i) => i === 0 ? { ...item, name: "Half and half" } : item) };
    expect(comparisonChanges(renamed, value.returnComparisons![0])).toEqual({ affects: [], notes: ["“Even split” is now called “Half and half”."] });
  });

  it("flags a history whose values for these months changed", () => {
    const base = project();
    const value = saveReturnComparison(base, saved(base), LATER);
    const revised = { ...value, returnHistories: value.returnHistories!.map((history) => ({ ...history, observations: history.observations.map((row, i) => i === 2 ? { ...row, value: 0.05 } : row) })) };
    expect(comparisonChanges(revised, value.returnComparisons![0]).affects).toEqual(["The history for AAPL now has different values for these months."]);
  });
});

describe("untrusted backups", () => {
  it("round-trips a saved comparison, and still accepts a backup without any", () => {
    const value = saveReturnComparison(project(), saved(), LATER);
    const backup = exportProjectBackup(value);
    if (!backup.ok) throw new Error(backup.error);
    const restored = importProjectBackup(backup.raw);
    expect(restored.ok && restored.project.returnComparisons).toEqual(value.returnComparisons);
    const { returnComparisons: _none, ...older } = value;
    expect(validateStudioProject(older)).toEqual([]);
  });

  it.each([
    ["a pasted result", (record: ReturnType<typeof saved>) => ({ ...record, results: { ...record.results, a: { ...record.results.a, periodReturn: record.results.a.periodReturn + 0.01 } } })],
    ["an edited observation", (record: ReturnType<typeof saved>) => ({ ...record, input: { ...record.input, series: record.input.series.map((item, i) => i === 0 ? { ...item, values: item.values.map((v, t) => t === 0 ? v + 0.01 : v) } : item) } })],
    ["a missing history", (record: ReturnType<typeof saved>) => ({ ...record, input: { ...record.input, series: record.input.series.slice(0, 1) } })],
    ["another method", (record: ReturnType<typeof saved>) => ({ ...record, method: "annualized-v2" })],
    ["a cash return", (record: ReturnType<typeof saved>) => ({ ...record, cashReturnPct: 0.3 })],
    ["an unknown field", (record: ReturnType<typeof saved>) => ({ ...record, forecast: 0.07 })],
    ["a weight over 100%", (record: ReturnType<typeof saved>) => ({ ...record, input: { ...record.input, a: { ...record.input.a, positions: record.input.a.positions.map((p) => ({ ...p, targetWeightPct: 80 })) } } })],
  ])("refuses %s", (_label, tamper) => {
    const record = tamper(saved());
    expect(validSavedComparison(record)).toBe(false);
    const value = { ...project(), returnComparisons: [record] } as unknown as StudioProject;
    expect(validateStudioProject(value)).toContainEqual(expect.stringMatching(/^Saved return comparisons/));
  });

  it("keeps practice and personal comparisons apart", () => {
    const practice = saveReturnComparison(project(), saved(), LATER);
    const personal = createStudioProject("personal", NOW);
    expect(personal.returnComparisons).toBeUndefined();
    expect(practice.mode).toBe("practice");
  });
});

describe("a save that fails", () => {
  it("keeps the unsaved comparison and the last saved project when storage is full", async () => {
    let stored: StoredProject | null = null;
    let full = false;
    const storage: ProjectStorage = {
      read: async (): Promise<StorageResult<StoredProject | null>> => ({ ok: true, value: stored }),
      write: async (mode, raw): Promise<StorageResult<StoredProject>> => {
        if (full) return { ok: false, code: "quota", error: "This browser has no room to save the project. Your last saved version is unchanged; download a backup of your unsaved work." };
        stored = { mode, raw, revision: crypto.randomUUID() };
        return { ok: true, value: stored };
      },
      recovery: async () => ({ ok: true, value: [] }),
      subscribe: () => () => undefined,
      close: () => undefined,
    };
    const session = createProjectSession(storage, "practice");
    await session.reload();
    // An edit may not change the project's identity, so keep the session's own.
    expect(await session.update((current) => ({ ...project(), id: current.id, createdAt: current.createdAt }))).toEqual({ ok: true });
    full = true;
    const result = await session.update((current) => saveReturnComparison(current, saved(current), LATER));
    expect(result).toMatchObject({ ok: false, code: "quota" });
    expect(session.getSnapshot().project?.returnComparisons).toHaveLength(1);
    expect(session.getSnapshot().dirty).toBe(true);
    expect(JSON.parse(stored!.raw).returnComparisons).toBeUndefined();
  });
});
