import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, findLesson, getAllLessons } from "@/data/courses";
import { getLessonComponent } from "@/lib/lessonRegistry";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

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
            className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-accent-cyan"
          >
            ← {course.title} · Module {String(module.order).padStart(2, "0")}
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

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <Link href={`/courses/${course.slug}#module-${module.order}`} className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-accent-cyan">
          ← {course.title} · Module {String(module.order).padStart(2, "0")}
        </Link>

        <SectionLabel index={`Lesson · ${lesson.type}`} eyebrow={module.title} className="mt-6" tone="cyan" />
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-4 text-balance text-slate-300">{lesson.subtitle}</p>

        <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          <span className="rounded-full border border-white/10 px-2.5 py-0.5">{lesson.type}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5">{lesson.estimatedMinutes} min</span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5">{lesson.status.replace(/-/g, " ")}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-0.5">{module.role.replace(/-/g, " ")}</span>
        </div>

        <div className="mt-8 glass-panel p-6">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Lesson shell · placeholder</span>
            <span className="text-accent-cyan">PENDING CONTENT</span>
          </div>
          <p className="mt-4 text-balance text-slate-300">
            This lesson is a structural shell. Its blocks, interactives, and source slots will be built in a
            separate pass using the patterns defined in AGENTS.md (scroll storytelling, animated diagrams,
            filing annotations, portfolio visuals, financial simulations, and visual metaphors).
          </p>

          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Learning objectives</div>
            <ul className="mt-3 space-y-2">
              {lesson.learningObjectives.map((o) => (
                <li key={o} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-accent-cyan">·</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Block structure</div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {lesson.blocks.map((b, i) => (
                <div key={b.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{String(i + 1).padStart(2, "0")}</div>
                  <div className="mt-1 text-sm text-slate-300">{b.type}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Source slots</div>
            <ul className="mt-3 space-y-2">
              {lesson.sourceSlots.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">{s.type}</span>
                  <span>{s.title}{s.required ? " · required" : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
          {prev ? (
            <Link href={`/lessons/${prev.lesson.slug}`} className="group">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Previous</div>
              <div className="text-sm text-slate-200 group-hover:text-accent-cyan">{prev.lesson.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/lessons/${next.lesson.slug}`} className="group text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Next</div>
              <div className="text-sm text-slate-200 group-hover:text-accent-cyan">{next.lesson.title}</div>
            </Link>
          ) : (
            <span />
          )}
        </div>

        <div className="mt-10">
          <Button href="/studio" variant="outline" size="md">
            Try it in the studio
          </Button>
        </div>
      </div>
    </div>
  );
}
