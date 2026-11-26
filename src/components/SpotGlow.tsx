import "../learn.css"

// AB:LEARN.SPOT:START
// The two layers of the glow of a Learn tile: the soft light inside the tile and the bright edge. A tile puts this as its LAST child and carries data-spot="glow" or data-spot="tilt".
// Both layers are hidden from a screen reader and never catch a tap. Where the glow goes is written into the tile by useLearnSpotlight (src/lib/useLearnSpotlight.ts); how it looks, and the tilt, is the css with the same tag in learn.css. See CONNECTIONS.md C76.
export default function SpotGlow() {
  return (
    <>
      <span className="ab-learn-spl" aria-hidden="true" />
      <span className="ab-learn-spe" aria-hidden="true" />
    </>
  )
}
// AB:LEARN.SPOT:END
