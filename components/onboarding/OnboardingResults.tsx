"use client";

import Button from "@/components/ui/Button";
import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/questions";
import { courseTitle } from "@/lib/onboarding/course-meta";
import type {
  OnboardingAnswers,
  Recommendation,
  SegmentOption,
} from "@/lib/onboarding/types";

function labelFor(
  questionId: keyof OnboardingAnswers | "segment",
  value: string | undefined,
): string {
  if (!value) return "—";
  const q = ONBOARDING_QUESTIONS.find((x) => x.id === questionId);
  const opt = q?.options.find((o) => o.id === value);
  return opt?.label ?? value;
}

export default function OnboardingResults({
  answers,
  segment,
  recommendation,
  primaryCourseHref,
}: {
  answers: OnboardingAnswers;
  segment: SegmentOption | null;
  recommendation: Recommendation;
  primaryCourseHref: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <h1 className="font-display text-[32px] leading-[1.1] text-slate-50 md:text-[40px]">
        Your OPS starting point
      </h1>

      <div className="mt-8 space-y-6">
        <Row label="Goal" value={labelFor("goal", answers.goal)} />
        <Row
          label="Current experience"
          value={labelFor("experience", answers.experience)}
        />
        <Row
          label="Recommended starting point"
          value={courseTitle(recommendation.primaryCourseSlug)}
          accent
        />
        <Row
          label="Suggested next step"
          value={recommendation.nextStepCopy}
        />
      </div>

      <div className="mt-12 flex flex-col items-start gap-4">
        <Button href={primaryCourseHref} size="lg">
          Begin course
        </Button>
        <Button href="/courses" variant="outline" size="lg">
          Explore all courses
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[13px] tracking-[0.01em] text-slate-300">
        {label}
      </div>
      <div
        className={
          accent
            ? "mt-1 font-display text-[22px] leading-tight text-accent-cyan md:text-[26px]"
            : "mt-1 font-display text-[20px] leading-tight text-slate-100 md:text-[24px]"
        }
      >
        {value}
      </div>
    </div>
  );
}
