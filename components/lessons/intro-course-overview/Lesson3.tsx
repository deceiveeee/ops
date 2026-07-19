"use client";

import { useState } from "react";
import ModuleIntroLayout from "./ModuleIntroLayout";
import ChapterHero from "./ChapterHero";
import ObjectiveTracker from "./ObjectiveTracker";
import CorporatePersonalCashFlowToggle from "./CorporatePersonalCashFlowToggle";
import PersonalCashFlowBuilder from "./PersonalCashFlowBuilder";
import MiniCheck from "./MiniCheck";
import LessonTakeaway from "./LessonTakeaway";
import { Reveal, SectionHeading, Panel } from "./shared";
import { MODULE_OBJECTIVES } from "./lessonContent";

export default function Lesson3() {
  const [covered, setCovered] = useState<boolean[]>(
    MODULE_OBJECTIVES.map(() => false),
  );
  const mark = (i: number) =>
    setCovered((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  return (
    <ModuleIntroLayout>
      <ChapterHero
        index="03"
        eyebrow="Lesson 3 · Module 1"
        title="Corporate and Personal Financial Systems"
        subtitle="Corporations and households use similar financial logic, but with different objectives."
        artifacts={[
          { label: "Corporate", tone: "amber" },
          { label: "Personal", tone: "cyan" },
          { label: "Objectives", tone: "red" },
        ]}
      />

      <Reveal className="mt-8">
        <ObjectiveTracker objectives={MODULE_OBJECTIVES} covered={covered} />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="01"
          eyebrow="Corporate finance"
          title="Corporate Financial Decisions"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Corporate financial decisions involve five cash-flow steps. Toggle
            between corporate and personal modes to see how the same logic
            applies with different objectives.
          </p>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <CorporatePersonalCashFlowToggle onComplete={() => mark(0)} />
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Management decision categories
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Real investment", "decisions about assets and operations."],
              ["Financing", "decisions about how to raise money."],
              ["Payout", "decisions about returning money to investors."],
              [
                "Risk management",
                "decisions about managing uncertainty and financial exposure.",
              ],
            ].map(([t, b]) => (
              <div
                key={t}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="ops-body-strong text-[16px] text-slate-50">
                  {t}
                </div>
                <div className="ops-body mt-1 text-[14px] text-slate-300">
                  {b}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>

      <Reveal
        delay={0.05}
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <MiniCheck
          question="Tesla builds a new factory. Which type of decision is this?"
          choices={[
            { id: "real", label: "Real investment" },
            { id: "fin", label: "Financing" },
            { id: "pay", label: "Payout" },
          ]}
          correctId="real"
          feedback="Building a factory is a real investment decision about assets and operations."
        />
        <MiniCheck
          question="A company issues bonds to raise cash. Which type of decision is this?"
          choices={[
            { id: "real", label: "Real investment" },
            { id: "fin", label: "Financing" },
            { id: "pay", label: "Payout" },
          ]}
          correctId="fin"
          feedback="Issuing bonds is a financing decision about how to raise money."
        />
        <MiniCheck
          question="A company pays dividends. Which type of decision is this?"
          choices={[
            { id: "real", label: "Real investment" },
            { id: "fin", label: "Financing" },
            { id: "pay", label: "Payout" },
          ]}
          correctId="pay"
          feedback="Paying dividends is a payout decision about returning money to investors."
        />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="02"
          eyebrow="Personal finance"
          title="Personal Financial Decisions"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The same finance framework applies to households. Switch the toggle
            above to <em>Personal</em> to see the five household cash-flow
            steps. Then build your own simple personal financial map below.
          </p>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <PersonalCashFlowBuilder onComplete={() => mark(0)} />
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Reflection
          </div>
          <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
            How is your personal financial system similar to a
            corporation&apos;s financial system?
          </p>
          <textarea
            aria-label="Optional reflection response"
            placeholder="Optional — type your thoughts. Responses are local only and not saved."
            className="ops-body mt-3 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
            rows={3}
          />
        </Panel>
      </Reveal>

      <Reveal className="mt-12">
        <div className="glass-panel p-6">
          <div className="ops-caption text-[11px] text-slate-400">Next</div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            Both households and corporations make decisions across time. The
            next lesson explains why time and risk make finance difficult.
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <LessonTakeaway
          takeaway="Corporations and households run on the same cash-flow logic — raise, invest, generate, reinvest, return — with different objectives."
          points={[
            "Corporate objective: maximize shareholder value.",
            "Personal objective: maximize lifetime happiness or expected utility.",
            "Both involve financing, investment, and risk decisions across time.",
          ]}
          nextSlug="time-risk-and-financial-principles"
          nextLabel="Continue to Time, Risk, and the Logic of Finance"
        />
      </Reveal>
    </ModuleIntroLayout>
  );
}
