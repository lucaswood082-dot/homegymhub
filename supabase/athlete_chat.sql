-- Primal Lab Athlete -> Admin Direct Messaging
-- Paste into Supabase SQL Editor and run.

create table if not exists public.athlete_chats (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references auth.users (id) on delete cascade,
  admin_id uuid not null,
  status text not null default 'open' check (status in ('open','closed_athlete','closed_admin')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create unique index if not exists athlete_chats_unique_pair
  on public.athlete_chats (athlete_id, admin_id);

create index if not exists athlete_chats_last_message_idx
  on public.athlete_chats (last_message_at desc);

create table if not exists public.athlete_chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.athlete_chats (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists athlete_chat_messages_chat_created_idx
  on public.athlete_chat_messages (chat_id, created_at asc);

create or replace function public._touch_athlete_chat_last_message()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.athlete_chats
    set last_message_at = now()
    where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists athlete_chat_touch_last_message on public.athlete_chat_messages;
create trigger athlete_chat_touch_last_message
after insert on public.athlete_chat_messages
for each row execute function public._touch_athlete_chat_last_message();

alter table public.athlete_chats enable row level security;
alter table public.athlete_chat_messages enable row level security;

-- Helper: only approved athletes can access athlete chats (athlete side).
create or replace function public._is_approved_athlete(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.athlete_sponsorships s
    where s.user_id = uid
      and s.status = 'approved'
  );
$$;

-- athlete_chats policies
drop policy if exists "athlete_chats_select_participants" on public.athlete_chats;
create policy "athlete_chats_select_participants"
on public.athlete_chats
for select
to authenticated
using (
  auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
  or (auth.uid() = athlete_id and public._is_approved_athlete(auth.uid()))
);

drop policy if exists "athlete_chats_insert_athlete" on public.athlete_chats;
create policy "athlete_chats_insert_athlete"
on public.athlete_chats
for insert
to authenticated
with check (
  auth.uid() = athlete_id
  and admin_id = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
  and public._is_approved_athlete(auth.uid())
);

-- Admin can create chats for approved athletes (so you can start a chat first)
drop policy if exists "athlete_chats_insert_admin" on public.athlete_chats;
create policy "athlete_chats_insert_admin"
on public.athlete_chats
for insert
to authenticated
with check (
  auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
  and admin_id = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
  and public._is_approved_athlete(athlete_id)
);

drop policy if exists "athlete_chats_update_participants" on public.athlete_chats;
create policy "athlete_chats_update_participants"
on public.athlete_chats
for update
to authenticated
using (
  auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
  or (auth.uid() = athlete_id and public._is_approved_athlete(auth.uid()))
)
with check (
  auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
  or (auth.uid() = athlete_id and public._is_approved_athlete(auth.uid()))
);

-- athlete_chat_messages policies
drop policy if exists "athlete_msgs_select_participants" on public.athlete_chat_messages;
create policy "athlete_msgs_select_participants"
on public.athlete_chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.athlete_chats c
    where c.id = athlete_chat_messages.chat_id
      and (
        auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
        or (auth.uid() = c.athlete_id and public._is_approved_athlete(auth.uid()))
      )
  )
);

drop policy if exists "athlete_msgs_insert_participants" on public.athlete_chat_messages;
create policy "athlete_msgs_insert_participants"
on public.athlete_chat_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.athlete_chats c
    where c.id = athlete_chat_messages.chat_id
      and (
        (auth.uid() = c.athlete_id and public._is_approved_athlete(auth.uid()))
        or auth.uid() = 'b4cb6833-f4ea-4dcd-8443-229a7767a041'
      )
  )
  and sender_id = auth.uid()
);

-- Realtime (optional but recommended): enable live chat updates
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'athlete_chat_messages'
    ) then
      alter publication supabase_realtime add table public.athlete_chat_messages;
    end if;
  end if;
end $$;
