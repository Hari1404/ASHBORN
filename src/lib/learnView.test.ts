import { describe, expect, it } from "vitest"
import { SUBJECT_COLOURS, SUBJECT_IDS } from "../data/learn/subjectColours"
import type { LearnItem, LearnRegion, LearnSubject } from "../data/learn/tier1"
import { LEARN_INDEX, NO_FACTS, buildLearnIndex, type LearnFacts } from "./learnRules"
import { guideHash, parseAddress } from "./screens"
import {
  OPEN_TIER,
  TIER_COUNT,
  capFirst,
  hubTiles,
  inlineParts,
  plainText,
  regionLetter,
  resolveGuideAddress,
  subjectView,
  tierClosedMessage,
  tierTabs,
} from "./learnView"

// What the Learn screen shows (Packet 12B, chunk 2). First on the real Tier 1 content, then on a small made up one.
function item(id: string, t: string): LearnItem {
  return { id, t, y: "y", c: "c", a: "a", learn: [], ab: [] }
}

function region(subject: string, id: string, n: string, idea: string, items: LearnItem[]): LearnRegion {
  return { key: `${subject}/${id}`, id, n, idea, needsText: "", items, task: { t: "t", u: "u", k: "k", a: "a" } }
}

const SMALL: readonly LearnSubject[] = [
  {
    id: "python",
    name: "Python",
    code: "PY",
    regions: [
      region("python", "A", "Values", "a program keeps `values` under names.", [item("PY-1", "Run a `file`"), item("PY-2", "Variables")]),
      region("python", "B", "Text", "text is a value too.", [item("PY-3", "Strings")]),
    ],
  },
  {
    id: "numpy",
    name: "NumPy",
    code: "NP",
    regions: [region("numpy", "NP-A", "Arrays", "arrays hold many numbers.", [item("NP-1", "Make an array")])],
  },
]
const SMALL_INDEX = buildLearnIndex(SMALL, {}, {})

function factsDone(...ids: string[]): LearnFacts {
  const items: Record<string, { startedDay: string; doneDay: string | null }> = {}
  for (const id of ids) items[id] = { startedDay: "2026-11-26", doneDay: "2026-11-26" }
  return { items, regions: {} }
}

describe("the tiers", () => {
  it("has six tabs and only Tier 1 is open", () => {
    const tabs = tierTabs()
    expect(tabs).toHaveLength(TIER_COUNT)
    expect(tabs.map((t) => t.n)).toEqual([1, 2, 3, 4, 5, 6])
    expect(tabs.filter((t) => t.open).map((t) => t.n)).toEqual([OPEN_TIER])
  })

  it("shows 0 / 147 on Tier 1 with the real content and no facts", () => {
    const first = tierTabs()[0]
    expect(first).toEqual({ n: 1, open: true, label: "Tier 1", count: "0 / 147", progress: 0, finished: false })
  })

  it("shows the closed tiers as not started with an empty line", () => {
    for (const t of tierTabs().slice(1)) {
      expect(t).toEqual({ n: t.n, open: false, label: `Tier ${t.n}`, count: "not started", progress: 0, finished: false })
    }
  })

  it("counts done items of all subjects in Tier 1 and finishes it when all are done", () => {
    const some = tierTabs(SMALL_INDEX, factsDone("PY-1", "NP-1"))[0]
    expect(some.count).toBe("2 / 4")
    expect(some.progress).toBe(0.5)
    expect(some.finished).toBe(false)
    const all = tierTabs(SMALL_INDEX, factsDone("PY-1", "PY-2", "PY-3", "NP-1"))[0]
    expect(all.count).toBe("4 / 4")
    expect(all.finished).toBe(true)
  })

  it("does not finish a tier that has no items", () => {
    const empty = buildLearnIndex([], {}, {})
    expect(tierTabs(empty)[0]).toMatchObject({ count: "0 / 0", progress: 0, finished: false })
  })

  it("says what a closed tier says in the page", () => {
    expect(tierClosedMessage(3)).toBe("Tier 3 is closed. It opens only when you say so.")
  })
})

describe("words of the content", () => {
  it("marks code between backticks and keeps the rest plain", () => {
    expect(inlineParts("use `print` to show it")).toEqual([
      { text: "use ", code: false },
      { text: "print", code: true },
      { text: " to show it", code: false },
    ])
  })

  it("returns nothing for an empty text and one plain part for text without a backtick", () => {
    expect(inlineParts("")).toEqual([])
    expect(inlineParts("plain words")).toEqual([{ text: "plain words", code: false }])
  })

  it("starts and ends with code, and keeps two codes apart", () => {
    expect(inlineParts("`a` and `b`")).toEqual([
      { text: "a", code: true },
      { text: " and ", code: false },
      { text: "b", code: true },
    ])
    expect(inlineParts("`only`")).toEqual([{ text: "only", code: true }])
  })

  it("keeps a lone backtick as plain text and never loses a character", () => {
    expect(inlineParts("a `b")).toEqual([{ text: "a `b", code: false }])
    expect(inlineParts("`a` and `b")).toEqual([
      { text: "a", code: true },
      { text: " and `b", code: false },
    ])
    for (const text of ["x `y` z", "`", "``", "a``b", "`a`b`c"]) {
      const back = inlineParts(text)
        .map((p) => (p.code ? "`" + p.text + "`" : p.text))
        .join("")
      expect(back.replace(/`/g, "")).toBe(text.replace(/`/g, ""))
    }
  })

  it("strips the backticks for a plain title and capitalises the first letter", () => {
    expect(plainText("Run a `file` now")).toBe("Run a file now")
    expect(capFirst("a program")).toBe("A program")
    expect(capFirst("")).toBe("")
    expect(capFirst("Already")).toBe("Already")
  })

  it("shows the letter of a region", () => {
    expect(regionLetter("A")).toBe("A")
    expect(regionLetter("NP-A")).toBe("A")
    expect(regionLetter("PD-F")).toBe("F")
    expect(regionLetter("TA")).toBe("A")
    expect(regionLetter("TB")).toBe("B")
  })
})

describe("the hub tiles", () => {
  it("has one tile per subject in the order of the content, with the subject colour", () => {
    const tiles = hubTiles()
    expect(tiles.map((t) => t.id)).toEqual([...SUBJECT_IDS])
    for (const t of tiles) expect(t.colour).toBe(SUBJECT_COLOURS[t.id])
  })

  it("reads 0 of n for every subject on the real content, and the totals are 147 and 36", () => {
    const tiles = hubTiles()
    expect(tiles.every((t) => t.done === 0 && !t.finished && t.progress === 0)).toBe(true)
    expect(tiles.reduce((a, t) => a + t.total, 0)).toBe(147)
    expect(tiles.reduce((a, t) => a + t.regions, 0)).toBe(36)
    const python = tiles[0]
    expect(python.code).toBe("PY")
    expect(python.name).toBe("Python")
    expect(python.regions).toBe(11)
    expect(python.line).toBe(`0 / ${python.total} finished \u00b7 11 regions`)
  })

  it("counts done items and finishes a subject", () => {
    const part = hubTiles(SMALL_INDEX, factsDone("PY-1"))[0]
    expect(part).toMatchObject({ done: 1, total: 3, finished: false, lineDone: "1 / 3 finished" })
    expect(part.progress).toBeCloseTo(1 / 3)
    const full = hubTiles(SMALL_INDEX, factsDone("PY-1", "PY-2", "PY-3"))[0]
    expect(full).toMatchObject({ done: 3, finished: true, progress: 1, lineDone: "Finished", line: "Finished \u00b7 2 regions" })
  })

  it("says 1 region, not 1 regions", () => {
    expect(hubTiles(SMALL_INDEX)[1].lineRegions).toBe("1 region")
  })

  it("does not call a subject without items finished", () => {
    const empty = buildLearnIndex([{ id: "git", name: "Git", code: "GT", regions: [] }], {}, {})
    expect(hubTiles(empty)[0]).toMatchObject({ total: 0, finished: false, progress: 0 })
  })
})

describe("the subject view", () => {
  it("is null for a subject that the content does not have", () => {
    expect(subjectView("git", SMALL_INDEX)).toBeNull()
  })

  it("lists the regions and item tiles in the order of the content", () => {
    const v = subjectView("python", SMALL_INDEX)
    expect(v).not.toBeNull()
    expect(v?.regions.map((r) => r.key)).toEqual(["python/A", "python/B"])
    expect(v?.regions[0].items.map((i) => i.id)).toEqual(["PY-1", "PY-2"])
    expect(v?.total).toBe(3)
    expect(v?.colour).toBe(SUBJECT_COLOURS.python)
  })

  it("writes the region heading, the idea with a capital letter and the code marked", () => {
    const r = subjectView("python", SMALL_INDEX)?.regions[0]
    expect(r?.heading).toBe("Region A \u00b7 Values")
    expect(r?.idea).toEqual([
      { text: "A program keeps ", code: false },
      { text: "values", code: true },
      { text: " under names.", code: false },
    ])
  })

  it("shows an item title without backticks", () => {
    expect(subjectView("python", SMALL_INDEX)?.regions[0].items[0].title).toBe("Run a file")
  })

  it("shows the short letter of a region whose id has a prefix", () => {
    const r = subjectView("numpy", SMALL_INDEX)?.regions[0]
    expect(r?.letter).toBe("A")
    expect(r?.heading).toBe("Region A \u00b7 Arrays")
  })

  it("counts done items per region and finishes a region", () => {
    const v = subjectView("python", SMALL_INDEX, factsDone("PY-1", "PY-2"))
    expect(v?.done).toBe(2)
    expect(v?.regions[0]).toMatchObject({ done: 2, total: 2, finished: true, progress: 1, count: "Region finished" })
    expect(v?.regions[1]).toMatchObject({ done: 0, total: 1, finished: false, progress: 0, count: "0 / 1 finished" })
    expect(v?.regions[0].items.map((i) => i.done)).toEqual([true, true])
  })

  it("has no done item and no finished region without facts, for every subject of the real content", () => {
    for (const id of SUBJECT_IDS) {
      const v = subjectView(id)
      expect(v).not.toBeNull()
      expect(v?.done).toBe(0)
      for (const r of v?.regions ?? []) {
        expect(r.finished).toBe(false)
        expect(r.count).toBe(`0 / ${r.items.length} finished`)
        expect(r.items.every((i) => !i.done)).toBe(true)
      }
    }
  })

  it("holds all 147 items and 36 regions on the real content, each item once", () => {
    const ids = SUBJECT_IDS.flatMap((id) => subjectView(id)?.regions.flatMap((r) => r.items.map((i) => i.id)) ?? [])
    expect(ids).toHaveLength(147)
    expect(new Set(ids).size).toBe(147)
    expect(SUBJECT_IDS.reduce((a, id) => a + (subjectView(id)?.regions.length ?? 0), 0)).toBe(36)
  })

  it("shows no backtick in any title or region name of the real content, and the first idea letter is a capital", () => {
    for (const id of SUBJECT_IDS) {
      for (const r of subjectView(id)?.regions ?? []) {
        expect(r.name.includes("`")).toBe(false)
        expect(r.idea.length).toBeGreaterThan(0)
        expect(r.idea[0].text.charAt(0)).toBe(r.idea[0].text.charAt(0).toUpperCase())
        for (const i of r.items) expect(i.title.includes("`")).toBe(false)
      }
    }
  })
})

describe("resolveGuideAddress", () => {
  const at = (hash: string) => resolveGuideAddress(parseAddress(hash).guide, SMALL_INDEX)

  it("opens the hub for #guide", () => {
    expect(at("#guide")).toEqual({ view: "hub", hash: "#guide", notice: null })
  })

  it("opens a subject", () => {
    expect(at("#guide/python")).toEqual({ view: "subject", subject: "python", item: null, hash: "#guide/python", notice: null })
  })

  it("opens a subject with an item marked", () => {
    expect(at("#guide/python/PY-2")).toEqual({
      view: "subject",
      subject: "python",
      item: "PY-2",
      hash: "#guide/python/PY-2",
      notice: null,
    })
  })

  it("is lenient with letters and gives the exact address back", () => {
    expect(at("#guide/Python/py-2")).toEqual({ view: "subject", subject: "python", item: "PY-2", hash: "#guide/python/PY-2", notice: null })
    expect(at("#guide/NUMPY")).toMatchObject({ view: "subject", subject: "numpy", hash: "#guide/numpy" })
  })

  it("opens the hub with a notice for a subject that does not exist", () => {
    expect(at("#guide/cobol")).toEqual({ view: "hub", hash: "#guide", notice: 'There is no subject "cobol". These are the subjects.' })
  })

  it("keeps the subject, and says so, for an item that does not exist", () => {
    expect(at("#guide/python/PY-99")).toEqual({
      view: "subject",
      subject: "python",
      item: null,
      hash: "#guide/python",
      notice: 'There is no item "PY-99" in Python.',
    })
  })

  it("does not open an item of another subject", () => {
    const r = at("#guide/python/NP-1")
    expect(r).toMatchObject({ view: "subject", subject: "python", item: null, hash: "#guide/python" })
    expect(r.notice).toBe('There is no item "NP-1" in Python.')
  })

  it("cuts a very long word in the notice", () => {
    const r = at(`#guide/${"x".repeat(60)}`)
    expect(r.notice).toBe(`There is no subject "${"x".repeat(24)}...". These are the subjects.`)
  })

  it("opens the hub, without a notice, when the words are not read by parseAddress", () => {
    expect(at("#guide/py%20thon")).toEqual({ view: "hub", hash: "#guide", notice: null })
  })

  it("never throws, whatever the address", () => {
    const wild = ["", "#", "#guide/", "#guide//", "#guide/python/", "#guide/python/PY-1/more", "#guide/__proto__", "#guide/python/__proto__", "#guide/constructor/toString"]
    for (const hash of wild) expect(() => at(hash)).not.toThrow()
  })

  it("gives an address that resolves to itself", () => {
    for (const hash of ["#guide", "#guide/python", "#guide/python/PY-3", "#guide/NUMPY/np-1", "#guide/cobol", "#guide/python/PY-99"]) {
      const first = at(hash)
      expect(at(first.hash)).toMatchObject({ view: first.view, hash: first.hash, notice: null })
    }
  })

  it("builds the same address as guideHash", () => {
    expect(at("#guide/python/PY-1").hash).toBe(guideHash("python", "PY-1"))
  })

  it("opens every subject and every item of the real content", () => {
    for (const id of SUBJECT_IDS) {
      expect(resolveGuideAddress({ subject: id, item: null })).toMatchObject({ view: "subject", subject: id, notice: null })
    }
    for (const [itemId, found] of LEARN_INDEX.items) {
      expect(resolveGuideAddress({ subject: found.subject, item: itemId.toLowerCase() })).toMatchObject({
        view: "subject",
        subject: found.subject,
        item: itemId,
        notice: null,
      })
    }
  })
})

describe("no facts", () => {
  it("is the default of every function", () => {
    expect(tierTabs()).toEqual(tierTabs(LEARN_INDEX, NO_FACTS))
    expect(hubTiles()).toEqual(hubTiles(LEARN_INDEX, NO_FACTS))
    expect(subjectView("python")).toEqual(subjectView("python", LEARN_INDEX, NO_FACTS))
  })
})
