// AB:LEARN.SPOTLIGHT:START
// Where the glow and the tilt of a Learn tile go while a mouse moves over it (from the preview page ASHBORN_Learn_subjects_item_card.html, "pm").
// Pure: it takes the box of the tile and the place of the pointer and says what to write into the four css variables of the tile.
// The hook that listens to the mouse and writes them is src/lib/useLearnSpotlight.ts; the look that reads them is the part of src/learn.css that has the same tag as src/components/SpotGlow.tsx.
// The names of the four variables and of the marker attribute are written here AND in that css (CONNECTIONS.md C76).

// A tile takes part when it carries this attribute: data-spot="glow" (a glow only) or data-spot="tilt" (a glow and a tilt).
export const SPOT_ATTRIBUTE = "data-spot"
export const SPOT_TILT_VALUE = "tilt"

// The variables written on the tile. The glow sits at (x, y) in the tile's own pixels. The tilt is two angles: rotateX is made from
// the vertical place of the pointer and rotateY from the horizontal place, so the tile presses down under the pointer.
export const SPOT_VARS = {
  x: "--ab-learn-mx",
  y: "--ab-learn-my",
  rotateX: "--ab-learn-rot-x",
  rotateY: "--ab-learn-rot-y",
} as const

// While the page scrolls the root carries this attribute ("true") and the css takes the pointer away from the tiles, so a tile that passes under a resting mouse does not start its glow, its tilt and its border change again and again (about 100 ms of work a second on a laptop, in a measurement). It is taken off again when no scroll has come for SPOT_SCROLL_IDLE_MS.
export const SPOT_SCROLLING_ATTRIBUTE = "data-scrolling"
export const SPOT_SCROLL_IDLE_MS = 120

// The tilt of a tile whose pointer goes from one edge to the other: 10 degrees, so at most 5 degrees either way.
export const SPOT_TILT_DEG = 10

export type SpotRect = { left: number; top: number; width: number; height: number }
export type SpotVars = { x: string; y: string; rotateX: string | null; rotateY: string | null }

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function clampHalf(n: number): number {
  const half = SPOT_TILT_DEG / 2
  return Math.min(half, Math.max(-half, n))
}

// rect is the box the browser reports for the tile (it grows with a scale, like the page of a small window that is shrunk to fit),
// offsetWidth is the width the tile has before any scale; their ratio turns the pointer place back into the tile's own pixels.
// rotateX and rotateY are null when tilt is false. The answer is null when a number is not a number or the tile has no size
// (a tile that is not shown), so nothing is written.
export function spotlightVars(rect: SpotRect, offsetWidth: number, clientX: number, clientY: number, tilt: boolean): SpotVars | null {
  const numbers = [rect.left, rect.top, rect.width, rect.height, offsetWidth, clientX, clientY]
  if (!numbers.every((n) => Number.isFinite(n))) return null
  if (rect.width <= 0 || rect.height <= 0) return null
  const scale = offsetWidth > 0 ? rect.width / offsetWidth : 1
  const dx = clientX - rect.left
  const dy = clientY - rect.top
  return {
    x: `${round2(dx / scale)}px`,
    y: `${round2(dy / scale)}px`,
    rotateX: tilt ? `${round2(clampHalf((0.5 - dy / rect.height) * SPOT_TILT_DEG))}deg` : null,
    rotateY: tilt ? `${round2(clampHalf((dx / rect.width - 0.5) * SPOT_TILT_DEG))}deg` : null,
  }
}
// AB:LEARN.SPOTLIGHT:END
