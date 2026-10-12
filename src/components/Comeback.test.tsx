// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { COMEBACK_FADE_MS, COMEBACK_SHOW_MS } from "@/lib/stopAlertLines"
import Comeback from "./Comeback"

// AB:TIMER.TESTS:START
// The css file is read as plain text from the project root, where npm test runs.
const timerCss = readFileSync("src/timer.css", "utf8")

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

let root: Root | null = null
let container: HTMLElement | null = null

function show(line = "Back in. The clock picks up where you left it. [heat:Reach sixty seconds] and it counts.", onGone: () => void = vi.fn()): () => void {
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(Comeback, { line, onGone })))
  return onGone
}

function box(): HTMLElement {
  const found = container?.querySelector<HTMLElement>(".ab-comeback") ?? null
  if (found === null) throw new Error("not found: .ab-comeback")
  return found
}

function wait(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers()
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.useRealTimers()
})

describe("Comeback: what it shows", () => {
  it("is a status message that holds the line", () => {
    show("Back in. [glow:Stay.]")
    expect(box().getAttribute("role")).toBe("status")
    expect(box().textContent).toBe("Back in. Stay.")
  })

  it("shows the line without its [effect:words] marks, with real spaces between the words", () => {
    show("You [heat:earn] it. [shake:Not] [ghost:really], and [glow:real session] now.")
    expect(box().textContent).toBe("You earn it. Not really, and real session now.")
    expect(box().textContent).not.toMatch(/[[\]]/)
  })

  it("draws the effect of every marked keyword, and keeps the punctuation next to it outside the effect", () => {
    show("Back in. [rise:Stay], [strike:please].")
    const fx = Array.from(box().querySelectorAll<HTMLElement>(".ab-fx"))
    expect(fx.map((e) => [e.textContent, e.getAttribute("data-effect")])).toEqual([
      ["Stay", "rise"],
      ["please", "strike"],
    ])
    expect(box().textContent).toBe("Back in. Stay, please.")
  })

  it("shows the line with LineText: one box per word, numbered from 0, in the line with the class ab-comeback-line", () => {
    show("Back in. [glow:Stay.]")
    const line = box().querySelector<HTMLElement>(".ab-comeback-line")
    expect(line?.tagName).toBe("P")
    const words = Array.from(box().querySelectorAll<HTMLElement>(".ab-line-word"))
    expect(words.map((w) => w.textContent)).toEqual(["Back", "in.", "Stay."])
    expect(words.map((w) => w.style.getPropertyValue("--word-i"))).toEqual(["0", "1", "2"])
  })

  it("has no button and nothing that takes the focus", () => {
    show()
    expect(container?.querySelector("button, a, input, [tabindex]")).toBeNull()
  })
})

describe("Comeback: how long it stays", () => {
  it("is written as 6 seconds and a fade of 500 ms (written here again on purpose, see CONNECTIONS.md C33 and C48)", () => {
    expect(COMEBACK_SHOW_MS).toBe(6000)
    expect(COMEBACK_FADE_MS).toBe(500)
  })

  it("starts to fade when the time is over, and asks to be taken away only when the fade is over, once", () => {
    const onGone = show()
    expect(box().getAttribute("data-leaving")).toBe("false")
    wait(COMEBACK_SHOW_MS - 1)
    expect(box().getAttribute("data-leaving")).toBe("false")
    wait(1)
    expect(box().getAttribute("data-leaving")).toBe("true")
    expect(onGone).not.toHaveBeenCalled()
    wait(COMEBACK_FADE_MS - 1)
    expect(onGone).not.toHaveBeenCalled()
    wait(1)
    expect(onGone).toHaveBeenCalledTimes(1)
    wait(60_000)
    expect(onGone).toHaveBeenCalledTimes(1)
  })

  it("never asks to be taken away when the screen took it away first (the waits are stopped)", () => {
    const onGone = show()
    wait(3000)
    act(() => root?.unmount())
    root = null
    container?.remove()
    container = null
    wait(60_000)
    expect(onGone).not.toHaveBeenCalled()
  })

  it("a new line starts the wait again, and does not start out faded", () => {
    const onGone = show("First line.")
    wait(COMEBACK_SHOW_MS + 100)
    expect(box().getAttribute("data-leaving")).toBe("true")
    show("Second line.", onGone)
    expect(box().getAttribute("data-leaving")).toBe("false")
    wait(COMEBACK_SHOW_MS - 1)
    expect(box().getAttribute("data-leaving")).toBe("false")
    expect(onGone).not.toHaveBeenCalled()
    wait(1 + COMEBACK_FADE_MS)
    expect(onGone).toHaveBeenCalledTimes(1)
  })
})

describe("the css of the comeback message", () => {
  const css = block(timerCss, "TIMER.COMEBACK")
  const screen = block(timerCss, "TIMER.SCREEN")

  it("lies in its own tagged part of the css, once, after the stop alert's part and BEFORE the background's part (the test of the background reads the last reduced-motion rule of the file)", () => {
    expect(timerCss.split(marker("TIMER.COMEBACK", "START")).length).toBe(2)
    expect(timerCss.split(marker("TIMER.COMEBACK", "END")).length).toBe(2)
    expect(timerCss.indexOf(marker("TIMER.COMEBACK", "START"))).toBeGreaterThan(timerCss.indexOf(marker("TIMER.STOP-ALERT", "END")))
    expect(timerCss.indexOf(marker("TIMER.COMEBACK", "END"))).toBeLessThan(timerCss.indexOf(marker("TIMER.BG", "START")))
  })

  it("floats over the screen: position absolute inside the screen that is position relative, so it takes no room and nothing moves when it comes and goes", () => {
    expect(rule(css, ".ab-comeback")).toMatch(/position:\s*absolute;/)
    expect(rule(screen, ".ab-timer")).toMatch(/position:\s*relative;/)
  })

  it("never catches a tap", () => {
    expect(rule(css, ".ab-comeback")).toMatch(/pointer-events:\s*none;/)
  })

  it("is drawn above the dial and the buttons (z-index 1), and below the menu (z-index 40)", () => {
    const z = Number(/z-index:\s*(\d+);/.exec(rule(css, ".ab-comeback"))?.[1])
    expect(z).toBeGreaterThan(Number(/z-index:\s*(\d+);/.exec(rule(screen, ".ab-timer-dial"))?.[1]))
    expect(z).toBeLessThan(40)
  })

  it("sits under the row of the menu button, inside the 72 px that the screen keeps free at the top", () => {
    const top = Number(/top:\s*(\d+)px;/.exec(rule(css, ".ab-comeback"))?.[1])
    expect(top).toBeGreaterThanOrEqual(56)
    expect(top).toBeLessThanOrEqual(72)
  })

  it("is never wider than the screen minus its sides, or 420 px", () => {
    expect(rule(css, ".ab-comeback")).toMatch(/max-width:\s*min\(calc\(100% - 40px\), 420px\);/)
  })

  it("fades out in the same time as COMEBACK_FADE_MS, and the faded state is invisible", () => {
    const fade = Number(/transition:\s*opacity (\d+)ms ease;/.exec(rule(css, ".ab-comeback"))?.[1])
    expect(fade).toBe(COMEBACK_FADE_MS)
    expect(rule(css, '.ab-comeback[data-leaving="true"]')).toMatch(/opacity:\s*0;/)
  })

  it("has no blur behind it (a blur over the moving background made the phone laggy)", () => {
    expect(css).not.toMatch(/backdrop-filter/)
    expect(css).not.toMatch(/blur\(/)
  })

  it("never touches the clip, the stacking or the blending of the screen itself", () => {
    expect(css).not.toMatch(/\.ab-timer\s*\{/)
    expect(css).not.toMatch(/isolation:/)
    expect(css).not.toMatch(/mix-blend-mode:/)
    expect(css).not.toMatch(/overflow/)
  })

  it("centres the line, which is plain wrapping text (words with real spaces), not a flex row", () => {
    expect(rule(css, ".ab-comeback-line")).toMatch(/text-align:\s*center;/)
    expect(rule(css, ".ab-comeback-line")).not.toMatch(/display:\s*flex/)
  })

  it("stops its fades for people who asked for less motion", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.ab-comeback\s*\{\s*animation:\s*none;\s*transition:\s*none;/)
  })
})
// AB:TIMER.TESTS:END
