# ASHBORN: Session tags, DECISIONS

**Status:** LOCKED on 17 Oct 2026 (section 4b added 18 Oct 2026, version 1.3; points 4 and 7 of section 4b changed in version 1.4). Hari said "if you asked all the q then lock" after the talk (`reference/TALK_SUMMARY_TAGS.md`). Questions 7, 8 and 9 of that talk were NOT asked: the planner suggested parking them and Hari said to lock.
**This file is a document only.** No code, no screens, no packets come from it until Hari has read it and corrected what is wrong.
**Version 1.1 (Packet 10B, 17 Oct 2026):** only facts and the plain words of the four tag errors were added (sections 2, 3, 5, 8 and 9). No rule was changed.
**Version 1.2 (Packet 10C1, 17 Oct 2026):** rule 12 was changed (Hari said yes to B on 17 Oct 2026: the database now sends the tag of the running session to the app), the order of the next packets in sections 5 and 9 was changed (10C1, 10C2, 10D, 10E) and two DEFAULT lines of section 4 were made specific (where the pill sits, and what shows while a session runs). No other rule was changed.
**Version 1.3 (18 Oct 2026, written by the planner; it goes into the repository with the FIRST packet of the new picker, with a SHA-256 check like 10B and 10C1):** new section 4b (the picker, version 2: four most-used tags as pills, `All tags`, a pen icon, a glass look). Hari described it on 18 Oct 2026 (`reference/TALK_SUMMARY_TAG_PICKER_V2.md`) and then said: do not ask the small questions, decide them, he will change them afterwards. So every detail he did not say is a DEFAULT. Section 4 (the choice rules) stays true; only the DEFAULT lines about the laptop chips and about the Manage tags row/chip are replaced by 4b. Sections 5 and 9 changed (the pen icon, the new packet order).
**Version 1.4 (Packet 10F, 18 Oct 2026, written by the planner; it goes into the repository with Packet 10F, with a SHA-256 check like 10E):** two points of section 4b changed. Point 7 (the look): Hari said, while the planner was building the picker, "for stuff you can use the components from reactbits for glassmorphism and stuff", so `GlassSurface.tsx` (the ReactBits glass part that the login card already uses) IS used for the glass of the tags; the old line "no library, `GlassSurface.tsx` is NOT used" is replaced. Point 4 (the row on a wide screen): the rule for a chosen tag that is not one of the four was added (it was found while the tests were written: without it a chosen tag would show nowhere in the row). No other rule was changed.
**Version 1.5 (Packet 10F2, 18 Oct 2026, written by the planner after Hari's look at 10F; it goes into the repository with Packet 10F2):** points 4, 5, 7 and 8 of section 4b changed. (a) Point 4: the row no longer ends with the `All tags` pill with a pen; it ends with ONE small round button of three dots (Hari wanted it). The pen is not in the row any more: editing is reached from inside the menu (point 5 already had the pen at the top of the list, it is now the ONLY way in). The size of the button (44 by 44 px) and the three-dot icon are DEFAULTS. (b) Point 7: only the PANEL is glass now; every pill is a plain dark box without a backdrop filter. Hari's screenshots after pressing the pen showed stray pixels (pieces of a ring and tiny dashes) inside the NPTEL and All tags pills; the glass of a pill showed nothing anyway (the screen behind is black while no session runs), so the pill glass was removed as the most likely cause. The cause was NOT reproduced in the planner's sandbox: if the stray pixels still show after 10F2, the next suspect is the glass of the panel. (c) Point 7: the panel blurs what is behind it (the clock showed through almost sharp) and is darker; both are DEFAULTS. (d) Point 8: the pen icon is only at the top of the list; the pill is no longer `All tags` but a round three-dot button whose accessible name is `All tags`.
**Version 1.6 (Packet 10G, 18 Oct 2026, written by the planner; it goes into the repository with Packet 10G):** no rule was changed and nobody was asked again; the planner decided, and Hari changes it afterwards at his look. (a) Section 5 now says what 10G built: the two buttons of a row, the two steps of removing, one open row at a time, the error inside the row, Escape, the pick after a removal (the details are the new DEFAULT bullet there). (b) Section 5 said the work was built in two packets, 10D and 10E; since version 1.3 the last one is 10G, and the sentence says so. (c) Section 4b point 5 no longer says that renaming and removing are still to be added by the last packet: they are there. (d) Section 2 said that no screen uses the tag calls; it now says which screens do. (e) Section 9 says what 10G is: no SQL (the two database functions exist since 10A), so no Part 2 in Supabase. (f) Found at the real-browser look before the packet went to Hari (headless Chromium, 320 to 1280 px wide): after an error the focus fell to the page, and on a 320 px phone the field of a rename was a sliver 87 px wide. Section 5 point 5 now says where the focus goes after an error, and point 2 says that the field of a rename can grow from a basis of 140 px, so that on a narrow phone it is not squeezed and a button that does not fit beside it wraps onto the next line. Both are DEFAULTS.
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

From Packet 10B the app has the calls (`src/lib/timerApi.ts`: `timerTagList`, `timerTagAdd`, `timerTagRename`, `timerTagArchive`, and `timerStart` with an optional tag id). Since Packet 10C2 the picker uses the list and Start with a tag, since Packet 10D the Edit tags view adds a tag, and since Packet 10G it renames and removes one, so every tag call has a screen. From Packet 10C1 the database also sends the tag of the running session to the app (section 3, rule 12).

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
12. **DECIDED (Hari, 17 Oct 2026):** the database sends the tag of the running session to the app, so the screen can always show it, also after a reload and on another device. `timer_row_json` has one more key, `tag`: null for no tag (Freestyle), otherwise `{id, name}` with the name the tag has now (also when the tag was archived or renamed during the session). `timer_start`, `timer_pause`, `timer_resume` and `timer_state` all send it. The app reads it (`TimerRow` and `readTimerRow`); a missing key means no tag. The maths never use it. Done in Packet 10C1 (it is live in Supabase only after the owner has run `supabase/timer_schema.sql` of that packet).
13. Four functions, signed-in people only: `timer_tag_list` (live tags only, oldest first), `timer_tag_add`, `timer_tag_rename`, `timer_tag_archive` (add, rename and archive answer `{id, name}`).
14. Four error names: BAD_TAG_NAME, TAG_NAME_TAKEN, TAG_LIMIT, TAG_NOT_FOUND. They are in `DATABASE_ERRORS`. From Packet 10B `problemText` in `useTimer.ts` gives each its own plain words (section 5); no screen reacts to them yet.

## 4. The picker (what Hari sees before a session)

- **DECIDED:** you pick the tag first, then press Start. Tapping a tag only selects it; it never starts the timer.
- **DECIDED:** every session starts with no tag. The app does NOT remember the last tag. A tag used in session 1 does not come back in session 2; to use it again, you choose it again before Start. After a session ends (and on a fresh load) the choice is back to "no tag".
- **DECIDED:** Freestyle is a normal choice and means no tag is saved for that session.
- **DECIDED:** the look is chips in the app's pill style. No new library. Not used: React Bits Option Wheel, Pill Nav, Animated List, a dropdown with search.
- **DECIDED (phone):** one pill next to Start shows the current choice ("No tag" at first). Tapping it opens the full list of tags.
- **DEFAULT (where the pill sits on the phone):** just above Start, as wide as the buttons box and 44 pixels tall, so the dial does not get smaller.
- **DEFAULT (how the list looks):** it slides up from the bottom near the thumb. "No tag" is the first row, then the tags in the order the database gives them (oldest first). Each row is at least 44 pixels tall. Tapping a row selects it and closes the list.
- **DEFAULT (wide screen, a laptop):** all chips are visible at once on the free right side of the layout, with "No tag" as one of them. (Hari agreed to the chip look but did not confirm the wide layout separately.)
- **DEFAULT:** while a session is running (running or paused) the tag cannot be changed (the database has no function to change the tag of a running session). The name of the tag shows as one small line inside the dial under the day total, and nothing shows for Freestyle. The pill, the list and the chips are not shown while a session runs.
- **DEFAULT (wording):** the word shown for "no tag" is "No tag". The name "Freestyle" stays reserved in the database, so nobody can make a tag with that name.

## 4b. The picker, version 2 (18 Oct 2026; replaces the DEFAULT lines of section 4 about the laptop chips and the Manage tags row/chip)

**DECIDED (Hari, 18 Oct 2026, in his own words, see the talk summary):**
- Only FOUR tags are shown as pills above Start.
- The four are the tags he USES most (NPTEL first if he uses it most); the order follows use.
- All other tags are reached through a place called `All tags` (the words `Manage tags` go away); he can pick any tag from it.
- A PEN icon is in that place. Pressing it switches it to editing: adding, renaming, removing. Nothing else is needed to edit ("very simple").
- A glassmorphism look for the tags and their places.
- **PARKED by Hari:** one more tag that appears "apart from the four"; he will say when it applies. Until then `No tag` stays as today (a chip that is not counted among the four).

**DEFAULT (the planner decided these on 18 Oct 2026 because Hari said "decide it yourself and change it afterwards"):**
1. **What "use" means:** the sum of `active_seconds` of the SAVED sessions of that tag that ENDED in the last 30 days (`ended_at >= now() - interval '30 days'`). The running session is not counted. Archived tags are not shown. A tag with no use counts 0.
2. **Order:** most use first; equal use (including 0): the older tag first (the order the database already gives). The order is read when the picker reads the list (not live while he looks at it), so pills never jump under his finger.
3. **Where the numbers come from:** a NEW database function `timer_tag_use()` that answers `[{"id": ..., "seconds": ...}]` for every live tag (0 when unused), oldest first, read-only, signed-in people only. `timer_tag_list()` is NOT changed (rule 13 stays true). The app does the sorting (a plain function with tests).
4. **Laptop row above Start:** `No tag` (as today), then the first four tags in that order as glass pills, then (version 1.5) ONE small round button of three dots (the old `All tags` pill with a pen is gone). With fewer than four tags it shows the tags there are. **(Version 1.4)** If the tag that is chosen is not one of the four (it was chosen from the `All tags` list), the row shows it as ONE more pressed pill after the four and before the three dots, so that the row always shows the choice; it goes away when another choice is made. The three dots are always there (they open the list, and the pen at the top of the list is the way to add a tag).
5. **The `All tags` place (laptop and phone):** a glass panel (the place of the 10D box, at the top) that lists EVERY tag in the same order, as rows; a tap on a row chooses the tag and closes the place (nothing starts). The pen icon sits at the top right of the panel (**version 1.5: it is the ONLY way into edit mode; the wide row has no pen**); pressing it switches the panel to EDIT mode (the 10D box: the field and Add, the error line; since version 1.6 every tag in its list also has Rename and Remove, see section 5). `Back` in edit mode returns to the list. Escape and a tap on the dark part close everything, as in 10D.
6. **Phone:** keeps its one pill above Start and the slide-up list (the dial must not shrink). The list is the `All tags` place: `No tag`, then ALL tags in the order of point 2, with the pen icon at the top of the sheet. There is no separate `Manage tags` row any more.
7. **Look (version 1.4):** the glass is the ReactBits part `GlassSurface.tsx` (the same part as the login card; it is not edited), used **since version 1.5 only for the panel** of the `All tags` place (the rows inside the panel are plain); every pill of the wide-screen row and the one pill of the phone are plain dark boxes without a backdrop filter. Its settings are ONE object, `GLASS`, at the top of `TagPicker.tsx` (the corner of every box, and the panel set; `displace`, the blur, is 10); how dark it is, is css (`.ab-tag-glass`, `.ab-tag-glass-panel`). The dim layer behind the panel is plain, with no blur in css. **Lite mode** (a touch screen, `src/lib/lite.ts`, or `?lite=1` in the address): NO glass; a plain dark box of the same size and corner stands in the place of the panel, because a blur over the moving background was laggy on a phone (CONNECTIONS.md C25). So on a phone Hari sees the plain dark version, and `?lite=0` in the address shows the glass; the laptop gets the glass on the panel. The chosen pill stays the white one (it must read at a glance). Every glass part is looked at in the real-browser kit at phone size and laptop size before a packet goes to Hari. No new library file is added.
8. **The pen icon** is a drawn icon (inline SVG, no library) with the accessible name `Edit tags`; it is at the top of the list only (version 1.5). The three dots are a drawn icon too (three circles, inline SVG) on a round button with the accessible name `All tags`.
9. **Still true from section 4:** pick first, then Start; every session starts with `No tag`; the choice is never remembered; the tag cannot change while a session runs; a tag name is shown as plain text.

## 5. Adding, renaming and removing tags

- **DECIDED:** you add and edit your own tags. You expect about 4 to 10. The live limit is 10 (DEFAULT from 10A, see section 3).
- **DECIDED (going with the planner's suggestion):** it happens in the same list. (Version 1.3: the entry is now the pen icon of the `All tags` place, see 4b; 10D built it as a `Manage tags` row and chip.) The edit view has add, rename and remove. There is no separate Tags screen. It was built in two packets: 10D adds a tag, 10G renames and removes a tag (10E was renumbered, see section 9).
- Remove means archive (section 3, rule 5).
- **DEFAULT (version 1.6, Packet 10G; the planner decided, Hari changes it afterwards):** how renaming and removing work in the edit view.
  1. Every tag in the list of the edit view shows its name (plain text, never a button) and two small buttons, `Rename` and `Remove` (44 px high; the accessible names are `Rename NAME` and `Remove NAME`).
  2. `Rename` turns THAT row into a text field (the name filled in and selected) with `Save` and `Cancel`. Enter saves. Escape cancels the rename only (a second Escape closes the whole place). Saving the same name (after the spaces are cut) closes the field and sends nothing; a change of the capitals only (python to Python) is sent and allowed (the database does not count the tag itself as a taken name; section 3, rule 3). The database checks the new name; the box has no rule of its own, as with Add. The field has a basis of 140 px and can grow, so that on a narrow phone it is not squeezed to a sliver: a button that does not fit beside it wraps onto the next line (measured at 320 px wide: the field is 175 px, Save sits beside it and only Cancel goes to the next line).
  3. `Remove` turns THAT row into the question `Remove "NAME"?` with the line `Old sessions keep it. Adding the same name again brings it back.` and two buttons, `Remove` and `Keep`; the focus is on `Keep`. It is two steps on purpose: a wrong tap on a phone is easy, and a removed tag comes back only by typing its name again. Removing archives the tag (rule 5), so old sessions keep it. If the removed tag was the one picked before Start, the pick goes back to `No tag`.
  4. Only ONE row is open at a time. `Back`, closing the place, or opening another row drops an open row and sends nothing. While a call runs, nothing else in the box can be pressed or typed.
  5. An error shows in ONE line inside the row that was being changed (not under the Add field, which can be far away on a phone), until the person types or presses `Cancel` or `Keep`. TAG_NOT_FOUND also reads the list again, so the row disappears by itself, and its words then show under the Add field. After an error the focus goes back to where the person works: into the field of the row after a refused rename (the typed text stays), onto `Keep` after a refused removal, and into the Add field after a refused Add and when the row is gone. (The button that was pressed is off while the call runs, so without this the focus falls to the page, and a keyboard or screen-reader person has to Tab in again from the top.)
  6. A tag may be renamed or removed while ITS session runs (rules 11 and 12). On the screen that only happens from another device, because the picker is not shown while a session runs; the line in the dial follows the name the database sends at the next reading.
  7. Not in Packet 10G (section 6): changing the tag of a SAVED session (question 7), the Overview per tag (question 8), a colour or icon per tag (question 9).
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
2. **10C1, the database sends the tag of the running session (no screen; `packets/PACKET_10C1_TAG_OF_RUNNING_SESSION.md`):** `timer_row_json` gets the key `tag`, the type `TimerRow` and `readTimerRow` learn it, `timer_verify.sql` gets a 14th row. The owner runs the SQL by hand in Supabase. This packet puts this file (version 1.2) into the repository.
3. **10C2, the picker on the Pro Timer:** the pill above Start and the slide-up list on a phone, chips on a wide screen, the chosen tag goes with Start, back to "No tag" after every session, the tag of a running session shows as a small line in the dial. It has a step for Hari to look at it on a real phone.
4. **10D, adding a tag:** a "Manage tags" row at the bottom of the list that has only Add, with the plain error messages.
5. **10E, renaming and removing a tag:** the rest of the Manage tags view.
6. **Later:** the Overview with time per tag, and the day score on the Overview (agreed: not on the Pro Timer).

**Version 1.3 (18 Oct 2026): the packets after 10D are renumbered** (10E, renaming and removing, is now the LAST of three):
- **10E, the database counts use (no screen):** `timer_tag_use()` in `supabase/timer_schema.sql` (the owner runs the SQL by hand in Supabase), `timer_verify.sql` gets new rows, the app learns `timerTagUse` and a plain sorting function, with tests; this packet puts this file (1.3) into the repository.
- **10F, the picker version 2 (a screen packet, with a look on phone and laptop):** four glass pills by use, `All tags`, the pen icon, the all-tags panel with the 10D box as its edit mode, the phone sheet by use order.
- **10F2, the look fixes after Hari's look at 10F (a small screen packet):** the three-dot button instead of the `All tags` pill with a pen, plain pills (only the panel is glass), a blurrier and darker panel. No database change.
- **10G, renaming and removing a tag behind the pen** (the old 10E). Version 1.6: no SQL change, because `timer_tag_rename` and `timer_tag_archive` exist since 10A, so there is no Part 2 in Supabase; the hook (`renameTag`, `archiveTag`), the rows of the edit view, the Escape rule, the css and the tests, as a whole-file screen packet with a look on phone and laptop.
