import Link from "next/link";
import { courses } from "@/data/courses";
import { courseFacts, curriculum, firstStep, type CurriculumItem } from "@/components/courses/courseFacts";
import styles from "@/components/courses/courses-list.module.css";

export const metadata = {
  title: "Courses — Investing Studio",
  description: "What each course teaches: Finance Foundations module by module, and Investment Foundations mission by mission.",
};

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19 19 5M7 5h12v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "25 min" stays on one line: a phone otherwise breaks it at the space. */
function keepTogether(text: string): string {
  return text.replace(/ (min|hours?)\b/g, " $1");
}

type Row = {
  slug: string;
  title: string;
  number: number;
  tone: "lavender" | "sky";
  summary: string;
  facts: string[];
  start: { href: string; label: string; title: string };
  learnLabel: string;
  items: CurriculumItem[];
  primary: boolean;
};

/**
 * The two courses, one wide panel each: the course and its first step on the
 * left, and on the right everything it teaches, module by module or mission
 * by mission, so a visitor can see what they would learn before starting.
 * Every line restates the course data. The look is the homepage's.
 */
export default function CoursesPage() {
  const rows: Row[] = [];
  const finance = courses.find((course) => course.slug === "finance-foundations");
  const investment = courses.find((course) => course.slug === "investment-foundations");
  if (finance) {
    rows.push({
      slug: finance.slug,
      title: finance.title,
      number: 1,
      tone: "lavender",
      summary: "How value, risk, markets and portfolios connect.",
      facts: courseFacts(finance.slug),
      start: firstStep(finance.slug),
      learnLabel: "What you will learn, module by module",
      items: curriculum(finance.slug),
      primary: true,
    });
  }
  if (investment) {
    rows.push({
      slug: investment.slug,
      title: investment.title,
      number: 2,
      tone: "sky",
      summary: "Develop an investment approach you can explain, one decision at a time.",
      facts: courseFacts(investment.slug),
      start: firstStep(investment.slug),
      learnLabel: "What you will decide, mission by mission",
      items: curriculum(investment.slug),
      primary: false,
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}><span className={styles.dot} aria-hidden="true" /> Courses</p>
          <h1 className={styles.title}>What you will learn, <span className={styles.accent}>course by course.</span></h1>
          <p className={styles.lead}>Finance Foundations explains how value, risk and markets work. Investment Foundations then uses it to build your portfolio plan.</p>
        </header>

        <div className={styles.cards}>
          {rows.map((row) => (
            <article key={row.slug} className={styles.card} data-tone={row.tone} aria-labelledby={`course-${row.slug}`}>
              <div className={styles.side}>
                <div className={styles.cardTop}>
                  <span className={styles.num} aria-hidden="true">{row.number}</span>
                  <span className={styles.order}>Course {row.number}</span>
                  {row.primary ? <span className={styles.startHere}>Start here</span> : null}
                </div>
                <h2 id={`course-${row.slug}`} className={styles.courseName}>
                  <Link href={`/courses/${row.slug}`}>{row.title}</Link>
                </h2>
                <p className={styles.summary}>{row.summary}</p>
                <p className={styles.meta}>{row.facts.join(" · ")}</p>
                <div className={styles.start}>
                  <Link href={row.start.href} className={row.primary ? styles.pill : styles.pillOutline}>{row.start.label} <Arrow /></Link>
                  <span className={styles.startTitle}>{keepTogether(row.start.title)}</span>
                </div>
              </div>
              <div className={styles.sheet}>
                <h3 className={styles.label}>{row.learnLabel}</h3>
                <ol className={row.items.some((item) => item.line) ? styles.modules : styles.missions}>
                  {row.items.map((item) => (
                    <li key={item.number}>
                      <span className={styles.itemNum} aria-hidden="true">{item.number}</span>
                      <span className={styles.itemText}>
                        <Link href={item.href} className={styles.itemTitle}>{item.title}</Link>
                        {item.line ? <span className={styles.itemLine}>{item.line}</span> : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.after}>
          <p>Studio is open without taking a course, and the decisions you save in a course stay in <Link href="/plan">your plan</Link>.</p>
          <Link href="/studio" className={styles.pill}>Open Studio <Arrow /></Link>
        </div>
      </div>
    </div>
  );
}
