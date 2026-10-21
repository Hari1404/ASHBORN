import { describe, expect, it } from "vitest"
import dayScoreSql from "../../supabase/day_score.sql?raw"
import {
  axisPercent,
  buildDayView,
  clockMinutes,
  clockText,
  DAY_AXIS_END_HOUR,
  DAY_AXIS_START_HOUR,
  DAY_AXIS_STEP_HOURS,
  DAY_LEGEND,
  DAY_QUALITY_COLORS,
  dayAxis,
  daySentence,
  dayTitle,
  NO_TAG_LABEL,
} from "./overviewDay"
import type { DaySession } from "./timerApi"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS, qualityOf } from "./timerMaths"

// AB:OVERVIEW.TESTS:START
// Tests of the day model of "the whole day" view (src/lib/overviewDay.ts, CONNECTIONS.md C62). The main test builds by hand the very day that day-view.html shows (four sessions, 07:00 NPTEL 52, 10:25 STUDY 40, 14:58 STUDY 28 and 19:40 STUDY 22, on the clock of Asia/Kolkata) from times as the database sends them, so the picture of the HTML is the picture of the app. The test of the SQL file is there because the words "under ten" are tied to the short rule of the day score.

const KOLKATA = "Asia/Kolkata"
const DAY = "2026-10-21"

// A session of the day. at is the clock time in India (UTC+5:30) as "HH:MM", written in the database way (UTC with +00:00); minutes is the length of the session without pauses.
function indiaTime(clock: string, addMinutes = 0): string {
  const [h, m] = clock.split(":").map(Number)
  const total = h * 60 + m - 330 + addMinutes
  const day = total < 0 ? "2026-10-20" : total >= 1440 ? "2026-10-22" : DAY
  const inDay = ((total % 1440) + 1440) % 1440
  const pad = (n: number) => String(n).padStart(2, "0")
  return day + "T" + pad(Math.floor(inDay / 60)) + ":" + pad(inDay % 60) + ":00+00:00"
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

const HTML_SESSIONS = [session("07:00", 52, "NPTEL"), session("10:25", 40, "STUDY"), session("14:58", 28, "STUDY"), session("19:40", 22, "STUDY")]
const HTML_SCORE = { sessions: 4, shortSessions: 0, longestStretchMinutes: 52 }

function view(sessions: readonly DaySession[], score = HTML_SCORE, extra: { wokeMinutes?: number | null; deviceZone?: string } = {}) {
  return buildDayView({ day: DAY, sessions, score, deviceZone: extra.deviceZone ?? KOLKATA, wokeMinutes: extra.wokeMinutes })
}

describe("the day of day-view.html", () => {
  const v = view(HTML_SESSIONS)

  it("has the name of the weekday and the sentence of the HTML", () => {
    expect(v.title).toBe("Wednesday")
    expect(v.sentence).toBe("Four sessions. The longest stretch ran 52, and none lasted under ten.")
  })

  it("has the axis from 06 to 24 with a mark every 3 hours", () => {
    expect(v.axis.fromHour).toBe(6)
    expect(v.axis.toHour).toBe(24)
    expect(v.axis.ticks.map((t) => t.label)).toEqual(["06", "09", "12", "15", "18", "21", "24"])
    expect(v.axis.ticks.map((t) => Math.round(t.leftPercent))).toEqual([0, 17, 33, 50, 67, 83, 100])
  })

  it("puts the four pills where the HTML puts them", () => {
    // left = (start hour - 6) / 18, width = minutes / 60 / 18, both in percent
    const expected = [
      { left: ((7 * 60 - 360) / 1080) * 100, width: (52 / 1080) * 100 },
      { left: ((10 * 60 + 25 - 360) / 1080) * 100, width: (40 / 1080) * 100 },
      { left: ((14 * 60 + 58 - 360) / 1080) * 100, width: (28 / 1080) * 100 },
      { left: ((19 * 60 + 40 - 360) / 1080) * 100, width: (22 / 1080) * 100 },
    ]
    expect(v.bars).toHaveLength(4)
    v.bars.forEach((bar, i) => {
      expect(bar.leftPercent).toBeCloseTo(expected[i].left, 2)
      expect(bar.widthPercent).toBeCloseTo(expected[i].width, 2)
      expect(bar.centerPercent).toBeCloseTo(expected[i].left + expected[i].width / 2, 2)
    })
  })

  it("gives the qualities, the colours and the labels", () => {
    expect(v.bars.map((b) => b.quality)).toEqual(["deep", "deep", "solid", "solid"])
    expect(v.bars.map((b) => b.color)).toEqual(["#ff6a3c", "#ff6a3c", "#e8b062", "#e8b062"])
    expect(v.bars.map((b) => b.label)).toEqual(["52 \u00b7 NPTEL", "40 \u00b7 STUDY", "28 \u00b7 STUDY", "22 \u00b7 STUDY"])
  })

  it("puts the biggest tag first in the tag bar, with its minutes", () => {
    expect(v.tagBar).toEqual([
      { label: "STUDY", seconds: 5400, minutes: 90 },
      { label: "NPTEL", seconds: 3120, minutes: 52 },
    ])
  })

  it("draws no Woke mark when the wake time is not known", () => {
    expect(v.woke).toBeNull()
  })
})

describe("the wake time", () => {
  it("is drawn as Woke 06:31 at its place on the axis", () => {
    const v = view(HTML_SESSIONS, HTML_SCORE, { wokeMinutes: 6 * 60 + 31 })
    expect(v.woke?.label).toBe("Woke 06:31")
    expect(v.woke?.leftPercent).toBeCloseTo((31 / 1080) * 100, 2)
  })

  it("moves the start of the axis when it lies before 06", () => {
    const v = view(HTML_SESSIONS, HTML_SCORE, { wokeMinutes: 5 * 60 + 10 })
    expect(v.axis.fromHour).toBe(3)
    expect(v.woke?.leftPercent).toBeGreaterThan(0)
  })
})

describe("the axis", () => {
  it("is 06 to 24 when there is nothing earlier, even with no session", () => {
    const a = dayAxis(null)
    expect([a.fromHour, a.toHour]).toEqual([6, 24])
    expect(dayAxis(6 * 60).fromHour).toBe(6)
    expect(DAY_AXIS_START_HOUR).toBe(6)
    expect(DAY_AXIS_END_HOUR).toBe(24)
    expect(DAY_AXIS_STEP_HOURS).toBe(3)
  })

  it("starts at the 3 hour mark before an early session", () => {
    expect(dayAxis(5 * 60 + 59).fromHour).toBe(3)
    expect(dayAxis(3 * 60).fromHour).toBe(3)
    expect(dayAxis(2 * 60 + 10).fromHour).toBe(0)
    expect(dayAxis(0).ticks.map((t) => t.label)).toEqual(["00", "03", "06", "09", "12", "15", "18", "21", "24"])
  })

  it("always has its first mark at 0 percent and its last at 100", () => {
    for (const earliest of [null, 100, 200, 359]) {
      const ticks = dayAxis(earliest).ticks
      expect(ticks[0].leftPercent).toBe(0)
      expect(ticks[ticks.length - 1].leftPercent).toBe(100)
    }
  })

  it("holds a moment that lies off the axis at the nearer end", () => {
    const a = dayAxis(null)
    expect(axisPercent(5 * 60, a)).toBe(0)
    expect(axisPercent(24 * 60 + 30, a)).toBe(100)
    expect(axisPercent(15 * 60, a)).toBe(50)
  })
})

describe("the sessions", () => {
  it("are put in the order of their start, whatever order they come in", () => {
    const v = view([HTML_SESSIONS[3], HTML_SESSIONS[0], HTML_SESSIONS[2], HTML_SESSIONS[1]])
    expect(v.bars.map((b) => b.label)).toEqual(["52 \u00b7 NPTEL", "40 \u00b7 STUDY", "28 \u00b7 STUDY", "22 \u00b7 STUDY"])
  })

  it("use the quality of the app, and flow starts at 90 minutes, not 60", () => {
    const v = view([session("08:00", 60, "A"), session("10:00", 90, "A"), session("13:00", 5, "A")], { sessions: 3, shortSessions: 1, longestStretchMinutes: 90 })
    expect(v.bars.map((b) => b.quality)).toEqual(["deep", "flow", "meh"])
    expect(v.bars.map((b) => b.color)).toEqual(["#ff6a3c", "#fff3de", "#a0705c"])
  })

  it("has a colour for every quality the app can give", () => {
    for (const seconds of [60, SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS]) {
      expect(DAY_QUALITY_COLORS[qualityOf(seconds)]).toMatch(/^#[0-9a-f]{6}$/)
    }
    expect(DAY_LEGEND.map((l) => l.quality)).toEqual(["meh", "solid", "deep", "flow"])
    expect(DAY_LEGEND.map((l) => l.label)).toEqual(["Meh", "Solid", "Deep", "Flow"])
    for (const item of DAY_LEGEND) expect(item.color).toBe(DAY_QUALITY_COLORS[item.quality])
  })

  it("are cut at midnight when a session runs past it", () => {
    const late = session("23:30", 60, "A")
    const bar = view([late], { sessions: 1, shortSessions: 0, longestStretchMinutes: 60 }).bars[0]
    expect(bar.leftPercent + bar.widthPercent).toBeLessThanOrEqual(100)
    expect(bar.leftPercent + bar.widthPercent).toBeCloseTo(100, 2)
    expect(bar.minutes).toBe(60)
  })

  it("are placed on the clock of their own zone, and a session without a zone uses the zone of the device", () => {
    const withZone = session("07:00", 30, "A")
    const withoutZone = session("07:00", 30, "A", { tz: null })
    const score = { sessions: 1, shortSessions: 0, longestStretchMinutes: 30 }
    expect(view([withoutZone], score, { deviceZone: KOLKATA }).bars[0].leftPercent).toBe(view([withZone], score).bars[0].leftPercent)
    // the same moment on the clock of another zone is another place: 01:30 UTC is 21:30 the evening before in New York
    expect(view([withoutZone], score, { deviceZone: "UTC" }).axis.fromHour).toBe(0)
  })

  it("show a session without a tag as No tag, in the bar and in the tag bar, as a group of its own", () => {
    const v = view([session("07:00", 30, null), session("09:00", 20, "STUDY"), session("11:00", 10, null)], { sessions: 3, shortSessions: 0, longestStretchMinutes: 30 })
    expect(NO_TAG_LABEL).toBe("No tag")
    expect(v.bars.map((b) => b.label)).toEqual(["30 \u00b7 No tag", "20 \u00b7 STUDY", "10 \u00b7 No tag"])
    expect(v.tagBar).toEqual([
      { label: "No tag", seconds: 2400, minutes: 40 },
      { label: "STUDY", seconds: 1200, minutes: 20 },
    ])
  })

  it("keep two tags of the same total in the order of their first session", () => {
    const v = view([session("07:00", 20, "B"), session("09:00", 20, "A")], { sessions: 2, shortSessions: 0, longestStretchMinutes: 20 })
    expect(v.tagBar.map((s) => s.label)).toEqual(["B", "A"])
  })

  it("give an empty day an empty timeline", () => {
    const v = view([], { sessions: 0, shortSessions: 0, longestStretchMinutes: 0 })
    expect(v.bars).toEqual([])
    expect(v.tagBar).toEqual([])
    expect(v.woke).toBeNull()
    expect(v.axis.fromHour).toBe(6)
    expect(v.sentence).toBe("No session this day.")
  })

  it("refuse a zone the browser does not know and a time that is not a time", () => {
    expect(() => view([session("07:00", 30, "A", { tz: "Mars/Olympus" })])).toThrow(/^BAD_TIME_ZONE/)
    expect(() => view([session("07:00", 30, "A", { startedAt: "yesterday" })])).toThrow(/^BAD_SERVER_TIME/)
  })
})

describe("the sentence", () => {
  const s = (sessions: number, shortSessions: number, longestStretchMinutes: number) => daySentence({ sessions, shortSessions, longestStretchMinutes })

  it("says one session in the singular", () => {
    expect(s(1, 0, 30)).toBe("One session. The longest stretch ran 30, and none lasted under ten.")
  })

  it("counts the short ones", () => {
    expect(s(3, 1, 45)).toBe("Three sessions. The longest stretch ran 45, and 1 lasted under ten.")
    expect(s(5, 2, 45)).toBe("Five sessions. The longest stretch ran 45, and 2 lasted under ten.")
  })

  it("writes the numbers from eleven on", () => {
    expect(s(10, 0, 20)).toContain("Ten sessions.")
    expect(s(11, 0, 20)).toContain("11 sessions.")
  })

  it("rounds the stretch to whole minutes and never says 0 for a day with a session", () => {
    expect(s(2, 0, 52.4)).toContain("ran 52,")
    expect(s(2, 0, 52.6)).toContain("ran 53,")
    expect(s(1, 0, 0.4)).toContain("ran 1,")
  })

  it("has one short line for a day without a session", () => {
    expect(s(0, 0, 0)).toBe("No session this day.")
  })
})

describe("the name of the day", () => {
  it("is the weekday of the date", () => {
    expect(dayTitle("2026-10-21")).toBe("Wednesday")
    expect(dayTitle("2026-10-25")).toBe("Sunday")
    expect(dayTitle("2028-02-29")).toBe("Tuesday")
  })

  it("refuses text that is not a day", () => {
    expect(() => dayTitle("21-10-2026")).toThrow(/^BAD_LOCAL_DAY/)
    expect(() => dayTitle("2026-02-30")).toThrow(/^BAD_LOCAL_DAY/)
    expect(() => dayTitle("")).toThrow(/^BAD_LOCAL_DAY/)
  })
})

describe("the clock", () => {
  it("reads the minutes since midnight on the clock of a zone", () => {
    expect(clockMinutes(Date.UTC(2026, 9, 21, 1, 30), KOLKATA)).toBe(7 * 60)
    expect(clockMinutes(Date.UTC(2026, 9, 21, 1, 30, 30), KOLKATA)).toBe(7 * 60 + 0.5)
    expect(clockMinutes(Date.UTC(2026, 9, 21, 1, 30), "America/New_York")).toBe(21 * 60 + 30)
  })

  it("never says 24 for midnight", () => {
    expect(clockMinutes(Date.UTC(2026, 9, 21, 0, 0), "UTC")).toBe(0)
    expect(clockMinutes(Date.UTC(2026, 9, 20, 18, 30), KOLKATA)).toBe(0)
  })

  it("writes whole minutes as HH:MM, rounded down", () => {
    expect(clockText(6 * 60 + 31)).toBe("06:31")
    expect(clockText(0)).toBe("00:00")
    expect(clockText(23 * 60 + 59.9)).toBe("23:59")
    expect(clockText(430)).toBe("07:10")
  })
})

describe("what the day view is tied to", () => {
  it("says under ten, and ten minutes is the short rule of the day score in the SQL file and the solid cut-off of the app", () => {
    expect(SOLID_FROM_SECONDS).toBe(600)
    expect(dayScoreSql).toContain("(count(*) filter (where active_seconds < 600))::integer as short_sessions")
    expect(daySentence({ sessions: 1, shortSessions: 0, longestStretchMinutes: 20 })).toContain("under ten")
  })
})
// AB:OVERVIEW.TESTS:END
