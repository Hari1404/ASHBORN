import Comeback from "@/components/Comeback"
import HoldButton from "@/components/HoldButton"
import Milestone from "@/components/Milestone"
import StopAlert from "@/components/StopAlert"
import TimerBackground from "@/components/TimerBackground"
import TimerBall from "@/components/TimerBall"
import type { MilestoneVisuals } from "@/lib/milestoneLines"
import { canDrawWebgl2 } from "@/lib/timerWarmup"
import { formatClock, qualityOf } from "@/lib/timerMaths"
import { useTimer, type EndNotice } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.SCREEN:START
// The Pro Timer screen. It is shown at the page address #timer (SignedInStub.tsx chooses it, see CONNECTIONS.md C30).
// Big clock: the seconds of the running session. Small clock under it: the total of the day, saved sessions plus the running one.
// Behind the big clock sits the glowing ball (TimerBall.tsx). It lights when a session starts, changes colour as the session gets deeper, stops and dims when paused, and fades when the session ends.
// Behind everything, over the whole screen, sits the moving background (TimerBackground.tsx, drawn by our own canvas). It is the first thing inside the main element, it has a colour of the same family as the ball (the same palette number) and starts black, and the screen is black without a session (see CONNECTIONS.md C37 and C38). It is told when the session is paused, and then its flow stands still, as the ball does.
// Start and Pause / Resume are normal taps. End Session is the library Hold Button (src/components/HoldButton.tsx, never edited): hold it until it is full. It does not end the session: it opens the stop alert (StopAlert.tsx, the last thing inside the main element), which pauses the session and offers I'M DONE and GO BACK IN (see CONNECTIONS.md C43).
// After GO BACK IN the comeback message (Comeback.tsx) floats over the screen for a few seconds, while the hook has one (see CONNECTIONS.md C48). The milestone message (Milestone.tsx) floats at the bottom for 30 seconds, while the hook has one (see CONNECTIONS.md C51). Both sit just before the stop alert, so the stop alert stays the last thing inside the main element.
// The ball sits in a box that is larger than the dial, and the ball is a share of that box (see CONNECTIONS.md C31).
// The look of the clock digits (Space Grotesk, fixed width) is in timer.css (see CONNECTIONS.md C32).
// While the first reading is on its way (the link is loading) the screen does not show zeros that would jump to the real numbers: the two clocks are invisible, and where the buttons will be there is a faint blank pill (ab-timer-wait) that is not a button. When the reading is there, the clocks and the buttons fade in together (timer.css, CONNECTIONS.md C46).
// On a phone the screen is one column: the dial, then the line, then the buttons. On a wide screen (a laptop) the dial is a big circle on the left and the line and the buttons stand on the right, inside the box ab-timer-side (see CONNECTIONS.md C39). The tags and the rest that come later go into that box too.

// What the screen really draws, told to the hook when it picks a milestone line (the line about the ball is only true when the ball is drawn: the same condition as TimerBall.tsx, see CONNECTIONS.md C51). It is asked only at a milestone, when a session is already shown.
function drawnNow(): MilestoneVisuals {
  return { ball: canDrawWebgl2() }
}

function noticeText(notice: EndNotice): string {
  const head = notice.capped ? "Day ended at midnight. " : ""
  if (!notice.saved || notice.seconds === null) return head + "Under 1 minute, so it was not saved."
  return head + "Saved " + formatClock(notice.seconds) + " (" + qualityOf(notice.seconds) + ")."
}

export default function TimerScreen() {
  const timer = useTimer({ drawn: drawnNow })
  const ready = timer.link === "online" && !timer.busy

  let note = ""
  if (timer.link === "offline") note = "No connection. Waiting to reconnect."
  else if (timer.link === "problem") note = timer.problem
  else if (timer.notice !== null) note = noticeText(timer.notice)

  return (
    <main className="ab-timer" data-state={timer.status} data-link={timer.link}>
      <TimerBackground active={timer.status !== "idle"} paused={timer.status === "paused"} seconds={timer.seconds} seed={timer.ringSeed} />
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
      <div className="ab-timer-side" inert={timer.stopAlert !== null}>
        <p className="ab-timer-note" role="status">
          {note}
        </p>
        {timer.link === "problem" ? (
          <button className="ab-timer-retry" type="button" onClick={timer.retry}>
            Try again
          </button>
        ) : null}
        <div className="ab-timer-actions">
          {timer.link === "loading" ? (
            <div className="ab-timer-wait" aria-hidden="true" />
          ) : timer.status === "idle" ? (
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
                doneLabel="Stopped"
                disabled={!ready}
                onHold={timer.stop}
              >
                Hold to end session
              </HoldButton>
            </>
          )}
        </div>
      </div>
      {timer.comeback === null ? null : <Comeback line={timer.comeback.line} onGone={timer.clearComeback} />}
      {timer.milestone === null ? null : (
        <Milestone line={timer.milestone.line} earlier={timer.milestone.earlier} onGone={timer.clearMilestone} />
      )}
      {timer.stopAlert === null ? null : (
        <StopAlert
          line={timer.stopAlert.line}
          canGoBack={timer.stopAlert.canGoBack}
          disabled={!ready}
          note={note}
          onDone={timer.end}
          onGoBack={timer.goBack}
        />
      )}
    </main>
  )
}
// AB:TIMER.SCREEN:END
