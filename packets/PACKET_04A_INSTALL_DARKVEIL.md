# PACKET 04A: INSTALL DARK VEIL (install and report only)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Do NOT use the component anywhere. Do NOT edit any file except `PROGRESS.md` (Step 6). This packet only installs and reports. Do not edit this packet file.
- Do not install any package other than what the command in Step 2 installs by itself.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 8 is allowed.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**

## WHAT THIS DOES
The owner chose the React Bits background "Dark Veil" for the front page. Its real settings are not known yet. This packet installs it and prints the whole installed file, so the next packet can use the real prop names. Nothing on the screen changes.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `src/lib/lite.ts`. If `src/lib/lite.ts` is missing, Packet 03B has not been run: **STOP** and report "Packet 03B has not been run." If any other file is missing: **STOP** and report which.
If the file `src/components/DarkVeil.tsx` already exists: **STOP** and report "Dark Veil is already installed."

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 22 connections, 72 anchors, 20 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run these read-only commands, one by one. Do NOT stop on their results and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -3`
3. `git ls-files | Select-String -Pattern "\.env"`

## STEP 1: Check the package list before the install
Run:
```
git diff --stat
```
(It should print nothing. Do not stop if it prints something, just report it.)

## STEP 2: Install the component
Run:
```
npx shadcn@latest add @react-bits/DarkVeil-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP and report.**
- If it asks whether to overwrite any existing file: answer **no**, then STOP and report which file.
- If it says the component or registry was not found: STOP and report the exact message.
- If it installs an npm package: report its name and version in Step 3. (The package `ogl` is expected.)

## STEP 3: Find out what was installed
Run:
```
git status --short
git diff package.json
git diff --stat
```
Note the full path of every NEW file the command created, and the name and version of every package that was added.

The only changes expected are: `package.json` and `package-lock.json` (the package `ogl`), and one new file `src/components/DarkVeil.tsx`. If ANY other file is new or changed (the two untracked entries `-files .env` and `packets/...` do not count): **STOP** and report the COMPLETE `git status --short`. Do not commit.

## STEP 4: Print the installed component
Open the installed file `src/components/DarkVeil.tsx`.
Copy its ENTIRE contents, top to bottom, exactly as written, without changing, shortening or summarising anything. This copy goes into your final report.
If the install also created another file next to it (for example a `.css` file), copy that file's entire contents too and report its path.

## STEP 5: Check the build and the checker
Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP and report the COMPLETE output.**

Run:
```
node scripts/check-tags.mjs
```
It must print exactly the same two lines as in Step 0. If it prints anything else: **STOP and report the COMPLETE output.**

## STEP 6: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 04A: Dark Veil installed (not used yet)
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 7: Check that no secret file is tracked
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

## STEP 8: Git commit (only the named files)
Run these two lines, exactly as written. Do NOT use `git add .`:
```
git add package.json package-lock.json src/components/DarkVeil.tsx PROGRESS.md
git commit -m "Packet 04A: install Dark Veil"
```
(If Step 4 found a second installed file, add its path to the `git add` line and say so in the report. Line-ending warnings from git are harmless. Ignore them.)
Then run `git status --short` and copy its raw output. Files that were not part of this packet may still show as untracked (`??`). Leave them alone.

## STEP 9: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. The install command finished without asking for a key, account or payment.
2. `npm run build` finishes with no errors.
3. `node scripts/check-tags.mjs` prints exactly the two lines of Step 0.
4. `git show --stat HEAD` lists only `package.json`, `package-lock.json`, `src/components/DarkVeil.tsx` and `PROGRESS.md` (plus a second installed file only if Step 4 found one).
5. The first line of `git log --oneline` ends with `Packet 04A: install Dark Veil`.
6. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
7. `git push` finished without an error.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 7 done-checks
- the RAW outputs of the 3 commands of Step 0, and of `git diff --stat` from Step 1
- the RAW outputs of the three commands of Step 3 (`git status --short`, `git diff package.json`, `git diff --stat`)
- the full path of every installed file
- the ENTIRE contents of `src/components/DarkVeil.tsx` (and of any extra file from Step 4), exactly as written
- the exact output of `node scripts/check-tags.mjs`
- the RAW output of `git ls-files | Select-String -Pattern "\.env"` and the exact output of `git show --stat HEAD`
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
