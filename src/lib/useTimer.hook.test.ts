// @vitest-environment jsdom
import { Profiler, act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The real timerApi is replaced by a fake database server, so no test ever calls the network.
// The fake server keeps the same rules as the SQL functions: the same error names, the same 60 second rule, the cut at cap_at.
const api = vi.hoisted(() => ({
  timerState: vi.fn(),
  timerDayTotal: vi.fn(),
  timerStart: vi.fn(),
  timerPause: vi.fn(),
  timerResume: vi.fn(),
  timerEnd: vi.fn(),
}))
vi.mock("@/lib/supabase", () => ({ supabase: null }))
vi.mock("@/lib/timerApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/timerApi")>()
  return { ...actual, ...api, deviceTimeZone: () => "Asia/Kolkata" }
})

import { TimerError } from "@/lib/timerApi"
import { fillSlots } from "@/lib/lineMarkup"
import { COMEBACK_BANKS, STOP_ALERT_BANKS, bankIdFor, isComebackBank } from "@/lib/stopAlertLines"
import { activeSeconds, canGoBackIn, type TimerRow } from "@/lib/timerMaths"
import { POLL_OFFLINE_MS, POLL_ONLINE_MS, problemText, useTimer, type TimerView } from "./useTimer"

// AB:TIMER.TESTS:START
// 2026-10-07 10:00:00 UTC is 15:30 on 7 October in Asia/Kolkata. Local midnight there is 18:30 UTC.
const T0 = Date.parse("2026-10-07T10:00:00Z")
const MIDNIGHT = "2026-10-07T18:30:00+00:00"

type Server = { row: TimerRow | null; saved: Record<string, number>; offsetMs: number; down: TimerError | null }
let server: Server

function serverNow(): number {
  return Date.now() + server.offsetMs
}
function iso(ms: number): string {
  return new Date(ms).toISOString().replace("Z", "+00:00")
}
function runningRow(secondsAgo: number, extra: Partial<TimerRow> = {}): TimerRow {
  return { started_at: iso(serverNow() - secondsAgo * 1000), tz: "Asia/Kolkata", status: "running", paused_at: null, paused_seconds: 0, cap_at: MIDNIGHT, ...extra }
}
function guard(): void {
  if (server.down !== null) throw server.down
}

function installFakeServer(): void {
  api.timerState.mockImplementation(async () => {
    guard()
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerDayTotal.mockImplementation(async (day: string) => {
    guard()
    return server.saved[day] ?? 0
  })
  api.timerStart.mockImplementation(async (zone: string) => {
    guard()
    if (server.row !== null) throw new TimerError("ALREADY_RUNNING")
    server.row = runningRow(0, { tz: zone })
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerPause.mockImplementation(async () => {
    guard()
    if (server.row === null || server.row.status !== "running") throw new TimerError("NOT_RUNNING")
    server.row = { ...server.row, status: "paused", paused_at: iso(serverNow()) }
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerResume.mockImplementation(async () => {
    guard()
    if (server.row === null || server.row.paused_at === null) throw new TimerError("NOT_PAUSED")
    const gone = (serverNow() - Date.parse(server.row.paused_at)) / 1000
    server.row = { ...server.row, status: "running", paused_at: null, paused_seconds: server.row.paused_seconds + gone }
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerEnd.mockImplementation(async () => {
    guard()
    if (server.row === null) throw new TimerError("NOT_RUNNING")
    const row = server.row
    const seconds = activeSeconds(row, serverNow())
    const capped = serverNow() >= Date.parse(row.cap_at)
    server.row = null
    if (seconds < 60) return { serverNowMs: serverNow(), saved: false, capped, seconds: null, day: null }
    const day = "2026-10-07"
    server.saved[day] = (server.saved[day] ?? 0) + seconds
    return { serverNowMs: serverNow(), saved: true, capped, seconds, day }
  })
}

let view: TimerView
let root: Root | null = null
let container: HTMLElement | null = null

// The number of times the screen was really drawn (committed). React may call the function one more time without drawing, so the calls are not counted.
let renders = 0
function Harness() {
  view = useTimer()
  return null
}

async function settle(ms = 0): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}
async function mount(): Promise<void> {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root?.render(
      createElement(
        Profiler,
        {
          id: "timer",
          onRender: () => {
            renders += 1
          },
        },
        createElement(Harness),
      ),
    )
    await vi.advanceTimersByTimeAsync(0)
  })
}
async function press(button: () => void): Promise<void> {
  await act(async () => {
    button()
    await vi.advanceTimersByTimeAsync(0)
  })
}
function setVisible(visible: boolean): void {
  Object.defineProperty(document, "visibilityState", { value: visible ? "visible" : "hidden", configurable: true })
}

type Call = keyof typeof api

// The next call of this function of the fake server does not answer until the test says so.
function hold(name: Call): { answer: (value: unknown) => void; fail: (error: unknown) => void } {
  let answer: (value: unknown) => void = () => {}
  let fail: (error: unknown) => void = () => {}
  api[name].mockImplementationOnce(
    () =>
      new Promise((resolve, reject) => {
        answer = resolve
        fail = reject
      }),
  )
  return { answer: (value) => answer(value), fail: (error) => fail(error) }
}

async function release(run: () => void): Promise<void> {
  await act(async () => {
    run()
    await vi.advanceTimersByTimeAsync(0)
  })
}

// The next call of this function works as usual, and after it the fake server is down: what the screen shows is then what the answer of that call said, because the reading that follows fails.
function breakAfter(name: Call): void {
  const real = api[name].getMockImplementation()
  api[name].mockImplementationOnce(async (...args: unknown[]) => {
    const reply = await real?.(...args)
    server.down = new TimerError("NO_CONNECTION")
    return reply
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers()
  vi.setSystemTime(T0)
  server = { row: null, saved: {}, offsetMs: 0, down: null }
  renders = 0
  for (const fn of Object.values(api)) fn.mockReset()
  installFakeServer()
  setVisible(true)
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.useRealTimers()
})

describe("useTimer: reading", () => {
  it("shows an idle timer with the saved total of the day when nothing runs", async () => {
    server.saved["2026-10-07"] = 5400
    await mount()
    expect(view.link).toBe("online")
    expect(view.status).toBe("idle")
    expect(view.seconds).toBe(0)
    expect(view.dayTotal).toBe(5400)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-07")
  })

  it("shows the seconds of a running session, and the day total counts the running session too", async () => {
    server.row = runningRow(100)
    server.saved["2026-10-07"] = 1000
    await mount()
    expect(view.status).toBe("running")
    expect(view.seconds).toBe(100)
    expect(view.dayTotal).toBe(1100)
    await settle(7000)
    expect(view.seconds).toBe(107)
    expect(view.dayTotal).toBe(1107)
  })

  it("works the seconds out from the stored times: a phone that slept for 10 minutes loses nothing", async () => {
    server.row = runningRow(100)
    await mount()
    vi.setSystemTime(Date.now() + 600_000)
    await settle(250)
    expect(view.seconds).toBe(700)
  })

  it("follows the clock of the server, not the clock of the device", async () => {
    server.offsetMs = 3_600_000
    server.row = runningRow(100)
    await mount()
    expect(view.seconds).toBe(100)
    await settle(5000)
    expect(view.seconds).toBe(105)
  })

  it("shows a paused session with frozen seconds", async () => {
    server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow() - 40_000), paused_seconds: 10 })
    await mount()
    expect(view.status).toBe("paused")
    expect(view.seconds).toBe(50)
    await settle(20_000)
    expect(view.seconds).toBe(50)
  })

  it("uses the ring seed of the running session, and an empty seed when nothing runs", async () => {
    await mount()
    expect(view.ringSeed).toBe("")
    server.row = runningRow(10)
    await press(view.retry)
    expect(view.ringSeed).toBe(server.row.started_at)
  })
})

describe("useTimer: the buttons", () => {
  it("Start sends the time zone of the device and shows a running session", async () => {
    await mount()
    await press(view.start)
    expect(api.timerStart).toHaveBeenCalledWith("Asia/Kolkata")
    expect(view.status).toBe("running")
    expect(view.busy).toBe(false)
    await settle(3000)
    expect(view.seconds).toBe(3)
  })

  it("Pause freezes the seconds and Resume lets them run again", async () => {
    server.row = runningRow(100)
    await mount()
    await press(view.pause)
    expect(view.status).toBe("paused")
    const frozen = view.seconds
    await settle(10_000)
    expect(view.seconds).toBe(frozen)
    await press(view.resume)
    expect(view.status).toBe("running")
    await settle(5000)
    expect(view.seconds).toBe(frozen + 5)
  })

  it("End saves a session of 60 seconds or more: a notice, the day total grows, back to idle", async () => {
    server.row = runningRow(125)
    server.saved["2026-10-07"] = 1000
    await mount()
    await press(view.end)
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: true, capped: false, seconds: 125 })
    expect(view.dayTotal).toBe(1125)
  })

  it("End of a session under 60 seconds is not saved: the notice says so and the total stays", async () => {
    server.row = runningRow(30)
    server.saved["2026-10-07"] = 1000
    await mount()
    await press(view.end)
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: false, capped: false, seconds: null })
    expect(view.dayTotal).toBe(1000)
  })

  it("a new Start clears the notice of the session that was ended before", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.end)
    expect(view.notice).not.toBeNull()
    await press(view.start)
    expect(view.notice).toBeNull()
  })

  it("a button pressed twice in a row sends one call", async () => {
    await mount()
    let release: () => void = () => {}
    api.timerStart.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => {
            server.row = runningRow(0)
            resolve({ serverNowMs: serverNow(), row: server.row })
          }
        }),
    )
    await act(async () => {
      view.start()
      view.start()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.busy).toBe(true)
    await act(async () => {
      release()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerStart).toHaveBeenCalledTimes(1)
    expect(view.busy).toBe(false)
    expect(view.status).toBe("running")
  })
})

describe("useTimer: the state changed on another device", () => {
  it("Start finds a session already running: the screen reads again and shows it, with no error text", async () => {
    await mount()
    server.row = runningRow(40)
    await press(view.start)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.status).toBe("running")
    expect(view.seconds).toBe(40)
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
  })

  it("Pause finds nothing running: the screen reads again and shows idle", async () => {
    server.row = runningRow(100)
    await mount()
    server.row = null
    await press(view.pause)
    expect(view.status).toBe("idle")
    expect(view.link).toBe("online")
  })

  it("Resume finds the session not paused: the screen reads again and shows running", async () => {
    server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow() - 5000) })
    await mount()
    server.row = runningRow(100)
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(view.link).toBe("online")
  })

  it("an old slow answer does not overwrite a newer state", async () => {
    await mount()
    let late: () => void = () => {}
    api.timerState.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          late = () => resolve({ serverNowMs: serverNow(), row: null })
        }),
    )
    await press(view.retry)
    await press(view.start)
    expect(view.status).toBe("running")
    await act(async () => {
      late()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.status).toBe("running")
  })
})

describe("useTimer: no connection and problems", () => {
  it("without a connection the link is offline and every button does nothing", async () => {
    server.down = new TimerError("NO_CONNECTION")
    await mount()
    expect(view.link).toBe("offline")
    await press(view.start)
    expect(api.timerStart).not.toHaveBeenCalled()
  })

  it("while offline it tries again after 3 seconds (not before) and recovers when the connection is back", async () => {
    server.down = new TimerError("NO_CONNECTION")
    await mount()
    expect(api.timerState).toHaveBeenCalledTimes(1)
    await settle(POLL_OFFLINE_MS - 1000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    await settle(1000)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.link).toBe("offline")
    server.down = null
    await settle(POLL_OFFLINE_MS)
    expect(view.link).toBe("online")
  })

  it("the browser saying offline switches the screen to offline at once, and online reads again", async () => {
    await mount()
    expect(view.link).toBe("online")
    await act(async () => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(view.link).toBe("offline")
    await act(async () => {
      window.dispatchEvent(new Event("online"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.link).toBe("online")
  })

  it("a session that was running stays on the screen while the connection is lost", async () => {
    server.row = runningRow(100)
    await mount()
    server.down = new TimerError("NO_CONNECTION")
    await settle(POLL_ONLINE_MS)
    expect(view.link).toBe("offline")
    expect(view.status).toBe("running")
    expect(view.seconds).toBeGreaterThanOrEqual(130)
  })

  it("a problem the app cannot fix shows its text, and Try again reads again", async () => {
    server.down = new TimerError("BAD_REPLY")
    await mount()
    expect(view.link).toBe("problem")
    expect(view.problem).toBe(problemText("BAD_REPLY"))
    server.down = null
    await press(view.retry)
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
  })

  it("a failed button shows the problem text and keeps the screen as it was", async () => {
    server.row = runningRow(100)
    await mount()
    server.down = new TimerError("UNKNOWN")
    await press(view.pause)
    expect(view.link).toBe("problem")
    expect(view.problem).toBe(problemText("UNKNOWN"))
    expect(view.status).toBe("running")
    expect(view.busy).toBe(false)
  })
})

describe("useTimer: reading again", () => {
  it("online it reads again every 30 seconds (not before)", async () => {
    await mount()
    await settle(POLL_ONLINE_MS - 1000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    await settle(1000)
    expect(api.timerState).toHaveBeenCalledTimes(2)
  })

  it("a page that is hidden does not read, and reads again when it comes back", async () => {
    await mount()
    setVisible(false)
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    setVisible(true)
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerState).toHaveBeenCalledTimes(2)
  })

  it("a page that turns hidden does not read (the event of the change is not a reason by itself)", async () => {
    await mount()
    setVisible(false)
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("the browser saying offline does not hide a problem the screen is showing", async () => {
    server.down = new TimerError("BAD_REPLY")
    await mount()
    expect(view.link).toBe("problem")
    await act(async () => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(view.link).toBe("problem")
    expect(view.problem).toBe(problemText("BAD_REPLY"))
  })

  it("while a button is working the screen does not read again on its own", async () => {
    await mount()
    hold("timerStart")
    await press(view.start)
    expect(view.busy).toBe(true)
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("while the first reading has no answer yet the screen does not start a second one", async () => {
    hold("timerState")
    await mount()
    expect(view.link).toBe("loading")
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("a page restored from the back button (pageshow) reads again", async () => {
    await mount()
    await act(async () => {
      window.dispatchEvent(new Event("pageshow"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerState).toHaveBeenCalledTimes(2)
  })

  it("a change made on another device appears with the next read", async () => {
    await mount()
    expect(view.status).toBe("idle")
    server.row = runningRow(20)
    await settle(POLL_ONLINE_MS)
    expect(view.status).toBe("running")
  })
})

describe("useTimer: midnight", () => {
  it("a session still running at local midnight is ended once, and the notice says the day ended", async () => {
    server.row = runningRow(100, { cap_at: iso(T0 + 5000) })
    await mount()
    expect(api.timerEnd).not.toHaveBeenCalled()
    await settle(6000)
    expect(api.timerEnd).toHaveBeenCalledTimes(1)
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: true, capped: true, seconds: 105 })
  })

  it("a new day that begins while nothing runs reads the day total of the new day", async () => {
    vi.setSystemTime(Date.parse("2026-10-07T18:29:50Z"))
    server.saved["2026-10-07"] = 3000
    server.saved["2026-10-08"] = 0
    await mount()
    expect(view.dayTotal).toBe(3000)
    await settle(15_000)
    expect(api.timerDayTotal).toHaveBeenLastCalledWith("2026-10-08")
    expect(view.dayTotal).toBe(0)
  })
})

describe("useTimer: the new day while nothing runs", () => {
  it("reads the new day only once when the server still says it is the old day (no loop)", async () => {
    // 1 second before local midnight. The next reading says the server is 0.5 seconds behind: less than 1.5 seconds, so the old time base is kept
    // and the screen believes it is the new day while the reading still holds the old day.
    vi.setSystemTime(Date.parse("2026-10-07T18:29:59Z"))
    server.saved["2026-10-07"] = 3000
    server.saved["2026-10-08"] = 0
    await mount()
    expect(view.dayTotal).toBe(3000)
    server.offsetMs = -500
    const real = api.timerState.getMockImplementation()
    let calls = 0
    api.timerState.mockImplementation(async (...args: unknown[]) => {
      calls += 1
      // A safety stop for the test itself: a screen that reads without end is stopped by a failing server.
      if (calls > 30) server.down = new TimerError("UNKNOWN")
      return real?.(...args)
    })
    // Small steps, each in its own act, so that the screen is drawn at the moment of midnight and not after it.
    for (let step = 0; step < 20; step += 1) await settle(250)
    expect(calls).toBe(1)
    expect(view.link).toBe("online")
  })

  it("with no connection the new day is not read at once: only the retry every 3 seconds reads", async () => {
    vi.setSystemTime(Date.parse("2026-10-07T18:29:50Z"))
    server.saved["2026-10-07"] = 3000
    server.saved["2026-10-08"] = 700
    await mount()
    server.down = new TimerError("NO_CONNECTION")
    await act(async () => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(view.link).toBe("offline")
    const before = api.timerState.mock.calls.length
    // Midnight comes after 10 seconds. The retries are at 3, 6 and 9 seconds. An extra read at midnight would be a fourth call.
    await settle(10_500)
    expect(api.timerState.mock.calls.length - before).toBe(3)
    server.down = null
    await act(async () => {
      window.dispatchEvent(new Event("online"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.link).toBe("online")
    expect(api.timerDayTotal).toHaveBeenLastCalledWith("2026-10-08")
    expect(view.dayTotal).toBe(700)
  })
})

describe("useTimer: leaving the screen", () => {
  it("after the screen is closed nothing is read any more", async () => {
    await mount()
    act(() => root?.unmount())
    root = null
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("an answer that arrives after the screen was closed does no harm", async () => {
    let late: () => void = () => {}
    api.timerState.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          late = () => resolve({ serverNowMs: serverNow(), row: null })
        }),
    )
    await mount()
    // The day total is asked for together with the state (see "both reads at once"), so there is exactly one call before the screen is closed, and none after it.
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
    act(() => root?.unmount())
    root = null
    await act(async () => {
      late()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
  })
})
describe("useTimer: answers that come too late", () => {
  it("an old slow answer of the state is dropped before it asks for the day total, and does not overwrite a newer reading", async () => {
    await mount()
    const old = hold("timerState")
    await press(view.retry)
    server.row = runningRow(40)
    await press(view.retry)
    expect(view.status).toBe("running")
    const dayTotalCalls = api.timerDayTotal.mock.calls.length
    await release(() => old.answer({ serverNowMs: serverNow(), row: null }))
    expect(view.status).toBe("running")
    expect(api.timerDayTotal.mock.calls.length).toBe(dayTotalCalls)
  })

  it("an old slow answer of the day total does not overwrite a newer reading", async () => {
    await mount()
    const old = hold("timerDayTotal")
    await press(view.retry)
    server.saved["2026-10-07"] = 2000
    await press(view.retry)
    expect(view.dayTotal).toBe(2000)
    await release(() => old.answer(5))
    expect(view.dayTotal).toBe(2000)
  })

  it("an old slow failure does not hide a newer reading", async () => {
    await mount()
    const old = hold("timerState")
    await press(view.retry)
    await press(view.retry)
    expect(view.link).toBe("online")
    await release(() => old.fail(new TimerError("NO_CONNECTION")))
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
  })

  it("a reading asked for before a button was pressed does not change the screen while the button works", async () => {
    server.row = runningRow(100)
    await mount()
    const old = hold("timerState")
    await press(view.retry)
    const pause = hold("timerPause")
    await press(view.pause)
    expect(view.busy).toBe(true)
    await release(() => old.answer({ serverNowMs: serverNow(), row: null }))
    expect(view.status).toBe("running")
    await release(() => {
      server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow()) })
      pause.answer({ serverNowMs: serverNow(), row: server.row })
    })
    expect(view.status).toBe("paused")
  })
})

describe("useTimer: what a button does with its answer", () => {
  it("after a button worked, the state and the day total are read again", async () => {
    await mount()
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
    await press(view.start)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(api.timerDayTotal).toHaveBeenCalledTimes(2)
  })

  it.each(["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED"] as const)(
    "%s means that the state changed: the screen reads again, shows what is true, and shows no problem",
    async (kind) => {
      server.row = runningRow(100)
      await mount()
      api.timerPause.mockImplementationOnce(async () => {
        throw new TimerError(kind)
      })
      server.row = null
      await press(view.pause)
      expect(api.timerState).toHaveBeenCalledTimes(2)
      expect(view.status).toBe("idle")
      expect(view.link).toBe("online")
      expect(view.problem).toBe("")
    },
  )

  it.each(["NOT_SIGNED_IN", "BAD_TIMEZONE", "BAD_REPLY", "NOT_READY", "UNKNOWN"] as const)(
    "%s is a problem of its own: its text is shown, nothing is read again, the screen stays as it was",
    async (kind) => {
      server.row = runningRow(100)
      await mount()
      api.timerPause.mockImplementationOnce(async () => {
        throw new TimerError(kind)
      })
      await press(view.pause)
      expect(api.timerState).toHaveBeenCalledTimes(1)
      expect(view.link).toBe("problem")
      expect(view.problem).toBe(problemText(kind))
      expect(view.status).toBe("running")
      expect(view.busy).toBe(false)
    },
  )

  it("a button that finds no connection switches the screen to offline and reads nothing again at once", async () => {
    server.row = runningRow(100)
    await mount()
    api.timerPause.mockImplementationOnce(async () => {
      throw new TimerError("NO_CONNECTION")
    })
    await press(view.pause)
    expect(view.link).toBe("offline")
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(view.status).toBe("running")
  })

  it("End puts the day total of its own answer on the screen, also when the reading that follows fails", async () => {
    server.row = runningRow(125)
    server.saved["2026-10-07"] = 1000
    await mount()
    breakAfter("timerEnd")
    await press(view.end)
    expect(view.link).toBe("offline")
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: true, capped: false, seconds: 125 })
    expect(view.dayTotal).toBe(1125)
  })

  it("End of a session under 60 seconds takes the running seconds out of the day total, also when the reading that follows fails", async () => {
    server.row = runningRow(30)
    server.saved["2026-10-07"] = 1000
    await mount()
    expect(view.dayTotal).toBe(1030)
    breakAfter("timerEnd")
    await press(view.end)
    expect(view.status).toBe("idle")
    expect(view.dayTotal).toBe(1000)
  })

  it.each([
    ["start", 1000],
    ["pause", 1100],
    ["resume", 1080],
  ] as const)("%s keeps the saved total of the day, also when the reading that follows fails", async (name, total) => {
    if (name === "pause") server.row = runningRow(100)
    if (name === "resume") server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow() - 20_000) })
    server.saved["2026-10-07"] = 1000
    await mount()
    breakAfter(name === "start" ? "timerStart" : name === "pause" ? "timerPause" : "timerResume")
    await press(name === "start" ? view.start : name === "pause" ? view.pause : view.resume)
    expect(view.link).toBe("offline")
    expect(view.dayTotal).toBe(total)
  })
})

describe("useTimer: the clock", () => {
  it("puts the server time of an answer in the middle of the call that fetched it", async () => {
    const row = runningRow(100)
    api.timerState.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 4000))
      return { serverNowMs: T0 + 2000, row }
    })
    await mount()
    await settle(4000)
    expect(view.status).toBe("running")
    expect(view.seconds).toBe(104)
  })

  it("a new reading of the server time that differs by less than 1.5 seconds does not move the seconds", async () => {
    server.row = runningRow(100)
    await mount()
    expect(view.seconds).toBe(100)
    server.offsetMs = 1499
    await settle(POLL_ONLINE_MS)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.seconds).toBe(130)
  })

  it("a new reading of the server time that differs by 1.5 seconds or more replaces the old one", async () => {
    server.row = runningRow(100)
    await mount()
    server.offsetMs = 1500
    await settle(POLL_ONLINE_MS)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.seconds).toBe(131)
  })

  it("draws the screen once per second, not at every look of the clock", async () => {
    server.row = runningRow(100)
    await mount()
    const before = renders
    // One look of the clock per step, each step in its own act, so that React cannot join the drawings of several looks into one.
    for (let step = 0; step < 40; step += 1) await settle(250)
    // 10 seconds: one drawing per second, and React adds one more that changes nothing. A clock that draws at every look would give 40.
    expect(renders - before).toBeGreaterThanOrEqual(9)
    expect(renders - before).toBeLessThanOrEqual(24)
  })

  it("stops all its timers when the screen is closed", async () => {
    await mount()
    act(() => root?.unmount())
    root = null
    expect(vi.getTimerCount()).toBe(0)
  })
})

// The lines a stop alert may show for a session of this length: the lines of its bank with the numbers filled in.
function linesFor(seconds: number): string[] {
  return STOP_ALERT_BANKS[bankIdFor(seconds)].map((line) => fillSlots(line, seconds))
}

describe("useTimer: the stop alert", () => {
  it("Stop on a running session pauses it and opens the alert with a line for the seconds it stopped at; it does not end the session", async () => {
    server.row = runningRow(125)
    await mount()
    expect(view.stopAlert).toBeNull()
    await press(view.stop)
    expect(api.timerPause).toHaveBeenCalledTimes(1)
    expect(api.timerEnd).not.toHaveBeenCalled()
    expect(view.status).toBe("paused")
    expect(view.seconds).toBe(125)
    expect(view.stopAlert).not.toBeNull()
    expect(linesFor(125)).toContain(view.stopAlert?.line)
    expect(view.stopAlert?.line).not.toMatch(/[{}]/)
  })

  it("picks the line from the bank of the seconds the session stopped at, for every length", async () => {
    for (const seconds of [30, 100, 400, 700, 1300, 1900, 2800, 5500]) {
      server.row = runningRow(seconds)
      await mount()
      await press(view.stop)
      expect(linesFor(seconds)).toContain(view.stopAlert?.line)
      act(() => root?.unmount())
      container?.remove()
      server.row = null
      renders = 0
    }
  })

  it("offers GO BACK IN only for a session shorter than 45 minutes (the same rule as canGoBackIn)", async () => {
    for (const seconds of [100, 2699, 2700, 3000]) {
      server.row = runningRow(seconds)
      await mount()
      await press(view.stop)
      expect(view.stopAlert?.canGoBack).toBe(canGoBackIn(seconds))
      act(() => root?.unmount())
      container?.remove()
      server.row = null
    }
    expect(canGoBackIn(2699)).toBe(true)
    expect(canGoBackIn(2700)).toBe(false)
  })

  it("the time spent on the alert is never counted: I'M DONE saves the seconds of the moment it stopped", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await settle(40_000)
    expect(view.stopAlert).not.toBeNull()
    expect(view.seconds).toBe(125)
    await press(view.end)
    expect(api.timerEnd).toHaveBeenCalledTimes(1)
    expect(view.stopAlert).toBeNull()
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: true, capped: false, seconds: 125 })
  })

  it("I'M DONE under 60 seconds is not saved, and the notice says so", async () => {
    server.row = runningRow(30)
    await mount()
    await press(view.stop)
    await press(view.end)
    expect(view.notice).toEqual({ saved: false, capped: false, seconds: null })
    expect(view.stopAlert).toBeNull()
  })

  it("GO BACK IN closes the alert and leaves the session paused (no call to the database); Resume then goes on from where it stopped, and the time on the alert is not counted", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await settle(20_000)
    await press(view.goBack)
    expect(api.timerResume).not.toHaveBeenCalled()
    expect(view.stopAlert).toBeNull()
    expect(view.status).toBe("paused")
    expect(view.seconds).toBe(125)
    await settle(5000)
    expect(view.status).toBe("paused")
    expect(view.seconds).toBe(125)
    await press(view.resume)
    expect(api.timerResume).toHaveBeenCalledTimes(1)
    expect(view.status).toBe("running")
    expect(view.seconds).toBe(125)
    await settle(5000)
    expect(view.seconds).toBe(130)
  })

  it("a session that was already paused: Stop opens the alert without a call, and GO BACK IN leaves it paused as it was", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.pause)
    api.timerPause.mockClear()
    await press(view.stop)
    expect(api.timerPause).not.toHaveBeenCalled()
    expect(view.stopAlert).not.toBeNull()
    expect(linesFor(125)).toContain(view.stopAlert?.line)
    await press(view.goBack)
    expect(api.timerResume).not.toHaveBeenCalled()
    expect(view.stopAlert).toBeNull()
    expect(view.status).toBe("paused")
    expect(view.seconds).toBe(125)
  })

  it("I'M DONE ends a session that was paused before the alert, with its frozen seconds", async () => {
    server.row = runningRow(300)
    await mount()
    await press(view.pause)
    await settle(60_000)
    await press(view.stop)
    await press(view.end)
    expect(view.notice).toEqual({ saved: true, capped: false, seconds: 300 })
  })

  it("keeps the alert through the reading that comes every 30 seconds", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    const line = view.stopAlert?.line
    await settle(POLL_ONLINE_MS + 1000)
    expect(api.timerState.mock.calls.length).toBeGreaterThan(2)
    expect(view.stopAlert?.line).toBe(line)
  })

  it("no line comes twice before all lines of the bank were shown (the queue lives on between alerts)", async () => {
    server.row = runningRow(125)
    await mount()
    const size = STOP_ALERT_BANKS[bankIdFor(125)].length
    const shown: string[] = []
    for (let i = 0; i < size; i++) {
      await press(view.stop)
      shown.push(view.stopAlert?.line ?? "")
      await press(view.goBack)
    }
    expect(new Set(shown).size).toBe(size)
  })

  it("a button pressed twice in a row sends one pause", async () => {
    server.row = runningRow(125)
    await mount()
    const pending = hold("timerPause")
    await act(async () => {
      view.stop()
      view.stop()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerPause).toHaveBeenCalledTimes(1)
    server.row = { ...runningRow(125), status: "paused", paused_at: iso(serverNow()) }
    await release(() => pending.answer({ serverNowMs: serverNow(), row: server.row }))
    expect(view.stopAlert).not.toBeNull()
  })

  it("a Stop that finds the session paused on another device reads again and opens no alert", async () => {
    server.row = runningRow(125)
    await mount()
    server.row = { ...runningRow(125), status: "paused", paused_at: iso(serverNow()) }
    await press(view.stop)
    expect(view.stopAlert).toBeNull()
    expect(view.status).toBe("paused")
    expect(view.problem).toBe("")
  })

  it("without a connection Stop does nothing", async () => {
    server.row = runningRow(125)
    await mount()
    server.down = new TimerError("NO_CONNECTION")
    await settle(POLL_ONLINE_MS)
    expect(view.link).toBe("offline")
    api.timerPause.mockClear()
    await press(view.stop)
    expect(api.timerPause).not.toHaveBeenCalled()
    expect(view.stopAlert).toBeNull()
  })

  it("a failed pause shows the problem text and opens no alert", async () => {
    server.row = runningRow(125)
    await mount()
    api.timerPause.mockImplementationOnce(async () => {
      throw new TimerError("UNKNOWN")
    })
    await press(view.stop)
    expect(view.stopAlert).toBeNull()
    expect(view.link).toBe("problem")
  })

  it("the alert closes when the session was ended on another device", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    server.row = null
    await settle(POLL_ONLINE_MS + 1000)
    expect(view.status).toBe("idle")
    expect(view.stopAlert).toBeNull()
  })

  it("the alert closes when the session was resumed on another device, and does not come back when it is paused again", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    server.row = { ...runningRow(125), status: "running", paused_at: null }
    await settle(POLL_ONLINE_MS + 1000)
    expect(view.status).toBe("running")
    expect(view.stopAlert).toBeNull()
    await press(view.pause)
    expect(view.status).toBe("paused")
    expect(view.stopAlert).toBeNull()
  })

  it("midnight while the alert is open: the session is ended once, the notice says the day ended, and the alert is gone", async () => {
    server.row = runningRow(100, { cap_at: iso(T0 + 20_000) })
    await mount()
    await press(view.stop)
    expect(view.stopAlert).not.toBeNull()
    await settle(25_000)
    expect(api.timerEnd).toHaveBeenCalledTimes(1)
    expect(view.status).toBe("idle")
    expect(view.stopAlert).toBeNull()
    expect(view.notice).toEqual({ saved: true, capped: true, seconds: 100 })
  })

  it("GO BACK IN does nothing when there is no alert", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.goBack)
    expect(api.timerResume).not.toHaveBeenCalled()
    expect(view.status).toBe("running")
  })
})

describe("useTimer: both reads at once", () => {
  it("asks for the day total before the state has answered, so that the two waits are not in a row", async () => {
    const state = hold("timerState")
    await mount()
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
    expect(view.link).toBe("loading")
    await release(() => state.answer({ serverNowMs: serverNow(), row: null }))
    expect(view.link).toBe("online")
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
  })

  it("asks for the state first and the day total second, so that the time of the server is not delayed", async () => {
    await mount()
    const stateOrder = api.timerState.mock.invocationCallOrder[0]
    const dayOrder = api.timerDayTotal.mock.invocationCallOrder[0]
    expect(stateOrder).toBeLessThan(dayOrder)
  })

  it("asks once per reading when the day of the device is the day of the server (the usual case)", async () => {
    server.saved["2026-10-07"] = 4200
    await mount()
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-07")
    expect(view.dayTotal).toBe(4200)
    await press(view.retry)
    expect(api.timerDayTotal).toHaveBeenCalledTimes(2)
  })

  it("asks again for the right day when the running session has another time zone, and uses only the right answer", async () => {
    // 20:00 UTC is 01:30 on 8 October in Asia/Kolkata (the zone of this device) but still 16:00 on 7 October in New York.
    vi.setSystemTime(Date.parse("2026-10-07T20:00:00Z"))
    server.row = runningRow(100, { tz: "America/New_York", cap_at: "2026-10-08T04:00:00+00:00" })
    server.saved["2026-10-08"] = 999_999
    server.saved["2026-10-07"] = 2000
    await mount()
    expect(api.timerDayTotal.mock.calls.map((c) => c[0])).toEqual(["2026-10-08", "2026-10-07"])
    expect(view.dayTotal).toBe(2100)
  })

  it("asks again for the right day when the clock of the device is a day ahead of the server", async () => {
    server.offsetMs = -86_400_000
    server.saved["2026-10-07"] = 3000
    server.saved["2026-10-06"] = 1500
    await mount()
    expect(api.timerDayTotal.mock.calls.map((c) => c[0])).toEqual(["2026-10-07", "2026-10-06"])
    expect(view.dayTotal).toBe(1500)
  })

  it("a failed state shows the failure, and the day total that fails with it leaves no unhandled error", async () => {
    server.down = new TimerError("NO_CONNECTION")
    await mount()
    expect(view.link).toBe("offline")
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
  })

  it("a state that answers while the day total fails shows the failure, as it did when they were asked one after the other", async () => {
    api.timerDayTotal.mockImplementationOnce(async () => {
      throw new TimerError("NO_CONNECTION")
    })
    await mount()
    expect(view.link).toBe("offline")
    server.down = null
    await settle(POLL_OFFLINE_MS)
    expect(view.link).toBe("online")
  })

  it("a day total that answers after a newer reading was made does not overwrite it", async () => {
    await mount()
    const old = hold("timerDayTotal")
    await press(view.retry)
    server.saved["2026-10-07"] = 2000
    await press(view.retry)
    expect(view.dayTotal).toBe(2000)
    await release(() => old.answer(5))
    expect(view.dayTotal).toBe(2000)
  })
})

describe("useTimer: the comeback message", () => {
  // The comeback lines of the bank of this length, with their slots filled (the marks are still in them, as the screen gets them).
  function comebackLinesFor(seconds: number): string[] {
    const bank = bankIdFor(seconds)
    if (!isComebackBank(bank)) throw new Error("no comeback bank for " + seconds)
    return COMEBACK_BANKS[bank].map((line) => fillSlots(line, seconds))
  }

  it("there is none before GO BACK IN: not while the session runs and not while the alert is open", async () => {
    server.row = runningRow(125)
    await mount()
    expect(view.comeback).toBeNull()
    await press(view.stop)
    expect(view.stopAlert).not.toBeNull()
    expect(view.comeback).toBeNull()
  })

  it("GO BACK IN gives no message yet and the session stays paused; the Resume that follows shows one comeback line for the seconds it stopped at, and the session runs", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await settle(20_000)
    await press(view.goBack)
    expect(view.status).toBe("paused")
    expect(view.stopAlert).toBeNull()
    expect(view.comeback).toBeNull()
    expect(api.timerResume).not.toHaveBeenCalled()
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(comebackLinesFor(125)).toContain(view.comeback?.line)
    expect(view.comeback?.line).not.toMatch(/[{}]/)
  })

  it("picks the line from the comeback bank of the seconds the session stopped at, for every length that can go back in", async () => {
    for (const seconds of [30, 100, 400, 700, 1300, 1900, 2600]) {
      server.row = runningRow(seconds)
      await mount()
      await press(view.stop)
      await press(view.goBack)
      await press(view.resume)
      expect(comebackLinesFor(seconds)).toContain(view.comeback?.line)
      act(() => root?.unmount())
      container?.remove()
      server.row = null
    }
  })

  it("the comeback line has the minutes of the session as they were when it stopped, not as they are after the break", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await settle(300_000)
    await press(view.goBack)
    await settle(300_000)
    await press(view.resume)
    expect(comebackLinesFor(125)).toContain(view.comeback?.line)
    expect(view.seconds).toBe(125)
  })

  it("a session that was already paused before the hold also gets the comeback message, when it is resumed after GO BACK IN", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.pause)
    await press(view.stop)
    await press(view.goBack)
    expect(api.timerResume).not.toHaveBeenCalled()
    expect(view.status).toBe("paused")
    expect(view.comeback).toBeNull()
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(comebackLinesFor(125)).toContain(view.comeback?.line)
  })

  it("a plain Pause and Resume, with no hold and no GO BACK IN, gives no comeback message", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.pause)
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(view.comeback).toBeNull()
  })

  it("only the first Resume after GO BACK IN gets the message: a later Pause and Resume gets none", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    await press(view.resume)
    expect(view.comeback).not.toBeNull()
    await press(view.clearComeback)
    await press(view.pause)
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(view.comeback).toBeNull()
  })

  it("I'M DONE gives no comeback message", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.end)
    expect(view.comeback).toBeNull()
  })

  it("a failed resume gives no comeback message", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    api.timerResume.mockImplementationOnce(async () => {
      throw new TimerError("UNKNOWN")
    })
    await press(view.resume)
    expect(view.link).toBe("problem")
    expect(view.comeback).toBeNull()
  })

  it("stays through the reading that comes every 30 seconds, as long as the session runs", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    await press(view.resume)
    const line = view.comeback?.line
    await settle(POLL_ONLINE_MS + 1000)
    expect(api.timerState.mock.calls.length).toBeGreaterThan(2)
    expect(view.comeback?.line).toBe(line)
  })

  it("clearComeback takes it away, a second call changes nothing, and the function stays the same one while the screen is drawn again and again", async () => {
    server.row = runningRow(125)
    await mount()
    const first = view.clearComeback
    await press(view.stop)
    await press(view.goBack)
    await press(view.resume)
    expect(view.comeback).not.toBeNull()
    await settle(5000)
    expect(view.clearComeback).toBe(first)
    await press(view.clearComeback)
    expect(view.comeback).toBeNull()
    await press(view.clearComeback)
    expect(view.comeback).toBeNull()
    expect(view.status).toBe("running")
  })

  it("is gone when the session is paused again, and does not come back when it runs again", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    await press(view.resume)
    expect(view.comeback).not.toBeNull()
    await press(view.pause)
    expect(view.comeback).toBeNull()
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(view.comeback).toBeNull()
  })

  it("Hold to end session used again after GO BACK IN starts over: the new alert has no comeback behind it, and its own GO BACK IN and Resume give one line", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    await press(view.resume)
    expect(view.comeback).not.toBeNull()
    await press(view.stop)
    expect(view.stopAlert).not.toBeNull()
    expect(view.comeback).toBeNull()
    await press(view.goBack)
    expect(view.status).toBe("paused")
    expect(view.comeback).toBeNull()
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(comebackLinesFor(125)).toContain(view.comeback?.line)
  })

  it("Hold to end session used again BEFORE Resume replaces what GO BACK IN left behind: still only one comeback line, for the Resume after the last GO BACK IN", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    await press(view.stop)
    expect(view.stopAlert).not.toBeNull()
    await press(view.goBack)
    await press(view.resume)
    expect(comebackLinesFor(125)).toContain(view.comeback?.line)
  })

  it("is gone when the session is ended on another device, and a new session does not bring it back", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    await press(view.resume)
    expect(view.comeback).not.toBeNull()
    server.row = null
    await settle(POLL_ONLINE_MS + 1000)
    expect(view.status).toBe("idle")
    expect(view.comeback).toBeNull()
    await press(view.start)
    expect(view.status).toBe("running")
    expect(view.comeback).toBeNull()
  })

  it("is gone when the session is paused on another device", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    await press(view.resume)
    server.row = { ...runningRow(125), status: "paused", paused_at: iso(serverNow()) }
    await settle(POLL_ONLINE_MS + 1000)
    expect(view.status).toBe("paused")
    expect(view.comeback).toBeNull()
  })

  it("what GO BACK IN left behind is forgotten when the session is resumed on another device: a later Pause and Resume here gets no message", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    server.row = runningRow(125)
    await settle(POLL_ONLINE_MS + 1000)
    expect(view.status).toBe("running")
    expect(view.comeback).toBeNull()
    await press(view.pause)
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(view.comeback).toBeNull()
  })

  it("what GO BACK IN left behind is forgotten when the session is ended on another device: the next session gets no message from it", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.stop)
    await press(view.goBack)
    server.row = null
    await settle(POLL_ONLINE_MS + 1000)
    expect(view.status).toBe("idle")
    await press(view.start)
    await press(view.pause)
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(view.comeback).toBeNull()
  })

  it("no comeback line comes twice before all lines of the bank were shown (the queue lives on between alerts)", async () => {
    server.row = runningRow(125)
    await mount()
    const size = comebackLinesFor(125).length
    const shown: string[] = []
    for (let i = 0; i < size; i++) {
      await press(view.stop)
      await press(view.goBack)
      await press(view.resume)
      shown.push(view.comeback?.line ?? "")
    }
    expect(new Set(shown).size).toBe(size)
  })
})

describe("useTimer: the time zone of the session", () => {
  it("the day total is read for the day in the time zone of the running session, not of the device", async () => {
    // 20:00 UTC is 16:00 on 7 October in New York, and already 01:30 on 8 October in Asia/Kolkata (the zone of this device).
    vi.setSystemTime(Date.parse("2026-10-07T20:00:00Z"))
    server.row = runningRow(100, { tz: "America/New_York", cap_at: "2026-10-08T04:00:00+00:00" })
    await mount()
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-07")
  })

  it("with nothing running the day is the day of the device", async () => {
    vi.setSystemTime(Date.parse("2026-10-07T20:00:00Z"))
    await mount()
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-08")
  })
})
// AB:TIMER.TESTS:END
