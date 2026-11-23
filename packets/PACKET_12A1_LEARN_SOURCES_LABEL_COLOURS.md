# PACKET 12A1: THE FIRST DATA AND RULES OF LEARN (the sources of "Learning from", the label of a learn session, the subject colours; four new code files, three test files, three doc edits; no screen, no SQL, no new package)

Paste this one line into the agent: `Execute packets/PACKET_12A1_LEARN_SOURCES_LABEL_COLOURS.md exactly as written. Do not decide anything.`

Kind: build, no SQL, no screen, no change in Supabase. Written by the planner on 2026-11-23 from `DECISIONS_LEARN.md` draft 5 (section 19a, 19b, 19c, 19g, 19i). **Already tried by the planner** on a clone of `master` at `b96f57f` (Packet T1): `npx tsc -b` clean, `npx vitest run` 2081 tests passed in 38 files, `node scripts/check-tags.mjs` printed the two lines of Step 9, `npm run build` finished. Eleven rules were broken on purpose and the tests caught every one. NOT done: any look in a browser (there is no screen), and the lint.

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Create or edit ONLY these files: the seven new files named in Steps 2 and 3 (`src/data/learn/sources.ts`, `src/data/learn/subjectColours.ts`, `src/data/learn/subjectColours.test.ts`, `src/lib/learnSources.ts`, `src/lib/learnSources.test.ts`, `src/lib/learnLabel.ts`, `src/lib/learnLabel.test.ts`) and `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Nothing else. No package is installed, so `package.json` and `package-lock.json` must NOT change.
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- Tracked files with changes that are NOT part of this packet: if `git status --short` in Step 0 shows ANY changed tracked file, that is a **STOP** (see Step 0). Untracked files (`??`) are not part of this packet: leave them alone.
- Do not run `npm install`, `npm audit fix`, `npm update`, `npm uninstall`. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 10 is allowed.
- Every "replace" or "add" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Copy the file contents EXACTLY as written, including comments. Do not rewrite, improve, reformat or rename anything.
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
This is the first code of Learn. It has no screen. It adds four things that later packets build on:
1. **The catalogue of "Learning from" sources** (`src/data/learn/sources.ts`): own practice, Coursera (IBM Python with its five modules and the lesson blocks of modules 1 and 3, the three Math courses with their card hours), NPTEL (an empty slot), Pro Git, other. Each source has a frozen path (the text the database will store), a title, the words for the tap line and an end cap. The titles of modules and lesson blocks are DRAFT (from the pack's cleaned notes).
2. **The functions that read it** (`src/lib/learnSources.ts`): the shape of a path, find a source, its words, its end cap, retired, the lists of the picker, and the validation of the catalogue.
3. **The label of a learn session** (`src/lib/learnLabel.ts`): what he is working on (`item:PY-13`, `gate:python/D`), where he learns from (a source path), the review flag; their shapes; one label per session; the lines of the tap line drawn in preview P1.
4. **The subject colours in three families** (`src/data/learn/subjectColours.ts`), with tests that keep them off the colours of the day screen and visible on black.

Nothing in the app imports these files yet, so nothing changes on any screen. The shapes are written again in the database later, in Packet 12C (see C66).

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `src/lib/overviewCondition.ts`, `src/lib/screens.ts`, `node_modules`. If any is missing: **STOP** and report which.

Check that these do NOT exist: `src/data` (the whole folder), `src/lib/learnSources.ts`, `src/lib/learnSources.test.ts`, `src/lib/learnLabel.ts`, `src/lib/learnLabel.test.ts`. If any exists: **STOP** and report which.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 51 tags, 103 places
CONNECTIONS OK: 65 connections, 639 anchors, 140 classes, 9 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output. (A different number means the code is not at the state this packet was written for.)

Run `git status --short`. Lines that start with `??` are fine. If ANY line shows a changed tracked file (a line that does not start with `??`): **STOP** and report the COMPLETE output.

Then run these read-only commands. Do NOT stop on their results and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -3`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. `git branch --show-current`

Run `npm test`. It must finish with a line `Test Files  35 passed (35)` and a line `Tests  2028 passed (2028)`. If the numbers differ or a test fails: **STOP** and report the last 8 lines. Do not edit any file.

## STEP 2: Create the two data files and the two files of functions
Create each file below with exactly the content in its block. Create the folder `src/data/learn` first (it does not exist). The first line of each file is a comment and the last line is a comment. Every character in these files is plain ASCII (the middle dot of the label line is written as the escape \u00b7 on purpose): if a file you write contains any other character, **STOP** and report it.

### 2a. `src/data/learn/sources.ts`
```ts
// AB:LEARN.SOURCES-DATA:START
// The catalogue of "Learning from" sources of a learn session (DECISIONS_LEARN.md 19a, Q29, B4, B5).
// Data only: the functions that read it are in src/lib/learnSources.ts.
//
// A source is stored in the database as its PATH, a text such as "coursera/ibm-python/m1/1.3".
// The database checks only the SHAPE of the path (CONNECTIONS.md C66); it does not know this list.
// So a new source is a change in THIS file, never a change in SQL.
//
// RULES (B5, frozen ids):
//   - A path is ours, never a number of Coursera or of another site.
//   - A path that has been used is never reused for something else.
//   - A source that goes away is marked retired: true, never deleted, so an old session still draws.
//
// The module and lesson block titles are DRAFT: they come from the pack's cleaned Coursera notes
// (OCR based, coursera/python_lesson_blocks.md), not from the course pages. The hours of the Math
// courses are the hours on the course cards (the headline says 60 h in all). The IBM Python page
// has no hours; its headline of 15 to 30 hours stands in as a placeholder (Q19).
//
// Safe to tune alone: titles, say lines, grey and blue of the caps. NOT safe to change: any path.

export type SourceKind = "own" | "coursera" | "nptel" | "progit" | "other"

// The end cap of a pill (DECISIONS_LEARN.md 19b): a letter (or none) on a colour.
export type SourceCap = { letter: string | null; color: string }

export type SourceNode = {
  path: string // the stored text, frozen
  title: string // the word in the picker lists
  say: string // the words in the tap line, after "via " (own practice has no "via")
  kind: SourceKind
  retired?: boolean
  hours?: number // card hours of a course
  headlineHours?: readonly [number, number] // a headline that stands in where a page has no hours (PLACEHOLDER)
  cap?: SourceCap // the end cap; a child without its own cap takes the one of its nearest parent
  children?: readonly SourceNode[]
}

const IBM_CAP: SourceCap = { letter: "P", color: "#2563eb" }
const MATH_CAP: SourceCap = { letter: "M", color: "#5aa2ff" }
const GREY = "#6b7280"

// One IBM module with its lesson blocks (the blocks are written only where the notes have them).
function ibmModule(n: number, title: string, blocks: readonly string[] = []): SourceNode {
  const path = `coursera/ibm-python/m${n}`
  return {
    path,
    title,
    say: `Coursera IBM Python, module ${n}`,
    kind: "coursera",
    children: blocks.map((blockTitle, i) => ({
      path: `${path}/${n}.${i + 1}`,
      title: blockTitle,
      say: `Coursera IBM Python ${n}.${i + 1}`,
      kind: "coursera" as const,
    })),
  }
}

function mathCourse(n: number, title: string, hours: number): SourceNode {
  return { path: `coursera/math-ml/c${n}`, title, say: `Coursera Math, course ${n}`, kind: "coursera", hours }
}

export const LEARN_SOURCES: readonly SourceNode[] = [
  { path: "own", title: "Own practice", say: "own practice", kind: "own" },
  {
    path: "coursera",
    title: "Coursera",
    say: "Coursera",
    kind: "coursera",
    children: [
      {
        path: "coursera/ibm-python",
        title: "IBM Python for Data Science, AI and Development",
        say: "Coursera IBM Python",
        kind: "coursera",
        headlineHours: [15, 30],
        cap: IBM_CAP,
        children: [
          ibmModule(1, "Python Basics", ["Intro and first program", "Types", "Expressions and variables", "String operations"]),
          ibmModule(2, "Data Structures"),
          ibmModule(3, "Fundamentals", ["Conditions", "Loops", "Functions", "Exceptions", "Objects and classes", "Text analysis"]),
          ibmModule(4, "Working with Data"),
          ibmModule(5, "APIs and Data Collection"),
        ],
      },
      {
        path: "coursera/math-ml",
        title: "Mathematics for Machine Learning and Data Science",
        say: "Coursera Math",
        kind: "coursera",
        cap: MATH_CAP,
        children: [mathCourse(1, "Linear algebra", 34), mathCourse(2, "Calculus", 27), mathCourse(3, "Probability and statistics", 33)],
      },
    ],
  },
  // An empty slot until Tier 2 gives it content. The NPTEL TIMER TAG is a different thing and is not touched (F31).
  { path: "nptel", title: "NPTEL", say: "NPTEL", kind: "nptel", cap: { letter: null, color: GREY }, children: [] },
  { path: "progit", title: "Pro Git", say: "Pro Git", kind: "progit", cap: { letter: "G", color: GREY } },
  {
    path: "other",
    title: "Other",
    say: "another source",
    kind: "other",
    cap: { letter: null, color: GREY },
    children: [
      { path: "other/video", title: "A video", say: "a video", kind: "other" },
      { path: "other/book", title: "A book", say: "a book", kind: "other" },
      { path: "other/docs", title: "Docs", say: "the docs", kind: "other" },
    ],
  },
]
// AB:LEARN.SOURCES-DATA:END
```

### 2b. `src/data/learn/subjectColours.ts`
```ts
// AB:LEARN.COLOURS:START
// The colour of each Learn subject (DECISIONS_LEARN.md 19c, Q7).
// From the preview page ashborn_subject_colours_families.html. Related subjects share one hue and step
// from light to dark. The day screen uses blue, rose, amber and teal, so these families keep other hues.
//
// Every hex is a PLACEHOLDER, judged by eye in all four looks of the day screen. Safe to tune alone.
// What is NOT free (the tests guard it): a subject colour must never equal a colour of the day palette
// (OVERVIEW_DAY_PALETTE), every colour must stay visible on black, and the colours must stay different.
//
// The subject ids are the keys of the Tier 1 data: la is linear algebra, prob is probability.
// Coursera is NOT a subject colour: it is the end cap of a pill (src/data/learn/sources.ts).
// Machine learning and Research are not coloured yet: pink and coral hues are still free for them.

export type SubjectId = "python" | "numpy" | "pandas" | "terminal" | "git" | "la" | "prob"

export const SUBJECT_IDS: readonly SubjectId[] = ["python", "numpy", "pandas", "terminal", "git", "la", "prob"]

export const SUBJECT_COLOURS: Record<SubjectId, string> = {
  python: "#dfbefd",
  numpy: "#bf81f2",
  pandas: "#964fcb",
  terminal: "#e1df5d",
  git: "#b5b11b",
  la: "#8ce6a0",
  prob: "#128f43",
}

// The families, each from light to dark, in the order he learns them. The order inside a family is the
// planner's pick (Terminal before Git, linear algebra before probability): Hari can swap it.
export const SUBJECT_FAMILIES: readonly { id: string; subjects: readonly SubjectId[] }[] = [
  { id: "data", subjects: ["python", "numpy", "pandas"] },
  { id: "tools", subjects: ["terminal", "git"] },
  { id: "maths", subjects: ["la", "prob"] },
]
// AB:LEARN.COLOURS:END
```

### 2c. `src/lib/learnSources.ts`
```ts
// AB:LEARN.SOURCES:START
// Reads the catalogue of "Learning from" sources (src/data/learn/sources.ts).
// Pure functions: no screen, no database call. The tests are in src/lib/learnSources.test.ts.
// The SHAPE of a source path is also checked by the database (Packet 12C): see CONNECTIONS.md C66.
import { LEARN_SOURCES, type SourceCap, type SourceNode } from "../data/learn/sources"

// The shape of a stored source path: parts made of small letters, digits, dots and hyphens, joined by
// one slash, no empty part, at most 80 characters. The shape says nothing about whether the source exists.
export const SOURCE_PATH_SHAPE = /^[a-z0-9][a-z0-9.-]*(\/[a-z0-9][a-z0-9.-]*)*$/
export const SOURCE_PATH_MAX_LENGTH = 80

export function isSourcePath(text: unknown): text is string {
  return typeof text === "string" && text.length <= SOURCE_PATH_MAX_LENGTH && SOURCE_PATH_SHAPE.test(text)
}

// The nodes from the top of the catalogue down to the node of the path, or null when the path is not in it.
// A retired source is still found: an old session must still draw (B5).
export function sourceChain(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceNode[] | null {
  if (!isSourcePath(path)) return null
  const parts = path.split("/")
  const chain: SourceNode[] = []
  let level: readonly SourceNode[] = catalogue
  for (let depth = 1; depth <= parts.length; depth++) {
    const wanted = parts.slice(0, depth).join("/")
    const node = level.find((n) => n.path === wanted)
    if (!node) return null
    chain.push(node)
    level = node.children ?? []
  }
  return chain
}

export function findSource(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceNode | null {
  const chain = sourceChain(path, catalogue)
  return chain ? (chain[chain.length - 1] ?? null) : null
}

// The words of the tap line for a source, for example "Coursera IBM Python 1.3". Null when unknown.
export function sourceSay(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): string | null {
  return findSource(path, catalogue)?.say ?? null
}

// The end cap of a pill: the cap of the node, or of its nearest parent that has one. Own practice has none.
export function sourceCapOf(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceCap | null {
  const chain = sourceChain(path, catalogue)
  if (!chain) return null
  for (let i = chain.length - 1; i >= 0; i--) {
    const cap = chain[i]?.cap
    if (cap) return cap
  }
  return null
}

// True when the source or one of its parents is retired. It still draws, but the picker no longer offers it.
export function sourceIsRetired(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): boolean {
  const chain = sourceChain(path, catalogue)
  return chain ? chain.some((n) => n.retired === true) : false
}

// What the picker lists under a source (null = the top level): the children that are not retired.
export function sourceChoices(path: string | null, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceNode[] {
  const level = path === null ? catalogue : (findSource(path, catalogue)?.children ?? [])
  return level.filter((n) => n.retired !== true)
}

// Every path of the catalogue, parents before children.
export function sourcePathsOf(catalogue: readonly SourceNode[] = LEARN_SOURCES): string[] {
  const out: string[] = []
  const walk = (nodes: readonly SourceNode[]) => {
    for (const n of nodes) {
      out.push(n.path)
      walk(n.children ?? [])
    }
  }
  walk(catalogue)
  return out
}

// The validation of the catalogue (the first part of the validation script of DECISIONS_LEARN.md 12a).
// Returns the list of problems; an empty list means the catalogue is sound.
export function validateCatalogue(catalogue: readonly SourceNode[] = LEARN_SOURCES): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  const hex = /^#[0-9a-f]{6}$/
  const walk = (nodes: readonly SourceNode[], parent: SourceNode | null) => {
    for (const n of nodes) {
      if (!isSourcePath(n.path)) problems.push(`bad path shape: ${n.path}`)
      if (seen.has(n.path)) problems.push(`duplicate path: ${n.path}`)
      seen.add(n.path)
      if (parent === null) {
        if (n.path.includes("/")) problems.push(`top level path has a slash: ${n.path}`)
      } else if (!n.path.startsWith(`${parent.path}/`) || n.path.slice(parent.path.length + 1).includes("/")) {
        problems.push(`${n.path} is not directly under ${parent.path}`)
      }
      if (n.title.trim() === "") problems.push(`empty title: ${n.path}`)
      if (n.say.trim() === "") problems.push(`empty say line: ${n.path}`)
      if (n.cap && !hex.test(n.cap.color)) problems.push(`bad cap colour: ${n.path}`)
      if (n.cap && n.cap.letter !== null && n.cap.letter.length !== 1) problems.push(`cap letter is not one character: ${n.path}`)
      if (n.hours !== undefined && !(Number.isFinite(n.hours) && n.hours > 0)) problems.push(`bad hours: ${n.path}`)
      if (n.headlineHours !== undefined) {
        const [low, high] = n.headlineHours
        if (!(low > 0 && high >= low)) problems.push(`bad headline hours: ${n.path}`)
      }
      walk(n.children ?? [], n)
    }
  }
  walk(catalogue, null)
  return problems
}
// AB:LEARN.SOURCES:END
```

### 2d. `src/lib/learnLabel.ts`
```ts
// AB:LEARN.LABEL:START
// The label a learn session carries (DECISIONS_LEARN.md 19a and 19g): two answers and a flag.
//   what   = "Working on":     "item:PY-13", "gate:python/D", or null
//   via    = "Learning from":  a source path such as "own" or "coursera/ibm-python/m1/1.3", or null
//   review = working again on a finished item (the pill gets a hollow notch, B2)
// Pure functions: no screen, no database call. The tests are in src/lib/learnLabel.test.ts.
// The SHAPES below are also checked by the database (Packet 12C): see CONNECTIONS.md C66.
// Whether the item or the gate EXISTS is not checked here: the app checks it against the content.
import { findSource, isSourcePath } from "./learnSources"

export type LearnWhat = { kind: "item"; id: string } | { kind: "gate"; subject: string; region: string }

export type LearnLabel = { what: string | null; via: string | null; review: boolean }

// An item id: two capital letters, a hyphen, one to three digits (PY-13, NP-4, PD-25).
export const ITEM_ID_SHAPE = /^[A-Z]{2}-[0-9]{1,3}$/
// A gate: the subject id, a slash and the region id (python/D, numpy/NP-A, terminal/TA).
export const GATE_SHAPE = /^[a-z]{2,12}\/[A-Z0-9-]{1,6}$/

export function parseWhat(text: unknown): LearnWhat | null {
  if (typeof text !== "string") return null
  if (text.startsWith("item:")) {
    const id = text.slice(5)
    return ITEM_ID_SHAPE.test(id) ? { kind: "item", id } : null
  }
  if (text.startsWith("gate:")) {
    const rest = text.slice(5)
    if (!GATE_SHAPE.test(rest)) return null
    const [subject, region] = rest.split("/") as [string, string]
    return { kind: "gate", subject, region }
  }
  return null
}

export function whatText(what: LearnWhat): string {
  return what.kind === "item" ? `item:${what.id}` : `gate:${what.subject}/${what.region}`
}

export function isEmptyLearnLabel(label: LearnLabel): boolean {
  return label.what === null && label.via === null && !label.review
}

// The shape problems of a label. An empty list means the shapes are right.
export function learnLabelProblems(label: LearnLabel): string[] {
  const problems: string[] = []
  if (label.what !== null && parseWhat(label.what) === null) problems.push(`bad what: ${label.what}`)
  if (label.via !== null && !isSourcePath(label.via)) problems.push(`bad source: ${label.via}`)
  return problems
}

// One session has ONE label (Q5): no tag, a timer tag, or a learn label. A timer tag together with learn
// fields is "invalid"; the database refuses it too.
export type SessionLabelKind = "none" | "timer" | "learn" | "invalid"
export function sessionLabelKind(tagId: string | null, label: LearnLabel): SessionLabelKind {
  const hasLearn = !isEmptyLearnLabel(label)
  if (tagId !== null && hasLearn) return "invalid"
  if (hasLearn) return learnLabelProblems(label).length === 0 ? "learn" : "invalid"
  return tagId !== null ? "timer" : "none"
}

// The words for a source in the tap line: "own practice", or "via Coursera IBM Python 1.3".
export function learnSourceLine(via: string): string {
  const node = findSource(via)
  if (!node) return `via ${via}`
  return node.kind === "own" ? node.say : `via ${node.say}`
}

// The label as one line for the tap line and the dial: the parts are joined by a middle dot, for example
// PY-2, a dot, then "via Coursera IBM Python 1.3". A source with no item starts with "No item". A review
// starts with "Review of NP-3".
// The title of the item, the quality and the minutes are added by the screen. Null when the label is empty.
// A middle dot with a space on each side. It is written as an escape so that the file stays plain ASCII.
export const PART_SEPARATOR = " \u00b7 "

export function learnLabelLine(label: LearnLabel): string | null {
  if (isEmptyLearnLabel(label)) return null
  const parts: string[] = []
  if (label.what === null) {
    parts.push("No item")
  } else {
    const what = parseWhat(label.what)
    const head = what === null ? label.what : what.kind === "item" ? what.id : `Gate ${what.subject}/${what.region}`
    parts.push(label.review ? `Review of ${head}` : head)
  }
  if (label.via !== null) parts.push(learnSourceLine(label.via))
  return parts.join(PART_SEPARATOR)
}
// AB:LEARN.LABEL:END
```

## STEP 3: Create the three test files
Create each file below with exactly the content in its block.

### 3a. `src/lib/learnSources.test.ts`
```ts
import { describe, expect, it } from "vitest"
import { LEARN_SOURCES, type SourceNode } from "../data/learn/sources"
import {
  SOURCE_PATH_MAX_LENGTH,
  findSource,
  isSourcePath,
  sourceCapOf,
  sourceChoices,
  sourceIsRetired,
  sourcePathsOf,
  sourceSay,
  validateCatalogue,
} from "./learnSources"

// These tests guard the FROZEN ids (B5), the shape of a path (CONNECTIONS.md C66) and the soundness of
// the catalogue. Titles, say lines and cap colours are safe to tune and are checked only where a
// decision of DECISIONS_LEARN.md 19a or 19b says what they must be.

// Every path that has been shipped. A path may be added, never removed or changed. Retire it instead.
const FROZEN_PATHS = [
  "own",
  "coursera",
  "coursera/ibm-python",
  "coursera/ibm-python/m1",
  "coursera/ibm-python/m1/1.1",
  "coursera/ibm-python/m1/1.2",
  "coursera/ibm-python/m1/1.3",
  "coursera/ibm-python/m1/1.4",
  "coursera/ibm-python/m2",
  "coursera/ibm-python/m3",
  "coursera/ibm-python/m3/3.1",
  "coursera/ibm-python/m3/3.2",
  "coursera/ibm-python/m3/3.3",
  "coursera/ibm-python/m3/3.4",
  "coursera/ibm-python/m3/3.5",
  "coursera/ibm-python/m3/3.6",
  "coursera/ibm-python/m4",
  "coursera/ibm-python/m5",
  "coursera/math-ml",
  "coursera/math-ml/c1",
  "coursera/math-ml/c2",
  "coursera/math-ml/c3",
  "nptel",
  "progit",
  "other",
  "other/video",
  "other/book",
  "other/docs",
]

const node = (over: Partial<SourceNode> & { path: string }): SourceNode => ({
  title: "T",
  say: "s",
  kind: "other",
  ...over,
})

describe("the catalogue", () => {
  it("is sound", () => {
    expect(validateCatalogue()).toEqual([])
  })

  it("still holds every frozen path", () => {
    const all = new Set(sourcePathsOf())
    for (const p of FROZEN_PATHS) expect(all.has(p), p).toBe(true)
  })

  it("has the IBM Python modules and lesson blocks of the notes", () => {
    expect(sourceChoices("coursera/ibm-python").map((n) => n.path)).toEqual([
      "coursera/ibm-python/m1",
      "coursera/ibm-python/m2",
      "coursera/ibm-python/m3",
      "coursera/ibm-python/m4",
      "coursera/ibm-python/m5",
    ])
    expect(sourceChoices("coursera/ibm-python/m1")).toHaveLength(4)
    expect(sourceChoices("coursera/ibm-python/m3")).toHaveLength(6)
    expect(sourceChoices("coursera/ibm-python/m2")).toEqual([])
  })

  it("has the three Math courses with the hours of the cards", () => {
    const hours = sourceChoices("coursera/math-ml").map((n) => n.hours)
    expect(hours).toEqual([34, 27, 33])
  })

  it("keeps NPTEL as an empty slot", () => {
    expect(findSource("nptel")?.children).toEqual([])
    expect(sourceChoices("nptel")).toEqual([])
  })

  it("lists the top level in the order of the picker", () => {
    expect(sourceChoices(null).map((n) => n.path)).toEqual(["own", "coursera", "nptel", "progit", "other"])
  })

  it("lists nothing under an unknown path", () => {
    expect(sourceChoices("coursera/nothing")).toEqual([])
  })
})

describe("the words of a source", () => {
  it("says the lines of the tap line", () => {
    expect(sourceSay("own")).toBe("own practice")
    expect(sourceSay("coursera/ibm-python/m1/1.3")).toBe("Coursera IBM Python 1.3")
    expect(sourceSay("coursera/ibm-python/m4")).toBe("Coursera IBM Python, module 4")
    expect(sourceSay("coursera/math-ml/c1")).toBe("Coursera Math, course 1")
    expect(sourceSay("progit")).toBe("Pro Git")
  })

  it("knows the title of a lesson block", () => {
    expect(findSource("coursera/ibm-python/m1/1.3")?.title).toBe("Expressions and variables")
    expect(findSource("coursera/ibm-python/m3/3.2")?.title).toBe("Loops")
  })

  it("returns null for a path that is not in the catalogue", () => {
    expect(sourceSay("coursera/nothing")).toBeNull()
    expect(findSource("Not A Path")).toBeNull()
    expect(findSource("")).toBeNull()
  })
})

describe("the end cap", () => {
  it("is a blue P for IBM Python, at every depth", () => {
    for (const p of ["coursera/ibm-python", "coursera/ibm-python/m4", "coursera/ibm-python/m1/1.3"]) {
      expect(sourceCapOf(p), p).toEqual({ letter: "P", color: "#2563eb" })
    }
  })

  it("is a blue M for the Math courses", () => {
    expect(sourceCapOf("coursera/math-ml/c2")).toEqual({ letter: "M", color: "#5aa2ff" })
  })

  it("is grey for the other sources", () => {
    expect(sourceCapOf("progit")).toEqual({ letter: "G", color: "#6b7280" })
    expect(sourceCapOf("nptel")).toEqual({ letter: null, color: "#6b7280" })
    expect(sourceCapOf("other/book")).toEqual({ letter: null, color: "#6b7280" })
  })

  it("does not exist for own practice, and not for an unknown path", () => {
    expect(sourceCapOf("own")).toBeNull()
    expect(sourceCapOf("coursera/nothing")).toBeNull()
  })

  it("is not given to Coursera as a whole (it is a source, not a colour)", () => {
    expect(sourceCapOf("coursera")).toBeNull()
  })
})

describe("the shape of a path", () => {
  it("accepts the paths of the catalogue", () => {
    for (const p of sourcePathsOf()) expect(isSourcePath(p), p).toBe(true)
  })

  it("rejects what is not a path", () => {
    const bad = ["", "Own", "own/", "/own", "own//x", "own practice", "own\"", "own'", "own\\x", "-own", ".x", "a/ b"]
    for (const p of bad) expect(isSourcePath(p), JSON.stringify(p)).toBe(false)
    expect(isSourcePath(null)).toBe(false)
    expect(isSourcePath(42)).toBe(false)
    expect(isSourcePath(undefined)).toBe(false)
  })

  it("allows 80 characters and not 81", () => {
    expect(SOURCE_PATH_MAX_LENGTH).toBe(80)
    expect(isSourcePath("a".repeat(80))).toBe(true)
    expect(isSourcePath("a".repeat(81))).toBe(false)
  })
})

describe("a retired source", () => {
  const catalogue: readonly SourceNode[] = [
    node({ path: "old", retired: true, children: [node({ path: "old/x" })] }),
    node({ path: "new", children: [node({ path: "new/a" }), node({ path: "new/b", retired: true })] }),
  ]

  it("is still found, so an old session still draws", () => {
    expect(findSource("old/x", catalogue)?.path).toBe("old/x")
    expect(sourceSay("old", catalogue)).toBe("s")
  })

  it("is marked retired, also through its parent", () => {
    expect(sourceIsRetired("old", catalogue)).toBe(true)
    expect(sourceIsRetired("old/x", catalogue)).toBe(true)
    expect(sourceIsRetired("new/b", catalogue)).toBe(true)
    expect(sourceIsRetired("new/a", catalogue)).toBe(false)
    expect(sourceIsRetired("nothing", catalogue)).toBe(false)
  })

  it("is not offered by the picker", () => {
    expect(sourceChoices(null, catalogue).map((n) => n.path)).toEqual(["new"])
    expect(sourceChoices("new", catalogue).map((n) => n.path)).toEqual(["new/a"])
  })
})

describe("the validation finds the mistakes", () => {
  it("finds a duplicate path", () => {
    const p = validateCatalogue([node({ path: "a" }), node({ path: "a" })])
    expect(p).toContain("duplicate path: a")
  })

  it("finds a path with a bad shape", () => {
    expect(validateCatalogue([node({ path: "A b" })])).toContain("bad path shape: A b")
  })

  it("finds a child that is not directly under its parent", () => {
    const wrong = validateCatalogue([node({ path: "a", children: [node({ path: "b/c" })] })])
    expect(wrong).toContain("b/c is not directly under a")
    const deep = validateCatalogue([node({ path: "a", children: [node({ path: "a/b/c" })] })])
    expect(deep).toContain("a/b/c is not directly under a")
  })

  it("finds a top level path with a slash", () => {
    expect(validateCatalogue([node({ path: "a/b" })])).toContain("top level path has a slash: a/b")
  })

  it("finds an empty title and an empty say line", () => {
    const p = validateCatalogue([node({ path: "a", title: " ", say: "" })])
    expect(p).toContain("empty title: a")
    expect(p).toContain("empty say line: a")
  })

  it("finds a bad cap", () => {
    expect(validateCatalogue([node({ path: "a", cap: { letter: "P", color: "blue" } })])).toContain("bad cap colour: a")
    expect(validateCatalogue([node({ path: "a", cap: { letter: "PP", color: "#2563eb" } })])).toContain("cap letter is not one character: a")
  })

  it("finds bad hours", () => {
    expect(validateCatalogue([node({ path: "a", hours: 0 })])).toContain("bad hours: a")
    expect(validateCatalogue([node({ path: "a", headlineHours: [30, 15] })])).toContain("bad headline hours: a")
  })

  it("passes the real catalogue", () => {
    expect(validateCatalogue(LEARN_SOURCES)).toEqual([])
  })
})
```

### 3b. `src/lib/learnLabel.test.ts`
```ts
import { describe, expect, it } from "vitest"
import {
  GATE_SHAPE,
  ITEM_ID_SHAPE,
  isEmptyLearnLabel,
  learnLabelLine,
  learnLabelProblems,
  learnSourceLine,
  parseWhat,
  sessionLabelKind,
  whatText,
  type LearnLabel,
} from "./learnLabel"

// These tests say what DECISIONS_LEARN.md 19a, 19b and 19g decided: two answers and a flag, one label
// per session (Q5), and the lines of the tap line drawn in preview P1.

const label = (what: string | null, via: string | null, review = false): LearnLabel => ({ what, via, review })
// The parts of a line are joined by a middle dot. Written as an escape so that this file stays plain ASCII.
const line = (...parts: string[]) => parts.join(" \u00b7 ")

describe("the shapes", () => {
  it("are written as decided", () => {
    expect(ITEM_ID_SHAPE.source).toBe("^[A-Z]{2}-[0-9]{1,3}$")
    expect(GATE_SHAPE.source).toBe("^[a-z]{2,12}\\/[A-Z0-9-]{1,6}$")
  })
})

describe("what he is working on", () => {
  it("reads an item", () => {
    expect(parseWhat("item:PY-13")).toEqual({ kind: "item", id: "PY-13" })
    expect(parseWhat("item:NP-4")).toEqual({ kind: "item", id: "NP-4" })
    expect(parseWhat("item:PD-25")).toEqual({ kind: "item", id: "PD-25" })
  })

  it("reads a gate", () => {
    expect(parseWhat("gate:python/D")).toEqual({ kind: "gate", subject: "python", region: "D" })
    expect(parseWhat("gate:numpy/NP-A")).toEqual({ kind: "gate", subject: "numpy", region: "NP-A" })
    expect(parseWhat("gate:terminal/TA")).toEqual({ kind: "gate", subject: "terminal", region: "TA" })
  })

  it("refuses everything else", () => {
    const bad = ["", "item:", "item:py-13", "item:PY-1234", "item:PY13", "item:PY-", "gate:Python/D", "gate:python", "gate:python/", "gate:python/d", "gate:p/D", "task:PY-1", "PY-13", " item:PY-13"]
    for (const t of bad) expect(parseWhat(t), JSON.stringify(t)).toBeNull()
    expect(parseWhat(null)).toBeNull()
    expect(parseWhat(5)).toBeNull()
  })

  it("writes back what it read", () => {
    for (const t of ["item:PY-13", "gate:python/D", "gate:numpy/NP-A"]) {
      const w = parseWhat(t)
      expect(w).not.toBeNull()
      expect(whatText(w!)).toBe(t)
    }
  })
})

describe("the shape problems of a label", () => {
  it("finds none in a good label", () => {
    expect(learnLabelProblems(label("item:PY-2", "coursera/ibm-python/m1/1.3"))).toEqual([])
    expect(learnLabelProblems(label(null, "coursera/ibm-python/m4"))).toEqual([])
    expect(learnLabelProblems(label(null, null))).toEqual([])
  })

  it("finds a bad what and a bad source", () => {
    expect(learnLabelProblems(label("PY-2", "own"))).toEqual(["bad what: PY-2"])
    expect(learnLabelProblems(label("item:PY-2", "Own Practice"))).toEqual(["bad source: Own Practice"])
    expect(learnLabelProblems(label("x", "Y"))).toHaveLength(2)
  })

  it("does not check that the item or the source exists", () => {
    expect(learnLabelProblems(label("item:ZZ-999", "nothing/here"))).toEqual([])
  })
})

describe("one label per session (Q5)", () => {
  it("is none, a timer tag, or a learn label", () => {
    expect(sessionLabelKind(null, label(null, null))).toBe("none")
    expect(sessionLabelKind("tag-1", label(null, null))).toBe("timer")
    expect(sessionLabelKind(null, label("item:PY-2", "own"))).toBe("learn")
    expect(sessionLabelKind(null, label(null, "coursera/ibm-python/m4"))).toBe("learn")
    expect(sessionLabelKind(null, label("item:PY-2", "own", true))).toBe("learn")
  })

  it("is invalid with a timer tag and a learn label together", () => {
    expect(sessionLabelKind("tag-1", label("item:PY-2", "own"))).toBe("invalid")
    expect(sessionLabelKind("tag-1", label(null, "own"))).toBe("invalid")
    expect(sessionLabelKind("tag-1", label(null, null, true))).toBe("invalid")
  })

  it("is invalid when a shape is wrong", () => {
    expect(sessionLabelKind(null, label("PY-2", "own"))).toBe("invalid")
  })

  it("knows an empty label", () => {
    expect(isEmptyLearnLabel(label(null, null))).toBe(true)
    expect(isEmptyLearnLabel(label(null, null, true))).toBe(false)
    expect(isEmptyLearnLabel(label(null, "own"))).toBe(false)
  })
})

describe("the lines of the tap line (preview P1)", () => {
  it("reads the six cases and the review", () => {
    expect(learnLabelLine(label("item:PY-13", "own"))).toBe(line("PY-13", "own practice"))
    expect(learnLabelLine(label("item:PY-2", "coursera/ibm-python/m1/1.3"))).toBe(line("PY-2", "via Coursera IBM Python 1.3"))
    expect(learnLabelLine(label(null, "coursera/ibm-python/m4"))).toBe(line("No item", "via Coursera IBM Python, module 4"))
    expect(learnLabelLine(label("gate:python/D", "own"))).toBe(line("Gate python/D", "own practice"))
    expect(learnLabelLine(label("item:GT-14", "progit"))).toBe(line("GT-14", "via Pro Git"))
    expect(learnLabelLine(label("item:LA-1", "coursera/math-ml/c1"))).toBe(line("LA-1", "via Coursera Math, course 1"))
    expect(learnLabelLine(label("item:NP-3", "own", true))).toBe(line("Review of NP-3", "own practice"))
  })

  it("has no line for an empty label", () => {
    expect(learnLabelLine(label(null, null))).toBeNull()
  })

  it("never fails on a source or an item it does not know", () => {
    expect(learnLabelLine(label("item:PY-1", "zzz/unknown"))).toBe(line("PY-1", "via zzz/unknown"))
    expect(learnLabelLine(label("junk", null))).toBe("junk")
  })

  it("says only the item when there is no source yet", () => {
    expect(learnLabelLine(label("item:PY-2", null))).toBe("PY-2")
  })

  it("says own practice without the word via", () => {
    expect(learnSourceLine("own")).toBe("own practice")
    expect(learnSourceLine("other/video")).toBe("via a video")
  })
})
```

### 3c. `src/data/learn/subjectColours.test.ts`
```ts
import { describe, expect, it } from "vitest"
import { OVERVIEW_DAY_PALETTE } from "../../lib/overviewCondition"
import { SUBJECT_COLOURS, SUBJECT_FAMILIES, SUBJECT_IDS } from "./subjectColours"

// These tests guard what DECISIONS_LEARN.md 19c says must stay true while the exact hexes are tuned by eye.

const hex = /^#[0-9a-f]{6}$/

function luminance(color: string): number {
  const channel = (i: number) => {
    const c = parseInt(color.slice(1 + i * 2, 3 + i * 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2)
}

describe("the subject colours", () => {
  it("are one per subject of Tier 1", () => {
    expect([...SUBJECT_IDS]).toEqual(["python", "numpy", "pandas", "terminal", "git", "la", "prob"])
    expect(Object.keys(SUBJECT_COLOURS).sort()).toEqual([...SUBJECT_IDS].sort())
  })

  it("are six digit hex colours, all different", () => {
    const all = SUBJECT_IDS.map((id) => SUBJECT_COLOURS[id])
    for (const c of all) expect(c).toMatch(hex)
    expect(new Set(all).size).toBe(all.length)
  })

  it("are never a colour of the day palette (F5)", () => {
    const day = new Set<string>()
    for (const p of Object.values(OVERVIEW_DAY_PALETTE)) {
      day.add(p.beam.toLowerCase())
      day.add(p.accent.toLowerCase())
      for (const q of Object.values(p.qualities)) day.add(q.toLowerCase())
    }
    expect(day.size).toBeGreaterThan(8)
    for (const id of SUBJECT_IDS) expect(day.has(SUBJECT_COLOURS[id]), id).toBe(false)
  })

  it("stay visible on black (contrast of at least 3 to 1)", () => {
    for (const id of SUBJECT_IDS) {
      const ratio = (luminance(SUBJECT_COLOURS[id]) + 0.05) / 0.05
      expect(ratio, id).toBeGreaterThanOrEqual(3)
    }
  })
})

describe("the families", () => {
  it("hold every subject exactly once", () => {
    const all = SUBJECT_FAMILIES.flatMap((f) => [...f.subjects])
    expect([...all].sort()).toEqual([...SUBJECT_IDS].sort())
  })

  it("step from light to dark inside a family", () => {
    for (const f of SUBJECT_FAMILIES) {
      const lum = f.subjects.map((id) => luminance(SUBJECT_COLOURS[id]))
      for (let i = 1; i < lum.length; i++) expect(lum[i]!, `${f.id} ${i}`).toBeLessThan(lum[i - 1]!)
    }
  })

  it("are the three of the page: data stack, tools, maths", () => {
    expect(SUBJECT_FAMILIES.map((f) => f.id)).toEqual(["data", "tools", "maths"])
    expect(SUBJECT_FAMILIES[0]!.subjects).toEqual(["python", "numpy", "pandas"])
  })
})
```

## STEP 4: Check that the seven files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/data/learn/sources.ts","src/data/learn/subjectColours.ts","src/lib/learnSources.ts","src/lib/learnLabel.ts","src/lib/learnSources.test.ts","src/lib/learnLabel.test.ts","src/data/learn/subjectColours.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these seven lines:
```
src/data/learn/sources.ts 2882ac2e1bbc867842b4266e46f06fbf2c53e1a43ee993e115f2cb395d6a6d89
src/data/learn/subjectColours.ts 39ed091f034f35f9cd659a5ad1012a26df5ed64f0c27e0582a43836dd26fcd3f
src/lib/learnSources.ts cc09c4c994619352e76b6af7dfcedf498a52976d53c41a95ee6a452721311b66
src/lib/learnLabel.ts f4bbda3dac4271937f2b1c7581e71a043a85fe6e1fc1dc40b92d44bbe00ebabd
src/lib/learnSources.test.ts 898983b2efc7677d8642c81d9e20badbfcfbf9652962dd34e27601efbe47ab77
src/lib/learnLabel.test.ts 7b0f2e01eb4eaaebf02d06e716402848c246bf91cbd43b130b72e8acf4c30f67
src/data/learn/subjectColours.test.ts af0dc55d4d6f174e262370f605a271f095f94388c62d41e8ee91ffdd4f2d0c0c
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and the output of `(Get-Content <path>).Count` for each different file. Do not fix the file. (Expected line counts: sources.ts 112, subjectColours.ts 35, learnSources.ts 110, learnLabel.ts 88, learnSources.test.ts 233, learnLabel.test.ts 130, subjectColours.test.ts 65.)

## STEP 5: Run the tests
Run:
```
npm test
```
It must finish with a line `Test Files  38 passed (38)` and a line `Tests  2081 passed (2081)` (the 2028 of Step 0 plus 53 new: 29 in learnSources.test.ts, 17 in learnLabel.test.ts, 7 in subjectColours.test.ts). It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 8 lines of the output.

## STEP 6: Edit `CODE_MAP.md`
Two changes. Change nothing else in the file.

**6a.** Find the line that starts with `| GUIDE |` (in the "Page codes" table). KEEP that line. Directly BELOW it add exactly this one line:
```
| LEARN | Learn: the data and the rules of the learning part of the Guide (the sources of "Learning from", the label of a learn session, the subject colours); no screen yet (Packet 12A1) |
```

**6b.** Find the line that starts with `## Library components (installed React Bits source`. KEEP that line. Directly ABOVE it add exactly this (it ends with one empty line, so there is an empty line between the new section and that heading):
```markdown
## LEARN (the Learn part of the Guide screen)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:LEARN.SOURCES-DATA` | The catalogue of "Learning from" sources: own practice, Coursera (the IBM Python modules and lesson blocks, the three Math courses), NPTEL (an empty slot), Pro Git, other. Data only | `src/data/learn/sources.ts` | titles, the say lines, the cap letters and colours; add a source or a lesson block; retire a source. NEVER change or reuse a path (see CONNECTIONS.md C67) |
| `AB:LEARN.SOURCES` | Reads that catalogue: the shape of a source path, find a source, its words, its end cap, retired, the lists of the picker, the validation. Pure functions | `src/lib/learnSources.ts` | nothing yet; the shape of a path is a decision (see CONNECTIONS.md C66) |
| `AB:LEARN.LABEL` | The label of a learn session (what, source, review): their shapes, one label per session, and the words of the tap line. Pure functions | `src/lib/learnLabel.ts` | the words of the tap line; the shapes are decisions (see CONNECTIONS.md C66) |
| `AB:LEARN.COLOURS` | The colour of each Learn subject, in three families (data stack, tools, maths) | `src/data/learn/subjectColours.ts` | the hex of each colour (placeholders, judged by eye); the tests keep them off the day colours and visible on black (see CONNECTIONS.md C68) |
The tests of these four are not tagged: `src/lib/learnSources.test.ts`, `src/lib/learnLabel.test.ts` and `src/data/learn/subjectColours.test.ts`.

```

## STEP 7: Edit `CONNECTIONS.md`
Add a new heading and THREE new entries, C66, C67 and C68. Change nothing else in the file. Find the line `## Things to know (no check is possible)`. KEEP that line. Directly ABOVE it add exactly this (it ends with one empty line, so there is an empty line between the new entries and that heading):
```markdown
## Connections on LEARN

### C66: The shapes of a learn label are written here and will be written again in the database
- Tags: `AB:LEARN.LABEL`, `AB:LEARN.SOURCES`
- If you change: the shape of an item id (two capital letters, a hyphen, one to three digits), the shape of a gate (the subject id, a slash, the region id), or the shape of a source path (parts of small letters, digits, dots and hyphens, joined by one slash, at most 80 characters)
- Then also: Packet 12C writes the same shapes again in the database (the checks on learn_what and learn_via, and the learn arguments of timer_start). When that packet is built, change the database in the same packet. The tests write the shapes again on purpose: change both and run npm test.
- If you forget: the app accepts a label that the database refuses (the session does not save), or the other way round.
- Anchor: `AB:LEARN.LABEL @ src/lib/learnLabel.ts = export const ITEM_ID_SHAPE = /^[A-Z]{2}-[0-9]{1,3}$/`
- Anchor: `AB:LEARN.LABEL @ src/lib/learnLabel.ts = export const GATE_SHAPE = /^[a-z]{2,12}\/[A-Z0-9-]{1,6}$/`
- Anchor: `AB:LEARN.SOURCES @ src/lib/learnSources.ts = export const SOURCE_PATH_SHAPE = /^[a-z0-9][a-z0-9.-]*(\/[a-z0-9][a-z0-9.-]*)*$/`
- Anchor: `AB:LEARN.SOURCES @ src/lib/learnSources.ts = export const SOURCE_PATH_MAX_LENGTH = 80`
- Anchor: `src/lib/learnLabel.test.ts = expect(ITEM_ID_SHAPE.source).toBe("^[A-Z]{2}-[0-9]{1,3}$")`
- Anchor: `src/lib/learnSources.test.ts = expect(SOURCE_PATH_MAX_LENGTH).toBe(80)`
- Check by hand: nothing yet. After Packet 12C compare the checks in the database with the three shapes.

### C67: A source path is frozen once it has been used
- Tags: `AB:LEARN.SOURCES-DATA`, `AB:LEARN.SOURCES`
- If you change: a path in the catalogue (the stored text of a source), for example own, coursera, coursera/ibm-python, coursera/math-ml, nptel, progit or other
- Then also: do not change it and do not reuse it for something else. A saved session stores the path, so a changed or reused path sends old sessions to the wrong source. Retire the source (retired: true) and add a new one. The list of frozen paths is written again in learnSources.test.ts on purpose: add a path to it when the path ships.
- If you forget: old sessions show the wrong source or none. The test "still holds every frozen path" fails first.
- Anchor: `AB:LEARN.SOURCES-DATA @ src/data/learn/sources.ts = path: "own"`
- Anchor: `AB:LEARN.SOURCES-DATA @ src/data/learn/sources.ts = path: "coursera",`
- Anchor: `AB:LEARN.SOURCES-DATA @ src/data/learn/sources.ts = path: "coursera/ibm-python",`
- Anchor: `AB:LEARN.SOURCES-DATA @ src/data/learn/sources.ts = path: "coursera/math-ml",`
- Anchor: `AB:LEARN.SOURCES-DATA @ src/data/learn/sources.ts = path: "nptel",`
- Anchor: `AB:LEARN.SOURCES-DATA @ src/data/learn/sources.ts = path: "progit",`
- Anchor: `AB:LEARN.SOURCES-DATA @ src/data/learn/sources.ts = path: "other",`
- Anchor: `src/lib/learnSources.test.ts = const FROZEN_PATHS = [`
- Check by hand: nothing.

### C68: A subject colour must never be a colour of the day screen
- Tags: `AB:LEARN.COLOURS`, `AB:OVERVIEW.CONDITION`
- If you change: a subject colour, or any colour of OVERVIEW_DAY_PALETTE (the beam, the bright colour and the four pill colours of each condition)
- Then also: the test in subjectColours.test.ts reads OVERVIEW_DAY_PALETTE and fails when a subject colour is exactly a colour of the day palette (F5 of DECISIONS_LEARN.md). It finds equal colours only, not colours that are merely close, so after a change look at all four looks of the day screen by eye. A subject colour must also stay visible on black (a contrast of at least 3 to 1) and different from the others.
- If you forget: a learn pill is mistaken for a colour of the day. This is why a learn pill also carries a mark and an end cap (DECISIONS_LEARN.md section 19b).
- Anchor: `AB:LEARN.COLOURS @ src/data/learn/subjectColours.ts = export const SUBJECT_COLOURS: Record<SubjectId, string> = {`
- Anchor: `AB:OVERVIEW.CONDITION @ src/lib/overviewCondition.ts = export const OVERVIEW_DAY_PALETTE: Record<OverviewCondition, OverviewDayPalette> = {`
- Anchor: `src/data/learn/subjectColours.test.ts = import { OVERVIEW_DAY_PALETTE } from "../../lib/overviewCondition"`
- Check by hand: after a change open the Overview in each of the four looks and look at a learn pill next to the day pills.

```

## STEP 8: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly these two changes. Change nothing else in the file.

**8a.** Find the line that starts with `- Packet T1:` (under the heading `## Done`). KEEP it. Directly BELOW it add exactly this one line:
```
- Packet 12A1: the first data and rules of Learn, with no screen (src/data/learn/sources.ts, src/data/learn/subjectColours.ts, src/lib/learnSources.ts and src/lib/learnLabel.ts new; tests in learnSources.test.ts, learnLabel.test.ts and subjectColours.test.ts; DECISIONS_LEARN.md draft 5, section 19). It holds the sources of "Learning from" (the IBM Python modules and lesson blocks, the three Math courses, NPTEL as an empty slot, Pro Git, other), the shapes and the words of the label of a learn session (what, source, review) and the subject colours in three families. Not seen in a browser (there is no screen); not yet written in the database (Packet 12C).
```

**8b.** Find the heading line `## Next`. KEEP it. Directly BELOW it add exactly this one line:
```
- Packet 12A2 (the second half of 12A) is blocked until the owner puts the Learn subject hub mock (ASHBORN_Learn__subject_hub.html, which holds the 147 items, 36 regions and 36 region tasks) and the Tier 1 ledgers (the part19 and handover zips) where the planner can read them: it turns them into the data file, with the structured needs and the item card fields (DECISIONS_LEARN.md sections 16 and 19d).
```
If the line `- Packet T1:` or the heading `## Next` is not found exactly once: **STOP** and report.

## STEP 9: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 55 tags, 107 places
CONNECTIONS OK: 68 connections, 656 anchors, 140 classes, 9 css variables, 2 label links
```
(55 tags and 107 places: four new tags in four files. 68 connections and 656 anchors: the new entries C66, C67 and C68 with 17 anchors. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list ONLY `CODE_MAP.md`, `CONNECTIONS.md` and `PROGRESS.md`. If ANY other tracked file is listed (in particular `package.json` or `package-lock.json`): **STOP** and report the COMPLETE output. Do not commit. `git status --short` must show those three files as changed and, as new files, `src/data/` and the four files in `src/lib/` (`learnLabel.ts`, `learnLabel.test.ts`, `learnSources.ts`, `learnSources.test.ts`).

## STEP 10: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/data/learn/sources.ts src/data/learn/subjectColours.ts src/data/learn/subjectColours.test.ts src/lib/learnSources.ts src/lib/learnSources.test.ts src/lib/learnLabel.ts src/lib/learnLabel.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 12A1: Learn sources, label shapes and subject colours (data and rules, no screen)"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output.

## STEP 11: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (51 tags, 65 connections, 639 anchors) and `npm test` printed 35 files and 2028 tests passed.
2. The seven fingerprint lines of Step 4 matched exactly.
3. `npm test` printed `Test Files  38 passed (38)` and `Tests  2081 passed (2081)`.
4. `node scripts/check-tags.mjs` printed the two lines of Step 9 (55 tags, 68 connections, 656 anchors).
5. `npm run build` finished with no errors.
6. `git diff --stat` before the commit listed only `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
7. `git show --stat HEAD` lists exactly these 10 files: `src/data/learn/sources.ts`, `src/data/learn/subjectColours.ts`, `src/data/learn/subjectColours.test.ts`, `src/lib/learnSources.ts`, `src/lib/learnSources.test.ts`, `src/lib/learnLabel.ts`, `src/lib/learnLabel.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
8. The first line of `git log --oneline` ends with `Packet 12A1: Learn sources, label shapes and subject colours (data and rules, no screen)`.
9. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
10. `git push` finished without an error.
11. No file other than the ones named in this packet was created, edited or committed. `package.json` and `package-lock.json` did not change.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 11 done-checks
- the RAW outputs of the 5 commands of Step 0, and the last 8 lines of the `npm test` of Step 0
- the exact seven lines printed in Step 4
- the last 8 lines of the output of `npm test` from Step 5
- the exact output of `node scripts/check-tags.mjs` from Step 9
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 9
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 10
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.
