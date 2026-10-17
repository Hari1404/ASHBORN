import { supabase } from "@/lib/supabase"
import { parseServerTimeMs, type TimerRow } from "@/lib/timerMaths"

// AB:TIMER.API:START
// The calls from the app to the database functions of the Pro Timer (supabase/timer_schema.sql), and the reading of their answers.
// Every function here either gives an answer that was checked, or throws a TimerError with a name that the screen understands.
// What is tied to the SQL file: see CONNECTIONS.md C28 and C29. The tests are in src/lib/timerApi.test.ts.
// The day score (supabase/day_score.sql): timerDayScore asks for the number, the word and the readouts of one day and readDayScore checks the answer (CONNECTIONS.md C29 and C54).

// The error names that the database functions raise (raise exception 'NAME'). The screen reacts to each of them.
export const DATABASE_ERRORS = [
  "ALREADY_RUNNING",
  "NOT_RUNNING",
  "NOT_PAUSED",
  "DAY_ENDED",
  "BAD_TIMEZONE",
  "NOT_SIGNED_IN",
] as const

export type DatabaseError = (typeof DATABASE_ERRORS)[number]
export type TimerErrorKind = DatabaseError | "NO_CONNECTION" | "BAD_REPLY" | "NOT_READY" | "UNKNOWN"

export class TimerError extends Error {
  kind: TimerErrorKind
  constructor(kind: TimerErrorKind, detail = "") {
    super(detail === "" ? kind : kind + ": " + detail)
    this.name = "TimerError"
    this.kind = kind
  }
}

// A call that has not answered after this long counts as "no connection". The action may or may not have reached the server: the screen reads the state again before it shows anything.
export const REQUEST_TIMEOUT_MS = 15000

const NETWORK_WORDS = /failed to fetch|networkerror|network request failed|load failed|fetch failed|timed out|timeout|aborted|offline/i

export function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false
}

// Turns an error of the database client into one of our names. A name raised by a SQL function arrives as the message.
export function classifyError(error: { message?: unknown; code?: unknown } | null | undefined, online: boolean): TimerErrorKind {
  const message = typeof error?.message === "string" ? error.message : ""
  for (const name of DATABASE_ERRORS) {
    if (new RegExp("\\b" + name + "\\b").test(message)) return name
  }
  const code = typeof error?.code === "string" ? error.code : ""
  if (code === "PGRST301" || code === "PGRST303" || /\bjwt\b/i.test(message)) return "NOT_SIGNED_IN"
  if (!online || NETWORK_WORDS.test(message)) return "NO_CONNECTION"
  return "UNKNOWN"
}

// ---- Reading the answers (never trust the shape of what came back) ----
export type StateReply = { serverNowMs: number; row: TimerRow | null }
export type RunningReply = { serverNowMs: number; row: TimerRow }
export type EndReply = { serverNowMs: number; saved: boolean; capped: boolean; seconds: number | null; day: string | null }

// The six words of a day, as timer_day_word in supabase/day_score.sql writes them (CONNECTIONS.md C54). Any other word is refused.
export const DAY_WORDS = ["NO SESSION", "LIGHT", "BELOW USUAL", "USUAL", "ABOVE USUAL", "BIG"] as const
export type DayWord = (typeof DAY_WORDS)[number]

// The day score as timer_day_score sends it (twelve keys), with the names written the way the app writes them. The minutes are as sent (up to 3 decimals).
export type DayScore = {
  day: string
  creditedMinutes: number
  word: DayWord
  usualMinutes: number
  usualIsStandIn: boolean
  sessions: number
  shortSessions: number
  longestStretchMinutes: number
  countedMinutes: number
  countedOverElapsed: number | null
  unconfirmedMinutes: number
  overCapMinutes: number
}

function bad(detail: string): never {
  throw new TimerError("BAD_REPLY", detail)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readTimeMs(value: unknown, field: string): number {
  if (typeof value !== "string") return bad(field + " is not text")
  try {
    return parseServerTimeMs(value)
  } catch {
    return bad(field + " is not a time: " + value)
  }
}

function readTimeText(value: unknown, field: string): string {
  readTimeMs(value, field)
  return value as string
}

// One running session as timer_row_json sends it (the fields are the type TimerRow in timerMaths.ts, see C26).
export function readTimerRow(value: unknown): TimerRow {
  if (!isRecord(value)) return bad("the running session is not an object")
  const startedAt = readTimeText(value.started_at, "started_at")
  const capAt = readTimeText(value.cap_at, "cap_at")
  const tz = value.tz
  if (typeof tz !== "string" || tz === "") return bad("tz is not text")
  const status = value.status
  if (status !== "running" && status !== "paused") return bad("status is not running or paused")
  let pausedAt: string | null = null
  if (status === "paused") pausedAt = readTimeText(value.paused_at, "paused_at")
  else if (value.paused_at !== null) return bad("paused_at must be null while running")
  const pausedSeconds = value.paused_seconds
  if (typeof pausedSeconds !== "number" || !Number.isFinite(pausedSeconds) || pausedSeconds < 0) {
    return bad("paused_seconds is not a number of 0 or more")
  }
  return { started_at: startedAt, tz, status, paused_at: pausedAt, paused_seconds: pausedSeconds, cap_at: capAt }
}

// The answer of timer_state: the server time and the running session or null.
export function readStateReply(json: unknown): StateReply {
  if (!isRecord(json)) return bad("the answer is not an object")
  const serverNowMs = readTimeMs(json.server_now, "server_now")
  const row = json.running === null ? null : readTimerRow(json.running)
  return { serverNowMs, row }
}

// The answer of timer_start, timer_pause and timer_resume: the same shape, and a session must be in it.
export function readRunningReply(json: unknown): RunningReply {
  const reply = readStateReply(json)
  if (reply.row === null) return bad("there is no running session in the answer")
  return { serverNowMs: reply.serverNowMs, row: reply.row }
}

// The answer of timer_end. When the session was saved it holds the saved session.
export function readEndReply(json: unknown): EndReply {
  if (!isRecord(json)) return bad("the answer is not an object")
  const serverNowMs = readTimeMs(json.server_now, "server_now")
  if (typeof json.saved !== "boolean") return bad("saved is not true or false")
  if (typeof json.capped !== "boolean") return bad("capped is not true or false")
  if (!json.saved) {
    if (json.session !== null) return bad("session must be null when nothing was saved")
    return { serverNowMs, saved: false, capped: json.capped, seconds: null, day: null }
  }
  const session = json.session
  if (!isRecord(session)) return bad("session is missing")
  const seconds = session.active_seconds
  if (typeof seconds !== "number" || !Number.isInteger(seconds) || seconds < 0) return bad("active_seconds is not a whole number")
  const day = session.day
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return bad("day is not a date")
  return { serverNowMs, saved: true, capped: json.capped, seconds, day }
}

// The answer of timer_day_total: whole seconds saved on that day.
export function readDayTotal(json: unknown): number {
  if (typeof json !== "number" || !Number.isInteger(json) || json < 0) return bad("the day total is not a whole number of 0 or more")
  return json
}

function readNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return bad(field + " is not a number of 0 or more")
  return value
}

function readCount(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return bad(field + " is not a whole number of 0 or more")
  return value
}

// The answer of timer_day_score: the number, the word and the readouts of one day (the twelve keys of supabase/day_score.sql, see C54).
// The word NO SESSION and 0 sessions go together, and counted_over_elapsed is null exactly when the day has no session.
export function readDayScore(json: unknown): DayScore {
  if (!isRecord(json)) return bad("the answer is not an object")
  const day = json.day
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return bad("day is not a date")
  const word = DAY_WORDS.find((name) => name === json.word)
  if (word === undefined) return bad("word is not one of the six day words")
  const usualIsStandIn = json.usual_is_stand_in
  if (typeof usualIsStandIn !== "boolean") return bad("usual_is_stand_in is not true or false")
  const sessions = readCount(json.sessions, "sessions")
  const shortSessions = readCount(json.short_sessions, "short_sessions")
  if (shortSessions > sessions) return bad("short_sessions is more than sessions")
  if ((word === "NO SESSION") !== (sessions === 0)) return bad("the word and the number of sessions do not agree")
  const countedOverElapsed = json.counted_over_elapsed === null ? null : readNumber(json.counted_over_elapsed, "counted_over_elapsed")
  if ((countedOverElapsed === null) !== (sessions === 0)) return bad("counted_over_elapsed must be null exactly when there is no session")
  return {
    day,
    creditedMinutes: readNumber(json.credited_minutes, "credited_minutes"),
    word,
    usualMinutes: readNumber(json.usual_minutes, "usual_minutes"),
    usualIsStandIn,
    sessions,
    shortSessions,
    longestStretchMinutes: readNumber(json.longest_stretch_minutes, "longest_stretch_minutes"),
    countedMinutes: readNumber(json.counted_minutes, "counted_minutes"),
    countedOverElapsed,
    unconfirmedMinutes: readNumber(json.unconfirmed_minutes, "unconfirmed_minutes"),
    overCapMinutes: readNumber(json.over_cap_minutes, "over_cap_minutes"),
  }
}

// ---- The calls ----
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out after " + ms + " ms")), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function call(name: string, args?: Record<string, string>): Promise<unknown> {
  if (supabase === null) throw new TimerError("NOT_READY", "no database connection is set up")
  try {
    const { data, error } = await withTimeout(supabase.rpc(name, args), REQUEST_TIMEOUT_MS)
    if (error) throw new TimerError(classifyError(error, isOnline()), error.message)
    return data
  } catch (caught) {
    if (caught instanceof TimerError) throw caught
    throw new TimerError(classifyError({ message: String(caught) }, isOnline()), String(caught))
  }
}

// The time zone of this device, for example Asia/Kolkata. It is sent when a session starts and decides which day the session belongs to.
export function deviceTimeZone(): string {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (typeof zone !== "string" || zone === "") throw new TimerError("BAD_TIMEZONE", "this device gives no time zone")
  return zone
}

export async function timerState(): Promise<StateReply> {
  return readStateReply(await call("timer_state"))
}

export async function timerDayTotal(day: string): Promise<number> {
  return readDayTotal(await call("timer_day_total", { p_day: day }))
}

// The day score of one local day (the day text is YYYY-MM-DD). The answer of another day is refused.
export async function timerDayScore(day: string): Promise<DayScore> {
  const score = readDayScore(await call("timer_day_score", { p_day: day }))
  if (score.day !== day) return bad("the answer is for " + score.day + ", not for " + day)
  return score
}

export async function timerStart(zone: string): Promise<RunningReply> {
  return readRunningReply(await call("timer_start", { p_tz: zone }))
}

export async function timerPause(): Promise<RunningReply> {
  return readRunningReply(await call("timer_pause"))
}

export async function timerResume(): Promise<RunningReply> {
  return readRunningReply(await call("timer_resume"))
}

export async function timerEnd(): Promise<EndReply> {
  return readEndReply(await call("timer_end"))
}
// AB:TIMER.API:END
