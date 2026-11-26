import { describe, expect, it } from "vitest"
import { FROZEN_ITEM_IDS, FROZEN_REGION_KEYS } from "../data/learn/frozenIds"
import { ITEM_NEEDS, REGION_NEEDS, type Need } from "../data/learn/needs"
import { LEARN_SOURCES, type SourceNode } from "../data/learn/sources"
import { SUBJECT_COLOURS, SUBJECT_IDS } from "../data/learn/subjectColours"
import { COURSE_LINKS, TIER1_SUBJECTS, type LearnItem, type LearnRegion, type LearnSubject } from "../data/learn/tier1"
import {
  ABILITY_KINDS,
  LEARN_LINE_MAX_LENGTH,
  TIER1_COUNTS,
  learnDataProblems,
  usedSourceProblems,
  usedWhatProblems,
  type LearnDataInput,
} from "./learnData"

// These tests run the checks of the Learn content on the REAL content (src/data/learn/tier1.ts and needs.ts) and then
// break a copy of it on purpose, one rule at a time, to see that every check can fail. Tier 1 is FINAL (L-57): the
// counts and the sizes below are the table of DECISIONS_LEARN.md 8a. The words of the content are not guarded here.

type Item = { -readonly [K in keyof LearnItem]: LearnItem[K] }
type Region = Omit<{ -readonly [K in keyof LearnRegion]: LearnRegion[K] }, "items"> & { items: Item[] }
type Subject = Omit<{ -readonly [K in keyof LearnSubject]: LearnSubject[K] }, "regions"> & { regions: Region[] }

function copy(): Subject[] {
  return JSON.parse(JSON.stringify(TIER1_SUBJECTS)) as Subject[]
}

function input(over: Partial<LearnDataInput> = {}): LearnDataInput {
  return {
    subjects: TIER1_SUBJECTS,
    regionNeeds: REGION_NEEDS,
    itemNeeds: ITEM_NEEDS,
    frozenItemIds: FROZEN_ITEM_IDS,
    frozenRegionKeys: FROZEN_REGION_KEYS,
    courseLinks: COURSE_LINKS,
    sources: LEARN_SOURCES,
    expected: TIER1_COUNTS,
    ...over,
  }
}

function firstItem(subjects: Subject[], id: string): Item {
  for (const s of subjects) for (const r of s.regions) for (const i of r.items) if (i.id === id) return i
  throw new Error(`no item ${id}`)
}

function expectProblem(problems: string[], fragment: string): void {
  expect(
    problems.some((p) => p.includes(fragment)),
    `expected a problem with "${fragment}" in:\n${problems.join("\n")}`,
  ).toBe(true)
}

const hardRegion = (key: string): Need => ({ target: { kind: "region", key }, hard: true, why: "test" })

describe("the real Tier 1 content", () => {
  it("has no problem at all", () => {
    expect(learnDataProblems(input())).toEqual([])
  })

  it("has 147 items, 36 regions and 36 region tasks (L-57)", () => {
    const regions = TIER1_SUBJECTS.flatMap((s) => s.regions)
    expect(TIER1_COUNTS).toEqual({ items: 147, regions: 36, tasks: 36 })
    expect(regions).toHaveLength(36)
    expect(regions.flatMap((r) => r.items)).toHaveLength(147)
    expect(regions.filter((r) => r.task.k.length > 0)).toHaveLength(36)
  })

  it("has the seven subjects in the order of the colour families, with their colours", () => {
    expect(TIER1_SUBJECTS.map((s) => s.id)).toEqual([...SUBJECT_IDS])
    expect(TIER1_SUBJECTS.map((s) => s.code)).toEqual(["PY", "NP", "PD", "TM", "GT", "LA", "PB"])
    for (const id of SUBJECT_IDS) expect(SUBJECT_COLOURS[id]).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("has the region sizes of DECISIONS_LEARN.md 8a", () => {
    const sizes = Object.fromEntries(TIER1_SUBJECTS.map((s) => [s.id, s.regions.map((r) => `${r.id}${r.items.length}`).join(" ")]))
    expect(sizes).toEqual({
      python: "A5 B4 C3 D5 E4 F6 G3 H4 I4 J3 K3",
      numpy: "NP-A4 NP-B4 NP-C5 NP-D4 NP-E4 NP-F2",
      pandas: "PD-F4 PD-G8 PD-H4 PD-I3 PD-J4 PD-K2",
      terminal: "TA3 TB4",
      git: "A6 B4 C5 D5",
      la: "A4 B4 C5",
      prob: "A4 B4 C4 D3",
    })
    const items = Object.fromEntries(TIER1_SUBJECTS.map((s) => [s.id, s.regions.reduce((n, r) => n + r.items.length, 0)]))
    expect(items).toEqual({ python: 44, numpy: 23, pandas: 25, terminal: 7, git: 20, la: 13, prob: 15 })
  })

  it("keeps the order of the pack inside a region (PY-1 to PY-5, then PY-6 and on)", () => {
    const python = TIER1_SUBJECTS[0]!
    expect(python.regions[0]!.items.map((i) => i.id)).toEqual(["PY-1", "PY-2", "PY-3", "PY-4", "PY-5"])
    expect(python.regions[1]!.items[0]!.id).toBe("PY-6")
    const pandasG = TIER1_SUBJECTS[2]!.regions[1]!
    expect(pandasG.key).toBe("pandas/PD-G")
    expect(pandasG.items.map((i) => i.id)).toEqual(["PD-4", "PD-5", "PD-6", "PD-7", "PD-8", "PD-13", "PD-14", "PD-15"])
  })

  it("freezes every item id and every region key, in the order of the content", () => {
    expect(FROZEN_ITEM_IDS).toEqual(TIER1_SUBJECTS.flatMap((s) => s.regions.flatMap((r) => r.items.map((i) => i.id))))
    expect(FROZEN_REGION_KEYS).toEqual(TIER1_SUBJECTS.flatMap((s) => s.regions.map((r) => r.key)))
  })

  it("gives every item learn lines and ability lines in the ranges of the content rules", () => {
    for (const s of TIER1_SUBJECTS) {
      for (const r of s.regions) {
        for (const i of r.items) {
          expect(i.learn.length, i.id).toBeGreaterThanOrEqual(7)
          expect(i.learn.length, i.id).toBeLessThanOrEqual(10)
          expect(i.ab.length, i.id).toBeGreaterThanOrEqual(6)
          expect(i.ab.length, i.id).toBeLessThanOrEqual(8)
          for (const [kind] of i.ab) expect(ABILITY_KINDS, i.id).toContain(kind)
        }
      }
    }
  })

  it("uses a catalogue path for every Coursera lesson, and has a link for every course", () => {
    const paths = new Set<string>()
    for (const s of TIER1_SUBJECTS) for (const r of s.regions) for (const i of r.items) if (i.via) paths.add(i.via.path)
    expect(paths.size).toBeGreaterThan(0)
    for (const p of paths) {
      const course = Object.keys(COURSE_LINKS).find((k) => p === k || p.startsWith(`${k}/`))
      expect(course, p).toBeDefined()
    }
    for (const link of Object.values(COURSE_LINKS)) expect(link.url).toMatch(/^https:\/\/www\.coursera\.org\//)
  })

  it("keeps the learn and ability lines to plain characters (the middle dot of the maths is the only other one)", () => {
    for (const s of TIER1_SUBJECTS) {
      for (const r of s.regions) {
        for (const i of r.items) {
          for (const line of [...i.learn, ...i.ab.map((a) => a[1])]) expect(/^[\x20-\x7e\u00b7]+$/.test(line), `${i.id}: ${line}`).toBe(true)
        }
      }
    }
  })

  it("gives every region an idea in one plain line (git/D is a DRAFT line, see the top of tier1.ts)", () => {
    for (const s of TIER1_SUBJECTS) for (const r of s.regions) expect(r.idea.trim().length, r.key).toBeGreaterThan(20)
  })
})

describe("the needs of the content (Q12): the HARD ones that the pack says", () => {
  const hardTargets = (key: string) => (REGION_NEEDS[key] ?? []).filter((n) => n.hard).map((n) => (n.target.kind === "region" ? n.target.key : n.target.id))

  it("NumPy needs Python A to F, and the terminal through Python region I", () => {
    expect(hardTargets("numpy/NP-A")).toEqual(expect.arrayContaining(["python/A", "python/B", "python/C", "python/D", "python/E", "python/F", "python/I"]))
  })

  it("pandas needs NumPy A to C", () => {
    expect(hardTargets("pandas/PD-F")).toEqual(["numpy/NP-A", "numpy/NP-B", "numpy/NP-C"])
  })

  it("Git needs the terminal", () => {
    expect(hardTargets("git/A")).toEqual(["terminal/TA", "terminal/TB"])
  })

  it("probability needs loops and functions from Python", () => {
    expect(hardTargets("prob/A")).toEqual(["python/D", "python/E"])
  })

  it("linear algebra region C needs NumPy (NP-22), and regions A and B need nothing", () => {
    expect(hardTargets("la/C")).toEqual(["NP-22"])
    expect(REGION_NEEDS["la/A"]).toBeUndefined()
    expect(REGION_NEEDS["la/B"]).toBeUndefined()
  })

  it("Python region I needs the terminal", () => {
    expect(hardTargets("python/I")).toEqual(expect.arrayContaining(["terminal/TA", "terminal/TB"]))
  })

  it("keeps Python A and the terminal open from day one", () => {
    expect(REGION_NEEDS["python/A"]).toBeUndefined()
    expect(REGION_NEEDS["terminal/TA"]).toBeUndefined()
  })

  it("gives every need a reason in plain words", () => {
    const all = [...Object.values(REGION_NEEDS).flat(), ...Object.values(ITEM_NEEDS).flat()]
    expect(all.length).toBeGreaterThan(40)
    for (const n of all) expect(n.why.trim().length).toBeGreaterThan(0)
  })
})

describe("broken copies of the content: every check can fail", () => {
  it("an item without a check", () => {
    const subjects = copy()
    firstItem(subjects, "PY-5").c = ""
    expectProblem(learnDataProblems(input({ subjects })), "item PY-5: the check is empty")
  })

  it("an item without an answer", () => {
    const subjects = copy()
    firstItem(subjects, "PY-5").a = "  "
    expectProblem(learnDataProblems(input({ subjects })), "item PY-5: the answer is empty")
  })

  it("a note that is there but empty", () => {
    const subjects = copy()
    firstItem(subjects, "PY-5").o = ""
    expectProblem(learnDataProblems(input({ subjects })), "item PY-5: o is there but empty")
  })

  it("too few learn lines", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-1")
    item.learn = item.learn.slice(0, 6)
    expectProblem(learnDataProblems(input({ subjects })), "item PY-1: has 6 learn lines")
  })

  it("too many ability lines", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-1")
    item.ab = [...item.ab, ...item.ab].slice(0, 9)
    expectProblem(learnDataProblems(input({ subjects })), "item PY-1: has 9 ability lines")
  })

  it("a learn line with a dash", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-1")
    item.learn = [`a line \u2014 with a dash`, ...item.learn.slice(1)]
    expectProblem(learnDataProblems(input({ subjects })), "item PY-1: learn line 1 has a dash")
  })

  it("a learn line with a line break", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-1")
    item.learn = ["two\nlines", ...item.learn.slice(1)]
    expectProblem(learnDataProblems(input({ subjects })), "item PY-1: learn line 1 has a line break")
  })

  it("a learn line that is too long", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-1")
    item.learn = ["x".repeat(LEARN_LINE_MAX_LENGTH + 1), ...item.learn.slice(1)]
    expectProblem(learnDataProblems(input({ subjects })), `learn line 1 is longer than ${LEARN_LINE_MAX_LENGTH}`)
  })

  it("an ability of an unknown kind", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-1")
    item.ab = [["juggle" as never, "Juggle with the loop"], ...item.ab.slice(1)]
    expectProblem(learnDataProblems(input({ subjects })), 'item PY-1: ability line 1 has the unknown kind "juggle"')
  })

  it("an id used twice", () => {
    const subjects = copy()
    subjects[0]!.regions[1]!.items[0]!.id = "PY-1"
    expectProblem(learnDataProblems(input({ subjects })), "item PY-1: the id is used twice")
  })

  it("an id with the wrong shape", () => {
    const subjects = copy()
    subjects[0]!.regions[0]!.items[0]!.id = "py1"
    expectProblem(learnDataProblems(input({ subjects })), "item py1: the id has the wrong shape")
  })

  it("an id that does not start with the code of its subject", () => {
    const subjects = copy()
    subjects[0]!.regions[0]!.items[0]!.id = "NP-99"
    expectProblem(learnDataProblems(input({ subjects })), "item NP-99: the id must start with the code of its subject (PY-)")
  })

  it("a subject with a bad code", () => {
    const subjects = copy()
    subjects[0]!.code = "py"
    expectProblem(learnDataProblems(input({ subjects })), "subject python: the code must be two capital letters")
  })

  it("a region key that is not the subject id, a slash and the region id", () => {
    const subjects = copy()
    subjects[0]!.regions[0]!.key = "python/Z"
    expectProblem(learnDataProblems(input({ subjects })), "region python/Z: the key must be the subject id, a slash and the region id (python/A)")
  })

  it("a region without a task", () => {
    const subjects = copy()
    delete (subjects[0]!.regions[0] as { task?: unknown }).task
    expectProblem(learnDataProblems(input({ subjects })), "region python/A: has no task")
  })

  it("a region task without its answer", () => {
    const subjects = copy()
    subjects[0]!.regions[0]!.task.a = ""
    expectProblem(learnDataProblems(input({ subjects })), "region python/A: the task has an empty a")
  })

  it("a region without items", () => {
    const subjects = copy()
    subjects[0]!.regions[0]!.items = []
    expectProblem(learnDataProblems(input({ subjects })), "region python/A: has no items")
  })

  it("the subjects in the wrong order", () => {
    const subjects = copy().reverse()
    expectProblem(learnDataProblems(input({ subjects })), "the subjects are [")
  })

  it("a count that is not the final one", () => {
    const subjects = copy()
    subjects[0]!.regions[0]!.items.pop()
    expectProblem(learnDataProblems(input({ subjects })), "there are 146 items, there must be 147")
  })

  it("a Coursera path that is not in the catalogue", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-2")
    item.via = { path: "coursera/ibm-python/m9", where: "Module 9", tags: ["video"] }
    expectProblem(learnDataProblems(input({ subjects })), 'via path "coursera/ibm-python/m9" is not in the catalogue of sources')
  })

  it("a Coursera path with the wrong shape", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-2")
    item.via = { path: "Coursera/IBM", where: "Module 1", tags: ["video"] }
    expectProblem(learnDataProblems(input({ subjects })), 'via path "Coursera/IBM" has the wrong shape')
  })

  it("a Coursera path of a retired source", () => {
    const sources = JSON.parse(JSON.stringify(LEARN_SOURCES)) as SourceNode[]
    sources.find((n) => n.path === "coursera")!.children!.find((c) => c.path === "coursera/ibm-python")!.retired = true
    expectProblem(learnDataProblems(input({ sources })), "is retired")
  })

  it("a via tag that is not known", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-2")
    item.via = { path: "coursera/ibm-python/m1/1.3", where: "Module 1", tags: ["podcast"] }
    expectProblem(learnDataProblems(input({ subjects })), 'item PY-2: via has the unknown tag "podcast"')
  })

  it("a reading link that is not https", () => {
    const subjects = copy()
    const item = firstItem(subjects, "GT-1")
    item.src = [{ title: "Pro Git", url: "http://git-scm.com/book", note: "read it" }]
    expectProblem(learnDataProblems(input({ subjects })), "the link must start with https:// and hold no spaces")
  })

  it("the same reading link twice in one item", () => {
    const subjects = copy()
    const item = firstItem(subjects, "GT-1")
    const one = { title: "Pro Git", url: "https://git-scm.com/book/en/v2", note: "read it" }
    item.src = [one, { ...one, title: "Pro Git again" }]
    expectProblem(learnDataProblems(input({ subjects })), "the same link twice in one item")
  })

  it("a course link whose course is not in the catalogue", () => {
    const courseLinks = { ...COURSE_LINKS, "coursera/nowhere": { name: "Nowhere", url: "https://www.coursera.org/learn/nowhere" } }
    expectProblem(learnDataProblems(input({ courseLinks })), 'course link "coursera/nowhere" is not in the catalogue of sources')
  })

  it("a frozen id that went away", () => {
    expectProblem(learnDataProblems(input({ frozenItemIds: [...FROZEN_ITEM_IDS, "PY-99"] })), "frozen item id PY-99 is missing from the content")
    expectProblem(learnDataProblems(input({ frozenRegionKeys: [...FROZEN_REGION_KEYS, "python/Z"] })), "frozen region key python/Z is missing from the content")
  })

  it("a frozen id listed twice", () => {
    expectProblem(learnDataProblems(input({ frozenItemIds: [...FROZEN_ITEM_IDS, "PY-1"] })), "frozen item id PY-1 is listed twice")
  })

  it("a need that points at an item that does not exist", () => {
    const itemNeeds = { ...ITEM_NEEDS, "PY-3": [{ target: { kind: "item" as const, id: "PY-404" }, hard: true, why: "test" }] }
    expectProblem(learnDataProblems(input({ itemNeeds })), "need 1 points at the item PY-404, which does not exist")
  })

  it("a need that points at a region that does not exist", () => {
    const regionNeeds = { ...REGION_NEEDS, "python/B": [hardRegion("python/Z")] }
    expectProblem(learnDataProblems(input({ regionNeeds })), "need 1 points at the region python/Z, which does not exist")
  })

  it("a need on a region or an item that does not exist", () => {
    expectProblem(learnDataProblems(input({ regionNeeds: { ...REGION_NEEDS, "python/Z": [] } })), "needs: the region python/Z does not exist")
    expectProblem(learnDataProblems(input({ itemNeeds: { ...ITEM_NEEDS, "PY-404": [] } })), "needs: the item PY-404 does not exist")
  })

  it("a need without a reason", () => {
    const regionNeeds = { ...REGION_NEEDS, "python/B": [{ target: { kind: "region" as const, key: "python/A" }, hard: true, why: " " }] }
    expectProblem(learnDataProblems(input({ regionNeeds })), "needs of region python/B: need 1 has no reason")
  })

  it("a region need that points at a later region of the same subject", () => {
    const regionNeeds = { ...REGION_NEEDS, "python/B": [hardRegion("python/C")] }
    expectProblem(learnDataProblems(input({ regionNeeds })), "needs of region python/B: a need points at python/C, which is not before it in the same subject")
  })

  it("an item need that points at a later item of the same subject", () => {
    const itemNeeds = { ...ITEM_NEEDS, "PY-3": [{ target: { kind: "item" as const, id: "PY-4" }, hard: true, why: "test" }] }
    expectProblem(learnDataProblems(input({ itemNeeds })), "needs of item PY-3: a need points at PY-4, which is not before it in the same subject")
  })

  it("an item need that points at the item itself", () => {
    const itemNeeds = { ...ITEM_NEEDS, "PY-3": [{ target: { kind: "item" as const, id: "PY-3" }, hard: true, why: "test" }] }
    expectProblem(learnDataProblems(input({ itemNeeds })), "needs of item PY-3: a need points at PY-3, which is not before it in the same subject")
  })

  it("needs that run in a circle across two subjects", () => {
    // The terminal would need NumPy, and NumPy needs Python I, which needs the terminal.
    const regionNeeds = { ...REGION_NEEDS, "terminal/TA": [hardRegion("numpy/NP-A")] }
    expectProblem(learnDataProblems(input({ regionNeeds })), "the needs run in a circle")
  })

  it("reports each problem once", () => {
    const subjects = copy()
    const item = firstItem(subjects, "PY-1")
    item.learn = []
    const problems = learnDataProblems(input({ subjects }))
    expect(new Set(problems).size).toBe(problems.length)
  })
})

describe("the saved sessions: what they use must still exist (Q22, B5)", () => {
  it("accepts a source that is in the catalogue, whatever its depth", () => {
    expect(usedSourceProblems(["own", "coursera/ibm-python/m1/1.3", "coursera/math-ml/c2", "progit", "nptel", "other/book"], LEARN_SOURCES)).toEqual([])
  })

  it("says so when a source is gone or has a bad shape", () => {
    const problems = usedSourceProblems(["coursera/ibm-python/m9", "Own Practice"], LEARN_SOURCES)
    expectProblem(problems, 'uses the source "coursera/ibm-python/m9", which is no longer in the catalogue')
    expectProblem(problems, 'the source "Own Practice", which has the wrong shape')
  })

  it("accepts an item and a gate that are in the content", () => {
    expect(usedWhatProblems(["item:PY-13", "gate:python/D", "item:GT-20", "gate:numpy/NP-F"], TIER1_SUBJECTS)).toEqual([])
  })

  it("says so when an item or a gate is gone or has a bad shape", () => {
    const problems = usedWhatProblems(["item:PY-99", "gate:python/Z", "item:py13", "PY-13"], TIER1_SUBJECTS)
    expectProblem(problems, "works on the item PY-99, which no longer exists")
    expectProblem(problems, "works on the gate python/Z, which no longer exists")
    expectProblem(problems, 'the label "item:py13", which has the wrong shape')
    expectProblem(problems, 'the label "PY-13", which has the wrong shape')
  })
})
