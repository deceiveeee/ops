# Damodaran Session 5 source audit: Valuation — The Basics

Status: source gate passed with documented corrections

Audit date: 2026-08-09

## Edition and sequence lock

- Course: Aswath Damodaran, *Investment Philosophies*, official stripped-down webcast course.
- Sequence: the 38-webcast course page, not the later expanded overhead list.
- Session: 5 of 38, “Valuation: The Basics.”
- Companion chapter: Chapter 4, “Show me the money: The Basics of Valuation.”
- Book edition: second edition, John Wiley & Sons, printed in 2012.
- Official course index: <https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm>
- Official second-edition support page: <https://pages.stern.nyu.edu/~adamodar/New_Home_Page/invphil3edbook.htm>
- Official slides: <https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session5.pdf>
- Official test and solutions: <https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz5.pdf>

The slide PDF metadata calls the file “Session 6- Valuation.ppt,” but the course index, visible title, content, companion chapter, and test all identify it as Session 5. The PDF was created on 2013-08-27 and contains 13 slides.

## Official video swap

The two neighboring official YouTube uploads are mislabeled at the media level.

| Course role | Labeled YouTube upload | Video ID | Actual visible and narrated content | Treatment |
| --- | --- | --- | --- | --- |
| Session 5 valuation | “Session 5: Valuation - The Basics” | `bUJUGsDQ16w` | Session 6 trading costs and taxes | Rejected as a narration source for Session 5 |
| Session 6 trading costs | “Session 6: Trading Costs & Taxes” | `FNF3ncQgABk` | Session 5 valuation deck and narration | Used as the authoritative Session 5 narration |

Both uploads are from Aswath Damodaran’s official channel and were published on 2014-08-26. The correct-content valuation recording runs 27:18. It has no YouTube caption track, so OPS downloaded the official audio and produced a local machine transcript. Slide language and independently checked finance terminology control where the transcript is imperfect.

The incorrect-content upload is not cited in lesson teaching. The source panel will explicitly disclose the swap.

## Complete source review

All 13 slide pages and all five test/solution pages were rendered to PNG and inspected visually. The complete 27:18 correct-content recording was transcribed and reviewed from 00:00 to 27:17.

### Slide-by-slide record

| Slide | Visible content | Core source meaning | OPS treatment |
| --- | --- | --- | --- |
| 1 | “Valuation: The Basics” cover | Session identity | Metadata only |
| 2 | Financial balance sheet; equity versus firm valuation | Choose the claim before choosing cash flow and discount rate | Core guided decision |
| 3 | Determinants of firm value | Existing cash flow, growth, competitive period, and cost of capital drive value | Core four-pillar scan |
| 4 | FCFF versus equity cash flows | Firm cash flow is after taxes and reinvestment but before debt payments | Core consistency model; detailed FCFE construction remains a depth topic |
| 5 | Cost of equity and cost of capital maps | Currency, claim, risk, debt cost, tax, and market-value weights must be consistent | Core claim/rate pairing; full WACC estimation remains a depth topic |
| 6 | $120m no-growth perpetuity | A constant $120m cash flow discounted at 10% is worth $1.2b; all-equity value is also $1.2b | Core worked model |
| 7 | Naive 2%, 4%, and 6% growth cases | A growing-perpetuity formula can appear to make growth free | Diagnostic setup, immediately corrected |
| 8 | Growth requires reinvestment | Reinvestment rate = growth rate / return on capital | Core growth-quality interaction |
| 9 | Growth driver diagram | Growth creates value only when reinvestment earns above the relevant required return | Core cause-and-effect model |
| 10 | Relative valuation definition | Comparable assets, a standardized price, and controls for differences are required | Core definition |
| 11 | Telecom ADR P/E table | A low multiple alone does not establish cheapness | Core diagnostic |
| 12 | Same table plus expected growth | Growth is the first missing control; risk and cash flow must also be checked | Core peer scanner |
| 13 | Closing thoughts | Valuation is imprecise; bias and unnecessary model complexity are hazards | Core range-and-buffer policy |

### Narration sequence and qualifications

| Timestamp | Narration contribution | OPS consequence |
| --- | --- | --- |
| 00:00–01:30 | Valuation is necessary for wise investing; decide whether to value equity or the whole business before doing anything else | Mission begins with a claim-selection decision |
| 01:30–06:10 | Four valuation questions: existing cash flow, growth, discount rate, and time to maturity/terminal value | Learner gets a four-pillar mental model before formulas |
| 06:10–09:18 | Dividends/buybacks, FCFE, and FCFF; taxes and reinvestment precede firm cash flow, debt payments do not | Firm/equity consistency is assessed; advanced construction is optional |
| 09:18–13:54 | Currency-consistent risk-free rates, equity risk premium, relative risk, debt spread, after-tax debt cost, market-value weights, and changing risk over time | Core teaches the consistency rule and required return; full estimation is deferred |
| 13:54–16:12 | $120m perpetuity, $1.2b business/equity value, $12 per share, and option dilution warning | Core works the perpetuity; option valuation is excluded because the source does not provide enough inputs to value the options |
| 16:12–21:43 | Naive growth raises value; reinvestment corrects the numerator; growth is neutral at ROC = cost of capital, additive above it, destructive below it | Core interaction compares 8%, 10%, and 12% ROC at the same 4% growth rate |
| 21:43–25:27 | Intrinsic valuation must be internally consistent; relative valuation uses peers and standardized prices but must control for cash flow, growth, and risk | Core triangulates intrinsic and relative evidence without treating either as precise truth |
| 25:27–27:17 | Bias, false precision, and oversized models degrade valuation; investors need an estimate, not certainty | Artifact is a range plus decision buffer and evidence triggers |

## Assessment audit

The official packet contains six questions and solutions.

| Item | Source key | Audit result | OPS treatment |
| --- | --- | --- | --- |
| 1 | e, “All of the above” | Defective. The stem asks which listed factor “will not affect” intrinsic value, while the explanation says all four factors do affect value. | Rewritten as a positive multi-select asking which factors affect intrinsic value; all four are correct. |
| 2 | d | Correct. Firm cash flow is after taxes and reinvestment but before debt payments. | Adapted into claim/cash-flow pairing. |
| 3 | e | Correct despite duplicated-looking option structure in extraction. The visual source distinguishes after-tax current borrowing cost from pre-tax cost. | Simplified to the market-value/current-cost consistency rule. |
| 4 | f | Correct. Growth increases value when return on reinvested capital exceeds cost of capital. | Used directly in the growth-quality assessment. |
| 5 | c | Correct. A lower P/E is clearly favorable only with lower risk and higher growth, all else equal. | Rewritten with explicit peer controls. |
| 6 | a, yes | Correct. A company can be cheap intrinsically and expensive relative to an underpriced peer group. | Used as a conceptual check. |

No OPS assessment reproduces the defective wording.

## Independently verified calculations

All values are in millions unless noted.

### No-growth perpetuity

- After-tax earnings/cash flow: 120
- Required return: 10%
- Value: `120 / 0.10 = 1,200`
- Debt: 0, so equity value is also 1,200
- Shares: 100, so value per share is `1,200 / 100 = $12`

The source mentions 20 million at-the-money employee options. Quantity and strike alone are insufficient for a defensible option value; time to expiration and volatility are among the missing inputs. OPS teaches the dilution warning but does not fabricate a value.

### Naive growth calculation

- 2% growth: `120 / (0.10 - 0.02) = 1,500`
- 4% growth: `120 / (0.10 - 0.04) = 2,000`
- 6% growth: `120 / (0.10 - 0.06) = 3,000`

These are intentionally incomplete because they leave reinvestment out of the cash-flow numerator.

### Growth with reinvestment

The audited relationship is:

`Reinvestment rate = growth rate / return on capital`

At 2% growth and 10% ROC:

- Reinvestment rate: `0.02 / 0.10 = 20%`
- Cash flow after reinvestment: `120 × (1 - 0.20) = 96`
- Value: `96 / (0.10 - 0.02) = 1,200`

At 4% growth and 10% ROC:

- Reinvestment rate: `0.04 / 0.10 = 40%`
- Cash flow after reinvestment: `120 × (1 - 0.40) = 72`
- Value: `72 / (0.10 - 0.04) = 1,200`

At 4% growth and 8% ROC:

- Reinvestment rate: `0.04 / 0.08 = 50%`
- Cash flow after reinvestment: `120 × (1 - 0.50) = 60`
- Value: `60 / (0.10 - 0.04) = 1,000`

At 4% growth and 12% ROC:

- Reinvestment rate: `0.04 / 0.12 = 33.333%`
- Cash flow after reinvestment: `120 × (1 - 0.33333) = 80`
- Value: `80 / (0.10 - 0.04) = 1,333.33`

The 8%/10%/12% set is an OPS extension of the source’s explicit invitation to test ROC below the 10% cost of capital. It holds growth and required return constant to isolate growth quality.

## Prerequisite map

| Assumed knowledge or skill | Where OPS introduces it before use | Mission 6 use |
| --- | --- | --- |
| Debt versus residual equity claims | Mission 5 / Module 4 balance-sheet lessons | Choose firm or equity valuation |
| Operating income, net income, reinvestment, and debt payments | Mission 5 / Module 4 profit and cash-flow lessons | Distinguish FCFF from equity cash flow |
| Risk-free rate, beta, equity risk premium, and required return | Mission 4 / Module 3 risk-policy lessons | Interpret cost of equity and required return |
| Present value and perpetuity | Reintroduced directly in Mission 6 before the learner calculates | Work the $120m example without hidden prior knowledge |
| Growth rate and return on capital | Defined with a numerical cause-and-effect example inside Mission 6 | Calculate reinvestment and growth quality |
| P/E ratio | Defined as price divided by earnings inside Mission 6 | Evaluate a relative-value claim |
| Valuation uncertainty | Defined positively as a range of defensible outcomes caused by uncertain inputs | Set a decision buffer rather than claim false precision |

## Source coverage matrix for Mission 6

| Proposed element | Source support | Prerequisites | Classification |
| --- | --- | --- | --- |
| Price is observed; value is an estimate built from cash flow, growth, and risk | Course index; slides 3 and 13; narration 00:00–00:31 and 25:27–27:17 | None | Source-authentic paraphrase |
| Choose equity or firm claim first | Slides 2, 4, and 5; narration 00:31–02:24 | Debt and equity claims | Source-authentic |
| Pair firm cash flow with cost of capital and equity cash flow with cost of equity | Slides 4–5; narration 01:30–04:44 and 09:18–13:54 | Financial statements and required return | Source-authentic |
| Four-pillar scan: existing cash flow, growth, competitive period, discount rate | Slide 3; narration 02:24–06:10 | Claim selected | Source-authentic |
| No-growth $120m perpetuity at 10% equals $1.2b | Slide 6; narration 13:54–15:20 | Perpetuity definition supplied immediately before use | Source-authentic and independently verified |
| Naive growth makes value appear to rise to $2.0b at 4% | Slide 7; narration 16:12–17:30 | Growing perpetuity model | Diagnostic source example |
| Growth requires reinvestment; reinvestment rate = g / ROC | Slides 8–9; narration 17:30–21:43 | Growth and ROC definitions | Source-authentic and independently verified |
| Growth destroys, preserves, or creates value as ROC falls below, equals, or exceeds cost of capital | Slide 9; test item 4; narration 20:24–21:43 | Reinvestment model | Source-authentic claim; 8%/10%/12% comparison is an OPS adaptation |
| A P/E below the peer median is not enough to call a stock cheap | Slides 10–12; test item 5; narration 22:05–25:27 | P/E definition supplied first | Source-authentic |
| Intrinsic and relative conclusions can disagree | Test item 6 and solution | Both methods introduced | Source-authentic |
| Range, buffer, and evidence triggers | Slide 13; narration 25:27–27:17 | Uncertainty definition supplied first | Original OPS portfolio-decision pedagogy |
| $1.1b observed price, 20% buffer, and “watch” decision | None | Range interaction complete | Original OPS case, clearly labeled |

## Scope decision

Mission 6 is a concise portfolio decision mission, not a complete valuation course.

Core:

- firm versus equity consistency;
- the cash-flow/growth/risk model;
- a verified perpetuity;
- reinvestment and growth quality;
- guarded relative valuation;
- valuation range, decision buffer, and evidence triggers.

Depth lab:

- full FCFE and FCFF construction;
- country risk and implied equity risk premium estimation;
- synthetic ratings and detailed WACC;
- multi-stage DCF and terminal-value mechanics;
- employee-option valuation;
- regression-based relative valuation;
- full real-company case.

This preserves the source’s valuable structure while keeping the core focused on the website’s portfolio-building purpose.
