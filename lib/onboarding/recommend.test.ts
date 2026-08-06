import { describe, it, expect } from "vitest";
import { recommendCourse } from "./recommend";
import type { OnboardingAnswers } from "./types";

const ans = (
  goal: OnboardingAnswers["goal"],
  experience: OnboardingAnswers["experience"],
): OnboardingAnswers => ({ goal, experience });

describe("recommendCourse", () => {
  describe("goal = understand-how-investing-works", () => {
    for (const exp of [
      "completely-new",
      "know-some-basic-terms",
      "follow-markets-no-investments",
      "used-paper-trading",
      "made-real-investments",
      "analyze-independently",
    ] as const) {
      it(`experience=${exp} -> Finance Foundations`, () => {
        const r = recommendCourse(ans("understand-how-investing-works", exp));
        expect(r.primaryCourseSlug).toBe("finance-foundations");
        expect(r.nextStepCopy).toContain("foundations");
      });
    }
  });

  describe("goal = learn-to-analyze-companies", () => {
    it("beginner -> Finance Foundations + equities intro copy", () => {
      const r = recommendCourse(ans("learn-to-analyze-companies", "completely-new"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("equities");
    });
    it("experienced -> Finance Foundations + valuation pathway copy", () => {
      const r = recommendCourse(ans("learn-to-analyze-companies", "analyze-independently"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("valuation pathway");
      expect(r.nextStepCopy).toContain("Investment Foundations");
    });
  });

  describe("goal = build-a-diversified-portfolio", () => {
    it("beginner -> Finance Foundations + risk-and-return copy", () => {
      const r = recommendCourse(ans("build-a-diversified-portfolio", "know-some-basic-terms"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("risk and return");
    });
    it("experienced -> Investment Foundations + revisit copy", () => {
      const r = recommendCourse(ans("build-a-diversified-portfolio", "used-paper-trading"));
      expect(r.primaryCourseSlug).toBe("investment-foundations");
      expect(r.nextStepCopy).toContain("Investment Foundations");
      expect(r.nextStepCopy).toContain("portfolio theory");
    });
  });

  describe("goal = make-better-investment-decisions", () => {
    for (const exp of ["completely-new", "analyze-independently"] as const) {
      it(`experience=${exp} -> Investment Foundations`, () => {
        const r = recommendCourse(ans("make-better-investment-decisions", exp));
        expect(r.primaryCourseSlug).toBe("investment-foundations");
        expect(r.nextStepCopy).toContain("Investment Foundations");
      });
    }
  });

  describe("goal = prepare-for-a-class-or-competition", () => {
    it("any experience -> Finance Foundations backbone", () => {
      const r = recommendCourse(ans("prepare-for-a-class-or-competition", "follow-markets-no-investments"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("backbone");
    });
  });

  describe("goal = explore-finance-as-a-career", () => {
    it("any experience -> Finance Foundations + Investment Foundations next", () => {
      const r = recommendCourse(ans("explore-finance-as-a-career", "made-real-investments"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("Investment Foundations");
    });
  });

  describe("goal = still-figuring-that-out", () => {
    it("any experience -> Finance Foundations + foundations pathway", () => {
      const r = recommendCourse(ans("still-figuring-that-out", "completely-new"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("foundations pathway");
    });
  });

  describe("missing inputs", () => {
    it("returns Finance Foundations default when goal is undefined", () => {
      const r = recommendCourse({ experience: "completely-new" });
      expect(r.primaryCourseSlug).toBe("finance-foundations");
    });
    it("returns Finance Foundations default when experience is undefined", () => {
      const r = recommendCourse({ goal: "learn-to-analyze-companies" });
      expect(r.primaryCourseSlug).toBe("finance-foundations");
    });
    it("returns Finance Foundations default when both undefined", () => {
      const r = recommendCourse({});
      expect(r.primaryCourseSlug).toBe("finance-foundations");
    });
  });
});
