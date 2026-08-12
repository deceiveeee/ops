"use client";

import { useState } from "react";
import { Reveal, Panel, Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

const INVESTORS = [
  {
    id: "maya",
    name: "Maya",
    action: "Buys a company two days after it reports unexpectedly strong earnings.",
    reasoning: [
      "Investors often revise expectations gradually after new information.",
      "A positive surprise can be followed by further analyst and price revisions.",
      "She checks whether the earnings change is durable and whether the price already reflects it.",
      "She will reject the idea if the historical drift disappears after risk and trading costs.",
    ],
  },
  {
    id: "daniel",
    name: "Daniel",
    action: "Buys the same company, at the same price, on the same day.",
    reasoning: [
      "The stock appears near the top of a popular screen.",
      "Several investors he follows have recently bought it.",
      "The price has risen for three weeks.",
      "He has not decided why these facts should predict a return or what would change his mind.",
    ],
  },
] as const;

const CHOICES = [
  {
    id: "maya",
    label: "Maya, because her action follows from a testable market belief",
  },
  {
    id: "daniel",
    label: "Daniel, because he uses more than one confirming signal",
  },
  {
    id: "both",
    label: "Both, because the trade and entry price are identical",
  },
  {
    id: "neither",
    label: "Neither, because a philosophy can only be judged after the trade succeeds",
  },
] as const;

export default function PhilosophyOpeningCards() {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === "maya";

  return (
    <>
      <Reveal>
        <p className="ops-body max-w-3xl text-[17px] text-slate-200">
          Maya and Daniel make the same trade. That does not mean they made the
          same decision.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {INVESTORS.map((investor) => (
            <Panel key={investor.id} className="flex flex-col">
              <div className="ops-caption text-[12px] text-accent-amber">
                Investor case
              </div>
              <h3 className="ops-interactive-title mt-2 text-xl text-white">
                {investor.name}
              </h3>
              <p className="ops-body mt-2 text-[15px] text-slate-200">
                {investor.action}
              </p>
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="ops-caption text-[12px] text-slate-400">
                  Reasoning available before the outcome
                </div>
                <ul className="mt-3 space-y-2">
                  {investor.reasoning.map((point) => (
                    <li
                      key={point}
                      className="ops-body flex items-start gap-2.5 text-[14px] text-slate-300"
                    >
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <InteractiveFrame>
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[12px] text-slate-400">
              Judge the process before the result is known
            </span>
          </div>
          <p className="ops-body-strong mt-3 text-[17px] text-slate-50">
            Who is acting from an investment philosophy?
          </p>
          <div
            className="mt-4 grid grid-cols-1 gap-2"
            role="radiogroup"
            aria-label="Who is acting from an investment philosophy?"
          >
            {CHOICES.map((choice) => {
              const isPicked = picked === choice.id;
              const isCorrect = choice.id === "maya";
              return (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={isPicked}
                  disabled={picked !== null}
                  onClick={() => setPicked(choice.id)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                    picked === null &&
                      "border-white/15 text-slate-100 hover:border-accent-amber/60 hover:bg-accent-amber/[0.04]",
                    picked !== null && isCorrect &&
                      "border-accent-green bg-accent-green/15 text-accent-green",
                    picked !== null && isPicked && !isCorrect &&
                      "border-accent-red bg-accent-red/15 text-accent-red",
                    picked !== null && !isPicked && !isCorrect &&
                      "border-white/10 text-slate-500",
                  )}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <>
              <Feedback status={correct ? "correct" : "incorrect"}>
                Maya has not proved that the trade will work. She has done
                something more basic: connected the trade to a market belief,
                an implementation rule, and evidence that could change her
                mind. Daniel has supporting facts, but no explanation for why
                they should produce a return.
              </Feedback>
              {!correct && (
                <button
                  type="button"
                  onClick={() => setPicked(null)}
                  className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                >
                  Try again
                </button>
              )}
            </>
          )}
        </InteractiveFrame>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <Panel className="bg-accent-amber/[0.04]">
          <p className="ops-body-strong text-[17px] text-white">
            A winning trade can come from weak reasoning. A losing trade can
            come from a coherent process.
          </p>
          <p className="ops-body mt-2 text-[15px] text-slate-300">
            Judge the philosophy by the quality of its logic and evidence—not
            by one outcome.
          </p>
        </Panel>
      </Reveal>
    </>
  );
}
