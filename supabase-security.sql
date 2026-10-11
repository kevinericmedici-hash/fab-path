-- ========================================
-- FAB PATH: SECURITY HARDENING
--
-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- It is safe to run again. Run supabase-setup.sql first.
--
-- What it does
--   1. Adds a rate limiter that the Edge Functions use (per IP, per
--      user, and a global ceiling), backed by one tiny table.
--   2. Closes the public door on the feedback table: submissions now go
--      through the "feedback" Edge Function, which validates, rate
--      limits, and sets user_id from the verified login, so nobody can
--      post as someone else or flood the table.
--   3. Throttles and validates progress writes.
--   4. Takes every privilege away from the API roles on internal tables.
-- ========================================


-- ----------------------------------------
-- 1. RATE LIMITER
--
-- One row per key (for example "tutor:ip:203.0.113.9") holds the start
-- of the current window and how many calls have happened in it. The
-- function is atomic, so two simultaneous calls cannot both slip under
-- the limit. Only the service role (the Edge Functions) can call it.
-- ----------------------------------------

create table if not exists public.rate_limits (
    key          text primary key,
    window_start timestamptz not null default now(),
    count        integer     not null default 0
);

alter table public.rate_limits enable row level security;

revoke all on public.rate_limits from public, anon, authenticated;


create or replace function public.rate_limit_hit(
    p_key            text,
    p_limit          integer,
    p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count integer;
begin
    if p_key is null or length(p_key) > 200 or p_limit < 1 or p_window_seconds < 1 then
        return false;
    end if;

    insert into public.rate_limits as r (key, window_start, count)
    values (p_key, now(), 1)
    on conflict (key) do update
        set window_start = case
                when r.window_start < now() - make_interval(secs => p_window_seconds)
                    then now()
                else r.window_start
            end,
            count = case
                when r.window_start < now() - make_interval(secs => p_window_seconds)
                    then 1
                else r.count + 1
            end
    returning count into v_count;

    -- Tidy up old keys now and then so the table never grows without bound.
    if random() < 0.02 then
        delete from public.rate_limits where window_start < now() - interval '2 days';
    end if;

    -- true means "allowed"
    return v_count <= p_limit;
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;


-- ----------------------------------------
-- 2. FEEDBACK: NO MORE DIRECT INSERTS
--
-- The old policy let anyone insert any row, including one claiming to
-- be from another user. Drop it and take the table away from the API
-- roles. The "feedback" Edge Function (service role) is now the only
-- writer, and it checks length, category and the rate limit first.
-- ----------------------------------------

drop policy if exists "anyone can submit feedback" on public.feedback;

alter table public.feedback add column if not exists ip_hash text;

alter table public.feedback drop constraint if exists feedback_email_len;
alter table public.feedback
    add constraint feedback_email_len check (email is null or char_length(email) <= 254);

revoke all on public.feedback from public, anon, authenticated;


-- ----------------------------------------
-- 3. PROGRESS: SHAPE AND SPEED
--
-- Row-level security already means each learner can only touch their
-- own row (see supabase-setup.sql). These add two more guards: the data
-- must be a JSON object (not an array or a string), and one account
-- cannot rewrite its row more than about once a second.
-- ----------------------------------------

alter table public.progress drop constraint if exists progress_is_object;
alter table public.progress
    add constraint progress_is_object check (jsonb_typeof(data) = 'object');


create or replace function public.progress_throttle()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if tg_op = 'UPDATE' and old.updated_at > now() - interval '1 second' then
        raise exception 'Too many saves. Slow down.' using errcode = '54000';
    end if;

    new.updated_at := now();

    return new;
end;
$$;

drop trigger if exists progress_throttle on public.progress;

create trigger progress_throttle
    before insert or update on public.progress
    for each row execute function public.progress_throttle();


-- ----------------------------------------
-- 4. INTERNAL TABLES: NO API ACCESS
--
-- tutor_usage has row-level security on with no policies, so the API
-- already cannot read it. Remove the underlying grants as well, so a
-- future policy mistake cannot expose it.
-- ----------------------------------------

do $$
begin
    if to_regclass('public.tutor_usage') is not null then
        revoke all on public.tutor_usage from public, anon, authenticated;
    end if;
end
$$;
