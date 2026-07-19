"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Browser-local (localStorage) progress for Module 2: Present Value Relations.
 * No backend. Runtime-derived, not hard-coded into lesson data.
 * Used to gate the CFO Decision Room capstone until the three PV lessons
 * are complete, and to track Mastery Road skill levels.
 */

export type MasteryLevel = "not-started" | "learning" | "mastered";

export type MasterySkill =
  | "timeline-reading"
  | "discounting"
  | "npv-decisions"
  | "perpetuity-logic"
  | "annuity-logic"
  | "compounding"
  | "real-vs-nominal";

export const MASTERY_SKILLS: { key: MasterySkill; label: string }[] = [
  { key: "timeline-reading", label: "Timeline Reading" },
  { key: "discounting", label: "Discounting" },
  { key: "npv-decisions", label: "NPV Decisions" },
  { key: "perpetuity-logic", label: "Perpetuity Logic" },
  { key: "annuity-logic", label: "Annuity Logic" },
  { key: "compounding", label: "Compounding" },
  { key: "real-vs-nominal", label: "Real vs Nominal" },
];

export const PV_LESSON_SLUGS = [
  "present-value-cashflows-assets-npv",
  "present-value-perpetuities-annuities-compounding",
  "present-value-inflation-real-nominal",
] as const;

const COMPLETION_KEY = "ops-m2-completion-v1";
const MASTERY_KEY = "ops-m2-mastery-v1";

type MasteryState = Partial<Record<MasterySkill, MasteryLevel>>;

function readCompletion(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COMPLETION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function readMastery(): MasteryState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MASTERY_KEY);
    return raw ? (JSON.parse(raw) as MasteryState) : {};
  } catch {
    return {};
  }
}

function writeCompletion(v: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event("ops-m2-progress"));
  } catch {
    /* ignore quota / private mode errors */
  }
}

function writeMastery(v: MasteryState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MASTERY_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event("ops-m2-progress"));
  } catch {
    /* ignore */
  }
}

export function usePVProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [mastery, setMasteryState] = useState<MasteryState>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setMasteryState(readMastery());
    setReady(true);

    const onChange = () => {
      setCompletion(readCompletion());
      setMasteryState(readMastery());
    };
    window.addEventListener("ops-m2-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m2-progress", onChange);
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

  const capstoneUnlocked = useCallback(
    () => PV_LESSON_SLUGS.every((s) => completion[s]),
    [completion],
  );

  const setMastery = useCallback((skill: MasterySkill, level: MasteryLevel) => {
    setMasteryState((prev) => {
      // never downgrade a mastered skill to learning
      if (prev[skill] === "mastered" && level !== "mastered") return prev;
      const next = { ...prev, [skill]: level };
      writeMastery(next);
      return next;
    });
  }, []);

  const masteredCount = MASTERY_SKILLS.filter((s) => mastery[s.key] === "mastered").length;

  return {
    ready,
    completion,
    mastery,
    isComplete,
    markComplete,
    capstoneUnlocked,
    setMastery,
    masteredCount,
  };
}

/** Hook for a single lesson to report completion + mastery once (e.g. on passing a check). */
export function useReportLessonComplete(slug: string, skills: MasterySkill[]) {
  const { markComplete, setMastery } = usePVProgress();
  return useCallback(
    (mastered: boolean) => {
      markComplete(slug);
      skills.forEach((sk) => setMastery(sk, mastered ? "mastered" : "learning"));
    },
    [markComplete, setMastery, slug, skills],
  );
}
