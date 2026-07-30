export type RouteTheme = "dark" | "light";

/**
 * Resolve the site theme for a given pathname.
 *
 * Light = the learning surface (/courses, /courses/[slug], /lessons/[slug]).
 * Dark  = everything else (/, /studio, /filings, not-found).
 *
 * Centralised so SiteShell can switch theme from the pathname alone,
 * without per-route configuration.
 */
export function routeTheme(pathname: string): RouteTheme {
  if (pathname.startsWith("/courses") || pathname.startsWith("/lessons")) {
    return "light";
  }
  return "dark";
}
