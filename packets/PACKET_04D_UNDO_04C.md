# PACKET 04D: UNDO PACKET 04C (login goes back to Pattern Waves)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Edit ONLY `PROGRESS.md` (Step 3). Every other change in this packet is made by the one `git revert` command in Step 1. Do NOT edit `src/components/DarkVeil.tsx` or `src/components/PatternWaves.tsx`. Do not edit this packet file.
- Do not install or remove any package.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 4 is allowed.
- If any step fails, asks for a login, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
Packet 04C put Dark Veil on the login page. That was a mistake: the owner wanted the login page to keep its Pattern Waves animation, and Dark Veil is meant for the page AFTER login. This packet undoes commit `bfe6843` (Packet 04C) with one `git revert`. Dark Veil stays installed (the file `src/components/DarkVeil.tsx` is not touched), it is just not used.

---

## STEP 0: Check the starting state
Run `git log --oneline -3`. The FIRST line must end with `Packet 04C: Dark Veil on the front page`. If it does not: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` (untracked files) are fine. If ANY line shows a changed tracked file (it starts with ` M`, `M `, `A `, `D ` or similar): **STOP** and report the COMPLETE output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 22 connections, 71 anchors, 20 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run these two read-only commands. Do NOT stop on their results. Copy the RAW output of each (write EMPTY if nothing prints):
1. `git log --oneline -3`
2. `git ls-files | Select-String -Pattern "\.env"`

## STEP 1: Undo 04C (without committing yet)
Run:
```
git revert --no-commit bfe6843
```
If it reports a conflict or any error: **STOP**, report the COMPLETE output, then run `git revert --abort` and nothing else.

## STEP 2: Check the result
Run `git status --short` and copy the RAW output. The changed (not `??`) files must be ONLY these five: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/App.tsx`, `src/login.css`. If any other tracked file is changed: **STOP** and report the COMPLETE output. Do not commit.

Run:
```
Select-String -Path src/App.tsx -Pattern "DarkVeil"
```
It must print NOTHING.

Run:
```
Select-String -Path src/App.tsx -Pattern "PatternWaves"
```
It must print exactly 2 lines (the import and the `<PatternWaves` tag). Copy the RAW output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 22 connections, 72 anchors, 20 classes, 1 css variables, 2 label links
```
(72 anchors again: that is the original number, correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not commit.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

## STEP 3: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 04D: Packet 04C undone. The login page has Pattern Waves again. Dark Veil stays installed and unused, it is meant for the page after login.
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 4: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/App.tsx src/login.css CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 04D: undo 04C, login back to Pattern Waves"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git status --short` and copy its raw output. Files that were not part of this packet may still show as untracked (`??`). Leave them alone.

## STEP 5: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, the first line of `git log --oneline -3` ended with `Packet 04C: Dark Veil on the front page`.
2. `Select-String -Path src/App.tsx -Pattern "DarkVeil"` printed nothing, and `Select-String -Path src/App.tsx -Pattern "PatternWaves"` printed 2 lines.
3. `node scripts/check-tags.mjs` printed the two lines of Step 2 (72 anchors).
4. `npm run build` finished with no errors.
5. `git show --stat HEAD` lists only `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/App.tsx` and `src/login.css`.
6. The first line of `git log --oneline` ends with `Packet 04D: undo 04C, login back to Pattern Waves`.
7. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
8. `git push` finished without an error.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 8 done-checks
- the RAW outputs of the 2 commands of Step 0
- the RAW output of `git status --short` from Step 2
- the RAW outputs of the two `Select-String` commands of Step 2
- the exact output of `node scripts/check-tags.mjs` from Step 2
- the last 5 lines of the output of `npm run build`
- the RAW output of `git ls-files | Select-String -Pattern "\.env"` and the exact output of `git show --stat HEAD`
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
