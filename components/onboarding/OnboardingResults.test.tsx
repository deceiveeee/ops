import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingResults from "./OnboardingResults";
import type { OnboardingAnswers, SegmentOption } from "@/lib/onboarding/types";

const answers: OnboardingAnswers = {
  goal: "learn-to-analyze-companies",
  experience: "know-some-basic-terms",
  access: "paper-or-simulation",
  outcome: "evaluate-company-attractiveness",
  confidence: "somewhat-confident",
};
const segment: SegmentOption | null = "adult-learner";

describe("OnboardingResults", () => {
  it("renders Goal, Current experience, Recommended starting point, Suggested next step rows", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={segment}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "Work through equities and valuation, then try a company case.",
        }}
        primaryCourseHref="/courses/finance-foundations"
      />,
    );
    expect(screen.getByText("Goal")).toBeTruthy();
    expect(screen.getByText("Current experience")).toBeTruthy();
    expect(screen.getByText("Recommended starting point")).toBeTruthy();
    expect(screen.getByText("Suggested next step")).toBeTruthy();
  });

  it("renders the chosen option labels (not ids) for goal and experience", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={segment}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "...",
        }}
        primaryCourseHref="/courses/foo"
      />,
    );
    expect(screen.getByText("Learn to analyze companies")).toBeTruthy();
    expect(screen.getByText("I know some basic investing terms")).toBeTruthy();
  });

  it("renders the recommended course title (not slug)", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={null}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "...",
        }}
        primaryCourseHref="/courses/foo"
      />,
    );
    expect(screen.getByText("Finance Foundations")).toBeTruthy();
  });

  it("primary CTA points to primaryCourseHref and secondary link points to /courses", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={null}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "...",
        }}
        primaryCourseHref="/courses/foo"
      />,
    );
    const primary = screen.getByText("Begin course").closest("a");
    expect(primary?.getAttribute("href")).toBe("/courses/foo");
    const secondary = screen.getByText("Explore all courses").closest("a");
    expect(secondary?.getAttribute("href")).toBe("/courses");
  });
});
