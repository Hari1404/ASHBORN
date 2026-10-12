// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { EFFECTS, fillSlots, parseMarkup, toWords } from "@/lib/lineMarkup"
import { COMEBACK_BANKS, COMEBACK_SHOW_MS, STOP_ALERT_BANKS } from "@/lib/stopAlertLines"
import LineText from "./LineText"

// AB:TIMER.TESTS:START
// The css file and the library text are read as plain text from the project root, where npm test runs.
const timerCss = readFileSync("src/timer.css", "utf8")
const blurTextSource = readFileSync("src/components/BlurText.tsx", "utf8")

// The marker lines of a tagged part of the css are written in two pieces here, so that the tag checker does not take them for markers of this test file.
function marker(part: string, edge: "START" | "END"): string {
  return "/* A" + "B:" + part + ":" + edge + " */"
}

function block(css: string, part: string): string {
  const start = css.indexOf(marker(part, "START"))
  const end = css.indexOf(marker(part, "END"))
  if (start < 0 || end < start) throw new Error("tagged part not found in the css: " + part)
  return css.slice(start, end)
}

// The text of the rule that starts with this selector, inside this text.
function rule(css: string, selector: string): string {
  const at = css.indexOf("\n" + selector + " {")
  if (at < 0) throw new Error("rule not found: " + selector)
  return css.slice(at, css.indexOf("}", at))
}

// The text of the @keyframes of this name, inside this text.
function keyframes(css: string, name: string): string {
  const at = css.indexOf("@keyframes " + name + " {")
  if (at < 0) throw new Error("keyframes not found: " + name)
  const end = css.indexOf("\n}\n", at)
  return css.slice(at, end + 3)
}

let root: Root | null = null
let container: HTMLElement | null = null

function show(line: string, className = "ab-alert-line"): HTMLElement {
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(LineText, { line, className })))
  const found = container.querySelector<HTMLElement>("p")
  if (found === null) throw new Error("no line drawn")
  return found
}

function effects(line: HTMLElement): [string | null, string | null][] {
  return Array.from(line.querySelectorAll<HTMLElement>(".ab-fx")).map((e) => [e.textContent, e.getAttribute("data-effect")])
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
})

describe("LineText: the words", () => {
  it("is one paragraph with the class it was given, and it needs no other class", () => {
    const line = show("Back in. Stay.", "ab-comeback-line")
    expect(line.tagName).toBe("P")
    expect(line.className).toBe("ab-comeback-line")
  })

  it("shows every word in its own box, numbered from 0, with a real space between the words", () => {
    const line = show("Ten minutes. Solid. Stay.")
    const words = Array.from(line.querySelectorAll<HTMLElement>(".ab-line-word"))
    expect(words.map((w) => w.textContent)).toEqual(["Ten", "minutes.", "Solid.", "Stay."])
    expect(words.map((w) => w.style.getPropertyValue("--word-i"))).toEqual(["0", "1", "2", "3"])
    expect(line.textContent).toBe("Ten minutes. Solid. Stay.")
  })

  it("never shows a mark: no square bracket and no colon of a mark is left in the text", () => {
    const line = show("You [heat:earn] it. [shake:Not] [ghost:really], and [glow:real session] now.")
    expect(line.textContent).toBe("You earn it. Not really, and real session now.")
    expect(line.textContent).not.toMatch(/[[\]]/)
  })

  it("counts the words across the effects: the number of a word does not restart inside a marked piece", () => {
    const line = show("A [heat:real session] ends.")
    const words = Array.from(line.querySelectorAll<HTMLElement>(".ab-line-word"))
    expect(words.map((w) => w.style.getPropertyValue("--word-i"))).toEqual(["0", "1", "2", "3"])
  })

  it("draws nothing for an empty line", () => {
    const line = show("")
    expect(line.querySelectorAll(".ab-line-word").length).toBe(0)
    expect(line.textContent).toBe("")
  })
})

describe("LineText: the effects", () => {
  it("wraps a marked word in a box that carries the name of its effect, and nothing else", () => {
    const line = show("You [heat:earn] it.")
    expect(effects(line)).toEqual([["earn", "heat"]])
    const plain = Array.from(line.querySelectorAll<HTMLElement>(".ab-line-word")).filter((w) => w.querySelector(".ab-fx") === null)
    expect(plain.map((w) => w.textContent)).toEqual(["You", "it."])
  })

  it("draws each of the six effects under its own name", () => {
    const line = show("[glow:a] [heat:b] [shake:c] [strike:d] [ghost:e] [rise:f]")
    expect(effects(line).map(([, name]) => name)).toEqual([...EFFECTS])
  })

  it("a marked piece of several words gets the effect on every word, and each word is its own box", () => {
    const line = show("Your [glow:real session] now.")
    expect(effects(line)).toEqual([
      ["real", "glow"],
      ["session", "glow"],
    ])
    expect(line.querySelectorAll(".ab-line-word").length).toBe(4)
  })

  it("keeps the punctuation next to a marked word in the same word box but outside the effect", () => {
    const line = show("Go [heat:back in].")
    const words = Array.from(line.querySelectorAll<HTMLElement>(".ab-line-word"))
    const last = words[words.length - 1]
    expect(last.textContent).toBe("in.")
    expect(last.querySelector(".ab-fx")?.textContent).toBe("in")
    expect(last.lastChild?.textContent).toBe(".")
  })

  it("a name that is not one of the six loses its effect and keeps its text, so a typo shows and does not break the line", () => {
    const line = show("a [sparkle:hi] b")
    expect(line.textContent).toBe("a hi b")
    expect(line.querySelectorAll(".ab-fx").length).toBe(0)
  })

  it("every marked keyword of all stop alert lines and all comeback lines gets an effect that has a rule in the css", () => {
    const css = block(timerCss, "TIMER.LINE-TEXT")
    const names = new Set<string>()
    let marked = 0
    for (const bank of [...Object.values(STOP_ALERT_BANKS), ...Object.values(COMEBACK_BANKS)]) {
      for (const text of bank) {
        for (const piece of parseMarkup(fillSlots(text, 600))) {
          if (piece.effect !== null) {
            names.add(piece.effect)
            marked++
          }
        }
      }
    }
    expect(marked).toBeGreaterThan(296)
    expect([...names].sort()).toEqual([...EFFECTS].sort())
    for (const name of names) expect(css).toContain('.ab-fx[data-effect="' + name + '"] {')
  })
})

describe("the css of the words and the effects", () => {
  const css = block(timerCss, "TIMER.LINE-TEXT")

  it("lies in its own tagged part of the css, once, after the comeback message's part and BEFORE the background's part (the test of the background reads the last reduced-motion rule of the file)", () => {
    expect(timerCss.split(marker("TIMER.LINE-TEXT", "START")).length).toBe(2)
    expect(timerCss.split(marker("TIMER.LINE-TEXT", "END")).length).toBe(2)
    expect(timerCss.indexOf(marker("TIMER.LINE-TEXT", "START"))).toBeGreaterThan(timerCss.indexOf(marker("TIMER.COMEBACK", "END")))
    expect(timerCss.indexOf(marker("TIMER.LINE-TEXT", "END"))).toBeLessThan(timerCss.indexOf(marker("TIMER.BG", "START")))
  })

  it("has a rule and keyframes for each of the six names of EFFECTS, and no rule for a name that is not in EFFECTS", () => {
    for (const name of EFFECTS) {
      expect(rule(css, '.ab-fx[data-effect="' + name + '"]')).toMatch(new RegExp("animation:\\s*ab-fx-" + name + " "))
      expect(css).toContain("@keyframes ab-fx-" + name + " {")
    }
    const used = new Set(Array.from(css.matchAll(/data-effect="([a-z]+)"/g), (m) => m[1]))
    expect([...used].sort()).toEqual([...EFFECTS].sort())
  })

  it("the six effects look different from each other when they rest", () => {
    const looks = EFFECTS.map((name) => rule(css, '.ab-fx[data-effect="' + name + '"]').replace(/animation:[^;]*;/, "").replace(/\s+/g, " "))
    expect(new Set(looks).size).toBe(6)
  })

  it("every effect plays once and then rests: no loop, and the first frame shows while the effect waits", () => {
    expect(css).not.toMatch(/infinite/)
    expect(css).not.toMatch(/animation-iteration-count/)
    for (const name of EFFECTS) {
      expect(rule(css, '.ab-fx[data-effect="' + name + '"]')).toMatch(/animation:[^;]* backwards;/)
    }
    expect(rule(css, '.ab-fx[data-effect="strike"]::after')).toMatch(/animation:[^;]* backwards;/)
    expect(rule(css, ".ab-line-word")).toMatch(/animation:[^;]* backwards;/)
  })

  it("a word comes in 80 ms after the word before it, in 700 ms, and its effect starts 450 ms after the word started", () => {
    expect(rule(css, ".ab-line-word")).toMatch(/animation:\s*ab-word-in 700ms linear calc\(var\(--word-i\) \* 80ms\) backwards;/)
    for (const name of EFFECTS) {
      expect(rule(css, '.ab-fx[data-effect="' + name + '"]')).toMatch(/calc\(var\(--word-i\) \* 80ms \+ 450ms\) backwards;/)
    }
    expect(rule(css, '.ab-fx[data-effect="strike"]::after')).toMatch(/calc\(var\(--word-i\) \* 80ms \+ 450ms\) backwards;/)
  })

  it("the longest effect is over, for the last word of the longest comeback line, before the comeback message starts to fade", () => {
    const longest = Math.max(...Object.values(COMEBACK_BANKS).flatMap((bank) => bank.map((text) => toWords(parseMarkup(fillSlots(text, 600))).length)))
    const slowest = Math.max(...Array.from(css.matchAll(/animation:\s*ab-fx-[a-z-]+ (\d+)ms/g), (m) => Number(m[1])))
    expect(slowest).toBe(1600)
    expect((longest - 1) * 80 + 450 + slowest).toBeLessThan(COMEBACK_SHOW_MS)
  })

  it("the words come in with the same movement as the React Bits BlurText that the lines used before (blur 10, 5 and 0 pixels, 50 pixels up)", () => {
    expect(blurTextSource).toContain("blur(10px)")
    expect(blurTextSource).toContain("y: -50")
    expect(blurTextSource).toContain("opacity: 0.5")
    const k = keyframes(css, "ab-word-in")
    expect(k).toMatch(/0% \{\s*opacity:\s*0;\s*filter:\s*blur\(10px\);\s*transform:\s*translateY\(-50px\);/)
    expect(k).toMatch(/50% \{\s*opacity:\s*0\.5;\s*filter:\s*blur\(5px\);\s*transform:\s*translateY\(5px\);/)
    expect(k).toMatch(/100% \{\s*opacity:\s*1;\s*filter:\s*blur\(0\);\s*transform:\s*translateY\(0\);/)
  })

  it("only the coming in of the words uses a blur, and nothing here blurs what is behind the text (that made the phone laggy)", () => {
    expect(css.replace(keyframes(css, "ab-word-in"), "")).not.toMatch(/blur\(|filter:/)
    expect(css).not.toMatch(/backdrop-filter/)
    expect(css).not.toMatch(/mix-blend-mode:/)
  })

  it("never touches the clip, the stacking or the taps of the screen", () => {
    expect(css).not.toMatch(/\.ab-timer\s*\{/)
    expect(css).not.toMatch(/isolation:/)
    expect(css).not.toMatch(/overflow/)
    expect(css).not.toMatch(/pointer-events:/)
    expect(css).not.toMatch(/z-index:/)
  })

  it("the strike line is drawn from the left with a transform, and the box of the word is its frame", () => {
    expect(rule(css, ".ab-fx")).toMatch(/position:\s*relative;/)
    expect(rule(css, '.ab-fx[data-effect="strike"]::after')).toMatch(/transform-origin:\s*left center;/)
    expect(keyframes(css, "ab-fx-strike-line")).toMatch(/scaleX\(0\)/)
  })

  it("stops every animation for people who asked for less motion, so the words and the effects are at rest at once", () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.ab-line-word,\s*\.ab-fx,\s*\.ab-fx\[data-effect="strike"\]::after\s*\{\s*animation:\s*none;\s*\}\s*\}/,
    )
  })
})
// AB:TIMER.TESTS:END
