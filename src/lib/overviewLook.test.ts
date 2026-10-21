/// <reference types="node" />
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  OVERVIEW_ASCII,
  OVERVIEW_INTRO_SECONDS,
  OVERVIEW_PRESETS,
  OVERVIEW_PRESET_NAMES,
} from "./overviewLook"

// AB:OVERVIEW.TESTS:START
// Tests of the look of the Overview background (src/lib/overviewLook.ts). The values of the four presets are written out here again on purpose: they are the values of the React Bits Background Studio, and a change in the file must be a decision, not an accident (CONNECTIONS.md C59).

const library = readFileSync("src/components/GradientASCII.tsx", "utf8")

describe("the four presets of the Studio", () => {
  it("are Atmosphere, Lagoon, Rose and Corona, in the order of the Studio", () => {
    expect([...OVERVIEW_PRESET_NAMES]).toEqual(["atmosphere", "lagoon", "rose", "corona"])
    expect(Object.keys(OVERVIEW_PRESETS).sort()).toEqual([...OVERVIEW_PRESET_NAMES].sort())
  })

  it("have the shape, the colours and the characters of the Studio", () => {
    expect(OVERVIEW_PRESETS.atmosphere).toEqual({ shape: "horizon", colors: ["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"], characters: " =+xX0S8#@" })
    expect(OVERVIEW_PRESETS.lagoon).toEqual({ shape: "pinch", colors: ["#0d9488", "#5eead4", "#f0fdfa"], characters: " .:-=+*#%@" })
    expect(OVERVIEW_PRESETS.rose).toEqual({ shape: "rise", colors: ["#9f1239", "#f43f5e", "#fda4af", "#fff1f2"], characters: " =+xX0S8#@" })
    expect(OVERVIEW_PRESETS.corona).toEqual({ shape: "eclipse", colors: ["#78350f", "#f59e0b", "#fffbeb"], characters: " 01" })
  })

  it.each([...OVERVIEW_PRESET_NAMES])("%s: two to eight colours written as #rrggbb, a known shape, and characters that start with a space", (name) => {
    const preset = OVERVIEW_PRESETS[name]
    expect(preset.colors.length).toBeGreaterThanOrEqual(2)
    expect(preset.colors.length).toBeLessThanOrEqual(8)
    for (const colour of preset.colors) expect(colour).toMatch(/^#[0-9a-f]{6}$/)
    expect(["horizon", "pinch", "rise", "eclipse"]).toContain(preset.shape)
    expect(preset.characters.startsWith(" ")).toBe(true)
    expect(preset.characters.length).toBeGreaterThanOrEqual(3)
  })

  it("do not carry a cell size of their own: the one value of the owner is used for all four", () => {
    for (const name of OVERVIEW_PRESET_NAMES) expect(Object.keys(OVERVIEW_PRESETS[name]).sort()).toEqual(["characters", "colors", "shape"])
  })
})

describe("what the owner changed", () => {
  it("has the cell size 19", () => {
    expect(OVERVIEW_ASCII.cellSize).toBe(19)
  })

  it("is softer than the Studio (0.5) and not past the end of the slider (1)", () => {
    expect(OVERVIEW_ASCII.softness).toBeGreaterThan(0.5)
    expect(OVERVIEW_ASCII.softness).toBeLessThanOrEqual(1)
  })

  it("has no mouse interaction and no click effect, and keeps the intro", () => {
    expect(OVERVIEW_ASCII.mouseInteraction).toBe(false)
    expect(OVERVIEW_ASCII.clickEffect).toBe("none")
    expect(OVERVIEW_ASCII.intro).toBe(true)
  })

  it("sets nothing else: the rest stays at the value of the Studio", () => {
    expect(Object.keys(OVERVIEW_ASCII).sort()).toEqual(["cellSize", "clickEffect", "intro", "mouseInteraction", "softness"])
  })
})

describe("the intro time", () => {
  it("is 2 seconds", () => {
    expect(OVERVIEW_INTRO_SECONDS).toBe(2)
  })

  it("is the same number that the library file uses for its intro (the file was edited, CONNECTIONS.md C59)", () => {
    expect(library).toContain(`const INTRO_SECONDS = ${OVERVIEW_INTRO_SECONDS};`)
  })
})
// AB:OVERVIEW.TESTS:END
