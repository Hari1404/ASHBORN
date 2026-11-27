import { useEffect, type RefObject } from "react"
import { SPOT_ATTRIBUTE, SPOT_SCROLLING_ATTRIBUTE, SPOT_SCROLL_IDLE_MS, SPOT_TILT_VALUE, SPOT_VARS, spotlightVars } from "./learnSpotlight"

// AB:LEARN.SPOTLIGHT-HOOK:START
// The listener behind the glow and the tilt of the tiles of the Learn screen: ONE listener on the root of the screen, not one per tile.
// While a mouse or a pen moves over a tile that carries data-spot, the place of the pointer is written into the css variables of that tile (the names and the numbers are in learnSpotlight.ts). A finger writes nothing.
// Writes are joined to one per screen frame, as the preview page did: the last place of the pointer in that frame is the one that counts.
// While the root scrolls it carries data-scrolling="true" (SPOT_SCROLLING_ATTRIBUTE), set at the first scroll event and taken off SPOT_SCROLL_IDLE_MS after the last one; the css (the glow and tilt part of src/learn.css, the one that SpotGlow.tsx shares a tag with) takes the pointer away from the page for a device with a mouse in that time, so hovering stops while the page moves.
// A tile outside the root, or a tile that has no size (not shown), is left alone. When the screen is taken away the listeners, a waiting frame, the waiting end of a scroll and the attribute are taken away with it.
// The tile puts a SpotGlow (src/components/SpotGlow.tsx) as its last child; the look is the part of src/learn.css that has the same tag as SpotGlow.tsx. See CONNECTIONS.md C76.
export function useLearnSpotlight(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = rootRef.current
    if (root === null) return undefined
    let frame = 0
    let scrollEnd = 0
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

    const onScroll = (): void => {
      if (scrollEnd === 0) root.setAttribute(SPOT_SCROLLING_ATTRIBUTE, "true")
      window.clearTimeout(scrollEnd)
      scrollEnd = window.setTimeout(() => {
        scrollEnd = 0
        root.removeAttribute(SPOT_SCROLLING_ATTRIBUTE)
      }, SPOT_SCROLL_IDLE_MS)
    }

    root.addEventListener("pointermove", onMove, { passive: true })
    root.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("scroll", onScroll)
      if (frame !== 0) window.cancelAnimationFrame(frame)
      window.clearTimeout(scrollEnd)
      root.removeAttribute(SPOT_SCROLLING_ATTRIBUTE)
    }
  }, [rootRef])
}
// AB:LEARN.SPOTLIGHT-HOOK:END
