"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioMode } from "./studio-project/schema";

/**
 * Which portfolio every Studio surface is working on.
 *
 * Until this existed the answer was hard-coded, differently, in two places: the
 * workspace read a practice portfolio and the investigation view read a
 * personal one. They were two separate records, so research done in one was
 * invisible to the other, and the workspace's own overview linked to an
 * investigation of a portfolio it could not show. Neither screen offered a way
 * to change it, so nobody had chosen either.
 *
 * The choice is stored rather than passed through the URL because it has to
 * survive moving between routes: picking a portfolio on one screen and finding
 * the other still on the old one is the bug this replaces, not a smaller
 * version of it.
 *
 * Each mode is its own stored project, so switching abandons nothing — it opens
 * the other record, and the first one is exactly where it was left.
 */

export const STUDIO_MODE_KEY = "ops-studio-mode";

/** Same-tab listeners do not receive `storage`, which only fires elsewhere. */
const STUDIO_MODE_EVENT = "ops-studio-mode-change";

export const STUDIO_MODES: { value: StudioMode; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "personal", label: "Your own" },
];

/**
 * Practice is the default, and deliberately.
 *
 * Every portfolio saved before this existed is a practice one, because that is
 * what the workspace created and it never offered a way to change it. Defaulting
 * to anything else would open an empty record in front of someone who has work
 * saved, and leave them to guess where it went.
 */
function readStoredMode(): StudioMode {
  try {
    return window.localStorage.getItem(STUDIO_MODE_KEY) === "personal" ? "personal" : "practice";
  } catch {
    // Private modes and blocked site data throw on access, not on read.
    return "practice";
  }
}

/**
 * `mode` is null until the browser has been read.
 *
 * The server cannot know the choice, so rendering a guess and correcting it
 * would open a session for the wrong portfolio first — and opening a session
 * writes a record when none exists, which would leave an empty practice
 * portfolio behind every time someone with a personal one visited. Callers
 * treat null as "still opening" and show what they already show while loading.
 */
export function useStudioMode(): { mode: StudioMode | null; setMode: (mode: StudioMode) => void } {
  const [mode, setMode] = useState<StudioMode | null>(null);

  useEffect(() => {
    const sync = () => setMode(readStoredMode());
    sync();
    const onStorage = (event: Event) => {
      if (event instanceof StorageEvent && event.key !== null && event.key !== STUDIO_MODE_KEY) return;
      sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(STUDIO_MODE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STUDIO_MODE_EVENT, sync);
    };
  }, []);

  const choose = useCallback((next: StudioMode) => {
    try {
      window.localStorage.setItem(STUDIO_MODE_KEY, next);
    } catch {
      // The choice still applies to this tab; it just will not outlive it.
    }
    setMode(next);
    window.dispatchEvent(new Event(STUDIO_MODE_EVENT));
  }, []);

  return { mode, setMode: choose };
}
