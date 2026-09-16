import { NextResponse } from "next/server";
import { fetchCompanyFacts, fetchFilings, filingIndexUrl, padCik, secUserAgent } from "@/lib/filings/edgar";
import { isResolved, resolveConcepts, resolvePrimitive, sectorFromSic, type CompanyFacts } from "@/lib/studio-project/metrics";
import { figuresFromFacts, periodToRead } from "@/lib/studio-project/prefill";

/**
 * The seven figures for several companies at once, so a learner's own company
 * can be set beside the competitors its report names.
 *
 * The same route shape as `company-figures`, and for the same two measured
 * reasons: `data.sec.gov` sends no cross-origin header, so a browser cannot
 * read it, and the SEC asks every automated request to name a contact address,
 * which a page cannot set. Company facts for one company run to megabytes —
 * Atkore's is 2.3 MB — so the server reads them and hands back the few numbers
 * the screen needs.
 *
 * Each company is answered on its own. One that files under IFRS, or has
 * nothing tagged, or whose figures cannot be read comes back with its reason
 * beside its name rather than taking the rest of the list down with it.
 */

export const runtime = "nodejs";

/** SEC numbers only, and a list short enough to fetch politely one after another. */
const CIK = /^\d{1,10}$/;
const MOST = 10;

export async function GET(request: Request) {
  const asked = (new URL(request.url).searchParams.get("ciks") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!asked.length || !asked.every((cik) => CIK.test(cik))) {
    return NextResponse.json({ error: "Ask for companies by their SEC number." }, { status: 400 });
  }
  if (asked.length > MOST) {
    return NextResponse.json({ error: `Studio compares up to ${MOST} companies at once.` }, { status: 400 });
  }

  if (secUserAgent() === null) {
    return NextResponse.json(
      {
        error:
          "Figures come straight from the SEC, which asks every automated request to name a contact address. Until this site is given one, it fetches nothing.",
      },
      { status: 503 },
    );
  }

  // One company at a time. The SEC's fair-access limit is ten requests a second
  // and this is two requests each, so nothing here needs to race.
  const companies = [];
  for (const cik of Array.from(new Set(asked.map((entry) => padCik(entry))))) {
    companies.push(await figuresFor(cik));
  }

  return NextResponse.json({ companies });
}

async function figuresFor(cik: string) {
  const list = await fetchFilings(cik);
  if (!list.ok) return { cik, unavailable: list.message };

  const factsResult = await fetchCompanyFacts(cik);
  if (!factsResult.ok) return { cik, name: list.name, unavailable: factsResult.message };

  const facts = factsResult.facts as CompanyFacts;
  const periodEnd = periodToRead(facts);
  if (!periodEnd) {
    return {
      cik,
      name: list.name,
      unavailable:
        "The SEC holds no annual figures for this company under US accounting rules. A company reporting under IFRS tags its filings differently, and Studio cannot read those yet.",
    };
  }

  const sector = sectorFromSic(list.sic);
  const prefill = figuresFromFacts(facts, sector, periodEnd);
  const accession = prefill.supplied[0]?.accession ?? "";

  // The bottom line, read separately because Investigate's seven figures do not
  // include it. Measured 2026-09-15 across ten large companies: three of them
  // tag neither operating profit nor borrowings in a form Studio will read, and
  // every one of the ten tags this. It is the measure that keeps such a company
  // in the comparison instead of leaving its row empty.
  const net = resolvePrimitive(facts, "netIncome", sector, periodEnd);

  // Shares, for a value per share. The year's diluted average rather than a
  // count on one day: it is the basis every per-share figure in a filing uses,
  // and it is tagged as an annual figure, so it covers the same period as the
  // profit beside it. What has been bought back or issued since is not in it,
  // and the surface says so.
  const shares = resolveConcepts(
    facts,
    [
      "WeightedAverageNumberOfDilutedSharesOutstanding",
      "WeightedAverageNumberOfSharesOutstandingDiluted",
      "WeightedAverageNumberOfSharesOutstanding",
      "WeightedAverageNumberOfSharesOutstandingBasic",
      "CommonStockSharesOutstanding",
    ],
    periodEnd,
  );

  return {
    cik,
    name: list.name,
    sic: list.sic,
    sicDescription: list.sicDescription,
    sector,
    periodEnd,
    netProfit: isResolved(net)
      ? { value: net.value, concept: net.concept, periodEnd: net.periodEnd }
      : { reason: "Studio could not read what it earned after everything for that year" },
    shares: shares
      ? { value: shares.value, concept: shares.concept, periodEnd: shares.periodEnd }
      : { reason: "Studio could not read how many shares this company had in that year" },
    // Only what the screen shows: the value, and where it was read from.
    figures: prefill.supplied.map((figure) => ({
      key: figure.key,
      value: figure.value,
      concepts: figure.concepts,
      addedUp: figure.addedUp,
      periodEnd: figure.periodEnd,
    })),
    missing: prefill.missing.map((figure) => ({ key: figure.key, reason: figure.reason })),
    filing: accession
      ? { accession, form: prefill.supplied[0].form, filed: prefill.supplied[0].filed, url: filingIndexUrl(cik, accession) }
      : null,
  };
}
