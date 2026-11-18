/**
 * Which homepage the site shows at "/".
 *
 * "current" is the homepage built in November 2026: the daily company puzzle,
 * one real market figure and a contents list. "classic" is the earlier one
 * ("Your money. Your move."), kept whole in components/marketing/classic so it
 * can come back with this one line.
 *
 * Both can be seen at any time, whichever is live, at /homepage/current and
 * /homepage/classic. Those two addresses ask search engines not to index them,
 * so the site never has two homepages competing in results.
 */
export const HOMEPAGE_VERSIONS = ["current", "classic"] as const;
export type HomepageVersion = (typeof HOMEPAGE_VERSIONS)[number];

export const HOMEPAGE: HomepageVersion = "current";
