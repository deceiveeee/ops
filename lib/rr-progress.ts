"use client";

import { useCallback, useEffect, useState } from "react";

const COMPLETION_KEY = "ops-m5-completion-v1";

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
    window.dispatchEvent(new Event("ops-m5-progress"));
  } catch {
    /* ignore */
  }
}

export function useRRProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setReady(true);
    const onChange = () => setCompletion(readCompletion());
    window.addEventListener("ops-m5-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m5-progress", onChange);
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

export function useReportRRComplete(slug: string) {
  const { markComplete } = useRRProgress();
  return useCallback(() => {
    markComplete(slug);
  }, [markComplete, slug]);
}
