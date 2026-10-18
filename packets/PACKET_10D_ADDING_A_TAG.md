# PACKET 10D: ADDING A TAG (a Manage tags row at the end of the phone list and a Manage tags chip on a wide screen, both open the Manage tags box with a field and an Add button; addTag in the hook; no SQL; Part 2 is a look at your phone and laptop with your REAL account)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_10D_ADDING_A_TAG.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: copy ONE file into your project folder `F:\ASHBORN` (from the zip, the folder `COPY_INTO_REPO`): `PACKET_10D_ADDING_A_TAG.md` goes into `F:\ASHBORN\packets`. Nothing else is copied: `DECISIONS_TAGS.md` does not change in this packet, so there is no hash step. Then stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time; step 17 says what the agent does then, so you do not have to.

Kind: build (a screen), no SQL. Written by the planner on 2026-10-18, after Packet 10C2 PASSED. Part 1 is done by the agent (ten files edited, two files created, a commit). Part 2 is done BY THE OWNER BY HAND: a look at the Pro Timer on the phone and on the laptop, and this time he ADDS ONE REAL TAG in his own account. There is nothing to run in the Supabase dashboard.

## GOAL
Let the person add a tag, as locked in `DECISIONS_TAGS.md` section 5 (the first half of "Manage tags"; renaming and removing are Packet 10E). The list of the phone gets a last row, `Manage tags`; a wide screen gets a dashed `Manage tags` chip on a row of its own under the chips. Either one opens the Manage tags box: a plain dim layer over the whole window and a box at the TOP of the window (under the Menu button, so that the keyboard of a phone does not hide it) with the title `Manage tags`, a `Back` button (`Done` on a wide screen), a text field with an `Add` button, one line for an error, and the person's tags as a plain read-only list. Add sends the name to the database as typed (`timerTagAdd`, Packet 10B); the database cuts the spaces and checks the rules, so the words of the errors are the ones Packet 10B wrote in `problemText`. A new tag appears at the end of the list and is NEVER chosen by itself (DECIDED, `DECISIONS_TAGS.md` section 4: every session starts with no tag; the person picks the tag himself). Nothing in the database changes.

## RULES FOR THE AGENT
- Create ONLY these two files: `src/components/TagManage.tsx` and `src/components/TagManage.test.tsx`. Edit ONLY these files: `src/lib/useTimer.ts`, `src/components/TimerScreen.tsx`, `src/components/TagPicker.tsx`, `src/timer.css`, `src/components/TagPicker.test.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/useTimer.hook.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do not touch `DECISIONS_TAGS.md`, any SQL file, `src/lib/timerApi.ts`, `src/lib/timerMaths.ts`, `.env`, or anything else. Do not install anything.
- Do not run any SQL. Decide nothing. Copy the texts exactly as written: do not rewrite, improve, reformat or rename anything. Keep the indentation of every line as written. Each text between BEGIN TEXT and END TEXT is the lines between those two lines, joined with line breaks, with no line break after the last line. (For a NEW FILE the file gets ONE line break after the last line.) Every FIND is ONE line. A REPLACE may have several lines; write them with the line breaks that the file you edit uses.
- Each FIND text must occur exactly once in its file at the moment you apply it (apply the edits of a file in the order written). If it does not, STOP and report which edit and the raw count.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply. This packet writes NO new tag name: it uses `AB:TIMER.TAGS` (made by Packet 10C2) in one more file. You do not invent anything: the new file `TagManage.tsx` carries the two lines `// AB:TIMER.TAGS:START` and `// AB:TIMER.TAGS:END`, and the new file `TagManage.test.tsx` carries the two lines `// AB:TIMER.TESTS:START` and `// AB:TIMER.TESTS:END`; copy them exactly. Do not invent, rename or delete any other tag. The edits of `src/lib/useTimer.ts` (apart from its import line) fall between `AB:TIMER.STATE:START` and `AB:TIMER.STATE:END`. The edit of `src/components/TimerScreen.tsx` falls between `AB:TIMER.SCREEN:START` and `AB:TIMER.SCREEN:END`. The edits of `src/components/TagPicker.tsx` (apart from its import lines) fall between `AB:TIMER.TAGS:START` and `AB:TIMER.TAGS:END`. The edits of `src/timer.css` fall inside the part that already has `AB:TIMER.TAGS`. The edits of the three test files fall between `AB:TIMER.TESTS:START` and `AB:TIMER.TESTS:END` (apart from the import and the fake-database lines at the top of a file). The three documents have no such tags.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `38d23fc` (Packet 10C2), and the only changed file is ONE untracked file: `?? packets/PACKET_10D_ADDING_A_TAG.md`. If the newest commit is another one, or any other file is changed, STOP and report the raw output (the planner tested this packet on `38d23fc` only).
2. Check that the two new files are not there yet. Run `Test-Path src/components/TagManage.tsx` and `Test-Path src/components/TagManage.test.tsx`. Expected: `False` twice. If one says `True`, STOP and report.
3. Create `src/components/TagManage.tsx` with the text of NEW FILE (src/components/TagManage.tsx) below.
4. Create `src/components/TagManage.test.tsx` with the text of NEW FILE (src/components/TagManage.test.tsx) below.
5. Edit `src/lib/useTimer.ts` with the 6 edits of EDITS OF THE LIVE STATE below.
6. Edit `src/components/TimerScreen.tsx` with the 1 edit of EDITS OF THE SCREEN below.
7. Edit `src/components/TagPicker.tsx` with the 12 edits of EDITS OF THE PICKER below.
8. Edit `src/timer.css` with the 3 edits of EDITS OF THE LOOK below.
9. Edit `src/components/TagPicker.test.tsx` with the 6 edits of EDITS OF THE PICKER TESTS below.
10. Edit `src/components/TimerScreen.test.tsx` with the 3 edits of EDITS OF THE SCREEN TESTS below.
11. Edit `src/lib/useTimer.hook.test.ts` with the 4 edits of EDITS OF THE HOOK TESTS below.
12. Edit `CODE_MAP.md` with the 5 edits of EDITS OF THE CODE MAP below.
13. Edit `CONNECTIONS.md` with the 3 edits of EDITS OF THE CONNECTIONS below.
14. Edit `PROGRESS.md` with the 2 edits of EDITS OF THE PROGRESS NOTES below.
15. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 37 tags, 77 places` and `CONNECTIONS OK: 57 connections, 486 anchors, 75 classes, 2 css variables, 2 label links`. (Before this packet they were 37 tags, 75 places, 56 connections, 478 anchors and 61 classes: no new tag, two new places because each new file carries one tag, one new connection C57, 8 new anchors and 14 new css classes.) If any number differs, STOP and report the raw output.
16. Run `npx tsc -b` and then `$LASTEXITCODE`. Expected: no output from `tsc` and `0`. If not, STOP and report the raw output.
17. Run `npm test`. Expected: `Test Files  24 passed (24)` and `Tests  1356 passed (1356)`. (Before this packet: 23 files and 1276 tests. The 80 new tests are 24 in the new `TagManage.test.tsx`, 19 in `TagPicker.test.tsx`, 14 in `TimerScreen.test.tsx` and 23 in `useTimer.hook.test.ts`.) If a number differs, or a test fails for any reason other than a timeout, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond" (the computer is busy; this happened in Packet 10C2), do NOT change any file and do NOT stop: run `npm test -- --testTimeout=30000 --maxWorkers=4` ONCE. It runs the same tests with the same checks; only the time limit of one test and the number of parallel workers change. If it prints the expected numbers, go on, and say in your report which of the two commands printed them. If it also fails, STOP and report the raw output of both runs.
18. Run `npm run lint -- --format=default`. Expected: the output has the line `Found 19 warnings and 0 errors.` (the same 19 warnings as before this packet), followed by a line that starts with `Finished in` (its numbers differ from computer to computer; ignore them). The option `--format=default` is there on purpose: without it some agent terminals make the linter print a short format with no `Found` line. If the `Found` line says another number, STOP and report the raw output.
19. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
20. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
21. Stage by name only (never `git add .`): `git add src/components/TagManage.tsx src/components/TagManage.test.tsx src/lib/useTimer.ts src/components/TimerScreen.tsx src/components/TagPicker.tsx src/timer.css src/components/TagPicker.test.tsx src/components/TimerScreen.test.tsx src/lib/useTimer.hook.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md packets/PACKET_10D_ADDING_A_TAG.md`
22. Commit: `git commit -m "10D: adding a tag (TagManage.tsx, a Manage tags row in the phone list and a Manage tags chip on a wide screen, the box with a field and Add, addTag in useTimer; a new tag is never chosen; no SQL)"`
23. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 6 lines, suggest nothing, start nothing)
`DONE 10D` then: the two raw lines of step 15, the raw `Test Files` and `Tests` lines of step 17 (as one line) and which command printed them, the raw `Found` line of step 18, and `git log --oneline -1`.

## PART 2: OWNER BY HAND (a look at the screen; nothing to run in Supabase)
This packet changes no SQL, so there is NOTHING to run in the Supabase dashboard. But this time the look uses your REAL account: **the tag you add is saved for real and CANNOT be removed or renamed until Packet 10E.** Add ONE tag, with a name you would really use (for example `Study`), and only that one. Do it after the agent has pushed.
1. Start the app on your computer (`npm run dev`) and open the Pro Timer (`#timer`) on your PHONE the way you looked at Packet 10C2 (if you need it: `npm run dev -- --host` prints a line `Network:` with an address; open that address on the phone, same Wi-Fi).
2. On the phone, with nothing running: tap the outlined pill above Start. The list slides up. It has the row `No tag` (highlighted) and, at the very bottom, ONE new row with a DASHED edge and softer words: `Manage tags`. (If you already had other tags they stand between the two. With very many tags on a small phone, `Manage tags` can be below the edge of the list: scroll the list.)
3. Tap `Manage tags`. The list goes away and a box appears at the TOP of the screen, under the Menu button: the title `Manage tags`, an outlined `Back` button on the right, a field with grey words `New tag`, a white `Add` button, and the line `You have no tags yet.` The field has the cursor and the keyboard of the phone comes up. **With the keyboard open you must still see the title, the field and the Add button** (that is why the box is at the top). The Start button and the pill are dimmed behind the box.
4. Type the name (for example `Study`) and tap `Add` (the Enter key of the keyboard does the same). Expected: the field is emptied, the keyboard stays, and the name appears under the field in a plain list with a thin line under it. The names in this list are NOT buttons: pressing one does NOTHING in this packet (renaming and removing come in 10E). The pill behind the box still says `No tag`: a new tag is never chosen by itself.
5. Type the same name again, with other capital letters (for example `study`), and tap `Add`. Expected: a line with a white bar at its left says `You already have a tag with that name.` and nothing is added. Start typing again: the line goes away.
6. Empty the field and tap `Add`. Expected: the line `A tag name needs 1 to 20 characters, and cannot be Freestyle.` Type `Freestyle` and tap `Add`: the same line. Do NOT add anything else.
7. Tap `Back`. Expected: the list is back with `No tag` (still highlighted), your tag, and `Manage tags` last. Tap your tag: the list closes and the pill says the name. Press Start: the pill goes away and a small line with the name shows inside the dial under the day total. Press End right away (a session under 60 seconds is not saved). After it ends the pill says `No tag` again (every session starts with no tag).
8. Open the list again, tap `Manage tags`, and tap the dark part of the screen (outside the box): the WHOLE thing closes, box and list. Do it once more and press Escape if you have a keyboard on the phone: the same.
9. On the laptop (a wide window), with nothing running: you see the chips `No tag` (white, because it is chosen) and your tag, then ONE dashed chip `Manage tags` on a row of its own, then Start. Click `Manage tags`: the same box appears in the middle of the window near the top, with `Done` where the phone has `Back`; your tag is in its list. Click `Done`: the whole box goes away (a laptop has no list to go back to) and nothing is chosen. Click on the chip `No tag` while it is already white: nothing visible happens (it is already chosen; that was so in 10C2 too). Do NOT add another tag.
10. Send the planner the agent's report (`DONE 10D` and its lines) and what you saw in steps 2 to 9 (short; a photo of the phone with the box open and the keyboard up is welcome). Stop `npm run dev` when you are done. This packet PASSES only when the agent's report matches the expected lines AND steps 2 to 9 look as described. If the look is not right, say what is wrong: every size, word and place below is a DEFAULT that can change.

## WHAT THE NEW CODE DOES (for the owner and the later packets)
- **The hook (`useTimer.ts`).** `TimerView` has one new thing: `addTag(name)`. It sends the name to the database as typed (`timerTagAdd`), reads the list again (the same ticketed reading as before, so an older answer cannot win), and answers `{ ok: true }` or `{ ok: false, message }`. It never throws and never shows a problem on the screen itself: the answer goes to the box. The `message` is the plain words of `problemText` (Packet 10B) for the four tag errors; a lost connection has its own words, `No connection. Try again in a moment.`, and does NOT turn the whole screen offline. If the second reading of the list fails, the new tag is still put at the end of the list, so the person sees what they just added. `addTag` NEVER chooses the new tag. The new exported type `AddTagResult` is the answer.
- **The picker (`TagPicker.tsx`).** It gets the prop `onAdd` and a `view` (`list` or `manage`) inside the open picker. The Manage tags row is the LAST row of the list (so it is also the last stop of Tab). The Manage tags chip is drawn on every size and shown only on a wide screen (css). While the box is open it is drawn INSTEAD of the list. From the row, `Back` goes back to the list and the focus goes to the list panel; from the chip, `Done` closes the picker and the focus goes back to the chip. Opening the box from the chip also reads the list again, as opening the list does.
- **The box (`TagManage.tsx`, new, tag `AB:TIMER.TAGS`).** A plain dim layer (the same as the list, no blur) and a box at the top with `role="dialog"` and `aria-modal`. The field gets the focus when the box opens. Add and Enter send the name; while the call runs the Add button is off and the field is read-only (a second tap cannot add the name twice). Enter does nothing while an input method is still composing a word (a name in another script). On success the field is emptied, the focus stays in the field, and the error line is cleared. On an error the text stays in the field and the plain words show in ONE line until the person types again. The box has no rule of its own, not even a limit on the field: the database cuts the spaces and checks the rules (1 to 20 characters, not Freestyle, no name you already have, at most 10 tags), so the rules and their words live in one place. A tag name is shown as plain text, never as markup. Tab stays inside the box. Escape and a tap on the dim layer close the whole picker.
- **The screen (`TimerScreen.tsx`).** One line: the picker is given `onAdd={timer.addTag}`. Nothing else on the screen changes, and nothing of the picker is drawn while a session runs (so nothing can be added then).
- **The look (`timer.css`).** New rules in the part of the picker: the dashed row and chip, the dim layer and the box (at most 440 px wide, 64 px from the top, it scrolls inside itself when it is taller than the window), the field and the Add button (48 px, Add is the one solid white button of the box), the Back or Done button (44 px high), the error line (a white bar at its left, no colour), the plain list of the person's tags (a thin line under each name, no box, at least 44 px high, no pointer), and a slide-down of the box that a person who asked their device for less motion does not get. The wide rule of the picker also switches the chip on.
- **Tests.** 80 new: `TagManage.test.tsx` (24), `TagPicker.test.tsx` (19), `TimerScreen.test.tsx` (14: the css and the screen), `useTimer.hook.test.ts` (23, with a fake server that keeps the rules of the SQL function that adds a tag). One OLD test had to change because it was true only before this packet: the Tab test of the list said the last stop is the last tag row; it is now the Manage tags row (two one-line edits in `TagPicker.test.tsx`, and the test of a person with no tags also checks the row). No other old test changes.
- **Documents.** `CODE_MAP.md`: the rows of `AB:TIMER.TAGS`, `AB:TIMER.STATE` and `AB:TIMER.TESTS` know the new file and `addTag`. `CONNECTIONS.md`: the new C57 (with a check by hand for you), and two places of C56 changed. `PROGRESS.md`: the Done line and the Next list.

## WHAT THE PLANNER HAD TO DECIDE (read them and say which are wrong; all are DEFAULT, except what is marked DECIDED)
DECIDED by the owner (`DECISIONS_TAGS.md` sections 4 and 5, 17 Oct 2026, and 18 Oct 2026 for the last point): a "Manage tags" row at the bottom of the SAME list opens an edit view (no separate Tags screen); adding is Packet 10D and renaming and removing are Packet 10E; the words of the four tag errors are the ones of `problemText`; and a tag that was added is NOT chosen by itself (every session starts with no tag; he picks the tag himself when he needs one). And on 2026-10-17 (entry C8): "do not ask me the small design questions, choose what looks good and write it down". Everything below is the planner's DEFAULT:
1. The box is drawn INSTEAD of the list (a second view of the same open picker), not on top of it and not as a new screen. Reason: no second dim layer, and the picker keeps one place for Escape and for the focus.
2. The box is at the TOP of the window under the Menu button, not at the bottom like the list. Reason: the keyboard of a phone would hide a box at the bottom while the person types. It is at most 440 px wide and it scrolls inside itself when it is taller than the window, so the field and the Add button (which stand above the list of tags) are always in sight.
3. Phone: the Manage tags row is the LAST row of the list, with a dashed edge and softer words so that it is not taken for a tag. Back goes back to the list. Wide screen: ONE dashed chip on a row of its own under the chips (it is no tag, so it does not stand among them); its box says Done, and Done, Escape and the dim layer close the picker, with the focus back on the chip.
4. The words: `Manage tags`, `New tag` (the grey words in the field), `Add`, `Back`, `Done`, `You have no tags yet.`; the name of the dialog for a screen reader is `Manage tags`, of the field `New tag name`, of the list `Your tags`.
5. The field has NO limit and NO rule of its own (the database says 1 to 20 characters and not Freestyle, and the error line says it): one place for the rules.
6. Enter in the field is the same as Add, except while an input method is composing a word.
7. While the call runs, Add is off and the field is read-only. The error line goes away as soon as the person types again, and the typed text stays after an error.
8. After a good Add: the field is emptied, the focus stays in the field (to add the next one), the new tag stands at the END of the list (oldest first, as the database gives it) and is NOT chosen. If the second reading of the list fails, the new tag is still put at the end.
9. A lost connection while adding has its own words (`No connection. Try again in a moment.`) and does not turn the whole screen offline.
10. The tags the person has are shown in the box as a PLAIN list (a thin line under each name, no box, no round edge), because they cannot be pressed in this packet; the same outlined pill as the tappable rows made the planner's real-browser look say "this is a button" (it was changed after that look). Renaming and removing (Packet 10E) turn these rows into something pressable.
11. The Back or Done button is 44 px high (a phone target); the field and Add are 48 px.
12. `DECISIONS_TAGS.md` is NOT changed (no rule changes), so there is no copy and no hash step in this packet.
13. Not done here (Packet 10E and later): renaming and removing a tag, any change of the words of the four tag errors, a way to see the limit of tags.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED on a clean clone of master at `38d23fc` (the 45 edits and the two new files applied, then `npm ci`):
  - LF, and four copies with every text file except the css in CRLF (the edits written with LF new lines and with CRLF new lines, and the two new files with LF and with CRLF; the css stays LF in this test, as in 10B, 10C1 and 10C2: the css tests of `LineText` and `TimerScreen` fail on the UNCHANGED project when `src/timer.css` has CRLF, and your earlier runs passed them, so your css is not CRLF). On all five: `node scripts/check-tags.mjs` printed the two lines of step 13 (`TAGS OK: 37 tags, 77 places` and `CONNECTIONS OK: 57 connections, 486 anchors, 75 classes, 2 css variables, 2 label links`), `npx tsc -b` exit 0, `npm test` printed 24 files and 1356 tests, `npm run lint -- --format=default` printed `Found 19 warnings and 0 errors.` (the same 19 as on master), `npm run build` built. (Master has 23 files and 1276 tests: 80 new tests.)
  - The packet applied by a script that reads ONLY THIS FILE gives, on LF, exactly the same files as the direct edits (`diff -r`: identical), and on all four CRLF ways the same files apart from the line ends (the one other difference is `AGENTS.md`, which this packet does not touch: the test's own CRLF converter puts a CR on its last line, which has no line break after it; a copy of master does not change). The checks above were run on these copies that were made from the packet text.
  - 104 deliberate breaks, one at a time, on the finished tree (the hook: the add call, the words of the answers, the list kept for choosing, what is shown, what is chosen; the box: Enter, the Add button, the field, the words, the list of names, Back and Done, the dim layer, focus, Escape, markup; the picker: the new row and chip, the open and close of the box, the focus and Tab rules; the screen; the css: sizes, the look of the box and of the rows, the layers, the slide, reduced motion; the anchors, the end tag, `CODE_MAP.md` and `CONNECTIONS.md`): all 104 are noticed. 99 by `npm test` (some also by `tsc` or `check-tags`); 5 only by `check-tags` (a renamed anchor or test anchor, a renamed end tag, `CODE_MAP.md`, `CONNECTIONS.md`), which is where a change of such a line belongs. One break was NOT noticed the first time: the new tag was not put into the list that the hook keeps for choosing (the screen still showed it, but a later choose of it would fail). One test was added for it (the suite went from 1355 to 1356 tests) and the break was run again and is noticed. The run was done in two parts (breaks 1 to 45, then 46 to 104) because the first part stopped on its own after break 45; the list is in `reference/MUTATIONS_APP_10d.log` of the planner's zip.
  - A real browser (headless Chromium, a made-up database) on a phone (390 x 844), a small phone (320 x 568, with 11 tags) and a laptop (1280 x 800), with tags and with none: the box, the field, the Add and Back or Done buttons (44 px), the plain list of names, the dim layer, the line of an error (a name already taken, a very long name). The two looks that were changed after the first look (the names in the box are a plain list and not buttons; Back and Done 44 px) were looked at again.
- NOT TESTED: the real screen on your phone or laptop (Part 2 is that test, by you: sizes, the keyboard with the box at the top, the dim layer, how it feels to type and tap); the real Supabase (the app's add call was tested against a made-up database client and a fake server that keeps the rules of the SQL function `timer_tag_add`; the SQL of Packet 10A, which has that function, was run by you in Supabase and passed, but a call from the real app has never been made: Part 2 makes the first one, and the tag it makes is REAL); the feel of the focus and Tab rules with a real keyboard or screen reader; the look in a browser that asks for less motion; more than two devices at once.

## THINGS TO KNOW (no check is possible)
- The tag you add in Part 2 is REAL and stays until Packet 10E (there is no remove yet). The database limit is 10 tags.
- On a small phone with many tags the Manage tags row (the last row of the list) can be below the edge of the list and needs a scroll. The planner kept it as the LAST row on purpose (`DECISIONS_TAGS.md` section 5: "at the bottom of the list"); pinning it to the bottom is cheap to add later.
- The names in the box cannot be pressed; that is by design until Packet 10E.
- If the window gets wide while the box is open (a phone turned sideways), the same thing can happen as with the list in 10C2: what is drawn stays open; Escape closes it. Cheap to fix later.
- A tag name that an ARCHIVED tag already had brings that old tag back with its old id and the new spelling (`DECISIONS_TAGS.md` section 3, rule 7). Nothing in the app can archive a tag before Packet 10E, so you cannot see this yet.
- If you change anything about adding a tag, change together (CONNECTIONS.md C57 says so): `addTag` in `useTimer.ts`, `TagManage.tsx`, the Manage tags row, chip and views in `TagPicker.tsx`, the one line of `TimerScreen.tsx` that gives the picker `onAdd`, the css of the box, and the tests.
- The css files stay LF in the planner's CRLF test: the css tests of `LineText` and `TimerScreen` already fail on the UNCHANGED project when `src/timer.css` has CRLF. Your earlier runs passed them, so your css is not CRLF. The new css tests are written like the old ones.
- Still open from before (not part of the tags work): `DECISIONS_DAY_SCORE.md` section 4a contradicts its section 2; `supabase/day_score.sql` line 15 still says the tag is "not built yet"; four SQL breaks of 10A are caught only by the planner's SQL behaviour test, which is not in the repository.

## NEW FILE (src/components/TagManage.tsx)

**THE MANAGE TAGS BOX.** Create the file `src/components/TagManage.tsx`. It must NOT exist yet (step 2 checked that). Write the lines between BEGIN TEXT and END TEXT exactly as they are, with the line breaks that the other files of `src/components` use, and ONE line break after the last line. Change nothing in them: not a space, not a quote, not a comment.

CREATE THE FILE WITH THIS TEXT (the file must not exist yet; if it does, STOP):
BEGIN TEXT
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.TAGS:START
// The Manage tags box of the Pro Timer (Packet 10D): the place where the person ADDS a tag. Renaming and removing come in Packet 10E. TagPicker.tsx opens it from the Manage tags row at the bottom of the phone list and from the Manage tags chip under the chips of a wide screen, and draws it INSTEAD of the list while it is open (DECISIONS_TAGS.md section 5, CONNECTIONS.md C57).
// It is a plain dim layer over the whole window (no blur, the same as the list) with a box at the TOP of the window, under the Menu button. The box is not at the bottom like the list on purpose: the keyboard of a phone would hide a box at the bottom while the person types. The box has a title, a Back button (Done on a wide screen), a text field with an Add button, one line for an error, and the person's tags as plain read-only rows. It scrolls when it is taller than the window.
// Add hands the name to the hook as typed (onAdd = addTag in useTimer.ts). The database cuts the spaces and checks the rules, so the rules and the words of the errors live in one place and this box has no rule of its own, not even a limit on the field. While the call runs, Add and Enter do nothing (a second tap cannot add the name twice) and the field cannot be edited. On success the field is emptied, the focus stays in the field, and the new tag appears in the list below (it is NOT chosen, see DECISIONS_TAGS.md section 4). On an error the text stays in the field and the plain words show in one line until the person types again.
// Enter in the field is the same as Add, except while a word is still being composed with an input method (a name in another script). Focus goes to the field when the box opens. Tab stays inside the box. Escape and a tap on the dim layer close the whole picker: TagPicker.tsx listens for Escape and gets the tap as onClose.
// A tag name is shown as plain text, never as markup. The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type TagManageProps = {
  tags: TimerTag[]
  backLabel: string
  onAdd: (name: string) => Promise<AddTagResult>
  onBack: () => void
  onClose: () => void
}

export default function TagManage({ tags, backLabel, onAdd, onBack, onClose }: TagManageProps) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)
  const aliveRef = useRef(true)

  // The field gets the focus when the box opens. An answer that comes after the box was closed changes nothing.
  useEffect(() => {
    aliveRef.current = true
    inputRef.current?.focus()
    return () => {
      aliveRef.current = false
    }
  }, [])

  async function submit() {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    let result: AddTagResult
    try {
      result = await onAdd(draft)
    } catch {
      result = { ok: false, message: "Something went wrong." }
    }
    busyRef.current = false
    if (!aliveRef.current) return
    setBusy(false)
    if (result.ok) {
      setDraft("")
      setError("")
      inputRef.current?.focus()
    } else {
      setError(result.message)
    }
  }

  // Tab stays inside the box: from the last stop it goes to the first one and back (the box itself counts as the place before the first stop).
  function trap(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return
    const stops = Array.from(boxRef.current?.querySelectorAll<HTMLElement>("button, input") ?? [])
    if (stops.length === 0) return
    const first = stops[0]
    const last = stops[stops.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === boxRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="ab-tag-dialog">
      <div className="ab-tag-scrim" aria-hidden="true" onClick={onClose} />
      <div className="ab-tag-box" role="dialog" aria-modal="true" aria-label="Manage tags" tabIndex={-1} ref={boxRef} onKeyDown={trap}>
        <div className="ab-tag-box-head">
          <p className="ab-tag-box-title">Manage tags</p>
          <button className="ab-tag-back" type="button" onClick={onBack}>
            {backLabel}
          </button>
        </div>
        <div className="ab-tag-add">
          <input
            className="ab-tag-input"
            type="text"
            aria-label="New tag name"
            placeholder="New tag"
            autoComplete="off"
            spellCheck={false}
            readOnly={busy}
            value={draft}
            ref={inputRef}
            onChange={(event) => {
              setDraft(event.target.value)
              setError("")
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault()
                void submit()
              }
            }}
          />
          <button className="ab-tag-add-button" type="button" disabled={busy} onClick={() => void submit()}>
            Add
          </button>
        </div>
        {error === "" ? null : (
          <p className="ab-tag-error" role="alert">
            {error}
          </p>
        )}
        {tags.length === 0 ? (
          <p className="ab-tag-have-empty">You have no tags yet.</p>
        ) : (
          <ul className="ab-tag-have" aria-label="Your tags">
            {tags.map((tag) => (
              <li key={tag.id} className="ab-tag-have-row">
                {tag.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
// AB:TIMER.TAGS:END
END TEXT

## NEW FILE (src/components/TagManage.test.tsx)

**THE TESTS OF THE MANAGE TAGS BOX.** Create the file `src/components/TagManage.test.tsx`. It must NOT exist yet (step 2 checked that). Write the lines between BEGIN TEXT and END TEXT exactly as they are, with the line breaks that the other files of `src/components` use, and ONE line break after the last line. Change nothing in them: not a space, not a quote, not a comment.

CREATE THE FILE WITH THIS TEXT (the file must not exist yet; if it does, STOP):
BEGIN TEXT
// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
import TagManage from "./TagManage"

// AB:TIMER.TESTS:START
// The Manage tags box (TagManage.tsx, Packet 10D): what it shows, what Add and Enter hand to the hook, what happens while the call runs and after its answer, where the focus goes, and what the keys do. The css is not read here (TimerScreen.test.tsx reads it). A made-up call stands in for the hook, and a made-up answer can be held back until the test lets it go.
const WORK: TimerTag = { id: "t-work", name: "Work" }
const STUDY: TimerTag = { id: "t-study", name: "Study" }

let root: Root | null = null
let container: HTMLElement | null = null

type Props = Partial<Parameters<typeof TagManage>[0]>
function show(over: Props = {}) {
  const props = {
    tags: [WORK, STUDY],
    backLabel: "Back",
    onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: true })),
    onBack: vi.fn(),
    onClose: vi.fn(),
    ...over,
  }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(TagManage, props)))
  return props
}

function q(selector: string): HTMLElement {
  const found = container?.querySelector<HTMLElement>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
}

function all(selector: string): HTMLElement[] {
  return Array.from(container?.querySelectorAll<HTMLElement>(selector) ?? [])
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function click(element: HTMLElement) {
  act(() => element.click())
}

function field(): HTMLInputElement {
  return q(".ab-tag-input") as HTMLInputElement
}

function addButton(): HTMLButtonElement {
  return q(".ab-tag-add-button") as HTMLButtonElement
}

// A person types: the value is set the way the browser sets it and the input event is sent, so that React sees it.
function typeInto(text: string) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  act(() => {
    set?.call(field(), text)
    field().dispatchEvent(new Event("input", { bubbles: true }))
  })
}

async function pressAdd() {
  await act(async () => {
    addButton().click()
  })
}

function key(target: EventTarget, name: string, shift = false, composing = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: name, shiftKey: shift, isComposing: composing, bubbles: true, cancelable: true })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

// An answer of onAdd that does not come until the test says so.
function held(): { promise: Promise<AddTagResult>; answer: (result: AddTagResult) => void } {
  let answer: (result: AddTagResult) => void = () => {}
  const promise = new Promise<AddTagResult>((resolve) => {
    answer = resolve
  })
  return { promise, answer: (result) => answer(result) }
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.restoreAllMocks()
})

describe("TagManage: what it shows", () => {
  it("is a modal dialog with the name Manage tags, a title, the button with the label it was given, a field and an Add button", () => {
    show({ backLabel: "Done" })
    const box = q(".ab-tag-box")
    expect(box.getAttribute("role")).toBe("dialog")
    expect(box.getAttribute("aria-modal")).toBe("true")
    expect(box.getAttribute("aria-label")).toBe("Manage tags")
    expect(box.getAttribute("tabindex")).toBe("-1")
    expect(q(".ab-tag-box-title").textContent).toBe("Manage tags")
    expect(q(".ab-tag-back").textContent).toBe("Done")
    expect(q(".ab-tag-back").getAttribute("type")).toBe("button")
    expect(addButton().textContent).toBe("Add")
    expect(addButton().getAttribute("type")).toBe("button")
    expect(addButton().disabled).toBe(false)
  })

  it("has a text field with a name for the screen reader, the placeholder New tag, no autocomplete, no spell check and NO limit of its own", () => {
    show()
    expect(field().getAttribute("type")).toBe("text")
    expect(field().getAttribute("aria-label")).toBe("New tag name")
    expect(field().getAttribute("placeholder")).toBe("New tag")
    expect(field().getAttribute("autocomplete")).toBe("off")
    expect(field().getAttribute("spellcheck")).toBe("false")
    expect(field().hasAttribute("maxlength")).toBe(false)
    expect(field().hasAttribute("minlength")).toBe(false)
    expect(field().value).toBe("")
    expect(field().readOnly).toBe(false)
  })

  it("puts the focus in the field when it opens", () => {
    show()
    expect(document.activeElement).toBe(field())
  })

  it("shows no error line at first", () => {
    show()
    expect(has(".ab-tag-error")).toBe(false)
    expect(has("[role=alert]")).toBe(false)
  })

  it("shows the tags as plain rows in the order it was given, and you have no tags yet when there are none", () => {
    show()
    expect(q(".ab-tag-have").getAttribute("aria-label")).toBe("Your tags")
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
    expect(has(".ab-tag-have button")).toBe(false)
    expect(has(".ab-tag-have-empty")).toBe(false)
    show({ tags: [] })
    expect(has(".ab-tag-have")).toBe(false)
    expect(q(".ab-tag-have-empty").textContent).toBe("You have no tags yet.")
  })

  it("follows the list when the hook gives a longer one", () => {
    show({ tags: [] })
    expect(has(".ab-tag-have-row")).toBe(false)
    show({ tags: [WORK] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
  })

  it("shows a name as text only", () => {
    show({ tags: [{ id: "t-odd", name: "<b>bold</b> & <img src=x onerror=alert(1)>" }] })
    expect(q(".ab-tag-have-row").textContent).toBe("<b>bold</b> & <img src=x onerror=alert(1)>")
    expect(has(".ab-tag-box b")).toBe(false)
    expect(has(".ab-tag-box img")).toBe(false)
  })
})

describe("TagManage: adding a tag", () => {
  it("hands the name to onAdd as typed on a tap of Add: no cutting of spaces and no limit of its own", async () => {
    const props = show()
    typeInto("  Study  ")
    await pressAdd()
    typeInto("A".repeat(25))
    await pressAdd()
    expect(props.onAdd).toHaveBeenCalledTimes(2)
    expect(vi.mocked(props.onAdd).mock.calls.map((c) => c[0])).toEqual(["  Study  ", "A".repeat(25)])
  })

  it("hands an empty field and a name the database does not allow to onAdd too (the words of the rule are the database's, not the box's)", async () => {
    const props = show()
    await pressAdd()
    typeInto("Freestyle")
    await pressAdd()
    typeInto("   ")
    await pressAdd()
    expect(vi.mocked(props.onAdd).mock.calls.map((c) => c[0])).toEqual(["", "Freestyle", "   "])
  })

  it("does the same on Enter in the field, and keeps the key to itself", async () => {
    const props = show()
    typeInto("Gym")
    let event: KeyboardEvent | null = null
    await act(async () => {
      event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      field().dispatchEvent(event)
    })
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    expect(props.onAdd).toHaveBeenCalledWith("Gym")
    expect((event as KeyboardEvent | null)?.defaultPrevented).toBe(true)
  })

  it("does nothing on other keys, and nothing on Enter while an input method is still composing a word", () => {
    const props = show()
    typeInto("Gym")
    key(field(), "a")
    key(field(), "Escape")
    key(field(), "Tab")
    key(field(), "Enter", false, true)
    expect(props.onAdd).not.toHaveBeenCalled()
  })

  it("empties the field, shows no error, and puts the focus back in the field after the call worked", async () => {
    show()
    typeInto("Gym")
    addButton().focus()
    expect(document.activeElement).toBe(addButton())
    await pressAdd()
    expect(field().value).toBe("")
    expect(has(".ab-tag-error")).toBe(false)
    expect(document.activeElement).toBe(field())
  })

  it("keeps the text in the field and shows the words in ONE line after an error, and takes the line away as soon as the person types again", async () => {
    const message = "You already have a tag with that name."
    show({ onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message })) })
    typeInto("Work")
    await pressAdd()
    expect(field().value).toBe("Work")
    expect(all(".ab-tag-error")).toHaveLength(1)
    expect(q(".ab-tag-error").textContent).toBe(message)
    expect(q(".ab-tag-error").getAttribute("role")).toBe("alert")
    typeInto("Worke")
    expect(has(".ab-tag-error")).toBe(false)
  })

  it("takes an old error away when the next try works", async () => {
    const onAdd = vi.fn(async (): Promise<AddTagResult> => ({ ok: true }))
    onAdd.mockResolvedValueOnce({ ok: false, message: "A tag name needs 1 to 20 characters, and cannot be Freestyle." })
    show({ onAdd })
    await pressAdd()
    expect(has(".ab-tag-error")).toBe(true)
    typeInto("Gym")
    expect(has(".ab-tag-error")).toBe(false)
    await pressAdd()
    expect(has(".ab-tag-error")).toBe(false)
    expect(field().value).toBe("")
  })

  it("shows the words of an error as text only", async () => {
    show({ onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message: "<b>no</b>" })) })
    await pressAdd()
    expect(q(".ab-tag-error").textContent).toBe("<b>no</b>")
    expect(has(".ab-tag-error b")).toBe(false)
  })

  it("keeps Add and the field off while the call runs, so that a second tap or Enter cannot add the name twice, and lets go when the answer comes", async () => {
    const wait = held()
    const props = show({ onAdd: vi.fn(() => wait.promise) })
    typeInto("Gym")
    act(() => addButton().click())
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    expect(addButton().disabled).toBe(true)
    expect(field().readOnly).toBe(true)
    act(() => addButton().click())
    key(field(), "Enter")
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    await act(async () => {
      wait.answer({ ok: true })
    })
    expect(addButton().disabled).toBe(false)
    expect(field().readOnly).toBe(false)
    expect(field().value).toBe("")
  })

  it("lets the person try again after an error, also while the same name is still in the field", async () => {
    const onAdd = vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message: "x" }))
    show({ onAdd })
    typeInto("Work")
    await pressAdd()
    await pressAdd()
    expect(onAdd).toHaveBeenCalledTimes(2)
    expect(addButton().disabled).toBe(false)
  })

  it("shows Something went wrong. and lets the person go on when onAdd throws", async () => {
    const onAdd = vi.fn(async (): Promise<AddTagResult> => {
      throw new Error("boom")
    })
    show({ onAdd })
    typeInto("Gym")
    await pressAdd()
    expect(q(".ab-tag-error").textContent).toBe("Something went wrong.")
    expect(field().value).toBe("Gym")
    expect(addButton().disabled).toBe(false)
    expect(field().readOnly).toBe(false)
  })

  it("does not fail when the answer comes after the box was closed", async () => {
    const problems = vi.spyOn(console, "error").mockImplementation(() => {})
    const wait = held()
    show({ onAdd: vi.fn(() => wait.promise) })
    typeInto("Gym")
    act(() => addButton().click())
    act(() => root?.unmount())
    root = null
    await act(async () => {
      wait.answer({ ok: false, message: "late" })
    })
    expect(problems).not.toHaveBeenCalled()
  })
})

describe("TagManage: the buttons, the dim layer and the keys", () => {
  it("calls onBack on a tap of its button, and nothing else", () => {
    const props = show()
    click(q(".ab-tag-back"))
    expect(props.onBack).toHaveBeenCalledTimes(1)
    expect(props.onClose).not.toHaveBeenCalled()
    expect(props.onAdd).not.toHaveBeenCalled()
  })

  it("calls onClose on a tap of the dim layer, which is hidden from the screen reader, and not on a tap inside the box", () => {
    const props = show()
    expect(q(".ab-tag-scrim").getAttribute("aria-hidden")).toBe("true")
    click(q(".ab-tag-box"))
    click(q(".ab-tag-box-title"))
    click(field())
    click(q(".ab-tag-have-row"))
    expect(props.onClose).not.toHaveBeenCalled()
    click(q(".ab-tag-scrim"))
    expect(props.onClose).toHaveBeenCalledTimes(1)
    expect(props.onBack).not.toHaveBeenCalled()
  })

  it("leaves Escape to the picker: the box itself neither closes nor goes back", () => {
    const props = show()
    key(field(), "Escape")
    key(q(".ab-tag-box"), "Escape")
    expect(props.onClose).not.toHaveBeenCalled()
    expect(props.onBack).not.toHaveBeenCalled()
  })

  it("keeps Tab inside the box: from the last stop (Add) to the first (the button), and Shift+Tab from the first stop or the box to the last", () => {
    show()
    const stops = all(".ab-tag-box button, .ab-tag-box input")
    expect(stops.map((s) => s.className)).toEqual(["ab-tag-back", "ab-tag-input", "ab-tag-add-button"])
    addButton().focus()
    const forward = key(addButton(), "Tab")
    expect(forward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(q(".ab-tag-back"))
    const back = key(q(".ab-tag-back"), "Tab", true)
    expect(back.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(addButton())
    q(".ab-tag-box").focus()
    const fromBox = key(q(".ab-tag-box"), "Tab", true)
    expect(fromBox.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(addButton())
  })

  it("lets Tab go on by itself everywhere else in the box", () => {
    show()
    field().focus()
    expect(key(field(), "Tab").defaultPrevented).toBe(false)
    expect(key(field(), "Tab", true).defaultPrevented).toBe(false)
  })
})
// AB:TIMER.TESTS:END
END TEXT

## EDITS OF THE LIVE STATE (src/lib/useTimer.ts)

**Edit 1** (import: the call that adds a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  timerTagList,
END TEXT

REPLACE WITH:
BEGIN TEXT
  timerTagAdd,
  timerTagList,
END TEXT

**Edit 2** (the comment of the part says what addTag does and names C57)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// What is tied to the database and the screen: see CONNECTIONS.md C28, C29, C30, C43, C45, C48, C51 and C56. The names used by the screen are in TimerView.
END TEXT

REPLACE WITH:
BEGIN TEXT
// Adding a tag (Packet 10D): addTag hands the name to the database as typed (timerTagAdd; the database cuts the spaces and checks the rules, so the words of the errors are the ones of problemText), reads the list again, and answers { ok: true } or { ok: false, message }. It never throws, it never shows a problem on the screen itself (the answer goes to the Manage tags box), and it NEVER chooses the new tag: every session starts with no tag, and the person picks the tag himself (DECISIONS_TAGS.md section 4).
// What is tied to the database and the screen: see CONNECTIONS.md C28, C29, C30, C43, C45, C48, C51, C56 and C57. The names used by the screen are in TimerView.
END TEXT

**Edit 3** (TimerView: the call that adds a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  reloadTags: () => void
END TEXT

REPLACE WITH:
BEGIN TEXT
  reloadTags: () => void
  addTag: (name: string) => Promise<AddTagResult>
END TEXT

**Edit 4** (the answer of addTag, before problemText)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
export function problemText(kind: TimerErrorKind): string {
END TEXT

REPLACE WITH:
BEGIN TEXT
// The answer of addTag (Packet 10D): it worked, or the plain words to show.
export type AddTagResult = { ok: true } | { ok: false; message: string }

export function problemText(kind: TimerErrorKind): string {
END TEXT

**Edit 5** (addTag comes after reloadTags)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const reloadTags = useCallback(() => void loadTags(), [loadTags])
END TEXT

REPLACE WITH:
BEGIN TEXT
  const reloadTags = useCallback(() => void loadTags(), [loadTags])

  // Packet 10D, CONNECTIONS.md C57. The name goes to the database as typed. A tag that was added is put into the list after the list was read again (the reading may fail; the person must still see the tag). The new tag is never chosen.
  const addTag = useCallback(
    async (name: string): Promise<AddTagResult> => {
      let added: TimerTag
      try {
        added = await timerTagAdd(name)
      } catch (error) {
        const kind: TimerErrorKind = error instanceof TimerError ? error.kind : "UNKNOWN"
        return { ok: false, message: kind === "NO_CONNECTION" ? "No connection. Try again in a moment." : problemText(kind) }
      }
      await loadTags()
      if (aliveRef.current && !tagsRef.current.some((tag) => tag.id === added.id)) {
        const list = [...tagsRef.current, added]
        tagsRef.current = list
        setTags(list)
      }
      return { ok: true }
    },
    [loadTags],
  )
END TEXT

**Edit 6** (the view gives addTag to the screen)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    reloadTags,
END TEXT

REPLACE WITH:
BEGIN TEXT
    reloadTags,
    addTag,
END TEXT

## EDITS OF THE SCREEN (src/components/TimerScreen.tsx)

**Edit 1** (the picker also gets addTag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
            <TagPicker tags={timer.tags} tagId={timer.tagId} disabled={!ready} onChoose={timer.chooseTag} onOpen={timer.reloadTags} />
END TEXT

REPLACE WITH:
BEGIN TEXT
            <TagPicker tags={timer.tags} tagId={timer.tagId} disabled={!ready} onChoose={timer.chooseTag} onOpen={timer.reloadTags} onAdd={timer.addTag} />
END TEXT

## EDITS OF THE PICKER (src/components/TagPicker.tsx)

**Edit 1** (import: the Manage tags box and the answer type)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
import type { TimerTag } from "@/lib/timerApi"
END TEXT

REPLACE WITH:
BEGIN TEXT
import TagManage from "@/components/TagManage"
import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
END TEXT

**Edit 2** (the comment says what the picker does about managing tags)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// The picker has no adding, renaming or removing of tags (Packets 10D and 10E).
END TEXT

REPLACE WITH:
BEGIN TEXT
// Managing tags (Packet 10D, CONNECTIONS.md C57): the list ends with a Manage tags row, and a wide screen has a Manage tags chip on a row of its own under the chips. Either one opens the Manage tags box (TagManage.tsx), which is drawn INSTEAD of the list while it is open: from the row, Back goes back to the list; from the chip (a wide screen has no list), Done closes the picker. The box only adds a tag for now (renaming and removing are Packet 10E), and a tag that was added is never chosen by itself.
END TEXT

**Edit 3** (props: the call that adds a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  onOpen: () => void
END TEXT

REPLACE WITH:
BEGIN TEXT
  onOpen: () => void
  onAdd: (name: string) => Promise<AddTagResult>
END TEXT

**Edit 4** (the function takes onAdd)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
export default function TagPicker({ tags, tagId, disabled, onChoose, onOpen }: TagPickerProps) {
END TEXT

REPLACE WITH:
BEGIN TEXT
export default function TagPicker({ tags, tagId, disabled, onChoose, onOpen, onAdd }: TagPickerProps) {
END TEXT

**Edit 5** (state: which view is open and whether it came from the chip)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const [open, setOpen] = useState(false)
END TEXT

REPLACE WITH:
BEGIN TEXT
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"list" | "manage">("list")
  const [viaChip, setViaChip] = useState(false)
END TEXT

**Edit 6** (ref: the Manage tags chip)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const panelRef = useRef<HTMLDivElement>(null)
END TEXT

REPLACE WITH:
BEGIN TEXT
  const panelRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLButtonElement>(null)
END TEXT

**Edit 7** (openList starts at the list)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  function openList() {
END TEXT

REPLACE WITH:
BEGIN TEXT
  function openList() {
    setViaChip(false)
    setView("list")
END TEXT

**Edit 8** (the three ways in and out of the Manage tags box)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  function choose(id: string | null) {
END TEXT

REPLACE WITH:
BEGIN TEXT
  function openManageFromList() {
    setView("manage")
  }

  function openManageFromChip() {
    onOpen()
    setViaChip(true)
    setView("manage")
    setOpen(true)
  }

  // Back from the box: to the list when the box was opened from the list (a phone), out of the picker when it was opened from the chip (a wide screen has no list).
  function leaveManage() {
    if (viaChip) close()
    else setView("list")
  }

  function choose(id: string | null) {
END TEXT

**Edit 9** (the focus effect also runs when the view changes (the list panel gets the focus when Back comes back to it))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  }, [open])
END TEXT

REPLACE WITH:
BEGIN TEXT
  }, [open, view])
END TEXT

**Edit 10** (a box that was opened from the chip gives the focus back to the chip)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  // Tab stays inside the panel: from the last row it goes to the first one and back (the panel itself counts as the place before the first row).
END TEXT

REPLACE WITH:
BEGIN TEXT
  // When the picker closes after a box that was opened from the chip of a wide screen, the focus goes back to that chip (the pill is not drawn there).
  useEffect(() => {
    if (!open && viaChip) chipRef.current?.focus()
  }, [open, viaChip])

  // Tab stays inside the panel: from the last row it goes to the first one and back (the panel itself counts as the place before the first row).
END TEXT

**Edit 11** (the Manage tags row ends the list)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
            ))}
END TEXT

REPLACE WITH:
BEGIN TEXT
            ))}
            <button className="ab-tag-more" type="button" onClick={openManageFromList}>
              Manage tags
            </button>
END TEXT

**Edit 12** (the Manage tags chip and the box come before the list)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
      {open ? (
END TEXT

REPLACE WITH:
BEGIN TEXT
      <button className="ab-tag-more-chip" type="button" ref={chipRef} disabled={disabled} aria-haspopup="dialog" onClick={openManageFromChip}>
        Manage tags
      </button>
      {open && view === "manage" ? (
        <TagManage tags={tags} backLabel={viaChip ? "Done" : "Back"} onAdd={onAdd} onBack={leaveManage} onClose={close} />
      ) : null}
      {open && view === "list" ? (
END TEXT

## EDITS OF THE LOOK (src/timer.css)

**Edit 1** (the rules of the Manage tags row, chip and box, before the motion rule)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
/* A person who asked their device for less motion gets no sliding and no breathing. It is written AFTER the rules it switches off. */
END TEXT

REPLACE WITH:
BEGIN TEXT
/* The Manage tags row at the end of the phone list (Packet 10D, CONNECTIONS.md C57): the size of a tag row, with a dashed edge and softer words, so that it is not taken for a tag. */
.ab-tag-more {
  box-sizing: border-box;
  flex: none;
  width: 100%;
  min-height: 48px;
  padding: 10px 20px;
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  text-align: left;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  cursor: pointer;
}

/* The Manage tags chip of a wide screen: one dashed chip on a row of its own under the chips (it is no tag, so it does not stand among them). It is not drawn on a phone, where the list has the row (the wide rule at the end of this part switches it on). */
.ab-tag-more-chip {
  display: none;
  box-sizing: border-box;
  flex: none;
  align-self: center;
  height: 40px;
  padding: 0 16px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  cursor: pointer;
}

.ab-tag-more-chip:disabled {
  opacity: 0.4;
  cursor: default;
}

/* The Manage tags box: the same plain dim layer as the list, and a box at the TOP of the window, under the Menu button (64 px; the Menu button is z-index 40 and about 56 px high). It is at the top on purpose: the keyboard of a phone would hide a box at the bottom while the person types. On a wide screen it is the same box, 440 px at most, centred. */
.ab-tag-dialog {
  position: fixed;
  inset: 0;
  z-index: 2;
}

.ab-tag-box {
  position: absolute;
  top: 64px;
  right: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: calc(100% - 24px);
  max-width: 440px;
  max-height: calc(100dvh - 76px);
  margin: 0 auto;
  padding: 16px 20px 20px;
  overflow-y: auto;
  background: #111114;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  outline: none;
  animation: ab-tag-down 240ms ease;
}

.ab-tag-box-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ab-tag-box-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.ab-tag-back {
  box-sizing: border-box;
  flex: none;
  height: 44px;
  padding: 0 16px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  cursor: pointer;
}

.ab-tag-add {
  display: flex;
  gap: 8px;
}

/* The field is 16 px high text on purpose: a phone zooms into a field with smaller text. */
.ab-tag-input {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 16px;
  font: inherit;
  font-size: 16px;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  outline: none;
}

.ab-tag-input:focus {
  border-color: #fff;
}

.ab-tag-add-button {
  box-sizing: border-box;
  flex: none;
  height: 48px;
  padding: 0 20px;
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  background: #fff;
  border: 1px solid #fff;
  border-radius: 14px;
  cursor: pointer;
}

.ab-tag-add-button:disabled {
  opacity: 0.4;
  cursor: default;
}

.ab-tag-error {
  margin: 0;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border-left: 3px solid #fff;
  border-radius: 8px;
  overflow-wrap: anywhere;
}

.ab-tag-have {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}

/* The tags the person has are a plain list (a hairline under each name, no box, no round edge), so that a name is not taken for a button: it cannot be pressed in this packet (renaming and removing come in Packet 10E). */
.ab-tag-have-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 4px;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-wrap: anywhere;
}

.ab-tag-have-row:last-child {
  border-bottom: 0;
}

.ab-tag-have-empty {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

@keyframes ab-tag-down {
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
}

/* A person who asked their device for less motion gets no sliding and no breathing. It is written AFTER the rules it switches off. */
END TEXT

**Edit 2** (the box gets no sliding either for a person who wants less motion)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  .ab-tag-panel {
END TEXT

REPLACE WITH:
BEGIN TEXT
  .ab-tag-panel,
  .ab-tag-box {
END TEXT

**Edit 3** (the wide screen shows the Manage tags chip)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  .ab-tag-chips {
END TEXT

REPLACE WITH:
BEGIN TEXT
  .ab-tag-more-chip {
    display: flex;
    align-items: center;
  }

  .ab-tag-chips {
END TEXT

## EDITS OF THE PICKER TESTS (src/components/TagPicker.test.tsx)

**Edit 1** (show: the picker gets a stand-in for the call that adds a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const props = { tags: [WORK, STUDY, READ], tagId: null, disabled: false, onChoose: vi.fn(), onOpen: vi.fn(), ...over }
END TEXT

REPLACE WITH:
BEGIN TEXT
  const props = { tags: [WORK, STUDY, READ], tagId: null, disabled: false, onChoose: vi.fn(), onOpen: vi.fn(), onAdd: vi.fn(async () => ({ ok: true as const })), ...over }
END TEXT

**Edit 2** (the Tab test: the last stop of the panel is now the Manage tags row (the array gets that stop, so every line after it is still true))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("keeps Tab inside the panel: from the last row to the first one, and Shift+Tab from the first row (or the panel) to the last", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("keeps Tab inside the panel: from the last stop (the Manage tags row) to the first one, and Shift+Tab from the first row (or the panel) to the last stop", () => {
END TEXT

**Edit 3** (the Tab test: the Manage tags row joins the rows as the last stop)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    rows[rows.length - 1].focus()
END TEXT

REPLACE WITH:
BEGIN TEXT
    rows.push(q(".ab-tag-more"))
    rows[rows.length - 1].focus()
END TEXT

**Edit 4** (the test of a person with no tags: the Manage tags row is still there)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("shows only No tag when the person has no tags yet (nothing can be added before Packet 10D)", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("shows only No tag and the Manage tags row when the person has no tags yet", () => {
END TEXT

**Edit 5** (the test of a person with no tags: the row of the box)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag"])
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag"])
    expect(q(".ab-tag-panel").lastElementChild).toBe(q(".ab-tag-more"))
END TEXT

**Edit 6** (the new tests of the Manage tags row, the box and the chip)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// AB:TIMER.TESTS:END
END TEXT

REPLACE WITH:
BEGIN TEXT
// The helpers of the Manage tags tests (Packet 10D): a person types into the field of the box, and presses Add (the answer of onAdd is waited for).
function typeInto(input: HTMLElement, text: string) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  act(() => {
    set?.call(input, text)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

async function pressAdd() {
  await act(async () => {
    q(".ab-tag-add-button").click()
  })
}

function openManageRow() {
  openSheet()
  click(q(".ab-tag-more"))
}

describe("TagPicker: the Manage tags row and the box (Packet 10D)", () => {
  it("ends the list of the phone with a Manage tags row that is a button of its own and no tag row", () => {
    const props = show()
    openSheet()
    const row = q(".ab-tag-more")
    expect(row.tagName).toBe("BUTTON")
    expect(row.getAttribute("type")).toBe("button")
    expect(row.textContent).toBe("Manage tags")
    expect(q(".ab-tag-panel").lastElementChild).toBe(row)
    expect(row.classList.contains("ab-tag-row")).toBe(false)
    expect(all(".ab-tag-row")).toHaveLength(4)
    click(row)
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("opens the box IN PLACE OF the list: the list is gone, the box is a modal dialog with a name, and the picker stays open", () => {
    const props = show()
    openManageRow()
    expect(has(".ab-tag-panel")).toBe(false)
    expect(has(".ab-tag-sheet")).toBe(false)
    const box = q(".ab-tag-box")
    expect(box.getAttribute("role")).toBe("dialog")
    expect(box.getAttribute("aria-modal")).toBe("true")
    expect(box.getAttribute("aria-label")).toBe("Manage tags")
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("true")
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("does not read the list a second time when the row opens the box (the list was read when it opened)", () => {
    const props = show()
    openManageRow()
    expect(props.onOpen).toHaveBeenCalledTimes(1)
  })

  it("puts the focus in the field of the box", () => {
    show()
    openManageRow()
    expect(document.activeElement).toBe(q(".ab-tag-input"))
  })

  it("shows the person's tags in the box as plain rows in the order of the hook, and follows the list while the box is open", () => {
    show({ tags: [WORK] })
    openManageRow()
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
    expect(has(".ab-tag-have button")).toBe(false)
  })

  it("says Back on the button, and Back goes back to the list: the box is gone, the panel has the focus, nothing was chosen, the picker stays open", () => {
    const props = show()
    openManageRow()
    expect(q(".ab-tag-back").textContent).toBe("Back")
    click(q(".ab-tag-back"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
    expect(document.activeElement).toBe(q(".ab-tag-panel"))
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("true")
  })

  it("closes the WHOLE picker on Escape from the box, without a change, and the focus goes back to the pill", () => {
    const props = show()
    openManageRow()
    key(document, "Escape")
    expect(has(".ab-tag-box")).toBe(false)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("false")
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("closes the WHOLE picker on a tap of the dim layer of the box, without a change", () => {
    const props = show()
    openManageRow()
    click(q(".ab-tag-dialog .ab-tag-scrim"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("opens at the LIST again after the box was closed", () => {
    show()
    openManageRow()
    key(document, "Escape")
    openSheet()
    expect(has(".ab-tag-panel")).toBe(true)
    expect(has(".ab-tag-box")).toBe(false)
  })

  it("hands the box the call that adds a tag: the name goes to it as typed, and the answer never chooses a tag", async () => {
    const onAdd = vi.fn(async () => ({ ok: true as const }))
    const props = show({ onAdd })
    openManageRow()
    typeInto(q(".ab-tag-input"), "  Gym ")
    await pressAdd()
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith("  Gym ")
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(has(".ab-tag-box")).toBe(true)
    expect(q(".ab-tag-pill").textContent).toBe("No tag")
  })

  it("marks no new tag as chosen: after the hook gives a longer list, only No tag is pressed in the list", () => {
    show({ tags: [WORK] })
    openManageRow()
    show({ tags: [WORK, STUDY] })
    click(q(".ab-tag-back"))
    expect(all(".ab-tag-row").map((r) => r.getAttribute("aria-pressed"))).toEqual(["true", "false", "false"])
    expect(q(".ab-tag-pill").textContent).toBe("No tag")
  })
})

describe("TagPicker: the Manage tags chip of the wide screen (Packet 10D)", () => {
  it("is one button on its own right after the group of chips, no chip of the group, and the chips are as before", () => {
    show()
    const chip = q(".ab-tag-more-chip")
    expect(chip.tagName).toBe("BUTTON")
    expect(chip.getAttribute("type")).toBe("button")
    expect(chip.getAttribute("aria-haspopup")).toBe("dialog")
    expect(chip.textContent).toBe("Manage tags")
    expect(q(".ab-tag-chips").nextElementSibling).toBe(chip)
    expect(q(".ab-tag-chips").contains(chip)).toBe(false)
    expect(all(".ab-tag-chip").map((c) => c.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
  })

  it("opens the box without the list, reads the list once, puts the focus in the field, and the button says Done", () => {
    const props = show()
    click(q(".ab-tag-more-chip"))
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(has(".ab-tag-box")).toBe(true)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(q(".ab-tag-back").textContent).toBe("Done")
    expect(document.activeElement).toBe(q(".ab-tag-input"))
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("closes the picker on Done and gives the focus back to the chip", () => {
    show()
    click(q(".ab-tag-more-chip"))
    click(q(".ab-tag-back"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(document.activeElement).toBe(q(".ab-tag-more-chip"))
  })

  it("closes the picker on Escape and gives the focus back to the chip", () => {
    const props = show()
    click(q(".ab-tag-more-chip"))
    key(document, "Escape")
    expect(has(".ab-tag-box")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-more-chip"))
  })

  it("closes the picker on a tap of the dim layer and gives the focus back to the chip", () => {
    show()
    click(q(".ab-tag-more-chip"))
    click(q(".ab-tag-dialog .ab-tag-scrim"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(document.activeElement).toBe(q(".ab-tag-more-chip"))
  })

  it("is disabled when the screen is not ready, as the pill and the chips are, and then does not open", () => {
    const props = show({ disabled: true })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    click(q(".ab-tag-more-chip"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(props.onOpen).not.toHaveBeenCalled()
  })

  it("leaves nothing of the chip way behind: the pill opens the LIST afterwards, and its box says Back again", () => {
    show()
    click(q(".ab-tag-more-chip"))
    click(q(".ab-tag-back"))
    openSheet()
    expect(has(".ab-tag-panel")).toBe(true)
    expect(has(".ab-tag-box")).toBe(false)
    click(q(".ab-tag-more"))
    expect(q(".ab-tag-back").textContent).toBe("Back")
  })

  it("shows the person's tags and a longer list in the box it opens", () => {
    show({ tags: [WORK] })
    click(q(".ab-tag-more-chip"))
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
  })
})
// AB:TIMER.TESTS:END
END TEXT

## EDITS OF THE SCREEN TESTS (src/components/TimerScreen.test.tsx)

**Edit 1** (makeView: the view has the call that adds a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    reloadTags: vi.fn(),
END TEXT

REPLACE WITH:
BEGIN TEXT
    reloadTags: vi.fn(),
    addTag: vi.fn(async () => ({ ok: true as const })),
END TEXT

**Edit 2** (the css tests of the Manage tags row, chip and box, inside the describe of the css of the picker (they use its helpers))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("never uses a css variable of its own and never touches the rules of the screen", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("draws the Manage tags row as a dashed full-width row of at least 44 px that does not shrink, so that it is not taken for a tag", () => {
    const row = rule(".ab-tag-more")
    expect(row).toContain("width: 100%;")
    expect(row).toContain("flex: none;")
    expect(px(row, /min-height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(row).toMatch(/border:\s*1px dashed/)
    expect(row).toContain("background: transparent;")
  })

  it("draws the Manage tags chip dashed and as high as a chip, off on a phone, on (flex) in the wide rule only, and the wide rule comes after it", () => {
    const chip = rule(".ab-tag-more-chip")
    expect(chip).toContain("display: none;")
    expect(chip).toMatch(/border:\s*1px dashed/)
    expect(px(chip, /height:\s*(\d+)px;/)).toBe(px(rule(".ab-tag-chip"), /height:\s*(\d+)px;/))
    expect(rule(".ab-tag-more-chip:disabled")).toContain("opacity: 0.4;")
    expect(inside(part(), TAGS_HEADER)).toMatch(/\.ab-tag-more-chip \{[^}]*display: flex;/)
    expect(part().indexOf("\n.ab-tag-more-chip {")).toBeGreaterThan(-1)
    expect(part().indexOf("\n.ab-tag-more-chip {")).toBeLessThan(part().indexOf(TAGS_HEADER))
  })

  it("puts the box in a fixed layer above the dial and below the menu button, and the box at the TOP of the window under the menu button, never at the bottom where a phone keyboard would hide it", () => {
    const layer = rule(".ab-tag-dialog")
    expect(layer).toContain("position: fixed;")
    expect(layer).toContain("inset: 0;")
    const z = px(layer, /z-index:\s*(\d+);/)
    expect(z).toBeGreaterThan(1)
    expect(z).toBeLessThan(40)
    const box = rule(".ab-tag-box")
    expect(box).toContain("position: absolute;")
    expect(px(box, /top:\s*(\d+)px;/)).toBeGreaterThanOrEqual(56)
    expect(box).not.toContain("bottom:")
    expect(box).toContain("overflow-y: auto;")
    expect(box).toMatch(/max-height:\s*calc\(100dvh - \d+px\);/)
    expect(box).toContain("margin: 0 auto;")
    expect(px(box, /max-width:\s*(\d+)px;/)).toBeLessThanOrEqual(440)
  })

  it("makes the field text 16 px high (a phone zooms into smaller text), 44 px or more to tap, with a focus look, and the Add button as high as the field", () => {
    const input = rule(".ab-tag-input")
    expect(px(input, /font-size:\s*(\d+)px;/)).toBeGreaterThanOrEqual(16)
    expect(px(input, /height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(input).toContain("min-width: 0;")
    expect(rule(".ab-tag-input:focus")).toContain("border-color: #fff;")
    expect(px(rule(".ab-tag-add-button"), /height:\s*(\d+)px;/)).toBe(px(input, /height:\s*(\d+)px;/))
  })

  it("keeps Add the one solid white button of the box, with a disabled look, and the Back button outlined", () => {
    expect(rule(".ab-tag-add-button")).toContain("background: #fff;")
    expect(rule(".ab-tag-add-button:disabled")).toContain("opacity: 0.4;")
    expect(rule(".ab-tag-back")).toContain("background: transparent;")
    expect(rule(".ab-tag-back")).toMatch(/border:\s*1px solid/)
    expect(px(rule(".ab-tag-back"), /height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
  })

  it("shows the error as one plain line with a bar at its left and lets a long word wrap", () => {
    const error = rule(".ab-tag-error")
    expect(error).toMatch(/border-left:\s*3px solid #fff;/)
    expect(error).toContain("overflow-wrap: anywhere;")
  })

  it("wraps a long name in the read-only rows, gives them the height of a tag row and no pointer, and draws the list without bullets", () => {
    const row = rule(".ab-tag-have-row")
    expect(row).toContain("overflow-wrap: anywhere;")
    expect(px(row, /min-height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(row).not.toContain("cursor:")
    expect(row).not.toContain("border-radius")
    expect(row).toMatch(/border:\s*0;/)
    expect(rule(".ab-tag-have")).toContain("list-style: none;")
  })

  it("slides the box down with a keyframe of its own, written before the motion rule that switches it off for a person who wants less motion", () => {
    expect(rule(".ab-tag-box")).toMatch(/animation:\s*ab-tag-down\s+\d+ms/)
    const keyframes = part().indexOf("@keyframes ab-tag-down {")
    const motion = part().indexOf("@media (prefers-reduced-motion: reduce) {")
    expect(keyframes).toBeGreaterThan(-1)
    expect(keyframes).toBeLessThan(motion)
    expect(inside(part(), "@media (prefers-reduced-motion: reduce) {")).toContain(".ab-tag-box")
  })

  it("never uses a css variable of its own and never touches the rules of the screen", () => {
END TEXT

**Edit 3** (the new screen tests of adding a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// AB:TIMER.TESTS:END
END TEXT

REPLACE WITH:
BEGIN TEXT
describe("TimerScreen: adding a tag (Packet 10D)", () => {
  const WORK: TimerTag = { id: "t-work", name: "Work" }
  const kidsOfMain = (): string[] => Array.from(q(".ab-timer").children).map((k) => k.id || k.className)
  const typeInto = (text: string) => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
    act(() => {
      set?.call(q(".ab-tag-input"), text)
      q(".ab-tag-input").dispatchEvent(new Event("input", { bubbles: true }))
    })
  }

  it("hands the box the call of the hook: Manage tags, a typed name and Add reach addTag, and nothing is chosen", async () => {
    const view = show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-pill").click())
    act(() => q(".ab-tag-more").click())
    typeInto("Study")
    await act(async () => {
      q(".ab-tag-add-button").click()
    })
    expect(view.addTag).toHaveBeenCalledTimes(1)
    expect(view.addTag).toHaveBeenCalledWith("Study")
    expect(view.chooseTag).not.toHaveBeenCalled()
  })

  it("draws the Manage tags chip as the last thing inside the picker, so that it stands in the buttons box above Start", () => {
    show({ status: "idle", tags: [WORK] })
    const chip = q(".ab-tag-more-chip")
    expect(chip.parentElement).toBe(q(".ab-tag-picker"))
    expect(chip.nextElementSibling).toBeNull()
    expect(q(".ab-tag-picker").nextElementSibling).toBe(q(".ab-timer-pill"))
    expect(chip.textContent).toBe("Manage tags")
  })

  it("is as ready as the Start button: the chip is off while the screen is busy, offline or has a problem", () => {
    show({ status: "idle", busy: true })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", busy: false, link: "offline" })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "problem", problem: "Something went wrong." })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "online", busy: false })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(false)
  })

  it("has no chip and no box while a session runs or is paused (nothing can be added then)", () => {
    show({ status: "running", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-more-chip")).toBe(false)
    expect(has(".ab-tag-box")).toBe(false)
    show({ status: "paused", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-more-chip")).toBe(false)
    expect(has(".ab-tag-box")).toBe(false)
  })

  it("keeps the children of the screen as they were, also while the box is open: the box lives inside the picker", () => {
    show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-more-chip").click())
    expect(has(".ab-tag-box")).toBe(true)
    expect(kidsOfMain()).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
    expect(q(".ab-tag-box").closest(".ab-timer-actions")).toBe(q(".ab-timer-actions"))
    expect(q(".ab-tag-box").closest(".ab-tag-picker")).toBe(q(".ab-tag-picker"))
  })

  it("loses the open box when a session starts (the picker is taken away)", () => {
    show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-more-chip").click())
    expect(has(".ab-tag-box")).toBe(true)
    show({ status: "running", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-box")).toBe(false)
    expect(has(".ab-tag-picker")).toBe(false)
  })
})
// AB:TIMER.TESTS:END
END TEXT

## EDITS OF THE HOOK TESTS (src/lib/useTimer.hook.test.ts)

**Edit 1** (the fake database gets the call that adds a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  timerTagList: vi.fn(),
END TEXT

REPLACE WITH:
BEGIN TEXT
  timerTagAdd: vi.fn(),
  timerTagList: vi.fn(),
END TEXT

**Edit 2** (the answer type of addTag is imported)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
import { POLL_OFFLINE_MS, POLL_ONLINE_MS, problemText, useTimer, type TimerOptions, type TimerView } from "./useTimer"
END TEXT

REPLACE WITH:
BEGIN TEXT
import { POLL_OFFLINE_MS, POLL_ONLINE_MS, problemText, useTimer, type AddTagResult, type TimerOptions, type TimerView } from "./useTimer"
END TEXT

**Edit 3** (the fake server keeps the rules of the SQL function that adds a tag: spaces cut, 1 to 20 characters, not Freestyle, one live tag per name whatever the capitals, at most 10)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  api.timerEnd.mockImplementation(async () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  api.timerTagAdd.mockImplementation(async (name: string) => {
    guard()
    const clean = name.trim()
    if (clean.length < 1 || clean.length > 20 || clean.toLowerCase() === "freestyle") throw new TimerError("BAD_TAG_NAME")
    if (server.tags.some((tag) => tag.name.toLowerCase() === clean.toLowerCase())) throw new TimerError("TAG_NAME_TAKEN")
    if (server.tags.length >= 10) throw new TimerError("TAG_LIMIT")
    const tag: TimerTag = { id: "t-" + clean.toLowerCase(), name: clean }
    server.tags = [...server.tags, tag]
    return { ...tag }
  })
  api.timerEnd.mockImplementation(async () => {
END TEXT

**Edit 4** (the hook tests of adding a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// AB:TIMER.TESTS:END
END TEXT

REPLACE WITH:
BEGIN TEXT
describe("useTimer: adding a tag (Packet 10D)", () => {
  const WORK: TimerTag = { id: "t-work", name: "Work" }
  const STUDY: TimerTag = { id: "t-study", name: "Study" }

  // addTag answers with a promise: the test waits for it inside act, as a person waits for the box.
  async function add(name: string): Promise<AddTagResult> {
    let result: AddTagResult = { ok: false, message: "not answered" }
    await act(async () => {
      result = await view.addTag(name)
      await vi.advanceTimersByTimeAsync(0)
    })
    return result
  }

  it("adds the tag: it answers ok, shows the tag at the end of the list, shows no problem, and does not choose the tag", async () => {
    server.tags = [WORK]
    await mount()
    expect(await add("Study")).toEqual({ ok: true })
    expect(api.timerTagAdd).toHaveBeenCalledTimes(1)
    expect(api.timerTagAdd).toHaveBeenCalledWith("Study")
    expect(view.tags).toEqual([WORK, STUDY])
    expect(view.tagId).toBeNull()
    expect(view.problem).toBe("")
    expect(view.link).toBe("online")
  })

  it("adds the first tag of a person who has none", async () => {
    await mount()
    expect(view.tags).toEqual([])
    expect(await add("Study")).toEqual({ ok: true })
    expect(view.tags).toEqual([STUDY])
  })

  it("hands the name to the database as typed (the database cuts the spaces) and shows the name the database kept", async () => {
    await mount()
    expect(await add("  Study  ")).toEqual({ ok: true })
    expect(api.timerTagAdd).toHaveBeenCalledWith("  Study  ")
    expect(view.tags).toEqual([STUDY])
  })

  it("reads the list again after the call, so that a tag that another device added shows too", async () => {
    server.tags = [WORK]
    await mount()
    expect(api.timerTagList).toHaveBeenCalledTimes(1)
    server.tags = [WORK, { id: "t-read", name: "Reading" }]
    await add("Study")
    expect(api.timerTagList).toHaveBeenCalledTimes(2)
    expect(view.tags.map((tag) => tag.name)).toEqual(["Work", "Reading", "Study"])
  })

  it("never chooses the new tag: a pick stays as it was, no pick stays no pick, and the next Start sends no tag", async () => {
    server.tags = [WORK]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    await add("Study")
    expect(view.tagId).toBe(WORK.id)
    await press(() => view.chooseTag(null))
    await add("Reading")
    expect(view.tagId).toBeNull()
    await press(view.start)
    expect(api.timerStart).toHaveBeenCalledWith("Asia/Kolkata")
    expect(view.runningTag).toBeNull()
  })

  it("puts the new tag at the end of the list when the second reading of the list fails, shows no problem, and the next good reading agrees", async () => {
    server.tags = [WORK]
    await mount()
    server.tagListDown = true
    expect(await add("Study")).toEqual({ ok: true })
    expect(view.tags).toEqual([WORK, STUDY])
    expect(view.problem).toBe("")
    expect(view.link).toBe("online")
    server.tagListDown = false
    await press(view.reloadTags)
    expect(view.tags).toEqual([WORK, STUDY])
  })

  it("can choose the new tag afterwards even when the second reading of the list failed (the hook chooses only from the list it keeps)", async () => {
    server.tags = [WORK]
    await mount()
    server.tagListDown = true
    await add("Study")
    await press(() => view.chooseTag(STUDY.id))
    expect(view.tagId).toBe(STUDY.id)
  })

  it("shows the tag once when the second reading already has it", async () => {
    await mount()
    await add("Study")
    expect(view.tags.filter((tag) => tag.id === STUDY.id)).toHaveLength(1)
  })

  it("answers the plain words of the database rules, changes nothing and does not read the list again", async () => {
    server.tags = [WORK]
    await mount()
    const bad = { ok: false, message: problemText("BAD_TAG_NAME") }
    expect(await add("")).toEqual(bad)
    expect(await add("   ")).toEqual(bad)
    expect(await add("freestyle")).toEqual(bad)
    expect(await add("A".repeat(21))).toEqual(bad)
    expect(await add("  work ")).toEqual({ ok: false, message: problemText("TAG_NAME_TAKEN") })
    expect(problemText("BAD_TAG_NAME")).toBe("A tag name needs 1 to 20 characters, and cannot be Freestyle.")
    expect(problemText("TAG_NAME_TAKEN")).toBe("You already have a tag with that name.")
    expect(view.tags).toEqual([WORK])
    expect(api.timerTagList).toHaveBeenCalledTimes(1)
    expect(view.problem).toBe("")
    expect(view.link).toBe("online")
  })

  it("answers the words of the limit when the person has the most tags allowed", async () => {
    server.tags = Array.from({ length: 10 }, (_, i) => ({ id: "t-" + i, name: "Tag" + i }))
    await mount()
    expect(await add("Eleven")).toEqual({ ok: false, message: problemText("TAG_LIMIT") })
    expect(problemText("TAG_LIMIT")).toBe("You have the most tags allowed. Remove one to add another.")
    expect(view.tags).toHaveLength(10)
  })

  it.each(["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND", "NOT_SIGNED_IN", "BAD_REPLY", "UNKNOWN"] as const)("gives problemText(%s) as the words of that error", async (kind) => {
    await mount()
    api.timerTagAdd.mockRejectedValueOnce(new TimerError(kind))
    expect(await add("Gym")).toEqual({ ok: false, message: problemText(kind) })
    expect(view.problem).toBe("")
  })

  it("answers its own words when there is no connection, and does not turn the whole screen offline (the next reading of the state does that)", async () => {
    await mount()
    api.timerTagAdd.mockRejectedValueOnce(new TimerError("NO_CONNECTION"))
    expect(await add("Gym")).toEqual({ ok: false, message: "No connection. Try again in a moment." })
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
  })

  it("answers Something went wrong. for an error that is not one of its own and never throws", async () => {
    await mount()
    api.timerTagAdd.mockRejectedValueOnce(new Error("boom"))
    expect(await add("Gym")).toEqual({ ok: false, message: "Something went wrong." })
  })

  it("keeps the list that was read last: an older reading that answers late cannot take the new tag out", async () => {
    server.tags = [WORK]
    await mount()
    const old = hold("timerTagList")
    await press(view.reloadTags)
    await add("Study")
    expect(view.tags).toEqual([WORK, STUDY])
    await release(() => old.answer([{ ...WORK }]))
    expect(view.tags).toEqual([WORK, STUDY])
  })

  it("never touches the session: a running session goes on with no tag, and the state is not read again", async () => {
    server.row = runningRow(30)
    server.tags = [WORK]
    await mount()
    const reads = api.timerState.mock.calls.length
    expect(await add("Study")).toEqual({ ok: true })
    expect(view.status).toBe("running")
    expect(view.runningTag).toBeNull()
    expect(api.timerState.mock.calls.length).toBe(reads)
    expect(api.timerPause).not.toHaveBeenCalled()
    expect(api.timerEnd).not.toHaveBeenCalled()
  })

  it("is the same function in every drawing of the screen, so that the box is not drawn again for nothing", async () => {
    server.row = runningRow(10)
    await mount()
    const first = view.addTag
    await settle(5000)
    expect(view.seconds).toBeGreaterThan(10)
    expect(view.addTag).toBe(first)
  })

  it("does not fail when its answer comes after the screen was closed", async () => {
    const problems = vi.spyOn(console, "error").mockImplementation(() => {})
    server.tags = [WORK]
    await mount()
    const pending = hold("timerTagAdd")
    let result: AddTagResult | null = null
    await act(async () => {
      void view.addTag("Study").then((answer) => {
        result = answer
      })
    })
    act(() => root?.unmount())
    root = null
    await act(async () => {
      pending.answer({ id: "t-study", name: "Study" })
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(result).toEqual({ ok: true })
    expect(problems).not.toHaveBeenCalled()
    problems.mockRestore()
  })
})
// AB:TIMER.TESTS:END
END TEXT

## EDITS OF THE CODE MAP (CODE_MAP.md)

**Edit 1** (AB:TIMER.TAGS: what it does now, and the second file)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
No adding, renaming or removing of tags yet (Packets 10D and 10E) | `src/components/TagPicker.tsx`, `src/timer.css` |
END TEXT

REPLACE WITH:
BEGIN TEXT
The Manage tags row (phone) and chip (wide screen) open the Manage tags box (TagManage.tsx), where the person adds a tag (Packet 10D; a new tag is never chosen by itself); no renaming or removing yet (Packet 10E) | `src/components/TagPicker.tsx`, `src/components/TagManage.tsx`, `src/timer.css` |
END TEXT

**Edit 2** (AB:TIMER.TAGS: the words that must be changed together)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the words No tag, Choose a tag and Tag;
END TEXT

REPLACE WITH:
BEGIN TEXT
the words No tag, Choose a tag, Tag, Manage tags, New tag, Add, Back and Done;
END TEXT

**Edit 3** (AB:TIMER.TAGS: C57)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
must keep the same two conditions as the screen's (CONNECTIONS.md C39), see CONNECTIONS.md C56 |
END TEXT

REPLACE WITH:
BEGIN TEXT
must keep the same two conditions as the screen's (CONNECTIONS.md C39), see CONNECTIONS.md C56 and C57 |
END TEXT

**Edit 4** (AB:TIMER.STATE: addTag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
and the name of the tag of the running session (see CONNECTIONS.md C56)
END TEXT

REPLACE WITH:
BEGIN TEXT
and the name of the tag of the running session (see CONNECTIONS.md C56), and adds a tag when the Manage tags box asks (addTag; it never chooses the new tag, see CONNECTIONS.md C57)
END TEXT

**Edit 5** (AB:TIMER.TESTS: the new test file)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
`src/components/TagPicker.test.tsx`
END TEXT

REPLACE WITH:
BEGIN TEXT
`src/components/TagPicker.test.tsx`, `src/components/TagManage.test.tsx`
END TEXT

## EDITS OF THE CONNECTIONS (CONNECTIONS.md)

**Edit 1** (the new connection C57, before the notes)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Things to know (no check is possible)
END TEXT

REPLACE WITH:
BEGIN TEXT
### C57: Adding a tag: the Manage tags box (TagManage.tsx) calls addTag of the hook, the hook calls timerTagAdd (C55) and reads the list again, the words of the errors are the ones of problemText, and the picker opens the box from the list row (a phone) or from the chip (a wide screen)
- Tags: `AB:TIMER.TAGS`, `AB:TIMER.STATE`, `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: addTag or the type AddTagResult in useTimer.ts, the words of problemText for BAD_TAG_NAME, TAG_NAME_TAKEN or TAG_LIMIT (the box shows them as they are), TagManage.tsx (its props, its class names, the words Manage tags, New tag, Add, Back and Done, the focus rules), the Manage tags row and chip and the view switch in TagPicker.tsx, the line of TimerScreen.tsx that gives the picker onAdd, or the css of the box (it stands at the top of the window on purpose)
- Then also: addTag (AB:TIMER.STATE) sends the name as typed to timerTagAdd (C55; the database cuts the spaces and checks the rules, so the screen has no rule of its own, not even a limit on the field), reads the list again with loadTags, and answers { ok: true } or { ok: false, message } with the plain words of problemText (NO_CONNECTION has its own words: No connection. Try again in a moment.). It never throws, never shows a problem on the screen itself and NEVER chooses the new tag (DECISIONS_TAGS.md section 4: every session starts with no tag, the person picks the tag himself). If the second reading of the list fails, the new tag is put at the end of the list so that it still shows. TagPicker.tsx draws the box INSTEAD of the list: from the Manage tags row at the end of the phone list (Back goes back to the list) or from the Manage tags chip under the chips of a wide screen (Done closes the picker, and the focus goes back to the chip). The chip is switched on by the wide rule of the css part of the picker (the same two conditions as the screen's, C56). While a call runs, Add and Enter do nothing and the field cannot be edited, so a second tap cannot add the name twice.
- If you forget: the box shows other words than the rule of the database means, or a second tap adds the same tag twice, or the new tag is chosen for the next Start, or the box sits at the bottom of a phone and its keyboard hides the field, or the chip shows on a phone next to the Manage tags row.
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const addTag = useCallback(`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = added = await timerTagAdd(name)`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = onAdd={timer.addTag}`
- Anchor: `AB:TIMER.TAGS @ src/components/TagPicker.tsx = <TagManage tags={tags}`
- Anchor: `AB:TIMER.TAGS @ src/components/TagManage.tsx = <div className="ab-tag-dialog">`
- Anchor: `AB:TIMER.TAGS @ src/timer.css = .ab-tag-box {`
- Anchor: `AB:TIMER.TESTS @ src/components/TagManage.test.tsx = describe("TagManage: adding a tag", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.hook.test.ts = describe("useTimer: adding a tag (Packet 10D)", () => {`
- Check by hand: on a phone open #timer with nothing running, tap the pill, tap the last row, Manage tags: a box opens at the TOP of the screen, under the Menu button, with the field in focus. Type a name and press Add (or the Enter key): the field empties, and the name appears in the list of the box. The pill still says No tag (a new tag is never chosen). Press Back and open the list: the new tag is a row. Add the same name again: a line says You already have a tag with that name. On a laptop a dashed chip, Manage tags, stands under the chips and opens the same box in the middle of the top; its button says Done.

## Things to know (no check is possible)
END TEXT

**Edit 2** (C56: the line that draws the picker also gives it onAdd)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TagPicker tags={timer.tags} tagId={timer.tagId} disabled={!ready} onChoose={timer.chooseTag} onOpen={timer.reloadTags} />`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TagPicker tags={timer.tags} tagId={timer.tagId} disabled={!ready} onChoose={timer.chooseTag} onOpen={timer.reloadTags} onAdd={timer.addTag} />`
END TEXT

**Edit 3** (C56: real tags can be added now (the last sentence of its check by hand))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Real tags cannot be added before Packet 10D, so everything with real tags (the rows, the chips, the line in the dial, TAG_NOT_FOUND) is checked by the tests only.
END TEXT

REPLACE WITH:
BEGIN TEXT
Real tags can be added since Packet 10D (C57); the line in the dial and TAG_NOT_FOUND are still checked by the tests only until the owner has a tag.
END TEXT

## EDITS OF THE PROGRESS NOTES (PROGRESS.md)

**Edit 1** (the Done line of 10D)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
With automated tests; CODE_MAP.md (new tag AB:TIMER.TAGS) and CONNECTIONS.md (new C56) were brought up to date.
END TEXT

REPLACE WITH:
BEGIN TEXT
With automated tests; CODE_MAP.md (new tag AB:TIMER.TAGS) and CONNECTIONS.md (new C56) were brought up to date.

- Packet 10D: adding a tag (src/components/TagManage.tsx new, src/components/TagPicker.tsx, src/components/TimerScreen.tsx, src/lib/useTimer.ts, src/timer.css; tests in TagManage.test.tsx, TagPicker.test.tsx, TimerScreen.test.tsx and useTimer.hook.test.ts). The list of the phone ends with a Manage tags row, and a wide screen has a dashed Manage tags chip under the chips. Either one opens the Manage tags box: a plain dim layer and a box at the TOP of the window (so that the keyboard of a phone does not hide it), with a text field, an Add button, one line for an error (the plain words of problemText: a name of 1 to 20 characters that is not Freestyle, a name you already have, the most tags allowed) and your tags as plain rows. The hook got addTag: it sends the name to the database as typed (the database cuts the spaces and checks the rules, so the screen has none of its own), reads the list again, and never chooses the new tag (every session starts with No tag; you pick the tag yourself). From the row, Back goes back to the list; from the chip, Done closes the picker. Renaming and removing are Packet 10E. With automated tests; CODE_MAP.md (the files and words of AB:TIMER.TAGS, AB:TIMER.STATE and AB:TIMER.TESTS) and CONNECTIONS.md (new C57, and C56 changed in two places) were brought up to date.
END TEXT

**Edit 2** (the Next list: 10D is done)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Packet 10D adding a tag (the picker, Packet 10C2, is done), Packet 10E renaming and removing a tag (all with the plain error words).
END TEXT

REPLACE WITH:
BEGIN TEXT
Packet 10E renaming and removing a tag (the picker, Packet 10C2, and adding a tag, Packet 10D, are done; all with the plain error words).
END TEXT
