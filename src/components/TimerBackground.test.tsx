// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The library files and the lite level are replaced by stand-ins: this file only tests what TimerBackground decides and what it hands to the library.
// A real Side Rays needs WebGL 2, which the test browser (jsdom) does not have; the test that the real animation draws is the look in a real browser (see the owner's look at the end of the packet).
const state = vi.hoisted(() => ({
  lite: 0 as 0 | 1 | 2,
  props: [] as Record<string, unknown>[],
  ballProps: [] as Record<string, unknown>[],
  mounts: 0,
  unmounts: 0,
  broken: false,
}))

vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return state.lite
  },
}))

vi.mock("@/components/SideRays", async () => {
  const { createElement: h, useEffect } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.props.push(props)
      if (state.broken) throw new Error("the animation broke")
      useEffect(() => {
        state.mounts++
        return () => {
          state.unmounts++
        }
      }, [])
      return h("div", { id: "siderays-stub" })
    },
  }
})

// The glowing ball is replaced too: it is only used to check that the background has the colour of the ball at every moment.
vi.mock("@/components/CrystalizedBall", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.ballProps.push(props)
      return h("canvas", { id: "ball-stub" })
    },
  }
})

import { BG_FADE_MS, BG_SETTINGS } from "@/lib/backgroundLook"
import { BALL_BLEND_MS, BALL_FADE_MS, BALL_PALETTES, BALL_WHITE, ballPaletteIndex } from "@/lib/ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "@/lib/timerMaths"
import TimerBackground from "./TimerBackground"
import TimerBall from "./TimerBall"

// AB:TIMER.TESTS:START
const timerCss = readFileSync("src/timer.css", "utf8")
const SEED = "2026-10-07T10:00:00.123456+00:00"
const PALETTE = BALL_PALETTES[ballPaletteIndex(SEED)]

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

function tintHex(): string {
  const tint = container?.querySelector<HTMLElement>(".ab-timer-bg-tint") ?? null
  if (tint === null) throw new Error("no tint layer")
  const raw = tint.style.backgroundColor
  const rgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(raw)
  if (rgb === null) return raw
  return "#" + [rgb[1], rgb[2], rgb[3]].map((v) => Number(v).toString(16).padStart(2, "0")).join("")
}

function lastProps(): Record<string, unknown> {
  const last = state.props.at(-1)
  if (last === undefined) throw new Error("the animation was never drawn")
  return last
}

function lastBallColour(): string {
  const last = state.ballProps.at(-1)
  if (last === undefined) throw new Error("the ball was never drawn")
  return String(last.color)
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  state.lite = 0
  state.props = []
  state.ballProps = []
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
  vi.unstubAllGlobals()
})

describe("TimerBackground: when it draws", () => {
  it("draws nothing while there is no session", () => {
    show({ active: false })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
  })

  it("draws the animation and the tint layer in its box while a session runs, hidden from screen readers", () => {
    show({ active: true })
    expect(box().getAttribute("aria-hidden")).toBe("true")
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(has("#siderays-stub")).toBe(true)
    expect(has(".ab-timer-bg-tint")).toBe(true)
    expect(state.mounts).toBe(1)
  })

  it("puts the tint layer after the animation, so that it is drawn over it", () => {
    show({ active: true })
    const stub = container?.querySelector("#siderays-stub") ?? null
    const tint = container?.querySelector(".ab-timer-bg-tint") ?? null
    expect(stub).not.toBeNull()
    expect(tint).not.toBeNull()
    expect((stub as Element).compareDocumentPosition(tint as Element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

  it("draws nothing at lite level 2, where the screen stays plain black", () => {
    state.lite = 2
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })
})

describe("TimerBackground: what it hands to the library", () => {
  it("uses the settings the owner chose (speed, tilt, intensity) and leaves every other setting of the library at its own default", () => {
    show({ active: true })
    const props = lastProps()
    expect(props.speed).toBe(BG_SETTINGS.speed)
    expect(props.tilt).toBe(13)
    expect(props.intensity).toBe(2.8)
    expect(Object.keys(props).sort()).toEqual(["intensity", "rayColor1", "rayColor2", "speed", "tilt"])
  })

  it("gives the library white for both of its ray colours, so that the tint layer can colour them", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().rayColor1).toBe("#ffffff")
    expect(lastProps().rayColor2).toBe("#ffffff")
  })

  it("draws the rays on the laptop and on a phone (lite level 0 and 1)", () => {
    show({ active: true })
    expect(has("#siderays-stub")).toBe(true)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(has("#siderays-stub")).toBe(true)
  })

  it("lets the rays move at the chosen speed", () => {
    show({ active: true })
    expect(lastProps().speed).toBe(2.9)
  })

  it("lets the rays stand still for a person who asked their device for less motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("prefers-reduced-motion"), media: query }))
    show({ active: true })
    expect(lastProps().speed).toBe(0)
  })

  it("never gives the library another colour or another setting while the colour moves, and does not make it again", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    show({ active: true, seconds: FLOW_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    const written = new Set(state.props.map((p) => JSON.stringify(p)))
    expect(written.size).toBe(1)
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
  })

  it("does not draw the library part again while the colour moves (only the tint layer changes)", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const before = state.props.length
    wait(BALL_BLEND_MS)
    expect(state.props.length).toBe(before)
  })
})

describe("TimerBackground: the colour of the tint layer", () => {
  it("is white at the start of a session", () => {
    show({ active: true, seconds: 0 })
    expect(tintHex()).toBe(BALL_WHITE)
  })

  it("shows the right colour at once when the page is opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    expect(state.mounts).toBe(1)
  })

  it("stays white until the solid cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    wait(5000)
    expect(tintHex()).toBe(BALL_WHITE)
  })

  it("moves from white to the first colour of the palette in exactly BALL_BLEND_MS, not at once", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    expect(tintHex()).toBe(BALL_WHITE)
    wait(BALL_BLEND_MS / 2)
    const half = tintHex()
    expect(half).not.toBe(BALL_WHITE)
    expect(half).not.toBe(PALETTE[0])
    const from = channels(BALL_WHITE)
    const to = channels(PALETTE[0])
    channels(half).forEach((value, i) => {
      expect(value).toBeGreaterThanOrEqual(Math.min(from[i], to[i]))
      expect(value).toBeLessThanOrEqual(Math.max(from[i], to[i]))
    })
    wait(BALL_BLEND_MS / 2 - 100)
    expect(tintHex()).not.toBe(PALETTE[0])
    wait(100)
    expect(tintHex()).toBe(PALETTE[0])
    wait(3000)
    expect(tintHex()).toBe(PALETTE[0])
  })

  it("comes steadily closer to the new colour while it moves", () => {
    const away = (hex: string): number => {
      const a = channels(hex)
      const b = channels(PALETTE[0])
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    }
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const seen: number[] = [away(tintHex())]
    for (let i = 0; i < 4; i++) {
      wait(BALL_BLEND_MS / 4)
      seen.push(away(tintHex()))
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeLessThan(seen[i - 1])
    expect(seen.at(-1)).toBe(0)
  })

  it("goes on from the first colour to the second at the deep cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[0])
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    expect(tintHex()).toBe(PALETTE[1])
  })

  it("leaves no timer behind when the screen goes away in the middle of a colour step", () => {
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

  it("keeps its colour while it fades, and does not start to move towards white", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS - 100)
    expect(tintHex()).toBe(PALETTE[1])
  })

  it("does not turn back towards white while it fades after a colour step was on its way: it goes on to the colour it was moving to", () => {
    const away = (hex: string): number => {
      const a = channels(hex)
      const b = channels(PALETTE[0])
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    }
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(1000)
    show({ active: false, seconds: 0, seed: "" })
    let before = away(tintHex())
    expect(before).toBeGreaterThan(0)
    for (let i = 0; i < 4; i++) {
      wait(150)
      const now = away(tintHex())
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

  it("lights a new background when the seed changes while a session is shown, and it starts white", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    show({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(state.mounts).toBe(2)
    expect(tintHex()).toBe(BALL_WHITE)
  })

  it("does not light a new background when only the seed text is gone for a moment of a running session", () => {
    show({ active: true, seconds: 100 })
    show({ active: true, seconds: 101, seed: "" })
    expect(state.mounts).toBe(1)
  })

  it("starts a new session white, also after a long one", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS)
    show({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(tintHex()).toBe(BALL_WHITE)
  })
})

describe("TimerBackground: when the library breaks", () => {
  it("leaves the background out and keeps the rest of the page", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {})
    state.broken = true
    show({ active: true })
    expect(has("#siderays-stub")).toBe(false)
    expect(has(".ab-timer-bg-tint")).toBe(false)
    expect(has("#after")).toBe(true)
    quiet.mockRestore()
  })
})

describe("TimerBackground: the same colour as the glowing ball", () => {
  it("has the colour of the ball at every moment of a long session, also in the middle of every colour step", () => {
    showBoth({ active: true, seconds: 0 })
    expect(tintHex()).toBe(lastBallColour())
    for (const seconds of [0, SOLID_FROM_SECONDS - 1, SOLID_FROM_SECONDS, SOLID_FROM_SECONDS + 30, DEEP_FROM_SECONDS - 1, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS - 1, FLOW_FROM_SECONDS, FLOW_FROM_SECONDS * 2]) {
      showBoth({ active: true, seconds })
      expect(tintHex()).toBe(lastBallColour())
      for (let i = 0; i < 18; i++) {
        wait(250)
        expect(tintHex()).toBe(lastBallColour())
      }
    }
    expect(tintHex()).toBe(PALETTE[2])
  })

  it("has the colour of the ball when the page is opened in the middle of a session", () => {
    showBoth({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    expect(lastBallColour()).toBe(PALETTE[1])
  })

  it("starts white together with a new ball for the next session, also after a long one", () => {
    showBoth({ active: true, seconds: FLOW_FROM_SECONDS + 5 })
    showBoth({ active: false, seconds: 0, seed: "" })
    wait(Math.max(BG_FADE_MS, BALL_FADE_MS))
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has(".ab-timer-ball")).toBe(false)
    showBoth({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(tintHex()).toBe(BALL_WHITE)
    expect(lastBallColour()).toBe(BALL_WHITE)
    for (let i = 0; i < 4; i++) {
      wait(500)
      expect(tintHex()).toBe(lastBallColour())
    }
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

  it("has a tint layer that multiplies the white rays with its colour, over the whole box", () => {
    const tint = block(".ab-timer-bg-tint")
    expect(tint).toContain("mix-blend-mode: multiply;")
    expect(tint).toContain("position: absolute;")
    expect(tint).toContain("inset: 0;")
  })

  it("has a plain black behind the rays, so that the tint layer colours only the rays and not the empty parts of the canvas", () => {
    expect(block(".ab-timer-bg")).toContain("background: #000;")
  })

  it("draws the tint layer above the library's own box, which has a z-index of its own", () => {
    const library = readFileSync("src/components/SideRays.tsx", "utf8")
    const libraryZ = Number(/z-\[(\d+)\]/.exec(library)?.[1])
    const tintZ = Number(/z-index:\s*(\d+);/.exec(block(".ab-timer-bg-tint"))?.[1])
    expect(libraryZ).toBeGreaterThan(0)
    expect(tintZ).toBeGreaterThan(libraryZ)
  })

  it("lets the canvas of the library fill its place without a gap under it", () => {
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

  it("gives the line under the dial a dark shadow, so that it can be read over a bright ray", () => {
    expect(block(".ab-timer-note")).toContain("text-shadow:")
  })
})
// AB:TIMER.TESTS:END
