# PACKET 10C2: THE TAG PICKER ON THE PRO TIMER (a pill above Start on a phone with a slide-up list, chips on a wide screen, the chosen tag goes with Start, the tag of a running session shows as a small line in the dial; new tag AB:TIMER.TAGS; no SQL; Part 2 is a look at your phone)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_10C2_TAG_PICKER.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: copy ONE file into your project folder `F:\ASHBORN` (from the zip, the folder `COPY_INTO_REPO`): `PACKET_10C2_TAG_PICKER.md` goes into `F:\ASHBORN\packets`. Nothing else is copied: `DECISIONS_TAGS.md` does not change in this packet, so there is no hash step. Then stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time; step 15 says what to do then.

Kind: build (a screen), no SQL. Written by the planner on 2026-10-17, after Packets 10B and 10C1 PASSED. Part 1 is done by the agent (eight files edited, two files created, a commit). Part 2 is done BY THE OWNER BY HAND: a look at the Pro Timer on the phone and on the laptop. There is nothing to run in Supabase.

## GOAL
Put the tag picker on the Pro Timer, as locked in `DECISIONS_TAGS.md` section 4. Before a session (nothing running): on a phone an outlined pill above Start shows the current choice ("No tag" at first); tapping it opens a list that slides up from the bottom (a plain dim layer behind it, "No tag" first, then the tags oldest first); tapping a row chooses it and closes the list; tapping the dim layer or pressing Escape closes it without a change. On a wide screen (a laptop) every tag stands as a chip in a wrapping row above Start. The choice goes to the database with Start (`timerStart(zone, tagId)`), and every session starts with no tag again. While a session runs there is no picker; the name of its tag is one small line inside the dial under the day total (nothing for a session with no tag). This is the first screen that uses the tag calls of Packet 10B (`timerTagList` and the tag on `timerStart`) and the key `tag` of Packet 10C1. Adding, renaming and removing tags are NOT in this packet (10D and 10E). Nothing in the database changes.

## RULES FOR THE AGENT
- Create ONLY these two files: `src/components/TagPicker.tsx` and `src/components/TagPicker.test.tsx`. Edit ONLY these files: `src/lib/useTimer.ts`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`, `src/lib/useTimer.hook.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do not touch `DECISIONS_TAGS.md`, any SQL file, `src/lib/timerApi.ts`, `src/lib/timerMaths.ts`, `.env`, or anything else. Do not install anything.
- Do not run any SQL. Decide nothing. Copy the texts exactly as written: do not rewrite, improve, reformat or rename anything. Keep the indentation of every line as written. Each text between BEGIN TEXT and END TEXT is the lines between those two lines, joined with line breaks, with no line break after the last line. (For a NEW FILE the file gets ONE line break after the last line.) Every FIND is ONE line. A REPLACE may have several lines; write them with the line breaks that the file you edit uses.
- Each FIND text must occur exactly once in its file at the moment you apply it (apply the edits of a file in the order written). If it does not, STOP and report which edit and the raw count.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply, with ONE thing new: this packet WRITES one new tag, `AB:TIMER.TAGS`. You do not invent it: it stands in the texts below (in the new file `TagPicker.tsx`, as the two lines `// AB:TIMER.TAGS:START` and `// AB:TIMER.TAGS:END`, in the new part of `src/timer.css`, and in the new row of `CODE_MAP.md`). Copy those lines exactly. Do not invent, rename or delete any other tag. The edits of `src/lib/useTimer.ts` fall between `AB:TIMER.STATE:START` and `AB:TIMER.STATE:END`. The edits of `src/components/TimerScreen.tsx` fall between `AB:TIMER.SCREEN:START` and `AB:TIMER.SCREEN:END`. The edit of `src/timer.css` inserts a new part right before the line `/* AB:TIMER.BG:START */`. The edits of the three test files fall between `AB:TIMER.TESTS:START` and `AB:TIMER.TESTS:END`. The three documents have no such tags.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `5b19bb3` (Packet 10C1), and the only changed file is ONE untracked file: `?? packets/PACKET_10C2_TAG_PICKER.md`. If the newest commit is another one, or any other file is changed, STOP and report the raw output (the planner tested this packet on `5b19bb3` only).
2. Check that the two new files are not there yet. Run `Test-Path src/components/TagPicker.tsx` and `Test-Path src/components/TagPicker.test.tsx`. Expected: `False` twice. If one says `True`, STOP and report.
3. Create `src/components/TagPicker.tsx` with the text of NEW FILE (src/components/TagPicker.tsx) below.
4. Create `src/components/TagPicker.test.tsx` with the text of NEW FILE (src/components/TagPicker.test.tsx) below.
5. Edit `src/lib/useTimer.ts` with the 18 edits of EDITS OF THE LIVE STATE below.
6. Edit `src/components/TimerScreen.tsx` with the 4 edits of EDITS OF THE SCREEN below.
7. Edit `src/timer.css` with the 1 edit of EDITS OF THE LOOK below.
8. Edit `src/components/TimerScreen.test.tsx` with the 4 edits of EDITS OF THE SCREEN TESTS below.
9. Edit `src/lib/useTimer.hook.test.ts` with the 9 edits of EDITS OF THE HOOK TESTS below.
10. Edit `CODE_MAP.md` with the 8 edits of EDITS OF THE CODE MAP below.
11. Edit `CONNECTIONS.md` with the 6 edits of EDITS OF THE CONNECTIONS below.
12. Edit `PROGRESS.md` with the 2 edits of EDITS OF THE PROGRESS NOTES below.
13. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 37 tags, 75 places` and `CONNECTIONS OK: 56 connections, 478 anchors, 61 classes, 2 css variables, 2 label links`. (Before this packet they were 36 tags, 72 places, 55 connections, 466 anchors and 49 classes: one new tag, one new connection, 12 new anchors and 12 new css classes.) If any number differs, STOP and report the raw output.
14. Run `npx tsc -b` and then `$LASTEXITCODE`. Expected: no output from `tsc` and `0`. If not, STOP and report the raw output.
15. Run `npm test`. Expected: `Test Files  23 passed (23)` and `Tests  1276 passed (1276)`. (Before this packet: 22 files and 1191 tests. The 85 new tests are 28 in the new `TagPicker.test.tsx`, 13 and 19 in `TimerScreen.test.tsx` and 25 in `useTimer.hook.test.ts`.) If a number differs, or a test fails, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond", say so in your report: the computer was too busy, and the owner will free it and tell you to run this step again. Do not change any file for it.
16. Run `npm run lint -- --format=default`. Expected: the output has the line `Found 19 warnings and 0 errors.` (the same 19 warnings as before this packet), followed by a line that starts with `Finished in` (its numbers differ from computer to computer; ignore them). The option `--format=default` is there on purpose: without it some agent terminals make the linter print a short format with no `Found` line. If the `Found` line says another number, STOP and report the raw output.
17. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
18. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
19. Stage by name only (never `git add .`): `git add src/components/TagPicker.tsx src/components/TagPicker.test.tsx src/lib/useTimer.ts src/components/TimerScreen.tsx src/timer.css src/components/TimerScreen.test.tsx src/lib/useTimer.hook.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md packets/PACKET_10C2_TAG_PICKER.md`
20. Commit: `git commit -m "10C2: the tag picker on the Pro Timer (TagPicker.tsx, tag AB:TIMER.TAGS, pill above Start and slide-up list on a phone, chips on a wide screen, the tag goes with Start, the tag of a running session in the dial; useTimer keeps the list and the pick; no SQL)"`
21. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 6 lines, suggest nothing, start nothing)
`DONE 10C2` then: the two raw lines of step 13, the raw `Test Files` and `Tests` lines of step 15 (as one line), the raw `Found` line of step 16, and `git log --oneline -1`.

## PART 2: OWNER BY HAND (a look at the screen; nothing in Supabase)
This packet changes no SQL, so there is NOTHING to run in the Supabase dashboard. The agent can only run tests, so you look at the real screen yourself. Do it after the agent has pushed.
1. Start the app on your computer (`npm run dev`) and open the Pro Timer (`#timer`) on your PHONE the way you looked at Packets 06C to 08G. If you have no way to do that yet: `npm run dev -- --host` prints a line `Network:` with an address; open that address on the phone (same Wi-Fi). If the sign-in does not work on that address, tell the planner what you see: that is not a failure of this packet.
2. On the phone, with nothing running, you must see: an outlined pill that says `No tag` standing just above the white Start button, and the dial as big as before (Start must not be pushed under the bottom edge). Tap the pill: a dark layer and a list slide up from the bottom, with ONE row, `No tag`, highlighted. Tap the dark part: the list closes. Tap the pill and then the row `No tag`: it closes too. Press Start: the pill goes away, and NO tag line shows in the dial (the session has no tag). End the session as always. After it ends the pill is back and says `No tag`.
3. On the laptop (a wide window), with nothing running: no pill, and ONE chip, `No tag`, above Start (white, because it is chosen). Press Start and end it as always.
4. You will NOT see a real tag: no tag can be made before Packet 10D. The rows, the chips with tags, the tag line in the dial and the message for a tag that went away are proved by the 85 new tests with made-up tags only. This is accepted (DECISIONS_TAGS.md section 4, entry C8).
5. Send the planner the agent's report (`DONE 10C2` and its lines) and what you saw in steps 2 and 3 (short; a photo of the phone is welcome). Stop `npm run dev` when you are done. This packet PASSES only when the agent's report matches the expected lines AND steps 2 and 3 look as described. If the look is not right, say what is wrong: every size, word and place below is a DEFAULT that can change.

## WHAT THE NEW CODE DOES (for the owner and the later packets)
- **The hook (`useTimer.ts`).** `TimerView` has five new things: `tags` (the person's live tags, oldest first, as `timerTagList` gives them), `tagId` (the tag picked before Start, `null` for no tag), `runningTag` (the name of the tag of the running session, taken from `row.tag`, `null` for no tag), and the two calls `chooseTag(id | null)` and `reloadTags()`. The list is read once when the screen opens (inside the effect that already reads the state at the start, so the 30 second reading never reads it) and again each time the picker opens its list. An answer that is not the newest loses against a newer one. A list that cannot be read is left as it was and shows NO problem: the timer must work with "No tag" only. `chooseTag` counts only while no session exists and only for a tag that is in the list. The pick is used up as soon as ANY reading has a running session (started here or on another device), so every session starts with no tag and after a session the pick is none. Start sends `timerStart(zone)` with ONE argument when nothing is picked (exactly what it sent before tags) and `timerStart(zone, tagId)` with a pick. If the database answers `TAG_NOT_FOUND` to a Start (the tag was removed on another device), the pick is dropped, the list is read again and the plain words of Packet 10B show, with Try again.
- **The picker (`TagPicker.tsx`, new tag `AB:TIMER.TAGS`).** One component with three parts that are all in the page on every screen size; the css decides which is seen. The pill (phone): outlined, 44 px, shows the choice (a long name is cut with an ellipsis), `aria-haspopup`, `aria-expanded` and `aria-label="Tag: <name>"`, off when Start is off. The sheet (only while open): a fixed layer over the whole window with a plain dim layer (no blur, C25) and a panel that slides up with `role="dialog"`; rows are at least 48 px, `No tag` first; focus goes to the PANEL when it opens (not to a row, as in the stop alert) and back to the pill when it closes; Tab stays inside the panel; Escape and a tap on the dim layer close it without a change. The chips (wide screen): 40 px, wrapping, the chosen one is white like Start. A tag name is always shown as text, never as markup.
- **The screen (`TimerScreen.tsx`).** While no session runs and the first reading is done, the picker is the FIRST thing inside the buttons box, above Start. While the first reading is on its way, a faint blank 44 px pill stands there (it grows into the real pill and Start). While a session runs or is paused there is no picker, and when its tag is not `null` one small line (`ab-tag-line`, `role="note"`) shows inside the dial after the day total. The children of the main element (background, dial, side) do not change.
- **The look (`timer.css`).** A new part between the screen's part and the moving background's part. The pill is 44 px and the buttons box gap is 14 px, so 44 + 14 + 58 (Start) = 116 fits in the 124 px of the box: the phone reserve of the dial does not change (C40). The tag line has a negative bottom margin that takes back its own line and the 8 px gap, so the two clocks do not move when it comes. The part has its own motion rule (no sliding and no breathing for people who asked for less motion) and its own wide rule: the same two conditions as the wide rule of the screen (C39), written in the OTHER order on purpose (a test counts the screen's header exactly once), and it only switches `display`.
- **Tests.** 85 new: `TagPicker.test.tsx` (28), the screen and the css in `TimerScreen.test.tsx` (13 and 19), the hook in `useTimer.hook.test.ts` (25, with a fake server that now knows the tag list and keeps the tag of a Start). They use made-up tags only.
- **Documents.** `CODE_MAP.md`: the new row `AB:TIMER.TAGS` and short words in the STATE, SCREEN and TESTS rows. `CONNECTIONS.md`: the new C56 (with a check by hand for you), and words changed in C28, C39 (twice), C40 and C55. `PROGRESS.md`: the Done line and the Next line.

## WHAT THE PLANNER HAD TO DECIDE (read them and say which are wrong; all are DEFAULT, except what is marked DECIDED)
DECIDED by the owner (`DECISIONS_TAGS.md` section 4, 17 Oct 2026): pick first, then Start; every session starts with no tag and the app does not remember the last one; Freestyle is a normal choice and means no tag; chips in the pill style, no new library; one pill on the phone that shows the choice and opens the full list. And on 2026-10-17 (entry C8): "do not ask me the small design questions, choose what looks good and write it down". Everything below is the planner's DEFAULT:
1. The pill sits ABOVE Start, full width of the buttons box, 44 px, outlined (so Start stays the one white solid button). It is INSIDE the 124 px buttons box, so the dial does not get smaller.
2. The list is a sheet that slides up from the bottom, with a plain dim layer (60 percent black, no blur), a panel at most 70 percent of the window high, rows of at least 48 px (the locked rule says 44), `No tag` first, then the tags oldest first. A tap on a row chooses and closes; a tap outside or Escape closes without a change. The panel has focus when it opens (not a row), like the stop alert.
3. The sheet lives INSIDE the picker, so the list of children of the main element stays as the existing tests pin it.
4. The wide screen (the same condition as C39): chips, 40 px, wrapping, `No tag` first, the chosen one filled white. The pill and the sheet are not drawn there.
5. While a session runs: no pill, no chips, no change of tag. One small line with the tag's name inside the dial after the day total (colour like the small clock, at most 84 percent of the dial wide, cut with an ellipsis). Nothing for a session with no tag. The line takes no height.
6. While the first reading is on its way there is a blank 44 px pill (not a "Loading" word), so nothing jumps when the real pill comes.
7. The list of tags is read once when the screen opens and again each time the list is opened (so a tag added or removed on another device shows), never by the 30 second reading. A list that cannot be read shows no problem and leaves the old list.
8. The pick is used up as soon as ANY reading has a running session, also one that was started on another device. A pick whose tag is no longer in a list that was just read is dropped.
9. Start sends ONE argument when nothing is picked. Reason: the existing test `toHaveBeenCalledWith("Asia/Kolkata")` stays true, and a no-tag Start sends exactly what it sent before tags.
10. `TAG_NOT_FOUND` from Start is NOT in the list of conflicts (so the state is not read again, as C28 says): the pick is dropped, the list is read again, and the plain words of Packet 10B show.
11. A new tag `AB:TIMER.TAGS` for the component and its css part (not a new class prefix on the old tags: the classes all start with `ab-tag-`, because the existing tests pin that `.ab-timer-pill` is Start, Pause or Resume and that its parent is the buttons box).
12. `DECISIONS_TAGS.md` is NOT changed (no rule changes), so there is no copy and no hash step in this packet. Its section 9 still lists 10C2 as the next packet; `PROGRESS.md` says it is done.
13. Not done here (later packets): adding a tag (10D), renaming and removing a tag (10E), the Manage tags row in the list, any wording change of the four tag errors.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED on a clean clone of master at `5b19bb3` (the edits and the two new files applied, then `npm ci`):
  - LF, and four copies with every text file except the css in CRLF (the edits written with LF new lines and with CRLF new lines, and the two new files with LF and with CRLF; the css stays LF in this test, as in 10B and 10C1: the css tests of `LineText` and `TimerScreen` fail on the UNCHANGED project when `src/timer.css` has CRLF, and your earlier runs passed them, so your css is not CRLF). On all five: `node scripts/check-tags.mjs` printed the two lines of step 13, `npx tsc -b` exit 0, `npm test` printed 23 files and 1276 tests, `npm run lint -- --format=default` printed `Found 19 warnings and 0 errors.` (the same 19 as on master), `npm run build` built.
  - The packet applied by a script that reads ONLY THIS FILE gives, on LF, exactly the same files as the direct edits (`diff -r`: identical), and on all four CRLF ways the same files apart from the line ends. The checks above were run on these copies that were made from the packet text.
  - 79 deliberate breaks, one at a time, on the finished tree (the hook: the list, the pick, what Start sends, TAG_NOT_FOUND; the screen: when the picker is there, the blank pill, the tag line; the picker: words, aria attributes, open and close, focus, Escape, Tab, chips, markup; the css: sizes, the two wide rules, blur, z-index, reduced motion, the tag line margin; the anchors, the end tag, `CODE_MAP.md` and `CONNECTIONS.md`): all 79 are noticed. 73 by `npm test`; 6 only by `check-tags` (a changed anchor line, a renamed end tag, a renamed test, `CODE_MAP.md` and `CONNECTIONS.md`), which is where a change of such a line belongs. Two breaks were NOT noticed the first time: a Start refused with TAG_NOT_FOUND that does not drop the pick (the list read after it dropped the pick anyway) and a picker wrapper that is no longer `display: contents`. One test was added for each (the suite went from 1274 to 1276 tests) and both breaks were run again and are noticed. The list is in `reference/MUTATIONS_APP_10c2.log` of the planner's zip.
- NOT TESTED: the real screen, on a phone or on a laptop (Part 2 is that test, by you: sizes, the slide, the dim layer, how it feels to tap); the real Supabase (the picker reads the list with the call of Packet 10B, which was tested with a made-up database client; there is no tag in your account to show yet); a real tag name on the screen (no tag can be made before Packet 10D); the feel of the focus and Tab rules with a real keyboard or screen reader; the look in a browser that asks for less motion.

## THINGS TO KNOW (no check is possible)
- On the phone you will see only `No tag` until Packet 10D lets you add a tag. Everything with real tags is proved by tests with made-up tags only.
- The words of `TAG_NOT_FOUND` (Packet 10B, `DECISIONS_TAGS.md` section 5) end with "Close the list and open it again." That is a little odd when this comes from Start and the list was already closed. A cheap change for a later packet (the words are in `problemText`, and tested there).
- On the wide screen the chips make the idle side column taller than the running one, so the centred column moves a little when a session starts and when the first reading arrives. Known and accepted; cheap to change after you have seen it.
- If the window gets wide while the list is open (a phone turned sideways), the list disappears from view but stays "open" inside the picker; Escape closes it, and it shows again if the window gets narrow again. Cheap to fix later.
- If you change anything about the picker, change together (CONNECTIONS.md C56 says so): `useTimer.ts` (`tags`, `tagId`, `runningTag`, `chooseTag`, `reloadTags`, the one-argument call of `timerStart`, the `TAG_NOT_FOUND` branch), `TagPicker.tsx`, the three lines of `TimerScreen.tsx` that draw the picker, the blank pill and the tag line, the css part of the picker, and the tests. The two wide rules of `timer.css` (the screen's and the picker's) must keep the same two conditions; a test compares them.
- The css files stay LF in the planner's CRLF test: the css tests of `LineText` and `TimerScreen` already fail on the UNCHANGED project when `src/timer.css` has CRLF. Your 10A, 10B and 10C1 runs passed them, so your css is not CRLF. The new css tests are written like the old ones.
- Still open from before (not part of the tags work): `DECISIONS_DAY_SCORE.md` section 4a contradicts its section 2; `supabase/day_score.sql` line 15 still says the tag is "not built yet"; four SQL breaks of 10A are caught only by the planner's SQL behaviour test, which is not in the repository.

## NEW FILE (src/components/TagPicker.tsx)

**THE PICKER.** Create the file `src/components/TagPicker.tsx`. It must NOT exist yet (step 2 checked that). Write the lines between BEGIN TEXT and END TEXT exactly as they are, with the line breaks that the other files of `src/components` use, and ONE line break after the last line. Change nothing in them: not a space, not a quote, not a comment.

CREATE THE FILE WITH THIS TEXT (the file must not exist yet; if it does, STOP):
BEGIN TEXT
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import type { TimerTag } from "@/lib/timerApi"
import "../timer.css"

// AB:TIMER.TAGS:START
// The tag picker of the Pro Timer (Packet 10C2): the person chooses the tag BEFORE pressing Start (DECISIONS_TAGS.md section 4, CONNECTIONS.md C56). TimerScreen.tsx shows it as the first thing inside the buttons box, only while no session runs; the choice itself lives in useTimer.ts (tagId, chooseTag, reloadTags) and goes to the database with Start.
// "No tag" (Freestyle) is always the first choice and the one every new session starts with. The tags follow in the order the hook gives them (oldest first). A tag name is shown as plain text, never as markup.
// On a phone (the one-column screen) it is ONE pill above Start that shows the current choice. Tapping it asks the hook to read the list again and opens the sheet: a plain dim layer over the whole screen (no blur, C25) with a panel that slides up from the bottom. Tapping a row chooses it and closes the sheet; tapping the dim layer or pressing Escape closes it without a change. Focus goes to the panel (not to a row, as in StopAlert.tsx) and comes back to the pill when the sheet closes. Tab stays inside the panel while it is open.
// On a wide screen (the same condition as C39) the pill and the sheet are not drawn (timer.css): every tag stands there as a chip in a wrapping row, "No tag" first, and tapping a chip chooses it. Both versions are always in the page; the css decides which one is seen.
// The picker has no adding, renaming or removing of tags (Packets 10D and 10E).
// The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type TagPickerProps = {
  tags: TimerTag[]
  tagId: string | null
  disabled: boolean
  onChoose: (id: string | null) => void
  onOpen: () => void
}

const NO_TAG = "No tag"

export default function TagPicker({ tags, tagId, disabled, onChoose, onOpen }: TagPickerProps) {
  const [open, setOpen] = useState(false)
  const pillRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const current = tagId === null ? undefined : tags.find((tag) => tag.id === tagId)
  const label = current === undefined ? NO_TAG : current.name

  // Closing returns the focus to the pill, so that a keyboard person is where they were.
  function close() {
    setOpen(false)
    pillRef.current?.focus()
  }

  function openList() {
    onOpen()
    setOpen(true)
  }

  function choose(id: string | null) {
    onChoose(id)
    close()
  }

  // While the sheet is open: focus goes to the panel, and Escape closes the sheet without a change.
  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        pillRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  // Tab stays inside the panel: from the last row it goes to the first one and back (the panel itself counts as the place before the first row).
  function trap(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return
    const rows = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])
    if (rows.length === 0) return
    const first = rows[0]
    const last = rows[rows.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="ab-tag-picker">
      <button
        className="ab-tag-pill"
        type="button"
        ref={pillRef}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={"Tag: " + label}
        onClick={openList}
      >
        <span className="ab-tag-pill-text">{label}</span>
        <span className="ab-tag-chevron" aria-hidden="true" />
      </button>
      <div className="ab-tag-chips" role="group" aria-label="Tag">
        <button className="ab-tag-chip" type="button" disabled={disabled} aria-pressed={tagId === null} onClick={() => onChoose(null)}>
          {NO_TAG}
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="ab-tag-chip"
            type="button"
            disabled={disabled}
            aria-pressed={tag.id === tagId}
            onClick={() => onChoose(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
      {open ? (
        <div className="ab-tag-sheet">
          <div className="ab-tag-scrim" aria-hidden="true" onClick={close} />
          <div className="ab-tag-panel" role="dialog" aria-modal="true" aria-label="Choose a tag" tabIndex={-1} ref={panelRef} onKeyDown={trap}>
            <button className="ab-tag-row" type="button" aria-pressed={tagId === null} onClick={() => choose(null)}>
              {NO_TAG}
            </button>
            {tags.map((tag) => (
              <button key={tag.id} className="ab-tag-row" type="button" aria-pressed={tag.id === tagId} onClick={() => choose(tag.id)}>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
// AB:TIMER.TAGS:END
END TEXT

## NEW FILE (src/components/TagPicker.test.tsx)

**THE TESTS OF THE PICKER.** Create the file `src/components/TagPicker.test.tsx`. It must NOT exist yet (step 2 checked that). Write the lines between BEGIN TEXT and END TEXT exactly as they are, with the line breaks that the other files of `src/components` use, and ONE line break after the last line. Change nothing in them: not a space, not a quote, not a comment.

CREATE THE FILE WITH THIS TEXT (the file must not exist yet; if it does, STOP):
BEGIN TEXT
// @vitest-environment jsdom
/// <reference types="node" />
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { TimerTag } from "@/lib/timerApi"
import TagPicker from "./TagPicker"

// AB:TIMER.TESTS:START
// The tag picker (TagPicker.tsx, Packet 10C2): what it shows, how the sheet opens and closes, where the focus goes, and what it hands to the hook. The css is not read here (vitest turns an imported css file into nothing), so the pill, the chips and the sheet are all in the page; the look is tested in TimerScreen.test.tsx. CONNECTIONS.md C56.
const WORK: TimerTag = { id: "t-work", name: "Work" }
const STUDY: TimerTag = { id: "t-study", name: "Study" }
const READ: TimerTag = { id: "t-read", name: "Reading" }

let root: Root | null = null
let container: HTMLElement | null = null

type Props = Partial<Parameters<typeof TagPicker>[0]>
function show(over: Props = {}) {
  const props = { tags: [WORK, STUDY, READ], tagId: null, disabled: false, onChoose: vi.fn(), onOpen: vi.fn(), ...over }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(TagPicker, props)))
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

function key(target: EventTarget, name: string, shift = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: name, shiftKey: shift, bubbles: true, cancelable: true })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

function openSheet() {
  click(q(".ab-tag-pill"))
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

describe("TagPicker: the pill", () => {
  it("shows No tag at first, as a button that opens a dialog and is closed", () => {
    show()
    const pill = q(".ab-tag-pill")
    expect(pill.tagName).toBe("BUTTON")
    expect(pill.getAttribute("type")).toBe("button")
    expect(pill.textContent).toBe("No tag")
    expect(pill.getAttribute("aria-label")).toBe("Tag: No tag")
    expect(pill.getAttribute("aria-haspopup")).toBe("dialog")
    expect(pill.getAttribute("aria-expanded")).toBe("false")
  })

  it("shows the name of the picked tag", () => {
    show({ tagId: STUDY.id })
    expect(q(".ab-tag-pill").textContent).toBe("Study")
    expect(q(".ab-tag-pill").getAttribute("aria-label")).toBe("Tag: Study")
  })

  it("shows No tag when the pick is not in the list (the list is the truth)", () => {
    show({ tagId: "t-gone" })
    expect(q(".ab-tag-pill").textContent).toBe("No tag")
  })

  it("shows a long name whole in the page (the css cuts it with an ellipsis) and a name with markup as plain text", () => {
    const long = "A".repeat(20)
    const odd: TimerTag = { id: "t-odd", name: "<b>bold</b> & <i>x</i>" }
    show({ tags: [{ id: "t-long", name: long }, odd], tagId: "t-long" })
    expect(q(".ab-tag-pill-text").textContent).toBe(long)
    show({ tags: [{ id: "t-long", name: long }, odd], tagId: odd.id })
    expect(q(".ab-tag-pill-text").textContent).toBe("<b>bold</b> & <i>x</i>")
    expect(has(".ab-tag-picker b")).toBe(false)
    expect(has(".ab-tag-picker i")).toBe(false)
  })

  it("is a disabled button when the screen is not ready, and then does not open", () => {
    const props = show({ disabled: true })
    const pill = q(".ab-tag-pill") as HTMLButtonElement
    expect(pill.disabled).toBe(true)
    click(pill)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(props.onOpen).not.toHaveBeenCalled()
  })

  it("draws a small arrow that is hidden from the screen reader", () => {
    show()
    expect(q(".ab-tag-chevron").getAttribute("aria-hidden")).toBe("true")
  })
})

describe("TagPicker: the sheet", () => {
  it("is not in the page until the pill is tapped", () => {
    show()
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(has(".ab-tag-panel")).toBe(false)
  })

  it("opens on a tap of the pill, asks the hook to read the list once, and is a modal dialog with a name", () => {
    const props = show()
    openSheet()
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(has(".ab-tag-sheet")).toBe(true)
    const panel = q(".ab-tag-panel")
    expect(panel.getAttribute("role")).toBe("dialog")
    expect(panel.getAttribute("aria-modal")).toBe("true")
    expect(panel.getAttribute("aria-label")).toBe("Choose a tag")
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("true")
  })

  it("puts the focus on the panel, not on a row, so that a key still held can never choose a tag", () => {
    show()
    openSheet()
    expect(document.activeElement).toBe(q(".ab-tag-panel"))
    expect(q(".ab-tag-panel").getAttribute("tabindex")).toBe("-1")
  })

  it("lists No tag first and then the tags in the order the hook gave them, as buttons", () => {
    show()
    openSheet()
    const rows = all(".ab-tag-row")
    expect(rows.map((r) => r.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
    for (const row of rows) {
      expect(row.tagName).toBe("BUTTON")
      expect(row.getAttribute("type")).toBe("button")
    }
  })

  it("marks the chosen row (aria-pressed) and only that one", () => {
    show({ tagId: STUDY.id })
    openSheet()
    expect(all(".ab-tag-row").map((r) => r.getAttribute("aria-pressed"))).toEqual(["false", "false", "true", "false"])
    show({ tagId: null })
    expect(all(".ab-tag-row").map((r) => r.getAttribute("aria-pressed"))).toEqual(["true", "false", "false", "false"])
  })

  it("shows only No tag when the person has no tags yet (nothing can be added before Packet 10D)", () => {
    show({ tags: [] })
    openSheet()
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag"])
  })

  it("chooses a tag with a tap on its row, closes, and puts the focus back on the pill", () => {
    const props = show()
    openSheet()
    click(all(".ab-tag-row")[2])
    expect(props.onChoose).toHaveBeenCalledTimes(1)
    expect(props.onChoose).toHaveBeenCalledWith(STUDY.id)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("chooses no tag with the first row (the value is null, not an empty text)", () => {
    const props = show({ tagId: WORK.id })
    openSheet()
    click(all(".ab-tag-row")[0])
    expect(props.onChoose).toHaveBeenCalledWith(null)
  })

  it("closes without a change when the dim layer is tapped", () => {
    const props = show({ tagId: WORK.id })
    openSheet()
    click(q(".ab-tag-scrim"))
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("closes without a change on Escape, and the focus goes back to the pill", () => {
    const props = show()
    openSheet()
    key(document, "Escape")
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("ignores Escape while the sheet is closed (the focus stays where it was)", () => {
    show()
    const outside = document.createElement("input")
    document.body.appendChild(outside)
    outside.focus()
    key(document, "Escape")
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it("ignores other keys while open", () => {
    show()
    openSheet()
    key(document, "a")
    key(document, "Enter")
    expect(has(".ab-tag-sheet")).toBe(true)
  })

  it("takes its key listener off the document when it closes and when it is unmounted while open", () => {
    const removed = vi.spyOn(document, "removeEventListener")
    show()
    openSheet()
    key(document, "Escape")
    expect(removed.mock.calls.filter((c) => c[0] === "keydown").length).toBeGreaterThanOrEqual(1)
    removed.mockClear()
    openSheet()
    act(() => root?.unmount())
    root = null
    expect(removed.mock.calls.filter((c) => c[0] === "keydown").length).toBeGreaterThanOrEqual(1)
  })

  it("keeps Tab inside the panel: from the last row to the first one, and Shift+Tab from the first row (or the panel) to the last", () => {
    show()
    openSheet()
    const rows = all(".ab-tag-row")
    rows[rows.length - 1].focus()
    const forward = key(rows[rows.length - 1], "Tab")
    expect(forward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(rows[0])
    const back = key(rows[0], "Tab", true)
    expect(back.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(rows[rows.length - 1])
    q(".ab-tag-panel").focus()
    const fromPanel = key(q(".ab-tag-panel"), "Tab", true)
    expect(fromPanel.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(rows[rows.length - 1])
  })

  it("lets Tab go on by itself everywhere else in the panel", () => {
    show()
    openSheet()
    const rows = all(".ab-tag-row")
    rows[1].focus()
    expect(key(rows[1], "Tab").defaultPrevented).toBe(false)
    expect(key(rows[1], "Tab", true).defaultPrevented).toBe(false)
    expect(key(rows[1], "Enter").defaultPrevented).toBe(false)
  })

  it("shows a list that the hook changes while it is open (the list is read again when it opens)", () => {
    show({ tags: [WORK] })
    openSheet()
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag", "Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag", "Work", "Study"])
  })

  it("renders a name as text only in the rows too", () => {
    show({ tags: [{ id: "t-odd", name: "<img src=x onerror=alert(1)>" }] })
    openSheet()
    expect(all(".ab-tag-row")[1].textContent).toBe("<img src=x onerror=alert(1)>")
    expect(has(".ab-tag-panel img")).toBe(false)
  })
})

describe("TagPicker: the chips of the wide screen", () => {
  it("are one group with a name, No tag first and then the tags in order, as buttons", () => {
    show()
    const group = q(".ab-tag-chips")
    expect(group.getAttribute("role")).toBe("group")
    expect(group.getAttribute("aria-label")).toBe("Tag")
    const chips = all(".ab-tag-chip")
    expect(chips.map((c) => c.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
    for (const chip of chips) expect(chip.getAttribute("type")).toBe("button")
  })

  it("mark the chosen chip (aria-pressed) and only that one", () => {
    show({ tagId: READ.id })
    expect(all(".ab-tag-chip").map((c) => c.getAttribute("aria-pressed"))).toEqual(["false", "false", "false", "true"])
    show({ tagId: null })
    expect(all(".ab-tag-chip").map((c) => c.getAttribute("aria-pressed"))).toEqual(["true", "false", "false", "false"])
  })

  it("choose a tag with one tap, and null for No tag, without opening anything or reading the list", () => {
    const props = show()
    click(all(".ab-tag-chip")[1])
    expect(props.onChoose).toHaveBeenLastCalledWith(WORK.id)
    click(all(".ab-tag-chip")[0])
    expect(props.onChoose).toHaveBeenLastCalledWith(null)
    expect(props.onChoose).toHaveBeenCalledTimes(2)
    expect(props.onOpen).not.toHaveBeenCalled()
    expect(has(".ab-tag-sheet")).toBe(false)
  })

  it("are disabled when the screen is not ready, as the pill is", () => {
    const props = show({ disabled: true })
    for (const chip of all(".ab-tag-chip")) expect((chip as HTMLButtonElement).disabled).toBe(true)
    click(all(".ab-tag-chip")[1])
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("show a name as text only", () => {
    show({ tags: [{ id: "t-odd", name: "<u>x</u>" }] })
    expect(all(".ab-tag-chip")[1].textContent).toBe("<u>x</u>")
    expect(has(".ab-tag-chips u")).toBe(false)
  })
})
// AB:TIMER.TESTS:END
END TEXT

## EDITS OF THE LIVE STATE (src/lib/useTimer.ts)

**Edit 1** (import: the call that reads the list of tags)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  timerState,
END TEXT

REPLACE WITH:
BEGIN TEXT
  timerState,
  timerTagList,
END TEXT

**Edit 2** (import: the type of one tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  type TimerErrorKind,
END TEXT

REPLACE WITH:
BEGIN TEXT
  type TimerErrorKind,
  type TimerTag,
END TEXT

**Edit 3** (the comment of the part says what the tags do in the hook)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// What is tied to the database and the screen: see CONNECTIONS.md C28, C29, C30, C43, C45, C48 and C51. The names used by the screen are in TimerView.
END TEXT

REPLACE WITH:
BEGIN TEXT
// The tags (Packet 10C2): the hook keeps the list of the person's live tags (read once when the screen opens and again each time the picker opens its list, never by the 30 second poll; a list that cannot be read never stops the timer) and the tag that was picked before Start (tagId: none at first, and back to none as soon as any session is running, so every session starts with no tag). Start sends the picked tag only when there is one: with no tag it is the same call as before tags. chooseTag only works while nothing runs and only for a tag that is in the list. A Start that the database refuses with TAG_NOT_FOUND (the tag was archived on another device) sets the pick back to no tag, reads the list again and shows the plain words of problemText. runningTag is the name of the tag of the running session as the database sends it (C55), or null for no tag. See CONNECTIONS.md C56.
// What is tied to the database and the screen: see CONNECTIONS.md C28, C29, C30, C43, C45, C48, C51 and C56. The names used by the screen are in TimerView.
END TEXT

**Edit 4** (TimerView: the list, the pick and the tag of the running session)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  milestone: MilestoneView | null
END TEXT

REPLACE WITH:
BEGIN TEXT
  milestone: MilestoneView | null
  tags: TimerTag[]
  tagId: string | null
  runningTag: string | null
END TEXT

**Edit 5** (TimerView: the two calls of the picker)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  clearMilestone: () => void
END TEXT

REPLACE WITH:
BEGIN TEXT
  clearMilestone: () => void
  chooseTag: (id: string | null) => void
  reloadTags: () => void
END TEXT

**Edit 6** (state: the list and the pick)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const [milestone, setMilestone] = useState<MilestoneState | null>(null)
END TEXT

REPLACE WITH:
BEGIN TEXT
  const [milestone, setMilestone] = useState<MilestoneState | null>(null)
  const [tags, setTags] = useState<TimerTag[]>([])
  const [tagId, setTagId] = useState<string | null>(null)
END TEXT

**Edit 7** (refs: what the buttons read)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const doneRef = useRef<MilestonesDone | null>(null)
END TEXT

REPLACE WITH:
BEGIN TEXT
  const doneRef = useRef<MilestonesDone | null>(null)
  // The tags (Packet 10C2): the refs are what the buttons read, the state is what the screen draws. The ticket makes an old answer of the list lose against a newer one.
  const tagsRef = useRef<TimerTag[]>([])
  const tagIdRef = useRef<string | null>(null)
  const tagTicketRef = useRef(0)
END TEXT

**Edit 8** (showTagId, loadTags, chooseTag and reloadTags come after clearMilestone)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const clearMilestone = useCallback(() => showMilestone(null), [showMilestone])
END TEXT

REPLACE WITH:
BEGIN TEXT
  const clearMilestone = useCallback(() => showMilestone(null), [showMilestone])

  const showTagId = useCallback((next: string | null) => {
    tagIdRef.current = next
    setTagId(next)
  }, [])

  // Reads the person's live tags for the picker (Packet 10C2, CONNECTIONS.md C56): once when the screen opens and each time the picker opens its list, never in the poll. The list only serves the picker: when it cannot be read, the timer goes on working (Start with no tag always works) and the next opening of the list reads it again. A pick that is not in the list any more (the tag was archived on another device) goes back to no tag.
  const loadTags = useCallback(async () => {
    const ticket = ++tagTicketRef.current
    try {
      const list = await timerTagList()
      if (!aliveRef.current || ticket !== tagTicketRef.current) return
      tagsRef.current = list
      setTags(list)
      if (tagIdRef.current !== null && !list.some((tag) => tag.id === tagIdRef.current)) showTagId(null)
    } catch {
      // Left as it is on purpose, see above.
    }
  }, [showTagId])

  // The two calls of the picker. chooseTag only counts while nothing runs (the database has no call to change the tag of a running session) and only for a tag that is in the list. reloadTags reads the list again when the picker opens it.
  const chooseTag = useCallback(
    (id: string | null) => {
      if ((readingRef.current?.row ?? null) !== null) return
      if (id !== null && !tagsRef.current.some((tag) => tag.id === id)) return
      showTagId(id)
    },
    [showTagId],
  )
  const reloadTags = useCallback(() => void loadTags(), [loadTags])
END TEXT

**Edit 9** (adopt: the pick is used up as soon as a session runs)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
      if (pendingRef.current !== null && !pendingMatches(pendingRef.current, next.row)) pendingRef.current = null
END TEXT

REPLACE WITH:
BEGIN TEXT
      if (pendingRef.current !== null && !pendingMatches(pendingRef.current, next.row)) pendingRef.current = null
      // The pick made before Start is used up as soon as any session runs (started here or on another device), so the next session starts with no tag again.
      if (next.row !== null && tagIdRef.current !== null) showTagId(null)
END TEXT

**Edit 10** (adopt: its list of dependencies)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    [showComeback, showMilestone],
END TEXT

REPLACE WITH:
BEGIN TEXT
    [showComeback, showMilestone, showTagId],
END TEXT

**Edit 11** (act: the tag that Start sends is read before the call)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
          const pending = kind === "resume" && pendingMatches(pendingRef.current, before?.row ?? null) ? pendingRef.current : null
END TEXT

REPLACE WITH:
BEGIN TEXT
          const pending = kind === "resume" && pendingMatches(pendingRef.current, before?.row ?? null) ? pendingRef.current : null
          // Start sends the tag picked before it. With no pick the call has one argument, exactly as before tags (CONNECTIONS.md C56).
          const tagToSend = kind === "start" ? tagIdRef.current : null
END TEXT

**Edit 12** (act: Start with a tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
            kind === "start" ? await timerStart(deviceTimeZone()) : kind === "pause" ? await timerPause() : await timerResume()
END TEXT

REPLACE WITH:
BEGIN TEXT
            kind === "start"
              ? await (tagToSend === null ? timerStart(deviceTimeZone()) : timerStart(deviceTimeZone(), tagToSend))
              : kind === "pause"
                ? await timerPause()
                : await timerResume()
END TEXT

**Edit 13** (act: a tag that went away between the pick and Start)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
        else fail(error)
END TEXT

REPLACE WITH:
BEGIN TEXT
        else {
          // A tag that is gone (archived on another device) between the pick and Start: the pick goes back to no tag and the list is read again, then the plain words of problemText are shown (CONNECTIONS.md C56).
          if (kind === "start" && error instanceof TimerError && error.kind === "TAG_NOT_FOUND") {
            showTagId(null)
            void loadTags()
          }
          fail(error)
        }
END TEXT

**Edit 14** (act: its list of dependencies)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    [adopt, fail, refresh, showAlert, showComeback],
END TEXT

REPLACE WITH:
BEGIN TEXT
    [adopt, fail, loadTags, refresh, showAlert, showComeback, showTagId],
END TEXT

**Edit 15** (the list of tags is read once when the screen opens: inside the effect that already reads the state at the start)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    aliveRef.current = true
END TEXT

REPLACE WITH:
BEGIN TEXT
    aliveRef.current = true
    // The list of tags is read once when the screen opens (loadTags). The picker reads it again each time it opens its list; the 30 second poll never does.
    void loadTags()
END TEXT

**Edit 16** (that effect now depends on loadTags too)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  }, [refresh, showLink])
END TEXT

REPLACE WITH:
BEGIN TEXT
  }, [loadTags, refresh, showLink])
END TEXT

**Edit 17** (the view gives the list, the pick and the tag of the running session)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    milestone: milestoneMatches(milestone, row) ? { line: milestone.line, earlier: milestone.earlier } : null,
END TEXT

REPLACE WITH:
BEGIN TEXT
    milestone: milestoneMatches(milestone, row) ? { line: milestone.line, earlier: milestone.earlier } : null,
    tags,
    tagId,
    runningTag: row === null ? null : (row.tag?.name ?? null),
END TEXT

**Edit 18** (the view gives the two calls of the picker)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    clearMilestone,
END TEXT

REPLACE WITH:
BEGIN TEXT
    clearMilestone,
    chooseTag,
    reloadTags,
END TEXT

## EDITS OF THE SCREEN (src/components/TimerScreen.tsx)

**Edit 1** (import: the picker)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
import StopAlert from "@/components/StopAlert"
END TEXT

REPLACE WITH:
BEGIN TEXT
import StopAlert from "@/components/StopAlert"
import TagPicker from "@/components/TagPicker"
END TEXT

**Edit 2** (the comment of the screen says where the picker stands and what shows the tag of a running session)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
 The tags and the rest that come later go into that box too.
END TEXT

REPLACE WITH:
BEGIN TEXT
 While no session runs, the tag picker (TagPicker.tsx, Packet 10C2) is the first thing inside the buttons box, above Start: a blank pill while the first reading is on its way, the pill (phone) or the chips (wide screen) after it. While a session runs there is no picker; the name of its tag is one small line inside the dial under the day total (ab-tag-line), and nothing for a session with no tag (see CONNECTIONS.md C56). The rest that comes later goes into the side box too.
END TEXT

**Edit 3** (the name of the tag of the running session under the day total)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
          <p className="ab-timer-small">{formatClock(timer.dayTotal)}</p>
END TEXT

REPLACE WITH:
BEGIN TEXT
          <p className="ab-timer-small">{formatClock(timer.dayTotal)}</p>
          {timer.runningTag === null ? null : (
            <p className="ab-tag-line" role="note" aria-label={"Tag: " + timer.runningTag}>
              {timer.runningTag}
            </p>
          )}
END TEXT

**Edit 4** (the blank tag pill while loading and the picker while idle, first inside the buttons box)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
        <div className="ab-timer-actions">
END TEXT

REPLACE WITH:
BEGIN TEXT
        <div className="ab-timer-actions">
          {timer.link === "loading" ? <div className="ab-tag-wait" aria-hidden="true" /> : null}
          {timer.link !== "loading" && timer.status === "idle" ? (
            <TagPicker tags={timer.tags} tagId={timer.tagId} disabled={!ready} onChoose={timer.chooseTag} onOpen={timer.reloadTags} />
          ) : null}
END TEXT

## EDITS OF THE LOOK (src/timer.css)

**Edit 1** (the look of the tag picker sits right before the part of the moving background)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
/* AB:TIMER.BG:START */
END TEXT

REPLACE WITH:
BEGIN TEXT
/* AB:TIMER.TAGS:START */
/* The tag picker (TagPicker.tsx, Packet 10C2, CONNECTIONS.md C56). It stands inside the buttons box, above Start, only while no session runs. On a phone: one outlined pill (44 px) that shows the choice, and the slide-up sheet. On a wide screen: the pill and the sheet are not drawn and the chips are. The pill (44 px) and the gap (14 px) fit into the 124 px of the buttons box next to the 58 px Start pill, so the phone reserve of the dial does not change (C40). The wrapper is no box at all, so its children are laid out by the buttons box. */
.ab-tag-picker {
  display: contents;
}

/* The blank pill that stands where the tag pill will be while the first reading is on its way: the size of the tag pill, faint, breathing slowly like the blank Start pill (C46). It is not a button and has no text. */
.ab-tag-wait {
  width: 100%;
  height: 44px;
  border-radius: 999px;
  background: #fff;
  opacity: 0.18;
  animation: ab-tag-wait 1.4s ease-in-out infinite;
}

@keyframes ab-tag-wait {
  50% {
    opacity: 0.3;
  }
}

/* The pill: outlined, so that Start stays the one white solid button. The name is cut with an ellipsis when it is long. */
.ab-tag-pill {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 44px;
  padding: 0 20px;
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  cursor: pointer;
}

.ab-tag-pill:disabled {
  opacity: 0.4;
  cursor: default;
}

.ab-tag-pill:active:enabled {
  transform: scale(0.98);
}

.ab-tag-pill-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* A small arrow made of two borders that points up, to say that the list slides up. */
.ab-tag-chevron {
  flex: none;
  width: 8px;
  height: 8px;
  margin-top: 3px;
  border-top: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

/* The chips are only for the wide screen (see the rule at the end of this part). */
.ab-tag-chips {
  display: none;
}

/* The sheet: a plain dim layer over the whole screen (no blur behind it: a blur over the moving background made the phone laggy, C25) and the panel at the bottom. It is fixed to the window, so that it covers the screen whatever the buttons box does. */
.ab-tag-sheet {
  position: fixed;
  inset: 0;
  z-index: 2;
}

.ab-tag-scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  animation: ab-tag-fade 200ms ease;
}

.ab-tag-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 70dvh;
  padding: 16px 20px max(20px, env(safe-area-inset-bottom));
  overflow-y: auto;
  background: #111114;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px 20px 0 0;
  outline: none;
  animation: ab-tag-up 240ms ease;
}

.ab-tag-row {
  box-sizing: border-box;
  flex: none;
  width: 100%;
  min-height: 48px;
  padding: 10px 20px;
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  text-align: left;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  cursor: pointer;
  overflow-wrap: anywhere;
}

.ab-tag-row[aria-pressed="true"] {
  color: #000;
  background: #fff;
  border-color: #fff;
}

.ab-tag-row:active {
  transform: scale(0.99);
}

@keyframes ab-tag-fade {
  from {
    opacity: 0;
  }
}

@keyframes ab-tag-up {
  from {
    transform: translateY(100%);
  }
}

/* The chips of the wide screen: they wrap, 40 px high, the chosen one is filled white like Start. */
.ab-tag-chip {
  box-sizing: border-box;
  flex: none;
  max-width: 100%;
  height: 40px;
  padding: 0 16px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ab-tag-chip[aria-pressed="true"] {
  color: #000;
  background: #fff;
  border-color: #fff;
}

.ab-tag-chip:disabled {
  opacity: 0.4;
  cursor: default;
}

/* The name of the tag of the running session: one small line INSIDE the dial, under the day total (TimerScreen.tsx). It takes no height in the centred stack: its line is 1.2em high and the negative bottom margin takes back that line and the 8 px gap above it, so the two clocks stay exactly where they are. The line is cut with an ellipsis when the name is long. */
.ab-tag-line {
  box-sizing: border-box;
  max-width: 84cqw;
  margin: 0 0 calc(-1.2em - 8px);
  overflow: hidden;
  font-size: max(12px, min(1rem, 4.6cqw));
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.6);
  text-shadow: 0 0 14px rgba(0, 0, 0, 0.75), 0 0 4px rgba(0, 0, 0, 0.6);
}

/* A person who asked their device for less motion gets no sliding and no breathing. It is written AFTER the rules it switches off. */
@media (prefers-reduced-motion: reduce) {
  .ab-tag-wait,
  .ab-tag-scrim,
  .ab-tag-panel {
    animation: none;
  }
}

/* The wide screen: the same two conditions as the wide rule of the screen (C39), written in the other order on purpose, so that the one test that counts the wide rule of the screen finds it exactly once. This rule only switches things on and off (display); it must stay AFTER the rules above. */
@media (min-width: 600px) and (min-aspect-ratio: 5/4), (min-width: 1000px) and (min-height: 560px) {
  .ab-tag-pill,
  .ab-tag-wait,
  .ab-tag-sheet {
    display: none;
  }

  .ab-tag-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    width: 100%;
  }
}
/* AB:TIMER.TAGS:END */

/* AB:TIMER.BG:START */
END TEXT

## EDITS OF THE SCREEN TESTS (src/components/TimerScreen.test.tsx)

**Edit 1** (makeView: the list, the pick and the tag of the running session)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    milestone: null,
END TEXT

REPLACE WITH:
BEGIN TEXT
    milestone: null,
    tags: [],
    tagId: null,
    runningTag: null,
END TEXT

**Edit 2** (makeView: the two calls of the picker)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    clearMilestone: vi.fn(),
END TEXT

REPLACE WITH:
BEGIN TEXT
    clearMilestone: vi.fn(),
    chooseTag: vi.fn(),
    reloadTags: vi.fn(),
END TEXT

**Edit 3** (the type of one tag is imported by the tests)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
import type { TimerView } from "@/lib/useTimer"
END TEXT

REPLACE WITH:
BEGIN TEXT
import type { TimerTag } from "@/lib/timerApi"
import type { TimerView } from "@/lib/useTimer"
END TEXT

**Edit 4** (the tests of the picker on the screen, of the tag line and of the css of the picker end the tagged part)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// AB:TIMER.TESTS:END
END TEXT

REPLACE WITH:
BEGIN TEXT
describe("TimerScreen: the tag picker (Packet 10C2)", () => {
  const WORK: TimerTag = { id: "t-work", name: "Work" }
  const STUDY: TimerTag = { id: "t-study", name: "Study" }
  const kidsOfMain = (): string[] => Array.from(q(".ab-timer").children).map((k) => k.id || k.className)

  it("stands first inside the buttons box, directly before Start, while no session runs", () => {
    show({ status: "idle", tags: [WORK, STUDY] })
    const actions = q(".ab-timer-actions")
    expect(actions.firstElementChild).toBe(q(".ab-tag-picker"))
    expect(q(".ab-tag-picker").nextElementSibling).toBe(q(".ab-timer-pill"))
    expect(q(".ab-timer-pill").textContent).toBe("Start")
    expect(q(".ab-timer-pill").parentElement).toBe(actions)
    expect(actions.contains(q(".ab-tag-pill"))).toBe(true)
  })

  it("hands the picker the list, the pick, and the two calls of the hook", () => {
    const view = show({ status: "idle", tags: [WORK, STUDY], tagId: STUDY.id })
    expect(q(".ab-tag-pill").textContent).toBe("Study")
    expect(Array.from(document.querySelectorAll(".ab-tag-chip")).map((c) => c.textContent)).toEqual(["No tag", "Work", "Study"])
    act(() => q(".ab-tag-pill").click())
    expect(view.reloadTags).toHaveBeenCalledTimes(1)
    act(() => Array.from(document.querySelectorAll<HTMLElement>(".ab-tag-row"))[1].click())
    expect(view.chooseTag).toHaveBeenCalledWith(WORK.id)
    act(() => Array.from(document.querySelectorAll<HTMLElement>(".ab-tag-chip"))[0].click())
    expect(view.chooseTag).toHaveBeenLastCalledWith(null)
  })

  it("is as ready as the Start button: off while the screen is busy, offline or has a problem", () => {
    show({ status: "idle", busy: true })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(true)
    expect((q(".ab-timer-pill") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", busy: false, link: "offline" })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "problem", problem: "Something went wrong." })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "online", busy: false })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(false)
    expect((q(".ab-timer-pill") as HTMLButtonElement).disabled).toBe(false)
  })

  it("is not there while a session runs or is paused", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-picker")).toBe(false)
    expect(has(".ab-tag-pill")).toBe(false)
    expect(has(".ab-tag-chip")).toBe(false)
    show({ status: "paused", seconds: 100, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-picker")).toBe(false)
  })

  it("is not there while loading: a faint blank pill stands in its place, before the blank Start pill", () => {
    show({ link: "loading", tags: [WORK] })
    expect(has(".ab-tag-picker")).toBe(false)
    const wait = q(".ab-timer-actions .ab-tag-wait")
    expect(wait.textContent).toBe("")
    expect(wait.getAttribute("aria-hidden")).toBe("true")
    expect(wait.tagName).toBe("DIV")
    expect(wait.nextElementSibling).toBe(q(".ab-timer-wait"))
    expect(q(".ab-timer-actions").firstElementChild).toBe(wait)
    expect(has("button")).toBe(false)
  })

  it("takes the blank tag pill away when the reading is there, and never shows it without a connection or with a problem", () => {
    show({ link: "loading" })
    expect(has(".ab-tag-wait")).toBe(true)
    show({ link: "online", status: "idle" })
    expect(has(".ab-tag-wait")).toBe(false)
    expect(has(".ab-tag-pill")).toBe(true)
    show({ link: "offline", status: "idle" })
    expect(has(".ab-tag-wait")).toBe(false)
    show({ link: "problem", problem: "Something went wrong.", status: "idle" })
    expect(has(".ab-tag-wait")).toBe(false)
  })

  it("keeps the children of the screen as they were, also while the sheet is open: the sheet lives inside the picker", () => {
    show({ status: "idle", tags: [WORK] })
    expect(kidsOfMain()).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
    act(() => q(".ab-tag-pill").click())
    expect(has(".ab-tag-sheet")).toBe(true)
    expect(kidsOfMain()).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
    expect(q(".ab-tag-sheet").closest(".ab-timer-actions")).toBe(q(".ab-timer-actions"))
    expect(q(".ab-tag-sheet").closest(".ab-timer-side")).toBe(q(".ab-timer-side"))
  })

  it("loses the open sheet when a session starts (the picker is taken away)", () => {
    show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-pill").click())
    expect(has(".ab-tag-sheet")).toBe(true)
    show({ status: "running", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(has(".ab-tag-picker")).toBe(false)
  })

  it("keeps the buttons as they were: Start is the only white pill, and Pause or Resume and the Hold Button stay in the buttons box", () => {
    show({ status: "running", seconds: 5, ringSeed: SEED })
    expect(q(".ab-timer-pill").parentElement).toBe(q(".ab-timer-actions"))
    expect(q(".ab-timer-end").closest(".ab-timer-actions")).toBe(q(".ab-timer-actions"))
    expect(Array.from(q(".ab-timer-actions").children).some((k) => k.className.includes("ab-tag"))).toBe(false)
  })
})

describe("TimerScreen: the tag of the running session (Packet 10C2)", () => {
  it("shows the name as one small line inside the dial, in the readout, after the day total", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, dayTotal: 4000, runningTag: "Deep work" })
    const line = q(".ab-tag-line")
    expect(line.textContent).toBe("Deep work")
    expect(line.tagName).toBe("P")
    expect(line.getAttribute("role")).toBe("note")
    expect(line.getAttribute("aria-label")).toBe("Tag: Deep work")
    expect(line.parentElement).toBe(q(".ab-timer-readout"))
    expect(q(".ab-timer-dial").contains(line)).toBe(true)
    expect(q(".ab-timer-small").nextElementSibling).toBe(line)
    expect(line.nextElementSibling).toBeNull()
  })

  it("shows it also while the session is paused", () => {
    show({ status: "paused", seconds: 100, ringSeed: SEED, runningTag: "Study" })
    expect(q(".ab-tag-line").textContent).toBe("Study")
  })

  it("shows nothing for a session with no tag, and nothing while idle", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, runningTag: null })
    expect(has(".ab-tag-line")).toBe(false)
    show({ status: "idle", runningTag: null })
    expect(has(".ab-tag-line")).toBe(false)
    expect(q(".ab-timer-readout").children.length).toBe(2)
  })

  it("keeps the two clocks as they were: the big clock, then the day total, nothing else in front of them", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, runningTag: "Work" })
    const kids = Array.from(q(".ab-timer-readout").children).map((k) => k.className)
    expect(kids).toEqual(["ab-timer-big", "ab-timer-small", "ab-tag-line"])
    expect(q(".ab-timer-big").textContent).toBe(formatClock(100))
  })

  it("shows a name as plain text, never as markup", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, runningTag: "<b>Work</b>" })
    expect(q(".ab-tag-line").textContent).toBe("<b>Work</b>")
    expect(has(".ab-tag-line b")).toBe(false)
  })
})
describe("the css of the tag picker (Packet 10C2)", () => {
  // The marker lines are written in two pieces, so that the tag checker does not take them for markers of this test file.
  const marker = (part: string, edge: string): string => "/* A" + "B:" + part + ":" + edge + " */"
  const SCREEN_HEADER = "@media (min-width: 1000px) and (min-height: 560px), (min-width: 600px) and (min-aspect-ratio: 5/4) {"
  const TAGS_HEADER = "@media (min-width: 600px) and (min-aspect-ratio: 5/4), (min-width: 1000px) and (min-height: 560px) {"
  const part = (): string => {
    const start = timerCss.indexOf(marker("TIMER.TAGS", "START"))
    const end = timerCss.indexOf(marker("TIMER.TAGS", "END"))
    return start < 0 || end < start ? "" : timerCss.slice(start, end)
  }
  // The text between the braces of a media rule, found by counting braces.
  const inside = (text: string, header: string): string => {
    const start = text.indexOf(header)
    if (start < 0) return ""
    let depth = 0
    for (let i = start + header.length - 1; i < text.length; i++) {
      if (text[i] === "{") depth++
      else if (text[i] === "}") {
        depth--
        if (depth === 0) return text.slice(start + header.length, i)
      }
    }
    return ""
  }
  const rule = (selector: string): string => new RegExp("\\n" + selector.replace(/[.[\]="]/g, "\\$&") + " \\{([^}]*)\\}").exec("\n" + part())?.[1] ?? ""
  // A rule of the whole css file (the screen's own rules), not only of the tag part.
  const screenRule = (selector: string): string => new RegExp("\\n" + selector.replace(/[.[\]="]/g, "\\$&") + " \\{([^}]*)\\}").exec("\n" + timerCss)?.[1] ?? ""
  const px = (text: string, pattern: RegExp): number => Number(pattern.exec(text)?.[1])
  const conditions = (header: string): string[] =>
    header
      .replace(/^@media /, "")
      .replace(/ \{$/, "")
      .split(", ")
      .sort()

  it("is one tagged part that stands after the screen's part and before the part of the moving background", () => {
    expect(part()).not.toBe("")
    expect(timerCss.split(marker("TIMER.TAGS", "START")).length - 1).toBe(1)
    expect(timerCss.indexOf(marker("TIMER.TAGS", "START"))).toBeGreaterThan(timerCss.indexOf(marker("TIMER.SCREEN", "END")))
    expect(timerCss.indexOf(marker("TIMER.TAGS", "END"))).toBeLessThan(timerCss.indexOf(marker("TIMER.BG", "START")))
  })

  it("leaves the last motion rule of the file to the moving background", () => {
    const last = timerCss.lastIndexOf("@media (prefers-reduced-motion: reduce) {")
    expect(last).toBeGreaterThan(timerCss.indexOf(marker("TIMER.BG", "START")))
  })

  it("has its own wide-screen rule with the SAME two conditions as the screen's, written in the other order so the screen's header stays unique", () => {
    expect(timerCss.split(TAGS_HEADER).length - 1).toBe(1)
    expect(timerCss.split(SCREEN_HEADER).length - 1).toBe(1)
    expect(TAGS_HEADER).not.toBe(SCREEN_HEADER)
    expect(conditions(TAGS_HEADER)).toEqual(conditions(SCREEN_HEADER))
    expect(conditions(TAGS_HEADER)).toEqual(["(min-width: 1000px) and (min-height: 560px)", "(min-width: 600px) and (min-aspect-ratio: 5/4)"])
    expect(part()).toContain(TAGS_HEADER)
  })

  it("switches the pill, the blank pill and the sheet off on a wide screen and the chips on, and touches nothing else", () => {
    const wide = inside(part(), TAGS_HEADER)
    expect(wide).toMatch(/\.ab-tag-pill,\s*\.ab-tag-wait,\s*\.ab-tag-sheet \{\s*display: none;\s*\}/)
    expect(wide).toMatch(/\.ab-tag-chips \{[^}]*display: flex;/)
    for (const word of ["overflow", "z-index", "pointer-events", "position:", "isolation", "mix-blend-mode", "--ab-timer-reserve"]) {
      expect(wide, word).not.toContain(word)
    }
  })

  it("hides the chips on a phone, and the wide rule comes after every phone rule it replaces", () => {
    expect(rule(".ab-tag-chips")).toContain("display: none;")
    const at = part().indexOf(TAGS_HEADER)
    for (const selector of [".ab-tag-pill", ".ab-tag-wait", ".ab-tag-sheet", ".ab-tag-chips"]) {
      const first = part().indexOf("\n" + selector + " {")
      expect(first, selector).toBeGreaterThan(-1)
      expect(first, selector).toBeLessThan(at)
    }
  })

  it("makes the pill and the blank pill 44 px high and as wide as the buttons, with round ends", () => {
    for (const selector of [".ab-tag-pill", ".ab-tag-wait"]) {
      expect(rule(selector), selector).toContain("height: 44px;")
      expect(rule(selector), selector).toContain("width: 100%;")
      expect(rule(selector), selector).toContain("border-radius: 999px;")
    }
    expect(rule(".ab-tag-wait")).not.toContain("cursor:")
  })

  it("lets the blank tag pill breathe like the blank Start pill, so that the two look like one family", () => {
    expect(px(rule(".ab-tag-wait"), /opacity:\s*([0-9.]+);/)).toBe(px(screenRule(".ab-timer-wait"), /opacity:\s*([0-9.]+);/))
    expect(rule(".ab-tag-wait")).toMatch(/animation:\s*ab-tag-wait\s+1\.4s/)
    expect(part()).toContain("@keyframes ab-tag-wait {")
  })

  it("fits above Start inside the buttons box, so that the reserve of the dial on the phone does not change (C40)", () => {
    const actions = timerCss.slice(timerCss.indexOf("\n.ab-timer-actions {"), timerCss.indexOf("}", timerCss.indexOf("\n.ab-timer-actions {")))
    const room = px(actions, /min-height:\s*(\d+)px;/)
    const gap = px(actions, /gap:\s*(\d+)px;/)
    const start = px(timerCss.slice(timerCss.indexOf("\n.ab-timer-pill {")), /height:\s*(\d+)px;/)
    const pill = px(rule(".ab-tag-pill"), /height:\s*(\d+)px;/)
    expect(start).toBe(58)
    expect(pill + gap + start).toBeLessThanOrEqual(room)
  })

  it("draws the wrapper of the picker as no box at all, so that the pill and Start are laid out by the same buttons box", () => {
    expect(rule(".ab-tag-picker")).toMatch(/display:\s*contents;/)
  })

  it("is outlined, so that Start stays the one white solid button, and has a disabled look and a press look like Start", () => {
    expect(rule(".ab-tag-pill")).toContain("background: transparent;")
    expect(rule(".ab-tag-pill")).toMatch(/border:\s*1px solid/)
    expect(rule(".ab-tag-pill:disabled")).toContain("opacity: 0.4;")
    expect(rule(".ab-tag-pill:active:enabled")).toContain("transform: scale(0.98);")
  })

  it("cuts a long name with an ellipsis instead of growing", () => {
    for (const selector of [".ab-tag-pill-text", ".ab-tag-chip", ".ab-tag-line"]) {
      expect(rule(selector), selector).toContain("overflow: hidden;")
      expect(rule(selector), selector).toContain("text-overflow: ellipsis;")
      expect(rule(selector), selector).toContain("white-space: nowrap;")
    }
    expect(rule(".ab-tag-pill-text")).toContain("min-width: 0;")
  })

  it("makes the sheet a fixed, plain dim layer over the whole window with no blur, and the panel sits at the bottom", () => {
    expect(rule(".ab-tag-sheet")).toContain("position: fixed;")
    expect(rule(".ab-tag-sheet")).toContain("inset: 0;")
    expect(rule(".ab-tag-scrim")).toContain("position: absolute;")
    expect(rule(".ab-tag-scrim")).toContain("inset: 0;")
    expect(rule(".ab-tag-scrim")).toMatch(/background:\s*rgba\(0, 0, 0, 0\.\d+\);/)
    expect(part()).not.toContain("blur(")
    expect(part()).not.toContain("backdrop-filter")
    expect(rule(".ab-tag-panel")).toContain("position: absolute;")
    expect(rule(".ab-tag-panel")).toMatch(/bottom: 0;/)
    expect(rule(".ab-tag-panel")).toContain("overflow-y: auto;")
    expect(rule(".ab-tag-panel")).toMatch(/max-height:\s*\d+dvh;/)
  })

  it("keeps the sheet above the dial and the buttons (z-index 1) and below the menu button (z-index 40 in menu.css)", () => {
    const z = px(rule(".ab-tag-sheet"), /z-index:\s*(\d+);/)
    expect(z).toBeGreaterThan(1)
    expect(z).toBeLessThan(40)
  })

  it("gives the rows at least 44 px to tap, and the chips 40 px", () => {
    expect(px(rule(".ab-tag-row"), /min-height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(rule(".ab-tag-row")).toContain("width: 100%;")
    expect(px(rule(".ab-tag-chip"), /height:\s*(\d+)px;/)).toBe(40)
  })

  it("fills the chosen row and the chosen chip white, as Start is", () => {
    for (const selector of ['.ab-tag-row[aria-pressed="true"]', '.ab-tag-chip[aria-pressed="true"]']) {
      expect(rule(selector), selector).toContain("background: #fff;")
      expect(rule(selector), selector).toContain("color: #000;")
    }
  })

  it("lets a person who wants less motion have no sliding, no fading and no breathing, and the switch-off comes after the rules it switches off", () => {
    const at = part().indexOf("@media (prefers-reduced-motion: reduce) {")
    expect(at).toBeGreaterThan(-1)
    const off = inside(part(), "@media (prefers-reduced-motion: reduce) {")
    for (const selector of [".ab-tag-wait", ".ab-tag-scrim", ".ab-tag-panel"]) {
      expect(off, selector).toContain(selector)
      expect(part().indexOf("\n" + selector + " {"), selector).toBeLessThan(at)
    }
    expect(off).toContain("animation: none;")
  })

  it("makes the line of the running tag take no height: its own line is 1.2em and the bottom margin takes back that line and the gap of the readout", () => {
    const line = rule(".ab-tag-line")
    const readout = timerCss.slice(timerCss.indexOf("\n.ab-timer-readout {"), timerCss.indexOf("}", timerCss.indexOf("\n.ab-timer-readout {")))
    const gap = px(readout, /\n\s*gap:\s*(\d+)px;/)
    const lineHeight = px(line, /line-height:\s*([0-9.]+);/)
    const margin = /margin:\s*0 0 calc\(-([0-9.]+)em - (\d+)px\);/.exec(line)
    expect(margin).not.toBeNull()
    expect(Number(margin?.[1])).toBe(lineHeight)
    expect(Number(margin?.[2])).toBe(gap)
    expect(line).toContain("max-width: 84cqw;")
    expect(line).toMatch(/font-size:\s*max\(12px,/)
  })

  it("never uses a css variable of its own and never touches the rules of the screen", () => {
    expect(part()).not.toContain("--ab-")
    for (const selector of [".ab-timer-actions", ".ab-timer-pill", ".ab-timer-wait", ".ab-timer-readout", ".ab-timer-small"]) {
      expect(part(), selector).not.toContain(selector + " ")
    }
  })
})
// AB:TIMER.TESTS:END
END TEXT

## EDITS OF THE HOOK TESTS (src/lib/useTimer.hook.test.ts)

**Edit 1** (the fake database learns the call that reads the list of tags)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  timerEnd: vi.fn(),
END TEXT

REPLACE WITH:
BEGIN TEXT
  timerEnd: vi.fn(),
  timerTagList: vi.fn(),
END TEXT

**Edit 2** (the type of one tag is imported)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
import { TimerError } from "@/lib/timerApi"
END TEXT

REPLACE WITH:
BEGIN TEXT
import { TimerError, type TimerTag } from "@/lib/timerApi"
END TEXT

**Edit 3** (the fake server keeps the live tags and can fail to read them)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
type Server = { row: TimerRow | null; saved: Record<string, number>; offsetMs: number; down: TimerError | null }
END TEXT

REPLACE WITH:
BEGIN TEXT
type Server = {
  row: TimerRow | null
  saved: Record<string, number>
  offsetMs: number
  down: TimerError | null
  tags: TimerTag[]
  tagListDown: boolean
}
END TEXT

**Edit 4** (the fake Start takes the tag like the SQL function: a tag that is not live is TAG_NOT_FOUND)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  api.timerStart.mockImplementation(async (zone: string) => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  api.timerStart.mockImplementation(async (zone: string, tagId?: string) => {
END TEXT

**Edit 5** (the fake Start refuses a tag that is not in the live list)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    if (server.row !== null) throw new TimerError("ALREADY_RUNNING")
END TEXT

REPLACE WITH:
BEGIN TEXT
    if (server.row !== null) throw new TimerError("ALREADY_RUNNING")
    const tag = tagId === undefined ? null : (server.tags.find((t) => t.id === tagId) ?? null)
    if (tagId !== undefined && tag === null) throw new TimerError("TAG_NOT_FOUND")
END TEXT

**Edit 6** (the fake Start puts the tag into the running row, as timer_row_json does)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    server.row = runningRow(0, { tz: zone })
END TEXT

REPLACE WITH:
BEGIN TEXT
    server.row = runningRow(0, tag === null ? { tz: zone } : { tz: zone, tag })
END TEXT

**Edit 7** (the fake database reads the list of tags)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  api.timerEnd.mockImplementation(async () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  api.timerTagList.mockImplementation(async () => {
    guard()
    if (server.tagListDown) throw new TimerError("UNKNOWN")
    return server.tags.map((tag) => ({ ...tag }))
  })
  api.timerEnd.mockImplementation(async () => {
END TEXT

**Edit 8** (every test starts with a fake server that has no tags)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  server = { row: null, saved: {}, offsetMs: 0, down: null }
END TEXT

REPLACE WITH:
BEGIN TEXT
  server = { row: null, saved: {}, offsetMs: 0, down: null, tags: [], tagListDown: false }
END TEXT

**Edit 9** (the tests of the tags end the tagged part)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// AB:TIMER.TESTS:END
END TEXT

REPLACE WITH:
BEGIN TEXT
describe("useTimer: the tags (Packet 10C2)", () => {
  const WORK: TimerTag = { id: "t-work", name: "Work" }
  const STUDY: TimerTag = { id: "t-study", name: "Study" }
  const startCalls = (): unknown[][] => api.timerStart.mock.calls as unknown[][]

  it("reads the list of tags once when the screen opens, and shows it in the order the database gave it", async () => {
    server.tags = [WORK, STUDY]
    await mount()
    expect(api.timerTagList).toHaveBeenCalledTimes(1)
    expect(view.tags).toEqual([WORK, STUDY])
    expect(view.tagId).toBeNull()
    expect(view.runningTag).toBeNull()
  })

  it("does not read the list again in the 30 second reading (only the picker asks for that)", async () => {
    server.tags = [WORK]
    await mount()
    await settle(POLL_ONLINE_MS * 3)
    expect(api.timerState.mock.calls.length).toBeGreaterThanOrEqual(4)
    expect(api.timerTagList).toHaveBeenCalledTimes(1)
  })

  it("reads the list again when the picker opens its list (reloadTags), and shows the new list", async () => {
    server.tags = [WORK]
    await mount()
    server.tags = [WORK, STUDY]
    await press(view.reloadTags)
    expect(api.timerTagList).toHaveBeenCalledTimes(2)
    expect(view.tags).toEqual([WORK, STUDY])
  })

  it("never lets a list that cannot be read stop the timer: no problem is shown, Start works with no tag, and the next reading of the list can still succeed", async () => {
    server.tagListDown = true
    server.tags = [WORK]
    await mount()
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
    expect(view.tags).toEqual([])
    await press(view.start)
    expect(view.status).toBe("running")
    expect(view.link).toBe("online")
    server.tagListDown = false
    await press(view.reloadTags)
    expect(view.tags).toEqual([WORK])
  })

  it("keeps the list it had when a later reading of it fails", async () => {
    server.tags = [WORK]
    await mount()
    server.tagListDown = true
    await press(view.reloadTags)
    expect(view.tags).toEqual([WORK])
    expect(view.link).toBe("online")
  })

  it("lets an old answer of the list lose against a newer one", async () => {
    server.tags = [WORK]
    const first = hold("timerTagList")
    await mount()
    await press(view.reloadTags)
    expect(view.tags).toEqual([WORK])
    await release(() => first.answer([STUDY]))
    expect(view.tags).toEqual([WORK])
  })

  it("ignores the answer of the list when the screen has been left", async () => {
    const first = hold("timerTagList")
    await mount()
    act(() => root?.unmount())
    root = null
    await release(() => first.answer([WORK]))
    expect(api.timerTagList).toHaveBeenCalledTimes(1)
  })

  it("starts every session with no tag: the pick is none on a fresh load", async () => {
    server.tags = [WORK]
    await mount()
    expect(view.tagId).toBeNull()
  })

  it("chooses a tag from the list, and none again with null", async () => {
    server.tags = [WORK, STUDY]
    await mount()
    await press(() => view.chooseTag(STUDY.id))
    expect(view.tagId).toBe(STUDY.id)
    await press(() => view.chooseTag(WORK.id))
    expect(view.tagId).toBe(WORK.id)
    await press(() => view.chooseTag(null))
    expect(view.tagId).toBeNull()
  })

  it("ignores a tag that is not in the list", async () => {
    server.tags = [WORK]
    await mount()
    await press(() => view.chooseTag("t-nobody"))
    expect(view.tagId).toBeNull()
    await press(() => view.chooseTag(WORK.id))
    await press(() => view.chooseTag("t-nobody"))
    expect(view.tagId).toBe(WORK.id)
  })

  it("ignores a choice while a session runs or is paused (the database cannot change the tag of a running session)", async () => {
    server.tags = [WORK]
    server.row = runningRow(100)
    await mount()
    await press(() => view.chooseTag(WORK.id))
    expect(view.tagId).toBeNull()
    await press(view.pause)
    expect(view.status).toBe("paused")
    await press(() => view.chooseTag(WORK.id))
    expect(view.tagId).toBeNull()
  })

  it("drops a pick that is no longer in the list after the list was read again (the tag was archived on another device)", async () => {
    server.tags = [WORK, STUDY]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    server.tags = [STUDY]
    await press(view.reloadTags)
    expect(view.tagId).toBeNull()
    expect(view.tags).toEqual([STUDY])
  })

  it("keeps a pick that is still in the list after the list was read again", async () => {
    server.tags = [WORK, STUDY]
    await mount()
    await press(() => view.chooseTag(STUDY.id))
    await press(view.reloadTags)
    expect(view.tagId).toBe(STUDY.id)
  })

  it("Start with no pick is exactly the call of before tags: one argument, the time zone", async () => {
    server.tags = [WORK]
    await mount()
    await press(view.start)
    expect(api.timerStart).toHaveBeenCalledTimes(1)
    expect(startCalls()[0]).toEqual(["Asia/Kolkata"])
    expect(view.runningTag).toBeNull()
  })

  it("Start with a pick sends the tag with the time zone, and the running session shows the name the database sends", async () => {
    server.tags = [WORK, STUDY]
    await mount()
    await press(() => view.chooseTag(STUDY.id))
    await press(view.start)
    expect(startCalls()[0]).toEqual(["Asia/Kolkata", STUDY.id])
    expect(view.status).toBe("running")
    expect(view.runningTag).toBe("Study")
  })

  it("uses up the pick as soon as a session runs: it is none while the session runs and after it", async () => {
    server.tags = [WORK]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    await press(view.start)
    expect(view.tagId).toBeNull()
    await press(view.stop)
    await press(view.end)
    expect(view.status).toBe("idle")
    expect(view.tagId).toBeNull()
    expect(view.runningTag).toBeNull()
    await press(view.start)
    expect(startCalls()[1]).toEqual(["Asia/Kolkata"])
    expect(view.runningTag).toBeNull()
  })

  it("uses up the pick when a session was started on another device", async () => {
    server.tags = [WORK]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    server.row = runningRow(5)
    await settle(POLL_ONLINE_MS)
    expect(view.status).toBe("running")
    expect(view.tagId).toBeNull()
    expect(view.runningTag).toBeNull()
  })

  it("shows the tag of a session that was found already running (a reload, or another device), also while it is paused", async () => {
    server.tags = [WORK]
    server.row = runningRow(100, { tag: WORK })
    await mount()
    expect(view.runningTag).toBe("Work")
    await press(view.pause)
    expect(view.status).toBe("paused")
    expect(view.runningTag).toBe("Work")
  })

  it("shows the new name when the tag was renamed while the session runs (the database sends the name it has now)", async () => {
    server.row = runningRow(100, { tag: WORK })
    await mount()
    expect(view.runningTag).toBe("Work")
    server.row = runningRow(100, { tag: { id: WORK.id, name: "Deep work" } })
    await settle(POLL_ONLINE_MS)
    expect(view.runningTag).toBe("Deep work")
  })

  it("shows no tag for a session whose row has no key tag (the reader of the row has already turned a null tag into no key)", async () => {
    server.row = runningRow(100)
    await mount()
    expect(view.runningTag).toBeNull()
    server.row = runningRow(130, { tag: WORK })
    await settle(POLL_ONLINE_MS)
    expect(view.runningTag).toBe("Work")
    server.row = runningRow(160)
    await settle(POLL_ONLINE_MS)
    expect(view.runningTag).toBeNull()
  })

  it("a Start that the database refuses with TAG_NOT_FOUND sets the pick back to no tag, reads the list again and shows the plain words", async () => {
    server.tags = [WORK, STUDY]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    server.tags = [STUDY]
    await press(view.start)
    expect(startCalls()[0]).toEqual(["Asia/Kolkata", WORK.id])
    expect(view.tagId).toBeNull()
    expect(view.tags).toEqual([STUDY])
    expect(api.timerTagList).toHaveBeenCalledTimes(2)
    expect(view.status).toBe("idle")
    expect(view.link).toBe("problem")
    expect(view.problem).toBe(problemText("TAG_NOT_FOUND"))
    expect(server.row).toBeNull()
  })

  it("a Start refused with TAG_NOT_FOUND sets the pick back to no tag even when the list cannot be read again", async () => {
    server.tags = [WORK]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    server.tags = []
    server.tagListDown = true
    await press(view.start)
    expect(api.timerTagList).toHaveBeenCalledTimes(2)
    expect(view.tagId).toBeNull()
    expect(view.tags).toEqual([WORK])
    expect(view.problem).toBe(problemText("TAG_NOT_FOUND"))
  })

  it("treats TAG_NOT_FOUND of Start as a problem of its own: the state is not read again, and a Start with no tag works after Try again", async () => {
    server.tags = [WORK]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    server.tags = []
    await press(view.start)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    await press(view.retry)
    expect(view.link).toBe("online")
    await press(view.start)
    expect(startCalls()[1]).toEqual(["Asia/Kolkata"])
    expect(view.status).toBe("running")
  })

  it("does not touch the pick for any other refusal of Start", async () => {
    server.tags = [WORK]
    await mount()
    await press(() => view.chooseTag(WORK.id))
    api.timerStart.mockImplementationOnce(async () => {
      throw new TimerError("UNKNOWN")
    })
    await press(view.start)
    expect(view.tagId).toBe(WORK.id)
    expect(api.timerTagList).toHaveBeenCalledTimes(1)
  })

  it("does not read the list again for TAG_NOT_FOUND of any other button", async () => {
    server.tags = [WORK]
    server.row = runningRow(100)
    await mount()
    api.timerPause.mockImplementationOnce(async () => {
      throw new TimerError("TAG_NOT_FOUND")
    })
    await press(view.pause)
    expect(api.timerTagList).toHaveBeenCalledTimes(1)
  })
})
// AB:TIMER.TESTS:END
END TEXT

## EDITS OF THE CODE MAP (CODE_MAP.md)

**Edit 1** (STATE row: the list, the pick and the tag of the running session)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(a missed one waits and comes late with a tag, see CONNECTIONS.md C51), the no connection state and the midnight rule
END TEXT

REPLACE WITH:
BEGIN TEXT
(a missed one waits and comes late with a tag, see CONNECTIONS.md C51), keeps the list of the person's live tags and the tag picked before Start (the list is read when the screen opens and when the picker opens it, never in the 30 second reading; Start sends the tag only when there is one) and the name of the tag of the running session (see CONNECTIONS.md C56), the no connection state and the midnight rule
END TEXT

**Edit 2** (STATE row: what you can change)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
is shown at most once per session and is kept only while that session runs, see CONNECTIONS.md C51 |
END TEXT

REPLACE WITH:
BEGIN TEXT
is shown at most once per session and is kept only while that session runs, see CONNECTIONS.md C51; the pick of a tag is used up as soon as any session runs, and a Start refused with TAG_NOT_FOUND sets it back to no tag, see CONNECTIONS.md C56 |
END TEXT

**Edit 3** (SCREEN row: the picker and the tag line)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
a faint blank pill stands where the buttons will be; then the clocks and the buttons fade in (see CONNECTIONS.md C46).
END TEXT

REPLACE WITH:
BEGIN TEXT
a faint blank pill stands where the buttons will be; then the clocks and the buttons fade in (see CONNECTIONS.md C46). While no session runs the tag picker (own row below) is the first thing in the buttons box; while one runs, its tag is one small line inside the dial under the day total (see CONNECTIONS.md C56).
END TEXT

**Edit 4** (SCREEN row: what you can change)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
tells the hook what it draws (drawnNow), see CONNECTIONS.md C51 |
END TEXT

REPLACE WITH:
BEGIN TEXT
tells the hook what it draws (drawnNow), see CONNECTIONS.md C51; the picker must stay the first thing in the buttons box, so that the phone reserve does not change, and the tag line must stay a line that takes no height, see CONNECTIONS.md C56 |
END TEXT

**Edit 5** (the new row of the tag picker, before the row of the tests)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer:
END TEXT

REPLACE WITH:
BEGIN TEXT
| `AB:TIMER.TAGS` | The tag picker of the Pro Timer: the person chooses the tag before pressing Start. On a phone one outlined pill (44 px) above Start shows the choice (No tag at first) and opens a slide-up list (a plain dim layer, no blur) where a tap on a row chooses and closes; on a wide screen every tag is a chip. It is there only while no session runs; while one runs, its tag is one small line inside the dial (the screen draws it). The list and the pick live in the hook (AB:TIMER.STATE). No adding, renaming or removing of tags yet (Packets 10D and 10E) | `src/components/TagPicker.tsx`, `src/timer.css` | the look in the css part (sizes, colours, the slide); the words No tag, Choose a tag and Tag; the pill must stay 44 px so that it fits above Start inside the 124 px buttons box (the phone reserve of the dial does not change, see CONNECTIONS.md C40); the wide-screen rule of this part must keep the same two conditions as the screen's (CONNECTIONS.md C39), see CONNECTIONS.md C56 |
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer:
END TEXT

**Edit 6** (TESTS row: the tests of the picker)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
in its reading and in the SQL file), the wait before the ball
END TEXT

REPLACE WITH:
BEGIN TEXT
in its reading and in the SQL file), the tag picker (the pill, the sheet and where its focus goes, the chips, the list and the pick in the hook, the tag line of a running session on the screen, the css of the picker), the wait before the ball
END TEXT

**Edit 7** (TESTS row: the new test file)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
`src/lib/tagsSql.test.ts` | add tests;
END TEXT

REPLACE WITH:
BEGIN TEXT
`src/lib/tagsSql.test.ts`, `src/components/TagPicker.test.tsx` | add tests;
END TEXT

**Edit 8** (TESTS row: the new connection)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
C54 and C55 |
END TEXT

REPLACE WITH:
BEGIN TEXT
C54, C55 and C56 |
END TEXT

## EDITS OF THE CONNECTIONS (CONNECTIONS.md)

**Edit 1** (C28: the picker can now bring TAG_NOT_FOUND to the screen)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(from Packet 10B problemText gives each of these four its own plain words; no screen asks for a tag yet)
END TEXT

REPLACE WITH:
BEGIN TEXT
(from Packet 10B problemText gives each of these four its own plain words; since Packet 10C2 the picker reads the list and Start can send a tag, so TAG_NOT_FOUND can reach the screen, see C56; adding, renaming and archiving have no screen yet)
END TEXT

**Edit 2** (C39: the picker is the first thing in the buttons box, and its own wide rule)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
The tags and the rest that come later go into this box.
END TEXT

REPLACE WITH:
BEGIN TEXT
The tag picker (C56) is the first thing inside the buttons box of this box while no session runs, and the rest that comes later goes into this box.
END TEXT

**Edit 3** (C39: the picker's wide rule has the same conditions in the other order)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Tests in TimerScreen.test.tsx read the structure and timer.css and fail when one of the four is broken.
END TEXT

REPLACE WITH:
BEGIN TEXT
Tests in TimerScreen.test.tsx read the structure and timer.css and fail when one of the four is broken. The wide rule of the tag picker (C56) is written with the same two conditions in the other order, so that the header above stays unique; if the two conditions of this rule change, that one must change too (a test compares them).
END TEXT

**Edit 4** (C40: the pill fits inside the buttons box, the reserve stays)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the buttons box (124 px) = 297 px, and the reserve is 298 px (1 px for rounding).
END TEXT

REPLACE WITH:
BEGIN TEXT
the buttons box (124 px) = 297 px, and the reserve is 298 px (1 px for rounding). While no session runs, the tag pill (44 px) and one gap (14 px) stand above the 58 px Start pill inside that box (44 + 14 + 58 = 116, under the 124 px), so the reserve does not change (C56).
END TEXT

**Edit 5** (C55: the picker uses two of the calls)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
, but no screen uses them yet.
END TEXT

REPLACE WITH:
BEGIN TEXT
. Since Packet 10C2 the picker uses two of them (timerTagList for the list and timerStart with a tag id, see C56); adding, renaming and archiving have no screen yet.
END TEXT

**Edit 6** (C56: the new connection of the tag picker comes before the notes that cannot be checked)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Things to know (no check is possible)
END TEXT

REPLACE WITH:
BEGIN TEXT
### C56: The tag picker: the hook keeps the list and the pick, the screen shows the picker above Start and the tag of a running session inside the dial, the css keeps the pill inside the buttons box, and its wide rule has the same two conditions as the screen's
- Tags: `AB:TIMER.TAGS`, `AB:TIMER.STATE`, `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: tags, tagId, runningTag, chooseTag or reloadTags in useTimer.ts (the type TimerView), loadTags or the line of the first reading effect that calls it, the one-argument call of timerStart, the TAG_NOT_FOUND branch of act, TagPicker.tsx (its props, its class names, the words No tag and Choose a tag, the focus rules), the lines of TimerScreen.tsx that draw the picker, the blank tag pill and the tag line, or the css part of the picker (the sizes of the pill, the sheet, its wide rule, the tag line)
- Then also: the hook (AB:TIMER.STATE) keeps tags (the person's live tags as timer_tag_list sends them, oldest first, C55), tagId (the tag picked before Start, null for no tag) and runningTag (the name of the tag of the running session, from row.tag, null for no tag). The list is read by loadTags once when the screen opens (inside the first reading effect) and again by reloadTags each time the picker opens its list; the 30 second reading never reads it; an answer that is not the newest loses (a ticket); a list that cannot be read is left as it was and never shows a problem, because the timer must work with No tag only. chooseTag counts only while no session exists and only for a tag that is in the list. The pick is used up (set to null) in adopt as soon as ANY reading has a running row, so every session starts with no tag and after a session the pick is none (DECISIONS_TAGS.md section 4); a pick that is no longer in the list after the list was read again is dropped. Start sends timerStart(zone) with ONE argument when there is no pick (exactly what was sent before tags) and timerStart(zone, tagId) with a pick. TAG_NOT_FOUND from Start (the tag was archived on another device) sets the pick to none, reads the list again and shows the plain words of problemText; it is not in CONFLICTS, so the state is not read again (C28). The screen (AB:TIMER.SCREEN) draws TagPicker as the FIRST child of the buttons box ab-timer-actions while the link is not loading and no session runs, draws a faint blank pill (ab-tag-wait, 44 px) first while loading, and draws the line ab-tag-line (the name of runningTag, only when it is not null) as the last child of ab-timer-readout, after the day total. The picker (AB:TIMER.TAGS) holds the pill (phone), the chips (wide screen) and the sheet (the slide-up list, only while open). The sheet lives INSIDE the picker, so the children of the main element stay background, dial, side (C39); focus goes to the panel when the sheet opens and back to the pill when it closes; Escape and a tap on the dim layer close it without a change; the dim layer is plain, no blur (C25). The css part of the picker sits between the screen's part and the part of the moving background, because a test of the background reads the last motion rule of the file (C43). The pill is 44 px and the gap of the buttons box is 14 px, so 44 + 14 + 58 (Start) = 116 fits in the 124 px of the box and the phone reserve of the dial does not change (C40). On a wide screen the picker's own @media rule hides the pill, the blank pill and the sheet and shows the chips. It has the same two conditions as the wide rule of the screen (C39) written in the OTHER order, because a test finds the screen's header exactly once; if the conditions of one change, the other must follow (a test compares them). The tag line takes no height: its line is 1.2em and its negative bottom margin takes back that line and the 8 px gap of the readout, so the two clocks do not move when the line comes. The tests of the picker are in TagPicker.test.tsx, those of the screen and the css in TimerScreen.test.tsx, those of the hook in useTimer.hook.test.ts. Adding, renaming and removing tags have no screen yet (Packets 10D and 10E). Known: on a wide screen the chips make the idle side column taller than the running one, so the centred column moves a little when a session starts.
- If you forget: the next session starts under an old tag, or Start sends a tag that was archived, or the pill pushes Start under the bottom edge of a small phone, or the sheet covers only the buttons box, or the two wide rules go out of step and the pill and the chips show together or not at all, or the tag line pushes the clocks.
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const loadTags = useCallback(async () => {`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const tagToSend = kind === "start" ? tagIdRef.current : null`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = if (kind === "start" && error instanceof TimerError && error.kind === "TAG_NOT_FOUND") {`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = runningTag: row === null ? null : (row.tag?.name ?? null),`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TagPicker tags={timer.tags} tagId={timer.tagId} disabled={!ready} onChoose={timer.chooseTag} onOpen={timer.reloadTags} />`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <p className="ab-tag-line" role="note" aria-label={"Tag: " + timer.runningTag}>`
- Anchor: `AB:TIMER.TAGS @ src/components/TagPicker.tsx = <div className="ab-tag-sheet">`
- Anchor: `AB:TIMER.TAGS @ src/timer.css = @media (min-width: 600px) and (min-aspect-ratio: 5/4), (min-width: 1000px) and (min-height: 560px) {`
- Anchor: `AB:TIMER.TAGS @ src/timer.css = margin: 0 0 calc(-1.2em - 8px);`
- Anchor: `AB:TIMER.TESTS @ src/components/TagPicker.test.tsx = describe("TagPicker: the sheet", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("the css of the tag picker (Packet 10C2)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.hook.test.ts = describe("useTimer: the tags (Packet 10C2)", () => {`
- Check by hand: on a phone open #timer with nothing running: an outlined pill with No tag stands above Start, and the dial is as big as before. Tap the pill: a dark layer and a list with one row, No tag, slide up. Tap the dark part: it closes. Tap the pill and then the row: it closes too. Press Start: the pill goes away and no tag line shows in the dial (the session has no tag). On a laptop the same page shows one chip, No tag, above Start and no pill. Real tags cannot be added before Packet 10D, so everything with real tags (the rows, the chips, the line in the dial, TAG_NOT_FOUND) is checked by the tests only.

## Things to know (no check is possible)
END TEXT

## EDITS OF THE PROGRESS NOTES (PROGRESS.md)

**Edit 1** (the Done list gets Packet 10C2)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
## Next
END TEXT

REPLACE WITH:
BEGIN TEXT
- Packet 10C2: the tag picker on the Pro Timer (src/components/TagPicker.tsx new, src/components/TimerScreen.tsx, src/lib/useTimer.ts, src/timer.css; tests in TagPicker.test.tsx, TimerScreen.test.tsx and useTimer.hook.test.ts). While no session runs, the person chooses the tag before pressing Start: on a phone one outlined pill (44 px) above Start shows the choice (No tag at first) and opens a slide-up list (plain dim layer, no blur; a tap on a row chooses and closes; a tap outside or Escape closes without a change); on a wide screen every tag is a chip. The hook reads the list of tags once when the screen opens and again each time the list is opened (never in the 30 second reading), Start sends the tag only when one was picked (otherwise it is the same call as before tags), and the pick is back to No tag as soon as any session runs. While a session runs the name of its tag is one small line inside the dial under the day total (nothing for a session with no tag). A Start refused with TAG_NOT_FOUND sets the pick back to No tag, reads the list again and shows the plain words. Until Packet 10D lets the owner add a tag, the phone shows only No tag; everything with real tags is checked by the tests. With automated tests; CODE_MAP.md (new tag AB:TIMER.TAGS) and CONNECTIONS.md (new C56) were brought up to date.

## Next
END TEXT

**Edit 2** (the Next list: the picker is done)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
Packet 10C2 the picker on the Pro Timer (a pill above Start and a slide-up list on a phone, chips on a wide screen, the tag goes with Start and the choice is back to No tag after every session, the tag of a running session shows as a small line in the dial), Packet 10D adding a tag
END TEXT

REPLACE WITH:
BEGIN TEXT
Packet 10D adding a tag (the picker, Packet 10C2, is done)
END TEXT
