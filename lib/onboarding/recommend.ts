import type {
  ExperienceOption,
  OnboardingAnswers,
  Recommendation,
} from "./types";

const BEGINNER: ReadonlySet<ExperienceOption> = new Set([
  "completely-new",
  "know-some-basic-terms",
]);

const FF = "finance-foundations";
const IF = "investment-foundations";

export function recommendCourse(answers: OnboardingAnswers): Recommendation {
  const goal = answers.goal;
  const exp = answers.experience;
  const beginner = exp ? BEGINNER.has(exp) : true;

  switch (goal) {
    case "understand-how-investing-works":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Begin with the foundations pathway, then move into securities.",
      };
    case "learn-to-analyze-companies":
      return beginner
        ? {
            primaryCourseSlug: FF,
            nextStepCopy: "Work through equities and valuation, then try a company case.",
          }
        : {
            primaryCourseSlug: FF,
            nextStepCopy: "Complete the valuation pathway, then begin Investment Foundations.",
          };
    case "build-a-diversified-portfolio":
      return beginner
        ? {
            primaryCourseSlug: FF,
            nextStepCopy: "Start with risk and return, then build up to portfolio theory.",
          }
        : {
            primaryCourseSlug: IF,
            nextStepCopy:
              "Begin Investment Foundations, then revisit portfolio theory in Finance Foundations.",
          };
    case "make-better-investment-decisions":
      return {
        primaryCourseSlug: IF,
        nextStepCopy:
          "Start with Investment Foundations, then ground yourself in Finance Foundations.",
      };
    case "prepare-for-a-class-or-competition":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Take the full Finance Foundations sequence as your backbone.",
      };
    case "explore-finance-as-a-career":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Take the full Finance Foundations sequence, then Investment Foundations.",
      };
    case "still-figuring-that-out":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Start at the beginning. The foundations pathway will help you decide.",
      };
    default:
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Start at the beginning. The foundations pathway will help you decide.",
      };
  }
}

export function isBeginnerExperience(exp: ExperienceOption | undefined): boolean {
  return exp ? BEGINNER.has(exp) : true;
}
