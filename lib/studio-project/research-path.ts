/**
 * The order to research a company in, and how far a learner has got.
 *
 * Research grew one surface at a time — the industry, the figures, the reader,
 * the map, the forces, the value stick, the profit pool — and each was linked
 * from the Research page as an equal. A first-time learner met seven doors and
 * no hallway: nothing said where to start, which pages need a company first, or
 * what comes after the one in front of them.
 *
 * The order is the one the sources already give. The handoff's first complete
 * journey runs find → understand → investigate → test explanations → value →
 * decide (§9), and *Measuring the Moat* goes from the industry, to where the
 * money is made in it, to the forces, to what a firm does differently. It also
 * suits what each page teaches: return on capital is read across an industry
 * before a learner is asked to work one out, and passages are kept from the
 * report before the map, the forces and the value stick ask for them as
 * evidence.
 *
 * Status is read from the saved project, never stored. The first two steps save
 * nothing, so they have no status: they are reading, not work.
 */

import { FIGURES } from "./investigate";
import { isHeld, latestInvestigation, type FigureInvestigation, type StudioProject } from "./schema";

export type StepKey = "industry" | "pool" | "numbers" | "report" | "map" | "competition" | "value" | "decide";

export interface ResearchStep {
  key: StepKey;
  /** The page's heading, and the step's name everywhere it appears. An instruction, in plain words. */
  title: string;
  /** For the row of steps, where eight have to fit side by side. */
  short: string;
  /** Where the step's page is. The report step is sent to the company's own reports when it has them. */
  href: string;
  /** Every route that belongs to this step, so the reader's pages count as step 4. */
  covers: string[];
  /** What to do on the page, said once, as the learner will do it. */
  todo: string;
  /** Whether the step needs a company chosen in step 3 before it can be done. */
  needsCompany: boolean;
}

export const RESEARCH_STEPS: ResearchStep[] = [
  {
    key: "industry",
    title: "See who is in an industry",
    short: "Industry",
    href: "/studio/industry",
    covers: ["/studio/industry"],
    todo: "Pick one of the five industries. See who holds the most of it, how much that has moved, and how each company earns its return.",
    needsCompany: false,
  },
  {
    key: "pool",
    title: "See where the money is made",
    short: "Money",
    href: "/studio/pool",
    covers: ["/studio/pool"],
    todo: "Pick an industry and find which companies earn more than their capital costs.",
    needsCompany: false,
  },
  {
    key: "numbers",
    title: "Choose a company and check its numbers",
    short: "Numbers",
    href: "/studio/investigate",
    covers: ["/studio/investigate"],
    todo: "Fill in seven figures from its annual report, or press Fill these from the SEC, and read what they say.",
    needsCompany: false,
  },
  {
    key: "report",
    title: "Read its annual report",
    short: "Report",
    href: "/studio/filings",
    covers: ["/studio/filings"],
    todo: "Open its latest annual report and read what the business does and what could go wrong. Press Keep beside any paragraph worth coming back to.",
    needsCompany: true,
  },
  {
    key: "map",
    title: "Map who it deals with",
    short: "Map",
    href: "/studio/map",
    covers: ["/studio/map"],
    todo: "Add who it buys from, who buys from it and who it competes with, and say how each one reaches its profits.",
    needsCompany: true,
  },
  {
    key: "competition",
    title: "Test its competition",
    short: "Competition",
    href: "/studio/competition",
    covers: ["/studio/competition"],
    todo: "Pick one of the five forces — the five things that press on what any business can earn — and answer one of its questions about this company.",
    needsCompany: true,
  },
  {
    key: "value",
    title: "Find where its value comes from",
    short: "Value",
    href: "/studio/value",
    covers: ["/studio/value"],
    todo: "Pull the levers on the made-up example, then argue which one works for this company.",
    needsCompany: true,
  },
  {
    key: "decide",
    title: "Decide: own it or turn it down",
    short: "Decide",
    href: "/studio/decide",
    covers: ["/studio/decide"],
    todo: "Look back over what you found. Add the company to your portfolio, or turn it down with your reason. Either way the work is kept.",
    needsCompany: true,
  },
];

const within = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/** The step a page belongs to, or undefined for a page outside the path. */
export function stepFor(pathname: string): ResearchStep | undefined {
  return RESEARCH_STEPS.find((step) => step.covers.some((base) => within(pathname, base)));
}

/** A step's 1-based position, for "Step 3 of 8". */
export const stepNumber = (key: StepKey): number => RESEARCH_STEPS.findIndex((step) => step.key === key) + 1;

export interface StepStatus {
  /** Whether the step's work is saved. Always false for the two reading steps, which save nothing. */
  done: boolean;
  /** What has been saved, in a few words, or empty when nothing has. */
  note: string;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** How many of the seven figures are in. */
export function figuresIn(investigation: FigureInvestigation): number {
  return FIGURES.filter((figure) => Number.isFinite(investigation.figures[figure.key])).length;
}

/** Whether the company has been added to a portfolio or turned down. */
export function decision(project: StudioProject, investigation: FigureInvestigation): "held" | "turned down" | null {
  const instrumentId = `own-${investigation.id}`;
  if (isHeld(project, instrumentId)) return "held";
  const candidate = project.candidates.find((item) => item.instrumentId === instrumentId);
  return candidate?.status === "rejected" ? "turned down" : null;
}

/** Each step's status for the company being researched. */
export function stepStatuses(
  project: StudioProject | null | undefined,
  investigation: FigureInvestigation | undefined,
): Record<StepKey, StepStatus> {
  const none = { done: false, note: "" };
  const statuses: Record<StepKey, StepStatus> = {
    industry: none,
    pool: none,
    numbers: none,
    report: none,
    map: none,
    competition: none,
    value: none,
    decide: none,
  };
  if (!project || !investigation) return statuses;

  const figures = figuresIn(investigation);
  const passages = investigation.passages?.length ?? 0;
  const entries = investigation.mapEntries?.length ?? 0;
  const findings = investigation.forces?.length ?? 0;
  const claims = investigation.valueClaims?.length ?? 0;
  const decided = decision(project, investigation);
  return {
    ...statuses,
    numbers: { done: figures === FIGURES.length, note: `${figures} of ${FIGURES.length} figures` },
    report: { done: passages > 0, note: passages ? count(passages, "passage kept", "passages kept") : "" },
    map: { done: entries > 0, note: entries ? count(entries, "on the map", "on the map") : "" },
    competition: { done: findings > 0, note: findings ? count(findings, "finding", "findings") : "" },
    value: { done: claims > 0, note: claims ? count(claims, "lever argued", "levers argued") : "" },
    decide: { done: decided !== null, note: decided ?? "" },
  };
}

/** The company the path is about: the one most recently worked on. */
export const pathCompany = (project: StudioProject | null | undefined): FigureInvestigation | undefined =>
  project ? latestInvestigation(project) : undefined;

/**
 * Where a learner should go next.
 *
 * With no company yet, the start. With one, the first step from the numbers on
 * whose work is not saved — so someone who skipped the industry is not sent
 * back to it, and someone who has done everything is sent to the decision.
 */
export function nextStep(project: StudioProject | null | undefined): ResearchStep {
  const investigation = pathCompany(project);
  if (!investigation) return RESEARCH_STEPS[0];
  const statuses = stepStatuses(project, investigation);
  return RESEARCH_STEPS.slice(2).find((step) => !statuses[step.key].done) ?? RESEARCH_STEPS[RESEARCH_STEPS.length - 1];
}

/** The step after this one, or null after the last. */
export function stepAfter(key: StepKey): ResearchStep | null {
  const index = RESEARCH_STEPS.findIndex((step) => step.key === key);
  return RESEARCH_STEPS[index + 1] ?? null;
}

/** The step before this one, or null before the first. */
export function stepBefore(key: StepKey): ResearchStep | null {
  const index = RESEARCH_STEPS.findIndex((step) => step.key === key);
  return index > 0 ? RESEARCH_STEPS[index - 1] : null;
}

/** A step's address for this company: its reports go straight to its own list when the SEC knows it. */
export function stepHref(step: ResearchStep, investigation: FigureInvestigation | undefined): string {
  if (step.key === "report" && investigation?.source?.cik) return `/studio/filings/${investigation.source.cik}`;
  return step.href;
}
