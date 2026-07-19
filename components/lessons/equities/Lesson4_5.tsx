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
import { useReportEqComplete } from "@/lib/eq-progress";
import { useState } from "react";
import EarningsReinvestmentSimulator from "./EarningsReinvestmentSimulator";

const LEARNING_OBJECTIVES = [
  "State the earnings identity: earnings = dividends + retained earnings.",
  "Define and compute the payout ratio p and the retention ratio b.",
  "Explain how retained earnings increase book value per share.",
  "Define ROE = EPS/BVPS and distinguish it from shareholder return.",
  "Derive the sustainable growth formula g = b × ROE.",
  "Identify when growth creates value (ROE > r) and when it does not.",
  "Explain why ROE = r produces value-neutral (NPV = 0) growth.",
];

const SUMMARY_POINTS = [
  "Earnings = dividends + retained earnings.",
  "Payout ratio p = DPS/EPS; retention ratio b = 1 − p.",
  "Book value per share increases by retained earnings per share.",
  "ROE = EPS/BVPS measures accounting profitability, not stock return.",
  "Sustainable growth: g = b × ROE.",
  "Growth creates value only when the return on new investment exceeds the cost of equity.",
  "When ROE = r, growth is value-neutral (NPV = 0).",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "If EPS = $5 and dividend = $2, what is the payout ratio?",
    choices: [
      { id: "forty", label: "40%" },
      { id: "sixty", label: "60%" },
      { id: "twenty", label: "20%" },
    ],
    correctId: "forty",
    hint: "p = DPS / EPS = 2 / 5 = 0.40.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "BVPS₀ = $30, ROE = 20%, b = 50%. What is g?",
    choices: [
      { id: "ten", label: "10%" },
      { id: "twenty", label: "20%" },
      { id: "fifteen", label: "15%" },
    ],
    correctId: "ten",
    hint: "g = b × ROE = 0.50 × 0.20 = 0.10.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "If ROE = r, does retaining earnings create value?",
    choices: [
      { id: "no", label: "No, NPV = 0" },
      { id: "yes", label: "Yes, always" },
      { id: "cond", label: "Only if b > 50%" },
    ],
    correctId: "no",
    hint: "When the return on new investment exactly equals the cost of equity, the NPV of reinvestment is zero.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "The sustainable growth formula is:",
    choices: [
      { id: "bROE", label: "g = b × ROE" },
      { id: "roer", label: "g = ROE / r" },
      { id: "yield", label: "g = D₁/P₀" },
    ],
    correctId: "bROE",
    hint: "Growth comes from retaining fraction b of earnings and earning ROE on the retained capital.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "Texas Western: ROE = 10%, r = 10%. Growth strategy value vs no-growth value?",
    choices: [
      { id: "same", label: "Same ($10 each)" },
      { id: "growth", label: "Growth is higher" },
      { id: "nogrowth", label: "No-growth is higher" },
    ],
    correctId: "same",
    hint: "When ROE = r, reinvestment earns exactly its cost, so NPV = 0 and the growth strategy adds nothing beyond the no-growth value.",
  },
];

export default function Lesson4_5() {
  const report = useReportEqComplete("equity-earnings-dividend-growth");

  return (
    <EqLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="4.5"
        eyebrow="Lesson 4.5 · Module 4"
        heading="From Earnings to Dividend Growth"
        subheading="The DDM needs dividend forecasts, but firms report earnings. Understand how payout, retention, book equity, and ROE produce sustainable growth."
        bullets={[
          "Earnings = dividends + retained earnings",
          "g = b × ROE",
          "Growth creates value only when ROE > r",
          "Distinguish ROE from shareholder return",
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
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
                  {i + 1}
                </span>
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {o}
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
            From Lessons 4.3 and 4.4
          </div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            The DDM and Gordon model value a stock from its dividends, and the
            multi-stage model needs a dividend growth rate for each stage. But
            where does that growth rate come from? Companies report{" "}
            <strong className="text-white">earnings</strong>, not dividends, and
            analysts forecast growth from the bottom up. This lesson traces the
            chain from earnings to dividends to growth, and shows exactly when
            growth creates value for shareholders.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — Earnings identity                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1"
          eyebrow="Section 1"
          title="The earnings identity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Every dollar of earnings goes one of two places: out the door as a
            dividend, or back into the business as retained earnings.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Earnings identity"
          formula={String.raw`\text{Earnings} = \text{Dividends} + \text{Retained Earnings}`}
          meaning="Earnings per share split into the dividend per share plus the retained earnings per share."
          substitution={String.raw`\$5 = \$2 + \$3`}
          interpretation="If EPS is $5 and the firm pays a $2 dividend, it keeps $3 inside the business. Earnings are not automatically cash in your pocket — only the dividend portion is."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Payout ratio                                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2"
          eyebrow="Section 2"
          title="The payout ratio"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Payout ratio"
          tone="cyan"
          formula={String.raw`p = \frac{DPS}{EPS}`}
          meaning="The fraction of earnings paid out as dividends."
          substitution={String.raw`p = \frac{\$2}{\$5} = 0.40`}
          result="p = 40%"
          interpretation="A 40% payout means 40 cents of every dollar earned is distributed. The dividend per share is DPS = p × EPS."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Retention ratio                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3"
          eyebrow="Section 3"
          title="The retention (plowback) ratio"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Retention ratio"
          tone="green"
          formula={String.raw`b = \frac{\text{Retained Earnings}}{\text{Earnings}} = 1 - p`}
          meaning="The fraction of earnings kept inside the business to reinvest."
          substitution={String.raw`b = \frac{\$3}{\$5} = 0.60 = 1 - 0.40`}
          result="b = 60%"
          interpretation="Whatever is not paid out is retained. So p + b = 1 always."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Book value                                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4"
          eyebrow="Section 4"
          title="Book value per share"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Book value per share"
          tone="purple"
          formula={String.raw`BVPS = \frac{\text{Book value of common equity}}{\text{Shares outstanding}}`}
          meaning="The accounting value of shareholders' equity, per share."
          variables={[
            { symbol: String.raw`BVPS`, description: "book value per share" },
            { symbol: String.raw`\text{Retained/share}`, description: "added to BVPS each year" },
          ]}
          substitution={String.raw`BVPS_0 = \$30,\quad \text{retain } \$3 \Rightarrow BVPS_1 = \$33`}
          interpretation="Retained earnings flow directly into book equity. If BVPS₀ is $30 and the firm retains $3 per share, then BVPS₁ = $33."
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Book value is accounting, not market">
          <p>
            Book value is what the <em>accounting</em> statements say equity is
            worth, based on historical cost and accounting rules. It is not the
            same as market value — the price at which the stock actually trades.
            A firm can trade far above or below its book value.
          </p>
        </DefinitionCard>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — ROE                                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5"
          eyebrow="Section 5"
          title="Return on equity (ROE)"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="ROE"
          tone="green"
          formula={String.raw`ROE = \frac{EPS_1}{BVPS_0}`}
          meaning="The accounting return the firm earns on its book equity."
          substitution={String.raw`ROE = \frac{\$6}{\$30} = 0.20`}
          result="ROE = 20%"
          interpretation="A $6 profit on $30 of book equity is a 20% accounting return."
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            ROE is one of the most misunderstood numbers in finance. It is an
            <strong className="text-white"> accounting</strong> measure of how
            profitable the existing book of business is. It is{" "}
            <strong className="text-white">not</strong> any of these:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    Concept
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    Definition
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    Same as ROE?
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-[14px] text-slate-200">
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-2">ROE</td>
                  <td className="px-4 py-2 text-slate-400">EPS / BVPS</td>
                  <td className="px-4 py-2 text-accent-green">— (itself)</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-2">Shareholder return</td>
                  <td className="px-4 py-2 text-slate-400">
                    (D₁ + P₁ − P₀) / P₀
                  </td>
                  <td className="px-4 py-2 text-accent-red">No</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-2">Cost of equity r</td>
                  <td className="px-4 py-2 text-slate-400">
                    required return investors demand
                  </td>
                  <td className="px-4 py-2 text-accent-red">No</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-2">Dividend yield</td>
                  <td className="px-4 py-2 text-slate-400">D₁ / P₀</td>
                  <td className="px-4 py-2 text-accent-red">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Sustainable growth derivation                           */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.6"
          eyebrow="Section 6"
          title="Deriving sustainable growth: g = b × ROE"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Growth in earnings comes from a simple chain: the firm{" "}
            <strong className="text-white">retains</strong> part of its earnings,
            that retention{" "}
            <strong className="text-white">increases book equity</strong>, and
            the firm <strong className="text-white">earns ROE</strong> on the
            larger book. Let&apos;s trace it with numbers.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Start
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`BVPS_0 = \$30`}</InlineMath>,{" "}
                <InlineMath>{String.raw`ROE = 20\%`}</InlineMath>, so{" "}
                <InlineMath>{String.raw`EPS_1 = 0.20 \times 30 = \$6`}</InlineMath>.
                Retention <InlineMath>{String.raw`b = 50\%`}</InlineMath>.
              </p>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                Retain
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Retained = <InlineMath>{String.raw`b \times EPS_1 = 0.50 \times 6 = \$3`}</InlineMath>.
                So <InlineMath>{String.raw`BVPS_1 = 30 + 3 = \$33`}</InlineMath>.
              </p>
            </div>
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Next year
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`EPS_2 = ROE \times BVPS_1 = 0.20 \times 33 = \$6.60`}</InlineMath>.
                Growth = <InlineMath>{String.raw`(6.60-6)/6 = 10\%`}</InlineMath>.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Sustainable growth, derived"
          tone="green"
          formula={String.raw`g = b \times ROE`}
          meaning="Earnings grow at the retention ratio times the return earned on the retained capital."
          variables={[
            { symbol: String.raw`b`, description: "retention ratio" },
            { symbol: String.raw`ROE`, description: "return on book equity (and on new investment, under the model's assumptions)" },
          ]}
          substitution={String.raw`E_1 = ROE \cdot BV_0,\;\; \text{retained} = bE_1,\;\; BV_1 = BV_0(1 + b\,ROE) \Rightarrow g = \frac{E_2 - E_1}{E_1} = b\,ROE`}
          interpretation="The derivation: next period's earnings are ROE times this period's book; retained earnings raise book by b × ROE percent; so earnings themselves grow at b × ROE."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Assumptions                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.7"
          eyebrow="Section 7"
          title="Assumptions behind g = b × ROE"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The formula is elegant but rests on several assumptions. Treat it
            as a useful approximation, not a law of nature.
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              "Retention ratio b is stable over time.",
              "ROE is stable, and new investment earns the same ROE as the existing book.",
              "Reinvested capital is productive — it actually generates the assumed return.",
              "Growth is financed internally (no new share issuance, no buybacks).",
              "Share count does not change.",
            ].map((x) => (
              <li key={x} className="flex items-start gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                  aria-hidden
                />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {x}
                </span>
              </li>
            ))}
          </ul>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            In reality, retention, ROE, and share count all move around. The
            formula captures the <em>typical</em> relationship, not every firm
            in every year.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Connection to Gordon                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.8"
          eyebrow="Section 8"
          title="Connecting g to the Gordon model"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Gordon with sustainable growth"
          tone="cyan"
          formula={String.raw`P_0 = \frac{EPS_1(1-b)}{r - b\,ROE}`}
          meaning="Substitute DPS = (1−b)·EPS and g = b·ROE into P₀ = D₁/(r−g)."
          interpretation="There is a trade-off built in: a higher retention b lowers today's dividend (1−b)·EPS but raises the growth rate b·ROE. Whether more retention helps depends on whether ROE exceeds r."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Three-case comparison                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.9"
          eyebrow="Section 9"
          title="Three cases: creates, neutral, destroys value"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Fix <InlineMath>{String.raw`r = 10\%`}</InlineMath> and compare what
            happens when ROE on new investment is above, at, or below r.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                ROE = 15% &gt; r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Each retained dollar earns 15% while costing 10%. Reinvestment
                creates value. Growth is good.
              </p>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                ROE = 10% = r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Each retained dollar earns exactly its cost. NPV = 0. Growth is
                value-neutral — it neither helps nor hurts.
              </p>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-red">
                ROE = 4% &lt; r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Each retained dollar earns 4% while costing 10%. Reinvestment
                destroys value. The firm would do better to pay the earnings out.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 10 — Texas Western example                                  */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.10"
          eyebrow="Section 10"
          title="The Texas Western example: ROE = r"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A classic illustration. Suppose{" "}
            <InlineMath>{String.raw`EPS_1 = \$1`}</InlineMath>,{" "}
            <InlineMath>{String.raw`BVPS_0 = \$10`}</InlineMath>, book assets
            grow at <InlineMath>{String.raw`8\%`}</InlineMath>, and both{" "}
            <InlineMath>{String.raw`ROE = 10\%`}</InlineMath> and{" "}
            <InlineMath>{String.raw`r = 10\%`}</InlineMath>. The firm retains{" "}
            <InlineMath>{String.raw`\$0.80`}</InlineMath>, so{" "}
            <InlineMath>{String.raw`b = 80\%`}</InlineMath>,{" "}
            <InlineMath>{String.raw`p = 20\%`}</InlineMath>, and{" "}
            <InlineMath>{String.raw`D_1 = \$0.20`}</InlineMath>. With{" "}
            <InlineMath>{String.raw`g = b\,ROE = 8\%`}</InlineMath>:
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Growth strategy value"
          tone="amber"
          formula={String.raw`P_0 = \frac{D_1}{r - g} = \frac{0.20}{0.10 - 0.08}`}
          substitution={String.raw`P_0 = \frac{0.20}{0.02} = \$10`
          }
          result="P₀ = $10"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="No-growth comparison"
          tone="cyan"
          formula={String.raw`P_0^{no\text{-}growth} = \frac{EPS_1}{r} = \frac{1}{0.10}`}
          substitution={String.raw`P_0^{no\text{-}growth} = \$10`}
          result="P₀ = $10"
          interpretation="Both strategies give $10. Reinvesting at ROE = r produces growth, but no extra value — the NPV of reinvestment is exactly zero."
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            The one-dollar explanation
          </div>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
            Retain $1 of earnings. It earns{" "}
            <InlineMath>{String.raw`ROE = 10\%`}</InlineMath>, so{" "}
            <InlineMath>{String.raw`\$0.10`}</InlineMath> per year forever. That
            stream is worth{" "}
            <InlineMath>{String.raw`0.10 / 0.10 = \$1`}</InlineMath>. You put in
            $1 of capital and got back $1 of value — NPV = 0. This is exactly why
            ROE = r is the dividing line between value creation and destruction.
          </p>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 11 — Growth slowdown example                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.11"
          eyebrow="Section 11"
          title="Growth slowdown: still worth $10"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Now let the company grow at 8% through year 5, then slow to 4%.
            Keep <InlineMath>{String.raw`ROE = 10\%`}</InlineMath> and{" "}
            <InlineMath>{String.raw`r = 10\%`}</InlineMath>. Retention is{" "}
            <InlineMath>{String.raw`b = 80\%`}</InlineMath> during high growth
            and <InlineMath>{String.raw`b = 40\%`}</InlineMath> once stable. The
            forecast looks like this:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 px-3 py-2 font-mono font-normal">Year</th>
                  <th className="border-b border-white/15 px-3 py-2 font-mono font-normal">BVPS</th>
                  <th className="border-b border-white/15 px-3 py-2 font-mono font-normal">EPS</th>
                  <th className="border-b border-white/15 px-3 py-2 font-mono font-normal">b</th>
                  <th className="border-b border-white/15 px-3 py-2 font-mono font-normal">Retained</th>
                  <th className="border-b border-white/15 px-3 py-2 font-mono font-normal">Dividend</th>
                  <th className="border-b border-white/15 px-3 py-2 font-mono font-normal">End BVPS</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px] text-slate-200">
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-3 py-1.5">0</td>
                  <td className="px-3 py-1.5">$10.00</td>
                  <td className="px-3 py-1.5">$1.000</td>
                  <td className="px-3 py-1.5">80%</td>
                  <td className="px-3 py-1.5">$0.800</td>
                  <td className="px-3 py-1.5">$0.200</td>
                  <td className="px-3 py-1.5">$10.80</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-3 py-1.5">1</td>
                  <td className="px-3 py-1.5">$10.80</td>
                  <td className="px-3 py-1.5">$1.080</td>
                  <td className="px-3 py-1.5">80%</td>
                  <td className="px-3 py-1.5">$0.864</td>
                  <td className="px-3 py-1.5">$0.216</td>
                  <td className="px-3 py-1.5">$11.66</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-3 py-1.5">2</td>
                  <td className="px-3 py-1.5">$11.66</td>
                  <td className="px-3 py-1.5">$1.166</td>
                  <td className="px-3 py-1.5">80%</td>
                  <td className="px-3 py-1.5">$0.933</td>
                  <td className="px-3 py-1.5">$0.233</td>
                  <td className="px-3 py-1.5">$12.60</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-3 py-1.5">3</td>
                  <td className="px-3 py-1.5">$12.60</td>
                  <td className="px-3 py-1.5">$1.260</td>
                  <td className="px-3 py-1.5">80%</td>
                  <td className="px-3 py-1.5">$1.008</td>
                  <td className="px-3 py-1.5">$0.252</td>
                  <td className="px-3 py-1.5">$13.60</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-3 py-1.5">4</td>
                  <td className="px-3 py-1.5">$13.60</td>
                  <td className="px-3 py-1.5">$1.360</td>
                  <td className="px-3 py-1.5">80%</td>
                  <td className="px-3 py-1.5">$1.088</td>
                  <td className="px-3 py-1.5">$0.272</td>
                  <td className="px-3 py-1.5">$14.69</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-3 py-1.5">5</td>
                  <td className="px-3 py-1.5">$14.69</td>
                  <td className="px-3 py-1.5">$1.469</td>
                  <td className="px-3 py-1.5">40%</td>
                  <td className="px-3 py-1.5">$0.588</td>
                  <td className="px-3 py-1.5">$0.881</td>
                  <td className="px-3 py-1.5">$15.28</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-3 py-1.5">6</td>
                  <td className="px-3 py-1.5">$15.28</td>
                  <td className="px-3 py-1.5">$1.528</td>
                  <td className="px-3 py-1.5">40%</td>
                  <td className="px-3 py-1.5">$0.611</td>
                  <td className="px-3 py-1.5">$0.917</td>
                  <td className="px-3 py-1.5">$15.89</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] text-slate-300">
            Despite the rising earnings and dividends, the value remains{" "}
            <InlineMath>{String.raw`\$10`}</InlineMath>. Every dollar reinvested
            earns exactly <InlineMath>{String.raw`r = 10\%`}</InlineMath>, so
            each reinvestment has NPV = 0. Growth with ROE = r adds nothing.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 12 — Real-world clarification                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.12"
          eyebrow="Section 12"
          title="Historical ROE vs incremental ROE"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            One last, crucial distinction. A firm can report a{" "}
            <strong className="text-white">high historical ROE</strong> on its
            existing book of business — old, profitable investments — while
            having <strong className="text-white">few good new opportunities</strong>.
            Value creation depends on the return on the{" "}
            <em>next</em> dollar of investment, not on the average return of the
            past dollars.
          </p>
          <div className="mt-4 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-amber">
              Watch the incremental ROE
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              A mature firm might show 20% ROE on its legacy assets but only earn
              6% on new projects. The reported ROE looks great; the growth
              strategy still destroys value. Always ask: what is the return on
              the <em>marginal</em> investment?
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <EarningsReinvestmentSimulator />
      </Reveal>

      {/* =================================================================== */}
      {/* INLINE CONCEPT CHECK                                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.13"
          eyebrow="Concept check"
          title="When g = r, Gordon cannot run forever"
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
          index="5.14"
          eyebrow="Common questions"
          title="Earnings, ROE, and the value of growth"
        />
      </Reveal>
      <Reveal className="mt-6">
        <div className="space-y-3">
          <ExpandableQA question="Are earnings the same as dividends?">
            <p>
              No. Earnings split into dividends plus retained earnings:{" "}
              <InlineMath>{String.raw`\text{EPS} = \text{DPS} + \text{Retained}`}</InlineMath>.
              Only the dividend portion reaches shareholders as cash in the year
              earned; the retained portion stays inside the firm to (hopefully)
              generate future value.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Are retained earnings cash sitting in a separate account?">
            <p>
              No. Retained earnings are an accounting figure representing capital
              the firm has kept. In practice the firm reinvests them — into
              equipment, inventory, R&amp;D, acquisitions, and so on. They are
              not a pile of cash waiting to be handed back.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Is ROE the return shareholders earn on the stock?">
            <p>
              No. ROE is an accounting profitability ratio,{" "}
              <InlineMath>{String.raw`EPS / BVPS`}</InlineMath>. The return you
              actually earn as a shareholder is{" "}
              <InlineMath>{String.raw`(D_1 + P_1 - P_0)/P_0`}</InlineMath>{" "}
              dividend plus price change, relative to what you paid. A firm can
              have high ROE and a falling stock price, or vice versa.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Does retaining more always create more value?">
            <p>
              Only if the return on the retained capital exceeds the cost of
              equity. If <InlineMath>{String.raw`ROE > r`}</InlineMath>, retention
              creates value; if{" "}
              <InlineMath>{String.raw`ROE = r`}</InlineMath>, it is neutral; if{" "}
              <InlineMath>{String.raw`ROE < r`}</InlineMath>, it destroys value.
              More retention is better only when reinvestment is profitable
              enough.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Is a higher ROE always better?">
            <p>
              Not if the <em>incremental</em> ROE — the return on new investment
              — is low. A firm can report high ROE on its legacy assets but earn
              little on new projects. Value depends on the marginal return, not
              the historical average.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Why can earnings grow without value increasing?">
            <p>
              Because when{" "}
              <InlineMath>{String.raw`ROE = r`}</InlineMath>, every dollar
              retained generates exactly a dollar of value — NPV = 0. Earnings
              and dividends rise, but the value created equals the capital
              consumed, so the stock price is unchanged. Growth alone does not
              create value; <em>profitable</em> growth does.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Why care about incremental ROE vs reported ROE?">
            <p>
              Because future value comes from future investments, not past ones.
              A firm with a glorious history of 25% ROE but no new opportunities
              above its cost of capital cannot create value by growing. Always
              judge reinvestment by the return on the next dollar, not by the
              return on dollars already deployed.
            </p>
          </ExpandableQA>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="05"
          eyebrow="Mastery"
          title="Summary and mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 4.5 mastery check"
          passCount={3}
          onComplete={() => report()}
          continueLabel="Continue to Growth Opportunities, PVGO, and P/E"
          continueHref="/lessons/equity-growth-opportunities-pvgo-pe"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Growth Opportunities, PVGO, and P/E"
          continueHref="/lessons/equity-growth-opportunities-pvgo-pe"
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
        EPS₁ = $4, payout = 25%, ROE = 16%, r = 12%
      </h4>
      <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
        Find the retention ratio, the dividend, the growth rate, and decide
        whether Gordon can value this stock perpetually.
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
            <strong className="text-slate-100">Retention and dividend.</strong>{" "}
            <InlineMath>{String.raw`b = 1 - p = 1 - 0.25 = 75\%`}</InlineMath>.{" "}
            <InlineMath>{String.raw`D_1 = p \times EPS_1 = 0.25 \times 4 = \$1`}</InlineMath>.
          </Feedback>
          <Feedback status="info">
            <strong className="text-slate-100">Growth.</strong>{" "}
            <InlineMath>{String.raw`g = b \times ROE = 0.75 \times 0.16 = 12\%`}</InlineMath>.
          </Feedback>
          <Feedback status="correct">
            <strong className="text-slate-100">Value creation, but no perpetual Gordon.</strong>{" "}
            Because <InlineMath>{String.raw`ROE = 16\% > r = 12\%`}</InlineMath>,
            reinvestment creates value. But{" "}
            <InlineMath>{String.raw`g = 12\% = r`}</InlineMath>, so the Gordon
            denominator{" "}
            <InlineMath>{String.raw`r - g = 0`}</InlineMath> and the perpetuity
            cannot be applied indefinitely. A multi-stage model is needed: let
            growth run for a finite period, then slow it to a stable{" "}
            <InlineMath>{String.raw`g_S < r`}</InlineMath> for the terminal value.
          </Feedback>
        </div>
      )}
    </InteractiveFrame>
  );
}
