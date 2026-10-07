// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The timer hook is replaced by a view that each test fills in, so this file only tests what the screen draws and which buttons it wires.
const state = vi.hoisted(() => ({ view: null as unknown }))
vi.mock("@/lib/useTimer", () => ({ useTimer: () => state.view }))

import { RING_FIRST_COLOR, formatClock, qualityOf, ringColor, ringFill, ringLoop } from "@/lib/timerMaths"
import type { TimerView } from "@/lib/useTimer"
import TimerScreen from "./TimerScreen"

// AB:TIMER.TESTS:START
// The css files are read as plain text from the project root, where npm test runs (vitest turns an imported css file into nothing, also with ?raw).
const timerCss = readFileSync("src/timer.css", "utf8")
const fontCss = readFileSync("node_modules/@fontsource-variable/space-grotesk/index.css", "utf8")

const SEED = "2026-10-07T10:00:00+00:00"

function makeView(over: Partial<TimerView> = {}): TimerView {
  return {
    link: "online",
    problem: "",
    busy: false,
    status: "idle",
    seconds: 0,
    dayTotal: 0,
    ringSeed: "",
    notice: null,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    end: vi.fn(),
    retry: vi.fn(),
    ...over,
  }
}

let root: Root | null = null
let container: HTMLElement | null = null

function show(over: Partial<TimerView> = {}): TimerView {
  const view = makeView(over)
  state.view = view
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(TimerScreen)))
  return view
}

function q(selector: string): HTMLElement {
  const found = container?.querySelector<HTMLElement>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function pointer(type: string): Event {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0 })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  // The Hold Button watches its own size; jsdom has no ResizeObserver.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.useFakeTimers()
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("TimerScreen: what it shows", () => {
  it("shows the big clock of the session and the small clock of the day", () => {
    show({ status: "running", seconds: 3725, dayTotal: 7300 })
    expect(q(".ab-timer-big").textContent).toBe(formatClock(3725))
    expect(q(".ab-timer-big").getAttribute("role")).toBe("timer")
    expect(q(".ab-timer-small").textContent).toBe(formatClock(7300))
  })

  it("hands its state to the css as two attributes of the main element", () => {
    show({ link: "loading", status: "idle" })
    expect(q("main.ab-timer").getAttribute("data-state")).toBe("idle")
    expect(q("main.ab-timer").getAttribute("data-link")).toBe("loading")
    show({ link: "online", status: "paused", seconds: 100 })
    expect(q("main.ab-timer").getAttribute("data-state")).toBe("paused")
    expect(q("main.ab-timer").getAttribute("data-link")).toBe("online")
  })

  it("keeps the line under the dial empty when there is nothing to say", () => {
    show()
    expect(q(".ab-timer-note").textContent).toBe("")
  })

  it("says that there is no connection", () => {
    show({ link: "offline" })
    expect(q(".ab-timer-note").textContent).toContain("No connection")
  })

  it("shows the problem text and a Try again button that reads again", () => {
    const view = show({ link: "problem", problem: "The timer got an answer it could not read." })
    expect(q(".ab-timer-note").textContent).toBe("The timer got an answer it could not read.")
    act(() => q(".ab-timer-retry").click())
    expect(view.retry).toHaveBeenCalledTimes(1)
  })

  it("has no Try again button when there is no problem", () => {
    show({ link: "online" })
    expect(has(".ab-timer-retry")).toBe(false)
    show({ link: "offline" })
    expect(has(".ab-timer-retry")).toBe(false)
  })

  it("tells what happened to the session that was just ended", () => {
    show({ notice: { saved: true, capped: false, seconds: 2000 } })
    const saved = q(".ab-timer-note").textContent ?? ""
    expect(saved).toContain("Saved " + formatClock(2000))
    expect(saved).toContain(qualityOf(2000))
    expect(saved).not.toContain("midnight")
    show({ notice: { saved: false, capped: false, seconds: null } })
    expect(q(".ab-timer-note").textContent).toContain("not saved")
    show({ notice: { saved: true, capped: true, seconds: 600 } })
    expect(q(".ab-timer-note").textContent).toContain("Day ended at midnight.")
    expect(q(".ab-timer-note").textContent).toContain("Saved " + formatClock(600))
    show({ notice: { saved: false, capped: true, seconds: null } })
    expect(q(".ab-timer-note").textContent).toContain("Day ended at midnight.")
    expect(q(".ab-timer-note").textContent).toContain("not saved")
  })

  it("a session that was not saved says so, whatever the seconds in the notice say", () => {
    show({ notice: { saved: false, capped: false, seconds: 125 } })
    expect(q(".ab-timer-note").textContent).toContain("not saved")
    expect(q(".ab-timer-note").textContent).not.toContain("Saved")
  })

  it("puts no connection and problems before the notice", () => {
    const notice = { saved: true, capped: false, seconds: 2000 }
    show({ link: "offline", notice })
    expect(q(".ab-timer-note").textContent).toContain("No connection")
    show({ link: "problem", problem: "Something went wrong.", notice })
    expect(q(".ab-timer-note").textContent).toBe("Something went wrong.")
  })
})

describe("TimerScreen: the ring", () => {
  it("is drawn in a box of 100 with a radius of 45, starting at the top", () => {
    show()
    expect(q("svg.ab-timer-ring").getAttribute("viewBox")).toBe("0 0 100 100")
    for (const selector of [".ab-timer-track", ".ab-timer-arc"]) {
      expect(q(selector).getAttribute("r")).toBe("45")
      expect(q(selector).getAttribute("cx")).toBe("50")
      expect(q(selector).getAttribute("cy")).toBe("50")
      expect(q(selector).getAttribute("transform")).toBe("rotate(-90 50 50)")
    }
    expect(q(".ab-timer-arc").getAttribute("pathLength")).toBe("1")
  })

  it("is empty when idle", () => {
    show({ status: "idle", seconds: 0 })
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("0")
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe("0 1")
  })

  it("is empty when idle, whatever the seconds say", () => {
    show({ status: "idle", seconds: 1234, ringSeed: SEED })
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("0")
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe("0 1")
  })

  it("fills the first loop in white, and the track is a faint white", () => {
    show({ status: "running", seconds: 1800, ringSeed: SEED })
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe(ringFill(1800) + " 1")
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("1")
    expect(q(".ab-timer-arc").getAttribute("stroke")).toBe(RING_FIRST_COLOR)
    expect(q(".ab-timer-track").getAttribute("stroke")).toBe("rgba(255, 255, 255, 0.14)")
  })

  it("starts the second loop in a neon colour on a track in the colour of the loop before", () => {
    show({ status: "running", seconds: 3725, ringSeed: SEED })
    expect(ringLoop(3725)).toBe(1)
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe(ringFill(3725) + " 1")
    expect(q(".ab-timer-arc").getAttribute("stroke")).toBe(ringColor(1, SEED))
    expect(q(".ab-timer-arc").getAttribute("stroke")).not.toBe(RING_FIRST_COLOR)
    expect(q(".ab-timer-track").getAttribute("stroke")).toBe(ringColor(0, SEED))
  })

  it("shows a paused session with its ring in place", () => {
    show({ status: "paused", seconds: 1800, ringSeed: SEED })
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe(ringFill(1800) + " 1")
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("1")
  })
})

describe("TimerScreen: the buttons", () => {
  it("shows nothing to press while the first reading is loading", () => {
    show({ link: "loading" })
    expect(has("button")).toBe(false)
  })

  it("idle: one Start button, and it starts", () => {
    const view = show({ status: "idle" })
    expect(q(".ab-timer-pill").textContent).toBe("Start")
    expect(has(".ab-timer-end")).toBe(false)
    act(() => q(".ab-timer-pill").click())
    expect(view.start).toHaveBeenCalledTimes(1)
  })

  it("running: Pause and the Hold Button, no Start; Pause pauses", () => {
    const view = show({ status: "running", seconds: 100 })
    expect(q(".ab-timer-pill").textContent).toBe("Pause")
    expect(q(".ab-timer-end").textContent).toContain("Hold to end session")
    expect(document.querySelectorAll(".ab-timer-pill").length).toBe(1)
    act(() => q(".ab-timer-pill").click())
    expect(view.pause).toHaveBeenCalledTimes(1)
    expect(view.resume).not.toHaveBeenCalled()
  })

  it("paused: Resume and the Hold Button; Resume resumes", () => {
    const view = show({ status: "paused", seconds: 100 })
    expect(q(".ab-timer-pill").textContent).toBe("Resume")
    expect(has(".ab-timer-end")).toBe(true)
    act(() => q(".ab-timer-pill").click())
    expect(view.resume).toHaveBeenCalledTimes(1)
    expect(view.pause).not.toHaveBeenCalled()
  })

  it.each([
    ["without a connection", { link: "offline" as const }],
    ["while a call is on its way", { busy: true }],
    ["after a problem", { link: "problem" as const, problem: "x" }],
  ])("every button is off %s", (_name, extra) => {
    show({ status: "idle", ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    show({ status: "running", seconds: 100, ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(true)
    show({ status: "paused", seconds: 100, ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(true)
  })

  it("every button is on when online and not busy", () => {
    show({ status: "running", seconds: 100 })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(false)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(false)
  })

  it("the Hold Button ends the session only after it was held for 1.5 seconds", async () => {
    const view = show({ status: "running", seconds: 100 })
    const hold = q(".ab-timer-end")
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(1400)
    })
    expect(view.end).not.toHaveBeenCalled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(view.end).toHaveBeenCalledTimes(1)
  })

  it("a short tap or a hold that is let go early does not end the session", async () => {
    const view = show({ status: "running", seconds: 100 })
    const hold = q(".ab-timer-end")
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(100)
      hold.dispatchEvent(pointer("pointerup"))
      await vi.advanceTimersByTimeAsync(3000)
    })
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(1000)
      hold.dispatchEvent(pointer("pointerup"))
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(view.end).not.toHaveBeenCalled()
  })
})

describe("the css of the screen", () => {
  it("keeps the stroke width of the ring at 10 or less, so the ring (radius 45 in a box of 100) stays inside its box", () => {
    const widths = [...timerCss.matchAll(/stroke-width:\s*([0-9.]+)/g)].map((m) => Number(m[1]))
    expect(widths.length).toBeGreaterThan(0)
    for (const width of widths) expect(45 + width / 2).toBeLessThanOrEqual(50)
  })

  it("loads Space Grotesk, names the font as the package does, and uses a weight the font has", () => {
    expect(timerCss).toContain('@import "@fontsource-variable/space-grotesk";')
    const screenBlock = /\.ab-timer \{([^}]*)\}/.exec(timerCss)?.[1] ?? ""
    const family = /font-family:\s*"([^"]+)"/.exec(screenBlock)?.[1] ?? ""
    expect(family).toBe("Space Grotesk Variable")
    expect(fontCss).toContain("font-family: '" + family + "'")
    expect(fontCss).toContain("font-weight: 300 700")
    for (const selector of [".ab-timer-big", ".ab-timer-small"]) {
      const block = new RegExp("\\" + selector + " \\{([^}]*)\\}").exec(timerCss)?.[1] ?? ""
      const weight = Number(/font-weight:\s*(\d+)/.exec(block)?.[1])
      expect(weight).toBeGreaterThanOrEqual(300)
      expect(weight).toBeLessThanOrEqual(700)
    }
  })

  it("switches on the fixed width digits for both clocks", () => {
    for (const selector of [".ab-timer-big", ".ab-timer-small"]) {
      const block = new RegExp("\\" + selector + " \\{([^}]*)\\}").exec(timerCss)?.[1] ?? ""
      expect(block).toContain("font-variant-numeric: tabular-nums;")
    }
  })

  it("reacts to the two attributes the screen sets", () => {
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-ring {')
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-big {')
    expect(timerCss).toContain('.ab-timer[data-link="loading"] .ab-timer-dial {')
  })
})
// AB:TIMER.TESTS:END
