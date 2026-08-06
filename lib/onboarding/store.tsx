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
import { useSession } from "@/lib/supabase/session";
import { mergeSnapshots } from "./merge";
import { recommendCourse } from "./recommend";
import {
  ONBOARDING_CHANGE_EVENT,
  readLocalSnapshot,
  writeLocalSnapshot,
} from "./localStorage";
import type {
  ConfidenceOption,
  OnboardingAnswers,
  OnboardingSnapshot,
  QuestionId,
  Recommendation,
  SegmentOption,
} from "./types";

export type OnboardingSyncStatus = "guest" | "synced" | "saving" | "error" | "offline";

export interface OnboardingValue {
  ready: boolean;
  syncStatus: OnboardingSyncStatus;
  snapshot: OnboardingSnapshot | null;
  isComplete: boolean;
  recommended: Recommendation | null;
  setAnswer: (qid: QuestionId, value: string) => void;
  markComplete: (input: { answers: OnboardingAnswers; segment?: SegmentOption | null }) => void;
  dismissPrompt: () => void;
}

const Ctx = createContext<OnboardingValue | null>(null);

const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

function buildPartial(
  prev: OnboardingSnapshot | null,
  answers: OnboardingAnswers,
): OnboardingSnapshot {
  const now = new Date().toISOString();
  return {
    answers,
    completed_at: prev?.completed_at ?? null,
    updated_at: now,
    recommended_course_slug: prev?.recommended_course_slug ?? null,
    recommended_next_step: prev?.recommended_next_step ?? null,
    confidence_tier: answers.confidence ?? prev?.confidence_tier ?? null,
    segment: prev?.segment ?? null,
    prompt_dismissed: prev?.prompt_dismissed ?? false,
  };
}

function buildComplete(
  prev: OnboardingSnapshot | null,
  answers: OnboardingAnswers,
  segment: SegmentOption | null,
): OnboardingSnapshot {
  const rec = recommendCourse(answers);
  const now = new Date().toISOString();
  return {
    answers,
    completed_at: now,
    updated_at: now,
    recommended_course_slug: rec.primaryCourseSlug,
    recommended_next_step: rec.nextStepCopy,
    confidence_tier: answers.confidence ?? null,
    segment,
    prompt_dismissed: prev?.prompt_dismissed ?? false,
  };
}

function toRow(user_id: string, snap: OnboardingSnapshot) {
  return {
    user_id,
    answers: snap.answers,
    recommended_course_slug: snap.recommended_course_slug,
    recommended_next_step: snap.recommended_next_step,
    confidence_tier: snap.confidence_tier,
    segment: snap.segment,
    prompt_dismissed: snap.prompt_dismissed,
    completed_at: snap.completed_at,
    updated_at: snap.updated_at,
  };
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const supabase = session.client;
  const liveUserId = session.user?.id ?? null;

  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<OnboardingSyncStatus>("guest");
  const snapRef = useRef<OnboardingSnapshot | null>(null);
  const userIdRef = useRef<string | null>(liveUserId);

  useEffect(() => {
    userIdRef.current = liveUserId;
    setSyncStatus(liveUserId ? "saving" : "guest");
  }, [liveUserId]);

  const refreshFromLocal = useCallback(() => {
    const next = readLocalSnapshot();
    snapRef.current = next;
    setSnapshot(next);
  }, []);

  useEffect(() => {
    let active = true;
    const tick = setTimeout(() => {
      if (!active) return;
      refreshFromLocal();
      setReady(true);
    }, 0);
    const onChange = () => refreshFromLocal();
    const onOnline = () => setSyncStatus(userIdRef.current ? "synced" : "guest");
    const onOffline = () => setSyncStatus("offline");
    window.addEventListener("storage", onChange);
    window.addEventListener(ONBOARDING_CHANGE_EVENT, onChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      active = false;
      clearTimeout(tick);
      window.removeEventListener("storage", onChange);
      window.removeEventListener(ONBOARDING_CHANGE_EVENT, onChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshFromLocal]);

  useEffect(() => {
    if (!liveUserId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_onboarding")
        .select(
          "answers, recommended_course_slug, recommended_next_step, confidence_tier, segment, prompt_dismissed, completed_at, updated_at",
        )
        .eq("user_id", liveUserId)
        .maybeSingle();
      if (cancelled) return;
      const cloud: OnboardingSnapshot | null =
        !error && data
          ? {
              answers: (data.answers ?? {}) as OnboardingAnswers,
              completed_at: data.completed_at,
              updated_at: data.updated_at,
              recommended_course_slug: data.recommended_course_slug,
              recommended_next_step: data.recommended_next_step,
              confidence_tier: (data.confidence_tier ?? null) as ConfidenceOption | null,
              segment: (data.segment ?? null) as SegmentOption | null,
              prompt_dismissed: data.prompt_dismissed ?? false,
            }
          : null;
      const merged = mergeSnapshots(snapRef.current, cloud);
      snapRef.current = merged;
      setSnapshot(merged);
      if (merged) writeLocalSnapshot(merged);
      let upsertError: unknown = null;
      if (!error && merged) {
        ({ error: upsertError } = await supabase
          .from("user_onboarding")
          .upsert(toRow(liveUserId, merged)));
      }
      if (!cancelled) setSyncStatus(error || upsertError ? "error" : "synced");
    })();
    return () => {
      cancelled = true;
    };
  }, [liveUserId, supabase]);

  const persist = useCallback(
    (next: OnboardingSnapshot) => {
      snapRef.current = next;
      setSnapshot(next);
      writeLocalSnapshot(next);
      const uid = userIdRef.current;
      if (!uid) return;
      if (!isOnline()) {
        setSyncStatus("offline");
        return;
      }
      setSyncStatus("saving");
      Promise.resolve(supabase.from("user_onboarding").upsert(toRow(uid, next)))
        .then(({ error }: { error: unknown }) => {
          setSyncStatus(error ? "error" : "synced");
        })
        .catch(() => setSyncStatus("error"));
    },
    [supabase],
  );

  const setAnswer = useCallback(
    (qid: QuestionId, value: string) => {
      const prevAnswers = snapRef.current?.answers ?? {};
      const nextAnswers: OnboardingAnswers = { ...prevAnswers, [qid]: value };
      persist(buildPartial(snapRef.current, nextAnswers));
    },
    [persist],
  );

  const markComplete = useCallback(
    (input: { answers: OnboardingAnswers; segment?: SegmentOption | null }) => {
      const seg = input.segment ?? snapRef.current?.segment ?? null;
      persist(buildComplete(snapRef.current, input.answers, seg));
    },
    [persist],
  );

  const dismissPrompt = useCallback(() => {
    const prev = snapRef.current;
    const now = new Date().toISOString();
    const next: OnboardingSnapshot = prev
      ? { ...prev, prompt_dismissed: true, updated_at: now }
      : {
          answers: {},
          completed_at: null,
          updated_at: now,
          recommended_course_slug: null,
          recommended_next_step: null,
          confidence_tier: null,
          segment: null,
          prompt_dismissed: true,
        };
    persist(next);
  }, [persist]);

  const recommended = useMemo<Recommendation | null>(() => {
    const snap = snapRef.current;
    if (!snap?.completed_at) return null;
    if (snap.recommended_course_slug && snap.recommended_next_step) {
      return {
        primaryCourseSlug: snap.recommended_course_slug,
        nextStepCopy: snap.recommended_next_step,
      };
    }
    return recommendCourse(snap.answers);
  }, [snapshot]);

  const value = useMemo<OnboardingValue>(
    () => ({
      ready,
      syncStatus,
      snapshot,
      isComplete: snapshot?.completed_at != null,
      recommended,
      setAnswer,
      markComplete,
      dismissPrompt,
    }),
    [ready, syncStatus, snapshot, recommended, setAnswer, markComplete, dismissPrompt],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboarding must be used within <OnboardingProvider>");
  return v;
}
