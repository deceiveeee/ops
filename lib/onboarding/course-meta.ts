export type CourseMeta = {
  title: string;
  firstLessonHref: string;
};

export const COURSE_META: Record<string, CourseMeta> = {
  "finance-foundations": {
    title: "Finance Foundations",
    firstLessonHref: "/lessons/what-is-finance-value-time-risk",
  },
  "investment-foundations": {
    title: "Investment Foundations",
    firstLessonHref: "/lessons/if-1-1-how-an-investor-builds-a-philosophy",
  },
};

export function courseTitle(slug: string): string {
  return COURSE_META[slug]?.title ?? slug;
}

export function courseFirstLessonHref(slug: string): string {
  return COURSE_META[slug]?.firstLessonHref ?? "/courses";
}
