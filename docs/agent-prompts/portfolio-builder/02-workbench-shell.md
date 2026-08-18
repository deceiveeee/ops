# Phase 2 prompt — build the persistent Workbench shell

Paste after `00-master-operating-prompt.md`. Run only after Phase 1's schema and migration
are implemented and reviewed.

---

## Objective

Create the persistent Portfolio Workbench experience that makes the 13 missions feel like
one continuous portfolio construction process.

The learner must always be able to answer:

1. What decision am I making now?
2. What changed in my portfolio?
3. Why does that change matter?
4. What must I review next?

The shell connects the course mission map, current lesson, affected artifact, saved state,
downstream review requirements, and destination Dossier without becoming a generic
dashboard or a second curriculum.

## Preconditions

Inspect the implemented Workbench state, selectors, migration, and tests. If Phase 1 is not
complete, do not invent presentational mock state or a competing schema. Report
`Blocked - implementation` and name the missing foundation.

Inspect in addition:

- `components/courses/PortfolioBuilderPath.tsx`
- `components/dossier/PortfolioDossier.tsx`
- `components/lessons/investment-foundations/IFLessonLayout.tsx`
- `components/lessons/investment-foundations/IFProgressRail.tsx`
- `components/lessons/investment-foundations/IFSourcePanel.tsx`
- `components/lessons/investment-foundations/shared.tsx`
- `app/globals.css`
- `tailwind.config.ts`
- course and lesson routes plus the full rendered component tree.

Do not blindly copy the current rail: audit findings indicate it may omit later artifacts
and use obsolete counts. Do not clone a neighboring shell whose final text is specific to a
valuation lesson.

## Experience architecture

### Desktop

- Keep the lesson decision dominant.
- Add a persistent but compact Workbench sidecar where space allows.
- Show current mission, affected checkpoint, saved/unsaved state, material warnings, and
  downstream `Review required` items.
- Allow deeper detail without navigating away from the lesson.
- Separate course navigation, lesson content, and Workbench companion visually.
- Prevent sticky collisions with header, progression controls, dialogs, and footer.
- Keep reading line length comfortable.

The sidecar is a decision companion, not an analytics dashboard.

### Mobile and narrow screens

- Place the essential Workbench summary in the lesson flow near the decision.
- Put deeper detail in an accessible drawer or bottom sheet.
- Preserve mission, affected artifact, save state, and review warning without requiring the
  drawer to open.
- Retain unsaved input and scroll position across open, close, resize, and rotation.
- Return focus to the invoking control after dismissal.
- Avoid essential horizontal scrolling and controls obscured by keyboard or browser chrome.

### State language

Use the approved visible Workbench states only. Distinguish:

- no saved decision;
- valid unsaved edit;
- incomplete or internally inconsistent decision;
- saving;
- saved but not yet independently demonstrated;
- checkpoint coherent;
- upstream change detected;
- downstream review required;
- gate blocked;
- mission complete while graduation remains open;
- local persistence failure.

Saving is not mastery. Celebration follows a coherent decision or passed independent
flight check, not a button click.

## Scanning motif

Preserve the smooth scanning motif the stakeholder liked, but make it semantic:

`mission decision → changed Workbench field → downstream portfolio consequence`

- Trigger it on a meaningful save, dependency scan, or checkpoint transition.
- Use the scan to illuminate a path or affected record.
- Do not run it indefinitely like a fake loading state.
- Do not place distracting continuous motion behind reading.
- Reduced motion replaces it with immediate highlighted states and the same explanatory
  text.

## Apple-quality translation

- One dominant idea and primary action per scene.
- Secondary details behind progressive disclosure.
- Precise type, spacing, grouping, and state wording.
- Layout recomposes rather than shrinks.
- Feedback appears beside the affected decision and says what changed, why, and what next.
- Motion conveys continuity or causality and is interruptible.
- Learners can inspect, dismiss help, revise, and retry without losing their task.
- Use OPS's own finance visual language. Do not reproduce Apple page compositions,
  materials, icons, type, or branding.

## Accessibility and visual acceptance

- All actions work without drag, hover, color, chart reading, or animation.
- Targets are at least 44×44 CSS pixels where applicable.
- Focus order follows the decision sequence.
- Drawer/dialog semantics, name, Escape behavior, focus trap, and restoration are correct.
- Save/error/review updates use restrained announcements, not continuous calculation spam.
- Visual states have plain-language equivalents.
- Text remains usable at 200% zoom; contrast passes in both themes.
- No rendered text below 12px and no monospace.
- No hard-coded dark panel bypasses `.ops-theme-light`.
- Verify disabled, selected, warning, success, and review-required variants against their
  actual surfaces.

## Required browser matrix

Capture and compare baseline and final rendered states at approximately:

- 1440×900;
- 1024×768;
- 390×844;
- 320–360px width;
- 200% zoom.

For each relevant size, inspect fresh, migrated, personal, practice, unsaved, saved,
review-required, reduced-motion, light-theme, and dark-theme paths. Verify keyboard-only
use and console output.

Create or update `docs/release-evidence/portfolio-workbench-shell.md`. Record actual
screenshot paths, browser states, and any unverified screen-reader behavior rather than
reusing older visual evidence.

## Explicit non-goals

Do not:

- change curriculum order, finance content, equations, answers, or mission unlock logic;
- implement Mission 5 or Missions 10–13;
- change the approved Workbench schema or migration contract;
- replace persistence with mock data;
- make optional labs a second path;
- redesign the homepage;
- add live market data, brokerage connectivity, WebGL, or a heavy animation library;
- copy Apple or Khan visual identity;
- turn the shell into a grid of generic cards;
- commit or push.

Finish with screenshots/equivalent visual evidence and the master report. Even if every
functional, accessibility, responsive, theme, and visual check passes, return `Ready for
review` until the stakeholder approves the exact rendered implementation.

---
