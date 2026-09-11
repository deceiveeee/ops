import type { Metadata } from "next";
import Link from "next/link";
import { Notice, Panel, StageHeading } from "@/components/studio/shared";
import { fetchFilings, resolveTicker, secUserAgent } from "@/lib/filings/edgar";

export const metadata: Metadata = {
  title: "Company reports · Studio — Investing Studio",
  description:
    "Find a company's annual and quarterly reports, pulled from the SEC and split into the sections an investor reads.",
};

/**
 * Company reports, inside Research.
 *
 * Moved here from /filings on 2026-09-10, so a learner reading a report stays
 * in the workspace: the same portfolio, the same sections, and the way back to
 * the investigation one click away. Everything is still a real document fetched
 * from EDGAR when it is asked for, with its filing date and a link to the
 * original, so the learner can check it rather than trust us.
 */

const SUGGESTED = [
  { ticker: "NFLX", note: "Streaming, and a subscriber line worth reading" },
  { ticker: "AAPL", note: "Hardware and services in one filing" },
  { ticker: "NVDA", note: "A risk-factor section longer than most annual reports" },
  { ticker: "KO", note: "A century-old business explaining itself" },
];

/** The SEC's form names, said plainly once, with the form kept for anyone checking. */
const KIND: Record<string, string> = {
  "10-K": "Annual report",
  "10-K/A": "Annual report, amended",
  "10-Q": "Quarterly report",
  "10-Q/A": "Quarterly report, amended",
  "20-F": "Annual report",
  "40-F": "Annual report",
};

export default async function CompanyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const { ticker } = await searchParams;
  const symbol = ticker?.trim().toUpperCase() ?? "";
  const configured = secUserAgent() !== null;

  const lookup = symbol && configured ? await resolveTicker(symbol) : null;
  const filings = lookup?.ok === true ? await fetchFilings(lookup.company.cik) : null;

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-[13px] text-slate-500">
        <Link href="/studio/research" className="text-accent-cyan hover:underline">
          Research
        </Link>
        <span aria-hidden="true"> › </span>
        <span>Company reports</span>
      </nav>

      <StageHeading as="h1" title="Read what a company actually filed">
        Annual and quarterly reports from the SEC, split into the sections an investor reads: the business,
        the risks, management&apos;s account of the results, and the audited numbers.
      </StageHeading>

      <form action="/studio/filings" method="get" className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="ops-caption text-[11px] text-slate-500">Ticker symbol</span>
          <input
            name="ticker"
            defaultValue={symbol}
            placeholder="NFLX, AAPL, KO"
            autoComplete="off"
            className="mt-1 block min-h-11 w-44 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[15px] text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-lg bg-[var(--ops-accent-strong)] px-4 text-[14px] font-semibold text-[#ffffff] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
        >
          Find reports
        </button>
      </form>

      {!configured ? (
        <Notice tone="slate" title="Reports cannot be fetched yet">
          Reports come straight from the SEC, which asks every automated request to name a contact
          address. Until this site is given one, it fetches nothing rather than send unnamed requests.
        </Notice>
      ) : null}

      {configured && !symbol ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {SUGGESTED.map((suggestion) => (
            <Link
              key={suggestion.ticker}
              href={`/studio/filings?ticker=${suggestion.ticker}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-accent-cyan/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
            >
              <div className="text-[15px] font-semibold text-white">{suggestion.ticker}</div>
              <div className="mt-1 text-[13px] leading-5 text-slate-400">{suggestion.note}</div>
            </Link>
          ))}
        </div>
      ) : null}

      {lookup && lookup.ok === false ? (
        <Notice tone="slate" title="Nothing to open">
          {lookup.message}
        </Notice>
      ) : null}

      {lookup?.ok === true && filings ? (
        <Panel>
          <div className="text-[12px] text-slate-500">
            {lookup.company.ticker} · SEC company number {lookup.company.cik}
          </div>
          <h2 className="mt-1 text-[18px] font-semibold text-white">
            {filings.ok ? filings.name || lookup.company.name : lookup.company.name}
          </h2>

          {filings.ok === false ? (
            <p className="mt-3 text-[14px] leading-6 text-slate-300">{filings.message}</p>
          ) : filings.filings.length === 0 ? (
            <p className="mt-3 text-[14px] leading-6 text-slate-300">
              This company files with the SEC, but not an annual or quarterly report this reader can open.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-white/8">
              {filings.filings.map((filing) => (
                <li key={filing.accession}>
                  <Link
                    href={`/studio/filings/${lookup.company.cik}/${filing.accession}?doc=${encodeURIComponent(filing.primaryDocument)}&ticker=${lookup.company.ticker}`}
                    className="flex min-h-11 flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2 text-[14px] transition-colors hover:text-accent-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
                  >
                    <span className="font-semibold text-white">
                      {KIND[filing.form] ?? "Report"} <span className="font-normal text-slate-500">({filing.form})</span>
                    </span>
                    <span className="text-slate-300">filed {filing.filingDate}</span>
                    {filing.reportDate ? (
                      <span className="text-slate-500">for the period ending {filing.reportDate}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}

      <p className="text-[12px] leading-5 text-slate-500">
        Reports are fetched from the SEC when you open them, and each one links to the original.
      </p>
    </div>
  );
}
