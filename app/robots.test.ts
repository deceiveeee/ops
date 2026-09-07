import { afterEach, beforeEach, describe, expect, it } from "vitest";
import robots from "./robots";

/**
 * These read real environment variables, so each test restores what it found —
 * a leaked `VERCEL_ENV` would change the answer for every test after it.
 */
const KEYS = ["VERCEL_ENV", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL", "NEXT_PUBLIC_SITE_URL"] as const;

let saved: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));
  for (const key of KEYS) delete process.env[key];
});

afterEach(() => {
  for (const key of KEYS) {
    const value = saved[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

/** `rules` is a union of one or many; these routes only ever return one. */
const only = (result: ReturnType<typeof robots>) =>
  Array.isArray(result.rules) ? result.rules[0] : result.rules;

describe("robots", () => {
  it("invites crawlers on production and names the sitemap", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "ops.example-stable.app";
    const result = robots();
    expect(only(result).allow).toBe("/");
    expect(result.sitemap).toBe("https://ops.example-stable.app/sitemap.xml");
  });

  it("still shuts crawlers out of the account routes on production", () => {
    process.env.VERCEL_ENV = "production";
    expect(only(robots()).disallow).toEqual([
      "/api/",
      "/auth/",
      "/login",
      "/signup",
      "/forgot-password",
    ]);
  });

  /**
   * The reason this file exists. A preview carries a full copy of the site on a
   * host that will stop existing, so it must not compete with production.
   */
  it("closes a preview deployment completely", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "ops-c2b0exh00-ephemeral.vercel.app";
    const result = robots();
    expect(only(result).disallow).toBe("/");
    expect(only(result).allow).toBeUndefined();
  });

  it("closes a Vercel development deployment too", () => {
    process.env.VERCEL_ENV = "development";
    expect(only(robots()).disallow).toBe("/");
  });

  /**
   * A preview that named a sitemap would be undercutting the request it just
   * made, and the sitemap it named would list production's URLs anyway.
   */
  it("names no sitemap on a preview", () => {
    process.env.VERCEL_ENV = "preview";
    expect(robots().sitemap).toBeUndefined();
  });

  /**
   * Absent off Vercel — locally, and on any other host. Those must keep their
   * rules rather than silently closing themselves to crawlers.
   */
  it("keeps the full rules when the environment is unknown", () => {
    const result = robots();
    expect(only(result).allow).toBe("/");
    expect(result.sitemap).toBe("http://localhost:3000/sitemap.xml");
  });
});
