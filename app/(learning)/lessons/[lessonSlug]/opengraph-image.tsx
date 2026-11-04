import { findLesson } from "@/data/courses";
import { hasLessonComponent } from "@/lib/lessonSlugs";
import { OG_CONTENT_TYPE, OG_SIZE, textCard } from "@/lib/og/card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "An Investing Studio lesson, with its course, its title and the question it answers";

export default async function LessonImage({ params }: { params: { lessonSlug: string } }) {
  const found = findLesson(params.lessonSlug);
  if (!found) return textCard({ title: "Investing Studio", footer: "Interactive finance lessons" });
  const { course, module, lesson } = found;
  const unit = module.unitLabel ?? `Module ${String(module.order).padStart(2, "0")}`;
  return textCard({
    eyebrow: `${course.title} · ${unit}`,
    title: lesson.title,
    description: lesson.subtitle,
    footer: hasLessonComponent(lesson.slug)
      ? `Interactive lesson · about ${lesson.estimatedMinutes} minutes`
      : "Lesson in development",
  });
}
