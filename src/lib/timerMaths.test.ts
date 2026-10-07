import { describe, expect, it } from "vitest"
import {
  DEEP_FROM_SECONDS,
  FLOW_FROM_SECONDS,
  GO_BACK_IN_LIMIT_SECONDS,
  MAX_LIVE_STEP_SECONDS,
  MILESTONE_MINUTES,
  MIN_SESSION_SECONDS,
  NEON_COLORS,
  RING_FIRST_COLOR,
  RING_LOOP_SECONDS,
  SOLID_FROM_SECONDS,
  activeSeconds,
  canGoBackIn,
  dayHasEnded,
  dayTotalSeconds,
  estimateServerNowMs,
  formatClock,
  isSessionCounted,
  localDay,
  milestoneStep,
  parseServerTimeMs,
  qualityOf,
  ringColor,
  ringFill,
  ringLoop,
  wholeSeconds,
} from "./timerMaths"
import type { TimerRow } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the timer maths. Run them with: npm test
// The numbers below are written out again on purpose: if a cut-off in timerMaths.ts is changed, a test must fail. See CONNECTIONS.md C27.

const T0 = Date.UTC(2026, 9, 6, 9, 0, 0) // 2026-10-06 09:00:00 UTC

function row(changes: Partial<TimerRow> = {}): TimerRow {
  return {
    started_at: "2026-10-06T09:00:00+00:00",
    tz: "UTC",
    status: "running",
    paused_at: null,
    paused_seconds: 0,
    cap_at: "2026-10-07T00:00:00+00:00",
    ...changes,
  }
}

// A small seeded random number generator, so the random-looking tests give the same result every time.
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0
    return a / 4294967296
  }
}

// Whole microseconds since 1970 -> the text the database sends, for example 2026-10-06T09:00:00.000001+00:00.
function microsText(micros: number): string {
  const seconds = Math.floor(micros / 1000000)
  const fraction = micros - seconds * 1000000
  return new Date(seconds * 1000).toISOString().slice(0, 19) + "." + String(fraction).padStart(6, "0") + "+00:00"
}

describe("the numbers that decide things", () => {
  it("are the numbers the owner decided", () => {
    expect(MIN_SESSION_SECONDS).toBe(60)
    expect(SOLID_FROM_SECONDS).toBe(600)
    expect(DEEP_FROM_SECONDS).toBe(1800)
    expect(FLOW_FROM_SECONDS).toBe(5400)
    expect(GO_BACK_IN_LIMIT_SECONDS).toBe(2700)
    expect(RING_LOOP_SECONDS).toBe(3600)
    expect([...MILESTONE_MINUTES]).toEqual([15, 25, 45, 60, 90, 120, 150, 180])
    expect(MAX_LIVE_STEP_SECONDS).toBe(10)
  })
})

describe("wholeSeconds", () => {
  it.each([
    [0, 0],
    [0.4, 0],
    [0.999, 0],
    [1, 1],
    [59.999, 59],
    [60, 60],
    [3599.99, 3599],
    [-5, 0],
    [-0, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])("%s gives %s", (input, expected) => {
    expect(wholeSeconds(input)).toBe(expected)
  })
})

describe("formatClock", () => {
  it.each([
    [0, "00:00:00"],
    [1, "00:00:01"],
    [59, "00:00:59"],
    [59.9, "00:00:59"],
    [60, "00:01:00"],
    [3599, "00:59:59"],
    [3600, "01:00:00"],
    [3661, "01:01:01"],
    [86399, "23:59:59"],
    [86400, "24:00:00"],
    [360000, "100:00:00"],
    [-3, "00:00:00"],
    [Number.NaN, "00:00:00"],
  ])("%s seconds shows %s", (input, expected) => {
    expect(formatClock(input)).toBe(expected)
  })
})

describe("the 60 second rule", () => {
  it.each([
    [0, false],
    [59, false],
    [59.999, false],
    [60, true],
    [60.5, true],
    [3600, true],
  ])("%s seconds counted: %s", (input, expected) => {
    expect(isSessionCounted(input)).toBe(expected)
  })
})

describe("quality", () => {
  it.each([
    [0, "meh"],
    [59, "meh"],
    [60, "meh"],
    [599, "meh"],
    [599.99, "meh"],
    [600, "solid"],
    [601, "solid"],
    [1799, "solid"],
    [1799.99, "solid"],
    [1800, "deep"],
    [1801, "deep"],
    [5399, "deep"],
    [5399.99, "deep"],
    [5400, "flow"],
    [5401, "flow"],
    [86400, "flow"],
    [-1, "meh"],
    [Number.NaN, "meh"],
  ])("%s seconds is %s", (input, expected) => {
    expect(qualityOf(input)).toBe(expected)
  })
})

describe("GO BACK IN", () => {
  it.each([
    [0, true],
    [59, true],
    [2699, true],
    [2699.99, true],
    [2700, false],
    [2701, false],
    [5400, false],
  ])("%s seconds: offered %s", (input, expected) => {
    expect(canGoBackIn(input)).toBe(expected)
  })
})

describe("parseServerTimeMs", () => {
  it.each([
    ["1970-01-01T00:00:00+00:00", 0],
    ["2026-10-06T09:00:00+00:00", T0],
    ["2026-10-06T09:00:00Z", T0],
    ["2026-10-06 09:00:00+00", T0],
    ["2026-10-06T09:00:00.5+00:00", T0 + 500],
    ["2026-10-06T14:30:00+05:30", T0],
    ["2026-10-06T14:30:00+0530", T0],
    ["2026-10-06T05:00:00-04:00", T0],
    ["2026-10-06T09:00:01+00:00", T0 + 1000],
  ])("reads %s", (text, expected) => {
    expect(parseServerTimeMs(text)).toBe(expected)
  })

  it("keeps the microseconds as a fraction of a millisecond and cuts after the sixth digit", () => {
    expect(parseServerTimeMs("2026-10-06T09:00:00.123456+00:00")).toBeCloseTo(T0 + 123.456, 3)
    expect(parseServerTimeMs("2026-10-06T09:00:00.123456789+00:00")).toBeCloseTo(T0 + 123.456, 3)
    expect(parseServerTimeMs("2026-10-06T09:00:00.000001+00:00")).toBeCloseTo(T0 + 0.001, 3)
  })

  it.each([
    [""],
    ["garbage"],
    ["2026-10-06T09:00:00"],
    ["2026-13-01T00:00:00+00:00"],
    ["2026-02-30T00:00:00+00:00"],
    ["2026-00-10T00:00:00+00:00"],
    ["2026-10-00T00:00:00+00:00"],
    ["2026-10-32T00:00:00+00:00"],
    ["2026-04-31T00:00:00+00:00"],
    ["2026-01-00T00:00:00+00:00"],
    ["2026-12-32T00:00:00+00:00"],
    ["2026-10-06T24:00:00+00:00"],
    ["2026-10-06T09:60:00+00:00"],
    ["2026-10-06T09:00:60+00:00"],
    ["1969-12-31T23:59:59+00:00"],
  ])("refuses %j", (text) => {
    expect(() => parseServerTimeMs(text)).toThrow("BAD_SERVER_TIME")
  })

  it("keeps every microsecond exactly (3000 seeded random times)", () => {
    const random = seeded(42)
    for (let i = 0; i < 3000; i++) {
      const seconds = Math.floor(1577836800 + random() * 631152000) // 2020 to 2040
      const micros = Math.floor(random() * 1000000)
      const text =
        new Date(seconds * 1000).toISOString().slice(0, 19) + "." + String(micros).padStart(6, "0") + "+00:00"
      expect(Math.round(parseServerTimeMs(text) * 1000)).toBe(seconds * 1000000 + micros)
    }
  })
})

describe("estimateServerNowMs", () => {
  it.each([
    [1000, 5000, 5000, 1000],
    [1000, 5000, 5750, 1750],
    [1000, 5000, 65000, 61000],
    [1000, 5000, 4000, 1000], // the device clock jumped back: the estimate does not go back
  ])("server %s, device %s then %s gives %s", (server, localThen, localNow, expected) => {
    expect(estimateServerNowMs(server, localThen, localNow)).toBe(expected)
  })
})

describe("activeSeconds: a running session", () => {
  it.each([
    [0, 0],
    [999, 0],
    [1000, 1],
    [59999, 59],
    [60000, 60],
    [60001, 60],
    [599999, 599],
    [600000, 600],
    [1799999, 1799],
    [1800000, 1800],
    [2699999, 2699],
    [2700000, 2700],
    [3599999, 3599],
    [3600000, 3600],
    [5399999, 5399],
    [5400000, 5400],
  ])("%s ms after the start gives %s s", (afterMs, expected) => {
    expect(activeSeconds(row(), T0 + afterMs)).toBe(expected)
  })

  it("counts in microseconds like the database", () => {
    const r = row({ started_at: "2026-10-06T09:00:00.000001+00:00" })
    expect(activeSeconds(r, T0 + 60000)).toBe(59) // 59.999999 s
    expect(activeSeconds(r, T0 + 60000.001)).toBe(60) // exactly 60 s
  })

  it("rounds a device clock with fractions of a millisecond to the nearest microsecond", () => {
    expect(activeSeconds(row(), T0 + 59999.9997)).toBe(60) // 0.3 microseconds short of 60 s counts as 60 s
    expect(activeSeconds(row(), T0 + 59999.9993)).toBe(59) // 0.7 microseconds short of 60 s does not
    expect(activeSeconds(row(), T0 + 60000.0003)).toBe(60)
    expect(activeSeconds(row(), T0 + 60000.0007)).toBe(60)
  })

  it("never gives a negative number when now is before the start", () => {
    expect(activeSeconds(row(), T0 - 5000)).toBe(0)
  })

  it("takes the paused seconds away", () => {
    expect(activeSeconds(row({ paused_seconds: 30 }), T0 + 90000)).toBe(60)
    expect(activeSeconds(row({ paused_seconds: 30 }), T0 + 89999)).toBe(59)
    expect(activeSeconds(row({ paused_seconds: 100 }), T0 + 50000)).toBe(0)
  })

  it("does not lose a second to decimal numbers", () => {
    expect(activeSeconds(row({ paused_seconds: 0.3 }), T0 + 60300)).toBe(60)
    expect(activeSeconds(row({ paused_seconds: 14.999999 }), T0 + 75000)).toBe(60)
    expect(activeSeconds(row({ paused_seconds: 15.000001 }), T0 + 75000)).toBe(59)
    expect(activeSeconds(row({ paused_seconds: 0.1 + 0.2 }), T0 + 60300)).toBe(60)
  })
})

describe("activeSeconds: against an exact count", () => {
  it("gives the same whole seconds as counting whole microseconds (3000 seeded random sessions)", () => {
    const random = seeded(2026)
    for (let i = 0; i < 3000; i++) {
      const startMicros = Math.floor(1790000000 + random() * 1000000) * 1000000 + Math.floor(random() * 1000000)
      const span = Math.floor(random() * 90000 * 1000000)
      const nowMicros = startMicros + span
      const capMicros = startMicros + 1 + Math.floor(random() * 86400 * 1000000)
      const pausedMicros = Math.floor(random() * span)
      const isPaused = random() < 0.5
      const pausedAtMicros = startMicros + Math.floor(random() * span)
      const end = Math.min(nowMicros, capMicros)
      const reference = isPaused ? Math.min(pausedAtMicros, end) : end
      const active = reference - startMicros - pausedMicros
      const expected = active <= 0 ? 0 : Math.floor(active / 1000000)
      const r: TimerRow = {
        started_at: microsText(startMicros),
        tz: "UTC",
        status: isPaused ? "paused" : "running",
        paused_at: isPaused ? microsText(pausedAtMicros) : null,
        paused_seconds: pausedMicros / 1000000,
        cap_at: microsText(capMicros),
      }
      expect(activeSeconds(r, nowMicros / 1000), JSON.stringify(r) + " now " + nowMicros).toBe(expected)
    }
  })
})

describe("activeSeconds: exact boundaries with odd microseconds", () => {
  const far = "2030-01-01T00:00:00+00:00"

  it("counts exactly N seconds as N, and one microsecond less as N - 1 (4000 seeded random starts)", () => {
    const random = seeded(11)
    for (let i = 0; i < 4000; i++) {
      const startMicros = Math.floor(1790000000 + random() * 1000000) * 1000000 + Math.floor(random() * 1000000)
      const r = row({ started_at: microsText(startMicros), cap_at: far })
      for (const wanted of [60, 600, 1800, 2700, 5400]) {
        const exact = startMicros + wanted * 1000000
        expect(activeSeconds(r, exact / 1000), "start " + startMicros + " wanted " + wanted).toBe(wanted)
        expect(activeSeconds(r, (exact - 1) / 1000), "start " + startMicros + " wanted " + wanted + " minus 1 us").toBe(wanted - 1)
      }
    }
  })

  it("does the same with earlier pauses of odd length (4000 seeded random pauses)", () => {
    const random = seeded(12)
    for (let i = 0; i < 4000; i++) {
      const startMicros = Math.floor(1790000000 + random() * 1000000) * 1000000 + Math.floor(random() * 1000000)
      const pausedMicros = Math.floor(random() * 90000 * 1000000)
      const r = row({ started_at: microsText(startMicros), cap_at: far, paused_seconds: pausedMicros / 1000000 })
      for (const wanted of [60, 2700]) {
        const exact = startMicros + pausedMicros + wanted * 1000000
        expect(activeSeconds(r, exact / 1000), "start " + startMicros + " paused " + pausedMicros).toBe(wanted)
        expect(activeSeconds(r, (exact - 1) / 1000), "start " + startMicros + " paused " + pausedMicros + " minus 1 us").toBe(wanted - 1)
      }
    }
  })
})

describe("activeSeconds: a paused session", () => {
  const pausedAt = "2026-10-06T09:02:00+00:00" // 120 s after the start

  it("stands still while paused, however late it is read", () => {
    const r = row({ status: "paused", paused_at: pausedAt })
    expect(activeSeconds(r, T0 + 120000)).toBe(120)
    expect(activeSeconds(r, T0 + 130000)).toBe(120)
    expect(activeSeconds(r, T0 + 3600000)).toBe(120)
  })

  it("is not ahead of the clock if it is read before paused_at", () => {
    const r = row({ status: "paused", paused_at: pausedAt })
    expect(activeSeconds(r, T0 + 60000)).toBe(60)
  })

  it("also takes away earlier pauses", () => {
    const r = row({ status: "paused", paused_at: pausedAt, paused_seconds: 30 })
    expect(activeSeconds(r, T0 + 3600000)).toBe(90)
  })

  it("refuses a paused row that has no paused_at", () => {
    expect(() => activeSeconds(row({ status: "paused", paused_at: null }), T0)).toThrow("BAD_ROW")
  })
})

describe("activeSeconds: the midnight cut", () => {
  // Asia/Kolkata: local midnight is 18:30 UTC. This session started at 23:59:30 local (18:29:30 UTC).
  const kolkata = row({
    started_at: "2026-10-06T18:29:30+00:00",
    tz: "Asia/Kolkata",
    cap_at: "2026-10-06T18:30:00+00:00",
  })
  const start = Date.UTC(2026, 9, 6, 18, 29, 30)
  const cap = Date.UTC(2026, 9, 6, 18, 30, 0)

  it("counts up to midnight and not after", () => {
    expect(activeSeconds(kolkata, cap - 1000)).toBe(29)
    expect(activeSeconds(kolkata, cap)).toBe(30)
    expect(activeSeconds(kolkata, cap + 1)).toBe(30)
    expect(activeSeconds(kolkata, cap + 3600000)).toBe(30)
    expect(activeSeconds(kolkata, start)).toBe(0)
  })

  it("stops at midnight for a paused session that was paused after midnight too", () => {
    const r = { ...kolkata, status: "paused" as const, paused_at: "2026-10-06T19:00:00+00:00" }
    expect(activeSeconds(r, cap + 7200000)).toBe(30)
  })
})

describe("dayHasEnded", () => {
  const r = row({ tz: "Asia/Kolkata", cap_at: "2026-10-06T18:30:00+00:00" })
  const cap = Date.UTC(2026, 9, 6, 18, 30, 0)
  it.each([
    [-1000, false],
    [-1, false],
    [0, true],
    [1, true],
    [3600000, true],
  ])("%s ms from midnight: %s", (offset, expected) => {
    expect(dayHasEnded(r, cap + offset)).toBe(expected)
  })
})

describe("localDay", () => {
  it.each([
    // Asia/Kolkata is 5 hours 30 minutes ahead of UTC.
    [Date.UTC(2026, 9, 5, 18, 29, 59, 999), "Asia/Kolkata", "2026-10-05"],
    [Date.UTC(2026, 9, 5, 18, 30, 0, 0), "Asia/Kolkata", "2026-10-06"],
    [Date.UTC(2026, 9, 6, 20, 0, 0, 0), "Asia/Kolkata", "2026-10-07"], // the UTC date would say the 6th
    [Date.UTC(2026, 9, 6, 20, 0, 0, 0), "UTC", "2026-10-06"],
    // New York, the day the clocks go forward (2026-03-08): midnight of the 9th is 04:00 UTC.
    [Date.UTC(2026, 2, 9, 3, 59, 59), "America/New_York", "2026-03-08"],
    [Date.UTC(2026, 2, 9, 4, 0, 0), "America/New_York", "2026-03-09"],
    // New York, the day the clocks go back (2026-11-01): midnight of the 2nd is 05:00 UTC.
    [Date.UTC(2026, 10, 2, 4, 59, 59), "America/New_York", "2026-11-01"],
    [Date.UTC(2026, 10, 2, 5, 0, 0), "America/New_York", "2026-11-02"],
    // Year end.
    [Date.UTC(2026, 11, 31, 18, 29, 59), "Asia/Kolkata", "2026-12-31"],
    [Date.UTC(2026, 11, 31, 18, 30, 0), "Asia/Kolkata", "2027-01-01"],
  ])("%s in %s is the day %s", (ms, zone, expected) => {
    expect(localDay(ms, zone)).toBe(expected)
  })

  it("refuses a time zone that does not exist", () => {
    expect(() => localDay(T0, "Mars/Olympus")).toThrow()
  })
})

describe("dayTotalSeconds", () => {
  it.each([
    [0, null, 0],
    [3600, null, 3600],
    [3600, 0, 3600],
    [3600, 59.9, 3659],
    [100, 59.9, 159],
    [100.7, 59.9, 159],
    [-5, 10, 10],
    [100, Number.NaN, 100],
    [86399, 1, 86400],
  ])("saved %s and running %s gives %s", (saved, running, expected) => {
    expect(dayTotalSeconds(saved, running)).toBe(expected)
  })
})

describe("milestones", () => {
  it("are further apart than one normal step, so one step can cross at most one of them", () => {
    const minutes = [...MILESTONE_MINUTES]
    for (let i = 1; i < minutes.length; i++) {
      expect(minutes[i]).toBeGreaterThan(minutes[i - 1])
      expect((minutes[i] - minutes[i - 1]) * 60).toBeGreaterThan(MAX_LIVE_STEP_SECONDS)
    }
  })

  function runTicks(stepSeconds: number, endSeconds: number) {
    let previous: number | null = null
    let shown: number[] = []
    const announced: number[] = []
    for (let t = 0; t <= endSeconds; t += stepSeconds) {
      const result = milestoneStep(previous, t, shown)
      shown = result.shown
      if (result.announce !== null) announced.push(result.announce)
      previous = t
    }
    return { announced, shown }
  }

  it("announces a milestone when it is crossed", () => {
    expect(milestoneStep(899, 900, [])).toEqual({ announce: 15, shown: [15] })
    expect(milestoneStep(1499, 1500, [15])).toEqual({ announce: 25, shown: [15, 25] })
    expect(milestoneStep(10799, 10800, [15, 25, 45, 60, 90, 120, 150])).toEqual({
      announce: 180,
      shown: [15, 25, 45, 60, 90, 120, 150, 180],
    })
  })

  it("does not announce one second before", () => {
    expect(milestoneStep(898, 899, [])).toEqual({ announce: null, shown: [] })
  })

  it("does not announce the same milestone twice", () => {
    expect(milestoneStep(900, 901, [15])).toEqual({ announce: null, shown: [15] })
  })

  it("announces each of the eight milestones exactly once, for every tick size", () => {
    for (const step of [0.25, 1, 3, 7, 10]) {
      const { announced } = runTicks(step, 11000)
      expect(announced, "tick size " + step).toEqual([15, 25, 45, 60, 90, 120, 150, 180])
    }
  })

  it("stays silent when every step is longer than a normal step, but still remembers them", () => {
    const { announced, shown } = runTicks(11, 11000)
    expect(announced).toEqual([])
    expect(shown).toEqual([15, 25, 45, 60, 90, 120, 150, 180])
  })

  it("is silent on the first tick after the page opened, and marks what was passed", () => {
    expect(milestoneStep(null, 7300, [])).toEqual({ announce: null, shown: [15, 25, 45, 60, 90, 120] })
    expect(milestoneStep(null, 900, [])).toEqual({ announce: null, shown: [15] })
    expect(milestoneStep(null, 0, [])).toEqual({ announce: null, shown: [] })
  })

  it("does not send a burst after a long gap", () => {
    expect(milestoneStep(800, 3000, [])).toEqual({ announce: null, shown: [15, 25, 45] })
  })

  it("announces with a step of exactly 10 seconds and is silent with 11", () => {
    expect(milestoneStep(895, 905, [])).toEqual({ announce: 15, shown: [15] })
    expect(milestoneStep(894, 905, [])).toEqual({ announce: null, shown: [15] })
  })

  it("does not announce again when the time steps back and forward over a milestone", () => {
    let shown: number[] = []
    const first = milestoneStep(899, 900, shown)
    expect(first.announce).toBe(15)
    shown = first.shown
    const back = milestoneStep(900, 899, shown)
    expect(back.announce).toBeNull()
    shown = back.shown
    const forward = milestoneStep(899, 900, shown)
    expect(forward.announce).toBeNull()
    expect(forward.shown).toEqual([15])
  })

  it("does not announce when the previous second was already past the milestone", () => {
    expect(milestoneStep(1000, 1001, [])).toEqual({ announce: null, shown: [15] })
  })

  it("stays quiet while paused (the same seconds again and again)", () => {
    expect(milestoneStep(900, 900, [15])).toEqual({ announce: null, shown: [15] })
  })

  it("never announces twice, whatever the ticks do (seeded random walk)", () => {
    const random = seeded(7)
    let t = 0
    let previous: number | null = null
    let shown: number[] = []
    const announced: number[] = []
    for (let i = 0; i < 40000; i++) {
      t += random() < 0.05 ? -1 : random() * 1.5
      if (t < 0) t = 0
      const result = milestoneStep(previous, t, shown)
      shown = result.shown
      if (result.announce !== null) announced.push(result.announce)
      previous = t
    }
    expect(new Set(announced).size).toBe(announced.length)
    for (const m of announced) expect([...MILESTONE_MINUTES]).toContain(m)
  })

  it("does not change the list it was given", () => {
    const given = Object.freeze([15])
    const result = milestoneStep(1499, 1500, given)
    expect(given).toEqual([15])
    expect(result.shown).toEqual([15, 25])
  })
})

describe("the hour ring", () => {
  it.each([
    [0, 0],
    [1, 1 / 3600],
    [1800, 0.5],
    [3599, 3599 / 3600],
    [3599.9, 3599 / 3600],
    [3600, 0],
    [3601, 1 / 3600],
    [7199, 3599 / 3600],
    [7200, 0],
    [Number.NaN, 0],
    [-5, 0],
  ])("%s seconds fills %s of the loop", (input, expected) => {
    expect(ringFill(input)).toBe(expected)
  })

  it.each([
    [0, 0],
    [3599, 0],
    [3599.9, 0],
    [3600, 1],
    [7199, 1],
    [7200, 2],
    [86399, 23],
    [86400, 24],
    [-5, 0],
  ])("%s seconds is in loop %s", (input, expected) => {
    expect(ringLoop(input)).toBe(expected)
  })

  it("has a neon list that is safe to draw from", () => {
    expect(NEON_COLORS.length).toBeGreaterThanOrEqual(2)
    expect(new Set(NEON_COLORS).size).toBe(NEON_COLORS.length)
    expect(RING_FIRST_COLOR).toBe("#ffffff")
    for (const color of NEON_COLORS) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
      expect(color).not.toBe(RING_FIRST_COLOR)
    }
  })

  it("is white in the first loop whatever the seed", () => {
    for (const seed of ["", "a", "2026-10-06T09:00:00+00:00"]) {
      expect(ringColor(0, seed)).toBe("#ffffff")
    }
    expect(ringColor(-1, "x")).toBe("#ffffff")
    expect(ringColor(Number.NaN, "x")).toBe("#ffffff")
  })

  it("is a neon colour from the second loop on, and never the same colour twice in a row", () => {
    const seeds = ["", "a", "2026-10-06T09:00:00+00:00", "2026-10-06T09:00:00.123456+00:00", "x".repeat(500)]
    const random = seeded(99)
    for (let i = 0; i < 60; i++) seeds.push("seed-" + Math.floor(random() * 1e9))
    for (const seed of seeds) {
      let previous = ringColor(0, seed)
      for (let loop = 1; loop <= 200; loop++) {
        const color = ringColor(loop, seed)
        expect(NEON_COLORS as readonly string[]).toContain(color)
        expect(color, "seed " + seed + ", loop " + loop).not.toBe(previous)
        previous = color
      }
    }
  })

  it("gives the same colours for the same seed, every time", () => {
    for (let loop = 0; loop <= 30; loop++) {
      expect(ringColor(loop, "2026-10-06T09:00:00+00:00")).toBe(ringColor(loop, "2026-10-06T09:00:00+00:00"))
    }
    expect(ringColor(1.9, "s")).toBe(ringColor(1, "s"))
  })

  it("uses many colours and differs from seed to seed", () => {
    const used = new Set<string>()
    for (let loop = 1; loop <= 100; loop++) used.add(ringColor(loop, "2026-10-06T09:00:00+00:00"))
    expect(used.size).toBeGreaterThanOrEqual(5)

    const firstColors = new Set<string>()
    for (let i = 0; i < 50; i++) firstColors.add(ringColor(1, "session-" + i))
    expect(firstColors.size).toBeGreaterThanOrEqual(4)

    const a = Array.from({ length: 30 }, (_, i) => ringColor(i + 1, "seed-one"))
    const b = Array.from({ length: 30 }, (_, i) => ringColor(i + 1, "seed-two"))
    expect(a).not.toEqual(b)
  })
})
// AB:TIMER.TESTS:END
