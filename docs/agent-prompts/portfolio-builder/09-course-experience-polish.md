# Phase 9 prompt — course-wide experience polish

Paste after `00-master-operating-prompt.md`. Run after the Workbench and all currently
authorized missions are functionally stable. This phase cannot close source or learning
gates through styling.

---

## Objective

Make Portfolio Builder feel like one exceptionally clear, cohesive, responsive product:

> I am completing 13 decisions that progressively build one portfolio. I always know what
> I am deciding, what changed, why it matters, and what comes next.

Use Apple as a benchmark for focus, hierarchy, adaptability, motion discipline, and finish;
use Khan Academy as a benchmark for next-action clarity and visible progress. Express both
through OPS's own finance-native visual system.

Do not homogenize every lesson. Shared orientation and state language should make the
course coherent; concept-native metaphors should make each mission memorable.

## Required baseline audit

Before editing:

1. run `git status --short` and inspect all relevant diffs;
2. trace the course landing → mission map → lesson shell → Workbench → plan flow;
3. inspect every mission at its entry, model, guided, independent, feedback, and completed
   state;
4. capture desktop/mobile and light/dark baseline screenshots;
5. inventory duplicate navigation, inconsistent terminology, competing progress systems,
   hard-coded surfaces, visual-template repetition, and concept-free controls;
6. record accessibility, reduced-motion, overflow, and performance behavior;
7. write the smallest coherent polish plan before code.

Do not use historical competitive audits as a current defect ledger. They are baseline
context only; verify every defect against the current rendered product.

## Course-level hierarchy

The learner-facing hierarchy is:

1. Portfolio Builder;
2. current mission and decision;
3. current lesson/activity;
4. changed Workbench checkpoint;
5. next required action;
6. optional source/depth material.

Do not present modules and missions as competing directions. Source sessions support the
decision but never become progress steps.

The mission map should show one plan accumulating through controlled states. The current
mission, latest meaningful achievement, unresolved review item, and next action should be
obvious without reading a manual.

## Apple-level craft translated to OPS

### Focus

- Give every scene one dominant concept and one primary action.
- Reduce redundant buttons, badges, captions, progress labels, and ornamental surfaces.
- Put the financial consequence closer to the learner's input than explanatory chrome.
- Use progressive disclosure for citations, assumptions, provenance, and advanced detail.

### Hierarchy and writing

- Use Fraunces only for deliberate editorial headings and Inter for all UI/numbers.
- Use sentence case, precise labels, restrained tracking, and tabular figures.
- Never use monospace or text below 12px.
- Replace vague CTAs such as `Continue`, `Submit`, or `Scan` when a finance-specific action
  is clearer.
- Feedback states what changed, why it matters, and what to do next.

### Adaptability

- Recompose desktop scenes for tablet and mobile rather than compressing columns.
- Keep primary input and financial result in a clear reading sequence.
- Avoid required hover, wide unscrollable diagrams, clipped tables, and controls hidden by
  sticky UI or the software keyboard.
- Preserve task and focus across drawers, route transitions, and resize.

### Motion

- Motion reveals causality, sequence, dependency, or confirmation.
- The scanning motif is event-driven and connects a decision to a Workbench consequence.
- Use transform/opacity, brief durations, and interruptible transitions.
- Pause atmospheric motion during dense reading.
- Reduced motion shows discrete states with the same information.
- Do not add Liquid Glass, springy novelty, background parallax, or cinematic transitions
  simply because Apple uses polished motion.

### Craft and earned delight

- Refine loading, empty, error, disabled, selected, review-required, migrated, and completed
  states.
- Celebrate a defensible allocation, licensed architecture, verified products, or passed
  flight test—not routine navigation or a saved draft.
- Test every variant in its actual theme and surface.

## OPS concept-native visual language

Use or refine these only where they teach the mission:

- Readiness Runway;
- Hypothesis Forge;
- Bond Shock Lab;
- Risk X-Ray and required-return builder;
- Allocation Studio and Loss-Budget Allocator;
- Filing as Source Code;
- Valuation Gravity;
- Trade-Path Scanner;
- Backtest Autopsy;
- Architecture Switchboard and Edge License;
- Missing-Time Timeline;
- Prospectus Lens and Overlap X-Ray;
- Portfolio Flight Test and Rebalancing Control Room.

For every control, be able to write:

`Learner changes X → financial result Y changes → misconception Z becomes visible.`

If that sentence cannot be completed, remove or redesign the control. Avoid generic card
grids, arbitrary sliders, duplicated dashboards, decorative tickers, and random neon.

## Khan-quality orientation

- Show capability progress, not only percent complete.
- Distinguish lesson viewed, draft saved, decision coherent, and skill independently
  demonstrated.
- Keep one obvious next useful action.
- Put hints beside the task and feedback beside the consequence.
- Allow safe retry without punitive visual language.
- Surface earlier skill reuse when it helps orientation, but do not announce the answer to
  a transfer assessment.

## Accessibility, theme, and responsive criteria

- Every task works with keyboard, touch, screen-reader-oriented semantics, and reduced
  motion.
- Nothing relies on color, animation, hover, drag, or chart reading alone.
- Targets are at least 44×44px where applicable and focus is visible in both themes.
- Every visualization has a table or plain-language equivalent.
- Dynamic recalculations announce only material result changes.
- Text works at 200% zoom.
- No unintended document overflow at 320–360px width.
- No hard-coded dark surface bypasses `.ops-theme-light`; inspect pseudo states and Tailwind
  variants, not only base classes.
- Check contrast against the actual panel background, including disabled text.

## Performance criteria

- Measure and reduce avoidable rerenders, layout shift, large animated DOM sets, excessive
  blur/shadow, and unnecessary client-only boundaries.
- Lazy-load only genuinely heavy visuals.
- Do not add a dependency for effects achievable with CSS, SVG, or existing Motion.
- Keep input response immediate and avoid animation blocking the learner's next action.

## Required browser review

Inspect every mission and the course map / plan page at:

- approximately 1440×900;
- 1024×768;
- 390×844;
- 320–360px width;
- 200% desktop zoom.

Review both themes, reduced motion, keyboard-only progression, correct/incorrect paths,
fresh/persisted state, drawers/dialogs, console output, and full completion. Capture final
evidence for every materially changed surface.

Challenge every visual treatment—not only progression, overflow, and responsiveness. Ask
whether typography, color, fill, border, animation, copy, and hierarchy communicate the
right finance state in both themes.

Create or update `docs/release-evidence/portfolio-builder-experience-polish.md` with
before/after screenshot paths and an explicit matrix of rendered states. Do not copy older
browser claims into the new record.

## Explicit non-goals

Do not:

- change approved curriculum, finance claims, numbers, answers, or state semantics;
- implement around an open source or learner gate;
- create a second progress taxonomy;
- copy Apple or Khan layouts, branding, assets, colors, type, scoring, or interaction
  signatures;
- add live market data, a brokerage connection, WebGL, or heavy 3D;
- redesign the public homepage unless separately authorized;
- sacrifice clarity for spectacle;
- commit or push.

End with before/after evidence, the exact design principles translated, and the master
report.

---
