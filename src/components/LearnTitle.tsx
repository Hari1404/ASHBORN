import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react"
import { SCRAMBLE_TICK_MS, effectPlan, scrambleShown, type EffectKind, type EffectPlan } from "@/lib/learnEffects"
import { prefersReducedMotion } from "@/lib/learnMotion"
import "../learn.css"

// AB:LEARN.TITLE:START
// The big title of the Learn screen ("Subjects" on the hub, the name of the subject in a subject), drawn letter by letter so each subject can have its own way for the letters to arrive (src/lib/learnEffects.ts says which effect and when; this file plays it).
// The title is ONE heading. Its name for a screen reader is the whole text (aria-label); the words and the letters inside are hidden from a screen reader, so it never reads letter by letter. A space between two words stays a real space, so a long title wraps between words and never inside one.
//  - blur, rise, drop, skew, pop: every letter plays two pictures with Element.animate (the first picture holds while the letter waits for its turn, the last is the normal look).
//  - type: every letter is invisible until its turn (a one step animation), and a cursor blinks after the last letter.
//  - scramble: the letters show random glyphs and settle one after the other. The glyphs are kept in state and change every SCRAMBLE_TICK_MS until all have settled.
//  - With reduced motion, or in a browser with no Element.animate (the tests), the title is simply shown.
// The effect starts in a layout effect, before the browser paints, so the whole word is never seen for one frame before its letters hide. A new text, a new effect or a new start delay plays it again; the plan (and its random starts for pop) is made once for as long as those stay the same.
// The look (a gradient on each letter, the cursor, the size) is the css with the same tag in learn.css.
export type LearnTitleProps = {
  text: string
  effect: EffectKind
  baseMs?: number // the effect starts this long after the title is shown
}

type Scrambled = { forPlan: EffectPlan; words: string[][] }

export default function LearnTitle({ text, effect, baseMs = 0 }: LearnTitleProps) {
  const [reduced] = useState(prefersReducedMotion)
  const plan = useMemo(() => effectPlan(effect, text, { reduced, baseMs }), [effect, text, reduced, baseMs])
  const rootRef = useRef<HTMLHeadingElement>(null)
  const [scrambled, setScrambled] = useState<Scrambled | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (root === null) return undefined

    if (plan.mode === "animate" || plan.mode === "type") {
      const running: Animation[] = []
      root.querySelectorAll<HTMLElement>("[data-letter]").forEach((letter, i) => {
        if (typeof letter.animate !== "function") return
        const delay = plan.delays[i] ?? 0
        running.push(
          plan.mode === "type"
            ? letter.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay, easing: "steps(1)", fill: "both" })
            : letter.animate([...plan.frames], { duration: plan.durationMs, delay, easing: plan.easing, fill: "backwards" }),
        )
      })
      return () => running.forEach((animation) => animation.cancel())
    }

    if (plan.mode === "scramble") {
      const start = performance.now()
      const tick = (): void => {
        const elapsed = performance.now() - start
        let done = true
        let from = 0
        const words = plan.words.map((word) => {
          const result = scrambleShown(word, plan.settleAt.slice(from, from + word.length), elapsed)
          from += word.length
          if (!result.done) done = false
          return result.shown
        })
        if (done) {
          window.clearInterval(timer)
          setScrambled(null)
        } else {
          setScrambled({ forPlan: plan, words })
        }
      }
      const timer = window.setInterval(tick, SCRAMBLE_TICK_MS)
      tick()
      return () => window.clearInterval(timer)
    }

    return undefined
  }, [plan])

  // Glyphs that belong to an older plan (the text changed while scrambling) are never shown.
  const words = scrambled !== null && scrambled.forPlan === plan ? scrambled.words : plan.words

  return (
    <h1 ref={rootRef} className="ab-learn-title" aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          {w > 0 ? " " : null}
          <span className="ab-learn-word" aria-hidden="true">
            {word.map((letter, l) => (
              <span key={l} className="ab-learn-ch" data-letter="">
                {letter}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
      {plan.mode === "type" ? <span className="ab-learn-cursor" aria-hidden="true" /> : null}
    </h1>
  )
}
// AB:LEARN.TITLE:END
