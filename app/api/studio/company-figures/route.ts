import { NextResponse } from "next/server";
import { fetchCompanyFacts, fetchFilings, filingIndexUrl, resolveTicker, secUserAgent } from "@/lib/filings/edgar";
import { sectorFromSic, type CompanyFacts } from "@/lib/studio-project/metrics";
import { figuresFromFacts, periodToRead } from "@/lib/studio-project/prefill";

/**
 * Investigate's seven figures, looked up from what the company filed.
 *
 * **Why this is a server route and not a fetch from the page.** Two reasons,
 * both measured on 2026-09-10. `data.sec.gov/api/xbrl/companyfacts` sends no
 * `Access-Control-Allow-Origin` header and answers 403 to a preflight, so a
 * browser cannot read it. And the SEC's fair-access policy asks every automated
 * request to name a contact address in its User-Agent, which a browser will not
 * let a page set. Both point the same way: the server fetches, identified, and
 * hands the page a small answer.
 *
 * The answer is small on purpose. Company facts for one company runs to a few
 * megabytes — Atkore's is 2.3 MB — and sending that to a learner's browser to
 * pull seven numbers out of it would be the wrong shape as well as slow.
 */

export const runtime = "nodejs";

/** A ticker is letters, digits and the odd dash or dot; anything else is not one. */
const TICKER = /^[A-Za-z0-9.-]{1,12}$/;

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker")?.trim() ?? "";

  if (!TICKER.test(ticker)) {
    return NextResponse.json(
      { error: "Enter a ticker symbol, such as ATKR." },
      { status: 400 },
    );
  }

  if (secUserAgent() === null) {
    return NextResponse.json(
      {
        error:
          "Figures come straight from the SEC, which asks every automated request to name a contact address. Until this site is given one, it fetches nothing — type the seven figures from the annual report instead.",
      },
      { status: 503 },
    );
  }

  const resolved = await resolveTicker(ticker);
  if (!resolved.ok) return NextResponse.json({ error: resolved.message }, { status: resolved.reason === "not-found" ? 404 : 502 });
  const { cik, name } = resolved.company;

  // The filing index gives the SIC, which decides what the concepts mean, and
  // the company's own name. Both are wanted before any figure is read.
  const index = await fetchFilings(cik);
  if (!index.ok) return NextResponse.json({ error: index.message }, { status: index.reason === "not-found" ? 404 : 502 });

  const factsResult = await fetchCompanyFacts(cik);
  if (!factsResult.ok) {
    return NextResponse.json({ error: factsResult.message }, { status: factsResult.reason === "not-found" ? 404 : 502 });
  }

  const facts = factsResult.facts as CompanyFacts;
  const periodEnd = periodToRead(facts);
  if (!periodEnd) {
    return NextResponse.json(
      {
        error: `The SEC holds no annual figures for ${index.name || name} under US accounting rules. A company reporting under IFRS tags its filings differently, and Studio cannot read those yet.`,
      },
      { status: 404 },
    );
  }

  const prefill = figuresFromFacts(facts, sectorFromSic(index.sic), periodEnd);

  // Which filing reported this period, so the page can link to it. Company facts
  // can lag a filing, so this is the filing that carries the figures rather than
  // necessarily the company's newest.
  const accession = prefill.supplied[0]?.accession ?? "";
  const filing = index.filings.find((entry) => entry.accession === accession);

  return NextResponse.json({
    ticker: resolved.company.ticker,
    cik,
    entityName: index.name || name,
    sic: index.sic,
    sicDescription: index.sicDescription,
    periodEnd,
    supplied: prefill.supplied,
    missing: prefill.missing,
    filing: accession
      ? {
          accession,
          form: prefill.supplied[0].form,
          filed: prefill.supplied[0].filed,
          url: filingIndexUrl(cik, accession),
          // Present only when the filing is recent enough to be in the index.
          primaryDocument: filing?.primaryDocument ?? null,
        }
      : null,
  });
}
