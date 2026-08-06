## Fix Round 1: final-review Important findings

### Fixes addressed

1. **Radiogroup arrow-key navigation** — `AnswerCard` is now a `forwardRef` button that
   accepts a `tabIndex` prop; `OnboardingQuestion` implements roving tabindex (the
   selected card, or the first when nothing is selected, holds `tabIndex=0`; the rest
   hold `tabIndex=-1`) and an `onKeyDown` handler on the radiogroup that cycles focus
   with `ArrowDown`/`ArrowRight` (next, wraps to start) and `ArrowUp`/`ArrowLeft`
   (previous, wraps to end). The focused index is tracked in state so the tab stop
   follows focus. `Enter`/`Space` select via native button behavior.

2. **Focus management on question transition** — `OnboardingQuestion` now holds a ref
   to the prompt `<h2>` (given `tabIndex={-1}`) and focuses it on mount. Because
   `OnboardingFlow`'s `motion.div` is keyed by `phase`, the component remounts on every
   question transition, so the prompt is announced on each step.

3. **online/offline listeners in the store** — `lib/onboarding/store.tsx`'s mount effect
   now registers `online` and `offline` window listeners (and removes them on cleanup),
   mirroring `lib/progress/store.tsx` verbatim: `online` flips status to `synced` for
   authed users (`guest` otherwise) and `offline` flips status to `offline`.

### Verification

- **typecheck:** `npm run typecheck` — exit 0 (PASS)
- **lint:** `npm run lint` — exit 0; only the 2 pre-existing `react-hooks/exhaustive-deps`
  warnings remain (`OnboardingFlow.tsx:69`, `store.tsx:252` — same warnings as before,
  line shifted due to added lines). No new warnings.
- **build:** `npm run build` — exit 0 (PASS)
- **vitest:** `npx vitest run lib/onboarding components/onboarding` — 61/61 passing
  across 7 test files (was 57/57; +4 new tests for roving tabindex and arrow-key focus
  cycling/wrapping). exit 0.
- **Playwright E2E:** `npx playwright test e2e/onboarding.spec.ts` — 3/3 passing
  (guest full survey, guest resume across reload, retake flag). exit 0.

### Commit(s)

- `df588d1` — fix(onboarding): a11y radiogroup keys, prompt focus, offline sync status
