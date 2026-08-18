# Visual quality rubric

Applied to any changed learner-facing surface, against **screenshots**, not source.

This exists because source-level and DOM-level checks kept passing on pages that
were wrong. The typography gate walked every stage of mission 10 and reported
clean while the page showed a wall of empty textareas, a sidebar naming the
wrong module, and a 246px working area on mobile. None of those are expressible
as a DOM assertion, and all three were found by a person looking at the page.

## How to gather the evidence

```bash
OPS_CAPTURE_URL=lessons/<slug> OPS_CAPTURE_NAME=<name> \
  npx playwright test e2e/capture-ui.spec.ts --workers=1
```

Add `OPS_CAPTURE_STEPS` (a JSON array of button names) to reach a later stage.
Writes `.agent-shots/<name>-<width>.png` for all six required widths plus
`<name>-report.md` with page height, nested scroll regions and console errors.

**Then read the PNGs.** The report is not a substitute for looking. Read at
least the narrowest and the widest.

## The checks

Ordered by how often each has actually caught something in this repo.

| # | Check | Fails when | Evidence |
|---|---|---|---|
| 1 | **Working area** | The learner's actual work region is a small window inside a tall page — a nested scroll trap | `report.md` nested scroll regions; a window much smaller than its content is a defect |
| 2 | **Screen budget** | Page exceeds 1.5 screens at any width | `report.md` page height, all six widths |
| 3 | **Preamble weight** | Guide, hero or instruction panels consume more than half the viewport before the first control | Narrowest screenshot |
| 4 | **Clipping** | Text cut mid-sentence at a container edge; chips or labels truncated | Screenshots, especially 390px |
| 5 | **Blank-state honesty** | An untouched form already shows failure states, red values or scolding | First-load screenshot |
| 6 | **Instruction clarity** | A field asks for something a first-time learner cannot answer; labels are jargon nouns rather than questions | Screenshot read as a novice |
| 7 | **Hierarchy** | Several headings share near-identical weight; no clear visual centre | Screenshot at normal zoom |
| 8 | **Chrome correctness** | Navigation, rails or breadcrumbs name the wrong module or state | Screenshot plus the rail test |
| 9 | **Density** | Finance content either airy to the point of emptiness or uniformly terminal-dense | Full-page screenshot |
| 10 | **Responsive strategy** | The desktop composition merely stacks vertically instead of adapting | 390 vs 1440 side by side |
| 11 | **Alignment and rhythm** | Labels, values and baselines almost-but-not-quite align; uniform padding where rhythm is needed | Screenshot |
| 12 | **Console** | Any unexpected error or failed request | `report.md` console section |

## Known full-page screenshot artifact

A `position: sticky` or `fixed` header renders at its scroll offset in a
`fullPage` capture, so it can appear stranded mid-page. **Verify before
reporting it as a bug** — read the computed `position` and `top`. This exact
artifact was mistaken for a layout failure once already.

## Severity

- **P0** — the learner cannot complete the step, or content is unreachable.
- **P1** — the learner can finish but is confused, misled, or the step breaks a
  hard rule in `AGENTS.md` (screen budget, monospace, contrast, 12px floor).
- **P2** — craft: rhythm, alignment, density, polish.

Fix P0 and P1 before declaring a surface done. Record P2 rather than silently
absorbing it.

## What this rubric cannot do

It detects *whether the rendering is good*, not *whether it changed*. Pixel
comparison against a baseline is a different job and this is not a substitute
for it. Equally, model judgement is a poor regression oracle — it can miss a
small unintended shift and rationalise an accidental change. Use both, for
different questions.
