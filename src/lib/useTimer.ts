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
