import { afterEach, describe, expect, it, vi } from "vitest"
import { prefersReducedMotion } from "./learnMotion"

// The reduce motion setting of the Learn screen (Packet 12B, chunk 4). This file runs where there is no window, so each test puts a small window in place.
afterEach(() => {
  vi.unstubAllGlobals()
})

describe("prefersReducedMotion", () => {
  it("says no where there is no window at all", () => {
    expect(prefersReducedMotion()).toBe(false)
  })

  it("says no where the browser cannot tell (no matchMedia)", () => {
    vi.stubGlobal("window", {})
    expect(prefersReducedMotion()).toBe(false)
  })

  it("asks the browser for the reduce setting and gives its answer", () => {
    const matchMedia = vi.fn((query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" }))
    vi.stubGlobal("window", { matchMedia })
    expect(prefersReducedMotion()).toBe(true)
    expect(matchMedia).toHaveBeenCalledTimes(1)
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)")
  })

  it("says no when the person did not ask for less motion", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) })
    expect(prefersReducedMotion()).toBe(false)
  })
})
