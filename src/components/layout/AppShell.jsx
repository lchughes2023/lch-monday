import { useState } from 'react'
import Header from './Header'
import NavTabs from './NavTabs'
import XpPopup from '../ui/XpPopup'
import PalaceMap from '../map/PalaceMap'
import RouteGame from '../games/RouteGame'
import QuizMode from '../games/QuizMode'
import IdeaJournal from '../journal/IdeaJournal'
import ProgressPanel from '../progress/ProgressPanel'
import PalaceBuilder from '../builder/PalaceBuilder'
import MemoryPalaceOnboarding from '../onboarding/MemoryPalaceOnboarding'
import { useProgress } from '../../contexts/ProgressContext'
import { usePalace } from '../../contexts/PalaceContext'

export default function AppShell() {
  const [screen, setScreen] = useState('map')
  const [onboardingDone, setOnboardingDone] = useState(false)
  const { xpPopup } = useProgress()
  const { hasPalace, palaceLoading } = usePalace()

  if (palaceLoading) {
    return (
      <>
        <Header />
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-mid)' }}>Loading…</p>
        </main>
      </>
    )
  }

  // New user: show onboarding slides first, then template gallery
  if (!hasPalace) {
    if (!onboardingDone) {
      return (
        <>
          <Header />
          <main className="app-main">
            <MemoryPalaceOnboarding onDone={() => setOnboardingDone(true)} />
          </main>
        </>
      )
    }
    return (
      <>
        <Header />
        <NavTabs screen="builder" setScreen={setScreen} />
        <main className="app-main">
          <PalaceBuilder onComplete={() => setScreen('map')} />
        </main>
        {xpPopup && <XpPopup amount={xpPopup.amount} id={xpPopup.id} />}
      </>
    )
  }

  return (
    <>
      <Header />
      <NavTabs screen={screen} setScreen={setScreen} />
      <main className="app-main">
        {screen === 'map'      && <PalaceMap />}
        {screen === 'route'    && <RouteGame />}
        {screen === 'quiz'     && <QuizMode />}
        {screen === 'journal'  && <IdeaJournal />}
        {screen === 'progress' && <ProgressPanel />}
        {screen === 'builder'  && <PalaceBuilder onComplete={() => setScreen('map')} />}
      </main>
      {xpPopup && <XpPopup amount={xpPopup.amount} id={xpPopup.id} />}
    </>
  )
}
