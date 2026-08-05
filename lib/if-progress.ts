"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgressStore } from "@/lib/progress/store";

const MODULE_KEY = "ops-if-completion-v1";
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

function readDraft(): PhilosophyDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? ({ ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<PhilosophyDraft>) }) : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
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
  const store = useProgressStore();
  const completion = useMemo(
    () => store.getModuleCompletion(MODULE_KEY),
    [store],
  );
  const [draft, setDraftState] = useState<PhilosophyDraft>(EMPTY_DRAFT);

  useEffect(() => {
    setDraftState(readDraft());
    const onChange = () => setDraftState(readDraft());
    window.addEventListener(PROGRESS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onChange);
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
    ready: store.ready,
    completion,
    draft,
    isComplete,
    markComplete,
    saveDraft,
    clearDraft,
  };
}
