import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { OnboardingProvider } from "@/lib/onboarding/store";
import type { FirstSteps } from "@/lib/onboarding/types";
import StartGuide from "./StartGuide";

const steps: FirstSteps = {
  "finance-foundations": { title: "Lesson 1: What Is Finance? · 25 min", href: "/lessons/l1", action: "Start lesson 1" },
  "investment-foundations": { title: "Mission 1: Set your goal and your limits", href: "/lessons/m1", action: "Start mission 1" },
  daily: { title: "Today's company puzzle", href: "/daily", action: "Play today's puzzle" },
};

function renderGuide(retake = false) {
  return render(<OnboardingProvider><StartGuide steps={steps} retake={retake} /></OnboardingProvider>);
}

describe("StartGuide", () => {
  beforeEach(() => localStorage.clear());

  it("walks a newcomer from two questions to the first lesson", async () => {
    renderGuide();
    expect(await screen.findByRole("heading", { level: 1, name: "What brought you here?" })).toBeVisible();
    expect(screen.getByText("Find where to start · Step 1 of 3")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("Pick one to continue.");

    fireEvent.click(screen.getByRole("radio", { name: "Learn how investing works" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText(/That is Courses/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));

    expect(screen.getByRole("heading", { level: 1, name: "Where are you starting from?" })).toHaveFocus();
    fireEvent.click(screen.getByRole("radio", { name: "I am new to finance" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));

    expect(screen.getByRole("heading", { level: 1, name: "Your first step" })).toBeVisible();
    expect(screen.getByText("Lesson 1: What Is Finance? · 25 min")).toBeVisible();
    expect(screen.getByRole("link", { name: /Start lesson 1/ })).toHaveAttribute("href", "/lessons/l1");
    const path = screen.getByRole("list");
    expect(within(path).getAllByRole("link").map((link) => link.textContent)).toEqual(["Finance Foundations", "Investment Foundations"]);
  });

  it("sends someone curious about companies to the daily puzzle", async () => {
    renderGuide();
    fireEvent.click(await screen.findByRole("radio", { name: "Look inside a real company" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(screen.getByRole("radio", { name: "I know the basics, or I have invested" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByRole("link", { name: /Play today's puzzle/ })).toHaveAttribute("href", "/daily");
  });

  it("goes back with the answer kept", async () => {
    renderGuide();
    fireEvent.click(await screen.findByRole("radio", { name: "Try building a portfolio" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("radio", { name: "Try building a portfolio" })).toBeChecked();
  });

  it("reopens a finished guide on the first step, then on change of mind sends elsewhere", async () => {
    localStorage.setItem("ops-start-guide-v1", JSON.stringify({ answers: { goal: "build", start: "some" }, completedAt: "2026-11-13T10:00:00.000Z", updatedAt: "2026-11-13T10:00:00.000Z" }));
    renderGuide();
    expect(await screen.findByRole("link", { name: /Start mission 1/ })).toHaveAttribute("href", "/lessons/m1");
    fireEvent.click(screen.getByRole("button", { name: "Change my answers" }));
    expect(screen.getByRole("radio", { name: "Try building a portfolio" })).toBeChecked();
  });

  it("starts at question 1 when asked to retake, even after finishing", async () => {
    localStorage.setItem("ops-start-guide-v1", JSON.stringify({ answers: { goal: "learn", start: "new" }, completedAt: "2026-11-13T10:00:00.000Z", updatedAt: "x" }));
    renderGuide(true);
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "What brought you here?" })).toBeVisible());
  });
});
