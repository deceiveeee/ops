"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "./shared";

type Slice = {
  id: string;
  label: string;
  value: number; // $ billions
  share: number; // percent
  color: string;
  note: string;
};

// Historical MIT snapshot — U.S. Bond Market Debt, 2006, $ billions
const OUTSTANDING: Slice[] = [
  { id: "muni", label: "Municipal", value: 2337.5, share: 9, color: "#a78bfa", note: "Local-government borrowing." },
  { id: "treasury", label: "Treasury", value: 4283.8, share: 16, color: "#22d3ee", note: "Federal government debt." },
  { id: "mortgage", label: "Mortgage-Related", value: 6400.4, share: 24, color: "#fbbf24", note: "Largest slice in this snapshot. This matters because mortgage-related debt later became central to the 2007–2008 crisis." },
  { id: "corporate", label: "Corporate", value: 5209.7, share: 19, color: "#34d399", note: "Company borrowing." },
  { id: "agency", label: "Federal Agency", value: 2665.2, share: 10, color: "#60a5fa", note: "Agency-related borrowing." },
  { id: "mm", label: "Money Markets", value: 3818.9, share: 14, color: "#f472b6", note: "Short-term instruments." },
  { id: "abs", label: "Asset-Backed", value: 2016.7, share: 8, color: "#f87171", note: "Pools of non-mortgage loans." },
];

// Historical MIT snapshot — U.S. Bond Market Issuance, 2006, $ billions
const ISSUANCE: Slice[] = [
  { id: "muni", label: "Municipal", value: 265.3, share: 6, color: "#a78bfa", note: "New local-government debt issued in 2006." },
  { id: "treasury", label: "Treasury", value: 599.8, share: 14, color: "#22d3ee", note: "New Treasury debt issued in 2006." },
  { id: "mortgage", label: "Mortgage-Related", value: 1475.3, share: 34, color: "#fbbf24", note: "New mortgage-related issuance was the largest flow." },
  { id: "corporate", label: "Corporate", value: 748.7, share: 17, color: "#34d399", note: "New corporate debt issued in 2006." },
  { id: "agency", label: "Federal Agency", value: 546.9, share: 13, color: "#60a5fa", note: "New agency debt issued in 2006." },
  { id: "abs", label: "Asset-Backed", value: 674.6, share: 16, color: "#f87171", note: "New asset-backed issuance in 2006." },
];

const SPIN_CHOICES = ["Treasury", "Corporate", "Mortgage-Related", "Municipal"];
const SPIN_ANSWER = "Mortgage-Related";

type View = "outstanding" | "issuance";

/**
 * Sections 5–6 — Market size (donut) + issuance (bar) with stock-vs-flow toggle
 * and a "spin the market" prediction interaction.
 */
export default function BondMarketCharts() {
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("outstanding");
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <SpinTheMarket />

      {/* Section 5+6 explorer */}
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Market size &amp; issuance
            </span>
          </div>
          {/* Stock vs Flow toggle */}
          <div className="inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
            <ToggleBtn active={view === "outstanding"} onClick={() => setView("outstanding")}>
              Outstanding (stock)
            </ToggleBtn>
            <ToggleBtn active={view === "issuance"} onClick={() => setView("issuance")}>
              Issuance (flow)
            </ToggleBtn>
          </div>
        </div>

        <p className="ops-body mt-3 text-[14px] leading-6 text-slate-400">
          Historical MIT snapshot · 2006 · not current market data.
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-5"
          >
            {view === "outstanding" ? (
              <OutstandingView hovered={hovered} setHovered={setHovered} />
            ) : (
              <IssuanceView hovered={hovered} setHovered={setHovered} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="ops-body text-[14px] leading-6 text-slate-200">
            <span className="text-accent-cyan">Outstanding debt</span> is the
            total amount already out there. <span className="text-accent-amber">Issuance</span>{" "}
            is new debt created during the period.
          </p>
          <p className="ops-muted mt-2 text-[13px] leading-6 text-slate-400">
            Mortgage-related bonds were <span className="text-accent-amber">24%</span> of
            outstanding debt in the 2006 snapshot but <span className="text-accent-amber">34%</span> of
            issuance, showing that this area was growing quickly at the time.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Spin the market prediction                                         */
/* ------------------------------------------------------------------ */

function SpinTheMarket() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Spin the bond market
          </span>
        </div>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Before the chart: which category was largest in 2006?
      </h3>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        Most people guess Treasuries. The 2006 data tells a different story.
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {SPIN_CHOICES.map((c) => {
          const picked = answer === c;
          const isCorrect = c === SPIN_ANSWER;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={picked}
              onClick={() => {
                setAnswer(c);
                setRevealed(true);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                revealed && picked && isCorrect
                  ? "border-accent-green/60 bg-accent-green/10 text-accent-green"
                  : revealed && picked && !isCorrect
                    ? "border-accent-red/60 bg-accent-red/10 text-accent-red"
                    : "border-white/20 text-slate-100 hover:bg-white/5",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "mt-5 rounded-xl border p-4",
              answer === SPIN_ANSWER
                ? "border-accent-green/40 bg-accent-green/10"
                : "border-accent-amber/40 bg-accent-amber/10",
            )}
          >
            <p className="ops-body text-[15px] leading-7 text-slate-100">
              {answer === SPIN_ANSWER
                ? "Correct. "
                : "Not quite. "}
              In the 2006 MIT snapshot, <span className="text-accent-amber">mortgage-related debt</span> was the
              largest category of outstanding U.S. bond market debt. This matters because mortgage-related debt
              later became central to the 2007–2008 crisis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Outstanding donut                                                  */
/* ------------------------------------------------------------------ */

function OutstandingView({
  hovered,
  setHovered,
}: {
  hovered: string | null;
  setHovered: (id: string | null) => void;
}) {
  const active = hovered ?? "mortgage";
  const slice = OUTSTANDING.find((s) => s.id === active)!;
  const reduce = useReducedMotion();

  return (
    <div>
      <h4 className="ops-interactive-title text-xl text-white">
        U.S. Bond Market Debt, 2006, $ billions
      </h4>
      <p className="ops-caption mt-1 text-[12px] text-slate-400">
        In 2006, mortgage-related debt was the largest category in this MIT snapshot.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Donut data={OUTSTANDING} active={active} setActive={setHovered} reduce={reduce} />

        <SliceDetail slice={slice} isOutstanding />
      </div>

      <Legend data={OUTSTANDING} active={active} setActive={setHovered} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Issuance bar chart                                                 */
/* ------------------------------------------------------------------ */

function IssuanceView({
  hovered,
  setHovered,
}: {
  hovered: string | null;
  setHovered: (id: string | null) => void;
}) {
  const active = hovered ?? "mortgage";
  const slice = ISSUANCE.find((s) => s.id === active)!;
  const maxVal = Math.max(...ISSUANCE.map((s) => s.value));
  const reduce = useReducedMotion();

  return (
    <div>
      <h4 className="ops-interactive-title text-xl text-white">
        U.S. Bond Market Issuance, 2006, $ billions
      </h4>
      <p className="ops-caption mt-1 text-[12px] text-slate-400">
        New debt created during the year. Mortgage-related issuance was the largest flow.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,260px)]">
        {/* Bar chart */}
        <div className="overflow-x-auto">
          <div className="flex min-w-[520px] items-end gap-3 rounded-2xl border border-white/10 bg-ink-950/40 p-5" style={{ height: 280 }}>
            {ISSUANCE.map((s) => {
              const h = (s.value / maxVal) * 100;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onMouseEnter={() => setHovered(s.id)}
                  onFocus={() => setHovered(s.id)}
                  onClick={() => setHovered(s.id)}
                  aria-label={`${s.label} issuance ${s.value} billion dollars`}
                  className="group flex h-full flex-1 flex-col items-center justify-end focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                >
                  <span className="mb-1 font-sans text-[11px] text-slate-300">
                    {s.value.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                  </span>
                  <motion.div
                    initial={reduce ? false : { height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full rounded-t-md"
                    style={{
                      backgroundColor: s.color,
                      opacity: active && !isActive ? 0.4 : 1,
                      minHeight: 6,
                    }}
                  />
                  <span className={cn("mt-2 text-[11px] text-center leading-tight", isActive ? "text-white" : "text-slate-400")}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <SliceDetail slice={slice} isOutstanding={false} />
      </div>

      <Legend data={ISSUANCE} active={active} setActive={setHovered} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function Donut({
  data,
  active,
  setActive,
  reduce,
}: {
  data: Slice[];
  active: string;
  setActive: (id: string | null) => void;
  reduce: boolean | null;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 90;
  const r = 54;
  const cx = 110;
  const cy = 110;
  let angle = -Math.PI / 2; // start at top

  const arcs = data.map((d) => {
    const frac = d.value / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    return { ...d, start, end };
  });

  return (
    <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[320px]" role="img" aria-label="Donut chart of U.S. bond market debt 2006">
      {arcs.map((a) => {
        const isActive = active === a.id;
        const outerR = isActive ? R + 8 : R;
        const x1 = cx + outerR * Math.cos(a.start);
        const y1 = cy + outerR * Math.sin(a.start);
        const x2 = cx + outerR * Math.cos(a.end);
        const y2 = cy + outerR * Math.sin(a.end);
        const x3 = cx + r * Math.cos(a.end);
        const y3 = cy + r * Math.sin(a.end);
        const x4 = cx + r * Math.cos(a.start);
        const y4 = cy + r * Math.sin(a.start);
        const large = a.end - a.start > Math.PI ? 1 : 0;
        const path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
        return (
          <path
            key={a.id}
            d={path}
            fill={a.color}
            fillOpacity={active && !isActive ? 0.35 : 0.9}
            stroke="#05070d"
            strokeWidth={1.5}
            style={reduce ? undefined : { transition: "all 0.25s ease" }}
            tabIndex={0}
            role="button"
            onMouseEnter={() => setActive(a.id)}
            onFocus={() => setActive(a.id)}
            onClick={() => setActive(a.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActive(a.id);
              }
            }}
            aria-label={`${a.label}, ${a.value} billion, ${a.share} percent`}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-200 font-sans" fontSize="13">
        2006
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-500 font-sans" fontSize="10">
        $ billions
      </text>
    </svg>
  );
}

function SliceDetail({ slice, isOutstanding }: { slice: Slice; isOutstanding: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: slice.color }} aria-hidden />
        <span className="ops-interactive-title text-lg text-white">{slice.label}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label={isOutstanding ? "Outstanding" : "Issuance"} value={`$${slice.value.toLocaleString("en-US", { maximumFractionDigits: 1 })}B`} />
        <Stat label="Share" value={`${slice.share}%`} />
      </div>
      <p className="ops-body mt-4 text-[14px] leading-6 text-slate-300">{slice.note}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className="mt-1 font-sans text-[18px] text-slate-50">{value}</div>
    </div>
  );
}

function Legend({
  data,
  active,
  setActive,
}: {
  data: Slice[];
  active: string;
  setActive: (id: string | null) => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {data.map((d) => (
        <button
          key={d.id}
          type="button"
          onMouseEnter={() => setActive(d.id)}
          onFocus={() => setActive(d.id)}
          onClick={() => setActive(d.id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            active === d.id ? "border-white/40 text-white" : "border-white/10 text-slate-400 hover:text-slate-200",
          )}
        >
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden />
          {d.label}
        </button>
      ))}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        active ? "bg-accent-cyan/15 text-accent-cyan" : "text-slate-400 hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}
