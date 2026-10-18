import { useCallback, useEffect, useRef, useState } from "react"
import {
  TimerError,
  deviceTimeZone,
  orderTagsByUse,
  timerDayTotal,
  timerEnd,
  timerPause,
  timerResume,
  timerStart,
  timerState,
  timerTagAdd,
  timerTagList,
  timerTagUse,
  type TimerErrorKind,
  type TimerTag,
} from "@/lib/timerApi"
import { pickMilestoneLine, type MilestoneQueues, type MilestoneVisuals } from "@/lib/milestoneLines"
import { pickComebackLine, pickStopLine, type ComebackQueues, type LineQueues } from "@/lib/stopAlertLines"
import {
  activeSeconds,
  canGoBackIn,
  dayHasEnded,
  dayTotalSeconds,
  earlierMinutes,
  estimateServerNowMs,
  localDay,
  milestoneDone,
  milestoneOnTime,
  milestoneWaiting,
  type TimerRow,
} from "@/lib/timerMaths"

// AB:TIMER.STATE:START
// The live state of the Pro Timer screen. The database is the only truth: every few seconds and every time the page comes back, the state is read again.
// The seconds are never counted by ticks. They are worked out from the stored times and the server time estimate (timerMaths.ts), so a sleeping phone loses nothing.
// Rules: a button that finds the state changed on another device reads the state again (CONFLICTS); without a connection every button is off; a session still running at local midnight is ended by the database at 12:00.
// The stop alert: Hold to end session does NOT end the session. stop pauses it (so the minutes of the line stay true while the alert is on the screen), picks one line for the seconds it stopped at, and opens the alert. end (I'M DONE) then ends it, goBack (GO BACK IN) resumes it. The time spent on the alert is never counted, because the session is paused. See CONNECTIONS.md C43.
// GO BACK IN does NOT resume the session: it closes the alert and the session stays paused as it is. The person presses Resume when he is ready (Packet 06E). goBack only remembers that the next Resume of THIS pause is a comeback (pendingRef: the seconds it stopped at, the session and the pause).
// The comeback message: when that Resume really runs the session again, resume picks one comeback line for the seconds the session stopped at (pickComebackLine) and keeps it as long as that session runs. A Resume that is not the one after GO BACK IN (or after any other pause) gets none. The screen shows it for a few seconds (Comeback.tsx) and then calls clearComeback. See CONNECTIONS.md C48.
// The milestone message (Packet 07B): when the session reaches 15, 25, 45, 60, 90, 120, 150 or 180 minutes the message WAITS until the person is looking (the page is visible), the session is running and no other milestone message is on the screen, and is then shown at once. A message that nobody saw is shown the moment the person looks again, up to 10 minutes after its milestone (timerMaths.ts, milestoneWaiting), with the number of minutes it is late when that is 5 or more (earlier); after 10 minutes it is given up for good. Only the newest milestone is shown, and each is shown at most once per session. The line about the glowing ball is only picked when the message is on time (milestoneOnTime) and the screen draws the ball (the option drawn, given by TimerScreen.tsx); a late message gets the general lines only. The screen shows it for 30 seconds (Milestone.tsx) and then calls clearMilestone.
// The tags (Packet 10C2): the hook keeps the list of the person's live tags (read once when the screen opens and again each time the picker opens its list, never by the 30 second poll; a list that cannot be read never stops the timer) and the tag that was picked before Start (tagId: none at first, and back to none as soon as any session is running, so every session starts with no tag). Start sends the picked tag only when there is one: with no tag it is the same call as before tags. chooseTag only works while nothing runs and only for a tag that is in the list. A Start that the database refuses with TAG_NOT_FOUND (the tag was archived on another device) sets the pick back to no tag, reads the list again and shows the plain words of problemText. runningTag is the name of the tag of the running session as the database sends it (C55), or null for no tag. See CONNECTIONS.md C56.
// Adding a tag (Packet 10D): addTag hands the name to the database as typed (timerTagAdd; the database cuts the spaces and checks the rules, so the words of the errors are the ones of problemText), reads the list again, and answers { ok: true } or { ok: false, message }. It never throws, it never shows a problem on the screen itself (the answer goes to the Manage tags box), and it NEVER chooses the new tag: every session starts with no tag, and the person picks the tag himself (DECISIONS_TAGS.md section 4).
// What is tied to the database and the screen: see CONNECTIONS.md C28, C29, C30, C43, C45, C48, C51, C56 and C57. The names used by the screen are in TimerView.

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

// The stop alert as the hook keeps it. startedAt and pausedAt name the one pause the alert was opened for (see alertMatches).
type AlertState = { line: string; seconds: number; canGoBack: boolean; startedAt: string; pausedAt: string }

// What GO BACK IN leaves behind: the next Resume of this one pause (this session, this pause) is a comeback, for the seconds the session stopped at (see pendingMatches).
type PendingComeback = { seconds: number; startedAt: string; pausedAt: string }

// The stop alert as the screen sees it: the line (its slots filled, its [effect:words] marks still in it) and whether GO BACK IN is offered (only for a session shorter than 45 minutes).
export type StopAlertView = { line: string; canGoBack: boolean }

// The comeback message as the hook keeps it: the line (its slots filled, its [effect:words] marks still in it) and the one session it belongs to (started_at).
type ComebackState = { line: string; startedAt: string }

// The comeback message as the screen sees it.
export type ComebackView = { line: string }

// What the screen tells the hook about what it draws. The hook never asks the browser itself (the ball needs WebGL 2, which only the screen knows, see CONNECTIONS.md C51). Without it nothing counts as drawn.
export type TimerOptions = { drawn?: () => MilestoneVisuals }

const NOTHING_DRAWN: MilestoneVisuals = { ball: false }

// The milestone message as the hook keeps it: the line (its [effect:words] marks still in it), how many minutes late it is when that is 5 or more (null for no tag), and the one session it belongs to (started_at).
type MilestoneState = { line: string; earlier: number | null; startedAt: string }

// The milestones of one session that are done (shown or given up), so none comes twice.
type MilestonesDone = { startedAt: string; minutes: number[] }

// The milestone message as the screen sees it.
export type MilestoneView = { line: string; earlier: number | null }

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
  comeback: ComebackView | null
  milestone: MilestoneView | null
  tags: TimerTag[]
  tagId: string | null
  runningTag: string | null
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  end: () => void
  goBack: () => void
  clearComeback: () => void
  clearMilestone: () => void
  chooseTag: (id: string | null) => void
  reloadTags: () => void
  addTag: (name: string) => Promise<AddTagResult>
  retry: () => void
}

// The answer of addTag (Packet 10D): it worked, or the plain words to show.
export type AddTagResult = { ok: true } | { ok: false; message: string }

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
    case "BAD_TAG_NAME":
      return "A tag name needs 1 to 20 characters, and cannot be Freestyle."
    case "TAG_NAME_TAKEN":
      return "You already have a tag with that name."
    case "TAG_LIMIT":
      return "You have the most tags allowed. Remove one to add another."
    case "TAG_NOT_FOUND":
      return "That tag is not there any more. Close the list and open it again."
    default:
      return "Something went wrong."
  }
}

// The alert belongs to ONE pause of ONE session. It is open only while the session is still paused at that same moment: when the session was ended or resumed on another device, or at midnight, or paused again later, it does not match any more and the screen shows no alert. Derived while drawing, so there is no state to clean up.
function alertMatches(alert: AlertState | null, row: TimerRow | null): alert is AlertState {
  return alert !== null && row !== null && row.status === "paused" && row.started_at === alert.startedAt && row.paused_at === alert.pausedAt
}

// The comeback message belongs to ONE running stretch of ONE session: it is shown only while that session is still running. When it is paused again, ended, or ended on another device, it does not match any more and the screen shows none (adopt also forgets it then, so it cannot come back when the session runs again). A comeback line says things like "the clock is running", so it is never shown for a session that is not running.
function comebackMatches(comeback: ComebackState | null, row: TimerRow | null): comeback is ComebackState {
  return comeback !== null && row !== null && row.status === "running" && row.started_at === comeback.startedAt
}

// The milestone message belongs to ONE running stretch of ONE session, like the comeback message: it is shown only while that session is running. When it is paused (the stop alert pauses it), ended, or ended on another device, it does not match any more and the screen shows none (adopt also forgets it then).
function milestoneMatches(milestone: MilestoneState | null, row: TimerRow | null): milestone is MilestoneState {
  return milestone !== null && row !== null && row.status === "running" && row.started_at === milestone.startedAt
}

// The pending comeback belongs to ONE pause of ONE session, like the alert. It counts only while the session is still paused at that same moment: when the session was resumed or ended on another device, or paused again later, it does not match any more.
function pendingMatches(pending: PendingComeback | null, row: TimerRow | null): pending is PendingComeback {
  return pending !== null && row !== null && row.status === "paused" && row.started_at === pending.startedAt && row.paused_at === pending.pausedAt
}

function dayOrFallback(ms: number, zone: string, fallback: string): string {
  try {
    return localDay(ms, zone)
  } catch {
    return fallback
  }
}

export function useTimer(options: TimerOptions = {}): TimerView {
  const [reading, setReading] = useState<Reading | null>(null)
  const [link, setLink] = useState<TimerLink>("loading")
  const [problem, setProblem] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<EndNotice | null>(null)
  const [alert, setAlert] = useState<AlertState | null>(null)
  const [comeback, setComeback] = useState<ComebackState | null>(null)
  const [milestone, setMilestone] = useState<MilestoneState | null>(null)
  const [tags, setTags] = useState<TimerTag[]>([])
  const [tagId, setTagId] = useState<string | null>(null)
  // True while the page is visible: only then is a waiting milestone message shown (a message nobody sees has no value).
  const [looking, setLooking] = useState(() => typeof document === "undefined" || document.visibilityState === "visible")
  const [now, setNow] = useState(() => Date.now())

  const readingRef = useRef<Reading | null>(null)
  const linkRef = useRef<TimerLink>("loading")
  const busyRef = useRef(false)
  const ticketRef = useRef(0)
  const lastAttemptRef = useRef(0)
  const aliveRef = useRef(true)
  const rolloverRef = useRef("")
  const alertRef = useRef<AlertState | null>(null)
  const comebackRef = useRef<ComebackState | null>(null)
  const pendingRef = useRef<PendingComeback | null>(null)
  const milestoneRef = useRef<MilestoneState | null>(null)
  const doneRef = useRef<MilestonesDone | null>(null)
  // The tags (Packet 10C2): the refs are what the buttons read, the state is what the screen draws. The ticket makes an old answer of the list lose against a newer one.
  const tagsRef = useRef<TimerTag[]>([])
  const tagIdRef = useRef<string | null>(null)
  const tagTicketRef = useRef(0)
  const lookingRef = useRef(looking)
  const drawnRef = useRef(options.drawn)
  // The shuffled queues of the stop alert lines: no line comes twice before all lines of its bank were shown. They live as long as the screen does.
  const queuesRef = useRef<LineQueues>({})
  // The same for the comeback lines (their own queues, one per bank).
  const comebackQueuesRef = useRef<ComebackQueues>({})
  // The same for the milestone lines (one queue for every milestone and every set of drawn things).
  const milestoneQueuesRef = useRef<MilestoneQueues>({})

  const showLink = useCallback((next: TimerLink, text = "") => {
    linkRef.current = next
    setLink(next)
    setProblem(text)
  }, [])

  const showAlert = useCallback((next: AlertState | null) => {
    alertRef.current = next
    setAlert(next)
  }, [])

  const showComeback = useCallback((next: ComebackState | null) => {
    comebackRef.current = next
    setComeback(next)
  }, [])

  // The screen calls this when the comeback message has been shown. It never changes anything but the message.
  const clearComeback = useCallback(() => showComeback(null), [showComeback])

  const showMilestone = useCallback((next: MilestoneState | null) => {
    milestoneRef.current = next
    setMilestone(next)
  }, [])

  // The screen calls this when the milestone message has been shown for its time and has faded. It never changes anything but the message (the milestone stays done).
  const clearMilestone = useCallback(() => showMilestone(null), [showMilestone])

  const showTagId = useCallback((next: string | null) => {
    tagIdRef.current = next
    setTagId(next)
  }, [])

  // Reads the person's live tags for the picker (Packet 10C2, CONNECTIONS.md C56): once when the screen opens and each time the picker opens its list, never in the poll. The list only serves the picker: when it cannot be read, the timer goes on working (Start with no tag always works) and the next opening of the list reads it again. A pick that is not in the list any more (the tag was archived on another device) goes back to no tag.
  const loadTags = useCallback(async () => {
    const ticket = ++tagTicketRef.current
    try {
      // The use numbers come with the list; when they cannot be read the list is simply in the order the database sends it (oldest first). Packet 10F, CONNECTIONS.md C58.
      const [rawList, use] = await Promise.all([timerTagList(), timerTagUse().catch(() => [])])
      const list = orderTagsByUse(rawList, use)
      if (!aliveRef.current || ticket !== tagTicketRef.current) return
      tagsRef.current = list
      setTags(list)
      if (tagIdRef.current !== null && !list.some((tag) => tag.id === tagIdRef.current)) showTagId(null)
    } catch {
      // Left as it is on purpose, see above.
    }
  }, [showTagId])

  // The two calls of the picker. chooseTag only counts while nothing runs (the database has no call to change the tag of a running session) and only for a tag that is in the list. reloadTags reads the list again when the picker opens it.
  const chooseTag = useCallback(
    (id: string | null) => {
      if ((readingRef.current?.row ?? null) !== null) return
      if (id !== null && !tagsRef.current.some((tag) => tag.id === id)) return
      showTagId(id)
    },
    [showTagId],
  )
  const reloadTags = useCallback(() => void loadTags(), [loadTags])

  // Packet 10D, CONNECTIONS.md C57. The name goes to the database as typed. A tag that was added is put into the list after the list was read again (the reading may fail; the person must still see the tag). The new tag is never chosen.
  const addTag = useCallback(
    async (name: string): Promise<AddTagResult> => {
      let added: TimerTag
      try {
        added = await timerTagAdd(name)
      } catch (error) {
        const kind: TimerErrorKind = error instanceof TimerError ? error.kind : "UNKNOWN"
        return { ok: false, message: kind === "NO_CONNECTION" ? "No connection. Try again in a moment." : problemText(kind) }
      }
      await loadTags()
      if (aliveRef.current && !tagsRef.current.some((tag) => tag.id === added.id)) {
        const list = [...tagsRef.current, added]
        tagsRef.current = list
        setTags(list)
      }
      return { ok: true }
    },
    [loadTags],
  )

  const adopt = useCallback(
    (next: Reading) => {
      const t = Date.now()
      const merged: Reading = { ...next, time: keepTimeBase(readingRef.current?.time ?? null, next.time, t) }
      readingRef.current = merged
      setReading(merged)
      setNow(t)
      // The comeback message is forgotten for good as soon as the session it belongs to is not running any more.
      if (comebackRef.current !== null && !comebackMatches(comebackRef.current, next.row)) showComeback(null)
      // The same for the milestone message: it goes when its session is not running any more (paused by the stop alert, ended).
      if (milestoneRef.current !== null && !milestoneMatches(milestoneRef.current, next.row)) showMilestone(null)
      // The same for the pending comeback (GO BACK IN was pressed, Resume not yet): it is forgotten when the pause it belongs to is over.
      if (pendingRef.current !== null && !pendingMatches(pendingRef.current, next.row)) pendingRef.current = null
      // The pick made before Start is used up as soon as any session runs (started here or on another device), so the next session starts with no tag again.
      if (next.row !== null && tagIdRef.current !== null) showTagId(null)
    },
    [showComeback, showMilestone, showTagId],
  )

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
          // A new hold starts over: nothing is left behind from an earlier GO BACK IN.
          pendingRef.current = null
          showAlert({
            line: picked.line,
            seconds,
            canGoBack: canGoBackIn(seconds),
            startedAt: stopped.started_at,
            pausedAt: stopped.paused_at ?? "",
          })
        } else if (kind === "goback") {
          // GO BACK IN: the alert closes and the session STAYS PAUSED, as it is. Nothing is sent to the database. The next Resume of this pause is the comeback (see resume below).
          const open = alertRef.current
          if (!alertMatches(open, before?.row ?? null)) {
            showAlert(null)
            return
          }
          pendingRef.current = { seconds: open.seconds, startedAt: open.startedAt, pausedAt: open.pausedAt }
          showAlert(null)
        } else {
          // Read before adopt: adopting the running row forgets the pending comeback.
          const pending = kind === "resume" && pendingMatches(pendingRef.current, before?.row ?? null) ? pendingRef.current : null
          // Start sends the tag picked before it. With no pick the call has one argument, exactly as before tags (CONNECTIONS.md C56).
          const tagToSend = kind === "start" ? tagIdRef.current : null
          const reply =
            kind === "start"
              ? await (tagToSend === null ? timerStart(deviceTimeZone()) : timerStart(deviceTimeZone(), tagToSend))
              : kind === "pause"
                ? await timerPause()
                : await timerResume()
          if (!aliveRef.current) return
          const time = { serverMs: reply.serverNowMs, localMs: (sentAt + Date.now()) / 2 }
          adopt({ row: reply.row, time, savedSeconds: before?.savedSeconds ?? 0, day: before?.day ?? "" })
          if (kind === "start") setNotice(null)
          if (pending !== null) {
            // The session runs again after GO BACK IN, so the comeback line is true now.
            const picked = pickComebackLine(pending.seconds, comebackQueuesRef.current)
            if (picked !== null) {
              comebackQueuesRef.current = picked.queues
              showComeback({ line: picked.line, startedAt: pending.startedAt })
            }
          }
        }
        void refresh()
      } catch (error) {
        if (!aliveRef.current) return
        if (error instanceof TimerError && CONFLICTS.includes(error.kind)) void refresh()
        else {
          // A tag that is gone (archived on another device) between the pick and Start: the pick goes back to no tag and the list is read again, then the plain words of problemText are shown (CONNECTIONS.md C56).
          if (kind === "start" && error instanceof TimerError && error.kind === "TAG_NOT_FOUND") {
            showTagId(null)
            void loadTags()
          }
          fail(error)
        }
      } finally {
        busyRef.current = false
        if (aliveRef.current) setBusy(false)
      }
    },
    [adopt, fail, loadTags, refresh, showAlert, showComeback, showTagId],
  )

  // Reading again: at the start, every 30 seconds (every 3 seconds while there is no connection), when the page comes back, and when the connection comes back.
  useEffect(() => {
    aliveRef.current = true
    // The list of tags is read once when the screen opens (loadTags). The picker reads it again each time it opens its list; the 30 second poll never does.
    void loadTags()
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
  }, [loadTags, refresh, showLink])

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

  // What the screen draws is read when a message is picked, so the hook always has the newest function.
  useEffect(() => {
    drawnRef.current = options.drawn
  }, [options.drawn])

  // Looking: the page is visible. When the page comes back, the time is taken again in the same step, so the message is picked for the seconds of this moment and its tag says the true number of minutes.
  useEffect(() => {
    const sync = () => {
      const visible = document.visibilityState === "visible"
      if (visible === lookingRef.current) return
      lookingRef.current = visible
      setLooking(visible)
      if (visible) setNow(Date.now())
    }
    document.addEventListener("visibilitychange", sync)
    window.addEventListener("pageshow", sync)
    return () => {
      document.removeEventListener("visibilitychange", sync)
      window.removeEventListener("pageshow", sync)
    }
  }, [])

  const serverNow = reading === null ? 0 : estimateServerNowMs(reading.time.serverMs, reading.time.localMs, now)
  const row = reading?.row ?? null
  const seconds = row === null ? 0 : activeSeconds(row, serverNow)
  const dayOver = row !== null && dayHasEnded(row, serverNow)
  // Only used while nothing runs (see the rollover below), so it is always the day of this device.
  const currentDay = reading === null ? "" : dayOrFallback(serverNow, deviceZoneOrUtc(), reading.day)

  // The milestone message (see the comment at the top). Every second it asks which milestone is waiting. It is shown only while the session runs, the page is visible and no other milestone message is on the screen; until then it waits, and after 10 minutes it is given up. What is shown or given up is written down for this session, so it never comes twice.
  useEffect(() => {
    if (row === null) {
      doneRef.current = null
      return
    }
    const done = doneRef.current?.startedAt === row.started_at ? doneRef.current.minutes : []
    const waiting = milestoneWaiting(seconds, done)
    doneRef.current = { startedAt: row.started_at, minutes: waiting.handled }
    if (waiting.minute === null) return
    if (row.status !== "running" || !looking || milestone !== null) return
    const drawn = milestoneOnTime(waiting.lateSeconds) ? (drawnRef.current?.() ?? NOTHING_DRAWN) : NOTHING_DRAWN
    const picked = pickMilestoneLine(waiting.minute, drawn, milestoneQueuesRef.current)
    doneRef.current = { startedAt: row.started_at, minutes: milestoneDone(waiting.minute, waiting.handled) }
    if (picked === null) return
    milestoneQueuesRef.current = picked.queues
    showMilestone({ line: picked.line, earlier: earlierMinutes(waiting.lateSeconds), startedAt: row.started_at })
  }, [row, seconds, looking, milestone, showMilestone])

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
    comeback: comebackMatches(comeback, row) ? { line: comeback.line } : null,
    milestone: milestoneMatches(milestone, row) ? { line: milestone.line, earlier: milestone.earlier } : null,
    tags,
    tagId,
    runningTag: row === null ? null : (row.tag?.name ?? null),
    start: () => void act("start"),
    pause: () => void act("pause"),
    resume: () => void act("resume"),
    stop: () => void act("stop"),
    end: () => void act("end"),
    goBack: () => void act("goback"),
    clearComeback,
    clearMilestone,
    chooseTag,
    reloadTags,
    addTag,
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
