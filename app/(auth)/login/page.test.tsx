import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

/**
 * Signing in with a provider the project has not turned on.
 *
 * "Continue with Google" used to hand the browser to Supabase's authorize
 * endpoint and let it redirect. Against this project, which has `google` off,
 * that endpoint answers 400 with `{"msg":"Unsupported provider: provider is not
 * enabled"}` — so pressing the button took the learner off the site to a page
 * of raw JSON, with the back button as the only way home. Verified against the
 * live project on 2026-09-19.
 *
 * Two things follow, and both are tested here: a provider that is off is not
 * offered at all, and a failure that still happens stays on this page in words.
 */

const push = vi.fn();
const signInWithOAuth = vi.fn();
const signInWithPassword = vi.fn();
const providers = vi.fn();
const params = { value: new URLSearchParams("next=/courses") };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => params.value,
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowser: () => ({ auth: { signInWithOAuth, signInWithPassword } }),
}));

vi.mock("@/lib/supabase/providers", () => ({
  enabledProviders: () => providers(),
}));

import LoginPage from "./page";

const googleButton = () => screen.queryByRole("button", { name: "Continue with Google" });

describe("what the sign-in page offers", () => {
  beforeEach(() => {
    push.mockReset();
    signInWithOAuth.mockReset();
    providers.mockReset();
    params.value = new URLSearchParams("next=/courses");
    vi.stubGlobal("location", { origin: "https://ops.invalid", assign: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not offer a provider the project has turned off", async () => {
    providers.mockResolvedValue(new Set(["email"]));

    render(<LoginPage />);

    // Email is what this project has, so it is what the page asks for.
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    await waitFor(() => expect(googleButton()).toBeNull());
  });

  it("offers it where the project has it", async () => {
    providers.mockResolvedValue(new Set(["email", "google"]));

    render(<LoginPage />);

    await waitFor(() => expect(googleButton()).toBeInTheDocument());
  });

  /**
   * A check that could not run is not evidence that signing in would fail, and
   * withholding a working button because the network hiccuped would be its own
   * failure. The click path below is what catches it if it really is off.
   */
  it("keeps offering it when the check could not run", async () => {
    providers.mockResolvedValue(null);

    render(<LoginPage />);

    await waitFor(() => expect(googleButton()).toBeInTheDocument());
  });
});

describe("when the provider refuses", () => {
  beforeEach(() => {
    push.mockReset();
    signInWithOAuth.mockReset();
    providers.mockResolvedValue(null);
    params.value = new URLSearchParams("next=/courses");
    vi.stubGlobal("location", { origin: "https://ops.invalid", assign: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("says so on this page instead of sending the learner to the error", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: null, provider: "google" },
      error: { message: "Unsupported provider: provider is not enabled" },
    });

    render(<LoginPage />);
    await waitFor(() => expect(googleButton()).toBeInTheDocument());
    fireEvent.click(googleButton()!);

    await waitFor(() => expect(screen.getByText(/not set up on this site yet/i)).toBeInTheDocument());
    // The whole point: the browser stayed here.
    expect((globalThis.location as unknown as { assign: ReturnType<typeof vi.fn> }).assign).not.toHaveBeenCalled();
  });

  it("goes to the provider when it answers with somewhere to go", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://project.supabase.invalid/auth/v1/authorize?provider=google" },
      error: null,
    });

    render(<LoginPage />);
    await waitFor(() => expect(googleButton()).toBeInTheDocument());
    fireEvent.click(googleButton()!);

    await waitFor(() =>
      expect((globalThis.location as unknown as { assign: ReturnType<typeof vi.fn> }).assign).toHaveBeenCalledWith(
        "https://project.supabase.invalid/auth/v1/authorize?provider=google",
      ),
    );
    // The address is asked for first, so nothing is navigated to on trust.
    expect(signInWithOAuth.mock.calls[0][0].options.skipBrowserRedirect).toBe(true);
  });

  /**
   * The callback route sends a failed round trip back to `/login?error=auth`.
   * Saying nothing about it leaves someone looking at the form they just came
   * from, unable to tell whether they are signed in.
   */
  it("says what happened when the round trip comes back failed", async () => {
    params.value = new URLSearchParams("error=auth");

    render(<LoginPage />);

    expect(screen.getByText(/did not finish/i)).toBeInTheDocument();
  });
});
