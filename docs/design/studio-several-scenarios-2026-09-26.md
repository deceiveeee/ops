# Several scenarios, 26 September 2026

Step 4 of the [valuation and portfolio weights plan](studio-valuation-and-portfolio-weights-2026-09-20.md)
lists joint stress tests. Until now Studio held one hypothetical scenario: four
assumed price changes (US stocks, international stocks, bonds, cash) on Risk
and cost. A mix can fit one scenario and fail another, so the learner can now
keep up to five, and the loss budget is checked against the worst of them.

## Source basis

No new source or model is introduced. The [Mission 5 audit](../source-audits/mission-05-allocation.md)
treats a stress loss as `sum(weight × assumed loss)`, an OPS teaching model to
be labelled hypothetical and learner-owned, "not a forecast, bound, VaR, or
maximum drawdown". The plan records that stress magnitudes and acceptance
thresholds are OPS or learner choices. So Studio supplies no scenario numbers:
a new scenario starts as a copy of one the learner already set, and every
scenario is priced by the same function (`scenarioResult`) as the first. The
"worst" is the scenario that loses most for the current weights; the page
says it is not the worst that could happen.

## What changed

- **Saved data.** The first scenario is still `stress`; `scenarioName` names it
  and `scenarios` holds up to four more. Both are optional, so older work and
  backups read as one scenario. Validation refuses a sixth scenario, a change
  outside −100% to +100%, a repeated or reserved id, a name over 60
  characters and unknown fields. Removing the first promotes the next.
- **Checks.** With one scenario every check reads exactly as before. With
  several, the loss check is titled "Every scenario stays within your loss
  budget" and names the worst ("This allocation loses $13,400 in “Stocks
  fall”, the worst of your 3 scenarios"). Each holding's room under the loss
  budget is the tightest across scenarios and names it. Saved weight
  proposals record the scenarios, so a later change asks for a fresh proposal;
  proposals saved before scenarios existed are unaffected.
- **Risk and cost.** Two views: Scenarios, and Costs and overlap (the yearly
  cost and owned-twice cards, unchanged). One scenario looks as before, with
  "Add a second scenario" and one sentence on why. With several: an editor for
  one scenario (its name and four changes, two to a row on a phone), and a
  table of all of them, largest loss first, each against the loss budget and
  the worst marked; each name opens it in the editor. One sentence below the
  table names the worst, says what "worst" does not mean, and, when it is over
  budget, that the weights or the limit must change.
- **Compare allocations.** With several scenarios, the loss view picks which
  one to explain, opening on the one worst for the proposal.
- **Text export.** Lists every scenario's assumptions and the selected
  allocation's result, labelled as assumptions, not forecasts.
- **Two existing faults fixed.** The Risk warning compared the size of the
  change with the budget, so a gain larger than the budget read as a loss; it
  now uses the loss, and treats an explicit 0% capacity as a limit, as the
  checks do. Weights over 100% showed placeholder zeros as a result; the page
  now asks for the weights to be fixed first.

## Worked example (OPS hypothetical)

$100,000 with $20,000 in reserve; VTI $40,000, AAPL $8,000, AGG $20,000,
$32,000 cash; loss budget 12% = $12,000.

| Scenario | US stocks | Bonds | Cash | Result | Budget |
| --- | ---: | ---: | ---: | ---: | --- |
| Stocks fall | −30% | +5% | 0% | −$12,000 − $2,400 + $1,000 = −$13,400 | Over, worst |
| Rates rise | −15% | −12% | 0% | −$6,000 − $1,200 − $2,400 = −$9,600 | Within |
| Inflation | −10% | −15% | −3% | −$4,000 − $800 − $3,000 − $960 = −$8,760 | Within |

VTI's room: 40% + (12% − 13.4%) / 0.30 = 35.3% in Stocks fall, 56% in Rates
rise, 86.3% in Inflation, so Stocks fall sets it. AGG rises in Stocks fall, so
Rates rise sets its room: 20% + 2.4% / 0.12 = 40%.

## Verification

Unit tests (`lib/studio-project/scenarios.test.ts`) check the table above, the
worst wherever it sits in the list, each holding's tightest room, unchanged
single-scenario wording, add/edit/rename/remove, backups with and without
scenarios, six refused inputs, the text export and proposal review. The three
worst-scenario tests fail when the checks ignore the extra scenarios. The
engine refactor left all 1,173 existing unit tests passing.

Browser tests (`e2e/studio-scenarios.spec.ts`), the first for this page: add,
name, edit (by keyboard from the table) and remove; the worst named on Risk,
in Portfolio's room text and in Compare allocations; a gain never counted as
a loss; no result for weights over 100%; the Costs and overlap view; and one,
three and five scenarios at six widths.

Screens at a 900px viewport (`.agent-shots/risk-scenarios-report.md`):

| Scenarios | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Before this change, one | 2.32 | 1.87 | 1.71 | 1.44 | 1.41 | 1.41 |
| One | 1.79 | 1.60 | 1.44 | 1.17 | 1.17 | 1.17 |
| Three | 1.87 | 1.81 | 1.65 | 1.38 | 1.35 | 1.35 |
| Five | 1.97 | 1.89 | 1.73 | 1.46 | 1.43 | 1.43 |

No horizontal overflow or page errors.

Release checks, 26 September: TypeScript passed; lint passed with the two
existing onboarding warnings; unit tests passed 1,189 of 1,189 (87 files); the
production build passed; the full browser suite passed 238 tests with 5
optional or environment-dependent skips and no failures. The one-, three- and
five-scenario pages and the Compare allocations picker were also checked by
hand in the browser against the worked figures.

## Open

Below 1280px the page still exceeds 1.5 screens, as it did before. Most of the
excess is Studio's shared "Before you start" guidance and summary strip, which
the frame places above the work on narrow screens for every stage page
(Portfolio, Risk and cost, What to buy, Review) so a first-time learner reads
the definition before the questions. Changing that is a Studio-wide decision,
recorded here rather than made inside this feature.

## Merged with the Risk tabs from main, 29 September 2026

Main (#17) split Risk and cost into three tabs, **Loss scenario**, **Fund costs**
and **Overlap**, so each fits a phone, put the loss budget beside the scenario's
result, and made one rule, `scenarioLoss`, for the limit check and the Risk
page. The merge keeps all of that and this work's several scenarios:

- `scenarioLoss` now takes a scenario's change, so the check, the Risk page and
  the scenario table use one rule for the worst scenario.
- With several scenarios the first tab reads "Loss scenarios (n)"; the editor,
  table and sentence about the worst are unchanged.
- With one scenario, "Add a second scenario" is a link beside "Assume prices
  change by" rather than a row of its own: the tab is 1.47 screens at 390px
  (main's limit is 1.5). What the worst of several means is said once there
  are several.
- Review's limits line and the text export now test every scenario, as
  Portfolio, Compare allocations and the side column already did.
- Several scenarios below 1280px are still over 1.5 screens (three: 1.75 at
  390, 1.55 at 1024), as recorded above.
