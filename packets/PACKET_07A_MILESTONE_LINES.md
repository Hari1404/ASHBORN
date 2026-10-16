# PACKET 07A: THE MILESTONE LINES (288 lines for the minutes 15, 25, 45, 60, 90, 120, 150 and 180, and the choice of one line)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_07A_MILESTONE_LINES.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_07A_MILESTONE_LINES.md`) and `ASHBORN_07A_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 6 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 6 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`, `src/lib/stopAlertLines.ts`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
1. The words of the milestone messages: one bank for each of the eight minutes of `MILESTONE_MINUTES` (15, 25, 45, 60, 90, 120, 150, 180). Each bank has 36 lines: 34 general lines and two lines about the glowing ball and the rays of light. 288 lines in all, about a third of them satirical (deadpan, mock news, fake official statements). The words are the file `ASHBORN_MILESTONE_LINES.md` that the owner has seen; the code file was made from it by a script, not typed.
2. The choice of one line: `pickMilestoneLine` shuffles like the stop alert lines (no line twice before all lines of the pool were shown, a new round never starts with the line that ended the old one). The line about the ball is only in the pool when the ball is drawn and the line about the rays only when the rays are drawn, so the pool has 34, 35 or 36 lines. The two times of the message are written down: 6 seconds on the screen and 500 ms of fade (the same as the comeback message).
3. NEW TAG (decided by the planner, the agent does not invent it): `AB:TIMER.MILESTONE-LINES`, in the new file `src/lib/milestoneLines.ts`. The tag `AB:TIMER.TESTS` grows (new file `src/lib/milestoneLines.test.ts`).
4. ONE WORD CHANGED in an old file: in `src/lib/stopAlertLines.ts` the function `nextIndex` is now `export function nextIndex(` (it was `function nextIndex(`), because the milestone lines are shuffled by the same function. Nothing else in that file changes.
5. NEW CONNECTION: C50 in CONNECTIONS.md (the lines, the minutes of MILESTONE_MINUTES, the cut-offs, the ball and the rays, the shared shuffling, the length of the message). CODE_MAP.md: one row added (`AB:TIMER.MILESTONE-LINES`), the rows of the page code TIMER, `AB:TIMER.ALERT-LINES` and `AB:TIMER.TESTS` changed. PROGRESS.md: one line for this packet and one line under "Next".
6. NOTHING ON THE SCREEN CHANGES. No hook and no screen use the lines yet: Packet 07B (the hook announces a milestone) and Packet 07C (the screen shows it) come next. The database does not change. No new dependency.
7. Line endings: the zip holds the three doc files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 33 tags, 63 places` and `CONNECTIONS OK: 50 connections, 380 anchors, 49 classes, 2 css variables, 2 label links`. Tests: 17 files, 834 tests (810 before plus 24 new).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These must exist: `packets/ASHBORN_07A_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/stopAlertLines.ts`, `src/lib/timerMaths.ts`, `src/lib/ballLook.ts`, `src/lib/backgroundLook.ts`, `src/lib/lineMarkup.ts`.
2. These two files must NOT exist yet: `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`. If one exists, this packet has already been run: **STOP** and report "Packet 07A has already been run." `src/lib/timerMaths.ts` must contain the text `export const MILESTONE_MINUTES` and `export const MAX_LIVE_STEP_SECONDS`. `CONNECTIONS.md` must NOT contain `### C50:`. `PROGRESS.md` must NOT contain `Packet 07A`.
3. `git log --oneline -1` must start with `Packet 06E`. `git status --porcelain` must show nothing, except possibly the files of this packet in `packets/`. Anything else: **STOP** and report the output.
4. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 32 tags, 61 places
CONNECTIONS OK: 49 connections, 363 anchors, 49 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 4 that exist and creating the 2 new ones. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_07A_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_07A_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 6 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/lib/milestoneLines.ts src/lib/milestoneLines.test.ts src/lib/stopAlertLines.ts

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `c80a4329620c` |
| `CONNECTIONS.md` | `85a0a9cf42dd` |
| `PROGRESS.md` | `f6179b1db3d1` |
| `src/lib/milestoneLines.ts` | `bd67493d284c` |
| `src/lib/milestoneLines.test.ts` | `f8ade6712235` |
| `src/lib/stopAlertLines.ts` | `bb733f29ac11` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 6 files, plus possibly the files of this packet in `packets/`, and nothing else:
- `M`: CODE_MAP.md, CONNECTIONS.md, PROGRESS.md, src/lib/stopAlertLines.ts
- `??`: src/lib/milestoneLines.ts, src/lib/milestoneLines.test.ts

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 17 test files and 834 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 0 errors`. These are the same as before this packet (older files). None may be in `milestoneLines.ts`, `milestoneLines.test.ts`, `stopAlertLines.ts`.
- check-tags: `TAGS OK: 33 tags, 63 places` and `CONNECTIONS OK: 50 connections, 380 anchors, 49 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 6 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet):
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/lib/milestoneLines.ts`, `src/lib/milestoneLines.test.ts`, `src/lib/stopAlertLines.ts`.

Use the message `Packet 07A: the milestone lines (288 lines in eight banks) and the choice of one line`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 07A
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
1. Nothing changes on the screen, so there is nothing to look at on the laptop or the phone.
2. Read the 288 lines in `ASHBORN_MILESTONE_LINES.md` (or in `src/lib/milestoneLines.ts`) and tell the planner which lines to change or cut. A line is one place in one file, so a reworded line is a small change; the tests tell the planner at once if a new wording says a number or a claim that is not true at that minute.
3. Decision for you: lines 35 and 36 of every bank talk about the ball and the rays. They are only shown where the ball and the rays are drawn (so a phone on the lightest setting, or a browser without WebGL 2, simply never gets them). If you would rather have no lines about the ball and the rays at all, say so before Packet 07B.

## HOW IT WAS CHECKED (outside the agent)
- The 6 files were put on a fresh clone of your repo at commit 9efe10a (Packet 06E, the pushed one) and every check above was run there: 17 files / 834 tests pass (810 before plus 24 new), tsc silent, lint 18 warnings and 0 errors (the same 18 as before, none in the new files), checker 33 tags / 63 places and 50 connections / 380 anchors, build ok.
- The 288 lines were counted and compared with the markdown: 8 banks of 36, no line twice, longest line 122 characters (it must be read in 6 seconds), and the earlier wording fixes are in (lines that used the quality words solid and deep, which the timer uses for other cut-offs, and a general line that talked about the ball, which would be false where no ball is drawn).
- Every line that has a number or a number word was read again against its minute (for example 25 minutes leaves 20 to a real session; 60 minutes plus 30 reaches the full light of the rays at 90; 180 minutes is two 90-minute matches).
- The tests were broken on purpose, 10 ways, one at a time: a ball line with the wrong time, the word flow at 15 minutes, a general line that talks about the ball, a new number word (forty), a rays claim that is false, a line with no marked keyword, a line with four, an unknown effect name, a slot left in a line, and (in the checker) `nextIndex` made private again. Each break was caught by a named test or by the checker. The file was restored byte for byte after each one.
- Not checked: how the lines read on the screen (nothing shows them yet), and the real phone.
