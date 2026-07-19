"use client";

import { useCallback, useEffect, useState } from "react";

const COMPLETION_KEY = "ops-m8-completion-v1";

export const CB_MODULE_LESSONS = [
  {
    slug: "required-return-to-discount-rate",
    shortTitle: "Required Return → Discount Rate",
    title: "From Required Return to Discount Rate",
    n: 1,
  },
  {
    slug: "determining-the-discount-rate",
    shortTitle: "Identifying Corporate Investments",
    title: "How Investors Identify and Evaluate Corporate Investments",
    n: 2,
  },
  {
    slug: "when-risk-changes-over-time",
    shortTitle: "When Risk Changes Over Time",
    title: "When Risk Changes Over Time",
    n: 3,
  },
  {
    slug: "npv-rule",
    shortTitle: "NPV: Value-Creation Rule",
    title: "Net Present Value as the Value-Creation Rule",
    n: 4,
  },
  {
    slug: "irr-and-payback",
    shortTitle: "Useful Shortcuts",
    title: "Useful Shortcuts, Wrong Decisions",
    n: 5,
  },
  {
    slug: "project-cash-flows",
    shortTitle: "Evaluating Capital Allocation",
    title: "Evaluating Management\u2019s Capital Allocation",
    n: 6,
  },
  {
    slug: "sensitivity-and-scenario-analysis",
    shortTitle: "Capital Allocation Case",
    title: "The Capital Allocation Case: Reinvest, Acquire, or Return Cash?",
    n: 7,
  },
  {
    slug: "real-options-intuition",
    shortTitle: "Real Options",
    title: "Real Options Intuition",
    n: 8,
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
    window.dispatchEvent(new Event("ops-m8-progress"));
  } catch {
    /* ignore */
  }
}

export function useCBProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setReady(true);
    const onChange = () => setCompletion(readCompletion());
    window.addEventListener("ops-m8-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m8-progress", onChange);
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

export function useReportCBComplete(slug: string) {
  const { markComplete } = useCBProgress();
  return useCallback(() => {
    markComplete(slug);
  }, [markComplete, slug]);
}
