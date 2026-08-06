import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { OnboardingProvider, useOnboarding } from "./store";
import type { OnboardingSnapshot } from "./types";

const guestClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function guestWrapper(client: SupabaseClient = guestClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider client={client}>
        <OnboardingProvider>{children}</OnboardingProvider>
      </SessionProvider>
    );
  };
}

describe("OnboardingProvider (guest)", () => {
  it("starts not ready, becomes ready with null snapshot", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    expect(result.current.ready).toBe(false);
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.ready).toBe(true);
    expect(result.current.syncStatus).toBe("guest");
    expect(result.current.snapshot).toBeNull();
    expect(result.current.isComplete).toBe(false);
  });

  it("setAnswer writes to localStorage and exposes the partial snapshot", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.setAnswer("goal", "learn-to-analyze-companies"));
    expect(result.current.snapshot?.answers.goal).toBe("learn-to-analyze-companies");
    expect(result.current.snapshot?.completed_at).toBeNull();
    expect(result.current.isComplete).toBe(false);
    const stored = JSON.parse(localStorage.getItem("ops-onboarding-v1")!);
    expect(stored.answers.goal).toBe("learn-to-analyze-companies");
  });

  it("markComplete writes completed_at and computed recommendation", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() =>
      result.current.markComplete({
        answers: {
          goal: "learn-to-analyze-companies",
          experience: "completely-new",
          access: "no-account",
          outcome: "evaluate-company-attractiveness",
          confidence: "somewhat-confident",
        },
        segment: "adult-learner",
      }),
    );
    expect(result.current.isComplete).toBe(true);
    expect(result.current.snapshot?.completed_at).toBeTruthy();
    expect(result.current.snapshot?.recommended_course_slug).toBe("finance-foundations");
    expect(result.current.snapshot?.confidence_tier).toBe("somewhat-confident");
    expect(result.current.snapshot?.segment).toBe("adult-learner");
    expect(result.current.recommended?.primaryCourseSlug).toBe("finance-foundations");
  });

  it("dismissPrompt creates a snapshot with prompt_dismissed=true", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.snapshot).toBeNull();
    act(() => result.current.dismissPrompt());
    expect(result.current.snapshot?.prompt_dismissed).toBe(true);
  });

  it("hydrates from existing localStorage snapshot", async () => {
    const seeded: OnboardingSnapshot = {
      answers: { goal: "still-figuring-that-out" },
      completed_at: null,
      updated_at: "2026-08-01T00:00:00.000Z",
      recommended_course_slug: null,
      recommended_next_step: null,
      confidence_tier: null,
      segment: null,
      prompt_dismissed: false,
    };
    localStorage.setItem("ops-onboarding-v1", JSON.stringify(seeded));
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.snapshot?.answers.goal).toBe("still-figuring-that-out");
  });
});

type UpsertRow = {
  user_id: string;
  answers: unknown;
  recommended_course_slug: string | null;
  recommended_next_step: string | null;
  confidence_tier: string | null;
  segment: string | null;
  prompt_dismissed: boolean;
  completed_at: string | null;
  updated_at: string;
};

function makeSignedClient(startUser: { id: string } | null = null) {
  const state: { rows: Record<string, OnboardingSnapshot>; user: { id: string } | null } = {
    rows: {},
    user: startUser,
  };
  const listeners: ((u: { id: string } | null) => void)[] = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user: state.user } }),
      onAuthStateChange: (cb: (e: string, s: { user?: { id: string } } | null) => void) => {
        listeners.push((u) => cb("STATE_CHANGED", u ? { user: u } : null));
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => {
          const run = async () => ({
            data:
              table === "user_onboarding" && state.user && state.rows[state.user.id]
                ? { user_id: state.user.id, ...state.rows[state.user.id] }
                : null,
            error: null,
          });
          return { single: run, maybeSingle: run };
        },
      }),
      upsert: (payload: UpsertRow) => {
        if (table !== "user_onboarding" || !state.user) {
          return Promise.resolve({ error: { message: "no user" } });
        }
        const snap: OnboardingSnapshot = {
          answers: payload.answers as OnboardingSnapshot["answers"],
          completed_at: payload.completed_at,
          updated_at: payload.updated_at,
          recommended_course_slug: payload.recommended_course_slug,
          recommended_next_step: payload.recommended_next_step,
          confidence_tier: payload.confidence_tier as OnboardingSnapshot["confidence_tier"],
          segment: payload.segment as OnboardingSnapshot["segment"],
          prompt_dismissed: payload.prompt_dismissed,
        };
        state.rows[state.user.id] = snap;
        return Promise.resolve({ error: null });
      },
    }),
    __setUser: (u: { id: string } | null) => {
      state.user = u;
      listeners.forEach((l) => l(u));
    },
    __rows: state.rows,
  };
  return client as unknown as SupabaseClient & {
    __setUser: (u: { id: string } | null) => void;
    __rows: Record<string, OnboardingSnapshot>;
  };
}

function signedWrapper(client: ReturnType<typeof makeSignedClient>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider client={client as unknown as SupabaseClient}>
        <OnboardingProvider>{children}</OnboardingProvider>
      </SessionProvider>
    );
  };
}

describe("OnboardingProvider (signed-in)", () => {
  it("merges guest-local + cloud on first auth and writes back", async () => {
    const localSnap: OnboardingSnapshot = {
      answers: { goal: "learn-to-analyze-companies", experience: "completely-new" },
      completed_at: "2026-08-01T00:00:00.000Z",
      updated_at: "2026-08-01T00:00:00.000Z",
      recommended_course_slug: "finance-foundations",
      recommended_next_step: "Work through equities and valuation, then try a company case.",
      confidence_tier: null,
      segment: null,
      prompt_dismissed: false,
    };
    localStorage.setItem("ops-onboarding-v1", JSON.stringify(localSnap));

    const client = makeSignedClient(null);
    client.__rows["u1"] = {
      answers: {},
      completed_at: null,
      updated_at: "2026-07-01T00:00:00.000Z",
      recommended_course_slug: null,
      recommended_next_step: null,
      confidence_tier: null,
      segment: null,
      prompt_dismissed: false,
    };

    const { result } = renderHook(() => useOnboarding(), { wrapper: signedWrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    client.__setUser({ id: "u1" });
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));

    expect(result.current.snapshot?.completed_at).toBe("2026-08-01T00:00:00.000Z");
    expect(client.__rows["u1"]?.completed_at).toBe("2026-08-01T00:00:00.000Z");
  });

  it("markComplete upserts to cloud", async () => {
    const client = makeSignedClient({ id: "u2" });
    const { result } = renderHook(() => useOnboarding(), { wrapper: signedWrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));

    act(() =>
      result.current.markComplete({
        answers: { goal: "build-a-diversified-portfolio", experience: "analyze-independently" },
      }),
    );
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(client.__rows["u2"]?.completed_at).toBeTruthy();
    expect(client.__rows["u2"]?.recommended_course_slug).toBe("investment-foundations");
  });

  it("keeps local snapshot on cloud upsert error", async () => {
    const client = makeSignedClient({ id: "u3" });
    (client.from as unknown) = (_t: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
      upsert: () => Promise.resolve({ error: { message: "boom" } }),
    });
    const { result } = renderHook(() => useOnboarding(), { wrapper: signedWrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.setAnswer("goal", "explore-finance-as-a-career"));
    expect(result.current.snapshot?.answers.goal).toBe("explore-finance-as-a-career");
    await waitFor(() => expect(result.current.syncStatus).toBe("error"));
  });
});
