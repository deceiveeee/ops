# Lesson Premium Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply an Apple-premium typographic and restraint refresh to lesson pages — Fraunces at headline scale, Inter for body, refined buttons, disciplined palette, generous spacing — piloted on one lesson and then rolled out.

**Architecture:** Token-driven. Type/spacing/color/button tokens live in `app/globals.css`. New typography primitives (`LessonH1`, `LessonH2`, `Subsection`, `BodyLead`, `BodyText`) live in a new `components/lessons/typography.tsx`. Shared lesson primitives (`SectionHeading`, `DefinitionCard`, `ConceptTag`, `Feedback`, `TryItTag`, `Panel`) are refactored in place at `components/lessons/intro-course-overview/shared.tsx`. The pilot lesson (`/lessons/present-value-cashflows-assets-npv`) is redesigned end-to-end with these primitives; user sign-off gates the rollout.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript 5, Tailwind 3.4, Motion, KaTeX. No test framework — verification is `lint` + `typecheck` + `build` + visual QA via Playwright capture + `zai-mcp-server_analyze_image`.

**Authoritative reference:** `docs/superpowers/specs/2026-07-26-lesson-premium-typography-design.md`. **All exact token values, primitive signatures, and structural decisions live in the spec.** This plan sequences them into verifiable tasks.

## Global Constraints

- **Starting state:** `feature/learning-light-theme` branch, HEAD `6787196` (the spec commit). Working tree has uncommitted remediation WIP — Task 0.1 commits it before any other work begins.
- **Build verification after every task:** `npm run lint && npm run typecheck && npm run build` — all three must pass before any commit. No exceptions.
- **Visual verification at pilot gate:** Playwright capture at 1440×900 + 390×844, inspect via `zai-mcp-server_analyze_image` (this model cannot read images directly).
- **Dev server:** `http://localhost:3001/` (canonically chosen in Phase 0 of the migration plan; port 3000 retired earlier due to corrupted `.next` cache).
- **Theme scope:** All changes apply to `.ops-theme-light` (learning route group). Dark scope (homepage, studio, filings) is untouched unless explicitly noted.
- **Font weights:** Do not modify `app/layout.tsx` font loading. Fraunces (400/500/600/700 + italic), Inter (400/500/600/700), IBM Plex Mono (400/500/600) remain loaded. Weight trimming is a future optimization, out of scope here.
- **No new dependencies.** Use existing Tailwind, Motion, KaTeX, Playwright.
- **Commits:** One commit per task, conventional commit style (`feat:`, `refactor:`, `fix:`, `docs:`). Approval of this plan authorizes local commits during execution. Do not push, deploy, or open a PR without separate user approval.
- **Sign-off gates:** Task 2.3 (pilot sign-off) and Task 3.3 (final QA) require explicit user approval before proceeding.

## File Structure

**Files created:**
- `components/lessons/typography.tsx` — new typography primitives (`LessonH1`, `LessonH2`, `Subsection`, `BodyLead`, `BodyText`)

**Files modified:**
- `app/globals.css` — token updates (type scale, spacing, color, button variants)
- `components/ui/Button.tsx` — variant className refactor (no behavior changes)
- `components/lessons/intro-course-overview/shared.tsx` — refactor `SectionHeading`, `DefinitionCard`, `ConceptTag`, `Feedback`, `TryItTag`, `Panel`
- `components/lessons/present-value-relations/PVHero.tsx` — pilot application
- `components/lessons/present-value-relations/Lesson1.tsx` — pilot application (body content)

**Files not modified (propagation trust):**
- All other `components/lessons/**` files — they consume shared primitives and tokens. Improvements propagate automatically. Phase 3 audits any hardcoded patterns that bypass the system.

---

## Phase 0: Prerequisites

**Goal:** Commit the existing remediation WIP so the plan executes against a clean tree.

### Task 0.1: Commit existing remediation WIP

**Files:**
- Modify (commit only): all currently-modified files in the working tree (`app/globals.css`, `components/courses/*`, `components/lessons/*`, `components/marketing/*`, `components/ui/Button.tsx`, `app/(learning)/courses/[courseSlug]/page.tsx`, `tsconfig.tsbuildinfo`, `opencode.jsonc`)

**Interfaces:** None. This task only preserves existing work.

- [ ] **Step 1: Verify build is clean before committing**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: all three pass. If any fail, fix the failure before committing — do not commit broken code.

- [ ] **Step 2: Review what will be committed**

```bash
git status
git diff --stat
```

Confirm the staged files are the remediation WIP only (lesson components, marketing, Button, globals, course detail page). No unintentional files.

- [ ] **Step 3: Commit the WIP**

```bash
git add -A
git commit -m "fix(lessons): readability remediation WIP

- SVG label readability floor, dark SVG fill fixes
- Disabled-button styling, formula verification
- Reading-width cap on prose, course-page mobile overflow fix
- Snapshot WIP before premium-typography refresh begins"
```

- [ ] **Step 4: Verify clean tree**

```bash
git status
```

Expected: "nothing to commit, working tree clean".

**Phase 0 exit gate:** Working tree clean. Build still passes.

---

## Phase 1: Token & primitive system

**Goal:** Land the new token system and refactored primitives. No lesson uses them yet — they exist as available tools. After Phase 1, `npm run build` passes and existing lessons look identical (tokens defined but not yet applied).

### Task 1.1: Update type, spacing, and color tokens in `globals.css`

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS variables `--space-section`, `--space-subsection`, `--space-block`, `--space-element`, `--width-prose`, `--width-wide`, `--width-lesson`. Updated values for existing tokens `--ops-text-primary`, `--ops-text-secondary`, `--ops-text-tertiary`. New tokens `--ops-success-strong`, `--ops-warning-strong`, `--ops-error-strong`.

- [ ] **Step 1: Update the existing `:root` color tokens to spec values**

Find the existing light-scope block (search for `--ops-text-primary: #111214`). Update text values to match spec §6.1:

```css
/* Light scope — Apple-premium text colors */
--ops-text-primary: #1d1d1f;     /* was #111214 */
--ops-text-secondary: #424245;   /* was #2E3137 */
--ops-text-tertiary: #6e6e73;    /* was #555A61 */
```

Leave `--ops-bg`, `--ops-surface`, `--ops-surface-2`, `--ops-surface-border`, `--ops-accent-strong`, `--ops-accent-soft`, `--ops-accent-warm-strong`, `--ops-accent-warm-soft` unchanged — they already match spec §6.1.

- [ ] **Step 2: Add new semantic color tokens**

In the same `:root` (or `.ops-theme-light`) block, after the existing accent tokens, add:

```css
--ops-success-strong: #1F6F43;
--ops-warning-strong: #8A5A00;
--ops-error-strong:   #B0181A;
```

- [ ] **Step 3: Add spacing scale tokens**

In the same block, add:

```css
/* Vertical rhythm — spec §5.1 */
--space-section: 96px;
--space-subsection: 56px;
--space-block: 32px;
--space-element: 16px;

/* Mobile overrides via existing breakpoint pattern */
@media (max-width: 768px) {
  --space-section: 64px;
  --space-subsection: 40px;
  --space-block: 24px;
}
```

If the file already uses a different mobile-override pattern, follow it instead of duplicating the media query.

- [ ] **Step 4: Add width tokens**

```css
/* Content widths — spec §5.2 */
--width-prose: 680px;
--width-wide: 960px;
--width-lesson: 1120px;
```

- [ ] **Step 5: Add type-scale size tokens**

```css
/* Type scale — spec §4 */
/* Display (Fraunces, used rarely) */
--type-d-hero-size: 60px;
--type-d-hero-lh: 1.05;
--type-d-hero-track: -0.02em;
--type-d-section-size: 38px;
--type-d-section-lh: 1.1;
--type-d-section-track: -0.015em;

/* Sans (Inter, everything else) */
--type-subsection-size: 22px;
--type-subsection-lh: 1.25;
--type-subsection-track: -0.01em;
--type-card-title-size: 17px;
--type-card-title-lh: 1.3;
--type-card-title-track: -0.005em;
--type-body-lead-size: 20px;
--type-body-lead-lh: 1.6;
--type-body-size: 18px;
--type-body-lh: 1.65;
--type-definition-size: 19px;
--type-definition-lh: 1.65;
--type-small-size: 15px;
--type-small-lh: 1.55;
--type-eyebrow-size: 13px;
--type-eyebrow-lh: 1.4;
--type-eyebrow-track: 0.02em;
--type-micro-size: 12px;
--type-micro-lh: 1.4;
--type-micro-track: 0.04em;
```

- [ ] **Step 6: Add mobile type-scale overrides**

```css
@media (max-width: 768px) {
  :root {
    --type-d-hero-size: 40px;
    --type-d-section-size: 28px;
  }
}
```

If the file already scopes type tokens under `.ops-theme-light` rather than `:root`, follow that pattern — the goal is one canonical source for each value.

- [ ] **Step 7: Build and verify**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: all three pass. No visual change yet — tokens are defined but unused.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css
git commit -m "feat(tokens): premium type/spacing/color scale per spec §4-6"
```

### Task 1.2: Refactor `Button` variants

**Files:**
- Modify: `app/globals.css` (add scoped button CSS)
- Modify: `components/ui/Button.tsx` (update variant classNames)

**Interfaces:**
- Produces: scoped CSS classes `.ops-btn.variant-primary`, `.ops-btn.variant-secondary`, `.ops-btn.variant-outline`, `.ops-btn.variant-ghost` with the spec §6.3 styling. The Button component continues to export the same default export with the same props API.

- [ ] **Step 1: Add scoped button variant CSS to `globals.css`**

Append at the end of the file (after the compat layer if present):

```css
/* ─────────────────────────────────────────────────────────────
   Button variants — spec §6.3
   Pill shape retained. Glow removed. Solid teal primary.
   ───────────────────────────────────────────────────────────── */
.ops-theme-light .ops-btn.variant-primary {
  background: var(--ops-accent-strong);
  color: #ffffff;
  border: none;
  box-shadow: none;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.ops-theme-light .ops-btn.variant-primary:hover {
  background: color-mix(in srgb, var(--ops-accent-strong) 92%, #000);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.12);
}

.ops-theme-light .ops-btn.variant-secondary {
  background: transparent;
  color: var(--ops-accent-strong);
  border: none;
  padding: 8px 0;
  font-weight: 500;
  text-decoration: none;
  transition: text-decoration 0.15s ease;
}
.ops-theme-light .ops-btn.variant-secondary::after {
  content: " →";
  display: inline-block;
  transition: transform 0.15s ease;
}
.ops-theme-light .ops-btn.variant-secondary:hover {
  text-decoration: underline;
}
.ops-theme-light .ops-btn.variant-secondary:hover::after {
  transform: translateX(2px);
}

.ops-theme-light .ops-btn.variant-outline {
  background: transparent;
  color: var(--ops-text-primary);
  border: 1px solid rgba(0,0,0,0.15);
  transition: background 0.2s ease;
}
.ops-theme-light .ops-btn.variant-outline:hover {
  background: var(--ops-surface-2);
}

.ops-theme-light .ops-btn.variant-ghost {
  background: transparent;
  color: var(--ops-text-secondary);
  border: none;
  padding: 8px 12px;
  transition: background 0.2s ease, color 0.2s ease;
}
.ops-theme-light .ops-btn.variant-ghost:hover {
  background: var(--ops-surface-2);
  color: var(--ops-text-primary);
}
```

The dark scope (homepage, studio, filings) is **not** overridden — the existing `primary`/`ghost`/`outline` dark styling stays.

- [ ] **Step 2: Refactor `components/ui/Button.tsx` variant map**

Find the `variants` declaration (around line 7-12). Replace with:

```tsx
const variants: Record<Variant, string> = {
  primary:
    "ops-btn variant-primary bg-accent-cyan text-ink-950 hover:bg-accent-cyan/90 border border-accent-cyan/40 shadow-glow",
  secondary:
    "ops-btn variant-secondary text-slate-200 hover:text-white",
  ghost:
    "ops-btn variant-ghost text-slate-200 hover:text-white hover:bg-white/5 border border-transparent",
  outline:
    "ops-btn variant-outline border border-white/15 text-slate-100 hover:border-white/30 hover:bg-white/5",
};
```

Note the legacy dark-scope utility classes stay (they apply in dark routes); the new scoped CSS overrides them inside `.ops-theme-light`. This is the same pattern the migration plan uses for primitive restyling.

- [ ] **Step 3: Extend the `Variant` type to include `secondary`**

```tsx
type Variant = "primary" | "secondary" | "ghost" | "outline";
```

- [ ] **Step 4: Build and verify**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 5: Visual sanity check (no behavior change expected yet)**

In `npm run dev` on port 3001, visit:
- `/` (homepage) — primary CTAs still show cyan with glow (dark scope unchanged)
- `/courses` — primary CTA in header still cyan (no `variant-secondary` instances yet on this route)

No visual regressions expected. The new variant CSS doesn't apply until a Button explicitly uses `variant-secondary`, and the existing primary styling still works.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css components/ui/Button.tsx
git commit -m "refactor(button): premium variants per spec §6.3

- Add scoped .ops-btn.variant-* CSS for light scope
- Extend Variant type with 'secondary' (text + arrow)
- Dark scope unchanged"
```

### Task 1.3: Create typography primitives

**Files:**
- Create: `components/lessons/typography.tsx`

**Interfaces:**
- Produces: named exports `LessonH1`, `LessonH2`, `Subsection`, `BodyLead`, `BodyText` with the signatures defined below.

- [ ] **Step 1: Create `components/lessons/typography.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { MathText } from "@/components/ui/MathText";

/**
 * Lesson opener H1 — Fraunces, used exactly once per lesson.
 * Spec §4.1 token: d-hero (60px / 1.05 / -0.02em / 600).
 */
export function LessonH1({
  children,
  eyebrow,
  index,
  className,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  index?: string | number;
  className?: string;
}) {
  return (
    <header className={className}>
      {(eyebrow || index !== undefined) && (
        <div className="ops-eyebrow flex items-center gap-3" style={{ fontSize: "var(--type-eyebrow-size)", fontWeight: 600, letterSpacing: "var(--type-eyebrow-track)" }}>
          {index !== undefined && (
            <span className="tabular-nums" style={{ color: "var(--ops-accent-strong)" }}>
              {index}
            </span>
          )}
          {index !== undefined && eyebrow && <span className="h-px w-8" style={{ background: "var(--ops-surface-border)" }} />}
          {eyebrow && <span style={{ color: "var(--ops-text-tertiary)" }}>{eyebrow}</span>}
        </div>
      )}
      <h1
        className="font-display mt-4"
        style={{
          fontSize: "var(--type-d-hero-size)",
          lineHeight: "var(--type-d-hero-lh)",
          letterSpacing: "var(--type-d-hero-track)",
          fontWeight: 600,
          color: "var(--ops-text-primary)",
        }}
      >
        <MathText>{children}</MathText>
      </h1>
    </header>
  );
}

/**
 * Major section H2 — Fraunces, at most three per lesson page.
 * Spec §4.1 token: d-section (38px / 1.1 / -0.015em / 600).
 */
export function LessonH2({
  children,
  index,
  emphasis = false,
  className,
}: {
  children: React.ReactNode;
  index?: string | number;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {index !== undefined && (
        <div
          className="tabular-nums mb-3"
          style={{
            fontSize: "var(--type-eyebrow-size)",
            fontWeight: 600,
            letterSpacing: "var(--type-eyebrow-track)",
            color: emphasis ? "var(--ops-accent-strong)" : "var(--ops-text-tertiary)",
          }}
        >
          {index}
        </div>
      )}
      <h2
        className="font-display"
        style={{
          fontSize: "var(--type-d-section-size)",
          lineHeight: "var(--type-d-section-lh)",
          letterSpacing: "var(--type-d-section-track)",
          fontWeight: 600,
          color: "var(--ops-text-primary)",
        }}
      >
        <MathText>{children}</MathText>
      </h2>
    </div>
  );
}

/**
 * Subsection H3 — Inter sans (contrasts Fraunces H2 above it).
 * Spec §4.2 token: t-subsection (22px / 1.25 / -0.01em / 600).
 */
export function Subsection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn("font-sans", className)}
      style={{
        fontSize: "var(--type-subsection-size)",
        lineHeight: "var(--type-subsection-lh)",
        letterSpacing: "var(--type-subsection-track)",
        fontWeight: 600,
        color: "var(--ops-text-primary)",
      }}
    >
      {children}
    </h3>
  );
}

/**
 * Lead paragraph — first paragraph after any head.
 * Spec §4.2 token: body-lead (20px / 1.6 / 0 / 400).
 */
export function BodyLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("font-sans", className)}
      style={{
        fontSize: "var(--type-body-lead-size)",
        lineHeight: "var(--type-body-lead-lh)",
        color: "var(--ops-text-secondary)",
        maxWidth: "var(--width-prose)",
      }}
    >
      {children}
    </p>
  );
}

/**
 * Default body text. Width-capped to --width-prose.
 * Spec §4.2 token: body (18px / 1.65 / 0 / 400).
 */
export function BodyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("font-sans", className)}
      style={{
        fontSize: "var(--type-body-size)",
        lineHeight: "var(--type-body-lh)",
        color: "var(--ops-text-secondary)",
        maxWidth: "var(--width-prose)",
      }}
    >
      {children}
    </p>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/lessons/typography.tsx
git commit -m "feat(typography): LessonH1/H2/Subsection/BodyLead/BodyText primitives"
```

### Task 1.4: Refactor shared lesson primitives

**Files:**
- Modify: `components/lessons/intro-course-overview/shared.tsx`

**Interfaces:**
- Produces: refactored `SectionHeading` (adds `emphasis` prop), `DefinitionCard` (uses spec colors), `ConceptTag` (drops purple, adds strong variants), `Feedback` (semantic tokens), `TryItTag` (sentence case), `Panel` (always token-driven, `tone` prop retired).
- **Breaking change:** `Panel` no longer accepts `tone="dark" | "light"`. All call sites must be inspected during Phase 3 audit. The pilot lesson (Phase 2) is updated in Task 2.2.

- [ ] **Step 1: Refactor `SectionHeading` (add `emphasis` prop, use spec tokens)**

Replace the existing `SectionHeading` function (around line 30-51) with:

```tsx
export function SectionHeading({
  index,
  eyebrow,
  title,
  emphasis = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="ops-eyebrow flex items-center gap-3" style={{ fontSize: "var(--type-eyebrow-size)", fontWeight: 600, letterSpacing: "var(--type-eyebrow-track)" }}>
        <span className="tabular-nums" style={{ color: emphasis ? "var(--ops-accent-strong)" : "var(--ops-text-tertiary)" }}>{index}</span>
        <span className="h-px w-8" style={{ background: "var(--ops-surface-border)" }} />
        <span style={{ color: "var(--ops-text-tertiary)" }}>{eyebrow}</span>
      </div>
      <h2
        className="font-display mt-4"
        style={{
          fontSize: "var(--type-d-section-size)",
          lineHeight: "var(--type-d-section-lh)",
          letterSpacing: "var(--type-d-section-track)",
          fontWeight: 600,
          color: "var(--ops-text-primary)",
        }}
      >
        <MathText>{title}</MathText>
      </h2>
    </div>
  );
}
```

- [ ] **Step 2: Refactor `Panel` (retire `tone` prop, always token-driven)**

Replace the existing `Panel` function (around line 53-73) with:

```tsx
export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel p-6 sm:p-7", className)}>
      {children}
    </div>
  );
}
```

The `tone` prop is removed. `glass-panel` already uses tokens (light surface in `.ops-theme-light`, dark surface elsewhere) — no other change needed.

- [ ] **Step 3: Refactor `DefinitionCard` (use spec colors and tokens)**

Replace the existing `DefinitionCard` function (around line 76-97) with:

```tsx
export function DefinitionCard({
  term,
  children,
  className,
}: {
  term?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("ops-definition-card p-6 sm:p-7", className)}
      style={{
        background: "var(--ops-surface)",
        border: "1px solid var(--ops-surface-border)",
        borderRadius: "16px",
      }}
    >
      {term && (
        <div
          style={{
            fontSize: "var(--type-eyebrow-size)",
            fontWeight: 600,
            letterSpacing: "var(--type-eyebrow-track)",
            color: "var(--ops-accent-strong)",
          }}
        >
          Definition · <MathText>{term}</MathText>
        </div>
      )}
      <div
        className="mt-2.5"
        style={{
          fontSize: "var(--type-definition-size)",
          lineHeight: "var(--type-definition-lh)",
          color: "var(--ops-text-secondary)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Refactor `TryItTag` (sentence case, soft accent)**

Replace the existing `TryItTag` function (around line 115-127) with:

```tsx
export function TryItTag({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", className)}
      style={{
        background: "var(--ops-accent-soft)",
        border: "1px solid color-mix(in srgb, var(--ops-accent-strong) 25%, transparent)",
        fontSize: "var(--type-eyebrow-size)",
        fontWeight: 600,
        letterSpacing: "var(--type-eyebrow-track)",
        color: "var(--ops-accent-strong)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ops-accent-strong)" }} aria-hidden />
      Try it
    </span>
  );
}
```

- [ ] **Step 5: Refactor `ConceptTag` (drop purple, use semantic + strong variants)**

Replace the existing `ConceptTag` function (around line 140-168) with:

```tsx
const CONCEPT_STYLES: Record<ConceptKey, { bg: string; border: string; color: string; icon: string }> = {
  value:    { bg: "var(--ops-accent-soft)",           border: "var(--ops-accent-strong)",       color: "var(--ops-accent-strong)",       icon: "•" },
  time:     { bg: "var(--ops-accent-warm-soft)",      border: "var(--ops-accent-warm-strong)",  color: "var(--ops-accent-warm-strong)",  icon: "•" },
  risk:     { bg: "color-mix(in srgb, var(--ops-error-strong) 8%, transparent)",   border: "var(--ops-error-strong)",   color: "var(--ops-error-strong)",   icon: "⚠" },
  market:   { bg: "var(--ops-surface-2)",             border: "var(--ops-surface-border)",      color: "var(--ops-text-primary)",        icon: "◆" },
  cashflow: { bg: "color-mix(in srgb, var(--ops-success-strong) 8%, transparent)", border: "var(--ops-success-strong)", color: "var(--ops-success-strong)", icon: "+" },
};

export function ConceptTag({
  concept = "value",
  children,
  className,
}: {
  concept?: ConceptKey;
  children: React.ReactNode;
  className?: string;
}) {
  const s = CONCEPT_STYLES[concept];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1", CONCEPT_TEXT[concept], className)}
      style={{
        background: s.bg,
        border: `1px solid color-mix(in srgb, ${s.border} 25%, transparent)`,
        fontSize: "var(--type-eyebrow-size)",
        fontWeight: 600,
        letterSpacing: "var(--type-eyebrow-track)",
        color: s.color,
      }}
    >
      <span aria-hidden>{s.icon}</span>
      {children}
    </span>
  );
}
```

Purple (`accent-purple`) is removed entirely. `market` switches to a neutral monochrome treatment (icon + weight, not hue).

- [ ] **Step 6: Refactor `Feedback` (semantic tokens, `feedback` class hook)**

Replace the existing `Feedback` function (around line 170-206) with:

```tsx
export function Feedback({
  status,
  children,
}: {
  status: "correct" | "incorrect" | "info";
  children: React.ReactNode;
}) {
  const map = {
    correct:   { label: "Correct",   token: "var(--ops-success-strong)" },
    incorrect: { label: "Try again", token: "var(--ops-error-strong)" },
    info:      { label: "Note",      token: "var(--ops-text-tertiary)" },
  } as const;
  const m = map[status];
  return (
    <div
      className="feedback mt-4 rounded-xl px-4 py-3.5"
      style={{
        background: `color-mix(in srgb, ${m.token} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${m.token} 25%, transparent)`,
        color: m.token,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center rounded-full border border-current px-2 py-0.5"
          style={{
            fontSize: "var(--type-eyebrow-size)",
            fontWeight: 600,
            letterSpacing: "var(--type-eyebrow-track)",
          }}
        >
          {status === "correct" && <span className="mr-1" aria-hidden>✓</span>}
          {m.label}
        </span>
      </div>
      <p
        className="mt-2.5"
        style={{
          fontSize: "var(--type-body-size)",
          lineHeight: "var(--type-body-lh)",
          color: "var(--ops-text-secondary)",
        }}
      >
        {children}
      </p>
    </div>
  );
}
```

The `feedback` class hook is included so the compat layer's `:not(.feedback)` selector continues to exclude these.

- [ ] **Step 7: Build and verify**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: `typecheck` reports zero errors. The `tone="dark"|"light"` prop removal may surface type errors in callers — fix each by removing the `tone` prop from call sites (audit call sites with `rg 'tone="(dark|light)"' components/` if needed).

- [ ] **Step 8: Visual sanity check**

In `npm run dev` on port 3001, visit `/lessons/present-value-cashflows-assets-npv`. Confirm the lesson still renders. Visual style will have shifted (primitives now use spec tokens) but layout should be intact. Note any obvious breakage for fixing in Phase 2.

- [ ] **Step 9: Commit**

```bash
git add components/lessons/intro-course-overview/shared.tsx
git commit -m "refactor(primitives): shared lessons primitives per spec §7

- SectionHeading: emphasis prop, Fraunces at d-section scale
- Panel: tone prop retired, always glass-panel
- DefinitionCard: spec colors and tokens
- TryItTag: sentence case, soft accent
- ConceptTag: drop purple, add semantic + strong variants
- Feedback: semantic tokens, feedback class hook"
```

**Phase 1 exit gate:** All builds pass. Tokens and primitives exist and match the spec. Lessons may look slightly different (primitives already consume new tokens) but no lesson has been deliberately redesigned yet.

---

## Phase 2: Pilot lesson

**Goal:** Redesign `/lessons/present-value-cashflows-assets-npv` end-to-end using the new system. Capture before/after. **User must sign off before Phase 3 begins.**

### Task 2.1: Apply new system to `PVHero`

**Files:**
- Modify: `components/lessons/present-value-relations/PVHero.tsx`

**Interfaces:**
- Consumes: `<LessonH1>`, `<BodyLead>` from `@/components/lessons/typography`; refined `<Button>` variants from Task 1.2.
- Produces: PVHero with Fraunces H1 + spec eyebrow + lead paragraph + refined buttons.

- [ ] **Step 1: Capture BEFORE screenshot for comparison**

```bash
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/present-value-cashflows-assets-npv "docs/superpowers/qa/2026-07-26-premium-typography/pilot-before-desktop.png" 1440 900 "pilot-before-desktop"
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/present-value-cashflows-assets-npv "docs/superpowers/qa/2026-07-26-premium-typography/pilot-before-mobile.png" 390 844 "pilot-before-mobile"
```

- [ ] **Step 2: Update `PVHero` imports**

At the top of `components/lessons/present-value-relations/PVHero.tsx`, add to existing imports:

```tsx
import { LessonH1, BodyLead } from "@/components/lessons/typography";
```

- [ ] **Step 3: Replace the H1 and subheading block**

Find the existing `<motion.h1 ...>` block (around line 68-83) and the `<motion.p>` subheading. Replace the entire block from `<motion.h1>` through the closing `</motion.p>` with:

```tsx
<LessonH1
  index={index}
  eyebrow={eyebrow}
  className="mt-7"
>
  {heading}
</LessonH1>
<BodyLead className="mt-6">{subheading}</BodyLead>
```

If the existing animation is desired, wrap each in `<motion.div initial={...} animate={...} transition={...}>` preserving the motion config.

- [ ] **Step 4: Update the bullet list to use spec tokens**

Find the bullets `<motion.ul>` block. Update the className to use spec sizing:

```tsx
<motion.ul
  initial={reduce ? false : { opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
  className="mt-7 grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2"
>
  {bullets.map((b) => (
    <li
      key={b}
      className="flex items-start gap-2.5"
      style={{
        fontSize: "var(--type-small-size)",
        lineHeight: "var(--type-small-lh)",
        color: "var(--ops-text-secondary)",
      }}
    >
      <span
        className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ background: "var(--ops-accent-strong)" }}
        aria-hidden
      />
      <MathText>{b}</MathText>
    </li>
  ))}
</motion.ul>
```

- [ ] **Step 5: Update the artifacts block to drop font-display and use spec tokens**

Find the `<motion.div>` artifacts block (around line 110-135). The inner `<span className="font-display text-lg font-medium tracking-tight text-white">` is exactly the timid-serif anti-pattern. Replace with:

```tsx
<span
  style={{
    fontSize: "var(--type-card-title-size)",
    lineHeight: "var(--type-card-title-lh)",
    fontWeight: 600,
    color: "var(--ops-text-primary)",
  }}
>
  {a.label}
</span>
```

Also remove the `toneGlow` and `toneBorder` / `toneText` maps at the top of the component — they use bright accent fills that violate the disciplined palette rule. Replace with a single subtle accent treatment, or remove the `artifacts` prop entirely if the pilot lesson doesn't use it.

- [ ] **Step 6: Update the button row to use refined variants**

Find the `<div className="mt-10 flex flex-wrap items-center gap-3">` block (around line 139-148). Replace the secondary button (currently `variant="outline"`) with the new secondary variant:

```tsx
<div className="mt-10 flex flex-wrap items-center gap-3">
  <Button href={primaryHref ?? "#lesson-content"} size="lg">
    {primaryLabel}
  </Button>
  {secondaryLabel && (
    <Button href={secondaryHref} variant="secondary" size="lg">
      {secondaryLabel}
    </Button>
  )}
</div>
```

- [ ] **Step 7: Build and verify**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add components/lessons/present-value-relations/PVHero.tsx
git commit -m "refactor(pv-hero): apply premium typography and refined buttons"
```

### Task 2.2: Apply new system to `Lesson1.tsx` body content

**Files:**
- Modify: `components/lessons/present-value-relations/Lesson1.tsx`

**Interfaces:**
- Consumes: `<LessonH2>`, `<Subsection>`, `<BodyLead>`, `<BodyText>` from `@/components/lessons/typography`. Existing refactored shared primitives from Task 1.4.

- [ ] **Step 1: Update imports**

At the top of `components/lessons/present-value-relations/Lesson1.tsx`, add:

```tsx
import { LessonH2, Subsection, BodyLead, BodyText } from "@/components/lessons/typography";
```

- [ ] **Step 2: Audit the file for inline heading patterns**

Run a search to find every heading-sized text in the file:

```bash
rg -n "text-3xl|text-4xl|text-2xl|font-display|ops-section-title|ops-display" components/lessons/present-value-relations/Lesson1.tsx
```

For each match:
- If it's a major section head (currently `text-3xl` / `text-4xl` / `ops-section-title`), replace with `<LessonH2>` (with `index` prop if it had a number).
- If it's a subsection head (`text-2xl` typically), replace with `<Subsection>`.
- If it uses `font-display` at any size, remove `font-display` and use the appropriate primitive.

- [ ] **Step 3: Audit for inline body text patterns**

```bash
rg -n "text-slate-[1234]00|text-\[1[5-9]px|text-lg|ops-body" components/lessons/present-value-relations/Lesson1.tsx
```

For each `<p>` body match:
- The first paragraph after a head → `<BodyLead>`
- Subsequent paragraphs → `<BodyText>`

The compat layer in `globals.css` already maps `text-slate-*` to spec tokens, so this is mostly about applying the new primitives and width caps rather than rewriting every paragraph. Prioritize heading replacements and lead-paragraph identification; remaining body text can stay (it auto-adapts).

- [ ] **Step 4: Apply `--space-section` between major sections**

Find the major section wrappers (`<section>` or `<Reveal>` blocks containing a heading). Update their top margin to `var(--space-section)`:

```tsx
style={{ marginTop: "var(--space-section)" }}
```

(or apply via a new utility class `.mt-section` added to `globals.css` if not already present from the migration plan).

- [ ] **Step 5: Build and verify**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add components/lessons/present-value-relations/Lesson1.tsx
git commit -m "refactor(pv-lesson1): apply premium primitives and spacing

- Replace inline headings with LessonH2 / Subsection
- Identify body leads vs body text
- Apply --space-section between major sections"
```

### Task 2.3: Capture AFTER screenshots and request user sign-off

**Files:**
- Create: `docs/superpowers/qa/2026-07-26-premium-typography/pilot-after-desktop.png`
- Create: `docs/superpowers/qa/2026-07-26-premium-typography/pilot-after-mobile.png`
- Create: `docs/superpowers/qa/2026-07-26-premium-typography/pilot-signoff.md`

**Interfaces:** None — this is a verification and sign-off task.

- [ ] **Step 1: Capture AFTER screenshots**

```bash
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/present-value-cashflows-assets-npv "docs/superpowers/qa/2026-07-26-premium-typography/pilot-after-desktop.png" 1440 900 "pilot-after-desktop"
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/present-value-cashflows-assets-npv "docs/superpowers/qa/2026-07-26-premium-typography/pilot-after-mobile.png" 390 844 "pilot-after-mobile"
```

If the desktop PNG exceeds 5 MB (long page at 2× scale), also capture a JPEG. Write a small one-off script in `scripts/capture-pilot-jpg.mjs` (delete it after use, following the Phase 0 doc's pattern):

```js
// scripts/capture-pilot-jpg.mjs
import { chromium } from 'playwright';
import { statSync } from 'node:fs';

const url = 'http://localhost:3001/lessons/present-value-cashflows-assets-npv';
const outPath = 'docs/superpowers/qa/2026-07-26-premium-typography/pilot-after-desktop.jpg';

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}
  await page.waitForTimeout(2500);
  await page.screenshot({ path: outPath, fullPage: true, type: 'jpeg', quality: 80 });
  console.log(JSON.stringify({ ok: true, outPath, bytes: statSync(outPath).size }));
} finally {
  await browser.close();
}
```

Run it with `node scripts/capture-pilot-jpg.mjs`, then `Remove-Item scripts/capture-pilot-jpg.mjs`.

- [ ] **Step 2: Inspect BEFORE and AFTER via analyze_image MCP**

Call `zai-mcp-server_analyze_image` against the AFTER screenshot(s) with this prompt:

> "This is a lesson page after an Apple-premium typography refresh. Verify: (1) Is there a large Fraunces serif headline at the top (lesson opener)? (2) Are section headings also Fraunces serif at slightly smaller size? (3) Are body paragraphs readable with generous line-height and width-capped (not edge-to-edge)? (4) Do buttons look solid and refined (no neon glow)? (5) Is the overall feel calm, premium, Apple-like? (6) Are there any visible regressions — missing content, broken layouts, contrast problems, overlapping elements, raw code?"

Then call it against the BEFORE screenshot with:

> "This is the same lesson page before the refresh. Compare: how does the typography and density differ from the AFTER screenshot? Specifically describe headline treatment, button styling, body text width and line-height."

- [ ] **Step 3: Write the sign-off document**

Create `docs/superpowers/qa/2026-07-26-premium-typography/pilot-signoff.md` with:

- BEFORE / AFTER screenshot paths
- Summary of changes made (typography, spacing, buttons, primitives)
- analyze_image findings for both
- Open issues (any visible regressions or unresolved problems)
- Explicit question for the user: "Does this feel premium? Approve to roll out to remaining 45 lessons?"

- [ ] **Step 4: Commit pilot artifacts**

```bash
git add docs/superpowers/qa/2026-07-26-premium-typography/
git commit -m "docs(pilot): premium typography pilot sign-off artifacts"
```

- [ ] **Step 5: Stop and request user sign-off**

**This is a hard gate.** Do not proceed to Phase 3 until the user explicitly approves.

Present the user with:
- The sign-off document path
- A short summary of what changed
- Direct question: "Approve the pilot to roll out?"

If user rejects or requests changes:
- Iterate on Phase 2 tasks (2.1, 2.2) only — do not touch other lessons
- Re-capture AFTER screenshots
- Re-request sign-off

**Phase 2 exit gate:** User explicitly approves the pilot feel.

---

## Phase 3: Rollout (post-sign-off)

**Goal:** Apply the system to remaining 45 lessons, audit hardcoded patterns, spot-check 5 representative lessons, ship.

### Task 3.1: Audit hardcoded `font-display` and inline size patterns

**Files:**
- Modify: any lesson file with hardcoded patterns (determined by audit)

**Interfaces:** None.

- [ ] **Step 1: Enumerate all `font-display` call sites**

```bash
rg -n "font-display" components/lessons/ > docs/superpowers/qa/2026-07-26-premium-typography/font-display-audit.txt
```

- [ ] **Step 2: For each call site, replace with the appropriate primitive**

Decision tree:
- `font-display` at 28-32px+ in a section head → `<LessonH2>` or `<Subsection>` depending on level
- `font-display` at 15-22px on a card or list-item title → `t-card-title` styling (Inter 17/600)
- `font-display` at any size in a context that already has a heading above it → just remove `font-display`, keep the size

The 16 existing call sites (identified in the spec) are the primary targets.

- [ ] **Step 3: Build and verify**

```bash
npm run lint && npm run typecheck && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(lessons): remove timid font-display usage across lessons

Replace font-display at non-headline sizes with Inter primitives.
Reserves Fraunces for LessonH1 and LessonH2 only (spec §4.1 constraint)."
```

### Task 3.2: Spot-check 5 representative lessons

**Files:**
- Create: screenshots under `docs/superpowers/qa/2026-07-26-premium-typography/spotcheck/`

**Interfaces:** None.

- [ ] **Step 1: Capture screenshots of 5 representative lessons**

The 5 lessons (chosen to cover the breadth of lesson types):
1. `/lessons/what-is-finance-value-time-risk` — Module 1 intro, rich SVG diagram
2. `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds` — fixed income, formula-heavy
3. `/lessons/portfolio-risk-covariance-correlation` — portfolio theory, math
4. `/lessons/capm-estimating-beta` — was the worst SVG-label offender pre-remediation
5. `/lessons/if-1-1-how-an-investor-builds-a-philosophy` — investment foundations, different course

```bash
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/what-is-finance-value-time-risk "docs/superpowers/qa/2026-07-26-premium-typography/spotcheck/01-what-is-finance.png" 1440 900
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/fixed-income-bond-markets-cash-flows-discount-bonds "docs/superpowers/qa/2026-07-26-premium-typography/spotcheck/02-bond-markets.png" 1440 900
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/portfolio-risk-covariance-correlation "docs/superpowers/qa/2026-07-26-premium-typography/spotcheck/03-portfolio-risk.png" 1440 900
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/capm-estimating-beta "docs/superpowers/qa/2026-07-26-premium-typography/spotcheck/04-capm-beta.png" 1440 900
node scripts/visual-qa-capture.mjs http://localhost:3001/lessons/if-1-1-how-an-investor-builds-a-philosophy "docs/superpowers/qa/2026-07-26-premium-typography/spotcheck/05-if-philosophy.png" 1440 900
```

- [ ] **Step 2: Inspect each via analyze_image MCP**

For each screenshot, ask:

> "Verify: (1) No timid serif at small sizes. (2) Body text readable, width-capped. (3) Buttons solid, no glow. (4) No contrast problems. (5) No layout breakage, missing content, or raw code. (6) Discipline: max 2 accent hues visible at once. List any defects."

- [ ] **Step 3: Fix any defects**

For each defect found, file a small targeted fix. Re-capture the screenshot. Do not move on with known defects.

- [ ] **Step 4: Commit spot-check artifacts and any fixes**

```bash
git add -A
git commit -m "docs(spotcheck): 5 representative lesson screenshots post-rollout"
```

### Task 3.3: Final QA and report

**Files:**
- Create: `docs/superpowers/qa/2026-07-26-premium-typography/final-qa.md`

**Interfaces:** None.

- [ ] **Step 1: Run the existing route-wide lesson checker (if available)**

```bash
# The remediation report references lesson-check.js, but it may have been a
# session-only script. Check first; if absent, skip this step and rely on
# Task 3.2's manual spot-check.
if (Test-Path 'scripts/lesson-check.js') {
  node scripts/lesson-check.js 2>&1 | Tee-Object -FilePath 'docs/superpowers/qa/2026-07-26-premium-typography/lesson-check.txt'
} else {
  "lesson-check.js not present — skipping automated route-wide check" | Out-File -FilePath 'docs/superpowers/qa/2026-07-26-premium-typography/lesson-check.txt'
}
```

If the checker is unavailable, the Task 3.2 spot-check + visual inspection is the verification path. No regression in automated metrics can be claimed without the checker; document this honestly in the report.

- [ ] **Step 2: Run final build**

```bash
npm run lint && npm run typecheck && npm run build
```

Expected: all three pass cleanly.

- [ ] **Step 3: Write final QA report**

Create `docs/superpowers/qa/2026-07-26-premium-typography/final-qa.md`:

- Summary of all changes (tokens, primitives, pilot, rollout)
- Screenshot evidence (pilot before/after + 5 spot-checks)
- Checker results
- Build verification result
- Any remaining caveats or follow-ups

- [ ] **Step 4: Commit final report**

```bash
git add docs/superpowers/qa/2026-07-26-premium-typography/final-qa.md
git commit -m "docs(qa): final QA report for premium typography refresh"
```

- [ ] **Step 5: Present to user for final approval**

Present the final QA report. Note any remaining follow-ups. Ask if the user wants to:
- Approve and merge / push (requires explicit user approval per Global Constraints)
- Continue iterating on a specific lesson
- Move on to course map / course detail refresh (next phase per the spec's out-of-scope note)

**Phase 3 exit gate:** Final QA report written and accepted by user.

---

## Plan summary

| Phase | Tasks | Outcome |
|---|---|---|
| 0 | 1 (commit WIP) | Clean tree |
| 1 | 4 (tokens, button, typography, shared primitives) | System in place, no lesson redesigned yet |
| 2 | 3 (PVHero, Lesson1 body, sign-off) | Pilot lesson redesigned, user approves feel |
| 3 | 3 (audit, spot-check, final QA) | All 46 lessons refreshed, QA evidence captured |

**Sign-off gates:** Task 2.3 (pilot feel), Task 3.3 (final QA).

**Estimated scope:** ~10 commits across 4 phases. Phase 2 is the longest (Lesson1.tsx is 802 lines and audit-driven). Phase 3 is mostly automated via the existing checker.
