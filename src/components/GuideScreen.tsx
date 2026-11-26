import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { TvScreen, type TvHandle } from "@/components/TvScreen"
import { useGuideAddress } from "@/lib/screens"
import { TV_BLACK_HOLD_MS, TV_OFF_MS, TV_ON_MS } from "@/lib/tvKeyframes"

// AB:GUIDE.SCREEN:START
// The Guide screen (Packet 12B). It is the Learn screen drawn inside the TV screen (TvScreen, C65), and it owns the trip of Prove: TV off, a black hold, TV on.
// The Learn screen is loaded lazily, because the content of Tier 1 is large: until it has arrived a plain black picture says "Loading", and if it can never be loaded (or breaks while it draws) the same picture says so. That picture is the class ab-guide-note, written in tv.css (not in learn.css: learn.css arrives together with the Learn screen).
// What Prove asks of this file: LearnScreen gets onProve and proving. While proving is true both of its switch buttons and Escape are off (C77), so a second trip can not start. busy makes the same promise here, in case a press gets through.
// The picture is inert during the trip, so the keyboard falls out of it. When the trip is over and the buttons are on again, the keyboard goes back to where it was, if nobody has moved it in the meantime. AppMenu is NOT in here: STUB puts it beside this screen, so the menu stays on screen during the black (C25, C65).
// Leaving the Guide in the middle of a trip is allowed: the hold is ended at once (no timer is left), and the TV is not turned on again, because TvScreen has already put a normal picture behind it.
const LearnScreen = lazy(() => import("@/components/LearnScreen"))

type GuardState = { failed: boolean }

class LearnGuard extends Component<{ children: ReactNode }, GuardState> {
  state: GuardState = { failed: false }

  static getDerivedStateFromError(): GuardState {
    return { failed: true }
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <p className="ab-guide-note" role="alert">
          The Learn screen could not be opened. Reload the page to try again.
        </p>
      )
    }
    return this.props.children
  }
}

// The element that has the keyboard, or null when it is on nothing (the page itself).
function keyboardElement(): HTMLElement | null {
  const now = document.activeElement
  return now instanceof HTMLElement && now !== document.body ? now : null
}

export default function GuideScreen() {
  const address = useGuideAddress()
  const tv = useRef<TvHandle>(null)
  const busy = useRef(false) // DECISIONS_LEARN.md 18c point 10: a press during the trip does nothing
  const alive = useRef(true)
  const hold = useRef<{ end: () => void } | null>(null) // the black hold that is waiting, so that leaving can end it
  const was = useRef<HTMLElement | null>(null) // where the keyboard was when the trip began
  const [proving, setProving] = useState(false)

  useEffect(() => {
    alive.current = true // again: strict mode runs this effect, its clean-up, and this effect once more
    return () => {
      alive.current = false
      hold.current?.end()
    }
  }, [])

  // The trip is over (proving is false again): the buttons are on, so the keyboard can go back.
  useEffect(() => {
    if (proving) return
    const element = was.current
    was.current = null
    if (element === null || !element.isConnected) return
    if (keyboardElement() !== null) return // somebody has put it somewhere else: leave it there
    element.focus({ preventScroll: true })
  }, [proving])

  function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer)
        hold.current = null
        resolve()
      }
      const timer = setTimeout(done, ms)
      hold.current = { end: done }
    })
  }

  async function prove(): Promise<void> {
    if (busy.current) return
    busy.current = true
    was.current = keyboardElement()
    setProving(true)
    await tv.current?.turnOff(TV_OFF_MS)
    if (!alive.current) return // left during the turn-off: no black is held
    await wait(TV_BLACK_HOLD_MS)
    if (!alive.current) return // left during the black: a second guard (the TV handle is empty once the screen is gone, so a turn-on would do nothing anyway)
    await tv.current?.turnOn(TV_ON_MS)
    busy.current = false
    if (alive.current) setProving(false)
  }

  return (
    <TvScreen ref={tv}>
      <LearnGuard>
        <Suspense
          fallback={
            <p className="ab-guide-note" role="status">
              Loading
            </p>
          }
        >
          <LearnScreen address={address} onProve={() => void prove()} proving={proving} />
        </Suspense>
      </LearnGuard>
    </TvScreen>
  )
}
// AB:GUIDE.SCREEN:END
