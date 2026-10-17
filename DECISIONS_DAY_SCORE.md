# ASHBORN: "Was the day productive?" DECISIONS

**Status:** LOCKED on 17 Oct 2026. Hari said "ok start working on it" after the talk (TALK_SUMMARY_DAY_SCORE.md).
**Version 2 (17 Oct 2026):** section 5 was rewritten after the talk about ending a long session. New: when Hari ends a long session the app asks "Was all of this real work?" and he can give the time he really stopped. The unconfirmed rule is now measured on running time only ("windows"), which fixes a gap in version 1: a session left paused for hours could have been flagged. Sections 2, 10 and 11 were changed to match. Nothing else changed.
**This file is a document only.** No code, no screens, no packets come from it until Hari has read it and corrected what is wrong.
**Rule for every later packet:** a packet about the day score must match this file. To change a rule or a number, change THIS FILE first (tell the planner), then the packet.

**How to read the labels**
- **DECIDED:** Hari said yes to it in the talk. A number inside it can still be a placeholder.
- **DEFAULT:** nobody decided it yet. The planner chose it so that the file is complete. Hari has not read it. Tell the planner what is wrong and it changes.
- **PLACEHOLDER:** a number that is cheap to change later (the raw sessions are kept, so past days can be re-scored).

---

## 1. What does NOT change

- **DECIDED:** the Pro Timer works as it does today: Start, Pause, Resume, Hold to end, the stop alert (I'M DONE, GO BACK IN under 45 minutes), the 60 second rule (a session under 60 seconds is never saved), and the midnight cut.
- **DECIDED:** the quality steps (meh under 10 min, solid 10 to 30, deep 30 to 90, flow 90+), the glowing ball, the colours and the messages follow counted minutes only, as today. The day score does not touch the live timer.
- Paused time is never counted. That stays.
- The day score is a separate layer: it is worked out from sessions that are already saved. Nothing in it stops, slows or changes a running session.

## 2. What is saved per session (the facts)

Since Packet 09A (pushed as commit b561d7a, database run and checked on 17 Oct 2026), a saved session holds:

| Fact | Where | Old sessions (saved before 09A) |
|---|---|---|
| start, end, counted seconds, day | `timer_sessions` | have them |
| the pause log: a list of {from, to}, oldest first | `timer_sessions.pauses` | NULL = "not known" |
| the time zone of the session (e.g. Asia/Calcutta) | `timer_sessions.tz` | NULL = "not known" |

- **DECIDED:** NULL means "not known" and an empty list `[]` means "no pause". They are never mixed up.
- **DECIDED:** an old session counts at full credit: its credited minutes equal its counted minutes (no pause detail exists for it).
- **DEFAULT (found on 17 Oct 2026 in the first real test):** Hold to end session pauses the session before the stop alert opens. So every session ended with the hold has one LAST entry in its pause log: the seconds spent on the alert, closed at the end of the session. That last entry has `to` equal to the session's `ended_at`.
  - A pause whose `to` equals `ended_at` is the stop alert at the end. It is NOT a break. It does not end a stretch (nothing follows it), it is not counted in the number of pauses, and it is not a sign of life (section 5): the last stretch of the session ends at the moment Hold paused it.
  - A pause that went on after GO BACK IN has a `to` before `ended_at`. It is a real break, like any other pause.
- **DEFAULT:** the day of a session is the saved `day` column. The score never works the day out again from the time zone. The browser may report the same zone under two names (Asia/Calcutta and Asia/Kolkata): the time zone is never compared as text.
- **NOT saved yet (on purpose):** the tag and the check-in times ("still working?" taps). Their columns are added by the packets that build the tag and the tap, with `add column if not exists`, using the same rule: NULL for sessions saved before, `[]` for none.

## 3. Where the score is worked out

- **DECIDED:** raw sessions are kept. The score is worked out FROM them, in one place, so a day that was never opened still has a score, and a change of rule can re-score past days.
- **DEFAULT:** the one place is the database (a SQL function that works out a day from its sessions). The app does not copy the rules. It shows what the database sends. This avoids two copies of the same maths that must be kept equal (the way the timer maths copies the database today, CONNECTIONS.md C26).
- **DEFAULT:** the score is worked out when it is asked for, not stored per day. A stored copy can be added later without losing anything.
- **DEFAULT:** only saved sessions count. The running session is added when it is saved.

## 4. How a session is turned into credited minutes

### 4a. Stretches

- **DECIDED:** an unbroken stretch is a run of counted time with no break inside it. A session is cut into stretches by its pauses.
- **DECIDED:** a break is a break. Pressing Pause and ending the session both end a stretch. Ending a session and starting a new one is a break too: stretches never join across sessions.
- **DEFAULT:** every pause ends a stretch, even a short one. There is no attempt to tell a short break from a distraction. (A refinement, "pauses under a minute are not breaks", can be added later if it feels unfair.)
- The stretches of a session, from its pause log:
  - from the start of the session to the `from` of the first pause;
  - from the `to` of each pause to the `from` of the next one;
  - from the `to` of the last pause to the end of the session, unless that last pause is the stop alert at the end (see section 2).
- A session with no pause (`[]`) is one stretch. An old session (NULL) is one stretch.

### 4b. The credit of a stretch ("credited minutes")

- **DECIDED (shape):** every counted minute is credited between 0.75 and 1.0, depending on how long the unbroken stretch around it is.
- **PLACEHOLDER (numbers):**

      credit of a stretch = 0.75 + 0.25 x (stretch minutes, at most 45) / 45
      credited minutes of a stretch = stretch minutes x credit

  A stretch of 45 minutes or more gets 1.0. A stretch near zero gets 0.75. Examples: 3 min = 0.767, 5 min = 0.778, 6.7 min = 0.787, 30 min = 0.917, 45+ min = 1.0.
- 45 is the line GO BACK IN already uses. Nobody has written down why that line is 45. Hari may change it (30, where "deep" starts, is the other candidate).
- 0.75 is a placeholder: Hari said "less" for an hour with more breaks, not "much less".
- **DECIDED:** the credited minutes of a day can never be more than its counted minutes, and never below 0. There is no negative number, no -5, and no "two thirds for the next session" rule any more.
- **DECIDED:** the day number is the sum of the credited minutes of all its CONFIRMED sessions (section 5). It has no upper limit other than the per-session cap.

### 4c. The cap

- **PLACEHOLDER:** one session credits at most 180 counted minutes, whatever its quality step.
- **DEFAULT:** the cap is applied stretch by stretch in time order from the start. The stretches are kept until 180 counted minutes are used, and the stretch that crosses the line is cut there. The credit is worked out on the cut stretch.
- **DEFAULT:** minutes above the cap are shown next to the day ("+40 min over the cap"). They are never scored.
- **DEFAULT:** the cap also applies to old sessions. (Some old sessions are many hours long: each is cut to 180 minutes. Delete any that were only tests.)

## 5. Forgotten and very long sessions

**The problem:** a forgotten timer must never raise the day number, and a real long session that Hari never touched must not be thrown away.

- **DECIDED:** the cap (4c) is the safety net, plus a rare, light "still working?" tap.
- **DECIDED:** an unconfirmed session waits on the side. It is shown next to the day ("+180 min unconfirmed") and is NOT added to the day number until it is confirmed.

### 5a. Windows and the check

- **DEFAULT:** a **window** is a piece of RUNNING time. It starts at Start, at Resume, or at a tap on "still working?". It ends at a Pause, at a tap, or at the end of the session. Paused time is never part of a window.
  - So a session left paused for hours has no long window and no risk: paused time counts nothing.
  - The stop alert's own pause at the end is not a Pause for this rule and not a tap. The last window ends at the moment Hold paused the session. (Otherwise the hold would reset the clock by itself and the rule would never fire.)
- **DEFAULT, the check:** when a window reaches 120 minutes, the Pro Timer screen shows a small line "still working?". One tap. It is not a takeover, and it never pauses or stops the clock. A tap starts a new window. The time of each tap is saved as a check-in time.
- **DEFAULT, a long window** is a window of MORE than 150 minutes. Exactly 150 is not long.

### 5b. Ending a session that has a long window (new in version 2)

- **DEFAULT:** Hold to end and the stop alert work as today. Tapping **I'M DONE** on a session that has a long window opens one more question: **"Was all of this real work?"**
  - **Yes, all of it:** the session is confirmed and counts at once, up to the cap.
  - **No, I stopped at...:** Hari picks the time he really stopped (a clock time, not a number of minutes). The session is cut there: its end becomes that time, a pause that was open at that time is closed there, pauses after it are dropped, the counted seconds are worked out again, and the credited minutes are worked out on the cut session. If the cut leaves under 60 seconds, nothing is saved (the 60 second rule).
  - Answering confirms what is kept. No second question follows the cut.
  - The time Hari picks must lie inside the session. The app cannot check anything else: it is his word.
- **DEFAULT:** when a session is cut, the ORIGINAL end moment is saved too (a session cut at 60 minutes that was held 5 hours later can still be recognised as a forgotten session). This fact cannot be recovered later, so the packet must save it from the first day.
- **DEFAULT:** the question is asked only at I'M DONE. GO BACK IN asks nothing: the session stays paused.
- **DEFAULT, midnight:** a session that ran past local midnight is cut at midnight as today, and the question is about the part before midnight.
- **Needs a change to how the database ends a session** (the function timer_end must take the answer and the stop time). That is one of the first packets after this file.

### 5c. Unconfirmed: only when no answer could be asked

- **DEFAULT:** a session that has a long window and is saved WITHOUT an answer is unconfirmed as a whole. That happens when the question could not be asked or answered: the app was closed during the stop alert, an old copy of the site in a phone browser ended it, or the call failed. It waits on the side: shown next to the day, not in the day number.
- **DEFAULT, confirming later:** a day shows its unconfirmed sessions. For each one Hari can confirm it as it is (it counts, up to the cap), cut it at a time he picks (same as 5b), or delete it. A confirmed session is added to ITS OWN day, and that past day is re-scored from the raw sessions. The screen for this is a later packet.
- **DEFAULT, the rule starts later:** the check, the question and the unconfirmed rule only apply to sessions saved after the packet that builds them. Older sessions (no check-in list, NULL) are confirmed, because nothing can say otherwise. Until that packet exists, a forgotten timer is saved in full as today (cut at midnight, capped at 180 for the score), and a wrong session can be deleted in Supabase.
- **DEFAULT, nothing ends a session by itself.** A session left running or paused waits for Hari.

### 5d. Examples

| What happened | What the rule does |
|---|---|
| 2 hours, no tap, then I'M DONE | longest window 120, not long: counts 120 credited minutes |
| exactly 150 minutes, no tap | not long (not more than 150): counts 150 |
| 160 minutes, Hari was there, I'M DONE | long window, so the question comes: "Yes, all of it" counts 160 at once |
| 60 minutes of real work, then forgotten, I'M DONE 5 hours later | the question comes: "No, I stopped at ..." cuts it at 60: 60 credited, the 5 forgotten hours never touch the day |
| 3 hours with one tap at about 2 hours | windows of 120 and 60: no long window, counts 180 (the cap) |
| paused at 60 minutes, left paused 5 hours, then I'M DONE | no long window (paused time is not a window): counts 60 |
| a forgotten 6-hour timer, ended with the app closed or by an old copy of the site | saved unconfirmed: +N min waiting, 0 in the day, confirmed or cut or deleted later |

## 6. What Hari sees for a day

- **DECIDED:** the number is the credited minutes (section 4). The old points, the old grade words and the old bands (0-24, 25-44, ...) are retired: they did not fit each other.
- **DEFAULT:** the day number is shown as whole minutes. It is worked out exactly (in seconds) and rounded only for display.
- **DECIDED:** shown next to the number, never scored: the longest unbroken stretch, the number of sessions and how many were short (under 10 minutes, the existing "meh" line, for this readout only), counted minutes divided by elapsed minutes (this one also works for old sessions), the unconfirmed minutes waiting, and the minutes over the cap.
- **DECIDED:** the word for the day compares the day with Hari's own usual.
  - **DEFAULT:** the usual is the middle day (the median) of the 7 most recent earlier days that had confirmed sessions. A day that is being scored is not part of its own usual, so a re-scored past day uses only the days before it. One huge or forgotten day cannot pull the usual up.
  - **DEFAULT:** until there are 7 earlier days with sessions, there is no usual, and a stand-in usual of 60 minutes is used. So there is only one set of rules.
  - **PLACEHOLDER (the words and the edges):**

| Day number compared with the usual | Word | At the stand-in usual of 60 min |
|---|---|---|
| no confirmed session, nothing waiting | NO SESSION | 0 |
| no confirmed session, something unconfirmed waiting | NOTHING CONFIRMED YET | 0 |
| under 50% | LIGHT | under 30 |
| 50% to under 80% | BELOW USUAL | 30 to under 48 |
| 80% to under 120% | USUAL | 48 to under 72 |
| 120% to under 150% | ABOVE USUAL | 72 to under 90 |
| 150% and more | BIG | 90 and more |

  - The number itself has no step. The word is a band, so it changes at the edges. That is accepted for a word.
- **Known weak spot:** if Hari's days slowly get shorter, the usual follows them down and the word stays calm. A fixed floor beside the usual can cover that. That belongs to the streak talk (section 8).

## 7. The seven days, run through these rules

(Days 4, 6 and 7 are Hari's. Days A to D are stand-ins from the talk. Stand-in usual 60 minutes.)

| Day | What happened | Credited minutes | Word |
|---|---|---|---|
| 4 | four 5-min sessions and one 60-min | 4 x 5 x 0.778 = 15.6, plus 60 = **75.6** | ABOVE USUAL |
| 6 | 60 counted, one 2-min pause (30 + 30) | 2 x 30 x 0.917 = **55.0** | USUAL |
| 7 | 60 counted, eight 5-min pauses | 9 x 6.67 x 0.787 = **47.2** | BELOW USUAL |
| A | one forgotten 6-hour timer, never confirmed | cut to 180, unconfirmed: **0** (+180 waiting) | NOTHING CONFIRMED YET |
| B | ten 3-min sessions | 30 x 0.767 = **23.0** | LIGHT |
| C | two 45-min sessions | 2 x 45 x 1.0 = **90.0** | BIG |
| D | one 30-min session | 30 x 0.917 = **27.5** | LIGHT |

One hour in one go = 60. One hour as 25 + 25 + 10 = 52.5. Worst case, only tiny stretches: 75% of the counted minutes.

Hari's Days 1, 2, 3 and 5 were not in the files. Send them and the planner re-runs this table.

## 8. Parked (not part of the day score, not decided)

- A cut for "too many short sessions" (parked: short time already earns a bit less per minute, and there is no step at 10 minutes).
- Streaks and floors (keep the seven floors, a rolling average, a weekly view, forgiving streaks, or none).
- The tag list, and whether tags ever get a weight (today: saved, no effect on the score).
- Sick days, travel days.
- The Path (exercise only or general) and wake-up logging.
- How Overview and Calendar show the result.
- Whether a "real session" is 10 or 45 minutes (not needed for the day number; needed only if streaks count real sessions).

## 9. Cheap and expensive to change

- **Cheap:** every number and word in sections 4 to 6 (0.75, 45, 180, 120, 150, 50/80/120/150%, the words, the 7-day window, the stand-in 60). The raw sessions are kept, so past days are re-scored.
- **Expensive, and now covered:** which facts are saved per session. The pause log and the time zone are saved since Packet 09A. A session saved before it cannot get its pauses back.
- **Still to come:** the tag and the check-in times start empty until the packets that build them.

## 10. Check these first (the defaults that change the feel the most)

1. A pause that ends exactly at the end of a session is the stop alert, not a break (section 2).
2. A window of more than 150 minutes of running time without a tap is "long", and the "still working?" check appears at 120 (section 5a).
3. The cap of 180 counted minutes per session, also for old sessions (section 4c).
4. The word table and the stand-in usual of 60 minutes (section 6).
5. The score is worked out in the database, from raw sessions, when asked (section 3).
6. When Hari ends a long session the app asks "Was all of this real work?", and he can give the time he really stopped. The session then counts at once. Only a session ended without an answer waits as unconfirmed (section 5b and 5c).

## 11. What comes after this file (a suggestion, the order is not decided)

1. The day score in the database: a function that works out the credited minutes and the readouts of a day from its sessions, with tests.
2. The app reads it (a call and its checking, then a place on a screen).
3. The "still working?" tap and the check-in times, and the end question with the stop time (this changes timer_end, and it saves the original end moment of a cut session).
4. Confirming an unconfirmed session (the list on the day, with Confirm, Cut and Delete).
5. Tags.
