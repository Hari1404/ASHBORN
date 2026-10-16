# PACKET 06A: THE PRO TIMER OPENS QUICKLY (warm-up, both reads at once, a calm loading look)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_06A_LOADING.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_06A_LOADING.md`) and `ASHBORN_06A_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 17 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 17 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `index.html`, `src/components/SignedInStub.tsx`, `src/components/SignedInStub.test.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerBall.tsx`, `src/components/TimerBall.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/timerWarmup.ts`, `src/lib/timerWarmup.test.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/timer.css`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
The Pro Timer screen opens slowly the first time: two waits in a row for the database, two WebGL tests while the menu closes, a cold connection, digits that appear in another font and zeros that jump to the real numbers. This packet fixes those, and only those. The freeze when Start is pressed is NOT in this packet.
1. **Both reads at once.** `useTimer.ts` asks for the state and for the day total at the same moment, not one after the other. The day total is first asked for the day of this device; when the state then names another day (a session started in another time zone, or a device clock that is a day off) the day total is asked again for the right day and the first answer is thrown away. Both functions only read, so nothing in the database changes. (CONNECTIONS.md C45)
2. **The WebGL 2 check is asked once, and late.** The ball and the moving background no longer ask the browser for a test context each when the screen opens. One function, `canDrawWebgl2` in the new file `src/lib/timerWarmup.ts`, asks once for the whole page, remembers the answer, and is asked only when a session is shown. (C35, C38, C44)
3. **A warm-up that runs once.** A moment after the first picture (the quiet moment of the browser, or 800 ms in Safari), whichever screen is shown, `warmTimerScreen` loads the font of the clock digits, asks the database once for the state and the day total (this opens the connection; the answers are thrown away) and does the WebGL 2 check. A page opened straight on `#timer` skips the database part, because that screen reads it at once. Everything in it is caught and ignored: it can never break the screen. It is started from `SignedInStub.tsx`. (C44)
4. **A preconnect line** in `index.html` opens the connection to the database while the page is still loading. It uses the same setting `VITE_SUPABASE_URL` as the database client. (C44)
5. **A calm loading look.** While the first reading is on its way the two clocks are invisible (no zeros that jump) and a faint blank pill, the size of the Start pill, stands where the buttons will be. It is not a button and has no text, so a running session never shows a wrong label. When the reading is there the clocks and the buttons fade in together (300 ms). A person who asked their device for less motion gets no fade and no breathing. This replaces the old rule that dimmed the whole dial to 45 percent. (C46)
6. NEW TAG (decided by the planner, the agent does not invent it): `AB:TIMER.WARMUP`, in the new file `src/lib/timerWarmup.ts`. The tag `AB:TIMER.TESTS` gets a new place in `src/lib/timerWarmup.test.ts`. The tags `AB:TIMER.BALL`, `AB:TIMER.BG`, `AB:TIMER.STATE`, `AB:TIMER.SCREEN` and `AB:AUTH.STUB` also change.
7. NEW CONNECTIONS: C44 (the WebGL check, the warm-up, the font, the preconnect line), C45 (both reads at once), C46 (the loading look). The entries C35 and C38 are changed (the check moved from the two components into `timerWarmup.ts`).
8. CODE_MAP.md: 1 row added (`AB:TIMER.WARMUP`), the rows `AB:AUTH.STUB`, `AB:TIMER.STATE`, `AB:TIMER.SCREEN`, `AB:TIMER.BALL`, `AB:TIMER.BG` and `AB:TIMER.TESTS` changed, the TIMER status line changed. PROGRESS.md: one line added for this packet and one line under "Next".
9. The database does not change. No new dependency.
10. Line endings: the zip holds every file with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 30 tags, 55 places` and `CONNECTIONS OK: 46 connections, 309 anchors, 45 classes, 2 css variables, 2 label links`. Tests: 14 files, 715 tests (664 before plus 51 new).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist: `packets/ASHBORN_06A_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/timerApi.ts`, `src/lib/useTimer.ts`, `src/components/StopAlert.tsx`, `src/components/TimerBall.tsx`, `src/components/TimerBackground.tsx`. If `src/components/StopAlert.tsx` is missing, Packet 05F1 has not been run: **STOP** and report "Packet 05F1 has not been run. Run it first."
2. These two files must NOT exist yet: `src/lib/timerWarmup.ts`, `src/lib/timerWarmup.test.ts`. If one exists, this packet has already been run: **STOP** and report "Packet 06A has already been run."
3. `PROGRESS.md` must contain the text `- Performance fix 1` and must NOT contain the text `Packet 06A`. `CONNECTIONS.md` must NOT contain `### C44:`.
4. Run `git log --oneline -1`. The message must start with `Performance fix 1`. Run `git status --porcelain`: it must show nothing, except possibly the files of this packet in `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 29 tags, 53 places
CONNECTIONS OK: 43 connections, 277 anchors, 44 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 15 that exist and creating the 2 new ones. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_06A_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_06A_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 17 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md index.html src/components/SignedInStub.tsx src/components/SignedInStub.test.tsx src/components/TimerBackground.tsx src/components/TimerBackground.test.tsx src/components/TimerBall.tsx src/components/TimerBall.test.tsx src/components/TimerScreen.tsx src/components/TimerScreen.test.tsx src/lib/timerWarmup.ts src/lib/timerWarmup.test.ts src/lib/useTimer.ts src/lib/useTimer.hook.test.ts src/timer.css

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `3d282c9c93a9` |
| `CONNECTIONS.md` | `d132412f146e` |
| `PROGRESS.md` | `5ea6dcbd8e4b` |
| `index.html` | `0394f9ddb918` |
| `src/components/SignedInStub.tsx` | `4be4f615d7bd` |
| `src/components/SignedInStub.test.tsx` | `3822d7befa97` |
| `src/components/TimerBackground.tsx` | `dd6452ed9e90` |
| `src/components/TimerBackground.test.tsx` | `8f45603345bc` |
| `src/components/TimerBall.tsx` | `c96993c6821e` |
| `src/components/TimerBall.test.tsx` | `539eff585c4d` |
| `src/components/TimerScreen.tsx` | `15021de3c7f6` |
| `src/components/TimerScreen.test.tsx` | `f9586d4ef83b` |
| `src/lib/timerWarmup.ts` | `a9cadf870bc5` |
| `src/lib/timerWarmup.test.ts` | `8d8c48209603` |
| `src/lib/useTimer.ts` | `9da09875b48f` |
| `src/lib/useTimer.hook.test.ts` | `77ca28a3bfcd` |
| `src/timer.css` | `0b637603e25c` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 17 files, plus possibly the files of this packet in `packets/`, and nothing else:
- `M`: CODE_MAP.md, CONNECTIONS.md, PROGRESS.md, index.html, src/components/SignedInStub.tsx, src/components/SignedInStub.test.tsx, src/components/TimerBackground.tsx, src/components/TimerBackground.test.tsx, src/components/TimerBall.tsx, src/components/TimerBall.test.tsx, src/components/TimerScreen.tsx, src/components/TimerScreen.test.tsx, src/lib/useTimer.ts, src/lib/useTimer.hook.test.ts, src/timer.css
- `??`: src/lib/timerWarmup.test.ts, src/lib/timerWarmup.ts

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 14 test files and 715 tests, all passing.
- tsc: no output.
- lint: exactly `18 warnings and 2 errors`. These are the same as before this packet (older files; the 2 errors are in TimerBackground.test.tsx and TimerBall.test.tsx). None may be in timerWarmup.ts, timerWarmup.test.ts, useTimer.ts or TimerScreen.tsx.
- check-tags: `TAGS OK: 30 tags, 55 places` and `CONNECTIONS OK: 46 connections, 309 anchors, 45 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 17 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet):
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `index.html`, `src/components/SignedInStub.tsx`, `src/components/SignedInStub.test.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerBall.tsx`, `src/components/TimerBall.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/timerWarmup.ts`, `src/lib/timerWarmup.test.ts`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/timer.css`.

Use the message `Packet 06A: the Pro Timer opens quickly (warm-up, both reads at once, loading look)`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 06A
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
Open the Vercel link, on the phone and on the laptop. Do each twice: once after a fresh sign in, once after a hard refresh.
1. Sign in, stay on Overview for a few seconds, then choose Pro Timer from the menu. The screen is black for a moment with a faint pill where the buttons will be, then the clocks and the buttons fade in together. No zeros that jump, no Start label that turns into Pause.
2. Start a session, then close the page and open it again straight on `#timer` (the address ending in `#timer`). With the session running, no Start button may show at any moment while it loads. The big clock must show the real time, not 00:00:00 first.
3. The small clock under the big one (the day total) must be the same number as before this packet, also for a session that was started on another device.
4. The digits are in Space Grotesk from the first moment (they do not change shape a moment after they appear).
5. If your phone is set to reduce motion: the clocks and the buttons appear with no fade and the pill does not breathe.
6. Turn the connection off and on: No connection and Try again still work, and the faint pill is not shown then.

## HOW IT WAS CHECKED (outside the agent)
- The 17 files were put on a fresh clone of your repo at commit dd0998e (Performance fix 1, the pushed one) and every check above was run there: 14 files / 715 tests pass, tsc silent, lint 18 warnings and 2 errors (the same as before, in the same two test files), checker 30 tags / 55 places and 46 connections / 309 anchors, build ok. The build was also run once with `VITE_SUPABASE_URL` set, to see that Vite fills in the preconnect line.
- The new tests cover: the WebGL check asked once for the whole page and not at all while there is no session or at lite level 2; the warm-up not running at once, running once per page load, using the idle callback or the 800 ms fallback, and nothing in it able to throw into the screen; the two reads at once, including a running session in another time zone and a device clock a day off, a failing state, a failing day total, and a late day total that must not overwrite a newer reading; the blank pill, the hidden clocks, the fade rules and the reduced motion rule.
- Not checked: the real screen in a real browser (laptop and phone), the real Supabase database, and how much faster it feels on your phone. That is what the list above is for. If the fade looks wrong on the phone, tell me what you see; nothing else in the packet depends on it.
- Known detail: if `VITE_SUPABASE_URL` is missing when the page is built, Vite leaves the preconnect line as it is and the browser ignores it. On Vercel the setting is there, because the sign in works.
