-- AutoDrive Supabase Migrations
-- Run these in the Supabase SQL Editor (supabase.com → project → SQL Editor)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. contact_submissions — stores messages from the Contact page
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  created_at  timestamptz default now()
);

-- Allow anyone (including unauthenticated users) to INSERT
alter table contact_submissions enable row level security;

create policy "Anyone can submit contact form"
  on contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Only service role can read (admin only)
create policy "Service role can read submissions"
  on contact_submissions
  for select
  to service_role
  using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. saved_cars — stores which cars each user has saved
--    (This table may already exist — safe to run, uses IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists saved_cars (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  car_id     text not null,
  created_at timestamptz default now(),
  unique(user_id, car_id)
);

alter table saved_cars enable row level security;

-- Users can only see their own saved cars
create policy "Users can view their own saved cars"
  on saved_cars
  for select
  using (auth.uid() = user_id);

-- Users can insert their own saved cars
create policy "Users can save cars"
  on saved_cars
  for insert
  with check (auth.uid() = user_id);

-- Users can delete their own saved cars
create policy "Users can unsave cars"
  on saved_cars
  for delete
  using (auth.uid() = user_id);
