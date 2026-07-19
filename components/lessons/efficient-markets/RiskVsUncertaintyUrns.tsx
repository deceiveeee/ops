"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Choice = "A" | "B" | "indifferent";

const APPLICATIONS = [
  "Unresolved litigation where the ruling and the damages are both uncertain",
  "Untested technology that may scale, may fail, or may take years to prove in",
  "Pending regulation whose scope and severity have not been written yet",
  "A new business model with no close historical analog",
  "Unprecedented macroeconomic disruption — pandemics, wars, regime changes",
];

export default function RiskVsUncertaintyUrns() {
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [revealDetails, setRevealDetails] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Two games. Same expected payoff if the urns are balanced. Different information about the
          probabilities. Which feels more comfortable?
        </p>
      </div>

      {/* Two urns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Urn A */}
        <button type="button" onClick={() => { setChoice("A"); setRevealDetails(true); }}
          aria-pressed={choice === "A"}
          className={cn("rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            choice === "A" ? "border-accent-cyan/60 bg-accent-cyan/[0.08]" : "border-accent-cyan/25 bg-accent-cyan/[0.04] hover:border-accent-cyan/45")}>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Urn A · known risk</div>
          <div className="mt-3 flex items-center justify-center">
            <UrnVisual red={50} black={50} known />
          </div>
          <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-100">
            50 red balls. 50 black balls. Exact probabilities known.
          </p>
          <p className="ops-body mt-1 font-mono text-[12px] text-slate-300">
            P(red) = 50% · P(black) = 50%
          </p>
        </button>

        {/* Urn B */}
        <button type="button" onClick={() => { setChoice("B"); setRevealDetails(true); }}
          aria-pressed={choice === "B"}
          className={cn("rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            choice === "B" ? "border-accent-purple/60 bg-accent-purple/[0.08]" : "border-accent-purple/25 bg-accent-purple/[0.04] hover:border-accent-purple/45")}>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-purple">Urn B · uncertainty</div>
          <div className="mt-3 flex items-center justify-center">
            <UrnVisual red={50} black={50} known={false} />
          </div>
          <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-100">
            100 balls, each red or black. Proportions unknown. Could be anything from 0 / 100 to 100 / 0.
          </p>
          <p className="ops-body mt-1 font-mono text-[12px] text-slate-300">
            P(red) = ? · P(black) = ?
          </p>
        </button>
      </div>

      {/* Optional indifferent */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <button type="button" onClick={() => { setChoice("indifferent"); setRevealDetails(true); }}
          aria-pressed={choice === "indifferent"}
          className={cn("w-full rounded-xl border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            choice === "indifferent" ? "border-accent-amber/40 bg-accent-amber/[0.08] text-accent-amber" : "border-white/15 text-slate-200 hover:border-white/30")}>
          I am indifferent — same expected payoff
        </button>
      </div>

      {/* Reveal */}
      <AnimatePresence>
        {revealDetails && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4">
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                Your reaction
              </div>
              <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-100">
                {choice === "A" && (
                  <>You preferred the urn with known probabilities. This is the most common choice. Investors often accept a lower expected return in exchange for measurable risk, and demand a premium to bear uncertainty whose probabilities cannot be estimated reliably.</>
                )}
                {choice === "B" && (
                  <>You preferred the urn with unknown proportions. Unusual — but defensible if you reason that with no information, the expected split is symmetric. Most people still prefer the known urn even when the math is identical.</>
                )}
                {choice === "indifferent" && (
                  <>You treated the two urns as equivalent. Mathematically this is defensible if you assume no information about Urn B implies a uniform prior. Most real investors still react differently to the two cases — which is the central observation.</>
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[17px] leading-[1.5] text-white">
                Quantifiable risk and unquantifiable uncertainty are not psychologically or
                financially identical.
              </p>
              <p className="ops-body mt-2 text-[14px] leading-[1.65] text-slate-200">
                Both urns offer the same expected payoff under neutral assumptions. But investors
                consistently treat them differently. An asset whose outcomes can be modeled
                statistically is easier to underwrite, hedge, and price than an asset whose
                possible outcomes cannot be estimated reliably.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applications */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Where uncertainty shows up in investing
        </div>
        <ul className="mt-3 space-y-2">
          {APPLICATIONS.map((a) => (
            <li key={a} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-purple" aria-hidden />{a}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          An asset with measurable volatility may be easier to evaluate than an asset whose possible
          outcomes cannot be estimated reliably. The price discount an investor demands for
          uncertainty can look like a free return to an analyst who mistakes it for ordinary risk.
        </p>
      </div>
    </div>
  );
}

function UrnVisual({ red, black, known }: { red: number; black: number; known: boolean }) {
  // Render a stylized urn with colored dots
  const dots: { color: string; opacity: number }[] = [];
  // Visualize proportionally
  const redShare = red / (red + black);
  for (let i = 0; i < 12; i++) {
    const isRed = (i / 12) < redShare;
    dots.push({
      color: isRed ? "#f87171" : "#475569",
      opacity: known ? 1 : 0.55,
    });
  }
  // Shuffle slightly for natural look but deterministically
  const arranged = known ? dots : [...dots].reverse();
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 140 110" className="w-full max-w-[180px]" role="img" aria-label={known ? "Urn with 50 red and 50 black balls" : "Urn with unknown mix of red and black balls"}>
        {/* Urn outline */}
        <path d="M 25 30 L 30 95 Q 30 100 35 100 L 105 100 Q 110 100 110 95 L 115 30 Z"
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
        <ellipse cx={70} cy={30} rx={45} ry={6} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />

        {/* Balls grid inside */}
        {arranged.map((d, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const cx = 40 + col * 17;
          const cy = 50 + row * 14;
          return <circle key={i} cx={cx} cy={cy} r={5.5} fill={d.color} opacity={d.opacity} />;
        })}
      </svg>
    </div>
  );
}
