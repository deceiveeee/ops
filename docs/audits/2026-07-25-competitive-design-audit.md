# Open Portfolio Studio — Competitive Design Audit

**Date reviewed:** 2026-07-25
**Audit target:** Open Portfolio Studio (OPS) — live deployment at `https://ops-lovat.vercel.app/`, cross-checked against the source repository at `C:\Open Portfolio Studio`.
**Benchmarks:** Brilliant (`https://brilliant.org/`), Khan Academy (`https://www.khanacademy.org/`), Apple (`https://www.apple.com/` and `https://www.apple.com/iphone/`).
**Tooling limitation (important):** This audit was conducted without a browser or screenshot tool. OPS findings are grounded in (a) the authoritative source repository (exact design tokens, typography values, component composition, responsive classes) and (b) live `webfetch` content of every OPS page. Benchmark findings are grounded in live `webfetch` content/structure. Pixel-level visual judgments (spacing, exact rendering) are inferred from code and structure rather than retinal inspection, and are flagged as such. No screenshots were captured; "figures" are precise page/element references (see Appendix §16.2).

---

## 1. Executive summary

**Overall assessment.** OPS is a credible, intellectually serious finance-education product with a genuinely strong differentiator: hand-built, instructionally purposeful financial visualizations wired into real lessons (worked derivations, interactive worksheets, drag-driven explorations, mastery checks) — not decorative charts. Where a lesson is fully built (e.g. `/lessons/portfolio-risk-covariance-correlation`), the learning experience is competitive with Brilliant and materially deeper than most consumer finance courses. The homepage is cinematic and on-brand. The engineering foundation is disciplined: a real design-token system, AA-mapped light theme, pervasive reduced-motion support, semantic landmarks, and inline-SVG visuals (no image weight).

**Strongest aspect.** Educational credibility and finance-specific learning design (Category K and L). Real MIT OCW 15.401 attribution, real historical worked examples (GM/Motorola 1946–2001), KaTeX formulas, and interactives that *teach* (variance-expansion step-through, opportunity-curve drag, cash-flow scanners). This is OPS's defensible core and the thing no benchmark does.

**Largest competitive gap.** Product completeness and finish outside the built lessons. Two of the three pillars are non-functional "concept" mockups (Studio, Filings — explicit "MOCK / static" placeholders, dashed empty panels). One of two courses is a shell (`Investment Foundations` = **1 module, 1 lesson** live). Several Finance Foundations lessons render a near-empty "In development" stub. Course discovery is thin (2 courses, no prerequisites/progress/filtering). This gap between the homepage's "Apple-quality" promise and the deep-page reality is the single biggest threat to perceived quality — a visitor who clicks through from the hero into a stub or a mock dashboard experiences a sharp drop in polish that reads as "unfinished," undermining the credibility the lessons earn.

**Beta-readiness judgment.** **Not yet beta-ready as a full product**, but **beta-ready as a course product scoped to Finance Foundations with stub lessons clearly demarcated.** Studio and Filings should be relabeled/roadmapped rather than presented as products, or they will read as broken promises on first click.

**Five highest-priority actions.**
1. **Resolve the completeness cliff.** Either remove, gate, or visibly roadmap Investment Foundations (1 module/1 lesson), Module 10, and the "In development"/"Coming soon" stubs. Today the curriculum page advertises "55 lessons" but a meaningful fraction are placeholder pages. *(P0, High impact, Medium effort.)*
2. **Stop presenting Studio and Filings as finished products.** They are concept mocks with dashed empty "interactive panel" boxes and "Mock / static" stats. Convert to an honest "coming" treatment or a single real workflow each, so the homepage→tool journey doesn't collapse. *(P0, High impact, Medium–Large effort.)*
3. **Fix mobile lesson overflow.** Many lesson tables/SVGs use fixed `min-w-[440–680px]` without horizontal-scroll wrappers; on a 390px phone these clip or overflow. This is the most likely *broken-state* a mobile beta user will hit. *(P0, High impact, Small–Medium effort.)*
4. **Add a global "skip to content" link, custom 404/loading/error pages, and visible course-level progress.** Missing all three today; the first two are baseline credibility/ accessibility gaps, the third is the biggest missing learning affordance vs Brilliant/Khan. *(P1, Medium–High impact, Small–Medium effort.)*
5. **Retire ~20 orphaned marketing components** and tighten the tiny-monospace-label pattern (9–10px tracked uppercase mono is used heavily in Studio/Filings/stub lessons — the exact "excessive monospace / low-contrast micro-text" the project brief warns against). *(P1, Medium impact, Small effort.)*

---

## 2. Audit scope and methodology

### 2.1 OPS pages reviewed (live + repository)
| Page | Route | Status |
|---|---|---|
| Homepage | `/` | Live, fully built (6 chapters). |
| Course catalog | `/courses` | Live, built. |
| Course detail (Finance Foundations) | `/courses/finance-foundations` | Live, built; stub lessons visible. |
| Course detail (Investment Foundations) | `/courses/investment-foundations` | Live but **shell (1 module / 1 lesson)**. |
| Lesson (real) | `/lessons/portfolio-risk-covariance-correlation` | Live, rich, fully built — used as the primary lesson sample. |
| Lesson (stub) | e.g. `/lessons/multiples-and-market-expectations` | Renders "Coming soon" stub (per registry gap). |
| Studio | `/studio` | Live, **concept mock** (non-interactive). |
| Filings | `/filings` | Live, **concept mock** (non-interactive). |
| Header & global nav | all pages | Reviewed via repo (`SiteHeader.tsx`) + live. |
| Footer | all pages | Reviewed. |

### 2.2 Benchmark pages reviewed (live `webfetch`)
- **Brilliant:** homepage (`/`) — positioning (Koji tutor), subject/course catalog structure, credibility signals (MIT/Harvard), motivation mechanics (streaks/levels/daily goals), mobile-first (app badges), testimonials. *Note: Brilliant's interactive lessons and course landing pages are behind authentication and were not inspected first-hand this session.*
- **Apple:** homepage (`/`) and a major product page (`/iphone/`) — hero tile composition, chapter navigation, section pacing, typography scale, "reasons to buy" grid, footer sitemap.
- **Khan Academy:** homepage (`/`) and `/economics-finance-domain/core-finance`. **Both returned effectively no structured content** (Khan Academy is a client-rendered SPA that serves minimal HTML to non-JS/text clients). Khan-specific findings below are therefore flagged as **tooling-limited** and kept to confidently-known, publicly-documented structural patterns; they should be re-verified with a real browser in a follow-up pass.

### 2.3 Viewports
Assessed via repository responsive classes and known breakpoints: **1440×900, 1280×800, 1024×768 (desktop/tablet)** and **390×844 (mobile)**. Because no live browser was available, mobile behavior is inferred from `sm:`/`md:`/`lg:` usage and fixed-width analysis in code (see §11), not from rendered measurement.

### 2.4 Methodology
1. Read `AGENTS.md` (project brief & creative standard).
2. Mapped the OPS codebase exhaustively (routes, design system, components, responsive classes, motion, a11y, content state) via the repository.
3. Pulled live content of all OPS pages to confirm deployment, copy, and accessibility.
4. Pulled live content of Brilliant and Apple (homepage + iPhone product page).
5. Cross-evaluated the same criteria; separated transferable principles from brand-specific execution.
6. No implementation files were modified (research-only).

### 2.5 Limitations
- No browser/screenshot tool → no rendered pixel measurement, no motion video capture, no screenshots. Visual judgments are code- and structure-informed.
- Khan Academy live content not retrievable as text → Khan comparisons are hedged.
- Brilliant lesson interiors behind auth → Brilliant learning-interior claims rest on its marketing framing + OPS's own comparable lesson.
- No automated accessibility run (axe/Lighthouse) → §12 separates *observed* from *suspected* and makes no WCAG-pass claim.

---

## 3. Benchmark positioning

### 3.1 Brilliant — learning UX & motivation
Demonstrates, observably from its homepage: a single dominant value proposition ("A world-class tutor for every home"), one clear branching CTA ("I'm a learner" / "I'm a parent or teacher"), a subject→course catalog with progressive disclosure ("26 additional courses"), credibility-by-association ("built by learning experts from MIT and Harvard"), a motivation loop (streaks, levels, daily goals), and a mobile-first posture (app-store badges prominent). Transferable for OPS: **one dominant task per screen, credibility-by-authority up front, honest mobile framing.** Not to copy: Brilliant's child-focused tone, mascot/tutor framing, gamified streak language.

### 3.2 Khan Academy — structure, mastery, credibility *(tooling-limited this session)*
Widely-documented stable patterns (not fully re-verified live this session): unit→lesson→practice→mastery progression, free/credible positioning, dense but legible course outlines, mastery-based progression and energy-points as a *progress* signal rather than gimmick. Transferable for OPS: **course-level progress visibility, a unit/lesson outline that communicates the whole path at a glance, mastery gating tied to correctness.** Not to copy: Khan's utilitarian visual style or energy-points currency.

### 3.3 Apple — art direction & product storytelling
Observably from `/` and `/iphone/`: full-bleed hero "tiles" each carrying one product, one two-line headline, and a consistent two-link CTA pattern ("Learn more" / "Buy"); a sticky **chapter nav** on product pages that lets the user jump sections; alternating dark/light full-viewport sections; a "reasons" grid near the conversion point ("Why Apple is the best place to buy"); and a disciplined typographic scale where the product name *is* the dominant element. Transferable for OPS: **one idea per viewport, a consistent CTA grammar, a sticky section index on long pages (OPS already has this on course detail — `CourseRail`), and restraint as a polish signal.** Not to copy: Apple's photography-heavy product-marketing format (inappropriate for a learning product) or its commerce/footer machinery.

### 3.4 Optional secondary references
**None used.** Brilliant, Khan, and Apple covered the required axes (learning UX, education structure, art direction). Adding Coursera/Linear was considered but would have expanded scope without changing the conclusions.

---

## 4. Comparative scorecard

Scores 1–10; not inflated. `N/A` where the comparison is inappropriate (e.g., Apple on education categories; Brilliant/Khan on OPS's finance-tooling category).

| Category | OPS | Brilliant | Khan Academy | Apple | Main OPS gap |
|---|---:|---:|---:|---:|---|
| A. Brand & first impression | 6 | 7 | 7 | 10 | Hero promises more product depth than deep pages deliver |
| B. Visual hierarchy | 6 | 7 | 7 | 9 | Built lessons present many similarly-weighted elements per viewport |
| C. Typography | 6 | 7 | 8 | 9 | Heavy 9–10px tracked-uppercase mono labels (Studio/Filings/stubs) |
| D. Composition & art direction | 6 | 7 | 6 | 10 | Studio/Filings read as mock dashboards (dashed empty panels), not integrated scenes |
| E. Color & contrast | 7 | 7 | 7 | 9 | Secondary slate-400/500 metadata tier leans gray |
| F. Motion & interaction | 7 | 8 | 6 | 9 | Some decorative motion (driver-band waves, looping flowstream) |
| G. Information architecture | 5 | 7 | 8 | 9 | Courses↔Studio↔Filings relationship is stated but not realized (tools are mocks) |
| H. Course discovery | 4 | 8 | 8 | N/A | 2 courses, no prerequisites/progress/filter; one course is a shell |
| I. Lesson experience | 7 | 8 | 8 | N/A | Bimodal: rich built lessons vs. near-empty stubs; high element density |
| J. Learner motivation & progression | 5 | 8 | 9 | N/A | No course-level progress visibility; device-only localStorage; no cross-course path |
| K. Educational credibility | 8 | 7 | 9 | N/A | (Strength) — maintain; expose sources/authorship more prominently |
| L. Finance-specific product quality | 7 | N/A | N/A | N/A | Charts teach well; Studio/Filings are non-functional, undercutting the differentiator |
| M. Mobile quality | 5 | 7 | 7 | 9 | Fixed-`min-w` lesson tables/SVGs overflow on phones |
| N. Accessibility | 6 | 7 | 7 | 8 | No skip-link; no custom 404/loading/error pages |
| O. Performance & implementation polish | 7 | 7 | 7 | 9 | ~20 orphaned marketing components (dead code); KaTeX SSR cost unmeasured |

**Reading:** OPS is strongest where rigor lives (K=8) and competent-to-strong on craft foundations (E/F/L/O=7). It is weakest where the product is incomplete or thinly structured (H=4; G/J/M=5). The gap to Apple is *composition/restraint/finish*; the gap to Brilliant/Khan is *product structure and learning progression*.

---

## 5. What OPS already does well

1. **Finance visuals that teach, not decorate (Category L; competitive & unique).** In `/lessons/portfolio-risk-covariance-correlation`, the two-asset variance is derived as an interactive step-through (return → subtract mean → square → map to 2×2 matrix → combine symmetric cells), followed by a fillable weighted-covariance worksheet, a drag-driven opportunity curve, and a 6-question mastery check. This is exactly the "creative interaction must clarify a finance concept" standard in `AGENTS.md`, and it is realized at a level Brilliant markets but few finance courses reach. *Status: competitive and unique to OPS.*
2. **Educational credibility (Category K; competitive).** Sources cited inline at the foot of lessons (e.g., "MIT OpenCourseWare 15.401 Finance Theory I, Andrew W. Lo, Lectures 13–14"; FINRA investor education). Historical GM/Motorola data labeled "1946–2001, not current estimates." Serious, non-condescending tone appropriate for motivated high-schoolers and adult beginners. *Status: competitive.*
3. **Design-token discipline (Category E/O; promising & consistent).** A real token layer: ink scale, accent set, CSS variables, and — notably — a light theme (`.ops-theme-light`) that **remaps every accent to AA-compliant siblings** (cyan→`#007A8A`, amber→`#8A5A00`, etc.) and floors SVG label text to ≥12px. This is above the engineering bar most early-stage education products clear. *Status: consistent.*
4. **Purposeful, reduced-motion-aware motion (Category F; competitive).** `useReducedMotion()` is read in essentially every animated component; a global `prefers-reduced-motion` block zeroes durations. Scroll-linked storytelling (cash-flow collapse, diversification smoothing) explains cause-and-effect rather than decorating. *Status: competitive.*
5. **Semantic & contrast baseline (Category N; promising).** `<header>/<main>/<footer>` landmarks, `role="img"` + descriptive `aria-label` on charts, `aria-hidden` on decorative SVGs, visible `focus-visible` rings, descriptive `aria-label`s on the mobile menu toggle and number inputs. *Status: promising; a few gaps (see §12).*
6. **Homepage as a cohesive finance story (Category A/D; competitive on the dark marketing surface).** Six chapters move price → business → source → cash-flow-value → portfolio → CTA. The hero's chart-lifts-to-reveal-drivers is a genuine thesis-in-one-image. *Status: competitive on the marketing surface; the problem is the drop-off after it.*

---

## 6. Major competitive gaps

Findings are grouped: **6.1 Strategic product gaps · 6.2 Visual-system gaps · 6.3 Page-level composition problems · 6.4 Implementation defects.** Each uses the required finding format.

### 6.1 Strategic product gaps

#### 6.1.1 The "three pillars" are not three pillars — two are concept mocks
**OPS observation.** The homepage and `/courses` frame three pillars: Finance Foundations → Investment Foundations → Portfolio Studio (Fig. 1, Fig. 2). But `/studio` is a set of six panels each containing a **dashed-bordered empty box labeled "interactive panel"** plus a stats block printed with "Mock / static · no live market data · for education only" (Fig. 5). `/filings` is a four-excerpt mock "FORM 10-K · MOCK PREVIEW" whose promised interactions (section pinning, hover-to-explain, jump-to-section) are described in copy as roadmap, not implemented (Fig. 6).

**Benchmark comparison.** Apple's homepage tiles each resolve to a *real* product page one click deeper; the marketing surface never promises a product that doesn't exist. Brilliant's homepage CTAs resolve into a real (auth-gated) interactive experience.

**Why it matters.** The homepage establishes premium, Apple-grade expectations. A first-time visitor who clicks "Enter the studio" and lands on a dashboard of empty dashed boxes experiences an immediate credibility collapse that *retroactively* makes the homepage feel like marketing vaporware. This is the largest single risk to perceived quality.

**Evidence.** Live `/studio` ("Panel · Portfolio builder · interactive panel" with empty placeholder; "Mock / static" disclaimer); live `/filings` ("FORM 10-K · MOCK PREVIEW", "Concept preview … will support …"); repository `app/(app)/studio/page.tsx`, `app/(app)/filings/page.tsx`.

**Severity:** Critical **Priority:** P0 **Effort:** Medium–Large **Expected impact:** High
**Recommendation.** Stop presenting Studio and Filings as products. Two viable options: (a) ship *one real micro-workflow in each* before beta — e.g., a real "drag-to-allocate two-asset portfolio → live volatility" in Studio and a real "open a real 10-K section → show two annotations" in Filings (OPS already builds these mechanics inside lessons, so the code largely exists); or (b) relabel both as "Coming soon — see how it works in the courses" with a single concrete preview and route users to the lesson that teaches the same concept. Do not leave dashed empty "interactive panel" boxes in a beta.

#### 6.1.2 Course catalog advertises depth that doesn't exist yet
**OPS observation.** `/courses` shows "Two courses. One investigation toolkit." The Finance Foundations card prints **"40 Hours · 10 Modules · 55 Lessons"** (Fig. 2), and `/courses/finance-foundations` lists all 10 modules. But the live curriculum exposes that **Investment Foundations is 1 module / 1 lesson**, and within Finance Foundations several lessons render "In development" / "Coming soon" stubs (Module 4 L8 "Multiples and Market Expectations"; Module 7 L4 "Alpha, Performance…"; Module 8 L8 "Real Options Intuition"; Module 9 L2 & L6; and **all four lessons of Module 10** "Integrated Portfolio Studio Application"). A user who clicks into Module 10 — the integration capstone the whole course points toward — gets a near-empty objectives page.

**Benchmark comparison.** Brilliant's catalog uses honest progressive disclosure ("26 additional courses") and every listed course resolves to a real experience. Khan's unit outlines expose lesson counts that match real content.

**Why it matters.** Overstated counts ("55 lessons") create an implicit contract the stubs break. Encountering a stub — especially at a *capstone* module — signals "abandoned" more than "in progress." This directly damages the credibility score (K) that is OPS's strength.

**Evidence.** Live `/courses` stats; live `/courses/finance-foundations` lesson rows tagged "Coming soon"/"In development"; repository registry gap (`lib/lessonRegistry.ts` has 48 entries vs. ~51 catalog slugs; Module 10 unregistered).

**Severity:** Critical **Priority:** P0 **Effort:** Medium **Expected impact:** High
**Recommendation.** Make counts honest and stubs intentional. (1) Compute lesson counts from *registered* components, not the catalog, so the printed number reflects real lessons. (2) Replace the generic "In development" stub with a purposeful "On the roadmap" card that states the concept and links to a *related real lesson* so the user is never dead-ended. (3) Either build Module 10's integration map (it is the narrative payoff) or temporarily hide it behind a single "capstone coming" marker rather than four empty pages.

#### 6.1.3 No course-level progress or cross-course path
**OPS observation.** Progress exists *inside* modules (`PVProgressRail`, `RRProgressRail`, etc., stored in `localStorage` per module), but it is invisible on `/courses`, on the course-detail hero, and on `CourseCard`. There is no "Continue where you left off," no course-completion percentage, no cross-course sequencing beyond the static 3-step "Finance → Investment → Studio" graphic. Progress is device-only (no persistence across devices).

**Benchmark comparison.** Brilliant and Khan both surface "continue learning" and course/lesson completion prominently; Khan's mastery system ties progress to demonstrated correctness across the whole course. This is the core *learning-product* affordance OPS lacks.

**Why it matters.** Without visible course-level progress, a returning learner cannot orient ("where was I?"), and the 40-hour course feels like an undifferentiated wall. Motivation and momentum (Category J) suffer.

**Evidence.** `CourseCard.tsx` shows hours/modules/lessons but no progress; no "continue" affordance in `SiteHeader`; per-module progress rails only inside lessons.

**Severity:** High **Priority:** P1 **Effort:** Medium **Expected impact:** High
**Recommendation.** Add a course-level progress read (sum of completed lessons / total registered lessons from `localStorage`) shown as a thin bar on `CourseCard` and in the course-detail hero, plus a single global "Continue learning" entry point in the header that deep-links to the last completed lesson. Keep it progress-based, not gamified — OPS's serious tone should not adopt streaks/points (consistent with `AGENTS.md`).

#### 6.1.4 Discovery has no differentiation aids
**OPS observation.** `/courses` offers two cards, no filtering, no sort, no prerequisites, no difficulty/commitment calibration, and no course-comparison affordance. The two courses are distinguished only by accent color and a one-line subtitle.

**Benchmark comparison.** Brilliant's catalog groups by subject and shows course scope; Khan communicates prerequisites and unit sequencing. Even with few courses, both communicate *which to take first and why*.

**Why it matters.** With two courses this is tolerable; as OPS grows it becomes the primary usability bottleneck. Even now, the lack of a stated prerequisite for "Investment Foundations" (which is thematically dependent on Finance Foundations) is a small but real orientation gap.

**Evidence.** `app/(learning)/courses/page.tsx` hardcodes two cards; no filter/sort state; `CourseCard` has no prerequisite field.

**Severity:** Medium **Priority:** P2 **Effort:** Small **Expected impact:** Medium
**Recommendation.** Add a one-line prerequisite/audience line per card ("Take Finance Foundations first") and a lightweight compare affordance. Defer real filtering until >5 courses. Do not invest in a faceted filter UI now (YAGNI for two courses).

### 6.2 Visual-system gaps

#### 6.2.1 Excessive tiny monospace labels in tooling & stub pages
**OPS observation.** IBM Plex Mono is used pervasively as **9–10px uppercase `tracking-[0.18em]`** metadata in `/studio` ("STUDIO / Portfolio workspace · concept", panel headers), `/filings` ("04 / Filing reader · concept", "Concept preview", "Investor lens"), and the lesson stub template (breadcrumb, status pills, section labels). This is precisely the "excessive monospace usage" and "tiny low-contrast gray text" the `AGENTS.md` brief warns against.

**Benchmark comparison.** Apple reserves monospace for genuinely data-like content (specs, technical readouts) and never for primary section eyebrows at 9px. Brilliant uses readable sans labels throughout. Khan avoids micro-type entirely.

**Why it matters.** At 9–10px on a dark surface, tracked-uppercase mono is near the legibility floor and reads as "terminal cosplay" rather than premium. It also visually *lowers* the perceived importance of the very sections it labels.

**Evidence.** Repository: `studio/page.tsx` `text-[9px]`/`text-[10px]`; `filings/page.tsx` `text-[9px]`; `lessons/[lessonSlug]/page.tsx` `text-[10px]`; `ops-caption`/`ops-eyebrow` defined as mono.

**Severity:** Medium **Priority:** P1 **Effort:** Small **Expected impact:** Medium
**Recommendation.** Floor all labels at **12px**, retire mono for everything except genuine numeric/code readouts and spec-style data tables, and convert section eyebrows to small-caps or regular-case sans. Reserve `font-mono` for the inside of interactive financial widgets (tabular figures, formula inputs) — which is exactly where it currently works well.

#### 6.2.2 Inconsistent art direction between marketing, lessons, and tooling
**OPS observation.** Three distinct visual registers coexist without a bridging grammar: (1) the dark, cinematic, chart-integrated homepage; (2) the light, editorial, Fraunces-headed lesson pages; (3) the dark "glass-panel + terminal-grid dashboard" of Studio/Filings. The third register leans on `.glass`/`.glass-panel` + `.terminal-grid` and reads as a generic AI-dashboard aesthetic — the very thing `AGENTS.md` says to avoid ("no generic AI-generated design language," "no excessive glassmorphism").

**Benchmark comparison.** Apple holds one compositional grammar across homepage and product pages (full-bleed tile → chapter nav → reasons grid), so every page feels like the same product. Brilliant's marketing and lesson interiors share one playful-but-consistent illustration system.

**Why it matters.** The register shift homepage→lesson is acceptable (marketing vs. learning). The shift homepage→Studio/Filings is jarring because the tooling looks like a different, less polished product. This fragments brand perception (Category A).

**Evidence.** `globals.css` `.glass`, `.glass-panel`, `.terminal-grid`, `.ops-interactive-frame` vs. the editorial `.hp-paper-*` and `.ops-display` (Fraunces) lesson register.

**Severity:** Medium **Priority:** P1 **Effort:** Medium **Expected impact:** Medium
**Recommendation.** Pick *one* shared surface language for tools that derives from the lesson "interactive frame" (which already exists and looks intentional), and drop the `.terminal-grid` + heavy `.glass` dashboard motif. Tools should look like the lessons' interactive widgets scaled up — that is OPS's own visual identity, not a borrowed dashboard template.

#### 6.2.3 Secondary metadata tier leans on low-contrast gray
**OPS observation.** Course/curriculum metadata uses `text-[#555A61]` and `text-slate-400/500` for "X lessons · Y hours," path-step notes, and inactive rail links. On the light theme these are readable but tertiary; on dark marketing sections `text-slate-400/500` is used for stage counters and notes.

**Benchmark comparison.** Apple uses near-black or pure-white for nearly all type and reserves gray strictly for legal footnotes; Brilliant keeps secondary copy at a higher contrast than OPS's `#555A61`.

**Why it matters.** `AGENTS.md` explicitly calls out "no tiny low-contrast gray text." The current secondary tier is borderline — readable but faint enough to read as hesitant.

**Evidence.** `components/courses/CourseRail.tsx`, `ModuleSection.tsx` (`text-[#555A61]`); `courses/page.tsx` path/sequence notes.

**Severity:** Low **Priority:** P2 **Effort:** Small **Expected impact:** Low–Medium
**Recommendation.** Promote the secondary tier one step (e.g., `#555A61` → `#3F434B` on light; `slate-400` → `slate-300` on dark) so secondary copy is clearly readable, not whisper-gray.

### 6.3 Page-level composition problems

#### 6.3.1 Built lessons are element-dense; the next action is not always dominant
**OPS observation.** The portfolio-risk lesson presents, in one vertical flow: a sticky progress rail, notation guide, 6.2.1–6.2.10 "Acts," inline `BlockMath` formulas, a step-through stepper, a raw-vs-weighted matrix diagram, a worked example table, two fillable worksheets, an exploratory drag curve, a caution table, a final calculation, an optional Q&A accordion, a 6-question mastery check, a 7-point summary, and sources. Many of these blocks carry similar visual weight.

**Benchmark comparison.** Brilliant establishes one dominant task per viewport (one prompt, one interaction). Apple's product pages enforce one headline + one visual + one CTA pair per tile. OPS gives nearly equal emphasis to a worksheet, a diagram, and a worked table in proximity, so the *intended next action* (e.g., "now drag the curve") competes with surrounding content.

**Why it matters.** Cognitive load (Category I) rises when hierarchy is flat; the user has to decide what to focus on next. This is the gap between OPS's *content* quality (high) and its *interface* quality (good, not top-tier).

**Evidence.** Live `/lessons/portfolio-risk-covariance-correlation` section density; repository `components/lessons/portfolio-theory/` block sequencing.

**Severity:** Medium **Priority:** P1 **Effort:** Medium **Expected impact:** Medium
**Recommendation.** Per `Act`, establish a single dominant element (the interactive or the key formula) and visually subordinate the rest (smaller, dimmed, or collapsed-by-default). Reuse the existing `InteractiveFrame` to give each interactive a clear "primary action" affordance and push explanatory tables into a secondary, opt-in layer.

#### 6.3.2 Homepage hero: copy and chart are now compositionally unified, but the driver bands still risk competing
**OPS observation.** Recent hero work (visible in the repo and live) raised the chart field and added a cyan-navy atmospheric bridge so text and chart read as one scene — this is a real improvement and the hero now approaches its "Apple-quality composition with finance charts" goal (Fig. 1). Residual risk: three colored driver bands (green/purple/gold) plus the cyan line plus the bridge can still sum to four hues in the lower hero, which works against the "cyan is the one focal accent" rule in `AGENTS.md`.

**Benchmark comparison.** Apple's hero tiles enforce a single dominant visual element and a single accent. Brilliant's hero uses one illustration, not four colored regions.

**Why it matters.** With four colors active, the eye isn't sure whether the line, the bands, or the headline is the subject — slightly weakening hierarchy at the most important moment.

**Evidence.** `HeroChapter.tsx` driver-band palette (`#36a083` / `#8275c4` / `#c89a3a`) + cyan line + cyan-navy bridge.

**Severity:** Low **Priority:** P2 **Effort:** Small **Expected impact:** Medium
**Recommendation.** Either desaturate the three bands one more notch so they read as a single atmospheric gradient (hue shifts within one low-saturation family) or sequence their reveal so only one is emphasized at a time. Keep the cyan line as the unambiguous focal accent.

#### 6.3.3 Course-detail hero is strong; the curriculum list below is uniform
**OPS observation.** `/courses/finance-foundations` has an excellent hero (course-color radial, breadcrumb, title/lead, Hours/Modules/Lessons stats, bespoke `CourseFlowVisual`) and a sticky `CourseRail`. But the curriculum list below renders every module with near-identical treatment, so the *capstone* (Module 10) and the *prerequisite* (Module 1) look the same weight, and stub modules are not visually distinguished from complete ones except via a small pill.

**Benchmark comparison.** Apple's product pages use the chapter nav to signal "where you are." Khan unit lists visually differentiate unit type and completion.

**Why it matters.** A learner can't scan for "what's ready" vs "what's coming" or "where's the payoff."

**Evidence.** `ModuleSection.tsx` uniform treatment; `LessonRow.tsx` distinguishes only via a small status pill.

**Severity:** Medium **Priority:** P1 **Effort:** Small **Expected impact:** Medium
**Recommendation.** Add a subtle module-level state marker (Complete / In progress / Not started / Roadmap) and let the capstone module carry a distinct visual treatment so the course's payoff is obvious.

### 6.4 Implementation defects

#### 6.4.1 Mobile overflow: fixed-`min-width` lesson tables and SVGs
**OPS observation.** Many lesson components set fixed minimum widths — `min-w-[680px]`, `min-w-[640px]`, `min-w-[560px]`, `min-w-[520px]`, `min-w-[440–480px]` — on tables and SVG diagrams, inside a `max-w-7xl` content column **without an `overflow-x-auto` scroll wrapper**. On a 390px phone these will clip or bleed horizontally.

**Benchmark comparison.** Apple/Brilliant/Khan all avoid horizontal overflow; tables scroll within a visible container or reflow.

**Why it matters.** This is the most likely *broken* state a mobile beta tester hits, and clipped financial tables directly impair the learning that is OPS's strength.

**Evidence.** Repository: `min-w-[680px]` (`NorthstarCase`), `min-w-[640px]` (`Lesson4_5/4_6`, `FixedIncomeRoadmap`, `LiquidityStressSimulator`, `ModuleSevenConceptMap`), `min-w-[560px]` (`BendingPriceCurve`, `DurationBalanceScale`, `CorporateYieldWaterfall`, `ForwardRateLadder`, `DebtEquityRiskSpectrum`), and many `min-w-[440–480px]` tables across `components/lessons/`.

**Severity:** Critical **Priority:** P0 **Effort:** Small–Medium **Expected impact:** High
**Recommendation.** Wrap every fixed-`min-w` table/SVG in a styled `overflow-x-auto` container with a subtle "scroll" affordance (edge fade or a small "↔ scroll" hint), and for the most common tables build a stacked/reflowed mobile variant. This is a sweep, not a redesign — one shared `<ScrollTable>`/`<ScrollFigure>` wrapper handles most cases.

#### 6.4.2 No skip-link, no custom 404 / loading / error pages
**OPS observation.** No "skip to content" link exists anywhere. There are no `loading.tsx`, `error.tsx`, or `not-found.tsx` files under `app/`, so Next.js serves default (unstyled, off-brand) states. Course/lesson pages call `notFound()` with no custom handler.

**Benchmark comparison.** Baseline expectation on any premium site (Apple, Brilliant, Khan all brand their 404/loading states and provide skip-to-content for a11y).

**Why it matters.** An off-brand default 404/loading state is a visible polish gap; the missing skip-link is a real keyboard/screen-reader accessibility defect (Category N).

**Evidence.** `app/` has no `loading.tsx`/`error.tsx`/`not-found.tsx`; `SiteShell.tsx`/`layout.tsx` have no skip-link.

**Severity:** High (a11y) / Medium (polish) **Priority:** P1 **Effort:** Small **Expected impact:** Medium
**Recommendation.** Add a visually-hidden-until-focused skip link to `SiteShell`; add branded `app/not-found.tsx`, `app/loading.tsx` (for Suspense), and a lesson-level `error.tsx` so a failing interactive degrades gracefully.

#### 6.4.3 ~20 orphaned marketing components (dead code)
**OPS observation.** `components/marketing/` contains ~20 components not imported by `HomePage.tsx` or anywhere else (`MarketHero`, `HeroObject`, `FloatingArtifact`, `PriceSurface`, `PriceBusinessChapter`, `CompanyXray`, `MoneyMachine`, `FilingCashFlowChapter`, `FilingReaderTeaser`, `CourseMapCTA`, `TimeValueObject`, `TimeBridge`, `TimeValuationChapter`, `ValuationGravity`, `PortfolioObject`, `PortfolioConstellation`, `PortfolioMacroChapter`, `MacroControlRoom`, `ScrollScene`, `ProgressIndicator`) — legacy from an earlier multi-chapter homepage iteration.

**Benchmark comparison.** N/A (internal hygiene), but dead code inflates bundle auditability and risks accidental re-use of deprecated patterns.

**Why it matters.** Maintenance burden, confusing for contributors, slight bundle/lint noise. Not user-visible, but a credibility signal in the codebase review.

**Evidence.** Repository grep: none of the 20 are imported in `app/`, `components/`, `lib/`, or `data/`.

**Severity:** Low **Priority:** P2 **Effort:** Small **Expected impact:** Low
**Recommendation.** Delete or move to an `_archive/` directory. Keep only the six rendered chapters plus shared primitives.

#### 6.4.4 Suspected: KaTeX SSR cost & large lesson bundles unmeasured
**OPS observation.** Formulas render via `katex.renderToString` server-side (`components/ui/Math.tsx`) and `MathText` auto-wraps subscript/superscript patterns in prose. Real lessons are large single components (e.g., `Lesson2.tsx` ~1153 lines; `Lesson5_6` ~2300 lines).

**Benchmark comparison.** Apple/Brilliant aggressively code-split and measure; OPS's per-lesson bundle size and KaTeX serialization cost are unmeasured here.

**Why it matters.** Potentially a first-input / TBT cost on lesson entry (Category O). **Flagged as suspected, not confirmed** — no runtime measurement was possible this session.

**Evidence.** `components/ui/Math.tsx` (KaTeX), `components/ui/MathText.tsx`; large lesson files in `components/lessons/`.

**Severity:** Low–Medium (suspected) **Priority:** P2 **Effort:** Small (to measure) **Expected impact:** Medium
**Recommendation.** Measure lesson-route JS payload and KaTeX cost in Lighthouse; if heavy, lazy-mount interactives and memoize `MathText` parsing. No action without measurement.

---

## 7. Homepage comparison

| Dimension | OPS (Fig. 1) | Benchmark behavior | Verdict / gap |
|---|---|---|---|
| First viewport | Hero headline ("Decode the market beneath the chart.") over an integrated chart field with a cyan-navy atmospheric bridge; 2 CTAs. | Apple: one product, one 2-line headline, consistent CTA pair. Brilliant: one proposition, one branching CTA. | **Close to target.** Hierarchy and CTA grammar are sound. |
| Value proposition | Clear and specific ("Learn how businesses, filings, cash flows, valuation, and portfolios connect"). | Brilliant leads with benefit + authority ("tutor … MIT/Harvard"). | OPS is clear but **omits authority up front** (no "built on MIT 15.401" in the hero) — a missed credibility cue Brilliant exploits. |
| Navigation | Sticky header (Courses/Filings/Studio + "Enter the studio"). Transparent over hero, solid on scroll. | Apple: persistent global nav + chapter nav on long pages. | Good. OPS header is clean. |
| Hero composition | Chart-lifts-to-reveal-drivers; one continuous scene after recent revisions. | Apple: one dominant visual element, one accent. | **Approaches "Apple-quality composition with finance charts."** Residual: 4 active hues (3 bands + line) slightly diffuse focus (see 6.3.2). |
| Typography | `hp-hero clamp(46–110px)` Inter 600; large, readable. | Apple: even larger display type, product-name-as-hero. | Competitive on the marketing surface. |
| Charts & visuals | Integrated (chart *is* the hero). | — | **Strength.** This is the differentiator and it works. |
| Motion | Scroll-driven chapters; reduced-motion respected. | Apple: scroll storytelling with restraint. | Competitive. |
| Section pacing | Six chapters, one idea each. | Apple: one idea per tile. | Good. |
| CTAs | "Explore courses" / "Enter the studio." | Apple: "Learn more"/"Buy" consistent pair. | **Risk:** "Enter the studio" resolves to a mock (6.1.1). |
| Final conversion | Centered CTA, one cyan accent line ("Don't memorize finance. Understand how it connects."). | Apple: "reasons to buy" then a final CTA tile. | Good, restrained. |
| Mobile | Hero/chapters fluid via `clamp()`; sticky chapters long but functional. | Apple: full mobile adaptation with re-composed sections. | Acceptable; not deeply re-composed, mostly reflowed. |

**Does the homepage achieve "Apple-quality composition with finance charts"?** **Mostly yes on the marketing surface** — it is the strongest part of OPS. It falls short of Apple specifically in (a) accent discipline (one focal hue) and (b) the *promise→delivery* chain: Apple never links a hero CTA to an empty page; OPS's "Enter the studio" does. Fixing 6.1.1 is what closes the remaining gap to Apple on the homepage specifically.

---

## 8. Course-discovery comparison

| Dimension | OPS (`/courses`, Fig. 2) | Brilliant | Khan |
|---|---|---|---|
| Hierarchy | Title + 3-step path + 2 cards + sequence. One dominant idea per card. | Subject → courses, progressive disclosure. | Subject → course → units. |
| Course differentiation | Accent color + subtitle only; no prerequisite/audience line. | Scope + audience implied by subject grouping. | Prerequisites stated; unit order explicit. |
| Prerequisite communication | Implicit (static 1→2→3 graphic). | By subject grouping. | Explicit. |
| Progress visibility | None on cards/course hero. | "Continue" prominent. | Course + mastery progress prominent. |
| Descriptions | Good: outcomes list + hours/modules/lessons. | Concise benefit copy. | Detailed unit-level copy. |
| Density | Low (2 cards) — appropriate but thin. | Medium, scannable. | Dense but legible. |
| Visual consistency | Consistent card treatment (good). | Consistent illustration system. | Consistent utilitarian style. |
| Next action | "Explore" per card; "Start here" badge on Finance Foundations. | Clear single next step. | Clear. |
| Honesty of counts | **Overstated** (see 6.1.2) — "55 lessons" includes stubs; Investment Foundations = 1/1. | Honest. | Honest. |

**Verdict.** OPS's card design is clean and its outcome-list pattern is better than Brilliant's terse copy. The gaps are *content honesty* (6.1.2), *no progress* (6.1.3), and *no prerequisite line* (6.1.4) — all transferable from Brilliant/Khan without imitating their visual style.

---

## 9. Lesson-experience comparison

Using OPS's `/lessons/portfolio-risk-covariance-correlation` (a real, fully built lesson) as the sample.

| Dimension | OPS (built lesson, Fig. 4) | Brilliant (positioning) | Khan (documented) |
|---|---|---|---|
| Lesson opening | Breadcrumb + module rail + objectives + notation guide. | Single interactive prompt. | Video/article + practice. |
| Objective clarity | Explicit, numbered objectives. | Implicit (task-driven). | Explicit "you'll learn." |
| Content chunking | "Acts" (6.2.1–6.2.10) — strong. | Bite-sized steps. | Video segments + practice. |
| Explanations | Prose + definition cards; serious tone. | Visual-first, minimal text. | Video + article. |
| Formulas | **Real KaTeX** (`σ²_P = w²_A σ²_A + …`), step-through derivation. | Minimal symbolic math. | KaTeX-like rendering. |
| Examples | Worked GM/Motorola historical example, fully computed. | Interactive puzzles. | Worked examples + practice. |
| Diagrams | Hand-rolled SVG (variance matrix, opportunity curve). | Interactive illustrations. | Static + video. |
| Interaction | Fillable worksheets, drag-driven curve, steppers. | Core to the product. | Practice problems. |
| Exercises | Mastery check (6Q, "pass 4 of 6"), worksheets. | Continuous. | Practice sets. |
| Feedback | Correct/incorrect + explanations; "Check" buttons. | Immediate, contextual. | Hints + solutions. |
| Summary | 7-point summary + sources. | Brief. | Article recap. |
| Progression | Module rail with prev/next + completion gating. | Course path. | Mastery-based. |
| Cognitive load | **Higher** — many equal-weight elements (see 6.3.1). | Low (one task/screen). | Medium. |

**Where OPS is educationally strong:** rigor, symbolic math, worked computation, source attribution — areas Brilliant deliberately avoids and Khan handles more passively (video/article). OPS's interactive derivation of the two-asset variance is a genuinely superior way to teach that concept.

**Where the interface weakens the material:** flat hierarchy (6.3.1) raises cognitive load; bimodal stubs (6.1.2) break trust; mobile table overflow (6.4.1) can clip the very tables that carry the computation. These are the three things that separate OPS's *content* quality (top-tier) from its *experience* quality (good).

---

## 10. Filings and Studio assessment

| Criterion | Studio (`/studio`, Fig. 5) | Filings (`/filings`, Fig. 6) |
|---|---|---|
| Integrated with the course product? | **No** — presented as a peer product but contains no usable workflow; links out to courses. | **No** — a mock 10-K with static excerpts. |
| Clear practical-learning pathway? | Promised ("use the course lessons … then return here") but not realized. | Promised ("hover-to-explain, pin sections") but not realized. |
| Understandable to new users? | Labels are clear, but every panel is an empty dashed box. | The 4-line "investor lens" framing is genuinely instructive as a *concept*. |
| Reinforces OPS's unique positioning? | Could — a real portfolio workspace would be the differentiator. | Could — a real 10-K reader is exactly the "source code" idea the homepage sells. |
| Polished enough to be a differentiator? | **No** — reads as a placeholder. | **No** — reads as a mock. |
| Design quality vs. rest of OPS | **Lower** — generic glass/terminal dashboard aesthetic (6.2.2). | **Lower** — heavy 9px mono labels (6.2.1). |

**Verdict.** Both features are the right *ideas* for OPS's positioning and are the natural payoff of the homepage's narrative. Both are currently *liabilities* because they present as products but behave as mockups. The single highest-leverage product decision in this audit is to either build one real workflow in each (the mechanics already exist inside lessons) or honestly relabel them as coming/preview (see 6.1.1).

---

## 11. Responsive and mobile assessment

| Aspect | Finding | Type |
|---|---|---|
| Hierarchy | Hero/chapters reflow via `clamp()`; course/lesson grids collapse at `lg:`/`sm:`. | Responsive (acceptable). |
| Clipping/overflow | **Fixed `min-w-[440–680px]` tables/SVGs in lessons overflow on ≤480–700px** without scroll wrappers (6.4.1). | Implementation defect (mobile). |
| Typography scaling | Headings floor at readable sizes (`hp-hero` 46px, `course-hero-title` 46px). | Responsive (good). |
| Chart behavior | Lesson SVGs are fixed-width (see overflow). Marketing SVGs scale. | Content/implementation dependent. |
| Control density | Interactive widgets (sliders, inputs) have `aria-label`s and adequate targets; dense worksheets may crowd on phones. | Content dependent. |
| Navigation | Hamburger (`md:hidden`) toggles an inline menu; `aria-expanded` present. | Responsive (good). |
| Touch usability | `focus-visible` rings present; button targets generally adequate. | Responsive (good). |
| Sticky sections | `560vh`/`440vh` chapters are long but functional on mobile. | Acceptable. |
| Persistent UI | Header sticky at 68px; `scroll-mt` offsets module anchors. | Good. |
| Visual continuity | Dark→light theme switch between marketing and learning is intentional and works. | Good. |

**Biggest mobile risk:** lesson table/SVG overflow (6.4.1). Everything else is acceptable-to-good for a beta.

---

## 12. Accessibility and implementation quality

### 12.1 Observed
- **Color contrast:** Dark theme primary copy (`#F5F5F7`/`#D2D2D7` on `#05070d`) is high-contrast. Light theme maps the slate tiers to documented ratios (secondary ~13:1, tertiary ~7.5:1 AAA) and remaps accents to AA siblings. *(No automated WCAG run performed; these are the token-level facts.)*
- **Keyboard/focus:** `focus-visible:ring-2 ring-accent-cyan/50` applied on `Button`, `CourseCard`, `LessonRow`, and most lesson controls.
- **Reduced motion:** `useReducedMotion()` honored across components; global `prefers-reduced-motion` block zeroes durations.
- **Semantics:** Landmarks present; charts use `role="img"` + descriptive `aria-label`; decorative SVGs `aria-hidden`; heading hierarchy clean (one `h1`, then `h2`/`h3`).
- **Inputs:** number/range inputs carry `aria-label`.
- **No skip-link** (defect, 6.4.2). **No custom 404/loading/error** (defect, 6.4.2).

### 12.2 Suspected (not confirmed without a browser/automation)
- Lesson-route JS payload / KaTeX SSR cost (6.4.4) — possible TBT/FCP cost; measure before acting.
- Whether the sticky `CourseRail` "current module" indicator is announced to screen readers as navigation context.
- Whether long sticky-scroll chapters (CashFlowValue 560vh) create landmarks/region labels for assistive tech.

### 12.3 Implementation polish
- Inline-SVG-only (no `<img>`) means zero image weight and crisp visuals at any DPI — a real strength.
- Fonts via `next/font` with `display: swap` — correct.
- Static generation (`generateStaticParams`) for course/lesson routes — fast, cacheable.
- Orphaned code (6.4.3) and the dashboard aesthetic (6.2.2) are the main polish drags.

**Formal WCAG claim:** none made. A real axe/Lighthouse pass is recommended before launch.

---

## 13. Priority action plan

### 13.1 Before beta
| Action | Reason | Impact | Effort | Relevant pages |
|---|---|---:|---|---|
| Wrap all fixed-`min-w` lesson tables/SVGs in `overflow-x-auto`; build a stacked mobile variant for the common tables | Mobile overflow is the most likely broken state | High | Small–Medium | All lessons |
| Make course/lesson counts reflect *registered* lessons; convert "In development" stubs to purposeful "roadmap" cards that link to a real related lesson | Honesty of the "55 lessons" contract | High | Medium | `/courses`, `/courses/[slug]`, lesson stub |
| Relabel or build-out Studio & Filings (stop shipping dashed empty "interactive panel" boxes as a product) | Prevent hero→mock credibility collapse | High | Medium–Large | `/studio`, `/filings` |
| Add skip-link; add branded `not-found.tsx` / `loading.tsx` / lesson `error.tsx` | Baseline a11y + polish | Medium | Small | Global |
| Floor all labels at 12px; retire mono except for real data readouts | Removes the "terminal cosplay" micro-type | Medium | Small | `/studio`, `/filings`, lesson stubs |

### 13.2 First post-beta design pass
| Action | Reason | Impact | Effort | Relevant pages |
|---|---|---:|---|---|
| Add course-level progress (localStorage-derived) on `CourseCard`, course hero, and a header "Continue learning" | Core learning-product affordance vs Brilliant/Khan | High | Medium | `/courses`, `/courses/[slug]`, header |
| Re-balance built-lesson hierarchy: one dominant element per Act; subordinate tables/diagrams | Lower cognitive load | Medium | Medium | All built lessons |
| Unify tool surface language with the lesson `InteractiveFrame`; drop `.terminal-grid`/heavy `.glass` dashboard motif | One product, one visual identity | Medium | Medium | `/studio`, `/filings` |
| Add module-level state markers (complete/in-progress/roadmap) + distinct capstone treatment | Orientation within a 40-hour course | Medium | Small | `/courses/[slug]` |
| Promote secondary metadata one contrast step | Address whisper-gray tier | Low–Medium | Small | Course pages, rails |
| Add an "authority" line (MIT 15.401 lineage) to the homepage hero/CTA area | Capture the credibility cue Brilliant exploits | Medium | Small | `/` |

### 13.3 Longer-term product improvements
| Action | Reason | Impact | Effort | Relevant pages |
|---|---|---:|---|---|
| Build Investment Foundations to parity with Finance Foundations | Today it is 1 module/1 lesson — a shell | High | Large | `/courses/investment-foundations` |
| Build one *real* workflow each in Studio and Filings (mechanics exist in lessons) | Realize the differentiator the homepage sells | High | Large | `/studio`, `/filings` |
| Cross-device progress (account/persistence beyond localStorage) | Learner retention | Medium | Large | Progress system |
| Measure and tune lesson bundle size + KaTeX cost | Possible performance drag | Medium | Small (to measure) | Lesson routes |
| Retire ~20 orphaned marketing components | Hygiene/contributor clarity | Low | Small | `components/marketing/` |
| When >5 courses: lightweight filtering/compare | Discovery at scale | Medium | Medium | `/courses` |

---

## 14. Design principles OPS should adopt

1. **One dominant element per viewport.** *(Apple, Brilliant.)* Each lesson Act and each homepage chapter should have a single focal element; everything else is subordinate. *OPS application:* demote surrounding tables/diagrams around each interactive. *Don't copy:* Apple's full-bleed product photography.
2. **A consistent CTA grammar.** *(Apple.)* Two-link pattern, same verbs, same placement everywhere. *OPS application:* standardize "Start/Continue" + "Browse curriculum" across course and lesson entry. *Don't copy:* "Buy"-style commerce verbs.
3. **Credibility up front.** *(Brilliant, Khan.)* Surface authority at the first moment. *OPS application:* "Built on MIT 15.401" near the hero; authorship/sources visible. *Don't copy:* Brilliant's mascot/tutor framing.
4. **Progress is visible and resume-able.** *(Khan.)* The learner always knows where they are. *OPS application:* course-level progress bar + "Continue learning." *Don't copy:* energy points/streaks currency (off-brand for OPS's serious tone).
5. **Honest counts and honest stubs.** *(All.)* Never advertise depth that doesn't resolve. *OPS application:* registered-lesson counts; purposeful roadmap cards. *Don't copy:* nothing — this is a principle, not a style.
6. **Reserve monospace for data, not labels.** *(Apple.)* Mono = genuine tabular/code content. *OPS application:* labels become sans; mono stays inside financial widgets. *Don't copy:* "terminal" aesthetics as decoration.
7. **One accent, used as a signal.** *(Apple.)* Cyan should mean "the focal/active thing." *OPS application:* hold cyan to the price line + active states; keep band hues desaturated. *Don't copy:* multi-accent marketing.
8. **Tools should look like the lessons scaled up.** *(Internal coherence.)* OPS's `InteractiveFrame` is its own identity. *OPS application:* build Studio/Filings from that surface, not from a generic dashboard kit. *Don't copy:* glassmorphism dashboard templates.
9. **Mobile is a scroll/reflow citizen, not an afterthought.** *(All.)* Tables and figures must scroll or reflow, never clip. *OPS application:* the `ScrollTable`/`ScrollFigure` wrapper (6.4.1). *Don't copy:* desktop-optimised dense tables.
10. **Motion explains, never decorates.** *(OPS's own brief.)* Keep cause-and-effect animation; prune purely ambient loops. *OPS application:* keep cash-flow collapse/diversification smoothing; reconsider always-on background loops behind dense text. *Don't copy:* Apple's cinematic product films (inappropriate for learning).

---

## 15. Recommended target state

After the proposed revisions, OPS should feel like **a serious, cinematic finance-learning product whose every surface honors the same promise the hero makes.**

- **Homepage:** unchanged in concept — still the dark, chart-integrated, scroll-driven story — but with one disciplined accent (cyan as the single focal hue; bands as a low-saturation atmospheric family) and a credibility line ("Built on MIT 15.401") near the CTAs. The "Enter the studio" CTA resolves to something real.
- **Course discovery:** two honest cards with real (registered-lesson) counts, a prerequisite line, and a course-level progress bar; a header "Continue learning" that deep-links to the last lesson.
- **Lesson pages:** the same rigorous content, but each Act has one dominant element; tables and figures scroll cleanly on mobile; stubs are roadmap cards that route to a real related lesson; module state is visible at a glance; the capstone module is clearly the payoff.
- **Filings:** one real workflow — open a real 10-K section, surface two "investor lens" annotations — styled like the lesson `InteractiveFrame`, not a dashboard mock. Honest "preview" framing where not yet complete.
- **Studio:** one real workflow — e.g., drag-to-allocate a small portfolio with live volatility — reusing the portfolio-risk lesson's mechanics. Honest framing elsewhere.
- **Mobile:** no clipped tables; legible ≥12px labels; reflowed worksheets; functional sticky chapters.
- **Overall brand perception:** *the finance course that teaches you to read the market like an investor* — credible, restrained, data-driven, and finished to the edges. The gap to Apple closes on the marketing surface; the gap to Brilliant/Khan closes on product structure and progression; OPS's finance-specific identity is *strengthened*, not diluted, because the tools finally deliver what the lessons teach.

---

## 16. Appendix

### 16.1 Reviewed URLs
**OPS (live):** `/`, `/courses`, `/courses/finance-foundations`, `/courses/investment-foundations`, `/lessons/portfolio-risk-covariance-correlation`, `/studio`, `/filings`.
**OPS (repository):** `app/**`, `components/layout/SiteShell.tsx`, `components/layout/SiteHeader.tsx`, `components/marketing/HomePage.tsx` (+ 6 chapter components), `components/courses/*`, `components/ui/{Math,MathText}.tsx`, `components/lessons/**` (sampling), `lib/lessonRegistry.ts`, `data/courses/courses.ts`, `data/lessons/lessons.ts`, `app/globals.css`, `tailwind.config.ts`.
**Benchmarks (live):** `https://brilliant.org/`, `https://www.apple.com/`, `https://www.apple.com/iphone/`, `https://www.khanacademy.org/`, `https://www.khanacademy.org/economics-finance-domain/core-finance`.

### 16.2 Figure reference index (textual; no screenshots captured)
- **Fig. 1** — OPS homepage hero & chapters: `https://ops-lovat.vercel.app/`
- **Fig. 2** — OPS course catalog: `https://ops-lovat.vercel.app/courses`
- **Fig. 3** — OPS Finance Foundations curriculum (stubs visible): `https://ops-lovat.vercel.app/courses/finance-foundations`
- **Fig. 4** — OPS real lesson (portfolio risk): `https://ops-lovat.vercel.app/lessons/portfolio-risk-covariance-correlation`
- **Fig. 5** — OPS Studio concept mock: `https://ops-lovat.vercel.app/studio`
- **Fig. 6** — OPS Filings concept mock: `https://ops-lovat.vercel.app/filings`
- **Fig. 7** — Brilliant homepage (positioning, catalog, credibility, mobile): `https://brilliant.org/`
- **Fig. 8** — Apple homepage tile grammar + iPhone chapter nav: `https://www.apple.com/`, `https://www.apple.com/iphone/`
- **Fig. 9** — OPS typography tokens (repo): `app/globals.css` (`.hp-*`, `.course-*`, `.ops-*`)
- **Fig. 10** — OPS fixed-min-width lesson tables (repo): `components/lessons/**` (`min-w-[440–680px]`)

### 16.3 Viewports assessed
1440×900, 1280×800, 1024×768 (via repo breakpoint analysis); 390×844 (via fixed-width/overflow analysis). No rendered measurement.

### 16.4 Inaccessible / limited pages
- **Khan Academy** homepage and course pages: client-rendered SPA; returned no structured content to a text fetch. Khan findings are tooling-limited and should be re-verified with a browser.
- **Brilliant** interactive lesson interiors: behind authentication; not inspected first-hand. Brilliant learning-interior claims rest on its marketing framing + OPS's own comparable lesson.
- **No screenshots** were captured (no browser/screenshot tool available this session).

### 16.5 Test limitations
- No rendered pixel measurement; visual judgments inferred from code + content structure.
- No automated accessibility run (axe/Lighthouse/WCAG).
- No runtime performance measurement (bundle size, KaTeX cost, FCP/LCP/TBT).
- Mobile behavior inferred from responsive class analysis, not device rendering.

---

*End of report. No implementation files were modified in the production of this audit.*
