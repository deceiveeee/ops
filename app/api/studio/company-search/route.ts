import { NextResponse } from "next/server";
import { QUERY_MAX, searchCompanies } from "@/lib/filings/company-search";
import { fetchCompanyTickers, secUserAgent } from "@/lib/filings/edgar";

/**
 * Companies whose name or ticker matches what was typed in Research's search.
 *
 * EDGAR's ticker file is fetched on the server, cached for a day like the
 * single-ticker lookup beside this route, and only the few matches come back.
 * Nothing is stored.
 */

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > QUERY_MAX) {
    return NextResponse.json({ error: `Type a company's name or ticker, up to ${QUERY_MAX} characters.` }, { status: 400 });
  }
  if (secUserAgent() === null) {
    return NextResponse.json({ error: "Companies cannot be looked up until this site is given a contact address for the SEC." }, { status: 503 });
  }
  const file = await fetchCompanyTickers();
  if (!file.ok) {
    return NextResponse.json({ error: "The SEC's list of companies could not be reached just now." }, { status: 502 });
  }
  return NextResponse.json({ companies: searchCompanies(file.json, query) });
}
