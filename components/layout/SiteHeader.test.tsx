import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider } from "@/lib/progress/store";
import { OnboardingProvider } from "@/lib/onboarding/store";
import SiteHeader from "./SiteHeader";

function baseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({}),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  } as unknown as SupabaseClient;
}

function renderHeader({ guestOnly = false } = {}) {
  const client = baseClient();
  return render(
    <SessionProvider client={client} guestOnly={guestOnly}>
      <OnboardingProvider>
        <ProgressProvider>
          <SiteHeader />
        </ProgressProvider>
      </OnboardingProvider>
    </SessionProvider>,
  );
}

describe("SiteHeader public beta navigation", () => {
  it("exposes only complete beta surfaces", () => {
    renderHeader();
    expect(screen.getAllByText("Courses").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Your plan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Filings").length).toBeGreaterThan(0);
    // Studio was excluded while it was six sample panels. It is now a working
    // workspace, so the beta surfaces it.
    expect(screen.getAllByText("Studio").length).toBeGreaterThan(0);
  });

  /**
   * Accounts are offered and optional. Signing in has to be reachable, and it
   * has to stay beside the primary action rather than in front of it -- a
   * learner who never makes an account loses no surface, so "Start building"
   * is still the call this header makes.
   */
  it("offers a way in without demanding one", () => {
    renderHeader();
    expect(screen.getAllByText("Sign in").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Start building").length).toBeGreaterThan(0);
  });

  /**
   * Closing accounts again has to remove the offer, not just the destination.
   * The middleware sends /login back to /courses under the guest-only flag, so
   * a header that still advertised it would hand every visitor a control that
   * bounces them somewhere else.
   */
  it("withdraws the offer when accounts are closed, not just the route", async () => {
    vi.resetModules();
    vi.doMock("@/lib/beta", () => ({
      GUEST_ONLY_BETA: true,
      BETA_HIDDEN_LESSON_SLUGS: new Set<string>(),
      isPublicBetaLesson: () => true,
    }));
    /*
     * Every provider is re-imported through the reset registry alongside the
     * header. Importing only the header leaves it reading a second copy of the
     * session module, whose context the provider above it never populates.
     */
    const [{ default: GuestHeader }, session, progress, onboarding] = await Promise.all([
      import("./SiteHeader"),
      import("@/lib/supabase/session"),
      import("@/lib/progress/store"),
      import("@/lib/onboarding/store"),
    ]);
    render(
      <session.SessionProvider client={baseClient()} guestOnly>
        <onboarding.OnboardingProvider>
          <progress.ProgressProvider>
            <GuestHeader />
          </progress.ProgressProvider>
        </onboarding.OnboardingProvider>
      </session.SessionProvider>,
    );
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    vi.doUnmock("@/lib/beta");
    vi.resetModules();
  });
});
