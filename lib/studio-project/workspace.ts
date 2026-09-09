import { exportStudioText, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG, type StudioInstrument } from "@/lib/studio-catalog";
import { startCandidate, updateCandidate } from "./operations";
import {
  candidateStanding,
  findCandidate,
  workingAlternative,
  type CandidateStatus,
  type StudioProject,
} from "./schema";

/** Plain words for a standing, so a downloaded plan reads like a sentence. */
const STANDING_LABEL: Record<CandidateStatus, string> = {
  selected: "in the portfolio",
  shortlisted: "shortlisted",
  rejected: "decided against",
  researching: "still looking into it",
};

/**
 * The catalogue this project computes against: Studio's eight, plus the
 * companies the learner added from their own investigations.
 *
 * Every field Studio would otherwise assert about an investment is empty here,
 * and each absence is load-bearing rather than lazy. No reference price,
 * because nobody published one — the learner enters a dated broker quote, which
 * is what the buying worksheet already asks of every holding. No fee, because a
 * company is not a fund and a zero would read as "free". No risks, because the
 * catalogue's risks are quoted from a filing and inventing a list would be the
 * one thing this product must never do.
 *
 * The exposure is the company itself, at 100%. That is not a placeholder: for a
 * single business the overlap check has exactly one issuer to report, and
 * saying so is what lets a learner see when a fund they hold already owns it.
 */
export function projectCatalog(project: StudioProject): StudioInstrument[] {
  const own = (project.instruments ?? []).map<StudioInstrument>((instrument) => ({
    id: instrument.id,
    symbol: instrument.name,
    name: instrument.name,
    kind: "stock",
    assetClass: instrument.assetClass,
    expenseRatioPct: null,
    referencePrice: null,
    priceAsOf: "",
    quantityStep: 1,
    minimumUnits: 1,
    exposures: [{ label: instrument.name, weightPct: 100 }],
    exposureCoveragePct: 100,
    bond: null,
    stock: null,
    sources: [],
    whatItIs: "A company you investigated yourself. Studio holds your figures for it, and nothing else.",
    mainRisks: [],
  }));
  return [...STUDIO_CATALOG, ...own];
}

/** A calculation view, never the stored record. Research remains project-owned. */
export function projectToPlan(project: StudioProject): StudioPlan {
  const alternative = workingAlternative(project);
  return {
    schemaVersion: 1, id: project.id, name: project.name, mode: project.mode,
    createdAt: project.createdAt, updatedAt: project.updatedAt,
    goal: { ...project.goal }, rules: { ...project.rules }, stress: { ...project.stress },
    currentCash: alternative?.currentCash ?? 0,
    contributionAmount: alternative?.contributionAmount ?? 0,
    holdings: (alternative?.positions ?? []).map((position) => {
      const candidate = findCandidate(project, position.instrumentId);
      return { ...position, research: {
        why: candidate?.why ?? "", mainRisk: candidate?.mainRisk ?? "",
        whatWouldChangeMyMind: candidate?.whatWouldChangeMyMind ?? "",
        reviewedSources: candidate?.reviewedSources ?? false,
      } };
    }),
  };
}

/** Apply existing form/calculator edits to the current alternative only. */
export function applyPlanChange(project: StudioProject, change: (plan: StudioPlan) => StudioPlan): StudioProject {
  const before = projectToPlan(project);
  const after = change(before);
  const alternative = workingAlternative(project);
  let next = { ...project, goal: after.goal, rules: after.rules, stress: after.stress };
  for (const holding of after.holdings) {
    next = startCandidate(next, holding.instrumentId);
    /*
     * Compared against the candidate's own notes, not against the previous plan.
     *
     * The rule being protected is that adding a position must not wipe an
     * earlier investigation: a holding arrives from `addStudioHolding` with an
     * empty research block, and writing that over a candidate carrying real
     * notes would delete them. The old guard achieved it by only ever updating
     * a holding that already existed — which also silently dropped research
     * written in the same change as the holding it belongs to. Nothing in the
     * interface does both at once today, so it never showed; anything shaped
     * like "decide against this, and here is why" would have hit it at once.
     *
     * Stating the rule directly keeps the protection and loses the side effect:
     * write what differs, except a blank block over notes that exist.
     */
    const existing = findCandidate(next, holding.instrumentId);
    const stored = {
      why: existing?.why ?? "",
      mainRisk: existing?.mainRisk ?? "",
      whatWouldChangeMyMind: existing?.whatWouldChangeMyMind ?? "",
      reviewedSources: existing?.reviewedSources ?? false,
    };
    const incoming = holding.research;
    const wouldErase =
      !incoming.why.trim() && !incoming.mainRisk.trim() && !incoming.whatWouldChangeMyMind.trim()
      && Boolean(stored.why || stored.mainRisk || stored.whatWouldChangeMyMind);
    if (!wouldErase && JSON.stringify(stored) !== JSON.stringify(incoming)) {
      next = updateCandidate(next, holding.instrumentId, incoming);
    }
  }
  return { ...next, alternatives: next.alternatives.map((item) => item.id === alternative?.id ? {
    ...item, updatedAt: new Date().toISOString(), currentCash: after.currentCash,
    contributionAmount: after.contributionAmount,
    positions: after.holdings.map(({ research: _research, ...position }) => position),
  } : item) };
}

export function exportProjectText(project: StudioProject): string {
  const alternatives = project.alternatives.map((alternative) =>
    `PORTFOLIO: ${alternative.name}\n${alternative.reasoning}\n${exportStudioText(projectToPlan({ ...project, selectedAlternativeId: alternative.id }), projectCatalog(project))}`,
  );
  /*
   * A line is printed when it has something in it.
   *
   * "Open questions:" and "Reason rejected:" were printed against every
   * candidate and were always empty, because nothing could fill either. Blank
   * headings do not read as "none recorded"; they read as a form somebody
   * failed to complete, which is a poor thing to hand someone defending a
   * decision.
   */
  // The project's own catalogue, so a company the learner added reads by name
  // rather than as the internal id it is stored under.
  const named = new Map(projectCatalog(project).map((instrument) => [instrument.id, instrument.name]));
  const research = project.candidates.map((candidate) => {
    const name = named.get(candidate.instrumentId) ?? candidate.instrumentId;
    const lines = [
      `${name} — ${STANDING_LABEL[candidateStanding(project, candidate.instrumentId)]}`,
      candidate.why && `Why: ${candidate.why}`,
      candidate.mainRisk && `Main risk: ${candidate.mainRisk}`,
      candidate.whatWouldChangeMyMind && `What would change my mind: ${candidate.whatWouldChangeMyMind}`,
      candidate.openQuestions.length > 0 && `Open questions: ${candidate.openQuestions.join("; ")}`,
      candidate.rejectedBecause && `Reason decided against: ${candidate.rejectedBecause}`,
      ...candidate.evidence.map(
        (evidence) => `${evidence.role}: ${evidence.sourceId}, ${evidence.locator}\n${evidence.note}`,
      ),
    ];
    return lines.filter(Boolean).join("\n");
  });
  return [...alternatives, "ALL RESEARCH (INCLUDING INVESTMENTS NOT HELD)", ...research,
    "DECISIONS", ...project.decisions.map((decision) => `${decision.at}: ${decision.summary}\n${decision.reason}`),
  ].join("\n\n");
}
