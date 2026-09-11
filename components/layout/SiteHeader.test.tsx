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
    expect(screen.getAllByText("Company reports").length).toBeGreaterThan(0);
    // Studio was excluded while it was six sample panels. It is now a working
    // workspace, so the beta surfaces it.
    expect(screen.getAllByText("Studio").length).toBeGreaterThan(0);
  });

  it("keeps account entry points out of the guest-only beta", () => {
    renderHeader();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Studio" })).toHaveAttribute("href", "/studio");
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
