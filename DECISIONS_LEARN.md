# ASHBORN: Learn (the Guide screen), DECISIONS

**Status:** DRAFT 5 of 22 Nov 2026 (draft 4 plus Hari's talk of 22 Nov, H32 to H50, the plan and the addendum of that day, the previews P1 to P3 and the timer picker he approved, P3b: the learn label has two parts, the Overview line has three signals, the item card is version 2, the timer picker fits the screen; everything new is in section 19, and the rows of section 3 and the sections 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16 and 17 are changed where they disagreed). Nothing in it is locked. Earlier: DRAFT 4 of 13 Nov 2026 (draft 3, plus Hari's fourth short talk of the same day: the power button, the pop-up and the cursor are dropped, and the skills button plays the turn-off straight away: H31, section 18 points 1, 3, 4, 7, 9 and 10, F28; draft 3 was draft 2 plus the third talk about the power button and the cursor, the previews he looked at, and the planner's picks for the TV part: H27 to H30, F26 to F28). Nothing in it is locked. It becomes LOCKED when Hari has read section 3 (the questions with the planner's picks) and says okay or corrects what is wrong, the way `DECISIONS_TAGS.md` was locked.
**Written from:** Hari's voice talk of 13 Nov 2026 (three long messages), his second talk of the same day (the room, the TV and the Oculus), his third talk (the power button and the cursor), his fourth short talk (the power button dropped), the Learn planning pack (the zips `ashborn_CONTEXT_cp54_part19`, `ashborn_MATERIALS_cp54_part19`, `ashborn_tier1_handover`), the two Learn mocks (`ASHBORN_Learn__subject_hub.html`, `ASHBORN_Learn_level_map_crew_v2.html`), the finished Grind Guide reading (`fin.zip`, 20 parts), the Celestial Oculus zip (`celestial-oculus (3)`, files dated 10 Nov), and the repository as cloned on 13 Nov 2026. Section 17 says what was read in full and what was only skimmed. Draft 3 adds the third talk (H27 to H30) and the two preview pages built in the chat on 13 Nov. Draft 4 adds the fourth talk (H31).
**Draft 5 written from:** Hari's talk of 22 Nov 2026 (`01_OWNER_TALK_22Nov_cleaned.md`, H32 to H50), the plan and addendum of that day (`02_PLAN_labels_overview_items.md`, `05_ADDENDUM_decided_and_new_things.md`), the findings (`03_FINDINGS_verified_22Nov.md`), the previews in `previews/` (P1 Overview pills, P2 item card, P2c region to item, P2i Python regions, subject colours, P3b timer picker), and the repository `master` as cloned on 22 Nov (`b96f57f`, Packet T1). Section 17 says what was read.
**This file is a document only.** No code, no screens, no packets come from it until Hari has read it and corrected what is wrong.
**Rule for every later packet about Learn:** it must match this file. To change a rule, change THIS FILE first (tell the planner), then the packet.

**How to read the labels**
- **DECIDED:** Hari said it in the talk (his words are in section 6).
- **DEFAULT:** nobody decided it. The planner chose it so the file is complete. Hari has not read it yet. Tell the planner what is wrong and it changes.
- **PLACEHOLDER:** a number that is cheap to change later. The raw facts (sessions, start and done times) are kept, so a changed number can re-judge the past.
- **PARKED:** left for later. Not lost.
- **FOUND:** a fact found in the code or in the pack while planning, which changes or limits the plan (section 14).
- **WORKING (draft 5):** a choice taken on Hari's behalf on 22 Nov, because he said: take the answer he would most probably say yes to, decide, and come back (H49). He can overturn any of them. It counts like a DEFAULT, but it has been looked at once (in a preview or in the planning).

---

## 1. The idea in plain words

Learn is the part of the Guide screen where Hari works through the Tier 1 content: 7 subjects, 36 regions, 147 items. He **starts** an item, works on it with the **Pro Timer** under a **learn label** (two answers: what he is working on, and where he is learning it from; section 19), and **finishes** it by passing its check. When all items of a region are done, a **gate** (a problem that uses the whole region) stands before the next region. Each region has a **window** (an expected time) that only turns red if he is late. Nothing is ever taken away.

Learn time is real timer time. So it also counts in the Overview, and there it shows in its own colour.

Everything is saved in Supabase, so the phone and the laptop agree. That is the reason Ashborn exists: the old Grind Guide (one HTML file) did all of this but could not work on more than one device.

What this file is for: so that when we build, nothing has to be invented at that moment. Every rule, number, name and open point is written here first.

**The room (draft 2).** Learn is what a TV in a bright room shows. The skills sky (the Oculus) is what Hari sees when he turns the TV off and looks up. It is one world, not two parts. Section 18 holds what he said, the look he approved in a preview, and the planner's picks for the rest (draft 3). Draft 4: the power button, the pop-up and the cursor are dropped (H31); pressing the skills button plays the turn-off at once.

## 2. How we work from here

- **DECIDED (pack L-33, again in this talk):** the planner does not ask the design questions one by one. All open questions are given together with what the planner thinks is appropriate (section 3). Hari says okay or corrects.
- **DECIDED (same method as `DECISIONS_TAGS.md`):** small things are decided by the planner and Hari changes them after he has looked at them on a real screen.
- Each packet is written only after the one before it passed. Packets are executed exactly as written (`AGENTS.md`). Code is found through `CODE_MAP.md` and its `AB:` tags.
- The pack said "plan only, build nothing" (L-09) for the planning chats. This file treats that as history of those chats. Building Ashborn is now allowed, one packet at a time.
- Tier 2 starts only when Hari says (L-59).

---

## 3. Questions and the planner's picks (Hari: okay, or correct)

Every row is a DEFAULT unless the label says otherwise. "More" points to the section with the full rule.

| # | Question | The planner's pick | Label | More |
|---|---|---|---|---|
| Q1 | Where do learn labels live? | NOT in `timer_tags`. A session (saved and running) gets three more fields: `learn_what`, `learn_via` and `learn_review` (section 19g), instead of draft 4's one field `learn_ref`. Timer tags stay exactly as `DECISIONS_TAGS.md` says. Reusing `timer_tags` would hit the live limit of 10, the name rules, and the "four most used" pills, none of which fit learn labels. | DEFAULT (the fields: WORKING) | 11, 12, 19, F1 |
| Q2 | What exactly is a "learn label"? | Two answers (section 19a): **WHAT** (an item `item:PY-13`, a gate `gate:python/D`, or nothing yet) and a **source** (our own path: `own`, `coursera/ibm-python/m1/1.3`, `nptel/...`, `progit`, `other`). A course is no longer a third kind of tag; it is a source. Coursera-only time is a session with no WHAT. The minutes are counted once; the two answers only decide how they are read. Subject totals are added up from the WHAT. A "free study" label (L-17) is parked. | DECIDED (the two parts, H48) / WORKING (the rest) | 19a |
| Q3 | Which learn labels show in the timer? | Step 1, "Working on": only what is **started and not finished** (at most one item per subject, so at most 7 in Tier 1), plus a gate in progress, plus "No item (source only)", plus a "Review" step that lists finished items (19f, B2). Step 2, "Learning from": Own practice, Coursera, Other, with the course, module and lesson block under Coursera. The app offers the last source used for that item first (the only remembered choice, N5). There is no longer a "started course" pill: a course is a source. | WORKING (looked at in P3b) | 19e |
| Q4 | How does the picker look? | As P3b shows (section 19e). Phone: one pill "Working on"; once a learn item is picked it becomes a two-part pill, "Working on" and "Learning from", and each part opens a small sheet that fits the screen. Screens of 1000 x 800 and up: the inline chips. Everything in between (a phone on its side, a small laptop window) uses the pill and the sheets. Same rules as timer tags: pick first, then Start; no change while a session runs. | DECIDED (Hari looked at P3b: "this is good") / WORKING (details) | 19e, F20 |
| Q5 | One session, both a timer tag and a learn label? | No. A session has ONE label: no tag, a timer tag, or a learn label. The learn label has two parts, but it is still one label. The database refuses a timer tag together with learn fields. Otherwise the day screen and the tag use would count the same minutes twice. | DEFAULT (still holds) | 12 |
| Q6 | How does the dial show a running learn session? | The same small line under the day total as a timer tag: the item code and the source, in the subject colour (for example `PY-2 · Coursera IBM Python M1 1.3`). | WORKING | 11, 19e |
| Q7 | How is a subject coloured? | One fixed colour per subject, written in the data file, never picked by position (F4). **Families** (section 19c): related subjects share one hue and step from light to dark. Coursera is not a subject colour: it is a blue end cap with a letter (19b). | WORKING (the families page is titled "final"; Hari's yes is not recorded) / PLACEHOLDER (the exact hexes are judged by eye) | 11, 19b, 19c, F4 |
| Q8 | How do learn sessions show on the Overview day screen? | Three signals, so colour never carries it alone (section 19b): the **colour** is the subject (the WHAT); a **mark** says what kind (notch and code: item; double edge: gate; open ring, no code: source only; hollow notch: review); an **end cap** says the source (blue with a course letter: Coursera; grey: another source; none: own practice). A thin line under the pill keeps the quality in the day's colour. Pill length is the time, as today. The tag bar becomes two bars (by WHAT, by source). Sessions with timer tags look exactly as today. | WORKING (drawn in P1; Hari's verdict not recorded) | 11, 19b, F5, F18 |
| Q9 | Do learn minutes change the day's condition? | They count as normal session minutes (they ARE timer sessions), with no extra weight. The rule "a tag does NOT change the day score" (`DECISIONS_TAGS.md` section 1) stays. "The Overview changes with what you learned" is parked. | DEFAULT | 5, 15 |
| Q10 | How strict is the order? | Inside a subject: one region at a time; inside a region one item at a time, first item first; the next item opens when the one before is done; after the last item comes the gate; passing the gate opens the first item of the next region. Across subjects it is free (parallel learning, L-36), except where Q12 blocks. | DECIDED (rule) / DEFAULT (details) | 9 |
| Q11 | What is the gate? | The region's task from the pack (all 36 exist: title, "uses" list, task text, hidden answer), shown as a gate screen: the task, "Uses" chips (the concepts of this region), and "Needs next" chips (what the next region needs, also items of other subjects, as jump links). Passed by Hari's own tap, because the app cannot check an answer (L-13, L-22). | DEFAULT | 9 |
| Q12 | Do links to other subjects block, or only advise? | They block only where the pack says "needs first": NumPy needs Python A to F; pandas needs NumPy A to C; Git needs the terminal; probability needs loops, functions and `math.comb` from Python; linear algebra region C needs NumPy; Python region I needs the terminal. Every other link is a hint ("learn alongside"). The needs are written as structured data in the first packet (the pack has them only as sentences, F8). | DEFAULT | 9, F8 |
| Q13 | What does "Start" do? | It marks the item started (with the time), and if it is the first item of its region it also starts the region and its window. It shows the preview (the item's time range, the region window, the latest date) and makes the item appear under "Working on" in the Pro Timer. It does NOT start the timer. | DECIDED (Hari's flow) / DEFAULT (details) | 9, 10 |
| Q14 | What does "Done" need? | The item's check on screen, and Hari's tap "I can do this". If the item has less than **10 minutes** of its own first-pass time (gate: 15), the app shows a **soft warning once, then allows it** (the app cannot check honesty anyway, L-13; a hard rule would push him to move minutes or tap falsely). An item done with no timed minutes is recorded as "no time logged", not as 0, and keeps its seed range (19f, B11). | WORKING (draft 4 had a hard minimum; Hari can choose B: move minutes between items, or C: keep the hard minimum) / PLACEHOLDER (10 and 15) | 9, 19f |
| Q15 | What is the expected time of an item? | A seed range of **30 to 78 minutes** (the pack's arithmetic from the Python lab blocks; Tier 1 items carry no minutes, L-48). Shown only as a range, worded "about" and marked placeholder, never as data (19f, B12). Each finished item swaps its seed for the minutes really spent, so the range narrows. Only **first-pass** minutes count for this; time spent reviewing a finished item is its own number (19f, B2). Later the seeds of unfinished items can be scaled to Hari's own speed (dynamic, L-07). | PLACEHOLDER | 10, 19f, F9 |
| Q16 | How is a region window worked out? | (sum of the item ranges + a gate seed of 60 to 120 minutes) divided by Hari's weekly pace. The pace is a setting, default **5 hours a week**, presets 3, 5, 10, 20 (the list the pack used). The window starts when the region's first item is started and is counted in calendar days of his time zone. Example: a region of 5 items is 3.5 to 8.5 hours, about 5 to 12 days at 5 h/week. | PLACEHOLDER | 10 |
| Q17 | When is a region late, and what happens? | Not late until the high end of the window has passed. Then the region turns red. Nothing is locked, lost or taken away. When the gate is passed inside the window the region ends green; after the window it stays red as a record ("late by N days"). | DECIDED (red or green, no punishment) / DEFAULT (details) | 10 |
| Q18 | Does the gate have its own deadline? | No. Its seed time is inside the region window. (Hari: "maybe there is a deadline or not".) | DEFAULT | 10 |
| Q19 | What is the Coursera part? | A "Courses" card at the top of each subject that has a course: the course name, its hours (card hours where the page has them; the Python page has none, so its 15 to 30 hour headline stands in as a PLACEHOLDER), and a Start button. The course is chosen as a **source** in the timer, not as a tag of its own. Start begins the course window (hours divided by pace). The time of a course is every session whose source is that course, with or without an item. The card lists the items the course covers, and a covered item shows "Taught in: course, part". Git and the terminal have no course (F10). | DEFAULT (changed by Q2) | 10, F10 |
| Q20 | Who builds the item to Coursera mapping? | A content job (C2), now **earlier** than draft 4 had it, because the pre-filled source in the timer, the "Where to learn" line on the card and "Taught in" all need it: a table item, course, module, lesson block, made from the pack's coursera notes; where unsure it says "not mapped". For Python region A (the pilot) it is a reading of the lesson titles, not checked against the lesson content. The app only shows it. | DEFAULT / WORKING | 16, 19d, F10 |
| Q21 | Where is progress kept, and who enforces the order? | In Supabase, per person, written through database functions like the timer and read by the app. Never in localStorage. The content (items, checks, answers) stays in the repo as one data file (L-14). The database stores the facts (started, done, gate passed) and checks little; the ORDER and the NEEDS are enforced by the app, because the database does not know the content and the app cannot verify honesty anyway. | DEFAULT | 12, F15 |
| Q22 | Ids? | The pack's draft ids (PY-1 to PY-44, TM-, NP-, PD-, LA-, PB-, GT-) become the permanent ids when the data file ships and never change. Region ids get the subject in front (F3). A validation script (L-14) fails if a shipped id changes or goes away. | DEFAULT | 8, 12, F3 |
| Q23 | Which views are built first? | The hub and the Explained view of all seven subjects first (all content exists, and Start and Done need it). The level map (Tiles) second, as ONE generic component fed by the data (today only Python exists, hard-coded). One shared item sheet serves both views. | DEFAULT | 13, 16 |
| Q24 | What is the learning part called? | "Learn" (the word of the mocks and of Hari's "learn part") inside the Guide screen. The menu item stays "Guide". If the chooser has Food, Grind and a third option, the third reads "Learn", so there is no Guide inside the Guide. Hari decides the final word. | DEFAULT | 7 |
| Q25 | Can a mistake be undone? | "Done" can be undone (back to started; the time stays). Restarting an item from zero is parked. | DEFAULT | 9 |
| Q26 | How do addresses work? | Learn gets sub-addresses (`#guide/python`, `#guide/python/PY-14`) so the phone's back button and a pasted link work. This needs a change in `AB:MENU.NAV`, because today only the exact words overview, timer, calendar, guide are read and anything else falls back to the Overview (F2). | DEFAULT | 13, F2 |
| Q27 | What about Tiers 2 to 6? | Their tabs are shown but cannot be opened ("not started"), as in the hub mock. | DEFAULT | 13 |
| Q28 | Are Learn and the Oculus one thing or two? | One world, not two parts (H18 to H25): a lit room, a TV that shows Learn, and a sky above it that shows the skills. The TV turns off into the sky. The turn-off and turn-on look is DECIDED (H28); the power button with the cursor (H27) was dropped by Hari (H31), so the skills button plays the turn-off at once; the rest are the planner's picks (18c). | DECIDED (the idea, the look, and no power button) / DEFAULT (the rest) | 18 |
| Q29 | Which sources exist, and how do they grow? | A short fixed list in the data (N14): Own practice; Coursera (IBM Python with modules 1 to 5 and lesson blocks, Math for ML with courses 1 to 3); NPTEL (an empty slot until Tier 2 gives it content; the NPTEL **timer tag** stays as it is); Pro Git; Other (a video, a book, docs). Source ids are ours, never Coursera's numbers, never reused; a source that goes away is retired, not deleted. A new source is a data change, never a SQL change. | WORKING | 19a, 19f |
| Q30 | Can a saved session be relabelled? | Yes: the learn fields of a **saved** session can be set or changed later (from the tap line on the day screen and from the item sheet). The running session stays locked. Timer tags are untouched. It needs only one database function, so it goes into 12C. | WORKING | 12, 19f |
| Q31 | Can a finished item be worked on again? | Yes, under a "Review" step in the timer. The session carries a review flag, its pill gets a hollow notch, and its time shows on the item as its own number, not mixed into the first-pass minutes. | WORKING | 19f |
| Q32 | What does the item card look like, and where does it start? | The card of section 19d (version 2: what you will learn, needs first, where to learn, the check, what you should be able to do with icons, time). **Python region A** is the pilot: looked at on screen, corrected, then the other regions by subject. | WORKING (drawn in P2, P2c, P2i; verdicts not recorded) | 19d |

## 4. Check these first (the picks that change the feel the most)

1. **Q2, Q3:** every learn session has two answers, "Working on" and "Learning from"; the minutes are counted once.
2. **Q8, Q7:** the Overview line: colour is the subject, a mark is the kind, an end cap is the source; the quality stays as a thin line; two tag bars.
3. **Q14:** Done gives a soft warning under 10 minutes (gate: 15) and then allows it, instead of a hard minimum.
4. **Q32:** the item card version 2, and Python region A as the pilot.
5. **Q12:** a block across subjects only where the pack says "needs first"; everything else is a hint.
6. **Q15, Q16:** the placeholder times (30 to 78 minutes per item) and the 5 hours a week pace.
7. **Q21:** the order is enforced by the app, not by the database.
8. **Q24:** the name "Learn".
9. **The things only Hari can answer** (section 19h): what H37 and H38 meant, and the syllabus.

---

## 5. What does NOT change

- **DECIDED:** the Pro Timer works as today: Start, Pause, Resume, Hold to end, the stop alert, the 60 second rule (a session under 60 seconds is never saved), the midnight cut. The quality steps, the glowing ball and the colours follow counted minutes only. Learn does not touch the live timer.
- **DECIDED:** the timer tags and their rules stay as `DECISIONS_TAGS.md` (version 1.6) says: name rules, 10 live tags, four pills by use over 30 days, `All tags`, the pen, rename and archive. Learn labels are a different thing (Q1).
- **DECIDED:** a tag does NOT change the day score. Learn minutes count like any minutes (Q9).
- **DECIDED (22 Nov):** the timer tags and the NPTEL timer tag stay exactly as they are; no sub-tags for timer tags now (N12, parked). Nothing is migrated and old sessions keep their tag.
- The Overview's four conditions and the minute rule stay: unknown (no time), notEnough, okay from 120 minutes, good from 240. How learning could change the condition later is parked.
- The content is not rewritten in the app: items, checks, answers and region tasks are Tier 1 FINAL (L-57). A correction is made in the pack and the data file is made again. Ids never change (Q22).
- No skill tree and no skill unlock yet (L-16, L-22, L-57, L-58). Finishing items only fills the Learn progress for now.
- No live AI or API inside the app (L-05). The app cannot check an answer (L-13); "done" is Hari's honest tap (L-22).
- Tier 2 is not started (L-59).
- **DECIDED (H25, H26):** the Oculus (the room, the two videos, the ceiling opening, the star animation) is built and is not redesigned by this file. Its data and tests are planned much later (18d).
- **DECIDED (H28):** the look of the TV turn-off and turn-on stays as shown in the preview (18a, 18c point 8).
- **DECIDED (H31):** there is no power button, no pop-up and no cursor. The skills button plays the turn-off straight away (18c points 1 and 7).
- Food and Grind (from the old Grind Guide) are not in this file. The chooser page (Food, Grind, Guide) we drew is a separate piece.
- Overview "learning" content, the Calendar screen, floors, achievements and the heat calendar of the old app are not in this file (section 15).

---

## 6. What Hari said (cleaned, nothing added)

Said on 13 Nov 2026. Numbered so the questions can point to them.

**Tags**
- **H1.** The Pro Timer has its own tags (add, rename, delete, edit there). That stays.
- **H2.** Learn needs a DIFFERENT set of tags (py, numpy, pandas, maths, git, ... and one for Coursera) so he knows which learning work he is doing. Normal studying uses the normal timer tags.
- **H3.** Time is counted: how much on Coursera, how much on a specific Python item, how much on maths. The timer still counts the overall time.
- **H4.** When he starts an item, a new tag with a different light or style pops up in the Pro Timer. He picks it and works.
- **H5.** Learn work has its own colour, in the timer and in the Overview, where the blob on the day line shows how much time went where. Not a generic colour that follows the background. Coursera is bluish, the tag and the blob.

**The flow**
- **H6.** Menu, Guide, the button that shows what to learn, tiers 1 to 6 (tier 1 already selected), then a subject (Python, statistics, Git ...), then Coursera and the items. He clicks the first item and starts.
- **H7.** Starting shows that the region has started and "you have this much time to finish". It is a basic idea, not a punishment. For an average person about a week, for a fast way 2 or 3 days.
- **H8.** After starting he can leave it. Hours later he opens the Pro Timer, sees the new tag, works for about an hour, stops. Back on the item it says what he should be able to do (more than one line, up to about three parts, what is needed, "you should be able to ..."), and a task. Finishing the task means he has officially learned it. (He called this a threshold.)

**The rules**
- **H9.** A region always starts from its first item. No starting another part. It goes line by line. To study the fifth item (in the second region) he must finish the first four and then the gate.
- **H10.** Regions have different sizes, by how closely the items belong together (all the data types in one region).
- **H11.** A region has a deadline from the moment it starts. If he is late there is no punishment, but "the entire region will go red". It can be painted red or green.
- **H12.** After the last item of a region there is a gate: a problem that uses what the region taught (functions, loops ...). It may or may not have a deadline. He must pass it to reach the next region.
- **H13.** The gate shows what he must know, and it also pushes him to learn other things: Python needs some maths, maths needs some ML concepts, ML uses Python. It is all linked, "not randomly arranged; it should have some logic".
- **H14.** Coursera: before the regions there is a Coursera section for that subject or tier. It has a Start and a deadline and says which items it covers. An item should also say "taught in Coursera".

**Other**
- **H15.** For now only the Learn part. Food and Grind come later. The Overview will later change with grind and learn; that end is not built.
- **H16.** The old Grind Guide did all this but was not multi-device, which is why Ashborn is TypeScript with a database.
- **H17.** He does not have a clear name for the button that shows what to learn.

**The room, the TV and the Oculus (second talk, same day)**
- **H18.** There is no split. Learn and the Oculus (the skills sky) are linked as one thing, like a room with a TV in it: he works on the TV, and what the TV shows is the learning.
- **H19.** In the repo he opens the app and sees the Overview (not finished, set aside for now), then clicks the menu, then Guide. Guide has several other sections he has not planned yet; those wait. For now only Learn ("a lame name, the planner gives it a good one afterwards"). He clicks it.
- **H20.** Inside Learn he goes through everything: the region, the item, the gate.
- **H21.** When he finishes a skill (for example Python) he wants to see what tests that skill needs, so he can say "yes, I have the Python skill, I can build anything with Python". For that he looks out of the TV and at the stars (an analogy). There is a button for it ("skills or whatever button"); he does not know what it should be, the planner thinks about it.
- **H22.** Pressing it plays an animation no matter what is going on in Learn: the old-TV turn-off (the screen goes to static and the picture is smushed), ending on a fully black screen. From that black the Oculus starts, so the two feel connected.
- **H23.** The picture in his head: he turns off the TV and turns off the light, the screen goes black, and he looks up and sees the stars. The stars part and the lights-off part are done. The planner's part is the TV: how the learning is shown, and how the TV turns off.
- **H24.** The room is well lit, not dark. The first video starts on the black TV screen, the camera goes back, and it shows that the black was a TV on a wall with a switch. The switch is flipped, the room goes black again, and he looks up through the open ceiling (like a terrace, no ceiling) at the skills.
- **H25.** The Oculus is built to start from pure black. The turn-off has to look like an old TV (or some TV) switching off and end on exactly that pure black, in one continuous move, so the video plays from there.
- **H26.** The Oculus is not finished. The star animation, the hardest part, is done. The data and the planning are not: what skills there are, what tests, how many questions, and some data and problems that must change. That is planned and built much later, but it must be included here.

**The power button and the cursor (third talk, same day)**
- **H27.** Idea: when he clicks Prove (or whatever the skills button ends up being), a cursor should appear and go down to a pop-up at the bottom with a power on and off button, click power off, and then the turn-off animation plays. He asked how that sounds. **Dropped in the fourth talk, see H31.**
- **H28.** After the first preview of the turn-off and turn-on: "looks cool af, lets keep this". He then asked for the code of just that animation (given as `tv_turn_animation.html`).
- **H29.** He gave the Oculus zip and asked to join it to the preview. After trying the joined page: "its good and working". He also said to build the cursor and power button into the page and try it, instead of discussing it first. (Dropped later, see H31.)
- **H30.** He wants to start working on the repo now, and asked what the next step is and which files the planner needs.

**The power button dropped (fourth talk, same day)**
- **H31.** About the power button idea (H27): take it out entirely. No power button, no pop-up, no cursor. Just play the turn-off animation whenever he presses the skills button, whatever he has done in Learn ("throw the power-off idea in the gutter, I don't like that"). Then he asked the planner to continue the work. He also began with "I think so"; the planner reads that as a soft yes to the question about the newest commit (F28), which is not checked.

### 6b. What Hari said on 22 Nov (cleaned, nothing added; draft 5)

Same method as above. The numbers continue after H31. Where his words were unclear, the line says so and does not guess. This is the same text as `01_OWNER_TALK_22Nov_cleaned.md`.

**Context and focus**
- **H32.** There may be prerequisites, and some planning may already be done. Tier 1, Tier 2 and Tier 3 will each be built.
- **H33.** The Overview is a dashboard that shows how his day went. He does **not** want to focus on that now.
- **H34.** What he wants to focus on is one specific part of the dashboard: the part that shows, for the work he does in the timer, how much time he spent on this task and on that task.
- **H35.** It is a line with pill-shaped pieces. The pieces vary with the time (sometimes 4 hours, sometimes 6 hours).

**How learn work must look**
- **H36.** If he does something from Tier 1 (the plan based on his career), it must show differently. If he practises something in Python, or does something in Coursera, he must be able to tell them apart.
- **H37.** For Coursera, maybe the pill is blue, with some different animations. He also said there is something "for different Coursera" (unclear: the planner reads it as different Coursera courses; **not confirmed**).
- **H38.** He said: "in the task itself, it should show something Coursera. There should be some specific designations." (unclear: the planner reads it as: when a task or item is done through Coursera, the pill should say so; **not confirmed**).

**Tags become dynamic**
- **H39.** A tag is very simple today: he goes to the timer, selects a tag, does the work.
- **H40.** After Learn is introduced, the tag must become dynamic. Example: inside Coursera there may be several subsections of what he is doing, and the tags should be planned like that.

**Not satisfied with the items**
- **H41.** He asked for real planning, not laziness: think about everything that could be included and how to go forward.
- **H42.** He is not satisfied with what was given earlier about the individual thing he does (he thinks it is called an item): it is **not defined enough**, and it has only a **one-line definition**.
- **H43.** He wants it very well defined: "in this you will learn this", stretched out a bit but **not full paragraphs** (too much). At the end: "you should be able to do this, you should be able to do that", with icons and similar. How exactly is for the planner to work out.

**About the last replies**
- **H44.** The last replies were lazy ("I have read everything, GitHub master is healthy"). He knows master is healthy. The Oculus has not been passed because first everything must be planned with a clear picture. "We have to connect this. We might make several sections."
- **H45.** The first thing to think about: if he starts Python, what will he be doing, how will it be told apart, and when he sees the Overview, what will be different from a normal task.

**The hard question**
- **H46.** While doing Coursera there may be subsections. He might do the task (item), or Coursera, or both at the same time, because the item itself says "read this". Example: the item says learn the basics of Python (variables, functions) and he reads exactly that in Coursera. Is he then doing Coursera, the Python item, or both combined? The planner must think this through.

**What to do now**
- **H47.** He expects the limit to run out after reading everything. So: create a checkpoint, a zip with everything he said now, and then continue the work. (This is his "zip" word for this chat.)

**Later the same day (after the checkpoint was made)**
- **H48.** His answers to the questions: N1 (two-part label) "ok"; N3 (Coursera-only sessions) "yeah". N2 was taken as answered together with N1.
- **H49.** New instruction: say yes to whatever he would most probably say yes to; decide on your own and come back. Do **not** ask questions only about what he just pointed out (he pointed at Coursera, so the questions were all about Coursera). Think and reason about what else might come up. Questions are for things only he can answer.
- **H50.** He said the limit was over ("what now"). Under H47 that means: bring the checkpoint zip up to date so the next chat can continue. (This updated zip is that.)

---

## 7. The words

| Hari says | The pack and data say | Meaning in this file |
|---|---|---|
| the learn space, the learning hub | Learn (mocks) | the learning part inside the Guide screen (Q24) |
| tier 1 to 6 | tier (L-37; "phase" is dropped) | a chunk of learning handed over as one zip. Only Tier 1 is live |
| Python, Git, maths ... | subject (a "skill" in the pack's 42) | a whole area. Tier 1 has 7 subjects |
| region | region (L-30) | a group of related items that make sense as one idea |
| item, "the 14th item" | item (L-29, L-37) | one thing you can finish and check in one sitting |
| "what you should be able to do" | the item's `y` line | draft 5: the card's "by the end you should be able to" lines, split from `y` and the check (19d) |
| the task, the threshold | the item's check, `c` (L-28, L-39) | a small problem that can fail, with its answer `a` |
| the gate | the region task (L-38) | the apply-it problem at the end of a region, plus what the next region needs |
| Coursera | a resource (L-10, L-20, L-25) | a source (a "Learning from" answer) with its own window; one resource among others |
| timer tag | `timer_tags` row | the editable tags of the Pro Timer |
| learn label | `learn_what`, `learn_via`, `learn_review` on a session (new) | the label a learn session carries: two answers and a flag (Q1, Q2, 19a, 19g) |
| "Working on" | WHAT | the item or gate a session is for; the app's word (19a) |
| "Learning from" | the source (VIA) | own practice, a Coursera lesson, NPTEL, Pro Git or other; the app's word (19a) |
| deadline, "you have this much time" | window (pack arithmetic) | the expected time of a region or course, shown as a range |
| the TV, the screen | (new) | Learn as Hari sees it: the picture on a TV in a lit room (section 18) |
| the room, the wall, the switch | the Oculus up and down videos | the lit room, seen only inside the two videos |
| the skills, the stars, the ceiling, the sky | the Oculus; "skill" (the pack's 42) | the star map above the room: stars are skills, each with a test (placeholder data today, F24) |

---

## 8. What we already have (facts)

### 8a. The content (the pack, Tier 1 is FINAL, L-57)

| Subject | Items | Regions (sizes) | What it needs first (from the hub mock) |
|---|---|---|---|
| Python | 44 | 11: A5 B4 C3 D5 E4 F6 G3 H4 I4 J3 K3 | open from day one; region I needs the terminal |
| Terminal | 7 | 2: TA3 TB4 | open from day one |
| NumPy | 23 | 6: NP-A4 NP-B4 NP-C5 NP-D4 NP-E4 NP-F2 | Python A to F |
| pandas | 25 | 6: PD-F4 PD-G8 PD-H4 PD-I3 PD-J4 PD-K2 | NumPy A to C |
| Linear algebra | 13 | 3: A4 B4 C5 | A and B open; C needs NumPy |
| Probability | 15 | 4: A4 B4 C4 D3 | loops, functions and `math.comb` from Python; C and D use NumPy's random generator |
| Git | 20 | 4: A6 B4 C5 D5 | the terminal; Python only to run a one-line `main.py` in A and B |
| **Total** | **147** | **36** | 36 region tasks, one check after every item |

- Region size runs from 2 to 8 items, average 4.1 (18 regions have 4). The largest is pandas PD-G with 8 items.
- **Item** fields in the data: `id`, `t` (title), `y` (what you can do), `c` (the check), `a` (the answer), `o` (Windows and other notes, L-52, L-53).
- **Region** fields: `id`, `n` (name), `idea`, `needs`, `items`, and `task` with `t` (title), `u` (what it uses), `k` (the task text), `a` (the answer).
- Every check is the Guide's own problem (L-39) with its answer computed by script (L-48, L-56): the maths checks by 130 assertions, the Git checks run for real in a scratch folder, NumPy and pandas 60 checks and 144 claimed strings, all run. No minutes are given and region tasks are not timed (L-48).
- Pandas items use one shipped file, `tier1_data/players.csv`, with two planted gaps (L-55). It has to be offered for download in the item sheet (F7).
- Tier 1 unlocks no skill (L-57, L-58). Tests per skill come after all tiers (L-58).
- For later: the old Grind Guide reading (`fin.zip`, 20 parts P01 to P20, all marked done) covers Food (P08), the Grind score and sessions (P09, P20), the exercise path (P15 to P17), floors and achievements (P12, P13), the hub (P07, P18), the timer (P04), the heat calendar (P19), login and cloud sync (P02, P03). It is the "what and why" of the old app, never code to copy.

### 8b. The two mocks (throwaway previews, not the app)

- **Subject hub** (`ASHBORN_Learn__subject_hub.html`): Tier tabs (only Tier 1 live); the seven subjects as big rows with bars sized by region, a colour flood on hover and a moving word; a click opens the subject with a circle reveal and two views: **Explained** (items with "you should be able to", "needs first", the check, the answer hidden until opened, the Windows notes, and the region tasks) and **Tiles** (the level map in a frame). All 147 items are embedded in the file as one data block. Progress is sample only, nothing is saved.
- **Python level map** (`ASHBORN_Learn_level_map_crew_v2.html`): a trail of level nodes (one per item) with a boss node per region task, a progress bar, a detail sheet, little crew characters, and more than one look. Python only, hard-coded, sample progress, nothing saved.

### 8c. The repository (13 Nov 2026; the state of 22 Nov is in F29)

- **The Guide screen** exists in the menu and at `#guide`, but `CODE_MAP.md` says "Guide (not built yet)". `SignedInStub.tsx` shows only the word Guide over the Dark Veil background.
- **Screens** (`src/lib/screens.ts`, `AB:MENU.NAV`): `overview`, `timer`, `calendar`, `guide`. The page address is matched to a whole word; anything else becomes the Overview (F2).
- **Timer and tags** (`DECISIONS_TAGS.md`, `supabase/timer_schema.sql`): sessions (`timer_sessions`) hold start, end, counted seconds, day, the pause log, the time zone and `tag_id`. `timer_tags` holds name and `archived_at` only: no colour, no kind. `timer_start(p_tz, p_tag_id)`; `timer_row_json` sends the tag of the running session so another device can show it. The picker shows four most-used tags (30 days), `No tag`, `All tags` (three dots) with the pen. Tags cannot change while a session runs.
- **Overview** (`AB:OVERVIEW.*`, Packets 11A to 11D, then the day screen ideas 1 to 7): four conditions with four looks: unknown is Atmosphere (blue), notEnough is Rose (red), okay is Corona (orange), good is Lagoon (green or teal). The day screen draws the sessions as pills on a timeline, a tag bar with the minutes per tag, a legend, and a note under the sentence. Its colours follow the condition (Packet 11D): unknown `#38bdf8` and `#a5d8ff`, notEnough `#f43f5e` and `#fda4af`, okay `#f59e0b`, good `#5eead4`.
- **Method:** the planner writes packets, an agent executes them exactly. Code is tagged `AB:<PAGE>.<PART>:START` and `:END`, listed in `CODE_MAP.md`; links between places are in `CONNECTIONS.md`; `node scripts/check-tags.mjs` must print TAGS OK and CONNECTIONS OK. Database changes are SQL files that Hari runs by hand in Supabase, each with a verify file (as in 10A, 10C1 and 10E). The last numbered packet is 11D; the day screen work since then is on the branch `week-view`.

---

## 9. How learning works: order, start, done, gate

### 9a. States

| Thing | States |
|---|---|
| Item | **locked** (an earlier item in its subject is not done, or a hard need is open), **open** (the next in order, not started), **started**, **done** |
| Region | **locked**, **open**, **running** (first item started, window running), **at the gate** (all items done), **passed on time** (green), **passed late** (red, kept as a record) |
| Gate | **locked** (items not done), **open**, **in progress** (a session has run on it), **passed** |
| Course | **not started**, **running** (window running), **done** |
| Subject | progress = done items of its total; the next open item is the one to continue with |

### 9b. The rules

1. **DECIDED (H9):** a region starts from its first item. Items go one by one; the next opens only when the one before is done. After the last item the gate; after the gate the first item of the next region.
2. **DECIDED:** only one region at a time per subject, one item at a time per region. So a subject has at most ONE started item at any time (this is why the timer's "Working on" list stays short, Q3).
3. **DEFAULT:** different subjects run in parallel and are not locked against each other (the pack: learning is parallel, L-36), except the hard needs of Q12.
4. **DEFAULT:** a hard need is shown with the reason ("Needs Python A to F first") and a link that jumps to the thing needed.
5. **DEFAULT (Start):** see Q13. Starting an item that is already started does nothing. Starting is idempotent, so two devices cannot make two starts.
6. **DEFAULT (Done):** see Q14. "Done" can be undone (Q25). Finishing the last item of a region opens its gate; finishing the gate opens the next region.
7. **DEFAULT (answers):** the answer of a check and of a region task stays hidden until Hari opens it. Whether he opened it is not saved (parked).
8. **DEFAULT (what is shown on an item):** title, the `y` line ("you should be able to"), "needs first" if any, the check, the answer (hidden), the Windows note if any, the time range and the time spent, the "Taught in" line when a course covers it, and Start or Done. Draft 5: the card is the version 2 of section 19d (a few lines of "you will learn", "needs first", "where to learn", the check, "by the end you should be able to" with icons), not a one-line card; the new lines are a content job, written outside the app and marked DRAFT until Hari reads them (F6).
9. **DEFAULT (what is shown on a gate):** the region task; "Uses" chips; "Needs next" chips with jump links to other subjects (H13); the time spent on the gate; Pass.

### 9c. The whole flow, step by step (Hari's morning, with these picks)

1. Hari opens the app, the menu, Guide. He picks Learn. He sees the tier tabs; Tier 1 is selected, Tiers 2 to 6 are shown but closed.
2. He sees the seven subjects, hovers one (it floods with its colour), and opens Python.
3. At the top he sees the Courses card (IBM Python) and then the regions; only region A and its first item are open, everything after it is locked.
4. He taps PY-1 and presses **Start**. PY-1 and region A are now started. The sheet says: "About 30 to 78 minutes for this item. Region A: about 5 to 12 days, latest by 25 Nov." No timer is running.
5. He closes the laptop. Nothing happens. No reminder, no punishment.
6. Hours later he opens the Pro Timer. He taps "Working on" and picks PY-1 (a small sheet with the Learn cards in Python's colour). The pill becomes two parts; "Learning from" offers the source (Own practice, or the Coursera lesson the item is mapped to, pre-filled). He presses Start.
7. The dial shows the line "PY-1" and the source in the Python colour under the day total. He works an hour. He holds to end the session. The timer goes back to "No tag" as always.
8. He goes back to Learn, opens PY-1. It shows the time spent (60 minutes), what he should be able to do, and the check. He solves the check, opens the answer, compares.
9. He taps **I can do this**. The item is done, PY-2 opens. After PY-5 the gate of region A opens.
10. He solves the gate (its own tag, GATE python/A, at least 15 minutes) and passes. If he is inside the region window region A turns green; if not, red. Region B opens.
11. In the Overview, "Today in Pro Timer" and the whole day screen show that hour as a pill in Python's colour with a marker, and the tag bar and legend list PY-1.
12. On the stop screen there is one quiet link, "Open PY-1", back to the item. On another device (phone) all of this is the same, because it is read from the database.

---

## 10. Time: expected time, windows, deadlines, time panels

### 10a. What is counted

- **DECIDED (H3):** time is counted per item, per subject and for Coursera, and the Pro Timer still counts the overall time.
- **DEFAULT:** the time of an item is the sum of `active_seconds` of the saved, first-pass sessions whose `learn_what` is that item (whatever the source; review sessions are counted as a separate number) (the same counted time the day score uses; paused time is never counted; the 60 second rule applies). The time of a region is its items plus its gate. The time of a subject is all its regions. The time of a course (a source) is the sessions whose `learn_via` starts with that course's path, with or without an item. A session cut at midnight keeps its label on both days.

### 10b. Expected time of an item (Q15)

- **PLACEHOLDER:** a seed range of 30 to 78 minutes per item, the same for every subject. Source: the pack's arithmetic on the Python course (`WINDOW_ARITHMETIC_CP12.md`: 104 numbered lines, 23 lab blocks, 15 to 30 hours headline, per item about 30 to 78 minutes, which also matches the 35 to 70 minutes per lab noted in the pack). This is the Python course's arithmetic, not a measurement, and it is used for every subject until real minutes exist.
- **DEFAULT (the pack's "range that narrows"):** every unfinished item carries the seed range. A finished item swaps its seed for the minutes Hari really spent. So the region's range gets narrower with each finished item. After a few finished items the seeds of the unfinished ones can be scaled by how Hari's real minutes compare (dynamic, L-07); this is not worked out yet.
- **DEFAULT:** the gate seed is 60 to 120 minutes (a region task is bigger than one item). It is not in the pack; the planner chose it.

### 10c. Region window and deadline (Q16, Q17, Q18)

- **Window** = (sum of the seed or real ranges of its items + the gate) / weekly pace, shown as a range of days.
- **Pace** = a setting of Hari's, saved in the database, default 5 hours a week, presets 3, 5, 10, 20 (the pack's list, P-04). The pack has no record of his real pace.
- **Worked example (PLACEHOLDER numbers):** region Python A has 5 items: 5 x (30 to 78) = 150 to 390 minutes, plus the gate 60 to 120, makes 210 to 510 minutes, which is 3.5 to 8.5 hours. At 5 hours a week that is about 5 to 12 days. At 10 hours a week about 2.5 to 6 days. At 20 hours a week about 1 to 3 days. (Hari: about a week for an average person, 2 or 3 days for a fast way.)
- **The largest region** (pandas PD-G, 8 items) is 5 to 12.4 hours, about 7 to 17 days at 5 hours a week. This is why windows must be a range, and why 8-item regions may later be split (parked).
- **DEFAULT:** the window starts when the region's first item is started (H11). Days are calendar days in Hari's time zone (the saved `day` of a session works the same way). No pausing of windows (a "holiday" switch is parked).
- **DEFAULT:** the **latest date** shown is start plus the high end of the window. The region is **late** only after that date.
- **DECIDED (H11):** being late has no punishment. The region turns red. Nothing is locked or lost.
- **DEFAULT:** passing the gate inside the window turns the region green; after it, the region stays red as a record with the number of days late. Red is a record, not a state to escape from.
- **DEFAULT:** no notifications and no reminders (parked). The colours are the only signal.

### 10d. Coursera windows (Q19)

- **DEFAULT:** a course has its own window: its hours divided by pace, started by its own Start button, and it runs separately from the region windows (pack L-20). Card hours are used for time and course outcomes for what it teaches; headlines are not trusted (the pack's own working rule from its `OVERVIEW.md`).
- The Tier 1 courses (pack L-10): Python for Data Science, AI and Development (IBM; headline 15 to 30 hours; no card hours; the page lists module 4 on Python and NumPy), and the Mathematics for Machine Learning and Data Science specialization (DeepLearning.AI; headline 60 hours, cards 94 hours; the source of the first linear algebra and probability item pass). The two IBM certificates (AI Engineering, RAG and Agentic AI) belong to later tiers.
- **Time and the Coursera source:** the sessions whose source is Coursera count the time Hari watches a course, as H3 asks ("how much time I have spent on Coursera").

### 10e. Where the time is shown (DEFAULT)

| Where | What |
|---|---|
| Item sheet | time spent against the range ("42 min of about 30 to 78"; "No time logged" when done without a timer; review time as its own number) |
| Region header | time spent, window in days, the latest date, red or green |
| Subject header | total hours, hours per region |
| Course card | time spent, window, latest date |
| Hub row | optional small total (decided at the look) |
| Pro Timer | the learn pills; the dial line while running |
| Overview day screen | the pills, the two tag bars and the legend (section 19b) |

---

## 11. Learn labels, colours, and how learning shows

### 11a. The learn label (Q1 to Q6)

- **WORKING:** a learn label is not a row in `timer_tags`. It is two answers a session carries, `learn_what` and `learn_via` (plus the flag `learn_review`), made from content ids: `item:PY-14`, `gate:python/A`, and sources such as `own` or `coursera/ibm-python/m1/1.3` (section 19a, 19g).
- **DEFAULT:** an item or gate is **available** in the timer only while it is started and not finished (a finished item is reached through "Review"). It has no name rules, no limit of 10, and is never edited in the tag editor. It cannot be renamed or removed by Hari; it follows the content.
- **WORKING:** the pill shows the item code; the title is a second line in the sheet cards. The colour is the subject's (19c).
- **DEFAULT:** one session has one label (Q5). While a session runs the label cannot change (same rule as timer tags); a saved session can be relabelled (Q30).
- **DEFAULT:** the label of the running session is sent by the database like the tag (rule 12 of `DECISIONS_TAGS.md`), so a phone shows a laptop's running learn session (F16).
- **DEFAULT:** a learn session is a normal session for everything else: pause log, 60 second rule, midnight cut, quality steps, day minutes.

### 11b. Subject colours (Q7)

One fixed colour per subject, in the data file (F4). Draft 4's placeholder table (one colour per subject: magenta, cyan, lime and so on) is **replaced** by the families of section 19c. The reason was F5: several of those colours sat near the four day colours. The families keep a hue the day screen does not use. All of them are PLACEHOLDERS to be judged by eye, in all four looks of the day screen, and colour is never the only signal (11c).

### 11c. How learning shows on the Overview day screen (Q8)

- **WORKING (draft 5, section 19b):** the pill of a learn session takes the subject colour instead of the condition colour, plus a mark (notch and code, double edge, open ring, hollow notch) and an end cap for the source, so it can be told apart with colour alone removed. The quality stays as a thin line under the pill in the condition's colour.
- **WORKING:** the tag bar becomes **two** bars for learn time that add up to the same minutes: one by WHAT, one by source. Timer tags keep their own bar and the condition colours (Packet 11D). The legend lists the learn labels in their colours, with the cap shown once. The weekday word and the beam stay in the condition colour.
- **WORKING:** Coursera is "bluish" (H5, H37): it is a blue end cap with the course letter and a light that travels along the pill once after the reveal (none under reduced motion or lite level 2). The blue is `#2563eb` in the previews, kept apart from the unknown day's blue by the cap shape and the letter.
- **Checked in the code on 13 Nov:** today the pills are coloured by session quality (`qualityColors`: meh, solid, deep, flow, taken from the condition palette), not by tag. `tagBarOf` groups sessions by the tag NAME, and each segment is only `{label, seconds, minutes}`: no id and no colour. So learn colouring adds new fields to the day model (a learn marker and colour on a session, a colour on a tag-bar segment) and changes `buildDayView`, `tagBarOf`, `OverviewDayView.tsx` and `src/dayview.css`. The day screen reads sessions straight from the tables (Packet 11B checkpoint 1), so it must also read the learn fields (F18, F30).
- **PARKED:** per-tag colours for timer tags (question 9 of `DECISIONS_TAGS.md` stays parked); the week view of learn colours is decided when the day view is done.

### 11d. Learn in the Overview condition (Q9)

- **DEFAULT:** nothing changes. The condition is made of minutes. Learn minutes are minutes.
- **PARKED (H15):** "the Overview will change according to the grind and the learned stuff". It needs the Grind and the learn data first, and a new decision in `DECISIONS_DAY_SCORE.md`. Not built, not designed here.

---

## 12. What is saved and where

### 12a. In the repo (content, never changes at run time)

- `src/data/learn/tier1.json` (or a typed `.ts`): subjects, regions, items, region tasks, structured needs, subject colours, region keys, course list, and later the item to course mapping. Made from the hub mock's data block, then checked against the pack's ledgers (`research/depth/data/*`) so it is not trusted blindly (F12).
- `src/lib/learnRules.ts`: plain functions with tests: item and region status, next item, needs met, window (low, high), lateness, time per subject. No screen code in them (the same way as the day score maths).
- `src/lib/learnApi.ts`: the calls to the database (like `timerApi.ts`).
- A validation script (L-14): ids unique, every item has a check and an answer, every region has a task, the order is complete, every need resolves to a real item or region, every shipped id still exists. It runs before anything ships.
- `public/tier1_data/players.csv`: the pandas file (F7).

### 12b. In the database (per person; read only through the person's own rows)

DEFAULT sketch, to be written as a packet with a verify SQL like 10A and 10E:

| What | Where | Notes |
|---|---|---|
| started and done time of an item | table `learn_item_state` (person, item id, `started_at`, `done_at`) | one row per item; "undo done" clears `done_at` |
| started time and gate pass of a region | table `learn_region_state` (person, subject, region, `started_at`, `gate_passed_at`) | the key is subject plus region (F3) |
| started and done time of a course | table `learn_course_state` (person, course id, `started_at`, `done_at`) | |
| Hari's pace | table `learn_settings` (person, `pace_hours_per_week`) | default 5 |
| the label of a session | `timer_sessions.learn_what`, `learn_via` and `learn_review`, and the same three on the running session | text, text, true or false; NULL or empty when there is no learn label; a check forbids `tag_id` together with learn fields (Q5); the source is stored as a text path checked only for its shape, so a new source is never a SQL change (Q29) |
| the label of the running session | `timer_row_json` gets keys for the two parts and the flag | like rule 12 of the tag decisions (F16) |
| time per label | a read-only function (like `timer_tag_use`) that answers the seconds per `learn_what` and per `learn_via`, first-pass and review apart | the app adds up the subjects and regions |
| relabel a saved session | one function that sets or changes the learn fields (and the flag) of a saved session (Q30) | the running session stays locked |

- **DEFAULT:** writes only through database functions, signed-in people only, one person reads only their own rows (the timer's pattern).
- **WORKING:** `timer_start` gets the learn arguments (what, source, review) instead of one ref, and the old signature is dropped, as 10A did (F17). The database checks that the parts have the right shape and that the item or gate is started for this person (a source is checked only for its shape). It does NOT know the content order; the app does (Q21, F15).
- **DEFAULT:** dates in the database are facts (started, done, passed). Deadlines, windows, red and green are worked out when asked, from the facts, the content and the pace. So a change of pace or of the placeholder minutes re-judges the past and loses nothing.
- **DEFAULT:** two devices starting the same item make one start (no error; the first time stands).
- **DEFAULT:** errors get plain words in the app (like `problemText` for tags): for example "That item is not open yet", "Learn could not save this. Try again."
- **DECIDED (H16):** progress is never kept only in the browser.

---

## 13. Screens and states Learn needs

Screens and pieces (shapes follow the two mocks; the mocks are looks to copy from, not code):

1. **Chooser** (Food, Grind, Learn) if Hari wants it as the entrance (Q24). Separate piece.
2. **Learn hub:** tier tabs (Tier 1 live, 2 to 6 closed), seven subject rows (colour flood on hover, bar by region size, progress), pace setting.
3. **Subject view:** the Courses card, the regions with their state and window, two views: Explained and Levels (Q23).
4. **Item sheet** (shared by both views): section 9b rule 8.
5. **Gate sheet:** section 9b rule 9.
6. **Course card and Course sheet:** section 10d.
7. **Pro Timer picker** as in P3b (the two-part pill, the two sheets, the Review step), plus the dial line and the stop screen link "Open PY-1" (section 19e).
8. **Day screen changes** as in P1: subject colour, mark, end cap, the thin quality line, two tag bars, legend, the mix note (section 19b).
9. **Level map** (generic, from the data).
10. **The TV and the way to the Oculus** (section 18): designed in previews (the turn-off and turn-on look, the trip into the Oculus and back; the power button with the cursor was dropped, H31); not built in the repo.

States to design on purpose (so we do not meet them first in a packet):

- locked item (with the reason and the jump link), open, started, done, undone;
- region running, nearing its end, late (red), passed on time (green), passed late (red record);
- a subject with a hard need still open (for example NumPy before Python A to F);
- empty and first-time views (nothing started, no sessions, no pace saved);
- the database cannot be reached, a call fails, the same item started on two devices, a running learn session seen on another device;
- a course with no mapped items ("not mapped"), a subject with no course (Git, terminal);
- the checks with Windows notes (`o`), the pandas download, an answer that is hidden;
- small screens: the level map on a phone, the item sheet as a sheet from the bottom, 44 pixel tap targets (as in the rest of the app).

---

## 14. Found while planning (FOUND)

- **F1.** `timer_tags` cannot hold learn labels: live limit of 10, names of 1 to 20 characters that must be unique, rename and archive rules, and a picker that shows only the four most used. It also has no colour and no kind column. So learn labels need a place of their own (Q1).
- **F2.** `screens.ts` matches the page address to a whole word. `#guide/python` would not match and would open the Overview. Sub-addresses need a change in `AB:MENU.NAV` (and `CONNECTIONS.md` C24, which lists who depends on it).
- **F3.** Region ids repeat across subjects: A, B, C are used by Python, linear algebra, probability and Git; D by Python, probability and Git. (The terminal, NumPy and pandas already have prefixes: TA, NP-A, PD-F.) A region needs a key of subject plus region.
- **F4.** The hub mock chooses subject colours by position modulo 5, so Probability has Python's magenta and Git has the terminal's cyan. Colours must be fixed per subject in the data.
- **F5.** Several learn colours sit near the four day colours (magenta near rose, cyan near sky and teal, orange and yellow near amber, green near teal; Coursera blue near the unknown day's blue). A marker is needed so colour is not the only signal.
- **F6.** Hari describes a few lines of "you should be able to" per item (up to about three parts, and on 22 Nov, H42 and H43, an item that is much better defined). The data has one `y` line and one check `c` per item. In draft 5 the card of section 19d splits these lines from `y` and the check, so they add no new claims; the "you will learn" lines are new writing, marked DRAFT.
- **F7.** The pandas items use `players.csv` (two planted gaps). The item sheet must offer it as a download (an asset in `public/`).
- **F8.** The "needs" are sentences: a subject level text and a per-region text. The hub mock reads them with a pattern match for its jump chips. Locking items by needs requires structured data written by hand and checked by the validation script.
- **F9.** Tier 1 items have no minutes (L-48). All times are the seed range until real minutes exist.
- **F10.** The pack does not map items to course lessons. The item pass (part 2) does not mention Coursera, and the first part only twice. The pack does hold the Python lab blocks (`coursera/python_lesson_blocks.md`) and the Maths course notes the linear algebra and probability pass was drawn from, so a mapping can be made, but it is a content job. None of the four Coursera pages names Git or Linux or the shell, so Git and the terminal have no course (`coursera/OVERVIEW.md` section 3).
- **F11.** Hari pictured regions of 1 to 4 items. The real range is 2 to 8, with 18 of 36 at 4 items. An 8-item region has a window of about 7 to 17 days at 5 hours a week.
- **F12.** The hub mock embeds all 147 items in the HTML file (about 135 KB). The data file is made from there, then compared with the pack's own ledgers. Counts must still read 147 items, 36 regions, 36 region tasks.
- **F13.** Hari spoke of three colours in the Overview (first "blue, green and maybe orange", then "red, green and blue"). There are four conditions with four colours: blue (unknown), red (notEnough), orange (okay), green (good).
- **F14.** The old Guide hub (the `guide_v12_floors` file) had exercise, food, productivity, body, floors, achievements and a heat calendar. The Learn curriculum is NEW and is not in that file. The floors idea (a ladder of daily targets) and the hidden achievements are parked (section 15).
- **F15.** The database does not know the content order unless the content is copied into it. The picked answer is that the app enforces the order and the needs, and the database stores facts (Q21). The cost of changing this later is a content table and stricter functions.
- **F16.** `timer_row_json` carries only the timer `tag`. A learn label needs the same treatment, or a phone cannot show a learn session started on the laptop (rule 12 of `DECISIONS_TAGS.md`).
- **F17.** `timer_start` has the signature `(p_tz text, p_tag_id uuid default null)`. Adding the learn fields (`learn_what`, `learn_via`, `learn_review`, section 19g) changes the function, the old version has to be dropped (10A did the same), and the `revoke` and `grant` lines in `timer_schema.sql` name the old signature `(text, uuid)` and must change with it. The SQL packet must say this and the verify file gets new rows.
- **F18.** The day screen reads sessions and tags straight from the tables (`timerApi.ts`, Packet 11B). It has to read the learn fields too, or learn pills cannot be coloured. Its model identifies a tag by NAME (`DaySession.tag` is a string or null), so a learn session needs a name built from its WHAT (for example the item code PY-14) and a kind, so it is never mixed up with a timer tag of the same name.
- **F19.** The pack's rules about how the Guide is built still apply: tasks and content are written outside the app in chat and reviewed (L-12), the app cannot verify a task (L-13), everything is hard-coded in one data file with permanent ids (L-14), start small (L-15).
- **F20.** The picker and the timer hold ONE chosen tag id. `TagPicker` takes `tags`, `tagId: string | null` and `onChoose`, and `TimerScreen` feeds it from the timer hook (`timer.tags`, `timer.tagId`, `timer.chooseTag`). A learn pill needs a choice that is either a timer tag or a learn label (Q5). So the choice becomes one value with a kind, and choosing one clears the other. In draft 5 the learn choice is the two-part pill and the two sheets of 19e rather than a row; it is still new props and new parts in `TagPicker.tsx`, not a change to the timer-tag logic.
- **F21.** The picker's timer-tag row is built for `TOP_COUNT = 4` pills plus `No tag` and the three-dot button, with its glass settings kept in one `GLASS` object (only the `All tags` panel is glass; the pills are plain). The learn pill and sheets of 19e must not change those counts.
- **F22.** The two Oculus videos start and end on black. Measured on the zip (both 1920 by 1080, 30 frames a second, with sound): the **up** video (3.7 s) has 7 pure-black frames at its start (pixel values 0 to 1 of 255), then shows a black TV screen close up, pulls back to a cream wall with a framed picture, a flat TV with a black screen and a light switch, the switch is flipped, and it ends with 12 black frames. The **down** video (3.5 s) starts with 12 black frames, shows the wall, pushes in until the black TV screen fills the picture, and ends black. This is why the turn-off must end on pure black (H25).
- **F23.** On its own the Oculus rests on a pitch-black wall and waits for a click or the up arrow. Its stages run: resting wall, up video, ceiling look-up (3.2 s), sky, look-down (3.0 s), down video, resting wall. How ASHBORN enters and leaves that chain is not decided (18c).
- **F24.** The sky's data is placeholder. It has 5 groups and 42 skill stars (12, 8, 5, 14 and 3), each with a made-up status (won, ready, progress, locked), a done and total count of 3 to 5, and a one-line test. None of the names is a Tier 1 subject (no Python, NumPy, pandas, Git or terminal), while Python alone has 44 items in Learn. So the sky is not yet the pack's 42 skills, and nothing in it comes from Learn.
- **F25.** Problems seen in the Oculus zip, checked on 13 Nov (these may or may not be the ones Hari means in H26): one click plays the chime twice (`RoomView.handleSceneClick` and `App.handleTriggerLookUp` both play it); the sound button only controls the made-up ambient drone, while both videos carry their own sound (a short loud sound, peak near full volume) that it does not touch; a "Star Map Controls" panel (sliders, Locked and Won demo buttons) is part of the sky screen; the skill card's Start and Open buttons do nothing yet; the old Three.js room (`CelestialRoom.tsx`) and `Galaxy.tsx` are not used by anything, and so the packages `three`, `motion` and `@google/genai` are not used by the live screen either; `setFocalOffset` exists but is never called; an old standalone star-map page (80 KB) sits in `public/`. The first look at the zip also listed an `esbuild` pin that clashes with Vite 8 on `npm install` and an out-of-date implementation plan; those two were not re-checked.
- **F26.** How a real CRT TV switches off and on (web research, 13 Nov). **Off:** the picture shrinks to a thin horizontal line first, which is much brighter than the picture, then to a small white dot that fades. How long the dot stays differs per set: old sets could leave it for seconds and even burn a spot into the screen, later sets blank the tube on purpose, and some sets skip the dot. **On:** a real set does not grow from a line. The sound comes first and the picture fades in over seconds while the tube warms up (about 2 to 20 seconds, depending on the set). The line-to-full-screen turn-on seen in web demos is a style, not physics. Sources: vintage TV forums (videokarma), the repair FAQ at repairfaq.org, and CRT animation examples on CodePen and in component docs. Web demos use about 0.5 s for the turn-off and up to 4 s for the turn-on. The preview uses the real order for the turn-off (static, line, dot, black) and a style turn-on.
- **F27.** Facts from joining the Oculus to the preview (13 Nov; Hari tried it: "good and working"). `RoomView` and `StarMap` use a full-window box (`fixed inset-0 w-screen h-screen`) and `window.innerWidth` and `innerHeight`, so the Oculus cannot sit in a smaller box without changes: it must be a full-screen layer. To start at the up video from a TV that has gone black, `App` needs two small things: a start at `playing_up_video`, and a callback for when the down video ends (the video effect already starts the video on mount). The two videos are 1.7 MB and 1.9 MB. Inside one page they make it 5.2 MB; in the repo they would be asset files. `npm install` fails on the version pin of `esbuild` in the Oculus `package.json` (this confirms the open point in F25) and passes with `--legacy-peer-deps`. Not checked: the chime on entry (the preview does not play it) and the sound.
- **F28.** The repo on GitHub (cloned 13 Nov): the top commit is `13e394a` ("Fix clipped minutes figure in the day screen tag labels"); `packets/` ends at `PACKET_11D_DAY_VIEW_PALETTE.md`; `PROGRESS.md` ends with the day screen improvements (idea 7). Whether Hari's laptop has newer work that is not pushed is not known: Hari said "I think so" at the start of his fourth talk, which the planner reads as a soft yes. It is not checked, so packet T1 starts with a check of the git state (its step 0). Note: section 8c says the day screen work since packet 11D is on the branch `week-view`; the packet must say which branch holds `13e394a`.
- **F29. (22 Nov)** The repo `master` is at `b96f57f` (13 Nov), Packet T1 (the TV transition), which supersedes the state in F28. `PROGRESS.md` says T1 has **not been looked at in a browser** yet: Hari looks at the turn-off and turn-on on the laptop and the phone. Checked on 22 Nov (the findings file): the tag check (TAGS OK, 51 tags, 103 places) and the connection check (CONNECTIONS OK) passed, the type check passed, and 2,028 tests in 35 files passed. **Not run:** the Vite build, the lint, any browser look, any SQL in Supabase. The zip's app (14 Nov, an AI Studio export) has the Oculus code but not `AGENTS.md`, `packets/` or `supabase/`; the working assumption, not confirmed, is that `master` is the base. `PROGRESS.md`, `CODE_MAP.md`, `CONNECTIONS.md` and this file (draft 4) are identical in both.
- **F30. (22 Nov)** The day screen: a pill's colour comes from the **quality** of the session in the condition's palette; `DayBar` has `quality`, `color`, `tagLabel`, `label`, `startText`, `endText`, `detail`; `DayTagSegment` is `{label, seconds, minutes}` only; `tagBarOf` groups by the tag NAME. So learn needs a kind and an id on the segment and the grouping must be by a key (kind plus id), not by name, or a learn "PY-13" could merge with a timer tag of the same name (extends F18). The pill motion (grow, tag bar wipe, count-up) and its reduced-motion and lite rules live in `src/dayview.css` and `OverviewDayView.tsx`.
- **F31. (22 Nov)** NPTEL is already one of Hari's real timer tags (first in the picker's "most used"; the day screen examples read "NPTEL · deep"). So sources must be open-ended (Q29) and the NPTEL timer tag must not be migrated.
- **F32. (22 Nov)** `dayMixNote` builds sentences such as "All of it was Study." and "Study 70%, NPTEL 30%." from the tag bar's labels. For learn time it must name the subject ("Python 60%, NPTEL 40%"), not item codes.
- **F33. (22 Nov)** Coursera facts (the pack's cleaned notes, OCR-based): IBM Python for Data Science, AI and Development has 5 modules and 104 numbered lines, with lesson blocks for module 1 (1.1 to 1.4) and module 3 (3.1 to 3.6) in `coursera/python_lesson_blocks.md`; no hours on the page (headline 15 to 30 h) and no minutes per lesson. DeepLearning.AI Math for ML has 3 courses (linear algebra 34 h, calculus 27 h, probability and statistics 33 h by the cards; headline 60 h). Word clash: Coursera calls a lab an "App Item"; in the Guide an item is the Guide's own item (L-23). Nothing in the pack maps Guide items to Coursera lessons (C2).
- **F34. (22 Nov)** The timer picker preview first ran past the screen (both sheets taller than the screen, the main screen growing when an item was picked, controls cut off on a phone on its side). P3b fixes this. In the earlier planning chat it was checked in a headless browser at nine screen sizes (320 x 568 up to 1920 x 1080) in the idle, picked, both-sheet, running and stopped states: nothing ran past the screen and nothing scrolled sideways (from `06_PROGRESS_done_till_here.md`; not repeated when draft 5 was written). **Not tested:** a real phone, real Supabase data, the real app (the preview is built from the app's own screen).
- **F35. (22 Nov)** The icons for the item card are `lucide-react` names found in the installed package: `PencilLine`, `Eye`, `Bug`, `MessageSquareText`, `Scale`, `Crosshair`, `Terminal`, `ListChecks`, `BookOpen`, `GraduationCap`.

---

## 15. Parked (not part of this plan)

- The Overview condition changing with learning or grind (H15); a new rule in `DECISIONS_DAY_SCORE.md` first.
- Food and Grind (old Grind Guide reading P08, P09, P20) and the chooser page.
- Skill tree, skill points, "can you do this thing?" skill unlocks (L-16, L-22), tests per skill (L-40, L-58).
- Tiers 2 to 6; the AI Engineering and RAG certificates as courses.
- A "free study" learn label for things that fit no item (L-17).
- Weights per learn label in the score (also parked in `DECISIONS_TAGS.md`).
- Restarting an item from zero; a "test out" for things Hari already knows (it must not break the minimum time rule); pausing windows (holiday); reminders and notifications; saving whether an answer was opened.
- Splitting very large regions (the 8-item PD-G) once real minutes are known.
- The second look of the level map and its crew characters, if they should stay.
- Floors, hidden achievements and the heat calendar of the old app.
- Offline use.
- (Draft 4 parked three lines of "you should be able to" per item; draft 5 brings them into the plan, section 19d.)
- Sub-tags for normal timer tags, for example NPTEL and then a lecture (N12): a separate decision later.
- A one-tap "Switch" in the middle of a sitting (19f, B8): it would change the live timer.
- The Overview as a whole (H33): only the learn part of the day line is planned here.
- The Oculus data and tests (H26): which skills the sky has, which tests, how many questions, and the data and problems to fix. Much later, after Learn works; it needs its own planning round first (18d).

---

## 16. What comes after this file (a suggestion; the order is NOT decided)

Each packet is written only after the previous one PASSED. Numbers are suggestions; they are checked against `PROGRESS.md` when written.

**Content jobs (no code; the planner does them in chat, Hari reviews):**
- **C1.** Structured needs for all 36 regions and 7 subjects, one colour per subject, subject-prefixed region keys, the course list (stubs). Done inside 12A.
- **C2.** The item to Coursera mapping, from the pack's coursera notes ("not mapped" where unsure). **Moved earlier in draft 5:** it is needed by the pre-filled source in the timer, the "Where to learn" line and "Taught in", so it comes with 12A for the pilot region and then region by region.
- **C4.** The item card text (version 2) for the pilot, Python region A: "you will learn", "needs first", "where to learn", "by the end you should be able to". Written outside the app and reviewed (L-12); marked DRAFT until Hari reads it.
- **C3.** `players.csv` as a shipped asset, and the Windows notes (`o`) checked to read well on a small screen.

| Packet | What | Hari runs SQL | Hari looks at |
|---|---|---|---|
| **12A** | **Split in two on 23 Nov (WORKING).** **12A1** is written (`PACKET_12A1_LEARN_SOURCES_LABEL_COLOURS.md`): the source catalogue, the label shapes and the subject colours, with their tests; no data of the items. **12A2** is everything else below and waits for the hub mock's data block and the Tier 1 ledgers (section 19h, point 6). The data file from the hub mock's data block, with C1 (structured needs, subject colours as families, subject-prefixed region keys), the source catalogue (courses, modules and lesson blocks from the Coursera notes, an NPTEL slot, Pro Git, other) and the new optional item-card fields (empty or DRAFT); pure rules (`learnRules.ts`) and tests; the validation script (it also checks that every source id a saved session uses still exists); frozen id list; CODE_MAP and CONNECTIONS rows. No screen. Pilot text for Python region A. | no | the counts (147, 36, 36), the colour families |
| **12B** | The Guide screen opens: sub-addresses (F2), the Learn hub (tier tabs, subject rows, hover colour), the subject view in Explained mode, read only. No progress yet. | no | phone and laptop |
| **12C** | The database: item, region, course and settings tables, `learn_what`, `learn_via` and `learn_review` on sessions and the running session, the functions (including relabelling a saved session, Q30), the verify SQL; `learnApi.ts` with tests. No screen. | **yes** | the verify result |
| **12D** | Start, Done and the order: item sheet, region start, preview, pace setting, minimum time, undo. Progress read from the database. | no | the flow of section 9c, steps 1 to 5 and 8 to 9 |
| **12E** | The gate: gate sheet, needs-next chips, pass, next region opens, red and green. | no | steps 9 to 10 |
| **12F** | The Pro Timer picker as in P3b: "Working on" and "Learning from", the two sheets, the Review step, the dial line, Start with the learn fields, back to "No tag" after each session, the running session on another device, the stop screen link. | maybe (F16) | steps 6 to 7, phone and laptop |
| **12G** | Time panels: minutes per item, region, subject; the range that narrows. | no | the numbers on a real day |
| **12H** | Coursera: course card, Start, window, covers, "Taught in" (after C2). | no | the course card |
| **12I** | The Overview day screen as in P1: colour, marks, end caps, the thin quality line, two tag bars, legend, the mix note (F5, F18, F30, F32). | no | all four looks |
| **12J** | The level map as a generic second view from the data. | no | phone and laptop |
| **T1** | **COMMITTED in `b96f57f`, not yet looked at in a browser (F29).** The TV transition on its own: the turn-off and turn-on from the preview as a component, shown on the Guide placeholder with a temporary Prove button. Prove plays the turn-off at once, holds black for about 1.5 s (a stand-in for the Oculus trip), then plays the turn-on. No power button, no pop-up, no cursor (H31). No Learn data, no Oculus. | no | the turn-off and the turn-on, phone and laptop |
| **T2** | The Oculus moves into the repo as a screen: only the files the live screen uses, both videos as asset files, entry at the up video, a way back: when the down video ends the TV turns on by itself (18c point 4). The Prove button runs the whole trip and replaces T1's black hold. | no | the whole trip on the laptop (phone afterwards) |
| later | Overview condition from learning; Food; Grind; Tier 2 content; the Oculus data and tests (much later, 18d). | | |

**Order (22 Nov, WORKING):** 12A, 12B, 12C, 12D and 12E, 12F, 12I, then 12G, 12H and 12J; Tier 2 one chunk at a time; the Oculus trip (T2) after this planning (H44). Hari's method: build it into the repo, look at it there, fix it there.

T1 and T2 need no Learn data, so they can run before 12A to 12B. Then 12B puts the real Learn hub inside the TV. Their numbers are checked against `PROGRESS.md` when written.

**What we have to go through before each packet (reading list, so nothing is discovered in the middle):**
- 12A: the hub mock's data block, the pack's `research/depth/data/` ledgers, `design/TIER1_ITEM_PASS*.md`, the Tier 1 handover README.
- 12B: `src/lib/screens.ts`, `src/components/SignedInStub.tsx`, the MENU and `AB:MENU.NAV` rows of `CODE_MAP.md`, `CONNECTIONS.md` C24, the hub mock's script and styles.
- 12C: `supabase/timer_schema.sql` and `timer_verify.sql`, `DECISIONS_TAGS.md` sections 2 and 3, `src/lib/timerApi.ts`, `src/lib/useTimer.ts`.
- 12D and 12E: this file sections 9 and 10, the hub mock's Explained view, the level map's detail sheet.
- 12F: `DECISIONS_TAGS.md` section 4b and 5, the `AB:TIMER.TAGS` row, `TagPicker.tsx`, `GlassSurface.tsx`.
- 12I: `src/lib/overviewDay.ts`, `src/lib/overviewCondition.ts`, `src/components/OverviewDayView.tsx`, `src/dayview.css`, `CONNECTIONS.md` C61 to C64.

**Cheap and expensive to change**
- **Expensive:** which facts are saved (section 12b: started, done, gate, and the three learn fields on sessions, which must be decided **before** the SQL packet 12C); the permanent ids, including source ids (Q22, Q29); one label per session (Q5).
- **Cheap:** every number (seed minutes, gate seed, minimum times, pace, presets), colours, wording, the name "Learn", the order of the views, where the time is shown.

---

## 17. What was read, and what was not

**Read in full:** `DECISIONS_TAGS.md`; the pack's `decisions_A.md` entries L-07 to L-56 (L-57 to L-61 as one-line headings); `WINDOW_ARITHMETIC_CP12.md`; `coursera/OVERVIEW.md`; the subject hub mock's data block, body and script; the repo's `screens.ts`, `overviewCondition.ts` colours, the CODE_MAP rows for Guide, Overview and tags, `AGENTS.md` (first 45 lines), the tail of `PROGRESS.md`.

**Read in part:** `DECISIONS_DAY_SCORE.md` (first 60 lines); the pack's `00_START_HERE.md` (first 120 lines) and `00_ZIPS_README.md`; the Tier 1 handover README and `TIER_SPLIT_DRAFT_CP52.md`; the level map mock (markup and the places that hold its data and state); the Grind Guide reading (`GG-S1` context, the list of the 20 outputs and their headings, not their bodies); `timer_schema.sql` (tables, columns, function signatures and `timer_row_json`); `TagPicker.tsx` (props and structure), `TimerScreen.tsx` (how the picker is used) and `overviewDay.ts` (`tagBarOf`, `buildDayView` signature), read on 13 Nov to check this file.

**Not read:** the bodies of `GG` outputs P01 to P20; `CHECKPOINT_LOG` and the rest of the pack's design notes; `decisions_A.md` L-01 to L-06 and the full text of L-57 to L-61; the Coursera notes beyond the overview (so the item to course mapping, C2, is not started); the repo's source files other than the ones named; the SQL functions in full.

**Added in draft 2 (13 Nov, second part).** Read in full: the Oculus zip's `App.tsx`, `package.json`, `README.md` and `vite.config.ts`; in `RoomView.tsx` the stage list, the video effect, the click handler and the video elements; the first 60 lines of `AudioAtmosphere.ts`; in `StarMap.tsx` the group and skill data and the card and panel markup (found by search); the repo's `package.json` and `screens.ts` again at the same commit. Both videos were probed, every frame was measured for black, and key frames were looked at. Not read: the 3D mask maths in `RoomView.tsx`, the WebGL code in `StarMap.tsx`, `HUD.tsx` beyond the sound button, `CelestialRoom.tsx`, `Galaxy.tsx`, and the guide and plan files in the zip. The Oculus was not run in a browser, so its look, its timing and any stutter are untested.

**Added in draft 3 (13 Nov, third part).** Read: the Oculus `App.tsx` again, `RoomView.tsx` lines 355 to 480 (the stage and video effects), `index.html`, `main.tsx`, `vite.config.ts` and `package.json`; in the repo `AGENTS.md` (first 45 lines), the tail of `PROGRESS.md` and the list of packets. Web research on how CRT sets switch off and on (F26). Built: `tv_turn_animation.html` (the animation only) and `learn_tv_oculus.html` (Learn, TV, power button, cursor and the Oculus), both tried by Hari in the chat. The planner did not run them in a browser.

**Added in draft 4 (13 Nov, fourth part).** Hari's short fourth talk (H31). No new file was read for it. Draft 4 only changes the places that named the power button, the pop-up or the cursor (status, Q28, section 5, the notes on H27 and H29, H31, section 13 item 10, F28, section 16 T1 and T2, section 18), and adds two small picks to 18c (points 9 and 10). The planner still cannot see the repo from this chat; packet T1 is written from this file and from `tv_turn_animation.html`.

**Added in draft 5 (22 Nov).** Draft 4 was read again for the sections that draft 5 changes (1 to 5 and 8 to 17); section 6 (Hari's words of 13 Nov), section 7 apart from the three rows changed, and section 18 (the room, the TV and the Oculus) were not otherwise changed. Read for it: the 22 Nov checkpoint files 01 to 06 (the zip `ashborn_checkpoint_22Nov2026_v2`). The repo `master` was cloned again on 22 Nov (`b96f57f`) and `PROGRESS.md` was checked for the state of Packet T1. The previews in `previews/` were read as text (their visible text, colour variables and data blocks); they were **not** rendered in this chat. P3b was checked in a headless browser at nine screen sizes in the earlier planning chat (F34). Not read: the pack's ledgers and the part19 and handover zips (still missing, section 19h), `DECISIONS_TAGS.md` and `DECISIONS_DAY_SCORE.md` again, and the source files other than those named in F29 to F32 (read on 22 Nov in the earlier chat; the day screen and database facts come from the findings file).

Where this file says "the pack says", the source is the entry named (for example L-48). Where it says "the mock", it means the two HTML files. Everything the planner chose is labelled DEFAULT or PLACEHOLDER, so Hari can see at once what is his and what is the planner's.

---

## 18. The room, the TV and the Oculus (draft 4: what Hari said, the look he approved, the planner's picks)

Draft 2 only recorded what Hari said. Draft 3 adds the look he approved in a preview, his idea of the power button and the cursor (H27), and the planner's picks for the open points. Draft 4 drops the power button and the cursor (H31): the skills button now plays the turn-off at once. Labels as at the top of the file.

### 18a. The idea in plain words (DECIDED, H18 to H25, H31)

- **One world, not two parts.** There is a room, and in the room a TV. Hari works on the TV, and what the TV shows is Learn (the hub, the subjects, the regions, the items, the gates). The skills sky (the Oculus) is what he sees when he looks out of the TV and up at the stars.
- **Why the sky.** When he finishes a skill (for example Python) he wants to see what tests that skill needs, so he can say "I have the Python skill, I can build anything with it". The tests are up in the sky.
- **How he gets there (H22, H31).** He presses the sky button in Learn (18c point 1). The turn-off plays at once, whatever he was doing in Learn: a burst of static, the picture squashes to a bright line, the line shrinks to a dot, the dot fades, and the screen is pure black. The Oculus starts from that black. There is no power button, no pop-up and no cursor in between.
- **What the Oculus does (as built).** It starts from pure black. Its first video begins on a black TV screen, the camera pulls back and shows that the black was a TV on a wall with a light switch beside it, the switch is flipped, the room goes black again, and he looks up through the open ceiling at the skills. The room is well lit, not dark (F22).
- **The way back.** Looking down plays the down video, which ends on the black TV screen. Then the TV turns on again by itself (18c point 4).
- **Whose part is whose.** The stars part and the lights-off part are done (the Oculus). The TV part is now designed in previews (18b).

### 18b. What is built and what is not

| Piece | State |
|---|---|
| The room, both videos, the ceiling opening, the star animation (the Oculus) | built (an AI Studio prototype); joined to the TV in a preview page and tried by Hari: works |
| The turn-off and turn-on look | DECIDED (H28); built as a preview and as a code file, `tv_turn_animation.html` |
| The power pop-up and the cursor | DROPPED by Hari (H31). Not built in the repo and not planned. The preview page `learn_tv_oculus.html` still has it; ignore it. |
| The trip inside the repo (T1 and T2, section 16) | not built |
| The Oculus data and tests (which skills, which tests, how many questions) | not planned (18d) |
| Learn itself (sections 1 to 17) | planned, nothing built |

### 18c. The open points and the planner's picks (Hari: okay, or correct)

| # | Point | The planner's pick | Label |
|---|---|---|---|
| 1 | The button | The Prove side of the Learn and Prove switch at the top of the Guide is the button (Hari's words in H27: "Prove, or whatever the skills should be"). Pressing it plays the turn-off at once (point 7). No separate star button. The final word stays open. **To reconcile before 12B:** Q24 and section 13 item 1 still talk about a chooser (Food, Grind, Learn); the switch at the top of the Guide has to be matched with that. | DEFAULT |
| 2 | TV frame | None. Learn fills the whole screen; the TV and its frame are seen only inside the up video. | DEFAULT (the previews use it; Hari saw them and did not object) |
| 3 | Length of the turn-off | Quick, 1.0 s. A slow 2.0 s was shown too. With no power button before it, the press has to feel instant, so the quick one is the pick. It is one number in the code. | PLACEHOLDER (Hari has not chosen) |
| 4 | The way back | The TV turns on again by itself (1.0 s) when the down video ends, with Learn exactly where he left it. No power button on the way back either (H31). | DEFAULT |
| 5 | The Oculus and the repo | One app. The Oculus moves into the repo as a screen (T2), with only the files the live screen uses and the videos as asset files. The packages it does not use (`three`, `motion`, `@google/genai`) and its server packages stay out (F25). It is a full-screen layer (F27). | DEFAULT |
| 6 | What the sky shows from Learn | Nothing linked for now: the sky keeps its placeholder stars. When the Oculus data is planned (18d), skill progress is the only link between Learn and the sky. | DEFAULT |
| 7 | No power button | He presses Prove (the skills button) and the turn-off plays at once. No pop-up, no cursor, no extra tap, on laptop and phone alike. The power pop-up and the cursor of the preview are dropped. | DECIDED (H31) |
| 8 | The look of the turn-off and turn-on | Turn-off: static burst, squash to a bright line, the line shrinks to a dot, the dot fades, pure black at the end (the real order, F26). Turn-on: the reverse, as a style (a dot, a line that grows, the picture opens, a short static settle). The code file `tv_turn_animation.html` is the reference for every number; this file only records the order. | DECIDED (the look) / PLACEHOLDER (the numbers) |
| 9 | Reduced motion | When the phone or laptop asks for reduced motion, the turn-off and the turn-on become a short fade to and from pure black (about 0.3 s): no static and no flashing line. The end is still pure black (H25). | DEFAULT / PLACEHOLDER (the time) |
| 10 | Pressing again | While the turn-off, the black or the turn-on is running, another press of the skills button does nothing. | DEFAULT |

### 18d. The Oculus data and tests (PARKED, but included on Hari's word, H26)

- **Done:** the star animation, the hardest part.
- **Not done:** the data and the planning behind the stars: what skills each group holds, what tests each skill has, how many questions come, and the data and problems in the prototype that must change (F24, F25).
- **When:** much later (Hari: "very, very later"). It needs its own planning round in chat first, like Tier 1 had, then a data file, then code. It is not part of the packets in section 16.
- **How it ties to the rest of the file:** the pack says tests per skill come after all tiers (L-40, L-58), and Tier 1 unlocks no skill (L-57). Nothing here changes that. Hari's wish to see a skill's tests after finishing it (H21) has to wait until those tests exist.

---

## 19. Draft 5: the two-part learn label, the Overview line, the item card and the timer picker (22 Nov)

This section is new in draft 5. It holds what Hari said on 22 Nov (H32 to H50, section 6b), what he said yes to, the previews he looked at, and the choices taken on his behalf (WORKING, H49). Where it disagrees with an older section of this file, THIS section wins, and the older section has been changed to point here (section 19i lists every change).

**Numbers used here.** N1 to N15 are the questions of the plan (`02_PLAN_labels_overview_items.md`, section 8) and B1 to B12 the extra things of the addendum (`05_ADDENDUM_decided_and_new_things.md`, section B); both files are in the checkpoint zip `ashborn_checkpoint_22Nov2026_v2`. B1 to B12 are written out in 19f and the picks of N1 to N15 are written into section 3 and into this section, so this file can be read without those two.

**What Hari decided on 22 Nov**
- **DECIDED (H48):** a learn session has two parts. When Coursera teaches an item, the item is the WHAT and Coursera is a source. He said "ok" to this (N1, N2) and "yeah" to a session with a source only and no item (N3).
- **DECIDED (H49):** the planner takes the answer he would most probably say yes to, decides, and comes back. It asks only what only he can answer.
- **DECIDED (the timer picker preview, P3b):** he looked at it and said "this is good". He also said things may change when the syllabus is known: the preview pages only show how it could be presented.
- **Not recorded:** his verdict on P1 (the Overview pills), P2 (the item card), P2c, P2i and the subject colour families. They are WORKING until he says.

### 19a. The two answers of a learn session (Q2, Q29; H3, H36, H40, H46)

Hari's questions all sit on one chain:

```
 ITEM card --Start--> label in the Pro Timer --> SESSION --> Overview line + tag bars
      ^                       ^
      |                       |
 COURSERA lesson ------- the second answer of the label (the source)
```

Every learn session carries **two answers**:

- **WHAT** (the app asks: "Working on"): an item (`item:PY-13`), a gate (`gate:python/D`), or nothing specific.
- **Source** (the app asks: "Learning from"): our own practice, a Coursera course, module and lesson block, NPTEL, Pro Git, or something else.

One session, one set of minutes. **The minutes are counted once everywhere**: the day total, the condition, the quality of the session. The two answers only decide how the minutes are read:

- Time on an **item** = every first-pass session whose WHAT is that item, whatever the source.
- Time on **Coursera** = every session whose source is Coursera, whatever the WHAT (also when there is no item).

That is the answer to H3 ("how much on Coursera, how much on a specific Python item") and to H46 ("Coursera, the item, or both?"): **both, at once, without counting twice.** It also keeps two older rules true: L-27 (learn an item anywhere and still log it) and L-25 (Coursera is a resource, not the base of the design).

**The cases (the table Hari asked for in H45 and H46):**

| # | What he is doing | WHAT | Source | On the Overview |
|---|---|---|---|---|
| 1 | Normal work (a timer tag, or no tag) | none | none | exactly as today |
| 2 | A Python item, own practice | PY-13 | own | subject colour, item mark, no cap |
| 3 | A Python item, read in a Coursera lesson (H46) | PY-2 | Coursera IBM Python, module 1, block 1.3 | subject colour, item mark, **blue Coursera cap** |
| 4 | Coursera only, no matching item (for example IBM module 4 or 5, while no item is mapped to it yet, C2) | none | Coursera IBM Python, module 4 | **cap only**: an open ring with no code and a blue cap |
| 5 | A gate (the region task) | gate python/D | own | subject colour, **gate mark** (double edge) |
| 6 | An item learned from another source | GT-14 | Pro Git | item mark, **grey cap** |
| 7 | One sitting covers two items | the main one | any | soft warning at Done, then allowed; the other item can be given the session afterwards (B1, B11, N10) |
| 8 | Free study that fits no item | parked (L-17) | any | not now; the label shape allows it later |
| 9 | Working again on a finished item | the item, with the review flag | any | subject colour, **hollow notch**; its time is its own number (B2) |

**The sources (Q29, N14).** A short fixed list in the data file. The shapes of the paths below are examples; packet 12A writes them down and the validation script freezes them.

| Source | Stored as (example) | What it holds now | Cap on the day line |
|---|---|---|---|
| Own practice | `own` | nothing below it | no cap |
| Coursera: IBM Python for Data Science, AI and Development | `coursera/ibm-python/m1/1.3` | 5 modules; lesson blocks for module 1 (1.1 first program, 1.2 types, 1.3 expressions and variables, 1.4 string operations) and module 3 (3.1 conditions, 3.2 loops, 3.3 functions, 3.4 exceptions, 3.5 classes, 3.6 text analysis), from the pack's lesson notes | blue cap, letter P |
| Coursera: DeepLearning.AI Mathematics for ML and Data Science | `coursera/math-ml/c1` | 3 courses: linear algebra (34 h), calculus (27 h), probability and statistics (33 h), by the cards; the headline says 60 h (F33) | blue cap, letter M, a lighter blue |
| NPTEL | `nptel/...` | an empty slot until Tier 2 gives it content. The NPTEL **timer tag** stays as it is (F31) | not designed yet (UNSURE) |
| Pro Git | `progit` | Git items | grey cap |
| Other | a short fixed list: a video, a book, docs | nothing below it | grey cap |

Later tiers bring the IBM AI Engineering path (13 courses) and RAG and Agentic AI (10 courses): they are new entries in the list, never a change to the database (B4).

- **WORKING (N4), how deep:** the database can store the source down to the lesson block. The timer **asks** down to the module. The block is optional and is **pre-filled from the item** when the item is mapped to a lesson (content job C2). The pill shows the course letter; the tap line shows everything.
- **WORKING (N5):** the app offers the source used last time **for that item** first. This is the only choice the picker remembers; for everything else "nothing is remembered" stays true.
- **WORKING (B6):** the planner words WHAT and VIA never appear in the app. The app says "Working on" and "Learning from".
- **WORKING (B5):** source ids are ours, never Coursera's numbers, never reused. A source that goes away is **retired**, not deleted. The validation script fails if a source id used by a saved session is no longer in the catalogue.
- **FOUND (F33):** Coursera calls a lab an "App Item". In this file an item is always the Guide's own item (L-23).

### 19b. The Overview line: three signals, so colour never carries it alone (Q8; H34 to H38; preview P1)

**FOUND (F30, code of 22 Nov):** a pill's colour today comes from the **quality** of the session in the condition's colours, and the tag bar has no id and no colour. Learn colours would sit near the four day colours (F5), so colour alone would be mistaken.

| Signal | What it says | How it looks (P1) |
|---|---|---|
| **Colour** | which subject (the WHAT) | the subject's colour (19c) |
| **Mark** | what kind of work | item: a notch and the code (PY-13). Gate: a double edge. No WHAT (source only): an open ring and no code. Review: a hollow notch |
| **End cap** | the source | Coursera: a blue cap with the course letter (P for IBM Python, `#2563eb`; M for Math, `#5aa2ff`). Another source: a grey cap with its letter. Own practice: no cap |
| **Motion** | Coursera is special (H37) | a soft light travels along the pill **once**, after the reveal. Nothing under reduced motion or lite level 2 |
| **Quality** | meh, solid, deep, flow | a thin line under a learn pill, in the day's condition colour (N8). Timer-tag pills keep the quality colour as today |

- **Pill length is the time**, as today (H35). A 4 hour and a 6 hour piece look as they do now.
- **A sliver shows colour only (B7).** In P1 a session under 8 minutes drops the mark, the cap and the light. The real rule is a minimum drawn width, judged on real pills (PLACEHOLDER). The tap line and the tag bars always carry the full label, and each pill has the full label for screen readers.
- **Different Coursera courses (H37, N6, UNSURE what he meant):** the same blue family and the same motion, a letter per course, and a slightly different blue per course. If he meant something else, only the look changes, not the data.
- **The tap line** becomes, for example: `07:00 to 07:52 · PY-2 Variables · via Coursera IBM Python 1.3 · deep`. A source-only session reads `No item · via Coursera IBM Python, module 4 · deep`. A review reads `Review of NP-3 · own practice · kept out of first-pass minutes · solid`.
- **The tag bar (N9):** learn time gets **two** thin bars that each add up to the same learn minutes: one by WHAT (Python 90, NumPy 30), one by source (Coursera 60, own 60). Timer tags keep their own bar, as today. Nothing is counted twice, because each bar is a different cut of the same minutes. The bars group by a **key** (kind plus id), never by name, or a learn "PY-13" could merge with a timer tag of the same name (F18, F30).
- **The legend** lists the learn labels in their colours, with the cap shown once.
- **The mix note (B9, F32):** "Study 70%, NPTEL 30%" for timer tags stays. For learn time the note names the **subject** ("Python 60%, NPTEL 40%"), not item codes. Codes live on the pills and the tap line.
- **Does not change:** the day's condition and the 120 and 240 minute rule (Q9); learn minutes are minutes. The week row and "Today in Pro Timer" stay as they are (H33: the Overview as a whole is not the focus now).
- **Colours in P1 are an earlier trial.** P1 was drawn before the colour families page (19c): it uses Python `#e879f9`, NumPy `#a3e635`, Git `#fb923c` and linear algebra `#c4b5fd`. Git's orange is close to the day's amber, which is the reason for the families. When the line is built, the colours of 19c are used, and the four looks of the day screen are checked again by eye.

### 19c. Subject colours: families (Q7, replaces the table of section 11b in draft 4)

From the page `ashborn_subject_colours_families.html` (titled "final families" on the page; Hari's yes is not recorded, so WORKING; the exact hexes are PLACEHOLDERS judged by eye in all four looks). Related subjects share one hue and step from light to dark. Each family keeps a hue that the day screen does not use, and the darkest shade is still bright enough to read on black.

| Family | Subject | Colour |
|---|---|---|
| Data stack (the order he learns them, lightest to darkest) | Python | `#dfbefd` |
| | NumPy | `#bf81f2` |
| | pandas | `#964fcb` |
| Tools | Terminal | `#e1df5d` |
| | Git | `#b5b11b` |
| Maths | Linear algebra | `#8ce6a0` |
| | Probability | `#128f43` |

- **Order inside a family** (Terminal before Git, linear algebra before probability) is the planner's pick. Hari can swap it.
- **Not coloured yet:** Machine learning and Research (the two Hari named for later tiers). Pink and coral hues are still free for them.
- **The day colours stay as they are:** blue `#38bdf8`, rose `#f43f5e`, amber `#f59e0b`, teal `#5eead4`.
- **Coursera is not a subject colour.** It is the blue end cap of 19b, so a Python item read in Coursera is still Python-coloured.
- An earlier page (`ashborn_subject_colours.html`) offered three sets of colours; the families page replaced it.
### 19d. The item card, version 2 (Q32; H41 to H43; previews P2, P2c, P2i)

**What Hari said:** an item is not defined enough and has only a one-line definition (H42). He wants it very well defined: "in this you will learn this", stretched out a bit but not full paragraphs; at the end "you should be able to do this, you should be able to do that", with icons (H43). How exactly is for the planner.

**FOUND:** each item in the data has `id`, `t` (title), `y` (one line of what you can do), `c` (the check), `a` (the answer) and sometimes `o` (a Windows note). Nothing in the data says "what you will learn", "where to learn it" or the abilities as separate lines, so the richer card needs **new optional fields**. Some of them are **new writing**, not data that exists. The field names are fixed in packet 12A.

**Shape of the card (WORKING):**

```
 PY-13  ·  `for` and `range`        Python · region D Loops · item 1 of 5        [Start]
 -----------------------------------------------------------------------------------
 In this item you will learn        3 to 4 short lines, one idea each (no paragraphs)
 Needs first                        chips: hard needs and hints, each with the reason
 Where to learn it                  Coursera lesson (course, module, block) · other source · how to use it
 The check                          the problem; the answer stays hidden until opened
 By the end you should be able to   2 to 4 lines, each with an icon for the kind of ability
 Time                               "42 min logged · about 30 to 78 min"  or  "No time logged"
 Windows note                       only where there is one                       [I can do this]
```

**Icons (WORKING).** The names are `lucide-react` icons, all found in the installed package (F35). The final choice is judged on screen.

| Ability | Icon | Meaning |
|---|---|---|
| write | `PencilLine` | write code or a command |
| predict | `Crosshair` | say what it will print or give, without running it |
| read | `Eye` | read code, an error or output and explain it |
| fix | `Bug` | find and repair a mistake |
| explain | `MessageSquareText` | say why in your own words |
| choose | `Scale` | pick the right tool or option and say why |

**Rules for the new text (from the pack, still binding):**
- It is written outside the app and reviewed (L-12).
- Nothing is invented: no invented links, concepts, checks or answers. Anything not backed by a source is marked **DRAFT** until Hari reads it.
- The check and the answer are not rewritten (Tier 1 is FINAL, L-57).
- The "by the end you should be able to" lines are **split from the existing `y` sentence and the check**, so they add no new claims. The "you will learn" lines are written from `y`, `c`, `a` and the region idea.
- The card keeps the rules of section 9b (the answer hidden until opened; the time range and the time spent; the "Taught in" line when a course covers the item).

**The job, and where it starts (N11):** 147 items. One **pilot region first**, looked at on screen in the repo, corrected, then the rest by subject (Hari's own method: build it, look at it there, fix it there). The pilot is **Python region A** (PY-1 to PY-5), the first thing he opens. By the planner's reading of the lesson titles (not checked against the lesson content), PY-1 to PY-4 line up with IBM module 1 (first program, types, expressions and variables) and PY-5 (`input()`) is not named in the module 1 titles, so it is "not mapped".

**What the previews cover.** P2 draws two cards, PY-13 and PY-2. P2c shows region to item for Python: regions A and D open, PY-2 and PY-13 real, the other items dimmed because their text was not in the planner's notes at that time. P2i shows all Python regions and items. A card for a Git item (the plan promised one) was not drawn. The preview leaves out the check and the answer of PY-2: per the 22 Nov findings the hub mock's data block holds a check and an answer for every one of the 147 items, so this was a gap of the preview, not of the data. It is not re-checked in this chat, and 12A fills it from the data file.

**Worked example A: PY-13 (own practice).** Existing text is marked [data]; new lines are DRAFT.
- Title: `for` and `range` [data]. Python · region D Loops · item 1 of 5.
- *In this item you will learn (DRAFT):* (1) how `for i in range(n)` repeats the same steps n times; (2) what `range` gives with one, two and three numbers (stop; start and stop; start, stop and step); (3) that the start number is included and the stop number is not; (4) what an empty range does: the body never runs.
- *Needs first:* regions A and C (region D's own "needs" line in the data).
- *Where to learn (DRAFT, the planner's reading of the lesson titles):* Coursera IBM Python, module 3, block 3.2 Loops (video, reading, lab, practice quiz). No other source is named for this item in the pack.
- *The check [data]:* print the numbers given by `range(5)`, `range(2, 6)` and `range(10, 0, -3)`, then say how many times the body of `for i in range(7, 7)` runs. *Answer [data], hidden:* `0 1 2 3 4`, `2 3 4 5`, `10 7 4 1`, and 0.
- *By the end you should be able to (split from `y`):* `PencilLine` write a `for i in range(...)` loop that repeats steps a counted number of times; `Crosshair` say which numbers `range(...)` gives for one, two or three arguments (start included, stop not); `Crosshair` say how many times a loop over an empty range runs (zero).

**Worked example B: PY-2 (the overlap case, H46).**
- Title: Variables: a value under a name [data]. Python · region A Values and variables.
- *In this item you will learn (DRAFT):* a variable is a name that holds a value; how to store a text and a number under two names; how to print them and change one later.
- *Where to learn (DRAFT, the planner's reading):* Coursera IBM Python, module 1, block 1.3 Expressions and variables (video, lab, practice quiz).
- *By the end you should be able to (split from `y`):* `PencilLine` store a value under a name; `PencilLine` show it with `print`; `PencilLine` change it later and show the new value.
- *The flow Hari asked about:* he starts PY-2. In the timer he picks PY-2 under "Working on". "Learning from" offers `Own practice` and `Coursera ▸ IBM Python ▸ M1 ▸ 1.3`, pre-filled because the item is mapped to that block. He picks Coursera, presses Start, works, ends. On the Overview the pill is Python-coloured with the item mark **and** the blue Coursera cap. The item shows its minutes; the Coursera course shows the same minutes. The day total counts them once.

### 19e. The Pro Timer picker (Q3, Q4, Q6; preview P3b)

**DECIDED:** Hari looked at P3b and said "this is good". The first version (P3) ran past the screen in four places; P3b is the fix and is the version that counts. It is a preview built from the real Pro Timer screen, with no database.

- **Main screen:** "Working on" and "Learning from" sit side by side in **one two-part pill**. Until a learn item is picked, the screen shows the one pill "Working on", as the tag pill does today. The screen does not grow when an item is picked, so Start never leaves a small phone.
- **"Working on" sheet:** small chips and two-column cards, not tall rows. It lists the started items (at most one per subject, Q3), a gate in progress, "No item" (a source only, case 4), and "Review ▸" for a finished item (B2). The Learn cards use the subject colour (19c).
- **"Learning from" sheet:** steps through Own practice, Coursera ▸ or Other ▸, then course, module and lesson block, with a Done button. Own practice and the "Other" sources close the sheet at once. The line "the source you used last time" lives in this sheet (N5).
- **Sizes:** 1000 by 800 and up uses the inline chips; anything smaller (a phone, a phone on its side, a small laptop window) uses the pill and the sheets. On a phone on its side the sheet is wider and has two columns. If the real list of started items gets long, the body of the sheet scrolls while its title and Done button stay put.
- **Rules that stay (Q5, F20, F21):** pick first, then Start; no change while a session runs; one label per session. Choosing a learn item clears a timer tag and the other way round. The timer-tag row (four most used, `No tag`, `All tags`) keeps its rules from `DECISIONS_TAGS.md`.
- **The dial line (Q6):** while a learn session runs, the small line under the day total shows the item code and the source in the subject colour (for example `PY-2 · Coursera IBM Python M1 1.3`). The exact wording is judged on screen.
- **The stop screen (B3):** a stopped learn session shows one quiet link, "Open PY-2", back to the item. In P3b it sits close to the note, and the dial leaves room for it. No reminders.
- **Checked** in a headless browser at nine screen sizes (320 by 568 up to 1920 by 1080) in the idle, picked, both-sheet, running and stopped states: nothing runs past the screen and nothing scrolls sideways (F34). **Not tested:** a real phone, real Supabase data, the real app.

### 19f. What else comes up beyond Coursera (B1 to B12)

Hari said: do not ask only about what he just pointed out; think about what else comes up (H49). Each pick is WORKING with its reason.

- **B1. Labelling a session afterwards (Q30).** He will forget to pick, or see at the end that the hour was PY-2; Coursera time watched before the item opened (case 4) and a sitting that covered two items (case 7) lean on it too. Changing the tag of a saved session is parked for timer tags (`DECISIONS_TAGS.md`, question 7) because it needs no new saved data. For learn it matters more, so: the two learn fields of a **saved** session can be set or changed later, from the tap line on the day screen and from the item sheet. The running session stays locked. Timer tags are untouched. It adds one database function and no new saved data, so it goes into 12C, where the verify file is being written anyway.
- **B2. Reviewing a finished item (Q31).** The timer offers only started items (Q3), so revision time had nowhere to go. A finished item can be picked under "Review"; the session carries the review flag (`learn_review`) and its pill gets a hollow notch. Review time shows on the item as its **own number** and is not mixed into first-pass minutes: Q15 narrows the expected range from the minutes really spent, and revision would make him look slower than he is.
- **B3. The way back to the item.** See 19e: one quiet link on the stop screen.
- **B4. NPTEL and every source that comes later.** NPTEL is already one of his real timer tags (F31). So sources are **open-ended**: the database stores the source as a text path checked only for its shape (the rule of Q21: the database does not know the content), and the catalogue lives in the data file. A new source is a data change, never a SQL change. The NPTEL timer tag stays exactly as it is; nothing is migrated and old sessions keep their tag.
- **B5. Our own ids for sources, frozen.** See 19a.
- **B6. Plain words.** See 19a: "Working on" and "Learning from".
- **B7. Tiny pills.** See 19b: a sliver shows colour only.
- **B8. Switching in the middle of a sitting.** He reads a lesson, then codes the lab. The label cannot change while a session runs, and Learn must not touch the live timer (section 5). So he ends and starts again (the 60 second rule applies; a break shows as a connector from one minute). A Coursera lab is practice done inside Coursera, so it stays "from Coursera". A one-tap Switch is **PARKED** because it would change the live timer.
- **B9. The mix note.** See 19b: it names the subject.
- **B10. The sky later.** The Oculus will need only the WHAT: items and gates feed skill progress, the source never matters to it. Keeping WHAT and source as separate fields means the sky can read progress without parsing a label. This is one more reason for the two-part model. Nothing in the sky is built or changed (H44, section 18).
- **B11. Done with no timed minutes.** Something learned on a bus with no timer. Done is allowed with a warning (Q14). Such an item is recorded as **"no time logged"**, not as 0 minutes, and **keeps its seed range**. Real minutes come only from timed, first-pass sessions.
- **B12. A rule that disagrees with a rule.** The mock brief says "no minutes per item anywhere"; Q15 shows a seed range of 30 to 78 minutes. The seeds are shown only as a range, worded "about" and marked placeholder, never as data. This honours "no invented numbers" by labelling them.
- **N10, one sitting covers two items.** The item learned inside another item's session has no minutes of its own. **A (taken, WORKING):** a soft warning at Done, shown once, then allowed; the app cannot check honesty anyway (L-13, L-22), and a hard rule would push him to move minutes or tap falsely. **B:** he can move minutes between items afterwards (needs B1 for both items). **C:** keep the hard 10 minute rule of draft 4. Hari can pick B or C.

### 19g. What is saved: the three fields (Q1, Q5, Q30; the expensive part)

Three fields on the **running session** and on **saved sessions**. They must be decided **before** the SQL packet 12C, because changing what is saved is expensive (section 16).

| Field | Holds | Example |
|---|---|---|
| `learn_what` | the item or the gate, or empty | `item:PY-13`, `gate:python/D` |
| `learn_via` | our source path, or empty | `coursera/ibm-python/m1/1.3`, `own` |
| `learn_review` | true or false | false |

- **A check forbids a timer tag (`tag_id`) together with learn fields** (Q5). One label per session stays.
- **A source-only session** (case 4) has `learn_via` and no `learn_what`.
- **The database checks the shape** of the two text fields and that the item or gate is started for this person. It does **not** check that a source exists or that the order is right: the app does (Q21, B4).
- **`timer_start`** gets the learn arguments in place of draft 4's one ref. The old version has to be dropped, and the `revoke` and `grant` lines in `timer_schema.sql` name the old signature `(text, uuid)` and must change with it (F17).
- **`timer_row_json`** carries the two parts and the flag, so a phone shows a learn session started on the laptop (F16).
- **One new function** relabels a saved session (B1). The running session stays locked.
- **Read-only time functions** answer the seconds per `learn_what` and per `learn_via`, first-pass and review apart (section 12b).
- **The verify SQL** gets new rows for all of it. Hari runs the SQL by hand, as in 10A, 10C1 and 10E.
- **Left to 12C and 12F:** whether a review flag is allowed without an item, and what the picker sends when no source was chosen (P3b offers the last source used, or Own practice, first).
- **Dates and judgements stay worked out, not saved** (section 12b): started, done and passed are facts; windows, red and green come from the facts, the content and the pace.

### 19h. What only Hari can answer, and what is still unknown

1. **What H37 and H38 meant.** The working readings are in use: "different Coursera" means different courses (letter and blue per course); a task done through Coursera says so on its pill (the end cap). If he meant something else, only the look changes, not the data.
2. **The "many things to connect"** (H44). He has not listed them. This file uses only the chain he described on 22 Nov and what came up from the code. If there are others, they are not here.
3. **The syllabus.** He said things may change when it is known. The previews show how it could be presented; the data file takes whatever he gives.
4. **His verdicts on P1, P2, P2c, P2i and the colour families** are not recorded. Until he says, they are WORKING.
5. **N10:** A (soft warning, taken), B or C?
6. **Missing files** (`03_FINDINGS_verified_22Nov.md`, section 6): the three part19 and handover zips with the final Tier 1 content and ledgers, `ASHBORN_Learn_level_map_crew_v2.html`, and the two Oculus videos. Until the ledgers are here, the hub mock's data block (147 items, 36 regions, 36 region tasks) is **not** compared with them, and the item to Coursera mapping stays the planner's reading.
7. **Which codebase is the base.** The working assumption, not confirmed, is that GitHub `master` is the base (F29) and the Oculus code of the zip comes in later as its own packet (T2).
8. **Tier 2 onward:** which sources and what content. NPTEL has an empty slot only.
9. **IBM module 4.** The plan treated Coursera-only time on IBM module 4 or 5 as having no matching item, while draft 4 (section 10d) says the page lists module 4 on Python and NumPy, which would touch Tier 1 NumPy items. Content job C2 decides which modules map to which items; until then the example of case 4 is only an example.
10. **Placeholders that are cheap to change:** the 8 minute sliver of P1 (really a minimum width), the seed range 30 to 78, the gate seed 60 to 120, the 10 and 15 minute warnings, the pace of 5 hours a week, every colour, and the look of the NPTEL cap.

### 19i. What draft 5 changed from draft 4

| Where | Draft 4 said | Draft 5 says |
|---|---|---|
| Q1, 11a, 12b | one field `learn_ref` | three fields: `learn_what`, `learn_via`, `learn_review` (19g) |
| Q2 | three kinds of learn tag: item, gate, course | two parts: WHAT (item or gate) and source; a course is a source (19a) |
| Q3, Q4, Q6 | a "Learn" row in the timer; one pill above Start | "Working on" and "Learning from", two sheets, a Review step (19e) |
| Q5 | one label per session | still one label; the label has two parts |
| Q7, 11b | one placeholder colour per subject | families (19c); Coursera is an end cap, not a subject colour |
| Q8, 11c | subject colour plus a marker; one tag bar | colour, mark and end cap; the quality as a thin line; two tag bars (19b) |
| Q14 | a hard minimum of 10 minutes (gate 15) | a soft warning once, then allowed; "no time logged" (19f) |
| Q15 | one time number per item range | first-pass minutes only; review time apart (19f) |
| Q19, Q20 | the course is a tag; the mapping before 12H | the course is a source; the mapping (C2) comes with 12A (section 16) |
| 9b rule 8 | a one-line card | the card of 19d |
| Section 15 | three lines of "you should be able to" parked | brought into the plan (19d) |
| Section 16 | T1 not built; the order not decided | T1 is built (F29); the order is a WORKING pick |
| New rows | | Q29 sources, Q30 relabel a saved session, Q31 review, Q32 the item card |
| New facts | | F29 to F35 |

**Numbers that did not change:** the seed range (30 to 78 minutes), the gate seed (60 to 120), the pace (5 hours a week, presets 3, 5, 10, 20), the day minute rule (120 and 240), the 60 second rule, the ids of Q22, and everything in section 18.

**Every packet from here follows this file** (the rule at the top). Nothing is built from draft 5 until Hari has read section 4 and said okay or corrected what is wrong.
