export type CourseMeta = {
  title: string;
  courseHref: string;
};

export const COURSE_META: Record<string, CourseMeta> = {
  "finance-foundations": {
    title: "Finance Foundations",
    courseHref: "/courses/finance-foundations",
  },
  "investment-foundations": {
    title: "Investment Foundations",
    courseHref: "/courses/investment-foundations",
  },
};

export function courseTitle(slug: string): string {
  return COURSE_META[slug]?.title ?? slug;
}

export function courseHref(slug: string): string {
  return COURSE_META[slug]?.courseHref ?? `/courses/${slug}`;
}
