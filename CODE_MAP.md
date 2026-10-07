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
| TIMER | Pro Timer: the maths and its tests are built; the screen is not built yet |
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
| `AB:AUTH.STUB` | The temporary signed-in screen with a Sign out button, on a Dark Veil background; its title is the name of the screen chosen in the menu | `src/components/SignedInStub.tsx`, `src/auth.css` | the Dark Veil props: speed, noiseIntensity, warpAmount, hueShift, scanlineIntensity, scanlineFrequency (resolutionScale must stay 1 and lightMode must stay false, see CONNECTIONS.md C23); the screen itself is thrown away when the real app shell is built |

## MENU (the menu)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:MENU.NAV` | The list of the four screens (id and name) and the reading of the page address (#timer) that chooses one | `src/lib/screens.ts` | the names of the screens; a new screen needs a new line here (see CONNECTIONS.md C24) |
| `AB:MENU.PANEL` | The menu itself: the Staggered Menu with its settings (side, layer colours, button colour, items) | `src/components/AppMenu.tsx` | the side it opens from (position), the colours of the sliding layers (colors); isFixed and displayItemNumbering must stay as they are (see CONNECTIONS.md C25) |
| `AB:MENU.LOOK` | The dark look of the menu: panel colour, text size, button size, the box that holds it | `src/menu.css` | colours and sizes; the blur must stay switched off (see CONNECTIONS.md C25) |

## TIMER (the Pro Timer)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:TIMER.MATHS` | The Pro Timer maths: whole seconds of a session, the clock text, quality (meh, solid, deep, flow), GO BACK IN, milestone messages, the hour ring and its colours, the day total. Pure functions: no screen and no database call | `src/lib/timerMaths.ts` | the neon colours of the ring (NEON_COLORS); the cut-offs, the milestone times and the 60 second rule are decisions, see CONNECTIONS.md C26 and C27 |
| `AB:TIMER.TESTS` | The automated tests of that maths. Run them with npm test | `src/lib/timerMaths.test.ts` | add tests; the numbers written in them must match the maths, see CONNECTIONS.md C27 |

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

## Untagged files
Setup and config files (package.json, vite and tsconfig files, index.html, src/env.d.ts, the file .env which is never committed), `src/index.css`, `src/main.tsx`, AGENTS.md, PROGRESS.md, CODE_MAP.md, CONNECTIONS.md, TAGGING_RULES.md, the packets folder, the scripts folder.
