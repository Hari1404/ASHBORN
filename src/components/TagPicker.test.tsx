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

  it("shows only No tag and the Manage tags row when the person has no tags yet", () => {
    show({ tags: [] })
    openSheet()
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag"])
    expect(q(".ab-tag-panel").lastElementChild).toBe(q(".ab-tag-more"))
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

  it("keeps Tab inside the panel: from the last stop (the Manage tags row) to the first one, and Shift+Tab from the first row (or the panel) to the last stop", () => {
    show()
    openSheet()
    const rows = all(".ab-tag-row")
    rows.push(q(".ab-tag-more"))
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
// The helpers of the Manage tags tests (Packet 10D): a person types into the field of the box, and presses Add (the answer of onAdd is waited for).
function typeInto(input: HTMLElement, text: string) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  act(() => {
    set?.call(input, text)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

async function pressAdd() {
  await act(async () => {
    q(".ab-tag-add-button").click()
  })
}

function openManageRow() {
  openSheet()
  click(q(".ab-tag-more"))
}

describe("TagPicker: the Manage tags row and the box (Packet 10D)", () => {
  it("ends the list of the phone with a Manage tags row that is a button of its own and no tag row", () => {
    const props = show()
    openSheet()
    const row = q(".ab-tag-more")
    expect(row.tagName).toBe("BUTTON")
    expect(row.getAttribute("type")).toBe("button")
    expect(row.textContent).toBe("Manage tags")
    expect(q(".ab-tag-panel").lastElementChild).toBe(row)
    expect(row.classList.contains("ab-tag-row")).toBe(false)
    expect(all(".ab-tag-row")).toHaveLength(4)
    click(row)
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("opens the box IN PLACE OF the list: the list is gone, the box is a modal dialog with a name, and the picker stays open", () => {
    const props = show()
    openManageRow()
    expect(has(".ab-tag-panel")).toBe(false)
    expect(has(".ab-tag-sheet")).toBe(false)
    const box = q(".ab-tag-box")
    expect(box.getAttribute("role")).toBe("dialog")
    expect(box.getAttribute("aria-modal")).toBe("true")
    expect(box.getAttribute("aria-label")).toBe("Manage tags")
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("true")
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("does not read the list a second time when the row opens the box (the list was read when it opened)", () => {
    const props = show()
    openManageRow()
    expect(props.onOpen).toHaveBeenCalledTimes(1)
  })

  it("puts the focus in the field of the box", () => {
    show()
    openManageRow()
    expect(document.activeElement).toBe(q(".ab-tag-input"))
  })

  it("shows the person's tags in the box as plain rows in the order of the hook, and follows the list while the box is open", () => {
    show({ tags: [WORK] })
    openManageRow()
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
    expect(has(".ab-tag-have button")).toBe(false)
  })

  it("says Back on the button, and Back goes back to the list: the box is gone, the panel has the focus, nothing was chosen, the picker stays open", () => {
    const props = show()
    openManageRow()
    expect(q(".ab-tag-back").textContent).toBe("Back")
    click(q(".ab-tag-back"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(all(".ab-tag-row").map((r) => r.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
    expect(document.activeElement).toBe(q(".ab-tag-panel"))
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("true")
  })

  it("closes the WHOLE picker on Escape from the box, without a change, and the focus goes back to the pill", () => {
    const props = show()
    openManageRow()
    key(document, "Escape")
    expect(has(".ab-tag-box")).toBe(false)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(q(".ab-tag-pill").getAttribute("aria-expanded")).toBe("false")
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("closes the WHOLE picker on a tap of the dim layer of the box, without a change", () => {
    const props = show()
    openManageRow()
    click(q(".ab-tag-dialog .ab-tag-scrim"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-pill"))
  })

  it("opens at the LIST again after the box was closed", () => {
    show()
    openManageRow()
    key(document, "Escape")
    openSheet()
    expect(has(".ab-tag-panel")).toBe(true)
    expect(has(".ab-tag-box")).toBe(false)
  })

  it("hands the box the call that adds a tag: the name goes to it as typed, and the answer never chooses a tag", async () => {
    const onAdd = vi.fn(async () => ({ ok: true as const }))
    const props = show({ onAdd })
    openManageRow()
    typeInto(q(".ab-tag-input"), "  Gym ")
    await pressAdd()
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith("  Gym ")
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(has(".ab-tag-box")).toBe(true)
    expect(q(".ab-tag-pill").textContent).toBe("No tag")
  })

  it("marks no new tag as chosen: after the hook gives a longer list, only No tag is pressed in the list", () => {
    show({ tags: [WORK] })
    openManageRow()
    show({ tags: [WORK, STUDY] })
    click(q(".ab-tag-back"))
    expect(all(".ab-tag-row").map((r) => r.getAttribute("aria-pressed"))).toEqual(["true", "false", "false"])
    expect(q(".ab-tag-pill").textContent).toBe("No tag")
  })
})

describe("TagPicker: the Manage tags chip of the wide screen (Packet 10D)", () => {
  it("is one button on its own right after the group of chips, no chip of the group, and the chips are as before", () => {
    show()
    const chip = q(".ab-tag-more-chip")
    expect(chip.tagName).toBe("BUTTON")
    expect(chip.getAttribute("type")).toBe("button")
    expect(chip.getAttribute("aria-haspopup")).toBe("dialog")
    expect(chip.textContent).toBe("Manage tags")
    expect(q(".ab-tag-chips").nextElementSibling).toBe(chip)
    expect(q(".ab-tag-chips").contains(chip)).toBe(false)
    expect(all(".ab-tag-chip").map((c) => c.textContent)).toEqual(["No tag", "Work", "Study", "Reading"])
  })

  it("opens the box without the list, reads the list once, puts the focus in the field, and the button says Done", () => {
    const props = show()
    click(q(".ab-tag-more-chip"))
    expect(props.onOpen).toHaveBeenCalledTimes(1)
    expect(has(".ab-tag-box")).toBe(true)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(q(".ab-tag-back").textContent).toBe("Done")
    expect(document.activeElement).toBe(q(".ab-tag-input"))
    expect(props.onChoose).not.toHaveBeenCalled()
  })

  it("closes the picker on Done and gives the focus back to the chip", () => {
    show()
    click(q(".ab-tag-more-chip"))
    click(q(".ab-tag-back"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(has(".ab-tag-sheet")).toBe(false)
    expect(document.activeElement).toBe(q(".ab-tag-more-chip"))
  })

  it("closes the picker on Escape and gives the focus back to the chip", () => {
    const props = show()
    click(q(".ab-tag-more-chip"))
    key(document, "Escape")
    expect(has(".ab-tag-box")).toBe(false)
    expect(props.onChoose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(q(".ab-tag-more-chip"))
  })

  it("closes the picker on a tap of the dim layer and gives the focus back to the chip", () => {
    show()
    click(q(".ab-tag-more-chip"))
    click(q(".ab-tag-dialog .ab-tag-scrim"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(document.activeElement).toBe(q(".ab-tag-more-chip"))
  })

  it("is disabled when the screen is not ready, as the pill and the chips are, and then does not open", () => {
    const props = show({ disabled: true })
    expect((q(".ab-tag-more-chip") as HTMLButtonElement).disabled).toBe(true)
    click(q(".ab-tag-more-chip"))
    expect(has(".ab-tag-box")).toBe(false)
    expect(props.onOpen).not.toHaveBeenCalled()
  })

  it("leaves nothing of the chip way behind: the pill opens the LIST afterwards, and its box says Back again", () => {
    show()
    click(q(".ab-tag-more-chip"))
    click(q(".ab-tag-back"))
    openSheet()
    expect(has(".ab-tag-panel")).toBe(true)
    expect(has(".ab-tag-box")).toBe(false)
    click(q(".ab-tag-more"))
    expect(q(".ab-tag-back").textContent).toBe("Back")
  })

  it("shows the person's tags and a longer list in the box it opens", () => {
    show({ tags: [WORK] })
    click(q(".ab-tag-more-chip"))
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
  })
})
// AB:TIMER.TESTS:END
