import type { DayScore, DaySession } from "@/lib/timerApi"
import { parseServerTimeMs, qualityOf, type Quality } from "@/lib/timerMaths"

// AB:OVERVIEW.DAY:START
// The plain values and functions behind "the whole day" view of the Overview (the full black screen with the Laser Flow beam, opened from "Today in Pro Timer"): they turn the saved sessions of one day into everything the screen draws, laid out as in day-view.html. No screen, no database and no sound here. The sessions come from timerDaySessions and the numbers of the sentence from timerDayScore (both in timerApi.ts). See CONNECTIONS.md C62.

// The time axis runs from FROM to 24 o'clock in steps of 3 hours. It starts at 06 and only starts earlier (at 03 or 00) when a session or the wake time lies before 06, so nothing is ever drawn off the axis.
export const DAY_AXIS_START_HOUR = 6
export const DAY_AXIS_END_HOUR = 24
export const DAY_AXIS_STEP_HOURS = 3

// The four colours of the quality of a session, as in day-view.html. They are written here once: the bars and the legend both take them from here. The names are the ones of qualityOf (timerMaths.ts), and the legend is in the order meh, solid, deep, flow.
export const DAY_QUALITY_COLORS: Record<Quality, string> = {
  meh: "#a0705c",
  solid: "#e8b062",
  deep: "#ff6a3c",
  flow: "#fff3de",
}
export const DAY_LEGEND: { quality: Quality; label: string; color: string }[] = [
  { quality: "meh", label: "Meh", color: DAY_QUALITY_COLORS.meh },
  { quality: "solid", label: "Solid", color: DAY_QUALITY_COLORS.solid },
  { quality: "deep", label: "Deep", color: DAY_QUALITY_COLORS.deep },
  { quality: "flow", label: "Flow", color: DAY_QUALITY_COLORS.flow },
]

// The word for a session that has no tag (DECISIONS_TAGS.md section 4: "No tag"; a session saved without a tag is Freestyle or from before tags, and the two cannot be told apart).
export const NO_TAG_LABEL = "No tag"

export type DayTick = { hour: number; label: string; leftPercent: number }
export type DayAxis = { fromHour: number; toHour: number; ticks: DayTick[] }
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
  const toHour = DAY_AXIS_END_HOUR
  const ticks: DayTick[] = []
  for (let hour = fromHour; hour <= toHour; hour += DAY_AXIS_STEP_HOURS) {
    ticks.push({ hour, label: twoDigits(hour), leftPercent: ((hour - fromHour) / (toHour - fromHour)) * 100 })
  }
  return { fromHour, toHour, ticks }
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

// Everything the day view draws, for one day. day is the local day (YYYY-MM-DD). sessions are the saved sessions of that day (any order; they are put in the order of their start). score is the day score of the same day. deviceZone is used for a session saved without a zone. wokeMinutes is the wake time in minutes since midnight, or null when it is not known: then no "Woke" mark is drawn (the app has no wake time yet, so nothing is guessed).
export function buildDayView(input: {
  day: string
  sessions: readonly DaySession[]
  score: Pick<DayScore, "sessions" | "shortSessions" | "longestStretchMinutes">
  deviceZone: string
  wokeMinutes?: number | null
}): DayView {
  const woke = input.wokeMinutes ?? null
  const placed = input.sessions
    .map((session) => {
      const startMs = parseServerTimeMs(session.startedAt)
      const endMs = parseServerTimeMs(session.endedAt)
      const startMinutes = clockMinutes(startMs, session.tz ?? input.deviceZone)
      return { session, startMs, startMinutes, endMinutes: startMinutes + (endMs - startMs) / 60000 }
    })
    .sort((a, b) => a.startMs - b.startMs)

  const earliest = [...placed.map((p) => p.startMinutes), ...(woke === null ? [] : [woke])]
  const axis = dayAxis(earliest.length === 0 ? null : Math.min(...earliest))

  const bars = placed.map(({ session, startMinutes, endMinutes }): DayBar => {
    const quality = qualityOf(session.activeSeconds)
    const left = axisPercent(startMinutes, axis)
    const right = axisPercent(endMinutes, axis)
    const minutes = Math.round(session.activeSeconds / 60)
    const tagLabel = session.tag ?? NO_TAG_LABEL
    return {
      id: session.id,
      quality,
      color: DAY_QUALITY_COLORS[quality],
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
    woke: woke === null ? null : { label: "Woke " + clockText(woke), leftPercent: axisPercent(woke, axis) },
    bars,
    tagBar,
  }
}
// AB:OVERVIEW.DAY:END
