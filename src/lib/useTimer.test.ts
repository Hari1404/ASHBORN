import { describe, expect, it, vi } from "vitest"

// The database client is replaced by an empty one, so nothing here can reach the network.
vi.mock("@/lib/supabase", () => ({ supabase: null }))

import { DATABASE_ERRORS, type TimerErrorKind } from "@/lib/timerApi"
import { POLL_OFFLINE_MS, POLL_ONLINE_MS, TIME_BASE_JITTER_MS, keepTimeBase, problemText } from "./useTimer"

// AB:TIMER.TESTS:START
describe("the waiting times", () => {
  it("read again every 30 seconds online and every 3 seconds without a connection; a new reading of the server time replaces the old one from 1.5 seconds on", () => {
    expect(POLL_ONLINE_MS).toBe(30000)
    expect(POLL_OFFLINE_MS).toBe(3000)
    expect(TIME_BASE_JITTER_MS).toBe(1500)
  })
})

describe("keepTimeBase", () => {
  const OLD = { serverMs: 1_000_000, localMs: 5_000_000 }

  it("takes the first reading as it is", () => {
    const next = { serverMs: 2_000_000, localMs: 6_000_000 }
    expect(keepTimeBase(null, next, 6_000_000)).toBe(next)
  })

  it("keeps the old reading (the same object) when the new one differs by less than 1.5 seconds, in both directions", () => {
    expect(keepTimeBase(OLD, { serverMs: 1_000_000 + 1499, localMs: 5_000_000 }, 5_000_000)).toBe(OLD)
    expect(keepTimeBase(OLD, { serverMs: 1_000_000 - 1499, localMs: 5_000_000 }, 5_000_000)).toBe(OLD)
  })

  it("takes the new reading from a difference of exactly 1.5 seconds, in both directions", () => {
    const later = { serverMs: 1_000_000 + 1500, localMs: 5_000_000 }
    const earlier = { serverMs: 1_000_000 - 1500, localMs: 5_000_000 }
    expect(keepTimeBase(OLD, later, 5_000_000)).toBe(later)
    expect(keepTimeBase(OLD, earlier, 5_000_000)).toBe(earlier)
  })

  it("compares what the two readings say about the server time now, not their raw numbers", () => {
    const next = { serverMs: 1_010_000, localMs: 5_010_000 }
    expect(keepTimeBase(OLD, next, 5_020_000)).toBe(OLD)
    expect(keepTimeBase(OLD, next, 9_000_000)).toBe(OLD)
  })

  it("takes a new reading when the server clock moved against the device clock", () => {
    const next = { serverMs: 1_000_000 + 60_000, localMs: 5_000_000 }
    expect(keepTimeBase(OLD, next, 5_030_000)).toBe(next)
  })

  it("does not go backwards when the device clock jumped back: the estimate of the old reading stops at its own reading time", () => {
    const next = { serverMs: 1_000_000, localMs: 5_000_000 }
    expect(keepTimeBase(OLD, next, 4_000_000)).toBe(OLD)
  })
})

describe("problemText", () => {
  const SPECIAL: TimerErrorKind[] = ["NOT_SIGNED_IN", "BAD_TIMEZONE", "BAD_REPLY", "NOT_READY"]
  const OTHERS: TimerErrorKind[] = [...DATABASE_ERRORS.filter((name) => !SPECIAL.includes(name)), "NO_CONNECTION", "UNKNOWN"]

  it("gives its own text to the four problems the person can understand", () => {
    const texts = SPECIAL.map((kind) => problemText(kind))
    for (const text of texts) expect(text.length).toBeGreaterThan(10)
    expect(new Set(texts).size).toBe(4)
  })

  it("gives one general text to every other kind, and it is different from the four", () => {
    const general = problemText("UNKNOWN")
    expect(general.length).toBeGreaterThan(10)
    for (const kind of OTHERS) expect(problemText(kind)).toBe(general)
    for (const kind of SPECIAL) expect(problemText(kind)).not.toBe(general)
  })

  it("says to sign in again when the sign in is gone", () => {
    expect(problemText("NOT_SIGNED_IN").toLowerCase()).toContain("sign in")
  })
})
// AB:TIMER.TESTS:END
