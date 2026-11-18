import Link from "next/link";
import { courses } from "@/data/courses";
import { portfolioBuilderPath } from "@/data/courses/portfolioBuilder";
import { getLessonsForModule } from "@/data/lessons";
import styles from "./homepage.module.css";

/**
 * What the site holds, set out like the contents page of a report: one ruled
 * row per place, each saying what you do there. Every description repeats a
 * claim the destination page already makes.
 */
export default function HomeContents() {
  const finance = courses.find((course) => course.slug === "finance-foundations");
  const modules = finance?.modules.filter((module) => getLessonsForModule(module.id).length > 0) ?? [];
  const lessons = modules.reduce((total, module) => total + getLessonsForModule(module.id).length, 0);
  const missions = portfolioBuilderPath.missions.length;

  const entries = [
    {
      href: "/courses/finance-foundations",
      name: "Finance Foundations",
      text: "How value, risk, markets and portfolios connect. Start here if finance is new to you.",
      meta: `${modules.length} modules · ${lessons} lessons`,
    },
    {
      href: "/courses/investment-foundations",
      name: "Investment Foundations",
      text: "Develop an investment approach you can explain, one decision at a time.",
      meta: `${missions} missions · one portfolio plan`,
    },
    {
      href: "/studio",
      name: "Studio",
      text: "Research a business, build a portfolio and test your assumptions.",
      meta: "No course needed",
    },
    {
      href: "/studio/filings",
      name: "Company reports",
      text: "A company's annual and quarterly reports from the SEC, split into the sections an investor reads.",
      meta: "From sec.gov",
    },
  ];

  return (
    <section className={styles.contents} aria-labelledby="contents-title">
      <h2 id="contents-title" className={styles.sectionTitle}>Two courses, Studio and company reports</h2>
      <ul className={styles.contentsList}>
        {entries.map((entry, index) => (
          <li key={entry.href}>
            <Link href={entry.href} className={styles.entry}>
              <span className={styles.entryNum} aria-hidden="true">{index + 1}</span>
              <span className={styles.entryName}>{entry.name}</span>
              <span className={styles.entryText}>{entry.text}</span>
              <span className={styles.entryMeta}>{entry.meta}</span>
              <span className={styles.entryArrow} aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
