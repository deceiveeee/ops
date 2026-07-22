"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Browser-local (localStorage) progress for Investment Foundations.
 * Completely separate from Finance Foundations progress keys.
 * No backend. Used to mark Lesson 1.1 complete after the assessment
 * and to persist the learner's Investment Philosophy Draft 0.1.
 */

const COMPLETION_KEY = "ops-if-completion-v1";
const DRAFT_KEY = "ops-if-philosophy-draft-v1";
const PROGRESS_EVENT = "ops-if-progress";

export const IF_LESSON_SLUGS = [
  "if-1-1-how-an-investor-builds-a-philosophy",
] as const;

export type PhilosophyDraft = {
  marketBelief: string;
  advantageStage: string;
  persistenceReason: string;
  constraints: {
    riskPreference: string;
    horizon: string;
    cashNeeds: string;
    taxConsiderations: string;
    capital: string;
    researchTime: string;
    patience: string;
    analyticalTools: string;
    liquidityNeeds: string;
    underperformanceTolerance: string;
  };
  strategy: string;
  implementationRisks: string;
  evidenceGap: string;
  generatedSummary: string;
  updatedAt: string;
};

export const EMPTY_DRAFT: PhilosophyDraft = {
  marketBelief: "",
  advantageStage: "",
  persistenceReason: "",
  constraints: {
    riskPreference: "",
    horizon: "",
    cashNeeds: "",
    taxConsiderations: "",
    capital: "",
    researchTime: "",
    patience: "",
    analyticalTools: "",
    liquidityNeeds: "",
    underperformanceTolerance: "",
  },
  strategy: "",
  implementationRisks: "",
  evidenceGap: "",
  generatedSummary: "",
  updatedAt: "",
};

function readCompletion(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COMPLETION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function readDraft(): PhilosophyDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? ({ ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<PhilosophyDraft>) }) : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeCompletion(v: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore quota / private mode errors */
  }
}

function writeDraft(d: PhilosophyDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

export function useIFProgress() {
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [draft, setDraftState] = useState<PhilosophyDraft>(EMPTY_DRAFT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletion(readCompletion());
    setDraftState(readDraft());
    setReady(true);

    const onChange = () => {
      setCompletion(readCompletion());
      setDraftState(readDraft());
    };
    window.addEventListener(PROGRESS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onChange);
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

  const saveDraft = useCallback((d: PhilosophyDraft) => {
    const stamped = { ...d, updatedAt: new Date().toISOString() };
    writeDraft(stamped);
    setDraftState(stamped);
  }, []);

  const clearDraft = useCallback(() => {
    writeDraft(EMPTY_DRAFT);
    setDraftState(EMPTY_DRAFT);
  }, []);

  return {
    ready,
    completion,
    draft,
    isComplete,
    markComplete,
    saveDraft,
    clearDraft,
  };
}
