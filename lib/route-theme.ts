export type RouteTheme = "dark" | "light";

/**
 * Resolve the site theme for a given pathname.
 *
 * Light = the surfaces someone works and reads in: /courses, /lessons, and
 *         /studio.
 * Dark  = the marketing homepage, /filings, not-found.
 *
 * Studio joined the light set once its components stopped hardcoding dark
 * Tailwind utilities and started reading the `--st-*` tokens, which are
 * defined dark at `:root` and redefined under `.ops-theme-light`. Before that
 * this one line would have changed the surface and left every word on it
 * invisible: `text-white` alone appeared 41 times and renders at 1.00:1 on
 * white.
 *
 * Centralised so SiteShell can switch theme from the pathname alone,
 * without per-route configuration.
 */
export function routeTheme(pathname: string): RouteTheme {
  if (
    pathname.startsWith("/courses") ||
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/studio")
  ) {
    return "light";
  }
  return "dark";
}
