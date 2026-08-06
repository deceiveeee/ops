import type { Question, QuestionId } from "./types";

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: "goal",
    prompt: "What brought you to OPS?",
    helper: "Choose the outcome that matters most to you.",
    options: [
      { id: "understand-how-investing-works", label: "Understand how investing works" },
      { id: "learn-to-analyze-companies", label: "Learn to analyze companies" },
      { id: "build-a-diversified-portfolio", label: "Build a diversified portfolio" },
      { id: "make-better-investment-decisions", label: "Make better investment decisions" },
      { id: "prepare-for-a-class-or-competition", label: "Prepare for a class or competition" },
      { id: "explore-finance-as-a-career", label: "Explore finance as a career" },
      { id: "still-figuring-that-out", label: "I am still figuring that out" },
    ],
  },
  {
    id: "experience",
    prompt: "Where are you starting from?",
    options: [
      { id: "completely-new", label: "I am completely new to finance" },
      { id: "know-some-basic-terms", label: "I know some basic investing terms" },
      { id: "follow-markets-no-investments", label: "I follow markets but have not invested" },
      { id: "used-paper-trading", label: "I have used a paper-trading account" },
      { id: "made-real-investments", label: "I have made real investments" },
      { id: "analyze-independently", label: "I already analyze investments independently" },
    ],
  },
  {
    id: "access",
    prompt: "Which best describes your current investing access?",
    options: [
      { id: "no-account", label: "I do not currently have an investment account" },
      { id: "paper-or-simulation", label: "I use a paper-trading or simulation account" },
      { id: "custodial-or-family", label: "I have access to a custodial or family-managed account" },
      { id: "own-account", label: "I have my own investment account" },
      { id: "prefer-not-to-say", label: "Prefer not to say" },
    ],
  },
  {
    id: "outcome",
    prompt: "What would meaningful progress look like for you?",
    helper: "By the end of OPS, I would like to be able to...",
    options: [
      { id: "explain-how-investments-work", label: "Explain how major investments work" },
      { id: "evaluate-company-attractiveness", label: "Evaluate whether a company is attractive" },
      { id: "build-defend-portfolio", label: "Build and defend a diversified portfolio" },
      { id: "make-first-responsible-decision", label: "Make my first responsible investment decision" },
      { id: "improve-existing-decisions", label: "Improve decisions about investments I already own" },
      { id: "use-financial-models", label: "Use financial models and quantitative tools" },
    ],
  },
  {
    id: "confidence",
    prompt: "How confident do you currently feel making an investment decision?",
    helper:
      "Confidence does not affect your course placement. It helps OPS measure how your decision-making develops.",
    options: [
      { id: "not-confident-yet", label: "Not confident yet" },
      { id: "slightly-confident", label: "Slightly confident" },
      { id: "somewhat-confident", label: "Somewhat confident" },
      { id: "confident", label: "Confident" },
      { id: "very-confident", label: "Very confident" },
    ],
  },
  {
    id: "segment",
    prompt: "Which best describes you?",
    helper: "Optional. Helps us understand who we are reaching.",
    optional: true,
    options: [
      { id: "middle-school", label: "Middle school student" },
      { id: "high-school", label: "High school student" },
      { id: "college-student", label: "College student" },
      { id: "adult-learner", label: "Adult learner" },
      { id: "educator-or-parent", label: "Educator or parent" },
      { id: "prefer-not-to-say", label: "Prefer not to say" },
    ],
  },
];

export const QUESTION_IDS: QuestionId[] = ONBOARDING_QUESTIONS.map((q) => q.id);
