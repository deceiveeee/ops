# Studio Portfolio weights: bounded comparison method

Method review: 2026-09-25. Scope: compare the saved target allocation with an edited proposal, check both against the same saved limits, and explain each holding's contribution to one hypothetical stress scenario. This audit does not specify an optimizer, a covariance estimate, a return forecast, or investment recommendations. Application and visual verification are separate release gates.

## 1. Sources and edition lock

This workspace extends existing audited Studio arithmetic. No course session or new source-derived model is introduced.

| Source | Reviewed scope | Supported use and limits |
| --- | --- | --- |
| Morgan Stanley Wealth Management, Dan Hunt, [Why Having a Goal Is Key to Investing](https://www.morganstanley.com/articles/investing-goals-achieving-your-objectives), February 11, 2026 | Full article body and disclosures read on September 25, 2026 | Goals, resources, horizon and risk inform the broad allocation; progress requires review. Its example allocations, age cutoffs and market-cycle claims are not defaults in this workspace. It supplies no universal security-weight formula. |
| SEC Office of Investor Education and Advocacy, [Beginners' Guide to Asset Allocation, Diversification, and Rebalancing](https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset) | Full page retrieved on September 25, 2026; relevant allocation, diversification and rebalancing text read | Allocation divides a portfolio among investment categories. Diversification operates both across and within categories. Rebalancing restores a chosen mix and can involve costs and taxes. The guide does not endorse this tool's particular calculation or a recommended weight. |
| Existing [Mission 5 audit](mission-05-allocation.md), locked 38-session Damodaran *Investment Philosophies*, second edition, 2012; Vanguard *Principles for Investing Success*, 2023 | Existing complete-review ledger and numerical/source boundaries checked; primary decks and captions were not re-audited in this bounded extension | Retain the existing definitions of willingness, capacity, whole-portfolio loss contribution and explicitly hypothetical stress arithmetic. Ready / Steady / Grow and the sizing examples remain OPS adaptations. |
| Existing [Studio goals and limits plan](../design/studio-goals-and-limits-plan-2026-09-24.md) and [valuation/weights proposal](../design/studio-valuation-and-portfolio-weights-2026-09-20.md) | Existing method and implementation boundaries read | Whole portfolio is the denominator for limits. Original plan inputs and user limits retain their meanings. Candidate comparison is an OPS design. |
| Existing [total-return/valuation audit](studio-total-returns-and-valuation-workspace.md) | Return conventions and valuation boundary reviewed | Imported histories are not expected returns, and available histories do not establish a covariance model. Saved present-value estimates do not become return estimates or weight recommendations. |

Morgan Stanley Counterpoint Global's *BIN There, Done That* is architecture background already recorded in the September 20 proposal. Reopening its PDF on September 25 timed out; no new complete review or quantitative support is claimed here. This workspace must not be presented as Morgan Stanley's proprietary portfolio construction process.

## 2. Coverage and learner sequence

| Definition, claim or interaction | Basis | Prerequisite and introduction |
| --- | --- | --- |
| A weight is the fraction of the portfolio allocated to a holding | Allocation definition; elementary percentage arithmetic | State the denominator beside the editable field before asking for a weight. |
| Reserved and unassigned money remains cash | Existing Studio allocation convention | Show the total budget, reserve and remaining investable amount together. |
| Editing a weight changes dollars, cash, checks and scenario result | OPS adaptation of existing `calculateStudio` | Model one holding's whole-portfolio share before showing the contribution calculation. |
| Compare saved weights with proposed weights under identical assumptions | OPS comparison design | Label the two states explicitly; the saved target allocation is different from recorded current market values. |
| A holding's scenario change is its dollar amount multiplied by its assumed percentage change | Previously audited Mission 5 arithmetic, signed generalization | Define a hypothetical scenario and explain percentage points. Example: 5% of the portfolio falling 30% costs 1.5% of the portfolio. |
| A positive contribution can offset a negative contribution in the selected scenario | Signed arithmetic, not a diversification guarantee | Keep signs and the cash row visible. Do not normalize all contributions to positive shares. |
| Saved goals and limits explain whether a proposal fits stated constraints | Existing limits implementation | Distinguish not set/not checked from met and not met. All checks use the same whole-portfolio denominator. |
| A saved valuation can be opened as evidence for a holding | Existing valuation model and saved record | Explain that estimated present value is not a future selling price, expected return, or prescribed weight. |
| Apply proposed weights explicitly | OPS interaction and persistence policy | Preview edits before changing the saved target allocation. Explain what is saved. |

There is no new graded assessment in this workspace. The interaction sequence is definition and denominator, inspect saved allocation, edit proposed weight, inspect its effect, review limits, explicitly apply.

## 3. Allocation identities and comparison contract

Let `B` be the positive whole-portfolio budget, `R` the reserve with `0 <= R <= B`, and `I = B - R`. Let `a_i` be a saved target percentage of the money after the reserve, with `0 <= a_i <= 100` and `sum(a_i) <= 100`.

Before cent rounding:

```
holding dollars_i = I * a_i / 100
whole-portfolio weight_i (%) = (I / B) * a_i
cash dollars = R + I * (1 - sum(a_i) / 100)
cash weight (%) = 100 - sum(whole-portfolio weight_i)
```

Both candidate calculations must use the same budget, reserve, holdings identities, instrument classifications, scenario and limits. Edit only target weights for this bounded comparison. Display differences in weights as percentage points. Use `calculateStudio` for target dollars, conserved cents, total cash and stress amounts rather than building a second dollar-allocation engine.

If the editable field uses whole-portfolio percentages `w_i`, convert explicitly with `a_i = w_i * B / I`, only when `I > 0`. A reserve equal to the entire budget permits only zero-dollar holdings; no division by zero is allowed. Do not silently relabel the stored after-reserve percentage as a whole-portfolio percentage.

The saved allocation means current saved target weights. Recorded `currentValue` and `currentCash` instead produce their own denominator, `currentTotal`. Comparing those actual values against a differently sized target budget would mix a change in capital with a change in weights. A future actual-versus-target mode must distinguish and reconcile both totals.

Blank, malformed, nonfinite, negative and over-100 entries stay incomplete/invalid. A sum above 100% must not be normalized into an apparently valid proposal. Zero allocation and a total below 100% are valid: the remainder is cash. Missing catalog instruments invalidate the calculation and remain visible; never quietly omit them or assign them a proxy. Invalid calculations currently contain zero-valued placeholders, which must not be displayed as a valid no-loss outcome.

## 4. Signed stress contribution

Use the same saved asset-class scenario for both allocations. Let `s_i` be a signed assumed percentage change, and `s_cash` the cash assumption:

```
holding change_i ($) = holding dollars_i * s_i / 100
cash change ($) = cash dollars * s_cash / 100
portfolio change ($) = sum(holding change_i) + cash change
contribution_i (percentage points) = holding change_i / B * 100
portfolio change (%) = portfolio change / B * 100
```

Keep the sign: a gain offsets a loss only inside this specified scenario. Prefer a label such as **Contribution to this scenario** with dollars and percentage points. These are not volatility contributions, probabilities, expected returns, a maximum possible loss, or a covariance-based risk decomposition. A zero net portfolio change can contain large offsetting changes, so never divide contributions by the total portfolio change.

Reuse the existing calculation's cent-rounded row changes. Derive a separate cash row from `targetCash` and the cash shock, or equivalently from the difference between the total scenario change and summed row changes. The displayed total must reconcile with row changes plus cash. Rounding can create a tiny difference between unrounded weight-times-shock arithmetic and dollar-based displayed contributions.

`calculateStudio` maps US, international and global stocks separately, and fixed income to the saved bond shock. Its current catalog has no holding of asset class `cash`. The generic fallback currently gives such a hypothetical future instrument zero change, whereas reserved/unassigned cash receives `cashPct`. Before a cash-class instrument is introduced, align that behavior and test it. A Treasury fund currently classified as fixed income retains the bond shock; do not reclassify it as reserved cash without a separately reviewed rule.

## 5. Limits and scope

Reuse `checkPortfolio` against each valid allocation, with the same limits:

- Bills: cash covers the sum of listed amounts. This is a present cash-coverage check, not a dated cash-flow projection; dates do not establish future funding.
- Slices: classified whole-portfolio weights, including reserve/unassigned cash in Ready, fit the user's set ranges. Unclassified amounts must remain visible.
- Caps: direct individual stocks and funds are tested against their respective saved cap. This is not an issuer exposure limit including fund look-through.
- Loss budget: `max(0, -scenario change)` is no greater than the allowed whole-portfolio loss. The allowed percentage is the smaller of willingness and capacity when capacity is given.

An explicit capacity of 0% is a real zero-loss constraint. This review found that `checkPortfolio` previously reported it as not checked. The bounded correction distinguishes explicit zero capacity from the existing legacy convention of willingness zero with capacity unset; the latter remains not checked. A zero-capacity plan with a negative scenario change fails; one with no scenario loss passes. The existing half-cent dollar comparison tolerance is numerical display precision, not permission to exceed a loss budget economically.

Do not expose the existing individual weight ceilings as executable safe maximum weights. They hold other holdings still and fund an increase from cash, but do not independently enforce cash availability, required bills or every lower slice bound. The new comparison should show exact candidate checks and contributions. It must not imply that passing the selected checks proves every real-world limit is satisfied, nor claim global mathematical infeasibility because one candidate fails.

## 6. Independent reference cases

All numbers below are original OPS hypothetical examples. Direct PowerShell arithmetic independently verified the main saved/proposed and offsetting cases on September 25, 2026; it did not call the implementation.

For a $100,000 budget with $20,000 reserved, $80,000 is available after the reserve. Saved after-reserve weights are stock fund 50%, company 10%, bond fund 25%. The proposal changes only the company to 6.25%. Stocks fall 30%, bonds 10%, cash 0%.

| Result | Saved | Proposed |
| --- | ---: | ---: |
| Stock fund dollars / whole weight | $40,000 / 40% | $40,000 / 40% |
| Company dollars / whole weight | $8,000 / 8% | $5,000 / 5% |
| Bond fund dollars / whole weight | $20,000 / 20% | $20,000 / 20% |
| Total cash | $32,000 / 32% | $35,000 / 35% |
| Company's scenario change | -$2,400 / -2.4 points | -$1,500 / -1.5 points |
| Portfolio scenario change | -$16,400 / -16.4% | -$15,500 / -15.5% |
| Under a 5% direct company cap | Not met | Met |
| Under a 15% loss capacity and 20% willingness | Not met | Not met |

Reducing the company meets its cap and reduces the modeled loss by $900, but does not make the whole portfolio meet its loss budget. This distinguishes an individual cap from a complete allocation decision.

Further acceptance cases:

- Offset gains and cash loss: $50,000 stocks at -30%, $30,000 bonds at +10%, $20,000 cash at -2% produce -$15,000, +$3,000, -$400: total -$12,400 / -12.4%. Contributions are -15, +3, -0.4 points.
- At zero allocation the whole budget remains cash and takes the chosen cash shock. With cash shock 0%, explicit zero loss capacity is met. With any material negative portfolio change it is not met.
- A proposal totaling 125% after the reserve is invalid; it receives no valid scenario result or passing checks.
- Reserve equal to budget leaves zero investable dollars. A zero budget has no meaningful weight denominator and is invalid.
- A missing instrument prevents aggregate calculations; it cannot disappear from the comparison.
- Gains and losses that net to zero still show their signed contributions without division by zero.
- A company with an attractive saved valuation receives no automatically generated weight or expected return.

## 7. Audit conclusion and remaining release evidence

The bounded comparison uses the existing, traceable OPS scenario arithmetic and source-supported goal/constraint structure. Public firm material supports the process, not a proprietary formula or recommended allocation. No new source-defined stress magnitudes, model weights, probabilities or default caps are introduced.

The zero-capacity correction adds unit cases for positive and zero willingness, an actual modeled loss, and a zero-loss allocation. The existing unset-zero convention test remains. Backend review passed 114 tests across seven relevant files, including stale assumption and buying-input guards, snapshot isolation, import validation and property-order independence. The full unit suite passed 1,169 tests across 86 files.

Five workspace browser tests passed, including the independently worked example above, valuation snapshot preservation, draft recovery across navigation and mode changes, invalid weights, keyboard interaction and safe selection. All five views fit 1.29–1.49 screens at the six required widths, with zero horizontal overflow or page errors. Independent visual and wording review found and resolved an ambiguous loss attribution, duplicate valuation actions and singular wording. See the [implementation and release record](../design/studio-portfolio-weights-2026-09-25.md) for consolidated production-build and browser-suite evidence.
