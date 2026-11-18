import ChosenHomePage from "@/components/marketing/ChosenHomePage";
import { HOMEPAGE } from "@/lib/homepage-version";

/**
 * The homepage. Which of the two versions it shows is set in one place,
 * lib/homepage-version.ts; components/marketing/ChosenHomePage.tsx gathers what
 * each needs.
 *
 * A minute's cache keeps the page fast; the current homepage shows the day's
 * puzzle, so at most the first minute after midnight in New York still shows
 * yesterday's.
 */
export const revalidate = 60;

export default function Page() {
  return <ChosenHomePage version={HOMEPAGE} />;
}
