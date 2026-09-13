# EDGAR fixtures

What the company-report reader is served during the end-to-end tests, in place of sec.gov.

`playwright.config.ts` sets `OPS_EDGAR_FIXTURE_DIR` to this directory. In that mode
`lib/filings/edgar.ts` reads each URL from the file named by `fixtureFileName(url)` — every
character that is not a letter, digit, dot, dash or underscore becomes an underscore — and a
missing file is "not found". It never falls through to the network, so a test run cannot send the
SEC requests these files exist to replace, and a result cannot depend on whether sec.gov was
reachable that minute.

## Atkore Inc., annual report for the year ended 30 September 2025

**`https___www.sec.gov_Archives_edgar_data_1666138_000162828025054049_atkr-20250930.htm`**

- **Source:** Form 10-K, accession `0001628280-25-054049`, filed 26 November 2025, primary document
  `atkr-20250930.htm`. Fetched from sec.gov on 13 September 2026 with the project's declared
  User-Agent. SEC dissemination terms allow the text to be copied and redistributed.
- **Trimmed from 2,358 KB to 108 KB.** Every heading and paragraph is the filing's own text, in
  its own order. What was cut:

  | Section | Kept | In the filing | Why it was kept to this length |
  | --- | ---: | ---: | --- |
  | Business | 32,039 chars (all) | 32,140 | Fifteen real pages to page through; PVC resin on page 4 |
  | Risk factors | 30,433 | 96,925 | Cut just after its PVC resin passage, on page 14 |
  | Legal proceedings | all | 225 | |
  | Market for the shares | all | 4,608 | |
  | Management's discussion | 24,840 | 61,130 | Cut after its PVC resin passage and the average-selling-price discussion |
  | Market risk | all | 5,225 | |
  | Financial statements | 6,287 | 161,512 | Enough to be a section; nothing is searched for in it |

  The text before Item 1 is the filing's last 4,000 characters ahead of it, which end in its table
  of contents, so the extractor still has to tell contents entries from real headings.

- **Offsets differ slightly from the live filing.** The HTML was rebuilt from the extracted
  paragraphs, which drops stray spaces at the edges of lines. The first PVC resin mention in
  Business is at 8,246 here and 8,274 in the live filing. That is useful, not a flaw:
  `lib/filings/anchor.test.ts` anchors passages in the live filing's text and finds them in this
  one, which is the "found again after the text shifted" case the anchoring exists for.

**`live-anchors.json`**

Four passages anchored in the text of the **live** filing on 13 September 2026, one sentence per
section, each inside a single paragraph as a learner would select it. Because the fixture's
spacing differs, each one sits at a different offset here than in the file it was anchored
against: that is the case of a passage kept against one extraction and looked for in another.

Only the anchors are recorded. Which strategy should find each one is written in
`lib/filings/anchor.test.ts` from the reason it should: Business and Management's discussion by
their surrounding text, which stays inside the paragraph; Risk factors and Market risk by the quote
alone, because their 32 characters of context run back across a line break the fixture spaces
differently. `e2e/studio-reader.spec.ts` restores a project holding the Business anchor and checks
the reader opens it, marked, with a note that it moved.

**`https___data.sec.gov_submissions_CIK0001666138.json`**

A minimal filing index rather than the real one, which runs to megabytes and lists years of forms
the reader never opens. Its values were read from the live index on 11 September 2026: the name
"Atkore Inc.", SIC 3690 with its description, and this one 10-K with its filing and report dates.

## Regenerating

The generator was a one-off script, not kept, because the fixture is meant to stay fixed. To
rebuild it, fetch the filing again, extract its sections with `extractFilingSections`, keep the
lengths in the table above, wrap headings in `<div>` and paragraphs in `<p>` with `&`, `<` and `>`
escaped, and check that all seven sections still extract and the PVC resin offsets in the tests
still hold.
