/**
 * "Next up" for a returning learner: the lesson or mission after the last one
 * they finished. Pure, so it can be tested without a browser; the steps come
 * from lib/learning-path.ts (server) and the completion check from the
 * progress store (browser).
 */

export type CourseSlug = "finance-foundations" | "investment-foundations";

export type PathStep = {
  /** "Gordon Growth Model" or "Set your goal and your limits". */
  title: string;
  href: string;
  /** The progress store key that records it, such as "ops-m4-completion-v1". */
  key: string;
  /** Lesson slugs that must all be finished for the step to count as done. */
  requires: string[];
};

export type LearningPath = Record<CourseSlug, PathStep[]>;

export type NextStep = { course: CourseSlug; title: string; href: string };

type IsDone = (key: string, slug: string) => boolean;

type State = "none" | "partial" | "done";

function stateOf(step: PathStep, isDone: IsDone): State {
  const done = step.requires.filter((slug) => isDone(step.key, slug)).length;
  if (done === 0) return "none";
  return done === step.requires.length ? "done" : "partial";
}

/**
 * The next step in one course, or null if the learner has not started it or
 * has finished all of it.
 *
 * Started means at least one step is done or part done. The next step is the
 * part-done one if the latest started step is part done; otherwise the first
 * step after it that is not done; and if everything after it is done, the
 * first gap earlier in the course.
 */
export function nextInCourse(steps: PathStep[], isDone: IsDone): PathStep | null {
  const states = steps.map((step) => stateOf(step, isDone));
  const latest = states.reduce((found, state, index) => (state === "none" ? found : index), -1);
  if (latest === -1) return null;
  if (states[latest] === "partial") return steps[latest];
  const after = states.findIndex((state, index) => index > latest && state !== "done");
  if (after !== -1) return steps[after];
  const gap = states.findIndex((state) => state !== "done");
  return gap === -1 ? null : steps[gap];
}

/**
 * The one step to suggest across both courses. The course the start guide
 * pointed to wins when the learner has started it; otherwise Finance
 * Foundations, then Investment Foundations.
 */
export function nextStep(path: LearningPath, isDone: IsDone, preferred: CourseSlug | null = null): NextStep | null {
  const order: CourseSlug[] = preferred === "investment-foundations"
    ? ["investment-foundations", "finance-foundations"]
    : ["finance-foundations", "investment-foundations"];
  for (const course of order) {
    const step = nextInCourse(path[course] ?? [], isDone);
    if (step) return { course, title: step.title, href: step.href };
  }
  return null;
}
