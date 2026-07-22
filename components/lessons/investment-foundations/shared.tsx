"use client";

// Re-export the generic OPS primitives so Investment Foundations lessons
// have a single import surface and stay visually consistent with the
// rest of OPS (Finance Foundations).
export {
  Reveal,
  SectionHeading,
  Panel,
  Feedback,
  DefinitionCard,
  InteractiveFrame,
  TryItTag,
  ConceptTag,
  type ConceptKey,
} from "@/components/lessons/intro-course-overview/shared";
export { InlineMath, BlockMath } from "@/components/ui/Math";
export {
  default as MasteryCheck,
  type MasteryQuestion,
} from "@/components/lessons/present-value-relations/MasteryCheck";

export const IF_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture:
    "Module 1 · Lesson 1.1 — How an Investor Builds a Philosophy",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's framework for distinguishing investment philosophy from strategy, mapping the investment process, locating investment philosophies within that process, and matching philosophies to investor characteristics. Diagrams, examples, interactions, and wording on this page are original OPS implementations. No live market data.",
} as const;

export const IF_MODULE_LESSONS = [
  {
    slug: "if-1-1-how-an-investor-builds-a-philosophy",
    title: "How an Investor Builds a Philosophy",
    shortTitle: "How an Investor Builds a Philosophy",
    n: 1,
  },
] as const;

export const IF_LEARNING_OBJECTIVES = [
  "Distinguish an investment philosophy from a strategy and a trade.",
  "Explain why repeatedly chasing recent performance is not a coherent investment process.",
  "Trace an investment decision from the investor to asset allocation, security selection, execution, and performance evaluation.",
  "Identify where market timing, asset selection, information-based investing, and arbitrage operate.",
  "Explain why the same market belief may lead to different portfolios for different investors.",
  "Draft a provisional investment philosophy that the rest of the course will test.",
] as const;

/** Course-accent color used across IF components (amber = research lens). */
export const IF_ACCENT = "amber" as const;
