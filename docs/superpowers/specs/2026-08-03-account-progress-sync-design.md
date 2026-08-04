# Account & Progress Sync — Design Spec

**Date:** 2026-08-03
**Scope:** Phase 1 — optional user accounts that sync lesson-completion progress to the cloud, with guest (localStorage) fallback and a one-time merge on first login.
**Status:** Approved in brainstorm (2026-08-03)
**Related:** the existing per-module localStorage hooks in `lib/*-progress.ts` (e.g. `lib/cb-progress.ts`, `lib/fi-progress.ts`)

## Problem

All lesson-completion progress today is **browser-local only**. Nine module hooks (`cb`, `capm`, `em`, `eq`, `fi`, `if`, `pv`, `pt`, `rr`) each independently read/write a `localStorage` key (e.g. `ops-m3-completion-v1`) holding a `Record<string, boolean>` of completed lesson slugs. There is no backend, no database, and no auth. Consequence: progress is lost when a user clears their browser, switches devices, or switches browsers. There is no identity to attach progress to.

## Goal

Let users **optionally** create an account (email/password or Google). While signed in, the same completion data they already produce syncs to a per-user cloud document, persists across devices/browsers, and survives clearing the browser. Existing localStorage progress is **merged** into the account on first login so no one loses work. Unsigned visitors keep today's exact experience — accounts never gate the site.

## Approach chosen

**Supabase (Postgres + Auth + Row-Level-Security).** Supabase Auth provides email/password (with verification + reset), Google OAuth, and cookie-based sessions via `@supabase/ssr`. A single `jsonb` column stores each user's full completion document, and RLS guarantees a user can only ever touch their own row.

The nine duplicated module hooks are unified behind **one progress store** that owns both localStorage (guest) and cloud (signed-in) persistence plus the merge logic. Module hooks become thin adapters with their public API unchanged, so no lesson component is touched.

Rejected alternatives:
- **Auth.js (NextAuth v5) + Neon Postgres** — most control and no auth-vendor lock-in, but the most plumbing: we'd build/maintain the auth glue (sessions, password hashing, an email provider for verification). Disproportionate effort for this feature.
- **Clerk + Neon Postgres** — polished hosted auth UI with the least custom code, but a tighter free tier (10k MAU) and a paid product past it; two vendors instead of one; less natural fit for the jsonb document model.

Rationale for Supabase: purpose-built for exactly this pattern (auth + a flexible per-user document + RLS), the jsonb doc makes the future "richer per-lesson state" upgrade a non-migration, and it reaches working cloud-synced progress with the fewest moving parts. Free tier: 500MB DB, 50k MAU.

## Architecture

### Stack & clients
- New dependencies: `@supabase/supabase-js`, `@supabase/ssr`.
- **Browser client** (`lib/supabase/client.ts`) — `createBrowserClient(url, anonKey)`; used by the progress store for client-side reads/writes under RLS.
- **Server client** (`lib/supabase/server.ts`) — `createServerClient` over cookies; used in Server Components/Route Handlers for session-aware rendering.
- **Middleware** (`middleware.ts`) — calls the Supabase session refresh so auth tokens stay alive across requests without re-login (the standard `@supabase/ssr` pattern).
- **No service-role key in the browser.** The service role is server/tests only. The browser uses the anon key; isolation is enforced by RLS, not application code.

### Environment
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-safe).
- `SUPABASE_SERVICE_ROLE_KEY` (server/tests only — never exposed to the client; used by E2E assertions against the test project).

### Data model — one table, one row per user

```sql
create table public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  completion jsonb      not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "own progress read"
  on public.user_progress for select
  using (user_id = auth.uid());

create policy "own progress insert"
  on public.user_progress for insert
  with check (user_id = auth.uid());

create policy "own progress update"
  on public.user_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

`completion` is keyed by the **same localStorage keys the app already uses**, so existing data maps 1:1 and a new module needs zero migration:

```json
{
  "ops-m3-completion-v1": { "fixed-income-bond-markets-cash-flows-discount-bonds": true },
  "ops-m8-completion-v1": { "npv-rule": true, "irr-and-payback": true }
}
```

A row is created via **upsert on first write** (no DB trigger). `updated_at` is set by the app in the upsert payload. The SQL above lives in a setup migration applied to the Supabase project (`supabase/migrations/0001_user_progress.sql`).

### The unified progress store (`lib/progress/store.ts`)

One source of truth holding the whole document:

```ts
type ProgressDoc = Record<string, Record<string, boolean>>;
type SyncStatus = "guest" | "synced" | "saving" | "error" | "offline";

interface ProgressStore {
  ready: boolean;
  syncStatus: SyncStatus;
  getModuleCompletion(moduleKey: string): Record<string, boolean>;
  isComplete(moduleKey: string, slug: string): boolean;
  markComplete(moduleKey: string, slug: string): void;
}
```

A `<ProgressProvider>` mounts in `app/layout.tsx` above `SiteShell`, sharing one store + one browser client across the app. The store holds the `ProgressDoc` in React state; module adapters select their slice, so components re-render reactively.

**Existing module hooks become adapters** — public API unchanged, so no lesson component edits:

```ts
// inside useCBProgress()
const moduleKey = "ops-m8-completion-v1";
const store = useProgressStore();
const completion = store.getModuleCompletion(moduleKey);
return {
  ready: store.ready,
  completion,
  isComplete: (slug) => Boolean(completion[slug]),
  markComplete: (slug) => store.markComplete(moduleKey, slug),
};
```

The module lesson lists (e.g. `CB_MODULE_LESSONS`) stay where they are — they're data, not progress state.

## Auth & session flow

### Providers
- **Email/password:** Supabase Auth handles signup, email verification, and password reset. Email confirmation is **required** before first login (secure default). Supabase's built-in email service covers verification + reset out of the box; swapping to custom SMTP (e.g. Resend) later is a config change, not code.
- **Google OAuth:** configured in the Supabase dashboard; `signInWithOAuth({ provider: "google", redirectTo: origin/auth/callback })`.

### Routes (new `(auth)` route group — accounts are optional and do not gate the site)
- `/signup` — email/password form + "Continue with Google".
- `/login` — email/password form + "Continue with Google".
- `/auth/callback` — exchanges the OAuth/confirmation code for a session, then redirects to the originating page (or `/`).
- `/forgot-password` — sends reset email.
- `/auth/reset-password` — sets a new password after clicking the email link; handles expired links.

After any auth action the user lands back where they were — accounts never interrupt the learning flow.

## Progress sync & merge logic

**Guest (logged out)** — exactly today's behavior. Truth = localStorage (one key per module), custom events for in-tab sync, no network. `syncStatus = "guest"`.

**Signed in**:
1. **Hydrate** — load the cloud `completion` doc.
2. **Merge on first login** — `merged = unionDocs(localStorageDoc, cloudDoc)`, a **per-flag union**. Because completion is **monotonic** (flags only ever turn true), set-union is always correct — there are no real conflicts to resolve and no last-write-wins needed. The pure `unionDocs` lives in `lib/progress/merge.ts`.
3. **Write-back merged** — upsert to the cloud **and** write to localStorage (keeps guest mode consistent if the user later signs out).
4. **Writes (`markComplete`)** — optimistic: update memory + localStorage immediately, then fire-and-forget an upsert of the merged doc to the cloud. `syncStatus` moves to `"saving"` then `"synced"`, or `"error"`/`"offline"` on failure (with retry on the next change).

**Multi-device (v1, intentionally simple):** fetch + union on login and on tab focus/`visibilitychange`. Supabase Realtime subscriptions are a clean future upgrade but are out of scope for v1. The monotonic-union rule means even a stale local cache self-heals on next load.

**Cross-tab (guest):** the store listens to the browser `storage` event and unions into its doc, preserving today's multi-tab behavior.

**Why this is safe:** monotonic completion makes the whole sync model conflict-free. Worst case (network failure) the local write still succeeds and the cloud write retries on the next change — the user never loses progress.

## UI / UX

- **Header affordance (`SiteHeader`):** logged out → "Sign in" link; logged in → email/avatar dropdown with "Sign out". A compact **sync indicator** beside it reads from `syncStatus`: `Synced` / `Saving…` / `Offline — saved locally`.
- **Auth pages:** minimal, high-contrast forms built from **existing UI primitives** (`GlassPanel`, `Button`, `SectionLabel`) to match the premium dark finance aesthetic — no monospace, thin borders, subtle glow, sentence-case labels (per `AGENTS.md`). Each page offers "Continue with Google".

## Error handling

- **Network/offline:** the optimistic local write always succeeds; the cloud write retries on the next change; the indicator shows `Offline`/`error`. The user is never blocked and never loses progress.
- **Email verification / reset:** clear "check your email" messaging + resend; expired-link handling on the reset page.
- **OAuth failures:** surfaced on `/auth/callback` with a retry.
- **Session expiry:** middleware refreshes silently; if truly expired, the user transparently falls back to guest mode (local progress intact).
- **Supabase free-tier email limits:** graceful messaging on rate limit.

## Testing

- The project already has **Playwright** (`^1.61.1`) → E2E is the established bar.
- **Unit (highest value):** the pure `unionDocs` merge and the store's offline logic — isolated, fast, deterministic.
- **E2E flows:** guest completion (no network); sign-up/confirm; **merge on first login** (seed localStorage, sign in, assert union in cloud + UI); mark-complete-while-signed-in (assert cloud doc updated); sign-out keeps progress via localStorage; two-context multi-device union.
- **Test infra:** Supabase Auth isn't friendly to fully isolated E2E, so tests use a **dedicated test Supabase project** + a seeded test user, and the auth boundary is mocked for store unit tests.

## Prerequisites

A Supabase project with: the `user_progress` table + RLS migration applied; Google OAuth provider configured with redirect to `<origin>/auth/callback`; email templates left at defaults. `.env.local` populated with the three env vars above.

## Files touched

**New**
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts` — Supabase clients + session refresh.
- `middleware.ts` (root) — invoke Supabase session refresh.
- `lib/progress/store.ts` — unified store, `ProgressProvider`, `useProgressStore`.
- `lib/progress/merge.ts` — pure `unionDocs`.
- `app/(auth)/signup/page.tsx`, `login/page.tsx`, `forgot-password/page.tsx`, `auth/reset-password/page.tsx`, `auth/callback/route.ts`.
- `supabase/migrations/0001_user_progress.sql`.
- `.env.example`.
- Tests: `lib/progress/merge.test.ts` (unit) + Playwright specs.

**Modified**
- `app/layout.tsx` — wrap tree in `<ProgressProvider>`.
- `components/layout/SiteHeader.tsx` — account affordance + sync indicator.
- `lib/*-progress.ts` (9 files) — refactor hooks to delegate to the store; keep public API and module lesson data.
- `package.json` — add `@supabase/supabase-js`, `@supabase/ssr`.

## Unchanged

All lesson components, the module lesson lists, page content/markup, the theme system, and the existing UI primitives. No lesson call site changes — the module hook APIs are preserved.

## Out of scope (later phases)

- **Phase B** — richer per-lesson interactive state (submitted answers, slider/lab states such as `lib/capm-lesson77-state.ts`) persisted under each module key; Supabase Realtime subscriptions for live cross-device push.
- Paid tiers / content gating.
- Account/profile management UI beyond sign-out.
- Additional providers (GitHub, magic link) and custom SMTP.

## Verification

- `npm run typecheck` (`tsc --noEmit`), `next lint`, `next build`.
- Unit tests for `unionDocs` + store offline logic.
- Playwright flows above, against the dedicated test Supabase project.
