# PACKET 09B: DAY SCORE IN THE DATABASE (the number, the word and the readouts of a day, worked out from the saved sessions)

Kind: build. Written by the planner on 2026-10-17, from DECISIONS_DAY_SCORE.md version 2 (the first item of its section 11). Part 1 is done by the agent (three new files, three edited documents, a commit). Part 2 is done BY THE OWNER BY HAND in the Supabase dashboard (the agent cannot run SQL on Supabase).

## GOAL
Put the day score into the database as four read-only SQL functions: the number of a day (credited minutes), its word, and its readouts, worked out from the sessions that are already saved, when asked. Nothing is stored. Nothing in the app changes in this packet: no screen, no call from the app, no change to the timer or to supabase/timer_schema.sql.

## RULES FOR THE AGENT
- Create ONLY the three files listed below and edit ONLY the three documents listed below. Do NOT create any other file (no helper scripts, no .ps1, no notes). Edit nothing else. Do not edit supabase/timer_schema.sql or supabase/timer_verify.sql.
- Do not run any SQL. Do not touch .env. Decide nothing. Copy the files exactly: do not rewrite, improve or rename anything, and do not "fix" a number.
- Any failure or mismatch (a FIND text that is not found exactly once, a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 10 and 11 of AGENTS.md apply. The tags are written in the files below. The agent never invents, renames or deletes a tag.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `b561d7a` (Packet 09A) or a later one, and no changed files, except that `packets/PACKET_09B_DAY_SCORE_DATABASE.md` may show as untracked (`??`) because it was just copied in. Any other changed file: STOP and report the raw output.
2. Create `supabase/day_score.sql` with EXACTLY the content of SQL FILE 1 below (everything between the lines BEGIN FILE and END FILE, not including those two lines).
3. Create `supabase/day_score_verify.sql` with EXACTLY the content of SQL FILE 2 below (same rule).
4. Create `src/lib/dayScoreSql.test.ts` with EXACTLY the content of TEST FILE below (same rule).
5. Edit `CODE_MAP.md` with the three edits of CODE_MAP EDITS below. Each FIND text must occur exactly once in the file.
6. Edit `CONNECTIONS.md` with the two edits of CONNECTIONS EDITS below.
7. Edit `PROGRESS.md` with the two edits of PROGRESS EDITS below.
8. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 36 tags, 71 places` and `CONNECTIONS OK: 54 connections, 429 anchors, 49 classes, 2 css variables, 2 label links`. (Before this packet they were 70 places, 53 connections and 428 anchors.) If any number differs, STOP and report the raw output.
9. Run `npm test`. Expected: `Test Files  21 passed (21)` and `Tests  1099 passed (1099)`. (Before this packet: 20 files and 1085 tests. The 14 new tests are the file dayScoreSql.test.ts.) If anything fails or a number differs, STOP and report the raw output.
10. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
11. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
12. Stage by name only (never `git add .`): `git add supabase/day_score.sql supabase/day_score_verify.sql src/lib/dayScoreSql.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md`
    If `packets/PACKET_09B_DAY_SCORE_DATABASE.md` exists in the project, also add it by name.
13. Commit: `git commit -m "09B: day score in the database (SQL not yet run in Supabase)"`
14. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 5 lines, suggest nothing, start nothing)
`DONE 09B` then: the two raw lines of step 8, the raw `Test Files` and `Tests` lines of step 9 (as one line), and `git log --oneline -1`.

## PART 2: OWNER BY HAND (Supabase dashboard)
Use the SAME Supabase project whose address is in your `.env`.
1. Supabase dashboard, left menu, SQL Editor, New query. First make sure Packet 09A was run: copy ALL of `supabase/timer_verify.sql`, paste, Run. Expected: 6 rows, and in every row the `result` column equals the `expect` column (the last one, pause_log_columns, shows 3). If it does not, run `supabase/timer_schema.sql` first (it is safe to run again) and then `supabase/timer_verify.sql` again. The day score reads the pause log, so Part 2 must not go on until those 6 rows match.
2. New query. Copy ALL of `supabase/day_score.sql`, paste it into the editor, press Run. Expected: "Success. No rows returned". If it shows a red error, send the full error text and do not run anything else.
3. New query. Copy ALL of `supabase/day_score_verify.sql`, paste, Run. Expected: 19 rows, and in every row the `result` column equals the `expect` column.
4. Send the planner the pasted table of those 19 rows. This packet PASSES only when all 19 rows match.

## WHAT THE FUNCTIONS DO (for the planner and the later packets)
- `timer_session_score(started, ended, active_seconds, pauses)`: the score of ONE saved session. It cuts the session into unbroken stretches by its pause log and gives a stretch a credit from 0.75 (a stretch near zero) up to 1.0 (45 minutes or more). One session credits at most 180 counted minutes: the cap is applied stretch by stretch from the start and the stretch that crosses the line is cut. A session with NULL pauses (saved before Packet 09A) counts at full credit, cut at the cap. The last pause is not a break when it ends exactly at the end of the session: it is the stop alert that Hold to end session opens, so the minutes on the alert are never credited. Answer: credited_seconds, longest_stretch_seconds, over_cap_seconds.
- `timer_usual_seconds(recent)`: the middle of exactly 7 day numbers, the stand-in 60 minutes otherwise.
- `timer_day_word(credited_seconds, sessions, usual_seconds)`: NO SESSION, LIGHT (under 50% of the usual), BELOW USUAL (50% to under 80%), USUAL (80% to under 120%), ABOVE USUAL (120% to under 150%), BIG (150% and more). The edges are exact.
- `timer_day_score(day)`: the signed-in person's day. Answer keys: day, credited_minutes (the day number), word, usual_minutes, usual_is_stand_in, sessions, short_sessions, longest_stretch_minutes, counted_minutes, counted_over_elapsed, unconfirmed_minutes, over_cap_minutes. The usual is made only from days BEFORE the asked day, so a past day is scored the way it was then. Only saved sessions count.
- All four are for signed-in people only (never the anonymous role). The app does not call them yet.

## WHAT THE PLANNER HAD TO DECIDE (these are NOT written in DECISIONS_DAY_SCORE.md: read them and say which are wrong)
1. An OLD session (NULL pauses) counts at full credit, and is still cut at the cap. Section 2 of the decisions file says so (DECIDED) but section 4a says an old session "is one stretch", which under the formula of section 4b would give a 20 minute old session only 0.917. The packet follows section 2. If you want section 4a instead, the NULL branch of timer_session_score changes.
2. The credited seconds of a session are cut to its counted seconds (after the cap). This only matters when a log is incomplete, for example a session that was already running when Packet 09A was run and had paused before it (its early pauses were never written down): it is read as one long stretch and still cannot be credited above what it counted.
3. The "longest unbroken stretch" readout is measured AFTER the cap (a 6 hour session shows 180). Section 6 does not say.
4. counted_over_elapsed is the counted seconds of the day divided by the elapsed seconds (end minus start) of the same sessions, both NOT cut at the cap. It is null for a day without a session. "Short" means counted under 10 minutes (600 seconds).
5. The answer gives minutes rounded to 3 decimals (counted_over_elapsed to 4). The word is chosen from the exact seconds, not from the rounded minutes.
6. TODAY a forgotten 6 hour timer counts 180 minutes (the cap) and the day word is BIG. Row A of the table in section 7 of the decisions file ("0, +180 waiting") describes what happens AFTER the packets that build the "still working?" tap and unconfirmed sessions (items 3 and 4 of section 11). Section 5c of the decisions file says the same ("until that packet exists, a forgotten timer is saved in full"). Until then unconfirmed_minutes is always 0 and the word NOTHING CONFIRMED YET cannot come. Delete a wrong session in Supabase.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED in the planning sandbox on a scratch Postgres (PGlite, compiled to WebAssembly) with stand-ins for the roles `anon` and `authenticated` and for `auth.uid()`: 103 checks passed. They run supabase/timer_schema.sql and supabase/day_score.sql twice each (safe to run again), the seven worked days of section 7 of the decisions file (Days 4, 6, 7, B, C, D and the 6 hour timer) through the session function and through the whole day function, the cap (also a cap that cuts a stretch with a small credit), old sessions with NULL pauses, a real Hold to end session run through timer_start, timer_pause and timer_end (the log entry ends exactly at the end of the session and the 60 minutes credit 60), the usual with 7 days, with fewer, and with a forgotten huge day, every edge of the word table, a past day scored again later (same result), one person never seeing another's sessions, the anonymous role refused, and both verify files (supabase/timer_verify.sql 6 rows, supabase/day_score_verify.sql 19 rows: every result equals its expect).
- The tests were checked for teeth: with the credit floor changed to 0.70, with the edge of LIGHT made inclusive, and with the stop alert minutes credited, the checks fail (25, 3 and 1 failures); with the file put back they pass again.
- This packet was applied step by step to a clean copy of master at commit b561d7a: `node scripts/check-tags.mjs` printed the two lines of step 8, `npm test` printed 21 files and 1099 tests, `npm run build` and `tsc -b` passed, and oxlint found no warning in the new test file (the 19 warnings of the project were there before).
- NOT TESTED: on real Supabase (its Postgres version, its real `auth` schema, the API layer); a call from the app (the app does not call the functions yet); time zones with daylight saving time (the day is the saved `day` column and the score never works it out again, but the pause log and the end of a session are exact times); the speed of the score with a long history (it reads only the asked day and the 7 earlier days that have sessions); a phone or a browser. `npm test` only reads the TEXT of the SQL files: the behaviour is checked by supabase/day_score_verify.sql in the Supabase SQL Editor.

## CODE_MAP EDITS (CODE_MAP.md)
**Edit 1** (the one line of the table TIMER that starts with | `AB:TIMER.TESTS` |)
FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
nothing sent to the app), 
END TEXT
REPLACE WITH:
BEGIN TEXT
nothing sent to the app), the day score in the SQL file (its four functions, who may call them, the numbers and the edges of its rules, its verify file), 
END TEXT

**Edit 2** (the same line)
FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
`src/lib/timerWarmup.test.ts` | add tests;
END TEXT
REPLACE WITH:
BEGIN TEXT
`src/lib/timerWarmup.test.ts`, `src/lib/dayScoreSql.test.ts` | add tests;
END TEXT

**Edit 3** (the same line)
FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
C47, C48, C49, C50, C52 and C53 |
END TEXT
REPLACE WITH:
BEGIN TEXT
C47, C48, C49, C50, C52, C53 and C54 |
END TEXT

## CONNECTIONS EDITS (CONNECTIONS.md)
**Edit 1** (the title of entry C53)
FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the day score will read it later, and the app does not see it
END TEXT
REPLACE WITH:
BEGIN TEXT
the day score reads it (C54), and the app does not see it
END TEXT

**Edit 2** (a new entry C54 goes in front of the heading "Things to know"; the REPLACE text ends with that heading again, so it stays)
FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Things to know (no check is possible)
END TEXT
REPLACE WITH:
BEGIN TEXT
### C54: The day score: the SQL file, its verify file and its tests are tied to DECISIONS_DAY_SCORE.md and to the pause log
- Tags: `AB:TIMER.TESTS`
- If you change: a rule or a number of the day score (the credit of a stretch, the 45 minutes, the 0.75, the cap of 180 minutes, the stand-in usual of 60 minutes, the 7 days of the usual, the edges and the words of a day, the 10 minute line of a short session), the keys of its answer, or the names and arguments of the four functions in supabase/day_score.sql (timer_session_score, timer_usual_seconds, timer_day_word, timer_day_score)
- Then also: change DECISIONS_DAY_SCORE.md FIRST (it is the file of the rules), then supabase/day_score.sql, supabase/day_score_verify.sql (its 19 rows hold the worked days in seconds) and src/lib/dayScoreSql.test.ts (it reads the text of both SQL files and of timer_schema.sql). The score reads the pause log (the keys from and to; NULL means not known and [] means no pause, see C53) and the columns day, started_at, ended_at and active_seconds of timer_sessions: a change of those in supabase/timer_schema.sql changes the score. The score is read-only and stores nothing, so a change of a rule re-scores every past day from the raw sessions and nothing has to be migrated. The app does not call the score yet. When it does (a later packet), timerApi.ts calls timer_day_score(p_day) and reads its twelve keys, and C29 must get them. The owner has to run the changed supabase/day_score.sql and then supabase/day_score_verify.sql in the Supabase SQL Editor (the agent cannot run SQL). The checker cannot read SQL: npm test reads the files (dayScoreSql.test.ts).
- If you forget: the number of a day, its word or its usual is wrong while every test is green (npm test only reads the text of the SQL), or the verify file fails, or the app later reads a key that the SQL no longer sends.
- Anchor: `AB:TIMER.TESTS @ src/lib/dayScoreSql.test.ts = describe("the day score SQL file: what it makes and who may call it (Packet 09B)", () => {`
- Check by hand: after any change in supabase/day_score.sql run npm test, run the SQL in the Supabase SQL Editor, then supabase/day_score_verify.sql: all 19 rows must show the same value in result and expect.

## Things to know (no check is possible)
END TEXT

## PROGRESS EDITS (PROGRESS.md)
**Edit 1** (the end of the Done line of Packet 09A: a new line is added after it)
FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
no score rule is decided or built here.
END TEXT
REPLACE WITH:
BEGIN TEXT
no score rule is decided or built here.
- Packet 09B: the day score in the database (supabase/day_score.sql and supabase/day_score_verify.sql). Four functions: timer_session_score (one saved session: cut into unbroken stretches by its pause log, the credit of a stretch from 0.75 up to 1.0 at 45 minutes, the cap of 180 counted minutes, an old session with no pause log at full credit, the stop alert at the end is not a break), timer_usual_seconds (the middle of the 7 most recent earlier days with sessions, or the stand-in 60 minutes), timer_day_word (NO SESSION, LIGHT, BELOW USUAL, USUAL, ABOVE USUAL and BIG at 50, 80, 120 and 150 percent of the usual) and timer_day_score(day) (the number of the day in minutes, its word and its readouts, worked out from the saved sessions when asked, nothing stored). The app does not call it yet and nothing on the screen changes. No session can be unconfirmed yet, so unconfirmed_minutes is always 0. The rules are in DECISIONS_DAY_SCORE.md (version 2). Changed: the two new SQL files and src/lib/dayScoreSql.test.ts (14 tests); CODE_MAP.md and CONNECTIONS.md (C54, and the title of C53) were brought up to date. With automated tests.
END TEXT

**Edit 2** (the first line of the Next list: a new line is added in front of it)
FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Next
- Owner runs supabase/timer_schema.sql and then supabase/timer_verify.sql
END TEXT
REPLACE WITH:
BEGIN TEXT
## Next
- Owner runs supabase/day_score.sql and then supabase/day_score_verify.sql in the Supabase SQL Editor (Packet 09B), after timer_schema.sql. The 19 rows of the second must show the same value in result and expect.
- Owner runs supabase/timer_schema.sql and then supabase/timer_verify.sql
END TEXT

## SQL FILE 1: supabase/day_score.sql
BEGIN FILE
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
END FILE

## SQL FILE 2: supabase/day_score_verify.sql
BEGIN FILE
-- ASHBORN day score (Packet 09B): check that day_score.sql was run. Run in the Supabase SQL Editor AFTER day_score.sql.
-- Expected result: 19 rows. In every row the "result" column must equal the "expect" column.
-- The numbers are the worked days of DECISIONS_DAY_SCORE.md section 7, in seconds (60 minutes = 3600 seconds).
select 'functions_exist' as check_name, (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('timer_session_score', 'timer_usual_seconds', 'timer_day_word', 'timer_day_score'))::text as result, '4' as expect
union all
select 'anonymous_cannot_score', has_function_privilege('anon', 'public.timer_day_score(date)', 'execute')::text, 'false'
union all
select 'signed_in_can_score', has_function_privilege('authenticated', 'public.timer_day_score(date)', 'execute')::text, 'true'
union all
select 'old_session_full_credit', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:20:00+00', 1200, null))::text, '1200.000'
union all
select 'day6_one_2min_pause', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 11:02:00+00', 3600, '[{"from": "2026-10-01T10:30:00+00:00", "to": "2026-10-01T10:32:00+00:00"}]'::jsonb))::text, '3300.000'
union all
select 'day7_eight_5min_pauses', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 11:40:00+00', 3600, (select jsonb_agg(jsonb_build_object('from', timestamptz '2026-10-01 10:00:00+00' + make_interval(secs => i * 400 + (i - 1) * 300), 'to', timestamptz '2026-10-01 10:00:00+00' + make_interval(secs => i * 400 + i * 300)) order by i) from generate_series(1, 8) as i)))::text, '2833.333'
union all
select 'day4_four_5min_and_one_60min', round(4 * (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:05:00+00', 300, '[]'::jsonb)) + (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 11:00:00+00', 3600, '[]'::jsonb)), 3)::text, '4533.333'
union all
select 'dayB_ten_3min', round(10 * (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:03:00+00', 180, '[]'::jsonb)), 3)::text, '1380.000'
union all
select 'dayC_two_45min', round(2 * (select credited_seconds from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:45:00+00', 2700, '[]'::jsonb)), 3)::text, '5400.000'
union all
select 'dayD_one_30min', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:30:00+00', 1800, '[]'::jsonb))::text, '1650.000'
union all
select 'stop_alert_is_not_a_break', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 10:15:00+00', 600, '[{"from": "2026-10-01T10:10:00+00:00", "to": "2026-10-01T10:15:00+00:00"}]'::jsonb))::text, '483.333'
union all
select 'cap_credit_4_hours', (select round(credited_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 14:00:00+00', 14400, '[]'::jsonb))::text, '10800.000'
union all
select 'cap_over_4_hours', (select round(over_cap_seconds, 3) from public.timer_session_score(timestamptz '2026-10-01 10:00:00+00', timestamptz '2026-10-01 14:00:00+00', 14400, '[]'::jsonb))::text, '3600.000'
union all
select 'words_of_the_seven_days', (select string_agg(public.timer_day_word(v, 1, 3600), '|' order by o) from unnest(array[4533.333, 3300, 2833.333, 1380, 5400, 1650]::numeric[]) with ordinality as t(v, o)), 'ABOVE USUAL|USUAL|BELOW USUAL|LIGHT|BIG|LIGHT'
union all
select 'words_at_the_edges', (select string_agg(public.timer_day_word(v, 1, 3600), '|' order by o) from unnest(array[1799.99, 1800, 2879.99, 2880, 4319.99, 4320, 5399.99, 5400]::numeric[]) with ordinality as t(v, o)), 'LIGHT|BELOW USUAL|BELOW USUAL|USUAL|USUAL|ABOVE USUAL|ABOVE USUAL|BIG'
union all
select 'word_no_session', public.timer_day_word(0, 0, 3600), 'NO SESSION'
union all
select 'usual_is_the_middle_of_seven', public.timer_usual_seconds(array[7200, 600, 3000, 3300, 5400, 100, 10800]::numeric[])::text, '3300'
union all
select 'usual_stand_in_under_seven', public.timer_usual_seconds(array[1, 2, 3]::numeric[])::text, '3600'
union all
select 'day_score_runs_without_sign_in', public.timer_day_score(date '2026-10-01') ->> 'word', 'NO SESSION';
END FILE

## TEST FILE: src/lib/dayScoreSql.test.ts
BEGIN FILE
import { describe, expect, it } from "vitest"
import dayScoreSql from "../../supabase/day_score.sql?raw"
import dayScoreVerifySql from "../../supabase/day_score_verify.sql?raw"
import schemaSql from "../../supabase/timer_schema.sql?raw"

// AB:TIMER.TESTS:START

// Tests of the day score in the SQL files (Packet 09B). Run them with: npm test
// Like the tests of the pause log, these read the TEXT of the SQL files: npm test cannot run SQL.
// The behaviour itself (the seven worked days, the cap, the stop alert, the edges of the words) is checked by the owner with
// supabase/day_score_verify.sql in the Supabase SQL Editor, see CONNECTIONS.md C54.
// The rules are in DECISIONS_DAY_SCORE.md. A number written here must match that file and the SQL file.

const FUNCTIONS = [
  "timer_session_score(timestamptz, timestamptz, integer, jsonb)",
  "timer_usual_seconds(numeric[])",
  "timer_day_word(numeric, integer, numeric)",
  "timer_day_score(date)",
]

describe("the day score SQL file: what it makes and who may call it (Packet 09B)", () => {
  it("makes exactly the four functions of the day score", () => {
    const made = [...dayScoreSql.matchAll(/create or replace function public\.(\w+)\(/g)].map((m) => m[1])
    expect(made).toEqual(["timer_session_score", "timer_usual_seconds", "timer_day_word", "timer_day_score"])
  })

  it("does not change any table and does not replace any function of the timer", () => {
    expect(dayScoreSql).not.toMatch(/create table|alter table|drop |insert into|update public|delete from/i)
    expect(dayScoreSql).not.toMatch(/create or replace function public\.timer_(start|pause|resume|end|state|day_total|cap_at|row_json)\b/)
    expect(dayScoreSql).not.toContain("timer_running")
  })

  it("lets only signed-in people call each function, never the anonymous role", () => {
    for (const signature of FUNCTIONS) {
      expect(dayScoreSql).toContain("revoke all on function public." + signature + " from public, anon;")
      expect(dayScoreSql).toContain("grant execute on function public." + signature + " to authenticated;")
    }
  })

  it("keeps the three helpers pure (immutable) and the day function read-only (stable, not security definer)", () => {
    const body = (name: string) => dayScoreSql.split("create or replace function public." + name + "(")[1].split("$$;")[0]
    for (const name of ["timer_session_score", "timer_usual_seconds", "timer_day_word"]) {
      expect(body(name)).toContain("immutable")
      expect(body(name)).not.toContain("public.timer_sessions")
    }
    expect(body("timer_day_score")).toContain("stable")
    expect(body("timer_day_score")).not.toContain("security definer")
    expect(body("timer_day_score")).toContain("where user_id = (select auth.uid()) and day < p_day")
    expect(body("timer_day_score")).toContain("where t.user_id = (select auth.uid())")
  })
})

describe("the day score SQL file: the rules of DECISIONS_DAY_SCORE.md (Packet 09B)", () => {
  it("reads the pause log with the keys from and to that timer_schema.sql writes, and tells NULL (not known) from [] (no pause)", () => {
    expect(schemaSql).toContain("jsonb_build_object('from', r.paused_at, 'to', now())")
    expect(dayScoreSql).toContain("(e.value ->> 'from')::timestamptz")
    expect(dayScoreSql).toContain("(e.value ->> 'to')::timestamptz")
    expect(dayScoreSql).toContain("coalesce(p_pauses, '[]'::jsonb)")
    expect(dayScoreSql).toContain("case when p_pauses is null then least(p_active, 10800)::numeric")
  })

  it("gives a stretch a credit from 0.75 up to 1.0 at 45 minutes, with the division last so that it stays exact", () => {
    expect(dayScoreSql).toContain("kept * 0.75 + kept * least(kept, 2700) / 10800 as credit")
  })

  it("cuts a session at 180 counted minutes, stretch by stretch in time order, and never credits more than was counted", () => {
    expect(dayScoreSql).toContain("least(len, 10800 - coalesce(sum(len) over (order by s rows between unbounded preceding and 1 preceding), 0))")
    expect(dayScoreSql).toContain("least((select credit from totals), least(p_active, 10800)::numeric)")
    expect(dayScoreSql).toContain("greatest(0, p_active - 10800)::numeric")
  })

  it("makes a stretch end where the last pause begins when that pause is the stop alert at the end", () => {
    expect(dayScoreSql).toContain("select a.pt, p_ended from pz a where a.n = a.total and a.pt < p_ended")
  })

  it("takes the usual from the middle of exactly 7 earlier days, and the stand-in 60 minutes otherwise", () => {
    expect(dayScoreSql).toContain("when cardinality(p_recent) = 7")
    expect(dayScoreSql).toContain("order by v offset 3 limit 1")
    expect(dayScoreSql).toContain("else 3600")
    expect(dayScoreSql).toContain("where user_id = (select auth.uid()) and day < p_day")
    expect(dayScoreSql).toContain("limit 7")
  })

  it("chooses the word of a day from the exact seconds with the edges 50%, 80%, 120% and 150%", () => {
    expect(dayScoreSql).toContain("when p_sessions = 0 then 'NO SESSION'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 2 < p_usual_seconds then 'LIGHT'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 5 < p_usual_seconds * 4 then 'BELOW USUAL'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 5 < p_usual_seconds * 6 then 'USUAL'")
    expect(dayScoreSql).toContain("when p_credited_seconds * 2 < p_usual_seconds * 3 then 'ABOVE USUAL'")
    expect(dayScoreSql).toContain("else 'BIG'")
  })

  it("counts a session under 10 minutes as short, for the readout only", () => {
    expect(dayScoreSql).toContain("count(*) filter (where active_seconds < 600)")
  })

  it("answers with the twelve keys, and says 0 unconfirmed minutes until unconfirmed sessions are built", () => {
    for (const key of [
      "day",
      "credited_minutes",
      "word",
      "usual_minutes",
      "usual_is_stand_in",
      "sessions",
      "short_sessions",
      "longest_stretch_minutes",
      "counted_minutes",
      "counted_over_elapsed",
      "unconfirmed_minutes",
      "over_cap_minutes",
    ]) {
      expect(dayScoreSql).toContain("'" + key + "',")
    }
    expect(dayScoreSql).toContain("'unconfirmed_minutes', 0,")
  })
})

describe("the day score verify file (Packet 09B)", () => {
  it("has 19 rows and says so", () => {
    expect(dayScoreVerifySql).toContain("Expected result: 19 rows.")
    expect(dayScoreVerifySql.match(/^select '/gm)).toHaveLength(19)
    expect(dayScoreVerifySql.match(/^union all$/gm)).toHaveLength(18)
  })

  it("carries the worked days of the decisions file, in seconds", () => {
    for (const expected of ["'3300.000'", "'2833.333'", "'4533.333'", "'1380.000'", "'5400.000'", "'1650.000'", "'483.333'", "'10800.000'", "'3600.000'"]) {
      expect(dayScoreVerifySql).toContain(expected)
    }
    expect(dayScoreVerifySql).toContain("'ABOVE USUAL|USUAL|BELOW USUAL|LIGHT|BIG|LIGHT'")
    expect(dayScoreVerifySql).toContain("'LIGHT|BELOW USUAL|BELOW USUAL|USUAL|USUAL|ABOVE USUAL|ABOVE USUAL|BIG'")
  })
})
// AB:TIMER.TESTS:END
END FILE
