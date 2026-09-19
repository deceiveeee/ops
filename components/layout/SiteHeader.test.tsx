import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider } from "@/lib/progress/store";
import { OnboardingProvider } from "@/lib/onboarding/store";
import SiteHeader from "./SiteHeader";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => route.pathname,
}));

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
    expect(screen.getAllByText("Company reports").length).toBeGreaterThan(0);
    // Studio was excluded while it was six sample panels. It is now a working
    // workspace, so the beta surfaces it.
    expect(screen.getAllByText("Studio").length).toBeGreaterThan(0);
  });

  /**
   * Accounts are offered and optional. Signing in has to be reachable, and it
   * has to stay beside the primary action rather than in front of it -- a
   * learner who never makes an account loses no surface, so "Open Studio" is
   * still the call this header makes.
   */
  it("offers a way in without demanding one", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Open Studio" })).toHaveAttribute("href", "/studio");
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
    expect(screen.getByRole("link", { name: "Open Studio" })).toHaveAttribute("href", "/studio");
    vi.doUnmock("@/lib/beta");
    vi.resetModules();
  });
});

describe("SiteHeader current page", () => {
  // Company reports lives inside Studio, so both links match its path. A header
  // that marked both would tell a screen-reader user they are in two places.
  it("marks only Company reports as current on a report, though it sits under Studio", () => {
    route.pathname = "/studio/filings/0001666138/0001628280-25-054049";
    renderHeader();
    const main = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(main).getByRole("link", { name: "Company reports" })).toHaveAttribute("href", "/studio/filings");
    expect(within(main).getByRole("link", { name: "Company reports" })).toHaveAttribute("aria-current", "page");
    expect(within(main).getByRole("link", { name: "Studio" })).not.toHaveAttribute("aria-current");
  });

  it("still marks Studio as current everywhere else in Studio", () => {
    route.pathname = "/studio/investigate";
    renderHeader();
    const main = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(main).getByRole("link", { name: "Studio" })).toHaveAttribute("aria-current", "page");
    expect(within(main).getByRole("link", { name: "Company reports" })).not.toHaveAttribute("aria-current");
  });
});
