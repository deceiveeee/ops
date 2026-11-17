/**
 * "Came back within 7 days", worked out in the browser.
 *
 * The browser keeps one thing: the day it last opened OPS, as YYYY-MM-DD in
 * its own time zone. On a later day it compares, and the only thing that may
 * be sent is the yes. The day itself, and how many days it was, stay here.
 */
export const LAST_VISIT_KEY = "ops-last-visit-v1";
export const RETURN_WINDOW_DAYS = 7;

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The browser's own calendar day for `date`, as YYYY-MM-DD. */
export function localDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whole calendar days from `earlier` to `later`, or null if either is not a real day. Clock changes cannot skew it: both are read as UTC midnights. */
export function daysBetween(earlier: string, later: string): number | null {
  const a = DAY.exec(earlier);
  const b = DAY.exec(later);
  if (!a || !b) return null;
  const toUtc = (m: RegExpExecArray) => {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const t = Date.UTC(y, mo - 1, d);
    const back = new Date(t);
    // Rejects 2026-02-31 and the like, which Date would roll into March.
    return back.getUTCFullYear() === y && back.getUTCMonth() === mo - 1 && back.getUTCDate() === d ? t : null;
  };
  const ta = toUtc(a);
  const tb = toUtc(b);
  if (ta === null || tb === null) return null;
  return Math.round((tb - ta) / 86_400_000);
}

/** True when `lastDay` was one to seven days before `today`. The same day, a longer gap, a first visit or a clock set backwards are all no. */
export function cameBackWithinWindow(lastDay: string | null, today: string): boolean {
  if (!lastDay) return false;
  const gap = daysBetween(lastDay, today);
  return gap !== null && gap >= 1 && gap <= RETURN_WINDOW_DAYS;
}

type DayStore = Pick<Storage, "getItem" | "setItem">;

/**
 * Records today's visit and says whether it is a return within the window.
 * Called on every page load, it answers yes at most once a day: the first
 * load of the day moves the stored day to today, so later loads are the same
 * day. A browser that refuses storage never answers yes.
 */
export function recordVisit(store: DayStore, now: Date): boolean {
  const today = localDay(now);
  let last: string | null = null;
  try {
    last = store.getItem(LAST_VISIT_KEY);
  } catch {
    return false;
  }
  if (last === today) return false;
  try {
    store.setItem(LAST_VISIT_KEY, today);
  } catch {
    // If today cannot be kept, every load today would look like the first: say no rather than count it again and again.
    return false;
  }
  return cameBackWithinWindow(last, today);
}
