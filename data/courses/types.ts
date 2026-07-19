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
  | "integration";

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
