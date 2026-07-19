"use client";

import { motion, useReducedMotion } from "motion/react";
import { InteractiveFrame, TryItTag } from "./shared";

const PROMPTS = [
  "What are your current or future sources of cash inflow?",
  "What real assets are you investing in?",
  "What financial assets do you own or expect to own?",
  "What financial liabilities do you have or expect to have?",
  "What is your main objective: short-term spending, long-term investing, education, retirement, security, or something else?",
  "How do time and risk affect your decisions?",
];

export default function MiniActivity() {
  const reduce = useReducedMotion();
  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Mini activity
        </span>
      </div>
      <h3 className="ops-interactive-title mt-3 text-xl">
        Apply the Framework to Yourself
      </h3>
      <p className="ops-body mt-2.5 text-[15px] text-slate-200">
        Create a simple personal financial flow model.
      </p>

      <div className="mt-6 space-y-5">
        {PROMPTS.map((p, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <label
              className="ops-body-strong text-[15px] text-slate-100"
              htmlFor={`ma-${i}`}
            >
              {i + 1}. {p}
            </label>
            <textarea
              id={`ma-${i}`}
              aria-label={p}
              placeholder="Local only — not saved."
              rows={2}
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
            />
          </motion.div>
        ))}
      </div>

      <div className="ops-definition-card mt-6 p-5">
        <div className="ops-caption text-[11px] text-accent-cyan">Compare</div>
        <p className="ops-definition mt-2.5 text-[16px]">
          Now compare your personal financial framework to a company&apos;s
          framework. Both involve cash inflows, investment decisions, financing
          decisions, risk management, and objectives.
        </p>
      </div>
    </InteractiveFrame>
  );
}
