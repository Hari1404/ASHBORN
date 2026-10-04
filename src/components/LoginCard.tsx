import { useState } from "react"
import type { FormEvent } from "react"
import { supabase, userIdToEmail } from "@/lib/supabase"
import GlassSurface from "@/components/GlassSurface"
import "../login.css"

// AB:LOGIN.GLASS:START
// All glass settings are here, in one place. The darkness is --ab-glass-tint in src/login.css.
const GLASS = {
  width: "min(100%, 440px)",
  height: "auto",
  borderRadius: 22,
  borderWidth: 0.07,
  brightness: 50,
  opacity: 0.93,
  blur: 11,
  displace: 4,
  backgroundOpacity: 0,
  saturation: 1,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 0,
  blueOffset: 0,
}
// AB:LOGIN.GLASS:END

export default function LoginCard() {
  // AB:LOGIN.SUBMIT:START
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const userId = String(form.get("username") ?? "")
    const password = String(form.get("password") ?? "")
    if (!supabase) {
      setMessage("Not connected. The .env file is missing or not filled in.")
      return
    }
    const email = userIdToEmail(userId)
    if (!email) {
      setMessage("User ID: use 2 to 20 letters or digits.")
      return
    }
    if (password === "") {
      setMessage("Enter your password.")
      return
    }
    setBusy(true)
    setMessage("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.code === "invalid_credentials") {
        setMessage("User ID or password is wrong.")
      } else if (error.code === "email_not_confirmed") {
        setMessage("This account is not confirmed yet. Confirm it in the Supabase dashboard.")
      } else {
        setMessage("Could not sign in. Check the internet and try again.")
      }
      setBusy(false)
    }
  }
  // AB:LOGIN.SUBMIT:END

  return (
    <GlassSurface {...GLASS} className="ab-glass">
      <form className="ab-content" onSubmit={handleSubmit}>
        {/* AB:LOGIN.FORM:START */}
        <p className="ab-subtitle">Sign in to continue</p>
        <div className="ab-field">
          <label className="ab-label" htmlFor="ab-userid">
            User ID
          </label>
          <input
            className="ab-input"
            id="ab-userid"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <div className="ab-field">
          <label className="ab-label" htmlFor="ab-password">
            Password
          </label>
          <input
            className="ab-input"
            id="ab-password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </div>
        {message ? (
          <p className="ab-error" role="alert">
            {message}
          </p>
        ) : null}
        {/* AB:LOGIN.FORM:END */}
        {/* AB:LOGIN.BUTTON:START */}
        <button className="ab-button" type="submit" disabled={busy}>
          Sign in
        </button>
        {/* AB:LOGIN.BUTTON:END */}
      </form>
    </GlassSurface>
  )
}
