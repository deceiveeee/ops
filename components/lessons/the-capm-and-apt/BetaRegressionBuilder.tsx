"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const TRUE_BETA = 1.2;
const SIGMA_M = 0.1;
const RESID_SIGMA = 0.15;

const POINTS = (() => {
  const rng = mulberry32(7);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const xm = gaussian(rng) * SIGMA_M;
    const eps = gaussian(rng) * RESID_SIGMA;
    pts.push({ x: xm, y: TRUE_BETA * xm + eps });
  }
  return pts;
})();

const W = 440;
const H = 340;
const padL = 46;
const padR = 18;
const padT = 18;
const padB = 44;
const xMin = -0.35;
const xMax = 0.35;
const yMin = -0.7;
const yMax = 0.7;

const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
const sy = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

const xTicks = [-0.3, -0.15, 0, 0.15, 0.3];
const yTicks = [-0.6, -0.3, 0, 0.3, 0.6];

function ChartAxes() {
  return (
    <>
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
          <text x={sx(t)} y={H - padB + 18} fill="rgba(148,163,184,0.85)" fontSize="11" fontFamily="monospace" textAnchor="middle">
            {(t * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
          <text x={padL - 8} y={sy(t) + 4} fill="rgba(148,163,184,0.85)" fontSize="11" fontFamily="monospace" textAnchor="end">
            {(t * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      <line x1={sx(0)} x2={sx(0)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" />
      <line x1={padL} x2={W - padR} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,0.25)" />
      <text x={(padL + W - padR) / 2} y={H - 6} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle">
        Market excess return
      </text>
      <text x={14} y={(padT + H - padB) / 2} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle" transform={`rotate(-90 14 ${(padT + H - padB) / 2})`}>
        Stock excess return
      </text>
    </>
  );
}

function ChoiceChip({
  selected,
  answered,
  isCorrect,
  disabled,
  label,
  onClick,
}: {
  selected: boolean;
  answered: boolean;
  isCorrect: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-[14px] transition-colors",
        !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
        answered && isCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
        selected && !isCorrect && "border-accent-red bg-accent-red/15 text-accent-red",
        answered && !selected && !isCorrect && "border-white/10 text-slate-500",
      )}
    >
      {label}
    </button>
  );
}

export default function BetaRegressionBuilder() {
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [guess, setGuess] = useState<number | null>(null);

  const classQuestions = [
    {
      key: "sign",
      prompt: "Is the relationship positive or negative?",
      options: [
        { id: "pos", label: "Positive" },
        { id: "neg", label: "Negative" },
      ],
      correctId: "pos",
      note: "Points rise from lower-left to upper-right: higher market returns line up with higher stock returns.",
    },
    {
      key: "sens",
      prompt: "Is the sensitivity low or high?",
      options: [
        { id: "low", label: "Low (well below 1)" },
        { id: "high", label: "High (above 1)" },
      ],
      correctId: "high",
      note: "The cloud rises faster than 45°, suggesting beta above one.",
    },
    {
      key: "fit",
      prompt: "Is the fit tight or loose?",
      options: [
        { id: "tight", label: "Tight" },
        { id: "loose", label: "Loose" },
      ],
      correctId: "loose",
      note: "Points spread noticeably around any straight line — there is substantial company-specific scatter.",
    },
  ];

  const slopes = [0.5, 1.0, 1.2, 1.5, 2.0];
  const guessLocked = guess !== null;
  const guessClose = guess !== null && Math.abs(guess - TRUE_BETA) <= 0.35;

  const answer = (k: string, id: string) => {
    if (answers[k] !== undefined) return;
    const next = { ...answers, [k]: id };
    setAnswers(next);
    if (classQuestions.every((q) => next[q.key] !== undefined)) {
      setStage((s) => Math.max(s, 1));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-x-auto rounded-xl border border-white/12 bg-white/[0.03] p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[380px]" role="img" aria-label="Scatter of market excess return versus stock excess return, with a fitted regression line of slope beta.">
            <ChartAxes />
            {stage >= 1 && guess !== null && (
              <line
                x1={sx(xMin)}
                y1={sy(guess * xMin)}
                x2={sx(xMax)}
                y2={sy(guess * xMax)}
                stroke="rgba(167,139,250,0.6)"
                strokeWidth={2}
                strokeDasharray="5 4"
              />
            )}
            {stage >= 2 && (
              <line
                x1={sx(xMin)}
                y1={sy(TRUE_BETA * xMin)}
                x2={sx(xMax)}
                y2={sy(TRUE_BETA * xMax)}
                stroke="rgba(34,211,238,0.95)"
                strokeWidth={2.5}
              />
            )}
            {POINTS.map((p, i) => (
              <g key={i}>
                {stage >= 2 && (
                  <line
                    x1={sx(p.x)}
                    y1={sy(TRUE_BETA * p.x)}
                    x2={sx(p.x)}
                    y2={sy(p.y)}
                    stroke="rgba(251,191,36,0.35)"
                    strokeWidth={1}
                  />
                )}
                <circle cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill="rgba(34,211,238,0.85)" />
              </g>
            ))}
          </svg>
          <p className="mt-1.5 text-center text-[13px] text-slate-500">
            {stage === 0 && "Each point pairs one period's market excess return with the stock's excess return."}
            {stage === 1 && guess === null && "Pick a slope to overlay your guess (purple dashed)."}
            {stage === 1 && guess !== null && "Your guess is shown purple dashed. Reveal the fitted line next."}
            {stage >= 2 && "Slope is beta. Vertical distances from the line are residuals."}
          </p>
        </div>

        <div className="space-y-4">
          {stage === 0 && (
            <div className="space-y-3">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Step 1 · Classify the cloud</div>
              {classQuestions.map((q) => (
                <div key={q.key} className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
                  <div className="text-[15px] leading-[1.55] text-slate-200">{q.prompt}</div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const sel = answers[q.key] === opt.id;
                      const answered = answers[q.key] !== undefined;
                      return (
                        <ChoiceChip
                          key={opt.id}
                          selected={sel}
                          answered={answered}
                          isCorrect={answered && opt.id === q.correctId}
                          disabled={answered}
                          label={opt.label}
                          onClick={() => answer(q.key, opt.id)}
                        />
                      );
                    })}
                  </div>
                  {answers[q.key] !== undefined && (
                    <p className="mt-2 text-[13px] leading-[1.5] text-slate-300">{q.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {stage >= 1 && (
            <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-purple">Step 2 · Choose a slope</div>
              <p className="mt-2 text-[14px] leading-[1.55] text-slate-300">
                Which slope best fits the cloud? The slope becomes your beta estimate.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {slopes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={guessLocked}
                    onClick={() => {
                      setGuess(s);
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 font-sans text-[14px] transition-colors",
                      !guessLocked && guess === null && "border-white/20 text-slate-200 hover:border-accent-purple/60 hover:text-accent-purple",
                      guessLocked && guess === s && "border-accent-purple bg-accent-purple/15 text-accent-purple",
                      guessLocked && guess !== s && "border-white/10 text-slate-500",
                    )}
                  >
                    {s.toFixed(1)}
                  </button>
                ))}
              </div>
              {guess !== null && (
                <p className={cn("mt-2 text-[13px] leading-[1.5]", guessClose ? "text-accent-green" : "text-accent-amber")}>
                  {guessClose
                    ? `Close. Your guess of ${guess.toFixed(1)} is near the fitted slope.`
                    : `Your guess of ${guess.toFixed(1)} is off. Reveal the fitted line to compare.`}
                </p>
              )}
              {guess !== null && (
                <button
                  type="button"
                  onClick={() => setStage(2)}
                  className="mt-3 rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25"
                >
                  Reveal fitted line & residuals
                </button>
              )}
            </div>
          )}

          {stage >= 2 && (
            <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Fitted result</div>
              <div className="mt-2">
                <InlineMath>{String.raw`\hat{\beta} \approx ${TRUE_BETA.toFixed(2)}`}</InlineMath>
              </div>
              <p className="mt-2 text-[13px] leading-[1.5] text-slate-300">
                The slope of the fitted line is the estimated beta. Amber dashes show the residuals —
                the vertical gap between each point and the line.
              </p>
            </div>
          )}
        </div>
      </div>

      {stage >= 2 && (
        <Feedback status="correct">
          The slope is beta — the asset&apos;s estimated market sensitivity. The vertical distances from
          the line are residuals — the part of each period&apos;s return the market relationship does not
          explain.
        </Feedback>
      )}
    </div>
  );
}
