/**
 * Which puzzle is today's.
 *
 * Everyone gets the same puzzle on the same day, and the day turns over at
 * midnight in New York, the way the US markets keep time. A learner in
 * California therefore gets the next puzzle at 9 p.m. their time; that is the
 * price of one shared answer per day, and the page says so.
 *
 * FIRST_PUZZLE_DATE is the day puzzle #1 runs: the launch day, set on
 * 8 November 2026. Puzzles dated before launch would otherwise start life as
 * already-past puzzles in the archive. With 35 published puzzles the last one
 * runs on 12 December 2026; after that /daily says there is no new puzzle, so
 * more need publishing before then.
 */
export const FIRST_PUZZLE_DATE = "2026-11-08";
export const PUZZLE_TIME_ZONE = "America/New_York";

const DAY_MS = 86_400_000;

/** The calendar date, YYYY-MM-DD, that `now` falls on in `timeZone`. */
export function dateIn(timeZone: string, now: Date): string {
  // en-CA formats as YYYY-MM-DD, which is the form compared everywhere here.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function dayNumber(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

/** Puzzle numbers start at 1 on FIRST_PUZZLE_DATE. Before it, this is 0 or less. */
export function puzzleNumberOn(date: string): number {
  return dayNumber(date) - dayNumber(FIRST_PUZZLE_DATE) + 1;
}

export function dateOfPuzzle(number: number): string {
  return new Date((dayNumber(FIRST_PUZZLE_DATE) + number - 1) * DAY_MS).toISOString().slice(0, 10);
}

/** Today's puzzle number in New York, which may run past the last published puzzle. */
export function todaysNumber(now: Date): number {
  return puzzleNumberOn(dateIn(PUZZLE_TIME_ZONE, now));
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-11-03" -> "November 3, 2026". */
export function longDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
