"use client";

import { useState } from "react";
import ModuleIntroLayout from "./ModuleIntroLayout";
import ChapterHero from "./ChapterHero";
import ObjectiveTracker from "./ObjectiveTracker";
import FinanceLensSelector from "./FinanceLensSelector";
import FinancialSystemFlow from "./FinancialSystemFlow";
import ValuationManagementDecisionEngine from "./ValuationManagementDecisionEngine";
import MiniCheck from "./MiniCheck";
import LessonTakeaway from "./LessonTakeaway";
import { Reveal, SectionHeading, Panel } from "./shared";
import { MODULE_OBJECTIVES } from "./lessonContent";

export default function Lesson1() {
  // objectives 0,1,2 are addressed in this lesson
  const [covered, setCovered] = useState<boolean[]>(
    MODULE_OBJECTIVES.map(() => false),
  );
  const mark = (i: number) =>
    setCovered((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  return (
    <ModuleIntroLayout>
      <ChapterHero
        index="01"
        eyebrow="Lesson 1 · Module 1"
        title="What Is Finance? Value, Time, and Risk"
        subtitle="Finance is not only about stocks, banks, or Wall Street. Finance is the systematic study of how people, companies, and markets value and manage money over time under uncertainty."
        artifacts={[
          { label: "Value", tone: "cyan" },
          { label: "Time", tone: "amber" },
          { label: "Risk", tone: "red" },
        ]}
      />

      <Reveal>
        <p className="ops-body text-[16px] text-slate-300">
          This lesson introduces the core framework used throughout finance:
          valuation, management, accounting, time, risk, and market prices.
        </p>
      </Reveal>

      <Reveal className="mt-8">
        <ObjectiveTracker objectives={MODULE_OBJECTIVES} covered={covered} />
      </Reveal>

      {/* Motivation */}
      <Reveal className="mt-12">
        <SectionHeading
          index="02"
          eyebrow="Motivation"
          title="What Is Finance?"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <div className="flex flex-wrap items-center gap-3 font-sans text-sm">
            <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-slate-100">
              Mathematics
            </span>
            <span className="text-accent-cyan">+</span>
            <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-slate-100">
              Money
            </span>
            <span className="text-accent-cyan">=</span>
            <span className="rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-accent-cyan">
              Finance
            </span>
          </div>
          <p className="ops-definition mt-4 text-[17px]">
            <strong className="text-white">Finance</strong> is the systematic
            and disciplined study of financial transactions involving money.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            Finance uses quantitative thinking to answer practical questions
            involving money: How much is something worth? Should I buy it or
            sell it? Should I save, borrow, invest, or spend? How much risk am I
            taking? How should I compare money today with money in the future?
          </p>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <SectionHeading
          index="03"
          eyebrow="Finance lenses"
          title="Three ways into the same subject"
        />
        <p className="ops-muted mt-3 text-[14px]">
          No portraits — these are finance lenses, not people.
        </p>
        <div className="mt-5">
          <FinanceLensSelector onSelected={() => mark(0)} />
        </div>
      </Reveal>

      {/* Main actors */}
      <Reveal className="mt-12">
        <SectionHeading
          index="04"
          eyebrow="The financial system"
          title="The Main Actors in the Financial System"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The financial system can be understood as a flow model involving
            four main participants:{" "}
            <strong className="text-white">households</strong>,{" "}
            <strong className="text-white">nonfinancial corporations</strong>,{" "}
            <strong className="text-white">financial intermediaries</strong>,
            and <strong className="text-white">capital markets</strong>.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            These participants interact with labor markets and product markets,
            but the focus of finance is on how money, claims, assets, and risks
            move through the system.
          </p>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <FinancialSystemFlow onAllVisited={() => mark(1)} />
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <MiniCheck
          question="A company wants to raise money by issuing stock. Which part of the diagram is most directly involved?"
          choices={[
            { id: "labor", label: "Labor markets" },
            { id: "product", label: "Product markets" },
            { id: "capital", label: "Capital markets" },
            { id: "households", label: "Households only" },
          ]}
          correctId="capital"
          feedback="Correct. Issuing stock takes place through capital markets, where companies and investors meet through financial securities."
        />
      </Reveal>

      {/* Valuation vs Management */}
      <Reveal className="mt-12">
        <SectionHeading
          index="05"
          eyebrow="Fundamental challenges"
          title="Valuation vs. Management"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-definition text-[17px]">
            All business activities reduce to two functions:{" "}
            <strong className="text-white">valuation of assets</strong> and{" "}
            <strong className="text-white">management of assets</strong>.
          </p>
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/5 px-3 py-2 font-sans text-sm">
            <span className="text-slate-100">Objectives</span>
            <span className="text-accent-cyan">+</span>
            <span className="text-slate-100">Valuations</span>
            <span className="text-accent-cyan">=&gt;</span>
            <span className="text-accent-cyan">Decisions</span>
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            Valuation asks what an asset is worth. Management asks what should
            be done once value is estimated. Once you know your objective and
            you know the value of each option, decision-making becomes easier.
          </p>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Valuation
            </div>
            <div className="ops-interactive-title mt-1.5 text-lg text-white">
              What is it worth?
            </div>
          </div>
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/5 p-5">
            <div className="ops-caption text-[11px] text-accent-amber">
              Management
            </div>
            <div className="ops-interactive-title mt-1.5 text-lg text-white">
              What should I do?
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <ValuationManagementDecisionEngine onComplete={() => mark(2)} />
      </Reveal>

      <Reveal className="mt-12">
        <div className="glass-panel p-6">
          <div className="ops-caption text-[11px] text-slate-400">Next</div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            Next, you will see how markets discover prices even when information
            is incomplete, and why accounting becomes the language used to
            interpret those prices.
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <LessonTakeaway
          takeaway="Finance studies value, time, and risk — and splits every business activity into valuation and management."
          points={[
            "Finance applies to both personal and corporate decisions.",
            "The financial system connects households, corporations, intermediaries, and capital markets.",
            "Valuation asks what something is worth; management asks what to do about it.",
          ]}
          nextSlug="price-discovery-and-accounting-language"
          nextLabel="Continue to Price Discovery and the Language of Finance"
        />
      </Reveal>
    </ModuleIntroLayout>
  );
}
