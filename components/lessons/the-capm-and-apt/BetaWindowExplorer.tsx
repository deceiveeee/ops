"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

type WindowId = "ten" | "five" | "two";

type Phase = {
  id: string;
  label: string;
  detail: string;
  tone: "cyan" | "amber" | "red" | "green";
};

const PHASES: Phase[] = [
  { id: "stable", label: "Stable operations", detail: "Mature, low-leverage consumer-staples business.", tone: "green" },
  { id: "acq", label: "Acquisition-driven expansion", detail: "Rapidly integrating cyclical targets; rising operating leverage.", tone: "amber" },
  { id: "cyc", label: "Highly leveraged cyclical operations", detail: "Debt-financed capital-intensive cycle business.", tone: "red" },
];

const WINDOWS: { id: WindowId; label: string; years: string; beta: number; se: number; r2: number; phases: string[]; note: string }[] = [
  {
    id: "ten",
    label: "Full 10-year sample",
    years: "Years 1–10",
    beta: 0.95,
    se: 0.14,
    r2: 0.41,
    phases: ["stable", "acq", "cyc"],
    note: "Blends three very different business phases into a single average. Statistically long, but economically mixed.",
  },
  {
    id: "five",
    label: "Recent 5-year sample",
    years: "Years 6–10",
    beta: 1.35,
    se: 0.19,
    r2: 0.34,
    phases: ["acq", "cyc"],
    note: "Reflects the more recent, more cyclical and more leveraged business. Higher beta, somewhat noisier.",
  },
  {
    id: "two",
    label: "Recent 2-year sample",
    years: "Years 9–10",
    beta: 1.62,
    se: 0.31,
    r2: 0.28,
    note: "Captures the current highly leveraged cyclical operations most clearly, but the short sample makes the estimate imprecise.",
    phases: ["cyc"],
  },
];

const TONE_TEXT: Record<string, string> = {
  green: "text-accent-green",
  amber: "text-accent-amber",
  red: "text-accent-red",
  cyan: "text-accent-cyan",
};
const TONE_BORDER: Record<string, string> = {
  green: "border-accent-green/40",
  amber: "border-accent-amber/40",
  red: "border-accent-red/40",
  cyan: "border-accent-cyan/40",
};
const TONE_BAR: Record<string, string> = {
  green: "bg-accent-green/70",
  amber: "bg-accent-amber/70",
  red: "bg-accent-red/70",
  cyan: "bg-accent-cyan/70",
};

function BetaBar({ beta, tone }: { beta: number; tone: string }) {
  const pct = Math.min(beta / 2, 1) * 100;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className={cn("h-full rounded-full", TONE_BAR[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

function UncertaintyRange({ beta, se }: { beta: number; se: number }) {
  const lo = Math.max(0, beta - 2 * se);
  const hi = Math.min(2, beta + 2 * se);
  const loPct = Math.max(0, (lo / 2) * 100);
  const hiPct = Math.min(100, (hi / 2) * 100);
  const widthPct = Math.max(2, hiPct - loPct);
  return (
    <div className="relative h-2.5 w-full rounded-full bg-white/10">
      <div className="absolute top-0 h-full rounded-full border border-white/20 bg-white/15" style={{ left: `${loPct}%`, width: `${widthPct}%` }} />
      <div className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-accent-cyan" style={{ left: `${Math.min(99, (beta / 2) * 100)}%` }} />
    </div>
  );
}

export default function BetaWindowExplorer() {
  const [active, setActive] = useState<WindowId>("ten");
  const win = WINDOWS.find((w) => w.id === active)!;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Company · Helix Industries (fictional)</div>
        <p className="mt-2 text-[15px] leading-[1.6] text-slate-300">
          Over ten years Helix moved through three phases: stable operations, acquisition-driven
          expansion, and highly leveraged cyclical operations. The window you choose changes both the
          beta estimate and its uncertainty.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PHASES.map((p) => (
            <div key={p.id} className={cn("rounded-xl border bg-white/[0.02] p-3", TONE_BORDER[p.tone])}>
              <div className={cn("font-mono text-[12px] uppercase tracking-[0.14em]", TONE_TEXT[p.tone])}>{p.label}</div>
              <p className="mt-1 text-[13px] leading-[1.5] text-slate-400">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setActive(w.id)}
            className={cn(
              "rounded-full border px-5 py-2 text-[14px] transition-colors",
              active === w.id
                ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
            )}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">{win.years}</div>
            <div className="font-mono text-[12px] text-slate-500">{win.phases.length} phase{win.phases.length > 1 ? "s" : ""} covered</div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-slate-400">Estimated beta</span>
              <span className={cn("font-mono text-[18px]", TONE_TEXT[win.id === "ten" ? "cyan" : win.id === "five" ? "amber" : "red"])}>{win.beta.toFixed(2)}</span>
            </div>
            <BetaBar beta={win.beta} tone={win.id === "ten" ? "cyan" : win.id === "five" ? "amber" : "red"} />
          </div>
          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-slate-400">Approximate uncertainty range <InlineMath>{String.raw`\hat{\beta} \pm 2SE`}</InlineMath></span>
              <span className="font-mono text-[13px] text-slate-300">{(win.beta - 2 * win.se).toFixed(2)} – {(win.beta + 2 * win.se).toFixed(2)}</span>
            </div>
            <UncertaintyRange beta={win.beta} se={win.se} />
            <p className="mt-1 text-[12px] text-slate-500">An approximate range from the sample, not a guarantee or a permanent interval.</p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">SE(β)</div>
              <div className="mt-1 font-mono text-[16px] text-slate-100">{win.se.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">R²</div>
              <div className="mt-1 font-mono text-[16px] text-slate-100">{(win.r2 * 100).toFixed(0)}%</div>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">Phases</div>
              <div className="mt-1 font-mono text-[16px] text-slate-100">{win.phases.length} of 3</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">Read this window</div>
          <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">{win.note}</p>
        </div>
      </div>

      <Feedback status="info">
        Which estimate is most relevant for a forward-looking CAPM analysis? There is no single automatic
        answer. Recent data may reflect the current business better, but short samples are noisier. The
        estimate should reflect the company&apos;s current business and capital structure, not just the
        longest available history.
      </Feedback>
    </div>
  );
}
