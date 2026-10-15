import { describe, expect, it } from "vitest"
import {
  BG_BLEND_MS,
  BG_FADE_MS,
  BG_LIGHT_FULL_AT_SECONDS,
  BG_LIGHT_START,
  BG_PALETTES,
  BG_SETTINGS,
  bgBlendRamp,
  bgDrawn,
  bgEase,
  bgLight,
  bgPaletteIndex,
  bgRamp,
} from "./backgroundLook"
import { BALL_BLEND_MS, BALL_PALETTES, ballPaletteIndex } from "./ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the look of the moving background. Run them with: npm test
// The quality steps (10, 30 and 90 minutes) are the ones of the glowing ball (ballLook.ts, timerMaths.ts), they are tested in ballLook.test.ts and timerMaths.test.ts. How the screen uses the ramp is tested in TimerBackground.test.tsx.

const HEX = /^#[0-9a-f]{6}$/
const SEEDS = ["2026-10-07T10:00:00.123456+00:00", "2026-10-08T07:00:00.000001+00:00", "2026-10-09T18:30:12.987654+00:00", ""]

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

// How bright a colour is (the usual weights of red, green and blue).
function luma(hex: string): number {
  const [r, g, b] = channels(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

describe("the timing of the background", () => {
  it("fades out in 0.7 seconds", () => {
    expect(BG_FADE_MS).toBe(700)
  })

  it("moves from one colour step to the next in 12 seconds, which is slower than the 4 seconds of the glowing ball", () => {
    expect(BG_BLEND_MS).toBe(12000)
    expect(BG_BLEND_MS).toBeGreaterThan(BALL_BLEND_MS)
  })
})

describe("the settings of the animation", () => {
  it("are the ones the owner chose in the studio", () => {
    expect(BG_SETTINGS.angle).toBe(55)
    expect(BG_SETTINGS.flow).toBe(0.8)
    expect(BG_SETTINGS.speed).toBe(1)
    expect(BG_SETTINGS.scale).toBe(1)
    expect(BG_SETTINGS.softness).toBe(1)
    expect(BG_SETTINGS.silk).toBe(0.35)
    expect(BG_SETTINGS.grainAmount).toBe(0.08)
    expect(BG_SETTINGS.grainSize).toBe(1.2)
  })

  it("are only the settings the background canvas has: nothing for the cursor, a click, a touch or a start (the canvas cannot listen to them, and its grain always stands still)", () => {
    expect(Object.keys(BG_SETTINGS).sort()).toEqual(["angle", "dpr", "flow", "grainAmount", "grainSize", "scale", "silk", "softness", "speed"])
  })

  it("draw one pixel for every pixel of the screen", () => {
    expect(BG_SETTINGS.dpr).toBe(1)
  })
})

describe("the palettes", () => {
  it("are six, one for every palette of the glowing ball, in the same order", () => {
    expect(BG_PALETTES).toHaveLength(6)
    expect(BG_PALETTES).toHaveLength(BALL_PALETTES.length)
  })

  it("have five colours each, written as #rrggbb in small letters, and no colour twice in a palette", () => {
    for (const palette of BG_PALETTES) {
      expect(palette).toHaveLength(5)
      for (const colour of palette) expect(colour).toMatch(HEX)
      expect(new Set(palette).size).toBe(5)
    }
  })

  it("start with a black: no channel of the first colour is above 12 of 255", () => {
    for (const palette of BG_PALETTES) {
      for (const value of channels(palette[0])) expect(value).toBeLessThanOrEqual(12)
    }
  })

  it("get lighter at every colour, so the last colour is the lightest and no step goes back", () => {
    for (const palette of BG_PALETTES) {
      for (let i = 1; i < palette.length; i++) expect(luma(palette[i])).toBeGreaterThan(luma(palette[i - 1]))
    }
  })

  it("keep the rust of the owner's Fire ramp exactly, as the main colour of the first palette", () => {
    expect(BG_PALETTES[0][2]).toBe("#9a3412")
  })
})

describe("which palette a session gets", () => {
  it("is the palette of the glowing ball of the same session, so the two are of the same colour family", () => {
    for (const seed of SEEDS) expect(bgPaletteIndex(seed)).toBe(ballPaletteIndex(seed))
  })

  it("is always a real palette, and the same one for the same session", () => {
    for (let i = 0; i < 200; i++) {
      const seed = "2026-10-" + String(1 + (i % 28)).padStart(2, "0") + "T" + String(i % 24).padStart(2, "0") + ":00:00." + String(i * 7919).padStart(6, "0") + "+00:00"
      const index = bgPaletteIndex(seed)
      expect(Number.isInteger(index)).toBe(true)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(BG_PALETTES.length)
      expect(bgPaletteIndex(seed)).toBe(index)
    }
  })

  it("can be every one of the six palettes", () => {
    const seen = new Set<number>()
    for (let i = 0; i < 300; i++) seen.add(bgPaletteIndex("2026-10-07T10:00:" + String(i).padStart(2, "0") + "." + String(i * 104729).padStart(6, "0") + "+00:00"))
    expect(seen.size).toBe(6)
  })
})

describe("the ramp of the session", () => {
  it("is all black before the first colour step, so the screen is black", () => {
    BG_PALETTES.forEach((palette, index) => {
      for (const seconds of [0, 1, 60, SOLID_FROM_SECONDS - 1]) {
        expect(bgRamp(seconds, index)).toEqual([palette[0], palette[0], palette[0], palette[0], palette[0]])
      }
    })
  })

  it("brings in the dark shade and the main colour at the solid step, and the light end holds the main colour", () => {
    BG_PALETTES.forEach((p, index) => {
      expect(bgRamp(SOLID_FROM_SECONDS, index)).toEqual([p[0], p[1], p[2], p[2], p[2]])
      expect(bgRamp(DEEP_FROM_SECONDS - 1, index)).toEqual([p[0], p[1], p[2], p[2], p[2]])
    })
  })

  it("brings in the lighter tint at the deep step", () => {
    BG_PALETTES.forEach((p, index) => {
      expect(bgRamp(DEEP_FROM_SECONDS, index)).toEqual([p[0], p[1], p[2], p[3], p[3]])
      expect(bgRamp(FLOW_FROM_SECONDS - 1, index)).toEqual([p[0], p[1], p[2], p[3], p[3]])
    })
  })

  it("brings in the lightest tint at the flow step, and keeps the whole palette from then on", () => {
    BG_PALETTES.forEach((p, index) => {
      expect(bgRamp(FLOW_FROM_SECONDS, index)).toEqual([...p])
      expect(bgRamp(FLOW_FROM_SECONDS * 4, index)).toEqual([...p])
    })
  })

  it("never has a colour that is lighter than the one after it, and never loses a colour while the session goes on (checked every minute for every palette)", () => {
    BG_PALETTES.forEach((_, index) => {
      let before = bgRamp(0, index)
      for (let minute = 1; minute <= 240; minute++) {
        const now = bgRamp(minute * 60, index)
        for (let i = 1; i < now.length; i++) expect(luma(now[i])).toBeGreaterThanOrEqual(luma(now[i - 1]))
        for (let i = 0; i < now.length; i++) expect(luma(now[i])).toBeGreaterThanOrEqual(luma(before[i]))
        before = now
      }
    })
  })

  it("always starts with the black of the palette and has five colours", () => {
    BG_PALETTES.forEach((p, index) => {
      for (const seconds of [0, SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS]) {
        const ramp = bgRamp(seconds, index)
        expect(ramp).toHaveLength(5)
        expect(ramp[0]).toBe(p[0])
      }
    })
  })

  it("gives a whole ramp for numbers that are not seconds or not palettes", () => {
    for (const odd of [Number.NaN, -1, -Infinity]) expect(bgRamp(odd, 0)).toEqual(bgRamp(0, 0))
    for (const odd of [-1, 6, 2.5, Number.NaN]) expect(bgRamp(0, odd)).toEqual(bgRamp(0, 0))
    expect(bgRamp(Infinity, 1)).toHaveLength(5)
  })
})

describe("how far the colours have moved", () => {
  it("is exactly 0 at the start and exactly 1 when it has arrived", () => {
    expect(bgEase(0)).toBe(0)
    expect(bgEase(1)).toBe(1)
    expect(bgEase(0.5)).toBe(0.5)
  })

  it("is slow at the start and at the end and fast in the middle", () => {
    expect(bgEase(0.25)).toBeLessThan(0.25)
    expect(bgEase(0.1)).toBeLessThan(0.1)
    expect(bgEase(0.75)).toBeGreaterThan(0.75)
    expect(bgEase(0.9)).toBeGreaterThan(0.9)
    expect(bgEase(0.25)).toBeCloseTo(0.15625, 10)
  })

  it("never goes backwards (checked in a thousand steps)", () => {
    let before = bgEase(0)
    for (let i = 1; i <= 1000; i++) {
      const now = bgEase(i / 1000)
      expect(now).toBeGreaterThanOrEqual(before)
      before = now
    }
  })

  it("cuts a progress outside 0 to 1 to the ends, and counts a progress that is not a number as arrived", () => {
    expect(bgEase(-3)).toBe(0)
    expect(bgEase(7)).toBe(1)
    expect(bgEase(Number.NaN)).toBe(1)
    expect(bgEase(Infinity)).toBe(1)
  })
})

describe("the colours on the way from one ramp to another", () => {
  const FROM = ["#000000", "#102030", "#204060", "#406080", "#6080a0"]
  const TO = ["#000000", "#ffffff", "#204060", "#ff8000", "#6080a0"]

  it("gives the old ramp at progress 0 and the new ramp, exactly as written, at progress 1", () => {
    expect(bgBlendRamp(FROM, TO, 0)).toEqual(FROM)
    expect(bgBlendRamp(FROM, TO, 1)).toEqual(TO)
  })

  it("is in the middle of every colour at half the time (the ease is 0.5 there), channel by channel", () => {
    const half = bgBlendRamp(FROM, TO, 0.5)
    expect(half).toHaveLength(5)
    for (let i = 0; i < 5; i++) {
      const a = channels(FROM[i])
      const b = channels(TO[i])
      channels(half[i]).forEach((value, c) => expect(Math.abs(value - (a[c] + b[c]) / 2)).toBeLessThanOrEqual(1))
    }
  })

  it("leaves a colour that does not change where it is, at every progress", () => {
    for (const progress of [0, 0.2, 0.5, 0.8, 1]) {
      const ramp = bgBlendRamp(FROM, TO, progress)
      expect(ramp[0]).toBe("#000000")
      expect(ramp[2]).toBe("#204060")
      expect(ramp[4]).toBe("#6080a0")
    }
  })

  it("keeps every colour between its old and its new value, and comes closer all the time", () => {
    let before = Infinity
    for (let i = 0; i <= 20; i++) {
      const ramp = bgBlendRamp(FROM, TO, i / 20)
      const away = Math.hypot(...channels(ramp[1]).map((v, c) => v - channels(TO[1])[c]))
      expect(away).toBeLessThanOrEqual(before)
      before = away
      for (let k = 0; k < 5; k++) {
        const a = channels(FROM[k])
        const b = channels(TO[k])
        channels(ramp[k]).forEach((value, c) => {
          expect(value).toBeGreaterThanOrEqual(Math.min(a[c], b[c]))
          expect(value).toBeLessThanOrEqual(Math.max(a[c], b[c]))
        })
      }
    }
    expect(before).toBe(0)
  })

  it("is slower than a straight line at the start: a quarter of the way in, a colour has moved less than a quarter", () => {
    const quarter = channels(bgBlendRamp(["#000000"], ["#ffffff"], 0.25)[0])[0]
    expect(quarter).toBeLessThan(0.25 * 255)
    expect(quarter).toBeGreaterThan(0)
  })

  it("takes the new colour as it is when the old ramp has fewer colours than the new one", () => {
    expect(bgBlendRamp(["#000000"], ["#000000", "#ff0000"], 0.3)[1]).toBe("#ff0000")
  })
})

describe("where the background is drawn", () => {
  it("is drawn for the full look and for lite level 1, and not at lite level 2", () => {
    expect(bgDrawn(0)).toBe(true)
    expect(bgDrawn(1)).toBe(true)
    expect(bgDrawn(2)).toBe(false)
  })

  it("never draws at a lighter level what a heavier level does not draw", () => {
    for (const level of [1, 2] as const) {
      if (!bgDrawn((level - 1) as 0 | 1)) expect(bgDrawn(level)).toBe(false)
    }
  })
})

// The light of the old rays. The screen does not use it any more; the tests of the lines still check what some lines say about it, until the lines are rewritten (Packet 08B) and this part is removed.
describe("the light of the old rays (kept only for the tests of the lines, until Packet 08B)", () => {
  it("starts dim and not dark: the light at second 0 is the start light, which is between 0 and 1", () => {
    expect(bgLight(0)).toBe(BG_LIGHT_START)
    expect(BG_LIGHT_START).toBeGreaterThan(0)
    expect(BG_LIGHT_START).toBeLessThan(1)
  })

  it("is full at the time of the last colour step and stays full after it", () => {
    expect(BG_LIGHT_FULL_AT_SECONDS).toBe(FLOW_FROM_SECONDS)
    expect(bgLight(FLOW_FROM_SECONDS)).toBe(1)
    expect(bgLight(FLOW_FROM_SECONDS * 4)).toBe(1)
  })

  it("grows in a straight line and never gets dimmer", () => {
    expect(bgLight(BG_LIGHT_FULL_AT_SECONDS / 2)).toBeCloseTo((BG_LIGHT_START + 1) / 2, 10)
    let before = bgLight(0)
    for (let s = 60; s <= BG_LIGHT_FULL_AT_SECONDS + 3600; s += 60) {
      const now = bgLight(s)
      expect(now).toBeGreaterThanOrEqual(before)
      before = now
    }
  })

  it("stays between the start light and 1 for every number, also for numbers that are not seconds", () => {
    for (const odd of [Number.NaN, -1, -Infinity, 0.5, 1e12, Infinity]) {
      const light = bgLight(odd)
      expect(light).toBeGreaterThanOrEqual(BG_LIGHT_START)
      expect(light).toBeLessThanOrEqual(1)
    }
  })
})
// AB:TIMER.TESTS:END
