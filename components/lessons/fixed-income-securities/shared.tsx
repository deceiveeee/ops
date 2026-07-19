"use client";

// Re-export the generic OPS primitives so FI lessons have a single import surface
// and stay visually consistent with Modules 1 and 2.
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

// Legacy formula primitives (kept for backward compat; prefer LaTeX components below)
export {
  FormulaCard,
  Var,
  Sub,
  Sup,
  Frac,
  Inline,
} from "@/components/lessons/present-value-relations/FormulaCard";

// Real LaTeX rendering (KaTeX) — preferred for all formulas
export { InlineMath, BlockMath } from "@/components/ui/Math";
export {
  default as FormulaExplainer,
  type FormulaVariable,
} from "./FormulaExplainer";

export { default as MasteryCheck } from "@/components/lessons/present-value-relations/MasteryCheck";
export type { MasteryQuestion } from "@/components/lessons/present-value-relations/MasteryCheck";
export { default as LessonSummary } from "@/components/lessons/present-value-relations/LessonSummary";

/** Source panel shown at the bottom of each FI lesson. */
export const FI_SOURCES: string[] = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Fixed-Income Securities slides/video.",
  "TreasuryDirect, Treasury marketable securities, pricing, and STRIPS explainers.",
  "FINRA investor education, bond yield and yield-to-maturity explanations.",
  "SIFMA fixed-income market statistics.",
  "U.S. Department of the Treasury, Daily Treasury Par Yield Curve Rates.",
];
