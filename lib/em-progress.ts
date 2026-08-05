"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

export const EM_MODULE_LESSONS = [
  {
    slug: "efficient-market-hypothesis",
    shortTitle: "Why Beating the Market Is Difficult",
    title: "Why Beating the Market Is Difficult",
    n: 1,
  },
  {
    slug: "forms-of-market-efficiency",
    shortTitle: "Forms of Market Efficiency",
    title: "Forms of Market Efficiency",
    n: 2,
    comingSoon: true,
  },
  {
    slug: "anomalies-and-limits-to-arbitrage",
    shortTitle: "Why Markets Still Make Mistakes",
    title: "Why Markets Still Make Mistakes",
    n: 3,
  },
  {
    slug: "active-vs-passive-investing",
    shortTitle: "Active vs. Passive Investing",
    title: "Active Versus Passive Investing",
    n: 4,
  },
  {
    slug: "building-investment-philosophy",
    shortTitle: "Building an Investment Philosophy",
    title: "Building an Investment Philosophy",
    n: 5,
  },
  {
    slug: "information-and-prices",
    shortTitle: "Information and Prices",
    title: "Information and Prices",
    n: 6,
    comingSoon: true,
  },
] as const;

const MODULE_KEY = "ops-m9-completion-v1";

export function useEMProgress() {
  const store = useProgressStore();
  const completion = useMemo(
    () => store.getModuleCompletion(MODULE_KEY),
    [store],
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

export function useReportEMComplete(slug: string) {
  const { markComplete } = useEMProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
