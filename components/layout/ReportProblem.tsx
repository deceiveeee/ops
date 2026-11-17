"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MESSAGE_MAX } from "@/lib/problem-report";
import styles from "./report-problem.module.css";

type Status =
  | { step: "writing" }
  | { step: "sending" }
  | { step: "sent" }
  | { step: "failed"; error: string };

const UNREACHABLE = "The report did not send. Check your connection and try again, or write to the address on the terms page.";

/**
 * "Report a problem", on the copyright line of every page's footer.
 *
 * It sits there rather than in the footer's link row because that row has no
 * height to spare: one more link there wraps it onto a new line on Studio
 * phone pages and at 768px (+44-46px), and many Studio pages are already at
 * the 1.5-screen limit. On the copyright line it adds no height at any width.
 *
 * The form opens in a native dialog, which supplies Escape to close, keeps
 * focus inside and returns it to this button afterwards. The dialog is placed
 * on <body> because a dialog is not allowed inside the footer's <span>.
 */
export default function ReportProblem() {
  const pathname = usePathname() ?? "/";
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const done = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const fieldId = useId();
  const noteId = useId();
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ step: "writing" });

  useEffect(() => setMounted(true), []);
  // A link inside the dialog (privacy, terms) changes the page; the dialog
  // belongs to the page it was opened on.
  useEffect(() => { dialog.current?.close(); }, [pathname]);
  useEffect(() => { if (status.step === "sent") done.current?.focus(); }, [status.step]);

  const open = () => dialog.current?.showModal();
  const close = () => dialog.current?.close();
  const onClosed = () => {
    // A sent report starts the next one fresh; an unsent one keeps its words.
    if (status.step === "sent") { setMessage(""); setStatus({ step: "writing" }); }
    else if (status.step === "failed") setStatus({ step: "writing" });
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      setStatus({ step: "failed", error: "Write what went wrong before sending." });
      field.current?.focus();
      return;
    }
    setStatus({ step: "sending" });
    try {
      const response = await fetch("/api/report-problem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, page: pathname, viewport: `${window.innerWidth}x${window.innerHeight}` }),
      });
      if (response.ok) { setStatus({ step: "sent" }); return; }
      const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
      setStatus({ step: "failed", error: typeof data?.error === "string" ? data.error : UNREACHABLE });
    } catch {
      setStatus({ step: "failed", error: UNREACHABLE });
    }
  };

  const sending = status.step === "sending";

  return (
    <>
      {/* Shown only once it works: before the page's script runs, a tap on it would do nothing. */}
      {mounted && (
        <button type="button" className={styles.trigger} aria-haspopup="dialog" onClick={open}>
          Report a problem
        </button>
      )}
      {mounted && createPortal(
        <dialog
          ref={dialog}
          aria-labelledby={titleId}
          className={styles.dialog}
          onClose={onClosed}
          // A click on the dimmed area outside the panel lands on the dialog itself.
          onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        >
          <div className={styles.panel}>
            <h2 id={titleId} className={styles.title}>Report a problem</h2>
            {status.step === "sent" ? (
              <>
                <p role="status" className={styles.lead}>Report sent. Thank you.</p>
                <div className={styles.actions}>
                  <button ref={done} type="button" className={styles.primary} onClick={close}>Close</button>
                </div>
              </>
            ) : (
              <form onSubmit={send} noValidate>
                <p className={styles.lead}>Tell us what went wrong or what was hard to follow. A sentence is enough.</p>
                <label htmlFor={fieldId} className={styles.label}>What happened?</label>
                <textarea
                  ref={field}
                  id={fieldId}
                  className={styles.field}
                  value={message}
                  maxLength={MESSAGE_MAX}
                  rows={5}
                  placeholder="For example: the Next button did nothing after I picked an answer."
                  aria-describedby={noteId}
                  aria-invalid={status.step === "failed" && !message.trim() ? true : undefined}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (status.step === "failed") setStatus({ step: "writing" });
                  }}
                />
                <p id={noteId} className={styles.note}>
                  We also receive this page&rsquo;s address ({pathname}), your screen size and your browser type, so we
                  can find the problem. Leave out your name and contact details.{" "}
                  <Link href="/privacy" className={styles.link}>Privacy</Link>
                </p>
                {status.step === "failed" && (
                  <p role="alert" className={styles.error}>
                    {status.error}
                    {status.error.includes("terms page") && <> <Link href="/terms" className={styles.link}>Terms page</Link></>}
                  </p>
                )}
                <div className={styles.actions}>
                  <button type="button" className={styles.secondary} onClick={close}>Cancel</button>
                  <button type="submit" className={styles.primary} disabled={sending}>
                    {sending ? "Sending…" : "Send report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}
