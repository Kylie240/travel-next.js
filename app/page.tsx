import LandingPage from "./landing/page"
import { WelcomeDialog } from "./welcome-dialog"

export default function Home() {
  return (
    <>
      <WelcomeDialog />
      <LandingPage />
    </>
  )
}
