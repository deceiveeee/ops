"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GUIDE_QUESTIONS } from "@/lib/onboarding/questions";
import { useOnboarding } from "@/lib/onboarding/store";
import type { FirstSteps, GuideGoal, GuideStart, QuestionId } from "@/lib/onboarding/types";
import styles from "./start-guide.module.css";

const STEPS = 3;

/**
 * The start guide: what brought you here, where you are starting from, then
 * your first step and how the site's parts fit together.
 *
 * Each answer explains the part of the site it belongs to as soon as it is
 * picked, so the questions double as a tour. Answers are saved as they are
 * picked, in this browser only, and the homepage greeting reads the result.
 */
export default function StartGuide({ steps, retake }: { steps: FirstSteps; retake: boolean }) {
  const guide = useOnboarding();
  const [index, setIndex] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // Open where the visitor left off, once their saved answers have been read.
  useEffect(() => {
    if (!guide.ready || index !== null) return;
    const answers = guide.snapshot?.answers ?? {};
    if (retake) setIndex(0);
    else if (guide.isComplete) setIndex(2);
    else if (answers.goal && !answers.start) setIndex(1);
    else setIndex(0);
  }, [guide.ready, guide.isComplete, guide.snapshot, retake, index]);

  // Move focus to the new question after Next or Back, not on first load.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [index]);

  const go = (next: number) => {
    moved.current = true;
    setMissing(false);
    setIndex(next);
  };

  if (index === null) return <div className={styles.page} aria-busy="true" />;

  if (index === 2) {
    const id = guide.firstStep ?? "finance-foundations";
    const first = steps[id];
    return (
      <div className={styles.page}>
        <div className={styles.sheet}>
          <p className={styles.count}>Find where to start · Step 3 of {STEPS}</p>
          <h1 ref={heading} tabIndex={-1} className={styles.title}>Your first step</h1>
          <div className={styles.first}>
            <p className={styles.firstTitle}>{first.title}</p>
            <Link href={first.href} className={styles.pill}>{first.action} <span aria-hidden="true">→</span></Link>
          </div>
          <h2 className={styles.subTitle}>How the site fits together</h2>
          <ol className={styles.path}>
            <li><Link href="/courses/finance-foundations">Finance Foundations</Link><span>How value, risk, markets and portfolios connect. Start here if finance is new to you.</span></li>
            <li><Link href="/courses/investment-foundations">Investment Foundations</Link><span>Then develop an investment approach you can explain, one decision at a time.</span></li>
          </ol>
          <p className={styles.small}>
            <Link href="/studio">Studio</Link> and the <Link href="/daily">daily puzzle</Link> are open at any time, with no course needed.
            Your answers and progress are saved in this browser. An account is optional; it carries your finished lessons to another device.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.textButton} onClick={() => { guide.reopen(); go(0); }}>Change my answers</button>
            <Link href="/courses" className={styles.textLink}>See both courses</Link>
          </div>
        </div>
      </div>
    );
  }

  const question = GUIDE_QUESTIONS[index];
  const chosen = guide.snapshot?.answers[question.id as QuestionId];
  const explains = question.options.find((option) => option.id === chosen)?.explains;
  const next = () => {
    if (!chosen) { setMissing(true); return; }
    if (index === 1) { guide.complete(); go(2); return; }
    go(index + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <p className={styles.count}>Find where to start · Step {index + 1} of {STEPS}</p>
        <h1 ref={heading} tabIndex={-1} id={`guide-${question.id}`} className={styles.title}>{question.prompt}</h1>
        <div role="radiogroup" aria-labelledby={`guide-${question.id}`} className={styles.options}>
          {question.options.map((option) => (
            <label key={option.id} className={styles.option}>
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={chosen === option.id}
                onChange={() => { setMissing(false); guide.setAnswer(question.id, option.id as GuideGoal | GuideStart); }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <p className={styles.explains} aria-live="polite">{explains ?? ""}</p>
        {missing ? <p className={styles.error} role="alert">Pick one to continue.</p> : null}
        <div className={styles.actions}>
          <button type="button" className={styles.pill} onClick={next}>Next <span aria-hidden="true">→</span></button>
          {index > 0 ? <button type="button" className={styles.textButton} onClick={() => go(index - 1)}>Back</button> : null}
        </div>
      </div>
    </div>
  );
}
