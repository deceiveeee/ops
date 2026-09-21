"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { RecoveryRecord } from "@/lib/studio-project/storage";
import { downloadFile } from "../shared";
import { useWorkspace } from "./WorkspaceProvider";

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

const REASON: Record<RecoveryRecord["reason"], string> = {
  import: "Before a backup was restored",
  reset: "Before starting again",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]";
const menuButton = cn(
  "flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[14px] font-medium text-[var(--ops-text-primary)] hover:bg-[var(--ops-surface-2)]",
  focusRing,
);

/**
 * Backup and restore for the open portfolio.
 *
 * In the project bar, so it is reachable from every section rather than only
 * at the end of Review. Replacing the portfolio is never silent: restoring and
 * starting again both ask first, both keep the replaced version under Earlier
 * versions, and storage refuses both while an edit is still unsaved.
 */
export default function ProjectMenu() {
  const { session, project, report } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [earlier, setEarlier] = useState<RecoveryRecord[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  // Read inside effects without making the session's changing identity a dependency.
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const name = project?.name.trim() || "Studio portfolio";
  const ready = !!project && session.status !== "loading";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  // Earlier versions are read when the panel opens, so the list is never stale.
  useEffect(() => {
    if (!open) {
      setNotice(null);
      return;
    }
    let cancelled = false;
    setEarlier(null);
    void sessionRef.current.recovery().then((result) => {
      if (cancelled) return;
      // Only a successful read of earlier versions carries a list.
      const records = result.ok && "value" in result ? (result.value as RecoveryRecord[]) : [];
      setEarlier([...records].sort((a, b) => b.archivedAt.localeCompare(a.archivedAt)));
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const downloadBackup = () => {
    const backup = session.exportBackup();
    if (!backup.ok) {
      report({ ok: false, code: "invalid", error: backup.error });
      return;
    }
    // A draft storage has not acknowledged must not pass for the saved portfolio.
    downloadFile(`${name}${backup.saved ? "" : " (unsaved draft)"}.json`, backup.raw, "application/json");
    setNotice(backup.saved ? "Backup downloaded." : "Downloaded. It includes changes that are not saved yet.");
  };

  const restore = async (text: string) => {
    if (!window.confirm("Replace this portfolio with the backup? The version saved now is kept under Earlier versions.")) return;
    const result = report(await session.importBackup(text));
    if (result.ok) setOpen(false);
  };

  const startAgain = async () => {
    if (!window.confirm("Start this portfolio again, empty? The version saved now is kept under Earlier versions.")) return;
    const result = report(await session.reset());
    if (result.ok) setOpen(false);
  };

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={!ready}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--ops-divider)] bg-[var(--ops-surface)] px-4 text-[14px] font-medium text-[var(--ops-text-secondary)] hover:text-[var(--ops-text-primary)] disabled:cursor-not-allowed disabled:opacity-50",
          focusRing,
        )}
      >
        Backup and restore
        <svg aria-hidden="true" viewBox="0 0 12 12" className={cn("h-3 w-3 transition-transform", open && "rotate-180")}>
          <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label="Backup and restore"
          className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--ops-divider)] bg-[var(--ops-surface)] p-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]"
        >
          <p className="px-3 pb-2 pt-1 text-[13px] leading-5 text-[var(--ops-text-tertiary)]">
            Studio saves in this browser only. Clearing site data erases it, so keep a backup.
          </p>
          <div className="space-y-1">
            <button type="button" onClick={downloadBackup} className={menuButton}>
              Download a backup
            </button>
            <button type="button" onClick={() => picker.current?.click()} className={menuButton}>
              Restore from a backup…
            </button>
            <input
              ref={picker}
              type="file"
              accept="application/json,.json"
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={async (event) => {
                const chosen = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (chosen) await restore(await chosen.text());
              }}
            />
            <button type="button" onClick={() => void startAgain()} className={menuButton}>
              Start this portfolio again…
            </button>
          </div>

          <div className="mt-3 border-t border-[var(--ops-divider)] px-3 pt-3">
            <h2 className="text-[13px] font-semibold text-[var(--ops-text-primary)]">Earlier versions</h2>
            {earlier === null ? (
              <p className="mt-1 text-[13px] text-[var(--ops-text-tertiary)]">Looking…</p>
            ) : earlier.length === 0 ? (
              <p className="mt-1 text-[13px] leading-5 text-[var(--ops-text-tertiary)]">
                None yet. A version is kept here whenever a backup is restored or the portfolio is started again.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {earlier.map((record) => (
                  <li key={record.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-[13px] text-[var(--ops-text-primary)]">{REASON[record.reason]}</span>
                      <span className="block text-[12px] text-[var(--ops-text-tertiary)]">{when(record.archivedAt)}</span>
                    </span>
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => downloadFile(`${name} (${record.archivedAt.slice(0, 10)}).json`, record.raw, "application/json")}
                        className={cn("min-h-9 rounded-lg px-2 text-[13px] font-medium text-[var(--ops-accent-strong)] hover:bg-[var(--ops-surface-2)]", focusRing)}
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => void restore(record.raw)}
                        className={cn("min-h-9 rounded-lg px-2 text-[13px] font-medium text-[var(--ops-accent-strong)] hover:bg-[var(--ops-surface-2)]", focusRing)}
                      >
                        Restore
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notice ? (
            <p role="status" className="mt-3 px-3 text-[13px] text-[var(--ops-success-strong)]">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
