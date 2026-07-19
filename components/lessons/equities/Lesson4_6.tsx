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
import PVGODecompositionLab from "./PVGODecompositionLab";

const LEARNING_OBJECTIVES = [
  "Define the no-growth value of a stock as EPS₁ / r.",
  "Decompose P₀ into EPS₁/r + PVGO.",
  "Determine the sign of PVGO from the ROE on new investment vs r.",
  "Derive P/E = 1/r + PVGO/EPS₁.",
  "Explain why safer companies tend to have higher P/E, all else equal.",
  "Explain why profitable growth can offset higher risk in P/E.",
  "Recognize that high or low P/E alone does not signal over- or undervaluation.",
];

const SUMMARY_POINTS = [
  "No-growth value = EPS₁/r — the value of existing operations paying out all earnings.",
  "PVGO = P₀ − EPS₁/r — the value of future growth opportunities.",
  "PVGO is positive when ROE on new investment exceeds r, zero when equal, negative when below.",
  "P/E = 1/r + PVGO/EPS₁ — decomposes into risk and growth components.",
  "Safer companies tend to have higher P/E, all else equal.",
  "Profitable growth can offset higher risk in P/E.",
  "High or low P/E alone does not indicate over- or undervaluation.",
  "Equity is residual. Its value reflects both existing assets and future opportunities.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "EPS₁ = $8.33, r = 15%. No-growth value?",
    choices: [
      { id: "a", label: "$55.56" },
      { id: "b", label: "$100" },
      { id: "c", label: "$8.33" },
    ],
    correctId: "a",
    hint: "EPS₁/r = 8.33 / 0.15 ≈ $55.56.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "P₀ = $100, no-growth value = $55.56. PVGO?",
    choices: [
      { id: "a", label: "$44.44" },
      { id: "b", label: "$100" },
      { id: "c", label: "$55.56" },
    ],
    correctId: "a",
    hint: "PVGO = P₀ − EPS₁/r = 100 − 55.56 = $44.44.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "If ROE_new < r, PVGO is:",
    choices: [
      { id: "neg", label: "Negative" },
      { id: "zero", label: "Zero" },
      { id: "pos", label: "Positive" },
    ],
    correctId: "neg",
    hint: "When reinvestment earns below its cost, growth destroys value, so PVGO < 0.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "P₀ = $100, EPS₁ = $8.33. Forward P/E?",
    choices: [
      { id: "twelve", label: "~12.0×" },
      { id: "six", label: "~6.67×" },
      { id: "fifteen", label: "~15×" },
    ],
    correctId: "twelve",
    hint: "P/E = P₀ / EPS₁ = 100 / 8.33 ≈ 12.0×.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "All else equal, a safer company (lower r) tends to have:",
    choices: [
      { id: "higher", label: "Higher P/E" },
      { id: "lower", label: "Lower P/E" },
      { id: "same", label: "Same P/E" },
    ],
    correctId: "higher",
    hint: "Lower r raises the no-growth component 1/r, which raises P/E.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "P/E decomposition: P/E = ?",
    choices: [
      { id: "decomp", label: "1/r + PVGO/EPS₁" },
      { id: "mul", label: "EPS₁ × r" },
      { id: "sq", label: "P₀ × EPS₁" },
    ],
    correctId: "decomp",
    hint: "Divide P₀ = EPS₁/r + PVGO by EPS₁ to get P/E = 1/r + PVGO/EPS₁.",
  },
];

export default function Lesson4_6() {
  const report = useReportEqComplete("equity-growth-opportunities-pvgo-pe");

  return (
    <EqLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="4.6"
        eyebrow="Lesson 4.6 · Module 4"
        heading="Growth Opportunities, PVGO, and P/E"
        subheading="Stock value reflects both existing earnings and future investment opportunities. Decompose P₀ = EPS₁/r + PVGO, and connect it to P/E."
        bullets={[
          "No-growth value = EPS₁/r",
          "PVGO = P₀ − EPS₁/r",
          "P/E = 1/r + PVGO/EPS₁",
          "Safer earnings and profitable growth both raise P/E",
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
            From Lesson 4.5
          </div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            Lesson 4.5 showed where growth comes from:{" "}
            <InlineMath>{String.raw`g = b \times ROE`}</InlineMath>. But that
            leaves a deeper question. If a firm can grow its earnings, does that
            growth automatically make shareholders better off? We saw the answer
            is <em>no</em> — growth only creates value when the return on new
            investment exceeds the cost of equity. This lesson makes that
            intuition precise by decomposing a stock&apos;s value into the part
            that comes from existing assets and the part that comes from future
            growth opportunities, and then connects the result to the P/E ratio.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — No-growth value                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.1"
          eyebrow="Section 1"
          title="The no-growth value"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Imagine a company that distributes <em>all</em> of its earnings as
            dividends and reinvests nothing. Its earnings do not grow, so it is
            just a level perpetuity of{" "}
            <InlineMath>{String.raw`EPS_1`}</InlineMath> per year.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="No-growth value"
          tone="cyan"
          formula={String.raw`P_0^{no\text{-}growth} = \frac{EPS_1}{r}`}
          meaning="If all earnings are paid out and nothing is reinvested, the stock is worth next year's earnings capitalized at the cost of equity."
          substitution={String.raw`EPS_1 = \$8.33,\; r = 15\% \;\Rightarrow\; P_0 = \frac{8.33}{0.15} \approx \$55.56`}
          result="P₀ ≈ $55.56"
          interpretation="No-growth does not mean the business shuts down. Current operations continue exactly as they are; the firm simply pays out everything it earns rather than reinvesting."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — ABC Software example                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.2"
          eyebrow="Section 2"
          title="ABC Software: value beyond no-growth"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Now meet ABC Software. It has{" "}
            <InlineMath>{String.raw`EPS_1 = \$8.33`}</InlineMath>, pays out{" "}
            <InlineMath>{String.raw`p = 60\%`}</InlineMath>, retains{" "}
            <InlineMath>{String.raw`b = 40\%`}</InlineMath>, earns{" "}
            <InlineMath>{String.raw`ROE_{new} = 25\%`}</InlineMath> on new
            investment, and faces{" "}
            <InlineMath>{String.raw`r = 15\%`}</InlineMath>. The dividend is{" "}
            <InlineMath>{String.raw`D_1 = 0.60 \times 8.33 \approx \$5`}</InlineMath>{" "}
            and the growth rate is{" "}
            <InlineMath>{String.raw`g = 0.40 \times 25\% = 10\%`}</InlineMath>.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="ABC Software value (Gordon)"
          tone="green"
          formula={String.raw`P_0 = \frac{D_1}{r - g} = \frac{5}{0.15 - 0.10}`}
          substitution={String.raw`P_0 = \frac{5}{0.05} = \$100`}
          result="P₀ = $100"
          interpretation="Compare to the no-growth value of $55.56. The difference — $44.44 — is the value the market assigns to ABC's future investment opportunities. That is PVGO."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Decomposition                                           */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.3"
          eyebrow="Section 3"
          title="Decomposing P₀ = EPS₁/r + PVGO"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Value decomposition"
          tone="purple"
          formula={String.raw`P_0 = \frac{EPS_1}{r} + PVGO`}
          meaning="Stock value = value of existing assets (no-growth) + present value of growth opportunities."
          variables={[
            {
              symbol: String.raw`EPS_1/r`,
              description:
                "value of current operations if all earnings were paid out",
            },
            {
              symbol: String.raw`PVGO`,
              description:
                "present value of all future value-creating investments",
            },
          ]}
          interpretation="The first term is what the firm is worth just for the business it already has. PVGO is the extra value the market pays because it expects the firm to find profitable new investments."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — First investment NPV                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.4"
          eyebrow="Section 4"
          title="NPV of the first new investment"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Where does PVGO actually come from? Look at the very first project
            ABC undertakes with its retained earnings.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="First project NPV"
          tone="green"
          formula={String.raw`NPV_1 = -\text{Investment} + \frac{ROE_{new} \times \text{Investment}}{r}`}
          meaning="Retain b × EPS₁ as capital. It earns ROE_new per year forever. The NPV is the present value of that perpetuity minus the capital invested."
          substitution={String.raw`\text{Investment} = 0.40 \times 8.33 = \$3.33,\quad \text{return} = 0.25 \times 3.33 = \$0.83/\text{yr},\quad PV = \frac{0.83}{0.15} = \$5.55`}
          result="NPV₁ = −3.33 + 5.55 = $2.22"
          interpretation="The $3.33 of retained earnings is capital the shareholders already owned — it is not value created. Value created is the NPV: $2.22. The project is worth more than it costs because ROE_new > r."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Total PVGO                                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.5"
          eyebrow="Section 5"
          title="From one project to total PVGO"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            ABC does not just invest once. Each year it retains more earnings
            and finds more opportunities, and the size of those opportunities
            grows at <InlineMath>{String.raw`g = 10\%`}</InlineMath>. So the
            NPVs of successive projects form a growing stream.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Total PVGO"
          tone="green"
          formula={String.raw`PVGO = \frac{NPV_1}{r - g}`}
          meaning="The present values of all future investment NPVs, which themselves grow at g, form a growing perpetuity starting at NPV₁."
          substitution={String.raw`PVGO = \frac{2.22}{0.15 - 0.10} = \frac{2.22}{0.05} \approx \$44.44`}
          result="PVGO ≈ $44.44"
          interpretation="Total PVGO is far larger than the first project's $2.22 because the firm keeps finding new, profitable opportunities year after year. This is why growth companies can trade well above their no-growth value."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Three PVGO cases                                        */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.6"
          eyebrow="Section 6"
          title="Three PVGO cases"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                ROE_new &gt; r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`PVGO > 0`}</InlineMath>. New investment
                earns above its cost. Growth creates value.
              </p>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                ROE_new = r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`PVGO = 0`}</InlineMath>. Investment
                earns exactly its cost. NPV-neutral.
              </p>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-red">
                ROE_new &lt; r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`PVGO < 0`}</InlineMath>. Investment
                earns below its cost. Growth destroys value.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Negative PVGO example                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.7"
          eyebrow="Section 7"
          title="Negative PVGO: growth that destroys value"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Suppose <InlineMath>{String.raw`EPS_1 = \$10`}</InlineMath>,{" "}
            <InlineMath>{String.raw`r = 10\%`}</InlineMath>,{" "}
            <InlineMath>{String.raw`b = 50\%`}</InlineMath>, and the firm earns
            only <InlineMath>{String.raw`ROE_{new} = 6\%`}</InlineMath> on new
            investment — below its cost of equity.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Value-destroying growth"
          tone="red"
          formula={String.raw`P_0 = \frac{D_1}{r - g},\quad g = b \times ROE_{new} = 0.50 \times 0.06 = 3\%`}
          meaning="D₁ = (1−b)·EPS₁ = 0.50 × 10 = $5. Plug into Gordon."
          substitution={String.raw`P_0 = \frac{5}{0.10 - 0.03} = \frac{5}{0.07} \approx \$71.43`}
          result="PVGO = 71.43 − 100 = −$28.57"
          interpretation="The no-growth value is EPS₁/r = 10/0.10 = $100. But because reinvestment earns only 6%, growth pushes the value DOWN to $71.43. Earnings rise — and value falls."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Growth stock definition                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.8"
          eyebrow="Section 8"
          title="What really makes a 'growth stock'"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="A growth stock has PVGO > 0">
          <p>
            A growth stock is <strong className="text-white">not</strong>{" "}
            defined by fast revenue or EPS growth. It is defined by having{" "}
            <InlineMath>{String.raw`PVGO > 0`}</InlineMath> — future investment
            opportunities whose returns exceed the cost of capital. A slow,
            boring company with one great new project can have positive PVGO. A
            flashy, fast-growing company that reinvests below its cost can have{" "}
            <em>negative</em> PVGO. The label &quot;growth&quot; belongs to the
            value created, not to the growth rate.
          </p>
        </DefinitionCard>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — P/E definition                                          */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading index="6.9" eyebrow="Section 9" title="Defining P/E" />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Forward P/E"
          tone="cyan"
          formula={String.raw`P/E = \frac{P_0}{EPS_1}`}
          meaning="The price-earnings ratio using next year's expected earnings (the forward P/E)."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="P/E decomposition"
          tone="purple"
          formula={String.raw`P/E = \frac{1}{r} + \frac{PVGO}{EPS_1}`}
          meaning="Divide P₀ = EPS₁/r + PVGO by EPS₁ to split P/E into a risk component and a growth component."
          variables={[
            {
              symbol: String.raw`1/r`,
              description:
                "the P/E a no-growth firm would have — purely a function of risk",
            },
            {
              symbol: String.raw`PVGO/EPS_1`,
              description:
                "extra multiple the market pays for growth opportunities",
            },
          ]}
          interpretation="The P/E is not one number with one cause. It is a baseline that reflects risk (1/r) plus a premium that reflects profitable growth (PVGO/EPS₁)."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 10 — No-growth P/E                                          */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.10"
          eyebrow="Section 10"
          title="The no-growth P/E = 1/r"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            If <InlineMath>{String.raw`PVGO = 0`}</InlineMath>, the growth
            component vanishes and{" "}
            <InlineMath>{String.raw`P/E = 1/r`}</InlineMath>. The multiple then
            depends <em>only</em> on the cost of equity. Lower risk means a
            higher baseline multiple.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    r
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    1/r (no-growth P/E)
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-[15px] text-slate-200">
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-1.5">8%</td>
                  <td className="px-4 py-1.5 text-slate-100">12.5×</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-1.5">10%</td>
                  <td className="px-4 py-1.5 text-slate-100">10×</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-1.5">15%</td>
                  <td className="px-4 py-1.5 text-slate-100">6.67×</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-1.5">20%</td>
                  <td className="px-4 py-1.5 text-slate-100">5×</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 11 — Risk clarification                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.11"
          eyebrow="Section 11"
          title="Risk and P/E"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Higher risk means a higher <InlineMath>{String.raw`r`}</InlineMath>,
            which lowers <InlineMath>{String.raw`1/r`}</InlineMath> and
            therefore lowers P/E, all else equal. Lower risk means a lower{" "}
            <InlineMath>{String.raw`r`}</InlineMath>, a higher{" "}
            <InlineMath>{String.raw`1/r`}</InlineMath>, and a higher P/E. In
            other words,{" "}
            <strong className="text-white">
              safer companies deserve higher P/E multiples
            </strong>
            , holding growth constant.
          </p>
          <div className="mt-4 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-amber">
              A caveat
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              This is an all-else-equal statement. It does{" "}
              <strong className="text-white">not</strong> mean every safe
              company has a higher P/E than every risky one — growth
              opportunities (PVGO) vary too. It means: for the same growth, the
              safer firm commands a higher multiple.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 12 — Risk vs growth                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.12"
          eyebrow="Section 12"
          title="When a riskier company has the higher P/E"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Compare two firms. Company A is safe —{" "}
            <InlineMath>{String.raw`r = 8\%`}</InlineMath> — but has no growth,
            so <InlineMath>{String.raw`P/E = 1/0.08 = 12.5\times`}</InlineMath>.
            Company B is riskier —{" "}
            <InlineMath>{String.raw`r = 15\%`}</InlineMath> — but has strong
            profitable growth (large PVGO). B&apos;s growth component{" "}
            <InlineMath>{String.raw`PVGO/EPS_1`}</InlineMath> can easily push
            its total P/E above 12.5×. Profitable growth can more than offset
            higher risk.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 13 — Gordon P/E                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.13"
          eyebrow="Section 13"
          title="P/E under the Gordon model"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Gordon P/E"
          tone="cyan"
          formula={String.raw`P/E = \frac{1-b}{r - b\,ROE}`}
          meaning="Substitute D₁ = (1−b)·EPS and g = b·ROE into P₀ = D₁/(r−g), then divide by EPS₁."
          interpretation="P/E depends on retention, ROE, and r together. The same ROE can produce very different multiples depending on how much is retained and what the cost of equity is."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 14 — ABC P/E decomposition                                  */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.14"
          eyebrow="Section 14"
          title="ABC's P/E, decomposed"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Recall ABC: <InlineMath>{String.raw`P_0 = \$100`}</InlineMath>,{" "}
            <InlineMath>{String.raw`EPS_1 = \$8.33`}</InlineMath>. Its forward
            P/E is{" "}
            <InlineMath>{String.raw`100/8.33 \approx 12.0\times`}</InlineMath>.
            Where does that 12.0× come from?
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Risk component 1/r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`1/0.15 = 6.67\times`}</InlineMath>. The
                multiple ABC would have with no growth.
              </p>
            </div>
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Growth component PVGO/EPS₁
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`44.44/8.33 \approx 5.33\times`}</InlineMath>
                . The extra multiple from profitable growth.
              </p>
            </div>
            <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-purple">
                Total
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <InlineMath>{String.raw`6.67 + 5.33 \approx 12.0\times`}</InlineMath>
                . Risk plus growth equals the observed P/E.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 15 — Interpretation                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.15"
          eyebrow="Section 15"
          title="What high and low P/E really mean"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                A high P/E may mean
              </div>
              <ul className="mt-2 space-y-2">
                {[
                  "Lower risk (higher 1/r)",
                  "Durable, high-quality earnings",
                  "Strong, profitable growth opportunities (large PVGO)",
                  "Temporarily depressed earnings",
                  "Market optimism about the future",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green"
                      aria-hidden
                    />
                    <span className="ops-body text-[15px] leading-7 text-slate-200">
                      {x}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-red">
                A low P/E may mean
              </div>
              <ul className="mt-2 space-y-2">
                {[
                  "Higher risk (lower 1/r)",
                  "Declining or cyclical business",
                  "Weak or no growth opportunities (negative PVGO)",
                  "Temporarily inflated earnings",
                  "Market pessimism",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red"
                      aria-hidden
                    />
                    <span className="ops-body text-[15px] leading-7 text-slate-200">
                      {x}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-amber">
              Key takeaway
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              High P/E does <strong className="text-white">not</strong> mean
              overvalued, and low P/E does{" "}
              <strong className="text-white">not</strong> mean undervalued. A
              multiple only means something once you know what drives it: risk,
              growth, or a temporary earnings distortion.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 16 — Forward vs trailing                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.16"
          eyebrow="Section 16"
          title="Forward vs trailing P/E"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Trailing P/E
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Price divided by the <em>most recent actual</em> (trailing)
                earnings. Backward-looking.
              </p>
            </div>
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Forward P/E
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Price divided by <em>expected</em> next-year earnings EPS₁. This
                is the version our model uses.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 17 — Normalized earnings                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.17"
          eyebrow="Section 17"
          title="Normalized earnings and P/E distortions"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Suppose a company&apos;s{" "}
            <strong className="text-white">normal</strong> EPS is $10, but this
            year earnings are temporarily depressed to $2. The stock trades at
            $100. The trailing P/E looks enormous:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    Measure
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    EPS
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-mono font-normal">
                    P/E
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-[15px] text-slate-200">
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-1.5">Trailing (depressed)</td>
                  <td className="px-4 py-1.5">$2</td>
                  <td className="px-4 py-1.5 text-accent-red">50×</td>
                </tr>
                <tr className="odd:bg-white/[0.015]">
                  <td className="px-4 py-1.5">Normalized</td>
                  <td className="px-4 py-1.5">$10</td>
                  <td className="px-4 py-1.5 text-accent-green">10×</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-accent-red/30 bg-accent-red/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-red">
              Distortion warning
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              The 50× trailing P/E says nothing about overvaluation. It reflects
              temporarily weak earnings. Using normalized earnings gives a truer
              10×. Always check whether earnings are normal before reading a
              multiple.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 18 — Module 4 synthesis                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.18"
          eyebrow="Synthesis"
          title="Putting Module 4 together"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Module 4 has built a single chain of reasoning, link by link:
          </p>
          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-[640px] flex-wrap items-center gap-2 font-mono text-[12px]">
              <span className="rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-accent-cyan">
                Equity ownership
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-accent-cyan">
                Distributions
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-accent-cyan">
                DDM
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-accent-green">
                Gordon
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-accent-green">
                Multi-stage
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                Earnings/retention
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                g = b·ROE
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-purple/40 bg-accent-purple/10 px-3 py-1.5 text-accent-purple">
                ROE vs r
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-purple/40 bg-accent-purple/10 px-3 py-1.5 text-accent-purple">
                PVGO
              </span>
              <span className="text-slate-500" aria-hidden>
                →
              </span>
              <span className="rounded-md border border-accent-purple/40 bg-accent-purple/10 px-3 py-1.5 text-accent-purple">
                P/E
              </span>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-cyan">
              The big picture
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              Fixed income is risk-specified: cash flows, timing, and priority
              are written into the contract.{" "}
              <strong className="text-white">Equity is residual.</strong> Its
              value reflects both the existing assets — whose earnings are
              capitalized at <InlineMath>{String.raw`r`}</InlineMath> — and the
              future opportunities — captured by PVGO. Everything in this module
              is a tool for quantifying that residual claim.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <PVGODecompositionLab />
      </Reveal>

      {/* =================================================================== */}
      {/* INLINE CONCEPT CHECK                                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="6.19"
          eyebrow="Concept check"
          title="Decompose a P/E"
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
          index="6.20"
          eyebrow="Common questions"
          title="PVGO, P/E, and what multiples mean"
        />
      </Reveal>
      <Reveal className="mt-6">
        <div className="space-y-3">
          <ExpandableQA question="Why can a safer company have a higher P/E?">
            <p>
              Because a safer company has a lower cost of equity{" "}
              <InlineMath>{String.raw`r`}</InlineMath>, which raises the
              no-growth component <InlineMath>{String.raw`1/r`}</InlineMath>.
              Holding growth constant, that lifts the whole P/E. Safer earnings
              deserve a higher multiple.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Can a risky company have a high P/E?">
            <p>
              Yes. A riskier firm has a lower{" "}
              <InlineMath>{String.raw`1/r`}</InlineMath>, but if its growth
              opportunities are large and profitable enough, the growth
              component <InlineMath>{String.raw`PVGO/EPS_1`}</InlineMath> can
              more than compensate. Profitable growth can offset higher risk.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Does fast EPS growth prove PVGO > 0?">
            <p>
              No. Earnings can grow even when reinvestment earns below the cost
              of equity — that growth destroys value and gives{" "}
              <InlineMath>{String.raw`PVGO < 0`}</InlineMath>. What matters is
              not the speed of growth but whether the return on new investment
              exceeds <InlineMath>{String.raw`r`}</InlineMath>.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Is retained investment itself value creation?">
            <p>
              No. Retaining a dollar simply keeps capital that shareholders
              already owned inside the firm. Value is created only by the NPV of
              what that capital earns above its cost. The investment is the
              input; the NPV is the value added.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Is PVGO on the balance sheet?">
            <p>
              No. PVGO is computed from the market price:{" "}
              <InlineMath>{String.raw`PVGO = P_0 - EPS_1/r`}</InlineMath>. It is
              the market&apos;s expectation of the value of future investments,
              not an accounting figure. The balance sheet records historical
              cost, not expected growth value.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Is all market value above book value PVGO?">
            <p>
              Not exactly. Book value is an accounting construct based on
              historical cost and accounting rules, which can differ greatly
              from economic value. The gap between market and book reflects many
              things — undervalued assets, brand, intangibles, and growth
              opportunities. PVGO is the specific portion attributable to future
              investment opportunities, derived from the price/earnings
              decomposition.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Why can PVGO change rapidly?">
            <p>
              Because it depends on <em>expectations</em> about future
              opportunities, not on past results. A new product, a regulatory
              change, a competitive threat, or a shift in technology can revise
              those expectations overnight. PVGO — and therefore the stock price
              — can move sharply even when current earnings have not changed.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Does high P/E mean overpriced?">
            <p>
              Not necessarily. A high P/E can reflect low risk, durable
              earnings, strong profitable growth, or simply temporarily
              depressed earnings. It is overvalued only if the price exceeds the
              justified decomposition{" "}
              <InlineMath>{String.raw`1/r + PVGO/EPS_1`}</InlineMath> with
              realistic assumptions.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Does low P/E mean cheap?">
            <p>
              Not necessarily. A low P/E can reflect high risk, a declining
              business, value-destroying reinvestment (negative PVGO), or
              temporarily inflated earnings. It is cheap only if the low
              multiple understates the firm&apos;s true growth and risk profile.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Why use forward rather than trailing P/E?">
            <p>
              Because trailing earnings can be distorted by temporary shocks — a
              one-time charge, a cyclical peak or trough, an accounting
              write-down. Forward earnings (EPS₁) better reflect the firm&apos;s
              ongoing earning power, which is what the model values. When
              trailing earnings are not normal, trailing P/E is misleading.
            </p>
          </ExpandableQA>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="06"
          eyebrow="Mastery"
          title="Summary and mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 4.6 mastery check"
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Equity Valuation Case Lab"
          continueHref="/lessons/equity-valuation-case-lab"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Equity Valuation Case Lab"
          continueHref="/lessons/equity-valuation-case-lab"
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
        EPS₁ = $6, r = 12%, price = $70
      </h4>
      <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
        Find the no-growth value, PVGO, the forward P/E, and decompose the P/E.
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
            <strong className="text-slate-100">No-growth value.</strong>{" "}
            <InlineMath>{String.raw`EPS_1/r = 6/0.12 = \$50`}</InlineMath>. This
            is what the firm would be worth paying out all earnings.
          </Feedback>
          <Feedback status="info">
            <strong className="text-slate-100">PVGO.</strong>{" "}
            <InlineMath>{String.raw`PVGO = P_0 - EPS_1/r = 70 - 50 = \$20`}</InlineMath>
            . The market assigns $20 to future growth opportunities.
          </Feedback>
          <Feedback status="info">
            <strong className="text-slate-100">Forward P/E.</strong>{" "}
            <InlineMath>{String.raw`P/E = 70/6 \approx 11.67\times`}</InlineMath>
            .
          </Feedback>
          <Feedback status="correct">
            <strong className="text-slate-100">Decomposition.</strong> No-growth
            component{" "}
            <InlineMath>{String.raw`1/r = 1/0.12 = 8.33\times`}</InlineMath>.
            Growth component{" "}
            <InlineMath>{String.raw`PVGO/EPS_1 = 20/6 = 3.33\times`}</InlineMath>
            . Check:{" "}
            <InlineMath>{String.raw`8.33 + 3.33 \approx 11.67\times`}</InlineMath>
            . The multiple splits into a risk piece and a growth piece.
          </Feedback>
        </div>
      )}
    </InteractiveFrame>
  );
}
