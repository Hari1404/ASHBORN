# PACKET 05C: PRO TIMER SCREEN (database calls, live state, the screen at #timer)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Create or edit ONLY these files: nine NEW files (`src/lib/timerApi.ts`, `src/lib/useTimer.ts`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/SignedInStub.test.tsx`), ONE edited file (`src/components/SignedInStub.tsx`, three small additions in Step 7), and `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. The npm command in Step 1 also changes `package.json` and `package-lock.json`. Nothing else.
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/SignedInStub.tsx` must have NO uncommitted changes when you start (Step 0 checks this). If it has some: **STOP** (Step 0 says what to report).
- `src/components/HoldButton.tsx` is a library component: never open it for editing and never change it.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, or any install other than the one in Step 1. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 13 is allowed.
- Every "replace" or "add" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
This is the first screen of the Pro Timer. It adds three pieces of code and their tests. (1) `src/lib/timerApi.ts`: the calls from the app to the six Pro Timer functions in the database (timer_state, timer_day_total, timer_start, timer_pause, timer_resume, timer_end), the checking of every answer, and the turning of the database error names into names the screen understands. (2) `src/lib/useTimer.ts`: the live state of the screen as a React hook; it works out the seconds from the stored times (never by counting ticks), reads the database again every 30 seconds and when the page comes back, runs the buttons, shows "No connection" when the call gets no answer, and applies the midnight rule. (3) `src/components/TimerScreen.tsx` and `src/timer.css`: the screen at the page address `#timer`, on a plain black background: the big clock of the session inside the hour ring, the small clock with the day total under it, a white Start / Pause / Resume button, and End Session as the React Bits Hold Button (hold it for 1.5 seconds). The screen uses the font Space Grotesk with fixed-width digits. SignedInStub.tsx gets three small additions so that the menu item Pro Timer shows this screen; the other three menu items keep the placeholder. The tests (407 in total after this packet, 227 of them new) need the test environment `jsdom`, which Step 1 installs (exact version 30.1.2). It records the new code in the code map and six new connections (C28 to C33) in the connections list. The stop alert, the milestone messages and the day-ended screen are NOT part of this packet (they come in 05D and 05E).

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `supabase/timer_schema.sql`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `src/lib/screens.ts`, `src/lib/supabase.ts`, `src/lib/lite.ts`, `src/components/HoldButton.tsx`, `src/components/AppMenu.tsx`, `src/components/SignedInStub.tsx`. If any is missing: **STOP** and report which.

Check that none of the nine new files exist: `src/lib/timerApi.ts`, `src/lib/useTimer.ts`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/SignedInStub.test.tsx`. If any exists: **STOP** and report which.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 19 tags, 27 places
CONNECTIONS OK: 27 connections, 122 anchors, 21 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If `src/components/SignedInStub.tsx` shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- src/components/SignedInStub.tsx`. Do not commit, restore or edit anything. (This packet edits that file and commits it, so it must be clean first. The owner settles it.)
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Then run these read-only commands. Do NOT stop on their results unless a line below says so, and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. `npm ls vitest @fontsource-variable/space-grotesk --depth=0`
6. This ONE command (it prints the fingerprint of the library Hold Button file, line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/HoldButton.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

Command 5 must show `vitest@5.0.3` and a line with `@fontsource-variable/space-grotesk@`. If either is missing: **STOP** and report the RAW output.
Command 6 should print `src/components/HoldButton.tsx ad7f7c00372286d6590bb3e830156098ec707d0f6247d6e73ce045b5f2a41fc2`. If the number is different, do NOT stop: copy the line. (The tests in Step 8 decide whether the Hold Button works.)

## STEP 1: Install the test environment
Run:
```
npm install --save-dev --save-exact jsdom@30.1.2
```
If it asks a question, asks for a login, or ends with an error: **STOP** and report the COMPLETE output. (Lines about funding or audits are harmless. A deprecation warning is harmless: copy it.)

Run these two and copy the RAW output of each:
1. `npm ls jsdom --depth=0`
2. `git diff package.json`

Command 1 must show `jsdom@30.1.2`. If not: **STOP** and report the RAW outputs. Do not edit `package.json` by hand.

Run `git status --short`. The changed tracked files must be ONLY `package.json`, `package-lock.json`, and the two files named in the rules (`src/components/AppMenu.tsx`, `src/menu.css`, if they were changed before). If ANY other tracked file is changed: **STOP** and report the COMPLETE output.

## STEP 2: Create `src/lib/timerApi.ts`
Create the file `src/lib/timerApi.ts` with exactly this content (everything inside the block below; the first line is an import line and the last line is a comment):
```ts
import { supabase } from "@/lib/supabase"
import { parseServerTimeMs, type TimerRow } from "@/lib/timerMaths"

// AB:TIMER.API:START
// The calls from the app to the database functions of the Pro Timer (supabase/timer_schema.sql), and the reading of their answers.
// Every function here either gives an answer that was checked, or throws a TimerError with a name that the screen understands.
// What is tied to the SQL file: see CONNECTIONS.md C28 and C29. The tests are in src/lib/timerApi.test.ts.

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
```

## STEP 3: Create `src/lib/useTimer.ts`
Create the file `src/lib/useTimer.ts` with exactly this content (everything inside the block below):
```ts
import { useCallback, useEffect, useRef, useState } from "react"
import {
  TimerError,
  deviceTimeZone,
  timerDayTotal,
  timerEnd,
  timerPause,
  timerResume,
  timerStart,
  timerState,
  type TimerErrorKind,
} from "@/lib/timerApi"
import {
  activeSeconds,
  dayHasEnded,
  dayTotalSeconds,
  estimateServerNowMs,
  localDay,
  type TimerRow,
} from "@/lib/timerMaths"

// AB:TIMER.STATE:START
// The live state of the Pro Timer screen. The database is the only truth: every few seconds and every time the page comes back, the state is read again.
// The seconds are never counted by ticks. They are worked out from the stored times and the server time estimate (timerMaths.ts), so a sleeping phone loses nothing.
// Rules: a button that finds the state changed on another device reads the state again (CONFLICTS); without a connection every button is off; a session still running at local midnight is ended by the database at 12:00.
// What is tied to the database and the screen: see CONNECTIONS.md C28, C29 and C30. The names used by the screen are in TimerView.

export const POLL_ONLINE_MS = 30000
export const POLL_OFFLINE_MS = 3000
export const TIME_BASE_JITTER_MS = 1500

// The errors that mean "the state on the server is not what this screen showed": the screen reads the state again and shows what is true.
const CONFLICTS: readonly TimerErrorKind[] = ["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED"]

export type TimeBase = { serverMs: number; localMs: number }

// A new reading of the server time only replaces the old one when the two differ by 1.5 seconds or more. Otherwise the small difference (the travel time of the answer) would make the seconds step back now and then.
export function keepTimeBase(old: TimeBase | null, next: TimeBase, localNowMs: number): TimeBase {
  if (old === null) return next
  const oldEstimate = estimateServerNowMs(old.serverMs, old.localMs, localNowMs)
  const nextEstimate = estimateServerNowMs(next.serverMs, next.localMs, localNowMs)
  return Math.abs(nextEstimate - oldEstimate) < TIME_BASE_JITTER_MS ? old : next
}

export type TimerLink = "loading" | "online" | "offline" | "problem"
export type TimerStatus = "idle" | "running" | "paused"
export type EndNotice = { saved: boolean; capped: boolean; seconds: number | null }

type Reading = { row: TimerRow | null; time: TimeBase; savedSeconds: number; day: string }
type Action = "start" | "pause" | "resume" | "end"

export type TimerView = {
  link: TimerLink
  problem: string
  busy: boolean
  status: TimerStatus
  seconds: number
  dayTotal: number
  ringSeed: string
  notice: EndNotice | null
  start: () => void
  pause: () => void
  resume: () => void
  end: () => void
  retry: () => void
}

export function problemText(kind: TimerErrorKind): string {
  switch (kind) {
    case "NOT_SIGNED_IN":
      return "You are signed out. Sign in again."
    case "BAD_TIMEZONE":
      return "This device has a time zone that the timer cannot use."
    case "BAD_REPLY":
      return "The timer got an answer it could not read."
    case "NOT_READY":
      return "The app is not connected to the database."
    default:
      return "Something went wrong."
  }
}

function dayOrFallback(ms: number, zone: string, fallback: string): string {
  try {
    return localDay(ms, zone)
  } catch {
    return fallback
  }
}

export function useTimer(): TimerView {
  const [reading, setReading] = useState<Reading | null>(null)
  const [link, setLink] = useState<TimerLink>("loading")
  const [problem, setProblem] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<EndNotice | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const readingRef = useRef<Reading | null>(null)
  const linkRef = useRef<TimerLink>("loading")
  const busyRef = useRef(false)
  const ticketRef = useRef(0)
  const lastAttemptRef = useRef(0)
  const aliveRef = useRef(true)
  const rolloverRef = useRef("")

  const showLink = useCallback((next: TimerLink, text = "") => {
    linkRef.current = next
    setLink(next)
    setProblem(text)
  }, [])

  const adopt = useCallback((next: Reading) => {
    const t = Date.now()
    const merged: Reading = { ...next, time: keepTimeBase(readingRef.current?.time ?? null, next.time, t) }
    readingRef.current = merged
    setReading(merged)
    setNow(t)
  }, [])

  const fail = useCallback(
    (error: unknown) => {
      if (!aliveRef.current) return
      const kind: TimerErrorKind = error instanceof TimerError ? error.kind : "UNKNOWN"
      if (kind === "NO_CONNECTION") showLink("offline")
      else showLink("problem", problemText(kind))
    },
    [showLink],
  )

  // Reads the state and the day total from the database and shows them.
  const refresh = useCallback(async () => {
    const ticket = ++ticketRef.current
    lastAttemptRef.current = Date.now()
    try {
      const zone = deviceTimeZone()
      const sentAt = Date.now()
      const state = await timerState()
      const receivedAt = Date.now()
      if (!aliveRef.current || ticket !== ticketRef.current) return
      const day = localDay(state.serverNowMs, state.row?.tz ?? zone)
      const saved = await timerDayTotal(day)
      if (!aliveRef.current || ticket !== ticketRef.current) return
      adopt({ row: state.row, time: { serverMs: state.serverNowMs, localMs: (sentAt + receivedAt) / 2 }, savedSeconds: saved, day })
      showLink("online")
    } catch (error) {
      if (ticket !== ticketRef.current) return
      fail(error)
    }
  }, [adopt, fail, showLink])

  const act = useCallback(
    async (kind: Action) => {
      if (busyRef.current || linkRef.current !== "online") return
      busyRef.current = true
      setBusy(true)
      ticketRef.current += 1
      try {
        const sentAt = Date.now()
        const before = readingRef.current
        if (kind === "end") {
          const reply = await timerEnd()
          if (!aliveRef.current) return
          const time = { serverMs: reply.serverNowMs, localMs: (sentAt + Date.now()) / 2 }
          const added = reply.saved && reply.seconds !== null ? reply.seconds : 0
          adopt({ row: null, time, savedSeconds: (before?.savedSeconds ?? 0) + added, day: before?.day ?? "" })
          setNotice({ saved: reply.saved, capped: reply.capped, seconds: reply.seconds })
        } else {
          const reply =
            kind === "start" ? await timerStart(deviceTimeZone()) : kind === "pause" ? await timerPause() : await timerResume()
          if (!aliveRef.current) return
          const time = { serverMs: reply.serverNowMs, localMs: (sentAt + Date.now()) / 2 }
          adopt({ row: reply.row, time, savedSeconds: before?.savedSeconds ?? 0, day: before?.day ?? "" })
          if (kind === "start") setNotice(null)
        }
        void refresh()
      } catch (error) {
        if (!aliveRef.current) return
        if (error instanceof TimerError && CONFLICTS.includes(error.kind)) void refresh()
        else fail(error)
      } finally {
        busyRef.current = false
        if (aliveRef.current) setBusy(false)
      }
    },
    [adopt, fail, refresh],
  )

  // Reading again: at the start, every 30 seconds (every 3 seconds while there is no connection), when the page comes back, and when the connection comes back.
  useEffect(() => {
    aliveRef.current = true
    void refresh()
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    const onOnline = () => void refresh()
    const onOffline = () => {
      if (linkRef.current === "online") showLink("offline")
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("pageshow", onVisible)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    const poll = window.setInterval(() => {
      if (busyRef.current || document.visibilityState !== "visible" || linkRef.current === "loading") return
      const wait = linkRef.current === "offline" ? POLL_OFFLINE_MS : POLL_ONLINE_MS
      if (Date.now() - lastAttemptRef.current >= wait) void refresh()
    }, 1000)
    return () => {
      aliveRef.current = false
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("pageshow", onVisible)
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      window.clearInterval(poll)
    }
  }, [refresh, showLink])

  // The clock: look four times a second, show a new value only when the whole second changes.
  useEffect(() => {
    const tick = window.setInterval(() => {
      const r = readingRef.current
      if (r === null) return
      const t = Date.now()
      setNow((previous) => {
        const a = Math.floor(estimateServerNowMs(r.time.serverMs, r.time.localMs, previous) / 1000)
        const b = Math.floor(estimateServerNowMs(r.time.serverMs, r.time.localMs, t) / 1000)
        return a === b ? previous : t
      })
    }, 250)
    return () => window.clearInterval(tick)
  }, [])

  const serverNow = reading === null ? 0 : estimateServerNowMs(reading.time.serverMs, reading.time.localMs, now)
  const row = reading?.row ?? null
  const seconds = row === null ? 0 : activeSeconds(row, serverNow)
  const dayOver = row !== null && dayHasEnded(row, serverNow)
  // Only used while nothing runs (see the rollover below), so it is always the day of this device.
  const currentDay = reading === null ? "" : dayOrFallback(serverNow, deviceZoneOrUtc(), reading.day)

  // Local midnight reached while the session was running: the database ends it at 12:00.
  useEffect(() => {
    if (dayOver && link === "online" && !busy) void act("end")
  }, [dayOver, link, busy, act])

  // A new day began while nothing was running: read the day total of the new day.
  useEffect(() => {
    if (reading === null || reading.row !== null || link !== "online") return
    if (currentDay === "" || currentDay === reading.day || rolloverRef.current === currentDay) return
    rolloverRef.current = currentDay
    void refresh()
  }, [reading, link, currentDay, refresh])

  return {
    link,
    problem,
    busy,
    status: row === null ? "idle" : row.status,
    seconds,
    dayTotal: dayTotalSeconds(reading?.savedSeconds ?? 0, row === null ? null : seconds),
    ringSeed: row === null ? "" : row.started_at,
    notice,
    start: () => void act("start"),
    pause: () => void act("pause"),
    resume: () => void act("resume"),
    end: () => void act("end"),
    retry: () => void refresh(),
  }
}

function deviceZoneOrUtc(): string {
  try {
    return deviceTimeZone()
  } catch {
    return "UTC"
  }
}
// AB:TIMER.STATE:END
```

## STEP 4: Create `src/components/TimerScreen.tsx` and `src/timer.css`
Create the file `src/components/TimerScreen.tsx` with exactly this content (everything inside the block below):
```tsx
import HoldButton from "@/components/HoldButton"
import { formatClock, qualityOf, ringColor, ringFill, ringLoop } from "@/lib/timerMaths"
import { useTimer, type EndNotice } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.SCREEN:START
// The Pro Timer screen. It is shown at the page address #timer (SignedInStub.tsx chooses it, see CONNECTIONS.md C30).
// Big clock: the seconds of the running session. Small clock under it: the total of the day, saved sessions plus the running one.
// The ring goes around the big clock once per hour of the session. The first loop is white, each next loop gets a neon colour (ringColor in timerMaths.ts).
// Start and Pause / Resume are normal taps. End Session is the library Hold Button (src/components/HoldButton.tsx, never edited): hold it until it is full.
// The ring is drawn in a box of 100 by 100 with a radius of 45, so the stroke width in timer.css must stay 10 or less (see CONNECTIONS.md C31).
// The look of the clock digits (Space Grotesk, fixed width) is in timer.css (see CONNECTIONS.md C32).

function noticeText(notice: EndNotice): string {
  const head = notice.capped ? "Day ended at midnight. " : ""
  if (!notice.saved || notice.seconds === null) return head + "Under 1 minute, so it was not saved."
  return head + "Saved " + formatClock(notice.seconds) + " (" + qualityOf(notice.seconds) + ")."
}

export default function TimerScreen() {
  const timer = useTimer()
  const loop = ringLoop(timer.seconds)
  const fill = timer.status === "idle" ? 0 : ringFill(timer.seconds)
  const arcColor = ringColor(loop, timer.ringSeed)
  const trackColor = loop === 0 ? "rgba(255, 255, 255, 0.14)" : ringColor(loop - 1, timer.ringSeed)
  const ready = timer.link === "online" && !timer.busy

  let note = ""
  if (timer.link === "offline") note = "No connection. Waiting to reconnect."
  else if (timer.link === "problem") note = timer.problem
  else if (timer.notice !== null) note = noticeText(timer.notice)

  return (
    <main className="ab-timer" data-state={timer.status} data-link={timer.link}>
      <div className="ab-timer-dial">
        <svg className="ab-timer-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="ab-timer-track" cx="50" cy="50" r="45" stroke={trackColor} transform="rotate(-90 50 50)" />
          <circle
            className="ab-timer-arc"
            cx="50"
            cy="50"
            r="45"
            pathLength={1}
            strokeDasharray={fill + " 1"}
            stroke={arcColor}
            opacity={fill > 0 ? 1 : 0}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="ab-timer-readout">
          <p className="ab-timer-big" role="timer">
            {formatClock(timer.seconds)}
          </p>
          <p className="ab-timer-small">{formatClock(timer.dayTotal)}</p>
        </div>
      </div>
      <p className="ab-timer-note" role="status">
        {note}
      </p>
      {timer.link === "problem" ? (
        <button className="ab-timer-retry" type="button" onClick={timer.retry}>
          Try again
        </button>
      ) : null}
      <div className="ab-timer-actions">
        {timer.link === "loading" ? null : timer.status === "idle" ? (
          <button className="ab-timer-pill" type="button" disabled={!ready} onClick={timer.start}>
            Start
          </button>
        ) : (
          <>
            <button
              className="ab-timer-pill"
              type="button"
              disabled={!ready}
              onClick={timer.status === "running" ? timer.pause : timer.resume}
            >
              {timer.status === "running" ? "Pause" : "Resume"}
            </button>
            <HoldButton
              className="ab-timer-end"
              size="lg"
              holdTime={1500}
              backgroundColor="#1c1c20"
              fillColor="#ff2a55"
              textColor="#f5f5f5"
              fillTextColor="#ffffff"
              doneLabel="Ended"
              disabled={!ready}
              onHold={timer.end}
            >
              Hold to end session
            </HoldButton>
          </>
        )}
      </div>
    </main>
  )
}
// AB:TIMER.SCREEN:END
```

Create the file `src/timer.css` with exactly this content (everything inside the block below):
```css
/* Styles of the Pro Timer screen. Tag: see CODE_MAP.md in the project root. */

@import "@fontsource-variable/space-grotesk";

/* AB:TIMER.SCREEN:START */
/* The screen: plain black for now. The menu button (menu.css) floats above it, so the top has room for it. */
.ab-timer {
  min-height: 100dvh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 72px 20px 32px;
  background: #000;
  color: #fff;
  font-family: "Space Grotesk Variable", system-ui, sans-serif;
}

/* The dial: a square box. The ring fills it and the two clocks sit in the middle. */
.ab-timer-dial {
  position: relative;
  width: min(84vw, 400px);
  aspect-ratio: 1;
}

/* The ring is drawn in a box of 100 by 100 with a radius of 45 (TimerScreen.tsx), so a stroke width of 10 or less stays inside the box (CONNECTIONS.md C31). */
.ab-timer-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: opacity 400ms ease;
}

.ab-timer-track,
.ab-timer-arc {
  fill: none;
  stroke-width: 6;
}

.ab-timer-arc {
  stroke-linecap: round;
}

.ab-timer-readout {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* The digits: Space Grotesk medium. Its digits are not all the same width by default, so tabular-nums switches on the fixed width ones (checked in the font file at weights 400, 500 and 600). CONNECTIONS.md C32. */
.ab-timer-big {
  margin: 0;
  font-size: clamp(2.4rem, 13vw, 4.25rem);
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ab-timer-small {
  margin: 0;
  font-size: clamp(1.05rem, 4.6vw, 1.5rem);
  font-weight: 500;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);
  font-variant-numeric: tabular-nums;
}

/* Paused: the digits blink slowly and the ring dims. Still loading: the whole dial is dim. */
.ab-timer[data-state="paused"] .ab-timer-ring {
  opacity: 0.3;
}

.ab-timer[data-state="paused"] .ab-timer-big {
  animation: ab-timer-blink 1.8s ease-in-out infinite;
}

.ab-timer[data-link="loading"] .ab-timer-dial {
  opacity: 0.45;
}

@keyframes ab-timer-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab-timer[data-state="paused"] .ab-timer-big {
    animation: none;
    opacity: 0.55;
  }
}

/* The line under the dial: No connection, an error, or what happened to the session that was just ended. It keeps its height so that nothing jumps. */
.ab-timer-note {
  margin: 0;
  min-height: 1.4em;
  max-width: 320px;
  font-size: 15px;
  line-height: 1.4;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.ab-timer-retry {
  padding: 8px 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  cursor: pointer;
}

/* The buttons: Start, or Pause and Resume above the Hold Button. The box keeps its height while loading so that the dial does not move. */
.ab-timer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 320px;
  min-height: 124px;
}

.ab-timer-pill {
  width: 100%;
  height: 58px;
  padding: 0 28px;
  font: inherit;
  font-size: 19px;
  font-weight: 700;
  color: #000;
  background: #fff;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.ab-timer-pill:disabled {
  opacity: 0.4;
  cursor: default;
}

.ab-timer-pill:active:enabled {
  transform: scale(0.98);
}

.ab-timer-end {
  width: 100%;
}
/* AB:TIMER.SCREEN:END */
```

## STEP 5: Create the five test files
Create the file `src/lib/timerApi.test.ts` with exactly this content (everything inside the block below):
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import schemaSql from "../../supabase/timer_schema.sql?raw"

// The database client is replaced by a fake one, so no test ever calls the network.
const holder = vi.hoisted(() => ({ client: null as null | { rpc: (...args: unknown[]) => unknown } }))
vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return holder.client
  },
}))

import {
  DATABASE_ERRORS,
  REQUEST_TIMEOUT_MS,
  TimerError,
  classifyError,
  deviceTimeZone,
  isOnline,
  readDayTotal,
  readEndReply,
  readRunningReply,
  readStateReply,
  readTimerRow,
  timerDayTotal,
  timerEnd,
  timerPause,
  timerResume,
  timerStart,
  timerState,
  type TimerErrorKind,
} from "./timerApi"

// AB:TIMER.TESTS:START
function kindOf(run: () => unknown): TimerErrorKind | "no error" {
  try {
    run()
  } catch (error) {
    return error instanceof TimerError ? error.kind : "UNKNOWN"
  }
  return "no error"
}

async function kindOfAsync(run: () => Promise<unknown>): Promise<TimerErrorKind | "no error"> {
  try {
    await run()
  } catch (error) {
    return error instanceof TimerError ? error.kind : "UNKNOWN"
  }
  return "no error"
}

const RUNNING = {
  started_at: "2026-10-06T09:30:00.123456+00:00",
  tz: "Asia/Kolkata",
  status: "running",
  paused_at: null,
  paused_seconds: 0,
  cap_at: "2026-10-06T18:30:00+00:00",
}

const PAUSED = { ...RUNNING, status: "paused", paused_at: "2026-10-06T09:40:00+00:00", paused_seconds: 12.345678 }

const SERVER_NOW = "2026-10-06T10:00:00.500000+00:00"
const SERVER_NOW_MS = Date.parse("2026-10-06T10:00:00.500Z")

const SAVED = {
  server_now: SERVER_NOW,
  saved: true,
  capped: false,
  session: { id: "abc", day: "2026-10-06", started_at: RUNNING.started_at, ended_at: SERVER_NOW, active_seconds: 125 },
}

const NOT_SAVED = { server_now: SERVER_NOW, saved: false, capped: false, session: null }

// A fake database client that answers every call with the given data. It returns the fake function so a test can look at the calls.
function answer(data: unknown) {
  const rpc = vi.fn(async (..._args: unknown[]) => ({ data, error: null as unknown }))
  holder.client = { rpc }
  return rpc
}

function fail(error: unknown) {
  const rpc = vi.fn(async (..._args: unknown[]) => ({ data: null, error }))
  holder.client = { rpc }
  return rpc
}

beforeEach(() => {
  holder.client = null
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  holder.client = null
})

describe("the error names", () => {
  it("are the six names the database functions raise", () => {
    expect([...DATABASE_ERRORS]).toEqual(["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED", "BAD_TIMEZONE", "NOT_SIGNED_IN"])
  })

  it("a TimerError carries its kind, and its message starts with the kind", () => {
    const plain = new TimerError("BAD_REPLY")
    expect(plain).toBeInstanceOf(Error)
    expect(plain.kind).toBe("BAD_REPLY")
    expect(plain.name).toBe("TimerError")
    expect(plain.message).toBe("BAD_REPLY")
    expect(new TimerError("UNKNOWN", "boom").message).toBe("UNKNOWN: boom")
  })
})

describe("classifyError", () => {
  it.each(DATABASE_ERRORS)("a database error name in the message is that name: %s", (name) => {
    expect(classifyError({ message: name }, true)).toBe(name)
    expect(classifyError({ message: "P0001: " + name + " (hint)" }, true)).toBe(name)
  })

  it("a database error name wins over a lost connection, because the database did answer", () => {
    expect(classifyError({ message: "DAY_ENDED" }, false)).toBe("DAY_ENDED")
  })

  it("a name that is only part of a longer word is not a name", () => {
    expect(classifyError({ message: "XNOT_RUNNING" }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: "NOT_RUNNING_AT_ALL" }, true)).toBe("UNKNOWN")
  })

  it.each([
    [{ code: "PGRST301", message: "x" }],
    [{ code: "PGRST303", message: "x" }],
    [{ message: "JWT expired" }],
    [{ message: "invalid jwt: malformed" }],
  ])("an expired or missing sign in is NOT_SIGNED_IN: %j", (error) => {
    expect(classifyError(error, true)).toBe("NOT_SIGNED_IN")
    expect(classifyError(error, false)).toBe("NOT_SIGNED_IN")
  })

  it("jwt inside a longer word is not a sign in problem", () => {
    expect(classifyError({ message: "jwtx" }, true)).toBe("UNKNOWN")
  })

  it.each([
    "Failed to fetch",
    "TypeError: NetworkError when attempting to fetch resource.",
    "Network request failed",
    "Load failed",
    "fetch failed",
    "timed out after 15000 ms",
    "Request timeout",
    "The operation was aborted",
    "You are offline",
  ])("words of a lost connection are NO_CONNECTION: %s", (message) => {
    expect(classifyError({ message }, true)).toBe("NO_CONNECTION")
  })

  it("when the browser says it is offline, any other error is NO_CONNECTION", () => {
    expect(classifyError({ message: "something strange" }, false)).toBe("NO_CONNECTION")
    expect(classifyError(null, false)).toBe("NO_CONNECTION")
  })

  it("an error that is none of these is UNKNOWN, also when there is no usable message", () => {
    expect(classifyError({ message: "something strange" }, true)).toBe("UNKNOWN")
    expect(classifyError(null, true)).toBe("UNKNOWN")
    expect(classifyError(undefined, true)).toBe("UNKNOWN")
    expect(classifyError({ message: 123 }, true)).toBe("UNKNOWN")
    expect(classifyError({ code: 5 }, true)).toBe("UNKNOWN")
  })

  it("a message that is not text is not read, even when its text form would hold a name or a network word", () => {
    expect(classifyError({ message: ["NOT_RUNNING"] }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: ["Failed to fetch"] }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: { toString: () => "JWT expired" } }, true)).toBe("UNKNOWN")
    expect(classifyError({ message: ["NOT_RUNNING"] }, false)).toBe("NO_CONNECTION")
  })
})

describe("isOnline and deviceTimeZone", () => {
  it("is online when the browser says so, or says nothing", () => {
    vi.stubGlobal("navigator", { onLine: true })
    expect(isOnline()).toBe(true)
    vi.stubGlobal("navigator", {})
    expect(isOnline()).toBe(true)
    vi.stubGlobal("navigator", undefined)
    expect(isOnline()).toBe(true)
  })

  it("is offline only when the browser says onLine is false", () => {
    vi.stubGlobal("navigator", { onLine: false })
    expect(isOnline()).toBe(false)
  })

  it("gives the time zone of the device", () => {
    expect(deviceTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({ timeZone: "Asia/Kolkata" } as Intl.ResolvedDateTimeFormatOptions)
    expect(deviceTimeZone()).toBe("Asia/Kolkata")
  })

  it("a device that gives no time zone is BAD_TIMEZONE", () => {
    const spy = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions")
    spy.mockReturnValue({ timeZone: "" } as Intl.ResolvedDateTimeFormatOptions)
    expect(kindOf(() => deviceTimeZone())).toBe("BAD_TIMEZONE")
    spy.mockReturnValue({ timeZone: undefined } as unknown as Intl.ResolvedDateTimeFormatOptions)
    expect(kindOf(() => deviceTimeZone())).toBe("BAD_TIMEZONE")
  })
})

describe("readTimerRow", () => {
  it("reads a running session and a paused session", () => {
    expect(readTimerRow(RUNNING)).toEqual(RUNNING)
    expect(readTimerRow(PAUSED)).toEqual(PAUSED)
  })

  it("gives back only the six fields of a TimerRow", () => {
    const row = readTimerRow({ ...RUNNING, id: "x", extra: 1 })
    expect(Object.keys(row).sort()).toEqual(["cap_at", "paused_at", "paused_seconds", "started_at", "status", "tz"])
  })

  it.each([[null], [undefined], ["text"], [5], [[]], [true]])("something that is not an object is BAD_REPLY: %j", (value) => {
    expect(kindOf(() => readTimerRow(value))).toBe("BAD_REPLY")
  })

  it.each([
    ["started_at missing", { ...RUNNING, started_at: undefined }],
    ["started_at is a number", { ...RUNNING, started_at: 1790000000 }],
    ["started_at is not a time", { ...RUNNING, started_at: "yesterday" }],
    ["started_at is a date that does not exist", { ...RUNNING, started_at: "2026-13-01T09:30:00+00:00" }],
    ["cap_at missing", { ...RUNNING, cap_at: undefined }],
    ["cap_at is not a time", { ...RUNNING, cap_at: "midnight" }],
    ["tz missing", { ...RUNNING, tz: undefined }],
    ["tz is empty", { ...RUNNING, tz: "" }],
    ["tz is a number", { ...RUNNING, tz: 5 }],
    ["status missing", { ...RUNNING, status: undefined }],
    ["status is another word", { ...RUNNING, status: "stopped" }],
    ["status in capital letters", { ...RUNNING, status: "RUNNING" }],
    ["running with a paused_at", { ...RUNNING, paused_at: "2026-10-06T09:40:00+00:00" }],
    ["running with paused_at missing", { ...RUNNING, paused_at: undefined }],
    ["paused without paused_at", { ...PAUSED, paused_at: null }],
    ["paused with a bad paused_at", { ...PAUSED, paused_at: "later" }],
    ["paused_seconds missing", { ...RUNNING, paused_seconds: undefined }],
    ["paused_seconds is text", { ...RUNNING, paused_seconds: "5" }],
    ["paused_seconds is negative", { ...RUNNING, paused_seconds: -1 }],
    ["paused_seconds is not a number", { ...RUNNING, paused_seconds: Number.NaN }],
    ["paused_seconds is infinite", { ...RUNNING, paused_seconds: Number.POSITIVE_INFINITY }],
  ])("a session with a problem is BAD_REPLY: %s", (_name, value) => {
    expect(kindOf(() => readTimerRow(value))).toBe("BAD_REPLY")
  })

  it("paused_seconds may have a fraction, and 0 is fine", () => {
    expect(readTimerRow({ ...RUNNING, paused_seconds: 0 }).paused_seconds).toBe(0)
    expect(readTimerRow({ ...RUNNING, paused_seconds: 0.000001 }).paused_seconds).toBe(0.000001)
  })
})

describe("readStateReply, readRunningReply, readEndReply, readDayTotal", () => {
  it("reads the state with nothing running, and with a running session", () => {
    expect(readStateReply({ server_now: SERVER_NOW, running: null })).toEqual({ serverNowMs: SERVER_NOW_MS, row: null })
    expect(readStateReply({ server_now: SERVER_NOW, running: RUNNING })).toEqual({ serverNowMs: SERVER_NOW_MS, row: RUNNING })
  })

  it.each([
    ["not an object", "x"],
    ["an array", []],
    ["server_now missing", { running: null }],
    ["server_now is a number", { server_now: 5, running: null }],
    ["server_now is not a time", { server_now: "now", running: null }],
    ["running missing", { server_now: SERVER_NOW }],
    ["running is broken", { server_now: SERVER_NOW, running: { ...RUNNING, status: "x" } }],
  ])("a state answer with a problem is BAD_REPLY: %s", (_name, value) => {
    expect(kindOf(() => readStateReply(value))).toBe("BAD_REPLY")
  })

  it("an answer to start, pause or resume must hold a session", () => {
    expect(readRunningReply({ server_now: SERVER_NOW, running: PAUSED })).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(kindOf(() => readRunningReply({ server_now: SERVER_NOW, running: null }))).toBe("BAD_REPLY")
  })

  it("reads the answer of a saved session and of a session that was not saved", () => {
    expect(readEndReply(SAVED)).toEqual({ serverNowMs: SERVER_NOW_MS, saved: true, capped: false, seconds: 125, day: "2026-10-06" })
    expect(readEndReply({ ...SAVED, capped: true }).capped).toBe(true)
    expect(readEndReply(NOT_SAVED)).toEqual({ serverNowMs: SERVER_NOW_MS, saved: false, capped: false, seconds: null, day: null })
    expect(readEndReply({ ...NOT_SAVED, capped: true }).capped).toBe(true)
  })

  it.each([
    ["not an object", 5],
    ["server_now missing", { ...SAVED, server_now: undefined }],
    ["saved is text", { ...SAVED, saved: "true" }],
    ["saved is a number", { ...SAVED, saved: 1 }],
    ["saved missing", { ...SAVED, saved: undefined }],
    ["capped is text", { ...SAVED, capped: "false" }],
    ["capped missing", { ...SAVED, capped: undefined }],
    ["not saved but a session is there", { ...NOT_SAVED, session: SAVED.session }],
    ["saved but the session is null", { ...SAVED, session: null }],
    ["saved but the session is text", { ...SAVED, session: "x" }],
    ["active_seconds has a fraction", { ...SAVED, session: { ...SAVED.session, active_seconds: 125.5 } }],
    ["active_seconds is negative", { ...SAVED, session: { ...SAVED.session, active_seconds: -1 } }],
    ["active_seconds is text", { ...SAVED, session: { ...SAVED.session, active_seconds: "125" } }],
    ["active_seconds missing", { ...SAVED, session: { ...SAVED.session, active_seconds: undefined } }],
    ["day is not a date", { ...SAVED, session: { ...SAVED.session, day: "2026-10-6" } }],
    ["day is written the other way round", { ...SAVED, session: { ...SAVED.session, day: "06-10-2026" } }],
    ["day is a number", { ...SAVED, session: { ...SAVED.session, day: 20261006 } }],
    ["day has more after the date", { ...SAVED, session: { ...SAVED.session, day: "2026-10-06T10:00:00" } }],
    ["day has more before the date", { ...SAVED, session: { ...SAVED.session, day: "x2026-10-06" } }],
  ])("an end answer with a problem is BAD_REPLY: %s", (_name, value) => {
    expect(kindOf(() => readEndReply(value))).toBe("BAD_REPLY")
  })

  it("an array is refused as an object, and the reason says so", () => {
    expect(() => readTimerRow([])).toThrow("the running session is not an object")
    expect(() => readStateReply([])).toThrow("the answer is not an object")
    expect(() => readEndReply([])).toThrow("the answer is not an object")
    expect(() => readEndReply({ ...SAVED, session: [] })).toThrow("session is missing")
  })

  it("a saved session of 0 seconds is read as it is", () => {
    expect(readEndReply({ ...SAVED, session: { ...SAVED.session, active_seconds: 0 } }).seconds).toBe(0)
  })

  it("reads a day total of whole seconds", () => {
    expect(readDayTotal(0)).toBe(0)
    expect(readDayTotal(5400)).toBe(5400)
  })

  it.each([[-1], [1.5], ["100"], [null], [undefined], [Number.NaN], [Number.POSITIVE_INFINITY], [{}]])("a day total that is not a whole number of 0 or more is BAD_REPLY: %j", (value) => {
    expect(kindOf(() => readDayTotal(value))).toBe("BAD_REPLY")
  })
})

describe("the calls to the database", () => {
  it("each call names its database function and sends its arguments by the names the SQL uses", async () => {
    const running = { server_now: SERVER_NOW, running: RUNNING }
    let rpc = answer(running)
    await timerState()
    expect(rpc).toHaveBeenCalledWith("timer_state", undefined)
    rpc = answer(5400)
    expect(await timerDayTotal("2026-10-06")).toBe(5400)
    expect(rpc).toHaveBeenCalledWith("timer_day_total", { p_day: "2026-10-06" })
    rpc = answer(running)
    await timerStart("Asia/Kolkata")
    expect(rpc).toHaveBeenCalledWith("timer_start", { p_tz: "Asia/Kolkata" })
    rpc = answer(running)
    await timerPause()
    expect(rpc).toHaveBeenCalledWith("timer_pause", undefined)
    rpc = answer(running)
    await timerResume()
    expect(rpc).toHaveBeenCalledWith("timer_resume", undefined)
    rpc = answer(SAVED)
    expect(await timerEnd()).toEqual({ serverNowMs: SERVER_NOW_MS, saved: true, capped: false, seconds: 125, day: "2026-10-06" })
    expect(rpc).toHaveBeenCalledWith("timer_end", undefined)
  })

  it("every call hands back the checked answer", async () => {
    answer({ server_now: SERVER_NOW, running: PAUSED })
    expect(await timerState()).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(await timerPause()).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(await timerResume()).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
    expect(await timerStart("Asia/Kolkata")).toEqual({ serverNowMs: SERVER_NOW_MS, row: PAUSED })
  })

  it("without a database client every call is NOT_READY", async () => {
    holder.client = null
    for (const run of [() => timerState(), () => timerDayTotal("2026-10-06"), () => timerStart("Asia/Kolkata"), () => timerPause(), () => timerResume(), () => timerEnd()]) {
      expect(await kindOfAsync(run)).toBe("NOT_READY")
    }
  })

  it("a name raised by a database function comes back as that name", async () => {
    fail({ message: "ALREADY_RUNNING", code: "P0001" })
    expect(await kindOfAsync(() => timerStart("Asia/Kolkata"))).toBe("ALREADY_RUNNING")
    fail({ message: "NOT_RUNNING", code: "P0001" })
    expect(await kindOfAsync(() => timerEnd())).toBe("NOT_RUNNING")
  })

  it("an expired sign in comes back as NOT_SIGNED_IN", async () => {
    fail({ message: "JWT expired", code: "PGRST301" })
    expect(await kindOfAsync(() => timerState())).toBe("NOT_SIGNED_IN")
  })

  it("an error of the network comes back as NO_CONNECTION, also when the client throws instead of answering", async () => {
    fail({ message: "Failed to fetch" })
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
    holder.client = {
      rpc: () => {
        throw new TypeError("Failed to fetch")
      },
    }
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
    holder.client = { rpc: () => Promise.reject(new TypeError("Load failed")) }
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
  })

  it("an unknown failure is UNKNOWN, unless the browser says it is offline", async () => {
    holder.client = { rpc: () => Promise.reject(new Error("boom")) }
    expect(await kindOfAsync(() => timerState())).toBe("UNKNOWN")
    vi.stubGlobal("navigator", { onLine: false })
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
  })

  it("an error that the client returns counts as NO_CONNECTION when the browser says it is offline, and as UNKNOWN when it does not", async () => {
    fail({ message: "something strange" })
    expect(await kindOfAsync(() => timerState())).toBe("UNKNOWN")
    vi.stubGlobal("navigator", { onLine: false })
    expect(await kindOfAsync(() => timerState())).toBe("NO_CONNECTION")
  })

  it("keeps the message of the error once, and does not wrap it again", async () => {
    async function messageOf(run: () => Promise<unknown>): Promise<string> {
      try {
        await run()
      } catch (error) {
        return error instanceof Error ? error.message : "not an error"
      }
      return "no error"
    }
    fail({ message: "boom detail" })
    expect(await messageOf(() => timerState())).toBe("UNKNOWN: boom detail")
    fail({ message: "ALREADY_RUNNING" })
    expect(await messageOf(() => timerStart("Asia/Kolkata"))).toBe("ALREADY_RUNNING: ALREADY_RUNNING")
    holder.client = { rpc: () => Promise.reject(new Error("boom")) }
    expect(await messageOf(() => timerState())).toBe("UNKNOWN: Error: boom")
  })

  it("an answer in a wrong shape is BAD_REPLY, not a crash", async () => {
    answer({})
    expect(await kindOfAsync(() => timerState())).toBe("BAD_REPLY")
    answer(null)
    expect(await kindOfAsync(() => timerEnd())).toBe("BAD_REPLY")
    answer("5400")
    expect(await kindOfAsync(() => timerDayTotal("2026-10-06"))).toBe("BAD_REPLY")
    answer({ server_now: SERVER_NOW, running: null })
    expect(await kindOfAsync(() => timerPause())).toBe("BAD_REPLY")
  })

  it("a call that does not answer within 15 seconds is NO_CONNECTION, not before", async () => {
    expect(REQUEST_TIMEOUT_MS).toBe(15000)
    vi.useFakeTimers()
    holder.client = { rpc: () => new Promise(() => {}) }
    let outcome: string = "waiting"
    const run = kindOfAsync(() => timerState()).then((kind) => {
      outcome = kind
    })
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS - 1)
    expect(outcome).toBe("waiting")
    await vi.advanceTimersByTimeAsync(1)
    await run
    expect(outcome).toBe("NO_CONNECTION")
  })

  it("an answer in time leaves no timer behind", async () => {
    vi.useFakeTimers()
    answer({ server_now: SERVER_NOW, running: null })
    await timerState()
    expect(vi.getTimerCount()).toBe(0)
    fail({ message: "boom" })
    await kindOfAsync(() => timerState())
    expect(vi.getTimerCount()).toBe(0)
    holder.client = { rpc: () => Promise.reject(new Error("boom")) }
    await kindOfAsync(() => timerState())
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("the SQL file says what the app expects (the text of supabase/timer_schema.sql is read)", () => {
  it("raises every error name of DATABASE_ERRORS, and no other name", () => {
    const raised = new Set([...schemaSql.matchAll(/raise exception '([A-Z_]+)'/g)].map((m) => m[1]))
    expect([...raised].sort()).toEqual([...DATABASE_ERRORS].sort())
  })

  it("has the six functions the app calls, with the argument names the app sends", () => {
    for (const signature of ["timer_state()", "timer_day_total(p_day date)", "timer_start(p_tz text)", "timer_pause()", "timer_resume()", "timer_end()"]) {
      expect(schemaSql).toContain("create or replace function public." + signature)
    }
  })

  it("sends the keys of the answers that the app reads", () => {
    for (const key of ["server_now", "running", "saved", "capped", "session", "day", "active_seconds"]) {
      expect(schemaSql).toContain("'" + key + "'")
    }
  })

  it("sends the six fields of a running session that readTimerRow reads", () => {
    for (const key of Object.keys(RUNNING)) {
      expect(schemaSql).toContain("'" + key + "'")
    }
  })
})
// AB:TIMER.TESTS:END
```

Create the file `src/lib/useTimer.test.ts` with exactly this content (everything inside the block below):
```ts
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
```

Create the file `src/lib/useTimer.hook.test.ts` with exactly this content (everything inside the block below):
```ts
// @vitest-environment jsdom
import { Profiler, act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The real timerApi is replaced by a fake database server, so no test ever calls the network.
// The fake server keeps the same rules as the SQL functions: the same error names, the same 60 second rule, the cut at cap_at.
const api = vi.hoisted(() => ({
  timerState: vi.fn(),
  timerDayTotal: vi.fn(),
  timerStart: vi.fn(),
  timerPause: vi.fn(),
  timerResume: vi.fn(),
  timerEnd: vi.fn(),
}))
vi.mock("@/lib/supabase", () => ({ supabase: null }))
vi.mock("@/lib/timerApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/timerApi")>()
  return { ...actual, ...api, deviceTimeZone: () => "Asia/Kolkata" }
})

import { TimerError } from "@/lib/timerApi"
import { activeSeconds, type TimerRow } from "@/lib/timerMaths"
import { POLL_OFFLINE_MS, POLL_ONLINE_MS, problemText, useTimer, type TimerView } from "./useTimer"

// AB:TIMER.TESTS:START
// 2026-10-07 10:00:00 UTC is 15:30 on 7 October in Asia/Kolkata. Local midnight there is 18:30 UTC.
const T0 = Date.parse("2026-10-07T10:00:00Z")
const MIDNIGHT = "2026-10-07T18:30:00+00:00"

type Server = { row: TimerRow | null; saved: Record<string, number>; offsetMs: number; down: TimerError | null }
let server: Server

function serverNow(): number {
  return Date.now() + server.offsetMs
}
function iso(ms: number): string {
  return new Date(ms).toISOString().replace("Z", "+00:00")
}
function runningRow(secondsAgo: number, extra: Partial<TimerRow> = {}): TimerRow {
  return { started_at: iso(serverNow() - secondsAgo * 1000), tz: "Asia/Kolkata", status: "running", paused_at: null, paused_seconds: 0, cap_at: MIDNIGHT, ...extra }
}
function guard(): void {
  if (server.down !== null) throw server.down
}

function installFakeServer(): void {
  api.timerState.mockImplementation(async () => {
    guard()
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerDayTotal.mockImplementation(async (day: string) => {
    guard()
    return server.saved[day] ?? 0
  })
  api.timerStart.mockImplementation(async (zone: string) => {
    guard()
    if (server.row !== null) throw new TimerError("ALREADY_RUNNING")
    server.row = runningRow(0, { tz: zone })
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerPause.mockImplementation(async () => {
    guard()
    if (server.row === null || server.row.status !== "running") throw new TimerError("NOT_RUNNING")
    server.row = { ...server.row, status: "paused", paused_at: iso(serverNow()) }
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerResume.mockImplementation(async () => {
    guard()
    if (server.row === null || server.row.paused_at === null) throw new TimerError("NOT_PAUSED")
    const gone = (serverNow() - Date.parse(server.row.paused_at)) / 1000
    server.row = { ...server.row, status: "running", paused_at: null, paused_seconds: server.row.paused_seconds + gone }
    return { serverNowMs: serverNow(), row: server.row }
  })
  api.timerEnd.mockImplementation(async () => {
    guard()
    if (server.row === null) throw new TimerError("NOT_RUNNING")
    const row = server.row
    const seconds = activeSeconds(row, serverNow())
    const capped = serverNow() >= Date.parse(row.cap_at)
    server.row = null
    if (seconds < 60) return { serverNowMs: serverNow(), saved: false, capped, seconds: null, day: null }
    const day = "2026-10-07"
    server.saved[day] = (server.saved[day] ?? 0) + seconds
    return { serverNowMs: serverNow(), saved: true, capped, seconds, day }
  })
}

let view: TimerView
let root: Root | null = null
let container: HTMLElement | null = null

// The number of times the screen was really drawn (committed). React may call the function one more time without drawing, so the calls are not counted.
let renders = 0
function Harness() {
  view = useTimer()
  return null
}

async function settle(ms = 0): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}
async function mount(): Promise<void> {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root?.render(
      createElement(
        Profiler,
        {
          id: "timer",
          onRender: () => {
            renders += 1
          },
        },
        createElement(Harness),
      ),
    )
    await vi.advanceTimersByTimeAsync(0)
  })
}
async function press(button: () => void): Promise<void> {
  await act(async () => {
    button()
    await vi.advanceTimersByTimeAsync(0)
  })
}
function setVisible(visible: boolean): void {
  Object.defineProperty(document, "visibilityState", { value: visible ? "visible" : "hidden", configurable: true })
}

type Call = keyof typeof api

// The next call of this function of the fake server does not answer until the test says so.
function hold(name: Call): { answer: (value: unknown) => void; fail: (error: unknown) => void } {
  let answer: (value: unknown) => void = () => {}
  let fail: (error: unknown) => void = () => {}
  api[name].mockImplementationOnce(
    () =>
      new Promise((resolve, reject) => {
        answer = resolve
        fail = reject
      }),
  )
  return { answer: (value) => answer(value), fail: (error) => fail(error) }
}

async function release(run: () => void): Promise<void> {
  await act(async () => {
    run()
    await vi.advanceTimersByTimeAsync(0)
  })
}

// The next call of this function works as usual, and after it the fake server is down: what the screen shows is then what the answer of that call said, because the reading that follows fails.
function breakAfter(name: Call): void {
  const real = api[name].getMockImplementation()
  api[name].mockImplementationOnce(async (...args: unknown[]) => {
    const reply = await real?.(...args)
    server.down = new TimerError("NO_CONNECTION")
    return reply
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers()
  vi.setSystemTime(T0)
  server = { row: null, saved: {}, offsetMs: 0, down: null }
  renders = 0
  for (const fn of Object.values(api)) fn.mockReset()
  installFakeServer()
  setVisible(true)
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.useRealTimers()
})

describe("useTimer: reading", () => {
  it("shows an idle timer with the saved total of the day when nothing runs", async () => {
    server.saved["2026-10-07"] = 5400
    await mount()
    expect(view.link).toBe("online")
    expect(view.status).toBe("idle")
    expect(view.seconds).toBe(0)
    expect(view.dayTotal).toBe(5400)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-07")
  })

  it("shows the seconds of a running session, and the day total counts the running session too", async () => {
    server.row = runningRow(100)
    server.saved["2026-10-07"] = 1000
    await mount()
    expect(view.status).toBe("running")
    expect(view.seconds).toBe(100)
    expect(view.dayTotal).toBe(1100)
    await settle(7000)
    expect(view.seconds).toBe(107)
    expect(view.dayTotal).toBe(1107)
  })

  it("works the seconds out from the stored times: a phone that slept for 10 minutes loses nothing", async () => {
    server.row = runningRow(100)
    await mount()
    vi.setSystemTime(Date.now() + 600_000)
    await settle(250)
    expect(view.seconds).toBe(700)
  })

  it("follows the clock of the server, not the clock of the device", async () => {
    server.offsetMs = 3_600_000
    server.row = runningRow(100)
    await mount()
    expect(view.seconds).toBe(100)
    await settle(5000)
    expect(view.seconds).toBe(105)
  })

  it("shows a paused session with frozen seconds", async () => {
    server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow() - 40_000), paused_seconds: 10 })
    await mount()
    expect(view.status).toBe("paused")
    expect(view.seconds).toBe(50)
    await settle(20_000)
    expect(view.seconds).toBe(50)
  })

  it("uses the ring seed of the running session, and an empty seed when nothing runs", async () => {
    await mount()
    expect(view.ringSeed).toBe("")
    server.row = runningRow(10)
    await press(view.retry)
    expect(view.ringSeed).toBe(server.row.started_at)
  })
})

describe("useTimer: the buttons", () => {
  it("Start sends the time zone of the device and shows a running session", async () => {
    await mount()
    await press(view.start)
    expect(api.timerStart).toHaveBeenCalledWith("Asia/Kolkata")
    expect(view.status).toBe("running")
    expect(view.busy).toBe(false)
    await settle(3000)
    expect(view.seconds).toBe(3)
  })

  it("Pause freezes the seconds and Resume lets them run again", async () => {
    server.row = runningRow(100)
    await mount()
    await press(view.pause)
    expect(view.status).toBe("paused")
    const frozen = view.seconds
    await settle(10_000)
    expect(view.seconds).toBe(frozen)
    await press(view.resume)
    expect(view.status).toBe("running")
    await settle(5000)
    expect(view.seconds).toBe(frozen + 5)
  })

  it("End saves a session of 60 seconds or more: a notice, the day total grows, back to idle", async () => {
    server.row = runningRow(125)
    server.saved["2026-10-07"] = 1000
    await mount()
    await press(view.end)
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: true, capped: false, seconds: 125 })
    expect(view.dayTotal).toBe(1125)
  })

  it("End of a session under 60 seconds is not saved: the notice says so and the total stays", async () => {
    server.row = runningRow(30)
    server.saved["2026-10-07"] = 1000
    await mount()
    await press(view.end)
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: false, capped: false, seconds: null })
    expect(view.dayTotal).toBe(1000)
  })

  it("a new Start clears the notice of the session that was ended before", async () => {
    server.row = runningRow(125)
    await mount()
    await press(view.end)
    expect(view.notice).not.toBeNull()
    await press(view.start)
    expect(view.notice).toBeNull()
  })

  it("a button pressed twice in a row sends one call", async () => {
    await mount()
    let release: () => void = () => {}
    api.timerStart.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => {
            server.row = runningRow(0)
            resolve({ serverNowMs: serverNow(), row: server.row })
          }
        }),
    )
    await act(async () => {
      view.start()
      view.start()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.busy).toBe(true)
    await act(async () => {
      release()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerStart).toHaveBeenCalledTimes(1)
    expect(view.busy).toBe(false)
    expect(view.status).toBe("running")
  })
})

describe("useTimer: the state changed on another device", () => {
  it("Start finds a session already running: the screen reads again and shows it, with no error text", async () => {
    await mount()
    server.row = runningRow(40)
    await press(view.start)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.status).toBe("running")
    expect(view.seconds).toBe(40)
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
  })

  it("Pause finds nothing running: the screen reads again and shows idle", async () => {
    server.row = runningRow(100)
    await mount()
    server.row = null
    await press(view.pause)
    expect(view.status).toBe("idle")
    expect(view.link).toBe("online")
  })

  it("Resume finds the session not paused: the screen reads again and shows running", async () => {
    server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow() - 5000) })
    await mount()
    server.row = runningRow(100)
    await press(view.resume)
    expect(view.status).toBe("running")
    expect(view.link).toBe("online")
  })

  it("an old slow answer does not overwrite a newer state", async () => {
    await mount()
    let late: () => void = () => {}
    api.timerState.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          late = () => resolve({ serverNowMs: serverNow(), row: null })
        }),
    )
    await press(view.retry)
    await press(view.start)
    expect(view.status).toBe("running")
    await act(async () => {
      late()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.status).toBe("running")
  })
})

describe("useTimer: no connection and problems", () => {
  it("without a connection the link is offline and every button does nothing", async () => {
    server.down = new TimerError("NO_CONNECTION")
    await mount()
    expect(view.link).toBe("offline")
    await press(view.start)
    expect(api.timerStart).not.toHaveBeenCalled()
  })

  it("while offline it tries again after 3 seconds (not before) and recovers when the connection is back", async () => {
    server.down = new TimerError("NO_CONNECTION")
    await mount()
    expect(api.timerState).toHaveBeenCalledTimes(1)
    await settle(POLL_OFFLINE_MS - 1000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    await settle(1000)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.link).toBe("offline")
    server.down = null
    await settle(POLL_OFFLINE_MS)
    expect(view.link).toBe("online")
  })

  it("the browser saying offline switches the screen to offline at once, and online reads again", async () => {
    await mount()
    expect(view.link).toBe("online")
    await act(async () => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(view.link).toBe("offline")
    await act(async () => {
      window.dispatchEvent(new Event("online"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.link).toBe("online")
  })

  it("a session that was running stays on the screen while the connection is lost", async () => {
    server.row = runningRow(100)
    await mount()
    server.down = new TimerError("NO_CONNECTION")
    await settle(POLL_ONLINE_MS)
    expect(view.link).toBe("offline")
    expect(view.status).toBe("running")
    expect(view.seconds).toBeGreaterThanOrEqual(130)
  })

  it("a problem the app cannot fix shows its text, and Try again reads again", async () => {
    server.down = new TimerError("BAD_REPLY")
    await mount()
    expect(view.link).toBe("problem")
    expect(view.problem).toBe(problemText("BAD_REPLY"))
    server.down = null
    await press(view.retry)
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
  })

  it("a failed button shows the problem text and keeps the screen as it was", async () => {
    server.row = runningRow(100)
    await mount()
    server.down = new TimerError("UNKNOWN")
    await press(view.pause)
    expect(view.link).toBe("problem")
    expect(view.problem).toBe(problemText("UNKNOWN"))
    expect(view.status).toBe("running")
    expect(view.busy).toBe(false)
  })
})

describe("useTimer: reading again", () => {
  it("online it reads again every 30 seconds (not before)", async () => {
    await mount()
    await settle(POLL_ONLINE_MS - 1000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    await settle(1000)
    expect(api.timerState).toHaveBeenCalledTimes(2)
  })

  it("a page that is hidden does not read, and reads again when it comes back", async () => {
    await mount()
    setVisible(false)
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    setVisible(true)
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerState).toHaveBeenCalledTimes(2)
  })

  it("a page that turns hidden does not read (the event of the change is not a reason by itself)", async () => {
    await mount()
    setVisible(false)
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("the browser saying offline does not hide a problem the screen is showing", async () => {
    server.down = new TimerError("BAD_REPLY")
    await mount()
    expect(view.link).toBe("problem")
    await act(async () => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(view.link).toBe("problem")
    expect(view.problem).toBe(problemText("BAD_REPLY"))
  })

  it("while a button is working the screen does not read again on its own", async () => {
    await mount()
    hold("timerStart")
    await press(view.start)
    expect(view.busy).toBe(true)
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("while the first reading has no answer yet the screen does not start a second one", async () => {
    hold("timerState")
    await mount()
    expect(view.link).toBe("loading")
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("a page restored from the back button (pageshow) reads again", async () => {
    await mount()
    await act(async () => {
      window.dispatchEvent(new Event("pageshow"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerState).toHaveBeenCalledTimes(2)
  })

  it("a change made on another device appears with the next read", async () => {
    await mount()
    expect(view.status).toBe("idle")
    server.row = runningRow(20)
    await settle(POLL_ONLINE_MS)
    expect(view.status).toBe("running")
  })
})

describe("useTimer: midnight", () => {
  it("a session still running at local midnight is ended once, and the notice says the day ended", async () => {
    server.row = runningRow(100, { cap_at: iso(T0 + 5000) })
    await mount()
    expect(api.timerEnd).not.toHaveBeenCalled()
    await settle(6000)
    expect(api.timerEnd).toHaveBeenCalledTimes(1)
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: true, capped: true, seconds: 105 })
  })

  it("a new day that begins while nothing runs reads the day total of the new day", async () => {
    vi.setSystemTime(Date.parse("2026-10-07T18:29:50Z"))
    server.saved["2026-10-07"] = 3000
    server.saved["2026-10-08"] = 0
    await mount()
    expect(view.dayTotal).toBe(3000)
    await settle(15_000)
    expect(api.timerDayTotal).toHaveBeenLastCalledWith("2026-10-08")
    expect(view.dayTotal).toBe(0)
  })
})

describe("useTimer: the new day while nothing runs", () => {
  it("reads the new day only once when the server still says it is the old day (no loop)", async () => {
    // 1 second before local midnight. The next reading says the server is 0.5 seconds behind: less than 1.5 seconds, so the old time base is kept
    // and the screen believes it is the new day while the reading still holds the old day.
    vi.setSystemTime(Date.parse("2026-10-07T18:29:59Z"))
    server.saved["2026-10-07"] = 3000
    server.saved["2026-10-08"] = 0
    await mount()
    expect(view.dayTotal).toBe(3000)
    server.offsetMs = -500
    const real = api.timerState.getMockImplementation()
    let calls = 0
    api.timerState.mockImplementation(async (...args: unknown[]) => {
      calls += 1
      // A safety stop for the test itself: a screen that reads without end is stopped by a failing server.
      if (calls > 30) server.down = new TimerError("UNKNOWN")
      return real?.(...args)
    })
    // Small steps, each in its own act, so that the screen is drawn at the moment of midnight and not after it.
    for (let step = 0; step < 20; step += 1) await settle(250)
    expect(calls).toBe(1)
    expect(view.link).toBe("online")
  })

  it("with no connection the new day is not read at once: only the retry every 3 seconds reads", async () => {
    vi.setSystemTime(Date.parse("2026-10-07T18:29:50Z"))
    server.saved["2026-10-07"] = 3000
    server.saved["2026-10-08"] = 700
    await mount()
    server.down = new TimerError("NO_CONNECTION")
    await act(async () => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(view.link).toBe("offline")
    const before = api.timerState.mock.calls.length
    // Midnight comes after 10 seconds. The retries are at 3, 6 and 9 seconds. An extra read at midnight would be a fourth call.
    await settle(10_500)
    expect(api.timerState.mock.calls.length - before).toBe(3)
    server.down = null
    await act(async () => {
      window.dispatchEvent(new Event("online"))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(view.link).toBe("online")
    expect(api.timerDayTotal).toHaveBeenLastCalledWith("2026-10-08")
    expect(view.dayTotal).toBe(700)
  })
})

describe("useTimer: leaving the screen", () => {
  it("after the screen is closed nothing is read any more", async () => {
    await mount()
    act(() => root?.unmount())
    root = null
    await settle(120_000)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("an answer that arrives after the screen was closed does no harm", async () => {
    let late: () => void = () => {}
    api.timerState.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          late = () => resolve({ serverNowMs: serverNow(), row: null })
        }),
    )
    await mount()
    act(() => root?.unmount())
    root = null
    await act(async () => {
      late()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(api.timerDayTotal).not.toHaveBeenCalled()
  })
})
describe("useTimer: answers that come too late", () => {
  it("an old slow answer of the state is dropped before it asks for the day total, and does not overwrite a newer reading", async () => {
    await mount()
    const old = hold("timerState")
    await press(view.retry)
    server.row = runningRow(40)
    await press(view.retry)
    expect(view.status).toBe("running")
    const dayTotalCalls = api.timerDayTotal.mock.calls.length
    await release(() => old.answer({ serverNowMs: serverNow(), row: null }))
    expect(view.status).toBe("running")
    expect(api.timerDayTotal.mock.calls.length).toBe(dayTotalCalls)
  })

  it("an old slow answer of the day total does not overwrite a newer reading", async () => {
    await mount()
    const old = hold("timerDayTotal")
    await press(view.retry)
    server.saved["2026-10-07"] = 2000
    await press(view.retry)
    expect(view.dayTotal).toBe(2000)
    await release(() => old.answer(5))
    expect(view.dayTotal).toBe(2000)
  })

  it("an old slow failure does not hide a newer reading", async () => {
    await mount()
    const old = hold("timerState")
    await press(view.retry)
    await press(view.retry)
    expect(view.link).toBe("online")
    await release(() => old.fail(new TimerError("NO_CONNECTION")))
    expect(view.link).toBe("online")
    expect(view.problem).toBe("")
  })

  it("a reading asked for before a button was pressed does not change the screen while the button works", async () => {
    server.row = runningRow(100)
    await mount()
    const old = hold("timerState")
    await press(view.retry)
    const pause = hold("timerPause")
    await press(view.pause)
    expect(view.busy).toBe(true)
    await release(() => old.answer({ serverNowMs: serverNow(), row: null }))
    expect(view.status).toBe("running")
    await release(() => {
      server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow()) })
      pause.answer({ serverNowMs: serverNow(), row: server.row })
    })
    expect(view.status).toBe("paused")
  })
})

describe("useTimer: what a button does with its answer", () => {
  it("after a button worked, the state and the day total are read again", async () => {
    await mount()
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
    await press(view.start)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(api.timerDayTotal).toHaveBeenCalledTimes(2)
  })

  it.each(["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED"] as const)(
    "%s means that the state changed: the screen reads again, shows what is true, and shows no problem",
    async (kind) => {
      server.row = runningRow(100)
      await mount()
      api.timerPause.mockImplementationOnce(async () => {
        throw new TimerError(kind)
      })
      server.row = null
      await press(view.pause)
      expect(api.timerState).toHaveBeenCalledTimes(2)
      expect(view.status).toBe("idle")
      expect(view.link).toBe("online")
      expect(view.problem).toBe("")
    },
  )

  it.each(["NOT_SIGNED_IN", "BAD_TIMEZONE", "BAD_REPLY", "NOT_READY", "UNKNOWN"] as const)(
    "%s is a problem of its own: its text is shown, nothing is read again, the screen stays as it was",
    async (kind) => {
      server.row = runningRow(100)
      await mount()
      api.timerPause.mockImplementationOnce(async () => {
        throw new TimerError(kind)
      })
      await press(view.pause)
      expect(api.timerState).toHaveBeenCalledTimes(1)
      expect(view.link).toBe("problem")
      expect(view.problem).toBe(problemText(kind))
      expect(view.status).toBe("running")
      expect(view.busy).toBe(false)
    },
  )

  it("a button that finds no connection switches the screen to offline and reads nothing again at once", async () => {
    server.row = runningRow(100)
    await mount()
    api.timerPause.mockImplementationOnce(async () => {
      throw new TimerError("NO_CONNECTION")
    })
    await press(view.pause)
    expect(view.link).toBe("offline")
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(view.status).toBe("running")
  })

  it("End puts the day total of its own answer on the screen, also when the reading that follows fails", async () => {
    server.row = runningRow(125)
    server.saved["2026-10-07"] = 1000
    await mount()
    breakAfter("timerEnd")
    await press(view.end)
    expect(view.link).toBe("offline")
    expect(view.status).toBe("idle")
    expect(view.notice).toEqual({ saved: true, capped: false, seconds: 125 })
    expect(view.dayTotal).toBe(1125)
  })

  it("End of a session under 60 seconds takes the running seconds out of the day total, also when the reading that follows fails", async () => {
    server.row = runningRow(30)
    server.saved["2026-10-07"] = 1000
    await mount()
    expect(view.dayTotal).toBe(1030)
    breakAfter("timerEnd")
    await press(view.end)
    expect(view.status).toBe("idle")
    expect(view.dayTotal).toBe(1000)
  })

  it.each([
    ["start", 1000],
    ["pause", 1100],
    ["resume", 1080],
  ] as const)("%s keeps the saved total of the day, also when the reading that follows fails", async (name, total) => {
    if (name === "pause") server.row = runningRow(100)
    if (name === "resume") server.row = runningRow(100, { status: "paused", paused_at: iso(serverNow() - 20_000) })
    server.saved["2026-10-07"] = 1000
    await mount()
    breakAfter(name === "start" ? "timerStart" : name === "pause" ? "timerPause" : "timerResume")
    await press(name === "start" ? view.start : name === "pause" ? view.pause : view.resume)
    expect(view.link).toBe("offline")
    expect(view.dayTotal).toBe(total)
  })
})

describe("useTimer: the clock", () => {
  it("puts the server time of an answer in the middle of the call that fetched it", async () => {
    const row = runningRow(100)
    api.timerState.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 4000))
      return { serverNowMs: T0 + 2000, row }
    })
    await mount()
    await settle(4000)
    expect(view.status).toBe("running")
    expect(view.seconds).toBe(104)
  })

  it("a new reading of the server time that differs by less than 1.5 seconds does not move the seconds", async () => {
    server.row = runningRow(100)
    await mount()
    expect(view.seconds).toBe(100)
    server.offsetMs = 1499
    await settle(POLL_ONLINE_MS)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.seconds).toBe(130)
  })

  it("a new reading of the server time that differs by 1.5 seconds or more replaces the old one", async () => {
    server.row = runningRow(100)
    await mount()
    server.offsetMs = 1500
    await settle(POLL_ONLINE_MS)
    expect(api.timerState).toHaveBeenCalledTimes(2)
    expect(view.seconds).toBe(131)
  })

  it("draws the screen once per second, not at every look of the clock", async () => {
    server.row = runningRow(100)
    await mount()
    const before = renders
    // One look of the clock per step, each step in its own act, so that React cannot join the drawings of several looks into one.
    for (let step = 0; step < 40; step += 1) await settle(250)
    // 10 seconds: one drawing per second, and React adds one more that changes nothing. A clock that draws at every look would give 40.
    expect(renders - before).toBeGreaterThanOrEqual(9)
    expect(renders - before).toBeLessThanOrEqual(24)
  })

  it("stops all its timers when the screen is closed", async () => {
    await mount()
    act(() => root?.unmount())
    root = null
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("useTimer: the time zone of the session", () => {
  it("the day total is read for the day in the time zone of the running session, not of the device", async () => {
    // 20:00 UTC is 16:00 on 7 October in New York, and already 01:30 on 8 October in Asia/Kolkata (the zone of this device).
    vi.setSystemTime(Date.parse("2026-10-07T20:00:00Z"))
    server.row = runningRow(100, { tz: "America/New_York", cap_at: "2026-10-08T04:00:00+00:00" })
    await mount()
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-07")
  })

  it("with nothing running the day is the day of the device", async () => {
    vi.setSystemTime(Date.parse("2026-10-07T20:00:00Z"))
    await mount()
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-08")
  })
})
// AB:TIMER.TESTS:END
```

Create the file `src/components/TimerScreen.test.tsx` with exactly this content (everything inside the block below):
```tsx
// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The timer hook is replaced by a view that each test fills in, so this file only tests what the screen draws and which buttons it wires.
const state = vi.hoisted(() => ({ view: null as unknown }))
vi.mock("@/lib/useTimer", () => ({ useTimer: () => state.view }))

import { RING_FIRST_COLOR, formatClock, qualityOf, ringColor, ringFill, ringLoop } from "@/lib/timerMaths"
import type { TimerView } from "@/lib/useTimer"
import TimerScreen from "./TimerScreen"

// AB:TIMER.TESTS:START
// The css files are read as plain text from the project root, where npm test runs (vitest turns an imported css file into nothing, also with ?raw).
const timerCss = readFileSync("src/timer.css", "utf8")
const fontCss = readFileSync("node_modules/@fontsource-variable/space-grotesk/index.css", "utf8")

const SEED = "2026-10-07T10:00:00+00:00"

function makeView(over: Partial<TimerView> = {}): TimerView {
  return {
    link: "online",
    problem: "",
    busy: false,
    status: "idle",
    seconds: 0,
    dayTotal: 0,
    ringSeed: "",
    notice: null,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    end: vi.fn(),
    retry: vi.fn(),
    ...over,
  }
}

let root: Root | null = null
let container: HTMLElement | null = null

function show(over: Partial<TimerView> = {}): TimerView {
  const view = makeView(over)
  state.view = view
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(TimerScreen)))
  return view
}

function q(selector: string): HTMLElement {
  const found = container?.querySelector<HTMLElement>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function pointer(type: string): Event {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0 })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  // The Hold Button watches its own size; jsdom has no ResizeObserver.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.useFakeTimers()
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("TimerScreen: what it shows", () => {
  it("shows the big clock of the session and the small clock of the day", () => {
    show({ status: "running", seconds: 3725, dayTotal: 7300 })
    expect(q(".ab-timer-big").textContent).toBe(formatClock(3725))
    expect(q(".ab-timer-big").getAttribute("role")).toBe("timer")
    expect(q(".ab-timer-small").textContent).toBe(formatClock(7300))
  })

  it("hands its state to the css as two attributes of the main element", () => {
    show({ link: "loading", status: "idle" })
    expect(q("main.ab-timer").getAttribute("data-state")).toBe("idle")
    expect(q("main.ab-timer").getAttribute("data-link")).toBe("loading")
    show({ link: "online", status: "paused", seconds: 100 })
    expect(q("main.ab-timer").getAttribute("data-state")).toBe("paused")
    expect(q("main.ab-timer").getAttribute("data-link")).toBe("online")
  })

  it("keeps the line under the dial empty when there is nothing to say", () => {
    show()
    expect(q(".ab-timer-note").textContent).toBe("")
  })

  it("says that there is no connection", () => {
    show({ link: "offline" })
    expect(q(".ab-timer-note").textContent).toContain("No connection")
  })

  it("shows the problem text and a Try again button that reads again", () => {
    const view = show({ link: "problem", problem: "The timer got an answer it could not read." })
    expect(q(".ab-timer-note").textContent).toBe("The timer got an answer it could not read.")
    act(() => q(".ab-timer-retry").click())
    expect(view.retry).toHaveBeenCalledTimes(1)
  })

  it("has no Try again button when there is no problem", () => {
    show({ link: "online" })
    expect(has(".ab-timer-retry")).toBe(false)
    show({ link: "offline" })
    expect(has(".ab-timer-retry")).toBe(false)
  })

  it("tells what happened to the session that was just ended", () => {
    show({ notice: { saved: true, capped: false, seconds: 2000 } })
    const saved = q(".ab-timer-note").textContent ?? ""
    expect(saved).toContain("Saved " + formatClock(2000))
    expect(saved).toContain(qualityOf(2000))
    expect(saved).not.toContain("midnight")
    show({ notice: { saved: false, capped: false, seconds: null } })
    expect(q(".ab-timer-note").textContent).toContain("not saved")
    show({ notice: { saved: true, capped: true, seconds: 600 } })
    expect(q(".ab-timer-note").textContent).toContain("Day ended at midnight.")
    expect(q(".ab-timer-note").textContent).toContain("Saved " + formatClock(600))
    show({ notice: { saved: false, capped: true, seconds: null } })
    expect(q(".ab-timer-note").textContent).toContain("Day ended at midnight.")
    expect(q(".ab-timer-note").textContent).toContain("not saved")
  })

  it("a session that was not saved says so, whatever the seconds in the notice say", () => {
    show({ notice: { saved: false, capped: false, seconds: 125 } })
    expect(q(".ab-timer-note").textContent).toContain("not saved")
    expect(q(".ab-timer-note").textContent).not.toContain("Saved")
  })

  it("puts no connection and problems before the notice", () => {
    const notice = { saved: true, capped: false, seconds: 2000 }
    show({ link: "offline", notice })
    expect(q(".ab-timer-note").textContent).toContain("No connection")
    show({ link: "problem", problem: "Something went wrong.", notice })
    expect(q(".ab-timer-note").textContent).toBe("Something went wrong.")
  })
})

describe("TimerScreen: the ring", () => {
  it("is drawn in a box of 100 with a radius of 45, starting at the top", () => {
    show()
    expect(q("svg.ab-timer-ring").getAttribute("viewBox")).toBe("0 0 100 100")
    for (const selector of [".ab-timer-track", ".ab-timer-arc"]) {
      expect(q(selector).getAttribute("r")).toBe("45")
      expect(q(selector).getAttribute("cx")).toBe("50")
      expect(q(selector).getAttribute("cy")).toBe("50")
      expect(q(selector).getAttribute("transform")).toBe("rotate(-90 50 50)")
    }
    expect(q(".ab-timer-arc").getAttribute("pathLength")).toBe("1")
  })

  it("is empty when idle", () => {
    show({ status: "idle", seconds: 0 })
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("0")
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe("0 1")
  })

  it("is empty when idle, whatever the seconds say", () => {
    show({ status: "idle", seconds: 1234, ringSeed: SEED })
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("0")
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe("0 1")
  })

  it("fills the first loop in white, and the track is a faint white", () => {
    show({ status: "running", seconds: 1800, ringSeed: SEED })
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe(ringFill(1800) + " 1")
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("1")
    expect(q(".ab-timer-arc").getAttribute("stroke")).toBe(RING_FIRST_COLOR)
    expect(q(".ab-timer-track").getAttribute("stroke")).toBe("rgba(255, 255, 255, 0.14)")
  })

  it("starts the second loop in a neon colour on a track in the colour of the loop before", () => {
    show({ status: "running", seconds: 3725, ringSeed: SEED })
    expect(ringLoop(3725)).toBe(1)
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe(ringFill(3725) + " 1")
    expect(q(".ab-timer-arc").getAttribute("stroke")).toBe(ringColor(1, SEED))
    expect(q(".ab-timer-arc").getAttribute("stroke")).not.toBe(RING_FIRST_COLOR)
    expect(q(".ab-timer-track").getAttribute("stroke")).toBe(ringColor(0, SEED))
  })

  it("shows a paused session with its ring in place", () => {
    show({ status: "paused", seconds: 1800, ringSeed: SEED })
    expect(q(".ab-timer-arc").getAttribute("stroke-dasharray")).toBe(ringFill(1800) + " 1")
    expect(q(".ab-timer-arc").getAttribute("opacity")).toBe("1")
  })
})

describe("TimerScreen: the buttons", () => {
  it("shows nothing to press while the first reading is loading", () => {
    show({ link: "loading" })
    expect(has("button")).toBe(false)
  })

  it("idle: one Start button, and it starts", () => {
    const view = show({ status: "idle" })
    expect(q(".ab-timer-pill").textContent).toBe("Start")
    expect(has(".ab-timer-end")).toBe(false)
    act(() => q(".ab-timer-pill").click())
    expect(view.start).toHaveBeenCalledTimes(1)
  })

  it("running: Pause and the Hold Button, no Start; Pause pauses", () => {
    const view = show({ status: "running", seconds: 100 })
    expect(q(".ab-timer-pill").textContent).toBe("Pause")
    expect(q(".ab-timer-end").textContent).toContain("Hold to end session")
    expect(document.querySelectorAll(".ab-timer-pill").length).toBe(1)
    act(() => q(".ab-timer-pill").click())
    expect(view.pause).toHaveBeenCalledTimes(1)
    expect(view.resume).not.toHaveBeenCalled()
  })

  it("paused: Resume and the Hold Button; Resume resumes", () => {
    const view = show({ status: "paused", seconds: 100 })
    expect(q(".ab-timer-pill").textContent).toBe("Resume")
    expect(has(".ab-timer-end")).toBe(true)
    act(() => q(".ab-timer-pill").click())
    expect(view.resume).toHaveBeenCalledTimes(1)
    expect(view.pause).not.toHaveBeenCalled()
  })

  it.each([
    ["without a connection", { link: "offline" as const }],
    ["while a call is on its way", { busy: true }],
    ["after a problem", { link: "problem" as const, problem: "x" }],
  ])("every button is off %s", (_name, extra) => {
    show({ status: "idle", ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    show({ status: "running", seconds: 100, ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(true)
    show({ status: "paused", seconds: 100, ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(true)
  })

  it("every button is on when online and not busy", () => {
    show({ status: "running", seconds: 100 })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(false)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(false)
  })

  it("the Hold Button ends the session only after it was held for 1.5 seconds", async () => {
    const view = show({ status: "running", seconds: 100 })
    const hold = q(".ab-timer-end")
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(1400)
    })
    expect(view.end).not.toHaveBeenCalled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(view.end).toHaveBeenCalledTimes(1)
  })

  it("a short tap or a hold that is let go early does not end the session", async () => {
    const view = show({ status: "running", seconds: 100 })
    const hold = q(".ab-timer-end")
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(100)
      hold.dispatchEvent(pointer("pointerup"))
      await vi.advanceTimersByTimeAsync(3000)
    })
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(1000)
      hold.dispatchEvent(pointer("pointerup"))
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(view.end).not.toHaveBeenCalled()
  })
})

describe("the css of the screen", () => {
  it("keeps the stroke width of the ring at 10 or less, so the ring (radius 45 in a box of 100) stays inside its box", () => {
    const widths = [...timerCss.matchAll(/stroke-width:\s*([0-9.]+)/g)].map((m) => Number(m[1]))
    expect(widths.length).toBeGreaterThan(0)
    for (const width of widths) expect(45 + width / 2).toBeLessThanOrEqual(50)
  })

  it("loads Space Grotesk, names the font as the package does, and uses a weight the font has", () => {
    expect(timerCss).toContain('@import "@fontsource-variable/space-grotesk";')
    const screenBlock = /\.ab-timer \{([^}]*)\}/.exec(timerCss)?.[1] ?? ""
    const family = /font-family:\s*"([^"]+)"/.exec(screenBlock)?.[1] ?? ""
    expect(family).toBe("Space Grotesk Variable")
    expect(fontCss).toContain("font-family: '" + family + "'")
    expect(fontCss).toContain("font-weight: 300 700")
    for (const selector of [".ab-timer-big", ".ab-timer-small"]) {
      const block = new RegExp("\\" + selector + " \\{([^}]*)\\}").exec(timerCss)?.[1] ?? ""
      const weight = Number(/font-weight:\s*(\d+)/.exec(block)?.[1])
      expect(weight).toBeGreaterThanOrEqual(300)
      expect(weight).toBeLessThanOrEqual(700)
    }
  })

  it("switches on the fixed width digits for both clocks", () => {
    for (const selector of [".ab-timer-big", ".ab-timer-small"]) {
      const block = new RegExp("\\" + selector + " \\{([^}]*)\\}").exec(timerCss)?.[1] ?? ""
      expect(block).toContain("font-variant-numeric: tabular-nums;")
    }
  })

  it("reacts to the two attributes the screen sets", () => {
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-ring {')
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-big {')
    expect(timerCss).toContain('.ab-timer[data-link="loading"] .ab-timer-dial {')
  })
})
// AB:TIMER.TESTS:END
```

Create the file `src/components/SignedInStub.test.tsx` with exactly this content (everything inside the block below):
```tsx
// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The menu, the Pro Timer screen, the background and the database client are replaced by small stand-ins: this file only tests which screen the stub chooses and where the menu sits.
vi.mock("@/lib/supabase", () => ({ supabase: null }))
vi.mock("@/lib/lite", () => ({ LITE_LEVEL: 1 }))
vi.mock("@/components/DarkVeil", async () => {
  const { createElement: h } = await import("react")
  return { default: () => h("canvas", { id: "veil-stub" }) }
})
vi.mock("@/components/AppMenu", async () => {
  const { createElement: h } = await import("react")
  return { default: () => h("nav", { id: "menu-stub" }) }
})
vi.mock("@/components/TimerScreen", async () => {
  const { createElement: h } = await import("react")
  return { default: () => h("main", { id: "timer-stub" }) }
})

import SignedInStub from "./SignedInStub"

// AB:TIMER.TESTS:START
let root: Root | null = null
let container: HTMLElement | null = null

function open(hash: string): void {
  window.location.hash = hash
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(createElement(SignedInStub, { email: "owner@example.com" })))
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  window.location.hash = ""
})

describe("SignedInStub: which screen is shown", () => {
  it("shows the Pro Timer screen at #timer, and not the placeholder or the background", () => {
    open("#timer")
    expect(has("#timer-stub")).toBe(true)
    expect(has(".ab-stub")).toBe(false)
    expect(has("#veil-stub")).toBe(false)
  })

  it("keeps the menu beside the Pro Timer screen, never inside it", () => {
    open("#timer")
    const menu = container?.querySelector("#menu-stub") ?? null
    expect(menu).not.toBeNull()
    expect(menu?.closest("main")).toBeNull()
    expect(container?.querySelectorAll("main").length).toBe(1)
  })

  it.each(["#overview", "#calendar", "#guide", "", "#nonsense"])("shows the placeholder with the menu beside it at %j", (hash) => {
    open(hash)
    expect(has(".ab-stub")).toBe(true)
    expect(has("#timer-stub")).toBe(false)
    expect(has("#veil-stub")).toBe(true)
    expect(container?.querySelector("#menu-stub")?.closest("main")).toBeNull()
  })

  it("follows the page address when the menu changes it", () => {
    open("#overview")
    expect(has("#timer-stub")).toBe(false)
    act(() => {
      window.location.hash = "#timer"
      window.dispatchEvent(new Event("hashchange"))
    })
    expect(has("#timer-stub")).toBe(true)
    act(() => {
      window.location.hash = "#guide"
      window.dispatchEvent(new Event("hashchange"))
    })
    expect(has("#timer-stub")).toBe(false)
    expect(container?.querySelector(".ab-stub-title")?.textContent).toBe("Guide")
  })
})
// AB:TIMER.TESTS:END
```

## STEP 6: Check that the nine files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/lib/timerApi.ts","src/lib/useTimer.ts","src/components/TimerScreen.tsx","src/timer.css","src/lib/timerApi.test.ts","src/lib/useTimer.test.ts","src/lib/useTimer.hook.test.ts","src/components/TimerScreen.test.tsx","src/components/SignedInStub.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these nine lines:
```
src/lib/timerApi.ts 1888395c41aa70489d51ed040aeea2f86ae7ce1ce269fe40feb1c3e1223b419b
src/lib/useTimer.ts 12e9773fbf23a50219606fe31c0b4f58c042d63b850d53648a48253195639327
src/components/TimerScreen.tsx e3084eec69ace554260786e21d90718b830e8672fe5aeba6b013ff67c34127bc
src/timer.css e35cd8e4ad20e7df2cfc6cff7f78dfe79634cf786ef886c10af1e5794a3472a1
src/lib/timerApi.test.ts 821154f7f609f0560f30a26129b75c827965dacf38b115cbbf8f85258f9816f8
src/lib/useTimer.test.ts 219eb073419142df355dfe4a1e70fe3ae85c6d08c423c5a87b2b0e5181d679f1
src/lib/useTimer.hook.test.ts 32913e6ed17edf09c1a44930a102770119bedca2e785256a4a113f091b230432
src/components/TimerScreen.test.tsx 2512bba95e7ef52a07986bb14a840aab05ef37ba28974acac707ae7d23312cdb
src/components/SignedInStub.test.tsx 28f09847af908cb54b35f94e8c5d8179aeaf306204e85fd8903093b841b16023
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: src/lib/timerApi.ts 197, src/lib/useTimer.ts 278, src/components/TimerScreen.tsx 100, src/timer.css 165, src/lib/timerApi.test.ts 488, src/lib/useTimer.test.ts 76, src/lib/useTimer.hook.test.ts 840, src/components/TimerScreen.test.tsx 337, src/components/SignedInStub.test.tsx 92.)

## STEP 7: Edit `src/components/SignedInStub.tsx`
Three additions. Do them one at a time. Change nothing else in the file. Each "find" line must be found EXACTLY ONCE in the file, as a whole line (the first two characters of the find line in 7c are spaces, they count). If a line is found zero times or more than once: **STOP** and report which one.

**7a.** Find this line:
```
import DarkVeil from "@/components/DarkVeil"
```
KEEP it. Directly BELOW it add this line:
```
import TimerScreen from "@/components/TimerScreen"
```

**7b.** Find this line:
```
export default function SignedInStub({ email }: { email: string }) {
```
KEEP it. Directly ABOVE it add this one comment line:
```
// The Pro Timer screen (#timer) is the one real screen: when it is chosen, TimerScreen is shown instead of this placeholder. It has its own plain black background (no Dark Veil), and AppMenu sits beside it in the same way. See CONNECTIONS.md C30.
```

**7c.** Find this line (it starts with two spaces):
```
  const title = SCREENS.find((s) => s.id === screen)?.label ?? ""
```
KEEP it. Directly BELOW it add these 8 lines (the first line starts with two spaces):
```
  if (screen === "timer") {
    return (
      <>
        <TimerScreen />
        <AppMenu />
      </>
    )
  }
```

Then run these two and copy the RAW output of each:
1. `git diff --numstat -- src/components/SignedInStub.tsx`
2. `git diff -- src/components/SignedInStub.tsx`

Command 1 must print `10`, a tab, `0`, a tab and the path (10 lines added, 0 removed). If it prints anything else: **STOP** and report the RAW outputs of both commands. Do not fix the file.

## STEP 8: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  6 passed (6)` and a line `Tests  407 passed (407)`. It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 9: Edit `CODE_MAP.md`
Four changes. Change nothing else in the file.

**9a.** Replace this whole line (in the "Page codes" table):
```
| TIMER | Pro Timer: the maths and its tests are built; the screen is not built yet |
```
with this whole line:
```
| TIMER | Pro Timer: the maths, the database calls, the live state, the screen (page address #timer) and their tests are built; the stop alert and the messages are not built yet |
```

**9b.** Replace this whole line (the `AB:TIMER.TESTS` row):
```
| `AB:TIMER.TESTS` | The automated tests of that maths. Run them with npm test | `src/lib/timerMaths.test.ts` | add tests; the numbers written in them must match the maths, see CONNECTIONS.md C27 |
```
with these four lines (four table rows, one after the other, no empty line between them):
```markdown
| `AB:TIMER.API` | The calls from the app to the six database functions of the Pro Timer, and the checking of every answer; turns a database error name into a name the screen understands | `src/lib/timerApi.ts` | the waiting time before "no connection" (REQUEST_TIMEOUT_MS, see CONNECTIONS.md C33); the error names, function names and answer keys are tied to supabase/timer_schema.sql (CONNECTIONS.md C28 and C29) |
| `AB:TIMER.STATE` | The live state of the Pro Timer screen (a React hook): reads the database again every 30 seconds and when the page comes back, works out the seconds from the stored times, runs the buttons Start, Pause, Resume and End, the no connection state and the midnight rule | `src/lib/useTimer.ts` | how often it reads again (POLL_ONLINE_MS and POLL_OFFLINE_MS, see CONNECTIONS.md C33); the texts of the problem messages (problemText) |
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the hour ring, the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Plain black background, Space Grotesk digits | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the ring stroke width must stay 10 or less, see CONNECTIONS.md C31; the fixed width digits must stay, see C32); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer: the maths, the database calls, the live state, the screen, and the choice of screen in the signed-in stub. Run them with npm test | `src/lib/timerMaths.test.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/SignedInStub.test.tsx` | add tests; the numbers and names written in them must match the code, see CONNECTIONS.md C27, C28, C29 and C33 |
```

**9c.** Find this piece of text inside a table row (it must be found EXACTLY ONCE in the whole file):
```
its title is the name of the screen chosen in the menu |
```
Replace just that piece of text with:
```
its title is the name of the screen chosen in the menu; when Pro Timer is chosen it shows the Pro Timer screen instead (see CONNECTIONS.md C30) |
```

**9d.** Look at the whole file for the text `HoldButton.tsx`. If it is found ANYWHERE: skip 9d, change nothing. If it is not found: find the line that starts with `| Staggered Menu (the menu) | `src/components/StaggeredMenu.tsx` | `AB:MENU.PANEL` |` (it must be found EXACTLY ONCE) and KEEP it. Directly BELOW it add this one line:
```
| Hold Button (the End Session button) | `src/components/HoldButton.tsx` | `AB:TIMER.SCREEN` |
```
Say in your reply which of the two happened (skipped or added).

## STEP 10: Edit `CONNECTIONS.md`
Add six new entries, C28 to C33. Change nothing else in the file. Find the line `## Things to know (no check is possible)`. KEEP that line. Directly ABOVE it add exactly this (it ends with one empty line, so there is an empty line between the new entries and that heading):
```markdown
### C28: The error names are written in the database, in the app's list and in the screen's rules
- Tags: `AB:TIMER.API`, `AB:TIMER.STATE`, `AB:TIMER.TESTS`
- If you change: an error name in supabase/timer_schema.sql (a line raise exception), the list DATABASE_ERRORS in timerApi.ts, the list CONFLICTS or the function problemText in useTimer.ts
- Then also: the SQL functions raise six names: ALREADY_RUNNING, NOT_RUNNING, NOT_PAUSED, DAY_ENDED, BAD_TIMEZONE and NOT_SIGNED_IN. The database client delivers the name as the text of the error; classifyError finds it there and makes a TimerError with that name. useTimer reacts to the names: the first four (the list CONFLICTS) mean that the state on the server is not what this screen showed, so the screen reads the state again and shows what is true; NOT_SIGNED_IN and BAD_TIMEZONE get their own text in problemText. A name must be the same in all three places. A change in the SQL file has to be run again in the Supabase SQL Editor by the owner (the agent cannot run SQL). The checker does not read SQL files, but npm test does: timerApi.test.ts reads the text of supabase/timer_schema.sql and fails when the SQL raises a name that is not in DATABASE_ERRORS, or the other way round. Old copies of the site in a phone browser keep working only if the names stay the same.
- If you forget: a button that does nothing, a state that is out of step with the other device, or an error shown as Something went wrong.
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "ALREADY_RUNNING",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_RUNNING",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_PAUSED",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "DAY_ENDED",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "BAD_TIMEZONE",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_SIGNED_IN",`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const CONFLICTS: readonly TimerErrorKind[] = ["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED"]`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = expect([...raised].sort()).toEqual([...DATABASE_ERRORS].sort())`
- Check by hand: after any change in supabase/timer_schema.sql run npm test (it reads that file), and the owner runs the changed SQL in the Supabase SQL Editor.

### C29: The calls to the database use the function names, argument names and answer keys of the SQL file
- Tags: `AB:TIMER.API`, `AB:TIMER.TESTS`
- If you change: the name of a function in supabase/timer_schema.sql (timer_state, timer_day_total, timer_start, timer_pause, timer_resume, timer_end), an argument name (p_tz, p_day), or a key in an answer (server_now, running, saved, capped, session, day, active_seconds, and the six fields of a running session)
- Then also: timerApi.ts calls each function by name through supabase.rpc and sends each argument by name. The readers (readStateReply, readRunningReply, readEndReply, readDayTotal and readTimerRow) read the keys by name and refuse anything else with the error BAD_REPLY. The six fields of a running session are the type TimerRow in timerMaths.ts (see C26). A name changed on one side only makes the call fail, or makes the screen say that the timer got an answer it could not read. The key server_now is read by the same line in two readers (readStateReply and readEndReply): the checker pins that line once and notices when it is gone from both, and npm test checks each reader. The SQL side is checked by npm test (timerApi.test.ts reads supabase/timer_schema.sql); the checker cannot read SQL. A change in the SQL file has to be run again in the Supabase SQL Editor by the owner.
- If you forget: Start, Pause, Resume or End fail, or the screen shows an error instead of the time.
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_state")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_day_total", { p_day: day })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_start", { p_tz: zone })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_pause")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_resume")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_end")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.server_now`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = const row = json.running === null ? null : readTimerRow(json.running)`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = if (typeof json.saved !== "boolean") return bad("saved is not true or false")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = if (typeof json.capped !== "boolean") return bad("capped is not true or false")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = const session = json.session`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = session.active_seconds`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = session.day`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = "timer_state()", "timer_day_total(p_day date)", "timer_start(p_tz text)", "timer_pause()", "timer_resume()", "timer_end()"`
- Check by hand: after any change in supabase/timer_schema.sql run npm test (it reads that file), and the owner runs the changed SQL in the Supabase SQL Editor.

### C30: The Pro Timer screen is chosen by the screen id timer, and the menu stays beside it
- Tags: `AB:MENU.NAV`, `AB:AUTH.STUB`, `AB:TIMER.SCREEN`
- If you change: the id timer in SCREENS (screens.ts), the choice of screen in SignedInStub.tsx, the place of AppMenu there, or the main element of TimerScreen.tsx and its class ab-timer
- Then also: SignedInStub asks useScreen which screen the page address chose. When the id is timer it shows TimerScreen and, BESIDE it and not inside it, AppMenu (the same rule as C25), and nothing else: no Dark Veil, no title, no Sign out button. The other three ids still show the temporary placeholder with Dark Veil and the Sign out button (C23). The Pro Timer screen has its own plain black background (the rule .ab-timer in timer.css) and does not use the box .ab-bg. If the id timer is renamed, the menu item Pro Timer shows the placeholder instead of the timer. The Sign out button is not on the timer screen yet. The tests in SignedInStub.test.tsx check which screen is shown and that the menu sits beside it.
- If you forget: the menu item Pro Timer shows the placeholder, the timer is drawn twice, or the menu button is hidden behind the timer.
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = { id: "timer", label: "Pro Timer" },`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = if (screen === "timer") {`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = <TimerScreen />`
- Anchor: `src/components/SignedInStub.tsx = import TimerScreen from "@/components/TimerScreen"`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <main className="ab-timer" data-state={timer.status} data-link={timer.link}>`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer {`
- Check by hand: after any change open the page address #timer on a laptop and on the phone. The timer is on a black screen, the menu button is in the top right corner and opens the panel, a tap on Overview shows the placeholder with the moving background again, and a tap on Pro Timer shows the timer.

### C31: The ring is drawn in a box of 100 by 100, so its stroke width in the css must stay 10 or less
- Tags: `AB:TIMER.SCREEN`
- If you change: the box (viewBox) or the radius of the two ring circles in TimerScreen.tsx, the way the arc is drawn (pathLength and strokeDasharray), or the stroke-width of .ab-timer-track and .ab-timer-arc in timer.css
- Then also: the ring is two circles with the radius 45 in a box of 100 by 100, so a stroke of up to 10 stays inside the box (45 plus half of 10 is 50). A thicker stroke is cut off at the edge of the box. The arc is drawn with pathLength 1 and the dash fill followed by 1, so fill is a number from 0 to 1 and the arc starts at the top (rotate -90). The stroke width itself is safe to tune up to 10 and is not pinned here; a test in TimerScreen.test.tsx reads timer.css and fails above 10.
- If you forget: the ring is cut off at the edges, or the arc is the wrong length.
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = viewBox="0 0 100 100"`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <circle className="ab-timer-track" cx="50" cy="50" r="45" stroke={trackColor} transform="rotate(-90 50 50)" />`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = pathLength={1}`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = strokeDasharray={fill + " 1"}`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer-track,`
- Check by hand: look at the ring on the phone while a session runs: the whole circle is inside the screen with nothing cut off at the edges.

### C32: The clock digits use Space Grotesk with fixed width digits, loaded from the font package
- Tags: `AB:TIMER.SCREEN`
- If you change: the font package, the font name in timer.css, the rules .ab-timer-big and .ab-timer-small, or the font weights
- Then also: timer.css loads the package @fontsource-variable/space-grotesk (installed by Packet 05C0) with one import line and names the font Space Grotesk Variable, the name the package gives it. A different name loads nothing and the screen falls back to the system font. The digits of Space Grotesk are not all the same width by default (555 to 648 units in the font file). Both clocks switch on font-variant-numeric: tabular-nums, which makes all ten digits 620 units wide at the weights 300 to 700; without it the clock would shake from side to side every second. The line with tabular-nums is in both clock rules: the checker notices when it is gone from both, the test checks each clock. The weight must stay between 300 and 700, the range of the font. The test the css of the screen in TimerScreen.test.tsx reads timer.css and the css file of the font package and checks the name, the weight range and tabular-nums on both clocks.
- If you forget: the clock shakes from side to side, or it is drawn in the system font.
- Anchor: `src/timer.css = @import "@fontsource-variable/space-grotesk";`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-family: "Space Grotesk Variable", system-ui, sans-serif;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-variant-numeric: tabular-nums;`
- Check by hand: on the phone let a session run through a minute change with different digits (for example from 11:11 to 11:12). The digits do not move sideways. The widths were checked in the font file, not yet on a phone.

### C33: The waiting times are written in the code and written again in the tests, on purpose
- Tags: `AB:TIMER.API`, `AB:TIMER.STATE`, `AB:TIMER.TESTS`
- If you change: REQUEST_TIMEOUT_MS in timerApi.ts, or POLL_ONLINE_MS, POLL_OFFLINE_MS or TIME_BASE_JITTER_MS in useTimer.ts
- Then also: the same numbers are written again in the tests, so that the tests say what was decided: a call without an answer after 15 seconds counts as no connection; the state is read again every 30 seconds, and every 3 seconds while there is no connection; a new reading of the server time replaces the old one only when the two differ by 1.5 seconds or more (otherwise the seconds would step back now and then). Change the code and its test in the same step and run npm test.
- If you forget: npm test fails, or this checker fails first.
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export const REQUEST_TIMEOUT_MS = 15000`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = export const POLL_ONLINE_MS = 30000`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = export const POLL_OFFLINE_MS = 3000`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = export const TIME_BASE_JITTER_MS = 1500`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = expect(REQUEST_TIMEOUT_MS).toBe(15000)`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.test.ts = expect(POLL_ONLINE_MS).toBe(30000)`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.test.ts = expect(POLL_OFFLINE_MS).toBe(3000)`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.test.ts = expect(TIME_BASE_JITTER_MS).toBe(1500)`

```

## STEP 11: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this one line:
```
- Packet 05C: the Pro Timer screen at the page address #timer (big clock of the session with the hour ring, small clock with the day total, Start, Pause and Resume, End Session as the Hold Button, a No connection state), the calls to the database (src/lib/timerApi.ts) and the live state (src/lib/useTimer.ts), with automated tests (npm test; jsdom installed for the screen tests). The stop alert and the messages come in later packets.
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 12: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 22 tags, 36 places
CONNECTIONS OK: 33 connections, 166 anchors, 34 classes, 1 css variables, 2 label links
```
(22 tags and 36 places: three new tags, nine new places. 33 connections and 166 anchors: the new entries C28 to C33. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `package-lock.json`, `package.json` and `src/components/SignedInStub.tsx`, and it may also list the two files named in the rules (they had changes before this packet). If ANY other tracked file is listed: **STOP** and report the COMPLETE output. Do not commit.

## STEP 13: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add package.json package-lock.json src/lib/timerApi.ts src/lib/useTimer.ts src/components/TimerScreen.tsx src/timer.css src/lib/timerApi.test.ts src/lib/useTimer.test.ts src/lib/useTimer.hook.test.ts src/components/TimerScreen.test.tsx src/components/SignedInStub.test.tsx src/components/SignedInStub.tsx CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05C: Pro Timer screen, database calls and live state"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output. The two files named in the rules and untracked files may still show: leave them alone.

## STEP 14: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (122 anchors) and `src/components/SignedInStub.tsx` had no uncommitted changes.
2. `npm ls jsdom --depth=0` showed `jsdom@30.1.2`.
3. The nine fingerprint lines of Step 6 matched exactly.
4. `git diff --numstat -- src/components/SignedInStub.tsx` printed 10 added and 0 removed lines.
5. `npm test` printed `Test Files  6 passed (6)` and `Tests  407 passed (407)`, and `npx tsc -b` printed nothing.
6. `node scripts/check-tags.mjs` printed the two lines of Step 12 (33 connections, 166 anchors).
7. `npm run build` finished with no errors.
8. `git show --stat HEAD` lists exactly these 15 files: `package.json`, `package-lock.json`, `src/lib/timerApi.ts`, `src/lib/useTimer.ts`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/SignedInStub.test.tsx`, `src/components/SignedInStub.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
9. The first line of `git log --oneline` ends with `Packet 05C: Pro Timer screen, database calls and live state`.
10. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
11. `git push` finished without an error.
12. No file other than the ones named in this packet was created, edited or committed.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 12 done-checks
- the RAW outputs of the 6 commands of Step 0 (and the output of `git diff -- src/components/SignedInStub.tsx` if Step 0 stopped)
- the RAW outputs of the 2 commands of Step 1
- the exact nine lines printed in Step 6
- the RAW outputs of the 2 commands of Step 7
- the last 12 lines of the output of `npm test`, and the output of `npx tsc -b` (or the word EMPTY)
- which of the two things happened in 9d (skipped or added)
- the exact output of `node scripts/check-tags.mjs` from Step 12
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 12
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 13
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.

---

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests use stand-ins for the database and a fake clock, so they cannot see the real screen. Look at it yourself, on the laptop and on the phone:
1. Sign in, open the menu, choose Pro Timer (the page address ends with `#timer`). Black screen, big clock `00:00:00` inside an empty ring, a small clock `00:00:00` under it, a white Start button. The menu button is in the top right corner and still works. The other three menu items still show the old placeholder with the moving background.
2. Tap Start. The big clock counts up every second and the ring starts to fill. Now there is a white Pause button and a dark button "Hold to end session".
3. Tap Pause: the digits blink slowly and the ring gets dim. Tap Resume: it counts again.
4. Hold the red-filling button for 1.5 seconds: the session ends. Under one minute the line under the clock says it was not saved; over one minute it says how long it was and the quality (meh, solid, deep or flow). A short tap or letting go early does nothing.
5. Phone and laptop together: start on one, then open the other. The second one shows the same running session (give it up to 30 seconds, or switch to its tab). Press Pause on one: the other follows.
6. Close the page while a session runs and open it again: the clock shows the real elapsed time.
7. Switch the phone to flight mode: the line says "No connection. Waiting to reconnect." and the buttons are greyed out. Switch it back: it recovers by itself.
8. Look at the clock on the phone while a minute changes (for example 11:11 to 11:12): the digits must not move sideways. A long press on the hold button must not open a text or copy menu. These two things were checked in the font file and the library source, NOT yet on a real phone.
Report what does not look right. Do not fix anything by hand.
