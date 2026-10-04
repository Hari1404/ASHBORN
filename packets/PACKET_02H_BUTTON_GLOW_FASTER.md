# PACKET 02H: SIGN IN BUTTON, WHITE GLOW INSTEAD OF OUTLINE, FASTER CHANGE

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Edit ONLY `src/login.css` and `PROGRESS.md`, with EXACTLY the content given. Copy it character for character.
- Do not edit any other file. Do not install any package. Do not run `npx shadcn`.
- If any step fails, or the build fails: **STOP and report the COMPLETE error text. Do not try to fix it yourself.**

## WHAT THIS BUILDS
Two changes to the Sign in button, nothing else:
1. The thin white outline (border) is removed. Instead, when the pointer is over the button, the button turns black with white text AND a soft white glow lights up around its edge.
2. The change is faster: 0.15 seconds instead of 0.3 seconds, both when the pointer goes on and when it leaves.

At rest the button is still solid white with black text. Touch screens still get no stuck hover state.

---

## STEP 0: Check what this packet needs
Check that `src/login.css` exists and contains the text `border: 1px solid #fff;` inside `.ab-button`.
If the file is missing or the text is not in it: **STOP** and report.

## STEP 1: Edit `src/login.css`
Find this block in `src/login.css`. It starts at the line `.ab-button {` and ends at the closing `}` of the `.ab-button:active` rule. Replace that WHOLE block with the new block further below.

**FIND (this exact text, currently in the file):**
```css
.ab-button {
  margin-top: 8px;
  padding: 13px;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  background: #fff;
  border: 1px solid #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

@media (hover: hover) {
  .ab-button:hover {
    background: #000;
    color: #fff;
    border-color: #fff;
  }
}

.ab-button:active {
  transition-duration: 0.1s;
}
```

**REPLACE WITH (this exact text):**
```css
.ab-button {
  margin-top: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  background: #fff;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

@media (hover: hover) {
  .ab-button:hover {
    background: #000;
    color: #fff;
    box-shadow: 0 0 22px 3px rgba(255, 255, 255, 0.55);
  }
}

.ab-button:active {
  transition-duration: 0.1s;
}
```

Do not change anything else in the file. The `.ab-button:focus-visible` rule below it stays exactly as it is. If the FIND text is not found exactly: **STOP** and report.

## STEP 2: Check the build
Run:
```
npm run build
```
It must finish with no errors.

## STEP 3: Check that it starts
Run `npm run dev`. It must print a local address (usually `http://localhost:5173`) and show no red error text. Then stop the server.

## STEP 4: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly these two changes. Change nothing else in the file.
1. Find this line under `## Locked decisions`:
```
- Login button: solid white with black text; on mouse hover the whole button turns black with white text (white border), and goes back when the pointer leaves
```
Replace it with this line:
```
- Login button: solid white with black text; on mouse hover the whole button turns black with white text and a soft white glow around the edge (no outline), 0.15s change, and goes back when the pointer leaves
```
If that exact line is not found: **STOP** and report.
2. At the end of the list under the heading `## Done`, add this line:
```
- Packet 02H: Sign in button glow instead of outline, faster change
```

## STEP 5: Git
Run:
```
git add .
git commit -m "Packet 02H: button glow and faster hover"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `npm run dev` starts with no red error text.
3. `src/login.css` contains the text `box-shadow: 0 0 22px 3px rgba(255, 255, 255, 0.55);` inside `.ab-button:hover`, and no longer contains `border: 1px solid #fff;`.
4. The first line of `git log --oneline` ends with `Packet 02H: button glow and faster hover`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 4 done-checks
- the exact output of `git log --oneline`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
