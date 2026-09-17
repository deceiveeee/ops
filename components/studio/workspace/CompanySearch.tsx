"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./working-pages.module.css";

export type Company = { cik: string; ticker: string; name: string };
export type CompanyLookup =
  | { kind: "idle" }
  | { kind: "loading"; query: string }
  | { kind: "done"; query: string; companies: Company[] }
  | { kind: "error"; query: string; message: string };

/** Shorter than this and nearly every company matches. */
export const MIN_QUERY = 2;
/** Typing pauses this long before the SEC's list is searched. */
const DELAY_MS = 300;
/** Rows shown under the library, which the screen budget holds to a few. */
const SHOWN = 3;

/**
 * Companies at the SEC that match Research's search, beside the library.
 *
 * The library holds eight investments Studio has checked, and only those can go
 * into a portfolio. Any other company can still be researched: its reports read
 * section by section, its competitors and figures worked out. Until this, that
 * was reachable only from pages a learner had to know to open, and typing
 * "Netflix" into this search said nothing matched.
 *
 * Library tickers are left out, so Apple is not offered twice.
 */
export function useCompanySearch(query: string, libraryTickers: ReadonlySet<string>) {
  const [lookup, setLookup] = useState<CompanyLookup>({ kind: "idle" });
  const cache = useRef(new Map<string, Company[]>());
  const wanted = query.trim();

  useEffect(() => {
    if (wanted.length < MIN_QUERY) {
      setLookup({ kind: "idle" });
      return;
    }
    const cached = cache.current.get(wanted.toLowerCase());
    if (cached) {
      setLookup({ kind: "done", query: wanted, companies: cached });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLookup({ kind: "loading", query: wanted });
      try {
        const response = await fetch(`/api/studio/company-search?q=${encodeURIComponent(wanted)}`, { signal: controller.signal });
        const body = (await response.json()) as { companies?: Company[]; error?: string };
        if (!response.ok || !body.companies) {
          setLookup({ kind: "error", query: wanted, message: body.error ?? "The SEC's list of companies could not be reached just now." });
          return;
        }
        cache.current.set(wanted.toLowerCase(), body.companies);
        setLookup({ kind: "done", query: wanted, companies: body.companies });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLookup({ kind: "error", query: wanted, message: "The SEC's list of companies could not be reached just now." });
        }
      }
    }, DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [wanted]);

  const companies = lookup.kind === "done" ? lookup.companies.filter((company) => !libraryTickers.has(company.ticker)).slice(0, SHOWN) : [];
  return { active: wanted.length >= MIN_QUERY, lookup, companies, wanted };
}

type Search = ReturnType<typeof useCompanySearch>;

/** How many companies were found, as a count a person reads. */
export const companiesFound = (count: number) => `${count} ${count === 1 ? "company" : "companies"} at the SEC`;

/**
 * The matching companies, each with the two things a learner can do with one.
 * The rows say plainly what a company here cannot be used for, so no one takes
 * its absence from the library as a verdict on it.
 */
export default function CompanySearch({ search }: { search: Search }) {
  const { active, lookup, companies, wanted } = search;
  if (!active) return null;
  const status =
    lookup.kind === "loading" || lookup.kind === "idle" ? `Looking for companies matching “${wanted}”…`
    : lookup.kind === "error" ? lookup.message
    : companies.length === 0 ? `No other company at the SEC matches “${lookup.query}”.`
    : companiesFound(companies.length);

  return (
    <section className={styles.companySearch} aria-labelledby="company-search-heading">
      <div className={styles.companySearchHeading}>
        <h3 id="company-search-heading">Other companies</h3>
        <p>Read their reports and work out their figures. They cannot go in your portfolio yet.</p>
        <span role="status">{status}</span>
      </div>
      {companies.length ? (
        <ul className={styles.companyList}>
          {companies.map((company) => (
            <li key={company.cik} className={styles.companyRow}>
              <span className={styles.companyName}>
                <strong>{company.ticker}</strong>
                <span>{company.name}</span>
              </span>
              {/* Short words so a row stays one line on a phone; each name says which company. */}
              <Link
                href={`/studio/filings?ticker=${encodeURIComponent(company.ticker)}`}
                aria-label={`Read ${company.name}'s reports`}
                className={styles.companyAction}
              >
                Reports
              </Link>
              <Link
                href={`/studio/investigate?ticker=${encodeURIComponent(company.ticker)}`}
                aria-label={`Investigate ${company.name}`}
                className={styles.companyActionQuiet}
              >
                Investigate
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
