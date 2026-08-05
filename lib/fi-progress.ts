"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

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

const MODULE_KEY = "ops-m3-completion-v1";

export function useFIProgress() {
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

export function useReportFIComplete(slug: string) {
  const { markComplete } = useFIProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
