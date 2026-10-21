import { useEffect, useState } from "react"
import GradientASCII from "@/components/GradientASCII"
import { LITE_LEVEL } from "@/lib/lite"
import { CONDITION_WAIT_MS, conditionFromMinutes, presetOfCondition, type OverviewCondition } from "@/lib/overviewCondition"
import { OVERVIEW_ASCII, OVERVIEW_PRESETS } from "@/lib/overviewLook"
import { startIntroSound } from "@/lib/overviewSound"
import { deviceTimeZone, timerDayScore } from "@/lib/timerApi"
import { localDay } from "@/lib/timerMaths"
import "../overview.css"

// AB:OVERVIEW.BG:START
// The moving background of the Overview screen: the React Bits animation Gradient ASCII (library file src/components/GradientASCII.tsx) in one of the four Studio presets, with the sound of its intro.
// The preset comes from the CONDITION of the day (src/lib/overviewCondition.ts, CONNECTIONS.md C64): unknown gets Atmosphere, notEnough gets Rose, okay gets Corona and good gets Lagoon. There are two ways to give the condition. A caller can pass it as the prop condition (the way for something dynamic that is added later: it decides the condition itself and passes it in, and the picture follows). Without the prop the background finds it itself: readTodayMinutes asks the day score for the credited minutes of today (the same number the screen shows as the day number) and conditionFromMinutes turns them into a condition. This is the place to change when the numbers come from somewhere else.
// While the condition is being read nothing is drawn (the picture, and with it the sound, starts when the condition is known). An answer that does not come within CONDITION_WAIT_MS, or cannot be read, opens the Overview as unknown. The condition is read once, when the Overview opens: an answer that comes after that does not change the look. A condition that is passed in as a prop and then changes draws the new look at once (the picture is made again, with its intro).
// The mouse does nothing here: no scramble under the cursor and no wave on a click.
// The sound of the intro (src/lib/overviewSound.ts) starts with the intro (never after it) and is stopped when the Overview goes away. It plays at most once a minute (the one minute rule of that file); the picture is the same either way.
// A phone (lite level 1 or 2, src/lib/lite.ts) draws the characters at a pixel ratio of 1 instead of up to 2, which is a quarter of the pixels on a phone screen. The size of the cells stays 19 px: it is NOT drawn in the half-size box of the other backgrounds (CONNECTIONS.md C21), which would make the characters twice as big. The background never stands still, at any lite level.
// See CONNECTIONS.md C59 and C64.
async function readTodayMinutes(): Promise<number> {
  const score = await timerDayScore(localDay(Date.now(), deviceTimeZone()))
  return score.creditedMinutes
}

// Reads the condition once, when the Overview opens. null while it is being read. skip is true when the caller gave the condition: then nothing is read.
function useFoundCondition(skip: boolean): OverviewCondition | null {
  const [found, setFound] = useState<OverviewCondition | null>(null)
  useEffect(() => {
    if (skip) return
    let alive = true
    function settle(minutes: number | null): void {
      if (alive) setFound((before) => before ?? conditionFromMinutes(minutes))
    }
    const timer = window.setTimeout(() => settle(null), CONDITION_WAIT_MS)
    readTodayMinutes().then(
      (minutes) => settle(minutes),
      () => settle(null),
    )
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [skip])
  return found
}

function OverviewPicture({ condition }: { condition: OverviewCondition }) {
  useEffect(() => startIntroSound(), [])
  const name = presetOfCondition(condition)
  const preset = OVERVIEW_PRESETS[name]
  return (
    <div className="ab-ascii-bg" data-preset={name} data-condition={condition} aria-hidden="true">
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

export default function OverviewBackground({ condition }: { condition?: OverviewCondition }) {
  const found = useFoundCondition(condition !== undefined)
  const chosen = condition ?? found
  if (chosen === null) return null
  return <OverviewPicture key={presetOfCondition(chosen)} condition={chosen} />
}
// AB:OVERVIEW.BG:END
