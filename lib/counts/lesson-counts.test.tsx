import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { StrictMode, type ReactNode } from "react";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import BondJourneyShell from "@/components/lessons/investment-foundations/BondJourneyShell";
import EquityRiskJourneyShell from "@/components/lessons/investment-foundations/EquityRiskJourneyShell";
import StatementInvestigationShell from "@/components/lessons/investment-foundations/StatementInvestigationShell";
import ValuationJourneyShell from "@/components/lessons/investment-foundations/ValuationJourneyShell";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider, useProgressStore } from "@/lib/progress/store";
import { COUNT_EVENT, resetCountsForTest } from "./count";
import type { CountPayload } from "./events";

/**
 * "First stage finished" and "Lesson finished", driven the way a learner
 * drives them: through the stage shells every staged lesson uses, and the
 * progress store every lesson finishes through.
 */
const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function Providers({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <SessionProvider client={fakeClient}>
        <ProgressProvider>{children}</ProgressProvider>
      </SessionProvider>
    </StrictMode>
  );
}

let seen: CountPayload[] = [];
const listen = (event: Event) => seen.push((event as CustomEvent<CountPayload>).detail);
const names = () => seen.map((s) => `${s.name} ${JSON.stringify(s.props)}`);
const settle = () => act(() => new Promise((r) => setTimeout(r, 0)));

beforeAll(() => {
  // The shells scroll to the journey when the learner moves on; jsdom has no layout to scroll.
  Element.prototype.scrollIntoView = () => {};
});

afterEach(() => {
  window.removeEventListener(COUNT_EVENT, listen);
  seen = [];
  resetCountsForTest();
});

function startListening() {
  seen = [];
  window.addEventListener(COUNT_EVENT, listen);
}

const STAGE = { label: "One", title: "Stage one", guide: "g", instruction: "Answer it", next: "n" };
const answerButton = (step: number, onComplete: () => void) => (
  <button type="button" onClick={onComplete}>
    Answer stage {step + 1}
  </button>
);

describe("First stage finished", () => {
  it("counts once when the learner finishes stage 1, however often they answer it", async () => {
    const lesson = "if-1-1-how-an-investor-builds-a-philosophy";
    render(
      <ValuationJourneyShell lessonSlug={lesson} ariaLabel="journey" stages={[STAGE, { ...STAGE, label: "Two" }]} renderStage={answerButton} />,
      { wrapper: Providers },
    );
    await settle();
    startListening();
    fireEvent.click(screen.getByRole("button", { name: "Answer stage 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Answer stage 1" }));
    await settle();
    expect(names()).toEqual([`First stage finished {"lesson":"${lesson}"}`]);
  });

  it("counts nothing for a lesson restored as already done, and nothing when it is answered again", async () => {
    const lesson = "if-5-1-estimate-a-valuation-range";
    localStorage.setItem("ops-if-completion-v1", JSON.stringify({ [lesson]: true }));
    // Seen before in this browser, then the page is opened again.
    const { unmount } = render(
      <ValuationJourneyShell lessonSlug={lesson} ariaLabel="journey" stages={[STAGE]} renderStage={answerButton} />,
      { wrapper: Providers },
    );
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "Answer stage 1" }));
    unmount();
    resetCountsForTest();

    startListening();
    render(
      <ValuationJourneyShell
        lessonSlug={lesson}
        ariaLabel="journey"
        stages={[STAGE]}
        renderStage={answerButton}
        initialCompleted={[true]}
      />,
      { wrapper: Providers },
    );
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "Answer stage 1" }));
    await settle();
    expect(names()).toEqual([]);
  });

  it.each([
    ["BondJourneyShell", BondJourneyShell, "if-2-1-reading-a-bonds-promise"],
    ["EquityRiskJourneyShell", EquityRiskJourneyShell, "if-3-1-what-risk-means-for-a-shareholder"],
    ["StatementInvestigationShell", StatementInvestigationShell, "if-4-1-the-three-financial-statements"],
  ] as const)("%s counts stage 1 and the finished lesson once each", async (_, Shell, lesson) => {
    render(<Shell lessonSlug={lesson} ariaLabel="journey" steps={[STAGE]} renderStep={answerButton} />, { wrapper: Providers });
    await settle();
    startListening();
    // One stage, so it is both the first and the last: each count once, however often it is answered.
    fireEvent.click(screen.getByRole("button", { name: "Answer stage 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Answer stage 1" }));
    await settle();
    expect(names()).toEqual([`First stage finished {"lesson":"${lesson}"}`, `Lesson finished {"lesson":"${lesson}"}`]);
  });
});

describe("Lesson finished", () => {
  it("counts the first finish only", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: Providers });
    await settle();
    startListening();
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv-rule"));
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv-rule"));
    expect(names()).toEqual([`Lesson finished {"lesson":"npv-rule"}`]);
  });

  it("counts nothing for a lesson this browser had already finished", async () => {
    localStorage.setItem("ops-m8-completion-v1", JSON.stringify({ "npv-rule": true }));
    const { result } = renderHook(() => useProgressStore(), { wrapper: Providers });
    await settle();
    startListening();
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv-rule"));
    expect(names()).toEqual([]);
  });

  it("counts nothing when a finished lesson reopens before the store has read storage", async () => {
    localStorage.setItem("ops-m8-completion-v1", JSON.stringify({ "npv-rule": true }));
    startListening();
    const { result } = renderHook(() => useProgressStore(), { wrapper: Providers });
    // Called before the store's first read of storage, as a lesson restored on mount could.
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv-rule"));
    await settle();
    expect(names()).toEqual([]);
  });

  it("sends only the lesson's address, never the module's other records", async () => {
    localStorage.setItem("ops-m8-completion-v1", JSON.stringify({ "other-lesson": true }));
    const { result } = renderHook(() => useProgressStore(), { wrapper: Providers });
    await settle();
    startListening();
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv-rule"));
    expect(seen).toEqual([{ name: "Lesson finished", props: { lesson: "npv-rule" } }]);
  });
});
