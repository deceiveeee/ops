"use client";

import { useEffect, useId, useRef, useState } from "react";
import { classroomShareUrl } from "@/lib/share";

type Props = {
  /** The canonical address to share. */
  url: string;
  /** The page's title, for the phone's share sheet. */
  title: string;
  /** One line about the page, for the phone's share sheet. */
  text?: string;
  /** What the button says to a screen reader, such as "Share this lesson". */
  label: string;
};

type Note = { tone: "ok" | "error"; message: string };

/**
 * Share a page: copy its link, post it to Google Classroom, or, on a phone,
 * hand it to the phone's own share sheet.
 *
 * A disclosure, not an ARIA menu: three ordinary buttons and links that Tab
 * reaches in order, so it behaves the way a keyboard user expects without a
 * roving focus to learn. It opens over the page rather than pushing it down,
 * so a lesson's first screen is the same height with it as without it.
 */
export default function ShareMenu({ url, title, text, label }: Props) {
  const [open, setOpen] = useState(false);
  const [canShareNatively, setCanShareNatively] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstItem = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const panelId = useId();

  // Known only in the browser, so it is read after the first render rather than during it.
  useEffect(() => {
    setCanShareNatively(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    firstItem.current?.focus();
    const onPointer = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(null), 4_000);
    return () => window.clearTimeout(timer);
  }, [note]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setNote({ tone: "ok", message: "Link copied" });
    } catch {
      setNote({ tone: "error", message: "Copying was blocked. Copy the address from your browser's address bar." });
    }
    close(true);
  };

  const shareNatively = async () => {
    close(true);
    try {
      await navigator.share({ title, text, url });
    } catch {
      // Closing the share sheet without choosing an app is not an error worth reporting.
    }
  };

  const item =
    "flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[14px] text-[var(--ops-text-primary)] hover:bg-[var(--ops-surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ops-accent-strong)]";

  return (
    <div
      ref={root}
      className="relative"
      // Marks site chrome, so a check for "the page's own controls are ready" can leave it out.
      data-share-menu=""
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--ops-control-border)] bg-[var(--ops-surface)] px-4 text-[14px] font-medium text-[var(--ops-text-primary)] hover:bg-[var(--ops-surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ops-accent-strong)]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 10V2M5 5l3-3 3 3M3 9v4h10V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Share
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 rounded-xl border border-[var(--ops-divider)] bg-[var(--ops-surface)] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      >
        <ul className="flex flex-col">
          {canShareNatively ? (
            <li>
              <button ref={(node) => { firstItem.current = node; }} type="button" className={item} onClick={shareNatively}>
                Share to another app
              </button>
            </li>
          ) : null}
          <li>
            <button
              ref={(node) => { if (!canShareNatively) firstItem.current = node; }}
              type="button"
              className={item}
              onClick={copy}
            >
              Copy link
            </button>
          </li>
          <li>
            <a
              href={classroomShareUrl(url)}
              target="_blank"
              rel="noopener noreferrer"
              className={item}
              onClick={() => close(false)}
            >
              Share to Google Classroom
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={
          note
            ? `absolute right-0 top-[calc(100%+8px)] z-30 w-max max-w-72 rounded-lg border border-[var(--ops-divider)] bg-[var(--ops-surface)] px-3 py-2 text-[13px] leading-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${note.tone === "ok" ? "text-[var(--ops-success-strong)]" : "text-[var(--ops-text-primary)]"}`
            : "sr-only"
        }
      >
        {note?.message ?? ""}
      </p>
    </div>
  );
}
