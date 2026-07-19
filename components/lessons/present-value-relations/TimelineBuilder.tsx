"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";

type CardId = "cost" | "c5" | "c7";
type SlotId = "year0" | "year1" | "year2";

type CFCard = {
  id: CardId;
  label: string;
  ariaLabel: string;
  tone: "red" | "green";
};

const CF_CARDS: CFCard[] = [
  {
    id: "cost",
    label: "−$10.0M (cost)",
    ariaLabel: "Negative 10 million dollar cost",
    tone: "red",
  },
  {
    id: "c5",
    label: "+$5.0M",
    ariaLabel: "Positive 5 million dollar inflow",
    tone: "green",
  },
  {
    id: "c7",
    label: "+$7.0M",
    ariaLabel: "Positive 7 million dollar inflow",
    tone: "green",
  },
];

const SLOTS: { id: SlotId; label: string; sublabel: string }[] = [
  { id: "year0", label: "Year 0", sublabel: "Today" },
  { id: "year1", label: "Year 1", sublabel: "Year 1" },
  { id: "year2", label: "Year 2", sublabel: "Final date" },
];

// Correct placement: cost -> year0, c5 -> year1, c7 -> year2.
const CORRECT: Record<SlotId, CardId> = {
  year0: "cost",
  year1: "c5",
  year2: "c7",
};

type Status = "idle" | "correct" | "wrong-year" | "wrong-sign";

function cardTone(tone: "red" | "green") {
  return tone === "red"
    ? "border-accent-red/40 text-accent-red"
    : "border-accent-green/40 text-accent-green";
}

export default function TimelineBuilder() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<CardId | null>(null);
  const [placements, setPlacements] = useState<Partial<Record<SlotId, CardId>>>(
    {},
  );
  const [status, setStatus] = useState<Status>("idle");

  const placedCards = new Set(Object.values(placements));
  const allPlaced = SLOTS.every((s) => placements[s.id] !== undefined);

  const resetStatus = () => setStatus("idle");

  const handleCardClick = (id: CardId) => {
    resetStatus();
    const occupied = (Object.keys(placements) as SlotId[]).find(
      (sl) => placements[sl] === id,
    );
    if (occupied) {
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[occupied];
        return next;
      });
      setSelected(null);
      return;
    }
    setSelected((cur) => (cur === id ? null : id));
  };

  const handleSlotClick = (slotId: SlotId) => {
    resetStatus();
    if (selected) {
      setPlacements((prev) => {
        const next: Partial<Record<SlotId, CardId>> = { ...prev };
        (Object.keys(next) as SlotId[]).forEach((sl) => {
          if (next[sl] === selected) delete next[sl];
        });
        next[slotId] = selected;
        return next;
      });
      setSelected(null);
      return;
    }
    if (placements[slotId]) {
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
    }
  };

  const handleSubmit = () => {
    if (!allPlaced) return;
    const correct = SLOTS.every((s) => placements[s.id] === CORRECT[s.id]);
    if (correct) {
      setStatus("correct");
      return;
    }
    // Sign rule: year 0 must hold the cost (negative); years 1 & 2 the inflows (positive).
    const signCorrect =
      placements.year0 === "cost" &&
      (placements.year1 === "c5" || placements.year1 === "c7") &&
      (placements.year2 === "c5" || placements.year2 === "c7");
    setStatus(signCorrect ? "wrong-year" : "wrong-sign");
  };

  const reset = () => {
    setPlacements({});
    setSelected(null);
    setStatus("idle");
  };

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Timeline builder
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Tap a card, then tap a year
        </span>
      </div>

      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
        Place each cashflow onto the correct date. The cost happens today. The
        two inflows arrive in Year 1 and Year 2. Build the timeline before you
        discount anything.
      </p>

      {/* Cashflow tray */}
      <div className="mt-6">
        <div className="ops-caption text-[11px] text-slate-400">Cashflows</div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {CF_CARDS.map((c) => {
            const isPlaced = placedCards.has(c.id);
            const isSelected = selected === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={
                  isPlaced
                    ? `${c.ariaLabel}, placed — select to remove`
                    : `${c.ariaLabel}${isSelected ? ", selected to place" : ""}`
                }
                onClick={() => handleCardClick(c.id)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 font-mono text-[14px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isSelected
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                    : cn(
                        cardTone(c.tone),
                        "bg-white/[0.03] hover:bg-white/[0.06]",
                      ),
                  isPlaced && !isSelected && "opacity-45",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <div className="ops-caption text-[11px] text-slate-400">Timeline</div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-ink-950/40 p-5 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {SLOTS.map((s, i) => {
              const placedId = placements[s.id];
              const card = CF_CARDS.find((c) => c.id === placedId);
              const isReady = selected !== null && !placedId;
              const isCorrectCell =
                status === "correct" && placedId === CORRECT[s.id];
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <button
                    type="button"
                    aria-label={
                      card
                        ? `${s.label} slot, holds ${card.ariaLabel} — select to remove`
                        : isReady
                          ? `${s.label} slot — place the selected cashflow here`
                          : `${s.label} slot, empty`
                    }
                    onClick={() => handleSlotClick(s.id)}
                    className={cn(
                      "relative flex h-20 w-full max-w-[180px] items-center justify-center rounded-xl border-2 border-dashed px-3 py-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      placedId
                        ? cn(
                            cardTone(card!.tone),
                            "border-solid bg-white/[0.03]",
                          )
                        : isReady
                          ? "border-accent-cyan/60 bg-accent-cyan/[0.06]"
                          : "border-white/15 bg-white/[0.02] hover:border-accent-cyan/40",
                      isCorrectCell && "ring-2 ring-accent-green/50",
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {placedId ? (
                        <motion.span
                          key={placedId}
                          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={
                            reduce
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.85 }
                          }
                          transition={{ duration: 0.25 }}
                          className="font-mono text-[14px] sm:text-[15px]"
                        >
                          {card!.label}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="empty"
                          initial={false}
                          animate={{ opacity: 1 }}
                          className="ops-caption text-[11px] text-slate-500"
                        >
                          empty
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* node + axis */}
                  <div className="mt-3 flex w-full flex-col items-center">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full ring-4 ring-ink-950",
                        i === 0 ? "bg-accent-amber" : "bg-accent-cyan",
                      )}
                      aria-hidden
                    />
                    <div
                      className="mt-1.5 h-px w-full bg-accent-cyan/30"
                      aria-hidden
                    />
                    <div className="mt-2 text-center">
                      <div className="font-mono text-[12px] text-slate-200">
                        {s.label}
                      </div>
                      <div className="ops-caption text-[11px] text-slate-500">
                        {s.sublabel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls + feedback */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allPlaced}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-accent-cyan bg-accent-cyan px-5 py-2.5 text-[14px] font-medium text-ink-950 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            !allPlaced && "cursor-not-allowed opacity-50",
          )}
        >
          Submit timeline
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-[14px] text-slate-100 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Reset
        </button>
        {selected && (
          <span className="font-mono text-[12px] text-accent-cyan">
            Cashflow selected — tap a year to place it.
          </span>
        )}
      </div>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 rounded-xl border px-4 py-3.5",
              status === "correct"
                ? "border-accent-green/40 bg-accent-green/10"
                : "border-accent-amber/40 bg-accent-amber/10",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]",
                status === "correct"
                  ? "text-accent-green"
                  : "text-accent-amber",
              )}
            >
              {status === "correct" && <span aria-hidden>✓</span>}
              {status === "correct"
                ? "Timeline complete"
                : status === "wrong-year"
                  ? "Right cashflow, wrong year"
                  : "Check the sign"}
            </div>
            <p
              className={cn(
                "ops-body mt-2 text-[15px] leading-7",
                status === "correct" ? "text-slate-50" : "text-slate-100",
              )}
            >
              {status === "correct" &&
                "Timeline complete. Now discount each cashflow back to today using the exchange rate for its date."}
              {status === "wrong-year" &&
                "Those are both benefits, but the amounts are on the wrong dates. Swap them so $5.0M lands in Year 1 and $7.0M lands in Year 2."}
              {status === "wrong-sign" &&
                "Check whether this is a cost or a benefit. The cost belongs at Year 0 (today); the inflows belong in Year 1 and Year 2."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}
