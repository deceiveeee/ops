/**
 * A saved comparison read against today: every history an investment has now,
 * and what has changed since a comparison was saved.
 *
 * Apart from the calculation and the saved-record checks, so that reading or
 * validating a project never loads the public return bundle.
 */
import publicReturns from "./data/fund-total-returns.json";
import { allocationSnapshot, periodMonths, type HistoryOption, type SeriesSnapshot } from "./return-comparison";
import type { SavedReturnComparison } from "./return-comparison-saved";
import type { StudioProject } from "./schema";
import { historyProblem, type ReturnBasis, type ReturnHistory } from "./total-returns";

type PublicHistory = (typeof publicReturns.histories)[number];

function publicOption(history: PublicHistory): HistoryOption {
  return {
    key: `public:${history.instrumentId}`,
    instrumentId: history.instrumentId,
    kind: "public",
    label: `${history.symbol} · fund's own SEC reports`,
    sourceName: `${history.name}, SEC Form N-PORT monthly total returns (series ${history.seriesId}, class ${history.classId})`,
    sourceUrl: history.sources[0]?.url ?? "",
    currency: history.currency,
    basis: history.basis as ReturnBasis,
    method: "reported-total-return",
    seriesId: history.seriesId,
    classId: history.classId,
    importedAt: null,
    builtOn: publicReturns.builtOn,
    observations: history.observations.map(({ month, value }) => ({ month, value })),
    accessions: Object.fromEntries(history.observations.map((row) => [row.month, row.accession])),
  };
}

function importOption(history: ReturnHistory, symbol: string): HistoryOption {
  return {
    key: `import:${history.id}`,
    instrumentId: history.instrumentId,
    kind: "import",
    label: `${symbol} · ${history.sourceName} · your import`,
    sourceName: history.sourceName,
    sourceUrl: history.sourceUrl,
    currency: history.currency,
    basis: history.basis,
    method: history.method,
    seriesId: null,
    classId: null,
    importedAt: history.importedAt,
    builtOn: null,
    observations: history.observations.map(({ month, value }) => ({ month, value })),
    accessions: null,
  };
}

/**
 * Every history that is exactly this investment. The public bundle is keyed by
 * the catalog's own fund id and class; an import names its investment when it
 * is made. A matching ticker on some other listing never qualifies.
 */
export function historyOptions(project: Pick<StudioProject, "returnHistories">, instrumentId: string, symbol = instrumentId): HistoryOption[] {
  return [
    ...publicReturns.histories.filter((history) => history.instrumentId === instrumentId).map(publicOption),
    ...(project.returnHistories ?? []).filter((history) => history.instrumentId === instrumentId && historyProblem(history.observations) === null).map((history) => importOption(history, symbol)),
  ];
}

const symbolOf = (series: SeriesSnapshot) => series.label.split(" · ")[0];

/**
 * What differs today from a saved comparison's inputs. `affects` lists changes
 * that would change its numbers; `notes` lists ones that would not, such as a
 * renamed allocation. The saved record itself is never refreshed.
 */
export function comparisonChanges(project: Pick<StudioProject, "goal" | "alternatives" | "returnHistories">, saved: SavedReturnComparison): { affects: string[]; notes: string[] } {
  const affects: string[] = [];
  const notes: string[] = [];
  for (const side of [saved.input.a, saved.input.b]) {
    const current = project.alternatives.find((item) => item.id === side.alternativeId);
    if (!current) { affects.push(`“${side.name}” is no longer saved.`); continue; }
    const now = allocationSnapshot(project, current);
    const sameWeights = now.budget === side.budget && now.cashReserve === side.cashReserve && now.positions.length === side.positions.length
      && now.positions.every((position) => side.positions.some((was) => was.instrumentId === position.instrumentId && was.targetWeightPct === position.targetWeightPct));
    if (!sameWeights) affects.push(`“${side.name}” now has different weights, starting amount or reserve.`);
    if (now.name !== side.name) notes.push(`“${side.name}” is now called “${now.name}”.`);
  }
  const months = periodMonths(saved.input.period);
  for (const item of saved.input.series) {
    const today = historyOptions(project, item.instrumentId).find((option) => option.key === item.key);
    if (!today) {
      affects.push(item.kind === "import" ? `Your imported history for ${symbolOf(item)} has been removed.` : `The public history for ${symbolOf(item)} is no longer available.`);
      continue;
    }
    const byMonth = new Map(today.observations.map((row) => [row.month, row.value]));
    if (months.some((month, t) => byMonth.get(month) !== item.values[t])) affects.push(`The history for ${symbolOf(item)} now has different values for these months.`);
  }
  return { affects, notes };
}
