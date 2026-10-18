# PACKET 10E: THE DATABASE COUNTS HOW MUCH EACH TAG IS USED (a new function timer_tag_use, four new check rows, timerTagUse, readTagUse and orderTagsByUse in the app, DECISIONS_TAGS.md version 1.3 into the repository; no screen; Part 2 in Supabase)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_10E_TAG_USE.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: copy TWO files into your project folder `F:\ASHBORN` (from the folder `COPY_INTO_REPO` of the zip: drag the contents of `COPY_INTO_REPO` onto `F:\ASHBORN` and let Explorer merge): `DECISIONS_TAGS.md` goes into `F:\ASHBORN` itself (Explorer will say a file with that name is already there: choose REPLACE, it is the new version 1.3 of the file that Packets 10B and 10C1 put there), `PACKET_10E_TAG_USE.md` goes into `F:\ASHBORN\packets`. Then stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time; step 13 says what the agent does then, so you do not have to. If the agent stops half-way (for example its quota is used up), the section IF THE AGENT STOPS HALF-WAY below says what to tell it in a NEW conversation.

Kind: build, with SQL, no screen. Written by the planner on 2026-10-18, after Packet 10D PASSED and after the owner described the tag picker version 2 (`DECISIONS_TAGS.md` section 4b). Part 1 is done by the agent (eight files edited, a commit). Part 2 is done BY THE OWNER BY HAND in the Supabase dashboard (the agent cannot run SQL on Supabase). `DECISIONS_TAGS.md` version 1.3 is copied in by the owner (before) and checked by the agent.

## GOAL
Let the database count how much each tag is used, so that the picker of the next packet (10F) can show the four tags the owner uses most. A NEW database function `timer_tag_use()` answers, for every live tag of the person, how many seconds of SAVED sessions with that tag ended in the last 30 days (0 for a tag that was not used), oldest tag first. In the app, `timerApi.ts` gets the type `TagUse`, the reader `readTagUse` (it checks the answer like every other answer), the call `timerTagUse()` and a plain function `orderTagsByUse(tags, use)` that puts the tags in the order of their use. `supabase/timer_verify.sql` gets four new check rows (18 rows in all). `DECISIONS_TAGS.md` version 1.3 (the picker version 2, section 4b, and the new order of the packets: 10E this one, 10F the picker, 10G renaming and removing) enters the repository. Nothing uses the new calls yet: no screen, no picker, no hook change. The Pro Timer does exactly what it did.

## RULES FOR THE AGENT
- Edit ONLY these files: `supabase/timer_schema.sql`, `supabase/timer_verify.sql`, `src/lib/timerApi.ts`, `src/lib/timerApi.test.ts`, `src/lib/tagsSql.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do NOT create any file (the owner has copied in `DECISIONS_TAGS.md` and this packet; do not change them). Do not touch `supabase/day_score.sql`, `supabase/day_score_verify.sql`, `src/lib/timerMaths.ts`, `src/lib/useTimer.ts`, any screen, `.env`, or anything else. Do not install anything.
- Do not run any SQL. Decide nothing. Copy the texts exactly as written: do not rewrite, improve, reformat or rename anything. Keep the indentation of every line as written. Each text between BEGIN TEXT and END TEXT is the lines between those two lines, joined with line breaks, with no line break after the last line. Every FIND is ONE line. A REPLACE may have several lines; write them with the line breaks that the file you edit uses.
- Use as few tool calls as you can: for each file you may read it once, make ALL its replacements in memory in the order written, and write it once (a short script is fine). The result must be the same as doing the edits one at a time, and the line ends of the file stay as they are.
- Each FIND text must occur exactly once in its file at the moment you apply it (apply the edits of a file in the order written). If it does not, STOP and report which edit and the raw count.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply. This packet writes NO new tag name and creates NO new place for a tag: it only adds text inside the places that already exist. You do not invent, rename or delete any tag. The edits of `src/lib/timerApi.ts` fall between `AB:TIMER.API:START` and `AB:TIMER.API:END`. The edits of `src/lib/timerApi.test.ts` and `src/lib/tagsSql.test.ts` fall between `AB:TIMER.TESTS:START` and `AB:TIMER.TESTS:END` (apart from the import lines at the top of `timerApi.test.ts`). The two SQL files and the three documents have no such tags.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `938c470` (Packet 10D), and the status shows ` M DECISIONS_TAGS.md` (modified, not staged: the owner replaced version 1.2 by version 1.3) and `?? packets/PACKET_10E_TAG_USE.md` (this packet, untracked). **ANY OTHER UNTRACKED file (a line that starts with `??`, for example old zips, patches or notes in `packets/`) is FINE: do not stop for it, do not touch it, never stage it.** STOP and report the raw output ONLY if: the newest commit is another one (the planner tested this packet on `938c470` only), or the two lines above are not both there, or ANY file other than `DECISIONS_TAGS.md` is modified, staged (a letter in the FIRST column, such as `M ` or `A `) or deleted.
2. Check the decisions file. Run `(Get-FileHash -Algorithm SHA256 DECISIONS_TAGS.md).Hash`. Expected (capital or small letters do not matter): `1C876FF78024E03DBB535FD0F31AABB18AB21BBC7C9E2AFDF28D3C6123F39931`. If the hash differs, STOP and report the raw hash (the owner copied a wrong file and will copy it again).
3. Edit `supabase/timer_schema.sql` with the 4 edits of EDITS OF THE DATABASE FILE below.
4. Edit `supabase/timer_verify.sql` with the 2 edits of EDITS OF THE CHECK FILE below.
5. Edit `src/lib/timerApi.ts` with the 4 edits of EDITS OF THE CALLS below.
6. Edit `src/lib/timerApi.test.ts` with the 6 edits of EDITS OF THE TESTS OF THE CALLS below.
7. Edit `src/lib/tagsSql.test.ts` with the 7 edits of EDITS OF THE TESTS OF THE SQL below.
8. Edit `CODE_MAP.md` with the 6 edits of CODE_MAP EDITS below.
9. Edit `CONNECTIONS.md` with the 4 edits of CONNECTIONS EDITS below.
10. Edit `PROGRESS.md` with the 3 edits of PROGRESS EDITS below.
11. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 37 tags, 77 places` and `CONNECTIONS OK: 58 connections, 492 anchors, 75 classes, 2 css variables, 2 label links`. (Before this packet they were 37 tags, 77 places, 57 connections, 486 anchors and 75 classes: no new tag, no new place, one new connection C58 and 6 new anchors.) If any number differs, STOP and report the raw output.
12. Run `npx tsc -b` and then `$LASTEXITCODE`. Expected: no output from `tsc` and `0`. If not, STOP and report the raw output.
13. Run `npm test`. Expected: `Test Files  24 passed (24)` and `Tests  1372 passed (1372)`. (Before this packet: 24 files and 1356 tests. The 16 new tests are 13 in `src/lib/timerApi.test.ts` and 3 in `src/lib/tagsSql.test.ts`.) If a number differs, or a test fails for any reason other than a timeout, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond" (the computer is busy; this happened in Packet 10C2), do NOT change any file and do NOT stop: run `npm test -- --testTimeout=30000 --maxWorkers=4` ONCE. It runs the same tests with the same checks; only the time limit of one test and the number of parallel workers change. If it prints the expected numbers, go on, and say in your report which of the two commands printed them. If it also fails, STOP and report the raw output of both runs.
14. Run `npm run lint -- --format=default`. Expected: the output has the line `Found 19 warnings and 0 errors.` (the same 19 warnings as before this packet), followed by a line that starts with `Finished in` (its numbers differ from computer to computer; ignore them). The option `--format=default` is there on purpose: without it some agent terminals make the linter print a short format with no `Found` line. If the `Found` line says another number, STOP and report the raw output.
15. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
16. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
17. Stage by name only (never `git add .`): `git add supabase/timer_schema.sql supabase/timer_verify.sql src/lib/timerApi.ts src/lib/timerApi.test.ts src/lib/tagsSql.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md DECISIONS_TAGS.md packets/PACKET_10E_TAG_USE.md`
18. Commit: `git commit -m "10E: the database counts how much each tag is used (timer_tag_use in supabase/timer_schema.sql, four check rows, timerTagUse, readTagUse and orderTagsByUse, DECISIONS_TAGS.md 1.3; SQL not yet run in Supabase; no screen)"`
19. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 6 lines, suggest nothing, start nothing)
`DONE 10E` then: the two raw lines of step 11, the raw `Test Files` and `Tests` lines of step 13 (as one line) and which command printed them, the raw `Found` line of step 14, and `git log --oneline -1`.

## IF THE AGENT STOPS HALF-WAY (a used-up quota, a crash, a closed window)
Nothing is committed before step 18, so a stop before it leaves only changed files. In a NEW conversation the owner pastes: `Read packets/PACKET_10E_TAG_USE.md, the section IF THE AGENT STOPS HALF-WAY, and do exactly what it says.` Then the agent does this, and NOTHING else first:
1. Run `git log --oneline -3`, `git status --short` and `git diff --numstat`. Do NOT repeat steps 1 to 10 and do not apply any edit again (an edit applied twice breaks the file).
2. If the newest commit already starts with `10E:`, steps 1 to 18 are done: run `git status --short` and `git log origin/master --oneline -1`; if the commit is not on origin yet, do step 19 (`git push`) only, and report. If it is on origin, report that it was already pushed.
3. If there is no `10E:` commit, compare with this table (the state after step 10). The numbers are for files with LF line ends; on Windows they can differ by a few lines, so a small difference is NOT a reason to stop. ` M` on 9 files: `DECISIONS_TAGS.md` (+29 -2), `supabase/timer_schema.sql` (+23 -1), `supabase/timer_verify.sql` (+10 -2), `src/lib/timerApi.ts` (+38 -2), `src/lib/timerApi.test.ts` (+156 -2), `src/lib/tagsSql.test.ts` (+45 -4), `CODE_MAP.md` (+3 -3), `CONNECTIONS.md` (+16 -3), `PROGRESS.md` (+4 -2); and `??` for this packet. The marker of the very last edit: `Select-String -Path PROGRESS.md -Pattern "Packet 10F the picker version 2 (four glass pills by use, All tags, the pen icon;" -SimpleMatch` gives ONE match.
4. If the table and the marker match: go on at step 11 and run steps 11 to 19 as written (they check the whole result, so a half-applied edit cannot pass unnoticed).
5. If one of the 8 files is still unchanged or only partly changed: apply ONLY the missing edits of that file (the edits of a file go in the written order; for a file that is partly done, an edit is done when its REPLACE text is already in the file; do the edits that are not done), then go on at step 11. If you are not sure which edits are done: STOP and report the raw output of `git diff` for that file.
6. If a commit exists but not the `10E:` one, or anything else looks different from this section: STOP and report the raw output.

## PART 2: OWNER BY HAND (Supabase dashboard)
Use the SAME Supabase project whose address is in your `.env`. You can do Part 2 before or after Part 1: nothing in the app calls the new function yet. Only ONE function is added. Your tables, your tags, your saved sessions and a session that is running right now are not changed.
1. Supabase dashboard, left menu, SQL Editor, New query. Copy ALL of `supabase/timer_schema.sql` (the new version, after Part 1), paste it into the editor, press Run. Expected: "Success. No rows returned". It is safe to run again. If it shows a red error, send the full error text and do not run anything else.
2. New query. Copy ALL of `supabase/timer_verify.sql`, paste, Run. Expected: 18 rows, and in every row the `result` column equals the `expect` column. The expected values, in order: tables_exist 2, row_level_security_on 2, functions_exist 8, anonymous_can_start false, signed_in_can_start true, pause_log_columns 3, tag_table_with_row_level_security 1, tag_id_columns 2, tag_functions_exist 4, one_start_function 1, anonymous_cannot_add_tag false, signed_in_can_add_tag true, tag_name_unique_among_live_tags 1, row_json_sends_tag true, tag_use_function_exists 1, anonymous_cannot_read_tag_use false, signed_in_can_read_tag_use true, tag_use_answers_a_list array. (The last four rows are new. If you run this file BEFORE step 1, you do not get rows but a red error that says the function `timer_tag_use` does not exist: that is right, do step 1 first. In the SQL Editor nobody is signed in, so the new function answers an EMPTY list there, and `array` is the expected word for it.)
3. Recommended: New query, copy ALL of `supabase/day_score_verify.sql`, Run. Expected: 19 rows, every `result` equal to `expect` (the day score is not changed by this packet; this shows it still works).
4. Recommended, two minutes (after Part 1 and Part 2): running `timer_schema.sql` again made the database functions of the Pro Timer new (the same text as before, plus one function), so look once at the real app: start it on your computer (`npm run dev`), open the Pro Timer, press Start, wait a few seconds, reload the page (the session must still be running), then end the session as always. It must work exactly as before, and you will see nothing new on the screen. Then stop `npm run dev`. If anything does not work, send the planner what you see at once.
5. Send the planner the agent's report (`DONE 10E` and its lines) and the pasted table of the 18 rows. This packet PASSES only when the agent's report matches the expected lines AND all 18 rows match.

## WHAT THE NEW CODE DOES (for the owner and the later packets)
- **The database function `timer_tag_use()`.** It answers a list with one row `{"id": ..., "seconds": ...}` for each LIVE tag of the person (a tag that was removed is not listed), oldest tag first (the same order as `timer_tag_list`). `seconds` is the sum of `active_seconds` of the SAVED sessions with that tag that ENDED in the last 30 days; a tag with no such session has `0`. A session counts by the time it ENDED (a session that began 30 days and 30 minutes ago and ended 29 days and 23 hours ago counts in full). The running session is not counted (it is not saved yet), a session without a tag counts for nobody, and only the person's own tags and sessions count. It only reads, it runs with the rights of the caller (not `security definer`), and only a signed-in person may call it (the anonymous role may not). `timer_tag_list` is NOT changed.
- **The check file.** `supabase/timer_verify.sql` has 18 rows now: the four new ones are `tag_use_function_exists` (the function is installed), `anonymous_cannot_read_tag_use` (false), `signed_in_can_read_tag_use` (true) and `tag_use_answers_a_list` (the function answers a list when it is run in the SQL Editor). They do not test the sums: nobody is signed in in the SQL Editor, so real numbers cannot be checked there (see THINGS TO KNOW).
- **The app (`timerApi.ts`).** `TagUse = { id, seconds }`. `readTagUse` reads the answer and refuses (BAD_REPLY, like every other answer of the database) anything that is not a list, a row that is not an object, an id that does not look like an id, seconds that are not a whole number of 0 or more, and the same tag twice (also when only the capitals of the id differ); any other key of a row is left out. `timerTagUse()` calls `timer_tag_use` with no argument and gives the checked list. The 30 days are written ONLY in the SQL; the app has no number of days.
- **The sorting (`orderTagsByUse(tags, use)`, a plain function in `timerApi.ts`).** It gives a NEW list of the same tag objects: the tag with the most seconds first; tags with the same seconds (also none) stay in the order of `tags` (oldest first, as the database sends them); a tag that has no row counts 0; a row for a tag that is not in `tags` is ignored; ids that differ only in capitals are the same id; when an id comes twice the first row counts. It changes neither argument. The picker of Packet 10F will read both lists and use it; it is not used anywhere yet.
- **Tests.** 16 new: 13 in `timerApi.test.ts` (the reader, the call, the order) and 3 in `tagsSql.test.ts` (the text of the SQL function: it only reads, it runs with the rights of the caller, the 30 days, the filters, the answer). A few old lines of the two test files changed because the check file has 18 rows now and the list of database functions has one more (the number of old tests did not change).
- **Documents.** `DECISIONS_TAGS.md` is version 1.3 (new section 4b, the picker version 2: four most-used tags as pills, `All tags`, a pen icon; and the new order of the packets). `CODE_MAP.md`: the rows of `AB:TIMER.API` and `AB:TIMER.TESTS` know the new parts, and the words "renaming and removing (Packet 10E)" are now "Packet 10G". `CONNECTIONS.md`: the new C58 (with a check by hand for you), and small changes in C55 (18 rows) and C56 (Packet 10G). `PROGRESS.md`: a new Done line for this packet and the new order in Next.

## WHAT THE PLANNER HAD TO DECIDE (read them and say which are wrong; all are DEFAULT, except what the owner decided)
DECIDED by the owner on 2026-10-18 (`DECISIONS_TAGS.md` section 4b, "DECIDED"): only FOUR tags as pills above Start, chosen by how much he USES them; the other tags behind an `All tags` place; a pen icon for editing. Then he said: "decide it yourself, I will change it afterwards" (the same rule as C8 of 17 Oct 2026). Everything below is the planner's DEFAULT (the first three are points 1 to 3 of section 4b):
1. "Use" = the sum of `active_seconds` of the SAVED sessions of a tag that ENDED in the last 30 days. The running session is not counted; archived tags are not listed; a tag with no use counts 0. Change it by changing `timer_tag_use` and C58 together.
2. The order: most use first; equal use (also 0): the older tag first. The sorting is done by the app in a plain function with tests, and `timer_tag_list` stays as it is (rule 13 of `DECISIONS_TAGS.md`).
3. A NEW function, not a new key in `timer_tag_list`: so nothing that reads the list can break, and the numbers are asked only by the picker that needs them.
4. The answer is `[{id, seconds}]` for EVERY live tag (not only the used ones), oldest first, `[]` when there is no tag. So the app needs no second rule for "a tag with no row"; it still has one (counts 0) so that it also works with a shorter answer.
5. It runs with the rights of the caller and ALSO filters by `auth.uid()` itself, so that it never shows another person's tags or sessions even if a row-level-security rule were ever changed. Signed-in people only (`revoke ... from public, anon` and `grant ... to authenticated`, as the four other tag functions).
6. The window is `ended_at >= now() - interval '30 days'`: it moves with the clock of the database, so two readings an hour apart can differ. A session counts in full or not at all (it is not cut at the edge).
7. `readTagUse` is strict (whole numbers of 0 or more, no tag twice) so that a broken answer never becomes a wrong order on a screen.
8. `orderTagsByUse` is a plain function in `timerApi.ts`, not a new file: so no new file and no new tag, and the rules about tags (AGENTS.md 9 to 11) are not touched.
9. The check file only tests that the function is installed, who may call it and that it answers a list. It cannot test sums (see above).
10. `DECISIONS_TAGS.md` 1.3 goes into the repository the same way as in 10B and 10C1 (the owner copies it, the agent checks the SHA-256). The hash of version 1.2 (`A8343DC8...6483`) is no longer the right one.
11. The words "renaming and removing (Packet 10E)" are changed to "Packet 10G" in `CODE_MAP.md`, `CONNECTIONS.md` and `PROGRESS.md`. The same words stay in comments of `TagManage.tsx` and `timer.css` (screen code): Packet 10F, which changes those files, will fix them.
12. Not done here (later packets): any screen, the picker version 2 (10F), the hook reading the numbers (10F), renaming and removing (10G), the parked "one more tag apart from the four".

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED on a clean clone of master at `938c470` (the 36 edits applied, `DECISIONS_TAGS.md` 1.3 copied into the root, then `npm ci`):
  - LF, and four copies with every text file except the css in CRLF (the edits written with LF new lines and with CRLF new lines, and `DECISIONS_TAGS.md` both CRLF and left LF, which is what happens when you copy the LF file from the zip into a CRLF folder; this packet changes no css). On all five: `node scripts/check-tags.mjs` printed the two lines of step 11 (`TAGS OK: 37 tags, 77 places` and `CONNECTIONS OK: 58 connections, 492 anchors, 75 classes, 2 css variables, 2 label links`), `npx tsc -b` exit 0, `npm test -- --testTimeout=30000 --maxWorkers=4` printed 24 files and 1372 tests, `npm run lint -- --format=default` printed `Found 19 warnings and 0 errors.` (the same 19 as on master), `npm run build` built. (Master has 24 files and 1356 tests: 16 new tests, 13 in `timerApi.test.ts` and 3 in `tagsSql.test.ts`.)
  - The packet applied by a script that reads ONLY THIS FILE gives, on LF, exactly the same files as the direct edits (`diff -r`: identical), and on all four CRLF ways the same files apart from the line ends (the one other difference is `AGENTS.md`, which this packet does not touch: the test's own CRLF converter puts a CR on its last line, which has no line break after it; a copy of master does not change). The checks above were run on these copies that were made from the packet text.
  - The new SQL on a real Postgres 16 (a scratch server, not Supabase): the database that is live now (master `938c470`, with one person who has a tag, a saved session of 1500 seconds and a running session under that tag) became the new one by running `timer_schema.sql` three times, no error; the person kept the running session with its tag and `timer_tag_use()` counted the 1500 saved seconds; `timer_tag_list` is unchanged. The new `timer_verify.sql` gave 18 of 18 on the migrated and on an empty database (before the migration it gives a red error, not rows, because the function is not there); the OLD 14-row verify file still gives 14 of 14; `day_score_verify.sql` 19 of 19; the SQL behaviour tests of Packets 10A, 10C1 and 10E all passed. This run was made with the same SQL text as in this packet (the edits of `timer_schema.sql` and `timer_verify.sql` did not change afterwards; only test files did).
  - 23 deliberate breaks of the SQL function (the 30 days, the window on the wrong date, sum became count, other people, archived tags, an unused tag, the keys, the order, a null instead of a list, security definer, volatile, who may call it, the running session, grouping by tag): the SQL behaviour test noticed all 23, and `npm test` (the text tests of the SQL), check-tags or tsc notice all 23 as well. One of them (sessions not grouped by tag) was NOT noticed by `npm test` the first time; one line was added to the text test of the function body and it is noticed now.
  - 41 deliberate breaks of the app side and the documents (`readTagUse`, 9 breaks: not a list, not an object, a bad id, fractions, negative numbers, extra keys, the same tag twice also with other capitals, one reason for every fault; `orderTagsByUse`, 10: the order, ties, a tag with no row, the last row of an id, capitals on the id of the row or of the tag, the argument sorted in place, the objects copied, a row for a tag that is not in the list; `timerTagUse`, 3: another function name, an argument sent, the answer not checked; the text of the SQL function in `timer_schema.sql`, 6: the 30 days, the key `seconds`, the revoke line, the grant line, security definer, the check on the person; the check file, 5: it says 14 rows again, the last row dropped, a row renamed, the values of the two privilege rows; the anchors of C58 and one anchor line of `CONNECTIONS.md`, 7; the decisions file, 1): all 41 are noticed (by `npm test`, some also by `tsc` or `check-tags`). The first run had 43 breaks and 6 were NOT noticed: two in the order tests (a tag with no row counting 1 second instead of 0, and capitals in the id of the tag against the id of the row), two for the values of the four new rows of the check file, and two that remove the number C58 from a row of `CODE_MAP.md`. The first four were closed with two extra assertions inside existing tests and one new edit of `tagsSql.test.ts` (the test count did not change). The last two cannot be noticed by any check or test (`check-tags` reads the tag rows and the files of `CODE_MAP.md`, not the connection numbers in its text; this is so in every earlier packet), so they were taken out of the list.
- NOT TESTED: the real Supabase (the SQL was run on a scratch Postgres 16 with stand-ins for the Supabase roles and for `auth.uid()`; Part 2 is the first run in your real project and it is the test that decides whether this packet passes); a call of `timerTagUse` from the real app (nothing in the app calls it yet; the call was tested against a made-up database client); the 30 days at the exact edge on the real clock (the SQL behaviour test uses a session that ended 29 days 23 hours 59 minutes ago, which counts, and one that ended 30 days 1 hour ago, which does not; not the second); more than two devices at once; the SQL behaviour test itself is not in the repository (the text tests of the SQL and the check file are).

## THINGS TO KNOW (no check is possible)
- Until Part 2 step 1 is done, the function is not in Supabase. Nothing in the app calls it yet, so the app works in either order.
- In the Supabase SQL Editor nobody is signed in (`auth.uid()` is empty), so `select public.timer_tag_use();` shows `[]` there. Your real numbers (NPTEL, STUDY) can first be seen on a screen in Packet 10F.
- Only SAVED sessions count, and the app saves a session only if it has at least 60 seconds of active time (that is a rule of the database, not of this packet).
- A rename keeps the use (same id). Adding a name that an archived tag had brings that old tag back with its old id, so its old use comes back with it (`DECISIONS_TAGS.md` section 3, rule 7). Nothing in the app can remove a tag before Packet 10G, so you cannot see this yet.
- The sums, the 30 days, the archived tag, the running session and the other person are tested by the planner's SQL behaviour test on a real Postgres (not in the repository); `npm test` reads the TEXT of the SQL and cannot run it. The planner's run of deliberate breaks says how many of the SQL breaks `npm test` notices (see WHAT WAS TESTED); the others are noticed only by the behaviour test and by your Part 2.
- If you change anything about the use, change together (`CONNECTIONS.md` C58 says so): `timer_tag_use` in `supabase/timer_schema.sql`, its four check rows, `TagUse`, `readTagUse`, `timerTagUse` and `orderTagsByUse` in `timerApi.ts`, section 4b of `DECISIONS_TAGS.md`, and the tests.
- The css files stay LF in the planner's CRLF test: the css tests of `LineText` and `TimerScreen` already fail on the UNCHANGED project when `src/timer.css` has CRLF. Your earlier runs passed them, so your css is not CRLF. This packet changes no css.
- Still open from before (not part of the tags work): `DECISIONS_DAY_SCORE.md` section 4a contradicts its section 2; `supabase/day_score.sql` line 15 still says the tag is "not built yet"; four SQL breaks of 10A are caught only by the planner's SQL behaviour test, which is not in the repository.

## EDITS OF THE DATABASE FILE (supabase/timer_schema.sql)

**Edit 1** (the heading of the tag block says there is a fifth function)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- 11b. The tags of a person (Packet 10A). Four functions. The app never writes the table itself.
END TEXT

REPLACE WITH:
BEGIN TEXT
-- 11b. The tags of a person (Packet 10A). Four functions list, add, rename and archive the tags; a fifth one, timer_tag_use (Packet 10E), counts how much each tag was used. The app never writes the table itself.
END TEXT

**Edit 2** (timer_tag_use is made right after timer_tag_list)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- timer_tag_add(name): a new tag. If an archived tag has that name, the NEWEST archived tag of that name comes back instead
END TEXT

REPLACE WITH:
BEGIN TEXT
-- timer_tag_use(): how much each live tag was used, so that the app can put the tags in the order of their use (Packet 10E, DECISIONS_TAGS.md section 4b, points 1 to 3).
-- One row for each live tag of the person, oldest first: [{"id": ..., "seconds": ...}]. Use = the sum of active_seconds of the SAVED sessions of that tag that ENDED in the last 30 days.
-- The running session is not counted (it is not saved yet), an archived tag is not listed, a tag with no use gives 0, and only the person's own tags and sessions count. Read-only; it runs with the rights of the caller.
create or replace function public.timer_tag_use()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'seconds', coalesce(u.seconds, 0)) order by t.created_at, t.id), '[]'::jsonb)
  from public.timer_tags t
  left join (
    select s.tag_id, sum(s.active_seconds) as seconds
    from public.timer_sessions s
    where s.user_id = (select auth.uid()) and s.tag_id is not null and s.ended_at >= now() - interval '30 days'
    group by s.tag_id
  ) u on u.tag_id = t.id
  where t.user_id = (select auth.uid()) and t.archived_at is null
$$;

-- timer_tag_add(name): a new tag. If an archived tag has that name, the NEWEST archived tag of that name comes back instead
END TEXT

**Edit 3** (only signed-in people may call it: the revoke)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
revoke all on function public.timer_tag_archive(uuid) from public, anon;
END TEXT

REPLACE WITH:
BEGIN TEXT
revoke all on function public.timer_tag_archive(uuid) from public, anon;
revoke all on function public.timer_tag_use() from public, anon;
END TEXT

**Edit 4** (only signed-in people may call it: the grant)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
grant execute on function public.timer_tag_archive(uuid) to authenticated;
END TEXT

REPLACE WITH:
BEGIN TEXT
grant execute on function public.timer_tag_archive(uuid) to authenticated;
grant execute on function public.timer_tag_use() to authenticated;
END TEXT

## EDITS OF THE CHECK FILE (supabase/timer_verify.sql)

**Edit 1** (the header says 18 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
-- Expected result: 14 rows, exactly as the "expect" column says.
END TEXT

REPLACE WITH:
BEGIN TEXT
-- Expected result: 18 rows, exactly as the "expect" column says.
END TEXT

**Edit 2** (the last row loses its semicolon and four rows follow (the use of the tags))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
select 'row_json_sends_tag', (position('''tag''' in pg_get_functiondef('public.timer_row_json(public.timer_running)'::regprocedure)) > 0)::text, 'true';
END TEXT

REPLACE WITH:
BEGIN TEXT
select 'row_json_sends_tag', (position('''tag''' in pg_get_functiondef('public.timer_row_json(public.timer_running)'::regprocedure)) > 0)::text, 'true'
union all
select 'tag_use_function_exists', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'timer_tag_use')::text, '1'
union all
select 'anonymous_cannot_read_tag_use', has_function_privilege('anon', 'public.timer_tag_use()', 'execute')::text, 'false'
union all
select 'signed_in_can_read_tag_use', has_function_privilege('authenticated', 'public.timer_tag_use()', 'execute')::text, 'true'
union all
select 'tag_use_answers_a_list', jsonb_typeof(public.timer_tag_use()), 'array';
END TEXT

## EDITS OF THE CALLS (src/lib/timerApi.ts)

**Edit 1** (the header comment names the use of the tags)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
No screen uses the calls yet (CONNECTIONS.md C28, C29 and C55).
END TEXT

REPLACE WITH:
BEGIN TEXT
Since Packet 10E the database also counts how much each tag was used in the last 30 days (timer_tag_use): timerTagUse calls it, readTagUse checks the answer and orderTagsByUse puts the tags in the order of their use. No screen uses the calls yet (CONNECTIONS.md C28, C29, C55 and C58).
END TEXT

**Edit 2** (TagUse, readTagUse and orderTagsByUse, placed before the heading of the calls)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// ---- The calls ----
END TEXT

REPLACE WITH:
BEGIN TEXT
// One row of the use of a tag as timer_tag_use sends it (Packet 10E): the id of a live tag and its seconds of use in the last 30 days (0 when it was not used). Any other key is left out. The 30 days are counted by the database, not here.
export type TagUse = { id: string; seconds: number }

// The answer of timer_tag_use: one row for each live tag of the person, oldest first. The order is kept. An empty list is fine. Each id must look like an id, each number of seconds must be a whole number of 0 or more, and the same tag twice (also when only the capitals of the id differ) is refused.
export function readTagUse(json: unknown): TagUse[] {
  if (!Array.isArray(json)) return bad("the tag use is not a list")
  const rows = json.map((item): TagUse => {
    if (!isRecord(item)) return bad("a row of the tag use is not an object")
    const id = item.id
    if (typeof id !== "string" || !UUID_SHAPE.test(id)) return bad("the tag id in the tag use is not an id")
    const seconds = item.seconds
    if (typeof seconds !== "number" || !Number.isSafeInteger(seconds) || seconds < 0) return bad("the seconds of a tag are not a whole number of 0 or more")
    return { id, seconds }
  })
  if (new Set(rows.map((row) => row.id.toLowerCase())).size !== rows.length) return bad("the tag use holds the same tag twice")
  return rows
}

// Puts the tags in the order of their use (DECISIONS_TAGS.md section 4b, point 2): the tag with the most seconds first; tags with the same seconds (also none) stay in the order of tags (oldest first, as the database sends them). A tag that has no row in use counts 0 seconds, a row for a tag that is not in tags is ignored, and ids that differ only in capitals are the same id. If a row comes twice, the first one counts. It gives a NEW list (the tags in it are the same objects) and changes neither argument.
export function orderTagsByUse(tags: TimerTag[], use: TagUse[]): TimerTag[] {
  const seconds = new Map<string, number>()
  for (const row of use) {
    const key = row.id.toLowerCase()
    if (!seconds.has(key)) seconds.set(key, row.seconds)
  }
  return tags
    .map((tag, index) => ({ tag, index, seconds: seconds.get(tag.id.toLowerCase()) ?? 0 }))
    .sort((a, b) => b.seconds - a.seconds || a.index - b.index)
    .map((item) => item.tag)
}

// ---- The calls ----
END TEXT

**Edit 3** (the heading of the tag calls says five functions)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// ---- The tags (the four tag functions of supabase/timer_schema.sql, see CONNECTIONS.md C55) ----
END TEXT

REPLACE WITH:
BEGIN TEXT
// ---- The tags (the five tag functions of supabase/timer_schema.sql, see CONNECTIONS.md C55 and C58) ----
END TEXT

**Edit 4** (timerTagUse, placed after timerTagList)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// A new tag. The name is sent as typed:
END TEXT

REPLACE WITH:
BEGIN TEXT
// How much each live tag was used in the last 30 days: one row {id, seconds} for each live tag, oldest first (Packet 10E). It only reads. The order of the tags by use is made by orderTagsByUse.
export async function timerTagUse(): Promise<TagUse[]> {
  return readTagUse(await call("timer_tag_use"))
}

// A new tag. The name is sent as typed:
END TEXT

## EDITS OF THE TESTS OF THE CALLS (src/lib/timerApi.test.ts)

**Edit 1** (the import: orderTagsByUse)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  isOnline,
END TEXT

REPLACE WITH:
BEGIN TEXT
  isOnline,
  orderTagsByUse,
END TEXT

**Edit 2** (the import: readTagUse)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  readTagList,
END TEXT

REPLACE WITH:
BEGIN TEXT
  readTagList,
  readTagUse,
END TEXT

**Edit 3** (the import: timerTagUse)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  timerTagRename,
END TEXT

REPLACE WITH:
BEGIN TEXT
  timerTagRename,
  timerTagUse,
END TEXT

**Edit 4** (the title of the test of the function list says eleven)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
it("has the ten functions the app calls, with the argument names the app sends", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
it("has the eleven functions the app calls, with the argument names the app sends", () => {
END TEXT

**Edit 5** (timer_tag_use joins the list of the signatures)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
"timer_tag_archive(p_id uuid)"]) {
END TEXT

REPLACE WITH:
BEGIN TEXT
"timer_tag_archive(p_id uuid)", "timer_tag_use()"]) {
END TEXT

**Edit 6** (the new tests of the tag use, placed before the tests of the pause log)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
describe("the pause log in the SQL file (Packet 09A)", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
const TAG_C = { id: "5e7d2a90-3c41-4b8f-a6d2-7f0b9c1e4d33", name: "Study" }

describe("the tag use: the reader, the call and the order of the tags (Packet 10E)", () => {
  it("reads the use of the tags into id and seconds, in the order sent, and leaves out any other key", () => {
    const use = [
      { id: TAG_A.id, seconds: 5400 },
      { id: TAG_B.id, seconds: 0 },
    ]
    expect(readTagUse(use)).toEqual(use)
    expect(readTagUse([{ ...use[0], name: "Python", extra: 1 }])).toEqual([use[0]])
    expect(readTagUse([])).toEqual([])
  })

  it("reads 0 seconds (a tag that was not used) and a big number of seconds", () => {
    expect(readTagUse([{ id: TAG_A.id, seconds: 0 }])).toEqual([{ id: TAG_A.id, seconds: 0 }])
    expect(readTagUse([{ id: TAG_A.id, seconds: 2592000 }])).toEqual([{ id: TAG_A.id, seconds: 2592000 }])
  })

  it("refuses an answer that is not a list, a row that is not an object, an id that is not an id, and seconds that are not a whole number of 0 or more", () => {
    for (const value of [null, undefined, {}, "[]", 0, { id: TAG_A.id, seconds: 1 }]) expect(kindOf(() => readTagUse(value))).toBe("BAD_REPLY")
    for (const row of [null, undefined, "x", 5, [], [TAG_A.id, 1]]) expect(kindOf(() => readTagUse([row]))).toBe("BAD_REPLY")
    for (const id of [undefined, null, 5, "", "abc", "3f2b8c1e-5d4a-4b7e-9c10-2a6f8d9e0b1g"]) expect(kindOf(() => readTagUse([{ id, seconds: 60 }]))).toBe("BAD_REPLY")
    for (const seconds of [undefined, null, "60", -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, [60], {}]) {
      expect(kindOf(() => readTagUse([{ id: TAG_A.id, seconds }]))).toBe("BAD_REPLY")
    }
  })

  it("refuses the same tag twice, also when only the capitals of the id differ", () => {
    expect(() =>
      readTagUse([
        { id: TAG_A.id, seconds: 1 },
        { id: TAG_A.id, seconds: 2 },
      ]),
    ).toThrow("the tag use holds the same tag twice")
    expect(
      kindOf(() =>
        readTagUse([
          { id: TAG_A.id, seconds: 1 },
          { id: TAG_A.id.toUpperCase(), seconds: 2 },
        ]),
      ),
    ).toBe("BAD_REPLY")
  })

  it("says in the reason which part is wrong", () => {
    expect(() => readTagUse({})).toThrow("the tag use is not a list")
    expect(() => readTagUse(["x"])).toThrow("a row of the tag use is not an object")
    expect(() => readTagUse([{ id: "abc", seconds: 1 }])).toThrow("the tag id in the tag use is not an id")
    expect(() => readTagUse([{ id: TAG_A.id, seconds: -1 }])).toThrow("the seconds of a tag are not a whole number of 0 or more")
  })

  it("timerTagUse calls timer_tag_use with no arguments and hands back the checked list", async () => {
    const rows = [
      { id: TAG_A.id, seconds: 120 },
      { id: TAG_B.id, seconds: 0 },
    ]
    const rpc = answer(rows)
    expect(await timerTagUse()).toEqual(rows)
    expect(rpc).toHaveBeenCalledWith("timer_tag_use", undefined)
  })

  it("timerTagUse: no client is NOT_READY, a lost connection is NO_CONNECTION, a wrong shape is BAD_REPLY, and a database error keeps its name", async () => {
    holder.client = null
    expect(await kindOfAsync(() => timerTagUse())).toBe("NOT_READY")
    fail({ message: "Failed to fetch" })
    expect(await kindOfAsync(() => timerTagUse())).toBe("NO_CONNECTION")
    answer({})
    expect(await kindOfAsync(() => timerTagUse())).toBe("BAD_REPLY")
    fail({ message: "NOT_SIGNED_IN", code: "P0001" })
    expect(await kindOfAsync(() => timerTagUse())).toBe("NOT_SIGNED_IN")
  })

  it("orderTagsByUse puts the tag with the most seconds first", () => {
    const use = [
      { id: TAG_A.id, seconds: 100 },
      { id: TAG_B.id, seconds: 900 },
      { id: TAG_C.id, seconds: 500 },
    ]
    expect(orderTagsByUse([TAG_A, TAG_B, TAG_C], use)).toEqual([TAG_B, TAG_C, TAG_A])
  })

  it("tags with the same seconds keep the order of the list: all 0, nothing known about use, or a tie between used tags", () => {
    const zeros = [
      { id: TAG_A.id, seconds: 0 },
      { id: TAG_B.id, seconds: 0 },
      { id: TAG_C.id, seconds: 0 },
    ]
    expect(orderTagsByUse([TAG_A, TAG_B, TAG_C], zeros)).toEqual([TAG_A, TAG_B, TAG_C])
    expect(orderTagsByUse([TAG_C, TAG_A, TAG_B], [])).toEqual([TAG_C, TAG_A, TAG_B])
    const tie = [
      { id: TAG_B.id, seconds: 60 },
      { id: TAG_C.id, seconds: 60 },
    ]
    expect(orderTagsByUse([TAG_A, TAG_B, TAG_C], tie)).toEqual([TAG_B, TAG_C, TAG_A])
    expect(orderTagsByUse([TAG_C, TAG_B, TAG_A], tie)).toEqual([TAG_C, TAG_B, TAG_A])
  })

  it("a tag with no row counts 0 seconds and comes after a used tag, and a row for a tag that is not in the list is ignored", () => {
    expect(orderTagsByUse([TAG_A, TAG_B], [{ id: TAG_B.id, seconds: 30 }])).toEqual([TAG_B, TAG_A])
    expect(
      orderTagsByUse(
        [TAG_A, TAG_B],
        [
          { id: TAG_C.id, seconds: 99999 },
          { id: TAG_B.id, seconds: 30 },
        ],
      ),
    ).toEqual([TAG_B, TAG_A])
    expect(orderTagsByUse([TAG_A], [{ id: TAG_C.id, seconds: 99999 }])).toEqual([TAG_A])
    // a tag with no row counts exactly 0: it ties with a tag whose row says 0 (the older one stays first)
    expect(orderTagsByUse([TAG_A, TAG_B], [{ id: TAG_A.id, seconds: 0 }])).toEqual([TAG_A, TAG_B])
  })

  it("an id in capitals is the same id, and when a row comes twice the first one counts", () => {
    expect(orderTagsByUse([TAG_A, TAG_B], [{ id: TAG_B.id.toUpperCase(), seconds: 30 }])).toEqual([TAG_B, TAG_A])
    // the same when the TAG has the capitals and the row has not
    expect(orderTagsByUse([TAG_A, { ...TAG_B, id: TAG_B.id.toUpperCase() }], [{ id: TAG_B.id, seconds: 30 }])).toEqual([{ ...TAG_B, id: TAG_B.id.toUpperCase() }, TAG_A])
    const twice = [
      { id: TAG_A.id, seconds: 10 },
      { id: TAG_B.id, seconds: 20 },
      { id: TAG_A.id, seconds: 500 },
    ]
    expect(orderTagsByUse([TAG_A, TAG_B], twice)).toEqual([TAG_B, TAG_A])
  })

  it("gives a new list with the same tag objects, changes neither argument, and an empty list of tags gives an empty list", () => {
    const tags = [TAG_A, TAG_B, TAG_C]
    const use = [
      { id: TAG_C.id, seconds: 9 },
      { id: TAG_A.id, seconds: 1 },
    ]
    const tagsBefore = JSON.stringify(tags)
    const useBefore = JSON.stringify(use)
    const ordered = orderTagsByUse(tags, use)
    expect(ordered).not.toBe(tags)
    expect(ordered[0]).toBe(TAG_C)
    expect(JSON.stringify(tags)).toBe(tagsBefore)
    expect(JSON.stringify(use)).toBe(useBefore)
    expect(orderTagsByUse([], use)).toEqual([])
  })

  it("ten tags: the first four of the result are the four most used, in the order of use, and the rest follow in the same rule", () => {
    const ten = Array.from({ length: 10 }, (_, i) => ({ id: "00000000-0000-4000-8000-0000000000" + String(i).padStart(2, "0"), name: "T" + i }))
    const seconds = [0, 300, 60, 9000, 0, 300, 120, 0, 7200, 60]
    const use = ten.map((tag, i) => ({ id: tag.id, seconds: seconds[i] ?? 0 }))
    const names = orderTagsByUse(ten, use).map((tag) => tag.name)
    expect(names.slice(0, 4)).toEqual(["T3", "T8", "T1", "T5"])
    expect(names).toEqual(["T3", "T8", "T1", "T5", "T6", "T2", "T9", "T0", "T4", "T7"])
  })
})

describe("the pause log in the SQL file (Packet 09A)", () => {
END TEXT

## EDITS OF THE TESTS OF THE SQL (src/lib/tagsSql.test.ts)

**Edit 1** (the comment says 18 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
in the Supabase SQL Editor (14 rows), see CONNECTIONS.md C55.
END TEXT

REPLACE WITH:
BEGIN TEXT
in the Supabase SQL Editor (18 rows), see CONNECTIONS.md C55 and C58.
END TEXT

**Edit 2** (the title of the test of the check file says 18 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
it("has a verify file of 14 rows that checks the tag parts, the two-argument timer_start and the tag key of timer_row_json", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
it("has a verify file of 18 rows that checks the tag parts, the two-argument timer_start, the tag key of timer_row_json and the function timer_tag_use", () => {
END TEXT

**Edit 3** (the check file says 18 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(verifySql).toContain("Expected result: 14 rows")
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(verifySql).toContain("Expected result: 18 rows")
END TEXT

**Edit 4** (the check file has 18 rows)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(verifySql.match(/^select '/gm)?.length).toBe(14)
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(verifySql.match(/^select '/gm)?.length).toBe(18)
END TEXT

**Edit 5** (the four new row names are looked for)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
      "row_json_sends_tag",
END TEXT

REPLACE WITH:
BEGIN TEXT
      "row_json_sends_tag",
      "tag_use_function_exists",
      "anonymous_cannot_read_tag_use",
      "signed_in_can_read_tag_use",
      "tag_use_answers_a_list",
END TEXT

**Edit 6** (the values of the four new rows are looked for)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(verifySql).not.toContain("'public.timer_start(text)'")
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(verifySql).not.toContain("'public.timer_start(text)'")
    expect(verifySql).toContain("select 'tag_use_function_exists', (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'timer_tag_use')::text, '1'")
    expect(verifySql).toContain("select 'anonymous_cannot_read_tag_use', has_function_privilege('anon', 'public.timer_tag_use()', 'execute')::text, 'false'")
    expect(verifySql).toContain("select 'signed_in_can_read_tag_use', has_function_privilege('authenticated', 'public.timer_tag_use()', 'execute')::text, 'true'")
    expect(verifySql).toContain("select 'tag_use_answers_a_list', jsonb_typeof(public.timer_tag_use()), 'array'")
END TEXT

**Edit 7** (the new tests of timer_tag_use, placed before the last test of the describe)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("keeps the tag out of the day score, and tells the API layer to read the new functions", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("has timer_tag_use (Packet 10E): it only reads, it runs with the rights of the caller, and only signed-in people may call it", () => {
    expect(schemaSql).toContain("create or replace function public.timer_tag_use()")
    const body = schemaSql.split("create or replace function public.timer_tag_use()")[1].split("$$;")[0]
    expect(body).toContain("stable")
    expect(body).toContain("set search_path = ''")
    expect(body).not.toContain("security definer")
    expect(body).not.toMatch(/\b(insert|update|delete)\b/i)
    expect(schemaSql).toContain("revoke all on function public.timer_tag_use() from public, anon;")
    expect(schemaSql).toContain("grant execute on function public.timer_tag_use() to authenticated;")
  })

  it("timer_tag_use sums the active seconds of the saved sessions of the person that ended in the last 30 days, and nothing else (Packet 10E)", () => {
    const body = schemaSql.split("create or replace function public.timer_tag_use()")[1].split("$$;")[0]
    expect(body).toContain("sum(s.active_seconds) as seconds")
    expect(body).toContain("from public.timer_sessions s")
    expect(body).toContain("s.user_id = (select auth.uid()) and s.tag_id is not null and s.ended_at >= now() - interval '30 days'")
    expect(count(body, "'30 days'")).toBe(1)
    expect(body).toContain("group by s.tag_id")
    expect(body).not.toContain("timer_running")
  })

  it("timer_tag_use lists the live tags of the person only, gives 0 to a tag that was not used, and answers {id, seconds} oldest first like timer_tag_list (Packet 10E)", () => {
    const body = schemaSql.split("create or replace function public.timer_tag_use()")[1].split("$$;")[0]
    expect(body).toContain("from public.timer_tags t")
    expect(body).toContain("left join (")
    expect(body).toContain(") u on u.tag_id = t.id")
    expect(body).toContain("t.user_id = (select auth.uid()) and t.archived_at is null")
    expect(body).toContain("jsonb_build_object('id', t.id, 'seconds', coalesce(u.seconds, 0)) order by t.created_at, t.id")
    expect(body).toContain("'[]'::jsonb")
    const list = schemaSql.split("create or replace function public.timer_tag_list()")[1].split("$$;")[0]
    expect(list).toContain("order by created_at, id")
  })

  it("keeps the tag out of the day score, and tells the API layer to read the new functions", () => {
END TEXT

## CODE_MAP EDITS (CODE_MAP.md)

**Edit 1** (AB:TIMER.API: five tag functions and the order by use)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
to the four tag functions (the list, add, rename and archive of the person's tags; Start can send the tag; the reading of a running session holds its tag when it has one)
END TEXT

REPLACE WITH:
BEGIN TEXT
to the five tag functions (the list, add, rename and archive of the person's tags, and the count of how much each tag was used in the last 30 days with the plain function that puts the tags in the order of that use; Start can send the tag; the reading of a running session holds its tag when it has one)
END TEXT

**Edit 2** (AB:TIMER.API: C58)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(CONNECTIONS.md C28, C29, C54 and C55) |
END TEXT

REPLACE WITH:
BEGIN TEXT
(CONNECTIONS.md C28, C29, C54, C55 and C58) |
END TEXT

**Edit 3** (AB:TIMER.TESTS: the verify file has 18 rows and the function timer_tag_use is tested)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
its verify file of 14 rows, the tag key of timer_row_json)
END TEXT

REPLACE WITH:
BEGIN TEXT
its verify file of 18 rows, the tag key of timer_row_json, the function timer_tag_use)
END TEXT

**Edit 4** (AB:TIMER.TESTS: the tag use in the app)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the tag of the running session in its reading and in the SQL file)
END TEXT

REPLACE WITH:
BEGIN TEXT
the tag of the running session in its reading and in the SQL file, the reading of the tag use, its call and the order of the tags by use)
END TEXT

**Edit 5** (AB:TIMER.TESTS: C58)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
C53, C54, C55 and C56 |
END TEXT

REPLACE WITH:
BEGIN TEXT
C53, C54, C55, C56 and C58 |
END TEXT

**Edit 6** (AB:TIMER.TAGS: renaming and removing are now Packet 10G)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
no renaming or removing yet (Packet 10E)
END TEXT

REPLACE WITH:
BEGIN TEXT
no renaming or removing yet (Packet 10G; the picker of version 2 is Packet 10F)
END TEXT

## CONNECTIONS EDITS (CONNECTIONS.md)

**Edit 1** (C55: the check file has 18 rows (the sentence of Then also))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(14 check rows, every row must show the same value in result and expect)
END TEXT

REPLACE WITH:
BEGIN TEXT
(18 check rows since Packet 10E, every row must show the same value in result and expect; the last four belong to timer_tag_use, see C58)
END TEXT

**Edit 2** (C55: the check file has 18 rows (Check by hand))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
then supabase/timer_verify.sql: all 14 rows must show the same value in result and expect.
END TEXT

REPLACE WITH:
BEGIN TEXT
then supabase/timer_verify.sql: all 18 rows must show the same value in result and expect.
END TEXT

**Edit 3** (C56: renaming and removing are now Packet 10G)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Adding, renaming and removing tags have no screen yet (Packets 10D and 10E).
END TEXT

REPLACE WITH:
BEGIN TEXT
Adding a tag has its screen since Packet 10D; renaming and removing have none yet (Packet 10G; the picker of version 2 is Packet 10F, DECISIONS_TAGS.md section 4b).
END TEXT

**Edit 4** (the new connection C58, placed before the heading Things to know)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Things to know (no check is possible)
END TEXT

REPLACE WITH:
BEGIN TEXT
### C58: The tag use: the SQL function timer_tag_use, its four check rows and its tests, the reading of its answer (readTagUse), the call (timerTagUse) and the plain function that sorts the tags (orderTagsByUse) are tied to section 4b of DECISIONS_TAGS.md
- Tags: `AB:TIMER.API`, `AB:TIMER.TESTS`
- If you change: what use means (the sum of active_seconds of the SAVED sessions of a tag that ENDED in the last 30 days; the running session, archived tags and other people's rows are not counted), the rule of the order (most use first, equal use: the older tag first), timer_tag_use in supabase/timer_schema.sql (its 30 days, its filters, its answer {id, seconds} for every live tag, oldest first, 0 for a tag that was not used, its revoke and grant), the four check rows of supabase/timer_verify.sql that belong to it (tag_use_function_exists, anonymous_cannot_read_tag_use, signed_in_can_read_tag_use, tag_use_answers_a_list), TagUse, readTagUse, timerTagUse or orderTagsByUse in timerApi.ts, or section 4b of DECISIONS_TAGS.md
- Then also: the database counts and the app sorts. timer_tag_use answers one row {id, seconds} for each live tag of the person, oldest first, with 0 seconds for a tag that was not used; the 30 days are written ONLY in the SQL (the app has no number of days). timerTagUse calls it with no argument and readTagUse checks the answer (a list; each id looks like an id; each number of seconds is a whole number of 0 or more; no tag twice, also not when only the capitals differ; any other key is left out; anything else is BAD_REPLY). orderTagsByUse(tags, use) gives a NEW list: most seconds first; equal seconds (also none) keep the order of tags; a tag with no row counts 0; a row for an unknown tag is ignored; the first row of an id counts. timer_tag_list is NOT changed (DECISIONS_TAGS.md section 3, rule 13); the picker (Packet 10F) reads both and sorts. Nothing on the screen uses these three yet. The check file has four rows for the function (it exists, the anonymous role cannot call it, a signed-in person can, and it answers a list when run in the SQL Editor, where nobody is signed in and the list is empty). The behaviour (the sums, the 30 days, the archived tag, the running session, another person) is checked by the planner's SQL behaviour test, which is not in the repository; npm test reads the text of the SQL (tagsSql.test.ts) and cannot run it. The owner has to run the changed supabase/timer_schema.sql and then supabase/timer_verify.sql in the Supabase SQL Editor.
- If you forget: the picker shows the tags in a wrong order, or counts sessions it should not (the running one, an old one, another person's), or the app meets an answer it cannot read and shows Something went wrong, or the verify file says false for a function that is not installed.
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export type TagUse = { id: string; seconds: number }`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export function readTagUse(json: unknown): TagUse[] {`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export function orderTagsByUse(tags: TimerTag[], use: TagUse[]): TimerTag[] {`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export async function timerTagUse(): Promise<TagUse[]> {`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the tag use: the reader, the call and the order of the tags (Packet 10E)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/tagsSql.test.ts = it("has timer_tag_use (Packet 10E): it only reads, it runs with the rights of the caller, and only signed-in people may call it", () => {`
- Check by hand: after any change in supabase/timer_schema.sql run npm test, run the SQL in the Supabase SQL Editor, then supabase/timer_verify.sql: all 18 rows must show the same value in result and expect.

## Things to know (no check is possible)
END TEXT

## PROGRESS EDITS (PROGRESS.md)

**Edit 1** (the 10D bullet: renaming and removing are Packet 10G now)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Renaming and removing are Packet 10E. With automated tests;
END TEXT

REPLACE WITH:
BEGIN TEXT
Renaming and removing were planned as Packet 10E; since the picker version 2 (DECISIONS_TAGS.md 1.3) they are Packet 10G. With automated tests;
END TEXT

**Edit 2** (the new bullet of Packet 10E, placed before the heading Next)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Next
END TEXT

REPLACE WITH:
BEGIN TEXT
- Packet 10E: the database counts how much each tag is used (supabase/timer_schema.sql, supabase/timer_verify.sql, src/lib/timerApi.ts; tests in timerApi.test.ts and tagsSql.test.ts; DECISIONS_TAGS.md version 1.3 into the repository). A new function timer_tag_use() answers, for each live tag, how many seconds of the saved sessions that ended in the last 30 days it has (0 when it was not used), oldest tag first; the running session is not counted. The app got timerTagUse and readTagUse (the answer is checked like the others) and a plain function orderTagsByUse (most seconds first; equal seconds keep the older tag first). Nothing on the screen changed and no screen uses them yet: the picker version 2 (Packet 10F, DECISIONS_TAGS.md section 4b) will. The owner runs supabase/timer_schema.sql and then supabase/timer_verify.sql (18 rows) in Supabase. With automated tests; CODE_MAP.md and CONNECTIONS.md (new C58; C55 and C56 changed in small places) were brought up to date.

## Next
END TEXT

**Edit 3** (the Next bullet: the new order of the tag packets)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Packet 10E renaming and removing a tag (the picker, Packet 10C2, and adding a tag, Packet 10D, are done; all with the plain error words).
END TEXT

REPLACE WITH:
BEGIN TEXT
Packet 10F the picker version 2 (four glass pills by use, All tags, the pen icon; DECISIONS_TAGS.md section 4b), then Packet 10G renaming and removing a tag behind the pen (the use count, Packet 10E, the picker, Packet 10C2, and adding a tag, Packet 10D, are done; all with the plain error words).
END TEXT
