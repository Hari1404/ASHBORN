import PatternWaves from "@/components/PatternWaves"
import LoginCard from "@/components/LoginCard"
import LoginHero from "@/components/LoginHero"
import LoginBrand from "@/components/LoginBrand"
import "./login.css"

export default function App() {
  return (
    <main className="ab-screen">
      {/* AB:LOGIN.BG:START */}
      <div className="ab-bg">
        <PatternWaves
          color="#ffffff"
          backgroundColor="#000000"
          pattern="square"
          wave="silk"
          characters=".:-=+*#%@"
          spacing={8}
          markSize={0.9}
          depth={1.05}
          light={0}
          shine={0.5}
          contrast={1.25}
          speed={0.7}
          scale={1.15}
          direction={33}
          fade="none"
          fadeSize={0.35}
          opacity={1}
          interactive={false}
          cursorSize={50}
          cursorStrength={0.6}
          intro={true}
          paused={false}
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
