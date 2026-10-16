# PACKET 07B1: REPAIR OF PACKET 07B (one test ran out of time on a slower computer)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_07B1_TEST_TIMEOUT.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: this packet is only for the state where Packet 07B was run, its 10 files are in the project but NOT committed, and STEP 4 stopped because `npm test` had one failing test: `shows every milestone of one long session once, when the person always looks, and never twice` ("Test timed out in 5000ms"). Put TWO files into the `packets/` folder: this file (`PACKET_07B1_TEST_TIMEOUT.md`) and `ASHBORN_07B1_files.zip`. Do NOT run Packet 07B again.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the one finished file is inside the zip. Do not open, edit, reformat, rename or "fix" it.
- Touch ONLY this 1 file: `src/lib/useTimer.hook.test.ts`. The other 9 files of Packet 07B stay exactly as they are. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS FIXES
The test faked a whole 3 hour session one second at a time (10,800 steps). It takes about 4.6 seconds on a fast computer, and a test may only take 5 seconds unless it says otherwise, so on a slower computer or a busy one it ran out of time. Nothing in the app was wrong: the app files of Packet 07B stay as they are.
The fixed test looks every 5 seconds (every milestone is a whole multiple of 5 seconds, so each one is still met on its own second), counts every appearance of a message (a milestone that came twice now fails it), and has its own time limit of 60 seconds. It is the same number of tests (860). No tag, no map row and no connection changes, so CODE_MAP.md, CONNECTIONS.md and PROGRESS.md are NOT touched.

Counts after this packet (the same as Packet 07B promised): `TAGS OK: 33 tags, 63 places` and `CONNECTIONS OK: 51 connections, 399 anchors, 49 classes, 2 css variables, 2 label links`. Tests: 17 files, 860 tests.

---

## STEP 0: Check the state (stop if ANY of them fails)
1. `packets/ASHBORN_07B1_files.zip` must exist. Run `git log --oneline -1`: the message must start with `Packet 07A`. If it starts with `Packet 07B`, Packet 07B was already committed: **STOP** and report the output.
2. Run `git status --short`. It must show exactly these 10 files as ` M` (modified), plus possibly the files of this packet in `packets/`, and nothing else: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.test.tsx`, `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`. If it shows nothing, Packet 07B was not extracted: **STOP** and report "Packet 07B has not been extracted."
3. `src/lib/useTimer.hook.test.ts` must contain the text `t <= 10_800; t++` and must NOT contain the text `t += 5`. If it is the other way round, this packet has already been run: **STOP** and report "Packet 07B1 has already been run."
4. Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/TimerScreen.test.tsx src/lib/milestoneLines.ts src/lib/milestoneLines.test.ts src/lib/timerMaths.ts src/lib/timerMaths.test.ts src/lib/useTimer.ts src/lib/useTimer.hook.test.ts

The 12 characters in front of each path must be exactly these (they are the 10 files as Packet 07B put them):

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

## STEP 1: Extract the zip into the project root
The zip holds one file. Extract it so that it lands at its own path and replaces the one that exists. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_07B1_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_07B1_files.zip .

Nothing may be extracted into `packets/` or anywhere else.

## STEP 2: Prove the file is exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" src/lib/useTimer.hook.test.ts

The 12 characters in front of the path must be exactly `4880de3d162a`. If they differ: **STOP** and report what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must still show exactly the same 10 files as ` M` as in STEP 0 (plus possibly the files of this packet in `packets/`), and nothing else. Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 17 test files and 860 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 0 errors`.
- check-tags: `TAGS OK: 33 tags, 63 places` and `CONNECTIONS OK: 51 connections, 399 anchors, 49 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything. (If `npm test` fails again with "timed out", report the name of the test and the time it took.)

## STEP 5: Commit and push (this is the commit of Packet 07B)
Commit ONLY the 10 files of STEP 0 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet): `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.test.tsx`, `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`.

Use the message `Packet 07B: the milestone message decides when it comes (waits for a look, late tag from 5 min, given up after 10 min)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 07B1
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent)
- After this packet Packet 07B is finished and pushed (its commit message is the one of Packet 07B). The next one is Packet 07C, unchanged: `PACKET_07C_MILESTONE_SCREEN.md` with `ASHBORN_07C_files.zip`.
- Packet 07C asks for `git log` to start with `Packet 07B`, 860 tests and the 07B counts. This packet gives exactly that.
- If you would rather start over: `git checkout .` in the project, then run the new `PACKET_07B_MILESTONE_HOOK.md` (it holds the fixed test too). The result is the same.

## HOW IT WAS CHECKED (outside the agent)
- On a fresh clone of your repo at commit 47538fc, the OLD Packet 07B files were put on (the state your agent stopped in), then the steps above were run as written: the 10 fingerprints of STEP 0 matched, the one file was replaced, STEP 4 gave 17 files / 860 tests, tsc silent, lint 18 warnings and 0 errors, checker 33 tags / 63 places and 51 connections / 399 anchors, build ok. Then Packet 07C was run on top of that: 18 files / 897 tests.
- The old test took 4.6 seconds alone and timed out as soon as the CPU was busy (the failure you got). The fixed test takes 1.9 seconds alone and 10 seconds with the CPU fully busy, and its limit is 60 seconds. It was broken on purpose (the hook forgetting that a milestone was shown) and it failed, as it should.
- Not checked: your own computer. The log you pasted lists the test files with their numbers from BEFORE Packet 07B (180 and 108 tests for two of them) but ends with 860 tests and the one failure, so it looks like the output of two runs put together. The failure itself is real: I got the same one.
