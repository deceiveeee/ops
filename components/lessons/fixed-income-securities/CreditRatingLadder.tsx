"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  Feedback,
} from "./shared";

/**
 * Section 3 — Credit rating ladder.
 * Full rating table (Moody's / S&P). Interactive "rating elevator": moving
 * from Aaa down to D raises default-risk pressure and promised-yield pressure.
 * The Investment-Grade / Non-Investment-Grade boundary sits at Baa/BBB.
 */
type Rating = {
  moodys: string;
  sp: string;
  grade: "IG" | "HY";
  risk: number; // 0..100 relative default-risk meter
  yield: number; // relative promised-yield pressure 0..100
};

const RATINGS: Rating[] = [
  { moodys: "Aaa", sp: "AAA", grade: "IG", risk: 4, yield: 8 },
  { moodys: "Aa", sp: "AA", grade: "IG", risk: 8, yield: 12 },
  { moodys: "A", sp: "A", grade: "IG", risk: 14, yield: 18 },
  { moodys: "Baa", sp: "BBB", grade: "IG", risk: 24, yield: 28 },
  { moodys: "Ba", sp: "BB", grade: "HY", risk: 40, yield: 45 },
  { moodys: "B", sp: "B", grade: "HY", risk: 58, yield: 62 },
  { moodys: "Caa", sp: "CCC", grade: "HY", risk: 75, yield: 78 },
  { moodys: "Ca", sp: "CC", grade: "HY", risk: 86, yield: 88 },
  { moodys: "C", sp: "C", grade: "HY", risk: 93, yield: 94 },
  { moodys: "C", sp: "D", grade: "HY", risk: 100, yield: 100 },
];

type QuizId = "q1" | "q2";
type QuizAnswer = "a" | "b";

export default function CreditRatingLadder() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const current = RATINGS[idx];
  const isDefault = idx === RATINGS.length - 1;
  const [quiz, setQuiz] = useState<Record<QuizId, QuizAnswer | undefined>>({
    q1: undefined,
    q2: undefined,
  });

  const go = (delta: number) => {
    setIdx((i) => Math.min(RATINGS.length - 1, Math.max(0, i + delta)));
  };

  return (
    <div className="space-y-6">
      <DefinitionCard term="The rating ladder">
        Rating agencies (Moody&apos;s, S&P) sort issuers from the safest
        (&ldquo;Aaa / AAA&rdquo;) down to default. The split between{" "}
        <span className="text-slate-50">Investment Grade</span> and{" "}
        <span className="text-slate-50">Non-Investment Grade</span> falls at the
        Baa / BBB boundary. As you descend the ladder, default-risk pressure
        rises and investors demand more promised yield.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Rating elevator
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Use arrows or buttons · Aaa → D
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Ride the ladder down
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Move the elevator from the safest rating toward default. Watch the
          default-risk meter climb and the promised-yield pressure build.
        </p>

        {/* Elevator controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={idx === 0}
            aria-label="Move up the rating ladder (safer)"
            className="rounded-full border border-accent-green/50 bg-accent-green/10 px-5 py-2.5 text-[13px] font-medium text-accent-green transition-colors hover:bg-accent-green/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ↑ Safer
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={idx === RATINGS.length - 1}
            aria-label="Move down the rating ladder (riskier)"
            className="rounded-full border border-accent-red/50 bg-accent-red/10 px-5 py-2.5 text-[13px] font-medium text-accent-red transition-colors hover:bg-accent-red/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ↓ Riskier
          </button>
        </div>

        {/* Current rating + meters */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div
            className={cn(
              "rounded-2xl border p-6 text-center transition-colors",
              isDefault
                ? "border-accent-red/50 bg-accent-red/[0.08]"
                : current.grade === "IG"
                  ? "border-accent-green/40 bg-accent-green/[0.06]"
                  : "border-accent-amber/40 bg-accent-amber/[0.06]",
            )}
          >
            <div className="ops-caption text-[11px] text-slate-400">
              Selected rating
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mt-2 font-mono text-[40px] text-white">
                  {current.moodys} / {current.sp}
                </div>
                <div
                  className={cn(
                    "mt-2 inline-flex items-center rounded-full border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.14em]",
                    isDefault
                      ? "border-accent-red/50 text-accent-red"
                      : current.grade === "IG"
                        ? "border-accent-green/50 text-accent-green"
                        : "border-accent-amber/50 text-accent-amber",
                  )}
                >
                  {isDefault ? "Default" : current.grade === "IG" ? "Investment Grade" : "Non-Investment Grade"}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-6">
            <Meter
              label="Default-risk pressure"
              value={current.risk}
              tone="red"
              reduce={reduce}
            />
            <div className="h-4" />
            <Meter
              label="Promised-yield pressure"
              value={current.yield}
              tone="amber"
              reduce={reduce}
            />
          </div>
        </div>

        {/* Full table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="ops-caption px-3 py-2.5 text-[11px] text-slate-400">
                  Moody&apos;s
                </th>
                <th className="ops-caption px-3 py-2.5 text-[11px] text-slate-400">
                  S&amp;P
                </th>
                <th className="ops-caption px-3 py-2.5 text-[11px] text-slate-400">
                  Grade
                </th>
                <th className="ops-caption px-3 py-2.5 text-[11px] text-slate-400">
                  Default risk
                </th>
                <th className="ops-caption px-3 py-2.5 text-[11px] text-slate-400">
                  Promised yield
                </th>
              </tr>
            </thead>
            <tbody>
              {RATINGS.map((r, i) => (
                <tr
                  key={`${r.moodys}-${r.sp}-${i}`}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "cursor-pointer border-b border-white/5 transition-colors",
                    i === idx ? "bg-accent-cyan/[0.08]" : "hover:bg-white/[0.03]",
                  )}
                >
                  <td className="px-3 py-2.5 font-mono text-[13px] text-slate-200">
                    {r.moodys}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[13px] text-slate-200">
                    {r.sp}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em]",
                        r.grade === "IG"
                          ? "border-accent-green/40 text-accent-green"
                          : "border-accent-amber/40 text-accent-amber",
                      )}
                    >
                      {r.grade === "IG" ? "Investment" : "Non-Investment"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[13px] text-slate-300">
                    {r.risk}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[13px] text-slate-300">
                    {r.yield}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ops-caption mt-3 text-[11px] text-slate-500">
            Relative teaching meters, not historical default rates. Click any row
            to select it.
          </div>
        </div>

        {/* Quick prompts */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <QuizCard
            id="q1"
            question="Which is riskier: A or Baa?"
            optionA="A"
            optionB="Baa"
            answer="b"
            picked={quiz.q1}
            onPick={(a) => setQuiz((q) => ({ ...q, q1: a }))}
            explain="Baa sits below A on the ladder, so it carries more default-risk pressure — though both are still investment grade."
          />
          <QuizCard
            id="q2"
            question="Which usually offers higher promised yield: AAA or BB?"
            optionA="AAA"
            optionB="BB"
            answer="b"
            picked={quiz.q2}
            onPick={(a) => setQuiz((q) => ({ ...q, q2: a }))}
            explain="BB is non-investment grade, so investors demand more promised yield to compensate for the higher default risk."
          />
        </div>
      </InteractiveFrame>
    </div>
  );
}

function Meter({
  label,
  value,
  tone,
  reduce,
}: {
  label: string;
  value: number;
  tone: "red" | "amber";
  reduce: boolean | null;
}) {
  const fill =
    tone === "red" ? "bg-accent-red" : "bg-accent-amber";
  const text =
    tone === "red" ? "text-accent-red" : "text-accent-amber";
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className={cn("font-mono text-[13px]", text)}>{value}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
        <motion.div
          initial={false}
          animate={{ width: `${value}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
          className={cn("h-full rounded-full", fill)}
        />
      </div>
    </div>
  );
}

function QuizCard({
  question,
  optionA,
  optionB,
  answer,
  picked,
  onPick,
  explain,
}: {
  id: QuizId;
  question: string;
  optionA: string;
  optionB: string;
  answer: QuizAnswer;
  picked: QuizAnswer | undefined;
  onPick: (a: QuizAnswer) => void;
  explain: string;
}) {
  const reduce = useReducedMotion();
  const correct = picked === answer;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="ops-body-strong text-[15px] leading-7 text-slate-50">
        {question}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          aria-pressed={picked === "a"}
          onClick={() => onPick("a")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            picked === "a"
              ? correct
                ? "border-accent-green/50 bg-accent-green/15 text-accent-green"
                : "border-accent-red/50 bg-accent-red/15 text-accent-red"
              : "border-white/15 text-slate-300 hover:bg-white/5",
          )}
        >
          {optionA}
        </button>
        <button
          type="button"
          aria-pressed={picked === "b"}
          onClick={() => onPick("b")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            picked === "b"
              ? correct
                ? "border-accent-green/50 bg-accent-green/15 text-accent-green"
                : "border-accent-red/50 bg-accent-red/15 text-accent-red"
              : "border-white/15 text-slate-300 hover:bg-white/5",
          )}
        >
          {optionB}
        </button>
      </div>
      <AnimatePresence>
        {picked && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Feedback status={correct ? "correct" : "incorrect"}>{explain}</Feedback>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
