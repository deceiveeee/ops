import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider } from "./store";
import { useFIProgress, useReportFIComplete } from "@/lib/fi-progress";

const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider client={fakeClient}>
    <ProgressProvider>{children}</ProgressProvider>
  </SessionProvider>
);

describe("FI adapter", () => {
  it("delegates markComplete through the store", async () => {
    const { result } = renderHook(() => useFIProgress(), { wrapper });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    const slug = "fixed-income-bond-markets-cash-flows-discount-bonds";
    expect(result.current.isComplete(slug)).toBe(false);
    act(() => result.current.markComplete(slug));
    expect(result.current.isComplete(slug)).toBe(true);
    expect(JSON.parse(localStorage.getItem("ops-m3-completion-v1")!)[slug]).toBe(true);
  });

  it("useReportFIComplete marks its slug", async () => {
    const slug = "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds";
    const { result } = renderHook(() => useReportFIComplete(slug), { wrapper });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current());
    expect(JSON.parse(localStorage.getItem("ops-m3-completion-v1")!)[slug]).toBe(true);
  });
});
