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
