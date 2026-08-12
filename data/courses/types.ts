export type LessonType =
  | "reading"
  | "interactive"
  | "filing-reader"
  | "simulation"
  | "case-study"
  | "quiz";

export type LessonStatus = "available" | "coming-soon";

export type ModuleRole =
  | "foundation"
  | "security-pricing"
  | "derivatives"
  | "risk-and-portfolio"
  | "asset-pricing"
  | "corporate-finance"
  | "market-efficiency"
  | "filing-analysis"
  | "integration"
  | "investment-philosophy";

export type SourceType =
  | "course-note"
  | "textbook"
  | "filing"
  | "annual-report"
  | "academic-paper"
  | "market-data"
  | "external-link";

export type SourceSlot = {
  id: string;
  title: string;
  type: SourceType;
  required: boolean;
  citation?: string;
  url?: string;
  note?: string;
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  estimatedHours: number;
  order: number;
  modules: CourseModule[];
};

export type CourseModule = {
  id: string;
  order: number;
  title: string;
  description: string;
  learningGoal: string;
  role: ModuleRole;
  sourceSlots: SourceSlot[];
  lessonSlugs: string[];
  /**
   * Learner-facing name for this unit, shown instead of "Module NN".
   * Investment Foundations is organised as portfolio missions rather than
   * modules, and the mapping is not one-to-one — its first unit covers two
   * missions and mission 5 is not built yet — so the label is stated explicitly
   * rather than derived from `order`. Finance Foundations omits it and keeps
   * "Module NN", which is correct for its MIT 15.401 backbone.
   */
  unitLabel?: string;
};

export type Lesson = {
  slug: string;
  courseSlug: string;
  moduleId: string;
  order?: number;
  shortTitle?: string;
  title: string;
  subtitle: string;
  description?: string;
  type: LessonType;
  lessonType?: string;
  estimatedMinutes: number;
  status: LessonStatus;
  sourceRequired?: boolean;
  conceptRole?: string;
  skills?: string[];
  learningObjectives: string[];
  sourceSlots: SourceSlot[];
  blocks: LessonBlock[];
};

export type LessonBlock = {
  id: string;
  type:
    | "hook"
    | "concept"
    | "visual"
    | "interactive"
    | "source"
    | "example"
    | "reflection"
    | "quiz"
    | "summary";
  eyebrow?: string;
  title?: string;
  body?: string;
  items?: string[];
  visualType?: string;
  interactionType?: string;
};
