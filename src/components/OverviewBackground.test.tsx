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

import OverviewBackground from "./OverviewBackground"
import { OVERVIEW_ASCII, OVERVIEW_PRESETS, OVERVIEW_PRESET_NAMES, type OverviewPresetName } from "@/lib/overviewLook"

// AB:OVERVIEW.TESTS:START
let root: Root | null = null
let container: HTMLElement | null = null

function open(strict = false): void {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  const element = createElement(OverviewBackground)
  act(() => root?.render(strict ? createElement(StrictMode, null, element) : element))
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
  sound.starts = 0
  sound.stops = 0
  sound.live = 0
  lite.level = 0
})

afterEach(() => {
  if (root) close()
  vi.restoreAllMocks()
})

describe("OverviewBackground: the box and the settings", () => {
  it("is one box with the class ab-ascii-bg, hidden from screen readers, and not the half-size box ab-bg", () => {
    open()
    const box = container?.firstElementChild as HTMLElement
    expect(box.className).toBe("ab-ascii-bg")
    expect(box.getAttribute("aria-hidden")).toBe("true")
    expect(box.classList.contains("ab-bg")).toBe(false)
    expect(box.hasAttribute("data-lite")).toBe(false)
    expect(box.querySelector("#ascii-stub")).not.toBeNull()
  })

  it("gives the animation the cell size 19, the softer edges, no mouse and no click effect, and the intro", () => {
    open()
    const props = lastProps()
    expect(props.cellSize).toBe(19)
    expect(props.softness).toBe(OVERVIEW_ASCII.softness)
    expect(props.softness as number).toBeGreaterThan(0.5)
    expect(props.mouseInteraction).toBe(false)
    expect(props.clickEffect).toBe("none")
    expect(props.intro).toBe(true)
  })

  it("gives the animation the shape, the colours and the characters of the preset it picked", () => {
    open()
    const preset = OVERVIEW_PRESETS[shown()]
    expect(lastProps().shape).toBe(preset.shape)
    expect(lastProps().colors).toEqual(preset.colors)
    expect(lastProps().characters).toBe(preset.characters)
  })

  it("gives the animation nothing else: no speed, flow, glow or other setting of the Studio is changed", () => {
    open()
    expect(Object.keys(lastProps()).sort()).toEqual(["cellSize", "characters", "clickEffect", "colors", "dpr", "intro", "mouseInteraction", "shape", "softness"])
  })

  it("keeps the same preset while it is open, also when it draws again", () => {
    open()
    const first = shown()
    act(() => root?.render(createElement(OverviewBackground)))
    expect(shown()).toBe(first)
    expect(container?.querySelector(".ab-ascii-bg")?.getAttribute("data-preset")).toBe(first)
  })
})

describe("OverviewBackground: the pixel ratio on a phone", () => {
  it("leaves the pixel ratio to the library on a laptop (lite level 0)", () => {
    lite.level = 0
    open()
    expect(lastProps().dpr).toBeUndefined()
  })

  it.each([1, 2])("draws at a pixel ratio of 1 at lite level %i, and never stands still (no speed setting is given)", (level) => {
    lite.level = level
    open()
    expect(lastProps().dpr).toBe(1)
    expect(lastProps().cellSize).toBe(19)
    expect("speed" in lastProps()).toBe(false)
  })
})

describe("OverviewBackground: the choice of the preset", () => {
  it("shows each of the four presets when the random number is swept", () => {
    const seen = new Set<OverviewPresetName>()
    for (const r of [0, 0.3, 0.6, 0.9, 0.1, 0.5, 0.8, 0.2, 0.7, 0.99, 0.4, 0.05]) {
      vi.spyOn(Math, "random").mockReturnValue(r)
      open()
      seen.add(shown())
      close()
    }
    expect([...seen].sort()).toEqual([...OVERVIEW_PRESET_NAMES].sort())
  })

  it("never shows the same preset twice in a row, whatever the random number is", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    let before: OverviewPresetName | null = null
    for (let i = 0; i < 12; i += 1) {
      open()
      const now = shown()
      expect(now).not.toBe(before)
      before = now
      close()
    }
  })

  it("does not count a mount that was thrown away at once (React StrictMode) as the preset of the last time", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    open(true)
    const first = shown()
    close()
    open(true)
    expect(shown()).not.toBe(first)
  })
})

describe("OverviewBackground: the sound of the intro", () => {
  it("starts the sound once when it opens, and stops it when it goes away", () => {
    open()
    expect(sound.starts).toBe(1)
    expect(sound.stops).toBe(0)
    close()
    expect(sound.stops).toBe(1)
    expect(sound.live).toBe(0)
  })

  it("does not start the sound again when it draws again", () => {
    open()
    act(() => root?.render(createElement(OverviewBackground)))
    act(() => root?.render(createElement(OverviewBackground)))
    expect(sound.starts).toBe(1)
  })

  it("leaves no sound running when React StrictMode mounts it, takes it away and mounts it again, and none after it goes away", () => {
    open(true)
    expect(sound.starts).toBe(2)
    expect(sound.live).toBe(1)
    close()
    expect(sound.live).toBe(0)
    expect(sound.stops).toBe(sound.starts)
  })
})
// AB:OVERVIEW.TESTS:END
