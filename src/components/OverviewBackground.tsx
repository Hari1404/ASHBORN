import { useEffect, useState } from "react"
import GradientASCII from "@/components/GradientASCII"
import { LITE_LEVEL } from "@/lib/lite"
import { OVERVIEW_ASCII, OVERVIEW_PRESETS, pickOverviewPreset, type OverviewPresetName } from "@/lib/overviewLook"
import { startIntroSound } from "@/lib/overviewSound"
import "../overview.css"

// AB:OVERVIEW.BG:START
// The moving background of the Overview screen: the React Bits animation Gradient ASCII (library file src/components/GradientASCII.tsx) in one of the four Studio presets, with the sound of its intro.
// Every time the Overview opens, one of the four presets is picked at random, never the one of the last opening while the page stays open (a reload of the page starts fresh and may give the same one; the choice and the settings are in src/lib/overviewLook.ts). The mouse does nothing here: no scramble under the cursor and no wave on a click.
// The sound of the intro (src/lib/overviewSound.ts) starts with the intro and is stopped when the Overview goes away.
// A phone (lite level 1 or 2, src/lib/lite.ts) draws the characters at a pixel ratio of 1 instead of up to 2, which is a quarter of the pixels on a phone screen. The size of the cells stays 19 px: it is NOT drawn in the half-size box of the other backgrounds (CONNECTIONS.md C21), which would make the characters twice as big. The background never stands still, at any lite level.
// See CONNECTIONS.md C59.
let lastPreset: OverviewPresetName | null = null

export default function OverviewBackground() {
  const [name] = useState<OverviewPresetName>(() => pickOverviewPreset(Math.random, lastPreset))
  useEffect(() => {
    lastPreset = name
  }, [name])
  useEffect(() => startIntroSound(), [])
  const preset = OVERVIEW_PRESETS[name]
  return (
    <div className="ab-ascii-bg" data-preset={name} aria-hidden="true">
      <GradientASCII
        colors={preset.colors}
        shape={preset.shape}
        characters={preset.characters}
        cellSize={OVERVIEW_ASCII.cellSize}
        softness={OVERVIEW_ASCII.softness}
        mouseInteraction={OVERVIEW_ASCII.mouseInteraction}
        clickEffect={OVERVIEW_ASCII.clickEffect}
        intro={OVERVIEW_ASCII.intro}
        dpr={LITE_LEVEL > 0 ? 1 : undefined}
      />
    </div>
  )
}
// AB:OVERVIEW.BG:END
