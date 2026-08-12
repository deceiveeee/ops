# Source pipelines

Two pipelines share one gitignored cache:

- **`fetch-session.mjs`** — the Damodaran *Investment Philosophies* corpus (38 sessions).
  Documented below.
- **`fetch-supplemental.mjs`** — the primary sources for the six portfolio-construction
  subjects Damodaran does not cover. Manifest: `supplemental-manifest.json`.

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
