"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CATALOG_GAPS, STUDIO_CATALOG, findStudioInstrument } from "@/lib/studio-catalog";
import {
  addStudioHolding,
  exportStudioCsv,
  exportStudioJson,
  exportStudioText,
  removeStudioHolding,
  scenarioResult,
  updateStudioHolding,
  type StudioCalculation,
  type StudioPlan,
} from "@/lib/studio";
import { Choice, Fact, Field, Notice, NumberInput, Panel, STAGE_TAB, STAGE_TABS, Stat, StageHeading, TableScroll, downloadFile, pct, usd, usdWhole } from "./shared";
import ResearchRecord from "./ResearchRecord";
import FundReportFacts from "./FundReportFacts";
import type { CandidateInvestigation, CandidateStatus, StudioScenario, StudioStress } from "@/lib/studio-project/schema";
import { MAX_SCENARIOS } from "@/lib/studio-project/scenarios";
import ViewTabs from "./workspace/ViewTabs";
import type { EvidenceEdit } from "@/lib/studio-project/operations";
import { longDate } from "@/lib/studio-project/cost-of-capital";
import { emptyLimits, type StudioLimits } from "@/lib/studio-project/limits";
import { checkPortfolio, describeRoom, scenarioLoss, type HoldingRoom } from "@/lib/studio-project/limit-checks";
import LimitChecks from "./LimitChecks";

/**
 * A holding's ticker, or a company's name where the learner added it themselves.
 *
 * Read from the calculation, which resolved every holding against the project's
 * own list, rather than from Studio's eight: a company the learner investigated
 * and holds is not among them, and would otherwise show as its stored id.
 */
const symbolOf = (calculation: StudioCalculation, instrumentId: string) =>
  calculation.rows.find((row) => row.holding.instrumentId === instrumentId)?.instrument?.symbol
  ?? findStudioInstrument(instrumentId)?.symbol
  ?? instrumentId;

/** What a change reports. The workspace's saves finish later, so it may arrive as a promise. */
export type StageResult = { ok: true } | { ok: false; error: string; conflict: boolean };
type Reported = StageResult | Promise<StageResult>;

/** Downloads and restores that carry the whole project, research included. */
export type StageActions = {
  downloadBackup: () => void;
  downloadText: () => void;
  downloadCsv: () => void;
  restore: (text: string) => unknown;
  startAgain: () => unknown;
};

export type StageProps = {
  plan: StudioPlan;
  calculation: StudioCalculation;
  update: (change: (plan: StudioPlan) => StudioPlan) => Reported;
  /** Whole-portfolio actions. They live beside the downloads, rather than in a
   *  panel stacked under every other page. */
  importBackup: (text: string) => Reported;
  reset: () => Reported;
  /** The section's name, shown above the title. Left out where tabs already name it. */
  eyebrow?: string;
  /** Workspace only: each section is its own page, so its title is the page's h1. */
  headingAs?: "h1" | "h2";
  /** Workspace only. Without it, the wizard's single-portfolio downloads are used. */
  actions?: StageActions;
  /** Workspace only: companies investigated so far, named on the way in to Investigate. */
  investigations?: { id: string; company: string }[];
  /** Workspace only: the learner's limits, which belong to the project rather than to a portfolio. */
  limits?: StudioLimits;
  /**
   * Workspace only: the research record, which belongs to the project rather
   * than to a portfolio.
   *
   * It is passed separately because that is exactly the point of it. The plan
   * carries holdings, and research attached to a holding disappears the moment
   * the holding does; these records outlive any portfolio, so they cannot
   * travel through the plan adapter.
   */
  record?: {
    candidates: CandidateInvestigation[];
    note: (instrumentId: string, patch: Partial<Pick<CandidateInvestigation, "why" | "mainRisk" | "whatWouldChangeMyMind">>) => Reported;
    setStatus: (instrumentId: string, status: CandidateStatus, rejectedBecause?: string) => Reported;
    addEvidence: (instrumentId: string, entry: EvidenceEdit) => Reported;
    removeEvidence: (instrumentId: string, evidenceId: string) => Reported;
  };
  /**
   * Workspace only: every scenario, the first included, which belong to the
   * project. `add` resolves to the new scenario's id, or null if it failed.
   */
  scenarios?: {
    list: StudioScenario[];
    add: (copyOf: string) => Promise<string | null>;
    update: (id: string, patch: Partial<StudioStress>) => Reported;
    rename: (id: string, name: string) => Reported;
    remove: (id: string) => Reported;
  };
};

/** The section's name above the title where the page wants one, and the title at the page's level. */
const headingFor = (props: StageProps) => ({ eyebrow: props.eyebrow, as: props.headingAs });

/** Blank and partial entries stay blank rather than silently becoming zero. */
const num = (raw: string, fallback = 0): number => {
  if (raw.trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// 1. Goal
// ---------------------------------------------------------------------------

export function GoalStage(props: StageProps) {
  const { plan, update } = props;
  const setGoal = (patch: Partial<StudioPlan["goal"]>) =>
    update((current) => ({ ...current, goal: { ...current.goal, ...patch }, updatedAt: new Date().toISOString() }));

  return (
    <div className="space-y-5">
      <StageHeading {...headingFor(props)} title="Give the money a job">
        Every later choice is judged against what you write here.
      </StageHeading>

      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="What is this money for?"
            value={plan.goal.purpose}
            onChange={(value) => setGoal({ purpose: value })}
            placeholder="A house deposit, retirement, a year of tuition…"
            multiline
          />
          <div className="space-y-4">
            <Field
              label="When do you expect to use it?"
              hint="Years from now."
              type="number"
              min={0}
              max={100}
              value={plan.goal.horizonYears}
              onChange={(value) => setGoal({ horizonYears: num(value) })}
              suffix="years"
            />
            <Choice
              label="Account it sits in"
              value={plan.goal.accountType}
              onChange={(value) => setGoal({ accountType: value })}
              options={[
                { value: "taxable", label: "Ordinary taxable account" },
                { value: "ira", label: "Traditional IRA" },
                { value: "roth-ira", label: "Roth IRA" },
                { value: "other", label: "Something else" },
              ]}
            />
          </div>
        </div>

        {/* Four short numeric fields on one row rather than two. Each row of
            label, hint and control costs about 90px, and the screen budget is
            measured on total page height. */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Money available now"
            type="number"
            min={0}
            prefix="$"
            value={plan.goal.budget}
            onChange={(value) => setGoal({ budget: num(value) })}
          />
          <Field
            label="Keep aside as cash"
            hint="Money you may need soon."
            type="number"
            min={0}
            prefix="$"
            value={plan.goal.cashReserve}
            onChange={(value) => setGoal({ cashReserve: num(value) })}
          />
          <Field
            label="Adding each month"
            type="number"
            min={0}
            prefix="$"
            value={plan.goal.monthlyContribution}
            onChange={(value) => setGoal({ monthlyContribution: num(value) })}
          />
          <Field
            label="Loss you could live with"
            hint="A drop this size should not force you to sell."
            type="number"
            min={0}
            max={100}
            value={plan.goal.lossTolerancePct}
            onChange={(value) => setGoal({ lossTolerancePct: num(value) })}
            suffix="%"
          />
        </div>

        <div className="mt-5">
          <Field
            label="Anything that limits your choices"
            value={plan.goal.constraints}
            onChange={(value) => setGoal({ constraints: value })}
            placeholder="High-interest debt, no emergency fund yet, an account someone else controls…"
            multiline
          />
        </div>
      </Panel>

      {/* No summary panel here. The portfolio total sits beside the work on wide
          screens and in the strip above it on narrow ones; repeating it would
          stack a screen of numbers underneath the form. */}

      {plan.goal.cashReserve > plan.goal.budget ? (
        <Notice tone="red" title="More cash set aside than you have">
          The cash reserve is larger than the money available, so there is nothing left to invest. Lower the reserve or
          raise the amount available.
        </Notice>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Research
// ---------------------------------------------------------------------------

export function ResearchStage(props: StageProps) {
  const { plan, update, investigations = [], record } = props;
  // Nothing open to start with: one open entry is taller than the rest of the list together.
  const [openId, setOpenId] = useState<string | null>(null);
  const held = new Set(plan.holdings.map((holding) => holding.instrumentId));

  return (
    <div className="space-y-4">
      <StageHeading {...headingFor(props)} title="Research what you might buy">
        Read what each investment is and holds, then write down why it belongs.
      </StageHeading>

      {/* The way into the industry view. It sits before the catalogue because
          that is the order the research is meant to run in: work out what an
          industry looks like before deciding whether one company inside it is
          worth your time. */}
      <div className="grid gap-3 sm:grid-cols-2">
      <Link
        href="/studio/industry"
        className="block rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-4 transition-colors hover:border-accent-cyan/50"
      >
        <div className="text-[15px] font-semibold text-white">Start with the industry</div>
        <p className="mt-1 text-[13px] leading-6 text-slate-400">
          See who competes, how the revenue is split between them, how much of that split has
          moved in five years, and how each earns its return on capital. From public filings.
        </p>
        <span className="mt-2 inline-block text-[13px] text-accent-cyan">Open the industry view →</span>
      </Link>

      {/* Two links in one card. The title's link is stretched over the whole card,
          and the reports link sits above that layer: links cannot nest, and a
          separate line under the cards cost this page its screen budget. */}
      <div className="relative rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-4 transition-colors hover:border-accent-cyan/50">
        <Link
          href="/studio/investigate"
          className="text-[15px] font-semibold text-white after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--ops-accent-strong)]"
        >
          Investigate a company you care about
        </Link>
        <p className="mt-1 text-[13px] leading-6 text-slate-400">
          Look up seven figures from its annual report and see whether it earns more than its
          capital costs, and how. Works for any company, not only those listed below.
        </p>
        {investigations.length > 0 ? (
          <span className="mt-2 block text-[13px] leading-5 text-slate-400">
            Saved so far: {investigations.map((item) => item.company.trim() || "Unnamed company").join(", ")}
          </span>
        ) : null}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13px]">
          <span aria-hidden="true" className="text-accent-cyan">
            {investigations.length > 0 ? "Carry on investigating →" : "Start an investigation →"}
          </span>
          <Link
            href="/studio/filings"
            className="relative z-10 text-accent-cyan underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
          >
            Find its annual report →
          </Link>
        </div>
      </div>
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-2">
        {STUDIO_CATALOG.map((instrument) => {
          const open = openId === instrument.id;
          const holding = plan.holdings.find((item) => item.instrumentId === instrument.id);
          return (
            <div
              key={instrument.id}
              className={cn(
                // min-w-0: a grid item otherwise grows to fit content that cannot
                // wrap, which widened every card and scrolled the page sideways.
                "relative min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4",
                open && "border-accent-cyan/30 lg:col-span-2",
              )}
            >
              {/* The add button sits in the corner so the name can use the whole
                  width. Beside it, long names wrapped to three lines and made the
                  list far taller than its content. */}
              <button
                type="button"
                onClick={() => setOpenId(open ? null : instrument.id)}
                aria-expanded={open}
                className="block w-full text-left"
              >
                <div className="flex min-h-11 items-center gap-2 pr-40">
                  <span className="text-[16px] font-semibold text-white">{instrument.symbol}</span>
                  {held.has(instrument.id) ? (
                    <span className="rounded-full border border-accent-green/40 bg-accent-green/10 px-2 py-0.5 text-[11px] text-accent-green">
                      In your portfolio
                    </span>
                  ) : null}
                </div>
                <div className="text-[14px] leading-6 text-slate-300">{instrument.name}</div>
                <div className="mt-0.5 text-[13px] text-slate-500">
                  {instrument.expenseRatioPct === null
                    ? "Annual cost not stated in a reviewed filing"
                    : `${instrument.expenseRatioPct}% a year in fund costs`}
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  update((current) =>
                    held.has(instrument.id)
                      ? removeStudioHolding(current, instrument.id)
                      : addStudioHolding(current, instrument.id),
                  )
                }
                className={cn(
                  "absolute right-4 top-4 min-h-11 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                  held.has(instrument.id)
                    ? "border-white/15 text-slate-300 hover:border-white/30 hover:text-white"
                    : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20",
                )}
              >
                {held.has(instrument.id) ? "Remove" : "Add to portfolio"}
              </button>

              {open ? (
                <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                  <p className="ops-body text-[14px] leading-6 text-slate-300">{instrument.whatItIs}</p>

                  <div>
                    <div className="ops-caption text-[11px] text-slate-500">What the filing calls its main risks</div>
                    <ul className="mt-2 space-y-1">
                      {instrument.mainRisks.map((risk) => (
                        <li key={risk} className="flex gap-2 text-[14px] leading-6 text-slate-300">
                          <span className="text-accent-amber">·</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <FundReportFacts instrument={instrument} />

                  {/*
                    Four facts a single share needs kept apart, because the
                    convenient assumption is that buying in dollars on a US
                    exchange makes something a US holding. It does not: TSM is
                    a Taiwanese company reporting in New Taiwan dollars, bought
                    in US dollars as a depositary share standing for five
                    ordinary ones. docs/source-audits/studio-learning.md (P3-P5)
                    requires the separation.
                  */}
                  {instrument.stock ? (
                    <div>
                      <div className="ops-caption text-[11px] text-slate-500">How you would hold it</div>
                      <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                        <Fact label="Incorporated in" value={instrument.stock.incorporatedIn} />
                        <Fact label="Trades on" value={`${instrument.stock.exchange}, in US dollars`} />
                        <Fact
                          label="What you buy"
                          value={
                            instrument.stock.adsRatio === null
                              ? instrument.stock.usListing
                              : `${instrument.stock.usListing}, each standing for ${instrument.stock.adsRatio} ordinary shares`
                          }
                        />
                        <Fact label="Company reports in" value={instrument.stock.reportsIn} />
                      </dl>
                    </div>
                  ) : null}

                  {/*
                    Only funds. A single share is its own issuer at 100%, so
                    "largest holdings, 100% documented" would restate the name
                    as though it were a finding.
                  */}
                  {instrument.kind === "fund" ? (
                    <div>
                      <div className="ops-caption text-[11px] text-slate-500">
                        Largest holdings, {pct(instrument.exposureCoveragePct ?? 0)} of the fund documented
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {instrument.exposures.slice(0, 6).map((exposure) => (
                          <li key={exposure.label} className="text-[13px] tabular-nums text-slate-400">
                            {exposure.label} {exposure.weightPct.toFixed(2)}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <div className="ops-caption text-[11px] text-slate-500">Where these facts come from</div>
                    <ul className="mt-2 space-y-1">
                      {instrument.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-slate-400 underline decoration-white/20 underline-offset-2 hover:text-accent-cyan"
                          >
                            {source.label}
                          </a>
                          <span className="text-[13px] text-slate-500"> · as of {source.asOf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/*
                    The record used to appear only for investments already in
                    the portfolio, which meant the one conclusion worth keeping
                    most -- "I read this and decided against it" -- had nowhere
                    to go. It is now here for everything in the catalogue.
                  */}
                  {record ? (
                    <ResearchRecord
                      instrument={instrument}
                      candidate={record.candidates.find((item) => item.instrumentId === instrument.id)}
                      held={held.has(instrument.id)}
                      actions={{
                        note: (patch) => record.note(instrument.id, patch),
                        setStatus: (status, rejectedBecause) => record.setStatus(instrument.id, status, rejectedBecause),
                        addEvidence: (entry) => record.addEvidence(instrument.id, entry),
                        removeEvidence: (evidenceId) => record.removeEvidence(instrument.id, evidenceId),
                      }}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* The gaps stay named on the page, with the detail one click away rather
          than a screen of scroll under the list. */}
      <details className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
        <summary className="cursor-pointer text-[14px] font-semibold text-slate-200">
          What you cannot research here yet
        </summary>
        <ul className="mt-3 space-y-2 text-[14px] leading-6 text-slate-300">
          {CATALOG_GAPS.map((gap) => (
            <li key={gap.missing}>
              <span className="font-semibold text-white">{gap.missing}.</span> {gap.whyItMatters}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Build
// ---------------------------------------------------------------------------

export function BuildStage(props: StageProps) {
  const { plan, calculation, update } = props;
  if (plan.holdings.length === 0) {
    return (
      <div className="space-y-5">
        <StageHeading {...headingFor(props)} title="Decide how much goes where" />
        {/* Not yet, rather than wrong: a new portfolio is shown the way forward, not a warning. */}
        <Notice tone="slate" title="Nothing to weight yet">
          Add at least one investment in{" "}
          <Link href="/studio/research" className="font-semibold text-accent-cyan underline underline-offset-2">
            Research
          </Link>
          , then come back to set how much of the money each one takes.
        </Notice>
      </div>
    );
  }

  const total = calculation.totalWeightPct;
  // Workspace only: the weights against the learner's own limits, and what holds each one back.
  const checked = props.limits ? checkPortfolio(plan, calculation, props.limits, props.scenarios?.list) : null;
  const roomFor = (instrumentId: string) => checked?.holdings.find((room) => room.instrumentId === instrumentId) ?? null;
  return (
    <div className="space-y-5">
      <StageHeading {...headingFor(props)} title="Decide how much goes where">
        Percentages apply to the {usdWhole(calculation.investableBudget)} left after your cash reserve. They need to
        total 100%.
      </StageHeading>

      <Panel>
        {/*
          Below 768px each investment is two lines -- the name and its box, then
          what that comes to -- instead of four columns that ran off the edge and
          put the box being typed in half out of sight.
        */}
        <TableScroll>
          <table className="block w-full text-left text-[14px] md:table md:min-w-[34rem]">
            <caption className="sr-only">Target weight and dollar amount for each investment</caption>
            <thead className="sr-only text-slate-400 md:not-sr-only">
              <tr>
                <th scope="col" className="py-2 pr-3 font-normal">Investment</th>
                <th scope="col" className="py-2 pr-3 text-right font-normal">Share of the investable money</th>
                <th scope="col" className="py-2 pr-3 text-right font-normal">Of the whole portfolio</th>
                <th scope="col" className="py-2 text-right font-normal">Dollars</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {calculation.rows.map((row) => (
                <Fragment key={row.holding.instrumentId}>
                <tr
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-white/8 py-3 first:border-t-0 first:pt-0 md:table-row md:py-0 md:first:border-t"
                >
                  <td className="block md:table-cell md:py-3 md:pr-3">
                    <div className="font-semibold text-white">{row.instrument?.symbol ?? row.holding.instrumentId}</div>
                    <div className="text-[13px] text-slate-500">{row.instrument?.name ?? "Not in the research library"}</div>
                  </td>
                  <td className="block whitespace-nowrap text-right md:table-cell md:py-3 md:pr-3">
                    <label className="sr-only" htmlFor={`weight-${row.holding.instrumentId}`}>
                      {row.instrument?.symbol ?? row.holding.instrumentId} target percentage
                    </label>
                    <NumberInput
                      id={`weight-${row.holding.instrumentId}`}
                      min={0}
                      max={100}
                      value={row.holding.targetWeightPct}
                      onChange={(raw) =>
                        update((current) =>
                          updateStudioHolding(current, row.holding.instrumentId, { targetWeightPct: num(raw) }),
                        )
                      }
                      className="min-h-11 w-24 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-right text-[15px] tabular-nums text-white focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 [@media(pointer:coarse)]:text-base"
                    />
                    {/* The column heading says what the number is; below 768px there is no column heading. */}
                    <span aria-hidden="true" className="ml-1.5 text-slate-400 md:hidden">%</span>
                  </td>
                  <td className="block text-[13px] tabular-nums text-slate-400 md:table-cell md:py-3 md:pr-3 md:text-right md:text-[14px] md:text-slate-300">
                    {pct(row.targetPortfolioWeightPct)}
                    <span className="md:hidden"> of the whole portfolio</span>
                  </td>
                  <td className="block text-right tabular-nums text-white md:table-cell md:py-3">{usd(row.targetValue)}</td>
                </tr>
                <WeightRoom symbol={row.instrument?.symbol ?? row.holding.instrumentId} room={roomFor(row.holding.instrumentId)} />
                </Fragment>
              ))}
              <tr className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-t border-white/15 pt-3 md:table-row md:pt-0">
                <td className="col-span-2 block text-slate-300 md:table-cell md:py-3 md:pr-3">Cash reserve and anything unassigned</td>
                <td className="hidden md:table-cell md:py-3 md:pr-3" />
                <td className="block text-[13px] tabular-nums text-slate-400 md:table-cell md:py-3 md:pr-3 md:text-right md:text-[14px] md:text-slate-300">
                  {pct(calculation.targetCashWeightPct)}
                  <span className="md:hidden"> of the whole portfolio</span>
                </td>
                <td className="block text-right tabular-nums text-white md:table-cell md:py-3">{usd(calculation.targetCash)}</td>
              </tr>
            </tbody>
          </table>
        </TableScroll>
      </Panel>

      {Math.abs(total - 100) > 0.01 ? (
        <Notice tone="amber" title={`Your percentages total ${pct(total)}`}>
          {total > 100
            ? "That counts the same money more than once. Reduce one or more until they total 100%."
            : `The remaining ${pct(100 - total)} stays in cash. That is a choice you can make on purpose — set it aside as a cash reserve in your goal if you meant it.`}
        </Notice>
      ) : (
        <Notice tone="green" title="The percentages total 100%">
          Every dollar after your cash reserve has a job.
        </Notice>
      )}

      {/* Beside the work from 1280px, in the frame's side column; here below it. */}
      {checked ? <div className="xl:hidden"><LimitChecks checks={checked.checks} /></div> : null}
    </div>
  );
}

/**
 * What holds one weight back, in a row of its own under the holding: a phone's
 * first column is too narrow for the sentence, and a table reads it the same.
 */
function WeightRoom({ symbol, room }: { symbol: string; room: HoldingRoom | null }) {
  // The same sentence the readable plan prints.
  const text = room ? describeRoom(room) : null;
  if (!room || !text) return null;
  return (
    <tr className="block md:table-row">
      <td colSpan={4} className={cn("block pb-3 text-[12px] leading-5 md:table-cell md:pb-3 md:pt-0", room.over ? "text-accent-amber" : "text-slate-500")}>
        <span className="sr-only">{symbol}: </span>
        {text}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// 4. Risk and costs
// ---------------------------------------------------------------------------

export function RiskStage(props: StageProps) {
  const { plan, calculation, update } = props;
  const scenarios = props.scenarios;
  const list = scenarios?.list ?? [{ id: "first", name: "Scenario 1", stress: plan.stress }];
  const [view, setView] = useState<RiskView>("scenario");
  const [selectedId, setSelectedId] = useState(list[0].id);
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [focusName, setFocusName] = useState(false);
  useEffect(() => { if (focusName) { nameRef.current?.focus(); setFocusName(false); } }, [focusName, selectedId]);
  const selected = list.find((scenario) => scenario.id === selectedId) ?? list[0];
  const several = list.length > 1;
  const setStress = (patch: Partial<StudioPlan["stress"]>) => scenarios
    ? scenarios.update(selected.id, patch)
    : update((current) => ({ ...current, stress: { ...current.stress, ...patch }, updatedAt: new Date().toISOString() }));

  // Every scenario is priced by the same arithmetic; the worst is the one that loses most here.
  const results = list.map((scenario) => ({ ...scenario, result: scenarioResult(calculation, scenario.stress) }));
  const shown = results.find((scenario) => scenario.id === selected.id) ?? results[0];
  const worst = results.reduce((low, scenario) => (scenario.result.changeDollars < low.result.changeDollars - 0.005 ? scenario : low), results[0]);
  const byLoss = [...results].sort((a, b) => a.result.changeDollars - b.result.changeDollars);

  // The same loss budget Goals shows, by the same rule as the limit check: a gain is never over it.
  const limits = props.limits ?? emptyLimits();
  const lossIn = (change: number) => scenarioLoss(plan, calculation, limits, change);
  const over = (change: number) => { const loss = lossIn(change); return loss.set && !loss.met; };
  const budget = lossIn(worst.result.changeDollars);
  const shownLoss = lossIn(shown.result.changeDollars);
  const exceeds = calculation.valid && over(worst.result.changeDollars);

  /*
   * On a phone, several scenarios show one thing at a time: the list, or the
   * scenario opened from it. From 768px both are on screen and this is moot.
   * Focus follows: into the opened scenario's name, back to its row.
   */
  const [editing, setEditing] = useState(false);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [focusRow, setFocusRow] = useState(false);
  useEffect(() => { if (focusRow) { rowRefs.current[selected.id]?.focus(); setFocusRow(false); } }, [focusRow, editing, selected.id]);
  const wide = () => window.matchMedia("(min-width: 768px)").matches;

  const add = async () => {
    if (!scenarios) return;
    setBusy(true);
    const id = await scenarios.add(selected.id);
    setBusy(false);
    if (id) { setSelectedId(id); setEditing(true); setFocusName(true); }
  };
  const remove = async () => {
    if (!scenarios) return;
    setBusy(true);
    const result = await scenarios.remove(selected.id);
    setBusy(false);
    if (!result.ok) return;
    setSelectedId(list.find((scenario) => scenario.id !== selected.id)!.id);
    if (wide()) setFocusName(true);
    else { setEditing(false); setFocusRow(true); }
  };
  const open = (id: string) => { setSelectedId(id); setEditing(true); setFocusName(true); };
  const back = () => { setEditing(false); setFocusRow(true); };

  /*
    One field per asset class the catalog can actually hold. International
    was missing while every reviewed fund tracked a US index; adding VXUS
    made its shock apply to a real holding with no way to set it, so the
    scenario silently used a stored default. Global has no instrument yet
    and stays out for the same reason in reverse — a control with nothing
    to act on.

    Two to a row even on a phone: one to a row, four short numbers took
    a third of the screen.
  */
  const stressFields = (className: string) => (
    <div key={selected.id} className={className}>
      <Field
        label="US stocks" type="number" min={-100} max={100} suffix="%"
        value={selected.stress.usStocksPct}
        onChange={(value) => setStress({ usStocksPct: num(value) })}
      />
      <Field
        label="International stocks" type="number" min={-100} max={100} suffix="%"
        value={selected.stress.internationalStocksPct}
        onChange={(value) => setStress({ internationalStocksPct: num(value) })}
      />
      <Field
        label="Bonds" type="number" min={-100} max={100} suffix="%"
        value={selected.stress.bondsPct}
        onChange={(value) => setStress({ bondsPct: num(value) })}
      />
      <Field
        label="Cash" type="number" min={-100} max={100} suffix="%"
        value={selected.stress.cashPct}
        onChange={(value) => setStress({ cashPct: num(value) })}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <StageHeading {...headingFor(props)} title="Check the risk and the cost">
        These are assumptions you choose, not forecasts.
      </StageHeading>

      {/*
        * Three questions, one at a time. Stacked, the scenario, the fund costs
        * and the overlap made this page 2.3 screens on a phone. The scenario
        * opens first: Compare allocations' "Edit scenario" link lands here.
        */}
      <ViewTabs
        label="Risk and cost" idPrefix="risk" className={STAGE_TABS} selected={view} onSelect={setView}
        // Plural once there are several; the count is in the list and the editor, and on a phone it took the tab to two lines.
        tabs={RISK_VIEWS.map((tab) => (tab.id === "scenario" && several ? { ...tab, label: "Loss scenarios" } : tab))}
      />
      <div role="tabpanel" id="risk-panel" aria-labelledby={`risk-tab-${view}`} className="space-y-5">
        {view === "scenario" ? (
          <>
            {!calculation.valid ? (
              <Notice tone="amber" title="Fix the weights first">
                {calculation.issues[0] ?? "The portfolio's amounts need fixing."} Until then there is no allocation to test.
              </Notice>
            ) : null}
            {scenarios && several ? (
              /*
               * Several scenarios: the list and the open scenario side by side
               * from 768px. Stacked, the two made a phone 1.75-1.85 screens and
               * 1024px 1.55-1.63. On a phone the list comes first and a scenario
               * opens to be edited, with its own result beside its numbers, so
               * an edit's consequence stays on the screen it is made on.
               */
              <div className="grid gap-5 md:grid-cols-2 md:items-start">
                <div className={cn(editing && "hidden md:block")}>
                  <Panel>
                    <table className="w-full table-fixed text-[13px]">
                      <caption className="ops-caption pb-2 text-left text-[12px] text-st-faint">Your scenarios, largest loss first</caption>
                      <thead>
                        <tr className="border-b border-st-hair text-left text-[12px] text-st-faint">
                          <th scope="col" className="w-[46%] py-2 pr-2 font-normal">Scenario</th>
                          <th scope="col" className="py-2 pr-2 text-right font-normal">Change</th>
                          <th scope="col" className="py-2 text-right font-normal">Loss budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {byLoss.map((scenario) => (
                          <tr key={scenario.id} className="border-b border-st-hair last:border-0">
                            <th scope="row" className="py-0.5 pr-2 text-left font-normal">
                              <button
                                ref={(element) => { rowRefs.current[scenario.id] = element; }}
                                type="button"
                                aria-pressed={scenario.id === selected.id}
                                onClick={() => open(scenario.id)}
                                className="min-h-8 max-w-full truncate text-left text-st-ink underline decoration-st-bound underline-offset-4 hover:decoration-st-ink aria-pressed:font-semibold aria-pressed:no-underline [@media(pointer:coarse)]:min-h-11"
                              >
                                {scenario.name}
                              </button>
                            </th>
                            <td className="py-1.5 pr-2 text-right tabular-nums text-st-ink">{calculation.valid ? usdWhole(scenario.result.changeDollars) : "—"}</td>
                            <td className={cn("py-1.5 text-right", calculation.valid && over(scenario.result.changeDollars) ? "font-semibold text-st-warn" : "text-st-muted")}>
                              {!calculation.valid ? "—" : !budget.set ? "Not set" : over(scenario.result.changeDollars) ? "Over" : "Within"}
                              {calculation.valid && scenario.id === worst.id ? <span className="font-normal text-st-muted"> · worst</span> : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* One sentence: which scenario is worst, against the budget, and what "worst" does not mean. */}
                    {calculation.valid ? (
                      <p className={cn("mt-3 text-[13px] leading-6", exceeds ? "text-st-warn" : "text-st-muted")}>
                        “{worst.name}” is the worst you set, not the worst that could happen.{" "}
                        {!budget.set
                          ? "Set the loss you could live with on Goals to check it."
                          : exceeds
                            ? `It costs ${usdWhole(budget.loses)}, more than your ${usdWhole(budget.allowed)} loss budget. Either the weights or the limit needs to change — Studio will not choose which.`
                            : `It costs ${usdWhole(budget.loses)}, within your ${usdWhole(budget.allowed)} loss budget.`}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-st-hair pt-3">
                      {list.length < MAX_SCENARIOS ? (
                        <button type="button" disabled={busy} onClick={() => void add()} className={SECONDARY}>
                          Add a scenario
                        </button>
                      ) : null}
                      <p className="min-w-0 flex-1 basis-40 text-[12px] leading-5 text-st-muted">
                        {list.length >= MAX_SCENARIOS
                          ? `Up to ${MAX_SCENARIOS}: remove one to add another.`
                          : `A new one starts as a copy of “${selected.name}”. Up to ${MAX_SCENARIOS}.`}
                      </p>
                    </div>
                  </Panel>
                </div>
                <div className={cn(!editing && "hidden md:block")}>
                  <Panel>
                    <button type="button" onClick={back} className={cn(INLINE_BUTTON, "mb-2 md:hidden")}>
                      ← All scenarios
                    </button>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <label className="flex min-w-0 max-w-md flex-1 items-center gap-3">
                        <span className="shrink-0 text-[13px] font-semibold text-st-ink">Scenario name</span>
                        <input
                          key={selected.id}
                          ref={nameRef}
                          defaultValue={selected.name}
                          maxLength={60}
                          onBlur={(event) => { if (event.target.value !== selected.name) void scenarios.rename(selected.id, event.target.value); }}
                          className="min-h-11 w-full min-w-0 rounded-lg border border-st-bound bg-st-paper px-3 py-2 text-[15px] text-st-ink focus:border-st-blue-edge focus:outline-none focus-visible:ring-2 focus-visible:ring-st-blue-edge [@media(pointer:coarse)]:text-base"
                        />
                      </label>
                      <div className="text-[12px] text-st-faint">{list.findIndex((scenario) => scenario.id === selected.id) + 1} of {list.length}</div>
                    </div>
                    <div className="ops-caption text-[12px] text-st-faint">Assume prices change by</div>
                    {/* Two to a row at every width: beside the list, the column is half the page. */}
                    {stressFields("mt-3 grid grid-cols-2 gap-4")}
                    {/* On a phone the list is out of sight while a scenario is open, so its result is said here. */}
                    {calculation.valid ? (
                      <p className={cn("mt-4 text-[14px] leading-6 md:hidden", over(shown.result.changeDollars) ? "text-accent-amber" : "text-slate-300")}>
                        This scenario: {usdWhole(shown.result.changeDollars)}, {pct(shown.result.changePct)} of the portfolio,{" "}
                        {!budget.set ? "with no loss budget set." : over(shown.result.changeDollars) ? "more than your loss budget." : "within your loss budget."}
                      </p>
                    ) : null}
                    <div className="mt-4 border-t border-st-hair pt-3">
                      <button type="button" disabled={busy} onClick={() => void remove()} className={TEXT_BUTTON}>
                        Remove this scenario
                      </button>
                    </div>
                  </Panel>
                </div>
              </div>
            ) : (
              <Panel>
                {/*
                  * With one scenario, adding another is a link on the caption's line: the tab
                  * has to fit a phone, and a row of its own took a sixth of that screen. What
                  * the worst of several means is said once there are several.
                  */}
                <div className="flex flex-wrap items-center justify-between gap-x-4">
                  <div className="ops-caption text-[12px] text-st-faint">Assume prices change by</div>
                  {scenarios ? (
                    <button type="button" disabled={busy} onClick={() => void add()} className={INLINE_BUTTON}>
                      Add a second scenario
                    </button>
                  ) : null}
                </div>
                {stressFields("mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4")}
                {/*
                  * The budget beside the result, whether or not it is passed: comparing
                  * the two is the point of the scenario. It was a box that appeared only
                  * once the loss went over, a sixth of a phone screen on its own.
                  */}
                {calculation.valid ? (
                  <>
                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Stat label="Change in this scenario" value={usd(shown.result.changeDollars)} />
                      <Stat label="As a share of the portfolio" value={pct(shown.result.changePct)} />
                      <Stat label="Value afterwards" value={usd(shown.result.endingValue)} />
                      <Stat
                        label="Your loss budget"
                        value={shownLoss.set ? usd(shownLoss.allowed) : "Not set"}
                        detail={shownLoss.set ? `The loss you could ${shownLoss.from === "capacity" ? "afford" : "live with"}` : "Set it on Goals"}
                      />
                    </div>
                    {shownLoss.set && !shownLoss.met ? (
                      <p className="mt-4 text-[14px] leading-6 text-accent-amber">
                        That loss is {usd(shownLoss.loses - shownLoss.allowed)} more than your loss budget. Either the weights or the limit needs to
                        change — Studio will not choose which.
                      </p>
                    ) : null}
                  </>
                ) : null}
              </Panel>
            )}
          </>
        ) : view === "costs" ? (
          <Panel>
            <p className="text-[14px] leading-6 text-slate-300">What the funds you hold charge each year.</p>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat
                label="At today's amounts"
                value={usd(calculation.fees.annualKnownCost)}
                detail="Fund operating costs only"
              />
              <Stat label="As a share of the portfolio" value={pct(calculation.fees.weightedKnownExpenseRatioPct, 3)} />
              <Stat
                label="Costs known"
                value={pct(calculation.fees.coveragePct, 0)}
                detail={calculation.fees.coveragePct < 100 ? "Some funds have no filed cost" : "Every fund has a filed cost"}
              />
            </div>
            <p className="mt-3 text-[13px] leading-6 text-slate-500">
              Trading charges, spreads and taxes are separate and are not included here.
            </p>
          </Panel>
        ) : (
          <Panel>
            {/* A company or a government: the Treasury note and a bond fund repeat the same issuer. */}
            <p className="text-[14px] leading-6 text-slate-300">The same company or government, held through more than one of your investments.</p>
            {calculation.overlaps.length === 0 ? (
              <p className="mt-2 text-[14px] leading-6 text-slate-300">
                No repeated company appears in the holdings that have been documented. That is not proof there is none —
                only {pct(calculation.exposureCoveragePct)} of the portfolio&rsquo;s holdings are documented.
              </p>
            ) : (
              <>
                <ul className="mt-2 space-y-1">
                  {calculation.overlaps.slice(0, 8).map((overlap) => (
                    <li key={overlap.label} className="text-[14px] leading-6 text-slate-300">
                      <span className="tabular-nums text-white">{pct(overlap.portfolioWeightPct, 2)}</span> {overlap.label},
                      held through {overlap.instrumentIds.map((id) => symbolOf(calculation, id)).join(" and ")}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[13px] leading-6 text-slate-500">
                  Based on {pct(calculation.exposureCoveragePct)} of the portfolio. Holdings the filings do not list stay
                  unknown, so the real overlap can only be larger.
                </p>
              </>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

const SECONDARY =
  "inline-flex min-h-11 items-center rounded-lg border border-st-bound bg-st-paper px-4 text-[14px] font-semibold text-st-ink hover:bg-st-canvas disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]";
/** A link-sized action inside a line of text; 44px to a finger. */
const INLINE_BUTTON =
  "min-h-8 text-[13px] text-st-ink underline decoration-st-bound underline-offset-4 hover:decoration-st-ink disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)] [@media(pointer:coarse)]:min-h-11";
const TEXT_BUTTON =
  "min-h-11 text-[14px] text-st-ink underline decoration-st-bound underline-offset-4 hover:decoration-st-ink disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]";

type RiskView = "scenario" | "costs" | "overlap";
const RISK_VIEWS: { id: RiskView; label: string; className: string }[] = [
  { id: "scenario", label: "Loss scenario", className: STAGE_TAB },
  { id: "costs", label: "Fund costs", className: STAGE_TAB },
  { id: "overlap", label: "Overlap", className: STAGE_TAB },
];

// ---------------------------------------------------------------------------
// 5. Buying worksheet
// ---------------------------------------------------------------------------

export function BuyStage(props: StageProps) {
  const { plan, calculation, update } = props;
  if (calculation.orders.length === 0) {
    return (
      <div className="space-y-5">
        <StageHeading {...headingFor(props)} title="Work out what to buy" />
        <Notice tone="slate" title="Set your weights first">
          Studio needs your percentages before it can work out amounts. Set them under{" "}
          <Link href="/studio/portfolio" className="font-semibold text-accent-cyan underline underline-offset-2">
            How much goes where
          </Link>
          .
        </Notice>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <StageHeading {...headingFor(props)} title="Work out what to buy">
        Each investment starts from its last price on record, with the date it was true. If your broker shows a
        different price, enter it, and the quantity is worked out from yours instead.
      </StageHeading>

      <Notice tone="slate">
        Nothing here places an order or connects to a broker. It is a worksheet you carry to wherever you actually buy.
      </Notice>

      <div className="space-y-3">
        {calculation.rows.map((row) => {
          const order = calculation.orders.find((item) => item.instrumentId === row.holding.instrumentId);
          const isBond = row.instrument?.kind === "bond";
          return (
            <Panel key={row.holding.instrumentId}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-[16px] font-semibold text-white">
                  {row.instrument?.symbol ?? row.holding.instrumentId}
                </div>
                <div className="text-[14px] tabular-nums text-slate-300">Target {usd(row.targetValue)}</div>
              </div>
              {/*
                * Which price the amounts below come from. A price on record is months old by
                * the time anyone reads it, so its date and what it is sit right beside it; a
                * broker's price, once entered, replaces it.
                */}
              <p className="mt-1 text-[13px] leading-6 text-slate-400">
                {row.holding.quotePrice !== null
                  ? `Worked out from your broker's price${isBond ? " per $100 of face value" : ""}, ${usd(row.holding.quotePrice)}${row.holding.quoteAsOf ? `, from ${row.holding.quoteAsOf}` : ""}.`
                  : row.instrument && row.instrument.referencePrice !== null
                    ? `Worked out from ${usd(row.instrument.referencePrice)}${isBond ? " per $100 of face value" : " a share"}, the price on ${longDate(row.instrument.priceAsOf)}: ${row.instrument.priceSource}.`
                    : "There is no price on record for this one. Enter your broker's price to work out a quantity."}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field
                  label={isBond ? "Your broker's price per $100 of face value (optional)" : "Your broker's price per share (optional)"}
                  type="number" min={0} prefix="$"
                  value={row.holding.quotePrice ?? ""}
                  onChange={(event) =>
                    update((current) =>
                      updateStudioHolding(current, row.holding.instrumentId, {
                        quotePrice: event.trim() === "" ? null : num(event),
                      }),
                    )
                  }
                />
                <Field
                  label="Date of your broker's price"
                  type="text"
                  placeholder="2026-09-04"
                  value={row.holding.quoteAsOf}
                  onChange={(value) =>
                    update((current) => updateStudioHolding(current, row.holding.instrumentId, { quoteAsOf: value }))
                  }
                />
                <Field
                  label="Fee your broker charges"
                  type="number" min={0} prefix="$"
                  value={row.holding.tradeFee}
                  onChange={(value) =>
                    update((current) => updateStudioHolding(current, row.holding.instrumentId, { tradeFee: num(value) }))
                  }
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label={order?.unit === "face value" ? "Face value" : "Shares"} value={String(order?.quantity ?? 0)} />
                <Stat label="Cost of those" value={usd(order?.principalCost ?? 0)} />
                <Stat label="Estimated total" value={usd(order?.estimatedCost ?? 0)} />
                <Stat label="Left in cash" value={usd(order?.leftover ?? row.targetValue)} />
              </div>

              {order && order.warnings.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {order.warnings.map((warning) => (
                    <li key={warning} className="text-[13px] leading-6 text-accent-amber">
                      {warning}
                    </li>
                  ))}
                </ul>
              ) : null}

              {isBond ? (
                <p className="mt-3 text-[13px] leading-6 text-slate-400">
                  <Link href="/studio/portfolio/bond" className="text-accent-cyan underline underline-offset-2 hover:text-white">
                    Work out the interest built up by the day you settle
                  </Link>{" "}
                  and bring the figure back here, so this total is not short by it.
                </p>
              ) : null}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Review and rules
// ---------------------------------------------------------------------------

export function ReviewStage(props: StageProps) {
  const { plan, calculation, update, importBackup, reset, actions } = props;
  const setRules = (patch: Partial<StudioPlan["rules"]>) =>
    update((current) => ({ ...current, rules: { ...current.rules, ...patch }, updatedAt: new Date().toISOString() }));
  const [view, setView] = useState<ReviewView>("rules");

  return (
    <div className="space-y-5">
      <StageHeading {...headingFor(props)} title="Write the rules and keep a copy">
        Decide now what you will do later, while nothing is happening and you can think clearly.
      </StageHeading>

      {/* The rules sit on top of these limits. From 1280px the line is beside the work, in the side column. */}
      {props.limits && plan.holdings.length > 0 ? (
        <div className="xl:hidden">
          <LimitChecks checks={checkPortfolio(plan, calculation, props.limits, props.scenarios?.list).checks} />
        </div>
      ) : null}

      {/*
        * Three jobs, one at a time. Stacked, they made Review 2.4 screens on a
        * phone; the written rules alone are most of a screen there.
        */}
      <ViewTabs label="Review" idPrefix="review" className={STAGE_TABS} tabs={REVIEW_VIEWS} selected={view} onSelect={setView} />
      <div role="tabpanel" id="review-panel" aria-labelledby={`review-tab-${view}`}>
      {view === "rules" ? (
      <Panel>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="What I do with new money"
            value={plan.rules.contributionRule}
            onChange={(value) => setRules({ contributionRule: value })}
            placeholder="Each month, into whichever holding is furthest below its target."
            multiline
          />
          <Field
            label="What must be true before I sell"
            value={plan.rules.sellRule}
            onChange={(value) => setRules({ sellRule: value })}
            placeholder="Only if the reason I wrote down for owning it has stopped being true."
            multiline
          />
          <Field
            label="Lines I will not cross"
            value={plan.rules.guardrails}
            onChange={(value) => setRules({ guardrails: value })}
            placeholder="No borrowing to invest. No changes in the week after a fall."
            multiline
          />
        </div>
      </Panel>
      ) : view === "check" ? (
      <Panel>
        {/* When to look, what makes a look turn into action, and where things stand when you do. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Choice
            label="How often you will check"
            value={plan.rules.reviewFrequency}
            onChange={(value) => setRules({ reviewFrequency: value })}
            options={[
              { value: "monthly", label: "Every month" },
              { value: "quarterly", label: "Every three months" },
              { value: "yearly", label: "Once a year" },
            ]}
          />
          <Field
            label="Act when a holding drifts this far from target"
            hint="In percentage points of the whole portfolio."
            type="number" min={0} max={100} suffix="points"
            value={plan.rules.driftThresholdPct}
            onChange={(value) => setRules({ driftThresholdPct: num(value) })}
          />
          <Field
            label="What the investments are worth now"
            hint="Leave at zero until you have actually bought something."
            type="number" min={0} prefix="$"
            value={plan.currentCash}
            onChange={(value) => update((current) => ({ ...current, currentCash: num(value) }))}
          />
          <Field
            label="New money to put in now"
            type="number" min={0} prefix="$"
            value={plan.contributionAmount}
            onChange={(value) => update((current) => ({ ...current, contributionAmount: num(value) }))}
          />
        </div>
        {calculation.contributions.amount > 0 ? (
          <ul className="mt-4 space-y-1">
            {calculation.contributions.rows
              .filter((row) => row.amount > 0)
              .map((row) => (
                <li key={row.instrumentId} className="text-[14px] leading-6 text-slate-300">
                  <span className="tabular-nums text-white">{usd(row.amount)}</span> toward{" "}
                  {symbolOf(calculation, row.instrumentId)}
                </li>
              ))}
            <li className="text-[14px] leading-6 text-slate-400">
              <span className="tabular-nums">{usd(calculation.contributions.cash)}</span> stays in cash
            </li>
          </ul>
        ) : null}
      </Panel>
      ) : (
      <Panel>
        <p className="text-[14px] leading-6 text-slate-400">
          Studio saves in this browser only. Clearing site data erases it, so keep a backup.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={actions ? actions.downloadBackup : () => downloadFile(`${plan.name}.json`, exportStudioJson(plan), "application/json")}
            className="min-h-11 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-5 text-[14px] font-semibold text-accent-cyan hover:bg-accent-cyan/20"
          >
            Download a backup
          </button>
          <button
            type="button"
            onClick={actions ? actions.downloadText : () => downloadFile(`${plan.name}.txt`, exportStudioText(plan, STUDIO_CATALOG), "text/plain")}
            className="min-h-11 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-slate-200 hover:border-white/30"
          >
            Download the readable plan
          </button>
          <button
            type="button"
            onClick={actions ? actions.downloadCsv : () => downloadFile(`${plan.name}.csv`, exportStudioCsv(plan, STUDIO_CATALOG), "text/csv")}
            className="min-h-11 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-slate-200 hover:border-white/30"
          >
            Download a spreadsheet
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <label className="min-h-11 cursor-pointer rounded-full border border-white/15 px-5 text-[14px] font-medium leading-[2.75rem] text-slate-200 hover:border-white/30">
            Restore from a backup
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                const text = await file.text();
                if (actions) void actions.restore(text);
                else void importBackup(text);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Start an empty portfolio? Your saved work will be replaced. Download a backup first if you want to keep it.",
                )
              ) {
                if (actions) void actions.startAgain();
                else void reset();
              }
            }}
            className="min-h-11 rounded-full border border-white/15 px-5 text-[14px] font-medium text-slate-400 hover:border-accent-red/40 hover:text-accent-red"
          >
            Start again
          </button>
        </div>
      </Panel>
      )}
      </div>
    </div>
  );
}

type ReviewView = "rules" | "check" | "copy";
const REVIEW_VIEWS: { id: ReviewView; label: string; className: string }[] = [
  { id: "rules", label: "Your rules", className: STAGE_TAB },
  { id: "check", label: "When you check", className: STAGE_TAB },
  { id: "copy", label: "Keep a copy", className: STAGE_TAB },
];
