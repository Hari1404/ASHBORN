// AB:LEARN.EFFECTS:START
// The title text effect of each Learn subject (from the preview page ASHBORN_Learn_subjects_item_card.html, "fx").
// The title is drawn letter by letter. Each subject has its own way for the letters to arrive.
// Pure functions: they say WHICH effect, WHEN each letter arrives and WHAT a letter shows at a moment. The screen
// (src/components/LearnTitle.tsx) makes the letters and plays what is planned here. No clock, no screen here.
// With reduced motion there is no effect: the plan is "still" and the title is simply shown. See CONNECTIONS.md C75.
import type { SubjectId } from "../data/learn/subjectColours"

export type EffectKind = "blur" | "rise" | "drop" | "skew" | "pop" | "scramble" | "type"

// One effect per subject. The words of the preview: python blurs in with a small drop, numpy rises from below, pandas drops in
// with a turn, linear algebra skews in, probability pops from small at random moments, git scrambles glyphs and settles,
// terminal types letter by letter with a blinking cursor.
export const SUBJECT_EFFECT: Readonly<Record<SubjectId, EffectKind>> = {
  python: "blur",
  numpy: "rise",
  pandas: "drop",
  la: "skew",
  prob: "pop",
  git: "scramble",
  terminal: "type",
}

// The big word "Subjects" of the hub uses the effect of Python, as in the preview.
export const HUB_EFFECT: EffectKind = "blur"

export type EffectFrame = { opacity: number; transform?: string; filter?: string }
type AnimatedKind = "blur" | "rise" | "drop" | "skew" | "pop"

// The first and last picture of a letter (for Element.animate; the last is the normal look).
export const EFFECT_FRAMES: Readonly<Record<AnimatedKind, readonly [EffectFrame, EffectFrame]>> = {
  blur: [{ filter: "blur(8px)", opacity: 0, transform: "translateY(-.3em)" }, { filter: "blur(0)", opacity: 1, transform: "none" }],
  rise: [{ transform: "translateY(.9em)", opacity: 0 }, { transform: "none", opacity: 1 }],
  drop: [{ transform: "translateY(-1.2em) rotate(-25deg)", opacity: 0 }, { transform: "none", opacity: 1 }],
  skew: [{ transform: "skewX(-50deg) scaleX(.2)", opacity: 0 }, { transform: "none", opacity: 1 }],
  pop: [{ transform: "translateY(-.6em) scale(.4)", opacity: 0 }, { transform: "none", opacity: 1 }],
}

export const EFFECT_DURATION_MS = 700
export const EFFECT_EASING = "cubic-bezier(.23,1,.32,1)"
export const CHAR_STAGGER_MS = 50 // blur, rise, drop, skew: each letter starts this much after the one before
export const POP_SPREAD_MS = 700 // pop: each letter starts at a random moment inside this time
export const TYPE_STEP_MS = 80 // type: one letter every this many milliseconds
export const SCRAMBLE_GLYPHS = "01{}<>/#="
export const SCRAMBLE_FIRST_MS = 300 // scramble: the first letter settles after this
export const SCRAMBLE_STEP_MS = 70 // and each next letter this much later
export const SCRAMBLE_TICK_MS = 45 // the glyphs change this often

// The words of a title, each as a list of letters. Letters are whole characters (not halves of an emoji).
export function titleWords(text: string): string[][] {
  return text
    .split(" ")
    .filter((w) => w !== "")
    .map((w) => Array.from(w))
}

export function letterCount(words: readonly (readonly string[])[]): number {
  return words.reduce((a, w) => a + w.length, 0)
}

export type EffectPlan =
  | { mode: "still"; words: string[][] }
  | {
      mode: "animate" // each letter plays frames, delays[i] is when letter i starts (milliseconds)
      words: string[][]
      delays: number[]
      frames: readonly [EffectFrame, EffectFrame]
      durationMs: number
      easing: string
    }
  | { mode: "type"; words: string[][]; delays: number[]; stepMs: number } // letter i shows at delays[i]; then a cursor blinks
  | { mode: "scramble"; words: string[][]; settleAt: number[] } // letter i settles at settleAt[i] after the start

export type EffectOptions = { reduced: boolean; baseMs?: number; rand?: () => number }

export function effectPlan(kind: EffectKind, text: string, options: EffectOptions): EffectPlan {
  const words = titleWords(text)
  if (options.reduced) return { mode: "still", words }
  const base = options.baseMs ?? 0
  const rand = options.rand ?? Math.random
  const n = letterCount(words)
  const range = (f: (i: number) => number): number[] => Array.from({ length: n }, (_, i) => f(i))
  if (kind === "scramble") {
    return { mode: "scramble", words, settleAt: range((i) => base + SCRAMBLE_FIRST_MS + i * SCRAMBLE_STEP_MS) }
  }
  if (kind === "type") {
    return { mode: "type", words, delays: range((i) => base + i * TYPE_STEP_MS), stepMs: TYPE_STEP_MS }
  }
  return {
    mode: "animate",
    words,
    delays: range((i) => base + (kind === "pop" ? rand() * POP_SPREAD_MS : i * CHAR_STAGGER_MS)),
    frames: EFFECT_FRAMES[kind],
    durationMs: EFFECT_DURATION_MS,
    easing: EFFECT_EASING,
  }
}

// What the letters of a scrambling title show after elapsedMs: a letter that has not settled shows a random glyph, a
// letter that has settled shows itself. done is true when every letter has settled (the timer can stop).
export function scrambleShown(
  letters: readonly string[],
  settleAt: readonly number[],
  elapsedMs: number,
  rand: () => number = Math.random,
): { shown: string[]; done: boolean } {
  let done = true
  const shown = letters.map((letter, i) => {
    if (elapsedMs < (settleAt[i] ?? 0)) {
      done = false
      return SCRAMBLE_GLYPHS.charAt(Math.floor(rand() * SCRAMBLE_GLYPHS.length) % SCRAMBLE_GLYPHS.length)
    }
    return letter
  })
  return { shown, done }
}

// The time until the last letter has arrived (the title is complete). A title with no letters takes no time.
export function effectEndMs(plan: EffectPlan): number {
  if (plan.mode === "still") return 0
  if (plan.mode === "scramble") return plan.settleAt.length === 0 ? 0 : Math.max(...plan.settleAt)
  if (plan.delays.length === 0) return 0
  const last = Math.max(...plan.delays)
  return plan.mode === "animate" ? last + plan.durationMs : last
}
// AB:LEARN.EFFECTS:END
