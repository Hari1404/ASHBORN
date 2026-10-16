# PACKET 08F: FIX THE PACKET 08B ITEM IN PROGRESS.md (NO CODE CHANGE, NO SCREEN CHANGE)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Edit ONLY `PROGRESS.md`, and only the one place named in Step 2. Change nothing else in that file. Change NO other file. Do not edit this packet file.
- Do NOT create any helper script, `.ps1` file, note or temp file anywhere. Make the edit with your file-editing tool. Run every command directly in the terminal.
- Do not install or remove any package. Do not run `npm test`, `npm run build`, `npm run lint` or any install: this packet changes no code.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 3 is allowed.
- Other untracked files (the `packets` files, `run_*.ps1`, `c.txt`, `check_out.txt`) are not part of this packet: leave them alone.
- Keep the line ending of `PROGRESS.md` as it is (the new text sits in the same line, so no line ending is added or removed).
- If any step fails, asks for a login, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The last item of the `## Next` list about Packet 08B in `PROGRESS.md` still says: copy the 8 lines and the 1 stop alert line into `ASHBORN_MILESTONE_LINES.md`. That is out of date and partly wrong. The owner has already put the 8 rewritten milestone lines into that file, and the one rewritten stop alert line was never part of that file (the file holds the milestone lines only). This packet changes the end of that one sentence so it says so. The reading part of the item (the owner reads the 9 rewritten lines and says which to change) stays as it is.

Nothing else changes: no code, no screen, no test, no tag, no connection.

---

## STEP 0: Check the starting state
Run `git log --oneline -1`. The line must contain the text `Packet 08B`. If not: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` (untracked files) are fine. If ANY line shows a changed tracked file (it starts with ` M`, `M `, `A `, `D ` or similar): **STOP** and report the COMPLETE output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 36 tags, 70 places
CONNECTIONS OK: 52 connections, 427 anchors, 49 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run this command (it counts the lines of `PROGRESS.md` that hold the OLD text):
```
@(Select-String -Path PROGRESS.md -SimpleMatch -Pattern "then copy the 8 lines and the 1 stop alert line into ASHBORN_MILESTONE_LINES.md (the file is not in the repository, see CONNECTIONS.md C50)").Count
```
It must print `1`. If it prints anything else: **STOP** and report the RAW output (the packet was already run, or the file was changed by hand).

Run this command (it counts the lines that already hold the NEW text):
```
@(Select-String -Path PROGRESS.md -SimpleMatch -Pattern "The 8 milestone lines are already copied into ASHBORN_MILESTONE_LINES.md").Count
```
It must print `0`. If it prints anything else: **STOP** and report the RAW output.

## STEP 1: Copy the raw outputs
Copy the RAW output of `git log --oneline -1` and of `git status --short` from Step 0 (write EMPTY if nothing printed).

## STEP 2: Make the one edit in `PROGRESS.md`
The item that starts with `- Owner looks at Packet 08B by eye:` is one long line in the `## Next` list. Inside that line, find this OLD text. It must be found EXACTLY ONCE in the whole file:

OLD (starts with a semicolon, ends with the closing bracket):
```
; then copy the 8 lines and the 1 stop alert line into ASHBORN_MILESTONE_LINES.md (the file is not in the repository, see CONNECTIONS.md C50)
```

Replace it with this NEW text (starts with a full stop, no full stop at the very end, because the line has none today):
```
. The 8 milestone lines are already copied into ASHBORN_MILESTONE_LINES.md (the file is not in the repository, see CONNECTIONS.md C50). The stop alert line is not part of that file, so there is nothing to copy for it
```

Nothing before the OLD text in that line and nothing after it changes. (Before it the line ends with `and say which to change`; after the edit it reads `and say which to change. The 8 milestone lines are already copied ...`.) If the OLD text is found zero times or more than once: **STOP** and report which. Do not guess.

## STEP 3: Check, commit
Run the two count commands of Step 0 again. The first (OLD text) must now print `0` and the second (NEW text) must print `1`. If not: **STOP** and report the RAW output. Do not commit.

Run:
```
git diff --stat
```
It must show ONLY `PROGRESS.md`, with `1 file changed, 1 insertion(+), 1 deletion(-)`. If any other file shows or the numbers differ: **STOP** and report the COMPLETE output. Do not commit.

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
git add PROGRESS.md
git commit -m "Packet 08F: PROGRESS.md, the Packet 08B item no longer asks to copy the stop alert line (the 8 milestone lines are already in the words file)"
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
1. At the start, `git log --oneline -1` contained `Packet 08B`, and `git status --short` showed no changed tracked file.
2. At the start, `node scripts/check-tags.mjs` printed `TAGS OK: 36 tags, 70 places` and `CONNECTIONS OK: 52 connections, 427 anchors, 49 classes, 2 css variables, 2 label links`.
3. At the start the OLD text count was `1` and the NEW text count was `0`; after the edit the OLD text count is `0` and the NEW text count is `1`.
4. `git diff --stat` (before the commit) showed only `PROGRESS.md`, 1 insertion and 1 deletion.
5. `node scripts/check-tags.mjs` after the edit printed the same two lines as at the start.
6. `git ls-files | Select-String -Pattern "\.env"` printed nothing.
7. `git show --stat HEAD` lists only `PROGRESS.md`, and the first line of `git log --oneline -1` starts with `Packet 08F`.
8. `git push` finished without an error.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 8 done-checks
- the RAW outputs of `git log --oneline -1` and `git status --short` from Step 0
- the exact output of `node scripts/check-tags.mjs` from Step 0 and from Step 3
- the four count numbers (OLD and NEW text, before and after the edit)
- the exact output of `git diff --stat`
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`
- the exact output of `git show --stat HEAD`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
