"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

export const CAPM_MODULE_LESSONS = [
  {
    slug: "capm-tangency-becomes-market-portfolio",
    shortTitle: "Tangency Becomes the Market",
    title: "The Tangency Portfolio Becomes the Market Portfolio",
    n: 1,
  },
  {
    slug: "security-market-line",
    shortTitle: "Security Market Line",
    title: "The Security Market Line: What Return Is Enough for This Beta?",
    n: 2,
  },
  {
    slug: "capm-estimating-beta",
    shortTitle: "Estimating Beta",
    title: "Estimating Beta: From Return Data to Market Exposure",
    n: 3,
  },
  {
    slug: "capm-alpha-and-performance",
    shortTitle: "Alpha & Performance",
    title: "Alpha, Performance, and the Limits of CAPM",
    n: 4,
  },
  {
    slug: "capm-apt-in-practice",
    shortTitle: "CAPM & APT in Practice",
    title: "CAPM and APT in Practice",
    n: 5,
  },
] as const;

const MODULE_KEY = "ops-m7-completion-v1";

export function useCAPMProgress() {
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

export function useReportCAPMComplete(slug: string) {
  const { markComplete } = useCAPMProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
