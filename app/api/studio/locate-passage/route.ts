import { NextResponse } from "next/server";
import { locate } from "@/lib/filings/anchor";
import { fetchFilingDocument, secUserAgent } from "@/lib/filings/edgar";
import { pageForOffset, paginate } from "@/lib/filings/pages";
import { FILING_SECTIONS, extractFilingSections } from "@/lib/filings/sections";

/**
 * Where a kept passage is now, in a freshly fetched copy of its filing.
 *
 * This is the check the research roadmap set for the reader: "a saved passage
 * is found again after a re-fetch". A kept passage lives in the learner's
 * browser; the filing lives at the SEC. Opening one from Investigate sends the
 * anchor here, the filing is fetched and re-extracted, and all four strategies
 * in `lib/filings/anchor.ts` run over the whole section — not just the page it
 * was kept from, because a shift in the text can move it across a page break.
 *
 * It is a POST because the anchor carries the kept words, which can run to a few
 * thousand characters: too long to be sure of in a URL, and not something that
 * belongs in a server log line.
 *
 * Nothing is stored. The answer is a place, or a plain "not found".
 */

export const runtime = "nodejs";

const CIK = /^\d{1,10}$/;
const ACCESSION = /^\d{10}-\d{2}-\d{6}$/;
const DOCUMENT = /^[A-Za-z0-9._-]{1,200}$/;
const SECTION_IDS = new Set<string>(FILING_SECTIONS.map((section) => section.id));

type Body = {
  cik?: unknown;
  accession?: unknown;
  document?: unknown;
  sectionId?: unknown;
  quote?: unknown;
  prefix?: unknown;
  suffix?: unknown;
  offset?: unknown;
};

const text = (value: unknown, max: number): value is string => typeof value === "string" && value.length <= max;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "That is not a passage this can look for." }, { status: 400 });
  }

  const { cik, accession, document, sectionId, quote, prefix, suffix, offset } = body;
  if (
    !text(cik, 10) || !CIK.test(cik) ||
    !text(accession, 20) || !ACCESSION.test(accession) ||
    !text(document, 200) || !DOCUMENT.test(document) ||
    !text(sectionId, 40) || !SECTION_IDS.has(sectionId) ||
    !text(quote, 5000) || !quote.trim() ||
    !text(prefix, 64) || !text(suffix, 64) ||
    typeof offset !== "number" || !Number.isInteger(offset) || offset < 0
  ) {
    return NextResponse.json({ error: "That is not a passage this can look for." }, { status: 400 });
  }

  if (secUserAgent() === null) {
    return NextResponse.json(
      { error: "Reports come straight from the SEC, and this site has not been given the contact address it asks for." },
      { status: 503 },
    );
  }

  const fetched = await fetchFilingDocument(cik, accession, document);
  if (!fetched.ok) {
    return NextResponse.json({ found: false, reason: "filing", message: fetched.message }, { status: 200 });
  }

  const section = extractFilingSections(fetched.html).sections.find((item) => item.id === sectionId);
  if (!section) {
    return NextResponse.json({
      found: false,
      reason: "section",
      message: "The section this passage came from could no longer be located in the report.",
    });
  }

  const located = locate(section.text, { quote, prefix, suffix, offset });
  if (!located) {
    return NextResponse.json({
      found: false,
      reason: "text",
      message: "These words are no longer in that section of the report as Studio reads it.",
    });
  }

  return NextResponse.json({
    found: true,
    strategy: located.strategy,
    sectionId,
    start: located.start,
    end: located.end,
    page: pageForOffset(paginate(section.text), located.start),
  });
}
