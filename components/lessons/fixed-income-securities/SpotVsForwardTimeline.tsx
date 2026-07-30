"use client";

import { useReducedMotion } from "motion/react";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import { InlineMath } from "./shared";

/**
 * Spot vs. forward timeline.
 * SPOT: today → future (solid). FORWARD: agree today (dotted), transaction
 * between two future dates (dashed). f_t notation introduced.
 */
const MAX_T = 5;

export default function SpotVsForwardTimeline() {
  const reduce = useReducedMotion();

  const W = 760;
  const H = 230;
  const padX = 50;
  const innerW = W - padX * 2;
  const xAt = (p: number) => padX + (innerW * p) / MAX_T;

  const spotY = 70;
  const fwdY = 165;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Forward rate">
        <span className="text-accent-purple">Forward rates</span> are{" "}
        <span className="text-accent-cyan">today&apos;s rates</span> for
        transactions between <span className="text-accent-amber">two future
        dates</span>. You agree on the rate now; the money moves later.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Spot vs. forward
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Spot starts now. Forward starts later.
        </h4>

        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="Spot rate timeline and forward rate timeline">
            {/* period ticks (shared) */}
            {Array.from({ length: MAX_T + 1 }).map((_, i) => (
              <g key={i}>
                <line x1={xAt(i)} y1={40} x2={xAt(i)} y2={200} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={xAt(i)} y={215} textAnchor="middle" className="fill-slate-400 font-sans" fontSize="12">
                  {i === 0 ? "t=0" : `${i}yr`}
                </text>
              </g>
            ))}

            {/* SPOT ROW — solid today → future */}
            <text x={padX - 6} y={spotY} textAnchor="end" className="fill-accent-cyan font-sans" fontSize="12">
              Spot
            </text>
            <line x1={xAt(0)} y1={spotY} x2={xAt(MAX_T)} y2={spotY} stroke="#22d3ee" strokeWidth={3} strokeLinecap="round" />
            <circle cx={xAt(0)} cy={spotY} r={5} fill="#22d3ee" />
            <circle cx={xAt(MAX_T)} cy={spotY} r={5} fill="#22d3ee" />
            <text x={(xAt(0) + xAt(MAX_T)) / 2} y={spotY - 14} textAnchor="middle" className="fill-slate-300 font-sans" fontSize="12">
              money moves today → future (solid)
            </text>

            {/* FORWARD ROW — agree today dotted, transaction t1→t2 dashed */}
            <text x={padX - 6} y={fwdY} textAnchor="end" className="fill-accent-purple font-sans" fontSize="12">
              Forward
            </text>
            {/* agree today: dotted vertical marker at t=0 */}
            <line x1={xAt(0)} y1={fwdY - 10} x2={xAt(0)} y2={fwdY + 10} stroke="#a78bfa" strokeWidth={2.5} strokeDasharray="2 3" />
            <text x={xAt(0)} y={fwdY - 16} textAnchor="middle" className="fill-accent-purple font-sans" fontSize="11">
              agree today
            </text>
            {/* transaction between t1 and t2: dashed */}
            <line x1={xAt(2)} y1={fwdY} x2={xAt(4)} y2={fwdY} stroke="#a78bfa" strokeWidth={3} strokeLinecap="round" strokeDasharray="8 6" />
            <circle cx={xAt(2)} cy={fwdY} r={5} fill="none" stroke="#a78bfa" strokeWidth={2.5} />
            <circle cx={xAt(4)} cy={fwdY} r={5} fill="none" stroke="#a78bfa" strokeWidth={2.5} />
            <text x={(xAt(2) + xAt(4)) / 2} y={fwdY - 14} textAnchor="middle" className="fill-slate-300 font-sans" fontSize="12">
              money moves t₁ → t₂ (dashed)
            </text>
            <text x={(xAt(2) + xAt(4)) / 2} y={fwdY + 24} textAnchor="middle" className="fill-accent-purple font-sans" fontSize="13">
              fₜ
            </text>
          </svg>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">Spot rate</div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              A <span className="text-accent-cyan">spot rate</span> governs money
              that moves <span className="font-sans">now</span>. You hand over
              cash today; you receive a known amount at a future date.
            </p>
            <div className="mt-3 font-sans text-[15px] text-slate-100">
              <InlineMath>{"r_{0,T}"}</InlineMath>
            </div>
          </div>
          <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-purple">Forward rate</div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              A <span className="text-accent-purple">forward rate</span>{" "}
              <InlineMath>{"f_t"}</InlineMath> governs money that moves{" "}
              <span className="font-sans">later</span>. The rate is fixed today,
              but both the loan and repayment happen between two future dates.
            </p>
            <div className="mt-3 font-sans text-[15px] text-slate-100">
              <InlineMath>{"f_{t_1,\\,t_2}"}</InlineMath>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
          <p className="ops-body text-[15px] leading-7 text-slate-100">
            <span className="text-accent-amber">Heads up:</span> future spot
            rates can differ from today&apos;s forward rates. A forward rate is
            what you can lock in <span className="italic">now</span> — not a
            guarantee of the rate that will actually prevail then.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}
