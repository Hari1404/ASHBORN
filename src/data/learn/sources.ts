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
