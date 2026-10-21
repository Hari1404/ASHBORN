import { describe, expect, it } from "vitest"
import {
  CONDITION_MINUTES,
  CONDITION_WAIT_MS,
  OVERVIEW_CONDITIONS,
  OVERVIEW_CONDITION_PRESET,
  conditionFromMinutes,
  presetOfCondition,
} from "./overviewCondition"
import { OVERVIEW_PRESETS } from "./overviewLook"

// AB:OVERVIEW.TESTS:START
// Tests of the conditions of the Overview (src/lib/overviewCondition.ts, CONNECTIONS.md C64). The look of each condition is written out here again on purpose: it is the owner's choice, and a change in the file must be a decision, not an accident.

describe("the four conditions and their looks", () => {
  it("are unknown, notEnough, okay and good, from the lowest to the best", () => {
    expect([...OVERVIEW_CONDITIONS]).toEqual(["unknown", "notEnough", "okay", "good"])
    expect(Object.keys(OVERVIEW_CONDITION_PRESET).sort()).toEqual([...OVERVIEW_CONDITIONS].sort())
  })

  it("give unknown Atmosphere, notEnough Rose, okay Corona and good Lagoon", () => {
    expect(OVERVIEW_CONDITION_PRESET).toEqual({ unknown: "atmosphere", notEnough: "rose", okay: "corona", good: "lagoon" })
  })

  it("give every condition a real preset, and no two conditions the same one", () => {
    for (const condition of OVERVIEW_CONDITIONS) expect(OVERVIEW_PRESETS[presetOfCondition(condition)]).toBeDefined()
    expect(new Set(OVERVIEW_CONDITIONS.map(presetOfCondition)).size).toBe(OVERVIEW_CONDITIONS.length)
  })
})

describe("conditionFromMinutes (the rule, hardcoded for now)", () => {
  it("has the default numbers: okay from 2 hours and good from 4 hours", () => {
    expect(CONDITION_MINUTES).toEqual({ okayFrom: 120, goodFrom: 240 })
    expect(CONDITION_MINUTES.okayFrom).toBeLessThan(CONDITION_MINUTES.goodFrom)
  })

  it.each([null, 0, -5, NaN, Infinity, -Infinity])("gives unknown for %s (nothing to judge)", (minutes) => {
    expect(conditionFromMinutes(minutes)).toBe("unknown")
  })

  it.each([
    [0.5, "notEnough"],
    [30, "notEnough"],
    [119.999, "notEnough"],
    [120, "okay"],
    [180, "okay"],
    [239.999, "okay"],
    [240, "good"],
    [600, "good"],
  ] as const)("gives %s minutes the condition %s", (minutes, condition) => {
    expect(conditionFromMinutes(minutes)).toBe(condition)
  })

  it("never goes down when there is more time, and always gives one of the four conditions", () => {
    let before = 0
    for (let minutes = 0.25; minutes <= 700; minutes += 0.25) {
      const rank = OVERVIEW_CONDITIONS.indexOf(conditionFromMinutes(minutes))
      expect(rank).toBeGreaterThanOrEqual(1)
      expect(rank).toBeGreaterThanOrEqual(before)
      before = rank
    }
  })
})

describe("the wait for the answer", () => {
  it("is a positive number of milliseconds, short enough for an opening screen", () => {
    expect(CONDITION_WAIT_MS).toBeGreaterThan(0)
    expect(CONDITION_WAIT_MS).toBeLessThanOrEqual(3000)
  })
})
// AB:OVERVIEW.TESTS:END
