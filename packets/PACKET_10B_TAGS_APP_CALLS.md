# PACKET 10B: THE APP LEARNS THE TAGS (the four tag calls and the tag on Start in timerApi.ts, plain words for the four tag errors, the two decisions files into the repository; no screen, no SQL)

Paste this one line into the Antigravity agent:

    Read packets/PACKET_10B_TAGS_APP_CALLS.md and execute it exactly. Decide nothing. If anything fails, stop and tell me.

BEFORE you paste it: copy THREE files into your project folder `F:\ASHBORN` (from the folder `COPY_INTO_REPO` of the zip, keep the folders: drag the contents of `COPY_INTO_REPO` onto `F:\ASHBORN` and let Explorer merge): `DECISIONS_TAGS.md` and `DECISIONS_DAY_SCORE.md` go into `F:\ASHBORN` itself, `PACKET_10B_TAGS_APP_CALLS.md` goes into `F:\ASHBORN\packets`. Then stop `npm run dev` (Ctrl+C) and close heavy programs. On a busy computer `npm test` can run out of time; step 12 says what to do then.

Kind: build. Written by the planner on 2026-10-17, from `DECISIONS_TAGS.md` (locked; section 9, item 1) after Packet 10A PASSED. Part 1 is done by the agent (eight files edited, a commit). The two decisions files are copied in by the owner (before) and checked by the agent. There is NO Part 2 in Supabase: the SQL does not change.

## GOAL
Teach the app the tags, with no screen. `src/lib/timerApi.ts` gets the type `TimerTag`, the readers `readTag` and `readTagList`, and four calls (`timerTagList`, `timerTagAdd`, `timerTagRename`, `timerTagArchive`); `timerStart` gets an optional second argument, the tag id, and sends it only when there is one. `problemText` in `src/lib/useTimer.ts` gives the four tag errors their own plain words (today they fall into "Something went wrong."). The two decisions files (`DECISIONS_TAGS.md`, `DECISIONS_DAY_SCORE.md`) enter the repository root. Nothing calls the new functions yet: no screen, no hook, no picker. The Pro Timer does exactly what it did.

## RULES FOR THE AGENT
- Edit ONLY these files: `src/lib/timerApi.ts`, `src/lib/useTimer.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do NOT create any file (the owner has copied in the two decisions files and this packet; do not change them). Do not touch `supabase/`, any screen, any other hook, `.env`, or anything else.
- Do not run any SQL. Decide nothing. Copy the texts exactly as written: do not rewrite, improve, reformat or rename anything. Keep the indentation of every line as written. Each text between BEGIN TEXT and END TEXT is the lines between those two lines, joined with line breaks, with no line break after the last line. Every FIND is ONE line. A REPLACE may have several lines; write them with the line breaks that the file you edit uses.
- Each FIND text must occur exactly once in its file at the moment you apply it (apply the edits of a file in the order written). If it does not, STOP and report which edit and the raw count.
- Any failure or mismatch (a number in a result that differs from "Expected"): STOP and report the exact error text or the raw output. Never improvise.
- Rules 9, 10 and 11 of AGENTS.md apply. No tag is added, renamed or deleted in this packet. The edits of `src/lib/timerApi.ts` fall between `AB:TIMER.API:START` and `AB:TIMER.API:END`. The edit of `src/lib/useTimer.ts` falls between `AB:TIMER.STATE:START` and `AB:TIMER.STATE:END`. The edits of `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts` and all of `src/lib/timerApi.test.ts` except its first three edits (they are import lines above the start marker) fall between `AB:TIMER.TESTS:START` and `AB:TIMER.TESTS:END`.

## PART 1: AGENT STEPS
1. Record the starting state. Run `git log --oneline -5` and `git status --short`. Keep the raw output for the report. Expected: the newest commit is `0bf2a52` (Packet 10A) or a later one, and the only changed files are three untracked ones (`??`): `DECISIONS_TAGS.md`, `DECISIONS_DAY_SCORE.md` and `packets/PACKET_10B_TAGS_APP_CALLS.md`. Any other changed file, or one of the three missing: STOP and report the raw output.
2. Check the two decisions files. Run `(Get-FileHash -Algorithm SHA256 DECISIONS_TAGS.md).Hash` and `(Get-FileHash -Algorithm SHA256 DECISIONS_DAY_SCORE.md).Hash`. Expected (capital or small letters do not matter): `0AC18CF8A8309D6C81C21D09E8B89DCAD64BA4571570A30B2B9057E19D2CBD9D` for `DECISIONS_TAGS.md` and `2B54F70551B236DB4EFC2D70BA62B6104E88AC842BA9815013FEB935AB08F469` for `DECISIONS_DAY_SCORE.md`. If a hash differs, STOP and report both raw hashes (the owner copied a wrong file and will copy it again).
3. Edit `src/lib/timerApi.ts` with the 5 edits of EDITS OF THE CALLS below.
4. Edit `src/lib/useTimer.ts` with the 1 edit of EDITS OF THE HOOK below.
5. Edit `src/lib/timerApi.test.ts` with the 7 edits of EDITS OF THE TESTS OF THE CALLS below.
6. Edit `src/lib/useTimer.test.ts` with the 4 edits of EDITS OF THE TESTS OF THE TEXTS below.
7. Edit `src/lib/useTimer.hook.test.ts` with the 1 edit of EDITS OF THE TESTS OF THE HOOK below.
8. Edit `CODE_MAP.md` with the 4 edits of CODE_MAP EDITS below.
9. Edit `CONNECTIONS.md` with the 11 edits of CONNECTIONS EDITS below.
10. Edit `PROGRESS.md` with the 2 edits of PROGRESS EDITS below.
11. Run `node scripts/check-tags.mjs`. Expected, exactly these two lines: `TAGS OK: 36 tags, 72 places` and `CONNECTIONS OK: 55 connections, 463 anchors, 49 classes, 2 css variables, 2 label links`. (Before this packet they were 36 tags, 72 places, 55 connections and 449 anchors. No tag and no connection is new: 14 anchors are new, 4 in C28, 6 in C29 and 4 in C55.) If any number differs, STOP and report the raw output.
12. Run `npm test`. Expected: `Test Files  22 passed (22)` and `Tests  1176 passed (1176)`. (Before this packet: 22 files and 1156 tests. The 20 new tests are 15 in `src/lib/timerApi.test.ts` (13 for the tags and 2 for the decisions files), 1 in `src/lib/useTimer.test.ts` and 4 in `src/lib/useTimer.hook.test.ts`.) If a number differs, or a test fails, STOP and report the raw output. If the ONLY problems are "Test timed out in 5000ms" or "Timeout waiting for worker to respond", say so in your report: the computer was too busy, and the owner will free it and tell you to run this step again. Do not change any file for it.
13. Run `npm run build`. Expected: it ends with a line that starts with `✓ built in`. The warning about chunks larger than 500 kB was there before and is not a failure.
14. Secret check. Run `git ls-files | Select-String "\.env"` and keep the RAW output (it should show at most `.env.example`, never `.env`).
15. Stage by name only (never `git add .`): `git add src/lib/timerApi.ts src/lib/useTimer.ts src/lib/timerApi.test.ts src/lib/useTimer.test.ts src/lib/useTimer.hook.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md DECISIONS_TAGS.md DECISIONS_DAY_SCORE.md packets/PACKET_10B_TAGS_APP_CALLS.md`
16. Commit: `git commit -m "10B: the app learns the tags (tag calls and tag on Start in timerApi.ts, plain words for the four tag errors, the two decisions files in the repo; no screen, no SQL)"`
17. Push: `git push`. Expected: the push succeeds. If it fails, STOP and report the full error.

## WHEN DONE (agent report, max 5 lines, suggest nothing, start nothing)
`DONE 10B` then: the two raw lines of step 11, the raw `Test Files` and `Tests` lines of step 12 (as one line), and `git log --oneline -1`.

## PART 2: OWNER (nothing in Supabase)
The SQL does not change, so you run nothing in the Supabase dashboard.
1. Send the planner the agent's report (`DONE 10B` and its lines).
2. Optional, one minute: start the app on your computer (`npm run dev`), open the Pro Timer, press Start, wait a few seconds and end the session as always. It must work exactly as before: the Start call is the same call as before tags. Then stop `npm run dev`. If Start does not work, send the planner the error at once.
This packet PASSES when the agent's report matches the expected lines.

## WHAT THE NEW CODE DOES (for the owner and the later packets)
- `timerTagList()` asks for your live tags, oldest first, as a list of `{id, name}`. `timerTagAdd(name)` makes a tag (or brings the newest archived tag of that name back). `timerTagRename(id, name)` renames a live tag. `timerTagArchive(id)` removes a tag from the list (it is archived, never deleted). The database checks the name rules and the limit; the app sends the name as typed.
- `readTag` and `readTagList` check every answer before the app uses it: an id that looks like an id, a name that is text and not empty, a real list, no tag twice. Anything else is BAD_REPLY, as with the other calls.
- `timerStart(zone, tagId)`: with a tag id it sends it; with `null` or nothing it sends exactly what it sent before tags (the session is Freestyle).
- `problemText` turns the four tag errors into plain sentences, so a screen that shows `problemText(kind)` (the Pro Timer message line today, the Manage tags view later) says something useful. The words:
  - BAD_TAG_NAME: "A tag name needs 1 to 20 characters, and cannot be Freestyle."
  - TAG_NAME_TAKEN: "You already have a tag with that name."
  - TAG_LIMIT: "You have the most tags allowed. Remove one to add another."
  - TAG_NOT_FOUND: "That tag is not there any more. Close the list and open it again."
- `DECISIONS_TAGS.md` is version 1.1: facts and these four texts were added; no rule changed. `DECISIONS_DAY_SCORE.md` is copied as it is.

## WHAT THE PLANNER HAD TO DECIDE (read them and say which are wrong; all are DEFAULT)
1. The words of the four errors (above). Where they live: `problemText`, the one place that turns an error kind into a sentence. TAG_LIMIT has no number in it, so the live limit stays one number in the SQL; BAD_TAG_NAME does say 1 to 20 (the test and C55 tie it to the rule). TAG_NOT_FOUND says "the list" because the picker of 10C is a list.
2. What the reader checks: the id must look like an id (a uuid, capitals allowed), the name must be text and not empty. It does NOT check the 1 to 20 rule or the limit of 10: the database owns those, so a later change of the SQL does not break the app.
3. `timerTagRename` and `timerTagArchive` refuse an answer that is for another tag (BAD_REPLY), the same way `timerDayScore` refuses the answer of another day. Ids are compared without capitals.
4. `timerStart(zone, tagId = null)`: the tag is sent only when given. The hook `useTimer` is NOT changed: its Start does not take a tag yet (that is 10C).
5. `DECISIONS_TAGS.md` was updated to version 1.1 (sections 2, 3, 5, 8, 9: the app now has the calls, the four texts are written, item 6 of "Check these first"). No rule changed. `DECISIONS_DAY_SCORE.md` is copied unchanged, so its section 4a still contradicts its section 2 (an open item).
6. The owner copies the two decisions files in by hand; the agent checks them with SHA-256 so a wrong copy stops the packet.
7. Two tests read the decisions files: `DECISIONS_TAGS.md` must still say "At most 10 live tags." and "1 to 20 characters", and `DECISIONS_DAY_SCORE.md` must exist. If you change those rules, change the file, the SQL, `src/lib/tagsSql.test.ts` and C55 together.
8. Two old test titles said "six" (names, functions); they now say "ten", which is true since 10A.

NOT in 10B (later packets): any screen, the picker (10C), the Manage tags view (10D), `useTimer` starting a session with a tag, the tag in the Overview.

## WHAT WAS TESTED AND WHAT WAS NOT (planner, honest)
- TESTED (a clean clone of master at `0bf2a52`, the edits applied by a script that reads only THIS file, then `npm ci`):
  - The same result on LF, on a copy with every text file except the css in CRLF and the new lines written with LF, and on a copy with the new lines written with CRLF: `node scripts/check-tags.mjs` printed the two lines of step 11, `npm test` printed 22 files and 1176 tests, `npm run build` built. (The css files stay LF in this test: the css tests of `LineText` and `TimerScreen` fail on the UNCHANGED project when `src/timer.css` has CRLF, with or without this packet. Your 10A run passed them, so your css is not CRLF.)
  - `npx tsc -b`: exit 0. `npx oxlint`: 0 errors, 19 warnings (the same 19 as before this packet).
  - 16 deliberate breaks, one at a time (the tag sent on every start, a wrong argument name in start or add, an empty name accepted, any id accepted, a tag twice accepted, rename not checking the answer, a call to a function that does not exist, a number in the limit text, changed words, a missing text, the decisions file changed, a list not checked, the SQL renaming an argument, an anchor of C29 and an anchor of C55 changed): all 16 are noticed by `npm test` or by `check-tags`.
- NOT TESTED: a call from the app to the real Supabase (nothing in the app calls the tag functions yet; the only call that changed is Start, and with no tag it is the same call as before); the phone; the text of the SQL is read by `npm test` but not run (10A checked it in Supabase).

## THINGS TO KNOW (no check is possible)
- `DECISIONS_DAY_SCORE.md` section 4a ("an old session is one stretch") contradicts its section 2 ("an old session counts at full credit"); the database follows section 2. Not changed here.
- `supabase/day_score.sql` line 15 still says the tag is "not built yet". Not changed here.
- Four SQL breaks (rename of an archived tag, archive of someone else's tag, the list showing archived tags, the list order) are caught only by the planner's SQL behaviour test, which is not in the repository. Not changed here.
- If you change the words of a tag error, change `problemText`, its test in `src/lib/useTimer.test.ts`, section 5 of `DECISIONS_TAGS.md` and, for BAD_TAG_NAME, the rule in C55 together.

## EDITS OF THE CALLS (src/lib/timerApi.ts)

**Edit 1** (the comment under the comment about the day score: the old line says nothing asks for a tag, the new line names the tag calls)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// The last four names of DATABASE_ERRORS come from the tag functions (supabase/timer_schema.sql, Packet 10A). Nothing in the app asks for a tag yet (CONNECTIONS.md C28 and C55).
END TEXT

REPLACE WITH:
BEGIN TEXT
// The tags (supabase/timer_schema.sql, Packets 10A and 10B): timerTagList, timerTagAdd, timerTagRename and timerTagArchive call the four tag functions, readTag and readTagList check their answers, and timerStart can send the tag chosen before Start. The last four names of DATABASE_ERRORS come from these functions. No screen uses the calls yet (CONNECTIONS.md C28, C29 and C55).
END TEXT

**Edit 2** (the type TimerTag and the two readers, placed before the heading of the calls)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// ---- The calls ----
END TEXT

REPLACE WITH:
BEGIN TEXT
// One tag as the four tag functions send it: {id, name}. The id must look like an id (a uuid) and the name must be text that is not empty. Any other key is left out. The rules of a name (1 to 20 characters, not Freestyle) are checked by the database, not here.
export type TimerTag = { id: string; name: string }

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function readTag(json: unknown): TimerTag {
  if (!isRecord(json)) return bad("the tag is not an object")
  const id = json.id
  if (typeof id !== "string" || !UUID_SHAPE.test(id)) return bad("the tag id is not an id")
  const name = json.name
  if (typeof name !== "string" || name === "") return bad("the tag name is not text")
  return { id, name }
}

// The answer of timer_tag_list: the live tags of the person, oldest first. The order is kept. An empty list is fine. The same tag twice is refused.
export function readTagList(json: unknown): TimerTag[] {
  if (!Array.isArray(json)) return bad("the tag list is not a list")
  const tags = json.map((item) => readTag(item))
  if (new Set(tags.map((tag) => tag.id.toLowerCase())).size !== tags.length) return bad("the tag list holds the same tag twice")
  return tags
}

// ---- The calls ----
END TEXT

**Edit 3** (timerStart: a comment and the second argument (the tag, or null for Freestyle))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
export async function timerStart(zone: string): Promise<RunningReply> {
END TEXT

REPLACE WITH:
BEGIN TEXT
// The tag is the id of one of the person's live tags, or null for Freestyle (no tag). With null, or with the argument left out, nothing is sent for the tag: the call is the same as it was before tags.
export async function timerStart(zone: string, tagId: string | null = null): Promise<RunningReply> {
END TEXT

**Edit 4** (timerStart: the call without a tag stays as it was, a second line sends the tag)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  return readRunningReply(await call("timer_start", { p_tz: zone }))
END TEXT

REPLACE WITH:
BEGIN TEXT
  if (tagId === null) return readRunningReply(await call("timer_start", { p_tz: zone }))
  return readRunningReply(await call("timer_start", { p_tz: zone, p_tag_id: tagId }))
END TEXT

**Edit 5** (the four tag calls, placed before the end marker of the tag AB:TIMER.API)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
// AB:TIMER.API:END
END TEXT

REPLACE WITH:
BEGIN TEXT
// ---- The tags (the four tag functions of supabase/timer_schema.sql, see CONNECTIONS.md C55) ----
// The live tags of the signed-in person, oldest first.
export async function timerTagList(): Promise<TimerTag[]> {
  return readTagList(await call("timer_tag_list"))
}

// A new tag. The name is sent as typed: the database cuts the spaces at both ends and checks the rules (BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT). If an archived tag has that name, the newest one comes back with its old id.
export async function timerTagAdd(name: string): Promise<TimerTag> {
  return readTag(await call("timer_tag_add", { p_name: name }))
}

// A new name for a live tag (TAG_NOT_FOUND when it is not the person's own or is archived). The answer of another tag is refused.
export async function timerTagRename(id: string, name: string): Promise<TimerTag> {
  const tag = readTag(await call("timer_tag_rename", { p_id: id, p_name: name }))
  if (tag.id.toLowerCase() !== id.toLowerCase()) return bad("the answer is for another tag")
  return tag
}

// The tag leaves the list: it is archived, never deleted. The answer of another tag is refused.
export async function timerTagArchive(id: string): Promise<TimerTag> {
  const tag = readTag(await call("timer_tag_archive", { p_id: id }))
  if (tag.id.toLowerCase() !== id.toLowerCase()) return bad("the answer is for another tag")
  return tag
}
// AB:TIMER.API:END
END TEXT

## EDITS OF THE HOOK (src/lib/useTimer.ts)

**Edit 1** (problemText: the four tag errors get their own plain words (after the text of NOT_READY))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
      return "The app is not connected to the database."
END TEXT

REPLACE WITH:
BEGIN TEXT
      return "The app is not connected to the database."
    case "BAD_TAG_NAME":
      return "A tag name needs 1 to 20 characters, and cannot be Freestyle."
    case "TAG_NAME_TAKEN":
      return "You already have a tag with that name."
    case "TAG_LIMIT":
      return "You have the most tags allowed. Remove one to add another."
    case "TAG_NOT_FOUND":
      return "That tag is not there any more. Close the list and open it again."
END TEXT

## EDITS OF THE TESTS OF THE CALLS (src/lib/timerApi.test.ts)

**Edit 1** (the two decisions files are imported as text (after the import of the SQL file))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
import schemaSql from "../../supabase/timer_schema.sql?raw"
END TEXT

REPLACE WITH:
BEGIN TEXT
import schemaSql from "../../supabase/timer_schema.sql?raw"
import dayScoreDecisions from "../../DECISIONS_DAY_SCORE.md?raw"
import tagsDecisions from "../../DECISIONS_TAGS.md?raw"
END TEXT

**Edit 2** (the import list: readTag and readTagList)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  readStateReply,
END TEXT

REPLACE WITH:
BEGIN TEXT
  readStateReply,
  readTag,
  readTagList,
END TEXT

**Edit 3** (the import list: the four tag calls)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  timerState,
END TEXT

REPLACE WITH:
BEGIN TEXT
  timerState,
  timerTagAdd,
  timerTagArchive,
  timerTagList,
  timerTagRename,
END TEXT

**Edit 4** (the title of the test of the error names (ten, not six))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("are the six names the database functions raise", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("are the ten names the database functions raise", () => {
END TEXT

**Edit 5** (the title of the test of the function names (ten, not six))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("has the six functions the app calls, with the argument names the app sends", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("has the ten functions the app calls, with the argument names the app sends", () => {
END TEXT

**Edit 6** (the list of function signatures that must be in the SQL file: the four tag functions)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
"timer_resume()", "timer_end()"]) {
END TEXT

REPLACE WITH:
BEGIN TEXT
"timer_resume()", "timer_end()", "timer_tag_list()", "timer_tag_add(p_name text)", "timer_tag_rename(p_id uuid, p_name text)", "timer_tag_archive(p_id uuid)"]) {
END TEXT

**Edit 7** (the new tests of the tags and of the decisions files, placed before the tests of the pause log)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
describe("the pause log in the SQL file (Packet 09A)", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
const TAG_A = { id: "3f2b8c1e-5d4a-4b7e-9c10-2a6f8d9e0b11", name: "Python" }
const TAG_B = { id: "9a1c7e44-0b52-4f3d-8e6a-5c2d1f7b3a90", name: "Book" }

describe("the tags: the readers and the calls (Packet 10B)", () => {
  it("reads one tag into its id and its name, and leaves out any other key", () => {
    expect(readTag(TAG_A)).toEqual(TAG_A)
    expect(readTag({ ...TAG_A, extra: 1 })).toEqual(TAG_A)
  })

  it("refuses a tag that is not an object, has no id like a uuid, or has no name", () => {
    for (const value of [null, undefined, "Python", 5, [], [TAG_A]]) expect(kindOf(() => readTag(value))).toBe("BAD_REPLY")
    for (const id of [undefined, null, 5, "", "abc", "3f2b8c1e-5d4a-4b7e-9c10-2a6f8d9e0b1", "3f2b8c1e-5d4a-4b7e-9c10-2a6f8d9e0b1g"]) {
      expect(kindOf(() => readTag({ ...TAG_A, id }))).toBe("BAD_REPLY")
    }
    for (const name of [undefined, null, 5, "", ["Python"]]) expect(kindOf(() => readTag({ ...TAG_A, name }))).toBe("BAD_REPLY")
  })

  it("says in the reason which part of the tag is wrong", () => {
    expect(() => readTag("Python")).toThrow("the tag is not an object")
    expect(() => readTag({ ...TAG_A, id: "abc" })).toThrow("the tag id is not an id")
    expect(() => readTag({ ...TAG_A, name: "" })).toThrow("the tag name is not text")
  })

  it("reads a list of tags in the order sent, and an empty list", () => {
    expect(readTagList([TAG_A, TAG_B])).toEqual([TAG_A, TAG_B])
    expect(readTagList([])).toEqual([])
  })

  it("refuses an answer that is not a list, a list with a wrong tag in it, and the same tag twice", () => {
    for (const value of [null, undefined, {}, "[]", 0, TAG_A]) expect(kindOf(() => readTagList(value))).toBe("BAD_REPLY")
    expect(kindOf(() => readTagList([TAG_A, { id: "x", name: "Book" }]))).toBe("BAD_REPLY")
    expect(() => readTagList([TAG_A, TAG_A])).toThrow("the tag list holds the same tag twice")
    expect(kindOf(() => readTagList([TAG_A, { ...TAG_A, id: TAG_A.id.toUpperCase() }]))).toBe("BAD_REPLY")
  })

  it("timerTagList calls timer_tag_list with no arguments and hands back the checked list", async () => {
    const rpc = answer([TAG_A, TAG_B])
    expect(await timerTagList()).toEqual([TAG_A, TAG_B])
    expect(rpc).toHaveBeenCalledWith("timer_tag_list", undefined)
  })

  it("timerTagAdd sends the name as typed, by the argument name p_name", async () => {
    const rpc = answer(TAG_A)
    expect(await timerTagAdd("  Python ")).toEqual(TAG_A)
    expect(rpc).toHaveBeenCalledWith("timer_tag_add", { p_name: "  Python " })
  })

  it("timerTagRename sends p_id and p_name, timerTagArchive sends p_id, and both hand back the tag", async () => {
    let rpc = answer({ ...TAG_A, name: "Coding" })
    expect(await timerTagRename(TAG_A.id, "Coding")).toEqual({ id: TAG_A.id, name: "Coding" })
    expect(rpc).toHaveBeenCalledWith("timer_tag_rename", { p_id: TAG_A.id, p_name: "Coding" })
    rpc = answer(TAG_A)
    expect(await timerTagArchive(TAG_A.id)).toEqual(TAG_A)
    expect(rpc).toHaveBeenCalledWith("timer_tag_archive", { p_id: TAG_A.id })
  })

  it("rename and archive refuse the answer of another tag, and an id in capitals is the same id", async () => {
    answer(TAG_B)
    expect(await kindOfAsync(() => timerTagRename(TAG_A.id, "Book"))).toBe("BAD_REPLY")
    expect(await kindOfAsync(() => timerTagArchive(TAG_A.id))).toBe("BAD_REPLY")
    answer(TAG_A)
    expect(await timerTagArchive(TAG_A.id.toUpperCase())).toEqual(TAG_A)
  })

  it("every tag call: no client is NOT_READY, a lost connection is NO_CONNECTION, a wrong shape is BAD_REPLY", async () => {
    const runs = [() => timerTagList(), () => timerTagAdd("Python"), () => timerTagRename(TAG_A.id, "Coding"), () => timerTagArchive(TAG_A.id)]
    holder.client = null
    for (const run of runs) expect(await kindOfAsync(run)).toBe("NOT_READY")
    fail({ message: "Failed to fetch" })
    for (const run of runs) expect(await kindOfAsync(run)).toBe("NO_CONNECTION")
    answer({})
    for (const run of runs) expect(await kindOfAsync(run)).toBe("BAD_REPLY")
  })

  it("each of the four tag errors comes back as its own name", async () => {
    for (const name of ["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"] as const) {
      fail({ message: name, code: "P0001" })
      expect(await kindOfAsync(() => timerTagAdd("Python"))).toBe(name)
    }
  })

  it("timerStart sends p_tag_id only when a tag is given: no tag, null or nothing sends exactly what was sent before tags", async () => {
    const running = { server_now: SERVER_NOW, running: RUNNING }
    let rpc = answer(running)
    await timerStart("Asia/Kolkata", TAG_A.id)
    expect(rpc).toHaveBeenCalledWith("timer_start", { p_tz: "Asia/Kolkata", p_tag_id: TAG_A.id })
    rpc = answer(running)
    await timerStart("Asia/Kolkata", null)
    expect(Object.keys(rpc.mock.calls[0][1] as object)).toEqual(["p_tz"])
    rpc = answer(running)
    await timerStart("Asia/Kolkata")
    expect(Object.keys(rpc.mock.calls[0][1] as object)).toEqual(["p_tz"])
  })

  it("a tag that is gone when the session starts is TAG_NOT_FOUND", async () => {
    fail({ message: "TAG_NOT_FOUND", code: "P0001" })
    expect(await kindOfAsync(() => timerStart("Asia/Kolkata", TAG_A.id))).toBe("TAG_NOT_FOUND")
  })
})

describe("the decisions files are in the repository (Packet 10B)", () => {
  it("DECISIONS_TAGS.md names the four tag errors and the rules the SQL file follows", () => {
    for (const name of ["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"]) expect(tagsDecisions).toContain(name)
    expect(tagsDecisions).toContain("At most 10 live tags.")
    expect(tagsDecisions).toContain("1 to 20 characters")
  })

  it("DECISIONS_DAY_SCORE.md is there: the SQL files and their tests name it", () => {
    expect(dayScoreDecisions.length).toBeGreaterThan(1000)
    expect(dayScoreSql).toContain("DECISIONS_DAY_SCORE.md")
  })
})

describe("the pause log in the SQL file (Packet 09A)", () => {
END TEXT

## EDITS OF THE TESTS OF THE TEXTS (src/lib/useTimer.test.ts)

**Edit 1** (problemText: the list of kinds with their own text now holds eight kinds)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  const SPECIAL: TimerErrorKind[] = ["NOT_SIGNED_IN", "BAD_TIMEZONE", "BAD_REPLY", "NOT_READY"]
END TEXT

REPLACE WITH:
BEGIN TEXT
  const SPECIAL: TimerErrorKind[] = ["NOT_SIGNED_IN", "BAD_TIMEZONE", "BAD_REPLY", "NOT_READY", "BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"]
END TEXT

**Edit 2** (the title of the test: eight problems)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("gives its own text to the four problems the person can understand", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("gives its own text to the eight problems the person can understand", () => {
END TEXT

**Edit 3** (the number of different texts: eight)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
    expect(new Set(texts).size).toBe(4)
END TEXT

REPLACE WITH:
BEGIN TEXT
    expect(new Set(texts).size).toBe(8)
END TEXT

**Edit 4** (a new test with the exact words of the four tag errors, placed before the test about signing in)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it("says to sign in again when the sign in is gone", () => {
END TEXT

REPLACE WITH:
BEGIN TEXT
  it("says what is wrong with a tag, in plain words", () => {
    expect(problemText("BAD_TAG_NAME")).toBe("A tag name needs 1 to 20 characters, and cannot be Freestyle.")
    expect(problemText("TAG_NAME_TAKEN")).toBe("You already have a tag with that name.")
    expect(problemText("TAG_LIMIT")).toBe("You have the most tags allowed. Remove one to add another.")
    expect(problemText("TAG_NOT_FOUND")).toBe("That tag is not there any more. Close the list and open it again.")
    expect(problemText("TAG_LIMIT")).not.toMatch(/\d/)
  })

  it("says to sign in again when the sign in is gone", () => {
END TEXT

## EDITS OF THE TESTS OF THE HOOK (src/lib/useTimer.hook.test.ts)

**Edit 1** (the list of kinds that show a text of their own: the four tag errors are added)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
  it.each(["NOT_SIGNED_IN", "BAD_TIMEZONE", "BAD_REPLY", "NOT_READY", "UNKNOWN"] as const)(
END TEXT

REPLACE WITH:
BEGIN TEXT
  it.each(["NOT_SIGNED_IN", "BAD_TIMEZONE", "BAD_REPLY", "NOT_READY", "UNKNOWN", "BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"] as const)(
END TEXT

## CODE_MAP EDITS (CODE_MAP.md)

**Edit 1** (row AB:TIMER.API: what it does (the four tag calls))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
The calls from the app to the six database functions of the Pro Timer and to the day score
END TEXT

REPLACE WITH:
BEGIN TEXT
The calls from the app to the six database functions of the Pro Timer, to the four tag functions (the list, add, rename and archive of the person's tags; Start can send the tag) and to the day score
END TEXT

**Edit 2** (row AB:TIMER.API: the connections now name C55)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(CONNECTIONS.md C28, C29 and C54) |
END TEXT

REPLACE WITH:
BEGIN TEXT
(CONNECTIONS.md C28, C29, C54 and C55) |
END TEXT

**Edit 3** (row AB:TIMER.STATE: the texts of the problem messages now include the four tag errors)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the texts of the problem messages (problemText);
END TEXT

REPLACE WITH:
BEGIN TEXT
the texts of the problem messages (problemText; the four tag errors have their own words, see CONNECTIONS.md C28 and C55);
END TEXT

**Edit 4** (row AB:TIMER.TESTS: what the tests cover (the tags in the app and the two decisions files))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
the reading of the day score and the call that asks for it (every key and every word, the answers that are refused),
END TEXT

REPLACE WITH:
BEGIN TEXT
the reading of the day score and the call that asks for it (every key and every word, the answers that are refused), the tags in the app (the reading of a tag and of the list, the four tag calls, the tag sent with Start only when there is one, the plain words of the four tag errors, the two decisions files in the repository),
END TEXT

## CONNECTIONS EDITS (CONNECTIONS.md)

**Edit 1** (C28: the sentence about the four tag errors (they now have their own words))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
(no screen asks for a tag yet, so useTimer shows these four as Something went wrong)
END TEXT

REPLACE WITH:
BEGIN TEXT
(from Packet 10B problemText gives each of these four its own plain words; no screen asks for a tag yet)
END TEXT

**Edit 2** (C28: the sentence about the names that get their own text in problemText)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
NOT_SIGNED_IN and BAD_TIMEZONE get their own text in problemText.
END TEXT

REPLACE WITH:
BEGIN TEXT
NOT_SIGNED_IN, BAD_TIMEZONE and the four tag errors get their own text in problemText.
END TEXT

**Edit 3** (C28: four new Anchor lines after the anchor of CONFLICTS)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const CONFLICTS: readonly TimerErrorKind[] = ["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED"]`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const CONFLICTS: readonly TimerErrorKind[] = ["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED"]`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts =     case "BAD_TAG_NAME":`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts =     case "TAG_NAME_TAKEN":`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts =     case "TAG_LIMIT":`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts =     case "TAG_NOT_FOUND":`
END TEXT

**Edit 4** (C29: the function names (the four tag functions))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
timer_pause, timer_resume, timer_end; and timer_day_score in supabase/day_score.sql)
END TEXT

REPLACE WITH:
BEGIN TEXT
timer_pause, timer_resume, timer_end, timer_tag_list, timer_tag_add, timer_tag_rename, timer_tag_archive; and timer_day_score in supabase/day_score.sql)
END TEXT

**Edit 5** (C29: the argument names (p_tag_id is sent now, p_name and p_id are new))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
an argument name (p_tz, p_day, and p_tag_id of timer_start, which the app does not send yet),
END TEXT

REPLACE WITH:
BEGIN TEXT
an argument name (p_tz, p_day, p_tag_id of timer_start, which the app sends only when a tag is given, p_name and p_id of the tag functions),
END TEXT

**Edit 6** (C29: the readers (readTag and readTagList))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
readDayScore and readTimerRow) read the keys by name
END TEXT

REPLACE WITH:
BEGIN TEXT
readDayScore, readTimerRow, readTag and readTagList) read the keys by name
END TEXT

**Edit 7** (C29: five new Anchor lines after the anchor of timer_day_score (the start with a tag and the four tag calls))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_day_score", { p_day: day })`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_day_score", { p_day: day })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_start", { p_tz: zone, p_tag_id: tagId })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_tag_list")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_tag_add", { p_name: name })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_tag_rename", { p_id: id, p_name: name })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_tag_archive", { p_id: id })`
END TEXT

**Edit 8** (C29: one new Anchor line for the four tag signatures in the test (after the anchor of the day score tests))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the day score reply and the call (Packet 09C)", () => {`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the day score reply and the call (Packet 09C)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = "timer_tag_list()", "timer_tag_add(p_name text)", "timer_tag_rename(p_id uuid, p_name text)", "timer_tag_archive(p_id uuid)"`
END TEXT

**Edit 9** (C55: the list of things that must change together (the tag readers and calls, the plain words, the two decisions files))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
) or the four error names BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT and TAG_NOT_FOUND
END TEXT

REPLACE WITH:
BEGIN TEXT
), the four error names BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT and TAG_NOT_FOUND, the tag readers and calls in timerApi.ts (readTag, readTagList, timerTagList, timerTagAdd, timerTagRename, timerTagArchive and the second argument of timerStart), the plain words of the four errors in problemText, or the two decisions files in the repository root (DECISIONS_TAGS.md and DECISIONS_DAY_SCORE.md)
END TEXT

**Edit 10** (C55: what is true since Packet 10B (the calls exist, no screen uses them))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
, although no screen and no call asks for a tag yet.
END TEXT

REPLACE WITH:
BEGIN TEXT
, and since Packet 10B the app has the calls (timerTagList, timerTagAdd, timerTagRename, timerTagArchive and timerStart with a tag id; the answers are read by readTag and readTagList), but no screen uses them yet. timerStart sends p_tag_id only when a tag id is given: with null, or with nothing, it sends exactly what it sent before tags. problemText gives the four errors their own plain words (C28); the words of BAD_TAG_NAME say 1 to 20 characters and that Freestyle is not allowed, so they change together with that rule. The two decisions files are DECISIONS_TAGS.md (the rules of the tags) and DECISIONS_DAY_SCORE.md (the rules of the day score, C54); a rule is changed in its file first.
END TEXT

**Edit 11** (C55: new Anchor lines after the last Anchor (the type and the readers, the tests of the tags, the test of the texts))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/tagsSql.test.ts = const TAG_ERRORS = ["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"]`
END TEXT

REPLACE WITH:
BEGIN TEXT
- Anchor: `AB:TIMER.TESTS @ src/lib/tagsSql.test.ts = const TAG_ERRORS = ["BAD_TAG_NAME", "TAG_NAME_TAKEN", "TAG_LIMIT", "TAG_NOT_FOUND"]`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export type TimerTag = { id: string; name: string }`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export function readTagList(json: unknown): TimerTag[] {`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the tags: the readers and the calls (Packet 10B)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = describe("the decisions files are in the repository (Packet 10B)", () => {`
END TEXT

## PROGRESS EDITS (PROGRESS.md)

**Edit 1** (the Done line of Packet 10B (put after the Packet 10A line))

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
CODE_MAP.md and CONNECTIONS.md (C28, C29, C53, new C55) were brought up to date.
END TEXT

REPLACE WITH:
BEGIN TEXT
CODE_MAP.md and CONNECTIONS.md (C28, C29, C53, new C55) were brought up to date.
- Packet 10B: the app learns the tags (src/lib/timerApi.ts and src/lib/useTimer.ts; tests in timerApi.test.ts, useTimer.test.ts and useTimer.hook.test.ts). timerApi.ts has the type TimerTag, the readers readTag and readTagList, the four calls timerTagList, timerTagAdd, timerTagRename and timerTagArchive, and timerStart(zone, tagId), which sends p_tag_id only when a tag is given (null or nothing sends what was sent before tags). problemText in useTimer.ts gives the four tag errors (BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT, TAG_NOT_FOUND) their own plain words. DECISIONS_TAGS.md (version 1.1) and DECISIONS_DAY_SCORE.md are now in the repository root. No screen and no hook uses the tag calls yet, and the SQL was not changed (nothing to run in Supabase). The choices of this packet are labelled DEFAULT in the packet for the owner to correct. CODE_MAP.md and CONNECTIONS.md (C28, C29, C55) were brought up to date.
END TEXT

**Edit 2** (the line that starts with - Then: the tags are locked, the next packets are 10C and 10D)

FIND (one line; it occurs exactly once; if it does not, STOP):
BEGIN TEXT
- Then: the tag picker and the use of tags (the database part is Packet 10A; the right side of the wide layout is kept free for the picker; the owner first answers the open questions of the tags talk, for example tap to start or pick first, and says lock it) and the real Overview, Calendar and Guide screens, which are placeholders today. The order is not decided yet.
END TEXT

REPLACE WITH:
BEGIN TEXT
- Then: the tags, as locked in DECISIONS_TAGS.md (order agreed by the owner on 2026-10-17): Packet 10C the picker on the Pro Timer (chips on a wide screen, a pill and a slide-up list on a phone; the tag goes with Start and the choice is back to No tag after every session), Packet 10D the Manage tags view (add, rename, remove, with the plain error words). After the tags: the real Overview (time per tag, the day score), Calendar and Guide screens, which are placeholders today. The order after the tags is not decided yet.
END TEXT
