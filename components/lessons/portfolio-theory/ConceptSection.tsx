"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "@/components/lessons/intro-course-overview/shared";

/**
 * Open lesson section: one heading, optional intro paragraph, then children
 * arranged with generous whitespace. No surrounding border by default —
 * keeps the page reading as a coherent chapter instead of a control panel.
 */
export default function ConceptSection({
  index,
  eyebrow,
  title,
  intro,
  introMaxWidth = "max-w-3xl",
  children,
  className,
  topMargin = "mt-16 sm:mt-24",
}: {
  index: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  introMaxWidth?: string;
  children: ReactNode;
  className?: string;
  topMargin?: string;
}) {
  return (
    <section className={cn(topMargin, className)}>
      <Reveal>
        <SectionHeading index={index} eyebrow={eyebrow} title={title} />
      </Reveal>
      {intro !== undefined && (
        <Reveal className="mt-6">
          <p
            className={cn(
              "ops-body text-[17px] leading-[1.7] text-slate-200 sm:text-[18px]",
              introMaxWidth,
            )}
          >
            {intro}
          </p>
        </Reveal>
      )}
      <div className="mt-9 space-y-8">{children}</div>
    </section>
  );
}
