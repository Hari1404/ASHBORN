import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// AB:AUTH.SESSION:START
// Gives the saved sign-in: "loading" while it is being read, null when nobody is signed in, or the session.
export type SessionState = Session | null | "loading"

export function useSession(): SessionState {
  const [session, setSession] = useState<SessionState>(supabase ? "loading" : null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  return session
}
// AB:AUTH.SESSION:END
