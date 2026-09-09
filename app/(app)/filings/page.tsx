import Link from "next/link";

import {
  fetchFilings,
  isAnnual,
  resolveTicker,
  secUserAgent,
  type FilingSummary,
} from "@/lib/filings/edgar";

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
    <div className="rounded-2xl border border-st-hair bg-st-paper p-6">{children}</div>
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
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      {/* Studio's rhythm rather than the marketing pages'. This is somewhere a
          learner works, and eighty pixels above the first word is a cost the
          page pays on every visit. */}
      <div className="relative mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        {/* Studio's own eyebrow rather than `SectionLabel`, whose tones are the
            marketing accents — they are chosen against a dark ground and this
            page no longer has one. No colour class: `.ops-theme-light
            .ops-eyebrow` is a descendant selector and outranks a utility, so
            one here would be dead code claiming an intent it cannot deliver. */}
        <div className="ops-eyebrow text-xs">Filing reader</div>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-st-ink sm:text-5xl">
          Read what the company actually filed.
        </h1>
        {/* Shorter, because the card below now names the sections. Saying it
            twice cost six lines on a phone to tell someone the same thing. */}
        <p className="mt-4 max-w-2xl text-balance text-st-sub">
          Every company listed in the US files its reports with the SEC. Read what one actually
          says, split into the sections an investor reads.
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
            className="min-h-11 w-full max-w-xs rounded-full border border-st-bound bg-st-paper px-5 text-[15px] text-st-ink placeholder:text-st-faint focus:border-st-blue-edge focus:outline-none focus-visible:ring-2 focus-visible:ring-st-blue-edge"
          />
          <button
            type="submit"
            className="min-h-11 rounded-full border border-st-blue-edge bg-st-blue-soft px-6 text-sm font-semibold text-st-blue transition-colors hover:bg-st-blue-soft"
          >
            Find filings
          </button>
        </form>

        {!configured ? (
          <div className="mt-8">
            <Panel>
              <h2 className="ops-body-strong text-[16px] text-st-ink">
                This reader is not connected yet
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-st-sub">
                Filings come straight from EDGAR, and the SEC requires every
                automated request to identify its sender with a contact address.
                {/* Not a `code` element: it renders monospace by default, which
                    AGENTS.md bans site-wide. Weight and colour name a setting
                    perfectly well. */}
                Until <span className="font-semibold text-st-blue">OPS_SEC_CONTACT</span>{" "}
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
                className="rounded-2xl border border-st-hair bg-st-paper p-5 transition-colors hover:border-st-blue-edge"
              >
                <div className="ops-body-strong text-[16px] text-st-ink">{s.ticker}</div>
                <div className="mt-1 text-[14px] leading-6 text-st-muted">{s.note}</div>
              </Link>
            ))}
          </div>
        ) : null}

        {lookup && lookup.ok === false ? (
          <div className="mt-8">
            <Panel>
              <h2 className="ops-body-strong text-[16px] text-st-ink">
                Nothing to open
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-st-sub">{lookup.message}</p>
            </Panel>
          </div>
        ) : null}

        {lookup?.ok === true && filings ? (
          <div className="mt-10">
            {/* Plain classes rather than `ops-caption`, whose light rule would
                override the accent this line is meant to carry. */}
            <div className="text-[12px] font-semibold tracking-[0.02em] text-st-blue">
              {lookup.company.ticker} · CIK {lookup.company.cik}
            </div>
            <h2 className="ops-section-title mt-2 text-2xl">
              {filings.ok ? filings.name || lookup.company.name : lookup.company.name}
            </h2>

            {/*
              * The way back out with something to show for it.
              *
              * Reading a filing and building a portfolio were separate errands:
              * a learner could work through a 10-K here and then arrive in
              * Studio with an empty box and the company's name to retype. This
              * carries the name across, which is the only fact this page can
              * honestly hand over — the figures are the learner's to read out of
              * the document, and typing them is the exercise rather than a chore
              * to automate away.
              */}
            <Link
              href={`/studio/investigate?company=${encodeURIComponent(
                filings.ok ? filings.name || lookup.company.name : lookup.company.name,
              )}`}
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-st-blue-edge bg-st-blue-soft px-5 text-sm font-semibold text-st-blue transition-colors hover:bg-st-blue-soft"
            >
              Work out what these numbers mean →
            </Link>

            {filings.ok === false ? (
              <div className="mt-4">
                <Panel>
                  <p className="text-[15px] leading-7 text-st-sub">{filings.message}</p>
                </Panel>
              </div>
            ) : filings.filings.length === 0 ? (
              <div className="mt-4">
                <Panel>
                  <p className="text-[15px] leading-7 text-st-sub">
                    This company has filed with EDGAR, but not an annual or
                    quarterly report this reader can section.
                  </p>
                </Panel>
              </div>
            ) : (
              (() => {
                /*
                 * The annual report first, and everything else behind a
                 * disclosure.
                 *
                 * Twelve equal rows made the page three screens on a phone, and
                 * the length was the smaller problem: the list said every filing
                 * was as good a place to start as any, which is not true. The
                 * business description, the risk factors and the audited
                 * statements are in the annual report, and it is the document
                 * Studio's own investigation asks for figures from. A beginner
                 * opening the most recent 10-Q instead finds an update to a
                 * story they have not read.
                 *
                 * The rest is disclosed rather than dropped. Someone comparing
                 * two years, or reading what changed last quarter, is doing
                 * something real — the page just should not open on it.
                 */
                const annual = filings.filings.find((f) => isAnnual(f.form));
                const rest = filings.filings.filter((f) => f !== annual);
                const href = (f: FilingSummary) =>
                  `/filings/${lookup.company.cik}/${f.accession}?doc=${encodeURIComponent(f.primaryDocument)}&ticker=${lookup.company.ticker}`;

                return (
                  <>
                    {annual ? (
                      <Link
                        href={href(annual)}
                        className="mt-4 block rounded-2xl border border-st-blue-edge bg-st-blue-soft p-5 transition-colors hover:border-st-blue-edge"
                      >
                        <div className="text-[12px] font-semibold tracking-[0.02em] text-st-blue">
                          Start here · {annual.form}
                        </div>
                        <div className="mt-1 text-[17px] font-semibold text-st-ink">
                          The annual report, filed {annual.filingDate}
                        </div>
                        <p className="mt-1 text-[13px] leading-6 text-st-muted">
                          What the business says it does, the risks management is required to
                          admit, and the audited numbers
                          {annual.reportDate ? ` for the year ending ${annual.reportDate}` : ""}.
                        </p>
                      </Link>
                    ) : null}

                    {rest.length > 0 ? (
                      <details className="group mt-3">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[14px] font-semibold text-st-blue">
                          <span>
                            {annual ? "Earlier and quarterly filings" : "Filings this reader can open"} (
                            {rest.length})
                          </span>
                          <span className="text-[13px] font-normal text-st-muted group-open:hidden">Show</span>
                          <span className="hidden text-[13px] font-normal text-st-muted group-open:inline">
                            Hide
                          </span>
                        </summary>
                        <ul className="mt-2 divide-y divide-st-hair rounded-2xl border border-st-hair">
                          {rest.map((f) => (
                            <li key={f.accession}>
                              <Link
                                href={href(f)}
                                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-st-paper"
                              >
                                {/* The form type is the one thing worth picking
                                    out of a row of dates, so it keeps the accent
                                    — which means not using `ops-body-strong`,
                                    whose light rule would repaint it as ordinary
                                    body text. */}
                                <span className="w-16 text-[15px] font-semibold text-st-blue">
                                  {f.form}
                                </span>
                                <span className="text-[15px] text-st-ink">Filed {f.filingDate}</span>
                                {f.reportDate ? (
                                  <span className="text-[14px] text-st-muted">
                                    for the period ending {f.reportDate}
                                  </span>
                                ) : null}
                                <span className="ml-auto text-[13px] text-st-faint">{f.accession}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </>
                );
              })()
            )}
          </div>
        ) : null}

        <p className="mt-10 text-[13px] leading-6 text-st-faint">
          Documents are fetched from the SEC and cached. Educational material,
          not investment advice, and nothing here is a recommendation to buy or
          sell anything.
        </p>
      </div>
    </div>
  );
}
