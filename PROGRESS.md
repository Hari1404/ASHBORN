# ASHBORN PROGRESS

## Locked decisions
- Stack: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- React Bits components install as the TS-TW variant
- Menu: overlay menu, hamburger top-right (Overview, Pro Timer, Calendar, Guide)
- Login/main background: React Bits Pattern Waves (black background, white pattern, stays)
- Login card: dark smoked glass using React Bits GlassSurface, on the RIGHT side of the screen
- Glass settings live in the GLASS object at the top of src/components/LoginCard.tsx; the darkness is --ab-glass-tint at the top of .ab-screen in src/login.css
- Login button: solid white with black text; on mouse hover the whole button turns black with white text and a soft white glow around the edge (no outline), 0.15s change, and goes back when the pointer leaves
- Login field: User ID instead of email (look only for now)
- Login left side: animated text using React Bits BlurText, one line picked at random each time the screen loads (list lives in src/loginLines.ts)

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

## Next
- Owner checks the login screen by eye (desktop and phone)
- Then: deploy, then real login and database
