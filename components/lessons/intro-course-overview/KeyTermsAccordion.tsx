"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { KEY_TERMS } from "./lessonContent";
import { cn } from "@/lib/utils";

export default function KeyTermsAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="space-y-2.5">
      {KEY_TERMS.map((t, i) => {
        const isOpen = open === i;
        return (
          <div
            key={t.term}
            className={cn(
              "overflow-hidden rounded-xl border bg-white/[0.02] transition-colors",
              isOpen
                ? "border-accent-cyan/40 bg-accent-cyan/[0.04]"
                : "border-white/10",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              <span className="flex items-center gap-3.5">
                <span className="ops-caption text-[10px] text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg font-medium tracking-tight text-white">
                  {t.term}
                </span>
              </span>
              <span
                className={cn(
                  "font-mono text-base text-accent-cyan transition-transform",
                  isOpen && "rotate-45",
                )}
                aria-hidden
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="ops-definition px-5 pb-5 pl-[3.25rem] text-[16px]">
                    {t.def}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
