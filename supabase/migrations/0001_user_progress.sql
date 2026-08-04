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
