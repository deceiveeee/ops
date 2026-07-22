# OPS Learning Pages — Unified Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert all internal learning pages from a dark dashboard aesthetic to a unified light theme while keeping the homepage dark and cinematic.

**Architecture:** Token-level refactor behind a `.ops-theme-light` scope class applied via a Next.js `(learning)` route group. Shared primitives use semantic CSS variables. A narrow `.lesson-content` compatibility layer catches legacy hardcoded Tailwind utilities. The homepage (`(marketing)`) and dark routes (`/studio`, `/filings` in `(app)`) keep the default dark scope.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript 5, Tailwind 3.4, Motion, KaTeX. No test framework — verification is `lint` + `typecheck` + `build` + visual QA.

**Authoritative reference:** `docs/superpowers/specs/2026-07-21-learning-pages-light-theme-design.md`. **All CSS code, exact class names, color values, component refactors, and structural decisions live in the spec.** This plan does not duplicate them — it sequences them into verifiable phases. When a task says "apply the changes from spec §X.Y", open the spec and apply exactly what is written there.

## Global Constraints

- **Theme boundary:** `.ops-theme-light` scope class via `(learning)/layout.tsx`. Never via client pathname detection.
- **Server-rendered first frame:** No dark-to-light flash. `html:has(.ops-theme-light)` cascades the background.
- **Accent rule:** Bright `#22d3ee` / `#fbbf24` for fills/graphics only. Strong `#007A8A` / `#8A5A00` for text, links, borders on light surfaces.
- **Typography:** Body 18px / 1.65, definition 19px / 1.65. Sentence case for visible labels. Mono uppercase retired in light scope.
- **Shadows:** Resting cards have no shadow. `--ops-shadow-elevated` for hover/sticky/interactive elevation only.
- **Accessibility:** `aria-current="page"` for active lesson route; `aria-current="location"` for active in-page module. Keyboard-accessible mobile navigation. Focus rings on all interactive elements.
- **Out of scope:** Homepage, `/studio`, `/filings` remain dark.
- **Verification:** `npm run lint && npm run typecheck && npm run build` after every task. Visual QA at desktop / tablet / mobile per the spec's QA matrix (§13).
- **Commits:** One commit per task, conventional commit style (`feat:`, `refactor:`, `fix:`). **Approval of this plan authorizes local commits during execution.** Do not push, deploy, or open a PR without separate user approval.

## File Structure

See spec §11 for the complete file inventory. Summary:

- **New components:** `SiteShell`, `LessonLayout`, `LessonSidebar`, `LessonSourceCard`, `LessonNavItem`
- **New route files:** `(marketing)/layout.tsx`, `(learning)/layout.tsx`, `(learning)/loading.tsx`, `(learning)/error.tsx`, `(learning)/not-found.tsx`, `(app)/layout.tsx`
- **Moved routes:** all current `app/{page,courses,lessons,studio,filings}` into their respective route groups
- **Modified:** root `layout.tsx` (stripped), `globals.css` (tokens + primitives + compat layer), `SiteHeader`, `SiteFooter`, `Button`, `Badge`, `SectionLabel`, `CourseCard`, `CourseRail`, `ModuleSection`, shared lesson primitives in `intro-course-overview/shared.tsx`, 10 × `*Layout.tsx`, 10 × `*ProgressRail.tsx`, 10 × `*SourcePanel.tsx`, both course pages
- **Untouched:** `components/marketing/*` (homepage marketing components, stay dark)
- **Audited, targeted edits expected:** all 47 lesson content components (`Lesson*.tsx`) — shared tokens and primitives handle most cases, but each file must be inspected for hardcoded dark patterns (see Phase 10: Exception Remediation)

---

## Phase 0: Environment capability check

**Goal:** Confirm the execution environment can perform real visual QA before any code changes. **Do not start implementation until Phase 0 passes.**

### Task 0.1: Verify execution environment capabilities

- [ ] **Step 1: Confirm Node and dependencies are installed**

```bash
node --version    # expected: 18.x or 20.x (Next.js 14 requirement)
npm --version
npm ls --depth=0  # confirms node_modules is populated
```

If `node_modules` is missing or stale, run `npm install` and re-verify.

- [ ] **Step 2: Start the dev server and open in a real browser**

```bash
npm run dev
```

Open `http://localhost:3000` in Chrome, Edge, or Firefox (not headless). Confirm:
- Homepage loads without console errors.
- `/courses`, `/courses/finance-foundations`, `/lessons/present-value-cashflows-assets-npv`, `/studio`, `/filings` all load.

If the dev server fails to start or routes error, stop and report — implementation cannot proceed.

- [ ] **Step 3: Confirm DevTools viewport emulation works**

In the browser DevTools device toolbar, cycle through:
- Desktop: 1440 × 900
- Tablet: iPad Mini 768 × 1024
- Mobile: iPhone SE 375 × 812

Confirm the layout responds. If viewport emulation is unavailable (e.g., headless-only environment), stop.

- [ ] **Step 4: Confirm screenshot capture works**

Capture a screenshot of `/courses` at desktop viewport using your harness's screenshot capability (DevTools → Capture screenshot, or OS-level capture). Save to `docs/superpowers/qa/2026-07-21-light-theme/phase-0-capability-check.png`.

If screenshot capture is unavailable, stop. Visual QA cannot be certified through source-code inspection alone.

- [ ] **Step 5: Confirm keyboard navigation testing works**

With the dev server running, tab through `/courses` from the URL bar. Confirm:
- Every link is reachable via Tab.
- Shift+Tab reverses direction.
- Enter activates the focused link.
- The hamburger menu (mobile viewport) opens via Enter when focused.

- [ ] **Step 6: Confirm reduced-motion testing works**

Open DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion` → set to `reduce`. Reload `/courses`. Confirm the page still renders (animations may freeze — that's expected).

- [ ] **Step 7: Confirm console inspection works**

With DevTools open, reload `/courses` and check the Console tab. Note any errors or warnings — these become the baseline for regression comparison later.

- [ ] **Step 8: Document environment capability**

Create `docs/superpowers/qa/2026-07-21-light-theme/phase-0-environment.md` recording:
- Node/npm versions
- Browser used
- Confirmation that all 6 capabilities above work
- Baseline console errors (if any)

**Phase 0 exit gate:** All 8 steps pass. If any step fails, **stop before implementation** and report the gap. The execution model assumes real-browser visual verification throughout.

---

## Phase 1: Route group foundation (atomic)

**Goal:** Restructure routes into route groups with shared `SiteShell`. After Phase 1 the site looks identical but the architecture is in place. No theme change yet.

**Critical atomicity constraint (correction §2):** the root-layout change and all route-group moves must land in a **single commit**. No intermediate commit may leave any of the six routes (`/`, `/courses`, `/courses/finance-foundations`, `/lessons/{valid}`, `/studio`, `/filings`) without a header or footer.

### Task 1.1: Create `SiteShell` component + provisional shell CSS

- [ ] **Step 1:** Create `components/layout/SiteShell.tsx` per spec §3.2.
- [ ] **Step 2:** Append provisional `.site-shell`, `.site-shell-dark`, `.ops-theme-light.site-shell`, `.site-main { flex: 1; min-width: 0; }` to `app/globals.css` (structural only — full tokens come in Phase 2).
- [ ] **Step 3:** `npm run lint && npm run typecheck && npm run build` — all pass.
- [ ] **Step 4:** Commit: `feat(shell): add SiteShell wrapper component`. (SiteShell is not yet wired to any route — safe isolated commit.)

### Task 1.2: Atomic route-group migration (single commit)

This task combines the root-layout strip and all four route-group creations into **one commit**. Verify each step in dev before moving to the next, but commit only at the end.

- [ ] **Step 1: Create all three route-group layouts (no moves yet)**

Create these files (they reference SiteShell from Task 1.1):

```tsx
// app/(marketing)/layout.tsx
import SiteShell from "@/components/layout/SiteShell";
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell theme="dark">{children}</SiteShell>;
}
```

```tsx
// app/(learning)/layout.tsx
import SiteShell from "@/components/layout/SiteShell";
export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell theme="light">{children}</SiteShell>;
}
```

```tsx
// app/(app)/layout.tsx
import SiteShell from "@/components/layout/SiteShell";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell theme="dark">{children}</SiteShell>;
}
```

- [ ] **Step 2: Move all five page trees in a single batch**

Use `git mv` for each, preserving history:

```bash
# Create target directories
New-Item -ItemType Directory -Path 'app/(marketing)' -Force
New-Item -ItemType Directory -Path 'app/(learning)/courses/[courseSlug]' -Force
New-Item -ItemType Directory -Path 'app/(learning)/lessons/[lessonSlug]' -Force
New-Item -ItemType Directory -Path 'app/(app)/studio' -Force
New-Item -ItemType Directory -Path 'app/(app)/filings' -Force

# Move (URLs stay the same because parens groups don't appear in URLs)
git mv 'app/page.tsx'                       'app/(marketing)/page.tsx'
git mv 'app/courses/page.tsx'               'app/(learning)/courses/page.tsx'
git mv 'app/courses/[courseSlug]/page.tsx'  'app/(learning)/courses/[courseSlug]/page.tsx'
git mv 'app/lessons/[lessonSlug]/page.tsx'  'app/(learning)/lessons/[lessonSlug]/page.tsx'
git mv 'app/studio/page.tsx'                'app/(app)/studio/page.tsx'
git mv 'app/filings/page.tsx'               'app/(app)/filings/page.tsx'

# Remove now-empty directories
Remove-Item -Path 'app/courses' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'app/lessons' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'app/studio' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'app/filings' -Recurse -Force -ErrorAction SilentlyContinue
```

- [ ] **Step 3: Strip root layout in the same change**

Modify `app/layout.tsx` per spec §11 "Modified":
- Remove `bg-ink-950 text-slate-100 selection:bg-accent-cyan/30` from `<body>`.
- Remove `<SiteHeader />` and `<SiteFooter />` (they are now rendered by each route group's `SiteShell`).
- Remove the inner `<div className="relative flex min-h-screen flex-col">` wrapper.
- Keep fonts, metadata, and `<html><body>{children}</body></html>` structure.

- [ ] **Step 4: Build and verify all six routes work**

```bash
npm run lint && npm run typecheck && npm run build
```

Then in `npm run dev`, manually verify each route:
- `/` — homepage renders with header, footer, dark theme intact
- `/courses` — course map renders with header, footer (body bg will be light from `.ops-theme-light`; content still dark-styled, expected)
- `/courses/finance-foundations` — course detail renders with header, footer
- `/lessons/present-value-cashflows-assets-npv` — lesson renders with header, footer
- `/studio` — studio renders with header, footer, dark theme intact
- `/filings` — filings renders with header, footer, dark theme intact

If any route is broken, fix before committing.

- [ ] **Step 5: Capture visual checkpoint**

Save desktop screenshots of `/` and `/courses` to `docs/superpowers/qa/2026-07-21-light-theme/phase-1-checkpoint.png` for comparison against later phases.

- [ ] **Step 6: Commit (single commit for the entire atomic migration)**

```bash
git add 'app/(marketing)/' 'app/(learning)/' 'app/(app)/' 'app/layout.tsx'
git commit -m "feat(routes): atomic migration to route-group shells

- Strip header/footer/theme from root layout
- Create (marketing), (learning), (app) route-group layouts
- Move homepage, courses, lessons, studio, filings into their groups
- URLs unchanged; every route remains functional throughout"
```

### Task 1.3: Add `html:has(.ops-theme-light)` background cascade

- [ ] **Step 1:** Append the html/body rules from spec §3.3 (including `html:has(.ops-theme-light) body { background: #F5F5F7; }`) to `app/globals.css` immediately after `@tailwind utilities;`.
- [ ] **Step 2:** `npm run dev`. Visit `/courses` — overscroll shows light gray. Visit `/` — overscroll shows black.
- [ ] **Step 3:** Commit: `feat(shell): cascade theme background to html/body via :has()`.

**Phase 1 exit gate:** `npm run lint && npm run typecheck && npm run build` all pass. All six routes render with header and footer. Homepage, studio, filings visually identical to pre-migration. Learning routes show light body bg only (content still dark — Phase 2+ handles that).

**Visual checkpoint after Phase 1:** Report screenshots of `/` (dark, unchanged) and `/courses` (light body, dark content) before proceeding.

---

## Phase 2: Theme tokens and primitive CSS restyle

**Goal:** Populate the semantic token system and refactor primitive CSS classes to use tokens. After Phase 2, primitives render light inside `.ops-theme-light`, dark outside.

### Task 2.1: Define theme tokens

- [ ] **Step 1:** Replace the existing `:root` block in `app/globals.css` with the full token definitions from spec §4.1, §4.2, §4.3 (dark defaults + light overrides) AND the header/footer tokens from spec §9.1.
- [ ] **Step 2:** `npm run build` — passes. No visual change yet.
- [ ] **Step 3:** Commit: `feat(theme): add semantic light/dark tokens`.

### Task 2.2: Refactor body and selection rules

- [ ] **Step 1:** Replace the `html, body { background-color: #05070d; color: #e6ebf5; ... }` block per spec Task 2.2 — background and color are now driven by scope tokens.
- [ ] **Step 2:** Update `::selection` to use `var(--ops-accent-soft)` and `var(--ops-text-primary)`.
- [ ] **Step 3:** `npm run build`. Verify `/courses` body bg is light, `/` body bg is dark.
- [ ] **Step 4:** Commit: `refactor(theme): body bg/color driven by scope tokens`.

### Task 2.3: Refactor `.glass-panel` and neutralize `.terminal-grid`

- [ ] **Step 1:** Update `.glass` and `.glass-panel` per spec §6 table — use `var(--ops-surface)`, `var(--ops-surface-border)`, `var(--ops-shadow-resting)`, border-radius 16px.
- [ ] **Step 2:** Add the `.ops-theme-light .terminal-grid { background-image: none; }` rule and the `::before`/`::after` reset from spec Task 2.3 — do NOT use `display: none`.
- [ ] **Step 3:** `npm run build`. Visit any lesson with `terminal-grid` overlay — grid gone in light scope, but structural wrapper still renders. Verify `/studio` still shows the grid.
- [ ] **Step 4:** Commit: `refactor(primitives): glass-panel uses tokens; terminal-grid neutralized in light scope`.

### Task 2.4: Refactor typography utilities (`.ops-*`)

- [ ] **Step 1:** Replace the typography `@layer components` block per spec Task 2.4 — all text colors via tokens, body 18px / 1.65, definition 19px / 1.65, `.ops-caption` and `.ops-eyebrow` sans + sentence case.
- [ ] **Step 2:** Update `.ops-interactive-frame` to neutral default + state-driven cyan top edge (`.is-active`, `.is-selected`, `.is-emphasis`, `:focus-within`).
- [ ] **Step 3:** Update `.ops-definition-card` to use `color-mix` for the cyan-tinted border on white.
- [ ] **Step 4:** `npm run build`. Visit `/lessons/present-value-cashflows-assets-npv` — definition cards render light. Visit `/` — homepage typography still white on dark.
- [ ] **Step 5:** Commit: `refactor(typography): ops-* classes use tokens; sentence case; 1.65 line-height`.

### Task 2.5: Add spacing scale and lesson width utilities

- [ ] **Step 1:** Append the spacing scale (`.mt-section`, `.mt-subsection`, `.mt-block`) and width wrappers (`.lesson-container`, `.lesson-prose`, `.lesson-wide`, `.lesson-full`) to `@layer utilities` per spec §5.3 and §7.6.
- [ ] **Step 2:** `npm run build` — passes.
- [ ] **Step 3:** Commit: `feat(utilities): add spacing scale and lesson width wrappers`.

**Phase 2 exit gate:** All builds pass. Inside `.ops-theme-light`, primitive surfaces and text render light via tokens. Homepage and dark routes still look correct. Lesson body content still has many dark hardcoded Tailwind classes — that's Phase 3's job.

---

## Phase 3: Lesson-content compatibility layer

**Goal:** Add the scoped CSS that converts legacy hardcoded Tailwind utilities inside lesson prose to light equivalents. This is what makes the 47 lesson files render light without per-file edits.

### Task 3.1: Add class hooks to `Button` and `Feedback`

Hard prerequisite: the compatibility layer's `:not()` filters require `.ops-btn`, `.feedback`, `.ops-chart`, `.ops-dark-visual` class hooks on excluded components.

- [ ] **Step 1:** Add `ops-btn` to the `Button` className prefix in `components/ui/Button.tsx`.
- [ ] **Step 2:** Add `feedback` class to the `Feedback` outer div in `components/lessons/intro-course-overview/shared.tsx`.
- [ ] **Step 3:** `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 4:** Commit: `feat(primitives): add ops-btn and feedback class hooks for compat layer`.

### Task 3.2: Build a verification fixture before enabling the full compat layer

Before applying the full compatibility CSS, build a temporary fixture page that proves the selector only converts ordinary content and leaves buttons, feedback, charts, and dark visuals untouched.

- [ ] **Step 1: Create a temporary fixture route**

Create `app/(learning)/__compat-fixture/page.tsx` (this file is deleted at the end of Task 3.3):

```tsx
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

export default function CompatFixture() {
  return (
    <div className="lesson-page">
      <div className="lesson-container">
        <div className="lesson-grid">
          <aside />
          <div className="lesson-content">
            <h1 className="text-white">Compatibility fixture</h1>
            <p className="text-slate-200 mt-4">
              Ordinary paragraph — should render as primary/secondary text in light scope.
            </p>

            <section className="mt-section">
              <h2 className="text-white text-2xl">1. Ordinary content (should convert)</h2>
              <div className="bg-white/[0.03] border-white/10 border p-4 mt-2">
                <p className="text-slate-300">Panel text — should become secondary.</p>
              </div>
            </section>

            <section className="mt-section">
              <h2 className="text-white text-2xl">2. Primary button (must NOT convert)</h2>
              <div className="mt-2">
                <Button href="/courses">Primary button</Button>
              </div>
            </section>

            <section className="mt-section">
              <h2 className="text-white text-2xl">3. Feedback (must NOT convert)</h2>
              <div className="mt-2">
                <Feedback status="correct">Correct feedback text — should keep authored colors.</Feedback>
              </div>
            </section>

            <section className="mt-section">
              <h2 className="text-white text-2xl">4. Chart container (must NOT convert)</h2>
              <div className="ops-chart bg-white/[0.03] border-white/10 border p-4 mt-2">
                <p className="text-slate-300">Inside .ops-chart — should keep dark-authored colors.</p>
              </div>
            </section>

            <section className="mt-section">
              <h2 className="text-white text-2xl">5. Dark visual (must NOT convert)</h2>
              <div className="ops-dark-visual p-4 mt-2">
                <p className="text-slate-300">Inside .ops-dark-visual — should keep dark-authored colors.</p>
              </div>
            </section>

            <Link href="/courses" className="block mt-section">← Back to courses</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Visit the fixture (compat layer not yet applied)**

Visit `/__compat-fixture` in dev. Confirm it renders (no errors). Take a "before" screenshot.

- [ ] **Step 3: Commit the fixture**

```bash
git add 'app/(learning)/__compat-fixture/'
git commit -m "test(compat): add fixture for verifying compatibility layer scoping"
```

### Task 3.3: Add the compatibility layer CSS with correct selector syntax

**Critical selector syntax (correction §3):** `:not()` filters attach **directly** to the utility class with no whitespace. The previous draft had `.text-white :not(...)` (descendant combinator) — that was wrong. The correct form is `.text-white:not(...)` (filter on the same element).

- [ ] **Step 1: Append the compatibility layer to `app/globals.css`**

Add a new `@layer utilities` block at the very end of `globals.css` — after Tailwind's utilities block, so source order resolves ties in our favor. The `:where(.ops-theme-light .lesson-content)` prefix keeps specificity at (0,0,1). Each rule combines two `:not()` filters — one for the root elements themselves and one for descendants:

```css
/* ─────────────────────────────────────────────────────────────
   Lesson-content compatibility layer
   Converts legacy hardcoded Tailwind utilities inside lesson prose
   to light-theme equivalents. Excludes .ops-btn, .feedback, .ops-chart,
   and .ops-dark-visual (both roots and descendants).
   Selector syntax: .text-white:not(...) — no whitespace before :not.
   ───────────────────────────────────────────────────────────── */

:where(.ops-theme-light .lesson-content)
.text-white:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-primary);
}

:where(.ops-theme-light .lesson-content)
.text-slate-50:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-primary);
}

:where(.ops-theme-light .lesson-content)
.text-slate-100:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-primary);
}

:where(.ops-theme-light .lesson-content)
.text-slate-200:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-secondary);
}

:where(.ops-theme-light .lesson-content)
.text-slate-300:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-secondary);
}

:where(.ops-theme-light .lesson-content)
.text-slate-400:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-tertiary);
}

:where(.ops-theme-light .lesson-content)
.text-slate-500:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-tertiary);
}

:where(.ops-theme-light .lesson-content)
.text-slate-600:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    color: var(--ops-text-tertiary);
}

/* Borders */
:where(.ops-theme-light .lesson-content)
.border-white\/10:not(
    :where(.ops-btn, .ops-dark-visual)
):not(
    :where(.ops-btn, .ops-dark-visual) *
) {
    border-color: var(--ops-surface-border);
}

:where(.ops-theme-light .lesson-content)
.border-white\/15:not(
    :where(.ops-btn, .ops-dark-visual)
):not(
    :where(.ops-btn, .ops-dark-visual) *
) {
    border-color: var(--ops-surface-border);
}

:where(.ops-theme-light .lesson-content)
.border-white\/20:not(
    :where(.ops-btn, .ops-dark-visual)
):not(
    :where(.ops-btn, .ops-dark-visual) *
) {
    border-color: var(--ops-surface-border);
}

/* Backgrounds */
:where(.ops-theme-light .lesson-content)
.bg-white\/\[0\.02\]:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    background: var(--ops-surface-2);
}

:where(.ops-theme-light .lesson-content)
.bg-white\/\[0\.03\]:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    background: var(--ops-surface-2);
}

:where(.ops-theme-light .lesson-content)
.bg-white\/\[0\.045\]:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    background: var(--ops-surface-2);
}

:where(.ops-theme-light .lesson-content)
.bg-white\/5:not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
):not(
    :where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *
) {
    background: var(--ops-surface-2);
}

/* Hover backgrounds */
:where(.ops-theme-light .lesson-content)
.hover\:bg-white\/5:not(
    :where(.ops-btn, .ops-dark-visual)
):not(
    :where(.ops-btn, .ops-dark-visual) *
):hover {
    background: var(--ops-surface-2);
}

:where(.ops-theme-light .lesson-content)
.hover\:bg-white\/10:not(
    :where(.ops-btn, .ops-dark-visual)
):not(
    :where(.ops-btn, .ops-dark-visual) *
):hover {
    background: rgba(0, 0, 0, 0.06);
}
```

- [ ] **Step 2: Verify against the fixture (correctness gate)**

Visit `/__compat-fixture` in dev. Verify in the rendered page:

- Section 1 (ordinary content): `text-white` becomes `var(--ops-text-primary)` (dark on light). `text-slate-300` becomes secondary. The `bg-white/[0.03]` panel becomes `var(--ops-surface-2)`. The `border-white/10` becomes `var(--ops-surface-border)`. ✓
- Section 2 (primary button): button retains its bright cyan background and dark text. ✓
- Section 3 (Feedback): feedback retains its authored success colors (green border, green text, light-green background). ✓
- Section 4 (`.ops-chart`): inner `text-slate-300` keeps its authored slate color (NOT converted). ✓
- Section 5 (`.ops-dark-visual`): inner `text-slate-300` keeps its authored color; the container renders dark with light text. ✓

Take an "after" screenshot. If any section fails the gate, fix the selector before continuing. **Do not proceed to Step 3 until all five sections verify correctly.**

- [ ] **Step 3: Verify against a real lesson**

Visit `/lessons/if-1-1-how-an-investor-builds-a-philosophy`. Verify body text is light, panels render white, definition cards render cyan-tinted, buttons and feedback retain their authored colors. Take a screenshot.

- [ ] **Step 4: `npm run lint && npm run typecheck && npm run build`** — all pass.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat(compat): add lesson-content compatibility layer with verified scoping"
```

### Task 3.4: Add `.ops-dark-visual` escape hatch + remove fixture

- [ ] **Step 1:** Append the `.ops-dark-visual` token reset from spec §8.4 after the compatibility layer.
- [ ] **Step 2:** `npm run build`.
- [ ] **Step 3: Remove the fixture**

```bash
git rm 'app/(learning)/__compat-fixture/page.tsx'
```

- [ ] **Step 4:** Commit:

```bash
git commit -m "feat(escape-hatch): add .ops-dark-visual; remove compat fixture

- Add .ops-dark-visual token reset (correction §7 from spec)
- Fixture served its purpose in Task 3.3; remove before merge"
```

**Phase 3 exit gate:** All builds pass. Lesson content renders light across the board. Spot-check `/lessons/present-value-cashflows-assets-npv`, `/lessons/if-1-1-how-an-investor-builds-a-philosophy`, `/lessons/risk-return-what-they-mean` — body text readable, panels light, formulas (KaTeX) readable, buttons and feedback states preserved.

---

## Phase 4: SiteHeader and SiteFooter theme-awareness

**Goal:** Header and footer render light inside `.ops-theme-light`, dark outside — using tokens, not pathname detection.

### Task 4.1: Refactor `SiteHeader` to use tokens

- [ ] **Step 1:** Add `.site-header*` classes (background, border, text, hover, mobile panel) to `app/globals.css` per spec §9.1, all driven by `--header-*` tokens.
- [ ] **Step 2:** Refactor `components/layout/SiteHeader.tsx` — replace hardcoded dark Tailwind classes (`bg-ink-950/80`, `border-white/10`, `text-slate-300`, etc.) with the new `.site-header*` classes. Keep the existing `usePathname` for `isHome` behavior (transparent-over-hero on homepage only) — that's behavior, not theme. The Logo svg keeps `text-accent-cyan` (brand color in both scopes).
- [ ] **Step 3:** `npm run build`. Visit `/` — header transparent over hero, dark on scroll. Visit `/courses` — header light, mobile menu opens with light panel. Visit `/studio` — header dark.
- [ ] **Step 4:** Commit: `refactor(header): use theme tokens via .site-header classes`.

### Task 4.2: Refactor `SiteFooter` to use tokens

- [ ] **Step 1:** Add `.site-footer*` classes (background, border, brand, body, muted, link) to `app/globals.css` per spec §9.1.
- [ ] **Step 2:** Replace `components/layout/SiteFooter.tsx` with the token-driven version from spec Task 4.2.
- [ ] **Step 3:** `npm run build`. Visit `/courses` — footer white with dark text. Visit `/` — footer dark with light text.
- [ ] **Step 4:** Commit: `refactor(footer): use theme tokens via .site-footer classes`.

**Phase 4 exit gate:** All builds pass. Header and footer render correctly in both scopes. Mobile menu (light scope) is keyboard accessible with proper focus management.

---

## Phase 5: Shared primitives restyle

**Goal:** UI primitives in `components/ui/` and the shared lesson primitives render correctly in both scopes.

### Task 5.1: Refactor `Button` variants for light scope (including shadow removal)

- [ ] **Step 1:** Add `.ops-theme-light .ops-btn.variant-outline` and `.variant-ghost` overrides to `app/globals.css` per spec Task 5.1 — light scope uses `var(--ops-text-primary)` for outline and `var(--ops-text-secondary)` for ghost.
- [ ] **Step 2: Remove `shadow-glow` from primary buttons in light scope** (correction §8). Add to `app/globals.css`:

```css
/* Primary buttons in light scope: no neon glow.
   Use a subtle resting shadow instead — or no shadow at all. */
.ops-theme-light .ops-btn.variant-primary,
.ops-theme-light .ops-btn.primary {
    box-shadow: var(--ops-shadow-resting);
}
```

The existing `primary` variant in `Button.tsx` uses `shadow-glow` (defined in `tailwind.config.ts` as `0 0 0 1px rgba(34,211,238,0.15), 0 0 40px -10px rgba(34,211,238,0.35)`). That glow stays in the dark scope (homepage CTA, studio, filings) but is overridden to `--ops-shadow-resting` (which is `none` in light scope) inside `.ops-theme-light`. Do not modify the dark scope.

- [ ] **Step 3:** Update `Button.tsx` variants to include the `variant-outline` / `variant-ghost` / `variant-primary` class hooks (alongside the existing `ops-btn` class from Task 3.1). Update the `primary` variant:

Find:

```tsx
primary:
    "bg-accent-cyan text-ink-950 hover:bg-accent-cyan/90 border border-accent-cyan/40 shadow-glow",
```

Change to:

```tsx
primary:
    "variant-primary bg-accent-cyan text-ink-950 hover:bg-accent-cyan/90 border border-accent-cyan/40 shadow-glow",
```

(The `shadow-glow` stays in the className; the scoped CSS override from Step 2 neutralizes it inside `.ops-theme-light`.)

- [ ] **Step 4:** `npm run build`. Verify buttons on `/courses` (light — no glow, subtle or no shadow) and `/studio` (dark — glow retained). Verify homepage `/` keeps glow on primary CTAs.
- [ ] **Step 5:** Commit: `refactor(button): light-scope variants via token overrides; remove glow in light scope`.

### Task 5.2: Refactor `Badge` and `SectionLabel` to sentence case

- [ ] **Step 1:** Update `Badge.tsx` — remove `font-mono text-[10px] uppercase tracking-[0.18em]`, replace with `text-[12px] font-medium tracking-normal` per spec Task 5.2.
- [ ] **Step 2:** Update `SectionLabel.tsx` — add `.section-label` wrapper class so tone color overrides can be scoped. Replace `font-sans text-[14px] font-medium` with `text-[13px] font-semibold tracking-normal`.
- [ ] **Step 3:** Add scoped tone overrides to `app/globals.css` — `.ops-theme-light .section-label .text-accent-cyan { color: var(--ops-accent-strong); }` etc. (scoped to `.section-label` to avoid bleeding into buttons/charts).
- [ ] **Step 4:** `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 5:** Commit: `refactor(ui): Badge and SectionLabel use sentence case and scoped tone overrides`.

### Task 5.3: Refactor shared lesson primitives

- [ ] **Step 1:** In `components/lessons/intro-course-overview/shared.tsx`, refactor per spec Task 5.3:
  - `Panel`: rename `tone="dark"` to `tone="default"`, always use `glass-panel` (token-driven).
  - `DefinitionCard`: use `var(--ops-accent-strong)` for the term color.
  - `TryItTag`: sentence case, soft cyan bg, strong text.
  - `ConceptTag`: per-concept style record with strong variants (cyan / amber / red / purple / green).
  - `Feedback`: semantic feedback tokens (success / warning / error / info) with `color-mix` borders and soft backgrounds.
  - `SectionHeading`: add optional `emphasis` prop; index numeral is tertiary by default, accent-strong when emphasized.
- [ ] **Step 2:** `npm run lint && npm run typecheck && npm run build`. Visit `/lessons/present-value-cashflows-assets-npv` — section headings have neutral numerals, panels light, definition cards cyan-on-white, ConceptTags use strong variants, Feedback states use semantic colors.
- [ ] **Step 3:** Commit: `refactor(lessons): shared primitives use tokens and sentence case`.

**Phase 5 exit gate:** All builds pass. Every primitive renders correctly in both scopes. Spot-check 3 lessons across modules for visual regressions in: formula rendering, feedback states, concept tags, definition cards, section headings.

**Visual checkpoint (correction §11):** Pause and report rendered screenshots after route+theme foundation (end of Phase 5) before proceeding to Phase 6. Capture: `/courses` (course map, body light, content still partly dark — expected), `/lessons/present-value-cashflows-assets-npv` (lesson body, content mostly light via compat layer), `/studio` (still dark, unchanged). Report these to the user before continuing.

---

## Phase 6: Course map page (`/courses`)

**Goal:** Apply the light theme and simplified structure to the course map. Remove the duplicate path representation (3-step path in hero + sequence section) — keep only the sequence section.

### Task 6.1: Simplify hero, remove duplicate sequence, restyle sequence section

- [ ] **Step 1:** In `app/(learning)/courses/page.tsx`, replace the outer wrapper: `<div className="hp-atmosphere-deep min-h-screen">` → `<div className="min-h-screen" style={{ background: "var(--ops-bg)" }}>`.
- [ ] **Step 2:** Replace the hero section per spec Task 6.1 — add `Courses` eyebrow, apply primary text color to title, secondary to lead. **Remove the entire 3-step path block and the `PathStep` / `PathConnector` helper functions** (single representation rule).
- [ ] **Step 3:** Update the sequence section: replace `border-white/10` with `borderTop: 1px solid var(--ops-surface-border)`; primary text on heading; secondary text on links.
- [ ] **Step 4:** Refactor `SequenceStep` per spec Task 6.1 — neutral top border, primary title, secondary note, STRONG accent on "Step N" label (passed via new `accentStrong` prop, not `accent`).
- [ ] **Step 5:** Update the three `SequenceStep` invocations to pass STRONG variants: `var(--ops-accent-strong)`, `var(--ops-accent-warm-strong)`, `var(--ops-text-primary)` (for the studio step, neutral).
- [ ] **Step 6:** `npm run build`. Visit `/courses` — page bg light, hero simplified (no 3-step path), sequence section is the single representation.
- [ ] **Step 7:** Commit: `refactor(course-map): simplify hero, remove duplicate sequence, light theme`.

### Task 6.2: Refactor `CourseCard` body to white surface

**Critical:** the dark visual top is a bounded instructional thumbnail and stays dark. Only the body becomes light. **Hover elevation must be implemented in CSS — do NOT use `onMouseEnter`/`onMouseLeave` and do NOT convert this server component to a client component** (correction §9).

- [ ] **Step 1:** Add a scoped `.course-card` hover rule to `app/globals.css`:

```css
/* CourseCard hover — pure CSS, no JS handlers */
.course-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.course-card:hover {
    box-shadow: var(--ops-shadow-elevated);
}
```

- [ ] **Step 2:** In `components/courses/CourseCard.tsx`, replace the card container per spec Task 6.2 — `background: var(--ops-surface)`, `border: 1px solid var(--ops-surface-border)`, `box-shadow: var(--ops-shadow-resting)` as initial state. Add the `course-card` class. **No `onMouseEnter`/`onMouseLeave` props.** Delete `variantBg` and `variantBorder` maps.
- [ ] **Step 3:** Update body text colors per spec Task 6.2 — title primary, subtitle accent STRONG, description secondary, "What you'll learn" eyebrow tertiary, outcomes list primary with accent SOFT dot, stats numerals primary (NOT bright accent — spec correction §3 #6) with tertiary labels.
- [ ] **Step 4:** Update stats row border to `var(--ops-surface-border)`; delete `variantAccentText` and `variantRecommend` maps.
- [ ] **Step 5:** Refactor the "Start here" recommended badge per spec Task 6.2 — soft accent bg, `color-mix` border, strong text.
- [ ] **Step 6:** Leave the `<CourseVisual>` component (and its `FinanceVisual` / `InvestmentVisual` helpers) **unchanged** — the dark instructional thumbnail is retained.
- [ ] **Step 7:** `npm run build`. Visit `/courses` — cards have white bodies with subtle borders, dark visual tops retained, hover elevates with shadow (via CSS, no JS).
- [ ] **Step 8:** Commit: `refactor(course-card): white body with retained dark visual top; CSS hover`.

**Phase 6 exit gate:** All builds pass. Course map is fully light. Single sequence representation. Course cards have clear product identity (dark visual top) while sitting comfortably in the light environment.

---

## Phase 7: Course detail page (`/courses/[courseSlug]`)

**Goal:** Convert from dark hero + dark closing CTA to a unified light experience with a softly tinted hero.

### Task 7.1: Convert course hero to softly tinted light

- [ ] **Step 1:** Replace the hero's `background` style per spec Task 7.1 — radial wash alpha drops from 10% to ~5%, base becomes `var(--ops-bg)` instead of `#05070d`. NOT a dark block.
- [ ] **Step 2:** Update breadcrumb, course number label (sentence case "Course 1" not "Course 01"), title, lead, description, CTA link colors per spec Task 7.1.
- [ ] **Step 3:** Update right column border + stats: `borderLeft: 1px solid var(--ops-surface-border)`. **Stats numerals are primary text color, NOT bright accent** (spec correction §3 #6).
- [ ] **Step 4:** Update `HeroStat` component per spec Task 7.1 — remove `accent` prop, primary text numerals, tertiary text labels in sentence case.
- [ ] **Step 5:** Update `CourseFlowVisual` SVG per spec Task 7.1 — neutral connector (`var(--ops-text-tertiary)` at 30% opacity), bright accent dots (non-textual, OK), `var(--ops-text-secondary)` for step text.
- [ ] **Step 6:** Update the context label above the SVG: tertiary text, sentence case.
- [ ] **Step 7:** `npm run build`. Visit `/courses/finance-foundations` — hero softly tinted, stats dark numerals on light bg, flow visual with neutral connector + cyan dots.
- [ ] **Step 8:** Commit: `refactor(course-detail): hero becomes softly tinted light; stats use primary text`.

### Task 7.2: Convert closing CTA from dark to light elevated panel

- [ ] **Step 1:** Replace the closing CTA `<section className="hp-atmosphere-deep">` per spec Task 7.2 — white card (`var(--ops-surface)`) with subtle border and `--ops-shadow-elevated`, rounded 24px, primary heading, secondary lead.
- [ ] **Step 2:** `npm run build`. Verify both course detail pages show the white closing CTA card on light page bg.
- [ ] **Step 3:** Commit: `refactor(course-detail): closing CTA becomes light elevated panel`.

### Task 7.3: Update `CourseRail` — sticky behavior, `aria-current="location"`, scoped-ref scrolling

- [ ] **Step 1:** Add `.course-rail`, `.course-rail-item`, `.course-rail-item.is-active`, `.course-rail-back`, `.course-rail-cta` CSS to `app/globals.css` per spec Task 7.3 — sticky `top: calc(var(--site-header-height) + 24px)`, `max-height: calc(100dvh - var(--site-header-height) - 48px)`, `overflow-y: auto`, `overscroll-behavior: contain`. Active item: soft accent bg, strong accent left bar, primary text, no glow.
- [ ] **Step 2:** Refactor `components/courses/CourseRail.tsx` per spec Task 7.3 — replace dark hardcoded classes with the new `.course-rail*` classes. Active item gets `aria-current="location"` (NOT "page" or "true").
- [ ] **Step 3: Implement scoped-ref scrollIntoView** (correction §6). Do NOT use `document.querySelector` immediately after `setState` — it runs before the DOM reflects the new state. Use a ref on the rail container and a separate effect that runs when `activeOrder` changes:

```tsx
import { useEffect, useRef, useState } from "react";
// ... existing imports

export default function CourseRail({ course, modules, accentColor = "#22d3ee" }) {
  const [activeOrder, setActiveOrder] = useState<number | null>(null);
  const railRef = useRef<HTMLElement>(null);

  // Existing IntersectionObserver effect — keep as-is, just sets activeOrder
  useEffect(() => {
    // ... existing observer setup ...
    return () => observer.disconnect();
  }, [modules]);

  // Separate effect: scroll the active item into view whenever activeOrder changes
  useEffect(() => {
    const activeItem = railRef.current?.querySelector<HTMLElement>(
      '[aria-current="location"]'
    );
    activeItem?.scrollIntoView({
      block: "nearest",
      behavior: "auto",  // respects reduced-motion by avoiding smooth
    });
  }, [activeOrder]);

  return (
    <nav
      aria-label={`${course.title} modules`}
      className="course-rail hidden lg:block"
      ref={railRef}
    >
      {/* ... existing content with aria-current on active item ... */}
    </nav>
  );
}
```

The `ref` holds a stable reference to the rail DOM node; the effect runs after React commits the active state to the DOM, so `querySelector` finds the right element.
- [ ] **Step 4:** `npm run build`. Visit `/courses/finance-foundations`, scroll slowly — rail is sticky, active module highlights as you scroll, active item scrolls smoothly into view within the rail (without moving the page), `aria-current="location"` set on active item (verify in DevTools).
- [ ] **Step 5:** Commit: `refactor(course-rail): sticky behavior, aria-current=location, scoped-ref scroll`.

### Task 7.4: Sentence-case module labels and STRONG accent colors

- [ ] **Step 1:** Update `courseAccent` map in `app/(learning)/courses/[courseSlug]/page.tsx` to use CSS variable strings: `"var(--ops-accent-strong)"` for finance-foundations, `"var(--ops-accent-warm-strong)"` for investment-foundations. This flows through to `CourseRail`, `ModuleSection`, `LessonRow` via the existing `accentColor` prop.
- [ ] **Step 2:** Update `ModuleSection.tsx` module label per spec Task 7.4 — `text-[13px] font-semibold` (not `uppercase tracking-[0.06em]`), no leading zero on number ("Module 1" not "Module 01"). Keep `style={{ color: accentColor }}` since `accentColor` is now the STRONG variant.
- [ ] **Step 3:** `npm run build`. Visit `/courses/finance-foundations` — module labels are "Module 1", "Module 2" etc. in cyan-strong. Visit `/courses/investment-foundations` — amber-strong.
- [ ] **Step 4:** Commit: `refactor(course-detail): sentence-case module labels, STRONG accent colors`.

**Phase 7 exit gate:** All builds pass. Both course detail pages are fully light with a single tinted hero moment, sticky rail, sentence-case labels, no dark sections anywhere.

**Visual checkpoint (correction §11):** Pause and report rendered screenshots after course map + course detail conversion. Capture: `/courses` (simplified hero, sequence section, white-bodied cards), `/courses/finance-foundations` (soft cyan tint hero, sticky rail, white closing CTA), `/courses/investment-foundations` (soft amber tint hero). Report to the user before proceeding to Phase 8.

---

## Phase 8: Lesson shell — `LessonLayout`, sidebar, source card, states

**Goal:** Build the unified lesson shell components and the loading/error/not-found route files.

### Task 8.1: Create `LessonNavItem` with full availability-state support

**Critical (correction §7):** the existing project distinguishes `available`, `coming-soon`, and `in-development` lesson statuses. The LessonNavItem must preserve these — not render every item as a normal link.

State semantics:
- `available`: normal link, navigates to the lesson
- `coming-soon`: **non-navigable** row with status badge (the lesson is on the roadmap; clicking does nothing)
- `in-development`: non-navigable row with status badge (preserve current project behavior — see how `app/(learning)/lessons/[lessonSlug]/page.tsx` currently renders the "in development" status)
- `completed`: completion indicator (✓) shown alongside; navigation still works if the lesson is `available`
- `active`: `aria-current="page"` set on the item

- [ ] **Step 1:** Create `components/lessons/LessonNavItem.tsx`:

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LessonStatus = "available" | "coming-soon" | "in-development";

export default function LessonNavItem({
  href,
  number,
  title,
  status = "available",
  completed = false,
  active = false,
}: {
  href: string;
  number: string | number;
  title: string;
  status?: LessonStatus;
  completed?: boolean;
  active?: boolean;
}) {
  const navigable = status === "available";

  const className = cn(
    "lesson-nav-item",
    active && "is-active",
    !navigable && "is-non-navigable",
  );

  const inner = (
    <>
      <span className="lesson-nav-num">{number}</span>
      <span className="lesson-nav-title">{title}</span>
      {completed && (
        <span
          className="lesson-nav-check"
          aria-label="Completed"
          style={{ color: "var(--ops-success-strong)" }}
        >
          ✓
        </span>
      )}
      {!navigable && (
        <span className="lesson-nav-status">
          {status === "coming-soon" ? "Coming soon" : "In development"}
        </span>
      )}
    </>
  );

  if (!navigable) {
    return (
      <li>
        <span className={className} aria-disabled="true" role="link" tabIndex={-1}>
          {inner}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {inner}
      </Link>
    </li>
  );
}
```

- [ ] **Step 2:** Add `.lesson-nav-*` CSS to `app/globals.css` per spec Task 8.1, plus rules for the non-navigable and status variants:

```css
.lesson-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 10px;
    padding: 10px 12px;
    text-decoration: none;
    color: var(--ops-text-secondary);
    font-size: 14px;
    line-height: 1.35;
    transition: background 0.2s ease, color 0.2s ease;
}
.lesson-nav-item:hover {
    background: var(--ops-surface-2);
    color: var(--ops-text-primary);
}
.lesson-nav-num {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--ops-surface-border);
    background: var(--ops-surface-2);
    color: var(--ops-text-tertiary);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}
.lesson-nav-title {
    flex: 1;
    min-width: 0;
}
.lesson-nav-check {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
}
.lesson-nav-status {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 9999px;
    background: var(--ops-surface-2);
    color: var(--ops-text-tertiary);
    border: 1px solid var(--ops-surface-border);
}
.lesson-nav-item.is-active {
    background: var(--ops-accent-soft);
    color: var(--ops-text-primary);
    font-weight: 600;
    border-left: 2px solid var(--ops-accent-strong);
    padding-left: 10px;
}
.lesson-nav-item.is-active .lesson-nav-num {
    background: var(--ops-accent-strong);
    color: var(--ops-on-accent);
    border-color: transparent;
}
.lesson-nav-item.is-non-navigable {
    cursor: not-allowed;
    opacity: 0.7;
}
.lesson-nav-item.is-non-navigable:hover {
    background: transparent;
    color: var(--ops-text-secondary);
}

/* Warm-accent variant for Investment Foundations — scoped to parent .lesson-sidebar-warm */
.lesson-sidebar-warm .lesson-nav-item.is-active {
    background: var(--ops-accent-warm-soft);
    border-left-color: var(--ops-accent-warm-strong);
}
.lesson-sidebar-warm .lesson-nav-item.is-active .lesson-nav-num {
    background: var(--ops-accent-warm-strong);
    color: #ffffff;
}
```

- [ ] **Step 3:** `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 4:** Commit: `feat(lessons): add LessonNavItem preserving available/coming-soon/in-development states`.

### Task 8.2: Create `LessonSidebar` with scoped-ref scrolling

- [ ] **Step 1:** Create `components/lessons/LessonSidebar.tsx` per spec Task 8.2 — client component using `usePathname` for active state. Sticky behavior via CSS. **Use the same scoped-ref scroll pattern as CourseRail (correction §6):**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import LessonNavItem, { type LessonStatus } from "./LessonNavItem";
import { cn } from "@/lib/utils";

export type SidebarLesson = {
  slug: string;
  title: string;
  shortTitle?: string;
  n: number | string;
  status?: LessonStatus;
  completed?: boolean;
};

export default function LessonSidebar({
  courseSlug,
  courseTitle,
  moduleNumber,
  moduleTitle,
  lessons,
  accent = "cyan",
}: {
  courseSlug: string;
  courseTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  lessons: SidebarLesson[];
  accent?: "cyan" | "amber";
}) {
  const pathname = usePathname();
  const activeSlug = pathname?.split("/").pop() ?? "";
  const listRef = useRef<HTMLOListElement>(null);

  // Separate effect: scroll the active item into view whenever activeSlug changes.
  // Runs after React commits the new aria-current to the DOM.
  useEffect(() => {
    const activeItem = listRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]'
    );
    activeItem?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }, [activeSlug]);

  return (
    <div className={cn("lesson-sidebar", accent === "amber" && "lesson-sidebar-warm")}>
      <div className="lesson-sidebar-header">
        <Link href={`/courses/${courseSlug}`} className="lesson-sidebar-back">
          ← {courseTitle}
        </Link>
        <div className="lesson-sidebar-eyebrow mt-4">Module {moduleNumber}</div>
        <h2 className="lesson-sidebar-title mt-1">{moduleTitle}</h2>
      </div>

      <ol ref={listRef} className="lesson-sidebar-list mt-5 space-y-1">
        {lessons.map((l) => (
          <LessonNavItem
            key={l.slug}
            href={`/lessons/${l.slug}`}
            number={l.n}
            title={l.shortTitle ?? l.title}
            status={l.status}
            completed={l.completed}
            active={l.slug === activeSlug}
          />
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2:** Add `.lesson-sidebar*` CSS to `app/globals.css` per spec Task 8.2 — sticky position, max-height, overflow, overscroll-behavior, surface tokens, sentence-case eyebrow and title.
- [ ] **Step 3:** `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 4:** Commit: `feat(lessons): add LessonSidebar with sticky behavior and scoped-ref scroll`.

### Task 8.3: Create `LessonSourceCard`

- [ ] **Step 1:** Create `components/lessons/LessonSourceCard.tsx` per spec Task 8.3 — eyebrow, course, lecture, instructor (accent STRONG), note.
- [ ] **Step 2:** Add `.lesson-source-*` CSS to `app/globals.css` per spec Task 8.3.
- [ ] **Step 3:** `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 4:** Commit: `feat(lessons): add LessonSourceCard component`.

### Task 8.4: Create `LessonLayout` shell

- [ ] **Step 1:** Create `components/lessons/LessonLayout.tsx` per spec Task 8.4 — server component with optional `sidebar` and `breadcrumb` slots. Structure: `.lesson-page` > `.lesson-breadcrumb-bar` > `.lesson-container` > `.lesson-grid` > `.lesson-aside` (sidebar) + `.lesson-content` (children).
- [ ] **Step 2:** Add `.lesson-page`, `.lesson-breadcrumb-bar`, `.lesson-grid`, `.lesson-aside`, `.lesson-content` CSS to `app/globals.css` per spec Task 8.4 — note that `.lesson-content` is full-width; authors wrap children with `.lesson-prose` (720px), `.lesson-wide` (960px), or `.lesson-full` (none) per spec correction §3 #2.
- [ ] **Step 3:** `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 4:** Commit: `feat(lessons): add LessonLayout shell with sidebar+content grid`.

### Task 8.5: Add `loading.tsx`, `error.tsx`, `not-found.tsx`

- [ ] **Step 1:** Create `app/(learning)/loading.tsx` per spec §7.9 — server component, light loading bar with subtle animation, gated behind `prefers-reduced-motion`.
- [ ] **Step 2:** Create `app/(learning)/error.tsx` per spec §7.9 (with correction §5 #2) — **`"use client"`** directive required (uses `reset` callback and `onClick`). Production-safe: no `error.message` rendered unless `NODE_ENV === "development"`. No claim that progress was unaffected. Generic recovery copy.
- [ ] **Step 3:** Create `app/(learning)/not-found.tsx` per spec §7.9 — server component, 404 eyebrow, primary heading, secondary body, link back to `/courses`.
- [ ] **Step 4:** Add all `.lesson-loading*`, `.lesson-error*`, `.lesson-not-found*` CSS to `app/globals.css` per spec §7.9 + the loading keyframe with reduced-motion gate.
- [ ] **Step 5:** `npm run build`. Visit `/lessons/not-a-real-lesson` — 404 renders in light scope. Temporarily throw in a lesson component to verify error UI. Throttle network to verify loading state.
- [ ] **Step 6: Verify notFound() triggers for both invalid dynamic routes** (correction §10). The `(learning)` route group's `not-found.tsx` only renders if the page actually calls Next.js `notFound()`. Verify both:

  - **Invalid lesson slug:** Visit `/lessons/not-a-real-lesson`. Confirm the light-themed `not-found.tsx` renders (not a generic Next.js 404, not a server error). Inspect the page: it should show "Lesson not found." with the light bg.
  - **Invalid course slug:** Visit `/courses/not-a-real-course`. Confirm the light-themed `not-found.tsx` renders. The course page (`[courseSlug]/page.tsx`) must call `notFound()` when `getCourse()` returns undefined — verify this code path exists (it does in the current codebase at line 80 of the original `app/courses/[courseSlug]/page.tsx`: `if (!course) notFound();`). Confirm it still works after the migration to `(learning)`.

  If either route does NOT render the light not-found page, investigate why. Common causes: `notFound()` was removed during refactor, the route group's `not-found.tsx` isn't being picked up because the route is outside the group, or the page returns null instead of calling `notFound()`.

- [ ] **Step 7:** Commit: `feat(learning): add loading, error, and not-found states with verified notFound() triggers`.

**Phase 8 exit gate:** All builds pass. Loading, error, not-found states all render light inside the learning scope. No dark flash during route transitions.

---

## Phase 9: Per-module lesson shell refactor

**Goal:** Wire each of the 10 module-specific lesson layouts into the new `LessonLayout` system. Each module has three files to refactor: `*Layout.tsx`, `*ProgressRail.tsx`, `*SourcePanel.tsx`. Pattern is identical across modules — apply the same recipe 10 times, preserving each module's progress-tracking hooks.

### Task 9.1: Refactor `intro-course-overview` module

- [ ] **Step 1:** Refactor `components/lessons/intro-course-overview/ModuleIntroLayout.tsx` — replace the existing wrapper with `<LessonLayout sidebar={...} breadcrumb={...}>{children}</LessonLayout>`. Remove the `terminal-grid` overlay div.
- [ ] **Step 2:** Refactor `components/lessons/intro-course-overview/LessonProgressRail.tsx` — preserve any existing progress logic (e.g., scroll tracking, completion state from local storage). Replace the visual structure with `<LessonSidebar>` configured with the appropriate lesson list. Use `accent="cyan"`.
- [ ] **Step 3:** Refactor `components/lessons/intro-course-overview/SourceBasisPanel.tsx` — replace with `<LessonSourceCard>` configured with the existing source data.
- [ ] **Step 4:** Update the default lesson page `app/(learning)/lessons/[lessonSlug]/page.tsx` to use `<LessonLayout>` with a dynamically-constructed `<LessonSidebar>` showing the current module's lessons (this is the "coming soon / in development" template).
- [ ] **Step 5:** `npm run lint && npm run typecheck && npm run build`. Visit `/lessons/what-is-finance-value-time-risk` — lesson renders in new light shell with sidebar showing module lessons, current lesson highlighted with `aria-current="page"`, source card on the side.
- [ ] **Step 6:** Commit: `refactor(intro-course-overview): wire to LessonLayout system`.

### Tasks 9.2–9.10: Apply the same pattern to remaining 9 module folders

For each module folder, apply the same 6-step recipe as Task 9.1. One commit per module.

| Task | Module folder | Accent | Sample lesson for verification |
|---|---|---|---|
| 9.2 | `present-value-relations` | cyan | `/lessons/present-value-cashflows-assets-npv` |
| 9.3 | `fixed-income-securities` | cyan | `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds` |
| 9.4 | `equities` | cyan | `/lessons/equity-what-does-owning-a-stock-mean` |
| 9.5 | `risk-and-return` | cyan | `/lessons/risk-return-what-they-mean` |
| 9.6 | `portfolio-theory` | cyan | `/lessons/portfolio-weights-returns` |
| 9.7 | `the-capm-and-apt` | cyan | `/lessons/capm-tangency-becomes-market-portfolio` |
| 9.8 | `capital-budgeting` | cyan | `/lessons/required-return-to-discount-rate` |
| 9.9 | `efficient-markets` | cyan | `/lessons/efficient-market-hypothesis` |
| 9.10 | `investment-foundations` | **amber** | `/lessons/if-1-1-how-an-investor-builds-a-philosophy` |

**Critical for each task:**

1. **Preserve progress-tracking hooks** — each module has a corresponding `*-progress.ts` lib (e.g., `lib/if-progress.ts`, `lib/pv-progress.ts`) consumed by the existing `*ProgressRail.tsx`. The hook (e.g., `useIFProgress`) stays; only the rendering moves into `<LessonSidebar>`. Pass `completed` per lesson from the hook's `isComplete` function.
2. **Preserve module-specific source data** — each `*SourcePanel.tsx` has hardcoded `*_SOURCE_BASIS` constants. Pass these to `<LessonSourceCard>` as props.
3. **Remove `terminal-grid` overlay** from each `*Layout.tsx` (Phase 2 neutralizes it visually, but remove the dead div for cleanliness).
4. **Match the accent** — most modules use cyan; `investment-foundations` uses amber (pass `accent="amber"` to `<LessonSidebar>` and `<LessonSourceCard>`).

**Per-task steps (same as 9.1):**

- [ ] **Step 1:** Refactor the module's `*Layout.tsx` to use `<LessonLayout>`.
- [ ] **Step 2:** Refactor the module's `*ProgressRail.tsx` to use `<LessonSidebar>` while preserving the existing progress hook.
- [ ] **Step 3:** Refactor the module's `*SourcePanel.tsx` to use `<LessonSourceCard>`.
- [ ] **Step 4:** `npm run lint && npm run typecheck && npm run build`. Visit the sample lesson for the module and verify.
- [ ] **Step 5:** Commit: `refactor({module-folder}): wire to LessonLayout system`.

**Phase 9 exit gate:** All 10 module folders refactored. Every lesson with a custom component renders in the new light shell. Progress tracking still works (completion marks persist). Source cards show correct data with STRONG accent for instructor.

**Visual checkpoint (correction §11):** Pause and report rendered screenshots after the first representative lesson conversion (after Task 9.1 completes, before doing Tasks 9.2–9.10). Capture `/lessons/what-is-finance-value-time-risk` at desktop + mobile — verify the new sidebar layout, active item highlighting, source card, and content rendering. Get user confirmation before continuing the remaining 9 module migrations (they follow the identical pattern, so this checkpoint validates the recipe).

---

## Phase 10: Lesson component exception remediation

**Goal:** Audit every one of the 47 lesson content components for hardcoded dark patterns that the shared tokens, primitives, and compatibility layer do not catch. Apply targeted per-file edits where needed. **The shared compatibility layer is not expected to handle 100% of cases — this phase is mandatory, not optional.**

This phase runs in parallel-friendly chunks: each module folder can be audited independently.

### Task 10.1: Build the audit checklist and scan all 47 components

- [ ] **Step 1: Define the audit pattern list**

Every lesson component file (`components/lessons/**/Lesson*.tsx` and similar) must be inspected for these hardcoded dark patterns:

1. **Hardcoded dark backgrounds** — `bg-ink-950`, `bg-ink-900`, `bg-#05`, `bg-[#0`, `bg-black`, `bg-[rgba(0,0,0`, inline `style={{ background: '#0` or `'rgba(0,0,0`
2. **Hardcoded text colors** — `text-black`, `text-[#0`, inline `style={{ color: '#0`
3. **Bright accent text on potential light surfaces** — `text-accent-cyan`, `text-accent-amber`, `text-[#22d3ee`, `text-[#fbbf24`, inline `style={{ color: '#22d3ee` or `'#fbbf24`. The compatibility layer does NOT touch these (they aren't slate/white utilities). In light scope, bright cyan/amber text on white fails WCAG. Replace with `var(--ops-accent-strong)` / `var(--ops-accent-warm-strong)` or restructure so the bright color is on a fill, not text.
4. **`border-white` utilities outside the compat layer's coverage** — the compat layer handles `border-white/10`, `/15`, `/20`. Look for `border-white/5`, `border-white/30`, `border-white/40`, `border-white/50`, etc. that aren't covered.
5. **`shadow-glow` and `drop-shadow` usage** — these introduce neon glow that violates the light aesthetic. In light scope they should be removed or replaced with `--ops-shadow-elevated`.
6. **SVG fill/stroke hardcoded values** — `fill="#22d3ee"`, `stroke="rgba(...)`, etc. SVG colors don't go through the compat layer. Verify each visualization's colors still work on white bg.
7. **Chart labels** — chart components (Recharts or custom SVG) often have hardcoded text colors for axis labels, legends, tooltips. These need to follow theme tokens.
8. **Table width** — tables that worked at dark-scope widths may overflow the new 720px prose column. Verify each table renders acceptably or wrap in `.lesson-wide` / `.lesson-full`.
9. **Dark interaction controls** — sliders, toggles, dropdowns built with dark-scope styles (custom track, custom thumb). These may need light-scope equivalents.

- [ ] **Step 2: Run the scan**

Use `grep` to find every match. Run each pattern as a separate search and collect results:

```
Search patterns (run as grep --include="*.tsx" -rn in components/lessons/):
- bg-ink-
- bg-\[#0
- bg-black
- bg-\[rgba\(0
- text-black
- text-\[#0
- text-accent-cyan
- text-accent-amber
- text-\[#22d3ee
- text-\[#fbbf24
- border-white/(?!10|15|20)   # regex — borders other than the covered set
- shadow-glow
- drop-shadow
- fill="#22d3ee
- fill="#fbbf24
- stroke="rgba
```

Save the scan results to `docs/superpowers/qa/2026-07-21-light-theme/exception-scan.md` — this becomes the work list for Step 3.

- [ ] **Step 3: Triage each finding**

For each finding in the scan, classify as:

- **WILL FIX** — genuinely breaks the light theme; targeted edit required
- **INTENTIONAL DARK VISUAL** — qualifies for `.ops-dark-visual` wrapping (rare, must be instructionally justified)
- **NO ACTION** — already handled by compat layer or doesn't affect light scope

Document the triage in `exception-scan.md`.

### Task 10.2: Apply targeted fixes per module folder

For each of the 10 module folders, work through the `WILL FIX` items from Task 10.1. One commit per module.

For each module:

- [ ] **Step 1:** Apply targeted fixes from the triage list. Typical fixes:
  - Replace `text-accent-cyan` (as text color) with `style={{ color: "var(--ops-accent-strong)" }}` or a `.text-accent-strong` utility class.
  - Replace `shadow-glow` with `style={{ boxShadow: "var(--ops-shadow-elevated)" }}` or remove.
  - Replace `border-white/30` (or other uncovered opacities) with `style={{ borderColor: "var(--ops-surface-border)" }}` or extend the compat layer in `globals.css` to cover the new opacity.
  - Wrap overflowing tables in `<div className="lesson-wide">` or `<div className="lesson-full">`.
  - Update SVG `fill`/`stroke` to use `var(--ops-accent)` / `var(--ops-accent-strong)` where appropriate.
  - For instructionally-justified dark widgets, wrap in `<div className="ops-dark-visual">` and document the justification in a code comment.
- [ ] **Step 2:** `npm run lint && npm run typecheck && npm run build`.
- [ ] **Step 3:** Visit at least one representative lesson in the module at desktop + mobile. Verify the fixes work and don't introduce regressions.
- [ ] **Step 4:** Commit: `fix({module-folder}): targeted light-theme exception remediation`.

Module folders (apply the same recipe to each):

| Sub-task | Module folder | Representative lesson |
|---|---|---|
| 10.2.a | `intro-course-overview` | `/lessons/what-is-finance-value-time-risk` |
| 10.2.b | `present-value-relations` | `/lessons/present-value-cashflows-assets-npv` |
| 10.2.c | `fixed-income-securities` | `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds` |
| 10.2.d | `equities` | `/lessons/equity-what-does-owning-a-stock-mean` |
| 10.2.e | `risk-and-return` | `/lessons/risk-return-what-they-mean` |
| 10.2.f | `portfolio-theory` | `/lessons/portfolio-weights-returns` |
| 10.2.g | `the-capm-and-apt` | `/lessons/capm-tangency-becomes-market-portfolio` |
| 10.2.h | `capital-budgeting` | `/lessons/required-return-to-discount-rate` |
| 10.2.i | `efficient-markets` | `/lessons/efficient-market-hypothesis` |
| 10.2.j | `investment-foundations` | `/lessons/if-1-1-how-an-investor-builds-a-philosophy` |

**Phase 10 exit gate:** `exception-scan.md` shows every finding triaged. Every `WILL FIX` item is resolved or explicitly wrapped in `.ops-dark-visual` with justification. All 47 lesson components render acceptably on light bg at desktop and mobile. `npm run lint && npm run typecheck && npm run build` all pass.

---

## Phase 11: Accessibility pass

**Goal:** Verify and harden accessibility across the learning scope.

### Task 10.1: Verify `aria-current` on all active states

- [ ] **Step 1:** Visit each lesson page in dev and verify `aria-current="page"` is set on the active item in the sidebar (inspect via DevTools or screen reader).
- [ ] **Step 2:** Visit each course detail page, scroll slowly, verify `aria-current="location"` is set on the active module in the CourseRail.
- [ ] **Step 3:** Verify mobile nav menu (open via hamburger on learning routes) marks the current route with `aria-current="page"`.
- [ ] **Step 4:** If any state is missing `aria-current`, fix it.
- [ ] **Step 5:** Commit (if fixes were needed): `fix(a11y): ensure aria-current on all active states`.

### Task 10.2: Keyboard navigation audit

- [ ] **Step 1:** Tab through the lesson sidebar — every lesson link is reachable, focus ring visible (`var(--ops-accent-strong)` 2px outline).
- [ ] **Step 2:** Tab through the CourseRail — every module link reachable, focus ring visible.
- [ ] **Step 3:** Open the mobile header menu via keyboard (focus hamburger, press Enter) — menu opens, focus moves into panel, Escape closes, focus returns to hamburger.
- [ ] **Step 4:** Verify the mobile module selector on course detail is keyboard accessible. **If it is currently a horizontally scrollable chip strip that requires precision scrolling, replace it with a `<details>`-based menu or button-triggered dropdown** per spec correction §3 #11. Each item must be individually focusable.
- [ ] **Step 5:** Commit (if changes were needed): `fix(a11y): keyboard-accessible mobile module selector`.

### Task 10.3: Focus visibility and reduced motion

- [ ] **Step 1:** Verify `:focus-visible` produces a visible 2px outline in `var(--ops-accent-strong)` on every interactive element (links, buttons, sidebar items, rail items, mobile menu toggle).
- [ ] **Step 2:** Toggle `prefers-reduced-motion: reduce` in DevTools. Verify: Reveal animations still complete (instantly), loading bar is static (no animation), sidebar `scrollIntoView` uses `behavior: 'auto'`, no parallax or scroll-jank.
- [ ] **Step 3:** Commit (if changes were needed): `fix(a11y): focus visibility and reduced motion compliance`.

**Phase 10 exit gate:** All accessibility checks pass. Keyboard users can navigate every learning route without using a mouse. Screen readers announce active states correctly.

---

## Phase 12: QA matrix and final verification

**Goal:** Complete the rendered QA matrix from spec §13. Implementation is not complete until every cell passes.

### Task 11.1: Course pages QA

- [ ] **Step 1:** Visit `/courses` at desktop (1440×900), tablet (768×1024), mobile (375×812). Verify: light page bg, simplified hero, sequence section, white card bodies with dark visual tops, hover elevation. Capture screenshots to `docs/superpowers/qa/2026-07-21-light-theme/courses-{desktop,tablet,mobile}.png`.
- [ ] **Step 2:** Visit `/courses/finance-foundations` at all three breakpoints. Verify: soft cyan tint in hero, primary text numerals on stats, sticky CourseRail with active highlighting, sentence-case module labels, white closing CTA. Capture screenshots.
- [ ] **Step 3:** Visit `/courses/investment-foundations` at all three breakpoints. Verify same structure with amber STRONG accents. Capture screenshots.
- [ ] **Step 4:** No code changes in this task unless a regression is found.

### Task 11.2: Lesson pages QA — one per module

For each lesson in the spec §13.2 table, verify at desktop + tablet + mobile + reduced motion:

- [ ] **Step 1:** `/lessons/what-is-finance-value-time-risk` — formula rendering (KaTeX), charts, interactions.
- [ ] **Step 2:** `/lessons/present-value-cashflows-assets-npv` — cash-flow diagrams, tables (`.lesson-wide` wraps if needed).
- [ ] **Step 3:** `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds` — yield curves, scan-line interactions.
- [ ] **Step 4:** `/lessons/equity-what-does-owning-a-stock-mean` — long-form reading, definition cards.
- [ ] **Step 5:** `/lessons/risk-return-what-they-mean` — Feedback states (correct/incorrect/info).
- [ ] **Step 6:** `/lessons/portfolio-weights-returns` — tables, allocation interactions.
- [ ] **Step 7:** `/lessons/capm-tangency-becomes-market-portfolio` — SML charts, formula blocks.
- [ ] **Step 8:** `/lessons/required-return-to-discount-rate` — sensitivity tables, scenario chips.
- [ ] **Step 9:** `/lessons/efficient-market-hypothesis` — decision journal, feedback states.
- [ ] **Step 10:** `/lessons/if-1-1-how-an-investor-builds-a-philosophy` — warm amber accent, long-form reading, PhilosophyDraftBuilder interaction.

For each: verify sidebar (sticky, active highlighted, scrollIntoView works, `aria-current="page"` set), source panel (STRONG accent for instructor, sentence-case labels), prev/next navigation (keyboard accessible). Capture one representative screenshot per lesson at desktop.

- [ ] **Step 11:** If any lesson has visual regressions, file as targeted fixes. Common issues to watch: hardcoded `text-accent-cyan` in lesson content (compatibility layer doesn't catch this — fix per-file), tables overflowing prose column (wrap with `.lesson-wide`), interactive widgets with hardcoded dark backgrounds (consider `.ops-dark-visual` wrapper if instructionally justified, otherwise restyle).

### Task 11.3: Cross-cutting states QA

- [ ] **Step 1:** Loading state — throttle network in DevTools to "Slow 3G", navigate between learning routes. Verify: light loading bar appears, no dark flash, light bg visible throughout.
- [ ] **Step 2:** Error state — temporarily add `throw new Error("test")` to a lesson component in dev, visit it. Verify: light error UI, generic message (no `error.message`), Try again button works. Run `npm run build && npm start` and visit the broken lesson in production mode — verify `error.message` is NOT visible.
- [ ] **Step 3:** Not-found state — visit `/lessons/not-a-real-lesson`. Verify: light 404, link back to `/courses` works.
- [ ] **Step 4:** Header — visit each learning route, scroll. Header stays light throughout. Verify mobile hamburger opens a light panel with keyboard access.
- [ ] **Step 5:** Footer — visit each learning route. Footer is white with dark text.
- [ ] **Step 6:** Route transitions — navigate `/courses` → `/courses/finance-foundations` → `/lessons/present-value-cashflows-assets-npv` → back. No dark flash anywhere.
- [ ] **Step 7:** Overscroll — on mobile viewport (DevTools), pull down at the top of any learning route. Verify light bg visible, not dark body.

### Task 11.4: `.ops-dark-visual` escape hatch audit

- [ ] **Step 1:** Search the codebase for `.ops-dark-visual` usage. If none, document the decision in `docs/superpowers/qa/2026-07-21-light-theme/dark-visual-audit.md` explaining why no lesson currently qualifies.
- [ ] **Step 2:** If any lesson uses `.ops-dark-visual`, verify per spec §13.4: container renders dark with correct text colors, surrounding content remains light, no token leakage outside the container.

### Task 11.5: Final verification gates

- [ ] **Step 1:** `npm run lint` — passes with no warnings.
- [ ] **Step 2:** `npm run typecheck` — passes with no errors.
- [ ] **Step 3:** `npm run build` — production build succeeds.
- [ ] **Step 4:** Run browser DevTools accessibility checker (or `axe-core` if available) against `/courses`, `/courses/finance-foundations`, and at least three lesson routes. Document any failures.
- [ ] **Step 5:** Capture final screenshots to `docs/superpowers/qa/2026-07-21-light-theme/` per spec §13.6.

### Task 11.6: WCAG contrast audit

- [ ] **Step 1:** For each text/background combination in spec §13.7, run automated contrast check (browser DevTools color picker + contrast ratio, or `axe-core`).
- [ ] **Step 2:** Document results in `docs/superpowers/qa/2026-07-21-light-theme/contrast-audit.md` — pass/fail per combination.
- [ ] **Step 3:** Remediate any failures. Common issues: `var(--ops-text-tertiary)` `#6E6E73` on `var(--ops-accent-soft)` (verify ≥ 4.5:1), disabled controls (verify ≥ 3:1), small text on tinted surfaces.
- [ ] **Step 4:** Re-run contrast check on any remediated surfaces.
- [ ] **Step 5:** Commit audit docs: `docs(qa): add light theme contrast audit and screenshots`.

**Phase 12 exit gate:** All QA cells pass. All verification gates pass. WCAG audit complete with no unresolved failures. Screenshots captured. Implementation ready for user review.

**Final visual checkpoint (correction §11):** Report screenshots from Phase 12's QA matrix to the user. Cover: all three course pages, one representative lesson per module folder (10 screenshots), loading/error/not-found states, mobile layouts for at least 3 routes. This is the final review gate before declaring implementation complete.

---

## Final: Implementation handoff

After Phase 12 completes:

1. **Commits are already made** per the per-task commit cadence (correction §1: plan approval authorized local commits during execution).
2. **Do not push, deploy, or open a PR** — those require separate user approval.
3. Present the final state to the user: list of all commits made during execution (via `git log --oneline main..HEAD`), summary of files changed, link to QA screenshots, link to contrast audit, link to exception-scan triage.
4. Await user decision on push / deploy / PR.

---

## Spec coverage check

This plan covers every section of the spec:

| Spec section | Covered by |
|---|---|
| §1 Goal | Plan goal |
| §2 Scope | Global Constraints + File Structure |
| §3.1 Route group boundary | Phase 1 |
| §3.2 SiteShell component | Task 1.1 |
| §3.3 Theme scope CSS | Tasks 1.1, 1.6, 2.1, 2.2 |
| §3.4 Three restyle layers | Phases 2, 3, 5 |
| §4 Palette (tokens) | Task 2.1 |
| §4.2 Accent split (bright vs strong) | Task 2.1 + applied throughout Phases 6, 7 |
| §4.3 Semantic feedback tokens | Task 2.1 + applied in Task 5.3 |
| §4.4 WCAG contrast | Task 11.6 |
| §5 Typography | Task 2.4 |
| §5.2 Mono retirement | Tasks 2.4, 5.2, 6.1, 7.1, 7.4 |
| §5.3 Spacing scale | Task 2.5 |
| §6 Primitive restyle mapping | Tasks 2.3, 2.4, 5.1, 5.3 |
| §7.1 Course map | Phase 6 |
| §7.2 Course detail | Phase 7 |
| §7.3 Course flow SVG light variant | Task 7.1 |
| §7.4 Bounded dark thumbnail | Task 6.2 (explicit no-change to visual top) |
| §7.5 LessonLayout | Task 8.4 |
| §7.6 Lesson width model | Task 2.5 (utilities) + Task 8.4 (shell) |
| §7.7 Lesson sidebar | Task 8.2 |
| §7.8 CourseRail sticky | Task 7.3 |
| §7.9 Loading / error / not-found | Task 8.5 |
| §7.10 Mobile nav keyboard | Task 10.2 |
| §8 Compat layer | Phase 3 |
| §8.3 Component hooks | Task 3.1 |
| §8.4 .ops-dark-visual | Task 3.3, audited in Task 11.4 |
| §9 Header/Footer tokens | Phase 4 |
| §10 Accessibility | Phase 10 |
| §11 File inventory | File Structure section |
| §12 Acceptance criteria | All phases + Phase 11 |
| §13 QA matrix | Phase 12 |
| (New) 47-lesson audit | Phase 10 |

No spec section is left without an implementing task.

---

## Self-review notes

- **Placeholder scan:** No "TBD", "TODO", or "implement later" markers. Every task references specific spec sections that contain the actual code.
- **Type consistency:** `LessonNavItem` props (Task 8.1) match what `LessonSidebar` passes (Task 8.2): `href`, `number`, `title`, `status`, `completed`, `active`. The `SidebarLesson` type in Task 8.2 matches.
- **Source order matters:** Phase 3 (compat layer) requires Task 3.1 (class hooks) to be done first. Phase 5 (primitives) requires Phases 2 and 3. Phase 9 requires Phase 8 (shell components exist). All task dependencies are reflected in phase ordering.
- **Scope check:** Single-plan-sized. 13 phases (0–12), ~50 tasks, each independently verifiable via `lint` + `typecheck` + `build` + visual QA. No further decomposition needed.
- **Phase dependencies:** Phase 0 (env check) gates everything. Phase 1 atomic migration must complete before any other code. Phase 3 (compat layer) requires Task 3.1 (class hooks) first. Phase 5 requires Phases 2 and 3. Phase 8 (shell components) must exist before Phase 9 (per-module wiring). Phase 10 (exception remediation) requires Phases 2, 3, 5, and 9 to be done so the compat layer is fully active when auditing lesson files. Phases 11 (accessibility) and 12 (QA) come last.
- **Atomicity guarantees:** Task 1.2 commits the route-group migration as a single commit. Task 3.3 verifies selector correctness against a fixture before the compat layer is enabled in production routes.
