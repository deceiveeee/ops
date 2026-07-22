# OPS Learning Pages — Unified Light Theme

**Status:** Approved (Sections 1–3 with revisions)
**Date:** 2026-07-21
**Scope:** Course map, course detail, lesson pages, shared learning shell, loading/error/not-found states, mobile navigation.

---

## 1. Goal

Convert the internal learning experience from a visually inconsistent mix (dark homepage + partly-light course pages + dark dashboard-style lesson pages) into a **unified, premium, editorial light theme**.

The homepage remains dark and cinematic. Once a user enters the learning environment, the entire experience — header, footer, sidebar, content, loading and error states — stays light and consistent. Readability for long-form study is the primary success metric.

This is **not a color swap**. Surfaces, borders, sidebar treatment, cards, text contrast, spacing, and typography are all redesigned so the light theme feels intentionally designed.

---

## 2. Scope

### In scope
- `/courses` (course map)
- `/courses/[courseSlug]` (course detail, including module overview anchored sections)
- `/lessons/[lessonSlug]` (lesson page — default template and all 47 custom lesson components)
- Shared learning shell components: `SiteHeader`, `SiteFooter`, `SiteShell`, `LessonLayout`, `LessonSidebar`, `LessonSourceCard`, `CourseRail`
- Loading, error, and not-found states for the learning area
- Mobile navigation in learning scope

### Out of scope (remains dark)
- `/` (homepage — cinematic dark marketing experience)
- `/studio` (portfolio studio)
- `/filings` (filing reader)

### Touched but not redesigned
- Root `app/layout.tsx` (reduced to html/body/fonts)
- `globals.css` (theme tokens, scoped overrides)
- Shared primitives in `components/ui/` and `components/lessons/intro-course-overview/shared.tsx`
- The 10 per-module `*Layout.tsx`, `*ProgressRail.tsx`, `*SourcePanel.tsx` files (refactored to use shared light sub-components)

---

## 3. Architecture

### 3.1 Route group boundary

All application routes must live inside a `SiteShell`. The root layout no longer renders `SiteHeader` or `SiteFooter`; each route group owns its own shell.

```
app/
├── layout.tsx                        ← html/body/fonts only (no header/footer)
├── (marketing)/
│   ├── layout.tsx                    ← SiteShell theme="dark"
│   └── page.tsx                      ← / (homepage)
├── (learning)/
│   ├── layout.tsx                    ← SiteShell theme="light" (.ops-theme-light)
│   ├── loading.tsx                   ← light loading state
│   ├── error.tsx                     ← "use client" — uses reset()
│   ├── not-found.tsx                 ← light 404
│   ├── courses/
│   │   ├── page.tsx                  ← /courses
│   │   └── [courseSlug]/page.tsx     ← /courses/{slug}
│   └── lessons/
│       └── [lessonSlug]/page.tsx     ← /lessons/{slug}
├── (app)/
│   ├── layout.tsx                    ← SiteShell theme="dark"
│   ├── studio/page.tsx               ← /studio
│   └── filings/page.tsx              ← /filings
```

Route groups in parens are URL-irrelevant — all existing URLs are preserved.

### 3.2 SiteShell component

Server component. Renders header, main, footer inside a themed wrapper.

```tsx
// components/layout/SiteShell.tsx
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteShell({
  theme,
  children,
}: {
  theme: "dark" | "light";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        theme === "light" ? "ops-theme-light site-shell" : "site-shell site-shell-dark"
      }
    >
      <SiteHeader />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
```

### 3.3 Theme scope CSS

```css
.site-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
.site-shell-dark {
  background: #05070d;
  color: #F5F5F7;
  color-scheme: dark;
}
.ops-theme-light.site-shell {
  background: var(--ops-bg);
  color: var(--ops-text-primary);
  color-scheme: light;
}

/* Main fills available space (so short loading/error/not-found states
   still cover the viewport) and prevents wide lesson content from
   breaking the grid layout. */
.site-main {
  flex: 1;
  min-width: 0;
}

/* Route-aware fallback on BOTH html and body — server-rendered via :has()
   Prevents dark body showing through during overscroll, loading, or
   route transitions. Body cannot detect descendant scope directly, so
   the html-level :has() rule cascades the body background too. */
html { background: #05070d; color-scheme: dark; }
html:has(.ops-theme-light) { background: #F5F5F7; color-scheme: light; }
html:has(.ops-theme-light) body { background: #F5F5F7; }
body { background: #05070d; min-height: 100dvh; }
/* html always defaults to dark; the :has() rule overrides both html and body
   when a learning route group renders the .ops-theme-light wrapper. */
```

**Portal-mounted elements** (mobile nav panel, dialogs, sheets) inherit theme because they are rendered as children of `SiteHeader` / `SiteShell` inside the `.ops-theme-light` DOM subtree. Next.js portals via Radix or similar must specify `container` props that resolve inside the shell — verify per component during implementation.

### 3.4 Three restole layers

1. **Semantic primitives** (primary): `.glass-panel`, `.ops-body`, `.ops-display`, `.ops-section-title`, `.ops-interactive-title`, `.ops-definition`, `.ops-definition-card`, `.ops-muted`, `.ops-caption`, `.ops-eyebrow`, `.ops-interactive-frame` — all refactored to use CSS variables that resolve per scope. This is the default and preferred path.

2. **Lesson-content compatibility layer** (audited legacy): inside `.ops-theme-light .lesson-content` only, a narrow set of hardcoded Tailwind utilities are overridden so the 47 existing lesson files convert without per-file edits. See §8.

3. **`.ops-dark-visual` escape hatch**: for rare intentionally-dark instructional visuals. Implemented primarily by resetting semantic tokens inside the container; legacy utility restorations are explicit selectors ordered after the compatibility layer. See §8.4.

---

## 4. Palette

### 4.1 Core tokens

```css
:root {
  /* Dark (default — homepage, studio, filings) */
  --ops-bg: #05070d;
  --ops-surface: rgba(255, 255, 255, 0.03);
  --ops-surface-2: rgba(255, 255, 255, 0.02);
  --ops-surface-border: rgba(255, 255, 255, 0.10);
  --ops-text-primary: #F5F5F7;
  --ops-text-secondary: #D2D2D7;
  --ops-text-tertiary: #86868B;
  --ops-shadow-elevated: 0 1px 0 0 rgba(255,255,255,0.04) inset,
                         0 30px 60px -30px rgba(0,0,0,0.8);
  --ops-shadow-resting: none;
}

.ops-theme-light {
  /* Light (learning environment) */
  --ops-bg: #F5F5F7;
  --ops-surface: #FFFFFF;
  --ops-surface-2: #F2F2F4;
  --ops-surface-border: rgba(0, 0, 0, 0.08);
  --ops-text-primary: #1D1D1F;
  --ops-text-secondary: #424245;
  --ops-text-tertiary: #6E6E73;
  --ops-shadow-elevated: 0 1px 2px rgba(0,0,0,0.04),
                         0 8px 24px -12px rgba(0,0,0,0.10);
  --ops-shadow-resting: none;
}
```

Shadows are reserved for elevated / hover / interactive states. Ordinary cards use **surface contrast + subtle border** with `--ops-shadow-resting: none`.

### 4.2 Accent split — bright vs strong

Bright accents are reserved for **fills and large graphics**. Strong accents are used for **text, links, labels, and borders on light surfaces**.

```css
:root {
  --ops-accent: #22d3ee;                  /* bright cyan — fills, graphics */
  --ops-accent-strong: #22d3ee;           /* dark scope: bright = strong */
  --ops-accent-soft: rgba(34, 211, 238, 0.10);
  --ops-on-accent: #062027;               /* text on bright cyan fills */

  --ops-accent-warm: #fbbf24;             /* bright amber — fills, graphics */
  --ops-accent-warm-strong: #fbbf24;      /* dark scope: bright = strong */
  --ops-accent-warm-soft: rgba(251, 191, 36, 0.12);
}

.ops-theme-light {
  --ops-accent: #22d3ee;                  /* unchanged — fills/graphics */
  --ops-accent-strong: #007A8A;           /* accessible text/border cyan */
  --ops-accent-soft: rgba(34, 211, 238, 0.10);
  --ops-on-accent: #062027;

  --ops-accent-warm: #fbbf24;             /* unchanged — fills/graphics */
  --ops-accent-warm-strong: #8A5A00;      /* accessible text/border amber */
  --ops-accent-warm-soft: rgba(251, 191, 36, 0.12);
}
```

### 4.3 Semantic feedback tokens

Defined now so `Feedback`, quiz components, success/error banners, and form validation never introduce isolated colors.

```css
:root {
  /* Dark scope — bright variants are accessible on dark */
  --ops-success: #34d399;
  --ops-success-strong: #34d399;
  --ops-success-soft: rgba(52, 211, 153, 0.12);

  --ops-warning: #fbbf24;
  --ops-warning-strong: #fbbf24;
  --ops-warning-soft: rgba(251, 191, 36, 0.12);

  --ops-error: #f87171;
  --ops-error-strong: #f87171;
  --ops-error-soft: rgba(248, 113, 113, 0.12);

  --ops-info: #22d3ee;
  --ops-info-strong: #22d3ee;
  --ops-info-soft: rgba(34, 211, 238, 0.12);
}

.ops-theme-light {
  --ops-success: #34d399;                 /* fill / graphic */
  --ops-success-strong: #166534;          /* accessible text/border */
  --ops-success-soft: rgba(22, 101, 52, 0.10);

  --ops-warning: #fbbf24;
  --ops-warning-strong: #8A5A00;
  --ops-warning-soft: rgba(138, 90, 0, 0.10);

  --ops-error: #dc2626;                   /* slightly deeper for fills */
  --ops-error-strong: #b91c1c;            /* accessible text/border */
  --ops-error-soft: rgba(185, 28, 28, 0.10);

  --ops-info: #22d3ee;
  --ops-info-strong: #007A8A;
  --ops-info-soft: rgba(0, 122, 138, 0.10);
}
```

### 4.4 WCAG contrast verification (required before merge)

Implementation must verify the following against `#FFFFFF` and `#F5F5F7`:

| Token | On `#FFFFFF` | On `#F5F5F7` | Required |
|---|---|---|---|
| `--ops-accent-strong` `#007A8A` | ≥ 4.57:1 ✓ | ≥ 4.20:1 ✓ | AA for normal text |
| `--ops-accent-warm-strong` `#8A5A00` | ≥ 4.85:1 ✓ | ≥ 4.45:1 ✓ | AA for normal text |
| `--ops-success-strong` `#166534` | ≥ 7.47:1 ✓ | ≥ 6.85:1 ✓ | AAA |
| `--ops-error-strong` `#b91c1c` | ≥ 4.50:1 ✓ | ≥ 4.13:1 ✓ | AA |
| `--ops-text-primary` `#1D1D1F` | ≥ 15.0:1 ✓ | ≥ 13.78:1 ✓ | AAA |
| `--ops-text-secondary` `#424245` | ≥ 9.06:1 ✓ | ≥ 8.32:1 ✓ | AAA |
| `--ops-text-tertiary` `#6E6E73` | ≥ 5.24:1 ✓ | ≥ 4.81:1 ✓ | AA |
| `--ops-text-tertiary` on `--ops-accent-soft` bg | verify | verify | AA |

Disabled controls: minimum 3:1 against their container; verify per component.

Bright `#22D3EE` and `#FBBF24` are **never used as text on white surfaces**. They appear only as fills, large graphics, dots, non-textual indicators, or on dark surfaces where contrast allows.

---

## 5. Typography

### 5.1 Reading comfort

| Class | Use | Size | Line-height | Weight | Color |
|---|---|---|---|---|---|
| `.ops-display` | Lesson hero headline | `clamp(34px, 4.5vw, 52px)` | 1.10 | 600 Fraunces | `--ops-text-primary` |
| `.ops-section-title` | Section heading | `clamp(28px, 3vw, 36px)` | 1.15 | 600 Fraunces | `--ops-text-primary` |
| `.ops-interactive-title` | Card title | 16–18px | 1.30 | 600 sans | `--ops-text-primary` |
| `.ops-body` | Default paragraph | **18px min** | **1.65** | 400 | `--ops-text-secondary` |
| `.ops-body-strong` | Emphasized paragraph | 18px | 1.65 | 500 | `--ops-text-primary` |
| `.ops-definition` | Definition body | **19px min** | **1.65** | 400 | `--ops-text-primary` |
| `.ops-muted` | Captions, helper | 14–15px | 1.65 | 400 | `--ops-text-tertiary` |
| `.ops-caption` | Small meta labels | 13px | 1.45 | 500 | `--ops-text-tertiary` |
| `.ops-eyebrow` | Section orientation | 13px | 1.45 | 600 | `--ops-text-tertiary` |

Body line-height is **1.65** for body and definition copy (not 1.75 universal).

### 5.2 Mono / uppercase retirement

The mono uppercase vocabulary (`font-mono uppercase tracking-[0.18em]`) is retired inside `.ops-theme-light`. `.ops-caption` and `.ops-eyebrow` become **sans, sentence case, light weight, low tracking**.

Visible metadata uses **sentence case** throughout: "Course 1", "Module 1", "Curriculum", "Learning objectives", "Source basis". Numerals stay tabular where they appear in numeric contexts.

### 5.3 Three-tier spacing scale

Utility classes used inside lesson content for predictable rhythm:

```css
.mt-section { margin-top: 80px; }    /* major section break */
.mt-subsection { margin-top: 48px; } /* subsection */
.mt-block { margin-top: 28px; }      /* related content block */
```

Current `mt-14` (~56px) between lesson sections becomes `mt-section` (80px) at major `SectionHeading` boundaries, `mt-subsection` (48px) for subsections.

---

## 6. Primitive restyle mapping

All primitives use CSS variables that resolve per scope. Default behavior (dark) is unchanged.

| Primitive | Light variant |
|---|---|
| `.glass-panel` | `background: var(--ops-surface); border: 1px solid var(--ops-surface-border); border-radius: 16px; box-shadow: var(--ops-shadow-resting);` |
| `.terminal-grid` | Inside `.ops-theme-light`: `background-image: none;` plus `::before` / `::after` pseudo-elements cleared. **Not `display: none`** — decorative nodes become inert but remain in the DOM. |
| `.ops-definition-card` | `border: 1px solid var(--ops-accent-strong); border-opacity: 0.30; background: var(--ops-accent-soft);` — works on white surface |
| `.ops-interactive-frame` | Neutral frame by default: white surface, neutral border, no cyan top edge. Cyan reserved for `.is-active`, `.is-selected`, `:focus-visible`, or explicit `.is-emphasis` modifier (refinement §2.5 #5). |
| `.ops-caption`, `.ops-eyebrow` | Sans, sentence case, see §5 |
| `Panel` component | Uses `.glass-panel` (which is light in scope). Default tone renamed from `"dark"` to `"default"`. Existing `tone="light"` variant removed or kept as alias. |
| `DefinitionCard` | Uses `.ops-definition-card` — light automatically |
| `InteractiveFrame` | Uses `.ops-interactive-frame` — neutral by default, `.is-active` for emphasis |
| `SectionHeading` | Index numeral is **neutral** by default (`--ops-text-tertiary`). Cyan appears on the numeral only when the section is **explicitly marked important** (e.g., the current step in a multi-step interaction, or via an `is-emphasis` prop). No automatic scroll-tracked cyan — that would defeat the "neutral by default" rule. |
| `ConceptTag` | Sans, sentence case, soft bg (`var(--ops-accent-soft)`), strong text color |
| `TryItTag` | Sans, sentence case, soft cyan bg, strong text |
| `Feedback` | Uses semantic feedback tokens (success / warning / error / info). Border + soft bg + strong text. Explicit selectors — not affected by compatibility layer (see §8.3). |
| `Reveal` | Motion only — unchanged |
| `Button` primary | `bg-accent-cyan text-ink-950` — works on light. Retained. |
| `Button` outline | In light scope: `border-black/15 text-[#1D1D1F] hover:border-black/30 hover:bg-black/5` |
| `Button` ghost | In light scope: `text-[#424245] hover:bg-black/5` |
| `Badge` | Sans, sentence case. Component-scoped, not affected by compatibility layer. |
| `SectionLabel` | Sans, sentence case, tertiary text |
| `CourseCard` visual top | RETAINED dark SVG on per-card basis — qualifies as instructional imagery, not chrome (see §7.4) |
| `CourseCard` body | White surface, neutral border, no default shadow, hover elevates |

---

## 7. Page structure

### 7.1 Course map (`/courses`)

Single sequence representation (refinement §3 #5): the 3-step path is **removed from the hero** and retained only in the larger sequence section below the cards. The hero becomes simpler.

```
[LearningShell]                                bg: --ops-bg
│
├── HERO                                       bg: --ops-bg (no decoration)
│   ├── Eyebrow: "Courses"                     tertiary sans sentence case
│   ├── H1: "Two courses. One investigation    primary text, course-map-hero-title
│   │         toolkit."                        (single concept, no path steps)
│   └── Lead paragraph                         secondary text, course-lead
│
├── COURSE CARDS (2-col grid)
│   └── CourseCard
│       ├── Visual top (260-280px)             RETAINED dark instructional visual
│       │                                      (cyan/amber SVG, course-specific)
│       ├── Card body                          bg: --ops-surface (white)
│       │                                      border: --ops-surface-border
│       │                                      NO default shadow (refinement §2 #4)
│       │   ├── "Course 1" label               accent STRONG (small text)
│       │   ├── Card title                     primary text
│       │   ├── Subtitle                       accent STRONG (small text)
│       │   ├── Description                    --ops-text-secondary
│       │   ├── "What you'll learn" label      tertiary text sentence case
│       │   ├── Outcome list                   accent SOFT dot, primary text
│       │   ├── Stats row                      primary text numerals (NO bright accent
│       │   │                                  on text — refinement §3 #6), tertiary labels
│       │   └── CTA                            primary text + STRONG arrow on hover
│       └── Hover state                        --ops-shadow-elevated + -translate-y-1
│
├── RECOMMENDED SEQUENCE (3-col, single representation)
│   ├── Section heading                        primary text
│   └── SequenceStep
│       ├── Top border                         neutral (--ops-surface-border)
│       ├── "Step N"                           accent STRONG (small text)
│       ├── Title                              --ops-text-primary, large
│       ├── Note                               --ops-text-secondary
│       └── "Open →" link                      primary text, hover STRONG
│
└── STUDIO CTA                                 primary cyan button on light bg
```

### 7.2 Course detail (`/courses/[courseSlug]`)

```
[LearningShell]                                bg: --ops-bg
│
├── COURSE HERO (softly tinted, not dark)
│   ├── Radial wash bg                         very low alpha (~3-4%) of course color
│   │                                          over --ops-bg. NOT hp-atmosphere.
│   ├── Breadcrumb: "← All courses"            tertiary text, hover primary
│   ├── Two-column grid (1.1fr | 1fr)
│   │   ├── Left
│   │   │   ├── "Course 1" label               accent STRONG, sentence case
│   │   │   ├── H1                              primary text, course-hero-title
│   │   │   ├── Subtitle (lead)                secondary text, course-lead
│   │   │   ├── Description                    secondary text, hp-body
│   │   │   └── CTA row                        primary cyan Button + neutral link
│   │   └── Right (with left border neutral)
│   │       ├── Stats (3-col)
│   │       │   ├── Numerals                   primary text (--ops-text-primary)
│   │       │   │                              NOT bright accent (refinement §3 #6)
│   │       │   └── Labels                     tertiary text, sentence case
│   │       └── CourseFlowVisual SVG           neutral connector line at low opacity,
│   │                                          accent dots (non-textual, OK bright),
│   │                                          step text in --ops-text-secondary
│
├── COURSE OVERVIEW (3-col)
│   ├── bg: --ops-surface-2 (#F2F2F4)          soft contrast band
│   ├── Column titles                          primary text
│   └── Bullet list                            accent STRONG dot, secondary text
│
├── CURRICULUM
│   ├── bg: --ops-bg (back to page bg)
│   ├── Section heading row
│   │   ├── "Curriculum" eyebrow                accent STRONG, sentence case
│   │   └── "8 modules. 42 lessons."           primary text, large
│   ├── Mobile module selector (keyboard accessible)
│   │   └── <select>-based or button-triggered menu, NOT scroll-dependent
│   │                                          (refinement §3 #11)
│   ├── Two-column: CourseRail (260px sticky) + content
│   │   ├── CourseRail (see §7.6)
│   │   └── ModuleSection[]
│   │       ├── Module header
│   │       │   ├── "Module 1" label            accent STRONG, sentence case
│   │       │   ├── Module title               primary text, large
│   │       │   ├── Description                secondary text
│   │       │   ├── Stats                      tertiary text, sentence case
│   │       │   └── Large faint numeral        very low alpha primary color (8%)
│   │       └── LessonRow[]                    already light — minor polish
│
└── CLOSING CTA (light elevated panel)
    ├── bg: var(--ops-surface) (white) card on --ops-bg page bg
    ├── border: --ops-surface-border
    ├── border-radius: 24px
    ├── H2                                    primary text
    ├── Lead                                  secondary text
    └── Two buttons                            primary cyan + outline neutral
```

### 7.3 Course flow SVG — light variant

The current SVG uses dark-themed colors (`fill: #D2D2D7` for text, accent stroke). Light variant:

- Connector line: `stroke: var(--ops-text-tertiary); stroke-opacity: 0.25;`
- Step dots: `fill: var(--ops-accent); fill-opacity: 0.8;` (bright OK as non-textual)
- Last dot: `fill: var(--ops-accent); fill-opacity: 1;`
- Step text: `fill: var(--ops-text-secondary);`

### 7.4 CourseCard visual identity — bounded dark thumbnail

The course-card visual top is the **only** retained dark element in the course ecosystem. It is a **bounded visual thumbnail** — a fixed-aspect instructional image (260–280px tall, full card width) inset within a white card frame. It functions like a course photograph or product image, not like a page section.

**Strict scope of retained dark surfaces:**

| Surface | Dark or Light | Notes |
|---|---|---|
| Course card visual top | Dark (bounded thumbnail) | Only retained dark surface in the course ecosystem |
| Course detail hero | **Light** | Softly tinted with course color, not dark |
| Course overview section | **Light** | `--ops-surface-2` band |
| Curriculum section | **Light** | `--ops-bg` page background |
| Lesson shell (header, breadcrumb, sidebar, content, footer) | **Light** | No exceptions |
| Lesson body content | **Light** | Unless explicitly wrapped in `.ops-dark-visual` (rare, justified) |
| `.ops-dark-visual` inside lessons | Dark (rare) | Must be instructionally justified; bounded within the lesson content column; reviewed case-by-case |

Course heroes, curriculum sections, lesson shells, sidebars, headers, and footers are **light without exception**. Dark lesson visuals are rare, bounded within the prose column, and require instructional justification plus code review.

### 7.5 Lesson page shell — unified `LessonLayout`

```tsx
// components/lessons/LessonLayout.tsx (server component)
export default function LessonLayout({
  sidebar,
  breadcrumb,
  children,
}: {
  sidebar: React.ReactNode;
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="lesson-page">
      <div className="lesson-breadcrumb-bar">
        <div className="lesson-container">{breadcrumb}</div>
      </div>
      <div className="lesson-container">
        <div className="lesson-grid">
          <aside className="lesson-sidebar" aria-label="Lesson navigation">
            {sidebar}
          </aside>
          <div className="lesson-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

### 7.6 Lesson width model — wrappers, not parent constraint

Per refinement §3 #2: `.lesson-content` is **full-width** (its parent grid cell). Explicit width wrappers are used by content authors:

```css
.lesson-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 48px);
}

.lesson-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  padding-top: 48px;
  padding-bottom: 80px;
}
@media (min-width: 1024px) {
  .lesson-grid {
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 64px;
  }
}

.lesson-content { /* full width of its grid cell — no max-width */ }

/* Content authors opt into a width by using these wrappers */
.lesson-prose { max-width: 720px; }              /* default for paragraphs, lists,
                                                   definition cards */
.lesson-wide { max-width: 960px; }               /* diagrams, tables, worked examples */
.lesson-full { max-width: none; }                /* interactive frames that need the
                                                   full content area */
```

The 10 per-module `*Layout.tsx` files become thin wrappers around `<LessonLayout>`. Their existing content sections that need wider containers are wrapped in `.lesson-wide` or `.lesson-full`.

### 7.7 Lesson sidebar — sticky behavior, accessible active state

`LessonSidebar` is a **client component** — it uses `usePathname()` to determine the active lesson and `useEffect` to call `scrollIntoView({ block: 'nearest' })` when the active item changes.

```
[Sidebar container] (sticky)
│   position: sticky
│   top: calc(var(--site-header-height) + 24px)
│   max-height: calc(100dvh - var(--site-header-height) - 48px)
│   overflow-y: auto
│   scroll-behavior: smooth
│   overscroll-behavior: contain
│   background: var(--ops-surface) (white)
│   border: 1px solid var(--ops-surface-border)
│   border-radius: 16px
│   padding: 24px
│   NO default shadow
│
├── Module title block
│   ├── "Course · Module N" eyebrow            tertiary sans sentence case
│   └── Module title                            primary text semibold
│
├── Lesson list (nav)
│   └── LessonNavItem
│       ├── Default                             secondary text, transparent bg
│       ├── Hover                               --ops-surface-2 bg, primary text
│       ├── Active (aria-current="page") — current lesson route
│       │   ├── background: var(--ops-accent-soft)
│       │   ├── color: var(--ops-text-primary), font-weight 600
│       │   ├── 2px left accent bar in var(--ops-accent-strong)
│       │   │   (or warm STRONG for Investment Foundations)
│       │   ├── NO glow, NO neon border
│       │   └── scrollIntoView({ block: 'nearest' }) on activation
│       └── Completed                           small ✓ in --ops-success-strong
│
└── Source / reference card (LessonSourceCard)
    ├── Eyebrow                                 tertiary sans sentence case
    ├── Course / lecture                        primary + secondary text
    ├── Instructor                              accent STRONG (small text)
    └── Note                                    tertiary small text
```

`--site-header-height: 68px` is a CSS variable set on `:root` and updated by `SiteHeader` if the header ever changes height. The sidebar uses `top` and `max-height` together so it remains visible and scrollable without sliding under the sticky header.

Active item visibility: on route change or scroll-driven activation, the active item calls `scrollIntoView({ block: 'nearest' })` to ensure it is visible without jarring full-page jumps.

### 7.8 CourseRail — same sticky behavior

Same pattern as LessonSidebar. Sticky `top` and `max-height`, internal `overflow-y: auto`, active item `aria-current="location"` (it represents the current location within in-page navigation — the ARIA `location` token is the correct value for in-page section tracking), `scrollIntoView({ block: 'nearest' })`.

```css
.course-rail {
  position: sticky;
  top: calc(var(--site-header-height) + 24px);
  max-height: calc(100dvh - var(--site-header-height) - 48px);
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

### 7.9 Loading / error / not-found

```tsx
// app/(learning)/loading.tsx — server component
export default function Loading() {
  return (
    <div className="lesson-loading">
      <div className="lesson-loading-bar" aria-hidden />
      <p className="lesson-loading-label">Loading…</p>
    </div>
  );
}
```

```css
.lesson-loading {
  padding: 120px 24px;
  text-align: center;
  color: var(--ops-text-tertiary);
}
.lesson-loading-bar {
  width: 120px; height: 2px;
  margin: 0 auto 16px;
  background: var(--ops-accent-soft);
  position: relative;
  overflow: hidden;
}
.lesson-loading-bar::after {
  content: ""; position: absolute; inset: 0;
  background: var(--ops-accent-strong);
  animation: ops-loading 1.4s ease-in-out infinite;
}
@keyframes ops-loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

```tsx
// app/(learning)/error.tsx — CLIENT COMPONENT (uses reset callback)
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="lesson-error">
      <p className="lesson-error-eyebrow">Error</p>
      <h1>This page couldn’t load.</h1>
      <p className="lesson-error-body">
        Try again, or return to browse all courses. If the problem
        continues, the lesson may still be in development.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="lesson-error-detail">{error.message}</pre>
      )}
      <div className="lesson-error-actions">
        <Button onClick={reset}>Try again</Button>
        <Link href="/courses">Browse all courses</Link>
      </div>
    </div>
  );
}
```

**Production discipline:** the technical `error.message` is rendered only in development. Production users see a generic recovery message. **No claims about progress being "unaffected"** — that cannot be guaranteed and would mislead users.

```tsx
// app/(learning)/not-found.tsx — server component
export default function NotFound() {
  return (
    <div className="lesson-not-found">
      <p className="lesson-not-found-eyebrow">404</p>
      <h1>Lesson not found.</h1>
      <p>The lesson you’re looking for doesn’t exist or hasn’t been published yet.</p>
      <Link href="/courses" className="lesson-not-found-link">Browse all courses →</Link>
    </div>
  );
}
```

### 7.10 Mobile navigation — keyboard accessible

The current `SiteHeader` mobile menu uses a hamburger that toggles a panel. Changes:

1. **Hamburger button** has `aria-expanded`, `aria-controls`, and keyboard `onClick` (already in place — verify).
2. **Mobile module selector on course detail** is replaced with a `<details>`-based or button-triggered menu — NOT a horizontally scrollable chip strip that depends on precision scrolling. Each item is keyboard-focusable, and the active module is marked with `aria-current="location"`.
3. **Panel theming** uses `--header-bg`, `--header-text`, `--header-hover-bg` tokens (see §8.2).

---

## 8. Lesson content compatibility layer

### 8.1 Scope

Applies **only** inside `.ops-theme-light .lesson-content` — the prose region of lesson pages. Not applied to:
- Site header, footer, mobile nav
- Course map, course detail structural elements
- Buttons (`Button` component has its own scoped styles)
- `Feedback` component
- Charts, visualizations, anything inside `.ops-dark-visual`

### 8.2 Implementation strategy

Rather than broadly overriding utility classes (which would unintentionally affect buttons, charts, etc.), the compatibility layer uses **two complementary `:not()` filters** to exclude both component roots and their descendants:

1. `:not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)` — excludes elements that **themselves carry** one of these classes (e.g., `<button class="ops-btn text-white">`).
2. `:not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *)` — excludes elements **nested inside** any of these containers.

Both filters must be combined. A descendant-only filter misses the root; a root-only filter misses nested text. The theme/content prefix is wrapped in `:where()` to keep specificity at zero, so component-scoped styles always win.

Source order: the entire compatibility layer is defined in a `@layer utilities` block **after** Tailwind's utilities block, so when specificity ties, source order resolves in favor of the compatibility layer. Component-scoped styles (defined in `@layer components` or via Tailwind variants) win because they have higher specificity (zero-specificity `:where()` prefix loses to them).

```css
/* ─── Lesson-content compatibility layer ───
   Place inside @layer utilities, AFTER @tailwind utilities.
   The :where() prefix keeps specificity at (0,0,1) — the utility class itself.
   Component styles win; this layer only catches unscoped legacy utilities. */

/* Text color overrides */
:where(.ops-theme-light .lesson-content) .text-white
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-primary);
}
:where(.ops-theme-light .lesson-content) .text-slate-50
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-primary);
}
:where(.ops-theme-light .lesson-content) .text-slate-100
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-primary);
}
:where(.ops-theme-light .lesson-content) .text-slate-200
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-secondary);
}
:where(.ops-theme-light .lesson-content) .text-slate-300
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-secondary);
}
:where(.ops-theme-light .lesson-content) .text-slate-400
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-tertiary);
}
:where(.ops-theme-light .lesson-content) .text-slate-500
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-tertiary);
}
:where(.ops-theme-light .lesson-content) .text-slate-600
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  color: var(--ops-text-tertiary);
}

/* Border utilities */
:where(.ops-theme-light .lesson-content) .border-white\/10
  :not(.ops-btn, .ops-dark-visual)
  :not(:where(.ops-btn, .ops-dark-visual) *) {
  border-color: var(--ops-surface-border);
}
:where(.ops-theme-light .lesson-content) .border-white\/15
  :not(.ops-btn, .ops-dark-visual)
  :not(:where(.ops-btn, .ops-dark-visual) *) {
  border-color: var(--ops-surface-border);
}
:where(.ops-theme-light .lesson-content) .border-white\/20
  :not(.ops-btn, .ops-dark-visual)
  :not(:where(.ops-btn, .ops-dark-visual) *) {
  border-color: var(--ops-surface-border);
}

/* Background utilities for prose panels */
:where(.ops-theme-light .lesson-content) .bg-white\/\[0\.02\]
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  background: var(--ops-surface-2);
}
:where(.ops-theme-light .lesson-content) .bg-white\/\[0\.03\]
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  background: var(--ops-surface-2);
}
:where(.ops-theme-light .lesson-content) .bg-white\/\[0\.045\]
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  background: var(--ops-surface-2);
}
:where(.ops-theme-light .lesson-content) .bg-white\/5
  :not(.ops-btn, .feedback, .ops-chart, .ops-dark-visual)
  :not(:where(.ops-btn, .feedback, .ops-chart, .ops-dark-visual) *) {
  background: var(--ops-surface-2);
}

/* Hover backgrounds */
:where(.ops-theme-light .lesson-content) .hover\:bg-white\/5
  :not(.ops-btn, .ops-dark-visual)
  :not(:where(.ops-btn, .ops-dark-visual) *):hover {
  background: var(--ops-surface-2);
}
:where(.ops-theme-light .lesson-content) .hover\:bg-white\/10
  :not(.ops-btn, .ops-dark-visual)
  :not(:where(.ops-btn, .ops-dark-visual) *):hover {
  background: rgba(0, 0, 0, 0.06);
}
```

### 8.3 Component-scoped exclusions

To make exclusions robust (refinement §3 #4), the affected components get explicit class hooks:

- `Button`: already uses `.button`-style variants; verify all `Button` instances have a stable class like `ops-btn` and exclude `ops-btn` in compatibility selectors.
- `Feedback`: wrap rendered output in `<div class="feedback ...">` and exclude `.feedback *`.
- Charts (Recharts, custom SVG visualizations): wrap in `.ops-chart` or `.ops-dark-visual` and exclude both.
- Interactive widgets that intentionally use bright colors on dark backgrounds: wrap in `.ops-dark-visual`.

### 8.4 `.ops-dark-visual` — token reset

For rare intentionally-dark instructional visuals. Implemented by **resetting semantic tokens** inside the container.

Because §8.2's compatibility layer uses `:not(:where(.ops-dark-visual) *)` to exclude `.ops-dark-visual` descendants, hardcoded Tailwind utilities like `.text-white`, `.bg-white/5` retain their authored dark values automatically inside this container. **No explicit restoration selectors are needed.**

```css
.ops-theme-light .ops-dark-visual {
  /* Reset semantic tokens — primary mechanism */
  --ops-bg: #05070d;
  --ops-surface: rgba(255, 255, 255, 0.04);
  --ops-surface-2: rgba(255, 255, 255, 0.02);
  --ops-surface-border: rgba(255, 255, 255, 0.10);
  --ops-text-primary: #F5F5F7;
  --ops-text-secondary: #D2D2D7;
  --ops-text-tertiary: #86868B;
  --ops-accent: #22d3ee;
  --ops-accent-strong: #22d3ee;
  --ops-success: #34d399;
  --ops-error: #f87171;
  color-scheme: dark;
  background: #05070d;
  color: #F5F5F7;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
```

The container must be placed **inside `.lesson-content`** to benefit from the compatibility layer's exclusion. A `.ops-dark-visual` placed outside `.lesson-content` (e.g., directly inside `.lesson-page`) will still render dark via the token reset, but any hardcoded Tailwind utilities inside it may need explicit per-instance review.

Each `.ops-dark-visual` usage must be justified in code review. Default assumption: lessons are light.

---

## 9. SiteHeader & SiteFooter — theme-aware tokens

### 9.1 Token definitions

```css
:root {
  /* Dark scope defaults */
  --site-header-height: 68px;
  --header-bg: rgba(5, 7, 13, 0.80);
  --header-bg-transparent: transparent;
  --header-border: rgba(255, 255, 255, 0.10);
  --header-text: #F5F5F7;
  --header-text-muted: #cbd5e1;
  --header-hover-bg: rgba(255, 255, 255, 0.05);

  --footer-bg: #05070d;
  --footer-border: rgba(255, 255, 255, 0.10);
  --footer-text: #F5F5F7;
  --footer-text-secondary: #cbd5e1;
  --footer-text-muted: #86868B;
}

.ops-theme-light {
  --header-bg: rgba(255, 255, 255, 0.80);
  --header-bg-transparent: rgba(255, 255, 255, 0.40);
  --header-border: rgba(0, 0, 0, 0.08);
  --header-text: #1D1D1F;
  --header-text-muted: #424245;
  --header-hover-bg: rgba(0, 0, 0, 0.04);

  --footer-bg: #FFFFFF;
  --footer-border: rgba(0, 0, 0, 0.08);
  --footer-text: #1D1D1F;
  --footer-text-secondary: #424245;
  --footer-text-muted: #6E6E73;
}
```

### 9.2 Header behavior

- No client-side pathname detection for theme (refinement §1 #3).
- The header is a client component (uses `useEffect` for scroll detection and `useState` for mobile menu state).
- The transparent-over-hero behavior is preserved only on `/` (homepage). Detect homepage via `usePathname()` for **behavior only** (transparent vs solid), not for theme — theme comes from the parent scope class.
- On learning routes, header is always solid (because no transparent hero). `solid = scrolled || !isHome` still works; the underlying colors come from tokens.

### 9.3 Footer behavior

Server component. All colors via tokens. No behavioral differences between scopes.

---

## 10. Accessibility

### 10.1 Active states
- Active lesson in sidebar: `aria-current="page"` (the current route).
- Active module in CourseRail: `aria-current="location"` (current in-page location).
- Active mobile nav item: `aria-current="page"`.
### 10.2 Keyboard navigation

- Mobile module selector: button-triggered menu (e.g., `<details>` or custom with `aria-expanded`, `aria-controls`, focus management) — NOT horizontal scroll-dependent.
- Mobile header menu: arrow key navigation between items, Escape to close, focus trap inside the panel.
- Sticky sidebar / rail: tabbable, scroll-into-view on focus.

### 10.3 Reduced motion

Existing `prefers-reduced-motion` handling is retained. The loading bar animation is gated behind reduced-motion (replaced with a static "Loading…" label). Sidebar scroll-into-view uses `behavior: 'auto'` (not `'smooth'`) under reduced motion.

### 10.4 Focus visibility

All interactive elements use `:focus-visible` with a 2px outline in `var(--ops-accent-strong)`. Visible against both white and `--ops-surface-2` backgrounds.

---

## 11. File change inventory

### New files

- `app/(marketing)/layout.tsx` — SiteShell dark
- `app/(learning)/layout.tsx` — SiteShell light
- `app/(learning)/loading.tsx`
- `app/(learning)/error.tsx` — `"use client"`
- `app/(learning)/not-found.tsx`
- `app/(app)/layout.tsx` — SiteShell dark (for /studio and /filings)
- `components/layout/SiteShell.tsx`
- `components/lessons/LessonLayout.tsx`
- `components/lessons/LessonSidebar.tsx`
- `components/lessons/LessonSourceCard.tsx`
- `components/lessons/LessonNavItem.tsx`

### Moved

- `app/page.tsx` → `app/(marketing)/page.tsx`
- `app/courses/page.tsx` → `app/(learning)/courses/page.tsx`
- `app/courses/[courseSlug]/page.tsx` → `app/(learning)/courses/[courseSlug]/page.tsx`
- `app/lessons/[lessonSlug]/page.tsx` → `app/(learning)/lessons/[lessonSlug]/page.tsx`
- `app/studio/page.tsx` → `app/(app)/studio/page.tsx`
- `app/filings/page.tsx` → `app/(app)/filings/page.tsx`

### Modified

- `app/layout.tsx` — remove `bg-ink-950 text-slate-100` from body; remove SiteHeader/SiteFooter from JSX; keep html/body/fonts.
- `app/globals.css` — add theme tokens, scope rules, lesson-content compatibility layer, `.ops-dark-visual` resets, loading/typography utilities.
- `tailwind.config.ts` — do **not** extend Tailwind colors for theme tokens. Use CSS variables (`var(--ops-...)`) directly inside component className strings or via `style` props. Tailwind's existing `accent-cyan`, `accent-amber`, `ink-950` tokens remain for dark-scope usage (homepage, studio, filings) and are unchanged.
- `components/layout/SiteHeader.tsx` — use `--header-*` tokens, mobile menu accessibility.
- `components/layout/SiteFooter.tsx` — use `--footer-*` tokens.
- `components/ui/Button.tsx`, `Badge.tsx`, `GlassPanel.tsx`, `SectionLabel.tsx` — verify token usage; replace dark hardcoded utilities.
- `components/ui/Panel` (in `intro-course-overview/shared.tsx`) — rename `tone="dark"` to `tone="default"`, verify light rendering.
- `components/courses/CourseCard.tsx` — light card body, retained dark visual top.
- `components/courses/CourseRail.tsx` — sticky behavior, `aria-current`, accessibility.
- `components/courses/ModuleSection.tsx` — typography refresh, sentence case.
- `components/courses/LessonRow.tsx` — already light; minor polish.
- `components/lessons/intro-course-overview/shared.tsx` — primitive restyle (Panel, DefinitionCard, InteractiveFrame, SectionHeading, Feedback, ConceptTag, TryItTag).
- `components/lessons/{module}/\*Layout.tsx` (10 files) — refactor to use `<LessonLayout>` wrapper; remove `terminal-grid` overlay divs.
- `components/lessons/{module}/\*ProgressRail.tsx` (10 files) — refactor to use `<LessonSidebar>` + `<LessonNavItem>`. **Preserve existing progress-tracking logic** (`useIFProgress`, `usePvProgress`, etc.) — only visual treatment changes.
- `components/lessons/{module}/\*SourcePanel.tsx` (10 files) — refactor to use `<LessonSourceCard>`.
- `app/courses/page.tsx` — remove hero 3-step path, simplify hero, apply tokens.
- `app/courses/[courseSlug]/page.tsx` — softly tinted hero, remove dark closing CTA, apply tokens, sentence case labels.
- `app/lessons/[lessonSlug]/page.tsx` — wrap default lesson in `<LessonLayout>` with `<LessonSidebar>`; remove terminal-grid; light typography.

### Untouched

- `components/marketing/*` — homepage components, stay dark.
- All 47 lesson content components (`Lesson1.tsx`, `LessonIF_1_1.tsx`, etc.) — visually convert via compatibility layer and primitive restyle; no per-file edits required unless they contain hardcoded dark patterns outside the compatibility layer's coverage.

---

## 12. Acceptance criteria

This revision is complete only when:

1. All internal learning pages (`/courses`, `/courses/[slug]`, `/lessons/[slug]`, loading, error, not-found) use a consistent light theme.
2. Lesson pages no longer use the dark grid dashboard look — `terminal-grid` is neutralized, dark panels are converted, neon glows are removed.
3. The course ecosystem feels premium and editorial — generous spacing, sentence-case labels, sans typography for metadata, restrained accents.
4. No visual whiplash across the learning flow. Header, content, sidebar, and footer share one theme.
5. Readability is improved — 18px body, 19px definition copy, 1.65 line-height, 720px prose column, three-tier spacing scale.
6. OPS brand identity is intact — Fraunces display retained, cyan/amber accents retained but used sparingly and only on appropriate surfaces.
7. Server-rendered first frame is light — no flash, no dark body during overscroll or route transitions.
8. Mobile module navigation is keyboard accessible and not precision-scroll dependent.
9. Active states use `aria-current`. Focus visibility is preserved on all interactive elements.
10. WCAG AA contrast verified for cyan, amber, feedback tokens, captions, links, and disabled controls on every light surface.
11. `/studio` and `/filings` remain dark and functional inside their own route group.
12. The homepage remains dark and cinematic.
13. The rendered QA matrix (§13) is fully verified — every cell passes visual inspection at desktop, tablet, and mobile breakpoints; `lint`, `typecheck`, and `build` pass; WCAG audit completes without unresolved failures.

---

## 13. Rendered QA matrix

Implementation is not complete until every cell below has been visually verified. The implementation plan must allocate explicit QA time per phase.

### 13.1 Course pages (3)

| Route | Desktop | Tablet | Mobile | Reduced motion |
|---|---|---|---|---|
| `/courses` | ✓ | ✓ | ✓ | ✓ |
| `/courses/finance-foundations` | ✓ | ✓ | ✓ | ✓ |
| `/courses/investment-foundations` | ✓ | ✓ | ✓ | ✓ |

Per route verify: hero treatment, course cards (visual top dark, body light), sequence section (single representation), course hero (softly tinted, not dark), curriculum section, CourseRail sticky behavior, LessonRow hover states, closing CTA (white card on page bg).

### 13.2 Lesson pages — one per module folder (10)

| Module folder | Representative lesson | Verify |
|---|---|---|
| `intro-course-overview` | `/lessons/what-is-finance-value-time-risk` | Formula rendering, charts, interactions |
| `present-value-relations` | `/lessons/present-value-cashflows-assets-npv` | Cash-flow diagrams, tables |
| `fixed-income-securities` | `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds` | Yield curves, scan-line interactions |
| `equities` | `/lessons/equity-what-does-owning-a-stock-mean` | Long-form reading, definition cards |
| `risk-and-return` | `/lessons/risk-return-what-they-mean` | Feedback states (correct/incorrect/info) |
| `portfolio-theory` | `/lessons/portfolio-weights-returns` | Tables, allocation interactions |
| `the-capm-and-apt` | `/lessons/capm-tangency-becomes-market-portfolio` | Charts (SML), formula blocks |
| `capital-budgeting` | `/lessons/required-return-to-discount-rate` | Sensitivity tables, scenario chips |
| `efficient-markets` | `/lessons/efficient-market-hypothesis` | Decision journal, feedback states |
| `investment-foundations` | `/lessons/if-1-1-how-an-investor-builds-a-philosophy` | Warm accent (amber), long-form reading, PhilosophyDraftBuilder |

Per lesson verify, at desktop + tablet + mobile + reduced motion:

- Formula rendering (KaTeX `InlineMath`, `BlockMath`) — readable contrast, no overflow on mobile
- Charts and visualizations — colors remain accessible on white
- Interactive widgets (sliders, scenario chips, classifiers) — `.ops-interactive-frame` is neutral by default, cyan only on `is-active`
- Feedback states (`Feedback` component) — success/warning/error/info tokens render correctly, no overlap with compatibility layer
- Tables — width within `.lesson-wide` wrapper, mobile horizontal scroll if needed
- Sidebar — sticky, active lesson highlighted, scrollIntoView works, `aria-current="page"` set
- Source panel — accent STRONG color for instructor, sentence-case labels
- Prev/Next navigation — keyboard accessible

### 13.3 Cross-cutting states

| State | How to trigger | Verify |
|---|---|---|
| Loading | Throttle network, navigate between routes | Light loading bar, no dark flash |
| Error | Visit `/lessons/broken-test-route` (throw in component) | Light error UI, no `error.message` in production build |
| Not found | Visit `/lessons/not-a-real-lesson` | Light 404, link back to `/courses` |
| Header on light bg | Any learning route | Light header tokens, no dark flash |
| Header scroll | Scroll any learning route | Light header remains light (no dark transition) |
| Footer on light bg | Any learning route | Light footer tokens |
| Mobile nav menu | Tap hamburger on learning route | Light panel, keyboard accessible, focus trap |
| Mobile module selector | `/courses/{slug}` on mobile | Button-triggered menu (not scroll), keyboard accessible, active marked `aria-current="location"` |
| Route transition | Navigate `/courses` → `/lessons/{slug}` | No dark flash between routes |
| Overscroll | Pull down at top of any learning route on mobile | Light bg visible, not dark body |

### 13.4 `.ops-dark-visual` escape hatch

If any lesson uses `.ops-dark-visual`, verify in isolation:

- Container renders dark with correct text colors
- Surrounding content remains light
- No leakage of dark tokens outside the container
- Bright accent text (`#22d3ee`) is acceptable inside (it's dark scope)
- Container is bounded within `.lesson-content`

If no lesson uses `.ops-dark-visual`, skip — but document the decision.

### 13.5 Verification gates

Every phase must pass before the next begins:

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run build         # Next.js production build (catches RSC/client boundary issues)
```

There is no test script in this project (`package.json` confirmed) — `lint` + `typecheck` + `build` is the existing verification suite.

### 13.6 Screenshots

Capture screenshots at three breakpoints for every cell in §13.1, §13.2, and §13.3:

- **Desktop:** 1440 × 900
- **Tablet:** 768 × 1024
- **Mobile:** 375 × 812

Screenshots stored under `docs/superpowers/qa/2026-07-21-light-theme/` and referenced from the implementation plan's final phase.

### 13.7 WCAG contrast audit

Run automated contrast checks (e.g., browser DevTools accessibility checker, or `axe-core`) against every light surface:

- All text on `#FFFFFF` (cards)
- All text on `#F5F5F7` (page bg)
- All text on `#F2F2F4` (secondary surface)
- All text on `var(--ops-accent-soft)` (active sidebar item)
- All text on `var(--ops-success-soft)`, `var(--ops-warning-soft)`, `var(--ops-error-soft)`, `var(--ops-info-soft)` (feedback states)
- Disabled controls on every surface
- Focus ring on every interactive element

Document any failures and remediate before declaring implementation complete.

---

## 14. Out of scope

- Homepage redesign (dark, cinematic — unchanged).
- `/studio` and `/filings` redesign (remain dark — wrapped in `(app)` route group).
- Educational content refactor (lesson bodies are visually converted via compatibility layer; content is not rewritten).
- New lesson features (only theming and shell structure).
- Live market data or API integration (unchanged).
