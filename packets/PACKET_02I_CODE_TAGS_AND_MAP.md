# PACKET 02I: CODE TAGS, CODE MAP AND TAG CHECKER

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Create and edit ONLY the files listed below, with EXACTLY the content given. Copy it character for character.
- Do not install any package. Do not run `npx shadcn`. Do not edit `src/index.css`, `src/main.tsx`, `src/components/PatternWaves.tsx`, `src/components/BlurText.tsx`, `src/components/GlassSurface.tsx`, `package.json`, or any config file.
- Do not add login logic, a database, routing, or extra screens.
- If any step fails, or the build fails, or the checker fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.**

## WHAT THIS BUILDS
A tagging system, so any part of the app can be found without scanning code.
1. Every part of the login screen's code gets a TAG written as two comment lines (START and END), for example `AB:LOGIN.BG`.
2. `CODE_MAP.md` (project root) lists every tag in plain words and says which files hold it.
3. `TAGGING_RULES.md` (project root) holds the rules for creating and using tags.
4. `scripts/check-tags.mjs` checks that the code and the map agree.
5. Two rules are added to the end of `AGENTS.md`.

The login screen must look and behave EXACTLY as it does now. The only changes to existing files are the added comment lines, plus two tidy-ups in `src/login.css` that give the same result: the glass darkness value `--ab-glass-tint` moves from `.ab-screen` into the `.ab-glass` rule, and the wide-screen `@media (min-width: 900px)` block is split in two (one part for the layout, one for the hero text).

---

## STEP 0: Check what this packet needs
Check that all of these files exist:
- `src/App.tsx`
- `src/loginLines.ts`
- `src/login.css`
- `src/components/LoginCard.tsx`
- `src/components/LoginHero.tsx`
- `src/components/PatternWaves.tsx`
- `src/components/BlurText.tsx`
- `src/components/GlassSurface.tsx`
- `AGENTS.md`
- `PROGRESS.md`

If any one is missing: **STOP** and report which.
Then run `git status --short`. If it is not empty, do NOT stop and do NOT fix anything. Just report it.

## STEP 1: Replace the ENTIRE contents of `src/loginLines.ts` with exactly this
```ts
// AB:LOGIN.LINES:START
export const LOGIN_LINES: string[] = [
  "Show up. Every day.",
  "Small steps. Big streak.",
  "Earn today.",
  "Do the work. Own the day.",
  "Focus first. Everything else later.",
  "Be better than yesterday.",
]
// AB:LOGIN.LINES:END
```

## STEP 2: Replace the ENTIRE contents of `src/components/LoginHero.tsx` with exactly this
```tsx
import { useState } from "react"
import BlurText from "@/components/BlurText"
import { LOGIN_LINES } from "@/loginLines"
import "../login.css"

// AB:LOGIN.HERO:START
export default function LoginHero() {
  const [line] = useState(
    () => LOGIN_LINES[Math.floor(Math.random() * LOGIN_LINES.length)]
  )

  return (
    <div className="ab-hero">
      <BlurText
        text={line}
        delay={150}
        animateBy="words"
        direction="top"
        className="ab-hero-text"
      />
    </div>
  )
}
// AB:LOGIN.HERO:END
```

## STEP 3: Replace the ENTIRE contents of `src/App.tsx` with exactly this
```tsx
import PatternWaves from "@/components/PatternWaves"
import LoginCard from "@/components/LoginCard"
import LoginHero from "@/components/LoginHero"
import "./login.css"

export default function App() {
  return (
    <main className="ab-screen">
      {/* AB:LOGIN.BG:START */}
      <div className="ab-bg">
        <PatternWaves
          color="#ffffff"
          backgroundColor="#000000"
          pattern="square"
          wave="silk"
          characters=".:-=+*#%@"
          spacing={8}
          markSize={0.9}
          depth={1.05}
          light={0}
          shine={0.5}
          contrast={1.25}
          speed={0.7}
          scale={1.15}
          direction={33}
          fade="none"
          fadeSize={0.35}
          opacity={1}
          interactive={false}
          cursorSize={50}
          cursorStrength={0.6}
          intro={true}
          paused={false}
        />
      </div>
      {/* AB:LOGIN.BG:END */}
      {/* AB:LOGIN.LAYOUT:START */}
      <div className="ab-center">
        <LoginHero />
        <LoginCard />
      </div>
      {/* AB:LOGIN.LAYOUT:END */}
    </main>
  )
}
```

## STEP 4: Replace the ENTIRE contents of `src/components/LoginCard.tsx` with exactly this
```tsx
import type { FormEvent } from "react"
import GlassSurface from "@/components/GlassSurface"
import "../login.css"

// AB:LOGIN.GLASS:START
// All glass settings are here, in one place. The darkness is --ab-glass-tint in src/login.css.
const GLASS = {
  width: "min(100%, 440px)",
  height: "auto",
  borderRadius: 22,
  borderWidth: 0.07,
  brightness: 50,
  opacity: 0.93,
  blur: 11,
  displace: 4,
  backgroundOpacity: 0,
  saturation: 1,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 0,
  blueOffset: 0,
}
// AB:LOGIN.GLASS:END

export default function LoginCard() {
  // AB:LOGIN.SUBMIT:START
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }
  // AB:LOGIN.SUBMIT:END

  return (
    <GlassSurface {...GLASS} className="ab-glass">
      <form className="ab-content" onSubmit={handleSubmit}>
        {/* AB:LOGIN.FORM:START */}
        <h1 className="ab-title">ASHBORN</h1>
        <p className="ab-subtitle">Sign in to continue</p>
        <div className="ab-field">
          <label className="ab-label" htmlFor="ab-userid">
            User ID
          </label>
          <input
            className="ab-input"
            id="ab-userid"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <div className="ab-field">
          <label className="ab-label" htmlFor="ab-password">
            Password
          </label>
          <input
            className="ab-input"
            id="ab-password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </div>
        {/* AB:LOGIN.FORM:END */}
        {/* AB:LOGIN.BUTTON:START */}
        <button className="ab-button" type="submit">
          Sign in
        </button>
        {/* AB:LOGIN.BUTTON:END */}
      </form>
    </GlassSurface>
  )
}
```

## STEP 5: Replace the ENTIRE contents of `src/login.css` with exactly this
```css
/* Dark glass login for ASHBORN. Every part below has a tag, see CODE_MAP.md in the project root. */
/* All glass settings live in the GLASS object at the top of src/components/LoginCard.tsx. */
/* Input and button ideas adapted from Uiverse.io by Praashoo7 */

/* AB:LOGIN.LAYOUT:START */
.ab-screen {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #000;
}

.ab-bg {
  position: fixed;
  inset: 0;
}

.ab-center {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr;
  align-content: center;
  justify-items: center;
  gap: 28px;
  padding: 24px;
}

@media (min-width: 900px) {
  .ab-center {
    grid-template-columns: 1fr minmax(0, 440px);
    justify-items: stretch;
    align-items: center;
    gap: 64px;
    padding: 48px 8vw;
  }
}
/* AB:LOGIN.LAYOUT:END */

/* AB:LOGIN.HERO:START */
.ab-hero {
  width: min(100%, 440px);
}

.ab-hero-text {
  margin: 0;
  font-size: clamp(34px, 9vw, 44px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.9), 0 0 3px rgba(0, 0, 0, 0.8);
}

@media (min-width: 900px) {
  .ab-hero {
    width: auto;
    max-width: 640px;
  }

  .ab-hero-text {
    font-size: clamp(48px, 6vw, 88px);
  }
}
/* AB:LOGIN.HERO:END */

/* AB:LOGIN.GLASS:START */
/* The darkness of the glass is --ab-glass-tint below. Raise the last number to make it darker. */
/* The GlassSurface component sets its own background, border and shadow from the viewer's light/dark setting. */
/* These !important lines make the glass dark for everyone. */
.ab-glass {
  --ab-glass-tint: rgba(0, 0, 0, 0.55);
  background: var(--ab-glass-tint) !important;
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 30px 80px rgba(0, 0, 0, 0.6) !important;
}
/* AB:LOGIN.GLASS:END */

/* AB:LOGIN.FORM:START */
.ab-content {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 40px 32px 32px;
  color: #fff;
}

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
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}

.ab-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ab-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}

.ab-input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  font-size: 16px;
  color: #fff;
  caret-color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

@media (hover: hover) {
  .ab-input:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.ab-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
}

.ab-input:-webkit-autofill,
.ab-input:-webkit-autofill:hover,
.ab-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  caret-color: #fff;
  transition: background-color 5000s ease-in-out 0s;
}
/* AB:LOGIN.FORM:END */

/* AB:LOGIN.BUTTON:START */
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

.ab-button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* Also turns off the input transitions of the form when reduced motion is requested. */
@media (prefers-reduced-motion: reduce) {
  .ab-input,
  .ab-button {
    transition: none;
  }
}
/* AB:LOGIN.BUTTON:END */
```

## STEP 6: Create `CODE_MAP.md` in the project root with exactly this content
```markdown
# ASHBORN CODE MAP
Kept up to date by the planner: every packet that touches code also updates this file. Checked by `node scripts/check-tags.mjs`.

## How to use
1. Find the thing you want to change in the tables below (plain words).
2. Search the whole project for its tag followed by :START, for example `AB:LOGIN.BG:START` (VS Code: Ctrl+Shift+F).
3. Change only the lines between that START and its END.
Full rules: TAGGING_RULES.md

## Page codes
| Code | Page or area |
|---|---|
| LOGIN | Front page: the login screen |
| MENU | Overlay menu with the hamburger button (not built yet) |
| OVERVIEW | Overview / Hub page (not built yet) |
| TIMER | Pro Timer (not built yet) |
| CALENDAR | Calendar (not built yet) |
| GUIDE | Guide (not built yet) |
| SHARED | Things used on several pages, such as theme settings (not built yet) |

## LOGIN (front page)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:LOGIN.BG` | The moving background (Pattern Waves) | `src/App.tsx` | its props, for example speed, scale, direction, colours, wave style |
| `AB:LOGIN.LAYOUT` | Page structure and grid: text on the left and card on the right on wide screens, stacked on phones | `src/App.tsx`, `src/login.css` | spacing, gaps, the width where it switches to two columns |
| `AB:LOGIN.HERO` | The animated line on the left (BlurText) | `src/components/LoginHero.tsx`, `src/login.css` | reveal speed, by words or letters, direction; text size and shadow in the css |
| `AB:LOGIN.LINES` | The list of lines, one is picked at random each time the page loads | `src/loginLines.ts` | add, remove or reword lines |
| `AB:LOGIN.GLASS` | The dark glass card: frost, edge refraction, size, darkness | `src/components/LoginCard.tsx`, `src/login.css` | the GLASS settings (blur, displace, distortionScale, width); darkness (--ab-glass-tint), border and shadow in the css |
| `AB:LOGIN.FORM` | Card title, subtitle, and the User ID and Password fields | `src/components/LoginCard.tsx`, `src/login.css` | wording; how the fields look (colours, hover, focus) in the css |
| `AB:LOGIN.SUBMIT` | What happens when the form is submitted (nothing yet) | `src/components/LoginCard.tsx` | real login goes here later |
| `AB:LOGIN.BUTTON` | The Sign in button and its hover effect | `src/components/LoginCard.tsx`, `src/login.css` | wording; colours, glow and speed in the css |

## Library components (installed React Bits source: not tagged, never edited)
To change how one looks or moves, change its props where it is used, at the tag named here.
| Component | File | Settings live at |
|---|---|---|
| Pattern Waves (moving background) | `src/components/PatternWaves.tsx` | `AB:LOGIN.BG` |
| BlurText (animated line) | `src/components/BlurText.tsx` | `AB:LOGIN.HERO` |
| GlassSurface (glass card) | `src/components/GlassSurface.tsx` | `AB:LOGIN.GLASS` |

## Untagged files
Setup and config files (package.json, vite and tsconfig files, index.html), `src/index.css`, `src/main.tsx`, AGENTS.md, PROGRESS.md, the packets folder, the scripts folder.
```

## STEP 7: Create `TAGGING_RULES.md` in the project root with exactly this content
(The fence below has FOUR backticks because the file itself contains a three-backtick block. Copy only what is INSIDE the four-backtick lines, including the inner three-backtick lines.)
````markdown
# ASHBORN TAGGING RULES

Purpose: any part of the app can be found and changed without reading or scanning the code. Every part of the code carries a TAG. CODE_MAP.md lists every tag in plain words. A tag is found by searching for it. The command `node scripts/check-tags.mjs` checks that the code and the map agree.

## The tag
Format: `AB:<PAGE>.<PART>`   Example: `AB:LOGIN.BG`
- PAGE is the page or area, in capital letters. The codes in use are in CODE_MAP.md, section "Page codes". Tags are grouped by page, not by build phase, because a page stays while phases end.
- PART says what the thing is, in capital letters, digits and hyphens: BG, HERO, BUTTON, HOVER-GLOW. A part name describes the thing. It never contains a value (a colour, a number) or an order number.
- A tag marks a block with two comment lines. The first one ends with `:START`, the last one with `:END`.
- One tag can appear in several files (for example the markup in a .tsx file and the look in a .css file). In each file it appears exactly once as START and once as END.
- Blocks do not overlap and do not nest.
- Comment forms:
  - in .ts and .tsx code: `// AB:LOGIN.BG:START`
  - inside JSX markup: `{/* AB:LOGIN.BG:START */}`
  - in .css: `/* AB:LOGIN.BG:START */`

## How to find a part
1. Open CODE_MAP.md and find the part in plain words.
2. Search the whole project for the tag followed by `:START`, for example `AB:LOGIN.BG:START`.
3. Change only the lines between START and END.

## Rules for every packet (the planner follows these when writing packets)
1. The planner decides every tag name. The agent copies tags from the packet. The agent never invents, renames or deletes a tag.
2. A packet that creates or edits code contains: the tag comment lines inside the file contents; the exact edit of CODE_MAP.md (new row, changed row or removed row); a step that runs `node scripts/check-tags.mjs`; and the done-check "it prints TAGS OK".
3. NEW THING on an existing page: pick a part name, add the tag lines around its code in each file, add one row to that page's table in CODE_MAP.md.
4. NEW PAGE: add one row to "Page codes" in CODE_MAP.md, add a table for the page, tag every part as in rule 3. Update the page list in the handoff.
5. CHANGING an existing thing: the packet names the tag and the file and says "search for the tag followed by :START, change only between START and END". If the change moves, splits, renames or removes code, the markers and the map are fixed in the same packet.
6. LIBRARY components (installed React Bits source, shadcn files) are never edited. To change how one looks or moves, change its props where it is used. If a packet must edit a library file, the packet says so and the file gets a row in the map section "Library components".
7. Files that cannot hold comments (images, JSON, lock files) are not tagged. They are named in the map section "Untagged files".
8. The map and the code change in the same packet. A packet is not done until `node scripts/check-tags.mjs` prints TAGS OK.

## Tiny changes straight to the agent (a value change only)
For changing one value, paste this into the agent chat with the blanks filled in:
```
Open CODE_MAP.md and find the tag for <THING>. Search the project for that tag followed by :START. Change <WHAT> to <VALUE>. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. Decide nothing else. If anything fails, stop and tell me.
```
Example: Open CODE_MAP.md and find the tag for the front page background animation. Search the project for that tag followed by :START. Change speed to 1.2. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. Decide nothing else. If anything fails, stop and tell me.

Anything bigger than a value change (swap an animation, new feature, new page) goes to the planner chat, which writes a packet.

## The checker
`node scripts/check-tags.mjs` (run from the project root) reads src and CODE_MAP.md and reports:
- a tag line that is malformed
- a tag with no START or no END, or more than one of either, in a file
- a tag in the code that is not in the map, or in the map but not in the code (also checks the file names)
- a tag listed twice in the map
It prints TAGS OK and the counts when everything agrees. Otherwise it prints the problems and stops with an error. If it fails, STOP and report the full output.
````

## STEP 8: Create the folder `scripts` in the project root, then create `scripts/check-tags.mjs` with exactly this content
```js
// Checks that code tags and CODE_MAP.md agree. Run from the project root: node scripts/check-tags.mjs
// It reads files only. It changes nothing.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const root = process.cwd()
const problems = []
const TAG = "[A-Z0-9]+\\.[A-Z0-9-]+"
const FULL = new RegExp(`^AB:(${TAG}):(START|END)$`)
const CODE_EXT = [".ts", ".tsx", ".css"]

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (CODE_EXT.some((ext) => name.endsWith(ext))) out.push(full)
  }
  return out
}

if (!existsSync(join(root, "src"))) {
  console.log("PROBLEM: folder src not found. Run this from the project root.")
  process.exit(1)
}

// 1. Read every tag line in the code.
const places = new Map() // "TAG|file" -> { start: [lines], end: [lines] }
for (const file of walk(join(root, "src"), [])) {
  const rel = relative(root, file).split(sep).join("/")
  const lines = readFileSync(file, "utf8").split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/\bAB:[A-Za-z0-9.:-]*/g)) {
      const hit = FULL.exec(m[0])
      if (!hit) {
        problems.push(`${rel}:${i + 1}: malformed tag "${m[0]}"`)
        continue
      }
      const key = `${hit[1]}|${rel}`
      if (!places.has(key)) places.set(key, { start: [], end: [] })
      places.get(key)[hit[2] === "START" ? "start" : "end"].push(i + 1)
    }
  })
}
for (const [key, p] of places) {
  const [tag, file] = key.split("|")
  if (p.start.length !== 1 || p.end.length !== 1) {
    problems.push(`${file}: tag ${tag} needs exactly one START and one END (found ${p.start.length} START, ${p.end.length} END)`)
  } else if (p.start[0] > p.end[0]) {
    problems.push(`${file}: tag ${tag} has END before START`)
  }
}

// 2. Read the map.
const mapPath = join(root, "CODE_MAP.md")
const mapPlaces = new Set()
const mapTags = new Set()
if (!existsSync(mapPath)) {
  problems.push("CODE_MAP.md not found in the project root")
} else {
  readFileSync(mapPath, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (!line.startsWith("| `AB:")) return
      const cells = line.split("|")
      const tagHit = /^\s*`AB:([A-Z0-9]+\.[A-Z0-9-]+)`\s*$/.exec(cells[1] || "")
      if (!tagHit) {
        problems.push(`CODE_MAP.md:${i + 1}: table row does not start with a valid tag`)
        return
      }
      const tag = tagHit[1]
      if (mapTags.has(tag)) problems.push(`CODE_MAP.md:${i + 1}: tag ${tag} is listed twice`)
      mapTags.add(tag)
      const files = [...(cells[3] || "").matchAll(/`([^`]+\.(?:ts|tsx|css))`/g)].map((m) => m[1])
      if (files.length === 0) problems.push(`CODE_MAP.md:${i + 1}: tag ${tag} lists no file`)
      for (const f of files) mapPlaces.add(`${tag}|${f}`)
    })
}

// 3. Compare code and map.
for (const key of places.keys()) {
  if (!mapPlaces.has(key)) {
    const [tag, file] = key.split("|")
    problems.push(`in code but not in CODE_MAP.md: ${tag} in ${file}`)
  }
}
for (const key of mapPlaces) {
  if (!places.has(key)) {
    const [tag, file] = key.split("|")
    problems.push(`listed in CODE_MAP.md but not found in code: ${tag} in ${file}`)
  }
}

if (problems.length > 0) {
  console.log(`TAGS FAILED: ${problems.length} problem(s)`)
  for (const p of problems) console.log(`- ${p}`)
  process.exit(1)
}
console.log(`TAGS OK: ${mapTags.size} tags, ${places.size} places`)
```

## STEP 9: Add two rules to the END of `AGENTS.md`
Open `AGENTS.md`. Add these two lines at the very end of the file, each on its own new line, after the last existing rule. Change nothing else in the file.
```
9. To find code, open CODE_MAP.md first. Then search the project for the tag it names, followed by :START (example: AB:LOGIN.BG:START). Edit only between that START line and its END line. Never scan the repo.
10. Never invent, rename or delete a tag. Tags are written in packets. After any change to code, run `node scripts/check-tags.mjs`. It must print TAGS OK.
```

## STEP 10: Check the build
Run:
```
npm run build
```
It must finish with no errors.

## STEP 11: Run the tag checker
Run:
```
node scripts/check-tags.mjs
```
It must print exactly this line and nothing else:
```
TAGS OK: 8 tags, 13 places
```
If it prints anything else: **STOP** and report the COMPLETE output.

## STEP 12: Check that it starts
Run `npm run dev`. It must print a local address (usually `http://localhost:5173`) and show no red error text. Then stop the server.

## STEP 13: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly these three changes. Change nothing else in the file.
1. Find this line under `## Locked decisions`:
```
- Glass settings live in the GLASS object at the top of src/components/LoginCard.tsx; the darkness is --ab-glass-tint at the top of .ab-screen in src/login.css
```
Replace it with this line:
```
- Glass settings live in the GLASS object at the top of src/components/LoginCard.tsx; the darkness is --ab-glass-tint inside the .ab-glass rule in src/login.css (tag AB:LOGIN.GLASS)
```
If that exact line is not found: **STOP** and report.
2. At the end of the list under the heading `## Locked decisions`, add this line:
```
- Code tags: every part of the code has a tag AB:<PAGE>.<PART> listed in CODE_MAP.md; rules are in TAGGING_RULES.md; check with node scripts/check-tags.mjs (from Packet 02I)
```
3. At the end of the list under the heading `## Done`, add this line:
```
- Packet 02I: code tags, CODE_MAP.md, TAGGING_RULES.md, tag checker
```

## STEP 14: Git
Run:
```
git add .
git commit -m "Packet 02I: code tags and map"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `npm run dev` starts with no red error text.
3. `node scripts/check-tags.mjs` prints exactly `TAGS OK: 8 tags, 13 places`.
4. `AGENTS.md` contains the text `CODE_MAP.md`.
5. The first line of `git log --oneline` ends with `Packet 02I: code tags and map`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 5 done-checks
- the exact output of `git log --oneline`
- the exact output of `node scripts/check-tags.mjs`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
