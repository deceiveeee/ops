# Release evidence — Mission 8: Count the friction

**Date:** 2026-08-12 · **Lesson:** `if-6-1-count-the-friction` · **Spine:** `pb-08`
**Plan:** `docs/lesson-plans/mission-08-friction.md`
**Release status:** `Blocked - implementation` — the finance repair, complete stage path,
light-theme render, narrow-layout overflow check, and automated suite are verified. A
browser-level hard-refresh persistence check, keyboard-only pass, and reduced-motion pass
remain open.

## Repair scope

This record covers a narrow prerequisite repair before Mission 10 uses the saved Friction
Budget. It does not retroactively claim a complete visual release gate for Mission 8.

- Replaced the source's approximate exit-cost treatment with exact bid/ask arithmetic.
- Kept Damodaran's published 12.22% answer visible, explicitly labelled as an
  approximation rather than accepted as the exact answer.
- Changed the assessed answer to about 12.24%.
- Marked every hard-coded Friction Budget weight and its saved sum as an illustrative OPS
  scenario estimate, not a measured account cost, forecast, or proof of active edge.

## Finance verification

For $100, a 4% bid-ask spread split equally across entry and exit, a two-year horizon, and
a required 10% annual return after costs:

| Quantity | Independently verified value |
| --- | ---: |
| Required proceeds after two years | $100 × 1.10² = $121.00 |
| Shares acquired after the 2% entry cost | $100 × 0.98 = $98.00 |
| Gross exit value needed after a 2% exit haircut | $121 ÷ 0.98 = $123.4693878 |
| Exact annual pre-cost return | ($123.4693878 ÷ $98)^(1/2) − 1 = 12.24489796% |
| Learner-facing rounded answer | About 12.24% |
| Damodaran's published approximation | $121 × 1.02 = $123.42 → 12.22244673%, or 12.22% |

The repaired calculator divides by `1 - halfSpread` on exit. Multiplying by
`1 + halfSpread` remains visible only as the source's documented approximation.

## Artifact boundary for Mission 10

The per-choice percentages in the final budget are original OPS teaching assumptions.
They are not sourced transaction-cost forecasts and are not calibrated to a learner's
broker, tax position, order size, holdings, or execution method. The saved `hurdleRule`
now carries that limitation in its own text so a downstream lesson cannot display the
number without the estimate boundary.

Mission 10 may use the total as a provisional hurdle the learner has chosen. It must not
present the total as measured fact or treat clearing it as sufficient evidence of edge.

## Automated verification

- Independent PowerShell calculation with exact-value assertions — passed:
  12.2448979591837% exact versus 12.2224467342448% under the published approximation.
- `npm.cmd run typecheck` — clean.
- `npm.cmd test` — 17 files passed; 108 tests passed, including storage round-trip,
  corrupt/partial JSON tolerance, and storage-event refresh coverage for all seven dossier
  artifacts.
- `npm.cmd run lint` — passed with the two pre-existing `react-hooks/exhaustive-deps`
  warnings in onboarding files.
- In-app browser learner walk — all seven stages passed; 12.22% was rejected with the
  approximation explanation, 12.24% advanced, the exact calculator rendered 12.24%, and
  the saved budget retained its illustrative/provisional boundary. The light-theme desktop
  render had no console errors.
- `npx playwright test e2e/lesson-typography.spec.ts --grep "if-6-1|if-7-1"` — 2
  lessons passed. Mission 8 walked all 7 stages and the 375px no-horizontal-overflow audit
  passed.
- `git diff --check` on the repaired files — clean apart from Git's existing LF-to-CRLF
  checkout notices.

## Open release gates

- Reproduce hard-refresh persistence in a normal browser-origin Playwright run. The in-app
  LAN preview reset the visible lesson state after a hard reload; the hook-level round-trip
  tests pass, so this remains an environment-sensitive browser gate rather than a resolved
  product claim.
- Run a keyboard-only learner path and verify focus treatment after feedback appears.
- Run the complete path with reduced motion enabled.
