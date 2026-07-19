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

export { default as ConceptSection } from "./ConceptSection";
export {
  default as MathDerivationStepper,
  type DerivationStep,
} from "./MathDerivationStepper";
export { default as PortfolioMatrixVisual } from "./PortfolioMatrixVisual";
export { Matrix2x2 } from "./PortfolioMatrixVisual";
export { default as CalculationWorksheet } from "./CalculationWorksheet";
export type {
  WorksheetField,
  WorksheetGroup,
} from "./CalculationWorksheet";

export const PT_SOURCES: string[] = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Lectures 13–14: Risk Analytics and Portfolio Theory.",
  "FINRA investor education, portfolio diversification and risk.",
];
