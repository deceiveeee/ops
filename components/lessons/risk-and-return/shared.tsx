"use client";

export {
  Reveal,
  SectionHeading,
  Panel,
  Feedback,
  InteractiveFrame,
  TryItTag,
  ConceptTag,
  DefinitionCard,
} from "@/components/lessons/intro-course-overview/shared";

export { InlineMath, BlockMath } from "@/components/ui/Math";
export {
  default as FormulaExplainer,
  type FormulaVariable,
} from "@/components/lessons/fixed-income-securities/FormulaExplainer";

export { default as MasteryCheck } from "@/components/lessons/present-value-relations/MasteryCheck";
export type { MasteryQuestion } from "@/components/lessons/present-value-relations/MasteryCheck";
export { default as LessonSummary } from "@/components/lessons/present-value-relations/LessonSummary";

export const RR_SOURCES: string[] = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Lecture 12: Introduction to Risk and Return.",
  "FINRA investor education, investment risk and return.",
];
