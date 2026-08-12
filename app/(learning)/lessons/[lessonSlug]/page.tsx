import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, findLesson, getAllLessons } from "@/data/courses";
import { getLessonComponent } from "@/lib/lessonRegistry";
import SectionLabel from "@/components/ui/SectionLabel";

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ lessonSlug: l.lesson.slug }));
}

export function generateMetadata({ params }: { params: { lessonSlug: string } }) {
  const l = findLesson(params.lessonSlug);
  return { title: l ? `${l.lesson.title} — Open Portfolio Studio` : "Lesson — Open Portfolio Studio" };
}

export default function LessonPage({ params }: { params: { lessonSlug: string } }) {
  const found = findLesson(params.lessonSlug);
  if (!found) notFound();
  const { course, module, lesson } = found;

  const Custom = getLessonComponent(lesson.slug);
  if (Custom) {
    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 pt-6 sm:px-8">
          <Link
            href={`/courses/${course.slug}#module-${module.order}`}
            className="font-sans text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-accent-cyan"
          >
            ← {course.title} · {module.unitLabel ?? `Module ${String(module.order).padStart(2, "0")}`}
          </Link>
        </div>
        <Custom />
      </div>
    );
  }

  const all = getAllLessons();
  const idx = all.findIndex((l) => l.lesson.slug === lesson.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const isComingSoon = lesson.status === "coming-soon";
  const statusLabel = isComingSoon ? "Coming soon" : "In development";
  const statusNote = isComingSoon
    ? "This lesson is on the roadmap. The objectives below preview what it will cover."
    : "The interactive version of this lesson is still being built. The objectives below describe what it will teach.";

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <Link href={`/courses/${course.slug}#module-${module.order}`} className="font-sans text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-accent-cyan">
          ← {course.title} · {module.unitLabel ?? `Module ${String(module.order).padStart(2, "0")}`}
        </Link>

        <SectionLabel index={`Lesson · ${lesson.type}`} eyebrow={module.title} className="mt-6" tone="cyan" />
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-4 text-balance text-slate-300">{lesson.subtitle}</p>

        <div className="mt-6 flex flex-wrap gap-2 font-sans text-[12px] uppercase tracking-[0.18em] text-slate-500">
          <span className="rounded-full border border-white/10 px-2.5 py-0.5">{lesson.type}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5">{lesson.estimatedMinutes} min</span>
          <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-0.5 text-accent-cyan">{statusLabel}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5">{module.role.replace(/-/g, " ")}</span>
        </div>

        <div className="mt-8 glass-panel p-6">
          <p className="text-balance text-slate-300">
            {statusNote}
          </p>

          <div className="mt-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-slate-500">Learning objectives</div>
            <ul className="mt-3 space-y-2">
              {lesson.learningObjectives.map((o) => (
                <li key={o} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-accent-cyan">·</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
          {prev ? (
            <Link href={`/lessons/${prev.lesson.slug}`} className="group">
              <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-slate-500">Previous</div>
              <div className="text-sm text-slate-200 group-hover:text-accent-cyan">{prev.lesson.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/lessons/${next.lesson.slug}`} className="group text-right">
              <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-slate-500">Next</div>
              <div className="text-sm text-slate-200 group-hover:text-accent-cyan">{next.lesson.title}</div>
            </Link>
          ) : (
            <span />
          )}
        </div>

        <div className="mt-10">
          <Link
            href={`/courses/${course.slug}#module-${module.order}`}
            className="font-sans text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-accent-cyan"
          >
            ← Back to {course.title}
          </Link>
        </div>
      </div>
    </div>
  );
}
