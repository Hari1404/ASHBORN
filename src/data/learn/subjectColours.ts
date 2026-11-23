// AB:LEARN.COLOURS:START
// The colour of each Learn subject (DECISIONS_LEARN.md 19c, Q7).
// From the preview page ashborn_subject_colours_families.html. Related subjects share one hue and step
// from light to dark. The day screen uses blue, rose, amber and teal, so these families keep other hues.
//
// Every hex is a PLACEHOLDER, judged by eye in all four looks of the day screen. Safe to tune alone.
// What is NOT free (the tests guard it): a subject colour must never equal a colour of the day palette
// (OVERVIEW_DAY_PALETTE), every colour must stay visible on black, and the colours must stay different.
//
// The subject ids are the keys of the Tier 1 data: la is linear algebra, prob is probability.
// Coursera is NOT a subject colour: it is the end cap of a pill (src/data/learn/sources.ts).
// Machine learning and Research are not coloured yet: pink and coral hues are still free for them.

export type SubjectId = "python" | "numpy" | "pandas" | "terminal" | "git" | "la" | "prob"

export const SUBJECT_IDS: readonly SubjectId[] = ["python", "numpy", "pandas", "terminal", "git", "la", "prob"]

export const SUBJECT_COLOURS: Record<SubjectId, string> = {
  python: "#dfbefd",
  numpy: "#bf81f2",
  pandas: "#964fcb",
  terminal: "#e1df5d",
  git: "#b5b11b",
  la: "#8ce6a0",
  prob: "#128f43",
}

// The families, each from light to dark, in the order he learns them. The order inside a family is the
// planner's pick (Terminal before Git, linear algebra before probability): Hari can swap it.
export const SUBJECT_FAMILIES: readonly { id: string; subjects: readonly SubjectId[] }[] = [
  { id: "data", subjects: ["python", "numpy", "pandas"] },
  { id: "tools", subjects: ["terminal", "git"] },
  { id: "maths", subjects: ["la", "prob"] },
]
// AB:LEARN.COLOURS:END
