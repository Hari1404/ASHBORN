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
