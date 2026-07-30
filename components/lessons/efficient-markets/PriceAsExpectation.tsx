"use client";

import { cn } from "@/lib/utils";

type InfoType = {
  label: string;
  detail: string;
  incorporated: "known" | "quick" | "partial" | "uncertain" | "edge";
  pct: number;
};

const ITEMS: InfoType[] = [
  { label: "Last year's revenue", detail: "Almost certainly known and reflected in the current price.", incorporated: "known", pct: 100 },
  { label: "Latest public earnings release", detail: "Usually incorporated within minutes to hours of publication.", incorporated: "quick", pct: 90 },
  { label: "A widely discussed product launch", detail: "At least partially incorporated once announced publicly.", incorporated: "partial", pct: 65 },
  { label: "The product's eventual commercial success", detail: "Still uncertain — the outcome has not occurred.", incorporated: "uncertain", pct: 30 },
  { label: "A superior interpretation of available evidence", detail: "Potentially not fully reflected if the insight is genuinely differentiated.", incorporated: "edge", pct: 15 },
];

const toneText: Record<string, string> = {
  known: "text-accent-green", quick: "text-accent-green", partial: "text-accent-amber",
  uncertain: "text-accent-red", edge: "text-accent-cyan",
};
const toneBg: Record<string, string> = {
  known: "bg-accent-green/30", quick: "bg-accent-green/25", partial: "bg-accent-amber/25",
  uncertain: "bg-accent-red/25", edge: "bg-accent-cyan/25",
};
const toneLabel: Record<string, string> = {
  known: "Fully known", quick: "Quickly incorporated", partial: "Partially incorporated",
  uncertain: "Still uncertain", edge: "Potential edge",
};

export default function PriceAsExpectation() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
          A stock price is not simply a score for past company performance. It reflects{" "}
          <span className="text-white">market expectations</span> about future revenue, margins,
          competitive conditions, growth opportunities, interest rates, risk, and the probability of
          different outcomes.
        </p>
      </div>

      {/* Incorporation spectrum */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          How much is already in the price?
        </div>
        <div className="mt-4 space-y-4">
          {ITEMS.map((item) => (
            <div key={item.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-medium text-white">{item.label}</span>
                <span className={cn("font-sans text-[11px] uppercase tracking-[0.14em]", toneText[item.incorporated])}>
                  {toneLabel[item.incorporated]}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-[1.5] text-slate-300">{item.detail}</p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/8">
                <div className={cn("h-full rounded-full", toneBg[item.incorporated])}
                  style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.14em] text-slate-500">
          <span>← Not in price</span>
          <span>Fully reflected →</span>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          Information can be public without its long-term implications being perfectly understood.
          That gap — between what is known and what the price fully captures — is where a
          differentiated investor insight might exist.
        </p>
      </div>
    </div>
  );
}
