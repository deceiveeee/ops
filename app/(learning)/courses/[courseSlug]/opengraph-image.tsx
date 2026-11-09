import { getCourse } from "@/data/courses";
import { OG_CONTENT_TYPE, OG_SIZE, textCard } from "@/lib/og/card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "An Investing Studio course, with its title and what it covers";

export default async function CourseImage({ params }: { params: { courseSlug: string } }) {
  const course = getCourse(params.courseSlug);
  if (!course) return textCard({ title: "Investing Studio", footer: "Interactive finance courses" });
  return textCard({
    eyebrow: "Course",
    title: course.title,
    description: course.subtitle,
    footer: `Interactive course · about ${course.estimatedHours} hours`,
  });
}
