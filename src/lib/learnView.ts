// AB:LEARN.VIEW:START
// What the Learn screen shows, worked out from the content and the facts (Packet 12B, DECISIONS_LEARN.md sections 13 and 16).
// Pure functions: no screen, no clock, no database. The screen (src/components/LearnScreen.tsx) only draws what is returned here.
// Read only for now: the facts are NO_FACTS until the database arrives (12C, 12D), so every count is 0 / n and no tile is done.
// Every function takes the index and the facts as arguments (the real ones by default), so the tests can use small content.
// The address words come from src/lib/screens.ts (parseAddress). Here they are matched against the content (resolveGuideAddress).
// See CONNECTIONS.md C74.
import type { SubjectId } from "../data/learn/subjectColours"
import { SUBJECT_COLOURS } from "../data/learn/subjectColours"
import type { GuideAddress } from "./screens"
import { guideHash } from "./screens"
import { LEARN_INDEX, NO_FACTS, subjectProgress, type LearnFacts, type LearnIndex } from "./learnRules"

// ---- The tiers ----
// Six tiers. Only Tier 1 has content and is open. The others are closed on purpose: they open "only when you say so".
export const TIER_COUNT = 6
export const OPEN_TIER = 1

export function tierClosedMessage(n: number): string {
  return `Tier ${n} is closed. It opens only when you say so.`
}

export type TierTab = {
  n: number
  open: boolean
  label: string // "Tier 1"
  count: string // "0 / 147" for the open tier, "not started" for a closed one
  progress: number // 0 to 1; always 0 for a closed tier
  finished: boolean
}

export function tierTabs(index: LearnIndex = LEARN_INDEX, facts: LearnFacts = NO_FACTS): TierTab[] {
  let done = 0
  let total = 0
  for (const s of index.subjects) {
    const p = subjectProgress(index, s.id, facts)
    done += p.done
    total += p.total
  }
  const tabs: TierTab[] = []
  for (let n = 1; n <= TIER_COUNT; n += 1) {
    if (n === OPEN_TIER) {
      tabs.push({
        n,
        open: true,
        label: `Tier ${n}`,
        count: `${done} / ${total}`,
        progress: total === 0 ? 0 : done / total,
        finished: total > 0 && done === total,
      })
    } else {
      tabs.push({ n, open: false, label: `Tier ${n}`, count: "not started", progress: 0, finished: false })
    }
  }
  return tabs
}

// ---- Words in the content ----
// The content marks code with backticks. The screen shows it in a code font, never as raw HTML.
export type TextPart = { text: string; code: boolean }

export function inlineParts(text: string): TextPart[] {
  const parts: TextPart[] = []
  const pieces = text.split("`")
  pieces.forEach((piece, i) => {
    // An odd number of backticks leaves the last piece without its closing mark: it stays plain text.
    const code = i % 2 === 1 && i < pieces.length - 1
    const shown = code ? piece : i % 2 === 1 ? "`" + piece : piece
    if (shown === "") return
    const last = parts[parts.length - 1]
    if (last !== undefined && last.code === code) last.text += shown
    else parts.push({ text: shown, code })
  })
  return parts
}

// The same text without the backtick marks (a tile title, an aria-label).
export function plainText(text: string): string {
  return text.replace(/`/g, "")
}

export function capFirst(text: string): string {
  return text === "" ? text : text.charAt(0).toUpperCase() + text.slice(1)
}

// The letter of a region as it is shown: "NP-A" and "PD-F" show "F" and "A", "TA" shows "A", "D" stays "D".
export function regionLetter(id: string): string {
  const noPrefix = id.replace(/^[A-Z]{2}-/, "")
  return noPrefix.replace(/^T(?=[A-Z]$)/, "")
}

// ---- The hub: one tile per subject ----
export type HubTile = {
  id: SubjectId
  code: string
  name: string
  colour: string
  done: number
  total: number
  regions: number
  finished: boolean
  progress: number // 0 to 1
  line: string // "0 / 21 finished, 11 regions" as two parts, see lineDone and lineRegions
  lineDone: string // "0 / 21 finished" or "Finished"
  lineRegions: string // "11 regions"
}

function regionsText(n: number): string {
  return n === 1 ? "1 region" : `${n} regions`
}

export function hubTiles(index: LearnIndex = LEARN_INDEX, facts: LearnFacts = NO_FACTS): HubTile[] {
  return index.subjects.map((s) => {
    const p = subjectProgress(index, s.id, facts)
    const finished = p.total > 0 && p.done === p.total
    const lineDone = finished ? "Finished" : `${p.done} / ${p.total} finished`
    const lineRegions = regionsText(s.regions.length)
    return {
      id: s.id,
      code: s.code,
      name: s.name,
      colour: SUBJECT_COLOURS[s.id],
      done: p.done,
      total: p.total,
      regions: s.regions.length,
      finished,
      progress: p.total === 0 ? 0 : p.done / p.total,
      line: `${lineDone} \u00b7 ${lineRegions}`,
      lineDone,
      lineRegions,
    }
  })
}

// ---- The subject view: regions, each with its item tiles ----
export type ItemTile = { id: string; code: string; title: string; done: boolean }

export type RegionSection = {
  key: string
  letter: string // "A"
  heading: string // "Region A \u00b7 Values and variables"
  name: string
  idea: TextPart[] // the idea line, first letter capital, code marked
  done: number
  total: number
  finished: boolean
  progress: number // 0 to 1
  count: string // "0 / 5 finished" or "Region finished"
  items: ItemTile[]
}

export type SubjectView = {
  id: SubjectId
  code: string
  name: string
  colour: string
  done: number
  total: number
  regions: RegionSection[]
}

export function subjectView(subject: SubjectId, index: LearnIndex = LEARN_INDEX, facts: LearnFacts = NO_FACTS): SubjectView | null {
  const s = index.subjects.find((x) => x.id === subject)
  if (s === undefined) return null
  let done = 0
  let total = 0
  const regions: RegionSection[] = s.regions.map((r) => {
    const items: ItemTile[] = r.items.map((item) => ({
      id: item.id,
      code: item.id,
      title: plainText(item.t),
      done: facts.items[item.id]?.doneDay != null,
    }))
    const regionDone = items.filter((i) => i.done).length
    const finished = items.length > 0 && regionDone === items.length
    done += regionDone
    total += items.length
    const letter = regionLetter(r.id)
    return {
      key: r.key,
      letter,
      heading: `Region ${letter} \u00b7 ${r.n}`,
      name: r.n,
      idea: inlineParts(capFirst(r.idea)),
      done: regionDone,
      total: items.length,
      finished,
      progress: items.length === 0 ? 0 : regionDone / items.length,
      count: finished ? "Region finished" : `${regionDone} / ${items.length} finished`,
      items,
    }
  })
  return { id: s.id, code: s.code, name: s.name, colour: SUBJECT_COLOURS[s.id], done, total, regions }
}

// ---- The page address: which place of the Guide to open ----
export type ResolvedGuide =
  | { view: "hub"; hash: string; notice: string | null }
  | { view: "subject"; subject: SubjectId; item: string | null; hash: string; notice: string | null }

const NOTICE_WORD_MAX = 24

function shortWord(word: string): string {
  return word.length > NOTICE_WORD_MAX ? word.slice(0, NOTICE_WORD_MAX) + "..." : word
}

// Reads the words of the address (already split by parseAddress) against the content. It never throws and is lenient
// with letters: "Python" and "python" are the subject python, "py-14" is the item PY-14.
// A subject that does not exist opens the hub, an item that does not exist (or is not in that subject) opens the
// subject, each with a one line notice. hash is the address in its exact form, for replacing a loose one.
export function resolveGuideAddress(address: GuideAddress, index: LearnIndex = LEARN_INDEX): ResolvedGuide {
  if (address.subject === null) return { view: "hub", hash: guideHash(), notice: null }
  const wanted = address.subject.toLowerCase()
  const subject = index.subjects.find((s) => s.id === wanted)
  if (subject === undefined) {
    return { view: "hub", hash: guideHash(), notice: `There is no subject "${shortWord(address.subject)}". These are the subjects.` }
  }
  if (address.item === null) {
    return { view: "subject", subject: subject.id, item: null, hash: guideHash(subject.id), notice: null }
  }
  const id = address.item.toUpperCase()
  const found = index.items.get(id)
  if (found === undefined || found.subject !== subject.id) {
    return {
      view: "subject",
      subject: subject.id,
      item: null,
      hash: guideHash(subject.id),
      notice: `There is no item "${shortWord(address.item)}" in ${subject.name}.`,
    }
  }
  return { view: "subject", subject: subject.id, item: id, hash: guideHash(subject.id, id), notice: null }
}
// AB:LEARN.VIEW:END
