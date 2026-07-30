"use client";

import { useState } from "react";
import { Reveal, InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 14 — The same belief does not create the same portfolio.
 * Compare Investor A vs Investor B across 5 dimensions.
 */

type DimId = "position-size" | "holdings" | "holding-period" | "turnover" | "use";

const DIMENSIONS: { id: DimId; label: string; a: string; b: string }[] = [
  {
    id: "position-size",
    label: "Position size",
    a: "Investor A may support a larger but still controlled allocation.",
    b: "Investor B may require a much smaller allocation or no position.",
  },
  {
    id: "holdings",
    label: "Number of holdings",
    a: "Diversification remains important; A’s larger loss capacity allows some concentration.",
    b: "B’s limited loss capacity makes diversification especially important.",
  },
  {
    id: "holding-period",
    label: "Expected holding period",
    a: "A can wait several years for the overreaction to correct.",
    b: "The strategy’s correction period may exceed B’s available horizon.",
  },
  {
    id: "turnover",
    label: "Turnover",
    a: "A’s low need for trading keeps costs and taxes down.",
    b: "Frequent changes may create costs and tax effects, particularly for B.",
  },
  {
    id: "use",
    label: "Use of the strategy",
    a: "Investor A may be able to implement the belief.",
    b: "Investor B may share the belief but still be unable to use the strategy responsibly.",
  },
];

const INVESTORS = [
  {
    id: "A",
    name: "Investor A",
    accent: "green",
    rows: [
      "20-year horizon",
      "stable income",
      "no major near-term cash need",
      "moderate tolerance for losses",
      "diversified existing portfolio",
      "low need for frequent trading",
      "ability to wait several years for correction",
    ],
  },
  {
    id: "B",
    name: "Investor B",
    accent: "amber",
    rows: [
      "18-month horizon",
      "major cash requirement approaching",
      "low tolerance for losses",
      "concentrated current holdings",
      "taxable account",
      "limited ability to wait through prolonged declines",
    ],
  },
] as const;

const accentText: Record<string, string> = {
  green: "text-accent-green",
  amber: "text-accent-amber",
};
const accentRing: Record<string, string> = {
  green: "border-accent-green/30",
  amber: "border-accent-amber/30",
};

export default function SameBeliefDifferentInvestor() {
  const [revealed, setRevealed] = useState<DimId | null>(null);

  return (
    <>
      <Reveal>
        <DefinitionCard term="Shared core belief">
          Investors overreact to major negative news.
        </DefinitionCard>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {INVESTORS.map((inv) => (
            <div
              key={inv.id}
              className={cn(
                "rounded-2xl border bg-white/[0.02] p-5",
                accentRing[inv.accent],
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="ops-interactive-title text-lg text-white">
                  {inv.name}
                </h3>
                <span
                  className={cn(
                    "font-sans text-[11px] uppercase tracking-[0.14em]",
                    accentText[inv.accent],
                  )}
                >
                  Profile
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {inv.rows.map((r) => (
                  <li
                    key={r}
                    className="ops-body flex items-start gap-2 text-[14px] text-slate-200"
                  >
                    <span
                      className={cn(
                        "mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                        inv.accent === "green" ? "bg-accent-green" : "bg-accent-amber",
                      )}
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <InteractiveFrame>
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Compare across five implementation dimensions
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            {DIMENSIONS.map((d, i) => {
              const isOpen = revealed === d.id;
              return (
                <div
                  key={d.id}
                  className={cn(
                    "border-b border-white/5 last:border-b-0",
                    i % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.01]",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setRevealed(isOpen ? null : d.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                  >
                    <span className="text-[15px] font-medium text-slate-100">
                      {d.label}
                    </span>
                    <span
                      className={cn(
                        "font-sans text-[12px] text-accent-amber transition-transform",
                        isOpen && "rotate-90",
                      )}
                      aria-hidden
                    >
                      →
                    </span>
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-accent-green/20 bg-accent-green/[0.04] p-3">
                        <div className={cn("ops-caption text-[10px]", accentText.green)}>
                          Investor A
                        </div>
                        <p className="ops-body mt-1 text-[14px] text-slate-100">
                          {d.a}
                        </p>
                      </div>
                      <div className="rounded-lg border border-accent-amber/20 bg-accent-amber/[0.04] p-3">
                        <div className={cn("ops-caption text-[10px]", accentText.amber)}>
                          Investor B
                        </div>
                        <p className="ops-body mt-1 text-[14px] text-slate-100">
                          {d.b}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </InteractiveFrame>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <DefinitionCard>
          The same belief can produce different position sizes, different
          portfolios, different implementation rules, or no trade at all.
        </DefinitionCard>
      </Reveal>
    </>
  );
}
