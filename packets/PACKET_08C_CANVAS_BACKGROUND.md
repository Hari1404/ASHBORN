# PACKET 08C: THE MOVING BACKGROUND IS DRAWN BY OUR OWN CANVAS

You are the coding agent. Do exactly the steps below, in order. Do not fix, improve or tidy anything that is not written here. If a step says STOP, stop and report; do not try to repair it.

Base: the project at commit `8d1ee17` on `master` (Packet 08A is the newest packet in it). The zip for this packet is `packets/ASHBORN_08C_files.zip`.

## WHAT THIS BUILDS
1. The moving background of the Pro Timer is drawn by our own canvas instead of the React Bits Grainient animation. Why: in development (React StrictMode) the library animation lost its graphics context and the background stayed gray. The new canvas makes its own canvas element in its effect and gives it back in the cleanup, so the second mount of StrictMode gets a new one.
2. It draws the picture of the owner's blend preview (`Grainient_blend_preview.html`): the same look within 1 of 255 per colour channel at 10, 30 and 90 minutes for all six palettes. It is NOT pixel for pixel the picture of the library animation (on purpose). Everything else of Packet 08A stays: the ramp of five colours that starts black, the colour steps, the 12 second blend, the palette of the glowing ball, the box, the css, the fade and the waits.
3. The library file `src/components/Grainient.tsx` stays in the project, is never edited and is not used any more.
4. NEW TAGS (decided by the planner, the agent does not invent them): `AB:TIMER.BG-CANVAS` in `src/components/BackgroundCanvas.tsx` (a new file) and `AB:TIMER.BG-RENDER` in `src/lib/backgroundRender.ts` (a new file). The tags `AB:TIMER.BG` (`TimerBackground.tsx`, which hands the ramp to the canvas, and `timer.css`), `AB:TIMER.BG-LOOK` (`backgroundLook.ts`, only comments changed) and `AB:TIMER.TESTS` also change.
5. NEW CONNECTION: C52 in CONNECTIONS.md (the canvas, its picture, its settings and its tests are tied together). The entries C37, C38 and C47 are brought up to date.
6. CODE_MAP.md: 2 rows added (`AB:TIMER.BG-CANVAS`, `AB:TIMER.BG-RENDER`), the rows `AB:TIMER.BG`, `AB:TIMER.BG-LOOK` and `AB:TIMER.TESTS` changed, the Grainient library row says it is no longer used.
7. PROGRESS.md: one line added for this packet and one line added under "Next" (the owner's look at 08C).
8. The database does not change. No new dependency.
9. Line endings: the zip holds all 13 files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 36 tags, 70 places` and `CONNECTIONS OK: 52 connections, 432 anchors, 49 classes, 2 css variables, 2 label links`. Tests: 20 files, 1080 tests (the canvas has 93 tests on a fake WebGL 2 context, the picture has 73).

---

## STEP 1: Extract the zip into the project root
Put only ONE copy of the zip in `packets/`, named exactly `ASHBORN_08C_files.zip` (if a copy named `ASHBORN_08C_files (1).zip` is there, do not use it). Extract the zip so that every file lands at its own path under the project root, replacing the 9 that exist and creating the 4 new ones. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_08C_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_08C_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 13 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/BackgroundCanvas.tsx src/components/BackgroundCanvas.test.tsx src/components/TimerBackground.tsx src/components/TimerBackground.test.tsx src/components/TimerScreen.tsx src/lib/backgroundRender.ts src/lib/backgroundRender.test.ts src/lib/backgroundLook.ts src/lib/backgroundLook.test.ts src/timer.css

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `c3fc20671907` |
| `CONNECTIONS.md` | `0066f243f283` |
| `PROGRESS.md` | `317f6c521a08` |
| `src/components/BackgroundCanvas.tsx` | `5e161239788f` |
| `src/components/BackgroundCanvas.test.tsx` | `8e62164d1a64` |
| `src/components/TimerBackground.tsx` | `89b07b968d6e` |
| `src/components/TimerBackground.test.tsx` | `7761f0f427be` |
| `src/components/TimerScreen.tsx` | `3a056153eba4` |
| `src/lib/backgroundRender.ts` | `8e524f37ecd9` |
| `src/lib/backgroundRender.test.ts` | `cd2304a88141` |
| `src/lib/backgroundLook.ts` | `4df5fa8cfb02` |
| `src/lib/backgroundLook.test.ts` | `f3f6f97ce62c` |
| `src/timer.css` | `436823f023c3` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 13 files, plus possibly the files of earlier packets and of this packet in `packets/` (they are not committed), and nothing else:
- `M`: CODE_MAP.md, CONNECTIONS.md, PROGRESS.md, src/components/TimerBackground.tsx, src/components/TimerBackground.test.tsx, src/components/TimerScreen.tsx, src/lib/backgroundLook.ts, src/lib/backgroundLook.test.ts, src/timer.css
- `??`: src/components/BackgroundCanvas.tsx, src/components/BackgroundCanvas.test.tsx, src/lib/backgroundRender.ts, src/lib/backgroundRender.test.ts

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 20 test files and 1080 tests, all passing.
- tsc: no output.
- lint: exactly `Found 19 warnings and 0 errors.` This is the same as before this packet (it was checked on a fresh clone at `8d1ee17`, without and with the 13 files). The one warning that points at a file of this packet is the old one at `src/components/TimerBackground.tsx:92` (setState in an effect). None may be in `BackgroundCanvas.tsx`, `BackgroundCanvas.test.tsx`, `backgroundRender.ts`, `backgroundRender.test.ts`, `backgroundLook.ts` or `TimerScreen.tsx`.
- check-tags: `TAGS OK: 36 tags, 70 places` and `CONNECTIONS OK: 52 connections, 432 anchors, 49 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 13 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add any zip or any packet):
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/BackgroundCanvas.tsx`, `src/components/BackgroundCanvas.test.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/lib/backgroundRender.ts`, `src/lib/backgroundRender.test.ts`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/timer.css`.

Use the message `Packet 08C: the moving background is drawn by our own canvas (BackgroundCanvas and backgroundRender instead of the Grainient library animation)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 08C
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
Open the Vercel link, go to Pro Timer, on the laptop and on the phone. Also run `npm run dev` on the laptop and look there (React StrictMode is on in development, which is where the old background turned gray).
1. Start a session. The background is not gray and not empty: the screen stays black at first, then at 10, 30 and 90 minutes the colours blend in slowly. Compare with `Grainient_blend_preview.html` at the same minutes: it should look like it.
2. It is a little different from Packet 08A (another picture, on purpose).
3. The page does not slow down and the phone does not get hot. The canvas draws every pixel of the screen; if it is too much, lower `dpr` in `BG_SETTINGS` (see CONNECTIONS.md C38 and C52). That is a change for a later packet, not for you.
4. The white digits stay readable over the lightest colours of all six palettes.

## HOW IT WAS CHECKED (outside the agent)
- The 13 files were put on a fresh clone of your repo at commit `8d1ee17` (the pushed one, `master`) and `git status --short` showed exactly the 13 files of STEP 3. `npm run lint` there printed `Found 19 warnings and 0 errors.` both before and after the 13 files, with no warning in the new files.
- The fingerprints of STEP 2 were computed from the zip with the same command that is written in STEP 2.
- Tests (20 files, 1080 tests), tsc, build and the checker counts, and a check in a real browser, were run in the earlier working session on these same files. They were not run again on your clone before this packet was written, which is why STEP 4 runs all of them.
- Not checked: your real phone, your real Supabase database, and the look by eye. Those are in the list above.
