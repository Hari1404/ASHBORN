import { useEffect, useRef } from "react"
import LineText from "@/components/LineText"
import "../timer.css"

// AB:TIMER.STOP-ALERT:START
// The stop alert: it covers the Pro Timer screen after Hold to end session (TimerScreen.tsx shows it, see CONNECTIONS.md C43).
// It shows one line (picked and filled by useTimer.ts from stopAlertLines.ts) and two buttons: I'M DONE ends the session, GO BACK IN lets it go on. GO BACK IN is only there when canGoBack is true (a session shorter than 45 minutes).
// The line is shown by LineText.tsx: word by word, with the effect of every marked keyword (glow, heat, shake, strike, ghost, rise), see CONNECTIONS.md C49.
// The screen behind it stays on while the alert is open, but the session is paused, so the time on this alert is never counted.
// Focus goes to the card, not to a button: a finger or a key still held from the Hold Button must never press a button by mistake.
// The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type StopAlertProps = {
  line: string
  canGoBack: boolean
  disabled: boolean
  note: string
  onDone: () => void
  onGoBack: () => void
}

export default function StopAlert({ line, canGoBack, disabled, note, onDone, onGoBack }: StopAlertProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    cardRef.current?.focus()
  }, [])
  return (
    <div className="ab-alert" role="alertdialog" aria-modal="true" aria-label="Stop the session?" aria-describedby="ab-alert-line">
      <div className="ab-alert-card" ref={cardRef} tabIndex={-1}>
        <div id="ab-alert-line">
          <LineText key={line} line={line} className="ab-alert-line" />
        </div>
        <div className="ab-alert-actions">
          <button className="ab-alert-done" type="button" disabled={disabled} onClick={onDone}>
            I&apos;M DONE
          </button>
          {canGoBack ? (
            <button className="ab-alert-back" type="button" disabled={disabled} onClick={onGoBack}>
              GO BACK IN
            </button>
          ) : null}
        </div>
        <p className="ab-alert-note" role="status">
          {note}
        </p>
      </div>
    </div>
  )
}
// AB:TIMER.STOP-ALERT:END
