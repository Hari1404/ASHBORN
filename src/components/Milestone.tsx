import { useEffect, useState } from "react"
import LineText from "@/components/LineText"
import { MILESTONE_FADE_MS, MILESTONE_SHOW_MS } from "@/lib/milestoneLines"
import "../timer.css"

// AB:TIMER.MILESTONE:START
// The milestone message: one line that stays at the bottom of the Pro Timer screen for 30 seconds when the session reaches 15, 25, 45, 60, 90, 120, 150 or 180 minutes, and then fades out (TimerScreen.tsx shows it only while the hook has one, see CONNECTIONS.md C51).
// The hook (useTimer.ts) decides WHEN: the message waits until the person is looking, and a message that was missed is shown late, with the tag "N min earlier" (the number the hook gives as earlier, only from 5 minutes late). The line is picked by the hook from the milestone lines (milestoneLines.ts). It is shown by LineText.tsx, as the lines of the stop alert and the comeback message are: word by word, with the effect of every marked keyword (see CONNECTIONS.md C49).
// It floats over the screen (see the css with the same tag) and never catches a tap, so the buttons stay usable at once.
// It stays MILESTONE_SHOW_MS (30 seconds, counted from the moment it is on the screen, which is the moment the person is looking), then fades for MILESTONE_FADE_MS (the same time as the css transition), then asks the screen to take it away (onGone). A new line starts the wait again. When the screen takes the message away before the end (the session was paused or ended), the waits are stopped and onGone is never called.
// The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type MilestoneProps = {
  line: string
  earlier: number | null
  onGone: () => void
}

export default function Milestone({ line, earlier, onGone }: MilestoneProps) {
  // The line that has started to fade out. A new line is a different line, so it never starts out faded.
  const [fadingLine, setFadingLine] = useState<string | null>(null)
  const leaving = fadingLine === line
  useEffect(() => {
    const leave = window.setTimeout(() => setFadingLine(line), MILESTONE_SHOW_MS)
    const gone = window.setTimeout(onGone, MILESTONE_SHOW_MS + MILESTONE_FADE_MS)
    return () => {
      window.clearTimeout(leave)
      window.clearTimeout(gone)
    }
  }, [line, onGone])
  return (
    <div className="ab-milestone" data-leaving={leaving ? "true" : "false"} role="status">
      {earlier === null ? null : <p className="ab-milestone-tag">{earlier + " min earlier"}</p>}
      <LineText key={line} line={line} className="ab-milestone-line" />
    </div>
  )
}
// AB:TIMER.MILESTONE:END
