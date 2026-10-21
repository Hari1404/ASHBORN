import { useEffect, useState } from "react"
import Counter from "@/components/Counter"
import { LITE_LEVEL } from "@/lib/lite"
import {
  countdownCaption,
  daysUntilApril14,
  DAY_WORD_TEXT,
  focusPercent,
  formatSpan,
  HUD_REFRESH_MS,
  minutesParts,
} from "@/lib/overviewHud"
import { deviceTimeZone, timerDayScore, type DayScore } from "@/lib/timerApi"
import { localDay } from "@/lib/timerMaths"
import "../overview.css"

// AB:OVERVIEW.HUD:START
// Two things on top of the Overview background (they are children of the Overview screen, see CONNECTIONS.md C60):
// 1. The countdown to April 14 in the top right corner, to the left of the menu button: the days as rolling digits (the React Bits Counter, library file src/components/Counter.tsx, never edited) with a line under them.
// 2. "Today in Pro Timer" along the bottom: the day number in hours and minutes (rolling digits), the word of the day in plain sentence case, and the sessions, the longest stretch and the focus of the day. All of it comes from the day score the database already gives (timerDayScore); nothing new is asked of the database.
// Both are asked again every minute, when the page comes back to the front and when the window gets focus, so the countdown changes at local midnight and a session that has just ended shows up. The running session is not in the day score (it is not saved yet), so it is not in the numbers until it ends.
// A phone (lite level 1 or 2) draws the digits without the motion blur.
type DayState = { kind: "loading" } | { kind: "error" } | { kind: "ready"; score: DayScore }

function zoneOrNull(): string | null {
  try {
    return deviceTimeZone()
  } catch {
    return null
  }
}

function countdownNow(): number {
  return daysUntilApril14(Date.now(), zoneOrNull() ?? "UTC")
}

export default function OverviewHud() {
  const [days, setDays] = useState<number>(countdownNow)
  const [day, setDay] = useState<DayState>({ kind: "loading" })

  useEffect(() => {
    let alive = true
    let latest = 0
    async function refresh(): Promise<void> {
      const now = Date.now()
      const zone = zoneOrNull()
      setDays(daysUntilApril14(now, zone ?? "UTC"))
      const mine = ++latest
      try {
        if (zone === null) throw new Error("no time zone")
        const score = await timerDayScore(localDay(now, zone))
        if (alive && mine === latest) setDay({ kind: "ready", score })
      } catch {
        if (alive && mine === latest) setDay((before) => (before.kind === "ready" ? before : { kind: "error" }))
      }
    }
    function onBack(): void {
      if (document.visibilityState === "visible") void refresh()
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), HUD_REFRESH_MS)
    document.addEventListener("visibilitychange", onBack)
    window.addEventListener("focus", onBack)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onBack)
      window.removeEventListener("focus", onBack)
    }
  }, [])

  const blur = LITE_LEVEL === 0
  return (
    <>
      <div className="ab-hud-countdown">
        <Counter value={days} fontSize={56} fontWeight={600} textColor="#f4f0ff" duration={1.1} motionBlur={blur} />
        <p className="ab-hud-caption">{countdownCaption(days)}</p>
      </div>
      <section className="ab-hud-day" aria-label="Today in Pro Timer">
        <p className="ab-hud-day-title">Today in Pro Timer</p>
        {day.kind === "loading" ? <p className="ab-hud-quiet">Reading today…</p> : null}
        {day.kind === "error" ? <p className="ab-hud-quiet">Could not read today. It tries again in a minute.</p> : null}
        {day.kind === "ready" ? <DayBody score={day.score} blur={blur} /> : null}
      </section>
    </>
  )
}

function DayBody({ score, blur }: { score: DayScore; blur: boolean }) {
  const waiting =
    score.unconfirmedMinutes > 0 ? (
      <p className="ab-hud-quiet">+{formatSpan(score.unconfirmedMinutes)} waiting to be confirmed</p>
    ) : null
  if (score.sessions === 0) {
    return (
      <>
        <p className="ab-hud-empty">No session yet today.</p>
        <a className="ab-hud-link" href="#timer">
          Start one
        </a>
        {waiting}
      </>
    )
  }
  const parts = minutesParts(score.creditedMinutes)
  const percent = focusPercent(score.countedOverElapsed)
  return (
    <>
      <div className="ab-hud-headline">
        <p className="ab-hud-number">
          {parts.hours > 0 ? (
            <>
              <Counter value={parts.hours} fontSize={44} fontWeight={600} textColor="#f4f0ff" motionBlur={blur} />
              <span className="ab-hud-unit">h</span>
            </>
          ) : null}
          <Counter
            value={parts.minutes}
            minDigits={parts.hours > 0 ? 2 : 1}
            fontSize={44}
            fontWeight={600}
            textColor="#f4f0ff"
            motionBlur={blur}
          />
          <span className="ab-hud-unit">m</span>
        </p>
        <p className="ab-hud-word">{DAY_WORD_TEXT[score.word]}</p>
      </div>
      <dl className="ab-hud-stats">
        <div className="ab-hud-stat">
          <dt className="ab-hud-stat-label">Sessions</dt>
          <dd className="ab-hud-stat-value">
            {score.sessions}
            {score.shortSessions > 0 ? " (" + score.shortSessions + " short)" : ""}
          </dd>
        </div>
        <div className="ab-hud-stat">
          <dt className="ab-hud-stat-label">Longest stretch</dt>
          <dd className="ab-hud-stat-value">{formatSpan(score.longestStretchMinutes)}</dd>
        </div>
        <div className="ab-hud-stat">
          <dt className="ab-hud-stat-label">Focus</dt>
          <dd className="ab-hud-stat-value">{percent === null ? "–" : percent + "%"}</dd>
        </div>
      </dl>
      {waiting}
    </>
  )
}
// AB:OVERVIEW.HUD:END
