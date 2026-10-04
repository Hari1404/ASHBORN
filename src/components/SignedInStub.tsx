import { supabase } from "@/lib/supabase"
import "../auth.css"

// AB:AUTH.STUB:START
// TEMPORARY screen shown after a sign in. It is thrown away when the real app shell is built.
export default function SignedInStub({ email }: { email: string }) {
  return (
    <main className="ab-stub">
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
