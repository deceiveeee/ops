# Source pipelines

Four pipelines share one gitignored cache:

- **`fetch-session.mjs`** — the Damodaran *Investment Philosophies* corpus (38 sessions).
  Documented below.
- **`fetch-supplemental.mjs`** — the primary sources for the six portfolio-construction
  subjects Damodaran does not cover. Manifest: `supplemental-manifest.json`.
- **`fetch-nport-prices.mjs`** — dated share prices for Studio, derived from N-PORT
  holdings filings. Manifest: `nport-manifest.json`. Documented immediately below.
- **`fetch-fundamentals.mjs`** — company fundamentals from SEC XBRL, resolved per sector
  and per period. Manifest: `fundamentals-manifest.json`. Documented after that.

---

# N-PORT price pipeline

A fund reports what it held, how many shares, and what they were worth. Price is the
quotient. SEC filings are public domain, which is the whole reason this exists: every
commercial price feed investigated forbids showing the numbers to a learner, and a
lesson that cannot show its evidence is not worth writing.

```bash
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-nport-prices.mjs --discover 0000036405
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-nport-prices.mjs            # all manifest funds
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-nport-prices.mjs VTI VXUS   # named funds
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-nport-prices.mjs --check    # identify, download nothing
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-nport-prices.mjs --report   # rebuild from cache, offline
```

`OPS_SEC_CONTACT` is required and never committed. SEC fair access asks automated
requests to identify a contact address and blocks the ones that do not.

Extraction rules live in `lib/studio-project/prices.ts` and are unit-tested there. This
script only fetches, caches and records provenance; Node strips the types so the two share
one implementation instead of a copy. Node prints a `MODULE_TYPELESS_PACKAGE_JSON` warning
when it does — it is a performance note, not an error, and adding `"type": "module"` to fix
it would change how Next builds.

Output lands in `.source-cache/nport/`: `raw/` holds filings as downloaded, `index.json`
maps accession to fund and SHA-256, `snapshots/` holds the built snapshots. The quality
report is committed to `docs/source-audits/studio-price-snapshot.md`.

## Why it works the way it does

**Discovery probes 16 KB, not 3 MB.** A registrant files one NPORT-P per fund and the
submissions index does not say which: `primaryDocDescription` is empty, and one trust files
a dozen a quarter. Only the document names the series. SEC ignores `Range` headers and
answers 200 with the whole file, but the body is a stream, so the script reads until
`</genInfo>` and cancels — 0.5% of the transfer. Every `seriesId` in the manifest was read
this way, never guessed.

**Trusts report on different month-ends.** They keep different fiscal year-ends, so pooling
widens the calendar: Vanguard Index Funds report Mar/Jun/Sep/Dec, Vanguard Scottsdale
Feb/May/Aug/Nov, Vanguard STAR Jan/Apr/Jul/Oct. Together they cover all twelve month-ends
of 2025 — though per *security* rather than per filing, a US stock reaches eight of them
and an international one four.

**Two overlapping funds are kept on purpose.** VTI and VOO share about 500 securities and
file independently, so their agreement is a live check that the quotient really is the
market price rather than an assumption. It is enforced, not merely reported: a security two
filings cannot agree on within 0.05% is withheld from the snapshot instead of averaged.

## Defects this pipeline was built to avoid

Each was found by measuring real filings, and each would have been silent.

- **LEI identifies an issuer, not a security.** 217 of 5,378 issuers in one international
  filing carry more than one security under a single LEI. Cemex is $12.30 as a US ADR and
  $1.23 as a Mexican local share; Banco Santander Chile is $31.98 and $0.08. Keys are ISIN
  first, then CUSIP, and a position with neither is refused a price rather than guessed at.
- **A third of international positions have no LEI and no CUSIP.** Only 718 of 8,777 foreign
  positions carried a CUSIP. Keying on those two alone would have dropped 34% of the
  international universe — the securities Studio most needs.
- **One security can have several prices on one day.** Barrick appears in one filing on
  three exchanges: New York $39.3400 and Toronto $39.2903, both fair value Level 1, and
  London $39.3401 at Level 2 because that exchange had already closed. Currency and country
  are part of the key, and the fair-value level travels with every observation.
- **Not every unit is a share.** Filings also report `NC`, a count of derivative contracts
  whose quotient came out at −$2.67 and $2,367,874, and `PA`, a bond principal amount whose
  quotient is a price per unit of face. Both are excluded with the reason recorded.

## Limits to state wherever these numbers appear

- **They are price returns, not total returns.** Dividends are not in them.
- **Coverage is per filing, not per security.** That some fund reported on a date does not
  mean it held a given security then. A sparse security must show its real observation dates
  and never a smooth interpolated line.
- **Level 1 and Level 2 are not the same kind of number** and any display must say which.

---

# Fundamentals pipeline

Company financials from SEC XBRL, resolved per sector and per period.

```bash
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-fundamentals.mjs                 # all manifest companies
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-fundamentals.mjs MSFT FITB       # named tickers
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-fundamentals.mjs --cik 0000034088
OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-fundamentals.mjs --report        # rebuild offline
```

Mapping rules live in `lib/studio-project/metrics.ts` and are unit-tested there. Audit:
`docs/source-audits/studio-metric-mapping.md`.

**A metric is not one XBRL concept.** It is different concepts for different kinds of
company, and different concepts for the *same* company at different times, because filers
migrate their tagging. Resolution is therefore always **for a stated period**: a concept
qualifies only if it carries a value covering that period, and preference decides among the
ones that qualify. "We cannot compute this" is a first-class result carrying its reason.

## Four silent failures this exists to prevent

Measured across twelve companies spanning banking, insurance, real estate, utilities,
transport, energy, software, semiconductors, retail, pharma, telecom and industrials.

- **Wrong concept for the sector.** Asking Fifth Third for contract revenue returns $577M, a
  fee subset, when net interest income is $5,982M and noninterest income $3,035M. Wrong by
  about fifteen times, and populated, so nothing complains. Bank revenue is assembled as a
  sum, and the contract-revenue concepts are excluded from the banking list on purpose.
- **A concept the company abandoned.** The largest failure class, and not a sector problem:
  **11 of 113 resolutions returned data staler than the company's own latest period**.
  NVIDIA's old capex tag last appears in 2012; Microsoft dropped `CostOfRevenue` after 2017;
  Costco stopped tagging `GrossProfit` after 2019. All still resolve.
- **A concept that does not apply.** Gross profit is not missing data for a bank, a REIT or
  a railroad — it is undefined. Six of the twelve report neither gross profit nor any cost
  of revenue, and the module says so rather than returning nothing.
- **A concept whose name resembles the answer.** NextEra tags
  `CapitalExpendituresIncurredButNotYetPaid` at $7.64B, an accrual disclosure rather than
  cash spending. Prologis tags `PaymentsToAcquireRealEstate` at $1.80B, which is buying
  buildings rather than maintaining them. Verizon, Exxon and Union Pacific all report
  `CostsAndExpenses`, which is total operating expense — subtract it from revenue and you
  get operating income wearing the name of gross profit. All three are excluded.

## A ticker is not an identity

`XOM` resolves to ExxonMobil Holdings Corp, a 2026 reorganisation entity holding 94 concepts
and **zero** annual revenue periods, while its `entityName` still reads "Exxon Mobil
Corporation". The operating company, CIK 0000034088, has 438 concepts and fifteen years.
Nothing in the payload distinguishes them. So CIKs are pinned in the manifest, the cache is
keyed by **CIK rather than ticker**, and any entity with fewer than three annual periods is
rejected rather than screened.

---

# Supplemental source pipeline

```bash
node scripts/source/fetch-supplemental.mjs                 # all sources
node scripts/source/fetch-supplemental.mjs tax-accounts    # one subject
node scripts/source/fetch-supplemental.mjs irs-pub550      # one source id
node scripts/source/fetch-supplemental.mjs --check         # re-verify URLs, no extraction
```

Output goes to `.source-cache/supplemental/{raw,text,provenance}`. Handles PDF (via
`pdftotext`), HTML (table rows preserved as `cell | cell`), binary data files (provenance
only) and API endpoints (liveness probe).

Three rules that pipeline enforces:

- **Verify before adding.** Every URL is fetch-tested before entering the manifest. During
  the initial survey two candidate URLs returned 404 and one returned 403; search results
  are not evidence.
- **Decay tracking.** Sources whose figures change annually — risk premiums, tax thresholds
  — are marked `decay: high`. Lesson copy cites them with a date and never hardcodes the
  numbers. Re-run every 12 months.
- **Jurisdiction.** US is the only locked jurisdiction. Sources marked `any` are neutral.
  When OPS expands, add sibling entries keyed by jurisdiction and select on the learner's
  reported status — never show US tax rules to a non-US learner.

`corruptionCheck` warns rather than repairs: these documents are modern and verified clean,
so if it ever fires the text is untrustworthy and must be inspected before citing.

---

# Damodaran source pipeline

Fetches the primary sources behind Investment Foundations so lesson authoring can
satisfy the source-integrity gate in `AGENTS.md` with evidence rather than claims.

```bash
node scripts/source/fetch-session.mjs 6      # one session
node scripts/source/fetch-session.mjs 6-8    # inclusive range
node scripts/source/fetch-session.mjs all    # all 38
```

## What it produces

Everything lands in `.source-cache/`, which is **gitignored on purpose**. The corpus
is Damodaran's copyrighted course material; committing it would redistribute it, and
pushing the branch would publish it. Only original OPS analysis belongs in `docs/`.

| Path | Contents |
| --- | --- |
| `.source-cache/pdf/` | Raw slide and quiz PDFs as downloaded |
| `.source-cache/vtt/` | Raw YouTube auto-caption tracks |
| `.source-cache/text/sessionN-slides.txt` | Slide text, layout preserved |
| `.source-cache/text/sessionN-quiz.txt` | Quiz and solutions text |
| `.source-cache/text/sessionN-transcript.txt` | Narration in `[hh:mm:ss]` paragraphs, citable |
| `.source-cache/provenance/sessionN.json` | URLs, SHA-256, byte sizes, page counts, fetch time, caption status, warnings |

## Requirements

`curl`, `pdftotext` (xpdf/poppler), and `yt-dlp`. Without `yt-dlp` the script still
fetches slides and quizzes and records `captionStatus: "skipped-no-yt-dlp"`. Install
with `winget install yt-dlp.yt-dlp`; override the binary with `YTDLP=/path/to/yt-dlp`.

## Numbering

Session numbers are **deck numbers**, matching `docs/source-audits/*`. The course index
page shows 39 rows because row 1 is a video-only "Overview of class" with no deck, so
index row N+1 carries `sessionN.pdf` and `quizN.pdf`.

## Verified source defects

Recorded in `manifest.json` under `anomalies`, and the reason `videoId` is assigned by
**content** rather than by upload title:

- **Sessions 5 and 6 are swapped.** The upload titled "Session 5: Valuation - The Basics"
  (`bUJUGsDQ16w`, 27:33) contains trading-costs narration; the upload titled
  "Session 6: Trading Costs & Taxes" (`FNF3ncQgABk`, 27:18) contains the valuation
  narration. Verified by keyword analysis of the caption track — price impact ×21,
  tax ×38, bid-ask ×12, trading cost ×14, against zero hits for valuation, cash flow,
  discount rate, or perpetuity.
- **The bond-risk row links the wrong video.** The index points at `h37fJcDjjWg`, which
  is "Overview of class" (4:47). The mirror `8E6b60eN2Mc` (16:05) carries the narration.
- **Some sessions have no caption track**, session 5 among them (verified). Those
  sessions cannot have narration reviewed by this pipeline. `captionStatus` records the
  outcome per run — do not claim narration review where it is absent.

## Text repair

The decks embed "ti" as a ligature that `pdftotext` emits as `F` (`acFve`, `waiFng`,
`FuncFon`), and render bullets and en-dashes as U+FFFD. `repairDeckText` fixes both. The
ligature only appears between lowercase letters, so all-caps tokens (`ETFs`) and ordinary
capitalised words (`Fund`, `Figure`, `Factor`) are untouched. Provenance records
`residualLigatures` per file so a reviewer can confirm the repair was complete; expect 0.

Transcripts are auto-generated captions, so they contain recognition errors and no
punctuation. Slide text and independently checked arithmetic control wherever the
transcript is ambiguous — never quote a transcript as Damodaran's exact wording.
