// @vitest-environment jsdom
/// <reference types="node" />
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The lite level is read from the browser when the file is imported (matchMedia, which jsdom does not have), so it is replaced by a fixed level that a test can change.
const lite = vi.hoisted(() => ({ level: 0 }))
vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return lite.level
  },
}))

// The glass of the tags (the ReactBits part GlassSurface) needs matchMedia, CSS.supports and a layout, which jsdom does not have, so it is replaced by a stand-in that draws a plain div with the class, the size and the corner it is given. The real glass is only seen in a real browser.
vi.mock("@/components/GlassSurface", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: { className?: string; width?: number | string; height?: number | string; borderRadius?: number; children?: unknown }) =>
      h("div", { className: "glass-stub " + (props.className ?? ""), "data-width": String(props.width), "data-height": String(props.height), "data-radius": String(props.borderRadius) }, props.children as never),
  }
})

import type { TimerTag } from "@/lib/timerApi"
import TagPicker from "./TagPicker"

// AB:TIMER.TESTS:START
// The tag picker, version 2 (TagPicker.tsx, Packets 10C2 and 10F): the pill of the phone, the row of the wide screen (No tag, the four tags used most, the chosen tag when it is not one of them, and the All tags pill with its pen), the All tags list, the Edit tags view, where the focus goes, what the keys do, lite mode against the glass, and what the picker hands to the hook. The css is not read here (vitest turns an imported css file into nothing), so the pill, the row and the place are all in the page; the look is tested in TimerScreen.test.tsx. CONNECTIONS.md C56 and C57.
const WORK: TimerTag = { id: "t-work", name: "Work" }
const STUDY: TimerTag = { id: "t-study", name: "Study" }
const READ: TimerTag = { id: "t-read", name: "Reading" }
const CHESS: TimerTag = { id: "t-chess", name: "Chess" }
const GYM: TimerTag = { id: "t-gym", name: "Gym" }
const WRITE: TimerTag = { id: "t-write", name: "Writing" }
const SIX: TimerTag[] = [WORK, STUDY, READ, CHESS, GYM, WRITE]

let root: Root | null = null
let container: HTMLElement | null = null

type Props = Partial<Parameters<typeof TagPicker>[0]>
function show(over: Props = {}) {
  const props = { tags: [WORK, STUDY, READ], tagId: null, disabled: false, onChoose: vi.fn(), onOpen: vi.fn(), onAdd: vi.fn(async () => ({ ok: true as const })), ...over }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(TagPicker, props)))
  return props
}

function q(selector: string): HTMLElement {
  const found = container?.querySelector<HTMLElement>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
}

function all(selector: string): HTMLElement[] {
  return Array.from(container?.querySelectorAll<HTMLElement>(selector) ?? [])
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function texts(selector: string): (string | null)[] {
  return all(selector).map((element) => element.textContent)
}

function pressed(selector: string): (string | null)[] {
  return all(selector).map((element) => element.getAttribute("aria-pressed"))
}

function click(element: HTMLElement) {
  act(() => element.click())
}

function key(target: EventTarget, name: string, shift = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: name, shiftKey: shift, bubbles: true, cancelable: true })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

// A person who taps a button: the button has the focus first (a real browser gives it on a tap or a key), because the picker gives the focus back to what opened it.
function press(element: HTMLElement) {
  act(() => element.focus())
  click(element)
}

function openList() {
  press(q(".ab-tag-pill"))
}

function openAllTags() {
  press(q(".ab-tag-all"))
}

function openPen() {
  press(q(".ab-tag-pen"))
}

function typeInto(text: string) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  act(() => {
    set?.call(q(".ab-tag-input"), text)
    q(".ab-tag-input").dispatchEvent(new Event("input", { bubbles: true }))
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  lite.level = 0
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.restoreAllMocks()
})

describe("TagPicker: the pill of the phone", () => {
  it("shows No tag at first, as a button that opens a dialog and is closed", () => {
    show()
    const pill = q(".ab-tag-pill")
    expect(pill.tagName).toBe("BUTTON")
    expect(pill.getAttribute("type")).toBe("button")
    expect(pill.textContent).toBe("No tag")
    expect(pill.getAttribute("aria-label")).toBe("Tag: No tag")
    expect(pill.getAttribute("aria-haspopup")).toBe("dialog")
    expect(pill.getAttribute("aria-expanded")).toBe("false")
    expect((pill as HTMLButtonElement).disabled).toBe(false)
  })

  it("shows the name of the picked tag", () => {
    show({ tagId: STUDY.id })
    expect(q(".ab-tag-pill").textContent).toBe("Study")
    expect(q(".ab-tag-pill").getAttribute("aria-label")).toBe("Tag: Study")
  })

  it("shows No tag when the pick is not in the list (the list is the truth)", () => {
    show({ tagId: "t-gone" })
    expect(q(".ab-tag-pill").textContent).toBe("No tag")
  })

  it("shows a long name whole in the page (the css cuts it with an ellipsis) and a name with markup as plain text", () => {
    const long = "A very long tag name that does not fit into one pill of the screen at all"
    show({ tags: [{ id: "t-long", name: long }], tagId: "t-long" })
    expect(q(".ab-tag-pill-text").textContent).toBe(long)
    show({ tags: [{ id: "t-odd", name: "<b>bold</b>" }], tagId: "t-odd" })
    expect(q(".ab-tag-pill").textContent).toBe("<b>bold</b>")
    expect(has(".ab-tag-pill b")).toBe(false)
  })

  it("is a disabled button when the screen is not ready, and then does not open", () => {
    const props = show({ disabled: true })
    const pill = q(".ab-tag-pill") as HTMLButtonElement
    expect(pill.disabled).toBe(true)
    click(pill)
    expect(has(".ab-tag-layer")).toBe(false)
    expect(props.onOpen).not.toHaveBeenCalled()
  })

  it("draws a small arrow that is hidden from the screen reader", () => {
    show()
    expect(q(".ab-tag-chevron").getAttribute("aria-hidden")).toBe("true")
    expect(q(".ab-tag-chevron").textContent).toBe("")
  })

  it("opens the LIST on a tap, asks the hook to read the list once, and says it is open", () => {
    const props = show()
    openList()
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(q(".ab-tag-layer").getAttribute("data-view")).toBe("list")
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("true")
  })

  it("stands in one glass pill that is 44 px high and as wide as the buttons", () => {
    show()
    const glass = q(".ab-tag-phone .glass-stub")
    expect(glass.contains(q(".ab-tag-pill"))).toBe(true)
    expect(glass.getAttribute("data-width")).toBe("100%")
    expect(glass.getAttribute("data-height")).toBe("44")
    expect(glass.className).toContain("ab-tag-glass")
  })
})

describe("TagPicker: the row of the wide screen", () => {
  it("is one group with a name: No tag, then the tags in the order given, then the All tags pill with its pen", () => {
    show()
    const row = q(".ab-tag-chips")
    expect(row.getAttribute("role")).toBe("group")
    expect(row.getAttribute("aria-label")).toBe("Tag")
    expect(texts(".ab-tag-chip")).toEqual(["No tag", "Work", "Study", "Reading"])
    for (const chip of all(".ab-tag-chip")) {
      expect(chip.tagName).toBe("BUTTON")
      expect(chip.getAttribute("type")).toBe("button")
    }
    expect(q(".ab-tag-all").textContent).toBe("All tags")
    expect(q(".ab-tag-pen").getAttribute("aria-label")).toBe("Edit tags")
    expect(q(".ab-tag-pen").textContent).toBe("")
    expect(q(".ab-tag-pen").getAttribute("type")).toBe("button")
  })

  it("holds the words All tags and the pen in ONE pill, as the last pill of the row", () => {
    show()
    expect(q(".ab-tag-all").parentElement).toBe(q(".ab-tag-pen").parentElement)
    expect(q(".ab-tag-chips").lastElementChild).toBe(q(".ab-tag-all").parentElement)
  })

  it("shows only the first FOUR tags of the list, in the order the hook gave them", () => {
    show({ tags: SIX })
    expect(texts(".ab-tag-chip")).toEqual(["No tag", "Work", "Study", "Reading", "Chess"])
  })

  it("shows the tags there are when there are fewer than four, and only No tag and All tags when there are none", () => {
    show({ tags: [WORK] })
    expect(texts(".ab-tag-chip")).toEqual(["No tag", "Work"])
    show({ tags: [] })
    expect(texts(".ab-tag-chip")).toEqual(["No tag"])
    expect(has(".ab-tag-all")).toBe(true)
    expect(has(".ab-tag-pen")).toBe(true)
  })

  it("marks the chosen pill (aria-pressed) and only that one", () => {
    show({ tagId: STUDY.id })
    expect(pressed(".ab-tag-chip")).toEqual(["false", "false", "true", "false"])
    show({ tagId: null })
    expect(pressed(".ab-tag-chip")).toEqual(["true", "false", "false", "false"])
  })

  it("shows a chosen tag that is NOT one of the four as one more pressed pill after them, so that the row always shows the choice", () => {
    const props = show({ tags: SIX, tagId: GYM.id })
    expect(texts(".ab-tag-chip")).toEqual(["No tag", "Work", "Study", "Reading", "Chess", "Gym"])
    expect(pressed(".ab-tag-chip")).toEqual(["false", "false", "false", "false", "false", "true"])
    expect(q(".ab-tag-all").parentElement?.previousElementSibling?.textContent).toBe("Gym")
    click(all(".ab-tag-chip")[5])
    expect(props.onChoose).toHaveBeenCalledWith(GYM.id)
  })

  it("adds no extra pill when the chosen tag is one of the four, or when nothing is chosen, or when the pick is not in the list", () => {
    show({ tags: SIX, tagId: READ.id })
    expect(all(".ab-tag-chip")).toHaveLength(5)
    show({ tags: SIX, tagId: null })
    expect(all(".ab-tag-chip")).toHaveLength(5)
    show({ tags: SIX, tagId: "t-gone" })
    expect(all(".ab-tag-chip")).toHaveLength(5)
  })

  it("takes the extra pill away again when another tag is chosen", () => {
    show({ tags: SIX, tagId: WRITE.id })
    expect(texts(".ab-tag-chip")).toEqual(["No tag", "Work", "Study", "Reading", "Chess", "Writing"])
    show({ tags: SIX, tagId: WORK.id })
    expect(texts(".ab-tag-chip")).toEqual(["No tag", "Work", "Study", "Reading", "Chess"])
  })

  it("chooses a tag with one tap, and null for No tag, without opening anything or reading the list", () => {
    const props = show()
    click(all(".ab-tag-chip")[2])
    expect(props.onChoose).toHaveBeenLastCalledWith(STUDY.id)
    click(all(".ab-tag-chip")[0])
    expect(props.onChoose).toHaveBeenLastCalledWith(null)
    expect(props.onChoose).toHaveBeenCalledTimes(2)
    expect(props.onOpen).not.toHaveBeenCalled()
    expect(has(".ab-tag-layer")).toBe(false)
  })

  it("is disabled when the screen is not ready, as the pill is: every pill, All tags and the pen", () => {
    const props = show({ disabled: true })
    for (const button of all(".ab-tag-chip, .ab-tag-all, .ab-tag-pen")) {
      expect((button as HTMLButtonElement).disabled).toBe(true)
      click(button)
    }
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(props.onOpen).not.toHaveBeenCalled()
    expect(has(".ab-tag-layer")).toBe(false)
  })

  it("shows a name as text only", () => {
    show({ tags: [{ id: "t-odd", name: "<img src=x onerror=alert(1)>" }] })
    expect(all(".ab-tag-chip")[1].textContent).toBe("<img src=x onerror=alert(1)>")
    expect(has(".ab-tag-chips img")).toBe(false)
  })

  it("puts every pill of the row in its own glass pill, 44 px high and as wide as its words", () => {
    show({ tags: SIX })
    const buttons = all(".ab-tag-chips button")
    expect(buttons).toHaveLength(7)
    for (const button of buttons) {
      const glass = button.closest(".glass-stub")
      expect(glass, button.className).not.toBeNull()
      expect(glass?.getAttribute("data-height")).toBe("44")
      expect(glass?.getAttribute("data-width")).toBe("auto")
    }
    expect(all(".ab-tag-chips .glass-stub")).toHaveLength(6)
  })
})

describe("TagPicker: the All tags list", () => {
  it("is not in the page until it is opened", () => {
    show()
    expect(has(".ab-tag-layer")).toBe(false)
    expect(has(".ab-tag-panel")).toBe(false)
  })

  it("opens on a tap of All tags, asks the hook to read the list once, and is a modal dialog with the name All tags", () => {
    const props = show()
    openAllTags()
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(q(".ab-tag-layer").getAttribute("data-view")).toBe("list")
    const panel = q(".ab-tag-panel")
    expect(panel.getAttribute("role")).toBe("dialog")
    expect(panel.getAttribute("aria-modal")).toBe("true")
    expect(panel.getAttribute("aria-label")).toBe("All tags")
    expect(q(".ab-tag-title").textContent).toBe("All tags")
  })

  it("puts the focus on the panel, not on a row, so that a key still held can never choose a tag", () => {
    show()
    openList()
    expect(document.activeElement).toBe(q(".ab-tag-panel"))
    expect(q(".ab-tag-panel").getAttribute("tabindex")).toBe("-1")
  })

  it("lists No tag first and then EVERY tag in the order the hook gave them, as buttons (also the ones that are not among the four pills)", () => {
    show({ tags: SIX })
    openList()
    expect(texts(".ab-tag-row")).toEqual(["No tag", "Work", "Study", "Reading", "Chess", "Gym", "Writing"])
    for (const row of all(".ab-tag-row")) {
      expect(row.tagName).toBe("BUTTON")
      expect(row.getAttribute("type")).toBe("button")
    }
  })

  it("has the pen at the top of the list, in the head next to the title, with the name Edit tags", () => {
    show()
    openList()
    const head = q(".ab-tag-head")
    expect(head.firstElementChild).toBe(q(".ab-tag-title"))
    expect(head.lastElementChild).toBe(q(".ab-tag-edit-button"))
    expect(q(".ab-tag-edit-button").getAttribute("aria-label")).toBe("Edit tags")
    expect(q(".ab-tag-edit-button").getAttribute("type")).toBe("button")
    expect(q(".ab-tag-edit-button").getAttribute("aria-hidden")).toBeNull()
  })

  it("marks the chosen row (aria-pressed) and only that one", () => {
    show({ tagId: STUDY.id })
    openList()
    expect(pressed(".ab-tag-row")).toEqual(["false", "false", "true", "false"])
    show({ tagId: null })
    expect(pressed(".ab-tag-row")).toEqual(["true", "false", "false", "false"])
  })

  it("shows only No tag when the person has no tags yet", () => {
    show({ tags: [] })
    openList()
    expect(texts(".ab-tag-row")).toEqual(["No tag"])
  })

  it("chooses a tag with a tap on its row, closes, and puts the focus back on the pill that opened it", () => {
    const props = show()
    openList()
    click(all(".ab-tag-row")[2])
    expect(props.onChoose).toHaveBeenCalledTimes(1)
    expect(props.onChoose).toHaveBeenCalledWith(STUDY.id)
    expect(has(".ab-tag-layer")).toBe(false)
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("gives the focus back to All tags when All tags opened the list", () => {
    show()
    openAllTags()
    click(all(".ab-tag-row")[1])
    expect(has(".ab-tag-layer")).toBe(false)
    expect(document.activeElement).toBe(q(".ab-tag-all"))
  })

  it("lets a tag that is not one of the four be chosen from the list, and then shows it in the row", () => {
    const props = show({ tags: SIX })
    openAllTags()
    click(all(".ab-tag-row")[5])
    expect(props.onChoose).toHaveBeenCalledWith(GYM.id)
    show({ tags: SIX, tagId: GYM.id })
    expect(pressed(".ab-tag-chip")).toEqual(["false", "false", "false", "false", "false", "true"])
  })

  it("chooses no tag with the first row (the value is null, not an empty text)", () => {
    const props = show({ tagId: WORK.id })
    openList()
    click(all(".ab-tag-row")[0])
    expect(props.onChoose).toHaveBeenCalledWith(null)
  })

  it("closes without a change when the dim layer is tapped, which is hidden from the screen reader, and not when the panel is tapped", () => {
    const props = show({ tagId: WORK.id })
    openList()
    expect(q(".ab-tag-scrim").getAttribute("aria-hidden")).toBe("true")
    click(q(".ab-tag-panel"))
    click(q(".ab-tag-title"))
    expect(has(".ab-tag-layer")).toBe(true)
    click(q(".ab-tag-scrim"))
    expect(has(".ab-tag-layer")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("closes without a change on Escape, and the focus goes back to what opened it", () => {
    const props = show()
    openList()
    key(document, "Escape")
    expect(has(".ab-tag-layer")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("ignores Escape while it is closed (the focus stays where it was)", () => {
    show()
    const outside = document.createElement("input")
    document.body.appendChild(outside)
    outside.focus()
    key(document, "Escape")
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it("ignores other keys while open", () => {
    show()
    openList()
    key(document, "a")
    key(document, "Enter")
    expect(has(".ab-tag-layer")).toBe(true)
  })

  it("takes its key listener off the document when it closes and when it is unmounted while open", () => {
    const removed = vi.spyOn(document, "removeEventListener")
    show()
    openList()
    key(document, "Escape")
    expect(removed.mock.calls.filter((c) => c[0] === "keydown").length).toBeGreaterThanOrEqual(1)
    removed.mockClear()
    openList()
    act(() => root?.unmount())
    root = null
    expect(removed.mock.calls.filter((c) => c[0] === "keydown").length).toBeGreaterThanOrEqual(1)
  })

  it("keeps Tab inside the panel: from the last stop to the first one (the pen), and Shift+Tab from the first stop (or the panel) to the last", () => {
    show()
    openList()
    const stops = all(".ab-tag-panel button")
    expect(stops.map((s) => s.className)).toEqual(["ab-tag-edit-button", "ab-tag-row", "ab-tag-row", "ab-tag-row", "ab-tag-row"])
    const first = stops[0]
    const last = stops[stops.length - 1]
    last.focus()
    const forward = key(last, "Tab")
    expect(forward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(first)
    const back = key(first, "Tab", true)
    expect(back.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)
    q(".ab-tag-panel").focus()
    const fromPanel = key(q(".ab-tag-panel"), "Tab", true)
    expect(fromPanel.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)
  })

  it("lets Tab go on by itself everywhere else in the panel", () => {
    show()
    openList()
    const rows = all(".ab-tag-row")
    rows[1].focus()
    expect(key(rows[1], "Tab").defaultPrevented).toBe(false)
    expect(key(rows[1], "Tab", true).defaultPrevented).toBe(false)
    expect(key(rows[1], "Enter").defaultPrevented).toBe(false)
  })

  it("shows a list that the hook changes while it is open (the list is read again when it opens)", () => {
    show({ tags: [WORK] })
    openList()
    expect(texts(".ab-tag-row")).toEqual(["No tag", "Work"])
    show({ tags: [WORK, STUDY] })
    expect(texts(".ab-tag-row")).toEqual(["No tag", "Work", "Study"])
  })

  it("renders a name as text only in the rows too", () => {
    show({ tags: [{ id: "t-odd", name: "<img src=x onerror=alert(1)>" }] })
    openList()
    expect(all(".ab-tag-row")[1].textContent).toBe("<img src=x onerror=alert(1)>")
    expect(has(".ab-tag-panel img")).toBe(false)
  })

  it("draws the panel inside one glass panel as wide as the place and as high as its content", () => {
    show()
    openList()
    const glass = q(".ab-tag-place > .glass-stub")
    expect(glass.contains(q(".ab-tag-panel"))).toBe(true)
    expect(glass.getAttribute("data-width")).toBe("100%")
    expect(glass.getAttribute("data-height")).toBe("auto")
    expect(glass.className).toContain("ab-tag-glass-panel")
  })
})

describe("TagPicker: the Edit tags view", () => {
  it("opens straight from the pen of the All tags pill, without showing the list first: a modal dialog with the name Edit tags", () => {
    const props = show()
    openPen()
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(q(".ab-tag-layer").getAttribute("data-view")).toBe("edit")
    expect(q(".ab-tag-panel").getAttribute("role")).toBe("dialog")
    expect(q(".ab-tag-panel").getAttribute("aria-modal")).toBe("true")
    expect(q(".ab-tag-panel").getAttribute("aria-label")).toBe("Edit tags")
    expect(has(".ab-tag-edit")).toBe(true)
    expect(has(".ab-tag-row")).toBe(false)
    expect(q(".ab-tag-title").textContent).toBe("Edit tags")
  })

  it("puts the focus in the field when the pen of the pill opens it", () => {
    show()
    openPen()
    expect(document.activeElement).toBe(q(".ab-tag-input"))
  })

  it("switches from the list to the editing view with the pen at the top of the list, without reading the list a second time, and puts the focus in the field", () => {
    const props = show()
    openList()
    click(q(".ab-tag-edit-button"))
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(q(".ab-tag-layer").getAttribute("data-view")).toBe("edit")
    expect(has(".ab-tag-row")).toBe(false)
    expect(q(".ab-tag-panel").getAttribute("aria-label")).toBe("Edit tags")
    expect(document.activeElement).toBe(q(".ab-tag-input"))
  })

  it("shows the person's tags in the editing view as plain rows in the order of the hook (all of them), and follows the list while it is open", () => {
    show({ tags: SIX })
    openPen()
    expect(texts(".ab-tag-have-row")).toEqual(["Work", "Study", "Reading", "Chess", "Gym", "Writing"])
    expect(has(".ab-tag-have button")).toBe(false)
    show({ tags: [WORK] })
    expect(texts(".ab-tag-have-row")).toEqual(["Work"])
  })

  it("says Back on the button, and Back goes back to the list: the editing view is gone, the panel has the focus, nothing was chosen, the picker stays open", () => {
    const props = show()
    openList()
    click(q(".ab-tag-edit-button"))
    expect(q(".ab-tag-back").textContent).toBe("Back")
    click(q(".ab-tag-back"))
    expect(has(".ab-tag-edit")).toBe(false)
    expect(q(".ab-tag-layer").getAttribute("data-view")).toBe("list")
    expect(texts(".ab-tag-row")).toEqual(["No tag", "Work", "Study", "Reading"])
    expect(document.activeElement).toBe(q(".ab-tag-panel"))
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("goes back to the list also when the pen of the pill opened the editing view (Back always goes to the list)", () => {
    show()
    openPen()
    click(q(".ab-tag-back"))
    expect(q(".ab-tag-layer").getAttribute("data-view")).toBe("list")
    expect(texts(".ab-tag-row")).toEqual(["No tag", "Work", "Study", "Reading"])
    expect(document.activeElement).toBe(q(".ab-tag-panel"))
  })

  it("closes the WHOLE picker on Escape from the editing view, without a change, and the focus goes back to what opened it", () => {
    const props = show()
    openPen()
    key(q(".ab-tag-input"), "Escape")
    expect(has(".ab-tag-layer")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pen"))
  })

  it("closes the WHOLE picker on a tap of the dim layer of the editing view, without a change", () => {
    const props = show()
    openPen()
    click(q(".ab-tag-scrim"))
    expect(has(".ab-tag-layer")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("opens at the LIST again when the pill is used after the editing view was closed", () => {
    show()
    openPen()
    key(document, "Escape")
    openList()
    expect(q(".ab-tag-layer").getAttribute("data-view")).toBe("list")
    expect(has(".ab-tag-edit")).toBe(false)
  })

  it("hands the editing view the call that adds a tag: the name goes to it as typed, and the answer never chooses a tag", async () => {
    const props = show()
    openPen()
    typeInto("  Gym ")
    await act(async () => {
      q(".ab-tag-add-button").click()
    })
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    expect(props.onAdd).toHaveBeenCalledWith("  Gym ")
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("marks no new tag as chosen: after the hook gives a longer list, only No tag is pressed in the row and in the list", () => {
    show({ tags: [WORK] })
    show({ tags: [WORK, STUDY] })
    expect(pressed(".ab-tag-chip")).toEqual(["true", "false", "false"])
    openList()
    expect(pressed(".ab-tag-row")).toEqual(["true", "false", "false"])
  })

  it("keeps Tab inside the editing view: from Add to Back, and Shift+Tab from Back (or the panel) to Add", () => {
    show()
    openPen()
    const stops = all(".ab-tag-panel button, .ab-tag-panel input")
    expect(stops.map((s) => s.className)).toEqual(["ab-tag-back", "ab-tag-input", "ab-tag-add-button"])
    stops[2].focus()
    expect(key(stops[2], "Tab").defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(stops[0])
    expect(key(stops[0], "Tab", true).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(stops[2])
    q(".ab-tag-panel").focus()
    expect(key(q(".ab-tag-panel"), "Tab", true).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(stops[2])
  })

  it("is off with the rest of the picker when the screen is not ready: the pen does not open it", () => {
    const props = show({ disabled: true })
    click(q(".ab-tag-pen"))
    expect(has(".ab-tag-layer")).toBe(false)
    expect(props.onOpen).not.toHaveBeenCalled()
  })
})

describe("TagPicker: the glass and lite mode", () => {
  it("draws glass and no plain box at lite level 0 (a laptop), also in the place", () => {
    show()
    expect(all(".glass-stub")).toHaveLength(6)
    expect(has(".ab-tag-solid")).toBe(false)
    openList()
    expect(all(".glass-stub")).toHaveLength(7)
    expect(has(".ab-tag-solid")).toBe(false)
  })

  it("gives every glass the corner of its kind from the one GLASS object: 22 px for a pill and for the panel", () => {
    show()
    openList()
    for (const glass of all(".glass-stub")) expect(glass.getAttribute("data-radius")).toBe("22")
  })

  it("draws NO glass at lite level 1 or 2 (a touch screen): a plain dark box of the same size and corner stands in its place, in the pills and in the place", () => {
    for (const level of [1, 2]) {
      lite.level = level
      show()
      expect(has(".glass-stub"), "level " + level).toBe(false)
      const boxes = all(".ab-tag-solid")
      expect(boxes, "level " + level).toHaveLength(6)
      expect(boxes[0].getAttribute("data-kind")).toBe("pill")
      expect(boxes[0].style.width).toBe("100%")
      expect(boxes[0].style.height).toBe("44px")
      expect(boxes[0].style.borderRadius).toBe("22px")
      expect(boxes[0].contains(q(".ab-tag-pill"))).toBe(true)
      expect(boxes[1].style.width).toBe("auto")
      openList()
      expect(has(".glass-stub"), "level " + level).toBe(false)
      const panel = q(".ab-tag-place > .ab-tag-solid")
      expect(panel.getAttribute("data-kind")).toBe("panel")
      expect(panel.style.width).toBe("100%")
      expect(panel.style.height).toBe("auto")
      expect(panel.contains(q(".ab-tag-panel"))).toBe(true)
      key(document, "Escape")
    }
  })

  it("works the same in lite mode: the pill opens the list, a row chooses, the pen opens the editing view", () => {
    lite.level = 1
    const props = show()
    openList()
    expect(texts(".ab-tag-row")).toEqual(["No tag", "Work", "Study", "Reading"])
    click(all(".ab-tag-row")[1])
    expect(props.onChoose).toHaveBeenCalledWith(WORK.id)
    openPen()
    expect(has(".ab-tag-edit")).toBe(true)
  })

  it("follows the lite level the next time it is drawn (the level is read when the picker is drawn, not once)", () => {
    show()
    expect(has(".glass-stub")).toBe(true)
    lite.level = 1
    show()
    expect(has(".glass-stub")).toBe(false)
    expect(has(".ab-tag-solid")).toBe(true)
  })
})
// AB:TIMER.TESTS:END
