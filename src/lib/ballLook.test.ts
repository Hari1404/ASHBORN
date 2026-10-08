import { describe, expect, it } from "vitest"
import {
  BALL_BLEND_MS,
  BALL_FADE_MS,
  BALL_PALETTES,
  BALL_WHITE,
  ballPaletteIndex,
  ballParticles,
  ballStep,
  ballTargetColour,
  blendHex,
} from "./ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the look of the glowing ball. Run them with: npm test
// The steps of the ball follow the quality cut-offs of timerMaths.ts (they are imported here, not written again), see CONNECTIONS.md C34.

// A started_at text as the database sends it, different for every number.
function seedOf(n: number): string {
  const ms = Date.UTC(2026, 9, 7, 10, 0, 0) + n * 1234567
  return new Date(ms).toISOString().replace("Z", "123+00:00")
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function saturation(hex: string): number {
  const c = channels(hex)
  const max = Math.max(...c)
  return max === 0 ? 0 : (max - Math.min(...c)) / max
}

function distance(a: string, b: string): number {
  const x = channels(a)
  const y = channels(b)
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}

describe("the timing of the ball", () => {
  it("moves to the next colour in 4 seconds and fades out in 0.7 seconds", () => {
    expect(BALL_BLEND_MS).toBe(4000)
    expect(BALL_FADE_MS).toBe(700)
  })
})

describe("the palettes", () => {
  it("has white as the first colour", () => {
    expect(BALL_WHITE).toBe("#ffffff")
  })

  it("has at least four palettes, each with three different colours written as #rrggbb", () => {
    expect(BALL_PALETTES.length).toBeGreaterThanOrEqual(4)
    for (const palette of BALL_PALETTES) {
      expect(palette).toHaveLength(3)
      for (const colour of palette) expect(colour).toMatch(/^#[0-9a-f]{6}$/)
      expect(new Set(palette).size).toBe(3)
    }
  })

  it("has no palette twice", () => {
    const written = BALL_PALETTES.map((p) => p.join(","))
    expect(new Set(written).size).toBe(written.length)
  })

  it("has only bright, vivid colours, so that every colour looks strong on a black screen", () => {
    for (const colour of BALL_PALETTES.flat()) {
      expect(luminance(colour)).toBeGreaterThanOrEqual(0.15)
      expect(saturation(colour)).toBeGreaterThanOrEqual(0.4)
      expect(Math.max(...channels(colour))).toBeGreaterThanOrEqual(224)
    }
  })

  it("moves visibly from white to the first colour and on from step to step", () => {
    for (const palette of BALL_PALETTES) {
      expect(distance(BALL_WHITE, palette[0])).toBeGreaterThanOrEqual(100)
      expect(distance(palette[0], palette[1])).toBeGreaterThanOrEqual(45)
      expect(distance(palette[1], palette[2])).toBeGreaterThanOrEqual(45)
    }
  })
})

describe("the step of the ball", () => {
  it("is 0 below the solid cut-off, 1 from it, 2 from the deep cut-off, 3 from the flow cut-off", () => {
    expect(ballStep(0)).toBe(0)
    expect(ballStep(SOLID_FROM_SECONDS - 1)).toBe(0)
    expect(ballStep(SOLID_FROM_SECONDS)).toBe(1)
    expect(ballStep(DEEP_FROM_SECONDS - 1)).toBe(1)
    expect(ballStep(DEEP_FROM_SECONDS)).toBe(2)
    expect(ballStep(FLOW_FROM_SECONDS - 1)).toBe(2)
    expect(ballStep(FLOW_FROM_SECONDS)).toBe(3)
    expect(ballStep(FLOW_FROM_SECONDS * 10)).toBe(3)
  })

  it("cuts a part of a second off, like the maths does", () => {
    expect(ballStep(SOLID_FROM_SECONDS - 0.5)).toBe(0)
    expect(ballStep(SOLID_FROM_SECONDS + 0.5)).toBe(1)
  })
})

describe("the palette of a session", () => {
  it("is the same for the same seed, and a valid palette number", () => {
    for (let n = 0; n < 50; n++) {
      const index = ballPaletteIndex(seedOf(n))
      expect(index).toBe(ballPaletteIndex(seedOf(n)))
      expect(Number.isInteger(index)).toBe(true)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(BALL_PALETTES.length)
    }
  })

  it("gives an empty seed a valid palette too", () => {
    const index = ballPaletteIndex("")
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(BALL_PALETTES.length)
  })

  it("uses every palette, and none of them much less than the others", () => {
    const counts = new Array<number>(BALL_PALETTES.length).fill(0)
    const total = 600
    for (let n = 0; n < total; n++) counts[ballPaletteIndex(seedOf(n))]++
    const fair = total / BALL_PALETTES.length
    for (const count of counts) {
      expect(count).toBeGreaterThan(fair * 0.5)
      expect(count).toBeLessThan(fair * 1.5)
    }
  })
})

describe("the colour the ball moves towards", () => {
  it("is white until the solid cut-off, whatever the seed", () => {
    for (let n = 0; n < 20; n++) {
      expect(ballTargetColour(0, seedOf(n))).toBe(BALL_WHITE)
      expect(ballTargetColour(SOLID_FROM_SECONDS - 1, seedOf(n))).toBe(BALL_WHITE)
    }
    expect(ballTargetColour(100, "")).toBe(BALL_WHITE)
  })

  it("takes the three colours of the palette of the seed, one per step", () => {
    for (let n = 0; n < 30; n++) {
      const seed = seedOf(n)
      const palette = BALL_PALETTES[ballPaletteIndex(seed)]
      expect(ballTargetColour(SOLID_FROM_SECONDS, seed)).toBe(palette[0])
      expect(ballTargetColour(DEEP_FROM_SECONDS, seed)).toBe(palette[1])
      expect(ballTargetColour(FLOW_FROM_SECONDS, seed)).toBe(palette[2])
      expect(ballTargetColour(FLOW_FROM_SECONDS * 3, seed)).toBe(palette[2])
    }
  })

  it("keeps the colour inside a step the same", () => {
    const seed = seedOf(7)
    expect(ballTargetColour(SOLID_FROM_SECONDS + 1, seed)).toBe(ballTargetColour(DEEP_FROM_SECONDS - 1, seed))
  })

  it("shows the same colours for the same session on every device", () => {
    const seed = "2026-10-07T10:00:00.123456+00:00"
    const first = [SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS].map((s) => ballTargetColour(s, seed))
    const second = [SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS].map((s) => ballTargetColour(s, seed))
    expect(second).toEqual(first)
  })
})

describe("blending two colours", () => {
  it("gives the first colour at 0 and the second at 1", () => {
    expect(blendHex("#102030", "#a0b0c0", 0)).toBe("#102030")
    expect(blendHex("#102030", "#a0b0c0", 1)).toBe("#a0b0c0")
  })

  it("gives the middle colour at one half, rounded to the nearest number", () => {
    expect(blendHex("#000000", "#ffffff", 0.5)).toBe("#808080")
    expect(blendHex("#000000", "#646464", 0.5)).toBe("#323232")
    expect(blendHex("#ff0000", "#0000ff", 0.25)).toBe("#bf0040")
  })

  it("blends each of the three channels on its own", () => {
    expect(blendHex("#ff0000", "#00ff00", 1)).toBe("#00ff00")
    expect(blendHex("#0a0b0c", "#0a0b0c", 0.3)).toBe("#0a0b0c")
    expect(blendHex("#000000", "#0000ff", 0.5)).toBe("#000080")
    expect(blendHex("#000000", "#00ff00", 0.5)).toBe("#008000")
    expect(blendHex("#000000", "#ff0000", 0.5)).toBe("#800000")
  })

  it("cuts a t outside 0 to 1 back to 0 or 1", () => {
    expect(blendHex("#102030", "#a0b0c0", -3)).toBe("#102030")
    expect(blendHex("#102030", "#a0b0c0", 7)).toBe("#a0b0c0")
  })

  it("gives the second colour when t is not a number", () => {
    expect(blendHex("#102030", "#a0b0c0", Number.NaN)).toBe("#a0b0c0")
    expect(blendHex("#102030", "#a0b0c0", Number.POSITIVE_INFINITY)).toBe("#a0b0c0")
  })

  it("accepts capital letters and always answers in small letters", () => {
    expect(blendHex("#FFFFFF", "#ABCDEF", 1)).toBe("#abcdef")
    expect(blendHex("#ABCDEF", "#ABCDEF", 0)).toBe("#abcdef")
  })

  it("gives the second colour as it is when a colour is not written as #rrggbb", () => {
    expect(blendHex("white", "#a0b0c0", 0.5)).toBe("#a0b0c0")
    expect(blendHex("#102030", "red", 0.5)).toBe("red")
    expect(blendHex("#fff", "#000", 0.5)).toBe("#000")
    expect(blendHex("#10203", "#a0b0c0", 0.5)).toBe("#a0b0c0")
  })
})

describe("how many grains of dust the ball draws", () => {
  it("is 15000 for the full look, 6000 for lite level 1 and 3000 for lite level 2", () => {
    expect(ballParticles(0)).toBe(15000)
    expect(ballParticles(1)).toBe(6000)
    expect(ballParticles(2)).toBe(3000)
  })
})
// AB:TIMER.TESTS:END
