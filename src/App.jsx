import { useState, useEffect, useCallback } from 'react'
import PalaceMap from './components/PalaceMap'
import RouteGame from './components/RouteGame'
import QuizMode from './components/QuizMode'
import IdeaJournal from './components/IdeaJournal'
import ProgressPanel from './components/ProgressPanel'
import './App.css'

const INITIAL_PROGRESS = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  achievements: [],
  journalEntries: [],
}

function XpPopup({ amount, id }) {
  return (
    <div key={id} className="xp-popup">
      +{amount} XP
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('map')
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('memoryPalaceProgress')
      return saved ? { ...INITIAL_PROGRESS, ...JSON.parse(saved) } : INITIAL_PROGRESS
    } catch {
      return INITIAL_PROGRESS
    }
  })
  const [xpPopup, setXpPopup] = useState(null)

  useEffect(() => {
    localStorage.setItem('memoryPalaceProgress', JSON.stringify(progress))
  }, [progress])

  const addXP = useCallback((amount) => {
    setProgress((prev) => {
      const newXP = prev.xp + amount
      const newLevel = Math.floor(newXP / 100) + 1
      return { ...prev, xp: newXP, level: newLevel }
    })
    const popupId = Date.now()
    setXpPopup({ amount, id: popupId })
    setTimeout(() => setXpPopup(null), 2000)
  }, [])

  const xpInLevel = progress.xp % 100
  const tabs = [
    { id: 'map', label: '🗺 Palace Map' },
    { id: 'route', label: '🎮 Route-It' },
    { id: 'quiz', label: '🧠 Quiz' },
    { id: 'journal', label: '📓 Idea Log' },
    { id: 'progress', label: '📊 Progress' },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="blueprint-icon">🏠</span>
          <div>
            <h1>Memory Palace OS</h1>
            <span className="subtitle">Cognitive Architecture Trainer</span>
          </div>
        </div>
        <div className="header-stats">
          <div className="xp-display">
            <span className="level-badge">Lvl {progress.level}</span>
            <div className="xp-bar-wrap">
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpInLevel}%` }} />
              </div>
              <span className="xp-label">{xpInLevel}/100</span>
            </div>
            <span className="xp-total">{progress.xp} XP</span>
          </div>
          <div className="streak-badge">🔥 {progress.streak}</div>
        </div>
      </header>

      <nav className="app-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${screen === tab.id ? 'active' : ''}`}
            onClick={() => setScreen(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {screen === 'map' && <PalaceMap />}
        {screen === 'route' && (
          <RouteGame progress={progress} setProgress={setProgress} addXP={addXP} />
        )}
        {screen === 'quiz' && (
          <QuizMode progress={progress} setProgress={setProgress} addXP={addXP} />
        )}
        {screen === 'journal' && (
          <IdeaJournal progress={progress} setProgress={setProgress} />
        )}
        {screen === 'progress' && <ProgressPanel progress={progress} setProgress={setProgress} />}
      </main>

      {xpPopup && <XpPopup amount={xpPopup.amount} id={xpPopup.id} />}
    </div>
  )
}
