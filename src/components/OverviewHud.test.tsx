// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { DayScore } from "@/lib/timerApi"

// The rolling digits, the database call and the lite level are replaced by stand-ins: this file only tests what the screen shows, which day it asks for and when it asks again.
vi.mock("@/components/Counter", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: { value?: number; minDigits?: number; motionBlur?: boolean }) =>
      h("span", {
        "data-counter": String(props.value),
        "data-min": String(props.minDigits ?? 1),
        "data-blur": String(props.motionBlur),
      }),
  }
})
type Waiting = { resolve: (score: DayScore) => void; reject: (error: Error) => void }
const api = vi.hoisted(() => ({ zone: "Asia/Kolkata" as string | null, days: [] as string[], waiting: [] as Waiting[] }))
vi.mock("@/lib/timerApi", () => ({
  deviceTimeZone: () => {
    if (api.zone === null) throw new Error("this device gives no time zone")
    return api.zone
  },
  timerDayScore: (day: string) => {
    api.days.push(day)
    return new Promise<DayScore>((resolve, reject) => api.waiting.push({ resolve, reject }))
  },
}))
const lite = vi.hoisted(() => ({ level: 0 }))
vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return lite.level
  },
}))

import OverviewHud from "./OverviewHud"

// AB:OVERVIEW.TESTS:START
// Tests of the screen of the countdown and of the day of the Pro Timer on the Overview (src/components/OverviewHud.tsx, CONNECTIONS.md C60). The clock is set by the test (21 October 2026, 12:00 in Kolkata), and every answer of the database is held until the test gives it.
let root: Root | null = null
let container: HTMLElement | null = null
let visibility: "visible" | "hidden" = "visible"

const NOON_KOLKATA = "2026-10-21T06:30:00Z"

function score(over: Partial<DayScore> = {}): DayScore {
  return {
    day: "2026-10-21",
    creditedMinutes: 107.4,
    word: "ABOVE USUAL",
    usualMinutes: 80,
    usualIsStandIn: false,
    sessions: 3,
    shortSessions: 1,
    longestStretchMinutes: 58,
    countedMinutes: 120,
    countedOverElapsed: 0.9123,
    unconfirmedMinutes: 0,
    overCapMinutes: 0,
    ...over,
  }
}

async function show(): Promise<void> {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root?.render(createElement(OverviewHud))
  })
}

async function pass(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

async function answer(index: number, value: DayScore): Promise<void> {
  await act(async () => {
    api.waiting[index].resolve(value)
  })
}

async function fail(index: number): Promise<void> {
  await act(async () => {
    api.waiting[index].reject(new Error("NO_CONNECTION"))
  })
}

function text(selector: string): string {
  return container?.querySelector(selector)?.textContent ?? ""
}

function all(selector: string): string[] {
  return [...(container?.querySelectorAll(selector) ?? [])].map((el) => el.textContent ?? "")
}

function counters(attribute = "data-counter"): (string | null)[] {
  return [...(container?.querySelectorAll("[data-counter]") ?? [])].map((el) => el.getAttribute(attribute))
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] })
  vi.setSystemTime(new Date(NOON_KOLKATA))
  api.zone = "Asia/Kolkata"
  api.days = []
  api.waiting = []
  lite.level = 0
  visibility = "visible"
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => visibility })
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.useRealTimers()
})

describe("the countdown", () => {
  it("shows the days to April 14 as the digits, with the line under them", async () => {
    await show()
    expect(counters()[0]).toBe("175")
    expect(text(".ab-hud-countdown .ab-hud-caption")).toBe("days to April 14")
  })

  it("changes at midnight of the device's time zone, one minute after it at the latest", async () => {
    vi.setSystemTime(new Date("2026-10-21T18:29:30Z"))
    await show()
    expect(counters()[0]).toBe("175")
    await pass(60_000)
    expect(counters()[0]).toBe("174")
    expect(api.days).toEqual(["2026-10-21", "2026-10-22"])
  })

  it("still counts, in UTC, when the device gives no time zone, and then does not ask the database", async () => {
    api.zone = null
    await show()
    expect(counters()[0]).toBe("175")
    expect(api.days).toEqual([])
    expect(text(".ab-hud-day")).toContain("Could not read today")
  })
})

describe("the day, while it is read", () => {
  it("asks for the local day of the device, not the day of UTC", async () => {
    vi.setSystemTime(new Date("2026-10-21T19:00:00Z"))
    await show()
    expect(api.days).toEqual(["2026-10-22"])
  })

  it("says that it is reading, and shows no figure yet", async () => {
    await show()
    expect(text(".ab-hud-day")).toContain("Reading today")
    expect(container?.querySelector(".ab-hud-stats") ?? null).toBeNull()
    expect(counters()).toEqual(["175"])
  })

  it("has the title Today in Pro Timer as the name of the section", async () => {
    await show()
    expect(container?.querySelector("section.ab-hud-day")?.getAttribute("aria-label")).toBe("Today in Pro Timer")
    expect(text(".ab-hud-day-title")).toBe("Today in Pro Timer")
  })
})

describe("a day with sessions", () => {
  it("shows hours and minutes as digits, the word in sentence case and the three figures", async () => {
    await show()
    await answer(0, score())
    // The countdown, then the hours, then the minutes (107.4 minutes is 1 hour 47 minutes, with two digits for the minutes).
    expect(counters()).toEqual(["175", "1", "47"])
    expect(counters("data-min")).toEqual(["1", "1", "2"])
    expect(text(".ab-hud-word")).toBe("Above usual")
    expect(all(".ab-hud-stat")).toEqual(["Sessions3 (1 short)", "Longest stretch58m", "Focus91%"])
    expect(text(".ab-hud-day")).not.toContain("Reading today")
  })

  it("shows only the minutes under an hour, and no word in capitals", async () => {
    await show()
    await answer(0, score({ creditedMinutes: 47.2, word: "BELOW USUAL", shortSessions: 0, sessions: 1 }))
    expect(counters()).toEqual(["175", "47"])
    expect(counters("data-min")).toEqual(["1", "1"])
    expect(text(".ab-hud-word")).toBe("Below usual")
    expect(all(".ab-hud-stat")[0]).toBe("Sessions1")
  })

  it("shows a dash for the focus when it is not known, and an hour and a half as 1h 30m", async () => {
    await show()
    await answer(0, score({ countedOverElapsed: null, longestStretchMinutes: 90 }))
    expect(all(".ab-hud-stat")).toEqual(["Sessions3 (1 short)", "Longest stretch1h 30m", "Focus–"])
  })

  it("shows the minutes that wait to be confirmed next to the day", async () => {
    await show()
    await answer(0, score({ unconfirmedMinutes: 180 }))
    expect(text(".ab-hud-day")).toContain("+3h waiting to be confirmed")
  })

  it("shows no line about waiting minutes when there are none", async () => {
    await show()
    await answer(0, score())
    expect(text(".ab-hud-day")).not.toContain("waiting")
  })
})

describe("a day without a session", () => {
  it("says so, gives a link to the Pro Timer and shows no figures", async () => {
    await show()
    await answer(0, score({ creditedMinutes: 0, word: "NO SESSION", sessions: 0, shortSessions: 0, longestStretchMinutes: 0, countedMinutes: 0, countedOverElapsed: null }))
    expect(text(".ab-hud-empty")).toBe("No session yet today.")
    const link = container?.querySelector("a.ab-hud-link")
    expect(link?.getAttribute("href")).toBe("#timer")
    expect(link?.textContent).toBe("Start one")
    expect(container?.querySelector(".ab-hud-stats") ?? null).toBeNull()
    expect(counters()).toEqual(["175"])
  })

  it("still shows the minutes that wait to be confirmed", async () => {
    await show()
    await answer(0, score({ creditedMinutes: 0, word: "NO SESSION", sessions: 0, shortSessions: 0, countedOverElapsed: null, unconfirmedMinutes: 75 }))
    expect(text(".ab-hud-day")).toContain("+1h 15m waiting to be confirmed")
  })
})

describe("when the database cannot be read", () => {
  it("says so at first and shows the day at the next reading", async () => {
    await show()
    await fail(0)
    expect(text(".ab-hud-day")).toContain("Could not read today")
    await pass(60_000)
    await answer(1, score())
    expect(text(".ab-hud-day")).not.toContain("Could not read today")
    expect(text(".ab-hud-word")).toBe("Above usual")
  })

  it("keeps the day that was shown when a later reading fails", async () => {
    await show()
    await answer(0, score())
    await pass(60_000)
    await fail(1)
    expect(text(".ab-hud-word")).toBe("Above usual")
    expect(text(".ab-hud-day")).not.toContain("Could not read today")
  })
})

describe("the readings", () => {
  it("come again every minute", async () => {
    await show()
    expect(api.days.length).toBe(1)
    await pass(59_999)
    expect(api.days.length).toBe(1)
    await pass(1)
    expect(api.days.length).toBe(2)
    await pass(120_000)
    expect(api.days.length).toBe(4)
  })

  it("come again when the page comes back to the front, and not while it is hidden", async () => {
    await show()
    visibility = "hidden"
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
    })
    expect(api.days.length).toBe(1)
    visibility = "visible"
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
    })
    expect(api.days.length).toBe(2)
  })

  it("come again when the window gets focus", async () => {
    await show()
    await act(async () => {
      window.dispatchEvent(new Event("focus"))
    })
    expect(api.days.length).toBe(2)
  })

  it("never let a late answer of an older reading replace the answer of a newer one", async () => {
    await show()
    await pass(60_000)
    await answer(1, score({ creditedMinutes: 200, word: "BIG" }))
    expect(text(".ab-hud-word")).toBe("Big")
    await answer(0, score({ creditedMinutes: 10, word: "LIGHT" }))
    expect(text(".ab-hud-word")).toBe("Big")
  })

  it("stop when the screen goes away, and a late answer then does nothing", async () => {
    await show()
    act(() => root?.unmount())
    root = null
    await pass(180_000)
    expect(api.days.length).toBe(1)
    await answer(0, score())
    expect(container?.textContent).toBe("")
  })
})

describe("the motion blur of the digits", () => {
  it("is on at a laptop and off at a phone (lite level 1 or 2)", async () => {
    await show()
    await answer(0, score())
    expect(counters("data-blur")).toEqual(["true", "true", "true"])
    act(() => root?.unmount())
    container?.remove()
    lite.level = 1
    await show()
    await answer(1, score())
    expect(counters("data-blur")).toEqual(["false", "false", "false"])
  })
})
// AB:OVERVIEW.TESTS:END
