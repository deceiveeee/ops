# Competitive Visual Audit — Evidence Index

**Date captured:** 2026-07-25
**Capture method:** Playwright (chromium, headless), realistic Chrome UA, `domcontentloaded` + `networkidle` settle, font-ready + scroll-to-trigger-lazy-load + KaTeX/animation settle, `fullPage` PNG at each viewport.
**Viewports:** desktop 1440×900 · tablet 1024×768 · mobile 390×844.
**Analysis method:** every screenshot below was analyzed with `zai-mcp-server analyze_image`; two additional direct comparisons were run with `ui_diff_check` (noted inline). Compressed `_small.jpg` copies were used for any PNG that exceeded the vision tool's 5 MB limit (see `analysis-manifest.csv`).
**Report:** `docs/audits/ops-competitive-visual-audit.md`

> Note: `ops/homepage-desktop.png` is a **superseded duplicate** from an earlier test capture (12.2 MB, 2880-wide 2×-DPR). It is not part of the 57-screenshot set; use `ops-home-desktop.png` instead.

---

## Benchmarks

### Apple

| File | URL | Viewport | Vision summary | Report section |
|---|---|---|---|---|
| `benchmarks/apple-home-desktop.png` | https://www.apple.com/ | desktop | SF type, strict grid, one focal point/section, whitespace (not cards) as divider, restrained palette + blue CTAs. | Benchmark observations › Apple |
| `benchmarks/apple-home-tablet.png` | https://www.apple.com/ | tablet | Adapts cleanly to 2-col product grid; proportional type/imagery; no overflow. | Responsiveness baseline |
| `benchmarks/apple-home-mobile.png` | https://www.apple.com/ | mobile | Hamburger nav, single column, full-width imagery, ≥44px CTAs. | Responsiveness baseline |
| `benchmarks/apple-product-desktop.png` | https://www.apple.com/iphone/ | desktop | Full-viewport "chapters"; full-bleed video sections + overlaid text; clear type-size jumps; generous pacing; dark sections for drama. | Benchmark observations › Apple |
| `benchmarks/apple-product-tablet.png` | https://www.apple.com/iphone/ | tablet | Multi-column "lineup" grid; larger type; prominent imagery. | Responsiveness baseline |
| `benchmarks/apple-product-mobile.png` | https://www.apple.com/iphone/ | mobile | Single column; hamburger nav; stacked images; sized touch targets; no overflow. | Responsiveness baseline |
| `benchmarks/apple-typography-desktop.png` | https://www.apple.com/airpods-pro/ | desktop | ~40–48px bold tight-tracked headlines; 14–16px / 60–70ch body; full-bleed + adjacent-type alternation; 40–60px section rhythm; 1–2 accents/section; premium via restraint. | Benchmark observations › Apple |
| `benchmarks/apple-typography-tablet.png` | https://www.apple.com/airpods-pro/ | tablet | Full-bleed imagery scales; type scales up; subtle multi-column for density. | Responsiveness baseline |
| `benchmarks/apple-typography-mobile.png` | https://www.apple.com/airpods-pro/ | mobile | Full-bleed stacking; clear type hierarchy; large tappable buttons. | Responsiveness baseline |

### Brilliant

| File | URL | Viewport | Vision summary | Report section |
|---|---|---|---|---|
| `benchmarks/brilliant-home-desktop.png` | https://brilliant.org/ | desktop | Problem-first visuals (algebra blanks, cursor cues, arrows); green Koji as consistent interactive cue; framed diagrams as focal points; clear primary/secondary CTAs. | Benchmark observations › Brilliant |
| `benchmarks/brilliant-home-tablet.png` | https://brilliant.org/ | tablet | 2-col feature grid; diagrams scale to width; 60–80ch lines; no overflow. | Responsiveness baseline |
| `benchmarks/brilliant-home-mobile.png` | https://brilliant.org/ | mobile | Hamburger nav; full-width stacked cards; enlarged touch targets; type scales down, hierarchy kept. | Responsiveness baseline |
| `benchmarks/brilliant-courses-desktop.png` | https://brilliant.org/courses/ | desktop | Uniform rounded cards, flat color icons, subject color-coding (math/programming/science), consistent title/desc/metadata hierarchy, "NEW" badges, subtle shadow. | Course discovery comparison |
| `benchmarks/brilliant-courses-tablet.png` | https://brilliant.org/courses/ | tablet | Grid → 3 columns; icons/titles scale; spacing retuned. | Responsiveness baseline |
| `benchmarks/brilliant-courses-mobile.png` | https://brilliant.org/courses/ | mobile | Grid → single column; enlarged cards/targets; vertical scroll. | Responsiveness baseline |
| `benchmarks/brilliant-course-desktop.png` | https://brilliant.org/courses/logic/ | desktop | Modular course cards with icon + title + lesson-preview grid; consistent hierarchy; subtle shadow; no placeholders. | Course detail comparison |
| `benchmarks/brilliant-course-tablet.png` | https://brilliant.org/courses/logic/ | tablet | Lesson grid → 4 columns; icons scale; horizontal spacing tightens. | Responsiveness baseline |
| `benchmarks/brilliant-course-mobile.png` | https://brilliant.org/courses/logic/ | mobile | Lesson grid → single column; resized icons/titles; sized targets; no overflow. | Responsiveness baseline |

### Khan Academy

| File | URL | Viewport | Vision summary | Report section |
|---|---|---|---|---|
| `benchmarks/khan-home-desktop.png` | https://www.khanacademy.org/ | desktop | Clean sans-serif hierarchy; persistent top nav; subject grid with color/icon cues; generous whitespace; accessible contrast; prominent role CTAs. | Benchmark observations › Khan Academy |
| `benchmarks/khan-home-tablet.png` | https://www.khanacademy.org/ | tablet | Fixed nav; subject grid reflows tighter; type/spacing tuned for touch; no overflow. | Responsiveness baseline |
| `benchmarks/khan-home-mobile.png` | https://www.khanacademy.org/ | mobile | Single column; stacked subject grid/footer; large "Give now"/"Start for free" targets; clear hierarchy. | Responsiveness baseline |
| `benchmarks/khan-course-desktop.png` | https://www.khanacademy.org/math/algebra | desktop | Left sidebar with unit→lesson indentation + ✓/☐/★ status icons; high-contrast black-on-white; bold units, regular lessons. | Lesson-page-with-sidebar comparison |
| `benchmarks/khan-course-tablet.png` | https://www.khanacademy.org/math/algebra | tablet | Fixed left sidebar + single-column lesson list; clear hierarchy/spacing. | Responsiveness baseline |
| `benchmarks/khan-course-mobile.png` | https://www.khanacademy.org/math/algebra | mobile | Sidebar → hamburger; vertical unit list with mastery %; enlarged lesson targets. | Responsiveness baseline |
| `benchmarks/khan-lesson-desktop.png` | https://www.khanacademy.org/computing/computer-programming/programming | desktop | Centered ~600–700px column; heading→subtopics→blue "Practice" rhythm; high contrast; chunked, consistent, finished. | Lesson content comparison (also `ui_diff_check` reference) |
| `benchmarks/khan-lesson-tablet.png` | https://www.khanacademy.org/computing/computer-programming/programming | tablet | Centered single column; clear headings; consistent "Practice" buttons. | Responsiveness baseline |
| `benchmarks/khan-lesson-mobile.png` | https://www.khanacademy.org/computing/computer-programming/programming | mobile | Single column full-width; full-width practice buttons; no horizontal overflow. | Responsiveness baseline |

---

## OPS

### Homepage — `/`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-home-desktop.png` | desktop | Strong hero (headline + cyan wave + 2 CTAs); but every later section's captions are pale-gray and faint; tiny `Y0–Y4` strip; `15.2%` line-chart caption faint. | OPS findings › Homepage |
| `ops/ops-home-tablet.png` | tablet | Sections stack cleanly; no overflow; line-lengths good; CTAs stack; faint secondary text still readable at this size. | OPS findings › Mobile experience |
| `ops/ops-home-mobile.png` | mobile | Hamburger nav (small target), full-width CTAs; big numbers legible; **bar/line charts tiny, detail lost**; pale-gray subtext low-contrast; hero type oversized. | OPS findings › Mobile experience |

### Courses discovery — `/courses`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-courses-desktop.png` | desktop | Two course cards **don't match** (spacing/padding); generic abstract imagery; faint "Hours/Modules/Lessons" metadata; underlined "Explore" links lack weight; flat cards no shadow. **`ui_diff_check` vs Brilliant: ~65% match.** | OPS findings › Course discovery |
| `ops/ops-courses-tablet.png` | tablet | Cards stack to single column; intact structure; faint disclaimer text. | OPS findings › Mobile experience |
| `ops/ops-courses-mobile.png` | mobile | Single-column stack; full-width CTAs; faint pale-gray metadata; potential short line wrapping. | OPS findings › Mobile experience |

### Course detail — Finance Foundations — `/courses/finance-foundations`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-course-finance-foundations-desktop.png` | desktop | Over-dense module list (~8px spacing); pale-gray low-contrast module numbers; no progress markers; mixed button radii; inconsistent lesson-label styling. | OPS findings › Course detail — Finance Foundations |
| `ops/ops-course-finance-foundations-tablet.png` | tablet | Hero scales; module list too dense; pale-gray numbers/durations reduced contrast; no overflow. | OPS findings › Mobile experience |
| `ops/ops-course-finance-foundations-mobile.png` | mobile | Single column; stats in one row; pale-gray module #s/durations low-contrast; lesson rows may be small touch targets. | OPS findings › Mobile experience |

### Course detail — Investment Foundations — `/courses/investment-foundations`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-course-investment-foundations-desktop.png` | desktop | "1 module · 1 lesson" in large empty gap = unfinished; module card 4px vs lesson card 8px radius; unlabeled yellow dots; "Static mock data" footer. | OPS findings › Course detail — Investment Foundations |
| `ops/ops-course-investment-foundations-tablet.png` | tablet | Sparse curriculum with excess whitespace; inconsistent card radii; faint helper text. | OPS findings › Mobile experience |
| `ops/ops-course-investment-foundations-mobile.png` | mobile | Single column; sparse curriculum; low-contrast helper text; potential radius inconsistency. | OPS findings › Mobile experience |

### Lesson — "What Is Finance?" — `/lessons/what-is-finance-value-time-risk`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-lesson-what-is-finance-desktop.png` | desktop | Content column too wide (~900–1000px); 12px pale-gray breadcrumbs; ~11px diagram labels in "Main Actors" circles; weak table headers; TRY IT(4px) vs Enter the studio(6px). **`ui_diff_check` vs Khan: ~60% match.** | OPS findings › Lesson content |
| `ops/ops-lesson-what-is-finance-tablet.png` | tablet | Sidebar fixed; body line-length OK; diagram labels legible; faint top metadata; no overflow. | OPS findings › Mobile experience |
| `ops/ops-lesson-what-is-finance-mobile.png` | mobile | *(Lower confidence — partly speculative)* Likely sidebar collapse, single narrow column, faint top metadata, marginal small targets. | OPS findings › Mobile experience |

### Lesson — Fixed-Income: IOU Machine + Risk Scanner + pure-discount formula — `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-lesson-fixed-income-iou-riskscanner-purediscount-desktop.png` | desktop | Sound pedagogy; but IOU Machine **monospace labels** + flat buttons (dev-tool feel); Risk Scanner scan-line subtle + small faint risk labels; inconsistent card radii/borders. (Vision claim of "raw LaTeX" was **source-verified false**.) | OPS findings › Interactive diagrams / Formula displays |
| `ops/ops-lesson-fixed-income-iou-riskscanner-purediscount-tablet.png` | tablet | Diagrams fit, no overflow; labels legible; **no raw LaTeX**; sidebar intact. | OPS findings › Mobile experience |
| `ops/ops-lesson-fixed-income-iou-riskscanner-purediscount-mobile.png` | mobile | IOU Machine fits; donut-chart segment labels very small; no raw LaTeX; full-width TRY IT targets. | OPS findings › Mobile experience |

### Lesson — Portfolio covariance & correlation — `/lessons/portfolio-risk-covariance-correlation`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-lesson-portfolio-covariance-desktop.png` | desktop | Formulas render fine (KaTeX); scatter/correlation diagrams have **illegibly small labels/axes**; pale-gray notation guide; inconsistent radii/shadows; sparse unpolished diagrams. | OPS findings › Charts |
| `ops/ops-lesson-portfolio-covariance-tablet.png` | tablet | Diagrams too small, labels illegible; pale-gray "NOTATION GUIDE"; small formula size; long vertical scroll. | OPS findings › Mobile experience |
| `ops/ops-lesson-portfolio-covariance-mobile.png` | mobile | *(Lower confidence — partly speculative)* Scatter plots likely too narrow/illegible; formula sub/superscripts cramped; pale-gray readability poor; small targets. | OPS findings › Mobile experience |

### Lesson — Investment Foundations — `/lessons/if-1-1-how-an-investor-builds-a-philosophy`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-lesson-investment-foundations-desktop.png` | desktop | Excessively long body lines; **dark-gray panels on the light page** with inconsistent radii/borders/shadows; small low-contrast labels in interactives; sparse sidebar; dark-theme residue. | OPS findings › Lesson content |
| `ops/ops-lesson-investment-foundations-tablet.png` | tablet | Interactions fit but small for touch; full-width dark/colored panels; labels legible; some long lines. | OPS findings › Mobile experience |
| `ops/ops-lesson-investment-foundations-mobile.png` | mobile | Single column; dark "CENTRAL QUESTION" panels full-width; legible; small radio-button targets; high vertical scroll. | OPS findings › Mobile experience |

### Studio — `/studio`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-studio-desktop.png` | desktop | Clean dark grid + strong heading; but **six `INTERACTIVE PANEL` placeholders**; "MOCK / STATIC" stats; flat panels no shadow; faint mock-data disclaimer. | OPS findings › Studio |
| `ops/ops-studio-tablet.png` | tablet | 2-col panels; placeholders retained; MOCK/STATIC label visible; possible title truncation. | OPS findings › Mobile experience |
| `ops/ops-studio-mobile.png` | mobile | Panels stack single column; `INTERACTIVE PANEL` placeholders; faint small MOCK label; no overflow. | OPS findings › Mobile experience |

### Filings — `/filings`

| File | Viewport | Vision summary | Report section |
|---|---|---|---|
| `ops/ops-filings-desktop.png` | desktop | `FORM 10-K — MOCK PREVIEW` + "Static mock data" footer; annotation features described but not visually shown; large empty space; disconnected floating "Open the course" button. | OPS findings › Filings |
| `ops/ops-filings-tablet.png` | tablet | Document-map vs mock-preview 2-col; clear labeling; possible column-balance imbalance. | OPS findings › Mobile experience |
| `ops/ops-filings-mobile.png` | mobile | Single-column stack; clear MOCK labels; good contrast; no overflow; small hamburger target. | OPS findings › Mobile experience |

---

## Artifacts in this directory

- `benchmarks/` — 27 benchmark PNGs (+ 2 `_small.jpg` compressed copies of oversized Apple pages).
- `ops/` — 30 OPS PNGs (+ compressed `_small.jpg` copies of oversized OPS home pages).
- `capture-results.json` — raw capture log (file, byte size, page title, viewport).
- `analysis-manifest.csv` — mapping of each screenshot to the path used for vision analysis (original PNG or compressed JPEG).
- `index.md` — this file.
