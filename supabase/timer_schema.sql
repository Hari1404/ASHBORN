-- ASHBORN Pro Timer database. Run ONCE in the Supabase SQL Editor (safe to run again).
-- Time rules: every time is taken from the SERVER clock (now()), never from a phone or PC clock.
-- The day of a session is the LOCAL day of the person's time zone (sent by the app, e.g. Asia/Kolkata).
-- A session that is still running at local midnight is ended at 12:00 (midnight) when it is ended.
-- Quality (meh / solid / deep / flow) is NOT stored; it is worked out from the minutes in the app.
-- The pause log (Packet 09A): every pause is written down with the server time it began and the server time it ended, and the person's time zone is saved with each session. See 2b.
-- Session tags (Packet 10A): a person has tags (names for sessions, at most 10 live ones); the tag chosen before Start is saved with the session. No tag = Freestyle. The tag never changes the day score. See 2c and 11b.

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

-- 2c. Session tags (Packet 10A). Safe to run again.
--     timer_tags = the tags of a person. A tag is never deleted: Archive sets archived_at. A session points to its tag by id,
--     so it keeps the tag when the tag is archived, and shows the new name when the tag is renamed.
--     tag_id in timer_running = the tag chosen before Start; timer_end copies it into timer_sessions.tag_id.
--     NULL in tag_id means Freestyle, or a session saved before this packet. No default: the tag is never guessed.
--     Rules (DEFAULTS of Packet 10A, cheap to change): a name is 1 to 20 characters with no spaces at the ends and no control
--     character; the name Freestyle (any capitals) is reserved; one live tag per name whatever the capitals; at most 10 live tags (11b).
create table if not exists public.timer_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint timer_tags_name_shape check (name = btrim(name) and char_length(name) between 1 and 20 and name !~ '[[:cntrl:]]' and lower(name) <> 'freestyle')
);
create unique index if not exists timer_tags_user_name_live_idx on public.timer_tags (user_id, lower(name)) where archived_at is null;
alter table public.timer_running add column if not exists tag_id uuid references public.timer_tags (id);
alter table public.timer_sessions add column if not exists tag_id uuid references public.timer_tags (id);

-- 3. Row-level security: everyone sees only their own rows. The app can read the three tables (sessions, running, tags) and
--    delete its own finished sessions; everything else goes through the functions below.
alter table public.timer_sessions enable row level security;
alter table public.timer_running enable row level security;
alter table public.timer_tags enable row level security;

drop policy if exists timer_sessions_select_own on public.timer_sessions;
create policy timer_sessions_select_own on public.timer_sessions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists timer_sessions_delete_own on public.timer_sessions;
create policy timer_sessions_delete_own on public.timer_sessions
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists timer_running_select_own on public.timer_running;
create policy timer_running_select_own on public.timer_running
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists timer_tags_select_own on public.timer_tags;
create policy timer_tags_select_own on public.timer_tags
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.timer_sessions from public, anon, authenticated;
revoke all on public.timer_running from public, anon, authenticated;
revoke all on public.timer_tags from public, anon, authenticated;
grant select, delete on public.timer_sessions to authenticated;
grant select on public.timer_running to authenticated;
grant select on public.timer_tags to authenticated;

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

-- 8. timer_start(tz, tag): begin a session now. Error ALREADY_RUNNING if one exists.
--    The second argument is the tag chosen before Start (Packet 10A); leave it out (or null) for Freestyle.
--    A tag that is not the person's own, or is archived: error TAG_NOT_FOUND.
--    The old version with one argument is dropped: two versions would make a call with one argument ambiguous.
--    A call with one argument still works, because the tag has a default.
drop function if exists public.timer_start(text);
create or replace function public.timer_start(p_tz text, p_tag_id uuid default null)
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
  if p_tag_id is not null and not exists (
    select 1 from public.timer_tags
    where id = p_tag_id and user_id = auth.uid() and archived_at is null
  ) then
    raise exception 'TAG_NOT_FOUND';
  end if;
  insert into public.timer_running (user_id, tz, tag_id)
  values (auth.uid(), p_tz, p_tag_id)
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
--     The tag of the running session is saved with the session (tag_id, Packet 10A), also when the tag was archived while the session ran.
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
    insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz, tag_id)
    values (r.user_id, (r.started_at at time zone r.tz)::date, r.started_at, v_end, v_active, v_pauses, r.tz, r.tag_id)
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

-- 11b. The tags of a person (Packet 10A). Four functions. The app never writes the table itself.
--      The name is checked the same way in add and in rename: the spaces at both ends are cut, 1 to 20 characters, no control
--      character (tab, line break), and the name Freestyle (any capitals) is reserved. Otherwise: error BAD_TAG_NAME.
--      Add and rename take a lock per person, so two devices cannot make the 11th tag, or the same name twice, at the same moment.
--      Errors: BAD_TAG_NAME, TAG_NAME_TAKEN (a live tag has that name, whatever the capitals), TAG_LIMIT (10 live tags),
--      TAG_NOT_FOUND (not the person's own tag, or archived). The functions answer {"id": ..., "name": ...}.

-- timer_tag_list(): the live tags, oldest first: [{"id": ..., "name": ...}]. Read-only.
create or replace function public.timer_tag_list()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name) order by created_at, id), '[]'::jsonb)
  from public.timer_tags
  where user_id = (select auth.uid()) and archived_at is null
$$;

-- timer_tag_add(name): a new tag. If an archived tag has that name, the NEWEST archived tag of that name comes back instead
-- (same id, so its old sessions rejoin it; it takes the spelling typed now).
create or replace function public.timer_tag_add(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  t public.timer_tags;
begin
  if auth.uid() is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  v_name := btrim(coalesce(p_name, ''));
  if char_length(v_name) < 1 or char_length(v_name) > 20 or v_name ~ '[[:cntrl:]]' or lower(v_name) = 'freestyle' then
    raise exception 'BAD_TAG_NAME';
  end if;
  perform pg_advisory_xact_lock(hashtext('timer_tags:' || auth.uid()::text));
  if exists (select 1 from public.timer_tags where user_id = auth.uid() and archived_at is null and lower(name) = lower(v_name)) then
    raise exception 'TAG_NAME_TAKEN';
  end if;
  if (select count(*) from public.timer_tags where user_id = auth.uid() and archived_at is null) >= 10 then
    raise exception 'TAG_LIMIT';
  end if;
  select * into t from public.timer_tags
    where user_id = auth.uid() and archived_at is not null and lower(name) = lower(v_name)
    order by archived_at desc, id desc
    limit 1;
  if t.id is not null then
    update public.timer_tags set name = v_name, archived_at = null where id = t.id returning * into t;
  else
    insert into public.timer_tags (user_id, name) values (auth.uid(), v_name) returning * into t;
  end if;
  return jsonb_build_object('id', t.id, 'name', t.name);
end
$$;

-- timer_tag_rename(id, name): the tag gets a new name; old sessions show the new name too. A live tag only.
create or replace function public.timer_tag_rename(p_id uuid, p_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  t public.timer_tags;
begin
  if auth.uid() is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  v_name := btrim(coalesce(p_name, ''));
  if char_length(v_name) < 1 or char_length(v_name) > 20 or v_name ~ '[[:cntrl:]]' or lower(v_name) = 'freestyle' then
    raise exception 'BAD_TAG_NAME';
  end if;
  perform pg_advisory_xact_lock(hashtext('timer_tags:' || auth.uid()::text));
  select * into t from public.timer_tags
    where id = p_id and user_id = auth.uid() and archived_at is null
    for update;
  if t.id is null then
    raise exception 'TAG_NOT_FOUND';
  end if;
  if exists (select 1 from public.timer_tags where user_id = auth.uid() and archived_at is null and lower(name) = lower(v_name) and id <> t.id) then
    raise exception 'TAG_NAME_TAKEN';
  end if;
  update public.timer_tags set name = v_name where id = t.id returning * into t;
  return jsonb_build_object('id', t.id, 'name', t.name);
end
$$;

-- timer_tag_archive(id): the tag leaves the list. It is never deleted: its sessions keep it, and adding the same name brings it back.
create or replace function public.timer_tag_archive(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  t public.timer_tags;
begin
  if auth.uid() is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  update public.timer_tags set archived_at = now()
    where id = p_id and user_id = auth.uid() and archived_at is null
    returning * into t;
  if t.id is null then
    raise exception 'TAG_NOT_FOUND';
  end if;
  return jsonb_build_object('id', t.id, 'name', t.name);
end
$$;

-- 12. Who may call what: signed-in people only, never the anonymous role.
revoke all on function public.timer_cap_at(timestamptz, text) from public, anon;
revoke all on function public.timer_row_json(public.timer_running) from public, anon;
revoke all on function public.timer_state() from public, anon;
revoke all on function public.timer_day_total(date) from public, anon;
revoke all on function public.timer_start(text, uuid) from public, anon;
revoke all on function public.timer_pause() from public, anon;
revoke all on function public.timer_resume() from public, anon;
revoke all on function public.timer_end() from public, anon;
grant execute on function public.timer_cap_at(timestamptz, text) to authenticated;
grant execute on function public.timer_row_json(public.timer_running) to authenticated;
grant execute on function public.timer_state() to authenticated;
grant execute on function public.timer_day_total(date) to authenticated;
grant execute on function public.timer_start(text, uuid) to authenticated;
grant execute on function public.timer_pause() to authenticated;
grant execute on function public.timer_resume() to authenticated;
grant execute on function public.timer_end() to authenticated;
revoke all on function public.timer_tag_list() from public, anon;
revoke all on function public.timer_tag_add(text) from public, anon;
revoke all on function public.timer_tag_rename(uuid, text) from public, anon;
revoke all on function public.timer_tag_archive(uuid) from public, anon;
grant execute on function public.timer_tag_list() to authenticated;
grant execute on function public.timer_tag_add(text) to authenticated;
grant execute on function public.timer_tag_rename(uuid, text) to authenticated;
grant execute on function public.timer_tag_archive(uuid) to authenticated;

-- 13. Tell the API layer to read the new function list now (the two-argument timer_start and the tag functions).
notify pgrst, 'reload schema';
