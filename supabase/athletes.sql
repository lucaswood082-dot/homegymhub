-- Primal Lab Athletes (Sponsorship Applications + Public Roster)
-- Paste into Supabase SQL Editor and run.

create table if not exists public.athlete_sponsorships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text,
  display_name text not null,
  sport text not null check (sport in ('strength','boxing','cardio','endurance','team','other')),
  discipline text not null,
  location text not null,
  bio text not null,
  highlights text,
  social_url text,
  avatar_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists athlete_sponsorships_status_created_at_idx
  on public.athlete_sponsorships (status, created_at desc);

create index if not exists athlete_sponsorships_user_id_idx
  on public.athlete_sponsorships (user_id);

alter table public.athlete_sponsorships enable row level security;

-- Public can read approved athletes (public roster)
drop policy if exists "public_read_approved_athletes" on public.athlete_sponsorships;
create policy "public_read_approved_athletes"
on public.athlete_sponsorships
for select
using (status = 'approved');

-- Authenticated users can insert their own application
drop policy if exists "auth_insert_own_athlete_app" on public.athlete_sponsorships;
create policy "auth_insert_own_athlete_app"
on public.athlete_sponsorships
for insert
to authenticated
with check (auth.uid() = user_id);

-- Authenticated users can view their own applications
drop policy if exists "auth_read_own_athlete_app" on public.athlete_sponsorships;
create policy "auth_read_own_athlete_app"
on public.athlete_sponsorships
for select
to authenticated
using (auth.uid() = user_id);

-- Admin can view all applications (pending/rejected/approved)
drop policy if exists "admin_read_all_athlete_apps" on public.athlete_sponsorships;
create policy "admin_read_all_athlete_apps"
on public.athlete_sponsorships
for select
to authenticated
using (auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041');

-- Admin can approve/reject (update) and delete
drop policy if exists "admin_update_athlete_apps" on public.athlete_sponsorships;
create policy "admin_update_athlete_apps"
on public.athlete_sponsorships
for update
to authenticated
using (auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041')
with check (auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041');

drop policy if exists "admin_delete_athlete_apps" on public.athlete_sponsorships;
create policy "admin_delete_athlete_apps"
on public.athlete_sponsorships
for delete
to authenticated
using (auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041');

