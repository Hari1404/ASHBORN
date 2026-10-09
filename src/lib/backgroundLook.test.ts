import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  BG_COLOUR,
  BG_FADE_MS,
  BG_LIGHT_FULL_AT_SECONDS,
  BG_LIGHT_START,
  BG_SETTINGS,
  bgDrawn,
  bgLight,
} from "./backgroundLook"
import { FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the look of the moving background. Run them with: npm test
// The colours and the colour steps of the background are the ones of the glowing ball (ballLook.ts), they are tested in ballLook.test.ts and TimerBackground.test.tsx.

describe("the colour given to the library", () => {
  it("is white, because the tint layer multiplies it: white times a colour is that colour", () => {
    expect(BG_COLOUR).toBe("#ffffff")
  })
})

describe("the timing of the background", () => {
  it("fades out in 0.7 seconds", () => {
    expect(BG_FADE_MS).toBe(700)
  })
})

describe("the settings of the animation", () => {
  it("are the ones the owner chose on the React Bits page", () => {
    expect(BG_SETTINGS.speed).toBe(2.9)
    expect(BG_SETTINGS.tilt).toBe(13)
    expect(BG_SETTINGS.intensity).toBe(2.8)
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

describe("the light of the rays grows with the session", () => {
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

  it("grows in a straight line: halfway through the time the light is halfway between the start light and full", () => {
    expect(bgLight(BG_LIGHT_FULL_AT_SECONDS / 2)).toBeCloseTo((BG_LIGHT_START + 1) / 2, 10)
  })

  it("never gets dimmer while the session goes on (checked every minute, also after the light is full)", () => {
    let before = bgLight(0)
    for (let s = 60; s <= BG_LIGHT_FULL_AT_SECONDS + 3600; s += 60) {
      const now = bgLight(s)
      expect(now).toBeGreaterThanOrEqual(before)
      before = now
    }
  })

  it("is brighter after the first colour step than at the start, and not yet full just before the last colour step", () => {
    expect(bgLight(SOLID_FROM_SECONDS)).toBeGreaterThan(bgLight(0))
    expect(bgLight(BG_LIGHT_FULL_AT_SECONDS - 1)).toBeLessThan(1)
  })

  it("stays between the start light and 1 for every number, also for numbers that are not seconds", () => {
    for (const odd of [Number.NaN, -1, -Infinity, 0.5, 1e12, Infinity]) {
      const light = bgLight(odd)
      expect(light).toBeGreaterThanOrEqual(BG_LIGHT_START)
      expect(light).toBeLessThanOrEqual(1)
    }
    expect(bgLight(Number.NaN)).toBe(BG_LIGHT_START)
    expect(bgLight(-1)).toBe(BG_LIGHT_START)
    expect(bgLight(Infinity)).toBe(1)
  })
})

describe("the growing light is drawn by a black layer over the rays, never by the library", () => {
  const source = readFileSync("src/components/TimerBackground.tsx", "utf8")
  const css = readFileSync("src/timer.css", "utf8")
  const block = (selector: string): string => {
    const start = css.indexOf(selector + " {")
    expect(start).toBeGreaterThan(-1)
    return css.slice(start, css.indexOf("}", start))
  }

  it("lays the black layer after the tint layer, with an opacity of 1 minus the light of the session", () => {
    const tint = source.indexOf("<Tint target={target} />")
    const dim = source.indexOf('<div className="ab-timer-bg-dim" style={{ opacity: 1 - light }} />')
    expect(tint).toBeGreaterThan(-1)
    expect(dim).toBeGreaterThan(tint)
  })

  it("gives the library the same intensity all the time, because a new intensity makes it build its whole drawing again", () => {
    const rays = /<SideRays[\s\S]*?\/>/.exec(source)?.[0] ?? ""
    expect(rays).toContain("intensity={BG_SETTINGS.intensity}")
    expect(rays).not.toContain("bgLight")
    expect(rays).not.toContain("seconds")
    expect(rays).not.toContain("light")
  })

  it("keeps the light of the last moment while the background fades out, the same way as the colour (the seconds are 0 then)", () => {
    expect(source).toContain("const light = bgLight(seconds)")
    expect(source).toContain("if (active && heldLight !== light) setHeldLight(light)")
    expect(source).toContain("light={active ? light : heldLight}")
  })

  it("makes the black layer cover the whole box, plain black, above the tint layer, and never catching a tap", () => {
    const dim = block(".ab-timer-bg-dim")
    expect(dim).toContain("position: absolute;")
    expect(dim).toContain("inset: 0;")
    expect(dim).toContain("background: #000;")
    expect(dim).toContain("pointer-events: none;")
    const dimZ = Number(/z-index:\s*(\d+);/.exec(dim)?.[1])
    const tintZ = Number(/z-index:\s*(\d+);/.exec(block(".ab-timer-bg-tint"))?.[1])
    expect(tintZ).toBeGreaterThan(0)
    expect(dimZ).toBeGreaterThan(tintZ)
  })
})
// AB:TIMER.TESTS:END
