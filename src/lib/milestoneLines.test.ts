import { describe, expect, it } from "vitest"
import { BG_LIGHT_FULL_AT_SECONDS, BG_LIGHT_START, bgLight } from "./backgroundLook"
import { ballStep } from "./ballLook"
import { EFFECTS, parseMarkup, plainText } from "./lineMarkup"
import {
  MILESTONE_BANKS,
  MILESTONE_FADE_MS,
  MILESTONE_SHOW_MS,
  isMilestoneMinute,
  milestonePool,
  pickMilestoneLine,
  type MilestoneMinute,
  type MilestoneQueues,
} from "./milestoneLines"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, MAX_LIVE_STEP_SECONDS, MILESTONE_MINUTES } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the milestone lines and of the choice of one line. Run them with: npm test
// The minutes come from MILESTONE_MINUTES of timerMaths.ts and the cut-offs of the ball and the rays from the timer files, never written again here, see CONNECTIONS.md C50. If one of them is changed, the tests of the numbers and of the lines about the ball and the rays show which lines to read again.

type Entry = { minute: MilestoneMinute; kind: "general" | "ball" | "rays"; line: string; label: string }
const ENTRIES: Entry[] = MILESTONE_MINUTES.flatMap((minute) => {
  const bank = MILESTONE_BANKS[minute]
  return [
    ...bank.lines.map((line, i): Entry => ({ minute, kind: "general", line, label: minute + " general " + (i + 1) + ": " + line })),
    { minute, kind: "ball", line: bank.ballLine, label: minute + " ball: " + bank.ballLine },
    { minute, kind: "rays", line: bank.raysLine, label: minute + " rays: " + bank.raysLine },
  ]
})

// A small fixed series of "random" numbers, so that a test can be repeated exactly.
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

const BOTH = { ball: true, rays: true } as const
const NEITHER = { ball: false, rays: false } as const

describe("the banks", () => {
  it("are one bank for every milestone of the timer, in the order of the milestones", () => {
    expect(Object.keys(MILESTONE_BANKS).map(Number)).toEqual([...MILESTONE_MINUTES])
    expect([...MILESTONE_MINUTES]).toEqual([15, 25, 45, 60, 90, 120, 150, 180])
  })

  it("have 34 general lines, one line about the ball and one line about the rays in every bank, 288 lines in all, and no line twice", () => {
    for (const minute of MILESTONE_MINUTES) {
      expect(MILESTONE_BANKS[minute].lines.length, String(minute)).toBe(34)
      expect(MILESTONE_BANKS[minute].ballLine.length, String(minute)).toBeGreaterThan(0)
      expect(MILESTONE_BANKS[minute].raysLine.length, String(minute)).toBeGreaterThan(0)
    }
    expect(ENTRIES.length).toBe(288)
    expect(new Set(ENTRIES.map((e) => e.line.trim().toLowerCase())).size).toBe(288)
  })

  it("use only plain keyboard characters, and no double quote, backtick or backslash (the lines are written between double quotes in the code)", () => {
    for (const { label, line } of ENTRIES) {
      expect(line, label).toMatch(/^[\x20-\x7e]+$/)
      expect(line, label).not.toMatch(/["`\\]/)
      expect(line, label).toBe(line.trim())
    }
  })

  it("are short enough to be read in the time the message stays: no line is longer than 125 characters", () => {
    for (const { label, line } of ENTRIES) expect(plainText(line).length, label).toBeLessThanOrEqual(125)
  })
})

describe("the marks in the lines", () => {
  it("use only the six known effect names, every mark is closed and there is no slot (a milestone is at an exact minute, so the line writes its number out)", () => {
    for (const { label, line } of ENTRIES) {
      for (const m of line.matchAll(/\[([^\]:]*):/g)) expect((EFFECTS as readonly string[]).includes(m[1]), label).toBe(true)
      expect((line.match(/\[/g) ?? []).length, label).toBe((line.match(/\]/g) ?? []).length)
      expect(line, label).not.toMatch(/[{}]/)
      expect(plainText(line), label).not.toMatch(/[[\]]/)
    }
  })

  it("give every line one to three marked keywords", () => {
    for (const { label, line } of ENTRIES) {
      const marked = parseMarkup(line).filter((f) => f.effect !== null).length
      expect(marked, label).toBeGreaterThanOrEqual(1)
      expect(marked, label).toBeLessThanOrEqual(3)
    }
  })
})

describe("the numbers and words written in the lines", () => {
  // The numbers of a bank were each read against the milestone by the planner: 15 minutes and the 45 of a real session; 25 and the 20 that are left to 45; the 20 and 30 minutes around minute 25; minute 61, the minute after the hour; the 90 of the next colour step; the T20 of a cricket match (line 3 of the 180 bank) written with its digits. A line that uses a number that is not in the list of its bank fails here: read the line again and, if it is true, add the number to the list.
  const DIGITS: Record<MilestoneMinute, readonly string[]> = {
    15: ["15", "45"],
    25: ["20", "25", "30"],
    45: ["45"],
    60: ["15", "20", "30", "60", "61", "90"],
    90: ["90", "91"],
    120: ["30", "120"],
    150: ["15", "30", "150"],
    180: ["20", "90", "180"],
  }
  // The same for numbers written as words (only the words that say a number of minutes, hours or things: ten, fifteen, twenty, thirty, forty, fifty, sixty, ninety, hundred, two to five, half, quarter, third, hour and hours).
  const WORDS: Record<MilestoneMinute, readonly string[]> = {
    15: ["fifteen", "four", "half", "hour", "quarter", "third"],
    25: ["fifteen", "five", "half", "hour", "ten", "twenty", "two"],
    45: ["forty-five", "half", "two"],
    60: ["half", "hour", "hundred", "sixty", "three"],
    90: ["half", "hour", "hours", "ninety", "thirty", "two"],
    120: ["five", "hour", "hours", "thirty", "two"],
    150: ["half", "hour", "hours", "two"],
    180: ["five", "four", "half", "hour", "hours", "three", "two"],
  }

  it("allow a number written in digits only where the list of its bank has it", () => {
    for (const { minute, label, line } of ENTRIES) {
      for (const m of plainText(line).matchAll(/\d+/g)) expect(DIGITS[minute], label).toContain(m[0])
    }
  })

  it("allow a number written as a word only where the list of its bank has it", () => {
    const claim = /\b(ten|fifteen|twenty|thirty|forty-five|forty|fifty|sixty|ninety|hundred|two|three|four|five|half|quarter|third|hours?)\b/gi
    for (const { minute, label, line } of ENTRIES) {
      for (const m of plainText(line).matchAll(claim)) expect(WORDS[minute], label).toContain(m[0].toLowerCase())
    }
  })

  it("say the number of its own milestone in the first line of every bank (the line that opens the message)", () => {
    const WRITTEN: Record<MilestoneMinute, RegExp> = {
      15: /\b(15|fifteen)\b/i,
      25: /\b25\b/,
      45: /\b45\b/,
      60: /\b(60|one hour)\b/i,
      90: /\b(90|ninety)\b/i,
      120: /\b(120|two hours)\b/i,
      150: /\b(150|two and a half hours)\b/i,
      180: /\b(180|three hours)\b/i,
    }
    for (const minute of MILESTONE_MINUTES) expect(plainText(MILESTONE_BANKS[minute].lines[0]), String(minute)).toMatch(WRITTEN[minute])
  })

  it("say flow only from 90 minutes (the flow of the timer starts there), and never solid or deep, which are quality words of the timer with other cut-offs", () => {
    for (const { minute, label, line } of ENTRIES) {
      const text = plainText(line)
      if (minute < FLOW_FROM_SECONDS / 60) expect(text, label).not.toMatch(/\bflow\b/i)
      expect(text, label).not.toMatch(/\b(solid|deep|meh)\b/i)
    }
  })

  it("never say what the app cannot know or what is false for a running session: the time of day, earlier sessions, unbroken, zero, what the person did or did not do, and milestone (the name of these messages)", () => {
    const banned = [
      "unbroken",
      "first real session",
      "one session",
      "two more",
      "zero",
      "counted for nothing",
      "nothing got done",
      "milestone",
      "you didn't",
      "you never",
      "you haven't",
      "you ignored",
    ]
    const timeOfDay = /\b(morning|evening|afternoon|tonight|night|noon|midnight|lunch|dinner|breakfast|dawn|sunrise|sunset|a\.m\.|p\.m\.)/i
    for (const { label, line } of ENTRIES) {
      const text = plainText(line).toLowerCase()
      for (const phrase of banned) expect(text, label).not.toContain(phrase)
      expect(text, label).not.toMatch(timeOfDay)
    }
  })
})

describe("the lines about the ball and the rays", () => {
  it("are only the line 35 and the line 36 of a bank: no general line talks about the ball or the rays (it would be false when they are not drawn)", () => {
    for (const { label, kind, line } of ENTRIES) {
      const text = plainText(line)
      if (kind === "general") expect(text, label).not.toMatch(/\b(ball|rays?)\b/i)
      if (kind === "ball") {
        expect(text, label).toMatch(/\bball\b/i)
        expect(text, label).not.toMatch(/\brays?\b/i)
      }
      if (kind === "rays") {
        expect(text, label).toMatch(/\brays\b/i)
        expect(text, label).not.toMatch(/\bball\b/i)
      }
    }
  })

  // The message is on the screen from the milestone second to the end of its fade, and it can start up to MAX_LIVE_STEP_SECONDS late (the hook announces a milestone that was crossed in a step of that size, see milestoneStep in timerMaths.ts). A claim must hold for all of those seconds.
  const WINDOW = MAX_LIVE_STEP_SECONDS + (MILESTONE_SHOW_MS + MILESTONE_FADE_MS) / 1000
  const near = (a: number, b: number, tolerance: number) => Math.abs(a - b) <= tolerance
  const minutesToFlow = (s: number) => (FLOW_FROM_SECONDS - s) / 60
  const minutesSinceFlow = (s: number) => (s - FLOW_FROM_SECONDS) / 60
  const minutesSinceFull = (s: number) => (s - BG_LIGHT_FULL_AT_SECONDS) / 60

  type Claim = { minute: MilestoneMinute; ball: RegExp; ballHolds: (s: number) => boolean; rays: RegExp; raysHolds: (s: number) => boolean }
  const CLAIMS: readonly Claim[] = [
    {
      minute: 15,
      ball: /changed colour once/i,
      ballHolds: (s) => ballStep(s) === 1,
      rays: /brighter than when you started.*still growing/i,
      raysHolds: (s) => bgLight(s) > BG_LIGHT_START && bgLight(s) < 1,
    },
    {
      minute: 25,
      ball: /five minutes until the ball changes colour again/i,
      ballHolds: (s) => ballStep(s) === 1 && near((DEEP_FROM_SECONDS - s) / 60, 5, 0.35),
      rays: /about half of their full light/i,
      raysHolds: (s) => near(bgLight(s), 0.5, 0.05) && bgLight(s) < 1,
    },
    {
      minute: 45,
      ball: /second colour, with one change left, 45 minutes away/i,
      ballHolds: (s) => ballStep(s) === 2 && near(minutesToFlow(s), 45, 0.35),
      rays: /about two-thirds of the way to full light/i,
      raysHolds: (s) => near(bgLight(s), 2 / 3, 0.03),
    },
    {
      minute: 60,
      ball: /one colour change left for the ball, 30 minutes away/i,
      ballHolds: (s) => ballStep(s) === 2 && near(minutesToFlow(s), 30, 0.35),
      rays: /about three-quarters of the way to full light. Another half hour/i,
      raysHolds: (s) => near(bgLight(s), 0.75, 0.03) && near((BG_LIGHT_FULL_AT_SECONDS - s) / 60, 30, 0.35),
    },
    {
      minute: 90,
      ball: /just took its last colour/i,
      ballHolds: (s) => ballStep(s) === 3 && minutesSinceFlow(s) < 0.35,
      rays: /reached full strength/i,
      raysHolds: (s) => bgLight(s) === 1 && minutesSinceFull(s) < 0.35,
    },
    {
      minute: 120,
      ball: /held its last colour for 30 minutes/i,
      ballHolds: (s) => ballStep(s) === 3 && near(minutesSinceFlow(s), 30, 0.35),
      rays: /at full strength for 30 minutes/i,
      raysHolds: (s) => bgLight(s) === 1 && near(minutesSinceFull(s), 30, 0.35),
    },
    {
      minute: 150,
      ball: /held its last colour for an hour/i,
      ballHolds: (s) => ballStep(s) === 3 && near(minutesSinceFlow(s), 60, 0.35),
      rays: /at full strength for an hour/i,
      raysHolds: (s) => bgLight(s) === 1 && near(minutesSinceFull(s), 60, 0.35),
    },
    {
      minute: 180,
      ball: /held its last colour for 90 minutes/i,
      ballHolds: (s) => ballStep(s) === 3 && near(minutesSinceFlow(s), 90, 0.35),
      rays: /at full strength for 90 minutes/i,
      raysHolds: (s) => bgLight(s) === 1 && near(minutesSinceFull(s), 90, 0.35),
    },
  ]

  it("have a claim that is checked in every bank (the table has one row for every milestone)", () => {
    expect(CLAIMS.map((c) => c.minute)).toEqual([...MILESTONE_MINUTES])
  })

  it("say what the table says: the words of the line match the claim that is checked", () => {
    for (const c of CLAIMS) {
      expect(plainText(MILESTONE_BANKS[c.minute].ballLine), c.minute + " ball").toMatch(c.ball)
      expect(plainText(MILESTONE_BANKS[c.minute].raysLine), c.minute + " rays").toMatch(c.rays)
    }
  })

  it("are true for every second the message can be on the screen, asked from the real functions ballStep and bgLight", () => {
    for (const c of CLAIMS) {
      for (let extra = 0; extra <= WINDOW; extra++) {
        const s = c.minute * 60 + extra
        expect(c.ballHolds(s), c.minute + " ball at " + s).toBe(true)
        expect(c.raysHolds(s), c.minute + " rays at " + s).toBe(true)
      }
    }
  })
})

describe("milestonePool", () => {
  it("is the 34 general lines, then the ball line when the ball is drawn, then the rays line when the rays are drawn", () => {
    for (const minute of MILESTONE_MINUTES) {
      const bank = MILESTONE_BANKS[minute]
      expect(milestonePool(minute, NEITHER)).toEqual(bank.lines)
      expect(milestonePool(minute, { ball: true, rays: false })).toEqual([...bank.lines, bank.ballLine])
      expect(milestonePool(minute, { ball: false, rays: true })).toEqual([...bank.lines, bank.raysLine])
      expect(milestonePool(minute, BOTH)).toEqual([...bank.lines, bank.ballLine, bank.raysLine])
    }
  })
})

describe("pickMilestoneLine", () => {
  it("knows the eight milestones and gives null for any other number", () => {
    for (const minute of MILESTONE_MINUTES) expect(isMilestoneMinute(minute), String(minute)).toBe(true)
    for (const other of [0, 1, 10, 16, 30, 59, 61, 91, 181, 360, -15, 15.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(isMilestoneMinute(other), String(other)).toBe(false)
      expect(pickMilestoneLine(other, BOTH, {}), String(other)).toBeNull()
    }
  })

  it("gives a line of the pool of that milestone, with its marks still in it", () => {
    for (const minute of MILESTONE_MINUTES) {
      const picked = pickMilestoneLine(minute, BOTH, {}, seeded(minute))
      expect(picked, String(minute)).not.toBeNull()
      expect(picked?.minute).toBe(minute)
      expect(milestonePool(minute, BOTH)[picked?.index ?? -1]).toBe(picked?.line)
      expect(picked?.line).toMatch(/\[[a-z]+:/)
    }
  })

  it("shows every line of the pool once before any line comes twice, for 34, 35 and 36 lines", () => {
    for (const visuals of [NEITHER, { ball: true, rays: false }, { ball: false, rays: true }, BOTH]) {
      const size = milestonePool(60, visuals).length
      let queues: MilestoneQueues = {}
      const random = seeded(7)
      for (let round = 0; round < 3; round++) {
        const seen = new Set<string>()
        for (let i = 0; i < size; i++) {
          const picked = pickMilestoneLine(60, visuals, queues, random)
          expect(picked).not.toBeNull()
          if (picked === null) return
          expect(seen.has(picked.line), "round " + round + " pick " + i).toBe(false)
          seen.add(picked.line)
          queues = picked.queues
        }
        expect(seen.size).toBe(size)
      }
    }
  })

  it("never takes the ball line when the ball is not drawn, and never the rays line when the rays are not drawn", () => {
    const bank = MILESTONE_BANKS[90]
    const random = seeded(3)
    let queues: MilestoneQueues = {}
    for (let i = 0; i < 100; i++) {
      const picked = pickMilestoneLine(90, { ball: false, rays: true }, queues, random)
      if (picked === null) return
      expect(picked.line).not.toBe(bank.ballLine)
      queues = picked.queues
    }
    queues = {}
    for (let i = 0; i < 100; i++) {
      const picked = pickMilestoneLine(90, { ball: true, rays: false }, queues, random)
      if (picked === null) return
      expect(picked.line).not.toBe(bank.raysLine)
      queues = picked.queues
    }
    queues = {}
    for (let i = 0; i < 100; i++) {
      const picked = pickMilestoneLine(90, NEITHER, queues, random)
      if (picked === null) return
      expect([bank.ballLine, bank.raysLine]).not.toContain(picked.line)
      queues = picked.queues
    }
  })

  it("never starts a new round with the line that ended the old round", () => {
    let queues: MilestoneQueues = {}
    const random = seeded(11)
    let last = ""
    for (let i = 0; i < 34 * 6; i++) {
      const picked = pickMilestoneLine(25, NEITHER, queues, random)
      if (picked === null) return
      if (i > 0 && i % 34 === 0) expect(picked.line).not.toBe(last)
      last = picked.line
      queues = picked.queues
    }
  })

  it("keeps a queue of its own for every milestone and every set of drawn things, and does not change the queues that come in", () => {
    const first = pickMilestoneLine(15, BOTH, {}, seeded(5))
    expect(first).not.toBeNull()
    if (first === null) return
    const before = JSON.stringify(first.queues)
    const second = pickMilestoneLine(25, BOTH, first.queues, seeded(5))
    expect(JSON.stringify(first.queues)).toBe(before)
    expect(second).not.toBeNull()
    if (second === null) return
    expect(Object.keys(second.queues).sort()).toEqual(["15:br", "25:br"])
    const third = pickMilestoneLine(15, NEITHER, second.queues, seeded(5))
    expect(Object.keys(third?.queues ?? {}).sort()).toEqual(["15:--", "15:br", "25:br"])
  })

  it("gives the same lines for the same series of random numbers", () => {
    const run = () => {
      let queues: MilestoneQueues = {}
      const random = seeded(99)
      const out: string[] = []
      for (let i = 0; i < 40; i++) {
        const picked = pickMilestoneLine(120, BOTH, queues, random)
        if (picked === null) break
        out.push(picked.line)
        queues = picked.queues
      }
      return out
    }
    expect(run()).toEqual(run())
  })
})

describe("the times of the message", () => {
  it("are 6 seconds on the screen and half a second of fade, the same as the comeback message", () => {
    expect(MILESTONE_SHOW_MS).toBe(6000)
    expect(MILESTONE_FADE_MS).toBe(500)
  })
})
// AB:TIMER.TESTS:END
