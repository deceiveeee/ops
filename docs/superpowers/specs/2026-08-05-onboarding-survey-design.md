# Frictionless Onboarding Survey — Design Spec

**Date:** 2026-08-05
**Scope:** A `/start` route that captures five core KPI questions (plus one optional segmentation question) from new and returning users in a one-question-per-screen full-screen intake, persists answers for guests (localStorage) and authed users (new `user_onboarding` table), computes a recommended starting course + next step, and reveals a personalized "Your OPS starting point" result card.
**Status:** Approved in brainstorm (2026-08-05)
**Related:** existing `lib/progress/store.tsx` (pattern this mirrors), `data/courses/courses.ts` (course/module structure), `AGENTS.md` (visual direction).

## Problem

OPS currently has no mechanism to capture the entering state of a learner: their goal, prior experience, investing access, ambition, and decision confidence. Without this baseline, the project cannot (a) recommend a sensible starting course to a new visitor, (b) measure whether the curriculum actually moves a learner's confidence or readiness, or (c) tell whether it is reaching its intended audience. A traditional survey would collect this, but a traditional survey also creates friction and feels like administrative paperwork — undermining the cinematic, finance-terminal feel the rest of the product works hard to establish.

## Goal

Capture the entering state of every learner in a way that:

1. **Does not feel like a survey.** Reads like a Bloomberg-terminal intake — one question at a time, full-screen, animated transitions.
2. **Works identically for guests and signed-in users.** No auth gate. Guests' answers live in localStorage; signed-in users' answers sync to a dedicated table.
3. **Produces a concrete, personalized payoff at the end** — a "Your OPS starting point" card that recommends a primary course and a next step, with a deep-link to the recommended course's landing page.
4. **Yields clean analytics.** A dedicated table with typed columns enables real SQL KPI queries (distributions, funnels, cross-tabs), not JSONB spelunking.
5. **Pairs with a future exit survey** to measure change in confidence over the course (out of scope here; schema does not block it).

## Approach chosen

**Dedicated `user_onboarding` table + one-question-per-screen full-screen intake at `/start`.** Rejected alternatives considered during brainstorm:

- **Reuse the existing `user_progress.completion` JSONB** with an `ops-onboarding-v1` key. Zero schema work and free union-merge, but KPI queries would require JSONB spelunking, which works directly against the measurement purpose of the feature. Rejected.
- **Hybrid — guests in localStorage only, authed in table, no merge.** Cleanest analytics, but a guest who takes the survey and then signs up loses their answers. Bad UX. Rejected.
- **One-question-per-screen intake vs. single-page scroll brief vs. compact Typeform-style card.** One-question-per-screen gives each question full attention (better data), matches the AGENTS.md "immersive full-screen sections for high-impact moments" pattern (onboarding is exactly such a moment), and is the strongest counter to the "survey" feel.

The chosen approach is the only one that simultaneously serves the measurement purpose, the guest/authed parity, and the product's creative direction.

## Architecture

### Route

- **`/start`** — server-component shell in the `(marketing)` route group. No auth gate. Wraps a client `<OnboardingFlow/>` in `<Suspense>`.
- **`/start?retake=1`** — same route, but the flow ignores any existing `completed_at` and starts at Q1, overwriting the row on completion. Reached only from the account menu's "Update my starting point" link.

### Entry points

- **Homepage hero CTA** — "Find your starting point" → `/start`.
- **Soft one-time prompt** — dismissible toast/banner shown on the next page load for signed-in users who have not yet completed onboarding. **Once dismissed it is never shown again** (a `ops-onboarding-prompt-dismissed` flag in localStorage; for authed users, also reflected in a boolean column on `user_onboarding` so it survives cross-device). The user can still reach the survey anytime via the account menu.
- **Account menu** — always exposes "Update my starting point" → `/start?retake=1`.

### Screen flow

```
intro  →  q1  →  q2  →  q3  →  q4  →  q5  →  q6 (optional)  →  results
```

- **Strictly one-directional.** No Back button. A misclick cannot be undone in-flow. This is intentional — keeps the experience always moving forward, like a market scanner.
- **Returning completed user on `/start`** → lands directly on the results screen (no in-page retake).
- **Retake only via `/start?retake=1`** from the account menu.
- **Browser refresh mid-survey** → answers restore from localStorage; flow resumes at the first unanswered question.

### Persistence timing

- **Initial onboarding:** each answer writes immediately to localStorage (and to `user_onboarding` if authed). This means even abandoned surveys produce partial KPI signal.
- `completed_at` is set only when the results reveal renders. "Has user onboarded?" = `completed_at IS NOT NULL`.
- Merge-on-signup carries only **completed** snapshots (an abandoned guest survey restarts fresh after signup). Merge semantics are "keep the row with the newer `updated_at`" — this is a snapshot, not an accumulating document like the lesson-completion store.
- **Retake (`?retake=1`) is atomic.** New answers are buffered in React state and only flushed to localStorage/Supabase when `markComplete()` fires on the results reveal. Abandoning a retake mid-flow (closing the tab, navigating away) leaves the user's previous onboarding row intact. This prevents a misclicked "Update my starting point" from clobbering a previously-completed snapshot one question at a time.

## Data model

### Migration `supabase/migrations/0002_user_onboarding.sql`

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

### `answers` JSONB shape

Keyed by question id, value = the option id the user picked:

```ts
type OnboardingAnswers = {
  goal:        GoalOption;        // q1
  experience:  ExperienceOption;  // q2
  access:      AccessOption;      // q3
  outcome:     OutcomeOption;     // q4
  confidence:  ConfidenceOption;  // q5
};
```

The Q6 segmentation answer is stored as the top-level `segment` column (not inside `answers`), since it is optional and analytically useful on its own.

### Top-level columns

- `recommended_course_slug` and `recommended_next_step` — the **computed** recommendation, cached at completion time so it can be rendered later without recomputing. Computed by the pure function `recommendCourse(answers)` (see below).
- `confidence_tier` — promoted out of `answers.confidence` into its own column for trivial `GROUP BY` analytics.
- `segment` — promoted out of Q6 for the same reason; `null` when skipped.
- `completed_at` — distinct from `updated_at` so partial (in-progress) rows can be distinguished from completed rows in queries.
- `prompt_dismissed` — boolean, false on insert. Set to true when the user dismisses the soft prompt. The soft-prompt check is `completed_at IS NULL AND prompt_dismissed = false`.

## Recommendation logic

### Pure function

`lib/onboarding/recommend.ts` exports:

```ts
function recommendCourse(answers: OnboardingAnswers): {
  primaryCourseSlug: string;
  nextStepCopy: string;
}
```

Pure, no React, no Supabase. Fully unit-testable.

### Mapping table

Maps `(goal, experience)` → `(primary course, next-step copy)`:

| goal | experience | primary course | next-step copy |
|---|---|---|---|
| Understand how investing works | any | Finance Foundations | "Begin with the foundations pathway, then move into securities." |
| Learn to analyze companies | new / basics | Finance Foundations | "Work through equities and valuation, then try a company case." |
| Learn to analyze companies | markets / paper / real / independent | Finance Foundations | "Complete the valuation pathway, then begin Investment Foundations." |
| Build a diversified portfolio | new / basics | Finance Foundations | "Start with risk and return, then build up to portfolio theory." |
| Build a diversified portfolio | markets+ | Investment Foundations | "Begin Investment Foundations, then revisit portfolio theory in Finance Foundations." |
| Make better investment decisions | any | Investment Foundations | "Start with Investment Foundations, then ground yourself in Finance Foundations." |
| Prepare for a class or competition | any | Finance Foundations | "Take the full Finance Foundations sequence as your backbone." |
| Explore finance as a career | any | Finance Foundations | "Take the full Finance Foundations sequence, then Investment Foundations." |
| I am still figuring that out | any | Finance Foundations | "Start at the beginning — the foundations pathway will help you decide." |

### "Pathway" language caveat

The codebase has `ModuleRole` tags (`foundation`, `security-pricing`, `risk-and-portfolio`, etc.) but **no first-class "pathway" object yet**. For V1, phrases like "valuation pathway" / "foundations pathway" / "portfolio theory" are **copy strings only** — they reference the relevant module's topic, not a real pathway abstraction. The primary CTA deep-links to the recommended course's landing page (`/courses/<slug>`), not to a per-pathway URL. If real pathway objects (a `pathways` table, dedicated URLs) are desired later, that is a separate project. The current spec does not promise pathway infrastructure the code cannot deliver.

## Questions (single source of truth)

`lib/onboarding/questions.ts` holds the typed array used by both the flow UI and the recommendation function. The five core questions and one optional question, exactly as specified in the brainstorm:

1. **`goal`** — "What brought you to OPS?" / "Choose the outcome that matters most to you." Options: understand-how-investing-works, learn-to-analyze-companies, build-a-diversified-portfolio, make-better-investment-decisions, prepare-for-a-class-or-competition, explore-finance-as-a-career, still-figuring-that-out.
2. **`experience`** — "Where are you starting from?" Options: completely-new, know-some-basic-terms, follow-markets-no-investments, used-paper-trading, made-real-investments, analyze-independently.
3. **`access`** — "Which best describes your current investing access?" Options: no-account, paper-or-simulation, custodial-or-family, own-account, prefer-not-to-say.
4. **`outcome`** — "What would meaningful progress look like for you?" / "By the end of OPS, I would like to be able to…" Options: explain-how-investments-work, evaluate-company-attractiveness, build-defend-portfolio, make-first-responsible-decision, improve-existing-decisions, use-financial-models.
5. **`confidence`** — "How confident do you currently feel making an investment decision?" Five selectable cards (not a slider): not-confident-yet, slightly-confident, somewhat-confident, confident, very-confident. Helper text: "Confidence does not affect your course placement. It helps OPS measure how your decision-making develops."
6. **`segment`** *(optional)* — "Which best describes you?" Options: middle-school, high-school, college-student, adult-learner, educator-or-parent, prefer-not-to-say. Marked "Optional · Helps us understand who we're reaching." with a visible "Skip" link that goes straight to results. Stored in the top-level `segment` column, `null` if skipped.

`access` does **not** ask for brokerage name, account balance, income, holdings, or amount invested. The wording is deliberately less intrusive than a direct "Do you have a brokerage account?".

## Components

```
app/(marketing)/start/page.tsx           — server shell, wraps <OnboardingFlow/> in Suspense
components/onboarding/
  OnboardingFlow.tsx                     — client state machine (intro → q1…q6 → results)
  OnboardingIntro.tsx                    — headline-only intro frame + Begin CTA
  OnboardingQuestion.tsx                 — renders one question + its AnswerCards
  AnswerCard.tsx                         — single selectable card (radio semantics)
  ProgressScanLine.tsx                   — 5-segment top indicator
  OnboardingResults.tsx                  — reveal screen
lib/onboarding/
  types.ts                               — OnboardingAnswers, QuestionOption, etc.
  questions.ts                           — single source of truth for the 5+1 questions
  recommend.ts                           — pure recommendCourse(answers) function
  store.tsx                              — OnboardingProvider + useOnboarding() (mirrors progress store)
  localStorage.ts                        — guest read/write helpers
supabase/migrations/0002_user_onboarding.sql
```

### The onboarding store (`lib/onboarding/store.tsx`)

Mirrors the existing `lib/progress/store.tsx` pattern almost exactly:

- `OnboardingProvider` reads from localStorage on mount.
- If the session is authed, fetches the row from `user_onboarding`, **merges with localStorage using "newer `updated_at` wins"** (not union — this is a snapshot), writes the merged result back to both stores.
- API:
  - `answers: OnboardingAnswers` — current answers
  - `setAnswer(qid, value)` — writes immediately to localStorage + Supabase if authed, updates `updated_at`
  - `markComplete()` — sets `completed_at` (called when the results reveal renders)
  - `isComplete: boolean`
  - `completedAt: string | null`
  - `recommended: { primaryCourseSlug, nextStepCopy } | null` — the computed recommendation, available after `markComplete`
- No API route needed — direct client writes to the RLS-protected table, identical to the progress store.

### State machine inside `OnboardingFlow`

- States: `intro` → `q1` → `q2` → `q3` → `q4` → `q5` → `q6` → `results`.
- On answer-tap: `setAnswer(qid, value)` → Motion `AnimatePresence mode="wait"` (slide + fade) → advance. A 280ms beat between selection and advance so the user sees their selection confirm.
- Returning user who already completed → land on `results` (no retake affordance on this screen).
- `?retake=1` query param → ignore `completed_at`, start at `q1`, overwrite on completion.
- **Keyboard:** arrow keys move between cards, Enter/Space selects.

## Visual & interaction spec (per AGENTS.md)

**Atmosphere:** Bold-flat-minimalism pattern. All five question screens share an identical visual frame — restraint is the creative choice. Only the `ProgressScanLine` communicates progression.

- **Base:** `bg-ink-950` full-screen, centered content max-w-2xl.
- **Backdrop texture:** one faint SVG horizontal chart-line at opacity ≈ 0.03 fixed behind content — gives "finance terminal" feel without competing with the question.
- **No per-question color shifts, no particle effects, no glow halos on questions** — those would distract from the data-capture moment, which is the whole point.

**ProgressScanLine** (top of screen, fixed):

- 5 thin segments (Q1–Q5; the optional Q6 doesn't fill a segment).
- Empty: `bg-white/10`. Filled: `bg-accent-cyan` with a subtle width animation.
- Most-recently-filled segment gets a 400ms shimmer sweep, then settles.
- Stays mounted across question transitions so it reads as continuous.

**Question screen** (per question):

- Prompt in `font-display` (Fraunces), `text-[36px] md:text-[44px] leading-[1.1] text-slate-50`.
- Helper text (where present, e.g. confidence disclaimer) in `text-[14px] text-slate-400` below prompt, `tracking-[0.01em]`, sentence case.
- `AnswerCard`s: vertical stack on mobile, 2-col grid on `md+`.
- `AnswerCard` states:
  - Default: glass-panel style, `border border-white/10 bg-white/[0.02]`, label in `font-sans text-[16px] text-slate-200`.
  - Hover: `border-accent-cyan/40`, subtle outer glow.
  - Selected (briefly visible during the slide-out): `border-accent-cyan`, glow, label brightens to `text-slate-50`.

**Transition between questions** (Motion `AnimatePresence mode="wait"`):

- Outgoing: `opacity 1→0`, `x: 0→-16`, 200ms `easeOut`.
- Incoming: `opacity 0→1`, `x: 16→0`, 220ms `easeOut`.
- **Reduced motion** (`prefers-reduced-motion: reduce`): opacity only, no `x`, 150ms.

**Auto-advance:** selecting a card triggers advance after a 280ms beat (so the user sees their selection confirm) — not instant, not slow.

**Results reveal** — the one moment that earns bigger motion:

- Card scales in: `scale: 0.96→1`, `opacity: 0→1`, 420ms, with a single soft accent-cyan glow halo behind the card that fades over 800ms.
- Layout: vertical label/value rows (`Goal`, `Current experience`, `Recommended starting point`, `Suggested next step`).
- Labels: `text-[12px] uppercase tracking-[0.02em] text-slate-500` (these are small label eyebrows, not body — `uppercase + tracking` is acceptable for label eyebrows per AGENTS.md; body stays sentence case).
- Recommended course row emphasized: larger value, `text-accent-cyan`.
- Primary CTA `Begin course`: filled `accent-cyan` button, deep-links to the recommended course's landing page (`/courses/<slug>`).
- Secondary `Explore all courses`: muted text link below → `/courses`.

**Fonts:** Fraunces (`font-display`) for headlines, Inter (`font-sans`) for everything else. **No `font-mono` anywhere** (hard project rule).

## Edge cases

- **Returning completed user on `/start`** → lands directly on results screen (no in-page retake).
- **Retake via account menu** → `/start?retake=1` forces the flow to Q1, overwrites the row on completion.
- **Browser refresh mid-survey** → answers restore from localStorage, flow resumes at first unanswered question. Works because the flow is strictly one-directional.
- **Guest abandons mid-survey** → partial answers persist locally, `completed_at` stays null, soft prompt reappears on next visit. No merge on a later signup.
- **Guest completes, then signs up** → snapshot merges to `user_onboarding` using "newer `updated_at` wins".
- **Authed user network failure during `setAnswer`** → localStorage write still succeeds; sync status shows `error`/`offline` exactly like the progress store. No data lost.
- **Direct external deep-link to `/start`** → works, no auth required.
- **`?retake=1` when user hasn't completed yet** → no-op for the flag; flow starts at Q1 anyway.
- **Mobile:** full-screen sections, single column on mobile, prevent body scroll behind.
- **Accessibility:** cards are a real radio group (`role="radiogroup"`, `aria-checked`); focus the question prompt on each transition; reduced-motion fallback covered above.

## KPIs unlocked

The original purpose of this survey is measurement. The dedicated table makes these queries trivial:

- **Distributions:** goal, experience, access, outcome ambition, confidence tier, segment.
- **Funnel:** starts → Q1 answered → … → Q5 answered → completed (drop-off per question).
- **Cross-tabs:** confidence × segment, goal × experience, access × confidence.
- **Future pre/post measurement:** confidence-at-entry vs confidence-at-exit (paired with a later exit survey — out of scope here), confidence change vs assessment/project results.

## Testing strategy

- **`lib/onboarding/recommend.test.ts`** — parametrized unit tests for every cell of the recommendation matrix (one assert per `goal × experience` combo).
- **`lib/onboarding/merge.test.ts`** — merge semantics: "newer wins", completed vs partial, missing `updated_at`.
- **`lib/onboarding/localStorage.test.ts`** — read/write round-trip, malformed JSON.
- **`lib/onboarding/store.test.tsx`** — provider behavior, mirroring `lib/progress/store.test.tsx`.
- **Component tests** (vitest + Testing Library): full flow intro→results, keyboard navigation, optional-skip path, results renders the right recommendation for given answers.
- **E2E** (Playwright): guest completes flow → answers in localStorage; signup → row appears in `user_onboarding` with correct recommendation; `?retake=1` overwrites existing row.

## Out of scope

- **Exit survey** for paired pre/post measurement — separate future project. Current schema (PK = `user_id`) does not block it; an exit survey would be its own table.
- **Real pathway objects** (a `pathways` table, dedicated pathway URLs) — separate future project. V1 uses copy-only pathway language.
- **Live market data** in the visual treatment — static SVG backdrop only, per AGENTS.md preference for static/mock data unless live data is explicitly requested.
- **Admin analytics dashboard** for the KPI queries above — the schema makes them *possible*; building a dashboard is a separate project.
