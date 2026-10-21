import type { OverviewPresetName } from "@/lib/overviewLook"
import type { Quality } from "@/lib/timerMaths"

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

// The colours of "the whole day" screen (the Laser Flow beam, the pills of the timeline and the legend, and the weekday) for each condition. They go with the look of the background of the same condition: every colour comes from the colours of that preset (overviewLook.ts), and the dark end of the preset is lifted a little, so that a pill is seen on the black screen. beam is the colour of the laser; accent is the bright colour of the weekday and of the first part of the tag bar; qualities are the four colours of the pills and of the legend, from the dimmest (meh) to the brightest (flow). It is a Record on purpose: a new condition fails the type check until it has its colours.
export type OverviewDayPalette = { beam: string; accent: string; qualities: Record<Quality, string> }
export const OVERVIEW_DAY_PALETTE: Record<OverviewCondition, OverviewDayPalette> = {
  // Atmosphere: blue and white
  unknown: { beam: "#38bdf8", accent: "#a5d8ff", qualities: { meh: "#3d63e0", solid: "#38bdf8", deep: "#a5d8ff", flow: "#f6f8ff" } },
  // Rose: red and pink
  notEnough: { beam: "#f43f5e", accent: "#fda4af", qualities: { meh: "#c12448", solid: "#f43f5e", deep: "#fda4af", flow: "#fff1f2" } },
  // Corona: brown and amber
  okay: { beam: "#f59e0b", accent: "#f59e0b", qualities: { meh: "#b66a0d", solid: "#f59e0b", deep: "#facd7b", flow: "#fffbeb" } },
  // Lagoon: teal
  good: { beam: "#5eead4", accent: "#5eead4", qualities: { meh: "#0d9488", solid: "#36bfae", deep: "#5eead4", flow: "#f0fdfa" } },
}

export function dayPaletteOf(condition: OverviewCondition): OverviewDayPalette {
  return OVERVIEW_DAY_PALETTE[condition]
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
