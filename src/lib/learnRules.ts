// AB:LEARN.RULES:START
// The rules of Learn (DECISIONS_LEARN.md sections 9, 10 and 12a): which item is locked, open, started or done,
// what a region and a gate are, the window of a region, how late it is, how much time went where.
// Pure functions: no screen, no database call, no clock. The day of "today" is always given by the caller.
// The tests are in src/lib/learnRules.test.ts.
//
// THE FACTS (what the database will keep, 12b): when an item was started and done, when a region was started
// and its gate passed. They are DAYS ("2026-11-26", the calendar day in his time zone), not moments, because
// every rule below is about days. Judgements (locked, late, red, green) are never saved: they are worked out
// here, from the facts, the content and the pace (12b).
//
// THE ORDER (9b, Q10): inside a subject the items go one by one, region by region, and a gate after the last
// item of a region. An item waits for the item before it. The first item of a region waits for the gate of the
// region before it. Subjects do not wait for each other, except for the HARD needs of src/data/learn/needs.ts.
// The app enforces this, not the database (Q21).
import type { SubjectId } from "../data/learn/subjectColours"
import type { LearnItem, LearnRegion, LearnSubject } from "../data/learn/tier1"
import { TIER1_SUBJECTS } from "../data/learn/tier1"
import { ITEM_NEEDS, REGION_NEEDS, type Need } from "../data/learn/needs"
import { parseWhat } from "./learnLabel"

// ---- The placeholders (DECISIONS_LEARN.md Q15, Q16, Q14). Every number here is a PLACEHOLDER: safe to tune. ----
export type MinuteRange = { low: number; high: number }
// The pack's arithmetic on the Python course: about 30 to 78 minutes an item, used for every subject (Q15).
export const SEED_ITEM_MINUTES: Readonly<MinuteRange> = { low: 30, high: 78 }
// A region task is bigger than one item; the planner's pick, not in the pack (10b).
export const SEED_GATE_MINUTES: Readonly<MinuteRange> = { low: 60, high: 120 }
// Hari's pace in hours a week: the default and the presets of the pack (Q16).
export const DEFAULT_PACE_HOURS = 5
export const PACE_PRESETS: readonly number[] = [3, 5, 10, 20]
// Done with less first-pass time than this gives a soft warning, once, and is then allowed (Q14).
export const SOFT_DONE_MINUTES: Readonly<{ item: number; gate: number }> = { item: 10, gate: 15 }

// ---- The facts ----
export type ItemFact = { startedDay: string; doneDay: string | null }
export type RegionFact = { startedDay: string; gatePassedDay: string | null }
export type LearnFacts = {
  items: Readonly<Record<string, ItemFact>> // by item id
  regions: Readonly<Record<string, RegionFact>> // by region key (python/D)
}
export const NO_FACTS: LearnFacts = { items: {}, regions: {} }

export type LearnOptions = {
  pace?: number // hours a week
  // The real first-pass minutes of finished items, by item id, and of a passed gate, by region key.
  // A finished item with minutes here swaps its seed for them: the range narrows (10b). Missing = "no time logged".
  firstPassMinutes?: Readonly<Record<string, number>>
}

export type ItemStatus = "locked" | "open" | "started" | "done"
export type GateStatus = "locked" | "open" | "passed"
export type RegionStatus = "locked" | "open" | "running" | "atGate" | "passedOnTime" | "passedLate"

// ---- The index: the content, looked up by id ----
export type IndexedItem = {
  item: LearnItem
  subject: SubjectId
  regionKey: string
  order: number // place in the subject, from 0
  place: number // place in the region, from 0
}
export type IndexedRegion = {
  region: LearnRegion
  subject: SubjectId
  order: number // place of the region in the subject, from 0
  itemIds: readonly string[]
}
export type LearnIndex = {
  subjects: readonly LearnSubject[]
  items: ReadonlyMap<string, IndexedItem>
  regions: ReadonlyMap<string, IndexedRegion>
  regionOrder: ReadonlyMap<SubjectId, readonly string[]> // the region keys of a subject, in order
  itemOrder: ReadonlyMap<SubjectId, readonly string[]> // the item ids of a subject, in order
  regionNeeds: Readonly<Record<string, readonly Need[]>>
  itemNeeds: Readonly<Record<string, readonly Need[]>>
}

// Builds the index. An id that is used twice is a mistake in the content: it throws (the checks of
// src/lib/learnData.ts say it in words first).
export function buildLearnIndex(
  subjects: readonly LearnSubject[],
  regionNeeds: Readonly<Record<string, readonly Need[]>>,
  itemNeeds: Readonly<Record<string, readonly Need[]>>,
): LearnIndex {
  const items = new Map<string, IndexedItem>()
  const regions = new Map<string, IndexedRegion>()
  const regionOrder = new Map<SubjectId, string[]>()
  const itemOrder = new Map<SubjectId, string[]>()
  for (const subject of subjects) {
    const keys: string[] = []
    const ids: string[] = []
    subject.regions.forEach((region, order) => {
      if (regions.has(region.key)) throw new Error(`region key used twice: ${region.key}`)
      regions.set(region.key, { region, subject: subject.id, order, itemIds: region.items.map((i) => i.id) })
      keys.push(region.key)
      region.items.forEach((item, place) => {
        if (items.has(item.id)) throw new Error(`item id used twice: ${item.id}`)
        items.set(item.id, { item, subject: subject.id, regionKey: region.key, order: ids.length, place })
        ids.push(item.id)
      })
    })
    regionOrder.set(subject.id, keys)
    itemOrder.set(subject.id, ids)
  }
  return { subjects, items, regions, regionOrder, itemOrder, regionNeeds, itemNeeds }
}

export const LEARN_INDEX: LearnIndex = buildLearnIndex(TIER1_SUBJECTS, REGION_NEEDS, ITEM_NEEDS)

function itemOf(index: LearnIndex, id: string): IndexedItem {
  const found = index.items.get(id)
  if (!found) throw new Error(`unknown item: ${id}`)
  return found
}

function regionOf(index: LearnIndex, key: string): IndexedRegion {
  const found = index.regions.get(key)
  if (!found) throw new Error(`unknown region: ${key}`)
  return found
}

// ---- Days (calendar days, written YYYY-MM-DD) ----
const DAY_SHAPE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
const MS_PER_DAY = 86_400_000

export function isDayText(text: unknown): text is string {
  if (typeof text !== "string" || !DAY_SHAPE.test(text)) return false
  const ms = Date.parse(`${text}T00:00:00Z`)
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === text
}

function dayMs(text: string): number {
  if (!isDayText(text)) throw new Error(`not a day: ${String(text)}`)
  return Date.parse(`${text}T00:00:00Z`)
}

export function addDays(day: string, n: number): string {
  return new Date(dayMs(day) + n * MS_PER_DAY).toISOString().slice(0, 10)
}

// The number of days from one day to the other (negative when "to" is before "from").
export function daysBetween(from: string, to: string): number {
  return Math.round((dayMs(to) - dayMs(from)) / MS_PER_DAY)
}

// ---- Needs ----
export function needMet(need: Need, facts: LearnFacts): boolean {
  if (need.target.kind === "region") {
    const f = facts.regions[need.target.key]
    return f !== undefined && f.gatePassedDay !== null
  }
  const f = facts.items[need.target.id]
  return f !== undefined && f.doneDay !== null
}

// The needs that are not met yet, HARD and SOFT (the chips of the card).
export function unmetNeeds(needs: readonly Need[], facts: LearnFacts): Need[] {
  return needs.filter((n) => !needMet(n, facts))
}

// The needs of a region and of an item together, as the card lists them.
export function needsOfItem(index: LearnIndex, id: string): Need[] {
  const at = itemOf(index, id)
  return [...(index.regionNeeds[at.regionKey] ?? []), ...(index.itemNeeds[id] ?? [])]
}

// ---- Why something waits ----
export type RegionBlockers = {
  beforeRegion: string | null // the key of the region before it, when its gate is not passed
  needs: Need[] // the HARD needs that are not met
}

export function regionBlockers(index: LearnIndex, key: string, facts: LearnFacts): RegionBlockers {
  const at = regionOf(index, key)
  const keys = index.regionOrder.get(at.subject) ?? []
  const before = at.order > 0 ? (keys[at.order - 1] ?? null) : null
  const beforePassed = before === null || facts.regions[before]?.gatePassedDay != null
  const needs = unmetNeeds(index.regionNeeds[key] ?? [], facts).filter((n) => n.hard)
  return { beforeRegion: beforePassed ? null : before, needs }
}

export type ItemBlockers = {
  beforeItem: string | null // the item before it in the region, when it is not done
  beforeRegion: string | null // the region before it, when its gate is not passed
  needs: Need[] // the HARD needs that are not met (of the region and of the item)
}

export function itemBlockers(index: LearnIndex, id: string, facts: LearnFacts): ItemBlockers {
  const at = itemOf(index, id)
  const region = regionOf(index, at.regionKey)
  const prev = at.place > 0 ? (region.itemIds[at.place - 1] ?? null) : null
  const prevDone = prev === null || facts.items[prev]?.doneDay != null
  const rb = regionBlockers(index, at.regionKey, facts)
  const own = unmetNeeds(index.itemNeeds[id] ?? [], facts).filter((n) => n.hard)
  return { beforeItem: prevDone ? null : prev, beforeRegion: rb.beforeRegion, needs: [...rb.needs, ...own] }
}

// ---- Status ----
export function itemStatus(index: LearnIndex, id: string, facts: LearnFacts): ItemStatus {
  itemOf(index, id)
  const f = facts.items[id]
  if (f !== undefined) return f.doneDay !== null ? "done" : "started"
  const b = itemBlockers(index, id, facts)
  return b.beforeItem !== null || b.beforeRegion !== null || b.needs.length > 0 ? "locked" : "open"
}

export function gateStatus(index: LearnIndex, key: string, facts: LearnFacts): GateStatus {
  const at = regionOf(index, key)
  const f = facts.regions[key]
  if (f !== undefined && f.gatePassedDay !== null) return "passed"
  return at.itemIds.every((id) => facts.items[id]?.doneDay != null) ? "open" : "locked"
}

// ---- Time: the window of a region (10b, 10c) ----
function minutesOfItem(id: string, facts: LearnFacts, opts: LearnOptions): MinuteRange {
  const real = opts.firstPassMinutes?.[id]
  if (facts.items[id]?.doneDay != null && real !== undefined && real > 0) return { low: real, high: real }
  return { ...SEED_ITEM_MINUTES }
}

// The expected minutes of a region: its items (the seed, or the real minutes of a finished item) and its gate.
export function regionMinutes(index: LearnIndex, key: string, facts: LearnFacts = NO_FACTS, opts: LearnOptions = {}): MinuteRange {
  const at = regionOf(index, key)
  let low = 0
  let high = 0
  for (const id of at.itemIds) {
    const m = minutesOfItem(id, facts, opts)
    low += m.low
    high += m.high
  }
  const real = opts.firstPassMinutes?.[key]
  const gate = facts.regions[key]?.gatePassedDay != null && real !== undefined && real > 0 ? { low: real, high: real } : SEED_GATE_MINUTES
  return { low: low + gate.low, high: high + gate.high }
}

function paceOf(opts: LearnOptions): number {
  const pace = opts.pace ?? DEFAULT_PACE_HOURS
  if (!Number.isFinite(pace) || pace <= 0) throw new Error(`bad pace: ${String(pace)}`)
  return pace
}

// The window of a region in days: minutes divided by the weekly pace, each end rounded to a whole day.
// (Region A of Python: 210 to 510 minutes is about 5 to 12 days at 5 hours a week.)
export function regionWindowDays(index: LearnIndex, key: string, facts: LearnFacts = NO_FACTS, opts: LearnOptions = {}): { low: number; high: number } {
  const pace = paceOf(opts)
  const m = regionMinutes(index, key, facts, opts)
  const days = (minutes: number) => Math.round((minutes / 60 / pace) * 7)
  return { low: days(m.low), high: days(m.high) }
}

// The latest day: the day the region was started plus the high end of its window. Late only after it.
export function regionLatestDay(index: LearnIndex, key: string, startedDay: string, facts: LearnFacts = NO_FACTS, opts: LearnOptions = {}): string {
  return addDays(startedDay, regionWindowDays(index, key, facts, opts).high)
}

// How many days late a region is: from its latest day to the day its gate was passed, or to today while it is
// still running. 0 when it is not late and when it was never started. Red is a record, not a punishment (Q17).
export function regionLateDays(index: LearnIndex, key: string, facts: LearnFacts, today: string, opts: LearnOptions = {}): number {
  const f = facts.regions[key]
  if (f === undefined) return 0
  const latest = regionLatestDay(index, key, f.startedDay, facts, opts)
  return Math.max(0, daysBetween(latest, f.gatePassedDay ?? today))
}

export function regionStatus(index: LearnIndex, key: string, facts: LearnFacts, opts: LearnOptions = {}): RegionStatus {
  const at = regionOf(index, key)
  const f = facts.regions[key]
  if (f !== undefined && f.gatePassedDay !== null) {
    return f.gatePassedDay <= regionLatestDay(index, key, f.startedDay, facts, opts) ? "passedOnTime" : "passedLate"
  }
  if (at.itemIds.every((id) => facts.items[id]?.doneDay != null)) return "atGate"
  if (f !== undefined || at.itemIds.some((id) => facts.items[id] !== undefined)) return "running"
  const b = regionBlockers(index, key, facts)
  return b.beforeRegion !== null || b.needs.length > 0 ? "locked" : "open"
}

// ---- The subject: progress and the next item ----
export function nextItem(index: LearnIndex, subject: SubjectId, facts: LearnFacts): { id: string; status: ItemStatus } | null {
  for (const id of index.itemOrder.get(subject) ?? []) {
    if (facts.items[id]?.doneDay != null) continue
    return { id, status: itemStatus(index, id, facts) }
  }
  return null
}

export function subjectProgress(index: LearnIndex, subject: SubjectId, facts: LearnFacts): { done: number; total: number; next: string | null } {
  const ids = index.itemOrder.get(subject) ?? []
  const done = ids.filter((id) => facts.items[id]?.doneDay != null).length
  return { done, total: ids.length, next: nextItem(index, subject, facts)?.id ?? null }
}

// ---- Done: the soft warning (Q14, B11) ----
// Done is always allowed. Under the minimum of first-pass time the app warns once. With no timed minutes at all the
// item is recorded as "no time logged" (not as 0) and keeps its seed range.
export function doneWarning(firstPassSeconds: number, kind: "item" | "gate"): { warn: boolean; noTimeLogged: boolean } {
  const seconds = Number.isFinite(firstPassSeconds) && firstPassSeconds > 0 ? firstPassSeconds : 0
  return { warn: seconds < SOFT_DONE_MINUTES[kind] * 60, noTimeLogged: seconds === 0 }
}

// ---- Time: where the minutes went (10a, 19a) ----
// One session, one set of minutes. The label decides how they are read (19a): what is "item:PY-13",
// "gate:python/D" or null; via is a source path or null; a review session is counted apart (B2).
export type LearnSessionUse = { what: string | null; via: string | null; review: boolean; seconds: number }

export type LearnTimeTotals = {
  byItem: Record<string, number> // first-pass seconds on an item, whatever the source
  byGate: Record<string, number> // first-pass seconds on a gate, by region key
  byRegion: Record<string, number> // its items and its gate, by region key
  bySubject: Record<string, number> // all its regions
  review: Record<string, number> // review seconds, by item id or region key; never mixed into the rest
  unmatched: number // seconds of a label whose item or gate is not in the content
}

export function learnTimeTotals(index: LearnIndex, sessions: readonly LearnSessionUse[]): LearnTimeTotals {
  const t: LearnTimeTotals = { byItem: {}, byGate: {}, byRegion: {}, bySubject: {}, review: {}, unmatched: 0 }
  const add = (map: Record<string, number>, key: string, seconds: number) => {
    map[key] = (map[key] ?? 0) + seconds
  }
  for (const s of sessions) {
    if (!Number.isFinite(s.seconds) || s.seconds <= 0 || s.what === null) continue
    const what = parseWhat(s.what)
    if (what === null) {
      t.unmatched += s.seconds
      continue
    }
    let regionKey: string
    let ownKey: string
    if (what.kind === "item") {
      const at = index.items.get(what.id)
      if (!at) {
        t.unmatched += s.seconds
        continue
      }
      regionKey = at.regionKey
      ownKey = what.id
    } else {
      regionKey = `${what.subject}/${what.region}`
      if (!index.regions.has(regionKey)) {
        t.unmatched += s.seconds
        continue
      }
      ownKey = regionKey
    }
    if (s.review) {
      add(t.review, ownKey, s.seconds)
      continue
    }
    add(what.kind === "item" ? t.byItem : t.byGate, ownKey, s.seconds)
    add(t.byRegion, regionKey, s.seconds)
    add(t.bySubject, regionOf(index, regionKey).subject, s.seconds)
  }
  return t
}

// The seconds of a source: every session whose source is that path or something below it, with or without an item
// and review included (10a). For "coursera/ibm-python" this counts "coursera/ibm-python/m1/1.3" too.
export function sourceSeconds(sessions: readonly LearnSessionUse[], path: string): number {
  let total = 0
  for (const s of sessions) {
    if (s.via === null || !Number.isFinite(s.seconds) || s.seconds <= 0) continue
    if (s.via === path || s.via.startsWith(`${path}/`)) total += s.seconds
  }
  return total
}

// AB:LEARN.RULES:END
