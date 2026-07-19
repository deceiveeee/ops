"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InlineMath,
  Panel,
  FormulaExplainer,
  InteractiveFrame,
  TryItTag,
  Feedback,
} from "./shared";
import {
  NORTHSTAR_BASE,
  valueCase,
  valueWithPayout,
  valueAtRate,
} from "@/lib/northstar-case";

// ===================== Shared types & helpers =====================

const fmt = (n: number, d = 2) => (isFinite(n) ? `$${n.toFixed(d)}` : "—");
const fmtN = (n: number, d = 4) => (isFinite(n) ? n.toFixed(d) : "—");

const base = valueCase(NORTHSTAR_BASE);
const propAResult = valueWithPayout(NORTHSTAR_BASE, "high", 0.6);
const propBResult = valueWithPayout(NORTHSTAR_BASE, "stable", 0.9);

// Tolerance helpers
const near = (submitted: number, target: number, tol: number) =>
  Math.abs(submitted - target) <= tol;

// Parse input: accept "15", "15%", "0.15" when expecting a percent
function parsePercent(raw: string): number | null {
  const s = raw.trim().replace(/[$,%\s]/g, "");
  const n = parseFloat(s);
  if (isNaN(n)) return null;
  if (raw.includes("%") || n > 1.5) return n / 100; // "10%" or "10" → 0.10
  return n; // "0.10" → 0.10
}

function parseNum(raw: string): number | null {
  const s = raw.trim().replace(/[$,%\s]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

// ===================== AnswerInput — core validated input =====================

type AnswerInputProps = {
  label: ReactNode;
  target: number;
  tolerance: number;
  inputType?: "dollar" | "percent" | "plain";
  hints: string[];
  solution: ReactNode;
  placeholder?: string;
  onAccepted?: (value: number) => void;
  prefixHint?: string;
};

function AnswerInput({
  label,
  target,
  tolerance,
  inputType = "dollar",
  hints,
  solution,
  placeholder,
  onAccepted,
  prefixHint,
}: AnswerInputProps) {
  const [raw, setRaw] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "wrong" | "accepted" | "revealed"
  >("idle");
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const submit = () => {
    const parsed = inputType === "percent" ? parsePercent(raw) : parseNum(raw);
    if (parsed === null) {
      setStatus("wrong");
      return;
    }
    if (near(parsed, target, tolerance)) {
      setStatus("accepted");
      onAccepted?.(parsed);
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    setStatus("wrong");
    if (next >= 1 && hintLevel < 1) setHintLevel(1);
    if (next >= 2 && hintLevel < 2) setHintLevel(2);
    if (next >= 3) {
      setShowSolution(true);
      setStatus("revealed");
      onAccepted?.(target);
    }
  };

  const suffix =
    inputType === "percent" ? "%" : inputType === "dollar" ? "" : "";
  const ph =
    placeholder ??
    (inputType === "dollar" ? "$0.00" : inputType === "percent" ? "0%" : "0");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="ops-body text-[14px] text-slate-200">{label}</span>
        {prefixHint && (
          <span className="ops-caption text-[10px] text-slate-500">
            {prefixHint}
          </span>
        )}
      </div>

      {status === "accepted" || status === "revealed" ? (
        <div className="mt-2 flex items-center gap-3">
          <span
            className={cn(
              "rounded-lg border px-3 py-2 font-mono text-[15px]",
              status === "accepted"
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
            )}
          >
            {inputType === "percent"
              ? `${(target * 100).toFixed(1)}%`
              : inputType === "dollar"
                ? fmt(target)
                : fmtN(target)}
          </span>
          <span className="ops-caption text-[10px] text-slate-500">
            {status === "accepted" ? "✓ Accepted" : "Shown after 3 attempts"}
          </span>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="relative">
            {inputType === "dollar" && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[15px] text-slate-400">
                $
              </span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder={ph}
              aria-label={typeof label === "string" ? label : "answer input"}
              className={cn(
                "rounded-lg border bg-ink-950/60 py-2 pr-8 font-mono text-[15px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
                inputType === "dollar" ? "pl-7" : "pl-3",
                status === "wrong" ? "border-accent-red/50" : "border-white/15",
                "w-36",
              )}
            />
            {suffix && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[15px] text-slate-400">
                {suffix}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={submit}
            className="rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2 text-[13px] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Submit
          </button>
        </div>
      )}

      {/* Hints */}
      {status === "wrong" && hintLevel > 0 && (
        <div className="mt-3 space-y-1.5">
          {hints.slice(0, hintLevel).map((h, i) => (
            <p key={i} className="ops-muted flex items-start gap-2 text-[13px]">
              <span className="mt-0.5 font-mono text-accent-amber">💡</span>
              {h}
            </p>
          ))}
        </div>
      )}

      {/* Wrong feedback */}
      {status === "wrong" && (
        <p className="mt-2 text-[13px] text-accent-red">
          Not yet — try again. Attempt {attempts} of 3.
        </p>
      )}

      {/* Solution reveal */}
      {(showSolution || status === "revealed") && (
        <div className="mt-3 rounded-lg border border-accent-amber/20 bg-accent-amber/[0.05] p-3">
          <div className="ops-caption text-[10px] text-accent-amber">
            Worked solution
          </div>
          <div className="mt-1.5 text-[14px] text-slate-200">{solution}</div>
        </div>
      )}
    </div>
  );
}

// ===================== Round tracker =====================

function RoundTabs({
  round,
  setRound,
  completed,
  maxUnlocked,
}: {
  round: number;
  setRound: (n: number) => void;
  completed: Set<number>;
  maxUnlocked: number;
}) {
  const labels = [
    { n: 1, label: "Forecast" },
    { n: 2, label: "Terminal Value" },
    { n: 3, label: "Valuation" },
    { n: 4, label: "Payout" },
    { n: 5, label: "Stress" },
    { n: 6, label: "Errors" },
    { n: 7, label: "Memo" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.map((r) => {
        const isDone = completed.has(r.n);
        const isLocked = r.n > maxUnlocked;
        return (
          <button
            key={r.n}
            type="button"
            disabled={isLocked}
            onClick={() => !isLocked && setRound(r.n)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              isDone &&
                "border-accent-green/40 bg-accent-green/10 text-accent-green",
              round === r.n &&
                !isDone &&
                "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
              !isDone &&
                r.n !== round &&
                !isLocked &&
                "border-white/15 text-slate-300 hover:border-white/30",
              isLocked && "cursor-not-allowed border-white/5 text-slate-600",
            )}
          >
            <span className="font-mono">
              {isDone ? "✓" : isLocked ? "🔒" : r.n}
            </span>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

// ===================== ROUND 1: Forecast Worksheet =====================

type YearAnswer = {
  eps: number;
  dps: number;
  retained: number;
  endBVPS: number;
} | null;

function ForecastWorksheet({ onComplete }: { onComplete: () => void }) {
  const [yearAnswers, setYearAnswers] = useState<YearAnswer[]>([
    null,
    null,
    null,
  ]);
  const [growthAccepted, setGrowthAccepted] = useState(false);

  const rows = base.forecast;

  const currentYear = useMemo(() => {
    if (!yearAnswers[0]) return 1;
    if (!yearAnswers[1]) return 2;
    if (!yearAnswers[2]) return 3;
    return 0; // all done
  }, [yearAnswers]);

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Round 1 · Forecast Worksheet
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        Calculate each year&apos;s EPS, dividend, retained earnings, and ending
        book value. Use{" "}
        <InlineMath>{String.raw`EPS_t = ROE_t \times BVPS_{t-1}`}</InlineMath>{" "}
        and <InlineMath>{String.raw`DPS_t = p_t \times EPS_t`}</InlineMath>.
        Years unlock sequentially.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Begin BVPS</th>
              <th className="px-3 py-2">ROE</th>
              <th className="px-3 py-2">EPS</th>
              <th className="px-3 py-2">Payout</th>
              <th className="px-3 py-2">Dividend</th>
              <th className="px-3 py-2">Retained</th>
              <th className="px-3 py-2">End BVPS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const accepted = yearAnswers[idx];
              const isLocked = idx > 0 && !yearAnswers[idx - 1];
              return (
                <tr
                  key={r.year}
                  className={cn(
                    "border-b border-white/5",
                    isLocked && "opacity-40",
                  )}
                >
                  <td className="px-3 py-3 font-mono text-accent-cyan">
                    {r.year}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-200">
                    {fmtN(r.beginBVPS)}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-300">15%</td>
                  <td className="px-3 py-3 font-mono text-slate-200">
                    {accepted ? (
                      fmtN(accepted.eps, 3)
                    ) : isLocked ? (
                      "—"
                    ) : (
                      <span className="text-slate-600">input</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-300">30%</td>
                  <td className="px-3 py-3 font-mono text-slate-200">
                    {accepted ? (
                      fmtN(accepted.dps, 3)
                    ) : isLocked ? (
                      "—"
                    ) : (
                      <span className="text-slate-600">input</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-200">
                    {accepted ? (
                      fmtN(accepted.retained, 3)
                    ) : isLocked ? (
                      "—"
                    ) : (
                      <span className="text-slate-600">input</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-accent-green">
                    {accepted ? (
                      fmtN(accepted.endBVPS, 3)
                    ) : isLocked ? (
                      "—"
                    ) : (
                      <span className="text-slate-600">input</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Active year input */}
      {currentYear > 0 && (
        <div className="mt-5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-5">
          <h4 className="ops-interactive-title text-[16px] text-white">
            Year {currentYear}
          </h4>
          <p className="ops-muted mt-1 text-[13px]">
            Beginning BVPS:{" "}
            <span className="font-mono text-slate-200">
              {fmtN(rows[currentYear - 1].beginBVPS)}
            </span>
          </p>
          <YearInputSet
            target={rows[currentYear - 1]}
            onAccepted={(vals) => {
              const next = [...yearAnswers];
              next[currentYear - 1] = vals;
              setYearAnswers(next);
              if (next[2] !== null) {
                // All 3 years done → growth question will open
              }
            }}
          />
        </div>
      )}

      {/* Growth rate question */}
      {currentYear === 0 && !growthAccepted && (
        <div className="mt-5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-5">
          <h4 className="ops-interactive-title text-[16px] text-white">
            High-Growth Rate
          </h4>
          <p className="ops-body mt-2 text-[14px] text-slate-300">
            Calculate the temporary high-growth rate:{" "}
            <InlineMath>{String.raw`g_H = b \times ROE`}</InlineMath>. Enter as
            a percentage (e.g. 10.5).
          </p>
          <div className="mt-3">
            <AnswerInput
              label={<span>g_H (high-growth rate)</span>}
              target={base.highGrowthRate}
              tolerance={0.001}
              inputType="percent"
              hints={[
                "The retention ratio b = 1 − payout = 1 − 0.30 = 0.70.",
                "g = b × ROE = 0.70 × 15%.",
                "g_H = 0.70 × 0.15 = 0.105 = 10.5%.",
              ]}
              solution={
                <span>
                  <InlineMath>{String.raw`g_H = b \times ROE = 0.70 \times 0.15 = 0.105 = 10.5\%`}</InlineMath>
                </span>
              }
              onAccepted={() => {
                setGrowthAccepted(true);
                onComplete();
              }}
            />
          </div>
        </div>
      )}

      {growthAccepted && (
        <div className="mt-4 flex items-center gap-2 text-[13px] text-accent-green">
          <span>✓</span> Forecast complete.{" "}
          <InlineMath>{String.raw`g_H = 10.5\%`}</InlineMath> — temporary, not
          perpetual.
        </div>
      )}
    </InteractiveFrame>
  );
}

function YearInputSet({
  target,
  onAccepted,
}: {
  target: { eps: number; dps: number; retained: number; endBVPS: number };
  onAccepted: (vals: {
    eps: number;
    dps: number;
    retained: number;
    endBVPS: number;
  }) => void;
}) {
  const [vals, setVals] = useState({
    eps: "",
    dps: "",
    retained: "",
    endBVPS: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);

  const submit = () => {
    const eps = parseNum(vals.eps);
    const dps = parseNum(vals.dps);
    const retained = parseNum(vals.retained);
    const endBVPS = parseNum(vals.endBVPS);
    const errs: string[] = [];

    if (eps === null || !near(eps, target.eps, 0.005)) {
      errs.push(
        "EPS should be calculated from beginning book value: EPS = ROE × beginning BVPS.",
      );
    }
    if (dps === null || !near(dps, target.dps, 0.005)) {
      errs.push(
        "The payout ratio applies to EPS, not BVPS: DPS = payout × EPS.",
      );
    }
    if (retained === null || !near(retained, target.retained, 0.005)) {
      errs.push("Retained earnings = EPS − dividend (or (1 − payout) × EPS).");
    }
    if (endBVPS === null || !near(endBVPS, target.endBVPS, 0.005)) {
      errs.push(
        "Only retained earnings increase BVPS: ending BVPS = beginning BVPS + retained.",
      );
    }

    if (errs.length === 0) {
      onAccepted({
        eps: target.eps,
        dps: target.dps,
        retained: target.retained,
        endBVPS: target.endBVPS,
      });
    } else {
      setAttempts((a) => a + 1);
      setErrors(errs);
    }
  };

  const showSolution = attempts >= 3;

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            { key: "eps", label: "EPS", ph: "$0.000" },
            { key: "dps", label: "Dividend", ph: "$0.000" },
            { key: "retained", label: "Retained", ph: "$0.000" },
            { key: "endBVPS", label: "End BVPS", ph: "$0.000" },
          ] as const
        ).map((f) => (
          <div key={f.key}>
            <label
              className="ops-caption text-[10px] text-slate-500"
              htmlFor={`y-${f.key}`}
            >
              {f.label}
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[14px] text-slate-400">
                $
              </span>
              <input
                id={`y-${f.key}`}
                type="text"
                inputMode="decimal"
                value={vals[f.key]}
                onChange={(e) =>
                  setVals((v) => ({ ...v, [f.key]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder={f.ph}
                className="w-full rounded-lg border border-white/15 bg-ink-950/60 py-2 pl-7 pr-2 font-mono text-[14px] text-slate-100 placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          className="rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2 text-[13px] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Submit Year
        </button>
        {attempts > 0 && attempts < 3 && (
          <span className="text-[12px] text-accent-amber">
            Attempt {attempts} of 3
          </span>
        )}
      </div>

      {errors.length > 0 && !showSolution && (
        <div className="mt-2 space-y-1.5">
          {errors.map((e, i) => (
            <p
              key={i}
              className="flex items-start gap-2 text-[13px] text-accent-red"
            >
              <span className="mt-0.5">⚠</span>
              {e}
            </p>
          ))}
        </div>
      )}

      {showSolution && (
        <div className="rounded-lg border border-accent-amber/20 bg-accent-amber/[0.05] p-3">
          <div className="ops-caption text-[10px] text-accent-amber">
            Worked solution
          </div>
          <div className="mt-1.5 space-y-1 font-mono text-[14px] text-slate-200">
            <div>
              EPS = 15% × {fmtN(target.eps / 0.15, 3)} = {fmtN(target.eps, 3)}
            </div>
            <div>
              DPS = 30% × {fmtN(target.eps, 3)} = {fmtN(target.dps, 3)}
            </div>
            <div>
              Retained = {fmtN(target.eps, 3)} − {fmtN(target.dps, 3)} ={" "}
              {fmtN(target.retained, 3)}
            </div>
            <div>
              End BVPS = {fmtN(target.eps / 0.15, 3)} +{" "}
              {fmtN(target.retained, 3)} = {fmtN(target.endBVPS, 3)}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onAccepted({
                eps: target.eps,
                dps: target.dps,
                retained: target.retained,
                endBVPS: target.endBVPS,
              })
            }
            className="mt-2 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-[12px] text-accent-cyan transition-colors hover:bg-accent-cyan/20"
          >
            Accept solution and continue
          </button>
        </div>
      )}
    </div>
  );
}

// ===================== ROUND 2: Terminal Value Worksheet =====================

function TerminalValueWorksheet({ onComplete }: { onComplete: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [divPick, setDivPick] = useState<string | null>(null);

  const bvps3 = base.forecast[2].endBVPS;
  const eps4 = base.dps4 / NORTHSTAR_BASE.stable.payout;

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Round 2 · Terminal Value Worksheet
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        From Year 4 onward: ROE = 10%, payout = 60%. BVPS₃ (accepted from Round
        1) = <span className="font-mono text-accent-cyan">{fmtN(bvps3)}</span>.
        The formula reference is{" "}
        <InlineMath>{String.raw`TV_3 = \frac{DPS_4}{r - g_S}`}</InlineMath>.
        Calculate each component.
      </p>

      <div className="mt-5 space-y-3">
        <AnswerInput
          label={<span>Mature-stage retention ratio b_S</span>}
          target={1 - NORTHSTAR_BASE.stable.payout}
          tolerance={0.001}
          inputType="percent"
          hints={[
            "Retention = 1 − payout = 1 − 60%.",
            "b_S = 1 − 0.60 = 0.40 = 40%.",
          ]}
          solution={<span>b_S = 1 − 60% = 40%</span>}
        />

        <AnswerInput
          label={<span>Stable growth rate g_S = b_S × ROE_S</span>}
          target={base.stableGrowth}
          tolerance={0.001}
          inputType="percent"
          hints={[
            "Use the retention ratio and the mature ROE (10%).",
            "g_S = 0.40 × 10%.",
            "g_S = 0.40 × 0.10 = 0.04 = 4%.",
          ]}
          solution={
            <span>
              <InlineMath>{String.raw`g_S = 0.40 \times 0.10 = 0.04 = 4\%`}</InlineMath>
            </span>
          }
        />

        <AnswerInput
          label={<span>EPS₄ = ROE_S × BVPS₃</span>}
          target={eps4}
          tolerance={0.01}
          inputType="dollar"
          hints={[
            "Use the accepted BVPS₃ from Round 1.",
            `EPS₄ = 10% × ${fmtN(bvps3)}.`,
          ]}
          solution={
            <span>
              <InlineMath>{String.raw`EPS_4 = 0.10 \times ${fmtN(bvps3)} = ${fmtN(eps4)}`}</InlineMath>
            </span>
          }
        />

        <AnswerInput
          label={<span>DPS₄ = payout × EPS₄</span>}
          target={base.dps4}
          tolerance={0.01}
          inputType="dollar"
          hints={["DPS₄ = 60% × EPS₄.", `DPS₄ = 0.60 × ${fmtN(eps4)}.`]}
          solution={
            <span>
              <InlineMath>{String.raw`DPS_4 = 0.60 \times ${fmtN(eps4)} = ${fmtN(base.dps4)}`}</InlineMath>
            </span>
          }
        />
      </div>

      {/* Which dividend? */}
      <div className="mt-5 rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
        <p className="ops-body-strong text-[15px] text-slate-50">
          Which dividend belongs in the terminal-value numerator?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["DPS_3", "DPS_4", "EPS_4"].map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={divPick !== null}
              onClick={() => setDivPick(opt)}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                divPick === opt
                  ? opt === "DPS_4"
                    ? "border-accent-green bg-accent-green/15 text-accent-green"
                    : "border-accent-red bg-accent-red/15 text-accent-red"
                  : "border-white/20 text-slate-100 hover:border-accent-cyan/60",
              )}
            >
              {opt === "DPS_3" ? "DPS₃" : opt === "DPS_4" ? "DPS₄" : "EPS₄"}
            </button>
          ))}
        </div>
        {divPick && (
          <Feedback status={divPick === "DPS_4" ? "correct" : "incorrect"}>
            {divPick === "DPS_4"
              ? "Correct. DPS₃ is already in the explicit forecast. Terminal value starts with DPS₄."
              : "DPS₃ is already discounted in the explicit period. The terminal value must begin with DPS₄."}
          </Feedback>
        )}
      </div>

      <div className="mt-5">
        <AnswerInput
          label={<span>Terminal value TV₃ = DPS₄ / (r − g_S)</span>}
          target={base.terminalValue}
          tolerance={0.05}
          inputType="dollar"
          hints={[
            "Use DPS₄ and the denominator (r − g_S) = (10% − 4%) = 6%.",
            `TV₃ = ${fmtN(base.dps4, 4)} / 0.06.`,
          ]}
          solution={
            <span>
              <InlineMath>{String.raw`TV_3 = \frac{${fmtN(base.dps4, 4)}}{0.06} = ${fmtN(base.terminalValue)}`}</InlineMath>
              <span className="mt-1 block text-slate-300">
                TV₃ equals Year 3 ending BVPS because ROE_S = r. Mature
                reinvestment has zero NPV.
              </span>
            </span>
          }
          onAccepted={() => {
            setAccepted(true);
            onComplete();
          }}
        />
      </div>
    </InteractiveFrame>
  );
}

// ===================== ROUND 3: DCF Worksheet =====================

function DCFWorksheet({ onComplete }: { onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [showBridge, setShowBridge] = useState(false);

  const fields = [
    {
      key: "pv1",
      label: "PV(DPS₁) = DPS₁ / (1.10)¹",
      target: base.pvDividends[0],
      tol: 0.005,
    },
    {
      key: "pv2",
      label: "PV(DPS₂) = DPS₂ / (1.10)²",
      target: base.pvDividends[1],
      tol: 0.005,
    },
    {
      key: "pv3",
      label: "PV(DPS₃) = DPS₃ / (1.10)³",
      target: base.pvDividends[2],
      tol: 0.005,
    },
    {
      key: "pvTV",
      label: "PV(TV₃) = TV₃ / (1.10)³",
      target: base.pvTerminal,
      tol: 0.01,
    },
    {
      key: "p0",
      label: "P₀ = sum of all PVs",
      target: base.totalValue,
      tol: 0.05,
    },
    {
      key: "tvShare",
      label: "Terminal-value share of P₀ (%)",
      target: base.terminalShare * 100,
      tol: 0.5,
      isPct: true,
    },
  ];

  const allAccepted = fields.every(
    (f) => answers[f.key] !== undefined && answers[f.key] !== null,
  );

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Round 3 · DCF Worksheet
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        Using your accepted values from Rounds 1 and 2, discount each cash flow
        at r = 10% and sum to get P₀.
      </p>

      <div className="mt-5 space-y-3">
        {fields.map((f) => (
          <AnswerInput
            key={f.key}
            label={<span>{f.label}</span>}
            target={f.target}
            tolerance={f.tol}
            inputType={f.isPct ? "plain" : "dollar"}
            hints={[
              "Apply the discount factor (1+r)^t for each period.",
              f.isPct
                ? "Divide PV(TV₃) by P₀ and multiply by 100."
                : "Use the accepted DPS and TV values from earlier rounds.",
            ]}
            solution={
              <span className="font-mono">
                {f.isPct
                  ? `${f.target.toFixed(1)}%`
                  : `$${f.target.toFixed(4)}`}
              </span>
            }
            onAccepted={(v) => {
              setAnswers((prev) => ({ ...prev, [f.key]: v }));
              const updated = { ...answers, [f.key]: v };
              if (
                fields.every(
                  (ff) =>
                    updated[ff.key] !== undefined && updated[ff.key] !== null,
                )
              ) {
                setShowBridge(true);
                onComplete();
              }
            }}
          />
        ))}
      </div>

      {showBridge && (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="ops-caption text-[10px] text-slate-500">
              PV of explicit dividends
            </div>
            <div className="ops-display mt-1 text-xl text-slate-100">
              {fmt(base.pvExplicitTotal)}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="ops-caption text-[10px] text-slate-500">
              PV of terminal value
            </div>
            <div className="ops-display mt-1 text-xl text-accent-purple">
              {fmt(base.pvTerminal)}
            </div>
          </div>
          <div className="rounded-lg border border-accent-green/30 bg-accent-green/[0.06] p-4">
            <div className="ops-caption text-[10px] text-accent-green">
              Total P₀
            </div>
            <div className="ops-display mt-1 text-xl text-accent-green">
              {fmt(base.totalValue)}
            </div>
          </div>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 4: Payout Policy Analysis =====================

function PayoutPolicyAnalysis({ onComplete }: { onComplete: () => void }) {
  const [propAP0, setPropAP0] = useState<number | null>(null);
  const [propBP0, setPropBP0] = useState<number | null>(null);
  const [reasonA, setReasonA] = useState<string | null>(null);
  const [reasonB, setReasonB] = useState<string | null>(null);

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Round 4 · Payout Policy Analysis
        </span>
      </div>

      {/* Proposal A: Rebuild forecast at 60% payout */}
      <div className="mt-5">
        <h4 className="ops-interactive-title text-[16px] text-white">
          Proposal A: Raise Years 1–3 payout from 30% to 60%
        </h4>
        <p className="ops-body mt-2 text-[14px] text-slate-300">
          Rebuild the Year 1–3 forecast at 60% payout (40% retention). Calculate
          the revised P₀. Hint: EPS₁ = 15% × $100 = $15 (unchanged). But DPS₁ =
          60% × $15 = $9 and retained = $6.
        </p>

        <div className="mt-3 space-y-3">
          <AnswerInput
            label={<span>Revised P₀ under Proposal A</span>}
            target={propAResult.totalValue}
            tolerance={0.05}
            inputType="dollar"
            hints={[
              "Rebuild: BVPS grows at b×ROE = 0.40×15% = 6% per year during Years 1–3.",
              "DPS₁ = 60% × $15 = $9. DPS₂ = 60% × EPS₂. BVPS₁ = $100 + $6 = $106 → EPS₂ = 15% × $106.",
              "Year 3 ending BVPS, then TV₃ = DPS₄ / (r − g_S). The mature stage is unchanged.",
            ]}
            solution={
              <span>
                <InlineMath>{String.raw`P_0^{A} \approx \$${propAResult.totalValue.toFixed(2)}`}</InlineMath>
                <span className="mt-1 block text-slate-300">
                  Original P₀ ≈ ${base.totalValue.toFixed(2)}. Value falls by ≈
                  ${(base.totalValue - propAResult.totalValue).toFixed(2)}.
                  Retaining less during positive-NPV years (ROE 15% &gt; r 10%)
                  destroys some value.
                </span>
              </span>
            }
            onAccepted={(v) => setPropAP0(v)}
          />

          {propAP0 !== null && (
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
              <p className="ops-body-strong text-[15px] text-slate-50">
                Why did value change under Proposal A?
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {[
                  {
                    id: "roe",
                    label:
                      "Retained capital earns 15% while investors require 10%. Higher payout sacrifices positive-NPV reinvestment.",
                  },
                  {
                    id: "div",
                    label:
                      "Higher dividends are always better for shareholders.",
                  },
                  { id: "tax", label: "Tax effects increase value." },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    disabled={reasonA !== null}
                    onClick={() => {
                      setReasonA(o.id);
                      if (reasonB !== null) onComplete();
                    }}
                    className={cn(
                      "rounded-lg border px-4 py-2.5 text-left text-[14px] transition-colors disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      reasonA === o.id
                        ? o.id === "roe"
                          ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                          : "border-accent-red/50 bg-accent-red/10 text-accent-red"
                        : "border-white/15 text-slate-200 hover:border-accent-cyan/40",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {reasonA && reasonA !== "roe" && (
                <Feedback status="incorrect">
                  During Years 1–3, ROE = 15% &gt; r = 10%. Retained capital
                  earns above the required return. Raising payout reduces
                  positive-NPV reinvestment.
                </Feedback>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Proposal B: Higher mature payout */}
      <div className="mt-6">
        <h4 className="ops-interactive-title text-[16px] text-white">
          Proposal B: Raise mature payout from 60% to 90%
        </h4>
        <p className="ops-body mt-2 text-[14px] text-slate-300">
          Years 1–3 stay at 30% payout. Mature-stage payout changes to 90%
          (retention 10%). Calculate the revised stable growth rate, DPS₄,
          terminal value, and P₀.
        </p>

        <div className="mt-3 space-y-3">
          <AnswerInput
            label={<span>Revised stable growth rate g_S under Proposal B</span>}
            target={propBResult.stableGrowth}
            tolerance={0.001}
            inputType="percent"
            hints={[
              "g_S = b_S × ROE_S = 10% × 10%.",
              "g_S = 0.10 × 0.10 = 1%.",
            ]}
            solution={
              <span>
                <InlineMath>{String.raw`g_S = 0.10 \times 0.10 = 1\%`}</InlineMath>
              </span>
            }
          />

          <AnswerInput
            label={<span>Revised P₀ under Proposal B</span>}
            target={propBResult.totalValue}
            tolerance={0.05}
            inputType="dollar"
            hints={[
              "Rebuild TV₃ with the new DPS₄ = 90% × EPS₄ and new g_S = 1%.",
              "The mature-stage ROE is still 10% = r, so reinvestment is zero-NPV.",
              "Value should be very close to the original — try computing it.",
            ]}
            solution={
              <span>
                <InlineMath>{String.raw`P_0^{B} \approx \$${propBResult.totalValue.toFixed(2)}`}</InlineMath>
                <span className="mt-1 block text-slate-300">
                  Unchanged. When ROE = r, changing payout changes dividend
                  timing and growth but not present value.
                </span>
              </span>
            }
            onAccepted={(v) => setPropBP0(v)}
          />

          {propBP0 !== null && (
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
              <p className="ops-body-strong text-[15px] text-slate-50">
                Why is value unchanged under Proposal B?
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {[
                  {
                    id: "eqr",
                    label:
                      "Mature ROE = r, so reinvestment is zero-NPV. Payout timing doesn't affect present value.",
                  },
                  { id: "growth", label: "The company stopped growing." },
                  { id: "div", label: "Dividends don't matter." },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    disabled={reasonB !== null}
                    onClick={() => {
                      setReasonB(o.id);
                      if (reasonA !== null) onComplete();
                    }}
                    className={cn(
                      "rounded-lg border px-4 py-2.5 text-left text-[14px] transition-colors disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      reasonB === o.id
                        ? o.id === "eqr"
                          ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                          : "border-accent-red/50 bg-accent-red/10 text-accent-red"
                        : "border-white/15 text-slate-200 hover:border-accent-cyan/40",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {reasonB && reasonB !== "eqr" && (
                <Feedback status="incorrect">
                  When ROE = r = 10%, mature-stage reinvestment has zero NPV.
                  Changing payout changes dividend timing and growth, but not
                  present value.
                </Feedback>
              )}
            </div>
          )}
        </div>
      </div>
    </InteractiveFrame>
  );
}

// ===================== ROUND 5: Cost of Equity Stress =====================

function CostOfEquityStressWorksheet({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const scenarios = [0.08, 0.1, 0.12];
  const results = scenarios.map((r) => ({
    r,
    ...valueAtRate(NORTHSTAR_BASE, r),
  }));
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [showChart, setShowChart] = useState(false);

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Round 5 · Cost of Equity Stress Test
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        Operating forecasts are unchanged. For each cost of equity, calculate
        the total stock value. Hint: re-derive TV₃ = DPS₄ / (r − g_S) at each
        rate, then discount.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {results.map((res, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="ops-caption text-[11px] text-accent-cyan">
              r = {(res.r * 100).toFixed(0)}%
            </div>
            <div className="mt-3 space-y-2">
              <AnswerInput
                label={<span className="text-[13px]">TV₃</span>}
                target={res.terminalValue}
                tolerance={0.05}
                inputType="dollar"
                hints={[
                  `TV₃ = DPS₄ / (r − g_S) = ${fmtN(base.dps4, 4)} / (${res.r.toFixed(2)} − 0.04).`,
                  `TV₃ = ${fmtN(base.dps4, 4)} / ${(res.r - 0.04).toFixed(2)}.`,
                ]}
                solution={
                  <span className="font-mono">
                    TV₃ = {fmtN(res.terminalValue)}
                  </span>
                }
              />
              <AnswerInput
                label={<span className="text-[13px]">P₀</span>}
                target={res.totalValue}
                tolerance={0.05}
                inputType="dollar"
                hints={[
                  "P₀ = PV(DPS₁) + PV(DPS₂) + PV(DPS₃) + PV(TV₃), all at this r.",
                  "Discount each accepted DPS and the TV at this rate.",
                ]}
                solution={
                  <span className="font-mono">P₀ = {fmtN(res.totalValue)}</span>
                }
                onAccepted={(v) => {
                  const updated = { ...answers, [`s${i}`]: v };
                  setAnswers(updated);
                  if (Object.keys(updated).length === 3) {
                    setShowChart(true);
                    onComplete();
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {showChart && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="px-3 py-2">r</th>
                <th className="px-3 py-2">P₀</th>
                <th className="px-3 py-2">Δ vs r=10%</th>
                <th className="px-3 py-2">% from TV</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => (
                <tr key={res.r} className="border-b border-white/5">
                  <td className="px-3 py-3 font-mono text-accent-cyan">
                    {(res.r * 100).toFixed(0)}%
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-100">
                    {fmt(res.totalValue)}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-400">
                    {res.r < 0.1
                      ? `+${fmt(res.totalValue - base.totalValue)}`
                      : res.r > 0.1
                        ? `−${fmt(base.totalValue - res.totalValue)}`
                        : "—"}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-400">
                    {(res.terminalShare * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 6: Analyst Errors =====================

function AnalystErrorDiagnosis({ onComplete }: { onComplete: () => void }) {
  const [pvgoSteps, setPvgoSteps] = useState<Record<string, string>>({});
  const [tempErrors, setTempErrors] = useState<Set<string>>(new Set());
  const [diagDone, setDiagDone] = useState(false);

  const pvgoBlanks = [
    {
      key: "blank1",
      question: "The formula EPS₁/r assumes __________.",
      options: [
        "EPS₁ is a sustainable, perpetual no-growth earnings stream from existing assets",
        "EPS₁ is one year of temporary high-growth earnings",
        "EPS₁ equals dividends",
      ],
      correct: 0,
    },
    {
      key: "blank2",
      question: "Northstar's Year 1 EPS is not sustainable because __________.",
      options: [
        "ROE falls from 15% to 10% after Year 3",
        "the company pays no dividends",
        "the stock price is too high",
      ],
      correct: 0,
    },
    {
      key: "blank3",
      question: "Therefore the no-growth value is __________.",
      options: [
        "overstated (15/0.10 = $150 is too high because $15 is temporary)",
        "correct",
        "understated",
      ],
      correct: 0,
    },
    {
      key: "blank4",
      question: "The negative PVGO result is misleading because __________.",
      options: [
        "it subtracts an overstated no-growth value from a correct price",
        "PVGO is always zero",
        "the formula itself is wrong",
      ],
      correct: 0,
    },
  ];

  const tempErrorOptions = [
    {
      id: "earnings_vs_div",
      label: "Earnings growth ≠ dividend growth (payout policy ignored)",
      valid: true,
    },
    {
      id: "one_year",
      label: "One-year growth is not perpetual growth",
      valid: true,
    },
    { id: "payout", label: "Payout policy is ignored", valid: true },
    { id: "pe_compression", label: "Terminal P/E may change", valid: true },
    {
      id: "multi_stage",
      label: "A multi-stage model is required",
      valid: true,
    },
    {
      id: "math_error",
      label: "The arithmetic 1% + 15% = 16% is wrong",
      valid: false,
    },
  ];

  const allBlanksCorrect = pvgoBlanks.every(
    (b) => pvgoSteps[b.key] === b.options[b.correct],
  );
  const enoughTempErrors =
    tempErrors.size >= 4 &&
    Array.from(tempErrors).every(
      (id) => tempErrorOptions.find((o) => o.id === id)?.valid,
    );

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Round 6 · Analyst Error Diagnosis
        </span>
      </div>

      {/* PVGO case */}
      <div className="mt-5 rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
        <div className="ops-caption text-[11px] text-accent-red">
          Case A · Misleading PVGO
        </div>
        <p className="ops-body mt-2 text-[14px] text-slate-200">
          Analyst computes{" "}
          <InlineMath>{String.raw`EPS_1/r = 15/0.10 = \$150`}</InlineMath>, then{" "}
          <InlineMath>{String.raw`PVGO = 113.70 - 150 = -\$36.30`}</InlineMath>.
          Complete the reasoning chain:
        </p>

        <div className="mt-4 space-y-4">
          {pvgoBlanks.map((b) => (
            <div key={b.key}>
              <p className="ops-body text-[14px] text-slate-200">
                {b.question}
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {b.options.map((opt, oi) => {
                  const picked = pvgoSteps[b.key] === opt;
                  const isCorrect = oi === b.correct;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={
                        pvgoSteps[b.key] !== undefined &&
                        pvgoSteps[b.key] !== opt &&
                        allBlanksCorrect
                      }
                      onClick={() =>
                        setPvgoSteps((prev) => ({ ...prev, [b.key]: opt }))
                      }
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        picked &&
                          isCorrect &&
                          "border-accent-green/50 bg-accent-green/10 text-accent-green",
                        picked &&
                          !isCorrect &&
                          "border-accent-red/50 bg-accent-red/10 text-accent-red",
                        !picked &&
                          "border-white/15 text-slate-200 hover:border-accent-cyan/40",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {allBlanksCorrect && (
          <Feedback status="correct">
            Correct. The simple PVGO decomposition requires a sustainable
            no-growth earnings baseline. Northstar&apos;s $15 EPS is temporary —
            capitalizing it forever overstates assets-in-place.
          </Feedback>
        )}
      </div>

      {/* Temporary growth case */}
      <div className="mt-5 rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
        <div className="ops-caption text-[11px] text-accent-red">
          Case B · Temporary growth as perpetual
        </div>
        <p className="ops-body mt-2 text-[14px] text-slate-200">
          Analyst says: &quot;Dividend yield 1% + next-year EPS growth 15% = 16%
          expected return.&quot; Select all valid problems with this
          calculation:
        </p>

        <div className="mt-3 flex flex-col gap-1.5">
          {tempErrorOptions.map((o) => {
            const picked = tempErrors.has(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setTempErrors((prev) => {
                    const next = new Set(prev);
                    if (next.has(o.id)) next.delete(o.id);
                    else next.add(o.id);
                    return next;
                  });
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  picked &&
                    o.valid &&
                    "border-accent-green/50 bg-accent-green/10 text-accent-green",
                  picked &&
                    !o.valid &&
                    "border-accent-red/50 bg-accent-red/10 text-accent-red",
                  !picked &&
                    "border-white/15 text-slate-200 hover:border-accent-cyan/40",
                )}
              >
                {picked ? "✓ " : ""}
                {o.label}
              </button>
            );
          })}
        </div>

        {enoughTempErrors && (
          <Feedback status="correct">
            Correct. The Gordon relationship r = D₁/P₀ + g requires a
            sustainable perpetual dividend growth rate, not a one-year earnings
            growth number. Payout policy, transition, and P/E compression all
            matter.
          </Feedback>
        )}
      </div>

      {allBlanksCorrect && enoughTempErrors && !diagDone && (
        <button
          type="button"
          onClick={() => {
            setDiagDone(true);
            onComplete();
          }}
          className="mt-4 rounded-full border border-accent-cyan bg-accent-cyan px-5 py-2 text-[14px] font-medium text-ink-950 transition-colors hover:bg-accent-cyan/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Confirm diagnoses →
        </button>
      )}
    </InteractiveFrame>
  );
}

// ===================== Advanced: Market Expectations =====================

function MarketExpectationsChallenge({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [rAccepted, setRAccepted] = useState(false);
  const [gAccepted, setGAccepted] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Advanced · Market Expectations Shock
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        Start with{" "}
        <InlineMath>{String.raw`P_0 = \frac{20}{0.12 - 0.10} = \$1,000`}</InlineMath>
        . The stock falls 23% to $770. Solve for the assumption changes that
        produce this decline. Enter rates as percentages (e.g. 12.60).
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AnswerInput
          label={
            <span>
              Scenario A: Solve for new r.{" "}
              <InlineMath>{String.raw`\$770 = \frac{20}{r - 0.10}`}</InlineMath>
            </span>
          }
          target={0.126}
          tolerance={0.002}
          inputType="percent"
          hints={[
            "Rearrange: r = D₁/P + g = 20/770 + 0.10.",
            "r = 0.02597 + 0.10 ≈ 0.1260.",
          ]}
          solution={
            <span>
              <InlineMath>{String.raw`r = \frac{20}{770} + 0.10 \approx 12.60\%`}</InlineMath>
            </span>
          }
          onAccepted={() => setRAccepted(true)}
        />

        <AnswerInput
          label={
            <span>
              Scenario B: Solve for new g.{" "}
              <InlineMath>{String.raw`\$770 = \frac{20}{0.12 - g}`}</InlineMath>
            </span>
          }
          target={0.094}
          tolerance={0.002}
          inputType="percent"
          hints={[
            "Rearrange: g = r − D₁/P = 0.12 − 20/770.",
            "g = 0.12 − 0.02597 ≈ 0.0940.",
          ]}
          solution={
            <span>
              <InlineMath>{String.raw`g = 0.12 - \frac{20}{770} \approx 9.40\%`}</InlineMath>
            </span>
          }
          onAccepted={() => setGAccepted(true)}
        />
      </div>

      {rAccepted && gAccepted && (
        <Feedback status="info">
          When r − g is small, modest changes in either the discount rate or the
          growth rate produce large valuation swings. This is a sensitivity
          demonstration — the Gordon model does not explain every market event.
        </Feedback>
      )}

      {rAccepted && gAccepted && !challengeDone && (
        <button
          type="button"
          onClick={() => {
            setChallengeDone(true);
            onComplete();
          }}
          className="mt-3 rounded-full border border-accent-cyan bg-accent-cyan px-4 py-2 text-[13px] font-medium text-ink-950 transition-colors hover:bg-accent-cyan/90"
        >
          Complete challenge
        </button>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 7: Memo Builder =====================

function MemoBuilder({ onComplete }: { onComplete: () => void }) {
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");
  const [s4, setS4] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sections = [
    {
      key: "s1",
      label: "Section 1 · Valuation",
      ph: "State P₀, the explicit-vs-terminal split, and key assumptions (r=10%, g_H=10.5%, g_S=4%).",
      val: s1,
      set: setS1,
    },
    {
      key: "s2",
      label: "Section 2 · Capital allocation",
      ph: "Should Northstar retain or distribute more in Years 1–3? Why is mature payout value-neutral?",
      val: s2,
      set: setS2,
    },
    {
      key: "s3",
      label: "Section 3 · Risk and sensitivity",
      ph: "How does raising r affect value? Why is TV sensitive to r − g?",
      val: s3,
      set: setS3,
    },
    {
      key: "s4",
      label: "Section 4 · Interpretation",
      ph: "Why is the negative PVGO misleading? Does Northstar have positive growth opportunities in Years 1–3?",
      val: s4,
      set: setS4,
    },
  ];

  const allFilled = sections.every((s) => s.val.trim().length >= 20);

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Round 7 · Investment Committee Memo
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        Write a structured recommendation citing your accepted calculations.
        Reference: P₀ ≈ ${base.totalValue.toFixed(2)}, TV ≈ $
        {base.terminalValue.toFixed(2)}, TV share ≈{" "}
        {(base.terminalShare * 100).toFixed(1)}%.
      </p>

      <div className="mt-5 space-y-5">
        {sections.map((s) => (
          <div key={s.key}>
            <label
              className="ops-body-strong text-[15px] text-slate-50"
              htmlFor={s.key}
            >
              {s.label}
            </label>
            <textarea
              id={s.key}
              value={s.val}
              onChange={(e) => s.set(e.target.value)}
              disabled={submitted}
              rows={3}
              placeholder={s.ph}
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30 disabled:cursor-default"
            />
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={() => {
            setSubmitted(true);
            onComplete();
          }}
          disabled={!allFilled}
          className={cn(
            "mt-5 rounded-full border px-5 py-2.5 text-[14px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            allFilled
              ? "border-accent-cyan bg-accent-cyan text-ink-950 hover:bg-accent-cyan/90"
              : "cursor-not-allowed border-white/10 text-slate-500 opacity-60",
          )}
        >
          Submit memo
        </button>
      ) : (
        <div className="mt-5 ops-definition-card p-5">
          <div className="ops-caption text-[11px] text-accent-green">
            Memo submitted
          </div>
          <p className="ops-definition mt-2.5 text-[16px]">
            Your memo is recorded. Key results: P₀ ≈ $
            {base.totalValue.toFixed(2)}, TV ≈ $
            {(base.terminalShare * 100).toFixed(1)}% of value. Higher early
            payout destroys value (ROE 15% &gt; r 10%). Mature payout is
            value-neutral (ROE = r). PVGO shortcut fails because EPS₁ = $15 is
            temporary. Equity valuation requires judgment about which growth is
            temporary, which earnings are sustainable, and how sensitive the
            conclusion is to r.
          </p>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== Main Case Component =====================

export default function NorthstarCase() {
  const reduce = useReducedMotion();
  const [round, setRound] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const complete = useCallback((r: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(r);
      if (r < 7 && !next.has(r + 1)) setRound(r + 1);
      return next;
    });
  }, []);

  const maxUnlocked = Math.max(
    1,
    ...Array.from(completed)
      .map((r) => r + 1)
      .filter((r) => r <= 7),
  );

  return (
    <div className="space-y-8">
      <RoundTabs
        round={round}
        setRound={setRound}
        completed={completed}
        maxUnlocked={maxUnlocked}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {round === 1 && <ForecastWorksheet onComplete={() => complete(1)} />}
          {round === 2 && (
            <TerminalValueWorksheet onComplete={() => complete(2)} />
          )}
          {round === 3 && <DCFWorksheet onComplete={() => complete(3)} />}
          {round === 4 && (
            <PayoutPolicyAnalysis onComplete={() => complete(4)} />
          )}
          {round === 5 && (
            <CostOfEquityStressWorksheet onComplete={() => complete(5)} />
          )}
          {round === 6 && (
            <AnalystErrorDiagnosis onComplete={() => complete(6)} />
          )}
          {round === 7 && <MemoBuilder onComplete={() => complete(7)} />}
        </motion.div>
      </AnimatePresence>

      {/* Advanced challenge */}
      {completed.has(5) && (
        <div className="mt-8">
          <h3 className="ops-interactive-title mb-4 text-lg text-white">
            Challenge: Market Expectations Shock
          </h3>
          <MarketExpectationsChallenge onComplete={() => complete(6)} />
        </div>
      )}
    </div>
  );
}
