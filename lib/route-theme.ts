export type RouteTheme = "dark" | "light";

/**
 * Resolve the site theme for a given pathname.
 *
 * One visual environment across learning, research and portfolio work.
 * Keep this resolver for callers, but navigation must never change the theme.
 */
export function routeTheme(_pathname: string): RouteTheme {
  return "light";
}
