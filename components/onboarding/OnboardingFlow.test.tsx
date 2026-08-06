import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import OnboardingFlow from "./OnboardingFlow";
import { OnboardingProvider } from "@/lib/onboarding/store";
import { SessionProvider } from "@/lib/supabase/session";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useReducedMotion: () => true,
}));

const guestClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function renderFlow(props: { retake?: boolean }) {
  return render(
    <SessionProvider client={guestClient}>
      <OnboardingProvider>
        <OnboardingFlow retake={props.retake ?? false} />
      </OnboardingProvider>
    </SessionProvider>,
  );
}

describe("OnboardingFlow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("starts at intro for a fresh guest", async () => {
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByText("Let's find your starting point.")).toBeTruthy();
    expect(screen.getByText("Begin")).toBeTruthy();
  });

  it("advances intro -> goal -> experience on Begin + answer", async () => {
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Begin"));
    });
    expect(screen.getByText("What brought you to OPS?")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText("Understand how investing works"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByText("Where are you starting from?")).toBeTruthy();
  });

  it("writes each answer to the store in non-retake mode", async () => {
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Begin"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Understand how investing works"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    const stored = JSON.parse(localStorage.getItem("ops-onboarding-v1")!);
    expect(stored.answers.goal).toBe("understand-how-investing-works");
    expect(stored.completed_at).toBeNull();
  });

  it("does NOT write during retake; only writes on completion", async () => {
    await act(async () => {
      renderFlow({ retake: true });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });

    expect(screen.queryByText("Begin")).toBeNull();
    expect(screen.getByText("What brought you to OPS?")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText("Understand how investing works"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(localStorage.getItem("ops-onboarding-v1")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByText("I am completely new to finance"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("I do not currently have an investment account"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Explain how major investments work"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Not confident yet"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByText("Which best describes you?")).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByText("Skip"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByText("Your OPS starting point")).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem("ops-onboarding-v1")!);
    expect(stored.completed_at).toBeTruthy();
    expect(stored.answers.goal).toBe("understand-how-investing-works");
  });

  it("lands on results when store already has completed_at", async () => {
    localStorage.setItem(
      "ops-onboarding-v1",
      JSON.stringify({
        answers: { goal: "learn-to-analyze-companies", experience: "completely-new" },
        completed_at: "2026-08-01T00:00:00.000Z",
        updated_at: "2026-08-01T00:00:00.000Z",
        recommended_course_slug: "finance-foundations",
        recommended_next_step: "Work through equities and valuation, then try a company case.",
        confidence_tier: null,
        segment: null,
        prompt_dismissed: false,
      }),
    );
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByText("Your OPS starting point")).toBeTruthy();
    expect(screen.queryByText("Begin")).toBeNull();
  });
});
