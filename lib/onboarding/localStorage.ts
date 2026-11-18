import { isGoal, isStart } from "./questions";
import type { GuideAnswers, GuideSnapshot } from "./types";

/**
 * A new key, because the old quiz's answers ("ops-onboarding-v1") have values
 * this guide does not use. A visitor who took the old quiz sees the guide
 * again, which takes two clicks.
 */
export const GUIDE_LS_KEY = "ops-start-guide-v1";
export const GUIDE_CHANGE_EVENT = "ops-start-guide-change";

/** Keeps only answers this version knows, so a stale or hand-edited value reads as unanswered. */
function cleanAnswers(raw: unknown): GuideAnswers {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const answers: GuideAnswers = {};
  if (isGoal(source.goal)) answers.goal = source.goal;
  if (isStart(source.start)) answers.start = source.start;
  return answers;
}

export function readGuideSnapshot(): GuideSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUIDE_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuideSnapshot> | null;
    if (!parsed || typeof parsed !== "object") return null;
    const answers = cleanAnswers(parsed.answers);
    // A completed guide needs both answers; otherwise it is still in progress.
    const complete = typeof parsed.completedAt === "string" && answers.goal && answers.start;
    return {
      answers,
      completedAt: complete ? (parsed.completedAt as string) : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    // Storage blocked (private window, site data cleared): the guide still works, it just forgets.
    return null;
  }
}

export function writeGuideSnapshot(snapshot: GuideSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUIDE_LS_KEY, JSON.stringify(snapshot));
    window.dispatchEvent(new Event(GUIDE_CHANGE_EVENT));
  } catch {
    // Storage full or unavailable.
  }
}
