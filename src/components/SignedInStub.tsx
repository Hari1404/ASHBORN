import AppMenu from "@/components/AppMenu"
import DarkVeil from "@/components/DarkVeil"
import { supabase } from "@/lib/supabase"
import { LITE_LEVEL } from "@/lib/lite"
import { SCREENS, useScreen } from "@/lib/screens"
import "../auth.css"

// AB:AUTH.STUB:START
// TEMPORARY screen shown after a sign in. It is thrown away when the real app shell is built.
// The background is Dark Veil. It sits in the same ab-bg box, with the same lite mode, as the front page. See CONNECTIONS.md C23.
// The title is the name of the screen chosen in the menu (the list is in src/lib/screens.ts). The four screens are empty placeholders for now. The menu (AppMenu) sits BESIDE the main element, not inside it, see CONNECTIONS.md C25.
export default function SignedInStub({ email }: { email: string }) {
  const screen = useScreen()
  const title = SCREENS.find((s) => s.id === screen)?.label ?? ""
  return (
    <>
      <main className="ab-stub">
        <div className="ab-bg" data-lite={LITE_LEVEL > 0 ? "on" : undefined}>
          <DarkVeil
            hueShift={0}
            noiseIntensity={0.11}
            scanlineIntensity={0}
            speed={LITE_LEVEL === 2 ? 0 : 0.8}
            scanlineFrequency={0.5}
            warpAmount={5}
            resolutionScale={1}
            lightMode={false}
          />
        </div>
        <p className="ab-stub-title">{title}</p>
        <p className="ab-stub-line">{email}</p>
        <p className="ab-stub-note">Temporary placeholder. The real screen comes later.</p>
        <button
          className="ab-stub-button"
          type="button"
          onClick={() => void supabase?.auth.signOut()}
        >
          Sign out
        </button>
      </main>
      <AppMenu />
    </>
  )
}
// AB:AUTH.STUB:END
