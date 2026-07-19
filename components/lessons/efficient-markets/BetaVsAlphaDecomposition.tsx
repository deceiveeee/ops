"use client";

import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

type Manager = {
  name: string;
  ret: number;
  beta: number;
  rf: number;
  rm: number;
  interpretation: string;
  tone: "amber" | "green" | "cyan" | "purple";
};

const MANAGERS: Manager[] = [
  { name: "Manager A", ret: 13, beta: 1.3, rf: 3, rm: 10, interpretation: "Much of the 13% return may reflect greater market exposure (beta 1.3). The risk-adjusted value added is unclear.", tone: "amber" },
  { name: "Manager B", ret: 11, beta: 0.8, rf: 3, rm: 10, interpretation: "Lower raw return, but lower market exposure. May represent stronger risk-adjusted performance than A.", tone: "green" },
  { name: "Manager C", ret: 12, beta: 1.0, rf: 3, rm: 10, interpretation: "Beta of 1.0 means the return roughly matches what market exposure alone would predict.", tone: "cyan" },
  { name: "Manager D", ret: 14, beta: 1.0, rf: 3, rm: 10, interpretation: "Same risk as the market but higher return. Possible positive alpha — subject to costs, luck, and model assumptions.", tone: "purple" },
];

const toneText: Record<string, string> = { amber: "text-accent-amber", green: "text-accent-green", cyan: "text-accent-cyan", purple: "text-accent-purple" };
const toneBorder: Record<string, string> = { amber: "border-accent-amber/25", green: "border-accent-green/25", cyan: "border-accent-cyan/25", purple: "border-accent-purple/25" };

function calcAlpha(m: Manager): number {
  const expectedReturn = m.rf + m.beta * (m.rm - m.rf);
  return m.ret - expectedReturn;
}

export default function BetaVsAlphaDecomposition() {
  return (
    <div className="space-y-6">
      {/* Formula */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          Return decomposition
        </div>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>{String.raw`R_p - R_f = \alpha + \beta_p(R_m - R_f) + \varepsilon`}</BlockMath>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
          {[
            { sym: String.raw`R_p`, desc: "Portfolio return" },
            { sym: String.raw`R_f`, desc: "Risk-free return" },
            { sym: String.raw`R_m`, desc: "Market return" },
            { sym: String.raw`\beta_p`, desc: "Sensitivity to market movements" },
            { sym: String.raw`\alpha`, desc: "Return not explained by market exposure" },
            { sym: String.raw`\varepsilon`, desc: "Unpredictable random variation" },
          ].map((v) => (
            <div key={v.sym} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 font-mono text-slate-200"><InlineMath>{v.sym}</InlineMath></span>
              <span className="text-[13px] text-slate-300">{v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manager comparison */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MANAGERS.map((m) => {
          const alpha = calcAlpha(m);
          return (
            <div key={m.name} className={cn("rounded-2xl border p-5 bg-white/[0.02]", toneBorder[m.tone])}>
              <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]", toneText[m.tone])}>{m.name}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-white/10 bg-ink-950/40 p-2">
                  <div className="font-mono text-[10px] text-slate-400">Return</div>
                  <div className="font-mono text-[16px] text-white">{m.ret}%</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-ink-950/40 p-2">
                  <div className="font-mono text-[10px] text-slate-400">Beta</div>
                  <div className="font-mono text-[16px] text-white">{m.beta}</div>
                </div>
                <div className={cn("rounded-lg border p-2", alpha > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
                  <div className="font-mono text-[10px] text-slate-400">Est. alpha</div>
                  <div className={cn("font-mono text-[16px]", alpha > 0 ? "text-accent-green" : "text-accent-red")}>{alpha > 0 ? "+" : ""}{alpha.toFixed(1)}%</div>
                </div>
              </div>
              <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-200">{m.interpretation}</p>
            </div>
          );
        })}
      </div>

      {/* Key insight */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
          Beta is exposure that an investor can often obtain cheaply. Alpha is the additional value the
          active manager claims to provide. But measured alpha depends on the benchmark and risk model —
          and omitted exposures can make apparent alpha misleading.
        </p>
      </div>
    </div>
  );
}
