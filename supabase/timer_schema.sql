-- ASHBORN Pro Timer database. Run ONCE in the Supabase SQL Editor (safe to run again).
-- Time rules: every time is taken from the SERVER clock (now()), never from a phone or PC clock.
-- The day of a session is the LOCAL day of the person's time zone (sent by the app, e.g. Asia/Kolkata).
-- A session that is still running at local midnight is ended at 12:00 (midnight) when it is ended.
-- Quality (meh / solid / deep / flow) is NOT stored; it is worked out from the minutes in the app.
-- The pause log (Packet 09A): every pause is written down with the server time it began and the server time it ended, and the person's time zone is saved with each session. See 2b.

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

-- 2b. The pause log and the time zone of a session (Packet 09A). Safe to run again.
--     pauses = a JSON list, oldest first, one entry per pause: {"from": <server time the pause began>, "to": <server time it ended>}.
--     In timer_running it starts as an empty list and one entry is added at every Resume (timer_resume).
--     In timer_sessions it is copied from timer_running when the session is saved (timer_end). A pause that is still open when
--     the session ends is closed at the end moment of the session. tz = the time zone the session was started in.
--     A session saved BEFORE this packet has NULL in pauses and in tz. NULL means "not known"; an empty list means "no pause".
alter table public.timer_running add column if not exists pauses jsonb not null default '[]'::jsonb;
alter table public.timer_sessions add column if not exists pauses jsonb;
alter table public.timer_sessions add column if not exists tz text;

alter table public.timer_running drop constraint if exists timer_running_pauses_is_list;
alter table public.timer_running add constraint timer_running_pauses_is_list check (jsonb_typeof(pauses) = 'array');
alter table public.timer_sessions drop constraint if exists timer_sessions_pauses_is_list;
alter table public.timer_sessions add constraint timer_sessions_pauses_is_list check (pauses is null or jsonb_typeof(pauses) = 'array');

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
--     The pause that ends here is added to timer_running.pauses (Packet 09A).
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
        pauses = r.pauses || jsonb_build_array(jsonb_build_object('from', r.paused_at, 'to', now())),
        paused_at = null
    where user_id = r.user_id
    returning * into r;
  return jsonb_build_object('server_now', now(), 'running', public.timer_row_json(r));
end
$$;

-- 11. timer_end(): finish the session. Saves it if it counted 60 seconds or more; always clears the running row.
--     If local midnight has passed, the session is cut at midnight and 'capped' is true.
--     The pause log is saved with the session (pauses), and the time zone with it (tz). A pause that is still open
--     at the end is closed at the end moment (Packet 09A). The answer has no new key: the app reads the same keys as before.
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
  v_pauses jsonb;
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
  v_pauses := r.pauses;
  if r.status = 'paused' and v_end > r.paused_at then
    v_pauses := v_pauses || jsonb_build_array(jsonb_build_object('from', r.paused_at, 'to', v_end));
  end if;
  delete from public.timer_running where user_id = r.user_id;
  if v_active >= 60 and v_end > r.started_at then
    insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz)
    values (r.user_id, (r.started_at at time zone r.tz)::date, r.started_at, v_end, v_active, v_pauses, r.tz)
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
