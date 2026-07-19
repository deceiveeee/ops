"use client";

import { useCallback, useEffect, useState } from "react";

const COMPLETION_KEY = "ops-m9-completion-v1";

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
    window.dispatchEvent(new Event("ops-m9-progress"));
  } catch {
    /* ignore */
  }
}

export function useEMProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setReady(true);
    const onChange = () => setCompletion(readCompletion());
    window.addEventListener("ops-m9-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m9-progress", onChange);
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

export function useReportEMComplete(slug: string) {
  const { markComplete } = useEMProgress();
  return useCallback(() => {
    markComplete(slug);
  }, [markComplete, slug]);
}
