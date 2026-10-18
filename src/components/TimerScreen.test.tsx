// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The timer hook is replaced by a view that each test fills in, so this file only tests what the screen draws and which buttons it wires.
const state = vi.hoisted(() => ({ view: null as unknown }))
// The screen hands the hook what it draws (the option drawn); the stand-in keeps the options so a test can read them.
const hook = vi.hoisted(() => ({ options: null as unknown }))
vi.mock("@/lib/useTimer", () => ({
  useTimer: (options: unknown) => {
    hook.options = options
    return state.view
  },
}))

// The lite level is read from the browser when the file is imported (matchMedia, which jsdom does not have), so it is replaced by a fixed level that a test can change.
const lite = vi.hoisted(() => ({ level: 0 }))
vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return lite.level
  },
}))

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

import { MILESTONE_FADE_MS, MILESTONE_SHOW_MS } from "@/lib/milestoneLines"
import { COMEBACK_FADE_MS, COMEBACK_SHOW_MS } from "@/lib/stopAlertLines"
import { forgetWarmup } from "@/lib/timerWarmup"
import { formatClock, qualityOf } from "@/lib/timerMaths"
import type { TimerTag } from "@/lib/timerApi"
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
    stopAlert: null,
    comeback: null,
    milestone: null,
    tags: [],
    tagId: null,
    runningTag: null,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    end: vi.fn(),
    goBack: vi.fn(),
    clearComeback: vi.fn(),
    clearMilestone: vi.fn(),
    chooseTag: vi.fn(),
    reloadTags: vi.fn(),
    addTag: vi.fn(async () => ({ ok: true as const })),
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
    expect(lastBackground().paused).toBe(false)
  })

  it("hands the seconds and the seed of a running session to the background, and that it is not paused, and nothing else", () => {
    show({ status: "running", seconds: 3725, ringSeed: SEED })
    expect(lastBackground()).toEqual({ active: true, paused: false, seconds: 3725, seed: SEED })
  })

  it("keeps the background lit while the session is paused, and tells it that the session is paused (its flow stands still then)", () => {
    show({ status: "paused", seconds: 1800, ringSeed: SEED })
    expect(lastBackground()).toEqual({ active: true, paused: true, seconds: 1800, seed: SEED })
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

  it("shows a faint blank pill where the buttons will be while loading: no text, hidden from screen readers, not a button", () => {
    show({ link: "loading" })
    const wait = q(".ab-timer-actions .ab-timer-wait")
    expect(wait.textContent).toBe("")
    expect(wait.getAttribute("aria-hidden")).toBe("true")
    expect(wait.tagName).toBe("DIV")
    expect(has(".ab-timer-pill")).toBe(false)
    expect(has(".ab-timer-end")).toBe(false)
  })

  it("never shows a Start label while loading, so that a running session does not show a wrong button for a moment", () => {
    show({ link: "loading", status: "running", seconds: 100 })
    expect(q(".ab-timer-actions").textContent).toBe("")
  })

  it("takes the blank pill away when the reading is there, for the idle button, and for the running ones", () => {
    show({ link: "loading" })
    expect(has(".ab-timer-wait")).toBe(true)
    show({ link: "online", status: "idle" })
    expect(has(".ab-timer-wait")).toBe(false)
    expect(q(".ab-timer-pill").textContent).toBe("Start")
    show({ link: "loading" })
    show({ link: "online", status: "running", seconds: 50 })
    expect(has(".ab-timer-wait")).toBe(false)
    expect(q(".ab-timer-pill").textContent).toBe("Pause")
    expect(has(".ab-timer-end")).toBe(true)
  })

  it("keeps the blank pill out of the screen when there is no connection or a problem, where the buttons are the real ones", () => {
    show({ link: "offline", status: "idle" })
    expect(has(".ab-timer-wait")).toBe(false)
    show({ link: "problem", problem: "Something went wrong.", status: "idle" })
    expect(has(".ab-timer-wait")).toBe(false)
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

  it("the Hold Button stops the session (opens the stop alert) only after it was held for 1.5 seconds, and never ends it by itself", async () => {
    const view = show({ status: "running", seconds: 100 })
    const hold = q(".ab-timer-end")
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(1400)
    })
    expect(view.stop).not.toHaveBeenCalled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(view.stop).toHaveBeenCalledTimes(1)
    expect(view.end).not.toHaveBeenCalled()
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
    expect(view.stop).not.toHaveBeenCalled()
    expect(view.end).not.toHaveBeenCalled()
  })
})

describe("TimerScreen: the stop alert", () => {
  const ALERT = { line: "Ten minutes. [glow:Solid.] Stay.", canGoBack: true }

  it("shows no alert when the hook has none, and the screen keeps its three children", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    expect(has(".ab-alert")).toBe(false)
    expect(q(".ab-timer-side").hasAttribute("inert")).toBe(false)
  })

  it("shows the alert as the LAST child of the screen, after the side, with the line without its marks", () => {
    show({ status: "paused", seconds: 600, ringSeed: SEED, stopAlert: ALERT })
    const kids = Array.from(q(".ab-timer").children)
    expect(kids.map((k) => k.id || k.className)).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side", "ab-alert"])
    expect(q(".ab-alert-line").textContent).toBe("Ten minutes. Solid. Stay.")
  })

  it("switches off the buttons under the alert (inert), so that nothing behind it can be pressed or reached with the keyboard", () => {
    show({ status: "paused", seconds: 600, ringSeed: SEED, stopAlert: ALERT })
    expect(q(".ab-timer-side").hasAttribute("inert")).toBe(true)
  })

  it("I'M DONE ends the session and GO BACK IN lets it go on", () => {
    const view = show({ status: "paused", seconds: 600, ringSeed: SEED, stopAlert: ALERT })
    const [done, back] = Array.from(container?.querySelectorAll<HTMLButtonElement>(".ab-alert button") ?? [])
    expect(done.textContent).toBe("I'M DONE")
    expect(back.textContent).toBe("GO BACK IN")
    act(() => done.click())
    expect(view.end).toHaveBeenCalledTimes(1)
    expect(view.goBack).not.toHaveBeenCalled()
    act(() => back.click())
    expect(view.goBack).toHaveBeenCalledTimes(1)
    expect(view.end).toHaveBeenCalledTimes(1)
  })

  it("offers only I'M DONE when GO BACK IN is not allowed (45 minutes and more)", () => {
    show({ status: "paused", seconds: 3000, ringSeed: SEED, stopAlert: { line: "Fifty minutes.", canGoBack: false } })
    expect(q(".ab-alert-done").textContent).toBe("I'M DONE")
    expect(has(".ab-alert-back")).toBe(false)
  })

  it("switches both buttons off without a connection, and says why in the alert", () => {
    show({ link: "offline", status: "paused", seconds: 600, ringSeed: SEED, stopAlert: ALERT })
    expect(q(".ab-alert-done").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-alert-back").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-alert-note").textContent).toBe("No connection. Waiting to reconnect.")
  })

  it("switches both buttons off while a call is working", () => {
    show({ busy: true, status: "paused", seconds: 600, ringSeed: SEED, stopAlert: ALERT })
    expect(q(".ab-alert-done").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-alert-back").hasAttribute("disabled")).toBe(true)
  })

  it("closes when the hook takes the alert away", () => {
    show({ status: "paused", seconds: 600, ringSeed: SEED, stopAlert: ALERT })
    expect(has(".ab-alert")).toBe(true)
    show({ status: "running", seconds: 601, ringSeed: SEED, stopAlert: null })
    expect(has(".ab-alert")).toBe(false)
    expect(q(".ab-timer-side").hasAttribute("inert")).toBe(false)
  })
})

describe("TimerScreen: the comeback message", () => {
  const COMEBACK = { line: "Back in. [glow:Stay.] The clock never left." }

  it("shows no comeback message when the hook has none", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    expect(has(".ab-comeback")).toBe(false)
  })

  it("shows it as a child of the screen after the side, with the line without its marks", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, comeback: COMEBACK })
    const kids = Array.from(q(".ab-timer").children)
    expect(kids.map((k) => k.id || k.className)).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side", "ab-comeback"])
    expect(q(".ab-comeback-line").textContent).toBe("Back in. Stay. The clock never left.")
  })

  it("leaves the stop alert as the LAST child of the screen, if both are there", () => {
    show({ status: "paused", seconds: 100, ringSeed: SEED, comeback: COMEBACK, stopAlert: { line: "Stop?", canGoBack: true } })
    const kids = Array.from(q(".ab-timer").children)
    expect(kids.map((k) => k.id || k.className)).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side", "ab-comeback", "ab-alert"])
  })

  it("does not switch off the buttons: Pause works while the message is there", () => {
    const view = show({ status: "running", seconds: 100, ringSeed: SEED, comeback: COMEBACK })
    expect(q(".ab-timer-side").hasAttribute("inert")).toBe(false)
    const pause = q(".ab-timer-pill")
    expect(pause.textContent).toBe("Pause")
    act(() => pause.click())
    expect(view.pause).toHaveBeenCalledTimes(1)
  })

  it("asks the hook to take it away (clearComeback) after the time and the fade, once", () => {
    const view = show({ status: "running", seconds: 100, ringSeed: SEED, comeback: COMEBACK })
    act(() => {
      vi.advanceTimersByTime(COMEBACK_SHOW_MS + COMEBACK_FADE_MS - 1)
    })
    expect(view.clearComeback).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(view.clearComeback).toHaveBeenCalledTimes(1)
  })

  it("closes at once when the hook takes the message away, and then never asks to clear it", () => {
    const view = show({ status: "running", seconds: 100, ringSeed: SEED, comeback: COMEBACK })
    expect(has(".ab-comeback")).toBe(true)
    show({ status: "paused", seconds: 101, ringSeed: SEED, comeback: null })
    expect(has(".ab-comeback")).toBe(false)
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(view.clearComeback).not.toHaveBeenCalled()
  })
})

describe("TimerScreen: the milestone message", () => {
  const MILESTONE = { line: "Fifteen minutes. The [heat:warm-up] is over.", earlier: null }

  it("shows no milestone message when the hook has none", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    expect(has(".ab-milestone")).toBe(false)
  })

  it("shows it as a child of the screen after the side, with the line without its marks and no tag", () => {
    show({ status: "running", seconds: 900, ringSeed: SEED, milestone: MILESTONE })
    const kids = Array.from(q(".ab-timer").children)
    expect(kids.map((k) => k.id || k.className)).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side", "ab-milestone"])
    expect(q(".ab-milestone-line").textContent).toBe("Fifteen minutes. The warm-up is over.")
    expect(has(".ab-milestone-tag")).toBe(false)
  })

  it("shows the tag when the hook says the message is late", () => {
    show({ status: "running", seconds: 1440, ringSeed: SEED, milestone: { ...MILESTONE, earlier: 9 } })
    expect(q(".ab-milestone-tag").textContent).toBe("9 min earlier")
  })

  it("leaves the stop alert as the LAST child of the screen, with the comeback message before the milestone message", () => {
    show({
      status: "paused",
      seconds: 900,
      ringSeed: SEED,
      comeback: { line: "Back in." },
      milestone: MILESTONE,
      stopAlert: { line: "Stop?", canGoBack: true },
    })
    const kids = Array.from(q(".ab-timer").children)
    expect(kids.map((k) => k.id || k.className)).toEqual([
      "background-stub",
      "ab-timer-dial",
      "ab-timer-side",
      "ab-comeback",
      "ab-milestone",
      "ab-alert",
    ])
  })

  it("does not switch off the buttons: Pause works while the message is there", () => {
    const view = show({ status: "running", seconds: 900, ringSeed: SEED, milestone: MILESTONE })
    expect(q(".ab-timer-side").hasAttribute("inert")).toBe(false)
    const pause = q(".ab-timer-pill")
    expect(pause.textContent).toBe("Pause")
    act(() => pause.click())
    expect(view.pause).toHaveBeenCalledTimes(1)
  })

  it("asks the hook to take it away (clearMilestone) after 30 seconds and the fade, once", () => {
    const view = show({ status: "running", seconds: 900, ringSeed: SEED, milestone: MILESTONE })
    act(() => {
      vi.advanceTimersByTime(MILESTONE_SHOW_MS + MILESTONE_FADE_MS - 1)
    })
    expect(view.clearMilestone).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(view.clearMilestone).toHaveBeenCalledTimes(1)
  })

  it("closes at once when the hook takes the message away, and then never asks to clear it", () => {
    const view = show({ status: "running", seconds: 900, ringSeed: SEED, milestone: MILESTONE })
    expect(has(".ab-milestone")).toBe(true)
    show({ status: "paused", seconds: 901, ringSeed: SEED, milestone: null })
    expect(has(".ab-milestone")).toBe(false)
    act(() => {
      vi.advanceTimersByTime(120_000)
    })
    expect(view.clearMilestone).not.toHaveBeenCalled()
  })
})

describe("TimerScreen: what it tells the hook that it draws", () => {
  type Drawn = () => { ball: boolean }
  const drawn = (): Drawn => {
    const given = (hook.options as { drawn?: Drawn } | null)?.drawn
    if (given === undefined) throw new Error("the screen gave the hook no drawn option")
    return given
  }

  // jsdom cannot make a WebGL 2 context, so the test says whether the browser can.
  function browserCanDrawWebgl2(can: boolean): void {
    forgetWarmup()
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((kind: string) =>
      can && kind === "webgl2" ? { getExtension: () => null } : null) as unknown as HTMLCanvasElement["getContext"])
  }

  afterEach(() => {
    vi.restoreAllMocks()
    forgetWarmup()
    lite.level = 0
  })

  it("gives the hook the option drawn", () => {
    show()
    expect(typeof drawn()).toBe("function")
  })

  it("says the ball is drawn when the browser can draw WebGL 2, at every lite level (the ball does not depend on the lite level)", () => {
    browserCanDrawWebgl2(true)
    for (const level of [0, 1, 2]) {
      lite.level = level
      show()
      expect(drawn()(), "lite " + level).toEqual({ ball: true })
    }
  })

  it("says the ball is not drawn when the browser cannot draw WebGL 2", () => {
    browserCanDrawWebgl2(false)
    show()
    expect(drawn()()).toEqual({ ball: false })
  })

  it("asks the browser nothing when it only opens (the question is asked only when a milestone is picked)", () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, "getContext")
    forgetWarmup()
    show({ status: "idle" })
    show({ status: "running", seconds: 100, ringSeed: SEED })
    expect(spy).not.toHaveBeenCalled()
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
    expect(timerCss).toContain('.ab-timer[data-link="loading"] .ab-timer-readout {')
  })
})

describe("the css of the screen: the look while loading", () => {
  const block = (selector: string): string => {
    const start = timerCss.indexOf("\n" + selector + " {")
    if (start < 0) return ""
    return timerCss.slice(start, timerCss.indexOf("}", start))
  }
  const READOUT_LOADING = '.ab-timer[data-link="loading"] .ab-timer-readout'
  const READOUT_REVEAL = '.ab-timer:not([data-link="loading"]) .ab-timer-readout'
  const ACTIONS_REVEAL = '.ab-timer:not([data-link="loading"]) .ab-timer-actions'

  it("keeps the two clocks invisible while the first reading is on its way, and no longer dims the whole dial", () => {
    expect(block(READOUT_LOADING)).toContain("opacity: 0;")
    expect(timerCss).not.toContain('.ab-timer[data-link="loading"] .ab-timer-dial')
  })

  it("fades the clocks and the buttons in with an animation that starts when the loading ends", () => {
    expect(block(READOUT_REVEAL)).toMatch(/animation:\s*ab-timer-reveal\s+300ms/)
    expect(block(ACTIONS_REVEAL)).toMatch(/animation:\s*ab-timer-reveal-actions\s+300ms/)
    expect(timerCss).toContain("@keyframes ab-timer-reveal {")
    expect(timerCss).toContain("@keyframes ab-timer-reveal-actions {")
  })

  it("starts the buttons at the brightness of the blank pill, so that the pill grows into the button", () => {
    const keyframes = /@keyframes ab-timer-reveal-actions \{([\s\S]*?)\n\}/.exec(timerCss)?.[1] ?? ""
    const from = Number(/opacity:\s*([0-9.]+);/.exec(keyframes)?.[1])
    const wait = Number(/opacity:\s*([0-9.]+);/.exec(block(".ab-timer-wait"))?.[1])
    expect(from).toBeGreaterThan(0)
    expect(from).toBe(wait)
  })

  it("gives the blank pill the size of the Start pill, so that nothing jumps when the button comes", () => {
    const wait = block(".ab-timer-wait")
    const pill = block(".ab-timer-pill")
    expect(wait).toContain("height: 58px;")
    expect(pill).toContain("height: 58px;")
    expect(wait).toContain("width: 100%;")
    expect(wait).toContain("border-radius: 999px;")
    expect(wait).not.toContain("cursor:")
  })

  it("lets a person who wants less motion have no fades and no breathing, and the switch-off comes after the rules it switches off", () => {
    const at = timerCss.indexOf("@media (prefers-reduced-motion: reduce) {\n  " + READOUT_REVEAL)
    expect(at).toBeGreaterThan(-1)
    const off = timerCss.slice(at, timerCss.indexOf("\n}\n", at))
    expect(off).toContain(READOUT_REVEAL)
    expect(off).toContain(ACTIONS_REVEAL)
    expect(off).toContain(".ab-timer-wait")
    expect(off).toContain("animation: none;")
    for (const rule of [READOUT_REVEAL + " {", ACTIONS_REVEAL + " {", "\n.ab-timer-wait {"]) {
      expect(timerCss.indexOf(rule)).toBeGreaterThan(-1)
      expect(timerCss.indexOf(rule)).toBeLessThan(at)
    }
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
describe("TimerScreen: the tag picker (Packet 10C2)", () => {
  const WORK: TimerTag = { id: "t-work", name: "Work" }
  const STUDY: TimerTag = { id: "t-study", name: "Study" }
  const kidsOfMain = (): string[] => Array.from(q(".ab-timer").children).map((k) => k.id || k.className)

  it("stands first inside the buttons box, directly before Start, while no session runs", () => {
    show({ status: "idle", tags: [WORK, STUDY] })
    const actions = q(".ab-timer-actions")
    expect(actions.firstElementChild).toBe(q(".ab-tag-picker"))
    expect(q(".ab-tag-picker").nextElementSibling).toBe(q(".ab-timer-pill"))
    expect(q(".ab-timer-pill").textContent).toBe("Start")
    expect(q(".ab-timer-pill").parentElement).toBe(actions)
    expect(actions.contains(q(".ab-tag-pill"))).toBe(true)
  })

  it("hands the picker the list, the pick, and the two calls of the hook", () => {
    const view = show({ status: "idle", tags: [WORK, STUDY], tagId: STUDY.id })
    expect(q(".ab-tag-pill").textContent).toBe("Study")
    expect(Array.from(document.querySelectorAll(".ab-tag-chip")).map((c) => c.textContent)).toEqual(["No tag", "Work", "Study"])
    act(() => q(".ab-tag-pill").click())
    expect(view.reloadTags).toHaveBeenCalledTimes(1)
    act(() => Array.from(document.querySelectorAll<HTMLElement>(".ab-tag-row"))[1].click())
    expect(view.chooseTag).toHaveBeenCalledWith(WORK.id)
    act(() => Array.from(document.querySelectorAll<HTMLElement>(".ab-tag-chip"))[0].click())
    expect(view.chooseTag).toHaveBeenLastCalledWith(null)
  })

  it("is as ready as the Start button: off while the screen is busy, offline or has a problem", () => {
    show({ status: "idle", busy: true })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(true)
    expect((q(".ab-timer-pill") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", busy: false, link: "offline" })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "problem", problem: "Something went wrong." })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "online", busy: false })
    expect((q(".ab-tag-pill") as HTMLButtonElement).disabled).toBe(false)
    expect((q(".ab-timer-pill") as HTMLButtonElement).disabled).toBe(false)
  })

  it("is not there while a session runs or is paused", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-picker")).toBe(false)
    expect(has(".ab-tag-pill")).toBe(false)
    expect(has(".ab-tag-chip")).toBe(false)
    show({ status: "paused", seconds: 100, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-picker")).toBe(false)
  })

  it("is not there while loading: a faint blank pill stands in its place, before the blank Start pill", () => {
    show({ link: "loading", tags: [WORK] })
    expect(has(".ab-tag-picker")).toBe(false)
    const wait = q(".ab-timer-actions .ab-tag-wait")
    expect(wait.textContent).toBe("")
    expect(wait.getAttribute("aria-hidden")).toBe("true")
    expect(wait.tagName).toBe("DIV")
    expect(wait.nextElementSibling).toBe(q(".ab-timer-wait"))
    expect(q(".ab-timer-actions").firstElementChild).toBe(wait)
    expect(has("button")).toBe(false)
  })

  it("takes the blank tag pill away when the reading is there, and never shows it without a connection or with a problem", () => {
    show({ link: "loading" })
    expect(has(".ab-tag-wait")).toBe(true)
    show({ link: "online", status: "idle" })
    expect(has(".ab-tag-wait")).toBe(false)
    expect(has(".ab-tag-pill")).toBe(true)
    show({ link: "offline", status: "idle" })
    expect(has(".ab-tag-wait")).toBe(false)
    show({ link: "problem", problem: "Something went wrong.", status: "idle" })
    expect(has(".ab-tag-wait")).toBe(false)
  })

  it("keeps the children of the screen as they were, also while the sheet is open: the sheet lives inside the picker", () => {
    show({ status: "idle", tags: [WORK] })
    expect(kidsOfMain()).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
    act(() => q(".ab-tag-pill").click())
    expect(has(".ab-tag-sheet")).toBe(true)
    expect(kidsOfMain()).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
    expect(q(".ab-tag-sheet").closest(".ab-timer-actions")).toBe(q(".ab-timer-actions"))
    expect(q(".ab-tag-sheet").closest(".ab-timer-side")).toBe(q(".ab-timer-side"))
  })

  it("loses the open sheet when a session starts (the picker is taken away)", () => {
    show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-pill").click())
    expect(has(".ab-tag-sheet")).toBe(true)
    show({ status: "running", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(has(".ab-tag-picker")).toBe(false)
  })

  it("keeps the buttons as they were: Start is the only white pill, and Pause or Resume and the Hold Button stay in the buttons box", () => {
    show({ status: "running", seconds: 5, ringSeed: SEED })
    expect(q(".ab-timer-pill").parentElement).toBe(q(".ab-timer-actions"))
    expect(q(".ab-timer-end").closest(".ab-timer-actions")).toBe(q(".ab-timer-actions"))
    expect(Array.from(q(".ab-timer-actions").children).some((k) => k.className.includes("ab-tag"))).toBe(false)
  })
})

describe("TimerScreen: the tag of the running session (Packet 10C2)", () => {
  it("shows the name as one small line inside the dial, in the readout, after the day total", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, dayTotal: 4000, runningTag: "Deep work" })
    const line = q(".ab-tag-line")
    expect(line.textContent).toBe("Deep work")
    expect(line.tagName).toBe("P")
    expect(line.getAttribute("role")).toBe("note")
    expect(line.getAttribute("aria-label")).toBe("Tag: Deep work")
    expect(line.parentElement).toBe(q(".ab-timer-readout"))
    expect(q(".ab-timer-dial").contains(line)).toBe(true)
    expect(q(".ab-timer-small").nextElementSibling).toBe(line)
    expect(line.nextElementSibling).toBeNull()
  })

  it("shows it also while the session is paused", () => {
    show({ status: "paused", seconds: 100, ringSeed: SEED, runningTag: "Study" })
    expect(q(".ab-tag-line").textContent).toBe("Study")
  })

  it("shows nothing for a session with no tag, and nothing while idle", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, runningTag: null })
    expect(has(".ab-tag-line")).toBe(false)
    show({ status: "idle", runningTag: null })
    expect(has(".ab-tag-line")).toBe(false)
    expect(q(".ab-timer-readout").children.length).toBe(2)
  })

  it("keeps the two clocks as they were: the big clock, then the day total, nothing else in front of them", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, runningTag: "Work" })
    const kids = Array.from(q(".ab-timer-readout").children).map((k) => k.className)
    expect(kids).toEqual(["ab-timer-big", "ab-timer-small", "ab-tag-line"])
    expect(q(".ab-timer-big").textContent).toBe(formatClock(100))
  })

  it("shows a name as plain text, never as markup", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED, runningTag: "<b>Work</b>" })
    expect(q(".ab-tag-line").textContent).toBe("<b>Work</b>")
    expect(has(".ab-tag-line b")).toBe(false)
  })
})
describe("the css of the tag picker (Packet 10C2)", () => {
  // The marker lines are written in two pieces, so that the tag checker does not take them for markers of this test file.
  const marker = (part: string, edge: string): string => "/* A" + "B:" + part + ":" + edge + " */"
  const SCREEN_HEADER = "@media (min-width: 1000px) and (min-height: 560px), (min-width: 600px) and (min-aspect-ratio: 5/4) {"
  const TAGS_HEADER = "@media (min-width: 600px) and (min-aspect-ratio: 5/4), (min-width: 1000px) and (min-height: 560px) {"
  const part = (): string => {
    const start = timerCss.indexOf(marker("TIMER.TAGS", "START"))
    const end = timerCss.indexOf(marker("TIMER.TAGS", "END"))
    return start < 0 || end < start ? "" : timerCss.slice(start, end)
  }
  // The text between the braces of a media rule, found by counting braces.
  const inside = (text: string, header: string): string => {
    const start = text.indexOf(header)
    if (start < 0) return ""
    let depth = 0
    for (let i = start + header.length - 1; i < text.length; i++) {
      if (text[i] === "{") depth++
      else if (text[i] === "}") {
        depth--
        if (depth === 0) return text.slice(start + header.length, i)
      }
    }
    return ""
  }
  const rule = (selector: string): string => new RegExp("\\n" + selector.replace(/[.[\]="]/g, "\\$&") + " \\{([^}]*)\\}").exec("\n" + part())?.[1] ?? ""
  // A rule of the whole css file (the screen's own rules), not only of the tag part.
  const screenRule = (selector: string): string => new RegExp("\\n" + selector.replace(/[.[\]="]/g, "\\$&") + " \\{([^}]*)\\}").exec("\n" + timerCss)?.[1] ?? ""
  const px = (text: string, pattern: RegExp): number => Number(pattern.exec(text)?.[1])
  const conditions = (header: string): string[] =>
    header
      .replace(/^@media /, "")
      .replace(/ \{$/, "")
      .split(", ")
      .sort()

  it("is one tagged part that stands after the screen's part and before the part of the moving background", () => {
    expect(part()).not.toBe("")
    expect(timerCss.split(marker("TIMER.TAGS", "START")).length - 1).toBe(1)
    expect(timerCss.indexOf(marker("TIMER.TAGS", "START"))).toBeGreaterThan(timerCss.indexOf(marker("TIMER.SCREEN", "END")))
    expect(timerCss.indexOf(marker("TIMER.TAGS", "END"))).toBeLessThan(timerCss.indexOf(marker("TIMER.BG", "START")))
  })

  it("leaves the last motion rule of the file to the moving background", () => {
    const last = timerCss.lastIndexOf("@media (prefers-reduced-motion: reduce) {")
    expect(last).toBeGreaterThan(timerCss.indexOf(marker("TIMER.BG", "START")))
  })

  it("has its own wide-screen rule with the SAME two conditions as the screen's, written in the other order so the screen's header stays unique", () => {
    expect(timerCss.split(TAGS_HEADER).length - 1).toBe(1)
    expect(timerCss.split(SCREEN_HEADER).length - 1).toBe(1)
    expect(TAGS_HEADER).not.toBe(SCREEN_HEADER)
    expect(conditions(TAGS_HEADER)).toEqual(conditions(SCREEN_HEADER))
    expect(conditions(TAGS_HEADER)).toEqual(["(min-width: 1000px) and (min-height: 560px)", "(min-width: 600px) and (min-aspect-ratio: 5/4)"])
    expect(part()).toContain(TAGS_HEADER)
  })

  it("switches the pill, the blank pill and the sheet off on a wide screen and the chips on, and touches nothing else", () => {
    const wide = inside(part(), TAGS_HEADER)
    expect(wide).toMatch(/\.ab-tag-pill,\s*\.ab-tag-wait,\s*\.ab-tag-sheet \{\s*display: none;\s*\}/)
    expect(wide).toMatch(/\.ab-tag-chips \{[^}]*display: flex;/)
    for (const word of ["overflow", "z-index", "pointer-events", "position:", "isolation", "mix-blend-mode", "--ab-timer-reserve"]) {
      expect(wide, word).not.toContain(word)
    }
  })

  it("hides the chips on a phone, and the wide rule comes after every phone rule it replaces", () => {
    expect(rule(".ab-tag-chips")).toContain("display: none;")
    const at = part().indexOf(TAGS_HEADER)
    for (const selector of [".ab-tag-pill", ".ab-tag-wait", ".ab-tag-sheet", ".ab-tag-chips"]) {
      const first = part().indexOf("\n" + selector + " {")
      expect(first, selector).toBeGreaterThan(-1)
      expect(first, selector).toBeLessThan(at)
    }
  })

  it("makes the pill and the blank pill 44 px high and as wide as the buttons, with round ends", () => {
    for (const selector of [".ab-tag-pill", ".ab-tag-wait"]) {
      expect(rule(selector), selector).toContain("height: 44px;")
      expect(rule(selector), selector).toContain("width: 100%;")
      expect(rule(selector), selector).toContain("border-radius: 999px;")
    }
    expect(rule(".ab-tag-wait")).not.toContain("cursor:")
  })

  it("lets the blank tag pill breathe like the blank Start pill, so that the two look like one family", () => {
    expect(px(rule(".ab-tag-wait"), /opacity:\s*([0-9.]+);/)).toBe(px(screenRule(".ab-timer-wait"), /opacity:\s*([0-9.]+);/))
    expect(rule(".ab-tag-wait")).toMatch(/animation:\s*ab-tag-wait\s+1\.4s/)
    expect(part()).toContain("@keyframes ab-tag-wait {")
  })

  it("fits above Start inside the buttons box, so that the reserve of the dial on the phone does not change (C40)", () => {
    const actions = timerCss.slice(timerCss.indexOf("\n.ab-timer-actions {"), timerCss.indexOf("}", timerCss.indexOf("\n.ab-timer-actions {")))
    const room = px(actions, /min-height:\s*(\d+)px;/)
    const gap = px(actions, /gap:\s*(\d+)px;/)
    const start = px(timerCss.slice(timerCss.indexOf("\n.ab-timer-pill {")), /height:\s*(\d+)px;/)
    const pill = px(rule(".ab-tag-pill"), /height:\s*(\d+)px;/)
    expect(start).toBe(58)
    expect(pill + gap + start).toBeLessThanOrEqual(room)
  })

  it("draws the wrapper of the picker as no box at all, so that the pill and Start are laid out by the same buttons box", () => {
    expect(rule(".ab-tag-picker")).toMatch(/display:\s*contents;/)
  })

  it("is outlined, so that Start stays the one white solid button, and has a disabled look and a press look like Start", () => {
    expect(rule(".ab-tag-pill")).toContain("background: transparent;")
    expect(rule(".ab-tag-pill")).toMatch(/border:\s*1px solid/)
    expect(rule(".ab-tag-pill:disabled")).toContain("opacity: 0.4;")
    expect(rule(".ab-tag-pill:active:enabled")).toContain("transform: scale(0.98);")
  })

  it("cuts a long name with an ellipsis instead of growing", () => {
    for (const selector of [".ab-tag-pill-text", ".ab-tag-chip", ".ab-tag-line"]) {
      expect(rule(selector), selector).toContain("overflow: hidden;")
      expect(rule(selector), selector).toContain("text-overflow: ellipsis;")
      expect(rule(selector), selector).toContain("white-space: nowrap;")
    }
    expect(rule(".ab-tag-pill-text")).toContain("min-width: 0;")
  })

  it("makes the sheet a fixed, plain dim layer over the whole window with no blur, and the panel sits at the bottom", () => {
    expect(rule(".ab-tag-sheet")).toContain("position: fixed;")
    expect(rule(".ab-tag-sheet")).toContain("inset: 0;")
    expect(rule(".ab-tag-scrim")).toContain("position: absolute;")
    expect(rule(".ab-tag-scrim")).toContain("inset: 0;")
    expect(rule(".ab-tag-scrim")).toMatch(/background:\s*rgba\(0, 0, 0, 0\.\d+\);/)
    expect(part()).not.toContain("blur(")
    expect(part()).not.toContain("backdrop-filter")
    expect(rule(".ab-tag-panel")).toContain("position: absolute;")
    expect(rule(".ab-tag-panel")).toMatch(/bottom: 0;/)
    expect(rule(".ab-tag-panel")).toContain("overflow-y: auto;")
    expect(rule(".ab-tag-panel")).toMatch(/max-height:\s*\d+dvh;/)
  })

  it("keeps the sheet above the dial and the buttons (z-index 1) and below the menu button (z-index 40 in menu.css)", () => {
    const z = px(rule(".ab-tag-sheet"), /z-index:\s*(\d+);/)
    expect(z).toBeGreaterThan(1)
    expect(z).toBeLessThan(40)
  })

  it("gives the rows at least 44 px to tap, and the chips 40 px", () => {
    expect(px(rule(".ab-tag-row"), /min-height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(rule(".ab-tag-row")).toContain("width: 100%;")
    expect(px(rule(".ab-tag-chip"), /height:\s*(\d+)px;/)).toBe(40)
  })

  it("fills the chosen row and the chosen chip white, as Start is", () => {
    for (const selector of ['.ab-tag-row[aria-pressed="true"]', '.ab-tag-chip[aria-pressed="true"]']) {
      expect(rule(selector), selector).toContain("background: #fff;")
      expect(rule(selector), selector).toContain("color: #000;")
    }
  })

  it("lets a person who wants less motion have no sliding, no fading and no breathing, and the switch-off comes after the rules it switches off", () => {
    const at = part().indexOf("@media (prefers-reduced-motion: reduce) {")
    expect(at).toBeGreaterThan(-1)
    const off = inside(part(), "@media (prefers-reduced-motion: reduce) {")
    for (const selector of [".ab-tag-wait", ".ab-tag-scrim", ".ab-tag-panel"]) {
      expect(off, selector).toContain(selector)
      expect(part().indexOf("\n" + selector + " {"), selector).toBeLessThan(at)
    }
    expect(off).toContain("animation: none;")
  })

  it("makes the line of the running tag take no height: its own line is 1.2em and the bottom margin takes back that line and the gap of the readout", () => {
    const line = rule(".ab-tag-line")
    const readout = timerCss.slice(timerCss.indexOf("\n.ab-timer-readout {"), timerCss.indexOf("}", timerCss.indexOf("\n.ab-timer-readout {")))
    const gap = px(readout, /\n\s*gap:\s*(\d+)px;/)
    const lineHeight = px(line, /line-height:\s*([0-9.]+);/)
    const margin = /margin:\s*0 0 calc\(-([0-9.]+)em - (\d+)px\);/.exec(line)
    expect(margin).not.toBeNull()
    expect(Number(margin?.[1])).toBe(lineHeight)
    expect(Number(margin?.[2])).toBe(gap)
    expect(line).toContain("max-width: 84cqw;")
    expect(line).toMatch(/font-size:\s*max\(12px,/)
  })

  it("draws the Manage tags row as a dashed full-width row of at least 44 px that does not shrink, so that it is not taken for a tag", () => {
    const row = rule(".ab-tag-more")
    expect(row).toContain("width: 100%;")
    expect(row).toContain("flex: none;")
    expect(px(row, /min-height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(row).toMatch(/border:\s*1px dashed/)
    expect(row).toContain("background: transparent;")
  })

  it("draws the Manage tags chip dashed and as high as a chip, off on a phone, on (flex) in the wide rule only, and the wide rule comes after it", () => {
    const chip = rule(".ab-tag-more-chip")
    expect(chip).toContain("display: none;")
    expect(chip).toMatch(/border:\s*1px dashed/)
    expect(px(chip, /height:\s*(\d+)px;/)).toBe(px(rule(".ab-tag-chip"), /height:\s*(\d+)px;/))
    expect(rule(".ab-tag-more-chip:disabled")).toContain("opacity: 0.4;")
    expect(inside(part(), TAGS_HEADER)).toMatch(/\.ab-tag-more-chip \{[^}]*display: flex;/)
    expect(part().indexOf("\n.ab-tag-more-chip {")).toBeGreaterThan(-1)
    expect(part().indexOf("\n.ab-tag-more-chip {")).toBeLessThan(part().indexOf(TAGS_HEADER))
  })

  it("puts the box in a fixed layer above the dial and below the menu button, and the box at the TOP of the window under the menu button, never at the bottom where a phone keyboard would hide it", () => {
    const layer = rule(".ab-tag-dialog")
    expect(layer).toContain("position: fixed;")
    expect(layer).toContain("inset: 0;")
    const z = px(layer, /z-index:\s*(\d+);/)
    expect(z).toBeGreaterThan(1)
    expect(z).toBeLessThan(40)
    const box = rule(".ab-tag-box")
    expect(box).toContain("position: absolute;")
    expect(px(box, /top:\s*(\d+)px;/)).toBeGreaterThanOrEqual(56)
    expect(box).not.toContain("bottom:")
    expect(box).toContain("overflow-y: auto;")
    expect(box).toMatch(/max-height:\s*calc\(100dvh - \d+px\);/)
    expect(box).toContain("margin: 0 auto;")
    expect(px(box, /max-width:\s*(\d+)px;/)).toBeLessThanOrEqual(440)
  })

  it("makes the field text 16 px high (a phone zooms into smaller text), 44 px or more to tap, with a focus look, and the Add button as high as the field", () => {
    const input = rule(".ab-tag-input")
    expect(px(input, /font-size:\s*(\d+)px;/)).toBeGreaterThanOrEqual(16)
    expect(px(input, /height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(input).toContain("min-width: 0;")
    expect(rule(".ab-tag-input:focus")).toContain("border-color: #fff;")
    expect(px(rule(".ab-tag-add-button"), /height:\s*(\d+)px;/)).toBe(px(input, /height:\s*(\d+)px;/))
  })

  it("keeps Add the one solid white button of the box, with a disabled look, and the Back button outlined", () => {
    expect(rule(".ab-tag-add-button")).toContain("background: #fff;")
    expect(rule(".ab-tag-add-button:disabled")).toContain("opacity: 0.4;")
    expect(rule(".ab-tag-back")).toContain("background: transparent;")
    expect(rule(".ab-tag-back")).toMatch(/border:\s*1px solid/)
    expect(px(rule(".ab-tag-back"), /height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
  })

  it("shows the error as one plain line with a bar at its left and lets a long word wrap", () => {
    const error = rule(".ab-tag-error")
    expect(error).toMatch(/border-left:\s*3px solid #fff;/)
    expect(error).toContain("overflow-wrap: anywhere;")
  })

  it("wraps a long name in the read-only rows, gives them the height of a tag row and no pointer, and draws the list without bullets", () => {
    const row = rule(".ab-tag-have-row")
    expect(row).toContain("overflow-wrap: anywhere;")
    expect(px(row, /min-height:\s*(\d+)px;/)).toBeGreaterThanOrEqual(44)
    expect(row).not.toContain("cursor:")
    expect(row).not.toContain("border-radius")
    expect(row).toMatch(/border:\s*0;/)
    expect(rule(".ab-tag-have")).toContain("list-style: none;")
  })

  it("slides the box down with a keyframe of its own, written before the motion rule that switches it off for a person who wants less motion", () => {
    expect(rule(".ab-tag-box")).toMatch(/animation:\s*ab-tag-down\s+\d+ms/)
    const keyframes = part().indexOf("@keyframes ab-tag-down {")
    const motion = part().indexOf("@media (prefers-reduced-motion: reduce) {")
    expect(keyframes).toBeGreaterThan(-1)
    expect(keyframes).toBeLessThan(motion)
    expect(inside(part(), "@media (prefers-reduced-motion: reduce) {")).toContain(".ab-tag-box")
  })

  it("never uses a css variable of its own and never touches the rules of the screen", () => {
    expect(part()).not.toContain("--ab-")
    for (const selector of [".ab-timer-actions", ".ab-timer-pill", ".ab-timer-wait", ".ab-timer-readout", ".ab-timer-small"]) {
      expect(part(), selector).not.toContain(selector + " ")
    }
  })
})
describe("TimerScreen: adding a tag (Packet 10D)", () => {
  const WORK: TimerTag = { id: "t-work", name: "Work" }
  const kidsOfMain = (): string[] => Array.from(q(".ab-timer").children).map((k) => k.id || k.className)
  const typeInto = (text: string) => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
    act(() => {
      set?.call(q(".ab-tag-input"), text)
      q(".ab-tag-input").dispatchEvent(new Event("input", { bubbles: true }))
    })
  }

  it("hands the box the call of the hook: Manage tags, a typed name and Add reach addTag, and nothing is chosen", async () => {
    const view = show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-pill").click())
    act(() => q(".ab-tag-more").click())
    typeInto("Study")
    await act(async () => {
      q(".ab-tag-add-button").click()
    })
    expect(view.addTag).toHaveBeenCalledTimes(1)
    expect(view.addTag).toHaveBeenCalledWith("Study")
    expect(view.chooseTag).not.toHaveBeenCalled()
  })

  it("draws the Manage tags chip as the last thing inside the picker, so that it stands in the buttons box above Start", () => {
    show({ status: "idle", tags: [WORK] })
    const chip = q(".ab-tag-more-chip")
    expect(chip.parentElement).toBe(q(".ab-tag-picker"))
    expect(chip.nextElementSibling).toBeNull()
    expect(q(".ab-tag-picker").nextElementSibling).toBe(q(".ab-timer-pill"))
    expect(chip.textContent).toBe("Manage tags")
  })

  it("is as ready as the Start button: the chip is off while the screen is busy, offline or has a problem", () => {
    show({ status: "idle", busy: true })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", busy: false, link: "offline" })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "problem", problem: "Something went wrong." })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    show({ status: "idle", link: "online", busy: false })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(false)
  })

  it("has no chip and no box while a session runs or is paused (nothing can be added then)", () => {
    show({ status: "running", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-more-chip")).toBe(false)
    expect(has(".ab-tag-box")).toBe(false)
    show({ status: "paused", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-more-chip")).toBe(false)
    expect(has(".ab-tag-box")).toBe(false)
  })

  it("keeps the children of the screen as they were, also while the box is open: the box lives inside the picker", () => {
    show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-more-chip").click())
    expect(has(".ab-tag-box")).toBe(true)
    expect(kidsOfMain()).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
    expect(q(".ab-tag-box").closest(".ab-timer-actions")).toBe(q(".ab-timer-actions"))
    expect(q(".ab-tag-box").closest(".ab-tag-picker")).toBe(q(".ab-tag-picker"))
  })

  it("loses the open box when a session starts (the picker is taken away)", () => {
    show({ status: "idle", tags: [WORK] })
    act(() => q(".ab-tag-more-chip").click())
    expect(has(".ab-tag-box")).toBe(true)
    show({ status: "running", seconds: 5, ringSeed: SEED, tags: [WORK] })
    expect(has(".ab-tag-box")).toBe(false)
    expect(has(".ab-tag-picker")).toBe(false)
  })
})
// AB:TIMER.TESTS:END
