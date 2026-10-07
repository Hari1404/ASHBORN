import type { MouseEvent } from "react"
import StaggeredMenu from "@/components/StaggeredMenu"
import { SCREENS } from "@/lib/screens"
import "../menu.css"

// AB:MENU.PANEL:START
// The menu: a button in the top right corner that opens a panel with the four screens.
// It is the library component Staggered Menu (src/components/StaggeredMenu.tsx, never edited). Only its settings are here.
// The library always draws a logo and does not close the panel when an item is tapped. So: the logo is a 1 pixel see-through picture (hidden in menu.css), and a tap on an item also presses the menu button once, which closes the panel. See CONNECTIONS.md C24 and C25.
const NO_LOGO = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="

const ITEMS = SCREENS.map((s) => ({
  label: s.label,
  ariaLabel: "Go to " + s.label,
  link: "#" + s.id,
}))

export default function AppMenu() {
  function closeAfterItemTap(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest(".sm-panel-item")) {
      e.currentTarget.querySelector<HTMLButtonElement>(".sm-toggle")?.click()
    }
  }
  return (
    <div className="ab-menu" onClick={closeAfterItemTap}>
      <StaggeredMenu
        isFixed={false}
        position="right"
        colors={["#2b1763", "#5b34d6"]}
        items={ITEMS}
        displaySocials={false}
        displayItemNumbering={false}
        logoUrl={NO_LOGO}
        menuButtonColor="#f4f0ff"
        openMenuButtonColor="#f4f0ff"
        changeMenuColorOnOpen={false}
        accentColor="#b69cff"
        closeOnClickAway={true}
      />
    </div>
  )
}
// AB:MENU.PANEL:END
