import FuzzyText from "@/components/FuzzyText"
import "../login.css"

// AB:LOGIN.BRAND:START
// The ASHBORN name in the top left corner. All Fuzzy Text settings are here, in one place.
// fuzzRange is linked to margin-left in src/login.css (see CONNECTIONS.md).
export default function LoginBrand() {
  return (
    <div className="ab-brand" role="img" aria-label="ASHBORN">
      <FuzzyText
        fontSize={30}
        fontWeight={800}
        fontFamily='"Syne Variable", sans-serif'
        color="#fff"
        enableHover={true}
        baseIntensity={0.2}
        hoverIntensity={0.5}
        fuzzRange={30}
        fps={60}
        direction="horizontal"
        transitionDuration={0}
        clickEffect={true}
        glitchMode={true}
        glitchInterval={2000}
        glitchDuration={200}
        letterSpacing={-1}
      >
        ASHBORN
      </FuzzyText>
    </div>
  )
}
// AB:LOGIN.BRAND:END
