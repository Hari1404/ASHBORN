// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import StopAlert from "./StopAlert"

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

type Props = Partial<Parameters<typeof StopAlert>[0]>
function show(over: Props = {}): { onDone: () => void; onGoBack: () => void } {
  const props = { line: "Ten minutes. [glow:Solid.] Stay.", canGoBack: true, disabled: false, note: "", onDone: vi.fn(), onGoBack: vi.fn(), ...over }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(StopAlert, props)))
  return props
}

function q(selector: string): HTMLElement {
  const found = container?.querySelector<HTMLElement>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
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

describe("StopAlert: what it shows", () => {
  it("is a modal alert dialog with a name and the line as its description", () => {
    show()
    const dialog = q(".ab-alert")
    expect(dialog.getAttribute("role")).toBe("alertdialog")
    expect(dialog.getAttribute("aria-modal")).toBe("true")
    expect(dialog.getAttribute("aria-label")).toBe("Stop the session?")
    const described = dialog.getAttribute("aria-describedby") ?? ""
    expect(document.getElementById(described)?.textContent).toBe("Ten minutes. Solid. Stay.")
  })

  it("shows the line without its [effect:words] marks, with real spaces between the words", () => {
    show({ line: "You [heat:earn] it. [shake:Not] [ghost:really], and [glow:real session] now." })
    expect(q(".ab-alert-line").textContent).toBe("You earn it. Not really, and real session now.")
    expect(q(".ab-alert-line").textContent).not.toMatch(/[[\]]/)
  })

  it("draws the effect of every marked keyword (one box for each marked word) and none for the plain words", () => {
    show({ line: "You [heat:earn] it. [shake:Not] [ghost:really], and [glow:real session] now." })
    const fx = Array.from(container?.querySelectorAll<HTMLElement>(".ab-alert-line .ab-fx") ?? [])
    expect(fx.map((e) => [e.textContent, e.getAttribute("data-effect")])).toEqual([
      ["earn", "heat"],
      ["Not", "shake"],
      ["really", "ghost"],
      ["real", "glow"],
      ["session", "glow"],
    ])
  })

  it("shows the line with LineText: one box per word, numbered from 0, in the line with the class ab-alert-line", () => {
    show()
    const line = q(".ab-alert-line")
    expect(line.tagName).toBe("P")
    const words = Array.from(line.querySelectorAll<HTMLElement>(".ab-line-word"))
    expect(words.map((w) => w.textContent)).toEqual(["Ten", "minutes.", "Solid.", "Stay."])
    expect(words.map((w) => w.style.getPropertyValue("--word-i"))).toEqual(["0", "1", "2", "3"])
  })

  it("puts I'M DONE first and GO BACK IN second", () => {
    show()
    const labels = Array.from(container?.querySelectorAll("button") ?? []).map((b) => b.textContent)
    expect(labels).toEqual(["I'M DONE", "GO BACK IN"])
  })

  it("has no GO BACK IN when it is not allowed", () => {
    show({ canGoBack: false })
    const labels = Array.from(container?.querySelectorAll("button") ?? []).map((b) => b.textContent)
    expect(labels).toEqual(["I'M DONE"])
  })

  it("shows the note under the buttons, and keeps its place when there is none", () => {
    show({ note: "No connection. Waiting to reconnect." })
    expect(q(".ab-alert-note").textContent).toBe("No connection. Waiting to reconnect.")
    show({ note: "" })
    expect(q(".ab-alert-note").textContent).toBe("")
  })
})

describe("StopAlert: the buttons", () => {
  it("I'M DONE calls onDone and GO BACK IN calls onGoBack, each once", () => {
    const props = show()
    act(() => q(".ab-alert-done").click())
    expect(props.onDone).toHaveBeenCalledTimes(1)
    expect(props.onGoBack).not.toHaveBeenCalled()
    act(() => q(".ab-alert-back").click())
    expect(props.onGoBack).toHaveBeenCalledTimes(1)
    expect(props.onDone).toHaveBeenCalledTimes(1)
  })

  it("both buttons are off when disabled, and a click does nothing", () => {
    const props = show({ disabled: true })
    expect(q(".ab-alert-done").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-alert-back").hasAttribute("disabled")).toBe(true)
    act(() => q(".ab-alert-done").click())
    act(() => q(".ab-alert-back").click())
    expect(props.onDone).not.toHaveBeenCalled()
    expect(props.onGoBack).not.toHaveBeenCalled()
  })

  it("puts the focus on the card and not on a button, so that a key still held from the Hold Button cannot press one", () => {
    show()
    expect(document.activeElement).toBe(q(".ab-alert-card"))
    expect(document.activeElement?.tagName).not.toBe("BUTTON")
  })
})

describe("the css of the stop alert", () => {
  const css = block(timerCss, "TIMER.STOP-ALERT")
  const screen = block(timerCss, "TIMER.SCREEN")

  it("lies in its own tagged part of the css, once, after the screen's part and BEFORE the background's part (the test of the background reads the last reduced-motion rule of the file)", () => {
    expect(timerCss.split(marker("TIMER.STOP-ALERT", "START")).length).toBe(2)
    expect(timerCss.split(marker("TIMER.STOP-ALERT", "END")).length).toBe(2)
    expect(timerCss.indexOf(marker("TIMER.STOP-ALERT", "START"))).toBeGreaterThan(timerCss.indexOf(marker("TIMER.SCREEN", "END")))
    expect(timerCss.indexOf(marker("TIMER.STOP-ALERT", "END"))).toBeLessThan(timerCss.indexOf(marker("TIMER.BG", "START")))
  })

  it("covers the whole screen: position absolute with inset 0, inside the screen that is position relative", () => {
    const r = rule(css, ".ab-alert")
    expect(r).toMatch(/position:\s*absolute;/)
    expect(r).toMatch(/inset:\s*0;/)
    expect(rule(screen, ".ab-timer")).toMatch(/position:\s*relative;/)
  })

  it("is drawn above the dial and the buttons (z-index 1), and below the menu (z-index 40)", () => {
    const z = Number(/z-index:\s*(\d+);/.exec(rule(css, ".ab-alert"))?.[1])
    expect(z).toBeGreaterThan(Number(/z-index:\s*(\d+);/.exec(rule(screen, ".ab-timer-dial"))?.[1]))
    expect(z).toBeLessThan(40)
  })

  it("has no blur behind it (a blur over the moving background made the phone laggy)", () => {
    expect(css).not.toMatch(/backdrop-filter/)
    expect(css).not.toMatch(/blur\(/)
  })

  it("never touches the clip, the stacking or the taps of the screen itself", () => {
    expect(css).not.toMatch(/\.ab-timer\s*\{/)
    expect(css).not.toMatch(/isolation:/)
    expect(css).not.toMatch(/pointer-events:/)
    expect(css).not.toMatch(/mix-blend-mode:/)
  })

  it("scrolls by itself in a window too low for the card, and centres the card so that its top is never cut off", () => {
    expect(rule(css, ".ab-alert")).toMatch(/overflow-y:\s*auto;/)
    expect(rule(css, ".ab-alert-card")).toMatch(/margin:\s*auto;/)
    expect(rule(css, ".ab-alert")).not.toMatch(/align-items:\s*center/)
  })

  it("centres the line, which is plain wrapping text (words with real spaces), not a flex row", () => {
    expect(rule(css, ".ab-alert-line")).toMatch(/text-align:\s*center;/)
    expect(rule(css, ".ab-alert-line")).not.toMatch(/display:\s*flex/)
  })

  it("stops its fade in for people who asked for less motion", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.ab-alert\s*\{\s*animation:\s*none;/)
  })
})
// AB:TIMER.TESTS:END
