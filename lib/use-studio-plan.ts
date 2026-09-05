"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import {
  STUDIO_STORAGE_EVENT,
  STUDIO_STORAGE_KEY,
  type StudioCalculation,
  type StudioLoadResult,
  type StudioPlan,
  calculateStudio,
  createStudioPlan,
  loadStudio,
  parseStudioJson,
  saveStudio,
} from "@/lib/studio";

/**
 * The one saved portfolio, shared by every Studio tool.
 *
 * Storage is this browser only, and the module underneath already refuses to
 * overwrite a record another tab changed. This hook keeps that honest: a failed
 * save never updates what is on screen, so the user is never looking at a
 * number Studio did not manage to keep.
 */

const SSR_TIME = "1970-01-01T00:00:00.000Z";

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Private modes and blocked site data throw on access, not on read.
    return null;
  }
}

export type StudioMutationResult = { ok: true } | { ok: false; error: string; conflict: boolean };

export interface UseStudioPlanResult {
  /** False until the browser record has been read, so SSR and first paint agree. */
  ready: boolean;
  loadState: StudioLoadResult;
  plan: StudioPlan;
  calculation: StudioCalculation;
  /** Applies a change and saves it. On failure the plan on screen is unchanged. */
  update: (change: (plan: StudioPlan) => StudioPlan) => StudioMutationResult;
  /** Replaces the whole portfolio from a backup file's text. */
  importBackup: (text: string) => StudioMutationResult;
  /** Starts an empty portfolio, discarding the saved one. */
  reset: (mode?: StudioPlan["mode"]) => StudioMutationResult;
  refresh: () => void;
}

export function useStudioPlan(): UseStudioPlanResult {
  // Deterministic on the server: no storage, fixed timestamp, so the markup the
  // client hydrates against matches what the server produced.
  const [state, setState] = useState<StudioLoadResult>(() =>
    loadStudio(null, createStudioPlan("practice", SSR_TIME)),
  );
  const [ready, setReady] = useState(false);
  // The exact string last read or written. saveStudio compares against it to
  // detect another tab having written in between.
  const rawRef = useRef<string | null>(null);

  const publish = useCallback((next: StudioLoadResult) => {
    rawRef.current = next.raw;
    setState(next);
  }, []);

  const refresh = useCallback(() => {
    publish(loadStudio(browserStorage()));
    setReady(true);
  }, [publish]);

  useEffect(() => {
    refresh();
    const onExternalChange = (event: Event) => {
      // Ignore writes to unrelated keys; a `storage` event fires for all of them.
      if (event instanceof StorageEvent && event.key !== null && event.key !== STUDIO_STORAGE_KEY) return;
      refresh();
    };
    window.addEventListener("storage", onExternalChange);
    window.addEventListener(STUDIO_STORAGE_EVENT, onExternalChange);
    return () => {
      window.removeEventListener("storage", onExternalChange);
      window.removeEventListener(STUDIO_STORAGE_EVENT, onExternalChange);
    };
  }, [refresh]);

  const commit = useCallback(
    (next: StudioPlan): StudioMutationResult => {
      const result = saveStudio(browserStorage(), next, rawRef.current);
      if (!result.ok) {
        // Deliberately leaves `state` alone. Showing the edit while the save
        // failed would tell the user their work is kept when it is not.
        return { ok: false, error: result.error, conflict: result.conflict };
      }
      rawRef.current = result.raw;
      setState({ status: "ready", plan: next, raw: result.raw, error: null });
      // Same-tab listeners do not receive `storage`, which only fires elsewhere.
      window.dispatchEvent(new Event(STUDIO_STORAGE_EVENT));
      return { ok: true };
    },
    [],
  );

  const update = useCallback(
    (change: (plan: StudioPlan) => StudioPlan) => commit(change(state.plan)),
    [commit, state.plan],
  );

  const importBackup = useCallback(
    (text: string): StudioMutationResult => {
      const parsed = parseStudioJson(text);
      if (!parsed.ok) return { ok: false, error: parsed.error, conflict: false };
      return commit({ ...parsed.plan, updatedAt: new Date().toISOString() });
    },
    [commit],
  );

  const reset = useCallback(
    (mode: StudioPlan["mode"] = state.plan.mode) => commit(createStudioPlan(mode)),
    [commit, state.plan.mode],
  );

  const calculation = useMemo(
    () => calculateStudio(state.plan, STUDIO_CATALOG),
    [state.plan],
  );

  return { ready, loadState: state, plan: state.plan, calculation, update, importBackup, reset, refresh };
}
