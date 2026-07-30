"use client";

import { useState } from "react";
import ModuleIntroLayout from "./ModuleIntroLayout";
import ChapterHero from "./ChapterHero";
import ObjectiveTracker from "./ObjectiveTracker";
import AuctionBoxSimulation from "./AuctionBoxSimulation";
import AccountingConsole from "./AccountingConsole";
import StockFlowVisualizer from "./StockFlowVisualizer";
import LessonTakeaway from "./LessonTakeaway";
import { Reveal, SectionHeading, Panel } from "./shared";
import { MODULE_OBJECTIVES } from "./lessonContent";

export default function Lesson2() {
  const [covered, setCovered] = useState<boolean[]>(
    MODULE_OBJECTIVES.map(() => false),
  );
  const mark = (i: number) =>
    setCovered((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  return (
    <ModuleIntroLayout>
      <ChapterHero
        index="02"
        eyebrow="Lesson 2 · Module 1"
        title="Price Discovery and the Language of Finance"
        subtitle="How markets discover prices under uncertainty, and why accounting becomes the language used to interpret those prices."
        artifacts={[
          { label: "Price", tone: "cyan" },
          { label: "Accounting", tone: "amber" },
          { label: "Stock vs Flow", tone: "red" },
        ]}
      />

      <Reveal className="mt-8">
        <ObjectiveTracker objectives={MODULE_OBJECTIVES} covered={covered} />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="01"
          eyebrow="Price discovery"
          title="Auction Box Simulation"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-definition text-[17px]">
            <strong className="text-white">Price discovery</strong> is the
            process by which financial markets determine the price or value of
            an asset through the interaction of buyers and sellers.
          </p>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <AuctionBoxSimulation onComplete={() => mark(3)} />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="02"
          eyebrow="Measurement"
          title="Accounting as the Language of Finance"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-definition text-[17px]">
            <strong className="text-white">
              Accounting is the language of finance.
            </strong>{" "}
            It provides the vocabulary, structure, and measurement system used
            to describe financial status and financial performance.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/15">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] font-sans text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-2.5">Language</th>
                  <th className="px-4 py-2.5">Finance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Words", "Accounts"],
                  ["Grammar", "Accounting rules"],
                  ["Sentences", "Financial statements"],
                  ["Interpretation", "Financial analysis"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="px-4 py-2.5 text-slate-300">{a}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-50">
                      {b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <AccountingConsole onComplete={() => mark(3)} />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="03"
          eyebrow="Measurement"
          title="Stock vs. Flow Variables"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-definition text-[17px]">
            A <strong className="text-white">stock variable</strong> measures a
            level at a point in time. A{" "}
            <strong className="text-white">flow variable</strong> measures a
            rate of change over a period of time.
          </p>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <StockFlowVisualizer onComplete={() => mark(4)} />
      </Reveal>

      <Reveal className="mt-12">
        <div className="glass-panel p-6">
          <div className="ops-caption text-[11px] text-slate-400">Next</div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            Now that you can separate price, value, accounting, and measurement,
            the next step is understanding how corporations and households move
            cash through their own financial systems.
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <LessonTakeaway
          takeaway="Markets discover prices under uncertainty; accounting is the language that measures what those prices mean."
          points={[
            "Price discovery works even with incomplete information.",
            "Accounting provides the vocabulary and structure of finance.",
            "Stock variables are measured at a point in time; flow variables over a period.",
          ]}
          nextSlug="corporate-and-personal-financial-systems"
          nextLabel="Continue to Corporate and Personal Financial Systems"
        />
      </Reveal>
    </ModuleIntroLayout>
  );
}
