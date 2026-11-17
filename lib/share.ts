import { SHARE_HOWS, type ShareHow } from "@/lib/counts/events";

/**
 * Sending a page to someone else.
 *
 * Google Classroom takes a link to share as one query parameter and opens its
 * own "assign or post" dialog; nothing is sent to Google until the teacher
 * clicks, and no Google script is loaded on this site to offer it.
 * https://developers.google.com/workspace/classroom/guides/sharebutton
 */
export function classroomShareUrl(url: string): string {
  return `https://classroom.google.com/share?url=${encodeURIComponent(url)}`;
}

/** The page's address on the site's canonical origin, so a shared link outlives the deployment it was copied from. */
export function canonicalUrl(path: string, origin: URL): string {
  return new URL(path, origin).toString();
}

/**
 * A shared link says only how it was shared: `?via=app`, `?via=link` or
 * `?via=classroom`. Nothing about who shared it. The page that opens reads the
 * mark once, counts the arrival, and takes the mark off the address bar
 * (`withoutShareMark`), so a reload or a link passed on again is not counted.
 */
export const SHARE_MARK = "via";

export function markShared(url: string, how: ShareHow): string {
  const marked = new URL(url);
  marked.searchParams.set(SHARE_MARK, how);
  return marked.toString();
}

/** How the opened link was shared, or null when it carries no mark (or one OPS never writes). */
export function readShareMark(url: URL): ShareHow | null {
  const value = url.searchParams.get(SHARE_MARK);
  return (SHARE_HOWS as readonly (string | null)[]).includes(value) ? (value as ShareHow) : null;
}

/** The same address, relative to the site, with the share mark removed and everything else kept. */
export function withoutShareMark(url: URL): string {
  const clean = new URL(url);
  clean.searchParams.delete(SHARE_MARK);
  return `${clean.pathname}${clean.search}${clean.hash}`;
}
