import type { DayWord } from "@/lib/timerApi"
import { localDay } from "@/lib/timerMaths"

// AB:OVERVIEW.HUD:START
// The plain values and functions behind the two things that sit on the Overview screen: the countdown to April 14 (top right) and "Today in Pro Timer" (bottom). No screen, no database and no sound here. The screen is src/components/OverviewHud.tsx. See CONNECTIONS.md C60.

// The date of the countdown: the next April 14, counted in whole days in the person's own time zone. On April 14 itself it is 0, and from April 15 on it counts to April 14 of the next year.
export const COUNTDOWN_NAME = "April 14"

// How often the screen asks again for the day and works out the countdown again. The countdown also changes at local midnight this way, with the next tick at most a minute late.
export const HUD_REFRESH_MS = 60_000

function dayNumber(text: string): number {
  const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (hit === null) throw new Error("BAD_LOCAL_DAY: " + text)
  return Math.round(Date.UTC(Number(hit[1]), Number(hit[2]) - 1, Number(hit[3])) / 86_400_000)
}

// Whole days from the local day of the moment ms (in the time zone) to the next April 14. Never negative.
export function daysUntilApril14(ms: number, timeZone: string): number {
  const today = localDay(ms, timeZone)
  const year = Number(today.slice(0, 4))
  const todayNumber = dayNumber(today)
  const thisYear = dayNumber(year + "-04-14")
  const target = todayNumber <= thisYear ? thisYear : dayNumber(year + 1 + "-04-14")
  return target - todayNumber
}

// The line under the number of the countdown.
export function countdownCaption(days: number): string {
  if (days === 0) return "It is " + COUNTDOWN_NAME
  if (days === 1) return "day to " + COUNTDOWN_NAME
  return "days to " + COUNTDOWN_NAME
}

// Minutes (as the day score sends them, with decimals) as whole hours and whole minutes. Rounded once, here, only for display.
export function minutesParts(minutes: number): { hours: number; minutes: number } {
  const total = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 0
  return { hours: Math.floor(total / 60), minutes: total % 60 }
}

// A span of minutes as text: "45m", "2h" or "1h 12m".
export function formatSpan(minutes: number): string {
  const parts = minutesParts(minutes)
  if (parts.hours === 0) return parts.minutes + "m"
  if (parts.minutes === 0) return parts.hours + "h"
  return parts.hours + "h " + parts.minutes + "m"
}

// The six words of the day in plain sentence case (the database writes them in capitals, see CONNECTIONS.md C54).
export const DAY_WORD_TEXT: Record<DayWord, string> = {
  "NO SESSION": "No session",
  LIGHT: "Light",
  "BELOW USUAL": "Below usual",
  USUAL: "Usual",
  "ABOVE USUAL": "Above usual",
  BIG: "Big",
}

// Counted minutes divided by elapsed minutes of the day, as a whole percent from 0 to 100. null when the day has no session.
export function focusPercent(ratio: number | null): number | null {
  if (ratio === null || !Number.isFinite(ratio)) return null
  return Math.max(0, Math.min(100, Math.round(ratio * 100)))
}
// AB:OVERVIEW.HUD:END
