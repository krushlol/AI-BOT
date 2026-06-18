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

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. profiles — stores username and avatar_url for each user
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  avatar_url  text,
  updated_at  timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. avatars storage bucket
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
