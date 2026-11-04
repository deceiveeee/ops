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
