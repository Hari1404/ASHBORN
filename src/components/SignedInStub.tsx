import DarkVeil from "@/components/DarkVeil"
import { supabase } from "@/lib/supabase"
import { LITE_LEVEL } from "@/lib/lite"
import "../auth.css"

// AB:AUTH.STUB:START
// TEMPORARY screen shown after a sign in. It is thrown away when the real app shell is built.
// The background is Dark Veil. It sits in the same ab-bg box, with the same lite mode, as the front page. See CONNECTIONS.md C23.
export default function SignedInStub({ email }: { email: string }) {
  return (
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
      <p className="ab-stub-title">Signed in</p>
      <p className="ab-stub-line">{email}</p>
      <p className="ab-stub-note">Temporary screen. The real app comes next.</p>
      <button
        className="ab-stub-button"
        type="button"
        onClick={() => void supabase?.auth.signOut()}
      >
        Sign out
      </button>
    </main>
  )
}
// AB:AUTH.STUB:END
