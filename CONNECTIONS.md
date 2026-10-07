# ASHBORN CONNECTIONS
Which parts of the code are tied to which other parts. Read this BEFORE you change anything. Kept up to date by the planner: every packet that changes code also updates this file. Checked by `node scripts/check-tags.mjs` (it must print a line starting CONNECTIONS OK).

## How to use
1. Find the tag of the part you want to change in CODE_MAP.md.
2. Search THIS file for that tag, for example `AB:LOGIN.BUTTON` (VS Code: Ctrl+F). Every connection that names it is listed below.
3. For each one, read "If you change" and "Then also". Those are the other places that must change together with yours, or be re-checked.
4. If your change touches a linked place, it is NOT a tiny change. Give it to the planner. The planner writes a packet that changes all linked places and this file together.

## What the checker proves, and what it does not
- Every "Anchor" line below names a piece of text that must still exist in a linked place. If one end of a connection is changed on its own, that text is gone and the checker fails. It pins names and values that are LINKED. It does not pin a value that is safe to tune alone (for example the glass darkness or an animation speed).
- By itself the checker also verifies: every `ab-` class used in a .tsx file is defined in a .css file and the other way round; every `--ab-` css variable that is used is defined and the other way round; every label points to a field that exists.
- It does NOT find new connections. Only the planner adds a connection, when writing a packet. It does NOT check how anything looks.
- Not repeated here because `npm run build` already catches it: a broken import, and a wrong prop name written directly on a component. One hole the build does NOT catch is row C13.
- Anchor lines only read .ts, .tsx and .css files under src. An anchor written as `file = text` (no tag) checks the whole file. It is used for a linked line that sits outside every tag.

## Connections on the LOGIN page

### C01: The card width is written in three places
- Tags: `AB:LOGIN.GLASS`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`
- If you change: the card width (now 440px) in any one of the three places
- Then also: change the same number in the other two. The places are the GLASS width setting in LoginCard.tsx, the right-hand column of the wide-screen grid in login.css (LAYOUT), and the phone width of the hero text block in login.css (HERO).
- If you forget: on a laptop the card and its column stop matching (the card hangs to the left or gets squeezed); on a phone the text and the card get different widths.
- Anchor: `AB:LOGIN.GLASS @ src/components/LoginCard.tsx = width: "min(100%, 440px)"`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = grid-template-columns: 1fr minmax(0, 440px);`
- Anchor: `AB:LOGIN.HERO @ src/login.css = width: min(100%, 440px);`

### C02: The width where the page switches to two columns is written twice
- Tags: `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`
- If you change: the 900px in either `@media (min-width: 900px)` block
- Then also: change the other block to the same number.
- If you forget: between the two numbers the page mixes layouts, for example the big wide-screen text on a one-column page, or the small phone text in two columns.
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = @media (min-width: 900px)`
- Anchor: `AB:LOGIN.HERO @ src/login.css = @media (min-width: 900px)`

### C03: The front page is built for white on black
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`, `AB:LOGIN.BRAND`
- If you change: the background colour (backgroundColor in BG), the page base colour (.ab-screen in LAYOUT), the hero text colour (HERO), or the colour of the name in the top left corner (color in BRAND)
- Then also: keep the background colour and the page base colour the same. Then look at the hero line and at the ASHBORN name in the corner: both are white and sit straight on the animation (the hero line is helped by a dark shadow, the name by nothing).
- If you forget: with a light or colourful background the white line on the left becomes hard or impossible to read; a base colour that differs from the animation shows as a flash or a band before the animation loads.
- Anchor: `AB:LOGIN.BG @ src/App.tsx = backgroundColor="#000000"`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = background: #000;`
- Anchor: `AB:LOGIN.HERO @ src/login.css = color: #fff;`
- Anchor: `AB:LOGIN.BRAND @ src/components/LoginBrand.tsx = color="#fff"`

### C04: The card text and the Sign in button are built for dark glass
- Tags: `AB:LOGIN.GLASS`, `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: how dark the glass is (--ab-glass-tint in GLASS), or the white text, white field borders or white button (FORM and BUTTON)
- Then also: making the glass darker is safe. Making it lighter or clearer means the white text, the fields and the white button must be redone for a light card. A new text colour needs a card dark enough for it.
- If you forget: text and button you cannot read.
- Anchor: `AB:LOGIN.GLASS @ src/login.css = --ab-glass-tint:`
- Anchor: `AB:LOGIN.BUTTON @ src/login.css = background: #fff;`
- Check by hand: the checker does NOT notice a glass made lighter, and does NOT notice a changed text colour in FORM (the same colour is written in several rules). After any such change, look at the card.

### C05: The card is dark for everyone only because of one class name and an override
- Tags: `AB:LOGIN.GLASS`
- If you change: the class name ab-glass, the !important lines, or the GlassSurface file (for example installing a newer version)
- Then also: LoginCard gives the glass the class ab-glass on a line that is outside every tag (the opening GlassSurface line). login.css overrides the component's own colours with !important. Keep both. After any change to the GlassSurface file, look at the card again, on a device set to light mode and one set to dark mode.
- If you forget: the card turns light or clear depending on the viewer's light or dark setting.
- Anchor: `AB:LOGIN.GLASS @ src/login.css = .ab-glass {`
- Anchor: `AB:LOGIN.GLASS @ src/login.css = background: var(--ab-glass-tint) !important;`
- Anchor: `src/components/LoginCard.tsx = className="ab-glass"`

### C06: The Sign in button works because of the form and handleSubmit
- Tags: `AB:LOGIN.BUTTON`, `AB:LOGIN.SUBMIT`
- If you change: the button type, the place of the button, the form line, or the name handleSubmit
- Then also: pressing Sign in (or Enter in a field) works because the button is type submit, it sits inside the form, and the form calls handleSubmit. The form line is outside every tag. When real login is added it goes into SUBMIT.
- If you forget: pressing the button does nothing, or the page reloads.
- Anchor: `AB:LOGIN.BUTTON @ src/components/LoginCard.tsx = type="submit"`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = const handleSubmit`
- Anchor: `src/components/LoginCard.tsx = onSubmit={handleSubmit}`

### C07: The form fields: labels, ids and names
- Tags: `AB:LOGIN.FORM`, `AB:LOGIN.SUBMIT`
- If you change: an id, a htmlFor or a name of a field
- Then also: each label's htmlFor must equal the id of its field (the checker also does this by itself). The names username and password are what real login will read later in SUBMIT, and what phone password managers use together with the autoComplete values.
- If you forget: tapping a label no longer selects its field; password managers may not fill; the real login will not find the typed values.
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = htmlFor="ab-userid"`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = htmlFor="ab-password"`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = name="username"`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = name="password"`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = form.get("username")`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = form.get("password")`

### C08: The button gets its place from the form layout
- Tags: `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: the form layout (.ab-content in FORM), the button margin (BUTTON), or move the button out of the form
- Then also: the form stacks everything in one column with a gap, and the button sits inside the form as the last item. The button's own top margin adds to that gap. Changing the gap only moves the button; it is safe.
- If you forget: the button jumps out of line, or its distance to the fields changes.
- Anchor: `src/components/LoginCard.tsx = <form className="ab-content"`
- Anchor: `AB:LOGIN.BUTTON @ src/components/LoginCard.tsx = <button className="ab-button"`
- Anchor: `AB:LOGIN.FORM @ src/login.css = flex-direction: column;`

### C09: The reduce-motion rule for the fields lives in the BUTTON block
- Tags: `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: the transitions of the fields (FORM), or the reduce-motion block (BUTTON)
- Then also: the `@media (prefers-reduced-motion: reduce)` block at the end of BUTTON also switches off the field transitions of FORM. Keep `.ab-input` in that block.
- If you forget: people who asked their phone for less motion still get the field animation.
- Anchor: `AB:LOGIN.BUTTON @ src/login.css = .ab-input,`
- Anchor: `AB:LOGIN.FORM @ src/login.css = .ab-input {`

### C10: The hero line is picked from the list in loginLines.ts
- Tags: `AB:LOGIN.HERO`, `AB:LOGIN.LINES`
- If you change: the name LOGIN_LINES, or how many lines the list holds
- Then also: HERO imports LOGIN_LINES (the import line is outside every tag) and picks one at random. If you rename the list, rename it in the import and in HERO. NEVER leave the list empty: there is then nothing to pick.
- If you forget: the build fails on a renamed list; an empty list leaves the left side blank or breaks the page.
- Anchor: `AB:LOGIN.LINES @ src/loginLines.ts = export const LOGIN_LINES`
- Anchor: `AB:LOGIN.HERO @ src/components/LoginHero.tsx = LOGIN_LINES[Math.floor(Math.random() * LOGIN_LINES.length)]`
- Anchor: `src/components/LoginHero.tsx = import { LOGIN_LINES } from "@/loginLines"`

### C11: The background gets its size and its place behind the card from the LAYOUT css
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`
- If you change: the .ab-bg rule, the z-index of .ab-center (both in LAYOUT), or the wrapper line in BG
- Then also: the BG block only holds the animation and its settings. The wrapper class ab-bg is styled in LAYOUT: it is fixed and fills the screen. The content sits above it because .ab-center has z-index 1.
- If you forget: the animation shrinks to nothing, scrolls with the page, or covers the card.
- Anchor: `AB:LOGIN.BG @ src/App.tsx = className="ab-bg"`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = position: fixed;`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = z-index: 1;`

### C12: The order of hero and card decides which side each one is on
- Tags: `AB:LOGIN.LAYOUT`
- If you change: the order of LoginHero and LoginCard in LAYOUT, or the column sizes of the grid
- Then also: the first item is the left column (it stretches) and also the top item on a phone; the second is the right column (fixed 440px). Swap the order and you must swap the column sizes too, and on phones the card would then be on top.
- If you forget: the card is squeezed into the wide column or the text into the narrow one.
- Check by hand: the checker sees that both are still there and that the column sizes are unchanged, but it cannot see their ORDER. After any change, look at the page.
- Anchor: `AB:LOGIN.LAYOUT @ src/App.tsx = <LoginHero />`
- Anchor: `AB:LOGIN.LAYOUT @ src/App.tsx = <LoginCard />`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = grid-template-columns: 1fr minmax(0, 440px);`

### C13: The GLASS settings are the settings of a library file and a typo is not caught
- Tags: `AB:LOGIN.GLASS`
- If you change: a name inside the GLASS object, or the GlassSurface file
- Then also: the GLASS object is passed to the component as a whole. A name the component does not know is ignored without any error, and the build does not report it (tested). The names the component accepted when it was installed are in the handoff, section 17. After a change, look at the card to see that the setting did something.
- If you forget: a setting silently does nothing.
- Check by hand: change the setting, look at the card, and compare with the names in the handoff, section 17.

### C14: The name in the corner is a canvas with a see-through margin
- Tags: `AB:LOGIN.BRAND`
- If you change: fuzzRange in LoginBrand.tsx, or the margin-left of the canvas in login.css
- Then also: Fuzzy Text draws on a canvas that is wider than the letters: it adds a see-through margin of fuzzRange + 20 pixels on each side, plus 5 pixels of its own. The negative margin-left in BRAND (now -55px, which is 30 + 20 + 5) cancels it so the letters start at the corner offset. If you change fuzzRange to a new number, margin-left becomes minus (new number + 25).
- If you forget: the name sits too far to the right, or is cut off at the left edge of the screen, and no longer lines up with the hero line below it.
- Anchor: `AB:LOGIN.BRAND @ src/components/LoginBrand.tsx = fuzzRange={30}`
- Anchor: `AB:LOGIN.BRAND @ src/login.css = margin-left: -55px;`

### C15: The name in the corner sits on top of the page and the content is kept clear of it
- Tags: `AB:LOGIN.BRAND`, `AB:LOGIN.LAYOUT`
- If you change: the size of the name (fontSize in LoginBrand.tsx), its position or z-index (BRAND), the top padding of the phone layout (.ab-center in LAYOUT), the z-index of .ab-center (LAYOUT), or where LoginBrand sits in App.tsx
- Then also: the name is positioned in the top left corner of the whole page (.ab-screen in LAYOUT is position: relative) and has z-index 2, above the content (z-index 1). The phone layout has 84px of padding on top so the hero line and the card start below the name. A bigger name needs more top padding. LoginBrand must stay OUTSIDE the .ab-center grid in App.tsx: inside it, it would become a grid cell and break the column order (see C12).
- If you forget: the name overlaps the hero line or the card on a phone, hides behind the content, or pushes the hero line and the card out of their columns on a laptop.
- Check by hand: the checker cannot see whether LoginBrand is inside or outside the .ab-center grid, or whether the name overlaps anything. After any change, look at the page on a laptop and on a phone.
- Anchor: `AB:LOGIN.BRAND @ src/App.tsx = <LoginBrand />`
- Anchor: `AB:LOGIN.BRAND @ src/login.css = position: absolute;`
- Anchor: `AB:LOGIN.BRAND @ src/login.css = z-index: 2;`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = padding: 84px 24px 24px;`

### C16: The font of the name is a package, a css import and a font family name
- Tags: `AB:LOGIN.BRAND`
- If you change: the font of the name (now Syne, weight 800)
- Then also: three places must change together: the package (npm install @fontsource-variable/<new font>), the @import line at the top of login.css (it sits outside every tag, above LAYOUT), and fontFamily in LoginBrand.tsx (the family name is written the way the package defines it, for example "Syne Variable"). The weight (fontWeight 800) must exist in the new font. Pick a heavy font: Fuzzy Text shifts rows of pixels, and thin letters turn to mush.
- If you forget: the name appears in a plain fallback font, or the build fails because the css import cannot find the package.
- Anchor: `src/login.css = @import "@fontsource-variable/syne";`
- Anchor: `AB:LOGIN.BRAND @ src/components/LoginBrand.tsx = fontFamily='"Syne Variable", sans-serif'`
- Check by hand: after a font change look at the name; the checker does not see whether the font really loaded.

### C21: The lite background is drawn at half size and scaled back up
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`
- If you change: spacing or scale of the background in BG, or the size or scale lines of `.ab-bg[data-lite]` in LAYOUT
- Then also: in lite mode the animation is drawn in a box of half the size (50% wide and high, plus 1px) and the css scales it up by 2 (scale(2)). A phone then draws a quarter of the pixels. So the lite value of spacing must be half of the full value (now 4 and 8) and the lite value of scale must be half of the full value (now 0.575 and 1.15); otherwise the dots and waves look twice as big or small in lite mode. Spacing cannot go below 4 (the component's own limit), so with a full spacing of 8 the box cannot be shrunk by more than 2. The attribute data-lite in App.tsx and the css selector `.ab-bg[data-lite]` are linked by that name.
- If you forget: lite mode shows the wrong dot size or wave size, or the background stays full size and the phone stays slow (a misspelled data-lite is not an error anywhere).
- Anchor: `AB:LOGIN.BG @ src/App.tsx = spacing={LITE_LEVEL > 0 ? 4 : 8}`
- Anchor: `AB:LOGIN.BG @ src/App.tsx = scale={LITE_LEVEL > 0 ? 0.575 : 1.15}`
- Anchor: `AB:LOGIN.BG @ src/App.tsx = data-lite={`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg[data-lite] {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = width: calc(50% + 1px);`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = height: calc(50% + 1px);`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = transform: scale(2);`
- Check by hand: after any change look at the page on a laptop with ?lite=0 and with ?lite=1 in the page address. The dots and the waves must look the same size in both.

### C22: Lite mode is one switch that four files read
- Tags: `AB:LOGIN.LITE`, `AB:LOGIN.BG`, `AB:LOGIN.BRAND`, `AB:LOGIN.GLASS`
- If you change: how lite is decided or what its levels mean (the file src/lib/lite.ts), or add or remove a lite effect
- Then also: LITE_LEVEL is read in four files. SignedInStub.tsx (STUB): the Dark Veil background of the signed-in screen, in the same half-size box, with speed 0 at level 2 (see C23). App.tsx (BG): half-size background with its own spacing and scale (see C21), and a still background at level 2. LoginCard.tsx: at level 1 and 2 the card is a plain dark box with the classes ab-glass and ab-glass-lite instead of GlassSurface; the box takes its width and corner radius from the GLASS object, so it adds no new place for the card width in C01. LoginBrand.tsx (BRAND): 30 frames per second instead of 60. The css of the plain box is `.ab-glass-lite` in GLASS (login.css); it must stay below `.ab-glass` because it replaces the tint set there. The page address can force a level: ?lite=0 full look, ?lite=1 lite, ?lite=2 lite with a still background.
- If you forget: a phone gets the heavy glass again, or a laptop gets the lite look; a lite effect that is not listed here is forgotten the next time somebody changes lite mode.
- Anchor: `AB:LOGIN.LITE @ src/lib/lite.ts = export const LITE_LEVEL`
- Anchor: `src/App.tsx = import { LITE_LEVEL } from "@/lib/lite"`
- Anchor: `src/components/LoginCard.tsx = import { LITE_LEVEL } from "@/lib/lite"`
- Anchor: `src/components/LoginBrand.tsx = import { LITE_LEVEL } from "@/lib/lite"`
- Anchor: `src/components/SignedInStub.tsx = import { LITE_LEVEL } from "@/lib/lite"`
- Anchor: `src/components/LoginCard.tsx = className="ab-glass ab-glass-lite"`
- Anchor: `AB:LOGIN.GLASS @ src/login.css = .ab-glass-lite {`
- Check by hand: after any change look at the card on a laptop with ?lite=0 (glass) and ?lite=1 (plain dark box), then on the phone. The checker does not see how it looks or how smooth it is.

## Connections on the AUTH plumbing

### C17: The email form is written in three places: .env, the code rule and the Supabase user
- Tags: `AB:AUTH.CLIENT`, `AB:LOGIN.SUBMIT`
- If you change: the line VITE_LOGIN_EMAIL_TEMPLATE in .env, the User ID rule inside userIdToEmail, or the name userIdToEmail
- Then also: SUBMIT turns the typed User ID into an email with userIdToEmail, and Supabase knows each user only by that exact email. If the form changes, every user in the Supabase dashboard must get the matching new email (or be created again). A user created again is a NEW user: data tied to the old one is not reachable from it. After any change to .env, stop and restart `npm run dev`.
- If you forget: "User ID or password is wrong" with a correct password.
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = export function userIdToEmail`
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = VITE_LOGIN_EMAIL_TEMPLATE`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = userIdToEmail(userId)`
- Check by hand: the checker does NOT read .env and does NOT see the Supabase dashboard. After any change, sign in once to prove the three places still agree.

### C18: The names of the three settings in .env and in the code
- Tags: `AB:AUTH.CLIENT`
- If you change: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in supabase.ts, or the same names in .env
- Then also: .env must use exactly the same names. Only names that start with VITE_ reach the browser. The secret key (or the old service_role key) must NEVER be written into .env or any file, with or without a VITE_ name.
- If you forget: the Sign in button shows "Not connected" because the code finds no setting.
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = import.meta.env.VITE_SUPABASE_URL`
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`

### C19: Which screen is shown comes from the saved sign-in
- Tags: `AB:AUTH.GATE`, `AB:AUTH.SESSION`, `AB:AUTH.STUB`
- If you change: the name useSession, the three states it gives (loading, null, a session), or the SignedInStub screen
- Then also: App (GATE) shows nothing while the state is loading, the front page when it is null, and the signed-in screen when it is a session. The Sign out button lives in AUTH.STUB. When the real app shell replaces the stub, the gate and the sign out button move with it.
- If you forget: the front page flashes before the app, a signed-in person is stuck on the front page, or there is no way to sign out.
- Anchor: `AB:AUTH.GATE @ src/App.tsx = const session = useSession()`
- Anchor: `AB:AUTH.GATE @ src/App.tsx = <SignedInStub`
- Anchor: `AB:AUTH.SESSION @ src/lib/useSession.ts = export function useSession`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = auth.signOut()`

### C20: The red message and the busy state are made in SUBMIT and shown in FORM and BUTTON
- Tags: `AB:LOGIN.SUBMIT`, `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: the names message or busy, the red line under the fields (FORM), or the disabled setting of the button (BUTTON)
- Then also: handleSubmit (SUBMIT) holds the state. FORM shows `message`, BUTTON is switched off with `busy` while the sign in runs, so a double tap cannot send two requests. Rename in all three places.
- If you forget: errors never show, or the button never switches back on after a wrong password.
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = const [message, setMessage] = useState("")`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = const [busy, setBusy] = useState(false)`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = {message ? (`
- Anchor: `AB:LOGIN.BUTTON @ src/components/LoginCard.tsx = disabled={busy}`

### C23: The signed-in screen draws Dark Veil in the same half size box as the front page
- Tags: `AB:AUTH.STUB`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.LITE`
- If you change: the Dark Veil settings or the wrapper line in STUB, the `.ab-bg` rules in LAYOUT (login.css), or the lite levels in `src/lib/lite.ts`
- Then also: the background of the signed-in screen is a div with the class ab-bg and the attribute data-lite, the SAME class and attribute as the front page (C11, C21). It gets its place behind the content and its half-size lite box from the `.ab-bg` rules in login.css; those rules are loaded because App.tsx imports login.css. If `.ab-bg` is renamed, or login.css stops being loaded, the background of the signed-in screen loses its place. The text and the button sit above it because of the rule `.ab-stub > :not(.ab-bg)` in auth.css. resolutionScale must stay 1 and lightMode must stay false (see C03 and C21).
- If you forget: the background shows as a small box, covers the text, or stays full size on a phone.
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = className="ab-bg"`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = data-lite={`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = resolutionScale={1}`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = lightMode={false}`
- Anchor: `AB:AUTH.STUB @ src/auth.css = .ab-stub > :not(.ab-bg) {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg[data-lite] {`
- Anchor: `AB:LOGIN.LITE @ src/lib/lite.ts = export const LITE_LEVEL`
- Check by hand: after any change sign in, then look at the signed-in screen on a laptop with ?lite=0 and with ?lite=1 in the page address. The picture must fill the whole screen with no band at the edges, and the text and the Sign out button must be readable.

### C24: The menu items and the screens come from one list, and the page address (#timer) joins them
- Tags: `AB:MENU.NAV`, `AB:MENU.PANEL`, `AB:AUTH.STUB`
- If you change: the list SCREENS (an id or a name), the way the address is read (NAV), the item link in PANEL, or the title in STUB
- Then also: PANEL builds its four items from SCREENS, and the link of each item is the sign # followed by the id (for example #timer). The library draws each item as a normal link, so a tap changes the address, and NAV (useScreen) reads it again through the hashchange event. STUB shows the name of the chosen screen as its title. A new screen needs a new id in SCREENS (the id is also the text in the page address) and later its own screen. A tap on an item also presses the menu button once so the panel closes (closeAfterItemTap in PANEL): that relies on the library class names sm-panel-item and sm-toggle (see C25).
- If you forget: an item that changes nothing, a title that does not follow the menu, or a panel that stays open after a tap.
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = export const SCREENS`
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = window.location.hash`
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = "hashchange"`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = SCREENS.map(`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = link: "#" + s.id,`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = closest(".sm-panel-item")`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = querySelector<HTMLButtonElement>(".sm-toggle")`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = useScreen()`
- Anchor: `src/components/SignedInStub.tsx = import { SCREENS, useScreen } from "@/lib/screens"`

### C25: The menu look is css written against the class names of the library file
- Tags: `AB:MENU.PANEL`, `AB:MENU.LOOK`, `AB:AUTH.STUB`
- If you change: the box class ab-menu (PANEL and LOOK), any rule of LOOK, the settings isFixed or displayItemNumbering in PANEL, the place of AppMenu in STUB, or the library file StaggeredMenu.tsx (installed again, or a newer version)
- Then also: the library draws a white panel with black text and has its own css inside the component. LOOK turns it dark with rules that start with .ab-menu and .sm-scope; they are more specific than the library rules, so they win without editing the library file. The blur is switched off with !important on purpose: the library sets the blur inline on the panel, an inline value loses only to !important, and a blur over the moving background is the kind of effect that made the front page laggy on the phone (see C22). The library always draws a logo: PANEL gives it a 1 pixel see-through picture (so no file is requested) and LOOK hides it. The box .ab-menu is fixed over the whole screen and lets taps through (pointer-events: none); only the button and the panel take taps again. The stub rule .ab-stub > :not(.ab-bg) (C23) would make the box relative and break it, so AppMenu stays BESIDE the main element in STUB, never inside it. isFixed stays false because the box .ab-menu is the fixed part. displayItemNumbering stays false because the number would sit on top of the text at the smaller text size.
- If you forget: a white panel with black text, a blurred panel that makes the phone lag, taps on the page not reaching the Sign out button, or the menu button in the wrong place.
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = className="ab-menu"`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = isFixed={false}`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = displayItemNumbering={false}`
- Anchor: `AB:MENU.LOOK @ src/menu.css = .ab-menu {`
- Anchor: `AB:MENU.LOOK @ src/menu.css = pointer-events: none;`
- Anchor: `AB:MENU.LOOK @ src/menu.css = .ab-menu .sm-scope .staggered-menu-panel {`
- Anchor: `AB:MENU.LOOK @ src/menu.css = backdrop-filter: none !important;`
- Anchor: `AB:MENU.LOOK @ src/menu.css = -webkit-backdrop-filter: none !important;`
- Anchor: `AB:MENU.LOOK @ src/menu.css = .ab-menu .sm-scope .sm-panel-item {`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = <AppMenu />`
- Check by hand: after any change open the signed-in screen on a laptop and on the phone. The menu button (the word Menu and a plus) is in the top right corner. A tap opens a dark panel (the full width on a phone, a column on the right on a laptop) with Overview, Pro Timer, Calendar and Guide. A tap on an item changes the title of the screen and closes the panel. The Sign out button still works when the panel is closed. The checker does not see how it looks.

## Connections on the TIMER

### C26: The timer maths copies how the database counts a session
- Tags: `AB:TIMER.MATHS`, `AB:TIMER.TESTS`
- If you change: the 60 second rule, the way the seconds of a session are counted, the names of the fields of a running session (the type TimerRow), the day rule, or any function in supabase/timer_schema.sql (timer_end, timer_cap_at, timer_row_json, timer_state)
- Then also: the maths copies timer_end: the end is the smaller of now and cap_at (local midnight); a paused session counts up to paused_at only; then whole seconds (cut off, never rounded) of that moment minus started_at minus paused_seconds, never below 0. The 60 second rule is in the database twice (the table rule timer_sessions_min_length and the line v_active >= 60 in timer_end). The fields of TimerRow are the keys that timer_row_json sends: started_at, tz, status, paused_at, paused_seconds, cap_at. A change in a SQL file has to be run again in the Supabase SQL Editor by the owner (the agent cannot run SQL), and the maths and the tests change in the same packet. The checker does not read SQL files, so the SQL side is checked by hand.
- If you forget: the screen shows a different number of seconds than the database saves, for example a session that shows 60 seconds and is not saved, or the other way round.
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MIN_SESSION_SECONDS = 60`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = started_at: string`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = paused_at: string`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = paused_seconds: number`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = cap_at: string`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = const end = Math.min(toMicros(serverNowMs), cap)`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = Math.floor(Math.max(0, activeMicros) / 1000000)`
- Check by hand: after any change compare supabase/timer_schema.sql with the maths. The 60 in timer_sessions_min_length and in timer_end, the function timer_cap_at, the counting lines in timer_end, and the keys in timer_row_json must still say what the maths says.

### C27: The cut-offs are written in the maths and written again in the tests, on purpose
- Tags: `AB:TIMER.MATHS`, `AB:TIMER.TESTS`
- If you change: any number at the top of timerMaths.ts: the 60 second rule, the quality cut-offs (10, 30 and 90 minutes), GO BACK IN (under 45 minutes), the milestone minutes, the 10 second live step, the 3600 second ring loop
- Then also: the same numbers are written again in the tests, so that the tests say what the owner decided. Change both, run npm test, and only change a number the owner has decided to change (PRO_TIMER_PLAN_DECISIONS.md). A cut-off or the 60 second rule is NOT a tiny change: it is also linked to the database (C26). The neon colours and the first ring colour are safe to tune alone and are not pinned.
- If you forget: npm test fails, or this checker fails first.
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const SOLID_FROM_SECONDS = 600`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const DEEP_FROM_SECONDS = 1800`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const FLOW_FROM_SECONDS = 5400`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const GO_BACK_IN_LIMIT_SECONDS = 2700`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MILESTONE_MINUTES = [15, 25, 45, 60, 90, 120, 150, 180] as const`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MAX_LIVE_STEP_SECONDS = 10`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const RING_LOOP_SECONDS = 3600`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(MIN_SESSION_SECONDS).toBe(60)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(SOLID_FROM_SECONDS).toBe(600)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(DEEP_FROM_SECONDS).toBe(1800)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(FLOW_FROM_SECONDS).toBe(5400)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(GO_BACK_IN_LIMIT_SECONDS).toBe(2700)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect([...MILESTONE_MINUTES]).toEqual([15, 25, 45, 60, 90, 120, 150, 180])`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(MAX_LIVE_STEP_SECONDS).toBe(10)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(RING_LOOP_SECONDS).toBe(3600)`

### C28: The error names are written in the database, in the app's list and in the screen's rules
- Tags: `AB:TIMER.API`, `AB:TIMER.STATE`, `AB:TIMER.TESTS`
- If you change: an error name in supabase/timer_schema.sql (a line raise exception), the list DATABASE_ERRORS in timerApi.ts, the list CONFLICTS or the function problemText in useTimer.ts
- Then also: the SQL functions raise six names: ALREADY_RUNNING, NOT_RUNNING, NOT_PAUSED, DAY_ENDED, BAD_TIMEZONE and NOT_SIGNED_IN. The database client delivers the name as the text of the error; classifyError finds it there and makes a TimerError with that name. useTimer reacts to the names: the first four (the list CONFLICTS) mean that the state on the server is not what this screen showed, so the screen reads the state again and shows what is true; NOT_SIGNED_IN and BAD_TIMEZONE get their own text in problemText. A name must be the same in all three places. A change in the SQL file has to be run again in the Supabase SQL Editor by the owner (the agent cannot run SQL). The checker does not read SQL files, but npm test does: timerApi.test.ts reads the text of supabase/timer_schema.sql and fails when the SQL raises a name that is not in DATABASE_ERRORS, or the other way round. Old copies of the site in a phone browser keep working only if the names stay the same.
- If you forget: a button that does nothing, a state that is out of step with the other device, or an error shown as Something went wrong.
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "ALREADY_RUNNING",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_RUNNING",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_PAUSED",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "DAY_ENDED",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "BAD_TIMEZONE",`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts =   "NOT_SIGNED_IN",`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const CONFLICTS: readonly TimerErrorKind[] = ["ALREADY_RUNNING", "NOT_RUNNING", "NOT_PAUSED", "DAY_ENDED"]`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = expect([...raised].sort()).toEqual([...DATABASE_ERRORS].sort())`
- Check by hand: after any change in supabase/timer_schema.sql run npm test (it reads that file), and the owner runs the changed SQL in the Supabase SQL Editor.

### C29: The calls to the database use the function names, argument names and answer keys of the SQL file
- Tags: `AB:TIMER.API`, `AB:TIMER.TESTS`
- If you change: the name of a function in supabase/timer_schema.sql (timer_state, timer_day_total, timer_start, timer_pause, timer_resume, timer_end), an argument name (p_tz, p_day), or a key in an answer (server_now, running, saved, capped, session, day, active_seconds, and the six fields of a running session)
- Then also: timerApi.ts calls each function by name through supabase.rpc and sends each argument by name. The readers (readStateReply, readRunningReply, readEndReply, readDayTotal and readTimerRow) read the keys by name and refuse anything else with the error BAD_REPLY. The six fields of a running session are the type TimerRow in timerMaths.ts (see C26). A name changed on one side only makes the call fail, or makes the screen say that the timer got an answer it could not read. The key server_now is read by the same line in two readers (readStateReply and readEndReply): the checker pins that line once and notices when it is gone from both, and npm test checks each reader. The SQL side is checked by npm test (timerApi.test.ts reads supabase/timer_schema.sql); the checker cannot read SQL. A change in the SQL file has to be run again in the Supabase SQL Editor by the owner.
- If you forget: Start, Pause, Resume or End fail, or the screen shows an error instead of the time.
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_state")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_day_total", { p_day: day })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_start", { p_tz: zone })`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_pause")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_resume")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = call("timer_end")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = json.server_now`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = const row = json.running === null ? null : readTimerRow(json.running)`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = if (typeof json.saved !== "boolean") return bad("saved is not true or false")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = if (typeof json.capped !== "boolean") return bad("capped is not true or false")`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = const session = json.session`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = session.active_seconds`
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = session.day`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = "timer_state()", "timer_day_total(p_day date)", "timer_start(p_tz text)", "timer_pause()", "timer_resume()", "timer_end()"`
- Check by hand: after any change in supabase/timer_schema.sql run npm test (it reads that file), and the owner runs the changed SQL in the Supabase SQL Editor.

### C30: The Pro Timer screen is chosen by the screen id timer, and the menu stays beside it
- Tags: `AB:MENU.NAV`, `AB:AUTH.STUB`, `AB:TIMER.SCREEN`
- If you change: the id timer in SCREENS (screens.ts), the choice of screen in SignedInStub.tsx, the place of AppMenu there, or the main element of TimerScreen.tsx and its class ab-timer
- Then also: SignedInStub asks useScreen which screen the page address chose. When the id is timer it shows TimerScreen and, BESIDE it and not inside it, AppMenu (the same rule as C25), and nothing else: no Dark Veil, no title, no Sign out button. The other three ids still show the temporary placeholder with Dark Veil and the Sign out button (C23). The Pro Timer screen has its own plain black background (the rule .ab-timer in timer.css) and does not use the box .ab-bg. If the id timer is renamed, the menu item Pro Timer shows the placeholder instead of the timer. The Sign out button is not on the timer screen yet. The tests in SignedInStub.test.tsx check which screen is shown and that the menu sits beside it.
- If you forget: the menu item Pro Timer shows the placeholder, the timer is drawn twice, or the menu button is hidden behind the timer.
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = { id: "timer", label: "Pro Timer" },`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = if (screen === "timer") {`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = <TimerScreen />`
- Anchor: `src/components/SignedInStub.tsx = import TimerScreen from "@/components/TimerScreen"`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <main className="ab-timer" data-state={timer.status} data-link={timer.link}>`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer {`
- Check by hand: after any change open the page address #timer on a laptop and on the phone. The timer is on a black screen, the menu button is in the top right corner and opens the panel, a tap on Overview shows the placeholder with the moving background again, and a tap on Pro Timer shows the timer.

### C31: The ring is drawn in a box of 100 by 100, so its stroke width in the css must stay 10 or less
- Tags: `AB:TIMER.SCREEN`
- If you change: the box (viewBox) or the radius of the two ring circles in TimerScreen.tsx, the way the arc is drawn (pathLength and strokeDasharray), or the stroke-width of .ab-timer-track and .ab-timer-arc in timer.css
- Then also: the ring is two circles with the radius 45 in a box of 100 by 100, so a stroke of up to 10 stays inside the box (45 plus half of 10 is 50). A thicker stroke is cut off at the edge of the box. The arc is drawn with pathLength 1 and the dash fill followed by 1, so fill is a number from 0 to 1 and the arc starts at the top (rotate -90). The stroke width itself is safe to tune up to 10 and is not pinned here; a test in TimerScreen.test.tsx reads timer.css and fails above 10.
- If you forget: the ring is cut off at the edges, or the arc is the wrong length.
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = viewBox="0 0 100 100"`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <circle className="ab-timer-track" cx="50" cy="50" r="45" stroke={trackColor} transform="rotate(-90 50 50)" />`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = pathLength={1}`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = strokeDasharray={fill + " 1"}`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer-track,`
- Check by hand: look at the ring on the phone while a session runs: the whole circle is inside the screen with nothing cut off at the edges.

### C32: The clock digits use Space Grotesk with fixed width digits, loaded from the font package
- Tags: `AB:TIMER.SCREEN`
- If you change: the font package, the font name in timer.css, the rules .ab-timer-big and .ab-timer-small, or the font weights
- Then also: timer.css loads the package @fontsource-variable/space-grotesk (installed by Packet 05C0) with one import line and names the font Space Grotesk Variable, the name the package gives it. A different name loads nothing and the screen falls back to the system font. The digits of Space Grotesk are not all the same width by default (555 to 648 units in the font file). Both clocks switch on font-variant-numeric: tabular-nums, which makes all ten digits 620 units wide at the weights 300 to 700; without it the clock would shake from side to side every second. The line with tabular-nums is in both clock rules: the checker notices when it is gone from both, the test checks each clock. The weight must stay between 300 and 700, the range of the font. The test the css of the screen in TimerScreen.test.tsx reads timer.css and the css file of the font package and checks the name, the weight range and tabular-nums on both clocks.
- If you forget: the clock shakes from side to side, or it is drawn in the system font.
- Anchor: `src/timer.css = @import "@fontsource-variable/space-grotesk";`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-family: "Space Grotesk Variable", system-ui, sans-serif;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-variant-numeric: tabular-nums;`
- Check by hand: on the phone let a session run through a minute change with different digits (for example from 11:11 to 11:12). The digits do not move sideways. The widths were checked in the font file, not yet on a phone.

### C33: The waiting times are written in the code and written again in the tests, on purpose
- Tags: `AB:TIMER.API`, `AB:TIMER.STATE`, `AB:TIMER.TESTS`
- If you change: REQUEST_TIMEOUT_MS in timerApi.ts, or POLL_ONLINE_MS, POLL_OFFLINE_MS or TIME_BASE_JITTER_MS in useTimer.ts
- Then also: the same numbers are written again in the tests, so that the tests say what was decided: a call without an answer after 15 seconds counts as no connection; the state is read again every 30 seconds, and every 3 seconds while there is no connection; a new reading of the server time replaces the old one only when the two differ by 1.5 seconds or more (otherwise the seconds would step back now and then). Change the code and its test in the same step and run npm test.
- If you forget: npm test fails, or this checker fails first.
- Anchor: `AB:TIMER.API @ src/lib/timerApi.ts = export const REQUEST_TIMEOUT_MS = 15000`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = export const POLL_ONLINE_MS = 30000`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = export const POLL_OFFLINE_MS = 3000`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = export const TIME_BASE_JITTER_MS = 1500`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerApi.test.ts = expect(REQUEST_TIMEOUT_MS).toBe(15000)`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.test.ts = expect(POLL_ONLINE_MS).toBe(30000)`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.test.ts = expect(POLL_OFFLINE_MS).toBe(3000)`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.test.ts = expect(TIME_BASE_JITTER_MS).toBe(1500)`

## Things to know (no check is possible)
- The Project URL and the publishable key are meant to be in the browser app: row-level security (not yet written, there are no tables) is what protects data. The secret key must never be in the project. .env is ignored by git (Packet 03A checks this before it creates the file).
- Sign-ups are OFF in the Supabase dashboard. Users are created there by hand, with "Auto Confirm User" ticked.
- The glass card redraws what is behind it while the background animates. On a real phone (the Vercel link, 2026-10-05) the full look was very laggy and not smooth. The cause was reasoned, not measured: on Chrome the glass runs a displacement filter over the moving background on every frame, and the background is drawn at the full phone resolution. Lite mode (AB:LOGIN.LITE, C21, C22) was added for this. Whether lite is smooth on the phone has NOT been reported yet.
- The hero line is a different length each time. Very long lines wrap onto more rows; the font size in HERO is set for short lines.
- The name in the corner (BRAND) is drawn on a canvas 60 times a second on a laptop and 30 times a second in lite mode (LoginBrand.tsx). It sits on top of the moving background and the card.
- The name is a picture of text, not real text: it cannot be selected or copied. The wrapper has role="img" and aria-label="ASHBORN" so screen readers still say the name.
