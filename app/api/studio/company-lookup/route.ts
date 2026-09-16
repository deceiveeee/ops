import { NextResponse } from "next/server";
import { resolveTicker, secUserAgent } from "@/lib/filings/edgar";

/**
 * A company's SEC number and name, from its ticker.
 *
 * For the Competitors tab, where a learner adds a company the report did not
 * name in words Studio could read. EDGAR's ticker file is the better part of a
 * megabyte, so it stays on the server and only the one company comes back.
 * Nothing is stored here; the learner's browser keeps what they add.
 */

export const runtime = "nodejs";

const TICKER = /^[A-Za-z0-9.-]{1,10}$/;

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker")?.trim() ?? "";
  if (!TICKER.test(ticker)) {
    return NextResponse.json({ error: "Type a ticker symbol: the short code a company's shares trade under." }, { status: 400 });
  }
  if (secUserAgent() === null) {
    return NextResponse.json({ error: "Companies cannot be looked up until this site is given a contact address for the SEC." }, { status: 503 });
  }
  const found = await resolveTicker(ticker);
  if (!found.ok) {
    return NextResponse.json({ error: found.message }, { status: found.reason === "not-found" ? 404 : 502 });
  }
  return NextResponse.json({ company: found.company });
}
