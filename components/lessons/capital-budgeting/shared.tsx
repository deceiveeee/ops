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
export { default as ExpandableQA } from "@/components/lessons/equities/ExpandableQA";

export { default as ConceptSection } from "@/components/lessons/portfolio-theory/ConceptSection";

export const CB_SOURCES: string[] = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Capital Budgeting lectures — required return, discount rate, and NPV.",
  "MIT 15.401, the Security Market Line and CAPM required return as the link between risk and the project discount rate.",
];
