"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";

type CompKey = "a" | "b" | "c" | "d";

type Comparable = {
  key: CompKey;
  name: string;
  business: string;
  beta: number;
  concentration: string;
  cyclicality: string;
  geography: string;
  leverage: string;
  size: string;
  fit: "best" | "partial" | "weak";
  reasoning: string;
};

const RF = 4;
const MRP = 6;

// Context: a diversified industrial company is evaluating a publishing / information-services project.
// The relevant pure play is a company whose value comes primarily from that same activity.
const COMPS: Comparable[] = [
  {
    key: "a",
    name: "Company A · Pure-play publisher",
    business: "Publishing, data, and information services — the same activity as the proposed project.",
    beta: 1.1,
    concentration: "100% publishing and information",
    cyclicality: "Moderate — recurring subscriptions dampen cyclicality",
    geography: "Same region as the project",
    leverage: "Moderate, similar to the project's planned structure",
    size: "Mid-cap, comparable to the project's scale",
    fit: "best",
    reasoning:
      "Company A is concentrated entirely in the same business activity. Its beta reflects the systematic risk of publishing and information services — exactly the risk the project carries. It is the most informative comparable, though still imperfect: its exact product mix, growth stage, and competitive position differ from the project.",
  },
  {
    key: "b",
    name: "Company B · Diversified media conglomerate",
    business: "Publishing plus broadcasting, film, and theme parks.",
    beta: 1.0,
    concentration: "~30% publishing, the rest unrelated divisions",
    cyclicality: "Mixed — advertising-sensitive divisions are highly cyclical",
    geography: "Global, including faster-growing emerging markets",
    leverage: "Higher leverage than the project",
    size: "Large-cap",
    fit: "partial",
    reasoning:
      "Company B contains a publishing division, but its beta blends several unrelated businesses. The blended beta reflects broadcasting, film, and theme parks as much as publishing — activities the project will not undertake. It is less informative than a focused comparable.",
  },
  {
    key: "c",
    name: "Company C · Advertising agency",
    business: "Advertising and marketing services — media-adjacent but a different activity.",
    beta: 1.5,
    concentration: "100% advertising services",
    cyclicality: "Highly cyclical — advertising spending falls sharply in recessions",
    geography: "Global",
    leverage: "Low",
    size: "Mid-cap",
    fit: "weak",
    reasoning:
      "Company C is focused, but on a different activity. Advertising agencies are far more cyclical than subscription-based publishing. Using its beta would import systematic risk that the project does not actually carry.",
  },
  {
    key: "d",
    name: "Company D · Parent company itself",
    business: "The diversified industrial company evaluating the project.",
    beta: 0.8,
    concentration: "Industrial manufacturing, energy, and defense",
    cyclicality: "Industrial-cycle exposure",
    geography: "Global",
    leverage: "Moderate",
    size: "Large-cap",
    fit: "weak",
    reasoning:
      "The parent company's beta reflects its existing industrial businesses, not publishing. Using it assumes the new activity carries the same systematic risk as the company's legacy operations — precisely the assumption the project-specific rate is meant to test.",
  },
];

const fitTone: Record<string, { text: string; border: string; bg: string; label: string }> = {
  best: { text: "text-accent-green", border: "border-accent-green/40", bg: "bg-accent-green/[0.06]", label: "Most informative" },
  partial: { text: "text-accent-amber", border: "border-accent-amber/40", bg: "bg-accent-amber/[0.06]", label: "Partially informative" },
  weak: { text: "text-accent-red", border: "border-accent-red/40", bg: "bg-accent-red/[0.06]", label: "Weak proxy" },
};

export default function PurePlayComparableSelector() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<CompKey | null>(null);
  const comp = selected ? COMPS.find((c) => c.key === selected)! : null;
  const tone = comp ? fitTone[comp.fit] : null;

  const requiredReturn = comp ? RF + comp.beta * MRP : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          The analytical problem
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.65] text-slate-100">
          A diversified industrial company is evaluating a new{" "}
          <span className="text-white">publishing and information-services</span> project. Which
          publicly traded company provides the most relevant evidence for the project&apos;s
        </p>
        <div className="mt-3">
          <InlineMath>{String.raw`\beta_{\text{project}}`}</InlineMath>
          <span className="text-slate-300">?</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COMPS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setSelected(c.key)}
            className={cn(
              "rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              selected === c.key
                ? cn(fitTone[c.fit].border, fitTone[c.fit].bg)
                : "border-white/12 bg-white/[0.02] hover:border-white/25",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-[15px] font-medium text-white">{c.name}</span>
              <span className={cn("font-sans text-[11px]", selected === c.key ? fitTone[c.fit].text : "text-slate-400")}>
                β = {c.beta}
              </span>
            </div>
            <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">{c.business}</p>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {comp && tone && requiredReturn !== null && (
          <motion.div
            key={comp.key}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : undefined}
            transition={{ duration: 0.25 }}
            className={cn("rounded-2xl border p-5 sm:p-6", tone.border, tone.bg)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={cn("font-sans text-[12px] uppercase tracking-[0.16em]", tone.text)}>
                {tone.label}
              </span>
              <span className="font-sans text-[13px] tabular-nums text-slate-300">
                required return ≈ {RF}% + {comp.beta}×{MRP}% = {(RF + comp.beta * MRP).toFixed(1)}%
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail label="Business concentration" value={comp.concentration} />
              <Detail label="Cyclicality" value={comp.cyclicality} />
              <Detail label="Geography" value={comp.geography} />
              <Detail label="Leverage" value={comp.leverage} />
              <Detail label="Size" value={comp.size} />
              <Detail label="Beta" value={`${comp.beta}`} />
            </div>

            <p className="ops-body mt-4 text-[15px] leading-[1.7] text-slate-100">
              {comp.reasoning}
            </p>

            {comp.fit === "best" && (
              <div className="mt-4 rounded-xl border border-accent-green/25 bg-ink-950/40 px-4 py-4">
                <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
                  A pure play is a company whose value is primarily generated by the same
                  business activity as the project being evaluated. Even the best comparable is
                  not perfect — its beta is <span className="text-white">evidence</span>, not exact
                  truth. The investor uses it to construct a reasonable discount-rate range and
                  tests whether the investment conclusion survives across that range.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Practical sequence
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "Identify the economic activity generating the cash flows.",
            "Find publicly traded companies concentrated in that activity.",
            "Examine whether their business model, customers, cyclicality, operating leverage, geography, and growth stage are comparable.",
            "Use their betas as evidence, not as exact truth.",
            "Construct a reasonable discount-rate range.",
            "Test whether the investment conclusion changes across the range.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1 font-sans text-[11px] text-accent-amber">
                {i + 1}
              </span>
              <span className="text-[15px] leading-[1.6] text-slate-200">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2.5">
      <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 text-[13px] text-slate-100">{value}</div>
    </div>
  );
}
