---
name: visual-audit
description: Render a learner-facing surface at all six required widths, read the screenshots, and report ranked visual defects. Use after any change to a lesson, dossier or course page — before claiming the work is done. Also use when a page "passes tests but looks wrong".
---

# Visual audit

Look at the page. Do not infer it from CSS.

Every defect a human has caught in this repo — a wall of empty textareas, a
sidebar naming the wrong module, a 246px working area on a phone — passed every
DOM and typography assertion. This skill exists to close that gap.

## 1. Capture

```bash
OPS_CAPTURE_URL=lessons/<slug> OPS_CAPTURE_NAME=<name> \
  npx playwright test e2e/capture-ui.spec.ts --workers=1
```

To reach a later stage, pass the buttons to press first:

```bash
OPS_CAPTURE_STEPS='["Answer text","Next stage label"]'
```

Note for Git Bash: pass the route **without** a leading slash — a leading slash
is rewritten into a Windows path. The harness recovers from this, but the plain
form is cleaner.

Outputs land in `.agent-shots/` (gitignored): one PNG per width, plus
`<name>-report.md` with page height in screens, nested scroll regions and
console errors.

## 2. Read the screenshots

Use the Read tool on the PNGs. **At minimum read 390px and 1440px.** The report
file is supporting evidence, not a replacement for looking — the nested-scroll
number tells you a working area is cramped, but only the image shows you the
guide panel ate it.

## 3. Judge against the rubric

Apply `agent/rubrics/visual-quality.md` in order. Its first check is the one
that matters most here: is the learner's actual working area a small window
inside a tall page?

## 4. Report

Return a ranked defect list — **P0, P1, P2 with the evidence for each** — and
stop. Do not fix while auditing; the point is a judgement formed before the
author's rationalisations. If invoked as a subagent, return the list and let the
implementing agent repair.

State plainly when a surface is clean. An audit that always finds something is
as useless as one that never does.

## Guardrails

- A `sticky` header appears stranded mid-page in `fullPage` captures. Check
  computed `position` before reporting it.
- Do not weaken a lesson to make a page shorter. Cutting teaching content to
  pass the screen budget is the wrong trade — restructure or disclose instead.
- Screenshots are ground truth for *rendering*, not for *change*. Do not use
  them as a regression oracle.
