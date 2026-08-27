import Link from "next/link";

import SectionLabel from "@/components/ui/SectionLabel";
import { fetchFilings, resolveTicker, secUserAgent } from "@/lib/filings/edgar";

export const metadata = { title: "Filing reader — Open Portfolio Studio" };

/**
 * The filing reader's entry point.
 *
 * This replaces a concept mock that showed invented lines from an imagined
 * 10-K. Everything here is a real document a company filed, fetched from EDGAR
 * at request time, and every screen carries the filing date and a link to the
 * original so the learner can check it rather than trust us.
 */

const SUGGESTED = [
  { ticker: "NFLX", note: "Streaming, and a subscriber line worth reading" },
  { ticker: "AAPL", note: "Hardware and services in one filing" },
  { ticker: "NVDA", note: "A risk-factor section longer than most annual reports" },
  { ticker: "KO", note: "A century-old business explaining itself" },
];

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">{children}</div>
  );
}

export default async function FilingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const { ticker } = await searchParams;
  const symbol = ticker?.trim().toUpperCase() ?? "";
  const configured = secUserAgent() !== null;

  const lookup = symbol && configured ? await resolveTicker(symbol) : null;
  const filings =
    lookup?.ok === true ? await fetchFilings(lookup.company.cik) : null;

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionLabel index="04" eyebrow="Filing reader" tone="amber" />
        <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Read what the company actually filed.
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-slate-300">
          Annual and quarterly reports, pulled from the SEC and split into the
          sections an investor reads: the business, the risks management is
          required to admit, what they say about their own results, and the
          audited numbers underneath.
        </p>

        <form action="/filings" method="get" className="mt-10 flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="ticker">
            Ticker symbol
          </label>
          <input
            id="ticker"
            name="ticker"
            defaultValue={symbol}
            placeholder="Ticker — NFLX, AAPL, KO"
            autoComplete="off"
            className="min-h-11 w-full max-w-xs rounded-full border border-white/15 bg-white/[0.03] px-5 text-[15px] text-white placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
          />
          <button
            type="submit"
            className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-6 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20"
          >
            Find filings
          </button>
        </form>

        {!configured ? (
          <div className="mt-8">
            <Panel>
              <h2 className="ops-body-strong text-[16px] text-white">
                This reader is not connected yet
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-slate-300">
                Filings come straight from EDGAR, and the SEC requires every
                automated request to identify its sender with a contact address.
                Until <code className="text-accent-amber">OPS_SEC_CONTACT</code>{" "}
                is set, this page will not fetch anything — rather than send
                unidentified requests, which is what that policy exists to
                prevent.
              </p>
            </Panel>
          </div>
        ) : null}

        {configured && !symbol ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SUGGESTED.map((s) => (
              <Link
                key={s.ticker}
                href={`/filings?ticker=${s.ticker}`}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-accent-amber/40"
              >
                <div className="ops-body-strong text-[16px] text-white">{s.ticker}</div>
                <div className="mt-1 text-[14px] leading-6 text-slate-400">{s.note}</div>
              </Link>
            ))}
          </div>
        ) : null}

        {lookup && lookup.ok === false ? (
          <div className="mt-8">
            <Panel>
              <h2 className="ops-body-strong text-[16px] text-white">
                Nothing to open
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-slate-300">{lookup.message}</p>
            </Panel>
          </div>
        ) : null}

        {lookup?.ok === true && filings ? (
          <div className="mt-10">
            <div className="ops-caption text-[12px] text-accent-amber">
              {lookup.company.ticker} · CIK {lookup.company.cik}
            </div>
            <h2 className="ops-section-title mt-2 text-2xl">
              {filings.ok ? filings.name || lookup.company.name : lookup.company.name}
            </h2>

            {filings.ok === false ? (
              <div className="mt-4">
                <Panel>
                  <p className="text-[15px] leading-7 text-slate-300">{filings.message}</p>
                </Panel>
              </div>
            ) : filings.filings.length === 0 ? (
              <div className="mt-4">
                <Panel>
                  <p className="text-[15px] leading-7 text-slate-300">
                    This company has filed with EDGAR, but not an annual or
                    quarterly report this reader can section.
                  </p>
                </Panel>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/8 rounded-2xl border border-white/10">
                {filings.filings.map((f) => (
                  <li key={f.accession}>
                    <Link
                      href={`/filings/${lookup.company.cik}/${f.accession}?doc=${encodeURIComponent(f.primaryDocument)}&ticker=${lookup.company.ticker}`}
                      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="ops-body-strong w-16 text-[15px] text-accent-amber">
                        {f.form}
                      </span>
                      <span className="text-[15px] text-white">
                        Filed {f.filingDate}
                      </span>
                      {f.reportDate ? (
                        <span className="text-[14px] text-slate-400">
                          for the period ending {f.reportDate}
                        </span>
                      ) : null}
                      <span className="ml-auto text-[13px] text-slate-500">
                        {f.accession}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <p className="mt-10 text-[13px] leading-6 text-slate-500">
          Documents are fetched from the SEC and cached. Educational material,
          not investment advice, and nothing here is a recommendation to buy or
          sell anything.
        </p>
      </div>
    </div>
  );
}
