# Pilot Sign-Off — Premium Typography Refresh

**Date:** 2026-07-26
**Pilot lesson:** `/lessons/present-value-cashflows-assets-npv`
**Commits:** `ff03545..4d0abca` (Phase 0 + Phase 1 + Phase 2)

## What changed (Phase 1 + Phase 2)

**Phase 1 — System foundation (commits `ff03545..1832483`):**
- New CSS tokens in `globals.css` (type scale, spacing, content widths, semantic colors) — spec §4-6
- Button refactor: 4 variants (primary / secondary / outline / ghost), scoped to `.ops-theme-light` — spec §6.3
- New typography primitives file `components/lessons/typography.tsx` with `LessonH1`, `LessonH2`, `Subsection`, `BodyLead`, `BodyText`
- Shared primitives refactored in `components/lessons/intro-course-overview/shared.tsx`: `SectionHeading` (emphasis prop), `Panel` (tone retired), `DefinitionCard`, `TryItTag`, `ConceptTag` (purple dropped), `Feedback` (semantic tokens)

**Phase 2 — Pilot application (commits `1832483..4d0abca`):**
- `PVHero.tsx`: `<LessonH1>` + `<BodyLead>` replacing inline `motion.h1`/`motion.p`; bullet list with spec tokens; timid-serif `font-display` removed; `variant="secondary"` (text + arrow) for secondary CTA; unused `artifacts` prop removed (YAGNI)
- `Lesson1.tsx` body: 8 subsection heads → `<Subsection>`; 8 lead paragraphs → `<BodyLead>`; `--space-section` applied to Part I boundary

## Visual evidence

| Artifact | Size | Notes |
|---|---|---|
| `pilot-after-desktop.png` | 1.1 MB | 1440×900, post-restart fresh capture |
| `pilot-after-mobile.png` | 753 KB | 390×844, post-restart fresh capture |
| `pilot-before-desktop.png` | 277 KB | Captured pre-Phase-2; described as "generic SaaS / dense" — but the dev server had a stale `.next` cache at capture time, so this is unreliable |
| `pilot-before-mobile.png` | 209 KB | Same caveat |

**Note on BEFORE screenshots:** the dev server's `.next` cache became corrupt mid-Phase-2 (the same Next 14.2.15 quirk noted in Task 1.4). BEFORE captures may show stale or broken states. The AFTER captures required a full `.next` clear + dev-server restart to render correctly.

## analyze_image findings (AFTER desktop)

✅ **Large Fraunces serif H1:** "Future money is not the same as today's money." — large, bold, high-contrast serif
✅ **Section headings also Fraunces serif** at smaller size
✅ **Body paragraphs readable:** generous line-height, width-capped (not edge-to-edge)
✅ **Primary button solid teal:** "Start Cashflows and NPV" — flat, no neon glow
✅ **Secondary button text-link + arrow:** "View module map →" — Apple-style
✅ **No regressions:** layout intact, contrast good, no raw code
✅ **Lead-in-Panel whitespace:** the lead paragraph's 680px max-width inside wider panels creates a right-side gap — analyze_image reads this as **intentional editorial breathing room**, not a defect
✅ **Overall:** reads as "premium" (calm, generous whitespace, clear hierarchy, thoughtful color)

## analyze_image findings (AFTER mobile)

✅ Single-column layout, no horizontal scroll, no broken stacking
✅ Headline still serif and prominent
✅ Buttons solid teal, no glow
✅ No mobile-specific regressions

## Open Important finding from Task 2.2 review

**BodyLead's 680px max-width inside wider Panels creates right-side whitespace.** Verified by analyze_image — reads as intentional editorial layout, not a defect. If you disagree (i.e. it looks like a bug to you), the fix is a `className="!max-w-none"` override on `<BodyLead>` instances inside `<Panel>` (or modifying BodyLead to not cap when inside glass-panel).

## Pilot commits

```
4d0abca refactor(pv-lesson1): apply premium primitives and spacing
ea8dce5 refactor(pv-hero): apply premium typography and refined buttons
1832483 refactor(primitives): shared lessons primitives per spec §7
063bd5f feat(typography): LessonH1/H2/Subsection/BodyLead/BodyText primitives
c30da27 refactor(button): premium variants per spec §6.3
72c68f2 feat(tokens): premium type/spacing/color scale per spec §4-6
ff03545 chore: snapshot remediation WIP + QA evidence
```

## Question for sign-off

**Does this feel premium?**

If yes → Phase 3 begins: audit remaining 45 lessons for hardcoded patterns, spot-check 5 representative lessons, final QA report.

If no → tell me what's off (typography too aggressive? spacing wrong? buttons still feel generic? color too restrained?). I'll iterate on the pilot only — no rollout until you approve.
