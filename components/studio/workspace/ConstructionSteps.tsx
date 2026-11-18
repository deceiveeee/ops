"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { calculateStudio, scenarioResult, type StudioCalculation, type StudioHolding, type StudioPlan } from "@/lib/studio";
import type { StudioInstrument } from "@/lib/studio-catalog";
import {
  buildPortfolio, emptyBuild, lookThrough, MAX_COMPARED_MIXES, mixFromLimits, mixRange, mixScenarioPct, neededReturn,
  PART_NAMES, PARTS, partOf, pickPart, rangeVerdict, readBuild, readConstruction, startingPoint, storedWeights,
  type AlternativeBuild, type ComparedMix, type Mix, type MixRange, type PartId, type StudioConstruction,
} from "@/lib/studio-project/construction";
import { checkPortfolio } from "@/lib/studio-project/limit-checks";
import { removePosition } from "@/lib/studio-project/operations";
import { checkTargets, lossBudget, readLimits, setLimits, SLICE_NAMES, SLICES, type SliceId, type StudioLimits } from "@/lib/studio-project/limits";
import { readScenarios } from "@/lib/studio-project/scenarios";
import { workingAlternative, type StudioProject } from "@/lib/studio-project/schema";
import LimitChecks from "../LimitChecks";
import { Field, useBufferedInput } from "../shared";
import StudioIcon from "./StudioIcon";
import { WorkWaiting } from "./StudioFrame";
import ViewTabs from "./ViewTabs";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./working-pages.module.css";
import own from "./construction-steps.module.css";

/*
 * Steps 3 to 7 of the nine: the mix, the split inside each slice, the fund for
 * each part, any picks, and a check of the whole. Plan and sources:
 * docs/design/studio-portfolio-top-down-plan-2026-11-16.md. Every percentage
 * is a share of the whole portfolio, cash included. Holdings' weights are
 * worked out from these choices (lib/studio-project/construction.ts); nothing
 * here asks for a percentage per fund.
 */

/** "Ready", "Ready and Grow", "Ready, Steady and Grow". */
const listed = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0] ?? "");
const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (value: number, digits = 2) => `${Number(value.toFixed(digits))}%`;
const SLICE_COLOURS: Record<SliceId, string> = { ready: "#8f9985", steady: "#bfb1e5", grow: "#d5f39e" };
const PART_COLOURS: Record<PartId, string> = { "us-stocks": "#d5f39e", "international-stocks": "#9fc57a", "short-bonds": "#bfb1e5", "longer-bonds": "#9d8bd1" };
const PICKS_COLOUR = "#f2ce92";
const VANGUARD_ESTIMATES = "https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html";

/** A box for a number that may be blank, held to its range rather than refused at save. */
function NumberBox({ label, value, onChange, min = 0, max = 100, unit = "%" }: {
  label: string; value: number | null; onChange: (value: number | null) => unknown; min?: number; max?: number; unit?: string;
}) {
  const buffered = useBufferedInput(value ?? "", (raw) => {
    const trimmed = raw.trim();
    onChange(trimmed === "" || !Number.isFinite(Number(trimmed)) ? null : Math.min(max, Math.max(min, Number(trimmed))));
  });
  return (
    <span className={own.numberBox}>
      <input type="number" inputMode="decimal" min={min} max={max} step="any" aria-label={label} {...buffered} />
      <span aria-hidden="true">{unit}</span>
    </span>
  );
}

/** A short text box labelled for a screen reader, where a visible label would only repeat its placeholder. */
function NameBox({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => unknown }) {
  const buffered = useBufferedInput(value, onChange);
  return <input type="text" aria-label={label} placeholder={placeholder} maxLength={60} className={own.nameBox} {...buffered} />;
}

/** Everything the steps read, worked out once per render from the saved project. */
function useSteps() {
  const workspace = useWorkspace();
  const { project, plan, calculation, catalog, updateProject, session } = workspace;
  if (!project || !plan || !calculation) return { ready: false, loading: session.status === "loading" } as const;
  const limits = readLimits(project);
  const construction = readConstruction(project);
  const alternative = workingAlternative(project);
  const build = alternative?.build ?? null;
  const mix = mixFromLimits(limits);
  const symbol = (id: string) => catalog.find((instrument) => instrument.id === id)?.symbol ?? id;
  const result = buildPortfolio({
    whole: plan.goal.budget, cashKept: plan.goal.cashReserve, mix, build: build ?? emptyBuild(), catalog, names: symbol, companyCapPct: limits.companyCapPct,
  });
  // A portfolio typed by hand: steps 4 to 6 offer to start from it before changing anything.
  const typedByHand = !build && (alternative?.positions ?? []).some((position) => position.targetWeightPct > 0);
  const now = () => new Date().toISOString();
  const setConstruction = (change: (current: StudioConstruction) => StudioConstruction) =>
    updateProject((current) => ({ ...current, updatedAt: now(), construction: change(readConstruction(current)) }));
  const setLimitsTo = (change: (current: StudioLimits) => StudioLimits) => updateProject((current) => setLimits(current, change));
  const setBuild = (change: (current: AlternativeBuild) => AlternativeBuild) => updateProject((current) => {
    const working = workingAlternative(current);
    return { ...current, updatedAt: now(), alternatives: current.alternatives.map((item) => item.id === working?.id ? { ...item, updatedAt: now(), build: change(readBuild(item)) } : item) };
  });
  return {
    ready: true, loading: false, project, plan, calculation, catalog, limits, construction, alternative, build, mix, result, symbol, typedByHand,
    setConstruction, setLimitsTo, setBuild, updateProject,
  } as const;
}
type Steps = Extract<ReturnType<typeof useSteps>, { ready: true }>;

function Waiting({ loading }: { loading: boolean }) {
  return loading ? <WorkWaiting /> : null;
}

function StepHeading({ step, title, children }: { step: number; title: ReactNode; children: ReactNode }) {
  return (
    <header className={styles.pageHeading}>
      <p className={styles.eyebrow}>Portfolio · Step {step} of 9</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  );
}

function EditorFooter({ next }: { next: { href: string; label: string } }) {
  return (
    <div className={styles.editorFooter}>
      <span>Changes save as you go.</span>
      <Link href={next.href}>{next.label} <StudioIcon name="arrow" /></Link>
    </div>
  );
}

/** The slices, or the parts, as one bar. */
function Bar({ segments, label, className }: { segments: { key: string; value: number; colour: string }[]; label: string; className?: string }) {
  const total = Math.max(1e-9, segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0));
  let x = 0;
  return (
    <svg className={className ? `${styles.moneyDiagram} ${className}` : styles.moneyDiagram} viewBox="0 0 400 56" preserveAspectRatio="none" role="img" aria-label={label}>
      <rect x="0" y="0" width="400" height="46" rx="8" fill="#424a3d" />
      {segments.map((segment) => {
        const width = Math.max(0, segment.value) / total * 400;
        const rect = <rect key={segment.key} x={x} y="0" width={width} height="46" fill={segment.colour} />;
        x += width;
        return rect;
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Step 3: your mix
// ---------------------------------------------------------------------------

const MIX_VIEWS = [{ id: "targets", label: "Targets" }, { id: "estimates", label: "Estimates" }, { id: "compare", label: "Compare" }] as const;
type MixView = (typeof MIX_VIEWS)[number]["id"];

export function MixStep() {
  const steps = useSteps();
  const [view, setView] = useState<MixView>("targets");
  if (!steps.ready) return <Waiting loading={steps.loading} />;
  const { plan, limits, construction, mix, setLimitsTo, setConstruction, project, calculation, typedByHand } = steps;
  const changeSlice = (slice: SliceId, key: "targetPct" | "minPct" | "maxPct", value: number | null) =>
    setLimitsTo((current) => ({ ...current, slices: { ...current.slices, [slice]: { ...current.slices[slice], [key]: value } } }));
  const changeEstimate = (slice: SliceId, key: "lowPct" | "highPct", value: number | null) =>
    setConstruction((current) => ({ ...current, estimates: { ...current.estimates, [slice]: { ...current.estimates[slice], [key]: value } } }));
  const changeCompared = (id: string, patch: Partial<ComparedMix>) =>
    setConstruction((current) => ({ ...current, compare: current.compare.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const held = typedByHand ? checkPortfolio(plan, calculation, limits).sliceShares : null;
  return (
    <div className={styles.page}>
      <StepHeading step={3} title={<>Choose your <em>mix.</em></>}>
        Decide how much goes to stocks, bonds and cash before choosing any investment: the mix sets most of the ups and downs.
      </StepHeading>
      <div className={styles.goalLayout}>
        <section className={styles.goalEditor} aria-label="Edit your mix">
          <ViewTabs label="Your mix" idPrefix="mix" tabs={MIX_VIEWS} selected={view} onSelect={setView} className={styles.panelTabs} />
          <div role="tabpanel" id="mix-panel" aria-labelledby={`mix-tab-${view}`} className={styles.goalFields}>
            {view === "targets" && <>
              <p className={styles.fieldNote}>
                Give each slice a target share of the whole portfolio and a range to stay in, such as Grow at 55%, between 50% and
                65%. <span className={own.phoneOnly}>Ready is cash for bills, Steady is bonds, Grow is stocks. </span>None is safe: bonds can fall too.
              </p>
              <table className={`${styles.sliceTable} ${own.compactTable}`}>
                <caption className="sr-only">Target and range for each slice, as a share of the whole portfolio</caption>
                <thead><tr><th scope="col">Slice</th><th scope="col">Target</th><th scope="col">Lowest</th><th scope="col">Highest</th></tr></thead>
                <tbody>
                  {SLICES.map((slice) => {
                    const { name, job } = SLICE_NAMES[slice];
                    const values = limits.slices[slice];
                    return (
                      <tr key={slice}>
                        <th scope="row"><i aria-hidden="true" style={{ background: SLICE_COLOURS[slice] }} />{name}<small className={own.wideOnly}>{job}</small></th>
                        <td><NumberBox label={`${name} target, % of the whole portfolio`} value={values.targetPct} onChange={(value) => changeSlice(slice, "targetPct", value)} /></td>
                        <td><NumberBox label={`${name} lowest, % of the whole portfolio`} value={values.minPct} onChange={(value) => changeSlice(slice, "minPct", value)} /></td>
                        <td><NumberBox label={`${name} highest, % of the whole portfolio`} value={values.maxPct} onChange={(value) => changeSlice(slice, "maxPct", value)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {held ? (
                <p className={styles.fieldNote}>
                  The weights you typed add up to Ready {pct(held.ready, 1)}, Steady {pct(held.steady, 1)} and Grow {pct(held.grow, 1)}.
                  Step 4 can start from them.
                </p>
              ) : null}
            </>}
            {view === "estimates" && <>
              <p className={styles.fieldNote}>
                Copy a firm&apos;s published ten-year return ranges, before inflation, such as{" "}
                <a href={VANGUARD_ESTIMATES} target="_blank" rel="noreferrer" className="underline underline-offset-2">Vanguard&apos;s<span className="sr-only"> (opens in a new tab)</span></a>.
                They are your assumptions; Studio keeps none.
              </p>
              <table className={`${styles.sliceTable} ${own.compactTable}`}>
                <caption className="sr-only">Assumed yearly return range for each slice, before inflation</caption>
                <thead><tr><th scope="col">Slice</th><th scope="col">Low</th><th scope="col">High</th></tr></thead>
                <tbody>
                  {SLICES.map((slice) => (
                    <tr key={slice}>
                      <th scope="row"><i aria-hidden="true" style={{ background: SLICE_COLOURS[slice] }} />{SLICE_NAMES[slice].name}<small className={own.wideOnly}>{slice === "grow" ? "Stocks" : slice === "steady" ? "Bonds" : "Cash"}</small></th>
                      <td><NumberBox label={`${SLICE_NAMES[slice].name} low estimate, % a year`} min={-50} max={50} value={construction.estimates[slice].lowPct} onChange={(value) => changeEstimate(slice, "lowPct", value)} /></td>
                      <td><NumberBox label={`${SLICE_NAMES[slice].name} high estimate, % a year`} min={-50} max={50} value={construction.estimates[slice].highPct} onChange={(value) => changeEstimate(slice, "highPct", value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.capFields}>
                <Field label="Prices rising each year (inflation)" type="number" min={-20} max={50} suffix="%" value={construction.inflationPct ?? ""}
                  onChange={(value) => setConstruction((current) => ({ ...current, inflationPct: value.trim() === "" || !Number.isFinite(Number(value)) ? null : Math.min(50, Math.max(-20, Number(value))) }))} />
                <Field label="Where they come from" value={construction.estimateSource}
                  onChange={(value) => setConstruction((current) => ({ ...current, estimateSource: value.slice(0, 2_000) }))} placeholder="Vanguard, 30 Sept 2026" />
              </div>
            </>}
            {view === "compare" && <>
              <p className={construction.compare.length ? `${styles.fieldNote} ${own.wideOnly}` : styles.fieldNote}>
                Hold up to two other mixes beside yours. More Grow usually means a higher estimate and a larger fall in a bad year.
              </p>
              {construction.compare.map((item, index) => (
                <div key={item.id} className={own.mixCard} role="group" aria-label={item.name || `Mix ${index + 2}`}>
                  <NameBox label={`Name of mix ${index + 2}`} value={item.name} placeholder={`Name this mix, such as Mix ${index + 2}`} onChange={(value) => changeCompared(item.id, { name: value.slice(0, 60) })} />
                  <div>
                    {SLICES.map((slice) => (
                      <label key={slice}>{SLICE_NAMES[slice].name}
                        <NumberBox label={`${item.name || `Mix ${index + 2}`} ${SLICE_NAMES[slice].name}, % of the whole portfolio`} value={item[slice]} onChange={(value) => changeCompared(item.id, { [slice]: value })} />
                      </label>
                    ))}
                  </div>
                  <div>
                    <button type="button" className={own.inlineAction} onClick={() => setLimitsTo((current) => ({
                      ...current, slices: { ready: { ...current.slices.ready, targetPct: item.ready }, steady: { ...current.slices.steady, targetPct: item.steady }, grow: { ...current.slices.grow, targetPct: item.grow } },
                    }))}>Use as my targets</button>
                    <button type="button" className={own.quietAction} onClick={() => setConstruction((current) => ({ ...current, compare: current.compare.filter((other) => other.id !== item.id) }))}>
                      Remove<span className="sr-only"> {item.name || `mix ${index + 2}`}</span>
                    </button>
                  </div>
                </div>
              ))}
              {construction.compare.length < MAX_COMPARED_MIXES ? (
                <button type="button" className={own.inlineAction} onClick={() => setConstruction((current) => ({
                  ...current, compare: [...current.compare, { id: `mix-${crypto.randomUUID()}`, name: "", ready: mix.ready, steady: mix.steady, grow: mix.grow }],
                }))}>+ Add a mix to compare</button>
              ) : null}
            </>}
          </div>
          <EditorFooter next={{ href: "/studio/portfolio/split", label: "Step 4: split each slice" }} />
        </section>
        <section className={styles.moneyCanvas} aria-labelledby="mix-canvas-heading" data-panel={`mix-${view}`}>
          <div className={styles.canvasTop}><h2 id="mix-canvas-heading">Your mix against your goal.</h2><StudioIcon name="goals" /></div>
          {view === "compare"
            ? <CompareTable project={project} plan={plan} limits={limits} construction={construction} mix={mix} split={steps.build?.growInternationalPct ?? null} />
            : <MixCanvas project={project} plan={plan} limits={limits} construction={construction} mix={mix} split={steps.build?.growInternationalPct ?? null} footClassName={view === "targets" ? undefined : own.wideOnly} />}
        </section>
      </div>
    </div>
  );
}

type MixInputs = { project: StudioProject; plan: StudioPlan; limits: StudioLimits; construction: StudioConstruction; mix: Mix; split: number | null };

function needed(plan: StudioPlan, construction: StudioConstruction) {
  return neededReturn({ start: plan.goal.budget, monthly: plan.goal.monthlyContribution, years: plan.goal.horizonYears, target: construction.targetAmount });
}

/** The worst of the learner's scenarios for a mix, against the loss budget. */
function worstScenario({ project, plan, limits, mix, split }: MixInputs) {
  const results = readScenarios(project).map((scenario) => ({ name: scenario.name, pct: mixScenarioPct(mix, scenario.stress, split) }));
  if (results.some((item) => item.pct === null) || !results.length) return null;
  const worst = results.reduce((a, b) => ((b.pct ?? 0) < (a.pct ?? 0) ? b : a));
  const budget = lossBudget(plan.goal.lossTolerancePct, limits.lossCapacityPct);
  const set = budget.pct > 0 || limits.lossCapacityPct === 0;
  const loses = Math.max(0, -(worst.pct ?? 0));
  return { name: worst.name, pct: worst.pct ?? 0, dollars: plan.goal.budget * (worst.pct ?? 0) / 100, budgetPct: budget.pct, set, fits: loses <= budget.pct + 1e-9 };
}

/** The needed return against the range, in one sentence. */
function verdictText(plan: StudioPlan, construction: StudioConstruction, range: MixRange): { tone: "good" | "warn" | "plain"; text: string } {
  const need = needed(plan, construction);
  if (need.status === "unset") return { tone: "plain", text: "Add the amount you want on Goals, step 2, to compare this mix with the return your goal needs." };
  if (need.status !== "ok" && need.status !== "reached") return { tone: "warn", text: "Finish step 2 on Goals: the return your goal needs cannot be worked out yet." };
  if (range.status === "incomplete") {
    return { tone: "plain", text: range.missing.length
      ? `Add a low and high estimate for ${listed(range.missing.map((slice) => SLICE_NAMES[slice].name))} to see this mix's range.`
      : "Give every slice a target, adding up to 100%, to see this mix's range." };
  }
  if (range.lowRealPct === null || range.highRealPct === null) return { tone: "plain", text: "Add the yearly rise in prices you assume, so the range can be compared with your goal's return above inflation." };
  const n = need.status === "reached" ? 0 : need.annualPct;
  const verdict = rangeVerdict(n, range);
  const low = pct(range.lowRealPct, 1);
  const high = pct(range.highRealPct, 1);
  if (verdict === "covered") return { tone: "good", text: `Your goal needs ${pct(n, 1)} a year above inflation. Even at the low end of every estimate, this mix gives ${low}.` };
  if (verdict === "inside") {
    const upper = n > (range.lowRealPct + range.highRealPct) / 2;
    return { tone: "plain", text: `Your goal needs ${pct(n, 1)} a year above inflation, inside this mix's ${low} to ${high}. Reaching it depends on returns landing in the ${upper ? "upper" : "lower"} part of that range.` };
  }
  return { tone: "warn", text: `Your goal needs ${pct(n, 1)} a year above inflation, more than this mix's ${high} even at the high end of every estimate. Add more each month, allow more time, lower the amount, or take more Grow and a larger fall in a bad year.` };
}

function MixCanvas(inputs: MixInputs & { footClassName?: string }) {
  const { limits, construction, mix, plan, footClassName } = inputs;
  const { total, totalOff, problems } = checkTargets(limits);
  const range = mixRange(mix, construction);
  const verdict = verdictText(plan, construction, range);
  const worst = worstScenario(inputs);
  return (
    <>
      <div className={styles.amountHeadline}>
        <span>{range.status === "ok" && range.lowRealPct !== null ? "Estimated yearly return above inflation" : "Your targets add up to"}</span>
        <strong>{range.status === "ok" && range.lowRealPct !== null && range.highRealPct !== null
          ? `${Number(range.lowRealPct.toFixed(1))}–${pct(range.highRealPct, 1)}`
          : total === null ? "—" : pct(total)}</strong>
        <p>{range.status === "ok" ? `Before inflation, ${pct(range.lowPct, 1)} to ${pct(range.highPct, 1)}, from your estimates.` : "Of the whole portfolio, cash included."}</p>
      </div>
      <Bar className={own.wideOnly} label={SLICES.map((slice) => `${SLICE_NAMES[slice].name} ${mix[slice] ?? "not set"}${mix[slice] === null ? "" : "%"}`).join(", ")}
        segments={SLICES.map((slice) => ({ key: slice, value: mix[slice] ?? 0, colour: SLICE_COLOURS[slice] }))} />
      <dl className={`${styles.mixLegend} ${own.wideOnly}`}>
        {SLICES.map((slice) => (
          <div key={slice}><dt><i style={{ background: SLICE_COLOURS[slice] }} />{SLICE_NAMES[slice].name}</dt><dd>{mix[slice] === null ? "Not set" : pct(mix[slice] ?? 0)}</dd></div>
        ))}
      </dl>
      {totalOff ? <p className={styles.canvasWarning}>They need to add up to 100%.</p> : null}
      {problems.map((problem) => <p key={problem} className={styles.canvasWarning}>{problem}</p>)}
      <p className={own.verdict} data-tone={verdict.tone}>{verdict.text}</p>
      <div className={footClassName ? `${styles.canvasFoot} ${footClassName}` : styles.canvasFoot}>
        <span>{worst ? `Worst scenario, “${worst.name}”` : "Your scenarios"}</span>
        <strong>{worst ? `${money(worst.dollars)} (${pct(worst.pct, 1)})` : "Set the mix first"}</strong>
        {worst && worst.set ? <span>{worst.fits ? "Within" : "More than"} your {money(plan.goal.budget * worst.budgetPct / 100)} loss budget ({pct(worst.budgetPct, 1)}).</span> : null}
      </div>
    </>
  );
}

function CompareTable(inputs: MixInputs) {
  const { construction, plan, mix } = inputs;
  const columns = [{ id: "yours", name: "Your mix", mix }, ...construction.compare.map((item, index) => ({ id: item.id, name: item.name || `Mix ${index + 2}`, mix: { ready: item.ready, steady: item.steady, grow: item.grow } }))];
  const need = needed(plan, construction);
  const budget = lossBudget(plan.goal.lossTolerancePct, inputs.limits.lossCapacityPct);
  const goalNeeds = need.status === "ok" ? pct(need.annualPct, 1) : need.status === "reached" ? "0%" : null;
  return (
    <>
      <table className={own.compareTable}>
        <caption className="sr-only">Your mix beside the mixes you are comparing</caption>
        <thead><tr><th scope="col"><span className="sr-only">Measure</span></th>{columns.map((column) => <th key={column.id} scope="col">{column.name}</th>)}</tr></thead>
        <tbody>
          <tr><th scope="row">Ready · Steady · Grow</th>{columns.map((column) => <td key={column.id}>{SLICES.map((slice) => column.mix[slice] ?? "–").join(" · ")}</td>)}</tr>
          <tr><th scope="row">Estimate above inflation</th>{columns.map((column) => {
            const range = mixRange(column.mix, construction);
            return <td key={column.id}>{range.status === "ok" && range.lowRealPct !== null && range.highRealPct !== null ? `${pct(range.lowRealPct, 1)}–${pct(range.highRealPct, 1)}` : "–"}</td>;
          })}</tr>
          <tr><th scope="row">{goalNeeds ? `Against the ${goalNeeds} your goal needs` : "Against the goal"}</th>{columns.map((column) => {
            const range = mixRange(column.mix, construction);
            const verdict = need.status === "ok" || need.status === "reached" ? rangeVerdict(need.status === "ok" ? need.annualPct : 0, range) : null;
            return <td key={column.id}>{verdict === "covered" ? "Covered" : verdict === "inside" ? "Inside" : verdict === "above" ? "Above" : "–"}</td>;
          })}</tr>
          <tr><th scope="row">{budget.pct > 0 ? `Worst scenario, against your ${money(plan.goal.budget * budget.pct / 100)} loss budget` : "Worst scenario"}</th>{columns.map((column) => {
            const worst = worstScenario({ ...inputs, mix: column.mix });
            return <td key={column.id}>{worst ? <>{money(worst.dollars)}{worst.set && !worst.fits ? <small className="block">over budget</small> : null}</> : "–"}</td>;
          })}</tr>
        </tbody>
      </table>
      <p className={`${styles.canvasExplanation} ${own.wideOnly}`}>
        “Covered” means even the low ends of the estimates reach the goal; “Above” means it needs more than even the high ends.
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Steps 4 to 6 share an opening for a portfolio typed by hand
// ---------------------------------------------------------------------------

function StartFromHoldings({ steps }: { steps: Steps }) {
  const { calculation, plan, catalog, symbol, updateProject } = steps;
  const start = startingPoint(calculation.rows.map((row) => ({ instrumentId: row.holding.instrumentId, instrument: row.instrument, wholePct: row.targetPortfolioWeightPct })));
  const after = buildPortfolio({ whole: plan.goal.budget, cashKept: plan.goal.cashReserve, mix: start.mix, build: start.build, catalog });
  const weights = storedWeights(after, plan.goal.cashReserve);
  /*
   * Weights that do not add up (more than 100%, or no starting amount) have no
   * mix to start from: the calculation gives every holding nothing. Say so, and
   * offer a fresh start that keeps every holding listed at 0%.
   */
  if (!calculation.valid) {
    return (
      <section className={own.startPanel} aria-labelledby="start-heading">
        <h2 id="start-heading">Start from the weights you typed</h2>
        <p>{calculation.issues[0]} Studio cannot work out a mix from these weights.</p>
        <p>Starting afresh keeps every holding listed at 0% and builds the weights from steps 3 to 6.</p>
        <button type="button" onClick={() => updateProject((current) => {
          const working = workingAlternative(current);
          return {
            ...current, updatedAt: new Date().toISOString(),
            alternatives: current.alternatives.map((item) => item.id === working?.id
              ? { ...item, build: emptyBuild(), positions: item.positions.map((position) => ({ ...position, targetWeightPct: 0 })) }
              : item),
          };
        })}>Start afresh</button>
      </section>
    );
  }
  return (
    <section className={own.startPanel} aria-labelledby="start-heading">
      <h2 id="start-heading">Start from the weights you typed</h2>
      <p>
        Your holdings add up to Ready {pct(start.mix.ready ?? 0, 1)}, Steady {pct(start.mix.steady ?? 0, 1)} and Grow {pct(start.mix.grow ?? 0, 1)}.
        Building from them sets those as your targets and works each weight out from steps 3 to 6 from then on.
      </p>
      <ul>
        {calculation.rows.filter((row) => row.holding.targetWeightPct > 0 || weights.has(row.holding.instrumentId)).map((row) => (
          <li key={row.holding.instrumentId}>
            {symbol(row.holding.instrumentId)}: {pct(row.holding.targetWeightPct, 1)} now, {pct(weights.get(row.holding.instrumentId) ?? 0, 1)} after
          </li>
        ))}
        {start.merged.map((item) => <li key={item.from}>{symbol(item.from)}&apos;s money moves into {symbol(item.into)}: one fund fills each part.</li>)}
        {start.unplaced.map((id) => <li key={id}>{symbol(id)} has no part here, so its money stays in cash.</li>)}
      </ul>
      <p>A weight here is a share of the money after the cash kept aside.</p>
      <button type="button" onClick={() => updateProject((current) => {
        const working = workingAlternative(current);
        const withTargets = setLimits(current, (limits) => ({
          ...limits, slices: Object.fromEntries(SLICES.map((slice) => [slice, { ...limits.slices[slice], targetPct: start.mix[slice] }])) as StudioLimits["slices"],
        }));
        return { ...withTargets, alternatives: withTargets.alternatives.map((item) => item.id === working?.id ? { ...item, build: start.build } : item) };
      })}>Build from these holdings</button>
    </section>
  );
}

/** Steps 4 to 6 for weights typed by hand: the choice to build from them comes before any control. */
function TypedFirst({ steps, step, title }: { steps: Steps; step: number; title: ReactNode }) {
  return (
    <div className={styles.page}>
      <StepHeading step={step} title={title}>
        This portfolio&apos;s weights were typed by hand. Build from them, or start afresh, before choosing anything here.
      </StepHeading>
      <StartFromHoldings steps={steps} />
    </div>
  );
}

function needsMix(steps: Steps): ReactNode {
  if (steps.result.problems.length && !steps.typedByHand) {
    return (
      <p className={styles.fieldNote}>
        <strong>{steps.result.problems[0]}</strong>{" "}
        <Link href={steps.result.problems[0].includes("Goals") ? "/studio/goals" : "/studio/portfolio"} className="underline underline-offset-2">
          {steps.result.problems[0].includes("Goals") ? "Open Goals" : "Open step 3"}
        </Link>
      </p>
    );
  }
  return null;
}

function Notes({ notes, problems }: { notes: string[]; problems: string[] }) {
  if (!notes.length && !problems.length) return null;
  return (
    <ul className={own.issueList}>
      {problems.map((problem) => <li key={problem}>{problem}</li>)}
      {notes.map((note) => <li key={note} className={own.noteList}>{note}</li>)}
    </ul>
  );
}

/**
 * The portfolio by part. Step 4 shows where the split sends each dollar, cash
 * being Ready's planned share; step 5 shows what is actually filled, cash
 * being everything not yet in a fund.
 */
function PartsCanvas({ steps, heading, mode }: { steps: Steps; heading: string; mode: "split" | "fill" }) {
  const { result, symbol } = steps;
  const picks = result.picks.reduce((sum, pick) => sum + pick.money, 0);
  const shown = result.parts.filter((part) => part.money > 0);
  const cash = mode === "split" ? result.slices.ready : result.ready;
  const share = (value: number) => pct(value / result.whole * 100, 1);
  const notes = mode === "split" ? result.notes.filter((note) => note.includes("not split")) : result.notes;
  return (
    <>
      <div className={`${styles.amountHeadline} ${own.wideOnly}`}>
        <span>{heading}</span>
        <strong>{money(result.whole)}</strong>
        <p>The whole portfolio, cash included.</p>
      </div>
      <Bar className={own.wideOnly} label="Your portfolio by part"
        segments={[...shown.map((part) => ({ key: part.part, value: mode === "split" ? part.money : part.fundMoney, colour: PART_COLOURS[part.part] })),
          ...(mode === "fill" ? [{ key: "picks", value: picks, colour: PICKS_COLOUR }] : []), { key: "ready", value: cash, colour: SLICE_COLOURS.ready }]} />
      <dl className={own.legendList}>
        {shown.map((part) => (
          <div key={part.part}>
            <dt><i style={{ background: PART_COLOURS[part.part] }} />{PART_NAMES[part.part].name}{mode === "fill" ? ` · ${part.fundId ? symbol(part.fundId) : "no fund yet"}` : ""}</dt>
            {mode === "split"
              ? <dd>{money(part.money)}<small>{share(part.money)}</small></dd>
              : <dd>{money(part.money - part.picksMoney)}<small>{part.fundId ? share(part.fundMoney) : "in cash for now"}</small></dd>}
          </div>
        ))}
        {mode === "fill" && picks > 0 ? <div><dt><i style={{ background: PICKS_COLOUR }} />Picks</dt><dd>{money(picks)}<small>{share(picks)}</small></dd></div> : null}
        <div><dt><i style={{ background: SLICE_COLOURS.ready }} />{mode === "split" ? "Ready, as cash" : "Cash"}</dt><dd>{money(cash)}<small>{share(cash)}</small></dd></div>
      </dl>
      <Notes notes={notes} problems={result.problems} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 4: split each slice
// ---------------------------------------------------------------------------

export function SplitStep() {
  const steps = useSteps();
  if (!steps.ready) return <Waiting loading={steps.loading} />;
  const { result, setBuild, build, typedByHand } = steps;
  const grow = result.slices.grow;
  const steady = result.slices.steady;
  const intl = build?.growInternationalPct ?? null;
  const short = build?.steadyShortPct ?? null;
  if (typedByHand) return <TypedFirst steps={steps} step={4} title={<>Split each <em>slice.</em></>} />;
  return (
    <div className={styles.page}>
      <StepHeading step={4} title={<>Split each <em>slice.</em></>}>
        Inside each slice, decide where its money goes.
      </StepHeading>
      <div className={styles.goalLayout}>
        <section className={styles.goalEditor} aria-label="Split each slice">
          <div className={styles.goalFields}>
            {needsMix(steps)}
            <div className={own.splitRow}>
              <h2 id="split-grow">Grow: share in international stocks</h2>
              <NumberBox label="Grow: share in international stocks, % of Grow" value={intl} onChange={(value) => setBuild((current) => ({ ...current, growInternationalPct: value }))} />
              <p>
                International stocks are companies based outside the US, bought here through a fund. Their results can differ from US
                companies&apos;, and changes in currencies add to them or take from them.
                {intl !== null && grow > 0 ? <> {pct(intl)} of Grow&apos;s {money(grow)} is <strong>{money(grow * intl / 100)}</strong>; US stocks get {money(grow - grow * intl / 100)}.</> : null}
              </p>
            </div>
            <div className={own.splitRow}>
              <h2 id="split-steady">Steady: share in short-term bonds</h2>
              <NumberBox label="Steady: share in short-term bonds, % of Steady" value={short} onChange={(value) => setBuild((current) => ({ ...current, steadyShortPct: value }))} />
              <p>
                Short-term bonds are loans repaid within about a year, such as Treasury bills; their prices barely move when interest
                rates change. Longer-term bonds are repaid later, and their prices rise and fall more when rates change.
                {short !== null && steady > 0 ? <> {pct(short)} of Steady&apos;s {money(steady)} is <strong>{money(steady * short / 100)}</strong>; longer-term bonds get {money(steady - steady * short / 100)}.</> : null}
              </p>
            </div>
          </div>
          <EditorFooter next={{ href: "/studio/portfolio/fill", label: "Step 5: fill each part" }} />
        </section>
        <section className={styles.moneyCanvas} aria-labelledby="split-canvas-heading">
          <div className={styles.canvasTop}><h2 id="split-canvas-heading">Where each dollar goes.</h2><StudioIcon name="goals" /></div>
          <PartsCanvas steps={steps} heading="Split across" mode="split" />
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5: fill each part
// ---------------------------------------------------------------------------

/**
 * The sentence that says what a fund owns, so two funds for one part can be
 * told apart in a line: VTI's objective is the whole US market, VOO's is large
 * companies. The filing's own words, from the catalog's description.
 */
const whatItOwns = (text: string) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.map((sentence) => sentence.trim()) ?? [text];
  return sentences.find((sentence) => /seeks to/i.test(sentence)) ?? sentences.find((sentence) => /tracks/i.test(sentence)) ?? sentences[0];
};

/** Small yearly costs to the cent: $0.45 is not "$0". */
const cost = (value: number) => value.toLocaleString("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: value < 100 ? 2 : 0, maximumFractionDigits: value < 100 ? 2 : 0,
});

function costLine(instrument: StudioInstrument, dollars: number): string {
  if (instrument.kind === "bond") return "A single bond has no yearly fund cost; a broker may charge to buy it.";
  if (instrument.expenseRatioPct === null) return "Its yearly cost is not on record.";
  return `Costs ${instrument.expenseRatioPct}% a year${dollars > 0 ? `, about ${cost(dollars * instrument.expenseRatioPct / 100)} on ${money(dollars)}` : ""}.`;
}

export function FillStep() {
  const steps = useSteps();
  const [chosenPart, setChosenPart] = useState<PartId | null>(null);
  if (!steps.ready) return <Waiting loading={steps.loading} />;
  const { result, catalog, setBuild, build, typedByHand, symbol, alternative, updateProject } = steps;
  // Funds and bonds kept at 0% because the build does not use them, such as one added from Research.
  const unused = build ? (alternative?.positions ?? [])
    .filter((position) => position.targetWeightPct === 0 && catalog.find((instrument) => instrument.id === position.instrumentId)?.kind !== "stock")
    .map((position) => position.instrumentId) : [];
  const withMoney = result.parts.filter((part) => part.money > 0).map((part) => part.part);
  const part = chosenPart && withMoney.includes(chosenPart) ? chosenPart : withMoney[0] ?? null;
  const tabs = withMoney.map((id) => ({ id, label: PART_NAMES[id].name }));
  const partResult = result.parts.find((item) => item.part === part);
  const options = part ? catalog.filter((instrument) => instrument.kind !== "stock" && partOf(instrument) === part) : [];
  const yearlyCost = result.parts.reduce((sum, item) => {
    const fund = item.fundId ? catalog.find((instrument) => instrument.id === item.fundId) : null;
    return sum + (fund?.expenseRatioPct ? item.fundMoney * fund.expenseRatioPct / 100 : 0);
  }, 0);
  if (typedByHand) return <TypedFirst steps={steps} step={5} title={<>Fill each <em>part.</em></>} />;
  return (
    <div className={styles.page}>
      <StepHeading step={5} title={<>Fill each <em>part.</em></>}>
        Choose one broad fund for each part; it takes the part&apos;s money. An index fund owns a whole market for a small yearly
        cost, which is why professionals start there.
      </StepHeading>
      <div className={styles.goalLayout}>
        <section className={styles.goalEditor} aria-label="Fill each part">
          {tabs.length ? <ViewTabs label="Parts" idPrefix="fill" tabs={tabs} selected={part} onSelect={setChosenPart} className={styles.panelTabs} /> : null}
          <div role={tabs.length ? "tabpanel" : undefined} id={tabs.length ? "fill-panel" : undefined} aria-labelledby={part ? `fill-tab-${part}` : undefined} className={styles.goalFields}>
            {needsMix(steps)}
            {!tabs.length && !result.problems.length ? (
              <p className={styles.fieldNote}>Split your slices in <Link href="/studio/portfolio/split" className="underline underline-offset-2">step 4</Link> first: each part needs money before it needs a fund.</p>
            ) : null}
            {part && partResult ? (
              <fieldset className={own.options}>
                <legend>{PART_NAMES[part].name}: {money(partResult.money - partResult.picksMoney)}</legend>
                {options.map((instrument) => (
                  <label key={instrument.id} className={own.option}>
                    <input type="radio" name={`fill-${part}`} checked={build?.fills[part] === instrument.id}
                      onChange={() => setBuild((current) => ({ ...current, fills: { ...current.fills, [part]: instrument.id } }))} />
                    <strong>{instrument.symbol} · {instrument.name}</strong>
                    <small>{whatItOwns(instrument.whatItIs)} {costLine(instrument, partResult.money - partResult.picksMoney)}</small>
                  </label>
                ))}
                {!options.length ? <p className={styles.fieldNote}>Studio&apos;s research library has no fund for this part yet.</p> : null}
              </fieldset>
            ) : null}
            {part ? <p className={styles.fieldNote}>Read each fund&apos;s holdings, costs and risks in <Link href="/studio/research" className="underline underline-offset-2">Research</Link>.</p> : null}
            {unused.length ? (
              <p className={styles.fieldNote}>
                Also in this portfolio at 0%, filling no part:{" "}
                {unused.map((id) => (
                  <span key={id} className="mr-2 inline-flex items-center gap-1">
                    <strong>{symbol(id)}</strong>
                    <button type="button" className={own.quietAction} onClick={() => updateProject((current) => removePosition(current, id))}>
                      Remove<span className="sr-only"> {symbol(id)}</span>
                    </button>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
          <EditorFooter next={{ href: "/studio/portfolio/picks", label: "Step 6: your picks" }} />
        </section>
        <section className={styles.moneyCanvas} aria-labelledby="fill-canvas-heading">
          <div className={styles.canvasTop}><h2 id="fill-canvas-heading">One fund for each part.</h2><StudioIcon name="goals" /></div>
          <PartsCanvas steps={steps} heading="Filled with funds" mode="fill" />
          <div className={`${styles.canvasFoot} ${own.wideOnly}`}>
            <span>What the funds charge each year, at today&apos;s amounts</span>
            <strong>{cost(yearlyCost)}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6: your picks
// ---------------------------------------------------------------------------

export function PicksStep() {
  const steps = useSteps();
  if (!steps.ready) return <Waiting loading={steps.loading} />;
  const { result, catalog, setBuild, build, typedByHand, symbol, limits, project, mix } = steps;
  const stocks = catalog.filter((instrument) => pickPart(instrument) !== null);
  const budget = build?.picksBudgetPct ?? null;
  const used = (build?.picks ?? []).reduce((sum, pick) => sum + (pick.pct ?? 0), 0);
  const setPick = (instrumentId: string, value: number | null) => setBuild((current) => ({
    ...current,
    picks: value === null
      ? current.picks.filter((pick) => pick.instrumentId !== instrumentId)
      : current.picks.some((pick) => pick.instrumentId === instrumentId)
        ? current.picks.map((pick) => pick.instrumentId === instrumentId ? { ...pick, pct: value } : pick)
        : [...current.picks, { instrumentId, pct: value }],
  }));
  const picksMoney = result.picks.reduce((sum, pick) => sum + pick.money, 0);
  const indexInGrow = result.parts.filter((part) => PART_NAMES[part.part].slice === "grow").reduce((sum, part) => sum + part.fundMoney, 0);
  if (typedByHand) return <TypedFirst steps={steps} step={6} title={<>Your <em>picks.</em></>} />;
  return (
    <div className={styles.page}>
      <StepHeading step={6} title={<>Your <em>picks.</em></>}>
        A pick is one company you expect to do better than the index fund it replaces. Keep picks inside a set budget, or
        leave it empty for none.
      </StepHeading>
      <div className={styles.goalLayout}>
        <section className={styles.goalEditor} aria-label="Size your picks">
          <div className={styles.goalFields}>
            {needsMix(steps)}
            <div className={own.splitRow}>
              <h2>Picks budget</h2>
              <NumberBox label="Picks budget, % of the whole portfolio" max={mix.grow ?? 100} value={budget} onChange={(value) => setBuild((current) => ({ ...current, picksBudgetPct: value }))} />
              <p>
                A share of the whole portfolio, taken out of Grow.{budget !== null ? <> {pct(budget)} is <strong>{money(result.whole * budget / 100)}</strong>.</> : null}
                {" "}Your cap for one company is {limits.companyCapPct === null ? <>not set: <Link href="/studio/goals" className="underline underline-offset-2">set it on Goals</Link></> : pct(limits.companyCapPct)}.
              </p>
            </div>
            <div className={own.pickList}>
              {stocks.map((instrument) => {
                const pick = build?.picks.find((item) => item.instrumentId === instrument.id);
                const candidate = project.candidates.find((item) => item.instrumentId === instrument.id);
                const reasoned = Boolean(candidate?.why.trim() && candidate?.whatWouldChangeMyMind.trim());
                return (
                  <div key={instrument.id} className={own.pickRow}>
                    <strong>{instrument.symbol}{instrument.symbol !== instrument.name ? ` · ${instrument.name}` : ""}</strong>
                    <NumberBox label={`${instrument.symbol}, % of the whole portfolio`} value={pick?.pct ?? null} onChange={(value) => setPick(instrument.id, value)} />
                    <small>
                      {PART_NAMES[pickPart(instrument)!].name} ·{" "}
                      {reasoned ? "Reason saved, and what would prove it wrong" : <><Link href="/studio/research">Save a reason in Research</Link> before buying</>}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
          <EditorFooter next={{ href: "/studio/portfolio/check", label: "Step 7: check the whole portfolio" }} />
        </section>
        <section className={styles.moneyCanvas} aria-labelledby="picks-canvas-heading">
          <div className={styles.canvasTop}><h2 id="picks-canvas-heading">Each pick against its index fund.</h2><StudioIcon name="goals" /></div>
          <div className={styles.amountHeadline}>
            <span>In picks</span>
            <strong>{money(picksMoney)}</strong>
            <p>{budget === null ? "No picks budget set." : `${pct(used)} of a ${pct(budget)} budget.`}</p>
          </div>
          <dl className={own.legendList}>
            {result.picks.map((pick) => {
              const fundId = pick.part ? build?.fills[pick.part] : null;
              return (
                <div key={pick.instrumentId}>
                  <dt><i style={{ background: PICKS_COLOUR }} />{symbol(pick.instrumentId)}</dt>
                  <dd>{money(pick.money)}<small>replaces {money(pick.money)} of {fundId ? symbol(fundId) : pick.part ? PART_NAMES[pick.part].inSentence : "Grow"}</small></dd>
                </div>
              );
            })}
          </dl>
          <Notes notes={[]} problems={result.problems} />
          <div className={styles.canvasFoot}>
            <span>Left in Grow&apos;s index funds</span>
            <strong>{money(indexInGrow)}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 7: check the whole portfolio
// ---------------------------------------------------------------------------

const CHECK_VIEWS = [{ id: "inside", label: "Look inside" }, { id: "benchmark", label: "Benchmark" }, { id: "limits", label: "Limits" }] as const;
type CheckView = (typeof CHECK_VIEWS)[number]["id"];

/** The same portfolio with its holdings' weights replaced: the benchmark's calculation. */
function benchmarkCalculation(steps: Steps): StudioCalculation | null {
  const { plan, build, mix, catalog } = steps;
  if (!build) return null;
  const result = buildPortfolio({ whole: plan.goal.budget, cashKept: plan.goal.cashReserve, mix, build, catalog, withoutPicks: true });
  if (result.problems.length) return null;
  const weights = storedWeights(result, plan.goal.cashReserve);
  const blank = (instrumentId: string): StudioHolding => ({
    instrumentId, targetWeightPct: 0, currentValue: 0, quotePrice: null, quoteAsOf: "", quantityMode: "whole", accruedInterestPer100: null, tradeFee: 0,
    research: { why: "", mainRisk: "", whatWouldChangeMyMind: "", reviewedSources: false },
  });
  const holdings = [...weights.entries()].map(([instrumentId, targetWeightPct]) => ({
    ...(plan.holdings.find((holding) => holding.instrumentId === instrumentId) ?? blank(instrumentId)),
    targetWeightPct,
  }));
  return calculateStudio({ ...plan, holdings }, catalog);
}

function whereItInvests(calculation: StudioCalculation) {
  const share = (classes: string[]) => calculation.rows.filter((row) => classes.includes(row.instrument?.assetClass ?? "")).reduce((sum, row) => sum + row.targetPortfolioWeightPct, 0);
  return [
    { label: "US stocks", pct: share(["us-equity"]) },
    { label: "International stocks", pct: share(["international-equity"]) },
    { label: "Stocks worldwide", pct: share(["global-equity"]) },
    { label: "Bonds", pct: share(["fixed-income"]) },
    { label: "Cash", pct: calculation.targetCashWeightPct + share(["cash"]) },
  ].filter((row) => row.pct > 0.0001);
}

function insideOf(calculation: StudioCalculation) {
  return lookThrough(calculation.rows.map((row) => ({ instrumentId: row.holding.instrumentId, wholePct: row.targetPortfolioWeightPct, exposures: row.instrument?.exposures ?? [] })));
}

/**
 * Each pick's company in the portfolio against the benchmark: what you own of it
 * through the pick and every fund, beside what the index funds alone would give.
 * The difference is the bet a pick makes, which professionals call active weight.
 */
function activeWeights(steps: Steps, calculation: StudioCalculation, benchmark: StudioCalculation) {
  const yours = insideOf(calculation);
  const plain = insideOf(benchmark);
  return steps.result.picks.flatMap((pick) => {
    const exposure = steps.catalog.find((instrument) => instrument.id === pick.instrumentId)?.exposures[0];
    if (!exposure) return [];
    const key = (exposure.key ?? exposure.label).trim().toLowerCase();
    const mine = yours.find((row) => row.key === key);
    return [{ key, label: mine?.label ?? exposure.label, yours: mine?.pct ?? 0, benchmark: plain.find((row) => row.key === key)?.pct ?? 0 }];
  });
}

function worstLoss(steps: Steps, calculation: StudioCalculation) {
  const results = readScenarios(steps.project).map((scenario) => ({ name: scenario.name, change: scenarioResult(calculation, scenario.stress) }));
  return results.reduce((a, b) => (b.change.changeDollars < a.change.changeDollars ? b : a), results[0]);
}

export function CheckStep() {
  const steps = useSteps();
  const [view, setView] = useState<CheckView>("inside");
  if (!steps.ready) return <Waiting loading={steps.loading} />;
  const { calculation, plan, limits, project, symbol, result } = steps;
  const checks = checkPortfolio(plan, calculation, limits, readScenarios(project));
  const inside = insideOf(calculation).slice(0, 5);
  const benchmark = view === "benchmark" ? benchmarkCalculation(steps) : null;
  const worst = calculation.valid && plan.holdings.length ? worstLoss(steps, calculation) : null;
  const budget = lossBudget(plan.goal.lossTolerancePct, limits.lossCapacityPct);
  const notMet = checks.checks.filter((check) => check.status === "not-met").length;
  const picksPct = result.picks.reduce((sum, pick) => sum + pick.pct, 0);
  return (
    <div className={styles.page}>
      <StepHeading step={7} title={<>Check the whole <em>portfolio.</em></>}>
        Look through every fund to what you really own, add up the cost, and hold it against a benchmark and your limits.
      </StepHeading>
      <div className={styles.goalLayout}>
        <section className={styles.goalEditor} aria-label="Check the whole portfolio">
          <ViewTabs label="Checks" idPrefix="check" tabs={CHECK_VIEWS} selected={view} onSelect={setView} className={styles.panelTabs} />
          <div role="tabpanel" id="check-panel" aria-labelledby={`check-tab-${view}`} className={styles.goalFields}>
            {!plan.holdings.length ? <p className={styles.fieldNote}>Nothing to check yet: fill a part in <Link href="/studio/portfolio/fill" className="underline underline-offset-2">step 5</Link>.</p> : null}
            {view === "inside" && plan.holdings.length ? <>
              <p className={styles.fieldNote}>
                What you own through every holding. Funds report their largest holdings, so Studio sees{" "}
                <strong>{pct(calculation.exposureCoveragePct, 1)}</strong> of this portfolio; the rest is unknown, not zero.
              </p>
              <dl className={`${own.checkList} ${own.topThreeOnPhone}`}>
                {inside.map((row) => (
                  <div key={row.label}><dt>{row.label}<small>through {row.through.map(symbol).join(", ")}</small></dt><dd>{pct(row.pct)}</dd></div>
                ))}
              </dl>
            </> : null}
            {view === "benchmark" && plan.holdings.length ? <>
              <p className={styles.fieldNote}>
                Your benchmark is your mix in the index funds you chose, with no picks. A pick earns its place only by beating the
                fund it replaces, after costs.
              </p>
              {benchmark ? (
                <dl className={own.checkList}>
                  <div className={own.wideOnly}><dt>In picks</dt><dd>{pct(picksPct, 1)}<small>benchmark 0%</small></dd></div>
                  <div><dt>Yearly fund cost</dt><dd>{cost(calculation.fees.annualKnownCost)}<small>benchmark {cost(benchmark.fees.annualKnownCost)}</small></dd></div>
                  {activeWeights(steps, calculation, benchmark).map((row) => (
                    <div key={row.key}><dt>{row.label}</dt><dd>{pct(row.yours, 1)}<small>benchmark {pct(row.benchmark, 1)}, {row.yours >= row.benchmark ? "+" : "−"}{Number(Math.abs(row.yours - row.benchmark).toFixed(1))} points</small></dd></div>
                  ))}
                  {worst ? <div><dt>Worst scenario, “{worst.name}”</dt><dd>{money(worst.change.changeDollars)}<small>benchmark {money(worstLoss(steps, benchmark).change.changeDollars)}</small></dd></div> : null}
                </dl>
              ) : <p className={styles.fieldNote}>The benchmark uses your mix and funds from steps 3 to 5. Finish them to see it.</p>}
              {benchmark && worst ? <p className={`${styles.fieldNote} ${own.wideOnly}`}>A scenario moves a pick with its market; one company can fall much further, which your cap for one company limits.</p> : null}
            </> : null}
            {view === "limits" ? <LimitChecks checks={checks.checks} /> : null}
          </div>
          <nav aria-label="More checks" className={own.stepLinks}>
            <Link href="/studio/portfolio/risk">Scenarios and costs</Link>
            <Link href="/studio/portfolio/weights">Compare allocations</Link>
            <Link href="/studio/portfolio/returns">Return history</Link>
          </nav>
          <EditorFooter next={{ href: "/studio/portfolio/buying", label: "Step 8: carry it out" }} />
        </section>
        <section className={styles.moneyCanvas} aria-labelledby="check-canvas-heading">
          <div className={styles.canvasTop}><h2 id="check-canvas-heading">Ready to buy?</h2><StudioIcon name="goals" /></div>
          <div className={styles.amountHeadline}>
            <span>Your limits</span>
            <strong>{notMet ? `${notMet} not met` : "None broken"}</strong>
            <p>{checks.checks.filter((check) => check.status === "not-checked").length} not checked yet.</p>
          </div>
          <dl className={own.legendList} aria-label="Where it invests">
            {whereItInvests(calculation).map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{pct(row.pct, 1)}</dd></div>)}
          </dl>
          <p className={`${styles.canvasExplanation} ${own.wideOnly}`}>
            {worst ? `In “${worst.name}” the portfolio would change by ${money(worst.change.changeDollars)}; your loss budget is ${money(plan.goal.budget * budget.pct / 100)}.` : "Scenarios appear once the portfolio holds something."}
          </p>
          <div className={`${styles.canvasFoot} ${own.wideOnly}`}>
            <span>What the funds charge each year</span>
            <strong>{cost(calculation.fees.annualKnownCost)}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}
