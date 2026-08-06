export type GoalOption =
  | "understand-how-investing-works"
  | "learn-to-analyze-companies"
  | "build-a-diversified-portfolio"
  | "make-better-investment-decisions"
  | "prepare-for-a-class-or-competition"
  | "explore-finance-as-a-career"
  | "still-figuring-that-out";

export type ExperienceOption =
  | "completely-new"
  | "know-some-basic-terms"
  | "follow-markets-no-investments"
  | "used-paper-trading"
  | "made-real-investments"
  | "analyze-independently";

export type AccessOption =
  | "no-account"
  | "paper-or-simulation"
  | "custodial-or-family"
  | "own-account"
  | "prefer-not-to-say";

export type OutcomeOption =
  | "explain-how-investments-work"
  | "evaluate-company-attractiveness"
  | "build-defend-portfolio"
  | "make-first-responsible-decision"
  | "improve-existing-decisions"
  | "use-financial-models";

export type ConfidenceOption =
  | "not-confident-yet"
  | "slightly-confident"
  | "somewhat-confident"
  | "confident"
  | "very-confident";

export type SegmentOption =
  | "middle-school"
  | "high-school"
  | "college-student"
  | "adult-learner"
  | "educator-or-parent"
  | "prefer-not-to-say";

export type OnboardingAnswers = {
  goal?: GoalOption;
  experience?: ExperienceOption;
  access?: AccessOption;
  outcome?: OutcomeOption;
  confidence?: ConfidenceOption;
};

export type QuestionId = keyof OnboardingAnswers | "segment";

export type QuestionOption = {
  id: string;
  label: string;
};

export type Question = {
  id: QuestionId;
  prompt: string;
  helper?: string;
  optional?: boolean;
  options: QuestionOption[];
};

export type OnboardingSnapshot = {
  answers: OnboardingAnswers;
  completed_at: string | null;
  updated_at: string;
  recommended_course_slug: string | null;
  recommended_next_step: string | null;
  confidence_tier: ConfidenceOption | null;
  segment: SegmentOption | null;
  prompt_dismissed: boolean;
};

export type Recommendation = {
  primaryCourseSlug: string;
  nextStepCopy: string;
};
