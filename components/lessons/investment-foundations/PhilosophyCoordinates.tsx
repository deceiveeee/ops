"use client";

import { useState } from "react";
import { Reveal, InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 11 — Map the philosophy.
 * For each of 5 philosophies, identify stage + involvement + horizon.
 * Accepts reasonable alternative horizon choices when defensible.
 */

type Stage = "asset-allocation" | "security-selection" | "execution";
type Involvement = "non-activist" | "activist" | "either";
type Horizon = "short" | "short-medium" | "medium" | "medium-long" | "long" | "variable";

const STAGE_OPTS: { id: Stage; label: string }[] = [
  { id: "asset-allocation", label: "Asset allocation" },
  { id: "security-selection", label: "Security selection" },
  { id: "execution", label: "Execution" },
];

const INVOLVEMENT_OPTS: { id: Involvement; label: string }[] = [
  { id: "non-activist", label: "Non-activist" },
  { id: "activist", label: "Activist" },
  { id: "either", label: "Either / usually non-activist" },
];

const HORIZON_OPTS: { id: Horizon; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "short-medium", label: "Short to medium" },
  { id: "medium", label: "Medium" },
  { id: "medium-long", label: "Medium to long" },
  { id: "long", label: "Long" },
  { id: "variable", label: "Variable" },
];

type Spec = {
  id: string;
  title: string;
  stage: Stage;
  involvement: Involvement;
  horizons: Horizon[];
  feedback: string;
};

const SPECS: Spec[] = [
  {
    id: "momentum",
    title: "Momentum",
    stage: "security-selection",
    involvement: "non-activist",
    horizons: ["short", "short-medium", "medium"],
    feedback:
      "The investor relies on price behavior rather than changing the company.",
  },
  {
    id: "deep-value",
    title: "Deep value",
    stage: "security-selection",
    involvement: "either",
    horizons: ["medium", "medium-long", "long"],
    feedback:
      "The investor waits for price and estimated value to converge.",
  },
  {
    id: "activist-value",
    title: "Activist value",
    stage: "security-selection",
    involvement: "activist",
    horizons: ["medium", "medium-long", "long"],
    feedback:
      "The investor attempts to create the catalyst rather than wait for it.",
  },
  {
    id: "market-timing",
    title: "Market timing",
    stage: "asset-allocation",
    involvement: "non-activist",
    horizons: ["short", "medium", "variable"],
    feedback:
      "Some timing strategies trade frequently, while others make infrequent changes based on valuation or economic conditions.",
  },
  {
    id: "arbitrage",
    title: "Arbitrage",
    stage: "execution",
    involvement: "either",
    horizons: ["short", "short-medium", "variable"],
    feedback:
      "The investor depends on a pricing relationship rather than changing the underlying company.",
  },
];

export default function PhilosophyCoordinates() {
  const [stagePicks, setStagePicks] = useState<Record<string, Stage>>({});
  const [involvementPicks, setInvolvementPicks] = useState<Record<string, Involvement>>({});
  const [horizonPicks, setHorizonPicks] = useState<Record<string, Horizon>>({});

  const setStage = (id: string, s: Stage) =>
    setStagePicks((p) => ({ ...p, [id]: s }));
  const setInv = (id: string, s: Involvement) =>
    setInvolvementPicks((p) => ({ ...p, [id]: s }));
  const setHor = (id: string, s: Horizon) =>
    setHorizonPicks((p) => ({ ...p, [id]: s }));

  return (
    <>
      <Reveal>
        <p className="ops-body mt-2 max-w-3xl text-[17px] text-slate-200">
          For each philosophy, identify the primary decision stage, the
          investor’s involvement, and the typical time horizon. A defensible
          alternative horizon is accepted.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <InteractiveFrame>
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Philosophy coordinates · 5 cases
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {SPECS.map((s) => {
              const stageOk = stagePicks[s.id] === s.stage;
              const invOk =
                involvementPicks[s.id] === s.involvement ||
                (s.involvement === "either" && involvementPicks[s.id] !== undefined);
              const horOk =
                horizonPicks[s.id] !== undefined &&
                s.horizons.includes(horizonPicks[s.id]);
              const allAnswered =
                stagePicks[s.id] && involvementPicks[s.id] && horizonPicks[s.id];
              const allOk = stageOk && invOk && horOk;

              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="ops-interactive-title text-[16px] text-white">
                      {s.title}
                    </h3>
                    {allAnswered && (
                      <span
                        className={cn(
                          "font-mono text-[11px] uppercase tracking-[0.14em]",
                          allOk ? "text-accent-green" : "text-accent-amber",
                        )}
                      >
                        {allOk ? "Matched" : "Review"}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <CoordinateBlock
                      label="Primary decision stage"
                      options={STAGE_OPTS}
                      value={stagePicks[s.id]}
                      correct={s.stage}
                      showOk={stagePicks[s.id] !== undefined}
                      onPick={(v) => setStage(s.id, v as Stage)}
                    />
                    <CoordinateBlock
                      label="Investor involvement"
                      options={INVOLVEMENT_OPTS}
                      value={involvementPicks[s.id]}
                      correct={s.involvement}
                      showOk={involvementPicks[s.id] !== undefined}
                      acceptEither={s.involvement === "either"}
                      onPick={(v) => setInv(s.id, v as Involvement)}
                    />
                    <CoordinateBlock
                      label="Typical horizon"
                      options={HORIZON_OPTS}
                      value={horizonPicks[s.id]}
                      correctSet={s.horizons}
                      showOk={horizonPicks[s.id] !== undefined}
                      onPick={(v) => setHor(s.id, v as Horizon)}
                    />
                  </div>

                  {allAnswered && (
                    <p className="ops-body mt-3 border-t border-white/10 pt-3 text-[13px] text-slate-300">
                      <span className="ops-caption mr-2 text-[10px] text-accent-amber">
                        Feedback
                      </span>
                      {s.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </InteractiveFrame>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <DefinitionCard>
          No time horizon is automatically superior. The relevant question is
          whether the investor can remain committed for as long as the
          philosophy requires.
        </DefinitionCard>
      </Reveal>
    </>
  );
}

type CoordinateOption = { id: string; label: string };

function CoordinateBlock({
  label,
  options,
  value,
  correct,
  correctSet,
  showOk,
  acceptEither,
  onPick,
}: {
  label: string;
  options: CoordinateOption[];
  value: string | undefined;
  correct?: string;
  correctSet?: string[];
  showOk: boolean;
  acceptEither?: boolean;
  onPick: (v: string) => void;
}) {
  const isCorrect = (id: string) =>
    correct !== undefined
      ? id === correct || (acceptEither && id !== undefined)
      : correctSet !== undefined
        ? correctSet.includes(id)
        : false;

  return (
    <div>
      <div className="ops-caption text-[10px] text-slate-400">{label}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const isPicked = value === o.id;
          const ok = isCorrect(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                !value &&
                  "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:text-accent-amber",
                value && isPicked && ok && "border-accent-green bg-accent-green/15 text-accent-green",
                value && isPicked && !ok && "border-accent-red bg-accent-red/15 text-accent-red",
                value && !isPicked && ok && "border-accent-green/40 text-accent-green/80",
                value && !isPicked && !ok && "border-white/10 text-slate-500",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
