import Link from "next/link";
import { courses } from "@/data/courses";
import { getLessonsForModule } from "@/data/lessons";
import { portfolioBuilderPath } from "@/data/courses/portfolioBuilder";
import CourseCard from "@/components/courses/CourseCard";

export const metadata = { title: "Courses — Investing Studio" };

export default function CoursesPage() {
  const finance = courses.find((course) => course.slug === "finance-foundations");
  const investment = courses.find((course) => course.slug === "investment-foundations");
  const financeModules = finance?.modules.filter((module) => getLessonsForModule(module.id).length > 0) ?? [];
  const financeLessons = finance?.modules.reduce((total, module) => total + getLessonsForModule(module.id).length, 0) ?? 0;

  return (
    <div className="course-discovery refresh-container">
      <header className="course-discovery-heading">
        <div><p className="refresh-kicker">Courses</p><h1>Build your understanding.<br /><em>Then put it into practice.</em></h1></div>
        <p>Start with Finance Foundations to explore value, risk and markets. Continue with Investment Foundations to develop your investment approach.</p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {finance && <CourseCard
          slug={finance.slug} title={finance.title}
          subtitle="Learn how value, risk, markets and portfolios connect."
          shortDescription="Explore financial relationships through guided examples and interactive models."
          outcomes={["Read financial relationships", "Value cash flows and securities", "Understand risk and portfolio construction"]}
          hours={finance.estimatedHours} modules={financeModules.length} lessons={financeLessons}
          variant="cyan" recommended ctaLabel="Explore Finance Foundations"
        />}
        {investment && <CourseCard
          slug={investment.slug} title={investment.title}
          subtitle="Develop an investment approach you can explain."
          shortDescription="Work through goals, investment research, portfolio choices and operating rules."
          outcomes={["Define your goals and limits", "Evaluate evidence for an investment approach", "Build, review and revise a portfolio plan"]}
          hours={investment.estimatedHours} modules={portfolioBuilderPath.missions.length} lessons={portfolioBuilderPath.depthLabs.length}
          moduleLabel="Missions" lessonLabel="Depth labs" variant="amber" ctaLabel="Open Portfolio Builder"
        />}
      </div>
      <div className="course-discovery-next"><div><strong>Ready to apply what you know?</strong><p>Studio is open without completing a course. Your saved course decisions stay in Your plan.</p></div><div><Link href="/studio" className="refresh-text-link">Open Studio →</Link><Link href="/plan" className="refresh-text-link">Open your plan →</Link></div></div>
    </div>
  );
}
