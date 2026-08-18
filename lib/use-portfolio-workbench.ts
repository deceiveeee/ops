"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  LEGACY_ARTIFACT_STORAGE_KEYS,
  LEGACY_IF_PROGRESS_EVENT,
  PORTFOLIO_WORKBENCH_EVENT,
  PORTFOLIO_WORKBENCH_STORAGE_KEY,
  type AllocationRecord,
  type MandateRecord,
  type PortfolioWorkbenchLoadResult,
  type PortfolioWorkbenchV1,
  type SavableCheckpointStatus,
  type WorkbenchCheckpointId,
  type WorkbenchMode,
  type WorkbenchStorage,
  WorkbenchValidationError,
  loadPortfolioWorkbench,
  persistPortfolioWorkbench,
  saveAllocationRecord,
  saveCheckpointStatus,
  saveMandateRecord,
  switchWorkbenchMode,
} from "@/lib/portfolio-workbench";

const SSR_TIME = "1970-01-01T00:00:00.000Z";

export type WorkbenchMutationResult =
  | { ok: true; workbench: PortfolioWorkbenchV1 }
  | { ok: false; message: string; issues: readonly string[] };

export interface UsePortfolioWorkbenchResult {
  ready: boolean;
  loadState: PortfolioWorkbenchLoadResult;
  workbench: PortfolioWorkbenchV1;
  activeMode: WorkbenchMode;
  activeCase: PortfolioWorkbenchV1["cases"][WorkbenchMode];
  refresh: () => void;
  setActiveMode: (mode: WorkbenchMode) => WorkbenchMutationResult;
  saveMandate: (
    mode: WorkbenchMode,
    mandate: MandateRecord,
    status: SavableCheckpointStatus,
    changedField: string,
  ) => WorkbenchMutationResult;
  saveAllocation: (
    mode: WorkbenchMode,
    allocation: AllocationRecord,
    status: SavableCheckpointStatus,
    changedField: string,
  ) => WorkbenchMutationResult;
  saveCheckpoint: (
    mode: WorkbenchMode,
    checkpoint: Exclude<WorkbenchCheckpointId, "mandate" | "allocation">,
    status: SavableCheckpointStatus,
    changedField: string,
    reason: string,
  ) => WorkbenchMutationResult;
}

function browserStorage(): WorkbenchStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function blockedMutation(loadState: PortfolioWorkbenchLoadResult): WorkbenchMutationResult {
  const label =
    loadState.kind === "future-version"
      ? "This Workbench was created by a newer version of OPS."
      : "The stored Workbench needs recovery before it can be replaced.";
  return {
    ok: false,
    message: `${label} The original local record has been preserved.`,
    issues: loadState.issues.map((issue) => issue.message),
  };
}

export function usePortfolioWorkbench(): UsePortfolioWorkbenchResult {
  const initial = loadPortfolioWorkbench(null, SSR_TIME);
  const [loadState, setLoadState] = useState<PortfolioWorkbenchLoadResult>(initial);
  const [ready, setReady] = useState(false);
  const loadStateRef = useRef(loadState);

  const publishState = useCallback((next: PortfolioWorkbenchLoadResult) => {
    loadStateRef.current = next;
    setLoadState(next);
  }, []);

  const refresh = useCallback(() => {
    const storage = browserStorage();
    publishState(loadPortfolioWorkbench(storage));
    setReady(true);
  }, [publishState]);

  useEffect(() => {
    refresh();

    const legacyKeys = new Set(Object.values(LEGACY_ARTIFACT_STORAGE_KEYS));
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === PORTFOLIO_WORKBENCH_STORAGE_KEY ||
        legacyKeys.has(event.key)
      ) {
        refresh();
      }
    };
    const onSameTabChange = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener(PORTFOLIO_WORKBENCH_EVENT, onSameTabChange);
    window.addEventListener(LEGACY_IF_PROGRESS_EVENT, onSameTabChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PORTFOLIO_WORKBENCH_EVENT, onSameTabChange);
      window.removeEventListener(LEGACY_IF_PROGRESS_EVENT, onSameTabChange);
    };
  }, [refresh]);

  const commit = useCallback(
    (mutate: (current: PortfolioWorkbenchV1, now: string) => PortfolioWorkbenchV1): WorkbenchMutationResult => {
      const currentState = loadStateRef.current;
      if (currentState.kind !== "ok") return blockedMutation(currentState);

      const storage = browserStorage();
      if (!storage) {
        return {
          ok: false,
          message: "Local storage is unavailable, so the Workbench was not changed.",
          issues: ["Enable local browser storage to save this work."],
        };
      }

      try {
        const now = new Date().toISOString();
        const nextWorkbench = mutate(currentState.workbench, now);
        if (nextWorkbench === currentState.workbench) {
          return { ok: true, workbench: currentState.workbench };
        }
        const write = persistPortfolioWorkbench(storage, nextWorkbench);
        if (!write.ok) {
          return {
            ok: false,
            message: write.issue?.message ?? "The Workbench could not be saved.",
            issues: write.issue ? [write.issue.message] : [],
          };
        }

        publishState({ kind: "ok", workbench: nextWorkbench, issues: [], migrated: false });
        window.dispatchEvent(
          new CustomEvent(PORTFOLIO_WORKBENCH_EVENT, {
            detail: { schemaVersion: nextWorkbench.schemaVersion, updatedAt: nextWorkbench.updatedAt },
          }),
        );
        return { ok: true, workbench: nextWorkbench };
      } catch (error) {
        if (error instanceof WorkbenchValidationError) {
          return { ok: false, message: error.message, issues: error.issues };
        }
        return {
          ok: false,
          message: error instanceof Error ? error.message : "The Workbench change failed.",
          issues: [],
        };
      }
    },
    [publishState],
  );

  const setActiveMode = useCallback(
    (mode: WorkbenchMode) => commit((current, now) => switchWorkbenchMode(current, mode, now)),
    [commit],
  );

  const saveMandate = useCallback(
    (
      mode: WorkbenchMode,
      mandate: MandateRecord,
      status: SavableCheckpointStatus,
      changedField: string,
    ) => commit((current, now) => saveMandateRecord(current, mode, mandate, status, changedField, now)),
    [commit],
  );

  const saveAllocation = useCallback(
    (
      mode: WorkbenchMode,
      allocation: AllocationRecord,
      status: SavableCheckpointStatus,
      changedField: string,
    ) => commit((current, now) => saveAllocationRecord(current, mode, allocation, status, changedField, now)),
    [commit],
  );

  const saveCheckpoint = useCallback(
    (
      mode: WorkbenchMode,
      checkpoint: Exclude<WorkbenchCheckpointId, "mandate" | "allocation">,
      status: SavableCheckpointStatus,
      changedField: string,
      reason: string,
    ) => commit((current, now) => saveCheckpointStatus(current, mode, checkpoint, status, changedField, reason, now)),
    [commit],
  );

  const workbench = loadState.workbench;
  const activeMode = workbench.activeMode;
  return {
    ready,
    loadState,
    workbench,
    activeMode,
    activeCase: workbench.cases[activeMode],
    refresh,
    setActiveMode,
    saveMandate,
    saveAllocation,
    saveCheckpoint,
  };
}
