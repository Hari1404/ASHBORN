# PACKET 05A: TIMER DATABASE (sessions + running timer, row-level security, server functions)

Kind: build. Written by the planner on 2026-10-06. Part 1 is done by the agent (puts two SQL files in the project and commits them). Part 2 is done BY THE OWNER BY HAND in the Supabase dashboard (the agent cannot run SQL on Supabase).

## GOAL
Create the database side of the Pro Timer: two tables, row-level security, and eight server functions, as SQL files in the project. Nothing in the app changes in this packet.

## RULES FOR THE AGENT
- Create ONLY the two files listed below. Do NOT create any other file (no helper scripts, no .ps1, no notes). Edit nothing else.
- Do not run any SQL. Do not touch .env. Decide nothing.
- Any failure or mismatch: STOP and report the exact error text. Never improvise.
- The checker reads only .ts, .tsx and .css files under src, so these SQL files carry NO code tags and CODE_MAP.md / CONNECTIONS.md are NOT edited in this packet.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report.
2. Run `New-Item -ItemType Directory -Force supabase` (PowerShell). Expected: a folder named supabase exists.
3. Create or replace `supabase/timer_schema.sql` with EXACTLY the content of SQL FILE 1 below (everything between the lines BEGIN FILE and END FILE, not including those two lines).
4. Create or replace `supabase/timer_verify.sql` with EXACTLY the content of SQL FILE 2 below (same rule).
5. Run `node scripts/check-tags.mjs`. Expected: the same lines as after Packet 04F, unchanged: `TAGS OK: 17 tags, 25 places` and `CONNECTIONS OK: 25 connections, 100 anchors, 21 classes, 1 css variables, 2 label links`. If any number differs, STOP and report the raw output.
6. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
7. Stage by name only (never `git add .`): `git add supabase/timer_schema.sql supabase/timer_verify.sql`
   If `packets/PACKET_05A_TIMER_DATABASE.md` is not yet tracked and earlier packet files are tracked, also add it by name.
8. Commit: `git commit -m "05A: Pro Timer database SQL (not yet run in Supabase)"`
9. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 8 lines, suggest nothing, start nothing)
`DONE 05A` then: the raw output of step 5 (two lines), the raw output of step 6, and `git log --oneline -1`.

## PART 2: OWNER BY HAND (Supabase dashboard)
Use the SAME Supabase project whose address is in your `.env` (the one ASHBORN signs in to).
1. Supabase dashboard, left menu, SQL Editor, New query.
2. Open `supabase/timer_schema.sql` from the project, copy ALL of it, paste it into the editor, press Run.
   Expected: "Success. No rows returned". The dashboard may show a warning about "destructive operations" because the file contains `drop policy if exists`; that only removes policies with this file's own names (the first time there is nothing to remove). Choose to run it.
3. New query again. Copy ALL of `supabase/timer_verify.sql`, paste, Run.
   Expected: 5 rows, and in every row the `result` column equals the `expect` column:
   tables_exist 2, row_level_security_on 2, functions_exist 8, anonymous_can_start false, signed_in_can_start true.
4. Send the planner a screenshot or the pasted table of those 5 rows. This packet PASSES only when all 5 rows match. If the first Run shows any red error, send the full error text and do not run anything else.

## WHAT THE FUNCTIONS DO (for the planner and the later packets)
- `timer_state()`: server time plus the running session (or null).
- `timer_start(tz)`: begins a session now; error ALREADY_RUNNING if one exists; BAD_TIMEZONE if the zone name is wrong.
- `timer_pause()`, `timer_resume()`: errors NOT_RUNNING, NOT_PAUSED, DAY_ENDED (past local midnight: the app must call timer_end).
- `timer_end()`: saves the session if it counted 60 seconds or more, always clears the running row; if local midnight has passed it cuts the session at midnight and returns capped = true.
- `timer_day_total(day)`: seconds saved on that local day.
- Times come from the server clock only. The day of a session is the local day (in the time zone the app sends) when it started. Quality is not stored.
- The app can read both tables and delete its own saved sessions; it cannot write to them directly.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED in the planning sandbox on a scratch Postgres (PGlite, Postgres 18 compiled to WebAssembly) with stand-ins for the Supabase roles `anon` and `authenticated` and for `auth.uid()`: 41 checks passed, covering start/pause/resume/end, pause maths, the 60 second cut-off (57 s not saved, 62 s saved), the midnight cut in Asia/Kolkata, DAY_ENDED errors, the local-day rule, one user not seeing another, the anonymous role blocked, direct writes by the app blocked, table rules, and running the file twice. The verify query was also tested there (5 rows matched).
- NOT TESTED: on real Supabase (its Postgres version, real `auth` schema, the API layer); calling these functions from the app (that is Packet 05B and later); daylight-saving time zones (India has none); a phone or browser.

## SQL FILE 1: supabase/timer_schema.sql
BEGIN FILE
-- ASHBORN Pro Timer database. Run ONCE in the Supabase SQL Editor (safe to run again).
-- Time rules: every time is taken from the SERVER clock (now()), never from a phone or PC clock.
-- The day of a session is the LOCAL day of the person's time zone (sent by the app, e.g. Asia/Kolkata).
-- A session that is still running at local midnight is ended at 12:00 (midnight) when it is ended.
-- Quality (meh / solid / deep / flow) is NOT stored; it is worked out from the minutes in the app.

-- 1. Finished sessions (one row per saved session; sessions under 60 seconds are never saved).
create table if not exists public.timer_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  active_seconds integer not null,
  constraint timer_sessions_min_length check (active_seconds >= 60),
  constraint timer_sessions_time_order check (ended_at > started_at),
  constraint timer_sessions_fits_in_time check (active_seconds <= ceil(extract(epoch from (ended_at - started_at))))
);

create index if not exists timer_sessions_user_day_idx on public.timer_sessions (user_id, day);

-- 2. The running session (at most ONE row per person: the primary key is the person).
create table if not exists public.timer_running (
  user_id uuid primary key references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  tz text not null,
  status text not null default 'running' check (status in ('running', 'paused')),
  paused_at timestamptz,
  paused_seconds numeric not null default 0 check (paused_seconds >= 0),
  constraint timer_running_pause_shape check ((status = 'paused') = (paused_at is not null))
);

-- 3. Row-level security: everyone sees only their own rows. The app can read both tables and
--    delete its own finished sessions; everything else goes through the functions below.
alter table public.timer_sessions enable row level security;
alter table public.timer_running enable row level security;

drop policy if exists timer_sessions_select_own on public.timer_sessions;
create policy timer_sessions_select_own on public.timer_sessions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists timer_sessions_delete_own on public.timer_sessions;
create policy timer_sessions_delete_own on public.timer_sessions
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists timer_running_select_own on public.timer_running;
create policy timer_running_select_own on public.timer_running
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.timer_sessions from public, anon, authenticated;
revoke all on public.timer_running from public, anon, authenticated;
grant select, delete on public.timer_sessions to authenticated;
grant select on public.timer_running to authenticated;

-- 4. Helper: the next local midnight after a start time (the end of that local day).
create or replace function public.timer_cap_at(p_started timestamptz, p_tz text)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select (((p_started at time zone p_tz)::date + 1)::timestamp) at time zone p_tz
$$;

-- 5. Helper: one running row as JSON.
create or replace function public.timer_row_json(r public.timer_running)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'started_at', r.started_at,
    'tz', r.tz,
    'status', r.status,
    'paused_at', r.paused_at,
    'paused_seconds', r.paused_seconds,
    'cap_at', public.timer_cap_at(r.started_at, r.tz)
  )
$$;

-- 6. timer_state(): the server time and the running session (or null). Read-only.
create or replace function public.timer_state()
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  r public.timer_running;
begin
  select * into r from public.timer_running where user_id = (select auth.uid());
  return jsonb_build_object(
    'server_now', now(),
    'running', case when r.user_id is null then null else public.timer_row_json(r) end
  );
end
$$;

-- 7. timer_day_total(day): seconds saved on that local day. Read-only.
create or replace function public.timer_day_total(p_day date)
returns integer
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(active_seconds), 0)::integer
  from public.timer_sessions
  where user_id = (select auth.uid()) and day = p_day
$$;

-- 8. timer_start(tz): begin a session now. Error ALREADY_RUNNING if one exists.
create or replace function public.timer_start(p_tz text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.timer_running;
begin
  if auth.uid() is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  if p_tz is null or not exists (select 1 from pg_catalog.pg_timezone_names where name = p_tz) then
    raise exception 'BAD_TIMEZONE';
  end if;
  insert into public.timer_running (user_id, tz)
  values (auth.uid(), p_tz)
  on conflict (user_id) do nothing
  returning * into r;
  if r.user_id is null then
    raise exception 'ALREADY_RUNNING';
  end if;
  return jsonb_build_object('server_now', now(), 'running', public.timer_row_json(r));
end
$$;

-- 9. timer_pause(): errors NOT_RUNNING (nothing running, or already paused) or DAY_ENDED (past local midnight: call timer_end).
create or replace function public.timer_pause()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.timer_running;
begin
  if auth.uid() is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  select * into r from public.timer_running where user_id = auth.uid() for update;
  if r.user_id is null then
    raise exception 'NOT_RUNNING';
  end if;
  if now() >= public.timer_cap_at(r.started_at, r.tz) then
    raise exception 'DAY_ENDED';
  end if;
  if r.status <> 'running' then
    raise exception 'NOT_RUNNING';
  end if;
  update public.timer_running
    set status = 'paused', paused_at = now()
    where user_id = r.user_id
    returning * into r;
  return jsonb_build_object('server_now', now(), 'running', public.timer_row_json(r));
end
$$;

-- 10. timer_resume(): errors NOT_RUNNING (nothing to resume), NOT_PAUSED, or DAY_ENDED.
create or replace function public.timer_resume()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.timer_running;
begin
  if auth.uid() is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  select * into r from public.timer_running where user_id = auth.uid() for update;
  if r.user_id is null then
    raise exception 'NOT_RUNNING';
  end if;
  if now() >= public.timer_cap_at(r.started_at, r.tz) then
    raise exception 'DAY_ENDED';
  end if;
  if r.status <> 'paused' then
    raise exception 'NOT_PAUSED';
  end if;
  update public.timer_running
    set status = 'running',
        paused_seconds = r.paused_seconds + extract(epoch from (now() - r.paused_at)),
        paused_at = null
    where user_id = r.user_id
    returning * into r;
  return jsonb_build_object('server_now', now(), 'running', public.timer_row_json(r));
end
$$;

-- 11. timer_end(): finish the session. Saves it if it counted 60 seconds or more; always clears the running row.
--     If local midnight has passed, the session is cut at midnight and 'capped' is true.
create or replace function public.timer_end()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.timer_running;
  v_cap timestamptz;
  v_end timestamptz;
  v_ref timestamptz;
  v_active integer;
  v_capped boolean;
  s public.timer_sessions;
begin
  if auth.uid() is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  select * into r from public.timer_running where user_id = auth.uid() for update;
  if r.user_id is null then
    raise exception 'NOT_RUNNING';
  end if;
  v_cap := public.timer_cap_at(r.started_at, r.tz);
  v_capped := now() >= v_cap;
  v_end := least(now(), v_cap);
  v_ref := case when r.status = 'paused' then least(r.paused_at, v_end) else v_end end;
  v_active := greatest(0, floor(extract(epoch from (v_ref - r.started_at)) - r.paused_seconds))::integer;
  delete from public.timer_running where user_id = r.user_id;
  if v_active >= 60 and v_end > r.started_at then
    insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds)
    values (r.user_id, (r.started_at at time zone r.tz)::date, r.started_at, v_end, v_active)
    returning * into s;
    return jsonb_build_object(
      'server_now', now(),
      'saved', true,
      'capped', v_capped,
      'session', jsonb_build_object(
        'id', s.id, 'day', s.day, 'started_at', s.started_at,
        'ended_at', s.ended_at, 'active_seconds', s.active_seconds
      )
    );
  end if;
  return jsonb_build_object('server_now', now(), 'saved', false, 'capped', v_capped, 'session', null);
end
$$;

-- 12. Who may call what: signed-in people only, never the anonymous role.
revoke all on function public.timer_cap_at(timestamptz, text) from public, anon;
revoke all on function public.timer_row_json(public.timer_running) from public, anon;
revoke all on function public.timer_state() from public, anon;
revoke all on function public.timer_day_total(date) from public, anon;
revoke all on function public.timer_start(text) from public, anon;
revoke all on function public.timer_pause() from public, anon;
revoke all on function public.timer_resume() from public, anon;
revoke all on function public.timer_end() from public, anon;
grant execute on function public.timer_cap_at(timestamptz, text) to authenticated;
grant execute on function public.timer_row_json(public.timer_running) to authenticated;
grant execute on function public.timer_state() to authenticated;
grant execute on function public.timer_day_total(date) to authenticated;
grant execute on function public.timer_start(text) to authenticated;
grant execute on function public.timer_pause() to authenticated;
grant execute on function public.timer_resume() to authenticated;
grant execute on function public.timer_end() to authenticated;
END FILE

## SQL FILE 2: supabase/timer_verify.sql
BEGIN FILE
-- ASHBORN Pro Timer: check that the database was set up. Run in the Supabase SQL Editor AFTER timer_schema.sql.
-- Expected result: 5 rows, exactly as the "expect" column says.
select 'tables_exist' as check_name, (select count(*) from information_schema.tables where table_schema = 'public' and table_name in ('timer_sessions', 'timer_running'))::text as result, '2' as expect
union all
select 'row_level_security_on', (select count(*) from pg_tables where schemaname = 'public' and tablename in ('timer_sessions', 'timer_running') and rowsecurity)::text, '2'
union all
select 'functions_exist', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('timer_cap_at', 'timer_row_json', 'timer_state', 'timer_day_total', 'timer_start', 'timer_pause', 'timer_resume', 'timer_end'))::text, '8'
union all
select 'anonymous_can_start', has_function_privilege('anon', 'public.timer_start(text)', 'execute')::text, 'false'
union all
select 'signed_in_can_start', has_function_privilege('authenticated', 'public.timer_start(text)', 'execute')::text, 'true';
END FILE
