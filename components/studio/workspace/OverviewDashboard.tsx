"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { StudioCalculation } from "@/lib/studio";
import { findStudioInstrument } from "@/lib/studio-catalog";
import { FIGURES } from "@/lib/studio-project/investigate";
import { workingAlternative, type CandidateStatus, type StudioProject } from "@/lib/studio-project/schema";
import { pct, usdWhole } from "../shared";
import StudioIcon from "./StudioIcon";
import styles from "./studio-design.module.css";

type NextStep = { title: string; why: string; href: string; action: string };

/** One suggestion from saved work. Every section remains available. */
function suggest(project: StudioProject, calculation: StudioCalculation): NextStep {
  const positions = workingAlternative(project)?.positions ?? [];
  if (!project.goal.purpose.trim()) return { title: "Say what this money is for", why: "Give your choices a direction: what you’re working toward, and when you’ll need the money.", href: "/studio/goals", action: "Open Goals" };
  if (!positions.length) return { title: "Choose what you might buy", why: "Read what each investment is and what it holds. Keep the evidence behind your choices.", href: "/studio/research", action: "Open Research" };
  if (Math.abs(calculation.totalWeightPct - 100) > 0.01) return { title: "Decide how much goes where", why: `Your percentages total ${pct(calculation.totalWeightPct)}. Review the amounts and decide what should stay in cash.`, href: "/studio/portfolio", action: "Open Portfolio" };
  const { contributionRule, sellRule, guardrails } = project.rules;
  if (!contributionRule.trim() && !sellRule.trim() && !guardrails.trim()) return { title: "Write the rules you will follow", why: "Put your reasons into words while you have time to think. Make your future decisions easier to explain.", href: "/studio/review", action: "Open Review" };
  return { title: "Check the risk and the cost", why: "Try a fall you choose and see what it would cost, before any money moves.", href: "/studio/portfolio/risk", action: "Open Risk and cost" };
}

const STANDING: Record<CandidateStatus, string> = { researching: "Still reading", shortlisted: "Worth a closer look", selected: "Decided to buy", rejected: "Decided against" };
const newestFirst = <T extends { updatedAt: string }>(items: T[]) => [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

function ResearchArtwork() {
  return <div className={styles.researchArtwork} aria-hidden="true">
    <div className={styles.artOrbit} />
    <div className={styles.backPage}><StudioIcon name="goals" /><span>Question</span></div>
    <div className={styles.frontPage}><StudioIcon name="report" /><span>Evidence</span><i /><i /><i /><b>Your call.</b></div>
    <span className={styles.artStar}>✳</span>
  </div>;
}

function PortfolioPicture({ project, calculation }: { project: StudioProject; calculation: StudioCalculation }) {
  const total = calculation.totalWeightPct;
  const over = total > 100.01;
  const assigned = Math.max(0, Math.min(100, total));
  const ringLabel = `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(total)}%`;
  const hasPositions = Boolean(workingAlternative(project)?.positions.length);
  return <section className={styles.portfolioPicture} aria-labelledby="overview-allocation">
    <div className={styles.pictureHeading}><h2 id="overview-allocation">Your portfolio, taking shape</h2><StudioIcon name="portfolio" /></div>
    <div className={styles.pictureBody}>
      <div className={styles.allocationArt} aria-hidden="true">
        <svg viewBox="0 0 180 180" fill="none"><circle cx="90" cy="96" r="65" stroke="#15181a" strokeWidth="22" /><circle cx="90" cy="90" r="65" stroke="#51584d" strokeWidth="22" /><circle cx="90" cy="90" r="65" stroke={over ? "#edc285" : "#d3f594"} strokeWidth="22" pathLength="100" strokeDasharray={`${assigned} 100`} transform="rotate(-90 90 90)" /></svg>
        <span>{over ? "Check" : ringLabel}<small>{over ? "the weights" : "assigned"}</small></span>
      </div>
      <div className={styles.pictureAmount}><span>{project.mode === "practice" ? "Practice amount" : "Planning amount"}</span><strong>{usdWhole(calculation.investableBudget)}</strong><p>{over ? `${pct(total - 100)} over the available amount` : hasPositions ? `${pct(Math.max(0, 100 - total))} left to assign` : "Ready for your first choice"}</p></div>
    </div>
    <p className={styles.allocationDescription}>{hasPositions ? `${pct(total)} of the amount after your cash reserve is assigned to investments.` : "Add investments in Research, then choose their amounts in Portfolio."}</p>
    <Link href="/studio/portfolio" className={styles.pictureLink}>See your portfolio <StudioIcon name="arrow" /></Link>
  </section>;
}

export default function OverviewDashboard({ project, calculation, children }: { project: StudioProject; calculation: StudioCalculation; children?: ReactNode }) {
  const [allCompanies, setAllCompanies] = useState(false);
  const [allInvestments, setAllInvestments] = useState(false);
  const step = suggest(project, calculation);
  const companies = newestFirst(project.investigations);
  const investments = newestFirst(project.candidates);
  const held = new Set((workingAlternative(project)?.positions ?? []).map(position => position.instrumentId));
  const { purpose, horizonYears, monthlyContribution } = project.goal;
  const renderResearch = (surface: string) => (
    <div className={styles.researchGrid}>
      <section className={styles.workSection} aria-labelledby={`overview-companies-${surface}`}>
        <div className={styles.workHeading}><span className={styles.workIcon}><StudioIcon name="company" /></span><h2 id={`overview-companies-${surface}`}>Companies you have looked into</h2>{companies.length > 0 && <span className={styles.count}>{companies.length}</span>}</div>
        {companies.length ? <><ul className={styles.workList}>{(allCompanies ? companies : companies.slice(0, 3)).map(item => <li key={item.id}><Link href={`/studio/investigate?company=${encodeURIComponent(item.id)}`}><span><strong>{item.company.trim() || "Unnamed company"}</strong><small>{Object.keys(item.figures).length} of {FIGURES.length} figures entered</small></span><StudioIcon name="arrow" /></Link></li>)}</ul>{companies.length > 3 && <button className={styles.showMore} onClick={() => setAllCompanies(value => !value)} aria-expanded={allCompanies}>{allCompanies ? "Show recent companies" : `Show all ${companies.length} companies`}</button>}</> : <p className={styles.emptyCopy}>Start with a business you’re curious about.</p>}
        <Link href="/studio/investigate" className={styles.textLink}>Investigate a company <StudioIcon name="arrow" /></Link>
      </section>
      <section className={styles.workSection} aria-labelledby={`overview-investments-${surface}`}>
        <div className={styles.workHeading}><span className={`${styles.workIcon} ${styles.greenIcon}`}><StudioIcon name="research" /></span><h2 id={`overview-investments-${surface}`}>Investments you have read about</h2>{investments.length > 0 && <span className={styles.count}>{investments.length}</span>}</div>
        {investments.length ? <><ul className={styles.workList}>{(allInvestments ? investments : investments.slice(0, 3)).map(candidate => { const instrument = findStudioInstrument(candidate.instrumentId); return <li key={candidate.id}><Link href="/studio/research"><span><strong>{instrument?.symbol ?? candidate.instrumentId} <span>{instrument?.name ?? ""}</span></strong><small>{STANDING[candidate.status]} · {held.has(candidate.instrumentId) ? "in your portfolio" : "not in your portfolio; your notes are kept"}{candidate.evidence.length ? ` · ${candidate.evidence.length} ${candidate.evidence.length === 1 ? "thing" : "things"} you read` : ""}</small></span><StudioIcon name="arrow" /></Link></li>; })}</ul>{investments.length > 3 && <button className={styles.showMore} onClick={() => setAllInvestments(value => !value)} aria-expanded={allInvestments}>{allInvestments ? "Show recent investments" : `Show all ${investments.length} investments`}</button>}</> : <p className={styles.emptyCopy}>Explore investments. Keep your reasons.</p>}
        <Link href="/studio/research" className={styles.textLink}>Open Research <StudioIcon name="arrow" /></Link>
      </section>
    </div>
  );
  return <div className={styles.overview}>
    <header className={styles.overviewHeading}><div><p className={styles.eyebrow}>Your investing workspace</p><h1>Your next <em>move.</em></h1></div><p>A question. Some evidence.<br />A decision you can explain.</p></header>
    {children}
    <div className={styles.startGrid}>
      <section className={styles.nextStep} aria-labelledby="overview-next">
        <div className={styles.nextCopy}><p className={styles.eyebrow}><span className={styles.smallDot} /> A suggested next step</p><h2 id="overview-next">{step.title}</h2><p>{step.why}</p><Link href={step.href} className={styles.primaryLink}>{step.action}<StudioIcon name="arrow" /></Link></div>
        <ResearchArtwork />
        <nav className={styles.workFlow} aria-label="Ways to work"><Link href="/studio/goals">Your goal</Link><StudioIcon name="arrow" /><Link href="/studio/research">Your research</Link><StudioIcon name="arrow" /><Link href="/studio/portfolio">Your portfolio</Link></nav>
      </section>
      <PortfolioPicture project={project} calculation={calculation} />
    </div>
    <section className={styles.goalStrip} aria-labelledby="overview-goal"><span className={styles.goalIcon}><StudioIcon name="goals" /></span><div><h2 id="overview-goal">What this money is for</h2><p>{purpose.trim() || "A goal gives every choice a direction."}</p></div><div className={styles.goalTime}>{purpose.trim() ? <><strong>{horizonYears} {horizonYears === 1 ? "year" : "years"}</strong>{monthlyContribution > 0 && <span>{usdWhole(monthlyContribution)} each month</span>}</> : null}<Link href="/studio/goals">{purpose.trim() ? "Edit your goal" : "Set your goal"}<StudioIcon name="arrow" /></Link></div></section>
    {/* CSS selects the layout before hydration. Distinct heading IDs keep the
        two presentations accessible without a viewport-dependent render jump. */}
    <div className={styles.desktopResearch}>{renderResearch("desktop")}</div>
    <details className={styles.mobileResearch}>
      <summary><span className={styles.workIcon}><StudioIcon name="research" /></span><span><strong>Your research</strong><small>{companies.length} {companies.length === 1 ? "company" : "companies"} · {investments.length} {investments.length === 1 ? "investment" : "investments"}</small></span><StudioIcon name="arrow" /></summary>
      {renderResearch("mobile")}
    </details>
    <Link href="/studio/filings" className={styles.sourceLink}><StudioIcon name="report" /><span>Go straight to the source. <strong>Explore company reports</strong></span><StudioIcon name="arrow" /></Link>
  </div>;
}
