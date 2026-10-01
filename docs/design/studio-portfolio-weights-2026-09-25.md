# Portfolio weights, 25 September 2026

## Purpose and method

`/studio/portfolio/weights` connects saved valuations to the allocation decision.
The learner edits a proposal, compares it with the selected target allocation,
reviews existing limits and one assumed market move, then saves and explicitly
selects an allocation. Valuation's Value view links here; Portfolio navigation
calls it **Compare allocations**.

The [method and source audit](../source-audits/studio-portfolio-weights.md)
records the public Morgan Stanley and SEC process references and the existing
OPS arithmetic. These sources support starting with goals and constraints.
This is an OPS comparison tool, not a firm's proprietary allocation model.
It does not turn a valuation price gap into an expected return or produce
optimal weights. Covariance, an efficient frontier and return optimization are
outside this implementation.

## Interaction and learning sequence

The Weights view introduces the denominator before the first weight input:
total budget minus reserve equals the amount to allocate. Each proposed
percentage shows its dollars and its share of the whole portfolio. The selected
column holds the saved target weight. Reserved and unassigned money remain
cash, shown in paired bars. Actual recorded market values use a separate
denominator elsewhere and are not relabelled as these target weights.

Limits compares both allocations against the same goals. Bills, slice ranges,
holding caps and the loss budget retain the existing meanings. The explanation
explicitly identifies the proposed allocation. Unset limits remain **Not
checked**. A direct company cap does not include a fund's underlying holdings.
An explicit zero loss capacity is now checked as a real zero-loss constraint.

Loss scenario first models how a weight contributes to the portfolio change:
10% of the portfolio falling 30% subtracts 3 percentage points. It then shows
the selected and proposed totals, signed holding contributions, and a cash
row. Its assumptions are visible. Gains offset losses only within this assumed
scenario; these numbers are not volatility contributions or return forecasts.

A company's **Valuation +** action opens compatible completed saved cases.
Known ticker, SEC issuer and traded-share ratio must match; worked examples
are excluded. A manually investigated company with no known issuer or ticker
can match its exact company name, with an explicit warning to confirm the
listing and share ratio. Choosing a case previews a link. Saving preserves the
complete valuation record, including inputs, source and date. Later changes
or deletion of that live valuation never rewrite the retained record; refresh
and unlink are explicit.

**Review proposal** opens the name and reason fields. Save creates a separate
alternative and preserves the current one. **Use this allocation** is a second,
explicit action, recorded with the reason and both allocation IDs. Exceeding a
user limit remains visible but does not prevent an intentional selection.
Invalid percentages, a missing reason or an invalid calculation prevent it.

## Persistence and stale data

Unsaved previews are cached by project and starting allocation in the browser
tab's session storage. They survive visiting Goals or Valuation, reloading,
switching modes and choosing a different starting allocation. They are not
part of the durable project or its exported backup until saved. Reset and a
successful save clear the preview. If the browser cannot cache it, the page
warns, guards navigation and blocks a mode switch that would lose it.

Each saved proposal also keeps its goals, limits and scenario. A later change
requires a fresh reviewed proposal before selection. The comparison itself
uses current settings, stated beside the notice. Comparison is insensitive to
object property order. An old proposal cannot replace newer holdings, current
cash, contributions, recorded values, quotes or fees. Start from the selected
allocation when those inputs differ. A concurrent change to the starting
allocation is caught inside the queued save and offers an explicit discard
and reload action.

The new optional fields remain valid in project backup and restore. Old
backups without them are accepted. Duplicate allocations deep-copy retained
valuation and comparison records. Removing a holding removes only its link.

## Responsive and accessibility review

Three holdings appear per page. Tabs support arrow keys, Home and End;
secondary views focus their heading, and saving or selection returns focus to
the allocation selector. Controls have visible labels, comparisons use table
headers, and limit statuses include text. Mobile Portfolio navigation uses a
disclosure to keep all five destinations available without consuming three
rows above the work.

All five views were captured at 390, 768, 1024, 1280, 1440 and 1920 pixels wide
with a 900-pixel viewport height. Final captures occupy 1.29–1.49 screens,
with zero horizontal overflow and zero page errors. No nested scrolling work
area is used. Evidence is in `.agent-shots/portfolio-weights-report.md` and its
30 matching PNGs. The initial review found a misleading loss attribution, duplicate valuation
links and singular wording, and repaired those findings. The completion review
below records the current inspection scope and two remaining P2 polish items.

## Verification

The six new browser tests cover independently worked dollars and scenario
contributions, limit comparisons, compatible valuation choices, save versus
select, unchanged original records, retained evidence after a valuation edit,
invalid inputs, keyboard tabs, draft recovery, stale limits, stale buying
inputs and all six responsive widths.

The full unit suite passed 1,169 tests in 86 files. The corrected explanation
and zero-capacity cases then passed their focused suite. TypeScript passed;
lint passed with two existing onboarding hook warnings. The unit test runner
now excludes the gitignored `tmp/` scratch checkouts, matching the TypeScript
exclusion, so copied older projects cannot run against this workspace's module
aliases. The production build and full browser results are recorded below.

## Completion review, 26 September

Work continued in the isolated `codex/portfolio-weights` worktree, based on
`90a7d4e`. The shared checkout and its preview build were preserved.

The previous full-suite failure was reproduced: adding the Portfolio weights
link below the price inputs pushed the filled-price view to 1.514 screens at
390px. The link now uses the existing step-header row, with a 24px minimum
click target. The same view measures 1.48 screens; every existing valuation
and return-history state still passes the six-width screen check.

A new browser regression test also reproduced a broken handoff from Valuation:
client-side navigation retained the loaded project, so the editor mounted
before the valuation ID was read from the URL. The editor now waits for that
entry state and focuses the matching holding's valuation heading. The test
uses keyboard navigation, confirms that choosing evidence remains a preview,
and checks that the saved project is unchanged.

Visual review inspected all five allocation states at 390 and 1440px, the
weights view at 1024, 1280 and 1920px, the scenario view at 768px, and the
filled-price valuation view at 390 and 768px. Automated captures cover all
five allocation states at every required width: 1.29–1.49 screens, no
horizontal overflow and no page errors. No P0/P1 defects remain in those
captures. Two P2 polish findings remain: native phone selectors truncate long
option labels (their full meaning remains visible in the table or footer),
and a one-share evidence record reads “1 company shares per traded share”.

The source scope and calculation boundary remain those of the existing audit:
user-entered weights, saved valuation evidence, and one hypothetical scenario.
No optimizer, expected return, probability or recommended weight was added.

### Final release checks

The first full browser run exposed a reader-test race: increasing viewport
height reveals footer links, whose Next.js prefetches were counted as report
repagination. A diagnostic run identified five such requests. The assertion
now counts only report-route requests without the prefetch header, requires
an initial fitted report request, and still requires a new request after
rotation. Production reader behavior is unchanged. The corrected case passed
12 consecutive runs before the final full suite.

| Check | Result |
| --- | --- |
| Full unit suite | 1,169 passed across 86 files |
| TypeScript | Passed |
| Lint | Passed; two existing onboarding hook warnings |
| Production build and full browser suite | 230 passed, 5 skipped, 0 failed; 3.4 minutes |
| Focused allocation and valuation-history browsers | 13 passed |
| Reader viewport regression, repeated | 12 passed |
| Allocation captures at all six widths | 30 captures; 1.29–1.49 screens; no horizontal overflow or page errors |

The final browser run used a fresh production build and four workers. Logs
remain in the isolated worktree as `browser-release-final.log`,
`unit-release.log`, `typecheck-release.log`, `lint-release.log`,
`weights-focused.log` and `reader-confirm.log`. The five skipped cases
remain excluded from the passing count. No failing case was skipped to obtain
this result.

Status: ready for review, with the two nonblocking visual polish items listed
above. Source scope, learner sequence, plain-language review, numerical
checks, persistence, keyboard use, screen measurements and visual review are
recorded separately; passing tests alone is not the basis for this status.

## Label polish after PR #13

PR #13 merged after its deployment checks passed. Its Vercel preview required
sign-in in the available browser, so no live-preview walkthrough is claimed.
The local production suite had already covered valuation entry, proposal
editing, saving, explicit selection and persistence.

The follow-up keeps native dropdown selection and keyboard behavior, with a
wrapping visible value and a visible focus outline. The native control retains
the complete option text for assistive technology; the repeated visual label
is hidden from screen readers. The check picker uses Bills, Slice ranges,
Holding caps and Loss budget, alongside the existing full check explanations.
Evidence now uses the singular “company share” when the numeric ratio is one.

This changes presentation and wording only. The source coverage, financial
arithmetic, persistence and learner sequence retain their audited boundaries.
The existing browser flow now exercises keyboard selection and the corrected
singular wording; its six-width capture uses long allocation and valuation
names. The initial long-name capture exposed a 1.519-screen phone scenario
view. Its heading is now “What drives the change?”, preserving the complete
explanation and bringing that state back to 1.49 screens.

Final checks passed: production build and full browser suite, 230 passed and
5 skipped in 6.4 minutes; TypeScript; lint with the same two existing onboarding
hook warnings. No failed case was skipped. The existing unit-suite result
above remains the last full unit run; this presentation-only follow-up did
not change financial calculations or storage logic.

All 30 captures at 390, 768, 1024, 1280, 1440 and 1920px fit within 1.29–1.49
screens, with no horizontal overflow or page errors. Visual inspection covered
all five states at 390 and 1440px, the scenario at 768px, and weights at 1024,
1280 and 1920px. P0: none. P1: none. P2: both previously recorded findings
are resolved; no additional defects were found in these inspected states.

A separate manual walkthrough in the local production build began with an
empty practice portfolio, added a hypothetical holding, saved a proposal,
confirmed that saving preserved the original selection, explicitly selected
the proposal, and verified the selection after reload. The phone dropdown
opened with a pointer, closed with Escape, retained its full wrapping name
and showed a visible focus outline. This one-holding state measured 1.27
screens, with zero horizontal overflow and no console errors.

Evidence: `polish-browser-full.log`, `polish-typecheck.log`,
`polish-lint.log`, and the refreshed
`.agent-shots/portfolio-weights-report.md` with its 30 images.

Status: Ready for review. The live Vercel preview remains unverified because
it required sign-in; the manual walkthrough and automated suite both used
the local production build.

## Review fixes from PR #12, reapplied to main, 27 September

PR #12 (Claude's review of the Codex branch, 26 September) was still open when
#13 and #14 merged Codex's own version to `main`. Its fixes are reapplied on
`feat/return-comparison`, based on `main` at `275dae3`, keeping #14's wrapping
selection controls and its heading "What drives the change?". The text below
is that review as written; its measurements and test counts describe the
PR #12 branch, and are re-verified for this tree in the return-comparison
record.

### The 26 September review

Codex stopped before its final run, so the work was moved from the
`codex/portfolio-weights` worktree onto `feat/portfolio-weights` in the shared
checkout (byte-for-byte copy, verified file by file) and reviewed there. The
calculation module, validation, persistence and hand-worked unit cases held
up. Four defects were found by exercising the page, not by reading the tests:

1. **Weights adding to exactly 100% could not be saved.** The preview rounds the
   total as `calculateStudio` does; saving compared the raw floating-point sum.
   5.4 + 69.9 + 24.7 adds to 100.00000000000001, so Save was offered and then
   refused with "exceed 100%". A search of two-decimal splits found the case
   common. Saving now rounds the same way. Three unit cases (each asserting its
   own floating-point premise) failed before the fix and pass after it; a
   browser case saves 5.4 / 69.9 / 24.7 through the page.
2. **Loss scenario rows did not add up to their total.** The table paged three
   holdings at a time, so page one of four showed rows totalling −$16,400
   under a −$18,000 headline. Rows now run largest change first; the rest are
   summed in one "1 more holding" row with **Show** (focus moves to its
   counterpart when rows are shown or hidden), and the cash row stays. A
   browser case sums the cells on screen and matches both totals.
3. **Choosing an allocation offered to save a duplicate of it.** After **Use
   this allocation**, the view became a save form named "… proposal proposal".
   The unchanged selected allocation now has nothing to save.
4. **Four holdings broke the screen budget.** The six-width test used three
   holdings, so the pager never appeared: with four, Weights measured 1.53 and
   Loss scenario 1.55 screens at 390 and 768px. Phone columns now keep each
   amount on one line, the scenario heading and intro are shorter ("Where the
   change comes from"; "10% of all money falling 30% subtracts 3 percentage
   points"), and spacing is tighter up to 1,100px, Studio's tablet breakpoint.
   A second six-width test now uses four holdings.

Also corrected: one page name, **Compare allocations** (the heading and the
Valuation link said "Portfolio weights"); **Add valuation** / **Valuation
kept**, named with the holding, in place of "Valuation +"; the evidence card
shows the entered price and date the price gap is measured from, "1 company
share", and readable dates; a way back to the weights from the evidence view;
a confirmation after saving; a hint when only the learner's name or reason is
missing; no focus jump on arrival; the Section menu's chevron on the phone
Portfolio menu; and 44px touch targets. Small links in header rows and
sentences extend their hit area on touch screens instead of growing the row;
an emulated touch phone confirmed taps 21px above and below the centre of all
six such controls land on them.

Screens at a 900px viewport, three holdings / four holdings:

| Width | Weights | Limits | Loss scenario | Evidence | Keep |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 390 | 1.40 / 1.46 | 1.44 / 1.44 | 1.41 / 1.46 | 1.45 / 1.45 | 1.36 / 1.36 |
| 768 | 1.43 / 1.48 | 1.37 / 1.37 | 1.43 / 1.49 | 1.45 / 1.45 | 1.34 / 1.34 |
| 1024 | 1.36 / 1.42 | 1.31 / 1.31 | 1.37 / 1.43 | 1.39 / 1.39 | 1.27 / 1.27 |
| 1280–1920 | 1.41 / 1.47 | 1.35 / 1.35 | 1.42 / 1.48 | 1.43 / 1.43 | 1.29 / 1.29 |

No horizontal overflow or page errors at any width. Evidence:
`.agent-shots/portfolio-weights-report.md`,
`.agent-shots/portfolio-weights-four-report.md` and their PNG captures, which
were read, not only measured.

Release checks, 26 September, on this branch: TypeScript passed; lint passed
with the two existing onboarding hook warnings; unit tests passed 1,173 of
1,173 (86 files); the production build passed; the full browser suite passed
234 tests with 5 optional or environment-dependent skips and no failures. This
includes Codex's report-reader test correction (`b6d3236`). Not inspected:
dark theme (Studio uses the site's fixed light theme) and a physical phone;
touch behaviour was checked in an emulated touch browser.
