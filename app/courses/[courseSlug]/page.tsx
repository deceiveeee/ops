import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/data/courses";
import { getLessonsForModule } from "@/data/lessons";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

const roleTone: Record<string, "cyan" | "green" | "purple" | "amber" | "red"> = {
  foundation: "cyan",
  "security-pricing": "purple",
  derivatives: "amber",
  "risk-and-portfolio": "cyan",
  "asset-pricing": "green",
  "corporate-finance": "amber",
  "market-efficiency": "red",
  integration: "cyan",
};

const roleText: Record<string, string> = {
  cyan: "text-accent-cyan",
  green: "text-accent-green",
  purple: "text-accent-purple",
  amber: "text-accent-amber",
  red: "text-accent-red",
};

export function generateStaticParams() {
  return courses.map((c) => ({ courseSlug: c.slug }));
}

export function generateMetadata({ params }: { params: { courseSlug: string } }) {
  const c = getCourse(params.courseSlug);
  return { title: c ? `${c.title} — Open Portfolio Studio` : "Course — Open Portfolio Studio" };
}

export default function CoursePage({ params }: { params: { courseSlug: string } }) {
  const course = getCourse(params.courseSlug);
  if (!course) notFound();
  const tone = roleTone[course.modules[0]?.role ?? "foundation"];

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Link href="/courses" className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-accent-cyan">
          ← All courses
        </Link>

        <SectionLabel index={`Course ${String(course.order).padStart(2, "0")}`} eyebrow={`${course.estimatedHours} hours · ${course.modules.length} modules`} tone={tone} className="mt-6" />
        <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
          {course.title}
        </h1>
        <p className="mt-5 max-w-xl text-balance text-slate-300">{course.subtitle}</p>
        <p className="mt-4 max-w-2xl text-sm text-slate-400">{course.description}</p>

        <div className="mt-14 space-y-10">
          {course.modules.map((m) => {
            const moduleLessons = getLessonsForModule(m.id);
            const mTone = roleTone[m.role] ?? "cyan";
            return (
              <section key={m.id} id={`module-${m.order}`} className="scroll-mt-24">
                <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  <span>
                    Module {String(m.order).padStart(2, "0")} · <span className={roleText[mTone]}>{m.role.replace(/-/g, " ")}</span>
                  </span>
                  <span>{m.lessonSlugs.length} sublessons</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">{m.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">{m.description}</p>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">Goal</span>{" "}
                  {m.learningGoal}
                </p>

                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                  {moduleLessons.map((l, i) => (
                    <Link
                      key={l.slug}
                      href={`/lessons/${l.slug}`}
                      className="group flex items-center justify-between gap-4 border-b border-white/5 bg-white/[0.02] px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs tabular-nums text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <div className="text-base font-medium text-slate-100">{l.title}</div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                            {l.type} · {l.estimatedMinutes} min · {l.status.replace(/-/g, " ")}
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm ${roleText[mTone]} transition-transform group-hover:translate-x-1`}>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button href="/studio" variant="outline" size="md">
            Enter the studio
          </Button>
          <Button href="/filings" variant="ghost" size="md">
            Open the filing reader
          </Button>
        </div>
      </div>
    </div>
  );
}
