"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createProjectSession, type ProjectSession, type ProjectSessionState, type SessionResult } from "./studio-project/session";
import { createIndexedDbProjectStorage } from "./studio-project/storage";
import type { StudioMode, StudioProject } from "./studio-project/schema";

const INITIAL: ProjectSessionState = { status: "loading", project: null, savedProject: null, revision: null, dirty: false, externalChange: false, error: null, recoveryRaw: null };
const notReady = (): SessionResult => ({ ok: false, code: "unavailable", error: "Wait for the project to open before changing it." });

/**
 * The workspace owns a v2 session, including research and alternatives. Render status,
 * dirty and externalChange alongside project; showing an edit is not a save.
 */
export function useStudioProject(mode: StudioMode) {
  const [snapshot, setSnapshot] = useState({ mode, state: INITIAL });
  const current = useRef<{ mode: StudioMode; session: ProjectSession } | null>(null);
  const pending = useRef(0);
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    const session = createProjectSession(createIndexedDbProjectStorage(), mode);
    current.current = { mode, session };
    setSnapshot({ mode, state: session.getSnapshot() });
    const unsubscribe = session.subscribe(() => setSnapshot({ mode, state: session.getSnapshot() }));
    void session.reload();
    const check = () => { if (document.visibilityState === "visible") void session.checkForUpdates(); };
    const leaving = (event: BeforeUnloadEvent) => {
      if (pending.current || session.getSnapshot().dirty) { event.preventDefault(); event.returnValue = ""; }
    };
    const navigation = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")
        || link.origin !== window.location.origin || link.pathname === window.location.pathname) return;
      if (pending.current) {
        event.preventDefault(); event.stopPropagation();
        window.alert("A save is still in progress. Wait for it to finish before leaving Studio.");
      } else if (session.getSnapshot().dirty && !window.confirm("Leave Studio and discard unsaved edits? Cancel to download an unsaved backup first.")) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("beforeunload", leaving);
    document.addEventListener("click", navigation, true);
    return () => {
      unsubscribe(); session.close();
      if (current.current?.session === session) current.current = null;
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("beforeunload", leaving);
      document.removeEventListener("click", navigation, true);
    };
  }, [mode]);

  const invoke = useCallback(async (action: (session: ProjectSession) => Promise<SessionResult>) => {
    if (current.current?.mode !== mode) return notReady();
    pending.current += 1; setPendingCount(pending.current);
    try { return await action(current.current.session); }
    finally { pending.current -= 1; setPendingCount(pending.current); }
  }, [mode]);
  return {
    ...(snapshot.mode === mode ? snapshot.state : INITIAL),
    pending: pendingCount > 0,
    update: (change: (project: StudioProject) => StudioProject) => invoke((session) => session.update(change)),
    reload: (discardDraft = false) => invoke((session) => session.reload(discardDraft)),
    retry: () => invoke((session) => session.retry()),
    importBackup: (raw: string) => invoke((session) => session.importBackup(raw)),
    reset: () => invoke((session) => session.reset()),
    exportBackup: () => current.current?.mode === mode ? current.current.session.exportBackup() : { ok: false as const, error: "Wait for the project to open before exporting it." },
    recovery: () => current.current?.mode === mode ? current.current.session.recovery() : Promise.resolve(notReady()),
  };
}
