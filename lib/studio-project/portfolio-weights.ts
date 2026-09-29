import { calculateStudio, type StudioCalculation, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { checkPortfolio, type PortfolioChecks } from "./limit-checks";
import { readLimits } from "./limits";
import { workingAlternative, type PortfolioAlternative, type StudioProject } from "./schema";
import { readInput, validValuationCase, valuationResult, type ValuationCase } from "./valuation-cases";
import { validateStudioProject } from "./validate";
import { projectCatalog, projectToPlan } from "./workspace";

const ticker = (value: string) => value.trim().toUpperCase();
const companyName = (value: string) => value.trim().toLocaleLowerCase("en-US");
const cik = (value: string) => /^\d+$/.test(value.trim()) ? value.trim().replace(/^0+/, "") : "";
const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

/**
 * Match only identities already established in this project or the catalog.
 * A name resemblance or a shared issuer with a different listed share is not
 * enough. This offers choices; it never attaches a valuation automatically.
 */
export function eligibleValuations(project: StudioProject, instrumentId: string): ValuationCase[] {
  const catalog = STUDIO_CATALOG.find((item) => item.id === instrumentId);
  const own = (project.instruments ?? []).find((item) => item.id === instrumentId);
  if (catalog?.kind !== "stock" && !own) return [];
  const investigation = own ? project.investigations.find((item) => item.id === own.investigationId) : undefined;
  if (!catalog && !investigation) return [];
  const knownTicker = catalog ? ticker(catalog.symbol) : ticker(investigation?.source?.ticker ?? "");
  const knownCiks = [...new Set((catalog
    ? catalog.sources.map((source) => source.url.match(/^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\/(\d+)\//)?.[1] ?? "")
    : [investigation?.source?.cik ?? "", ...(investigation?.passages ?? []).map((passage) => passage.cik)]
  ).map(cik).filter(Boolean))];
  // The catalog explicitly identifies ordinary common stock as one company
  // share; a missing ratio for an otherwise unknown listing proves nothing.
  const knownRatio = catalog?.stock?.adsRatio ?? (catalog?.stock?.usListing === "Ordinary common stock" ? 1 : null);
  return (project.valuations ?? []).filter((record) => {
    if (!validValuationCase(record) || record.example || !valuationResult(record).ok) return false;
    if (knownTicker && ticker(record.ticker) !== knownTicker) return false;
    if (knownCiks.length && !knownCiks.every((known) => cik(record.cik) === known)) return false;
    if (!knownTicker && !knownCiks.length && (!companyName(record.company) || companyName(record.company) !== companyName(investigation?.company ?? ""))) return false;
    return knownRatio === null || readInput(record.inputs.receipt) === knownRatio;
  });
}

/** Calculate a saved alternative or an unsaved preview with the existing engine. */
export function allocationView(project: StudioProject, alternative: PortfolioAlternative): {
  plan: StudioPlan; calculation: StudioCalculation; checks: PortfolioChecks;
} {
  const plan = projectToPlan({ ...project, alternatives: [alternative], selectedAlternativeId: alternative.id });
  const calculation = calculateStudio(plan, projectCatalog(project));
  return { plan, calculation, checks: checkPortfolio(plan, calculation, readLimits(project)) };
}

export interface WeightProposalEdits {
  name: string;
  reasoning: string;
  /** Omitted positions keep the latest saved weight. Blank is not zero. */
  weights: Record<string, string>;
  /** Omitted links keep their snapshot; an empty id explicitly removes one. */
  valuationCaseIds: Record<string, string>;
}

export function comparisonBasis(project: StudioProject) {
  return structuredClone({ goal: project.goal, limits: readLimits(project), stress: project.stress });
}

/** JSON object member order can change during an import without changing any input. */
function sameInputs(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length
      && left.every((item, index) => sameInputs(item, right[index]));
  }
  const before = left as Record<string, unknown>;
  const after = right as Record<string, unknown>;
  const keys = Object.keys(before);
  return keys.length === Object.keys(after).length
    && keys.every((key) => Object.prototype.hasOwnProperty.call(after, key) && sameInputs(before[key], after[key]));
}

export function comparisonNeedsReview(project: StudioProject, alternative: PortfolioAlternative) {
  return alternative.comparisonBasis !== undefined && !sameInputs(alternative.comparisonBasis, comparisonBasis(project));
}

export type BasisPart = "goal" | "limits" | "scenario";

/**
 * The allocation the learner chose, once the goal, limits or scenario it was
 * compared under have changed: named on Goals, where such a change is made,
 * by the same rule Compare allocations uses. Only an allocation someone chose
 * -- which left a decision behind -- is named.
 */
export function chosenBeforeChange(project: StudioProject): { name: string; chosenAt: string; changed: BasisPart[] } | null {
  const chosen = project.alternatives.find((item) => item.id === project.selectedAlternativeId);
  const basis = chosen?.comparisonBasis;
  if (!chosen || !basis) return null;
  const decision = [...project.decisions].reverse().find((item) => item.affects.at(-1) === chosen.id);
  if (!decision) return null;
  const now = comparisonBasis(project);
  const changed = ([
    ["goal", sameInputs(basis.goal, now.goal)],
    ["limits", sameInputs(basis.limits, now.limits)],
    ["scenario", sameInputs(basis.stress, now.stress)],
  ] as const).filter(([, same]) => !same).map(([part]) => part);
  return changed.length ? { name: chosen.name, chosenAt: decision.at, changed } : null;
}

/** Proposals may change weights, but cannot restore outdated buying inputs. */
export function holdingInputsChanged(project: StudioProject, alternative: PortfolioAlternative) {
  const selected = workingAlternative(project);
  if (!selected) return true;
  const inputs = (item: PortfolioAlternative) => ({ currentCash: item.currentCash, contributionAmount: item.contributionAmount,
    positions: item.positions.map(({ targetWeightPct: _weight, ...position }) => position).sort((a, b) => a.instrumentId.localeCompare(b.instrumentId)) });
  return !sameInputs(inputs(selected), inputs(alternative));
}

function assertValid(project: StudioProject): StudioProject {
  const issues = validateStudioProject(project);
  if (issues.length) throw new Error(issues.join(" "));
  return project;
}

/**
 * Call inside the session's update queue so the source and valuation records
 * are read at save time. Keep the original and the selected alternative intact.
 */
export function saveWeightProposal(
  project: StudioProject,
  sourceId: string,
  edits: WeightProposalEdits,
  now = new Date().toISOString(),
  expectedSourceUpdatedAt?: string,
): StudioProject {
  const source = project.alternatives.find((item) => item.id === sourceId);
  if (!source) throw new Error("The portfolio you were comparing is no longer available.");
  if (expectedSourceUpdatedAt !== undefined && source.updatedAt !== expectedSourceUpdatedAt) {
    throw new Error("This portfolio changed while you were editing. Reopen it before saving your proposed weights.");
  }
  if (!edits.name.trim() || edits.name.length > 300) throw new Error("Give these proposed weights a name of up to 300 characters.");
  if (!source.positions.length) throw new Error("Add a holding before saving proposed weights.");
  const held = new Set(source.positions.map((position) => position.instrumentId));
  if ([...Object.keys(edits.weights), ...Object.keys(edits.valuationCaseIds)].some((id) => !held.has(id))) {
    throw new Error("A proposed weight or valuation belongs to a holding that is no longer in this portfolio.");
  }
  const positions = source.positions.map((position) => {
    const input = edits.weights[position.instrumentId];
    const weight = input === undefined ? position.targetWeightPct : readInput(input);
    if (!Number.isFinite(weight) || weight < 0 || weight > 100) throw new Error("Every weight must be a number from 0% to 100%. A blank weight is unfinished.");
    return { ...position, targetWeightPct: weight };
  });
  if (positions.reduce((sum, position) => sum + position.targetWeightPct, 0) > 100) {
    throw new Error("The proposed weights exceed 100% of the money available after the cash reserve.");
  }
  const links = new Map((source.valuationLinks ?? []).map((link) => [link.instrumentId, structuredClone(link)]));
  for (const [instrumentId, caseId] of Object.entries(edits.valuationCaseIds)) {
    if (!caseId) { links.delete(instrumentId); continue; }
    const record = eligibleValuations(project, instrumentId).find((item) => item.id === caseId);
    if (!record) throw new Error("A selected valuation no longer matches this holding or needs its inputs completed. Review it before saving.");
    links.set(instrumentId, { instrumentId, snapshot: structuredClone(record) });
  }
  const proposal: PortfolioAlternative = {
    ...source, id: makeId("alt"), name: edits.name.trim(), reasoning: edits.reasoning,
    createdAt: now, updatedAt: now, positions, valuationLinks: [...links.values()], comparisonBasis: comparisonBasis(project),
  };
  const { calculation } = allocationView(project, proposal);
  if (!calculation.valid) throw new Error(calculation.issues.join(" "));
  return assertValid({ ...project, updatedAt: now, alternatives: [...project.alternatives, proposal] });
}

/** Select a saved construction and retain both its reason and the previous id. */
export function chooseWeightProposal(
  project: StudioProject,
  id: string,
  reason: string,
  now = new Date().toISOString(),
): StudioProject {
  const proposal = project.alternatives.find((item) => item.id === id);
  if (!proposal) throw new Error("These proposed weights are no longer available.");
  if (holdingInputsChanged(project, proposal)) throw new Error("Holdings or buying inputs changed. Start a fresh proposal from the selected allocation.");
  if (comparisonNeedsReview(project, proposal)) throw new Error("Goals, limits or scenario assumptions changed. Review and save a fresh proposal before choosing it.");
  if (!reason.trim() || reason.length > 20_000) throw new Error("Record why you are choosing these weights.");
  const { calculation } = allocationView(project, proposal);
  if (!calculation.valid) throw new Error(calculation.issues.join(" "));
  if (project.selectedAlternativeId === id) return project;
  const previous = workingAlternative(project);
  return assertValid({
    ...project, updatedAt: now, selectedAlternativeId: id,
    decisions: [...project.decisions, {
      id: makeId("decision"), at: now,
      summary: `Chose ${proposal.name}${previous ? ` instead of ${previous.name}` : ""}.`,
      reason: reason.trim(), affects: [...new Set([...(previous ? [previous.id] : []), id])],
    }],
  });
}
