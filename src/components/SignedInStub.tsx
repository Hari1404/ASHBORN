import { useEffect, useRef, useState, type ReactNode } from "react"
import AppMenu from "@/components/AppMenu"
import DarkVeil from "@/components/DarkVeil"
import OverviewBackground from "@/components/OverviewBackground"
import OverviewHud from "@/components/OverviewHud"
import TimerScreen from "@/components/TimerScreen"
import { TvScreen, type TvHandle } from "@/components/TvScreen"
import { supabase } from "@/lib/supabase"
import { LITE_LEVEL } from "@/lib/lite"
import { TV_BLACK_HOLD_MS, TV_OFF_MS, TV_ON_MS } from "@/lib/tvKeyframes"
import { SCREENS, useScreen } from "@/lib/screens"
import { warmTimerScreen } from "@/lib/timerWarmup"
import "../auth.css"

// AB:AUTH.STUB:START
// TEMPORARY screen shown after a sign in. It is thrown away when the real app shell is built.
// The background of Calendar and Guide is Dark Veil. It sits in the same ab-bg box, with the same lite mode, as the front page. See CONNECTIONS.md C23.
// The background of the Overview (the default screen: #overview, no address, or an address that is no screen) is Gradient ASCII with the sound of its intro, made by OverviewBackground (the OVERVIEW rows of CODE_MAP.md), NOT Dark Veil and NOT in the ab-bg box. See CONNECTIONS.md C59.
// On the Overview two things sit on top of that background (OverviewHud, CODE_MAP.md OVERVIEW.HUD, CONNECTIONS.md C60): the countdown to April 14 in the top right corner and "Today in Pro Timer" along the bottom.
// The title is the name of the screen chosen in the menu (the list is in src/lib/screens.ts). The four screens are empty placeholders for now. The menu (AppMenu) sits BESIDE the main element, not inside it, see CONNECTIONS.md C25.
// The Pro Timer screen (#timer) is the one real screen: when it is chosen, TimerScreen is shown instead of this placeholder. It has its own plain black background (no Dark Veil), and AppMenu sits beside it in the same way. See CONNECTIONS.md C30.
// Once, a moment after the first picture, whichever screen is shown, the warm-up of the Pro Timer runs (src/lib/timerWarmup.ts): the font of the digits, the connection to the database and the WebGL 2 check are done early, so the timer screen opens quickly. A page that was opened straight on the Pro Timer does not warm the database, because that screen reads it itself at once. When this temporary screen is thrown away, the call moves to the real app shell. See CONNECTIONS.md C44.
export default function SignedInStub({ email }: { email: string }) {
  const screen = useScreen()
  const [firstScreen] = useState(screen)
  useEffect(() => {
    warmTimerScreen(firstScreen !== "timer")
  }, [firstScreen])
  const title = SCREENS.find((s) => s.id === screen)?.label ?? ""
  if (screen === "timer") {
    return (
      <>
        <TimerScreen />
        <AppMenu />
      </>
    )
  }
  const placeholder = (
    <main className="ab-stub">
      {screen === "overview" ? (
        <>
          <OverviewBackground />
          <OverviewHud />
        </>
      ) : (
        <div className="ab-bg" data-lite={LITE_LEVEL > 0 ? "on" : undefined}>
          <DarkVeil
            hueShift={0}
            noiseIntensity={0.11}
            scanlineIntensity={0}
            speed={LITE_LEVEL === 2 ? 0 : 0.8}
            scanlineFrequency={0.5}
            warpAmount={5}
            resolutionScale={1}
            lightMode={false}
          />
        </div>
      )}
      <p className="ab-stub-title">{title}</p>
      <p className="ab-stub-line">{email}</p>
      <p className="ab-stub-note">Temporary placeholder. The real screen comes later.</p>
      <button
        className="ab-stub-button"
        type="button"
        onClick={() => void supabase?.auth.signOut()}
      >
        Sign out
      </button>
    </main>
  )
  if (screen === "guide") {
    return (
      <>
        <GuideTvTrial>{placeholder}</GuideTvTrial>
        <AppMenu />
      </>
    )
  }
  return (
    <>
      {placeholder}
      <AppMenu />
    </>
  )
}
// AB:AUTH.STUB:END

// AB:GUIDE.PROVE-TEST:START
// TEMPORARY, Packet T1 only (removed by Packet 12B). The Guide placeholder sits inside TvScreen, with a test button, Prove.
// Prove plays the turn-off at once, holds the black for TV_BLACK_HOLD_MS (this stands in for the Oculus trip, which Packet T2 puts in its place), then plays the turn-on.
// The button sits BESIDE the placeholder, inside TvScreen: inside <main className="ab-stub"> the rule `.ab-stub > :not(.ab-bg)` of auth.css would take its place away.
function GuideTvTrial({ children }: { children: ReactNode }) {
  const tv = useRef<TvHandle>(null)
  const busy = useRef(false) // DECISIONS_LEARN.md 18c point 10: a press during the trip does nothing
  const alive = useRef(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  async function prove(): Promise<void> {
    if (busy.current) return
    busy.current = true
    setRunning(true)
    await tv.current?.turnOff(TV_OFF_MS)
    await new Promise<void>((resolve) => setTimeout(resolve, TV_BLACK_HOLD_MS))
    if (alive.current) await tv.current?.turnOn(TV_ON_MS)
    busy.current = false
    if (alive.current) setRunning(false)
  }

  return (
    <TvScreen ref={tv}>
      {children}
      <button type="button" className="tv-prove" disabled={running} onClick={() => void prove()}>
        Prove
      </button>
    </TvScreen>
  )
}
// AB:GUIDE.PROVE-TEST:END
