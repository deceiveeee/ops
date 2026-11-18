/**
 * The start guide at /start: two questions, then the learner's first step.
 *
 * It replaced a six-question placement quiz on 2026-11-13. Four of those six
 * questions changed nothing, the answer named a course rather than a lesson,
 * and nothing else on the site read it.
 */

/** What brought the visitor here. Each answer names the part of the site it belongs to. */
export type GuideGoal = "learn" | "company" | "build" | "unsure";

/** Where they are starting from. */
export type GuideStart = "new" | "some";

export type GuideAnswers = {
  goal?: GuideGoal;
  start?: GuideStart;
};

export type QuestionId = keyof GuideAnswers;

export type GuideOption<T extends string = string> = {
  id: T;
  label: string;
  /** One sentence shown once the option is picked: what this answer means on this site. */
  explains: string;
};

export type GuideQuestion = {
  id: QuestionId;
  prompt: string;
  options: GuideOption[];
};

/**
 * Where the guide sends someone first. A course id means that course's first
 * lesson or mission; "daily" means today's company puzzle.
 */
export type FirstStepId = "finance-foundations" | "investment-foundations" | "daily";

/** The step as the page shows it. Built on the server from the course data. */
export type FirstStep = {
  /** "Lesson 1: What Is Finance? Value, Time, and Risk · 25 min". */
  title: string;
  href: string;
  /** The button: "Start lesson 1". */
  action: string;
};

export type FirstSteps = Record<FirstStepId, FirstStep>;

/**
 * What is kept, in this browser only. Nothing here is sent anywhere: the
 * privacy page promises that signing in syncs which lessons are finished and
 * nothing else.
 */
export type GuideSnapshot = {
  answers: GuideAnswers;
  completedAt: string | null;
  updatedAt: string;
};
