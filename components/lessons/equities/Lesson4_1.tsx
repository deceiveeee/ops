"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  FormulaExplainer,
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
import ReinvestmentDecisionLab from "./ReinvestmentDecisionLab";

const LEARNING_OBJECTIVES = [
  "Explain that a share of stock is a fractional ownership claim on the company.",
  "Explain why equity is a residual claim that sits behind debt and senior obligations.",
  "Explain how limited liability caps a shareholder's downside at the amount invested.",
  "List the channels through which shareholders receive economic value.",
  "Explain why a stock with no current dividend can still have value.",
  "Distinguish value-creating growth from value-destroying growth.",
  "Explain that growth creates value only when return on investment exceeds the cost of equity.",
  "Explain that the required return and the cost of equity are the same rate seen from different perspectives.",
];

const SUMMARY_POINTS = [
  "Equity is a residual ownership claim.",
  "Shareholder loss is limited to the amount invested.",
  "Shareholders receive value through distributions and price appreciation.",
  "A stock need not pay current dividends to have value.",
  "Growth creates value only when return on investment exceeds the cost of equity.",
  "Required return and cost of equity are the same rate seen from different perspectives.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "A company has 1,000 shares outstanding. You own 10. What fraction of the company do you own?",
    choices: [
      { id: "one", label: "1%" },
      { id: "five", label: "5%" },
      { id: "ten", label: "10%" },
    ],
    correctId: "one",
    hint: "10 out of 1,000 shares = 10/1000 = 1%.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "A company has assets worth $10M and debt of $6M. What is the equity worth?",
    choices: [
      { id: "four", label: "$4M" },
      { id: "six", label: "$6M" },
      { id: "sixteen", label: "$16M" },
    ],
    correctId: "four",
    hint: "Equity = assets − debt = $10M − $6M.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "A company retains $100 and earns a 4% return while shareholders require 10%. Does this create value?",
    choices: [
      { id: "no", label: "No, it destroys value." },
      { id: "yes", label: "Yes, because earnings grew." },
      { id: "positive", label: "Yes, because 4% is positive." },
    ],
    correctId: "no",
    hint: "The return earned (4%) is below the required return (10%), so NPV is negative.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "From the company's perspective, the shareholder's required return is called:",
    choices: [
      { id: "coe", label: "Cost of equity" },
      { id: "yield", label: "Dividend yield" },
      { id: "coupon", label: "Coupon rate" },
    ],
    correctId: "coe",
    hint: "Same rate, two perspectives: return for the investor, cost for the company.",
  },
];

export default function Lesson4_1() {
  const report = useReportEqComplete("equity-what-does-owning-a-stock-mean");

  return (
    <EqLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="4.1"
        eyebrow="Lesson 4.1 · Module 4"
        heading="What does owning a stock actually mean?"
        subheading="A share of stock is a fractional ownership claim. Equity is what remains after debt. Growth creates value only when the company earns more than investors require."
        bullets={[
          "Equity is a residual claim",
          "Limited liability caps your downside",
          "Shareholders receive dividends, buybacks, or capital gains",
          "Growth creates value only when return exceeds cost of equity",
        ]}
        primaryLabel="Start"
        secondaryLabel="View module map"
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
            From Fixed-Income to Equities
          </div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            In the fixed-income module you studied bonds: a bond is a{" "}
            <strong className="text-white">contractual</strong> promise to pay
            defined cash flows on defined dates. Equities are different. A share
            of stock gives you an{" "}
            <strong className="text-white">ownership</strong> stake in a real
            business, and your payoff is{" "}
            <strong className="text-white">residual</strong> — whatever is left
            after creditors and other senior claimants are paid. That residual
            nature is the source of both the upside and the risk of equity
            investing, and it is the reason valuation is harder for stocks than
            for bonds.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — A share is an ownership claim                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.1"
          eyebrow="Section 1"
          title="A share is an ownership claim"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Share of stock">
          A share of stock represents a fractional ownership claim on a company.
          If a company has 1,000 shares outstanding and you own 10 of them, you
          own <span className="text-slate-50">1%</span> of the company.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Owning a share does not mean you own a specific piece of equipment,
            a desk, or a patent. Your ownership is a{" "}
            <strong className="text-white">legal and financial</strong> claim.
            That claim gives you a package of rights.
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              ["Voting rights", "A say in major corporate decisions, typically through board elections."],
              ["Transferability", "The ability to sell your shares to another investor."],
              ["Residual value", "A claim on whatever value remains after creditors are paid."],
              ["Limited liability", "Your maximum ordinary loss is the amount you invested."],
            ].map(([term, desc]) => (
              <li key={term} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  <strong className="text-white">{term}.</strong> {desc}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Equity is the residual claim                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.2"
          eyebrow="Section 2"
          title="Equity is the residual claim"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A simple balance sheet makes the residual nature of equity concrete.
            Suppose a company has assets worth{" "}
            <strong className="text-white">$10M</strong>, financed by{" "}
            <strong className="text-white">$6M</strong> of debt and{" "}
            <strong className="text-white">$4M</strong> of equity.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 pb-2 pr-6 font-sans font-normal">Item</th>
                  <th className="border-b border-white/15 pb-2 pr-6 font-sans font-normal">Amount</th>
                  <th className="border-b border-white/15 pb-2 font-sans font-normal">Claim type</th>
                </tr>
              </thead>
              <tbody className="font-sans text-[15px] text-slate-200">
                <tr>
                  <td className="py-2 pr-6">Assets</td>
                  <td className="py-2 pr-6 text-slate-50">$10M</td>
                  <td className="py-2 text-slate-300">What the company owns</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6">Debt</td>
                  <td className="py-2 pr-6 text-accent-amber">$6M</td>
                  <td className="py-2 text-slate-300">Senior, contractual</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6">Equity</td>
                  <td className="py-2 pr-6 text-accent-green">$4M</td>
                  <td className="py-2 text-slate-300">Residual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Equity as a residual"
          tone="green"
          formula={String.raw`\text{Equity value} = \text{Asset value} - \text{Debt and senior claims}`}
          meaning="Equity is what is left over after every creditor and senior claimant has been paid in full. Debt holders have a fixed contractual claim; shareholders get the remainder."
          interpretation="Because equity is last in line, the same change in asset value produces a much larger percentage change in equity value."
        />
      </Reveal>
      <Reveal className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-red">
              Downside asymmetry
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              Assets fall from <strong className="text-white">$10M</strong> to{" "}
              <strong className="text-white">$7M</strong> (a 30% drop). Debt is
              still <strong className="text-white">$6M</strong>. Equity collapses
              from <strong className="text-white">$4M</strong> to{" "}
              <strong className="text-accent-red">$1M</strong> — a 75% drop.
            </p>
          </div>
          <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-green">
              Upside asymmetry
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              Assets rise from <strong className="text-white">$10M</strong> to{" "}
              <strong className="text-white">$15M</strong> (a 50% gain). Debt is
              still <strong className="text-white">$6M</strong>. Equity rises
              from <strong className="text-white">$4M</strong> to{" "}
              <strong className="text-accent-green">$9M</strong> — a 125% gain.
            </p>
          </div>
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] text-slate-300">
            Lenders keep their contractual <strong className="text-white">$6M</strong>{" "}
            claim whether the company does well or badly (as long as it can pay).
            The residual upside from good performance accrues entirely to{" "}
            <strong className="text-white">shareholders</strong> — and so does the
            first dollar of loss when performance deteriorates.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Limited liability                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.3"
          eyebrow="Section 3"
          title="Limited liability"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Maximum ordinary shareholder loss"
          tone="red"
          formula={String.raw`\text{Max ordinary shareholder loss} = \text{amount invested}`}
          meaning="If the company fails, you can lose your entire investment — but no more. Creditors cannot pursue your personal assets to cover the company's unpaid debts."
          interpretation="Limited liability is what makes widespread equity investment feasible: you can buy a share without taking on unlimited personal responsibility for everything the company might do."
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            &ldquo;Limited&rdquo; does not mean{" "}
            <strong className="text-white">safe</strong>. An ordinary
            shareholder can lose{" "}
            <strong className="text-accent-red">100%</strong> of the amount
            invested — the share price can go to zero. Limited liability only
            caps your loss{" "}
            <strong className="text-white">at</strong> the amount invested; it
            does not protect you from losing that amount.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — How shareholders receive value                          */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.4"
          eyebrow="Section 4"
          title="How shareholders receive value"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Shareholder return"
          tone="green"
          formula={String.raw`\text{Shareholder return} = \text{cash distributions} + \text{price appreciation}`}
          meaning="Your total return as a shareholder comes from two channels: cash the company sends you, plus any increase (or decrease) in the share price."
          interpretation="The split between these two channels varies enormously across companies and over time."
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Cash distributions and capital gains come in several specific forms:
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              ["Dividends", "Regular cash payments, typically quarterly, from profits."],
              ["Special dividends", "One-off large distributions, often from asset sales or excess cash."],
              ["Share repurchases (buybacks)", "The company buys back stock, reducing share count and lifting per-share value."],
              ["Acquisition proceeds", "Cash or shares received if the company is bought."],
              ["Liquidation proceeds", "Cash from selling off assets if the company winds down (after creditors)."],
              ["Capital gains", "Price appreciation you realize by selling your shares for more than you paid."],
            ].map(([term, desc]) => (
              <li key={term} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  <strong className="text-white">{term}.</strong> {desc}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — "No dividend" does not mean "zero value"                 */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.5"
          eyebrow="Section 5"
          title={`"No dividend" does not mean "zero value"`}
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A common confusion: <em>&ldquo;If the company pays no dividend, the
            stock must be worth nothing.&rdquo;</em> This is wrong.{" "}
            <strong className="text-white">No dividend today</strong> is not the
            same as{" "}
            <strong className="text-white">no economic benefit ever</strong>.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            A company that pays nothing right now may still deliver value
            through future dividends, future buybacks, an acquisition, or
            eventual liquidation. Equity has value as long as shareholders
            expect to receive{" "}
            <strong className="text-white">some</strong> economic benefit at{" "}
            <strong className="text-white">some</strong> point.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-green">
              Growth company retaining cash
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              Pays no dividend today, but reinvests cash to grow the business.
              Investors expect larger distributions — or a profitable sale —
              later. The stock can be{" "}
              <strong className="text-accent-green">very valuable</strong>.
            </p>
          </div>
          <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-red">
              Hypothetical: can never distribute
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              If a security could{" "}
              <strong className="text-white">never</strong> pay a dividend, fund
              a buyback, be sold, or be liquidated,{" "}
              <strong className="text-accent-red">then</strong> it would be
              worthless to an investor. Real equities are rarely in this box.
            </p>
          </div>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Retaining earnings vs distributing                      */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.6"
          eyebrow="Section 6"
          title="Retaining earnings vs. distributing"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Imagine a company with{" "}
            <strong className="text-white">$100</strong> of cash it could either
            distribute to shareholders or retain and reinvest in the business.
          </p>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Distribute $100:</strong>{" "}
                shareholders get the cash today and can reinvest it themselves.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Retain and reinvest $100:</strong>{" "}
                the company keeps the cash and tries to earn a return on it.
              </span>
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-amber">
              The real question
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              Retaining is{" "}
              <strong className="text-white">not automatically good</strong>.
              The question is: <strong className="text-white">what return does
              the company earn on the retained cash, compared to what
              shareholders require?</strong> Growth for its own sake can destroy
              value.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Value-creating and value-destroying growth              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.7"
          eyebrow="Section 7"
          title="Value-creating and value-destroying growth"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Assume shareholders require a{" "}
            <strong className="text-white">10%</strong> return. The company
            retains <strong className="text-white">$100</strong>. Whether that
            decision creates or destroys value depends entirely on the return the
            company earns on that $100.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Poor reinvestment — value destroyed"
          tone="red"
          formula={String.raw`NPV = \frac{FV}{1 + r} - \text{invested}`}
          meaning="If the company earns less than the required return, the project is worth less than it cost, even though reported earnings rise."
          substitution={String.raw`FV = \$100 \times (1 + 0.04) = \$104, \quad PV = \frac{\$104}{1.10} = \$94.55`}
          result="NPV = $94.55 − $100 = −$5.45"
          interpretation="There is no accounting loss and earnings grew by $4 — but the company used $100 of shareholder cash to build an asset worth only $94.55. Value was destroyed."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Strong reinvestment — value created"
          tone="green"
          formula={String.raw`NPV = \frac{FV}{1 + r} - \text{invested}`}
          meaning="If the company earns more than the required return, the project is worth more than it cost."
          substitution={String.raw`FV = \$100 \times (1 + 0.15) = \$115, \quad PV = \frac{\$115}{1.10} = \$104.55`}
          result="NPV = $104.55 − $100 = +$4.55"
          interpretation="Here the company turned $100 of shareholder cash into an asset worth $104.55. That $4.55 of net value accrues to shareholders."
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Rates vs. dollars — keep them straight
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 pb-2 pr-6 font-sans font-normal">Concept</th>
                  <th className="border-b border-white/15 pb-2 pr-6 font-sans font-normal">Type</th>
                  <th className="border-b border-white/15 pb-2 font-sans font-normal">Value (poor case)</th>
                </tr>
              </thead>
              <tbody className="font-sans text-[15px] text-slate-200">
                <tr>
                  <td className="py-2 pr-6">Actual dollar return produced</td>
                  <td className="py-2 pr-6 text-slate-300">dollars</td>
                  <td className="py-2 text-accent-red">$4</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6">Return rate the company earns</td>
                  <td className="py-2 pr-6 text-slate-300">percent</td>
                  <td className="py-2 text-accent-red">4%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6">Required return (cost of equity)</td>
                  <td className="py-2 pr-6 text-slate-300">percent</td>
                  <td className="py-2 text-accent-cyan">10%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6">Required dollar return</td>
                  <td className="py-2 pr-6 text-slate-300">dollars</td>
                  <td className="py-2 text-accent-cyan">$10</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            The company produced <strong className="text-white">$4</strong> when
            investors required <strong className="text-white">$10</strong>. The
            $6 shortfall is why the decision destroyed value.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <ReinvestmentDecisionLab />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Required return = cost of equity                        */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.8"
          eyebrow="Section 8"
          title="Required return = cost of equity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The same interest rate has two names depending on whose side you sit
            on. This is already familiar from bonds.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 pb-2 pr-6 font-sans font-normal">Perspective</th>
                  <th className="border-b border-white/15 pb-2 font-sans font-normal">Name for the same rate</th>
                </tr>
              </thead>
              <tbody className="font-sans text-[15px] text-slate-200">
                <tr>
                  <td className="py-2 pr-6">Shareholder (investor)</td>
                  <td className="py-2 text-accent-cyan">Required return</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6">Company (issuer)</td>
                  <td className="py-2 text-accent-green">Cost of equity</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 rounded-lg border border-accent-purple/30 bg-accent-purple/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Debt analogy
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              When a lender earns a{" "}
              <strong className="text-white">6%</strong> return, the borrower
              faces a <strong className="text-white">6%</strong> cost of debt —
              the same cash flow, seen from opposite sides. Equity works the same
              way, with one key difference: the cost of equity is{" "}
              <strong className="text-white">not guaranteed</strong>. The company
              does not contractually promise shareholders a specific return; the
              cost of equity is the return investors{" "}
              <em>require</em> to hold the stock.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* INLINE CONCEPT CHECK                                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.9"
          eyebrow="Concept check"
          title="Retain $40 at 8%, require 12%"
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
          index="1.10"
          eyebrow="Common questions"
          title="Questions on ownership and residual claims"
        />
      </Reveal>
      <Reveal className="mt-6">
        <div className="space-y-3">
          <ExpandableQA question="If I own shares, do I literally own part of the company's factories and equipment?">
            <p>
              No — not in the sense of a direct claim on any specific asset.
              Your share is a <strong className="text-white">legal and
              financial</strong> ownership claim on the company as a whole. You
              cannot walk into a warehouse and take a laptop. What you own is a
              proportional right to the company&apos;s residual value — whatever
              is left after creditors are paid — and a proportional say in major
              decisions through voting.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Why does the equity percentage move so much more than the asset percentage?">
            <p>
              Because equity is a residual, it sits on top of a fixed debt stack.
              When assets move, debt does not change (until default). So the
              entire asset change is absorbed by the thin equity layer. With{" "}
              <strong className="text-white">$10M</strong> assets,{" "}
              <strong className="text-white">$6M</strong> debt, and{" "}
              <strong className="text-white">$4M</strong> equity, a{" "}
              <strong className="text-white">$3M</strong> drop in assets is a
              30% asset decline but a 75% equity decline ($4M → $1M). This is
              financial leverage at work.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Is 'growth' always good for shareholders?">
            <p>
              No. Growth in earnings, assets, or revenue is only good for
              shareholders when the company earns a return on the reinvested
              cash that exceeds the cost of equity. A company that grows by
              pouring shareholder cash into projects earning 4% when investors
              require 10% is <strong className="text-white">destroying</strong>{" "}
              value, even though its earnings line rises every year.
            </p>
          </ExpandableQA>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="02"
          eyebrow="Mastery"
          title="Summary and mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 4.1 mastery check"
          passCount={3}
          onComplete={() => report()}
          continueLabel="Continue to Why Does a Stock Have Value Today?"
          continueHref="/lessons/equity-why-does-a-stock-have-value-today"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Why Does a Stock Have Value Today?"
          continueHref="/lessons/equity-why-does-a-stock-have-value-today"
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
  const [checked, setChecked] = useState(false);

  const produced = 40 * 0.08; // $3.20
  const required = 40 * 0.12; // $4.80
  const fv = 40 * 1.08; // $43.20
  const pv = fv / 1.12; // $38.57
  const npv = pv - 40; // −$1.43

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Concept check
          </span>
        </div>
      </div>

      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        A company retains $40, earns 8%, while shareholders require 12%. Does
        this create value?
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Work through the numbers, then check your conclusion.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Dollar return produced
          </div>
          <div className="mt-1 font-sans text-[18px] text-accent-red">$3.20</div>
          <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
            $40 × 8%
          </div>
        </div>
        <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Required dollar return
          </div>
          <div className="mt-1 font-sans text-[18px] text-accent-cyan">$4.80</div>
          <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
            $40 × 12%
          </div>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/[0.03] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            PV of FV
          </div>
          <div className="mt-1 font-sans text-[18px] text-slate-100">$38.57</div>
          <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
            $43.20 ÷ 1.12
          </div>
        </div>
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            NPV
          </div>
          <div className="mt-1 font-sans text-[18px] text-accent-red">−$1.43</div>
          <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
            $38.57 − $40
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Reveal answer
        </button>
      </div>

      {checked && (
        <Feedback status="incorrect">
          <strong className="text-white">No — it destroys value.</strong> The
          company produced <span className="font-sans">$3.20</span> of return on
          the retained $40, but shareholders required{" "}
          <span className="font-sans">$4.80</span>. The $1.43 negative NPV is
          the value destroyed. Even though earnings grew (by $3.20), the project
          earned less than the cost of equity, so shareholder value fell.
        </Feedback>
      )}
    </InteractiveFrame>
  );
}
