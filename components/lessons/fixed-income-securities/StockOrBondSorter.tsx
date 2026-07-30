"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  Feedback,
} from "./shared";

type Answer = "stock" | "fi";

type Item = {
  id: string;
  text: string;
  answer: Answer;
  explain: string;
};

const ITEMS: Item[] = [
  {
    id: "i1",
    text: "Pays $50 every year for 3 years, then $1,000 at maturity.",
    answer: "fi",
    explain: "Fixed amounts on fixed dates — that is a fixed-income promise.",
  },
  {
    id: "i2",
    text: "May pay dividends if the board approves.",
    answer: "stock",
    explain: "Dividends are discretionary and uncertain — no promised schedule.",
  },
  {
    id: "i3",
    text: "Treasury bill pays $1,000 at maturity.",
    answer: "fi",
    explain: "A single promised payment at a fixed date.",
  },
  {
    id: "i4",
    text: "Common stock of a growing company.",
    answer: "stock",
    explain: "Resale price and dividends are both uncertain.",
  },
];

/**
 * Section 3 — Stock or Bond sorter.
 * Learner taps Stock or Fixed Income for each scenario with immediate feedback.
 */
export default function StockOrBondSorter() {
  const [picked, setPicked] = useState<Record<string, Answer | undefined>>({});

  const choose = (id: string, a: Answer) =>
    setPicked((prev) => ({ ...prev, [id]: a }));

  const allDone = ITEMS.every((i) => picked[i.id]);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Stock or fixed income?
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Tap a label to classify each
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {ITEMS.map((item) => {
          const choice = picked[item.id];
          const correct = choice === item.answer;
          return (
            <SortCard
              key={item.id}
              item={item}
              choice={choice}
              correct={correct}
              onChoose={(a) => choose(item.id, a)}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Feedback status="correct">
              Stocks carry uncertain future cash flows. Fixed-income securities
              specify promised amounts and dates — even if &ldquo;promised&rdquo;
              is not the same as &ldquo;guaranteed.&rdquo;
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}

function SortCard({
  item,
  choice,
  correct,
  onChoose,
}: {
  item: Item;
  choice: Answer | undefined;
  correct: boolean;
  onChoose: (a: Answer) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/[0.03] p-5 transition-colors",
        choice
          ? correct
            ? "border-accent-green/40"
            : "border-accent-red/40"
          : "border-white/10",
      )}
    >
      <p className="ops-body text-[15px] leading-7 text-slate-100">{item.text}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ChoiceButton
          active={choice === "stock"}
          tone="purple"
          label="Stock"
          pressed={choice === "stock"}
          onClick={() => onChoose("stock")}
        />
        <ChoiceButton
          active={choice === "fi"}
          tone="cyan"
          label="Fixed income"
          pressed={choice === "fi"}
          onClick={() => onChoose("fi")}
        />
      </div>

      <AnimatePresence>
        {choice && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "mt-4 rounded-lg border px-3 py-2.5 text-[13px] leading-6",
                correct
                  ? "border-accent-green/30 bg-accent-green/10 text-slate-100"
                  : "border-accent-red/30 bg-accent-red/10 text-slate-100",
              )}
            >
              <span className={cn("font-sans text-[11px] uppercase tracking-[0.14em]", correct ? "text-accent-green" : "text-accent-red")}>
                {correct ? "Correct" : "Try again"}
              </span>
              <p className="mt-1">{item.explain}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoiceButton({
  active,
  tone,
  label,
  pressed,
  onClick,
}: {
  active: boolean;
  tone: "purple" | "cyan";
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  const c =
    tone === "purple"
      ? "border-accent-purple/50 text-accent-purple data-[on=true]:bg-accent-purple/15"
      : "border-accent-cyan/50 text-accent-cyan data-[on=true]:bg-accent-cyan/15";
  return (
    <button
      type="button"
      data-on={active}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        c,
      )}
    >
      {label}
    </button>
  );
}
