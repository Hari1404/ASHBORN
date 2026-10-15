// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The canvas of the background and the lite level are replaced by stand-ins: this file only tests what TimerBackground decides and what it hands to the canvas.
// A real BackgroundCanvas needs WebGL 2, which the test browser (jsdom) does not have: its own tests (src/components/BackgroundCanvas.test.tsx) use a fake graphics context, and the test that the real animation draws is the look in a real browser (see the owner's look at the end of the packet).
const state = vi.hoisted(() => ({
  lite: 0 as 0 | 1 | 2,
  props: [] as Record<string, unknown>[],
  ballProps: [] as Record<string, unknown>[],
  mounts: 0,
  unmounts: 0,
  broken: false,
  ballDelay: 0,
  bgDelay: 0,
}))

vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return state.lite
  },
}))

// The waits before the background canvas and the library ball are made (BG_MOUNT_DELAY_MS and BALL_MOUNT_DELAY_MS) are 0 in every test but the ones of the describe "the wait before the background canvas is made", which use the real waits.
vi.mock("@/lib/backgroundLook", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/backgroundLook")>()
  return {
    ...actual,
    get BG_MOUNT_DELAY_MS() {
      return state.bgDelay
    },
  }
})

vi.mock("@/lib/ballLook", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ballLook")>()
  return {
    ...actual,
    get BALL_MOUNT_DELAY_MS() {
      return state.ballDelay
    },
  }
})

vi.mock("@/components/BackgroundCanvas", async () => {
  const { createElement: h, useEffect } = await import("react")
  return {
    default: function BackgroundCanvasStandIn(props: Record<string, unknown>) {
      state.props.push(props)
      if (state.broken) throw new Error("the animation broke")
      useEffect(() => {
        state.mounts++
        return () => {
          state.unmounts++
        }
      }, [])
      return h("div", { id: "canvas-stub" })
    },
  }
})

// The glowing ball is replaced too: it is only used to check that the background has the colour family of the ball.
vi.mock("@/components/CrystalizedBall", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.ballProps.push(props)
      return h("canvas", { id: "ball-stub" })
    },
  }
})

import { BG_BLEND_MS, BG_FADE_MS, BG_PALETTES, BG_SETTINGS, bgPaletteIndex, bgRamp } from "@/lib/backgroundLook"
import { BALL_FADE_MS, BALL_PALETTES, BALL_WHITE, ballPaletteIndex } from "@/lib/ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "@/lib/timerMaths"
import { forgetWarmup } from "@/lib/timerWarmup"
import TimerBackground from "./TimerBackground"
import TimerBall from "./TimerBall"

// The real waits, read from the files themselves (the mocks above hand out 0).
const REAL_BG_DELAY = (await vi.importActual<typeof import("@/lib/backgroundLook")>("@/lib/backgroundLook")).BG_MOUNT_DELAY_MS
const REAL_BALL_DELAY = (await vi.importActual<typeof import("@/lib/ballLook")>("@/lib/ballLook")).BALL_MOUNT_DELAY_MS

// AB:TIMER.TESTS:START
const timerCss = readFileSync("src/timer.css", "utf8")
const SEED = "2026-10-07T10:00:00.123456+00:00"
const OTHER_SEED = "2026-10-08T07:00:00.000001+00:00"
const PALETTE = BG_PALETTES[bgPaletteIndex(SEED)]

type BgProps = { active: boolean; seconds: number; seed: string }

let root: Root | null = null
let container: HTMLElement | null = null
let loseContext = vi.fn()
let canvasMode: "webgl2" | "none" | "throws" = "webgl2"

function mountPoint(): void {
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
}

function show(over: Partial<BgProps> = {}): void {
  const props: BgProps = { active: true, seconds: 0, seed: SEED, ...over }
  mountPoint()
  act(() => root?.render(createElement("div", null, createElement(TimerBackground, props), createElement("p", { id: "after" }, "after"))))
}

// The background and the glowing ball side by side, given the same seconds and the same seed, as the screen does.
function showBoth(over: Partial<BgProps> = {}): void {
  const props: BgProps = { active: true, seconds: 0, seed: SEED, ...over }
  mountPoint()
  act(() =>
    root?.render(
      createElement(
        "div",
        null,
        createElement(TimerBackground, props),
        createElement(TimerBall, { ...props, paused: false }),
      ),
    ),
  )
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
  const found = container?.querySelector<HTMLElement>(".ab-timer-bg") ?? null
  if (found === null) throw new Error("no background box")
  return found
}

// How many times the page asked the browser for a context of any kind (the test context of the WebGL 2 check is the only reason to).
function contextAsks(): number {
  return vi.mocked(HTMLCanvasElement.prototype.getContext).mock.calls.length
}

function lastProps(): Record<string, unknown> {
  const last = state.props.at(-1)
  if (last === undefined) throw new Error("the animation was never drawn")
  return last
}

// The five colours the canvas was given the last time.
function colours(): string[] {
  return lastProps().colors as string[]
}

function lastBallColour(): string {
  const last = state.ballProps.at(-1)
  if (last === undefined) throw new Error("the ball was never drawn")
  return String(last.color)
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

// How far two ramps are from each other: the distance of all their channels together.
function away(a: readonly string[], b: readonly string[]): number {
  let sum = 0
  a.forEach((colour, i) => {
    const x = channels(colour)
    const y = channels(b[i])
    sum += (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2
  })
  return Math.sqrt(sum)
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  state.lite = 0
  state.props = []
  state.ballProps = []
  state.mounts = 0
  state.unmounts = 0
  state.broken = false
  state.ballDelay = 0
  state.bgDelay = 0
  canvasMode = "webgl2"
  loseContext = vi.fn()
  // The answer of the WebGL 2 check is kept for the whole page (timerWarmup.ts), so every test starts without it.
  forgetWarmup()
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
  vi.unstubAllGlobals()
})

describe("TimerBackground: when it draws", () => {
  it("draws nothing while there is no session", () => {
    show({ active: false })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
  })

  it("draws the animation in its box while a session runs, hidden from screen readers", () => {
    show({ active: true })
    expect(box().getAttribute("aria-hidden")).toBe("true")
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(box().querySelector("#canvas-stub")).not.toBeNull()
    expect(state.mounts).toBe(1)
  })

  it("has no tint layer, no black layer and no stretched box any more: the canvas is all there is in its box", () => {
    show({ active: true })
    for (const old of [".ab-timer-bg-tint", ".ab-timer-bg-dim", ".ab-timer-bg-rays"]) expect(has(old)).toBe(false)
    expect(box().children).toHaveLength(1)
    expect(box().firstElementChild?.id).toBe("canvas-stub")
  })

  it("draws nothing when the browser cannot give WebGL 2, and the rest of the page stays", () => {
    canvasMode = "none"
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })

  it("draws nothing and does not crash when asking for WebGL 2 throws an error", () => {
    canvasMode = "throws"
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has("#after")).toBe(true)
  })

  it("gives its test context back to the browser", () => {
    show({ active: true })
    expect(loseContext).toHaveBeenCalledTimes(1)
  })

  it("does not ask the browser for anything while there is no session, so that opening the screen costs nothing", () => {
    show({ active: false })
    wait(5000)
    expect(contextAsks()).toBe(0)
  })

  it("shares the WebGL 2 check with the glowing ball: both together ask the browser once", () => {
    showBoth({ active: true })
    expect(has(".ab-timer-bg")).toBe(true)
    expect(has(".ab-timer-ball")).toBe(true)
    expect(contextAsks()).toBe(1)
    expect(loseContext).toHaveBeenCalledTimes(1)
  })

  it("does not ask the browser at lite level 2, where nothing is drawn", () => {
    state.lite = 2
    show({ active: true })
    expect(contextAsks()).toBe(0)
  })

  it("draws nothing at lite level 2, where the screen stays plain black", () => {
    state.lite = 2
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })
})

describe("TimerBackground: what it hands to the canvas", () => {
  it("gives it the studio settings of the owner and its five colours, and nothing else", () => {
    show({ active: true })
    const props = lastProps()
    expect(Object.keys(props).sort()).toEqual([...Object.keys(BG_SETTINGS), "colors"].sort())
    for (const [name, value] of Object.entries(BG_SETTINGS)) expect(props[name], name).toBe(value)
    expect(props.colors).toHaveLength(5)
  })

  it("draws the animation on the laptop and on a phone (lite level 0 and 1)", () => {
    show({ active: true })
    expect(has("#canvas-stub")).toBe(true)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(has("#canvas-stub")).toBe(true)
  })

  it("lets the flow move at the chosen speed, and gives the canvas nothing to listen to the cursor, a click or a touch with", () => {
    show({ active: true })
    expect(lastProps().speed).toBe(BG_SETTINGS.speed)
    for (const name of ["interactive", "clickSwirl", "intro", "stir"]) expect(name in lastProps()).toBe(false)
  })

  it("lets the flow stand still for a person who asked their device for less motion, and still gives it the colours", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("prefers-reduced-motion"), media: query }))
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().speed).toBe(0)
    expect(colours()).toEqual([...bgRamp(DEEP_FROM_SECONDS + 5, bgPaletteIndex(SEED))])
  })

  it("never gives the canvas another setting while the colours move, and does not make it again", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BG_BLEND_MS)
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BG_BLEND_MS)
    show({ active: true, seconds: FLOW_FROM_SECONDS })
    wait(BG_BLEND_MS)
    const settingsOnly = new Set(state.props.map((p) => JSON.stringify({ ...p, colors: 0 })))
    expect(settingsOnly.size).toBe(1)
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
  })

  it("gives the canvas new colours while they move, and nothing more once they have arrived", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const before = state.props.length
    wait(1000)
    expect(state.props.length).toBeGreaterThan(before)
    wait(BG_BLEND_MS)
    const arrived = state.props.length
    wait(5000)
    expect(state.props.length).toBe(arrived)
  })

  it("always gives it five colours", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BG_BLEND_MS)
    for (const p of state.props) expect(p.colors).toHaveLength(5)
  })
})

describe("TimerBackground: the colours of the ramp", () => {
  it("are all the black of the palette at the start of a session, so the screen is black", () => {
    show({ active: true, seconds: 0 })
    expect(colours()).toEqual([PALETTE[0], PALETTE[0], PALETTE[0], PALETTE[0], PALETTE[0]])
  })

  it("show the right colours at once when the page is opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(colours()).toEqual([...bgRamp(DEEP_FROM_SECONDS + 5, bgPaletteIndex(SEED))])
    expect(colours()).toEqual([PALETTE[0], PALETTE[1], PALETTE[2], PALETTE[3], PALETTE[3]])
    expect(state.mounts).toBe(1)
  })

  it("stay black until the solid cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    wait(5000)
    expect(colours()).toEqual([...bgRamp(0, bgPaletteIndex(SEED))])
  })

  it("move from black to the first ramp in exactly BG_BLEND_MS, not at once", () => {
    const start = [...bgRamp(0, bgPaletteIndex(SEED))]
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    expect(colours()).toEqual(start)
    wait(BG_BLEND_MS / 2)
    const half = colours()
    expect(half).not.toEqual(start)
    expect(half).not.toEqual(target)
    half.forEach((colour, i) => {
      const from = channels(start[i])
      const to = channels(target[i])
      channels(colour).forEach((value, c) => {
        expect(value).toBeGreaterThanOrEqual(Math.min(from[c], to[c]))
        expect(value).toBeLessThanOrEqual(Math.max(from[c], to[c]))
      })
    })
    // The smooth end of the blend is within one step of a channel of its target in the last moments, so the check "not there yet" is made two seconds before the end.
    wait(BG_BLEND_MS / 2 - 2000)
    expect(colours()).not.toEqual(target)
    wait(2000)
    expect(colours()).toEqual(target)
    wait(3000)
    expect(colours()).toEqual(target)
  })

  it("start slowly and end slowly: a quarter of the way in a colour has moved about 16 percent of the way, not 25", () => {
    const start = [...bgRamp(0, bgPaletteIndex(SEED))]
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BG_BLEND_MS / 4)
    // The main colour (the third of the ramp) goes from black to its colour: how far has it come?
    const moved = away([colours()[2]], [start[2]]) / away([target[2]], [start[2]])
    expect(moved).toBeGreaterThan(0.1)
    expect(moved).toBeLessThan(0.2)
    wait(BG_BLEND_MS / 2)
    const movedThree = away([colours()[2]], [start[2]]) / away([target[2]], [start[2]])
    expect(movedThree).toBeGreaterThan(0.8)
    expect(movedThree).toBeLessThan(0.9)
  })

  it("come steadily closer to the new colours while they move", () => {
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const seen: number[] = [away(colours(), target)]
    for (let i = 0; i < 4; i++) {
      wait(BG_BLEND_MS / 4)
      seen.push(away(colours(), target))
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeLessThan(seen[i - 1])
    expect(seen.at(-1)).toBe(0)
  })

  it("go on at the deep cut-off, and again at the flow cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS + 5 })
    expect(colours()).toEqual([PALETTE[0], PALETTE[1], PALETTE[2], PALETTE[2], PALETTE[2]])
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BG_BLEND_MS)
    expect(colours()).toEqual([PALETTE[0], PALETTE[1], PALETTE[2], PALETTE[3], PALETTE[3]])
    show({ active: true, seconds: FLOW_FROM_SECONDS })
    wait(BG_BLEND_MS)
    expect(colours()).toEqual([...PALETTE])
  })

  it("leave no timer behind when the screen goes away in the middle of a colour step", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(500)
    dispose()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("TimerBackground: lighting and fading", () => {
  it("fades out for BG_FADE_MS when the session ends, and is then taken away", () => {
    show({ active: true, seconds: 100 })
    show({ active: false, seconds: 0, seed: "" })
    expect(box().getAttribute("data-out")).toBe("yes")
    wait(BG_FADE_MS - 100)
    expect(has(".ab-timer-bg")).toBe(true)
    wait(100)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.unmounts).toBe(1)
  })

  it("keeps its colours while it fades, and does not start to move towards black", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    const kept = [...colours()]
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS - 100)
    expect(colours()).toEqual(kept)
  })

  it("does not turn back while it fades after a colour step was on its way: it goes on to the colours it was moving to", () => {
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(3000)
    show({ active: false, seconds: 0, seed: "" })
    let before = away(colours(), target)
    expect(before).toBeGreaterThan(0)
    for (let i = 0; i < 4; i++) {
      wait(150)
      const now = away(colours(), target)
      expect(now).toBeLessThan(before)
      before = now
    }
  })

  it("lights a new background for every new session", () => {
    show({ active: true })
    show({ active: false, seed: "" })
    wait(BG_FADE_MS)
    expect(state.mounts).toBe(1)
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(true)
    expect(state.mounts).toBe(2)
  })

  it("lights a new background when a session starts while the old one is still fading", () => {
    show({ active: true })
    show({ active: false, seed: "" })
    wait(300)
    show({ active: true })
    wait(BG_FADE_MS * 2)
    expect(state.mounts).toBe(2)
    expect(box().hasAttribute("data-out")).toBe(false)
  })

  it("lights a new background when the seed changes while a session is shown, and it starts black", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    show({ active: true, seconds: 0, seed: OTHER_SEED })
    expect(state.mounts).toBe(2)
    expect(colours()).toEqual([...bgRamp(0, bgPaletteIndex(OTHER_SEED))])
  })

  it("does not light a new background when only the seed text is gone for a moment of a running session", () => {
    show({ active: true, seconds: 100 })
    show({ active: true, seconds: 101, seed: "" })
    expect(state.mounts).toBe(1)
  })

  it("starts a new session black, also after a long one", () => {
    show({ active: true, seconds: FLOW_FROM_SECONDS + 5 })
    expect(colours()).toEqual([...PALETTE])
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS)
    show({ active: true, seconds: 0, seed: OTHER_SEED })
    const black = BG_PALETTES[bgPaletteIndex(OTHER_SEED)][0]
    expect(colours()).toEqual([black, black, black, black, black])
  })
})

describe("TimerBackground: the wait before the background canvas is made", () => {
  beforeEach(() => {
    state.bgDelay = REAL_BG_DELAY
    state.ballDelay = REAL_BALL_DELAY
  })

  it("is 300 ms, and the wait of the glowing ball is 600 ms (written here again on purpose, see CONNECTIONS.md C33 and C47)", () => {
    expect(REAL_BG_DELAY).toBe(300)
    expect(REAL_BALL_DELAY).toBe(600)
  })

  it("makes the heavy glowing ball after the background, with at least 300 ms between them, so their work never lands in the same moment", () => {
    expect(REAL_BALL_DELAY - REAL_BG_DELAY).toBeGreaterThanOrEqual(300)
  })

  it("makes no box and no canvas in the moment of the press of Start, and asks the browser nothing then", () => {
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(state.mounts).toBe(0)
    expect(contextAsks()).toBe(0)
    expect(has("#after")).toBe(true)
  })

  it("makes the box with its animation when the wait is over, and not a moment before", () => {
    show({ active: true })
    wait(REAL_BG_DELAY - 1)
    expect(has(".ab-timer-bg")).toBe(false)
    wait(1)
    expect(has(".ab-timer-bg")).toBe(true)
    expect(has("#canvas-stub")).toBe(true)
    expect(state.mounts).toBe(1)
    expect(contextAsks()).toBe(1)
  })

  it("makes the background first and the glowing ball later, never in the same moment", () => {
    showBoth()
    expect(state.ballProps).toHaveLength(0)
    expect(state.props).toHaveLength(0)
    wait(REAL_BG_DELAY)
    expect(state.props.length).toBeGreaterThan(0)
    expect(state.ballProps).toHaveLength(0)
    wait(REAL_BALL_DELAY - REAL_BG_DELAY - 1)
    expect(state.ballProps).toHaveLength(0)
    wait(1)
    expect(state.ballProps.length).toBeGreaterThan(0)
  })

  it("makes the background with the right colours at once, also for a page opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    wait(REAL_BG_DELAY)
    expect(colours()).toEqual([...bgRamp(DEEP_FROM_SECONDS + 5, bgPaletteIndex(SEED))])
    expect(state.mounts).toBe(1)
  })

  it("never makes the background for a session that ends during the wait", () => {
    show({ active: true })
    wait(REAL_BG_DELAY - 100)
    show({ active: false })
    // The old wait would have run out 100 ms from now, and the box of a fading background is still there for BG_FADE_MS: the clock is moved in steps so that a background made in that time would be seen.
    wait(200)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.mounts).toBe(0)
    wait(REAL_BG_DELAY)
    expect(has(".ab-timer-bg")).toBe(false)
    wait(BG_FADE_MS * 3)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.mounts).toBe(0)
    expect(contextAsks()).toBe(0)
  })

  it("counts the wait again for every new session", () => {
    show({ active: true })
    wait(REAL_BG_DELAY)
    show({ active: false })
    wait(BG_FADE_MS)
    expect(has(".ab-timer-bg")).toBe(false)
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    wait(REAL_BG_DELAY - 1)
    expect(has(".ab-timer-bg")).toBe(false)
    wait(1)
    expect(has("#canvas-stub")).toBe(true)
    expect(state.mounts).toBe(2)
  })

  it("does not wait again, and does not make the animation again, for a colour step, a pause or a resume of the same session", () => {
    show({ active: true, seconds: 0 })
    wait(REAL_BG_DELAY)
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    show({ active: true, seconds: SOLID_FROM_SECONDS + 1 })
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
    expect(has("#canvas-stub")).toBe(true)
  })

  it("asks the browser for WebGL 2 once the wait is over, and draws nothing when the answer is no", () => {
    canvasMode = "none"
    show({ active: true })
    expect(contextAsks()).toBe(0)
    wait(REAL_BG_DELAY)
    expect(contextAsks()).toBe(1)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has("#after")).toBe(true)
  })
})

describe("TimerBackground: when the canvas breaks", () => {
  it("leaves the background out and keeps the rest of the page", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {})
    state.broken = true
    show({ active: true })
    expect(has("#canvas-stub")).toBe(false)
    expect(has("#after")).toBe(true)
    quiet.mockRestore()
  })
})

describe("TimerBackground: the same colour family as the glowing ball", () => {
  it("uses the palette of the ball for the same session: the ball's last colour and the background's last ramp come from the palette with the same number", () => {
    for (const seed of [SEED, OTHER_SEED, "2026-10-09T18:30:12.987654+00:00", "2026-10-10T03:15:45.555555+00:00"]) {
      const index = ballPaletteIndex(seed)
      expect(bgPaletteIndex(seed)).toBe(index)
      showBoth({ active: true, seconds: FLOW_FROM_SECONDS + 5, seed })
      expect(colours()).toEqual([...BG_PALETTES[index]])
      expect(lastBallColour()).toBe(BALL_PALETTES[index][2])
      dispose()
      state.props = []
      state.ballProps = []
    }
  })

  it("starts a new session together with a new ball: the background black, the ball white", () => {
    showBoth({ active: true, seconds: FLOW_FROM_SECONDS + 5 })
    showBoth({ active: false, seconds: 0, seed: "" })
    wait(Math.max(BG_FADE_MS, BALL_FADE_MS))
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has(".ab-timer-ball")).toBe(false)
    showBoth({ active: true, seconds: 0, seed: OTHER_SEED })
    const black = BG_PALETTES[ballPaletteIndex(OTHER_SEED)][0]
    expect(colours()).toEqual([black, black, black, black, black])
    expect(lastBallColour()).toBe(BALL_WHITE)
  })
})

describe("the css of the background", () => {
  const block = (selector: string): string => {
    const start = timerCss.indexOf(selector + " {")
    if (start < 0) return ""
    return timerCss.slice(start, timerCss.indexOf("}", start))
  }

  it("is a box over the whole screen, at the very bottom, clipped, that never catches a tap", () => {
    const bg = block(".ab-timer-bg")
    expect(bg).toContain("position: absolute;")
    expect(bg).toContain("inset: 0;")
    expect(bg).toContain("z-index: 0;")
    expect(bg).toContain("overflow: hidden;")
    expect(bg).toContain("isolation: isolate;")
    expect(bg).toContain("pointer-events: none;")
  })

  it("fades for as long as the code waits before it takes the background away", () => {
    const bg = block(".ab-timer-bg")
    const fade = Number(/transition:\s*opacity\s+([0-9]+)ms/.exec(bg)?.[1])
    expect(fade).toBe(BG_FADE_MS)
    expect(block('.ab-timer-bg[data-out="yes"]')).toContain("opacity: 0;")
  })

  it("is dimmed, so that the white digits stay easy to read, and dimmer still while the session is paused", () => {
    const opacity = Number(/opacity:\s*([0-9.]+);/.exec(block(".ab-timer-bg"))?.[1])
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(1)
    const paused = Number(/opacity:\s*([0-9.]+);/.exec(block('.ab-timer[data-state="paused"] .ab-timer-bg'))?.[1])
    expect(paused).toBeGreaterThan(0)
    expect(paused).toBeLessThan(opacity)
  })

  it("fades in with a short animation that stands still for a person who asked for less motion", () => {
    expect(block(".ab-timer-bg")).toMatch(/animation:\s*ab-timer-bg-in\s+[0-9]+ms/)
    expect(timerCss).toContain("@keyframes ab-timer-bg-in {")
    const quiet = timerCss.slice(timerCss.lastIndexOf("@media (prefers-reduced-motion: reduce)"))
    expect(quiet).toContain(".ab-timer-bg {")
    expect(quiet).toContain("animation: none;")
  })

  it("has its own plain black, so the screen is black before the animation is made and while it fades", () => {
    expect(block(".ab-timer-bg")).toContain("background: #000;")
  })

  it("keeps the bottom a little darker, with a layer over the animation that never catches a tap", () => {
    const shade = block(".ab-timer-bg::after")
    expect(shade).toContain('content: "";')
    expect(shade).toContain("position: absolute;")
    expect(shade).toContain("inset: 0;")
    expect(shade).toContain("pointer-events: none;")
    expect(shade).toContain("linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0) 60%)")
  })

  it("has no rule left for the tint layer, the black layer or the stretched box of the old rays", () => {
    for (const old of [".ab-timer-bg-tint", ".ab-timer-bg-dim", ".ab-timer-bg-rays", "mix-blend-mode"]) expect(timerCss).not.toContain(old)
  })

  it("lets the canvas fill its place without a gap under it", () => {
    expect(block(".ab-timer-bg canvas")).toContain("display: block;")
  })

  it("lives in a screen that is its own stacking box, with the dial drawn above the background", () => {
    const screen = block(".ab-timer")
    expect(screen).toContain("position: relative;")
    expect(screen).toContain("isolation: isolate;")
    expect(screen).toContain("overflow: hidden;")
    expect(block(".ab-timer-dial")).toContain("z-index: 1;")
  })

  it("keeps the line, the Try again button and the buttons above the background", () => {
    for (const selector of [".ab-timer-note", ".ab-timer-retry", ".ab-timer-actions"]) {
      expect(block(selector)).toContain("position: relative;")
      expect(block(selector)).toContain("z-index: 1;")
    }
  })

  it("gives the line under the dial a dark shadow, so that it can be read over a bright colour", () => {
    expect(block(".ab-timer-note")).toContain("text-shadow:")
  })
})
// AB:TIMER.TESTS:END
