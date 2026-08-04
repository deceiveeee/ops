"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

export const RR_MODULE_LESSONS = [
  {
    slug: "risk-return-what-they-mean",
    shortTitle: "What Risk and Return Mean",
    title: "What Risk and Return Actually Mean",
    n: 1,
  },
  {
    slug: "risk-measuring-historical-return-volatility",
    shortTitle: "Measuring Return and Volatility",
    title: "Measuring Historical Return and Volatility",
    n: 2,
  },
  {
    slug: "risk-covariance-correlation-diversification",
    shortTitle: "Covariance and Diversification",
    title: "Covariance, Correlation, and Diversification",
    n: 3,
  },
  {
    slug: "risk-systematic-idiosyncratic-beta",
    shortTitle: "Systematic Risk and Beta",
    title: "Systematic Risk, Idiosyncratic Risk, and Beta",
    n: 4,
  },
  {
    slug: "risk-empirical-properties-stock-returns",
    shortTitle: "Empirical Properties of Returns",
    title: "Empirical Properties of Stock Returns",
    n: 5,
  },
  {
    slug: "risk-portfolio-risk-lab",
    shortTitle: "Portfolio Risk Lab",
    title: "Portfolio Risk Lab",
    n: 6,
  },
] as const;

const MODULE_KEY = "ops-m5-completion-v1";

export function useRRProgress() {
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

export function useReportRRComplete(slug: string) {
  const { markComplete } = useRRProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
