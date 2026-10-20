-- ========================================
-- FAB PATH ACCOUNTS: RAISE THE PROGRESS SIZE LIMIT
--
-- Optional. Run once in Supabase: SQL Editor >
-- New query > paste > Run.
--
-- supabase-setup.sql capped each learner's
-- saved progress at 200,000 bytes. Virtual-lab
-- designs and batches (5-7 KB each) pushed an
-- active learner past that, and every save
-- failed with HTTP 400. This raises the cap to
-- 1,000,000 bytes, matching MAX_SYNC_BYTES
-- (900000) in account.js.
-- ========================================

do $$
declare
    c record;
begin
    -- The original check was declared inline, so Postgres named it
    -- (normally progress_data_check). Drop whichever size check exists.
    for c in
        select conname
        from pg_constraint
        where conrelid = 'public.progress'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) like '%pg_column_size%'
    loop
        execute format('alter table public.progress drop constraint %I', c.conname);
    end loop;
end $$;

alter table public.progress
    add constraint progress_data_size check (pg_column_size(data) < 1000000);
