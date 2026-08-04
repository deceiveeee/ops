import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider, useProgressStore } from "./store";

const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function guestWrapper(client: SupabaseClient = fakeClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <SessionProvider client={client}>
      <ProgressProvider>{children}</ProgressProvider>
    </SessionProvider>
  );
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
