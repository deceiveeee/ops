"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Browser-local (localStorage) working state for Lesson 7.7 — CAPM and APT in
 * Practice. No backend. Saves guided-practice category progress, the Orion Fund
 * case stage and written memo, mastery-check attempts, and overall completion.
 * Pattern follows lib/pv-progress.ts.
 */

const STATE_KEY = "ops-m7-l77-state-v1";
const EVENT = "ops-m7-l77-progress";

export type PracticeCategoryId = "A" | "B" | "C" | "D" | "E" | "F";

export const PRACTICE_CATEGORIES: {
  id: PracticeCategoryId;
  label: string;
  title: string;
}[] = [
  { id: "A", label: "A", title: "Market portfolio & equilibrium" },
  { id: "B", label: "B", title: "Beta & portfolio exposure" },
  { id: "C", label: "C", title: "Security Market Line" },
  { id: "D", label: "D", title: "Beta estimation" },
  { id: "E", label: "E", title: "Alpha & performance" },
  { id: "F", label: "F", title: "APT & multifactor models" },
];

export type OrionMemo = {
  market: string;
  capm: string;
  multifactor: string;
  conclusion: string;
};

export type MasteryRecord = {
  attempts: number;
  lastScorePct: number;
  passed: boolean;
  weakCategories: string[];
};

export type Lesson77State = {
  categories: Partial<Record<PracticeCategoryId, boolean>>;
  clinicDone: boolean;
  orionStage: number; // highest stage the learner has reached (1..6)
  orionMemo: OrionMemo;
  orionComplete: boolean;
  mastery: MasteryRecord | null;
  challenges: Record<string, boolean>;
  completed: boolean;
};

const DEFAULT_STATE: Lesson77State = {
  categories: {},
  clinicDone: false,
  orionStage: 1,
  orionMemo: { market: "", capm: "", multifactor: "", conclusion: "" },
  orionComplete: false,
  mastery: null,
  challenges: {},
  completed: false,
};

function readState(): Lesson77State {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<Lesson77State>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      orionMemo: { ...DEFAULT_STATE.orionMemo, ...(parsed.orionMemo ?? {}) },
      categories: { ...(parsed.categories ?? {}) },
      challenges: { ...(parsed.challenges ?? {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(v: Lesson77State) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore quota / private mode errors */
  }
}

export function useLesson77State() {
  const [state, setState] = useState<Lesson77State>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(readState());
    setReady(true);
    const onChange = () => setState(readState());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((mut: (prev: Lesson77State) => Lesson77State) => {
    setState((prev) => {
      const next = mut(prev);
      writeState(next);
      return next;
    });
  }, []);

  const setCategoryDone = useCallback(
    (id: PracticeCategoryId, done: boolean) => {
      update((prev) => ({ ...prev, categories: { ...prev.categories, [id]: done } }));
    },
    [update],
  );

  const setClinicDone = useCallback(
    (done: boolean) => update((prev) => ({ ...prev, clinicDone: done })),
    [update],
  );

  const setOrionStage = useCallback(
    (stage: number) =>
      update((prev) => ({ ...prev, orionStage: Math.max(prev.orionStage, stage) })),
    [update],
  );

  const setOrionMemo = useCallback(
    (memo: OrionMemo) => update((prev) => ({ ...prev, orionMemo: memo })),
    [update],
  );

  const setOrionComplete = useCallback(
    (done: boolean) => update((prev) => ({ ...prev, orionComplete: done })),
    [update],
  );

  const setMastery = useCallback(
    (rec: MasteryRecord) => update((prev) => ({ ...prev, mastery: rec })),
    [update],
  );

  const setChallengeDone = useCallback(
    (id: string, done: boolean) =>
      update((prev) => ({ ...prev, challenges: { ...prev.challenges, [id]: done } })),
    [update],
  );

  const setCompleted = useCallback(
    (done: boolean) => update((prev) => ({ ...prev, completed: done })),
    [update],
  );

  const categoriesDoneCount = PRACTICE_CATEGORIES.filter(
    (c) => state.categories[c.id],
  ).length;

  /** Completion gate: all categories, clinic, Orion case, mastery passed. */
  const gateSatisfied =
    categoriesDoneCount === PRACTICE_CATEGORIES.length &&
    state.clinicDone &&
    state.orionComplete &&
    Boolean(state.mastery?.passed);

  return {
    ready,
    state,
    setCategoryDone,
    setClinicDone,
    setOrionStage,
    setOrionMemo,
    setOrionComplete,
    setMastery,
    setChallengeDone,
    setCompleted,
    categoriesDoneCount,
    gateSatisfied,
  };
}
