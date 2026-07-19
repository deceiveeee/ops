"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Deterministic seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 42;
const NUM_MANAGERS = 60;
const NUM_SKILLED = 5;
const YEARS = 5;
const FEE = 1.0;

type Manager = {
  id: number;
  name: string;
  skill: number;
  annualReturns: number[];
  avgNetReturn: number;
};

function generateManagers(): Manager[] {
  const rng = mulberry32(SEED);
  const managers: Manager[] = [];
  const marketReturns = [10.0, 8.0, 12.0, 6.0, 9.0];

  for (let i = 0; i < NUM_MANAGERS; i++) {
    const isSkilled = i < NUM_SKILLED;
    const skill = isSkilled ? 1.5 + rng() * 1.5 : 0;
    const beta = 0.85 + rng() * 0.3;
    const returns: number[] = [];

    for (let y = 0; y < YEARS; y++) {
      const noise = (rng() - 0.5) * 16;
      const grossReturn = beta * marketReturns[y] + skill + noise;
      const netReturn = grossReturn - FEE;
      returns.push(netReturn);
    }

    const avgNet = returns.reduce((s, r) => s + r, 0) / YEARS;
    managers.push({
      id: i,
      name: `Fund ${String.fromCharCode(65 + Math.floor(i / 26))}${i % 26 === 0 && i > 0 ? String.fromCharCode(65 + 25) : String.fromCharCode(65 + (i % 26))}${i >= 26 ? "+" : ""}`,
      skill,
      annualReturns: returns,
      avgNetReturn: avgNet,
    });
  }

  return managers.sort((a, b) => b.avgNetReturn - a.avgNetReturn);
}

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function SkilledManagerSimulation() {
  const reduce = useReducedMotion();
  const managers = useMemo(() => generateManagers(), []);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);

  const toggle = (id: number) => {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const skilledIds = new Set(managers.filter((m) => m.skill > 0).map((m) => m.id));
  const selectedCorrect = [...selected].filter((id) => skilledIds.has(id)).length;
  const selectedWrong = selected.size - selectedCorrect;
  const missedSkilled = [...skilledIds].filter((id) => !selected.has(id)).length;

  const colorBar = (r: number) => r >= 8 ? "bg-accent-green/30" : r >= 4 ? "bg-accent-amber/25" : "bg-accent-red/25";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Below are {NUM_MANAGERS} fund managers with {YEARS}-year average net returns (after {FEE}% fees).
          Most have no persistent skill. A few have modest positive skill. Select the ones you believe
          are genuinely skilled — then reveal the truth.
        </p>
      </div>

      {/* Manager list */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
          {managers.map((m, idx) => {
            const isSel = selected.has(m.id);
            const isSkilled = m.skill > 0;
            const showSkill = revealed && isSkilled;
            const showLucky = revealed && !isSkilled && isSel;
            return (
              <button
                key={m.id} type="button"
                onClick={() => toggle(m.id)}
                disabled={revealed}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isSel && !revealed && "border-accent-cyan/40 bg-accent-cyan/10",
                  !isSel && !revealed && "border-white/8 hover:border-white/20",
                  revealed && showSkill && "border-accent-green/40 bg-accent-green/[0.06]",
                  revealed && showLucky && "border-accent-red/30 bg-accent-red/[0.04]",
                  revealed && !isSel && !showSkill && "border-white/5 opacity-50",
                )}
              >
                <span className="w-6 flex-shrink-0 text-center font-mono text-[11px] text-slate-400">{idx + 1}</span>
                <span className="w-16 flex-shrink-0 font-mono text-[12px] text-slate-200">{m.name}</span>
                <div className="relative h-5 flex-1 overflow-hidden rounded bg-ink-950/40">
                  <div className={cn("absolute inset-y-0 left-0 rounded", colorBar(m.avgNetReturn))}
                    style={{ width: `${Math.min(100, Math.max(5, m.avgNetReturn * 7))}%` }} />
                </div>
                <span className={cn("w-16 flex-shrink-0 text-right font-mono text-[13px] tabular-nums",
                  m.avgNetReturn >= 8 ? "text-accent-green" : m.avgNetReturn >= 4 ? "text-accent-amber" : "text-accent-red")}>
                  {fmt(m.avgNetReturn)}%
                </span>
                {showSkill && <span className="flex-shrink-0 rounded-full bg-accent-green/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-green">Skilled</span>}
                {showLucky && <span className="flex-shrink-0 rounded-full bg-accent-red/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-red">Lucky</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      {!revealed ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setRevealed(true)}
            disabled={selected.size === 0}
            className={cn("rounded-full border px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              selected.size > 0 ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20" : "border-white/15 text-slate-500")}>
            {selected.size > 0 ? `Reveal the truth (${selected.size} selected)` : "Select managers first"}
          </button>
          {selected.size > 0 && (
            <button type="button" onClick={() => setSelected(new Set())}
              className="rounded-full border border-white/20 px-4 py-2 font-mono text-[12px] text-slate-300 transition-colors hover:border-white/40">
              Clear selection
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Correct picks" value={`${selectedCorrect}/${NUM_SKILLED}`} tone="green" />
              <Stat label="False positives" value={`${selectedWrong}`} tone="red" />
              <Stat label="Missed skilled" value={`${missedSkilled}`} tone="amber" />
            </div>
            <p className="ops-body mt-4 text-[15px] leading-[1.65] text-slate-100">
              {selectedCorrect < NUM_SKILLED && (
                <>Some genuinely skilled managers did not rank at the top — random variation masked their
                advantage. Short records are noisy, and modest skill is difficult to identify.</>
              )}
              {" "}{selectedWrong > 0 && (
                <>Some top performers were simply lucky — their high returns came from random variation,
                not from any real edge.</>
              )}
              {" "}Even the skilled managers only added {fmt(1.5)}–{fmt(3.0)}% before fees of {FEE}%. Real
              but small advantages can be eliminated by costs.
            </p>
          </motion.div>
          <button type="button"
            onClick={() => { setRevealed(false); setSelected(new Set()); }}
            className="rounded-full border border-white/20 px-5 py-2 font-mono text-[13px] text-slate-200 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            ↻ Reset and try again
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "green" | "red" | "amber" }) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-accent-amber";
  return (
    <div className="rounded-lg border border-white/10 bg-ink-950/40 p-3 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[20px]", text)}>{value}</div>
    </div>
  );
}
