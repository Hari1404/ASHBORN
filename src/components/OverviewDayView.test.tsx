// @vitest-environment jsdom
import { readFileSync } from "node:fs"
import { StrictMode, act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { DayScore, DaySession } from "@/lib/timerApi"

// The beam, the database calls and the lite level are replaced by stand-ins: this file only tests what the screen gives them, what it shows, when, and what it does to the page around it.
const beam = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }))
vi.mock("@/components/LaserFlow", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      beam.props.push(props)
      return h("canvas", { id: "beam-stub" })
    },
  }
})
type Reading<T> = { resolve: (value: T) => void; reject: (error: Error) => void }
const api = vi.hoisted(() => ({
  scoreDays: [] as string[],
  sessionDays: [] as string[],
  scores: [] as Reading<DayScore>[],
  sessions: [] as Reading<DaySession[]>[],
}))
vi.mock("@/lib/timerApi", () => ({
  timerDayScore: (day: string) => {
    api.scoreDays.push(day)
    return new Promise<DayScore>((resolve, reject) => api.scores.push({ resolve, reject }))
  },
  timerDaySessions: (day: string) => {
    api.sessionDays.push(day)
    return new Promise<DaySession[]>((resolve, reject) => api.sessions.push({ resolve, reject }))
  },
}))
const lite = vi.hoisted(() => ({ level: 0 }))
vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return lite.level
  },
}))

import OverviewDayView from "./OverviewDayView"
import { dayPaletteOf, OVERVIEW_CONDITIONS, type OverviewCondition } from "@/lib/overviewCondition"
import { buildDayView, dayLegendFor } from "@/lib/overviewDay"

// AB:OVERVIEW.TESTS:START
// Tests of "the whole day" screen of the Overview (src/components/OverviewDayView.tsx, CONNECTIONS.md C63): how it opens and what it does to the page behind it (scroll, inert, focus, the moving background), the settings and the timing of the beam, the day it draws (from the day model, C62), the errors and Try again, closing, the keyboard, and the rows of the labels of the pills. The clocks are the test's own (fake timers), the beam is a stand-in, and the sizes of the labels are given by the test (a screen that is not laid out has none).
const DAY = "2026-10-21"
const KOLKATA = "Asia/Kolkata"
const FADE_MS = 350
const BLACK_MS = 300
const LAND_MS = 1250
const REVEAL_DELAY_MS = 40

let root: Root | null = null
let container: HTMLElement | null = null
let appRoot: HTMLElement | null = null
const onClose = vi.fn()
let canvasContext: object | null = {}
let getContext: { mockRestore: () => void } | null = null

function indiaTime(clock: string, addMinutes = 0): string {
  const [h, m] = clock.split(":").map(Number)
  const total = h * 60 + m - 330 + addMinutes
  const pad = (n: number) => String(n).padStart(2, "0")
  return DAY + "T" + pad(Math.floor(total / 60)) + ":" + pad(total % 60) + ":00+00:00"
}

let counter = 0
function session(at: string, minutes: number, tag: string | null, over: Partial<DaySession> = {}): DaySession {
  counter += 1
  return {
    id: "00000000-0000-4000-8000-" + String(counter).padStart(12, "0"),
    startedAt: indiaTime(at),
    endedAt: indiaTime(at, minutes),
    activeSeconds: minutes * 60,
    tz: KOLKATA,
    pauses: [],
    tag,
    ...over,
  }
}

// The day of day-view.html.
const HTML_SESSIONS = [session("07:00", 52, "NPTEL"), session("10:25", 40, "STUDY"), session("14:58", 28, "STUDY"), session("19:40", 22, "STUDY")]

function score(over: Partial<DayScore> = {}): DayScore {
  return {
    day: DAY,
    creditedMinutes: 142,
    word: "ABOVE USUAL",
    usualMinutes: 80,
    usualIsStandIn: false,
    sessions: 4,
    shortSessions: 0,
    longestStretchMinutes: 52,
    countedMinutes: 150,
    countedOverElapsed: 0.9,
    unconfirmedMinutes: 0,
    overCapMinutes: 0,
    ...over,
  }
}

async function show(options: { day?: string; zone?: string; strict?: boolean; condition?: OverviewCondition } = {}): Promise<void> {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  const screen = createElement(OverviewDayView, { day: options.day ?? DAY, zone: options.zone ?? KOLKATA, condition: options.condition, onClose })
  await act(async () => {
    root?.render(options.strict ? createElement(StrictMode, null, screen) : screen)
  })
}

async function unmount(): Promise<void> {
  await act(async () => {
    root?.unmount()
  })
  root = null
}

// The reading number index (a second reading is made by Try again, and StrictMode makes two at the start).
async function answer(over: { score?: DayScore; sessions?: DaySession[]; index?: number } = {}): Promise<void> {
  const index = over.index ?? 0
  await act(async () => {
    api.scores[index].resolve(over.score ?? score())
    api.sessions[index].resolve(over.sessions ?? HTML_SESSIONS)
  })
}

async function pass(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

async function press(key: string, shiftKey = false): Promise<KeyboardEvent> {
  const event = new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true })
  await act(async () => {
    document.dispatchEvent(event)
  })
  return event
}

async function click(el: Element | null): Promise<void> {
  await act(async () => {
    ;(el as HTMLElement | null)?.click()
  })
}

function setReducedMotion(on: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({ matches: on && query.includes("reduce"), media: query }),
  })
}

const q = (selector: string) => document.querySelector<HTMLElement>(selector)
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)]
const texts = (selector: string) => all(selector).map((el) => el.textContent ?? "")
const lastBeam = () => beam.props[beam.props.length - 1]
const html = () => document.documentElement

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
  delete (window as { matchMedia?: unknown }).matchMedia
  beam.props = []
  api.scoreDays = []
  api.sessionDays = []
  api.scores = []
  api.sessions = []
  lite.level = 0
  onClose.mockClear()
  canvasContext = {}
  getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) =>
    type === "webgl2" ? canvasContext : null) as unknown as HTMLCanvasElement["getContext"])
  appRoot = document.createElement("div")
  appRoot.id = "root"
  document.body.appendChild(appRoot)
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  appRoot?.remove()
  appRoot = null
  getContext?.mockRestore()
  document.body.style.overflow = ""
  html().removeAttribute("data-ab-day-open")
  delete (window as { matchMedia?: unknown }).matchMedia
  vi.useRealTimers()
})

describe("opening the screen and locking the page", () => {
  it("is a dialog named The whole day, drawn straight in the body", async () => {
    await show()
    const dialog = q(".ab-day")
    expect(dialog?.getAttribute("role")).toBe("dialog")
    expect(dialog?.getAttribute("aria-modal")).toBe("true")
    expect(dialog?.getAttribute("aria-label")).toBe("The whole day")
    expect(dialog?.parentElement).toBe(document.body)
  })

  it("stops the page from scrolling and from taking taps while it is open, and gives both back", async () => {
    document.body.style.overflow = "auto"
    await show()
    expect(document.body.style.overflow).toBe("hidden")
    expect(appRoot?.hasAttribute("inert")).toBe(true)
    await unmount()
    expect(document.body.style.overflow).toBe("auto")
    expect(appRoot?.hasAttribute("inert")).toBe(false)
  })

  it("puts the focus on Close, and gives it back to the button that had it", async () => {
    const opener = document.createElement("button")
    appRoot?.appendChild(opener)
    opener.focus()
    await show()
    expect(document.activeElement).toBe(q(".ab-day-close"))
    await unmount()
    expect(document.activeElement).toBe(opener)
  })

  it("does not fail when the button that had the focus is gone, or when there is no element root", async () => {
    const opener = document.createElement("button")
    appRoot?.appendChild(opener)
    opener.focus()
    appRoot?.remove()
    await show()
    opener.remove()
    await unmount()
    expect(document.activeElement).toBe(document.body)
    expect(document.body.style.overflow).toBe("")
  })

  it("lets go of the page in StrictMode too (the effects run twice at the start)", async () => {
    await show({ strict: true })
    expect(document.body.style.overflow).toBe("hidden")
    expect(appRoot?.hasAttribute("inert")).toBe(true)
    await unmount()
    expect(document.body.style.overflow).toBe("")
    expect(appRoot?.hasAttribute("inert")).toBe(false)
    expect(html().hasAttribute("data-ab-day-open")).toBe(false)
  })

  it("hides the moving background of the Overview while it is open, and brings it back at the start of the fade out", async () => {
    await show()
    expect(html().hasAttribute("data-ab-day-open")).toBe(true)
    await click(q(".ab-day-close"))
    expect(html().hasAttribute("data-ab-day-open")).toBe(false)
  })

  it("is written in the page lock as a layout effect, so that it is given back when the screen is removed", () => {
    const source = readFileSync("src/components/OverviewDayView.tsx", "utf8")
    expect(source).toMatch(/useLayoutEffect\(\(\) => \{\s*const before = document\.activeElement/)
  })

  it("uses the attribute and the line that the css knows, and takes the glass look from overview.css", () => {
    const dayCss = readFileSync("src/dayview.css", "utf8")
    const overviewCss = readFileSync("src/overview.css", "utf8")
    expect(dayCss).toMatch(/html\[data-ab-day-open\] main\.ab-stub > \.ab-ascii-bg \{\s*display: none;/)
    expect(dayCss).toMatch(/\.ab-day-landing \{[^}]*top: var\(--ab-day-line\);/)
    expect(dayCss).toMatch(/\.ab-day-surface \{[^}]*top: var\(--ab-day-line\);/)
    expect(overviewCss).toMatch(/\.ab-glass-button \{/)
    expect(dayCss).not.toMatch(/\.ab-glass-button \{/)
  })
})

describe("the beam", () => {
  it("falls after the pure black, with the settings of the screen", async () => {
    await show()
    await pass(BLACK_MS - 1)
    expect(beam.props).toHaveLength(0)
    await pass(1)
    expect(beam.props.length).toBeGreaterThan(0)
    expect(lastBeam()).toMatchObject({ beamPosition: 0.5, color: dayPaletteOf("unknown").beam, intensity: 0.7, mouseInteraction: false })
  })

  it("keeps the spread of the library (the owner's choice) and a lower intensity than the library default", async () => {
    const library = readFileSync("src/components/LaserFlow.tsx", "utf8")
    const spread = Number(/^\s*spread = ([\d.]+),$/m.exec(library)?.[1])
    const intensity = Number(/^\s*intensity = ([\d.]+),$/m.exec(library)?.[1])
    expect(spread).toBeGreaterThan(0)
    await show()
    await pass(BLACK_MS)
    expect(lastBeam().spread).toBe(spread)
    expect(lastBeam().intensity as number).toBeLessThan(intensity)
  })

  it("lands on the empty box where the day starts, not on the box that scrolls", async () => {
    await show()
    await pass(BLACK_MS)
    const landing = (lastBeam().surfaceRef as { current: HTMLElement | null }).current
    expect(landing?.classList.contains("ab-day-landing")).toBe(true)
    expect(landing?.children).toHaveLength(0)
    expect(landing?.closest(".ab-day-surface")).toBeNull()
  })

  it("is drawn at pixel ratio 1 on a phone, and stands still at lite level 2", async () => {
    await show()
    await pass(BLACK_MS)
    expect(lastBeam()).toMatchObject({ dpr: undefined, paused: false })
    await unmount()
    container?.remove()
    beam.props = []
    lite.level = 1
    await show()
    await pass(BLACK_MS)
    expect(lastBeam()).toMatchObject({ dpr: 1, paused: false })
    await unmount()
    container?.remove()
    beam.props = []
    lite.level = 2
    await show()
    await pass(BLACK_MS)
    expect(lastBeam()).toMatchObject({ dpr: 1, paused: true })
  })

  it("is replaced by the plain line when the browser gives no WebGL 2, and not when it does", async () => {
    await show()
    expect(q(".ab-day-beam")?.dataset.gl).toBeUndefined()
    await pass(BLACK_MS)
    expect(q(".ab-day-beam")?.dataset.gl).toBe("yes")
    await unmount()
    container?.remove()
    canvasContext = null
    await show()
    await pass(BLACK_MS)
    expect(q(".ab-day-beam")?.dataset.gl).toBe("no")
  })
})

describe("the timing", () => {
  it("fades in a moment after it opens", async () => {
    await show()
    expect(q(".ab-day")?.dataset.on).toBe("false")
    await pass(20)
    expect(q(".ab-day")?.dataset.on).toBe("true")
  })

  it("says the light has landed after 1.25 seconds, and not before", async () => {
    await show()
    expect(q(".ab-day")?.dataset.lit).toBe("false")
    await pass(LAND_MS - 1)
    expect(q(".ab-day")?.dataset.lit).toBe("false")
    await pass(1)
    expect(q(".ab-day")?.dataset.lit).toBe("true")
  })

  it("says Reading the day… while the day is read", async () => {
    await show()
    expect(q(".ab-day-quiet")?.textContent).toBe("Reading the day…")
    expect(q(".ab-day-quiet")?.getAttribute("role")).toBe("status")
    expect(q(".ab-day-title")).toBeNull()
  })

  it("brings the day in a moment after the light has landed, when the day was read first", async () => {
    await show()
    await answer()
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("false")
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS - 1)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("false")
    await pass(1)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
  })

  it("brings the day in a moment after it is read, when the light landed first", async () => {
    await show()
    await pass(LAND_MS + 500)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("false")
    await answer()
    await pass(REVEAL_DELAY_MS - 1)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("false")
    await pass(1)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
  })

  it("shows everything at once with reduced motion", async () => {
    setReducedMotion(true)
    await show()
    expect(q(".ab-day")?.dataset.on).toBe("true")
    expect(q(".ab-day")?.dataset.lit).toBe("true")
    expect(beam.props.length).toBeGreaterThan(0)
    await answer()
    await pass(0)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
  })

  it("closes at once with reduced motion", async () => {
    setReducedMotion(true)
    await show()
    await click(q(".ab-day-close"))
    await pass(0)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe("the day", () => {
  it("asks for the score and the sessions of the day it was given, once each", async () => {
    await show({ day: "2026-10-20" })
    expect(api.scoreDays).toEqual(["2026-10-20"])
    expect(api.sessionDays).toEqual(["2026-10-20"])
  })

  it("draws the weekday, the sentence of the day score, one pill per session and the tag bar", async () => {
    await show()
    await answer()
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
    expect(q(".ab-day-sentence")?.textContent).toBe("Four sessions. The longest stretch ran 52, and none lasted under ten.")
    expect(texts(".ab-day-blab")).toEqual(["52 \u00b7 NPTEL", "40 \u00b7 STUDY", "28 \u00b7 STUDY", "22 \u00b7 STUDY"])
    expect(texts(".ab-day-tl span")).toEqual(["STUDY 90", "NPTEL 52"])
    expect(all(".ab-day-tags i")).toHaveLength(2)
  })

  it("takes the places, widths and qualities of the pills and the hour marks from the day model", async () => {
    await show()
    await answer()
    const expected = buildDayView({ day: DAY, sessions: HTML_SESSIONS, score: score(), deviceZone: KOLKATA })
    const bars = all(".ab-day-bar")
    expect(bars.map((bar) => bar.style.left)).toEqual(expected.bars.map((bar) => bar.leftPercent + "%"))
    expect(bars.map((bar) => bar.style.width)).toEqual(expected.bars.map((bar) => bar.widthPercent + "%"))
    expect(bars.map((bar) => bar.dataset.quality)).toEqual(expected.bars.map((bar) => bar.quality))
    expect(texts(".ab-day-ticks span")).toEqual(expected.axis.ticks.map((tick) => tick.label))
  })

  it("draws the four colours, and no Woke mark (the app has no wake time)", async () => {
    await show()
    await answer()
    expect(texts(".ab-day-legend span")).toEqual(dayLegendFor(dayPaletteOf("unknown").qualities).map((item) => item.label))
    expect(all(".ab-day-swatch")).toHaveLength(4)
    expect(q(".ab-day-woke")).toBeNull()
  })

  it("says the sentence of the score it was given, so it agrees with the panel of the Overview", async () => {
    await show()
    await answer({ score: score({ sessions: 4, shortSessions: 1, longestStretchMinutes: 58 }) })
    expect(q(".ab-day-sentence")?.textContent).toBe("Four sessions. The longest stretch ran 58, and 1 lasted under ten.")
  })

  it("draws the weekday and the sentence, and no timeline, for a day without a session", async () => {
    await show()
    await answer({ score: score({ sessions: 0, shortSessions: 0, longestStretchMinutes: 0 }), sessions: [] })
    expect(q(".ab-day-sentence")?.textContent).toBe("No session this day.")
    expect(q(".ab-day-track")).toBeNull()
    expect(q(".ab-day-legend")).toBeNull()
  })

  it("ignores a reading that comes after the screen is gone, and the first reading of StrictMode", async () => {
    await show({ strict: true })
    expect(api.scores).toHaveLength(2)
    await answer({ index: 1 })
    await answer({ index: 0, score: score({ sessions: 1, longestStretchMinutes: 9 }), sessions: [session("09:00", 9, null)] })
    expect(q(".ab-day-sentence")?.textContent).toBe("Four sessions. The longest stretch ran 52, and none lasted under ten.")
    expect(all(".ab-day-bar")).toHaveLength(4)
  })

  it("does nothing when the day is read after the screen is gone", async () => {
    await show()
    await unmount()
    const noise = vi.spyOn(console, "error").mockImplementation(() => undefined)
    await answer()
    expect(noise).not.toHaveBeenCalled()
    noise.mockRestore()
  })
})

describe("when the day cannot be read", () => {
  it("says so, with Try again, when the score cannot be read", async () => {
    await show()
    await act(async () => {
      api.scores[0].reject(new Error("NO_CONNECTION"))
      api.sessions[0].resolve(HTML_SESSIONS)
    })
    expect(q(".ab-day-quiet")?.textContent).toBe("Could not read this day.")
    expect(q(".ab-day-quiet")?.getAttribute("role")).toBe("alert")
    expect(q(".ab-day-retry")?.textContent).toBe("Try again")
    expect(q(".ab-day-title")).toBeNull()
  })

  it("says so when the sessions cannot be read", async () => {
    await show()
    await act(async () => {
      api.scores[0].resolve(score())
      api.sessions[0].reject(new Error("BAD_REPLY"))
    })
    expect(q(".ab-day-quiet")?.textContent).toBe("Could not read this day.")
    expect(q(".ab-day-title")).toBeNull()
  })

  it("says so when the day cannot be laid out (a time zone the browser does not know)", async () => {
    await show({ zone: "Not/AZone" })
    await answer({ sessions: [session("09:00", 30, "STUDY", { tz: null })] })
    expect(q(".ab-day-quiet")?.textContent).toBe("Could not read this day.")
    expect(q(".ab-day-retry")).not.toBeNull()
  })

  it("reads again at Try again, and shows the day when the second reading is good", async () => {
    await show()
    await act(async () => {
      api.scores[0].reject(new Error("NO_CONNECTION"))
      api.sessions[0].resolve(HTML_SESSIONS)
    })
    await click(q(".ab-day-retry"))
    expect(api.scores).toHaveLength(2)
    expect(api.sessions).toHaveLength(2)
    expect(api.scoreDays).toEqual([DAY, DAY])
    expect(q(".ab-day-quiet")?.textContent).toBe("Reading the day…")
    expect(q(".ab-day-retry")).toBeNull()
    await answer({ index: 1 })
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
    expect(q(".ab-day-quiet")).toBeNull()
  })
})

describe("closing", () => {
  it("fades out first, and tells the button to take the screen away after 350 milliseconds", async () => {
    await show()
    await pass(LAND_MS)
    expect(q(".ab-day")?.dataset.on).toBe("true")
    await click(q(".ab-day-close"))
    expect(q(".ab-day")?.dataset.on).toBe("false")
    await pass(FADE_MS - 1)
    expect(onClose).not.toHaveBeenCalled()
    await pass(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does the same at Escape, and keeps the key for itself", async () => {
    await show()
    const event = await press("Escape")
    expect(event.defaultPrevented).toBe(true)
    expect(q(".ab-day")?.dataset.on).toBe("false")
    await pass(FADE_MS)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does nothing at other keys", async () => {
    await show()
    const event = await press("a")
    await pass(1000)
    expect(event.defaultPrevented).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
  })

  it("tells only once, whatever the number of taps and keys", async () => {
    await show()
    await click(q(".ab-day-close"))
    await press("Escape")
    await click(q(".ab-day-close"))
    await pass(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("tells nothing when the screen is taken away during the fade", async () => {
    await show()
    await click(q(".ab-day-close"))
    await unmount()
    await pass(2000)
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe("the keyboard", () => {
  it("keeps the focus on Close when it is the only button", async () => {
    await show()
    await answer()
    const close = q(".ab-day-close")
    close?.focus()
    expect((await press("Tab")).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(close)
    expect((await press("Tab", true)).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(close)
  })

  describe("with Close and Try again", () => {
    beforeEach(async () => {
      await show()
      await act(async () => {
        api.scores[0].reject(new Error("NO_CONNECTION"))
        api.sessions[0].resolve(HTML_SESSIONS)
      })
    })

    it("goes round from the last button to the first, and back from the first to the last", async () => {
      const close = q(".ab-day-close")
      const retry = q(".ab-day-retry")
      retry?.focus()
      expect((await press("Tab")).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(close)
      expect((await press("Tab", true)).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(retry)
    })

    it("leaves Tab to the browser in the middle", async () => {
      q(".ab-day-close")?.focus()
      expect((await press("Tab")).defaultPrevented).toBe(false)
      q(".ab-day-retry")?.focus()
      expect((await press("Tab", true)).defaultPrevented).toBe(false)
    })

    it("brings the focus in when it is outside the screen", async () => {
      ;(document.activeElement as HTMLElement | null)?.blur()
      expect(document.activeElement).toBe(document.body)
      expect((await press("Tab")).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(q(".ab-day-close"))
      ;(document.activeElement as HTMLElement | null)?.blur()
      expect((await press("Tab", true)).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(q(".ab-day-retry"))
    })
  })
})

describe("the rows of the labels of the pills", () => {
  const labelOf = (tag: string) => "30 \u00b7 " + tag
  const rows = () => all(".ab-day-blab").map((label) => label.dataset.lane)
  const sessionsFor = (tags: string[]) => tags.map((tag, i) => session(String(7 + i).padStart(2, "0") + ":00", 30, tag))
  let rectSpy: { mockRestore: () => void } | null = null
  const rects = new Map<string, [number, number]>()

  beforeEach(() => {
    rects.clear()
    rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const [left, right] = (this.classList.contains("ab-day-blab") ? rects.get(this.textContent ?? "") : undefined) ?? [0, 0]
      return { left, right, width: right - left, top: 0, bottom: 0, height: 0, x: left, y: 0, toJSON: () => ({}) } as DOMRect
    })
  })
  afterEach(() => rectSpy?.mockRestore())

  async function lay(tags: string[], places: [number, number][]): Promise<void> {
    tags.forEach((tag, i) => rects.set(labelOf(tag), places[i]))
    await show()
    await answer({ sessions: sessionsFor(tags), score: score({ sessions: tags.length }) })
  }

  it("keeps labels that are far apart in the first row, with two rows of height", async () => {
    await lay(["AA", "BB", "CC"], [[100, 160], [300, 360], [500, 560]])
    expect(rows()).toEqual(["0", "0", "0"])
    expect(q(".ab-day-track")?.dataset.lanes).toBe("2")
  })

  it("keeps a gap of 8 pixels: a label that starts 8 after the one before stays, one that starts 7 after goes down", async () => {
    await lay(["AA", "BB", "CC"], [[100, 200], [208, 300], [307, 400]])
    expect(rows()).toEqual(["0", "0", "1"])
  })

  it("puts labels that touch in the next row, up to four rows, and the fifth in the row that is free the earliest", async () => {
    await lay(["AA", "BB", "CC", "DD", "EE"], [[100, 200], [110, 210], [120, 220], [130, 230], [140, 240]])
    expect(rows()).toEqual(["0", "1", "2", "3", "0"])
    expect(q(".ab-day-track")?.dataset.lanes).toBe("4")
  })

  it("makes the track three rows high when three rows are used", async () => {
    await lay(["AA", "BB", "CC"], [[100, 200], [110, 210], [120, 220]])
    expect(rows()).toEqual(["0", "1", "2"])
    expect(q(".ab-day-track")?.dataset.lanes).toBe("3")
  })

  it("brings a row back to a free place after a long label", async () => {
    await lay(["AA", "BB", "CC"], [[100, 400], [110, 160], [420, 480]])
    expect(rows()).toEqual(["0", "1", "0"])
  })

  it("pushes a label inwards when the edge of the screen would cut it, and moves nothing else", async () => {
    await lay(["AA", "BB", "CC"], [[-20, 60], [300, 360], [1000, 1060]])
    const [first, second, third] = all(".ab-day-blab")
    expect(first.style.translate).toBe("28px")
    expect(second.style.translate).toBe("")
    expect(third.style.translate).toBe("-44px")
    expect(rows()).toEqual(["0", "0", "0"])
  })

  it("keeps a label that has no size in the first row", async () => {
    await lay(["AA", "BB"], [[0, 0], [100, 160]])
    expect(rows()).toEqual(["0", "0"])
    expect(q(".ab-day-track")?.dataset.lanes).toBe("2")
  })
})
// How the browser writes a colour back (a hex colour comes back as rgb(...)), so that a written colour and a drawn one can be compared.
function drawn(color: string): string {
  const probe = document.createElement("i")
  probe.style.background = color
  return probe.style.background
}

describe("the colours of the condition", () => {
  it.each([...OVERVIEW_CONDITIONS])("gives the beam the laser colour of the condition %s", async (condition) => {
    await show({ condition })
    await pass(BLACK_MS)
    expect(lastBeam().color).toBe(dayPaletteOf(condition).beam)
  })

  it.each([...OVERVIEW_CONDITIONS])("draws the pills and the legend in the four colours of the condition %s", async (condition) => {
    await show({ condition })
    await answer()
    const colors = dayPaletteOf(condition).qualities
    const bars = all(".ab-day-bar")
    expect(bars.length).toBeGreaterThan(0)
    for (const bar of bars) expect(bar.style.background).toBe(drawn(colors[bar.dataset.quality as keyof typeof colors]))
    expect(all(".ab-day-swatch").map((swatch) => swatch.style.background)).toEqual([colors.meh, colors.solid, colors.deep, colors.flow].map(drawn))
  })

  it("sets the beam colour and the bright colour of the condition on the screen, for the css to use", async () => {
    await show({ condition: "notEnough" })
    const root = q(".ab-day")
    expect(root?.style.getPropertyValue("--ab-day-beam")).toBe(dayPaletteOf("notEnough").beam)
    expect(root?.style.getPropertyValue("--ab-day-accent")).toBe(dayPaletteOf("notEnough").accent)
    expect(root?.getAttribute("data-condition")).toBe("notEnough")
  })

  it("uses the colours of the condition unknown when it is given no condition", async () => {
    await show()
    await pass(BLACK_MS)
    expect(lastBeam().color).toBe(dayPaletteOf("unknown").beam)
    expect(q(".ab-day")?.getAttribute("data-condition")).toBe("unknown")
  })

  it("writes the weekday in the bright colour, and the fallback beam and the first part of the tag bar in the colours of the condition, in the css", () => {
    const css = readFileSync("src/dayview.css", "utf8")
    expect(css).toMatch(/\.ab-day-title \{[^}]*color: var\(--ab-day-accent\);/)
    expect(css).toMatch(/\.ab-day-fallback::before \{[^}]*var\(--ab-day-beam\)/)
    expect(css).toMatch(/\.ab-day-fallback::after \{[^}]*var\(--ab-day-beam\)/)
    expect(css).toMatch(/\.ab-day-tags i:first-child \{[^}]*background: var\(--ab-day-accent\);/)
    expect(css).not.toMatch(/#ff6a3c|rgba\(255, 106, 60|rgba\(255, 150, 100/)
  })

  it("still says the weekday as a word, for the css to colour", async () => {
    await show({ condition: "good" })
    await answer()
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
  })
})
// AB:OVERVIEW.TESTS:END
