"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgressStore } from "@/lib/progress/store";
import styles from "./courses.module.css";

export type ModuleLesson = {
  slug: string;
  title: string;
  /** "Interactive lesson · 35 min". */
  meta: string;
  /** False for a lesson that is listed but not built yet. */
  open: boolean;
  /** "Coming soon" or "In development", for a lesson that is not open. */
  note?: string;
};

export type ModuleItem = {
  id: string;
  order: number;
  title: string;
  description: string;
  hours: number;
  lessons: ModuleLesson[];
};

/** Each Finance Foundations module records completion under its own key. */
const progressKey = (order: number) => `ops-m${order}-completion-v1`;

/**
 * The curriculum folded to one ruled row per module, one open at a time. The
 * learner's current module opens by itself: the first one part done, or else
 * the one after the last finished. A link to #module-N opens that module.
 */
export default function CourseModules({ modules }: { modules: ModuleItem[] }) {
  const { ready, isComplete } = useProgressStore();
  const [open, setOpen] = useState<number | null>(modules[0]?.order ?? null);

  const doneIn = (module: ModuleItem) =>
    ready ? module.lessons.filter((lesson) => isComplete(progressKey(module.order), lesson.slug)).length : 0;

  // Once progress has loaded, open where the learner is, unless the address names a module.
  useEffect(() => {
    if (!ready || /^#module-\d+$/.test(window.location.hash)) return;
    const counts = modules.map((module) => ({ order: module.order, done: doneIn(module), total: module.lessons.length }));
    const partway = counts.find((count) => count.done > 0 && count.done < count.total);
    const lastFinished = [...counts].reverse().find((count) => count.total > 0 && count.done === count.total);
    const next = lastFinished ? counts[counts.findIndex((count) => count.order === lastFinished.order) + 1] : undefined;
    const current = partway ?? next;
    if (current) setOpen(current.order);
    // Progress is read once on load; later changes happen on other pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // A link such as /courses/finance-foundations#module-3 opens and shows that module.
  useEffect(() => {
    const follow = () => {
      const match = window.location.hash.match(/^#module-(\d+)$/);
      if (!match) return;
      const order = Number(match[1]);
      if (!modules.some((module) => module.order === order)) return;
      setOpen(order);
      requestAnimationFrame(() => document.getElementById(`module-${order}`)?.scrollIntoView({ block: "start" }));
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [modules]);

  return (
    <ol className={styles.modules}>
      {modules.map((module) => {
        const done = doneIn(module);
        const total = module.lessons.length;
        return (
          <li key={module.id}>
            <details
              id={`module-${module.order}`}
              className={styles.module}
              open={open === module.order}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;
                if (isOpen && open !== module.order) setOpen(module.order);
                if (!isOpen && open === module.order) setOpen(null);
              }}
            >
              <summary className={styles.moduleSummary}>
                <span className={styles.moduleNumber}>{module.order}</span>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <span className={styles.moduleMeta}>
                  {total} {total === 1 ? "lesson" : "lessons"} · {module.hours} hours
                  {done > 0 ? <span className={styles.moduleDone}> · {done === total ? "done" : `${done} of ${total} done`}</span> : null}
                </span>
                <span className={styles.moduleToggle} aria-hidden="true">+</span>
              </summary>
              <div className={styles.moduleBody}>
                <p className={styles.moduleDescription}>{module.description}</p>
                <ol className={styles.lessons} aria-label={`Lessons in ${module.title}`}>
                  {module.lessons.map((lesson, index) => {
                    const complete = ready && isComplete(progressKey(module.order), lesson.slug);
                    return (
                      <li key={lesson.slug} className={styles.lesson}>
                        <span className={styles.lessonNumber}>{index + 1}</span>
                        {lesson.open ? (
                          <Link href={`/lessons/${lesson.slug}`} className={styles.lessonTitle}>{lesson.title}</Link>
                        ) : (
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                        )}
                        <span className={styles.lessonMeta}>{lesson.meta}</span>
                        <span className={styles.lessonState} data-state={complete ? "done" : undefined}>
                          {complete ? "Done" : lesson.note ?? ""}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
