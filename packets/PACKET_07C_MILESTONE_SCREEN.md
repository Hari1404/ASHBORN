# PACKET 07C: THE MILESTONE MESSAGE, PART 2 (the screen shows it)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_07C_MILESTONE_SCREEN.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: Packet 07B must have been run and pushed. Put TWO files into the `packets/` folder of the project: this file (`PACKET_07C_MILESTONE_SCREEN.md`) and `ASHBORN_07C_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 8 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 8 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/Milestone.tsx`, `src/components/Milestone.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
The screen of the milestone message. Packet 07B decided WHEN it comes; this packet shows it.
1. A new component `src/components/Milestone.tsx`: one line floats at the BOTTOM of the Pro Timer screen (the comeback message is the one at the top). Its words come in one by one with the effect of every marked keyword (the existing LineText). It stays 30 seconds (`MILESTONE_SHOW_MS`), fades out in half a second (`MILESTONE_FADE_MS`), then asks the hook to take it away (`clearMilestone`). A message that was missed has a small tag on top: "9 min earlier" (only from 5 minutes late).
2. It floats over the screen (position absolute, 12 px plus the phone's safe area above the bottom edge), takes no room from the clock and the buttons, never catches a tap (so Pause and Hold to end session work while it is there), is above the dial and the buttons and below the menu, and has no blur behind it. It is placed after the comeback message and before the stop alert, so the stop alert stays the last thing on the screen. People who asked for less motion get no fades.
3. `src/components/TimerScreen.tsx` shows the message while the hook has one, and now tells the hook what it really draws (`drawnNow`: the ball when the browser has WebGL 2, the rays when it has WebGL 2 and the lite level is not 2; asked only when a milestone is picked, never when the screen opens). With that, the two lines about the ball and the rays can be picked again, but only for a message that is on time.
4. NEW TAG (decided by the planner, the agent does not invent it): `AB:TIMER.MILESTONE`. It is in two files: `src/components/Milestone.tsx` (a new file) and `src/timer.css` (a new part, placed after the part `AB:TIMER.COMEBACK` and BEFORE the part `AB:TIMER.BG` on purpose: the test of the background reads the last reduced-motion rule of the file). The tags `AB:TIMER.SCREEN` and `AB:TIMER.TESTS` also change.
5. CONNECTIONS.md: the entry C51 (from Packet 07B) is extended with the screen part (its tags, anchors and the check by hand); the entry C49 gets `AB:TIMER.MILESTONE` as a third user of LineText; the entry C50 and the doc text have their last sentences changed.
6. CODE_MAP.md: 1 row added (`AB:TIMER.MILESTONE`), the rows `AB:TIMER.SCREEN`, `AB:TIMER.MILESTONE-LINES`, `AB:TIMER.TESTS` and the TIMER status line are changed.
7. PROGRESS.md: one line added for this packet; the line under "Next" about looking at the messages by eye is changed.
8. The database does not change. No new dependency. Line endings: the three doc files in the zip have plain line feeds (LF); messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 34 tags, 66 places` and `CONNECTIONS OK: 51 connections, 415 anchors, 52 classes, 2 css variables, 2 label links`. Tests: 18 files, 897 tests (860 before).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist: `packets/ASHBORN_07C_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/useTimer.ts`, `src/components/LineText.tsx`, `src/components/Comeback.tsx`, `src/components/TimerScreen.tsx`, `src/timer.css`. If `src/lib/useTimer.ts` does not contain the text `clearMilestone`, Packet 07B has not been run: **STOP** and report "Packet 07B has not been run."
2. These two files must NOT exist yet: `src/components/Milestone.tsx`, `src/components/Milestone.test.tsx`. If one exists, this packet has already been run: **STOP** and report "Packet 07C has already been run."
3. `PROGRESS.md` must contain the text `- Packet 07B:` and must NOT contain the text `- Packet 07C:`. `CONNECTIONS.md` must contain `### C51:`. `CODE_MAP.md` must NOT contain the text `src/components/Milestone.tsx`.
4. Run `git log --oneline -1`. The message must start with `Packet 07B`. Run `git status --porcelain`: it must show nothing, except possibly the files of this packet in `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 33 tags, 63 places
CONNECTIONS OK: 51 connections, 399 anchors, 49 classes, 2 css variables, 2 label links
```
6. Run `npm test`. It must show 17 test files and 860 tests, all passing.
If any of these prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 6 that exist and creating the 2 new ones. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_07C_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_07C_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 8 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/Milestone.tsx src/components/Milestone.test.tsx src/components/TimerScreen.tsx src/components/TimerScreen.test.tsx src/timer.css

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `175523d63388` |
| `CONNECTIONS.md` | `3652f3eb3033` |
| `PROGRESS.md` | `325f6d5a514e` |
| `src/components/Milestone.tsx` | `2169d61fc121` |
| `src/components/Milestone.test.tsx` | `c72ce52861b3` |
| `src/components/TimerScreen.tsx` | `2f77a2e37fbc` |
| `src/components/TimerScreen.test.tsx` | `6133c335df49` |
| `src/timer.css` | `69b1b8826a88` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 8 files, plus possibly the files of this packet in `packets/`, and nothing else:
- `M`: CODE_MAP.md, CONNECTIONS.md, PROGRESS.md, src/components/TimerScreen.tsx, src/components/TimerScreen.test.tsx, src/timer.css
- `??`: src/components/Milestone.tsx, src/components/Milestone.test.tsx

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 18 test files and 897 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 0 errors` (the same as before this packet).
- check-tags: `TAGS OK: 34 tags, 66 places` and `CONNECTIONS OK: 51 connections, 415 anchors, 52 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 8 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet): `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/Milestone.tsx`, `src/components/Milestone.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`.

Use the message `Packet 07C: the milestone message on the screen (30 seconds at the bottom, late tag, never catches a tap)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 07C
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
Open the Vercel link, go to Pro Timer, on the laptop and on the phone:
1. Start a session and let it reach 15 minutes. One line comes in word by word at the BOTTOM of the screen, its marked keywords play their effect, it stays about 30 seconds, then fades and goes away. Nothing moves while it comes and goes, and Pause works while it is there.
2. To see a missed message: leave the page (another tab, or lock the phone) at about 12 minutes and come back at about 20. The 15 minute line comes with the tag "5 min earlier". Come back less than 5 minutes after a milestone: the message comes with no tag. Come back more than 10 minutes after it: nothing comes.
3. Tap Pause while the message shows: it goes away at once, and Resume does not bring it back.
4. Hold to end session while it shows: the stop alert covers it.
5. On a very low phone screen there is no room under the buttons, so the message floats over the lower part of them. It never catches a tap, so they still work. Look at this on the smallest phone you have and say if you want it moved.
6. On a device without WebGL 2, or with `?lite=2` in the page address, no line talks about the ball or the rays. A late message never does either.
7. Known on purpose: the 30 seconds are not paused when you look away in the middle of them (the message was seen when it started).

## HOW IT WAS CHECKED (outside the agent)
- On a fresh clone of your repo at commit 47538fc (Packet 07A), the 07B files were put on and committed, then the 07C files were put on top. Every check above was run after each step: after 07B 17 files / 860 tests, after 07C 18 files / 897 tests; tsc silent, lint 18 warnings and 0 errors, checker 34 tags / 66 places and 51 connections / 415 anchors, build ok.
- Before the 07C files went on, the clone gave the numbers that STEP 0 asks for.
- Not checked: a real browser, your phone, your real Supabase database. The screen was tested with the jsdom tests only (what it draws, the 30 second and fade times, the css rules, what it tells the hook that it draws); it was not driven in Chromium for this packet, so the look at the bottom of a small phone screen is for your eyes (list above).
