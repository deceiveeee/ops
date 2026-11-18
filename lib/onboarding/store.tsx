"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { firstStepFor } from "./questions";
import { GUIDE_CHANGE_EVENT, readGuideSnapshot, writeGuideSnapshot } from "./localStorage";
import type { FirstStepId, GuideAnswers, GuideGoal, GuideSnapshot, GuideStart, QuestionId } from "./types";

/**
 * The start guide's answers, kept in this browser only.
 *
 * Until 2026-11-13 this provider also copied the old quiz's answers -- among
 * them which school level the visitor picked -- to a `user_onboarding` table
 * for anyone signed in. The privacy page says signing in syncs which lessons
 * are finished and nothing else, so that copy was removed rather than the page
 * rewritten. Nothing in this file talks to the server; keep it that way, or
 * change /privacy in the same change.
 */
export interface OnboardingValue {
  /** False until the browser's copy has been read, so the server render and the first client render agree. */
  ready: boolean;
  snapshot: GuideSnapshot | null;
  isComplete: boolean;
  /** Where the guide sends this visitor, once it is complete. */
  firstStep: FirstStepId | null;
  setAnswer: (question: QuestionId, value: GuideGoal | GuideStart) => void;
  complete: () => void;
  /** Keeps the answers but reopens the guide, for "Change my answers". */
  reopen: () => void;
}

const Ctx = createContext<OnboardingValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<GuideSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const snapRef = useRef<GuideSnapshot | null>(null);

  const refresh = useCallback(() => {
    const next = readGuideSnapshot();
    snapRef.current = next;
    setSnapshot(next);
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    window.addEventListener("storage", refresh);
    window.addEventListener(GUIDE_CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(GUIDE_CHANGE_EVENT, refresh);
    };
  }, [refresh]);

  const persist = useCallback((next: GuideSnapshot) => {
    snapRef.current = next;
    setSnapshot(next);
    writeGuideSnapshot(next);
  }, []);

  const setAnswer = useCallback(
    (question: QuestionId, value: GuideGoal | GuideStart) => {
      const prev = snapRef.current;
      const answers: GuideAnswers = { ...(prev?.answers ?? {}), [question]: value };
      persist({ answers, completedAt: prev?.completedAt ?? null, updatedAt: new Date().toISOString() });
    },
    [persist],
  );

  const complete = useCallback(() => {
    const prev = snapRef.current;
    if (!prev?.answers.goal || !prev.answers.start) return;
    const now = new Date().toISOString();
    persist({ answers: prev.answers, completedAt: now, updatedAt: now });
  }, [persist]);

  const reopen = useCallback(() => {
    const prev = snapRef.current;
    if (!prev) return;
    persist({ answers: prev.answers, completedAt: null, updatedAt: new Date().toISOString() });
  }, [persist]);

  const value = useMemo<OnboardingValue>(() => {
    const isComplete = snapshot?.completedAt != null;
    return {
      ready,
      snapshot,
      isComplete,
      firstStep: isComplete && snapshot ? firstStepFor(snapshot.answers) : null,
      setAnswer,
      complete,
      reopen,
    };
  }, [ready, snapshot, setAnswer, complete, reopen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingValue {
  const value = useContext(Ctx);
  if (!value) throw new Error("useOnboarding must be used within <OnboardingProvider>");
  return value;
}
