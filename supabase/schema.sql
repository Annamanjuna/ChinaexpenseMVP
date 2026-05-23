-- Run this once in Supabase: SQL Editor → New query → Run
-- Shared trip data for Anna, Husband & Taya (one row for the whole group)

create table if not exists public.trip_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Default row (app merges missing settings on read)
insert into public.trip_state (id, data)
values (
  'china-2026',
  '{"expenses":[],"settings":{"tripStart":"2026-05-25","tripEnd":"2026-05-31","dailyBudgetCny":660,"cnyToVndRate":4000}}'::jsonb
)
on conflict (id) do nothing;

-- Lock down direct client access; the Next.js API uses the service role key only
alter table public.trip_state enable row level security;
