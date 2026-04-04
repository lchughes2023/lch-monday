import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../contexts/ProgressContext'

export default function Header() {
  const { signOut } = useAuth()
  const { progress } = useProgress()

  const xpInLevel = progress.xp % 100

  return (
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
        <button className="btn sign-out-btn" onClick={signOut} title="Sign out">
          Sign out
        </button>
      </div>
    </header>
  )
}
