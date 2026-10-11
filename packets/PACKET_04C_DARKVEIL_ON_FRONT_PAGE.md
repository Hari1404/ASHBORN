# PACKET 04C: DARK VEIL ON THE FRONT PAGE

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Edit ONLY these files: `src/App.tsx`, `src/login.css`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do NOT edit `src/components/DarkVeil.tsx`. Do NOT edit and do NOT delete `src/components/PatternWaves.tsx` (it stays in the project, unused). Do not edit this packet file.
- Do not install or remove any package.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 7 is allowed.
- Every "replace" below says where to look. The old text must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess.
- If any step fails, asks for a login, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**

## WHAT THIS DOES
The owner chose Dark Veil for the front page. This packet swaps the old moving background (Pattern Waves) for Dark Veil, with the settings from the owner's link: speed 0.8, noiseIntensity 0.11, scanlineFrequency 0.5, warpAmount 5. Everything else on the page stays as it is. The existing lite mode keeps working: the background box is already half size in lite mode, and Dark Veil fills its box by itself, so `resolutionScale` stays 1 in every level. It also updates the code map and the connections list so the checker stays happy.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/App.tsx`, `src/login.css`, `src/lib/lite.ts`, `src/components/PatternWaves.tsx`. If `src/components/DarkVeil.tsx` is missing: **STOP** and report "Packet 04A has not been run." If any other file is missing: **STOP** and report which.
Run:
```
Select-String -Path src/App.tsx -Pattern "DarkVeil"
```
It must print NOTHING. If it prints a line: **STOP** and report "Dark Veil is already used in App.tsx."

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

## STEP 1: Edit `src/App.tsx`
Two changes.

**1a. The import.** Replace this line (it is near the top of the file):
```
import PatternWaves from "@/components/PatternWaves"
```
with:
```
import DarkVeil from "@/components/DarkVeil"
```

**1b. The background block.** Find the line `{/* AB:LOGIN.BG:START */}` and the line `{/* AB:LOGIN.BG:END */}`. KEEP both of those lines. Replace EVERYTHING between them (the comment, the `<div className="ab-bg" ...>` and the `<PatternWaves ... />` inside it) with exactly this (6 spaces of indent on the first line):
```tsx
      {/* Lite mode (src/lib/lite.ts): the box is half size and the css scales it back up. Dark Veil draws itself to fill its box, so resolutionScale stays 1 in every level. Level 2: speed 0, a still picture. See CONNECTIONS.md C21. */}
      <div className="ab-bg" data-lite={LITE_LEVEL > 0 ? "on" : undefined}>
        <DarkVeil
          hueShift={0}
          noiseIntensity={0.11}
          scanlineIntensity={0}
          speed={LITE_LEVEL === 2 ? 0 : 0.8}
          scanlineFrequency={0.5}
          warpAmount={5}
          resolutionScale={1}
          lightMode={false}
        />
      </div>
```
Change nothing else in the file. Do not touch the `AB:AUTH.GATE` block or anything after the `AB:LOGIN.BG:END` line.

## STEP 2: Edit `src/login.css`
Replace this sentence (it is inside the comment above the `.ab-bg[data-lite]` rule, in the LAYOUT block):
```
The 50%, the scale(2) and the lite values of spacing and scale in App.tsx are linked, see CONNECTIONS.md C21.
```
with:
```
The 50% and the scale(2) are linked, see CONNECTIONS.md C21.
```
Change nothing else in the file.

## STEP 3: Edit `CONNECTIONS.md`
Three changes. Change nothing else in the file.

**3a. Entry C03.** Replace the WHOLE entry C03: from the line that starts with `### C03:` up to, but NOT including, the line that starts with `### C04:`. Replace it with exactly this (keep one empty line at the end, before the `### C04:` line):
```markdown
### C03: The front page is built for a dark background with white text
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`, `AB:LOGIN.BRAND`
- If you change: the background look (Dark Veil in BG: its colours are fixed inside the component, hueShift only turns them, and lightMode makes it light, so lightMode stays false), the page base colour (.ab-screen in LAYOUT), the hero text colour (HERO), or the colour of the name in the top left corner (color in BRAND)
- Then also: keep the page base colour dark. Then look at the hero line and at the ASHBORN name in the corner: both are white and sit straight on the animation (the hero line is helped by a dark shadow, the name by nothing). Check by eye that the brightest part of Dark Veil still leaves both readable.
- If you forget: with a light or bright background the white line on the left becomes hard or impossible to read; a base colour that differs from the animation shows as a flash or a band before the animation loads.
- Anchor: `AB:LOGIN.BG @ src/App.tsx = lightMode={false}`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = background: #000;`
- Anchor: `AB:LOGIN.HERO @ src/login.css = color: #fff;`
- Anchor: `AB:LOGIN.BRAND @ src/components/LoginBrand.tsx = color="#fff"`
```

**3b. Entry C21.** Replace the WHOLE entry C21: from the line that starts with `### C21:` up to, but NOT including, the line that starts with `### C22:`. Replace it with exactly this (keep one empty line at the end, before the `### C22:` line):
```markdown
### C21: The lite background is drawn in a half size box and scaled back up
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`
- If you change: resolutionScale in BG, or the size or scale lines of `.ab-bg[data-lite]` in LAYOUT
- Then also: in lite mode the animation sits in a box of half the size (50% wide and high, plus 1px) and the css scales it up by 2 (scale(2)). Dark Veil draws itself to fill the box it sits in, so a phone draws a quarter of the pixels with no other setting. resolutionScale must stay 1 in every level: the component sets its canvas to the size of the box times resolutionScale, so any other value leaves the canvas smaller than the box and shows a black band. The attribute data-lite in App.tsx and the css selector `.ab-bg[data-lite]` are linked by that name.
- If you forget: a resolutionScale other than 1 shows a black band at the edge; the background stays full size and the phone stays slow (a misspelled data-lite is not an error anywhere).
- Anchor: `AB:LOGIN.BG @ src/App.tsx = resolutionScale={1}`
- Anchor: `AB:LOGIN.BG @ src/App.tsx = data-lite={`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg[data-lite] {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = width: calc(50% + 1px);`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = height: calc(50% + 1px);`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = transform: scale(2);`
- Check by hand: after any change look at the page on a laptop with ?lite=0 and with ?lite=1 in the page address. The picture must fill the whole screen with no band at the edges and look the same in both (lite is only a little softer).
```

**3c. One sentence in entry C22.** Replace this sentence:
```
App.tsx (BG): half-size background with its own spacing and scale (see C21), and a still background at level 2.
```
with:
```
App.tsx (BG): half-size box (see C21), and at level 2 the speed of the background is 0, a still picture (Dark Veil has no pause: it still redraws that one picture on every frame).
```

## STEP 4: Edit `CODE_MAP.md`
Two changes. Change nothing else in the file.

**4a.** Replace this whole line (in the LOGIN table):
```
| `AB:LOGIN.BG` | The moving background (Pattern Waves) | `src/App.tsx` | its props, for example speed, scale, direction, colours, wave style (spacing and scale have a second, lite value, see CONNECTIONS.md C21) |
```
with this whole line:
```
| `AB:LOGIN.BG` | The moving background (Dark Veil) | `src/App.tsx` | its props: speed, noiseIntensity, warpAmount, hueShift, scanlineIntensity, scanlineFrequency (resolutionScale must stay 1 and lightMode must stay false, see CONNECTIONS.md C03 and C21) |
```

**4b.** Replace this whole line (in the "Library components" table):
```
| Pattern Waves (moving background) | `src/components/PatternWaves.tsx` | `AB:LOGIN.BG` |
```
with these TWO lines (one after the other, no empty line between them):
```
| Dark Veil (moving background) | `src/components/DarkVeil.tsx` | `AB:LOGIN.BG` |
| Pattern Waves (the old background: no longer used, kept in the project) | `src/components/PatternWaves.tsx` | nowhere |
```

## STEP 5: Check the files, the checker and the build
Run:
```
Select-String -Path src/App.tsx -Pattern "PatternWaves"
```
It must print NOTHING. If it prints a line: **STOP** and report it.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 22 connections, 71 anchors, 20 classes, 1 css variables, 2 label links
```
(Note: 71 anchors, one fewer than at the start. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list ONLY `CODE_MAP.md`, `CONNECTIONS.md`, `src/App.tsx` and `src/login.css`. If ANY other file is changed: **STOP** and report the COMPLETE output. Do not commit. (Untracked `??` entries do not count.)

## STEP 6: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 04C: Dark Veil is the front page background (replaces Pattern Waves, which is kept but unused)
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 7: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/App.tsx src/login.css CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 04C: Dark Veil on the front page"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git status --short` and copy its raw output. Files that were not part of this packet may still show as untracked (`??`). Leave them alone.

## STEP 8: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (72 anchors).
2. `Select-String -Path src/App.tsx -Pattern "PatternWaves"` printed nothing, and `src/components/DarkVeil.tsx` and `src/components/PatternWaves.tsx` were not edited.
3. `node scripts/check-tags.mjs` printed the two lines of Step 5 (71 anchors).
4. `npm run build` finished with no errors.
5. `git show --stat HEAD` lists only `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/App.tsx` and `src/login.css`.
6. The first line of `git log --oneline` ends with `Packet 04C: Dark Veil on the front page`.
7. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
8. `git push` finished without an error.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 8 done-checks
- the RAW outputs of the 3 commands of Step 0
- the exact output of `node scripts/check-tags.mjs` from Step 5
- the RAW outputs of `git diff --stat` and `git status --short` from Step 5
- the ENTIRE final text of the block between `{/* AB:LOGIN.BG:START */}` and `{/* AB:LOGIN.BG:END */}` in `src/App.tsx`, copied with a plain print command (no line numbers)
- the RAW output of `git ls-files | Select-String -Pattern "\.env"` and the exact output of `git show --stat HEAD`
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the page himself.
