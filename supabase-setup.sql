-- ========================================
-- FAB PATH ACCOUNTS: DATABASE SETUP
--
-- Run this once in Supabase: SQL Editor >
-- New query > paste > Run.
--
-- One row per signed-in learner holds their
-- saved progress. Row-level security means
-- each person can only ever see and change
-- their own row.
-- ========================================

create table if not exists public.progress (
    user_id    uuid primary key references auth.users (id) on delete cascade,
    data       jsonb not null default '{}'::jsonb
               check (pg_column_size(data) < 200000),
    updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "read own progress"   on public.progress;
drop policy if exists "insert own progress" on public.progress;
drop policy if exists "update own progress" on public.progress;
drop policy if exists "delete own progress" on public.progress;

create policy "read own progress"
    on public.progress for select
    using (auth.uid() = user_id);

create policy "insert own progress"
    on public.progress for insert
    with check (auth.uid() = user_id);

create policy "update own progress"
    on public.progress for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "delete own progress"
    on public.progress for delete
    using (auth.uid() = user_id);


-- ========================================
-- FEEDBACK
--
-- Anyone can submit, signed in or not.
-- Nobody can read it back through the API,
-- including the person who submitted it, so
-- the only way to see submissions is the
-- Table Editor here in Supabase.
-- ========================================

create table if not exists public.feedback (
    id         uuid primary key default gen_random_uuid(),
    category   text not null check (category in ('bug', 'feature', 'content', 'other')),
    message    text not null check (char_length(message) between 1 and 4000),
    email      text,
    user_id    uuid references auth.users (id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "anyone can submit feedback" on public.feedback;

create policy "anyone can submit feedback"
    on public.feedback for insert
    with check (true);


-- ========================================
-- DELETE MY ACCOUNT
--
-- The "Delete account" button calls this.
-- It removes only the signed-in caller's own
-- sign-in record (auth.uid()); their progress
-- row goes with it (on delete cascade), and
-- any feedback they sent stays but is
-- unlinked (on delete set null).
--
-- security definer lets it touch auth.users,
-- which the publishable key can't reach on
-- its own. Signed-out visitors can't call it.
-- ========================================

create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
    delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
