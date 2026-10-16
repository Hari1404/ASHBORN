# PACKET 07B: THE MILESTONE MESSAGE, PART 1 (the hook decides when a milestone message comes)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_07B_MILESTONE_HOOK.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_07B_MILESTONE_HOOK.md`) and `ASHBORN_07B_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 10 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 10 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.test.tsx`, `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
This is the part of the milestone message that DECIDES WHEN it comes. The screen that shows it is Packet 07C. After this packet nothing changes on the screen.
1. A milestone message (at 15, 25, 45, 60, 90, 120, 150 and 180 minutes of the session clock) now WAITS until the person is looking: the page is visible, the session is running, and no other milestone message is on the screen. Then it is picked at once.
2. A message that nobody saw is shown the moment the person looks again, up to 10 minutes after its milestone (`MILESTONE_KEEP_SECONDS = 600`). From 5 minutes late (`MILESTONE_EARLIER_FROM_SECONDS = 300`) it carries the number of whole minutes it is late (the tag "N min earlier" that Packet 07C draws); under 5 minutes there is no tag. After 10 minutes it is given up for good.
3. Only the newest waiting milestone is shown (an older one that is still waiting is given up), and each milestone is shown at most once per session. The lateness is counted in seconds of the session clock, so a pause does not make a message older. A message goes away when its session is paused (the stop alert pauses it) or ended, and that milestone stays done.
4. The two lines about the glowing ball and the rays of light speak of the moment of the milestone, so they are only in the pool when the message is on time (at most 10 seconds late) AND the screen says that it draws them (the new option `drawn` of the hook). Packet 07C gives the hook that option; until then nothing counts as drawn, so only the 34 general lines are picked.
5. Times and words: `MILESTONE_SHOW_MS` goes from 6000 to 30000 (the message will stay 30 seconds). The ball line of minute 25 now begins "About five minutes until the ball changes colour again" (it can be shown a little late). The tests of the ball and rays claims allow a tolerance of 0.7 minutes (`TOLERANCE_MINUTES`).
6. In `src/lib/timerMaths.ts`: the function `milestoneStep` and the type `MilestoneStep` are REMOVED (nothing else uses them) and replaced by `milestoneWaiting`, `milestoneDone`, `earlierMinutes`, `milestoneOnTime` and the type `MilestoneWaiting`, plus the two new numbers above.
7. In `src/lib/useTimer.ts`: `useTimer(options)` takes the optional `{ drawn }`; the view gets `milestone` and `clearMilestone`. `TimerScreen.tsx` is NOT changed in this packet (it still calls `useTimer()`); its test file only gets the two new fields in its fake view.
8. NO new tag. The tags `AB:TIMER.MATHS`, `AB:TIMER.STATE`, `AB:TIMER.MILESTONE-LINES` and `AB:TIMER.TESTS` change. NEW CONNECTION: C51 in CONNECTIONS.md (the hook, the maths, the times and the tests are tied together). The entry C50 gets three changed sentences.
9. CODE_MAP.md: no row added; the rows `AB:TIMER.STATE`, `AB:TIMER.MILESTONE-LINES`, `AB:TIMER.TESTS` and the TIMER status line are changed.
10. PROGRESS.md: one line added for this packet; the line under "Next" about the milestone lines is changed.
11. The database does not change. No new dependency.
12. Line endings: the zip holds the three doc files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 33 tags, 63 places` and `CONNECTIONS OK: 51 connections, 399 anchors, 49 classes, 2 css variables, 2 label links`. Tests: 17 files, 860 tests (834 before).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist: `packets/ASHBORN_07B_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/timerMaths.ts`, `src/lib/useTimer.ts`, `src/lib/milestoneLines.ts`. If `src/lib/milestoneLines.ts` is missing, Packet 07A has not been run: **STOP** and report "Packet 07A has not been run."
2. `src/lib/timerMaths.ts` must contain the text `milestoneStep` and must NOT contain the text `milestoneWaiting`. If it is the other way round, this packet has already been run: **STOP** and report "Packet 07B has already been run."
3. `PROGRESS.md` must contain the text `- Packet 07A:` and must NOT contain the text `- Packet 07B:`. `CONNECTIONS.md` must NOT contain `### C51:`.
4. Run `git log --oneline -1`. The message must start with `Packet 07A`. Run `git status --porcelain`: it must show nothing, except possibly the files of this packet in `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 33 tags, 63 places
CONNECTIONS OK: 50 connections, 380 anchors, 49 classes, 2 css variables, 2 label links
```
6. Run `npm test`. It must show 17 test files and 834 tests, all passing.
If any of these prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 10 files that exist. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_07B_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_07B_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 10 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/TimerScreen.test.tsx src/lib/milestoneLines.ts src/lib/milestoneLines.test.ts src/lib/timerMaths.ts src/lib/timerMaths.test.ts src/lib/useTimer.ts src/lib/useTimer.hook.test.ts

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `bbeae6c12a4b` |
| `CONNECTIONS.md` | `63d05e44f0db` |
| `PROGRESS.md` | `c80fc55e1163` |
| `src/components/TimerScreen.test.tsx` | `3334c1d637aa` |
| `src/lib/milestoneLines.ts` | `cadc7acccf63` |
| `src/lib/milestoneLines.test.ts` | `b83bfe4e75ed` |
| `src/lib/timerMaths.ts` | `004749d215bd` |
| `src/lib/timerMaths.test.ts` | `1484b377353b` |
| `src/lib/useTimer.ts` | `848c0b52356a` |
| `src/lib/useTimer.hook.test.ts` | `330bebcaa911` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 10 files as `M` (modified), plus possibly the files of this packet in `packets/`, and nothing else: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.test.tsx`, `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`.

Anything else (a new `??` file, a missing file): **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 17 test files and 860 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 0 errors` (the same as before this packet).
- check-tags: `TAGS OK: 33 tags, 63 places` and `CONNECTIONS OK: 51 connections, 399 anchors, 49 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 10 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet): `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.test.tsx`, `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`.

Use the message `Packet 07B: the milestone message decides when it comes (waits for a look, late tag from 5 min, given up after 10 min)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 07B
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent)
- After this packet there is NOTHING new on the screen. Open Pro Timer on the laptop and on the phone: it must work exactly as before (Start, Pause, Hold to end session, the stop alert, GO BACK IN). If it does, the next packet is 07C (the screen that shows the message).
- The line of minute 25 about the ball changed ("About five minutes until the ball changes colour again."). If you keep the file `ASHBORN_MILESTONE_LINES.md`, change that line there too (CONNECTIONS.md C50 says the file follows the code).
- Decisions in this packet, in case you want to change one before 07C: a missed message waits up to 10 minutes; the tag starts at 5 minutes late; only the newest message is shown; the message stays 30 seconds.

## HOW IT WAS CHECKED (outside the agent)
- The 10 files were put on a fresh clone of your repo at commit 47538fc (Packet 07A, the pushed one) and every check above was run there: 17 files / 860 tests pass, tsc silent, lint 18 warnings and 0 errors, checker 33 tags / 63 places and 51 connections / 399 anchors, build ok.
- Before the 07B files went on, the same clone gave 17 files / 834 tests and 50 connections / 380 anchors, which is what STEP 0 asks for.
- Not checked: a real browser, your phone, your real Supabase database. This packet changes no screen, and its hook is tested with the fake database of `useTimer.hook.test.ts` (visibility, 5 and 10 minute edges, pause, stop alert, ended on another device, a whole 3 hour session).
