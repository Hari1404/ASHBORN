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
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.HERO`
- If you change: the background colour (backgroundColor in BG), the page base colour (.ab-screen in LAYOUT), or the hero text colour (HERO)
- Then also: keep the background colour and the page base colour the same. Then look at the hero line: it is white and sits straight on the animation, helped only by its dark shadow.
- If you forget: with a light or colourful background the white line on the left becomes hard or impossible to read; a base colour that differs from the animation shows as a flash or a band before the animation loads.
- Anchor: `AB:LOGIN.BG @ src/App.tsx = backgroundColor="#000000"`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = background: #000;`
- Anchor: `AB:LOGIN.HERO @ src/login.css = color: #fff;`

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

## Things to know (no check is possible)
- The glass card redraws what is behind it while the background animates. Phone speed and battery with both together have NOT been tested. If a phone feels slow, the background speed (BG) and the glass settings (GLASS) are the first two things to look at.
- The hero line is a different length each time. Very long lines wrap onto more rows; the font size in HERO is set for short lines.
