# PACKET 08G: TIDY PROGRESS.md AND KEEP THE PACKET FILES IN THE REPOSITORY (NO CODE CHANGE, NO SCREEN CHANGE)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Edit ONLY `PROGRESS.md`, and only the places named in Step 2. Change nothing else in that file. Change NO other file. Do not edit this packet file.
- Do NOT create any helper script, `.ps1` file, note or temp file anywhere. Make the edits with your file-editing tool. Run every command directly in the terminal.
- Do not install or remove any package. Do not run `npm test`, `npm run build`, `npm run lint` or any install: this packet changes no code.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` lines in Step 3 are allowed. The `.zip` files in `packets/` are NOT added.
- Other untracked files (the `.zip` files in `packets`, `run_*.ps1`, `c.txt`, `check_out.txt`) are not part of this packet: leave them alone.
- Keep the line ending of `PROGRESS.md` as it is: a new line gets the same line ending as the line next to it, and a deleted line is deleted together with its line ending.
- Use only plain keyboard characters in the new text (copy it exactly as written below).
- If any step fails, asks for a login, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
`PROGRESS.md` has fallen behind the work:
1. The `## Done` list has no lines for Packets 08D, 08E and 08F.
2. The `## Next` list still holds nine "owner looks at it by eye" items. The owner has done all of them. They are deleted.
3. The last line of the `## Next` list says "Then: deploy, then real login and database". That is out of date: the real login (Packet 03A) and the timer database (Packets 05A and 05C) are done. The line is replaced.
4. The packet files `PACKET_06A` to `PACKET_08G` (the `.md` files only) were never committed. They are added to the repository so they cannot be lost.

Nothing else changes: no code, no screen, no test, no tag, no connection. The two items that stay in the `## Next` list are the one that starts with `- Owner decides:` and the one that starts with `- Owner reads the 288 milestone lines`.

---

## STEP 0: Check the starting state
Run `git log --oneline -1`. The line must contain the text `Packet 08F`. If not: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` (untracked files) are fine. If ANY line shows a changed tracked file (it starts with ` M`, `M `, `A `, `D ` or similar): **STOP** and report the COMPLETE output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 36 tags, 70 places
CONNECTIONS OK: 52 connections, 427 anchors, 49 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run this command (it checks that the 13 packet files are there):
```
foreach ($f in @("packets/PACKET_06A_LOADING.md","packets/PACKET_06B_START_FREEZE.md","packets/PACKET_06C_COMEBACK_MESSAGE.md","packets/PACKET_06D_TEXT_EFFECTS.md","packets/PACKET_06E_GO_BACK_IN_STAYS_PAUSED.md","packets/PACKET_07A_MILESTONE_LINES.md","packets/PACKET_07B1_TEST_TIMEOUT.md","packets/PACKET_07B_MILESTONE_HOOK.md","packets/PACKET_07C_MILESTONE_SCREEN.md","packets/PACKET_08A_GRAINIENT_BACKGROUND.md","packets/PACKET_08C_CANVAS_BACKGROUND.md","packets/PACKET_08F_PROGRESS_FIX.md","packets/PACKET_08G_PROGRESS_TIDY.md")) { "$f " + (Test-Path $f) }
```
It must print 13 lines, each ending with `True`. If any ends with `False`: **STOP** and report the COMPLETE output.

Run these five commands. Each prints one number. Copy the five numbers. They must be exactly `8`, `11`, `0`, `1`, `0` in this order:
```
@(Select-String -Path PROGRESS.md -Pattern "^- Owner looks at Packet").Count
@(Select-String -Path PROGRESS.md -Pattern "^- Owner ").Count
@(Select-String -Path PROGRESS.md -Pattern "^- Packet 08[DEFG]:").Count
@(Select-String -Path PROGRESS.md -SimpleMatch -Pattern "- Then: deploy, then real login and database").Count
@(Select-String -Path PROGRESS.md -Pattern "^- Then: the Pro Timer tags").Count
```
If any number is different: **STOP** and report the RAW output (the packet was already run, or the file was changed by hand).

## STEP 1: Copy the raw outputs
Copy the RAW output of `git log --oneline -1` and of `git status --short` from Step 0 (write EMPTY if nothing printed).

## STEP 2: Make the three edits in `PROGRESS.md`
Make the edits in this order. In every edit, the line must be found EXACTLY ONCE in the whole file. If a line is found zero times or more than once: **STOP**, report which one, and do not edit any more.

**Edit A: add four lines to the `## Done` list.** Find the line that starts with:
```
- Packet 08B: the lines about the rays of light are gone
```
Directly AFTER that line (no blank line between), add these four lines, each as its own line, in this order. Do not change the 08B line itself:
```
- Packet 08D: the moving background draws again at once after a size change. A resize empties the canvas, so a dragged window or a turned phone used to paint one black picture per size step; now the canvas draws again at once after the resize (src/components/BackgroundCanvas.tsx). With automated tests (src/components/BackgroundCanvas.test.tsx); CODE_MAP.md and CONNECTIONS.md were brought up to date.
- Packet 08E: the moving background stands still while the session is paused. No frames are drawn behind a paused screen or an open stop alert (the screen gives TimerBackground paused, as it does to the ball, and the canvas then draws one still picture and no more frames), and at Resume the flow goes on from the same place. Changed in code: src/components/BackgroundCanvas.tsx, src/components/TimerBackground.tsx and src/components/TimerScreen.tsx, with their tests; CODE_MAP.md and CONNECTIONS.md were brought up to date. With automated tests.
- Packet 08F: PROGRESS.md only. The Packet 08B item of the Next list no longer asks to copy the stop alert line into the words file (the 8 milestone lines were already in ASHBORN_MILESTONE_LINES.md, and the stop alert line was never part of that file). No code, no screen and no test change.
- Packet 08G: PROGRESS.md and the packets folder only. The Done list got the lines of Packets 08D, 08E and 08F; the by-eye checks that the owner has finished (the login screen, Packets 06A to 08C, and the rewritten lines of 08B) were taken out of the Next list; and the old last line of the Next list (deploy, then real login and database) was replaced, because the real login (Packet 03A) and the timer database (Packets 05A and 05C) are already done. The packet files PACKET_06A to PACKET_08G (the .md files only, not the zips) are now kept in the repository. No code, no screen and no test change.
```

**Edit B: delete nine lines from the `## Next` list.** Delete each of these lines COMPLETELY (the whole line, with its line ending). Each is found by the start of the line. The start must match exactly one line each:
```
- Owner checks the login screen by eye
- Owner looks at Packet 06A by eye
- Owner looks at Packet 06B by eye
- Owner looks at Packet 06C and 06E by eye
- Owner looks at Packet 06D by eye
- Owner looks at Packets 07B and 07C by eye
- Owner looks at Packet 08A by eye
- Owner looks at Packet 08C by eye
- Owner looks at Packet 08B by eye
```
Do NOT delete the line that starts with `- Owner decides:` and do NOT delete the line that starts with `- Owner reads the 288 milestone lines`.

**Edit C: replace the last line of the file.** Find this whole line (it is the last line of the file):
```
- Then: deploy, then real login and database
```
Replace it with this one line (no full stop is missing: it ends with a full stop):
```
- Then: the Pro Timer tags (session categories; the right side of the wide layout is kept free for them) and the real Overview, Calendar and Guide screens, which are placeholders today. The order is not decided yet.
```

## STEP 3: Check, commit
Run the five count commands of Step 0 again. The five numbers must now be exactly `0`, `2`, `4`, `0`, `1` in this order. If not: **STOP** and report the RAW output. Do not commit.

Run:
```
git diff --stat
```
It must show ONLY `PROGRESS.md`, with `1 file changed, 5 insertions(+), 10 deletions(-)`. If any other file shows or the numbers differ: **STOP** and report the COMPLETE output. Do not commit.

Run:
```
node scripts/check-tags.mjs
```
It must print the same two lines as in Step 0. If not: **STOP** and report the COMPLETE output. Do not commit.

Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add PROGRESS.md packets/PACKET_06A_LOADING.md packets/PACKET_06B_START_FREEZE.md packets/PACKET_06C_COMEBACK_MESSAGE.md packets/PACKET_06D_TEXT_EFFECTS.md packets/PACKET_06E_GO_BACK_IN_STAYS_PAUSED.md packets/PACKET_07A_MILESTONE_LINES.md packets/PACKET_07B1_TEST_TIMEOUT.md packets/PACKET_07B_MILESTONE_HOOK.md packets/PACKET_07C_MILESTONE_SCREEN.md packets/PACKET_08A_GRAINIENT_BACKGROUND.md packets/PACKET_08C_CANVAS_BACKGROUND.md packets/PACKET_08F_PROGRESS_FIX.md packets/PACKET_08G_PROGRESS_TIDY.md
git diff --cached --name-only
```
The second command must list exactly 14 paths: `PROGRESS.md` and the 13 packet files above, and nothing else (no `.zip`). If it lists anything else, or a different number: **STOP** and report the COMPLETE output. Do not commit; run `git reset` only if it lists a wrong file, and report that you did.

Then run:
```
git commit -m "Packet 08G: PROGRESS.md tidy (Done lines for 08D, 08E and 08F, finished checks removed, last Next line replaced) and the packet files 06A to 08G kept in the repository"
```
(Line-ending warnings from git are harmless. Ignore them.)

## STEP 4: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `git log --oneline -1` contained `Packet 08F`, `git status --short` showed no changed tracked file, and all 13 packet files were found (`True`).
2. At the start, `node scripts/check-tags.mjs` printed `TAGS OK: 36 tags, 70 places` and `CONNECTIONS OK: 52 connections, 427 anchors, 49 classes, 2 css variables, 2 label links`.
3. The five numbers at the start were `8`, `11`, `0`, `1`, `0`, and after the edits they are `0`, `2`, `4`, `0`, `1`.
4. `git diff --stat` (before the add) showed only `PROGRESS.md`, 5 insertions and 10 deletions.
5. `node scripts/check-tags.mjs` after the edits printed the same two lines as at the start.
6. `git ls-files | Select-String -Pattern "\.env"` printed nothing.
7. `git diff --cached --name-only` listed exactly 14 paths (`PROGRESS.md` and the 13 packet `.md` files) and no `.zip`.
8. `git show --stat HEAD` lists those 14 files, and the first line of `git log --oneline -1` starts with `Packet 08G`.
9. `git push` finished without an error.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 9 done-checks
- the RAW outputs of `git log --oneline -1` and `git status --short` from Step 0
- the 13 lines printed by the `Test-Path` command of Step 0
- the exact output of `node scripts/check-tags.mjs` from Step 0 and from Step 3
- the five numbers of Step 0 and the five numbers of Step 3
- the exact output of `git diff --stat`
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`
- the exact output of `git diff --cached --name-only`
- the exact output of `git show --stat HEAD`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
