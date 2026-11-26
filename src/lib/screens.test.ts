// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SCREENS, guideHash, parseAddress, useGuideAddress, useScreen, type GuideAddress, type ScreenId } from "./screens"

// The reading of the page address (Packet 12B): which screen it names, and for the Guide the subject and the item after it.
// Here the words are only split. Whether the subject or the item exists is tested with the Learn screen (src/lib/learnView.test.ts).
const NONE: GuideAddress = { subject: null, item: null }

describe("parseAddress: the screens", () => {
  it.each([
    ["#overview", "overview"],
    ["#timer", "timer"],
    ["#calendar", "calendar"],
    ["#guide", "guide"],
  ] as const)("reads %j as the %s screen with nothing after it", (hash, screen) => {
    expect(parseAddress(hash)).toEqual({ screen, guide: NONE })
  })

  it("knows every screen of SCREENS by its id", () => {
    expect(SCREENS.map((s) => parseAddress(`#${s.id}`).screen)).toEqual(SCREENS.map((s) => s.id))
  })

  it.each(["", "#", "#nonsense", "#Guide", "#guide-me", "#GUIDE/python", "#nonsense/python/PY-1"])("opens the Overview for %j", (hash) => {
    expect(parseAddress(hash)).toEqual({ screen: "overview", guide: NONE })
  })

  it("reads an address without the sign # in front as well", () => {
    expect(parseAddress("guide/python")).toEqual({ screen: "guide", guide: { subject: "python", item: null } })
    expect(parseAddress("timer")).toEqual({ screen: "timer", guide: NONE })
  })
})

describe("parseAddress: the Guide", () => {
  it("reads a subject", () => {
    expect(parseAddress("#guide/python")).toEqual({ screen: "guide", guide: { subject: "python", item: null } })
  })

  it("reads a subject and an item", () => {
    expect(parseAddress("#guide/python/PY-14")).toEqual({ screen: "guide", guide: { subject: "python", item: "PY-14" } })
  })

  it("only splits the words: it keeps the letters as they are written", () => {
    expect(parseAddress("#guide/Python/py-14")).toEqual({ screen: "guide", guide: { subject: "Python", item: "py-14" } })
  })

  it("does not look at whether the subject or the item exists", () => {
    expect(parseAddress("#guide/nothing/ZZ-99")).toEqual({ screen: "guide", guide: { subject: "nothing", item: "ZZ-99" } })
  })

  it.each(["#timer/python", "#overview/python", "#calendar/a/b"])("opens the Overview for %j: only the Guide takes more words", (hash) => {
    expect(parseAddress(hash)).toEqual({ screen: "overview", guide: NONE })
  })

  it("opens the Overview when there are more than two words after guide", () => {
    expect(parseAddress("#guide/python/PY-14/more")).toEqual({ screen: "overview", guide: NONE })
    expect(parseAddress("#guide/python/PY-14/")).toEqual({ screen: "overview", guide: NONE })
  })

  it.each(["#guide/", "#guide//PY-14", "#guide/py%20thon", "#guide/py_thon", "#guide/py.thon", "#guide/pythön"])(
    "opens the Guide with no subject when the first word has other characters than letters, digits and a dash: %j",
    (hash) => {
      expect(parseAddress(hash)).toEqual({ screen: "guide", guide: NONE })
    },
  )

  it.each(["#guide/python/", "#guide/python/PY_14", "#guide/python/PY%2014", "#guide/python/PY.14"])(
    "keeps the subject and drops the item when the item word has other characters: %j",
    (hash) => {
      expect(parseAddress(hash)).toEqual({ screen: "guide", guide: { subject: "python", item: null } })
    },
  )

  it("accepts a dash and digits in a subject (the ids of later tiers can have them)", () => {
    expect(parseAddress("#guide/tier-2/AB-1")).toEqual({ screen: "guide", guide: { subject: "tier-2", item: "AB-1" } })
  })
})

describe("guideHash", () => {
  it("writes the hub, a subject and an item", () => {
    expect(guideHash()).toBe("#guide")
    expect(guideHash("python")).toBe("#guide/python")
    expect(guideHash("python", "PY-14")).toBe("#guide/python/PY-14")
  })

  it.each([null, undefined, ""])("writes the hub when the subject is %j, even with an item", (subject) => {
    expect(guideHash(subject)).toBe("#guide")
    expect(guideHash(subject, "PY-14")).toBe("#guide")
  })

  it.each([null, undefined, ""])("writes the subject alone when the item is %j", (item) => {
    expect(guideHash("numpy", item)).toBe("#guide/numpy")
  })

  it("is read back by parseAddress, for the hub, a subject and an item", () => {
    expect(parseAddress(guideHash())).toEqual({ screen: "guide", guide: NONE })
    expect(parseAddress(guideHash("la"))).toEqual({ screen: "guide", guide: { subject: "la", item: null } })
    expect(parseAddress(guideHash("prob", "PB-4"))).toEqual({ screen: "guide", guide: { subject: "prob", item: "PB-4" } })
  })
})

// A small stand-in screen that records what the two hooks gave at every draw.
type Seen = { screens: ScreenId[]; guides: GuideAddress[] }
function Probe({ seen }: { seen: Seen }) {
  const screen = useScreen()
  const guide = useGuideAddress()
  seen.screens.push(screen)
  seen.guides.push(guide)
  return createElement("p", { "data-screen": screen, "data-subject": guide.subject ?? "", "data-item": guide.item ?? "" })
}

let root: Root | null = null
let container: HTMLElement | null = null
let seen: Seen = { screens: [], guides: [] }

function open(hash: string): void {
  window.location.hash = hash
  seen = { screens: [], guides: [] }
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(createElement(Probe, { seen })))
}

function go(hash: string): void {
  act(() => {
    window.location.hash = hash
    window.dispatchEvent(new Event("hashchange"))
  })
}

function shown(): { screen: string | undefined; subject: string | undefined; item: string | undefined } {
  const p = container?.querySelector("p")
  return { screen: p?.dataset.screen, subject: p?.dataset.subject, item: p?.dataset.item }
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
  vi.restoreAllMocks()
})

describe("useScreen and useGuideAddress", () => {
  it("read the address when the screen opens", () => {
    open("#guide/python/PY-14")
    expect(shown()).toEqual({ screen: "guide", subject: "python", item: "PY-14" })
  })

  it("follow the address when it changes", () => {
    open("#overview")
    expect(shown()).toEqual({ screen: "overview", subject: "", item: "" })
    go("#guide")
    expect(shown()).toEqual({ screen: "guide", subject: "", item: "" })
    go("#guide/numpy")
    expect(shown()).toEqual({ screen: "guide", subject: "numpy", item: "" })
    go("#guide/numpy/NP-3")
    expect(shown()).toEqual({ screen: "guide", subject: "numpy", item: "NP-3" })
    go("#timer")
    expect(shown()).toEqual({ screen: "timer", subject: "", item: "" })
  })

  it("keep the screen as it is while only the words after guide change", () => {
    open("#guide")
    go("#guide/python")
    go("#guide/python/PY-2")
    expect(new Set(seen.screens)).toEqual(new Set(["guide"]))
  })

  it("give the same object again while the words after guide are the same", () => {
    open("#guide/python/PY-14")
    const first = seen.guides[seen.guides.length - 1]
    go("#guide/python/PY-14")
    go("#guide/python/PY-14")
    expect(seen.guides[seen.guides.length - 1]).toBe(first)
    go("#guide/python/PY-15")
    expect(seen.guides[seen.guides.length - 1]).not.toBe(first)
  })

  it("give no subject and no item for an address that is not the Guide", () => {
    open("#guide/python/PY-14")
    go("#timer")
    expect(shown()).toEqual({ screen: "timer", subject: "", item: "" })
    go("#guide/nothing/extra/words")
    expect(shown()).toEqual({ screen: "overview", subject: "", item: "" })
  })

  it("stop listening to the address when the screen goes away", () => {
    const add = vi.spyOn(window, "addEventListener")
    const remove = vi.spyOn(window, "removeEventListener")
    open("#guide")
    const added = add.mock.calls.filter((c) => c[0] === "hashchange").length
    expect(added).toBe(2) // one for each hook
    act(() => root?.unmount())
    root = null
    expect(remove.mock.calls.filter((c) => c[0] === "hashchange").length).toBe(2)
  })
})
