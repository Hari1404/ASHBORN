import { useEffect, useState } from "react"
import BlurText from "@/components/BlurText"
import { plainText } from "@/lib/lineMarkup"
import { COMEBACK_FADE_MS, COMEBACK_SHOW_MS } from "@/lib/stopAlertLines"
import "../timer.css"

// AB:TIMER.COMEBACK:START
// The comeback message: one line that stays on the Pro Timer screen for a few seconds after GO BACK IN, and then fades out (TimerScreen.tsx shows it only while the hook has one, see CONNECTIONS.md C48).
// The line is picked and filled by useTimer.ts from the comeback lines of stopAlertLines.ts. It is shown word by word with the React Bits BlurText (src/components/BlurText.tsx, never edited), as the line of the stop alert is. The [effect:words] marks are cut out here (plainText) and no effect is drawn yet: the text effects come in a later packet.
// It floats over the screen (see the css with the same tag) and never catches a tap, so the buttons stay usable at once.
// It stays COMEBACK_SHOW_MS, then fades for COMEBACK_FADE_MS (the same time as the css transition), then asks the screen to take it away (onGone). A new line starts the wait again. When the screen takes the message away before the end (the session was paused or ended), the waits are stopped and onGone is never called.
// The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type ComebackProps = {
  line: string
  onGone: () => void
}

export default function Comeback({ line, onGone }: ComebackProps) {
  // The line that has started to fade out. A new line is a different line, so it never starts out faded.
  const [fadingLine, setFadingLine] = useState<string | null>(null)
  const leaving = fadingLine === line
  useEffect(() => {
    const leave = window.setTimeout(() => setFadingLine(line), COMEBACK_SHOW_MS)
    const gone = window.setTimeout(onGone, COMEBACK_SHOW_MS + COMEBACK_FADE_MS)
    return () => {
      window.clearTimeout(leave)
      window.clearTimeout(gone)
    }
  }, [line, onGone])
  return (
    <div className="ab-comeback" data-leaving={leaving ? "true" : "false"} role="status">
      <BlurText key={line} text={plainText(line)} delay={80} animateBy="words" direction="top" className="ab-comeback-line" />
    </div>
  )
}
// AB:TIMER.COMEBACK:END
