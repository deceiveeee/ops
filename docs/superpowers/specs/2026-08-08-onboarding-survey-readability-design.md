# Onboarding Survey Readability Pass

**Date:** 2026-08-08
**Status:** Approved (Approach A — Confident hierarchy)
**Scope:** Onboarding survey feature only (`components/onboarding/*`)

## Problem

The onboarding survey renders secondary text in a way that reads as timid and
nearly illegible. On the near-black canvas (`ink-950` = `#05070d`), the
secondary grey tier (`text-slate-500`, `text-slate-400`) at small sizes
(`12px`–`14px`) makes the site look like it is hiding content or lacks
confidence in its own copy.

Two of the offenders additionally **violate the project's own `AGENTS.md`
typography rule**: *"Avoid `uppercase` + wide `letter-spacing` on labels;
prefer sentence case with `tracking-[0.01em]–[0.02em]`."*

## Goal

Make secondary/supporting text legible and confident **without** flattening
the visual hierarchy or pushing everything to maximum contrast (the user
explicitly rejected exaggerated contrast). The three-tier hierarchy
(primary → secondary → support) stays deliberate.

## Non-goals

- No layout, structure, or component-composition changes.
- No copy/content changes.
- No changes to headings, primary values, or accent treatment.
- No changes to `OnboardingPrompt` prompt copy (already `slate-200`).
- Out of scope: any faint-text patterns outside `components/onboarding/`
  (investigation confirmed the pattern is isolated to this feature).

## Design — token changes

A single, consistent treatment applied across all secondary text in the
survey:

| Role | Before | After |
|---|---|---|
| Labels (eyebrows, row labels) | `text-[12px] uppercase tracking-[0.02em] text-slate-500` | `text-[13px] tracking-[0.01em] text-slate-300` (sentence case) |
| Helper / guidance text | `text-[14px] tracking-[0.01em] text-slate-400` | `text-[15px] tracking-[0.01em] text-slate-300` |
| Action links (Skip, Explore, Dismiss) | `text-slate-400` | `text-slate-300` (size unchanged) |

### Rationale

- **`slate-500` → `slate-300`**: `slate-500` (#64748b) on `#05070d` is
  roughly 3.5:1 contrast — below WCAG AA for small text and the visual
  source of the "hiding" feeling. `slate-300` (#cbd5e1) is ~9:1, clearly
  legible while still distinctly secondary to `slate-50`/`slate-100`
  headings and values.
- **`slate-400` → `slate-300`**: unifies the secondary tier so helpers and
  links no longer read quieter than the labels.
- **`12px` → `13px`**: minimum comfortable size for labels; removes the
  "fine print" feel.
- **`uppercase` → sentence case + `tracking-[0.01em]`**: brings labels into
  compliance with `AGENTS.md` and removes the all-caps whisper effect.
- **Helper `14px` → `15px`**: guidance text is the sentence that frames each
  question; it should read as supportive, not as a disclaimer.
- Hover lifts (`hover:text-slate-200`) are retained on links — they still
  read as a brightening step up from the new `slate-300` base.

### Resulting hierarchy (unchanged tiers, confident values)

1. **Primary** — headings `slate-50`, values `slate-100`, accent `accent-cyan`.
2. **Secondary** — labels/helpers/links now `slate-300`.
3. **Support/decorative** — progress-bar track `bg-white/10`, borders
   `border-white/10` (unchanged; these are structural, not reading copy).

## Files changed

| File | Line | Change |
|---|---|---|
| `components/onboarding/OnboardingResults.tsx` | 36 | eyebrow: `12px uppercase tracking-[0.02em] slate-500` → `13px tracking-[0.01em] slate-300` |
| `components/onboarding/OnboardingResults.tsx` | 63 | "Explore all courses": `slate-400` → `slate-300` |
| `components/onboarding/OnboardingResults.tsx` | 83 | row labels: `12px uppercase tracking-[0.02em] slate-500` → `13px tracking-[0.01em] slate-300` |
| `components/onboarding/OnboardingQuestion.tsx` | 60 | helper: `14px slate-400` → `15px slate-300` |
| `components/onboarding/OnboardingQuestion.tsx` | 88 | Skip: `slate-400` → `slate-300` |
| `components/onboarding/OnboardingPrompt.tsx` | 30 | Dismiss: `slate-400` → `slate-300` |

6 edits across 3 files.

## Verification

- `npm run lint` / `npm run typecheck` — ensure no regressions.
- `npm test` — onboarding unit/component tests must still pass (no tests
  assert on class-name strings; confirmed via search).
- Manual: load `/start`, walk intro → all questions → results, confirm
  secondary text is clearly readable and hierarchy still reads as
  primary > secondary > decorative.
