"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import OnboardingIntro from "./OnboardingIntro";
import OnboardingQuestion from "./OnboardingQuestion";
import OnboardingResults from "./OnboardingResults";
import ProgressScanLine from "./ProgressScanLine";
import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/questions";
import { useOnboarding } from "@/lib/onboarding/store";
import { courseFirstLessonHref } from "@/lib/onboarding/course-meta";
import type { OnboardingAnswers, QuestionId, SegmentOption } from "@/lib/onboarding/types";

type Phase = "intro" | QuestionId | "results";

const CORE_QUESTION_IDS: (keyof OnboardingAnswers)[] = [
  "goal",
  "experience",
  "access",
  "outcome",
  "confidence",
];
const ALL_PHASES: Phase[] = [
  "intro",
  ...ONBOARDING_QUESTIONS.map((q) => q.id),
  "results",
];
const ADVANCE_BEAT_MS = 280;

function firstUnansweredPhase(answers: OnboardingAnswers): Phase {
  for (const id of CORE_QUESTION_IDS) {
    if (!answers[id]) return id;
  }
  return "segment";
}

function recommendedLessonHref(courseSlug: string): string {
  return courseFirstLessonHref(courseSlug);
}

export default function OnboardingFlow({ retake }: { retake: boolean }) {
  const reduce = useReducedMotion();
  const { ready, snapshot, isComplete, setAnswer, markComplete } = useOnboarding();

  const computeInitialPhase = (): Phase => {
    if (!ready) return "intro";
    if (retake) return "goal";
    if (isComplete) return "results";
    if (!snapshot) return "intro";
    return firstUnansweredPhase(snapshot.answers);
  };

  const [phase, setPhase] = useState<Phase>("intro");
  const [buffer, setBuffer] = useState<OnboardingAnswers>({});
  const [bufferedSegment, setBufferedSegment] = useState<SegmentOption | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPhase((prev) => (prev === "intro" ? computeInitialPhase() : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, retake, isComplete, snapshot]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const currentAnswers: OnboardingAnswers = retake
    ? buffer
    : (snapshot?.answers ?? {});

  function effectiveAnswer(qid: QuestionId): string | undefined {
    return currentAnswers[qid as keyof OnboardingAnswers];
  }

  function handleSelect(qid: QuestionId, value: string) {
    const nextPhaseIdx = ALL_PHASES.indexOf(qid) + 1;
    const nextPhase = ALL_PHASES[nextPhaseIdx];

    if (qid === "segment") {
      const segmentValue = value as SegmentOption;
      if (retake) {
        setBufferedSegment(segmentValue);
        advanceTimerRef.current = setTimeout(() => {
          markComplete({ answers: buffer, segment: segmentValue });
          setPhase("results");
        }, ADVANCE_BEAT_MS);
        return;
      }
      advanceTimerRef.current = setTimeout(() => {
        markComplete({
          answers: snapshot?.answers ?? {},
          segment: segmentValue,
        });
        setPhase("results");
      }, ADVANCE_BEAT_MS);
      return;
    }

    if (retake) {
      const newBuffer = { ...buffer, [qid]: value };
      setBuffer(newBuffer);
      advanceTimerRef.current = setTimeout(() => setPhase(nextPhase), ADVANCE_BEAT_MS);
      return;
    }

    setAnswer(qid, value);
    advanceTimerRef.current = setTimeout(() => setPhase(nextPhase), ADVANCE_BEAT_MS);
  }

  function handleSkipSegment() {
    advanceTimerRef.current = setTimeout(() => {
      const finalAnswers = retake ? buffer : (snapshot?.answers ?? {});
      const finalSegment = retake
        ? bufferedSegment
        : (snapshot?.segment ?? null);
      markComplete({ answers: finalAnswers, segment: finalSegment });
      setPhase("results");
    }, ADVANCE_BEAT_MS);
  }

  const filledCount = useMemo(
    () =>
      CORE_QUESTION_IDS.reduce(
        (n, id) => (currentAnswers[id] ? n + 1 : n),
        0,
      ),
    [currentAnswers],
  );

  const showScanLine = phase !== "intro" && phase !== "results";

  const recommendation = useMemo(() => {
    if (!snapshot?.recommended_course_slug || !snapshot.recommended_next_step) {
      return null;
    }
    return {
      primaryCourseSlug: snapshot.recommended_course_slug,
      nextStepCopy: snapshot.recommended_next_step,
    };
  }, [snapshot]);

  return (
    <div className="relative flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-ink-950 py-20">
      {showScanLine && <ProgressScanLine filled={filledCount} />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phase}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: reduce ? 0.15 : 0.22, ease: "easeOut" }}
          className="w-full"
        >
          {phase === "intro" && <OnboardingIntro onBegin={() => setPhase("goal")} />}

          {phase !== "intro" && phase !== "results" && (
            <OnboardingQuestion
              question={ONBOARDING_QUESTIONS.find((q) => q.id === phase)!}
              selectedValue={effectiveAnswer(phase)}
              onSelect={(value) => handleSelect(phase, value)}
              onSkip={handleSkipSegment}
            />
          )}

          {phase === "results" && recommendation && (
            <OnboardingResults
              answers={snapshot?.answers ?? {}}
              segment={snapshot?.segment ?? null}
              recommendation={recommendation}
              primaryLessonHref={recommendedLessonHref(recommendation.primaryCourseSlug)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
