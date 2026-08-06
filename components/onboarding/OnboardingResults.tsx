"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/questions";
import { courses } from "@/data/courses";
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

function courseTitle(slug: string): string {
  return courses.find((c) => c.slug === slug)?.title ?? slug;
}

export default function OnboardingResults({
  answers,
  segment,
  recommendation,
  primaryLessonHref,
}: {
  answers: OnboardingAnswers;
  segment: SegmentOption | null;
  recommendation: Recommendation;
  primaryLessonHref: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <div className="text-[12px] uppercase tracking-[0.02em] text-slate-500">
        Your OPS starting point
      </div>

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
        <Button href={primaryLessonHref} size="lg">
          Begin my first lesson
        </Button>
        <Link
          href="/courses"
          className="text-[15px] text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
        >
          Explore all courses
        </Link>
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
      <div className="text-[12px] uppercase tracking-[0.02em] text-slate-500">
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
