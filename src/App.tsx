import DarkVeil from "@/components/DarkVeil"
import LoginCard from "@/components/LoginCard"
import LoginHero from "@/components/LoginHero"
import LoginBrand from "@/components/LoginBrand"
import "./login.css"
import SignedInStub from "@/components/SignedInStub"
import { useSession } from "@/lib/useSession"
import { LITE_LEVEL } from "@/lib/lite"

// AB:AUTH.GATE:START
// Chooses the screen: blank while the saved sign-in is read, the front page when nobody is signed in, the temporary signed-in screen otherwise.
export default function App() {
  const session = useSession()
  if (session === "loading") return <main className="ab-screen" />
  if (session) return <SignedInStub email={session.user.email ?? ""} />
  return <LoginScreen />
}
// AB:AUTH.GATE:END

function LoginScreen() {
  return (
    <main className="ab-screen">
      {/* AB:LOGIN.BG:START */}
      {/* Lite mode (src/lib/lite.ts): the box is half size and the css scales it back up. Dark Veil draws itself to fill its box, so resolutionScale stays 1 in every level. Level 2: speed 0, a still picture. See CONNECTIONS.md C21. */}
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
      {/* AB:LOGIN.BG:END */}
      {/* AB:LOGIN.BRAND:START */}
      <LoginBrand />
      {/* AB:LOGIN.BRAND:END */}
      {/* AB:LOGIN.LAYOUT:START */}
      <div className="ab-center">
        <LoginHero />
        <LoginCard />
      </div>
      {/* AB:LOGIN.LAYOUT:END */}
    </main>
  )
}
