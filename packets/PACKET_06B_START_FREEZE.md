# PACKET 06B: THE START FREEZE (the moving background and the glowing ball are made a moment after Start, the heavy ball last)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_06B_START_FREEZE.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_06B_START_FREEZE.md`) and `ASHBORN_06B_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 11 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 11 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerBall.tsx`, `src/components/TimerBall.test.tsx`, `src/lib/backgroundLook.ts`, `src/lib/ballLook.ts`, `src/lib/timerWarmup.ts`, `src/lib/timerWarmup.test.ts`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
1. The Pro Timer froze for a moment when Start was pressed on the laptop. The two library animations (the moving background and the glowing ball) ask the browser for WebGL 2 and compile their programs for the graphics chip when they are made, and both were made in the same moment as the press of Start. Now, when a session starts, the clocks and the buttons answer first. The moving background (with its black box and its fade in) is made 300 ms later and the glowing ball 600 ms later. The ball goes last on purpose: it is the heavy one, and an animation that is made while another one is already drawing has to wait behind its drawing work.
2. A session that ends during the wait never makes the animation. The wait starts again for every new session (and when another device starts a new session, which changes the seed). A page opened in the middle of a session waits the same way. The WebGL 2 check now also comes after the wait, so the press of Start asks the browser nothing.
3. New code: the wait `useMountDelay` in `src/lib/timerWarmup.ts` (it is inside the existing tag `AB:TIMER.WARMUP`), and two numbers: `BG_MOUNT_DELAY_MS = 300` in `src/lib/backgroundLook.ts` and `BALL_MOUNT_DELAY_MS = 600` in `src/lib/ballLook.ts`. `TimerBall.tsx` and `TimerBackground.tsx` each get one line that asks the wait. NO new tag, NO new file, NO new dependency, NO css change. The library files (`CrystalizedBall.tsx`, `SideRays.tsx`) are NOT edited. The database does not change.
4. NEW CONNECTION: C47 in CONNECTIONS.md (the two waits, their order, the hook and the tests are tied together). The entries C35, C38 and C44 get changed anchors (the line with `ready`, and the import line of `timerWarmup`), and C44 gets one added sentence.
5. CODE_MAP.md: the TIMER status line and the rows `AB:TIMER.BALL-LOOK`, `AB:TIMER.BALL`, `AB:TIMER.BG-LOOK`, `AB:TIMER.BG`, `AB:TIMER.WARMUP` and `AB:TIMER.TESTS` changed.
6. PROGRESS.md: one line added for this packet, one line added under "Next".
7. Tests: 27 new (10 for the ball, 10 for the background, 7 for the wait itself). In the two test files the stand-in library components got names (`BallStandIn`, `RaysStandIn`), so the 2 lint errors that were there before this packet (they were in these two test files) are gone.
8. Line endings: the zip holds all 11 files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 30 tags, 55 places` and `CONNECTIONS OK: 47 connections, 322 anchors, 45 classes, 2 css variables, 2 label links`. Tests: 14 files, 742 tests (715 before plus 27 new). Lint: `18 warnings and 0 errors` (it was 18 warnings and 2 errors).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist in the project root or at their path: `packets/ASHBORN_06B_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/timerWarmup.ts`, `src/components/TimerBall.tsx`, `src/components/TimerBackground.tsx`. If `src/lib/timerWarmup.ts` is missing, Packet 06A has not been run: **STOP** and report "Packet 06A has not been run."
2. `src/lib/ballLook.ts` and `src/lib/backgroundLook.ts` must NOT contain the text `MOUNT_DELAY_MS`. If one does, this packet has already been run: **STOP** and report "Packet 06B has already been run."
3. `PROGRESS.md` must contain the text `- Packet 06A:` and must NOT contain the text `Packet 06B`. `CONNECTIONS.md` must NOT contain `### C47:`.
4. Run `git log --oneline -1`. The message must start with `Packet 06A`. Run `git status --porcelain`: it must show nothing, except possibly files inside `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 30 tags, 55 places
CONNECTIONS OK: 46 connections, 309 anchors, 45 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 11 files that exist. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_06B_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_06B_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 11 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/TimerBackground.tsx src/components/TimerBackground.test.tsx src/components/TimerBall.tsx src/components/TimerBall.test.tsx src/lib/backgroundLook.ts src/lib/ballLook.ts src/lib/timerWarmup.ts src/lib/timerWarmup.test.ts

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `cbbb203557e7` |
| `CONNECTIONS.md` | `7a3b72abf62b` |
| `PROGRESS.md` | `64b27c15888b` |
| `src/components/TimerBackground.tsx` | `cc655154d731` |
| `src/components/TimerBackground.test.tsx` | `098da8f882bd` |
| `src/components/TimerBall.tsx` | `7746d4aa5e86` |
| `src/components/TimerBall.test.tsx` | `6633430e6786` |
| `src/lib/backgroundLook.ts` | `f9e32413aadb` |
| `src/lib/ballLook.ts` | `1d41918d4b31` |
| `src/lib/timerWarmup.ts` | `e001f133f0d7` |
| `src/lib/timerWarmup.test.ts` | `8dbd939d215c` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 11 files, all with `M`, plus possibly files inside `packets/`, and nothing else:
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerBall.tsx`, `src/components/TimerBall.test.tsx`, `src/lib/backgroundLook.ts`, `src/lib/ballLook.ts`, `src/lib/timerWarmup.ts`, `src/lib/timerWarmup.test.ts`.

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 14 test files and 742 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 0 errors`. The 2 errors that were there before this packet are gone on purpose (see WHAT THIS BUILDS, point 7). If lint shows any error, or more than 18 warnings: **STOP** and report the COMPLETE output.
- check-tags: `TAGS OK: 30 tags, 55 places` and `CONNECTIONS OK: 47 connections, 322 anchors, 45 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 11 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet):
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerBall.tsx`, `src/components/TimerBall.test.tsx`, `src/lib/backgroundLook.ts`, `src/lib/ballLook.ts`, `src/lib/timerWarmup.ts`, `src/lib/timerWarmup.test.ts`.

Use the message `Packet 06B: the Start freeze (the moving background is made 300 ms and the glowing ball 600 ms after Start, not in the moment of the press)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 06B
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
IMPORTANT: I could not test this on a real laptop. I only tested it in a headless browser with a software graphics chip (see below), where your freeze does not show up. So the real test is yours. Run the app on the laptop (`npm run dev`, or your Vercel link if it is deployed) and open Pro Timer:
1. Press Start. The clocks and the buttons must answer at once. Then the moving background fades in after about a third of a second, and the glowing ball lights after about two thirds of a second. Tell me which of these three words fits: **no freeze**, **a short hiccup**, or **the same freeze as before**. If you can, also say WHEN it hiccups (right at Start, when the rays come, or when the ball comes).
2. Press Start and then, within half a second, Hold to end session and tap I'M DONE. Nothing should come in late afterwards (no ball, no rays).
3. Start a session, wait a few seconds, then reload the page. The rays come in after about a third of a second, the ball after about two thirds, and opening the page does not freeze.
4. On the phone do the same as 1. With `?lite=2` at the end of the page address there are no animations at all, as before.
5. If the freeze is still there, I need to see what the page is busy with. On the laptop in Chrome: press F12, open the "Performance" tab, press the round Record button, press Start on the timer, wait 3 seconds, press Stop. Take a screenshot of the whole result (the long red-marked bars are the freeze) and send it to me. That tells me what to fix next. The packet is one commit, so if it is worse than before, tell me and I will make the undo packet.

## HOW IT WAS CHECKED (outside the agent)
- I cloned the repo at the commit of Packet 06A (b046a36), made the change, and ran everything on the clone: 14 files, 742 tests passed, tsc silent, lint 18 warnings and 0 errors, check-tags 30/55 and 47/322, build ok.
- The new tests were tried against two deliberately broken versions of the wait (one that does not stop when the session ends, one that ignores the end of the session); both were caught by the new tests.
- A headless Chromium with a SOFTWARE graphics chip (no real GPU) was used to compare the time the page is held after Start. It is not your laptop, so the numbers only show the direction:
  - before this packet (both made at once): the page was held for about 120 to 220 ms.
  - first idea (ball first at 300 ms, background after at 900 ms): the page was held for 1.5 to 3 seconds when the background came, because it waited behind the ball's drawing. That is why the ball goes LAST in this packet.
  - this packet (background at 300 ms, ball at 600 ms): about 80 to 170 ms.
  So in that test this packet is about as good as before, not better. What it adds is that the press of Start itself is answered first. Whether that cures YOUR freeze depends on what your graphics chip is busy with, which only your laptop can show (point 5 above).
