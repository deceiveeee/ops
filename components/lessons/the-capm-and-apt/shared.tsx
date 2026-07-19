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

export { default as ConceptSection } from "@/components/lessons/portfolio-theory/ConceptSection";
export {
  default as MathDerivationStepper,
  type DerivationStep,
} from "@/components/lessons/portfolio-theory/MathDerivationStepper";
export { default as CalculationWorksheet } from "@/components/lessons/portfolio-theory/CalculationWorksheet";
export type {
  WorksheetField,
  WorksheetGroup,
} from "@/components/lessons/portfolio-theory/CalculationWorksheet";

export const CAPM_SOURCES: string[] = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Lectures 15–17: The CAPM and APT.",
  "FINRA investor education, systematic risk, beta, and market portfolios.",
];
