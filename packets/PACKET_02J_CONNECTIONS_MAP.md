# PACKET 02J: CONNECTIONS MAP (WHAT IS TIED TO WHAT) AND CHECKER UPGRADE

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Create and edit ONLY the files listed below, with EXACTLY the content given. Copy it character for character.
- Do not install any package. Do not run `npx shadcn`. Do not edit ANY file inside the `src` folder, `package.json`, or any config file. This packet changes no app code: the login screen cannot change.
- If any step fails, or the build fails, or the checker fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.**

## WHAT THIS BUILDS
Code tags (Packet 02I) say WHERE a part is. This packet adds a file that says WHAT IS TIED TO WHAT, so a change to one part does not silently break another.
1. `CONNECTIONS.md` (project root): one entry per connection, in plain words: what to change together with what, and what breaks if you forget.
2. `scripts/check-tags.mjs` is replaced by an upgraded checker. It still does every tag check as before. It now also checks that the connections in `CONNECTIONS.md` still match the code (a linked value changed on its own is reported), that every `ab-` class used in a .tsx file is defined in a .css file and the other way round, that css variables are defined and used, and that every label points to a field.
3. `CODE_MAP.md` and `TAGGING_RULES.md` are replaced by updated versions that mention `CONNECTIONS.md`.
4. One rule (11) is added to the end of `AGENTS.md`.

---

## STEP 0: Check what this packet needs
Check that all of these files exist:
- `CODE_MAP.md`
- `TAGGING_RULES.md`
- `scripts/check-tags.mjs`
- `AGENTS.md`
- `PROGRESS.md`
- `src/App.tsx`
- `src/loginLines.ts`
- `src/login.css`
- `src/components/LoginCard.tsx`
- `src/components/LoginHero.tsx`

If `CODE_MAP.md`, `TAGGING_RULES.md` or `scripts/check-tags.mjs` is missing, Packet 02I has not been run. **STOP** and report: "Packet 02I has not been run. Run it first." If any other file is missing: **STOP** and report which.

Open `AGENTS.md`. It must contain the text `node scripts/check-tags.mjs`. If it does not: **STOP** and report.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 8 tags, 13 places
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run `git status --short` and `git log --oneline -3`. Do NOT stop and do NOT fix anything. Just report both outputs.

## STEP 1: Replace the ENTIRE contents of `scripts/check-tags.mjs` with exactly this
```js
// Checks that code tags, CODE_MAP.md and CONNECTIONS.md agree with the code.
// Run from the project root: node scripts/check-tags.mjs
// It reads files only. It changes nothing.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const root = process.cwd()
const problems = []
const connProblems = []
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
const fileLines = new Map() // file -> array of lines
for (const file of walk(join(root, "src"), [])) {
  const rel = relative(root, file).split(sep).join("/")
  const lines = readFileSync(file, "utf8").split(/\r?\n/)
  fileLines.set(rel, lines)
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

// 4. Read CONNECTIONS.md and check every anchor.
// An anchor is a piece of text that must still exist in a place that is linked to another place.
//   - [tag @ file = text]: the text must be between the START and END lines of that tag in that file.
//   - [file = text]: the text must be somewhere in that file (used for a linked line that sits outside every tag).
const codeTags = new Set([...places.keys()].map((k) => k.split("|")[0]))
const REQUIRED = ["Tags", "If you change", "Then also", "If you forget"]
const LABELS = [...REQUIRED, "Anchor", "Check by hand"]
const connIds = new Set()
let anchorCount = 0
const connPath = join(root, "CONNECTIONS.md")
if (!existsSync(connPath)) {
  connProblems.push("CONNECTIONS.md not found in the project root")
} else {
  const blocks = []
  let cur = null
  readFileSync(connPath, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      const head = /^### (C\d{2,3}): (.+)$/.exec(line)
      if (head) {
        cur = { id: head[1], line: i + 1, labels: new Set(), tags: [], anchors: [] }
        blocks.push(cur)
        return
      }
      if (/^#{1,3} /.test(line)) {
        cur = null
        return
      }
      if (!cur) return
      const item = /^- ([A-Za-z ]+): ?(.*)$/.exec(line)
      if (!item || !LABELS.includes(item[1])) return
      cur.labels.add(item[1])
      if (item[1] === "Tags") {
        for (const t of item[2].matchAll(/`AB:([^`]*)`/g)) cur.tags.push({ tag: t[1], line: i + 1 })
      }
      if (item[1] === "Anchor") {
        const raw = /^`(.+)`\s*$/.exec(item[2].trim())
        if (!raw) {
          connProblems.push(`CONNECTIONS.md:${i + 1}: ${cur.id}: Anchor line must be one piece of text between backticks`)
          return
        }
        const eq = raw[1].indexOf(" = ")
        if (eq < 1 || eq + 3 >= raw[1].length) {
          connProblems.push(`CONNECTIONS.md:${i + 1}: ${cur.id}: Anchor must look like  tag @ file = text  or  file = text`)
          return
        }
        const left = raw[1].slice(0, eq)
        const text = raw[1].slice(eq + 3)
        const at = left.indexOf(" @ ")
        const anchor = { line: i + 1, text }
        if (at >= 0) {
          const t = /^AB:([A-Z0-9]+\.[A-Z0-9-]+)$/.exec(left.slice(0, at))
          if (!t) {
            connProblems.push(`CONNECTIONS.md:${i + 1}: ${cur.id}: Anchor has an invalid tag "${left.slice(0, at)}"`)
            return
          }
          anchor.tag = t[1]
          anchor.file = left.slice(at + 3)
        } else {
          anchor.file = left
        }
        cur.anchors.push(anchor)
      }
    })

  if (blocks.length === 0) connProblems.push("CONNECTIONS.md: no connection found (headings look like  ### C01: title)")
  for (const b of blocks) {
    if (connIds.has(b.id)) connProblems.push(`CONNECTIONS.md:${b.line}: ${b.id} is listed twice`)
    connIds.add(b.id)
    for (const need of REQUIRED) {
      if (!b.labels.has(need)) connProblems.push(`CONNECTIONS.md:${b.line}: ${b.id} has no "- ${need}:" line`)
    }
    if (b.anchors.length === 0 && !b.labels.has("Check by hand")) {
      connProblems.push(`CONNECTIONS.md:${b.line}: ${b.id} needs at least one "- Anchor:" line or a "- Check by hand:" line`)
    }
    if (b.tags.length === 0) connProblems.push(`CONNECTIONS.md:${b.line}: ${b.id} names no tag in its "- Tags:" line`)
    for (const t of b.tags) {
      if (!codeTags.has(t.tag)) connProblems.push(`CONNECTIONS.md:${t.line}: ${b.id} names tag AB:${t.tag}, which is not in the code`)
    }
    for (const a of b.anchors) {
      anchorCount++
      const where = `CONNECTIONS.md:${a.line}: ${b.id}`
      if (a.tag && !b.tags.some((t) => t.tag === a.tag)) {
        connProblems.push(`${where}: anchor uses AB:${a.tag}, which is not in the "- Tags:" line of ${b.id}`)
        continue
      }
      const lines = fileLines.get(a.file)
      if (!lines) {
        connProblems.push(`${where}: file ${a.file} not found (only .ts, .tsx and .css files under src are read)`)
        continue
      }
      let scope = lines
      let scopeName = a.file
      if (a.tag) {
        const p = places.get(`${a.tag}|${a.file}`)
        if (!p || p.start.length !== 1 || p.end.length !== 1 || p.start[0] > p.end[0]) {
          connProblems.push(`${where}: tag AB:${a.tag} is not (correctly) marked in ${a.file}`)
          continue
        }
        scope = lines.slice(p.start[0], p.end[0] - 1)
        scopeName = `AB:${a.tag} in ${a.file}`
      }
      if (!scope.join("\n").includes(a.text)) {
        connProblems.push(`${where}: expected the text  ${a.text}  inside ${scopeName}, but it is not there. A linked place was changed on its own.`)
      }
    }
  }
}

// 5. Class names: every ab- class used in a .tsx file is defined in a .css file, and the other way round.
//    CSS variables: every --ab- variable that is used is defined, and the other way round.
//    Labels: every htmlFor points to an id in the same file.
const usedClasses = new Map()
const definedClasses = new Map()
const usedVars = new Map()
const definedVars = new Map()
let labelCount = 0
for (const [rel, lines] of fileLines) {
  if (rel.endsWith(".tsx")) {
    const ids = new Map()
    const fors = []
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/className\s*=\s*(?:"([^"]*)"|\{\s*"([^"]*)"\s*\})/g)) {
        for (const name of (m[1] ?? m[2] ?? "").split(/\s+/)) {
          if (name.startsWith("ab-") && !usedClasses.has(name)) usedClasses.set(name, `${rel}:${i + 1}`)
        }
      }
      for (const m of line.matchAll(/\bid\s*=\s*"([^"]+)"/g)) {
        if (ids.has(m[1])) connProblems.push(`${rel}:${i + 1}: id "${m[1]}" is used twice in this file`)
        ids.set(m[1], i + 1)
      }
      for (const m of line.matchAll(/\bhtmlFor\s*=\s*"([^"]+)"/g)) fors.push({ id: m[1], line: i + 1 })
    })
    for (const f of fors) {
      labelCount++
      if (!ids.has(f.id)) connProblems.push(`${rel}:${f.line}: a label points to id "${f.id}", but no element in this file has that id`)
    }
  }
  if (rel.endsWith(".css")) {
    const text = lines.join("\n").replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
    text.split("\n").forEach((line, i) => {
      for (const m of line.matchAll(/\.(ab-[a-z0-9-]+)/g)) {
        if (!definedClasses.has(m[1])) definedClasses.set(m[1], `${rel}:${i + 1}`)
      }
      for (const m of line.matchAll(/(--ab-[a-z0-9-]+)\s*:/g)) {
        if (!definedVars.has(m[1])) definedVars.set(m[1], `${rel}:${i + 1}`)
      }
      for (const m of line.matchAll(/var\(\s*(--ab-[a-z0-9-]+)/g)) {
        if (!usedVars.has(m[1])) usedVars.set(m[1], `${rel}:${i + 1}`)
      }
    })
  }
}
for (const [name, where] of usedClasses) {
  if (!definedClasses.has(name)) connProblems.push(`${where}: class "${name}" is used in code, but no .css file under src defines .${name}`)
}
for (const [name, where] of definedClasses) {
  if (!usedClasses.has(name)) connProblems.push(`${where}: .${name} is defined in css, but no .tsx file under src uses it`)
}
for (const [name, where] of usedVars) {
  if (!definedVars.has(name)) connProblems.push(`${where}: css variable ${name} is used, but never defined`)
}
for (const [name, where] of definedVars) {
  if (!usedVars.has(name)) connProblems.push(`${where}: css variable ${name} is defined, but never used`)
}

// 6. Report.
if (problems.length > 0) {
  console.log(`TAGS FAILED: ${problems.length} problem(s)`)
  for (const p of problems) console.log(`- ${p}`)
} else {
  console.log(`TAGS OK: ${mapTags.size} tags, ${places.size} places`)
}
if (connProblems.length > 0) {
  console.log(`CONNECTIONS FAILED: ${connProblems.length} problem(s)`)
  for (const p of connProblems) console.log(`- ${p}`)
  console.log("Meaning: a place that is linked to another place was changed on its own, or CONNECTIONS.md is wrong. Do not fix it yourself. Report this output.")
} else {
  console.log(
    `CONNECTIONS OK: ${connIds.size} connections, ${anchorCount} anchors, ${definedClasses.size} classes, ${definedVars.size} css variables, ${labelCount} label links`
  )
}
if (problems.length > 0 || connProblems.length > 0) process.exit(1)
```

## STEP 2: Create `CONNECTIONS.md` in the project root with exactly this content
```markdown
# ASHBORN CONNECTIONS
Which parts of the code are tied to which other parts. Read this BEFORE you change anything. Kept up to date by the planner: every packet that changes code also updates this file. Checked by `node scripts/check-tags.mjs` (it must print a line starting CONNECTIONS OK).

## How to use
1. Find the tag of the part you want to change in CODE_MAP.md.
2. Search THIS file for that tag, for example `AB:LOGIN.BUTTON` (VS Code: Ctrl+F). Every connection that names it is listed below.
3. For each one, read "If you change" and "Then also". Those are the other places that must change together with yours, or be re-checked.
4. If your change touches a linked place, it is NOT a tiny change. Give it to the planner. The planner writes a packet that changes all linked places and this file together.

## What the checker proves, and what it does not
- Every "Anchor" line below names a piece of text that must still exist in a linked place. If one end of a connection is changed on its own, that text is gone and the checker fails. It pins names and values that are LINKED. It does not pin a value that is safe to tune alone (for example the glass darkness or an animation speed).
- By itself the checker also verifies: every `ab-` class used in a .tsx file is defined in a .css file and the other way round; every `--ab-` css variable that is used is defined and the other way round; every label points to a field that exists.
- It does NOT find new connections. Only the planner adds a connection, when writing a packet. It does NOT check how anything looks.
- Not repeated here because `npm run build` already catches it: a broken import, and a wrong prop name written directly on a component. One hole the build does NOT catch is row C13.
- Anchor lines only read .ts, .tsx and .css files under src. An anchor written as `file = text` (no tag) checks the whole file. It is used for a linked line that sits outside every tag.

## Connections on the LOGIN page

### C01: The card width is written in three places
- Tags: `AB:LOGIN.GLASS`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`
- If you change: the card width (now 440px) in any one of the three places
- Then also: change the same number in the other two. The places are the GLASS width setting in LoginCard.tsx, the right-hand column of the wide-screen grid in login.css (LAYOUT), and the phone width of the hero text block in login.css (HERO).
- If you forget: on a laptop the card and its column stop matching (the card hangs to the left or gets squeezed); on a phone the text and the card get different widths.
- Anchor: `AB:LOGIN.GLASS @ src/components/LoginCard.tsx = width: "min(100%, 440px)"`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = grid-template-columns: 1fr minmax(0, 440px);`
- Anchor: `AB:LOGIN.HERO @ src/login.css = width: min(100%, 440px);`

### C02: The width where the page switches to two columns is written twice
- Tags: `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`
- If you change: the 900px in either `@media (min-width: 900px)` block
- Then also: change the other block to the same number.
- If you forget: between the two numbers the page mixes layouts, for example the big wide-screen text on a one-column page, or the small phone text in two columns.
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = @media (min-width: 900px)`
- Anchor: `AB:LOGIN.HERO @ src/login.css = @media (min-width: 900px)`

### C03: The front page is built for white on black
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`
- If you change: the background colour (backgroundColor in BG), the page base colour (.ab-screen in LAYOUT), or the hero text colour (HERO)
- Then also: keep the background colour and the page base colour the same. Then look at the hero line: it is white and sits straight on the animation, helped only by its dark shadow.
- If you forget: with a light or colourful background the white line on the left becomes hard or impossible to read; a base colour that differs from the animation shows as a flash or a band before the animation loads.
- Anchor: `AB:LOGIN.BG @ src/App.tsx = backgroundColor="#000000"`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = background: #000;`
- Anchor: `AB:LOGIN.HERO @ src/login.css = color: #fff;`

### C04: The card text and the Sign in button are built for dark glass
- Tags: `AB:LOGIN.GLASS`, `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: how dark the glass is (--ab-glass-tint in GLASS), or the white text, white field borders or white button (FORM and BUTTON)
- Then also: making the glass darker is safe. Making it lighter or clearer means the white text, the fields and the white button must be redone for a light card. A new text colour needs a card dark enough for it.
- If you forget: text and button you cannot read.
- Anchor: `AB:LOGIN.GLASS @ src/login.css = --ab-glass-tint:`
- Anchor: `AB:LOGIN.BUTTON @ src/login.css = background: #fff;`
- Check by hand: the checker does NOT notice a glass made lighter, and does NOT notice a changed text colour in FORM (the same colour is written in several rules). After any such change, look at the card.

### C05: The card is dark for everyone only because of one class name and an override
- Tags: `AB:LOGIN.GLASS`
- If you change: the class name ab-glass, the !important lines, or the GlassSurface file (for example installing a newer version)
- Then also: LoginCard gives the glass the class ab-glass on a line that is outside every tag (the opening GlassSurface line). login.css overrides the component's own colours with !important. Keep both. After any change to the GlassSurface file, look at the card again, on a device set to light mode and one set to dark mode.
- If you forget: the card turns light or clear depending on the viewer's light or dark setting.
- Anchor: `AB:LOGIN.GLASS @ src/login.css = .ab-glass {`
- Anchor: `AB:LOGIN.GLASS @ src/login.css = background: var(--ab-glass-tint) !important;`
- Anchor: `src/components/LoginCard.tsx = className="ab-glass"`

### C06: The Sign in button works because of the form and handleSubmit
- Tags: `AB:LOGIN.BUTTON`, `AB:LOGIN.SUBMIT`
- If you change: the button type, the place of the button, the form line, or the name handleSubmit
- Then also: pressing Sign in (or Enter in a field) works because the button is type submit, it sits inside the form, and the form calls handleSubmit. The form line is outside every tag. When real login is added it goes into SUBMIT.
- If you forget: pressing the button does nothing, or the page reloads.
- Anchor: `AB:LOGIN.BUTTON @ src/components/LoginCard.tsx = type="submit"`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = const handleSubmit`
- Anchor: `src/components/LoginCard.tsx = onSubmit={handleSubmit}`

### C07: The form fields: labels, ids and names
- Tags: `AB:LOGIN.FORM`, `AB:LOGIN.SUBMIT`
- If you change: an id, a htmlFor or a name of a field
- Then also: each label's htmlFor must equal the id of its field (the checker also does this by itself). The names username and password are what real login will read later in SUBMIT, and what phone password managers use together with the autoComplete values.
- If you forget: tapping a label no longer selects its field; password managers may not fill; the real login will not find the typed values.
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = htmlFor="ab-userid"`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = htmlFor="ab-password"`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = name="username"`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = name="password"`

### C08: The button gets its place from the form layout
- Tags: `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: the form layout (.ab-content in FORM), the button margin (BUTTON), or move the button out of the form
- Then also: the form stacks everything in one column with a gap, and the button sits inside the form as the last item. The button's own top margin adds to that gap. Changing the gap only moves the button; it is safe.
- If you forget: the button jumps out of line, or its distance to the fields changes.
- Anchor: `src/components/LoginCard.tsx = <form className="ab-content"`
- Anchor: `AB:LOGIN.BUTTON @ src/components/LoginCard.tsx = <button className="ab-button"`
- Anchor: `AB:LOGIN.FORM @ src/login.css = flex-direction: column;`

### C09: The reduce-motion rule for the fields lives in the BUTTON block
- Tags: `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: the transitions of the fields (FORM), or the reduce-motion block (BUTTON)
- Then also: the `@media (prefers-reduced-motion: reduce)` block at the end of BUTTON also switches off the field transitions of FORM. Keep `.ab-input` in that block.
- If you forget: people who asked their phone for less motion still get the field animation.
- Anchor: `AB:LOGIN.BUTTON @ src/login.css = .ab-input,`
- Anchor: `AB:LOGIN.FORM @ src/login.css = .ab-input {`

### C10: The hero line is picked from the list in loginLines.ts
- Tags: `AB:LOGIN.HERO`, `AB:LOGIN.LINES`
- If you change: the name LOGIN_LINES, or how many lines the list holds
- Then also: HERO imports LOGIN_LINES (the import line is outside every tag) and picks one at random. If you rename the list, rename it in the import and in HERO. NEVER leave the list empty: there is then nothing to pick.
- If you forget: the build fails on a renamed list; an empty list leaves the left side blank or breaks the page.
- Anchor: `AB:LOGIN.LINES @ src/loginLines.ts = export const LOGIN_LINES`
- Anchor: `AB:LOGIN.HERO @ src/components/LoginHero.tsx = LOGIN_LINES[Math.floor(Math.random() * LOGIN_LINES.length)]`
- Anchor: `src/components/LoginHero.tsx = import { LOGIN_LINES } from "@/loginLines"`

### C11: The background gets its size and its place behind the card from the LAYOUT css
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`
- If you change: the .ab-bg rule, the z-index of .ab-center (both in LAYOUT), or the wrapper line in BG
- Then also: the BG block only holds the animation and its settings. The wrapper class ab-bg is styled in LAYOUT: it is fixed and fills the screen. The content sits above it because .ab-center has z-index 1.
- If you forget: the animation shrinks to nothing, scrolls with the page, or covers the card.
- Anchor: `AB:LOGIN.BG @ src/App.tsx = className="ab-bg"`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = position: fixed;`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = z-index: 1;`

### C12: The order of hero and card decides which side each one is on
- Tags: `AB:LOGIN.LAYOUT`
- If you change: the order of LoginHero and LoginCard in LAYOUT, or the column sizes of the grid
- Then also: the first item is the left column (it stretches) and also the top item on a phone; the second is the right column (fixed 440px). Swap the order and you must swap the column sizes too, and on phones the card would then be on top.
- If you forget: the card is squeezed into the wide column or the text into the narrow one.
- Check by hand: the checker sees that both are still there and that the column sizes are unchanged, but it cannot see their ORDER. After any change, look at the page.
- Anchor: `AB:LOGIN.LAYOUT @ src/App.tsx = <LoginHero />`
- Anchor: `AB:LOGIN.LAYOUT @ src/App.tsx = <LoginCard />`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = grid-template-columns: 1fr minmax(0, 440px);`

### C13: The GLASS settings are the settings of a library file and a typo is not caught
- Tags: `AB:LOGIN.GLASS`
- If you change: a name inside the GLASS object, or the GlassSurface file
- Then also: the GLASS object is passed to the component as a whole. A name the component does not know is ignored without any error, and the build does not report it (tested). The names the component accepted when it was installed are in the handoff, section 17. After a change, look at the card to see that the setting did something.
- If you forget: a setting silently does nothing.
- Check by hand: change the setting, look at the card, and compare with the names in the handoff, section 17.

## Things to know (no check is possible)
- The glass card redraws what is behind it while the background animates. Phone speed and battery with both together have NOT been tested. If a phone feels slow, the background speed (BG) and the glass settings (GLASS) are the first two things to look at.
- The hero line is a different length each time. Very long lines wrap onto more rows; the font size in HERO is set for short lines.
```

## STEP 3: Replace the ENTIRE contents of `CODE_MAP.md` with exactly this
```markdown
# ASHBORN CODE MAP
Kept up to date by the planner: every packet that touches code also updates this file. Checked by `node scripts/check-tags.mjs`. What is tied to what is in CONNECTIONS.md.

## How to use
1. Find the thing you want to change in the tables below (plain words).
2. Search the whole project for its tag followed by :START, for example `AB:LOGIN.BG:START` (VS Code: Ctrl+Shift+F).
3. Before you change it, search CONNECTIONS.md for the same tag and read every connection that names it. Those are the other places your change can break.
4. Change only the lines between that START and its END.
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
Setup and config files (package.json, vite and tsconfig files, index.html), `src/index.css`, `src/main.tsx`, AGENTS.md, PROGRESS.md, CODE_MAP.md, CONNECTIONS.md, TAGGING_RULES.md, the packets folder, the scripts folder.
```

## STEP 4: Replace the ENTIRE contents of `TAGGING_RULES.md` with exactly this
(The fence below has FOUR backticks because the file itself contains three-backtick blocks. Copy only what is INSIDE the four-backtick lines, including the inner three-backtick lines.)
````markdown
# ASHBORN TAGGING RULES

Purpose: any part of the app can be found and changed without reading or scanning the code. Every part of the code carries a TAG. CODE_MAP.md lists every tag in plain words. A tag is found by searching for it. CONNECTIONS.md lists which parts are tied to which other parts, so a change does not break a part nobody was looking at. The command `node scripts/check-tags.mjs` checks that the code, the map and the connections agree.

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

## Names we use in code
Our own CSS class names start with `ab-` (example `ab-button`), our own CSS variables with `--ab-` (example `--ab-glass-tint`), and the ids of our own elements with `ab-` (example `ab-userid`). The checker only watches names that start this way. Utility classes of a library or of Tailwind are not watched.

## How to find a part
1. Open CODE_MAP.md and find the part in plain words.
2. Search the whole project for the tag followed by `:START`, for example `AB:LOGIN.BG:START`.
3. Change only the lines between START and END.

## Rules for every packet (the planner follows these when writing packets)
1. The planner decides every tag name. The agent copies tags from the packet. The agent never invents, renames or deletes a tag.
2. A packet that creates or edits code contains: the tag comment lines inside the file contents; the exact edit of CODE_MAP.md (new row, changed row or removed row); the exact edit of CONNECTIONS.md when the change touches a connection (see "Connections" below); a step that runs `node scripts/check-tags.mjs`; and the done-check "it prints TAGS OK and CONNECTIONS OK".
3. NEW THING on an existing page: pick a part name, add the tag lines around its code in each file, add one row to that page's table in CODE_MAP.md.
4. NEW PAGE: add one row to "Page codes" in CODE_MAP.md, add a table for the page, tag every part as in rule 3. Update the page list in the handoff.
5. CHANGING an existing thing: the packet names the tag and the file and says "search for the tag followed by :START, change only between START and END". If the change moves, splits, renames or removes code, the markers and the map are fixed in the same packet.
6. LIBRARY components (installed React Bits source, shadcn files) are never edited. To change how one looks or moves, change its props where it is used. If a packet must edit a library file, the packet says so and the file gets a row in the map section "Library components".
7. Files that cannot hold comments (images, JSON, lock files) are not tagged. They are named in the map section "Untagged files".
8. The map, the connections and the code change in the same packet. A packet is not done until `node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK.
9. Before the planner writes a packet that changes code, it reads every connection in CONNECTIONS.md that names the tags involved. The packet changes ALL linked places together, in the same packet, and says so.
10. A NEW connection is added the moment two places become dependent on each other (a value written twice, a class name shared by a .tsx and a .css file, a line outside a tag that a tagged block relies on, a setting of one part that another part is built around).

## Connections
CONNECTIONS.md is one file. It has one entry per connection: a heading `### C01: <title>` and then these lines, in this order:
```
### C01: <what is tied together, in plain words>
- Tags: `AB:PAGE.PART`, `AB:PAGE.PART`
- If you change: <what someone might change>
- Then also: <the other places that must change together or be re-checked>
- If you forget: <what breaks, in plain words>
- Anchor: `AB:PAGE.PART @ src/file.tsx = exact text that must stay in that tag block`
- Anchor: `src/file.tsx = exact text that must stay somewhere in that file`
```
- The Tags line names every tag that the entry involves. Every tag named must exist in the code.
- An Anchor is a piece of text copied exactly from the code. The first form must be found between the START and END lines of that tag in that file. The second form (no tag) is only for a linked line that sits outside every tag, and is found anywhere in that file.
- An entry that cannot be checked by text uses `- Check by hand: <what to look at>` instead of Anchor lines.
- Pin names and values that are LINKED (a number written in two places, a class name, a function name). Do not pin a value that is safe to change alone (a speed, a blur, a darkness): pinning it would make every harmless tweak fail.
- An anchor is copied from the code character for character. It never contains the character | or a backtick.
- A connection can only be discovered by the planner. The checker only guards the connections already written down.

## Tiny changes straight to the agent (a value change only)
For changing one value, paste this into the agent chat with the blanks filled in:
```
Open CODE_MAP.md and find the tag for <THING>. Search the project for that tag followed by :START. Change <WHAT> to <VALUE>. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. It must print TAGS OK and CONNECTIONS OK. Decide nothing else. If anything fails, stop and tell me.
```
Example: Open CODE_MAP.md and find the tag for the front page background animation. Search the project for that tag followed by :START. Change speed to 1.2. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. It must print TAGS OK and CONNECTIONS OK. Decide nothing else. If anything fails, stop and tell me.

Before you paste it: search CONNECTIONS.md (Ctrl+F) for the same tag. If an "If you change" line there matches what you want to change, it is NOT a tiny change: it goes to the planner chat. If you paste it anyway, the checker will print CONNECTIONS FAILED and the agent will stop.

Anything bigger than a value change (swap an animation, new feature, new page) goes to the planner chat, which writes a packet.

## The checker
`node scripts/check-tags.mjs` (run from the project root) reads src, CODE_MAP.md and CONNECTIONS.md. It reports:
- a tag line that is malformed
- a tag with no START or no END, or more than one of either, in a file
- a tag in the code that is not in the map, or in the map but not in the code (also checks the file names)
- a tag listed twice in the map
- a connection that has no Tags, If you change, Then also or If you forget line, or that has neither an Anchor nor a Check by hand line
- a connection that names a tag that is not in the code, or an Anchor whose text is not found where it should be (a linked place was changed on its own)
- an `ab-` class used in a .tsx file but defined in no .css file, or defined in css but used in no .tsx file
- a `--ab-` css variable used but not defined, or defined but not used
- a label (htmlFor) that points to an id that does not exist in its file, or an id used twice in a file
It prints two lines when everything agrees: `TAGS OK` with its counts, and `CONNECTIONS OK` with its counts. Otherwise it prints the problems and stops with an error. If it fails, STOP and report the full output. Do not fix it yourself.
````

## STEP 5: Add one rule to the END of `AGENTS.md`
Open `AGENTS.md`. Add this line at the very end of the file, on its own new line, after the last existing rule. Change nothing else in the file.
```
11. Before you change tagged code, open CONNECTIONS.md and search it for that tag. Change a linked place only if the packet names it. After any change to code, run `node scripts/check-tags.mjs`: it must print TAGS OK and CONNECTIONS OK. If it prints CONNECTIONS FAILED, stop and report the full output. Do not fix it.
```

## STEP 6: Check the build
Run:
```
npm run build
```
It must finish with no errors. (No app file was changed, so this only proves nothing was broken.)

## STEP 7: Run the checker
Run:
```
node scripts/check-tags.mjs
```
It must print exactly these two lines and nothing else:
```
TAGS OK: 8 tags, 13 places
CONNECTIONS OK: 13 connections, 35 anchors, 13 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output. (If it prints CONNECTIONS FAILED, a linked place in the real project differs from what this packet expects. Do not fix it. Report the output.)

## STEP 8: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly these two changes. Change nothing else in the file.
1. At the end of the list under the heading `## Locked decisions`, add this line:
```
- Connections: CONNECTIONS.md lists which parts of the code are tied to which other parts; every packet that changes code also updates it; node scripts/check-tags.mjs checks it (from Packet 02J)
```
2. At the end of the list under the heading `## Done`, add this line:
```
- Packet 02J: CONNECTIONS.md, checker extended to connections, agent rule 11
```
If either heading is not found: **STOP** and report.

## STEP 9: Git
Run:
```
git add .
git commit -m "Packet 02J: connections map"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `node scripts/check-tags.mjs` prints exactly the two lines of Step 7.
3. `AGENTS.md` contains the text `CONNECTIONS.md`.
4. `CONNECTIONS.md` exists in the project root and its first line is `# ASHBORN CONNECTIONS`.
5. The first line of `git log --oneline` ends with `Packet 02J: connections map`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 5 done-checks
- the exact output of `git log --oneline`
- the exact output of `node scripts/check-tags.mjs`
- the outputs you were asked to report in Step 0
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
