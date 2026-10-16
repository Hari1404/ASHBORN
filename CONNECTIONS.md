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
- Then also: the same numbers are written again in the tests, so that the tests say what the owner decided. Change both, run npm test, and only change a number the owner has decided to change (PRO_TIMER_PLAN_DECISIONS.md). A cut-off or the 60 second rule is NOT a tiny change: it is also linked to the database (C26). The neon colours and the first ring colour are safe to tune alone and are not pinned. The numbers and words in the lines of the stop alert and of the comeback after GO BACK IN follow these cut-offs too (C41).
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

### C31: The ball sits in a box larger than the dial, so the screen clips it, the ball never catches a tap and the buttons stay above it
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.BALL`
- If you change: the size of the box of the ball (.ab-timer-ball in timer.css), the part of that box the ball fills (size in TimerBall.tsx), the overflow of .ab-timer, the pointer-events of the ball box, the position and z-index of the line under the dial, the Try again button and the buttons, or the place of TimerBall in TimerScreen.tsx
- Then also: the box of the ball is 136 percent of the dial, so the glow has room, and the ball fills 66 percent of the box (size 0.66), so the ball is about 90 percent of the dial. Because the box reaches past the dial, three things must stay. (1) .ab-timer clips what reaches past its edge (overflow hidden), otherwise a phone scrolls sideways. (2) The ball box has pointer-events none, otherwise it can catch taps meant for the buttons. (3) The line, the Try again button and the buttons have position relative and z-index 1, so the ball is drawn under them. The ball is the first thing inside .ab-timer-dial and the two clocks come after it, so the digits are drawn over the ball. The box size and the share of the ball are safe to tune alone (the ball only gets bigger or smaller) and are not pinned. Tests in TimerBall.test.tsx and TimerScreen.test.tsx read timer.css and fail when one of the three is removed.
- If you forget: the phone scrolls sideways, the buttons stop reacting under the ball, or the digits are hidden behind it.
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = overflow: hidden;`
- Anchor: `AB:TIMER.BALL @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = <div className="ab-timer-ball" data-out={active ? undefined : "yes"} aria-hidden="true">`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TimerBall`
- Check by hand: look at the timer on the phone while a session runs: the ball is round and fully inside the screen, the page does not scroll sideways, and Pause and the Hold Button react to a finger at the lower edge of the ball.

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


### C34: The colour steps of the ball are the quality names of the maths, and every palette has three colours
- Tags: `AB:TIMER.BALL-LOOK`, `AB:TIMER.MATHS`, `AB:TIMER.TESTS`
- If you change: the quality names or the function qualityOf in timerMaths.ts, the list STEPS in ballLook.ts, the number of colours of a palette, or the cut-offs of the quality (C27)
- Then also: the ball has no cut-offs of its own. ballStep asks qualityOf and turns the answer (meh, solid, deep, flow) into a step with the list STEPS, so the colour moves on at the same seconds as the quality of the session (10, 30 and 90 minutes today). If a quality is renamed or added, STEPS and the palettes change in the same step: a palette has three colours, the colour of solid, of deep and of flow, and white is the colour of meh. The colours of the palettes are safe to tune alone (a test checks that every colour is bright and vivid on black). The palette of a session is drawn from the started_at text of the session, so every device shows the same colours for the same session. The same palette can come up in two sessions in a row (the draw is by the start time, not by the last session): this is on purpose, because a draw that remembers the last session could not be the same on the phone and the laptop.
- If you forget: the ball changes colour at another time than the quality changes, or a colour is missing.
- Anchor: `src/lib/ballLook.ts = import { qualityOf, type Quality } from "@/lib/timerMaths"`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = const STEPS: readonly Quality[] = ["meh", "solid", "deep", "flow"]`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return STEPS.indexOf(qualityOf(seconds)) as 0 | 1 | 2 | 3`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return BALL_PALETTES[ballPaletteIndex(seed)][step - 1]`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export type Quality = "meh" | "solid" | "deep" | "flow"`
- Anchor: `AB:TIMER.TESTS @ src/lib/ballLook.test.ts = expect(ballStep(SOLID_FROM_SECONDS)).toBe(1)`
- Check by hand: after a change of the qualities (names or number), look at the ball in a session of 5, 15, 45 and 100 minutes: each step has its own colour.

### C35: The ball needs WebGL 2 and is a library file, so it must never break the screen; its fade time is written in the code and in the css
- Tags: `AB:TIMER.BALL`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.WARMUP`, `AB:TIMER.TESTS`
- If you change: canDrawWebgl2 (in src/lib/timerWarmup.ts, shared with the background, see C44) or BallGuard in TimerBall.tsx, the library file CrystalizedBall.tsx (never edit it), the settings the ball is given (preset, motion, particleShape, color, size, particleCount, intro, interactive, paused), the dust grains in ballLook.ts, BALL_FADE_MS in ballLook.ts, or the fade time of .ab-timer-ball in timer.css
- Then also: the library ball draws with WebGL 2 (the graphics chip, through the browser). A browser that cannot do it gets no ball: canDrawWebgl2 (timerWarmup.ts) asks for a WebGL 2 context and gives it back, once for the whole page, and TimerBall asks it only when a session is shown, never when the screen opens (C44), and BallGuard catches an error thrown while the ball is made, so the clocks and the buttons keep working. Both must stay. The settings of the ball are changed only by its props in TimerBall.tsx, never inside the library file (TAGGING_RULES.md, rule 6). A newer copy of the library file must be looked at on the laptop and on the phone before it is trusted: the tests use a stand-in, not the real ball. The number of dust grains follows the lite level (15000, 6000 and 3000 in ballLook.ts): the ball is the heaviest thing on the screen and the screen stays open for hours. The fade in the css (700 ms) and BALL_FADE_MS (700) are the same on purpose, because the code takes the ball away when the fade ends; a test compares them.
- If you forget: a browser without WebGL 2 shows an error or a blank screen, the ball is cut off while it fades, or the phone gets hot.
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = const gl = canvas.getContext("webgl2")`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = if (!shown || !ready || !canDrawWebgl2()) return null`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = class BallGuard extends Component<{ children: ReactNode }, { failed: boolean }> {`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = <BallGuard>`
- Anchor: `src/components/TimerBall.tsx = import CrystalizedBall from "@/components/CrystalizedBall"`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export const BALL_FADE_MS = 700`
- Anchor: `AB:TIMER.BALL @ src/timer.css = transition: opacity 700ms ease;`
- Anchor: `AB:TIMER.TESTS @ src/lib/ballLook.test.ts = expect(BALL_FADE_MS).toBe(700)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBall.test.tsx = expect(fade).toBe(BALL_FADE_MS)`
- Check by hand: on the phone open the page address #timer and start a session: the ball lights up, the clocks stay readable, and the phone does not get hot after 10 minutes. In a browser without WebGL 2 the clocks and the buttons still work.

### C36: The look of a session is drawn from the seed, made only of names the library has, drawn independently, and kept until the ball is taken away
- Tags: `AB:TIMER.BALL-LOOK`, `AB:TIMER.BALL`, `AB:TIMER.TESTS`
- If you change: the lists BALL_PRESETS, BALL_MOTIONS or BALL_SHAPES in ballLook.ts, the way a trait is drawn (the function drawFor, the mixing in mixBits, the salts "preset", "motion" and "shape" in ballFlavour), the place where LitBall in TimerBall.tsx keeps the flavour, the effect in TimerBall that lights a new ball, or the library file CrystalizedBall.tsx (a newer copy)
- Then also: a session draws a flavour (the library preset, the way the dust moves and the shape of a grain of dust) from the started_at text of the session, so a reload and a second device show the same ball. The names in the three lists are the names of the library: the types of the lists come from the library props, so a name the library no longer has stops compiling, and a test reads the library file and fails when the library has a preset, a motion or a shape that a list does not (and the other way round). The colour is never taken from the preset (the palette gives it) and the number of grains is never taken from it (the lite level gives it, C35). Each trait is drawn with its own salt and a final mixing of the bits. Without them the shape (two values) would only depend on the lowest bit of the seed text and would move together with the palette; the tests draw 4000 seeds of two kinds and check that every trait is spread evenly and that no two traits, and no trait and the palette, depend on each other. The flavour is drawn ONCE when a ball is made (useState in LitBall) and kept until the ball is taken away: when a session ends the seed becomes empty while the ball still fades for BALL_FADE_MS, and a flavour drawn again from an empty seed would change the look in the middle of the fade. TimerBall lights a new ball when a session starts and also when the seed changes while a session is shown (another device ended the session and started a new one between two readings), because the flavour is kept from the first draw. An empty seed does not light a new ball. A new preset can have a very different strength of glow: after the library gets a new preset, look at it with the colours of all palettes before it is trusted (the tests cannot see it).
- If you forget: a preset that is not in the library draws the plain default look, a new library preset never comes up, the shape follows the palette so that some palettes always have round dust, or the look jumps in the middle of the fade when a session ends.
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = type BallPreset = NonNullable<CrystalizedBallProps["preset"]>`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return Math.floor((mixBits(seedToNumber(salt + ":" + seed)) / 4294967296) * count)`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = particleShape: BALL_SHAPES[drawFor(seed, "shape", BALL_SHAPES.length)],`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = const [flavour] = useState(() => ballFlavour(seed))`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = particleShape={flavour.particleShape}`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = if (!sameSession) setLit((n) => n + 1)`
- Anchor: `AB:TIMER.TESTS @ src/lib/ballLook.test.ts = expect([...BALL_PRESETS].sort()).toEqual(libraryNames("Preset").sort())`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBall.test.tsx = for (const props of duringFade) expect(flavourOf(props)).toEqual(first)`
- Check by hand: start ten sessions in a row (or look at ten different seeds) on the laptop and on the phone: the clocks stay readable on top of every preset, none of the looks is much dimmer or much hotter than the others, and the look of a session does not change while the ball fades.

### C37: The moving background is our own canvas (BackgroundCanvas), fed with a ramp of five colours that starts black and grows with the session, in the colour family of the glowing ball
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.TESTS`
- If you change: the palettes (BG_PALETTES), the rules of the ramp (bgRamp), the blend (BG_BLEND_MS, bgEase, bgBlendRamp in backgroundLook.ts, and useBlendedRamp in TimerBackground.tsx), the settings of the animation (BG_SETTINGS), the speed TimerBackground gives instead of BG_SETTINGS.speed (0 while the session is paused, from the paused that the screen gives, and when less motion is asked for), the choice of palette (bgPaletteIndex), the black behind the animation, the isolation and the dimming (opacity) of .ab-timer-bg in timer.css, the shade at the bottom (.ab-timer-bg::after), or the colour steps and palettes of the ball (C34: ballStep, BALL_PALETTES, ballPaletteIndex in ballLook.ts)
- Then also: the canvas (BackgroundCanvas.tsx, with the picture of backgroundRender.ts, C52) draws a slowly flowing gradient with a little grain from a list of colours (its `colors`). It reads that list again on its own while it runs and does not build its drawing again (the graphics context and the shaders) when only the colours change, so the background moves from one colour step to the next by giving it a new list of five colours many times a second (useBlendedRamp, with bgBlendRamp), and it is never given anything else that changes: every other setting is BG_SETTINGS, the same all the time, except the speed: it is 0 while the session is paused (the screen gives TimerBackground paused, as it does to the ball) and always for a person who asked for less motion, and then the canvas draws one still picture and no more frames, so a paused session (a stop alert left open, a phone left on the table) does not keep the graphics chip busy, and at Resume the flow goes on from the same place (a test compares the names and the values of everything the canvas is given with BG_SETTINGS and the five colours, and tests check the speed of a paused, a resumed and a paused-at-the-start session; a colour step that is on its way when the pause comes still arrives). The ramp of a session (bgRamp of the seconds and the palette) grows from the dark end: all black before the first colour step (the screen is black), the dark shade and the main colour at the solid step (10 minutes, and the two light places of the ramp hold the main colour), the lighter tint at the deep step (30 minutes), the lightest tint at the flow step (90 minutes). The steps are the quality steps of the ball (ballStep, C34), so a new step in timerMaths.ts reaches the background by itself. The palettes are six, in the same order as the six palettes of the ball, and the palette of a session is the palette number of the ball for the same session (bgPaletteIndex gives ballPaletteIndex of the same seed), so the ball and the background are always of the same colour family; a new palette of the ball needs a new palette here, and a test counts them. The colours are not the colours of the ball: the ramp has five colours, from a near black (no channel above 12 of 255) up to a light tint, every colour lighter than the one before it, so the picture never gets darker at a step (a test walks every minute of four hours for every palette). The main colour of the first palette is the rust of the owner's Fire ramp (#9a3412) and stays. The blend takes BG_BLEND_MS (12 seconds, slower than the 4 seconds of the ball, on purpose: a big soft picture should change like light, not like a switch) with a smooth start and a smooth end (bgEase, smoothstep), channel by channel as the ball does (blendHex). A new target in the middle of a blend starts from the colours the blend has reached, so nothing jumps; the first ramp is taken at once, so a page opened in the middle of a session shows the right colours at once; a new session makes a new background that starts black. While the background fades out its colours are held (held in TimerBackground.tsx): the seconds and the seed are gone then, and without it the ramp would start to move towards black in the middle of the fade. This works only while (1) .ab-timer-bg has its own plain black (background #000) and is isolated (isolation isolate), so the screen is black before the canvas is made and while it fades, (2) the box of the canvas has no other layers: no tint, no black layer, no stretched box (they belonged to the old rays animation; a test checks that they are gone), (3) the grain stands still and the canvas listens to nothing of the cursor, a click or a touch (it has no setting for them: BG_SETTINGS has none), (4) the canvas draws one pixel for every pixel of the screen (dpr 1), the whole picture at that size, so no half-size box is needed (C38). The settings (angle, flow, speed, scale, softness, silk, grain) are the ones of the blend preview of the owner; they are safe to tune alone, and so is the dimming (opacity) of .ab-timer-bg in timer.css, but the white digits must stay easy to read over the lightest tint of every palette. The light of the old rays (bgLight, BG_LIGHT_START, BG_LIGHT_FULL_AT_SECONDS) was removed in Packet 08B, together with the lines that talked about rays: no line of the stop alert or of the milestone message says anything about rays of light any more (C41, C50).
- If you forget: the background builds its drawing again many times a second (it flickers and the phone gets hot), or the colours jump at a step instead of moving, or the screen is not black at the start, or the background goes darker at a step, or its colour family is not the colour family of the ball, or it starts to move towards black while it fades out, or the cursor, a click or the grain moves it, or the digits cannot be read over the lightest tint, or the flow goes on while the session is paused (the graphics chip is busy for nothing), or it does not go on again at Resume.
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_BLEND_MS = 12000`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_PALETTES: readonly (readonly [string, string, string, string, string])[] = [`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = return ballPaletteIndex(seed)`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export function bgRamp(seconds: number, paletteIndex: number): readonly string[] {`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export function bgEase(progress: number): number {`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export function bgBlendRamp(from: readonly string[], to: readonly string[], progress: number): readonly string[] {`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const target = bgRamp(seconds, bgPaletteIndex(seed))`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const progress = Math.min(1, (now - startedAt) / BG_BLEND_MS)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = current.current = bgBlendRamp(from, to, progress)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <BackgroundCanvas {...BG_SETTINGS} speed={still ? 0 : BG_SETTINGS.speed} colors={colours} />`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = if (active && held.join(",") !== target.join(",")) setHeld(target)`
- Anchor: `AB:TIMER.BG @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.BG @ src/timer.css = background: #000;`
- Anchor: `AB:TIMER.BG @ src/timer.css = linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0) 60%)`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export const BALL_BLEND_MS = 4000`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export function ballPaletteIndex(seed: string): number {`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = describe("the ramp of the session", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_BLEND_MS).toBeGreaterThan(BALL_BLEND_MS)`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_PALETTES[0][2]).toBe("#9a3412")`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(Object.keys(props).sort()).toEqual([...Object.keys(BG_SETTINGS), "colors"].sort())`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = describe("TimerBackground: the same colour family as the glowing ball", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(block(".ab-timer-bg")).toContain("background: #000;")`
- Check by hand: start a session on the phone and on the laptop: the screen stays black while the first 10 minutes run (the background is made but all black), at 10 minutes the dark shade and the main colour of the session come in slowly (about 12 seconds, no jump), at 30 and 90 minutes lighter tints come in the same way, and the colours are of the same family as the glowing ball. The picture keeps flowing, the grain stands still, the cursor and a click do nothing, the white digits stay easy to read over the lightest tint of every palette (look at all six: ?lite=0 on the laptop, and sessions with different start times), and the background does not flicker while the colours move. Use the blend preview of the owner (Grainient_blend_preview.html) to compare the look: the canvas draws the picture of that preview (C52).

### C38: The background needs WebGL 2 and is drawn by our own canvas, so it must never break the screen; it sits at the very bottom of the screen, and its fade time is written in the code and in the css
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.SCREEN`, `AB:TIMER.WARMUP`, `AB:TIMER.TESTS`
- If you change: canDrawWebgl2 (in src/lib/timerWarmup.ts, shared with the glowing ball, see C44) or BackgroundGuard in TimerBackground.tsx, the canvas (BackgroundCanvas.tsx and backgroundRender.ts, C52), BG_FADE_MS or the lite levels that draw the background in backgroundLook.ts, the fade time or the stacking rules of .ab-timer-bg, .ab-timer and .ab-timer-dial in timer.css, the place of TimerBackground in TimerScreen.tsx and what it is given there (active, paused, seconds, seed), or dpr in BG_SETTINGS (backgroundLook.ts)
- Then also: the canvas draws with WebGL 2 (the graphics chip, through the browser). A browser that cannot do it, a lite level 2 page (the background is not drawn) or an error thrown by the canvas gives no background: canDrawWebgl2 (timerWarmup.ts) asks for a WebGL 2 context and gives it back, once for the whole page and shared with the ball, and TimerBackground asks it only when a session is shown, never when the screen opens (C44), and BackgroundGuard catches an error thrown while the canvas is made, so the clocks, the ball and the buttons keep working. Both must stay. The settings of the animation are changed only by its props in TimerBackground.tsx and the values in backgroundLook.ts. The tests of TimerBackground use a stand-in for the canvas and the tests of the canvas use a fake WebGL 2 context, so only a look on the laptop and on the phone shows that the picture is really drawn (C52). The layers: TimerBackground is the FIRST thing inside the main element of TimerScreen.tsx; .ab-timer-bg is position absolute over the whole screen with z-index 0, its own black and pointer-events none, and it has a shade at the bottom (.ab-timer-bg::after: 45 percent black at the very bottom, gone at 60 percent of the height) so that the milestone message that comes up from the bottom is easy to read; .ab-timer is position relative with isolation isolate, so the background can never fall behind the page, never covers the menu (the menu sits beside the main element with its own z-index) and never catches a tap; .ab-timer-dial has z-index 1 and the line, the Try again button and the buttons have z-index 1 (C31), so everything is drawn over the background. The canvas measures its box when it is made and again whenever the box changes its size (the resize observer of the browser, or the resize of the window when there is none), so the box must have its real size when the session starts (the screen has it). The fade in the css (700 ms) and BG_FADE_MS (700) are the same on purpose, because the code takes the background away when the fade ends; a test compares them. The size the picture is drawn at: the graphics chip runs the picture once for every pixel it draws, and our canvas draws the whole picture, grain included, at the size of its canvas (the old library animation made its colour field at half the width and half the height), so the background sets dpr to 1 (one canvas pixel for every pixel of the screen, never more on a sharp phone screen). If the screen gets slow or hot on a phone, lower the work here first: dpr is the one setting that does it (the canvas takes any dpr from 0.25 up, so a dpr of 0.5 draws a quarter of the pixels and the browser stretches the canvas to the box; the dimming and the other settings do not change the work).
- If you forget: a browser without WebGL 2 shows an error or a blank screen, the background covers the digits or the buttons, it catches taps, it is cut off while it fades, the shade at the bottom is gone and the milestone message is hard to read, or the phone gets hot because the canvas draws at the full pixel ratio of a sharp screen.
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = const gl = canvas.getContext("webgl2")`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = if (!shown || !ready || !bgDrawn(LITE_LEVEL) || !canDrawWebgl2()) return null`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = class BackgroundGuard extends Component<{ children: ReactNode }, { failed: boolean }> {`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <BackgroundGuard>`
- Anchor: `src/components/TimerBackground.tsx = import BackgroundCanvas from "@/components/BackgroundCanvas"`
- Anchor: `src/components/TimerBackground.tsx = import { canDrawWebgl2, useMountDelay } from "@/lib/timerWarmup"`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_FADE_MS = 700`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = dpr: 1,`
- Anchor: `AB:TIMER.BG @ src/timer.css = transition: opacity 700ms ease;`
- Anchor: `AB:TIMER.BG @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.BG @ src/timer.css = z-index: 0;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TimerBackground`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_FADE_MS).toBe(700)`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_SETTINGS.dpr).toBe(1)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(fade).toBe(BG_FADE_MS)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = it("keeps the bottom a little darker, with a layer over the animation that never catches a tap", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = expect(stub.parentElement?.firstElementChild).toBe(stub)`
- Check by hand: on the phone open the page address #timer and start a session: the background fades in, the clocks stay readable, the buttons react to a finger everywhere, and the phone does not get hot after 10 minutes. In a browser without WebGL 2 the clocks and the buttons still work. With ?lite=2 in the page address the screen stays plain black. The picture fills the whole screen, also in the corners, with no hard edges, and the bottom of the screen is a little darker than the top.

### C39: On a wide screen the Pro Timer is two columns (the dial on the left, the line and the buttons on the right), the phone stays one column, and the wide rules must come after the phone rules and must not touch the clip, the stacking or the taps
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: the box ab-timer-side or the order of the dial and that box in TimerScreen.tsx, the wide-screen rule at the end of the screen part of timer.css (its @media line, the grid, the width of the dial, the digit sizes), the phone rule display contents of ab-timer-side, or the width of the buttons box
- Then also: the phone is one column (ab-timer is a flex column). On a wide screen (at least 1000 px wide AND 560 px high, OR any window at least 600 px wide and wider than 5 to 4, which is a laptop window made low and a phone held sideways) the @media rule turns ab-timer into a grid of two columns: the dial in the first (a big circle, as high as the screen allows, at most 780 px), the box ab-timer-side in the second (340 px, the line, the Try again button and the buttons, in the middle of the height). Four things must stay. (1) The box ab-timer-side is the second child of ab-timer, directly after the dial, and holds the line, the Try again button and the buttons box in this order; it is display contents on the phone (no box, so the phone looks exactly as before) and a flex column in the wide rule. It also carries the attribute inert while the stop alert is open, so that nothing behind the alert can be pressed (C43). The tags and the rest that come later go into this box. (2) The @media block stays AFTER the phone rules for ab-timer, ab-timer-dial, ab-timer-readout, ab-timer-big, ab-timer-small and ab-timer-side, because it replaces them only by being later. (3) The right-hand column (340 px) is at least as wide as the buttons box (max-width 320 px), and at 600 px wide the dial column is still at least as wide as the smallest phone dial (150 px). (4) The block never sets overflow, z-index, position, pointer-events, isolation or mix-blend-mode, because those belong to C31 and C38. The digits are 17 and 6 percent of the dial width in the wide rule (container query units, the readout is the size container, its container-type is in the phone rule), the same share as on the phone (68 and 24 of 400): change the phone digit sizes and the dial width of the phone and these two numbers must follow (C40). The dial width, the gap and the padding of the wide rule are safe to tune alone. Tests in TimerScreen.test.tsx read the structure and timer.css and fail when one of the four is broken.
- If you forget: on a laptop the buttons fall under the circle again, or the digits are too small or too big for the circle, or the phone changes, or the ball and the background are no longer clipped or the buttons stop reacting.
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <div className="ab-timer-side" inert={timer.stopAlert !== null}>`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = @media (min-width: 1000px) and (min-height: 560px), (min-width: 600px) and (min-aspect-ratio: 5/4) {`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = display: contents;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = grid-template-columns: minmax(0, 1fr) 340px;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = width: min(100%, calc(100dvh - 168px), 780px);`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = container-type: inline-size;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: 17cqw;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: 6cqw;`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("TimerScreen: the desktop layout (structure)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("the css of the screen: the desktop layout", () => {`
- Check by hand: on a laptop (or a browser window at least 1000 px wide and 560 px high) open the page address #timer and start a session: the dial is a big circle on the left, and the line and the buttons stand on the right in the middle of the height, with the digits inside the circle. Make the window lower (about 450 px, still wider than 600 px): it stays two columns, the circle gets smaller and the buttons stay on the screen. Make the window narrower than 600 px, or narrower than 1000 px and nearly square or tall: the screen becomes the phone layout (one column). On the phone nothing has changed.

### C40: The phone dial is only as high as the window allows, and the reserve in the css must be as high as everything else on the screen
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: the width rule of ab-timer-dial (the 150 px floor, the 400 px cap, the reserve), one of the two --ab-timer-reserve lines, the padding or the gap of ab-timer, the min-height of ab-timer-note or ab-timer-actions, the Try again button (its padding or font size), the number of text lines the line can have, or the digit caps of the phone (17cqw and 6cqw)
- Then also: on the phone (one column) the dial is a square whose width is the smallest of 84 percent of the window width, 400 px and the window height minus the reserve (--ab-timer-reserve), and never below 150 px. The reserve is the height of everything else on the screen: top padding 72 + bottom padding 32 + two gaps of 24 + the line (one text line, 1.4 times 15 = 21 px) + the buttons box (124 px) = 297 px, and the reserve is 298 px (1 px for rounding). With a connection problem (the attribute data-link is problem) the line has two text lines and the Try again button is there, which is 21 + 24 + 40.5 more, so the reserve is 384 px. If the reserve is smaller than the real stack, Start, Pause and the Hold Button fall under the bottom edge of the window again; if it is much bigger, the phone dial is smaller than it has to be (the tests allow at most 6 px more than the stack). The reserve is used by the phone dial only. The wide rule has its own height rule (calc(100dvh - 168px)) and never uses it; the tests check both. The digits of the phone are held to 17 and 6 percent of the dial width (the smaller of the old size and that share), so that they shrink with a dial that is smaller than 400 px. Measured limits: a window narrower than 600 px and lower than about 450 px (about 530 px with a connection problem) fits neither layout, so the page scrolls; a message of two text lines without the Try again button (the day ended at midnight) is one text line (21 px) higher than the reserve counts for, so in a low window the buttons stay on the screen but the page scrolls by about 20 px (the empty bottom padding); every further text line pushes the buttons down by one more text line. A window lower than 375 px with a connection problem scrolls by 15 px even in two columns.
- If you forget: on a small phone, or in a low window, the buttons fall under the bottom edge; or the dial is needlessly small; or the digits stick out of a small dial.
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = --ab-timer-reserve: 298px;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = --ab-timer-reserve: 384px;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = width: min(84vw, 400px, max(150px, calc(100dvh - var(--ab-timer-reserve))));`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: min(clamp(2.4rem, 13vw, 4.25rem), 17cqw);`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: min(clamp(1.05rem, 4.6vw, 1.5rem), 6cqw);`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("the css of the screen: the phone fits the window", () => {`
- Check by hand: on the phone open #timer, start a session and look at the whole screen: the dial, the line and the buttons are all on the screen without scrolling (also with the address bar of the browser shown). On the laptop make the browser window low (about 500 px) and narrow (about 700 px wide, so that it stays one column): the dial gets smaller and the buttons stay on the screen. If a line of red text with Try again shows, the dial is a little smaller and Start and Try again are still on the screen.

### C41: The lines of the stop alert and the comeback lines after GO BACK IN are tied to the cut-offs of the timer (the edges of the banks, the numbers and words written in the lines), to the GO BACK IN rule, and to the glowing ball that some lines talk about
- Tags: `AB:TIMER.ALERT-LINES`, `AB:TIMER.LINE-MARKUP`, `AB:TIMER.MATHS`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.TESTS`
- If you change: a cut-off in timerMaths.ts (MIN_SESSION_SECONDS, SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, GO_BACK_IN_LIMIT_SECONDS or FLOW_FROM_SECONDS), the edges or the names of the banks in stopAlertLines.ts, the number or the words in a line (a number, sixty, ten, flow, solid, deep, milestone, a sentence about the ball, any sentence about rays of light), which sessions are offered GO BACK IN, or the colour steps of the ball (ballStep in ballLook.ts)
- Then also: the banks are named by their minutes (from1, from5, from10, from20, from30, from45, from90, and under1 for a session under 60 seconds that is not saved). Five edges are cut-offs of the timer and are imported, not written again: 60 seconds (from1), 10 minutes (from10, the first quality step), 30 minutes (from30, the second quality step), 45 minutes (from45, the end of GO BACK IN) and 90 minutes (from90, flow). The edges 5 and 20 minutes (from5 and from20) belong to the banks only. There are two kinds of lines with the same bank names: the stop alert lines (STOP_ALERT_BANKS, eight banks) and the comeback lines (COMEBACK_BANKS, six banks), which are shown for a few seconds after GO BACK IN and are chosen by the length the session had when it was stopped. The comeback banks are exactly the banks of the sessions that can go back in, so from45 and from90 have none (pickComebackLine gives null for them, and a test goes through every second up to 100 minutes and compares it with canGoBackIn). A number written in a line is a cut-off that is true for the bank it sits in: 10 in the bank from5 ("Under 10 minutes", and the word ten), 45 in the banks from20 and from30 ("The threshold is 45"); the word sixty belongs to the bank under1 in the same way. The word flow is only said from 90 minutes. The words solid and deep are never used, because the quality words of the timer start at other minutes than the banks. The word milestone is never used: the milestones are the messages of MILESTONE_MINUTES (15, 25, 45 minutes and so on) and they are not the colour steps of the ball. No line of the banks from45 and from90 says "back in", because those sessions have no GO BACK IN button. A line about the glowing ball says something that is true for every second of its bank: the ball is white before 10 minutes, has changed colour once from 10 to 29 minutes, twice from 30 to 89 and three times from 90 minutes (so it has two colours still ahead from 10 to 29 minutes). No line talks about rays of light: the moving background has none (Packet 08B), and a test fails for any line with the word ray or rays. The tests do not copy these minutes: they ask ballStep (ballLook.ts), so if a colour step moves, the lines that are no longer true fail and are named. Every line that talks about the ball must match one of the claims of the table in the tests, and every claim of the table must be used by a line, so a rewording that escapes the table is noticed. {left} counts the minutes to 45 (GO_BACK_IN_LIMIT_SECONDS, see C42) and is only used under 45 minutes. If a cut-off is changed, the tests of stopAlertLines.test.ts fail and name the line to read again. The screen of the stop alert (a later packet) takes its bank from bankIdFor and its GO BACK IN button from canGoBackIn: the two must never disagree. The comeback line comes from pickComebackLine with the seconds the session had when it was stopped, never with the seconds after GO BACK IN.
- If you forget: a line tells the person a number or a word that is false for the session on the screen (for example 45 minutes in a bank of 50-minute sessions, flow at 40 minutes, a ball that changed colour twice at 20 minutes, a line about rays of light that the background does not have), or the alert offers GO BACK IN with a line that says the session is over, or a comeback line is for another length than the session.
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
- Anchor: `AB:TIMER.TESTS @ src/lib/stopAlertLines.test.ts = describe("the claims about the ball", () => {`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return STEPS.indexOf(qualityOf(seconds)) as 0 | 1 | 2 | 3`
- Check by hand: when a cut-off of the timer changes, or the colour steps of the ball change, read the lines of the banks around it in stopAlertLines.ts (both kinds). The tests stop the build when a written number or word, or a sentence about the ball, is no longer true, but they cannot judge the meaning of a sentence (for example "Past halfway" in the bank from30, or the jokes about the group chat). A device without WebGL 2 shows no ball: a line about it is then about something that is not on the screen. That is accepted.

### C42: The marks in a line ({n}, {time}, {left} and [effect:words]) are read by one function, and the six effect names are the names the text component of the screen has to draw
- Tags: `AB:TIMER.LINE-MARKUP`, `AB:TIMER.LINE-TEXT`, `AB:TIMER.ALERT-LINES`, `AB:TIMER.TESTS`
- If you change: the six effect names (EFFECTS in lineMarkup.ts), the form of a mark (the square brackets and the colon, MARK in lineMarkup.ts), the slots ({n}, {time}, {left}) or how {left} counts, or the marks written in a line of stopAlertLines.ts (a stop alert line or a comeback line)
- Then also: a line is plain text with two kinds of marks. {n}, {time} and {left} are filled by fillSlots BEFORE the line is cut up, so a slot can sit inside a marked word ("[heat:{time}]"). [effect:words] marks the words that get an effect; the effect name is one of the six names in EFFECTS (glow, heat, shake, strike, ghost, rise), lower case, followed by a colon. parseMarkup never throws: an unknown effect name loses its effect and keeps its text, a bracket that is not closed stays in the text, so a typo shows on the screen instead of breaking the alert; the tests of stopAlertLines.test.ts read every line of both kinds and fail on an unknown name or an unclosed bracket. {left} is the minutes still missing to GO_BACK_IN_LIMIT_SECONDS (45 minutes), rounded UP and never less than 1; it is tied to the same cut-off as the banks (C41). The component LineText.tsx and the css with the tag AB:TIMER.LINE-TEXT draw the six effects (C49): each of the six names has a rule .ab-fx[data-effect="name"] and its keyframes there, because a new name in EFFECTS without a rule in the css would show a keyword with no effect, and a rule in the css without a name in EFFECTS would never be used. The tests of LineText.test.tsx check both ways, and check that every marked keyword of every line has a rule.
- If you forget: a keyword shows no effect, or the brackets and the colon show as text on the screen, or a number in a line is wrong (a slot not filled, "1 minutes", or {left} that counts to another minute than the one where GO BACK IN stops).
- Anchor: `AB:TIMER.LINE-MARKUP @ src/lib/lineMarkup.ts = export const EFFECTS = ["glow", "heat", "shake", "strike", "ghost", "rise"] as const`
- Anchor: `AB:TIMER.LINE-MARKUP @ src/lib/lineMarkup.ts = const MARK = /\[([a-z]+):([^[\]]+)\]/g`
- Anchor: `AB:TIMER.LINE-TEXT @ src/components/LineText.tsx = <span key={p} className="ab-fx" data-effect={piece.effect}>`
- Anchor: `AB:TIMER.LINE-MARKUP @ src/lib/lineMarkup.ts = const left = Math.max(1, Math.ceil((GO_BACK_IN_LIMIT_SECONDS - s) / 60))`
- Anchor: `AB:TIMER.TESTS @ src/lib/lineMarkup.test.ts = describe("the six effects", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/stopAlertLines.test.ts = describe("the marks in the lines", () => {`
- Check by hand: open src/lib/stopAlertLines.ts and read three lines: every marked keyword is written [name:words] with one of the six names, and the sentence still reads well with the marks taken away.

### C43: The stop alert pauses the session so that the minutes in its line stay true, it covers the screen, and its two buttons end the session or resume it
- Tags: `AB:TIMER.STOP-ALERT`, `AB:TIMER.STATE`, `AB:TIMER.SCREEN`, `AB:TIMER.ALERT-LINES`, `AB:TIMER.TESTS`
- If you change: stop, goBack or end in useTimer.ts (the kinds "stop" and "goback" in act, the alert state, alertMatches, the view stopAlert), what Hold to end session calls in TimerScreen.tsx, the place of StopAlert in TimerScreen.tsx, the component StopAlert.tsx, or the rules .ab-alert in the part of timer.css that has the stop alert tag
- Then also: Hold to end session does NOT end the session. It calls stop: if the session runs, stop calls timerPause (the database stops counting), and the line is picked (pickStopLine) for the seconds of that moment, so the minutes in the line are the minutes the session really has. I'M DONE calls end (timerEnd): the database measures a paused session up to the moment it was paused, so the saved seconds are the seconds of the line, however long the alert stayed open. GO BACK IN calls goBack: since Packet 06E it does NOT resume the session and calls nothing in the database: it closes the alert, the session stays paused as it is (the Resume button is there) and goBack only leaves behind a note for the comeback message (C48). The time on the alert is not counted, and neither is the time between GO BACK IN and Resume. The comeback lines say so ("The break wasn't counted"), so a change that lets the session run while the alert is open makes those lines false (C41). The alert belongs to ONE pause of ONE session (alertMatches compares started_at and paused_at while the screen is drawn): when the session was ended or resumed on another device, or at midnight, or paused again later, the alert does not match any more and the screen shows none, with no state to clean up. GO BACK IN is offered only for a session shorter than 45 minutes (canGoBackIn, C41); that is a rule of the alert only, the database lets any paused session be resumed (the Resume button). The alert is the LAST child of the main element of TimerScreen and is position absolute with inset 0 over the whole screen, in its own part of the css. Its z-index (2) is above the dial and the buttons (1, C31) and below the menu (40), so the menu stays reachable. The box ab-timer-side is inert while the alert is open (C39). The alert has no blur behind it (C25: a blur over the moving background is laggy on the phone). The focus goes to the card, never to a button, so that a key still held from the Hold Button cannot press I'M DONE. If the person leaves the screen with the alert open, the alert is lost and the session stays paused: Resume and Hold to end session are there again. The line is shown by LineText (C49): word by word, with the effect of every marked keyword. In timer.css the stop alert part sits BEFORE the part of the moving background (C38), because TimerBackground.test.tsx reads the LAST reduced-motion rule of the file and expects it to be the background's own; a test of StopAlert.test.tsx checks the order.
- If you forget: the session keeps counting behind the alert and the minutes in the line are wrong, I'M DONE saves more than the line said, GO BACK IN starts the clock by itself again (it must leave the session paused), the buttons behind the alert can still be pressed, the alert hides behind the dial, or the lines about the break are false.
- Anchor: `src/lib/useTimer.ts = import { pickComebackLine, pickStopLine, type ComebackQueues, type LineQueues } from "@/lib/stopAlertLines"`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = type AlertState = { line: string; seconds: number; canGoBack: boolean; startedAt: string; pausedAt: string }`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const pausedHere = row.status === "running"`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const picked = pickStopLine(seconds, queuesRef.current)`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = return alert !== null && row !== null && row.status === "paused" && row.started_at === alert.startedAt && row.paused_at === alert.pausedAt`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = stopAlert: alertMatches(alert, row) ? { line: alert.line, canGoBack: alert.canGoBack } : null,`
- Anchor: `src/components/TimerScreen.tsx = import StopAlert from "@/components/StopAlert"`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = onHold={timer.stop}`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <StopAlert`
- Anchor: `src/components/StopAlert.tsx = import LineText from "@/components/LineText"`
- Anchor: `AB:TIMER.STOP-ALERT @ src/components/StopAlert.tsx = <div className="ab-alert-card" ref={cardRef} tabIndex={-1}>`
- Anchor: `AB:TIMER.STOP-ALERT @ src/timer.css = position: absolute;`
- Anchor: `AB:TIMER.STOP-ALERT @ src/timer.css = z-index: 2;`
- Anchor: `AB:TIMER.STOP-ALERT @ src/timer.css = margin: auto;`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = Back in. The break wasn't counted. The [glow:session] is still yours.`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.hook.test.ts = describe("useTimer: the stop alert", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/StopAlert.test.tsx = describe("the css of the stop alert", () => {`
- Check by hand: on the phone and on the laptop open #timer, start a session and wait more than a minute, then hold Hold to end session. The alert covers the screen, the clock behind it stands still and the line names the minutes of the clock. Stay on the alert for more than 30 seconds (the screen reads the database again in that time): the alert must stay open. Wait 20 seconds more, tap GO BACK IN: the alert closes, the clock stays on the same number and the button says Resume. Tap Resume: the clock goes on from the same number. Hold again and tap I'M DONE: the line under the clock says Saved with the same number that was on the clock when you held. A very short session (under a minute) says it was not saved.

### C44: The WebGL 2 check is asked once for the whole page and only when a session is shown; the warm-up that runs once after the first picture is tied to the font of the digits, the two reading functions, the line in index.html and the stub
- Tags: `AB:TIMER.WARMUP`, `AB:TIMER.BALL`, `AB:TIMER.BG`, `AB:AUTH.STUB`, `AB:AUTH.CLIENT`, `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: canDrawWebgl2 or warmTimerScreen in src/lib/timerWarmup.ts, the place where TimerBall.tsx and TimerBackground.tsx ask canDrawWebgl2, the call of warmTimerScreen in SignedInStub.tsx, the family or the weight of the clock digits in timer.css, the names timerState and timerDayTotal in timerApi.ts, the line with preconnect in index.html, or the name VITE_SUPABASE_URL in supabase.ts
- Then also: the ball and the moving background both need WebGL 2. They used to ask the browser for a test context each, when the screen opened. Now canDrawWebgl2 asks once for the whole page and remembers the answer, and the two components ask it only when a session is shown (never when the screen opens), so opening the screen costs nothing; since Packet 06B they also ask it only after their wait (C47), so the press of Start asks the browser nothing. The warm-up (warmTimerScreen) runs once per page load, a moment after the first picture, from the temporary signed-in screen: it loads the font of the clock digits (WARM_FONT must be the family and the weight of .ab-timer-big in timer.css, C32), asks the database for the state and for the day total of this device and throws the answers away (this opens the connection, so that the real reading is quick; it is only done when the page was not opened straight on the Pro Timer, which reads the database itself at once), and does the WebGL 2 check. Everything in it is caught and ignored: it can never break the screen. The line with preconnect in index.html opens the connection to the database while the page is still loading; it uses the same setting VITE_SUPABASE_URL as the database client (supabase.ts), which Vite fills in when the page is built (when the setting is missing Vite leaves the line as it is, and the browser ignores it). When the temporary signed-in screen is thrown away, the call of warmTimerScreen moves to the real app shell. The tests in timerWarmup.test.ts check all of this, and they must call forgetWarmup before each test, because the answer of the WebGL 2 check is kept for the whole page.
- If you forget: the screen opens slowly again (two test contexts while the menu closes, a first reading on a cold connection, digits that appear in another font for a moment), the warm-up is lost when the stub goes, the digits are loaded in the wrong weight, or a test sees the answer of an earlier test.
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = export function canDrawWebgl2(): boolean {`
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = const gl = canvas.getContext("webgl2")`
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = export const WARM_FONT = '500 16px "Space Grotesk Variable"'`
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = timerState().catch(() => {})`
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = timerDayTotal(day).catch(() => {})`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = if (!shown || !ready || !canDrawWebgl2()) return null`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = if (!shown || !ready || !bgDrawn(LITE_LEVEL) || !canDrawWebgl2()) return null`
- Anchor: `src/components/TimerBall.tsx = import { canDrawWebgl2, useMountDelay } from "@/lib/timerWarmup"`
- Anchor: `src/components/TimerBackground.tsx = import { canDrawWebgl2, useMountDelay } from "@/lib/timerWarmup"`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = warmTimerScreen(firstScreen !== "timer")`
- Anchor: `src/components/SignedInStub.tsx = import { warmTimerScreen } from "@/lib/timerWarmup"`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-family: "Space Grotesk Variable", system-ui, sans-serif;`
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = import.meta.env.VITE_SUPABASE_URL`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerWarmup.test.ts = it("loads the same font, in the same weight, that the clock digits use in timer.css", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerWarmup.test.ts = it("has the preconnect line for the database in index.html, with the same setting that the database client reads", () => {`
- Check by hand: open the page on the phone, sign in, wait a few seconds on Overview, then choose Pro Timer from the menu: the clocks and the buttons fade in a moment after the screen opens, the digits are in Space Grotesk from the first moment, and nothing jumps. Then close the page, open it again straight on #timer, and look at it the same way.

### C45: The state and the day total are asked for at the same time, with the day of the device as the first guess; the day that the state gives decides which answer counts
- Tags: `AB:TIMER.STATE`, `AB:TIMER.API`, `AB:TIMER.MATHS`, `AB:TIMER.TESTS`
- If you change: the order or the timing of timerState and timerDayTotal in refresh (useTimer.ts), the guess of the day, the choice of the time zone of the day (the zone of the running session, else the zone of the device), or what timer_state and timer_day_total answer
- Then also: the day total needs a day, and the right day is only known when the state has answered, because a running session counts its own time zone (C26, localDay in timerMaths.ts). To save one waiting time, refresh asks for the state first and, at the same moment, for the day total of the day of THIS device. When the state then gives the same day (the usual case) the first answer is used. When it gives another day (a session that was started in another time zone, or a device clock that is a day off) the first answer is thrown away and the day total is asked again for the right day. A failing day total fails the reading exactly as before (no connection, or a problem), and a failing state leaves no unhandled error from the day total (the catch on dayAsk). An answer of an old reading is still dropped before it is used (the ticket). Both functions only read, so asking both at once changes nothing in the database. The tests in useTimer.hook.test.ts (the part "both reads at once") and the part "the time zone of the session" check the calls and the answers.
- If you forget: the screen waits for two answers in a row again, the day total of a session in another time zone is the total of the wrong day, or the console shows an unhandled error when the connection is lost.
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const guess = dayOrFallback(Date.now(), zone, "")`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const dayAsk = guess === "" ? null : timerDayTotal(guess)`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = dayAsk?.catch(() => {})`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const day = localDay(state.serverNowMs, state.row?.tz ?? zone)`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const saved = dayAsk !== null && day === guess ? await dayAsk : await timerDayTotal(day)`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.hook.test.ts = describe("useTimer: both reads at once", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.hook.test.ts = it("asks again for the right day when the running session has another time zone, and uses only the right answer", async () => {`
- Check by hand: open the Pro Timer on the phone and on the laptop: the day total under the big clock is the same as before this change, also with a session that was started on another device.

### C46: While the first reading is on its way the clocks are invisible and a blank pill stands where the buttons will be; the css fades them in when the reading is there
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: the name of the state loading (link in useTimer.ts), the blank pill (class ab-timer-wait) in TimerScreen.tsx, the data-link attribute of the main element, the rules with data-link loading in timer.css, the height of ab-timer-pill, the height of ab-timer-wait, the brightness of the blank pill, or ab-timer-reveal-actions
- Then also: while the link is loading, TimerScreen draws no button (the screen has no text and no label that could be wrong: a running session never shows Start for a moment) and draws the blank pill ab-timer-wait instead, which is not a button and is hidden from screen readers. The css hides the readout (the two clocks) with opacity 0 while data-link is loading. When the link is no longer loading, the rule with :not loading starts, and the clocks and the buttons fade in with an animation of 300 ms (ab-timer-reveal, ab-timer-reveal-actions). An animation on a rule that starts matching runs once, when the loading ends; it does not start again when a button is swapped for another, so Start, Pause and Resume stay instant. The buttons start at 0.18, which is the brightness of the blank pill, so the pill grows into the real button instead of blinking; the height of the pill (58px) is the height of ab-timer-pill, so nothing jumps; the box ab-timer-actions keeps its height (C40). The rule that switches the fades and the breathing off for a person who wants less motion is written AFTER the rules it switches off, because both have the same weight and the later one wins. The two fade rules sit AFTER the base rules of their classes in the file, and the tests that look for a block by its selector find the base rule first.
- If you forget: zeros that jump to the real numbers come back, a wrong button shows for a moment, the buttons blink or jump, or the person who asked for less motion still gets the fade.
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = {timer.link === "loading" ? (`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <div className="ab-timer-wait" aria-hidden="true" />`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer[data-link="loading"] .ab-timer-readout {`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer:not([data-link="loading"]) .ab-timer-readout {`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer:not([data-link="loading"]) .ab-timer-actions {`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = animation: ab-timer-reveal-actions 300ms ease;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = .ab-timer-wait {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("the css of the screen: the look while loading", () => {`
- Check by hand: on the phone, open the Pro Timer from the menu: the screen is black for a moment with a faint pill where the buttons will be, then the clocks and the buttons fade in together; with a session running, no Start button shows at any moment; on the laptop the same.

### C47: The moving background and the glowing ball are made after a wait, the background first and the heavy ball last, so that the press of Start does not freeze the page; the two waits are written in the two look files, in the hook and in the tests
- Tags: `AB:TIMER.BALL`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.WARMUP`, `AB:TIMER.TESTS`
- If you change: BALL_MOUNT_DELAY_MS (ballLook.ts), BG_MOUNT_DELAY_MS (backgroundLook.ts), useMountDelay (timerWarmup.ts), the line with ready in TimerBall.tsx or in TimerBackground.tsx, or the order of the checks in the line that returns null (shown, ready, the lite level, the WebGL 2 check)
- Then also: the ball is a library animation and the moving background is our own canvas. When one is made, it asks the browser for a WebGL 2 context and compiles its programs for the graphics chip, and on a laptop that can hold the whole page for a moment. Both used to be made in the same moment as the press of Start, so Start froze. Now each component asks useMountDelay (src/lib/timerWarmup.ts) whether it may be made: the background (its box with the black and the fade in, and the canvas inside) is made BG_MOUNT_DELAY_MS (300 ms) after the session lights it and the ball BALL_MOUNT_DELAY_MS (600 ms) after. The clocks and the buttons answer at once, the background comes next, and the heavy ball last, so the work of the two never lands in the same moment: BALL_MOUNT_DELAY_MS must stay at least 300 ms longer than BG_MOUNT_DELAY_MS (a test checks it). The order matters: an animation that is made while another one is already drawing has to wait behind the drawing work of the first one, and the ball is the heavy one, so it must not be the first (in a test in a real browser with a software graphics chip, the ball first and the background 600 ms later held the page for 1.5 to 3 seconds, the background first and the ball after held it for about a tenth of a second). useMountDelay counts the wait again for every new light (a new session, or a new seed from another device), never makes the animation for a session that ends during the wait, and, once the animation is made, stays ready while the session ends, so the fade out is seen. The WebGL 2 check (C44) comes after the wait in the line that returns null, so the press of Start asks the browser nothing. The library ball is not edited. The waits are written here, in the two look files, and again in the tests, on purpose (C33).
- If you forget: Start freezes the page again (both animations are made in the same moment), the heavy ball is made first and the background has to wait behind its drawing (a long hold), the box of the background shows its black before the canvas is made, a session that was ended after half a second still pays for making an animation, or a new session shows no ball for a long time.
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export const BALL_MOUNT_DELAY_MS = 600`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_MOUNT_DELAY_MS = 300`
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = export function useMountDelay(lit: number, active: boolean, ms: number): boolean {`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = const ready = useMountDelay(lit, active, BALL_MOUNT_DELAY_MS)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const ready = useMountDelay(lit, active, BG_MOUNT_DELAY_MS)`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = if (!shown || !ready || !canDrawWebgl2()) return null`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = if (!shown || !ready || !bgDrawn(LITE_LEVEL) || !canDrawWebgl2()) return null`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerWarmup.test.ts = describe("useMountDelay: the wait before a library animation is made", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBall.test.tsx = describe("TimerBall: the wait before the library ball is made", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBall.test.tsx = expect(REAL_DELAY).toBe(600)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = describe("TimerBackground: the wait before the background canvas is made", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(REAL_BG_DELAY).toBe(300)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(REAL_BALL_DELAY - REAL_BG_DELAY).toBeGreaterThanOrEqual(300)`
- Check by hand: on the laptop open the Pro Timer and press Start: the clocks and the buttons answer at once and the page does not freeze (the Pause button reacts straight away, the mouse keeps moving the cursor of the page). The moving background fades in first (about a third of a second after Start) and the glowing ball lights after it (about two thirds of a second after Start), never both in the same jump. Press Start, then Hold to end session and I'M DONE within a second: no ball and no background show up late. On the phone the same.

### C48: The comeback message after GO BACK IN and Resume: GO BACK IN leaves the session paused and notes the pause, the next Resume of that pause makes the message, the hook takes it away when the session stops running, the screen shows it for a few seconds, and its fade time is written in the code and in the css
- Tags: `AB:TIMER.COMEBACK`, `AB:TIMER.STATE`, `AB:TIMER.SCREEN`, `AB:TIMER.ALERT-LINES`, `AB:TIMER.TESTS`
- If you change: the kind "goback" in useTimer.ts (where the note is left, pendingRef), the kind "resume" (where the comeback line is picked), pendingMatches, comebackMatches, the lines in adopt that forget the note and the message, the view comeback and clearComeback, the place of Comeback in TimerScreen.tsx, the component Comeback.tsx, COMEBACK_SHOW_MS or COMEBACK_FADE_MS in stopAlertLines.ts, or the rules .ab-comeback in the part of timer.css that has the comeback tag
- Then also: the comeback lines (C41) say things like "the clock is running" and "the break wasn't counted", so the message may only be there while the session really runs. Since Packet 06E GO BACK IN does not resume the session: goBack closes the alert, leaves the session paused and writes a note (pendingRef: the seconds it stopped at, started_at and paused_at of that one pause). The Resume button then picks the line (pickComebackLine, for the seconds from the note, so the minutes in the line are the minutes the session had) and shows it, but only when the note still matches the pause the session is in (pendingMatches); this is true for a session that the alert paused and for one that was paused before the hold. A plain Pause and Resume, with no hold and no GO BACK IN, gets no message, and only the first Resume after GO BACK IN gets one. The note is read BEFORE adopt in the resume branch, because adopting the running row forgets it. adopt forgets the note when a new reading of the state does not match the pause any more (resumed, ended or paused again, here or on another device), and a new Hold to end session throws the old note away. comebackMatches compares started_at and the running status while the screen is drawn, and adopt forgets the message for good when a new reading of the state does not match any more (paused, ended, ended or paused on another device), so it cannot come back when the session runs again. Hold to end session pauses the session, so it takes the message away too. The comeback lines have queues of their own (comebackQueuesRef), as the stop alert lines have. The screen (TimerScreen.tsx) draws the message only while the hook has one, between the side and the stop alert, so the stop alert stays the last child of the screen (C43), and gives clearComeback to the component, which calls it when the time and the fade are over. The two times (COMEBACK_SHOW_MS, COMEBACK_FADE_MS) are written in stopAlertLines.ts and again in the tests (C33); the fade time is also the transition of .ab-comeback in timer.css, so a change of the fade time is a change of both. In the css the message floats (position absolute, so nothing moves when it comes and goes), never catches a tap (pointer-events none), has z-index 2 (above the dial and the buttons, below the menu at 40) and has no blur behind it (a blur over the moving background made the phone laggy). It sits at top 64px: the menu button is in the top 58px at the right and the screen keeps 72px free at the top. The line is shown by LineText (C49), word by word, with the effect of every marked keyword; every effect must be over before the message starts to fade (the test of LineText counts it for the longest comeback line).
- If you forget: GO BACK IN starts the clock by itself again, the message shows at GO BACK IN and not at Resume, a plain Resume shows an old message, the message says the clock is running while the session is paused, it comes back by itself when the session runs again, it stays for ever or goes away too soon, it covers or blocks a button, it shows while the stop alert is open, it moves the clocks and the buttons, or it fades in a different time than the code says.
- Anchor: `src/lib/useTimer.ts = import { pickComebackLine, pickStopLine, type ComebackQueues, type LineQueues } from "@/lib/stopAlertLines"`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const picked = pickComebackLine(pending.seconds, comebackQueuesRef.current)`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = pendingRef.current = { seconds: open.seconds, startedAt: open.startedAt, pausedAt: open.pausedAt }`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = return pending !== null && row !== null && row.status === "paused" && row.started_at === pending.startedAt && row.paused_at === pending.pausedAt`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = if (pendingRef.current !== null && !pendingMatches(pendingRef.current, next.row)) pendingRef.current = null`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = return comeback !== null && row !== null && row.status === "running" && row.started_at === comeback.startedAt`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = if (comebackRef.current !== null && !comebackMatches(comebackRef.current, next.row)) showComeback(null)`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = comeback: comebackMatches(comeback, row) ? { line: comeback.line } : null,`
- Anchor: `src/components/TimerScreen.tsx = import Comeback from "@/components/Comeback"`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = {timer.comeback === null ? null : <Comeback line={timer.comeback.line} onGone={timer.clearComeback} />}`
- Anchor: `src/components/Comeback.tsx = import { COMEBACK_FADE_MS, COMEBACK_SHOW_MS } from "@/lib/stopAlertLines"`
- Anchor: `AB:TIMER.COMEBACK @ src/components/Comeback.tsx = const gone = window.setTimeout(onGone, COMEBACK_SHOW_MS + COMEBACK_FADE_MS)`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = export const COMEBACK_SHOW_MS = 6000`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = export const COMEBACK_FADE_MS = 500`
- Anchor: `AB:TIMER.COMEBACK @ src/timer.css = transition: opacity 500ms ease;`
- Anchor: `AB:TIMER.COMEBACK @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.COMEBACK @ src/timer.css = z-index: 2;`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.hook.test.ts = describe("useTimer: the comeback message", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/Comeback.test.tsx = describe("Comeback: how long it stays", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/Comeback.test.tsx = expect(COMEBACK_SHOW_MS).toBe(6000)`
- Anchor: `AB:TIMER.TESTS @ src/components/Comeback.test.tsx = expect(fade).toBe(COMEBACK_FADE_MS)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("TimerScreen: the comeback message", () => {`
- Check by hand: on the phone and on the laptop open #timer, start a session and wait more than a minute, hold Hold to end session, then tap GO BACK IN: the alert closes, the clock stays where it was and the button says Resume. Tap Resume: the clock goes on, and one comeback line comes in word by word at the top of the screen, under the menu button, for about 6 seconds, then fades and goes away. Nothing moves while it comes and goes, and Pause works while it is there. Tap Pause while it shows: it goes away at once, and Resume does not bring it back. Pause the session first, then hold Hold to end session, tap GO BACK IN and then Resume: the session stays paused after GO BACK IN, and the message shows when you tap Resume. A plain Pause and Resume, with no hold, shows no message.

### C49: The six text effects of the lines: the names in EFFECTS, the rules of the css and the component LineText are one thing, every effect plays once, and every effect must be over before the comeback message fades
- Tags: `AB:TIMER.LINE-TEXT`, `AB:TIMER.LINE-MARKUP`, `AB:TIMER.STOP-ALERT`, `AB:TIMER.COMEBACK`, `AB:TIMER.MILESTONE`, `AB:TIMER.ALERT-LINES`, `AB:TIMER.TESTS`
- If you change: the six effect names (EFFECTS in lineMarkup.ts, C42), the component LineText.tsx (the box of a word, the box of an effect, data-effect, --word-i), the rules .ab-line-word and .ab-fx and the keyframes ab-word-in and ab-fx-* in the part of timer.css that has the line text tag, the lines that StopAlert.tsx, Comeback.tsx and Milestone.tsx hand to LineText, COMEBACK_SHOW_MS in stopAlertLines.ts, or the length of the comeback lines
- Then also: LineText shows the line word by word and wraps every marked word in a box with the name of its effect (data-effect). The effect is an attribute and not one class per effect on purpose: check-tags reads only class names that are written out in full in a .tsx file, so a class built from the name would be reported as unused; the number of the word is called --word-i (without ab-) for the same reason, it is set by the component and only used in the css. Each of the six names in EFFECTS needs a rule .ab-fx[data-effect="name"] and keyframes ab-fx-name in the css, and a rule for a name that is not in EFFECTS would never be used; the tests of LineText.test.tsx check both ways and read every marked keyword of all 176 stop alert lines and all 120 comeback lines. An effect starts 450 ms after its word started to come in (the words come in 80 ms apart, 700 ms each), plays ONCE and then rests in the plain rule of its name: the keyframes hold only the first frame and the peaks. Nothing loops (the phone must stay cool and the line must stay easy to read), and only transform, opacity, colour and text-shadow are animated, besides the blur of the word coming in; no blur behind the text (C22, C25). The movement of the words is the movement of the React Bits BlurText that the lines used before (the library file is not edited and the login screen still uses it, tag AB:LOGIN.HERO); the test reads BlurText.tsx and the keyframes and fails if they drift apart. The comeback message is on the screen for COMEBACK_SHOW_MS (C48): the last word of the longest comeback line plus the longest effect (1600 ms, ghost) must end before that, and the test counts it, so a longer effect or a longer line needs a longer COMEBACK_SHOW_MS (and its test, C33). The words stay real words with real spaces, so the line reads right for a screen reader (the alert points at it with aria-describedby, C43). People who asked for less motion get no animation at all: the words and the effects are at rest at once, and the colours stay. Every effect shows each time its line is shown: the shuffle (C41) does not repeat a line before all lines of its group were shown, but nothing remembers that a line was seen.
- If you forget: a keyword shows no effect, an effect never plays or plays for ever, an effect is still playing when the comeback message fades, the line is a flex row again and wraps differently, the phone gets hot or laggy, or the words come in with another movement than before.
- Anchor: `src/components/LineText.tsx = import { parseMarkup, toWords } from "@/lib/lineMarkup"`
- Anchor: `AB:TIMER.LINE-TEXT @ src/components/LineText.tsx = <span className="ab-line-word" style={{ "--word-i": w } as CSSProperties}>`
- Anchor: `AB:TIMER.LINE-TEXT @ src/components/LineText.tsx = <span key={p} className="ab-fx" data-effect={piece.effect}>`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = animation: ab-word-in 700ms linear calc(var(--word-i) * 80ms) backwards;`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = @keyframes ab-word-in {`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = .ab-fx[data-effect="glow"] {`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = .ab-fx[data-effect="heat"] {`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = .ab-fx[data-effect="shake"] {`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = .ab-fx[data-effect="strike"] {`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = .ab-fx[data-effect="ghost"] {`
- Anchor: `AB:TIMER.LINE-TEXT @ src/timer.css = .ab-fx[data-effect="rise"] {`
- Anchor: `AB:TIMER.STOP-ALERT @ src/components/StopAlert.tsx = <LineText key={line} line={line} className="ab-alert-line" />`
- Anchor: `src/components/StopAlert.tsx = import LineText from "@/components/LineText"`
- Anchor: `AB:TIMER.COMEBACK @ src/components/Comeback.tsx = <LineText key={line} line={line} className="ab-comeback-line" />`
- Anchor: `src/components/Comeback.tsx = import LineText from "@/components/LineText"`
- Anchor: `AB:TIMER.MILESTONE @ src/components/Milestone.tsx = <LineText key={line} line={line} className="ab-milestone-line" />`
- Anchor: `src/components/Milestone.tsx = import LineText from "@/components/LineText"`
- Anchor: `AB:TIMER.TESTS @ src/components/LineText.test.tsx = describe("the css of the words and the effects", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/LineText.test.tsx = expect([...names].sort()).toEqual([...EFFECTS].sort())`
- Anchor: `AB:TIMER.TESTS @ src/components/LineText.test.tsx = expect((longest - 1) * 80 + 450 + slowest).toBeLessThan(COMEBACK_SHOW_MS)`
- Check by hand: on the phone and on the laptop open #timer, start a session and wait more than a minute, hold Hold to end session. The line of the alert comes in word by word, and its marked keywords play their effect once and rest: glow shines, heat warms to orange, shake trembles and stays a little red, strike gets a line drawn through it, ghost flickers and stays faint, rise lifts and turns green. Nothing keeps moving afterwards. Tap GO BACK IN: the comeback line does the same at the top and is fully at rest before it fades. Read the line on top of the brightest part of the background: every keyword, also the faint ghost, must still be readable. Set the device to reduce motion: the words and the effects are there at once, with their colours and without any movement.

### C50: The milestone lines are tied to the minutes of MILESTONE_MINUTES, to the cut-offs of the timer (the numbers and words written in the lines), to the glowing ball that one line of every bank talks about, to the choice of lines of the stop alert (the shuffling), and to the length of the message
- Tags: `AB:TIMER.MILESTONE-LINES`, `AB:TIMER.ALERT-LINES`, `AB:TIMER.MATHS`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.LINE-MARKUP`, `AB:TIMER.TESTS`
- If you change: the list MILESTONE_MINUTES or MAX_LIVE_STEP_SECONDS in timerMaths.ts, a cut-off of the timer (SOLID_FROM_SECONDS, DEEP_FROM_SECONDS or FLOW_FROM_SECONDS), the colour steps of the ball (ballStep in ballLook.ts), the condition under which the ball is drawn (WebGL 2), nextIndex in stopAlertLines.ts, the marks of lineMarkup.ts (C42), the number or the words in a line (a number, a number written as a word, flow, solid, deep, milestone, a sentence about the ball, any sentence about rays of light), or MILESTONE_SHOW_MS or MILESTONE_FADE_MS in milestoneLines.ts
- Then also: there is exactly one bank for every number in MILESTONE_MINUTES (the type MilestoneMinute is made from that list, so a new minute does not compile until its bank is written, and the tests want 35 general lines and one ball line in it). A line writes its number out (there is no slot: a milestone is at an exact minute). The tests keep a list of the digits and of the number words each bank may use; a new number fails the test until the planner has read the line against the milestone and added it to the list. One line of every bank talks about the ball (line 36), no other line may mention the ball, and no line at all may talk about rays of light (the moving background has none, Packet 08B): the ball line is only in the pool of lines when the ball is drawn (pickMilestoneLine gets MilestoneVisuals from the caller, which is the hook, which asks drawnNow in TimerScreen.tsx, see C51: the ball is drawn when the browser has WebGL 2). The line makes a claim (for example the ball has held its last colour for 30 minutes at 120 minutes). The tests check the claim against the real function ballStep for every second from the milestone to the end of the fade of the message, plus MAX_LIVE_STEP_SECONDS (a message is shown late when the person was not looking; only a message that is shown within that many seconds of its milestone gets the ball line, see milestoneOnTime in timerMaths.ts and C51), and the claims are allowed a tolerance of TOLERANCE_MINUTES (0.7 minutes) because the message stays 30 seconds, so if the colour steps of the ball move, the tests name the line to read again. The lines are shuffled by nextIndex of stopAlertLines.ts (exported for this): the queue of a pool is kept under the key minute and ball (for example 60:b, or 60:- when no ball is drawn), because a pool of 35 lines and a pool of 36 lines are different lists and must never share a queue. The words of all 288 lines are also kept in ASHBORN_MILESTONE_LINES.md; if a line is changed in the code the file is changed too.
- If you forget: a line says a number that is not true at the minute it is shown (45 minutes away from the last colour at minute 60, a ball that changed colour once at minute 45), the word flow is said at 60 minutes, a line about the ball is shown on a device that draws no ball, a line comes twice before all others were shown, a queue is used for a pool of another size and the same line comes twice in a row, or a milestone has no line at all.
- Anchor: `src/lib/milestoneLines.ts = import { nextIndex, type BankQueue } from "@/lib/stopAlertLines"`
- Anchor: `src/lib/milestoneLines.ts = import { MILESTONE_MINUTES } from "@/lib/timerMaths"`
- Anchor: `AB:TIMER.MILESTONE-LINES @ src/lib/milestoneLines.ts = export type MilestoneMinute = (typeof MILESTONE_MINUTES)[number]`
- Anchor: `AB:TIMER.MILESTONE-LINES @ src/lib/milestoneLines.ts = export type MilestoneVisuals = { ball: boolean }`
- Anchor: `AB:TIMER.MILESTONE-LINES @ src/lib/milestoneLines.ts = if (visuals.ball) pool.push(bank.ballLine)`
- Anchor: `AB:TIMER.MILESTONE-LINES @ src/lib/milestoneLines.ts = const key = minute + ":" + (visuals.ball ? "b" : "-")`
- Anchor: `AB:TIMER.MILESTONE-LINES @ src/lib/milestoneLines.ts = const { index, queue } = nextIndex(pool.length, queues[key], random)`
- Anchor: `AB:TIMER.ALERT-LINES @ src/lib/stopAlertLines.ts = export function nextIndex(size: number, old: BankQueue | undefined, random: () => number): { index: number; queue: BankQueue } {`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MILESTONE_MINUTES = [15, 25, 45, 60, 90, 120, 150, 180] as const`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MAX_LIVE_STEP_SECONDS = 10`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return STEPS.indexOf(qualityOf(seconds)) as 0 | 1 | 2 | 3`
- Anchor: `AB:TIMER.TESTS @ src/lib/milestoneLines.test.ts = describe("the numbers and words written in the lines", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/milestoneLines.test.ts = describe("the lines about the ball", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/milestoneLines.test.ts = const WINDOW = MAX_LIVE_STEP_SECONDS + (MILESTONE_SHOW_MS + MILESTONE_FADE_MS) / 1000`
- Anchor: `AB:TIMER.TESTS @ src/lib/milestoneLines.test.ts = describe("pickMilestoneLine", () => {`
- Check by hand: read the lines of the bank of every milestone that moves when a cut-off of the timer, the colour steps of the ball change (the tests stop the build when a written number, a number word or the claim of the ball line is no longer true, but they cannot judge the meaning of a sentence: for example "Midpoint maths" at 25 minutes, or the jokes about a nearby clock). The wording of the lines is the owner's: the satirical lines aim at urges, excuses and distractions and never at the person. The hook and the screen that show these lines are in C51.

### C51: The milestone message: the hook decides when it comes (it waits until the page is visible, a missed one comes late with a tag from 5 minutes, it is given up after 10 minutes, the newest one wins, each is shown once per session), the screen tells the hook what it draws, the screen shows it for 30 seconds at the bottom, and its times are written in the maths, the code, the css and the tests
- Tags: `AB:TIMER.MILESTONE`, `AB:TIMER.STATE`, `AB:TIMER.SCREEN`, `AB:TIMER.MATHS`, `AB:TIMER.MILESTONE-LINES`, `AB:TIMER.TESTS`
- If you change: MILESTONE_KEEP_SECONDS, MILESTONE_EARLIER_FROM_SECONDS, milestoneWaiting, milestoneDone, earlierMinutes or milestoneOnTime in timerMaths.ts; MILESTONE_MINUTES or MAX_LIVE_STEP_SECONDS (see also C50); milestoneMatches, the milestone effect, the looking state and its listeners, the option drawn, the view milestone and clearMilestone in useTimer.ts; drawnNow or the place of Milestone in TimerScreen.tsx; the component Milestone.tsx; MILESTONE_SHOW_MS or MILESTONE_FADE_MS in milestoneLines.ts; or the rules .ab-milestone, .ab-milestone-tag and .ab-milestone-line in the part of timer.css that has the milestone tag
- Then also: a milestone message WAITS. The hook asks every second (the effect on row, seconds, looking and milestone) which milestone is waiting (milestoneWaiting, for the seconds of the session clock, so a pause does not make a message older). It shows the newest one that is at most MILESTONE_KEEP_SECONDS (600, 10 minutes) late, only while the session runs, the page is visible (document.visibilityState, also pageshow) and no other milestone message is on the screen; older ones that are still waiting are given up when a newer one is shown (milestoneDone), and one that is more than 10 minutes late is given up for good. The milestones are at least 10 minutes apart, so the old one ends just as the next one is due (a test checks that the gap is never shorter than MILESTONE_KEEP_SECONDS). What was shown or given up is written down per session in doneRef (by started_at), so a milestone never comes twice in a session and a new session starts again; a page opened soon after a milestone shows it (the page opening counts as the person looking), a page opened long after does not. When the page becomes visible the hook takes the time again in the same step (setNow), so the lateness is the real one. The tag "N min earlier" is made from the lateness (earlierMinutes): whole minutes, only from MILESTONE_EARLIER_FROM_SECONDS (300, 5 minutes); under that there is no tag. The line about the glowing ball is true only at the moment of the milestone (C50), so it is in the pool only when the message is on time (milestoneOnTime: at most MAX_LIVE_STEP_SECONDS late) AND the screen says the ball is drawn: the hook never asks the browser, the screen gives it the option drawn (drawnNow in TimerScreen.tsx: the ball when the browser has WebGL 2, the same condition as TimerBall.tsx, at every lite level), and without the option nothing counts as drawn. A late message gets the 35 general lines only. The message belongs to one running stretch of one session (milestoneMatches, like comebackMatches in C48): adopt forgets it when the session is paused (the stop alert pauses it), ended, or ended on another device, and the milestone stays done. The screen shows it for MILESTONE_SHOW_MS (30000) and the fade MILESTONE_FADE_MS (500, the same number as the transition of .ab-milestone in the css), then calls clearMilestone. It floats at the bottom of the screen (the comeback message is at the top), above the dial and the buttons (z-index 2, the menu is 40), never catches a tap, and is the child before the stop alert, so the stop alert stays the last child. Its tag and its line use LineText (C49). The hook does not stop the 30 seconds when the person looks away in the middle of them: the message was seen at its start.
- If you forget: a message comes while nobody looks, it never comes after a look away, it comes twice, it comes for an old milestone after the next one is due, the tag shows under 5 minutes or says the wrong number, a late message says something about the ball that is no longer true, a line about the ball is shown on a device that draws none, the message stays after the session was paused or ended, it comes back at Resume, it covers or blocks a button, it is under the stop alert, it stays for ever or goes away too soon, or it fades in a different time than the code says.
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MILESTONE_KEEP_SECONDS = 600`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MILESTONE_EARLIER_FROM_SECONDS = 300`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export function milestoneWaiting(currentSeconds: number, handled: readonly number[]): MilestoneWaiting {`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = return wholeSeconds(lateSeconds) <= MAX_LIVE_STEP_SECONDS`
- Anchor: `src/lib/useTimer.ts = import { pickMilestoneLine, type MilestoneQueues, type MilestoneVisuals } from "@/lib/milestoneLines"`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = export type TimerOptions = { drawn?: () => MilestoneVisuals }`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = return milestone !== null && row !== null && row.status === "running" && row.started_at === milestone.startedAt`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = if (milestoneRef.current !== null && !milestoneMatches(milestoneRef.current, next.row)) showMilestone(null)`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = document.addEventListener("visibilitychange", sync)`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = if (row.status !== "running" || !looking || milestone !== null) return`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = const drawn = milestoneOnTime(waiting.lateSeconds) ? (drawnRef.current?.() ?? NOTHING_DRAWN) : NOTHING_DRAWN`
- Anchor: `AB:TIMER.STATE @ src/lib/useTimer.ts = milestone: milestoneMatches(milestone, row) ? { line: milestone.line, earlier: milestone.earlier } : null,`
- Anchor: `src/components/TimerScreen.tsx = import Milestone from "@/components/Milestone"`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = const timer = useTimer({ drawn: drawnNow })`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = return { ball: canDrawWebgl2() }`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <Milestone line={timer.milestone.line} earlier={timer.milestone.earlier} onGone={timer.clearMilestone} />`
- Anchor: `src/components/Milestone.tsx = import { MILESTONE_FADE_MS, MILESTONE_SHOW_MS } from "@/lib/milestoneLines"`
- Anchor: `AB:TIMER.MILESTONE @ src/components/Milestone.tsx = const gone = window.setTimeout(onGone, MILESTONE_SHOW_MS + MILESTONE_FADE_MS)`
- Anchor: `AB:TIMER.MILESTONE-LINES @ src/lib/milestoneLines.ts = export const MILESTONE_SHOW_MS = 30000`
- Anchor: `AB:TIMER.MILESTONE-LINES @ src/lib/milestoneLines.ts = export const MILESTONE_FADE_MS = 500`
- Anchor: `AB:TIMER.MILESTONE @ src/timer.css = transition: opacity 500ms ease;`
- Anchor: `AB:TIMER.MILESTONE @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.MILESTONE @ src/timer.css = z-index: 2;`
- Anchor: `AB:TIMER.MILESTONE @ src/timer.css = bottom: calc(12px + env(safe-area-inset-bottom, 0px));`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(MILESTONE_KEEP_SECONDS).toBe(600)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(MILESTONE_EARLIER_FROM_SECONDS).toBe(300)`
- Anchor: `AB:TIMER.TESTS @ src/lib/milestoneLines.test.ts = expect(MILESTONE_SHOW_MS).toBe(30000)`
- Anchor: `AB:TIMER.TESTS @ src/lib/milestoneLines.test.ts = const TOLERANCE_MINUTES = 0.7`
- Anchor: `AB:TIMER.TESTS @ src/lib/useTimer.hook.test.ts = describe("useTimer: the milestone message", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/Milestone.test.tsx = describe("Milestone: how long it stays", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/Milestone.test.tsx = expect(MILESTONE_SHOW_MS).toBe(30_000)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("TimerScreen: the milestone message", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("TimerScreen: what it tells the hook that it draws", () => {`
- Check by hand: on the phone and on the laptop open #timer and start a session. At 15 minutes one line comes in word by word at the bottom of the screen, its marked keywords play their effect, and it stays about 30 seconds, then fades and goes away. Nothing moves while it comes and goes, Pause works while it is there, and it does not cover the Hold button on a normal phone (on a very low screen it floats over the lower part of the buttons: look at this on the smallest phone you have). Tap Pause while it shows: it goes away at once and Resume does not bring it back. To see a missed message: switch to another tab or lock the phone at about 12 minutes, come back at about 20 minutes: the 15 minute line comes with the tag "5 min earlier" (about 5 minutes late), and a message more than 10 minutes late never comes. Come back less than 5 minutes after a milestone: the message comes without a tag. On a device without WebGL 2 no line talks about the ball, and no line ever talks about rays of light.

### C52: The picture of the moving background is drawn by our own canvas: the canvas makes and gives back its own canvas element, its settings are the settings of BG_SETTINGS, its colours are a row of 256 sent only when they change, and the names of its uniforms are written in the shader and in the canvas
- Tags: `AB:TIMER.BG-CANVAS`, `AB:TIMER.BG-RENDER`, `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.TESTS`
- If you change: the shader (FIELD_FRAGMENT), the names of its uniforms (FIELD_UNIFORM_NAMES), the size of the row of colours (RAMP_SIZE) or the longest step of time (FRAME_STEP_MAX_S) in backgroundRender.ts; the way BackgroundCanvas.tsx makes or takes away its canvas, asks for its context, sends the row of colours, follows the size of its box, waits for a hidden page or draws again after a lost context; the names or the meaning of the settings in BG_SETTINGS (backgroundLook.ts) or of the props of BackgroundCanvas; the place in TimerBackground.tsx where the canvas is made
- Then also: the picture is not the shader of the React Bits animation Grainient that drew the background in Packet 08A. It is the picture of the blend preview of the owner (Grainient_blend_preview.html): the position is bent twice by slow waves (flow), a long gradient runs across it in the direction of the angle with fine lines on it (silk), the number that comes out looks up a colour in a row of 256 colours made from the ramp of five colours (rampBytes, mixed in the Oklab colour space, softness 1 melts the colours into each other), the bottom may get a shade (shade, which the Pro Timer leaves at 0 because timer.css has its own shade at the bottom, C37), and a still grain is added. A pixel check at 10, 30 and 90 minutes for all six palettes found the canvas within 1 of 255 of the preview. The library Grainient.tsx is still in the project, never edited and not used. The canvas makes its OWN canvas element inside its effect and takes it away in the cleanup, and gives its WebGL context back there: in development React (StrictMode, src/main.tsx) mounts every component, takes it away at once and mounts it again, and a canvas whose context was given back cannot get a new one, so a canvas made in the markup (JSX) came back dead and the background stayed gray; here the second mount makes a new canvas with a new context (a test mounts it three times in StrictMode and checks that one canvas with a live context is left). The programs for the graphics chip are made once; when the colours change (many times a second during a blend, C37) only the row of 256 colours is sent again, and only when the colours or the softness really changed. The names of the uniforms are written twice on purpose: in the shader (FIELD_FRAGMENT) and in FIELD_UNIFORM_NAMES, which the canvas uses to look every one up and to set it (a test checks that every uniform is declared once, used, and in the list). The canvas gets all the settings of BG_SETTINGS as props (angle, speed, flow, scale, softness, silk, grainAmount, grainSize, dpr) and the colours; the props shade and frozenAt are only for the pixel checks and the Pro Timer never gives them. The flow goes on only while the page is visible and the speed is above 0, one picture for every frame; the step of time of one frame is cut to 0.1 seconds, so after a hidden page the flow goes on from where it was; with speed 0 (a person who asked for less motion, or the Pro Timer while its session is paused, C37) it draws one still picture, and again when the colours or the size change. It follows the size of its box with a resize observer (the resize of the window when the browser has none). Setting the width or the height of a canvas empties it, and the browser paints right after the resize observers have run, before the next frame, so a canvas that has already drawn once draws its picture again at once after every size change (without this, every size step of a window being dragged, or a phone being turned, paints one empty black picture); its very first picture still waits for the first frame. It listens to nothing of the cursor, a click, a touch, the wheel or a key (a test checks this). If the browser has no WebGL 2, or cannot make the program, it draws nothing and the black of .ab-timer-bg stays (C38); TimerBackground asks canDrawWebgl2 first (C44). The colours are read in plain code (readColour), never by drawing on a hidden canvas and reading the pixels back, so a browser setting that scrambles canvas pixels cannot change them. Because the automated tests use a fake WebGL 2 context (jsdom has none), they cannot see that the shader really compiles and draws: that was checked in a real browser (Chromium with software WebGL 2, development with StrictMode and the production build, 62 of 62 rules each) and by pixels against the preview, and it must be looked at again by eye on the laptop and on the phone after any change of the shader.
- If you forget: the background is gray or empty in development (the canvas came back dead), or it builds its drawing again many times a second (it flickers and the phone gets hot), or a colour step jumps, or a uniform is never set and the picture is flat, or the picture is not the picture of the preview, or the canvas answers to the cursor, or a hidden page keeps drawing, or a canvas that lost its context stays empty.
- Anchor: `AB:TIMER.BG-CANVAS @ src/components/BackgroundCanvas.tsx = const canvas = document.createElement("canvas")`
- Anchor: `AB:TIMER.BG-CANVAS @ src/components/BackgroundCanvas.tsx = gl.getExtension("WEBGL_lose_context")?.loseContext()`
- Anchor: `AB:TIMER.BG-CANVAS @ src/components/BackgroundCanvas.tsx = gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, RAMP_SIZE, 1, gl.RGBA, gl.UNSIGNED_BYTE, rampBytes(s.colors, s.softness))`
- Anchor: `AB:TIMER.BG-CANVAS @ src/components/BackgroundCanvas.tsx = for (const name of FIELD_UNIFORM_NAMES) uniforms[name] = gl.getUniformLocation(program, name)`
- Anchor: `AB:TIMER.BG-CANVAS @ src/components/BackgroundCanvas.tsx = document.addEventListener("visibilitychange", onVisibility)`
- Anchor: `AB:TIMER.BG-CANVAS @ src/components/BackgroundCanvas.tsx = canvas.addEventListener("webglcontextrestored", onRestored)`
- Anchor: `AB:TIMER.BG-RENDER @ src/lib/backgroundRender.ts = export const RAMP_SIZE = 256`
- Anchor: `AB:TIMER.BG-RENDER @ src/lib/backgroundRender.ts = export const FRAME_STEP_MAX_S = 0.1`
- Anchor: `AB:TIMER.BG-RENDER @ src/lib/backgroundRender.ts = uniform sampler2D uRamp;`
- Anchor: `AB:TIMER.BG-RENDER @ src/lib/backgroundRender.ts = export const FIELD_UNIFORM_NAMES = ["uRes", "uPhase", "uRamp", "uGrain", "uZoom", "uFlow", "uDir", "uSilk", "uShade"] as const`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_SETTINGS = {`
- Anchor: `src/components/TimerBackground.tsx = import BackgroundCanvas from "@/components/BackgroundCanvas"`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <BackgroundCanvas {...BG_SETTINGS} speed={still ? 0 : BG_SETTINGS.speed} colors={colours} />`
- Anchor: `AB:TIMER.TESTS @ src/components/BackgroundCanvas.test.tsx = describe("BackgroundCanvas: its own canvas", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundRender.test.ts = describe("the text of the shader", () => {`
- Check by hand: on the laptop (?lite=0) and on the phone start a session and use the Time machine panel (top left) to jump to 5 seconds before 10:00, 30:00 and 90:00: the background is not gray and not empty, the picture flows slowly, the grain stands still, the colours blend in over about 12 seconds without a jump and look like the blend preview of the owner (Grainient_blend_preview.html) at the same minute, the cursor and a click do nothing, the page does not slow down and the phone does not get hot. In development (npm run dev, StrictMode on) the background must show too, on the first load and after a change of a file. Leave the page in another tab for a minute and come back: the flow goes on without a jump.

## Things to know (no check is possible)
- The Project URL and the publishable key are meant to be in the browser app: row-level security (not yet written, there are no tables) is what protects data. The secret key must never be in the project. .env is ignored by git (Packet 03A checks this before it creates the file).
- Sign-ups are OFF in the Supabase dashboard. Users are created there by hand, with "Auto Confirm User" ticked.
- The glass card redraws what is behind it while the background animates. On a real phone (the Vercel link, 2026-10-05) the full look was very laggy and not smooth. The cause was reasoned, not measured: on Chrome the glass runs a displacement filter over the moving background on every frame, and the background is drawn at the full phone resolution. Lite mode (AB:LOGIN.LITE, C21, C22) was added for this. Whether lite is smooth on the phone has NOT been reported yet.
- The hero line is a different length each time. Very long lines wrap onto more rows; the font size in HERO is set for short lines.
- The name in the corner (BRAND) is drawn on a canvas 60 times a second on a laptop and 30 times a second in lite mode (LoginBrand.tsx). It sits on top of the moving background and the card.
- The name is a picture of text, not real text: it cannot be selected or copied. The wrapper has role="img" and aria-label="ASHBORN" so screen readers still say the name.
