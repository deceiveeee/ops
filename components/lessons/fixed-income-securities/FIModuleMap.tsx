"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Node = {
  n: number;
  title: string;
  subtitle: string;
  slug: string;
  tone: "purple" | "cyan" | "amber" | "green";
  comingSoon?: boolean;
};

const NODES: Node[] = [
  {
    n: 1,
    title: "Bond Markets & Discount Bonds",
    subtitle: "The market system, cash flows, and zero-coupon valuation",
    slug: "fixed-income-bond-markets-cash-flows-discount-bonds",
    tone: "purple",
  },
  {
    n: 2,
    title: "Spot Rates & Yield Curves",
    subtitle: "Forwards, YTM, replication, and arbitrage",
    slug: "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
    tone: "cyan",
  },
  {
    n: 3,
    title: "Arbitrage, Duration & Convexity",
    subtitle: "Law of one price, mispricing signals, and interest-rate risk",
    slug: "fixed-income-law-one-price-arbitrage-duration-convexity",
    tone: "amber",
  },
  {
    n: 4,
    title: "Credit Risk & Securitization",
    subtitle: "Corporate bonds, default risk, spreads, and structured credit",
    slug: "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
    tone: "green",
  },
];

const toneMap: Record<
  Node["tone"],
  { border: string; text: string; glow: string; dot: string }
> = {
  cyan: {
    border: "border-accent-cyan/50",
    text: "text-accent-cyan",
    glow: "bg-accent-cyan/10",
    dot: "bg-accent-cyan",
  },
  purple: {
    border: "border-accent-purple/50",
    text: "text-accent-purple",
    glow: "bg-accent-purple/10",
    dot: "bg-accent-purple",
  },
  amber: {
    border: "border-accent-amber/50",
    text: "text-accent-amber",
    glow: "bg-accent-amber/10",
    dot: "bg-accent-amber",
  },
  green: {
    border: "border-accent-green/50",
    text: "text-accent-green",
    glow: "bg-accent-green/10",
    dot: "bg-accent-green",
  },
};

export default function FIModuleMap() {
  return (
    <section id="module-map" className="scroll-mt-24">
      <div className="ops-eyebrow flex items-center gap-3 text-xs">
        <span className="tabular-nums text-accent-purple">M3</span>
        <span className="h-px w-8 bg-white/30" />
        <span>Module map</span>
      </div>
      <h2 className="ops-section-title mt-4 text-3xl sm:text-4xl">
        Fixed-Income Securities
      </h2>
      <p className="ops-body mt-3 max-w-2xl text-[16px] text-slate-300">
        Bonds move the financial system. Two lessons build the valuation
        machinery now; duration, convexity, credit risk, and securitization
        arrive in upcoming lessons.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {NODES.map((node) => {
          const t = toneMap[node.tone];
          return (
            <Link
              key={node.slug}
              href={`/lessons/${node.slug}`}
              className={cn(
                "group relative block h-full overflow-hidden rounded-2xl border bg-white/[0.03] p-5 transition-all hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                node.comingSoon ? "border-white/10 opacity-70" : t.border,
              )}
            >
              <span
                className={cn(
                  "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl",
                  node.comingSoon ? "bg-white/5" : t.glow,
                )}
              />
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "ops-caption text-[11px]",
                    node.comingSoon ? "text-slate-500" : t.text,
                  )}
                >
                  Node {String(node.n).padStart(2, "0")}
                </span>
                {node.comingSoon && (
                  <span className="ops-caption text-[11px] text-slate-500">
                    Coming soon
                  </span>
                )}
              </div>
              <div className="ops-interactive-title mt-4 text-lg text-white">
                {node.title}
              </div>
              <div className="ops-body mt-1.5 text-[14px] text-slate-300">
                {node.subtitle}
              </div>
              <div className="mt-5 flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    node.comingSoon ? "bg-slate-600" : t.dot,
                  )}
                />
                <span className="ops-caption text-[11px] text-slate-400">
                  {node.comingSoon ? "Upcoming" : "Ready"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
