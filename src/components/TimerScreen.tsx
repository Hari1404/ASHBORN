import HoldButton from "@/components/HoldButton"
import TimerBackground from "@/components/TimerBackground"
import TimerBall from "@/components/TimerBall"
import { formatClock, qualityOf } from "@/lib/timerMaths"
import { useTimer, type EndNotice } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.SCREEN:START
// The Pro Timer screen. It is shown at the page address #timer (SignedInStub.tsx chooses it, see CONNECTIONS.md C30).
// Big clock: the seconds of the running session. Small clock under it: the total of the day, saved sessions plus the running one.
// Behind the big clock sits the glowing ball (TimerBall.tsx). It lights when a session starts, changes colour as the session gets deeper, stops and dims when paused, and fades when the session ends.
// Behind everything, over the whole screen, sits the moving background (TimerBackground.tsx, the Meta Balls animation). It is the first thing inside the main element, it has the same colour as the ball at every moment, and the screen is black without a session (see CONNECTIONS.md C37 and C38).
// Start and Pause / Resume are normal taps. End Session is the library Hold Button (src/components/HoldButton.tsx, never edited): hold it until it is full.
// The ball sits in a box that is larger than the dial, and the ball is a share of that box (see CONNECTIONS.md C31).
// The look of the clock digits (Space Grotesk, fixed width) is in timer.css (see CONNECTIONS.md C32).

function noticeText(notice: EndNotice): string {
  const head = notice.capped ? "Day ended at midnight. " : ""
  if (!notice.saved || notice.seconds === null) return head + "Under 1 minute, so it was not saved."
  return head + "Saved " + formatClock(notice.seconds) + " (" + qualityOf(notice.seconds) + ")."
}

export default function TimerScreen() {
  const timer = useTimer()
  const ready = timer.link === "online" && !timer.busy

  let note = ""
  if (timer.link === "offline") note = "No connection. Waiting to reconnect."
  else if (timer.link === "problem") note = timer.problem
  else if (timer.notice !== null) note = noticeText(timer.notice)

  return (
    <main className="ab-timer" data-state={timer.status} data-link={timer.link}>
      <TimerBackground active={timer.status !== "idle"} seconds={timer.seconds} seed={timer.ringSeed} />
      <div className="ab-timer-dial">
        <TimerBall
          active={timer.status !== "idle"}
          paused={timer.status === "paused"}
          seconds={timer.seconds}
          seed={timer.ringSeed}
        />
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
