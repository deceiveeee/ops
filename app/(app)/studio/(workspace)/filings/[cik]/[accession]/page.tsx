import type { Metadata } from "next";
import Link from "next/link";
import { Notice, Panel, StageHeading } from "@/components/studio/shared";
import StudioAside from "@/components/studio/workspace/StudioAside";
import { fetchFilingDocument, fetchFilings, filingIndexUrl, secUserAgent } from "@/lib/filings/edgar";
import { extractFilingSections } from "@/lib/filings/sections";

export const metadata: Metadata = {
  title: "Company report · Studio — Investing Studio",
  description: "One company report from the SEC, a section at a time, with what to look for in each.",
};

/**
 * One company report, a section at a time.
 *
 * A 10-K runs to hundreds of thousands of words. Before the move into Studio
 * every section was stacked on one page, nine screens tall; here one section is
 * open at a time, with the others a click away, so the page stays within the
 * workspace's screen budget. Each section is still an excerpt with a link to
 * the whole filing at the SEC: the point is to teach where to look and what the
 * section is for, not to reproduce EDGAR.
 */

const EXCERPT_CHARS = 2_600;
/** Shown before "Keep reading", so one section fits the screen budget. */
const FIRST_CHARS = 900;

const KIND: Record<string, string> = {
  "10-K": "annual report",
  "10-K/A": "amended annual report",
  "10-Q": "quarterly report",
  "10-Q/A": "amended quarterly report",
  "20-F": "annual report",
  "40-F": "annual report",
};

function paragraphs(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default async function CompanyReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ cik: string; accession: string }>;
  searchParams: Promise<{ doc?: string; ticker?: string; section?: string }>;
}) {
  const { cik, accession } = await params;
  const { doc, ticker, section: wanted } = await searchParams;
  const sourceUrl = filingIndexUrl(cik, accession);
  const back = ticker ? `/studio/filings?ticker=${encodeURIComponent(ticker)}` : "/studio/filings";

  if (secUserAgent() === null) {
    return (
      <Shell title="Reports cannot be fetched yet" back={back} ticker={ticker} sourceUrl={sourceUrl}>
        <Notice tone="slate">
          Reports come straight from the SEC, which asks every automated request to name a contact
          address. Until this site is given one, it fetches nothing.
        </Notice>
      </Shell>
    );
  }

  if (!doc) {
    return (
      <Shell title="Which document?" back={back} ticker={ticker} sourceUrl={sourceUrl}>
        <Notice tone="slate">
          A filing can hold many documents, so this reader needs to be told which one to open. Choose
          the report again from the list.
        </Notice>
      </Shell>
    );
  }

  const fetched = await fetchFilingDocument(cik, accession, doc);
  if (!fetched.ok) {
    return (
      <Shell title="That report could not be opened" back={back} ticker={ticker} sourceUrl={sourceUrl}>
        <Notice tone="slate">{fetched.message}</Notice>
      </Shell>
    );
  }

  const { sections, missing, plainTextLength } = extractFilingSections(fetched.html);
  // What the filing is and when it was filed, from the company's own filing list,
  // so the page can say it plainly. Older filings fall outside that list.
  const list = await fetchFilings(cik);
  const filing = list.ok ? list.filings.find((entry) => entry.accession === accession) : undefined;
  const name = ticker || (list.ok ? list.name : "") || "Company";
  const kind = filing ? KIND[filing.form] ?? "report" : "report";
  const current = sections.find((section) => section.id === wanted) ?? sections[0];

  const facts = [
    filing ? `Filed ${filing.filingDate}${filing.reportDate ? ` for the period ending ${filing.reportDate}` : ""}` : null,
    `SEC reference ${accession}`,
    `${plainTextLength.toLocaleString("en-US")} characters in ${sections.length} sections`,
  ].filter(Boolean);

  return (
    <Shell
      title={`${name} ${kind}`}
      subtitle={facts.join(" · ")}
      back={back}
      ticker={ticker}
      sourceUrl={sourceUrl}
    >
      {sections.length === 0 ? (
        <Notice tone="slate">
          This report does not follow the layout this reader knows, so rather than guess where the
          sections begin, read it at the SEC.
        </Notice>
      ) : (
        <>
          <nav aria-label="Sections of this report">
            <ul className="flex flex-wrap gap-x-5 border-b border-[var(--ops-divider)]">
              {sections.map((section) => {
                const active = section.id === current?.id;
                return (
                  <li key={section.id}>
                    <Link
                      href={`?doc=${encodeURIComponent(doc)}${ticker ? `&ticker=${encodeURIComponent(ticker)}` : ""}&section=${section.id}`}
                      aria-current={active ? "page" : undefined}
                      scroll={false}
                      className={
                        "-mb-px inline-flex min-h-11 items-center whitespace-nowrap border-b-2 text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)] " +
                        (active
                          ? "border-[var(--ops-accent-strong)] font-semibold text-[var(--ops-accent-strong)]"
                          : "border-transparent text-[var(--ops-text-secondary)] hover:text-[var(--ops-text-primary)]")
                      }
                    >
                      {section.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {current ? <SectionView section={current} sourceUrl={sourceUrl} /> : null}
        </>
      )}

      {missing.length > 0 ? (
        <p className="text-[13px] leading-6 text-slate-500">
          Not found in this report: {missing.map((section) => section.label).join(", ")}. Companies lay out
          their reports differently, and this reader would rather say it could not find a section than
          show you the wrong one.
        </p>
      ) : null}
    </Shell>
  );
}

function SectionView({
  section,
  sourceUrl,
}: {
  section: ReturnType<typeof extractFilingSections>["sections"][number];
  sourceUrl: string;
}) {
  const lines = paragraphs(section.text);
  const heading = lines[0] ?? section.label;
  const rest = lines.slice(1);
  // The opening runs to about nine hundred characters; the rest of the excerpt
  // waits behind "Keep reading", which is the learner's choice to spend more screen.
  let used = 0;
  const first: string[] = [];
  const more: string[] = [];
  for (const line of rest) {
    if (used > EXCERPT_CHARS) break;
    // A paragraph that would take the opening past its budget waits behind
    // "Keep reading" instead, and once anything is behind it the rest follows.
    // The first paragraph is always shown, however long it runs.
    const opens = more.length === 0 && (first.length === 0 || used + line.length <= FIRST_CHARS);
    (opens ? first : more).push(line);
    used += line.length;
  }
  const truncated = first.length + more.length < rest.length;

  return (
    <section aria-labelledby={`section-${section.id}`} className="space-y-3">
      <h2 id={`section-${section.id}`} className="text-[17px] font-semibold text-white">
        {heading}
      </h2>

      {/* What to look for is guidance, so it sits beside the reading on wide screens. */}
      <StudioAside
        inline={
          <p className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-[14px] leading-6 text-slate-300">
            <span className="font-semibold text-white">What to look for. </span>
            {section.lens}
          </p>
        }
        beside={
          <Panel>
            <h2 className="text-[14px] font-semibold text-white">What to look for in {section.label}</h2>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">{section.lens}</p>
          </Panel>
        }
      />

      <div className="space-y-3">
        {first.map((line, index) => (
          <p key={index} className="max-w-[68ch] text-[15px] leading-7 text-slate-200">
            {line}
          </p>
        ))}
      </div>

      {more.length > 0 ? (
        <details>
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-[14px] font-semibold text-accent-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
            Keep reading this section
          </summary>
          <div className="mt-2 space-y-3">
            {more.map((line, index) => (
              <p key={index} className="max-w-[68ch] text-[15px] leading-7 text-slate-200">
                {line}
              </p>
            ))}
          </div>
        </details>
      ) : null}

      {truncated ? (
        <p className="text-[13px] leading-6 text-slate-500">
          An excerpt: this section runs to {section.text.length.toLocaleString("en-US")} characters.{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent-cyan underline underline-offset-2"
          >
            Read the whole report at the SEC
          </a>
          .
        </p>
      ) : null}
    </section>
  );
}

function Shell({
  title,
  subtitle,
  back,
  ticker,
  sourceUrl,
  children,
}: {
  title: string;
  subtitle?: string;
  back: string;
  ticker?: string;
  sourceUrl: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-[13px] text-slate-500">
        <Link href="/studio/research" className="text-accent-cyan hover:underline">
          Research
        </Link>
        <span aria-hidden="true"> › </span>
        <Link href={back} className="text-accent-cyan hover:underline">
          Company reports
        </Link>
        {ticker ? (
          <>
            <span aria-hidden="true"> › </span>
            <span>{ticker}</span>
          </>
        ) : null}
      </nav>

      <div>
        <StageHeading as="h1" title={title} />
        {subtitle ? <p className="mt-2 text-[13px] leading-6 text-slate-500">{subtitle}</p> : null}
        <p className="mt-1 text-[13px] leading-6 text-slate-500">
          Filed with the SEC ·{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent-cyan underline underline-offset-2"
          >
            open the original
          </a>
        </p>
      </div>

      {children}
    </div>
  );
}
