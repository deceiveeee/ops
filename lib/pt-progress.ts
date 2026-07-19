"use client";

import { useCallback, useEffect, useState } from "react";

const COMPLETION_KEY = "ops-m6-completion-v1";

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
    window.dispatchEvent(new Event("ops-m6-progress"));
  } catch {
    /* ignore */
  }
}

export function usePTProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setReady(true);
    const onChange = () => setCompletion(readCompletion());
    window.addEventListener("ops-m6-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m6-progress", onChange);
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

export function useReportPTComplete(slug: string) {
  const { markComplete } = usePTProgress();
  return useCallback(() => {
    markComplete(slug);
  }, [markComplete, slug]);
}
