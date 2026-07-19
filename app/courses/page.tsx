import Link from "next/link";
import { courses } from "@/data/courses";
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

const roleBorder: Record<string, string> = {
  cyan: "border-accent-cyan/30",
  green: "border-accent-green/30",
  purple: "border-accent-purple/30",
  amber: "border-accent-amber/30",
  red: "border-accent-red/30",
};

export const metadata = { title: "Courses — Open Portfolio Studio" };

export default function CoursesPage() {
  const course = courses[0];

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionLabel index="MAP" eyebrow="Finance Foundations" />
        <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
          Twelve modules. One investigation path.
        </h1>
        <p className="mt-5 max-w-xl text-balance text-slate-300">
          {course.description} Each module is broken into focused sublessons. Lessons are placeholder
          shells for now; full content and interactives arrive in a separate pass.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {course.modules.map((m) => {
            const tone = roleTone[m.role] ?? "cyan";
            return (
              <Link
                key={m.id}
                href={`/courses/${course.slug}#module-${m.order}`}
                className={`group relative overflow-hidden rounded-2xl border ${roleBorder[tone]} bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  <span>Module {String(m.order).padStart(2, "0")}</span>
                  <span className={roleText[tone]}>{m.role.replace(/-/g, " ")}</span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{m.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{m.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">{m.lessonSlugs.length} sublessons</span>
                  <span className={`text-sm ${roleText[tone]} transition-transform group-hover:translate-x-1`}>→</span>
                </div>
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/[0.03] blur-2xl transition-opacity group-hover:bg-white/[0.06]" />
              </Link>
            );
          })}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Next</div>
            <div className="mt-1 text-lg text-slate-200">Skip the tour — start in the studio.</div>
          </div>
          <Button href="/studio" size="md">
            Enter the studio
          </Button>
        </div>
      </div>
    </div>
  );
}
