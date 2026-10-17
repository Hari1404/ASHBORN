// AB:TIMER.MATHS:START
// The Pro Timer maths. Pure functions: no screen, no database call, no clock of its own.
// Every time comes in as a number (milliseconds) or as the text the database sends.
// What is shared with the database: see CONNECTIONS.md C26. The cut-offs and the tests: see CONNECTIONS.md C27.
// The automated tests are in src/lib/timerMaths.test.ts. Run them with: npm test

// ---- The numbers that decide things. A change here also changes the tests (C27). ----
export const MIN_SESSION_SECONDS = 60
export const SOLID_FROM_SECONDS = 600
export const DEEP_FROM_SECONDS = 1800
export const FLOW_FROM_SECONDS = 5400
export const GO_BACK_IN_LIMIT_SECONDS = 2700
export const MILESTONE_MINUTES = [15, 25, 45, 60, 90, 120, 150, 180] as const
export const MAX_LIVE_STEP_SECONDS = 10
export const MILESTONE_KEEP_SECONDS = 600
export const MILESTONE_EARLIER_FROM_SECONDS = 300
export const RING_LOOP_SECONDS = 3600
export const RING_FIRST_COLOR = "#ffffff"
export const NEON_COLORS = [
  "#39ff14",
  "#00f0ff",
  "#ff2bd6",
  "#fff200",
  "#ff7a00",
  "#b026ff",
  "#ff2a55",
] as const

// ---- Types ----
export type Quality = "meh" | "solid" | "deep" | "flow"

// The tag of a running session as timer_row_json sends it: its id and the name it has now (Packet 10C1, see C26 and C55).
export type RowTag = { id: string; name: string }

// One running session, exactly as the database function timer_state sends it (see C26). The key tag is only there when the session has a tag: no key means Freestyle (no tag). The maths never use it.
export type TimerRow = {
  started_at: string
  tz: string
  status: "running" | "paused"
  paused_at: string | null
  paused_seconds: number
  cap_at: string
  tag?: RowTag
}

// What is waiting at this moment: the milestone to show (null for none), how many seconds late it is, and the list of the milestones that are done (shown or given up).
export type MilestoneWaiting = { minute: number | null; lateSeconds: number; handled: number[] }

// ---- Whole seconds and the clock text ----
// Anything that is not a finite number above 0 counts as 0. Otherwise the fraction is cut off (floor), never rounded.
export function wholeSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.floor(value)
}

function twoDigits(n: number): string {
  return String(n).padStart(2, "0")
}

// 3725 seconds -> "01:02:05". Hours are not capped.
export function formatClock(seconds: number): string {
  const s = wholeSeconds(seconds)
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  return twoDigits(hours) + ":" + twoDigits(minutes) + ":" + twoDigits(s % 60)
}

// ---- The 60 second rule, quality, GO BACK IN ----
export function isSessionCounted(seconds: number): boolean {
  return wholeSeconds(seconds) >= MIN_SESSION_SECONDS
}

export function qualityOf(seconds: number): Quality {
  const s = wholeSeconds(seconds)
  if (s >= FLOW_FROM_SECONDS) return "flow"
  if (s >= DEEP_FROM_SECONDS) return "deep"
  if (s >= SOLID_FROM_SECONDS) return "solid"
  return "meh"
}

// GO BACK IN is offered only for a session shorter than 45 minutes.
export function canGoBackIn(seconds: number): boolean {
  return wholeSeconds(seconds) < GO_BACK_IN_LIMIT_SECONDS
}

// ---- Times from the database ----
const SERVER_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}(?::?\d{2})?)$/

// "2026-10-06T09:30:00.123456+00:00" -> milliseconds since 1970 (the microseconds become a fraction of a millisecond).
// Written by hand so that every browser reads the same text the same way. Bad text throws an Error that starts with BAD_SERVER_TIME.
export function parseServerTimeMs(text: string): number {
  const m = SERVER_TIME.exec(text.trim())
  if (m === null) throw new Error("BAD_SERVER_TIME: " + text)
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const hour = Number(m[4])
  const minute = Number(m[5])
  const second = Number(m[6])
  const fraction = m[7] ?? ""
  const zone = m[8] ?? "Z"
  // A date that does not exist (month 0 or 13, day 0, 31 in a 30 day month) rolls over into another month here, so the month no longer matches.
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    year < 1970 ||
    probe.getUTCMonth() !== month - 1 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new Error("BAD_SERVER_TIME: " + text)
  }
  let offsetMinutes = 0
  if (zone !== "Z") {
    const digits = zone.slice(1).replace(":", "")
    const zoneMinutes = Number(digits.slice(0, 2)) * 60 + (digits.length > 2 ? Number(digits.slice(2, 4)) : 0)
    offsetMinutes = zone.startsWith("-") ? -zoneMinutes : zoneMinutes
  }
  const wholeMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60000
  const micros = Number((fraction + "000000").slice(0, 6))
  return wholeMs + micros / 1000
}

// All counting below is done in whole microseconds, because the database counts in microseconds.
function toMicros(ms: number): number {
  return Math.round(ms * 1000)
}

// The server time now, estimated from the server time at the last read and the time that has passed on this device since.
// A device clock that jumps backwards never makes the estimate go backwards.
export function estimateServerNowMs(serverNowAtReadMs: number, localAtReadMs: number, localNowMs: number): number {
  return serverNowAtReadMs + Math.max(0, localNowMs - localAtReadMs)
}

// ---- The running session ----
// Whole seconds the session has counted. This copies what the database function timer_end counts (see C26):
// the end is the smaller of now and cap_at (local midnight); a paused session counts up to paused_at only;
// then whole seconds of (that moment minus started_at minus paused_seconds), never below 0.
export function activeSeconds(row: TimerRow, serverNowMs: number): number {
  const started = toMicros(parseServerTimeMs(row.started_at))
  const cap = toMicros(parseServerTimeMs(row.cap_at))
  const end = Math.min(toMicros(serverNowMs), cap)
  let reference = end
  if (row.status === "paused") {
    if (row.paused_at === null) throw new Error("BAD_ROW: paused without paused_at")
    reference = Math.min(toMicros(parseServerTimeMs(row.paused_at)), end)
  }
  const activeMicros = reference - started - Math.round(row.paused_seconds * 1000000)
  return Math.floor(Math.max(0, activeMicros) / 1000000)
}

// True when local midnight has been reached (the database then refuses pause and resume with DAY_ENDED).
export function dayHasEnded(row: TimerRow, serverNowMs: number): boolean {
  return toMicros(serverNowMs) >= toMicros(parseServerTimeMs(row.cap_at))
}

// ---- The day ----
// The date (YYYY-MM-DD) in the person's own time zone, never the UTC date. Same rule as the database (see C26).
export function localDay(ms: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(ms))
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const text = pick("year") + "-" + pick("month") + "-" + pick("day")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("BAD_LOCAL_DAY: " + text)
  return text
}

// Saved seconds of the day plus the running session, each cut to whole seconds first so that nothing drifts.
// The running session counts from its first second. If it ends under 60 seconds the database does not save it and the total goes back down.
export function dayTotalSeconds(savedSeconds: number, runningSeconds: number | null): number {
  const saved = wholeSeconds(savedSeconds)
  if (runningSeconds === null) return saved
  return saved + wholeSeconds(runningSeconds)
}

// ---- Milestone messages ----
// A milestone message waits for the person. It is not lost when nobody looks: it is shown the moment the person looks again, up to MILESTONE_KEEP_SECONDS (10 minutes) after the milestone. After that it is given up and never shown (a message that was not seen in time has lost its value).
// Call milestoneWaiting on every tick with the seconds now and the milestones that are done. It gives the newest milestone that is still waiting and still fresh, how late it is, and the new list of the done ones (the ones that were too old are now in it).
// Older milestones that are still waiting when a newer one is due are given up by milestoneDone, so only the newest message is shown.
// Late seconds are seconds of the session clock (what the big clock shows), so the tag always agrees with the clock.
export function milestoneWaiting(currentSeconds: number, handled: readonly number[]): MilestoneWaiting {
  const now = wholeSeconds(currentSeconds)
  const open = MILESTONE_MINUTES.filter((m) => m * 60 <= now && !handled.includes(m))
  const fresh = open.filter((m) => now - m * 60 <= MILESTONE_KEEP_SECONDS)
  const minute = fresh.length > 0 ? fresh[fresh.length - 1] : null
  return {
    minute,
    lateSeconds: minute === null ? 0 : now - minute * 60,
    handled: MILESTONE_MINUTES.filter((m) => handled.includes(m) || (m * 60 <= now && !fresh.includes(m))),
  }
}

// The list of done milestones after the message of this milestone was shown: this one and every older one are done.
export function milestoneDone(minute: number, handled: readonly number[]): number[] {
  return MILESTONE_MINUTES.filter((m) => handled.includes(m) || m <= minute)
}

// The number on the tag "N min earlier": whole minutes, and only when the message is MILESTONE_EARLIER_FROM_SECONDS (5 minutes) or more late. Under that there is no tag.
export function earlierMinutes(lateSeconds: number): number | null {
  const late = wholeSeconds(lateSeconds)
  return late >= MILESTONE_EARLIER_FROM_SECONDS ? Math.floor(late / 60) : null
}

// True when the message is shown within one normal step of its milestone. Only then is the line about the glowing ball true (it speaks of the moment of the milestone).
export function milestoneOnTime(lateSeconds: number): boolean {
  return wholeSeconds(lateSeconds) <= MAX_LIVE_STEP_SECONDS
}

// ---- The hour ring ----
// Which loop of the ring the session is in (0 = the first hour) and how full the current loop is (0 up to just under 1).
export function ringLoop(seconds: number): number {
  return Math.floor(wholeSeconds(seconds) / RING_LOOP_SECONDS)
}

export function ringFill(seconds: number): number {
  return (wholeSeconds(seconds) % RING_LOOP_SECONDS) / RING_LOOP_SECONDS
}

function seedToNumber(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function randomFromSeed(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// The colour of one loop. Loop 0 is white. Every later loop gets a neon colour chosen by a seeded random draw
// that skips the colour of the loop before it, so two loops in a row never share a colour.
// The same seed (use the started_at text of the session) always gives the same colours, so a reload or a second device shows the same ring.
export function ringColor(loop: number, seed: string): string {
  const count = Math.floor(wholeSeconds(loop))
  if (count === 0) return RING_FIRST_COLOR
  const random = randomFromSeed(seedToNumber(seed))
  let color: string = RING_FIRST_COLOR
  for (let i = 1; i <= count; i++) {
    const options = NEON_COLORS.filter((c) => c !== color)
    color = options[Math.floor(random() * options.length)]
  }
  return color
}
// AB:TIMER.MATHS:END
