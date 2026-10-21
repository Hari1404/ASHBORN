// AB:OVERVIEW.LOOK:START
// The look of the moving background of the Overview screen: the React Bits animation Gradient ASCII (src/components/GradientASCII.tsx, a library file) with the four presets of the React Bits Background Studio (Atmosphere, Lagoon, Rose, Corona). The values of the presets are copied from the Studio; only the things the owner changed are different (see OVERVIEW_ASCII). These are plain values: no screen and no sound here. Which preset is shown, and when, is decided by the condition of the day in overviewCondition.ts (CONNECTIONS.md C64). See CONNECTIONS.md C59.

export type AsciiShape = "horizon" | "pinch" | "rise" | "eclipse"

export type OverviewPresetName = "atmosphere" | "lagoon" | "rose" | "corona"

export type OverviewPreset = {
  shape: AsciiShape
  // Two to eight colours, from the edge of the shadow to the brightest point.
  colors: string[]
  // The characters from the dimmest to the brightest.
  characters: string
}

// The four presets, in the order of the Studio. Each one has its own shape, colours and characters. The cell size of the Studio presets (18, 16, 22 and 15) is NOT here: the owner wants 19 for all four (OVERVIEW_ASCII).
export const OVERVIEW_PRESET_NAMES: readonly OverviewPresetName[] = ["atmosphere", "lagoon", "rose", "corona"]

export const OVERVIEW_PRESETS: Record<OverviewPresetName, OverviewPreset> = {
  atmosphere: { shape: "horizon", colors: ["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"], characters: " =+xX0S8#@" },
  lagoon: { shape: "pinch", colors: ["#0d9488", "#5eead4", "#f0fdfa"], characters: " .:-=+*#%@" },
  rose: { shape: "rise", colors: ["#9f1239", "#f43f5e", "#fda4af", "#fff1f2"], characters: " =+xX0S8#@" },
  corona: { shape: "eclipse", colors: ["#78350f", "#f59e0b", "#fffbeb"], characters: " 01" },
}

// What the owner changed in the Studio, for all four presets. Everything not named here (density, glyph opacity, glow, flicker, scale, flow, speed, gradient opacity, grain, variation) stays at the value of the Studio.
export const OVERVIEW_ASCII = {
  // The height of one character cell in px (the Studio has 18 and its presets 16, 22 and 15).
  cellSize: 19,
  // How soft the edges of the shape are, 0 to 1 (the Studio has 0.5).
  softness: 0.8,
  // The mouse does nothing: no scramble under the cursor, and no wave or burst on a click.
  mouseInteraction: false,
  clickEffect: "none" as const,
  // The reveal of the characters when the background opens.
  intro: true,
}

// How long the intro lasts, in seconds. The library has 2.4; the file GradientASCII.tsx was edited to 2 (CONNECTIONS.md C59), and the sound of the intro is NOT cut at that moment: it starts with the picture and rings out to its natural end (src/lib/overviewSound.ts).
export const OVERVIEW_INTRO_SECONDS = 2
// AB:OVERVIEW.LOOK:END
