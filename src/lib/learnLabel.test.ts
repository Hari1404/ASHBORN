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
