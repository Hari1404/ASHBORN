import { describe, expect, it } from "vitest"
import { ITEM_NEEDS, REGION_NEEDS } from "../data/learn/needs"
import { TIER1_SUBJECTS } from "../data/learn/tier1"
import {
  DEFAULT_PACE_HOURS,
  LEARN_INDEX,
  NO_FACTS,
  PACE_PRESETS,
  SEED_GATE_MINUTES,
  SEED_ITEM_MINUTES,
  SOFT_DONE_MINUTES,
  addDays,
  buildLearnIndex,
  daysBetween,
  doneWarning,
  gateStatus,
  isDayText,
  itemBlockers,
  itemStatus,
  learnTimeTotals,
  needMet,
  needsOfItem,
  nextItem,
  regionBlockers,
  regionLateDays,
  regionLatestDay,
  regionMinutes,
  regionStatus,
  regionWindowDays,
  sourceSeconds,
  subjectProgress,
  unmetNeeds,
  type ItemFact,
  type LearnFacts,
  type LearnSessionUse,
  type RegionFact,
} from "./learnRules"

// These tests guard the RULES of DECISIONS_LEARN.md sections 9 and 10, on the real Tier 1 content. The seed minutes, the
// pace and the warning minutes are PLACEHOLDERS (safe to tune): the tests work them out from the constants, except the one
// test that is the worked example of 10c, which says so.

const S = "2026-11-01" // the day things were started
const E = "2026-11-02" // the day things were done

const done = (day = E): ItemFact => ({ startedDay: S, doneDay: day })
const started: ItemFact = { startedDay: S, doneDay: null }
const passed = (day: string, startedDay = S): RegionFact => ({ startedDay, gatePassedDay: day })
const running = (startedDay = S): RegionFact => ({ startedDay, gatePassedDay: null })

function facts(over: { done?: readonly string[]; started?: readonly string[]; regions?: Record<string, RegionFact> }): LearnFacts {
  const items: Record<string, ItemFact> = {}
  for (const id of over.done ?? []) items[id] = done()
  for (const id of over.started ?? []) items[id] = started
  return { items, regions: over.regions ?? {} }
}

const idsOf = (key: string): string[] => [...(LEARN_INDEX.regions.get(key)?.itemIds ?? [])]
const PYTHON_A_TO_F = ["python/A", "python/B", "python/C", "python/D", "python/E", "python/F"]
const allPassed = (keys: readonly string[]): Record<string, RegionFact> => Object.fromEntries(keys.map((k) => [k, passed(E)]))

describe("the index of the content", () => {
  it("knows every item and every region, in order", () => {
    expect(LEARN_INDEX.items.size).toBe(147)
    expect(LEARN_INDEX.regions.size).toBe(36)
    expect(LEARN_INDEX.itemOrder.get("python")).toHaveLength(44)
    expect(LEARN_INDEX.itemOrder.get("python")![0]).toBe("PY-1")
    expect(LEARN_INDEX.regionOrder.get("python")).toHaveLength(11)
    expect(LEARN_INDEX.regionOrder.get("python")![0]).toBe("python/A")
    expect(LEARN_INDEX.regionOrder.get("terminal")).toEqual(["terminal/TA", "terminal/TB"])
  })

  it("knows the place of an item in its subject and in its region", () => {
    const at = LEARN_INDEX.items.get("PY-6")!
    expect(at).toMatchObject({ subject: "python", regionKey: "python/B", order: 5, place: 0 })
    expect(LEARN_INDEX.items.get("PD-15")).toMatchObject({ regionKey: "pandas/PD-G", place: 7 })
  })

  it("throws for an id or a region key that is used twice", () => {
    const again = [...TIER1_SUBJECTS, TIER1_SUBJECTS[0]!]
    expect(() => buildLearnIndex(again, REGION_NEEDS, ITEM_NEEDS)).toThrow("region key used twice: python/A")
    const copy = JSON.parse(JSON.stringify(TIER1_SUBJECTS)) as { regions: { items: { id: string }[] }[] }[]
    copy[0]!.regions[1]!.items[0]!.id = "PY-1"
    expect(() => buildLearnIndex(copy as never, REGION_NEEDS, ITEM_NEEDS)).toThrow("item id used twice: PY-1")
  })

  it("throws for something that is not in the content", () => {
    expect(() => itemStatus(LEARN_INDEX, "XX-1", NO_FACTS)).toThrow("unknown item: XX-1")
    expect(() => regionStatus(LEARN_INDEX, "python/Z", NO_FACTS)).toThrow("unknown region: python/Z")
    expect(() => gateStatus(LEARN_INDEX, "python/Z", NO_FACTS)).toThrow("unknown region: python/Z")
  })
})

describe("days", () => {
  it("knows what a day is", () => {
    expect(isDayText("2026-11-26")).toBe(true)
    expect(isDayText("2028-02-29")).toBe(true)
    expect(isDayText("2027-02-29")).toBe(false)
    expect(isDayText("2026-13-01")).toBe(false)
    expect(isDayText("2026-1-5")).toBe(false)
    expect(isDayText("2026-11-26T10:00:00Z")).toBe(false)
    expect(isDayText(20261126)).toBe(false)
  })

  it("adds days over the end of a month and a year", () => {
    expect(addDays("2026-11-26", 5)).toBe("2026-12-01")
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02")
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28")
    expect(addDays("2026-11-26", 0)).toBe("2026-11-26")
  })

  it("counts the days between two days, negative when it goes back", () => {
    expect(daysBetween("2026-11-01", "2026-11-13")).toBe(12)
    expect(daysBetween("2026-11-13", "2026-11-01")).toBe(-12)
    expect(daysBetween("2026-10-31", "2026-11-01")).toBe(1)
    expect(daysBetween("2026-11-26", "2026-11-26")).toBe(0)
  })

  it("refuses text that is not a day", () => {
    expect(() => addDays("tomorrow", 1)).toThrow("not a day")
    expect(() => daysBetween("2026-11-01", "2026-02-30")).toThrow("not a day")
  })
})

describe("needs", () => {
  it("is met when the gate of a region is passed, or when an item is done", () => {
    const region = { target: { kind: "region" as const, key: "python/A" }, hard: true, why: "x" }
    const item = { target: { kind: "item" as const, id: "PY-24" }, hard: true, why: "x" }
    expect(needMet(region, NO_FACTS)).toBe(false)
    expect(needMet(region, facts({ regions: { "python/A": running() } }))).toBe(false)
    expect(needMet(region, facts({ regions: { "python/A": passed(E) } }))).toBe(true)
    expect(needMet(item, NO_FACTS)).toBe(false)
    expect(needMet(item, facts({ started: ["PY-24"] }))).toBe(false)
    expect(needMet(item, facts({ done: ["PY-24"] }))).toBe(true)
  })

  it("lists the needs that are not met yet, hard and soft, and drops the ones that are", () => {
    const needs = needsOfItem(LEARN_INDEX, "PB-4")
    expect(needs.map((n) => (n.target.kind === "region" ? n.target.key : n.target.id))).toEqual(["python/D", "python/E", "PY-35"])
    expect(unmetNeeds(needs, NO_FACTS)).toHaveLength(3)
    const some = facts({ done: ["PY-35"], regions: { "python/D": passed(E) } })
    expect(unmetNeeds(needs, some).map((n) => (n.target.kind === "region" ? n.target.key : n.target.id))).toEqual(["python/E"])
  })

  it("gives the needs of the region and then the needs of the item itself", () => {
    const needs = needsOfItem(LEARN_INDEX, "TM-7")
    expect(needs.map((n) => (n.target.kind === "region" ? n.target.key : n.target.id))).toEqual(["terminal/TA", "PY-1"])
  })
})

describe("the order inside a subject (9b)", () => {
  it("opens only the first item of the first region", () => {
    expect(itemStatus(LEARN_INDEX, "PY-1", NO_FACTS)).toBe("open")
    expect(itemStatus(LEARN_INDEX, "PY-2", NO_FACTS)).toBe("locked")
    expect(itemStatus(LEARN_INDEX, "PY-5", NO_FACTS)).toBe("locked")
    expect(itemStatus(LEARN_INDEX, "PY-6", NO_FACTS)).toBe("locked")
  })

  it("says what an item waits for: the item before it", () => {
    expect(itemBlockers(LEARN_INDEX, "PY-2", NO_FACTS)).toEqual({ beforeItem: "PY-1", beforeRegion: null, needs: [] })
    expect(itemBlockers(LEARN_INDEX, "PY-1", NO_FACTS)).toEqual({ beforeItem: null, beforeRegion: null, needs: [] })
  })

  it("opens the next item when the one before is done, not when it is only started", () => {
    expect(itemStatus(LEARN_INDEX, "PY-2", facts({ started: ["PY-1"] }))).toBe("locked")
    expect(itemStatus(LEARN_INDEX, "PY-2", facts({ done: ["PY-1"] }))).toBe("open")
    expect(itemStatus(LEARN_INDEX, "PY-1", facts({ started: ["PY-1"] }))).toBe("started")
    expect(itemStatus(LEARN_INDEX, "PY-1", facts({ done: ["PY-1"] }))).toBe("done")
  })

  it("keeps the first item of the next region locked until the GATE of the region before is passed", () => {
    const allDone = facts({ done: idsOf("python/A") })
    expect(itemStatus(LEARN_INDEX, "PY-6", allDone)).toBe("locked")
    expect(itemBlockers(LEARN_INDEX, "PY-6", allDone).beforeRegion).toBe("python/A")
    const gate = facts({ done: idsOf("python/A"), regions: { "python/A": passed(E) } })
    expect(itemStatus(LEARN_INDEX, "PY-6", gate)).toBe("open")
    expect(itemBlockers(LEARN_INDEX, "PY-6", gate)).toEqual({ beforeItem: null, beforeRegion: null, needs: [] })
  })

  it("keeps the first item of Git B locked until the gate of Git A is passed, though Git B has only a hint", () => {
    // Git B needs nothing HARD, so only the order holds it back: this is the case that tests the order rule by itself.
    const terminal = allPassed(["terminal/TA", "terminal/TB"])
    const allDoneNoGate = facts({ done: idsOf("git/A"), regions: terminal })
    expect(REGION_NEEDS["git/B"]!.every((n) => !n.hard)).toBe(true)
    expect(itemStatus(LEARN_INDEX, "GT-7", allDoneNoGate)).toBe("locked")
    expect(itemBlockers(LEARN_INDEX, "GT-7", allDoneNoGate)).toEqual({ beforeItem: null, beforeRegion: "git/A", needs: [] })
    expect(regionStatus(LEARN_INDEX, "git/B", allDoneNoGate)).toBe("locked")
    const gatePassed = facts({ done: idsOf("git/A"), regions: { ...terminal, "git/A": passed(E) } })
    expect(itemStatus(LEARN_INDEX, "GT-7", gatePassed)).toBe("open")
    expect(regionStatus(LEARN_INDEX, "git/B", gatePassed)).toBe("open")
  })

  it("does not let a started item hide the lock of the item after it", () => {
    expect(itemStatus(LEARN_INDEX, "PY-3", facts({ started: ["PY-3"] }))).toBe("started")
  })
})

describe("subjects do not wait for each other, except for the HARD needs (Q12)", () => {
  it("opens the first item of Python, the terminal, and linear algebra A and B from day one", () => {
    expect(itemStatus(LEARN_INDEX, "PY-1", NO_FACTS)).toBe("open")
    expect(itemStatus(LEARN_INDEX, "TM-1", NO_FACTS)).toBe("open")
    expect(itemStatus(LEARN_INDEX, "LA-1", NO_FACTS)).toBe("open")
  })

  it("locks NumPy until Python A to F and I have their gates passed", () => {
    expect(itemStatus(LEARN_INDEX, "NP-1", NO_FACTS)).toBe("locked")
    const b = itemBlockers(LEARN_INDEX, "NP-1", NO_FACTS)
    expect(b.beforeItem).toBeNull()
    expect(b.beforeRegion).toBeNull()
    expect(b.needs.map((n) => (n.target.kind === "region" ? n.target.key : n.target.id))).toEqual([...PYTHON_A_TO_F, "python/I"])
    const missingI = facts({ regions: allPassed(PYTHON_A_TO_F) })
    expect(itemStatus(LEARN_INDEX, "NP-1", missingI)).toBe("locked")
    expect(itemBlockers(LEARN_INDEX, "NP-1", missingI).needs.map((n) => (n.target.kind === "region" ? n.target.key : ""))).toEqual(["python/I"])
    const ready = facts({ regions: allPassed([...PYTHON_A_TO_F, "python/I"]) })
    expect(itemStatus(LEARN_INDEX, "NP-1", ready)).toBe("open")
  })

  it("locks Git until both terminal regions are passed", () => {
    expect(itemStatus(LEARN_INDEX, "GT-1", NO_FACTS)).toBe("locked")
    expect(itemStatus(LEARN_INDEX, "GT-1", facts({ regions: { "terminal/TA": passed(E) } }))).toBe("locked")
    expect(itemStatus(LEARN_INDEX, "GT-1", facts({ regions: allPassed(["terminal/TA", "terminal/TB"]) }))).toBe("open")
  })

  it("does NOT lock on a SOFT need: Git B hints at PY-1 and stays open without it", () => {
    const afterA = facts({ done: idsOf("git/A"), regions: { ...allPassed(["terminal/TA", "terminal/TB"]), "git/A": passed(E) } })
    expect(itemStatus(LEARN_INDEX, "GT-7", afterA)).toBe("open")
    expect(unmetNeeds(needsOfItem(LEARN_INDEX, "GT-7"), afterA)).toHaveLength(1)
    expect(regionBlockers(LEARN_INDEX, "git/B", afterA)).toEqual({ beforeRegion: null, needs: [] })
  })

  it("locks probability until Python D and E, but not on the soft math.comb need", () => {
    expect(itemStatus(LEARN_INDEX, "PB-1", NO_FACTS)).toBe("locked")
    const ready = facts({ done: ["PB-1", "PB-2", "PB-3"], regions: allPassed(["python/D", "python/E"]) })
    expect(itemStatus(LEARN_INDEX, "PB-1", ready)).toBe("done")
    expect(itemStatus(LEARN_INDEX, "PB-4", ready)).toBe("open")
    expect(unmetNeeds(needsOfItem(LEARN_INDEX, "PB-4"), ready).map((n) => (n.target.kind === "item" ? n.target.id : ""))).toEqual(["PY-35"])
  })

  it("locks linear algebra region C until NP-22 is done", () => {
    const upToB = { ...allPassed(["la/A", "la/B"]) }
    const itemsAB = [...idsOf("la/A"), ...idsOf("la/B")]
    expect(itemStatus(LEARN_INDEX, "LA-9", facts({ done: itemsAB, regions: upToB }))).toBe("locked")
    expect(itemBlockers(LEARN_INDEX, "LA-9", facts({ done: itemsAB, regions: upToB })).needs).toHaveLength(1)
    expect(itemStatus(LEARN_INDEX, "LA-9", facts({ done: [...itemsAB, "NP-22"], regions: upToB }))).toBe("open")
  })

  it("locks one item on a need of its own: TM-7 waits for PY-1", () => {
    const toTm6 = facts({ done: ["TM-1", "TM-2", "TM-3", "TM-4", "TM-5", "TM-6"], regions: { "terminal/TA": passed(E) } })
    expect(itemStatus(LEARN_INDEX, "TM-7", toTm6)).toBe("locked")
    expect(itemBlockers(LEARN_INDEX, "TM-7", toTm6)).toEqual({
      beforeItem: null,
      beforeRegion: null,
      needs: [expect.objectContaining({ target: { kind: "item", id: "PY-1" }, hard: true })],
    })
    const withPy = { ...toTm6, items: { ...toTm6.items, "PY-1": done() } }
    expect(itemStatus(LEARN_INDEX, "TM-7", withPy)).toBe("open")
  })

  it("keeps a started item started even when a need would lock it now (the fact stands)", () => {
    expect(itemStatus(LEARN_INDEX, "NP-1", facts({ started: ["NP-1"] }))).toBe("started")
  })
})

describe("the gate", () => {
  it("is locked until every item of the region is done, then open, then passed", () => {
    expect(gateStatus(LEARN_INDEX, "python/A", NO_FACTS)).toBe("locked")
    expect(gateStatus(LEARN_INDEX, "python/A", facts({ done: idsOf("python/A").slice(0, 4) }))).toBe("locked")
    expect(gateStatus(LEARN_INDEX, "python/A", facts({ done: idsOf("python/A") }))).toBe("open")
    expect(gateStatus(LEARN_INDEX, "python/A", facts({ done: idsOf("python/A"), regions: { "python/A": passed(E) } }))).toBe("passed")
  })
})

describe("the status of a region", () => {
  it("is open for the first region of Python and locked for the second", () => {
    expect(regionStatus(LEARN_INDEX, "python/A", NO_FACTS)).toBe("open")
    expect(regionStatus(LEARN_INDEX, "python/B", NO_FACTS)).toBe("locked")
    expect(regionBlockers(LEARN_INDEX, "python/B", NO_FACTS).beforeRegion).toBe("python/A")
  })

  it("is locked by a HARD need of another subject, and open once it is met", () => {
    expect(regionStatus(LEARN_INDEX, "numpy/NP-A", NO_FACTS)).toBe("locked")
    expect(regionStatus(LEARN_INDEX, "numpy/NP-A", facts({ regions: allPassed([...PYTHON_A_TO_F, "python/I"]) }))).toBe("open")
  })

  it("is running once an item or the region is started", () => {
    expect(regionStatus(LEARN_INDEX, "python/A", facts({ started: ["PY-1"] }))).toBe("running")
    expect(regionStatus(LEARN_INDEX, "python/A", facts({ regions: { "python/A": running() } }))).toBe("running")
  })

  it("is at the gate when every item is done and the gate is not passed", () => {
    expect(regionStatus(LEARN_INDEX, "python/A", facts({ done: idsOf("python/A"), regions: { "python/A": running() } }))).toBe("atGate")
  })

  it("is passed on time on the latest day, and passed late one day after (10c)", () => {
    const latest = regionLatestDay(LEARN_INDEX, "python/A", S)
    const base = { done: idsOf("python/A") }
    expect(regionStatus(LEARN_INDEX, "python/A", facts({ ...base, regions: { "python/A": passed(latest) } }))).toBe("passedOnTime")
    expect(regionStatus(LEARN_INDEX, "python/A", facts({ ...base, regions: { "python/A": passed(addDays(latest, 1)) } }))).toBe("passedLate")
    expect(regionStatus(LEARN_INDEX, "python/A", facts({ ...base, regions: { "python/A": passed(S) } }))).toBe("passedOnTime")
  })
})

describe("the next item and the progress of a subject", () => {
  it("starts at the first item and moves on with every item done", () => {
    expect(nextItem(LEARN_INDEX, "python", NO_FACTS)).toEqual({ id: "PY-1", status: "open" })
    expect(nextItem(LEARN_INDEX, "python", facts({ done: ["PY-1", "PY-2"] }))).toEqual({ id: "PY-3", status: "open" })
    expect(nextItem(LEARN_INDEX, "python", facts({ started: ["PY-1"] }))).toEqual({ id: "PY-1", status: "started" })
  })

  it("names a locked next item as locked", () => {
    expect(nextItem(LEARN_INDEX, "git", NO_FACTS)).toEqual({ id: "GT-1", status: "locked" })
  })

  it("has no next item when everything is done", () => {
    const every = facts({ done: LEARN_INDEX.itemOrder.get("terminal") as string[] })
    expect(nextItem(LEARN_INDEX, "terminal", every)).toBeNull()
  })

  it("counts done items of the total", () => {
    expect(subjectProgress(LEARN_INDEX, "python", NO_FACTS)).toEqual({ done: 0, total: 44, next: "PY-1" })
    expect(subjectProgress(LEARN_INDEX, "python", facts({ done: ["PY-1", "PY-2", "PY-3"], started: ["PY-4"] }))).toEqual({ done: 3, total: 44, next: "PY-4" })
    expect(subjectProgress(LEARN_INDEX, "terminal", facts({ done: LEARN_INDEX.itemOrder.get("terminal") as string[] }))).toEqual({ done: 7, total: 7, next: null })
  })
})

describe("the window of a region (10b, 10c)", () => {
  const items = (key: string) => idsOf(key).length
  const days = (minutes: number, pace: number) => Math.round((minutes / 60 / pace) * 7)

  it("is the minutes of its items and its gate, divided by the weekly pace", () => {
    for (const key of ["python/A", "pandas/PD-G", "numpy/NP-F", "git/A"]) {
      const n = items(key)
      expect(regionMinutes(LEARN_INDEX, key)).toEqual({
        low: n * SEED_ITEM_MINUTES.low + SEED_GATE_MINUTES.low,
        high: n * SEED_ITEM_MINUTES.high + SEED_GATE_MINUTES.high,
      })
      const m = regionMinutes(LEARN_INDEX, key)
      expect(regionWindowDays(LEARN_INDEX, key)).toEqual({ low: days(m.low, DEFAULT_PACE_HOURS), high: days(m.high, DEFAULT_PACE_HOURS) })
    }
  })

  it("is the worked example of 10c (PLACEHOLDER numbers: change this test with the placeholders)", () => {
    // Python A: 5 items, 210 to 510 minutes. Python A at 5 hours a week is about 5 to 12 days; 10 hours: 2 to 6; 20 hours: 1 to 3.
    expect(regionMinutes(LEARN_INDEX, "python/A")).toEqual({ low: 210, high: 510 })
    expect(regionWindowDays(LEARN_INDEX, "python/A")).toEqual({ low: 5, high: 12 })
    expect(regionWindowDays(LEARN_INDEX, "python/A", NO_FACTS, { pace: 10 })).toEqual({ low: 2, high: 6 })
    expect(regionWindowDays(LEARN_INDEX, "python/A", NO_FACTS, { pace: 20 })).toEqual({ low: 1, high: 3 })
    // The biggest region, pandas PD-G with 8 items: about 7 to 17 days at 5 hours a week.
    expect(regionWindowDays(LEARN_INDEX, "pandas/PD-G")).toEqual({ low: 7, high: 17 })
  })

  it("gets shorter with a faster pace and longer with a slower one", () => {
    const at = (pace: number) => regionWindowDays(LEARN_INDEX, "python/D", NO_FACTS, { pace }).high
    const highs = PACE_PRESETS.map(at)
    for (let i = 1; i < highs.length; i++) expect(highs[i]!).toBeLessThanOrEqual(highs[i - 1]!)
  })

  it("refuses a pace that is not a positive number", () => {
    for (const pace of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => regionWindowDays(LEARN_INDEX, "python/A", NO_FACTS, { pace })).toThrow("bad pace")
    }
  })

  it("narrows when an item is finished with real minutes: its seed is swapped for them", () => {
    const f = facts({ done: ["PY-1"] })
    const m = regionMinutes(LEARN_INDEX, "python/A", f, { firstPassMinutes: { "PY-1": 40 } })
    expect(m).toEqual({
      low: 40 + 4 * SEED_ITEM_MINUTES.low + SEED_GATE_MINUTES.low,
      high: 40 + 4 * SEED_ITEM_MINUTES.high + SEED_GATE_MINUTES.high,
    })
  })

  it("keeps the seed for an item with no time logged, an unfinished item, and a bad number", () => {
    const seeds = regionMinutes(LEARN_INDEX, "python/A")
    expect(regionMinutes(LEARN_INDEX, "python/A", facts({ done: ["PY-1"] }))).toEqual(seeds)
    expect(regionMinutes(LEARN_INDEX, "python/A", facts({ started: ["PY-2"] }), { firstPassMinutes: { "PY-2": 5 } })).toEqual(seeds)
    expect(regionMinutes(LEARN_INDEX, "python/A", facts({ done: ["PY-1"] }), { firstPassMinutes: { "PY-1": 0 } })).toEqual(seeds)
  })

  it("swaps the gate seed for the real minutes only after the gate is passed", () => {
    const real = { firstPassMinutes: { "python/A": 100 } }
    const open = regionMinutes(LEARN_INDEX, "python/A", facts({ regions: { "python/A": running() } }), real)
    expect(open).toEqual(regionMinutes(LEARN_INDEX, "python/A"))
    const after = regionMinutes(LEARN_INDEX, "python/A", facts({ regions: { "python/A": passed(E) } }), real)
    expect(after.low).toBe(5 * SEED_ITEM_MINUTES.low + 100)
    expect(after.high).toBe(5 * SEED_ITEM_MINUTES.high + 100)
  })
})

describe("late (10c, Q17): a record, never a punishment", () => {
  const latest = regionLatestDay(LEARN_INDEX, "python/A", S)

  it("has its latest day at the start plus the high end of the window", () => {
    expect(latest).toBe(addDays(S, regionWindowDays(LEARN_INDEX, "python/A").high))
  })

  it("is not late before or on the latest day, and 0 when it was never started", () => {
    expect(regionLateDays(LEARN_INDEX, "python/A", facts({ regions: { "python/A": running() } }), S)).toBe(0)
    expect(regionLateDays(LEARN_INDEX, "python/A", facts({ regions: { "python/A": running() } }), latest)).toBe(0)
    expect(regionLateDays(LEARN_INDEX, "python/A", NO_FACTS, "2030-01-01")).toBe(0)
  })

  it("counts the days after the latest day while the region still runs", () => {
    const f = facts({ regions: { "python/A": running() } })
    expect(regionLateDays(LEARN_INDEX, "python/A", f, addDays(latest, 3))).toBe(3)
  })

  it("stops counting when the gate is passed, and keeps the number as a record", () => {
    const f = facts({ regions: { "python/A": passed(addDays(latest, 7)) } })
    expect(regionLateDays(LEARN_INDEX, "python/A", f, addDays(latest, 100))).toBe(7)
  })

  it("is judged again from the facts when the pace changes: nothing was saved", () => {
    const f = facts({ done: idsOf("python/A"), regions: { "python/A": passed(latest) } })
    expect(regionStatus(LEARN_INDEX, "python/A", f)).toBe("passedOnTime")
    expect(regionLateDays(LEARN_INDEX, "python/A", f, latest)).toBe(0)
    const faster = { pace: 20 }
    expect(regionStatus(LEARN_INDEX, "python/A", f, faster)).toBe("passedLate")
    expect(regionLateDays(LEARN_INDEX, "python/A", f, latest, faster)).toBeGreaterThan(0)
  })
})

describe("Done: the soft warning (Q14, B11)", () => {
  it("warns under the minimum and says nothing at the minimum, for an item and for a gate", () => {
    const item = SOFT_DONE_MINUTES.item * 60
    expect(doneWarning(item - 1, "item").warn).toBe(true)
    expect(doneWarning(item, "item").warn).toBe(false)
    const gate = SOFT_DONE_MINUTES.gate * 60
    expect(doneWarning(gate - 1, "gate").warn).toBe(true)
    expect(doneWarning(gate, "gate").warn).toBe(false)
    expect(doneWarning(item, "gate").warn).toBe(item < gate)
  })

  it("records no timed minutes as no time logged, not as zero minutes of time spent", () => {
    expect(doneWarning(0, "item")).toEqual({ warn: true, noTimeLogged: true })
    expect(doneWarning(1, "item")).toEqual({ warn: true, noTimeLogged: false })
  })

  it("reads a seconds number that is not usable as no time logged", () => {
    for (const bad of [Number.NaN, -30, Number.NEGATIVE_INFINITY]) expect(doneWarning(bad, "item")).toEqual({ warn: true, noTimeLogged: true })
  })
})

describe("where the minutes went (10a, 19a): one session, one set of minutes", () => {
  const s = (what: string | null, via: string | null, seconds: number, review = false): LearnSessionUse => ({ what, via, review, seconds })

  it("adds a session to its item, region and subject whatever its source", () => {
    const t = learnTimeTotals(LEARN_INDEX, [s("item:PY-1", "own", 600), s("item:PY-1", "coursera/ibm-python/m1/1.1", 300), s("item:PY-6", null, 100)])
    expect(t.byItem).toEqual({ "PY-1": 900, "PY-6": 100 })
    expect(t.byRegion).toEqual({ "python/A": 900, "python/B": 100 })
    expect(t.bySubject).toEqual({ python: 1000 })
    expect(t.byGate).toEqual({})
    expect(t.review).toEqual({})
    expect(t.unmatched).toBe(0)
  })

  it("adds the time of a gate to the gate, its region and its subject", () => {
    const t = learnTimeTotals(LEARN_INDEX, [s("gate:python/A", null, 1200), s("item:PY-1", null, 60)])
    expect(t.byGate).toEqual({ "python/A": 1200 })
    expect(t.byItem).toEqual({ "PY-1": 60 })
    expect(t.byRegion).toEqual({ "python/A": 1260 })
    expect(t.bySubject).toEqual({ python: 1260 })
  })

  it("keeps review time apart: it is never mixed into the first-pass minutes (B2)", () => {
    const t = learnTimeTotals(LEARN_INDEX, [s("item:PY-2", null, 400, true), s("gate:python/A", null, 50, true), s("item:PY-2", null, 100)])
    expect(t.review).toEqual({ "PY-2": 400, "python/A": 50 })
    expect(t.byItem).toEqual({ "PY-2": 100 })
    expect(t.byRegion).toEqual({ "python/A": 100 })
    expect(t.bySubject).toEqual({ python: 100 })
  })

  it("does not count a session that has no item or gate, and a session with no usable seconds", () => {
    const t = learnTimeTotals(LEARN_INDEX, [s(null, "coursera/ibm-python/m4", 500), s("item:PY-1", null, 0), s("item:PY-1", null, -5), s("item:PY-1", null, Number.NaN)])
    expect(t).toEqual({ byItem: {}, byGate: {}, byRegion: {}, bySubject: {}, review: {}, unmatched: 0 })
  })

  it("puts the seconds of a label that is not in the content under unmatched, so none is lost", () => {
    const t = learnTimeTotals(LEARN_INDEX, [s("item:PY-999", null, 60), s("nonsense", null, 30), s("gate:python/Z", null, 20), s("item:PY-1", null, 10)])
    expect(t.unmatched).toBe(110)
    expect(t.byItem).toEqual({ "PY-1": 10 })
  })

  it("adds up the subjects apart", () => {
    const t = learnTimeTotals(LEARN_INDEX, [s("item:NP-1", null, 10), s("item:PD-1", null, 20), s("item:GT-1", null, 30), s("item:PB-1", null, 40)])
    expect(t.bySubject).toEqual({ numpy: 10, pandas: 20, git: 30, prob: 40 })
  })

  it("counts a source and everything below it, with or without an item, and review included", () => {
    const sessions = [
      s("item:PY-2", "coursera/ibm-python/m1/1.3", 100),
      s(null, "coursera/ibm-python", 50),
      s(null, "coursera/ibm-python-extra", 30),
      s("item:PY-2", null, 70),
      s("item:PY-2", "coursera/ibm-python/m4", 40, true),
    ]
    expect(sourceSeconds(sessions, "coursera/ibm-python")).toBe(190)
    expect(sourceSeconds(sessions, "coursera/ibm-python/m1")).toBe(100)
    expect(sourceSeconds(sessions, "coursera")).toBe(220)
    expect(sourceSeconds(sessions, "own")).toBe(0)
    expect(sourceSeconds([s(null, "coursera/ibm-python", Number.NaN), s(null, "coursera/ibm-python", -1)], "coursera")).toBe(0)
  })
})
