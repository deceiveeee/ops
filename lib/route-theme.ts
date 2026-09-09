export type RouteTheme = "dark" | "light";

/**
 * Resolve the site theme for a given pathname.
 *
 * Light = the surfaces someone works and reads in: /courses, /lessons,
 *         /studio and /filings.
 * Dark  = the marketing homepage, not-found.
 *
 * Studio joined the light set once its components stopped hardcoding dark
 * Tailwind utilities and started reading the `--st-*` tokens, which are
 * defined dark at `:root` and redefined under `.ops-theme-light`. Before that
 * this one line would have changed the surface and left every word on it
 * invisible: `text-white` alone appeared 41 times and renders at 1.00:1 on
 * white.
 *
 * The filing reader followed for a reason of its own. Research now opens with a
 * search that leads straight into it, so a learner crosses from Studio to a
 * filing and back inside one task — and a surface that inverts mid-task reads
 * as a different site rather than as the next screen. Its sixty-nine dark
 * literals were converted first, in the same order and for the same reason.
 *
 * Centralised so SiteShell can switch theme from the pathname alone,
 * without per-route configuration.
 */
export function routeTheme(pathname: string): RouteTheme {
  if (
    pathname.startsWith("/courses") ||
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/filings")
  ) {
    return "light";
  }
  return "dark";
}
