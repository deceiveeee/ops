"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Browser-local (localStorage) completion tracking for Module 3: Fixed-Income Securities.
 * Mirrors the Module 2 runtime/local progress pattern. No backend, runtime-derived.
 */

const COMPLETION_KEY = "ops-m3-completion-v1";

export const FI_LESSON_SLUGS = [
  "fixed-income-bond-markets-cash-flows-discount-bonds",
  "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
] as const;

export const FI_MODULE_LESSONS = [
  {
    slug: "fixed-income-bond-markets-cash-flows-discount-bonds",
    shortTitle: "Bond Markets and Discount Bonds",
    title:
      "Fixed-Income Securities I: Bond Markets, Cash Flows, and Discount Bonds",
    n: 1,
  },
  {
    slug: "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
    shortTitle: "Spot Rates, Forwards, and Coupon Bonds",
    title:
      "Fixed-Income Securities II: Spot Rates, Forward Rates, Yield Curves, and Coupon Bonds",
    n: 2,
  },
  {
    slug: "fixed-income-law-one-price-arbitrage-duration-convexity",
    shortTitle: "Arbitrage, Duration, and Convexity",
    title:
      "Fixed-Income Securities III: Law of One Price, Fixed-Income Arbitrage, Duration, and Convexity",
    n: 3,
  },
  {
    slug: "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
    shortTitle: "Credit Risk and Securitization",
    title:
      "Fixed-Income Securities IV: Corporate Bonds, Default Risk, Credit Spreads, and Securitization",
    n: 4,
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
    window.dispatchEvent(new Event("ops-m3-progress"));
  } catch {
    /* ignore */
  }
}

export function useFIProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setReady(true);
    const onChange = () => setCompletion(readCompletion());
    window.addEventListener("ops-m3-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m3-progress", onChange);
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

/** Hook for a single FI lesson to report completion once (e.g. on passing a check). */
export function useReportFIComplete(slug: string) {
  const { markComplete } = useFIProgress();
  return useCallback(() => {
    markComplete(slug);
  }, [markComplete, slug]);
}
