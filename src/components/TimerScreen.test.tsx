// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The timer hook is replaced by a view that each test fills in, so this file only tests what the screen draws and which buttons it wires.
const state = vi.hoisted(() => ({ view: null as unknown }))
vi.mock("@/lib/useTimer", () => ({ useTimer: () => state.view }))

// The glowing ball is replaced by a stand-in that records what the screen hands to it (the ball itself is tested in TimerBall.test.tsx).
const ball = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }))
vi.mock("@/components/TimerBall", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      ball.props.push(props)
      return h("div", { id: "ball-stub" })
    },
  }
})

// The moving background is replaced by a stand-in too, in the same way (it is tested in TimerBackground.test.tsx).
const background = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }))
vi.mock("@/components/TimerBackground", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      background.props.push(props)
      return h("div", { id: "background-stub" })
    },
  }
})

import { formatClock, qualityOf } from "@/lib/timerMaths"
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
  ball.props = []
  background.props = []
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

describe("TimerScreen: the ball", () => {
  const lastBall = (): Record<string, unknown> => {
    const last = ball.props.at(-1)
    if (last === undefined) throw new Error("the ball was not drawn")
    return last
  }

  it("tells the ball that no session is running when idle", () => {
    show({ status: "idle", seconds: 0 })
    expect(lastBall().active).toBe(false)
    expect(lastBall().paused).toBe(false)
  })

  it("hands the seconds and the seed of a running session to the ball", () => {
    show({ status: "running", seconds: 3725, ringSeed: SEED })
    expect(lastBall()).toEqual({ active: true, paused: false, seconds: 3725, seed: SEED })
  })

  it("tells the ball that the session is paused", () => {
    show({ status: "paused", seconds: 1800, ringSeed: SEED })
    expect(lastBall()).toEqual({ active: true, paused: true, seconds: 1800, seed: SEED })
  })

  it("puts the ball inside the dial before the clocks, so that the digits are drawn over it", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const stub = q("#ball-stub")
    expect(stub.parentElement?.classList.contains("ab-timer-dial")).toBe(true)
    expect(stub.compareDocumentPosition(q(".ab-timer-readout")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("has no ring any more", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    expect(has("svg")).toBe(false)
    expect(has(".ab-timer-ring")).toBe(false)
  })
})

describe("TimerScreen: the background", () => {
  const lastBackground = (): Record<string, unknown> => {
    const last = background.props.at(-1)
    if (last === undefined) throw new Error("the background was not drawn")
    return last
  }

  it("tells the background that no session is running when idle", () => {
    show({ status: "idle", seconds: 0 })
    expect(lastBackground().active).toBe(false)
  })

  it("hands the seconds and the seed of a running session to the background, and nothing else", () => {
    show({ status: "running", seconds: 3725, ringSeed: SEED })
    expect(lastBackground()).toEqual({ active: true, seconds: 3725, seed: SEED })
  })

  it("keeps the background lit while the session is paused", () => {
    show({ status: "paused", seconds: 1800, ringSeed: SEED })
    expect(lastBackground()).toEqual({ active: true, seconds: 1800, seed: SEED })
  })

  it("puts the background first inside the screen, before the dial, so that everything else is drawn over it", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const stub = q("#background-stub")
    expect(stub.parentElement?.classList.contains("ab-timer")).toBe(true)
    expect(stub.parentElement?.firstElementChild).toBe(stub)
    expect(stub.compareDocumentPosition(q(".ab-timer-dial")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe("TimerScreen: the desktop layout (structure)", () => {
  it("puts the line and the buttons into one box, the right-hand side, directly after the dial and directly inside the screen", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const side = q(".ab-timer-side")
    expect(side.parentElement?.classList.contains("ab-timer")).toBe(true)
    expect(side.previousElementSibling).toBe(q(".ab-timer-dial"))
    expect(side.nextElementSibling).toBeNull()
  })

  it("keeps the line, then the buttons, inside that box, in this order", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const side = q(".ab-timer-side")
    expect(q(".ab-timer-note").parentElement).toBe(side)
    expect(q(".ab-timer-actions").parentElement).toBe(side)
    expect(q(".ab-timer-note").compareDocumentPosition(q(".ab-timer-actions")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("keeps Pause and the Hold Button inside the buttons box inside that box", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const actions = q(".ab-timer-actions")
    expect(q(".ab-timer-pill").parentElement).toBe(actions)
    expect(q(".ab-timer-end").closest(".ab-timer-actions")).toBe(actions)
    expect(q(".ab-timer-end").closest(".ab-timer-side")).toBe(q(".ab-timer-side"))
  })

  it("puts the Try again button between the line and the buttons, inside that box", () => {
    show({ link: "problem", problem: "Something went wrong." })
    const side = q(".ab-timer-side")
    expect(q(".ab-timer-retry").parentElement).toBe(side)
    expect(q(".ab-timer-note").compareDocumentPosition(q(".ab-timer-retry")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(q(".ab-timer-retry").compareDocumentPosition(q(".ab-timer-actions")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("keeps the box and its two children while loading, so that the layout does not jump", () => {
    show({ link: "loading" })
    const side = q(".ab-timer-side")
    expect(side.contains(q(".ab-timer-note"))).toBe(true)
    expect(side.contains(q(".ab-timer-actions"))).toBe(true)
  })

  it("keeps the dial free of the line and the buttons: only the ball and the two clocks are in it", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const dial = q(".ab-timer-dial")
    expect(dial.contains(q("#ball-stub"))).toBe(true)
    expect(dial.contains(q(".ab-timer-readout"))).toBe(true)
    expect(dial.contains(q(".ab-timer-side"))).toBe(false)
    expect(dial.contains(q(".ab-timer-note"))).toBe(false)
    expect(dial.contains(q(".ab-timer-actions"))).toBe(false)
  })

  it("has the screen's children in the order background, dial, side", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const kids = Array.from(q(".ab-timer").children)
    expect(kids.map((k) => k.id || k.className)).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
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
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-ball {')
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-big {')
    expect(timerCss).toContain('.ab-timer[data-link="loading"] .ab-timer-dial {')
  })
})
describe("the css of the screen: the desktop layout", () => {
  const HEADER = "@media (min-width: 1000px) and (min-height: 560px), (min-width: 600px) and (min-aspect-ratio: 5/4) {"
  const escape = (selector: string): string => selector.replace(/\./g, "\\.")

  // The text between the braces of the wide-screen rule, found by counting braces.
  function wideRules(): string {
    const start = timerCss.indexOf(HEADER)
    if (start < 0) return ""
    let depth = 0
    for (let i = start + HEADER.length - 1; i < timerCss.length; i++) {
      if (timerCss[i] === "{") depth++
      else if (timerCss[i] === "}") {
        depth--
        if (depth === 0) return timerCss.slice(start + HEADER.length, i)
      }
    }
    return ""
  }

  // A rule of the wide-screen block, and a rule of the phone (top level, at the start of a line).
  const wide = (selector: string): string => new RegExp("\\n\\s*" + escape(selector) + " \\{([^}]*)\\}").exec("\n" + wideRules())?.[1] ?? ""
  const phone = (selector: string): string => new RegExp("\\n" + escape(selector) + " \\{([^}]*)\\}").exec("\n" + timerCss)?.[1] ?? ""

  it("has exactly one wide-screen rule: a laptop (1000 px wide and 560 px high) or any window at least 600 px wide and wider than 5 to 4", () => {
    expect(timerCss.split(HEADER).length - 1).toBe(1)
    expect(wideRules()).not.toBe("")
    expect(HEADER).toContain("(min-width: 1000px) and (min-height: 560px)")
    expect(HEADER).toContain("(min-width: 600px) and (min-aspect-ratio: 5/4)")
  })

  it("leaves room for the dial in the narrowest two-column window: at 600 px the dial column is not smaller than the smallest phone dial", () => {
    const columns = /grid-template-columns:\s*minmax\(0, 1fr\)\s+(\d+)px/.exec(wide(".ab-timer"))?.[1]
    const gap = Number(/column-gap:\s*clamp\((\d+)px/.exec(wide(".ab-timer"))?.[1])
    const side = Number(/padding:\s*\d+px clamp\((\d+)px/.exec(wide(".ab-timer"))?.[1])
    const floor = Number(/max\((\d+)px, calc\(100dvh/.exec(phone(".ab-timer-dial"))?.[1])
    const narrowest = Number(/\(min-width: (\d+)px\) and \(min-aspect-ratio/.exec(HEADER)?.[1])
    expect(floor).toBeGreaterThan(0)
    expect(narrowest - Number(columns) - gap - 2 * side).toBeGreaterThanOrEqual(floor)
  })

  it("lies inside the screen's own tagged part of the css", () => {
    // The two marker lines are written in two pieces here, so that the tag checker does not take them for markers of this test file.
    const marker = (edge: string): string => "/* A" + "B:TIMER.SCREEN:" + edge + " */"
    const at = timerCss.indexOf(HEADER)
    expect(timerCss.indexOf(marker("START"))).toBeGreaterThan(-1)
    expect(timerCss.indexOf(marker("START"))).toBeLessThan(at)
    expect(timerCss.indexOf(marker("END"))).toBeGreaterThan(at)
  })

  it("comes AFTER every phone rule it replaces, because it replaces them by being later", () => {
    const at = timerCss.indexOf(HEADER)
    for (const selector of [".ab-timer", ".ab-timer-dial", ".ab-timer-readout", ".ab-timer-big", ".ab-timer-small", ".ab-timer-side"]) {
      const first = timerCss.indexOf("\n" + selector + " {")
      expect(first, selector).toBeGreaterThan(-1)
      expect(first, selector).toBeLessThan(at)
    }
  })

  it("makes the screen two columns, with the dial in the first and the side in the second", () => {
    const screen = wide(".ab-timer")
    expect(screen).toContain("display: grid;")
    expect(screen).toContain("grid-template-columns: minmax(0, 1fr) 340px;")
    expect(wide(".ab-timer-dial")).toContain("grid-column: 1;")
    expect(wide(".ab-timer-side")).toContain("grid-column: 2;")
  })

  it("makes the right-hand column at least as wide as the buttons, so that the buttons are never squeezed", () => {
    const column = Number(/grid-template-columns:\s*minmax\(0, 1fr\)\s+(\d+)px/.exec(wide(".ab-timer"))?.[1])
    const buttons = Number(/max-width:\s*(\d+)px/.exec(phone(".ab-timer-actions"))?.[1])
    expect(buttons).toBeGreaterThan(0)
    expect(column).toBeGreaterThanOrEqual(buttons)
  })

  it("centres the right-hand side as a column in the middle of the height", () => {
    const side = wide(".ab-timer-side")
    expect(side).toContain("display: flex;")
    expect(side).toContain("flex-direction: column;")
    expect(side).toContain("align-items: center;")
    expect(side).toContain("justify-content: center;")
    expect(wide(".ab-timer")).toContain("align-items: center;")
  })

  it("makes the dial a big circle that never grows taller than the screen allows", () => {
    const dial = wide(".ab-timer-dial")
    expect(dial).toContain("width: min(100%, calc(100dvh - 168px), 780px);")
    expect(dial).toContain("justify-self: center;")
    expect(phone(".ab-timer-dial")).toContain("aspect-ratio: 1;")
  })

  it("keeps the phone as it was: one column, and the box of the side is no box at all", () => {
    const screen = phone(".ab-timer")
    expect(screen).toContain("display: flex;")
    expect(screen).toContain("flex-direction: column;")
    expect(phone(".ab-timer-side")).toContain("display: contents;")
  })

  it("lets the digits grow with the dial, with the same share of the dial as on the phone", () => {
    expect(phone(".ab-timer-readout")).toContain("container-type: inline-size;")
    const phoneBig = Number(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/.exec(phone(".ab-timer-big"))?.[1]) * 16
    const phoneSmall = Number(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/.exec(phone(".ab-timer-small"))?.[1]) * 16
    const phoneDial = Number(/min\(\d+vw,\s*(\d+)px,/.exec(phone(".ab-timer-dial"))?.[1])
    const bigShare = Number(/font-size:\s*([\d.]+)cqw;/.exec(wide(".ab-timer-big"))?.[1])
    const smallShare = Number(/font-size:\s*([\d.]+)cqw;/.exec(wide(".ab-timer-small"))?.[1])
    expect(bigShare).toBeCloseTo((phoneBig / phoneDial) * 100, 5)
    expect(smallShare).toBeCloseTo((phoneSmall / phoneDial) * 100, 5)
    // The phone digits are held to the same share, so that they also shrink with a dial that the window height made smaller.
    expect(Number(/,\s*([\d.]+)cqw\)/.exec(phone(".ab-timer-big"))?.[1])).toBe(bigShare)
    expect(Number(/,\s*([\d.]+)cqw\)/.exec(phone(".ab-timer-small"))?.[1])).toBe(smallShare)
  })

  it("never touches what keeps the ball clipped and the buttons tappable (overflow, stacking, pointer events)", () => {
    const all = wideRules()
    for (const word of ["overflow", "z-index", "pointer-events", "position:", "isolation", "mix-blend-mode"]) {
      expect(all, word).not.toContain(word)
    }
  })

  it("leaves the clip, the stacking and the dim of the phone rules in place", () => {
    expect(phone(".ab-timer")).toContain("overflow: hidden;")
    expect(phone(".ab-timer")).toContain("isolation: isolate;")
    expect(phone(".ab-timer-dial")).toContain("z-index: 1;")
    expect(phone(".ab-timer-actions")).toContain("z-index: 1;")
    expect(phone(".ab-timer-note")).toContain("z-index: 1;")
  })
})
describe("the css of the screen: the phone fits the window", () => {
  const block = (selector: string): string => new RegExp("\\n" + selector.replace(/[.[\]="]/g, "\\$&") + " \\{([^}]*)\\}").exec("\n" + timerCss)?.[1] ?? ""
  const px = (text: string, pattern: RegExp): number => Number(pattern.exec(text)?.[1])
  const reserve = (text: string): number => px(text, /--ab-timer-reserve:\s*(\d+)px;/)

  // Everything that stands above and below the dial in the one-column screen, taken from the css itself: the padding, two gaps, the line (one text line) and the buttons box.
  function stack(): number {
    const screen = block(".ab-timer")
    const padding = /padding:\s*(\d+)px \d+px (\d+)px;/.exec(screen)
    const gap = px(screen, /\n\s*gap:\s*(\d+)px;/)
    const line = px(block(".ab-timer-note"), /font-size:\s*(\d+)px;/) * Number(/min-height:\s*([\d.]+)em;/.exec(block(".ab-timer-note"))?.[1])
    const buttons = px(block(".ab-timer-actions"), /min-height:\s*(\d+)px;/)
    return Number(padding?.[1]) + Number(padding?.[2]) + 2 * gap + line + buttons
  }

  it("makes the dial as high as the window allows, but never smaller than 150 px and never bigger than before", () => {
    expect(block(".ab-timer-dial")).toContain("width: min(84vw, 400px, max(150px, calc(100dvh - var(--ab-timer-reserve))));")
    expect(block(".ab-timer-dial")).toContain("aspect-ratio: 1;")
  })

  it("reserves exactly the room the other things need: the reserve is the height of the stack, plus at most 6 px", () => {
    expect(stack()).toBe(297)
    expect(reserve(block(".ab-timer"))).toBeGreaterThanOrEqual(stack())
    expect(reserve(block(".ab-timer"))).toBeLessThanOrEqual(stack() + 6)
  })

  it("reserves more when the connection has a problem: the second text line, the gap and the Try again button", () => {
    const problem = block('.ab-timer[data-link="problem"]')
    const retry = block(".ab-timer-retry")
    const retryHeight = 2 * px(retry, /padding:\s*(\d+)px/) + 2 + px(retry, /font-size:\s*(\d+)px;/) * 1.5
    const extra = px(block(".ab-timer-note"), /font-size:\s*(\d+)px;/) * 1.4 + px(block(".ab-timer"), /\n\s*gap:\s*(\d+)px;/) + retryHeight
    expect(reserve(problem)).toBeGreaterThanOrEqual(reserve(block(".ab-timer")) + Math.floor(extra) - 1)
    expect(reserve(problem)).toBeLessThanOrEqual(stack() + extra + 6)
  })

  it("keeps the problem rule in the screen's part of the css, before the wide-screen rule, and the wide rules never use the reserve", () => {
    const at = timerCss.indexOf('.ab-timer[data-link="problem"] {')
    expect(at).toBeGreaterThan(-1)
    expect(at).toBeLessThan(timerCss.indexOf("@media (min-width: 1000px)"))
    const start = timerCss.indexOf("@media (min-width: 1000px)")
    const wideText = timerCss.slice(start, timerCss.indexOf("/* A" + "B:TIMER.SCREEN:END */"))
    expect(wideText).not.toContain("--ab-timer-reserve")
  })

  it("holds the digits of the phone to a share of the dial, so that they shrink with a dial the window made smaller", () => {
    expect(block(".ab-timer-readout")).toContain("container-type: inline-size;")
    expect(block(".ab-timer-big")).toContain("font-size: min(clamp(2.4rem, 13vw, 4.25rem), 17cqw);")
    expect(block(".ab-timer-small")).toContain("font-size: min(clamp(1.05rem, 4.6vw, 1.5rem), 6cqw);")
  })
})
// AB:TIMER.TESTS:END
