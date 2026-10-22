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
  dayLegendFor,
  daySentence,
  dayTitle,
  DAY_AXIS_ZOOM_MARGIN_MINUTES,
  DAY_AXIS_ZOOM_MIN_HOURS,
  NO_TAG_LABEL,
  shiftDay,
  weekDaysUpTo,
  zoomedDayAxis,
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

describe("the zoomed axis (Day screen idea 2)", () => {
  const hours = (a: { fromHour: number; toHour: number }) => [a.fromHour, a.toHour]
  const at = (clock: string) => {
    const [h, m] = clock.split(":").map(Number)
    return h * 60 + m
  }

  it("is the full axis when the day has no moment at all", () => {
    expect(zoomedDayAxis(null, null)).toEqual(dayAxis(null))
    expect(DAY_AXIS_ZOOM_MARGIN_MINUTES).toBe(60)
    expect(DAY_AXIS_ZOOM_MIN_HOURS).toBe(6)
  })

  it("runs from one hour before the first moment to one hour after the last, moved out to whole 3 hour steps", () => {
    // 10:25 to 15:26: 09:25 and 16:26 become 09 and 18.
    const a = zoomedDayAxis(at("10:25"), at("15:26"))
    expect(hours(a)).toEqual([9, 18])
    expect(a.ticks.map((t) => t.label)).toEqual(["09", "12", "15", "18"])
    expect(a.ticks.map((t) => Math.round(t.leftPercent))).toEqual([0, 33, 67, 100])
    // The margin of one hour is taken first and then moved out: 12:00 to 15:00 is 11:00 to 16:00, which goes out to 09 and 18.
    expect(hours(zoomedDayAxis(at("12:00"), at("15:00")))).toEqual([9, 18])
    // A margin that lands exactly on a mark stays on it: 10:00 to 14:00 is 09:00 to 15:00.
    expect(hours(zoomedDayAxis(at("10:00"), at("14:00")))).toEqual([9, 15])
  })

  it("is never shorter than 6 hours, and the extra room goes to the side where the day has less room", () => {
    // 04:35 to 04:57 (03 to 06 would be 3 hours): there is less room after it than before it, so the end moves.
    expect(hours(zoomedDayAxis(at("04:35"), at("04:57")))).toEqual([3, 9])
    // 06:20 to 06:50 on a day that cannot start before 06: the end moves.
    expect(hours(zoomedDayAxis(at("06:20"), at("06:50")))).toEqual([6, 12])
    // 22:30 to 23:10: the axis cannot go past 24, so the start moves.
    expect(hours(zoomedDayAxis(at("22:30"), at("23:10")))).toEqual([18, 24])
    // 13:00 to 13:30: 12 to 15 is 3 hours; there is less room before the day (1 hour) than after it (1.5), so the start moves to 09.
    expect(hours(zoomedDayAxis(at("13:00"), at("13:30")))).toEqual([9, 15])
    for (const [from, to] of [["03:10", "03:20"], ["09:00", "09:05"], ["23:30", "23:59"], ["00:05", "00:20"]]) {
      const a = zoomedDayAxis(at(from), at(to))
      expect(a.toHour - a.fromHour).toBeGreaterThanOrEqual(6)
      expect(a.fromHour).toBeLessThanOrEqual(at(from) / 60)
      expect(a.toHour).toBeGreaterThanOrEqual(Math.min(24, at(to) / 60))
    }
  })

  it("is never wider than the full axis: not before its start, not past 24", () => {
    // The full axis of a day that starts at 06:30 starts at 06, the zoom would otherwise reach back to 03.
    expect(hours(zoomedDayAxis(at("06:30"), at("07:00")))).toEqual([6, 12])
    // A session over midnight (it ends at 24:20) is held at 24.
    const over = zoomedDayAxis(at("23:50"), at("23:50") + 30)
    expect(over.toHour).toBe(24)
    expect(over.fromHour).toBe(18)
    // A day with a very early moment can still use the earlier start of its own full axis (01:00 less an hour is 00:00); 20:00 and the hour after it is 21:00.
    expect(hours(zoomedDayAxis(at("01:00"), at("20:00")))).toEqual([0, 21])
  })

  it("always has its first mark at 0 percent and its last at 100, with a mark every 3 hours", () => {
    for (const [from, to] of [["04:35", "04:57"], ["10:25", "15:26"], ["22:30", "23:10"], ["00:05", "23:59"]]) {
      const a = zoomedDayAxis(at(from), at(to))
      expect(a.ticks[0].leftPercent).toBe(0)
      expect(a.ticks[a.ticks.length - 1].leftPercent).toBe(100)
      for (let i = 1; i < a.ticks.length; i++) expect(a.ticks[i].hour - a.ticks[i - 1].hour).toBe(3)
    }
  })

  describe("in the view of a day", () => {
    const early = [session("04:35", 22, "STUDY"), session("05:20", 27, "STUDY")]
    const earlyScore = { sessions: 2, shortSessions: 0, longestStretchMinutes: 27 }

    it("keeps the full axis unless the zoom is asked for (the day of day-view.html is the full one)", () => {
      expect(hours(view(HTML_SESSIONS).axis)).toEqual([6, 24])
      expect(hours(buildDayView({ day: DAY, sessions: HTML_SESSIONS, score: HTML_SCORE, deviceZone: KOLKATA, axisMode: "full" }).axis)).toEqual([6, 24])
      expect(hours(view(early, earlyScore).axis)).toEqual([3, 24])
    })

    it("draws the zoomed axis when it is asked for, and the pills are wider on it", () => {
      const full = view(early, earlyScore)
      const zoomed = buildDayView({ day: DAY, sessions: early, score: earlyScore, deviceZone: KOLKATA, axisMode: "zoom" })
      expect(hours(zoomed.axis)).toEqual([3, 9])
      expect(zoomed.bars.length).toBe(2)
      for (let i = 0; i < 2; i++) {
        expect(zoomed.bars[i].widthPercent).toBeGreaterThan(full.bars[i].widthPercent * 3)
        expect(zoomed.bars[i].leftPercent).toBeGreaterThanOrEqual(0)
        expect(zoomed.bars[i].leftPercent + zoomed.bars[i].widthPercent).toBeLessThanOrEqual(100)
      }
      // The sentence, the labels and the tag bar do not depend on the axis.
      expect(zoomed.sentence).toBe(full.sentence)
      expect(zoomed.bars.map((b) => b.label)).toEqual(full.bars.map((b) => b.label))
      expect(zoomed.tagBar).toEqual(full.tagBar)
    })

    it("says that the zoom changes something only when the zoomed axis is shorter than the full one", () => {
      expect(view(early, earlyScore).zoomable).toBe(true)
      expect(view([session("10:00", 30, "A")], { sessions: 1, shortSessions: 0, longestStretchMinutes: 30 }).zoomable).toBe(true)
      // The day of day-view.html fills the whole full axis (06 to 24).
      expect(view(HTML_SESSIONS).zoomable).toBe(false)
      // No session: nothing to zoom to.
      expect(view([], { sessions: 0, shortSessions: 0, longestStretchMinutes: 0 }).zoomable).toBe(false)
    })

    it("draws the full axis when the zoom is asked for and changes nothing", () => {
      const zoomed = buildDayView({ day: DAY, sessions: HTML_SESSIONS, score: HTML_SCORE, deviceZone: KOLKATA, axisMode: "zoom" })
      expect(zoomed).toEqual(view(HTML_SESSIONS))
    })

    it("counts the end of the last session and the wake time as moments of the day", () => {
      // One session 10:00 to 10:30 and a wake time at 05:10: the axis must hold both.
      const one = [session("10:00", 30, "A")]
      const oneScore = { sessions: 1, shortSessions: 0, longestStretchMinutes: 30 }
      const woke = buildDayView({ day: DAY, sessions: one, score: oneScore, deviceZone: KOLKATA, wokeMinutes: 5 * 60 + 10, axisMode: "zoom" })
      expect(hours(woke.axis)).toEqual([3, 12])
      expect(woke.woke?.leftPercent).toBeGreaterThan(0)
      // A long last session decides the end of the axis, not only its start: 12:00 to 17:30.
      const long = buildDayView({ day: DAY, sessions: [session("12:00", 330, "A", { activeSeconds: 330 * 60 })], score: oneScore, deviceZone: KOLKATA, axisMode: "zoom" })
      expect(hours(long.axis)).toEqual([9, 21])
    })
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
describe("the colours the screen gives to the day", () => {
  const mine = { meh: "#111111", solid: "#222222", deep: "#333333", flow: "#444444" }
  const score = { sessions: 3, shortSessions: 0, longestStretchMinutes: 90 }

  it("draws the pills in the colours it is given, by quality, and in the colours of day-view.html when it is given none", () => {
    const sessions = [session("09:00", 95, null), session("12:00", 40, null), session("15:00", 20, null), session("18:00", 5, null)]
    const given = buildDayView({ day: DAY, sessions, score, deviceZone: KOLKATA, qualityColors: mine })
    expect(given.bars.map((b) => b.quality)).toEqual(["flow", "deep", "solid", "meh"])
    expect(given.bars.map((b) => b.color)).toEqual(["#444444", "#333333", "#222222", "#111111"])
    const plain = buildDayView({ day: DAY, sessions, score, deviceZone: KOLKATA })
    expect(plain.bars.map((b) => b.color)).toEqual(plain.bars.map((b) => DAY_QUALITY_COLORS[b.quality]))
  })

  it("gives the legend in the order meh, solid, deep, flow, in the colours it is given", () => {
    expect(dayLegendFor(mine)).toEqual([
      { quality: "meh", label: "Meh", color: "#111111" },
      { quality: "solid", label: "Solid", color: "#222222" },
      { quality: "deep", label: "Deep", color: "#333333" },
      { quality: "flow", label: "Flow", color: "#444444" },
    ])
    expect(dayLegendFor(DAY_QUALITY_COLORS)).toEqual(DAY_LEGEND)
  })
})
describe("moving a day by some days", () => {
  it("goes back and forward inside a month", () => {
    expect(shiftDay("2026-10-21", -2)).toBe("2026-10-19")
    expect(shiftDay("2026-10-21", 0)).toBe("2026-10-21")
    expect(shiftDay("2026-10-21", 3)).toBe("2026-10-24")
  })

  it("goes over the end of a month and of a year, and over a leap day", () => {
    expect(shiftDay("2026-10-01", -1)).toBe("2026-09-30")
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28")
    expect(shiftDay("2028-03-01", -1)).toBe("2028-02-29")
    expect(shiftDay("2027-01-01", -1)).toBe("2026-12-31")
    expect(shiftDay("2026-12-31", 1)).toBe("2027-01-01")
  })

  it("refuses text that is not a day", () => {
    expect(() => shiftDay("21-10-2026", -1)).toThrow(/^BAD_LOCAL_DAY/)
    expect(() => shiftDay("2026-02-30", -1)).toThrow(/^BAD_LOCAL_DAY/)
    expect(() => shiftDay("", 1)).toThrow(/^BAD_LOCAL_DAY/)
  })
})

describe("the days of this week up to today", () => {
  const names = (today: string) => weekDaysUpTo(today).map((d) => d.short)
  const days = (today: string) => weekDaysUpTo(today).map((d) => d.day)

  it("on a Thursday is Monday, Tuesday, Wednesday and Thursday, and nothing before that Monday or after today", () => {
    expect(days("2026-10-22")).toEqual(["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22"])
    expect(names("2026-10-22")).toEqual(["Mon", "Tue", "Wed", "Thu"])
  })

  it("is Monday alone on a Monday", () => {
    expect(days("2026-10-19")).toEqual(["2026-10-19"])
    expect(weekDaysUpTo("2026-10-19")).toEqual([{ day: "2026-10-19", name: "Monday", short: "Mon", isToday: true }])
  })

  it("is the whole week on a Sunday (the week ends on Sunday, Monday is the first day)", () => {
    expect(names("2026-10-25")).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    expect(days("2026-10-25")[0]).toBe("2026-10-19")
  })

  it.each([
    ["2026-10-19", 1],
    ["2026-10-20", 2],
    ["2026-10-21", 3],
    ["2026-10-22", 4],
    ["2026-10-23", 5],
    ["2026-10-24", 6],
    ["2026-10-25", 7],
  ])("on %s there are %i day(s), the first is a Monday and the last is today", (today, count) => {
    const week = weekDaysUpTo(today)
    expect(week).toHaveLength(count)
    expect(week[0].name).toBe("Monday")
    expect(week[week.length - 1].day).toBe(today)
  })

  it("marks today, and only today", () => {
    const week = weekDaysUpTo("2026-10-22")
    expect(week.map((d) => d.isToday)).toEqual([false, false, false, true])
  })

  it("gives the full name and the three letters of each day", () => {
    expect(weekDaysUpTo("2026-10-21").map((d) => [d.name, d.short])).toEqual([
      ["Monday", "Mon"],
      ["Tuesday", "Tue"],
      ["Wednesday", "Wed"],
    ])
  })

  it("goes back over the end of a month, of a year and of a leap day", () => {
    expect(days("2026-10-01")).toEqual(["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01"])
    expect(days("2027-01-01")).toEqual(["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01"])
    expect(days("2028-03-02")).toEqual(["2028-02-28", "2028-02-29", "2028-03-01", "2028-03-02"])
  })

  it("never has a day before the Monday of its week, whatever the day is (one year of days)", () => {
    for (let n = 0; n < 366; n += 1) {
      const today = shiftDay("2026-01-01", n)
      const week = weekDaysUpTo(today)
      expect(week[0].name).toBe("Monday")
      expect(week[week.length - 1].day).toBe(today)
      expect(week.filter((d) => d.isToday)).toHaveLength(1)
      for (let i = 1; i < week.length; i += 1) expect(week[i].day).toBe(shiftDay(week[i - 1].day, 1))
    }
  })

  it("refuses text that is not a day", () => {
    expect(() => weekDaysUpTo("21-10-2026")).toThrow(/^BAD_LOCAL_DAY/)
    expect(() => weekDaysUpTo("2026-02-30")).toThrow(/^BAD_LOCAL_DAY/)
  })
})
// AB:OVERVIEW.TESTS:END
