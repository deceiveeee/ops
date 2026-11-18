import ClassicHomePage from "@/components/marketing/classic/ClassicHomePage";
import HomePage from "@/components/marketing/HomePage";
import { LAST_PUZZLE, puzzleNumbered } from "@/lib/daily-puzzle/catalog";
import { dateOfPuzzle, longDate, todaysNumber } from "@/lib/daily-puzzle/schedule";
import type { HomepageVersion } from "@/lib/homepage-version";
import { firstSteps, learningPath } from "@/lib/learning-path";
import { canonicalUrl } from "@/lib/share";
import { getSiteUrl } from "@/lib/site-url";

/**
 * One homepage version, with whatever it needs from the server.
 *
 * The current homepage opens on the daily company puzzle, so which puzzle it
 * shows depends on the date. The choice is made here on the server, because the
 * catalog holds the answers to puzzles that have not opened yet and only the
 * one shown may reach the browser. The course path and first steps are passed
 * down for the line under the buttons, which works out in the browser what to
 * suggest from the learner's own progress. The classic homepage needs nothing.
 */
export default function ChosenHomePage({ version }: { version: HomepageVersion }) {
  if (version === "classic") return <ClassicHomePage />;
  const today = todaysNumber(new Date());
  // After the last published puzzle, the newest one stays up as a past puzzle.
  const number = Math.min(today, LAST_PUZZLE);
  const puzzle = number >= 1 ? puzzleNumbered(number) : null;
  return (
    <HomePage
      puzzle={
        puzzle
          ? {
              puzzle,
              isToday: number === today,
              date: longDate(dateOfPuzzle(number)),
              shareUrl: canonicalUrl(`/daily/${number}`, getSiteUrl()),
            }
          : null
      }
      path={learningPath()}
      steps={firstSteps()}
    />
  );
}
