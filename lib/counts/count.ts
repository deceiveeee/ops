import { track } from "@vercel/analytics";
import { toPayload, type CountEvent, type CountName, type CountProps } from "./events";

/**
 * Sending a count.
 *
 * `count` checks the event (see `toPayload`), sends it to Vercel Web Analytics
 * as a custom event, and announces it on the page as an `ops-count` event so
 * tests can see exactly what left the browser. `countOnce` does the same at
 * most once per key in this browser, for actions a learner can repeat or a page
 * can replay.
 *
 * Vercel accepts custom events only on its Pro plan, with at most two details
 * each; no count here carries more than two. On Hobby they are dropped.
 */
export type CountSink = (name: CountName, props: CountProps) => void;

export const COUNT_EVENT = "ops-count";

type VercelQueue = { va?: (...params: unknown[]) => void; vaq?: unknown[][] };

/**
 * Sends through the `<Analytics />` script already on every page, so no new
 * script, cookie or company is involved.
 *
 * `track` drops an event when that script's queue does not exist yet, and the
 * counts made as a page opens (an arrival, a return) run before `<Analytics />`
 * has set it up. So the queue is created here first, exactly as Vercel's own
 * snippet does (https://vercel.com/docs/analytics/custom-events, HTML tab); the
 * script reads it when it loads.
 */
export const sendToVercel: CountSink = (name, props) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as VercelQueue;
  if (!w.va) {
    w.va = (...params: unknown[]) => {
      (w.vaq = w.vaq ?? []).push(params);
    };
  }
  track(name, Object.keys(props).length ? { ...props } : undefined);
};

let sink: CountSink = sendToVercel;

/** Where counts go. Returns the previous sink so a test can put it back. */
export function setCountSink(next: CountSink): CountSink {
  const previous = sink;
  sink = next;
  return previous;
}

/** Sends `event` if its details pass the checks. Returns whether it was sent. */
export function count(event: CountEvent): boolean {
  const payload = toPayload(event);
  if (!payload) return false;
  try {
    sink(payload.name, payload.props);
  } catch {
    // A count must never break the page that sent it.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COUNT_EVENT, { detail: payload }));
  }
  return true;
}

/**
 * Keys already counted in this browser, so a repeated action counts once.
 *
 * Each key names a kind of count and a lesson or puzzle, such as
 * `first-stage:if-2-2-…` or `puzzle:12`. It stays here and is never sent. When
 * the browser refuses storage (a private window, a full disk), the keys are
 * kept for this page only, which still stops a replay within the visit.
 */
export const LEDGER_KEY = "ops-counted-v1";
const LEDGER_LIMIT = 500;
const KEY_SHAPE = /^[a-z-]+:[a-z0-9-]{1,100}$/;
const inThisPage = new Set<string>();

function readLedger(): string[] {
  try {
    const raw = window.localStorage.getItem(LEDGER_KEY);
    const value = raw ? (JSON.parse(raw) as { version?: unknown; keys?: unknown }) : null;
    if (value?.version !== 1 || !Array.isArray(value.keys)) return [];
    return value.keys.filter((key): key is string => typeof key === "string" && KEY_SHAPE.test(key));
  } catch {
    return [];
  }
}

function writeLedger(keys: string[]) {
  try {
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify({ version: 1, keys: keys.slice(-LEDGER_LIMIT) }));
  } catch {
    // Kept in `inThisPage` instead.
  }
}

/** Sends `event` unless `key` was counted before in this browser. Returns whether it was sent. */
export function countOnce(key: string, event: CountEvent): boolean {
  if (typeof window === "undefined" || !KEY_SHAPE.test(key)) return false;
  if (inThisPage.has(key)) return false;
  const ledger = readLedger();
  if (ledger.includes(key)) return false;
  if (!toPayload(event)) return false;
  inThisPage.add(key);
  writeLedger([...ledger, key]);
  return count(event);
}

/** "First stage finished", at most once per lesson in this browser. */
export function countFirstStage(lesson: string): boolean {
  return countOnce(`first-stage:${lesson}`, { name: "First stage finished", lesson });
}

/** For tests: forget the keys held for this page and send to Vercel again. */
export function resetCountsForTest() {
  inThisPage.clear();
  sink = sendToVercel;
}
