import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import {
  ProgressProvider,
  useProgressStore,
  type ProgressDoc,
} from "./store";

const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function guestWrapper(client: SupabaseClient = fakeClient) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider client={client}>
        <ProgressProvider>{children}</ProgressProvider>
      </SessionProvider>
    );
  }
  return Wrapper;
}

describe("ProgressProvider (guest)", () => {
  it("starts not ready, becomes ready with empty completion", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    expect(result.current.ready).toBe(false);
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.ready).toBe(true);
    expect(result.current.syncStatus).toBe("guest");
    expect(result.current.getModuleCompletion("ops-m3-completion-v1")).toEqual({});
  });

  it("marks a lesson complete and reports it", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m8-completion-v1", "npv-rule")).toBe(false);
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv-rule"));
    expect(result.current.isComplete("ops-m8-completion-v1", "npv-rule")).toBe(true);
    expect(result.current.getModuleCompletion("ops-m8-completion-v1")).toEqual({
      "npv-rule": true,
    });
  });

  it("persists to the per-module localStorage key", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.markComplete("ops-m3-completion-v1", "lesson-a"));
    expect(JSON.parse(localStorage.getItem("ops-m3-completion-v1")!)).toEqual({
      "lesson-a": true,
    });
  });

  it("hydrates from existing per-module localStorage keys", async () => {
    localStorage.setItem(
      "ops-m3-completion-v1",
      JSON.stringify({ seeded: true }),
    );
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m3-completion-v1", "seeded")).toBe(true);
  });

  it("markComplete is idempotent", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.markComplete("ops-m8-completion-v1", "x"));
    act(() => result.current.markComplete("ops-m8-completion-v1", "x"));
    expect(result.current.getModuleCompletion("ops-m8-completion-v1")).toEqual({ x: true });
  });
});

type UpsertPayload = { user_id: string; completion: ProgressDoc; updated_at: string };

function makeSignedClient(startUser: { id: string } | null = null) {
  const state: { rows: Record<string, ProgressDoc>; user: { id: string } | null } = {
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
        eq: (_col: string, _val: string) => ({
          single: async () => ({
            data: table === "user_progress" && state.user && state.rows[state.user.id]
              ? { user_id: state.user.id, completion: state.rows[state.user.id] }
              : null,
            error: null,
          }),
        }),
      }),
      upsert: (payload: UpsertPayload) => {
        if (table !== "user_progress" || !state.user) {
          return Promise.resolve({ error: { message: "no user" } });
        }
        state.rows[state.user.id] = payload.completion;
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
    __rows: Record<string, ProgressDoc>;
  };
}

function signedWrapper(client: ReturnType<typeof makeSignedClient>) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider client={client as unknown as SupabaseClient}>
        <ProgressProvider>{children}</ProgressProvider>
      </SessionProvider>
    );
  }
  return Wrapper;
}

describe("ProgressProvider (signed-in)", () => {
  it("merges local + cloud on first appearance and writes back", async () => {
    localStorage.setItem("ops-m3-completion-v1", JSON.stringify({ local: true }));
    const client = makeSignedClient(null);
    client.__rows["u1"] = { "ops-m3-completion-v1": { cloud: true } };
    const { result } = renderHook(() => useProgressStore(), {
      wrapper: signedWrapper(client),
    });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    client.__setUser({ id: "u1" });
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m3-completion-v1", "local")).toBe(true);
    expect(result.current.isComplete("ops-m3-completion-v1", "cloud")).toBe(true);
    expect(client.__rows["u1"]["ops-m3-completion-v1"]).toEqual({
      local: true,
      cloud: true,
    });
  });

  it("optimistically marks complete then upserts to cloud", async () => {
    const client = makeSignedClient({ id: "u2" });
    const { result } = renderHook(() => useProgressStore(), {
      wrapper: signedWrapper(client),
    });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv"));
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m8-completion-v1", "npv")).toBe(true);
    await waitFor(() =>
      expect(client.__rows["u2"]?.["ops-m8-completion-v1"]?.npv).toBe(true),
    );
  });

  it("keeps local progress on cloud error", async () => {
    const client = makeSignedClient({ id: "u3" });
    (client.from as unknown) = (_t: string) => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: { message: "boom" } }),
    });
    const { result } = renderHook(() => useProgressStore(), {
      wrapper: signedWrapper(client),
    });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.markComplete("ops-m3-completion-v1", "z"));
    expect(result.current.isComplete("ops-m3-completion-v1", "z")).toBe(true);
    await waitFor(() => expect(result.current.syncStatus).toBe("error"));
  });
});
