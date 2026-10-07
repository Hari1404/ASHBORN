import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import schemaSql from "../../supabase/timer_schema.sql?raw"

// The database client is replaced by a fake one, so no test ever calls the network.
const holder = vi.hoisted(() => ({ client: null as null | { rpc: (...args: unknown[]) => unknown } }))
vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return holder.client
  },
}))

import {
  DATABASE_ERRORS,
  REQUEST_TIMEOUT_MS,
  TimerError,
  classifyError,
  deviceTimeZone,
  isOnline,
  readDayTotal,
  readEndReply,
  readRunningReply,
  readStateReply,
  readTimerRow,
  timerDayTotal,
  timerEnd,
  timerPause,
  timerResume,
  timerStart,
  timerState,
  type TimerErrorKind,
} from "./timerApi"

// AB:TIMER.TESTS:START
function kindOf(run: () => unknown): TimerErrorKind | "no error" {
  try {
    run()
  } catch (error) {
    return error instanceof TimerError ? error.kind : "UNKNOWN"
  }
  return "no error"
}

async function kindOfAsync(run: () => Promise<unknown>): Promise<TimerErrorKind | "no error"> {
  try {
    await run()
  } catch (error) {
    return error instanceof TimerError ? error.kind : "UNKNOWN"
  }
  return "no error"
}

const RUNNING = {
  started_at: "2026-10-06T09:30:00.123456+00:00",
  tz: "Asia/Kolkata",
  status: "running",
  paused_at: null,
  paused_seconds: 0,
  cap_at: "2026-10-06T18:30:00+00:00",
}

const PAUSED = { ...RUNNING, status: "paused", paused_at: "2026-10-06T09:40:00+00:00", paused_seconds: 12.345678 }

const SERVER_NOW = "2026-10-06T10:00:00.500000+00:00"
const SERVER_NOW_MS = Date.parse("2026-10-06T10:00:00.500Z")

const SAVED = {
  server_now: SERVER_NOW,
  saved: true,
  capped: false,
  session: { id: "abc", day: "2026-10-06", started_at: RUNNING.started_at, ended_at: SERVER_NOW, active_seconds: 125 },
}

const NOT_SAVED = { server_now: SERVER_NOW, saved: false, capped: false, session: null }

// A fake database client that answers every call with the given data. It returns the fake function so a test can look at the calls.
function answer(data: unknown) {
  const rpc = vi.fn(async (..._args: unknown[]) => ({ data, error: null as unknown }))
  holder.client = { rpc }
  return rpc
}

function fail(error: unknown) {
  const rpc = vi.fn(async (..._args: unknown[]) => ({ data: null, error }))
  holder.client = { rpc }
  return rpc
}

beforeEach(() => {
  holder.client = null
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  holder.client = null
})

describe("the error names", () => {
  it("are the six names the database functions raise", () => {
    expect([...DATABASE_ERRORS]).toEqual(["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED", "BAD_TIMEZONE", "NOT_SIGNED_IN"])
  })

  it("a TimerError carries its kind, and its message starts with the kind", () => {
    const plain = new TimerError("BAD_REPLY")
    expect(plain).toBeInstanceOf(Error)
    expect(plain.kind).toBe("BAD_REPLY")
    expect(plain.name).toBe("TimerError")
    expect(plain.message).toBe("BAD_REPLY")
    expect(new TimerError("UNKNOWN", "boom").message).toBe("UNKNOWN: boom")
  })
})

describe("classifyError", () => {
  it.each(DATABASE_ERRORS)("a database error name in the message is that name: %s", (name) => {
    expect(classifyError({ message: name }, true)).toBe(name)
    expect(classifyError({ message: "P0001: " + name + " (hint)" }, true)).toBe(name)
  })

  it("a database error name wins over a lost connection, because the database did answer", () => {
    expect(classifyError({ message: "DAY_ENDED" }, false)).toBe("DAY_ENDED")
  })

  it("a name that is only part of a longer word is not a name", () => {
    expect(classifyError({ message: "XNOT_RUNNING" }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: "NOT_RUNNING_AT_ALL" }, true)).toBe("UNKNOWN")
  })

  it.each([
    [{ code: "PGRST301", message: "x" }],
    [{ code: "PGRST303", message: "x" }],
    [{ message: "JWT expired" }],
    [{ message: "invalid jwt: malformed" }],
  ])("an expired or missing sign in is NOT_SIGNED_IN: %j", (error) => {
    expect(classifyError(error, true)).toBe("NOT_SIGNED_IN")
    expect(classifyError(error, false)).toBe("NOT_SIGNED_IN")
  })

  it("jwt inside a longer word is not a sign in problem", () => {
    expect(classifyError({ message: "jwtx" }, true)).toBe("UNKNOWN")
  })

  it.each([
    "Failed to fetch",
    "TypeError: NetworkError when attempting to fetch resource.",
    "Network request failed",
    "Load failed",
    "fetch failed",
    "timed out after 15000 ms",
    "Request timeout",
    "The operation was aborted",
    "You are offline",
  ])("words of a lost connection are NO_CONNECTION: %s", (message) => {
    expect(classifyError({ message }, true)).toBe("NO_CONNECTION")
  })

  it("when the browser says it is offline, any other error is NO_CONNECTION", () => {
    expect(classifyError({ message: "something strange" }, false)).toBe("NO_CONNECTION")
    expect(classifyError(null, false)).toBe("NO_CONNECTION")
  })

  it("an error that is none of these is UNKNOWN, also when there is no usable message", () => {
    expect(classifyError({ message: "something strange" }, true)).toBe("UNKNOWN")
    expect(classifyError(null, true)).toBe("UNKNOWN")
    expect(classifyError(undefined, true)).toBe("UNKNOWN")
    expect(classifyError({ message: 123 }, true)).toBe("UNKNOWN")
    expect(classifyError({ code: 5 }, true)).toBe("UNKNOWN")
  })

  it("a message that is not text is not read, even when its text form would hold a name or a network word", () => {
    expect(classifyError({ message: ["NOT_RUNNING"] }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: ["Failed to fetch"] }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: { toString: () => "JWT expired" } }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: ["NOT_RUNNING"] }, false)).toBe("NO_CONNECTION")
  })
})

describe("isOnline and deviceTimeZone", () => {
  it("is online when the browser says so, or says nothing", () => {
    vi.stubGlobal("navigator", { onLine: true })
    expect(isOnline()).toBe(true)
    vi.stubGlobal("navigator", {})
    expect(isOnline()).toBe(true)
    vi.stubGlobal("navigator", undefined)
    expect(isOnline()).toBe(true)
  })

  it("is offline only when the browser says onLine is false", () => {
    vi.stubGlobal("navigator", { onLine: false })
    expect(isOnline()).toBe(false)
  })

  it("gives the time zone of the device", () => {
    expect(deviceTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({ timeZone: "Asia/Kolkata" } as Intl.ResolvedDateTimeFormatOptions)
    expect(deviceTimeZone()).toBe("Asia/Kolkata")
  })

  it("a device that gives no time zone is BAD_TIMEZONE", () => {
    const spy = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions")
    spy.mockReturnValue({ timeZone: "" } as Intl.ResolvedDateTimeFormatOptions)
    expect(kindOf(() => deviceTimeZone())).toBe("BAD_TIMEZONE")
    spy.mockReturnValue({ timeZone: undefined } as unknown as Intl.ResolvedDateTimeFormatOptions)
    expect(kindOf(() => deviceTimeZone())).toBe("BAD_TIMEZONE")
  })
})

describe("readTimerRow", () => {
  it("reads a running session and a paused session", () => {
    expect(readTimerRow(RUNNING)).toEqual(RUNNING)
    expect(readTimerRow(PAUSED)).toEqual(PAUSED)
  })

  it("gives back only the six fields of a TimerRow", () => {
    const row = readTimerRow({ ...RUNNING, id: "x", extra: 1 })
    expect(Object.keys(row).sort()).toEqual(["cap_at", "paused_at", "paused_seconds", "started_at", "status", "tz"])
  })

  it.each([[null], [undefined], ["text"], [5], [[]], [true]])("something that is not an object is BAD_REPLY: %j", (value) => {
    expect(kindOf(() => readTimerRow(value))).toBe("BAD_REPLY")
  })

  it.each([
    ["started_at missing", { ...RUNNING, started_at: undefined }],
    ["started_at is a number", { ...RUNNING, started_at: 1790000000 }],
    ["started_at is not a time", { ...RUNNING, started_at: "yesterday" }],
    ["started_at is a date that does not exist", { ...RUNNING, started_at: "2026-13-01T09:30:00+00:00" }],
    ["cap_at missing", { ...RUNNING, cap_at: undefined }],
    ["cap_at is not a time", { ...RUNNING, cap_at: "midnight" }],
    ["tz missing", { ...RUNNING, tz: undefined }],
    ["tz is empty", { ...RUNNING, tz: "" }],
    ["tz is a number", { ...RUNNING, tz: 5 }],
    ["status missing", { ...RUNNING, status: undefined }],
    ["status is another word", { ...RUNNING, status: "stopped" }],
    ["status in capital letters", { ...RUNNING, status: "RUNNING" }],
    ["running with a paused_at", { ...RUNNING, paused_at: "2026-10-06T09:40:00+00:00" }],
    ["running with paused_at missing", { ...RUNNING, paused_at: undefined }],
    ["paused without paused_at", { ...PAUSED, paused_at: null }],
    ["paused with a bad paused_at", { ...PAUSED, paused_at: "later" }],
    ["paused_seconds missing", { ...RUNNING, paused_seconds: undefined }],
    ["paused_seconds is text", { ...RUNNING, paused_seconds: "5" }],
    ["paused_seconds is negative", { ...RUNNING, paused_seconds: -1 }],
    ["paused_seconds is not a number", { ...RUNNING, paused_seconds: Number.NaN }],
    ["paused_seconds is infinite", { ...RUNNING, paused_seconds: Number.POSITIVE_INFINITY }],
  ])("a session with a problem is BAD_REPLY: %s", (_name, value) => {
    expect(kindOf(() => readTimerRow(value))).toBe("BAD_REPLY")
  })

  it("paused_seconds may have a fraction, and 0 is fine", () => {
    expect(readTimerRow({ ...RUNNING, paused_seconds: 0 }).paused_seconds).toBe(0)
    expect(readTimerRow({ ...RUNNING, paused_seconds: 0.000001 }).paused_seconds).toBe(0.000001)
  })
})

describe("readStateReply, readRunningReply, readEndReply, readDayTotal", () => {
  it("reads the state with nothing running, and with a running session", () => {
    expect(readStateReply({ server_now: SERVER_NOW, running: null })).toEqual({ serverNowMs: SERVER_NOW_MS, row: null })
    expect(readStateReply({ server_now: SERVER_NOW, running: RUNNING })).toEqual({ serverNowMs: SERVER_NOW_MS, row: RUNNING })
  })

  it.each([
    ["not an object", "x"],
    ["an array", []],
    ["server_now missing", { running: null }],
    ["server_now is a number", { server_now: 5, running: null }],
    ["server_now is not a time", { server_now: "now", running: null }],
    ["running missing", { server_now: SERVER_NOW }],
    ["running is broken", { server_now: SERVER_NOW, running: { ...RUNNING, status: "x" } }],
  ])("a state answer with a problem is BAD_REPLY: %s", (_name, value) => {
    expect(kindOf(() => readStateReply(value))).toBe("BAD_REPLY")
  })

  it("an answer to start, pause or resume must hold a session", () => {
    expect(readRunningReply({ server_now: SERVER_NOW, running: PAUSED })).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(kindOf(() => readRunningReply({ server_now: SERVER_NOW, running: null }))).toBe("BAD_REPLY")
  })

  it("reads the answer of a saved session and of a session that was not saved", () => {
    expect(readEndReply(SAVED)).toEqual({ serverNowMs: SERVER_NOW_MS, saved: true, capped: false, seconds: 125, day: "2026-10-06" })
    expect(readEndReply({ ...SAVED, capped: true }).capped).toBe(true)
    expect(readEndReply(NOT_SAVED)).toEqual({ serverNowMs: SERVER_NOW_MS, saved: false, capped: false, seconds: null, day: null })
    expect(readEndReply({ ...NOT_SAVED, capped: true }).capped).toBe(true)
  })

  it.each([
    ["not an object", 5],
    ["server_now missing", { ...SAVED, server_now: undefined }],
    ["saved is text", { ...SAVED, saved: "true" }],
    ["saved is a number", { ...SAVED, saved: 1 }],
    ["saved missing", { ...SAVED, saved: undefined }],
    ["capped is text", { ...SAVED, capped: "false" }],
    ["capped missing", { ...SAVED, capped: undefined }],
    ["not saved but a session is there", { ...NOT_SAVED, session: SAVED.session }],
    ["saved but the session is null", { ...SAVED, session: null }],
    ["saved but the session is text", { ...SAVED, session: "x" }],
    ["active_seconds has a fraction", { ...SAVED, session: { ...SAVED.session, active_seconds: 125.5 } }],
    ["active_seconds is negative", { ...SAVED, session: { ...SAVED.session, active_seconds: -1 } }],
    ["active_seconds is text", { ...SAVED, session: { ...SAVED.session, active_seconds: "125" } }],
    ["active_seconds missing", { ...SAVED, session: { ...SAVED.session, active_seconds: undefined } }],
    ["day is not a date", { ...SAVED, session: { ...SAVED.session, day: "2026-10-6" } }],
    ["day is written the other way round", { ...SAVED, session: { ...SAVED.session, day: "06-10-2026" } }],
    ["day is a number", { ...SAVED, session: { ...SAVED.session, day: 20261006 } }],
    ["day has more after the date", { ...SAVED, session: { ...SAVED.session, day: "2026-10-06T10:00:00" } }],
    ["day has more before the date", { ...SAVED, session: { ...SAVED.session, day: "x2026-10-06" } }],
  ])("an end answer with a problem is BAD_REPLY: %s", (_name, value) => {
    expect(kindOf(() => readEndReply(value))).toBe("BAD_REPLY")
  })

  it("an array is refused as an object, and the reason says so", () => {
    expect(() => readTimerRow([])).toThrow("the running session is not an object")
    expect(() => readStateReply([])).toThrow("the answer is not an object")
    expect(() => readEndReply([])).toThrow("the answer is not an object")
    expect(() => readEndReply({ ...SAVED, session: [] })).toThrow("session is missing")
  })

  it("a saved session of 0 seconds is read as it is", () => {
    expect(readEndReply({ ...SAVED, session: { ...SAVED.session, active_seconds: 0 } }).seconds).toBe(0)
  })

  it("reads a day total of whole seconds", () => {
    expect(readDayTotal(0)).toBe(0)
    expect(readDayTotal(5400)).toBe(5400)
  })

  it.each([[-1], [1.5], ["100"], [null], [undefined], [Number.NaN], [Number.POSITIVE_INFINITY], [{}]])("a day total that is not a whole number of 0 or more is BAD_REPLY: %j", (value) => {
    expect(kindOf(() => readDayTotal(value))).toBe("BAD_REPLY")
  })
})

describe("the calls to the database", () => {
  it("each call names its database function and sends its arguments by the names the SQL uses", async () => {
    const running = { server_now: SERVER_NOW, running: RUNNING }
    let rpc = answer(running)
    await timerState()
    expect(rpc).toHaveBeenCalledWith("timer_state", undefined)
    rpc = answer(5400)
    expect(await timerDayTotal("2026-10-06")).toBe(5400)
    expect(rpc).toHaveBeenCalledWith("timer_day_total", { p_day: "2026-10-06" })
    rpc = answer(running)
    await timerStart("Asia/Kolkata")
    expect(rpc).toHaveBeenCalledWith("timer_start", { p_tz: "Asia/Kolkata" })
    rpc = answer(running)
    await timerPause()
    expect(rpc).toHaveBeenCalledWith("timer_pause", undefined)
    rpc = answer(running)
    await timerResume()
    expect(rpc).toHaveBeenCalledWith("timer_resume", undefined)
    rpc = answer(SAVED)
    expect(await timerEnd()).toEqual({ serverNowMs: SERVER_NOW_MS, saved: true, capped: false, seconds: 125, day: "2026-10-06" })
    expect(rpc).toHaveBeenCalledWith("timer_end", undefined)
  })

  it("every call hands back the checked answer", async () => {
    answer({ server_now: SERVER_NOW, running: PAUSED })
    expect(await timerState()).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(await timerPause()).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(await timerResume()).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(await timerStart("Asia/Kolkata")).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
  })

  it("without a database client every call is NOT_READY", async () => {
    holder.client = null
    for (const run of [() => timerState(), () => timerDayTotal("2026-10-06"), () => timerStart("Asia/Kolkata"), () => timerPause(), () => timerResume(), () => timerEnd()]) {
      expect(await kindOfAsync(run)).toBe("NOT_READY")
    }
  })

  it("a name raised by a database function comes back as that name", async () => {
    fail({ message: "ALREADY_RUNNING", code: "P0001" })
    expect(await kindOfAsync(() => timerStart("Asia/Kolkata"))).toBe("ALREADY_RUNNING")
    fail({ message: "NOT_RUNNING", code: "P0001" })
    expect(await kindOfAsync(() => timerEnd())).toBe("NOT_RUNNING")
  })

  it("an expired sign in comes back as NOT_SIGNED_IN", async () => {
    fail({ message: "JWT expired", code: "PGRST301" })
    expect(await kindOfAsync(() => timerState())).toBe("NOT_SIGNED_IN")
  })

  it("an error of the network comes back as NO_CONNECTION, also when the client throws instead of answering", async () => {
    fail({ message: "Failed to fetch" })
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
    holder.client = {
      rpc: () => {
        throw new TypeError("Failed to fetch")
      },
    }
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
    holder.client = { rpc: () => Promise.reject(new TypeError("Load failed")) }
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
  })

  it("an unknown failure is UNKNOWN, unless the browser says it is offline", async () => {
    holder.client = { rpc: () => Promise.reject(new Error("boom")) }
    expect(await kindOfAsync(() => timerState())).toBe("UNKNOWN")
    vi.stubGlobal("navigator", { onLine: false })
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
  })

  it("an error that the client returns counts as NO_CONNECTION when the browser says it is offline, and as UNKNOWN when it does not", async () => {
    fail({ message: "something strange" })
    expect(await kindOfAsync(() => timerState())).toBe("UNKNOWN")
    vi.stubGlobal("navigator", { onLine: false })
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
  })

  it("keeps the message of the error once, and does not wrap it again", async () => {
    async function messageOf(run: () => Promise<unknown>): Promise<string> {
      try {
        await run()
      } catch (error) {
        return error instanceof Error ? error.message : "not an error"
      }
      return "no error"
    }
    fail({ message: "boom detail" })
    expect(await messageOf(() => timerState())).toBe("UNKNOWN: boom detail")
    fail({ message: "ALREADY_RUNNING" })
    expect(await messageOf(() => timerStart("Asia/Kolkata"))).toBe("ALREADY_RUNNING: ALREADY_RUNNING")
    holder.client = { rpc: () => Promise.reject(new Error("boom")) }
    expect(await messageOf(() => timerState())).toBe("UNKNOWN: Error: boom")
  })

  it("an answer in a wrong shape is BAD_REPLY, not a crash", async () => {
    answer({})
    expect(await kindOfAsync(() => timerState())).toBe("BAD_REPLY")
    answer(null)
    expect(await kindOfAsync(() => timerEnd())).toBe("BAD_REPLY")
    answer("5400")
    expect(await kindOfAsync(() => timerDayTotal("2026-10-06"))).toBe("BAD_REPLY")
    answer({ server_now: SERVER_NOW, running: null })
    expect(await kindOfAsync(() => timerPause())).toBe("BAD_REPLY")
  })

  it("a call that does not answer within 15 seconds is NO_CONNECTION, not before", async () => {
    expect(REQUEST_TIMEOUT_MS).toBe(15000)
    vi.useFakeTimers()
    holder.client = { rpc: () => new Promise(() => {}) }
    let outcome: string = "waiting"
    const run = kindOfAsync(() => timerState()).then((kind) => {
      outcome = kind
    })
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS - 1)
    expect(outcome).toBe("waiting")
    await vi.advanceTimersByTimeAsync(1)
    await run
    expect(outcome).toBe("NO_CONNECTION")
  })

  it("an answer in time leaves no timer behind", async () => {
    vi.useFakeTimers()
    answer({ server_now: SERVER_NOW, running: null })
    await timerState()
    expect(vi.getTimerCount()).toBe(0)
    fail({ message: "boom" })
    await kindOfAsync(() => timerState())
    expect(vi.getTimerCount()).toBe(0)
    holder.client = { rpc: () => Promise.reject(new Error("boom")) }
    await kindOfAsync(() => timerState())
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("the SQL file says what the app expects (the text of supabase/timer_schema.sql is read)", () => {
  it("raises every error name of DATABASE_ERRORS, and no other name", () => {
    const raised = new Set([...schemaSql.matchAll(/raise exception '([A-Z_]+)'/g)].map((m) => m[1]))
    expect([...raised].sort()).toEqual([...DATABASE_ERRORS].sort())
  })

  it("has the six functions the app calls, with the argument names the app sends", () => {
    for (const signature of ["timer_state()", "timer_day_total(p_day date)", "timer_start(p_tz text)", "timer_pause()", "timer_resume()", "timer_end()"]) {
      expect(schemaSql).toContain("create or replace function public." + signature)
    }
  })

  it("sends the keys of the answers that the app reads", () => {
    for (const key of ["server_now", "running", "saved", "capped", "session", "day", "active_seconds"]) {
      expect(schemaSql).toContain("'" + key + "'")
    }
  })

  it("sends the six fields of a running session that readTimerRow reads", () => {
    for (const key of Object.keys(RUNNING)) {
      expect(schemaSql).toContain("'" + key + "'")
    }
  })
})
// AB:TIMER.TESTS:END
