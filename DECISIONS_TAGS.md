# ASHBORN: Session tags, DECISIONS

**Status:** LOCKED on 17 Oct 2026. Hari said "if you asked all the q then lock" after the talk (`reference/TALK_SUMMARY_TAGS.md`). Questions 7, 8 and 9 of that talk were NOT asked: the planner suggested parking them and Hari said to lock.
**This file is a document only.** No code, no screens, no packets come from it until Hari has read it and corrected what is wrong.
**Version 1.1 (Packet 10B, 17 Oct 2026):** only facts and the plain words of the four tag errors were added (sections 2, 3, 5, 8 and 9). No rule was changed.
**Rule for every later packet about tags:** it must match this file. To change a rule, change THIS FILE first (tell the planner), then the packet.

**How to read the labels**
- **DECIDED:** Hari said yes to it in the talk.
- **DEFAULT:** nobody decided it in the talk. The planner chose it (in Packet 10A or here) so that the file is complete. Hari was told about the database defaults (rename, limit, list in the account) on 17 Oct and did not object, but he has not read this whole file. Tell the planner what is wrong and it changes.
- **PARKED:** left for later. Not lost.

---

## 1. What does NOT change

- **DECIDED:** a tag does NOT change the day score. Weights per tag (for example Python worth more than Book) are parked.
- The Pro Timer works as today: Start, Pause, Resume, Hold to end, the stop alert, the 60 second rule, the midnight cut. The quality steps, the glowing ball and the colours follow counted minutes only. Tags do not touch the live timer.

## 2. What is saved (the facts)

Done in **Packet 10A** (commit `0bf2a52` on master of github.com/Hari1404/ASHBORN; the SQL was run and checked in Supabase on 17 Oct 2026: `timer_verify.sql` 13 of 13, `day_score_verify.sql` 19 of 19).

| Fact | Where | Sessions saved before 10A |
|---|---|---|
| the tag of a session | `timer_sessions.tag_id` (also on the running session) | empty (NULL) = Freestyle or not known; the two cannot be told apart |
| a person's tags | table `timer_tags` (a row per tag: name, `archived_at`) | not applicable |

From Packet 10B the app has the calls (`src/lib/timerApi.ts`: `timerTagList`, `timerTagAdd`, `timerTagRename`, `timerTagArchive`, and `timerStart` with an optional tag id). No screen uses them yet and no screen shows tags.

## 3. The database rules (all DEFAULT, from Packet 10A, already live in Supabase)

1. Storage: table `timer_tags`; a person reads only their own; nobody writes directly (only the functions).
2. Name rules: spaces cut at both ends, 1 to 20 characters, no control character, "Freestyle" (any capitals) is reserved.
3. One live tag per name per person, whatever the capitals (Python = python).
4. At most 10 live tags. A rename needs no free place.
5. Delete means archive: the row stays and old sessions keep their tag.
6. A rename changes the tag row, so OLD sessions show the NEW name.
7. Adding a name that matches an archived tag brings back the NEWEST archived tag of that name (same id, takes the new spelling).
8. Renaming or archiving an archived tag is TAG_NOT_FOUND.
9. `tag_id` is empty for Freestyle and for sessions saved before tags.
10. `timer_start(p_tz, p_tag_id default null)`: the tag may be left out (= Freestyle). A tag that is not yours or is archived: TAG_NOT_FOUND. The old one-argument version is gone.
11. `timer_end` saves the tag of the running session even if the tag was archived while the session ran.
12. The app is not sent the tag yet (`timer_row_json` keeps its six keys). A later packet adds it together with the type and the maths.
13. Four functions, signed-in people only: `timer_tag_list` (live tags only, oldest first), `timer_tag_add`, `timer_tag_rename`, `timer_tag_archive` (add, rename and archive answer `{id, name}`).
14. Four error names: BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT, TAG_NOT_FOUND. They are in `DATABASE_ERRORS`. From Packet 10B `problemText` in `useTimer.ts` gives each its own plain words (section 5); no screen reacts to them yet.

## 4. The picker (what Hari sees before a session)

- **DECIDED:** you pick the tag first, then press Start. Tapping a tag only selects it; it never starts the timer.
- **DECIDED:** every session starts with no tag. The app does NOT remember the last tag. A tag used in session 1 does not come back in session 2; to use it again, you choose it again before Start. After a session ends (and on a fresh load) the choice is back to "no tag".
- **DECIDED:** Freestyle is a normal choice and means no tag is saved for that session.
- **DECIDED:** the look is chips in the app's pill style. No new library. Not used: React Bits Option Wheel, Pill Nav, Animated List, a dropdown with search.
- **DECIDED (phone):** one pill next to Start shows the current choice ("No tag" at first). Tapping it opens the full list of tags.
- **DEFAULT (how the list looks):** it slides up from the bottom near the thumb. "No tag" is the first row, then the tags in the order the database gives them (oldest first). Each row is at least 44 pixels tall. Tapping a row selects it and closes the list.
- **DEFAULT (wide screen, a laptop):** all chips are visible at once on the free right side of the layout, with "No tag" as one of them. (Hari agreed to the chip look but did not confirm the wide layout separately.)
- **DEFAULT:** while a session is running, the pill or chips show the tag but cannot change it. The database has no function to change the tag of a running session.
- **DEFAULT (wording):** the word shown for "no tag" is "No tag". The name "Freestyle" stays reserved in the database, so nobody can make a tag with that name.

## 5. Adding, renaming and removing tags

- **DECIDED:** you add and edit your own tags. You expect about 4 to 10. The live limit is 10 (DEFAULT from 10A, see section 3).
- **DECIDED (going with the planner's suggestion):** it happens in the same list. A "Manage tags" row at the bottom of the list turns it into an edit view with add, rename and remove. There is no separate Tags screen.
- Remove means archive (section 3, rule 5).
- **DEFAULT (the words are written in Packet 10B, in `problemText`):** the edit view shows a short plain message for each error. BAD_TAG_NAME: "A tag name needs 1 to 20 characters, and cannot be Freestyle." TAG_NAME_TAKEN: "You already have a tag with that name." TAG_LIMIT: "You have the most tags allowed. Remove one to add another." (no number in it, so the live limit stays cheap to change) TAG_NOT_FOUND: "That tag is not there any more. Close the list and open it again."

## 6. Parked (not part of this plan)

- Tasks with open, done and failed status; locked tags; finished tags.
- Tag weights in the score.
- **Question 7:** changing the tag of a saved session afterwards. Needs no new saved data, so waiting loses nothing.
- **Question 8:** what the Overview shows per tag. The direction is AGREED (the Overview shows where your time went per tag); the details (day, week, month, list or chart) come later.
- **Question 9:** a colour or icon per tag.
- The Overview later needs a way to ask for a week or a month of day scores at once (the call asks for one day today).

## 7. Cheap and expensive to change

- **Expensive:** which facts are saved per session. The tag fact is now saved (10A), so this part is done.
- **Cheap:** looks, wording, the live limit (one number in the SQL), the picker layout.

## 8. Check these first (the defaults that change the feel the most)

1. A rename shows in old sessions (rule 6).
2. The limit of 10 live tags (rule 4).
3. The word "No tag" on the pill and the list.
4. All chips visible on a wide screen.
5. The tag cannot be changed while a session runs.
6. The four plain error texts of section 5.

## 9. What comes after this file (a suggestion, the order is NOT decided)

Each packet is written only after the previous one PASSED.

1. **10B, the app learns the tags (no screen; `packets/PACKET_10B_TAGS_APP_CALLS.md`):** calls in `src/lib/timerApi.ts` for the four tag functions and for starting a session with a tag, with tests; the four error names get plain wording; this packet also puts `DECISIONS_TAGS.md` and `DECISIONS_DAY_SCORE.md` into the repo (the second one was missing there although the SQL, the tests and `CONNECTIONS.md` refer to it).
2. **10C, the picker on the Pro Timer:** chips on a wide screen, the pill and the slide-up list on a phone, the chosen tag goes with Start, back to "No tag" after every session. It has a step for Hari to look at it on a real phone.
3. **10D, the Manage tags view:** add, rename, remove, with the error messages.
4. **Later:** the Overview with time per tag, and the day score on the Overview (agreed: not on the Pro Timer).
