import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/data/courses";
import ModuleSection from "@/components/courses/ModuleSection";
import CourseRail from "@/components/courses/CourseRail";
import Button from "@/components/ui/Button";

export function generateStaticParams() {
  return courses.map((c) => ({ courseSlug: c.slug }));
}

export function generateMetadata({ params }: { params: { courseSlug: string } }) {
  const c = getCourse(params.courseSlug);
  return { title: c ? `${c.title} — Open Portfolio Studio` : "Course — Open Portfolio Studio" };
}

/** Course-specific accent color. */
const courseAccent: Record<string, string> = {
  "finance-foundations": "#22d3ee",
  "investment-foundations": "#fbbf24",
};

const courseOutcomes: Record<string, { title: string; points: string[] }[]> = {
  "finance-foundations": [
    {
      title: "What you will learn",
      points: [
        "Read financial statements and 10-K filings",
        "Value cash flows, bonds, and equities",
        "Measure risk and construct portfolios",
      ],
    },
    {
      title: "How the course works",
      points: [
        "Interactive lessons with worked examples",
        "Scroll-driven visualizations and case studies",
        "Foundational sequence adapted from MIT 15.401",
      ],
    },
    {
      title: "What you will build",
      points: [
        "A working financial vocabulary",
        "The ability to read a chart as a story",
        "A portfolio-construction toolkit",
      ],
    },
  ],
  "investment-foundations": [
    {
      title: "What you will learn",
      points: [
        "Distinguish investment philosophy from strategy",
        "Evaluate market beliefs and evidence",
        "Match a philosophy to an investor profile",
      ],
    },
    {
      title: "How the course works",
      points: [
        "Case-based lessons with investor-decision framing",
        "Editable investment philosophy draft",
        "Progressive curriculum that builds module by module",
      ],
    },
    {
      title: "What you will build",
      points: [
        "A defensible investment philosophy",
        "A repeatable decision framework",
        "A portfolio you can explain",
      ],
    },
  ],
};

export default function CoursePage({ params }: { params: { courseSlug: string } }) {
  const course = getCourse(params.courseSlug);
  if (!course) notFound();

  const accent = courseAccent[course.slug] ?? "#22d3ee";
  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessonSlugs.length,
    0,
  );
  const outcomes = courseOutcomes[course.slug] ?? courseOutcomes["finance-foundations"];

  return (
    <div className="w-full">
      {/* ─── Course hero — light, course-colored tint ─── */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          paddingTop: "clamp(40px, 6vh, 80px)",
          paddingBottom: "clamp(60px, 10vh, 120px)",
          background:
            course.slug === "finance-foundations"
              ? "radial-gradient(ellipse at 70% 30%, rgba(34,211,238,0.10), transparent 55%), linear-gradient(180deg, #FAFBFC 0%, #F2F2F4 100%)"
              : "radial-gradient(ellipse at 70% 30%, rgba(251,191,36,0.12), transparent 55%), linear-gradient(180deg, #FBF9F4 0%, #F2F2F4 100%)",
        }}
      >
        <div className="hp-canvas">
          {/* Breadcrumb */}
          <Link
            href="/courses"
            className="text-[15px] font-medium text-slate-400 transition-colors hover:text-white"
          >
            ← All courses
          </Link>

          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            {/* Left — title + lead + CTA */}
            <div>
              <div
                className="text-[15px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: accent }}
              >
                Course {String(course.order).padStart(2, "0")}
              </div>
              <h1 className="course-hero-title mt-4">{course.title}</h1>
              <p className="course-lead mt-8 max-w-[560px]">{course.subtitle}</p>
              <p className="hp-body mt-5 max-w-[560px]">{course.description}</p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href={`/lessons/${course.modules[0]?.lessonSlugs[0]}`} size="lg">
                  Start course
                </Button>
                <Link
                  href="#curriculum"
                  className="text-[17px] font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Browse curriculum →
                </Link>
              </div>
            </div>

            {/* Right — statistics + course flow visual */}
            <div className="lg:border-l lg:border-white/10 lg:pl-16">
              {/* Stats — large readable numbers */}
              <div className="grid grid-cols-3 gap-6">
                <HeroStat label="Hours" value={String(course.estimatedHours)} accent={accent} />
                <HeroStat label="Modules" value={String(course.modules.length)} accent={accent} />
                <HeroStat label="Lessons" value={String(totalLessons)} accent={accent} />
              </div>

              {/* Course flow — bespoke SVG, NOT a tiny technical diagram */}
              <div className="mt-12">
                <div className="text-[14px] font-medium uppercase tracking-[0.06em] text-slate-500">
                  {course.slug === "finance-foundations"
                    ? "Price → Business → Cash flow → Value → Portfolio"
                    : "Research → Thesis → Valuation → Selection → Portfolio"}
                </div>
                <CourseFlowVisual slug={course.slug} accent={accent} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Course overview — three columns ─── */}
      <section
        className="curric-section-paper"
        style={{ paddingTop: "clamp(60px, 10vh, 100px)", paddingBottom: "clamp(60px, 10vh, 100px)" }}
      >
        <div className="hp-canvas">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            {outcomes.map((col) => (
              <div key={col.title}>
                <h2 className="text-[clamp(22px,1.8vw,28px)] font-semibold leading-tight tracking-[-0.015em] text-[#111214]">
                  {col.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {col.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-3 text-[17px] leading-relaxed text-[#2E3137]"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: accent }}
                        aria-hidden
                      />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Curriculum — sticky rail + modules ─── */}
      <section
        id="curriculum"
        className="curric-section scroll-mt-20"
        style={{ paddingTop: "clamp(60px, 10vh, 100px)", paddingBottom: "clamp(80px, 12vh, 140px)" }}
      >
        <div className="hp-canvas">
          {/* Section heading */}
          <div className="mb-16 max-w-[900px]">
            <div
              className="text-[15px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: accent }}
            >
              Curriculum
            </div>
            <h2 className="mt-4 text-[clamp(40px,4.5vw,64px)] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
              {course.modules.length} {course.modules.length === 1 ? "module" : "modules"}.
              <br />
              {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}.
            </h2>
          </div>

          {/* Mobile module selector — compact dropdown-like horizontal scroll */}
          <nav
            aria-label={`${course.title} modules`}
            className="mb-10 lg:hidden"
          >
            <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2">
              {course.modules.map((m) => (
                <a
                  key={m.id}
                  href={`#module-${m.order}`}
                  className="flex-shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-[#111214]"
                >
                  <span className="tabular-nums text-[#555A61]">
                    {String(m.order).padStart(2, "0")}
                  </span>
                  <span className="ml-2">{m.title}</span>
                </a>
              ))}
            </div>
          </nav>

          {/* Two-column curriculum: sticky rail + content */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <CourseRail course={course} modules={course.modules} accentColor={accent} />

            <div className="space-y-20">
              {course.modules.map((m, i) => (
                <ModuleSection
                  key={m.id}
                  module={m}
                  index={i}
                  accentColor={accent}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Closing CTA — dark ─── */}
      <section
        className="hp-atmosphere-deep"
        style={{ paddingTop: "clamp(80px, 12vh, 140px)", paddingBottom: "clamp(80px, 12vh, 140px)" }}
      >
        <div className="hp-canvas-narrow text-center">
          <h2 className="hp-section mx-auto text-balance">
            Ready to begin?
          </h2>
          <p className="course-lead mx-auto mt-8 text-balance">
            Start with the first lesson, or jump straight into the studio.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button href={`/lessons/${course.modules[0]?.lessonSlugs[0]}`} size="lg">
              Start course
            </Button>
            <Button href="/studio" variant="outline" size="lg">
              Enter the studio
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div>
      <div
        className="stat-numeric"
        style={{ fontSize: "clamp(40px, 5vw, 64px)", color: accent }}
      >
        {value}
      </div>
      <div className="mt-2 text-[14px] font-medium uppercase tracking-[0.06em] text-slate-500">
        {label}
      </div>
    </div>
  );
}

/** Bespoke SVG — represents the course's conceptual flow as a clean horizontal line. */
function CourseFlowVisual({ slug, accent }: { slug: string; accent: string }) {
  const steps =
    slug === "finance-foundations"
      ? ["Price", "Business", "Cash flow", "Value", "Portfolio"]
      : ["Research", "Thesis", "Valuation", "Selection", "Portfolio"];

  return (
    <svg
      viewBox="0 0 600 100"
      className="mt-5 w-full"
      role="img"
      aria-label={`${slug} conceptual flow: ${steps.join(", ")}`}
    >
      {/* Horizontal connector */}
      <line
        x1="20"
        x2="580"
        y1="50"
        y2="50"
        stroke={accent}
        strokeOpacity="0.25"
        strokeWidth="1.5"
        strokeDasharray="2 6"
      />
      {steps.map((s, i) => {
        const x = 20 + (i / (steps.length - 1)) * 560;
        const isLast = i === steps.length - 1;
        return (
          <g key={s}>
            <circle
              cx={x}
              cy="50"
              r={isLast ? 6 : 4}
              fill={accent}
              fillOpacity={isLast ? 1 : 0.6}
            />
            <text
              x={x}
              y="80"
              textAnchor="middle"
              fill="#2E3137"
              fontSize="13"
              fontFamily="var(--font-sans), system-ui, sans-serif"
            >
              {s}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
