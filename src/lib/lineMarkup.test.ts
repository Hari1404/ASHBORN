import { describe, expect, it } from "vitest"
import { EFFECTS, fillSlots, minutesText, parseMarkup, plainText, toWords } from "./lineMarkup"
import { GO_BACK_IN_LIMIT_SECONDS } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the marks in the lines of the Pro Timer (slots and effects). Run them with: npm test
// The end of GO BACK IN (45 minutes) that {left} counts to is imported here, not written again, see CONNECTIONS.md C42.

describe("the six effects", () => {
  it("are glow, heat, shake, strike, ghost and rise, in this order (the css of the text component is written for these names)", () => {
    expect([...EFFECTS]).toEqual(["glow", "heat", "shake", "strike", "ghost", "rise"])
  })
})

describe("minutesText", () => {
  it("says minute for 1 and minutes for every other number, 0 included", () => {
    expect(minutesText(1)).toBe("1 minute")
    expect(minutesText(0)).toBe("0 minutes")
    expect(minutesText(2)).toBe("2 minutes")
    expect(minutesText(130)).toBe("130 minutes")
  })
})

describe("fillSlots", () => {
  it("fills {n} with the whole minutes (rounded down) and {time} with the minutes and their unit", () => {
    expect(fillSlots("{n}|{time}", 8 * 60 + 59)).toBe("8|8 minutes")
    expect(fillSlots("{n}|{time}", 60)).toBe("1|1 minute")
    expect(fillSlots("{n}|{time}", 59)).toBe("0|0 minutes")
    expect(fillSlots("{n}|{time}", 130 * 60)).toBe("130|130 minutes")
  })

  it("fills {left} with the minutes still missing to the end of GO BACK IN, rounded UP, never less than 1", () => {
    const limit = GO_BACK_IN_LIMIT_SECONDS
    expect(fillSlots("{left}", limit - 1)).toBe("1 minute")
    expect(fillSlots("{left}", limit - 60)).toBe("1 minute")
    expect(fillSlots("{left}", limit - 61)).toBe("2 minutes")
    expect(fillSlots("{left}", 38 * 60)).toBe("7 minutes")
    expect(fillSlots("{left}", 20 * 60)).toBe("25 minutes")
    expect(fillSlots("{left}", 0)).toBe("45 minutes")
    expect(fillSlots("{left}", limit)).toBe("1 minute")
    expect(fillSlots("{left}", limit * 3)).toBe("1 minute")
  })

  it("fills every slot of a line, also the same slot twice, and leaves the rest of the text alone", () => {
    expect(fillSlots("{left}. You were {left} away, after {time}.", 38 * 60)).toBe("7 minutes. You were 7 minutes away, after 38 minutes.")
    expect(fillSlots("No slot here. {unknown} stays.", 600)).toBe("No slot here. {unknown} stays.")
  })

  it("fills a slot that sits inside a marked word, and does not touch the marks", () => {
    expect(fillSlots("You gave it [heat:{time}].", 8 * 60)).toBe("You gave it [heat:8 minutes].")
  })

  it("counts anything that is not a finite number above 0 as 0 seconds", () => {
    expect(fillSlots("{n}|{left}", Number.NaN)).toBe("0|45 minutes")
    expect(fillSlots("{n}|{left}", -50)).toBe("0|45 minutes")
    expect(fillSlots("{n}|{left}", Number.POSITIVE_INFINITY)).toBe("0|45 minutes")
  })
})

describe("parseMarkup", () => {
  it("gives one plain piece for a line without marks, and nothing for an empty line", () => {
    expect(parseMarkup("Plain line.")).toEqual([{ text: "Plain line.", effect: null }])
    expect(parseMarkup("")).toEqual([])
  })

  it("cuts out a marked piece with its effect, and keeps the plain text around it in order", () => {
    expect(parseMarkup("You [heat:earn] it.")).toEqual([
      { text: "You ", effect: null },
      { text: "earn", effect: "heat" },
      { text: " it.", effect: null },
    ])
  })

  it("reads a mark at the very start, a mark at the very end and two marks next to each other", () => {
    expect(parseMarkup("[glow:Real] work")).toEqual([
      { text: "Real", effect: "glow" },
      { text: " work", effect: null },
    ])
    expect(parseMarkup("Do it [rise:now]")).toEqual([
      { text: "Do it ", effect: null },
      { text: "now", effect: "rise" },
    ])
    expect(parseMarkup("[heat:a][shake:b]")).toEqual([
      { text: "a", effect: "heat" },
      { text: "b", effect: "shake" },
    ])
  })

  it("keeps the words of a marked piece together, spaces, apostrophes and full stops included", () => {
    expect(parseMarkup("A '[strike:I'll just check one thing.]' ok")).toEqual([
      { text: "A '", effect: null },
      { text: "I'll just check one thing.", effect: "strike" },
      { text: "' ok", effect: null },
    ])
  })

  it("never throws: an unknown effect name loses its effect but keeps its text, and a bracket that is not closed stays in the text", () => {
    expect(parseMarkup("A [sparkle:word] here")).toEqual([
      { text: "A ", effect: null },
      { text: "word", effect: null },
      { text: " here", effect: null },
    ])
    expect(parseMarkup("A [heat:word here")).toEqual([{ text: "A [heat:word here", effect: null }])
    expect(parseMarkup("A [heat:] here")).toEqual([{ text: "A [heat:] here", effect: null }])
    expect(parseMarkup("A [Heat:word] here")).toEqual([{ text: "A [Heat:word] here", effect: null }])
  })
})

describe("toWords", () => {
  it("gives no word for an empty line or a line of spaces", () => {
    expect(toWords(parseMarkup(""))).toEqual([])
    expect(toWords(parseMarkup("   "))).toEqual([])
  })

  it("gives one word per word, drops the spaces at the start and the end, and counts several spaces as one", () => {
    const words = toWords(parseMarkup("  one   two three  "))
    expect(words.map((w) => w.map((f) => f.text).join(""))).toEqual(["one", "two", "three"])
  })

  it("puts a marked piece and the text that touches it into ONE word (the word earn with the full stop after it)", () => {
    const words = toWords(parseMarkup("You [heat:earn]. Then [shake:quit]ed it"))
    expect(words).toEqual([
      [{ text: "You", effect: null }],
      [
        { text: "earn", effect: "heat" },
        { text: ".", effect: null },
      ],
      [{ text: "Then", effect: null }],
      [
        { text: "quit", effect: "shake" },
        { text: "ed", effect: null },
      ],
      [{ text: "it", effect: null }],
    ])
  })

  it("gives every word of a marked piece with several words its own word, each with the effect", () => {
    const words = toWords(parseMarkup("a [glow:real session] b"))
    expect(words).toEqual([
      [{ text: "a", effect: null }],
      [{ text: "real", effect: "glow" }],
      [{ text: "session", effect: "glow" }],
      [{ text: "b", effect: null }],
    ])
  })
})

describe("plainText", () => {
  it("is the line without the marks, spaces and punctuation as written", () => {
    expect(plainText("You [heat:earn] it, [glow:real session].")).toBe("You earn it, real session.")
    expect(plainText("")).toBe("")
    expect(plainText("No marks.")).toBe("No marks.")
  })
})
// AB:TIMER.TESTS:END
