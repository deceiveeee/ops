"use client";

import { Reveal, Panel } from "./shared";

/**
 * Section 5 — Why does an investor need a philosophy?
 * Introduction + three failure-mode cards.
 */

const FAILURE_MODES = [
  {
    id: "magic",
    title: "The magic-strategy problem",
    body: "Without a coherent framework, every new claim can sound persuasive: “This indicator predicts every major decline.” “This one ratio identifies undervalued stocks.” “This trading system works in every market.” The investor has no standard for evaluating whether the claim is economically sensible, repeatable, or compatible with real costs.",
    examples: [
      "“This indicator predicts every major decline.”",
      "“This one ratio identifies undervalued stocks.”",
      "“This trading system works in every market.”",
    ],
  },
  {
    id: "chasing",
    title: "The performance-chasing problem",
    body: "The investor repeatedly adopts whichever strategy performed best recently. Growth performs well, so the investor becomes a growth investor. Value then performs well, so the investor switches to value. Momentum performs well next, so the investor changes again. Recent performance becomes the philosophy.",
  },
  {
    id: "poor-fit",
    title: "The poor-fit problem",
    body: "A strategy may be reasonable and still be wrong for a particular investor. A long-horizon value strategy may fail for an investor who needs cash next year. A high-turnover strategy may fail after costs and taxes. A concentrated strategy may be abandoned during the first major decline. A philosophy must fit the investor who has to execute it.",
  },
] as const;

export default function PhilosophyNeed() {
  return (
    <>
      <Reveal>
        <p className="ops-body mt-2 max-w-3xl text-[17px] text-slate-200">
          An investment philosophy does not guarantee superior returns. Its
          purpose is to give the investor a stable framework for deciding:
        </p>
        <ul className="mt-4 max-w-3xl space-y-2">
          {[
            "which evidence matters;",
            "which strategies are compatible with the investor;",
            "whether poor results reflect normal variation or a broken idea;",
            "when a strategy should be revised;",
            "when a strategy should never have been adopted.",
          ].map((t) => (
            <li
              key={t}
              className="ops-body flex items-start gap-2.5 text-[16px] text-slate-200"
            >
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
              {t}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {FAILURE_MODES.map((m) => (
            <Panel key={m.id} className="flex flex-col">
              <div className="ops-caption text-[10px] text-accent-red">
                Failure mode
              </div>
              <h3 className="ops-interactive-title mt-2 text-lg text-white">
                {m.title}
              </h3>
              <p className="ops-body mt-3 flex-1 text-[14px] leading-relaxed text-slate-300">
                {m.body}
              </p>
              {"examples" in m && m.examples && (
                <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                  {m.examples.map((ex) => (
                    <li
                      key={ex}
                      className="font-sans text-[12px] italic text-slate-400"
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          ))}
        </div>
      </Reveal>
    </>
  );
}
