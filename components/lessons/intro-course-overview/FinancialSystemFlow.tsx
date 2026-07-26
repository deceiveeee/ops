"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";

type NodeKey =
  | "households"
  | "corporations"
  | "intermediaries"
  | "capital"
  | "labor"
  | "product";

const NODES: Record<
  NodeKey,
  { label: string; x: number; y: number; body: string; links: NodeKey[] }
> = {
  households: {
    label: "Households",
    x: 150,
    y: 90,
    body: "Households earn income, consume products, save, borrow, and invest. They supply labor and capital.",
    links: ["corporations", "intermediaries", "capital", "labor", "product"],
  },
  corporations: {
    label: "Nonfinancial Corporations",
    x: 560,
    y: 90,
    body: "Nonfinancial corporations produce goods and services, hire labor, invest in real assets, raise money, and return cash to investors.",
    links: ["households", "intermediaries", "capital", "labor", "product"],
  },
  intermediaries: {
    label: "Financial Intermediaries",
    x: 355,
    y: 230,
    body: "Financial intermediaries include banks, funds, insurers, and other institutions that connect savers and borrowers or help transfer risk.",
    links: ["households", "corporations", "capital"],
  },
  capital: {
    label: "Capital Markets",
    x: 760,
    y: 230,
    body: "Capital markets are markets where financial assets such as stocks and bonds are issued and traded. They help determine prices for financial assets.",
    links: ["households", "corporations", "intermediaries"],
  },
  labor: {
    label: "Labor Markets",
    x: 150,
    y: 360,
    body: "Labor markets connect households that supply labor with firms that demand labor and pay wages.",
    links: ["households", "corporations"],
  },
  product: {
    label: "Product Markets",
    x: 560,
    y: 360,
    body: "Product markets connect firms that sell goods and services with households and businesses that buy them.",
    links: ["households", "corporations"],
  },
};

const ORDER: NodeKey[] = [
  "households",
  "corporations",
  "intermediaries",
  "capital",
  "labor",
  "product",
];

export default function FinancialSystemFlow({
  onAllVisited,
}: {
  onAllVisited?: () => void;
}) {
  const [active, setActive] = useState<NodeKey | null>(null);
  const [visited, setVisited] = useState<Set<NodeKey>>(new Set());
  const reduce = useReducedMotion();

  const select = (k: NodeKey) => {
    setActive(k);
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(k);
      if (next.size === ORDER.length) onAllVisited?.();
      return next;
    });
  };

  const allVisited = visited.size === ORDER.length;
  const activeLinks = active ? NODES[active].links : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <InteractiveFrame className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Financial system · flow model
            </span>
          </div>
          <span className="font-mono text-[12px] tabular-nums text-accent-cyan">
            {visited.size}/{ORDER.length} explored
          </span>
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 900 460"
            className="w-full min-w-[680px]"
            role="img"
            aria-label="Financial system flow diagram with six participants"
          >
            {/* boundary */}
            <rect
              x="20"
              y="30"
              width="860"
              height="360"
              rx="18"
              fill="none"
              stroke="rgba(148,163,184,0.5)"
              strokeDasharray="4 6"
            />
            <text
              x="34"
              y="24"
              className="fill-slate-500 font-mono"
              fontSize="13"
              letterSpacing="2"
            >
              FINANCIAL SYSTEM
            </text>

            {/* links */}
            {ORDER.flatMap((a) =>
              NODES[a].links.map((b) => {
                const from = NODES[a];
                const to = NODES[b];
                const isActive =
                  active &&
                  (a === active || b === active) &&
                  NODES[active].links.includes(a === active ? b : a);
                const key = [a, b].sort().join("-");
                return (
                  <line
                    key={key}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={
                      isActive
                        ? "rgba(34,211,238,0.85)"
                        : "rgba(148,163,184,0.55)"
                    }
                    strokeWidth={isActive ? 2.5 : 1.4}
                    strokeDasharray={isActive ? "0" : "3 5"}
                  />
                );
              }),
            )}

            {/* nodes */}
            {ORDER.map((k) => {
              const n = NODES[k];
              const isVisited = visited.has(k);
              const isActive = active === k;
              return (
                <g
                  key={k}
                  role="button"
                  tabIndex={0}
                  aria-label={n.label}
                  onClick={() => select(k)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(k);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isActive ? 36 : 30}
                    fill={
                      isActive
                        ? "rgba(34,211,238,0.22)"
                        : isVisited
                          ? "rgba(34,211,238,0.12)"
                          : "rgba(255,255,255,1)"
                    }
                    stroke={
                      isActive
                        ? "#22d3ee"
                        : isVisited
                          ? "rgba(34,211,238,0.85)"
                          : "rgba(0,0,0,0.35)"
                    }
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="transition-all"
                  />
                  <text
                    x={n.x}
                    y={n.y + (n.label.includes(" ") ? 50 : 58)}
                    textAnchor="middle"
                    className={cn(
                      "font-sans",
                      isActive ? "fill-accent-cyan" : "fill-slate-200",
                    )}
                    fontSize="17"
                    fontWeight={isActive ? 700 : 600}
                  >
                    {n.label.includes(" ") ? (
                      <>
                        <tspan x={n.x}>
                          {n.label.slice(0, n.label.indexOf(" "))}
                        </tspan>
                        <tspan x={n.x} dy={17}>
                          {n.label.slice(n.label.indexOf(" ") + 1)}
                        </tspan>
                      </>
                    ) : (
                      n.label
                    )}
                  </text>
                  {isVisited && (
                    <text
                      x={n.x + 24}
                      y={n.y - 20}
                      className="fill-accent-green font-mono"
                      fontSize="13"
                      aria-hidden
                    >
                      ✓
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <p className="ops-body mt-4 text-[14px] text-slate-300">
          Tap a node to inspect it. Lines highlight the flows connected to the
          active participant.
        </p>
      </InteractiveFrame>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="ops-interactive-frame p-6"
            >
              <div className="ops-caption text-[11px] text-accent-cyan">
                Participant
              </div>
              <div className="ops-interactive-title mt-2 text-xl">
                {NODES[active].label}
              </div>
              <p className="ops-body mt-3 text-[15px] text-slate-200">
                {NODES[active].body}
              </p>
            </motion.div>
          ) : (
            <div className="glass-panel p-6">
              <div className="ops-caption text-[11px] text-slate-500">
                Side panel
              </div>
              <p className="ops-body mt-3 text-[14px] text-slate-300">
                Select a participant in the diagram to see its role and the
                flows it connects to.
              </p>
            </div>
          )}
        </AnimatePresence>

        {allVisited && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ops-interactive-frame border-accent-cyan/30 p-6"
          >
            <div className="ops-caption text-[11px] text-accent-cyan">
              Whole system
            </div>
            <p className="ops-body mt-3 text-[15px] text-slate-100">
              The financial system moves money from people and institutions with
              capital to people and institutions that need capital. Households
              earn income and save. Companies need funding to invest and grow.
              Financial intermediaries and capital markets help connect the two
              sides.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
