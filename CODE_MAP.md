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
| MENU | Overlay menu with the hamburger button (not built yet) |
| OVERVIEW | Overview / Hub page (not built yet) |
| TIMER | Pro Timer (not built yet) |
| CALENDAR | Calendar (not built yet) |
| GUIDE | Guide (not built yet) |
| SHARED | Things used on several pages, such as theme settings (not built yet) |

## LOGIN (front page)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:LOGIN.BG` | The moving background (Pattern Waves) | `src/App.tsx` | its props, for example speed, scale, direction, colours, wave style |
| `AB:LOGIN.LAYOUT` | Page structure and grid: text on the left and card on the right on wide screens, stacked on phones | `src/App.tsx`, `src/login.css` | spacing, gaps, the width where it switches to two columns |
| `AB:LOGIN.HERO` | The animated line on the left (BlurText) | `src/components/LoginHero.tsx`, `src/login.css` | reveal speed, by words or letters, direction; text size and shadow in the css |
| `AB:LOGIN.LINES` | The list of lines, one is picked at random each time the page loads | `src/loginLines.ts` | add, remove or reword lines |
| `AB:LOGIN.GLASS` | The dark glass card: frost, edge refraction, size, darkness | `src/components/LoginCard.tsx`, `src/login.css` | the GLASS settings (blur, displace, distortionScale, width); darkness (--ab-glass-tint), border and shadow in the css |
| `AB:LOGIN.FORM` | Card title, subtitle, and the User ID and Password fields | `src/components/LoginCard.tsx`, `src/login.css` | wording; how the fields look (colours, hover, focus) in the css |
| `AB:LOGIN.SUBMIT` | What happens when the form is submitted (nothing yet) | `src/components/LoginCard.tsx` | real login goes here later |
| `AB:LOGIN.BUTTON` | The Sign in button and its hover effect | `src/components/LoginCard.tsx`, `src/login.css` | wording; colours, glow and speed in the css |

## Library components (installed React Bits source: not tagged, never edited)
To change how one looks or moves, change its props where it is used, at the tag named here.
| Component | File | Settings live at |
|---|---|---|
| Pattern Waves (moving background) | `src/components/PatternWaves.tsx` | `AB:LOGIN.BG` |
| BlurText (animated line) | `src/components/BlurText.tsx` | `AB:LOGIN.HERO` |
| GlassSurface (glass card) | `src/components/GlassSurface.tsx` | `AB:LOGIN.GLASS` |

## Untagged files
Setup and config files (package.json, vite and tsconfig files, index.html), `src/index.css`, `src/main.tsx`, AGENTS.md, PROGRESS.md, CODE_MAP.md, CONNECTIONS.md, TAGGING_RULES.md, the packets folder, the scripts folder.
