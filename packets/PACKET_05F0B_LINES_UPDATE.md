# PACKET 05F0B: THE FINAL LINES OF THE STOP ALERT AND THE COMEBACK LINES (UPDATES PACKET 05F0: 176 + 120 LINES, THE CHOICE OF A COMEBACK LINE, TESTS FOR THE CLAIMS ABOUT THE BALL AND THE RAYS; NO SCREEN CHANGE)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 05F0 (the first version of the lines, 53 lines), which is already in the project. Step 0 checks that the four files of Packet 05F0 are there exactly as that packet wrote them. If not: **STOP**.
- Replace the WHOLE content of ONLY these two files, each with exactly the block written in its step: `src/lib/stopAlertLines.ts`, `src/lib/stopAlertLines.test.ts`. Edit ONLY these three map files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Change NO other file. `src/lib/lineMarkup.ts` and `src/lib/lineMarkup.test.ts` stay exactly as they are. No screen, no css, no component and no hook is touched by this packet: nothing imports these files yet.
- Do NOT create any helper script, `.ps1` file, note or temp file anywhere. Write the two files with your file-writing tool (put exactly the block in the file, nothing added, nothing left out, no changed quotes). Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/lib/timerMaths.ts`, `src/lib/ballLook.ts` and `src/lib/backgroundLook.ts` are read by the new tests and are NOT changed. The library components (`SideRays.tsx`, `MetaBalls.tsx`, `CrystalizedBall.tsx`, `HoldButton.tsx`, `BlurText.tsx`) are never opened for editing.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any other install. This packet needs none. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 7 is allowed.
- Every "find and replace" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines, and keep the line endings of a file as they are (a new line gets the same line ending as the line next to it; `CODE_MAP.md` and `PROGRESS.md` use Windows line endings, `CONNECTIONS.md` uses plain line feeds).
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
Packet 05F0 put the first 53 lines of the stop alert in the project. This packet replaces them with the final words, and adds the comeback lines. It does NOT show anything yet: no screen, no button, no database call changes, so the Pro Timer looks and works exactly as before. The alert itself and the comeback message come in later packets.

**The lines.** The stop alert now has 176 lines (22 in each of the eight banks) and there are 120 comeback lines (20 in each of the six banks of the sessions that can go back in, under 45 minutes; the sessions of 45 minutes and more cannot go back in, so they have none). The comeback lines are what the owner sees for a few seconds after pressing GO BACK IN. All lines were approved by the owner. Four of them have the smallest possible change in wording, because the approved wording was false in the app (the table at the end of this file says which and why).

**The choice of a comeback line.** A new function `pickComebackLine` works like `pickStopLine` (shuffled, no line twice before all lines of the bank were shown, a new round never starts with the line that ended the old one), with queues of its own, and gives `null` for a session that cannot go back in.

**The tests** grow from 21 to 35 in `stopAlertLines.test.ts` (14 more; `lineMarkup.test.ts` is unchanged with its 17). They now also pin: that every bank has at least 20 lines; that no line is written twice; that only plain keyboard characters are used; that the comeback banks are exactly the sessions that can go back in (every second up to 100 minutes); that the word "milestone" is never used (it is the name of the timer's messages at other minutes); that the words sixty and ten are used only where they are the next cut-off; that no line of a bank without GO BACK IN says "back in"; and that every sentence about the glowing ball or the rays is true for every second of its bank, asked from the real functions `ballStep` and `bgLight`, so a later change of a colour step shows which lines to read again.

**The docs.** The rows `AB:TIMER.TESTS` and `AB:TIMER.ALERT-LINES` in `CODE_MAP.md` get new text; the sentence in C27 and the entries C41 and C42 in `CONNECTIONS.md` are replaced by the final versions (C41 now has 13 anchors instead of 8, so the checker reads 254 anchors instead of 249); `PROGRESS.md` gets one new line after the line of Packet 05F0.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `src/lib/timerMaths.ts`, `src/lib/ballLook.ts`, `src/lib/backgroundLook.ts`, `src/lib/lineMarkup.ts`, `src/lib/lineMarkup.test.ts`, `src/lib/stopAlertLines.ts`, `src/lib/stopAlertLines.test.ts`. If any is missing: **STOP** and report which. If one of the four `lineMarkup` / `stopAlertLines` files is missing, Packet 05F0 has not been run: say exactly that in your report.

Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/lib/lineMarkup.ts","src/lib/stopAlertLines.ts","src/lib/lineMarkup.test.ts","src/lib/stopAlertLines.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these four lines (the files as Packet 05F0 wrote them):
```
src/lib/lineMarkup.ts 4320574c170ef64ba120b8a0584384c80c115bab39bb562bb52784d283aff743
src/lib/stopAlertLines.ts a3894ab1d00776ec790c2cc309f258e3f96e33fb89be411e2fa8455919e01b7b
src/lib/lineMarkup.test.ts f99ff83631e12c5f6f9464377f925ef7bcebe8a7e6cbfb77e0047c70cbb6b2ef
src/lib/stopAlertLines.test.ts f46ed20874f93f1d892ce5aa943f5b9448985bfaa9e49e42e27e934d941c60e0
```
If it prints anything else: **STOP** and report the RAW output. If the second line ends with `39cef7509e35...` instead, this packet was already run: say exactly that.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 05F0):
```
TAGS OK: 28 tags, 50 places
CONNECTIONS OK: 42 connections, 249 anchors, 36 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md` or one of the four `lineMarkup` / `stopAlertLines` files shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -20`. One of the twenty lines must contain the text `Packet 05F0`. If none does: **STOP** and report the COMPLETE output (Packet 05F0 was not committed).

Run:
```
npm test
```
It must finish with a line `Test Files  12 passed (12)` and a line `Tests  603 passed (603)`. If not: **STOP** and report the last 12 lines of the output.

Run this ONE command (it prints the lines of `timerMaths.ts` that the lines depend on):
```
Select-String -Path src/lib/timerMaths.ts -Pattern "^export const (MIN_SESSION_SECONDS|SOLID_FROM_SECONDS|DEEP_FROM_SECONDS|FLOW_FROM_SECONDS|GO_BACK_IN_LIMIT_SECONDS) = |^export function (wholeSeconds|canGoBackIn)\(" | ForEach-Object { $_.Line }
```
It must print exactly these 7 lines, in this order:
```
export const MIN_SESSION_SECONDS = 60
export const SOLID_FROM_SECONDS = 600
export const DEEP_FROM_SECONDS = 1800
export const FLOW_FROM_SECONDS = 5400
export const GO_BACK_IN_LIMIT_SECONDS = 2700
export function wholeSeconds(value: number): number {
export function canGoBackIn(seconds: number): boolean {
```
If it prints anything else: **STOP** and report the RAW output.

Run this ONE command (it prints the lines of the ball and of the rays that the new tests ask):
```
Select-String -Path src/lib/ballLook.ts,src/lib/backgroundLook.ts -Pattern "^export function (ballStep|bgLight)\(|^export const BG_LIGHT_FULL_AT_SECONDS = " | ForEach-Object { $_.Line }
```
It must print exactly these 3 lines, in this order:
```
export function ballStep(seconds: number): 0 | 1 | 2 | 3 {
export const BG_LIGHT_FULL_AT_SECONDS = FLOW_FROM_SECONDS
export function bgLight(seconds: number): number {
```
If it prints anything else: **STOP** and report the RAW output. The tests of this packet ask these functions whether the sentences about the ball and the rays are true.

Then run these read-only commands. Do NOT stop on their results and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. This ONE command (information only: the planner wants the fingerprint of `timerMaths.ts` for the record):
```
foreach ($f in @("src/lib/timerMaths.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

## STEP 1: Replace the whole content of `src/lib/stopAlertLines.ts`
The old file has 53 lines in eight banks; the new file has 457 lines (176 stop alert lines, 120 comeback lines and the code that chooses one). Replace the ENTIRE content of the file `src/lib/stopAlertLines.ts` with exactly this content:

```ts
import { fillSlots } from "@/lib/lineMarkup"
import {
  DEEP_FROM_SECONDS,
  FLOW_FROM_SECONDS,
  GO_BACK_IN_LIMIT_SECONDS,
  MIN_SESSION_SECONDS,
  SOLID_FROM_SECONDS,
  wholeSeconds,
} from "@/lib/timerMaths"

// AB:TIMER.ALERT-LINES:START
// The lines the stop alert shows after Hold to end session, the comeback lines (shown for a few seconds after GO BACK IN), and the choice of one line of each kind. Pure functions: no screen, no clock of its own (the random numbers are handed in, so the tests can fix them).
// Both kinds of lines are grouped in banks by the length of the session when it was stopped. The banks are named by their minutes (from5 = 5 minutes and more), never by the quality words of the timer, because the cut-offs are not the same (see CONNECTIONS.md C41). The stop alert has eight banks. The comeback lines have six: only the banks of sessions shorter than 45 minutes, because only those sessions can go back in.
// Every line uses the marks of lineMarkup.ts (see CONNECTIONS.md C42): {n}, {time} and {left} are filled with the real numbers of the session, and [effect:words] marks the keywords that get an effect when the line is shown.
// Rules that every line follows (the tests of stopAlertLines.test.ts check them): a number written in a line is a cut-off and is true for the bank it sits in; "flow" is only said from 90 minutes; the word "milestone" is never used (it is the name of the messages of MILESTONE_MINUTES); a line about the glowing ball or the rays of light is true for every second of its bank (the tests ask ballStep and bgLight); a line never says the time of day, how many sessions there were before, or that a saved session counted for nothing; no line of a bank without GO BACK IN says "go back in"; every line has one to three marked keywords.
// The automated tests are in src/lib/stopAlertLines.test.ts. Run them with: npm test

export type BankId = "under1" | "from1" | "from5" | "from10" | "from20" | "from30" | "from45" | "from90"

// From the shortest session to the longest.
export const BANK_IDS: readonly BankId[] = ["under1", "from1", "from5", "from10", "from20", "from30", "from45", "from90"]

// The banks of the sessions that can go back in (under 45 minutes). The banks from45 and from90 have no comeback lines, because GO BACK IN is not offered to them (see CONNECTIONS.md C41).
export type ComebackBankId = Exclude<BankId, "from45" | "from90">
export const COMEBACK_BANK_IDS: readonly ComebackBankId[] = ["under1", "from1", "from5", "from10", "from20", "from30"]

// The seconds from which each bank is used, from the longest bank to the shortest. Five of the edges are cut-offs of the timer and are imported, never written again (C41); the banks from5 and from20 have edges of their own (5 and 20 minutes).
const FROM_SECONDS: readonly (readonly [BankId, number])[] = [
  ["from90", FLOW_FROM_SECONDS],
  ["from45", GO_BACK_IN_LIMIT_SECONDS],
  ["from30", DEEP_FROM_SECONDS],
  ["from20", 20 * 60],
  ["from10", SOLID_FROM_SECONDS],
  ["from5", 5 * 60],
  ["from1", MIN_SESSION_SECONDS],
]

// The bank of a session of this length. Under 60 seconds the timer does not save the session, and that has its own bank (under1).
export function bankIdFor(seconds: number): BankId {
  const s = wholeSeconds(seconds)
  for (const [id, from] of FROM_SECONDS) {
    if (s >= from) return id
  }
  return "under1"
}

// Whether a bank has comeback lines (it does exactly when its sessions can go back in).
export function isComebackBank(id: BankId): id is ComebackBankId {
  return (COMEBACK_BANK_IDS as readonly BankId[]).includes(id)
}

// The lines of the stop alert.
export const STOP_ALERT_BANKS: Readonly<Record<BankId, readonly string[]>> = {
  // Under 60 seconds: not saved. GO BACK IN is offered.
  under1: [
    "Under a minute, so nothing was saved. That wasn't a session. That was a [shake:tap].",
    "Not even one minute. The timer won't save it, and your future self won't [ghost:remember it].",
    "A minute is the minimum. You didn't reach it. [heat:Go back in], or admit you only came to look.",
    "Nothing to save. You pressed start and [shake:lost your nerve]. [heat:Go back in] and make it count.",
    "Under a minute. That wasn't a decision to stop. That was a [shake:flinch].",
    "You opened the door, looked inside and [ghost:closed it]. Nothing saved. [heat:Go back in].",
    "Sixty seconds is the entry fee. You didn't pay it. [heat:Go back in] and pay it.",
    "The clock caught you. Nothing saved, nothing lost, except the [heat:momentum]. Get it back.",
    "BREAKING: Local person starts working, stops working, and [ghost:nobody saw]. Sources say it was fine. It was not fine.",
    "Congratulations. You've completed the world's shortest [strike:productivity journey]. It had no middle.",
    "You held a button down on purpose to quit. Imagine that [heat:commitment] pointed at the work.",
    "That wasn't a session, it was a [ghost:rumour]. The timer is declining to comment.",
    "I'm a timer. I have exactly one job. You had one job too. [shake:Awkward.]",
    "Somewhere a [glow:future you] just checked the calendar and found nothing. Go back in and give them something.",
    "Your focus clocked in, looked around, and filed a [strike:resignation]. Nothing saved. [heat:Go back in] and revoke it.",
    "The only thing you finished in that time was [shake:quitting]. Top marks for speed.",
    "In a movie, this is where the audience whispers [shake:don't do it]. You did it. Go back in and fix the plot.",
    "Under a minute is not a session, it's a [ghost:sneeze]. Bless you. Now go back in.",
    "Your focus muscle just did one rep and asked for a [strike:medal]. Denied. [heat:Go back in].",
    "Even a warm-up has a [glow:workout] afterwards. You skipped to the cool-down.",
    "The clock saw you, you saw the clock, and you both agreed to [ghost:never speak of this]. [heat:Go back in] anyway.",
    "Plot twist: the work didn't go anywhere. It's [glow:right there], exactly where you left it. [heat:Go back in].",
  ],
  // 1 to 4 minutes. GO BACK IN is offered.
  from1: [
    "You sat down, opened the timer, felt like you did something, and left. That's not work. That's [strike:cosplay].",
    "A [shake:microwave] runs longer than your [ghost:focus span] just did. Think about that.",
    "You spent more time [shake:deciding] to start than you spent actually working. That's a skill, just not a useful one.",
    "Your attention span is losing to a goldfish right now. The goldfish is [glow:winning]. By a lot.",
    "You opened this app, felt productive, did nothing, and closed it. Your brain is running the most expensive [strike:scam] on you.",
    "That wasn't a session. That was a [strike:preview]. Nobody builds anything from previews.",
    "The activation energy to start was higher than everything you did after. You burned [heat:jet fuel] to go one metre.",
    "{time}. That's how long you lasted. The [shake:urge] lasted longer.",
    "You didn't lose to a distraction. You lost to the [strike:idea] of one. It hadn't even arrived.",
    "Starting was the hard part, and you did it. Then you [shake:flinched]. [heat:Go back in] and finish what you started.",
    "The ball was still white. Nothing had even started to [glow:change].",
    "{time} in, and your focus left a note on the door: [ghost:back in five]. It has not come back.",
    "In nature documentaries this is where the narrator says the human has [shake:abandoned the task] after {time}. Tragic. Beautiful. Mostly tragic.",
    "The timer is not mad. The timer is [ghost:just disappointed], in a very small voice, at the {time} mark.",
    "{time}: roughly enough to [shake:open six tabs] and read none of them. You skipped the tabs and went straight to quitting.",
    "You didn't quit. You [strike:strategically stepped away] from the work at {time}. Bold leadership.",
    "That's one small step for a person, one giant [shake:leap backwards] for the session.",
    "Your attention span called. It said [ghost:not now], and also not later.",
    "The ball hadn't even finished warming up. It's [glow:white], hopeful, and confused.",
    "Think of the {time} as a trailer. The movie is [heat:right there]. Press the button. Watch the movie.",
    "Your future self asked how it went. Tell them [shake:{time}]. Watch their face.",
    "Nobody has ever been proud of an [ghost:almost-session]. [heat:Go back in] and break the streak.",
  ],
  // 5 to 9 minutes. GO BACK IN is offered.
  from5: [
    "You spent longer heating yesterday's food than you just spent on your [glow:future]. Interesting priorities.",
    "Your phone waited {time}. It survived. You [shake:couldn't].",
    "Under 10 minutes is [ghost:warm-up], not work. You gave it {time}. Not even close.",
    "That's not a session. That's a [strike:false start]. You warmed up and went home.",
    "You paid the full cost of starting and got [ghost:almost nothing] back. Worst return on effort you could pick.",
    "Your future self is watching this and [shake:shaking his head]. He doesn't have words for this.",
    "Even distracted, broken work needs [heat:ten minutes] to mean anything. You gave it {time}. Do the math.",
    "You just interrupted yourself before your brain even knew you'd started. That's not quitting. That's not even [ghost:beginning].",
    "You came here to work and left after {time} of [strike:thinking about it].",
    "At 10 minutes the ball takes its first colour. You stopped at {time}, still [ghost:white].",
    "Every long session has a point where quitting would have been easy. You found yours at {time}. [shake:Early.]",
    "Welcome to {time}: the official [shake:valley of regret]. It's a small valley. You could have walked out the other side.",
    "You made it {time} into the [glow:wilderness] and chose the nearest exit. Admirable sense of direction, wrong direction.",
    "The ball is still white. Colour starts at ten minutes, and you stopped at {time} with a [ghost:very pale] ball.",
    "{time} of work and a [strike:stunning] amount of looking for reasons to stop.",
    "Please don't call that a break. A break is what happens after [heat:work].",
    "You vanished after {time} like a [ghost:waiter] when someone mentions the bill.",
    "If excuses were a sport you'd [glow:medal] by now. The work, however, is still waiting.",
    "{time} in, and your brain sent an urgent memo titled [shake:Anything But This]. You approved it without reading.",
    "Ten minutes is the first colour step. You stopped at {time} and called it a [strike:pilot episode]. The show was never picked up.",
    "This was less a session than a [strike:dress rehearsal] for a session. The real one is on standby.",
    "Your attention span just ran a [shake:quarter-marathon] and collapsed at the first corner.",
  ],
  // 10 to 19 minutes. GO BACK IN is offered.
  from10: [
    "Your brain was just starting to clear the residue from your last distraction. You stopped it mid-process. Now you have to [shake:start over].",
    "You made it past the hardest part (actually starting) and quit before it became a [glow:real session]. That's the move.",
    "Attention takes minutes to come back after a distraction. You got to {time}, turned around, and went back to distracted. [shake:Voluntarily.]",
    "You had a {n}-minute [ghost:warmup] and called it a workout. Gyms would go out of business with that logic.",
    "Here's what you just did: paid the full cost of starting. Collected none of the benefit. Filed for [shake:bankruptcy] on your own time.",
    "The first stretch of a session is the worst. You quit before it got [glow:good]. Brilliant strategy.",
    "{n} minutes is not a session. {n} minutes is the brain warming up. You left the car running and [ghost:never drove anywhere].",
    "Nobody hands out a [glow:real session]. You [heat:earn] it, minute by minute. You stopped at {time}.",
    "The ball had just found its [glow:colour] and you [shake:pulled the plug].",
    "{time}. Enough to start something. Not enough to [heat:finish] it. The worst size a session can be.",
    "Everything past this point is the part you [ghost:skipped]. It was waiting for you.",
    "You carried it this far. Putting it down now is the [shake:expensive] choice.",
    "{time} in, and you finally got past the [shake:awkward small talk] with the task. Now it's ready to say something real. You left.",
    "You cleared the warm-up and walked off before the [heat:main event]. The crowd had snacks.",
    "That was {time} of momentum, carefully [shake:dismantled]. Impressive craftsmanship.",
    "At this point the work knew your name, and you [ghost:ghosted it]. Rude.",
    "I'm sure the [strike:urgent thing] was urgent. Urgent things usually have [shake:better timing].",
    "{n} minutes of work, then a sudden [shake:fire drill] in your head. Everyone evacuated. The task is still in the building.",
    "Your attention was on a roll and you tripped it with a [shake:stop button]. Specifically the one you had to hold.",
    "Productivity gurus would tell you to [heat:trust the process]. The process is {time} old and wants to meet its second half.",
    "The ball changed colour once in {time}. Your [strike:excuse] hasn't changed at all.",
    "You've reached the point where the work [glow:starts to like you]. Awkward time to break up.",
  ],
  // 20 to 29 minutes. GO BACK IN is offered.
  from20: [
    "You were {left} away from this session actually meaning something. {left}. And you [shake:chose] not to.",
    "The threshold is 45 minutes. You made it to {time} and stopped. That's not a [glow:real session]. That's a [strike:rehearsal].",
    "You spent the hard part of the session (getting into it) and left before the part where [rise:work actually happens]. Genius.",
    "A full {time} of '[strike:I'll just check one thing.]' How'd that work out? Right.",
    "You just handed the dopamine system exactly what it wanted. A quick hit and an exit. It's [shake:laughing at you] right now.",
    "{time} logged, no real session. Your brain's [glow:scorekeeper] isn't fooled.",
    "You got close enough to feel like you tried. That's the worst outcome. You feel okay and the real session [ghost:never happened].",
    "A [glow:real session] is not handed to you. You [heat:earn] it. You stopped {left} short.",
    "{time} in, and you turned back. The [glow:other side] was {left} away.",
    "The hard part is behind you. What's ahead is {left} of just [heat:continuing].",
    "You didn't run out of time. You ran out of [shake:nerve], {left} short.",
    "A [glow:real session] is 45 minutes. You gave it {time}. The gap isn't talent. It's [heat:stubbornness].",
    "{time} in. The ball has changed colour once and wants to do it again. You [shake:hit the brakes] at a green light.",
    "{left} is the distance between you and a [glow:real session]. It's about one [strike:long argument with yourself].",
    "You've done enough to [shake:feel guilty] and not enough to feel proud. That's a very specific kind of [strike:achievement].",
    "{time}: long enough to be [glow:good], short enough to be [ghost:forgotten]. A genius little loophole.",
    "Your brain pitched you a [strike:five-minute break] and you bought it. It's a timeshare. You'll be there forever.",
    "{left} to go and you're treating it like a [shake:bear]. It's not a bear. It's a [heat:task] in a costume.",
    "You climbed for {time} and decided the [ghost:view from here] was good enough. It's fine. It's not the summit.",
    "The ball has one colour behind it and two ahead. You've parked in the [ghost:middle], which is where [strike:excuses] go to live.",
    "{left} is less than a [heat:film] but more than a [shake:commercial break]. You picked the commercial break.",
    "Quitting at {time} is how people end up with a [strike:dozen almost-things] and one very organised excuse folder.",
  ],
  // 30 to 44 minutes. GO BACK IN is offered.
  from30: [
    "You were {left} away. {left}. You've wasted more time deciding what to eat. [heat:Come back] and finish it.",
    "You did the hardest part, {n} full minutes of your brain working, and stopped before it became a [glow:real session]. That's not a strategy. That's [shake:self-sabotage].",
    "{left}. You were {left} from a [glow:real session]. Your phone buzzed once, didn't it.",
    "Past halfway, and you stopped anyway. The threshold doesn't care [ghost:how close you got].",
    "You burned {time} of activation energy and left before collecting the output. [shake:Classic move.]",
    "{time} of your brain at work, and no [glow:real session] to show for it. The threshold is 45.",
    "{time}. {left} [shake:short] of a real session. You'll think about this one. You should.",
    "The dopamine system just convinced you to quit {left} before the [heat:payoff]. It does this every time. You let it, every time.",
    "You're {left} from a [glow:real session] and you're reaching for the [shake:stop].",
    "[strike:Almost] is not a result. {left} short is still short.",
    "The last {left} are the cheapest of the whole session, and you're [shake:skipping] them.",
    "The line is {left} away. The line doesn't [ghost:move]. You're the one leaving.",
    "The ball has changed colour twice. It's [glow:clearly rooting for you]. Don't leave it hanging.",
    "{left} to go. That's walking distance. You're about to call a [strike:taxi].",
    "At {time}, quitting stops being a break and starts being a [shake:plot twist]. Nobody asked for the plot twist.",
    "You've built {time} of [glow:momentum]. Quitting now is a [shake:fire sale].",
    "Even a [ghost:sloth] would tell you to just keep going. And it's a sloth.",
    "You are so close that the [glow:real session] can smell you. Don't turn around. It's shy.",
    "{time} proves you can do the [heat:hard part]. {left} proves you can do the [shake:boring part]. That's the only difference.",
    "A person who can do {time} can do {left}. This is not a [strike:capability issue]. It's a vibe issue.",
    "Think of the ball. It changed colour twice for you. It's not asking for much. It's asking for {left} and a [heat:little dignity].",
    "If you stop here, the timer will log {time}, nod politely, and tell absolutely nobody that you were {left} from a [glow:real session]. It knows. You know.",
  ],
  // 45 to 89 minutes. GO BACK IN is not offered.
  from45: [
    "That counted. A [glow:real session], done. The day isn't wasted. Come back for the next one.",
    "That was real work. Not warmup. Not performance. [heat:Actual output.] Keep [rise:stacking] them.",
    "{time} of focus. Most people won't do that today. [glow:You already did.]",
    "That session counted. The question is whether you stop here or [rise:come back]. Most people stop here.",
    "{time} of focus. You [heat:earned] that. Don't hand it back to a scroll.",
    "{time}. That's a [glow:real session]. Write it down, drink some water, and don't [shake:undo] it.",
    "That was {time} of your life, spent on [heat:purpose]. Remember what that feels like.",
    "Do it again and it starts to be a [rise:habit].",
    "{time} of focus is a deposit. Don't [shake:spend] it on a scroll.",
    "{time}. That's what a [glow:real session] looks like. Frame it. Don't actually frame it, it's a timer.",
    "Your chair has requested a [shake:formal apology]. Stand up, stretch, and give it one.",
    "Whatever you were avoiding is now [ghost:much smaller]. Look at it. It's nothing. You made it nothing.",
    "{time} of focus without a single [strike:productivity hack]. Just you and the thing. Revolutionary.",
    "I'd call you a machine, but machines don't [heat:choose] this. You chose it. {time} of it.",
    "The group chat survived without you. So did the [ghost:feed]. Everything survived. You, meanwhile, got [glow:somewhere].",
    "That's {time} of your life you didn't spend [strike:optimising your routine]. And look at you now: [glow:routine optimised].",
    "Hydrate. Stretch. Resist the urge to tell everyone how it went. [glow:Quiet competence] is the better look.",
    "{time}: a whole episode's worth of focus, and nobody brought you [glow:popcorn]. Fix that.",
    "You've just [rise:stacked] one honest block of work onto the pile. The pile is getting taller. That's the whole trick.",
    "Careful. Do this a few more times and [rise:people will start calling you disciplined]. Brace yourself.",
    "Every motivational speech recommends exactly what you just did, and most of them also sell a [strike:course]. You did it for free.",
    "You don't need a victory lap. Take a [glow:short walk] instead. It's a victory lap with better posture.",
  ],
  // 90 minutes and more. GO BACK IN is not offered.
  from90: [
    "{time} of focus. That's [glow:rare]. Rest properly. Come back.",
    "That wasn't just productivity. That was your brain operating at its [glow:ceiling]. Rest is part of the protocol now.",
    "{time} in [glow:flow]. Most people won't do this once this week. You just did it today.",
    "{time} of your life, actually used. Whatever you built in there is real and it [rise:compounds].",
    "{time} of focus. You [heat:earned] every minute of it. Now go [glow:rest].",
    "{time}. At this point it isn't effort, it's a [glow:skill].",
    "{time} in [glow:flow]. Close the app, stand up, and let it [ghost:fade] on its own.",
    "The world [ghost:kept going] without you for {time}, and you built something while it did.",
    "{time} is a long time to hold one thought. You [rise:held it].",
    "{time}. At this point your chair deserves [glow:a pension]. Go outside and look at something far away.",
    "{time}. You stayed, and the [glow:flow] stayed with you. It doesn't do that for everyone.",
    "The ball changed colour three times for you. That's not decoration, that's a [glow:standing ovation].",
    "The rays reached full strength. The only other thing at full strength right now is probably your [heat:focus].",
    "{time} in [glow:flow]. Your phone filed a missing person report and then [ghost:gave up].",
    "You've been gone from everything for {time}. That used to be called [heat:concentration].",
    "If focus were a currency, you'd now be [rise:insufferable] at parties.",
    "Congratulations. You've ruined every [strike:five-minute task] for yourself. They'll never feel big again.",
    "{time} is long enough for a couple of podcasts, a nap, and a small existential crisis. You did none of those. You [heat:worked].",
    "Rest is not a reward, it's [heat:maintenance]. Now go and be [ghost:completely useless] for a bit.",
    "{time}. Your future self sends a fruit basket and a very awkward [glow:thank-you note].",
    "Legend says that if you do this often enough, [rise:the extraordinary starts to look ordinary]. The proof is on your screen.",
    "Please don't tell the other tabs how long you were gone. They have [shake:abandonment issues].",
  ],
}

// The comeback lines: shown for a few seconds after GO BACK IN, chosen by the length the session had when it was stopped. The break itself was not counted (the time on the alert is paused time), so the lines may say so.
export const COMEBACK_BANKS: Readonly<Record<ComebackBankId, readonly string[]>> = {
  // Session stopped under 60 seconds (it was not saved).
  under1: [
    "Back in. The clock picks up where you left it. [heat:Reach sixty seconds] and it counts.",
    "Back in. The time you spent on that screen wasn't counted. [heat:Make the next minute] count.",
    "Round two of the first minute. [glow:Stay.]",
    "You're back. The timer is [glow:thrilled] and trying very hard to be cool about it.",
    "Redemption arc, scene one. Please [heat:don't skip to the credits].",
    "Welcome back. Your excuse has been filed under [strike:later].",
    "Plot twist: you [glow:returned]. The audience gasps.",
    "The door was open the whole time. Good call [heat:walking back through it].",
    "Round two. Same clock, same you, [heat:different decision].",
    "Back in. The first minute is the hard one, and you've [shake:already failed it once]. Sixty seconds. Go.",
    "Think of the last few seconds as a [ghost:rehearsal]. This is the take.",
    "You've been forgiven by a piece of software. The bar was [strike:very low]. Clear it.",
    "The clock never took it personally. It's a clock. [heat:Do the work.]",
    "What happened a moment ago is [ghost:classified]. Carry on.",
    "Back in. This is the part of the movie where the [glow:music gets good].",
    "Respect for the return. A [heat:comeback] is just a quit that changed its mind.",
    "You left, you looked around, you came back. That's called [glow:research]. Now the work.",
    "The sixty seconds are waiting. They're [ghost:patient], unlike the rest of the internet.",
    "Here's a hand. Not a real one, I'm a timer. [heat:Keep going.]",
    "Reset your face, reset your posture, [heat:don't reset the clock]. It's still running.",
  ],
  // Session stopped at 1 to 4 minutes.
  from1: [
    "Back in. The break wasn't counted. [strike:The excuse] wasn't either.",
    "Welcome back. The clock waited for you. [heat:Don't make it wait again.]",
    "Back at {time}. [heat:Earn] the next one.",
    "Back at {time}. The ball is still white and still [glow:forgiving].",
    "Good. {time} was the [ghost:trailer]. Roll the film.",
    "You returned, which is the [glow:least embarrassing] option available.",
    "Whatever the emergency was, it can [ghost:wait]. It always could.",
    "Back in. The ball is still white, like a [shake:blank page]. You know what to do with those.",
    "Break's over. The [heat:work] did not move. It didn't even check its phone.",
    "You came back before the [strike:guilt] had time to set. That's elite.",
    "Apology accepted by the only one keeping score: the [glow:clock].",
    "Welcome back to {time}. Population: [heat:you].",
    "A [heat:comeback] needs something to come back from. Thanks for providing it.",
    "Back in. This time, [strike:just checking one thing] is not a plan.",
    "Round two starts at {time}. The judges are [ghost:a clock and a glowing ball]. Both are rooting for you.",
    "Look at you. Your future self just [glow:sat up].",
    "The clock didn't judge you. It can't. [heat:Judge yourself later, by doing the work.]",
    "Back in. The first few minutes are always the [shake:wobbly] ones. Wobble forward.",
    "Good call. Quitting at {time} is a [strike:beginner's move]. Continuing is a slightly less beginner move.",
    "The break wasn't counted, but the courage to come back [heat:absolutely was].",
  ],
  // Session stopped at 5 to 9 minutes.
  from5: [
    "Back in at {time}. The ball is still [ghost:white]. [heat:Change that.]",
    "Back in. The break wasn't counted. [heat:What you do next will be.]",
    "Good. {time} is a warm-up. Now do the [glow:work].",
    "{time} down, and the ball is waiting to [glow:turn colour]. It's a bit of a diva. Give it a reason.",
    "Back in. The ball is still white. Colour starts at ten minutes, and you're [heat:closer than you were].",
    "Welcome back. {time} behind you, and nothing but [glow:forward] in front.",
    "You returned. The excuse is on the floor, [strike:still twitching].",
    "Back in. Think of the break as a [ghost:very short, very pointless holiday].",
    "Oh, you're back. I mean: [glow:great to see you]. I was not worried. I'm a timer.",
    "{time} in the bank. Don't [shake:spend it on a snack run].",
    "The next minutes are [heat:cheaper] than the last ones. Turns out starting is the expensive bit.",
    "Welcome back to the [ghost:forgettable middle]. It's where all the good stuff is hiding.",
    "Reminder: ten minutes is the first colour. You're [heat:close]. The ball is [glow:ready].",
    "Back in. The break has been noted and politely [strike:ignored].",
    "Restart your confidence, keep the clock. Nobody else [glow:needs to know] about the dip.",
    "Pro tip: the best way to make leaving look intentional is to [heat:come back with a plan]. The plan is: work.",
    "That wasn't quitting, that was a [strike:very dramatic stretch]. Carry on.",
    "The work missed you. It's not [shake:clingy], it's just next to you. Keep going.",
    "Back in at {time}. The ball has a [glow:small request]: colour. Please provide it.",
    "Back in. The break wasn't counted, but your [heat:nerve] was noted.",
  ],
  // Session stopped at 10 to 19 minutes.
  from10: [
    "Back in at {time}. You've already paid the cost of starting. [heat:Use it.]",
    "Back in. The break wasn't counted. The [glow:session] is still yours.",
    "{time} in, and you came back. That's the [rise:part] that matters.",
    "The ball kept its colour. It's [glow:loyal]. Unlike your attention. Kidding. Mostly.",
    "Back in at {time}. You've got a [heat:head start] and a ball that's already found its colour. Please don't waste either.",
    "{n} minutes of momentum, briefly [ghost:out of the building]. Welcome back, momentum.",
    "Return of the [glow:main character]. The clock is rolling. Please act natural.",
    "You left in the middle of a good thing, then came back. That's called a [heat:plot]. Keep writing it.",
    "Back in. The break wasn't counted, so technically you [strike:didn't take it]. Congratulations on your fictional rest.",
    "Whatever you did in the break, it was [ghost:short and forgettable]. Same as an advert. Back to the show.",
    "The worst is over: [glow:you came back]. The rest is just typing, thinking, and [heat:not leaving].",
    "Back at {time}. Your focus had a nap in the meantime. Let it [shake:wake up slowly], then not slowly.",
    "Please enjoy the [heat:second wind]. It's complimentary and expires if ignored.",
    "Back in. A real session is {left} away. It's just a long minute [shake:repeated]. Repeat.",
    "Nothing says [heat:discipline] like leaving and returning within the same attention span.",
    "The ball is glowing for you. It's the [glow:participation trophy] of light. Earn the real one.",
    "You've reset the mood, not the clock. [heat:Good instincts.]",
    "Welcome back, [rise:champion of the small decision]. They add up.",
    "A comeback at {time} is still a comeback. It's the [glow:movie montage] bit, with less music.",
    "Back in. If this were a game, this would be the [heat:respawn]. Same level. [shake:Fewer excuses.]",
  ],
  // Session stopped at 20 to 29 minutes.
  from20: [
    "Back in. {left} to a [glow:real session]. Nobody's watching but the clock.",
    "You came back at {time}. Now it's {left} of [heat:not leaving].",
    "Back in. The break wasn't counted. The [glow:real session] is still on.",
    "{left} to go. It's the [glow:home stretch], and you've already [heat:done the hard bit].",
    "Welcome back. The ball has changed colour once. It would like to do it again at the [ghost:next colour step].",
    "You're back at {time}. As quits go, that one was [strike:brief and very cinematic].",
    "Back in. Your future self has [shake:stopped pacing].",
    "The break was [ghost:forgettable]. The next {left} won't be.",
    "Good. {left} of work and then you may [heat:feel superior]. It's allowed.",
    "Return of the [glow:legend]. Please keep the legend part to {left}.",
    "Back in. The distance to a real session is {left}. [shake:Don't stare at the number], stare at the work.",
    "A comeback at {time} is a [glow:statement]. Please make it a sentence.",
    "The break wasn't counted, but the [heat:decision to return] very much was. Technically it wasn't. Spiritually it was.",
    "Back in. The work did not get easier while you were gone. [shake:You got braver.] Better.",
    "Back in with {left} to go. Think of it as the [rise:last stretch] of a long meeting that you're actually winning.",
    "Welcome back. You've now spent {time} on this, which is enough to be [strike:slightly embarrassed] to stop. Use that.",
    "The excuse tried for {time} and then you [heat:overruled it]. Good.",
    "{left} to go. Not nothing, not scary, [glow:very doable].",
    "Back in. The ball is one colour in and wants another. It's [heat:rooting for you], in a purely glowing way.",
    "Back in. Please keep the ratio of working to [shake:thinking about working] at a healthy level.",
  ],
  // Session stopped at 30 to 44 minutes.
  from30: [
    "Back in. {left}. You could do {left} with your [shake:eyes closed]. Keep them open, though.",
    "You came back. {left} to go. [heat:Finish it.]",
    "Back in. The break wasn't counted. [glow:Don't waste the comeback.]",
    "{left} to go. You've already done more than that. This is the [glow:easy] bit.",
    "Back in. The ball has changed colour twice and is [heat:very invested]. Don't let it down.",
    "You came back with {left} to go. That's not a comeback, that's a [strike:tiny detour].",
    "Welcome back. The finish line [ghost:didn't move]. You did, twice.",
    "Back in. {left} is about one [shake:argument with a group chat]. You'll win faster.",
    "You're {left} away from a [glow:real session]. Nobody will remember the break. [ghost:Not even you.]",
    "Back in. The hardest part of {left} is not looking at {left}. [heat:Look at the work.]",
    "The ball changed colour twice for this. It deserves a [glow:proper finish]. So do you.",
    "A [heat:comeback] this close to the end is the most dramatic kind. Don't ruin the ending.",
    "Welcome back, [rise:almost-finisher]. A tiny bit more and the title is accurate.",
    "Back in. Imagine saying you did a [glow:real session]. Out loud. In public. They'll be [shake:so jealous].",
    "You've done {time}. The break was a [ghost:plot device]. The ending is next.",
    "Back in. The stakes: {left}. The reward: the right to use the phrase [glow:real session] in public.",
    "Look who's back. The work isn't mad. It's just [ghost:waiting], arms crossed, for {left}.",
    "Back in with {left} to go. Think of it as the [rise:final level]. It always has an easy boss.",
    "The break wasn't counted, but your [heat:guilt] was noted. Let's make use of it.",
    "Back in. If you stop again I'll have to put it in the [shake:report]. I'm a timer. There is no report. [heat:Don't test me.]",
  ],
}

// ---- Choosing a line ----
// Every bank is shown in a shuffled order and no line comes twice before all lines of the bank have been shown (as in the old app). The queue of a bank is the indexes still to show (the next one is the LAST in the list) and the index shown last, so that the first line of a new round is never the line that ended the old round. The stop alert and the comeback lines each have their own queues.
export type BankQueue = { rest: readonly number[]; last: number | null }
export type LineQueues = Partial<Record<BankId, BankQueue>>
export type PickedLine = { bank: BankId; index: number; line: string; queues: LineQueues }
export type ComebackQueues = Partial<Record<ComebackBankId, BankQueue>>
export type PickedComeback = { bank: ComebackBankId; index: number; line: string; queues: ComebackQueues }

// random must give a number from 0 up to, but not including, 1 (Math.random does).
function shuffledIndexes(size: number, random: () => number): number[] {
  const list = Array.from({ length: size }, (_, i) => i)
  for (let i = size - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

// The next index of a bank of this size and the queue that is left after it. The queue that comes in is not changed.
function nextIndex(size: number, old: BankQueue | undefined, random: () => number): { index: number; queue: BankQueue } {
  const before = old ?? { rest: [], last: null }
  let rest = before.rest
  if (rest.length === 0) {
    const fresh = shuffledIndexes(size, random)
    if (fresh.length > 1 && fresh[fresh.length - 1] === before.last) {
      ;[fresh[0], fresh[fresh.length - 1]] = [fresh[fresh.length - 1], fresh[0]]
    }
    rest = fresh
  }
  const index = rest[rest.length - 1]
  return { index, queue: { rest: rest.slice(0, -1), last: index } }
}

// Picks the stop alert line for a session of this length. The queues that come in are not changed; the new ones come back. The line has its slots filled and still has its [effect:words] marks (lineMarkup.ts turns them into pieces).
export function pickStopLine(seconds: number, queues: LineQueues, random: () => number = Math.random): PickedLine {
  const bank = bankIdFor(seconds)
  const lines = STOP_ALERT_BANKS[bank]
  const { index, queue } = nextIndex(lines.length, queues[bank], random)
  return {
    bank,
    index,
    line: fillSlots(lines[index], seconds),
    queues: { ...queues, [bank]: queue },
  }
}

// Picks the comeback line for a session that was stopped at this length, or null when the session cannot go back in (45 minutes and more). Same rules as pickStopLine, with queues of its own.
export function pickComebackLine(seconds: number, queues: ComebackQueues, random: () => number = Math.random): PickedComeback | null {
  const bank = bankIdFor(seconds)
  if (!isComebackBank(bank)) return null
  const lines = COMEBACK_BANKS[bank]
  const { index, queue } = nextIndex(lines.length, queues[bank], random)
  return {
    bank,
    index,
    line: fillSlots(lines[index], seconds),
    queues: { ...queues, [bank]: queue },
  }
}
// AB:TIMER.ALERT-LINES:END
```

## STEP 2: Replace the whole content of `src/lib/stopAlertLines.test.ts`
The old file has 21 tests; the new file has 500 lines and 35 tests. Replace the ENTIRE content of the file `src/lib/stopAlertLines.test.ts` with exactly this content:

```ts
import { describe, expect, it } from "vitest"
import { bgLight } from "./backgroundLook"
import { ballStep } from "./ballLook"
import { EFFECTS, fillSlots, parseMarkup, plainText } from "./lineMarkup"
import {
  BANK_IDS,
  COMEBACK_BANKS,
  COMEBACK_BANK_IDS,
  STOP_ALERT_BANKS,
  bankIdFor,
  isComebackBank,
  pickComebackLine,
  pickStopLine,
  type BankId,
  type ComebackQueues,
  type LineQueues,
} from "./stopAlertLines"
import {
  DEEP_FROM_SECONDS,
  FLOW_FROM_SECONDS,
  GO_BACK_IN_LIMIT_SECONDS,
  MIN_SESSION_SECONDS,
  SOLID_FROM_SECONDS,
  canGoBackIn,
} from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the stop alert lines, of the comeback lines (shown after GO BACK IN) and of the choice of one line of each kind. Run them with: npm test
// The edges of the banks that are cut-offs of the timer are imported here, not written again, see CONNECTIONS.md C41. If a cut-off is changed, the tests of the numbers and words in the lines show which lines to read again.

// The first and the last second of every bank, from the edges (the bank from90 has no last second, 3 hours stands for it).
const EDGES: Record<BankId, readonly [number, number]> = {
  under1: [0, MIN_SESSION_SECONDS - 1],
  from1: [MIN_SESSION_SECONDS, 5 * 60 - 1],
  from5: [5 * 60, SOLID_FROM_SECONDS - 1],
  from10: [SOLID_FROM_SECONDS, 20 * 60 - 1],
  from20: [20 * 60, DEEP_FROM_SECONDS - 1],
  from30: [DEEP_FROM_SECONDS, GO_BACK_IN_LIMIT_SECONDS - 1],
  from45: [GO_BACK_IN_LIMIT_SECONDS, FLOW_FROM_SECONDS - 1],
  from90: [FLOW_FROM_SECONDS, 3 * 3600],
}

// Every line of both kinds, with the kind and the bank it sits in.
type Entry = { kind: "stop" | "comeback"; id: BankId; line: string; label: string }
const ALL: Entry[] = [
  ...BANK_IDS.flatMap((id) =>
    STOP_ALERT_BANKS[id].map((line): Entry => ({ kind: "stop", id, line, label: "stop " + id + ": " + line })),
  ),
  ...COMEBACK_BANK_IDS.flatMap((id) =>
    COMEBACK_BANKS[id].map((line): Entry => ({ kind: "comeback", id, line, label: "comeback " + id + ": " + line })),
  ),
]

// A small fixed series of "random" numbers, so that a test can be repeated exactly.
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

describe("which bank a session gets", () => {
  it("changes at 60 seconds, 5, 10, 20, 30, 45 and 90 minutes, to the second", () => {
    const at: [number, BankId][] = [
      [0, "under1"],
      [59, "under1"],
      [60, "from1"],
      [299, "from1"],
      [300, "from5"],
      [599, "from5"],
      [600, "from10"],
      [1199, "from10"],
      [1200, "from20"],
      [1799, "from20"],
      [1800, "from30"],
      [2699, "from30"],
      [2700, "from45"],
      [5399, "from45"],
      [5400, "from90"],
      [99999, "from90"],
    ]
    for (const [seconds, bank] of at) expect(bankIdFor(seconds), String(seconds)).toBe(bank)
  })

  it("follows the cut-offs of the timer: 60 seconds is saved, 10 and 30 minutes are the quality steps, 45 minutes ends GO BACK IN, 90 minutes is flow", () => {
    expect(bankIdFor(MIN_SESSION_SECONDS - 1)).toBe("under1")
    expect(bankIdFor(MIN_SESSION_SECONDS)).toBe("from1")
    expect(bankIdFor(SOLID_FROM_SECONDS)).toBe("from10")
    expect(bankIdFor(DEEP_FROM_SECONDS)).toBe("from30")
    expect(bankIdFor(GO_BACK_IN_LIMIT_SECONDS - 1)).toBe("from30")
    expect(bankIdFor(GO_BACK_IN_LIMIT_SECONDS)).toBe("from45")
    expect(bankIdFor(FLOW_FROM_SECONDS - 1)).toBe("from45")
    expect(bankIdFor(FLOW_FROM_SECONDS)).toBe("from90")
  })

  it("gives the bank under1 to anything that is not a finite number above 0", () => {
    expect(bankIdFor(Number.NaN)).toBe("under1")
    expect(bankIdFor(-5)).toBe("under1")
    expect(bankIdFor(Number.POSITIVE_INFINITY)).toBe("under1")
  })

  it("gives the same bank to every second between the edges of the bank, and the edges are the ones of this test file", () => {
    for (const id of BANK_IDS) {
      const [first, last] = EDGES[id]
      expect(bankIdFor(first), id + " first").toBe(id)
      expect(bankIdFor(last), id + " last").toBe(id)
      expect(bankIdFor(Math.floor((first + last) / 2)), id + " middle").toBe(id)
    }
  })

  it("is exactly the banks without GO BACK IN: the banks from45 and from90 are the sessions that cannot go back in", () => {
    for (let s = 0; s <= 6000; s++) {
      const bank = bankIdFor(s)
      expect(canGoBackIn(s), String(s)).toBe(bank !== "from45" && bank !== "from90")
      expect(isComebackBank(bank), String(s)).toBe(canGoBackIn(s))
    }
  })
})

describe("the banks", () => {
  it("are the eight banks of the stop alert, in the order of the sessions, and each has at least 20 lines that are not empty and not the same twice", () => {
    expect([...BANK_IDS]).toEqual(["under1", "from1", "from5", "from10", "from20", "from30", "from45", "from90"])
    expect(Object.keys(STOP_ALERT_BANKS).sort()).toEqual([...BANK_IDS].sort())
    for (const id of BANK_IDS) {
      const lines = STOP_ALERT_BANKS[id]
      expect(lines.length, id).toBeGreaterThanOrEqual(20)
      expect(new Set(lines).size, id).toBe(lines.length)
      for (const line of lines) expect(line.trim().length, id).toBeGreaterThan(10)
    }
  })

  it("are six banks of comeback lines, in the order of the sessions, and each has at least 20 lines that are not empty and not the same twice", () => {
    expect([...COMEBACK_BANK_IDS]).toEqual(["under1", "from1", "from5", "from10", "from20", "from30"])
    expect(Object.keys(COMEBACK_BANKS).sort()).toEqual([...COMEBACK_BANK_IDS].sort())
    for (const id of COMEBACK_BANK_IDS) {
      const lines = COMEBACK_BANKS[id]
      expect(lines.length, id).toBeGreaterThanOrEqual(20)
      expect(new Set(lines).size, id).toBe(lines.length)
      for (const line of lines) expect(line.trim().length, id).toBeGreaterThan(10)
    }
  })

  it("have no line twice across the two kinds in the same bank, and no line that is only the other kind of line again", () => {
    for (const id of COMEBACK_BANK_IDS) {
      const stop = new Set(STOP_ALERT_BANKS[id])
      for (const line of COMEBACK_BANKS[id]) expect(stop.has(line), id + ": " + line).toBe(false)
    }
  })

  it("have no line with a double quote, a backtick or a backslash (the lines are written between double quotes in the code), and no character that is not on a plain keyboard (no curly quotes, no long dashes)", () => {
    for (const { label, line } of ALL) {
      expect(line, label).not.toMatch(/["`\\]/)
      expect(line, label).toMatch(/^[\x20-\x7e]+$/)
    }
  })
})

describe("the marks in the lines", () => {
  it("use only the six known effect names, and every mark and every slot is closed", () => {
    for (const { label, line } of ALL) {
      for (const m of line.matchAll(/\[([^\]:]*):/g)) expect((EFFECTS as readonly string[]).includes(m[1]), label).toBe(true)
      expect((line.match(/\[/g) ?? []).length, label).toBe((line.match(/\]/g) ?? []).length)
      expect((line.match(/\{/g) ?? []).length, label).toBe((line.match(/\}/g) ?? []).length)
    }
  })

  it("give every line one to three marked keywords", () => {
    for (const { label, line } of ALL) {
      const marked = parseMarkup(line).filter((f) => f.effect !== null).length
      expect(marked, label).toBeGreaterThanOrEqual(1)
      expect(marked, label).toBeLessThanOrEqual(3)
    }
  })

  it("leave no slot and no bracket in the text when the slots are filled, at the first and at the last second of the bank", () => {
    for (const { label, id, line } of ALL) {
      for (const seconds of EDGES[id]) {
        const text = plainText(fillSlots(line, seconds))
        expect(text, label + " at " + seconds).not.toMatch(/[{}[\]]/)
      }
    }
  })

  it("never say 0 minutes or 1 minutes (the unit must agree with the number) when the slots are filled, at the edges of every bank", () => {
    for (const { label, id, line } of ALL) {
      for (const seconds of EDGES[id]) {
        const text = plainText(fillSlots(line, seconds))
        expect(text, label + " at " + seconds).not.toMatch(/\b1 minutes\b/)
        if (id !== "under1") expect(text, label + " at " + seconds).not.toMatch(/\b0 minutes\b/)
      }
    }
  })

  it("use {left} only in the banks of sessions shorter than 45 minutes, and no slot at all in the bank of sessions that were not saved", () => {
    for (const { label, id, line } of ALL) {
      if (id === "from45" || id === "from90" || id === "under1") expect(line, label).not.toContain("{left}")
      if (id === "under1") expect(line, label).not.toMatch(/\{(n|time)\}/)
    }
  })
})

describe("the numbers and words written in the lines", () => {
  // A number written in a line is a cut-off of the timer and is true for the bank it sits in: 10 minutes (the first quality step) in the bank from5, 45 minutes (the end of GO BACK IN) in the banks from20 and from30. The numbers come from the imported cut-offs, so if a cut-off is changed this test names the lines to read again (C41).
  const ALLOWED: Partial<Record<BankId, string[]>> = {
    from5: [String(SOLID_FROM_SECONDS / 60)],
    from20: [String(GO_BACK_IN_LIMIT_SECONDS / 60)],
    from30: [String(GO_BACK_IN_LIMIT_SECONDS / 60)],
  }

  it("allow a number only where it is a cut-off that is true for the bank", () => {
    for (const { label, id, line } of ALL) {
      for (const m of plainText(line).matchAll(/\d+/g)) expect(ALLOWED[id] ?? [], label).toContain(m[0])
    }
  })

  it("allow the words sixty and ten only where they are the next cut-off: sixty seconds in the bank under1 (not saved yet), ten minutes in the bank from5 (the first colour step is next), and no other number written as a word", () => {
    for (const { label, id, line } of ALL) {
      const text = plainText(line)
      if (id !== "under1") expect(text, label).not.toMatch(/\bsixty\b/i)
      if (id !== "from5") expect(text, label).not.toMatch(/\bten\b/i)
      expect(text, label).not.toMatch(/\b(twenty|thirty|forty|fifty|ninety|hundred|hours?)\b/i)
    }
  })

  it("say flow only from 90 minutes (the flow of the timer starts there), and not solid or deep, which are quality words of the timer with other cut-offs", () => {
    for (const { label, id, line } of ALL) {
      const text = plainText(line)
      if (id !== "from90") expect(text, label).not.toMatch(/\bflow\b/i)
      expect(text, label).not.toMatch(/\b(solid|deep)\b/i)
    }
  })

  it("never say what the app cannot know or what is false for a saved session: the time of day, earlier sessions, unbroken, zero, counted for nothing, and milestone (the name of the messages of MILESTONE_MINUTES, which are at other minutes)", () => {
    const banned = [
      "unbroken",
      "morning",
      "lunch",
      "afternoon",
      "evening",
      "first real session",
      "one session",
      "two more",
      "zero",
      "counted for nothing",
      "counts as zero",
      "nothing got done",
      "milestone",
    ]
    for (const { label, line } of ALL) {
      const text = plainText(line).toLowerCase()
      for (const phrase of banned) expect(text, label).not.toContain(phrase)
    }
  })

  it("never tell a session that cannot go back in to go back in (the banks from45 and from90 have no GO BACK IN button)", () => {
    for (const id of ["from45", "from90"] as const) {
      for (const line of STOP_ALERT_BANKS[id]) expect(plainText(line), id + ": " + line).not.toMatch(/\bback in\b/i)
    }
  })
})

describe("the claims about the ball and the rays", () => {
  // The ball and the rays of light change with the seconds of the session (ballStep of ballLook.ts, bgLight of backgroundLook.ts). A line that says something about them must be true for EVERY second of its bank. The minutes are not copied here: the claims ask the two functions.
  const LAST_SECOND = 3 * 3600
  const LAST_STEP = ballStep(LAST_SECOND)
  let firstColourAt = Number.POSITIVE_INFINITY
  for (let s = 0; s <= LAST_SECOND && firstColourAt === Number.POSITIVE_INFINITY; s++) if (ballStep(s) > 0) firstColourAt = s

  type Claim = { what: string; applies: (text: string) => boolean; holds: (seconds: number) => boolean }
  const CLAIMS: Claim[] = [
    { what: "the ball is white", applies: (t) => /\bwhite\b/i.test(t), holds: (s) => ballStep(s) === 0 },
    {
      what: "the first colour is still to come",
      applies: (t) => /turn colour|takes its first colour|colour starts at|is the first colour|request: colour/i.test(t),
      holds: (s) => ballStep(s) === 0,
    },
    {
      what: "the first colour comes at ten minutes",
      applies: (t) => /\b(ten|10) minutes\b/i.test(t) && /\bcolour\b/i.test(t),
      holds: () => firstColourAt === 10 * 60,
    },
    { what: "the ball has a colour already", applies: (t) => /found its colour|kept its colour/i.test(t), holds: (s) => ballStep(s) >= 1 },
    {
      what: "the ball has changed colour once",
      applies: (t) => /changed colour once|one colour in and wants another|one colour behind it/i.test(t),
      holds: (s) => ballStep(s) === 1,
    },
    { what: "the ball has changed colour twice", applies: (t) => /changed colour twice/i.test(t), holds: (s) => ballStep(s) === 2 },
    { what: "the ball has changed colour three times", applies: (t) => /colour three times/i.test(t), holds: (s) => ballStep(s) === 3 },
    {
      what: "one colour is behind the ball and two are ahead",
      applies: (t) => /one colour behind it and two ahead/i.test(t),
      holds: (s) => ballStep(s) === 1 && LAST_STEP - ballStep(s) === 2,
    },
    { what: "the rays are at full strength", applies: (t) => /\brays\b.*\bfull strength\b/i.test(t), holds: (s) => bgLight(s) === 1 },
  ]

  function secondsOf(id: BankId): number[] {
    const [first, last] = EDGES[id]
    return Array.from({ length: last - first + 1 }, (_, i) => first + i)
  }

  it("are checked against a ball that is white before the first colour step and has a colour from then on, and rays that are at full light from 90 minutes", () => {
    expect(ballStep(0)).toBe(0)
    expect(firstColourAt).toBeGreaterThan(0)
    expect(firstColourAt).toBeLessThan(Number.POSITIVE_INFINITY)
    expect(LAST_STEP).toBe(3)
    let never_back = true
    let previous = 0
    for (let s = 0; s <= LAST_SECOND; s++) {
      const step = ballStep(s)
      if (step < previous) never_back = false
      previous = step
      if (s < firstColourAt) expect(step, String(s)).toBe(0)
    }
    expect(never_back).toBe(true)
    expect(bgLight(FLOW_FROM_SECONDS - 1)).toBeLessThan(1)
    expect(bgLight(FLOW_FROM_SECONDS)).toBe(1)
    expect(bgLight(LAST_SECOND)).toBe(1)
  })

  it("hold for every second of the bank that the line sits in", () => {
    for (const { label, id, line } of ALL) {
      const text = plainText(line)
      for (const claim of CLAIMS) {
        if (!claim.applies(text)) continue
        for (const s of secondsOf(id)) {
          if (!claim.holds(s)) throw new Error('Not true at second ' + s + ' ("' + claim.what + '"): ' + label)
        }
      }
    }
  })

  it("leave no line about the ball or the rays without a claim that is checked (a line that only says the ball is glowing is the one exception)", () => {
    for (const { label, line } of ALL) {
      const text = plainText(line)
      if (!/\b(ball|rays?)\b/i.test(text)) continue
      const checked = CLAIMS.some((claim) => claim.applies(text))
      expect(checked || /\bglowing\b/i.test(text), label).toBe(true)
    }
  })

  it("use every claim of this table in at least one line, so that a claim that stopped matching is noticed", () => {
    for (const claim of CLAIMS) {
      expect(
        ALL.some(({ line }) => claim.applies(plainText(line))),
        claim.what,
      ).toBe(true)
    }
  })
})

describe("pickStopLine", () => {
  it("picks a line of the bank of the session, with its slots filled and its effect marks still in it", () => {
    const picked = pickStopLine(38 * 60, {}, seeded(1))
    expect(picked.bank).toBe("from30")
    expect(STOP_ALERT_BANKS.from30[picked.index]).toBeDefined()
    expect(picked.line).toBe(fillSlots(STOP_ALERT_BANKS.from30[picked.index], 38 * 60))
    expect(picked.line).not.toMatch(/[{}]/)
  })

  it("shows every line of a bank once before any line comes twice, and the queue of the bank is then empty", () => {
    const size = STOP_ALERT_BANKS.from10.length
    let queues: LineQueues = {}
    const seen: number[] = []
    const random = seeded(7)
    for (let i = 0; i < size; i++) {
      const picked = pickStopLine(12 * 60, queues, random)
      seen.push(picked.index)
      queues = picked.queues
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i))
    expect(queues.from10?.rest).toEqual([])
  })

  it("never starts a new round with the line that ended the old round, for many different series of random numbers", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const size = STOP_ALERT_BANKS.from45.length
      const random = seeded(seed)
      let queues: LineQueues = {}
      let previous = -1
      for (let i = 0; i < size * 4; i++) {
        const picked = pickStopLine(50 * 60, queues, random)
        expect(picked.index, "seed " + seed + " pick " + i).not.toBe(previous)
        previous = picked.index
        queues = picked.queues
      }
    }
  })

  it("keeps a queue for each bank, so a session of another length does not use up the lines of the first", () => {
    const first = pickStopLine(12 * 60, {}, seeded(3))
    const other = pickStopLine(50 * 60, first.queues, seeded(4))
    expect(other.queues.from10).toEqual(first.queues.from10)
    expect(other.queues.from45?.last).toBe(other.index)
    expect(other.bank).toBe("from45")
  })

  it("does not change the queues that come in", () => {
    const queues: LineQueues = { from5: { rest: [2, 0, 1], last: 3 } }
    const copy = JSON.parse(JSON.stringify(queues))
    const picked = pickStopLine(6 * 60, queues, seeded(5))
    expect(queues).toEqual(copy)
    expect(picked.index).toBe(1)
    expect(picked.queues.from5).toEqual({ rest: [2, 0], last: 1 })
  })

  it("works with a random number of exactly 0 and of just under 1, and with the default random number", () => {
    for (const value of [0, 0.999999999]) {
      let queues: LineQueues = {}
      const size = STOP_ALERT_BANKS.under1.length
      const seen = new Set<number>()
      for (let i = 0; i < size; i++) {
        const picked = pickStopLine(10, queues, () => value)
        seen.add(picked.index)
        queues = picked.queues
      }
      expect(seen.size).toBe(size)
    }
    expect(typeof pickStopLine(130 * 60, {}).line).toBe("string")
  })
})

describe("the comeback lines", () => {
  it("gives null for a session that cannot go back in, and gives a line for every session that can, second by second up to 100 minutes", () => {
    for (let s = 0; s <= 6000; s++) {
      const picked = pickComebackLine(s, {}, seeded(s + 1))
      if (canGoBackIn(s)) {
        expect(picked, String(s)).not.toBeNull()
        expect(picked?.bank, String(s)).toBe(bankIdFor(s))
      } else {
        expect(picked, String(s)).toBeNull()
      }
    }
  })

  it("picks a line of the bank the session had when it was stopped, with its slots filled and its effect marks still in it", () => {
    const picked = pickComebackLine(38 * 60, {}, seeded(1))
    expect(picked).not.toBeNull()
    if (picked === null) return
    expect(picked.bank).toBe("from30")
    expect(COMEBACK_BANKS.from30[picked.index]).toBeDefined()
    expect(picked.line).toBe(fillSlots(COMEBACK_BANKS.from30[picked.index], 38 * 60))
    expect(picked.line).not.toMatch(/[{}]/)
  })

  it("shows every comeback line of a bank once before any line comes twice, and the queue of the bank is then empty", () => {
    const size = COMEBACK_BANKS.from20.length
    let queues: ComebackQueues = {}
    const seen: number[] = []
    const random = seeded(11)
    for (let i = 0; i < size; i++) {
      const picked = pickComebackLine(25 * 60, queues, random)
      expect(picked).not.toBeNull()
      if (picked === null) return
      seen.push(picked.index)
      queues = picked.queues
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i))
    expect(queues.from20?.rest).toEqual([])
  })

  it("never starts a new round with the line that ended the old round, for many different series of random numbers", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const size = COMEBACK_BANKS.from5.length
      const random = seeded(seed)
      let queues: ComebackQueues = {}
      let previous = -1
      for (let i = 0; i < size * 4; i++) {
        const picked = pickComebackLine(7 * 60, queues, random)
        if (picked === null) throw new Error("no comeback line at 7 minutes")
        expect(picked.index, "seed " + seed + " pick " + i).not.toBe(previous)
        previous = picked.index
        queues = picked.queues
      }
    }
  })

  it("does not change the queues that come in, and keeps a queue for each bank", () => {
    const queues: ComebackQueues = { from5: { rest: [2, 0, 1], last: 3 } }
    const copy = JSON.parse(JSON.stringify(queues))
    const picked = pickComebackLine(6 * 60, queues, seeded(5))
    expect(queues).toEqual(copy)
    expect(picked?.index).toBe(1)
    expect(picked?.queues.from5).toEqual({ rest: [2, 0], last: 1 })
    const other = pickComebackLine(35 * 60, picked?.queues ?? {}, seeded(6))
    expect(other?.queues.from5).toEqual({ rest: [2, 0], last: 1 })
    expect(other?.queues.from30?.last).toBe(other?.index)
  })

  it("uses queues of its own: a stop alert line and a comeback line of the same bank do not use up each other's lines", () => {
    const stop = pickStopLine(12 * 60, {}, seeded(8))
    const comeback = pickComebackLine(12 * 60, {}, seeded(9))
    expect(stop.queues.from10?.rest.length).toBe(STOP_ALERT_BANKS.from10.length - 1)
    expect(comeback?.queues.from10?.rest.length).toBe(COMEBACK_BANKS.from10.length - 1)
  })
})
// AB:TIMER.TESTS:END
```

## STEP 3: Check that the four files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/lib/lineMarkup.ts","src/lib/stopAlertLines.ts","src/lib/lineMarkup.test.ts","src/lib/stopAlertLines.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these four lines (the two `lineMarkup` files did not change):
```
src/lib/lineMarkup.ts 4320574c170ef64ba120b8a0584384c80c115bab39bb562bb52784d283aff743
src/lib/stopAlertLines.ts 39cef7509e354f90998d032c86217a0020fae6a323c49236f8b586e193bb6adb
src/lib/lineMarkup.test.ts f99ff83631e12c5f6f9464377f925ef7bcebe8a7e6cbfb77e0047c70cbb6b2ef
src/lib/stopAlertLines.test.ts 6e356d7b9e73caec32c728ef297576529510e1dc647bf1ec6847c2412ec95e93
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: `src/lib/lineMarkup.ts` 86, `src/lib/stopAlertLines.ts` 457, `src/lib/lineMarkup.test.ts` 156, `src/lib/stopAlertLines.test.ts` 500.)

## STEP 4: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  12 passed (12)` and a line `Tests  617 passed (617)` (603 before this packet, plus 14 new tests in `stopAlertLines.test.ts`). It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 5: Edit `CODE_MAP.md`, `CONNECTIONS.md` and `PROGRESS.md`
Change nothing else in these files. The row `AB:TIMER.LINE-MARKUP` in `CODE_MAP.md` stays exactly as it is.

**`CODE_MAP.md`: two rows replaced.** Each line below must be found EXACTLY ONCE.

Row 1 of 2. Find the line that starts with `| `AB:TIMER.TESTS` |` and replace the WHOLE line with this line:
```
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer: the maths, the database calls, the live state, the screen, the glowing ball and its look, the moving background and its look, the choice of screen in the signed-in stub, and the lines of the stop alert and of the comeback after GO BACK IN with their marks and their claims about the ball and the rays. Run them with npm test | `src/lib/timerMaths.test.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/TimerBall.test.tsx`, `src/components/SignedInStub.test.tsx`, `src/lib/ballLook.test.ts`, `src/components/TimerBackground.test.tsx`, `src/lib/backgroundLook.test.ts`, `src/lib/lineMarkup.test.ts`, `src/lib/stopAlertLines.test.ts` | add tests; the numbers and names written in them must match the code, see CONNECTIONS.md C27, C28, C29, C33, C34, C35, C37, C38, C41 and C42 |
```

Row 2 of 2. Find the line that starts with `| `AB:TIMER.ALERT-LINES` |` and replace the WHOLE line with this line:
```
| `AB:TIMER.ALERT-LINES` | The lines of the stop alert (the text shown after Hold to end session) in eight banks by the length of the session, the comeback lines (the text shown for a few seconds after GO BACK IN) in the six banks of the sessions that can go back in, with the keywords of each line marked for an effect, and the choice of one line (shuffled, no line twice before all were shown) | `src/lib/stopAlertLines.ts` | the lines and their marked keywords (every line keeps one to three marked keywords and follows the rules in the comment of the tag); the edges of the banks follow the cut-offs of the timer, and the lines that talk about the glowing ball or the rays follow ballLook.ts and backgroundLook.ts, see CONNECTIONS.md C41 |
```

**`CONNECTIONS.md`: one sentence changed in C27, and the entries C41 and C42 replaced.**

Change 1 of 3. Inside the entry C27 (the heading line starts with `### C27:`) find this text (EXACTLY ONCE):
```text
The numbers and words in the lines of the stop alert follow these cut-offs too (C41).
```
and replace it with:
```text
The numbers and words in the lines of the stop alert and of the comeback after GO BACK IN follow these cut-offs too (C41).
```

Change 2 of 3. Find the line that starts with `### C41:` (EXACTLY ONCE). The entry C41 is that line and every line below it down to the last non-empty line before the empty line that comes before the line that starts with `### C42:`. Replace that whole entry (the heading line included) with this text. Keep the empty line between C41 and C42:
```text
### C41: The lines of the stop alert and the comeback lines after GO BACK IN are tied to the cut-offs of the timer (the edges of the banks, the numbers and words written in the lines), to the GO BACK IN rule, and to the glowing ball and the rays of light that some lines talk about
- Tags: `AB:TIMER.ALERT-LINES`, `AB:TIMER.LINE-MARKUP`, `AB:TIMER.MATHS`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.BG-LOOK`, `AB:TIMER.TESTS`
- If you change: a cut-off in timerMaths.ts (MIN_SESSION_SECONDS, SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, GO_BACK_IN_LIMIT_SECONDS or FLOW_FROM_SECONDS), the edges or the names of the banks in stopAlertLines.ts, the number or the words in a line (a number, sixty, ten, flow, solid, deep, milestone, a sentence about the ball or the rays), which sessions are offered GO BACK IN, the colour steps of the ball (ballStep in ballLook.ts), or the time the light of the rays is full (bgLight in backgroundLook.ts)
- Then also: the banks are named by their minutes (from1, from5, from10, from20, from30, from45, from90, and under1 for a session under 60 seconds that is not saved). Five edges are cut-offs of the timer and are imported, not written again: 60 seconds (from1), 10 minutes (from10, the first quality step), 30 minutes (from30, the second quality step), 45 minutes (from45, the end of GO BACK IN) and 90 minutes (from90, flow). The edges 5 and 20 minutes (from5 and from20) belong to the banks only. There are two kinds of lines with the same bank names: the stop alert lines (STOP_ALERT_BANKS, eight banks) and the comeback lines (COMEBACK_BANKS, six banks), which are shown for a few seconds after GO BACK IN and are chosen by the length the session had when it was stopped. The comeback banks are exactly the banks of the sessions that can go back in, so from45 and from90 have none (pickComebackLine gives null for them, and a test goes through every second up to 100 minutes and compares it with canGoBackIn). A number written in a line is a cut-off that is true for the bank it sits in: 10 in the bank from5 ("Under 10 minutes", and the word ten), 45 in the banks from20 and from30 ("The threshold is 45"); the word sixty belongs to the bank under1 in the same way. The word flow is only said from 90 minutes. The words solid and deep are never used, because the quality words of the timer start at other minutes than the banks. The word milestone is never used: the milestones are the messages of MILESTONE_MINUTES (15, 25, 45 minutes and so on) and they are not the colour steps of the ball. No line of the banks from45 and from90 says "back in", because those sessions have no GO BACK IN button. A line about the glowing ball or the rays of light says something that is true for every second of its bank: the ball is white before 10 minutes, has changed colour once from 10 to 29 minutes, twice from 30 to 89 and three times from 90 minutes (so it has two colours still ahead from 10 to 29 minutes), and the rays are at full light from 90 minutes. The tests do not copy these minutes: they ask ballStep (ballLook.ts) and bgLight (backgroundLook.ts), so if a colour step or the end of the growing light moves, the lines that are no longer true fail and are named. Every line that talks about the ball or the rays must match one of the claims of the table in the tests, and every claim of the table must be used by a line, so a rewording that escapes the table is noticed. {left} counts the minutes to 45 (GO_BACK_IN_LIMIT_SECONDS, see C42) and is only used under 45 minutes. If a cut-off is changed, the tests of stopAlertLines.test.ts fail and name the line to read again. The screen of the stop alert (a later packet) takes its bank from bankIdFor and its GO BACK IN button from canGoBackIn: the two must never disagree. The comeback line comes from pickComebackLine with the seconds the session had when it was stopped, never with the seconds after GO BACK IN.
- If you forget: a line tells the person a number or a word that is false for the session on the screen (for example 45 minutes in a bank of 50-minute sessions, flow at 40 minutes, a ball that changed colour twice at 20 minutes, rays at full light at 60 minutes), or the alert offers GO BACK IN with a line that says the session is over, or a comeback line is for another length than the session.
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = ["from90", FLOW_FROM_SECONDS],`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = ["from45", GO_BACK_IN_LIMIT_SECONDS],`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = ["from30", DEEP_FROM_SECONDS],`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = ["from10", SOLID_FROM_SECONDS],`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = ["from1", MIN_SESSION_SECONDS],`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = return "under1"`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = export type ComebackBankId = Exclude<BankId, "from45" | "from90">`
- Anchor: `AB:TIMER.TESTS @ src/lib/stopAlertLines.test.ts = describe("which bank a session gets", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/stopAlertLines.test.ts = describe("the numbers and words written in the lines", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/stopAlertLines.test.ts = describe("the comeback lines", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/stopAlertLines.test.ts = describe("the claims about the ball and the rays", () => {`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return STEPS.indexOf(qualityOf(seconds)) as 0 | 1 | 2 | 3`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export function bgLight(seconds: number): number {`
- Check by hand: when a cut-off of the timer changes, or the colour steps of the ball or the light of the rays change, read the lines of the banks around it in stopAlertLines.ts (both kinds). The tests stop the build when a written number or word, or a sentence about the ball or the rays, is no longer true, but they cannot judge the meaning of a sentence (for example "Past halfway" in the bank from30, or the jokes about the group chat). A device without WebGL 2 shows no ball and no rays, and lite level 2 shows no rays: a line about them is then about something that is not on the screen. That is accepted.
```

Change 3 of 3. Find the line that starts with `### C42:` (EXACTLY ONCE). The entry C42 is that line and every line below it down to the last non-empty line before the empty line that comes before the line `## Things to know (no check is possible)`. Replace that whole entry (the heading line included) with this text. Keep the empty line between C42 and `## Things to know (no check is possible)`:
```text
### C42: The marks in a line ({n}, {time}, {left} and [effect:words]) are read by one function, and the six effect names are the names the text component of the screen has to draw
- Tags: `AB:TIMER.LINE-MARKUP`, `AB:TIMER.ALERT-LINES`, `AB:TIMER.TESTS`
- If you change: the six effect names (EFFECTS in lineMarkup.ts), the form of a mark (the square brackets and the colon, MARK in lineMarkup.ts), the slots ({n}, {time}, {left}) or how {left} counts, or the marks written in a line of stopAlertLines.ts (a stop alert line or a comeback line)
- Then also: a line is plain text with two kinds of marks. {n}, {time} and {left} are filled by fillSlots BEFORE the line is cut up, so a slot can sit inside a marked word ("[heat:{time}]"). [effect:words] marks the words that get an effect; the effect name is one of the six names in EFFECTS (glow, heat, shake, strike, ghost, rise), lower case, followed by a colon. parseMarkup never throws: an unknown effect name loses its effect and keeps its text, a bracket that is not closed stays in the text, so a typo shows on the screen instead of breaking the alert; the tests of stopAlertLines.test.ts read every line of both kinds and fail on an unknown name or an unclosed bracket. {left} is the minutes still missing to GO_BACK_IN_LIMIT_SECONDS (45 minutes), rounded UP and never less than 1; it is tied to the same cut-off as the banks (C41). The css and the text component that DRAW the six effects come in a later packet: that packet must give each of the six names a rule, and must then extend this entry with its own anchors, because a new name in EFFECTS without a rule in the css would show a keyword with no effect, and a rule in the css without a name in EFFECTS would never be used.
- If you forget: a keyword shows no effect, or the brackets and the colon show as text on the screen, or a number in a line is wrong (a slot not filled, "1 minutes", or {left} that counts to another minute than the one where GO BACK IN stops).
- Anchor: `AB:TIMER.LINE-MARKUP @ src/lib/lineMarkup.ts = export const EFFECTS = ["glow", "heat", "shake", "strike", "ghost", "rise"] as const`
- Anchor: `AB:TIMER.LINE-MARKUP @ src/lib/lineMarkup.ts = const MARK = /\[([a-z]+):([^[\]]+)\]/g`
- Anchor: `AB:TIMER.LINE-MARKUP @ src/lib/lineMarkup.ts = const left = Math.max(1, Math.ceil((GO_BACK_IN_LIMIT_SECONDS - s) / 60))`
- Anchor: `AB:TIMER.TESTS @ src/lib/lineMarkup.test.ts = describe("the six effects", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/stopAlertLines.test.ts = describe("the marks in the lines", () => {`
- Check by hand: open src/lib/stopAlertLines.ts and read three lines: every marked keyword is written [name:words] with one of the six names, and the sentence still reads well with the marks taken away.
```

**`PROGRESS.md`: one line added.** Find the line that starts with `- Packet 05F0:` (EXACTLY ONCE; it stays as it is). Directly after it, add this one line (with the same line ending as the line it follows):
```
- Packet 05F0B: the final words of the stop alert and of the comeback after GO BACK IN (replaces the 53 lines of Packet 05F0): 176 stop alert lines in eight banks by the length of the session (22 lines each) and 120 comeback lines in the six banks of the sessions that can go back in (20 lines each), with the keywords of each line marked for an effect. The choice of a comeback line (pickComebackLine) is shuffled like the choice of a stop alert line and gives nothing for a session that cannot go back in. The tests check every number and word written in a line against the cut-offs of the timer, and every sentence about the glowing ball or the rays against ballStep and bgLight, for every second of the bank the line sits in. Four lines differ from the first approved draft because the draft was false in the app (the word milestone, a film for a session of 45 minutes, one colour ahead instead of two). No screen change: nothing uses the lines yet. With automated tests (14 more than in Packet 05F0).
```

## STEP 6: Check the checker, the build and the changed files
Run:
```
node scripts/check-tags.mjs
```
It must print exactly:
```
TAGS OK: 28 tags, 50 places
CONNECTIONS OK: 42 connections, 254 anchors, 36 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list exactly `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/lib/stopAlertLines.ts` and `src/lib/stopAlertLines.test.ts`, and it may also list the two files named in the rules (they had changes before this packet). If ANY other tracked file is listed (for example `package.json`, `package-lock.json`, `src/lib/lineMarkup.ts` or any file in `src/components`): **STOP** and report the COMPLETE output. Do not commit.

## STEP 7: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/lib/stopAlertLines.ts src/lib/stopAlertLines.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05F0B: the final stop alert lines and the comeback lines (replaces the first 53 lines, no screen change)"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output. The two files named in the rules and untracked files may still show: leave them alone.

## STEP 8: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, the four fingerprint lines of Step 0 matched (the files as Packet 05F0 wrote them), `node scripts/check-tags.mjs` printed the two lines of Step 0 (28 tags, 50 places; 42 connections, 249 anchors), `npm test` printed `Tests  603 passed (603)`, the seven lines of `timerMaths.ts` and the three lines of the ball and the rays matched, and Packet 05F0 was in `git log`.
2. The four fingerprint lines of Step 3 matched exactly.
3. `npm test` printed `Test Files  12 passed (12)` and `Tests  617 passed (617)`, and `npx tsc -b` printed nothing.
4. `node scripts/check-tags.mjs` printed the two lines of Step 6 (28 tags, 50 places; 42 connections, 254 anchors).
5. `npm run build` finished with no errors.
6. `git show --stat HEAD` lists exactly these 5 files: `src/lib/stopAlertLines.ts`, `src/lib/stopAlertLines.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
7. The first line of `git log --oneline` ends with `Packet 05F0B: the final stop alert lines and the comeback lines (replaces the first 53 lines, no screen change)`.
8. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
9. `git push` finished without an error.
10. No file other than the ones named in this packet was created, edited or committed, and NO helper script or temp file was created at any time (also not one that was deleted afterwards). `src/lib/lineMarkup.ts`, `src/lib/lineMarkup.test.ts`, no file in `src/components`, no css file and no hook was changed.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 10 done-checks. If you had to create a helper file, say so and mark check 10 FAIL.
- the RAW outputs of the 5 read-only commands of Step 0, the four fingerprint lines of Step 0, the output of `node scripts/check-tags.mjs` of Step 0, the last 3 lines of the `npm test` of Step 0, the 7 lines of the `timerMaths.ts` command and the 3 lines of the ball and rays command
- the exact four lines printed in Step 3
- the last 12 lines of the output of `npm test` (Step 4), and the output of `npx tsc -b` (or the word EMPTY)
- the exact output of `node scripts/check-tags.mjs` from Step 6
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 6
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 7
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.

---

## HOW TO UNDO (not the agent's job)
The whole packet is one commit, so one `git revert <hash of the commit of Step 7>` in the planner chat puts the first 53 lines of Packet 05F0 and their docs back. Nothing else in the app depends on the lines yet.

## THE OWNER'S OWN LOOK (not the agent's job; after the push)
Nothing changes on the screen, and that is the test.
1. Open `#timer` on the laptop and on the phone. Start, Pause, Resume, hold to end: everything works and looks exactly as before. If anything looks or behaves differently, tell the planner (it should be impossible: nothing imports the new files).
2. The final wording of every line is in the file `LINES_ALL_FINAL.md` that comes with this packet. It is the approved list with the four changed lines. Say "change 10m-3 to ..." or "drop 20m-9" (any code) and the planner puts it in a small packet.

---

## WHY 4 LINES DIFFER FROM THE APPROVED WORDING (not the agent's job)
All other 292 lines are exactly as approved. These 4 were changed by the smallest possible edit, because the approved wording is false in the app. Say "revert 20m-20" (or any code) and the original goes back.

| Code | Approved | Now | Why |
|---|---|---|---|
| 5m-20 | Ten minutes is the first milestone. | Ten minutes is the first colour step. | "Milestone" is the name of the timer's messages at 15, 25 and 45 minutes. The ball's first colour at 10 minutes is not one of them. |
| c-20m-5 | ...again at the next milestone. | ...again at the next colour step. | Same reason. The ball's next colour is at 30 minutes. |
| 45m-18 | a whole film's worth of focus | a whole episode's worth of focus | The line shows from 45 minutes up. A film is 90 minutes or more. |
| 20m-20 | one colour behind it and one ahead | one colour behind it and two ahead | The ball changes colour at 10, 30 and 90 minutes. At 20 to 29 minutes it has changed once and has two changes left. |
