# PACKET 06E: GO BACK IN LEAVES THE SESSION PAUSED (the comeback message comes at the Resume that follows)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_06E_GO_BACK_IN_STAYS_PAUSED.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: put TWO files into the `packets/` folder of the project: this file (`PACKET_06E_GO_BACK_IN_STAYS_PAUSED.md`) and `ASHBORN_06E_files.zip`. If an older copy of this packet is already in `packets/`, replace it.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. This packet has no code to type: the 5 finished files are inside the zip. Do not open, edit, reformat, rename or "fix" any of them.
- Touch ONLY these 5 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`. Do not scan or explore the project. Install nothing.
- If a check does not give the expected result, or any step fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.** If `node scripts/check-tags.mjs` prints CONNECTIONS FAILED, report the full output and do not fix it.
- Do not commit the zip file and do not commit this packet file.

## WHAT THIS BUILDS
1. **The bug:** GO BACK IN used to start the clock again by itself (it called Resume for the person). The comeback message then showed while the clock was already running, and the person never pressed play. That defeats the point of the message.
2. **The fix:** GO BACK IN now only closes the stop alert. The session stays **paused**, exactly as it is, and nothing is sent to the database. The Resume button is there. When the person presses **Resume**, the session runs again and the comeback message shows (one line at the top for 6 seconds, as before).
3. This is true for a session that the hold paused AND for a session that was already paused before the hold (before this packet that one never got a message).
4. A plain Pause and Resume, with no hold and no GO BACK IN, gets no message. Only the first Resume after GO BACK IN gets one.
5. What GO BACK IN leaves behind is a small note for that one pause (the seconds it stopped at, the session, the pause). The note is forgotten when the session is resumed, ended or paused again (here or on another device), and a new Hold to end session throws the old note away.
6. The comeback line is still picked for the seconds the session stopped at, so the minutes in the line are true. The time on the alert and the time between GO BACK IN and Resume are never counted (the session is paused the whole time).
7. Code changed: only `src/lib/useTimer.ts` (and its tests in `src/lib/useTimer.hook.test.ts`). The screen, the alert, the comeback component and the css are the same files as before. No new tag, no new dependency, nothing in the database.
8. Docs: `CONNECTIONS.md` entries C43 and C48 are changed (in C43 one anchor is changed; in C48 one anchor is changed and 3 are added), `CODE_MAP.md` has 4 changed phrases, `PROGRESS.md` has one line added for this packet and the line under "Next" about Packet 06C is changed.
9. Line endings: the zip holds the files with plain line feeds (LF), which is also how git stores them on GitHub. Messages about "LF will be replaced by CRLF" on Windows are normal.

Counts after this packet: `TAGS OK: 32 tags, 61 places` and `CONNECTIONS OK: 49 connections, 363 anchors, 49 classes, 2 css variables, 2 label links`. Tests: 16 files, 810 tests (805 before; the hook test file got 5 more).

---

## STEP 0: Check what this packet needs (stop if ANY of them fails)
1. These files must exist: `packets/ASHBORN_06E_files.zip`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/Comeback.tsx`.
2. `src/lib/useTimer.ts` must NOT contain the text `pendingRef`. If it does, this packet has already been run: **STOP** and report "Packet 06E has already been run."
3. `PROGRESS.md` must contain the text `- Packet 06D:` and must NOT contain the text `Packet 06E`.
4. Run `git log --oneline -1`. The message must start with `Packet 06D`. Run `git status --porcelain`: it must show nothing, except possibly the files of this packet in `packets/`. Anything else: **STOP** and report the output.
5. Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 32 tags, 61 places
CONNECTIONS OK: 49 connections, 360 anchors, 49 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 1: Extract the zip into the project root
Extract the zip so that every file lands at its own path under the project root, replacing the 5 files that exist. Use one of these (the first that works):

    PowerShell:  Expand-Archive -LiteralPath packets\ASHBORN_06E_files.zip -DestinationPath . -Force
    Python:      python -m zipfile -e packets/ASHBORN_06E_files.zip .

Nothing may be extracted into `packets/` or anywhere else (the test runner would pick up a second copy of a test file and fail).

## STEP 2: Prove the 5 files are exact
Run this from the project root (one line):

    node -e "const c=require('crypto'),f=require('fs');for(const p of process.argv.slice(1))console.log(c.createHash('sha256').update(f.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trimEnd()).digest('hex').slice(0,12), p)" CODE_MAP.md CONNECTIONS.md PROGRESS.md src/lib/useTimer.ts src/lib/useTimer.hook.test.ts

The 12 characters in front of each path must be exactly these (line endings do not matter, the command ignores them):

| file | fingerprint |
| --- | --- |
| `CODE_MAP.md` | `50039da6e464` |
| `CONNECTIONS.md` | `d895bb4ca483` |
| `PROGRESS.md` | `ed1dfb3ac323` |
| `src/lib/useTimer.ts` | `aa285e70150f` |
| `src/lib/useTimer.hook.test.ts` | `52d52ee88d7a` |

If even one differs: **STOP** and report which file and what it printed.

## STEP 3: Check what changed
Run `git status --short`. It must show exactly these 5 files as `M`, plus possibly the files of this packet in `packets/`, and nothing else:
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`.

Anything else: **STOP** and report the output.

## STEP 4: Run the checks (all of them, in this order)
1. `npm test`
2. `npx tsc -b`
3. `npm run lint`
4. `node scripts/check-tags.mjs`
5. `npm run build`

Expected:
- npm test: 16 test files and 810 tests, all passing.
- tsc: no output.
- lint: exactly `Found 18 warnings and 0 errors.` (the same as before this packet). None may be in `useTimer.ts` or `useTimer.hook.test.ts`.
- check-tags: `TAGS OK: 32 tags, 61 places` and `CONNECTIONS OK: 49 connections, 363 anchors, 49 classes, 2 css variables, 2 label links`.
- build: ok (the warning about chunks larger than 500 kB is normal).

If any check fails: **STOP** and report which check, with the COMPLETE output. Do not fix anything.

## STEP 5: Commit and push
Commit ONLY the 5 files of STEP 3 and nothing else (do NOT use `git add -A`, do NOT add the zip or this packet):
`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/lib/useTimer.ts`, `src/lib/useTimer.hook.test.ts`.

Use the message `Packet 06E: GO BACK IN leaves the session paused, the comeback message comes at the Resume that follows`, then push to master. Do not change anything else.

## DONE CHECK
`node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK with the counts above, and the commit is pushed. When finished, reply with exactly these 5 lines and nothing else:
```
DONE 06E
tests: <files> files, <tests> tests passed
check-tags: <the TAGS OK line> / <the CONNECTIONS OK line>
tsc: <output or "no output">, lint: <the "Found ..." line>, build: <ok or the error>
commit: <commit id>
```

---

## FOR THE OWNER (not for the agent): what to look at after it is pushed
On the laptop and on the phone, open Pro Timer:
1. Start a session and let it run past one minute. Hold "Hold to end session" until it is full. The alert opens. Tap **GO BACK IN**.
2. The alert closes, the clock stays on the same number, and the button says **Resume**. No message yet. Wait 10 seconds: the clock must NOT move.
3. Tap **Resume**. The clock goes on from the same number and one comeback line shows at the top for about 6 seconds, then fades.
4. Now Pause the session yourself first, then hold "Hold to end session", tap GO BACK IN, and tap Resume. You get the message here too.
5. A plain Pause then Resume (no hold) shows no message.
6. Hold again after a comeback and tap I'M DONE: it saves the number that was on the clock when you held.

## HOW IT WAS CHECKED (outside the agent)
- The 5 files were made on a fresh clone of your repo at commit fb4a081 (Packet 06D, the pushed one). Every check above was run there: 16 files / 810 tests pass, tsc silent, lint `18 warnings and 0 errors` (same as before), checker 32 tags / 61 places and 49 connections / 363 anchors, build ok.
- Before the change, 10 of the old tests failed exactly where they said "GO BACK IN resumes the session" (the other 795 passed). Those 10 were rewritten for the new behavior (one of them now says that a session paused before the hold also gets the message at Resume) and 5 new ones were added: a plain Pause and Resume gets none, only the first Resume after GO BACK IN gets one, a second hold before Resume replaces the first note, and the note is forgotten when the session is resumed on another device and when it is ended on another device.
- NOT checked: the real screen driven in a browser for this packet (only the tests of the hook and the existing screen tests), your real Supabase database, and your real phone. The screen files did not change, so the screen tests are the same as before.
- The 06D text effects were rendered separately in headless Chromium from the pushed code (the stop alert and the comeback line with all six effects): they draw correctly there. That check is not part of this packet.
