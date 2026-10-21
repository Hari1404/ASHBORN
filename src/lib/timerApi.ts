import { supabase } from "@/lib/supabase"
import { parseServerTimeMs, type TimerRow } from "@/lib/timerMaths"

// AB:TIMER.API:START
// The calls from the app to the database functions of the Pro Timer (supabase/timer_schema.sql), and the reading of their answers.
// Every function here either gives an answer that was checked, or throws a TimerError with a name that the screen understands.
// What is tied to the SQL file: see CONNECTIONS.md C28 and C29. The tests are in src/lib/timerApi.test.ts.
// The day score (supabase/day_score.sql): timerDayScore asks for the number, the word and the readouts of one day and readDayScore checks the answer (CONNECTIONS.md C29 and C54).
// The tags (supabase/timer_schema.sql, Packets 10A and 10B): timerTagList, timerTagAdd, timerTagRename and timerTagArchive call the four tag functions, readTag and readTagList check their answers, and timerStart can send the tag chosen before Start. The last four names of DATABASE_ERRORS come from these functions. Since Packet 10E the database also counts how much each tag was used in the last 30 days (timer_tag_use): timerTagUse calls it, readTagUse checks the answer and orderTagsByUse puts the tags in the order of their use. No screen uses the calls yet (CONNECTIONS.md C28, C29, C55 and C58).
// The sessions of one day (the day view, CONNECTIONS.md C61): timerDaySessions reads the saved sessions and the names of their tags straight from the tables timer_sessions and timer_tags (select rights and policies are in supabase/timer_schema.sql; no SQL function, no new SQL), and readDaySessionRows and joinDayTags check what came back.

// The error names that the database functions raise (raise exception 'NAME'). The screen reacts to each of them.
export const DATABASE_ERRORS = [
  "ALREADY_RUNNING",
  "NOT_RUNNING",
  "NOT_PAUSED",
  "DAY_ENDED",
  "BAD_TIMEZONE",
  "NOT_SIGNED_IN",
  "BAD_TAG_NAME",
  "TAG_NAME_TAKEN",
  "TAG_LIMIT",
  "TAG_NOT_FOUND",
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

// One saved session of a day, as the day view draws it (CONNECTIONS.md C61). The times are the texts the database sent. tz is the zone the session started in (null for a session saved before Packet 09A). pauses is the pause log ([] for no pause, and for a session saved before Packet 09A). tag is the name the tag has now (also when it was archived since), null for Freestyle.
export type DayPause = { from: string; to: string }
export type DaySession = {
  id: string
  startedAt: string
  endedAt: string
  activeSeconds: number
  tz: string | null
  pauses: DayPause[]
  tag: string | null
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

// One running session as timer_row_json sends it (the fields are the type TimerRow in timerMaths.ts, see C26). The key tag is null or missing for no tag and otherwise {id, name} (Packet 10C1, see C55); the row that is given back has the key tag only when there is a tag.
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
  const tag = readRowTag(value.tag)
  const row: TimerRow = { started_at: startedAt, tz, status, paused_at: pausedAt, paused_seconds: pausedSeconds, cap_at: capAt }
  return tag === null ? row : { ...row, tag }
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

// One tag as the four tag functions send it: {id, name}. The id must look like an id (a uuid) and the name must be text that is not empty. Any other key is left out. The rules of a name (1 to 20 characters, not Freestyle) are checked by the database, not here.
export type TimerTag = { id: string; name: string }

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function readTag(json: unknown): TimerTag {
  if (!isRecord(json)) return bad("the tag is not an object")
  const id = json.id
  if (typeof id !== "string" || !UUID_SHAPE.test(id)) return bad("the tag id is not an id")
  const name = json.name
  if (typeof name !== "string" || name === "") return bad("the tag name is not text")
  return { id, name }
}

// The answer of timer_tag_list: the live tags of the person, oldest first. The order is kept. An empty list is fine. The same tag twice is refused.
export function readTagList(json: unknown): TimerTag[] {
  if (!Array.isArray(json)) return bad("the tag list is not a list")
  const tags = json.map((item) => readTag(item))
  if (new Set(tags.map((tag) => tag.id.toLowerCase())).size !== tags.length) return bad("the tag list holds the same tag twice")
  return tags
}

// The key tag of a running session (Packet 10C1): null, or no key at all (as the database sent it before Packet 10C1), means no tag. Anything else must be a tag {id, name} as readTag reads it (an id that looks like an id, a name that is text and not empty), or the answer is BAD_REPLY. It gives null for no tag.
function readRowTag(value: unknown): TimerTag | null {
  if (value === undefined || value === null) return null
  return readTag(value)
}

// One row of the use of a tag as timer_tag_use sends it (Packet 10E): the id of a live tag and its seconds of use in the last 30 days (0 when it was not used). Any other key is left out. The 30 days are counted by the database, not here.
export type TagUse = { id: string; seconds: number }

// The answer of timer_tag_use: one row for each live tag of the person, oldest first. The order is kept. An empty list is fine. Each id must look like an id, each number of seconds must be a whole number of 0 or more, and the same tag twice (also when only the capitals of the id differ) is refused.
export function readTagUse(json: unknown): TagUse[] {
  if (!Array.isArray(json)) return bad("the tag use is not a list")
  const rows = json.map((item): TagUse => {
    if (!isRecord(item)) return bad("a row of the tag use is not an object")
    const id = item.id
    if (typeof id !== "string" || !UUID_SHAPE.test(id)) return bad("the tag id in the tag use is not an id")
    const seconds = item.seconds
    if (typeof seconds !== "number" || !Number.isSafeInteger(seconds) || seconds < 0) return bad("the seconds of a tag are not a whole number of 0 or more")
    return { id, seconds }
  })
  if (new Set(rows.map((row) => row.id.toLowerCase())).size !== rows.length) return bad("the tag use holds the same tag twice")
  return rows
}

// Puts the tags in the order of their use (DECISIONS_TAGS.md section 4b, point 2): the tag with the most seconds first; tags with the same seconds (also none) stay in the order of tags (oldest first, as the database sends them). A tag that has no row in use counts 0 seconds, a row for a tag that is not in tags is ignored, and ids that differ only in capitals are the same id. If a row comes twice, the first one counts. It gives a NEW list (the tags in it are the same objects) and changes neither argument.
export function orderTagsByUse(tags: TimerTag[], use: TagUse[]): TimerTag[] {
  const seconds = new Map<string, number>()
  for (const row of use) {
    const key = row.id.toLowerCase()
    if (!seconds.has(key)) seconds.set(key, row.seconds)
  }
  return tags
    .map((tag, index) => ({ tag, index, seconds: seconds.get(tag.id.toLowerCase()) ?? 0 }))
    .sort((a, b) => b.seconds - a.seconds || a.index - b.index)
    .map((item) => item.tag)
}

// The columns of timer_sessions that the day view reads: one list, tied to the SQL file (CONNECTIONS.md C61).
export const DAY_SESSION_COLUMNS = "id, started_at, ended_at, active_seconds, pauses, tz, tag_id"

// A session as the table sends it, with the tag still only an id (joinDayTags puts the name in).
export type DaySessionRow = Omit<DaySession, "tag"> & { tagId: string | null }

function readPause(value: unknown): DayPause {
  if (!isRecord(value)) return bad("a pause is not an object")
  const from = readTimeText(value.from, "pause from")
  const to = readTimeText(value.to, "pause to")
  if (readTimeMs(to, "pause to") < readTimeMs(from, "pause from")) return bad("a pause ends before it begins")
  return { from, to }
}

// The rows of timer_sessions for one day. An empty list is fine. A row that is not what the table promises is refused: the whole day is refused, nothing is guessed. A missing pause log (a session saved before Packet 09A) is [] and a missing zone is null.
export function readDaySessionRows(json: unknown): DaySessionRow[] {
  if (!Array.isArray(json)) return bad("the sessions are not a list")
  const seen = new Set<string>()
  return json.map((item): DaySessionRow => {
    if (!isRecord(item)) return bad("a session is not an object")
    const id = item.id
    if (typeof id !== "string" || !UUID_SHAPE.test(id)) return bad("the session id is not an id")
    if (seen.has(id.toLowerCase())) return bad("the sessions hold the same session twice")
    seen.add(id.toLowerCase())
    const startedAt = readTimeText(item.started_at, "started_at")
    const endedAt = readTimeText(item.ended_at, "ended_at")
    if (readTimeMs(endedAt, "ended_at") <= readTimeMs(startedAt, "started_at")) return bad("a session ends before it begins")
    const active = item.active_seconds
    if (typeof active !== "number" || !Number.isInteger(active) || active < 0) return bad("active_seconds is not a whole number of 0 or more")
    const zone = item.tz
    if (zone !== null && zone !== undefined && (typeof zone !== "string" || zone === "")) return bad("tz is not text")
    let pauses: DayPause[] = []
    if (item.pauses !== null && item.pauses !== undefined) {
      if (!Array.isArray(item.pauses)) return bad("pauses is not a list")
      pauses = item.pauses.map(readPause)
    }
    const tagId = item.tag_id
    if (tagId !== null && tagId !== undefined && (typeof tagId !== "string" || !UUID_SHAPE.test(tagId))) return bad("tag_id is not an id")
    return { id, startedAt, endedAt, activeSeconds: active, tz: zone ?? null, pauses, tagId: tagId ?? null }
  })
}

// Puts the name of the tag into every session. A session without a tag stays null (Freestyle). A tag id that was not sent is refused: the name is never guessed.
export function joinDayTags(rows: DaySessionRow[], tags: TimerTag[]): DaySession[] {
  const names = new Map(tags.map((tag) => [tag.id.toLowerCase(), tag.name]))
  return rows.map(({ tagId, ...rest }): DaySession => {
    if (tagId === null) return { ...rest, tag: null }
    const name = names.get(tagId.toLowerCase())
    if (name === undefined) return bad("the tag of a session was not sent")
    return { ...rest, tag: name }
  })
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

// A plain read of a table, with the same waiting time and the same error names as call() (call is for the database functions).
async function readTable(request: PromiseLike<{ data: unknown; error: { message?: unknown; code?: unknown } | null }>): Promise<unknown> {
  try {
    const { data, error } = await withTimeout(request, REQUEST_TIMEOUT_MS)
    if (error) throw new TimerError(classifyError(error, isOnline()), String(error.message ?? ""))
    return data
  } catch (caught) {
    if (caught instanceof TimerError) throw caught
    throw new TimerError(classifyError({ message: String(caught) }, isOnline()), String(caught))
  }
}

const DAY_TEXT = /^\d{4}-\d{2}-\d{2}$/

// The saved sessions of one local day (the day text is YYYY-MM-DD), earliest first, each with the name of its tag. It is the same set of sessions that timer_day_score counts for that day (the column day). The tags are asked for only when a session has one.
export async function timerDaySessions(day: string): Promise<DaySession[]> {
  if (!DAY_TEXT.test(day)) throw new TimerError("UNKNOWN", "the day is not YYYY-MM-DD: " + day)
  if (supabase === null) throw new TimerError("NOT_READY", "no database connection is set up")
  const rows = readDaySessionRows(
    await readTable(
      supabase.from("timer_sessions").select(DAY_SESSION_COLUMNS).eq("day", day).order("started_at", { ascending: true }),
    ),
  )
  const ids = [...new Set(rows.flatMap((row) => (row.tagId === null ? [] : [row.tagId])))]
  if (ids.length === 0) return joinDayTags(rows, [])
  const tags = readTagList(await readTable(supabase.from("timer_tags").select("id, name").in("id", ids)))
  return joinDayTags(rows, tags)
}

// The tag is the id of one of the person's live tags, or null for Freestyle (no tag). With null, or with the argument left out, nothing is sent for the tag: the call is the same as it was before tags.
export async function timerStart(zone: string, tagId: string | null = null): Promise<RunningReply> {
  if (tagId === null) return readRunningReply(await call("timer_start", { p_tz: zone }))
  return readRunningReply(await call("timer_start", { p_tz: zone, p_tag_id: tagId }))
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
// ---- The tags (the five tag functions of supabase/timer_schema.sql, see CONNECTIONS.md C55 and C58) ----
// The live tags of the signed-in person, oldest first.
export async function timerTagList(): Promise<TimerTag[]> {
  return readTagList(await call("timer_tag_list"))
}

// How much each live tag was used in the last 30 days: one row {id, seconds} for each live tag, oldest first (Packet 10E). It only reads. The order of the tags by use is made by orderTagsByUse.
export async function timerTagUse(): Promise<TagUse[]> {
  return readTagUse(await call("timer_tag_use"))
}

// A new tag. The name is sent as typed: the database cuts the spaces at both ends and checks the rules (BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT). If an archived tag has that name, the newest one comes back with its old id.
export async function timerTagAdd(name: string): Promise<TimerTag> {
  return readTag(await call("timer_tag_add", { p_name: name }))
}

// A new name for a live tag (TAG_NOT_FOUND when it is not the person's own or is archived). The answer of another tag is refused.
export async function timerTagRename(id: string, name: string): Promise<TimerTag> {
  const tag = readTag(await call("timer_tag_rename", { p_id: id, p_name: name }))
  if (tag.id.toLowerCase() !== id.toLowerCase()) return bad("the answer is for another tag")
  return tag
}

// The tag leaves the list: it is archived, never deleted. The answer of another tag is refused.
export async function timerTagArchive(id: string): Promise<TimerTag> {
  const tag = readTag(await call("timer_tag_archive", { p_id: id }))
  if (tag.id.toLowerCase() !== id.toLowerCase()) return bad("the answer is for another tag")
  return tag
}
// AB:TIMER.API:END
