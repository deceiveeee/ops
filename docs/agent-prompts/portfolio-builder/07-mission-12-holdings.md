# Phase 7 prompt — Mission 12 product diligence, overlap, and order rehearsal

Paste after `00-master-operating-prompt.md`.

---

## Objective

Close Mission 12's exact-product source and learner-sequence gates, then convert licensed
policy sleeves into a verified product slate and a non-executing order rehearsal.

This is the first mission in which an exact legal security may enter the proposed portfolio.
The course never submits an order or connects to a brokerage.

## Mandatory Gate A work

Create a mission-specific audit and claim-level coverage matrix before lesson planning.
Review:

- Damodaran Session 37 as a source-era product framework, not a current product guide;
- the complete current SEC/Investor.gov fund and brokerage/order sources locked in the
  supplemental manifest;
- exact current EDGAR prospectus and holdings records for every OPS model product used;
- issuer documents only when the legal identity, format, date, and limitation remain
  visible;
- all relevant disclosure dates and material changes.

Do not cite an inaccessible Form N-1A/N-PORT overview page as canonically locked. Use the
approved EDGAR path for exact filings. Quarterly N-PORT data is not live holdings. A fresher
sponsor file may supplement it, but must show source and date.

If the exact legal product, share class, structure, filing, fee, or holdings evidence cannot
be verified, stop `Blocked - source`.

Create or update the mission source audit, lesson plan, and
`docs/release-evidence/mission-12-holdings.md`. The evidence record must list every model
product's exact filing/source snapshot and as-of date without committing cached source
artifacts.

## Required product record

Each Fund Passport or security record distinguishes:

- legal name;
- ticker and, where relevant, share class;
- CIK or other exact identity key;
- ETF, mutual fund, bond, stock, or other allowed structure;
- investment objective and tracked index where applicable;
- full versus sampled replication;
- principal risks;
- fee table and other documented costs;
- turnover;
- benchmark/performance period with date;
- tracking behavior and its limitations;
- holdings source, coverage, and as-of date;
- ETF spread and premium/discount considerations;
- securities lending or derivatives where material;
- leverage, inverse, margin, or complex-product warning;
- material changes;
- policy sleeve and reason for fit;
- source snapshots and retrieved dates.

Never treat ticker text alone as identity.

## Learner experience

### Prospectus Lens and Fund Passport

Treat the filing as source code. Pin the exact lines and tables that answer identity,
objective, risks, costs, and implementation questions. Let the learner move from policy
role to evidence, not from a recommendation list to a purchase.

### Overlap X-Ray

Use a transparent look-through approximation:

`issuer exposure = direct portfolio weight + Σ(fund weight × issuer weight inside fund)`

Always disclose holdings coverage and staleness. Show direct exposure, indirect exposure,
unknown/uncovered share, duplicated sector/issuer exposure, and why the result might change.

The learner must be able to inspect the underlying table without relying on a constellation
or heatmap.

### Order rehearsal

Create a draft only. It records:

- exact security identity;
- buy/sell direction in the fictional or educational plan;
- approximate quantity or dollar amount;
- order type education and trade-offs;
- market-hours/price uncertainty warning;
- available-cash and policy-range check;
- estimated spread/friction;
- account-context and tax-warning flags;
- final confirmation that no order is transmitted.

Do not handle credentials, mimic a brokerage confirmation, or use language implying
execution.

## Learning sequence

1. Define security identity, share class, structure, prospectus, expense ratio, turnover,
   tracking, replication, holdings date, premium/discount, spread, and overlap.
2. Model a complete passport and expose a near-identical but wrong ticker/share-class trap.
3. Guided practice finds one fact at a time in a supplied filing packet.
4. Learner maps verified products to licensed policy sleeves and saves a slate.
5. Independent perturbation introduces a stale holdings file, hidden overlap, or leveraged
   product.
6. Assessment requires rejection/repair plus a safe order rehearsal.

## Completion and invalidation

Set **Products verified** only when:

- the Mission 11 timing checkpoint is valid and current, including a valid explicit
  `no timing` policy where that is the learner's choice;
- every holding maps to an approved architecture sleeve;
- exact identity passes;
- source date and retrieval date are visible;
- fees, structure, risks, exposure, and overlap are inspected;
- no hidden leverage/margin or ambiguous share class remains;
- total target weights remain coherent;
- independent identity/overlap assessment passes;
- order records remain drafts and the UI cannot transmit them.

Source staleness, product changes, timing-policy changes, architecture changes, or
allocation changes must mark the slate, overlap, order drafts, flight-test result, and
operating plan `Review required` as appropriate.

## Tests and QA

Test ticker/share-class collisions, duplicate legal products, stale/missing holdings,
partial coverage, direct plus indirect exposure math, rounding, total weights, leveraged or
inverse flags, invalid order amounts, no-network behavior, and absence of any order
submission endpoint.

Browser-test filing navigation, keyboard access, mobile tables, reduced motion, source-date
visibility, and every rejection path.

## Explicit non-goals

Do not:

- recommend a product or rank funds;
- add a live market feed or auto-refresh claims;
- scrape arbitrary sites at runtime;
- represent quarterly holdings as current;
- hide unknown coverage;
- calculate personal tax liability;
- connect to a broker, accept credentials, or transmit an order;
- allow holdings before architecture is licensed;
- commit or push.

End with exact source snapshots used and the master report.

---
