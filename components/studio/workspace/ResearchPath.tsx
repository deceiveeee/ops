"use client";

import Link from "next/link";
import {
  RESEARCH_STEPS,
  nextStep,
  pathCompany,
  stepHref,
  stepNumber,
  stepStatuses,
} from "@/lib/studio-project/research-path";
import StudioIcon from "./StudioIcon";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./working-pages.module.css";

/**
 * The company path, laid out whole on the Research page.
 *
 * It replaced six tiles of equal weight — industry, investigate, map,
 * competition, value, reports — which were in no order, did not say that four
 * of them need a company first, and ended nowhere. Here the steps are numbered
 * in the order they are done, each says what is saved, and there is one button:
 * the first step, or the next one with nothing saved.
 */
export default function ResearchPath() {
  const { project } = useWorkspace();
  const company = pathCompany(project);
  const statuses = stepStatuses(project, company);
  const next = nextStep(project);
  const name = company?.company.trim() || "Unnamed company";

  return (
    <section className={styles.researchPath} aria-labelledby="research-path-heading">
      <div className={styles.pathHead}>
        <div>
          <h2 id="research-path-heading">Research one company, step by step</h2>
          <p>
            {company
              ? `Eight steps, in this order. You are researching ${name}.`
              : "Eight steps, in this order, from its industry to your decision."}
          </p>
        </div>
        <Link href={stepHref(next, company)} className={styles.pathStart}>
          {company ? `Continue: step ${stepNumber(next.key)}, ${next.title}` : "Start with step 1"}
          <StudioIcon name="arrow" />
        </Link>
      </div>
      <ol className={styles.pathSteps}>
        {RESEARCH_STEPS.map((step, index) => {
          const status = statuses[step.key];
          const isNext = step.key === next.key;
          return (
            <li key={step.key}>
              <Link href={stepHref(step, company)} data-next={isNext ? "true" : undefined}>
                <span className={styles.pathNumber} data-done={status.done ? "true" : undefined} aria-hidden="true">
                  {status.done ? "✓" : index + 1}
                </span>
                <span>
                  <strong>
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </strong>
                  <small>
                    {isNext
                      ? "Next"
                      : status.note
                        ? status.note
                        : step.needsCompany && !company
                          ? "After step 3"
                          : status.done
                            ? "Done"
                            : " "}
                  </small>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
