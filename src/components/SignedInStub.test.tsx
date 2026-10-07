// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The menu, the Pro Timer screen, the background and the database client are replaced by small stand-ins: this file only tests which screen the stub chooses and where the menu sits.
vi.mock("@/lib/supabase", () => ({ supabase: null }))
vi.mock("@/lib/lite", () => ({ LITE_LEVEL: 1 }))
vi.mock("@/components/DarkVeil", async () => {
  const { createElement: h } = await import("react")
  return { default: () => h("canvas", { id: "veil-stub" }) }
})
vi.mock("@/components/AppMenu", async () => {
  const { createElement: h } = await import("react")
  return { default: () => h("nav", { id: "menu-stub" }) }
})
vi.mock("@/components/TimerScreen", async () => {
  const { createElement: h } = await import("react")
  return { default: () => h("main", { id: "timer-stub" }) }
})

import SignedInStub from "./SignedInStub"

// AB:TIMER.TESTS:START
let root: Root | null = null
let container: HTMLElement | null = null

function open(hash: string): void {
  window.location.hash = hash
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(createElement(SignedInStub, { email: "owner@example.com" })))
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  window.location.hash = ""
})

describe("SignedInStub: which screen is shown", () => {
  it("shows the Pro Timer screen at #timer, and not the placeholder or the background", () => {
    open("#timer")
    expect(has("#timer-stub")).toBe(true)
    expect(has(".ab-stub")).toBe(false)
    expect(has("#veil-stub")).toBe(false)
  })

  it("keeps the menu beside the Pro Timer screen, never inside it", () => {
    open("#timer")
    const menu = container?.querySelector("#menu-stub") ?? null
    expect(menu).not.toBeNull()
    expect(menu?.closest("main")).toBeNull()
    expect(container?.querySelectorAll("main").length).toBe(1)
  })

  it.each(["#overview", "#calendar", "#guide", "", "#nonsense"])("shows the placeholder with the menu beside it at %j", (hash) => {
    open(hash)
    expect(has(".ab-stub")).toBe(true)
    expect(has("#timer-stub")).toBe(false)
    expect(has("#veil-stub")).toBe(true)
    expect(container?.querySelector("#menu-stub")?.closest("main")).toBeNull()
  })

  it("follows the page address when the menu changes it", () => {
    open("#overview")
    expect(has("#timer-stub")).toBe(false)
    act(() => {
      window.location.hash = "#timer"
      window.dispatchEvent(new Event("hashchange"))
    })
    expect(has("#timer-stub")).toBe(true)
    act(() => {
      window.location.hash = "#guide"
      window.dispatchEvent(new Event("hashchange"))
    })
    expect(has("#timer-stub")).toBe(false)
    expect(container?.querySelector(".ab-stub-title")?.textContent).toBe("Guide")
  })
})
// AB:TIMER.TESTS:END
