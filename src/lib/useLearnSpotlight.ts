import { useEffect, type RefObject } from "react"
import { SPOT_ATTRIBUTE, SPOT_TILT_VALUE, SPOT_VARS, spotlightVars } from "./learnSpotlight"

// AB:LEARN.SPOTLIGHT-HOOK:START
// The listener behind the glow and the tilt of the tiles of the Learn screen: ONE listener on the root of the screen, not one per tile.
// While a mouse or a pen moves over a tile that carries data-spot, the place of the pointer is written into the css variables of that tile (the names and the numbers are in learnSpotlight.ts). A finger writes nothing.
// Writes are joined to one per screen frame, as the preview page did: the last place of the pointer in that frame is the one that counts.
// A tile outside the root, or a tile that has no size (not shown), is left alone. When the screen is taken away the listener and a waiting frame are taken away with it.
// The tile puts a SpotGlow (src/components/SpotGlow.tsx) as its last child; the look is the part of src/learn.css that has the same tag as SpotGlow.tsx. See CONNECTIONS.md C76.
export function useLearnSpotlight(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = rootRef.current
    if (root === null) return undefined
    let frame = 0
    let last: { target: EventTarget | null; x: number; y: number } | null = null

    const apply = (): void => {
      frame = 0
      const move = last
      last = null
      if (move === null || !(move.target instanceof Element)) return
      const tile = move.target.closest<HTMLElement>(`[${SPOT_ATTRIBUTE}]`)
      if (tile === null || !root.contains(tile)) return
      const tilt = tile.getAttribute(SPOT_ATTRIBUTE) === SPOT_TILT_VALUE
      const vars = spotlightVars(tile.getBoundingClientRect(), tile.offsetWidth, move.x, move.y, tilt)
      if (vars === null) return
      tile.style.setProperty(SPOT_VARS.x, vars.x)
      tile.style.setProperty(SPOT_VARS.y, vars.y)
      if (vars.rotateX !== null) tile.style.setProperty(SPOT_VARS.rotateX, vars.rotateX)
      if (vars.rotateY !== null) tile.style.setProperty(SPOT_VARS.rotateY, vars.rotateY)
    }

    const onMove = (event: PointerEvent): void => {
      if (event.pointerType === "touch") return
      last = { target: event.target, x: event.clientX, y: event.clientY }
      if (frame === 0) frame = window.requestAnimationFrame(apply)
    }

    root.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      root.removeEventListener("pointermove", onMove)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [rootRef])
}
// AB:LEARN.SPOTLIGHT-HOOK:END
