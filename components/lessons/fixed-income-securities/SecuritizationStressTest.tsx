"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";

/**
 * Section 13 — Securitization stress test.
 * Four scenario cards. Each has four requirement lights (diversification,
 * measurement, normal markets, investor sophistication). The learner marks
 * each satisfied / violated. A survival rating (Stable / Fragile / Failing)
 * updates per scenario.
 */
type ReqKey = "diversification" | "measurement" | "markets" | "investors";

const REQ_KEYS: ReqKey[] = ["diversification", "measurement", "markets", "investors"];

const REQ_LABELS: Record<ReqKey, string> = {
  diversification: "Diversification",
  measurement: "Measurement",
  markets: "Normal markets",
  investors: "Investor sophistication",
};

type Scenario = {
  id: string;
  title: string;
  setup: string;
  defaultState: Record<ReqKey, boolean>;
  verdictStable: string;
  verdictFragile: string;
  verdictFailing: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "Diverse, well-measured, stable",
    setup:
      "Loans spread across many regions and sectors. Risk models are calibrated. Markets are liquid. Buyers are sophisticated.",
    defaultState: { diversification: true, measurement: true, markets: true, investors: true },
    verdictStable:
      "All four requirements hold. The structure is likely to behave as designed.",
    verdictFragile: "One requirement is shaky. The structure holds but is exposed if stress rises.",
    verdictFailing: "Multiple requirements broken. The structure is at risk of failing under stress.",
  },
  {
    id: "s2",
    title: "Geographically concentrated",
    setup:
      "Loans concentrated in one region. Correlations rise as the local economy weakens. Buyers rely on ratings only. Liquidity dries up.",
    defaultState: { diversification: false, measurement: false, markets: false, investors: false },
    verdictStable:
      "Even with good intent, concentration and rising correlation make stability unlikely.",
    verdictFragile:
      "Some protection remains, but the structure is fragile to a regional shock.",
    verdictFailing:
      "Concentration + rising correlation + ratings-only buyers + no liquidity → high risk of failure.",
  },
  {
    id: "s3",
    title: "Senior insured, insurer stressed",
    setup:
      "The senior tranche is wrapped by a mono-line insurer. But the insurer itself is under capital stress.",
    defaultState: { diversification: true, measurement: true, markets: false, investors: true },
    verdictStable:
      "Insurance helps — but only if the insurer can actually pay when needed.",
    verdictFragile:
      "The insurance is only as good as the insurer. If the insurer is stressed, the wrap loses value.",
    verdictFailing:
      "If the insurer fails, the senior tranche inherits the pool's risk directly.",
  },
  {
    id: "s4",
    title: "Junior absorbs — but losses exceed expectations",
    setup:
      "Junior is designed to absorb first losses. But realized losses are far larger than the models predicted.",
    defaultState: { diversification: true, measurement: false, markets: true, investors: true },
    verdictStable:
      "Junior absorbs as designed — as long as losses stay within expectations.",
    verdictFragile:
      "Losses are biting into Mezzanine. Senior is not yet hit but the cushion is thin.",
    verdictFailing:
      "Losses blew past Junior and Mezzanine. Senior is affected despite the protection layer.",
  },
];

type Rating = "Stable" | "Fragile" | "Failing";

function ratingFor(state: Record<ReqKey, boolean>): Rating {
  const off = REQ_KEYS.filter((k) => !state[k]).length;
  if (off === 0) return "Stable";
  if (off <= 2) return "Fragile";
  return "Failing";
}

export default function SecuritizationStressTest() {
  const reduce = useReducedMotion();
  const [states, setStates] = useState<Record<string, Record<ReqKey, boolean>>>(
    Object.fromEntries(
      SCENARIOS.map((s) => [s.id, { ...s.defaultState }]),
    ),
  );

  const toggle = (sid: string, key: ReqKey) =>
    setStates((prev) => ({
      ...prev,
      [sid]: { ...prev[sid], [key]: !prev[sid][key] },
    }));

  return (
    <div className="space-y-6">
      <DefinitionCard term="Stress-test the structure">
        A securitization survives only when its assumptions hold. Four
        requirements matter most: diversification, accurate risk measurement,
        normal markets, and sophisticated investors. Mark each satisfied or
        violated and watch the survival rating react.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Securitization stress test
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Tap each light to toggle satisfied / violated
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Four scenarios, four requirement lights
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Each scenario starts with a realistic setup. Flip the requirement
          lights to explore what happens when assumptions break. The survival
          rating updates instantly.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {SCENARIOS.map((s) => {
            const state = states[s.id];
            const rating = ratingFor(state);
            return (
              <ScenarioCard
                key={s.id}
                scenario={s}
                state={state}
                rating={rating}
                onToggle={(k) => toggle(s.id, k)}
                reduce={reduce}
              />
            );
          })}
        </div>
      </InteractiveFrame>
    </div>
  );
}

function ScenarioCard({
  scenario,
  state,
  rating,
  onToggle,
  reduce,
}: {
  scenario: Scenario;
  state: Record<ReqKey, boolean>;
  rating: Rating;
  onToggle: (k: ReqKey) => void;
  reduce: boolean | null;
}) {
  const ratingCls = {
    Stable: "border-accent-green/50 text-accent-green",
    Fragile: "border-accent-amber/50 text-accent-amber",
    Failing: "border-accent-red/50 text-accent-red",
  }[rating];
  const verdict =
    rating === "Stable"
      ? scenario.verdictStable
      : rating === "Fragile"
        ? scenario.verdictFragile
        : scenario.verdictFailing;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="ops-caption text-[11px] text-slate-400">
            Scenario
          </div>
          <h5 className="ops-body-strong mt-1 text-[16px] text-slate-50">
            {scenario.title}
          </h5>
        </div>
        <motion.span
          key={rating}
          initial={reduce ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
            ratingCls,
          )}
        >
          {rating}
        </motion.span>
      </div>

      <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
        {scenario.setup}
      </p>

      {/* Requirement lights */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {REQ_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onToggle(k)}
            aria-pressed={state[k]}
            aria-label={`${REQ_LABELS[k]}: ${state[k] ? "satisfied" : "violated"}`}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              state[k]
                ? "border-accent-green/40 bg-accent-green/[0.06]"
                : "border-accent-red/40 bg-accent-red/[0.06]",
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                state[k] ? "bg-accent-green" : "bg-accent-red",
              )}
              aria-hidden
            />
            <span className="font-mono text-[12px] text-slate-200">
              {REQ_LABELS[k]}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={rating}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            "mt-4 rounded-lg border px-4 py-3 text-[13px] leading-6",
            rating === "Stable"
              ? "border-accent-green/30 bg-accent-green/10 text-slate-100"
              : rating === "Fragile"
                ? "border-accent-amber/30 bg-accent-amber/10 text-slate-100"
                : "border-accent-red/30 bg-accent-red/10 text-slate-100",
          )}
        >
          {verdict}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
