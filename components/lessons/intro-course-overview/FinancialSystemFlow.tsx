"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

const NODES: Record<NodeKey, { label: string; body: string; links: NodeKey[] }> = {
  households: {
    label: "Households",
    body: "Households earn income, consume products, save, borrow, and invest. They supply labor and capital.",
    links: ["corporations", "intermediaries", "capital", "labor", "product"],
  },
  corporations: {
    label: "Nonfinancial Corporations",
    body: "Nonfinancial corporations produce goods and services, hire labor, invest in real assets, raise money, and return cash to investors.",
    links: ["households", "intermediaries", "capital", "labor", "product"],
  },
  intermediaries: {
    label: "Financial Intermediaries",
    body: "Financial intermediaries include banks, funds, insurers, and other institutions that connect savers and borrowers or help transfer risk.",
    links: ["households", "corporations", "capital"],
  },
  capital: {
    label: "Capital Markets",
    body: "Capital markets are markets where financial assets such as stocks and bonds are issued and traded. They help determine prices for financial assets.",
    links: ["households", "corporations", "intermediaries"],
  },
  labor: {
    label: "Labor Markets",
    body: "Labor markets connect households that supply labor with firms that demand labor and pay wages.",
    links: ["households", "corporations"],
  },
  product: {
    label: "Product Markets",
    body: "Product markets connect firms that sell goods and services with households and businesses that buy them.",
    links: ["households", "corporations"],
  },
};

const ORDER: NodeKey[] = ["households", "corporations", "intermediaries", "capital", "labor", "product"];

/**
 * The two sides the system connects, and what sits between them. Between, the
 * intermediaries and capital markets are next to each other because they are
 * linked to each other; every other link runs to one of the two sides.
 */
const SIDE_A: NodeKey = "households";
const SIDE_B: NodeKey = "corporations";
const BETWEEN: NodeKey[] = ["labor", "intermediaries", "capital", "product"];
/** Stacked on a phone, two by two: the two financial participants share a row, then the two markets for goods and work. */
const BETWEEN_STACKED: NodeKey[] = ["intermediaries", "capital", "labor", "product"];

/** Each link once. NODES lists every link from both ends; drawing both drew each line twice. */
const EDGES: [NodeKey, NodeKey][] = ORDER.flatMap((a) =>
  NODES[a].links.filter((b) => ORDER.indexOf(b) > ORDER.indexOf(a)).map((b) => [a, b] as [NodeKey, NodeKey]),
);

/**
 * Below this much room the two sides stack above and below the middle four
 * instead of standing either side of them. Measured on 2026-11-16: about 290px
 * on a 390px phone and 450px or more from 768px up.
 */
const WIDE_FROM = 420;

type Box = { left: number; right: number; top: number; bottom: number; cx: number; cy: number };

/**
 * The financial system as a flow model: households on one side, nonfinancial
 * corporations on the other, and the markets and institutions that connect
 * them in between. Tapping a participant marks the ones it connects to, and
 * with room for them, lines show the links.
 *
 * It used to be a 900-unit-wide drawing with a 680px minimum inside a
 * sideways-scrolling box. Three of the six participants started off-screen on
 * a phone and Capital Markets was cut off even at 1440px, though the
 * mini-check after it asks about capital markets. The participants are now
 * page elements at readable sizes that fit any width; the lines are drawn
 * between where they actually land.
 */
export default function FinancialSystemFlow({
  onAllVisited,
}: {
  onAllVisited?: () => void;
}) {
  const [active, setActive] = useState<NodeKey | null>(null);
  const [visited, setVisited] = useState<Set<NodeKey>>(new Set());
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const buttons = useRef<Partial<Record<NodeKey, HTMLButtonElement | null>>>({});
  const [wide, setWide] = useState(false);
  const [layout, setLayout] = useState<{ width: number; height: number; boxes: Record<NodeKey, Box> } | null>(null);

  // Before paint: pick the arrangement for the room there is, then note where each participant landed.
  useLayoutEffect(() => {
    const element = area.current;
    if (!element) return;
    const measure = () => {
      const room = element.clientWidth;
      const nextWide = room >= WIDE_FROM;
      setWide(nextWide);
      const origin = element.getBoundingClientRect();
      const boxes = {} as Record<NodeKey, Box>;
      for (const key of ORDER) {
        const button = buttons.current[key];
        if (!button) return;
        const r = button.getBoundingClientRect();
        const left = r.left - origin.left;
        const top = r.top - origin.top;
        boxes[key] = { left, right: left + r.width, top, bottom: top + r.height, cx: left + r.width / 2, cy: top + r.height / 2 };
      }
      setLayout({ width: origin.width, height: origin.height, boxes });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer.disconnect();
  }, [wide]);

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
  const linked = active ? NODES[active].links : [];

  const node = (k: NodeKey, className?: string) => {
    const isActive = active === k;
    const isLinked = linked.includes(k);
    const isVisited = visited.has(k);
    return (
      <button
        key={k}
        ref={(el) => {
          buttons.current[k] = el;
        }}
        type="button"
        aria-pressed={isActive}
        onClick={() => select(k)}
        className={cn(
          "relative flex min-h-11 w-full items-center justify-center rounded-xl border px-2.5 py-2 text-center font-sans text-[13px] font-semibold leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:text-[14px]",
          className,
        )}
        style={{
          background: isActive ? "var(--ops-accent-soft)" : "var(--ops-surface)",
          borderColor: isActive || isLinked ? "var(--ops-accent-strong)" : "var(--ops-surface-border)",
          borderWidth: isActive ? 2 : 1,
          color: isActive ? "var(--ops-accent-strong)" : active && !isLinked ? "var(--ops-text-secondary)" : "var(--ops-text-primary)",
          // The focus ring takes the section's own hue.
          ["--tw-ring-color" as string]: "var(--ops-accent-strong)",
        }}
      >
        {NODES[k].label}
        {isVisited ? (
          <>
            <span aria-hidden className="absolute right-1.5 top-1 text-[12px]" style={{ color: "var(--ops-success-strong)" }}>
              ✓
            </span>
            <span className="sr-only"> (explored)</span>
          </>
        ) : null}
        {active && isLinked ? <span className="sr-only"> (linked to {NODES[active].label})</span> : null}
      </button>
    );
  };

  /** Lines, wide arrangement only: each runs through the gaps, never behind a participant it does not join. */
  const lines =
    wide && layout
      ? EDGES.map(([a, b]) => {
          const { boxes } = layout;
          const on = active !== null && (a === active || b === active);
          const stroke = on ? "var(--ops-accent-strong)" : "var(--ops-divider)";
          const common = { fill: "none", stroke, strokeWidth: on ? 2 : 1.5, strokeDasharray: on ? undefined : "3 5", strokeLinecap: "round" as const };
          const sides = [SIDE_A, SIDE_B];
          // The two sides: a curve under the middle four. Its lowest point, halfway, is a quarter of the
          // way from the control points back to the ends, so the controls sit low enough for that point
          // to clear the bottom participant by 12px.
          if (sides.includes(a) && sides.includes(b)) {
            const left = boxes[SIDE_A];
            const right = boxes[SIDE_B];
            const clear = Math.max(...BETWEEN.map((k) => boxes[k].bottom)) + 12;
            const start = Math.max(left.bottom, right.bottom);
            const control = (clear - 0.25 * start) / 0.75;
            return <path key={`${a}-${b}`} d={`M ${left.cx} ${left.bottom} C ${left.cx} ${control}, ${right.cx} ${control}, ${right.cx} ${right.bottom}`} {...common} />;
          }
          // A side and one of the middle four: from the side's inner edge to the facing edge.
          const side = sides.find((k) => k === a || k === b);
          if (side) {
            const middle = side === a ? b : a;
            const from = boxes[side];
            const to = boxes[middle];
            const fromX = side === SIDE_A ? from.right : from.left;
            const toX = side === SIDE_A ? to.left : to.right;
            return <line key={`${a}-${b}`} x1={fromX} y1={from.cy} x2={toX} y2={to.cy} {...common} />;
          }
          // Two of the middle four, next to each other: a short line across the gap between them.
          const [upper, lower] = boxes[a].cy < boxes[b].cy ? [boxes[a], boxes[b]] : [boxes[b], boxes[a]];
          return <line key={`${a}-${b}`} x1={upper.cx} y1={upper.bottom} x2={lower.cx} y2={lower.top} {...common} />;
        })
      : null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <InteractiveFrame className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[12px] text-slate-400">
              Financial system · flow model
            </span>
          </div>
          <span className="font-sans text-[12px] tabular-nums" style={{ color: "var(--ops-accent-strong)" }}>
            {visited.size}/{ORDER.length} explored
          </span>
        </div>

        <div
          ref={area}
          role="group"
          aria-label="The financial system: households and nonfinancial corporations, with labor markets, financial intermediaries, capital markets and product markets between them"
          className={cn("relative mt-4 rounded-2xl border border-dashed", wide ? "px-4 pb-10 pt-3" : "p-3")}
          style={{ borderColor: "var(--ops-divider)" }}
        >
          <p aria-hidden className="mb-2 font-sans text-[12px]" style={{ color: "var(--ops-text-tertiary)" }}>
            Financial system
          </p>
          {lines ? (
            <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" width={layout?.width} height={layout?.height}>
              {lines}
            </svg>
          ) : null}
          {wide ? (
            <div className="relative grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] items-center gap-x-10">
              {node(SIDE_A, "min-h-14")}
              <div className="grid auto-rows-fr gap-3">{BETWEEN.map((k) => node(k))}</div>
              {node(SIDE_B, "min-h-14")}
            </div>
          ) : (
            <div className="relative grid gap-2.5">
              {node(SIDE_A)}
              <div className="grid auto-rows-fr grid-cols-2 gap-2.5">{BETWEEN_STACKED.map((k) => node(k))}</div>
              {node(SIDE_B)}
            </div>
          )}
        </div>
        <p className="ops-body mt-4 text-[14px] text-slate-300">
          Tap a participant to see its role. The participants it connects to are
          marked{wide ? ", and lines show the links" : ""}.
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
              aria-live="polite"
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
