import { describe, expect, it } from "vitest"
import {
  BG_FADE_MS,
  BG_LIGHT_FULL_AT_SECONDS,
  BG_LIGHT_START,
  BG_PALETTES,
  BG_SETTINGS,
  bgDrawn,
  bgLight,
  bgPaletteIndex,
  bgRamp,
} from "./backgroundLook"
import { BALL_PALETTES, ballPaletteIndex } from "./ballLook"
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

  it("has no blend time of its own any more: the colours are a plain function of the seconds of the session", async () => {
    const look = await import("./backgroundLook")
    for (const gone of ["BG_BLEND_MS", "bgEase", "bgBlendRamp"]) expect(Object.keys(look)).not.toContain(gone)
  })
})

describe("the settings of the animation", () => {
  it("are the ones the owner chose in the studio", () => {
    expect(BG_SETTINGS.type).toBe("linear")
    expect(BG_SETTINGS.angle).toBe(55)
    expect(BG_SETTINGS.flow).toBe(0.8)
    expect(BG_SETTINGS.speed).toBe(1)
    expect(BG_SETTINGS.scale).toBe(1)
    expect(BG_SETTINGS.softness).toBe(1)
    expect(BG_SETTINGS.silk).toBe(0.35)
    expect(BG_SETTINGS.grainAmount).toBe(0.08)
    expect(BG_SETTINGS.grainSize).toBe(1.2)
  })

  it("keep the grain still and switch the cursor and the start of the library off", () => {
    expect(BG_SETTINGS.grainAnimated).toBe(false)
    expect(BG_SETTINGS.interactive).toBe(false)
    expect(BG_SETTINGS.stir).toBe(0)
    expect(BG_SETTINGS.clickSwirl).toBe(false)
    expect(BG_SETTINGS.intro).toBe(false)
  })

  it("draw one pixel for every pixel of the screen (the library draws its picture at half of that)", () => {
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

// The four looks of the ramp, written here again on purpose: black, then the dark shade and the main colour (the two light places hold the main colour), then the lighter tint, then the whole palette.
function looksOf(p: readonly string[]): string[][] {
  return [
    [p[0], p[0], p[0], p[0], p[0]],
    [p[0], p[1], p[2], p[2], p[2]],
    [p[0], p[1], p[2], p[3], p[3]],
    [...p],
  ]
}
const CUT_OFFS = [0, SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS]

describe("the ramp of the session", () => {
  it("is all black at second 0, so the screen starts black, and is hardly different from black in the first second", () => {
    BG_PALETTES.forEach((palette, index) => {
      expect(bgRamp(0, index)).toEqual([palette[0], palette[0], palette[0], palette[0], palette[0]])
      const black = channels(palette[0])
      for (const colour of bgRamp(1, index)) channels(colour).forEach((value, c) => expect(Math.abs(value - black[c])).toBeLessThanOrEqual(1))
    })
  })

  it("has exactly the look of each colour step at the second of that step, and the whole palette from the flow step on", () => {
    BG_PALETTES.forEach((p, index) => {
      const looks = looksOf(p)
      CUT_OFFS.forEach((at, i) => expect(bgRamp(at, index)).toEqual(looks[i]))
      expect(bgRamp(FLOW_FROM_SECONDS * 4, index)).toEqual([...p])
      expect(bgRamp(Infinity, index)).toEqual([...p])
    })
  })

  it("is on its way between two colour steps: at the middle of the time every colour is in the middle of its two looks, channel by channel", () => {
    BG_PALETTES.forEach((p, index) => {
      const looks = looksOf(p)
      for (let i = 0; i < 3; i++) {
        const ramp = bgRamp((CUT_OFFS[i] + CUT_OFFS[i + 1]) / 2, index)
        ramp.forEach((colour, k) => {
          const a = channels(looks[i][k])
          const b = channels(looks[i + 1][k])
          channels(colour).forEach((value, c) => expect(Math.abs(value - (a[c] + b[c]) / 2)).toBeLessThanOrEqual(1))
        })
      }
    })
  })

  it("has already begun to change long before the first cut-off: at 5 minutes it is no longer black", () => {
    BG_PALETTES.forEach((p, index) => expect(bgRamp(300, index)).not.toEqual(looksOf(p)[0]))
  })

  it("never stands still for 5 minutes before the flow step: the ramp 5 minutes later is always a different ramp", () => {
    BG_PALETTES.forEach((_, index) => {
      for (let s = 0; s + 300 <= FLOW_FROM_SECONDS; s += 60) expect(bgRamp(s + 300, index)).not.toEqual(bgRamp(s, index))
    })
  })

  it("never jumps: two seconds in a row differ by at most one level in every channel (checked for every second of the first 100 minutes, for every palette)", () => {
    BG_PALETTES.forEach((_, index) => {
      let biggest = 0
      for (let s = 0; s < 6000; s++) {
        const a = bgRamp(s, index)
        const b = bgRamp(s + 1, index)
        a.forEach((colour, k) => {
          const x = channels(colour)
          const y = channels(b[k])
          for (let c = 0; c < 3; c++) biggest = Math.max(biggest, Math.abs(x[c] - y[c]))
        })
      }
      expect(biggest).toBeLessThanOrEqual(1)
    })
  })

  it("never has a colour that is lighter than the one after it, and never gets darker while the session goes on (checked every 30 seconds for four hours for every palette; half a level of brightness is allowed for the rounding of the channels)", () => {
    const ROUNDING = 0.5
    BG_PALETTES.forEach((_, index) => {
      let before = bgRamp(0, index)
      for (let s = 30; s <= 4 * 3600; s += 30) {
        const now = bgRamp(s, index)
        for (let i = 1; i < now.length; i++) expect(luma(now[i])).toBeGreaterThanOrEqual(luma(now[i - 1]) - ROUNDING)
        for (let i = 0; i < now.length; i++) expect(luma(now[i])).toBeGreaterThanOrEqual(luma(before[i]) - ROUNDING)
        before = now
      }
      expect(luma(bgRamp(FLOW_FROM_SECONDS, index)[4])).toBeGreaterThan(luma(bgRamp(DEEP_FROM_SECONDS, index)[4]))
    })
  })

  it("always starts with the black of the palette and has five colours", () => {
    BG_PALETTES.forEach((p, index) => {
      for (const seconds of [0, 1, 300, SOLID_FROM_SECONDS, 1200, DEEP_FROM_SECONDS, 3600, FLOW_FROM_SECONDS, FLOW_FROM_SECONDS * 3]) {
        const ramp = bgRamp(seconds, index)
        expect(ramp).toHaveLength(5)
        expect(ramp[0]).toBe(p[0])
        for (const colour of ramp) expect(colour).toMatch(HEX)
      }
    })
  })

  it("gives a whole ramp for numbers that are not seconds or not palettes", () => {
    for (const odd of [Number.NaN, -1, -Infinity]) expect(bgRamp(odd, 0)).toEqual(bgRamp(0, 0))
    for (const odd of [-1, 6, 2.5, Number.NaN]) expect(bgRamp(0, odd)).toEqual(bgRamp(0, 0))
    expect(bgRamp(Infinity, 1)).toHaveLength(5)
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
