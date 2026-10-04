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
