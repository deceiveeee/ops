"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

const COST = 100;
const EXPECTED = 110;
const PROJECT_RETURN = ((EXPECTED - COST) / COST) * 100; // 10%

type Env = "A" | "B";

const ENVS: Record<
  Env,
  { rate: number; label: string; tone: "green" | "red"; blurb: string }
> = {
  A: {
    rate: 5,
    label: "Environment A",
    tone: "green",
    blurb:
      "Comparable-risk investments offer an expected return of 5%. The project's expected 10% clears the opportunity cost, so it is attractive relative to the alternative.",
  },
  B: {
    rate: 15,
    label: "Environment B",
    tone: "red",
    blurb:
      "Comparable-risk investments offer an expected return of 15%. The project's expected 10% is below the opportunity cost, so the same deal is now inadequate.",
  },
};

function ChoiceChip({
  active,
  tone,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  tone: "idle" | "amber" | "green" | "red";
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
        tone === "idle" &&
          "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
        tone === "amber" && "border-accent-amber bg-accent-amber/15 text-accent-amber",
        tone === "green" && "border-accent-green bg-accent-green/15 text-accent-green",
        tone === "red" && "border-accent-red bg-accent-red/15 text-accent-red",
      )}
    >
      {children}
    </button>
  );
}

export default function OpportunityCostOpening() {
  const [guess, setGuess] = useState<string | null>(null);
  const [env, setEnv] = useState<Env>("A");
  const revealed = guess !== null;

  const current = ENVS[env];
  const comparableFuture = COST * (1 + current.rate / 100);
  const beats = PROJECT_RETURN > current.rate;

  return (
    <div className="space-y-6">
      {/* The deal */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          The opportunity
        </div>
        <p className="ops-body mt-3 text-[17px] leading-[1.65] text-slate-100">
          A company can invest{" "}
          <span className="font-sans text-accent-amber">$100 today</span> in a project
          that is <span className="text-white">expected</span> to produce{" "}
          <span className="font-sans text-accent-amber">$110 one year from now</span>.
        </p>
        <div className="mt-4">
          <BlockMath>
            {String.raw`\text{expected return} = \frac{110 - 100}{100} = 10\%`}
          </BlockMath>
        </div>
      </div>

      {/* Initial decision */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="text-[16px] leading-[1.6] text-slate-200">
          Before any analysis: is a 10% expected return a good investment?
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ChoiceChip
            active={guess === "yes"}
            tone={revealed ? (guess === "yes" ? "amber" : "idle") : "idle"}
            disabled={revealed}
            onClick={() => setGuess("yes")}
          >
            Yes, attractive
          </ChoiceChip>
          <ChoiceChip
            active={guess === "no"}
            tone={revealed ? (guess === "no" ? "amber" : "idle") : "idle"}
            disabled={revealed}
            onClick={() => setGuess("no")}
          >
            No, not attractive
          </ChoiceChip>
          <ChoiceChip
            active={guess === "depends"}
            tone={revealed ? (guess === "depends" ? "amber" : "idle") : "idle"}
            disabled={revealed}
            onClick={() => setGuess("depends")}
          >
            It depends on the alternative
          </ChoiceChip>
        </div>

        {revealed && (
          <Feedback status="info">
            A 10% expected return cannot be judged on its own. The right question is:
            <span className="text-white">
              {" "}
              what could the same capital earn elsewhere at comparable systematic risk?
            </span>{" "}
            That comparable return is the project&apos;s{" "}
            <InlineMath>{String.raw`\text{opportunity cost}`}</InlineMath>. Switch
            environments below to see how the identical deal flips from attractive to
            inadequate.
          </Feedback>
        )}
      </div>

      {/* Environment comparison — only after initial guess */}
      {revealed && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
            What else could your capital earn?
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Market environment">
            {(Object.keys(ENVS) as Env[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={env === key}
                onClick={() => setEnv(key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                  env === key
                    ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                    : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
                )}
              >
                {ENVS[key].label} · {ENVS[key].rate}%
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
              <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-slate-400">
                This project
              </div>
              <div className="mt-2 font-sans text-[15px] text-slate-100">
                <InlineMath>{String.raw`\frac{110}{100} - 1 = 10\%`}</InlineMath>
              </div>
            </div>
            <div
              className={cn(
                "rounded-xl border p-5",
                current.tone === "green"
                  ? "border-accent-green/30 bg-accent-green/[0.05]"
                  : "border-accent-red/30 bg-accent-red/[0.05]",
              )}
            >
              <div
                className={cn(
                  "font-sans text-[11px] uppercase tracking-[0.16em]",
                  current.tone === "green" ? "text-accent-green" : "text-accent-red",
                )}
              >
                Comparable-risk alternative
              </div>
              <div className="mt-2 font-sans text-[15px] text-slate-100">
                <InlineMath>
                  {String.raw`100 \times (1 + ${current.rate}\%) = \$${comparableFuture.toFixed(0)} \;\Rightarrow\; ${current.rate}\%`}
                </InlineMath>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div
            className={cn(
              "mt-5 rounded-xl border p-5",
              beats
                ? "border-accent-green/30 bg-accent-green/[0.06]"
                : "border-accent-red/30 bg-accent-red/[0.06]",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span
                className={cn(
                  "font-sans text-[12px] uppercase tracking-[0.16em]",
                  beats ? "text-accent-green" : "text-accent-red",
                )}
              >
                {beats ? "Attractive relative to alternative" : "Inadequate relative to alternative"}
              </span>
              <span className="font-sans text-[13px] tabular-nums text-slate-300">
                {PROJECT_RETURN.toFixed(0)}% vs {current.rate}%
              </span>
            </div>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
              {current.blurb}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
            <p className="ops-body text-[16px] leading-[1.6] text-white">
              Required conclusion
            </p>
            <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-200">
              A project&apos;s expected return cannot be evaluated by itself. It must be
              compared with the expected return available from other investments carrying
              similar systematic risk. That comparable return is the{" "}
              <span className="text-accent-amber">opportunity cost of capital</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
