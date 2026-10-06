import { useEffect, useState } from "react"

// AB:MENU.NAV:START
// The four screens of the app, and how the page address (for example #timer) chooses one of them.
// The menu (see MENU in CODE_MAP.md) builds its items from SCREENS. See CONNECTIONS.md C24.
export type ScreenId = "overview" | "timer" | "calendar" | "guide"

export const SCREENS: { id: ScreenId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "timer", label: "Pro Timer" },
  { id: "calendar", label: "Calendar" },
  { id: "guide", label: "Guide" },
]

function readScreen(): ScreenId {
  const wanted = window.location.hash.replace("#", "")
  return SCREENS.find((s) => s.id === wanted)?.id ?? "overview"
}

export function useScreen(): ScreenId {
  const [screen, setScreen] = useState<ScreenId>(readScreen)
  useEffect(() => {
    const onChange = () => setScreen(readScreen())
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return screen
}
// AB:MENU.NAV:END
