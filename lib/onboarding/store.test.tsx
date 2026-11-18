import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { OnboardingProvider, useOnboarding } from "./store";
import { GUIDE_LS_KEY } from "./localStorage";

const wrapper = ({ children }: { children: React.ReactNode }) => <OnboardingProvider>{children}</OnboardingProvider>;

async function ready() {
  const hook = renderHook(() => useOnboarding(), { wrapper });
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  return hook;
}

describe("start guide store", () => {
  beforeEach(() => localStorage.clear());

  it("becomes ready with nothing saved", async () => {
    const { result } = await ready();
    expect(result.current.ready).toBe(true);
    expect(result.current.snapshot).toBeNull();
    expect(result.current.isComplete).toBe(false);
    expect(result.current.firstStep).toBeNull();
  });

  it("saves each answer in this browser as it is picked", async () => {
    const { result } = await ready();
    act(() => result.current.setAnswer("goal", "build"));
    expect(JSON.parse(localStorage.getItem(GUIDE_LS_KEY)!).answers).toEqual({ goal: "build" });
    expect(result.current.isComplete).toBe(false);
  });

  it("will not complete until both questions are answered", async () => {
    const { result } = await ready();
    act(() => result.current.setAnswer("goal", "build"));
    act(() => result.current.complete());
    expect(result.current.isComplete).toBe(false);
    act(() => result.current.setAnswer("start", "some"));
    act(() => result.current.complete());
    expect(result.current.isComplete).toBe(true);
    expect(result.current.firstStep).toBe("investment-foundations");
  });

  it("reopens with the answers kept", async () => {
    const { result } = await ready();
    act(() => result.current.setAnswer("goal", "company"));
    act(() => result.current.setAnswer("start", "new"));
    act(() => result.current.complete());
    act(() => result.current.reopen());
    expect(result.current.isComplete).toBe(false);
    expect(result.current.snapshot?.answers).toEqual({ goal: "company", start: "new" });
  });

  it("reads a finished guide back after a reload", async () => {
    localStorage.setItem(GUIDE_LS_KEY, JSON.stringify({ answers: { goal: "company", start: "new" }, completedAt: "2026-11-13T10:00:00.000Z", updatedAt: "2026-11-13T10:00:00.000Z" }));
    const { result } = await ready();
    expect(result.current.isComplete).toBe(true);
    expect(result.current.firstStep).toBe("daily");
  });

  /**
   * The privacy page says signing in syncs which lessons are finished and
   * nothing else. The old quiz broke that: for anyone signed in it upserted
   * its answers to a `user_onboarding` table. A guest test cannot see that,
   * so this reads the source instead. It fails on the pre-2026-11-13 store,
   * which imported the session and called `.from("user_onboarding")`.
   */
  it("has no way to send answers to the server", () => {
    const source = readFileSync(resolve(__dirname, "store.tsx"), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    for (const reach of ["supabase", "useSession", "user_onboarding", ".from(", "fetch("]) {
      expect(source, `store.tsx should not use ${reach}`).not.toContain(reach);
    }
  });
});
