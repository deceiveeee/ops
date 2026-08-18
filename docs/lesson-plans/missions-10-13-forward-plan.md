# Forward plan: missions 10–13

**Date:** 2026-08-13 · **Author:** Claude · **Status:** proposal, not authority

This plan is built from what is actually in `.source-cache/` and
`.source-cache/supplemental/provenance/` on this date, not from the curriculum's
prose. Every status below was verified by reading the provenance records.

The standards in §1 are not generic best practice. Each one is written against a
specific defect that reached the tree in missions 5, 8 and 9 and was found late.

---

## 1. The raised bar

Missions 5 and 9 both shipped with `Blocked - implementation` because the same
gate — browser and visual QA — was left until last and then could not be run. And
in both cases the automated gate that was supposed to substitute for it either
failed silently or was not run at all. These rules exist to make that impossible
rather than merely discouraged.

### 1.1 Screen budget is a gate, not a preference

Now in `AGENTS.md` under **Screen Budget Rule**. For every mission:

- Page height reported **in screens** (`scrollHeight / innerHeight`), measured at
  **390, 768, 1024, 1280, 1440, 1920** — six numbers in the release evidence, not
  one. Mission 5's first layout fix was verified at a single width and did
  nothing at the width the stakeholder actually used.
- A stage is a screen: fixed frame, internal scroll, controls pinned.
- One hero per page. Mission 5 had two, costing 1.5 screens before the learner
  could act.
- Widening a column is never the fix for a tall page.

### 1.2 Verification must be able to fail

- Any new check ships with a test that **plants the defect and requires the check
  to report it**. The typography gate has one; nothing else does.
- No claim in release evidence without the command and its output. Mission 9's
  first evidence file listed browser checks that had not been re-run after a
  correction; that is now explicitly forbidden.
- A gate that cannot run is `Blocked`, never "verified by code inspection."

### 1.3 The walker contract

The stage walker in `e2e/lesson-typography.spec.ts` is the only automated thing
that sees later stages. Mission 5 broke it in three separate ways and nobody
noticed for a full build cycle, because a failing walk looks like a red test
rather than an unaudited product.

- **Declare stage-completion behaviour.** Mission 5 auto-advances on save; every
  other lesson does not. That single undeclared difference made the walker report
  a completed stage as unanswerable. New journeys state this in a comment beside
  the shell call.
- **`ANSWER_KEYS` is a last resort.** Mission 5 needed seven entries, one per
  stage — at which point the automated check no longer understands the product.
  Budget: **at most one keyed stage per mission**. More than that is a signal the
  interaction shapes have drifted, and the fix is the solver or the design.
- **No duplicate accessible names.** Mission 5 rendered the same `<h2>` twice
  (shell stage title and panel title), which is both a visual defect and a strict
  -mode test failure.

### 1.4 Source rigour beyond the deck

Mission 9 reproduced Damodaran's own Sharpe ratio formula, which omits the
risk-free rate. The deck being the source does not make the formula right.

- Where the source states a **named, standardised** quantity (Sharpe, Treynor,
  Jensen, duration, IRR), check the definition against its **originating primary
  source** and use the standard form, noting the divergence on the page.
- Historical magnitudes stay dated and labelled, or are quarantined.
- Extraction artefacts are repaired and listed before the coverage matrix is
  written.

### 1.5 The verification bar, corrected

`npm run build` was **never run** during missions 8, 9 or the gate work, and it
is not in the handoff's bar. It belongs there — the Vercel deployment on PR #3
has been failing this whole time for a reason no test would catch.

```
npm run typecheck     npm run lint      npm test
npx playwright test   npm run build
```

Plus the six-width screen-budget measurement, and a browser walk of every stage.

---

## 2. Source ledger, verified 2026-08-13

### 2.1 Damodaran sessions

| Session | Slides | Quiz | Official captions | Tier |
| ---: | :---: | :---: | :---: | --- |
| 30 | yes | yes | **1,956 words** | 2 |
| 32 | yes | yes | **none** | **3 (ASR only, 4,230 words)** |
| 33 | yes | yes | 2,492 words | 2 |
| 34 | yes | yes | 3,474 words | 2 |
| 35 | yes | yes | 2,840 words | 2 |
| 36 | yes | yes | 3,084 words | 2 |
| 37 | yes | yes | 2,838 words | 2 |
| 38 | yes | yes | 2,740 words | 2 |

**Correction to an earlier claim of mine.** In the reply to Codex I stated that
all four of mission 11's sessions (30, 32, 33, 34) were tier 3 for narration.
That was wrong. I had checked only the local ASR directory and inferred from its
contents. Sessions 30, 33 and 34 have official caption tracks in
`.source-cache/text/`. **Only session 32 lacks one.** The narration gate is one
session wide, not four.

Tiering, to be stated in every coverage matrix:

| Tier | Source | May be cited for |
| --- | --- | --- |
| 1 | Slides and quiz PDFs, hashed | any claim, any number |
| 2 | Official caption track | any claim, with timestamp |
| 3 | Local `faster-whisper small.en` ASR, no hash, unreproducible | topic scope only; never a quoted figure without slide corroboration |

### 2.2 Supplemental sources

All fetched; HTTP status from the provenance records.

**Usable (200):** `morningstar-active-passive-2026-06` (1.1 MB), `vanguard-rebalancing-edge`
(1.18 MB), `cfa-ips-individual`, `irs-pub550`, `irs-pub590a`, `irs-pub590b`,
`sec-funds-and-etfs`, `sec-order-types`, `sec-brokerage-accounts`, `sec-edgar`,
`damodaran-erp`, `damodaran-country-premiums`, `damodaran-historical-returns`,
`sharpe-ratio-1994`, plus the four already used by mission 5.

**Failed (403), must not be cited:** `finra-concentration-risk`,
`sec-form-n1a`, `sec-nport-datasets`.

---

## 3. Mission-by-mission

### Mission 10 — Passive core, or a defensible edge · `pb-10`

**Status: was wrongly called "unblocked" here. Corrected 2026-08-14.**

The claim below conflated two different evidence needs and should not be used to
schedule work. See `docs/mission-10-gate-and-build-plan.md` §2.

- The **current active/passive base rate** is closed: `morningstar-active-passive-2026-06`
  is fetched at 200, 1.1 MB, hashed, provenance `ok`. Sessions 35 and 36 have
  tier-2 captions. That much of the original claim holds.
- The narrower **current winner-persistence** claim was *not* closed. Only the
  S&P DJI Persistence Scorecard supplies it, and it has no cached artifact.
  `docs/source-audits/mission-10-architecture-edge.md` (authority rank 4) said so,
  and `pb-10`'s `sourceGap` field in `data/courses/portfolioBuilder.ts` agrees.

Re-probed 2026-08-14: the S&P PDF, its article page, **and `spglobal.com/robots.txt`**
all return HTTP 403. That is a host-level block on the whole domain, not the
missing-user-agent problem this plan diagnoses for the SEC 403s below — no honest
pipeline configuration fixes it.

Gate A was instead closed on 2026-08-14 by **stakeholder-approved narrowing**: the
current-persistence claim is removed, and persistence is taught as method from
Sessions 36 and 7. Mission 10 is buildable under that narrowed scope.

- **Reads:** Friction Budget (mission 8) and Evidence Test Checklist (mission 9).
  A claim failing either is not an edge — this is the mission's spine.
- **Sources:** S35, S36 (manager records, survivor bias, the five named reasons
  active managers fail), S7, S8, S6 + Morningstar for the current base rate.
- **Quarantine:** every historical persistence figure in S35–S37 is dated and
  superseded by the Morningstar artifact. Do not present a 2012-era percentage as
  the current base rate.
- **Artifact:** Architecture and Edge Decision.
- **Risk to watch:** this mission can very easily become prose. The decision is
  binary and consequential, so the interaction must make the learner's own
  friction and evidence numbers do the arguing.

### Mission 11 — Timing policy · `pb-11`

**Status: partially blocked — session 32 narration only.**

- **Sessions 30, 33, 34:** tier 2, ready.
- **Session 32:** slides and quiz are tier 1 and usable; narration is ASR only.
  Either reconcile the ASR against the slides and record it as reconciled, or
  build from slides and quiz alone and state that session 32 narration was not
  used. The second is cheaper and probably sufficient.
- **Depends on mission 5** (a strategic allocation must exist to deviate from) —
  now built.
- **Quarantine:** S30's 93.6% attribution sentence, the missed-month figures and
  the 70–80% timing claims are all dated and already quarantined by the mission 5
  audit. They stay quarantined.
- **Artifact:** Timing Policy.

### Mission 12 — Holdings slate · `pb-12`

**Status: blocked — two sources 403.**

- `sec-funds-and-etfs`, `sec-order-types`, `sec-brokerage-accounts` and
  `sec-edgar` are all 200 and cover product types, order mechanics, account
  opening and filing access.
- **`sec-form-n1a` (403)** and **`sec-nport-datasets` (403)** are the gap:
  prospectus structure and fund holdings data. Without them the mission can teach
  *what to look for* but cannot teach reading a real prospectus or holdings file.
- **Recommendation:** re-fetch both with a proper user agent — SEC blocks default
  agents, which is the likely cause of a 403 on a public document. If they stay
  403, narrow the mission's scope explicitly rather than substituting a secondary
  summary.
- **Note:** S37's product landscape predates the modern ETF market. Cost,
  structure and tracking practice all come from current sources or not at all.

### Mission 13 — Operating plan and IPS · `pb-13`

**Status: unblocked.**

- **Rebalancing:** `vanguard-rebalancing-edge` (200, 1.18 MB) — this is the
  method source curriculum §6 said was missing.
- **IPS structure:** `cfa-ips-individual` (200).
- **Tax:** `irs-pub550`, `irs-pub590a`, `irs-pub590b` (all 200, current).
- **Sessions:** 6, 36, 38 all tier 2.
- **Closes the loop:** S38's misfit test is applied to the finished dossier. Note
  the curriculum map still says session 38 "returns in Mission 10" — that is the
  superseded ten-mission spine and should read mission 13.
- **Artifact:** Operating Plan and IPS. This is the capstone: it reads every
  prior artifact.

---

## 4. Sequence

| Order | Mission | Why here | First deliverable |
| ---: | --- | --- | --- |
| 1 | **10** | Unblocked, and it is the course's payoff decision; missions 8 and 9 exist only to feed it | Source audit + claim-level coverage matrix reconciling S35/S36 against the current Morningstar barometer |
| 2 | **11** | Unblocked but for one narration; depends on mission 5, which now exists | Decide the session 32 narration question, then the coverage matrix |
| 3 | **13** | Unblocked, but it is the capstone and reads every artifact, so it should follow the missions that produce them | Coverage matrix across rebalancing, tax and IPS sources |
| 4 | **12** | Genuinely blocked on two 403s | Re-fetch `sec-form-n1a` and `sec-nport-datasets` with a compliant user agent |

Mission 12 moves last not because it is least important but because it is the
only one whose blocker is a source we do not currently hold.

---

## 5. Definition of done, per mission

A mission is not done until all of these are true and evidenced:

1. Source audit passed, with a claim-level coverage matrix citing slide pages or
   caption timestamps, and the tier of every narration citation.
2. Every number independently recomputed, and named standard quantities checked
   against their originating primary source.
3. Learner sequence: introduce → model → guided practice → independent
   application → assessment, with every assessed idea introduced earlier.
4. The lesson walks in the typography gate, all stages, at most one keyed stage.
5. **Screen budget measured at six widths and reported in screens.**
6. Browser walk of every stage, desktop and mobile, by a person or an agent with
   working browser access — not code inspection.
7. All five commands green, including `npm run build`.
8. Release evidence states only what was actually run, with the failures.

---

## 6. What I would fix before starting

Three things are outstanding and will bite whoever picks this up:

- **PR #3's Vercel deployment fails** on missing `NEXT_PUBLIC_SUPABASE_*` env
  vars. Operator step, unresolved since the PR opened.
- **One e2e test is red** — mission 5's preflight retry scenario.
- **Nothing since `adb479b` is committed** — two whole missions plus the layout
  redesign sit uncommitted.
