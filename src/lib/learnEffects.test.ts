import { describe, expect, it } from "vitest"
import { SUBJECT_IDS } from "../data/learn/subjectColours"
import {
  CHAR_STAGGER_MS,
  EFFECT_DURATION_MS,
  EFFECT_EASING,
  EFFECT_FRAMES,
  HUB_EFFECT,
  POP_SPREAD_MS,
  SCRAMBLE_FIRST_MS,
  SCRAMBLE_GLYPHS,
  SCRAMBLE_STEP_MS,
  SUBJECT_EFFECT,
  TYPE_STEP_MS,
  effectEndMs,
  effectPlan,
  letterCount,
  scrambleShown,
  titleWords,
  type EffectKind,
} from "./learnEffects"

// The title effects of the Learn screen (Packet 12B, chunk 3): which effect each subject has, when each letter arrives
// and what a scrambling letter shows. All on plain numbers, with a fake random function.
const ALL_KINDS: EffectKind[] = ["blur", "rise", "drop", "skew", "pop", "scramble", "type"]

describe("which effect each subject has", () => {
  it("gives every subject exactly one effect", () => {
    expect(Object.keys(SUBJECT_EFFECT).sort()).toEqual([...SUBJECT_IDS].sort())
  })

  it("uses the effects of the preview page", () => {
    expect(SUBJECT_EFFECT).toEqual({
      python: "blur",
      numpy: "rise",
      pandas: "drop",
      la: "skew",
      prob: "pop",
      git: "scramble",
      terminal: "type",
    })
  })

  it("gives no two subjects the same effect, and the hub the effect of Python", () => {
    expect(new Set(Object.values(SUBJECT_EFFECT)).size).toBe(SUBJECT_IDS.length)
    expect(HUB_EFFECT).toBe(SUBJECT_EFFECT.python)
  })

  it("plays each letter for 700 ms with the easing of the preview, and scrambles with these glyphs", () => {
    expect(EFFECT_DURATION_MS).toBe(700)
    expect(POP_SPREAD_MS).toBe(700)
    expect(EFFECT_EASING).toBe("cubic-bezier(.23,1,.32,1)")
    expect(SCRAMBLE_GLYPHS).toBe("01{}<>/#=")
  })

  it("has a first and a last picture for the five effects that animate, ending in the normal look", () => {
    for (const kind of ["blur", "rise", "drop", "skew", "pop"] as const) {
      const [from, to] = EFFECT_FRAMES[kind]
      expect(from.opacity).toBe(0)
      expect(to.opacity).toBe(1)
      expect(to.transform).toBe("none")
    }
    expect(EFFECT_FRAMES.blur[1].filter).toBe("blur(0)")
  })
})

describe("titleWords", () => {
  it("splits a title into words and letters", () => {
    expect(titleWords("Linear algebra")).toEqual([Array.from("Linear"), Array.from("algebra")])
  })

  it("ignores extra spaces and gives nothing for an empty title", () => {
    expect(titleWords("  a   b ")).toEqual([["a"], ["b"]])
    expect(titleWords("")).toEqual([])
    expect(titleWords("   ")).toEqual([])
  })

  it("keeps a letter made of two code units whole", () => {
    expect(titleWords("a\u{1F600}")).toEqual([["a", "\u{1F600}"]])
  })

  it("counts the letters", () => {
    expect(letterCount(titleWords("Linear algebra"))).toBe(13)
    expect(letterCount([])).toBe(0)
  })
})

describe("effectPlan", () => {
  it("is a still picture with the words when motion is reduced, for every effect", () => {
    for (const kind of ALL_KINDS) {
      expect(effectPlan(kind, "Python", { reduced: true })).toEqual({ mode: "still", words: [Array.from("Python")] })
    }
  })

  it("starts each letter 50 ms after the one before for blur, rise, drop and skew", () => {
    for (const kind of ["blur", "rise", "drop", "skew"] as const) {
      const plan = effectPlan(kind, "Ab Cd", { reduced: false })
      expect(plan.mode).toBe("animate")
      if (plan.mode !== "animate") return
      expect(plan.delays).toEqual([0, 50, 100, 150])
      expect(plan.frames).toBe(EFFECT_FRAMES[kind])
      expect(plan.durationMs).toBe(EFFECT_DURATION_MS)
      expect(plan.easing).toBe(EFFECT_EASING)
    }
    expect(CHAR_STAGGER_MS).toBe(50)
  })

  it("adds the base delay to every letter", () => {
    const plan = effectPlan("rise", "abc", { reduced: false, baseMs: 400 })
    if (plan.mode !== "animate") throw new Error("not animate")
    expect(plan.delays).toEqual([400, 450, 500])
  })

  it("pops each letter at a random moment inside 700 ms", () => {
    const low = effectPlan("pop", "abc", { reduced: false, rand: () => 0 })
    const mid = effectPlan("pop", "abc", { reduced: false, baseMs: 100, rand: () => 0.5 })
    const seq = [0.1, 0.9, 0.5]
    let i = 0
    const varied = effectPlan("pop", "abc", { reduced: false, rand: () => seq[i++] })
    if (low.mode !== "animate" || mid.mode !== "animate" || varied.mode !== "animate") throw new Error("not animate")
    expect(low.delays).toEqual([0, 0, 0])
    expect(mid.delays).toEqual([450, 450, 450])
    expect(varied.delays).toEqual([0.1 * POP_SPREAD_MS, 0.9 * POP_SPREAD_MS, 0.5 * POP_SPREAD_MS])
    expect(varied.frames).toBe(EFFECT_FRAMES.pop)
  })

  it("types one letter every 80 ms", () => {
    const plan = effectPlan("type", "ab c", { reduced: false, baseMs: 10 })
    expect(plan).toEqual({ mode: "type", words: [["a", "b"], ["c"]], delays: [10, 90, 170], stepMs: TYPE_STEP_MS })
    expect(TYPE_STEP_MS).toBe(80)
  })

  it("settles the letters of a scramble at 300 ms, then every 70 ms", () => {
    const plan = effectPlan("scramble", "abc", { reduced: false, baseMs: 20 })
    expect(plan).toEqual({ mode: "scramble", words: [["a", "b", "c"]], settleAt: [320, 390, 460] })
    expect(SCRAMBLE_FIRST_MS).toBe(300)
    expect(SCRAMBLE_STEP_MS).toBe(70)
  })

  it("plans no letters for an empty title", () => {
    for (const kind of ALL_KINDS) {
      const plan = effectPlan(kind, "", { reduced: false })
      expect(plan.words).toEqual([])
      expect(effectEndMs(plan)).toBe(0)
    }
  })

  it("plans one delay per letter across words, for every effect and every subject title", () => {
    for (const kind of ALL_KINDS) {
      const plan = effectPlan(kind, "Probability and chance", { reduced: false })
      const n = letterCount(plan.words)
      expect(n).toBe(20)
      if (plan.mode === "animate" || plan.mode === "type") expect(plan.delays).toHaveLength(n)
      if (plan.mode === "scramble") expect(plan.settleAt).toHaveLength(n)
    }
  })
})

describe("effectEndMs", () => {
  it("is 0 for a still plan", () => {
    expect(effectEndMs(effectPlan("blur", "abc", { reduced: true }))).toBe(0)
  })

  it("is the last start plus the duration for an animation", () => {
    expect(effectEndMs(effectPlan("blur", "abc", { reduced: false }))).toBe(100 + EFFECT_DURATION_MS)
  })

  it("is the last letter for typing and for a scramble", () => {
    expect(effectEndMs(effectPlan("type", "abc", { reduced: false }))).toBe(160)
    expect(effectEndMs(effectPlan("scramble", "abc", { reduced: false }))).toBe(440)
  })
})

describe("scrambleShown", () => {
  const letters = Array.from("git")
  const settleAt = [300, 370, 440]

  it("shows only glyphs before the first letter settles", () => {
    const { shown, done } = scrambleShown(letters, settleAt, 0, () => 0)
    expect(shown).toEqual([SCRAMBLE_GLYPHS[0], SCRAMBLE_GLYPHS[0], SCRAMBLE_GLYPHS[0]])
    expect(done).toBe(false)
  })

  it("settles the letters one after the other", () => {
    expect(scrambleShown(letters, settleAt, 300, () => 0).shown).toEqual(["g", SCRAMBLE_GLYPHS[0], SCRAMBLE_GLYPHS[0]])
    expect(scrambleShown(letters, settleAt, 370, () => 0).shown).toEqual(["g", "i", SCRAMBLE_GLYPHS[0]])
    const end = scrambleShown(letters, settleAt, 440, () => 0)
    expect(end.shown).toEqual(letters)
    expect(end.done).toBe(true)
  })

  it("is not done while one letter is still scrambling", () => {
    expect(scrambleShown(letters, settleAt, 439, () => 0).done).toBe(false)
  })

  it("only ever shows glyphs of the set, even for a random value of exactly 1", () => {
    for (const r of [0, 0.25, 0.5, 0.999, 1]) {
      const { shown } = scrambleShown(letters, settleAt, 0, () => r)
      for (const ch of shown) expect(SCRAMBLE_GLYPHS.includes(ch)).toBe(true)
    }
  })

  it("picks the glyph that the random number points at, and wraps a random number of exactly 1", () => {
    const one = (r: number) => scrambleShown(["a"], [100], 0, () => r).shown[0]
    expect(one(0)).toBe("0")
    expect(one(0.5)).toBe("<")
    expect(one(0.999)).toBe("=")
    expect(one(1)).toBe("0")
  })

  it("is done at once for a title with no letters, and treats a missing settle time as settled", () => {
    expect(scrambleShown([], [], 0)).toEqual({ shown: [], done: true })
    expect(scrambleShown(["a"], [], 0).shown).toEqual(["a"])
  })

  it("never lets the number of scrambling letters grow as time passes", () => {
    let last = Infinity
    for (let t = 0; t <= 600; t += 25) {
      const scrambling = scrambleShown(letters, settleAt, t, () => 0).shown.filter((c, i) => c !== letters[i]).length
      expect(scrambling).toBeLessThanOrEqual(last)
      last = scrambling
    }
  })
})
