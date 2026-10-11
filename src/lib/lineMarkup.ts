import { GO_BACK_IN_LIMIT_SECONDS, wholeSeconds } from "@/lib/timerMaths"

// AB:TIMER.LINE-MARKUP:START
// How a line of text for the Pro Timer is written, and how it is cut into pieces for the screen. Pure functions: no screen, no clock, no randomness.
// A line is plain text with two kinds of marks (see CONNECTIONS.md C42):
//   {n}, {time}, {left}  are slots. fillSlots puts the real numbers of the session in them (a line must never say a number the session did not have).
//   [effect:words]       marks the words that get an effect while the line is shown, for example "You [heat:earn] it." The six effect names are in EFFECTS.
// What the effects mean (the css of the text component, a later packet, draws them):
//   glow = the important or true thing, heat = effort and earning, shake = failure and flinching, strike = the fake thing, ghost = nothing and fading, rise = growing and stacking.
// parseMarkup never throws. A mark it does not understand (an unknown effect name, a bracket that is not closed) stays in the text as it was, so a typo in a line shows up on the screen instead of breaking the alert. The tests of stopAlertLines.test.ts check every line.
// The automated tests are in src/lib/lineMarkup.test.ts. Run them with: npm test

export const EFFECTS = ["glow", "heat", "shake", "strike", "ghost", "rise"] as const
export type Effect = (typeof EFFECTS)[number]

// A piece of a line: its text and the effect of that piece (null for plain text).
export type Fragment = { text: string; effect: Effect | null }
// One word as the screen shows it: the pieces that touch each other without a space, for example the word "earn" with its effect and the "." after it.
export type Word = readonly Fragment[]

const MARK = /\[([a-z]+):([^[\]]+)\]/g

function isEffect(name: string): name is Effect {
  return (EFFECTS as readonly string[]).includes(name)
}

// 1 -> "1 minute", every other number -> "8 minutes" (0 -> "0 minutes").
export function minutesText(minutes: number): string {
  return minutes === 1 ? "1 minute" : minutes + " minutes"
}

// {n}: whole minutes of the session, rounded down, the number only.
// {time}: the same with its unit ("8 minutes").
// {left}: the minutes still missing to the end of GO BACK IN (45 minutes), rounded UP, with its unit, never less than 1 ("7 minutes"). Only lines of sessions shorter than that use it.
export function fillSlots(line: string, seconds: number): string {
  const s = wholeSeconds(seconds)
  const minutes = Math.floor(s / 60)
  const left = Math.max(1, Math.ceil((GO_BACK_IN_LIMIT_SECONDS - s) / 60))
  return line
    .replaceAll("{n}", String(minutes))
    .replaceAll("{time}", minutesText(minutes))
    .replaceAll("{left}", minutesText(left))
}

// Cuts a line into pieces: plain text and the marked words with their effect.
export function parseMarkup(line: string): Fragment[] {
  const out: Fragment[] = []
  let last = 0
  for (const m of line.matchAll(MARK)) {
    const at = m.index ?? 0
    if (at > last) out.push({ text: line.slice(last, at), effect: null })
    out.push({ text: m[2], effect: isEffect(m[1]) ? m[1] : null })
    last = at + m[0].length
  }
  if (last < line.length) out.push({ text: line.slice(last), effect: null })
  return out
}

// Groups the pieces into words. A space ends a word, any number of spaces count as one, and spaces at the start and at the end are dropped. A marked piece with several words ("real session") becomes one word per word, each with the effect.
export function toWords(fragments: readonly Fragment[]): Word[] {
  const words: Fragment[][] = []
  let current: Fragment[] = []
  for (const fragment of fragments) {
    for (const part of fragment.text.split(/(\s+)/)) {
      if (part === "") continue
      if (/^\s+$/.test(part)) {
        if (current.length > 0) {
          words.push(current)
          current = []
        }
      } else {
        current.push({ text: part, effect: fragment.effect })
      }
    }
  }
  if (current.length > 0) words.push(current)
  return words
}

// The line as plain text, without the marks (slots are not filled here).
export function plainText(line: string): string {
  return parseMarkup(line)
    .map((fragment) => fragment.text)
    .join("")
}
// AB:TIMER.LINE-MARKUP:END
