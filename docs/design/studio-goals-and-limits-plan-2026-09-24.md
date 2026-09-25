# Studio: goals and limits — plan

Status: agreed 24 September 2026, with all four decisions as recommended, and being built
in the order at the end. This is step 2 of the order in
`studio-valuation-and-portfolio-weights-2026-09-20.md`.

## The problem, in one paragraph

Today a learner can type why they are investing, when they need the money, how much they
have, how much to keep as cash, what they add each month, a loss they could live with, and a
free-text box of other limits. Studio checks almost none of it. When they set weights in
Portfolio, nothing says whether the portfolio fits their limits, and nothing explains why a
holding should get 3% rather than 10%. One of the checks that does exist disagrees with
itself (see "A contradiction to fix first").

## What a learner will be able to do

1. **State their limits as numbers Studio can check**, on the Goals page they already use.
2. **See beside every weight in Portfolio whether it fits**, and which limit holds it back:
   "AAPL is at 8%. Your cap for one company is 5%."
3. **Get told when their own limits cannot all be met**, with the sums, and what they could
   change. Studio never changes a limit to make the portfolio pass.

## What they will enter

Every percentage is a share of the **whole portfolio, cash included**. That matches how the
Portfolio table already shows each holding's "Of the whole portfolio".

| On screen | What it means | Example | New or existing |
| --- | --- | --- | --- |
| Cash you will need, by date | Each known bill: amount and date. Mission 5 calls money kept for one a **liquidity bucket**. | $8,000 for tuition in March 2028 | New. "Keep aside as cash" stays as it is; Studio checks that the cash covers these bills and shows any gap. |
| Loss you could live with | The fall you could sit through without selling. Mission 5 calls this **willingness**. | 20% | Existing field, meaning made explicit. |
| Loss you could afford | The fall your finances could take without missing a bill. Mission 5 calls this **capacity**. | 15% | New. The smaller of the two becomes the **loss budget**, Mission 5's word, and Studio says which one set it. |
| Slice targets and ranges | A long-run target for each slice, with the range it may drift within before a review. | Grow 60%, range 55–65% | New in Studio; Mission 5 already teaches **slice**, **strategic weight** and **target range**. |
| Cap for one company | The most any single company may be. | 5% | New. |
| Cap for one fund | The most any single fund may be. | 40% | New. |

The slices are Mission 5's, which groups money by the job it does: **Ready** for bills due
soon, **Steady** for stability, **Grow** for long-term growth. Studio will sort holdings by
what they are: cash into Ready, bonds into Steady, and stocks into Grow, both companies and
stock funds. That sorting is Studio's rule, not the lesson's (decision 2). As Mission 5 says,
none of the three is safe; bonds can fall too. Every new limit starts as **not set**, and an
unset limit is reported as "not checked yet", never as a pass.

## What Studio will check

| Check | Passes when | What the learner sees if not |
| --- | --- | --- |
| Bills are covered | Cash is at least the total of the bills listed. | "Your bills need $8,000; the portfolio holds $5,000 as cash." |
| Slices sit in their ranges | Each slice's share is inside its range. | "Grow is 72%; your range is 55–65%." |
| No holding is too large | Each company and fund is at or under its cap. | "AAPL is 8%, 3 points over your cap for one company." |
| A bad scenario stays within the loss budget | The loss in the price falls set on the Risk page stays within the loss budget. | The loss, the budget, and the three holdings adding the most loss. |

Beside each holding, Portfolio shows **what limits this weight**: the tightest of its cap,
the room left in its slice's range, and its share of the loss budget. This is the answer to
"why 3% and not 10%".

## Worked example

Original OPS numbers, not advice, taken from the valuation design note. The portfolio holds
$100,000, including $20,000 of cash for bills.

- The learner allows any one company to cost at most 1.5% of the whole portfolio in their
  scenario, and the scenario has that company fall 30%. Its weight must satisfy
  weight × 30% ≤ 1.5%, so **weight ≤ 5%**. At 8% it would lose 2.4%, which is $2,400. At 5% it
  would lose 1.5%, which is $1,500.
- Studio stores weights as a share of the money after cash. A $5,000 holding is 6.25% of the
  $80,000 invested, and **5% of the whole $100,000**. Limits are checked against the second
  figure.

A worse fall than the scenario's breaks that budget. The ceiling is a consequence of the
learner's own assumptions, not a safe maximum.

## A contradiction to fix first

"Loss you could live with" means two things today. The Goals page applies it to the money
after cash: $10,000 with $2,000 set aside at 20% shows a **$1,600** loss. The Risk page applies
it to everything, and warns only past **$2,000**. The plan makes both use the whole portfolio,
so Goals will show $2,000 for that example.

## What each rule rests on

| Rule | Basis | Status |
| --- | --- | --- |
| Goals, dates and bills shape the mix | Damodaran Session 1; Vanguard principles pp. 5–8. Both are reviewed in `docs/source-audits/mission-05-allocation.md`. | Backed by those sources |
| Willingness and ability to take a loss are different | Vanguard p. 8 (same audit) | Backed by that source |
| Sizing needs inputs, limits and an aim | Morgan Stanley, *BIN There, Done That*, pp. 6 and 8 (valuation design note, S3) | Backed by that source |
| Spreading money across companies | Vanguard p. 12 (same audit) | Backed; no source gives a cap number |
| Slices, strategic weights, target ranges | Mission 5 audit: OPS teaching terms built on Investor.gov and Vanguard | OPS teaching, labelled as such |
| Loss = weight × assumed fall; ceiling = allowed loss ÷ assumed fall | Mission 5 audit: OPS teaching model | OPS teaching; every scenario is labelled hypothetical |

No limit gets a default number. The research handoff is explicit that a historic 8%, 15%
or 25% limit is not an OPS default just because it appears in the documents.

## Not in this step

- Whether the goal amount is reachable. That needs dated contributions and an inflation rule,
  so it gets its own specification.
- Comparing whole allocations, or any optimiser. That is the next step, and it builds on these
  limits.
- Caps by industry, and seeing inside funds. That needs data on what each fund holds.
- Taxes.

## Decisions, agreed 24 September

1. **Whole portfolio for every limit, cash included.** Agreed. It fixes the contradiction
   above, and it changes the loss figure shown on Goals for anyone with cash set aside.
2. **Slices assigned automatically by what each holding is.** Agreed. Letting a learner
   move a holding to another slice can come later.
3. **Limits start unset, with no suggested numbers.** Agreed, because no reviewed source
   supplies one. The existing "Loss you could live with" still starts at 20% for a new
   project; whether to clear that too is an open question.
4. **Keep the free-text "Anything that limits your choices" box** for limits Studio cannot
   check yet. Agreed.

## How we will know it works

- Checks computed on hand-worked cases, including the example above, each written as a test
  first and seen failing.
- Limits that cannot all be met produce an explanation and no false pass. Example: Grow at
  least 70%, a 10% loss budget, and a scenario where stocks fall 30%. The 70% of stocks alone
  loses 21%, which is above 10%.
- Saved work from before this change opens with every new limit unset and nothing else
  altered.
- Changing a limit marks the decisions it affects for review. Studio has a place to store
  decision records, but nothing writes to it yet, so this is built with step 3.
- A read-through as a first-time learner: every term is taught or explained before it is
  used, and the wording is plain.
- Every page within the screen budget at 390, 768, 1024, 1280, 1440 and 1920 px, with nothing
  scrolling sideways. Checked with a screen reader and with touch emulation.

## Build order

Each step is tested and committed on its own.

1. Save the new limits, open older saved work safely, and validate backups.
2. Goals page: bills by date, willingness and capacity, slice targets and ranges, and caps.
3. Portfolio: the checks and "what limits this weight". The Risk page uses the same loss
   budget.
4. Review and downloads: limits appear in the operating rules and the exported copy.
