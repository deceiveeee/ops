# Source audit: Damodaran Investment Philosophies, Session 2

Audit date: 2026-08-08  
Status: Source audit and OPS Module 2 implementation verification complete  
OPS course location: Investment Foundations, Module 2

## 1. Edition and session lock

OPS Module 2 must use the 38-webcast version of Aswath Damodaran's Investment Philosophies course.

- Course sequence: 38-webcast Investment Philosophies course
- Session: 2 of 38
- Exact title: "Understanding Risk I: The risk in bonds"
- Associated book chapter: Chapter 2
- Official course index: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm
- Official session description: the session examines interest-rate risk in bonds, duration as a measure of that exposure, default risk, measures of default risk, and compensation through default spreads.

The 2025 42-webcast sequence is a different edition. In that sequence, defining risk is Session 2 and bond risk is Session 3. Material from that Session 2 must not be substituted for this source package.

## 2. Sources reviewed

| Source | Provenance | Review completed |
| --- | --- | --- |
| Official 38-webcast course index | NYU Stern / Damodaran | Relevant course and Session 2 entries inspected |
| Session 2 slide deck | https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session2.pdf | All 13 slides rendered and inspected visually; all extractable text reviewed |
| Session 2 test and solutions | https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz2.pdf | All 3 pages rendered and inspected visually |
| Session 2 video mirror | https://www.youtube.com/watch?v=8E6b60eN2Mc | Full available English caption track reviewed from 00:00:00 through 00:16:02 |
| Current matching solution, used only as a cross-check | https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilcertificate/postclass/session3Nsoln.pdf | Both pages inspected; questions and numerical answers match the older Session 2 test |

The accessible Session 2 video is a 2014 third-party mirror uploaded by Aykay, not an official Damodaran-channel upload. Its description links to the official NYU Session 2 slide deck, and its narration follows the official slides, examples, and sequence. The official 38-webcast index currently points its Session 2 video link to the class-overview video, so the mirror is used for caption review with this provenance limitation recorded.

Downloaded audit-source hashes:

- Slides PDF SHA-256: `8CF39CD04356C7D93A08040171A43CD123212933813D3918ECD13B2810A6C3CA`
- Test PDF SHA-256: `137A3CD5829F9732AFDB8124C5E98C38B35271086C6E1FB7F5CF386C9F472C93`
- English caption VTT SHA-256: `95C48AE488E4D1D52DB475F038E7AFA6BD654484D10F840AE468DB847B5C5F83`

## 3. Source-authentic content spine

The source follows this sequence:

1. Define a conventional fixed-rate bond through its promised coupons, face value, and maturity.
2. Identify the two risks emphasized in this session: interest-rate risk and default risk.
3. Explain the inverse relationship between market interest rates and bond prices through present value.
4. Demonstrate the relationship with a 4% coupon, 10-year, $1,000 face-value bond.
5. Explain why coupon level and maturity affect interest-rate exposure.
6. Introduce Macaulay duration as weighted-average cash-flow timing and as a ranking measure for interest-rate sensitivity.
7. Define default risk and explain why conventional bond outcomes have limited contractual upside and substantial downside.
8. Connect default risk to operating cash-flow capacity, cash-flow stability, and fixed commitments.
9. Introduce credit scores and bond ratings as measures of borrower credit risk.
10. Add a default spread to a maturity-matched risk-free rate to obtain the return demanded on a risky bond.
11. Connect ratings to financial ratios and qualitative information.
12. Define the interest coverage ratio and use it as a simplified input to a synthetic rating.
13. Briefly introduce floating-rate, convertible, callable, capped, and floored bonds as extensions beyond a conventional fixed-rate bond.

## 4. Slide and caption coverage matrix

| Slide | Slide topic | Caption window | Verified source meaning | OPS source-handling requirement |
| --- | --- | --- | --- | --- |
| 1 | Session title | 00:00-00:22 | Bonds are introduced as the easier instrument for beginning the course's risk discussion. | Preserve the exact session title and bond-specific scope. |
| 2 | The risk in bonds | 00:22-01:05 | A conventional bond has fixed promised coupons, face value, and maturity. The session focuses on interest-rate and default risk. | Define bond, coupon, face value, and maturity before using them. Say "promised" unless payments are explicitly assumed default-free. |
| 3 | Interest-rate risk | 01:05-01:51 | Fixed nominal cash flows change in present value when market rates change. Rates up implies price down; rates down implies price up. | State the holding/sale horizon so students understand when market-price changes affect realized return. |
| 4 | 4%, 10-year bond example | 01:51-03:41 | The same $40 coupons and $1,000 face value are worth different amounts at yields from 2% to 6%. Coupon equal to yield implies par; coupon above yield implies premium; coupon below yield implies discount. | Use the slide values, not the erroneous auto-caption numbers. Model present value before assessment. |
| 5 | Measuring interest-rate risk | 03:41-05:02 | Higher coupons reduce interest-rate sensitivity; longer maturities increase it. Duration combines both effects. | Teach both causal relationships before asking students to rank bonds. |
| 6 | Duration example | 05:02-06:51 | A 4% coupon, 10-year bond at a 5% yield has price $922.78 and Macaulay duration 8.36 years. Zero-coupon duration equals maturity; coupon-bond duration is generally lower. | Call the displayed measure Macaulay duration. Do not interpret 8.36 directly as the percentage price change for a one-point rate move. |
| 7 | Default risk | 06:51-07:33 | The issuer may miss some or all promised payments. Contractual upside is limited while downside can be large. | Distinguish promised cash flows from guaranteed cash flows. |
| 8 | Default-risk determinants | 07:33-08:43 | More and steadier operating cash flow lowers default risk; larger fixed commitments relative to cash flow raise it. | Make the cause-and-effect chain visible before introducing ratings. |
| 9 | Measuring default risk | 08:43-10:03 | Credit scores and ratings combine quantitative and qualitative evidence. Ratings agencies can make mistakes, and a bond can exist without a rating. | Preserve the caption's qualifications; never present a rating as certainty. |
| 10 | Charging for default risk | 10:03-11:08 | A default spread is added to a maturity-matched risk-free rate. The spoken 2013 example adds a 1.84% BBB spread to a 1.50% risk-free rate to obtain 3.34%. | Label the table and example as historical 2013 data. Do not present these spreads as current. |
| 11 | Ratings and financial ratios | 11:08-12:29 | Ratings rely primarily on financial information while also using qualitative evidence. The table reports historical averages by rating class. | Treat the table as historical illustration, not a timeless ratings rule. |
| 12 | Synthetic ratings | 12:29-13:05 | Interest coverage equals EBIT divided by interest expense. $3,500 million divided by $700 million equals 5.00. | Define EBIT and interest expense before the calculation. |
| 13 | Coverage, rating, and spread lookup | 13:05-13:53 | A lookup table maps coverage to a rating and spread, with separate thresholds for small and large firms. The narration maps coverage of 5.0 for a small firm to A- and a 3.00% spread. | Require the table's size, date, and thresholds. Do not teach that coverage of 5.0 always maps to one universal rating. |
| Spoken extension | Bond variations | 13:53-16:02 | Floating coupons reduce rate exposure; a convertible combines a straight bond with a conversion option; callable bonds and caps/floors add embedded features. | Treat this as an extension. If modernizing the floating-rate example, label SOFR or another modern reference as an OPS update; the source's LIBOR reference is historical. |

## 5. Assessment coverage and verified answers

| Test item | Assessed concept | Verified answer | Prerequisites that OPS must teach first |
| --- | --- | --- | --- |
| 1 | One-year return after rates rise on a default-free 20-year 2% coupon bond | Less than 2%; exact return is approximately -12.33% | Coupon, par value, market rate, price-return relationship, total holding-period return |
| 2 | Ranking duration across coupon and maturity combinations | Lowest: 10-year 5% bond; highest: 20-year 2% bond | Duration definition, coupon effect, maturity effect |
| 3 | Pricing a BBB 5% coupon bond when required yield is 5.5% | Discount to face value; exact price is $962.31 | Risk-free rate, default spread, required yield, premium/par/discount, present value |
| 4 | Inputs to bond ratings | All listed inputs | Default-risk determinants and how ratings use financial evidence |

The computational parts are labeled as bonuses in the source. OPS can teach them interactively, but the conceptual assessment must remain answerable before requiring manual present-value arithmetic.

## 6. Independent numerical verification

All source calculations were recomputed independently using annual cash flows.

### Slide 4: 4% coupon, 10-year, $1,000 face-value bond

| Market yield | Verified price | Change from par |
| --- | ---: | ---: |
| 2% | $1,179.65 | +17.965% |
| 3% | $1,085.30 | +8.530% |
| 4% | $1,000.00 | 0.000% |
| 5% | $922.78 | -7.722% |
| 6% | $852.80 | -14.720% |

### Slide 6: duration

- Verified price at 5% yield: $922.78
- Verified Macaulay duration: 8.3596 years, displayed as 8.36

### Test calculations

- Question 1 new price after one year: $856.76
- Question 1 holding-period return: -12.324%, displayed as -12.33%
- Question 2 Macaulay duration of 10-year 5% bond at 4% yield: 8.1909 years
- Question 2 Macaulay duration of 20-year 2% bond at 4% yield: 15.9722 years
- Question 3 price at a 5.5% required yield: $962.31
- Interest coverage example: $3,500 million / $700 million = 5.00

## 7. Discrepancies, ambiguities, and required corrections

### Course-edition mismatch

The original failed outline used the 2025 sequence. OPS must use the locked 38-webcast sequence for Module 2.

### Video provenance and link error

The official 38-webcast page currently links Session 2 to the class overview rather than the Session 2 recording. The available exact Session 2 recording is a third-party mirror. Its captions are usable only after reconciliation with the official slides and tests.

### Auto-caption numerical errors

The caption track contains material transcription errors. Examples include:

- $1,179.65 rendered as "1,180 million"
- $1,085.30 and an 8.53% gain rendered as "1,85" and "85%"
- "4% coupon, 10-year bond" rendered as "four-year coupon bond"
- $1,000 rendered as $11,000
- $7,714.08 rendered as 7.714 billion
- financial-ratio labels and values rendered incorrectly

Slides, independently verified calculations, and the provided solutions control whenever captions conflict.

### Promised versus guaranteed payments

The slides sometimes use "guaranteed" while explaining interest-rate risk. The narration later corrects itself and says bonds promise fixed payments. OPS must use "promised" for bonds generally and "guaranteed" only when the example explicitly assumes a default-free issuer.

### Synthetic-rating inconsistency

Slide 12 maps coverage of 5.00 to A without stating firm size. Slide 13 and the narration use size-specific thresholds: 5.00 maps to A- for a small firm and A for a large firm. OPS must present synthetic ratings as table-, date-, and size-dependent estimates.

### Historical data

The default-spread and ratio tables are historical. The narration dates the default-spread example to the start of 2013. OPS must either label those values with their date or use clearly labeled fictional OPS data. No historical spread may be presented as a current market quote.

### Duration terminology

The source calculation is Macaulay duration, a weighted-average time measure. Modified duration is the related measure used for an approximate percentage price response. OPS must not conflate the two.

### Holding horizon

A default-free bond can experience a market-price loss before maturity while still making every promised nominal payment. OPS must state whether the investor sells or marks the bond after one year, holds to maturity, or reinvests coupons.

### Scope of "two risks"

The session deliberately focuses on interest-rate and default risk for conventional fixed-rate bonds. Other bond risks and embedded options exist. OPS should frame these as the two risks emphasized by this lesson rather than every possible source of bond risk.

## 8. Learner prerequisites revealed by the source

The source assumes vocabulary and mathematical knowledge that a high school learner may not have. OPS must introduce and model these before using them in a prompt:

- Conventional fixed-rate bond
- Issuer and bondholder
- Coupon payment and coupon rate
- Face value, par value, premium, and discount
- Maturity
- Market interest rate or yield
- Present value and why later cash flows are discounted
- Holding-period return, including coupon plus price change
- Default-free assumption
- Duration and weighted-average timing
- Operating cash flow
- EBIT and interest expense
- Interest coverage ratio
- Credit rating
- Risk-free rate and default spread
- Required return on a risky bond

## 9. Boundaries for the OPS adaptation

Source-authentic claims must preserve the meaning and qualifications recorded above. OPS may create original companies, numbers, visual metaphors, simulations, and guide dialogue when they are labeled internally as OPS adaptations and independently checked.

The OPS lesson must not:

- substitute the newer defining-risk Session 2 for the locked bond session;
- quote raw auto-captions as authoritative text;
- present 2013 spreads or ratings thresholds as current;
- treat a credit rating as a guarantee;
- assess present value, duration, ratings, or spreads before defining and modeling their prerequisites;
- imply that a default-free bond cannot lose market value before maturity;
- imply that Macaulay duration is directly the percentage price change for a one-point rate move.

## 10. Audit conclusion

The correct Session 2 is a bond-risk lesson. Its authentic conceptual center is the distinction between interest-rate risk and default risk, followed by duration, ratings, default spreads, and a simplified synthetic-rating process. The source package is suitable for OPS after the recorded caption corrections, historical-data labels, duration distinction, holding-horizon clarification, and size-specific synthetic-rating qualification are enforced.

No Module 2 lesson outline or implementation should begin until it uses this audit as its source boundary.

## 11. OPS implementation coverage gate

| OPS lesson | Source coverage | Implemented learning sequence | Source-integrity controls |
| --- | --- | --- | --- |
| 2.1 Reading a Bond’s Promise | Slides 1–2; captions 00:00–01:05 | Define the conventional fixed-rate bond and its vocabulary, model the $40 coupons and $1,040 maturity payment, introduce interest-rate and default risk, classify events, complete a payment map | Uses “promised” throughout; frames the two risks as the risks emphasized by this session; labels Northstar Transit as an OPS case |
| 2.2 Why Market Rates Change Bond Prices | Slides 3–4; captions 01:05–03:41; test item 1 | Define market yield and present value, model a simple OPS present-value comparison, reprice the exact source bond from 2% through 6%, define premium/par/discount, reconstruct the one-year return, assess the rate-price-horizon chain | Uses verified prices; states the one-year selling horizon; preserves coupon income and price change as separate return components |
| 2.3 Duration | Slides 5–6; captions 03:41–06:51; test item 2 | Define Macaulay duration, model weighted timing, rebuild $922.78 and 8.36 years, test coupon and maturity separately, rank four bonds, distinguish Macaulay from modified duration | Computes duration from present-value weights; uses 8.36 as years; identifies modified duration as the related percentage-sensitivity measure |
| 2.4 Default Risk | Slides 7–9 and 11; captions 06:51–12:29; test item 4 | Define default risk, model operating cash and fixed commitments, trace capacity/stability/commitment events, build a rating evidence file, compare two issuers | Labels issuer cases and values as OPS pedagogy; states that ratings are estimates, can be wrong, and may be absent |
| 2.5 From Credit Rating to Bond Price | Slides 10 and 12–13; captions 10:03–13:53; test items 3–4 | Define and build required yield, reconstruct the verified $962.31 bond price, define EBIT/interest expense/coverage, calculate 5.00, apply size-specific lookup tables, save a five-part Bond Risk Brief | Dates the 1.50% + 1.84% example and rating lookup to 2013; distinguishes small-company A− from large-company A; treats the lookup as a table-specific estimate |

Implementation verification completed on 2026-08-08:

- TypeScript check passed with incremental output disabled.
- Changed-file ESLint checks passed; the course-data file passed with its pre-existing `module` identifier rule suppressed for that file only.
- All 85 repository tests passed.
- Desktop browser walkthrough passed for all five routes, including live values of $922.78, 8.36 years, a $20 million stressed payment cushion, 3.34%, $962.31, 5.00×, A− versus A, and final Bond Risk Brief persistence.
- Mobile browser review passed at a 390 × 844 viewport without horizontal overflow.
- No new browser console error appeared after correcting the lesson-completion state transition.
- `git diff --check` passed.
