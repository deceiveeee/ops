"use client";

import { useEffect, useState } from "react";
import { STUDIO_STORAGE_KEY } from "@/lib/studio";
import type { StudioMode } from "@/lib/studio-project/schema";
import { createIndexedDbProjectStorage } from "@/lib/studio-project/storage";
import OverviewDashboard from "./OverviewDashboard";
import { WorkWaiting } from "./StudioFrame";
import { holdsWork, useWorkspace } from "./WorkspaceProvider";

export default function OverviewView() {
  const { project, calculation, session } = useWorkspace();
  if (!project || !calculation) return session.status === "loading" ? <WorkWaiting /> : null;
  return (
    <OverviewDashboard project={project} calculation={calculation}>
      <OtherPortfolio />
    </OverviewDashboard>
  );
}

/**
 * Says when the other portfolio holds work, because the two are stored
 * separately and nothing on this page would otherwise show it. Reads only.
 */
function OtherPortfolio() {
  const { mode, switchMode } = useWorkspace();
  const other: StudioMode = mode === "practice" ? "personal" : "practice";
  const [hasWork, setHasWork] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const storage = createIndexedDbProjectStorage();
    storage
      .read(other)
      .then((result) => {
        if (cancelled) return;
        if (result.ok && result.value) {
          setHasWork(holdsWork(result.value.raw));
          return;
        }
        // Practice work from the old six-step form moves across the first time
        // the practice portfolio is opened. Until then it lives here.
        let legacy: string | null = null;
        try {
          legacy = other === "practice" ? window.localStorage.getItem(STUDIO_STORAGE_KEY) : null;
        } catch {
          legacy = null;
        }
        setHasWork(legacy !== null);
      })
      .catch(() => {
        if (!cancelled) setHasWork(false);
      })
      .finally(() => storage.close());
    return () => {
      cancelled = true;
    };
  }, [other]);

  if (!hasWork) return null;
  return (
    <p className="rounded-xl border border-[var(--ops-divider)] bg-[var(--ops-surface)] px-4 py-3 text-[14px] leading-6 text-[var(--ops-text-secondary)]">
      Your {other === "practice" ? "practice portfolio" : "own portfolio"} also has saved work.{" "}
      <button
        type="button"
        onClick={() => switchMode(other)}
        className="font-medium text-[var(--ops-accent-strong)] underline-offset-2 hover:underline"
      >
        Open it
      </button>
    </p>
  );
}
