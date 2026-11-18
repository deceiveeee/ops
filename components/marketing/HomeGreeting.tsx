"use client";

import Link from "next/link";
import { useGreeting } from "@/lib/greeting";
import { nextStep, type CourseSlug, type LearningPath } from "@/lib/next-step";
import { useOnboarding } from "@/lib/onboarding/store";
import type { FirstSteps } from "@/lib/onboarding/types";
import { useProgressStore } from "@/lib/progress/store";
import styles from "./homepage.module.css";

/** What this browser knows about the visitor: the next lesson, the first step the guide chose, or nothing. */
function useVisitor(path: LearningPath, steps: FirstSteps) {
  const hello = useGreeting();
  const guide = useOnboarding();
  const progress = useProgressStore();
  const loaded = hello !== null && guide.ready && progress.ready;
  const preferred: CourseSlug | null =
    guide.firstStep === "finance-foundations" || guide.firstStep === "investment-foundations" ? guide.firstStep : null;
  const next = loaded ? nextStep(path, progress.isComplete, preferred) : null;
  const first = loaded && guide.firstStep ? steps[guide.firstStep] : null;
  return { hello, loaded, next, first };
}

/**
 * The homepage's greeting: the time of day from the visitor's own clock, and a
 * welcome back for someone who has been here before. Only a greeting; what to
 * do next is said under the buttons, by HomeNextLine.
 *
 * Everything it reads is in this browser. Until all of it has loaded the line
 * is laid out but invisible, holding its height, so the title does not move
 * when it appears and a returning learner never sees the newcomer's line first.
 */
export default function HomeGreeting({ path, steps }: { path: LearningPath; steps: FirstSteps }) {
  const { hello, loaded, next, first } = useVisitor(path, steps);
  const returning = Boolean(next || first);
  return (
    <p className={styles.greeting} style={loaded ? undefined : { visibility: "hidden" }} data-greeting={loaded ? "ready" : "loading"}>
      {hello ?? "Good morning"}{returning ? ", welcome back." : ", and welcome."}
    </p>
  );
}

/**
 * The line under the homepage's buttons: the lesson to pick up for a returning
 * learner, the first step the guide chose for someone who took it, and for
 * everyone else what "Find where to start" does.
 */
export function HomeNextLine({ path, steps }: { path: LearningPath; steps: FirstSteps }) {
  const { loaded, next, first } = useVisitor(path, steps);
  let line: React.ReactNode = "Two questions, then your first step. Free, and no account needed.";
  if (next) line = <>Next up: <Link href={next.href}>{next.title}</Link></>;
  else if (first) line = <>Your first step: <Link href={first.href}>{first.action}</Link></>;
  return (
    <p className={styles.note} data-next-line={loaded ? "ready" : "loading"}>
      {line}
    </p>
  );
}
