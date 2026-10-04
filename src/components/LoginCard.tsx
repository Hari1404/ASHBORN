import type { FormEvent } from "react"
import "../login.css"

export default function LoginCard() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className="ab-card">
      <div className="ab-blob" />
      <div className="ab-glass" />
      <form className="ab-content" onSubmit={handleSubmit}>
        <h1 className="ab-title">ASHBORN</h1>
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
        <button className="ab-button" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}
