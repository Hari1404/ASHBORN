import { describe, expect, it } from "vitest"
import {
  COUNTDOWN_NAME,
  countdownCaption,
  DAY_WORD_TEXT,
  daysUntilApril14,
  focusPercent,
  formatSpan,
  HUD_REFRESH_MS,
  minutesParts,
} from "./overviewHud"

// AB:OVERVIEW.TESTS:START
// Tests of the plain values and functions of the countdown and of the day of the Pro Timer on the Overview (src/lib/overviewHud.ts, CONNECTIONS.md C60). The numbers of days are counted by hand here (for example 21 October 2026 is day 294 of a year of 365 days, so 71 days remain, and 14 April 2027 is day 104: 71 + 104 = 175), not taken from the function.

const KOLKATA = "Asia/Kolkata"

describe("the days to April 14", () => {
  it("is 175 on 21 October 2026 and shows the name of the date", () => {
    expect(daysUntilApril14(Date.UTC(2026, 9, 21, 6, 30), KOLKATA)).toBe(175)
    expect(COUNTDOWN_NAME).toBe("April 14")
  })

  it("is 104 on 31 December 2026 and 103 on 1 January 2027", () => {
    expect(daysUntilApril14(Date.UTC(2026, 11, 31, 12), "UTC")).toBe(104)
    expect(daysUntilApril14(Date.UTC(2027, 0, 1, 12), "UTC")).toBe(103)
  })

  it("is 1 on April 13, 0 on April 14 itself and counts to the next year from April 15", () => {
    expect(daysUntilApril14(Date.UTC(2027, 3, 13, 12), "UTC")).toBe(1)
    expect(daysUntilApril14(Date.UTC(2027, 3, 14, 12), "UTC")).toBe(0)
    // 15 April 2026 to 14 April 2027: a year of 365 days, one day short.
    expect(daysUntilApril14(Date.UTC(2026, 3, 15, 12), "UTC")).toBe(364)
    // 15 April 2027 to 14 April 2028: 2028 has a 29 February, so 366 days minus one.
    expect(daysUntilApril14(Date.UTC(2027, 3, 15, 12), "UTC")).toBe(365)
  })

  it("changes at midnight of the person's own time zone, not at midnight UTC", () => {
    // 18:29:59 UTC is 23:59:59 in Kolkata (UTC+5:30), 18:30:00 UTC is 00:00:00 of the next day there.
    expect(daysUntilApril14(Date.UTC(2026, 9, 21, 18, 29, 59), KOLKATA)).toBe(175)
    expect(daysUntilApril14(Date.UTC(2026, 9, 21, 18, 30, 0), KOLKATA)).toBe(174)
    // The same moment is still 21 October in UTC.
    expect(daysUntilApril14(Date.UTC(2026, 9, 21, 19, 0, 0), "UTC")).toBe(175)
    expect(daysUntilApril14(Date.UTC(2026, 9, 21, 19, 0, 0), KOLKATA)).toBe(174)
  })

  it("is never negative and never more than 365, on every day of four years", () => {
    for (let ms = Date.UTC(2026, 0, 1, 12); ms < Date.UTC(2030, 0, 1, 12); ms += 86_400_000) {
      const days = daysUntilApril14(ms, "UTC")
      expect(days).toBeGreaterThanOrEqual(0)
      expect(days).toBeLessThanOrEqual(365)
    }
  })

  it("goes down by exactly one each day, except on April 15 when it jumps up to the next year", () => {
    let before = daysUntilApril14(Date.UTC(2026, 0, 1, 12), "UTC")
    for (let ms = Date.UTC(2026, 0, 2, 12); ms < Date.UTC(2028, 0, 1, 12); ms += 86_400_000) {
      const days = daysUntilApril14(ms, "UTC")
      const date = new Date(ms)
      const isApril15 = date.getUTCMonth() === 3 && date.getUTCDate() === 15
      if (isApril15) expect(days).toBeGreaterThan(before)
      else expect(days).toBe(before - 1)
      before = days
    }
  })

  it("refuses a time zone that does not exist", () => {
    expect(() => daysUntilApril14(Date.UTC(2026, 9, 21), "Not/AZone")).toThrow()
  })
})

describe("the line under the countdown", () => {
  it("says days, day and the day itself", () => {
    expect(countdownCaption(175)).toBe("days to April 14")
    expect(countdownCaption(2)).toBe("days to April 14")
    expect(countdownCaption(1)).toBe("day to April 14")
    expect(countdownCaption(0)).toBe("It is April 14")
  })
})

describe("minutes as hours and minutes", () => {
  it("cuts the minutes of the day into whole hours and whole minutes, rounded once", () => {
    expect(minutesParts(107.4)).toEqual({ hours: 1, minutes: 47 })
    expect(minutesParts(0)).toEqual({ hours: 0, minutes: 0 })
    expect(minutesParts(0.4)).toEqual({ hours: 0, minutes: 0 })
    expect(minutesParts(59.6)).toEqual({ hours: 1, minutes: 0 })
    expect(minutesParts(600)).toEqual({ hours: 10, minutes: 0 })
  })

  it("gives zero for a number that is not a time", () => {
    expect(minutesParts(-5)).toEqual({ hours: 0, minutes: 0 })
    expect(minutesParts(Number.NaN)).toEqual({ hours: 0, minutes: 0 })
    expect(minutesParts(Number.POSITIVE_INFINITY)).toEqual({ hours: 0, minutes: 0 })
  })

  it("writes a span as 45m, 2h or 1h 12m", () => {
    expect(formatSpan(0)).toBe("0m")
    expect(formatSpan(45)).toBe("45m")
    expect(formatSpan(120)).toBe("2h")
    expect(formatSpan(72)).toBe("1h 12m")
    expect(formatSpan(59.6)).toBe("1h")
    expect(formatSpan(180)).toBe("3h")
  })
})

describe("the word of the day", () => {
  it("has a sentence case text for each of the six words of the database and no other", () => {
    expect(DAY_WORD_TEXT).toEqual({
      "NO SESSION": "No session",
      LIGHT: "Light",
      "BELOW USUAL": "Below usual",
      USUAL: "Usual",
      "ABOVE USUAL": "Above usual",
      BIG: "Big",
    })
  })
})

describe("the focus of the day", () => {
  it("is counted over elapsed as a whole percent between 0 and 100", () => {
    expect(focusPercent(0.9123)).toBe(91)
    expect(focusPercent(0.5)).toBe(50)
    expect(focusPercent(0)).toBe(0)
    expect(focusPercent(1)).toBe(100)
  })

  it("stays inside 0 to 100 and gives nothing without a session or for a number that is not one", () => {
    expect(focusPercent(1.2)).toBe(100)
    expect(focusPercent(-0.1)).toBe(0)
    expect(focusPercent(null)).toBeNull()
    expect(focusPercent(Number.NaN)).toBeNull()
  })
})

describe("the time between two readings", () => {
  it("is one minute", () => {
    expect(HUD_REFRESH_MS).toBe(60_000)
  })
})
// AB:OVERVIEW.TESTS:END
