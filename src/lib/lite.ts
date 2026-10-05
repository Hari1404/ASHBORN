// AB:LOGIN.LITE:START
// Lite mode: a lighter way to draw the front page, made for phones.
// Level 0 = the full look (laptop). Level 1 = lite: a plain dark card instead of the glass, the background drawn at half size, the name at 30 frames per second.
// Level 2 = level 1, and the background stands still after its short intro.
// A touch screen gets level 1. The page address can force a level: add ?lite=0, ?lite=1 or ?lite=2 to it.
// The level is read once, when the page loads. See CONNECTIONS.md C22 for the places that use it.
export type LiteLevel = 0 | 1 | 2

function readLiteLevel(): LiteLevel {
  if (typeof window === "undefined") return 0
  const forced = new URLSearchParams(window.location.search).get("lite")
  if (forced === "0") return 0
  if (forced === "1") return 1
  if (forced === "2") return 2
  return window.matchMedia("(pointer: coarse)").matches ? 1 : 0
}

export const LITE_LEVEL: LiteLevel = readLiteLevel()
// AB:LOGIN.LITE:END
