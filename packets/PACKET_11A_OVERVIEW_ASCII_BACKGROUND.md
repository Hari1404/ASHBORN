# PACKET 11A: THE OVERVIEW BACKGROUND (Gradient ASCII with the four Studio presets at random, cell size 19, softer edges, no mouse, and the Sound Lab "reveal" sound with a 1.5 second intro; 15 whole files copied in by you, the agent edits nothing; no SQL; Part 2 is a try-out at your laptop and phone)

> **REVISION 2026-10-21 (read this first).** After this packet was written the owner asked for two changes, and the work was then applied, checked and pushed directly (branch `11a-overview-ascii`), NOT by the Antigravity agent: (1) the intro is **2 seconds** (not 1.5), and (2) the **whole 3.4 second Sound Lab sound** starts with the picture and rings out to its natural end; it is no longer cut with a fade at the end of the intro (the cut chopped the chord). Because of this 9 of the 15 files changed (GradientASCII.tsx, overviewLook.ts, overviewSound.ts, the three test files of those, CODE_MAP.md, CONNECTIONS.md, PROGRESS.md). So the SHA-256 table, the expected `check-tags` numbers (now `41 tags, 85 places` and `59 connections, 542 anchors, 89 classes`) and every sentence below about 1.5 seconds, the cut and the fade are OUT OF DATE. The tests, lint and build numbers are unchanged (28 files, 1596 tests, 21 lint warnings, build ok). Do NOT run this packet again. Open and not fixed on purpose: the white Menu button is hard to see on the bright top of the Atmosphere look on a phone, and the placeholder text of the Overview washes out on the bright core of the Lagoon look.

Paste this one line into the Antigravity agent:

    Read packets/PACKET_11A_OVERVIEW_ASCII_BACKGROUND.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it, three things (in this order):
1. Look at your project folder `F:\ASHBORN`: open a terminal there and run `git status --short` and `git log --oneline -1`. The newest commit must be `cfb8bb8` (it starts with `10G:`), and `git status --short` must print NOTHING (or only lines that start with `??`). If it prints a line with ` M` or anything else, STOP and tell the planner first: the copy in the next step REPLACES 5 files and would throw away a change you made in them. Also run `git ls-files --others --exclude-standard | Select-String "\.test\.tsx?$"`: it must print NOTHING. If it prints a path, a loose folder with old test files is inside the project and would make `npm test` fail: MOVE that folder out of `F:\ASHBORN` (do not delete it) and tell the planner.
2. Copy ALL of the contents of the folder `COPY_INTO_REPO` of the zip onto `F:\ASHBORN` (open `COPY_INTO_REPO`, select everything inside it, drag it onto `F:\ASHBORN`; never copy the folder `COPY_INTO_REPO` itself). Explorer merges the folders `src`, `src\components`, `src\lib` and `packets` and asks about files that already exist: choose REPLACE THE FILES IN THE DESTINATION (for all). These are 16 files: the 15 files of the table below (5 replace old files, 10 are new) and this packet itself (it goes into `F:\ASHBORN\packets`). Nothing else changes.
3. Stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time; step 5 says what the agent does then. If the agent stops half-way, the section IF THE AGENT STOPS HALF-WAY below says what to tell it in a NEW conversation.

Kind: build (a new moving background and a sound for one screen), no SQL, no new package. Written by the planner on 2026-10-21. Like 10F, 10F2 and 10G this packet is a WHOLE-FILE packet: **the agent edits NO file.** The 15 files come as whole files that YOU copy in, and the agent only checks that they are the right files (SHA-256), runs the checks, and commits and pushes them. Part 1 is done by the agent. Part 2 is done BY YOU BY HAND: you look at the Overview on the laptop and on the phone and listen to the sound.

## GOAL
The Overview screen (`#overview`, also the screen you get with no address) gets the React Bits animation Gradient ASCII as its moving background, instead of Dark Veil. All four presets of the React Bits Background Studio are used (Atmosphere, Lagoon, Rose, Corona) and one of them is picked at random every time the Overview opens (a real choice logic comes in a later packet). Your changes to the Studio look: cell size 19 for all four, softer edges, mouse interaction off (and no click effect). The Sound Lab sound `reveal` (your recipe, unchanged) plays with the intro, and the intro lasts 1.5 seconds (the library has 2.4). Calendar and Guide keep Dark Veil; the Pro Timer is untouched. Nothing in the database changes.

## RULES FOR THE AGENT
- **Edit NO file and create NO file.** The owner copied 16 files into the project (the 15 files of the table and this packet). This packet only checks them, runs commands, stages, commits and pushes. If a check or a test fails, do NOT fix anything: STOP and report.
- Do not run any SQL. Do not install anything. Do not touch `.env`. Decide nothing.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply. This packet brings FOUR new tags (`AB:OVERVIEW.BG`, `AB:OVERVIEW.LOOK`, `AB:OVERVIEW.SOUND`, `AB:OVERVIEW.TESTS`), written by the planner inside the copied files, in CODE_MAP.md and in CONNECTIONS.md (new C59). You do not invent, rename or delete any tag.
- The file `src/components/GradientASCII.tsx` is a React Bits library file with THREE edits made by the planner on purpose (marked `ASHBORN edit 1 of 3`, `2 of 3`, `3 of 3`; TAGGING_RULES.md rule 6 allows it when the packet says so, and CODE_MAP.md has its row). Do not change it, do not replace it with a fresh copy.
- A warning from git such as `LF will be replaced by CRLF the next time Git touches it` is normal on Windows: ignore it, it is not a failure.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5`, `git status --short` and `git ls-files --others --exclude-standard | Select-String "\.test\.tsx?$"`. Keep the raw output for the report. Expected: the newest commit is `cfb8bb8` (Packet 10G); `git status --short` shows exactly 5 lines that start with a SPACE and the letter `M` (` M CODE_MAP.md`, ` M CONNECTIONS.md`, ` M PROGRESS.md`, ` M src/components/SignedInStub.tsx`, ` M src/components/SignedInStub.test.tsx`: modified, NOT staged); apart from them only lines that start with `??` (the 10 new files of the table, this packet, and maybe old untracked files); and the third command prints NOTHING. **ANY OTHER UNTRACKED file is FINE: do not stop for it, do not touch it, never stage it.** STOP and report the raw output ONLY if: the newest commit is another one, or one of the 5 ` M` lines is missing, or ANY other file is modified, staged (a letter in the FIRST column) or deleted, or one of the 10 new files is missing, or the third command prints a path.
2. Check the 15 files. Run this one command (PowerShell) and keep the raw output:

       foreach ($f in 'CODE_MAP.md','CONNECTIONS.md','PROGRESS.md','src/components/SignedInStub.tsx','src/components/SignedInStub.test.tsx','src/components/GradientASCII.tsx','src/components/GradientASCII.test.tsx','src/components/OverviewBackground.tsx','src/components/OverviewBackground.test.tsx','src/lib/overviewLook.ts','src/lib/overviewLook.test.ts','src/lib/overviewSound.ts','src/lib/overviewSound.test.ts','src/lib/react-bits-sound.ts','src/overview.css') { (Get-FileHash -Algorithm SHA256 $f).Hash + ' ' + $f }

   Expected: exactly 15 lines, the same as the table THE 15 FILES below, line by line (capital or small letters do not matter). If one hash differs, STOP and report the 15 raw lines (the owner copied a wrong file or an old one).
3. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 41 tags, 85 places` and `CONNECTIONS OK: 59 connections, 543 anchors, 89 classes, 2 css variables, 2 label links`. (Before this packet: 37 tags, 77 places, 58 connections, 520 anchors and 88 classes.) If anything else is printed, STOP and report the raw output.
4. Run `npx tsc -b` and then `$LASTEXITCODE`. Expected: no output from `tsc` and `0`. If not, STOP and report the raw output.
5. Run `npm test`. Expected: `Test Files  28 passed (28)` and `Tests  1596 passed (1596)`. (Before this packet: 24 files and 1516 tests. New: `src/lib/overviewLook.test.ts` 24, `src/lib/overviewSound.test.ts` 24, `src/components/OverviewBackground.test.tsx` 14, `src/components/GradientASCII.test.tsx` 11 (four new files), and `src/components/SignedInStub.test.tsx` 14 to 21.) If a number differs, or a test fails for any reason other than a timeout, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond" (the computer is busy), do NOT change any file and do NOT stop: run `npm test -- --testTimeout=30000 --maxWorkers=4` ONCE. It runs the same tests with the same checks. If it prints the expected numbers, go on, and say in your report which of the two commands printed them. If it also fails, STOP and report the raw output of both runs.
6. Run `npm run lint -- --format=default`. Expected: the output has the line `Found 21 warnings and 0 errors.` (19 as before, plus two `Cannot access refs during render` warnings that come from the two unedited-by-lint library files `src/components/GradientASCII.tsx` and `src/lib/react-bits-sound.ts`; they are left as they are), followed by a line that starts with `Finished in`. If the `Found` line says another number, STOP and report the raw output.
7. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
8. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
9. Stage by name only (never `git add .`): `git add CODE_MAP.md CONNECTIONS.md PROGRESS.md src/components/SignedInStub.tsx src/components/SignedInStub.test.tsx src/components/GradientASCII.tsx src/components/GradientASCII.test.tsx src/components/OverviewBackground.tsx src/components/OverviewBackground.test.tsx src/lib/overviewLook.ts src/lib/overviewLook.test.ts src/lib/overviewSound.ts src/lib/overviewSound.test.ts src/lib/react-bits-sound.ts src/overview.css packets/PACKET_11A_OVERVIEW_ASCII_BACKGROUND.md`
10. Commit: `git commit -m "11A: Overview background (Gradient ASCII, four Studio presets at random, cell size 19, softer, no mouse, Sound Lab reveal sound with a 1.5 s intro; GradientASCII.tsx has three documented edits; no SQL)"`
11. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 6 lines, suggest nothing, start nothing)
`DONE 11A` then: `hashes 15 of 15`, the two raw lines of step 3, the raw `Test Files` and `Tests` lines of step 5 (as one line) and which command printed them, the raw `Found` line of step 6, and `git log --oneline -1`.

## THE 15 FILES (SHA-256 of each file as it is in the folder COPY_INTO_REPO; the order of the command of step 2)
9D852C23BEBE519AEBB7F223CFCC7F7152137ED9BDB4C7CBB24F794FB9CC7F0B CODE_MAP.md
FDC70201A28EAB5359158A2C66EE96B25311944E4C733960F1219AA800C6A0B2 CONNECTIONS.md
425F19E713D94180B53853C05C88643F5E8C0D84ECDAC608E1E4F81049C762C2 PROGRESS.md
9ACCF0B843E495DB28E6BB244535CA63EABA8FA0A1B19BB43BD65103A82612BF src/components/SignedInStub.tsx
C9ACAC86B8A59B5DB3D42787E302D2FE78F84931B4C6D768D9750081416B066D src/components/SignedInStub.test.tsx
97AC920BE0C02366E5F30B8D2D241B572AA0EA2136969CF0CB09607BCBDEBF9A src/components/GradientASCII.tsx
A72A0AE30D8153930AA1B23B6834A39ADA81B2FE3ECF232612C6662D2FE49282 src/components/GradientASCII.test.tsx
8430493592609ED2CE4CFD807CB44BFC476A73E8792DCEC3A4D96D34B4C2A354 src/components/OverviewBackground.tsx
7192F090194AB40C6611E2ED62BEAF3831E58A15FC38CEEC3F2E150DB4D3D810 src/components/OverviewBackground.test.tsx
A3BBEC49488B7D51F295F1628BC6A7405C8FDC24501A8027C8CA37AA16F69743 src/lib/overviewLook.ts
15A6A0946D7DBFF465D458413AFC2040C4D9B680A3C20A2C748D9F8D97BB2D09 src/lib/overviewLook.test.ts
1C0F76DED02F7004C2263A54AE34C50E72A3218A9F57BFFAB04FCD1057E47341 src/lib/overviewSound.ts
2EC90B8E15BE1F069F5A6DFC71595E7B37DD6F6D28E79933E8417E445AD1CD62 src/lib/overviewSound.test.ts
7536284CE06C0AF93049890C8AD61FF652F062CAEE039E20CB4709E574B9F718 src/lib/react-bits-sound.ts
D3EC4E6A2E554B25D189EB1A61DD84DFF4E9BE7871ADB31ABBB1978B7A2B3E79 src/overview.css

## IF THE AGENT STOPS HALF-WAY (a used-up quota, a crash, a closed window)
This packet has no edit that could be applied twice: the agent never changes a file, so every step can be repeated safely. Nothing is committed before step 10. In a NEW conversation the owner pastes: `Read packets/PACKET_11A_OVERVIEW_ASCII_BACKGROUND.md, the section IF THE AGENT STOPS HALF-WAY, and do exactly what it says.` Then the agent does this, and NOTHING else first:
1. Run `git log --oneline -3` and `git status --short`.
2. If the newest commit already starts with `11A:`, steps 1 to 10 are done: run `git status --short` and `git log origin/master --oneline -1`; if the commit is not on origin yet, do step 11 (`git push`) only, and report. If it is on origin, report that it was already pushed.
3. If there is no `11A:` commit: do steps 1 to 11 of PART 1 from the beginning, as written. The only difference allowed: if the first column of `git status --short` shows `M ` or `A ` for some of the 15 files (the earlier run already did step 9), that is FINE here; it is NOT fine for any other file. Step 9 can be done again without harm.
4. If a commit exists but not the `11A:` one, or the newest commit is not `cfb8bb8` and not an `11A:` commit, or anything else looks different from this section: STOP and report the raw output.

## PART 2: OWNER BY HAND (a try-out on your real screen and speakers; nothing to run in Supabase)
Do this after the agent has pushed.
1. Start the app (`npm run dev`), sign in, and open the Overview on the LAPTOP: `http://localhost:5173/?lite=0#overview` (use the port that `npm run dev` prints).
2. **The look.** One of four looks fills the whole screen behind the title `Overview`, your email, the grey note and the `Sign out` button: Atmosphere (blue to white, letters), Lagoon (teal, classic symbols like `.:-=+*#%@`), Rose (red and pink, letters) or Corona (amber, only `0` and `1`). The characters are about 19 px high. The title, the email and the button are readable and sit ABOVE the background, in the middle of the screen. The Menu button is at the top right.
3. **The intro.** At the opening the characters build up in about a second and a half. The sound starts with it: a soft swell that rises, then a short warm chord and a low thump right at the end, then it stops with a fast fade. After a SIGN IN the sound should start with the picture. After a RELOAD of the page on the Overview the browser does not allow a sound before you touch the page: the sound comes at your first click, tap or key (this is the browser's rule, not a bug).
4. **The mouse.** Move the cursor over the characters and click: nothing scrambles, no wave, no burst.
5. **Random.** Reload the page 8 times: all four looks appear sooner or later. A reload MAY give the same look twice (the rule "not the same twice in a row" works while the page stays open: open the menu, choose Calendar, then Overview again, a few times: the look must change every time).
6. **Calendar and Guide.** In the menu choose Calendar: the Dark Veil background as before and NO sound. Choose Overview again: a (different) ASCII look and the sound again. Choose Pro Timer: nothing changed there.
7. **The phone.** Open the same address on your PHONE (`npm run dev -- --host` prints a line `Network:`; same Wi-Fi; add `#overview`). Look for: the characters are about as big as on the laptop (NOT twice as big), the animation is smooth and the phone does not get hot, the title and the buttons are readable.
8. Send the planner the agent's report (`DONE 11A` and its lines) and what you saw in steps 2 to 7 (short; a photo of each of the four looks, one of them on the phone, is welcome). This packet PASSES only when the agent's report matches the expected lines AND steps 2 to 7 behave as described. If something looks or sounds wrong, say what: every size, number and time below is a DEFAULT that can change.

## WHAT THE NEW CODE DOES (for the owner and the later packets)
- **`src/components/GradientASCII.tsx`** (library file, three edits, see C59): edit 1 sets the intro to 1.5 seconds (library 2.4); edits 2 and 3 make its canvas inside its effect and take it away in the cleanup, so that React StrictMode in development does not leave it empty (same trouble and same remedy as the Pro Timer background, C52).
- **`src/lib/react-bits-sound.ts`** (library file, never edited): the Sound Lab engine that draws a recipe into a sound.
- **`src/lib/overviewLook.ts`** (`AB:OVERVIEW.LOOK`): the four presets (shape, colours, characters, copied from the Studio file `src/demo/Backgrounds/presets/GradientASCII.js`), what you changed (cell size 19, softness 0.8, mouse off, click effect none, intro on), the intro length (1.5) and `pickOverviewPreset`.
- **`src/lib/overviewSound.ts`** (`AB:OVERVIEW.SOUND`): your `reveal` recipe as pasted; draws it once for the whole page; plays it from the start of the intro (shifted if drawing it took time) and cuts it with a 0.3 second fade at the end of the intro; waits for the first tap, click or key if the browser does not allow a sound yet; stops it with a 50 ms fade when the Overview goes away; no sound for a person who asked the system for less motion; never breaks the screen.
- **`src/components/OverviewBackground.tsx` and `src/overview.css`** (`AB:OVERVIEW.BG`): picks the preset (random, not the one of the last opening while the page stays open), shows the animation in a fixed box behind the screen that takes no taps, starts the sound and stops it when the screen goes away. A phone draws at pixel ratio 1 (the laptop up to 2); the background never stands still.
- **`src/components/SignedInStub.tsx`**: the screen id `overview` gets `OverviewBackground`; Calendar and Guide keep Dark Veil.
- **Tests.** 80 new tests (numbers per file in step 5). They fail on the unedited library file (4 of the 11 tests of `GradientASCII.test.tsx`).
- **Documents.** `CODE_MAP.md` (new section OVERVIEW, two library rows), `CONNECTIONS.md` (new C59, C22 and C23 extended, 23 new anchors), `PROGRESS.md`.

## WHAT THE PLANNER HAD TO DECIDE (read them and say which are wrong; all are DEFAULT)
1. **Intro length 1.5 seconds.** Your first message asked for 2 seconds; the earlier working session moved it to 1.5 and this packet follows that. Changing it means changing three places together (C59 lists them): `INTRO_SECONDS` in the library file, `OVERVIEW_INTRO_SECONDS` in `overviewLook.ts`, and the test that compares them.
2. **The sound is cut with the intro.** The sound is 3.4 seconds long, its chord starts at 1.12 s. With a 1.5 s intro and a 0.3 s fade the chord is heard only for a very short moment before the fade (at 2 s it would be heard for about 0.6 s). If you want the full chord, the other option is to let the sound ring out to its natural end instead of cutting it; say so and the planner will change it.
3. **Softness 0.8.** You said "increase" with no number; the Studio has 0.5 and the slider ends at 1.
4. **Cell size 19 for all four presets;** the Studio sizes of the presets (18, 16, 22, 15) are dropped. Everything else (density, glow, flicker, flow, speed, grain, opacity) stays at the Studio values.
5. **Random choice.** Any of the four, not the one of the last opening while the page stays open. A reload starts fresh and may repeat. A proper logic (for example by time of day or by the day score) is for later, as you said.
6. **The background is not in the half-size box** `ab-bg` of the other screens (it would make the 19 px characters 38 px). A phone gets pixel ratio 1 instead, which is the same saving in a different way.
7. **Sound unlock.** After a reload the sound waits for your first tap or key and then plays from its start. No sound for people with "reduce motion".
8. **Not in this packet:** the choice logic, a volume or mute setting, the real content of the Overview, a sound on other screens.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
Done by the planner in its sandbox, on a clone of `cfb8bb8` with these 15 files:
- `tsc -b` exit 0; `check-tags` 41 tags, 85 places, 59 connections, 543 anchors, 89 classes; 28 test files and 1596 tests green; lint 21 warnings and 0 errors (the two new ones are in the two library files); build ok.
- The library tests were checked against the UNEDITED library file: 4 of 11 fail there (intro, canvas in the markup, StrictMode, no WebGL 2), all pass on the edited one.
- A real browser (headless Chromium with software WebGL, the dev server, React StrictMode on): on a 1280 by 720 laptop and a 390 by 844 phone (2x, touch) the box is fixed, fills the screen, has ONE canvas, sits at layer 0 and takes no taps; the title and the Sign out button are above it. With no tap yet the sound did not start; after a tap it started from its beginning. With the sound allowed it started 0.224 s into the sound (so it stays in step with the picture) and was stopped at the 1.5 second mark. Ten fresh loads showed all four presets. The planner looked at the Atmosphere screenshots of the laptop and the phone.
- The four presets were compared with the React Bits preset file itself, value by value (and a test keeps them).

NOT tested, and what that means for you:
- **Nobody has HEARD the sound** (a headless browser has no speakers): the calls and times were checked, not how it sounds. Part 2 step 3 is the first listen.
- **Only the Atmosphere look was looked at** in a screenshot; Lagoon, Rose and Corona come from the same code with the Studio values, but their look on your screen is Part 2 step 2.
- A real phone (smoothness, heat, the sound after a tap, Safari / iOS audio unlock: the code resumes the sound inside the tap, which Safari needs, but it was not tried), Firefox and Safari.
- The real sign-in path (the test page rendered the signed-in screen directly), and this packet text was NOT run by an emulator the way 10G was.

## THINGS TO KNOW (no check is possible)
- **The Menu button is white and the top of the Atmosphere look is almost white.** On the 390 px phone screenshot the word `Menu` and the plus nearly disappear there. Nothing was changed for it (the menu is a different part, `AB:MENU.LOOK`); tell the planner if you see it, a small shadow behind the button is the likely fix.
- The lite level is read ONCE when the page loads: after you add or remove `?lite=0` or `?lite=1` in the address, load the page again.
- The sound engine file is about 37 kB and the animation about 33 kB: the build gets a little bigger (the warning about chunks larger than 500 kB was there before).
- If you ever install Gradient ASCII again from React Bits, make its three edits again (C59); `GradientASCII.test.tsx` fails until you do.
