# PACKET 05C0: INSTALL HOLD BUTTON AND SPACE GROTESK (install and report only)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Do NOT use the Hold Button or the font anywhere. Edit ONLY `PROGRESS.md` (Step 7). The two install commands (Steps 1 and 2) change `package.json` and `package-lock.json` and create `src/components/HoldButton.tsx`. Nothing else. Do not edit this packet file.
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- Some files may already have changes that are NOT part of this packet (for example `src/components/AppMenu.tsx`, `src/components/SignedInStub.tsx`, `src/menu.css`, the `packets` files, the `run_*.ps1` files). Do not open, edit, stage, revert or commit them.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, or any install other than the two in Steps 1 and 2. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 9 is allowed.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The Pro Timer screen (the next packet, 05C) needs two things that are not installed yet: the React Bits **Hold Button** (the End Session button: press and hold to end) and the font **Space Grotesk** (the digits of the clock). This packet only installs both and checks them. Nothing on any screen changes, and nothing uses them yet.

Already checked outside your computer: the Hold Button entry exists in the React Bits registry and needs no extra npm package; the file it installs has the fingerprint written in Step 4; the font package version is 5.3.0 and its font family name is `Space Grotesk Variable`; a real build that loads the font works. NOT checked outside your computer: running the install commands themselves. That is why this packet exists.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `src/components/SignedInStub.tsx`. If `src/lib/timerMaths.ts` is missing, Packet 05B has not been run: **STOP** and report "Packet 05B has not been run." If any other file is missing: **STOP** and report which.

If the file `src/components/HoldButton.tsx` already exists: **STOP** and report "Hold Button is already installed."

Run:
```
Select-String -Path package.json -Pattern "space-grotesk" | ForEach-Object { $_.Line }
```
It must print NOTHING. If it prints a line: **STOP** and report "Space Grotesk is already installed."

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 19 tags, 27 places
CONNECTIONS OK: 27 connections, 122 anchors, 21 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run:
```
npm test
```
It must finish with a line `Tests  180 passed (180)`. If not: **STOP** and report the last 8 lines of the output.

Run:
```
git diff --stat -- package.json package-lock.json
```
It must print NOTHING. If it prints anything: **STOP** and report it (those files must be unchanged before this packet starts).

Then run these read-only commands, one by one. Do NOT stop on their results and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -3`
3. `git ls-files | Select-String -Pattern "\.env" | ForEach-Object { $_.Line }`

## STEP 1: Install the Hold Button
Run:
```
npx shadcn@latest add @react-bits/HoldButton-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP and report.**
- If it asks whether to overwrite any existing file: answer **no**, then STOP and report which file.
- If it says the component or registry was not found: STOP and report the exact message.
- This component needs no npm package. If the command installs or asks to install any npm package, report its name and version in Step 3.

## STEP 2: Install the font
Run:
```
npm install @fontsource-variable/space-grotesk
```
Then run:
```
npm ls @fontsource-variable/space-grotesk
```
The output must contain the text `@fontsource-variable/space-grotesk@5.3.0`. If it shows any other version: **STOP** and report the COMPLETE output. Do not commit and do not try to install another version.

## STEP 3: Find out what was installed
Run:
```
git status --short
git diff package.json
git diff --stat
```
Compare `git status --short` with the raw output of command 1 in Step 0. The ONLY differences allowed are:
- `package.json` is now modified
- `package-lock.json` is now modified
- one new file `src/components/HoldButton.tsx` (shown as `??`)

The `git diff package.json` output must show exactly ONE added line, `"@fontsource-variable/space-grotesk": "^5.3.0",` (in `dependencies`), and no removed line. Line-ending warnings from git are harmless. Ignore them.

If ANY other file is new or changed, if the install created a second file next to `HoldButton.tsx`, or if `package.json` changed in any other way: **STOP** and report the COMPLETE `git status --short` and `git diff package.json`. Do not commit.

## STEP 4: Check the Hold Button file
**4a.** Run this ONE command (it prints one line: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/HoldButton.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly this line:
```
src/components/HoldButton.tsx ad7f7c00372286d6590bb3e830156098ec707d0f6247d6e73ce045b5f2a41fc2
```
If the fingerprint is different, or the command fails: **STOP**. Do not fix the file and do not commit. Report the RAW output, the output of `(Get-Content src/components/HoldButton.tsx).Count` (expected line count: 358), and the ENTIRE contents of `src/components/HoldButton.tsx`, exactly as written, without changing, shortening or summarising anything.

**4b.** Run:
```
Select-String -Path src/components/HoldButton.tsx -Pattern "^export default HoldButton;" | ForEach-Object { $_.Line }
```
It must print exactly this one line:
```
export default HoldButton;
```
If it prints nothing: **STOP** and report.

## STEP 5: Check the font
**5a.** Run:
```
Select-String -Path node_modules/@fontsource-variable/space-grotesk/index.css -Pattern "font-family" | Select-Object -First 1 | ForEach-Object { $_.Line }
```
It must print one line that, ignoring spaces at its start, is exactly `font-family: 'Space Grotesk Variable';`. If not: **STOP** and report the RAW output.

**5b.** Run:
```
Test-Path node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2
```
It must print `True`. If it prints `False`: **STOP** and report.

## STEP 6: Check the build, the checker and the tests
Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless. A warning that a module level directive "use client" was ignored is also harmless.) If it fails: **STOP and report the COMPLETE output.**

Run:
```
node scripts/check-tags.mjs
```
It must print exactly the same two lines as in Step 0. If it prints anything else: **STOP and report the COMPLETE output.**

Run:
```
npm test
```
It must finish with a line `Tests  180 passed (180)`. If not: **STOP** and report the last 8 lines of the output.

## STEP 7: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file, and keep its line endings as they are.
Find the line that starts with `- Packet 05B:` (it must be found EXACTLY ONCE; if it is found zero times or more than once: **STOP** and report). Directly after that line, add this new line:
```
- Packet 05C0: the React Bits Hold Button and the font Space Grotesk are installed (not used yet)
```

## STEP 8: Check that no secret file is tracked
Run:
```
git ls-files | Select-String -Pattern "\.env" | ForEach-Object { $_.Line }
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

## STEP 9: Git commit (only the named files)
Run these two lines, exactly as written. Do NOT use `git add .`:
```
git add package.json package-lock.json src/components/HoldButton.tsx PROGRESS.md
git commit -m "Packet 05C0: install Hold Button and Space Grotesk"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and `git status --short` and copy the raw output of both. Files that were not part of this packet may still show as modified or untracked. Leave them alone.

## STEP 10: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. Both install commands finished without asking for a key, an account or a payment.
2. The fingerprint in Step 4a is exactly the one written there, and Step 4b printed its one line.
3. `npm ls` showed `@fontsource-variable/space-grotesk@5.3.0`, and Steps 5a and 5b passed.
4. `npm run build` finishes with no errors, `node scripts/check-tags.mjs` prints exactly the two lines of Step 0, and `npm test` prints `Tests  180 passed (180)`.
5. `git show --stat HEAD` lists only `package.json`, `package-lock.json`, `src/components/HoldButton.tsx` and `PROGRESS.md`.
6. The first line of `git log --oneline` ends with `Packet 05C0: install Hold Button and Space Grotesk`.
7. `git ls-files | Select-String -Pattern "\.env" | ForEach-Object { $_.Line }` prints nothing.
8. `git push` finished without an error.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 8 done-checks
- the RAW outputs of the 3 commands of Step 0 (and of `git diff --stat -- package.json package-lock.json`)
- the RAW outputs of the three commands of Step 3 (`git status --short`, `git diff package.json`, `git diff --stat`)
- the exact output of `npm ls @fontsource-variable/space-grotesk`
- the exact output of the fingerprint command (Step 4a), of Step 4b, of Step 5a and of Step 5b
- the exact output of `node scripts/check-tags.mjs`, and the lines `Test Files` and `Tests` of `npm test`
- the RAW output of `git ls-files | Select-String -Pattern "\.env" | ForEach-Object { $_.Line }`
- the exact output of `git show --stat HEAD` and of `git status --short` (Step 9)
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
