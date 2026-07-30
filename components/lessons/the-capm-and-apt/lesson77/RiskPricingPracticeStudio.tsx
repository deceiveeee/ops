"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import { CalculationWorksheet, Feedback } from "../shared";
import { ChoiceQuestion, CategoryHeader, DatumRow, useResolvedGate, type ChoiceItem } from "./shared";
import { useLesson77State, type PracticeCategoryId } from "@/lib/capm-lesson77-state";

/* ------------------------------------------------------------------ */
/* Wrappers                                                           */
/* ------------------------------------------------------------------ */

function CategoryBlock({
  id,
  title,
  done,
  children,
}: {
  id: PracticeCategoryId;
  title: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <section id={`practice-${id}`} className="scroll-mt-24">
      <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5 sm:p-7">
        <CategoryHeader letter={id} title={title} done={done} />
        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </section>
  );
}

function ProblemLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
      {children}
    </div>
  );
}

/** Numeric calculation followed by a graded interpretation choice. */
function CalcThenInterpret({
  worksheet,
  interpret,
  onResolve,
}: {
  worksheet: ComponentProps<typeof CalculationWorksheet>;
  interpret: ChoiceItem;
  onResolve: () => void;
}) {
  const [solved, setSolved] = useState(false);
  return (
    <div>
      <CalculationWorksheet
        {...worksheet}
        onSolved={() => setSolved(true)}
        onReveal={() => setSolved(true)}
      />
      {solved && (
        <div className="mt-5">
          <ProblemLabel>Interpret your result</ProblemLabel>
          <div className="mt-2">
            <ChoiceQuestion item={interpret} onResolved={() => onResolve()} />
          </div>
        </div>
      )}
    </div>
  );
}

function SetupTable({
  rows,
}: {
  rows: { label: ReactNode; values: ReactNode[]; head?: boolean }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-[15px]">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={cn("border-b border-white/5", r.head && "border-b border-white/20")}
            >
              <td
                className={cn(
                  "py-2.5 pr-4",
                  r.head ? "font-sans text-[12px] uppercase tracking-[0.12em] text-slate-400" : "text-slate-300",
                )}
              >
                {r.label}
              </td>
              {r.values.map((v, j) => (
                <td key={j} className="py-2.5 pr-4 font-sans tabular-nums text-slate-100">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORY A — Market portfolio & equilibrium                        */
/* ------------------------------------------------------------------ */

function CategoryA({ onComplete }: { onComplete: () => void }) {
  const keys = ["a1a", "a1b", "a1c", "a1d", "a1e", "a1f", "a2a", "a2b", "a2c", "a2d"];
  const mark = useResolvedGate(keys, onComplete);

  return (
    <>
      <div>
        <ProblemLabel>Problem A1 · Market clearing</ProblemLabel>
        <p className="mt-2 text-[16px] leading-[1.6] text-slate-200">
          Every investor wants the tangency portfolio{" "}
          <InlineMath>{String.raw`T = 60\%\,\text{Atlas} + 40\%\,\text{Beacon}`}</InlineMath>, but the
          market supply is <InlineMath>{String.raw`M = 75\%\,\text{Atlas} + 25\%\,\text{Beacon}`}</InlineMath>.
          Trace the adjustment.
        </p>
        <div className="mt-4 space-y-3">
          <ChoiceQuestion
            item={{
              id: "a1a",
              prompt: "1. Is this an equilibrium?",
              options: [
                { id: "no", label: "No — desired holdings do not match supply" },
                { id: "yes", label: "Yes — supply equals demand" },
              ],
              correctId: "no",
              optionFeedback: {
                yes: "Investors collectively want 40% Beacon, but only 25% exists. Desired holdings do not match supply, so this is not an equilibrium.",
              },
              correctFeedback: "Correct — investors want more Beacon than exists.",
            }}
            onResolved={(ok) => ok && mark("a1a")}
          />
          <ChoiceQuestion
            item={{
              id: "a1b",
              prompt: "2. Which asset is over-demanded?",
              options: [
                { id: "beacon", label: "Beacon" },
                { id: "atlas", label: "Atlas" },
              ],
              correctId: "beacon",
              optionFeedback: {
                atlas: "Investors want only 60% Atlas while 75% exists — Atlas is under-demanded, not over-demanded.",
              },
            }}
            onResolved={(ok) => ok && mark("a1b")}
          />
          <ChoiceQuestion
            item={{
              id: "a1c",
              prompt: "3. What happens to Beacon’s price?",
              options: [
                { id: "up", label: "It rises" },
                { id: "down", label: "It falls" },
                { id: "same", label: "No change" },
              ],
              correctId: "up",
              optionFeedback: {
                down: "Excess demand for Beacon pushes its price up, not down.",
                same: "Prices must move to clear the market. Excess demand puts upward pressure on Beacon’s price.",
              },
            }}
            onResolved={(ok) => ok && mark("a1c")}
          />
          <ChoiceQuestion
            item={{
              id: "a1d",
              prompt: "4. What happens to Beacon’s expected return (for a fixed anticipated payoff)?",
              options: [
                { id: "down", label: "It falls" },
                { id: "up", label: "It rises" },
              ],
              correctId: "down",
              optionFeedback: {
                up: "Reconsider: paying a higher current price for the same anticipated payoff lowers the expected return.",
              },
              correctFeedback: "Correct — a higher price for the same payoff means a lower expected return.",
            }}
            onResolved={(ok) => ok && mark("a1d")}
          />
          <ChoiceQuestion
            item={{
              id: "a1e",
              prompt: "5. How does that affect Beacon’s desired tangency-portfolio weight?",
              options: [
                { id: "down", label: "Its desired tangency weight decreases" },
                { id: "up", label: "Its desired tangency weight increases" },
              ],
              correctId: "down",
              optionFeedback: {
                up: "As Beacon’s expected return falls, its risk-adjusted attractiveness drops, so optimizers want less of it.",
              },
            }}
            onResolved={(ok) => ok && mark("a1e")}
          />
          <ChoiceQuestion
            item={{
              id: "a1f",
              prompt: "6. What must ultimately be true in equilibrium?",
              options: [
                { id: "tm", label: "T = M — desired holdings match the supply of risky assets" },
                { id: "sd", label: "Supply equals demand at the original prices" },
              ],
              correctId: "tm",
              optionFeedback: {
                sd: "“Supply equals demand” is too vague. The mechanism is that prices and expected returns adjust until the tangency portfolio equals the market portfolio.",
              },
              correctFeedback:
                "Correct. Adjustment continues until the tangency portfolio investors want equals the market portfolio that exists.",
            }}
            onResolved={(ok) => ok && mark("a1f")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem A2 · Market portfolio misconceptions</ProblemLabel>
        <div className="mt-3 space-y-3">
          <ChoiceQuestion
            item={{
              id: "a2a",
              prompt: "“The market portfolio treats all risky assets as one value-weighted portfolio.”",
              options: [
                { id: "t", label: "True" },
                { id: "f", label: "False" },
              ],
              correctId: "t",
              correctFeedback: "True — that is exactly the theoretical market portfolio.",
            }}
            onResolved={(ok) => ok && mark("a2a")}
          />
          <ChoiceQuestion
            item={{
              id: "a2b",
              prompt: "“A large-cap stock index is necessarily the complete theoretical market portfolio.”",
              options: [
                { id: "t", label: "True" },
                { id: "f", label: "False" },
              ],
              correctId: "f",
              optionFeedback: {
                t: "False. A stock index is only a proxy. The theoretical market includes all risky assets — bonds, real estate, private equity, human capital — not just large-cap public stocks.",
              },
              correctFeedback:
                "False — an index is a practical proxy, not the complete value-weighted market of all risky assets.",
            }}
            onResolved={(ok) => ok && mark("a2b")}
          />
          <ChoiceQuestion
            item={{
              id: "a2c",
              prompt: "“Market weights mean the largest companies are judged to be the best investments.”",
              options: [
                { id: "t", label: "True" },
                { id: "f", label: "False" },
              ],
              correctId: "f",
              optionFeedback: {
                t: "False. Market weights reflect relative size (supply), not investment quality. A big weight does not mean a better investment.",
              },
            }}
            onResolved={(ok) => ok && mark("a2c")}
          />
          <ChoiceQuestion
            item={{
              id: "a2d",
              prompt: "“CAPM investors may choose different total risk while holding the same risky portfolio.”",
              options: [
                { id: "t", label: "True" },
                { id: "f", label: "False" },
              ],
              correctId: "t",
              correctFeedback:
                "True — two-fund separation: everyone holds the same risky portfolio M and adjusts total risk by mixing with the risk-free asset.",
            }}
            onResolved={(ok) => ok && mark("a2d")}
          />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORY B — Beta & portfolio exposure                             */
/* ------------------------------------------------------------------ */

function CategoryB({ onComplete }: { onComplete: () => void }) {
  const keys = ["b1", "b2", "b3a", "b3b", "b3c"];
  const mark = useResolvedGate(keys, onComplete);

  return (
    <>
      <div>
        <ProblemLabel>Problem B1 · Portfolio beta</ProblemLabel>
        <SetupTable
          rows={[
            { label: "Asset", values: ["Market fund", "Defensive fund", "Cyclical fund"], head: true },
            { label: "Weight", values: ["45%", "35%", "20%"] },
            { label: "Beta", values: ["1.00", "0.60", "1.50"] },
          ]}
        />
        <div className="mt-4">
          <CalcThenInterpret
            worksheet={{
              submitLabel: "Check portfolio beta",
              retryLabel: "Clear wrong answers",
              groups: [
                {
                  heading: "Weighted contributions (wᵢ × βᵢ)",
                  hint: "β_P = Σ wᵢ βᵢ.",
                  fields: [
                    { id: "cm", label: "Market (0.45 × 1.00)", answer: 0.45, tolerance: 0.005, decimals: 3, hints: ["0.45 × 1.00.", "= 0.450."], solution: "0.45 × 1.00 = 0.450." },
                    { id: "cd", label: "Defensive (0.35 × 0.60)", answer: 0.21, tolerance: 0.005, decimals: 3, hints: ["0.35 × 0.60.", "= 0.210."], solution: "0.35 × 0.60 = 0.210." },
                    { id: "cc", label: "Cyclical (0.20 × 1.50)", answer: 0.3, tolerance: 0.005, decimals: 3, hints: ["0.20 × 1.50.", "= 0.300."], solution: "0.20 × 1.50 = 0.300." },
                    { id: "bp", label: "β_P (sum)", answer: 0.96, tolerance: 0.01, decimals: 2, hints: ["0.450 + 0.210 + 0.300.", "= 0.96."], solution: "0.450 + 0.210 + 0.300 = 0.96." },
                  ],
                },
              ],
              interpretation: "β_P ≈ 0.96 — slightly below the market portfolio’s beta of 1.0.",
              interpretationTone: "info",
            }}
            interpret={{
              id: "b1i",
              prompt: "Interpret β_P = 0.96.",
              options: [
                { id: "ok", label: "The portfolio has slightly less systematic market exposure than the market portfolio" },
                { id: "risk", label: "The portfolio is 4% less risky than the market" },
              ],
              correctId: "ok",
              optionFeedback: {
                risk: "Beta concerns systematic market exposure, not total volatility. “4% less risky” confuses beta with total risk.",
              },
            }}
            onResolve={() => mark("b1")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem B2 · Positive and negative markets</ProblemLabel>
        <p className="mt-2 text-[16px] leading-[1.6] text-slate-200">
          With <InlineMath>{String.raw`\beta_P = 0.96`}</InlineMath>:
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.05] p-4">
            <InlineMath>{String.raw`R_M - R_f = 10\% \;\Rightarrow\; 0.96(10\%) = 9.6\%`}</InlineMath>
          </div>
          <div className="rounded-xl border border-accent-red/25 bg-accent-red/[0.05] p-4">
            <InlineMath>{String.raw`R_M - R_f = -10\% \;\Rightarrow\; 0.96(-10\%) = -9.6\%`}</InlineMath>
          </div>
        </div>
        <div className="mt-3">
          <ChoiceQuestion
            item={{
              id: "b2",
              prompt: "Will the portfolio’s realized excess return necessarily equal these amounts?",
              options: [
                { id: "no", label: "No — beta estimates only the market-linked component; realized return also reflects residuals, omitted factors, estimation error, and changing exposure" },
                { id: "yes", label: "Yes — the portfolio always earns exactly β times the market" },
              ],
              correctId: "no",
              optionFeedback: {
                yes: "Beta is an average relationship, not a mechanical multiplier. Realized returns include everything beta does not capture.",
              },
            }}
            onResolved={(ok) => ok && mark("b2")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem B3 · Same volatility, different beta</ProblemLabel>
        <SetupTable
          rows={[
            { label: "Asset", values: ["Asset X", "Asset Y"], head: true },
            { label: "Standard deviation", values: ["28%", "28%"] },
            { label: "Beta", values: ["1.35", "0.45"] },
          ]}
        />
        <div className="mt-3 space-y-3">
          <ChoiceQuestion
            item={{
              id: "b3a",
              prompt: "Which asset has larger total return swings?",
              options: [
                { id: "same", label: "About the same" },
                { id: "x", label: "Asset X" },
                { id: "y", label: "Asset Y" },
              ],
              correctId: "same",
              optionFeedback: {
                x: "Both have the same standard deviation (28%), so their total swings are similar in size.",
                y: "Both have the same standard deviation (28%), so their total swings are similar in size.",
              },
            }}
            onResolved={(ok) => ok && mark("b3a")}
          />
          <ChoiceQuestion
            item={{
              id: "b3b",
              prompt: "Which asset has greater systematic market exposure?",
              options: [
                { id: "x", label: "Asset X" },
                { id: "y", label: "Asset Y" },
                { id: "same", label: "About the same" },
              ],
              correctId: "x",
              optionFeedback: {
                y: "Asset X has β = 1.35 versus 0.45 for Y — X’s returns are more strongly connected to the market.",
                same: "They share σ but differ in β. The larger beta has greater systematic exposure.",
              },
            }}
            onResolved={(ok) => ok && mark("b3b")}
          />
          <ChoiceQuestion
            item={{
              id: "b3c",
              prompt: "Why can the answers differ?",
              options: [
                { id: "split", label: "Total volatility mixes market-related and firm-specific movement in different proportions" },
                { id: "mag", label: "Beta is always larger than standard deviation" },
              ],
              correctId: "split",
              optionFeedback: {
                mag: "Beta is not always larger than σ. They measure different things: β is market exposure, σ is total swing size.",
              },
              correctFeedback:
                "Correct. Same total swings can hide very different splits between systematic and firm-specific movement.",
            }}
            onResolved={(ok) => ok && mark("b3c")}
          />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORY C — Security Market Line                                  */
/* ------------------------------------------------------------------ */

function CategoryC({ onComplete }: { onComplete: () => void }) {
  const keys = ["c1", "c2", "c3a", "c3b", "c3c", "c3d", "c3e", "c3f"];
  const mark = useResolvedGate(keys, onComplete);

  const classify: { k: string; stmt: string; ans: "cml" | "sml"; why: string }[] = [
    { k: "c3a", stmt: "Efficient combinations of the market portfolio and risk-free asset.", ans: "cml", why: "Capital Market Line." },
    { k: "c3b", stmt: "Required return for an individual stock.", ans: "sml", why: "Security Market Line." },
    { k: "c3c", stmt: "Horizontal axis is standard deviation.", ans: "cml", why: "CML uses total volatility." },
    { k: "c3d", stmt: "Horizontal axis is beta.", ans: "sml", why: "SML uses market exposure." },
    { k: "c3e", stmt: "Applies to any asset or project.", ans: "sml", why: "SML prices any investment." },
    { k: "c3f", stmt: "Applies only to efficient complete portfolios.", ans: "cml", why: "CML only." },
  ];

  return (
    <>
      <div>
        <ProblemLabel>Problem C1 · Required return</ProblemLabel>
        <p className="mt-2 text-[16px] leading-[1.6] text-slate-200">
          Given <InlineMath>{String.raw`R_f = 3.5\%`}</InlineMath>,{" "}
          <InlineMath>{String.raw`E[R_M]-R_f = 6.5\%`}</InlineMath>, and{" "}
          <InlineMath>{String.raw`\beta_i = 1.2`}</InlineMath>.
        </p>
        <div className="mt-4">
          <CalcThenInterpret
            worksheet={{
              submitLabel: "Check required return",
              groups: [
                {
                  hint: "R_i = R_f + β(E[R_M] − R_f) = 3.5% + 1.2 × 6.5%.",
                  fields: [
                    { id: "ri", label: "Required return R_i", answer: 11.3, tolerance: 0.05, unit: "%", hints: ["3.5% + 1.2 × 6.5%.", "= 11.3%."], solution: "3.5% + 1.2 × 6.5% = 11.3%." },
                  ],
                },
              ],
              interpretation: "Investors require about 11.3% expected return for this systematic exposure.",
              interpretationTone: "info",
            }}
            interpret={{
              id: "c1i",
              prompt: "Which interpretation is correct?",
              options: [
                { id: "req", label: "11.3% is the return investors require for this beta — not a guaranteed or promised outcome" },
                { id: "guar", label: "11.3% is guaranteed to be earned next year" },
                { id: "promise", label: "11.3% is the return management has promised" },
              ],
              correctId: "req",
              optionFeedback: {
                guar: "Required return is an equilibrium benchmark, not a guaranteed realized return.",
                promise: "Management does not promise or control the required return; it is set by the market’s pricing of systematic risk.",
              },
            }}
            onResolve={() => mark("c1")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem C2 · Is the forecast sufficient?</ProblemLabel>
        <p className="mt-2 text-[16px] leading-[1.6] text-slate-200">
          An analyst forecasts <InlineMath>{String.raw`E[R_i]^{\text{forecast}} = 12.4\%`}</InlineMath>. The
          difference is <InlineMath>{String.raw`12.4\% - 11.3\% = 1.1\%`}</InlineMath>.
        </p>
        <div className="mt-3">
          <ChoiceQuestion
            item={{
              id: "c2",
              prompt: "Choose the most defensible conclusion.",
              options: [
                { id: "signal", label: "The forecast exceeds the CAPM-required return by 1.1 points, but this is not proof of underpricing — the forecast, beta, premium, and model may all be wrong" },
                { id: "under", label: "The stock is definitely underpriced and should be bought" },
                { id: "alpha", label: "This 1.1% is proven manager alpha" },
              ],
              correctId: "signal",
              optionFeedback: {
                under: "A forecast above required return is a signal worth investigating, not proof of underpricing.",
                alpha: "A forecast gap is not realized alpha and not proof of skill.",
              },
            }}
            onResolved={(ok) => ok && mark("c2")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem C3 · CML or SML?</ProblemLabel>
        <div className="mt-3 space-y-3">
          {classify.map((c) => (
            <ChoiceQuestion
              key={c.k}
              item={{
                id: c.k,
                prompt: c.stmt,
                options: [
                  { id: "cml", label: "Capital Market Line" },
                  { id: "sml", label: "Security Market Line" },
                ],
                correctId: c.ans,
                optionFeedback: {
                  cml: c.ans === "sml" ? `This describes the SML. (${c.why})` : undefined,
                  sml: c.ans === "cml" ? `This describes the CML. (${c.why})` : undefined,
                },
                correctFeedback: `Correct — ${c.why}`,
              }}
              onResolved={(ok) => ok && mark(c.k)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORY D — Beta estimation                                       */
/* ------------------------------------------------------------------ */

function CategoryD({ onComplete }: { onComplete: () => void }) {
  const keys = ["d1a", "d1b", "d1c", "d1d", "d2", "d3a", "d3b", "d3c"];
  const mark = useResolvedGate(keys, onComplete);

  return (
    <>
      <div>
        <ProblemLabel>Problem D1 · Read the regression</ProblemLabel>
        <div className="mt-2 rounded-xl border border-white/10 bg-ink-950/50 px-4 py-4">
          <BlockMath>{String.raw`R_i - R_f = 0.08\% + 1.35\,(R_M - R_f) + \varepsilon_i`}</BlockMath>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3 text-center">
            <div className="font-sans text-[11px] uppercase tracking-[0.12em] text-slate-400">R²</div>
            <div className="mt-1 font-sans text-[15px] text-slate-100">30%</div>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3 text-center">
            <div className="font-sans text-[11px] uppercase tracking-[0.12em] text-slate-400">SE(β̂)</div>
            <div className="mt-1 font-sans text-[15px] text-slate-100">0.16</div>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3 text-center">
            <div className="font-sans text-[11px] uppercase tracking-[0.12em] text-slate-400">β̂</div>
            <div className="mt-1 font-sans text-[15px] text-slate-100">1.35</div>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <ChoiceQuestion
            item={{
              id: "d1a",
              prompt: "Interpret β̂ = 1.35.",
              options: [
                { id: "ok", label: "During the sample, the asset’s excess return tended to change by ~1.35 points for each 1-point change in market excess return, in the same direction, on average" },
                { id: "exact", label: "The asset always moves exactly 1.35 times the market" },
              ],
              correctId: "ok",
              optionFeedback: {
                exact: "Beta is an average tendency, not an exact multiplier. The words “tended to,” “approximately,” and “on average” matter.",
              },
            }}
            onResolved={(ok) => ok && mark("d1a")}
          />
          <ChoiceQuestion
            item={{
              id: "d1b",
              prompt: "Interpret R² = 30%.",
              options: [
                { id: "fit", label: "The fitted market relationship explained about 30% of the asset’s return variation in the sample" },
                { id: "beta", label: "The beta must be 0.30" },
              ],
              correctId: "fit",
              optionFeedback: {
                beta: "Beta measures slope; R² measures fit. A 30% R² does not mean beta is 0.30.",
              },
            }}
            onResolved={(ok) => ok && mark("d1b")}
          />
          <ChoiceQuestion
            item={{
              id: "d1c",
              prompt: "Interpret SE(β̂) = 0.16.",
              options: [
                { id: "unc", label: "The beta estimate is uncertain and should not be treated as exactly 1.35" },
                { id: "perm", label: "The beta is permanent and precisely known" },
              ],
              correctId: "unc",
              optionFeedback: {
                perm: "The standard error shows the estimate is imprecise. It is not a permanent, exact value.",
              },
            }}
            onResolved={(ok) => ok && mark("d1c")}
          />
          <ChoiceQuestion
            item={{
              id: "d1d",
              prompt: "What is the residual ε?",
              options: [
                { id: "gap", label: "The period-specific return not explained by the fitted market relationship" },
                { id: "skill", label: "Proof of manager skill" },
              ],
              correctId: "gap",
              optionFeedback: {
                skill: "A residual is one period’s unexplained gap, not evidence of skill.",
              },
            }}
            onResolved={(ok) => ok && mark("d1d")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem D2 · Choose a relevant beta</ProblemLabel>
        <SetupTable
          rows={[
            { label: "Measure", values: ["10-year", "5-year", "2-year"], head: true },
            { label: "Beta", values: ["0.75", "0.95", "1.40"] },
          ]}
        />
        <p className="mt-3 text-[15px] leading-[1.6] text-slate-300">
          In the last two years the company sold a stable consumer division, acquired a cyclical
          technology business, and increased financial leverage.
        </p>
        <div className="mt-3">
          <ChoiceQuestion
            item={{
              id: "d2",
              prompt: "Which is the most defensible choice of beta for a forward-looking CAPM analysis?",
              options: [
                { id: "balance", label: "Weight recent data because it reflects the current business and capital structure, but acknowledge the shorter sample is less precise" },
                { id: "recent", label: "Always use the most recent beta" },
                { id: "long", label: "Always use the longest sample" },
              ],
              correctId: "balance",
              optionFeedback: {
                recent: "“Always use the most recent beta” ignores precision. Short samples are noisier.",
                long: "The longest sample blends an old, very different business with the current one.",
              },
              correctFeedback:
                "Correct — combine statistical evidence with an assessment of the company’s present operations.",
            }}
            onResolved={(ok) => ok && mark("d2")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem D3 · Slope versus fit</ProblemLabel>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
            <div className="font-sans text-[11px] uppercase tracking-[0.12em] text-slate-400">Pair 1 — same beta</div>
            <DatumRow label="Asset A · β / R²" value="1.2 / 70%" />
            <DatumRow label="Asset B · β / R²" value="1.2 / 18%" />
            <p className="mt-2 text-[13px] text-slate-400">Same sensitivity; very different tightness around the line.</p>
          </div>
          <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
            <div className="font-sans text-[11px] uppercase tracking-[0.12em] text-slate-400">Pair 2 — same R²</div>
            <DatumRow label="Asset C · β / R²" value="0.6 / 45%" />
            <DatumRow label="Asset D · β / R²" value="1.5 / 45%" />
            <p className="mt-2 text-[13px] text-slate-400">Same fit; different response magnitude.</p>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <ChoiceQuestion
            item={{
              id: "d3a",
              prompt: "Which quantity measures sensitivity to the market?",
              options: [
                { id: "beta", label: "Beta (the slope)" },
                { id: "r2", label: "R² (the fit)" },
              ],
              correctId: "beta",
              optionFeedback: { r2: "R² measures fit, not slope. Sensitivity is beta." },
            }}
            onResolved={(ok) => ok && mark("d3a")}
          />
          <ChoiceQuestion
            item={{
              id: "d3b",
              prompt: "Which quantity measures explanatory power?",
              options: [
                { id: "r2", label: "R²" },
                { id: "beta", label: "Beta" },
              ],
              correctId: "r2",
              optionFeedback: { beta: "Beta measures slope, not explanatory power." },
            }}
            onResolved={(ok) => ok && mark("d3b")}
          />
          <ChoiceQuestion
            item={{
              id: "d3c",
              prompt: "What does the spread of points around the line represent?",
              options: [
                { id: "resid", label: "Residual variation not explained by the fitted market relationship" },
                { id: "beta", label: "The asset’s beta" },
              ],
              correctId: "resid",
              optionFeedback: { beta: "The spread is residual variation, not the slope." },
            }}
            onResolved={(ok) => ok && mark("d3c")}
          />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORY E — Alpha & performance                                   */
/* ------------------------------------------------------------------ */

function CategoryE({ onComplete }: { onComplete: () => void }) {
  const [e1, setE1] = useState(false);
  const [e2Step, setE2Step] = useState(0);
  const [e2Final, setE2Final] = useState(false);
  const keys = ["e1", "e2"];
  const mark = useResolvedGate(keys, onComplete);

  return (
    <>
      <div>
        <ProblemLabel>Problem E1 · Same return, different alpha</ProblemLabel>
        <p className="mt-2 text-[16px] leading-[1.6] text-slate-200">
          <InlineMath>{String.raw`R_f = 4\%,\; E[R_M]-R_f = 6\%`}</InlineMath>. Each fund earned 12%.
        </p>
        <SetupTable
          rows={[
            { label: "Fund", values: ["A", "B", "C"], head: true },
            { label: "Average return", values: ["12%", "12%", "12%"] },
            { label: "Beta", values: ["0.6", "1.0", "1.4"] },
          ]}
        />
        <div className="mt-4">
          <CalculationWorksheet
            submitLabel="Check required & alpha"
            groups={[
              {
                heading: "Required return and CAPM alpha per fund",
                hint: "Required = 4% + β×6%. Alpha = 12% − required.",
                fields: [
                  { id: "ra", label: "R_A required (β=0.6)", answer: 7.6, tolerance: 0.05, unit: "%", hints: ["4% + 0.6×6%.", "= 7.6%."], solution: "4% + 0.6×6% = 7.6%." },
                  { id: "aa", label: "α_A = 12% − R_A", answer: 4.4, tolerance: 0.05, unit: "%", hints: ["12% − 7.6%.", "= 4.4%."], solution: "12% − 7.6% = 4.4%." },
                  { id: "rb", label: "R_B required (β=1.0)", answer: 10, tolerance: 0.05, unit: "%", hints: ["4% + 1.0×6%.", "= 10%."], solution: "4% + 1.0×6% = 10%." },
                  { id: "ab", label: "α_B = 12% − R_B", answer: 2.0, tolerance: 0.05, unit: "%", hints: ["12% − 10%.", "= 2.0%."], solution: "12% − 10% = 2.0%." },
                  { id: "rc", label: "R_C required (β=1.4)", answer: 12.4, tolerance: 0.05, unit: "%", hints: ["4% + 1.4×6%.", "= 12.4%."], solution: "4% + 1.4×6% = 12.4%." },
                  { id: "ac", label: "α_C = 12% − R_C", answer: -0.4, tolerance: 0.05, unit: "%", hints: ["12% − 12.4%.", "= −0.4%."], solution: "12% − 12.4% = −0.4%." },
                ],
              },
            ]}
            interpretation="Same raw return, but risk-adjusted performance differs sharply: α_A = 4.4%, α_B = 2.0%, α_C = −0.4%."
            interpretationTone="info"
            onSolved={() => {
              setE1(true);
              mark("e1");
            }}
            onReveal={() => {
              setE1(true);
              mark("e1");
            }}
          />
          {e1 && (
            <div className="mt-3">
              <ChoiceQuestion
                item={{
                  id: "e1rank",
                  prompt: "How should the funds be ranked by CAPM alpha?",
                  options: [
                    { id: "abc", label: "A > B > C (highest to lowest alpha)" },
                    { id: "same", label: "All equal, since raw returns are equal" },
                  ],
                  correctId: "abc",
                  optionFeedback: {
                    same: "Raw-return ranking is A = B = C, but CAPM-alpha ranking is A > B > C. Risk adjustment changes the order.",
                  },
                  correctFeedback:
                    "Correct. The funds earned the same raw return but did not perform equally after adjusting for systematic market exposure.",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <ProblemLabel>Problem E2 · Does positive alpha prove skill?</ProblemLabel>
        <div className="mt-2 rounded-xl border border-white/12 bg-white/[0.03] p-4">
          <DatumRow label="CAPM alpha" value={<span className="text-accent-green">4.5%</span>} />
        </div>
        <div className="mt-3 space-y-3">
          {e2Step === 0 && (
            <ChoiceQuestion
              item={{
                id: "e2s0",
                prompt: "A first reading of α_CAPM = 4.5% suggests outperformance. Is this proof of skill?",
                options: [
                  { id: "no", label: "Not yet — the estimate may reflect beta error, benchmark choice, or omitted factors" },
                  { id: "yes", label: "Yes — positive CAPM alpha proves skill" },
                ],
                correctId: "no",
                optionFeedback: { yes: "Positive CAPM alpha alone does not prove skill. Reveal more evidence." },
                correctFeedback: "Right — keep investigating before concluding.",
              }}
              onResolved={(ok) => ok && setE2Step(1)}
            />
          )}
          {e2Step >= 1 && (
            <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4 text-[15px] leading-[1.6] text-slate-200">
              <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-accent-amber">New evidence</span>
              <ul className="mt-2 space-y-1.5">
                <li>• Beta has a large standard error.</li>
                <li>• The fund has substantial small-company (size) exposure.</li>
                <li>• The fund has substantial value exposure.</li>
              </ul>
            </div>
          )}
          {e2Step >= 1 && e2Step < 2 && (
            <ChoiceQuestion
              item={{
                id: "e2s1",
                prompt: "These exposures are not in the one-factor CAPM. What might they do to the alpha?",
                options: [
                  { id: "absorb", label: "They may absorb part of the apparent alpha if they carry their own risk premiums" },
                  { id: "irrel", label: "They are irrelevant because CAPM already accounts for all risk" },
                ],
                correctId: "absorb",
                optionFeedback: { irrel: "CAPM includes only market beta. Size and value exposures are omitted and may explain part of the return." },
              }}
              onResolved={(ok) => ok && setE2Step(2)}
            />
          )}
          {e2Step >= 2 && (
            <div className="rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-4">
              <DatumRow label="Multifactor alpha" value={<span className="text-accent-purple">0.8%</span>} />
              <p className="mt-2 text-[14px] text-slate-400">Much smaller than the 4.5% one-factor alpha, and imprecisely estimated.</p>
            </div>
          )}
          {e2Step >= 2 && !e2Final && (
            <ChoiceQuestion
              item={{
                id: "e2s2",
                prompt: "What is the most defensible final conclusion?",
                options: [
                  { id: "qual", label: "The fund beat the one-factor benchmark, but much of the apparent alpha may reflect omitted size and value exposure; the remaining alpha is small and uncertain, so skill is not proven" },
                  { id: "skill", label: "The manager definitely has skill" },
                  { id: "worthless", label: "CAPM is useless, so ignore all the evidence" },
                ],
                correctId: "qual",
                optionFeedback: {
                  skill: "After controlling for size and value, alpha fell to 0.8% and is imprecisely estimated — skill is not proven.",
                  worthless: "Models are imperfect benchmarks, not useless. They discipline the comparison of risk and return.",
                },
              }}
              onResolved={(ok) => {
                if (ok) {
                  setE2Final(true);
                  mark("e2");
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORY F — APT & multifactor models                              */
/* ------------------------------------------------------------------ */

function CategoryF({ onComplete }: { onComplete: () => void }) {
  const keys = ["f1", "f2a", "f2b", "f3a", "f3b", "f3c", "f3d", "f3e", "f3f"];
  const mark = useResolvedGate(keys, onComplete);

  const classify: { k: string; feat: string; ans: "capm" | "apt"; why: string }[] = [
    { k: "f3a", feat: "One market factor.", ans: "capm", why: "CAPM." },
    { k: "f3b", feat: "Multiple possible systematic factors.", ans: "apt", why: "APT." },
    { k: "f3c", feat: "Market-clearing equilibrium.", ans: "capm", why: "CAPM." },
    { k: "f3d", feat: "No-arbitrage pricing pressure.", ans: "apt", why: "APT." },
    { k: "f3e", feat: "Identifies a theoretical market portfolio.", ans: "capm", why: "CAPM." },
    { k: "f3f", feat: "Does not determine the correct factors.", ans: "apt", why: "APT." },
  ];

  return (
    <>
      <div>
        <ProblemLabel>Problem F1 · Multifactor required return</ProblemLabel>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
            <div className="font-sans text-[11px] uppercase tracking-[0.12em] text-slate-400">Factor premiums</div>
            <DatumRow label={<span>λ_M (market)</span>} value="5%" />
            <DatumRow label={<span>λ_S (size)</span>} value="2%" />
            <DatumRow label={<span>λ_V (value)</span>} value="1.5%" />
          </div>
          <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
            <div className="font-sans text-[11px] uppercase tracking-[0.12em] text-slate-400">Asset exposures</div>
            <DatumRow label={<span>β_M</span>} value="1.1" />
            <DatumRow label={<span>β_S</span>} value="0.5" />
            <DatumRow label={<span>β_V</span>} value="−0.2" />
          </div>
        </div>
        <div className="mt-3">
          <CalcThenInterpret
            worksheet={{
              submitLabel: "Check multifactor return",
              groups: [
                {
                  hint: "E[R] = 3% + 1.1×5% + 0.5×2% − 0.2×1.5%.",
                  fields: [
                    { id: "er", label: "E[R_i] required", answer: 9.2, tolerance: 0.05, unit: "%", hints: ["3% + 5.5% + 1.0% − 0.3%.", "= 9.2%."], solution: "3% + 5.5% + 1.0% − 0.3% = 9.2%." },
                  ],
                },
              ],
              interpretation: "Each factor adds its exposure × premium: market +5.5%, size +1.0%, value −0.3%, on top of R_f = 3%."
            }}
            interpret={{
              id: "f1i",
              prompt: "Why is the value contribution negative (−0.3%)?",
              options: [
                { id: "neg", label: "The asset has negative value exposure (β_V = −0.2), so it subtracts its share of the value premium" },
                { id: "err", label: "It is a calculation error" },
              ],
              correctId: "neg",
              optionFeedback: { err: "It is not an error: a negative exposure times a positive premium reduces required return." },
            }}
            onResolve={() => mark("f1")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem F2 · APT pricing pressure</ProblemLabel>
        <SetupTable
          rows={[
            { label: "Portfolio", values: ["X", "Y"], head: true },
            { label: "Market beta", values: ["1.0", "1.0"] },
            { label: "Factor 2 beta", values: ["0.4", "0.4"] },
            { label: "Expected return", values: ["11%", "8%"] },
          ]}
        />
        <p className="mt-3 text-[15px] leading-[1.6] text-slate-300">
          Construct <strong>long X − short Y</strong>. Net market exposure{" "}
          <InlineMath>{String.raw`1.0-1.0=0`}</InlineMath>; net factor-2 exposure{" "}
          <InlineMath>{String.raw`0.4-0.4=0`}</InlineMath>; expected-return difference{" "}
          <InlineMath>{String.raw`11\%-8\%=3\%`}</InlineMath>.
        </p>
        <div className="mt-3 space-y-3">
          <ChoiceQuestion
            item={{
              id: "f2a",
              prompt: "What should price pressure do to the 3% gap?",
              options: [
                { id: "narrow", label: "Buying X and shorting Y narrows the discrepancy until expected returns align with the shared factor exposures" },
                { id: "widen", label: "It widens the gap permanently" },
              ],
              correctId: "narrow",
              optionFeedback: { widen: "Arbitrage pressure pushes the other way: it narrows, not widens, the gap." },
            }}
            onResolved={(ok) => ok && mark("f2a")}
          />
          <ChoiceQuestion
            item={{
              id: "f2b",
              prompt: "Which qualification matters most for a real trade?",
              options: [
                { id: "real", label: "A real trade may still carry residual risk, model error, estimation error, financing costs, and trading frictions" },
                { id: "free", label: "The trade is risk-free arbitrage with no costs" },
              ],
              correctId: "real",
              optionFeedback: { free: "This is the no-arbitrage intuition, not a risk-free recipe. Real trades carry frictions and risk." },
            }}
            onResolved={(ok) => ok && mark("f2b")}
          />
        </div>
      </div>

      <div>
        <ProblemLabel>Problem F3 · CAPM versus APT</ProblemLabel>
        <div className="mt-3 space-y-3">
          {classify.map((c) => (
            <ChoiceQuestion
              key={c.k}
              item={{
                id: c.k,
                prompt: c.feat,
                options: [
                  { id: "capm", label: "CAPM" },
                  { id: "apt", label: "APT" },
                ],
                correctId: c.ans,
                optionFeedback: {
                  capm: c.ans === "apt" ? `This is APT. (${c.why})` : undefined,
                  apt: c.ans === "capm" ? `This is CAPM. (${c.why})` : undefined,
                },
                correctFeedback: `Correct — ${c.why}`,
              }}
              onResolved={(ok) => ok && mark(c.k)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Studio shell                                                       */
/* ------------------------------------------------------------------ */

export default function RiskPricingPracticeStudio() {
  const { state, setCategoryDone, categoriesDoneCount } = useLesson77State();
  const total = 6;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
              Guided mixed practice
            </div>
            <p className="mt-1 text-[15px] leading-[1.55] text-slate-200">
              Six categories. Calculate, submit, then interpret. Progress is saved as you go.
            </p>
          </div>
          <div className="font-sans text-[15px] tabular-nums text-slate-200">
            <span className="text-accent-green">{categoriesDoneCount}</span>
            <span className="text-slate-500"> / {total} complete</span>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent-green/70 transition-[width] duration-500"
            style={{ width: `${(categoriesDoneCount / total) * 100}%` }}
          />
        </div>
      </div>

      <CategoryBlock id="A" title="Market portfolio & equilibrium" done={!!state.categories.A}>
        <CategoryA onComplete={() => setCategoryDone("A", true)} />
      </CategoryBlock>
      <CategoryBlock id="B" title="Beta & portfolio exposure" done={!!state.categories.B}>
        <CategoryB onComplete={() => setCategoryDone("B", true)} />
      </CategoryBlock>
      <CategoryBlock id="C" title="Security Market Line" done={!!state.categories.C}>
        <CategoryC onComplete={() => setCategoryDone("C", true)} />
      </CategoryBlock>
      <CategoryBlock id="D" title="Beta estimation" done={!!state.categories.D}>
        <CategoryD onComplete={() => setCategoryDone("D", true)} />
      </CategoryBlock>
      <CategoryBlock id="E" title="Alpha & performance" done={!!state.categories.E}>
        <CategoryE onComplete={() => setCategoryDone("E", true)} />
      </CategoryBlock>
      <CategoryBlock id="F" title="APT & multifactor models" done={!!state.categories.F}>
        <CategoryF onComplete={() => setCategoryDone("F", true)} />
      </CategoryBlock>

      {categoriesDoneCount === total && (
        <Feedback status="correct">
          All six categories complete. You can revisit any of them to review — the error clinic and
          the Orion Fund case come next.
        </Feedback>
      )}
    </div>
  );
}
