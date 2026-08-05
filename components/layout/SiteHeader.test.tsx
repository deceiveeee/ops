import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider } from "@/lib/progress/store";
import SiteHeader from "./SiteHeader";

function baseClient(user: User | null) {
  return {
    auth: {
      getUser: async () => ({ data: { user } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({}),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  } as unknown as SupabaseClient;
}

function renderWith(user: User | null) {
  const client = baseClient(user);
  return render(
    <SessionProvider client={client}>
      <ProgressProvider>
        <SiteHeader />
      </ProgressProvider>
    </SessionProvider>,
  );
}

describe("SiteHeader account affordance", () => {
  it("shows Sign in when unauthenticated", async () => {
    renderWith(null);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows email and Synced when authenticated", async () => {
    renderWith({ id: "u1", email: "a@b.com" } as unknown as User);
    expect(await screen.findByText("a@b.com")).toBeInTheDocument();
    expect(await screen.findByText("Synced")).toBeInTheDocument();
  });
});
