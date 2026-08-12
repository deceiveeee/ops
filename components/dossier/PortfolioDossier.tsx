"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

/**
 * The learner writes six artifacts across Investment Foundations and, until this
 * view existed, could never read any of them back. Everything here is rendered
 * from the same localStorage records the lessons write, via useIFProgress, so it
 * updates live and stores nothing of its own.
 */

type Field = { label: string; value: string | string[] };
type Group = { heading?: string; fields: Field[] };

type Section = {
  id: string;
  mission: string;
  title: string;
  purpose: string;
  lessonSlug: string;
  lessonLabel: string;
  willContain: string;
  updatedAt: string;
  groups: Group[];
};

// Values arrive from floating-point arithmetic (999.9999999999999, 1333.3333…),
// so round to whole millions. This is a document, not a calculator readout.
const money = (v: number) =>
  `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}m`;
const percent = (v: number, digits = 1) => `${(Number(v) * 100).toFixed(digits)}%`;

/** Drop empty fields so a partially filled artifact shows only real answers. */
function present(groups: Group[]): Group[] {
  return groups
    .map((g) => ({
      ...g,
      fields: g.fields.filter((f) =>
        Array.isArray(f.value) ? f.value.length > 0 : f.value.trim().length > 0,
      ),
    }))
    .filter((g) => g.fields.length > 0);
}

function formatWhen(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PortfolioDossier() {
  const {
    draft,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
  } = useIFProgress();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Artifacts load in an effect, so the first paint has none. Gate on mount to
  // avoid rendering an "empty dossier" that immediately replaces itself.
  useEffect(() => setMounted(true), []);

  const sections = useMemo<Section[]>(
    () => [
      {
        id: "philosophy",
        mission: "Missions 1–2",
        title: "Investment philosophy draft",
        purpose: "Who you are building for, and what you believe about markets.",
        lessonSlug: "if-1-4-when-a-philosophy-fits-the-investor",
        lessonLabel: "Investor–philosophy fit",
        willContain:
          "your market belief, the constraints you actually face, a candidate strategy, and the rules that would make you change your mind",
        updatedAt: draft.updatedAt,
        groups: present([
          { fields: [{ label: "Summary", value: draft.generatedSummary }] },
          {
            heading: "Market belief",
            fields: [
              { label: "What you believe", value: draft.marketBelief },
              { label: "Where the advantage arises", value: draft.advantageStage },
              { label: "Why it should persist", value: draft.persistenceReason },
            ],
          },
          {
            heading: "Investor constraints",
            fields: [
              { label: "Risk preference", value: draft.constraints.riskPreference },
              { label: "Horizon", value: draft.constraints.horizon },
              { label: "Cash needs", value: draft.constraints.cashNeeds },
              { label: "Liquidity needs", value: draft.constraints.liquidityNeeds },
              { label: "Tax considerations", value: draft.constraints.taxConsiderations },
              { label: "Capital", value: draft.constraints.capital },
              { label: "Research time", value: draft.constraints.researchTime },
              { label: "Patience", value: draft.constraints.patience },
              { label: "Analytical tools", value: draft.constraints.analyticalTools },
              {
                label: "Underperformance tolerance",
                value: draft.constraints.underperformanceTolerance,
              },
            ],
          },
          {
            heading: "Strategy and rules",
            fields: [
              { label: "Strategy", value: draft.strategy },
              { label: "Implementation risks", value: draft.implementationRisks },
              { label: "Execution rule", value: draft.executionRule },
              { label: "Evaluation rule", value: draft.evaluationRule },
            ],
          },
          {
            heading: "Philosophy families considered",
            fields: [
              { label: "Candidates", value: draft.candidateFamilies },
              { label: "Evidence rule", value: draft.familyEvidenceRule },
              { label: "Open research question", value: draft.familyResearchQuestion },
            ],
          },
          {
            heading: "Fit",
            fields: [
              { label: "Chosen family", value: draft.fitFamily },
              { label: "Capacity to run it", value: draft.fitCapacitySummary },
              { label: "Review rule", value: draft.fitReviewRule },
              { label: "Open question", value: draft.fitOpenQuestion },
              { label: "Evidence gap", value: draft.evidenceGap },
            ],
          },
        ]),
      },
      {
        id: "bond-risk",
        mission: "Mission 3",
        title: "Bond risk brief",
        purpose: "What a bond can do to you, and what you would pay for it.",
        lessonSlug: "if-2-5-from-credit-rating-to-bond-price",
        lessonLabel: "From credit rating to bond price",
        willContain:
          "the payments promised, your reading of interest-rate and default risk, and a pricing decision",
        updatedAt: bondBrief.updatedAt,
        groups: present([
          {
            fields: [
              { label: "Payment promise", value: bondBrief.paymentPromise },
              { label: "Interest-rate risk", value: bondBrief.rateRisk },
              { label: "Duration finding", value: bondBrief.durationFinding },
              { label: "Default evidence", value: bondBrief.defaultEvidence },
              { label: "Pricing decision", value: bondBrief.pricingDecision },
            ],
          },
        ]),
      },
      {
        id: "equity-risk",
        mission: "Mission 4",
        title: "Equity risk policy",
        purpose: "How you measure equity risk, and the return you demand for it.",
        lessonSlug: "if-3-6-build-an-equity-risk-policy",
        lessonLabel: "Build an equity risk policy",
        willContain:
          "your definition of risk, how you read beta, which measures you rely on, and your price rule",
        updatedAt: equityRiskPolicy.updatedAt,
        groups: present([
          {
            fields: [
              { label: "Risk definition", value: equityRiskPolicy.riskDefinition },
              { label: "Portfolio context", value: equityRiskPolicy.portfolioContext },
              { label: "Reading beta", value: equityRiskPolicy.betaInterpretation },
              { label: "Fundamental drivers", value: equityRiskPolicy.fundamentalDrivers },
              { label: "Measures relied on", value: equityRiskPolicy.methodStack },
              { label: "Price rule", value: equityRiskPolicy.priceRule },
              { label: "Decision", value: equityRiskPolicy.decision },
              {
                label: "Remaining uncertainty",
                value: equityRiskPolicy.remainingUncertainty,
              },
            ],
          },
        ]),
      },
      {
        id: "statements",
        mission: "Mission 6",
        title: "Business evidence brief",
        purpose: "What the statements say about the business behind the security.",
        lessonSlug: "if-4-6-trace-cash-to-the-investor",
        lessonLabel: "Trace cash to the investor",
        willContain:
          "how the three statements connect, what you found on profitability, leverage and cash, and what you still need to know",
        updatedAt: statementBrief.updatedAt,
        groups: present([
          {
            fields: [
              { label: "Statement map", value: statementBrief.statementMap },
              { label: "Balance sheet finding", value: statementBrief.balanceSheetFinding },
              { label: "Financial recast", value: statementBrief.financialRecast },
              { label: "Profitability", value: statementBrief.profitabilityFinding },
              { label: "Adjustments", value: statementBrief.adjustmentFinding },
              { label: "Cash flow", value: statementBrief.cashFlowFinding },
              { label: "Decision", value: statementBrief.decision },
              { label: "Remaining question", value: statementBrief.remainingQuestion },
            ],
          },
        ]),
      },
      {
        id: "valuation",
        mission: "Mission 7",
        title: "Valuation and return range",
        purpose: "What it is worth, and the price at which you would act.",
        lessonSlug: "if-5-1-estimate-a-valuation-range",
        lessonLabel: "Estimate a valuation range",
        willContain:
          "the claim you valued, a low/base/high range, your decision buffer, and the evidence that would change your mind",
        updatedAt: valuationRange.updatedAt,
        groups: valuationRange.updatedAt
          ? present([
              {
                fields: [
                  { label: "Claim valued", value: valuationRange.claim },
                  { label: "Method", value: valuationRange.method },
                ],
              },
              {
                heading: "The range",
                fields: [
                  { label: "Low case", value: money(valuationRange.lowValue) },
                  { label: "Base case", value: money(valuationRange.baseValue) },
                  { label: "Quality case", value: money(valuationRange.highValue) },
                  { label: "Observed price", value: money(valuationRange.observedPrice) },
                  {
                    label: "Required return",
                    value: percent(valuationRange.requiredReturn, 0),
                  },
                  {
                    label: "Decision buffer",
                    value: percent(valuationRange.decisionBuffer, 0),
                  },
                  { label: "Buy below", value: money(valuationRange.buyBelow) },
                ],
              },
              {
                heading: "Decision",
                fields: [
                  { label: "Verdict", value: valuationRange.decision },
                  { label: "Relative check", value: valuationRange.relativeCheck },
                  { label: "Would change my mind", value: valuationRange.evidenceTriggers },
                ],
              },
            ])
          : [],
      },
      {
        id: "friction",
        mission: "Mission 8",
        title: "Friction budget",
        purpose: "What acting will cost you, and the hurdle that creates.",
        lessonSlug: "if-6-1-count-the-friction",
        lessonLabel: "Count the friction",
        willContain:
          "your expected turnover, the liquidity of what you hold, your price-impact and waiting exposure, your tax setting, and the annual drag they add up to",
        updatedAt: frictionBudget.updatedAt,
        groups: frictionBudget.updatedAt
          ? present([
              {
                fields: [
                  { label: "Expected turnover", value: frictionBudget.turnoverExpectation },
                  { label: "Holdings liquidity", value: frictionBudget.spreadClass },
                  { label: "Price-impact exposure", value: frictionBudget.priceImpactExposure },
                  { label: "Waiting sensitivity", value: frictionBudget.waitingSensitivity },
                  { label: "Tax setting", value: frictionBudget.taxSetting },
                ],
              },
              {
                heading: "The hurdle",
                fields: [
                  {
                    label: "Estimated annual drag",
                    value: percent(frictionBudget.estimatedAnnualDrag, 1),
                  },
                  { label: "Rule", value: frictionBudget.hurdleRule },
                ],
              },
            ])
          : [],
      },
    ],
    [
      draft,
      bondBrief,
      equityRiskPolicy,
      statementBrief,
      valuationRange,
      frictionBudget,
    ],
  );

  const recorded = sections.filter((s) => Boolean(s.updatedAt));
  const lastUpdated = recorded
    .map((s) => s.updatedAt)
    .sort()
    .reverse()[0];

  const copyAsText = async () => {
    const lines: string[] = ["PORTFOLIO DOSSIER", ""];
    for (const s of recorded) {
      lines.push(`${s.mission.toUpperCase()} — ${s.title.toUpperCase()}`);
      for (const g of s.groups) {
        if (g.heading) lines.push(`  ${g.heading}`);
        for (const f of g.fields) {
          const v = Array.isArray(f.value) ? f.value.join("; ") : f.value;
          lines.push(`    ${f.label}: ${v}`);
        }
      }
      lines.push("");
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable; the page still shows everything */
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-white/5" />
        <div className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <header>
        <div className="ops-eyebrow flex items-center gap-3 text-xs">
          <span>Investment Foundations</span>
          <span className="h-px w-8 bg-white/30" />
          <span className="text-accent-amber">Portfolio Builder</span>
        </div>
        <h1 className="ops-display mt-5 text-4xl leading-[1.05] sm:text-5xl">
          Your portfolio dossier
        </h1>
        <p className="ops-body mt-5 text-lg leading-8 text-slate-200">
          Everything you have decided so far, in one place. Each mission adds one
          artifact. When the dossier is complete you can defend every holding in it.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-full border px-4 py-2 text-sm tabular-nums",
              recorded.length === sections.length
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
            )}
          >
            {recorded.length} of {sections.length} artifacts recorded
          </span>
          {lastUpdated && (
            <span className="text-[14px] text-slate-400">
              Last updated {formatWhen(lastUpdated)}
            </span>
          )}
          {recorded.length > 0 && (
            <button
              type="button"
              onClick={copyAsText}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
            >
              {copied ? "Copied" : "Copy as text"}
            </button>
          )}
        </div>
      </header>

      {recorded.length === 0 && (
        <div className="ops-definition-card mt-10 p-6">
          {/* The empty state's title, not a label on something else. Heading
              semantics, caption styling — the look is unchanged. */}
          <h2 className="ops-caption text-[12px] text-accent-amber">Nothing recorded yet</h2>
          <p className="ops-body mt-3 text-[15px] text-slate-200">
            Your dossier fills in as you finish missions. Each one ends with a decision
            that is saved here, so the work accumulates instead of disappearing.
          </p>
          <Link
            href="/lessons/if-1-1-how-an-investor-builds-a-philosophy"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20"
          >
            Start with mission 1 →
          </Link>
        </div>
      )}

      <div className="mt-12 space-y-6">
        {sections.map((s) => (
          <ArtifactCard key={s.id} section={s} />
        ))}
      </div>

      <footer className="mt-14 border-t border-white/10 pt-6">
        <p className="text-[14px] leading-6 text-slate-400">
          This dossier is your own work, stored in this browser only. It is educational
          material, not investment advice.
        </p>
        <Link
          href="/courses/investment-foundations"
          className="ops-caption mt-4 inline-block text-[12px] text-slate-400 hover:text-accent-amber"
        >
          ← Back to Investment Foundations
        </Link>
      </footer>
    </div>
  );
}

function ArtifactCard({ section }: { section: Section }) {
  const recorded = Boolean(section.updatedAt) && section.groups.length > 0;

  return (
    <section
      aria-labelledby={`artifact-${section.id}`}
      className={cn(
        "rounded-2xl border p-5 sm:p-7",
        recorded
          ? "border-white/12 bg-white/[0.03]"
          : "border-dashed border-white/12 bg-transparent",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ops-caption text-[12px] text-accent-amber">{section.mission}</div>
          <h2
            id={`artifact-${section.id}`}
            className={cn(
              "ops-section-title mt-2 text-xl sm:text-2xl",
              !recorded && "text-slate-400",
            )}
          >
            {section.title}
          </h2>
          <p className="ops-body mt-2 text-[14px] text-slate-400">{section.purpose}</p>
        </div>
        <span
          className={cn(
            "ops-caption flex-shrink-0 rounded-full border px-3 py-1 text-[12px]",
            recorded
              ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
              // The dossier is a dark page: slate-500 measured 4.23:1 here, and
              // this pill is the artifact's status, not decoration.
              : "border-white/15 text-slate-400",
          )}
        >
          {recorded ? "Recorded" : "Not yet"}
        </span>
      </div>

      {recorded ? (
        <>
          <div className="mt-6 space-y-6">
            {section.groups.map((g, gi) => (
              <div key={g.heading ?? `g${gi}`}>
                {g.heading && (
                  <div className="ops-caption mb-3 text-[12px] text-slate-500">
                    {g.heading}
                  </div>
                )}
                <dl className="space-y-3">
                  {g.fields.map((f) => (
                    <Row key={f.label} label={f.label} value={f.value} />
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <span className="text-[12px] text-slate-500">
              Saved {formatWhen(section.updatedAt)}
            </span>
            <Link
              href={`/lessons/${section.lessonSlug}`}
              className="text-[14px] text-slate-300 transition-colors hover:text-accent-amber"
            >
              Revise in {section.lessonLabel} →
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="ops-body text-[14px] leading-6 text-slate-400">
            Will contain {section.willContain}.
          </p>
          <Link
            href={`/lessons/${section.lessonSlug}`}
            className="mt-4 inline-block text-[14px] font-semibold text-accent-amber transition-colors hover:text-accent-amber/80"
          >
            Go to {section.lessonLabel} →
          </Link>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | string[] }): ReactNode {
  return (
    <div className="grid gap-1 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[14px] leading-6 text-slate-500">{label}</dt>
      <dd className="ops-body text-[15px] leading-7 text-slate-100">
        {Array.isArray(value) ? (
          <ul className="space-y-1.5">
            {value.map((v) => (
              <li key={v} className="flex gap-2.5">
                <span className="mt-[0.55rem] h-1 w-1 flex-shrink-0 rounded-full bg-accent-amber" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
