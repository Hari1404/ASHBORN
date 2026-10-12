import type { CSSProperties } from "react"
import { parseMarkup, toWords } from "@/lib/lineMarkup"
import "../timer.css"

// AB:TIMER.LINE-TEXT:START
// The text of a line on the Pro Timer screen, with its effects: the stop alert (StopAlert.tsx) and the comeback message (Comeback.tsx) both show their line with this component (see CONNECTIONS.md C49).
// The line comes in with its [effect:words] marks still in it. lineMarkup.ts cuts it into words and pieces (parseMarkup, toWords): every word is shown in its own box that blurs in from the top, one word after the other, the same movement as the React Bits BlurText (src/components/BlurText.tsx, never edited; it cannot colour single words, so its movement is written again in the css of this tag). A piece with an effect is wrapped in one more box that carries the name of the effect (data-effect, one of the six names of EFFECTS in lineMarkup.ts). The punctuation that touches a marked word stays outside the effect.
// The effects are drawn by the css with the same tag, once and without any script: each starts shortly after its word has come in, plays ONCE and then rests in its own look. Nothing loops (the phone must stay cool and the line must stay easy to read). The number of the word is handed to the css as --word-i, so the css can time the word and its effect.
// The words are real words separated by real spaces, so the text of the line reads right for a screen reader and for copying. A new line must start again, so the caller gives this component a key (the line).
// The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type LineTextProps = {
  line: string
  className: string
}

export default function LineText({ line, className }: LineTextProps) {
  const words = toWords(parseMarkup(line))
  return (
    <p className={className}>
      {words.map((word, w) => (
        <span key={w}>
          <span className="ab-line-word" style={{ "--word-i": w } as CSSProperties}>
            {word.map((piece, p) =>
              piece.effect === null ? (
                piece.text
              ) : (
                <span key={p} className="ab-fx" data-effect={piece.effect}>
                  {piece.text}
                </span>
              ),
            )}
          </span>
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  )
}
// AB:TIMER.LINE-TEXT:END
