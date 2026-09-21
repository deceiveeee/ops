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
 *
 * The key and the labels live here, apart from the workspace that reads them, so
 * that one file says what a portfolio choice is called on screen and under what
 * name it is kept. Choosing, opening and guarding a switch belong to the
 * workspace's own session (`components/studio/workspace/WorkspaceProvider.tsx`),
 * which holds the open project and so is the only thing that can know whether a
 * save is still in flight.
 */

export const STUDIO_MODE_KEY = "ops-studio-mode";

/**
 * Practice first, and deliberately: every portfolio saved before the choice
 * existed is a practice one, because that is what the workspace created.
 */
export const STUDIO_MODES: { value: StudioMode; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "personal", label: "Your own" },
];
