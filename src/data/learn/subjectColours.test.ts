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
