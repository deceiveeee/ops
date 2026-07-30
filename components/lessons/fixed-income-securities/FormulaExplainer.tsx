"use client";

import { InlineMath, BlockMath } from "@/components/ui/Math";
import { MathText } from "@/components/ui/MathText";
import { cn } from "@/lib/utils";

export type FormulaVariable = { symbol: string; description: string };

/**
 * Rich formula card: LaTeX formula + plain-English meaning + variable definitions
 * + numerical substitution + result + interpretation.
 * Replaces plain-text/pseudo-formula rendering with real LaTeX.
 */
export default function FormulaExplainer({
  formula,
  meaning,
  variables,
  substitution,
  result,
  interpretation,
  label,
  tone = "cyan",
  className,
}: {
  formula: string; // LaTeX
  meaning?: string;
  variables?: FormulaVariable[];
  substitution?: string; // LaTeX
  result?: string;
  interpretation?: string;
  label?: string;
  tone?: "cyan" | "amber" | "red" | "green" | "purple";
  className?: string;
}) {
  const toneText: Record<string, string> = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    red: "text-accent-red",
    green: "text-accent-green",
    purple: "text-accent-purple",
  };
  const toneBorder: Record<string, string> = {
    cyan: "border-accent-cyan/25",
    amber: "border-accent-amber/25",
    red: "border-accent-red/25",
    green: "border-accent-green/25",
    purple: "border-accent-purple/25",
  };

  return (
    <div className={cn("ops-interactive-frame relative overflow-hidden p-5 sm:p-6", toneBorder[tone], className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent" />
      {label && (
        <div className={cn("ops-caption mb-4 flex items-center gap-2 text-[11px]", toneText[tone])}>
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" aria-hidden />
          {label}
        </div>
      )}

      {/* The formula itself — rendered as real LaTeX */}
      <div className="rounded-xl border border-white/10 bg-ink-950/50 px-4 py-5 text-slate-50">
        <BlockMath>{formula}</BlockMath>
      </div>

      {meaning && (
        <p className="ops-definition mt-4 text-[16px] leading-7">
          <MathText>{meaning}</MathText>
        </p>
      )}

      {variables && variables.length > 0 && (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {variables.map((v) => (
            <div key={v.symbol} className="flex items-start gap-2.5">
              <dt className="mt-0.5 flex-shrink-0 font-sans text-[15px] text-slate-200">
                <InlineMath>{v.symbol}</InlineMath>
              </dt>
              <dd className="ops-body text-[14px] leading-6 text-slate-300">
                <MathText>{v.description}</MathText>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(substitution || result) && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          {substitution && (
            <div className="text-slate-200">
              <BlockMath>{substitution}</BlockMath>
            </div>
          )}
          {result && (
            <p className="ops-body-strong mt-2 text-center text-[16px]">
              <span className="text-accent-green">
                <MathText>{result}</MathText>
              </span>
            </p>
          )}
        </div>
      )}

      {interpretation && (
        <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
          <MathText>{interpretation}</MathText>
        </p>
      )}
    </div>
  );
}
