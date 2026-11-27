import { describe, expect, it } from "vitest"
import { SPOT_ATTRIBUTE, SPOT_SCROLLING_ATTRIBUTE, SPOT_SCROLL_IDLE_MS, SPOT_TILT_DEG, SPOT_TILT_VALUE, SPOT_VARS, spotlightVars, type SpotRect } from "./learnSpotlight"

// The glow and the tilt of a Learn tile (Packet 12B, chunk 4): where the pointer is inside a tile, as the four css variables.
// A tile 200 wide and 100 high, whose top left corner is at (100, 50) on the screen, with no scale.
const TILE: SpotRect = { left: 100, top: 50, width: 200, height: 100 }

describe("the names", () => {
  it("writes four css variables of the Learn screen and marks a tile with data-spot", () => {
    expect(SPOT_VARS).toEqual({ x: "--ab-learn-mx", y: "--ab-learn-my", rotateX: "--ab-learn-rot-x", rotateY: "--ab-learn-rot-y" })
    expect(SPOT_ATTRIBUTE).toBe("data-spot")
    expect(SPOT_TILT_VALUE).toBe("tilt")
  })

  it("tilts a tile 10 degrees from one edge to the other", () => {
    expect(SPOT_TILT_DEG).toBe(10)
  })

  it("marks the root with data-scrolling while the page scrolls, and takes it off 120 ms after the last scroll", () => {
    expect(SPOT_SCROLLING_ATTRIBUTE).toBe("data-scrolling")
    expect(SPOT_SCROLL_IDLE_MS).toBe(120)
  })
})

describe("spotlightVars: the glow", () => {
  it("puts the glow where the pointer is, in pixels from the corner of the tile", () => {
    expect(spotlightVars(TILE, 200, 130, 60, false)).toEqual({ x: "30px", y: "10px", rotateX: null, rotateY: null })
  })

  it("gives the same for the middle, the corners and the edges as the box says", () => {
    expect(spotlightVars(TILE, 200, 100, 50, false)).toMatchObject({ x: "0px", y: "0px" })
    expect(spotlightVars(TILE, 200, 300, 150, false)).toMatchObject({ x: "200px", y: "100px" })
  })

  it("turns the place back into the pixels of the tile when the page is scaled", () => {
    // The page is scaled 1.2 times: the tile is 200 wide before the scale and the box says 240. 120 pixels into the box is 100 into the tile.
    const scaled: SpotRect = { left: 100, top: 50, width: 240, height: 120 }
    expect(spotlightVars(scaled, 200, 220, 110, false)).toMatchObject({ x: "100px", y: "50px" })
  })

  it("leaves the scale at 1 when the tile reports no width of its own", () => {
    expect(spotlightVars(TILE, 0, 130, 60, false)).toMatchObject({ x: "30px", y: "10px" })
  })

  it("rounds to two decimals, so no long number is written into a style", () => {
    expect(spotlightVars(TILE, 200, 100 + 100 / 3, 50 + 200 / 3, false)).toMatchObject({ x: "33.33px", y: "66.67px" })
  })
})

describe("spotlightVars: the tilt", () => {
  it("does not tilt when the pointer is in the middle", () => {
    expect(spotlightVars(TILE, 200, 200, 100, true)).toEqual({ x: "100px", y: "50px", rotateX: "0deg", rotateY: "0deg" })
  })

  it("presses the right edge away when the pointer is at the right edge (rotateY from the horizontal place)", () => {
    expect(spotlightVars(TILE, 200, 300, 100, true)).toMatchObject({ rotateX: "0deg", rotateY: "5deg" })
    expect(spotlightVars(TILE, 200, 100, 100, true)).toMatchObject({ rotateX: "0deg", rotateY: "-5deg" })
  })

  it("presses the top edge away when the pointer is at the top (rotateX from the vertical place)", () => {
    expect(spotlightVars(TILE, 200, 200, 50, true)).toMatchObject({ rotateX: "5deg", rotateY: "0deg" })
    expect(spotlightVars(TILE, 200, 200, 150, true)).toMatchObject({ rotateX: "-5deg", rotateY: "0deg" })
  })

  it("combines both in a corner, and uses a part of the angle partway", () => {
    expect(spotlightVars(TILE, 200, 100, 50, true)).toMatchObject({ rotateX: "5deg", rotateY: "-5deg" })
    expect(spotlightVars(TILE, 200, 250, 75, true)).toMatchObject({ rotateX: "2.5deg", rotateY: "2.5deg" })
  })

  it("never tilts more than half the angle either way, even if the pointer is outside the box", () => {
    expect(spotlightVars(TILE, 200, 900, -400, true)).toMatchObject({ rotateX: "5deg", rotateY: "5deg" })
    expect(spotlightVars(TILE, 200, -900, 900, true)).toMatchObject({ rotateX: "-5deg", rotateY: "-5deg" })
  })

  it("tilts by the box of the tile, not by its width before the scale", () => {
    const scaled: SpotRect = { left: 0, top: 0, width: 400, height: 200 }
    expect(spotlightVars(scaled, 200, 400, 100, true)).toMatchObject({ rotateY: "5deg" })
  })
})

describe("spotlightVars: nothing to write", () => {
  it("answers null for a tile with no size (a tile that is not shown)", () => {
    expect(spotlightVars({ left: 0, top: 0, width: 0, height: 100 }, 0, 5, 5, true)).toBeNull()
    expect(spotlightVars({ left: 0, top: 0, width: 100, height: 0 }, 100, 5, 5, true)).toBeNull()
    expect(spotlightVars({ left: 0, top: 0, width: -3, height: 100 }, 100, 5, 5, true)).toBeNull()
  })

  it("answers null when a number is not a number", () => {
    expect(spotlightVars(TILE, 200, Number.NaN, 60, true)).toBeNull()
    expect(spotlightVars(TILE, 200, 130, Number.POSITIVE_INFINITY, true)).toBeNull()
    expect(spotlightVars({ ...TILE, left: Number.NaN }, 200, 130, 60, true)).toBeNull()
    expect(spotlightVars({ ...TILE, top: Number.NaN }, 200, 130, 60, true)).toBeNull()
    expect(spotlightVars({ ...TILE, width: Number.NaN }, 200, 130, 60, true)).toBeNull()
    expect(spotlightVars({ ...TILE, height: Number.NaN }, 200, 130, 60, true)).toBeNull()
    expect(spotlightVars(TILE, Number.NaN, 130, 60, true)).toBeNull()
  })
})
