import { useEffect, useState } from "react"

// AB:MENU.NAV:START
// The four screens of the app, and how the page address (for example #timer) chooses one of them.
// The menu (see MENU in CODE_MAP.md) builds its items from SCREENS. See CONNECTIONS.md C24.
// The Guide has sub-addresses (Packet 12B): #guide is the Learn hub, #guide/python is the subject python and #guide/python/PY-14 is the item PY-14 of it. The item part is read now and used by the item card (Packet 12B2). Any other address with a slash still opens the Overview, as before.
// Here the words after #guide are only split (a plain read). Whether the subject or the item exists is decided by the Learn screen (resolveGuideAddress in src/lib/learnView.ts). See CONNECTIONS.md C74.
export type ScreenId = "overview" | "timer" | "calendar" | "guide"

export const SCREENS: { id: ScreenId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "timer", label: "Pro Timer" },
  { id: "calendar", label: "Calendar" },
  { id: "guide", label: "Guide" },
]

export type GuideAddress = { subject: string | null; item: string | null }
export type ParsedAddress = { screen: ScreenId; guide: GuideAddress }

const NO_GUIDE: GuideAddress = { subject: null, item: null }
const WORD = /^[A-Za-z0-9-]+$/

// Reads an address such as "#guide/python/PY-14". Anything that is not a screen opens the Overview.
// Only the Guide takes more words after its id, at most two (a subject, then an item). A word with other
// characters than letters, digits and a dash is not read: the Guide then opens at that point of the address.
export function parseAddress(hash: string): ParsedAddress {
  const parts = hash.replace(/^#/, "").split("/")
  const first = SCREENS.find((s) => s.id === parts[0])?.id
  if (first === undefined) return { screen: "overview", guide: NO_GUIDE }
  if (parts.length === 1) return { screen: first, guide: NO_GUIDE }
  if (first !== "guide" || parts.length > 3) return { screen: "overview", guide: NO_GUIDE }
  const subject = parts[1] ?? ""
  const item = parts[2] ?? ""
  if (!WORD.test(subject)) return { screen: "guide", guide: NO_GUIDE }
  if (!WORD.test(item)) return { screen: "guide", guide: { subject, item: null } }
  return { screen: "guide", guide: { subject, item } }
}

// The address of a place in the Guide: "#guide", "#guide/python" or "#guide/python/PY-14".
export function guideHash(subject?: string | null, item?: string | null): string {
  if (!subject) return "#guide"
  return item ? `#guide/${subject}/${item}` : `#guide/${subject}`
}

function readAddress(): ParsedAddress {
  return parseAddress(window.location.hash)
}

export function useScreen(): ScreenId {
  const [screen, setScreen] = useState<ScreenId>(() => readAddress().screen)
  useEffect(() => {
    const onChange = () => setScreen(readAddress().screen)
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return screen
}

// The words after #guide, read again at every change of the address. The same object is kept while they are the same.
export function useGuideAddress(): GuideAddress {
  const [address, setAddress] = useState<GuideAddress>(() => readAddress().guide)
  useEffect(() => {
    const onChange = () => {
      const next = readAddress().guide
      setAddress((now) => (now.subject === next.subject && now.item === next.item ? now : next))
    }
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return address
}
// AB:MENU.NAV:END
