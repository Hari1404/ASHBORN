import type { OverviewPresetName } from "@/lib/overviewLook"

// AB:OVERVIEW.CONDITION:START
// The four conditions of the Overview and the one rule that picks one. The condition decides which look (preset) the moving background of the Overview gets: it replaces the old random pick. Plain values and plain functions: no screen, no database and no sound here. The screen is src/components/OverviewBackground.tsx. See CONNECTIONS.md C64.
// The names are the owner's own words, written the way the code writes them: "dont know" is unknown, "not sufficient" is notEnough, "okok" is okay and "good" is good.
export type OverviewCondition = "unknown" | "notEnough" | "okay" | "good"

// From the lowest to the best.
export const OVERVIEW_CONDITIONS: readonly OverviewCondition[] = ["unknown", "notEnough", "okay", "good"]

// Which look each condition gets (the presets are in overviewLook.ts). It is a Record on purpose: a new condition fails the type check until it has a look.
export const OVERVIEW_CONDITION_PRESET: Record<OverviewCondition, OverviewPresetName> = {
  unknown: "atmosphere",
  notEnough: "rose",
  okay: "corona",
  good: "lagoon",
}

export function presetOfCondition(condition: OverviewCondition): OverviewPresetName {
  return OVERVIEW_CONDITION_PRESET[condition]
}

// DEFAULT numbers of the rule below, hardcoded for now (the owner said the rule will change later): the minutes of the day from which the condition is okay and good.
export const CONDITION_MINUTES = { okayFrom: 120, goodFrom: 240 } as const

// THE RULE. This is the one place that says which condition a day is in, and it is the place to change when the condition comes from something else than the time of the day. It is given the minutes of the day (the credited minutes of the day score, the same number the screen shows as the day number) or null when they could not be read. DEFAULT: a day with no time at all, or minutes that could not be read, is unknown (there is nothing to judge yet); under 2 hours is notEnough; from 2 hours is okay; from 4 hours is good.
export function conditionFromMinutes(minutes: number | null): OverviewCondition {
  if (minutes === null || !Number.isFinite(minutes) || minutes <= 0) return "unknown"
  if (minutes >= CONDITION_MINUTES.goodFrom) return "good"
  if (minutes >= CONDITION_MINUTES.okayFrom) return "okay"
  return "notEnough"
}

// How long the Overview waits for the answer of the database before it opens with the condition unknown, in milliseconds. The look is chosen once, when the Overview opens: an answer that comes later does not change it.
export const CONDITION_WAIT_MS = 1500
// AB:OVERVIEW.CONDITION:END
