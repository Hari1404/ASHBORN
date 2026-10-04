import type { FormEvent } from "react"
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
        {/* AB:LOGIN.FORM:END */}
        {/* AB:LOGIN.BUTTON:START */}
        <button className="ab-button" type="submit">
          Sign in
        </button>
        {/* AB:LOGIN.BUTTON:END */}
      </form>
    </GlassSurface>
  )
}
