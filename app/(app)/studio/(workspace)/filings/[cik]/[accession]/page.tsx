import type { Metadata } from "next";
import Link from "next/link";
import FilingPassages, { type PageParagraph } from "@/components/studio/FilingPassages";
import { Notice, Panel, StageHeading } from "@/components/studio/shared";
import StudioAside from "@/components/studio/workspace/StudioAside";
import { CONTEXT_CHARS } from "@/lib/filings/anchor";
import { archivePath, fetchCompanyTickers, fetchFilingDocument, fetchFilings, filingIndexUrl, secUserAgent } from "@/lib/filings/edgar";
import { renderTableRows, renderText, type FilingDocument } from "@/lib/filings/document";
import { findInSections } from "@/lib/filings/find";
import { KEEP_SLOT } from "@/lib/filings/keep-slot";
import { isHeadingBlock, isSubheading, pageForOffset, sectionHeading, sectionPages } from "@/lib/filings/pages";
import { readFiling } from "@/lib/filings/reading";
import { revenueFromFiling } from "@/lib/filings/revenue-source";
import type { SectionResult } from "@/lib/filings/sections";
import RevenueView from "@/components/studio/RevenueView";
import CompetitorsView from "@/components/studio/CompetitorsView";
import InputCostsView from "@/components/studio/InputCostsView";
import PeersView from "@/components/studio/PeersView";
import WorthView from "@/components/studio/WorthView";
import { filerIndex, suggestCompetitors } from "@/lib/filings/competitors";
import libraryData from "@/lib/studio-project/data/input-cost-library.json";
import { fiscalYearFor, suggestInputs, type InputCostLibrary } from "@/lib/studio-project/input-costs";

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

/**
 * The report's own figures for what the Business section describes: product lines, regions,
 * segments and customers. Only annual reports cover a year of revenue, so only they offer it.
 */
const REVENUE_TAB = { id: "revenue", label: "Where revenue comes from" };
const ANNUAL_FORMS = new Set(["10-K", "10-K/A"]);

/**
 * Who the report says the company competes with, read from its own words and matched to the SEC's
 * list of companies, for the learner to count. Offered on every annual report.
 */
const COMPETITORS_TAB = { id: "competitors", label: "Competitors" };
/**
 * What the inputs a report mentions have cost, from Studio's checked library of price indexes, each
 * linked by the learner through a sentence showing the company buys it. Offered on every annual report.
 */
const PEERS_TAB = { id: "side-by-side", label: "Side by side" };
const WORTH_TAB = { id: "worth", label: "What a price assumes" };
const INPUTS_TAB = { id: "inputs", label: "Input costs" };
const LIBRARY = libraryData as unknown as InputCostLibrary;
/** Where a report says what it buys and what its costs did; the financial statements only tabulate. */
const INPUT_SECTIONS = new Set(["business", "risk-factors", "mdna", "market-risk"]);

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

  // What the filing is and when it was filed, from the company's own filing list,
  // so the page can say it plainly. Older filings fall outside that list, and
  // then the document itself says whether it is a quarterly report.
  const list = await fetchFilings(cik);
  const filing = list.ok ? list.filings.find((entry) => entry.accession === accession) : undefined;
  const { sections, missing, plainTextLength, document } = readFiling({ cik, accession, document: doc }, fetched.html, filing?.form);
  const companyName = (list.ok ? list.name : "") || ticker || "Company";
  const kind = filing ? KIND[filing.form] ?? "report" : "report";
  // A quarterly report has no Business section and opens with its statements, so
  // without a section asked for it opens on management's account of the quarter.
  const current = sections.find((section) => section.id === wanted)
    ?? sections.find((section) => section.id === "business" || section.id === "mdna")
    ?? sections[0];
  const annual = Boolean(filing && ANNUAL_FORMS.has(filing.form));
  const extraTabs = annual ? [REVENUE_TAB, COMPETITORS_TAB, PEERS_TAB, WORTH_TAB, INPUTS_TAB] : [];
  const revenue = annual && wanted === REVENUE_TAB.id ? await revenueFromFiling(cik, accession, doc) : null;
  const business = sections.find((section) => section.id === "business");
  // EDGAR's ticker file is fetched only for the tab that matches names against it.
  const tickerFile = annual && wanted === COMPETITORS_TAB.id ? await fetchCompanyTickers() : null;
  const competitors = tickerFile
    ? business
      ? suggestCompetitors(business, tickerFile.ok ? filerIndex(tickerFile.json) : new Map(), { cik, name: companyName })
      : { passages: [], suggestions: [] }
    : null;

  /** A link to somewhere in this same report, keeping which document and ticker. */
  const hrefFor = (extra: Record<string, string | number | undefined>, hash = "") => {
    const search = new URLSearchParams({ doc });
    if (ticker) search.set("ticker", ticker);
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== "") search.set(key, String(value));
    }
    return `?${search.toString()}${hash}`;
  };

  /** This report, as the tabs that keep passages from it need it. */
  const reportRef = {
    cik,
    accession,
    document: doc,
    form: filing?.form ?? "",
    filed: filing?.filingDate ?? "",
    companyName,
    sic: list.ok ? list.sic : "",
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
              document={document}
              query={searching}
              view={int(query.r) ?? 1}
              hrefFor={hrefFor}
            />
          ) : revenue ? (
            <RevenueView
              name={companyName}
              source={revenue}
              dataFileUrl={revenue.dataFile ? archivePath(cik, accession, revenue.dataFile) : null}
              tabs={<SectionTabs sections={sections} extraTabs={extraTabs} current={REVENUE_TAB.id} hrefFor={hrefFor} />}
            />
          ) : competitors ? (
            <CompetitorsView
              filing={reportRef}
              readerQuery={hrefFor({})}
              businessFound={Boolean(business)}
              passages={competitors.passages}
              suggestions={competitors.suggestions}
              tickerFile={Boolean(tickerFile?.ok)}
              tabs={<SectionTabs sections={sections} extraTabs={extraTabs} current={COMPETITORS_TAB.id} hrefFor={hrefFor} />}
            />
          ) : annual && wanted === PEERS_TAB.id ? (
            <PeersView
              filing={reportRef}
              competitorsHref={hrefFor({ section: COMPETITORS_TAB.id })}
              tabs={<SectionTabs sections={sections} extraTabs={extraTabs} current={PEERS_TAB.id} hrefFor={hrefFor} />}
            />
          ) : annual && wanted === WORTH_TAB.id ? (
            <WorthView
              filing={reportRef}
              tabs={<SectionTabs sections={sections} extraTabs={extraTabs} current={WORTH_TAB.id} hrefFor={hrefFor} />}
            />
          ) : annual && wanted === INPUTS_TAB.id ? (
            <InputCostsView
              filing={reportRef}
              readerQuery={hrefFor({})}
              fiscal={fiscalYearFor(filing?.reportDate ?? "")}
              suggestions={suggestInputs(sections.filter((section) => INPUT_SECTIONS.has(section.id)), LIBRARY.series)}
              library={LIBRARY.series}
              builtOn={LIBRARY.builtOn}
              tabs={<SectionTabs sections={sections} extraTabs={extraTabs} current={INPUTS_TAB.id} hrefFor={hrefFor} />}
            />
          ) : current ? (
            <SectionView
              section={current}
              sections={sections}
              document={document}
              extraTabs={extraTabs}
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

type Sections = SectionResult["sections"];
type HrefFor = (extra: Record<string, string | number | undefined>, hash?: string) => string;

/**
 * The tabs in order, with any extra ones right after Business, which they
 * complement. At the end of a row that scrolls sideways, a new tab sat out of
 * view at 1440.
 */
function withExtras(sections: Sections, extraTabs: { id: string; label: string }[]) {
  const tabs: { id: string; label: string }[] = sections.map(({ id, label }) => ({ id, label }));
  tabs.splice(tabs.findIndex((tab) => tab.id === "business") + 1, 0, ...extraTabs);
  return tabs;
}

function SectionTabs({
  sections,
  extraTabs,
  current,
  hrefFor,
}: {
  sections: Sections;
  extraTabs: { id: string; label: string }[];
  current: string;
  hrefFor: HrefFor;
}) {
  return (
    // One row that scrolls sideways rather than wrapping: at 1440 the seven
    // labels wrapped to two rows, 43px of a page held to 1,350.
    <nav aria-label="Sections of this report" className="overflow-x-auto border-b border-[var(--ops-divider)]">
      <ul className="flex gap-x-5">
        {withExtras(sections, extraTabs).map((section) => {
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
  document,
  extraTabs,
  filing,
  requestedPage,
  at,
  length,
  moved,
  hrefFor,
}: {
  section: Sections[number];
  sections: Sections;
  document: FilingDocument;
  extraTabs: { id: string; label: string }[];
  filing: React.ComponentProps<typeof FilingPassages>["filing"];
  requestedPage: number | null;
  at: number | null;
  length: number | null;
  moved: string | null;
  hrefFor: HrefFor;
}) {
  const heading = sectionHeading(section, document) ?? section.label;
  const pages = sectionPages(section, document);
  // A link to a place wins over a page number: the place is what was asked for.
  const number = at !== null
    ? pageForOffset(pages, at)
    : Math.min(Math.max(requestedPage ?? 1, 1), Math.max(pages.length, 1));
  const page = pages[number - 1];
  const highlight = at !== null && length !== null && length > 0 ? { start: at, end: at + length } : null;

  // Each item on the page is one of the filing's own blocks, drawn from its own
  // markup: a paragraph, a heading, or the rows of a table that fall on this page.
  const paragraphs: PageParagraph[] = (page?.items ?? []).map((item) => {
    const place = section.blocks[item.block];
    const block = document.blocks[place.index];
    const marked = highlight && highlight.start < item.end && highlight.end > item.start
      ? { from: highlight.start - place.start, to: highlight.end - place.start }
      : null;
    const html = block.kind === "text"
      ? renderText(block, marked, KEEP_SLOT)
      : renderTableRows(block, item.rows?.from ?? 0, item.rows?.to ?? block.rowStarts.length, marked);
    return {
      index: item.block,
      start: item.start,
      end: item.end,
      text: section.text.slice(item.start, item.end),
      before: section.text.slice(Math.max(0, item.start - CONTEXT_CHARS), item.start),
      after: section.text.slice(item.end, item.end + CONTEXT_CHARS),
      kind: block.kind === "table" ? "table" : isHeadingBlock(block) ? "heading" : "text",
      keepable: block.kind === "table" || !isSubheading(block.text),
      align: block.kind === "text" ? block.align : null,
      html,
    };
  });

  return (
    <>
      <SectionTabs sections={sections} extraTabs={extraTabs} current={section.id} hrefFor={hrefFor} />

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
  document,
  query,
  view,
  hrefFor,
}: {
  sections: Sections;
  document: FilingDocument;
  query: string;
  view: number;
  hrefFor: HrefFor;
}) {
  const found = findInSections(sections, query, document);
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
          placeholder="A word or phrase"
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
        * Below 1024px the facts column needs a width of its own before it gives up the
        * row, or at 390 it kept the row and ran one word to a line.
        */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 lg:flex-nowrap">
        <div className="min-w-0 flex-1 basis-72">
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
