// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult, TagEditResult } from "@/lib/useTimer"
import TagManage from "./TagManage"

// AB:TIMER.TESTS:START
// The editing box (TagManage.tsx, Packet 10D; Packet 10F made it the inside of the Edit tags view of the picker): what it shows, what Add and Enter hand to the hook, what happens while the call runs and after its answer, where the focus goes, and what Back and the keys do. Packet 10G added the rows: Rename and Remove on every row, the field of a rename, the question about removing, one open row at a time, the error inside the row, the Escape that cancels only the open row. The dim layer, the panel, Escape and the Tab rule belong to TagPicker.tsx and are tested in TagPicker.test.tsx. The css is not read here (TimerScreen.test.tsx reads it). A made-up call stands in for the hook, and a made-up answer can be held back until the test lets it go.
const WORK: TimerTag = { id: "t-work", name: "Work" }
const STUDY: TimerTag = { id: "t-study", name: "Study" }

let root: Root | null = null
let container: HTMLElement | null = null

type Props = Partial<Parameters<typeof TagManage>[0]>
function show(over: Props = {}) {
  const props = {
    tags: [WORK, STUDY],
    onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: true })),
    onRename: vi.fn(async (): Promise<TagEditResult> => ({ ok: true })),
    onRemove: vi.fn(async (): Promise<TagEditResult> => ({ ok: true })),
    onBack: vi.fn(),
    ...over,
  }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(TagManage, props)))
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

function field(): HTMLInputElement {
  return q(".ab-tag-input") as HTMLInputElement
}

function addButton(): HTMLButtonElement {
  return q(".ab-tag-add-button") as HTMLButtonElement
}

// A person types: the value is set the way the browser sets it and the input event is sent, so that React sees it.
function typeInto(text: string) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  act(() => {
    set?.call(field(), text)
    field().dispatchEvent(new Event("input", { bubbles: true }))
  })
}

async function pressAdd() {
  await act(async () => {
    addButton().click()
  })
}

// The rows of the list (Packet 10G). A row that is open has no name span any more, so rows are found by their place in the list.
function rows(): HTMLElement[] {
  return all(".ab-tag-have-row")
}

function modes(): (string | null)[] {
  return rows().map((row) => row.getAttribute("data-mode"))
}

// An element that has an aria-label, found by the label (the Rename and Remove buttons and the field of a rename).
function labelled(label: string): HTMLElement {
  const found = Array.from(container?.querySelectorAll<HTMLElement>("[aria-label]") ?? []).find((element) => element.getAttribute("aria-label") === label)
  if (found === undefined) throw new Error("nothing is labelled: " + label)
  return found
}

function inRow(row: HTMLElement, text: string): HTMLButtonElement {
  const found = Array.from(row.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent === text)
  if (found === undefined) throw new Error("no button " + text + " in the row")
  return found
}

function rowField(): HTMLInputElement {
  return q(".ab-tag-row-input") as HTMLInputElement
}

function typeIntoRow(text: string) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  act(() => {
    set?.call(rowField(), text)
    rowField().dispatchEvent(new Event("input", { bubbles: true }))
  })
}

async function pressIn(element: HTMLElement) {
  await act(async () => {
    element.click()
  })
}

// Every stop of the Tab order inside the box, as the screen reader names it.
function stops(): string[] {
  return all(".ab-tag-edit button, .ab-tag-edit input").map((stop) => stop.getAttribute("aria-label") ?? stop.textContent ?? "")
}

function key(target: EventTarget, name: string, shift = false, composing = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: name, shiftKey: shift, isComposing: composing, bubbles: true, cancelable: true })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

// An answer of onAdd that does not come until the test says so.
function held(): { promise: Promise<AddTagResult>; answer: (result: AddTagResult) => void } {
  let answer: (result: AddTagResult) => void = () => {}
  const promise = new Promise<AddTagResult>((resolve) => {
    answer = resolve
  })
  return { promise, answer: (result) => answer(result) }
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

describe("TagManage: what it shows", () => {
  it("is the inside of the Edit tags view: a title, a Back button, a field and an Add button, and NO dialog of its own (the panel of the picker is the dialog)", () => {
    show()
    expect(q(".ab-tag-edit").parentElement).toBe(container)
    expect(has("[role=dialog]")).toBe(false)
    expect(q(".ab-tag-title").textContent).toBe("Edit tags")
    expect(q(".ab-tag-head").contains(q(".ab-tag-back"))).toBe(true)
    expect(q(".ab-tag-back").textContent).toBe("Back")
    expect(q(".ab-tag-back").getAttribute("type")).toBe("button")
    expect(addButton().textContent).toBe("Add")
    expect(addButton().getAttribute("type")).toBe("button")
    expect(addButton().disabled).toBe(false)
  })

  it("has a text field with a name for the screen reader, the placeholder New tag, no autocomplete, no spell check and NO limit of its own", () => {
    show()
    expect(field().getAttribute("type")).toBe("text")
    expect(field().getAttribute("aria-label")).toBe("New tag name")
    expect(field().getAttribute("placeholder")).toBe("New tag")
    expect(field().getAttribute("autocomplete")).toBe("off")
    expect(field().getAttribute("spellcheck")).toBe("false")
    expect(field().hasAttribute("maxlength")).toBe(false)
    expect(field().hasAttribute("minlength")).toBe(false)
    expect(field().value).toBe("")
    expect(field().readOnly).toBe(false)
  })

  it("puts the focus in the field when it opens", () => {
    show()
    expect(document.activeElement).toBe(field())
  })

  it("shows no error line at first", () => {
    show()
    expect(has(".ab-tag-error")).toBe(false)
    expect(has("[role=alert]")).toBe(false)
  })

  it("shows the tags as rows in the order it was given (each with its name and two buttons, Rename and Remove), and you have no tags yet when there are none", () => {
    show()
    expect(q(".ab-tag-have").getAttribute("aria-label")).toBe("Your tags")
    expect(all(".ab-tag-have-name").map((r) => r.textContent)).toEqual(["Work", "Study"])
    expect(rows().map((r) => r.textContent)).toEqual(["WorkRenameRemove", "StudyRenameRemove"])
    expect(all(".ab-tag-have-row button")).toHaveLength(4)
    expect(has(".ab-tag-have-empty")).toBe(false)
    show({ tags: [] })
    expect(has(".ab-tag-have")).toBe(false)
    expect(q(".ab-tag-have-empty").textContent).toBe("You have no tags yet.")
  })

  it("follows the list when the hook gives a longer one", () => {
    show({ tags: [] })
    expect(has(".ab-tag-have-row")).toBe(false)
    show({ tags: [WORK] })
    expect(all(".ab-tag-have-name").map((r) => r.textContent)).toEqual(["Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-have-name").map((r) => r.textContent)).toEqual(["Work", "Study"])
  })

  it("shows a name as text only: in its row, in the labels of its buttons, in the field of a rename and in the question about removing", () => {
    const odd = "<b>bold</b> & <img src=x onerror=alert(1)>"
    show({ tags: [{ id: "t-odd", name: odd }] })
    expect(q(".ab-tag-have-name").textContent).toBe(odd)
    expect(has(".ab-tag-edit b")).toBe(false)
    expect(has(".ab-tag-edit img")).toBe(false)
    expect(labelled("Rename " + odd).textContent).toBe("Rename")
    click(labelled("Rename " + odd))
    expect(rowField().value).toBe(odd)
    expect(labelled("New name for " + odd)).toBe(rowField())
    expect(has(".ab-tag-edit b")).toBe(false)
    expect(has(".ab-tag-edit img")).toBe(false)
    click(inRow(rows()[0], "Cancel"))
    click(labelled("Remove " + odd))
    expect(q(".ab-tag-ask").textContent).toBe('Remove "' + odd + '"?')
    expect(has(".ab-tag-edit b")).toBe(false)
    expect(has(".ab-tag-edit img")).toBe(false)
  })
})

describe("TagManage: adding a tag", () => {
  it("hands the name to onAdd as typed on a tap of Add: no cutting of spaces and no limit of its own", async () => {
    const props = show()
    typeInto("  Study  ")
    await pressAdd()
    typeInto("A".repeat(25))
    await pressAdd()
    expect(props.onAdd).toHaveBeenCalledTimes(2)
    expect(vi.mocked(props.onAdd).mock.calls.map((c) => c[0])).toEqual(["  Study  ", "A".repeat(25)])
  })

  it("hands an empty field and a name the database does not allow to onAdd too (the words of the rule are the database's, not the box's)", async () => {
    const props = show()
    await pressAdd()
    typeInto("Freestyle")
    await pressAdd()
    typeInto("   ")
    await pressAdd()
    expect(vi.mocked(props.onAdd).mock.calls.map((c) => c[0])).toEqual(["", "Freestyle", "   "])
  })

  it("does the same on Enter in the field, and keeps the key to itself", async () => {
    const props = show()
    typeInto("Gym")
    let event: KeyboardEvent | null = null
    await act(async () => {
      event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      field().dispatchEvent(event)
    })
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    expect(props.onAdd).toHaveBeenCalledWith("Gym")
    expect((event as KeyboardEvent | null)?.defaultPrevented).toBe(true)
  })

  it("does nothing on other keys, and nothing on Enter while an input method is still composing a word", () => {
    const props = show()
    typeInto("Gym")
    key(field(), "a")
    key(field(), "Escape")
    key(field(), "Tab")
    key(field(), "Enter", false, true)
    expect(props.onAdd).not.toHaveBeenCalled()
  })

  it("empties the field, shows no error, and puts the focus back in the field after the call worked", async () => {
    show()
    typeInto("Gym")
    addButton().focus()
    expect(document.activeElement).toBe(addButton())
    await pressAdd()
    expect(field().value).toBe("")
    expect(has(".ab-tag-error")).toBe(false)
    expect(document.activeElement).toBe(field())
  })

  it("keeps the text in the field and shows the words in ONE line after an error, and takes the line away as soon as the person types again", async () => {
    const message = "You already have a tag with that name."
    show({ onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message })) })
    typeInto("Work")
    await pressAdd()
    expect(field().value).toBe("Work")
    expect(all(".ab-tag-error")).toHaveLength(1)
    expect(q(".ab-tag-error").textContent).toBe(message)
    expect(q(".ab-tag-error").getAttribute("role")).toBe("alert")
    typeInto("Worke")
    expect(has(".ab-tag-error")).toBe(false)
  })

  it("takes an old error away when the next try works", async () => {
    const onAdd = vi.fn(async (): Promise<AddTagResult> => ({ ok: true }))
    onAdd.mockResolvedValueOnce({ ok: false, message: "A tag name needs 1 to 20 characters, and cannot be Freestyle." })
    show({ onAdd })
    await pressAdd()
    expect(has(".ab-tag-error")).toBe(true)
    typeInto("Gym")
    expect(has(".ab-tag-error")).toBe(false)
    await pressAdd()
    expect(has(".ab-tag-error")).toBe(false)
    expect(field().value).toBe("")
  })

  it("shows the words of an error as text only", async () => {
    show({ onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message: "<b>no</b>" })) })
    await pressAdd()
    expect(q(".ab-tag-error").textContent).toBe("<b>no</b>")
    expect(has(".ab-tag-error b")).toBe(false)
  })

  it("keeps Add and the field off while the call runs, so that a second tap or Enter cannot add the name twice, and lets go when the answer comes", async () => {
    const wait = held()
    const props = show({ onAdd: vi.fn(() => wait.promise) })
    typeInto("Gym")
    act(() => addButton().click())
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    expect(addButton().disabled).toBe(true)
    expect(field().readOnly).toBe(true)
    act(() => addButton().click())
    key(field(), "Enter")
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    await act(async () => {
      wait.answer({ ok: true })
    })
    expect(addButton().disabled).toBe(false)
    expect(field().readOnly).toBe(false)
    expect(field().value).toBe("")
  })

  it("lets the person try again after an error, also while the same name is still in the field", async () => {
    const onAdd = vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message: "x" }))
    show({ onAdd })
    typeInto("Work")
    await pressAdd()
    await pressAdd()
    expect(onAdd).toHaveBeenCalledTimes(2)
    expect(addButton().disabled).toBe(false)
  })

  it("shows Something went wrong. and lets the person go on when onAdd throws", async () => {
    const onAdd = vi.fn(async (): Promise<AddTagResult> => {
      throw new Error("boom")
    })
    show({ onAdd })
    typeInto("Gym")
    await pressAdd()
    expect(q(".ab-tag-error").textContent).toBe("Something went wrong.")
    expect(field().value).toBe("Gym")
    expect(addButton().disabled).toBe(false)
    expect(field().readOnly).toBe(false)
  })

  it("does not fail when the answer comes after the box was closed", async () => {
    const problems = vi.spyOn(console, "error").mockImplementation(() => {})
    const wait = held()
    show({ onAdd: vi.fn(() => wait.promise) })
    typeInto("Gym")
    act(() => addButton().click())
    act(() => root?.unmount())
    root = null
    await act(async () => {
      wait.answer({ ok: false, message: "late" })
    })
    expect(problems).not.toHaveBeenCalled()
  })
})

describe("TagManage: Back and the keys", () => {
  it("calls onBack on a tap of its button, and nothing else", () => {
    const props = show()
    click(q(".ab-tag-back"))
    expect(props.onBack).toHaveBeenCalledTimes(1)
    expect(props.onAdd).not.toHaveBeenCalled()
  })

  it("does not call onBack on a tap inside the box", () => {
    const props = show()
    click(q(".ab-tag-edit"))
    click(q(".ab-tag-title"))
    click(field())
    click(q(".ab-tag-have-row"))
    expect(props.onBack).not.toHaveBeenCalled()
  })

  it("leaves Escape to the picker: the box itself neither goes back nor adds", () => {
    const props = show()
    key(field(), "Escape")
    key(q(".ab-tag-edit"), "Escape")
    expect(props.onBack).not.toHaveBeenCalled()
    expect(props.onAdd).not.toHaveBeenCalled()
  })

  it("has no Tab rule of its own (the picker keeps Tab inside its panel): Tab is left alone in the box", () => {
    show()
    field().focus()
    expect(key(field(), "Tab").defaultPrevented).toBe(false)
    expect(key(field(), "Tab", true).defaultPrevented).toBe(false)
    expect(key(addButton(), "Tab").defaultPrevented).toBe(false)
    expect(key(q(".ab-tag-back"), "Tab", true).defaultPrevented).toBe(false)
  })

  it("keeps its stops in the order Back, the field, Add, and then Rename and Remove of every row, which the Tab rule of the picker relies on (its FIRST and its LAST stop)", () => {
    show()
    expect(stops()).toEqual(["Back", "New tag name", "Add", "Rename Work", "Remove Work", "Rename Study", "Remove Study"])
    show({ tags: [] })
    expect(stops()).toEqual(["Back", "New tag name", "Add"])
  })

  it("puts the stops of an open row in place of its two buttons: Save and Cancel after the field of a rename, Remove and Keep for the question", () => {
    show()
    click(labelled("Rename Work"))
    expect(stops()).toEqual(["Back", "New tag name", "Add", "New name for Work", "Save", "Cancel", "Rename Study", "Remove Study"])
    click(labelled("Remove Study"))
    expect(stops()).toEqual(["Back", "New tag name", "Add", "Rename Work", "Remove Work", "Remove Study now", "Keep"])
  })
})
describe("TagManage: the rows of the list (Packet 10G)", () => {
  it("gives every row its name as plain text and two buttons, Rename and Remove, which the screen reader hears with the name of the tag; no row is open at first and nothing is off", () => {
    show()
    expect(modes()).toEqual(["idle", "idle"])
    for (const row of rows()) {
      const buttons = Array.from(row.querySelectorAll("button"))
      expect(buttons.map((b) => b.textContent)).toEqual(["Rename", "Remove"])
      expect(buttons.map((b) => b.getAttribute("type"))).toEqual(["button", "button"])
      expect(buttons.map((b) => b.disabled)).toEqual([false, false])
      expect(row.querySelector("input")).toBeNull()
    }
    expect(labelled("Rename Work").textContent).toBe("Rename")
    expect(labelled("Remove Work").textContent).toBe("Remove")
    expect(rows()[0].contains(labelled("Rename Work"))).toBe(true)
    expect(rows()[1].contains(labelled("Remove Study"))).toBe(true)
    expect(has(".ab-tag-error")).toBe(false)
  })

  it("does nothing on a tap of the name or of the row itself", () => {
    const props = show()
    click(q(".ab-tag-have-name"))
    click(rows()[0])
    expect(modes()).toEqual(["idle", "idle"])
    expect(props.onRename).not.toHaveBeenCalled()
    expect(props.onRemove).not.toHaveBeenCalled()
  })
})

describe("TagManage: renaming a tag (Packet 10G)", () => {
  it("opens a field in THAT row only: filled with the name, the text selected, the focus in it, with Save and Cancel next to it, and nothing is sent", () => {
    const props = show()
    click(labelled("Rename Work"))
    expect(modes()).toEqual(["rename", "idle"])
    expect(all(".ab-tag-row-input")).toHaveLength(1)
    expect(rows()[0].contains(rowField())).toBe(true)
    expect(rowField().getAttribute("type")).toBe("text")
    expect(rowField().getAttribute("aria-label")).toBe("New name for Work")
    expect(rowField().getAttribute("autocomplete")).toBe("off")
    expect(rowField().getAttribute("spellcheck")).toBe("false")
    expect(rowField().hasAttribute("maxlength")).toBe(false)
    expect(rowField().readOnly).toBe(false)
    expect(rowField().value).toBe("Work")
    expect(rowField().selectionStart).toBe(0)
    expect(rowField().selectionEnd).toBe(4)
    expect(document.activeElement).toBe(rowField())
    expect(Array.from(rows()[0].querySelectorAll("button")).map((b) => b.textContent)).toEqual(["Save", "Cancel"])
    expect(has(".ab-tag-have-name")).toBe(true)
    expect(rows()[0].querySelector(".ab-tag-have-name")).toBeNull()
    expect(Array.from(rows()[1].querySelectorAll("button")).map((b) => b.textContent)).toEqual(["Rename", "Remove"])
    expect(props.onRename).not.toHaveBeenCalled()
    expect(props.onRemove).not.toHaveBeenCalled()
    expect(props.onAdd).not.toHaveBeenCalled()
  })

  it("hands the id and the name AS TYPED to onRename on Save (no cutting of spaces, no limit of its own), closes the row, and puts the focus back on the Rename button of that row", async () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("  Work out  ")
    await pressIn(inRow(rows()[0], "Save"))
    expect(props.onRename).toHaveBeenCalledTimes(1)
    expect(props.onRename).toHaveBeenCalledWith("t-work", "  Work out  ")
    expect(props.onRemove).not.toHaveBeenCalled()
    expect(props.onAdd).not.toHaveBeenCalled()
    expect(modes()).toEqual(["idle", "idle"])
    expect(has(".ab-tag-row-input")).toBe(false)
    expect(has(".ab-tag-error")).toBe(false)
    expect(document.activeElement).toBe(labelled("Rename Work"))
  })

  it("hands over a name of 25 characters, an empty name and a name the database does not allow too (the words of the rules are the database's, not the box's)", async () => {
    const props = show()
    for (const name of ["A".repeat(25), "", "Freestyle"]) {
      click(labelled("Rename Work"))
      typeIntoRow(name)
      await pressIn(inRow(rows()[0], "Save"))
    }
    expect(vi.mocked(props.onRename).mock.calls).toEqual([
      ["t-work", "A".repeat(25)],
      ["t-work", ""],
      ["t-work", "Freestyle"],
    ])
  })

  it("does the same on Enter in the field of the row, and keeps the key to itself", async () => {
    const props = show()
    click(labelled("Rename Study"))
    typeIntoRow("Learning")
    let event: KeyboardEvent | null = null
    await act(async () => {
      event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      rowField().dispatchEvent(event)
    })
    expect(props.onRename).toHaveBeenCalledTimes(1)
    expect(props.onRename).toHaveBeenCalledWith("t-study", "Learning")
    expect((event as KeyboardEvent | null)?.defaultPrevented).toBe(true)
    expect(modes()).toEqual(["idle", "idle"])
  })

  it("does nothing on other keys, and nothing on Enter while an input method is still composing a word", () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    key(rowField(), "a")
    key(rowField(), "Tab")
    key(rowField(), "Enter", false, true)
    expect(props.onRename).not.toHaveBeenCalled()
    expect(modes()).toEqual(["rename", "idle"])
  })

  it("closes the row and sends NOTHING when the name is the same after the spaces are cut, and gives the focus back to Rename", async () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("  Work ")
    await pressIn(inRow(rows()[0], "Save"))
    expect(props.onRename).not.toHaveBeenCalled()
    expect(modes()).toEqual(["idle", "idle"])
    expect(has(".ab-tag-error")).toBe(false)
    expect(document.activeElement).toBe(labelled("Rename Work"))
    click(labelled("Rename Work"))
    key(rowField(), "Enter")
    expect(props.onRename).not.toHaveBeenCalled()
    expect(modes()).toEqual(["idle", "idle"])
  })

  it("sends a name that only changes the capitals (the database allows it)", async () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("work")
    await pressIn(inRow(rows()[0], "Save"))
    expect(props.onRename).toHaveBeenCalledTimes(1)
    expect(props.onRename).toHaveBeenCalledWith("t-work", "work")
  })

  it("Cancel closes the row, sends nothing, gives the focus back to Rename, and the next Rename starts from the name again (the typed text is not kept)", () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("Zzz")
    click(inRow(rows()[0], "Cancel"))
    expect(modes()).toEqual(["idle", "idle"])
    expect(props.onRename).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(labelled("Rename Work"))
    click(labelled("Rename Work"))
    expect(rowField().value).toBe("Work")
  })

  it("Escape in the field of the row cancels THAT row only: the picker must not see it (default prevented), nothing is sent, and the focus goes back to Rename", () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("Zzz")
    expect(key(rowField(), "Escape").defaultPrevented).toBe(true)
    expect(modes()).toEqual(["idle", "idle"])
    expect(props.onRename).not.toHaveBeenCalled()
    expect(props.onBack).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(labelled("Rename Work"))
  })

  it("lets an Escape on a button of the open row cancel it too, but not an Escape that an input method is using, and not an Escape when no row is open (the picker closes everything then)", () => {
    show()
    click(labelled("Rename Work"))
    expect(key(rowField(), "Escape", false, true).defaultPrevented).toBe(false)
    expect(modes()).toEqual(["rename", "idle"])
    expect(key(inRow(rows()[0], "Save"), "Escape").defaultPrevented).toBe(true)
    expect(modes()).toEqual(["idle", "idle"])
    expect(key(field(), "Escape").defaultPrevented).toBe(false)
    expect(key(labelled("Rename Study"), "Escape").defaultPrevented).toBe(false)
    expect(key(q(".ab-tag-edit"), "Escape").defaultPrevented).toBe(false)
  })

  it("opening Rename on another row closes the first one (nothing is sent), puts the focus in the new field, and the first row starts from its name again", () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("Zz")
    click(labelled("Rename Study"))
    expect(modes()).toEqual(["idle", "rename"])
    expect(all(".ab-tag-row-input")).toHaveLength(1)
    expect(rowField().value).toBe("Study")
    expect(document.activeElement).toBe(rowField())
    expect(props.onRename).not.toHaveBeenCalled()
    click(inRow(rows()[1], "Cancel"))
    click(labelled("Rename Work"))
    expect(rowField().value).toBe("Work")
  })

  it("keeps every button and the field of the row off while the call runs, so that a second Save, Enter or Cancel does nothing, and lets go when the answer comes", async () => {
    const wait = held()
    const props = show({ onRename: vi.fn(() => wait.promise) })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    const save = inRow(rows()[0], "Save")
    const cancel = inRow(rows()[0], "Cancel")
    act(() => save.click())
    expect(props.onRename).toHaveBeenCalledTimes(1)
    expect(save.disabled).toBe(true)
    expect(cancel.disabled).toBe(true)
    expect(rowField().readOnly).toBe(true)
    expect(addButton().disabled).toBe(true)
    expect(field().readOnly).toBe(true)
    expect((labelled("Rename Study") as HTMLButtonElement).disabled).toBe(true)
    expect((labelled("Remove Study") as HTMLButtonElement).disabled).toBe(true)
    act(() => save.click())
    act(() => cancel.click())
    key(rowField(), "Enter")
    expect(props.onRename).toHaveBeenCalledTimes(1)
    expect(modes()).toEqual(["rename", "idle"])
    expect(key(rowField(), "Escape").defaultPrevented).toBe(true)
    expect(modes()).toEqual(["rename", "idle"])
    await act(async () => {
      wait.answer({ ok: true })
    })
    expect(modes()).toEqual(["idle", "idle"])
    expect((labelled("Rename Work") as HTMLButtonElement).disabled).toBe(false)
    expect((labelled("Remove Study") as HTMLButtonElement).disabled).toBe(false)
    expect(addButton().disabled).toBe(false)
    expect(field().readOnly).toBe(false)
  })

  it("keeps the row open with the typed text and shows the words of an error in ONE line inside THAT row, and takes the line away as soon as the person types in the row", async () => {
    const message = "You already have a tag with that name."
    show({ onRename: vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message })) })
    click(labelled("Rename Work"))
    typeIntoRow("Study")
    await pressIn(inRow(rows()[0], "Save"))
    expect(all(".ab-tag-error")).toHaveLength(1)
    expect(q(".ab-tag-error").textContent).toBe(message)
    expect(q(".ab-tag-error").getAttribute("role")).toBe("alert")
    expect(q(".ab-tag-error").classList.contains("ab-tag-row-error")).toBe(true)
    expect(rows()[0].contains(q(".ab-tag-error"))).toBe(true)
    expect(rows()[1].querySelector(".ab-tag-error")).toBeNull()
    expect(modes()).toEqual(["rename", "idle"])
    expect(rowField().value).toBe("Study")
    expect(inRow(rows()[0], "Save").disabled).toBe(false)
    typeIntoRow("Studyy")
    expect(has(".ab-tag-error")).toBe(false)
  })

  it("lets the person try again after an error, with the same name still in the field", async () => {
    const onRename = vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: "x" }))
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Study")
    await pressIn(inRow(rows()[0], "Save"))
    await pressIn(inRow(rows()[0], "Save"))
    expect(onRename).toHaveBeenCalledTimes(2)
  })

  it("takes the error away on Cancel, when another row is opened, when the person types in the Add field, and when Add works; an error of Add is taken away when a row is opened", async () => {
    const onRename = vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: "row problem" }))
    const onAdd = vi.fn(async (): Promise<AddTagResult> => ({ ok: true }))
    onAdd.mockResolvedValueOnce({ ok: false, message: "add problem" })
    show({ onRename, onAdd })
    const fail = async () => {
      click(labelled("Rename Work"))
      typeIntoRow("Study")
      await pressIn(inRow(rows()[0], "Save"))
      expect(q(".ab-tag-error").textContent).toBe("row problem")
    }
    await fail()
    click(inRow(rows()[0], "Cancel"))
    expect(has(".ab-tag-error")).toBe(false)
    await fail()
    click(labelled("Rename Study"))
    expect(has(".ab-tag-error")).toBe(false)
    click(inRow(rows()[1], "Cancel"))
    await fail()
    typeInto("G")
    expect(has(".ab-tag-error")).toBe(false)
    await pressAdd()
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(q(".ab-tag-error").textContent).toBe("add problem")
    click(labelled("Rename Study"))
    expect(has(".ab-tag-error")).toBe(false)
    await fail()
    typeInto("Gym")
    await pressAdd()
    expect(onAdd).toHaveBeenCalledTimes(2)
    expect(has(".ab-tag-error")).toBe(false)
    expect(modes()).toEqual(["rename", "idle"])
  })

  it("shows the words of an error as text only", async () => {
    show({ onRename: vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: "<b>no</b>" })) })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    await pressIn(inRow(rows()[0], "Save"))
    expect(q(".ab-tag-error").textContent).toBe("<b>no</b>")
    expect(has(".ab-tag-error b")).toBe(false)
  })

  it("shows Something went wrong. in the row and lets the person go on when onRename throws", async () => {
    const onRename = vi.fn(async (): Promise<TagEditResult> => {
      throw new Error("boom")
    })
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    await pressIn(inRow(rows()[0], "Save"))
    expect(q(".ab-tag-error").textContent).toBe("Something went wrong.")
    expect(rows()[0].contains(q(".ab-tag-error"))).toBe(true)
    expect(rowField().value).toBe("Job")
    expect(inRow(rows()[0], "Save").disabled).toBe(false)
    expect(rowField().readOnly).toBe(false)
    expect(addButton().disabled).toBe(false)
  })

  it("does not fail when the answer comes after the box was closed", async () => {
    const problems = vi.spyOn(console, "error").mockImplementation(() => {})
    const wait = held()
    show({ onRename: vi.fn(() => wait.promise) })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    act(() => inRow(rows()[0], "Save").click())
    act(() => root?.unmount())
    root = null
    await act(async () => {
      wait.answer({ ok: false, message: "late" })
    })
    expect(problems).not.toHaveBeenCalled()
  })

  it("keeps the Add field working while a row is open: Add goes to onAdd and the open row stays as it is", async () => {
    const props = show()
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    typeInto("Gym")
    await pressAdd()
    expect(props.onAdd).toHaveBeenCalledTimes(1)
    expect(props.onAdd).toHaveBeenCalledWith("Gym")
    expect(props.onRename).not.toHaveBeenCalled()
    expect(modes()).toEqual(["rename", "idle"])
    expect(rowField().value).toBe("Job")
  })
})

describe("TagManage: removing a tag (Packet 10G)", () => {
  it("turns THAT row into the question Remove NAME? with the line about old sessions, Remove and Keep, puts the focus on Keep (the safe button), and sends nothing", () => {
    const props = show()
    click(labelled("Remove Work"))
    expect(modes()).toEqual(["remove", "idle"])
    expect(rows()[0].querySelector(".ab-tag-have-name")).toBeNull()
    expect(q(".ab-tag-ask").tagName).toBe("P")
    expect(q(".ab-tag-ask").textContent).toBe('Remove "Work"?')
    expect(q(".ab-tag-note").textContent).toBe("Old sessions keep it. Adding the same name again brings it back.")
    expect(all(".ab-tag-ask")).toHaveLength(1)
    expect(rows()[0].contains(q(".ab-tag-ask"))).toBe(true)
    const buttons = Array.from(rows()[0].querySelectorAll("button"))
    expect(buttons.map((b) => b.textContent)).toEqual(["Remove", "Keep"])
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Remove Work now", null])
    expect(buttons.map((b) => b.getAttribute("type"))).toEqual(["button", "button"])
    expect(document.activeElement).toBe(buttons[1])
    expect(Array.from(rows()[1].querySelectorAll("button")).map((b) => b.textContent)).toEqual(["Rename", "Remove"])
    expect(props.onRemove).not.toHaveBeenCalled()
    expect(props.onRename).not.toHaveBeenCalled()
  })

  it("hands only the id to onRemove on the second step, and after it worked the focus goes to the Add field (the row is gone from the list the hook gives)", async () => {
    const props = show()
    click(labelled("Remove Work"))
    await pressIn(labelled("Remove Work now"))
    expect(props.onRemove).toHaveBeenCalledTimes(1)
    expect(props.onRemove).toHaveBeenCalledWith("t-work")
    expect(props.onRename).not.toHaveBeenCalled()
    expect(props.onAdd).not.toHaveBeenCalled()
    expect(has(".ab-tag-error")).toBe(false)
    expect(modes()).toEqual(["idle", "idle"])
    show({ tags: [STUDY], onRemove: props.onRemove })
    expect(rows().map((r) => r.textContent)).toEqual(["StudyRenameRemove"])
    expect(document.activeElement).toBe(field())
  })

  it("Keep closes the question, sends nothing, and gives the focus back to the Remove button of that row", () => {
    const props = show()
    click(labelled("Remove Study"))
    click(inRow(rows()[1], "Keep"))
    expect(modes()).toEqual(["idle", "idle"])
    expect(props.onRemove).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(labelled("Remove Study"))
  })

  it("Escape on the question is Keep: the picker must not see it, nothing is sent, and the focus goes back to Remove", () => {
    const props = show()
    click(labelled("Remove Work"))
    expect(key(inRow(rows()[0], "Keep"), "Escape").defaultPrevented).toBe(true)
    expect(modes()).toEqual(["idle", "idle"])
    expect(props.onRemove).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(labelled("Remove Work"))
  })

  it("keeps every button off while the call runs, so that a second tap does nothing, and lets go when the answer comes", async () => {
    const wait = held()
    const props = show({ onRemove: vi.fn(() => wait.promise) })
    click(labelled("Remove Work"))
    const remove = labelled("Remove Work now") as HTMLButtonElement
    const keep = inRow(rows()[0], "Keep")
    act(() => remove.click())
    expect(props.onRemove).toHaveBeenCalledTimes(1)
    expect(remove.disabled).toBe(true)
    expect(keep.disabled).toBe(true)
    expect(addButton().disabled).toBe(true)
    expect((labelled("Rename Study") as HTMLButtonElement).disabled).toBe(true)
    act(() => remove.click())
    act(() => keep.click())
    expect(props.onRemove).toHaveBeenCalledTimes(1)
    expect(modes()).toEqual(["remove", "idle"])
    expect(key(keep, "Escape").defaultPrevented).toBe(true)
    expect(modes()).toEqual(["remove", "idle"])
    await act(async () => {
      wait.answer({ ok: true })
    })
    expect(modes()).toEqual(["idle", "idle"])
    expect(addButton().disabled).toBe(false)
    expect((labelled("Rename Study") as HTMLButtonElement).disabled).toBe(false)
  })

  it("keeps the question open and shows the words of an error in ONE line inside THAT row; Keep takes the line away", async () => {
    const message = "Something went wrong. Try again."
    show({ onRemove: vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message })) })
    click(labelled("Remove Study"))
    await pressIn(labelled("Remove Study now"))
    expect(all(".ab-tag-error")).toHaveLength(1)
    expect(q(".ab-tag-error").textContent).toBe(message)
    expect(q(".ab-tag-error").getAttribute("role")).toBe("alert")
    expect(rows()[1].contains(q(".ab-tag-error"))).toBe(true)
    expect(modes()).toEqual(["idle", "remove"])
    expect((labelled("Remove Study now") as HTMLButtonElement).disabled).toBe(false)
    click(inRow(rows()[1], "Keep"))
    expect(has(".ab-tag-error")).toBe(false)
    expect(modes()).toEqual(["idle", "idle"])
  })

  it("shows Something went wrong. in the row when onRemove throws, and lets the person go on", async () => {
    const onRemove = vi.fn(async (): Promise<TagEditResult> => {
      throw new Error("boom")
    })
    show({ onRemove })
    click(labelled("Remove Work"))
    await pressIn(labelled("Remove Work now"))
    expect(q(".ab-tag-error").textContent).toBe("Something went wrong.")
    expect(rows()[0].contains(q(".ab-tag-error"))).toBe(true)
    expect(addButton().disabled).toBe(false)
    await pressIn(labelled("Remove Work now"))
    expect(onRemove).toHaveBeenCalledTimes(2)
  })

  it("does not fail when the answer comes after the box was closed", async () => {
    const problems = vi.spyOn(console, "error").mockImplementation(() => {})
    const wait = held()
    show({ onRemove: vi.fn(() => wait.promise) })
    click(labelled("Remove Work"))
    act(() => (labelled("Remove Work now") as HTMLButtonElement).click())
    act(() => root?.unmount())
    root = null
    await act(async () => {
      wait.answer({ ok: true })
    })
    expect(problems).not.toHaveBeenCalled()
  })

  it("keeps ONE row open at a time across Rename and Remove: the one that opens closes the other, and nothing is sent", () => {
    const props = show()
    click(labelled("Remove Work"))
    click(labelled("Rename Study"))
    expect(modes()).toEqual(["idle", "rename"])
    expect(has(".ab-tag-ask")).toBe(false)
    click(inRow(rows()[1], "Cancel"))
    click(labelled("Rename Work"))
    typeIntoRow("Zz")
    click(labelled("Remove Study"))
    expect(modes()).toEqual(["idle", "remove"])
    expect(has(".ab-tag-row-input")).toBe(false)
    expect(document.activeElement).toBe(inRow(rows()[1], "Keep"))
    click(labelled("Remove Work"))
    expect(modes()).toEqual(["remove", "idle"])
    expect(all(".ab-tag-ask")).toHaveLength(1)
    expect(props.onRename).not.toHaveBeenCalled()
    expect(props.onRemove).not.toHaveBeenCalled()
  })
})

describe("TagManage: a tag that is not in the list any more (Packet 10G)", () => {
  const gone = "That tag is not there any more. Close the list and open it again."

  it("moves the words of the error to the line under the Add field when the hook has read the list again and the tag of the open row is gone", async () => {
    const onRename = vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: gone }))
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    await pressIn(inRow(rows()[0], "Save"))
    expect(rows()[0].contains(q(".ab-tag-error"))).toBe(true)
    show({ tags: [STUDY], onRename })
    expect(rows().map((r) => r.textContent)).toEqual(["StudyRenameRemove"])
    expect(modes()).toEqual(["idle"])
    expect(all(".ab-tag-error")).toHaveLength(1)
    expect(q(".ab-tag-error").textContent).toBe(gone)
    expect(q(".ab-tag-error").getAttribute("role")).toBe("alert")
    expect(q(".ab-tag-error").parentElement).toBe(q(".ab-tag-edit"))
    expect(q(".ab-tag-error").classList.contains("ab-tag-row-error")).toBe(false)
    typeInto("x")
    expect(has(".ab-tag-error")).toBe(false)
  })

  it("shows the same words under the Add field when the list changed BEFORE the answer came (the real hook reads the list again first, and only then answers)", async () => {
    const wait = held()
    const onRename = vi.fn(() => wait.promise)
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    act(() => inRow(rows()[0], "Save").click())
    show({ tags: [STUDY], onRename })
    expect(rows().map((r) => r.textContent)).toEqual(["StudyRenameRemove"])
    expect(has(".ab-tag-error")).toBe(false)
    await act(async () => {
      wait.answer({ ok: false, message: gone })
    })
    expect(all(".ab-tag-error")).toHaveLength(1)
    expect(q(".ab-tag-error").textContent).toBe(gone)
    expect(q(".ab-tag-error").parentElement).toBe(q(".ab-tag-edit"))
    expect(addButton().disabled).toBe(false)
    expect(modes()).toEqual(["idle"])
  })

  it("lets a Remove whose tag is gone before the answer come back ok: the row is closed and the focus goes to the Add field", async () => {
    const wait = held()
    const onRemove = vi.fn(() => wait.promise)
    show({ onRemove })
    click(labelled("Remove Work"))
    act(() => (labelled("Remove Work now") as HTMLButtonElement).click())
    show({ tags: [STUDY], onRemove })
    await act(async () => {
      wait.answer({ ok: true })
    })
    expect(modes()).toEqual(["idle"])
    expect(has(".ab-tag-error")).toBe(false)
    expect(document.activeElement).toBe(field())
    show({ tags: [WORK, STUDY], onRemove })
    expect(modes()).toEqual(["idle", "idle"])
  })

  it("does the same when a Remove finds the tag gone", async () => {
    const onRemove = vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: gone }))
    show({ onRemove })
    click(labelled("Remove Work"))
    await pressIn(labelled("Remove Work now"))
    show({ tags: [STUDY], onRemove })
    expect(rows().map((r) => r.textContent)).toEqual(["StudyRenameRemove"])
    expect(q(".ab-tag-error").textContent).toBe(gone)
    expect(q(".ab-tag-error").parentElement).toBe(q(".ab-tag-edit"))
  })

  it("forgets an open row whose tag has left the list, and does not open it again when a tag with that id comes back (adding the same name brings a removed tag back)", async () => {
    const onRename = vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: gone }))
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    await pressIn(inRow(rows()[0], "Save"))
    show({ tags: [STUDY], onRename })
    typeInto("x")
    show({ tags: [WORK, STUDY], onRename })
    expect(modes()).toEqual(["idle", "idle"])
    expect(has(".ab-tag-row-input")).toBe(false)
    expect(has(".ab-tag-error")).toBe(false)
  })

  it("forgets an open row whose tag leaves the list with no error shown at all, and does not open it again", () => {
    show()
    click(labelled("Remove Work"))
    show({ tags: [STUDY] })
    expect(modes()).toEqual(["idle"])
    expect(has(".ab-tag-ask")).toBe(false)
    expect(has(".ab-tag-error")).toBe(false)
    show({ tags: [WORK, STUDY] })
    expect(modes()).toEqual(["idle", "idle"])
    expect(has(".ab-tag-ask")).toBe(false)
  })

  it("keeps the other open row when ANOTHER tag leaves the list", () => {
    show()
    click(labelled("Rename Study"))
    typeIntoRow("Learning")
    show({ tags: [STUDY] })
    expect(modes()).toEqual(["rename"])
    expect(rowField().value).toBe("Learning")
  })
})

describe("TagManage: where the focus goes after an error (Packet 10G, found at the real-browser look: the button that was pressed was off while the call ran, so the focus fell to the page)", () => {
  const gone = "That tag is not there any more. Close the list and open it again."

  it("puts the focus back in the Add field after an error of Add that followed a tap of the Add BUTTON", async () => {
    show({ onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message: "x" })) })
    typeInto("Work")
    addButton().focus()
    await pressAdd()
    expect(document.activeElement).toBe(field())
    expect(field().value).toBe("Work")
  })

  it("does the same when onAdd throws, and when Add is pressed while a row is open (the focus goes to the Add field, not into the row)", async () => {
    show({
      onAdd: vi.fn(async (): Promise<AddTagResult> => {
        throw new Error("boom")
      }),
    })
    click(labelled("Rename Work"))
    expect(document.activeElement).toBe(rowField())
    typeInto("Gym")
    addButton().focus()
    await pressAdd()
    expect(q(".ab-tag-error").textContent).toBe("Something went wrong.")
    expect(document.activeElement).toBe(field())
    expect(modes()).toEqual(["rename", "idle"])
  })

  it("keeps the focus in the field after an error of Add that followed Enter in the field", async () => {
    show({ onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: false, message: "x" })) })
    typeInto("Work")
    field().focus()
    await act(async () => {
      field().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    })
    expect(has(".ab-tag-error")).toBe(true)
    expect(document.activeElement).toBe(field())
  })

  it("puts the focus back in the field of the row after an error of a rename that followed a tap of Save, with the typed text kept", async () => {
    show({ onRename: vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: "x" })) })
    click(labelled("Rename Work"))
    typeIntoRow("Study")
    inRow(rows()[0], "Save").focus()
    await pressIn(inRow(rows()[0], "Save"))
    expect(rows()[0].contains(q(".ab-tag-error"))).toBe(true)
    expect(document.activeElement).toBe(rowField())
    expect(rowField().value).toBe("Study")
  })

  it("does the same when onRename throws", async () => {
    show({
      onRename: vi.fn(async (): Promise<TagEditResult> => {
        throw new Error("boom")
      }),
    })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    inRow(rows()[0], "Save").focus()
    await pressIn(inRow(rows()[0], "Save"))
    expect(q(".ab-tag-error").textContent).toBe("Something went wrong.")
    expect(document.activeElement).toBe(rowField())
  })

  it("keeps the focus in the field of the row after an error of a rename that followed Enter in that field", async () => {
    show({ onRename: vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: "x" })) })
    click(labelled("Rename Work"))
    typeIntoRow("Study")
    await act(async () => {
      rowField().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))
    })
    expect(has(".ab-tag-error")).toBe(true)
    expect(document.activeElement).toBe(rowField())
  })

  it("puts the focus on Keep (the safe button) after an error of the second step of Remove, also when onRemove throws", async () => {
    const onRemove = vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: "x" }))
    show({ onRemove })
    click(labelled("Remove Study"))
    ;(labelled("Remove Study now") as HTMLButtonElement).focus()
    await pressIn(labelled("Remove Study now"))
    expect(rows()[1].contains(q(".ab-tag-error"))).toBe(true)
    expect(document.activeElement).toBe(inRow(rows()[1], "Keep"))
    click(inRow(rows()[1], "Keep"))
    onRemove.mockImplementation(async () => {
      throw new Error("boom")
    })
    click(labelled("Remove Study"))
    ;(labelled("Remove Study now") as HTMLButtonElement).focus()
    await pressIn(labelled("Remove Study now"))
    expect(q(".ab-tag-error").textContent).toBe("Something went wrong.")
    expect(document.activeElement).toBe(inRow(rows()[1], "Keep"))
  })

  it("puts the focus in the Add field when the row of the error is gone (the real hook reads the list again before it answers TAG_NOT_FOUND): rename and remove", async () => {
    const wait = held()
    const onRename = vi.fn(() => wait.promise)
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    inRow(rows()[0], "Save").focus()
    act(() => inRow(rows()[0], "Save").click())
    show({ tags: [STUDY], onRename })
    await act(async () => {
      wait.answer({ ok: false, message: gone })
    })
    expect(q(".ab-tag-error").textContent).toBe(gone)
    expect(document.activeElement).toBe(field())

    const wait2 = held()
    const onRemove = vi.fn(() => wait2.promise)
    show({ tags: [WORK, STUDY], onRename, onRemove })
    click(labelled("Remove Study"))
    ;(labelled("Remove Study now") as HTMLButtonElement).focus()
    act(() => (labelled("Remove Study now") as HTMLButtonElement).click())
    show({ tags: [WORK], onRename, onRemove })
    await act(async () => {
      wait2.answer({ ok: false, message: gone })
    })
    expect(q(".ab-tag-error").textContent).toBe(gone)
    expect(document.activeElement).toBe(field())
  })

  it("moves the focus once only: a later draw of the box does not pull it back from where the person put it", async () => {
    const onRename = vi.fn(async (): Promise<TagEditResult> => ({ ok: false, message: "x" }))
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Study")
    inRow(rows()[0], "Save").focus()
    await pressIn(inRow(rows()[0], "Save"))
    expect(document.activeElement).toBe(rowField())
    q(".ab-tag-back").focus()
    show({ onRename })
    show({ tags: [WORK, STUDY, { id: "t-gym", name: "Gym" }], onRename })
    expect(document.activeElement).toBe(q(".ab-tag-back"))
  })

  it("leaves the focus alone when the answer comes after the box was closed", async () => {
    const wait = held()
    const onRename = vi.fn(() => wait.promise)
    show({ onRename })
    click(labelled("Rename Work"))
    typeIntoRow("Job")
    act(() => inRow(rows()[0], "Save").click())
    const outside = document.createElement("button")
    document.body.appendChild(outside)
    act(() => root?.unmount())
    root = null
    outside.focus()
    await act(async () => {
      wait.answer({ ok: false, message: "x" })
    })
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })
})
// AB:TIMER.TESTS:END
