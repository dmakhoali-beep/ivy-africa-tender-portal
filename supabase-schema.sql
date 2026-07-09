-- Run this once in Supabase Dashboard → SQL Editor → New query → Run
-- Project: vzwojojfbdtjlzijbqyu

create table if not exists public.tenders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  entity text,
  value numeric default 0,
  status text default 'pipeline' check (status in ('pipeline','submitted','won','lost','missed')),
  deadline date,
  score int,
  logged_by_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.login_logs (
  id uuid primary key default gen_random_uuid(),
  email text,
  logged_in_at timestamptz default now(),
  ip_address text,
  city text,
  country text,
  user_agent text
);

alter table public.tenders enable row level security;
alter table public.login_logs enable row level security;

-- Only @ivyafrica.co.za accounts can read/write tenders
create policy "ivy_employees_all_tenders" on public.tenders
  for all
  using (auth.jwt() ->> 'email' like '%@ivyafrica.co.za')
  with check (auth.jwt() ->> 'email' like '%@ivyafrica.co.za');

-- Anyone authenticated with an ivyafrica.co.za account can write their own login row
create policy "ivy_employees_insert_logs" on public.login_logs
  for insert
  with check (auth.jwt() ->> 'email' like '%@ivyafrica.co.za');

-- And read the full login history (so you can see who logged in from where)
create policy "ivy_employees_read_logs" on public.login_logs
  for select
  using (auth.jwt() ->> 'email' like '%@ivyafrica.co.za');

-- Enable realtime so every colleague's screen updates live
alter publication supabase_realtime add table public.tenders;
