# PACKET 10A: SESSION TAGS IN THE DATABASE (a table of tags, tag_id on the sessions, four tag functions, timer_start with a tag; no screen, the app only learns four error names)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_10A_TAGS_DATABASE.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: copy this file into the `packets/` folder, then stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time; step 11 says what to do then.

Kind: build. Written by the planner on 2026-10-17, from the tags talk (nothing in it was locked, no decisions file exists yet) and the design of the Packet 10A handoff. Part 1 is done by the agent (two SQL files, two app files and three documents edited, one new test file, a commit). Part 2 is done BY THE OWNER BY HAND in the Supabase dashboard (the agent cannot run SQL on Supabase).

## GOAL
Put session tags into the database. A person has tags of their own (table `timer_tags`, at most 10 live ones). The running session and the saved session get a `tag_id`. `timer_start` takes the tag chosen before Start (it may be left out: that is Freestyle). `timer_end` saves the tag with the session. Four new functions list, add, rename and archive tags. Nothing is shown and nothing asks for a tag: no screen, no picker, no tag call from the app (only the four new error names are added to `DATABASE_ERRORS`), the tag is not sent to the app, and the day score ignores tags.

## RULES FOR THE AGENT
- Edit ONLY these files: `supabase/timer_schema.sql`, `supabase/timer_verify.sql`, `src/lib/timerApi.ts`, `src/lib/timerApi.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Create ONLY `src/lib/tagsSql.test.ts`. Do NOT create any other file (no helper scripts, no .ps1, no notes). Do not touch `supabase/day_score.sql`, `supabase/day_score_verify.sql`, any screen, any hook, `.env`, or anything else.
- Do not run any SQL. Decide nothing. Copy the texts exactly as written: do not rewrite, improve, reformat or rename anything. Keep the indentation of every line as written. Each text between BEGIN TEXT and END TEXT is the lines between those two lines, joined with line breaks, with no line break after the last line.
- Each FIND text must occur exactly once in its file at the moment you apply it (apply the edits of a file in the order written). If it does not, STOP and report which edit and the raw count.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply. The tags are already in the files and no tag is added, renamed or deleted in this packet. The edits of `src/lib/timerApi.ts` fall between `AB:TIMER.API:START` and `AB:TIMER.API:END`. The edits of `src/lib/timerApi.test.ts` and the new file `src/lib/tagsSql.test.ts` fall between `AB:TIMER.TESTS:START` and `AB:TIMER.TESTS:END`.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `f515cf8` (Packet 09C) or a later one, and no changed files, except that `packets/PACKET_10A_TAGS_DATABASE.md` may show as untracked (`??`) because it was just copied in. Any other changed file: STOP and report the raw output.
2. Edit `supabase/timer_schema.sql` with the 13 edits of EDITS OF THE SQL SCHEMA below.
3. Edit `supabase/timer_verify.sql` with the 4 edits of EDITS OF THE VERIFY FILE below.
4. Edit `src/lib/timerApi.ts` with the 2 edits of EDITS OF THE CALLS below.
5. Edit `src/lib/timerApi.test.ts` with the 3 edits of EDITS OF THE TESTS below.
6. Create `src/lib/tagsSql.test.ts` with EXACTLY the content of NEW TEST FILE below (everything between the lines BEGIN FILE and END FILE, not including those two lines; the file ends with one line break).
7. Edit `CODE_MAP.md` with the 3 edits of CODE_MAP EDITS below.
8. Edit `CONNECTIONS.md` with the 6 edits of CONNECTIONS EDITS below.
9. Edit `PROGRESS.md` with the 2 edits of PROGRESS EDITS below.
10. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 36 tags, 72 places` and `CONNECTIONS OK: 55 connections, 449 anchors, 49 classes, 2 css variables, 2 label links`. (Before this packet they were 71 places, 54 connections and 443 anchors. The new connection is C55 with 2 anchors, C28 gets 4 new anchors, and 1 anchor of C29 changes its text.) If any number differs, STOP and report the raw output.
11. Run `npm test`. Expected: `Test Files  22 passed (22)` and `Tests  1156 passed (1156)`. (Before this packet: 21 files and 1137 tests. The 19 new tests are 15 in `src/lib/tagsSql.test.ts` and 4 in `src/lib/timerApi.test.ts` from the longer list of error names.) If a number differs, or a test fails, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond", say so in your report: the computer was too busy, and the owner will free it and tell you to run this step again. Do not change any file for it.
12. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
13. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
14. Stage by name only (never `git add .`): `git add supabase/timer_schema.sql supabase/timer_verify.sql src/lib/timerApi.ts src/lib/timerApi.test.ts src/lib/tagsSql.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md`
    If `packets/PACKET_10A_TAGS_DATABASE.md` exists in the project, also add it by name.
15. Commit: `git commit -m "10A: session tags in the database (SQL not yet run in Supabase)"`
16. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 5 lines, suggest nothing, start nothing)
`DONE 10A` then: the two raw lines of step 10, the raw `Test Files` and `Tests` lines of step 11 (as one line), and `git log --oneline -1`.

## PART 2: OWNER BY HAND (Supabase dashboard)
Use the SAME Supabase project whose address is in your `.env`. You can do Part 2 before or after Part 1: the app does not use tags yet. The app you have should keep working with the new database, because the new `timer_start` can still be called with one argument (the planner's SQL test does exactly that; the real API layer was not tested, see below). If the Start button stops working after step 1, say so at once and send the error.
1. Supabase dashboard, left menu, SQL Editor, New query. Copy ALL of `supabase/timer_schema.sql` (the new version, after Part 1), paste it into the editor, press Run. Expected: "Success. No rows returned". It is safe to run again. It also removes the old one-argument `timer_start` and puts the new two-argument one in its place. Your saved sessions are not changed (they get an empty tag, which means Freestyle or not known). If it shows a red error, send the full error text and do not run anything else.
2. New query. Copy ALL of `supabase/timer_verify.sql`, paste, Run. Expected: 13 rows, and in every row the `result` column equals the `expect` column. The expected values, in order: tables_exist 2, row_level_security_on 2, functions_exist 8, anonymous_can_start false, signed_in_can_start true, pause_log_columns 3, tag_table_with_row_level_security 1, tag_id_columns 2, tag_functions_exist 4, one_start_function 1, anonymous_cannot_add_tag false, signed_in_can_add_tag true, tag_name_unique_among_live_tags 1.
3. Recommended: New query, copy ALL of `supabase/day_score_verify.sql`, Run. Expected: 19 rows, every `result` equal to `expect` (the day score is not changed by this packet; this shows it still works on the new tables).
4. Send the planner the pasted table of the 13 rows. This packet PASSES only when all 13 match.

## WHAT THE SQL DOES (for the owner and the later packets)
- Table `timer_tags` (id, user_id, name, created_at, archived_at). A person can read only their own tags. Nobody writes the table directly: only the four functions do.
- `timer_tag_list()`: the live tags of the signed-in person, oldest first, as a list of `{id, name}`.
- `timer_tag_add(p_name)`: makes a tag and answers `{id, name}`. If an archived tag has that name, the NEWEST archived tag of that name comes back instead (same id, so its old sessions rejoin it; it takes the spelling typed now).
- `timer_tag_rename(p_id, p_name)`: renames a live tag. Old sessions of that tag show the new name too, because a session points to its tag by id.
- `timer_tag_archive(p_id)`: sets `archived_at`. A tag is never deleted. Sessions keep their tag.
- Rules of a name: spaces at both ends are cut, 1 to 20 characters, no control character (tab, line break), the name Freestyle in any capitals is reserved: BAD_TAG_NAME. A live tag with the same name, whatever the capitals: TAG_NAME_TAKEN. More than 10 live tags: TAG_LIMIT. A tag that is not yours, or is archived, in rename, archive or `timer_start`: TAG_NOT_FOUND. Add and rename take a lock per person, so two devices cannot make the 11th tag at the same moment.
- `timer_start(p_tz, p_tag_id default null)`: the tag goes into the running session. Without it the session is Freestyle. `timer_end` copies the tag into the saved session, also when the tag was archived while the session ran. `timer_row_json` is NOT changed: the app is not told the tag.
- All new functions are for signed-in people only (never the anonymous role).

## WHAT THE PLANNER HAD TO DECIDE (these are NOT written in a decisions file: read them and say which are wrong)
AGREED in the tags talk, as the handoff of this packet records it: the tag is chosen BEFORE Start; Freestyle means no tag is saved; you add and edit your own tags (about 4 to 10); tags never change the day score; old sessions have no tag ("not known", the same rule as the pause log). The talk summary itself was not available to the planner when this packet was written. Everything below is the planner's DEFAULT:
1. Storage: a new table `timer_tags` with a row per tag; a person reads only their own; no direct writes.
2. Name rules: spaces cut at both ends, 1 to 20 characters, no control character, Freestyle (any capitals) reserved.
3. One live tag per name per person, whatever the capitals (Python = python).
4. Limit: at most 10 live tags (open question 5 of the talk). A rename needs no free place.
5. Delete means archive: the row stays and the sessions keep their tag (open question 4 of the talk).
6. A rename changes the tag row, so OLD sessions show the NEW name.
7. Adding a name that matches an archived tag brings back the NEWEST archived tag of that name (same id, takes the new spelling).
8. Renaming or archiving an archived tag is TAG_NOT_FOUND.
9. `tag_id` is empty (NULL) for Freestyle and for a session saved before tags. The two cannot be told apart later.
10. `timer_start` has a second argument with a default, and the one-argument version is dropped (otherwise a call with one argument is ambiguous). A tag that is not yours or is archived: TAG_NOT_FOUND.
11. `timer_end` saves the tag of the running session even if the tag was archived while the session ran.
12. The app is not sent the tag yet (`timer_row_json` keeps its six keys). A later packet adds it together with the type and the maths.
13. Four functions named as above, signed-in people only. The list is oldest first and shows live tags only; add, rename and archive answer `{id, name}`.
14. Four new error names: BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT, TAG_NOT_FOUND. They are added to DATABASE_ERRORS; no screen reacts to them yet, so `useTimer` shows them as "Something went wrong".

NOT in 10A (later packets): the picker screen, remembering the last tag, the Overview per tag, changing the tag of a saved session, a colour or an icon per tag, tasks.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED on a scratch Postgres 16 (with stand-ins for the roles `anon` and `authenticated` and for `auth.uid()`):
  - An OLD database (the Packet 09A tables with 3 old sessions and 1 running session) was migrated by running the new `timer_schema.sql` three times (once, again, and again after the behaviour test): exit 0 every time. Old sessions keep an empty tag, the old running session can still be ended, the one-argument `timer_start` is gone. A fresh empty database: the file run twice, exit 0.
  - `timer_verify.sql`: 13 rows of 13 match (migrated and fresh). `day_score_verify.sql`: 19 of 19 (migrated and fresh): the day score is untouched. The OLD verify file fails against the new schema because the one-argument `timer_start` is gone, as it should.
  - A behaviour test passed on every run: the limit of 10, the name rules, duplicates by capitals, rename (also of capitals only), archive, bring-back of the newest archived tag, start with a tag (not found / not yours / archived), the tag saved with the session even when archived meanwhile, Freestyle with a one-argument start, two people never seeing each other's tags, direct writes refused, the anonymous role refused, the table rules, and deleting a person removing their tags and sessions.
  - Race test: a person with 9 tags; device A adds the 10th and holds its transaction open for 4 seconds, device B adds an 11th one second later. B waits about 3 seconds for the lock, then gets TAG_LIMIT, and the person ends with exactly 10 live tags. Python and python at once: one TAG_NAME_TAKEN and one live tag. With the lock taken out, B does not wait and the person ends with 11 tags: the test notices.
  - Teeth, SQL: 16 deliberate breaks of the SQL file, one at a time (limit 11, capitals ignored, Freestyle not reserved, oldest archived tag brought back, tag not copied by `timer_end`, archived tag or someone else's tag accepted by `timer_start`, rename of an archived tag, archive of someone else's tag, list showing archived tags, list in the wrong order, the anonymous role allowed, row-level security off, direct writes allowed, the one-argument `timer_start` kept, no lock). 15 are caught by the behaviour test or by `timer_verify.sql`; the 16th (no lock) is caught by the race test.
  - Teeth, `npm test`: the same 16 breaks put into `supabase/timer_schema.sql` make `npm test` fail in 12 cases. Four are NOT noticed by `npm test`: rename of an archived tag, archive of someone else's tag, the list showing archived tags, and the order of the list. Only the SQL behaviour test (which needs Postgres) catches those four. Breaking the TypeScript list of error names (a name removed, a name misspelt) or removing a row of `timer_verify.sql` is caught every time.
- This packet's edits were applied step by step by a script that reads THIS file, to a clean copy of master at commit f515cf8: `node scripts/check-tags.mjs` printed the two lines of step 10, `npm test` printed 22 files and 1156 tests, `npm run build` and `tsc -b` passed, and oxlint printed 0 errors and 19 warnings (the 19 warnings were there before and none is in the three files this packet changes).
- NOT TESTED: on real Supabase (its Postgres version, its real `auth` schema, the API layer: the SQL ends with a request to reload the API schema, which was not run anywhere); a call from the app (the app does not call the tag functions); more than two devices at once; time zones with daylight saving time; a phone or a browser. `npm test` only reads the TEXT of the SQL files: the behaviour is checked by `supabase/timer_verify.sql` (13 rows, only what exists and who may call it) and by the planner's behaviour test (not in the repository).

## THINGS TO KNOW (no check is possible)
- `supabase/day_score.sql` line 15 still says the tag is "not built yet". After 10A the tag is stored but the score ignores it. This packet does not edit that file.
- `DECISIONS_DAY_SCORE.md` is not in the repository, although the SQL files, their tests and CONNECTIONS refer to it. This packet does not touch it.
- A session saved before 10A and a Freestyle session both have an empty `tag_id`. They cannot be told apart later.
- If you change a rule of the tags (the 20 characters, the limit of 10, the reserved name), change the SQL file, its verify file, `src/lib/tagsSql.test.ts` and C55 together.

## EDITS OF THE SQL SCHEMA (supabase/timer_schema.sql)
**Edit 1** (the header comment: one new line about the session tags (after the line about the pause log))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- The pause log (Packet 09A): every pause is written down with the server time it began and the server time it ended, and the person's time zone is saved with each session. See 2b.
END TEXT

REPLACE WITH:
BEGIN TEXT
-- The pause log (Packet 09A): every pause is written down with the server time it began and the server time it ended, and the person's time zone is saved with each session. See 2b.
-- Session tags (Packet 10A): a person has tags (names for sessions, at most 10 live ones); the tag chosen before Start is saved with the session. No tag = Freestyle. The tag never changes the day score. See 2c and 11b.
END TEXT

**Edit 2** (new section 2c, before section 3: the table timer_tags, its index of live names, and tag_id in timer_running and in timer_sessions)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- 3. Row-level security: everyone sees only their own rows. The app can read both tables and
--    delete its own finished sessions; everything else goes through the functions below.
END TEXT

REPLACE WITH:
BEGIN TEXT
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
END TEXT

**Edit 3** (section 3: row-level security is turned on for timer_tags)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
alter table public.timer_running enable row level security;
END TEXT

REPLACE WITH:
BEGIN TEXT
alter table public.timer_running enable row level security;
alter table public.timer_tags enable row level security;
END TEXT

**Edit 4** (section 3: the policy that lets a person read only their own tags)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
drop policy if exists timer_running_select_own on public.timer_running;
create policy timer_running_select_own on public.timer_running
  for select to authenticated using (user_id = (select auth.uid()));
END TEXT

REPLACE WITH:
BEGIN TEXT
drop policy if exists timer_running_select_own on public.timer_running;
create policy timer_running_select_own on public.timer_running
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists timer_tags_select_own on public.timer_tags;
create policy timer_tags_select_own on public.timer_tags
  for select to authenticated using (user_id = (select auth.uid()));
END TEXT

**Edit 5** (section 4: nobody may write timer_tags directly, signed-in people may read it)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
revoke all on public.timer_running from public, anon, authenticated;
grant select, delete on public.timer_sessions to authenticated;
grant select on public.timer_running to authenticated;
END TEXT

REPLACE WITH:
BEGIN TEXT
revoke all on public.timer_running from public, anon, authenticated;
revoke all on public.timer_tags from public, anon, authenticated;
grant select, delete on public.timer_sessions to authenticated;
grant select on public.timer_running to authenticated;
grant select on public.timer_tags to authenticated;
END TEXT

**Edit 6** (section 8: the comment and the first line of timer_start (two arguments, the one-argument version is dropped))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- 8. timer_start(tz): begin a session now. Error ALREADY_RUNNING if one exists.
create or replace function public.timer_start(p_tz text)
END TEXT

REPLACE WITH:
BEGIN TEXT
-- 8. timer_start(tz, tag): begin a session now. Error ALREADY_RUNNING if one exists.
--    The second argument is the tag chosen before Start (Packet 10A); leave it out (or null) for Freestyle.
--    A tag that is not the person's own, or is archived: error TAG_NOT_FOUND.
--    The old version with one argument is dropped: two versions would make a call with one argument ambiguous.
--    A call with one argument still works, because the tag has a default.
drop function if exists public.timer_start(text);
create or replace function public.timer_start(p_tz text, p_tag_id uuid default null)
END TEXT

**Edit 7** (section 8: timer_start checks the tag and puts it into the running row)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    raise exception 'BAD_TIMEZONE';
  end if;
  insert into public.timer_running (user_id, tz)
  values (auth.uid(), p_tz)
END TEXT

REPLACE WITH:
BEGIN TEXT
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
END TEXT

**Edit 8** (section 9: a comment line above timer_end (the tag is saved with the session))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
--     at the end is closed at the end moment (Packet 09A). The answer has no new key: the app reads the same keys as before.
END TEXT

REPLACE WITH:
BEGIN TEXT
--     at the end is closed at the end moment (Packet 09A). The answer has no new key: the app reads the same keys as before.
--     The tag of the running session is saved with the session (tag_id, Packet 10A), also when the tag was archived while the session ran.
END TEXT

**Edit 9** (section 9: timer_end copies the tag into the saved session)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz)
    values (r.user_id, (r.started_at at time zone r.tz)::date, r.started_at, v_end, v_active, v_pauses, r.tz)
END TEXT

REPLACE WITH:
BEGIN TEXT
    insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz, tag_id)
    values (r.user_id, (r.started_at at time zone r.tz)::date, r.started_at, v_end, v_active, v_pauses, r.tz, r.tag_id)
END TEXT

**Edit 10** (new section 11b, before section 12: the four tag functions)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- 12. Who may call what: signed-in people only, never the anonymous role.
END TEXT

REPLACE WITH:
BEGIN TEXT
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
END TEXT

**Edit 11** (section 12: the revoke of timer_start now names its two arguments)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
revoke all on function public.timer_start(text) from public, anon;
END TEXT

REPLACE WITH:
BEGIN TEXT
revoke all on function public.timer_start(text, uuid) from public, anon;
END TEXT

**Edit 12** (section 12: the grant of timer_start now names its two arguments)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
grant execute on function public.timer_start(text) to authenticated;
END TEXT

REPLACE WITH:
BEGIN TEXT
grant execute on function public.timer_start(text, uuid) to authenticated;
END TEXT

**Edit 13** (section 12: revoke and grant of the four tag functions)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
grant execute on function public.timer_end() to authenticated;
END TEXT

REPLACE WITH:
BEGIN TEXT
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
END TEXT

## EDITS OF THE VERIFY FILE (supabase/timer_verify.sql)

**Edit 1** (the comment: 13 rows)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- Expected result: 6 rows, exactly as the "expect" column says.
END TEXT

REPLACE WITH:
BEGIN TEXT
-- Expected result: 13 rows, exactly as the "expect" column says.
END TEXT

**Edit 2** (the row that checks that the anonymous role cannot start: the two-argument timer_start)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
has_function_privilege('anon', 'public.timer_start(text)', 'execute')::text, 'false'
END TEXT

REPLACE WITH:
BEGIN TEXT
has_function_privilege('anon', 'public.timer_start(text, uuid)', 'execute')::text, 'false'
END TEXT

**Edit 3** (the row that checks that a signed-in person can start: the two-argument timer_start)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
has_function_privilege('authenticated', 'public.timer_start(text)', 'execute')::text, 'true'
END TEXT

REPLACE WITH:
BEGIN TEXT
has_function_privilege('authenticated', 'public.timer_start(text, uuid)', 'execute')::text, 'true'
END TEXT

**Edit 4** (seven new check rows after pause_log_columns)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
or (table_name = 'timer_sessions' and column_name in ('pauses', 'tz'))))::text, '3';
END TEXT

REPLACE WITH:
BEGIN TEXT
or (table_name = 'timer_sessions' and column_name in ('pauses', 'tz'))))::text, '3'
union all
select 'tag_table_with_row_level_security', (select count(*) from pg_tables where schemaname = 'public' and tablename = 'timer_tags' and rowsecurity)::text, '1'
union all
select 'tag_id_columns', (select count(*) from information_schema.columns where table_schema = 'public' and column_name = 'tag_id' and table_name in ('timer_running', 'timer_sessions'))::text, '2'
union all
select 'tag_functions_exist', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('timer_tag_list', 'timer_tag_add', 'timer_tag_rename', 'timer_tag_archive'))::text, '4'
union all
select 'one_start_function', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'timer_start')::text, '1'
union all
select 'anonymous_cannot_add_tag', has_function_privilege('anon', 'public.timer_tag_add(text)', 'execute')::text, 'false'
union all
select 'signed_in_can_add_tag', has_function_privilege('authenticated', 'public.timer_tag_add(text)', 'execute')::text, 'true'
union all
select 'tag_name_unique_among_live_tags', (select count(*) from pg_indexes where schemaname = 'public' and tablename = 'timer_tags' and indexname = 'timer_tags_user_name_live_idx')::text, '1';
END TEXT

## EDITS OF THE CALLS (src/lib/timerApi.ts)

**Edit 1** (the list DATABASE_ERRORS: four new names)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  "NOT_SIGNED_IN",
] as const
END TEXT

REPLACE WITH:
BEGIN TEXT
  "NOT_SIGNED_IN",
  "BAD_TAG_NAME",
  "TAG_NAME_TAKEN",
  "TAG_LIMIT",
  "TAG_NOT_FOUND",
] as const
END TEXT

**Edit 2** (a new comment line under the comment about the day score (it names the four tag errors))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// The day score (supabase/day_score.sql): timerDayScore asks for the number, the word and the readouts of one day and readDayScore checks the answer (CONNECTIONS.md C29 and C54).
END TEXT

REPLACE WITH:
BEGIN TEXT
// The day score (supabase/day_score.sql): timerDayScore asks for the number, the word and the readouts of one day and readDayScore checks the answer (CONNECTIONS.md C29 and C54).
// The last four names of DATABASE_ERRORS come from the tag functions (supabase/timer_schema.sql, Packet 10A). Nothing in the app asks for a tag yet (CONNECTIONS.md C28 and C55).
END TEXT

## EDITS OF THE TESTS (src/lib/timerApi.test.ts)

**Edit 1** (the test of the list DATABASE_ERRORS: ten names)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
expect([...DATABASE_ERRORS]).toEqual(["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED", "BAD_TIMEZONE", "NOT_SIGNED_IN"])
END TEXT

REPLACE WITH:
BEGIN TEXT
expect([...DATABASE_ERRORS]).toEqual(["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED", "BAD_TIMEZONE", "NOT_SIGNED_IN", "BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"])
END TEXT

**Edit 2** (the list of function signatures that must be in the SQL file: timer_start with its second argument)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
"timer_start(p_tz text)"
END TEXT

REPLACE WITH:
BEGIN TEXT
"timer_start(p_tz text, p_tag_id uuid default null)"
END TEXT

**Edit 3** (the text of the insert in timer_end: tag_id is copied)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz)")
END TEXT

REPLACE WITH:
BEGIN TEXT
insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz, tag_id)")
END TEXT

## CODE_MAP EDITS (CODE_MAP.md)

**Edit 1** (row AB:TIMER.TESTS: what the tests cover (the session tags in the SQL file))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
its verify file), the reading of the day score
END TEXT

REPLACE WITH:
BEGIN TEXT
its verify file), the session tags in the SQL file (the tag table and the tag_id columns, the four tag functions and who may call them, the one timer_start, the tag copied at End, the rules of a name, the limit, archive and bring-back, nothing sent to the app, nothing in the day score, its verify file of 13 rows), the reading of the day score
END TEXT

**Edit 2** (row AB:TIMER.TESTS: the new test file in the list of files)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
`src/lib/dayScoreSql.test.ts` |
END TEXT

REPLACE WITH:
BEGIN TEXT
`src/lib/dayScoreSql.test.ts`, `src/lib/tagsSql.test.ts` |
END TEXT

**Edit 3** (row AB:TIMER.TESTS: the connections now name C55)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
C52, C53 and C54 |
END TEXT

REPLACE WITH:
BEGIN TEXT
C52, C53, C54 and C55 |
END TEXT

## CONNECTIONS EDITS (CONNECTIONS.md)

**Edit 1** (C28: the sentence that lists the error names (six become ten))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the SQL functions raise six names: ALREADY_RUNNING, NOT_RUNNING, NOT_PAUSED, DAY_ENDED, BAD_TIMEZONE and NOT_SIGNED_IN.
END TEXT

REPLACE WITH:
BEGIN TEXT
the SQL functions raise ten names: ALREADY_RUNNING, NOT_RUNNING, NOT_PAUSED, DAY_ENDED, BAD_TIMEZONE, NOT_SIGNED_IN and, from the tag functions (C55), BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT and TAG_NOT_FOUND (no screen asks for a tag yet, so useTimer shows these four as Something went wrong).
END TEXT

**Edit 2** (C28: four new Anchor lines after the anchor of NOT_SIGNED_IN)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_SIGNED_IN",`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_SIGNED_IN",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "BAD_TAG_NAME",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "TAG_NAME_TAKEN",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "TAG_LIMIT",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "TAG_NOT_FOUND",`
END TEXT

**Edit 3** (C29: the sentence about argument names (p_tag_id of timer_start))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
an argument name (p_tz, p_day),
END TEXT

REPLACE WITH:
BEGIN TEXT
an argument name (p_tz, p_day, and p_tag_id of timer_start, which the app does not send yet),
END TEXT

**Edit 4** (C29: the list of signatures (timer_start with its second argument))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
"timer_start(p_tz text)", "timer_pause()"
END TEXT

REPLACE WITH:
BEGIN TEXT
"timer_start(p_tz text, p_tag_id uuid default null)", "timer_pause()"
END TEXT

**Edit 5** (C53: the number of check rows of the verify file (6 become 13))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(6 check rows, the last one pause_log_columns must show 3)
END TEXT

REPLACE WITH:
BEGIN TEXT
(from Packet 10A the file has 13 check rows; the sixth, pause_log_columns, must show 3)
END TEXT

**Edit 6** (the new C55, placed before the heading Things to know)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Things to know (no check is possible)
END TEXT

REPLACE WITH:
BEGIN TEXT
### C55: The session tags: the SQL file, its verify file, its tests and the four error names are tied together
- Tags: `AB:TIMER.TESTS`, `AB:TIMER.API`
- If you change: a rule or a number of the tags (the 20 characters of a name, the limit of 10 live tags, the reserved name Freestyle, one live tag per name whatever the capitals, archive instead of delete, the newest archived tag of a name comes back, a rename shows in old sessions), the table timer_tags or the column tag_id (timer_running and timer_sessions), the second argument of timer_start, the lines of timer_end that copy the tag, the four tag functions in supabase/timer_schema.sql (timer_tag_list, timer_tag_add, timer_tag_rename, timer_tag_archive) or the four error names BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT and TAG_NOT_FOUND
- Then also: timer_start has ONE version, (p_tz text, p_tag_id uuid default null). The old version with one argument is dropped on purpose (two versions would make every start fail as not unique); a call with one argument still works and means Freestyle (no tag). timer_row_json must NOT send the tag until the type TimerRow, readTimerRow and the maths change in the same packet (C26, C29, C53). The four error names are in DATABASE_ERRORS (C28), although no screen and no call asks for a tag yet. A session saved before Packet 10A has NULL in tag_id (not known), exactly like a Freestyle session: the two cannot be told apart. The day score does not read the tag (C54). The owner has to run the changed supabase/timer_schema.sql and then supabase/timer_verify.sql in the Supabase SQL Editor (13 check rows, every row must show the same value in result and expect). The checker cannot read SQL: npm test reads the files (tagsSql.test.ts).
- If you forget: every start fails (two versions of timer_start), or a person can start under the tag of another person, or an archived tag is used, or the tag of a session is not saved and cannot be recovered for it later, or the app meets an error name it does not know (shown as Something went wrong).
- Anchor: `AB:TIMER.TESTS @ src/lib/tagsSql.test.ts = describe("the session tags in the SQL file (Packet 10A)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/tagsSql.test.ts = const TAG_ERRORS = ["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"]`
- Check by hand: after any change in supabase/timer_schema.sql run npm test, run the SQL in the Supabase SQL Editor, then supabase/timer_verify.sql: all 13 rows must show the same value in result and expect.

## Things to know (no check is possible)
END TEXT

## PROGRESS EDITS (PROGRESS.md)

**Edit 1** (the Done line of Packet 10A (put after the Packet 09C line) and the first line of Next)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
CODE_MAP.md and CONNECTIONS.md (C29 and C54) were brought up to date.

## Next
- Owner decides where the number and the word of the day are shown on the Pro Timer (a later packet). timerDayScore in src/lib/timerApi.ts is ready; nothing calls it yet.
END TEXT

REPLACE WITH:
BEGIN TEXT
CODE_MAP.md and CONNECTIONS.md (C29 and C54) were brought up to date.
- Packet 10A: session tags in the database (supabase/timer_schema.sql and supabase/timer_verify.sql; tests in src/lib/tagsSql.test.ts). A person has tags (names for sessions): table timer_tags, at most 10 live tags, a name of 1 to 20 characters, the name Freestyle is reserved, one live tag per name whatever the capitals, a tag is never deleted (Archive sets archived_at; adding the name of an archived tag brings the newest one back), a rename shows in old sessions. Four functions: timer_tag_list, timer_tag_add, timer_tag_rename, timer_tag_archive (signed-in people only; errors BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT, TAG_NOT_FOUND). timer_start got a second argument, the tag, which may be left out (Freestyle); the old one-argument version is dropped. timer_end saves the tag of the running session with the session (tag_id). Sessions saved before this packet have NULL in tag_id (not known, the same as Freestyle). The tag does not change the day score and is not sent to the app. The app only got the four error names in DATABASE_ERRORS; nothing asks for a tag yet and no screen changed. The SQL has to be run by the owner in the Supabase SQL Editor (timer_schema.sql, then timer_verify.sql: 13 rows). The choices of this packet are labelled DEFAULT in the packet for the owner to correct. CODE_MAP.md and CONNECTIONS.md (C28, C29, C53, new C55) were brought up to date.

## Next
- Owner decides where the number and the word of the day are shown: on the Overview screen, not on the Pro Timer (agreed in the tags talk of 2026-10-17). timerDayScore in src/lib/timerApi.ts is ready; nothing calls it yet. A week or a month on the Overview will need a way to ask for several days at once.
END TEXT

**Edit 2** (the line that starts with - Then: the Pro Timer tags)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Then: the Pro Timer tags (session categories; the right side of the wide layout is kept free for them) and the real Overview
END TEXT

REPLACE WITH:
BEGIN TEXT
- Then: the tag picker and the use of tags (the database part is Packet 10A; the right side of the wide layout is kept free for the picker; the owner first answers the open questions of the tags talk, for example tap to start or pick first, and says lock it) and the real Overview
END TEXT

## NEW TEST FILE: src/lib/tagsSql.test.ts
BEGIN FILE
import { describe, expect, it } from "vitest"
import dayScoreSql from "../../supabase/day_score.sql?raw"
import schemaSql from "../../supabase/timer_schema.sql?raw"
import verifySql from "../../supabase/timer_verify.sql?raw"
import { DATABASE_ERRORS } from "@/lib/timerApi"

// AB:TIMER.TESTS:START

// Tests of the session tags in the SQL files (Packet 10A). Run them with: npm test
// Like the tests of the pause log, these read the TEXT of the SQL files: npm test cannot run SQL.
// The behaviour itself (the limit, the names, the bring-back, who sees what) is checked by the owner with supabase/timer_verify.sql
// in the Supabase SQL Editor (13 rows), see CONNECTIONS.md C55. The rules are labelled DEFAULT in PACKET_10A: a number written here must match the SQL file.

const TAG_ERRORS = ["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"]

// [how the function is made, how it is named in the lines of revoke and grant]
const TAG_FUNCTIONS: [string, string][] = [
  ["timer_tag_list()", "timer_tag_list()"],
  ["timer_tag_add(p_name text)", "timer_tag_add(text)"],
  ["timer_tag_rename(p_id uuid, p_name text)", "timer_tag_rename(uuid, text)"],
  ["timer_tag_archive(p_id uuid)", "timer_tag_archive(uuid)"],
]

const NAME_CHECK = "if char_length(v_name) < 1 or char_length(v_name) > 20 or v_name ~ '[[:cntrl:]]' or lower(v_name) = 'freestyle' then"

function count(text: string, part: string): number {
  return text.split(part).length - 1
}

describe("the session tags in the SQL file (Packet 10A)", () => {
  it("makes the tag table: a name of 1 to 20 characters without spaces at the ends, Freestyle reserved, one live tag per name whatever the capitals", () => {
    expect(schemaSql).toContain("create table if not exists public.timer_tags (")
    expect(schemaSql).toContain("archived_at timestamptz,")
    expect(schemaSql).toContain(
      "constraint timer_tags_name_shape check (name = btrim(name) and char_length(name) between 1 and 20 and name !~ '[[:cntrl:]]' and lower(name) <> 'freestyle')",
    )
    expect(schemaSql).toContain("create unique index if not exists timer_tags_user_name_live_idx on public.timer_tags (user_id, lower(name)) where archived_at is null;")
  })

  it("adds tag_id to the running session and to the saved session, with no default (NULL is Freestyle or not known)", () => {
    const running = "alter table public.timer_running add column if not exists tag_id uuid references public.timer_tags (id);"
    const saved = "alter table public.timer_sessions add column if not exists tag_id uuid references public.timer_tags (id);"
    expect(schemaSql).toContain(running)
    expect(schemaSql).toContain(saved)
    expect(running).not.toContain("default")
    expect(saved).not.toContain("default")
  })

  it("turns row-level security on for the tags, lets a person only read their own, and gives nobody a direct write", () => {
    expect(schemaSql).toContain("alter table public.timer_tags enable row level security;")
    expect(schemaSql).toContain("create policy timer_tags_select_own on public.timer_tags\n  for select to authenticated using (user_id = (select auth.uid()));")
    expect(schemaSql).toContain("revoke all on public.timer_tags from public, anon, authenticated;")
    expect(schemaSql).toContain("grant select on public.timer_tags to authenticated;")
    expect(schemaSql).not.toMatch(/grant [^;]*(insert|update|delete)[^;]* on public\.timer_tags/)
    expect(schemaSql).not.toMatch(/create policy [a-z_]+ on public\.timer_tags\s+for (insert|update|delete|all)/)
  })

  it("has the four tag functions, and lets only signed-in people call them", () => {
    for (const [made, named] of TAG_FUNCTIONS) {
      expect(schemaSql).toContain("create or replace function public." + made)
      expect(schemaSql).toContain("revoke all on function public." + named + " from public, anon;")
      expect(schemaSql).toContain("grant execute on function public." + named + " to authenticated;")
    }
  })

  it("timer_start: one version only (the one-argument one is dropped), the tag must be the person's own and live, and it goes into the running row", () => {
    expect(schemaSql).toContain("drop function if exists public.timer_start(text);")
    expect(schemaSql).toContain("create or replace function public.timer_start(p_tz text, p_tag_id uuid default null)")
    expect(schemaSql).not.toContain("create or replace function public.timer_start(p_tz text)")
    expect(schemaSql).toContain("where id = p_tag_id and user_id = auth.uid() and archived_at is null")
    expect(schemaSql).toContain("insert into public.timer_running (user_id, tz, tag_id)")
    expect(schemaSql).toContain("values (auth.uid(), p_tz, p_tag_id)")
    expect(schemaSql).toContain("revoke all on function public.timer_start(text, uuid) from public, anon;")
    expect(schemaSql).toContain("grant execute on function public.timer_start(text, uuid) to authenticated;")
  })

  it("timer_end saves the tag of the running session with the session, and does not look at the tag again", () => {
    expect(schemaSql).toContain("insert into public.timer_sessions (user_id, day, started_at, ended_at, active_seconds, pauses, tz, tag_id)")
    expect(schemaSql).toContain("r.started_at, v_end, v_active, v_pauses, r.tz, r.tag_id)")
    const body = schemaSql.split("create or replace function public.timer_end()")[1].split("$$;")[0]
    expect(body).not.toContain("timer_tags")
  })

  it("does not send the tag to the app: timer_row_json keeps its six keys and the answer of timer_end has no new key", () => {
    const rowJson = schemaSql.split("create or replace function public.timer_row_json")[1].split("$$;")[0]
    expect(rowJson).not.toContain("tag")
    const end = schemaSql.split("create or replace function public.timer_end()")[1].split("$$;")[0]
    expect(end).not.toContain("'tag")
  })

  it("checks the name the same way in add and in rename: cut the spaces, 1 to 20 characters, no control character, Freestyle reserved", () => {
    expect(count(schemaSql, NAME_CHECK)).toBe(2)
    expect(count(schemaSql, "v_name := btrim(coalesce(p_name, ''));")).toBe(2)
    expect(count(schemaSql, "raise exception 'BAD_TAG_NAME';")).toBe(2)
  })

  it("allows at most 10 live tags in add (a rename needs no free place), and takes a lock per person in add and in rename", () => {
    expect(schemaSql).toContain("where user_id = auth.uid() and archived_at is null) >= 10 then")
    expect(count(schemaSql, "raise exception 'TAG_LIMIT';")).toBe(1)
    expect(count(schemaSql, "perform pg_advisory_xact_lock(hashtext('timer_tags:' || auth.uid()::text));")).toBe(2)
  })

  it("lets one person have one live tag of a name, whatever the capitals (add and rename), and a rename of a tag to its own name is not a clash", () => {
    expect(count(schemaSql, "archived_at is null and lower(name) = lower(v_name)")).toBe(2)
    expect(schemaSql).toContain("and lower(name) = lower(v_name) and id <> t.id)")
    expect(count(schemaSql, "raise exception 'TAG_NAME_TAKEN';")).toBe(2)
  })

  it("add brings back the newest archived tag of that name instead of making a second one", () => {
    expect(schemaSql).toContain("where user_id = auth.uid() and archived_at is not null and lower(name) = lower(v_name)")
    expect(schemaSql).toContain("order by archived_at desc, id desc")
    expect(schemaSql).toContain("update public.timer_tags set name = v_name, archived_at = null where id = t.id returning * into t;")
  })

  it("never deletes a tag: archive sets archived_at, a rename or an archive of an archived tag is TAG_NOT_FOUND", () => {
    expect(schemaSql).not.toMatch(/delete\s+from\s+public\.timer_tags/i)
    expect(schemaSql).toContain("update public.timer_tags set archived_at = now()")
    expect(schemaSql).toContain("where id = p_id and user_id = auth.uid() and archived_at is null")
    expect(count(schemaSql, "raise exception 'TAG_NOT_FOUND';")).toBe(3)
  })

  it("raises the four tag error names, and the list DATABASE_ERRORS of the app has them", () => {
    for (const name of TAG_ERRORS) {
      expect(schemaSql).toContain("raise exception '" + name + "';")
      expect(DATABASE_ERRORS).toContain(name)
    }
  })

  it("has a verify file of 13 rows that checks the tag parts and the two-argument timer_start", () => {
    expect(verifySql).toContain("Expected result: 13 rows")
    expect(verifySql.match(/^select '/gm)?.length).toBe(13)
    for (const name of [
      "tag_table_with_row_level_security",
      "tag_id_columns",
      "tag_functions_exist",
      "one_start_function",
      "anonymous_cannot_add_tag",
      "signed_in_can_add_tag",
      "tag_name_unique_among_live_tags",
    ]) {
      expect(verifySql).toContain("'" + name + "'")
    }
    expect(verifySql).toContain("'public.timer_start(text, uuid)'")
    expect(verifySql).not.toContain("'public.timer_start(text)'")
  })

  it("keeps the tag out of the day score, and tells the API layer to read the new functions", () => {
    expect(dayScoreSql).not.toContain("tag_id")
    expect(dayScoreSql).not.toContain("timer_tags")
    expect(schemaSql.trimEnd().endsWith("notify pgrst, 'reload schema';")).toBe(true)
  })
})
// AB:TIMER.TESTS:END
END FILE
