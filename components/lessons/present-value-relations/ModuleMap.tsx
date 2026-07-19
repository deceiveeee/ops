"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePVProgress } from "@/lib/pv-progress";
import { useState } from "react";

type Node = {
  n: number;
  title: string;
  subtitle: string;
  slug: string;
  tone: "cyan" | "purple" | "amber" | "green";
};

const NODES: Node[] = [
  { n: 1, title: "Cashflow Canyon", subtitle: "Assets, timelines, and NPV", slug: "present-value-cashflows-assets-npv", tone: "cyan" },
  { n: 2, title: "Perpetuity Port", subtitle: "Special cashflows and compounding", slug: "present-value-perpetuities-annuities-compounding", tone: "purple" },
  { n: 3, title: "Inflation Ridge", subtitle: "Real vs nominal value", slug: "present-value-inflation-real-nominal", tone: "amber" },
  { n: 4, title: "CFO Decision Room", subtitle: "Integrated final challenge", slug: "present-value-cfo-decision-room", tone: "green" },
];

const toneMap: Record<Node["tone"], { border: string; text: string; glow: string; dot: string }> = {
  cyan: { border: "border-accent-cyan/50", text: "text-accent-cyan", glow: "bg-accent-cyan/10", dot: "bg-accent-cyan" },
  purple: { border: "border-accent-purple/50", text: "text-accent-purple", glow: "bg-accent-purple/10", dot: "bg-accent-purple" },
  amber: { border: "border-accent-amber/50", text: "text-accent-amber", glow: "bg-accent-amber/10", dot: "bg-accent-amber" },
  green: { border: "border-accent-green/50", text: "text-accent-green", glow: "bg-accent-green/10", dot: "bg-accent-green" },
};

export default function ModuleMap() {
  const { capstoneUnlocked, isComplete, ready } = usePVProgress();
  const [gateMsg, setGateMsg] = useState(false);
  const unlocked = !ready || capstoneUnlocked();

  return (
    <section id="module-map" className="scroll-mt-24">
      <div className="ops-eyebrow flex items-center gap-3 text-xs">
        <span className="tabular-nums text-accent-cyan">M2</span>
        <span className="h-px w-8 bg-white/30" />
        <span>Module map</span>
      </div>
      <h2 className="ops-section-title mt-4 text-3xl sm:text-4xl">Present Value Relations</h2>
      <p className="ops-body mt-3 max-w-2xl text-[16px] text-slate-300">
        Four connected lessons turn future cashflows into value today. Complete the first three to unlock the
        integrated CFO Decision Room.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {NODES.map((node) => {
          const t = toneMap[node.tone];
          const locked = node.n === 4 && !unlocked;
          const done = node.n < 4 && isComplete(node.slug);
          const body = (
            <div
              className={cn(
                "group relative h-full overflow-hidden rounded-2xl border bg-white/[0.03] p-5 transition-all",
                locked
                  ? "border-white/10 opacity-70"
                  : cn("hover:bg-white/[0.05]", done ? "border-accent-green/40" : t.border),
              )}
            >
              <span className={cn("pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl", locked ? "bg-white/5" : t.glow)} />
              <div className="flex items-center justify-between">
                <span className={cn("ops-caption text-[11px]", locked ? "text-slate-500" : t.text)}>
                  Node {String(node.n).padStart(2, "0")}
                </span>
                {locked && <span className="text-base" aria-hidden>🔒</span>}
                {!locked && done && <span className="ops-caption text-[11px] text-accent-green">✓ complete</span>}
              </div>
              <div className="ops-interactive-title mt-4 text-xl text-white">{node.title}</div>
              <div className="ops-body mt-1.5 text-[14px] text-slate-300">{node.subtitle}</div>
              <div className="mt-5 flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", locked ? "bg-slate-600" : t.dot)} />
                <span className="ops-caption text-[11px] text-slate-400">
                  {locked ? "Locked" : done ? "Mastered" : "Ready"}
                </span>
              </div>
            </div>
          );

          if (locked) {
            return (
              <button
                key={node.slug}
                type="button"
                onClick={() => setGateMsg(true)}
                className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                aria-label={`${node.title} — locked. Complete the three Present Value lessons to unlock the CFO Decision Room.`}
              >
                {body}
              </button>
            );
          }
          return (
            <Link key={node.slug} href={`/lessons/${node.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
              {body}
            </Link>
          );
        })}
      </div>

      {gateMsg && (
        <div className="ops-interactive-frame mt-5 p-5" role="status">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">
              Locked
            </span>
          </div>
          <p className="ops-body-strong mt-3 text-[16px] text-slate-50">
            Complete the three Present Value lessons to unlock the CFO Decision Room.
          </p>
        </div>
      )}
    </section>
  );
}
