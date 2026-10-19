import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult, TagEditResult } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.TAGS:START
// The editing box of the Pro Timer: the place where the person ADDS, RENAMES and REMOVES a tag (Packet 10D built it as the Manage tags box with Add; Packet 10F made it the inside of the Edit tags view of the picker, CONNECTIONS.md C57; Packet 10G added renaming and removing). TagPicker.tsx draws it INSTEAD of the list while the pen has switched its panel to editing (DECISIONS_TAGS.md sections 4b and 5).
// It has no dim layer, no dialog and no keys of the place: the layer, the glass panel, the focus, Escape and the Tab rule belong to TagPicker.tsx. The box has a title (Edit tags), a Back button (it returns to the list), a text field with an Add button, one line for an error, and the person's tags as a plain list in the order of the list the hook gave. The panel is at the TOP of the window on every size, so that the keyboard of a phone does not hide the field; it scrolls when it is taller than the window.
// Add hands the name to the hook as typed (onAdd = addTag in useTimer.ts). The database cuts the spaces and checks the rules, so the rules and the words of the errors live in one place and this box has no rule of its own, not even a limit on the field. While a call runs (Add, Save or Remove), every button of the box does nothing and the fields cannot be edited (a second tap cannot send twice). On success the field is emptied, the focus stays in the field, and the new tag appears in the list below (it is NOT chosen, see DECISIONS_TAGS.md section 4). On an error the text stays in the field and the plain words show in one line until the person types again.
// Every row of the list has two buttons, Rename and Remove (Packet 10G, DECISIONS_TAGS.md section 5). Rename turns THAT row into a field with Save and Cancel (Enter is Save). Saving the same name (after the spaces are cut) closes the field and sends nothing. Remove turns THAT row into a question with Remove and Keep (two steps on purpose: a wrong tap is easy, and a removed tag comes back only by adding its name again; the focus is on Keep). Only ONE row is open at a time: opening another row closes the first, and nothing is sent. The hook does the call (onRename = renameTag, onRemove = archiveTag in useTimer.ts) and the answer is ok or the plain words of the error, which show in ONE line inside the open row. If the tag is not in the list any more (the hook read the list again after TAG_NOT_FOUND) the words show in the line under the Add field instead, and the row is forgotten as soon as no call runs and no error of it is shown, so it never opens again by itself when a tag with that id comes back. Escape cancels the open row only (the picker does not see that Escape); with no row open Escape closes everything as before.
// Enter in a field is the same as its button, except while a word is still being composed with an input method (a name in another script). Focus goes to the Add field when the box opens, to the field of a row that is renamed, to Keep when a row asks about removing, back to the button that opened the row when it closes, and to the Add field when a removed row is gone.
// A tag name is shown as plain text, never as markup. The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type TagManageProps = {
  tags: TimerTag[]
  onAdd: (name: string) => Promise<AddTagResult>
  onRename: (id: string, name: string) => Promise<TagEditResult>
  onRemove: (id: string) => Promise<TagEditResult>
  onBack: () => void
}

type OpenRow = { id: string; mode: "rename" | "remove" }
type FocusRequest = { id: string; kind: "rename" | "remove" } | { id: null; kind: "add" } | { id: null; kind: "again" }

export default function TagManage({ tags, onAdd, onRename, onRemove, onBack }: TagManageProps) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<OpenRow | null>(null)
  const [rowDraft, setRowDraft] = useState("")
  const [rowError, setRowError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const rowInputRef = useRef<HTMLInputElement>(null)
  const keepRef = useRef<HTMLButtonElement>(null)
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const wantFocus = useRef<FocusRequest | null>(null)
  const busyRef = useRef(false)
  const aliveRef = useRef(true)

  // The field gets the focus when the box opens. An answer that comes after the box was closed changes nothing.
  useEffect(() => {
    aliveRef.current = true
    inputRef.current?.focus()
    return () => {
      aliveRef.current = false
    }
  }, [])

  // A row that was just opened puts the focus where its job is: in the field of a rename, on Keep when it asks about removing.
  useEffect(() => {
    if (open?.mode === "rename") {
      rowInputRef.current?.focus()
      rowInputRef.current?.select()
    } else if (open?.mode === "remove") {
      keepRef.current?.focus()
    }
  }, [open])

  // A row that was just closed hands the focus back, after it was drawn again with its buttons.
  useEffect(() => {
    const want = wantFocus.current
    if (want === null) return
    wantFocus.current = null
    if (want.kind === "add") inputRef.current?.focus()
    else if (want.kind === "again") (rowInputRef.current ?? keepRef.current ?? inputRef.current)?.focus()
    else buttonRefs.current.get(want.id + ":" + want.kind)?.focus()
  })

  function keepButton(id: string, kind: "rename" | "remove") {
    return (element: HTMLButtonElement | null) => {
      if (element === null) buttonRefs.current.delete(id + ":" + kind)
      else buttonRefs.current.set(id + ":" + kind, element)
    }
  }

  async function submit() {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    let result: AddTagResult
    try {
      result = await onAdd(draft)
    } catch {
      result = { ok: false, message: "Something went wrong." }
    }
    busyRef.current = false
    if (!aliveRef.current) return
    setBusy(false)
    if (result.ok) {
      setDraft("")
      setError("")
      setRowError("")
      inputRef.current?.focus()
    } else {
      wantFocus.current = { id: null, kind: "add" }
      setError(result.message)
    }
  }

  // Opens one row (and so closes the one that was open: nothing is sent). A row cannot be opened while a call runs.
  function openRow(tag: TimerTag, mode: "rename" | "remove") {
    if (busyRef.current) return
    setOpen({ id: tag.id, mode })
    setRowDraft(tag.name)
    setRowError("")
    setError("")
  }

  function closeRow() {
    if (open !== null) wantFocus.current = { id: open.id, kind: open.mode }
    setOpen(null)
    setRowError("")
  }

  // The call of a row. The answer closes the row when it is ok, and shows its words in the row when it is not.
  async function runRow(call: () => Promise<TagEditResult>, id: string, mode: "rename" | "remove") {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    let result: TagEditResult
    try {
      result = await call()
    } catch {
      result = { ok: false, message: "Something went wrong." }
    }
    busyRef.current = false
    if (!aliveRef.current) return
    setBusy(false)
    if (result.ok) {
      wantFocus.current = mode === "rename" ? { id, kind: "rename" } : { id: null, kind: "add" }
      setOpen(null)
      setRowError("")
    } else {
      wantFocus.current = { id: null, kind: "again" }
      setRowError(result.message)
    }
  }

  function save(tag: TimerTag) {
    if (busyRef.current) return
    if (rowDraft.trim() === tag.name) {
      closeRow()
      return
    }
    void runRow(() => onRename(tag.id, rowDraft), tag.id, "rename")
  }

  function onRowKey(event: ReactKeyboardEvent<HTMLLIElement>) {
    if (event.key !== "Escape" || event.nativeEvent.isComposing) return
    event.preventDefault()
    if (!busyRef.current) closeRow()
  }

  // The row that is open is looked up in the list that is drawn now. When the tag is not in the list any more, its error line moves to the line under the Add field.
  const openTag = open === null ? undefined : tags.find((tag) => tag.id === open.id)
  const topError = error !== "" ? error : open !== null && openTag === undefined ? rowError : ""
  // A row whose tag has left the list is forgotten, so that it cannot open again by itself when a tag with that id comes back (adding the same name brings a removed tag back). Not while a call runs (the hook reads the list again BEFORE its answer arrives, and the answer still needs the row), and not while its error is shown under the Add field.
  if (open !== null && openTag === undefined && rowError === "" && !busy) setOpen(null)

  return (
    <div className="ab-tag-edit">
      <div className="ab-tag-head">
        <p className="ab-tag-title">Edit tags</p>
        <button className="ab-tag-back" type="button" onClick={onBack}>
          Back
        </button>
      </div>
      <div className="ab-tag-add">
        <input
          className="ab-tag-input"
          type="text"
          aria-label="New tag name"
          placeholder="New tag"
          autoComplete="off"
          spellCheck={false}
          readOnly={busy}
          value={draft}
          ref={inputRef}
          onChange={(event) => {
            setDraft(event.target.value)
            setError("")
            setRowError("")
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault()
              void submit()
            }
          }}
        />
        <button className="ab-tag-add-button" type="button" disabled={busy} onClick={() => void submit()}>
          Add
        </button>
      </div>
      {topError === "" ? null : (
        <p className="ab-tag-error" role="alert">
          {topError}
        </p>
      )}
      {tags.length === 0 ? (
        <p className="ab-tag-have-empty">You have no tags yet.</p>
      ) : (
        <ul className="ab-tag-have" aria-label="Your tags">
          {tags.map((tag) => {
            const mode = openTag !== undefined && open !== null && open.id === tag.id ? open.mode : null
            return (
              <li key={tag.id} className="ab-tag-have-row" data-mode={mode ?? "idle"} onKeyDown={mode === null ? undefined : onRowKey}>
                {mode === "rename" ? (
                  <>
                    <input
                      className="ab-tag-input ab-tag-row-input"
                      type="text"
                      aria-label={"New name for " + tag.name}
                      autoComplete="off"
                      spellCheck={false}
                      readOnly={busy}
                      value={rowDraft}
                      ref={rowInputRef}
                      onChange={(event) => {
                        setRowDraft(event.target.value)
                        setRowError("")
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                          event.preventDefault()
                          save(tag)
                        }
                      }}
                    />
                    <button className="ab-tag-row-button ab-tag-row-save" type="button" disabled={busy} onClick={() => save(tag)}>
                      Save
                    </button>
                    <button className="ab-tag-row-button" type="button" disabled={busy} onClick={() => closeRow()}>
                      Cancel
                    </button>
                  </>
                ) : mode === "remove" ? (
                  <>
                    <p className="ab-tag-ask">Remove &quot;{tag.name}&quot;?</p>
                    <p className="ab-tag-note">Old sessions keep it. Adding the same name again brings it back.</p>
                    <button
                      className="ab-tag-row-button ab-tag-row-save"
                      type="button"
                      aria-label={"Remove " + tag.name + " now"}
                      disabled={busy}
                      onClick={() => void runRow(() => onRemove(tag.id), tag.id, "remove")}
                    >
                      Remove
                    </button>
                    <button className="ab-tag-row-button" type="button" disabled={busy} ref={keepRef} onClick={() => closeRow()}>
                      Keep
                    </button>
                  </>
                ) : (
                  <>
                    <span className="ab-tag-have-name">{tag.name}</span>
                    <button className="ab-tag-row-button" type="button" aria-label={"Rename " + tag.name} disabled={busy} ref={keepButton(tag.id, "rename")} onClick={() => openRow(tag, "rename")}>
                      Rename
                    </button>
                    <button className="ab-tag-row-button" type="button" aria-label={"Remove " + tag.name} disabled={busy} ref={keepButton(tag.id, "remove")} onClick={() => openRow(tag, "remove")}>
                      Remove
                    </button>
                  </>
                )}
                {mode !== null && rowError !== "" ? (
                  <p className="ab-tag-error ab-tag-row-error" role="alert">
                    {rowError}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
// AB:TIMER.TAGS:END
