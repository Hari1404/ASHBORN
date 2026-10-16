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
// Rules that every line follows (the tests of stopAlertLines.test.ts check them): a number written in a line is a cut-off and is true for the bank it sits in; "flow" is only said from 90 minutes; the word "milestone" is never used (it is the name of the messages of MILESTONE_MINUTES); a line about the glowing ball is true for every second of its bank (the tests ask ballStep); no line talks about rays of light (the moving background has none); a line never says the time of day, how many sessions there were before, or that a saved session counted for nothing; no line of a bank without GO BACK IN says "go back in"; every line has one to three marked keywords.
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
    "{time} at full strength. Even the [glow:sun] gets cloudy days. You just [heat:skipped them].",
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

// How long the comeback message stays on the screen after GO BACK IN, and how long its fade out takes, in milliseconds. The fade time is the same number as the transition of .ab-comeback in timer.css (see CONNECTIONS.md C48). The wait is long enough to read the longest comeback line (113 characters) once its words have come in.
export const COMEBACK_SHOW_MS = 6000
export const COMEBACK_FADE_MS = 500

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

// The next index of a bank of this size and the queue that is left after it. The queue that comes in is not changed. It is exported because the milestone lines (milestoneLines.ts, CONNECTIONS.md C50) are shuffled the same way.
export function nextIndex(size: number, old: BankQueue | undefined, random: () => number): { index: number; queue: BankQueue } {
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
