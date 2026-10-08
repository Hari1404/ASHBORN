# ASHBORN CODE MAP
Kept up to date by the planner: every packet that touches code also updates this file. Checked by `node scripts/check-tags.mjs`. What is tied to what is in CONNECTIONS.md.

## How to use
1. Find the thing you want to change in the tables below (plain words).
2. Search the whole project for its tag followed by :START, for example `AB:LOGIN.BG:START` (VS Code: Ctrl+Shift+F).
3. Before you change it, search CONNECTIONS.md for the same tag and read every connection that names it. Those are the other places your change can break.
4. Change only the lines between that START and its END.
Full rules: TAGGING_RULES.md

## Page codes
| Code | Page or area |
|---|---|
| LOGIN | Front page: the login screen |
| MENU | The menu: a button in the top right corner that opens a panel with the four screens |
| OVERVIEW | Overview / Hub page (not built yet) |
| TIMER | Pro Timer: the maths, the database calls, the live state, the screen (page address #timer) with its glowing ball, and their tests are built; the stop alert and the messages are not built yet |
| CALENDAR | Calendar (not built yet) |
| GUIDE | Guide (not built yet) |
| SHARED | Things used on several pages, such as theme settings (not built yet) |
| AUTH | Sign-in plumbing: the Supabase connection, the saved sign-in, the choice of screen, the temporary signed-in screen |

## LOGIN (front page)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:LOGIN.BG` | The moving background (Pattern Waves) | `src/App.tsx` | its props, for example speed, scale, direction, colours, wave style (spacing and scale have a second, lite value, see CONNECTIONS.md C21) |
| `AB:LOGIN.LAYOUT` | Page structure and grid: text on the left and card on the right on wide screens, stacked on phones | `src/App.tsx`, `src/login.css` | spacing, gaps, the width where it switches to two columns |
| `AB:LOGIN.BRAND` | The ASHBORN name in the top left corner (Fuzzy Text: fuzzes, more on hover, short glitch every 2 seconds) | `src/App.tsx`, `src/components/LoginBrand.tsx`, `src/login.css` | the Fuzzy Text settings (intensity, fuzzRange, glitch, fontSize) in LoginBrand.tsx; position in the css |
| `AB:LOGIN.HERO` | The animated line on the left (BlurText) | `src/components/LoginHero.tsx`, `src/login.css` | reveal speed, by words or letters, direction; text size and shadow in the css |
| `AB:LOGIN.LINES` | The list of lines, one is picked at random each time the page loads | `src/loginLines.ts` | add, remove or reword lines |
| `AB:LOGIN.GLASS` | The dark glass card: frost, edge refraction, size, darkness. In lite mode (phones) it is a plain dark box instead of the glass | `src/components/LoginCard.tsx`, `src/login.css` | the GLASS settings (blur, displace, distortionScale, width); darkness (--ab-glass-tint), border and shadow in the css |
| `AB:LOGIN.FORM` | Card subtitle ("Sign in to continue") and the User ID and Password fields | `src/components/LoginCard.tsx`, `src/login.css` | wording; how the fields look (colours, hover, focus) in the css |
| `AB:LOGIN.SUBMIT` | What happens when the form is submitted: real sign in with Supabase, the busy state, the red error text (shown in FORM) | `src/components/LoginCard.tsx` | the wording of the messages |
| `AB:LOGIN.BUTTON` | The Sign in button and its hover effect | `src/components/LoginCard.tsx`, `src/login.css` | wording; colours, glow and speed in the css |
| `AB:LOGIN.LITE` | Lite mode: decides if the front page is drawn the light way (phones) or the full way (laptop); the page address can force a level with ?lite=0, ?lite=1 or ?lite=2 | `src/lib/lite.ts` | which devices get lite (the touch-screen test); what each level means is written in the comment at the top of the file |

## AUTH (sign-in plumbing)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:AUTH.CLIENT` | The one connection to Supabase, and the rule that turns a User ID into an email | `src/lib/supabase.ts` | what a User ID may contain; the three settings themselves are in the file .env |
| `AB:AUTH.SESSION` | Reads the saved sign-in and follows sign in and sign out | `src/lib/useSession.ts` | nothing yet |
| `AB:AUTH.GATE` | Chooses the screen: blank while loading, the front page, or the signed-in screen | `src/App.tsx` | which screen follows a sign in (the real app later) |
| `AB:AUTH.STUB` | The temporary signed-in screen with a Sign out button, on a Dark Veil background; its title is the name of the screen chosen in the menu; when Pro Timer is chosen it shows the Pro Timer screen instead (see CONNECTIONS.md C30) | `src/components/SignedInStub.tsx`, `src/auth.css` | the Dark Veil props: speed, noiseIntensity, warpAmount, hueShift, scanlineIntensity, scanlineFrequency (resolutionScale must stay 1 and lightMode must stay false, see CONNECTIONS.md C23); the screen itself is thrown away when the real app shell is built |

## MENU (the menu)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:MENU.NAV` | The list of the four screens (id and name) and the reading of the page address (#timer) that chooses one | `src/lib/screens.ts` | the names of the screens; a new screen needs a new line here (see CONNECTIONS.md C24) |
| `AB:MENU.PANEL` | The menu itself: the Staggered Menu with its settings (side, layer colours, button colour, items) | `src/components/AppMenu.tsx` | the side it opens from (position), the colours of the sliding layers (colors); isFixed and displayItemNumbering must stay as they are (see CONNECTIONS.md C25) |
| `AB:MENU.LOOK` | The dark look of the menu: panel colour, text size, button size, the box that holds it | `src/menu.css` | colours and sizes; the blur must stay switched off (see CONNECTIONS.md C25) |

## TIMER (the Pro Timer)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:TIMER.MATHS` | The Pro Timer maths: whole seconds of a session, the clock text, quality (meh, solid, deep, flow), GO BACK IN, milestone messages, the hour ring and its colours (built and tested, but the screen has not drawn the ring since Packet 05C1: the glowing ball took its place), the day total. Pure functions: no screen and no database call | `src/lib/timerMaths.ts` | the neon colours of the ring (NEON_COLORS, not shown on the screen at the moment); the cut-offs, the milestone times and the 60 second rule are decisions, see CONNECTIONS.md C26 and C27 |
| `AB:TIMER.API` | The calls from the app to the six database functions of the Pro Timer, and the checking of every answer; turns a database error name into a name the screen understands | `src/lib/timerApi.ts` | the waiting time before "no connection" (REQUEST_TIMEOUT_MS, see CONNECTIONS.md C33); the error names, function names and answer keys are tied to supabase/timer_schema.sql (CONNECTIONS.md C28 and C29) |
| `AB:TIMER.STATE` | The live state of the Pro Timer screen (a React hook): reads the database again every 30 seconds and when the page comes back, works out the seconds from the stored times, runs the buttons Start, Pause, Resume and End, the no connection state and the midnight rule | `src/lib/useTimer.ts` | how often it reads again (POLL_ONLINE_MS and POLL_OFFLINE_MS, see CONNECTIONS.md C33); the texts of the problem messages (problemText) |
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Plain black background, Space Grotesk digits | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
| `AB:TIMER.BALL-LOOK` | The look of the glowing ball as pure functions: the colour steps (they follow the quality of the session), the palettes, the blending of two colours, how many dust grains for a phone | `src/lib/ballLook.ts` | the colours of the palettes (BALL_PALETTES; every colour must be bright and vivid, the tests check it), how long a colour step takes (BALL_BLEND_MS), the dust grains per lite level, the fade time (BALL_FADE_MS, tied to the css, see CONNECTIONS.md C35); the steps are tied to the quality names, see CONNECTIONS.md C34 |
| `AB:TIMER.BALL` | The glowing ball behind the big clock: it lights when a session starts, changes colour as the session gets deeper, stands still and dims when paused, and fades when the session ends; it draws nothing when the browser has no WebGL 2. The library ball is `src/components/CrystalizedBall.tsx` | `src/components/TimerBall.tsx`, `src/timer.css` | the settings given to the ball (preset, size, interactive, dust grains) in TimerBall.tsx; the box of the ball, its dimming when paused and its fade time in the css (see CONNECTIONS.md C31 and C35) |
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer: the maths, the database calls, the live state, the screen, the glowing ball and its look, and the choice of screen in the signed-in stub. Run them with npm test | `src/lib/timerMaths.test.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/TimerBall.test.tsx`, `src/components/SignedInStub.test.tsx`, `src/lib/ballLook.test.ts` | add tests; the numbers and names written in them must match the code, see CONNECTIONS.md C27, C28, C29, C33, C34 and C35 |

## Library components (installed React Bits source: not tagged, never edited)
To change how one looks or moves, change its props where it is used, at the tag named here.
| Component | File | Settings live at |
|---|---|---|
| Pattern Waves (moving background) | `src/components/PatternWaves.tsx` | `AB:LOGIN.BG` |
| Dark Veil (moving background of the signed-in screen) | `src/components/DarkVeil.tsx` | `AB:AUTH.STUB` |
| BlurText (animated line) | `src/components/BlurText.tsx` | `AB:LOGIN.HERO` |
| GlassSurface (glass card) | `src/components/GlassSurface.tsx` | `AB:LOGIN.GLASS` |
| FuzzyText (the ASHBORN name) | `src/components/FuzzyText.tsx` | `AB:LOGIN.BRAND` |
| Staggered Menu (the menu) | `src/components/StaggeredMenu.tsx` | `AB:MENU.PANEL` |
| CrystalizedBall (the glowing ball of the Pro Timer) | `src/components/CrystalizedBall.tsx` | `AB:TIMER.BALL` |
| Hold Button (the End Session button) | `src/components/HoldButton.tsx` | `AB:TIMER.SCREEN` |

## Untagged files
Setup and config files (package.json, vite and tsconfig files, index.html, src/env.d.ts, the file .env which is never committed), `src/index.css`, `src/main.tsx`, AGENTS.md, PROGRESS.md, CODE_MAP.md, CONNECTIONS.md, TAGGING_RULES.md, the packets folder, the scripts folder.
