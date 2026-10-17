# PACKET 10C1: THE DATABASE TELLS THE APP THE TAG OF THE RUNNING SESSION (timer_row_json gets the key tag, TimerRow and readTimerRow learn it, DECISIONS_TAGS.md version 1.2 into the repository; no screen; Part 2 in Supabase)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_10C1_TAG_OF_RUNNING_SESSION.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: copy TWO files into your project folder `F:\ASHBORN` (from the folder `COPY_INTO_REPO` of the zip, keep the folders: drag the contents of `COPY_INTO_REPO` onto `F:\ASHBORN` and let Explorer merge): `DECISIONS_TAGS.md` goes into `F:\ASHBORN` itself (Explorer will say a file with that name is already there: choose REPLACE, it is the new version 1.2 of the file that Packet 10B put there), `PACKET_10C1_TAG_OF_RUNNING_SESSION.md` goes into `F:\ASHBORN\packets`. Then stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time; step 13 says what to do then.

Kind: build, with SQL. Written by the planner on 2026-10-17, after Packet 10B PASSED and after the owner said YES to "B" (the database tells the app the tag of the running session). Part 1 is done by the agent (nine files edited, a commit). Part 2 is done BY THE OWNER BY HAND in the Supabase dashboard (the agent cannot run SQL on Supabase). `DECISIONS_TAGS.md` version 1.2 is copied in by the owner (before) and checked by the agent.

## GOAL
Make the database send the tag of the running session, so that a later screen can always show it (after a reload, on another device). The database function `timer_row_json` gets one more key, `tag`: `null` when the session has no tag (Freestyle), otherwise `{id, name}` with the name the tag has now. `timer_start`, `timer_pause`, `timer_resume` and `timer_state` all use `timer_row_json`, so all four send it. In the app, the type `TimerRow` gets the optional key `tag` (the new type `RowTag`) and `readTimerRow` reads it. `supabase/timer_verify.sql` gets a 14th check row. `DECISIONS_TAGS.md` version 1.2 (rule 12 changed, the new order of the packets) enters the repository. Nothing uses the tag yet: no screen, no picker, no hook change, the maths never read it. The Pro Timer does exactly what it did.

## RULES FOR THE AGENT
- Edit ONLY these files: `supabase/timer_schema.sql`, `supabase/timer_verify.sql`, `src/lib/timerMaths.ts`, `src/lib/timerApi.ts`, `src/lib/timerApi.test.ts`, `src/lib/tagsSql.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do NOT create any file (the owner has copied in `DECISIONS_TAGS.md` and this packet; do not change them). Do not touch `supabase/day_score.sql`, `supabase/day_score_verify.sql`, any screen, any hook, `.env`, or anything else.
- Do not run any SQL. Decide nothing. Copy the texts exactly as written: do not rewrite, improve, reformat or rename anything. Keep the indentation of every line as written. Each text between BEGIN TEXT and END TEXT is the lines between those two lines, joined with line breaks, with no line break after the last line. Every FIND is ONE line. A REPLACE may have several lines; write them with the line breaks that the file you edit uses.
- Each FIND text must occur exactly once in its file at the moment you apply it (apply the edits of a file in the order written). If it does not, STOP and report which edit and the raw count.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply. No tag is added, renamed or deleted in this packet. The edits of `src/lib/timerMaths.ts` fall between `AB:TIMER.MATHS:START` and `AB:TIMER.MATHS:END`. The edits of `src/lib/timerApi.ts` fall between `AB:TIMER.API:START` and `AB:TIMER.API:END`. The edits of `src/lib/timerApi.test.ts` and `src/lib/tagsSql.test.ts` fall between `AB:TIMER.TESTS:START` and `AB:TIMER.TESTS:END`. The two SQL files and the three documents have no such tags.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `b19e5c8` (Packet 10B) or a later one, and the only changed files are two: ` M DECISIONS_TAGS.md` (modified: the owner replaced version 1.1 by version 1.2) and `?? packets/PACKET_10C1_TAG_OF_RUNNING_SESSION.md` (untracked). Any other changed file, or one of the two missing: STOP and report the raw output.
2. Check the decisions file. Run `(Get-FileHash -Algorithm SHA256 DECISIONS_TAGS.md).Hash`. Expected (capital or small letters do not matter): `A8343DC88CE681A752960E47BCEA4CD028920FDD52A3BA8919A6CC85803C6483`. If the hash differs, STOP and report the raw hash (the owner copied a wrong file and will copy it again).
3. Edit `supabase/timer_schema.sql` with the 2 edits of EDITS OF THE DATABASE FILE below.
4. Edit `supabase/timer_verify.sql` with the 2 edits of EDITS OF THE CHECK FILE below.
5. Edit `src/lib/timerMaths.ts` with the 2 edits of EDITS OF THE TYPE below.
6. Edit `src/lib/timerApi.ts` with the 3 edits of EDITS OF THE CALLS below.
7. Edit `src/lib/timerApi.test.ts` with the 1 edit of EDITS OF THE TESTS OF THE CALLS below.
8. Edit `src/lib/tagsSql.test.ts` with the 7 edits of EDITS OF THE TESTS OF THE SQL below.
9. Edit `CODE_MAP.md` with the 4 edits of CODE_MAP EDITS below.
10. Edit `CONNECTIONS.md` with the 9 edits of CONNECTIONS EDITS below.
11. Edit `PROGRESS.md` with the 2 edits of PROGRESS EDITS below.
12. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 36 tags, 72 places` and `CONNECTIONS OK: 55 connections, 466 anchors, 49 classes, 2 css variables, 2 label links`. (Before this packet they were 36 tags, 72 places, 55 connections and 463 anchors. No tag and no connection is new: 3 anchors are new, 1 in C26 and 2 in C55.) If any number differs, STOP and report the raw output.
13. Run `npm test`. Expected: `Test Files  22 passed (22)` and `Tests  1191 passed (1191)`. (Before this packet: 22 files and 1176 tests. The 15 new tests are all in `src/lib/timerApi.test.ts`; the tests of `src/lib/tagsSql.test.ts` changed but their number did not.) If a number differs, or a test fails, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond", say so in your report: the computer was too busy, and the owner will free it and tell you to run this step again. Do not change any file for it.
14. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
15. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
16. Stage by name only (never `git add .`): `git add supabase/timer_schema.sql supabase/timer_verify.sql src/lib/timerMaths.ts src/lib/timerApi.ts src/lib/timerApi.test.ts src/lib/tagsSql.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md DECISIONS_TAGS.md packets/PACKET_10C1_TAG_OF_RUNNING_SESSION.md`
17. Commit: `git commit -m "10C1: the database tells the app the tag of the running session (timer_row_json key tag, TimerRow and readTimerRow, 14th check row, DECISIONS_TAGS.md 1.2; SQL not yet run in Supabase; no screen)"`
18. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 5 lines, suggest nothing, start nothing)
`DONE 10C1` then: the two raw lines of step 12, the raw `Test Files` and `Tests` lines of step 13 (as one line), and `git log --oneline -1`.

## PART 2: OWNER BY HAND (Supabase dashboard)
Use the SAME Supabase project whose address is in your `.env`. You can do Part 2 before or after Part 1: the app from before this packet ignores the new key, and the app of this packet reads a missing key as "no tag", so both orders work. Only the function `timer_row_json` is replaced. Your tables, your tags, your saved sessions and a session that is running right now are not changed.
1. Supabase dashboard, left menu, SQL Editor, New query. Copy ALL of `supabase/timer_schema.sql` (the new version, after Part 1), paste it into the editor, press Run. Expected: "Success. No rows returned". It is safe to run again. If it shows a red error, send the full error text and do not run anything else.
2. New query. Copy ALL of `supabase/timer_verify.sql`, paste, Run. Expected: 14 rows, and in every row the `result` column equals the `expect` column. The expected values, in order: tables_exist 2, row_level_security_on 2, functions_exist 8, anonymous_can_start false, signed_in_can_start true, pause_log_columns 3, tag_table_with_row_level_security 1, tag_id_columns 2, tag_functions_exist 4, one_start_function 1, anonymous_cannot_add_tag false, signed_in_can_add_tag true, tag_name_unique_among_live_tags 1, row_json_sends_tag true. (The 14th row is the new one. If only that row shows `false`, step 1 did not run: do step 1 again.)
3. Recommended: New query, copy ALL of `supabase/day_score_verify.sql`, Run. Expected: 19 rows, every `result` equal to `expect` (the day score is not changed by this packet; this shows it still works).
4. Recommended, two minutes (after Part 1 and Part 2): start the app on your computer (`npm run dev`), open the Pro Timer, press Start, wait a few seconds, reload the page (the session must still be running), then end the session as always. It must work exactly as before. You will see no tag anywhere: the screen does not show it yet. This is the only check of the new database answer with the real app. Then stop `npm run dev`. If anything does not work, send the planner what you see at once.
5. Send the planner the agent's report (`DONE 10C1` and its lines) and the pasted table of the 14 rows. This packet PASSES only when the agent's report matches the expected lines AND all 14 rows match.

## WHAT THE NEW CODE DOES (for the owner and the later packets)
- `timer_row_json` (the one SQL function that builds a running session for the app) sends seven keys now: the six old ones (`started_at`, `tz`, `status`, `paused_at`, `paused_seconds`, `cap_at`) and `tag`. For Freestyle `tag` is a JSON `null`. For a session with a tag it is `{id, name}`: the name is read from the tag table at that moment, so a rename shows at once, and a tag that was archived during the session still shows (the session keeps it). The tag is read only if it belongs to the same person.
- The answer of `timer_end` does not change (no `tag` key). The day score does not change.
- `readTimerRow` (app) reads the key `tag`: missing or `null` means no tag and the row it gives back has NO key `tag` (so everything that compared rows before still works). A tag that is not `{id, name}` with an id that looks like an id and a name that is text and not empty is BAD_REPLY, as with the other calls. Only `id` and `name` are kept.
- `TimerRow` has the optional `tag?: RowTag`. The maths (`timerMaths.ts`) never use it.
- `timer_verify.sql` has a 14th row, `row_json_sends_tag`: it is `true` when the installed `timer_row_json` has the key `tag` in it. It shows that step 1 of Part 2 was run.
- `DECISIONS_TAGS.md` is version 1.2: rule 12 now says the database sends the tag; the order of the next packets is 10C1 (this one), 10C2 (the picker), 10D (adding a tag), 10E (renaming and removing a tag); two DEFAULT lines of section 4 say where the pill sits (above Start, 44 pixels tall) and what shows while a session runs (one small line inside the dial under the day total, nothing for Freestyle). No other rule changed.

## WHAT THE PLANNER HAD TO DECIDE (read them and say which are wrong; all are DEFAULT, except what the owner decided: B)
DECIDED by the owner on 2026-10-17: B, the database sends the tag of the running session (so the screen can always show it). Everything below is the planner's DEFAULT:
1. The key is called `tag`. It is `null` for no tag and `{id, name}` otherwise (not the bare id, not a name only): the screen needs no second lookup.
2. The name is read from the tag table when the answer is made, not copied at Start. So a rename shows in the running session at once, the same as in the saved sessions (rule 6 of `DECISIONS_TAGS.md`), and an archived tag still shows (rule 11).
3. The tag is read only where `t.user_id = r.user_id`. See THINGS TO KNOW: for three of the four calls this check is the only thing that keeps someone else's tag out.
4. `TimerRow` gets an OPTIONAL key: no tag means no key (not `tag: null`). Reason: every test and every piece of code that builds or compares a row keeps working without a change, and the maths cannot be confused by it.
5. `readTimerRow`: a missing key and `null` both mean no tag, so an app that is newer than the database keeps working (Part 2 can come after Part 1). Anything else that is not a valid tag is BAD_REPLY, so a broken answer never reaches a screen as a tag.
6. A new check row (the 14th) tests the text of the installed function for the key `tag`. It proves that the new function is installed. It does not prove that it behaves right (the planner's SQL behaviour test does; it is not in the repository).
7. `DECISIONS_TAGS.md` version 1.2 goes into the repository by the same way as in 10B (the owner copies it, the agent checks the SHA-256). The hash from 10B (`0AC18CF8...`) is no longer the right one.
8. Not done here (later packets): any screen, the picker, the small line in the dial, `useTimer` using the tag, the Manage tags view.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED on a clean clone of master at `b19e5c8` (the edits applied, then `npm ci`):
  - LF, and a copy with every text file except the css in CRLF (new lines written with LF, and with CRLF; the css files stay LF in this test: the css tests of `LineText` and `TimerScreen` fail on the UNCHANGED project when `src/timer.css` has CRLF, with or without this packet; your 10A and 10B runs passed them, so your css is not CRLF): `node scripts/check-tags.mjs` printed the two lines of step 12, `npm test` printed 22 files and 1191 tests, `npm run build` built, `npx tsc -b` exit 0, `npx oxlint` 0 errors and 19 warnings (the same 19 as before).
  - The packet applied by a script that reads ONLY THIS FILE gives, on LF, exactly the same files as the direct edits (`diff -r`: identical), and on both CRLF ways the same files apart from the line ends. The checks above were run on these copies that were made from the packet text.
  - 18 deliberate breaks of the app side (the reading of the tag, the type, the SQL text, the check file, the anchors, the decisions file), one at a time: all 18 are noticed by `check-tags` (3), `npm test` (14) or `tsc` (1).
  - The SQL on a real Postgres 16 (with stand-ins for the roles and for `auth.uid()`): the database that is live now (master `b19e5c8`), with three running sessions (a tag, a tag archived later, no tag), becomes the new one by running `timer_schema.sql` twice, no error. Before the migration the new check file shows 13 rows OK and ONE mismatch (`row_json_sends_tag`), after it 14 of 14. The OLD check file (13 rows) still gives 13 of 13 on the new database. `day_score_verify.sql` 19 of 19. The same on an empty database. A behaviour test passed on both: start, state, pause and resume send `{id, name}`; a rename shows at once; an archived tag still shows; `timer_end` has no key `tag`; Freestyle gives a JSON null; another person's tag is NEVER shown (also through pause and resume). The 10A behaviour test (tags, limits, rename, archive, privacy) passed too, with its two lines about the key `tag` changed to the new contract.
  - 8 deliberate breaks of the SQL (key renamed, no check of the person, archived tag hidden, only the id sent, nulls stripped from the row, the key removed, a key `tag` in the answer of `timer_end`, any tag of the person): all 8 are noticed by the behaviour test; a check row weakened to `>= 0` would NOT be noticed by the database, only by the text test of the check file.
- NOT TESTED: a call from the app to the real Supabase (Part 2 step 4 is that test, by you); more than two devices at once; the phone (there is no screen in this packet). The text of the SQL is read by `npm test` but not run there: the run is Part 2.

## THINGS TO KNOW (no check is possible)
- Who protects a tag from another person: `timer_state` is NOT `security definer`, so row level security already hides someone else's tag from it. `timer_start`, `timer_pause` and `timer_resume` ARE `security definer` (they run as the owner of the function and row level security does not apply), so there only the check `t.user_id = r.user_id` inside `timer_row_json` keeps someone else's tag out. Keep that check. A test of `tagsSql.test.ts` reads the line, and the planner's behaviour test checks it through pause and resume.
- If you change anything about the key `tag`, change together: the SQL line of `timer_row_json`, `readRowTag` in `timerApi.ts`, the type `RowTag` in `timerMaths.ts`, the check row `row_json_sends_tag`, the tests and C55 of `CONNECTIONS.md` (it says so).
- `DECISIONS_DAY_SCORE.md` section 4a ("an old session is one stretch") contradicts its section 2 ("an old session counts at full credit"); the database follows section 2. Not changed here (an open item).
- `supabase/day_score.sql` line 15 still says the tag is "not built yet". Not changed here.
- Four SQL breaks of 10A (rename of an archived tag, archive of someone else's tag, the list showing archived tags, the list order) are caught only by the planner's SQL behaviour test, which is not in the repository.

## EDITS OF THE DATABASE FILE (supabase/timer_schema.sql)

**Edit 1** (the comment of the helper: it now says the row has a tag key)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- 5. Helper: one running row as JSON.
END TEXT

REPLACE WITH:
BEGIN TEXT
-- 5. Helper: one running row as JSON: the six fields of the session and, since Packet 10C1, the key tag: null for Freestyle (no tag), otherwise {id, name} of the tag of the session with the name it has now (also when the tag was archived or renamed during the session).
END TEXT

**Edit 2** (timer_row_json: the last key gets a comma and the new key tag is added)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    'cap_at', public.timer_cap_at(r.started_at, r.tz)
END TEXT

REPLACE WITH:
BEGIN TEXT
    'cap_at', public.timer_cap_at(r.started_at, r.tz),
    'tag', (select jsonb_build_object('id', t.id, 'name', t.name) from public.timer_tags t where t.id = r.tag_id and t.user_id = r.user_id)
END TEXT

## EDITS OF THE CHECK FILE (supabase/timer_verify.sql)

**Edit 1** (the header says 14 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- Expected result: 13 rows, exactly as the "expect" column says.
END TEXT

REPLACE WITH:
BEGIN TEXT
-- Expected result: 14 rows, exactly as the "expect" column says.
END TEXT

**Edit 2** (the last row loses its semicolon and a 14th row follows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
and indexname = 'timer_tags_user_name_live_idx')::text, '1';
END TEXT

REPLACE WITH:
BEGIN TEXT
and indexname = 'timer_tags_user_name_live_idx')::text, '1'
union all
select 'row_json_sends_tag', (position('''tag''' in pg_get_functiondef('public.timer_row_json(public.timer_running)'::regprocedure)) > 0)::text, 'true';
END TEXT

## EDITS OF THE TYPE (src/lib/timerMaths.ts)

**Edit 1** (the type RowTag and a longer comment on TimerRow)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// One running session, exactly as the database function timer_state sends it (see C26).
END TEXT

REPLACE WITH:
BEGIN TEXT
// The tag of a running session as timer_row_json sends it: its id and the name it has now (Packet 10C1, see C26 and C55).
export type RowTag = { id: string; name: string }

// One running session, exactly as the database function timer_state sends it (see C26). The key tag is only there when the session has a tag: no key means Freestyle (no tag). The maths never use it.
END TEXT

**Edit 2** (TimerRow gets the optional key tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  cap_at: string
END TEXT

REPLACE WITH:
BEGIN TEXT
  cap_at: string
  tag?: RowTag
END TEXT

## EDITS OF THE CALLS (src/lib/timerApi.ts)

**Edit 1** (the comment of readTimerRow says what the tag key is)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// One running session as timer_row_json sends it (the fields are the type TimerRow in timerMaths.ts, see C26).
END TEXT

REPLACE WITH:
BEGIN TEXT
// One running session as timer_row_json sends it (the fields are the type TimerRow in timerMaths.ts, see C26). The key tag is null or missing for no tag and otherwise {id, name} (Packet 10C1, see C55); the row that is given back has the key tag only when there is a tag.
END TEXT

**Edit 2** (readTimerRow reads the tag and gives it back only when there is one)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  return { started_at: startedAt, tz, status, paused_at: pausedAt, paused_seconds: pausedSeconds, cap_at: capAt }
END TEXT

REPLACE WITH:
BEGIN TEXT
  const tag = readRowTag(value.tag)
  const row: TimerRow = { started_at: startedAt, tz, status, paused_at: pausedAt, paused_seconds: pausedSeconds, cap_at: capAt }
  return tag === null ? row : { ...row, tag }
END TEXT

**Edit 3** (readRowTag, placed before the heading of the calls)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// ---- The calls ----
END TEXT

REPLACE WITH:
BEGIN TEXT
// The key tag of a running session (Packet 10C1): null, or no key at all (as the database sent it before Packet 10C1), means no tag. Anything else must be a tag {id, name} as readTag reads it (an id that looks like an id, a name that is text and not empty), or the answer is BAD_REPLY. It gives null for no tag.
function readRowTag(value: unknown): TimerTag | null {
  if (value === undefined || value === null) return null
  return readTag(value)
}

// ---- The calls ----
END TEXT

## EDITS OF THE TESTS OF THE CALLS (src/lib/timerApi.test.ts)

**Edit 1** (a new describe for the tag of the running session, placed before the pause log tests)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
describe("the pause log in the SQL file (Packet 09A)", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
describe("the tag of the running session (Packet 10C1)", () => {
  it("reads a running session and a paused session that have a tag, and keeps the tag as {id, name}", () => {
    expect(readTimerRow({ ...RUNNING, tag: TAG_A })).toEqual({ ...RUNNING, tag: TAG_A })
    expect(readTimerRow({ ...PAUSED, tag: TAG_B })).toEqual({ ...PAUSED, tag: TAG_B })
  })

  it("gives no key tag for a session without a tag: the key is null (Freestyle) or missing (a database from before Packet 10C1)", () => {
    expect(readTimerRow({ ...RUNNING, tag: null })).toEqual(RUNNING)
    expect(Object.keys(readTimerRow({ ...RUNNING, tag: null }))).toHaveLength(6)
    expect(Object.keys(readTimerRow(RUNNING))).toHaveLength(6)
  })

  it("keeps only the id and the name of the tag", () => {
    const row = readTimerRow({ ...RUNNING, tag: { ...TAG_A, extra: 1, archived_at: null } })
    expect(Object.keys(row.tag ?? {}).sort()).toEqual(["id", "name"])
  })

  it.each([
    ["a text", "Python"],
    ["a number", 5],
    ["a list", []],
    ["true", true],
    ["an empty object", {}],
    ["an id that is not an id", { id: "nope", name: "Python" }],
    ["no id", { name: "Python" }],
    ["an empty name", { id: TAG_A.id, name: "" }],
    ["a name that is not text", { id: TAG_A.id, name: 7 }],
    ["no name", { id: TAG_A.id }],
  ])("a tag with a problem is BAD_REPLY: %s", (_name, tag) => {
    expect(kindOf(() => readTimerRow({ ...RUNNING, tag }))).toBe("BAD_REPLY")
  })

  it("the answer of the state and the answer of start, pause or resume keep the tag of their session", () => {
    const withTag = { ...RUNNING, tag: TAG_A }
    expect(readStateReply({ server_now: SERVER_NOW, running: withTag }).row).toEqual(withTag)
    expect(readRunningReply({ server_now: SERVER_NOW, running: withTag }).row).toEqual(withTag)
  })

  it("the SQL file sends the tag as {id, name} read from timer_tags of the same person, and null when there is none", () => {
    const body = schemaSql.split("create or replace function public.timer_row_json")[1].split("$$;")[0]
    expect(body).toContain("'tag', (select jsonb_build_object('id', t.id, 'name', t.name) from public.timer_tags t where t.id = r.tag_id and t.user_id = r.user_id)")
    for (const key of Object.keys(RUNNING)) expect(body).toContain("'" + key + "'")
  })
})

describe("the pause log in the SQL file (Packet 09A)", () => {
END TEXT

## EDITS OF THE TESTS OF THE SQL (src/lib/tagsSql.test.ts)

**Edit 1** (the comment says 14 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// in the Supabase SQL Editor (13 rows), see CONNECTIONS.md C55. The rules are labelled DEFAULT in PACKET_10A: a number written here must match the SQL file.
END TEXT

REPLACE WITH:
BEGIN TEXT
// in the Supabase SQL Editor (14 rows), see CONNECTIONS.md C55. The rules are labelled DEFAULT in PACKET_10A: a number written here must match the SQL file.
END TEXT

**Edit 2** (the title of the test that said the tag is not sent to the app)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("does not send the tag to the app: timer_row_json keeps its six keys and the answer of timer_end has no new key", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("sends the tag of the running session to the app in timer_row_json (Packet 10C1), and the answer of timer_end has no new key", () => {
END TEXT

**Edit 3** (the expectation about timer_row_json: the tag key is there, in one place, and no tag_id key is sent)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(rowJson).not.toContain("tag")
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(rowJson).toContain("'tag', (select jsonb_build_object('id', t.id, 'name', t.name) from public.timer_tags t where t.id = r.tag_id and t.user_id = r.user_id)")
    expect(rowJson.split("'tag'")).toHaveLength(2)
    expect(rowJson).not.toContain("'tag_id'")
END TEXT

**Edit 4** (the title of the verify file test)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("has a verify file of 13 rows that checks the tag parts and the two-argument timer_start", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("has a verify file of 14 rows that checks the tag parts, the two-argument timer_start and the tag key of timer_row_json", () => {
END TEXT

**Edit 5** (the header of the verify file says 14 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(verifySql).toContain("Expected result: 13 rows")
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(verifySql).toContain("Expected result: 14 rows")
END TEXT

**Edit 6** (the verify file has 14 select rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(verifySql.match(/^select '/gm)?.length).toBe(13)
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(verifySql.match(/^select '/gm)?.length).toBe(14)
END TEXT

**Edit 7** (the new check row is in the list of names)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
      "tag_name_unique_among_live_tags",
END TEXT

REPLACE WITH:
BEGIN TEXT
      "tag_name_unique_among_live_tags",
      "row_json_sends_tag",
END TEXT

## CODE_MAP EDITS (CODE_MAP.md)

**Edit 1** (the row of AB:TIMER.MATHS: TimerRow holds the optional tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Pure functions: no screen and no database call
END TEXT

REPLACE WITH:
BEGIN TEXT
Pure functions: no screen and no database call. The type TimerRow also holds the optional tag of the session (Packet 10C1); the maths never use it
END TEXT

**Edit 2** (the row of AB:TIMER.API: the reading of a running session holds its tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
to the four tag functions (the list, add, rename and archive of the person's tags; Start can send the tag)
END TEXT

REPLACE WITH:
BEGIN TEXT
to the four tag functions (the list, add, rename and archive of the person's tags; Start can send the tag; the reading of a running session holds its tag when it has one)
END TEXT

**Edit 3** (the row of AB:TIMER.TESTS: the verify file has 14 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
its verify file of 13 rows)
END TEXT

REPLACE WITH:
BEGIN TEXT
its verify file of 14 rows, the tag key of timer_row_json)
END TEXT

**Edit 4** (the row of AB:TIMER.TESTS: the tests of the tag of the running session)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the plain words of the four tag errors, the two decisions files in the repository)
END TEXT

REPLACE WITH:
BEGIN TEXT
the plain words of the four tag errors, the two decisions files in the repository, the tag of the running session in its reading and in the SQL file)
END TEXT

## CONNECTIONS EDITS (CONNECTIONS.md)

**Edit 1** (C26: the fields of TimerRow)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
The fields of TimerRow are the keys that timer_row_json sends: started_at, tz, status, paused_at, paused_seconds, cap_at.
END TEXT

REPLACE WITH:
BEGIN TEXT
The fields of TimerRow are the keys that timer_row_json sends: started_at, tz, status, paused_at, paused_seconds, cap_at, and the optional tag (the SQL sends null for no tag and the row then has no key tag; Packet 10C1, see C55).
END TEXT

**Edit 2** (C26: a second anchor, the type RowTag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = cap_at: string`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = cap_at: string`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export type RowTag = { id: string; name: string }`
END TEXT

**Edit 3** (C29: the answer keys that the app reads include the tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
and the six fields of a running session), or a key
END TEXT

REPLACE WITH:
BEGIN TEXT
and the six fields of a running session and its tag), or a key
END TEXT

**Edit 4** (C29: the type TimerRow holds the tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
The six fields of a running session are the type TimerRow in timerMaths.ts (see C26).
END TEXT

REPLACE WITH:
BEGIN TEXT
The six fields of a running session, and its tag when it has one, are the type TimerRow in timerMaths.ts (see C26 and C55).
END TEXT

**Edit 5** (C55: the tag key of timer_row_json is in the list of things to change together)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the plain words of the four errors in problemText, or the two decisions files in the repository root
END TEXT

REPLACE WITH:
BEGIN TEXT
the plain words of the four errors in problemText, the tag key of timer_row_json (its SQL line, readRowTag in timerApi.ts, the type RowTag in timerMaths.ts, the check row row_json_sends_tag), or the two decisions files in the repository root
END TEXT

**Edit 6** (C55: timer_row_json now sends the tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
timer_row_json must NOT send the tag until the type TimerRow, readTimerRow and the maths change in the same packet (C26, C29, C53).
END TEXT

REPLACE WITH:
BEGIN TEXT
timer_row_json sends the tag of the running session as its key tag (Packet 10C1): null when there is none, otherwise {id, name} with the name the tag has now, read from timer_tags of the same person (also when the tag was archived or renamed during the session). The type TimerRow (the optional key tag, RowTag in timerMaths.ts), readTimerRow and readRowTag in timerApi.ts, the SQL line of timer_row_json, the check row row_json_sends_tag of timer_verify.sql and the tests change together (C26, C29, C53). The maths never use the tag. readTimerRow reads a missing tag key as no tag, so an app that is newer than the database keeps working. The day score and the answer of timer_end do not send or read the tag in this way.
END TEXT

**Edit 7** (C55: the verify file has 14 rows (text of Then also))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
in the Supabase SQL Editor (13 check rows, every row must show the same value in result and expect).
END TEXT

REPLACE WITH:
BEGIN TEXT
in the Supabase SQL Editor (14 check rows, every row must show the same value in result and expect).
END TEXT

**Edit 8** (C55: more anchors after the last one)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the decisions files are in the repository (Packet 10B)", () => {`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the decisions files are in the repository (Packet 10B)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the tag of the running session (Packet 10C1)", () => {`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = function readRowTag(value: unknown): TimerTag | null {`
END TEXT

**Edit 9** (C55: the check by hand says 14 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
then supabase/timer_verify.sql: all 13 rows must show the same value in result and expect.
END TEXT

REPLACE WITH:
BEGIN TEXT
then supabase/timer_verify.sql: all 14 rows must show the same value in result and expect.
END TEXT

## PROGRESS EDITS (PROGRESS.md)

**Edit 1** (the Done line of Packet 10C1, placed before the heading Next)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Next
END TEXT

REPLACE WITH:
BEGIN TEXT
- Packet 10C1: the database tells the app the tag of the running session (supabase/timer_schema.sql, supabase/timer_verify.sql, src/lib/timerMaths.ts, src/lib/timerApi.ts; tests in timerApi.test.ts and tagsSql.test.ts). timer_row_json sends one more key, tag: null for no tag (Freestyle), otherwise {id, name} with the name the tag has now (read from timer_tags, also when the tag was archived or renamed during the session). The type TimerRow got the optional key tag (the type RowTag), readTimerRow reads it (a missing key or null means no tag, anything that is not a tag {id, name} is BAD_REPLY) and gives the key back only when there is a tag. The maths and the hook do not use it yet and no screen shows it (the picker and the line with the tag come in Packet 10C2). timer_verify.sql has 14 rows now. The SQL has to be run by the owner in the Supabase SQL Editor (timer_schema.sql, then timer_verify.sql: 14 rows). DECISIONS_TAGS.md is version 1.2 (rule 12 and the order of the next packets). The choices of this packet are labelled DEFAULT in the packet for the owner to correct. CODE_MAP.md and CONNECTIONS.md (C26, C29, C55) were brought up to date.

## Next
END TEXT

**Edit 2** (the Next list: the new order of the tag packets)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Then: the tags, as locked in DECISIONS_TAGS.md (order agreed by the owner on 2026-10-17): Packet 10C the picker on the Pro Timer (chips on a wide screen, a pill and a slide-up list on a phone; the tag goes with Start and the choice is back to No tag after every session), Packet 10D the Manage tags view (add, rename, remove, with the plain error words). After the tags: the real Overview (time per tag, the day score), Calendar and Guide screens, which are placeholders today. The order after the tags is not decided yet.
END TEXT

REPLACE WITH:
BEGIN TEXT
- Then: the tags, as locked in DECISIONS_TAGS.md (order agreed by the owner on 2026-10-17, changed on the same day): Packet 10C2 the picker on the Pro Timer (a pill above Start and a slide-up list on a phone, chips on a wide screen, the tag goes with Start and the choice is back to No tag after every session, the tag of a running session shows as a small line in the dial), Packet 10D adding a tag, Packet 10E renaming and removing a tag (all with the plain error words). After the tags: the real Overview (time per tag, the day score), Calendar and Guide screens, which are placeholders today. The order after the tags is not decided yet.
END TEXT
