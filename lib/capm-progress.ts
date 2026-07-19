"use client";

import { useCallback, useEffect, useState } from "react";

const COMPLETION_KEY = "ops-m7-completion-v1";

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
    window.dispatchEvent(new Event("ops-m7-progress"));
  } catch {
    /* ignore */
  }
}

export function useCAPMProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setReady(true);
    const onChange = () => setCompletion(readCompletion());
    window.addEventListener("ops-m7-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m7-progress", onChange);
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

export function useReportCAPMComplete(slug: string) {
  const { markComplete } = useCAPMProgress();
  return useCallback(() => {
    markComplete(slug);
  }, [markComplete, slug]);
}
