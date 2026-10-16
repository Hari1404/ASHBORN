# PACKET 06C: THE COMEBACK MESSAGE (one line at the top of the screen for 6 seconds after GO BACK IN)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_06C_COMEBACK_MESSAGE.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_06C_COMEBACK_MESSAGE.md`) and `ASHBORN_06C_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 11 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 11 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/Comeback.tsx`, `src/components/Comeback.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/stopAlertLines.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/timer.css`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints TAGS FAILED or CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
1. After GO BACK IN lets a session go on, one comeback line (from the 120 comeback lines of Packet 05F0, chosen for the minutes the session had when it stopped) floats at the TOP of the Pro Timer screen, under the menu button, for 6 seconds. Its words come in one by one (the React Bits BlurText, the same as the line of the stop alert), then it fades out in half a second and goes away.
2. It takes no room from the clocks and the buttons (nothing moves when it comes and goes) and it never catches a tap, so Pause and Hold to end session work at once while it is there.
3. It is shown ONLY when GO BACK IN really resumed the session. A session that was already paused before the hold stays paused after GO BACK IN (that is Packet 05F1) and gets NO message, because most comeback lines say the clock is running.
4. It is taken away at once when the session is paused or ended (also when that happens on another device) and when Hold to end session is used again, and it does not come back when the session runs again. The comeback lines have their own shuffle: no line twice before all 20 lines of the bank were shown.
5. The marks of the lines (`[glow:words]`) are cut out and no text effect is drawn yet. The text effects are the next packet.
6. New: `src/components/Comeback.tsx` and its tests `src/components/Comeback.test.tsx`; the new tag `AB:TIMER.COMEBACK` (in Comeback.tsx and in timer.css); `COMEBACK_SHOW_MS = 6000` and `COMEBACK_FADE_MS = 500` in `src/lib/stopAlertLines.ts`; in `src/lib/useTimer.ts` the state of the message (`comeback`, `clearComeback`); one line in `TimerScreen.tsx` that draws it. NO new dependency, NO new file besides the two above, the library files are NOT edited, the database does not change.
7. NEW CONNECTION: C48 in CONNECTIONS.md. The anchor of C43 that points at the import line of `useTimer.ts` is changed (the import now also takes the comeback functions).
8. CODE_MAP.md: the TIMER status line, the rows `AB:TIMER.STATE`, `AB:TIMER.SCREEN`, `AB:TIMER.ALERT-LINES` and `AB:TIMER.TESTS` changed, and one new row `AB:TIMER.COMEBACK`. PROGRESS.md: one line for this packet, the "Next" list updated.
9. Tests: 39 new (14 for the hook, 19 for the message and its css, 6 for the screen).
10. Line endings: the zip holds all 11 files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 31 tags, 58 places` and `CONNECTIONS OK: 48 connections, 341 anchors, 47 classes, 2 css variables, 2 label links`. Tests: 15 files, 781 tests (742 before plus 39 new). Lint: `18 warnings and 0 errors` (the same as before this packet).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist: `packets/ASHBORN_06C_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/useTimer.ts`, `src/lib/stopAlertLines.ts`, `src/components/TimerScreen.tsx`, `src/components/StopAlert.tsx`, `src/timer.css`. If `src/lib/timerWarmup.ts` is missing, Packet 06A has not been run: **STOP** and report "Packet 06A has not been run."
2. `src/components/Comeback.tsx` must NOT exist, and `src/lib/stopAlertLines.ts` must NOT contain the text `COMEBACK_SHOW_MS`. If one of them does, this packet has already been run: **STOP** and report "Packet 06C has already been run."
3. `PROGRESS.md` must contain the text `- Packet 06B:` and must NOT contain the text `Packet 06C`. `CONNECTIONS.md` must NOT contain `### C48:`.
4. Run `git log --oneline -1`. The message must start with `Packet 06B`. Run `git status --porcelain`: it must show nothing, except possibly files inside `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 30 tags, 55 places
CONNECTIONS OK: 47 connections, 322 anchors, 45 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 9 files that exist and adding the 2 new ones. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_06C_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_06C_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 11 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/Comeback.tsx src/components/Comeback.test.tsx src/components/TimerScreen.tsx src/components/TimerScreen.test.tsx src/lib/stopAlertLines.ts src/lib/useTimer.ts src/lib/useTimer.hook.test.ts src/timer.css

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `c13a7898a070` |
| `CONNECTIONS.md` | `db1f095f3bbc` |
| `PROGRESS.md` | `f9dd378d1a92` |
| `src/components/Comeback.tsx` | `f9d27298e600` |
| `src/components/Comeback.test.tsx` | `3ba8a54c322c` |
| `src/components/TimerScreen.tsx` | `b06934a2403f` |
| `src/components/TimerScreen.test.tsx` | `ccd3fb94f15c` |
| `src/lib/stopAlertLines.ts` | `35aaf57cd0ec` |
| `src/lib/useTimer.ts` | `33723ae4d4f2` |
| `src/lib/useTimer.hook.test.ts` | `3a7141b42a1b` |
| `src/timer.css` | `c1881005ea96` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 11 files and nothing else, plus possibly files inside `packets/`: 9 with `M` (`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/stopAlertLines.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/timer.css`) and 2 with `??` (`src/components/Comeback.tsx`, `src/components/Comeback.test.tsx`).

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 15 test files and 781 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 0 errors`. If lint shows any error, or more than 18 warnings: **STOP** and report the COMPLETE output.
- check-tags: `TAGS OK: 31 tags, 58 places` and `CONNECTIONS OK: 48 connections, 341 anchors, 47 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 11 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet). The two new files must be added by name:
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/Comeback.tsx`, `src/components/Comeback.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/stopAlertLines.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/timer.css`.

Use the message `Packet 06C: the comeback message (one line at the top of the screen for 6 seconds after GO BACK IN)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 06C
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
IMPORTANT: I only saw the message in a headless browser on a plain black screen (see below). I have NOT seen it over your real ball and rays, and not on your phone. So the look is yours to judge. Run the app (`npm run dev`, or your Vercel link if it is deployed) and open Pro Timer:
1. Press Start, wait a few seconds, hold Hold to end session until the alert opens, then tap GO BACK IN. The alert closes, the clock goes on from the same number, and one line comes in word by word at the top of the screen, under the MENU button. After about 6 seconds it fades and is gone. Tell me: is it easy to read over the ball and the rays, is the 6 seconds right (too short, too long), and is the top of the screen the right place?
2. While the line shows, tap Pause. The line must go away at once, and Resume must not bring it back.
3. While the line shows, hold Hold to end session again. The alert opens with no line behind it. Tap GO BACK IN again: a different line comes (no line twice until all 20 of its group were shown).
4. Press Pause first, then hold Hold to end session and tap GO BACK IN. The session stays paused and NO line shows. This is on purpose (the lines say the clock is running). If you would rather see a line there too, tell me and I will write lines for a paused session.
5. Do 1 on the phone. A long line takes three rows on a phone: it must not touch the big clock or the buttons.
6. If your device is set to "reduce motion", the line shows and goes without the fades.

## HOW IT WAS CHECKED (outside the agent)
- I cloned the repo at the commit of Packet 06B (782bbcd), made the change, and ran everything on the clone: 15 files, 781 tests passed, tsc silent, lint 18 warnings and 0 errors (the same as before), check-tags 31/58 and 48/341, build ok.
- The new tests were tried against four deliberately broken versions of the code (a message even when the session stays paused; a message that is not forgotten when the session is paused; a check that ignores whether the session runs; a message that is taken away before its fade is over). Each one was caught by the new tests.
- A headless Chromium drew the message over a copy of the screen at phone size (390 x 780) and laptop size (1280 x 720), with the longest comeback line (113 characters, three rows). It stood at 64 to 147 px from the top, 125 px above the big clock on the phone, and did not touch the clocks or the buttons. Its opacity stayed 1 until 6.0 seconds and was 0 at 6.7 seconds.
- It was NOT tried over the real glowing ball and the real rays, and not on a real phone.
