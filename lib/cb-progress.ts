"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

export const CB_MODULE_LESSONS = [
  {
    slug: "required-return-to-discount-rate",
    shortTitle: "Required Return → Discount Rate",
    title: "From Required Return to Discount Rate",
    n: 1,
  },
  {
    slug: "determining-the-discount-rate",
    shortTitle: "Identifying Corporate Investments",
    title: "How Investors Identify and Evaluate Corporate Investments",
    n: 2,
  },
  {
    slug: "when-risk-changes-over-time",
    shortTitle: "When Risk Changes Over Time",
    title: "When Risk Changes Over Time",
    n: 3,
  },
  {
    slug: "npv-rule",
    shortTitle: "NPV: Value-Creation Rule",
    title: "Net Present Value as the Value-Creation Rule",
    n: 4,
  },
  {
    slug: "irr-and-payback",
    shortTitle: "Useful Shortcuts",
    title: "Useful Shortcuts, Wrong Decisions",
    n: 5,
  },
  {
    slug: "project-cash-flows",
    shortTitle: "Evaluating Capital Allocation",
    title: "Evaluating Management\u2019s Capital Allocation",
    n: 6,
  },
  {
    slug: "sensitivity-and-scenario-analysis",
    shortTitle: "Capital Allocation Case",
    title: "The Capital Allocation Case: Reinvest, Acquire, or Return Cash?",
    n: 7,
  },
  {
    slug: "real-options-intuition",
    shortTitle: "Real Options",
    title: "Real Options Intuition",
    n: 8,
  },
] as const;

const MODULE_KEY = "ops-m8-completion-v1";

export function useCBProgress() {
  const store = useProgressStore();
  const completion = useMemo(
    () => store.getModuleCompletion(MODULE_KEY),
    [store, store.getModuleCompletion],
  );
  const isComplete = useCallback(
    (slug: string) => Boolean(completion[slug]),
    [completion],
  );
  const markComplete = useCallback(
    (slug: string) => store.markComplete(MODULE_KEY, slug),
    [store],
  );
  return { ready: store.ready, completion, isComplete, markComplete };
}

export function useReportCBComplete(slug: string) {
  const { markComplete } = useCBProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
