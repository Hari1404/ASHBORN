// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The moving picture and the big title are replaced by stand-ins that show the props they were given: their own tests are in LearnScene.test.tsx and LearnTitle.test.tsx.
// The less-motion question is a switch of this file. Everything else (the glow hook, SpotGlow, the content and the rules) is the real thing.
vi.mock("@/components/LearnScene", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (p: { scene: string; colour: string; fraction?: number; lite?: number }) =>
      h("canvas", {
        id: "scene-stub",
        "data-scene": p.scene,
        "data-colour": p.colour,
        "data-fraction": String(p.fraction),
        "data-lite": p.lite === undefined ? "" : String(p.lite),
      }),
  }
})
vi.mock("@/components/LearnTitle", async () => {
  const { createElement: h } = await import("react")
  return { default: (p: { text: string; effect: string }) => h("h1", { id: "title-stub", "data-effect": p.effect }, p.text) }
})
const motion = vi.hoisted(() => ({ reduced: false }))
vi.mock("@/lib/learnMotion", () => ({ prefersReducedMotion: () => motion.reduced }))

import { SUBJECT_COLOURS } from "@/data/learn/subjectColours"
import { HUB_EFFECT, SUBJECT_EFFECT } from "@/lib/learnEffects"
import { LEARN_INDEX, type LearnFacts } from "@/lib/learnRules"
import { HOME_SCENE_COLOUR } from "@/lib/learnScenes"
import { hubTiles, tierClosedMessage } from "@/lib/learnView"
import type { GuideAddress } from "@/lib/screens"
import LearnScreen, { type LearnScreenProps } from "./LearnScreen"

// The Learn screen (Packet 12B, chunk 5), drawn into jsdom with the real content of Tier 1. jsdom has no layout, no Element.animate and no scrollIntoView: where a test needs one, it puts a recorder in place and takes it away after.
const HUB: GuideAddress = { subject: null, item: null }
const subject = (id: string, item: string | null = null): GuideAddress => ({ subject: id, item })

let root: Root | null = null
let container: HTMLElement | null = null
let onProve = vi.fn()
const proto = Element.prototype as unknown as { animate?: unknown; scrollIntoView?: unknown }

function props(address: GuideAddress, more: Partial<LearnScreenProps> = {}): LearnScreenProps {
  return { address, onProve, ...more }
}

function show(address: GuideAddress, more: Partial<LearnScreenProps> = {}): void {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(createElement(LearnScreen, props(address, more))))
}

function again(address: GuideAddress, more: Partial<LearnScreenProps> = {}): void {
  act(() => root?.render(createElement(LearnScreen, props(address, more))))
}

function q<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = container?.querySelector<T>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
}

function all<T extends HTMLElement = HTMLElement>(selector: string): T[] {
  return Array.from(container?.querySelectorAll<T>(selector) ?? [])
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function click(el: Element): void {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
  })
}

// React makes "enter" and "leave" from pointerover and pointerout, so the test sends those.
function pointerOver(el: Element, pointerType = "mouse"): void {
  act(() => {
    el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType, relatedTarget: null }))
  })
}

function pointerOutOfGrid(el: Element): void {
  act(() => {
    el.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse", relatedTarget: document.body }))
  })
}

function key(name: string): void {
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true }))
  })
}

function scene(): { scene: string; colour: string; fraction: number; lite: string } {
  const el = q("#scene-stub")
  return { scene: el.dataset.scene ?? "", colour: el.dataset.colour ?? "", fraction: Number(el.dataset.fraction), lite: el.dataset.lite ?? "" }
}

type AnimationCall = { target: Element; keyframes: unknown; options: unknown }
function recordAnimations(): AnimationCall[] {
  const calls: AnimationCall[] = []
  proto.animate = function (this: Element, keyframes: unknown, options: unknown) {
    calls.push({ target: this, keyframes, options })
    return {} as Animation
  }
  return calls
}

function doneFacts(ids: string[]): LearnFacts {
  return { items: Object.fromEntries(ids.map((id) => [id, { startedDay: "2026-11-01", doneDay: "2026-11-02" }])), regions: {} }
}

function itemIds(subjectId: string, regionKey?: string): string[] {
  const s = LEARN_INDEX.subjects.find((x) => x.id === subjectId)
  if (s === undefined) throw new Error("no subject " + subjectId)
  return s.regions.filter((r) => regionKey === undefined || r.key === regionKey).flatMap((r) => r.items.map((i) => i.id))
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  motion.reduced = false
  onProve = vi.fn()
  window.location.hash = ""
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  delete proto.animate
  delete proto.scrollIntoView
  window.location.hash = ""
})

describe("LearnScreen: the hub", () => {
  it("shows the word Subjects as the one heading, with the effect of the hub", () => {
    show(HUB)
    const heads = all("h1")
    expect(heads).toHaveLength(1)
    expect(heads[0]?.textContent).toBe("Subjects")
    expect(heads[0]?.dataset.effect).toBe(HUB_EFFECT)
  })

  it("has six tier tabs: Tier 1 open and selected with its count, the others closed", () => {
    show(HUB)
    const tabs = all("[role=tab]")
    expect(tabs).toHaveLength(6)
    expect(q("[role=tablist]").getAttribute("aria-label")).toBe("Tiers")
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true")
    expect(tabs[0]?.textContent).toContain("Tier 1")
    expect(tabs[0]?.textContent).toContain("0 / 147")
    expect(tabs[0]?.hasAttribute("aria-disabled")).toBe(false)
    tabs.slice(1).forEach((tab, i) => {
      expect(tab.getAttribute("aria-selected")).toBe("false")
      expect(tab.getAttribute("aria-disabled")).toBe("true")
      expect(tab.textContent).toContain(`Tier ${i + 2}`)
      expect(tab.textContent).toContain("not started")
      expect(tab.querySelector("svg")).not.toBeNull()
    })
  })

  it("draws the progress line of Tier 1 at nothing, and the closed tiers have none", () => {
    show(HUB)
    const lines = all(".ab-learn-tpg")
    expect(lines).toHaveLength(1)
    expect(lines[0]?.style.transform).toBe("scaleX(0)")
  })

  it("has one tile per subject, in the order of the content, each a real link", () => {
    show(HUB)
    const tiles = all<HTMLAnchorElement>(".ab-learn-subj")
    expect(tiles.map((t) => t.dataset.subject)).toEqual(["python", "numpy", "pandas", "terminal", "git", "la", "prob"])
    expect(tiles.map((t) => t.getAttribute("href"))).toEqual(["#guide/python", "#guide/numpy", "#guide/pandas", "#guide/terminal", "#guide/git", "#guide/la", "#guide/prob"])
    const python = tiles[0]
    expect(python?.querySelector(".ab-learn-tc")?.textContent).toBe("PY")
    expect(python?.querySelector(".ab-learn-tname")?.textContent).toBe("Python")
    expect(python?.querySelector(".ab-learn-tline")?.textContent).toBe("0 / 44 finished \u00b7 11 regions")
    expect(tiles[5]?.querySelector(".ab-learn-tname")?.textContent).toBe("Linear algebra")
  })

  it("gives every subject tile its own accent and the marker that works out its shade", () => {
    show(HUB)
    const tiles = all(".ab-learn-subj")
    expect(tiles).toHaveLength(7)
    const colours = hubTiles().map((t) => t.colour)
    tiles.forEach((tile, i) => {
      expect(tile.hasAttribute("data-accent")).toBe(true)
      expect(tile.style.getPropertyValue("--ab-learn-s")).toBe(colours[i])
    })
  })

  it("makes every subject tile a tilting tile with the glow as its last two children", () => {
    show(HUB)
    for (const tile of all(".ab-learn-subj")) {
      expect(tile.dataset.spot).toBe("tilt")
      expect(tile.lastElementChild?.className).toBe("ab-learn-spe")
      expect(tile.lastElementChild?.previousElementSibling?.className).toBe("ab-learn-spl")
    }
  })

  it("draws the progress line of each subject tile at nothing", () => {
    show(HUB)
    const lines = all(".ab-learn-spg")
    expect(lines).toHaveLength(7)
    lines.forEach((line) => expect(line.style.transform).toBe("scaleX(0)"))
  })

  it("shows the hub scene in the colour of the hub, as dim as nothing finished is", () => {
    show(HUB)
    expect(scene()).toEqual({ scene: "home", colour: HOME_SCENE_COLOUR, fraction: 0, lite: "" })
  })

  it("hands the lite level to the scene when it is given", () => {
    show(HUB, { lite: 2 })
    expect(scene().lite).toBe("2")
  })

  it("leaves the accent of the root alone, so the hub has the default", () => {
    show(HUB)
    expect(q("main").style.getPropertyValue("--ab-learn-s")).toBe("")
    expect(q("main").hasAttribute("data-accent")).toBe(true)
  })
})

describe("LearnScreen: the scene under the mouse", () => {
  it("shows the scene of a subject while a mouse rests on its tile, and the hub scene when it leaves", () => {
    show(HUB)
    const numpy = q(".ab-learn-subj[data-subject=numpy]")
    pointerOver(numpy)
    expect(scene()).toEqual({ scene: "numpy", colour: SUBJECT_COLOURS.numpy, fraction: 0, lite: "" })
    pointerOver(q(".ab-learn-subj[data-subject=git]"))
    expect(scene().scene).toBe("git")
    expect(scene().colour).toBe(SUBJECT_COLOURS.git)
    pointerOutOfGrid(q(".ab-learn-subj[data-subject=git]"))
    expect(scene()).toEqual({ scene: "home", colour: HOME_SCENE_COLOUR, fraction: 0, lite: "" })
  })

  it("does the same for a pen, but never for a finger", () => {
    show(HUB)
    pointerOver(q(".ab-learn-subj[data-subject=pandas]"), "pen")
    expect(scene().scene).toBe("pandas")
    pointerOutOfGrid(q(".ab-learn-subj[data-subject=pandas]"))
    pointerOver(q(".ab-learn-subj[data-subject=la]"), "touch")
    expect(scene().scene).toBe("home")
  })

  it("forgets the preview when a subject is opened, so the hub is the hub again on the way back", () => {
    show(HUB)
    pointerOver(q(".ab-learn-subj[data-subject=numpy]"))
    again(subject("python"))
    expect(scene().scene).toBe("python")
    again(HUB)
    expect(scene().scene).toBe("home")
  })

  it("shows the share finished as the brightness: the hub counts every subject, a previewed subject only its own", () => {
    show(HUB, { facts: doneFacts(itemIds("terminal")) })
    expect(scene().fraction).toBeCloseTo(7 / 147, 6)
    pointerOver(q(".ab-learn-subj[data-subject=terminal]"))
    expect(scene().fraction).toBe(1)
    pointerOver(q(".ab-learn-subj[data-subject=git]"))
    expect(scene().fraction).toBe(0)
  })
})

describe("LearnScreen: a tier that is closed", () => {
  it("says so when it is tapped, in a status line", () => {
    show(HUB)
    expect(q("[role=status]").textContent).toBe("")
    click(q("[role=tab][data-tier='3']"))
    expect(q("[role=status]").textContent).toBe(tierClosedMessage(3))
    expect(q("[role=status]").textContent).toBe("Tier 3 is closed. It opens only when you say so.")
    click(q("[role=tab][data-tier='5']"))
    expect(q("[role=status]").textContent).toBe("Tier 5 is closed. It opens only when you say so.")
  })

  it("shakes the tab that was tapped and fades the line in", () => {
    const calls = recordAnimations()
    show(HUB)
    const tab = q("[role=tab][data-tier='2']")
    click(tab)
    const shake = calls.find((c) => c.target === tab)
    expect(shake).toBeDefined()
    expect(shake?.keyframes).toHaveLength(5)
    expect(shake?.options).toMatchObject({ duration: 320 })
    const fade = calls.find((c) => c.target === q("[role=status]"))
    expect(fade).toBeDefined()
    expect(fade?.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }])
  })

  it("shakes and fades again when the same tier is tapped again", () => {
    const calls = recordAnimations()
    show(HUB)
    const tab = q("[role=tab][data-tier='4']")
    click(tab)
    click(tab)
    expect(calls.filter((c) => c.target === tab)).toHaveLength(2)
    expect(calls.filter((c) => c.target === q("[role=status]"))).toHaveLength(2)
  })

  it("does not shake with less motion, and still says it is closed", () => {
    motion.reduced = true
    const calls = recordAnimations()
    show(HUB)
    const tab = q("[role=tab][data-tier='6']")
    click(tab)
    expect(calls.filter((c) => c.target === tab)).toHaveLength(0)
    expect(q("[role=status]").textContent).toBe(tierClosedMessage(6))
  })

  it("works in a browser that cannot animate (nothing shakes, nothing breaks)", () => {
    show(HUB)
    click(q("[role=tab][data-tier='2']"))
    expect(q("[role=status]").textContent).toBe(tierClosedMessage(2))
  })

  it("does nothing when the open tier is tapped", () => {
    const calls = recordAnimations()
    show(HUB)
    click(q("[role=tab][aria-selected=true]"))
    expect(calls).toHaveLength(0)
    expect(q("[role=status]").textContent).toBe("")
  })

  it("is replaced on the line by the message of a closed tier, when there was a notice", () => {
    show(subject("nope"))
    expect(q("[role=status]").textContent).toContain("There is no subject")
    click(q("[role=tab][data-tier='2']"))
    expect(q("[role=status]").textContent).toBe(tierClosedMessage(2))
  })
})

describe("LearnScreen: a subject", () => {
  it("shows the name of each subject as the one heading, with the effect of that subject", () => {
    for (const tile of hubTiles()) {
      show(subject(tile.id))
      const heads = all("h1")
      expect(heads).toHaveLength(1)
      expect(heads[0]?.textContent).toBe(tile.name)
      expect(heads[0]?.dataset.effect).toBe(SUBJECT_EFFECT[tile.id])
      act(() => root?.unmount())
      container?.remove()
    }
    root = null
    container = null
  })

  it("has a way back to the hub and the caption of the subject", () => {
    show(subject("python"))
    const back = q<HTMLAnchorElement>(".ab-learn-back")
    expect(back.getAttribute("href")).toBe("#guide")
    expect(back.textContent).toBe("\u2190 Subjects")
    expect(q(".ab-learn-cap").textContent).toBe("Learn \u00b7 PY")
  })

  it("has one section per region, each named by its heading", () => {
    show(subject("python"))
    const sections = all("section.ab-learn-region")
    expect(sections).toHaveLength(11)
    for (const section of sections) {
      const heading = section.querySelector("h2")
      expect(heading).not.toBeNull()
      expect(section.getAttribute("aria-labelledby")).toBe(heading?.id)
    }
    expect(sections[0]?.querySelector("h2")?.textContent).toBe("Region A \u00b7 Values and variables")
    expect(sections[0]?.querySelector(".ab-learn-rcount")?.textContent).toBe("0 / 5 finished")
    expect(sections[0]?.querySelector(".ab-learn-idea")?.textContent).toBe("A program keeps values under names, computes with them and shows the result.")
    expect(sections[10]?.querySelector("h2")?.textContent).toBe("Region K \u00b7 Randomness")
  })

  it("shows every item of the subject as a tile, in the order of the content", () => {
    show(subject("python"))
    const tiles = all<HTMLAnchorElement>(".ab-learn-item")
    expect(tiles).toHaveLength(44)
    expect(tiles.map((t) => t.dataset.item)).toEqual(itemIds("python"))
    expect(tiles[0]?.getAttribute("href")).toBe("#guide/python/PY-1")
    expect(tiles[5]?.querySelector(".ab-learn-tc")?.textContent).toBe("PY-6")
    expect(tiles[5]?.querySelector(".ab-learn-tname")?.textContent).toBe("Index and slice text")
  })

  it("puts the items of each region in its own grid", () => {
    show(subject("git"))
    const counts = all("section.ab-learn-region").map((s) => s.querySelectorAll(".ab-learn-item").length)
    expect(counts).toEqual([6, 4, 5, 5])
  })

  it("shows the code of an idea line in a code font, never as raw html", () => {
    show(subject("python"))
    const region = all("section.ab-learn-region")[9]
    expect(region?.querySelector("h2")?.textContent).toBe("Region J \u00b7 Numbers on a computer")
    const codes = Array.from(region?.querySelectorAll("code.ab-learn-code") ?? []).map((c) => c.textContent)
    expect(codes).toEqual(["inf", "nan"])
    expect(region?.querySelector(".ab-learn-idea")?.textContent).not.toContain("`")
  })

  it("makes every item tile a tilting tile that ends with the glow", () => {
    show(subject("numpy"))
    const tiles = all(".ab-learn-item")
    expect(tiles).toHaveLength(23)
    for (const tile of tiles) {
      expect(tile.dataset.spot).toBe("tilt")
      expect(tile.lastElementChild?.className).toBe("ab-learn-spe")
      expect(tile.hasAttribute("data-done")).toBe(false)
      expect(tile.hasAttribute("aria-current")).toBe(false)
    }
  })

  it("draws every region bar empty and none of them as finished", () => {
    show(subject("pandas"))
    const bars = all(".ab-learn-pbr")
    expect(bars).toHaveLength(6)
    for (const bar of bars) {
      expect(bar.querySelector("i")?.style.transform).toBe("scaleX(0)")
      expect(bar.hasAttribute("data-all")).toBe(false)
    }
  })

  it("sets the accent of the subject on the root, with the marker for its shade", () => {
    show(subject("la"))
    expect(q("main").style.getPropertyValue("--ab-learn-s")).toBe(SUBJECT_COLOURS.la)
    expect(q("main").hasAttribute("data-accent")).toBe(true)
  })

  it("follows the subject: a new subject changes the accent and the scene", () => {
    show(subject("python"))
    expect(scene()).toEqual({ scene: "python", colour: SUBJECT_COLOURS.python, fraction: 0, lite: "" })
    again(subject("prob"))
    expect(q("main").style.getPropertyValue("--ab-learn-s")).toBe(SUBJECT_COLOURS.prob)
    expect(scene().scene).toBe("prob")
    expect(scene().colour).toBe(SUBJECT_COLOURS.prob)
    expect(q("h1").textContent).toBe("Probability")
  })

  it("has no tile of the hub inside a subject, and the hub has no region", () => {
    show(subject("python"))
    expect(has(".ab-learn-subj")).toBe(false)
    expect(has(".ab-learn-tiers")).toBe(false)
    again(HUB)
    expect(has("section.ab-learn-region")).toBe(false)
    expect(has(".ab-learn-back")).toBe(false)
  })
})

describe("LearnScreen: the item that the address names", () => {
  it("marks that tile and no other, and scrolls it to the middle", () => {
    const scrolled: { target: Element; arg: unknown }[] = []
    proto.scrollIntoView = function (this: Element, arg: unknown) {
      scrolled.push({ target: this, arg })
    }
    show(subject("python", "PY-14"))
    const marked = all("[data-marked=true]")
    expect(marked).toHaveLength(1)
    expect(marked[0]?.dataset.item).toBe("PY-14")
    expect(marked[0]?.getAttribute("aria-current")).toBe("true")
    expect(all("[aria-current]")).toHaveLength(1)
    expect(scrolled).toHaveLength(1)
    expect(scrolled[0]?.target).toBe(marked[0])
    expect(scrolled[0]?.arg).toEqual({ block: "center", behavior: "smooth" })
  })

  it("scrolls without animation when the person asked for less motion", () => {
    motion.reduced = true
    const scrolled: unknown[] = []
    proto.scrollIntoView = (arg: unknown) => {
      scrolled.push(arg)
    }
    show(subject("python", "PY-14"))
    expect(scrolled).toEqual([{ block: "center", behavior: "auto" }])
  })

  it("is lenient with letters: py-14 marks PY-14", () => {
    show(subject("Python", "py-14"))
    expect(q("[data-marked=true]").dataset.item).toBe("PY-14")
  })

  it("moves the mark, and scrolls again, when the address moves to another item", () => {
    const scrolled: Element[] = []
    proto.scrollIntoView = function (this: Element) {
      scrolled.push(this)
    }
    show(subject("python", "PY-14"))
    again(subject("python", "PY-15"))
    expect(all("[data-marked=true]").map((t) => t.dataset.item)).toEqual(["PY-15"])
    expect(scrolled.map((t) => (t as HTMLElement).dataset.item)).toEqual(["PY-14", "PY-15"])
  })

  it("marks nothing and does not scroll to a tile when the address has no item", () => {
    const scrolled: Element[] = []
    proto.scrollIntoView = function (this: Element) {
      scrolled.push(this)
    }
    show(subject("python"))
    expect(has("[data-marked]")).toBe(false)
    expect(scrolled).toHaveLength(0)
  })

  it("opens the subject with a notice when the item does not exist", () => {
    show(subject("python", "PY-999"))
    expect(q("h1").textContent).toBe("Python")
    expect(has("[data-marked]")).toBe(false)
    expect(q("[role=status]").textContent).toBe('There is no item "PY-999" in Python.')
  })

  it("opens the subject with a notice when the item belongs to another subject", () => {
    show(subject("python", "NP-1"))
    expect(q("h1").textContent).toBe("Python")
    expect(has("[data-marked]")).toBe(false)
    expect(q("[role=status]").textContent).toContain("There is no item")
  })

  it("opens the hub with a notice when the subject does not exist", () => {
    show(subject("nope"))
    expect(q("h1").textContent).toBe("Subjects")
    expect(q("[role=status]").textContent).toBe('There is no subject "nope". These are the subjects.')
  })

  it("has no notice for an address that exists", () => {
    show(subject("python", "PY-14"))
    expect(q("[role=status]").textContent).toBe("")
  })
})

describe("LearnScreen: where the page starts", () => {
  it("goes to the top when a subject opens and when the hub comes back", () => {
    show(HUB)
    const main = q("main")
    const writes: number[] = []
    Object.defineProperty(main, "scrollTop", { configurable: true, get: () => 0, set: (v: number) => void writes.push(v) })
    again(subject("python"))
    again(HUB)
    again(subject("numpy"))
    expect(writes).toEqual([0, 0, 0])
  })
})

describe("LearnScreen: the address in the page", () => {
  it("replaces a loose address by the exact one, with no new step in the history", () => {
    window.location.hash = "#guide/Python"
    const steps = window.history.length
    show(subject("Python"))
    expect(window.location.hash).toBe("#guide/python")
    expect(window.history.length).toBe(steps)
  })

  it("does the same for an item: py-14 becomes PY-14", () => {
    window.location.hash = "#guide/python/py-14"
    show(subject("python", "py-14"))
    expect(window.location.hash).toBe("#guide/python/PY-14")
  })

  it("brings the address of a place that does not exist to the place that opened", () => {
    window.location.hash = "#guide/nope"
    show(subject("nope"))
    expect(window.location.hash).toBe("#guide")
    expect(q("[role=status]").textContent).toContain("There is no subject")
    window.location.hash = "#guide/python/PY-999"
    again(subject("python", "PY-999"))
    expect(window.location.hash).toBe("#guide/python")
  })

  it("leaves an exact address alone", () => {
    window.location.hash = "#guide/python/PY-14"
    const replace = vi.spyOn(window.history, "replaceState")
    show(subject("python", "PY-14"))
    expect(replace).not.toHaveBeenCalled()
    replace.mockRestore()
    expect(window.location.hash).toBe("#guide/python/PY-14")
  })

  it("never touches an address that is no longer the Guide", () => {
    window.location.hash = "#timer"
    show(subject("Python"))
    expect(window.location.hash).toBe("#timer")
  })
})

describe("LearnScreen: the keyboard", () => {
  it("puts the keyboard on the way back when a subject opens", () => {
    show(subject("python"))
    expect(document.activeElement).toBe(q(".ab-learn-back"))
  })

  it("puts the keyboard on nothing in particular when the hub opens first", () => {
    show(HUB)
    expect(document.activeElement).toBe(document.body)
  })

  it("puts the keyboard on the tile of the subject just left when the hub comes back", () => {
    show(HUB)
    again(subject("pandas"))
    again(HUB)
    expect(document.activeElement).toBe(q(".ab-learn-subj[data-subject=pandas]"))
    again(subject("git"))
    again(HUB)
    expect(document.activeElement).toBe(q(".ab-learn-subj[data-subject=git]"))
  })

  it("goes back to the hub with Escape in a subject", () => {
    window.location.hash = "#guide/python"
    show(subject("python"))
    key("Escape")
    expect(window.location.hash).toBe("#guide")
  })

  it("does nothing with other keys", () => {
    window.location.hash = "#guide/python"
    show(subject("python"))
    key("Enter")
    key("a")
    expect(window.location.hash).toBe("#guide/python")
  })

  it("does nothing with Escape on the hub", () => {
    window.location.hash = "#guide"
    show(HUB)
    key("Escape")
    expect(window.location.hash).toBe("#guide")
  })

  it("stops listening when the subject is left", () => {
    window.location.hash = "#guide/python"
    show(subject("python"))
    again(HUB)
    window.location.hash = "#guide/elsewhere"
    key("Escape")
    expect(window.location.hash).toBe("#guide/elsewhere")
  })

  it("does nothing with Escape while the trip runs", () => {
    window.location.hash = "#guide/python"
    show(subject("python"), { proving: true })
    key("Escape")
    expect(window.location.hash).toBe("#guide/python")
    again(subject("python"), { proving: false })
    key("Escape")
    expect(window.location.hash).toBe("#guide")
  })
})

describe("LearnScreen: the Learn and Prove switch", () => {
  it("has Learn pressed and Prove not, in a group with a name", () => {
    show(HUB)
    const group = q("[role=group]")
    expect(group.getAttribute("aria-label")).toBe("Learn or Prove")
    const buttons = Array.from(group.querySelectorAll("button"))
    expect(buttons.map((b) => b.textContent)).toEqual(["Learn", "Prove"])
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual(["true", "false"])
    expect(buttons.every((b) => !b.disabled)).toBe(true)
  })

  it("asks for the trip once when Prove is pressed, and not for Learn", () => {
    show(HUB)
    const [learn, prove] = Array.from(q("[role=group]").querySelectorAll("button"))
    click(learn as HTMLElement)
    expect(onProve).not.toHaveBeenCalled()
    click(prove as HTMLElement)
    expect(onProve).toHaveBeenCalledTimes(1)
  })

  it("is the same in a subject", () => {
    show(subject("python"))
    const prove = Array.from(q("[role=group]").querySelectorAll("button"))[1]
    click(prove as HTMLElement)
    expect(onProve).toHaveBeenCalledTimes(1)
  })

  it("turns both buttons off while the trip runs, so it cannot be asked twice", () => {
    show(HUB, { proving: true })
    const buttons = Array.from(q("[role=group]").querySelectorAll("button"))
    expect(buttons.every((b) => b.disabled)).toBe(true)
    click(buttons[1] as HTMLElement)
    expect(onProve).not.toHaveBeenCalled()
    again(HUB, { proving: false })
    expect(Array.from(q("[role=group]").querySelectorAll("button")).every((b) => !b.disabled)).toBe(true)
  })
})

describe("LearnScreen: what is finished", () => {
  it("shows a finished subject on the hub with its tick, its lit edge and a full line", () => {
    show(HUB, { facts: doneFacts(itemIds("terminal")) })
    const tile = q(".ab-learn-subj[data-subject=terminal]")
    expect(tile.dataset.done).toBe("true")
    expect(tile.querySelector(".ab-learn-bdg")).not.toBeNull()
    expect(tile.querySelector(".ab-learn-tline")?.textContent).toBe("Finished \u00b7 2 regions")
    expect(tile.querySelector<HTMLElement>(".ab-learn-spg")?.style.transform).toBe("scaleX(1)")
    expect(tile.lastElementChild?.className).toBe("ab-learn-spe")
    expect(q(".ab-learn-subj[data-subject=git]").hasAttribute("data-done")).toBe(false)
    expect(q(".ab-learn-subj[data-subject=git]").querySelector(".ab-learn-bdg")).toBeNull()
  })

  it("counts the items of the open tier on its tab and its line", () => {
    const ids = [...itemIds("terminal"), ...itemIds("la")]
    show(HUB, { facts: doneFacts(ids) })
    const tab = q("[role=tab][aria-selected=true]")
    expect(tab.textContent).toContain("20 / 147")
    expect(tab.querySelector<HTMLElement>(".ab-learn-tpg")?.style.transform).toBe(`scaleX(${20 / 147})`)
  })

  it("shows a finished region in a subject with its tick, its full bar and the words Region finished", () => {
    const done = itemIds("git", "git/A")
    show(subject("git"), { facts: doneFacts(done) })
    const [first, second] = all("section.ab-learn-region")
    expect(first?.querySelector(".ab-learn-rcount")?.textContent).toBe("Region finished")
    expect(first?.querySelector<HTMLElement>(".ab-learn-rcount")?.dataset.done).toBe("true")
    expect(first?.querySelector<HTMLElement>(".ab-learn-pbr")?.dataset.all).toBe("true")
    expect(first?.querySelector(".ab-learn-pbr i")?.getAttribute("style")).toContain("scaleX(1)")
    const tiles = Array.from(first?.querySelectorAll<HTMLElement>(".ab-learn-item") ?? [])
    expect(tiles).toHaveLength(6)
    for (const tile of tiles) {
      expect(tile.dataset.done).toBe("true")
      expect(tile.querySelector(".ab-learn-bdg")).not.toBeNull()
      expect(tile.lastElementChild?.className).toBe("ab-learn-spe")
      expect(tile.getAttribute("aria-label")).toMatch(/^GT-\d+ .+, finished$/)
    }
    expect(second?.querySelector(".ab-learn-rcount")?.textContent).toBe("0 / 4 finished")
    expect(second?.querySelector(".ab-learn-pbr")?.hasAttribute("data-all")).toBe(false)
    expect(second?.querySelector(".ab-learn-bdg")).toBeNull()
  })

  it("lights the scene by the share finished in the subject", () => {
    show(subject("git"), { facts: doneFacts(itemIds("git", "git/A")) })
    expect(scene().fraction).toBeCloseTo(6 / 20, 6)
  })
})

describe("LearnScreen: the glow and the tilt are wired to the tiles", () => {
  it("writes the place of the mouse into a subject tile", () => {
    const frames: FrameRequestCallback[] = []
    const realRaf = window.requestAnimationFrame
    window.requestAnimationFrame = (run: FrameRequestCallback) => frames.push(run)
    try {
      show(HUB)
      const tile = q(".ab-learn-subj[data-subject=numpy]")
      tile.getBoundingClientRect = () => ({ left: 100, top: 50, width: 200, height: 100, right: 300, bottom: 150, x: 100, y: 50, toJSON: () => ({}) })
      Object.defineProperty(tile, "offsetWidth", { configurable: true, value: 200 })
      act(() => {
        tile.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 150, clientY: 75, pointerType: "mouse" }))
      })
      act(() => frames.splice(0).forEach((run) => run(0)))
      expect(tile.style.getPropertyValue("--ab-learn-mx")).not.toBe("")
      expect(tile.style.getPropertyValue("--ab-learn-my")).not.toBe("")
      expect(tile.style.getPropertyValue("--ab-learn-rot-y")).not.toBe("")
    } finally {
      window.requestAnimationFrame = realRaf
    }
  })
})

describe("LearnScreen: the shape of the page", () => {
  it("is one main with the scene first, then the top bar, then the page", () => {
    show(HUB)
    const main = q("main")
    expect(all("main")).toHaveLength(1)
    expect(main.getAttribute("aria-label")).toBe("Learn")
    expect(Array.from(main.children).map((c) => c.className || c.tagName.toLowerCase())).toEqual(["canvas", "ab-learn-bar", "ab-learn-page"])
    again(subject("python"))
    expect(Array.from(q("main").children).map((c) => c.className || c.tagName.toLowerCase())).toEqual(["canvas", "ab-learn-bar", "ab-learn-page"])
  })

  it("keeps the switch above the page in the reading order and the page one heading, in the hub and in a subject", () => {
    show(HUB)
    expect(all("h1")).toHaveLength(1)
    again(subject("terminal"))
    expect(all("h1")).toHaveLength(1)
    expect(all("h2").length).toBe(2)
  })

  it("uses no id twice", () => {
    show(subject("python"))
    const ids = all("[id]").map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("has no tile that is a button or a dead link: every tile has a real address", () => {
    show(HUB)
    for (const tile of all<HTMLAnchorElement>(".ab-learn-subj")) expect(tile.getAttribute("href")).toMatch(/^#guide\/[a-z]+$/)
    again(subject("python"))
    for (const tile of all<HTMLAnchorElement>(".ab-learn-item")) expect(tile.getAttribute("href")).toMatch(/^#guide\/python\/PY-\d+$/)
  })
})
