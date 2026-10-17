-- ASHBORN day score (Packet 09B). Run ONCE in the Supabase SQL Editor AFTER timer_schema.sql (safe to run again).
-- The rules are in DECISIONS_DAY_SCORE.md (version 2). If a rule or a number changes, change that file first.
-- The score is worked out from the saved sessions, when asked. Nothing is stored. Nothing here changes the timer.
-- Only saved sessions count (the running session is added when it is saved).
-- All maths is in seconds and exact (numeric). The app rounds for display; the word is chosen from the exact seconds.
--
-- Numbers that are PLACEHOLDERS in DECISIONS_DAY_SCORE.md (cheap to change, past days are re-scored from the raw sessions):
--   10800 seconds = the cap of 180 counted minutes per session (section 4c)
--   2700 seconds  = 45 minutes, the stretch that earns full credit (section 4b)
--   0.75          = the credit of a stretch near zero (section 4b)
--   3600 seconds  = the stand-in usual of 60 minutes, used until there are 7 earlier days with sessions (section 6)
--   600 seconds   = a short session, under 10 minutes (section 6, for the readout only)
--   50%, 80%, 120%, 150% = the edges of the day words (section 6)
--
-- Not built yet (later packets, see section 11 of the decisions file): the tag, the "still working?" tap, unconfirmed sessions.
-- Until then no session is unconfirmed, so unconfirmed_minutes is always 0 and the word NOTHING CONFIRMED YET cannot come.

-- 1. timer_session_score(): the score of ONE saved session. Pure: no table is read.
--    p_pauses is the pause log of timer_sessions. NULL = not known (a session saved before Packet 09A), [] = no pause.
--    A session is cut into unbroken stretches by its pauses (section 4a). The last pause is NOT a break when it ends exactly
--    at the end of the session: it is the stop alert that Hold to end session opens (section 2), nothing follows it.
--    The cap is applied stretch by stretch in time order, and the credit is worked out on the cut stretch (section 4c).
--    credit of a stretch = 0.75 + 0.25 x (stretch minutes, at most 45) / 45, written here as
--    seconds x 0.75 + seconds x (seconds, at most 2700) / 10800, so the division comes last and stays exact.
--    A session with NULL pauses has no pause detail: it counts at full credit (section 2), cut at the cap.
--    The credit can never be more than the counted seconds of the session (cut at the cap).
--    Answer: credited_seconds, longest_stretch_seconds (after the cap), over_cap_seconds (counted seconds above the cap).
create or replace function public.timer_session_score(
  p_started timestamptz,
  p_ended timestamptz,
  p_active integer,
  p_pauses jsonb
)
returns table (credited_seconds numeric, longest_stretch_seconds numeric, over_cap_seconds numeric)
language sql
immutable
set search_path = ''
as $$
  with pz as (
    select (e.value ->> 'from')::timestamptz as pf,
           (e.value ->> 'to')::timestamptz as pt,
           row_number() over (order by (e.value ->> 'from')::timestamptz) as n,
           count(*) over () as total
    from jsonb_array_elements(coalesce(p_pauses, '[]'::jsonb)) as e
  ),
  cuts as (
    select p_started as s, coalesce((select pf from pz where n = 1), p_ended) as e
    union all
    select a.pt, b.pf from pz a join pz b on b.n = a.n + 1
    union all
    select a.pt, p_ended from pz a where a.n = a.total and a.pt < p_ended
  ),
  lens as (
    select s, greatest(0, extract(epoch from (e - s))) as len from cuts
  ),
  capped as (
    select greatest(0, least(len, 10800 - coalesce(sum(len) over (order by s rows between unbounded preceding and 1 preceding), 0))) as kept
    from lens
  ),
  scored as (
    select kept, kept * 0.75 + kept * least(kept, 2700) / 10800 as credit
    from capped
    where kept > 0
  ),
  totals as (
    select coalesce(sum(credit), 0) as credit, coalesce(max(kept), 0) as longest
    from scored
  )
  select
    case when p_pauses is null then least(p_active, 10800)::numeric
         else least((select credit from totals), least(p_active, 10800)::numeric) end,
    case when p_pauses is null then least(p_active, 10800)::numeric
         else least((select longest from totals), least(p_active, 10800)::numeric) end,
    greatest(0, p_active - 10800)::numeric
$$;

-- 2. timer_usual_seconds(): the usual of a person = the middle day (the median) of the 7 most recent earlier days that had sessions.
--    p_recent = the day numbers (credited seconds) of those days. With exactly 7 the usual is the 4th smallest, so one huge or
--    forgotten day cannot pull it up. With fewer than 7 (or anything else) the stand-in usual of 60 minutes is used (section 6).
create or replace function public.timer_usual_seconds(p_recent numeric[])
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case
    when cardinality(p_recent) = 7
      then (select v from unnest(p_recent) as v order by v offset 3 limit 1)
    else 3600
  end
$$;

-- 3. timer_day_word(): the word of a day, from its number compared with the usual (section 6). The edges are exact:
--    under 50% LIGHT, 50% to under 80% BELOW USUAL, 80% to under 120% USUAL, 120% to under 150% ABOVE USUAL, 150% and more BIG.
create or replace function public.timer_day_word(p_credited_seconds numeric, p_sessions integer, p_usual_seconds numeric)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_sessions = 0 then 'NO SESSION'
    when p_credited_seconds * 2 < p_usual_seconds then 'LIGHT'
    when p_credited_seconds * 5 < p_usual_seconds * 4 then 'BELOW USUAL'
    when p_credited_seconds * 5 < p_usual_seconds * 6 then 'USUAL'
    when p_credited_seconds * 2 < p_usual_seconds * 3 then 'ABOVE USUAL'
    else 'BIG'
  end
$$;

-- 4. timer_day_score(day): the score of one local day of the signed-in person. Read-only. Reads only saved sessions.
--    The day of a session is its saved day column (never worked out again from the time zone).
--    The usual is made only from days BEFORE the asked day, so a past day is scored the way it was then.
--    Answer keys: day, credited_minutes (the day number), word, usual_minutes, usual_is_stand_in, sessions, short_sessions
--    (counted under 10 minutes), longest_stretch_minutes, counted_minutes, counted_over_elapsed (null without a session),
--    unconfirmed_minutes (always 0 until the packets that build unconfirmed sessions), over_cap_minutes.
create or replace function public.timer_day_score(p_day date)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with recent_days as (
    select distinct day
    from public.timer_sessions
    where user_id = (select auth.uid()) and day < p_day
    order by day desc
    limit 7
  ),
  mine as (
    select t.day,
           t.active_seconds,
           extract(epoch from (t.ended_at - t.started_at)) as elapsed_seconds,
           sc.credited_seconds,
           sc.longest_stretch_seconds,
           sc.over_cap_seconds
    from public.timer_sessions t
    cross join lateral public.timer_session_score(t.started_at, t.ended_at, t.active_seconds, t.pauses) as sc
    where t.user_id = (select auth.uid())
      and (t.day = p_day or t.day in (select day from recent_days))
  ),
  earlier as (
    select coalesce(array_agg(day_total), '{}'::numeric[]) as totals
    from (select sum(credited_seconds) as day_total from mine where day <> p_day group by day) d
  ),
  today as (
    select count(*)::integer as sessions,
           (count(*) filter (where active_seconds < 600))::integer as short_sessions,
           coalesce(sum(credited_seconds), 0) as credited_seconds,
           coalesce(max(longest_stretch_seconds), 0) as longest_seconds,
           coalesce(sum(active_seconds), 0) as counted_seconds,
           coalesce(sum(elapsed_seconds), 0) as elapsed_seconds,
           coalesce(sum(over_cap_seconds), 0) as over_cap_seconds
    from mine
    where day = p_day
  )
  select jsonb_build_object(
    'day', p_day,
    'credited_minutes', round(t.credited_seconds / 60, 3),
    'word', public.timer_day_word(t.credited_seconds, t.sessions, public.timer_usual_seconds(e.totals)),
    'usual_minutes', round(public.timer_usual_seconds(e.totals) / 60, 3),
    'usual_is_stand_in', cardinality(e.totals) <> 7,
    'sessions', t.sessions,
    'short_sessions', t.short_sessions,
    'longest_stretch_minutes', round(t.longest_seconds / 60, 3),
    'counted_minutes', round(t.counted_seconds / 60, 3),
    'counted_over_elapsed', case when t.elapsed_seconds > 0 then round(t.counted_seconds / t.elapsed_seconds, 4) else null end,
    'unconfirmed_minutes', 0,
    'over_cap_minutes', round(t.over_cap_seconds / 60, 3)
  )
  from today t cross join earlier e
$$;

-- 5. Who may call what: signed-in people only, never the anonymous role.
revoke all on function public.timer_session_score(timestamptz, timestamptz, integer, jsonb) from public, anon;
revoke all on function public.timer_usual_seconds(numeric[]) from public, anon;
revoke all on function public.timer_day_word(numeric, integer, numeric) from public, anon;
revoke all on function public.timer_day_score(date) from public, anon;
grant execute on function public.timer_session_score(timestamptz, timestamptz, integer, jsonb) to authenticated;
grant execute on function public.timer_usual_seconds(numeric[]) to authenticated;
grant execute on function public.timer_day_word(numeric, integer, numeric) to authenticated;
grant execute on function public.timer_day_score(date) to authenticated;
