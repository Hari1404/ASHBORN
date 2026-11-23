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
