import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/data/courses";
import { getLessonsForModule } from "@/data/lessons";
import { portfolioBuilderPath } from "@/data/courses/portfolioBuilder";
import ModuleSection from "@/components/courses/ModuleSection";
import CourseRail from "@/components/courses/CourseRail";
import PortfolioBuilderPath from "@/components/courses/PortfolioBuilderPath";
import Button from "@/components/ui/Button";

export function generateStaticParams() {
  return courses.map((c) => ({ courseSlug: c.slug }));
}

export function generateMetadata({ params }: { params: { courseSlug: string } }) {
  const c = getCourse(params.courseSlug);
  return { title: c ? `${c.title} — Open Portfolio Studio` : "Course — Open Portfolio Studio" };
}

/** Course-specific accent color. Decorative: fills, bars, SVG. */
const courseAccent: Record<string, string> = {
  "finance-foundations": "#22d3ee",
  "investment-foundations": "#fbbf24",
};

/**
 * Text-safe variants. This page is light, and the bright accents measured just
 * 1.53:1 against the hero's tinted background — below even the 3:1 large-text
 * floor — so the "Course 02" eyebrow and the 64px hero numerals were effectively
 * unreadable. Measured after the change: 4.61:1, which clears WCAG AA for the
 * 15px eyebrow and comfortably clears the large-text threshold for the numerals.
 * (Against pure white these compute to 5.02:1 and 5.36:1; the hero tint is why
 * the real figure is lower.) Use them wherever the accent colors text; keep
 * `courseAccent` for backgrounds, bars and SVG fills.
 */
const courseAccentInk: Record<string, string> = {
  "finance-foundations": "#0e7490",
  "investment-foundations": "#b45309",
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
        "Set a goal, an allocation, and a loss budget",
        "Evaluate business evidence and expected return",
        "Choose a passive core, or defend an active slice",
      ],
    },
    {
      title: "How the course works",
      points: [
        `${portfolioBuilderPath.missions.length} decisions build one portfolio plan`,
        "Existing guided journeys earn mission credit",
        "Damodaran depth remains available without blocking progress",
      ],
    },
    {
      title: "What you will build",
      points: [
        "A diversified holdings and weighting plan",
        "Written execution, rebalancing, and sell rules",
        "A portfolio you can explain and monitor",
      ],
    },
  ],
};

export default function CoursePage({ params }: { params: { courseSlug: string } }) {
  const course = getCourse(params.courseSlug);
  if (!course) notFound();

  const accent = courseAccent[course.slug] ?? "#22d3ee";
  const accentInk = courseAccentInk[course.slug] ?? "#0e7490";
  const publicModules = course.modules.filter(
    (module) => getLessonsForModule(module.id).length > 0,
  );
  const totalLessons = publicModules.reduce(
    (sum, module) => sum + getLessonsForModule(module.id).length,
    0,
  );
  const firstLessonSlug = getLessonsForModule(publicModules[0]?.id ?? "")[0]?.slug;
  const isPortfolioBuilder = course.slug === "investment-foundations";
  const outcomes = courseOutcomes[course.slug] ?? courseOutcomes["finance-foundations"];

  return (
    <div className="w-full overflow-x-hidden">
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
                style={{ color: accentInk }}
              >
                Course {String(course.order).padStart(2, "0")}
              </div>
              <h1 className="course-hero-title mt-4">{course.title}</h1>
              <p className="course-lead mt-8 max-w-[560px]">{course.subtitle}</p>
              <p className="hp-body mt-5 max-w-[560px]">{course.description}</p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href={`/lessons/${firstLessonSlug}`} size="lg">
                  {isPortfolioBuilder ? "Start building" : "Start course"}
                </Button>
                <Link
                  href={isPortfolioBuilder ? "#portfolio-path" : "#curriculum"}
                  className="text-[17px] font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {isPortfolioBuilder ? "See the mission path" : "Browse curriculum"} →
                </Link>
              </div>
            </div>

            {/* Right — statistics + course flow visual */}
            <div className="lg:border-l lg:border-white/10 lg:pl-16">
              {/* Stats — large readable numbers */}
              <div className="grid grid-cols-3 gap-6">
                {isPortfolioBuilder ? (
                  <>
                    <HeroStat
                      label="Core hours"
                      value={String(Math.round(portfolioBuilderPath.targetMinutes / 60))}
                      accent={accentInk}
                    />
                    <HeroStat
                      label="Missions"
                      value={String(portfolioBuilderPath.missions.length)}
                      accent={accentInk}
                    />
                    <HeroStat label="Source sessions" value="38" accent={accentInk} />
                  </>
                ) : (
                  <>
                    <HeroStat label="Hours" value={String(course.estimatedHours)} accent={accentInk} />
                    <HeroStat label="Modules" value={String(publicModules.length)} accent={accentInk} />
                    <HeroStat label="Lessons" value={String(totalLessons)} accent={accentInk} />
                  </>
                )}
              </div>

              {/* Course flow — bespoke SVG, NOT a tiny technical diagram */}
              <div className="mt-12">
                <div className="text-[14px] font-medium uppercase tracking-[0.06em] text-slate-500">
                  {course.slug === "finance-foundations"
                    ? "Price → Business → Cash flow → Value → Portfolio"
                    : "Goal → Allocation → Evidence → Value → Holdings → Rules"}
                </div>
                {/* Decorative SVG: keep the bright accent, it colors shapes not text. */}
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

      {isPortfolioBuilder && (
        <section
          id="portfolio-path"
          className="curric-section scroll-mt-20"
          style={{
            paddingTop: "clamp(64px, 10vh, 110px)",
            paddingBottom: "clamp(72px, 12vh, 140px)",
          }}
        >
          <div className="hp-canvas">
            <PortfolioBuilderPath path={portfolioBuilderPath} />
          </div>
        </section>
      )}

      {/* Portfolio Builder has one mission rail. Existing lesson routes remain linked from missions. */}
      {!isPortfolioBuilder && (
      <section
        id="curriculum"
        className={`${isPortfolioBuilder ? "curric-section-paper" : "curric-section"} scroll-mt-20`}
        style={{ paddingTop: "clamp(60px, 10vh, 100px)", paddingBottom: "clamp(80px, 12vh, 140px)" }}
      >
        <div className="hp-canvas">
          {/* Section heading */}
          <div className="mb-16 max-w-[900px]">
            <div
              className="text-[15px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: accentInk }}
            >
              {isPortfolioBuilder ? "Guided journeys" : "Curriculum"}
            </div>
            <h2 className="mt-4 text-[clamp(40px,4.5vw,64px)] font-semibold leading-[1.05] tracking-[-0.025em] text-[#1D1D1F]">
              {isPortfolioBuilder ? (
                <>
                  Required evidence.
                  <br />
                  Optional depth.
                </>
              ) : (
                <>
                  {publicModules.length} {publicModules.length === 1 ? "module" : "modules"}.
                  <br />
                  {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}.
                </>
              )}
            </h2>
            {isPortfolioBuilder && (
              <p className="mt-5 max-w-3xl text-[18px] leading-8 text-[#424245]">
                The routes already built remain available. Required journeys add to your plan; optional investigations preserve the source depth without extending core completion.
              </p>
            )}
          </div>

          {/* Mobile module selector — compact dropdown-like horizontal scroll */}
          <nav
            aria-label={`${course.title} modules`}
            className="mb-10 lg:hidden"
          >
            <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2">
              {publicModules.map((m) => (
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
            <CourseRail course={course} modules={publicModules} accentColor={accentInk} />

            <div className="space-y-20">
              {publicModules.map((m, i) => (
                <ModuleSection
                  key={m.id}
                  module={m}
                  index={i}
                  accentColor={accentInk}
                  showCurriculumRequirements={isPortfolioBuilder}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

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
            {isPortfolioBuilder
              ? "Start by setting your goal and your limits, then let each decision update your plan."
              : "Start with the first lesson, then continue into the portfolio-building course."}
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button href={`/lessons/${firstLessonSlug}`} size="lg">
              {isPortfolioBuilder ? "Start building" : "Start course"}
            </Button>
            <Button
              href={isPortfolioBuilder ? "/plan" : "/courses/investment-foundations"}
              variant="outline"
              size="lg"
            >
              {isPortfolioBuilder ? "Open your plan" : "See Portfolio Builder"}
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
      <div className="mt-2 text-[14px] font-medium tracking-[0.01em] text-slate-500">
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
      : ["Goal", "Allocation", "Evidence", "Value", "Holdings", "Rules"];

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
