# PACKET 02L: PHONE TEXT SIZE (CARD SUBTITLE AND FIELD LABELS)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. Copy every text character for character.
- Install nothing. Edit ONLY `src/login.css` and `PROGRESS.md`. Do not edit any other file.
- For every FIND and REPLACE: the FIND text must appear EXACTLY ONCE in that file at the moment you apply it. If it appears zero times or more than once: **STOP** and report the file and the edit number. Do not guess.
- If any step fails, or the build fails, or the checker fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.**

## WHAT THIS BUILDS
1. On screens narrower than 900px (every phone), the card text gets bigger: the line "Sign in to continue" goes from 14px to 16px, and the labels "User ID" and "Password" go from 13px to 15px.
2. On a laptop (900px and wider) nothing changes: the sizes stay 14px and 13px.
3. Nothing else changes. The ASHBORN name, the hero line, the glass, the fields and the button stay exactly as they are.
4. No new tag, no new file and no new linked value. So `CODE_MAP.md` and `CONNECTIONS.md` need NO edit, and the checker must print the same two lines as before.

---

## STEP 0: Check what this packet needs
Check that all of these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `scripts/check-tags.mjs`, `src/login.css`, `src/components/LoginBrand.tsx`, `PROGRESS.md`.
If `src/components/LoginBrand.tsx` is missing, Packet 02K has not been run: **STOP** and report "Packet 02K has not been run. Run it first." If any other file is missing: **STOP** and report which.

Check that `src/login.css` does NOT contain the text `Phone text is bigger`. If it does, this packet has already been run: **STOP** and report "Packet 02L has already been run."

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 9 tags, 16 places
CONNECTIONS OK: 16 connections, 44 anchors, 13 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run `git status --short` and `git log --oneline -3`. Do NOT stop and do NOT fix anything. Just report both outputs.

## STEP 1: Edit `src/login.css`
Make these 3 edits, in this order. Change nothing else in the file.

### Edit 1 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
  font-size: 14px;
```

**REPLACE WITH (this exact text):**
```css
  font-size: 16px;
```

### Edit 2 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
  font-size: 13px;
```

**REPLACE WITH (this exact text):**
```css
  font-size: 15px;
```

### Edit 3 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
/* AB:LOGIN.FORM:END */
```

**REPLACE WITH (this exact text):**
```css
/* Phone text is bigger (subtitle 16px and labels 15px above). From 900px wide (laptop) it goes back to the original sizes. */
@media (min-width: 900px) {
  .ab-subtitle {
    font-size: 14px;
  }

  .ab-label {
    font-size: 13px;
  }
}
/* AB:LOGIN.FORM:END */
```

## STEP 2: Check the build
Run:
```
npm run build
```
It must finish with no errors. If it fails: **STOP** and report the COMPLETE output.

## STEP 3: Run the checker
Run:
```
node scripts/check-tags.mjs
```
It must print exactly these two lines and nothing else (the same as in Step 0):
```
TAGS OK: 9 tags, 16 places
CONNECTIONS OK: 16 connections, 44 anchors, 13 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

## STEP 4: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 02L: phone text size, card subtitle 16px and labels 15px under 900px wide, laptop unchanged
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 5: Git
Run:
```
git add .
git commit -m "Packet 02L: phone text size"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `node scripts/check-tags.mjs` prints exactly the two lines of Step 3.
3. `src/login.css` contains the text `font-size: 15px;` exactly once and the text `@media (min-width: 900px)` inside the FORM part (between `AB:LOGIN.FORM:START` and `AB:LOGIN.FORM:END`).
4. `git show --stat HEAD` lists exactly two files: `PROGRESS.md` and `src/login.css`.
5. The first line of `git log --oneline` ends with `Packet 02L: phone text size`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 5 done-checks
- the exact output of `git log --oneline`
- the exact output of `node scripts/check-tags.mjs`
- the outputs you were asked to report in Step 0
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
