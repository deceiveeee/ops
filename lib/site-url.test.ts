import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSiteUrl } from "./site-url";

/**
 * These read real environment variables, so each test restores what it found.
 * Vitest runs files in separate workers but tests within a file share a
 * process, and a leaked `VERCEL_URL` would silently change the answer for
 * every test after it.
 */
const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

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

describe("getSiteUrl", () => {
  it("falls back to localhost when nothing is configured", () => {
    expect(getSiteUrl().toString()).toBe("http://localhost:3000/");
  });

  it("prefers the explicit override above everything else", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://openportfoliostudio.com";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "ops.vercel.app";
    process.env.VERCEL_URL = "ops-c2b0exh00-deceiveeees-projects.vercel.app";
    expect(getSiteUrl().host).toBe("openportfoliostudio.com");
  });

  /**
   * The regression this file exists for.
   *
   * `VERCEL_URL` is per-deployment and changes on every push. When it won,
   * every deployment published a different canonical URL and a sitemap of its
   * own throwaway host. Against the old precedence this test fails.
   */
  it("prefers the stable production host over the per-deployment one", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "ops.vercel.app";
    process.env.VERCEL_URL = "ops-c2b0exh00-deceiveeees-projects.vercel.app";
    expect(getSiteUrl().host).toBe("ops.vercel.app");
  });

  it("uses the deployment host only when there is nothing better", () => {
    process.env.VERCEL_URL = "ops-c2b0exh00-deceiveeees-projects.vercel.app";
    expect(getSiteUrl().host).toBe("ops-c2b0exh00-deceiveeees-projects.vercel.app");
  });

  it("adds https to a bare host, because Vercel supplies no scheme", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "ops.vercel.app";
    expect(getSiteUrl().toString()).toBe("https://ops.vercel.app/");
  });

  it("keeps a scheme that was given, including http for local overrides", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:4000";
    expect(getSiteUrl().toString()).toBe("http://127.0.0.1:4000/");
  });

  /**
   * A variable defined-but-blank is a string, so a nullish check accepts it and
   * `new URL("")` then throws and takes the build down. Vercel's dashboard
   * makes an empty value easy to create by accident.
   */
  it("treats a blank or whitespace value as unset rather than throwing", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "";
    process.env.VERCEL_URL = "ops-c2b0exh00-deceiveeees-projects.vercel.app";
    expect(getSiteUrl().host).toBe("ops-c2b0exh00-deceiveeees-projects.vercel.app");
  });

  it("falls all the way back to localhost when every value is blank", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "  ";
    process.env.VERCEL_URL = "";
    expect(getSiteUrl().toString()).toBe("http://localhost:3000/");
  });
});
