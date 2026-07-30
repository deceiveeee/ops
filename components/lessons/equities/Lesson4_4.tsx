"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  InlineMath,
  Feedback,
  InteractiveFrame,
  TryItTag,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
} from "./shared";
import EqLayout from "./EqLayout";
import EqSourcePanel from "./EqSourcePanel";
import ExpandableQA from "./ExpandableQA";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import { MathText } from "@/components/ui/MathText";
import { useReportEqComplete } from "@/lib/eq-progress";
import { useState } from "react";
import MultiStageValuationBuilder from "./MultiStageValuationBuilder";

const LEARNING_OBJECTIVES = [
  "Explain why one constant growth rate cannot value a real company.",
  "Identify the three growth stages: rapid growth, transition, and maturity.",
  "Value a stock as the sum of explicit-forecast dividends plus a terminal value.",
  "Compute the terminal value TV_N = D_{N+1} / (r − g_S).",
  "Explain why the terminal value uses D_{N+1}, not D_N.",
  "Compare no-growth, multi-stage, and perpetual-growth valuations.",
  "Recognize when terminal value dominates total value.",
];

const SUMMARY_POINTS = [
  "The Gordon model assumes one perpetual growth rate and cannot handle temporary high growth.",
  "Multi-stage valuation separates explicit-forecast dividends from terminal value.",
  "Terminal value TV_N = D_{N+1}/(r − g_S) captures all cash flows after the forecast period.",
  "The terminal formula uses D_{N+1} to avoid double-counting D_N.",
  "Terminal value often represents a large share of total value.",
  "Multi-stage valuations lie between no-growth and perpetual-growth extremes.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "The Gordon model assumes:",
    choices: [
      { id: "one", label: "One constant growth rate forever" },
      { id: "multi", label: "Multiple growth stages" },
      { id: "zero", label: "Zero growth" },
    ],
    correctId: "one",
    hint: "The Gordon model collapses to P₀ = D₁/(r−g) with a single, constant, perpetual g.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Terminal value TV_N represents:",
    choices: [
      {
        id: "allflows",
        label: "All cash flows after year N valued at time N",
      },
      { id: "liquidation", label: "The liquidation value" },
      { id: "revenue", label: "The company's revenue" },
    ],
    correctId: "allflows",
    hint: "TV_N is the Gordon value of every dividend from year N+1 onward, computed at time N. It is not a liquidation or sale.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Why does the terminal formula use D_{N+1}?",
    choices: [
      {
        id: "explicit",
        label: "Because D_N is already in the explicit forecast",
      },
      { id: "zero", label: "Because D_N is zero" },
      { id: "larger", label: "Because D_{N+1} is larger" },
    ],
    correctId: "explicit",
    hint: "The explicit forecast already discounts D_N. Starting the terminal at N+1 avoids counting D_N twice.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "D₀ = $1, 6% growth for 7 years then 0%, r = 20%. Approximate value?",
    choices: [
      { id: "a", label: "$6.49" },
      { id: "b", label: "$5.30" },
      { id: "c", label: "$7.57" },
    ],
    correctId: "a",
    hint: "PV of the seven growing dividends plus PV of TV₇ = D₈/(0.20−0) discounted back 7 years.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "If stable growth rises from 0% to 3% (r = 20%), TV:",
    choices: [
      { id: "up", label: "Increases" },
      { id: "down", label: "Decreases" },
      { id: "same", label: "Unchanged" },
    ],
    correctId: "up",
    hint: "A higher g_S raises D_{N+1} and shrinks (r − g_S), both of which increase the terminal value.",
  },
];

export default function Lesson4_4() {
  const report = useReportEqComplete("equity-multi-stage-growth-valuation");

  return (
    <EqLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="4.4"
        eyebrow="Lesson 4.4 · Module 4"
        heading="Valuing a Company with Multiple Growth Stages"
        subheading="The Gordon Growth Model assumes one constant growth rate forever. Real companies grow rapidly, then transition, then mature. Multi-stage valuation separates temporary cash flows from stable cash flows."
        bullets={[
          "Separate explicit forecast from terminal value",
          "TV_N = D_{N+1}/(r − g_S)",
          "Discount both sections to today",
          "Compare one-stage vs multi-stage valuations",
        ]}
        primaryLabel="Start"
      />

      {/* =================================================================== */}
      {/* LEARNING OBJECTIVES                                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <div className="glass-panel p-6 sm:p-7">
          <div className="ops-eyebrow text-[11px] text-slate-400">
            Learning objectives
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            By the end of this lesson, you should be able to:
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LEARNING_OBJECTIVES.map((o, i) => (
              <li key={o} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-sans text-[12px] text-accent-cyan">
                  {i + 1}
                </span>
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  <MathText>{o}</MathText>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* PRIOR-LESSON BRIDGE                                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <Panel>
          <div className="ops-caption text-[11px] text-accent-green">
            From Lesson 4.3
          </div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            The Gordon Growth Model values a stock with a single, constant
            growth rate that lasts forever:{" "}
            <InlineMath>{String.raw`P_0 = D_1/(r-g)`}</InlineMath>. That model
            only works when <InlineMath>{String.raw`g < r`}</InlineMath>{" "}
            <em>and</em> the growth rate is genuinely sustainable over the
            indefinite future. A company growing dividends at 15–18% per year
            cannot do so forever — eventually market saturation, competition,
            and sheer size drag growth back toward the economy-wide rate. This
            lesson shows how to value a company that grows fast for a while,
            then settles.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — Why one growth rate is not enough                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.1"
          eyebrow="Section 1"
          title="Why one growth rate is not enough"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Real companies do not grow at a single rate forever. A successful
            young firm may grow earnings and dividends at 15–20% for several
            years as it captures market share. But that pace cannot last:
            competition enters, the addressable market saturates, and the
            company&apos;s own size makes percentage growth harder to sustain.
            Eventually growth slows toward the rate of the overall economy.
          </p>
          <p className="ops-body mt-4 text-[16px] text-slate-200">
            The Gordon model cannot describe this pattern. If you plug in the
            high early growth rate, you get an absurdly high value and a formula
            that may not even converge. If you plug in the low mature rate, you
            ignore years of rapid dividend growth that a buyer today would
            actually receive. The truth lies between — and that is exactly what
            multi-stage valuation captures.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Three stages                                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.2"
          eyebrow="Section 2"
          title="Three stages of corporate life"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Analysts usually split a company&apos;s life into three stages. The
            lengths and intensities differ by firm, but the shape is remarkably
            consistent.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Stage 1 — Growth
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Rapid expansion. The firm reinvests most of its earnings, pays
                little or no dividend, and grows quickly. Margins may be rising.
              </p>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                Stage 2 — Transition
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Competition catches up. Growth decelerates year by year, payout
                rises as attractive reinvestment opportunities fade, and the
                firm begins to behave more like a mature business.
              </p>
            </div>
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Stage 3 — Mature
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Sustainable growth at or near the economy-wide rate. Stable,
                predictable payout. This is the regime where the Gordon model
                finally applies.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — The central formula                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.3"
          eyebrow="Section 3"
          title="The central formula"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Multi-stage valuation splits the stock&apos;s value into two
            pieces: the present value of dividends you forecast explicitly
            (years 1 through N), plus the present value of a terminal value that
            captures everything after year N.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Multi-stage DDM"
          tone="green"
          formula={String.raw`P_0 = \sum_{t=1}^{N} \frac{D_t}{(1+r)^t} + \frac{TV_N}{(1+r)^N}`}
          meaning="Stock value = present value of the explicit-forecast dividends + present value of the terminal value, each discounted back to today."
          variables={[
            { symbol: String.raw`P_0`, description: "stock value today" },
            { symbol: String.raw`D_t`, description: "dividend in year t (explicit forecast)" },
            { symbol: String.raw`TV_N`, description: "terminal value at the end of year N" },
            { symbol: String.raw`r`, description: "cost of equity (discount rate)" },
            { symbol: String.raw`N`, description: "length of the explicit forecast" },
          ]}
          interpretation="The first sum values each near-term dividend individually. The second term lumps every dividend from year N+1 onward into a single terminal value, then discounts that value back to today."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Terminal value (Gordon at time N)"
          tone="amber"
          formula={String.raw`TV_N = \frac{D_{N+1}}{r - g_S}`}
          meaning="Terminal value is the Gordon Growth Model computed at time N, using the next dividend D_{N+1} and the stable, mature growth rate g_S."
          variables={[
            { symbol: String.raw`D_{N+1}`, description: "first dividend of the mature stage = D_N × (1 + g_S)" },
            { symbol: String.raw`g_S`, description: "sustainable, stable growth rate (g_S < r)" },
            { symbol: String.raw`r`, description: "cost of equity" },
          ]}
          interpretation="Once the company has settled into its mature stage, the Gordon model applies. TV_N is the value, at time N, of that growing perpetuity starting with D_{N+1}."
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Terminal value is not liquidation">
          <p>
            Terminal value is <strong className="text-white">not</strong> the
            price for which the company is sold, and it is not a liquidation or
            scrap value. It is the present value, as of time N, of{" "}
            <em>all</em> cash flows the company will ever produce after year N.
            The business keeps operating indefinitely; the terminal value just
            packages that infinite tail into one number.
          </p>
        </DefinitionCard>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Timeline visual                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.4"
          eyebrow="Section 4"
          title="The timeline: explicit forecast + terminal value"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Picture the dividend stream laid out along a timeline. Years 1
            through N are forecast individually — each dividend is discounted on
            its own. At year N the terminal value attaches, representing
            everything from N+1 onward, and that single lump is discounted back
            N periods to today.
          </p>
          <div className="mt-5 overflow-x-auto">
            <div className="flex min-w-[560px] items-center gap-2 font-sans text-[12px]">
              <span className="rounded-md border border-white/30 bg-white/[0.04] px-3 py-1.5 text-slate-100">
                Time 0 (today)
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-accent-green">
                D₁
              </span>
              <span className="rounded-md border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-accent-green">
                D₂
              </span>
              <span className="text-slate-500" aria-hidden>
                …
              </span>
              <span className="rounded-md border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-accent-green">
                D₇
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                TV₇ at year 7
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-white/15 bg-white/[0.03] px-3 py-1.5 text-slate-300">
                D₈, D₉, … forever
              </span>
            </div>
          </div>
          <p className="ops-body mt-4 text-[15px] text-slate-300">
            Each green dividend is discounted back to time 0 on its own. The
            amber terminal value, which itself represents the entire infinite
            tail, is also discounted back to time 0 — but only once, using{" "}
            <InlineMath>{String.raw`(1+r)^7`}</InlineMath>.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Full worked example                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.5"
          eyebrow="Section 5"
          title="A full worked example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Suppose <InlineMath>{String.raw`D_0 = \$1`}</InlineMath>, dividends
            grow at <InlineMath>{String.raw`g_H = 6\%`}</InlineMath> for{" "}
            <InlineMath>{String.raw`N = 7`}</InlineMath> years, then stabilize
            at <InlineMath>{String.raw`g_S = 0\%`}</InlineMath> thereafter, and
            the cost of equity is{" "}
            <InlineMath>{String.raw`r = 20\%`}</InlineMath>. We build the
            dividend table, compute the terminal value, and sum the present
            values.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="text-[12px] text-slate-400">
                <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">t</th>
                <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">Dₜ</th>
                <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">(1.20)ᵗ</th>
                <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">PV(Dₜ)</th>
              </tr>
            </thead>
            <tbody className="font-sans text-[14px] text-slate-200">
              <tr className="odd:bg-white/[0.015]">
                <td className="px-4 py-1.5">1</td>
                <td className="px-4 py-1.5">$1.0600</td>
                <td className="px-4 py-1.5 text-slate-400">1.2000</td>
                <td className="px-4 py-1.5 text-slate-100">$0.8833</td>
              </tr>
              <tr className="odd:bg-white/[0.015]">
                <td className="px-4 py-1.5">2</td>
                <td className="px-4 py-1.5">$1.1236</td>
                <td className="px-4 py-1.5 text-slate-400">1.4400</td>
                <td className="px-4 py-1.5 text-slate-100">$0.7803</td>
              </tr>
              <tr className="odd:bg-white/[0.015]">
                <td className="px-4 py-1.5">3</td>
                <td className="px-4 py-1.5">$1.1910</td>
                <td className="px-4 py-1.5 text-slate-400">1.7280</td>
                <td className="px-4 py-1.5 text-slate-100">$0.6893</td>
              </tr>
              <tr className="odd:bg-white/[0.015]">
                <td className="px-4 py-1.5">4</td>
                <td className="px-4 py-1.5">$1.2625</td>
                <td className="px-4 py-1.5 text-slate-400">2.0736</td>
                <td className="px-4 py-1.5 text-slate-100">$0.6089</td>
              </tr>
              <tr className="odd:bg-white/[0.015]">
                <td className="px-4 py-1.5">5</td>
                <td className="px-4 py-1.5">$1.3382</td>
                <td className="px-4 py-1.5 text-slate-400">2.4883</td>
                <td className="px-4 py-1.5 text-slate-100">$0.5379</td>
              </tr>
              <tr className="odd:bg-white/[0.015]">
                <td className="px-4 py-1.5">6</td>
                <td className="px-4 py-1.5">$1.4185</td>
                <td className="px-4 py-1.5 text-slate-400">2.9860</td>
                <td className="px-4 py-1.5 text-slate-100">$0.4751</td>
              </tr>
              <tr className="odd:bg-white/[0.015]">
                <td className="px-4 py-1.5">7</td>
                <td className="px-4 py-1.5">$1.5036</td>
                <td className="px-4 py-1.5 text-slate-400">3.5832</td>
                <td className="px-4 py-1.5 text-slate-100">$0.4196</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-sans text-[14px] text-accent-green">
                <td className="border-t border-white/15 px-4 py-2" colSpan={3}>
                  PV of dividends (years 1–7)
                </td>
                <td className="border-t border-white/15 px-4 py-2">≈ $4.39</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Terminal value and total"
          tone="green"
          formula={String.raw`TV_7 = \frac{D_8}{r - g_S} = \frac{D_7(1+g_S)}{r - g_S}`}
          meaning="With g_S = 0%, D₈ = D₇ = $1.5036, so TV₇ = 1.5036 / 0.20 = $7.518."
          substitution={String.raw`P_0 = \underbrace{\$4.39}_{\text{PV of }D_1\ldots D_7} + \underbrace{\frac{\$7.518}{(1.20)^7}}_{\text{PV of }TV_7} = \$4.39 + \$2.10`}
          result="P₀ ≈ $6.49"
          interpretation="The seven explicitly-forecast dividends contribute about $4.39. The terminal value, once discounted back seven years, contributes another $2.10. Together they give roughly $6.49."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Comparison                                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.6"
          eyebrow="Section 6"
          title="One-stage vs multi-stage vs perpetual growth"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Holding <InlineMath>{String.raw`D_0 = \$1`}</InlineMath> and{" "}
            <InlineMath>{String.raw`r = 20\%`}</InlineMath> fixed, compare three
            assumptions about growth. The multi-stage answer sits between the
            two extremes.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">
                    Assumption
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">
                    Formula
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">
                    P₀
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-[14px] text-slate-200">
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-2">(a) No growth, 0% forever</td>
                  <td className="px-4 py-2 text-slate-400">D₁ / r = 1.06 / 0.20</td>
                  <td className="px-4 py-2 text-slate-100">$5.30</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-2">
                    (b) 6% for 7 yr, then 0% (multi-stage)
                  </td>
                  <td className="px-4 py-2 text-slate-400">
                    Σ PV(Dₜ) + PV(TV₇)
                  </td>
                  <td className="px-4 py-2 text-accent-cyan">$6.49</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-2">(c) 6% forever (Gordon)</td>
                  <td className="px-4 py-2 text-slate-400">
                    D₁ / (r − g) = 1.06 / 0.14
                  </td>
                  <td className="px-4 py-2 text-slate-100">$7.57</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] text-slate-300">
            Treating the company as if it never grows{" "}
            <strong className="text-white">understates</strong> value — it
            ignores real near-term dividend growth. Treating 6% as perpetual{" "}
            <strong className="text-white">overstates</strong> value — no company
            grows above the economy forever. Multi-stage lands in between,
            capturing the temporary growth honestly without projecting it out to
            infinity.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Stable growth extension                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.7"
          eyebrow="Section 7"
          title="Adding stable growth after year N"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The previous example set stable growth to zero for simplicity. In
            practice mature companies <em>do</em> grow, slowly, with inflation
            and the economy. Suppose instead that after year 7 the company
            grows at <InlineMath>{String.raw`g_S = 3\%`}</InlineMath>.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Terminal value with positive stable growth"
          tone="amber"
          formula={String.raw`TV_7 = \frac{D_8}{r - g_S} = \frac{D_7(1+g_S)}{r - g_S}`}
          meaning="D₈ = D₇ × (1 + 3%) = 1.5036 × 1.03 = $1.5487. Then TV₇ = 1.5487 / (0.20 − 0.03) = 1.5487 / 0.17 ≈ $9.11."
          substitution={String.raw`PV(TV_7) = \frac{\$9.11}{(1.20)^7} \approx \$2.54, \quad P_0 \approx \$4.39 + \$2.54 \approx \$6.93`}
          result="P₀ ≈ $6.93"
          interpretation="Positive stable growth raises both the numerator (D₈ is larger) and shrinks the denominator (r − g_S is smaller), so the terminal value — and the total price — is higher than the zero-growth-stable case."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Two-stage vs three-stage                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.8"
          eyebrow="Section 8"
          title="Two-stage vs three-stage models"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The multi-stage idea can be implemented with two stages or three.
            The trade-off is realism against simplicity.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Two-stage
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                High growth for N years, then an immediate jump to the stable
                rate. Simple to compute, but the cliff at year N is rarely
                realistic.
              </p>
            </div>
            <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-purple">
                Three-stage
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                High growth, a gradual transition, then stable growth. More
                believable, at the cost of more assumptions.
              </p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <div className="flex min-w-[560px] items-center gap-2 font-sans text-[12px]">
              <span className="rounded-md border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-accent-green">
                15%
              </span>
              <span className="text-slate-500" aria-hidden>→</span>
              <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                12%
              </span>
              <span className="text-slate-500" aria-hidden>→</span>
              <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                10%
              </span>
              <span className="text-slate-500" aria-hidden>→</span>
              <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                8%
              </span>
              <span className="text-slate-500" aria-hidden>→</span>
              <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                6%
              </span>
              <span className="text-slate-500" aria-hidden>→</span>
              <span className="rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-accent-cyan">
                4% (stable)
              </span>
            </div>
          </div>
          <p className="ops-body mt-4 text-[15px] text-slate-300">
            A three-stage model lets growth decelerate gradually — 15% down to a
            stable 4% — rather than dropping off a cliff. Each year of the
            transition still gets its own dividend in the explicit sum.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Why D_{N+1} not D_N                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.9"
          eyebrow="Section 9"
          title="Why the terminal uses D_{N+1}, not D_N"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The explicit forecast already discounts{" "}
            <InlineMath>{String.raw`D_N`}</InlineMath> as the last dividend in
            the sum. The terminal value starts one period{" "}
            <em>after</em> the explicit forecast, at{" "}
            <InlineMath>{String.raw`D_{N+1}`}</InlineMath>. Starting at{" "}
            <InlineMath>{String.raw`D_N`}</InlineMath> would count the year-N
            dividend twice — once in the explicit sum and once inside the
            terminal perpetuity.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Avoiding double-counting"
          tone="cyan"
          formula={String.raw`D_{N+1} = D_N \times (1 + g_S)`}
          meaning="Grow the last explicit dividend D_N by one period at the stable rate to obtain D_{N+1}, the first dividend of the mature stage."
          interpretation="This single-step growth bridges the explicit forecast into the stable perpetuity without overlapping any cash flow."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 10 — Zero-dividend growth stage                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.10"
          eyebrow="Section 10"
          title="A zero-dividend growth stage"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Many young companies pay no dividend at all during their growth
            stage. Suppose <InlineMath>{String.raw`D_1 = D_2 = \ldots = D_5 = 0`}</InlineMath>,
            and only starting in year 6 does the firm begin distributing cash.
            The stock can still have substantial positive value — because the
            terminal value captures the dividends that begin once the company
            matures.
          </p>
          <div className="mt-4 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-amber">
              Value is entirely terminal
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              When every explicit dividend is zero, the first sum vanishes and{" "}
              <InlineMath>{String.raw`P_0 = PV(TV_N)`}</InlineMath>. The entire
              value comes from discounting the terminal value. This is common
              for early-stage firms that reinvest everything today in order to
              pay out far in the future.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 11 — Discount rate note                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.11"
          eyebrow="Section 11"
          title="A note on the discount rate"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            In the most general DDM, each dividend can be discounted at a
            different rate that reflects its own risk — early cash flows might
            be discounted at one rate, mature cash flows at another. This lesson
            uses a single, constant <InlineMath>{String.raw`r`}</InlineMath>{" "}
            for every period. That is a simplification chosen for clarity; the
            key ideas — explicit forecast, terminal value, and{" "}
            <InlineMath>{String.raw`D_{N+1}`}</InlineMath> — are identical
            whichever discount-rate schedule you choose.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <MultiStageValuationBuilder />
      </Reveal>

      {/* =================================================================== */}
      {/* INLINE CONCEPT CHECK                                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.12"
          eyebrow="Concept check"
          title="Worked check: high growth, then stable"
        />
      </Reveal>
      <Reveal className="mt-6">
        <ConceptCheck />
      </Reveal>

      {/* =================================================================== */}
      {/* EXPANDABLE Q&A                                                      */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.13"
          eyebrow="Common questions"
          title="Terminal value, timing, and the stable stage"
        />
      </Reveal>
      <Reveal className="mt-6">
        <div className="space-y-3">
          <ExpandableQA question="Does terminal value mean the company is sold?">
            <p>
              No. Terminal value is <strong className="text-white">not</strong>{" "}
              a sale price or liquidation value. It is the present value, as of
              year N, of every cash flow the company produces from year N+1
              onward. The business keeps running indefinitely; the terminal
              value just packages that infinite tail into one number using the
              Gordon formula.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Why use D_{N+1} in the terminal formula?">
            <p>
              Because the explicit forecast already includes{" "}
              <InlineMath>{String.raw`D_N`}</InlineMath> as its final,
              individually-discounted dividend. The terminal value represents
              cash flows <em>after</em> year N, so it must begin at{" "}
              <InlineMath>{String.raw`D_{N+1}`}</InlineMath>. Starting at{" "}
              <InlineMath>{String.raw`D_N`}</InlineMath> would count that
              dividend twice.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Are we double-counting the final dividend?">
            <p>
              No — as long as you use{" "}
              <InlineMath>{String.raw`D_{N+1}`}</InlineMath>. The year-N
              dividend appears once, in the explicit sum. The terminal value
              starts at year N+1, so the two pieces cover disjoint sets of cash
              flows with no overlap.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Can a company pay no dividends during the growth stage?">
            <p>
              Yes. If <InlineMath>{String.raw`D_1 = \ldots = D_N = 0`}</InlineMath>,
              the explicit sum is zero and the entire value comes from the
              discounted terminal value. This is typical for young firms that
              reinvest all earnings early and begin distributing cash only after
              they mature.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Why does terminal value represent such a large share of total value?">
            <p>
              Because it bundles a very large number of distant cash flows into
              a single perpetuity. Even though each individual far-future
              dividend is small in present-value terms, there are infinitely
              many of them, so their aggregate — the terminal value — often
              dominates the explicitly forecast dividends.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Can the discount rate change when the company matures?">
            <p>
              In theory, yes. A mature, stable business is usually less risky
              than a fast-growing one, so the cost of equity could fall in the
              stable stage. This lesson uses a single constant{" "}
              <InlineMath>{String.raw`r`}</InlineMath> for simplicity. The
              structure of the model is unchanged if you use different rates —
              you simply discount each cash flow at its own rate.
            </p>
          </ExpandableQA>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="04"
          eyebrow="Mastery"
          title="Summary and mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 4.4 mastery check"
          passCount={3}
          onComplete={() => report()}
          continueLabel="Continue to From Earnings to Dividend Growth"
          continueHref="/lessons/equity-earnings-dividend-growth"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to From Earnings to Dividend Growth"
          continueHref="/lessons/equity-earnings-dividend-growth"
          replayLabel="Replay this lesson"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SOURCES AND NOTES                                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <EqSourcePanel />
      </Reveal>
    </EqLayout>
  );
}

function ConceptCheck() {
  const [revealed, setRevealed] = useState(false);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Worked check
          </span>
        </div>
      </div>

      <h4 className="ops-interactive-title mt-4 text-lg text-white">
        D₀ = $2, high growth 10% for 3 years, stable growth 4%, r = 12%
      </h4>
      <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
        Find the dividends, the terminal value, and the total value.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Reveal step by step
        </button>
      </div>
      {revealed && (
        <div className="mt-4 space-y-3">
          <Feedback status="info">
            <strong className="text-slate-100">Step 1 — explicit dividends.</strong>{" "}
            <InlineMath>{String.raw`D_1 = 2 \times 1.10 = \$2.20`}</InlineMath>,{" "}
            <InlineMath>{String.raw`D_2 = 2.20 \times 1.10 = \$2.42`}</InlineMath>,{" "}
            <InlineMath>{String.raw`D_3 = 2.42 \times 1.10 = \$2.662`}</InlineMath>.
          </Feedback>
          <Feedback status="info">
            <strong className="text-slate-100">Step 2 — first stable dividend.</strong>{" "}
            <InlineMath>{String.raw`D_4 = D_3(1+g_S) = 2.662 \times 1.04 = \$2.7685`}</InlineMath>.
            The terminal value starts at D₄, not D₃.
          </Feedback>
          <Feedback status="info">
            <strong className="text-slate-100">Step 3 — terminal value.</strong>{" "}
            <InlineMath>{String.raw`TV_3 = \frac{D_4}{r - g_S} = \frac{2.7685}{0.12 - 0.04} = \frac{2.7685}{0.08} \approx \$34.606`}</InlineMath>.
          </Feedback>
          <Feedback status="correct">
            <strong className="text-slate-100">Step 4 — total value.</strong>{" "}
            <InlineMath>{String.raw`P_0 = \frac{2.20}{1.12} + \frac{2.42}{1.12^2} + \frac{2.662}{1.12^3} + \frac{34.606}{1.12^3} \approx \$30.42`}</InlineMath>.
            The three explicit dividends plus the discounted terminal value give
            a total of roughly $30.42.
          </Feedback>
        </div>
      )}
    </InteractiveFrame>
  );
}
