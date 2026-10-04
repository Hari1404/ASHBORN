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
