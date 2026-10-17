// @vitest-environment jsdom
/// <reference types="node" />
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { TimerTag } from "@/lib/timerApi"
import TagPicker from "./TagPicker"

// AB:TIMER.TESTS:START
// The tag picker (TagPicker.tsx, Packet 10C2): what it shows, how the sheet opens and closes, where the focus goes, and what it hands to the hook. The css is not read here (vitest turns an imported css file into nothing), so the pill, the chips and the sheet are all in the page; the look is tested in TimerScreen.test.tsx. CONNECTIONS.md C56.
const WORK: TimerTag = { id: "t-work", name: "Work" }
const STUDY: TimerTag = { id: "t-study", name: "Study" }
const READ: TimerTag = { id: "t-read", name: "Reading" }

let root: Root | null = null
let container: HTMLElement | null = null

type Props = Partial<Parameters<typeof TagPicker>[0]>
function show(over: Props = {}) {
  const props = { tags: [WORK, STUDY, READ], tagId: null, disabled: false, onChoose: vi.fn(), onOpen: vi.fn(), ...over }
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

function openSheet() {
  click(q(".ab-tag-pill"))
}

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

describe("TagPicker: the pill", () => {
  it("shows No tag at first, as a button that opens a dialog and is closed", () => {
    show()
    const pill = q(".ab-tag-pill")
    expect(pill.tagName).toBe("BUTTON")
    expect(pill.getAttribute("type")).toBe("button")
    expect(pill.textContent).toBe("No tag")
    expect(pill.getAttribute("aria-label")).toBe("Tag: No tag")
    expect(pill.getAttribute("aria-haspopup")).toBe("dialog")
    expect(pill.getAttribute("aria-expanded")).toBe("false")
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
    const long = "A".repeat(20)
    const odd: TimerTag = { id: "t-odd", name: "<b>bold</b> & <i>x</i>" }
    show({ tags: [{ id: "t-long", name: long }, odd], tagId: "t-long" })
    expect(q(".ab-tag-pill-text").textContent).toBe(long)
    show({ tags: [{ id: "t-long", name: long }, odd], tagId: odd.id })
    expect(q(".ab-tag-pill-text").textContent).toBe("<b>bold</b> & <i>x</i>")
    expect(has(".ab-tag-picker b")).toBe(false)
    expect(has(".ab-tag-picker i")).toBe(false)
  })

  it("is a disabled button when the screen is not ready, and then does not open", () => {
    const props = show({ disabled: true })
    const pill = q(".ab-tag-pill") as HTMLButtonElement
    expect(pill.disabled).toBe(true)
    click(pill)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(props.onOpen).not.toHaveBeenCalled()
  })

  it("draws a small arrow that is hidden from the screen reader", () => {
    show()
    expect(q(".ab-tag-chevron").getAttribute("aria-hidden")).toBe("true")
  })
})

describe("TagPicker: the sheet", () => {
  it("is not in the page until the pill is tapped", () => {
    show()
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(has(".ab-tag-panel")).toBe(false)
  })

  it("opens on a tap of the pill, asks the hook to read the list once, and is a modal dialog with a name", () => {
    const props = show()
    openSheet()
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(has(".ab-tag-sheet")).toBe(true)
    const panel = q(".ab-tag-panel")
    expect(panel.getAttribute("role")).toBe("dialog")
    expect(panel.getAttribute("aria-modal")).toBe("true")
    expect(panel.getAttribute("aria-label")).toBe("Choose a tag")
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("true")
  })

  it("puts the focus on the panel, not on a row, so that a key still held can never choose a tag", () => {
    show()
    openSheet()
    expect(document.activeElement).toBe(q(".ab-tag-panel"))
    expect(q(".ab-tag-panel").getAttribute("tabindex")).toBe("-1")
  })

  it("lists No tag first and then the tags in the order the hook gave them, as buttons", () => {
    show()
    openSheet()
    const rows = all(".ab-tag-row")
    expect(rows.map((r) => r.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
    for (const row of rows) {
      expect(row.tagName).toBe("BUTTON")
      expect(row.getAttribute("type")).toBe("button")
    }
  })

  it("marks the chosen row (aria-pressed) and only that one", () => {
    show({ tagId: STUDY.id })
    openSheet()
    expect(all(".ab-tag-row").map((r) => r.getAttribute("aria-pressed"))).toEqual(["false", "false", "true", "false"])
    show({ tagId: null })
    expect(all(".ab-tag-row").map((r) => r.getAttribute("aria-pressed"))).toEqual(["true", "false", "false", "false"])
  })

  it("shows only No tag when the person has no tags yet (nothing can be added before Packet 10D)", () => {
    show({ tags: [] })
    openSheet()
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag"])
  })

  it("chooses a tag with a tap on its row, closes, and puts the focus back on the pill", () => {
    const props = show()
    openSheet()
    click(all(".ab-tag-row")[2])
    expect(props.onChoose).toHaveBeenCalledTimes(1)
    expect(props.onChoose).toHaveBeenCalledWith(STUDY.id)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("chooses no tag with the first row (the value is null, not an empty text)", () => {
    const props = show({ tagId: WORK.id })
    openSheet()
    click(all(".ab-tag-row")[0])
    expect(props.onChoose).toHaveBeenCalledWith(null)
  })

  it("closes without a change when the dim layer is tapped", () => {
    const props = show({ tagId: WORK.id })
    openSheet()
    click(q(".ab-tag-scrim"))
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("closes without a change on Escape, and the focus goes back to the pill", () => {
    const props = show()
    openSheet()
    key(document, "Escape")
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("ignores Escape while the sheet is closed (the focus stays where it was)", () => {
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
    openSheet()
    key(document, "a")
    key(document, "Enter")
    expect(has(".ab-tag-sheet")).toBe(true)
  })

  it("takes its key listener off the document when it closes and when it is unmounted while open", () => {
    const removed = vi.spyOn(document, "removeEventListener")
    show()
    openSheet()
    key(document, "Escape")
    expect(removed.mock.calls.filter((c) => c[0] === "keydown").length).toBeGreaterThanOrEqual(1)
    removed.mockClear()
    openSheet()
    act(() => root?.unmount())
    root = null
    expect(removed.mock.calls.filter((c) => c[0] === "keydown").length).toBeGreaterThanOrEqual(1)
  })

  it("keeps Tab inside the panel: from the last row to the first one, and Shift+Tab from the first row (or the panel) to the last", () => {
    show()
    openSheet()
    const rows = all(".ab-tag-row")
    rows[rows.length - 1].focus()
    const forward = key(rows[rows.length - 1], "Tab")
    expect(forward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(rows[0])
    const back = key(rows[0], "Tab", true)
    expect(back.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(rows[rows.length - 1])
    q(".ab-tag-panel").focus()
    const fromPanel = key(q(".ab-tag-panel"), "Tab", true)
    expect(fromPanel.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(rows[rows.length - 1])
  })

  it("lets Tab go on by itself everywhere else in the panel", () => {
    show()
    openSheet()
    const rows = all(".ab-tag-row")
    rows[1].focus()
    expect(key(rows[1], "Tab").defaultPrevented).toBe(false)
    expect(key(rows[1], "Tab", true).defaultPrevented).toBe(false)
    expect(key(rows[1], "Enter").defaultPrevented).toBe(false)
  })

  it("shows a list that the hook changes while it is open (the list is read again when it opens)", () => {
    show({ tags: [WORK] })
    openSheet()
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag", "Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag", "Work", "Study"])
  })

  it("renders a name as text only in the rows too", () => {
    show({ tags: [{ id: "t-odd", name: "<img src=x onerror=alert(1)>" }] })
    openSheet()
    expect(all(".ab-tag-row")[1].textContent).toBe("<img src=x onerror=alert(1)>")
    expect(has(".ab-tag-panel img")).toBe(false)
  })
})

describe("TagPicker: the chips of the wide screen", () => {
  it("are one group with a name, No tag first and then the tags in order, as buttons", () => {
    show()
    const group = q(".ab-tag-chips")
    expect(group.getAttribute("role")).toBe("group")
    expect(group.getAttribute("aria-label")).toBe("Tag")
    const chips = all(".ab-tag-chip")
    expect(chips.map((c) => c.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
    for (const chip of chips) expect(chip.getAttribute("type")).toBe("button")
  })

  it("mark the chosen chip (aria-pressed) and only that one", () => {
    show({ tagId: READ.id })
    expect(all(".ab-tag-chip").map((c) => c.getAttribute("aria-pressed"))).toEqual(["false", "false", "false", "true"])
    show({ tagId: null })
    expect(all(".ab-tag-chip").map((c) => c.getAttribute("aria-pressed"))).toEqual(["true", "false", "false", "false"])
  })

  it("choose a tag with one tap, and null for No tag, without opening anything or reading the list", () => {
    const props = show()
    click(all(".ab-tag-chip")[1])
    expect(props.onChoose).toHaveBeenLastCalledWith(WORK.id)
    click(all(".ab-tag-chip")[0])
    expect(props.onChoose).toHaveBeenLastCalledWith(null)
    expect(props.onChoose).toHaveBeenCalledTimes(2)
    expect(props.onOpen).not.toHaveBeenCalled()
    expect(has(".ab-tag-sheet")).toBe(false)
  })

  it("are disabled when the screen is not ready, as the pill is", () => {
    const props = show({ disabled: true })
    for (const chip of all(".ab-tag-chip")) expect((chip as HTMLButtonElement).disabled).toBe(true)
    click(all(".ab-tag-chip")[1])
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("show a name as text only", () => {
    show({ tags: [{ id: "t-odd", name: "<u>x</u>" }] })
    expect(all(".ab-tag-chip")[1].textContent).toBe("<u>x</u>")
    expect(has(".ab-tag-chips u")).toBe(false)
  })
})
// AB:TIMER.TESTS:END
