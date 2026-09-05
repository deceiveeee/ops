import { describe, it, expect } from "vitest";
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

function renderHeader() {
  const client = baseClient();
  return render(
    <SessionProvider client={client} guestOnly>
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

  it("keeps account entry points out of the guest-only beta", () => {
    renderHeader();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.getAllByText("Start building").length).toBeGreaterThan(0);
  });
});
