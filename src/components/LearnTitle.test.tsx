// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  CHAR_STAGGER_MS,
  EFFECT_DURATION_MS,
  EFFECT_EASING,
  EFFECT_FRAMES,
  POP_SPREAD_MS,
  SCRAMBLE_FIRST_MS,
  SCRAMBLE_GLYPHS,
  SCRAMBLE_STEP_MS,
  SCRAMBLE_TICK_MS,
  TYPE_STEP_MS,
  type EffectKind,
} from "@/lib/learnEffects"
import LearnTitle, { type LearnTitleProps } from "./LearnTitle"

// The big title of the Learn screen (Packet 12B, chunk 4).
// jsdom has no Element.animate, so a recorder is put in its place (it writes down which letter plays which pictures, with which options, and whether it was cancelled); one test takes it away again to see a browser that has none.
// The reduce motion setting is a fake matchMedia. The clock is fake where the scramble needs one.
let root: Root | null = null
let container: HTMLElement | null = null
let reduced = false
type Played = { target: HTMLElement; frames: unknown; options: unknown; cancel: ReturnType<typeof vi.fn> }
let played: Played[] = []

function installAnimate(): void {
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    writable: true,
    value(this: HTMLElement, frames: unknown, options: unknown) {
      const cancel = vi.fn()
      played.push({ target: this, frames, options, cancel })
      return { cancel }
    },
  })
}

function removeAnimate(): void {
  delete (HTMLElement.prototype as { animate?: unknown }).animate
}

function show(props: Partial<LearnTitleProps> = {}): void {
  const full: LearnTitleProps = { text: "Hi Go", effect: "blur", ...props }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(LearnTitle, full)))
}

function unmount(): void {
  act(() => root?.unmount())
  container?.remove()
  root = null
  container = null
}

function title(): HTMLElement {
  const found = container?.querySelector<HTMLElement>("h1") ?? null
  if (found === null) throw new Error("no title")
  return found
}

function letters(): string[] {
  return Array.from(title().querySelectorAll("[data-letter]")).map((l) => l.textContent ?? "")
}

function cursor(): Element | null {
  return title().querySelector(".ab-learn-cursor")
}

function wait(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  played = []
  reduced = false
  installAnimate()
  vi.stubGlobal("matchMedia", () => ({ matches: reduced }))
})

afterEach(() => {
  unmount()
  removeAnimate()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("LearnTitle: the markup", () => {
  it("is one heading whose name for a screen reader is the whole text", () => {
    show({ text: "Linear algebra", effect: "skew" })
    expect(container?.querySelectorAll("h1")).toHaveLength(1)
    expect(title().className).toBe("ab-learn-title")
    expect(title().getAttribute("aria-label")).toBe("Linear algebra")
  })

  it("hides the words and the letters from a screen reader, so it never reads letter by letter", () => {
    show({ text: "Linear algebra", effect: "skew" })
    const words = title().querySelectorAll(".ab-learn-word")
    expect(words).toHaveLength(2)
    words.forEach((w) => expect(w.getAttribute("aria-hidden")).toBe("true"))
    expect(title().querySelectorAll(".ab-learn-ch")).toHaveLength("Linearalgebra".length)
  })

  it("shows the text letter by letter, a word at a time", () => {
    show({ text: "Hi Go" })
    expect(letters()).toEqual(["H", "i", "G", "o"])
    expect(Array.from(title().querySelectorAll(".ab-learn-word")).map((w) => w.textContent)).toEqual(["Hi", "Go"])
  })

  it("keeps the space between two words a real space, so a long title wraps between words", () => {
    show({ text: "Hi Go" })
    expect(title().textContent).toBe("Hi Go")
    const between = title().childNodes[1]
    expect(between.nodeType).toBe(Node.TEXT_NODE)
    expect(between.nodeValue).toBe(" ")
  })

  it("puts no space before the first word or after the last, and joins extra spaces to one", () => {
    show({ text: "  Hi    Go  " })
    expect(title().textContent).toBe("Hi Go")
    expect(title().getAttribute("aria-label")).toBe("  Hi    Go  ")
  })

  it("keeps a letter that is more than one character (an emoji) whole", () => {
    show({ text: "a\u{1F600}" })
    expect(letters()).toEqual(["a", "\u{1F600}"])
  })

  it("is an empty heading, and throws nothing, for an empty text", () => {
    expect(() => show({ text: "", effect: "pop" })).not.toThrow()
    expect(letters()).toEqual([])
    expect(title().getAttribute("aria-label")).toBe("")
    expect(played).toHaveLength(0)
  })
})

describe("LearnTitle: the effects that move the letters (blur, rise, drop, skew, pop)", () => {
  const MOVING = ["blur", "rise", "drop", "skew"] as const

  it.each(MOVING)("plays two pictures on every letter for %s, one letter after the other", (effect) => {
    show({ text: "Hi Go", effect })
    expect(played.map((p) => p.target.textContent)).toEqual(["H", "i", "G", "o"])
    played.forEach((p, i) => {
      expect(p.target.hasAttribute("data-letter")).toBe(true)
      expect(p.frames).toEqual([...EFFECT_FRAMES[effect]])
      expect(p.options).toEqual({ duration: EFFECT_DURATION_MS, delay: i * CHAR_STAGGER_MS, easing: EFFECT_EASING, fill: "backwards" })
    })
  })

  it("starts every letter at a random moment for pop, inside the time the effect gives", () => {
    const random = vi.spyOn(Math, "random")
    random.mockReturnValueOnce(0.5).mockReturnValueOnce(0.25).mockReturnValueOnce(0.9)
    show({ text: "abc", effect: "pop" })
    expect(played.map((p) => (p.options as { delay: number }).delay)).toEqual([0.5 * POP_SPREAD_MS, 0.25 * POP_SPREAD_MS, 0.9 * POP_SPREAD_MS])
    expect(played[0].frames).toEqual([...EFFECT_FRAMES.pop])
  })

  it("starts the whole effect later by baseMs", () => {
    show({ text: "Hi", effect: "rise", baseMs: 300 })
    expect(played.map((p) => (p.options as { delay: number }).delay)).toEqual([300, 300 + CHAR_STAGGER_MS])
  })

  it("holds the first picture while a letter waits and leaves the normal look after it (fill backwards only)", () => {
    show({ text: "Hi", effect: "blur" })
    played.forEach((p) => expect((p.options as { fill: string }).fill).toBe("backwards"))
  })

  it("has no cursor", () => {
    show({ effect: "drop" })
    expect(cursor()).toBeNull()
  })
})

describe("LearnTitle: the typing effect (terminal)", () => {
  it("makes every letter invisible until its turn with a one step animation, one letter every 80 ms", () => {
    show({ text: "Hi Go", effect: "type" })
    expect(played).toHaveLength(4)
    played.forEach((p, i) => {
      expect(p.frames).toEqual([{ opacity: 0 }, { opacity: 1 }])
      expect(p.options).toEqual({ duration: 1, delay: i * TYPE_STEP_MS, easing: "steps(1)", fill: "both" })
    })
  })

  it("starts later by baseMs", () => {
    show({ text: "Hi", effect: "type", baseMs: 500 })
    expect(played.map((p) => (p.options as { delay: number }).delay)).toEqual([500, 500 + TYPE_STEP_MS])
  })

  it("puts a cursor, hidden from a screen reader, after the last letter", () => {
    show({ text: "Hi Go", effect: "type" })
    const c = cursor()
    expect(c).not.toBeNull()
    expect(c?.getAttribute("aria-hidden")).toBe("true")
    expect(title().lastElementChild).toBe(c)
  })
})

describe("LearnTitle: reduced motion", () => {
  it.each<EffectKind>(["blur", "rise", "drop", "skew", "pop", "type", "scramble"])("shows the title as it is, with nothing played, for %s", (effect) => {
    reduced = true
    vi.useFakeTimers()
    show({ text: "Hi Go", effect })
    expect(played).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
    expect(letters()).toEqual(["H", "i", "G", "o"])
    expect(cursor()).toBeNull()
  })

  it("asks the browser for the reduce setting", () => {
    const matchMedia = vi.fn(() => ({ matches: true }))
    vi.stubGlobal("matchMedia", matchMedia)
    show()
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)")
  })
})

describe("LearnTitle: a browser with no Element.animate", () => {
  it.each<EffectKind>(["blur", "pop", "type"])("shows the title and throws nothing for %s", (effect) => {
    removeAnimate()
    expect(() => show({ text: "Hi Go", effect })).not.toThrow()
    expect(letters()).toEqual(["H", "i", "G", "o"])
    expect(played).toHaveLength(0)
  })
})

describe("LearnTitle: the scramble (git)", () => {
  function shown(): string {
    return letters().join("")
  }

  it("starts with a random glyph in place of every letter, and keeps the real name for a screen reader", () => {
    vi.useFakeTimers()
    show({ text: "Hi Go", effect: "scramble" })
    expect(letters()).toHaveLength(4)
    letters().forEach((l) => expect(SCRAMBLE_GLYPHS).toContain(l))
    expect(title().getAttribute("aria-label")).toBe("Hi Go")
    title()
      .querySelectorAll(".ab-learn-word")
      .forEach((w) => expect(w.getAttribute("aria-hidden")).toBe("true"))
    expect(played).toHaveLength(0)
    expect(cursor()).toBeNull()
  })

  it("settles the letters one after the other, and changes the glyphs every 45 ms until then", () => {
    vi.useFakeTimers()
    vi.spyOn(Math, "random").mockReturnValue(0) // the glyph is always the first one, "0"
    show({ text: "Hi", effect: "scramble" })
    expect(shown()).toBe("00")
    // the first letter settles SCRAMBLE_FIRST_MS in, the next one SCRAMBLE_STEP_MS later; a tick comes every 45 ms
    wait(SCRAMBLE_FIRST_MS - 1)
    expect(shown()).toBe("00")
    wait(SCRAMBLE_TICK_MS)
    expect(shown()).toBe("H0")
    wait(SCRAMBLE_STEP_MS + SCRAMBLE_TICK_MS)
    expect(shown()).toBe("Hi")
  })

  it("draws new glyphs on a tick while a letter has not settled", () => {
    vi.useFakeTimers()
    const random = vi.spyOn(Math, "random")
    random.mockReturnValue(0)
    show({ text: "H", effect: "scramble" })
    expect(shown()).toBe("0")
    random.mockReturnValue(0.99)
    wait(SCRAMBLE_TICK_MS)
    expect(shown()).toBe("=")
  })

  it("stops its timer for good once every letter has settled", () => {
    vi.useFakeTimers()
    show({ text: "Hi Go", effect: "scramble" })
    expect(vi.getTimerCount()).toBe(1)
    wait(SCRAMBLE_FIRST_MS + 3 * SCRAMBLE_STEP_MS + 2 * SCRAMBLE_TICK_MS)
    expect(shown()).toBe("HiGo")
    expect(title().textContent).toBe("Hi Go")
    expect(vi.getTimerCount()).toBe(0)
  })

  it("stops its timer at once for an empty text", () => {
    vi.useFakeTimers()
    show({ text: "", effect: "scramble" })
    expect(vi.getTimerCount()).toBe(0)
    expect(letters()).toEqual([])
  })

  it("stops its timer when the title is taken away in the middle of the scramble", () => {
    vi.useFakeTimers()
    show({ text: "Hi Go", effect: "scramble" })
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("starts again with the new text, and never shows the glyphs of the old one", () => {
    vi.useFakeTimers()
    show({ text: "Hi", effect: "scramble" })
    expect(letters()).toHaveLength(2)
    show({ text: "Hello", effect: "scramble" })
    expect(letters()).toHaveLength(5)
    expect(vi.getTimerCount()).toBe(1)
    wait(SCRAMBLE_FIRST_MS + 5 * SCRAMBLE_STEP_MS + SCRAMBLE_TICK_MS)
    expect(shown()).toBe("Hello")
  })

  it("starts the scramble at 0 ms, so a baseMs of the plan is not used by the clock of the title", () => {
    vi.useFakeTimers()
    vi.spyOn(Math, "random").mockReturnValue(0)
    show({ text: "H", effect: "scramble", baseMs: 200 })
    // settleAt is 200 + 300: the letter is still a glyph just before, and itself just after
    wait(200 + SCRAMBLE_FIRST_MS - SCRAMBLE_TICK_MS)
    expect(shown()).toBe("0")
    wait(2 * SCRAMBLE_TICK_MS)
    expect(shown()).toBe("H")
  })
})

describe("LearnTitle: playing it again and taking it away", () => {
  it("cancels what it played when the title is taken away", () => {
    show({ text: "Hi Go", effect: "blur" })
    expect(played).toHaveLength(4)
    unmount()
    played.forEach((p) => expect(p.cancel).toHaveBeenCalledTimes(1))
  })

  it("plays again from the start, after cancelling the old one, when the text changes", () => {
    show({ text: "Hi", effect: "blur" })
    const old = played.slice()
    show({ text: "Hello", effect: "blur" })
    old.forEach((p) => expect(p.cancel).toHaveBeenCalledTimes(1))
    expect(played).toHaveLength(2 + 5)
    expect(played.slice(2).map((p) => p.target.textContent)).toEqual(["H", "e", "l", "l", "o"])
  })

  it("plays again when the effect changes", () => {
    show({ text: "Hi", effect: "blur" })
    show({ text: "Hi", effect: "rise" })
    expect(played).toHaveLength(4)
    expect(played[2].frames).toEqual([...EFFECT_FRAMES.rise])
    expect(played[0].cancel).toHaveBeenCalledTimes(1)
  })

  it("plays again when the start delay changes", () => {
    show({ text: "Hi", effect: "blur", baseMs: 0 })
    show({ text: "Hi", effect: "blur", baseMs: 400 })
    expect(played).toHaveLength(4)
    expect((played[2].options as { delay: number }).delay).toBe(400)
  })

  it("does not play again, and does not roll the random starts of pop again, when nothing changed", () => {
    const random = vi.spyOn(Math, "random")
    show({ text: "abc", effect: "pop" })
    const rolled = random.mock.calls.length
    show({ text: "abc", effect: "pop" })
    expect(played).toHaveLength(3)
    expect(random.mock.calls.length).toBe(rolled)
    played.forEach((p) => expect(p.cancel).not.toHaveBeenCalled())
  })

  it("moves from the scramble to a moving effect without a timer left behind", () => {
    vi.useFakeTimers()
    show({ text: "Hi", effect: "scramble" })
    expect(vi.getTimerCount()).toBe(1)
    show({ text: "Hi", effect: "blur" })
    expect(vi.getTimerCount()).toBe(0)
    expect(played).toHaveLength(2)
    expect(letters()).toEqual(["H", "i"])
  })
})
