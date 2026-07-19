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

export const EM_SOURCES: string[] = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Lecture 21: Efficient Markets — the concept that prices reflect available information and the implications for active investing.",
  "Andrew Lo's discussion of market efficiency, behavioral finance, and the adaptive markets hypothesis — markets as competitive ecosystems where obvious opportunities attract attention and disappear.",
  "The Challenger disaster (January 28, 1986) price-discovery case discussed in MIT 15.401 — decentralized information aggregation through trading in the stocks of shuttle contractors.",
];
