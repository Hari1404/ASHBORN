// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
import TagManage from "./TagManage"

// AB:TIMER.TESTS:START
// The Manage tags box (TagManage.tsx, Packet 10D): what it shows, what Add and Enter hand to the hook, what happens while the call runs and after its answer, where the focus goes, and what the keys do. The css is not read here (TimerScreen.test.tsx reads it). A made-up call stands in for the hook, and a made-up answer can be held back until the test lets it go.
const WORK: TimerTag = { id: "t-work", name: "Work" }
const STUDY: TimerTag = { id: "t-study", name: "Study" }

let root: Root | null = null
let container: HTMLElement | null = null

type Props = Partial<Parameters<typeof TagManage>[0]>
function show(over: Props = {}) {
  const props = {
    tags: [WORK, STUDY],
    backLabel: "Back",
    onAdd: vi.fn(async (): Promise<AddTagResult> => ({ ok: true })),
    onBack: vi.fn(),
    onClose: vi.fn(),
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
  it("is a modal dialog with the name Manage tags, a title, the button with the label it was given, a field and an Add button", () => {
    show({ backLabel: "Done" })
    const box = q(".ab-tag-box")
    expect(box.getAttribute("role")).toBe("dialog")
    expect(box.getAttribute("aria-modal")).toBe("true")
    expect(box.getAttribute("aria-label")).toBe("Manage tags")
    expect(box.getAttribute("tabindex")).toBe("-1")
    expect(q(".ab-tag-box-title").textContent).toBe("Manage tags")
    expect(q(".ab-tag-back").textContent).toBe("Done")
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

  it("shows the tags as plain rows in the order it was given, and you have no tags yet when there are none", () => {
    show()
    expect(q(".ab-tag-have").getAttribute("aria-label")).toBe("Your tags")
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
    expect(has(".ab-tag-have button")).toBe(false)
    expect(has(".ab-tag-have-empty")).toBe(false)
    show({ tags: [] })
    expect(has(".ab-tag-have")).toBe(false)
    expect(q(".ab-tag-have-empty").textContent).toBe("You have no tags yet.")
  })

  it("follows the list when the hook gives a longer one", () => {
    show({ tags: [] })
    expect(has(".ab-tag-have-row")).toBe(false)
    show({ tags: [WORK] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work"])
    show({ tags: [WORK, STUDY] })
    expect(all(".ab-tag-have-row").map((r) => r.textContent)).toEqual(["Work", "Study"])
  })

  it("shows a name as text only", () => {
    show({ tags: [{ id: "t-odd", name: "<b>bold</b> & <img src=x onerror=alert(1)>" }] })
    expect(q(".ab-tag-have-row").textContent).toBe("<b>bold</b> & <img src=x onerror=alert(1)>")
    expect(has(".ab-tag-box b")).toBe(false)
    expect(has(".ab-tag-box img")).toBe(false)
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

describe("TagManage: the buttons, the dim layer and the keys", () => {
  it("calls onBack on a tap of its button, and nothing else", () => {
    const props = show()
    click(q(".ab-tag-back"))
    expect(props.onBack).toHaveBeenCalledTimes(1)
    expect(props.onClose).not.toHaveBeenCalled()
    expect(props.onAdd).not.toHaveBeenCalled()
  })

  it("calls onClose on a tap of the dim layer, which is hidden from the screen reader, and not on a tap inside the box", () => {
    const props = show()
    expect(q(".ab-tag-scrim").getAttribute("aria-hidden")).toBe("true")
    click(q(".ab-tag-box"))
    click(q(".ab-tag-box-title"))
    click(field())
    click(q(".ab-tag-have-row"))
    expect(props.onClose).not.toHaveBeenCalled()
    click(q(".ab-tag-scrim"))
    expect(props.onClose).toHaveBeenCalledTimes(1)
    expect(props.onBack).not.toHaveBeenCalled()
  })

  it("leaves Escape to the picker: the box itself neither closes nor goes back", () => {
    const props = show()
    key(field(), "Escape")
    key(q(".ab-tag-box"), "Escape")
    expect(props.onClose).not.toHaveBeenCalled()
    expect(props.onBack).not.toHaveBeenCalled()
  })

  it("keeps Tab inside the box: from the last stop (Add) to the first (the button), and Shift+Tab from the first stop or the box to the last", () => {
    show()
    const stops = all(".ab-tag-box button, .ab-tag-box input")
    expect(stops.map((s) => s.className)).toEqual(["ab-tag-back", "ab-tag-input", "ab-tag-add-button"])
    addButton().focus()
    const forward = key(addButton(), "Tab")
    expect(forward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(q(".ab-tag-back"))
    const back = key(q(".ab-tag-back"), "Tab", true)
    expect(back.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(addButton())
    q(".ab-tag-box").focus()
    const fromBox = key(q(".ab-tag-box"), "Tab", true)
    expect(fromBox.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(addButton())
  })

  it("lets Tab go on by itself everywhere else in the box", () => {
    show()
    field().focus()
    expect(key(field(), "Tab").defaultPrevented).toBe(false)
    expect(key(field(), "Tab", true).defaultPrevented).toBe(false)
  })
})
// AB:TIMER.TESTS:END
