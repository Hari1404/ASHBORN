# PACKET 02K: THE ASHBORN NAME TOP LEFT (FUZZY TEXT, SYNE FONT)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. Copy every text character for character.
- Two installs are allowed, and ONLY these two: `npx shadcn@latest add @react-bits/FuzzyText-TS-TW --yes` (Step 1) and `npm install @fontsource-variable/syne` (Step 2). Install nothing else.
- Do NOT edit any file in `src/components` other than the ones named in this packet. Never edit `BlurText.tsx`, `GlassSurface.tsx`, `PatternWaves.tsx` or the new `FuzzyText.tsx`. Do not edit `src/index.css`, `src/main.tsx` or any config file.
- For every FIND and REPLACE: the FIND text must appear EXACTLY ONCE in that file. If it appears zero times or more than once: **STOP** and report the file and the edit number. Do not guess.
- If any step fails, asks for a license key, a login or a payment, or asks a question not covered here, or the build fails, or the checker fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.**

## WHAT THIS BUILDS
1. The word ASHBORN moves OUT of the login card to the TOP LEFT corner of the page. It is drawn with the React Bits component Fuzzy Text (the letters fuzz all the time, more when the pointer is over them, with a short glitch every 2 seconds and a flash on click) in the font Syne ExtraBold.
2. The card keeps "Sign in to continue", the User ID field, the Password field and the Sign in button. Only its title line is removed, so the card is a little shorter.
3. Nothing else changes: the background, the hero line and the glass stay exactly as they are.
4. `CODE_MAP.md` and `CONNECTIONS.md` get the new part (tag `AB:LOGIN.BRAND`) and three new connections (C14, C15, C16), and the checker must pass.

---

## STEP 0: Check what this packet needs
Check that all of these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `TAGGING_RULES.md`, `AGENTS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/App.tsx`, `src/login.css`, `src/components/LoginCard.tsx`, `src/components/LoginHero.tsx`, `src/components/BlurText.tsx`, `src/components/GlassSurface.tsx`, `src/components/PatternWaves.tsx`.
If `CONNECTIONS.md` is missing, Packet 02J has not been run: **STOP** and report "Packet 02J has not been run. Run it first." If any other file is missing: **STOP** and report which.
Check that `src/components/FuzzyText.tsx` does NOT exist yet and that `src/components/LoginBrand.tsx` does NOT exist yet. If either exists: **STOP** and report.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 8 tags, 13 places
CONNECTIONS OK: 13 connections, 35 anchors, 13 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run `git status --short` and `git log --oneline -3`. Do NOT stop and do NOT fix anything. Just report both outputs.

## STEP 1: Install Fuzzy Text
Run:
```
npx shadcn@latest add @react-bits/FuzzyText-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP** and report.
- If it asks whether to overwrite any existing file: answer **no**, then STOP and report which file.
- If it says the component or registry was not found: STOP and report the exact message.

Then run:
```
git status --short
```
Note the full path of every NEW file. The file `src/components/FuzzyText.tsx` must exist. If the component was installed under another name or path: **STOP** and report the path.

Then run this one command. It must print exactly `FUZZY PROPS OK`:
```
node -e "const t=require('fs').readFileSync('src/components/FuzzyText.tsx','utf8');const need=['glitchMode','glitchInterval','glitchDuration','clickEffect','fuzzRange','letterSpacing','baseIntensity','hoverIntensity','transitionDuration','export default FuzzyText'];const miss=need.filter(n=>!t.includes(n));console.log(miss.length?('MISSING: '+miss.join(', ')):'FUZZY PROPS OK')"
```
If it prints anything else: **STOP** and report the COMPLETE output.

Open `src/components/FuzzyText.tsx` and copy, EXACTLY and without changing anything, for the report: (a) the whole `interface FuzzyTextProps` block with each prop's name and type, (b) the line `export default ...` at the bottom, (c) every `import` line that points to a package.

## STEP 2: Install the font
Run:
```
npm install @fontsource-variable/syne
```
Then run:
```
git diff package.json
```
`package.json` must now list `@fontsource-variable/syne` under `dependencies`. If it does not, or if any other package was added: **STOP** and report the COMPLETE output. Note the version of `@fontsource-variable/syne` for the report.

## STEP 3: Create `src/components/LoginBrand.tsx`
Create this NEW file with exactly this content:

### Create `src/components/LoginBrand.tsx` with exactly this content
```tsx
import FuzzyText from "@/components/FuzzyText"
import "../login.css"

// AB:LOGIN.BRAND:START
// The ASHBORN name in the top left corner. All Fuzzy Text settings are here, in one place.
// fuzzRange is linked to margin-left in src/login.css (see CONNECTIONS.md).
export default function LoginBrand() {
  return (
    <div className="ab-brand" role="img" aria-label="ASHBORN">
      <FuzzyText
        fontSize={30}
        fontWeight={800}
        fontFamily='"Syne Variable", sans-serif'
        color="#fff"
        enableHover={true}
        baseIntensity={0.2}
        hoverIntensity={0.5}
        fuzzRange={30}
        fps={60}
        direction="horizontal"
        transitionDuration={0}
        clickEffect={true}
        glitchMode={true}
        glitchInterval={2000}
        glitchDuration={200}
        letterSpacing={-1}
      >
        ASHBORN
      </FuzzyText>
    </div>
  )
}
// AB:LOGIN.BRAND:END
```

## STEP 4: Edit `src/App.tsx`
Make these 2 edits. Change nothing else in the file.

### Edit 1 in `src/App.tsx`

**FIND (this exact text, it must appear exactly once in the file):**
```tsx
import LoginHero from "@/components/LoginHero"
```

**REPLACE WITH (this exact text):**
```tsx
import LoginHero from "@/components/LoginHero"
import LoginBrand from "@/components/LoginBrand"
```

### Edit 2 in `src/App.tsx`

**FIND (this exact text, it must appear exactly once in the file):**
```tsx
{/* AB:LOGIN.LAYOUT:START */}
```

**REPLACE WITH (this exact text):**
```tsx
{/* AB:LOGIN.BRAND:START */}
      <LoginBrand />
      {/* AB:LOGIN.BRAND:END */}
      {/* AB:LOGIN.LAYOUT:START */}
```

## STEP 5: Edit `src/components/LoginCard.tsx`
Make this 1 edit. Change nothing else in the file. (It removes the ASHBORN title line from the card.)

### Edit 1 in `src/components/LoginCard.tsx`

**FIND (this exact text, it must appear exactly once in the file):**
```tsx
        <h1 className="ab-title">ASHBORN</h1>
        <p className="ab-subtitle">Sign in to continue</p>
```

**REPLACE WITH (this exact text):**
```tsx
        <p className="ab-subtitle">Sign in to continue</p>
```

## STEP 6: Edit `src/login.css`
Make these 4 edits. Change nothing else in the file.

### Edit 1 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
/* AB:LOGIN.LAYOUT:START */
```

**REPLACE WITH (this exact text):**
```css
@import "@fontsource-variable/syne";

/* AB:LOGIN.LAYOUT:START */
```

### Edit 2 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
  gap: 28px;
  padding: 24px;
}
```

**REPLACE WITH (this exact text):**
```css
  gap: 28px;
  padding: 84px 24px 24px;
}
```

### Edit 3 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
/* AB:LOGIN.LAYOUT:END */
```

**REPLACE WITH (this exact text):**
```css
/* AB:LOGIN.LAYOUT:END */

/* AB:LOGIN.BRAND:START */
/* The ASHBORN name in the top left corner. It is a Fuzzy Text canvas, see src/components/LoginBrand.tsx. */
/* The canvas has a see-through margin of (fuzzRange + 25) pixels on its left side. The negative margin-left below cancels it, so the letters start exactly at the left offset. If fuzzRange changes, change margin-left too. */
.ab-brand {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
  line-height: 0;
}

.ab-brand canvas {
  display: block;
  margin-left: -55px;
}
/* AB:LOGIN.BRAND:END */
```

### Edit 4 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
.ab-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.32em;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 14px rgba(0, 0, 0, 0.5);
}

.ab-subtitle {
  margin: -8px 0 8px;
```

**REPLACE WITH (this exact text):**
```css
.ab-subtitle {
  margin: 0 0 8px;
```

## STEP 7: Edit `CODE_MAP.md`
Make these 3 edits. Change nothing else in the file.

### Edit 1 in `CODE_MAP.md`

**FIND (this exact text, it must appear exactly once in the file):**
```markdown
Card title, subtitle, and the User ID and Password fields
```

**REPLACE WITH (this exact text):**
```markdown
Card subtitle ("Sign in to continue") and the User ID and Password fields
```

### Edit 2 in `CODE_MAP.md`

**FIND (this exact text, it must appear exactly once in the file):**
```markdown
| `AB:LOGIN.HERO` | The animated line on the left (BlurText) |
```

**REPLACE WITH (this exact text):**
```markdown
| `AB:LOGIN.BRAND` | The ASHBORN name in the top left corner (Fuzzy Text: fuzzes, more on hover, short glitch every 2 seconds) | `src/App.tsx`, `src/components/LoginBrand.tsx`, `src/login.css` | the Fuzzy Text settings (intensity, fuzzRange, glitch, fontSize) in LoginBrand.tsx; position in the css |
| `AB:LOGIN.HERO` | The animated line on the left (BlurText) |
```

### Edit 3 in `CODE_MAP.md`

**FIND (this exact text, it must appear exactly once in the file):**
```markdown
| GlassSurface (glass card) | `src/components/GlassSurface.tsx` | `AB:LOGIN.GLASS` |
```

**REPLACE WITH (this exact text):**
```markdown
| GlassSurface (glass card) | `src/components/GlassSurface.tsx` | `AB:LOGIN.GLASS` |
| FuzzyText (the ASHBORN name) | `src/components/FuzzyText.tsx` | `AB:LOGIN.BRAND` |
```

## STEP 8: Edit `CONNECTIONS.md`
Make these 4 edits. Change nothing else in the file.

### Edit 1 in `CONNECTIONS.md`

**FIND (this exact text, it must appear exactly once in the file):**
```markdown
### C03: The front page is built for white on black
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`
- If you change: the background colour (backgroundColor in BG), the page base colour (.ab-screen in LAYOUT), or the hero text colour (HERO)
- Then also: keep the background colour and the page base colour the same. Then look at the hero line: it is white and sits straight on the animation, helped only by its dark shadow.
```

**REPLACE WITH (this exact text):**
```markdown
### C03: The front page is built for white on black
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`, `AB:LOGIN.BRAND`
- If you change: the background colour (backgroundColor in BG), the page base colour (.ab-screen in LAYOUT), the hero text colour (HERO), or the colour of the name in the top left corner (color in BRAND)
- Then also: keep the background colour and the page base colour the same. Then look at the hero line and at the ASHBORN name in the corner: both are white and sit straight on the animation (the hero line is helped by a dark shadow, the name by nothing).
```

### Edit 2 in `CONNECTIONS.md`

**FIND (this exact text, it must appear exactly once in the file):**
```markdown
- Anchor: `AB:LOGIN.HERO @ src/login.css = color: #fff;`
```

**REPLACE WITH (this exact text):**
```markdown
- Anchor: `AB:LOGIN.HERO @ src/login.css = color: #fff;`
- Anchor: `AB:LOGIN.BRAND @ src/components/LoginBrand.tsx = color="#fff"`
```

### Edit 3 in `CONNECTIONS.md`

**FIND (this exact text, it must appear exactly once in the file):**
```markdown
## Things to know (no check is possible)
```

**REPLACE WITH (this exact text):**
```markdown
### C14: The name in the corner is a canvas with a see-through margin
- Tags: `AB:LOGIN.BRAND`
- If you change: fuzzRange in LoginBrand.tsx, or the margin-left of the canvas in login.css
- Then also: Fuzzy Text draws on a canvas that is wider than the letters: it adds a see-through margin of fuzzRange + 20 pixels on each side, plus 5 pixels of its own. The negative margin-left in BRAND (now -55px, which is 30 + 20 + 5) cancels it so the letters start at the corner offset. If you change fuzzRange to a new number, margin-left becomes minus (new number + 25).
- If you forget: the name sits too far to the right, or is cut off at the left edge of the screen, and no longer lines up with the hero line below it.
- Anchor: `AB:LOGIN.BRAND @ src/components/LoginBrand.tsx = fuzzRange={30}`
- Anchor: `AB:LOGIN.BRAND @ src/login.css = margin-left: -55px;`

### C15: The name in the corner sits on top of the page and the content is kept clear of it
- Tags: `AB:LOGIN.BRAND`, `AB:LOGIN.LAYOUT`
- If you change: the size of the name (fontSize in LoginBrand.tsx), its position or z-index (BRAND), the top padding of the phone layout (.ab-center in LAYOUT), the z-index of .ab-center (LAYOUT), or where LoginBrand sits in App.tsx
- Then also: the name is positioned in the top left corner of the whole page (.ab-screen in LAYOUT is position: relative) and has z-index 2, above the content (z-index 1). The phone layout has 84px of padding on top so the hero line and the card start below the name. A bigger name needs more top padding. LoginBrand must stay OUTSIDE the .ab-center grid in App.tsx: inside it, it would become a grid cell and break the column order (see C12).
- If you forget: the name overlaps the hero line or the card on a phone, hides behind the content, or pushes the hero line and the card out of their columns on a laptop.
- Check by hand: the checker cannot see whether LoginBrand is inside or outside the .ab-center grid, or whether the name overlaps anything. After any change, look at the page on a laptop and on a phone.
- Anchor: `AB:LOGIN.BRAND @ src/App.tsx = <LoginBrand />`
- Anchor: `AB:LOGIN.BRAND @ src/login.css = position: absolute;`
- Anchor: `AB:LOGIN.BRAND @ src/login.css = z-index: 2;`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = padding: 84px 24px 24px;`

### C16: The font of the name is a package, a css import and a font family name
- Tags: `AB:LOGIN.BRAND`
- If you change: the font of the name (now Syne, weight 800)
- Then also: three places must change together: the package (npm install @fontsource-variable/<new font>), the @import line at the top of login.css (it sits outside every tag, above LAYOUT), and fontFamily in LoginBrand.tsx (the family name is written the way the package defines it, for example "Syne Variable"). The weight (fontWeight 800) must exist in the new font. Pick a heavy font: Fuzzy Text shifts rows of pixels, and thin letters turn to mush.
- If you forget: the name appears in a plain fallback font, or the build fails because the css import cannot find the package.
- Anchor: `src/login.css = @import "@fontsource-variable/syne";`
- Anchor: `AB:LOGIN.BRAND @ src/components/LoginBrand.tsx = fontFamily='"Syne Variable", sans-serif'`
- Check by hand: after a font change look at the name; the checker does not see whether the font really loaded.

## Things to know (no check is possible)
```

### Edit 4 in `CONNECTIONS.md`

**FIND (this exact text, it must appear exactly once in the file):**
```markdown
- The hero line is a different length each time. Very long lines wrap onto more rows; the font size in HERO is set for short lines.
```

**REPLACE WITH (this exact text):**
```markdown
- The hero line is a different length each time. Very long lines wrap onto more rows; the font size in HERO is set for short lines.
- The name in the corner (BRAND) is drawn on a canvas 60 times a second, on top of the moving background and the glass card. Phone speed and battery with all three together have NOT been tested. If a phone feels slow, lower fps in LoginBrand.tsx first.
- The name is a picture of text, not real text: it cannot be selected or copied. The wrapper has role="img" and aria-label="ASHBORN" so screen readers still say the name.
```

## STEP 9: Check the build
Run:
```
npm run build
```
It must finish with no errors. If it fails: **STOP** and report the COMPLETE output. (A failure mentioning `@fontsource-variable/syne` or `FuzzyText` is exactly what the planner needs to see. Do not fix it.)

## STEP 10: Run the checker
Run:
```
node scripts/check-tags.mjs
```
It must print exactly these two lines and nothing else:
```
TAGS OK: 9 tags, 16 places
CONNECTIONS OK: 16 connections, 44 anchors, 13 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output. (If it prints CONNECTIONS FAILED or TAGS FAILED, do not fix it. Report the output.)

## STEP 11: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly these two changes. Change nothing else in the file.
1. At the end of the list under the heading `## Locked decisions`, add this line:
```
- Login name: ASHBORN is shown in the top left corner as React Bits Fuzzy Text in the font Syne ExtraBold, not inside the card (from Packet 02K)
```
2. At the end of the list under the heading `## Done`, add this line:
```
- Packet 02K: ASHBORN name moved to the top left as Fuzzy Text (Syne), card title removed, connections C14 to C16
```
If either heading is not found: **STOP** and report.

## STEP 12: Git
Run:
```
git add .
git commit -m "Packet 02K: ASHBORN name top left"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `node scripts/check-tags.mjs` prints exactly the two lines of Step 10.
3. `src/components/LoginBrand.tsx` exists, and `src/components/LoginCard.tsx` does not contain the text `ab-title`.
4. `package.json` contains `@fontsource-variable/syne`.
5. The first line of `git log --oneline` ends with `Packet 02K: ASHBORN name top left`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 5 done-checks
- the exact output of `git log --oneline`
- the exact output of `node scripts/check-tags.mjs`
- the outputs you were asked to report in Step 0
- the Step 1 report: the full path of every new file, the printed line `FUZZY PROPS OK`, the `interface FuzzyTextProps` block, the `export default` line, the package imports
- the installed version of `@fontsource-variable/syne`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
