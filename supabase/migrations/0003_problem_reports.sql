-- Reports from the "Report a problem" form at the bottom of every page.
--
-- Each row holds what the visitor typed, the page path, their screen size and
-- their browser. No name, email, account or IP address. /privacy describes
-- exactly these columns; change that page before adding one.
--
-- Anyone can add a report through the site. Nobody can read, change or delete
-- one through the public key: there is an insert policy and no other. Read them
-- in the Supabase dashboard (Table Editor -> problem_reports).

create table if not exists public.problem_reports (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  page       text        not null check (char_length(page) between 1 and 300),
  message    text        not null check (char_length(message) between 1 and 2000),
  viewport   text        check (viewport is null or char_length(viewport) <= 20),
  browser    text        check (browser is null or char_length(browser) <= 300)
);

alter table public.problem_reports enable row level security;

drop policy if exists "anyone can send a report" on public.problem_reports;

create policy "anyone can send a report"
  on public.problem_reports for insert
  to anon, authenticated
  with check (true);
