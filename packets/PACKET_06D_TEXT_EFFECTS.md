# PACKET 06D: THE TEXT EFFECTS (glow, heat, shake, strike, ghost, rise on the keywords of the stop alert and of the comeback message)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_06D_TEXT_EFFECTS.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_06D_TEXT_EFFECTS.md`) and `ASHBORN_06D_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 11 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 11 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/Comeback.tsx`, `src/components/Comeback.test.tsx`, `src/components/LineText.tsx`, `src/components/LineText.test.tsx`, `src/components/StopAlert.tsx`, `src/components/StopAlert.test.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints TAGS FAILED or CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
1. The keywords that are marked in the lines of the stop alert and of the comeback message (the `[glow:words]` marks written in Packet 05F0) now get their effect. Before this packet the marks were only cut out and the text was plain.
2. A new component, `src/components/LineText.tsx`, shows the line. It replaces the React Bits BlurText in `StopAlert.tsx` and `Comeback.tsx` (BlurText cannot colour single words). The words still come in one by one with the same blur-in from the top (80 ms apart), now written in css. The library file `BlurText.tsx` is NOT edited and the login screen still uses it.
3. The six effects, each in plain css, each played ONCE shortly after its word has come in, then the word rests in its look. Nothing loops:
   - glow: bright white with a violet halo (the important or true thing)
   - heat: warms from white to ember orange (effort and earning)
   - shake: a tremble that dies down, left a little red (failure and flinching)
   - strike: the word dims and a line is drawn through it from the left (the fake thing)
   - ghost: flickers once and is left faint (nothing and fading)
   - rise: lifts, grows past its place and settles higher, in mint green (growing and stacking)
4. People who asked for less motion get the words and the effects at rest at once (colours stay, no movement).
5. Every effect is over before the comeback message starts to fade (a test counts it for the longest comeback line).
6. New: `src/components/LineText.tsx` and `src/components/LineText.test.tsx`; the new tag `AB:TIMER.LINE-TEXT` (in LineText.tsx and in timer.css, before the background's part). Changed: `StopAlert.tsx`, `Comeback.tsx` (they show their line with LineText), the two line rules in `timer.css` (the line is plain wrapping text now, not a flex row), and the three test files that used a stand-in for BlurText. NO new dependency, NO other new file, the library files are NOT edited, the database does not change.
7. NEW CONNECTION: C49 in CONNECTIONS.md. C42, C43 and C48 are updated (they said "no effect is drawn yet"); the anchor of C43 that pointed at the `plainText` import of `StopAlert.tsx` now points at the `LineText` import.
8. CODE_MAP.md: the TIMER status line, the rows of the stop alert, the comeback message, the line marks (`AB:TIMER.LINE-MARKUP`) and the tests changed, the BlurText row of the library table now names only the login screen, and one new row `AB:TIMER.LINE-TEXT`. PROGRESS.md: one line for this packet, the "Next" list updated (it now asks the owner one question, see FOR THE OWNER).
9. Tests: 24 new (22 in LineText.test.tsx, 1 in StopAlert.test.tsx, 1 in Comeback.test.tsx).
10. Line endings: the zip holds all 11 files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 32 tags, 61 places` and `CONNECTIONS OK: 49 connections, 360 anchors, 49 classes, 2 css variables, 2 label links`. Tests: 16 files, 805 tests (781 before plus 24 new). Lint: `18 warnings and 0 errors` (the same as before this packet).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist: `packets/ASHBORN_06D_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/components/Comeback.tsx`, `src/components/StopAlert.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/lineMarkup.ts`, `src/timer.css`. If `src/components/Comeback.tsx` is missing, Packet 06C has not been run: **STOP** and report "Packet 06C has not been run."
2. `src/components/LineText.tsx` must NOT exist. If it does, this packet has already been run: **STOP** and report "Packet 06D has already been run."
3. `PROGRESS.md` must contain the text `- Packet 06C:` and must NOT contain the text `Packet 06D`. `CONNECTIONS.md` must NOT contain `### C49:`.
4. Run `git log --oneline -1`. The message must start with `Packet 06C`. Run `git status --porcelain`: it must show nothing, except possibly files inside `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 31 tags, 58 places
CONNECTIONS OK: 48 connections, 341 anchors, 47 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 9 files that exist and adding the 2 new ones. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_06D_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_06D_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 11 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/Comeback.tsx src/components/Comeback.test.tsx src/components/LineText.tsx src/components/LineText.test.tsx src/components/StopAlert.tsx src/components/StopAlert.test.tsx src/components/TimerScreen.test.tsx src/timer.css

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `94935888ce36` |
| `CONNECTIONS.md` | `0a3f212f0b12` |
| `PROGRESS.md` | `058acc88be6c` |
| `src/components/Comeback.tsx` | `31f03d65455f` |
| `src/components/Comeback.test.tsx` | `f601f600d256` |
| `src/components/LineText.tsx` | `a930c4ac4bf7` |
| `src/components/LineText.test.tsx` | `9fca8ddb83f6` |
| `src/components/StopAlert.tsx` | `9666f1f078af` |
| `src/components/StopAlert.test.tsx` | `e8e8d1344340` |
| `src/components/TimerScreen.test.tsx` | `ba1c7c4ab142` |
| `src/timer.css` | `d96280e9e9d3` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 11 files and nothing else, plus possibly files inside `packets/`: 9 with `M` (`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/Comeback.tsx`, `src/components/Comeback.test.tsx`, `src/components/StopAlert.tsx`, `src/components/StopAlert.test.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`) and 2 with `??` (`src/components/LineText.tsx`, `src/components/LineText.test.tsx`).

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 16 test files and 805 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 0 errors`. If lint shows any error, or more than 18 warnings: **STOP** and report the COMPLETE output.
- check-tags: `TAGS OK: 32 tags, 61 places` and `CONNECTIONS OK: 49 connections, 360 anchors, 49 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 11 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet). The two new files must be added by name:
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/Comeback.tsx`, `src/components/Comeback.test.tsx`, `src/components/LineText.tsx`, `src/components/LineText.test.tsx`, `src/components/StopAlert.tsx`, `src/components/StopAlert.test.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`.

Use the message `Packet 06D: the text effects (glow, heat, shake, strike, ghost, rise) on the words of the stop alert and the comeback message`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 06D
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
IMPORTANT: I only saw the effects in a headless browser, on a plain page with a bright purple gradient standing in for the rays, at phone size (390 x 780) and laptop size (1280 x 720). I have NOT seen them over your real glowing ball and rays, and not on your phone. So the look is yours to judge. Run the app (`npm run dev`, or your Vercel link if it is deployed) and open Pro Timer:
1. Press Start, wait more than a minute, hold Hold to end session until the alert opens. The line comes in word by word as before, and its marked keywords play their effect once and then rest. Tell me for each of the six: is it easy to tell apart, and is it the right feeling? In my test: glow was the softest (a bright word with a halo, only a little different from plain white), heat and rise were the clearest, ghost is meant to be faint.
2. Wait a few seconds: nothing may keep moving. Every effect plays once.
3. Tap GO BACK IN. The comeback line at the top does the same. Every effect must be finished before the line fades (after 6 seconds). Look at it on the brightest rays: can you still read every keyword, also the faint ghost and the dimmed strike word?
4. Hold to end session again and look at a different line: the effects must be different words and the line must come in the same way.
5. On the phone: does anything get warm or slow while the alert is open? It should not (no loop, no blur behind the text).
6. If your device is set to "reduce motion": the line and the effects are there at once, with their colours and without any movement.

ONE QUESTION FOR YOU: in the notes I had written "a keyword effect shows only the first time a line is read". I could not find where that is defined, so this packet does the simple thing: every time a line is shown, its effects play once. The shuffle already means you do not see the same line again before all 20 or 22 lines of its group were shown. If you want the effects to be switched off for a line you have already seen, tell me, and I will write that as its own small packet (it needs a memory of seen lines). It is the first item of the "Next" list in PROGRESS.md until you answer.

## HOW IT WAS CHECKED (outside the agent)
- I cloned the repo at the commit of Packet 06C (ae5a875), made the change, and ran everything on the clone: 16 files, 805 tests passed, tsc silent, lint 18 warnings and 0 errors (the same as before), check-tags 32/61 and 49/360, build ok.
- The new tests were tried against five deliberately broken versions of the code (an effect that loops; an effect so slow that it is still playing when the comeback message fades; an effect box that always says glow; the reduced-motion rule taken out; the stop alert going back to plain text). Each one was caught by the tests.
- A headless Chromium drew the line over a stand-in background at phone and laptop size, at 0.9, 2.3 and 5.2 seconds: the words came in blurred and one by one, the effects played, and at rest every keyword had its look (orange, white with a halo, pink, struck through, faint, mint green). The comeback message was drawn the same way at phone size over a bright background, and stayed readable.
- It was NOT tried over the real glowing ball and the real rays, and not on a real phone.
