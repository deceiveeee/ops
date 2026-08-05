"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgressStore } from "@/lib/progress/store";

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

const MODULE_KEY = "ops-m2-completion-v1";
const MASTERY_KEY = "ops-m2-mastery-v1";

type MasteryState = Partial<Record<MasterySkill, MasteryLevel>>;

function readMastery(): MasteryState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MASTERY_KEY);
    return raw ? (JSON.parse(raw) as MasteryState) : {};
  } catch {
    return {};
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
  const store = useProgressStore();
  const completion = useMemo(
    () => store.getModuleCompletion(MODULE_KEY),
    [store],
  );
  const [mastery, setMasteryState] = useState<MasteryState>({});

  useEffect(() => {
    setMasteryState(readMastery());
    const onChange = () => setMasteryState(readMastery());
    window.addEventListener("ops-m2-progress", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ops-m2-progress", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const markComplete = useCallback(
    (slug: string) => store.markComplete(MODULE_KEY, slug),
    [store],
  );

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
      if (prev[skill] === "mastered" && level !== "mastered") return prev;
      const next = { ...prev, [skill]: level };
      writeMastery(next);
      return next;
    });
  }, []);

  const masteredCount = MASTERY_SKILLS.filter((s) => mastery[s.key] === "mastered").length;

  return {
    ready: store.ready,
    completion,
    mastery,
    isComplete,
    markComplete,
    capstoneUnlocked,
    setMastery,
    masteredCount,
  };
}

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
