# PACKET 05F1: THE STOP ALERT (Hold to end session opens an alert; I'M DONE ends the session, GO BACK IN lets it go on)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_05F1_STOP_ALERT.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_05F1_STOP_ALERT.md`) and `ASHBORN_05F1_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 10 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 10 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/StopAlert.tsx`, `src/components/StopAlert.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/timer.css`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
1. Hold to end session no longer ends the session. It pauses the session and opens a dark alert over the Pro Timer screen. The alert shows one stop alert line (word by word) for the minutes the session stopped at, and two buttons: **I'M DONE** (ends the session and saves the seconds of the moment it stopped) and **GO BACK IN** (the session goes on from where it stopped; only for a session shorter than 45 minutes).
2. The time spent on the alert is never counted, because the session is paused while the alert is open. The Hold Button says "Stopped" when it is full.
3. NEW TAG (decided by the planner, the agent does not invent it): `AB:TIMER.STOP-ALERT`. It is in two files: `src/components/StopAlert.tsx` (a new file) and `src/timer.css` (a new part, placed BEFORE the part `AB:TIMER.BG` on purpose, see C43). The tags `AB:TIMER.STATE` (useTimer.ts) and `AB:TIMER.SCREEN` (TimerScreen.tsx) also change, and `AB:TIMER.TESTS` grows.
4. NEW CONNECTION: C43 in CONNECTIONS.md (the stop alert, the pause, the screen and the lines are tied together). The entry C39 gets one changed anchor (`<div className="ab-timer-side" inert={timer.stopAlert !== null}>`) and one added sentence.
5. CODE_MAP.md: 1 row added (`AB:TIMER.STOP-ALERT`), the rows `AB:TIMER.SCREEN`, `AB:TIMER.STATE` and `AB:TIMER.TESTS` changed, the TIMER status line changed, the BlurText library row gets `AB:TIMER.STOP-ALERT` as a second place where it is used (BlurText itself is NOT edited).
6. PROGRESS.md: one line added for this packet; the line of Packet 05E2, whose text had been written into the end of the 05F0 line, is repaired; one line added under "Next".
7. The database does not change (the six timer functions stay as they are). No new dependency.
8. Line endings: the zip holds the three doc files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 29 tags, 53 places` and `CONNECTIONS OK: 43 connections, 271 anchors, 43 classes, 2 css variables, 2 label links`. Tests: 13 files, 660 tests (617 before plus 43 new).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist in the project root or at their path: `packets/ASHBORN_05F1_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/stopAlertLines.ts`, `src/lib/lineMarkup.ts`, `src/components/HoldButton.tsx`, `src/components/BlurText.tsx`. If `src/lib/stopAlertLines.ts` is missing, Packet 05F0 has not been run: **STOP** and report "Packet 05F0 has not been run. Run it first."
2. These two files must NOT exist yet: `src/components/StopAlert.tsx`, `src/components/StopAlert.test.tsx`. If one exists, this packet has already been run: **STOP** and report "Packet 05F1 has already been run."
3. `PROGRESS.md` must contain the text `- Packet 05F0:` and must NOT contain the text `Packet 05F1`. `CONNECTIONS.md` must NOT contain `### C43:`.
4. Run `git log --oneline -1`. The message must start with `Packet 05F0`. Run `git status --porcelain`: it must show nothing, except possibly the files of this packet in `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 28 tags, 50 places
CONNECTIONS OK: 42 connections, 254 anchors, 36 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 8 that exist and creating the 2 new ones. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_05F1_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_05F1_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 10 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/StopAlert.tsx src/components/StopAlert.test.tsx src/components/TimerScreen.tsx src/components/TimerScreen.test.tsx src/lib/useTimer.ts src/lib/useTimer.hook.test.ts src/timer.css

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `e7cd377d7d0d` |
| `CONNECTIONS.md` | `e2841395a714` |
| `PROGRESS.md` | `4852eb404ae6` |
| `src/components/StopAlert.tsx` | `ee676d1c032a` |
| `src/components/StopAlert.test.tsx` | `374d9eec08fa` |
| `src/components/TimerScreen.tsx` | `636ef4fed1b5` |
| `src/components/TimerScreen.test.tsx` | `c3db77f8f866` |
| `src/lib/useTimer.ts` | `5fba5a3b45cd` |
| `src/lib/useTimer.hook.test.ts` | `fb28c82eb93a` |
| `src/timer.css` | `3887fe890b28` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 10 files, plus possibly the files of this packet in `packets/`, and nothing else:
- `M`: CODE_MAP.md, CONNECTIONS.md, PROGRESS.md, src/components/TimerScreen.tsx, src/components/TimerScreen.test.tsx, src/lib/useTimer.ts, src/lib/useTimer.hook.test.ts, src/timer.css
- `??`: src/components/StopAlert.tsx, src/components/StopAlert.test.tsx

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 13 test files and 660 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 2 errors`. These are the same as before this packet (older files; the 2 errors are in TimerBackground.test.tsx and TimerBall.test.tsx). None may be in StopAlert.tsx, StopAlert.test.tsx, useTimer.ts or TimerScreen.tsx.
- check-tags: `TAGS OK: 29 tags, 53 places` and `CONNECTIONS OK: 43 connections, 271 anchors, 43 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 10 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet):
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/StopAlert.tsx`, `src/components/StopAlert.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/timer.css`.

Use the message `Packet 05F1: the stop alert (Hold to end session pauses and opens it; I'M DONE ends, GO BACK IN resumes)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 05F1
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
Open the Vercel link, go to Pro Timer, on the laptop and on the phone:
1. Start a session and let it run past one minute. Hold "Hold to end session" until it is full. The alert covers the screen, the clock behind it stands still, and the line names the minutes of the clock.
2. Stay on the alert for more than 30 seconds (the screen reads the database again in that time). The alert must stay open and the line must not change.
3. Tap GO BACK IN. The clock goes on from the same number it had when you held, not from a later one.
4. Hold again and tap I'M DONE. The line under the clock says Saved with the same number that was on the clock when you held.
5. GO BACK IN is only there for a session under 45 minutes.

## HOW IT WAS CHECKED (outside the agent)
- The 10 files were put on a fresh clone of your repo at commit 832dc2a (Packet 05F0, the pushed one) and every check above was run there: 13 files / 660 tests pass, tsc silent, lint 18 warnings and 2 errors (the same as before), checker 29 tags / 53 places and 43 connections / 271 anchors, build ok.
- The real screen was driven in Chromium at laptop size (1280 x 720) and phone size (390 x 844) against a fake database that counts like yours: Hold, alert, 36 seconds on the alert, GO BACK IN, Hold again, I'M DONE, no page errors. Clock frozen at 00:05:11, 25 seconds on the alert, I'M DONE saved exactly 00:05:11.
- The tests were also broken on purpose (stop not pausing, GO BACK IN not resuming, the alert ignoring which pause it belongs to): each break was caught by named tests.
- Not checked: your real Supabase database and your real phone. The rule that a paused session ends at the moment it was paused is in `timer_end` in `supabase/timer_schema.sql` (the line with `least(r.paused_at, v_end)`), which is why I'M DONE saves the seconds of the line.
