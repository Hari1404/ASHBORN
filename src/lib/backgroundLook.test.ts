import { describe, expect, it } from "vitest"
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgBallCount } from "./backgroundLook"

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
    expect(BG_SETTINGS.speed).toBe(0.5)
    expect(BG_SETTINGS.animationSize).toBe(27)
    expect(BG_SETTINGS.hoverSmoothness).toBe(0.141)
    expect(BG_SETTINGS.cursorBallSize).toBe(4)
    expect(BG_SETTINGS.enableMouseInteraction).toBe(false)
  })
})

describe("how many balls the background draws", () => {
  it("is 21 for the full look, 10 for lite level 1 and none for lite level 2", () => {
    expect(bgBallCount(0)).toBe(21)
    expect(bgBallCount(1)).toBe(10)
    expect(bgBallCount(2)).toBe(0)
  })

  it("never gives more balls to a lighter level, and always a whole number the library can take (at most 50)", () => {
    for (const level of [0, 1, 2] as const) {
      expect(Number.isInteger(bgBallCount(level))).toBe(true)
      expect(bgBallCount(level)).toBeGreaterThanOrEqual(0)
      expect(bgBallCount(level)).toBeLessThanOrEqual(50)
    }
    expect(bgBallCount(1)).toBeLessThanOrEqual(bgBallCount(0))
    expect(bgBallCount(2)).toBeLessThanOrEqual(bgBallCount(1))
  })
})
// AB:TIMER.TESTS:END
