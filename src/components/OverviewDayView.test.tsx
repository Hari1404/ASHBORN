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
import { conditionFromMinutes, dayPaletteOf, OVERVIEW_CONDITIONS, type OverviewCondition } from "@/lib/overviewCondition"
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

describe("the time axis: zoomed by default, Full day for the whole of it (Day screen idea 2)", () => {
  // Two early sessions (05:40 and 06:20; the helper session() cannot make a time before 05:30 in India), so the full axis (03 to 24) is mostly empty and the zoomed one is 03 to 09.
  const EARLY = [session("05:40", 22, "STUDY"), session("06:20", 27, "STUDY")]
  const earlyScore = () => score({ creditedMinutes: 49, sessions: 2, shortSessions: 0, longestStretchMinutes: 27 })
  const earlyView = (axisMode: "zoom" | "full") => buildDayView({ day: DAY, sessions: EARLY, score: earlyScore(), deviceZone: KOLKATA, axisMode })
  const toggle = () => q(".ab-day-full")
  const wholeDay = (view: { bars: { leftPercent: number; widthPercent: number }[] }) => ({
    lefts: view.bars.map((bar) => bar.leftPercent + "%"),
    widths: view.bars.map((bar) => bar.widthPercent + "%"),
  })
  const drawnBars = () => ({ lefts: all(".ab-day-bar").map((bar) => bar.style.left), widths: all(".ab-day-bar").map((bar) => bar.style.width) })

  it("draws the zoomed axis first: the hour marks and the pills are those of the zoomed day", async () => {
    await show()
    await answer({ score: earlyScore(), sessions: EARLY })
    expect(texts(".ab-day-ticks span")).toEqual(["03", "06", "09"])
    expect(drawnBars()).toEqual(wholeDay(earlyView("zoom")))
    expect(drawnBars()).not.toEqual(wholeDay(earlyView("full")))
  })

  it("has a Full day button, not pressed, under the hour marks", async () => {
    await show()
    await answer({ score: earlyScore(), sessions: EARLY })
    expect(toggle()?.textContent).toBe("Full day")
    expect(toggle()?.getAttribute("type")).toBe("button")
    expect(toggle()?.getAttribute("aria-pressed")).toBe("false")
    const ticks = q(".ab-day-ticks") as HTMLElement
    const detail = q(".ab-day-detail") as HTMLElement
    const row = q(".ab-day-axisrow") as HTMLElement
    // The line with the times of a tapped pill (idea 5) sits between the hour marks and the Full day button.
    expect(ticks.nextElementSibling).toBe(detail)
    expect(detail.nextElementSibling).toBe(row)
    expect(row.nextElementSibling).toBe(q(".ab-day-tags"))
  })

  it("shows the whole day (03 to 24) with Full day, and the zoom again with a second press", async () => {
    await show()
    await answer({ score: earlyScore(), sessions: EARLY })
    await click(toggle())
    expect(toggle()?.getAttribute("aria-pressed")).toBe("true")
    expect(texts(".ab-day-ticks span")).toEqual(["03", "06", "09", "12", "15", "18", "21", "24"])
    expect(drawnBars()).toEqual(wholeDay(earlyView("full")))
    await click(toggle())
    expect(toggle()?.getAttribute("aria-pressed")).toBe("false")
    expect(texts(".ab-day-ticks span")).toEqual(["03", "06", "09"])
    expect(drawnBars()).toEqual(wholeDay(earlyView("zoom")))
  })

  it("does not read the database again and does not play the opening again when the axis is switched", async () => {
    await show()
    await answer({ score: earlyScore(), sessions: EARLY })
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
    const readings = api.scores.length
    const beamDraws = beam.props.length
    const barsBefore = all(".ab-day-bar")
    const sheet = q(".ab-day-sheet")
    expect(sheet?.getAttribute("data-reveal")).toBe("true")
    await click(toggle())
    expect(api.scores.length).toBe(readings)
    expect(api.sessions.length).toBe(readings)
    expect(sheet?.getAttribute("data-reveal")).toBe("true")
    expect(all(".ab-day-bar")).toEqual(barsBefore)
    expect(q(".ab-day-sheet")).toBe(sheet)
    expect(beam.props.length).toBeGreaterThanOrEqual(beamDraws)
    expect(q(".ab-day")?.getAttribute("data-lit")).toBe("true")
  })

  it("gives the labels of the pills their rows again for the axis that is shown", async () => {
    await show()
    await answer({ score: earlyScore(), sessions: EARLY })
    const track = q(".ab-day-track") as HTMLElement
    const seen: string[] = []
    const original = track.querySelectorAll.bind(track)
    // Count how often the labels are walked: a switch of the axis must walk them again.
    track.querySelectorAll = ((selector: string) => {
      if (selector === ".ab-day-blab") seen.push("walked")
      return original(selector)
    }) as typeof track.querySelectorAll
    await click(toggle())
    expect(seen.length).toBeGreaterThan(0)
  })

  it("has no Full day button when the day already fills the axis (the day of day-view.html)", async () => {
    await show()
    await answer()
    expect(texts(".ab-day-ticks span")).toEqual(["06", "09", "12", "15", "18", "21", "24"])
    expect(toggle()).toBeNull()
    expect(q(".ab-day-axisrow")).toBeNull()
  })

  it("has no Full day button for a day without a session", async () => {
    await show()
    await answer({ score: score({ creditedMinutes: 0, sessions: 0, longestStretchMinutes: 0 }), sessions: [] })
    expect(q(".ab-day-sentence")?.textContent).toBe("No session this day.")
    expect(toggle()).toBeNull()
  })

  it("keeps the choice when another day of the week is chosen, and shows no button for a day that cannot be zoomed", async () => {
    await show()
    await answer({ score: earlyScore(), sessions: EARLY })
    await click(toggle())
    expect(toggle()?.getAttribute("aria-pressed")).toBe("true")
    const tuesday = all(".ab-day-chip").find((c) => c.getAttribute("aria-label") === "Tuesday") as HTMLElement
    await click(tuesday)
    await answer({ index: api.scores.length - 1, score: earlyScore(), sessions: EARLY })
    expect(q(".ab-day-title")?.textContent).toBe("Tuesday")
    expect(toggle()?.getAttribute("aria-pressed")).toBe("true")
    expect(texts(".ab-day-ticks span")).toEqual(["03", "06", "09", "12", "15", "18", "21", "24"])
    await click(toggle())
    expect(texts(".ab-day-ticks span")).toEqual(["03", "06", "09"])
    const monday = all(".ab-day-chip").find((c) => c.getAttribute("aria-label") === "Monday") as HTMLElement
    await click(monday)
    await answer({ index: api.scores.length - 1, score: score({ creditedMinutes: 142 }), sessions: HTML_SESSIONS })
    expect(q(".ab-day-title")?.textContent).toBe("Monday")
    expect(toggle()).toBeNull()
  })

  it("lets the keyboard reach the Full day button inside the screen (Tab stays inside)", async () => {
    await show()
    await answer({ score: earlyScore(), sessions: EARLY })
    const button = toggle() as HTMLElement
    button.focus()
    expect(document.activeElement).toBe(button)
    const event = await press("Tab")
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(q(".ab-day-close"))
    const back = await press("Tab", true)
    expect(back.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(button)
  })

  it("is written in the css: a small pill, in the bright colour when pressed, and no motion with reduced motion", () => {
    const css = readFileSync("src/dayview.css", "utf8")
    expect(css).toMatch(/\.ab-day-axisrow \{[^}]*justify-content: flex-end;/)
    expect(css).toMatch(/\.ab-day-full\[aria-pressed="true"\] \{[^}]*color: var\(--ab-day-accent\);/)
    expect(css).toMatch(/\.ab-day-full:focus-visible \{[^}]*outline: 2px solid var\(--ab-day-accent\);/)
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    expect(reduced).toContain(".ab-day-full")
  })
})

describe("the note under the sentence: the distance to the next level (Day screen idea 3)", () => {
  const note = () => q(".ab-day-note")

  it("says how far a Rose day is from Corona, as a second line right under the sentence", async () => {
    await show({ condition: "notEnough" })
    await answer({ score: score({ creditedMinutes: 50 }) })
    expect(note()?.textContent).toBe("About 70 minutes to Corona.")
    expect(note()?.tagName).toBe("P")
    expect(q(".ab-day-sentence")?.nextElementSibling).toBe(note())
    // The sentence stays as it was: the note never replaces it.
    expect(q(".ab-day-sentence")?.textContent).toBe("Four sessions. The longest stretch ran 52, and none lasted under ten.")
  })

  it("says how far a Corona day is from Lagoon", async () => {
    await show({ condition: "okay" })
    await answer({ score: score({ creditedMinutes: 142 }) })
    expect(note()?.textContent).toBe("About 100 minutes to Lagoon.")
  })

  it("has no note on Lagoon, on Atmosphere, for a day with no time, and when the minutes already reach the next level", async () => {
    await show({ condition: "good" })
    await answer({ score: score({ creditedMinutes: 300 }) })
    expect(note()).toBeNull()
    await unmount()
    document.body.replaceChildren(appRoot as HTMLElement)
    api.scores = []
    api.sessions = []
    await show()
    await answer()
    expect(note()).toBeNull()
    await unmount()
    document.body.replaceChildren(appRoot as HTMLElement)
    api.scores = []
    api.sessions = []
    await show({ condition: "notEnough" })
    await answer({ score: score({ creditedMinutes: 0, sessions: 0, longestStretchMinutes: 0 }), sessions: [] })
    expect(q(".ab-day-sentence")?.textContent).toBe("No session this day.")
    expect(note()).toBeNull()
    await unmount()
    document.body.replaceChildren(appRoot as HTMLElement)
    api.scores = []
    api.sessions = []
    await show({ condition: "notEnough" })
    await answer({ score: score({ creditedMinutes: 142 }) })
    expect(note()).toBeNull()
  })

  it("follows the day that is shown: \"short of\" for a day that is over, and back to \"to\" for today", async () => {
    await show({ condition: "notEnough" })
    await answer({ score: score({ creditedMinutes: 50 }) })
    expect(note()?.textContent).toBe("About 70 minutes to Corona.")
    const tuesday = all(".ab-day-chip").find((c) => c.getAttribute("aria-label") === "Tuesday") as HTMLElement
    await click(tuesday)
    await answer({ index: api.scores.length - 1, score: score({ day: "2026-10-20", creditedMinutes: 75 }), sessions: HTML_SESSIONS })
    expect(q(".ab-day-title")?.textContent).toBe("Tuesday")
    expect(note()?.textContent).toBe("About 45 minutes short of Corona.")
    const monday = all(".ab-day-chip").find((c) => c.getAttribute("aria-label") === "Monday") as HTMLElement
    await click(monday)
    await answer({ index: api.scores.length - 1, score: score({ day: "2026-10-19", creditedMinutes: 200 }), sessions: HTML_SESSIONS })
    expect(note()?.textContent).toBe("About 40 minutes short of Lagoon.")
    const wednesday = all(".ab-day-chip").find((c) => c.getAttribute("aria-label") === "Wednesday, today") as HTMLElement
    await click(wednesday)
    await answer({ index: api.scores.length - 1, score: score({ creditedMinutes: 50 }), sessions: HTML_SESSIONS })
    expect(note()?.textContent).toBe("About 70 minutes to Corona.")
  })

  it("is part of the day that is shown, so it is dimmed with it while another day is read", async () => {
    await show({ condition: "notEnough" })
    await answer({ score: score({ creditedMinutes: 50 }) })
    expect(note()?.closest(".ab-day-body")).not.toBeNull()
    expect(note()?.classList.contains("ab-day-r")).toBe(true)
    const tuesday = all(".ab-day-chip").find((c) => c.getAttribute("aria-label") === "Tuesday") as HTMLElement
    await click(tuesday)
    expect(q(".ab-day-body")?.getAttribute("data-busy")).toBe("true")
    expect(note()?.textContent).toBe("About 70 minutes to Corona.")
  })

  it("is written in the css as a smaller and dimmer line than the sentence", () => {
    const css = readFileSync("src/dayview.css", "utf8")
    expect(css).toMatch(/\.ab-day-note \{[^}]*margin: 8px 0 0;/)
    expect(css).toMatch(/\.ab-day-note \{[^}]*font-size: clamp\(14px, 2\.1vw, 16px\);/)
    expect(css).toMatch(/\.ab-day-note \{[^}]*color: rgba\(236, 230, 223, 0\.55\);/)
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
  it("goes round Close, the days and the pills: from the last button to Close, and back from Close to the last button", async () => {
    await show()
    await answer()
    const close = q(".ab-day-close")
    // The pills are buttons now (idea 5), so the last button of the day of day-view.html is its last pill.
    const last = all(".ab-day button").at(-1) as HTMLElement
    expect(last.classList.contains("ab-day-bar")).toBe(true)
    last.focus()
    expect((await press("Tab")).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(close)
    expect((await press("Tab", true)).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)
  })

  it("leaves Tab to the browser between Close and the days, and between two days", async () => {
    await show()
    await answer()
    const chips = all(".ab-day-chip")
    q(".ab-day-close")?.focus()
    expect((await press("Tab")).defaultPrevented).toBe(false)
    chips[0].focus()
    expect((await press("Tab")).defaultPrevented).toBe(false)
    chips[1].focus()
    expect((await press("Tab", true)).defaultPrevented).toBe(false)
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

  it("draws the focus ring of Close and Try again in the bright colour, and leaves the gold ring of the shared glass button to the Overview", () => {
    const css = readFileSync("src/dayview.css", "utf8")
    const overviewCss = readFileSync("src/overview.css", "utf8")
    expect(css).toMatch(/\.ab-glass-button\.ab-day-close:focus-visible,\s*\.ab-glass-button\.ab-day-retry:focus-visible \{[^}]*outline-color: var\(--ab-day-accent\);/)
    expect(overviewCss).toMatch(/\.ab-glass-button:focus-visible \{[^}]*outline: 2px solid #e8b062;/)
  })

  it("still says the weekday as a word, for the css to colour", async () => {
    await show({ condition: "good" })
    await answer()
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
  })
})
describe("the week: the days of this week up to today", () => {
  const MON = "2026-10-19"
  const TUE = "2026-10-20"
  const THU = "2026-10-22"
  const SUN = "2026-10-25"
  const chips = () => all(".ab-day-chip")
  const chip = (name: string) => chips().find((c) => c.getAttribute("aria-label")?.startsWith(name)) as HTMLElement
  const pressed = () => chips().map((c) => c.getAttribute("aria-pressed"))
  const TUE_SESSIONS = [session("09:00", 30, "MATHS"), session("13:00", 45, "MATHS")]
  const tueScore = (minutes = 75) => score({ day: TUE, creditedMinutes: minutes, sessions: 2, shortSessions: 0, longestStretchMinutes: 45 })

  it("shows one button for each day from Monday to today, with today marked and chosen", async () => {
    await show()
    expect(texts(".ab-day-chip")).toEqual(["Mon", "Tue", "Wed"])
    expect(chips().map((c) => c.getAttribute("aria-label"))).toEqual(["Monday", "Tuesday", "Wednesday, today"])
    expect(pressed()).toEqual(["false", "false", "true"])
    expect(chips().map((c) => c.dataset.today)).toEqual([undefined, undefined, "true"])
    expect(q(".ab-day-week")?.getAttribute("role")).toBe("group")
    expect(q(".ab-day-week")?.getAttribute("aria-label")).toBe("This week")
    expect(all(".ab-day-chip").every((c) => c.getAttribute("type") === "button")).toBe(true)
  })

  it("shows four days on a Thursday, Monday alone on a Monday and the whole week on a Sunday", async () => {
    await show({ day: THU })
    expect(texts(".ab-day-chip")).toEqual(["Mon", "Tue", "Wed", "Thu"])
    expect(pressed()).toEqual(["false", "false", "false", "true"])
    await unmount()
    document.body.replaceChildren(appRoot as HTMLElement)
    await show({ day: MON })
    expect(texts(".ab-day-chip")).toEqual(["Mon"])
    await unmount()
    document.body.replaceChildren(appRoot as HTMLElement)
    await show({ day: SUN })
    expect(texts(".ab-day-chip")).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
  })

  it("draws no row when the day text is not a day (the reading then says so)", async () => {
    await show({ day: "not-a-day" })
    expect(all(".ab-day-chip")).toHaveLength(0)
    await act(async () => {
      api.scores[0].resolve(score())
      api.sessions[0].resolve(HTML_SESSIONS)
    })
    expect(q("[role=alert]")?.textContent).toBe("Could not read this day.")
  })

  it("is there while the first day is read, and when the first day cannot be read", async () => {
    await show()
    expect(chips()).toHaveLength(3)
    expect(q("[role=status]")?.textContent).toBe("Reading the day…")
    await act(async () => {
      api.scores[0].reject(new Error("NO_CONNECTION"))
      api.sessions[0].resolve(HTML_SESSIONS)
    })
    expect(q("[role=alert]")?.textContent).toBe("Could not read this day.")
    expect(chips()).toHaveLength(3)
  })

  it("comes in with the light and not with the day", async () => {
    await show()
    expect(q(".ab-day")?.dataset.lit).toBe("false")
    await pass(LAND_MS)
    expect(q(".ab-day")?.dataset.lit).toBe("true")
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("false")
  })

  it("is there from the first picture with reduced motion", async () => {
    setReducedMotion(true)
    await show()
    expect(q(".ab-day")?.dataset.lit).toBe("true")
    expect(chips()).toHaveLength(3)
  })

  it("reads only the day that is chosen, with the same two readings as for today, and shows its weekday, sentence, pills and tag bar", async () => {
    await show()
    await answer()
    await click(chip("Tuesday"))
    expect(api.scoreDays).toEqual([DAY, TUE])
    expect(api.sessionDays).toEqual([DAY, TUE])
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q(".ab-day-title")?.textContent).toBe("Tuesday")
    expect(q(".ab-day-sentence")?.textContent).toBe("Two sessions. The longest stretch ran 45, and none lasted under ten.")
    expect(texts(".ab-day-blab")).toEqual(["30 \u00b7 MATHS", "45 \u00b7 MATHS"])
    expect(texts(".ab-day-tl span")).toEqual(["MATHS 75"])
    expect(pressed()).toEqual(["false", "true", "false"])
  })

  it("asks for the days of the week by their texts (Monday of this week is the first)", async () => {
    await show()
    await answer()
    await click(chip("Monday"))
    await click(chip("Tuesday"))
    expect(api.scoreDays).toEqual([DAY, MON, TUE])
    expect(api.sessionDays).toEqual([DAY, MON, TUE])
  })

  it("does nothing when the chosen day is chosen again", async () => {
    await show()
    await answer()
    await click(chip("Wednesday"))
    expect(api.scoreDays).toEqual([DAY])
    expect(pressed()).toEqual(["false", "false", "true"])
  })

  it("keeps the day that is shown, dimmer, while the chosen day is read, with the new button already chosen", async () => {
    await show()
    await answer()
    expect(q(".ab-day-body")?.dataset.busy).toBe("false")
    await click(chip("Tuesday"))
    expect(q(".ab-day-body")?.dataset.busy).toBe("true")
    expect(q(".ab-day-body")?.getAttribute("aria-busy")).toBe("true")
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
    expect(pressed()).toEqual(["false", "true", "false"])
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q(".ab-day-body")?.dataset.busy).toBe("false")
    expect(q(".ab-day-body")?.getAttribute("aria-busy")).toBe("false")
    expect(q(".ab-day-title")?.textContent).toBe("Tuesday")
  })

  it("does not play the opening again: the beam, the sheet and the pieces of the day are the same elements and the reveal stays on", async () => {
    await show()
    await pass(BLACK_MS)
    await answer()
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
    const before = [q("#beam-stub"), q(".ab-day"), q(".ab-day-sheet"), q(".ab-day-week"), q(".ab-day-body"), q(".ab-day-title"), q(".ab-day-sentence"), q(".ab-day-track")]
    expect(before.every((el) => el !== null)).toBe(true)
    await click(chip("Tuesday"))
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
    const after = [q("#beam-stub"), q(".ab-day"), q(".ab-day-sheet"), q(".ab-day-week"), q(".ab-day-body"), q(".ab-day-title"), q(".ab-day-sentence"), q(".ab-day-track")]
    after.forEach((el, i) => expect(el).toBe(before[i]))
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
    expect(q(".ab-day")?.dataset.lit).toBe("true")
    expect(q(".ab-day")?.dataset.on).toBe("true")
  })

  it("never turns the reveal off while another day is read or when it cannot be read", async () => {
    await show()
    await answer()
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
    await click(chip("Tuesday"))
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
    await act(async () => {
      api.scores[1].reject(new Error("NO_CONNECTION"))
      api.sessions[1].resolve([])
    })
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
  })

  describe("the colours of the chosen day", () => {
    it("stay while the day is read and go to the colours of the condition of its own minutes when it arrives", async () => {
      await show({ condition: "good" })
      await pass(BLACK_MS)
      await answer()
      expect(lastBeam().color).toBe(dayPaletteOf("good").beam)
      await click(chip("Tuesday"))
      expect(lastBeam().color).toBe(dayPaletteOf("good").beam)
      expect(q(".ab-day")?.getAttribute("data-condition")).toBe("good")
      await answer({ index: 1, score: tueScore(30), sessions: TUE_SESSIONS })
      const rose = dayPaletteOf("notEnough")
      expect(lastBeam().color).toBe(rose.beam)
      const root = q(".ab-day")
      expect(root?.style.getPropertyValue("--ab-day-beam")).toBe(rose.beam)
      expect(root?.style.getPropertyValue("--ab-day-accent")).toBe(rose.accent)
      expect(root?.getAttribute("data-condition")).toBe("notEnough")
    })

    it.each([
      [0, "unknown"],
      [60, "notEnough"],
      [150, "okay"],
      [300, "good"],
    ] as const)("of a day with %i credited minutes are those of the condition %s, in the beam, the pills and the legend", async (minutes, expected) => {
      expect(conditionFromMinutes(minutes)).toBe(expected)
      await show({ condition: "okay" })
      await pass(BLACK_MS)
      await answer()
      await click(chip("Tuesday"))
      await answer({ index: 1, score: tueScore(minutes), sessions: TUE_SESSIONS })
      const colors = dayPaletteOf(expected).qualities
      expect(lastBeam().color).toBe(dayPaletteOf(expected).beam)
      const bars = all(".ab-day-bar")
      expect(bars).toHaveLength(2)
      for (const bar of bars) expect(bar.style.background).toBe(drawn(colors[bar.dataset.quality as keyof typeof colors]))
      expect(all(".ab-day-swatch").map((swatch) => swatch.style.background)).toEqual([colors.meh, colors.solid, colors.deep, colors.flow].map(drawn))
    })

    it("of today are always the condition the button gave, also when today is chosen again and its minutes now say another condition", async () => {
      await show({ condition: "good" })
      await pass(BLACK_MS)
      await answer()
      await click(chip("Tuesday"))
      await answer({ index: 1, score: tueScore(30), sessions: TUE_SESSIONS })
      expect(lastBeam().color).toBe(dayPaletteOf("notEnough").beam)
      await click(chip("Wednesday"))
      await answer({ index: 2, score: score({ creditedMinutes: 30 }) })
      expect(lastBeam().color).toBe(dayPaletteOf("good").beam)
      expect(q(".ab-day")?.getAttribute("data-condition")).toBe("good")
      expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
      expect(api.scoreDays).toEqual([DAY, TUE, DAY])
    })

    it("go to the colours of the condition unknown for a day without a session", async () => {
      await show({ condition: "good" })
      await pass(BLACK_MS)
      await answer()
      await click(chip("Monday"))
      await answer({ index: 1, score: score({ day: MON, creditedMinutes: 0, sessions: 0, shortSessions: 0, longestStretchMinutes: 0 }), sessions: [] })
      expect(q(".ab-day-title")?.textContent).toBe("Monday")
      expect(q(".ab-day-sentence")?.textContent).toBe("No session this day.")
      expect(all(".ab-day-track")).toHaveLength(0)
      expect(lastBeam().color).toBe(dayPaletteOf("unknown").beam)
    })
  })

  it("ignores a reading of a day that is not chosen any more", async () => {
    await show()
    await answer()
    await click(chip("Tuesday"))
    await click(chip("Monday"))
    expect(api.scoreDays).toEqual([DAY, TUE, MON])
    await answer({ index: 2, score: score({ day: MON, creditedMinutes: 150 }), sessions: [session("08:00", 30, "NPTEL")] })
    expect(q(".ab-day-title")?.textContent).toBe("Monday")
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q(".ab-day-title")?.textContent).toBe("Monday")
    expect(texts(".ab-day-blab")).toEqual(["30 \u00b7 NPTEL"])
    expect(pressed()).toEqual(["true", "false", "false"])
  })

  it("lets the first day be left before it is read, and shows the day that was chosen", async () => {
    await show()
    await click(chip("Monday"))
    await act(async () => {
      api.scores[0].resolve(score())
      api.sessions[0].resolve(HTML_SESSIONS)
    })
    expect(q("[role=status]")?.textContent).toBe("Reading the day…")
    await answer({ index: 1, score: score({ day: MON, creditedMinutes: 150 }), sessions: [session("08:00", 30, "NPTEL")] })
    expect(q(".ab-day-title")?.textContent).toBe("Monday")
    expect(pressed()).toEqual(["true", "false", "false"])
  })

  it("says so, with Try again, when the chosen day cannot be read, keeps the row, and Try again reads that day and not today", async () => {
    await show()
    await answer()
    await click(chip("Tuesday"))
    await act(async () => {
      api.scores[1].reject(new Error("NO_CONNECTION"))
      api.sessions[1].resolve(TUE_SESSIONS)
    })
    expect(q("[role=alert]")?.textContent).toBe("Could not read this day.")
    expect(all(".ab-day-body")).toHaveLength(0)
    expect(chips()).toHaveLength(3)
    expect(pressed()).toEqual(["false", "true", "false"])
    await click(q(".ab-day-retry"))
    expect(api.scoreDays).toEqual([DAY, TUE, TUE])
    await answer({ index: 2, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q("[role=alert]")).toBeNull()
    expect(q(".ab-day-title")?.textContent).toBe("Tuesday")
  })

  it("lets another day be chosen after a day could not be read, and shows the day before again when it is chosen", async () => {
    await show()
    await answer()
    await click(chip("Tuesday"))
    await act(async () => {
      api.scores[1].reject(new Error("NO_CONNECTION"))
      api.sessions[1].resolve(TUE_SESSIONS)
    })
    await click(chip("Wednesday"))
    expect(q("[role=alert]")).toBeNull()
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
    expect(q(".ab-day-body")?.dataset.busy).toBe("false")
    await answer({ index: 2 })
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
  })

  it("places the labels of the pills of the new day (the rows are worked out again)", async () => {
    await show()
    await answer()
    await click(chip("Tuesday"))
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(all(".ab-day-blab").every((label) => label.dataset.lane !== undefined)).toBe(true)
    expect(q(".ab-day-track")?.dataset.lanes).toBe("2")
  })

  it("works in StrictMode too (two readings at the start, then one for each chosen day)", async () => {
    await show({ strict: true })
    expect(api.scoreDays).toEqual([DAY, DAY])
    await answer({ index: 1 })
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
    await click(chip("Tuesday"))
    expect(api.scoreDays.slice(2).every((d) => d === TUE)).toBe(true)
    await answer({ index: api.scores.length - 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q(".ab-day-title")?.textContent).toBe("Tuesday")
  })

  it("takes the row, the chosen day, the dimming and the colour of the chosen day from the css, and stops their motion with reduced motion", () => {
    const css = readFileSync("src/dayview.css", "utf8")
    expect(css).toMatch(/\.ab-day\[data-lit="true"\] \.ab-day-week \{[^}]*opacity: 1;/)
    expect(css).toMatch(/\.ab-day-chip\[aria-pressed="true"\] \{[^}]*color: var\(--ab-day-accent\);/)
    expect(css).toMatch(/\.ab-day-chip\[data-today="true"\]::after \{/)
    expect(css).toMatch(/\.ab-day-body\[data-busy="true"\] \{[^}]*opacity: 0\.4;/)
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    for (const name of [".ab-day-week", ".ab-day-chip", ".ab-day-body"]) expect(reduced).toContain(name)
  })

  it("does not ask the database for anything else: the HUD is not part of this screen and no other function is imported", () => {
    const source = readFileSync("src/components/OverviewDayView.tsx", "utf8")
    expect(source).toContain('import { timerDayScore, timerDaySessions } from "@/lib/timerApi"')
  })
})

describe("the motion of the data: pills, tag bar and figures (Day screen idea 4)", () => {
  const TUE = "2026-10-20"
  const TUE_SESSIONS = [session("09:00", 30, "MATHS"), session("13:00", 45, "MATHS")]
  const tueScore = () => score({ day: TUE, creditedMinutes: 75, sessions: 2, shortSessions: 0, longestStretchMinutes: 45 })
  const chip = (name: string) => all(".ab-day-chip").find((c) => c.getAttribute("aria-label")?.startsWith(name)) as HTMLElement
  const opened = async () => {
    await show()
    await answer()
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
  }
  // The text of a block of the css from the line that starts it to the first closing brace (the blocks of this file do not nest, except the keyframes and the media queries, which the tests read with their own patterns).
  const css = readFileSync("src/dayview.css", "utf8")
  const block = (start: string) => {
    const at = css.indexOf(start + " {")
    expect(at).toBeGreaterThan(-1)
    return css.slice(at, css.indexOf("}", at) + 1)
  }

  it("gives the css the number of pills and the final minutes of every tag, and keeps the final figure in the text", async () => {
    await opened()
    expect(q(".ab-day-tags")?.style.getPropertyValue("--pills")).toBe("4")
    expect(q(".ab-day-tl")?.style.getPropertyValue("--pills")).toBe("4")
    expect(all(".ab-day-count").map((b) => b.style.getPropertyValue("--ab-day-n"))).toEqual(["90", "52"])
    expect(texts(".ab-day-count")).toEqual(["90", "52"])
    expect(texts(".ab-day-tl span")).toEqual(["STUDY 90", "NPTEL 52"])
  })

  it("keeps the final figures in the text with reduced motion too (the css then draws no counting)", async () => {
    setReducedMotion(true)
    await opened()
    expect(texts(".ab-day-count")).toEqual(["90", "52"])
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
  })

  it("draws the first day as the opening, with the long growing of the pills (not again)", async () => {
    await opened()
    expect(q(".ab-day-track")?.dataset.again).toBe("false")
  })

  it("grows only the pills of a day chosen in the week row again, and plays nothing else again", async () => {
    await opened()
    const same = [q(".ab-day-sheet"), q(".ab-day-track"), q(".ab-day-tags"), q(".ab-day-tl"), q(".ab-day-title"), q("#beam-stub")]
    const pillsBefore = all(".ab-day-bar")
    await click(chip("Tuesday"))
    // While the day is read the day that is shown is not touched.
    expect(q(".ab-day-track")?.dataset.again).toBe("false")
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q(".ab-day-track")?.dataset.again).toBe("true")
    const pillsAfter = all(".ab-day-bar")
    expect(pillsAfter).toHaveLength(2)
    expect(pillsAfter.some((bar) => pillsBefore.includes(bar))).toBe(false)
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
    ;[q(".ab-day-sheet"), q(".ab-day-track"), q(".ab-day-tags"), q(".ab-day-tl"), q(".ab-day-title"), q("#beam-stub")].forEach((el, i) => expect(el).toBe(same[i]))
    expect(q(".ab-day-tags")?.style.getPropertyValue("--pills")).toBe("2")
    expect(texts(".ab-day-count")).toEqual(["75"])
  })

  it("does not grow the pills again when the axis is switched (they keep their elements and only move)", async () => {
    await show()
    await answer({ score: score({ creditedMinutes: 49, sessions: 2, longestStretchMinutes: 27 }), sessions: [session("05:40", 22, "STUDY"), session("06:20", 27, "STUDY")] })
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
    const pills = all(".ab-day-bar")
    await click(q(".ab-day-full"))
    expect(all(".ab-day-bar")).toEqual(pills)
    expect(q(".ab-day-track")?.dataset.again).toBe("false")
  })

  it("counts a day that is read before the light has landed as part of the opening, not as a day chosen later", async () => {
    await show()
    await click(chip("Tuesday"))
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q(".ab-day-track")?.dataset.again).toBe("false")
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
    expect(q(".ab-day-track")?.dataset.again).toBe("false")
    expect(q(".ab-day-sheet")?.dataset.reveal).toBe("true")
  })

  it("says the lite level on the screen, for the css (0 laptop, 1 phone, 2 phone that stands still)", async () => {
    for (const level of [0, 1, 2]) {
      lite.level = level
      await show()
      expect(q(".ab-day")?.getAttribute("data-lite-level")).toBe(String(level))
      await unmount()
      container?.remove()
      container = null
    }
  })

  it("is written in the css: the pills grow with a keyframe animation (not a transition), shorter for a day chosen later", () => {
    expect(css).toMatch(/@keyframes ab-day-grow \{\s*from \{[^}]*scaleX\(0\.1\)[^}]*\}\s*to \{[^}]*transform: none;/)
    expect(block(".ab-day-bar")).not.toContain("transition")
    expect(block('.ab-day-sheet[data-reveal="true"] .ab-day-bar')).toMatch(/animation: ab-day-grow 0\.7s [^;]*both;/)
    expect(block('.ab-day-sheet[data-reveal="true"] .ab-day-bar')).toContain("animation-delay: calc(450ms + var(--i, 0) * 220ms);")
    const again = block('.ab-day-sheet[data-reveal="true"] .ab-day-track[data-again="true"] .ab-day-bar')
    expect(again).toContain("animation-duration: 0.45s;")
    expect(again).toContain("animation-delay: calc(var(--i, 0) * 70ms);")
  })

  it("is written in the css: the tag bar wipes in from the left after the first pills, and its figures wait for the same moment", () => {
    expect(css).toMatch(/@keyframes ab-day-wipe \{\s*from \{\s*clip-path: inset\(0 100% 0 0\);\s*\}\s*to \{\s*clip-path: inset\(0 0 0 0\);/)
    expect(block(".ab-day-tags,\n.ab-day-tl")).toContain("--ab-day-tagwait: calc(450ms + min(var(--pills, 1), 4) * 220ms);")
    expect(block('.ab-day-sheet[data-reveal="true"] .ab-day-tags')).toMatch(/animation: ab-day-wipe 0\.9s [^;]*var\(--ab-day-tagwait\) both;/)
    expect(block(".ab-day-tl.ab-day-r")).toContain("transition-delay: var(--ab-day-tagwait);")
  })

  it("is written in the css: the figure counts up with a registered whole number, drawn over the real text, only where motion is wanted", () => {
    expect(css).toMatch(/@property --ab-day-n \{\s*syntax: "<integer>";\s*inherits: false;\s*initial-value: 0;/)
    expect(css).toMatch(/@keyframes ab-day-count \{\s*from \{\s*--ab-day-n: 0;/)
    const wanted = css.slice(css.indexOf("@media (prefers-reduced-motion: no-preference)"))
    const open = wanted.slice(0, wanted.indexOf("/* At lite level 2"))
    expect(open).toContain('.ab-day:not([data-lite-level="2"]) .ab-day-sheet[data-reveal="true"] .ab-day-count {')
    expect(open).toContain("color: transparent;")
    expect(open).toContain("counter-reset: ab-day-n var(--ab-day-n);")
    expect(open).toContain("animation: ab-day-count 0.9s")
    expect(open).toContain("content: counter(ab-day-n);")
    // Nothing that hides the real text is written outside that media query.
    expect(css.slice(0, css.indexOf("@media (prefers-reduced-motion: no-preference)"))).not.toMatch(/(^|[\s;{])color: transparent;/)
  })

  it("is written in the css: nothing moves at lite level 2 or with reduced motion", () => {
    const lite2 = block('.ab-day[data-lite-level="2"] .ab-day-bar,\n.ab-day[data-lite-level="2"] .ab-day-tags')
    expect(lite2).toContain("animation: none !important;")
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    expect(reduced).toMatch(/\.ab-day-bar,\s*\.ab-day-tags \{\s*animation: none !important;/)
  })
})
describe("the times of a pill: a tap on a pill shows its session (Day screen idea 5)", () => {
  const TUE = "2026-10-20"
  const TUE_SESSIONS = [session("09:00", 30, "MATHS"), session("13:00", 45, "MATHS")]
  const tueScore = () => score({ day: TUE, creditedMinutes: 75, sessions: 2, shortSessions: 0, longestStretchMinutes: 45 })
  const chip = (name: string) => all(".ab-day-chip").find((c) => c.getAttribute("aria-label")?.startsWith(name)) as HTMLElement
  const pills = () => all(".ab-day-bar")
  const line = () => q(".ab-day-detail")?.textContent
  const pressedPills = () => pills().map((pill) => pill.getAttribute("aria-pressed"))
  const css = readFileSync("src/dayview.css", "utf8")
  const block = (start: string) => {
    const at = css.indexOf(start + " {")
    expect(at).toBeGreaterThan(-1)
    return css.slice(at, css.indexOf("}", at) + 1)
  }

  it("makes every pill a button that is not pressed, with its minutes and times as its name", async () => {
    await show()
    await answer()
    expect(pills()).toHaveLength(4)
    for (const pill of pills()) {
      expect(pill.tagName).toBe("BUTTON")
      expect(pill.getAttribute("type")).toBe("button")
    }
    expect(pressedPills()).toEqual(["false", "false", "false", "false"])
    expect(pills().map((pill) => pill.getAttribute("aria-label"))).toEqual([
      "52 minutes, 07:00 to 07:52 \u00b7 NPTEL \u00b7 deep",
      "40 minutes, 10:25 to 11:05 \u00b7 STUDY \u00b7 deep",
      "28 minutes, 14:58 to 15:26 \u00b7 STUDY \u00b7 solid",
      "22 minutes, 19:40 to 20:02 \u00b7 STUDY \u00b7 solid",
    ])
  })

  it("has an empty line, a polite status, right under the hour marks, until a pill is tapped", async () => {
    await show()
    await answer()
    const detail = q(".ab-day-detail") as HTMLElement
    expect(detail.tagName).toBe("P")
    expect(detail.getAttribute("role")).toBe("status")
    expect(detail.textContent).toBe("")
    expect(q(".ab-day-ticks")?.nextElementSibling).toBe(detail)
    expect(detail.classList.contains("ab-day-r")).toBe(true)
  })

  it("shows the times, the tag and the quality of a pill when it is tapped, and marks that pill as pressed", async () => {
    await show()
    await answer()
    await click(pills()[1])
    expect(line()).toBe("10:25 to 11:05 \u00b7 STUDY \u00b7 deep")
    expect(pressedPills()).toEqual(["false", "true", "false", "false"])
  })

  it("moves the line to another pill that is tapped, and takes it away when the same pill is tapped again", async () => {
    await show()
    await answer()
    await click(pills()[0])
    expect(line()).toBe("07:00 to 07:52 \u00b7 NPTEL \u00b7 deep")
    await click(pills()[3])
    expect(line()).toBe("19:40 to 20:02 \u00b7 STUDY \u00b7 solid")
    expect(pressedPills()).toEqual(["false", "false", "false", "true"])
    await click(pills()[3])
    expect(line()).toBe("")
    expect(pressedPills()).toEqual(["false", "false", "false", "false"])
  })

  it("is reached by the keyboard: a pill takes the focus, and Enter and Space of a button press it (a click)", async () => {
    await show()
    await answer()
    pills()[2].focus()
    expect(document.activeElement).toBe(pills()[2])
    await click(document.activeElement)
    expect(line()).toBe("14:58 to 15:26 \u00b7 STUDY \u00b7 solid")
  })

  it("keeps the line when the axis is switched, because the times do not depend on the axis", async () => {
    await show()
    await answer({ score: score({ creditedMinutes: 49, sessions: 2, longestStretchMinutes: 27 }), sessions: [session("05:40", 22, "STUDY"), session("06:20", 27, "STUDY")] })
    await click(pills()[0])
    expect(line()).toBe("05:40 to 06:02 \u00b7 STUDY \u00b7 solid")
    await click(q(".ab-day-full"))
    expect(line()).toBe("05:40 to 06:02 \u00b7 STUDY \u00b7 solid")
    expect(pressedPills()).toEqual(["true", "false"])
  })

  it("takes the line away when another day of the week is chosen, and does not bring it back when the first day is chosen again", async () => {
    await show()
    await answer()
    await click(pills()[0])
    expect(line()).toBe("07:00 to 07:52 \u00b7 NPTEL \u00b7 deep")
    await click(chip("Tuesday"))
    await answer({ index: 1, score: tueScore(), sessions: TUE_SESSIONS })
    expect(q(".ab-day-title")?.textContent).toBe("Tuesday")
    expect(line()).toBe("")
    expect(pressedPills()).toEqual(["false", "false"])
    // Back on the first day, whose sessions (and so their ids) are the same as before: the pill that was open is not open again.
    await click(chip("Wednesday"))
    await answer({ index: 2 })
    expect(q(".ab-day-title")?.textContent).toBe("Wednesday")
    expect(line()).toBe("")
    expect(pressedPills()).toEqual(["false", "false", "false", "false"])
  })

  it("does not move or build anything again when a pill is tapped (the sheet, the track and the pills stay)", async () => {
    await show()
    await answer()
    await pass(LAND_MS)
    await pass(REVEAL_DELAY_MS)
    const track = q(".ab-day-track")
    const before = pills()
    const readings = api.scores.length
    await click(before[1])
    expect(q(".ab-day-track")).toBe(track)
    expect(pills()).toEqual(before)
    expect(q(".ab-day-sheet")?.getAttribute("data-reveal")).toBe("true")
    expect(q(".ab-day-track")?.getAttribute("data-again")).toBe("false")
    expect(api.scores.length).toBe(readings)
  })

  it("leaves Escape to close the whole screen, also when a pill has the focus", async () => {
    await show()
    await answer()
    await click(pills()[0])
    const event = await press("Escape")
    expect(event.defaultPrevented).toBe(true)
    expect(q(".ab-day")?.dataset.on).toBe("false")
    await pass(FADE_MS)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("has no line and no pill for a day without a session", async () => {
    await show()
    await answer({ score: score({ creditedMinutes: 0, sessions: 0, shortSessions: 0, longestStretchMinutes: 0 }), sessions: [] })
    expect(pills()).toHaveLength(0)
    expect(q(".ab-day-detail")).toBeNull()
  })

  it("is written in the css: the button look is taken off, the tap area is about 44 px high, and the pill is hidden until the reveal", () => {
    const base = block(".ab-day-bar")
    for (const rule of ["visibility: hidden;", "padding: 0;", "border: 0;", "cursor: pointer;", "font: inherit;"]) expect(base).toContain(rule)
    expect(block(".ab-day-bar::before")).toContain("inset: -15px -4px;")
    expect(block('.ab-day-sheet[data-reveal="true"] .ab-day-bar')).toContain("visibility: visible;")
  })

  it("is written in the css: a pressed or focused pill has a ring in the bright colour, and the line keeps its height when empty", () => {
    expect(css).toMatch(/\.ab-day-bar\[aria-pressed="true"\],\s*\.ab-day-bar:focus-visible \{[^}]*outline: 2px solid var\(--ab-day-accent\);/)
    expect(block(".ab-day-detail")).toContain("min-height: 18px;")
  })

  it("is written in the css: the animation of the pills is untouched (a keyframe animation, off at lite level 2 and with reduced motion)", () => {
    expect(block('.ab-day-sheet[data-reveal="true"] .ab-day-bar')).toMatch(/animation: ab-day-grow 0\.7s [^;]*both;/)
    expect(css).toContain('.ab-day[data-lite-level="2"] .ab-day-bar,')
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    expect(reduced).toMatch(/\.ab-day-bar,\s*\.ab-day-tags \{\s*animation: none !important;/)
  })
})
// AB:OVERVIEW.TESTS:END
