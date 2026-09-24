import { NextResponse } from "next/server";
import { QUERY_MAX, searchCompanies } from "@/lib/filings/company-search";
import { companyDirectory } from "@/lib/filings/company-directory";

/**
 * Companies whose name or ticker matches what was typed in Research's search.
 *
 * EDGAR's ticker file is fetched on the server, cached for a day like the
 * single-ticker lookup beside this route, and only the few matches come back.
 * A dated public directory keeps search available if the live request fails.
 */

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > QUERY_MAX) {
    return NextResponse.json({ error: `Type a company's name or ticker, up to ${QUERY_MAX} characters.` }, { status: 400 });
  }
  const file = await companyDirectory();
  return NextResponse.json({ companies: searchCompanies(file.json, query), source: file.source });
}
