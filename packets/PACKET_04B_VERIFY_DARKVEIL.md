# PACKET 04B: VERIFY DARK VEIL (read and report only)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet is READ-ONLY. Do NOT edit, create, delete, stage, commit or push anything. Do NOT edit `PROGRESS.md`. Do NOT edit this packet file. Do NOT run `npm install`, `npm uninstall`, or any `shadcn add`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add`.
- When you copy a file into your report, copy it from a plain print command (`Get-Content`), NOT from an editor or viewer that shows line numbers. The copy must contain NO line-number prefixes such as `57:` at the start of lines.
- If any step fails or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**

## WHAT THIS DOES
Packet 04A installed Dark Veil, but its report had three gaps: (1) the pasted file had line numbers in it, (2) it never said whether the package `ogl` was added or was already there, (3) the file contains a `lightMode` setting that the planner did not expect. This packet answers all three. Nothing on the screen changes.

---

## STEP 0: Check the starting state
Run, one by one, and copy the RAW output of each (write EMPTY if nothing prints). Do NOT stop on the results:
1. `git status --short`
2. `git log --oneline -3`

Check that `src/components/DarkVeil.tsx` exists. If it is missing: **STOP** and report "DarkVeil.tsx is missing."

## STEP 1: Was `ogl` added or already there?
Run, one by one, and copy the RAW output of each:
1. `npm ls ogl`
2. `Select-String -Path package.json -Pattern '"ogl"'`
3. `git log --oneline -S"ogl" -- package.json`

(Command 3 lists the commit that first added `ogl` to `package.json`. If it lists `a735118`, the Dark Veil install added it. If it lists an older commit, `ogl` was already installed before 04A. If it prints nothing, write EMPTY.)

## STEP 2: Check the file itself
Run, one by one, and copy the RAW output of each:
1. `(Get-Content src/components/DarkVeil.tsx).Count`
2. `Get-FileHash src/components/DarkVeil.tsx -Algorithm SHA256`
3. `Select-String -Path src/components/DarkVeil.tsx -Pattern '^\s*\d+:\s'`

(Command 3 looks for lines that start with a line number. It should print EMPTY. If it prints lines, the file itself has line numbers inside it: report that clearly, but do not fix it.)

## STEP 3: Where does `lightMode` come from?
Run, one by one, and copy the RAW output of each:
1. `Select-String -Path src/components/DarkVeil.tsx -Pattern 'lightMode|uLightMode' | ForEach-Object { "$($_.LineNumber): $($_.Line.Trim())" }`
2. `(npx shadcn@latest view @react-bits/DarkVeil-TS-TW | Out-String).Contains("lightMode")`
3. `git log --oneline -- src/components/DarkVeil.tsx`

(Command 2 asks the registry whether ITS copy of Dark Veil contains `lightMode`. It prints `True` or `False`. If the command `view` is not recognised or it asks for a login or key: write NOT AVAILABLE with the exact message and continue with the next step. Do not stop.)

## STEP 4: Is the component used anywhere?
Run:
```
Get-ChildItem src -Recurse -Include *.ts,*.tsx | Select-String -Pattern "DarkVeil" | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
```
Copy the RAW output. (Expected: only lines inside `src/components/DarkVeil.tsx` itself.)

## STEP 5: Print the file, plain
Run:
```
Get-Content src/components/DarkVeil.tsx
```
Copy its ENTIRE output, top to bottom, exactly as printed, without line numbers, without changing, shortening or summarising anything. The number of lines you copy must equal the number printed by Step 2 command 1.

## STEP 6: Confirm nothing changed
Run `git status --short` and copy the RAW output. It must be exactly the same as Step 0 command 1. If it differs: **STOP** and report both outputs. Do not fix anything.

---

## DONE-CHECKS (all must pass)
1. Steps 0 to 6 were all run and nothing was edited, staged, committed or pushed.
2. The file copy in the report has NO line-number prefixes.
3. The line count of the copy equals the Step 2 count.
4. Step 6 `git status --short` is identical to Step 0.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 4 done-checks
- the RAW outputs of Step 0 (2 commands), Step 1 (3 commands), Step 2 (3 commands), Step 3 (3 commands), Step 4 and Step 6
- the ENTIRE plain contents of `src/components/DarkVeil.tsx` from Step 5, with no line numbers
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
