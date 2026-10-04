import { useState } from "react"
import BlurText from "@/components/BlurText"
import { LOGIN_LINES } from "@/loginLines"
import "../login.css"

// AB:LOGIN.HERO:START
export default function LoginHero() {
  const [line] = useState(
    () => LOGIN_LINES[Math.floor(Math.random() * LOGIN_LINES.length)]
  )

  return (
    <div className="ab-hero">
      <BlurText
        text={line}
        delay={150}
        animateBy="words"
        direction="top"
        className="ab-hero-text"
      />
    </div>
  )
}
// AB:LOGIN.HERO:END
