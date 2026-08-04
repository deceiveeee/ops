"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

export const PT_MODULE_LESSONS = [
  {
    slug: "portfolio-weights-returns",
    shortTitle: "Portfolios, Weights, and Returns",
    title: "Portfolios, Weights, and Returns",
    n: 1,
  },
  {
    slug: "portfolio-risk-covariance-correlation",
    shortTitle: "Portfolio Risk and Covariance",
    title: "Portfolio Risk, Covariance, and Correlation",
    n: 2,
  },
  {
    slug: "portfolio-diversification-many-assets",
    shortTitle: "Diversification Across Many Assets",
    title: "Diversification Across Many Assets",
    n: 3,
  },
  {
    slug: "portfolio-efficient-frontier",
    shortTitle: "The Efficient Frontier",
    title: "The Efficient Frontier",
    n: 4,
  },
  {
    slug: "portfolio-risk-free-tangency-sharpe",
    shortTitle: "Risk-Free Asset and Tangency",
    title: "The Risk-Free Asset, Tangency Portfolio, and Sharpe Ratio",
    n: 5,
  },
] as const;

const MODULE_KEY = "ops-m6-completion-v1";

export function usePTProgress() {
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

export function useReportPTComplete(slug: string) {
  const { markComplete } = usePTProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
