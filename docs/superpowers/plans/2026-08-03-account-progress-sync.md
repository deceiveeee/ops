# Account & Progress Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional user accounts (email/password + Google) that sync existing lesson-completion progress to Supabase, with guest localStorage fallback and a one-time merge on first login.

**Architecture:** Supabase (Postgres + Auth + RLS) stores one `jsonb` completion document per user. A unified `<ProgressProvider>` store owns both localStorage (guest) and cloud (signed-in) persistence plus a monotonic set-union merge; the nine existing per-module hooks become thin adapters with their public API unchanged. A `<SessionProvider>` exposes auth state reactively.

**Tech Stack:** Next.js 14.2.15 (App Router), `@supabase/supabase-js`, `@supabase/ssr`, React 18, TypeScript, Tailwind, vitest (unit), Playwright (E2E).

## Global Constraints

- Next.js **14.2.15** — `cookies()` from `next/headers` is **synchronous**; do not `await` it.
- **Never use monospace** typefaces (`font-mono`). Use Inter (`font-sans`) for all UI/labels/numerics (tabular figures align columns); Fraunces (`font-display`) for editorial headlines.
- Labels are **sentence case** with `tracking-[0.01em]–[0.02em]`; no `uppercase` + wide `letter-spacing`.
- Premium dark finance aesthetic: dark base (ink/navy/slate), thin borders, subtle glow, minimal accents. Auth pages reuse existing primitives (`GlassPanel`, `Button`, `SectionLabel`) — no new design system.
- **No service-role key in the browser.** Browser uses anon key + RLS only.
- Existing module localStorage keys are per-module, pattern `ops-*-completion-v*` (e.g. `ops-m3-completion-v1`). The store preserves these keys for backward compatibility.
- Accounts are **optional**; the site must work identically when signed out.
- No code comments in shipped files unless explicitly requested.

---

## File Structure

**New files**
- `vitest.config.ts`, `playwright.config.ts` — test runners.
- `lib/supabase/client.ts` — lazy browser client factory.
- `lib/supabase/server.ts` — cookie server client factory.
- `lib/supabase/middleware.ts` — session refresh helper.
- `lib/supabase/session.tsx` — `<SessionProvider>` + `useSession()`.
- `middleware.ts` (root) — invokes session refresh.
- `lib/progress/merge.ts` — pure `unionDocs`.
- `lib/progress/store.tsx` — `<ProgressProvider>` + `useProgressStore()`.
- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/(auth)/forgot-password/page.tsx`, `app/(auth)/auth/reset-password/page.tsx`, `app/(auth)/auth/callback/route.ts`.
- `supabase/migrations/0001_user_progress.sql`.
- `.env.example`.
- Tests: `lib/progress/merge.test.ts`, `lib/supabase/session.test.tsx`, `lib/progress/store.test.tsx`, `components/layout/SiteHeader.test.tsx`, `e2e/progress.spec.ts`.

**Modified files**
- `app/layout.tsx` — mount `<SessionProvider>` + `<ProgressProvider>`.
- `components/layout/SiteHeader.tsx` — account affordance + sync indicator.
- `lib/cb-progress.ts`, `lib/capm-progress.ts`, `lib/em-progress.ts`, `lib/eq-progress.ts`, `lib/fi-progress.ts`, `lib/if-progress.ts`, `lib/pv-progress.ts`, `lib/pt-progress.ts`, `lib/rr-progress.ts` — hooks delegate to the store.
- `package.json` — new deps + `test`/`test:e2e` scripts.

---

## Task 1: Test infrastructure (vitest + Playwright config)

**Files:**
- Create: `vitest.config.ts`, `tests/sanity.test.ts`
- Create: `playwright.config.ts`
- Modify: `package.json` (scripts + devDeps)

**Interfaces:**
- Produces: `npm run test` (vitest, jsdom) and `npm run test:e2e` (Playwright) scripts used by all later tasks.

- [ ] **Step 1: Install test deps**

Run:
```
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

- [ ] **Step 2: Add vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./") } },
});
```

- [ ] **Step 3: Add test setup**

Create `tests/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 4: Add Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 5: Add scripts**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

- [ ] **Step 6: Write a failing sanity test**

Create `tests/sanity.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("runs vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm run test`
Expected: 1 test passes.

- [ ] **Step 8: Commit**

```
git add vitest.config.ts playwright.config.ts tests/ package.json package-lock.json
git commit -m "chore(test): add vitest and playwright configuration"
```

---

## Task 2: Supabase SDK, clients, and middleware

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `.env.example`
- Modify: `package.json`

**Interfaces:**
- Produces: `getSupabaseBrowser()` → `SupabaseClient` (lazy, cached); `getSupabaseServer()` → `SupabaseClient` (cookie-bound); `updateSession(req)` used by `middleware.ts`.

- [ ] **Step 1: Install Supabase SDK**

Run:
```
npm i @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Add `.env.example`**

Create `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
(Values are filled by the operator from the Supabase project settings. `SUPABASE_SERVICE_ROLE_KEY` is server/tests only.)

- [ ] **Step 3: Browser client factory**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  cached = createBrowserClient(url, key);
  return cached;
}
```

- [ ] **Step 4: Server client factory**

Create `lib/supabase/server.ts`:
```ts
import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";

export function getSupabaseServer(): SupabaseClient {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}
```

- [ ] **Step 5: Session-refresh middleware helper**

Create `lib/supabase/middleware.ts`:
```ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return supabaseResponse;
}
```

- [ ] **Step 6: Root middleware**

Create `middleware.ts`:
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```
git add lib/supabase middleware.ts .env.example package.json package-lock.json
git commit -m "feat(supabase): add client, server, and middleware helpers"
```

---

## Task 3: Database migration (user_progress + RLS)

**Files:**
- Create: `supabase/migrations/0001_user_progress.sql`

**Interfaces:**
- Produces: table `public.user_progress(user_id uuid PK, completion jsonb, updated_at timestamptz)` with RLS policies `own progress read/insert/update`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0001_user_progress.sql`:
```sql
create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  completion jsonb      not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

drop policy if exists "own progress read"   on public.user_progress;
drop policy if exists "own progress insert" on public.user_progress;
drop policy if exists "own progress update" on public.user_progress;

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

- [ ] **Step 2: Apply to the Supabase project**

Run against your Supabase project (SQL Editor in the dashboard, or `supabase db push` with the CLI):
paste the file contents and run. This is a one-time operator action; the file is the source of truth.

- [ ] **Step 3: Verify the table + policies exist**

In the Supabase dashboard Table Editor confirm `user_progress` exists with the three columns, and in Auth → Policies confirm three RLS policies on `user_progress`.

- [ ] **Step 4: Commit**

```
git add supabase/migrations/0001_user_progress.sql
git commit -m "feat(db): add user_progress table with row-level security"
```

---

## Task 4: Pure union merge (`unionDocs`)

**Files:**
- Create: `lib/progress/merge.ts`, `lib/progress/merge.test.ts`

**Interfaces:**
- Produces: `type ModuleCompletion = Record<string, boolean>`; `type ProgressDoc = Record<string, ModuleCompletion>`; `unionDocs(a: ProgressDoc, b: ProgressDoc): ProgressDoc` (per-module per-flag set union; monotonic — never clears a true flag).

- [ ] **Step 1: Write the failing tests**

Create `lib/progress/merge.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { unionDocs } from "./merge";

describe("unionDocs", () => {
  it("returns empty for two empty docs", () => {
    expect(unionDocs({}, {})).toEqual({});
  });

  it("returns the union of disjoint modules", () => {
    const a = { "ops-m3-completion-v1": { lesson1: true } };
    const b = { "ops-m8-completion-v1": { lesson2: true } };
    expect(unionDocs(a, b)).toEqual({
      "ops-m3-completion-v1": { lesson1: true },
      "ops-m8-completion-v1": { lesson2: true },
    });
  });

  it("unifies flags within the same module", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    const b = { "ops-m3-completion-v1": { b: true } };
    expect(unionDocs(a, b)).toEqual({
      "ops-m3-completion-v1": { a: true, b: true },
    });
  });

  it("never clears a true flag (monotonic)", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    const b = { "ops-m3-completion-v1": { a: false } };
    expect(unionDocs(a, b)).toEqual({
      "ops-m3-completion-v1": { a: true },
    });
  });

  it("is idempotent", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    const b = { "ops-m8-completion-v1": { b: true } };
    const u = unionDocs(a, b);
    expect(unionDocs(u, u)).toEqual(u);
  });

  it("handles a module present only on one side", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    expect(unionDocs(a, {})).toEqual(a);
    expect(unionDocs({}, a)).toEqual(a);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- lib/progress/merge.test.ts`
Expected: FAIL ("unionDocs is not defined" / module not found).

- [ ] **Step 3: Implement `unionDocs`**

Create `lib/progress/merge.ts`:
```ts
export type ModuleCompletion = Record<string, boolean>;
export type ProgressDoc = Record<string, ModuleCompletion>;

export function unionDocs(a: ProgressDoc, b: ProgressDoc): ProgressDoc {
  const out: ProgressDoc = { ...a };
  for (const key of Object.keys(b)) {
    const aMod = a[key] ?? {};
    const bMod = b[key] ?? {};
    const merged: ModuleCompletion = { ...aMod };
    for (const slug of Object.keys(bMod)) {
      if (bMod[slug]) merged[slug] = true;
    }
    out[key] = merged;
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- lib/progress/merge.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```
git add lib/progress/merge.ts lib/progress/merge.test.ts
git commit -m "feat(progress): add monotonic union merge"
```

---

## Task 5: Session provider (`<SessionProvider>` + `useSession`)

**Files:**
- Create: `lib/supabase/session.tsx`, `lib/supabase/session.test.tsx`
- Modify: `app/layout.tsx` (mount provider)

**Interfaces:**
- Produces: `<SessionProvider client?>` (subscribes to `onAuthStateChange` + initial `getUser()`); `useSession()` → `{ user: User | null, status: "loading" | "authenticated" | "unauthenticated", client: SupabaseClient }`. Optional `client` prop enables test injection.

- [ ] **Step 1: Write the failing tests**

Create `lib/supabase/session.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, renderHook, act } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider, useSession } from "./session";

type Listener = (event: string, session: { user?: { id: string } } | null) => void;

function makeFakeClient(user?: { id: string }) {
  const listeners: Listener[] = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user: user ?? null } }),
      onAuthStateChange: (cb: Listener) => {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe: () => {
          const i = listeners.indexOf(cb);
          if (i >= 0) listeners.splice(i, 1);
        } } } };
      },
    },
  } as unknown as SupabaseClient & { __emit: (e: string, s: { user?: { id: string } } | null) => void };
  (client as { __emit: (e: string, s: { user?: { id: string } } | null) => void }).__emit = (e, s) => {
    listeners.forEach((l) => l(e, s));
  };
  return client;
}

const wrapper = (client: SupabaseClient) => ({ children }: { children: React.ReactNode }) =>
  <SessionProvider client={client}>{children}</SessionProvider>;

describe("SessionProvider", () => {
  it("starts loading then resolves unauthenticated", async () => {
    const client = makeFakeClient();
    const { result } = renderHook(() => useSession(), { wrapper: wrapper(client) });
    expect(result.current.status).toBe("loading");
    await act(() => Promise.resolve());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
  });

  it("reflects emitted auth state changes", async () => {
    const client = makeFakeClient();
    const { result } = renderHook(() => useSession(), { wrapper: wrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => {
      (client as { __emit: (e: string, s: { user?: { id: string } } | null) => void })
        .__emit("SIGNED_IN", { user: { id: "u1" } });
    });
    expect(result.current.status).toBe("authenticated");
    expect(result.current.user?.id).toBe("u1");
  });

  it("exposes the client", () => {
    const client = makeFakeClient({ id: "u1" });
    const { result } = renderHook(() => useSession(), { wrapper: wrapper(client) });
    expect(result.current.client).toBe(client);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- lib/supabase/session.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the provider**

Create `lib/supabase/session.tsx`:
```tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./client";

type Status = "loading" | "authenticated" | "unauthenticated";

interface SessionValue {
  user: User | null;
  status: Status;
  client: SupabaseClient;
}

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: SupabaseClient;
}) {
  const supabase = useMemo(() => client ?? getSupabaseBrowser(), [client]);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setUser(user);
      setStatus(user ? "authenticated" : "unauthenticated");
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? "authenticated" : "unauthenticated");
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<SessionValue>(
    () => ({ user, status, client: supabase }),
    [user, status, supabase],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used within <SessionProvider>");
  return v;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- lib/supabase/session.test.tsx`
Expected: all PASS.

- [ ] **Step 5: Mount the provider in the root layout**

In `app/layout.tsx`, wrap the body content so `SiteShell` (and everything) is inside `<SessionProvider>`. Replace the `<body>` block:
```tsx
      <body className="min-h-screen font-sans antialiased">
        <SessionProvider>
          <SiteShell>{children}</SiteShell>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
```
Add the import at the top of `app/layout.tsx`:
```tsx
import { SessionProvider } from "@/lib/supabase/session";
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```
git add lib/supabase/session.tsx lib/supabase/session.test.tsx app/layout.tsx
git commit -m "feat(auth): add SessionProvider and useSession"
```

---

## Task 6: Progress store — guest (localStorage) core

**Files:**
- Create: `lib/progress/store.tsx`, `lib/progress/store.test.tsx`

**Interfaces:**
- Produces: `<ProgressProvider>` (no props) and `useProgressStore()` → `{ ready, syncStatus, getModuleCompletion, isComplete, markComplete }`. Guest mode reads/writes per-module localStorage keys matching `/^ops-.*-completion-v\d+$/`. Identity and client are derived from `useSession()`; tests inject a fake client via `<SessionProvider client={...}>`.
- Consumes: `useSession()` (Task 5), `unionDocs` (Task 4).

- [ ] **Step 1: Write the failing tests (guest mode)**

Create `lib/progress/store.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider, useProgressStore } from "./store";

const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

function guestWrapper(client: SupabaseClient = fakeClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <SessionProvider client={client}>
      <ProgressProvider>{children}</ProgressProvider>
    </SessionProvider>
  );
}

describe("ProgressProvider (guest)", () => {
  it("starts not ready, becomes ready with empty completion", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    expect(result.current.ready).toBe(false);
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.ready).toBe(true);
    expect(result.current.syncStatus).toBe("guest");
    expect(result.current.getModuleCompletion("ops-m3-completion-v1")).toEqual({});
  });

  it("marks a lesson complete and reports it", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m8-completion-v1", "npv-rule")).toBe(false);
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv-rule"));
    expect(result.current.isComplete("ops-m8-completion-v1", "npv-rule")).toBe(true);
    expect(result.current.getModuleCompletion("ops-m8-completion-v1")).toEqual({
      "npv-rule": true,
    });
  });

  it("persists to the per-module localStorage key", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.markComplete("ops-m3-completion-v1", "lesson-a"));
    expect(JSON.parse(localStorage.getItem("ops-m3-completion-v1")!)).toEqual({
      "lesson-a": true,
    });
  });

  it("hydrates from existing per-module localStorage keys", async () => {
    localStorage.setItem(
      "ops-m3-completion-v1",
      JSON.stringify({ seeded: true }),
    );
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m3-completion-v1", "seeded")).toBe(true);
  });

  it("markComplete is idempotent", async () => {
    const { result } = renderHook(() => useProgressStore(), { wrapper: guestWrapper() });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.markComplete("ops-m8-completion-v1", "x"));
    act(() => result.current.markComplete("ops-m8-completion-v1", "x"));
    expect(result.current.getModuleCompletion("ops-m8-completion-v1")).toEqual({ x: true });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- lib/progress/store.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the store (guest core; cloud wiring stubbed to guest)**

Create `lib/progress/store.tsx`:
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
import { unionDocs, type ModuleCompletion, type ProgressDoc } from "./merge";

export type { ModuleCompletion, ProgressDoc };
export type SyncStatus = "guest" | "synced" | "saving" | "error" | "offline";

interface ProgressValue {
  ready: boolean;
  syncStatus: SyncStatus;
  getModuleCompletion: (moduleKey: string) => ModuleCompletion;
  isComplete: (moduleKey: string, slug: string) => boolean;
  markComplete: (moduleKey: string, slug: string) => void;
}

const MODULE_KEY_RE = /^ops-.*-completion-v\d+$/;
const CHANGE_EVENT = "ops-progress-change";

const Ctx = createContext<ProgressValue | null>(null);

function readLocal(): ProgressDoc {
  if (typeof window === "undefined") return {};
  const doc: ProgressDoc = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !MODULE_KEY_RE.test(key)) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      doc[key] = JSON.parse(raw) as ModuleCompletion;
    } catch {
      /* ignore corrupt entry */
    }
  }
  return doc;
}

function writeModuleLocal(moduleKey: string, mod: ModuleCompletion) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(moduleKey, JSON.stringify(mod));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const userId = user?.id ?? null;

  const [doc, setDoc] = useState<ProgressDoc>({});
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("guest");
  const docRef = useRef<ProgressDoc>({});

  useEffect(() => {
    setSyncStatus(userId ? "synced" : "guest");
  }, [userId]);

  const refreshFromLocal = useCallback(() => {
    const next = readLocal();
    docRef.current = next;
    setDoc(next);
  }, []);

  useEffect(() => {
    refreshFromLocal();
    setReady(true);
    const onChange = () => refreshFromLocal();
    window.addEventListener("storage", onChange);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, [refreshFromLocal]);

  const markComplete = useCallback(
    (moduleKey: string, slug: string) => {
      const prevMod = docRef.current[moduleKey] ?? {};
      if (prevMod[slug]) return;
      const nextMod: ModuleCompletion = { ...prevMod, [slug]: true };
      const nextDoc: ProgressDoc = { ...docRef.current, [moduleKey]: nextMod };
      docRef.current = nextDoc;
      setDoc(nextDoc);
      writeModuleLocal(moduleKey, nextMod);
    },
    [],
  );

  const getModuleCompletion = useCallback(
    (moduleKey: string) => doc[moduleKey] ?? {},
    [doc],
  );
  const isComplete = useCallback(
    (moduleKey: string, slug: string) => Boolean((doc[moduleKey] ?? {})[slug]),
    [doc],
  );

  const value = useMemo<ProgressValue>(
    () => ({ ready, syncStatus, getModuleCompletion, isComplete, markComplete }),
    [ready, syncStatus, getModuleCompletion, isComplete, markComplete],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgressStore(): ProgressValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProgressStore must be used within <ProgressProvider>");
  return v;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- lib/progress/store.test.tsx`
Expected: all guest tests PASS.

- [ ] **Step 5: Commit**

```
git add lib/progress/store.tsx lib/progress/store.test.tsx
git commit -m "feat(progress): add unified progress store (guest/localStorage core)"
```

---

## Task 7: Progress store — cloud sync + merge wiring

**Files:**
- Modify: `lib/progress/store.tsx`
- Modify: `lib/progress/store.test.tsx` (add signed-in suite)

**Interfaces:**
- Consumes: `auth.users(id)` via the client → table `user_progress(user_id, completion, updated_at)`.
- Produces: signed-in behavior — on user appearance: fetch cloud → `unionDocs(local, cloud)` → write back cloud + localStorage; `markComplete` → optimistic local write + fire-and-forget upsert; `syncStatus` cycles `saving → synced | error`; offline detection via `navigator.onLine`.

- [ ] **Step 1: Add failing signed-in tests**

Append to `lib/progress/store.test.tsx` a second fake client with a controllable `user_progress` store and helpers:
```tsx
import { waitFor } from "@testing-library/react";

type UpsertPayload = { user_id: string; completion: ProgressDoc; updated_at: string };

function makeSignedClient(startUser: { id: string } | null = null) {
  const state: { rows: Record<string, ProgressDoc>; user: { id: string } | null } = {
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
        eq: (_col: string, _val: string) => ({
          single: async () => ({
            data: table === "user_progress" && state.user && state.rows[state.user.id]
              ? { user_id: state.user.id, completion: state.rows[state.user.id] }
              : null,
            error: null,
          }),
        }),
      }),
      upsert: (payload: UpsertPayload) => {
        if (table !== "user_progress" || !state.user) {
          return Promise.resolve({ error: { message: "no user" } });
        }
        state.rows[state.user.id] = payload.completion;
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
    __rows: Record<string, ProgressDoc>;
  };
}

function signedWrapper(client: ReturnType<typeof makeSignedClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <SessionProvider client={client as unknown as SupabaseClient}>
      <ProgressProvider>{children}</ProgressProvider>
    </SessionProvider>
  );
}
```
Then add tests (these describe the contract that Step 3 implements):
```tsx
describe("ProgressProvider (signed-in)", () => {
  it("merges local + cloud on first appearance and writes back", async () => {
    localStorage.setItem("ops-m3-completion-v1", JSON.stringify({ local: true }));
    const client = makeSignedClient(null);
    client.__rows["u1"] = { "ops-m3-completion-v1": { cloud: true } };
    const { result } = renderHook(() => useProgressStore(), {
      wrapper: signedWrapper(client),
    });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    client.__setUser({ id: "u1" });
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m3-completion-v1", "local")).toBe(true);
    expect(result.current.isComplete("ops-m3-completion-v1", "cloud")).toBe(true);
    expect(client.__rows["u1"]["ops-m3-completion-v1"]).toEqual({
      local: true,
      cloud: true,
    });
  });

  it("optimistically marks complete then upserts to cloud", async () => {
    const client = makeSignedClient({ id: "u2" });
    const { result } = renderHook(() => useProgressStore(), {
      wrapper: signedWrapper(client),
    });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));
    act(() => result.current.markComplete("ops-m8-completion-v1", "npv"));
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.isComplete("ops-m8-completion-v1", "npv")).toBe(true);
    await waitFor(() =>
      expect(client.__rows["u2"]?.["ops-m8-completion-v1"]?.npv).toBe(true),
    );
  });

  it("keeps local progress on cloud error", async () => {
    const client = makeSignedClient({ id: "u3" });
    (client.from as unknown) = (_t: string) => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: { message: "boom" } }),
    });
    const { result } = renderHook(() => useProgressStore(), {
      wrapper: signedWrapper(client),
    });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current.markComplete("ops-m3-completion-v1", "z"));
    expect(result.current.isComplete("ops-m3-completion-v1", "z")).toBe(true);
    await waitFor(() => expect(result.current.syncStatus).toBe("error"));
  });
});
```
Identity flows through `<SessionProvider>`: each test calls `client.__setUser(...)`, which fires the fake `onAuthStateChange`; `SessionProvider` updates `session.user`, and `ProgressProvider` (reading `useSession().user?.id`) re-runs its sync effect.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- lib/progress/store.test.tsx`
Expected: signed-in tests FAIL.

- [ ] **Step 3: Implement cloud sync in the store**

Replace `lib/progress/store.tsx` with the full implementation. The provider derives `supabase` and `liveUserId` from `useSession()` (so auth changes from `<SessionProvider>` flow straight through) and runs the sync effect keyed on `liveUserId`:
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
import { unionDocs, type ModuleCompletion, type ProgressDoc } from "./merge";

export type { ModuleCompletion, ProgressDoc };
export type SyncStatus = "guest" | "synced" | "saving" | "error" | "offline";

interface ProgressValue {
  ready: boolean;
  syncStatus: SyncStatus;
  getModuleCompletion: (moduleKey: string) => ModuleCompletion;
  isComplete: (moduleKey: string, slug: string) => boolean;
  markComplete: (moduleKey: string, slug: string) => void;
}

const MODULE_KEY_RE = /^ops-.*-completion-v\d+$/;
const CHANGE_EVENT = "ops-progress-change";

const Ctx = createContext<ProgressValue | null>(null);

function readLocal(): ProgressDoc {
  if (typeof window === "undefined") return {};
  const doc: ProgressDoc = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !MODULE_KEY_RE.test(key)) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      doc[key] = JSON.parse(raw) as ModuleCompletion;
    } catch {
      /* ignore corrupt entry */
    }
  }
  return doc;
}

function writeModuleLocal(moduleKey: string, mod: ModuleCompletion) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(moduleKey, JSON.stringify(mod));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const supabase = session.client;
  const liveUserId = session.user?.id ?? null;

  const [doc, setDoc] = useState<ProgressDoc>({});
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("guest");
  const docRef = useRef<ProgressDoc>({});
  const userIdRef = useRef<string | null>(liveUserId);
  useEffect(() => {
    userIdRef.current = liveUserId;
    setSyncStatus(liveUserId ? "synced" : "guest");
  }, [liveUserId]);

  const refreshFromLocal = useCallback(() => {
    const next = readLocal();
    docRef.current = next;
    setDoc(next);
  }, []);

  useEffect(() => {
    refreshFromLocal();
    setReady(true);
    const onChange = () => refreshFromLocal();
    const onOnline = () => setSyncStatus(userIdRef.current ? "synced" : "guest");
    const onOffline = () => setSyncStatus("offline");
    window.addEventListener("storage", onChange);
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshFromLocal]);

  useEffect(() => {
    if (!liveUserId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("completion")
        .eq("user_id", liveUserId)
        .single();
      if (cancelled) return;
      const cloud = (!error && data?.completion) ? (data.completion as ProgressDoc) : {};
      const merged = unionDocs(readLocal(), cloud);
      docRef.current = merged;
      setDoc(merged);
      for (const key of Object.keys(merged)) {
        writeModuleLocal(key, merged[key]);
      }
      if (!error) {
        await supabase
          .from("user_progress")
          .upsert({
            user_id: liveUserId,
            completion: merged,
            updated_at: new Date().toISOString(),
          });
      }
      if (!cancelled) setSyncStatus(error ? "error" : "synced");
    })();
    return () => {
      cancelled = true;
    };
  }, [liveUserId, supabase]);

  const markComplete = useCallback(
    (moduleKey: string, slug: string) => {
      const prevMod = docRef.current[moduleKey] ?? {};
      if (prevMod[slug]) return;
      const nextMod: ModuleCompletion = { ...prevMod, [slug]: true };
      const nextDoc: ProgressDoc = { ...docRef.current, [moduleKey]: nextMod };
      docRef.current = nextDoc;
      setDoc(nextDoc);
      writeModuleLocal(moduleKey, nextMod);

      const uid = userIdRef.current;
      if (!uid) return;
      if (!isOnline()) {
        setSyncStatus("offline");
        return;
      }
      setSyncStatus("saving");
      supabase
        .from("user_progress")
        .upsert({
          user_id: uid,
          completion: nextDoc,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }: { error: unknown }) => {
          setSyncStatus(error ? "error" : "synced");
        });
    },
    [supabase],
  );

  const getModuleCompletion = useCallback(
    (moduleKey: string) => doc[moduleKey] ?? {},
    [doc],
  );
  const isComplete = useCallback(
    (moduleKey: string, slug: string) => Boolean((doc[moduleKey] ?? {})[slug]),
    [doc],
  );

  const value = useMemo<ProgressValue>(
    () => ({ ready, syncStatus, getModuleCompletion, isComplete, markComplete }),
    [ready, syncStatus, getModuleCompletion, isComplete, markComplete],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgressStore(): ProgressValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProgressStore must be used within <ProgressProvider>");
  return v;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- lib/progress/store.test.tsx`
Expected: all guest + signed-in tests PASS.

- [ ] **Step 5: Mount ProgressProvider in the root layout**

In `app/layout.tsx`, place `<ProgressProvider>` inside `<SessionProvider>` and around `<SiteShell>`:
```tsx
        <SessionProvider>
          <ProgressProvider>
            <SiteShell>{children}</SiteShell>
          </ProgressProvider>
        </SessionProvider>
```
Add the import:
```tsx
import { ProgressProvider } from "@/lib/progress/store";
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```
git add lib/progress/store.tsx lib/progress/store.test.tsx app/layout.tsx
git commit -m "feat(progress): cloud sync and first-login merge"
```

---

## Task 8: Refactor the nine module hooks to store adapters

**Files:**
- Modify: `lib/cb-progress.ts`, `lib/capm-progress.ts`, `lib/em-progress.ts`, `lib/eq-progress.ts`, `lib/fi-progress.ts`, `lib/if-progress.ts`, `lib/pv-progress.ts`, `lib/pt-progress.ts`, `lib/rr-progress.ts`
- Create: `lib/progress/adapter.test.tsx`

**Interfaces:**
- Consumes: `useProgressStore()` (Task 6/7).
- Produces: each module hook keeps its existing exports and return shape (`{ ready, completion, isComplete, markComplete }`, plus `useReportXComplete(slug)`), now delegating to the store via that module's localStorage key.

- [ ] **Step 1: Write a failing adapter test using one representative hook**

Create `lib/progress/adapter.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider } from "./store";
import { useFIProgress, useReportFIComplete } from "@/lib/fi-progress";

const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider client={fakeClient}>
    <ProgressProvider>{children}</ProgressProvider>
  </SessionProvider>
);

describe("FI adapter", () => {
  it("delegates markComplete through the store", async () => {
    const { result } = renderHook(() => useFIProgress(), { wrapper });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    const slug = "fixed-income-bond-markets-cash-flows-discount-bonds";
    expect(result.current.isComplete(slug)).toBe(false);
    act(() => result.current.markComplete(slug));
    expect(result.current.isComplete(slug)).toBe(true);
    expect(JSON.parse(localStorage.getItem("ops-m3-completion-v1")!)[slug]).toBe(true);
  });

  it("useReportFIComplete marks its slug", async () => {
    const slug = "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds";
    const { result } = renderHook(() => useReportFIComplete(slug), { wrapper });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => result.current());
    expect(JSON.parse(localStorage.getItem("ops-m3-completion-v1")!)[slug]).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- lib/progress/adapter.test.tsx`
Expected: this is a **characterization (regression) test** — because the refactor preserves both the public API and the same `ops-m3-completion-v1` localStorage key, it should already PASS against the old implementation. Its purpose is to prove the adapter refactor in Steps 3–5 introduces no behavior change. If it fails before refactoring, adjust the assertions to match current behavior first.

- [ ] **Step 3: Refactor `lib/fi-progress.ts` to the adapter form**

Replace the hook implementation in `lib/fi-progress.ts`, keeping `FI_LESSON_SLUGS` and `FI_MODULE_LESSONS` exactly as they are. Replace the `readCompletion`/`writeCompletion`/`useFIProgress`/`useReportFIComplete` block with:
```ts
"use client";

import { useCallback, useMemo } from "react";
import { useProgressStore } from "@/lib/progress/store";

export const FI_LESSON_SLUGS = [
  "fixed-income-bond-markets-cash-flows-discount-bonds",
  "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
] as const;

export const FI_MODULE_LESSONS = [
  {
    slug: "fixed-income-bond-markets-cash-flows-discount-bonds",
    shortTitle: "Bond Markets and Discount Bonds",
    title:
      "Fixed-Income Securities I: Bond Markets, Cash Flows, and Discount Bonds",
    n: 1,
  },
  {
    slug: "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
    shortTitle: "Spot Rates, Forwards, and Coupon Bonds",
    title:
      "Fixed-Income Securities II: Spot Rates, Forward Rates, Yield Curves, and Coupon Bonds",
    n: 2,
  },
  {
    slug: "fixed-income-law-one-price-arbitrage-duration-convexity",
    shortTitle: "Arbitrage, Duration, and Convexity",
    title:
      "Fixed-Income Securities III: Law of One Price, Fixed-Income Arbitrage, Duration, and Convexity",
    n: 3,
  },
  {
    slug: "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
    shortTitle: "Credit Risk and Securitization",
    title:
      "Fixed-Income Securities IV: Corporate Bonds, Default Risk, Credit Spreads, and Securitization",
    n: 4,
  },
] as const;

const MODULE_KEY = "ops-m3-completion-v1";

export function useFIProgress() {
  const store = useProgressStore();
  const completion = useMemo(
    () => store.getModuleCompletion(MODULE_KEY),
    [store, store.getModuleCompletion],
  );
  const isComplete = useCallback(
    (slug: string) => Boolean(completion[slug]),
    [completion],
  );
  const markComplete = useCallback(
    (slug: string) => store.markComplete(MODULE_KEY, slug),
    [store],
  );
  return { ready: store.ready, completion, isComplete, markComplete };
}

export function useReportFIComplete(slug: string) {
  const { markComplete } = useFIProgress();
  return useCallback(() => markComplete(slug), [markComplete, slug]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- lib/progress/adapter.test.tsx`
Expected: PASS.

- [ ] **Step 5: Apply the same adapter form to the other eight hooks**

For each of `cb-progress.ts`, `capm-progress.ts`, `em-progress.ts`, `eq-progress.ts`, `if-progress.ts`, `pv-progress.ts`, `pt-progress.ts`, `rr-progress.ts`:
- Keep every exported constant/array (lesson lists, slugs) byte-for-byte unchanged.
- Replace the localStorage read/write helpers and the `useXProgress`/`useReportXComplete` implementations with the adapter form from Step 3, substituting that module's existing localStorage key (e.g. `ops-m8-completion-v1` for `cb`, `ops-m2-completion-v1` for `capm` if that is the current key — use each file's existing `COMPLETION_KEY` constant value) and the existing exported hook names.
- The key mapping is, per the current files: `cb` → `ops-m8-completion-v1`; `fi` → `ops-m3-completion-v1`; read each remaining file's `COMPLETION_KEY` and use that exact value.
- Imports at the top of each file become: `"use client";` then `import { useCallback, useMemo } from "react";` and `import { useProgressStore } from "@/lib/progress/store";`.

- [ ] **Step 6: Typecheck + full unit suite**

Run: `npm run typecheck`
Expected: no errors.
Run: `npm run test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```
git add lib/*-progress.ts lib/progress/adapter.test.tsx
git commit -m "refactor(progress): adapt module hooks to the unified store"
```

---

## Task 9: Auth routes — login, signup, OAuth callback

**Files:**
- Create: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/(auth)/auth/callback/route.ts`

**Interfaces:**
- Consumes: `getSupabaseBrowser()` (Task 2); Google provider configured in Supabase (Prerequisites).
- Produces: `/login` and `/signup` client forms that call `supabase.auth.signInWithPassword` / `signUp` / `signInWithOAuth`; `/auth/callback` exchanges the code via `supabase.auth.exchangeCodeForSession` and redirects to `next` (default `/`).

- [ ] **Step 1: Create the OAuth callback route handler**

Create `app/(auth)/auth/callback/route.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  if (code) {
    const supabase = getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
```

- [ ] **Step 2: Create the signup page**

Create `app/(auth)/signup/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  function google() {
    const supabase = getSupabaseBrowser();
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
        <GlassPanel>
          <h1 className="font-display text-[28px] font-semibold text-slate-100">Check your email</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-300">
            We sent a confirmation link to <span className="text-slate-100">{email}</span>. Click it to finish creating your account.
          </p>
          <Link href="/login" className="mt-6 inline-block text-[15px] text-accent-cyan hover:underline">
            Back to sign in
          </Link>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Create your account</h1>
        <p className="mt-2 text-[15px] text-slate-400">Save your progress and pick up on any device.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-[14px] text-red-400">{error}</p>}
          <Button type="submit" size="md" className="mt-1" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>
        <div className="my-5 h-px bg-white/10" />
        <Button variant="outline" size="md" onClick={google} className="w-full">Continue with Google</Button>
        <p className="mt-6 text-[14px] text-slate-400">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent-cyan hover:underline">Sign in</Link>
        </p>
      </GlassPanel>
    </main>
  );
}

function Field({
  label, type, value, onChange,
}: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-[16px] text-slate-100 outline-none focus:border-accent-cyan/60"
      />
    </label>
  );
}
```

- [ ] **Step 3: Create the login page**

Create `app/(auth)/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push(next);
  }

  function google() {
    const supabase = getSupabaseBrowser();
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Sign in</h1>
        <p className="mt-2 text-[15px] text-slate-400">Sync your progress to the cloud.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-[14px] text-red-400">{error}</p>}
          <Button type="submit" size="md" className="mt-1" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="my-5 h-px bg-white/10" />
        <Button variant="outline" size="md" onClick={google} className="w-full">Continue with Google</Button>
        <div className="mt-6 flex items-center justify-between text-[14px] text-slate-400">
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent-cyan hover:underline">Create account</Link>
          <Link href="/forgot-password" className="text-accent-cyan hover:underline">Forgot password?</Link>
        </div>
      </GlassPanel>
    </main>
  );
}

function Field({
  label, type, value, onChange,
}: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-[16px] text-slate-100 outline-none focus:border-accent-cyan/60"
      />
    </label>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors. (`useSearchParams` in App Router requires a Suspense boundary during static generation; if `next build` warns, wrap the returned JSX of each page in `<Suspense>`. Verify in Task 13's build.)

- [ ] **Step 5: Commit**

```
git add "app/(auth)"
git commit -m "feat(auth): add login, signup, and OAuth callback"
```

---

## Task 10: Auth routes — forgot password + reset password

**Files:**
- Create: `app/(auth)/forgot-password/page.tsx`, `app/(auth)/auth/reset-password/page.tsx`

**Interfaces:**
- Consumes: `getSupabaseBrowser()`; Supabase email templates (defaults).
- Produces: `/forgot-password` sends a reset email with `redirectTo` `/auth/reset-password`; `/auth/reset-password` reads the session from the recovery link and sets a new password.

- [ ] **Step 1: Create the forgot-password page**

Create `app/(auth)/forgot-password/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Reset your password</h1>
        {sent ? (
          <p className="mt-3 text-[16px] leading-relaxed text-slate-300">
            If an account exists for <span className="text-slate-100">{email}</span>, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-[16px] text-slate-100 outline-none focus:border-accent-cyan/60"
              />
            </label>
            {error && <p className="text-[14px] text-red-400">{error}</p>}
            <Button type="submit" size="md" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</Button>
          </form>
        )}
        <Link href="/login" className="mt-6 inline-block text-[14px] text-accent-cyan hover:underline">Back to sign in</Link>
      </GlassPanel>
    </main>
  );
}
```

- [ ] **Step 2: Create the reset-password page**

Create `app/(auth)/auth/reset-password/page.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getSupabaseBrowser().auth.getSession();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/login?reset=1");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Set a new password</h1>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] text-slate-300">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-[16px] text-slate-100 outline-none focus:border-accent-cyan/60"
            />
          </label>
          {error && <p className="text-[14px] text-red-400">{error}</p>}
          <Button type="submit" size="md" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
        </form>
      </GlassPanel>
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```
git add "app/(auth)/forgot-password" "app/(auth)/auth/reset-password"
git commit -m "feat(auth): add forgot-password and reset-password pages"
```

---

## Task 11: Header account affordance + sync indicator

**Files:**
- Modify: `components/layout/SiteHeader.tsx`
- Create: `components/layout/SiteHeader.test.tsx`

**Interfaces:**
- Consumes: `useSession()` (Task 5); `useProgressStore()` (Task 6/7).
- Produces: header shows a "Sign in" link when unauthenticated; when authenticated shows the user's email + a dropdown with "Sign out" and a sync-status chip reading from `syncStatus` (`Synced` / `Saving…` / `Offline — saved locally` / `Sync error`).

- [ ] **Step 1: Write failing tests**

Create `components/layout/SiteHeader.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider } from "@/lib/progress/store";
import SiteHeader from "./SiteHeader";

function baseClient(user: User | null) {
  return {
    auth: {
      getUser: async () => ({ data: { user } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({}),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  } as unknown as SupabaseClient;
}

function renderWith(user: User | null) {
  const client = baseClient(user);
  return render(
    <SessionProvider client={client}>
      <ProgressProvider>
        <SiteHeader />
      </ProgressProvider>
    </SessionProvider>,
  );
}

describe("SiteHeader account affordance", () => {
  it("shows Sign in when unauthenticated", async () => {
    renderWith(null);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows email and Synced when authenticated", async () => {
    renderWith({ id: "u1", email: "a@b.com" } as unknown as User);
    expect(await screen.findByText("a@b.com")).toBeInTheDocument();
    expect(screen.getByText("Synced")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- components/layout/SiteHeader.test.tsx`
Expected: FAIL (no "Sign in"/email rendering yet).

- [ ] **Step 3: Add the affordance to `SiteHeader.tsx`**

In `components/layout/SiteHeader.tsx`:
- Add imports:
```tsx
import { useSession } from "@/lib/supabase/session";
import { useProgressStore } from "@/lib/progress/store";
import { syncStatusText } from "./sync-indicator";
```
- Inside `SiteHeader()`, before the `return`, read state:
```tsx
  const { user, status, client } = useSession();
  const { syncStatus } = useProgressStore();
  const signedIn = status === "authenticated" && !!user;
```
- In the desktop actions area, replace the existing `<div className="hidden items-center gap-2 md:flex">…</div>` block with:
```tsx
        <div className="hidden items-center gap-3 md:flex">
          <SyncChip status={syncStatus} />
          {signedIn ? (
            <AccountMenu email={user!.email ?? ""} onSignOut={() => void client.auth.signOut()} />
          ) : (
            <Button href="/login" variant="outline" size="md">Sign in</Button>
          )}
        </div>
```
- Add the helper components at the bottom of the file (before `function Logo()`):
```tsx
function SyncChip({ status }: { status: ReturnType<typeof useProgressStore>["syncStatus"] }) {
  if (status === "guest") return null;
  const { label, dot } = syncStatusText(status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[13px] text-slate-300">
      <span className={dot} />
      {label}
    </span>
  );
}

function AccountMenu({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-white/10 px-3 py-1.5 text-[14px] text-slate-200 hover:bg-white/5"
      >
        {email}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-ink-950/95 p-1">
          <button
            onClick={onSignOut}
            className="w-full rounded-md px-3 py-2 text-left text-[14px] text-slate-200 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create the sync-status label map**

Create `components/layout/sync-indicator.ts`:
```ts
import type { SyncStatus } from "@/lib/progress/store";

export function syncStatusText(status: SyncStatus): { label: string; dot: string } {
  switch (status) {
    case "synced":
      return { label: "Synced", dot: "h-1.5 w-1.5 rounded-full bg-emerald-400" };
    case "saving":
      return { label: "Saving…", dot: "h-1.5 w-1.5 rounded-full bg-amber-400" };
    case "offline":
      return { label: "Offline — saved locally", dot: "h-1.5 w-1.5 rounded-full bg-slate-400" };
    case "error":
      return { label: "Sync error", dot: "h-1.5 w-1.5 rounded-full bg-red-400" };
    default:
      return { label: "Synced", dot: "h-1.5 w-1.5 rounded-full bg-emerald-400" };
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- components/layout/SiteHeader.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```
git add components/layout/SiteHeader.tsx components/layout/SiteHeader.test.tsx components/layout/sync-indicator.ts
git commit -m "feat(header): add account affordance and sync indicator"
```

---

## Task 12: Playwright E2E — guest completion + sign-in merge

**Files:**
- Create: `e2e/progress.spec.ts`, `e2e/global-setup.ts`

**Interfaces:**
- Consumes: a running dev server (`npm run dev`, started automatically by `playwright.config.ts`) and a **dedicated test Supabase project** identified by `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_KEY`, plus a seeded `E2E_USER_EMAIL` / `E2E_USER_PASSWORD`.
- Produces: E2E proof that (1) guest completion writes only to localStorage, and (2) signing in merges local + cloud.

- [ ] **Step 1: Add a global setup that seeds a test user**

Create `e2e/global-setup.ts`:
```ts
import { createClient } from "@supabase/supabase-js";

export default async function globalSetup() {
  const url = process.env.E2E_SUPABASE_URL;
  const service = process.env.E2E_SUPABASE_SERVICE_KEY;
  const email = process.env.E2E_USER_EMAIL ?? "e2e@ops.test";
  const password = process.env.E2E_USER_PASSWORD ?? "password123";
  if (!url || !service) return;

  const admin = createClient(url, service, { auth: { autoRefreshToken: false } });
  const { data } = await admin.auth.admin.listUsers();
  const existing = data?.users?.find((u) => u.email === email);
  if (!existing) {
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  }
}
```

- [ ] **Step 2: Wire global setup into the config**

In `playwright.config.ts`, add `globalSetup: "./e2e/global-setup"` to the exported config object.

- [ ] **Step 3: Write the E2E spec**

Create `e2e/progress.spec.ts`:
```ts
import { test, expect, type Page } from "@playwright/test";

async function markFirstComplete(page: Page) {
  await page.goto("/courses");
  await page.getByRole("link", { name: /finance foundations/i }).first().click();
  await page.getByRole("link", { name: /bond markets and discount bonds/i }).click();
  await page.evaluate(() => {
    const key = "ops-m3-completion-v1";
    const cur = JSON.parse(localStorage.getItem(key) ?? "{}");
    cur["fixed-income-bond-markets-cash-flows-discount-bonds"] = true;
    localStorage.setItem(key, JSON.stringify(cur));
  });
}

test("guest completion is stored locally only", async ({ page }) => {
  await markFirstComplete(page);
  const stored = await page.evaluate(() => localStorage.getItem("ops-m3-completion-v1"));
  expect(stored).toContain("fixed-income-bond-markets-cash-flows-discount-bonds");
});

test("signing in merges local progress into the cloud", async ({ page }) => {
  test.skip(!process.env.E2E_SUPABASE_URL, "no E2E Supabase project configured");
  await markFirstComplete(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL ?? "e2e@ops.test");
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD ?? "password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(courses)?$/);
  await expect(page.getByText("Synced")).toBeVisible();
  const cloudHas = await page.evaluate(async () => {
    const res = await fetch("/api/progress-debug");
    return (await res.json()).cloudHasFixedIncome as boolean;
  });
  expect(cloudHas).toBe(true);
});
```

- [ ] **Step 4: Add the debug route used by E2E**

Create `app/api/progress-debug/route.ts` (test-only; reads the signed-in user's cloud doc via the service key server-side):
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ cloudHasFixedIncome: false });
  const { data } = await supabase.from("user_progress").select("completion").eq("user_id", user.id).single();
  const completion = (data?.completion ?? {}) as Record<string, Record<string, boolean>>;
  const m3 = completion["ops-m3-completion-v1"] ?? {};
  return NextResponse.json({
    cloudHasFixedIncome: Boolean(m3["fixed-income-bond-markets-cash-flows-discount-bonds"]),
  });
}
```
(Remove this route before production release, or gate it behind `process.env.NODE_ENV !== "production"`.)

- [ ] **Step 5: Install browsers**

Run: `npx playwright install chromium`

- [ ] **Step 6: Run E2E**

Run: `npm run test:e2e`
Expected: guest test passes; merge test passes when `E2E_SUPABASE_*` env is set, otherwise it is skipped.

- [ ] **Step 7: Commit**

```
git add e2e app/api/progress-debug
git commit -m "test(e2e): guest completion and sign-in merge flows"
```

---

## Task 13: Final verification

**Files:**
- Modify (if needed): any file flagged by checks below

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. Fix any flagged issues.

- [ ] **Step 3: Unit tests**

Run: `npm run test`
Expected: all PASS.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds. If `useSearchParams` requires a Suspense boundary, wrap the returned JSX of `/login` and `/signup` in `<Suspense fallback={null}>…</Suspense>` (import from `react`) and re-run.

- [ ] **Step 5: Manual smoke (with a real Supabase project)**

- Sign up via `/signup`; confirm via email; land back on the site; header shows email + "Synced".
- Complete a lesson while signed in; refresh; completion persists.
- Sign out; header shows "Sign in"; the same lesson still shows complete (localStorage).
- Clear localStorage; sign back in; completion is restored from cloud.

- [ ] **Step 6: Commit any fixes**

```
git add -A
git commit -m "chore: verification fixes for account & progress sync"
```

---

## Verification matrix (spec → task)

- Supabase clients + middleware → Task 2
- `user_progress` table + RLS → Task 3
- Email/password + Google OAuth → Tasks 9, 10
- Cookie sessions + middleware refresh → Tasks 2, 5
- Unified store; module hooks as adapters → Tasks 6, 7, 8
- Guest localStorage fallback (unchanged behavior) → Task 6
- First-login merge (monotonic union) → Tasks 4, 7
- Optimistic writes + offline/error status → Task 7
- Header affordance + sync indicator → Task 11
- Unit tests for merge + store → Tasks 4, 6, 7
- E2E flows → Task 12
- Final typecheck/lint/build → Task 13
