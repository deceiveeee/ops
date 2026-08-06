import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingQuestion from "./OnboardingQuestion";
import type { Question } from "@/lib/onboarding/types";

const question: Question = {
  id: "goal",
  prompt: "What brought you to OPS?",
  helper: "Choose the outcome that matters most to you.",
  options: [
    { id: "learn-to-analyze-companies", label: "Learn to analyze companies" },
    { id: "build-a-diversified-portfolio", label: "Build a diversified portfolio" },
  ],
};

const optionalQuestion: Question = {
  id: "segment",
  prompt: "Which best describes you?",
  helper: "Optional. Helps us understand who we are reaching.",
  optional: true,
  options: [{ id: "adult-learner", label: "Adult learner" }],
};

describe("OnboardingQuestion", () => {
  it("renders prompt, helper, and all option labels", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    expect(screen.getByText("What brought you to OPS?")).toBeTruthy();
    expect(screen.getByText("Choose the outcome that matters most to you.")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Learn to analyze companies" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Build a diversified portfolio" })).toBeTruthy();
  });

  it("calls onSelect with the option id when a card is clicked", () => {
    const onSelect = vi.fn();
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={onSelect}
        onSkip={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Learn to analyze companies"));
    expect(onSelect).toHaveBeenCalledWith("learn-to-analyze-companies");
  });

  it("marks the matching option as aria-checked when selectedValue is set", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue="learn-to-analyze-companies"
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    const selected = screen.getByRole("radio", { name: "Learn to analyze companies" });
    expect(selected).toHaveAttribute("aria-checked", "true");
    const other = screen.getByRole("radio", { name: "Build a diversified portfolio" });
    expect(other).toHaveAttribute("aria-checked", "false");
  });

  it("renders a Skip link only when question.optional is true", () => {
    const onSkip = vi.fn();
    const { rerender } = render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={onSkip}
      />,
    );
    expect(screen.queryByText("Skip")).toBeNull();

    rerender(
      <OnboardingQuestion
        question={optionalQuestion}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={onSkip}
      />,
    );
    fireEvent.click(screen.getByText("Skip"));
    expect(onSkip).toHaveBeenCalled();
  });

  it("exposes a radiogroup role", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    expect(screen.getByRole("radiogroup")).toBeTruthy();
  });

  it("roves tabindex to the first card when nothing is selected", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
  });

  it("roves tabindex to the selected card when a value is selected", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue="build-a-diversified-portfolio"
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
    expect(radios[1]).toHaveAttribute("tabindex", "0");
  });

  it("ArrowDown moves focus to the next card and follows the tab stop", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    const group = screen.getByRole("radiogroup");
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    expect(document.activeElement).toBe(radios[0]);
    fireEvent.keyDown(group, { key: "ArrowDown" });
    expect(document.activeElement).toBe(radios[1]);
    expect(radios[1]).toHaveAttribute("tabindex", "0");
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
  });

  it("ArrowDown wraps from the last card back to the first", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue="build-a-diversified-portfolio"
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    const group = screen.getByRole("radiogroup");
    const radios = screen.getAllByRole("radio");
    radios[1].focus();
    fireEvent.keyDown(group, { key: "ArrowDown" });
    expect(document.activeElement).toBe(radios[0]);
  });
});
