# PACKET 09C: THE APP CAN ASK FOR THE DAY SCORE (timerDayScore and readDayScore in timerApi.ts; nothing calls them yet)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_09C_DAY_SCORE_CALL.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: copy this file into the `packets/` folder, then stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time (Packet 07B1 and the stop of Packet 09B were that); step 8 says what to do then.

Kind: build. Written by the planner on 2026-10-17, after Packet 09B passed on the real Supabase (all 19 rows of day_score_verify.sql matched). Everything is done by the agent. There is no SQL in this packet and no step for the owner.

## GOAL
Teach the app to ask the database for the day score: one call, `timerDayScore(day)`, and one reader, `readDayScore(json)`, that checks the answer of `timer_day_score` (the twelve keys, the six words) and hands it back in the names the app uses. Nothing in the app calls them yet: no screen, no hook, no change to the timer or to any SQL file.

## RULES FOR THE AGENT
- Edit ONLY these files: `src/lib/timerApi.ts`, `src/lib/timerApi.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Create no file. Do not touch any SQL file, any screen, any hook, `.env`, or anything else.
- Decide nothing. Copy the texts exactly as written: do not rewrite, improve, reformat or rename anything. Keep the indentation of every line as written.
- Each FIND text must occur exactly once in its file at the moment you apply it (apply the edits of a file in the order written). If it does not, STOP and report which edit and the raw count.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply. The tags are already in the files and no tag is added, renamed or deleted in this packet. The edits of `src/lib/timerApi.ts` all fall between `AB:TIMER.API:START` and `AB:TIMER.API:END`. In `src/lib/timerApi.test.ts` the first four edits are import lines above the tag block (this packet names them), the fifth is inside `AB:TIMER.TESTS`.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `08def8a` (Packet 09B) or a later one, and no changed files, except that `packets/PACKET_09C_DAY_SCORE_CALL.md` may show as untracked (`??`) because it was just copied in. Any other changed file: STOP and report the raw output.
2. Edit `src/lib/timerApi.ts` with the four edits of EDITS OF THE CALLS below.
3. Edit `src/lib/timerApi.test.ts` with the five edits of EDITS OF THE TESTS below.
4. Edit `CODE_MAP.md` with the three edits of CODE_MAP EDITS below.
5. Edit `CONNECTIONS.md` with the ten edits of CONNECTIONS EDITS below.
6. Edit `PROGRESS.md` with the two edits of PROGRESS EDITS below.
7. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 36 tags, 71 places` and `CONNECTIONS OK: 54 connections, 443 anchors, 49 classes, 2 css variables, 2 label links`. (Before this packet the second line said 429 anchors. The 14 new anchors are in C29.) If any number differs, STOP and report the raw output.
8. Run `npm test`. Expected: `Test Files  21 passed (21)` and `Tests  1137 passed (1137)`. (Before this packet: 1099 tests. The 38 new tests are in `src/lib/timerApi.test.ts`.) If a number differs, or a test fails, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond", say so in your report: the computer was too busy, and the owner will free it and tell you to run this step again. Do not change any file for it.
9. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
10. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
11. Stage by name only (never `git add .`): `git add src/lib/timerApi.ts src/lib/timerApi.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md`
    If `packets/PACKET_09C_DAY_SCORE_CALL.md` exists in the project, also add it by name.
12. Commit: `git commit -m "09C: the app can ask for the day score (timerDayScore and readDayScore in timerApi.ts, nothing calls them yet)"`
13. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 5 lines, suggest nothing, start nothing)
`DONE 09C` then: the two raw lines of step 7, the raw `Test Files` and `Tests` lines of step 8 (as one line), and `git log --oneline -1`.

## WHAT THE NEW FUNCTIONS DO (for the owner and the later packets)
- `timerDayScore(day)`: asks the database for the score of one local day (`day` is text like `2026-10-17`), checks the answer and gives it back as a `DayScore`: `day`, `creditedMinutes` (the number of the day), `word`, `usualMinutes`, `usualIsStandIn`, `sessions`, `shortSessions`, `longestStretchMinutes`, `countedMinutes`, `countedOverElapsed` (null on a day without a session), `unconfirmedMinutes`, `overCapMinutes`. Like the other calls it throws a `TimerError` with a kind the screen understands (NO_CONNECTION, NOT_SIGNED_IN, BAD_REPLY, and so on).
- `readDayScore(json)`: the checking part alone. It refuses (BAD_REPLY) a missing key, a number that is not a number of 0 or more, a count that is not whole, a word that is not one of the six, more short sessions than sessions, the word NO SESSION with sessions (or the other way round), and `counted_over_elapsed` that is null although there are sessions (or a number although there is none).
- `DAY_WORDS`: the six words of a day: NO SESSION, LIGHT, BELOW USUAL, USUAL, ABOVE USUAL, BIG. A test pins this list against the words that `timer_day_word` in `supabase/day_score.sql` can answer, in both directions.

## WHAT THE PLANNER HAD TO DECIDE (these are NOT written in DECISIONS_DAY_SCORE.md: read them and say which are wrong)
1. The names: the app writes the answer in camelCase (`creditedMinutes`), the database sends snake_case (`credited_minutes`). The reader converts.
2. The reader is strict about the six words. When a later packet adds a word (for example NOTHING CONFIRMED YET with the "still working?" packets), that packet changes `DAY_WORDS` and the SQL together (CONNECTIONS.md C29 and C54 say so). Until then a word the app does not know is refused instead of shown.
3. `counted_over_elapsed` has no upper limit of 1. The table allows `active_seconds` up to the rounded-up elapsed time, so the ratio can be a hair above 1.
4. `timerDayScore` refuses an answer whose `day` is not the day that was asked for, so a wrong day can never be shown as the right one.
5. A signed-out person gets an error from the database ("permission denied"), which the app calls UNKNOWN, as it does for the other five calls.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED in the planning sandbox, on a fresh clone of master at `08def8a` (Packet 09B): every edit of this packet applied exactly once; `node scripts/check-tags.mjs` printed the two lines of step 7; `npm test` printed 21 files and 1137 tests; `npm run build` and `tsc -b` passed; oxlint printed the same 19 warnings as before and no error.
- The new tests were checked for teeth: with a word dropped from DAY_WORDS, with an extra word, without the check of the day, without the check that the word and the number of sessions agree, with a changed key name, and with a changed function name, the tests fail; with the file put back they pass.
- The reader was given 6 real answers of `timer_day_score` made by the real SQL of `supabase/day_score.sql` on a scratch Postgres (a day without a session, a forgotten 6 hour timer, a day with a pause and a short session, an old session without a pause log, a day with a stand-in usual): all 6 are read.
- NOT TESTED: a call from a browser through the real Supabase (nothing calls the function yet, so nothing in the app can show it); a signed-out call on the real Supabase.
- With this packet alone nothing on any screen changes, so the real numbers of a day cannot be seen in the app yet.


## EDITS OF THE CALLS (src/lib/timerApi.ts)

**Edit 1** (the comment above the calls names the day score)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// What is tied to the SQL file: see CONNECTIONS.md C28 and C29. The tests are in src/lib/timerApi.test.ts.
END TEXT

REPLACE WITH:
BEGIN TEXT
// What is tied to the SQL file: see CONNECTIONS.md C28 and C29. The tests are in src/lib/timerApi.test.ts.
// The day score (supabase/day_score.sql): timerDayScore asks for the number, the word and the readouts of one day and readDayScore checks the answer (CONNECTIONS.md C29 and C54).
END TEXT

**Edit 2** (after the type EndReply: the six day words (DAY_WORDS), their type and the type DayScore)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
export type EndReply = { serverNowMs: number; saved: boolean; capped: boolean; seconds: number | null; day: string | null }
END TEXT

REPLACE WITH:
BEGIN TEXT
export type EndReply = { serverNowMs: number; saved: boolean; capped: boolean; seconds: number | null; day: string | null }

// The six words of a day, as timer_day_word in supabase/day_score.sql writes them (CONNECTIONS.md C54). Any other word is refused.
export const DAY_WORDS = ["NO SESSION", "LIGHT", "BELOW USUAL", "USUAL", "ABOVE USUAL", "BIG"] as const
export type DayWord = (typeof DAY_WORDS)[number]

// The day score as timer_day_score sends it (twelve keys), with the names written the way the app writes them. The minutes are as sent (up to 3 decimals).
export type DayScore = {
  day: string
  creditedMinutes: number
  word: DayWord
  usualMinutes: number
  usualIsStandIn: boolean
  sessions: number
  shortSessions: number
  longestStretchMinutes: number
  countedMinutes: number
  countedOverElapsed: number | null
  unconfirmedMinutes: number
  overCapMinutes: number
}
END TEXT

**Edit 3** (after readDayTotal: the reader of the answer of timer_day_score (readDayScore and its two small helpers))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
return json
}

// ---- The calls ----
END TEXT

REPLACE WITH:
BEGIN TEXT
return json
}

function readNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return bad(field + " is not a number of 0 or more")
  return value
}

function readCount(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return bad(field + " is not a whole number of 0 or more")
  return value
}

// The answer of timer_day_score: the number, the word and the readouts of one day (the twelve keys of supabase/day_score.sql, see C54).
// The word NO SESSION and 0 sessions go together, and counted_over_elapsed is null exactly when the day has no session.
export function readDayScore(json: unknown): DayScore {
  if (!isRecord(json)) return bad("the answer is not an object")
  const day = json.day
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return bad("day is not a date")
  const word = DAY_WORDS.find((name) => name === json.word)
  if (word === undefined) return bad("word is not one of the six day words")
  const usualIsStandIn = json.usual_is_stand_in
  if (typeof usualIsStandIn !== "boolean") return bad("usual_is_stand_in is not true or false")
  const sessions = readCount(json.sessions, "sessions")
  const shortSessions = readCount(json.short_sessions, "short_sessions")
  if (shortSessions > sessions) return bad("short_sessions is more than sessions")
  if ((word === "NO SESSION") !== (sessions === 0)) return bad("the word and the number of sessions do not agree")
  const countedOverElapsed = json.counted_over_elapsed === null ? null : readNumber(json.counted_over_elapsed, "counted_over_elapsed")
  if ((countedOverElapsed === null) !== (sessions === 0)) return bad("counted_over_elapsed must be null exactly when there is no session")
  return {
    day,
    creditedMinutes: readNumber(json.credited_minutes, "credited_minutes"),
    word,
    usualMinutes: readNumber(json.usual_minutes, "usual_minutes"),
    usualIsStandIn,
    sessions,
    shortSessions,
    longestStretchMinutes: readNumber(json.longest_stretch_minutes, "longest_stretch_minutes"),
    countedMinutes: readNumber(json.counted_minutes, "counted_minutes"),
    countedOverElapsed,
    unconfirmedMinutes: readNumber(json.unconfirmed_minutes, "unconfirmed_minutes"),
    overCapMinutes: readNumber(json.over_cap_minutes, "over_cap_minutes"),
  }
}

// ---- The calls ----
END TEXT

**Edit 4** (after timerDayTotal: the call timerDayScore)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
export async function timerDayTotal(day: string): Promise<number> {
  return readDayTotal(await call("timer_day_total", { p_day: day }))
}
END TEXT

REPLACE WITH:
BEGIN TEXT
export async function timerDayTotal(day: string): Promise<number> {
  return readDayTotal(await call("timer_day_total", { p_day: day }))
}

// The day score of one local day (the day text is YYYY-MM-DD). The answer of another day is refused.
export async function timerDayScore(day: string): Promise<DayScore> {
  const score = readDayScore(await call("timer_day_score", { p_day: day }))
  if (score.day !== day) return bad("the answer is for " + score.day + ", not for " + day)
  return score
}
END TEXT

## EDITS OF THE TESTS (src/lib/timerApi.test.ts)

**Edit 1** (the import of the SQL file of the day score (above the tag block))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
import schemaSql from "../../supabase/timer_schema.sql?raw"
END TEXT

REPLACE WITH:
BEGIN TEXT
import dayScoreSql from "../../supabase/day_score.sql?raw"
import schemaSql from "../../supabase/timer_schema.sql?raw"
END TEXT

**Edit 2** (DAY_WORDS in the list of imports (above the tag block))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
DATABASE_ERRORS,
  REQUEST_TIMEOUT_MS,
END TEXT

REPLACE WITH:
BEGIN TEXT
DATABASE_ERRORS,
  DAY_WORDS,
  REQUEST_TIMEOUT_MS,
END TEXT

**Edit 3** (readDayScore in the list of imports (above the tag block))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
readDayTotal,
  readEndReply,
END TEXT

REPLACE WITH:
BEGIN TEXT
readDayScore,
  readDayTotal,
  readEndReply,
END TEXT

**Edit 4** (timerDayScore in the list of imports (above the tag block))

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
timerDayTotal,
  timerEnd,
END TEXT

REPLACE WITH:
BEGIN TEXT
timerDayScore,
  timerDayTotal,
  timerEnd,
END TEXT

**Edit 5** (the new tests, at the end of the tag block)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// AB:TIMER.TESTS:END
END TEXT

REPLACE WITH:
BEGIN TEXT
const SCORE = {
  day: "2026-10-06",
  credited_minutes: 45.5,
  word: "USUAL",
  usual_minutes: 38.889,
  usual_is_stand_in: false,
  sessions: 3,
  short_sessions: 1,
  longest_stretch_minutes: 30,
  counted_minutes: 50,
  counted_over_elapsed: 0.9231,
  unconfirmed_minutes: 0,
  over_cap_minutes: 0,
}

const SCORE_NO_SESSION = {
  ...SCORE,
  credited_minutes: 0,
  word: "NO SESSION",
  sessions: 0,
  short_sessions: 0,
  longest_stretch_minutes: 0,
  counted_minutes: 0,
  counted_over_elapsed: null,
}

describe("the day score reply and the call (Packet 09C)", () => {
  it("reads a day with sessions into the names the app uses", () => {
    expect(readDayScore(SCORE)).toEqual({
      day: "2026-10-06",
      creditedMinutes: 45.5,
      word: "USUAL",
      usualMinutes: 38.889,
      usualIsStandIn: false,
      sessions: 3,
      shortSessions: 1,
      longestStretchMinutes: 30,
      countedMinutes: 50,
      countedOverElapsed: 0.9231,
      unconfirmedMinutes: 0,
      overCapMinutes: 0,
    })
  })

  it("reads a day without a session: the word NO SESSION, 0 sessions and no ratio", () => {
    const score = readDayScore(SCORE_NO_SESSION)
    expect(score.word).toBe("NO SESSION")
    expect(score.sessions).toBe(0)
    expect(score.countedOverElapsed).toBeNull()
    expect(score.creditedMinutes).toBe(0)
  })

  it.each(DAY_WORDS)("reads the word %s", (word) => {
    const reply = word === "NO SESSION" ? SCORE_NO_SESSION : { ...SCORE, word }
    expect(readDayScore(reply).word).toBe(word)
  })

  it("refuses an answer that lacks any one of the twelve keys", () => {
    for (const reply of [SCORE, SCORE_NO_SESSION]) {
      expect(Object.keys(reply)).toHaveLength(12)
      for (const key of Object.keys(reply)) {
        const rest: Record<string, unknown> = { ...reply }
        delete rest[key]
        expect(kindOf(() => readDayScore(rest))).toBe("BAD_REPLY")
      }
    }
  })

  it.each([
    ["not an object", "x"],
    ["nothing", null],
    ["an array", []],
    ["day is not a date", { ...SCORE, day: "2026-10-6" }],
    ["day is a number", { ...SCORE, day: 20261006 }],
    ["word in small letters", { ...SCORE, word: "usual" }],
    ["word that does not exist", { ...SCORE, word: "HUGE" }],
    ["usual_is_stand_in is text", { ...SCORE, usual_is_stand_in: "false" }],
    ["sessions below 0", { ...SCORE, sessions: -1 }],
    ["sessions is not whole", { ...SCORE, sessions: 1.5 }],
    ["sessions is text", { ...SCORE, sessions: "3" }],
    ["more short sessions than sessions", { ...SCORE, short_sessions: 4 }],
    ["credited_minutes below 0", { ...SCORE, credited_minutes: -0.5 }],
    ["credited_minutes is not a number", { ...SCORE, credited_minutes: Number.NaN }],
    ["credited_minutes is infinite", { ...SCORE, credited_minutes: Number.POSITIVE_INFINITY }],
    ["usual_minutes is text", { ...SCORE, usual_minutes: "38.9" }],
    ["unconfirmed_minutes below 0", { ...SCORE, unconfirmed_minutes: -1 }],
    ["over_cap_minutes is null", { ...SCORE, over_cap_minutes: null }],
    ["counted_over_elapsed is text", { ...SCORE, counted_over_elapsed: "0.9" }],
    ["counted_over_elapsed is null although there are sessions", { ...SCORE, counted_over_elapsed: null }],
    ["counted_over_elapsed is a number although there is no session", { ...SCORE_NO_SESSION, counted_over_elapsed: 0 }],
    ["the word NO SESSION although there are sessions", { ...SCORE, word: "NO SESSION" }],
    ["a word of a day with sessions although there is no session", { ...SCORE_NO_SESSION, word: "LIGHT" }],
  ])("a day score with a problem is BAD_REPLY: %s", (_name, value) => {
    expect(kindOf(() => readDayScore(value))).toBe("BAD_REPLY")
  })

  it("says in the reason which key is wrong", () => {
    expect(() => readDayScore({ ...SCORE, word: "HUGE" })).toThrow("word is not one of the six day words")
    expect(() => readDayScore({ ...SCORE, sessions: 1.5 })).toThrow("sessions is not a whole number of 0 or more")
    expect(() => readDayScore({ ...SCORE, over_cap_minutes: -1 })).toThrow("over_cap_minutes is not a number of 0 or more")
  })

  it("timerDayScore calls timer_day_score with p_day and hands back the checked answer", async () => {
    const rpc = answer(SCORE)
    const score = await timerDayScore("2026-10-06")
    expect(rpc).toHaveBeenCalledWith("timer_day_score", { p_day: "2026-10-06" })
    expect(score).toEqual(readDayScore(SCORE))
  })

  it("timerDayScore refuses the answer of another day", async () => {
    answer({ ...SCORE, day: "2026-10-05" })
    expect(await kindOfAsync(() => timerDayScore("2026-10-06"))).toBe("BAD_REPLY")
  })

  it("timerDayScore: no client is NOT_READY, a lost connection is NO_CONNECTION, a wrong shape is BAD_REPLY", async () => {
    holder.client = null
    expect(await kindOfAsync(() => timerDayScore("2026-10-06"))).toBe("NOT_READY")
    fail({ message: "Failed to fetch" })
    expect(await kindOfAsync(() => timerDayScore("2026-10-06"))).toBe("NO_CONNECTION")
    answer({})
    expect(await kindOfAsync(() => timerDayScore("2026-10-06"))).toBe("BAD_REPLY")
  })

  it("the day score SQL file has the function the app calls, and sends the twelve keys and the six words the app reads", () => {
    expect(dayScoreSql).toContain("create or replace function public.timer_day_score(p_day date)")
    for (const key of Object.keys(SCORE)) {
      expect(dayScoreSql).toContain("'" + key + "',")
    }
    for (const word of DAY_WORDS) {
      expect(dayScoreSql).toContain("'" + word + "'")
    }
  })

  it("the six words of the app are exactly the six words that timer_day_word can answer, in the same order", () => {
    const body = dayScoreSql.split("create or replace function public.timer_day_word(")[1].split("$$;")[0]
    const words = [...body.matchAll(/(?:then|else) '([A-Z ]+)'/g)].map((m) => m[1])
    expect(words).toEqual([...DAY_WORDS])
    expect([...DAY_WORDS]).toEqual(["NO SESSION", "LIGHT", "BELOW USUAL", "USUAL", "ABOVE USUAL", "BIG"])
  })
})
// AB:TIMER.TESTS:END
END TEXT

## CODE_MAP EDITS (CODE_MAP.md)

**Edit 1** (row AB:TIMER.API, the first cell of words)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
The calls from the app to the six database functions of the Pro Timer, and the checking of every answer;
END TEXT

REPLACE WITH:
BEGIN TEXT
The calls from the app to the six database functions of the Pro Timer and to the day score (timer_day_score: the number, the word and the readouts of one day), and the checking of every answer;
END TEXT

**Edit 2** (row AB:TIMER.API, the last cell)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the error names, function names and answer keys are tied to supabase/timer_schema.sql (CONNECTIONS.md C28 and C29)
END TEXT

REPLACE WITH:
BEGIN TEXT
the error names, function names, answer keys and day words are tied to supabase/timer_schema.sql and supabase/day_score.sql (CONNECTIONS.md C28, C29 and C54)
END TEXT

**Edit 3** (row AB:TIMER.TESTS, what the tests cover)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
its four functions, who may call them, the numbers and the edges of its rules, its verify file), 
END TEXT

REPLACE WITH:
BEGIN TEXT
its four functions, who may call them, the numbers and the edges of its rules, its verify file), the reading of the day score and the call that asks for it (every key and every word, the answers that are refused), 
END TEXT

## CONNECTIONS EDITS (CONNECTIONS.md)

**Edit 1** (title of C29)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
### C29: The calls to the database use the function names, argument names and answer keys of the SQL file
END TEXT

REPLACE WITH:
BEGIN TEXT
### C29: The calls to the database use the function names, argument names, answer keys and day words of the SQL files
END TEXT

**Edit 2** (C29, the line If you change)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(timer_state, timer_day_total, timer_start, timer_pause, timer_resume, timer_end), an argument name (p_tz, p_day), or a key in an answer (server_now, running, saved, capped, session, day, active_seconds, and the six fields of a running session)
END TEXT

REPLACE WITH:
BEGIN TEXT
(timer_state, timer_day_total, timer_start, timer_pause, timer_resume, timer_end; and timer_day_score in supabase/day_score.sql), an argument name (p_tz, p_day), a key in an answer (server_now, running, saved, capped, session, day, active_seconds, and the six fields of a running session), or a key or a word of the day score (credited_minutes, word, usual_minutes, usual_is_stand_in, sessions, short_sessions, longest_stretch_minutes, counted_minutes, counted_over_elapsed, unconfirmed_minutes, over_cap_minutes, and the six words of timer_day_word)
END TEXT

**Edit 3** (C29, the line Then also: the list of readers)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
The readers (readStateReply, readRunningReply, readEndReply, readDayTotal and readTimerRow) read the keys by name
END TEXT

REPLACE WITH:
BEGIN TEXT
The readers (readStateReply, readRunningReply, readEndReply, readDayTotal, readDayScore and readTimerRow) read the keys by name
END TEXT

**Edit 4** (C29, the line Then also: its last sentence)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
A change in the SQL file has to be run again in the Supabase SQL Editor by the owner.
END TEXT

REPLACE WITH:
BEGIN TEXT
A change in the SQL file has to be run again in the Supabase SQL Editor by the owner. The day score is read by readDayScore, which refuses a word that is not in DAY_WORDS (the six words of timer_day_word, see C54) and a day whose number of sessions does not fit its word; timerDayScore refuses the answer of another day. supabase/day_score.sql is read by npm test (timerApi.test.ts and dayScoreSql.test.ts).
END TEXT

**Edit 5** (C29, the line If you forget)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- If you forget: Start, Pause, Resume or End fail, or the screen shows an error instead of the time.
END TEXT

REPLACE WITH:
BEGIN TEXT
- If you forget: Start, Pause, Resume or End fail, or the screen shows an error instead of the time, or the day score is refused (BAD_REPLY) because a key or a word was changed on one side only.
END TEXT

**Edit 6** (C29, new Anchor lines after the anchor session.day)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = session.day`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = session.day`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_day_score", { p_day: day })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export const DAY_WORDS = ["NO SESSION", "LIGHT", "BELOW USUAL", "USUAL", "ABOVE USUAL", "BIG"] as const`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.credited_minutes`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.word`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.usual_minutes`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.usual_is_stand_in`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.sessions`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.short_sessions`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.longest_stretch_minutes`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.counted_minutes`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.counted_over_elapsed`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.unconfirmed_minutes`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.over_cap_minutes`
END TEXT

**Edit 7** (C29, a new Anchor line for the tests, and the Check by hand line)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = "timer_state()", "timer_day_total(p_day date)", "timer_start(p_tz text)", "timer_pause()", "timer_resume()", "timer_end()"`
- Check by hand: after any change in supabase/timer_schema.sql run npm test (it reads that file), and the owner runs the changed SQL in the Supabase SQL Editor.
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = "timer_state()", "timer_day_total(p_day date)", "timer_start(p_tz text)", "timer_pause()", "timer_resume()", "timer_end()"`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the day score reply and the call (Packet 09C)", () => {`
- Check by hand: after any change in supabase/timer_schema.sql or supabase/day_score.sql run npm test (it reads both files), and the owner runs the changed SQL in the Supabase SQL Editor.
END TEXT

**Edit 8** (C54, the Tags line)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
### C54: The day score: the SQL file, its verify file and its tests are tied to DECISIONS_DAY_SCORE.md and to the pause log
- Tags: `AB:TIMER.TESTS`
END TEXT

REPLACE WITH:
BEGIN TEXT
### C54: The day score: the SQL file, its verify file and its tests are tied to DECISIONS_DAY_SCORE.md and to the pause log
- Tags: `AB:TIMER.TESTS`, `AB:TIMER.API`
END TEXT

**Edit 9** (C54, the sentence about the app)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
The app does not call the score yet. When it does (a later packet), timerApi.ts calls timer_day_score(p_day) and reads its twelve keys, and C29 must get them.
END TEXT

REPLACE WITH:
BEGIN TEXT
timerApi.ts calls timer_day_score(p_day) (timerDayScore) and reads its twelve keys and its six words (readDayScore and DAY_WORDS): they are pinned in C29, so a key or a word changed in the SQL is changed there in the same packet. No screen shows the score yet.
END TEXT

**Edit 10** (C54, the line If you forget)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
or the verify file fails, or the app later reads a key that the SQL no longer sends.
END TEXT

REPLACE WITH:
BEGIN TEXT
or the verify file fails, or the app reads a key or a word that the SQL no longer sends (the score is then refused as BAD_REPLY).
END TEXT

## PROGRESS EDITS (PROGRESS.md)

**Edit 1** (the Done list: a new line after the line of Packet 09B)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(C54, and the title of C53) were brought up to date. With automated tests.
END TEXT

REPLACE WITH:
BEGIN TEXT
(C54, and the title of C53) were brought up to date. With automated tests.
- Packet 09C: the app can ask for the day score. src/lib/timerApi.ts got timerDayScore(day) (it calls timer_day_score with p_day and refuses the answer of another day), readDayScore (it checks the twelve keys, the six words and that the word NO SESSION and 0 sessions go together, and gives the names the app uses: creditedMinutes, usualMinutes, usualIsStandIn, shortSessions, longestStretchMinutes, countedMinutes, countedOverElapsed, unconfirmedMinutes, overCapMinutes) and the list DAY_WORDS. Nothing calls it yet: no screen, no hook and no database file changed. With automated tests (src/lib/timerApi.test.ts); CODE_MAP.md and CONNECTIONS.md (C29 and C54) were brought up to date.
END TEXT

**Edit 2** (the Next list: the first two lines are replaced by one line)

FIND (it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Owner runs supabase/day_score.sql and then supabase/day_score_verify.sql in the Supabase SQL Editor (Packet 09B), after timer_schema.sql. The 19 rows of the second must show the same value in result and expect.
- Owner runs supabase/timer_schema.sql and then supabase/timer_verify.sql in the Supabase SQL Editor (Packet 09A). The sixth row pause_log_columns must show 3 in result and in expect. Until then the live database has no pause log and no pause is being written down.
END TEXT

REPLACE WITH:
BEGIN TEXT
- Owner decides where the number and the word of the day are shown on the Pro Timer (a later packet). timerDayScore in src/lib/timerApi.ts is ready; nothing calls it yet.
END TEXT
