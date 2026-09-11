"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { calculateStudio, type StudioCalculation, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { importProjectBackup } from "@/lib/studio-project/backup";
import type { StudioMode, StudioProject } from "@/lib/studio-project/schema";
import type { SessionResult } from "@/lib/studio-project/session";
import { createIndexedDbProjectStorage } from "@/lib/studio-project/storage";
import { applyPlanChange, projectToPlan } from "@/lib/studio-project/workspace";
import { useStudioProject } from "@/lib/use-studio-project";
import type { StageResult } from "../stages";

/** The practice/personal choice a learner made last, kept between visits. */
export const STUDIO_MODE_KEY = "ops-studio-mode";

/**
 * Pages that share the workspace's open project.
 *
 * Moving between them keeps the same session, so nothing can be lost and the
 * "leave Studio?" warning would be wrong. Anywhere else is leaving.
 */
export const isWorkspacePath = (pathname: string) =>
  pathname === "/studio" || /^\/studio\/(goals|research|investigate|industry|portfolio|review)(\/|$)/.test(pathname);

type Session = ReturnType<typeof useStudioProject>;

export interface Workspace {
  mode: StudioMode;
  /** Opens the other portfolio. Unsaved work is never dropped without asking. */
  switchMode: (next: StudioMode) => void;
  session: Session;
  project: StudioProject | null;
  /** The stage forms' view of the working portfolio. Null until the project opens. */
  plan: StudioPlan | null;
  calculation: StudioCalculation | null;
  updatePlan: (change: (plan: StudioPlan) => StudioPlan) => Promise<StageResult>;
  /** A change that did not save, stated until the next one succeeds. */
  error: string | null;
  report: (result: SessionResult) => StageResult;
  /**
   * True while a page holds an edit it has not yet handed to storage, such as
   * typing Investigate waits on before saving. The project bar must not call
   * that saved. The setter is stable, so pages can depend on it in effects.
   */
  draft: boolean;
  setDraft: (pending: boolean) => void;
  /** Where a page's side-panel content is drawn, once the frame has mounted it. */
  asideSlot: HTMLElement | null;
  setAsideSlot: (element: HTMLElement | null) => void;
}

const WorkspaceContext = createContext<Workspace | null>(null);

export function useWorkspace(): Workspace {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside the Studio workspace.");
  return value;
}

/** Whether a stored project holds anything a learner did, rather than an empty shell. */
export function holdsWork(raw: string): boolean {
  const parsed = importProjectBackup(raw);
  if (!parsed.ok) return false;
  const { project } = parsed;
  return (
    project.investigations.length > 0 ||
    project.candidates.length > 0 ||
    project.decisions.length > 0 ||
    project.goal.purpose.trim() !== "" ||
    project.alternatives.some((alternative) => alternative.positions.length > 0)
  );
}

/**
 * Decides which portfolio to open, then keeps it open for every section.
 *
 * `opening` renders until the choice is made, which is one storage read at most.
 */
export function WorkspaceProvider({ children, opening }: { children: ReactNode; opening: ReactNode }) {
  const [mode, setMode] = useState<StudioMode | null>(null);

  useEffect(() => {
    let remembered: string | null = null;
    try {
      remembered = window.localStorage.getItem(STUDIO_MODE_KEY);
    } catch {
      // Blocked site data: fall through to the default below.
    }
    if (remembered === "practice" || remembered === "personal") {
      setMode(remembered);
      return;
    }
    /*
     * Nothing remembered. Open the learner's own portfolio if it already holds
     * work -- Investigate saved there before the workspace existed -- and
     * practice otherwise. An empty own-portfolio record does not count: merely
     * visiting Investigate created one, and opening it would hide the practice
     * work the old form saved.
     *
     * This only reads. A project is never created for a mode nobody opened.
     */
    let cancelled = false;
    const storage = createIndexedDbProjectStorage();
    storage
      .read("personal")
      .then((result) => {
        if (!cancelled) setMode(result.ok && result.value && holdsWork(result.value.raw) ? "personal" : "practice");
      })
      .catch(() => {
        if (!cancelled) setMode("practice");
      })
      .finally(() => storage.close());
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mode) return <>{opening}</>;
  return (
    <OpenProject key={mode} mode={mode} onSwitch={setMode}>
      {children}
    </OpenProject>
  );
}

function OpenProject({
  mode, onSwitch, children,
}: { mode: StudioMode; onSwitch: (mode: StudioMode) => void; children: ReactNode }) {
  const session = useStudioProject(mode, { internal: isWorkspacePath });
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(false);
  const [asideSlot, setAsideSlot] = useState<HTMLElement | null>(null);
  const project = session.project;
  const plan = useMemo(() => (project ? projectToPlan(project) : null), [project]);
  const calculation = useMemo(() => (plan ? calculateStudio(plan, STUDIO_CATALOG) : null), [plan]);

  // A failed write must not look like a successful one, so every result is
  // surfaced rather than assumed.
  const report = (result: SessionResult): StageResult => {
    if (result.ok) {
      setError(null);
      return { ok: true };
    }
    setError(result.error);
    return { ok: false, error: result.error, conflict: result.code === "conflict" };
  };

  const switchMode = (next: StudioMode) => {
    if (next === mode) return;
    if (session.pending || session.status === "saving" || draft) {
      setError("A save is still finishing. Switch again in a moment.");
      return;
    }
    if (
      session.dirty &&
      !window.confirm(
        "Changes in this portfolio have not been saved. Switch anyway and lose them? Choose Cancel, then download a backup from Review to keep them.",
      )
    ) {
      return;
    }
    try {
      window.localStorage.setItem(STUDIO_MODE_KEY, next);
    } catch {
      // Remembered for this visit only.
    }
    onSwitch(next);
  };

  const value: Workspace = {
    mode,
    switchMode,
    session,
    project,
    plan,
    calculation,
    error,
    report,
    updatePlan: async (change) => report(await session.update((current) => applyPlanChange(current, change))),
    draft,
    setDraft,
    asideSlot,
    setAsideSlot,
  };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
