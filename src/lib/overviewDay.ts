import { CONDITION_MINUTES, presetOfCondition, type OverviewCondition } from "@/lib/overviewCondition"
import type { DayScore, DaySession } from "@/lib/timerApi"
import { parseServerTimeMs, qualityOf, type Quality } from "@/lib/timerMaths"

// AB:OVERVIEW.DAY:START
// The plain values and functions behind "the whole day" view of the Overview (the full black screen with the Laser Flow beam, opened from "Today in Pro Timer"): they turn the saved sessions of one day into everything the screen draws, laid out as in day-view.html. No screen, no database and no sound here. It also says which days of this week the screen lets the person open (weekDaysUpTo, Monday to today). The sessions come from timerDaySessions and the numbers of the sentence from timerDayScore (both in timerApi.ts). See CONNECTIONS.md C62.

// The time axis runs from FROM to 24 o'clock in steps of 3 hours. It starts at 06 and only starts earlier (at 03 or 00) when a session or the wake time lies before 06, so nothing is ever drawn off the axis.
export const DAY_AXIS_START_HOUR = 6
export const DAY_AXIS_END_HOUR = 24
export const DAY_AXIS_STEP_HOURS = 3
// The zoomed axis (the screen draws it by default, "Full day" brings the axis above back): it runs from one hour before the first moment of the day to one hour after the last one, widened to whole steps of 3 hours, never shorter than 6 hours and never wider than the full axis.
export const DAY_AXIS_ZOOM_MARGIN_MINUTES = 60
export const DAY_AXIS_ZOOM_MIN_HOURS = 6

// The four colours of the quality of a session, as in day-view.html. They are written here once: the bars and the legend both take them from here. These are the colours of day-view.html and the default; the screen gives the colours of the condition instead (qualityColors of buildDayView and dayLegendFor). The names are the ones of qualityOf (timerMaths.ts), and the legend is in the order meh, solid, deep, flow.
export const DAY_QUALITY_COLORS: Record<Quality, string> = {
  meh: "#a0705c",
  solid: "#e8b062",
  deep: "#ff6a3c",
  flow: "#fff3de",
}
export type DayLegendItem = { quality: Quality; label: string; color: string }
// The legend in the order meh, solid, deep, flow, in the given colours (the screen gives the colours of the condition, overviewCondition.ts). DAY_LEGEND is the legend in the colours of day-view.html.
export function dayLegendFor(colors: Record<Quality, string>): DayLegendItem[] {
  return [
    { quality: "meh", label: "Meh", color: colors.meh },
    { quality: "solid", label: "Solid", color: colors.solid },
    { quality: "deep", label: "Deep", color: colors.deep },
    { quality: "flow", label: "Flow", color: colors.flow },
  ]
}
export const DAY_LEGEND: DayLegendItem[] = dayLegendFor(DAY_QUALITY_COLORS)

// The word for a session that has no tag (DECISIONS_TAGS.md section 4: "No tag"; a session saved without a tag is Freestyle or from before tags, and the two cannot be told apart).
export const NO_TAG_LABEL = "No tag"

export type DayTick = { hour: number; label: string; leftPercent: number }
export type DayAxis = { fromHour: number; toHour: number; ticks: DayTick[] }
// Which axis buildDayView draws: the full day (06 to 24, earlier when the day starts earlier) or the axis zoomed to the day's own window.
export type DayAxisMode = "full" | "zoom"
export type DayBar = {
  id: string
  quality: Quality
  color: string
  leftPercent: number
  widthPercent: number
  centerPercent: number
  minutes: number
  tagLabel: string
  label: string
}
export type DayTagSegment = { label: string; seconds: number; minutes: number }
export type DayWoke = { label: string; leftPercent: number }
export type DayView = {
  title: string
  sentence: string
  axis: DayAxis
  // True when the zoomed axis is shorter than the full one, so a switch between the two shows something; false for a day without a session and for a day that already fills the full axis.
  zoomable: boolean
  woke: DayWoke | null
  bars: DayBar[]
  tagBar: DayTagSegment[]
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"]

function twoDigits(n: number): string {
  return String(n).padStart(2, "0")
}

// The name of the weekday of a day text (YYYY-MM-DD): "2026-10-21" -> "Wednesday". The day text is the local day of the database (the column day), so the weekday is read from the date itself and no time zone is involved.
export function dayTitle(day: string): string {
  const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (hit === null) throw new Error("BAD_LOCAL_DAY: " + day)
  const ms = Date.UTC(Number(hit[1]), Number(hit[2]) - 1, Number(hit[3]))
  const probe = new Date(ms)
  if (probe.getUTCMonth() !== Number(hit[2]) - 1) throw new Error("BAD_LOCAL_DAY: " + day)
  return WEEKDAYS[probe.getUTCDay()]
}

// The week the whole day screen lets the person look at (Week view): this week only, from Monday to today. Monday is the first day of the week. Nothing before that Monday (no earlier week, no month) and nothing after today (the days that have not happened yet). On a Monday the week is Monday alone. Plain text in, plain values out: the days are day texts (YYYY-MM-DD, the local day of the database), so no time zone is involved here.
export type WeekDay = { day: string; name: string; short: string; isToday: boolean }

// A day text moved by a number of days (negative goes back): "2026-10-21", -2 -> "2026-10-19". It goes over month and year ends. Text that is not a day throws an Error that starts with BAD_LOCAL_DAY (the same check as dayTitle).
export function shiftDay(day: string, days: number): string {
  dayTitle(day)
  const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (hit === null) throw new Error("BAD_LOCAL_DAY: " + day)
  const moved = new Date(Date.UTC(Number(hit[1]), Number(hit[2]) - 1, Number(hit[3]) + days))
  return moved.toISOString().slice(0, 10)
}

// The days of this week up to today, in the order Monday first, today last. today is the local day (YYYY-MM-DD). short is the first three letters of the name (Mon, Tue ...). isToday is true for the last one only.
export function weekDaysUpTo(today: string): WeekDay[] {
  const sinceMonday = (WEEKDAYS.indexOf(dayTitle(today)) + 6) % 7
  const days: WeekDay[] = []
  for (let back = sinceMonday; back >= 0; back -= 1) {
    const day = shiftDay(today, -back)
    const name = dayTitle(day)
    days.push({ day, name, short: name.slice(0, 3), isToday: back === 0 })
  }
  return days
}

const clockFormats = new Map<string, Intl.DateTimeFormat>()

// Minutes since midnight (with the seconds as a fraction) of the moment ms on the clock of the time zone. A zone the browser does not know throws an Error that starts with BAD_TIME_ZONE.
export function clockMinutes(ms: number, timeZone: string): number {
  let format = clockFormats.get(timeZone)
  if (format === undefined) {
    try {
      format = new Intl.DateTimeFormat("en-GB", { timeZone, hourCycle: "h23", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    } catch {
      throw new Error("BAD_TIME_ZONE: " + timeZone)
    }
    clockFormats.set(timeZone, format)
  }
  const parts = format.formatToParts(new Date(ms))
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? Number.NaN)
  const total = pick("hour") * 60 + pick("minute") + pick("second") / 60
  if (!Number.isFinite(total)) throw new Error("BAD_CLOCK: " + ms)
  return total
}

// Minutes since midnight as the clock text "07:10" (whole minutes, rounded down).
export function clockText(minutes: number): string {
  const whole = Math.floor(minutes)
  return twoDigits(Math.floor(whole / 60)) + ":" + twoDigits(whole % 60)
}

// The axis for the earliest moment of the day (in minutes since midnight, null when there is none). It starts at 06 or, when the day starts earlier, at the 3 hour mark just before it.
export function dayAxis(earliestMinutes: number | null): DayAxis {
  let fromHour = DAY_AXIS_START_HOUR
  if (earliestMinutes !== null && earliestMinutes < DAY_AXIS_START_HOUR * 60) {
    fromHour = Math.max(0, Math.floor(earliestMinutes / 60 / DAY_AXIS_STEP_HOURS) * DAY_AXIS_STEP_HOURS)
  }
  return axisBetween(fromHour, DAY_AXIS_END_HOUR)
}

// An axis from one whole hour to another, with a mark at every step (the hours are multiples of DAY_AXIS_STEP_HOURS).
function axisBetween(fromHour: number, toHour: number): DayAxis {
  const ticks: DayTick[] = []
  for (let hour = fromHour; hour <= toHour; hour += DAY_AXIS_STEP_HOURS) {
    ticks.push({ hour, label: twoDigits(hour), leftPercent: ((hour - fromHour) / (toHour - fromHour)) * 100 })
  }
  return { fromHour, toHour, ticks }
}

// The axis zoomed to the window of the day: from one hour before the earliest moment (a session start or the wake time) to one hour after the latest one (a session end or the wake time), moved out to whole steps of 3 hours. It is never shorter than DAY_AXIS_ZOOM_MIN_HOURS (a short day gets room on the side where the day has less room) and never wider than the full axis of dayAxis, so it never reaches before the start of the full axis or past 24. Without a moment (a day without a session) it is the full axis. Both moments are minutes since midnight; a moment past 24:00 (a session over midnight) is held at 24.
export function zoomedDayAxis(earliestMinutes: number | null, latestMinutes: number | null): DayAxis {
  const full = dayAxis(earliestMinutes)
  if (earliestMinutes === null || latestMinutes === null) return full
  const step = DAY_AXIS_STEP_HOURS
  const early = earliestMinutes / 60
  const late = Math.min(latestMinutes / 60, full.toHour)
  const margin = DAY_AXIS_ZOOM_MARGIN_MINUTES / 60
  let fromHour = Math.max(full.fromHour, Math.floor((early - margin) / step) * step)
  let toHour = Math.min(full.toHour, Math.ceil((late + margin) / step) * step)
  while (toHour - fromHour < DAY_AXIS_ZOOM_MIN_HOURS) {
    const roomBefore = early - fromHour
    const roomAfter = toHour - late
    if (toHour < full.toHour && (fromHour <= full.fromHour || roomAfter <= roomBefore)) toHour += step
    else fromHour -= step
  }
  return axisBetween(fromHour, toHour)
}

// A moment (minutes since midnight) as a place on the axis, from 0 to 100 percent. A moment off the axis is held at the nearer end. Rounded to 3 decimals so the same day always gives the same text.
export function axisPercent(minutes: number, axis: DayAxis): number {
  const raw = (minutes / 60 - axis.fromHour) / (axis.toHour - axis.fromHour)
  return Math.round(Math.min(1, Math.max(0, raw)) * 100000) / 1000
}

// The line under the name of the day, in the words of day-view.html: "Four sessions. The longest stretch ran 52, and none lasted under ten." All three numbers come from the day score (the same ones the Overview panel shows, C60): the number of sessions, how many were under ten minutes, and the longest stretch (after the pauses and the cap, as the database counts it). A day without a session has one short line instead.
export function daySentence(score: Pick<DayScore, "sessions" | "shortSessions" | "longestStretchMinutes">): string {
  const n = score.sessions
  if (n <= 0) return "No session this day."
  const words = NUMBER_WORDS[n] ?? String(n)
  const longest = Math.max(1, Math.round(score.longestStretchMinutes))
  const short = score.shortSessions > 0 ? score.shortSessions + " lasted" : "none lasted"
  return words + " session" + (n === 1 ? "" : "s") + ". The longest stretch ran " + longest + ", and " + short + " under ten."
}

// The extra line under the sentence (Day screen idea 3): how far the day is from the NEXT level, as a fact and never a verdict. The levels are the conditions of C64: notEnough (Rose) is next to okay (Corona) at CONDITION_MINUTES.okayFrom, okay is next to good (Lagoon) at CONDITION_MINUTES.goodFrom; unknown has no next level and good is the top one, so both give no line (null), and so does a day whose minutes are not past zero or are already at the next level (the condition given and the minutes then disagree, and nothing is guessed). condition is the condition the day is DRAWN in (the screen's colours), creditedMinutes the day number of the day score (so it can differ from the total of the tag bar, which is why the words say \"about\"). The minutes are rounded to the nearest 5; under 5 it says \"Under 5\". isToday picks the wording: \"About 70 minutes to Corona.\" for today, which can still change, and \"About 70 minutes short of Corona.\" for a day that is over. The name of the level is the name of its look (Corona, Lagoon). It never replaces the sentence.
export const DAY_NOTE_ROUND_MINUTES = 5
export function dayNote(input: { condition: OverviewCondition; creditedMinutes: number | null; isToday: boolean }): string | null {
  const { condition, creditedMinutes, isToday } = input
  if (creditedMinutes === null || !Number.isFinite(creditedMinutes) || creditedMinutes <= 0) return null
  let target: number
  let next: OverviewCondition
  if (condition === "notEnough") {
    target = CONDITION_MINUTES.okayFrom
    next = "okay"
  } else if (condition === "okay") {
    target = CONDITION_MINUTES.goodFrom
    next = "good"
  } else {
    return null
  }
  const left = target - creditedMinutes
  if (left <= 0) return null
  const name = presetOfCondition(next)
  const level = name.charAt(0).toUpperCase() + name.slice(1)
  const amount = left < DAY_NOTE_ROUND_MINUTES ? "Under " + DAY_NOTE_ROUND_MINUTES : "About " + Math.round(left / DAY_NOTE_ROUND_MINUTES) * DAY_NOTE_ROUND_MINUTES
  return amount + " minutes " + (isToday ? "to " : "short of ") + level + "."
}

// Everything the day view draws, for one day. day is the local day (YYYY-MM-DD). sessions are the saved sessions of that day (any order; they are put in the order of their start). score is the day score of the same day. deviceZone is used for a session saved without a zone. wokeMinutes is the wake time in minutes since midnight, or null when it is not known: then no "Woke" mark is drawn (the app has no wake time yet, so nothing is guessed).
export function buildDayView(input: {
  day: string
  sessions: readonly DaySession[]
  score: Pick<DayScore, "sessions" | "shortSessions" | "longestStretchMinutes">
  deviceZone: string
  wokeMinutes?: number | null
  qualityColors?: Record<Quality, string>
  axisMode?: DayAxisMode
}): DayView {
  const woke = input.wokeMinutes ?? null
  const colors = input.qualityColors ?? DAY_QUALITY_COLORS
  const placed = input.sessions
    .map((session) => {
      const startMs = parseServerTimeMs(session.startedAt)
      const endMs = parseServerTimeMs(session.endedAt)
      const startMinutes = clockMinutes(startMs, session.tz ?? input.deviceZone)
      return { session, startMs, startMinutes, endMinutes: startMinutes + (endMs - startMs) / 60000 }
    })
    .sort((a, b) => a.startMs - b.startMs)

  // The axis: the full one by default (as in day-view.html), or the one zoomed to the window of the day (axisMode "zoom"). Both are worked out so the view can say whether a switch between them changes anything (zoomable).
  const moments = [...placed.flatMap((p) => [p.startMinutes, p.endMinutes]), ...(woke === null ? [] : [woke])]
  const earliest = moments.length === 0 ? null : Math.min(...moments)
  const latest = moments.length === 0 ? null : Math.max(...moments)
  const fullAxis = dayAxis(earliest)
  const zoomAxis = zoomedDayAxis(earliest, latest)
  const zoomable = zoomAxis.fromHour !== fullAxis.fromHour || zoomAxis.toHour !== fullAxis.toHour
  const axis = input.axisMode === "zoom" ? zoomAxis : fullAxis

  const bars = placed.map(({ session, startMinutes, endMinutes }): DayBar => {
    const quality = qualityOf(session.activeSeconds)
    const left = axisPercent(startMinutes, axis)
    const right = axisPercent(endMinutes, axis)
    const minutes = Math.round(session.activeSeconds / 60)
    const tagLabel = session.tag ?? NO_TAG_LABEL
    return {
      id: session.id,
      quality,
      color: colors[quality],
      leftPercent: left,
      widthPercent: Math.round((right - left) * 1000) / 1000,
      centerPercent: Math.round(((left + right) / 2) * 1000) / 1000,
      minutes,
      tagLabel,
      label: minutes + " \u00b7 " + tagLabel,
    }
  })

  // The seconds of each tag (no tag is one group of its own), the biggest first; two tags with the same seconds stay in the order of their first session.
  const totals = new Map<string | null, number>()
  for (const { session } of placed) totals.set(session.tag, (totals.get(session.tag) ?? 0) + session.activeSeconds)
  const tagBar = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, seconds]): DayTagSegment => ({ label: tag ?? NO_TAG_LABEL, seconds, minutes: Math.round(seconds / 60) }))

  return {
    title: dayTitle(input.day),
    sentence: daySentence(input.score),
    axis,
    zoomable,
    woke: woke === null ? null : { label: "Woke " + clockText(woke), leftPercent: axisPercent(woke, axis) },
    bars,
    tagBar,
  }
}
// AB:OVERVIEW.DAY:END
