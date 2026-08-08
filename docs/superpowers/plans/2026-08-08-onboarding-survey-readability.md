# Onboarding Survey Readability Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the onboarding survey's secondary text to a confident, legible tier and bring its labels into compliance with `AGENTS.md` typography rules.

**Architecture:** A pure presentation-token change. Six `className` string edits across three React components in `components/onboarding/`. No logic, no structure, no copy, no prop changes. Secondary text moves from `slate-400`/`slate-500` to a unified `slate-300` tier; labels drop `uppercase` + wide tracking for sentence case; minimum label size rises to `13px` and helper text to `15px`. Primary headings/values (`slate-50`/`slate-100`/`accent-cyan`) and decorative borders are untouched, so the three-tier hierarchy is preserved.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Vitest + Testing Library.

## Global Constraints

- These are **CSS class-token changes only**. Do not rename variables, move JSX, alter copy, or change component props/interfaces.
- Do **not** add unit tests that assert on `className` strings — the existing onboarding tests verify behavior, and class-name assertions are brittle. Verification here = existing suite stays green + manual visual check.
- Typography rule from `AGENTS.md`: labels use sentence case with `tracking-[0.01em]–[0.02em]`; **no** `uppercase` + wide `letter-spacing`.
- **Never** use `font-mono` (`mono` token is remapped to Inter). Not relevant to this change — do not introduce it.
- Exact commands: lint = `npm run lint`, typecheck = `npm run typecheck`, test = `npm run test`.
- After each task, run typecheck + test to confirm no regression, then commit.

---

### Task 1: Results page — eyebrow, "Explore all courses" link, row labels

**Files:**
- Modify: `components/onboarding/OnboardingResults.tsx`

**Interfaces:** None — presentation-only change; no consumed or produced APIs.

This file has **two identical** `className="text-[12px] uppercase tracking-[0.02em] text-slate-500"` strings (the eyebrow at line 36 and the row-label at line 83). When editing, include the surrounding JSX so each replacement is unambiguous: the eyebrow wraps the literal `"Your OPS starting point"`; the row label wraps `{label}`.

- [ ] **Step 1: Edit the eyebrow (line 36)**

Old:
```jsx
      <div className="text-[12px] uppercase tracking-[0.02em] text-slate-500">
        Your OPS starting point
      </div>
```
New:
```jsx
      <div className="text-[13px] tracking-[0.01em] text-slate-300">
        Your OPS starting point
      </div>
```

- [ ] **Step 2: Edit the "Explore all courses" link (line 61–66)**

Old:
```jsx
        <Link
          href="/courses"
          className="text-[15px] text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
        >
          Explore all courses
        </Link>
```
New:
```jsx
        <Link
          href="/courses"
          className="text-[15px] text-slate-300 underline-offset-4 hover:text-slate-200 hover:underline"
        >
          Explore all courses
        </Link>
```

- [ ] **Step 3: Edit the row-label class (inside the `Row` component, line 83)**

Old:
```jsx
      <div className="text-[12px] uppercase tracking-[0.02em] text-slate-500">
        {label}
      </div>
```
New:
```jsx
      <div className="text-[13px] tracking-[0.01em] text-slate-300">
        {label}
      </div>
```

- [ ] **Step 4: Verify no regression**

Run:
```
npm run typecheck
npm run test -- components/onboarding
```
Expected: typecheck passes; onboarding tests pass (none assert on class names).

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/OnboardingResults.tsx
git commit -m "fix(onboarding): readable secondary text on results page"
```

---

### Task 2: Question screen — helper text and Skip link

**Files:**
- Modify: `components/onboarding/OnboardingQuestion.tsx`

**Interfaces:** None — presentation-only change.

- [ ] **Step 1: Edit the helper paragraph (line 59–63)**

Old:
```jsx
      {question.helper && (
        <p className="mt-3 text-[14px] tracking-[0.01em] text-slate-400">
          {question.helper}
        </p>
      )}
```
New:
```jsx
      {question.helper && (
        <p className="mt-3 text-[15px] tracking-[0.01em] text-slate-300">
          {question.helper}
        </p>
      )}
```

- [ ] **Step 2: Edit the Skip button (line 85–91)**

Old:
```jsx
          <button
            type="button"
            onClick={onSkip}
            className="text-[14px] text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
          >
            Skip
          </button>
```
New:
```jsx
          <button
            type="button"
            onClick={onSkip}
            className="text-[14px] text-slate-300 underline-offset-4 hover:text-slate-200 hover:underline"
          >
            Skip
          </button>
```

- [ ] **Step 3: Verify no regression**

Run:
```
npm run typecheck
npm run test -- components/onboarding
```
Expected: typecheck passes; onboarding tests pass.

- [ ] **Step 4: Commit**

```bash
git add components/onboarding/OnboardingQuestion.tsx
git commit -m "fix(onboarding): readable helper text and skip action"
```

---

### Task 3: Soft prompt — Dismiss action

**Files:**
- Modify: `components/onboarding/OnboardingPrompt.tsx`

**Interfaces:** None — presentation-only change.

Note: the prompt copy paragraph on line 19 is already `text-slate-200` — do **not** change it. Only the Dismiss button changes.

- [ ] **Step 1: Edit the Dismiss button (line 26–33)**

Old:
```jsx
          <button
            type="button"
            onClick={dismissPrompt}
            aria-label="Dismiss"
            className="rounded text-[14px] text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            Dismiss
          </button>
```
New:
```jsx
          <button
            type="button"
            onClick={dismissPrompt}
            aria-label="Dismiss"
            className="rounded text-[14px] text-slate-300 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            Dismiss
          </button>
```

- [ ] **Step 2: Verify no regression**

Run:
```
npm run typecheck
npm run test -- components/onboarding
```
Expected: typecheck passes; onboarding tests pass.

- [ ] **Step 3: Commit**

```bash
git add components/onboarding/OnboardingPrompt.tsx
git commit -m "fix(onboarding): readable dismiss action on soft prompt"
```

---

### Task 4: Final verification

**Files:** None modified.

- [ ] **Step 1: Run the full quality gate**

Run:
```
npm run lint
npm run typecheck
npm run test
```
Expected: all three pass clean.

- [ ] **Step 2: Manual visual check**

Run the dev server (`npm run dev`), open `http://localhost:3000/start`, and confirm:
- Question screens: helper text reads as supportive guidance, not a disclaimer; "Skip" is clearly visible.
- Results screen: "Your OPS starting point" eyebrow and the four row labels are clearly legible and in sentence case; "Explore all courses" link is readable.
- Hierarchy still reads as primary (headings/values/accent) > secondary (labels/helpers/links) > decorative (progress track / borders). Nothing "shouts."

- [ ] **Step 3: No commit needed** — this task only verifies.

---

## Self-Review Notes

**Spec coverage:** Spec lists 6 edits in 3 files — Task 1 covers OnboardingResults.tsx (3 edits), Task 2 covers OnboardingQuestion.tsx (2 edits), Task 3 covers OnboardingPrompt.tsx (1 edit). All spec items mapped. Spec's "no test asserts on class names" finding honored (no brittle assertions added).

**Placeholder scan:** None — every step has exact old/new code.

**Consistency:** `slate-300`, `tracking-[0.01em]`, `13px` (labels), `15px` (helper) used consistently and match the spec table.
