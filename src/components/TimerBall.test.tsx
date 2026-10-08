// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The library ball and the lite level are replaced by stand-ins: this file only tests what TimerBall decides and what it hands to the ball.
// A real ball needs WebGL 2, which the test browser (jsdom) does not have; the test that the real ball draws is the look in a real browser (see the owner's look at the end of the packet).
const state = vi.hoisted(() => ({
  lite: 0 as 0 | 1 | 2,
  props: [] as Record<string, unknown>[],
  mounts: 0,
  unmounts: 0,
  broken: false,
}))

vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return state.lite
  },
}))

vi.mock("@/components/CrystalizedBall", async () => {
  const { createElement: h, useEffect } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.props.push(props)
      if (state.broken) throw new Error("the ball broke")
      useEffect(() => {
        state.mounts++
        return () => {
          state.unmounts++
        }
      }, [])
      return h("canvas", { id: "ball-stub" })
    },
  }
})

import { BALL_BLEND_MS, BALL_FADE_MS, BALL_PALETTES, BALL_WHITE, ballPaletteIndex } from "@/lib/ballLook"
import { DEEP_FROM_SECONDS, SOLID_FROM_SECONDS } from "@/lib/timerMaths"
import TimerBall from "./TimerBall"

// AB:TIMER.TESTS:START
const timerCss = readFileSync("src/timer.css", "utf8")
const SEED = "2026-10-07T10:00:00.123456+00:00"
const PALETTE = BALL_PALETTES[ballPaletteIndex(SEED)]

type BallProps = { active: boolean; paused: boolean; seconds: number; seed: string }

let root: Root | null = null
let container: HTMLElement | null = null
let loseContext = vi.fn()
let canvasMode: "webgl2" | "none" | "throws" = "webgl2"

function show(over: Partial<BallProps> = {}): void {
  const props: BallProps = { active: true, paused: false, seconds: 0, seed: SEED, ...over }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement("div", null, createElement(TimerBall, props), createElement("p", { id: "after" }, "after"))))
}

function dispose(): void {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
}

function wait(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function box(): HTMLElement {
  const found = container?.querySelector<HTMLElement>(".ab-timer-ball") ?? null
  if (found === null) throw new Error("no ball box")
  return found
}

function lastProps(): Record<string, unknown> {
  const last = state.props.at(-1)
  if (last === undefined) throw new Error("the ball was never drawn")
  return last
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  state.lite = 0
  state.props = []
  state.mounts = 0
  state.unmounts = 0
  state.broken = false
  canvasMode = "webgl2"
  loseContext = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) => {
    if (type !== "webgl2") return null
    if (canvasMode === "throws") throw new Error("no context")
    if (canvasMode === "none") return null
    return { getExtension: (name: string) => (name === "WEBGL_lose_context" ? { loseContext } : null) }
  }) as never)
  vi.useFakeTimers()
})

afterEach(() => {
  dispose()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("TimerBall: when it draws", () => {
  it("draws nothing while there is no session", () => {
    show({ active: false })
    expect(has(".ab-timer-ball")).toBe(false)
    expect(state.props).toHaveLength(0)
  })

  it("draws the ball in its box while a session runs, hidden from screen readers", () => {
    show({ active: true })
    expect(box().getAttribute("aria-hidden")).toBe("true")
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(has("#ball-stub")).toBe(true)
    expect(state.mounts).toBe(1)
  })

  it("draws nothing when the browser cannot give WebGL 2, and the rest of the page stays", () => {
    canvasMode = "none"
    show({ active: true })
    expect(has(".ab-timer-ball")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })

  it("draws nothing and does not crash when asking for WebGL 2 throws an error", () => {
    canvasMode = "throws"
    show({ active: true })
    expect(has(".ab-timer-ball")).toBe(false)
    expect(has("#after")).toBe(true)
  })

  it("gives its test context back to the browser", () => {
    show({ active: true })
    expect(loseContext).toHaveBeenCalledTimes(1)
  })
})

describe("TimerBall: what it hands to the library ball", () => {
  it("uses the plasma look at 66 percent of its box, with the ignite and the cursor wake on", () => {
    show({ active: true })
    const props = lastProps()
    expect(props.preset).toBe("plasma")
    expect(props.size).toBe(0.66)
    expect(props.intro).toBe(true)
    expect(props.interactive).toBe(true)
    expect(props.paused).toBe(false)
  })

  it("draws fewer grains of dust on a phone: 15000, 6000 and 3000 for lite level 0, 1 and 2", () => {
    show({ active: true })
    expect(lastProps().particleCount).toBe(15000)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(lastProps().particleCount).toBe(6000)
    dispose()
    state.lite = 2
    show({ active: true })
    expect(lastProps().particleCount).toBe(3000)
  })

  it("stands the ball still while the session is paused, and lets it go on after", () => {
    show({ active: true, paused: true })
    expect(lastProps().paused).toBe(true)
    show({ active: true, paused: false })
    expect(lastProps().paused).toBe(false)
  })

  it("is white at the start of a session", () => {
    show({ active: true, seconds: 0 })
    expect(lastProps().color).toBe(BALL_WHITE)
  })

  it("shows the right colour at once when the page is opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe(PALETTE[1])
    expect(state.mounts).toBe(1)
  })
})

describe("TimerBall: the colour moving on", () => {
  it("stays white until the solid cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    wait(5000)
    expect(lastProps().color).toBe(BALL_WHITE)
  })

  it("moves from white to the first colour of the palette in exactly BALL_BLEND_MS, not at once", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    expect(lastProps().color).toBe(BALL_WHITE)
    wait(BALL_BLEND_MS / 2)
    const half = String(lastProps().color)
    expect(half).not.toBe(BALL_WHITE)
    expect(half).not.toBe(PALETTE[0])
    const from = channels(BALL_WHITE)
    const to = channels(PALETTE[0])
    channels(half).forEach((value, i) => {
      expect(value).toBeGreaterThanOrEqual(Math.min(from[i], to[i]))
      expect(value).toBeLessThanOrEqual(Math.max(from[i], to[i]))
    })
    wait(BALL_BLEND_MS / 2 - 100)
    expect(lastProps().color).not.toBe(PALETTE[0])
    wait(100)
    expect(lastProps().color).toBe(PALETTE[0])
    wait(3000)
    expect(lastProps().color).toBe(PALETTE[0])
  })

  it("comes steadily closer to the new colour while it moves", () => {
    const away = (hex: string): number => {
      const a = channels(hex)
      const b = channels(PALETTE[0])
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    }
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const seen: number[] = [away(String(lastProps().color))]
    for (let i = 0; i < 4; i++) {
      wait(BALL_BLEND_MS / 4)
      seen.push(away(String(lastProps().color)))
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeLessThan(seen[i - 1])
    expect(seen.at(-1)).toBe(0)
  })

  it("goes on from the first colour to the second at the deep cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe(PALETTE[0])
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    expect(lastProps().color).toBe(PALETTE[1])
  })

  it("does not draw the ball again for a colour step: it is the same ball", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
  })

  it("leaves no timer behind when the screen goes away in the middle of a colour step", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(500)
    dispose()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("TimerBall: lighting and fading", () => {
  it("fades out for BALL_FADE_MS when the session ends, and is then taken away", () => {
    show({ active: true, seconds: 100 })
    show({ active: false, seconds: 0 })
    expect(box().getAttribute("data-out")).toBe("yes")
    wait(BALL_FADE_MS - 100)
    expect(has(".ab-timer-ball")).toBe(true)
    wait(100)
    expect(has(".ab-timer-ball")).toBe(false)
    expect(state.unmounts).toBe(1)
  })

  it("lights a new ball for every new session", () => {
    show({ active: true })
    show({ active: false })
    wait(BALL_FADE_MS)
    expect(state.mounts).toBe(1)
    show({ active: true })
    expect(has(".ab-timer-ball")).toBe(true)
    expect(state.mounts).toBe(2)
  })

  it("lights a new ball when a session starts while the old one is still fading", () => {
    show({ active: true })
    show({ active: false })
    wait(300)
    show({ active: true })
    wait(BALL_FADE_MS * 2)
    expect(state.mounts).toBe(2)
    expect(box().hasAttribute("data-out")).toBe(false)
  })

  it("starts a new session white, also after a long one", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe(PALETTE[1])
    show({ active: false, seconds: 0 })
    wait(BALL_FADE_MS)
    show({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(lastProps().color).toBe(BALL_WHITE)
  })

  it("keeps the ball while a session is paused", () => {
    show({ active: true, seconds: 100 })
    show({ active: true, paused: true, seconds: 100 })
    wait(BALL_FADE_MS * 3)
    expect(has(".ab-timer-ball")).toBe(true)
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(state.mounts).toBe(1)
  })
})

describe("TimerBall: when the library ball breaks", () => {
  it("leaves the ball out and keeps the rest of the page", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {})
    state.broken = true
    show({ active: true })
    expect(has("#ball-stub")).toBe(false)
    expect(has("#after")).toBe(true)
    quiet.mockRestore()
  })
})

describe("the css of the ball", () => {
  const block = (selector: string): string => {
    const start = timerCss.indexOf(selector + " {")
    if (start < 0) return ""
    return timerCss.slice(start, timerCss.indexOf("}", start))
  }

  it("is a box larger than the dial, square, behind the clocks, that never catches a tap", () => {
    const ball = block(".ab-timer-ball")
    const width = Number(/width:\s*([0-9.]+)%/.exec(ball)?.[1])
    expect(width).toBeGreaterThanOrEqual(100)
    expect(ball).toContain("aspect-ratio: 1;")
    expect(ball).toContain("position: absolute;")
    expect(ball).toContain("pointer-events: none;")
  })

  it("fades for as long as the code waits before it takes the ball away", () => {
    const ball = block(".ab-timer-ball")
    const fade = Number(/transition:\s*opacity\s+([0-9]+)ms/.exec(ball)?.[1])
    expect(fade).toBe(BALL_FADE_MS)
    expect(block('.ab-timer-ball[data-out="yes"]')).toContain("opacity: 0;")
  })

  it("dims the ball while the session is paused", () => {
    const dim = block('.ab-timer[data-state="paused"] .ab-timer-ball')
    const opacity = Number(/opacity:\s*([0-9.]+);/.exec(dim)?.[1])
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(1)
  })

  it("clips what reaches past the edge of the screen, so the phone never scrolls sideways", () => {
    expect(block(".ab-timer")).toContain("overflow: hidden;")
  })

  it("keeps the line, the Try again button and the buttons above the ball", () => {
    for (const selector of [".ab-timer-note", ".ab-timer-retry", ".ab-timer-actions"]) {
      expect(block(selector)).toContain("position: relative;")
      expect(block(selector)).toContain("z-index: 1;")
    }
  })
})
// AB:TIMER.TESTS:END
