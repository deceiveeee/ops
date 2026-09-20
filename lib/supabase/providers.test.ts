import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enabledProviders } from "./providers";

/**
 * What the sign-in page is allowed to offer.
 *
 * The distinction this file exists for is between "off" and "not known". A
 * provider the project has turned off must not be offered, because pressing it
 * takes the person off the site to a raw 400 from the authorize endpoint. A
 * check that could not run is not evidence of anything, and withholding a
 * working button because the network hiccuped would be its own failure.
 */

const SETTINGS = {
  external: { google: false, github: false, email: true, phone: false },
};

describe("which providers a project has", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.invalid");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads the ones that are on, and asks with the key the browser already has", async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ external: { ...SETTINGS.external, google: true } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetcher);

    expect([...(await enabledProviders())!].sort()).toEqual(["email", "google"]);
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://project.supabase.invalid/auth/v1/settings");
    expect((init.headers as Record<string, string>).apikey).toBe("anon-key");
  });

  it("leaves out a provider the project has turned off", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify(SETTINGS), { status: 200 }));

    const providers = await enabledProviders();
    expect(providers?.has("google")).toBe(false);
    expect(providers?.has("email")).toBe(true);
  });

  it("answers 'not known' rather than 'off' when the check cannot run", async () => {
    vi.stubGlobal("fetch", async () => new Response("nope", { status: 500 }));
    expect(await enabledProviders()).toBeNull();

    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await enabledProviders()).toBeNull();
  });

  it("asks nothing at all without a project to ask", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    expect(await enabledProviders()).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
