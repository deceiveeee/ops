# Seamless Theme Transition — Design Spec

**Date:** 2026-07-29
**Scope:** Phase 1 — seamless dark↔light theme morph at the homepage↔learning boundary.
**Status:** Approved in brainstorm (2026-07-29)
**Related:** `docs/superpowers/specs/2026-07-21-learning-pages-light-theme-design.md` (the `.ops-theme-light` system this builds on)

## Problem

Navigating from the homepage (dark shell) into learning pages (light shell) is an abrupt hard cut: the canvas flips `#05070d → #F5F5F7`, text colors invert, atmosphere changes — with no transition. The flip happens once, at the `SiteShell` boundary (`(marketing)`/`(app)` = dark; `(learning)` = light). Inside learning it is already light→light, so the only theme jump is homepage → course map (and its reverse).

## Goal

A seamless morph at the dark↔light boundary — background interpolates, header eases, content crossfades — so the user barely registers a new page loaded. Same-theme navigations remain exactly as today (instant). The transition must be invisible/quiet, never a branded "moment."

## Approach chosen

**Unified animated SiteShell.** One persistent client shell at the root derives theme from the pathname and animates the theme change.

Rejected alternatives:
- **View Transitions API (`next-view-transitions`)** — smoothest, but adds a dependency and forces navigation-level changes (Link/transition-router) across the app; snapshot crossfade can ghost; Firefox support still partial.
- **Custom themed dissolve overlay** — reliable and dependency-free, but it is a *cover-up* rather than a true morph; leans "cinematic curtain," which fights the seamless goal.

Rationale for the chosen approach: true CSS color interpolation (no snapshot/ghosting), works in every browser, no new dependency, persistent header, contained refactor. Motion (`motion` package) is already a dependency and is reused for the content crossfade.

## Route → theme mapping

Single rule:
- **Light** if `pathname.startsWith('/courses') || pathname.startsWith('/lessons')`
- **Dark** otherwise (`/`, `/studio`, `/filings`, `/_not-found`)

Confirmed against current route-group layouts: `(marketing)` and `(app)` render `<SiteShell theme="dark">`; `(learning)` renders `<SiteShell theme="light">`.

## Architecture

- `SiteShell` becomes a **persistent client component**, rendered once in `app/layout.tsx` inside `<body>`. It reads `usePathname()`, derives the theme, and applies `site-shell-dark` vs `ops-theme-light`.
- `SiteHeader` / `SiteFooter` / `<main>` mount **once** and never re-mount on navigation. Only `<main>`'s children swap per route — so the header glides instead of popping.
- The three route-group layouts (`app/(marketing)/layout.tsx`, `app/(learning)/layout.tsx`, `app/(app)/layout.tsx`) are currently thin `<SiteShell theme=…>` wrappers and nothing else; they are reduced to pass-through or deleted, since theme is now pathname-derived at root.

## Boundary-conditional (honors scope = boundary only)

The morph compares the **previous** route's theme to the **new** one and fires **only when theme changes** (dark↔light). Same-theme navigations (e.g. `/courses` → `/courses/[courseSlug]`, or `/courses` → `/lessons/…`) pass a `{duration:0}` variant so the content crossfade no-ops — instant swap, identical to today.

## Transition mechanics — three concurrent layers

**Layer 1 — Background interpolation (the headline morph).**
`app/globals.css` adds `.site-shell { transition: background-color .45s ease; }`. The `site-shell-dark ↔ ops-theme-light` class swap drives `#05070d ↔ #F5F5F7` through real CSS interpolation — no snapshot, no ghosting.

**Layer 2 — Header/footer color ease (fixes the pop).**
Header/footer are persistent; their text/border colors are set by `.ops-theme-light` overrides and would otherwise snap instantly. A transient `is-theme-transitioning` class on the shell, held for the ~500ms window, applies `transition: color .45s, background-color .45s, border-color .45s` to `.site-header` and `.site-footer`. It is only active during the switch, so normal hover transitions stay snappy at all other times.

**Layer 3 — Content crossfade (prevents text color flashing mid-flight).**
`<main>`'s children are wrapped in a **theme-keyed** Motion `AnimatePresence` (`mode="wait"`): old content fades out (~180ms), new content fades in (~180ms), opacity only. Because it is opacity-based, old *dark* text dissolves out and new *light* text dissolves in — no moment where text color inverts over a mismatched background. Keying on *theme* (not pathname) means same-theme navigations don't change the key, so they swap instantly with no animation — implementing the boundary-conditional rule for free, with no gating logic.

**Orchestration on a boundary crossing:**
- t=0: add `is-theme-transitioning`; Layer 1 + Layer 2 begin their .45s ease; old content begins its 180ms fade-out.
- t≈180ms: old content gone; new route content mounts and fades in (~180ms).
- t=500ms: remove `is-theme-transitioning`. The background ease finishes as the new content settles — one unified motion.

## Reduced motion

The existing global `prefers-reduced-motion` rule already forces all CSS `transition-duration`/`animation-duration` to ~0ms, so Layer 1 and Layer 2 become instant automatically. Layer 3 is gated with Motion's `useReducedMotion()` so content also swaps instantly. Net result under reduced motion: exactly today's instant-swap behavior.

## Edge cases

- **Initial load / direct URL / hard refresh:** no transition on first mount; the correct theme for the current pathname renders immediately. The morph triggers only on a pathname *change*.
- **Back / forward:** same mechanism; light→dark morphs in reverse.
- **404 / unknown routes:** dark per the mapping rule.
- **Slow route load:** the 180ms content fade-out masks the swap; no loading spinner (a spinner would break seamlessness). These pages are mostly static, so the swap is near-instant.

## Files touched (no per-page or per-Link edits; no new dependency)

- `app/layout.tsx` — render `<SiteShell>` inside `<body>`.
- `components/layout/SiteShell.tsx` — convert to client; pathname→theme derivation; transition orchestration; `is-theme-transitioning` toggle; `AnimatePresence` keyed by pathname around `<main>`.
- `app/(marketing)/layout.tsx`, `app/(learning)/layout.tsx`, `app/(app)/layout.tsx` — reduce to pass-through or delete.
- `app/globals.css` — `.site-shell` background-color transition; `.site-shell.is-theme-transitioning .site-header, .site-footer` color/background-color/border-color transition.

## Unchanged

All page content/markup, the `.ops-theme-light` scoping system, lessons, course pages, and the premium-typography system. No `next/link` call sites change.

## Verification

- `tsc --noEmit`, `next lint`, `next build`.
- Manual + Playwright (reuse existing capture tooling): homepage↔courses = smooth morph; courses↔course = instant/unchanged; reduced-motion = instant; desktop and mobile viewports.

## Out of scope (later phases)

- **Phase B** — subtle content entrances within learning (course map → course → lesson).
- **Phase C** — transitions site-wide (studio/filings, header links).
- **Shared-element morphs** (e.g. header logo / a CTA morphing into a page heading) — possible future upgrade via View Transitions API.
