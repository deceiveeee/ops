# Frictionless Onboarding Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/start` route that captures five core KPI questions (plus one optional segmentation question) in a one-question-per-screen full-screen intake, persists answers for guests (localStorage) and authed users (new `user_onboarding` table), computes a recommended starting course + next step, and reveals a personalized "Your OPS starting point" result card.

**Architecture:** A pure recommendation function maps `(goal, experience)` to `(course slug, next-step copy)`. A pure merge function picks the winner between two onboarding snapshots (completed beats partial; otherwise newer `updated_at` wins). `OnboardingProvider` mirrors the existing `ProgressProvider` pattern: guest writes hit localStorage under `ops-onboarding-v1`, authed writes additionally upsert to `user_onboarding` (RLS-protected). The `/start` client component is a state machine: `intro -> q1...q5 -> q6 (optional) -> results`, one-directional, with `AnimatePresence` transitions. Retake mode (`?retake=1`) buffers answers in React state and flushes only on completion.

**Tech Stack:** Next.js 14.2.15 (App Router), `@supabase/supabase-js`, React 18, TypeScript, Tailwind, `motion/react` (motion v11), vitest (unit), Playwright (E2E).

## Global Constraints

- **Never use monospace** typefaces (`font-mono`). The Tailwind `mono` token is remapped to Inter; use `font-sans` (Inter) for all UI/labels/numerics — it has tabular figures. Use `font-display` (Fraunces) for editorial headlines. Avoid `uppercase` + wide `letter-spacing` on body labels (small eyebrow labels may use `uppercase` + `tracking-[0.02em]`).
- Premium dark finance aesthetic: dark base (`bg-ink-950`, slate, navy), thin borders, subtle glow, `accent-cyan` (#22d3ee).
- **Reuse existing primitives**: `GlassPanel`, `Button`. No new design system.
- **No service-role key in the browser.** Browser uses anon key + RLS only.
- localStorage key prefix `ops-`; this feature uses `ops-onboarding-v1`.
- **Accounts are optional**; onboarding must work for guests identically.
- Motion library is **`motion/react`** (motion v11), not `framer-motion`.
- The `/start` route lives in the `(marketing)` route group; `lib/route-theme.ts` returns `"dark"` for it automatically (it is not `/courses` or `/lessons`).
- Next.js **14.2.15** — `cookies()` from `next/headers` is synchronous; do not `await` it. Route `params` and `searchParams` are plain objects (not promises).
- **No code comments** in shipped files unless explicitly requested.
- `setAnswer` writes immediately (partial-snapshot KPI value); `markComplete` writes the final snapshot with `completed_at`.
- **Retake is atomic**: when `?retake=1` is present, answers buffer in React state and only flush to the store on `markComplete`. Abandoning a retake leaves the previous onboarding row intact.

---

## File Structure

**New files**
- `supabase/migrations/0002_user_onboarding.sql` — table + RLS.
- `lib/onboarding/types.ts` — option unions, `OnboardingAnswers`, `OnboardingSnapshot`, `Question`, `QuestionId`.
- `lib/onboarding/questions.ts` — `ONBOARDING_QUESTIONS` array (single source of truth).
- `lib/onboarding/recommend.ts` — pure `recommendCourse(answers)`.
- `lib/onboarding/recommend.test.ts` — parametrized matrix tests.
- `lib/onboarding/merge.ts` — pure `mergeSnapshots(local, cloud)`.
- `lib/onboarding/merge.test.ts` — newer-wins / completed-vs-partial / null cases.
- `lib/onboarding/localStorage.ts` — read/write helpers for `ops-onboarding-v1`.
- `lib/onboarding/localStorage.test.ts` — round-trip + malformed JSON.
- `lib/onboarding/store.tsx` — `OnboardingProvider` + `useOnboarding()`.
- `lib/onboarding/store.test.tsx` — guest/authed/merge/network-failure cases (mirrors `progress/store.test.tsx`).
- `components/onboarding/AnswerCard.tsx` — single selectable card.
- `components/onboarding/OnboardingQuestion.tsx` — renders one question + its cards; radiogroup semantics.
- `components/onboarding/OnboardingQuestion.test.tsx` — render + select + skip.
- `components/onboarding/OnboardingIntro.tsx` — headline-only intro frame + Begin CTA.
- `components/onboarding/OnboardingResults.tsx` — reveal screen.
- `components/onboarding/OnboardingResults.test.tsx` — renders recommendation for given answers.
- `components/onboarding/ProgressScanLine.tsx` — 5-segment top indicator.
- `components/onboarding/OnboardingFlow.tsx` — client state machine.
- `components/onboarding/OnboardingFlow.test.tsx` — full-flow transition, retake, completed-returns.
- `components/onboarding/OnboardingPrompt.tsx` — soft toast for authed-not-completed users.
- `app/(marketing)/start/page.tsx` — server shell.
- `e2e/onboarding.spec.ts` — Playwright: guest completes, resume, retake, keyboard.

**Modified files**
- `app/layout.tsx` — mount `<OnboardingProvider>` inside `<SessionProvider>`, wrapping `<ProgressProvider>`.
- `components/layout/SiteHeader.tsx` — add "Update my starting point" item to `AccountMenu`; mount `<OnboardingPrompt/>` at top of header.
- `components/marketing/HomePage.tsx` (or whichever component renders the hero primary CTA — locate during Task 14) — change hero primary CTA href to `/start`, label to "Find your starting point".

---

## Task 1: Database migration + onboarding types

**Files:**
- Create: `supabase/migrations/0002_user_onboarding.sql`
- Create: `lib/onboarding/types.ts`

**Interfaces:**
- Produces: `OnboardingAnswers`, `OnboardingSnapshot`, `Question`, `QuestionId`, `Recommendation`, and the six option unions — used by every later task.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/0002_user_onboarding.sql`:

```sql
create table if not exists public.user_onboarding (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  answers                 jsonb      not null default '{}'::jsonb,
  recommended_course_slug text,
  recommended_next_step   text,
  confidence_tier         text,
  segment                 text,
  prompt_dismissed        boolean    not null default false,
  completed_at            timestamptz,
  updated_at              timestamptz not null default now()
);

alter table public.user_onboarding enable row level security;

drop policy if exists "own onboarding read"   on public.user_onboarding;
drop policy if exists "own onboarding insert" on public.user_onboarding;
drop policy if exists "own onboarding update" on public.user_onboarding;

create policy "own onboarding read"
  on public.user_onboarding for select
  using (user_id = auth.uid());

create policy "own onboarding insert"
  on public.user_onboarding for insert
  with check (user_id = auth.uid());

create policy "own onboarding update"
  on public.user_onboarding for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

- [ ] **Step 2: Apply the migration to your Supabase project**

Run the SQL above against your Supabase project's SQL editor (or `supabase db push` if you have the CLI configured). Confirm the table appears with `prompt_dismissed` defaulting to `false` and RLS enabled with three policies.

- [ ] **Step 3: Write the type module**

Create `lib/onboarding/types.ts`:

```ts
export type GoalOption =
  | "understand-how-investing-works"
  | "learn-to-analyze-companies"
  | "build-a-diversified-portfolio"
  | "make-better-investment-decisions"
  | "prepare-for-a-class-or-competition"
  | "explore-finance-as-a-career"
  | "still-figuring-that-out";

export type ExperienceOption =
  | "completely-new"
  | "know-some-basic-terms"
  | "follow-markets-no-investments"
  | "used-paper-trading"
  | "made-real-investments"
  | "analyze-independently";

export type AccessOption =
  | "no-account"
  | "paper-or-simulation"
  | "custodial-or-family"
  | "own-account"
  | "prefer-not-to-say";

export type OutcomeOption =
  | "explain-how-investments-work"
  | "evaluate-company-attractiveness"
  | "build-defend-portfolio"
  | "make-first-responsible-decision"
  | "improve-existing-decisions"
  | "use-financial-models";

export type ConfidenceOption =
  | "not-confident-yet"
  | "slightly-confident"
  | "somewhat-confident"
  | "confident"
  | "very-confident";

export type SegmentOption =
  | "middle-school"
  | "high-school"
  | "college-student"
  | "adult-learner"
  | "educator-or-parent"
  | "prefer-not-to-say";

export type OnboardingAnswers = {
  goal?: GoalOption;
  experience?: ExperienceOption;
  access?: AccessOption;
  outcome?: OutcomeOption;
  confidence?: ConfidenceOption;
};

export type QuestionId = keyof OnboardingAnswers | "segment";

export type QuestionOption = {
  id: string;
  label: string;
};

export type Question = {
  id: QuestionId;
  prompt: string;
  helper?: string;
  optional?: boolean;
  options: QuestionOption[];
};

export type OnboardingSnapshot = {
  answers: OnboardingAnswers;
  completed_at: string | null;
  updated_at: string;
  recommended_course_slug: string | null;
  recommended_next_step: string | null;
  confidence_tier: ConfidenceOption | null;
  segment: SegmentOption | null;
  prompt_dismissed: boolean;
};

export type Recommendation = {
  primaryCourseSlug: string;
  nextStepCopy: string;
};
```

- [ ] **Step 4: Verify typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors; no usages yet).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0002_user_onboarding.sql lib/onboarding/types.ts
git commit -m "feat(onboarding): add user_onboarding migration and shared types"
```

---

## Task 2: Questions data (single source of truth)

**Files:**
- Create: `lib/onboarding/questions.ts`

**Interfaces:**
- Consumes: `Question`, `QuestionId` from Task 1.
- Produces: `ONBOARDING_QUESTIONS: Question[]` (ordered: goal, experience, access, outcome, confidence, segment) used by the UI and by tests; `QUESTION_IDS: QuestionId[]` for state-machine iteration.

- [ ] **Step 1: Write the questions module**

Create `lib/onboarding/questions.ts`:

```ts
import type { Question, QuestionId } from "./types";

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: "goal",
    prompt: "What brought you to OPS?",
    helper: "Choose the outcome that matters most to you.",
    options: [
      { id: "understand-how-investing-works", label: "Understand how investing works" },
      { id: "learn-to-analyze-companies", label: "Learn to analyze companies" },
      { id: "build-a-diversified-portfolio", label: "Build a diversified portfolio" },
      { id: "make-better-investment-decisions", label: "Make better investment decisions" },
      { id: "prepare-for-a-class-or-competition", label: "Prepare for a class or competition" },
      { id: "explore-finance-as-a-career", label: "Explore finance as a career" },
      { id: "still-figuring-that-out", label: "I am still figuring that out" },
    ],
  },
  {
    id: "experience",
    prompt: "Where are you starting from?",
    options: [
      { id: "completely-new", label: "I am completely new to finance" },
      { id: "know-some-basic-terms", label: "I know some basic investing terms" },
      { id: "follow-markets-no-investments", label: "I follow markets but have not invested" },
      { id: "used-paper-trading", label: "I have used a paper-trading account" },
      { id: "made-real-investments", label: "I have made real investments" },
      { id: "analyze-independently", label: "I already analyze investments independently" },
    ],
  },
  {
    id: "access",
    prompt: "Which best describes your current investing access?",
    options: [
      { id: "no-account", label: "I do not currently have an investment account" },
      { id: "paper-or-simulation", label: "I use a paper-trading or simulation account" },
      { id: "custodial-or-family", label: "I have access to a custodial or family-managed account" },
      { id: "own-account", label: "I have my own investment account" },
      { id: "prefer-not-to-say", label: "Prefer not to say" },
    ],
  },
  {
    id: "outcome",
    prompt: "What would meaningful progress look like for you?",
    helper: "By the end of OPS, I would like to be able to...",
    options: [
      { id: "explain-how-investments-work", label: "Explain how major investments work" },
      { id: "evaluate-company-attractiveness", label: "Evaluate whether a company is attractive" },
      { id: "build-defend-portfolio", label: "Build and defend a diversified portfolio" },
      { id: "make-first-responsible-decision", label: "Make my first responsible investment decision" },
      { id: "improve-existing-decisions", label: "Improve decisions about investments I already own" },
      { id: "use-financial-models", label: "Use financial models and quantitative tools" },
    ],
  },
  {
    id: "confidence",
    prompt: "How confident do you currently feel making an investment decision?",
    helper:
      "Confidence does not affect your course placement. It helps OPS measure how your decision-making develops.",
    options: [
      { id: "not-confident-yet", label: "Not confident yet" },
      { id: "slightly-confident", label: "Slightly confident" },
      { id: "somewhat-confident", label: "Somewhat confident" },
      { id: "confident", label: "Confident" },
      { id: "very-confident", label: "Very confident" },
    ],
  },
  {
    id: "segment",
    prompt: "Which best describes you?",
    helper: "Optional. Helps us understand who we are reaching.",
    optional: true,
    options: [
      { id: "middle-school", label: "Middle school student" },
      { id: "high-school", label: "High school student" },
      { id: "college-student", label: "College student" },
      { id: "adult-learner", label: "Adult learner" },
      { id: "educator-or-parent", label: "Educator or parent" },
      { id: "prefer-not-to-say", label: "Prefer not to say" },
    ],
  },
];

export const QUESTION_IDS: QuestionId[] = ONBOARDING_QUESTIONS.map((q) => q.id);
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/onboarding/questions.ts
git commit -m "feat(onboarding): add questions single source of truth"
```

---

## Task 3: Recommendation function (TDD)

**Files:**
- Create: `lib/onboarding/recommend.test.ts`
- Create: `lib/onboarding/recommend.ts`

**Interfaces:**
- Consumes: `OnboardingAnswers`, `Recommendation` from Task 1.
- Produces: `recommendCourse(answers: OnboardingAnswers): Recommendation` — used by `markComplete` (Task 6) and `OnboardingResults` (Task 10).

- [ ] **Step 1: Write the failing test**

Create `lib/onboarding/recommend.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { recommendCourse } from "./recommend";
import type { OnboardingAnswers } from "./types";

const ans = (
  goal: OnboardingAnswers["goal"],
  experience: OnboardingAnswers["experience"],
): OnboardingAnswers => ({ goal, experience });

describe("recommendCourse", () => {
  describe("goal = understand-how-investing-works", () => {
    for (const exp of [
      "completely-new",
      "know-some-basic-terms",
      "follow-markets-no-investments",
      "used-paper-trading",
      "made-real-investments",
      "analyze-independently",
    ] as const) {
      it(`experience=${exp} -> Finance Foundations`, () => {
        const r = recommendCourse(ans("understand-how-investing-works", exp));
        expect(r.primaryCourseSlug).toBe("finance-foundations");
        expect(r.nextStepCopy).toContain("foundations");
      });
    }
  });

  describe("goal = learn-to-analyze-companies", () => {
    it("beginner -> Finance Foundations + equities intro copy", () => {
      const r = recommendCourse(ans("learn-to-analyze-companies", "completely-new"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("equities");
    });
    it("experienced -> Finance Foundations + valuation pathway copy", () => {
      const r = recommendCourse(ans("learn-to-analyze-companies", "analyze-independently"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("valuation pathway");
      expect(r.nextStepCopy).toContain("Investment Foundations");
    });
  });

  describe("goal = build-a-diversified-portfolio", () => {
    it("beginner -> Finance Foundations + risk-and-return copy", () => {
      const r = recommendCourse(ans("build-a-diversified-portfolio", "know-some-basic-terms"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("risk and return");
    });
    it("experienced -> Investment Foundations + revisit copy", () => {
      const r = recommendCourse(ans("build-a-diversified-portfolio", "used-paper-trading"));
      expect(r.primaryCourseSlug).toBe("investment-foundations");
      expect(r.nextStepCopy).toContain("Investment Foundations");
      expect(r.nextStepCopy).toContain("portfolio theory");
    });
  });

  describe("goal = make-better-investment-decisions", () => {
    for (const exp of ["completely-new", "analyze-independently"] as const) {
      it(`experience=${exp} -> Investment Foundations`, () => {
        const r = recommendCourse(ans("make-better-investment-decisions", exp));
        expect(r.primaryCourseSlug).toBe("investment-foundations");
        expect(r.nextStepCopy).toContain("Investment Foundations");
      });
    }
  });

  describe("goal = prepare-for-a-class-or-competition", () => {
    it("any experience -> Finance Foundations backbone", () => {
      const r = recommendCourse(ans("prepare-for-a-class-or-competition", "follow-markets-no-investments"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("backbone");
    });
  });

  describe("goal = explore-finance-as-a-career", () => {
    it("any experience -> Finance Foundations + Investment Foundations next", () => {
      const r = recommendCourse(ans("explore-finance-as-a-career", "made-real-investments"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("Investment Foundations");
    });
  });

  describe("goal = still-figuring-that-out", () => {
    it("any experience -> Finance Foundations + foundations pathway", () => {
      const r = recommendCourse(ans("still-figuring-that-out", "completely-new"));
      expect(r.primaryCourseSlug).toBe("finance-foundations");
      expect(r.nextStepCopy).toContain("foundations pathway");
    });
  });

  describe("missing inputs", () => {
    it("returns Finance Foundations default when goal is undefined", () => {
      const r = recommendCourse({ experience: "completely-new" });
      expect(r.primaryCourseSlug).toBe("finance-foundations");
    });
    it("returns Finance Foundations default when experience is undefined", () => {
      const r = recommendCourse({ goal: "learn-to-analyze-companies" });
      expect(r.primaryCourseSlug).toBe("finance-foundations");
    });
    it("returns Finance Foundations default when both undefined", () => {
      const r = recommendCourse({});
      expect(r.primaryCourseSlug).toBe("finance-foundations");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/onboarding/recommend.test.ts`
Expected: FAIL with "Cannot find module './recommend'" or similar.

- [ ] **Step 3: Write the implementation**

Create `lib/onboarding/recommend.ts`:

```ts
import type {
  ExperienceOption,
  OnboardingAnswers,
  Recommendation,
} from "./types";

const BEGINNER: ReadonlySet<ExperienceOption> = new Set([
  "completely-new",
  "know-some-basic-terms",
]);

const FF = "finance-foundations";
const IF = "investment-foundations";

export function recommendCourse(answers: OnboardingAnswers): Recommendation {
  const goal = answers.goal;
  const exp = answers.experience;
  const beginner = exp ? BEGINNER.has(exp) : true;

  switch (goal) {
    case "understand-how-investing-works":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Begin with the foundations pathway, then move into securities.",
      };
    case "learn-to-analyze-companies":
      return beginner
        ? {
            primaryCourseSlug: FF,
            nextStepCopy: "Work through equities and valuation, then try a company case.",
          }
        : {
            primaryCourseSlug: FF,
            nextStepCopy: "Complete the valuation pathway, then begin Investment Foundations.",
          };
    case "build-a-diversified-portfolio":
      return beginner
        ? {
            primaryCourseSlug: FF,
            nextStepCopy: "Start with risk and return, then build up to portfolio theory.",
          }
        : {
            primaryCourseSlug: IF,
            nextStepCopy:
              "Begin Investment Foundations, then revisit portfolio theory in Finance Foundations.",
          };
    case "make-better-investment-decisions":
      return {
        primaryCourseSlug: IF,
        nextStepCopy:
          "Start with Investment Foundations, then ground yourself in Finance Foundations.",
      };
    case "prepare-for-a-class-or-competition":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Take the full Finance Foundations sequence as your backbone.",
      };
    case "explore-finance-as-a-career":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Take the full Finance Foundations sequence, then Investment Foundations.",
      };
    case "still-figuring-that-out":
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Start at the beginning. The foundations pathway will help you decide.",
      };
    default:
      return {
        primaryCourseSlug: FF,
        nextStepCopy: "Start at the beginning. The foundations pathway will help you decide.",
      };
  }
}

export function isBeginnerExperience(exp: ExperienceOption | undefined): boolean {
  return exp ? BEGINNER.has(exp) : true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/onboarding/recommend.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/onboarding/recommend.ts lib/onboarding/recommend.test.ts
git commit -m "feat(onboarding): add recommendCourse mapping with parametrized tests"
```

---

## Task 4: Merge function (TDD)

**Files:**
- Create: `lib/onboarding/merge.test.ts`
- Create: `lib/onboarding/merge.ts`

**Interfaces:**
- Consumes: `OnboardingSnapshot` from Task 1.
- Produces: `mergeSnapshots(local: OnboardingSnapshot | null, cloud: OnboardingSnapshot | null): OnboardingSnapshot | null` — used by the store (Task 6).

**Merge rules (from spec):**
1. If both null → null.
2. If exactly one is null → return the non-null one.
3. If exactly one has `completed_at` → return that one (completed beats partial).
4. Otherwise (both completed or both partial) → return the one with the newer `updated_at`; ties break toward `local`.

- [ ] **Step 1: Write the failing test**

Create `lib/onboarding/merge.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mergeSnapshots } from "./merge";
import type { OnboardingSnapshot } from "./types";

const base: OnboardingSnapshot = {
  answers: {},
  completed_at: null,
  updated_at: "2026-01-01T00:00:00.000Z",
  recommended_course_slug: null,
  recommended_next_step: null,
  confidence_tier: null,
  segment: null,
  prompt_dismissed: false,
};

const withOver = (over: Partial<OnboardingSnapshot>): OnboardingSnapshot => ({
  ...base,
  ...over,
});

describe("mergeSnapshots", () => {
  it("returns null when both inputs are null", () => {
    expect(mergeSnapshots(null, null)).toBeNull();
  });

  it("returns cloud when local is null", () => {
    const c = withOver({ segment: "high-school" });
    expect(mergeSnapshots(null, c)).toBe(c);
  });

  it("returns local when cloud is null", () => {
    const l = withOver({ segment: "adult-learner" });
    expect(mergeSnapshots(l, null)).toBe(l);
  });

  it("completed beats partial regardless of updated_at", () => {
    const partial = withOver({
      updated_at: "2026-12-01T00:00:00.000Z",
      completed_at: null,
    });
    const complete = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(partial, complete)).toBe(complete);
    expect(mergeSnapshots(complete, partial)).toBe(complete);
  });

  it("both completed -> newer updated_at wins (cloud newer)", () => {
    const older = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
    });
    const newer = withOver({
      updated_at: "2026-06-01T00:00:00.000Z",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(older, newer)).toBe(newer);
  });

  it("both completed -> newer updated_at wins (local newer)", () => {
    const older = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
    });
    const newer = withOver({
      updated_at: "2026-06-01T00:00:00.000Z",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(newer, older)).toBe(newer);
  });

  it("both partial -> newer updated_at wins", () => {
    const older = withOver({ updated_at: "2026-01-01T00:00:00.000Z" });
    const newer = withOver({ updated_at: "2026-06-01T00:00:00.000Z" });
    expect(mergeSnapshots(older, newer)).toBe(newer);
  });

  it("both partial with equal updated_at -> local wins (tie-break)", () => {
    const local = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      segment: "adult-learner",
    });
    const cloud = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      segment: "high-school",
    });
    expect(mergeSnapshots(local, cloud)).toBe(local);
  });

  it("both completed with equal updated_at -> local wins (tie-break)", () => {
    const local = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
      segment: "adult-learner",
    });
    const cloud = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
      segment: "high-school",
    });
    expect(mergeSnapshots(local, cloud)).toBe(local);
  });

  it("treats invalid updated_at as epoch (numeric 0)", () => {
    const valid = withOver({
      updated_at: "2026-06-01T00:00:00.000Z",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    const invalid = withOver({
      updated_at: "not-a-date",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(invalid, valid)).toBe(valid);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/onboarding/merge.test.ts`
Expected: FAIL with "Cannot find module './merge'".

- [ ] **Step 3: Write the implementation**

Create `lib/onboarding/merge.ts`:

```ts
import type { OnboardingSnapshot } from "./types";

function timeOrZero(s: string | null | undefined): number {
  if (!s) return 0;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function mergeSnapshots(
  local: OnboardingSnapshot | null,
  cloud: OnboardingSnapshot | null,
): OnboardingSnapshot | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  const localCompleted = local.completed_at !== null;
  const cloudCompleted = cloud.completed_at !== null;
  if (localCompleted && !cloudCompleted) return local;
  if (cloudCompleted && !localCompleted) return cloud;

  const localTime = timeOrZero(local.updated_at);
  const cloudTime = timeOrZero(cloud.updated_at);
  return localTime >= cloudTime ? local : cloud;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/onboarding/merge.test.ts`
Expected: PASS (all 10 cases).

- [ ] **Step 5: Commit**

```bash
git add lib/onboarding/merge.ts lib/onboarding/merge.test.ts
git commit -m "feat(onboarding): add mergeSnapshots with completed-vs-partial semantics"
```

---

## Task 5: localStorage helpers (TDD)

**Files:**
- Create: `lib/onboarding/localStorage.test.ts`
- Create: `lib/onboarding/localStorage.ts`

**Interfaces:**
- Consumes: `OnboardingSnapshot` from Task 1.
- Produces:
  - `ONBOARDING_LS_KEY` (= `"ops-onboarding-v1"`)
  - `ONBOARDING_CHANGE_EVENT` (= `"ops-onboarding-change"`)
  - `readLocalSnapshot(): OnboardingSnapshot | null`
  - `writeLocalSnapshot(snap: OnboardingSnapshot): void`
  - `clearLocalSnapshot(): void`

- [ ] **Step 1: Write the failing test**

Create `lib/onboarding/localStorage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  ONBOARDING_LS_KEY,
  readLocalSnapshot,
  writeLocalSnapshot,
  clearLocalSnapshot,
} from "./localStorage";
import type { OnboardingSnapshot } from "./types";

const snap: OnboardingSnapshot = {
  answers: { goal: "learn-to-analyze-companies" },
  completed_at: "2026-08-05T12:00:00.000Z",
  updated_at: "2026-08-05T12:00:00.000Z",
  recommended_course_slug: "finance-foundations",
  recommended_next_step: "Work through equities and valuation, then try a company case.",
  confidence_tier: "somewhat-confident",
  segment: "adult-learner",
  prompt_dismissed: false,
};

describe("localStorage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("ONBOARDING_LS_KEY is ops-onboarding-v1", () => {
    expect(ONBOARDING_LS_KEY).toBe("ops-onboarding-v1");
  });

  it("returns null when no key present", () => {
    expect(readLocalSnapshot()).toBeNull();
  });

  it("round-trips a snapshot", () => {
    writeLocalSnapshot(snap);
    expect(readLocalSnapshot()).toEqual(snap);
  });

  it("returns null for malformed JSON", () => {
    localStorage.setItem(ONBOARDING_LS_KEY, "{not json");
    expect(readLocalSnapshot()).toBeNull();
  });

  it("returns null when stored value is not an object", () => {
    localStorage.setItem(ONBOARDING_LS_KEY, JSON.stringify("string"));
    expect(readLocalSnapshot()).toBeNull();
  });

  it("clearLocalSnapshot removes the key", () => {
    writeLocalSnapshot(snap);
    clearLocalSnapshot();
    expect(readLocalSnapshot()).toBeNull();
    expect(localStorage.getItem(ONBOARDING_LS_KEY)).toBeNull();
  });

  it("writeLocalSnapshot dispatches an ops-onboarding-change event", () => {
    let fired = 0;
    const handler = () => { fired++; };
    window.addEventListener("ops-onboarding-change", handler);
    writeLocalSnapshot(snap);
    expect(fired).toBe(1);
    window.removeEventListener("ops-onboarding-change", handler);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/onboarding/localStorage.test.ts`
Expected: FAIL with "Cannot find module './localStorage'".

- [ ] **Step 3: Write the implementation**

Create `lib/onboarding/localStorage.ts`:

```ts
import type { OnboardingSnapshot } from "./types";

export const ONBOARDING_LS_KEY = "ops-onboarding-v1";
export const ONBOARDING_CHANGE_EVENT = "ops-onboarding-change";

export function readLocalSnapshot(): OnboardingSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ONBOARDING_LS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as OnboardingSnapshot;
  } catch {
    return null;
  }
}

export function writeLocalSnapshot(snap: OnboardingSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_LS_KEY, JSON.stringify(snap));
    window.dispatchEvent(new Event(ONBOARDING_CHANGE_EVENT));
  } catch {
    // storage full or unavailable; silently ignore
  }
}

export function clearLocalSnapshot(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_LS_KEY);
  window.dispatchEvent(new Event(ONBOARDING_CHANGE_EVENT));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/onboarding/localStorage.test.ts`
Expected: PASS (all 7 cases).

- [ ] **Step 5: Commit**

```bash
git add lib/onboarding/localStorage.ts lib/onboarding/localStorage.test.ts
git commit -m "feat(onboarding): add localStorage snapshot helpers"
```

---

## Task 6: Onboarding store (TDD)

**Files:**
- Create: `lib/onboarding/store.test.tsx`
- Create: `lib/onboarding/store.tsx`

**Interfaces:**
- Consumes: `useSession` from `@/lib/supabase/session`, `mergeSnapshots` from Task 4, localStorage helpers from Task 5, `recommendCourse` from Task 3, all types from Task 1.
- Produces:
  - `OnboardingProvider({ children }: { children: ReactNode })`
  - `useOnboarding(): OnboardingValue` where:
    ```ts
    type OnboardingValue = {
      ready: boolean;
      syncStatus: "guest" | "synced" | "saving" | "error" | "offline";
      snapshot: OnboardingSnapshot | null;
      isComplete: boolean;
      recommended: Recommendation | null;
      setAnswer: (qid: QuestionId, value: string) => void;
      markComplete: (input: { answers: OnboardingAnswers; segment?: SegmentOption | null }) => void;
      dismissPrompt: () => void;
    };
    ```

**Behavior summary:**
- On mount: read localStorage snapshot. If session is authed, fetch `user_onboarding` row, run through `mergeSnapshots`, write merged back to both stores.
- `setAnswer(qid, value)`: build new `OnboardingSnapshot` with the answer added, `updated_at` = now, preserve `completed_at` and other fields. Write immediately to localStorage; if authed, upsert to `user_onboarding`.
- `markComplete({ answers, segment })`: compute recommendation via `recommendCourse`, build snapshot with `completed_at` = now, `recommended_*` set, write to both stores.
- `dismissPrompt()`: set `prompt_dismissed: true` on the snapshot (creating one if none exists with empty answers), write to both stores.
- On network error during Supabase upsert: set `syncStatus` to `"error"`, keep local write intact.

- [ ] **Step 1: Read the pattern template**

Read `lib/progress/store.test.tsx` end-to-end. It shows how to stub `auth.getUser`, `onAuthStateChange`, and the chainable `from().select().eq().maybeSingle()` / `.upsert()` APIs. The fake clients below follow the same shape but operate on `user_onboarding` rows instead of `user_progress`.

- [ ] **Step 2: Write the failing test**

Create `lib/onboarding/store.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { OnboardingProvider, useOnboarding } from "./store";
import type { OnboardingSnapshot } from "./types";

const guestClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function guestWrapper(client: SupabaseClient = guestClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider client={client}>
        <OnboardingProvider>{children}</OnboardingProvider>
      </SessionProvider>
    );
  };
}

describe("OnboardingProvider (guest)", () => {
  it("starts not ready, becomes ready with null snapshot", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    expect(result.current.ready).toBe(false);
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.ready).toBe(true);
    expect(result.current.syncStatus).toBe("guest");
    expect(result.current.snapshot).toBeNull();
    expect(result.current.isComplete).toBe(false);
  });

  it("setAnswer writes to localStorage and exposes the partial snapshot", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.setAnswer("goal", "learn-to-analyze-companies"));
    expect(result.current.snapshot?.answers.goal).toBe("learn-to-analyze-companies");
    expect(result.current.snapshot?.completed_at).toBeNull();
    expect(result.current.isComplete).toBe(false);
    const stored = JSON.parse(localStorage.getItem("ops-onboarding-v1")!);
    expect(stored.answers.goal).toBe("learn-to-analyze-companies");
  });

  it("markComplete writes completed_at and computed recommendation", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() =>
      result.current.markComplete({
        answers: {
          goal: "learn-to-analyze-companies",
          experience: "completely-new",
          access: "no-account",
          outcome: "evaluate-company-attractiveness",
          confidence: "somewhat-confident",
        },
        segment: "adult-learner",
      }),
    );
    expect(result.current.isComplete).toBe(true);
    expect(result.current.snapshot?.completed_at).toBeTruthy();
    expect(result.current.snapshot?.recommended_course_slug).toBe("finance-foundations");
    expect(result.current.snapshot?.confidence_tier).toBe("somewhat-confident");
    expect(result.current.snapshot?.segment).toBe("adult-learner");
    expect(result.current.recommended?.primaryCourseSlug).toBe("finance-foundations");
  });

  it("dismissPrompt creates a snapshot with prompt_dismissed=true", async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.snapshot).toBeNull();
    act(() => result.current.dismissPrompt());
    expect(result.current.snapshot?.prompt_dismissed).toBe(true);
  });

  it("hydrates from existing localStorage snapshot", async () => {
    const seeded: OnboardingSnapshot = {
      answers: { goal: "still-figuring-that-out" },
      completed_at: null,
      updated_at: "2026-08-01T00:00:00.000Z",
      recommended_course_slug: null,
      recommended_next_step: null,
      confidence_tier: null,
      segment: null,
      prompt_dismissed: false,
    };
    localStorage.setItem("ops-onboarding-v1", JSON.stringify(seeded));
    const { result } = renderHook(() => useOnboarding(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.snapshot?.answers.goal).toBe("still-figuring-that-out");
  });
});

type UpsertRow = {
  user_id: string;
  answers: unknown;
  recommended_course_slug: string | null;
  recommended_next_step: string | null;
  confidence_tier: string | null;
  segment: string | null;
  prompt_dismissed: boolean;
  completed_at: string | null;
  updated_at: string;
};

function makeSignedClient(startUser: { id: string } | null = null) {
  const state: { rows: Record<string, OnboardingSnapshot>; user: { id: string } | null } = {
    rows: {},
    user: startUser,
  };
  const listeners: ((u: { id: string } | null) => void)[] = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user: state.user } }),
      onAuthStateChange: (cb: (e: string, s: { user?: { id: string } } | null) => void) => {
        listeners.push((u) => cb("STATE_CHANGED", u ? { user: u } : null));
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => {
          const run = async () => ({
            data:
              table === "user_onboarding" && state.user && state.rows[state.user.id]
                ? { user_id: state.user.id, ...state.rows[state.user.id] }
                : null,
            error: null,
          });
          return { single: run, maybeSingle: run };
        },
      }),
      upsert: (payload: UpsertRow) => {
        if (table !== "user_onboarding" || !state.user) {
          return Promise.resolve({ error: { message: "no user" } });
        }
        const snap: OnboardingSnapshot = {
          answers: payload.answers as OnboardingSnapshot["answers"],
          completed_at: payload.completed_at,
          updated_at: payload.updated_at,
          recommended_course_slug: payload.recommended_course_slug,
          recommended_next_step: payload.recommended_next_step,
          confidence_tier: payload.confidence_tier as OnboardingSnapshot["confidence_tier"],
          segment: payload.segment as OnboardingSnapshot["segment"],
          prompt_dismissed: payload.prompt_dismissed,
        };
        state.rows[state.user.id] = snap;
        return Promise.resolve({ error: null });
      },
    }),
    __setUser: (u: { id: string } | null) => {
      state.user = u;
      listeners.forEach((l) => l(u));
    },
    __rows: state.rows,
  };
  return client as unknown as SupabaseClient & {
    __setUser: (u: { id: string } | null) => void;
    __rows: Record<string, OnboardingSnapshot>;
  };
}

function signedWrapper(client: ReturnType<typeof makeSignedClient>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider client={client as unknown as SupabaseClient}>
        <OnboardingProvider>{children}</OnboardingProvider>
      </SessionProvider>
    );
  };
}

describe("OnboardingProvider (signed-in)", () => {
  it("merges guest-local + cloud on first auth and writes back", async () => {
    const localSnap: OnboardingSnapshot = {
      answers: { goal: "learn-to-analyze-companies", experience: "completely-new" },
      completed_at: "2026-08-01T00:00:00.000Z",
      updated_at: "2026-08-01T00:00:00.000Z",
      recommended_course_slug: "finance-foundations",
      recommended_next_step: "Work through equities and valuation, then try a company case.",
      confidence_tier: null,
      segment: null,
      prompt_dismissed: false,
    };
    localStorage.setItem("ops-onboarding-v1", JSON.stringify(localSnap));

    const client = makeSignedClient(null);
    client.__rows["u1"] = {
      answers: {},
      completed_at: null,
      updated_at: "2026-07-01T00:00:00.000Z",
      recommended_course_slug: null,
      recommended_next_step: null,
      confidence_tier: null,
      segment: null,
      prompt_dismissed: false,
    };

    const { result } = renderHook(() => useOnboarding(), { wrapper: signedWrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    client.__setUser({ id: "u1" });
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));

    expect(result.current.snapshot?.completed_at).toBe("2026-08-01T00:00:00.000Z");
    expect(client.__rows["u1"]?.completed_at).toBe("2026-08-01T00:00:00.000Z");
  });

  it("markComplete upserts to cloud", async () => {
    const client = makeSignedClient({ id: "u2" });
    const { result } = renderHook(() => useOnboarding(), { wrapper: signedWrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));

    act(() =>
      result.current.markComplete({
        answers: { goal: "build-a-diversified-portfolio", experience: "analyze-independently" },
      }),
    );
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(client.__rows["u2"]?.completed_at).toBeTruthy();
    expect(client.__rows["u2"]?.recommended_course_slug).toBe("investment-foundations");
  });

  it("keeps local snapshot on cloud upsert error", async () => {
    const client = makeSignedClient({ id: "u3" });
    (client.from as unknown) = (_t: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
      upsert: () => Promise.resolve({ error: { message: "boom" } }),
    });
    const { result } = renderHook(() => useOnboarding(), { wrapper: signedWrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.setAnswer("goal", "explore-finance-as-a-career"));
    expect(result.current.snapshot?.answers.goal).toBe("explore-finance-as-a-career");
    await waitFor(() => expect(result.current.syncStatus).toBe("error"));
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/onboarding/store.test.tsx`
Expected: FAIL with "Cannot find module './store'".

- [ ] **Step 4: Write the implementation**

Create `lib/onboarding/store.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/supabase/session";
import { mergeSnapshots } from "./merge";
import { recommendCourse } from "./recommend";
import {
  ONBOARDING_CHANGE_EVENT,
  readLocalSnapshot,
  writeLocalSnapshot,
} from "./localStorage";
import type {
  ConfidenceOption,
  OnboardingAnswers,
  OnboardingSnapshot,
  QuestionId,
  Recommendation,
  SegmentOption,
} from "./types";

export type OnboardingSyncStatus = "guest" | "synced" | "saving" | "error" | "offline";

export interface OnboardingValue {
  ready: boolean;
  syncStatus: OnboardingSyncStatus;
  snapshot: OnboardingSnapshot | null;
  isComplete: boolean;
  recommended: Recommendation | null;
  setAnswer: (qid: QuestionId, value: string) => void;
  markComplete: (input: { answers: OnboardingAnswers; segment?: SegmentOption | null }) => void;
  dismissPrompt: () => void;
}

const Ctx = createContext<OnboardingValue | null>(null);

const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

function buildPartial(
  prev: OnboardingSnapshot | null,
  answers: OnboardingAnswers,
): OnboardingSnapshot {
  const now = new Date().toISOString();
  return {
    answers,
    completed_at: prev?.completed_at ?? null,
    updated_at: now,
    recommended_course_slug: prev?.recommended_course_slug ?? null,
    recommended_next_step: prev?.recommended_next_step ?? null,
    confidence_tier: answers.confidence ?? prev?.confidence_tier ?? null,
    segment: prev?.segment ?? null,
    prompt_dismissed: prev?.prompt_dismissed ?? false,
  };
}

function buildComplete(
  prev: OnboardingSnapshot | null,
  answers: OnboardingAnswers,
  segment: SegmentOption | null,
): OnboardingSnapshot {
  const rec = recommendCourse(answers);
  const now = new Date().toISOString();
  return {
    answers,
    completed_at: now,
    updated_at: now,
    recommended_course_slug: rec.primaryCourseSlug,
    recommended_next_step: rec.nextStepCopy,
    confidence_tier: answers.confidence ?? null,
    segment,
    prompt_dismissed: prev?.prompt_dismissed ?? false,
  };
}

function toRow(user_id: string, snap: OnboardingSnapshot) {
  return {
    user_id,
    answers: snap.answers,
    recommended_course_slug: snap.recommended_course_slug,
    recommended_next_step: snap.recommended_next_step,
    confidence_tier: snap.confidence_tier,
    segment: snap.segment,
    prompt_dismissed: snap.prompt_dismissed,
    completed_at: snap.completed_at,
    updated_at: snap.updated_at,
  };
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const supabase = session.client;
  const liveUserId = session.user?.id ?? null;

  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<OnboardingSyncStatus>("guest");
  const snapRef = useRef<OnboardingSnapshot | null>(null);
  const userIdRef = useRef<string | null>(liveUserId);

  useEffect(() => {
    userIdRef.current = liveUserId;
    setSyncStatus(liveUserId ? "saving" : "guest");
  }, [liveUserId]);

  const refreshFromLocal = useCallback(() => {
    const next = readLocalSnapshot();
    snapRef.current = next;
    setSnapshot(next);
  }, []);

  useEffect(() => {
    let active = true;
    const tick = setTimeout(() => {
      if (!active) return;
      refreshFromLocal();
      setReady(true);
    }, 0);
    const onChange = () => refreshFromLocal();
    window.addEventListener("storage", onChange);
    window.addEventListener(ONBOARDING_CHANGE_EVENT, onChange);
    return () => {
      active = false;
      clearTimeout(tick);
      window.removeEventListener("storage", onChange);
      window.removeEventListener(ONBOARDING_CHANGE_EVENT, onChange);
    };
  }, [refreshFromLocal]);

  useEffect(() => {
    if (!liveUserId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_onboarding")
        .select(
          "answers, recommended_course_slug, recommended_next_step, confidence_tier, segment, prompt_dismissed, completed_at, updated_at",
        )
        .eq("user_id", liveUserId)
        .maybeSingle();
      if (cancelled) return;
      const cloud: OnboardingSnapshot | null =
        !error && data
          ? {
              answers: (data.answers ?? {}) as OnboardingAnswers,
              completed_at: data.completed_at,
              updated_at: data.updated_at,
              recommended_course_slug: data.recommended_course_slug,
              recommended_next_step: data.recommended_next_step,
              confidence_tier: (data.confidence_tier ?? null) as ConfidenceOption | null,
              segment: (data.segment ?? null) as SegmentOption | null,
              prompt_dismissed: data.prompt_dismissed ?? false,
            }
          : null;
      const merged = mergeSnapshots(snapRef.current, cloud);
      snapRef.current = merged;
      setSnapshot(merged);
      if (merged) writeLocalSnapshot(merged);
      let upsertError: unknown = null;
      if (!error && merged) {
        ({ error: upsertError } = await supabase
          .from("user_onboarding")
          .upsert(toRow(liveUserId, merged)));
      }
      if (!cancelled) setSyncStatus(error || upsertError ? "error" : "synced");
    })();
    return () => {
      cancelled = true;
    };
  }, [liveUserId, supabase]);

  const persist = useCallback(
    (next: OnboardingSnapshot) => {
      snapRef.current = next;
      setSnapshot(next);
      writeLocalSnapshot(next);
      const uid = userIdRef.current;
      if (!uid) return;
      if (!isOnline()) {
        setSyncStatus("offline");
        return;
      }
      setSyncStatus("saving");
      Promise.resolve(supabase.from("user_onboarding").upsert(toRow(uid, next)))
        .then(({ error }: { error: unknown }) => {
          setSyncStatus(error ? "error" : "synced");
        })
        .catch(() => setSyncStatus("error"));
    },
    [supabase],
  );

  const setAnswer = useCallback(
    (qid: QuestionId, value: string) => {
      const prevAnswers = snapRef.current?.answers ?? {};
      const nextAnswers: OnboardingAnswers = { ...prevAnswers, [qid]: value };
      persist(buildPartial(snapRef.current, nextAnswers));
    },
    [persist],
  );

  const markComplete = useCallback(
    (input: { answers: OnboardingAnswers; segment?: SegmentOption | null }) => {
      const seg = input.segment ?? snapRef.current?.segment ?? null;
      persist(buildComplete(snapRef.current, input.answers, seg));
    },
    [persist],
  );

  const dismissPrompt = useCallback(() => {
    const prev = snapRef.current;
    const now = new Date().toISOString();
    const next: OnboardingSnapshot = prev
      ? { ...prev, prompt_dismissed: true, updated_at: now }
      : {
          answers: {},
          completed_at: null,
          updated_at: now,
          recommended_course_slug: null,
          recommended_next_step: null,
          confidence_tier: null,
          segment: null,
          prompt_dismissed: true,
        };
    persist(next);
  }, [persist]);

  const recommended = useMemo<Recommendation | null>(() => {
    const snap = snapRef.current;
    if (!snap?.completed_at) return null;
    if (snap.recommended_course_slug && snap.recommended_next_step) {
      return {
        primaryCourseSlug: snap.recommended_course_slug,
        nextStepCopy: snap.recommended_next_step,
      };
    }
    return recommendCourse(snap.answers);
  }, [snapshot]);

  const value = useMemo<OnboardingValue>(
    () => ({
      ready,
      syncStatus,
      snapshot,
      isComplete: snapshot?.completed_at != null,
      recommended,
      setAnswer,
      markComplete,
      dismissPrompt,
    }),
    [ready, syncStatus, snapshot, recommended, setAnswer, markComplete, dismissPrompt],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboarding must be used within <OnboardingProvider>");
  return v;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/onboarding/store.test.tsx`
Expected: PASS (all 8 cases).

- [ ] **Step 6: Commit**

```bash
git add lib/onboarding/store.tsx lib/onboarding/store.test.tsx
git commit -m "feat(onboarding): add OnboardingProvider mirroring ProgressProvider"
```

---

## Task 7: Mount OnboardingProvider in root layout

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `OnboardingProvider` from Task 6.
- Produces: `useOnboarding()` available everywhere inside the app shell.

- [ ] **Step 1: Edit `app/layout.tsx`**

In the imports, add:

```ts
import { OnboardingProvider } from "@/lib/onboarding/store";
```

Wrap `<ProgressProvider>` with `<OnboardingProvider>` so the final JSX reads:

```tsx
<SessionProvider>
  <OnboardingProvider>
    <ProgressProvider>
      <SiteShell>{children}</SiteShell>
    </ProgressProvider>
  </OnboardingProvider>
</SessionProvider>
```

- [ ] **Step 2: Verify typecheck and build**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(onboarding): mount OnboardingProvider in root layout"
```

---

## Task 8: OnboardingQuestion + AnswerCard components

**Files:**
- Create: `components/onboarding/AnswerCard.tsx`
- Create: `components/onboarding/OnboardingQuestion.tsx`
- Create: `components/onboarding/OnboardingQuestion.test.tsx`

**Interfaces:**
- Consumes: `Question`, `QuestionOption` from Task 1.
- Produces:
  - `<AnswerCard option={qo} selected={bool} onSelect={() => void} />`
  - `<OnboardingQuestion question={q} selectedValue={string|undefined} onSelect={(value) => void} onSkip={() => void} />`

- [ ] **Step 1: Write the failing test**

Create `components/onboarding/OnboardingQuestion.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingQuestion from "./OnboardingQuestion";
import type { Question } from "@/lib/onboarding/types";

const question: Question = {
  id: "goal",
  prompt: "What brought you to OPS?",
  helper: "Choose the outcome that matters most to you.",
  options: [
    { id: "learn-to-analyze-companies", label: "Learn to analyze companies" },
    { id: "build-a-diversified-portfolio", label: "Build a diversified portfolio" },
  ],
};

const optionalQuestion: Question = {
  id: "segment",
  prompt: "Which best describes you?",
  helper: "Optional. Helps us understand who we are reaching.",
  optional: true,
  options: [{ id: "adult-learner", label: "Adult learner" }],
};

describe("OnboardingQuestion", () => {
  it("renders prompt, helper, and all option labels", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    expect(screen.getByText("What brought you to OPS?")).toBeTruthy();
    expect(screen.getByText("Choose the outcome that matters most to you.")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Learn to analyze companies" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Build a diversified portfolio" })).toBeTruthy();
  });

  it("calls onSelect with the option id when a card is clicked", () => {
    const onSelect = vi.fn();
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={onSelect}
        onSkip={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Learn to analyze companies"));
    expect(onSelect).toHaveBeenCalledWith("learn-to-analyze-companies");
  });

  it("marks the matching option as aria-checked when selectedValue is set", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue="learn-to-analyze-companies"
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    const selected = screen.getByRole("radio", { name: "Learn to analyze companies" });
    expect(selected).toHaveAttribute("aria-checked", "true");
    const other = screen.getByRole("radio", { name: "Build a diversified portfolio" });
    expect(other).toHaveAttribute("aria-checked", "false");
  });

  it("renders a Skip link only when question.optional is true", () => {
    const onSkip = vi.fn();
    const { rerender } = render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={onSkip}
      />,
    );
    expect(screen.queryByText("Skip")).toBeNull();

    rerender(
      <OnboardingQuestion
        question={optionalQuestion}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={onSkip}
      />,
    );
    fireEvent.click(screen.getByText("Skip"));
    expect(onSkip).toHaveBeenCalled();
  });

  it("exposes a radiogroup role", () => {
    render(
      <OnboardingQuestion
        question={question}
        selectedValue={undefined}
        onSelect={() => {}}
        onSkip={() => {}}
      />,
    );
    expect(screen.getByRole("radiogroup")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/onboarding/OnboardingQuestion.test.tsx`
Expected: FAIL with "Cannot find module './OnboardingQuestion'".

- [ ] **Step 3: Write AnswerCard**

Create `components/onboarding/AnswerCard.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/lib/onboarding/types";

export default function AnswerCard({
  option,
  selected,
  onSelect,
}: {
  option: QuestionOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group w-full rounded-xl border px-5 py-4 text-left transition-all duration-200",
        "border-white/10 bg-white/[0.02] hover:border-accent-cyan/40 hover:bg-white/[0.04]",
        selected &&
          "border-accent-cyan bg-accent-cyan/[0.06] shadow-[0_0_0_1px_rgba(34,211,238,0.35)]",
      )}
    >
      <span
        className={cn(
          "font-sans text-[16px] tracking-[-0.005em]",
          selected ? "text-slate-50" : "text-slate-200",
        )}
      >
        {option.label}
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Write OnboardingQuestion**

Create `components/onboarding/OnboardingQuestion.tsx`:

```tsx
"use client";

import AnswerCard from "./AnswerCard";
import type { Question } from "@/lib/onboarding/types";

export default function OnboardingQuestion({
  question,
  selectedValue,
  onSelect,
  onSkip,
}: {
  question: Question;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  onSkip: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <h2 className="font-display text-[36px] leading-[1.1] text-slate-50 md:text-[44px]">
        {question.prompt}
      </h2>
      {question.helper && (
        <p className="mt-3 text-[14px] tracking-[0.01em] text-slate-400">
          {question.helper}
        </p>
      )}
      <div
        role="radiogroup"
        aria-label={question.prompt}
        className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        {question.options.map((opt) => (
          <AnswerCard
            key={opt.id}
            option={opt}
            selected={selectedValue === opt.id}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>
      {question.optional && (
        <div className="mt-8">
          <button
            type="button"
            onClick={onSkip}
            className="text-[14px] text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/onboarding/OnboardingQuestion.test.tsx`
Expected: PASS (all 5 cases).

- [ ] **Step 6: Commit**

```bash
git add components/onboarding/AnswerCard.tsx components/onboarding/OnboardingQuestion.tsx components/onboarding/OnboardingQuestion.test.tsx
git commit -m "feat(onboarding): add AnswerCard and OnboardingQuestion with radiogroup semantics"
```

---

## Task 9: OnboardingIntro component

**Files:**
- Create: `components/onboarding/OnboardingIntro.tsx`

**Interfaces:**
- Consumes: existing `Button` from `@/components/ui/Button`.
- Produces: `<OnboardingIntro onBegin={() => void} />` — headline-only intro frame + Begin CTA.

- [ ] **Step 1: Write the component**

Create `components/onboarding/OnboardingIntro.tsx`:

```tsx
"use client";

import Button from "@/components/ui/Button";

export default function OnboardingIntro({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-6">
      <h1 className="font-display text-[44px] leading-[1.05] text-slate-50 md:text-[60px]">
        Let&apos;s find your starting point.
      </h1>
      <div className="mt-10">
        <Button size="lg" onClick={onBegin}>
          Begin
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/onboarding/OnboardingIntro.tsx
git commit -m "feat(onboarding): add OnboardingIntro frame"
```

---

## Task 10: OnboardingResults component (TDD)

**Files:**
- Create: `components/onboarding/OnboardingResults.test.tsx`
- Create: `components/onboarding/OnboardingResults.tsx`

**Interfaces:**
- Consumes: `OnboardingAnswers`, `SegmentOption`, `Recommendation` from Task 1; existing `Button`; `ONBOARDING_QUESTIONS` from Task 2; `courses` from `@/data/courses`.
- Produces: `<OnboardingResults answers={a} segment={s|null} recommendation={r} primaryLessonHref={string} />`.

- [ ] **Step 1: Write the failing test**

Create `components/onboarding/OnboardingResults.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingResults from "./OnboardingResults";
import type { OnboardingAnswers, SegmentOption } from "@/lib/onboarding/types";

const answers: OnboardingAnswers = {
  goal: "learn-to-analyze-companies",
  experience: "know-some-basic-terms",
  access: "paper-or-simulation",
  outcome: "evaluate-company-attractiveness",
  confidence: "somewhat-confident",
};
const segment: SegmentOption | null = "adult-learner";

describe("OnboardingResults", () => {
  it("renders Goal, Current experience, Recommended starting point, Suggested next step rows", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={segment}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "Work through equities and valuation, then try a company case.",
        }}
        primaryLessonHref="/lessons/equity-what-does-owning-a-stock-mean"
      />,
    );
    expect(screen.getByText("Goal")).toBeTruthy();
    expect(screen.getByText("Current experience")).toBeTruthy();
    expect(screen.getByText("Recommended starting point")).toBeTruthy();
    expect(screen.getByText("Suggested next step")).toBeTruthy();
  });

  it("renders the chosen option labels (not ids) for goal and experience", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={segment}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "...",
        }}
        primaryLessonHref="/lessons/x"
      />,
    );
    expect(screen.getByText("Learn to analyze companies")).toBeTruthy();
    expect(screen.getByText("I know some basic investing terms")).toBeTruthy();
  });

  it("renders the recommended course title (not slug)", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={null}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "...",
        }}
        primaryLessonHref="/lessons/x"
      />,
    );
    expect(screen.getByText("Finance Foundations")).toBeTruthy();
  });

  it("primary CTA points to primaryLessonHref and secondary link points to /courses", () => {
    render(
      <OnboardingResults
        answers={answers}
        segment={null}
        recommendation={{
          primaryCourseSlug: "finance-foundations",
          nextStepCopy: "...",
        }}
        primaryLessonHref="/lessons/foo"
      />,
    );
    const primary = screen.getByText("Begin my first lesson").closest("a");
    expect(primary?.getAttribute("href")).toBe("/lessons/foo");
    const secondary = screen.getByText("Explore all courses").closest("a");
    expect(secondary?.getAttribute("href")).toBe("/courses");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/onboarding/OnboardingResults.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

Create `components/onboarding/OnboardingResults.tsx`:

```tsx
"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/questions";
import { courses } from "@/data/courses";
import type {
  OnboardingAnswers,
  Recommendation,
  SegmentOption,
} from "@/lib/onboarding/types";

function labelFor(
  questionId: keyof OnboardingAnswers | "segment",
  value: string | undefined,
): string {
  if (!value) return "—";
  const q = ONBOARDING_QUESTIONS.find((x) => x.id === questionId);
  const opt = q?.options.find((o) => o.id === value);
  return opt?.label ?? value;
}

function courseTitle(slug: string): string {
  return courses.find((c) => c.slug === slug)?.title ?? slug;
}

export default function OnboardingResults({
  answers,
  segment,
  recommendation,
  primaryLessonHref,
}: {
  answers: OnboardingAnswers;
  segment: SegmentOption | null;
  recommendation: Recommendation;
  primaryLessonHref: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <div className="text-[12px] uppercase tracking-[0.02em] text-slate-500">
        Your OPS starting point
      </div>

      <div className="mt-8 space-y-6">
        <Row label="Goal" value={labelFor("goal", answers.goal)} />
        <Row
          label="Current experience"
          value={labelFor("experience", answers.experience)}
        />
        <Row
          label="Recommended starting point"
          value={courseTitle(recommendation.primaryCourseSlug)}
          accent
        />
        <Row
          label="Suggested next step"
          value={recommendation.nextStepCopy}
        />
      </div>

      <div className="mt-12 flex flex-col items-start gap-4">
        <Button href={primaryLessonHref} size="lg">
          Begin my first lesson
        </Button>
        <Link
          href="/courses"
          className="text-[15px] text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
        >
          Explore all courses
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[12px] uppercase tracking-[0.02em] text-slate-500">
        {label}
      </div>
      <div
        className={
          accent
            ? "mt-1 font-display text-[22px] leading-tight text-accent-cyan md:text-[26px]"
            : "mt-1 font-display text-[20px] leading-tight text-slate-100 md:text-[24px]"
        }
      >
        {value}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/onboarding/OnboardingResults.test.tsx`
Expected: PASS (all 4 cases).

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/OnboardingResults.tsx components/onboarding/OnboardingResults.test.tsx
git commit -m "feat(onboarding): add OnboardingResults reveal card"
```

---

## Task 11: ProgressScanLine + OnboardingFlow state machine (TDD)

**Files:**
- Create: `components/onboarding/ProgressScanLine.tsx`
- Create: `components/onboarding/OnboardingFlow.tsx`
- Create: `components/onboarding/OnboardingFlow.test.tsx`

**Interfaces:**
- Consumes: `useOnboarding` (Task 6), `OnboardingIntro` (Task 9), `OnboardingQuestion` (Task 8), `OnboardingResults` (Task 10), `ONBOARDING_QUESTIONS` (Task 2), `courses` from `@/data/courses`, `motion/react`.
- Produces: `<OnboardingFlow retake={boolean} />` — full state machine. Mounts ProgressScanLine across question transitions.

**Behavior:**
- Initial phase:
  - If `retake` is true → `"goal"`.
  - Else if store says `isComplete` → `"results"`.
  - Else resume at first question whose answer is missing → default `"intro"`.
- On `Begin` from intro → `"goal"`.
- On select in Q1–Q5: if `retake`, buffer in React state; else call `setAnswer`. Wait 280ms, then advance to next phase.
- Q6 (segment): on select, buffer (always — segment goes into `markComplete`). On Skip, advance without setting segment.
- After Q6 (or its skip): call `markComplete({ answers, segment })` and transition to `"results"`.
- ProgressScanLine: hidden on intro + results, visible on q1–q5. Filled-segment count = number of q1–q5 currently answered.

- [ ] **Step 1: Write the failing test**

Create `components/onboarding/OnboardingFlow.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import OnboardingFlow from "./OnboardingFlow";
import { OnboardingProvider } from "@/lib/onboarding/store";
import { SessionProvider } from "@/lib/supabase/session";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useReducedMotion: () => true,
}));

const guestClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function renderFlow(props: { retake?: boolean }) {
  return render(
    <SessionProvider client={guestClient}>
      <OnboardingProvider>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <OnboardingFlow retake={(props as any).retake ?? false} />
      </OnboardingProvider>
    </SessionProvider>,
  );
}

describe("OnboardingFlow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("starts at intro for a fresh guest", async () => {
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByText("Let's find your starting point.")).toBeTruthy();
    expect(screen.getByText("Begin")).toBeTruthy();
  });

  it("advances intro -> goal -> experience on Begin + answer", async () => {
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(10);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Begin"));
    });
    expect(screen.getByText("What brought you to OPS?")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText("Understand how investing works"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByText("Where are you starting from?")).toBeTruthy();
  });

  it("writes each answer to the store in non-retake mode", async () => {
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(10);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Begin"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Understand how investing works"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });

    const stored = JSON.parse(localStorage.getItem("ops-onboarding-v1")!);
    expect(stored.answers.goal).toBe("understand-how-investing-works");
    expect(stored.completed_at).toBeNull();
  });

  it("does NOT write during retake; only writes on completion", async () => {
    await act(async () => {
      renderFlow({ retake: true });
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(10);
    });

    expect(screen.queryByText("Begin")).toBeNull();
    expect(screen.getByText("What brought you to OPS?")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText("Understand how investing works"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });

    expect(localStorage.getItem("ops-onboarding-v1")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByText("I am completely new to finance"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("I do not currently have an investment account"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Explain how major investments work"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Not confident yet"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByText("Which best describes you?")).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByText("Skip"));
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByText("Your OPS starting point")).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem("ops-onboarding-v1")!);
    expect(stored.completed_at).toBeTruthy();
    expect(stored.answers.goal).toBe("understand-how-investing-works");
  });

  it("lands on results when store already has completed_at", async () => {
    localStorage.setItem(
      "ops-onboarding-v1",
      JSON.stringify({
        answers: { goal: "learn-to-analyze-companies", experience: "completely-new" },
        completed_at: "2026-08-01T00:00:00.000Z",
        updated_at: "2026-08-01T00:00:00.000Z",
        recommended_course_slug: "finance-foundations",
        recommended_next_step: "Work through equities and valuation, then try a company case.",
        confidence_tier: null,
        segment: null,
        prompt_dismissed: false,
      }),
    );
    await act(async () => {
      renderFlow({});
    });
    await act(async () => {
      vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByText("Your OPS starting point")).toBeTruthy();
    expect(screen.queryByText("Begin")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/onboarding/OnboardingFlow.test.tsx`
Expected: FAIL with "Cannot find module './OnboardingFlow'".

- [ ] **Step 3: Write ProgressScanLine**

Create `components/onboarding/ProgressScanLine.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

export default function ProgressScanLine({ filled }: { filled: number }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-40 px-6">
      <div className="mx-auto mt-4 flex max-w-2xl gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[2px] flex-1 rounded-full transition-colors duration-300",
              i < filled ? "bg-accent-cyan" : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write OnboardingFlow**

Create `components/onboarding/OnboardingFlow.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import OnboardingIntro from "./OnboardingIntro";
import OnboardingQuestion from "./OnboardingQuestion";
import OnboardingResults from "./OnboardingResults";
import ProgressScanLine from "./ProgressScanLine";
import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/questions";
import { useOnboarding } from "@/lib/onboarding/store";
import { courses } from "@/data/courses";
import type { OnboardingAnswers, QuestionId, SegmentOption } from "@/lib/onboarding/types";

type Phase = "intro" | QuestionId | "results";

const CORE_QUESTION_IDS: QuestionId[] = [
  "goal",
  "experience",
  "access",
  "outcome",
  "confidence",
];
const ALL_PHASES: Phase[] = [
  "intro",
  ...ONBOARDING_QUESTIONS.map((q) => q.id),
  "results",
];
const ADVANCE_BEAT_MS = 280;

function firstUnansweredPhase(answers: OnboardingAnswers): Phase {
  for (const id of CORE_QUESTION_IDS) {
    if (!answers[id]) return id;
  }
  return "segment";
}

function recommendedLessonHref(courseSlug: string): string {
  const course = courses.find((c) => c.slug === courseSlug);
  const firstSlug = course?.modules[0]?.lessonSlugs[0];
  return firstSlug ? `/lessons/${firstSlug}` : "/courses";
}

export default function OnboardingFlow({ retake }: { retake: boolean }) {
  const reduce = useReducedMotion();
  const { ready, snapshot, isComplete, setAnswer, markComplete } = useOnboarding();

  const computeInitialPhase = (): Phase => {
    if (!ready) return "intro";
    if (retake) return "goal";
    if (isComplete) return "results";
    if (!snapshot) return "intro";
    return firstUnansweredPhase(snapshot.answers);
  };

  const [phase, setPhase] = useState<Phase>("intro");
  const [buffer, setBuffer] = useState<OnboardingAnswers>({});
  const [bufferedSegment, setBufferedSegment] = useState<SegmentOption | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPhase(computeInitialPhase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, retake, isComplete, snapshot]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const currentAnswers: OnboardingAnswers = retake
    ? buffer
    : (snapshot?.answers ?? {});

  function effectiveAnswer(qid: QuestionId): string | undefined {
    return currentAnswers[qid];
  }

  function handleSelect(qid: QuestionId, value: string) {
    const nextPhaseIdx = ALL_PHASES.indexOf(qid) + 1;
    const nextPhase = ALL_PHASES[nextPhaseIdx];

    if (qid === "segment") {
      const segmentValue = value as SegmentOption;
      if (retake) {
        setBufferedSegment(segmentValue);
        advanceTimerRef.current = setTimeout(() => {
          markComplete({ answers: buffer, segment: segmentValue });
          setPhase("results");
        }, ADVANCE_BEAT_MS);
        return;
      }
      advanceTimerRef.current = setTimeout(() => {
        markComplete({
          answers: snapshot?.answers ?? {},
          segment: segmentValue,
        });
        setPhase("results");
      }, ADVANCE_BEAT_MS);
      return;
    }

    if (retake) {
      const newBuffer = { ...buffer, [qid]: value };
      setBuffer(newBuffer);
      advanceTimerRef.current = setTimeout(() => setPhase(nextPhase), ADVANCE_BEAT_MS);
      return;
    }

    setAnswer(qid, value);
    advanceTimerRef.current = setTimeout(() => setPhase(nextPhase), ADVANCE_BEAT_MS);
  }

  function handleSkipSegment() {
    advanceTimerRef.current = setTimeout(() => {
      const finalAnswers = retake ? buffer : (snapshot?.answers ?? {});
      const finalSegment = retake
        ? bufferedSegment
        : (snapshot?.segment ?? null);
      markComplete({ answers: finalAnswers, segment: finalSegment });
      setPhase("results");
    }, ADVANCE_BEAT_MS);
  }

  const filledCount = useMemo(
    () =>
      CORE_QUESTION_IDS.reduce(
        (n, id) => (currentAnswers[id] ? n + 1 : n),
        0,
      ),
    [currentAnswers],
  );

  const showScanLine = phase !== "intro" && phase !== "results";

  const recommendation = useMemo(() => {
    if (!snapshot?.recommended_course_slug || !snapshot.recommended_next_step) {
      return null;
    }
    return {
      primaryCourseSlug: snapshot.recommended_course_slug,
      nextStepCopy: snapshot.recommended_next_step,
    };
  }, [snapshot]);

  return (
    <div className="relative flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-ink-950 py-20">
      {showScanLine && <ProgressScanLine filled={filledCount} />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phase}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: reduce ? 0.15 : 0.22, ease: "easeOut" }}
          className="w-full"
        >
          {phase === "intro" && <OnboardingIntro onBegin={() => setPhase("goal")} />}

          {phase !== "intro" && phase !== "results" && (
            <OnboardingQuestion
              question={ONBOARDING_QUESTIONS.find((q) => q.id === phase)!}
              selectedValue={effectiveAnswer(phase)}
              onSelect={(value) => handleSelect(phase, value)}
              onSkip={handleSkipSegment}
            />
          )}

          {phase === "results" && recommendation && (
            <OnboardingResults
              answers={snapshot?.answers ?? {}}
              segment={snapshot?.segment ?? null}
              recommendation={recommendation}
              primaryLessonHref={recommendedLessonHref(recommendation.primaryCourseSlug)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/onboarding/OnboardingFlow.test.tsx`
Expected: PASS (all 5 cases).

Note: the mock at the top of the test file replaces `motion/react` with trivial pass-throughs so fake timers do not interact with motion's animation-frame loop. All `setTimeout`-based advances must be wrapped in `act(async () => { vi.advanceTimersByTimeAsync(ms); })`.

- [ ] **Step 6: Commit**

```bash
git add components/onboarding/ProgressScanLine.tsx components/onboarding/OnboardingFlow.tsx components/onboarding/OnboardingFlow.test.tsx
git commit -m "feat(onboarding): add OnboardingFlow state machine and ProgressScanLine"
```

---

## Task 12: `/start` route shell

**Files:**
- Create: `app/(marketing)/start/page.tsx`

**Interfaces:**
- Consumes: `OnboardingFlow` from Task 11.
- Produces: the `/start` route, reading `searchParams.retake` to pass `retake={true}` to the flow.

- [ ] **Step 1: Write the route**

Create `app/(marketing)/start/page.tsx`:

```tsx
import { Suspense } from "react";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export const metadata = {
  title: "Find your starting point — Open Portfolio Studio",
};

export default function StartPage({
  searchParams,
}: {
  searchParams: { retake?: string };
}) {
  const retake = searchParams.retake === "1";
  return (
    <Suspense fallback={null}>
      <OnboardingFlow retake={retake} />
    </Suspense>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS; `/start` is statically renderable.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev` and open `http://localhost:3000/start`. Confirm:
- Intro frame shows the headline + Begin.
- Clicking Begin shows Q1.
- Answering each card advances to the next question after a brief beat.
- After Q5, the optional segmentation question appears with a Skip link.
- After Q6 (or Skip), the results reveal renders with the correct recommendation.
- Refreshing the page mid-flow returns to the first unanswered question.
- `/start?retake=1` starts at Q1 even after completion.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/start/page.tsx"
git commit -m "feat(onboarding): add /start route shell"
```

---

## Task 13: Soft prompt + account-menu link

**Files:**
- Create: `components/onboarding/OnboardingPrompt.tsx`
- Modify: `components/layout/SiteHeader.tsx`

**Interfaces:**
- Consumes: `useOnboarding` (Task 6); existing `Button`.
- Produces:
  - `<OnboardingPrompt />` — renders a dismissible banner when: signed in, store ready, `isComplete === false`, `prompt_dismissed === false`. Two actions: "Take the 60-second starting point" → `/start`, and a "Dismiss" button that calls `dismissPrompt()`.
  - Inside `AccountMenu`: an "Update my starting point" link → `/start?retake=1`.

- [ ] **Step 1: Write OnboardingPrompt**

Create `components/onboarding/OnboardingPrompt.tsx`:

```tsx
"use client";

import Button from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding/store";

export default function OnboardingPrompt() {
  const { ready, isComplete, snapshot, dismissPrompt } = useOnboarding();

  if (!ready) return null;
  if (isComplete) return null;
  if (snapshot?.prompt_dismissed) return null;

  return (
    <div className="border-b border-accent-cyan/20 bg-accent-cyan/[0.06]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[14px] text-slate-200">
          Tell us your goal and we&apos;ll find your starting point.
        </p>
        <div className="flex items-center gap-4">
          <Button href="/start" size="sm">
            Take the 60-second starting point
          </Button>
          <button
            type="button"
            onClick={dismissPrompt}
            aria-label="Dismiss"
            className="text-[14px] text-slate-400 hover:text-slate-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify `components/layout/SiteHeader.tsx`**

In the imports, add:

```ts
import OnboardingPrompt from "@/components/onboarding/OnboardingPrompt";
```

(`Link` is already imported; no change there.)

Inside the `AccountMenu` component, replace the dropdown JSX so it reads (note the width change `w-40` → `w-56`):

```tsx
{open && (
  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-ink-950/95 p-1">
    <Link
      href="/start?retake=1"
      onClick={() => setOpen(false)}
      className="block w-full rounded-md px-3 py-2 text-left text-[14px] text-slate-200 hover:bg-white/5"
    >
      Update my starting point
    </Link>
    <button
      onClick={onSignOut}
      className="w-full rounded-md px-3 py-2 text-left text-[14px] text-slate-200 hover:bg-white/5"
    >
      Sign out
    </button>
  </div>
)}
```

Then mount `<OnboardingPrompt />` immediately inside the `<header>` element, before the inner `<div className="mx-auto flex h-[68px] ...">`. The header return becomes:

```tsx
return (
  <header className={cn("sticky top-0 z-50 transition-all duration-500", ...)}>
    <OnboardingPrompt />
    <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 sm:px-8">
      {/* existing content unchanged */}
    </div>
    {/* mobile menu unchanged */}
  </header>
);
```

- [ ] **Step 3: Verify build and typecheck**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Manual smoke test**

- Sign in. The banner should appear at the top of the header.
- Click "Take the 60-second starting point" → goes to `/start`.
- Sign out, sign back in. Complete the survey. Sign out, sign in again. Banner should NOT appear.
- Sign in with a fresh account, dismiss the banner. Refresh. Banner should NOT reappear.
- Click the account menu. "Update my starting point" should be present and link to `/start?retake=1`.

- [ ] **Step 5: Commit**

```bash
git add components/onboarding/OnboardingPrompt.tsx components/layout/SiteHeader.tsx
git commit -m "feat(onboarding): add soft prompt and account-menu retake link"
```

---

## Task 14: Homepage hero CTA

**Files:**
- Modify: `components/marketing/HomePage.tsx` (or whichever component renders the hero CTA — locate during this task).

- [ ] **Step 1: Locate the hero primary CTA**

Run a search for `href="/studio"` and `Enter the studio` inside `components/marketing/` to find the hero CTA. Read the surrounding component to identify the primary CTA button.

- [ ] **Step 2: Change the primary CTA**

Change the hero's primary CTA from:
- href: `/studio` → `/start`
- label: `Enter the studio` (or whatever it currently says) → `Find your starting point`

Keep `/studio` as a secondary outline button if the hero currently has two CTAs, so existing traffic still flows to the studio.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Manual smoke test**

Open `/`. Confirm the hero primary CTA now says "Find your starting point" and links to `/start`.

- [ ] **Step 5: Commit**

```bash
git add <modified file path>
git commit -m "feat(onboarding): point homepage hero CTA to /start"
```

---

## Task 15: E2E tests

**Files:**
- Create: `e2e/onboarding.spec.ts`

**Interfaces:**
- Consumes: the running Next.js dev server (Playwright config in `playwright.config.ts` handles startup).

- [ ] **Step 1: Write the E2E spec**

Create `e2e/onboarding.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Onboarding flow", () => {
  test("guest completes the full survey and sees a recommendation", async ({ page }) => {
    await page.goto("/start");
    await expect(
      page.getByRole("heading", { name: "Let's find your starting point." }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Begin" }).click();
    await expect(
      page.getByRole("heading", { name: "What brought you to OPS?" }),
    ).toBeVisible();

    await page.getByRole("radio", { name: "Learn to analyze companies" }).click();
    await expect(
      page.getByRole("heading", { name: "Where are you starting from?" }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "I know some basic investing terms" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Which best describes your current investing access?",
      }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "I use a paper-trading or simulation account" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "What would meaningful progress look like for you?",
      }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "Evaluate whether a company is attractive" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "How confident do you currently feel making an investment decision?",
      }),
    ).toBeVisible();

    await page.getByRole("radio", { name: "Somewhat confident" }).click();
    await expect(
      page.getByRole("heading", { name: "Which best describes you?" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Skip" }).click();

    await expect(page.getByText("Your OPS starting point")).toBeVisible();
    await expect(page.getByText("Goal")).toBeVisible();
    await expect(page.getByText("Recommended starting point")).toBeVisible();
    await expect(page.getByText("Finance Foundations")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Begin my first lesson" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore all courses" }),
    ).toHaveAttribute("href", "/courses");
  });

  test("guest answer persists across reload; resumes at first unanswered", async ({ page }) => {
    await page.goto("/start");
    await page.getByRole("button", { name: "Begin" }).click();
    await page
      .getByRole("radio", { name: "Understand how investing works" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Where are you starting from?" }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Where are you starting from?" }),
    ).toBeVisible();
  });

  test("retake flag forces restart at Q1", async ({ page }) => {
    await page.goto("/start");
    await page.getByRole("button", { name: "Begin" }).click();
    await page
      .getByRole("radio", { name: "Understand how investing works" })
      .click();

    await page.goto("/start?retake=1");

    await expect(
      page.getByRole("heading", { name: "What brought you to OPS?" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Begin" })).toBeHidden();
  });
});
```

- [ ] **Step 2: Run E2E**

Run: `npm run test:e2e -- e2e/onboarding.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 3: Commit**

```bash
git add e2e/onboarding.spec.ts
git commit -m "test(onboarding): add E2E spec for guest flow, resume, retake"
```

---

## Self-Review (run before declaring the plan complete)

After all tasks land, run the full check suite once and confirm:

- [ ] `npm run typecheck` — PASS.
- [ ] `npm run lint` — PASS.
- [ ] `npm run test` (vitest) — PASS; all onboarding unit/component tests green.
- [ ] `npm run test:e2e` (Playwright) — PASS; onboarding E2E green.
- [ ] `npm run build` — PASS; `/start` and `/start?retake=1` both build.

## Spec coverage check

Every section of `docs/superpowers/specs/2026-08-05-onboarding-survey-design.md` is implemented by at least one task:

- **Routes, entry points, flow** — Task 12 (route), Task 13 (account menu + soft prompt), Task 14 (homepage hero CTA), Task 11 (in-flow state machine).
- **Persistence timing + retake atomicity** — Task 6 (store), Task 11 (retake buffering).
- **Data model** — Task 1 (migration + types).
- **Recommendation logic** — Task 3.
- **Merge logic** — Task 4.
- **Questions** — Task 2.
- **Components** — Tasks 8 (Question + Card), 9 (Intro), 10 (Results), 11 (Flow + ScanLine), 13 (Prompt).
- **Visual & interaction spec** — Tasks 8–11 (Tailwind classes verbatim from the spec).
- **Edge cases** — Task 6 (network failure, merge on auth), Task 11 (resume on refresh, retake atomicity, completed → results), Task 13 (prompt dismissal).
- **KPIs unlocked** — Schema columns in Task 1 + answer writes in Task 6 make the KPI queries in the spec trivially expressible in SQL. No analytics dashboard built here (out of scope).
- **Testing strategy** — Tasks 3, 4, 5, 6, 8, 10, 11, 15 cover every layer listed in the spec's testing strategy.
