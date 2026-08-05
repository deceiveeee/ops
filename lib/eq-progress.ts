"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

export const EQ_MODULE_LESSONS = [
  {
    slug: "equity-what-does-owning-a-stock-mean",
    shortTitle: "What Owning a Stock Means",
    title: "What Does Owning a Stock Actually Mean?",
    n: 1,
  },
  {
    slug: "equity-why-does-a-stock-have-value-today",
    shortTitle: "Why a Stock Has Value",
    title: "Why Does a Stock Have Value Today?",
    n: 2,
  },
  {
    slug: "equity-gordon-growth-model",
    shortTitle: "Gordon Growth Model",
    title: "The Gordon Growth Model",
    n: 3,
  },
  {
    slug: "equity-multi-stage-growth-valuation",
    shortTitle: "Multi-Stage Growth",
    title: "Valuing a Company with Multiple Growth Stages",
    n: 4,
  },
  {
    slug: "equity-earnings-dividend-growth",
    shortTitle: "Earnings & Dividend Growth",
    title: "From Earnings to Dividend Growth",
    n: 5,
  },
  {
    slug: "equity-growth-opportunities-pvgo-pe",
    shortTitle: "PVGO and P/E",
    title: "Growth Opportunities, PVGO, and P/E",
    n: 6,
  },
  {
    slug: "equity-valuation-case-lab",
    shortTitle: "Equity Valuation Case Lab",
    title: "Equity Valuation Case Lab",
    n: 7,
  },
  {
    slug: "multiples-and-market-expectations",
    shortTitle: "Multiples and Expectations",
    title: "Multiples and Market Expectations",
    n: 8,
    comingSoon: true,
  },
] as const;

const MODULE_KEY = "ops-m4-completion-v1";

export function useEqProgress() {
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

export function useReportEqComplete(slug: string) {
  const { markComplete } = useEqProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
