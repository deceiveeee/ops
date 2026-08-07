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
  lecture: "Module 1 · Lesson 1.1 — Philosophy Before Strategy",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's distinction between investment philosophy and strategy, and his argument for beginning with a defensible view of how markets work. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

export const IF_MODULE_LESSONS = [
  {
    slug: "if-1-1-how-an-investor-builds-a-philosophy",
    title: "Philosophy Before Strategy",
    shortTitle: "Philosophy Before Strategy",
    n: 1,
  },
] as const;

export const IF_LEARNING_OBJECTIVES = [
  "Distinguish a market belief, an investment philosophy, a strategy, and an individual trade.",
  "Connect evidence to a market belief and then to a strategy that logically follows from it.",
  "Explain why recent performance alone is not a sound reason to adopt or abandon a strategy.",
  "Write one provisional market hypothesis that later lessons can test.",
] as const;

/** Course-accent color used across IF components (amber = research lens). */
export const IF_ACCENT = "amber" as const;
