// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

// This file is apart from GuideScreen.test.tsx because the lazy Learn screen is loaded ONCE per file: here its import fails, there it works.
// The module of the Learn screen throws when it is loaded, which is what a page that has lost its network (or an old page whose files have been replaced on the server) gets.
vi.mock("@/components/LearnScreen", () => {
  throw new Error("Failed to fetch dynamically imported module")
})
vi.mock("@/components/TvScreen", async () => {
  const { createElement: h } = await import("react")
  return { TvScreen: (p: { children?: import("react").ReactNode }) => h("div", { id: "tv-stub" }, p.children) }
})

import GuideScreen from "./GuideScreen"

let root: Root | null = null
let container: HTMLElement | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.restoreAllMocks()
})

it("says that the Learn screen could not be opened, in the TV and as an alert, when it cannot be loaded, and stops saying Loading", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {}) // React writes the error it has caught
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(createElement(GuideScreen)))
  expect(container.querySelector(".ab-guide-note")?.textContent).toBe("Loading")
  await act(async () => {
    await vi.dynamicImportSettled()
  })
  const note = container.querySelector(".ab-guide-note")
  expect(note?.getAttribute("role")).toBe("alert")
  expect(note?.textContent).toContain("could not be opened")
  expect(note?.closest("#tv-stub")).not.toBeNull()
  expect(container.textContent).not.toContain("Loading")
})
