"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

type StageId = 0 | 1 | 2 | 3 | 4;

const STAGE_LABELS = [
  "Identify the portfolios",
  "Observe investor demand",
  "Demand vs supply",
  "Predict price effects",
  "Reach equilibrium",
];

function WeightBars({
  atlas,
  beacon,
  atlasTone = "cyan",
  showLabels = true,
}: {
  atlas: number;
  beacon: number;
  atlasTone?: "cyan" | "amber" | "green";
  showLabels?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-[14px] text-slate-300">
          <span>Atlas</span>
          <span className="font-sans tabular-nums text-slate-100">{atlas.toFixed(0)}%</span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={cn(
              "h-full rounded-full",
              atlasTone === "cyan" && "bg-accent-cyan/70",
              atlasTone === "amber" && "bg-accent-amber/70",
              atlasTone === "green" && "bg-accent-green/70",
            )}
            initial={false}
            animate={{ width: `${atlas}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-[14px] text-slate-300">
          <span>Beacon</span>
          <span className="font-sans tabular-nums text-slate-100">{beacon.toFixed(0)}%</span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={cn(
              "h-full rounded-full",
              atlasTone === "cyan" && "bg-accent-purple/70",
              atlasTone === "amber" && "bg-accent-red/70",
              atlasTone === "green" && "bg-accent-green/60",
            )}
            initial={false}
            animate={{ width: `${beacon}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      {showLabels && (
        <div className="pt-1 text-[14px] leading-[1.55] text-slate-500">
          Bars show the internal risky-asset composition: {atlas.toFixed(0)}% Atlas,{" "}
          {beacon.toFixed(0)}% Beacon.
        </div>
      )}
    </div>
  );
}

function PortfolioPairCard({
  label,
  sublabel,
  atlas,
  beacon,
  tone,
  caption,
}: {
  label: string;
  sublabel: string;
  atlas: number;
  beacon: number;
  tone: "cyan" | "amber";
  caption: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        tone === "cyan" ? "border-accent-cyan/25 bg-accent-cyan/[0.05]" : "border-accent-amber/25 bg-accent-amber/[0.05]",
      )}
    >
      <div className={cn("font-sans text-[12px] uppercase tracking-[0.16em]", tone === "cyan" ? "text-accent-cyan" : "text-accent-amber")}>
        {label}
      </div>
      <div className="mt-1 text-[15px] text-slate-300">{sublabel}</div>
      <div className="mt-4">
        <WeightBars atlas={atlas} beacon={beacon} atlasTone={tone} showLabels={false} />
      </div>
      <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">{caption}</p>
    </div>
  );
}

function ChoiceRow({
  question,
  options,
  correctId,
  feedback,
  onAnswered,
}: {
  question: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  feedback: ReactNode;
  onAnswered?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctId;
  return (
    <div>
      <div className="text-[16px] leading-[1.6] text-slate-200">{question}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = answered && opt.id === correctId;
          const showWrong = isSelected && !isCorrect;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => {
                setSelected(opt.id);
                onAnswered?.(opt.id === correctId);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered && !showCorrect && !showWrong && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && <div className="mt-3"><Feedback status={isCorrect ? "correct" : "incorrect"}>{feedback}</Feedback></div>}
    </div>
  );
}

function DirectionChips({
  onResolved,
}: {
  onResolved: (allCorrect: boolean) => void;
}) {
  const items: {
    key: string;
    asset: string;
    situation: string;
    question: string;
    options: { id: string; label: string }[];
    correctId: string;
    note: string;
  }[] = [
    {
      key: "beacon-price",
      asset: "Beacon",
      situation: "Over-demanded — investors collectively want more Beacon than exists.",
      question: "What happens to Beacon's price?",
      options: [
        { id: "rise", label: "Rises" },
        { id: "fall", label: "Falls" },
      ],
      correctId: "rise",
      note: "Buyers compete for scarce shares, pushing Beacon's current price up.",
    },
    {
      key: "beacon-er",
      asset: "Beacon",
      situation: "Beacon's price has risen.",
      question: "For a given expected future payoff, what happens to Beacon's expected return?",
      options: [
        { id: "fall", label: "Falls" },
        { id: "rise", label: "Rises" },
      ],
      correctId: "fall",
      note: "A higher price today for the same expected payoff means a lower expected return.",
    },
    {
      key: "beacon-weight",
      asset: "Beacon",
      situation: "Beacon's expected return has fallen.",
      question: "What happens to Beacon's desired tangency weight?",
      options: [
        { id: "fall", label: "Decreases" },
        { id: "rise", label: "Increases" },
      ],
      correctId: "fall",
      note: "Lower expected return makes Beacon less attractive in the tangency portfolio.",
    },
    {
      key: "atlas-price",
      asset: "Atlas",
      situation: "Under-demanded — investors collectively want less Atlas than exists.",
      question: "What happens to Atlas's price?",
      options: [
        { id: "fall", label: "Falls" },
        { id: "rise", label: "Rises" },
      ],
      correctId: "fall",
      note: "Sellers avoid Atlas, pushing its current price down.",
    },
    {
      key: "atlas-er",
      asset: "Atlas",
      situation: "Atlas's price has fallen.",
      question: "What happens to Atlas's expected return?",
      options: [
        { id: "rise", label: "Rises" },
        { id: "fall", label: "Falls" },
      ],
      correctId: "rise",
      note: "A lower price today for the same expected payoff means a higher expected return.",
    },
    {
      key: "atlas-weight",
      asset: "Atlas",
      situation: "Atlas's expected return has risen.",
      question: "What happens to Atlas's desired tangency weight?",
      options: [
        { id: "rise", label: "Increases" },
        { id: "fall", label: "Decreases" },
      ],
      correctId: "rise",
      note: "Higher expected return makes Atlas more attractive in the tangency portfolio.",
    },
  ];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const allAnswered = items.every((it) => answers[it.key] !== undefined);
  const allCorrect = items.every((it) => answers[it.key] === it.correctId);

  const choose = (k: string, id: string) => {
    if (answers[k] !== undefined) return;
    const next = { ...answers, [k]: id };
    setAnswers(next);
    if (items.every((it) => next[it.key] !== undefined)) {
      onResolved(items.every((it) => next[it.key] === it.correctId));
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {items.map((it) => {
          const selected = answers[it.key];
          const answered = selected !== undefined;
          const isCorrect = selected === it.correctId;
          return (
            <div key={it.key} className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-6 items-center rounded-md border px-2 font-sans text-[12px]",
                    it.asset === "Beacon"
                      ? "border-accent-purple/50 text-accent-purple"
                      : "border-accent-cyan/50 text-accent-cyan",
                  )}
                >
                  {it.asset}
                </span>
                <span className="text-[14px] text-slate-400">{it.situation}</span>
              </div>
              <div className="mt-3 text-[15px] leading-[1.5] text-slate-200">{it.question}</div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {it.options.map((opt) => {
                  const isSelected = selected === opt.id;
                  const showCorrect = answered && opt.id === it.correctId;
                  const showWrong = isSelected && !isCorrect;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={answered}
                      onClick={() => choose(it.key, opt.id)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-[14px] transition-colors",
                        showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                        showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                        !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                        answered && !showCorrect && !showWrong && "border-white/10 text-slate-500",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p className={cn("mt-2.5 text-[14px] leading-[1.55]", isCorrect ? "text-slate-300" : "text-accent-red/90")}>
                  {it.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {allAnswered && (
        <Feedback status={allCorrect ? "correct" : "info"}>
          {allCorrect
            ? "Exactly. Over-demand pushes Beacon's price up and expected return down, shrinking its desired tangency weight. Under-demand does the opposite to Atlas. Prices and expected returns move until the tangency portfolio matches the supply weights."
            : "The correct chain is shown above. Over-demand raises Beacon's price and lowers its expected return, reducing its desired tangency weight. Atlas moves the opposite way."}
        </Feedback>
      )}
    </div>
  );
}

export default function MarketClearingLab() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<StageId>(0);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [converging, setConverging] = useState(false);

  const markDone = (s: number, ok = true) => setDone((p) => ({ ...p, [s]: ok }));
  const canAdvance = (s: number) => done[s] === true;
  const next = () => setStage((Math.min(4, stage + 1)) as StageId);
  const prev = () => setStage((Math.max(0, stage - 1)) as StageId);

  const T_DESIRED_ATLAS = 60;
  const T_DESIRED_BEACON = 40;
  const M_ATLAS = 75;
  const M_BEACON = 25;
  const atlasNow = converging ? M_ATLAS : T_DESIRED_ATLAS;
  const beaconNow = converging ? M_BEACON : T_DESIRED_BEACON;

  return (
    <div className="ops-interactive-frame relative overflow-hidden p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        {STAGE_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStage(i as StageId)}
            className={cn(
              "flex h-9 items-center gap-2 rounded-full border px-3.5 font-sans text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              stage === i
                ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                : done[i]
                  ? "border-accent-green/40 bg-accent-green/10 text-accent-green hover:border-accent-green/60"
                  : "border-white/15 text-slate-400 hover:border-white/30 hover:text-slate-200",
            )}
          >
            <span className="tabular-nums">{i + 1}</span>
            <span className="hidden font-sans text-[13px] normal-case tracking-normal sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {stage === 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <PortfolioPairCard
              label="Portfolio A"
              sublabel="Found by portfolio optimization"
              atlas={T_DESIRED_ATLAS}
              beacon={T_DESIRED_BEACON}
              tone="cyan"
              caption="Offers the highest expected excess return per unit of volatility. It is the risky portfolio investors prefer under the model."
            />
            <PortfolioPairCard
              label="Portfolio B"
              sublabel="Built from what exists"
              atlas={M_ATLAS}
              beacon={M_BEACON}
              tone="amber"
              caption="The value-weighted portfolio of every risky asset in the market. Each weight is market value ÷ total market value."
            />
            <div className="md:col-span-2">
              <div className="space-y-5">
                <ChoiceRow
                  question="Which portfolio is the maximum-Sharpe risky portfolio (the tangency portfolio T)?"
                  options={[{ id: "A", label: "Portfolio A" }, { id: "B", label: "Portfolio B" }]}
                  correctId="A"
                  feedback="Portfolio A is T — defined by optimization, by what investors prefer."
                  onAnswered={(c) => c && markDone(0, done[0] ?? false)}
                />
                <ChoiceRow
                  question="Which portfolio is the value-weighted portfolio of all risky assets (the market portfolio M)?"
                  options={[{ id: "A", label: "Portfolio A" }, { id: "B", label: "Portfolio B" }]}
                  correctId="B"
                  feedback="Portfolio B is M — defined by asset supply, by what actually exists. At this point there is no reason to assume T = M."
                  onAnswered={(c) => c && markDone(0, true)}
                />
              </div>
            </div>
          </div>
        )}

        {stage === 1 && (
          <div>
            <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
              Three investors choose different total risky allocations — but every risky dollar
              goes into the <em className="text-slate-100">same</em> tangency portfolio, with the
              same internal 60/40 composition.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Conservative", tangency: 30, rf: 70 },
                { label: "Moderate", tangency: 100, rf: 0 },
                { label: "Aggressive", tangency: 150, rf: -50 },
              ].map((inv) => (
                <div key={inv.label} className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
                  <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">{inv.label}</div>
                  <div className="mt-2 font-sans text-[15px] text-slate-100">
                    {inv.tangency}% T · <span className={inv.rf < 0 ? "text-accent-red" : "text-accent-green"}>{inv.rf > 0 ? "+" : ""}{inv.rf}% r_f</span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 text-[13px] text-slate-400">Risky part (always 60/40):</div>
                    <WeightBars atlas={60} beacon={40} atlasTone="cyan" showLabels={false} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <ChoiceRow
                question="Do these investors hold different risky portfolios?"
                options={[
                  { id: "yes", label: "Yes — different risky mixes" },
                  { id: "no", label: "No — different quantities of the same risky portfolio" },
                ]}
                correctId="no"
                feedback="Correct. The aggressive investor borrows to hold more of T, but the internal 60/40 composition is unchanged. Investors disagree about how much market risk to take, but under the model they agree about which risky portfolio to hold."
                onAnswered={(c) => c && markDone(1, true)}
              />
            </div>
          </div>
        )}

        {stage === 2 && (
          <div>
            <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
              Now compare what investors collectively want with what the market supplies.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <PortfolioPairCard
                label="Investors collectively want: T"
                sublabel="Desired risky portfolio"
                atlas={T_DESIRED_ATLAS}
                beacon={T_DESIRED_BEACON}
                tone="cyan"
                caption={<>They demand 60% Atlas and 40% Beacon.</>}
              />
              <PortfolioPairCard
                label="The market supplies: M"
                sublabel="Risky assets that exist"
                atlas={M_ATLAS}
                beacon={M_BEACON}
                tone="amber"
                caption={<>Only 75% Atlas and 25% Beacon exist, by value.</>}
              />
            </div>
            <div className="mt-6">
              <ChoiceRow
                question="Can every share be held if investors collectively want a different portfolio from the one the market supplies?"
                options={[
                  { id: "yes", label: "Yes — the market can clear as-is" },
                  { id: "no", label: "No — this cannot be an equilibrium" },
                ]}
                correctId="no"
                feedback="Correct. Investors demand more Beacon than exists and less Atlas than exists. Every issued share must be held by someone, so aggregate demand does not match aggregate supply. This cannot be an equilibrium."
                onAnswered={(c) => c && markDone(2, true)}
              />
            </div>
          </div>
        )}

        {stage === 3 && (
          <div>
            <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
              Predict the chain of effects. Remember: the tangency portfolio depends partly on
              expected returns, and expected return moves opposite to current price.
            </p>
            <div className="mt-6">
              <DirectionChips onResolved={(allCorrect) => markDone(3, allCorrect)} />
            </div>
          </div>
        )}

        {stage === 4 && (
          <div>
            <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
              Press the button to let prices adjust. The desired tangency weights move toward the
              market-supply weights until the two match.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
                <div className="mb-2 font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
                  {converging ? "After adjustment" : "Before adjustment"}
                </div>
                <div className="mb-1 text-[15px] text-slate-300">Tangency portfolio T</div>
                <WeightBars atlas={atlasNow} beacon={beaconNow} atlasTone={converging ? "green" : "cyan"} showLabels={false} />
                <div className="mt-5 mb-1 text-[15px] text-slate-300">Market supply M</div>
                <WeightBars atlas={M_ATLAS} beacon={M_BEACON} atlasTone="amber" showLabels={false} />
              </div>
              <div>
                {!converging ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConverging(true);
                      markDone(4, true);
                    }}
                    className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-6 py-3 text-[15px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                  >
                    Let prices adjust →
                  </button>
                ) : (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6"
                  >
                    <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">Equilibrium reached</div>
                    <div className="mt-3 text-[18px] text-white">T = M</div>
                    <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                      Beacon&apos;s price rose and expected return fell until investors wanted less of it;
                      Atlas&apos;s price fell and expected return rose until investors wanted more. The
                      risky portfolio investors collectively want now matches the risky assets that
                      actually exist.
                    </p>
                  </motion.div>
                )}
                <p className="mt-4 text-[14px] leading-[1.55] text-slate-500">
                  This is a simplified equilibrium mechanism. Real prices do not adjust instantly or
                  perfectly.
                </p>
              </div>
            </div>
            {converging && (
              <div className="mt-6">
                <Feedback status="correct">
                  <span>
                    Aggregate demand = aggregate supply <InlineMath>{String.raw`\Rightarrow`}</InlineMath>{" "}
                    <InlineMath>{String.raw`T = M`}</InlineMath>. The tangency portfolio becomes the
                    market portfolio because asset prices adjust until the two match.
                  </span>
                </Feedback>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={prev}
          disabled={stage === 0}
          className="rounded-full border border-white/15 px-5 py-2 font-sans text-[13px] text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
        >
          ← Back
        </button>
        <span className="font-sans text-[13px] tabular-nums text-slate-500" aria-hidden>
          {stage + 1} / {STAGE_LABELS.length}
        </span>
        {stage < 4 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance(stage)}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2 font-sans text-[13px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 disabled:opacity-40 disabled:hover:bg-accent-cyan/15"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setStage(0);
              setDone({});
              setConverging(false);
            }}
            className="rounded-full border border-white/15 px-5 py-2 font-sans text-[13px] text-slate-300 transition-colors hover:border-white/30 hover:text-white"
          >
            ↺ Restart
          </button>
        )}
      </div>
    </div>
  );
}
