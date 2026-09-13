import type { Metadata } from "next";
import Link from "next/link";
import FilingPassages, { type PageParagraph } from "@/components/studio/FilingPassages";
import { Notice, Panel, StageHeading } from "@/components/studio/shared";
import StudioAside from "@/components/studio/workspace/StudioAside";
import { CONTEXT_CHARS } from "@/lib/filings/anchor";
import { fetchFilingDocument, fetchFilings, filingIndexUrl, secUserAgent } from "@/lib/filings/edgar";
import { findInSections } from "@/lib/filings/find";
import { pageForOffset, paginate, paragraphsOf } from "@/lib/filings/pages";
import { extractFilingSections } from "@/lib/filings/sections";

export const metadata: Metadata = {
  title: "Company report · Studio — Investing Studio",
  description: "One company report from the SEC, a page at a time, searchable, with passages you can keep.",
};

/**
 * One company report, whole, a page at a time.
 *
 * Until 2026-09-13 each section here was an excerpt of 2,600 characters with a
 * link to sec.gov for the rest. Atkore's management's discussion alone is
 * 61,130 characters, and its first mention of PVC resin — the input whose price
 * moves its margins — sits 8,274 characters into the business section, where no
 * excerpt reached. Testing that explanation meant leaving Studio.
 *
 * Now every section is readable in full, in pages that each fit the screen
 * budget; the report can be searched for a phrase, with every hit linking to
 * the page it is on; and any paragraph, or any words selected in one, can be
 * kept as evidence in the learner's investigation of the company.
 *
 * Every position here — a page, a search hit, a kept passage — is an offset in
 * the section's own text, so all three mean the same place.
 */

/** Search hits shown at once. Eight fit the screen budget with their context. */
const HITS_PER_VIEW = 8;

/** How keeping works, said once beside the reading rather than under every page. */
const KEEP_HOW = "Keep saves a paragraph to your investigation of this company. Select some words in it first to keep just those.";

/** The shapes EDGAR's own identifiers take. Anything else is not a filing to fetch. */
const CIK = /^\d{1,10}$/;
const ACCESSION = /^\d{10}-\d{2}-\d{6}$/;
const DOCUMENT = /^[A-Za-z0-9._-]{1,200}$/;

const KIND: Record<string, string> = {
  "10-K": "annual report",
  "10-K/A": "amended annual report",
  "10-Q": "quarterly report",
  "10-Q/A": "amended quarterly report",
  "20-F": "annual report",
  "40-F": "annual report",
};

/** What reopening a kept passage found, when it is not simply where it was left. */
const MOVED: Record<string, string> = {
  context: "This passage has moved since you kept it. It is shown where the same words now sit, with the same text around them.",
  quote: "This passage has moved since you kept it, and the text around it has changed. It is shown where the same words now appear.",
  loose: "This passage was found ignoring differences in spacing and capitals, so check it reads the way you remember.",
};

const int = (raw: string | undefined): number | null => {
  if (raw === undefined || !/^\d{1,7}$/.test(raw)) return null;
  return Number.parseInt(raw, 10);
};

export default async function CompanyReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ cik: string; accession: string }>;
  searchParams: Promise<{
    doc?: string;
    ticker?: string;
    section?: string;
    page?: string;
    q?: string;
    r?: string;
    at?: string;
    len?: string;
    moved?: string;
  }>;
}) {
  const { cik, accession } = await params;
  const query = await searchParams;
  const { doc, ticker, section: wanted } = query;
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

  if (!doc || !DOCUMENT.test(doc) || !CIK.test(cik) || !ACCESSION.test(accession)) {
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
  const companyName = (list.ok ? list.name : "") || ticker || "Company";
  const kind = filing ? KIND[filing.form] ?? "report" : "report";
  const current = sections.find((section) => section.id === wanted) ?? sections[0];

  /** A link to somewhere in this same report, keeping which document and ticker. */
  const hrefFor = (extra: Record<string, string | number | undefined>, hash = "") => {
    const search = new URLSearchParams({ doc });
    if (ticker) search.set("ticker", ticker);
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== "") search.set(key, String(value));
    }
    return `?${search.toString()}${hash}`;
  };

  const facts = [
    filing ? `Filed ${filing.filingDate}${filing.reportDate ? ` for the period ending ${filing.reportDate}` : ""}` : null,
    `SEC reference ${accession}`,
    `${plainTextLength.toLocaleString("en-US")} characters`,
  ].filter(Boolean);

  const searching = (query.q ?? "").trim();

  return (
    <Shell
      title={`${ticker || companyName} ${kind}`}
      subtitle={facts.join(" · ")}
      back={back}
      ticker={ticker}
      sourceUrl={sourceUrl}
      side={sections.length ? <FindForm doc={doc} ticker={ticker} query={searching} /> : null}
    >
      {sections.length === 0 ? (
        <Notice tone="slate">
          This report does not follow the layout this reader knows, so rather than guess where the
          sections begin, read it at the SEC.
        </Notice>
      ) : (
        <>
          {searching ? (
            <Results
              sections={sections}
              query={searching}
              view={int(query.r) ?? 1}
              hrefFor={hrefFor}
            />
          ) : current ? (
            <SectionView
              section={current}
              sections={sections}
              filing={{
                cik,
                accession,
                document: doc,
                form: filing?.form ?? "",
                filed: filing?.filingDate ?? "",
                sectionId: current.id,
                companyName,
                sic: list.ok ? list.sic : "",
              }}
              requestedPage={int(query.page)}
              at={int(query.at)}
              length={int(query.len)}
              moved={query.moved && MOVED[query.moved] ? MOVED[query.moved] : null}
              hrefFor={hrefFor}
            />
          ) : null}
        </>
      )}

      {missing.length > 0 && !searching ? (
        <p className="text-[13px] leading-6 text-slate-500">
          Not found in this report: {missing.map((section) => section.label).join(", ")}. Companies lay out
          their reports differently, and this reader would rather say it could not find a section than
          show you the wrong one.
        </p>
      ) : null}
    </Shell>
  );
}

type Sections = ReturnType<typeof extractFilingSections>["sections"];
type HrefFor = (extra: Record<string, string | number | undefined>, hash?: string) => string;

function SectionTabs({ sections, current, hrefFor }: { sections: Sections; current: string; hrefFor: HrefFor }) {
  return (
    // One row that scrolls sideways rather than wrapping: at 1440 the seven
    // labels wrapped to two rows, 43px of a page held to 1,350.
    <nav aria-label="Sections of this report" className="overflow-x-auto border-b border-[var(--ops-divider)]">
      <ul className="flex gap-x-5">
        {sections.map((section) => {
          const active = section.id === current;
          return (
            <li key={section.id} className="shrink-0">
              <Link
                href={hrefFor({ section: section.id })}
                aria-current={active ? "page" : undefined}
                className={
                  "inline-flex min-h-11 items-center whitespace-nowrap border-b-2 text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)] " +
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
  );
}

function SectionView({
  section,
  sections,
  filing,
  requestedPage,
  at,
  length,
  moved,
  hrefFor,
}: {
  section: Sections[number];
  sections: Sections;
  filing: React.ComponentProps<typeof FilingPassages>["filing"];
  requestedPage: number | null;
  at: number | null;
  length: number | null;
  moved: string | null;
  hrefFor: HrefFor;
}) {
  const heading = paragraphsOf(section.text)[0]?.text ?? section.label;
  const pages = paginate(section.text);
  // A link to a place wins over a page number: the place is what was asked for.
  const number = at !== null
    ? pageForOffset(pages, at)
    : Math.min(Math.max(requestedPage ?? 1, 1), Math.max(pages.length, 1));
  const page = pages[number - 1];
  const highlight = at !== null && length !== null && length > 0 ? { start: at, end: at + length } : null;

  const paragraphs: PageParagraph[] = (page?.paragraphs ?? []).map((paragraph) => ({
    ...paragraph,
    before: section.text.slice(Math.max(0, paragraph.start - CONTEXT_CHARS), paragraph.start),
    after: section.text.slice(paragraph.end, paragraph.end + CONTEXT_CHARS),
  }));

  return (
    <>
      <SectionTabs sections={sections} current={section.id} hrefFor={hrefFor} />

      <section aria-labelledby={`section-${section.id}`} className="space-y-3">
        <h2 id={`section-${section.id}`} className="text-[17px] font-semibold text-white">
          {heading}
        </h2>

        {/* What to look for is guidance, so it sits beside the reading on wide screens. */}
        <StudioAside
          inline={
            <p className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-[14px] leading-6 text-slate-300">
              <span className="font-semibold text-white">What to look for. </span>
              {section.lens} <span className="text-slate-400">{KEEP_HOW}</span>
            </p>
          }
          beside={
            <Panel>
              <h2 className="text-[14px] font-semibold text-white">What to look for in {section.label}</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{section.lens}</p>
              <h2 className="mt-4 text-[14px] font-semibold text-white">Keeping a passage</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{KEEP_HOW}</p>
            </Panel>
          }
        />

        {moved ? (
          <p role="status" className="rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-3 text-[13px] leading-6 text-slate-300">
            {moved}
          </p>
        ) : null}

        {paragraphs.length ? (
          <FilingPassages filing={filing} paragraphs={paragraphs} highlight={highlight} />
        ) : (
          <p className="text-[14px] leading-6 text-slate-400">This section is only its heading.</p>
        )}

        {pages.length > 1 ? (
          <nav aria-label="Pages of this section" className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-[14px]">
            {number > 1 ? (
              <Link href={hrefFor({ section: section.id, page: number - 1 })} rel="prev" className="inline-flex min-h-11 items-center font-semibold text-accent-cyan hover:underline">
                ← Previous page
              </Link>
            ) : (
              <span />
            )}
            <span className="text-slate-400">
              Page {number} of {pages.length}
            </span>
            {number < pages.length ? (
              <Link href={hrefFor({ section: section.id, page: number + 1 })} rel="next" className="inline-flex min-h-11 items-center font-semibold text-accent-cyan hover:underline">
                Next page →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

      </section>
    </>
  );
}

function Results({
  sections,
  query,
  view,
  hrefFor,
}: {
  sections: Sections;
  query: string;
  view: number;
  hrefFor: HrefFor;
}) {
  const found = findInSections(sections, query);
  if (!found.ok) return <Notice tone="slate">{found.reason}</Notice>;

  const views = Math.max(1, Math.ceil(found.hits.length / HITS_PER_VIEW));
  const shown = Math.min(Math.max(view, 1), views);
  const hits = found.hits.slice((shown - 1) * HITS_PER_VIEW, shown * HITS_PER_VIEW);

  return (
    <section aria-labelledby="find-results" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="find-results" className="text-[17px] font-semibold text-white">
          {found.total === 0
            ? `Nothing in this report mentions “${found.query}”`
            : `${found.total} ${found.total === 1 ? "place mentions" : "places mention"} “${found.query}”`}
        </h2>
        <Link href={hrefFor({})} className="text-[14px] text-accent-cyan hover:underline">
          Back to reading
        </Link>
      </div>
      <p className="text-[12px] leading-5 text-slate-500">
        Searched the {sections.length} sections this reader shows, ignoring capitals and spacing.
        {found.total > found.hits.length ? ` Listing the first ${found.hits.length}; a narrower phrase finds fewer.` : ""}
      </p>

      {hits.length ? (
        <ol className="divide-y divide-white/8 border-y border-white/8">
          {hits.map((hit) => (
            <li key={`${hit.sectionId}-${hit.offset}`}>
              <Link
                href={hrefFor({ section: hit.sectionId, at: hit.offset, len: hit.length }, "#passage")}
                className="block py-3 transition-colors hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
              >
                <span className="block text-[12px] text-slate-500">
                  {hit.sectionLabel} · page {hit.page}
                </span>
                <span className="mt-0.5 block max-w-[80ch] text-[14px] leading-6 text-slate-300">
                  …{hit.before}
                  <mark className="rounded bg-accent-amber/25 px-0.5 text-white">{hit.match}</mark>
                  {hit.after}…
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : null}

      {views > 1 ? (
        <nav aria-label="More places it is mentioned" className="flex items-center justify-between gap-3 text-[14px]">
          {shown > 1 ? (
            <Link href={hrefFor({ q: query, r: shown - 1 })} className="inline-flex min-h-11 items-center font-semibold text-accent-cyan hover:underline">
              ← Earlier
            </Link>
          ) : (
            <span />
          )}
          <span className="text-slate-400">
            {(shown - 1) * HITS_PER_VIEW + 1}–{(shown - 1) * HITS_PER_VIEW + hits.length} of {found.hits.length}
          </span>
          {shown < views ? (
            <Link href={hrefFor({ q: query, r: shown + 1 })} className="inline-flex min-h-11 items-center font-semibold text-accent-cyan hover:underline">
              Later →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </section>
  );
}

/**
 * Search, beside the heading on a wide screen and under it on a narrow one.
 *
 * It sits up here because in a document this long it is how a learner reaches
 * a passage: paging through risk factors for one mention would be the old
 * excerpt problem with more clicks.
 */
function FindForm({ doc, ticker, query }: { doc: string; ticker?: string; query: string }) {
  return (
    <form method="get" role="search" className="flex shrink-0 items-end gap-2">
      <input type="hidden" name="doc" value={doc} />
      {ticker ? <input type="hidden" name="ticker" value={ticker} /> : null}
      <label className="block">
        <span className="block text-[12px] text-slate-500">Find in this report</span>
        <input
          name="q"
          defaultValue={query}
          placeholder="PVC resin, supplier, lease"
          autoComplete="off"
          className="mt-1 block min-h-11 w-60 max-w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[14px] text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 text-[14px] font-semibold text-white transition-colors hover:border-accent-cyan/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      >
        Find
      </button>
    </form>
  );
}

function Shell({
  title,
  subtitle,
  back,
  ticker,
  sourceUrl,
  side,
  children,
}: {
  title: string;
  subtitle?: string;
  back: string;
  ticker?: string;
  sourceUrl: string;
  side?: React.ReactNode;
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

      {/*
        * Heading and search share a row from 1024px, with the facts line wrapping
        * inside its own column. Left free to wrap, that long line pushed the search
        * box underneath and the block measured 170px at 1440, which is what put two
        * report pages over the screen budget (2026-09-13).
        */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 lg:flex-nowrap">
        <div className="min-w-0 flex-1">
          <StageHeading as="h1" title={title} />
          <p className="mt-2 text-[13px] leading-6 text-slate-500">
            {subtitle ? `${subtitle} · ` : "Filed with the SEC · "}
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
        {side}
      </div>

      {children}
    </div>
  );
}
