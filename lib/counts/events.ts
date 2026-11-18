/**
 * The six things OPS counts, and the only details each one may carry.
 *
 * docs/marketing/ops-learner-counts-2026-11-08.md says what each count means
 * and what it never contains. That list is enforced here: `toPayload` builds
 * what leaves the browser field by field from the checks below, so a detail
 * that is not named here, or a value that is not one of the expected shapes,
 * cannot be sent by accident. Nothing a learner typed, chose or picked is
 * one of those shapes.
 */

/** How a link left OPS: the phone's share sheet, a copied link, or Google Classroom. */
export const SHARE_HOWS = ["app", "link", "classroom"] as const;
export type ShareHow = (typeof SHARE_HOWS)[number];

/** Which kind of page was shared or opened from a share. */
export const PAGE_KINDS = ["puzzle", "lesson", "course", "other"] as const;
export type PageKind = (typeof PAGE_KINDS)[number];

export type CountEvent =
  | { name: "First stage finished"; lesson: string }
  | { name: "Lesson finished"; lesson: string }
  | { name: "Puzzle solved"; puzzle: number; clues: number }
  | { name: "Shared"; page: PageKind; how: ShareHow }
  | { name: "Arrived from a share"; page: PageKind; how: ShareHow }
  | { name: "Came back within 7 days" };

export type CountName = CountEvent["name"];
export type CountProps = Readonly<Record<string, string | number>>;
export type CountPayload = { name: CountName; props: CountProps };

/** A lesson's address name, as the site's own routes spell it: lowercase words joined by hyphens. */
const LESSON_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isLesson = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 100 && LESSON_SLUG.test(value);
const isWhole = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
const isHow = (value: unknown): value is ShareHow => (SHARE_HOWS as readonly unknown[]).includes(value);
const isPage = (value: unknown): value is PageKind => (PAGE_KINDS as readonly unknown[]).includes(value);

/** The highest puzzle number the archive could reach; matches the storage record's five-digit keys. */
const MAX_PUZZLE = 99_999;
/** A puzzle shows at most six clues (`CLUE_COUNT`); kept literal so this file depends on nothing. */
const MAX_CLUES = 6;

/**
 * What would be sent for `event`, or null when any detail is not one of the
 * expected shapes. Refusing is the safe failure: a count that is not sent
 * costs a number, a count that carries the wrong thing costs a promise.
 */
export function toPayload(event: CountEvent): CountPayload | null {
  switch (event.name) {
    case "First stage finished":
    case "Lesson finished":
      return isLesson(event.lesson) ? { name: event.name, props: { lesson: event.lesson } } : null;
    case "Puzzle solved":
      return isWhole(event.puzzle, 1, MAX_PUZZLE) && isWhole(event.clues, 1, MAX_CLUES)
        ? { name: event.name, props: { puzzle: event.puzzle, clues: event.clues } }
        : null;
    case "Shared":
    case "Arrived from a share":
      return isPage(event.page) && isHow(event.how) ? { name: event.name, props: { page: event.page, how: event.how } } : null;
    case "Came back within 7 days":
      return { name: event.name, props: {} };
    default:
      return null;
  }
}

/** Which kind of OPS page an address is, from its path alone. */
export function pageKind(pathname: string): PageKind {
  if (pathname === "/daily" || pathname.startsWith("/daily/")) return "puzzle";
  if (pathname.startsWith("/lessons/")) return "lesson";
  if (pathname.startsWith("/courses/")) return "course";
  return "other";
}
