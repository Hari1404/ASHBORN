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
import { pickStopLine, type LineQueues } from "@/lib/stopAlertLines"
import {
  activeSeconds,
  canGoBackIn,
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
// The stop alert: Hold to end session does NOT end the session. stop pauses it (so the minutes of the line stay true while the alert is on the screen), picks one line for the seconds it stopped at, and opens the alert. end (I'M DONE) then ends it, goBack (GO BACK IN) resumes it. The time spent on the alert is never counted, because the session is paused. See CONNECTIONS.md C43.
// What is tied to the database and the screen: see CONNECTIONS.md C28, C29, C30, C43 and C45. The names used by the screen are in TimerView.

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
type Action = "start" | "pause" | "resume" | "end" | "stop" | "goback"

// The stop alert as the hook keeps it. resume is true when the alert itself paused the session, so that GO BACK IN has to resume it; when the session was already paused before the hold, GO BACK IN leaves it paused as it was.
// startedAt and pausedAt name the one pause the alert was opened for (see alertMatches).
type AlertState = { line: string; seconds: number; canGoBack: boolean; resume: boolean; startedAt: string; pausedAt: string }

// The stop alert as the screen sees it: the line (its slots filled, its [effect:words] marks still in it) and whether GO BACK IN is offered (only for a session shorter than 45 minutes).
export type StopAlertView = { line: string; canGoBack: boolean }

export type TimerView = {
  link: TimerLink
  problem: string
  busy: boolean
  status: TimerStatus
  seconds: number
  dayTotal: number
  ringSeed: string
  notice: EndNotice | null
  stopAlert: StopAlertView | null
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  end: () => void
  goBack: () => void
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

// The alert belongs to ONE pause of ONE session. It is open only while the session is still paused at that same moment: when the session was ended or resumed on another device, or at midnight, or paused again later, it does not match any more and the screen shows no alert. Derived while drawing, so there is no state to clean up.
function alertMatches(alert: AlertState | null, row: TimerRow | null): alert is AlertState {
  return alert !== null && row !== null && row.status === "paused" && row.started_at === alert.startedAt && row.paused_at === alert.pausedAt
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
  const [alert, setAlert] = useState<AlertState | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const readingRef = useRef<Reading | null>(null)
  const linkRef = useRef<TimerLink>("loading")
  const busyRef = useRef(false)
  const ticketRef = useRef(0)
  const lastAttemptRef = useRef(0)
  const aliveRef = useRef(true)
  const rolloverRef = useRef("")
  const alertRef = useRef<AlertState | null>(null)
  // The shuffled queues of the stop alert lines: no line comes twice before all lines of its bank were shown. They live as long as the screen does.
  const queuesRef = useRef<LineQueues>({})

  const showLink = useCallback((next: TimerLink, text = "") => {
    linkRef.current = next
    setLink(next)
    setProblem(text)
  }, [])

  const showAlert = useCallback((next: AlertState | null) => {
    alertRef.current = next
    setAlert(next)
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
  // Both are asked for AT ONCE, not one after the other (that was two waits in a row). The day total needs the day, and the day is only known for sure when the state has answered (the time zone of a running session counts, see C26): so it is asked for the day of THIS device right now, and when the state then says the day is another one (a session started in another time zone, or a device clock that is off) the day total is asked again for the right day and the first answer is thrown away. See CONNECTIONS.md C45.
  const refresh = useCallback(async () => {
    const ticket = ++ticketRef.current
    lastAttemptRef.current = Date.now()
    try {
      const zone = deviceTimeZone()
      const guess = dayOrFallback(Date.now(), zone, "")
      const sentAt = Date.now()
      const stateAsk = timerState()
      const dayAsk = guess === "" ? null : timerDayTotal(guess)
      // If the state fails, nobody waits for this answer any more: the error of the day total must not be left unhandled.
      dayAsk?.catch(() => {})
      const state = await stateAsk
      const receivedAt = Date.now()
      if (!aliveRef.current || ticket !== ticketRef.current) return
      const day = localDay(state.serverNowMs, state.row?.tz ?? zone)
      const saved = dayAsk !== null && day === guess ? await dayAsk : await timerDayTotal(day)
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
          showAlert(null)
        } else if (kind === "stop") {
          // Hold to end session: pause (unless it is paused already), then open the alert for the seconds the session stopped at.
          const row = before?.row ?? null
          if (before === null || row === null) return
          let stopped = row
          let serverMs = estimateServerNowMs(before.time.serverMs, before.time.localMs, Date.now())
          const pausedHere = row.status === "running"
          if (pausedHere) {
            const reply = await timerPause()
            if (!aliveRef.current) return
            const time = { serverMs: reply.serverNowMs, localMs: (sentAt + Date.now()) / 2 }
            adopt({ row: reply.row, time, savedSeconds: before.savedSeconds, day: before.day })
            stopped = reply.row
            serverMs = reply.serverNowMs
          }
          const seconds = activeSeconds(stopped, serverMs)
          const picked = pickStopLine(seconds, queuesRef.current)
          queuesRef.current = picked.queues
          showAlert({
            line: picked.line,
            seconds,
            canGoBack: canGoBackIn(seconds),
            resume: pausedHere,
            startedAt: stopped.started_at,
            pausedAt: stopped.paused_at ?? "",
          })
        } else if (kind === "goback") {
          // GO BACK IN: the session goes on from where it stopped. If the alert paused it, it is resumed; if it was paused before, it stays paused.
          const open = alertRef.current
          if (!alertMatches(open, before?.row ?? null)) {
            showAlert(null)
            return
          }
          if (open.resume) {
            const reply = await timerResume()
            if (!aliveRef.current) return
            const time = { serverMs: reply.serverNowMs, localMs: (sentAt + Date.now()) / 2 }
            adopt({ row: reply.row, time, savedSeconds: before?.savedSeconds ?? 0, day: before?.day ?? "" })
          }
          showAlert(null)
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
    [adopt, fail, refresh, showAlert],
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
    stopAlert: alertMatches(alert, row) ? { line: alert.line, canGoBack: alert.canGoBack } : null,
    start: () => void act("start"),
    pause: () => void act("pause"),
    resume: () => void act("resume"),
    stop: () => void act("stop"),
    end: () => void act("end"),
    goBack: () => void act("goback"),
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
