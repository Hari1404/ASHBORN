# ASHBORN PROGRESS

## Locked decisions
- Stack: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- React Bits components install as the TS-TW variant
- Menu: overlay menu, hamburger top-right (Overview, Pro Timer, Calendar, Guide)
- Login/main background: React Bits Pattern Waves (black background, white pattern, stays)
- Login card: dark smoked glass using React Bits GlassSurface, on the RIGHT side of the screen
- Glass settings live in the GLASS object at the top of src/components/LoginCard.tsx; the darkness is --ab-glass-tint inside the .ab-glass rule in src/login.css (tag AB:LOGIN.GLASS)
- Login button: solid white with black text; on mouse hover the whole button turns black with white text and a soft white glow around the edge (no outline), 0.15s change, and goes back when the pointer leaves
- Login field: User ID instead of email (look only for now)
- Login left side: animated text using React Bits BlurText, one line picked at random each time the screen loads (list lives in src/loginLines.ts)
- Code tags: every part of the code has a tag AB:<PAGE>.<PART> listed in CODE_MAP.md; rules are in TAGGING_RULES.md; check with node scripts/check-tags.mjs (from Packet 02I)
- Connections: CONNECTIONS.md lists which parts of the code are tied to which other parts; every packet that changes code also updates it; node scripts/check-tags.mjs checks it (from Packet 02J)
- Login name: ASHBORN is shown in the top left corner as React Bits Fuzzy Text in the font Syne ExtraBold, not inside the card (from Packet 02K)

## Done
- Packet 01: project setup
- Packet 01b: build fixed
- Packet 02A: Pattern Waves installed
- Packet 02B: login screen (look only, no real login)
- Packet 02C: BlurText installed
- Packet 02D: login layout (card right, text left, User ID field)
- Packet 02E: GlassSurface installed
- Packet 02F: dark glass login card (replaces the white card)
- Packet 02G: Sign in button hover (white to black)
- Packet 02H: Sign in button glow instead of outline, faster change
- Packet 02I: code tags, CODE_MAP.md, TAGGING_RULES.md, tag checker
- Packet 02J: CONNECTIONS.md, checker extended to connections, agent rule 11
- Packet 02K: ASHBORN name moved to the top left as Fuzzy Text (Syne), card title removed, connections C14 to C16
- Packet 02L: phone text size, card subtitle 16px and labels 15px under 900px wide, laptop unchanged
- Packet 03A: Supabase connected (settings in .env, never committed), real sign in with User ID and password, temporary signed-in screen with Sign out; owner still has to fill .env and create his user in the Supabase dashboard
- Packet 03B: phone speed, lite mode on touch screens (plain dark card, half-size background, name at 30 frames per second); page address ?lite=0, ?lite=1 or ?lite=2 forces a level
- Packet 04A: Dark Veil installed (not used yet)
- Packet 04D: Packet 04C undone. The login page has Pattern Waves again. Dark Veil stays installed and unused, it is meant for the page after login.
- Packet 04E: Dark Veil is the background of the page after login (the temporary signed-in screen). The login page is unchanged.
- Packet 04F: the menu (Staggered Menu) is on the signed-in screen, with four placeholder screens: Overview, Pro Timer, Calendar, Guide.
- Packet 05A: the Pro Timer database is set up in Supabase (two tables, row-level security, eight functions). The SQL is in supabase/timer_schema.sql and supabase/timer_verify.sql. The owner ran both by hand and all 5 check rows matched.
- Packet 05B: the Pro Timer maths as pure functions in src/lib/timerMaths.ts, with automated tests in src/lib/timerMaths.test.ts (run them with npm test, vitest).
- Packet 05C0: the React Bits Hold Button and the font Space Grotesk are installed (not used yet)
- Packet 05C: the Pro Timer screen at the page address #timer (big clock of the session with the hour ring, small clock with the day total, Start, Pause and Resume, End Session as the Hold Button, a No connection state), the calls to the database (src/lib/timerApi.ts) and the live state (src/lib/useTimer.ts), with automated tests (npm test; jsdom installed for the screen tests). The stop alert and the messages come in later packets.
- Packet 05C1: a glowing ball (the React Bits Crystalized Ball) sits behind the big clock of the Pro Timer and the hour ring is gone. Start lights the ball in white, it moves on to a colour at 10, 30 and 90 minutes (the quality steps), each session draws one of six palettes and its own flavour (one of 8 library presets, one of 4 dust motions, round or square dust: 64 looks, all drawn from the start time of the session so every device shows the same ball, and kept until the ball fades away), Pause stands it still and dims it, End fades it out. A browser without WebGL 2 shows no ball and the timer still works. The look is in src/lib/ballLook.ts and src/components/TimerBall.tsx, with automated tests.
- Packet 05C2: a moving background (the React Bits Meta Balls animation) sits behind the whole Pro Timer screen. Without a session the screen is black. Start fades it in, in white, and it takes the colour of the glowing ball at every moment (10, 30 and 90 minutes), Pause dims it, End fades it out. The animation is always drawn white by the library and a tint layer gives it the colour, so it is not built again when the colour moves. A browser without WebGL 2, and lite level 2, show no background and the timer still works. The look is in src/lib/backgroundLook.ts and src/components/TimerBackground.tsx, with automated tests.
- Packet 05C3: the Pro Timer on a wide screen (a laptop: at least 1000 px wide and 560 px high): the dial is a big circle on the left, and the line and the buttons (Start, or Pause and Hold to end session) stand on the right; the clock digits grow with the circle. The phone is unchanged (one column). The tags come in a later packet. With automated tests.
- Packet 05D1: the Pro Timer fits the window. On the phone the dial is only as high as the window allows (never below 150 px), so Start, Pause and the Hold Button never fall below the window; with a connection problem the dial leaves more room for the second text line and Try again. A window at least 600 px wide and wider than 5 to 4 (a laptop window made low, a phone held sideways) now gets the two columns, not only 1000 x 560 and more. The clock digits follow the size of the dial. A normal phone looks the same as before. With automated tests.

## Next
- Owner checks the login screen by eye (desktop and phone)
- Then: deploy, then real login and database
