import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../contexts/ProgressContext'

function avatarColor(str) {
  const colors = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#db2777','#0891b2','#65a30d']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function initials(email) {
  if (!email) return '?'
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function Header({ onOpenProfile }) {
  const { user } = useAuth()
  const { progress } = useProgress()

  const xpInLevel = progress.xp % 100
  const color = avatarColor(user?.id ?? 'default')

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

        <button
          className="header-avatar-btn"
          style={{ background: color }}
          onClick={onOpenProfile}
          title="Profile"
        >
          {initials(user?.email)}
        </button>
      </div>
    </header>
  )
}
