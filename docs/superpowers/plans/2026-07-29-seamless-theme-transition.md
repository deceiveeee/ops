# Seamless Theme Transition — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dark↔light theme change at the homepage↔learning boundary animate as one seamless morph instead of an abrupt hard cut.

**Architecture:** Lift `SiteShell` to the root layout as a single persistent client component that derives its theme (`dark`/`light`) from `usePathname()`. The shell's background interpolates via CSS; the header/footer ease their colors via a transient `is-theme-transitioning` class; and `<main>` content crossfades via a **theme-keyed** Motion `AnimatePresence`. Same-theme navigations don't change the key, so they stay instant (unchanged from today).

**Tech Stack:** Next.js 14.2.15 (App Router), React 18, TypeScript, Tailwind 3.4, `motion@^11` (import from `motion/react`), existing `.ops-theme-light` CSS scoping system.

## Global Constraints

- **No monospace.** Inter (`font-sans`) for all UI/numerics (`tabular-nums` allowed); Fraunces (`font-display`) for editorial headlines. (No new text is added by this plan, but don't introduce any.)
- **Respect `prefers-reduced-motion`.** The global rule in `app/globals.css` already zeroes CSS transition/animation durations; this plan additionally gates the Motion fade with `useReducedMotion()`.
- **No new dependencies.** `motion` is already installed.
- **Animate `transform`/`opacity`** preferably; the background-color interpolation is an intentional, single-element exception approved in the spec.
- Follow the repo's conventional-commit style (`type(scope): subject`).

## Testing approach (read this)

This project has **no unit-test runner** (no jest/vitest; `package.json` exposes only `dev`/`build`/`start`/`lint`/`typecheck`). Verification therefore uses the project's real toolchain, not fabricated tests:

- Per task: `npm run typecheck` (fast type check).
- At plan end: `npm run lint` + `npm run build`.
- Behavior: manual browser check + optional Playwright full-page capture (the project already uses Playwright for visual QA).

A "verify" step means: run the listed command and confirm the stated expected result.

## File Structure

- **Create** `lib/route-theme.ts` — pure `routeTheme(pathname)` resolver. Single source of truth for the route→theme rule.
- **Modify** `components/layout/SiteShell.tsx` — becomes a persistent client component: pathname→theme, transition orchestration, content crossfade.
- **Modify** `app/layout.tsx` — render `<SiteShell>` once inside `<body>`.
- **Delete** `app/(marketing)/layout.tsx`, `app/(learning)/layout.tsx`, `app/(app)/layout.tsx` — they only set theme, which the root now handles.
- **Modify** `app/globals.css` — add `background-color` transition to `.site-shell`; add the `is-theme-transitioning` header/footer color rule.
- **Modify** `components/layout/SiteHeader.tsx` & `components/layout/SiteFooter.tsx` — add stable `site-header` / `site-footer` hook classes (so the transition CSS can target them).

## Execution setup (before Task 1)

Start this work on a **fresh branch off `main`** (not on `feature/learning-light-theme`, which has an open PR). Carry the spec (`docs/superpowers/specs/2026-07-29-seamless-theme-transition-design.md`) over by cherry-picking its commit, or it already exists if branching after it landed. Example:

```bash
git checkout main
git pull
git checkout -b feature/seamless-theme-transition
```

---

### Task 1: Route → theme resolver

Create the pure helper that centralises the boundary rule. It has no side effects and is used by `SiteShell` in Task 2.

**Files:**
- Create: `lib/route-theme.ts`

**Interfaces:**
- Produces: `routeTheme(pathname: string): RouteTheme` where `type RouteTheme = "dark" | "light"`. Light when `pathname` starts with `/courses` or `/lessons`; dark otherwise.

- [ ] **Step 1: Create the helper**

Create `lib/route-theme.ts`:

```ts
export type RouteTheme = "dark" | "light";

/**
 * Resolve the site theme for a given pathname.
 *
 * Light = the learning surface (/courses, /courses/[slug], /lessons/[slug]).
 * Dark  = everything else (/, /studio, /filings, not-found).
 *
 * Centralised so SiteShell can switch theme from the pathname alone,
 * without per-route configuration.
 */
export function routeTheme(pathname: string): RouteTheme {
  if (pathname.startsWith("/courses") || pathname.startsWith("/lessons")) {
    return "light";
  }
  return "dark";
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/route-theme.ts
git commit -m "feat(theme): route-to-theme resolver"
```

---

### Task 2: Unify SiteShell as a persistent client shell at root

Move the shell to the root layout so `SiteHeader`/`SiteFooter`/`<main>` mount once and never re-mount on navigation. **No transition yet** — this task reproduces today's instant theme swap via the new architecture. The result is a clean, shippable checkpoint (identical UX, refactored structure) that Task 3 builds the animation on.

**Files:**
- Modify: `components/layout/SiteShell.tsx` (full rewrite of the 22-line file)
- Modify: `app/layout.tsx` (wrap `children` in `<SiteShell>`)
- Delete: `app/(marketing)/layout.tsx`, `app/(learning)/layout.tsx`, `app/(app)/layout.tsx`

**Interfaces:**
- Consumes: `routeTheme(pathname)` from Task 1; `cn` from `@/lib/utils`.
- Produces: `SiteShell({ children })` — no `theme` prop (theme is now self-derived).

- [ ] **Step 1: Rewrite `SiteShell` as a self-deriving client component**

Replace the entire contents of `components/layout/SiteShell.tsx` with:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { routeTheme } from "@/lib/route-theme";
import { cn } from "@/lib/utils";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const theme = routeTheme(pathname);

  return (
    <div
      className={cn(
        "site-shell",
        theme === "light" ? "ops-theme-light" : "site-shell-dark",
      )}
    >
      <SiteHeader />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
```

Note the `theme` prop is gone — callers no longer pass it.

- [ ] **Step 2: Render `SiteShell` from the root layout**

In `app/layout.tsx`, add the import and wrap `children`. The file currently renders `<body className="min-h-screen font-sans antialiased">{children}</body>`. Change only those two parts:

Add the import near the other imports:

```tsx
import SiteShell from "@/components/layout/SiteShell";
```

Change the `<body>` to:

```tsx
      <body className="min-h-screen font-sans antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
```

- [ ] **Step 3: Remove the now-redundant route-group layouts**

These three files each only render `<SiteShell theme="…">{children}</SiteShell>`. Delete them (theme is now derived at root; route groups still work without a layout file):

```bash
git rm "app/(marketing)/layout.tsx" "app/(learning)/layout.tsx" "app/(app)/layout.tsx"
```

- [ ] **Step 4: Verify it builds**

Run: `npm run typecheck`
Expected: exits 0. (If it errors about a removed layout, the route group still resolves via the root layout — confirm no other file imports the deleted layouts.)

Run: `npm run build`
Expected: `✓ Compiled successfully`, all routes still generate (including `/`, `/courses`, `/courses/[courseSlug]`, `/lessons/[lessonSlug]`, `/studio`, `/filings`).

- [ ] **Step 5: Verify behaviour in the browser**

Run `npm run dev`, then check each route renders with the **correct theme** and there is **exactly one** header/footer (no duplicated shell):
- `/` and `/studio` and `/filings` → dark canvas.
- `/courses`, `/courses/finance-foundations`, `/lessons/irr-and-payback` → light canvas.
- Click between homepage ↔ courses: instant theme swap (no animation yet — that is Task 3). The header should persist (not blink/duplicate).

- [ ] **Step 6: Commit**

```bash
git add components/layout/SiteShell.tsx app/layout.tsx
git commit -m "refactor(shell): unify SiteShell at root as persistent client shell"
```

---

### Task 3: Seamless theme morph

Add the three-layer transition. The background interpolates; header/footer ease their colors during the switch; content crossfades — only on a theme change.

**Files:**
- Modify: `components/layout/SiteShell.tsx` (add transition orchestration + `AnimatePresence`)
- Modify: `components/layout/SiteHeader.tsx` (add `site-header` class)
- Modify: `components/layout/SiteFooter.tsx` (add `site-footer` class)
- Modify: `app/globals.css` (add two rules)

**Interfaces:**
- Consumes: `AnimatePresence`, `motion`, `useReducedMotion` from `motion/react`; `routeTheme`; `cn`.
- Produces: the finished `SiteShell` with the morph; CSS hooks `.site-shell` (background-color transition), `.is-theme-transitioning`, `.site-header`, `.site-footer`.

- [ ] **Step 1: Add the transition CSS to `globals.css`**

The existing `.site-shell` rule (around line 473) currently is:

```css
.site-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
```

Add a `transition` line to it, and add a new rule for the header/footer color ease immediately after. Result:

```css
.site-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  transition: background-color 0.45s ease;
}

/* While a theme switch is in flight, ease the persistent header/footer
   colors so they don't snap. Only active for ~450ms during the morph,
   so ordinary hover transitions stay snappy at all other times. */
.site-shell.is-theme-transitioning .site-header,
.site-shell.is-theme-transitioning .site-footer {
  transition: color 0.45s ease, background-color 0.45s ease,
    border-color 0.45s ease;
}
```

- [ ] **Step 2: Add the `site-header` hook class**

In `components/layout/SiteHeader.tsx`, the `<header>` opening tag is currently:

```tsx
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
```

Add `site-header` to the class list (it is a stable hook for the transition CSS; it does not need to be in the `cn` conditional):

```tsx
    <header
      className={cn(
        "site-header sticky top-0 z-50 transition-all duration-500",
```

- [ ] **Step 3: Add the `site-footer` hook class**

In `components/layout/SiteFooter.tsx`, the `<footer>` opening tag is currently:

```tsx
    <footer className="border-t border-white/10 bg-ink-950">
```

Change to:

```tsx
    <footer className="site-footer border-t border-white/10 bg-ink-950">
```

- [ ] **Step 4: Add the morph orchestration to `SiteShell`**

Replace the entire contents of `components/layout/SiteShell.tsx` with:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { routeTheme } from "@/lib/route-theme";
import { cn } from "@/lib/utils";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const BACKGROUND_MS = 450;
const CONTENT_FADE_MS = 180;

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const theme = routeTheme(pathname);
  const reduceMotion = useReducedMotion() ?? false;
  const [transitioning, setTransitioning] = useState(false);
  const prevThemeRef = useRef(theme);

  useEffect(() => {
    const changed = prevThemeRef.current !== theme;
    prevThemeRef.current = theme;
    if (changed && !reduceMotion) {
      setTransitioning(true);
      const t = setTimeout(() => setTransitioning(false), BACKGROUND_MS);
      return () => clearTimeout(t);
    }
  }, [theme, reduceMotion]);

  const fadeDuration = reduceMotion ? 0 : CONTENT_FADE_MS / 1000;

  return (
    <div
      className={cn(
        "site-shell",
        theme === "light" ? "ops-theme-light" : "site-shell-dark",
        transitioning && "is-theme-transitioning",
      )}
    >
      <SiteHeader />
      <main className="site-main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
```

Why this works:
- **Boundary morph:** when `theme` changes, `is-theme-transitioning` is added for 450ms (Layer 2) while `.site-shell`'s `background-color` transition runs (Layer 1).
- **Content crossfade:** `AnimatePresence` is keyed on `theme`. A theme change swaps the key → old content fades out, new content fades in (Layer 3). A same-theme navigation keeps the key unchanged → no animation → instant swap (scope A honored, no extra gating).
- **Initial load:** `initial={false}` + `prevThemeRef` starting equal to `theme` means no transition on first mount.
- **Reduced motion:** `fadeDuration` becomes 0 and `is-theme-transitioning` is never added; the global CSS also zeroes the background-color transition. Net: instant swap.

- [ ] **Step 5: Verify typecheck and build**

Run: `npm run typecheck`
Expected: exits 0.

Run: `npm run lint`
Expected: `✔ No ESLint warnings or errors`.

Run: `npm run build`
Expected: `✓ Compiled successfully`; all routes generate.

- [ ] **Step 6: Verify the morph visually**

Run `npm run dev` and confirm:
- Homepage (`/`) → click "Explore courses" / Courses nav → the canvas morphs from dark to light over ~0.45s, header text eases to dark, homepage content dissolves out and course-map content dissolves in. Arrives light. No hard cut.
- Courses (`/courses`) → a course (`/courses/finance-foundations`): **instant** swap, no fade (same theme).
- Course → back to homepage (`/`): the morph plays in reverse (light → dark).
- Toggle OS/browser reduced-motion, repeat homepage↔courses: **instant** swap, no animation.
- Mobile width (e.g. 390px): morph still smooth, no horizontal scroll.

(Optional) Capture before/after with Playwright to attach as QA evidence, following the same pattern as `docs/superpowers/qa/2026-07-29-typography-rollout/`.

- [ ] **Step 7: Commit**

```bash
git add components/layout/SiteShell.tsx components/layout/SiteHeader.tsx components/layout/SiteFooter.tsx app/globals.css
git commit -m "feat(theme): seamless dark/light morph at site boundary"
```

---

## Done criteria

- Homepage ↔ learning boundary animates as one seamless morph (background ease + header/footer color ease + content crossfade).
- Same-theme navigations are instant (unchanged from before).
- Reduced-motion yields instant swaps.
- `tsc` / `lint` / `build` all clean; 65 pages still generate.
- No new dependencies; no per-page or per-`Link` edits; the `.ops-theme-light` scoping system and all page content are untouched.
