"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CATALOG_GAPS, STUDIO_CATALOG, findStudioInstrument } from "@/lib/studio-catalog";
import {
  addStudioHolding,
  exportStudioCsv,
  exportStudioJson,
  exportStudioText,
  removeStudioHolding,
  updateStudioHolding,
  type StudioCalculation,
  type StudioPlan,
} from "@/lib/studio";
import type { StudioMutationResult } from "@/lib/use-studio-plan";
import { Choice, Field, Notice, Panel, Stat, StageHeading, TableScroll, pct, usd, usdWhole } from "./shared";

export type StageProps = {
  plan: StudioPlan;
  calculation: StudioCalculation;
  update: (change: (plan: StudioPlan) => StudioPlan) => StudioMutationResult;
  /** Whole-portfolio actions. They live in step 6 beside the downloads, rather
   *  than in a panel stacked under every other step. */
  importBackup: (text: string) => StudioMutationResult;
  reset: () => StudioMutationResult;
};

/** Blank and partial entries stay blank rather than silently becoming zero. */
const num = (raw: string, fallback = 0): number => {
  if (raw.trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// 1. Goal
// ---------------------------------------------------------------------------

export function GoalStage({ plan, update }: StageProps) {
  const setGoal = (patch: Partial<StudioPlan["goal"]>) =>
    update((current) => ({ ...current, goal: { ...current.goal, ...patch }, updatedAt: new Date().toISOString() }));

  return (
    <div className="space-y-5">
      <StageHeading eyebrow="Step 1" title="Give the money a job">
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

export function ResearchStage({ plan, update }: StageProps) {
  const [openId, setOpenId] = useState<string | null>(STUDIO_CATALOG[0]?.id ?? null);
  const held = new Set(plan.holdings.map((holding) => holding.instrumentId));

  return (
    <div className="space-y-5">
      <StageHeading eyebrow="Step 2" title="Research what you might buy">
        Read what each investment actually is and what it holds, then write down why it belongs in your plan.
      </StageHeading>

      <div className="space-y-3">
        {STUDIO_CATALOG.map((instrument) => {
          const open = openId === instrument.id;
          const holding = plan.holdings.find((item) => item.instrumentId === instrument.id);
          return (
            <Panel key={instrument.id} className={cn(open && "border-accent-cyan/30")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : instrument.id)}
                  aria-expanded={open}
                  className="min-h-11 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold text-white">{instrument.symbol}</span>
                    {held.has(instrument.id) ? (
                      <span className="rounded-full border border-accent-green/40 bg-accent-green/10 px-2 py-0.5 text-[11px] text-accent-green">
                        In your portfolio
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-[14px] leading-6 text-slate-300">{instrument.name}</div>
                  <div className="mt-1 text-[13px] text-slate-500">
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
                    "min-h-11 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                    held.has(instrument.id)
                      ? "border-white/15 text-slate-300 hover:border-white/30 hover:text-white"
                      : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20",
                  )}
                >
                  {held.has(instrument.id) ? "Remove" : "Add to portfolio"}
                </button>
              </div>

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

                  {holding ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field
                        label="Why I chose it"
                        value={holding.research.why}
                        onChange={(value) =>
                          update((current) => updateStudioHolding(current, instrument.id, { research: { why: value } }))
                        }
                        multiline
                      />
                      <Field
                        label="The main risk I accept"
                        value={holding.research.mainRisk}
                        onChange={(value) =>
                          update((current) =>
                            updateStudioHolding(current, instrument.id, { research: { mainRisk: value } }),
                          )
                        }
                        multiline
                      />
                      <Field
                        label="What would change my mind"
                        value={holding.research.whatWouldChangeMyMind}
                        onChange={(value) =>
                          update((current) =>
                            updateStudioHolding(current, instrument.id, {
                              research: { whatWouldChangeMyMind: value },
                            }),
                          )
                        }
                        multiline
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Panel>
          );
        })}
      </div>

      <Notice tone="slate" title="What you cannot research here yet">
        <ul className="mt-2 space-y-2">
          {CATALOG_GAPS.map((gap) => (
            <li key={gap.missing}>
              <span className="font-semibold text-white">{gap.missing}.</span> {gap.whyItMatters}
            </li>
          ))}
        </ul>
      </Notice>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Build
// ---------------------------------------------------------------------------

export function BuildStage({ plan, calculation, update }: StageProps) {
  if (plan.holdings.length === 0) {
    return (
      <div className="space-y-5">
        <StageHeading eyebrow="Step 3" title="Decide how much goes where" />
        <Notice tone="amber" title="Nothing to weight yet">
          Add at least one investment in step 2, then come back to set how much of the money each one takes.
        </Notice>
      </div>
    );
  }

  const total = calculation.totalWeightPct;
  return (
    <div className="space-y-5">
      <StageHeading eyebrow="Step 3" title="Decide how much goes where">
        Percentages apply to the {usdWhole(calculation.investableBudget)} left after your cash reserve. They need to
        total 100%.
      </StageHeading>

      <Panel>
        <TableScroll>
          <table className="w-full min-w-[34rem] text-left text-[14px]">
            <caption className="sr-only">Target weight and dollar amount for each investment</caption>
            <thead className="text-slate-400">
              <tr>
                <th scope="col" className="py-2 pr-3 font-normal">Investment</th>
                <th scope="col" className="py-2 pr-3 text-right font-normal">Share of the investable money</th>
                <th scope="col" className="py-2 pr-3 text-right font-normal">Of the whole portfolio</th>
                <th scope="col" className="py-2 text-right font-normal">Dollars</th>
              </tr>
            </thead>
            <tbody>
              {calculation.rows.map((row) => (
                <tr key={row.holding.instrumentId} className="border-t border-white/8">
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-white">{row.instrument?.symbol ?? row.holding.instrumentId}</div>
                    <div className="text-[13px] text-slate-500">{row.instrument?.name ?? "Not in the research library"}</div>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <label className="sr-only" htmlFor={`weight-${row.holding.instrumentId}`}>
                      {row.instrument?.symbol ?? row.holding.instrumentId} target percentage
                    </label>
                    <input
                      id={`weight-${row.holding.instrumentId}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      value={row.holding.targetWeightPct}
                      onChange={(event) =>
                        update((current) =>
                          updateStudioHolding(current, row.holding.instrumentId, {
                            targetWeightPct: num(event.currentTarget.value),
                          }),
                        )
                      }
                      className="min-h-11 w-24 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-right text-[15px] tabular-nums text-white focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                    />
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums text-slate-300">
                    {pct(row.targetPortfolioWeightPct)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-white">{usd(row.targetValue)}</td>
                </tr>
              ))}
              <tr className="border-t border-white/15">
                <td className="py-3 pr-3 text-slate-300">Cash reserve and anything unassigned</td>
                <td className="py-3 pr-3" />
                <td className="py-3 pr-3 text-right tabular-nums text-slate-300">
                  {pct(calculation.targetCashWeightPct)}
                </td>
                <td className="py-3 text-right tabular-nums text-white">{usd(calculation.targetCash)}</td>
              </tr>
            </tbody>
          </table>
        </TableScroll>
      </Panel>

      {Math.abs(total - 100) > 0.01 ? (
        <Notice tone="amber" title={`Your percentages total ${pct(total)}`}>
          {total > 100
            ? "That counts the same money more than once. Reduce one or more until they total 100%."
            : `The remaining ${pct(100 - total)} stays in cash. That is a choice you can make on purpose — set it aside as a cash reserve in step 1 if you meant it.`}
        </Notice>
      ) : (
        <Notice tone="green" title="The percentages total 100%">
          Every dollar after your cash reserve has a job.
        </Notice>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Risk and costs
// ---------------------------------------------------------------------------

export function RiskStage({ plan, calculation, update }: StageProps) {
  const setStress = (patch: Partial<StudioPlan["stress"]>) =>
    update((current) => ({ ...current, stress: { ...current.stress, ...patch }, updatedAt: new Date().toISOString() }));

  const lossLimit = plan.goal.budget * plan.goal.lossTolerancePct / 100;
  const exceeds = Math.abs(calculation.stress.changeDollars) > lossLimit && lossLimit > 0;

  return (
    <div className="space-y-5">
      <StageHeading eyebrow="Step 4" title="Check the risk and the cost">
        These are assumptions you choose, not forecasts. Nothing here predicts what markets will do.
      </StageHeading>

      <Panel>
        <div className="ops-caption text-[11px] text-slate-500">Assume prices change by</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Field
            label="US stocks" type="number" min={-100} max={100} suffix="%"
            value={plan.stress.usStocksPct}
            onChange={(value) => setStress({ usStocksPct: num(value) })}
          />
          <Field
            label="Bonds" type="number" min={-100} max={100} suffix="%"
            value={plan.stress.bondsPct}
            onChange={(value) => setStress({ bondsPct: num(value) })}
          />
          <Field
            label="Cash" type="number" min={-100} max={100} suffix="%"
            value={plan.stress.cashPct}
            onChange={(value) => setStress({ cashPct: num(value) })}
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Change in this scenario" value={usd(calculation.stress.changeDollars)} />
          <Stat label="As a share of the portfolio" value={pct(calculation.stress.changePct)} />
          <Stat label="Value afterwards" value={usd(calculation.stress.endingValue)} />
        </div>
      </Panel>

      {exceeds ? (
        <Notice tone="amber" title="This scenario is larger than the loss you said you could live with">
          You wrote that you could absorb {usdWhole(lossLimit)}. This assumed scenario costs{" "}
          {usdWhole(Math.abs(calculation.stress.changeDollars))}. Either the weights or the limit needs to change —
          Studio will not choose which.
        </Notice>
      ) : null}

      <Panel>
        <div className="ops-caption text-[11px] text-slate-500">Yearly cost of the funds you hold</div>
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

      <Panel>
        <div className="ops-caption text-[11px] text-slate-500">Companies you own through more than one fund</div>
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
                  held through {overlap.instrumentIds.join(" and ")}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Buying worksheet
// ---------------------------------------------------------------------------

export function BuyStage({ plan, calculation, update }: StageProps) {
  if (calculation.orders.length === 0) {
    return (
      <div className="space-y-5">
        <StageHeading eyebrow="Step 5" title="Work out what to buy" />
        <Notice tone="amber" title="Set your weights first">
          Step 3 needs valid percentages before Studio can work out amounts.
        </Notice>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <StageHeading eyebrow="Step 5" title="Work out what to buy">
        Studio holds no market prices. Enter the quote your broker shows and the date you saw it, and this works out a
        quantity that stays inside your dollar target.
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

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field
                  label={isBond ? "Price per $100 of face value" : "Price per share"}
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
                  label="Date of that price"
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

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReviewStage({ plan, calculation, update, importBackup, reset }: StageProps) {
  const setRules = (patch: Partial<StudioPlan["rules"]>) =>
    update((current) => ({ ...current, rules: { ...current.rules, ...patch }, updatedAt: new Date().toISOString() }));

  return (
    <div className="space-y-5">
      <StageHeading eyebrow="Step 6" title="Write the rules and keep a copy">
        Decide now what you will do later, while nothing is happening and you can think clearly.
      </StageHeading>

      <Panel>
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
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
            placeholder="Only if the reason I wrote in step 2 has stopped being true."
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

      <Panel>
        <div className="ops-caption text-[11px] text-slate-500">Where you are against the plan</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
                  {findStudioInstrument(row.instrumentId)?.symbol ?? row.instrumentId}
                </li>
              ))}
            <li className="text-[14px] leading-6 text-slate-400">
              <span className="tabular-nums">{usd(calculation.contributions.cash)}</span> stays in cash
            </li>
          </ul>
        ) : null}
      </Panel>

      <Panel>
        <div className="ops-caption text-[11px] text-slate-500">Take your work with you</div>
        <p className="mt-2 text-[14px] leading-6 text-slate-400">
          Studio saves in this browser only. Clearing site data erases it, so keep a backup.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => download(`${plan.name}.json`, exportStudioJson(plan), "application/json")}
            className="min-h-11 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-5 text-[14px] font-semibold text-accent-cyan hover:bg-accent-cyan/20"
          >
            Download a backup
          </button>
          <button
            type="button"
            onClick={() => download(`${plan.name}.txt`, exportStudioText(plan, STUDIO_CATALOG), "text/plain")}
            className="min-h-11 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-slate-200 hover:border-white/30"
          >
            Download the readable plan
          </button>
          <button
            type="button"
            onClick={() => download(`${plan.name}.csv`, exportStudioCsv(plan, STUDIO_CATALOG), "text/csv")}
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
                if (file) importBackup(await file.text());
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
                reset();
              }
            }}
            className="min-h-11 rounded-full border border-white/15 px-5 text-[14px] font-medium text-slate-400 hover:border-accent-red/40 hover:text-accent-red"
          >
            Start again
          </button>
        </div>
      </Panel>
    </div>
  );
}
