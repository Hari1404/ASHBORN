// @vitest-environment jsdom
import { act, createElement, StrictMode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The TV screen and the Learn screen are replaced by stand-ins. Their own tests are in tvTransition.test.ts and LearnScreen.test.tsx: this file only tests what GuideScreen does around them (the lazy loading, the address it passes on, the trip of Prove, the keyboard).
// The TV stand-in writes every call it gets into tv.calls and holds each turn-off and turn-on open until a test ends it, as the real engine does. When it is taken away it settles what is waiting (the real engine does the same in cancel).
// The three lengths are made different on purpose, so that using one for another is seen (in the real file two of them are both 1000).
vi.mock("@/lib/tvKeyframes", () => ({ TV_OFF_MS: 1100, TV_ON_MS: 900, TV_BLACK_HOLD_MS: 1700 }))
const tv = vi.hoisted(() => ({ calls: [] as string[], off: [] as Array<() => void>, on: [] as Array<() => void> }))
vi.mock("@/components/TvScreen", async () => {
  const { createElement: h, useEffect, useImperativeHandle } = await import("react")
  type Handle = { turnOff: (ms: number) => Promise<void>; turnOn: (ms: number) => Promise<void> }
  const TvScreen = ({ ref, children }: { ref?: import("react").Ref<Handle>; children?: import("react").ReactNode }) => {
    useImperativeHandle(
      ref,
      () => ({
        turnOff: (ms: number) => {
          tv.calls.push(`off ${ms}`)
          return new Promise<void>((resolve) => tv.off.push(resolve))
        },
        turnOn: (ms: number) => {
          tv.calls.push(`on ${ms}`)
          return new Promise<void>((resolve) => tv.on.push(resolve))
        },
      }),
      [],
    )
    useEffect(
      () => () => {
        tv.calls.push("gone")
        for (const settle of [...tv.off.splice(0), ...tv.on.splice(0)]) settle()
      },
      [],
    )
    return h("div", { id: "tv-stub" }, children)
  }
  return { TvScreen }
})
const learn = vi.hoisted(() => ({ fail: false, onProve: null as (() => void) | null }))
vi.mock("@/components/LearnScreen", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (p: { address: { subject: string | null; item: string | null }; onProve: () => void; proving?: boolean }) => {
      if (learn.fail) throw new Error("the Learn screen broke")
      learn.onProve = p.onProve
      return h(
        "main",
        { id: "learn-stub", "data-subject": p.address.subject ?? "", "data-item": p.address.item ?? "", "data-proving": String(p.proving) },
        h("button", { id: "prove-stub", type: "button", disabled: p.proving, onClick: p.onProve }, "Prove"),
      )
    },
  }
})

import { TV_BLACK_HOLD_MS, TV_OFF_MS, TV_ON_MS } from "@/lib/tvKeyframes"
import GuideScreen from "./GuideScreen"

let root: Root | null = null
let container: HTMLElement | null = null

function q<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = container?.querySelector<T>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function show(hash: string, strict = false): void {
  window.location.hash = hash
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  const screen = createElement(GuideScreen)
  act(() => root?.render(strict ? createElement(StrictMode, null, screen) : screen))
}

// The lazy Learn screen arrives through a dynamic import: wait until it has.
async function load(): Promise<void> {
  await act(async () => {
    await vi.dynamicImportSettled()
  })
}

const proving = () => q("#learn-stub").getAttribute("data-proving")
const press = () => act(() => q("#prove-stub").click())
const endOff = () => act(async () => void tv.off.splice(0).forEach((settle) => settle()))
const endOn = () => act(async () => void tv.on.splice(0).forEach((settle) => settle()))
const pass = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)))

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  tv.calls = []
  tv.off = []
  tv.on = []
  learn.fail = false
  learn.onProve = null
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  if (root !== null) act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  window.location.hash = ""
})

describe("GuideScreen: the picture while the Learn screen arrives", () => {
  // This test must stay the FIRST one of the file: a lazy component that has arrived once never shows its fallback again in this file.
  it("shows a plain black line that says Loading, inside the TV, until the Learn screen has arrived", async () => {
    show("#guide")
    const note = q(".ab-guide-note")
    expect(note.textContent).toBe("Loading")
    expect(note.getAttribute("role")).toBe("status")
    expect(note.closest("#tv-stub")).not.toBeNull()
    expect(has("#learn-stub")).toBe(false)
    await load()
    expect(has("#learn-stub")).toBe(true)
    expect(has(".ab-guide-note")).toBe(false)
  })

  it("draws the Learn screen inside the TV, so that it turns off and on with the picture", async () => {
    show("#guide")
    await load()
    expect(q("#learn-stub").closest("#tv-stub")).not.toBeNull()
  })

  it("draws nothing else: no menu, no placeholder, no second main element", async () => {
    show("#guide")
    await load()
    expect(container?.querySelectorAll("main").length).toBe(1)
    expect(has(".ab-stub")).toBe(false)
    expect(has("nav")).toBe(false)
  })
})

describe("GuideScreen: the address", () => {
  it.each([
    ["#guide", "", ""],
    ["#guide/python", "python", ""],
    ["#guide/python/PY-14", "python", "PY-14"],
  ])("gives the words after #guide in %j to the Learn screen", async (hash, subject, item) => {
    show(hash)
    await load()
    expect(q("#learn-stub").getAttribute("data-subject")).toBe(subject)
    expect(q("#learn-stub").getAttribute("data-item")).toBe(item)
  })

  it("reads the address again when the page address changes", async () => {
    show("#guide")
    await load()
    act(() => {
      window.location.hash = "#guide/numpy"
      window.dispatchEvent(new Event("hashchange"))
    })
    expect(q("#learn-stub").getAttribute("data-subject")).toBe("numpy")
    act(() => {
      window.location.hash = "#guide"
      window.dispatchEvent(new Event("hashchange"))
    })
    expect(q("#learn-stub").getAttribute("data-subject")).toBe("")
  })
})

describe("GuideScreen: the trip of Prove", () => {
  beforeEach(async () => {
    show("#guide")
    await load()
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
  })

  it("is not proving at the start", () => {
    expect(proving()).toBe("false")
    expect(q<HTMLButtonElement>("#prove-stub").disabled).toBe(false)
    expect(tv.calls).toEqual([])
  })

  it("starts the turn-off at once, with its own length, and says proving", () => {
    press()
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`])
    expect(proving()).toBe("true")
    expect(q<HTMLButtonElement>("#prove-stub").disabled).toBe(true)
  })

  it("holds the black until the turn-off has finished, however long that takes", async () => {
    press()
    await pass(TV_BLACK_HOLD_MS * 3)
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`])
    await endOff()
    await pass(TV_BLACK_HOLD_MS - 1)
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`])
  })

  it("plays the turn-on after the black hold, with its own length, not one millisecond earlier", async () => {
    press()
    await endOff()
    await pass(TV_BLACK_HOLD_MS - 1)
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`])
    await pass(1)
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`, `on ${TV_ON_MS}`])
  })

  it("keeps saying proving until the turn-on has finished, then says it no more", async () => {
    press()
    await endOff()
    await pass(TV_BLACK_HOLD_MS)
    expect(proving()).toBe("true")
    await endOn()
    expect(proving()).toBe("false")
    expect(q<HTMLButtonElement>("#prove-stub").disabled).toBe(false)
  })

  it("does not start a second trip when Prove is asked for again during the first (the busy guard)", async () => {
    press()
    act(() => learn.onProve?.())
    await endOff()
    act(() => learn.onProve?.())
    await pass(TV_BLACK_HOLD_MS)
    act(() => learn.onProve?.())
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`, `on ${TV_ON_MS}`])
  })

  it("plays a new trip when Prove is pressed after the first one has ended", async () => {
    press()
    await endOff()
    await pass(TV_BLACK_HOLD_MS)
    await endOn()
    press()
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`, `on ${TV_ON_MS}`, `off ${TV_OFF_MS}`])
    expect(proving()).toBe("true")
  })

  it("plays the whole trip when the page runs the screen in strict mode (main.tsx does: the effects run twice at the start)", async () => {
    act(() => root?.unmount())
    container?.remove()
    show("#guide", true)
    await load()
    tv.calls = [] // the first screen going away, and strict mode taking its own away and putting it back, have written "gone"
    press()
    await endOff()
    await pass(TV_BLACK_HOLD_MS)
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`, `on ${TV_ON_MS}`])
    await endOn()
    expect(proving()).toBe("false")
  })

  it("leaves nothing waiting after a whole trip", async () => {
    press()
    await endOff()
    await pass(TV_BLACK_HOLD_MS)
    await endOn()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("does not hold the black, or turn the TV on, when the Guide is left during the turn-off", async () => {
    press()
    act(() => root?.unmount())
    root = null
    await act(async () => {})
    expect(vi.getTimerCount()).toBe(0) // asked before any time passes: a black that was started and let run out would not show later
    await pass(TV_BLACK_HOLD_MS * 2)
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`, "gone"])
  })

  it("ends the black hold at once, with no timer left, when the Guide is left during the black", async () => {
    press()
    await endOff()
    expect(vi.getTimerCount()).toBe(1)
    act(() => root?.unmount())
    root = null
    await act(async () => {})
    expect(vi.getTimerCount()).toBe(0)
    await pass(TV_BLACK_HOLD_MS * 2)
    expect(tv.calls).toEqual([`off ${TV_OFF_MS}`, "gone"])
  })
})

describe("GuideScreen: the keyboard", () => {
  // The picture is inert during the trip, so in a browser the keyboard falls out of it onto the page. jsdom does not do that, so a test makes the keyboard fall by hand: focus a button outside the screen, then blur it.
  let away: HTMLButtonElement
  let focused: Array<{ element: Element; options: unknown }>

  function fall(): void {
    act(() => {
      away.focus()
      away.blur()
    })
  }

  beforeEach(async () => {
    show("#guide")
    await load()
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    away = document.createElement("button")
    document.body.appendChild(away)
    focused = []
    const real = HTMLElement.prototype.focus
    vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (this: HTMLElement, options?: FocusOptions) {
      focused.push({ element: this, options })
      real.call(this, options)
    })
  })

  afterEach(() => {
    away.remove()
  })

  async function trip(): Promise<void> {
    await endOff()
    await pass(TV_BLACK_HOLD_MS)
  }

  it("puts the keyboard back on the element that had it when the trip began, once the buttons are on again, and not before", async () => {
    const prove = q<HTMLButtonElement>("#prove-stub")
    prove.focus()
    act(() => learn.onProve?.())
    fall()
    await trip()
    expect(document.activeElement).not.toBe(prove) // the turn-on is playing, the buttons are still off
    await endOn()
    expect(document.activeElement).toBe(prove)
  })

  it("puts it back without scrolling the page", async () => {
    q<HTMLButtonElement>("#prove-stub").focus()
    act(() => learn.onProve?.())
    fall()
    focused = []
    await trip()
    await endOn()
    expect(focused.length).toBe(1)
    expect(focused[0]?.options).toEqual({ preventScroll: true })
  })

  it("leaves the keyboard where the person has put it during the trip", async () => {
    q<HTMLButtonElement>("#prove-stub").focus()
    act(() => learn.onProve?.())
    act(() => away.focus())
    await trip()
    await endOn()
    expect(document.activeElement).toBe(away)
  })

  it("takes nothing back when the keyboard was on nothing (the page itself) at the start", async () => {
    press()
    focused = []
    await trip()
    await endOn()
    expect(focused).toEqual([])
    expect(document.activeElement).toBe(document.body)
  })

  it("does not fail when the element that had the keyboard has been taken away during the trip", async () => {
    const extra = document.createElement("button")
    document.body.appendChild(extra)
    extra.focus()
    act(() => learn.onProve?.())
    extra.remove()
    await trip()
    await endOn()
    expect(document.activeElement).toBe(document.body)
  })

  it("remembers the keyboard again at the next trip, not the one of the first", async () => {
    const prove = q<HTMLButtonElement>("#prove-stub")
    prove.focus()
    act(() => learn.onProve?.())
    fall()
    await trip()
    await endOn()
    expect(document.activeElement).toBe(prove)
    act(() => away.focus())
    act(() => learn.onProve?.())
    await trip()
    await endOn()
    expect(document.activeElement).toBe(away)
  })
})

describe("GuideScreen: when the Learn screen breaks while it draws", () => {
  it("shows a message that says so, as an alert, inside the TV, and not the screen", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {}) // React writes the error it has caught
    learn.fail = true
    show("#guide")
    await load()
    const note = q(".ab-guide-note")
    expect(note.getAttribute("role")).toBe("alert")
    expect(note.textContent).toContain("could not be opened")
    expect(note.closest("#tv-stub")).not.toBeNull()
    expect(has("#learn-stub")).toBe(false)
  })
})
