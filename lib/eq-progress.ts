"use client";

import { useCallback, useEffect, useState } from "react";

const COMPLETION_KEY = "ops-m4-completion-v1";

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

function readCompletion(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COMPLETION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeCompletion(v: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event("ops-m4-progress"));
  } catch {
    /* ignore */
  }
}

export function useEqProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setReady(true);
    const onChange = () => setCompletion(readCompletion());
    window.addEventListener("ops-m4-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m4-progress", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const markComplete = useCallback((slug: string) => {
    setCompletion((prev) => {
      if (prev[slug]) return prev;
      const next = { ...prev, [slug]: true };
      writeCompletion(next);
      return next;
    });
  }, []);

  const isComplete = useCallback(
    (slug: string) => Boolean(completion[slug]),
    [completion],
  );

  return { ready, completion, isComplete, markComplete };
}

export function useReportEqComplete(slug: string) {
  const { markComplete } = useEqProgress();
  return useCallback(() => {
    markComplete(slug);
  }, [markComplete, slug]);
}
