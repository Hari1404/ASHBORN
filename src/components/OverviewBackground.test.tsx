// @vitest-environment jsdom
import { StrictMode, act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The library animation, the sound and the lite level are replaced by stand-ins: this file only tests what OverviewBackground gives them and when.
const lib = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }))
vi.mock("@/components/GradientASCII", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      lib.props.push(props)
      return h("canvas", { id: "ascii-stub" })
    },
  }
})
const sound = vi.hoisted(() => ({ starts: 0, stops: 0, live: 0 }))
vi.mock("@/lib/overviewSound", () => ({
  startIntroSound: () => {
    sound.starts += 1
    sound.live += 1
    let stopped = false
    return () => {
      if (stopped) return
      stopped = true
      sound.stops += 1
      sound.live -= 1
    }
  },
}))
const lite = vi.hoisted(() => ({ level: 0 }))
vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return lite.level
  },
}))

// The database is replaced by a stand-in too: the test says what the day score answers (or that it never does).
const api = vi.hoisted(() => ({ days: [] as string[], answer: null as null | (() => Promise<{ creditedMinutes: number }>) }))
vi.mock("@/lib/timerApi", () => ({
  deviceTimeZone: () => "Asia/Kolkata",
  timerDayScore: (day: string) => {
    api.days.push(day)
    return api.answer ? api.answer() : Promise.reject(new Error("no answer was set"))
  },
}))

import OverviewBackground from "./OverviewBackground"
import { CONDITION_WAIT_MS, OVERVIEW_CONDITIONS, OVERVIEW_CONDITION_PRESET, type OverviewCondition } from "@/lib/overviewCondition"
import { OVERVIEW_ASCII, OVERVIEW_PRESETS, OVERVIEW_PRESET_NAMES, type OverviewPresetName } from "@/lib/overviewLook"

// AB:OVERVIEW.TESTS:START
let root: Root | null = null
let container: HTMLElement | null = null

type Options = { strict?: boolean; condition?: OverviewCondition }

function element(condition?: OverviewCondition) {
  return createElement(OverviewBackground, condition === undefined ? null : { condition })
}

// Opens the background. With a condition it is given as the prop; without one the background reads the day itself.
function open({ strict = false, condition }: Options = {}): void {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(strict ? createElement(StrictMode, null, element(condition)) : element(condition)))
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// Lets the answer of the stand-in database arrive.
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
  })
}

function close(): void {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
}

const lastProps = () => lib.props[lib.props.length - 1]

// Finds the preset that the animation was given, by its colours.
function shown(): OverviewPresetName {
  const colors = lastProps().colors
  const name = OVERVIEW_PRESET_NAMES.find((n) => JSON.stringify(OVERVIEW_PRESETS[n].colors) === JSON.stringify(colors))
  if (!name) throw new Error("the animation was given colours of no preset")
  return name
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  lib.props = []
  api.days = []
  api.answer = null
  sound.starts = 0
  sound.stops = 0
  sound.live = 0
  lite.level = 0
})

afterEach(() => {
  if (root) close()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("OverviewBackground: the box and the settings", () => {
  it("is one box with the class ab-ascii-bg, hidden from screen readers, and not the half-size box ab-bg", () => {
    open({ condition: "good" })
    const box = container?.firstElementChild as HTMLElement
    expect(box.className).toBe("ab-ascii-bg")
    expect(box.getAttribute("aria-hidden")).toBe("true")
    expect(box.classList.contains("ab-bg")).toBe(false)
    expect(box.hasAttribute("data-lite")).toBe(false)
    expect(box.querySelector("#ascii-stub")).not.toBeNull()
  })

  it("gives the animation the cell size 19, the softer edges, no mouse and no click effect, and the intro", () => {
    open({ condition: "good" })
    const props = lastProps()
    expect(props.cellSize).toBe(19)
    expect(props.softness).toBe(OVERVIEW_ASCII.softness)
    expect(props.softness as number).toBeGreaterThan(0.5)
    expect(props.mouseInteraction).toBe(false)
    expect(props.clickEffect).toBe("none")
    expect(props.intro).toBe(true)
  })

  it("gives the animation the shape, the colours and the characters of the preset of the condition", () => {
    open({ condition: "okay" })
    const preset = OVERVIEW_PRESETS[shown()]
    expect(lastProps().shape).toBe(preset.shape)
    expect(lastProps().colors).toEqual(preset.colors)
    expect(lastProps().characters).toBe(preset.characters)
  })

  it("gives the animation nothing else: no speed, flow, glow or other setting of the Studio is changed", () => {
    open({ condition: "good" })
    expect(Object.keys(lastProps()).sort()).toEqual(["cellSize", "characters", "clickEffect", "colors", "dpr", "intro", "mouseInteraction", "shape", "softness"])
  })

  it("keeps the same preset while it is open, also when it draws again", () => {
    open({ condition: "notEnough" })
    const first = shown()
    act(() => root?.render(element("notEnough")))
    expect(shown()).toBe(first)
    expect(container?.querySelector(".ab-ascii-bg")?.getAttribute("data-preset")).toBe(first)
  })
})

describe("OverviewBackground: the pixel ratio on a phone", () => {
  it("leaves the pixel ratio to the library on a laptop (lite level 0)", () => {
    lite.level = 0
    open({ condition: "good" })
    expect(lastProps().dpr).toBeUndefined()
  })

  it.each([1, 2])("draws at a pixel ratio of 1 at lite level %i, and never stands still (no speed setting is given)", (level) => {
    lite.level = level
    open({ condition: "good" })
    expect(lastProps().dpr).toBe(1)
    expect(lastProps().cellSize).toBe(19)
    expect("speed" in lastProps()).toBe(false)
  })
})

describe("OverviewBackground: the condition that is passed in", () => {
  it.each([...OVERVIEW_CONDITIONS])("shows the preset of the condition %s", (condition) => {
    open({ condition })
    expect(shown()).toBe(OVERVIEW_CONDITION_PRESET[condition])
    const box = container?.querySelector(".ab-ascii-bg")
    expect(box?.getAttribute("data-preset")).toBe(OVERVIEW_CONDITION_PRESET[condition])
    expect(box?.getAttribute("data-condition")).toBe(condition)
  })

  it("gives unknown Atmosphere, notEnough Rose, okay Corona and good Lagoon", () => {
    const seen: Record<string, OverviewPresetName> = {}
    for (const condition of OVERVIEW_CONDITIONS) {
      open({ condition })
      seen[condition] = shown()
      close()
    }
    expect(seen).toEqual({ unknown: "atmosphere", notEnough: "rose", okay: "corona", good: "lagoon" })
    expect(new Set(Object.values(seen)).size).toBe(OVERVIEW_PRESET_NAMES.length)
  })

  it("does not ask the database when it is given the condition", () => {
    open({ condition: "good" })
    expect(api.days).toEqual([])
  })

  it("draws the new look at once when the condition that was passed in changes", () => {
    open({ condition: "notEnough" })
    expect(shown()).toBe("rose")
    act(() => root?.render(element("good")))
    expect(shown()).toBe("lagoon")
    expect(container?.querySelectorAll(".ab-ascii-bg").length).toBe(1)
  })

  it("shows the same look every time for the same condition (nothing is random any more)", () => {
    const seen = new Set<OverviewPresetName>()
    for (let i = 0; i < 6; i += 1) {
      open({ condition: "okay" })
      seen.add(shown())
      close()
    }
    expect([...seen]).toEqual(["corona"])
  })
})

describe("OverviewBackground: finding the condition itself", () => {
  it("draws nothing and starts no sound until the day score has answered", async () => {
    const answer = deferred<{ creditedMinutes: number }>()
    api.answer = () => answer.promise
    open()
    expect(container?.querySelector(".ab-ascii-bg")).toBeNull()
    expect(lib.props.length).toBe(0)
    expect(sound.starts).toBe(0)
    await act(async () => answer.resolve({ creditedMinutes: 300 }))
    expect(container?.querySelector(".ab-ascii-bg")).not.toBeNull()
    expect(sound.starts).toBe(1)
  })

  it("asks the day score once, for today as a day written yyyy-mm-dd", async () => {
    api.answer = () => Promise.resolve({ creditedMinutes: 10 })
    open()
    await settle()
    expect(api.days.length).toBe(1)
    expect(api.days[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it.each([
    [0, "unknown", "atmosphere"],
    [45, "notEnough", "rose"],
    [150, "okay", "corona"],
    [300, "good", "lagoon"],
  ] as const)("turns %s credited minutes into %s and shows %s", async (creditedMinutes, condition, preset) => {
    api.answer = () => Promise.resolve({ creditedMinutes })
    open()
    await settle()
    expect(shown()).toBe(preset)
    expect(container?.querySelector(".ab-ascii-bg")?.getAttribute("data-condition")).toBe(condition)
  })

  it("opens as unknown (Atmosphere) when the day score cannot be read", async () => {
    api.answer = () => Promise.reject(new Error("offline"))
    open()
    await settle()
    expect(shown()).toBe("atmosphere")
    expect(sound.starts).toBe(1)
  })

  it("opens as unknown after the wait when the day score does not answer, and a late answer changes nothing", async () => {
    vi.useFakeTimers()
    const answer = deferred<{ creditedMinutes: number }>()
    api.answer = () => answer.promise
    open()
    expect(container?.querySelector(".ab-ascii-bg")).toBeNull()
    await act(async () => {
      vi.advanceTimersByTime(CONDITION_WAIT_MS - 1)
    })
    expect(container?.querySelector(".ab-ascii-bg")).toBeNull()
    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    expect(shown()).toBe("atmosphere")
    const draws = lib.props.length
    await act(async () => answer.resolve({ creditedMinutes: 300 }))
    expect(shown()).toBe("atmosphere")
    expect(lib.props.length).toBe(draws)
    expect(sound.starts).toBe(1)
  })

  it("does not change the look when it draws again after the condition was found", async () => {
    api.answer = () => Promise.resolve({ creditedMinutes: 300 })
    open()
    await settle()
    api.answer = () => Promise.resolve({ creditedMinutes: 0 })
    act(() => root?.render(element()))
    await settle()
    expect(shown()).toBe("lagoon")
    expect(api.days.length).toBe(1)
  })

  it("starts nothing when it goes away before the answer, and gives no warning", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const answer = deferred<{ creditedMinutes: number }>()
    api.answer = () => answer.promise
    open()
    close()
    await act(async () => answer.resolve({ creditedMinutes: 300 }))
    expect(sound.starts).toBe(0)
    expect(lib.props.length).toBe(0)
    expect(error).not.toHaveBeenCalled()
  })

  it("draws one picture, with the sound ringing once at the end, when React StrictMode reads the day twice", async () => {
    api.answer = () => Promise.resolve({ creditedMinutes: 300 })
    open({ strict: true })
    await settle()
    expect(container?.querySelectorAll(".ab-ascii-bg").length).toBe(1)
    expect(shown()).toBe("lagoon")
    expect(sound.live).toBe(1)
    close()
    expect(sound.live).toBe(0)
  })
})

describe("OverviewBackground: the sound of the intro", () => {
  it("starts the sound once when it opens, and stops it when it goes away", () => {
    open({ condition: "good" })
    expect(sound.starts).toBe(1)
    expect(sound.stops).toBe(0)
    close()
    expect(sound.stops).toBe(1)
    expect(sound.live).toBe(0)
  })

  it("does not start the sound again when it draws again", () => {
    open({ condition: "good" })
    act(() => root?.render(element("good")))
    act(() => root?.render(element("good")))
    expect(sound.starts).toBe(1)
  })

  it("leaves no sound running when React StrictMode mounts it, takes it away and mounts it again, and none after it goes away", () => {
    open({ strict: true, condition: "good" })
    expect(sound.starts).toBe(2)
    expect(sound.live).toBe(1)
    close()
    expect(sound.live).toBe(0)
    expect(sound.stops).toBe(sound.starts)
  })
})
// AB:OVERVIEW.TESTS:END
