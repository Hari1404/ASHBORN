import { describe, expect, it } from "vitest"
import { bgLight } from "./backgroundLook"
import { ballStep } from "./ballLook"
import { EFFECTS, fillSlots, parseMarkup, plainText } from "./lineMarkup"
import {
  BANK_IDS,
  COMEBACK_BANKS,
  COMEBACK_BANK_IDS,
  STOP_ALERT_BANKS,
  bankIdFor,
  isComebackBank,
  pickComebackLine,
  pickStopLine,
  type BankId,
  type ComebackQueues,
  type LineQueues,
} from "./stopAlertLines"
import {
  DEEP_FROM_SECONDS,
  FLOW_FROM_SECONDS,
  GO_BACK_IN_LIMIT_SECONDS,
  MIN_SESSION_SECONDS,
  SOLID_FROM_SECONDS,
  canGoBackIn,
} from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the stop alert lines, of the comeback lines (shown after GO BACK IN) and of the choice of one line of each kind. Run them with: npm test
// The edges of the banks that are cut-offs of the timer are imported here, not written again, see CONNECTIONS.md C41. If a cut-off is changed, the tests of the numbers and words in the lines show which lines to read again.

// The first and the last second of every bank, from the edges (the bank from90 has no last second, 3 hours stands for it).
const EDGES: Record<BankId, readonly [number, number]> = {
  under1: [0, MIN_SESSION_SECONDS - 1],
  from1: [MIN_SESSION_SECONDS, 5 * 60 - 1],
  from5: [5 * 60, SOLID_FROM_SECONDS - 1],
  from10: [SOLID_FROM_SECONDS, 20 * 60 - 1],
  from20: [20 * 60, DEEP_FROM_SECONDS - 1],
  from30: [DEEP_FROM_SECONDS, GO_BACK_IN_LIMIT_SECONDS - 1],
  from45: [GO_BACK_IN_LIMIT_SECONDS, FLOW_FROM_SECONDS - 1],
  from90: [FLOW_FROM_SECONDS, 3 * 3600],
}

// Every line of both kinds, with the kind and the bank it sits in.
type Entry = { kind: "stop" | "comeback"; id: BankId; line: string; label: string }
const ALL: Entry[] = [
  ...BANK_IDS.flatMap((id) =>
    STOP_ALERT_BANKS[id].map((line): Entry => ({ kind: "stop", id, line, label: "stop " + id + ": " + line })),
  ),
  ...COMEBACK_BANK_IDS.flatMap((id) =>
    COMEBACK_BANKS[id].map((line): Entry => ({ kind: "comeback", id, line, label: "comeback " + id + ": " + line })),
  ),
]

// A small fixed series of "random" numbers, so that a test can be repeated exactly.
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

describe("which bank a session gets", () => {
  it("changes at 60 seconds, 5, 10, 20, 30, 45 and 90 minutes, to the second", () => {
    const at: [number, BankId][] = [
      [0, "under1"],
      [59, "under1"],
      [60, "from1"],
      [299, "from1"],
      [300, "from5"],
      [599, "from5"],
      [600, "from10"],
      [1199, "from10"],
      [1200, "from20"],
      [1799, "from20"],
      [1800, "from30"],
      [2699, "from30"],
      [2700, "from45"],
      [5399, "from45"],
      [5400, "from90"],
      [99999, "from90"],
    ]
    for (const [seconds, bank] of at) expect(bankIdFor(seconds), String(seconds)).toBe(bank)
  })

  it("follows the cut-offs of the timer: 60 seconds is saved, 10 and 30 minutes are the quality steps, 45 minutes ends GO BACK IN, 90 minutes is flow", () => {
    expect(bankIdFor(MIN_SESSION_SECONDS - 1)).toBe("under1")
    expect(bankIdFor(MIN_SESSION_SECONDS)).toBe("from1")
    expect(bankIdFor(SOLID_FROM_SECONDS)).toBe("from10")
    expect(bankIdFor(DEEP_FROM_SECONDS)).toBe("from30")
    expect(bankIdFor(GO_BACK_IN_LIMIT_SECONDS - 1)).toBe("from30")
    expect(bankIdFor(GO_BACK_IN_LIMIT_SECONDS)).toBe("from45")
    expect(bankIdFor(FLOW_FROM_SECONDS - 1)).toBe("from45")
    expect(bankIdFor(FLOW_FROM_SECONDS)).toBe("from90")
  })

  it("gives the bank under1 to anything that is not a finite number above 0", () => {
    expect(bankIdFor(Number.NaN)).toBe("under1")
    expect(bankIdFor(-5)).toBe("under1")
    expect(bankIdFor(Number.POSITIVE_INFINITY)).toBe("under1")
  })

  it("gives the same bank to every second between the edges of the bank, and the edges are the ones of this test file", () => {
    for (const id of BANK_IDS) {
      const [first, last] = EDGES[id]
      expect(bankIdFor(first), id + " first").toBe(id)
      expect(bankIdFor(last), id + " last").toBe(id)
      expect(bankIdFor(Math.floor((first + last) / 2)), id + " middle").toBe(id)
    }
  })

  it("is exactly the banks without GO BACK IN: the banks from45 and from90 are the sessions that cannot go back in", () => {
    for (let s = 0; s <= 6000; s++) {
      const bank = bankIdFor(s)
      expect(canGoBackIn(s), String(s)).toBe(bank !== "from45" && bank !== "from90")
      expect(isComebackBank(bank), String(s)).toBe(canGoBackIn(s))
    }
  })
})

describe("the banks", () => {
  it("are the eight banks of the stop alert, in the order of the sessions, and each has at least 20 lines that are not empty and not the same twice", () => {
    expect([...BANK_IDS]).toEqual(["under1", "from1", "from5", "from10", "from20", "from30", "from45", "from90"])
    expect(Object.keys(STOP_ALERT_BANKS).sort()).toEqual([...BANK_IDS].sort())
    for (const id of BANK_IDS) {
      const lines = STOP_ALERT_BANKS[id]
      expect(lines.length, id).toBeGreaterThanOrEqual(20)
      expect(new Set(lines).size, id).toBe(lines.length)
      for (const line of lines) expect(line.trim().length, id).toBeGreaterThan(10)
    }
  })

  it("are six banks of comeback lines, in the order of the sessions, and each has at least 20 lines that are not empty and not the same twice", () => {
    expect([...COMEBACK_BANK_IDS]).toEqual(["under1", "from1", "from5", "from10", "from20", "from30"])
    expect(Object.keys(COMEBACK_BANKS).sort()).toEqual([...COMEBACK_BANK_IDS].sort())
    for (const id of COMEBACK_BANK_IDS) {
      const lines = COMEBACK_BANKS[id]
      expect(lines.length, id).toBeGreaterThanOrEqual(20)
      expect(new Set(lines).size, id).toBe(lines.length)
      for (const line of lines) expect(line.trim().length, id).toBeGreaterThan(10)
    }
  })

  it("have no line twice across the two kinds in the same bank, and no line that is only the other kind of line again", () => {
    for (const id of COMEBACK_BANK_IDS) {
      const stop = new Set(STOP_ALERT_BANKS[id])
      for (const line of COMEBACK_BANKS[id]) expect(stop.has(line), id + ": " + line).toBe(false)
    }
  })

  it("have no line with a double quote, a backtick or a backslash (the lines are written between double quotes in the code), and no character that is not on a plain keyboard (no curly quotes, no long dashes)", () => {
    for (const { label, line } of ALL) {
      expect(line, label).not.toMatch(/["`\\]/)
      expect(line, label).toMatch(/^[\x20-\x7e]+$/)
    }
  })
})

describe("the marks in the lines", () => {
  it("use only the six known effect names, and every mark and every slot is closed", () => {
    for (const { label, line } of ALL) {
      for (const m of line.matchAll(/\[([^\]:]*):/g)) expect((EFFECTS as readonly string[]).includes(m[1]), label).toBe(true)
      expect((line.match(/\[/g) ?? []).length, label).toBe((line.match(/\]/g) ?? []).length)
      expect((line.match(/\{/g) ?? []).length, label).toBe((line.match(/\}/g) ?? []).length)
    }
  })

  it("give every line one to three marked keywords", () => {
    for (const { label, line } of ALL) {
      const marked = parseMarkup(line).filter((f) => f.effect !== null).length
      expect(marked, label).toBeGreaterThanOrEqual(1)
      expect(marked, label).toBeLessThanOrEqual(3)
    }
  })

  it("leave no slot and no bracket in the text when the slots are filled, at the first and at the last second of the bank", () => {
    for (const { label, id, line } of ALL) {
      for (const seconds of EDGES[id]) {
        const text = plainText(fillSlots(line, seconds))
        expect(text, label + " at " + seconds).not.toMatch(/[{}[\]]/)
      }
    }
  })

  it("never say 0 minutes or 1 minutes (the unit must agree with the number) when the slots are filled, at the edges of every bank", () => {
    for (const { label, id, line } of ALL) {
      for (const seconds of EDGES[id]) {
        const text = plainText(fillSlots(line, seconds))
        expect(text, label + " at " + seconds).not.toMatch(/\b1 minutes\b/)
        if (id !== "under1") expect(text, label + " at " + seconds).not.toMatch(/\b0 minutes\b/)
      }
    }
  })

  it("use {left} only in the banks of sessions shorter than 45 minutes, and no slot at all in the bank of sessions that were not saved", () => {
    for (const { label, id, line } of ALL) {
      if (id === "from45" || id === "from90" || id === "under1") expect(line, label).not.toContain("{left}")
      if (id === "under1") expect(line, label).not.toMatch(/\{(n|time)\}/)
    }
  })
})

describe("the numbers and words written in the lines", () => {
  // A number written in a line is a cut-off of the timer and is true for the bank it sits in: 10 minutes (the first quality step) in the bank from5, 45 minutes (the end of GO BACK IN) in the banks from20 and from30. The numbers come from the imported cut-offs, so if a cut-off is changed this test names the lines to read again (C41).
  const ALLOWED: Partial<Record<BankId, string[]>> = {
    from5: [String(SOLID_FROM_SECONDS / 60)],
    from20: [String(GO_BACK_IN_LIMIT_SECONDS / 60)],
    from30: [String(GO_BACK_IN_LIMIT_SECONDS / 60)],
  }

  it("allow a number only where it is a cut-off that is true for the bank", () => {
    for (const { label, id, line } of ALL) {
      for (const m of plainText(line).matchAll(/\d+/g)) expect(ALLOWED[id] ?? [], label).toContain(m[0])
    }
  })

  it("allow the words sixty and ten only where they are the next cut-off: sixty seconds in the bank under1 (not saved yet), ten minutes in the bank from5 (the first colour step is next), and no other number written as a word", () => {
    for (const { label, id, line } of ALL) {
      const text = plainText(line)
      if (id !== "under1") expect(text, label).not.toMatch(/\bsixty\b/i)
      if (id !== "from5") expect(text, label).not.toMatch(/\bten\b/i)
      expect(text, label).not.toMatch(/\b(twenty|thirty|forty|fifty|ninety|hundred|hours?)\b/i)
    }
  })

  it("say flow only from 90 minutes (the flow of the timer starts there), and not solid or deep, which are quality words of the timer with other cut-offs", () => {
    for (const { label, id, line } of ALL) {
      const text = plainText(line)
      if (id !== "from90") expect(text, label).not.toMatch(/\bflow\b/i)
      expect(text, label).not.toMatch(/\b(solid|deep)\b/i)
    }
  })

  it("never say what the app cannot know or what is false for a saved session: the time of day, earlier sessions, unbroken, zero, counted for nothing, and milestone (the name of the messages of MILESTONE_MINUTES, which are at other minutes)", () => {
    const banned = [
      "unbroken",
      "morning",
      "lunch",
      "afternoon",
      "evening",
      "first real session",
      "one session",
      "two more",
      "zero",
      "counted for nothing",
      "counts as zero",
      "nothing got done",
      "milestone",
    ]
    for (const { label, line } of ALL) {
      const text = plainText(line).toLowerCase()
      for (const phrase of banned) expect(text, label).not.toContain(phrase)
    }
  })

  it("never tell a session that cannot go back in to go back in (the banks from45 and from90 have no GO BACK IN button)", () => {
    for (const id of ["from45", "from90"] as const) {
      for (const line of STOP_ALERT_BANKS[id]) expect(plainText(line), id + ": " + line).not.toMatch(/\bback in\b/i)
    }
  })
})

describe("the claims about the ball and the rays", () => {
  // The ball and the rays of light change with the seconds of the session (ballStep of ballLook.ts, bgLight of backgroundLook.ts). A line that says something about them must be true for EVERY second of its bank. The minutes are not copied here: the claims ask the two functions.
  const LAST_SECOND = 3 * 3600
  const LAST_STEP = ballStep(LAST_SECOND)
  let firstColourAt = Number.POSITIVE_INFINITY
  for (let s = 0; s <= LAST_SECOND && firstColourAt === Number.POSITIVE_INFINITY; s++) if (ballStep(s) > 0) firstColourAt = s

  type Claim = { what: string; applies: (text: string) => boolean; holds: (seconds: number) => boolean }
  const CLAIMS: Claim[] = [
    { what: "the ball is white", applies: (t) => /\bwhite\b/i.test(t), holds: (s) => ballStep(s) === 0 },
    {
      what: "the first colour is still to come",
      applies: (t) => /turn colour|takes its first colour|colour starts at|is the first colour|request: colour/i.test(t),
      holds: (s) => ballStep(s) === 0,
    },
    {
      what: "the first colour comes at ten minutes",
      applies: (t) => /\b(ten|10) minutes\b/i.test(t) && /\bcolour\b/i.test(t),
      holds: () => firstColourAt === 10 * 60,
    },
    { what: "the ball has a colour already", applies: (t) => /found its colour|kept its colour/i.test(t), holds: (s) => ballStep(s) >= 1 },
    {
      what: "the ball has changed colour once",
      applies: (t) => /changed colour once|one colour in and wants another|one colour behind it/i.test(t),
      holds: (s) => ballStep(s) === 1,
    },
    { what: "the ball has changed colour twice", applies: (t) => /changed colour twice/i.test(t), holds: (s) => ballStep(s) === 2 },
    { what: "the ball has changed colour three times", applies: (t) => /colour three times/i.test(t), holds: (s) => ballStep(s) === 3 },
    {
      what: "one colour is behind the ball and two are ahead",
      applies: (t) => /one colour behind it and two ahead/i.test(t),
      holds: (s) => ballStep(s) === 1 && LAST_STEP - ballStep(s) === 2,
    },
    { what: "the rays are at full strength", applies: (t) => /\brays\b.*\bfull strength\b/i.test(t), holds: (s) => bgLight(s) === 1 },
  ]

  function secondsOf(id: BankId): number[] {
    const [first, last] = EDGES[id]
    return Array.from({ length: last - first + 1 }, (_, i) => first + i)
  }

  it("are checked against a ball that is white before the first colour step and has a colour from then on, and rays that are at full light from 90 minutes", () => {
    expect(ballStep(0)).toBe(0)
    expect(firstColourAt).toBeGreaterThan(0)
    expect(firstColourAt).toBeLessThan(Number.POSITIVE_INFINITY)
    expect(LAST_STEP).toBe(3)
    let never_back = true
    let previous = 0
    for (let s = 0; s <= LAST_SECOND; s++) {
      const step = ballStep(s)
      if (step < previous) never_back = false
      previous = step
      if (s < firstColourAt) expect(step, String(s)).toBe(0)
    }
    expect(never_back).toBe(true)
    expect(bgLight(FLOW_FROM_SECONDS - 1)).toBeLessThan(1)
    expect(bgLight(FLOW_FROM_SECONDS)).toBe(1)
    expect(bgLight(LAST_SECOND)).toBe(1)
  })

  it("hold for every second of the bank that the line sits in", () => {
    for (const { label, id, line } of ALL) {
      const text = plainText(line)
      for (const claim of CLAIMS) {
        if (!claim.applies(text)) continue
        for (const s of secondsOf(id)) {
          if (!claim.holds(s)) throw new Error('Not true at second ' + s + ' ("' + claim.what + '"): ' + label)
        }
      }
    }
  })

  it("leave no line about the ball or the rays without a claim that is checked (a line that only says the ball is glowing is the one exception)", () => {
    for (const { label, line } of ALL) {
      const text = plainText(line)
      if (!/\b(ball|rays?)\b/i.test(text)) continue
      const checked = CLAIMS.some((claim) => claim.applies(text))
      expect(checked || /\bglowing\b/i.test(text), label).toBe(true)
    }
  })

  it("use every claim of this table in at least one line, so that a claim that stopped matching is noticed", () => {
    for (const claim of CLAIMS) {
      expect(
        ALL.some(({ line }) => claim.applies(plainText(line))),
        claim.what,
      ).toBe(true)
    }
  })
})

describe("pickStopLine", () => {
  it("picks a line of the bank of the session, with its slots filled and its effect marks still in it", () => {
    const picked = pickStopLine(38 * 60, {}, seeded(1))
    expect(picked.bank).toBe("from30")
    expect(STOP_ALERT_BANKS.from30[picked.index]).toBeDefined()
    expect(picked.line).toBe(fillSlots(STOP_ALERT_BANKS.from30[picked.index], 38 * 60))
    expect(picked.line).not.toMatch(/[{}]/)
  })

  it("shows every line of a bank once before any line comes twice, and the queue of the bank is then empty", () => {
    const size = STOP_ALERT_BANKS.from10.length
    let queues: LineQueues = {}
    const seen: number[] = []
    const random = seeded(7)
    for (let i = 0; i < size; i++) {
      const picked = pickStopLine(12 * 60, queues, random)
      seen.push(picked.index)
      queues = picked.queues
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i))
    expect(queues.from10?.rest).toEqual([])
  })

  it("never starts a new round with the line that ended the old round, for many different series of random numbers", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const size = STOP_ALERT_BANKS.from45.length
      const random = seeded(seed)
      let queues: LineQueues = {}
      let previous = -1
      for (let i = 0; i < size * 4; i++) {
        const picked = pickStopLine(50 * 60, queues, random)
        expect(picked.index, "seed " + seed + " pick " + i).not.toBe(previous)
        previous = picked.index
        queues = picked.queues
      }
    }
  })

  it("keeps a queue for each bank, so a session of another length does not use up the lines of the first", () => {
    const first = pickStopLine(12 * 60, {}, seeded(3))
    const other = pickStopLine(50 * 60, first.queues, seeded(4))
    expect(other.queues.from10).toEqual(first.queues.from10)
    expect(other.queues.from45?.last).toBe(other.index)
    expect(other.bank).toBe("from45")
  })

  it("does not change the queues that come in", () => {
    const queues: LineQueues = { from5: { rest: [2, 0, 1], last: 3 } }
    const copy = JSON.parse(JSON.stringify(queues))
    const picked = pickStopLine(6 * 60, queues, seeded(5))
    expect(queues).toEqual(copy)
    expect(picked.index).toBe(1)
    expect(picked.queues.from5).toEqual({ rest: [2, 0], last: 1 })
  })

  it("works with a random number of exactly 0 and of just under 1, and with the default random number", () => {
    for (const value of [0, 0.999999999]) {
      let queues: LineQueues = {}
      const size = STOP_ALERT_BANKS.under1.length
      const seen = new Set<number>()
      for (let i = 0; i < size; i++) {
        const picked = pickStopLine(10, queues, () => value)
        seen.add(picked.index)
        queues = picked.queues
      }
      expect(seen.size).toBe(size)
    }
    expect(typeof pickStopLine(130 * 60, {}).line).toBe("string")
  })
})

describe("the comeback lines", () => {
  it("gives null for a session that cannot go back in, and gives a line for every session that can, second by second up to 100 minutes", () => {
    for (let s = 0; s <= 6000; s++) {
      const picked = pickComebackLine(s, {}, seeded(s + 1))
      if (canGoBackIn(s)) {
        expect(picked, String(s)).not.toBeNull()
        expect(picked?.bank, String(s)).toBe(bankIdFor(s))
      } else {
        expect(picked, String(s)).toBeNull()
      }
    }
  })

  it("picks a line of the bank the session had when it was stopped, with its slots filled and its effect marks still in it", () => {
    const picked = pickComebackLine(38 * 60, {}, seeded(1))
    expect(picked).not.toBeNull()
    if (picked === null) return
    expect(picked.bank).toBe("from30")
    expect(COMEBACK_BANKS.from30[picked.index]).toBeDefined()
    expect(picked.line).toBe(fillSlots(COMEBACK_BANKS.from30[picked.index], 38 * 60))
    expect(picked.line).not.toMatch(/[{}]/)
  })

  it("shows every comeback line of a bank once before any line comes twice, and the queue of the bank is then empty", () => {
    const size = COMEBACK_BANKS.from20.length
    let queues: ComebackQueues = {}
    const seen: number[] = []
    const random = seeded(11)
    for (let i = 0; i < size; i++) {
      const picked = pickComebackLine(25 * 60, queues, random)
      expect(picked).not.toBeNull()
      if (picked === null) return
      seen.push(picked.index)
      queues = picked.queues
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i))
    expect(queues.from20?.rest).toEqual([])
  })

  it("never starts a new round with the line that ended the old round, for many different series of random numbers", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const size = COMEBACK_BANKS.from5.length
      const random = seeded(seed)
      let queues: ComebackQueues = {}
      let previous = -1
      for (let i = 0; i < size * 4; i++) {
        const picked = pickComebackLine(7 * 60, queues, random)
        if (picked === null) throw new Error("no comeback line at 7 minutes")
        expect(picked.index, "seed " + seed + " pick " + i).not.toBe(previous)
        previous = picked.index
        queues = picked.queues
      }
    }
  })

  it("does not change the queues that come in, and keeps a queue for each bank", () => {
    const queues: ComebackQueues = { from5: { rest: [2, 0, 1], last: 3 } }
    const copy = JSON.parse(JSON.stringify(queues))
    const picked = pickComebackLine(6 * 60, queues, seeded(5))
    expect(queues).toEqual(copy)
    expect(picked?.index).toBe(1)
    expect(picked?.queues.from5).toEqual({ rest: [2, 0], last: 1 })
    const other = pickComebackLine(35 * 60, picked?.queues ?? {}, seeded(6))
    expect(other?.queues.from5).toEqual({ rest: [2, 0], last: 1 })
    expect(other?.queues.from30?.last).toBe(other?.index)
  })

  it("uses queues of its own: a stop alert line and a comeback line of the same bank do not use up each other's lines", () => {
    const stop = pickStopLine(12 * 60, {}, seeded(8))
    const comeback = pickComebackLine(12 * 60, {}, seeded(9))
    expect(stop.queues.from10?.rest.length).toBe(STOP_ALERT_BANKS.from10.length - 1)
    expect(comeback?.queues.from10?.rest.length).toBe(COMEBACK_BANKS.from10.length - 1)
  })
})
// AB:TIMER.TESTS:END
