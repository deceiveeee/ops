import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseProblemReport } from "@/lib/problem-report";

/**
 * Stores one "Report a problem" message in Supabase's `problem_reports` table
 * (supabase/migrations/0003_problem_reports.sql).
 *
 * It writes with the public key: the table's only policy lets anyone add a row
 * and nobody read one, so this route needs no secret and cannot leak a report.
 * Reports are read in the Supabase dashboard.
 */

export const runtime = "nodejs";

/** Generous for 2,000 characters of text plus the other fields as JSON. */
const BODY_MAX = 16_000;

const NOT_STORED = "The report did not send. Try again in a minute, or write to the address on the terms page.";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > BODY_MAX) {
    return NextResponse.json({ error: "That report is too long to send. Shorten it and send it again." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = parseProblemReport(body, request.headers.get("user-agent"));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: NOT_STORED }, { status: 503 });

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.from("problem_reports").insert(parsed.report);
  if (error) {
    // The code says why (for example 42P01: the table has not been created yet).
    // The visitor's words are not logged.
    console.error(`Problem report not stored: ${error.code ?? "no code"} ${error.message}`);
    return NextResponse.json({ error: NOT_STORED }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
