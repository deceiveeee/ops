import Link from "next/link";

import {
  fetchFilingDocument,
  filingIndexUrl,
  secUserAgent,
} from "@/lib/filings/edgar";
import { extractFilingSections } from "@/lib/filings/sections";

export const metadata = { title: "Filing reader — Open Portfolio Studio" };

/**
 * One filing, sectioned.
 *
 * A 10-K runs to hundreds of thousands of words, so each section is opened to a
 * readable excerpt with a link to the whole document at the SEC. The point is to
 * teach where to look and what the section is for, not to reproduce EDGAR.
 */

const EXCERPT_CHARS = 2_600;

function paragraphs(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default async function FilingReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ cik: string; accession: string }>;
  searchParams: Promise<{ doc?: string; ticker?: string }>;
}) {
  const { cik, accession } = await params;
  const { doc, ticker } = await searchParams;

  const sourceUrl = filingIndexUrl(cik, accession);

  if (secUserAgent() === null) {
    return (
      <Shell title="This reader is not connected yet" ticker={ticker} sourceUrl={sourceUrl}>
        <p className="text-[15px] leading-7 text-st-sub">
          Filings come straight from EDGAR, and the SEC requires every automated
          request to identify its sender with a contact address. Set{" "}
          {/* Not a `code` element; monospace is banned site-wide. */}
          <span className="font-semibold text-st-blue">OPS_SEC_CONTACT</span> to enable
          it.
        </p>
      </Shell>
    );
  }

  if (!doc) {
    return (
      <Shell title="No document named" ticker={ticker} sourceUrl={sourceUrl}>
        <p className="text-[15px] leading-7 text-st-sub">
          A filing can contain many documents, so this reader needs to be told
          which one to open. Pick the filing again from the list.
        </p>
      </Shell>
    );
  }

  const fetched = await fetchFilingDocument(cik, accession, doc);
  if (!fetched.ok) {
    return (
      <Shell title="That document could not be opened" ticker={ticker} sourceUrl={sourceUrl}>
        <p className="text-[15px] leading-7 text-st-sub">{fetched.message}</p>
      </Shell>
    );
  }

  const { sections, missing, plainTextLength } = extractFilingSections(fetched.html);

  return (
    <Shell
      title={ticker ? `${ticker} — filing` : "Filing"}
      ticker={ticker}
      sourceUrl={sourceUrl}
      subtitle={`${accession} · ${plainTextLength.toLocaleString()} characters of text, split into ${sections.length} sections`}
    >
      {sections.length === 0 ? (
        <p className="text-[15px] leading-7 text-st-sub">
          This filing does not follow the item structure this reader knows, so
          rather than guess at where the sections begin it is better read at the
          source.
        </p>
      ) : null}

      <div className="mt-2 space-y-4">
        {sections.map((section) => {
          const lines = paragraphs(section.text);
          const heading = lines[0] ?? section.label;
          const rest = lines.slice(1);
          let used = 0;
          const shown: string[] = [];
          for (const line of rest) {
            if (used > EXCERPT_CHARS) break;
            shown.push(line);
            used += line.length;
          }
          const truncated = shown.length < rest.length;

          return (
            <section
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-st-hair bg-st-paper p-6"
            >
              <div className="text-[12px] font-semibold tracking-[0.02em] text-st-blue">
                {section.label}
              </div>
              <h2 className="ops-body-strong mt-1 text-[17px] text-st-ink">{heading}</h2>

              <p className="mt-3 rounded-xl border border-st-blue-edge bg-st-blue-soft p-4 text-[14px] leading-6 text-st-sub">
                <span className="mr-2 text-[11px] font-semibold tracking-[0.02em] text-st-blue">
                  What to look for
                </span>
                {section.lens}
              </p>

              <div className="mt-4 space-y-3">
                {shown.map((line, i) => (
                  <p key={i} className="text-[15px] leading-7 text-st-body">
                    {line}
                  </p>
                ))}
              </div>

              {truncated ? (
                <p className="mt-4 text-[13px] leading-6 text-st-faint">
                  Excerpt. This section runs to{" "}
                  {section.text.length.toLocaleString()} characters —{" "}
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-st-blue underline decoration-st-blue-edge underline-offset-2"
                  >
                    read the whole filing at the SEC
                  </a>
                  .
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      {missing.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-st-hair bg-st-paper p-5">
          <h3 className="ops-body-strong text-[15px] text-st-ink">
            Not found in this filing
          </h3>
          <p className="mt-2 text-[14px] leading-6 text-st-muted">
            {missing.map((m) => m.label).join(", ")}. Filers format their reports
            differently, and this reader would rather say it could not find a
            section than show you the wrong one.
          </p>
        </div>
      ) : null}
    </Shell>
  );
}

function Shell({
  title,
  subtitle,
  ticker,
  sourceUrl,
  children,
}: {
  title: string;
  subtitle?: string;
  ticker?: string;
  sourceUrl: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        {/* Without `ops-caption`, whose light rule sets a colour and would take
            the hover with it, leaving a link that does not answer a pointer. */}
        <Link
          href={ticker ? `/filings?ticker=${ticker}` : "/filings"}
          className="text-[12px] font-semibold tracking-[0.02em] text-st-muted transition-colors hover:text-st-blue"
        >
          ← Filing reader
        </Link>

        <h1 className="ops-section-title mt-4 text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-[14px] text-st-muted">{subtitle}</p>
        ) : null}

        <p className="mt-3 text-[13px] leading-6 text-st-faint">
          Filed with the SEC ·{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-st-blue underline decoration-st-blue-edge underline-offset-2"
          >
            open the original
          </a>
        </p>

        <div className="mt-8">{children}</div>

        <p className="mt-10 text-[13px] leading-6 text-st-faint">
          Educational material, not investment advice. Nothing here is a
          recommendation to buy or sell anything.
        </p>
      </div>
    </div>
  );
}
