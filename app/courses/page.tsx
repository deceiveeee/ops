import Link from "next/link";
import { courses } from "@/data/courses";
import Button from "@/components/ui/Button";
import CourseCard from "@/components/courses/CourseCard";

export const metadata = { title: "Courses — Open Portfolio Studio" };

/**
 * Course map / discovery page.
 *
 * Structure:
 *   1. Hero — large headline + supporting copy + 3-step path
 *   2. Two premium course product cards
 *   3. Recommended learning sequence
 *   4. Studio entry CTA
 *
 * Uses the full desktop canvas (1400px max). No monospace, no tiny
 * uppercase metadata, no small outlined dashboard panels.
 */

function getLessonsCount(courseSlug: string): number {
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) return 0;
  return course.modules.reduce((sum, m) => sum + m.lessonSlugs.length, 0);
}

export default function CoursesPage() {
  const financeFoundations = courses.find((c) => c.slug === "finance-foundations");
  const investmentFoundations = courses.find((c) => c.slug === "investment-foundations");

  return (
    <div className="hp-atmosphere-deep min-h-screen">
      {/* ─── Hero ─── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ paddingTop: "clamp(80px, 12vh, 140px)", paddingBottom: "clamp(60px, 8vh, 100px)" }}
      >
        <div className="hp-canvas">
          <h1 className="course-map-hero-title max-w-[1100px]">
            Two courses.
            <br />
            One investigation toolkit.
          </h1>
          <p className="course-lead mt-8 max-w-[760px]">
            Start with Finance Foundations to learn how value, risk and markets work.
            Continue with Investment Foundations to research investments and build a portfolio.
          </p>

          {/* Quiet 3-step path — Finance → Investment → Studio */}
          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
            <PathStep num="1" title="Finance Foundations" note="Build the financial language." />
            <PathConnector />
            <PathStep num="2" title="Investment Foundations" note="Apply it to investment decisions." />
            <PathConnector />
            <PathStep num="3" title="Portfolio Studio" note="Research, value and construct." />
          </div>
        </div>
      </section>

      {/* ─── Two course product cards ─── */}
      <section
        className="relative w-full"
        style={{ paddingBottom: "clamp(80px, 12vh, 140px)" }}
      >
        <div className="hp-canvas">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {financeFoundations && (
              <CourseCard
                slug={financeFoundations.slug}
                title={financeFoundations.title}
                subtitle="Learn how value, risk, markets and portfolios connect."
                shortDescription="A serious but accessible finance course built on a formal finance sequence, then connected to practical market interpretation."
                outcomes={[
                  "Read financial relationships",
                  "Value cash flows and securities",
                  "Understand risk and portfolio construction",
                ]}
                hours={financeFoundations.estimatedHours}
                modules={financeFoundations.modules.length}
                lessons={getLessonsCount(financeFoundations.slug)}
                variant="cyan"
                recommended
                ctaLabel="Explore Finance Foundations"
              />
            )}
            {investmentFoundations && (
              <CourseCard
                slug={investmentFoundations.slug}
                title={investmentFoundations.title}
                subtitle="Evaluate investments, compare strategies and build a defensible portfolio."
                shortDescription="Examine major investment philosophies, test the evidence behind each, and construct a portfolio you can defend."
                outcomes={[
                  "Research companies and industries",
                  "Evaluate investment philosophies",
                  "Construct and defend a portfolio",
                ]}
                hours={investmentFoundations.estimatedHours}
                modules={investmentFoundations.modules.length}
                lessons={getLessonsCount(investmentFoundations.slug)}
                variant="amber"
                ctaLabel="Explore Investment Foundations"
              />
            )}
          </div>
        </div>
      </section>

      {/* ─── Recommended learning sequence ─── */}
      <section
        className="relative w-full border-t border-white/10"
        style={{ paddingTop: "clamp(80px, 12vh, 140px)", paddingBottom: "clamp(80px, 12vh, 140px)" }}
      >
        <div className="hp-canvas">
          <h2 className="hp-section max-w-[900px]">
            A clear path from theory to portfolio.
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-10">
            <SequenceStep
              num="1"
              title="Finance Foundations"
              note="Build the financial language — value, time, risk, and markets."
              accent="#22d3ee"
              href="/courses/finance-foundations"
            />
            <SequenceStep
              num="2"
              title="Investment Foundations"
              note="Apply it to investment decisions, philosophies, and portfolio construction."
              accent="#fbbf24"
              href="/courses/investment-foundations"
            />
            <SequenceStep
              num="3"
              title="Portfolio Studio"
              note="Research companies, value securities, and construct a defensible portfolio."
              accent="#F5F5F7"
              href="/studio"
            />
          </div>

          {/* Studio CTA at the end of the sequence */}
          <div className="mt-16 flex flex-wrap items-center gap-4">
            <Button href="/studio" size="lg">
              Enter the studio
            </Button>
            <Link
              href="/filings"
              className="text-[17px] font-medium text-slate-300 transition-colors hover:text-white"
            >
              Or open the filing reader →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PathStep({ num, title, note }: { num: string; title: string; note: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[15px] font-semibold tabular-nums text-accent-cyan">{num}</span>
      <div>
        <div className="text-[17px] font-medium text-white">{title}</div>
        <div className="text-[14px] text-slate-500">{note}</div>
      </div>
    </div>
  );
}

function PathConnector() {
  return (
    <span aria-hidden className="hidden text-slate-600 sm:inline">
      →
    </span>
  );
}

function SequenceStep({
  num,
  title,
  note,
  accent,
  href,
}: {
  num: string;
  title: string;
  note: string;
  accent: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-t border-white/10 pt-6 transition-colors hover:border-white/20"
    >
      <div
        className="text-[15px] font-semibold tabular-nums"
        style={{ color: accent }}
      >
        Step {num}
      </div>
      <h3 className="mt-4 text-[clamp(28px,2.4vw,36px)] font-semibold leading-tight tracking-[-0.02em] text-white">
        {title}
      </h3>
      <p className="mt-4 text-[17px] leading-relaxed text-slate-400 max-w-[320px]">
        {note}
      </p>
      <div className="mt-6 text-[15px] font-medium text-slate-300 transition-transform group-hover:translate-x-1">
        Open →
      </div>
    </Link>
  );
}
