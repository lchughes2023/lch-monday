import { useState } from 'react'
import { useProgress } from '../../contexts/ProgressContext'

const LEVEL_TITLES = [
  'Novice Archivist',
  'Idea Sorter',
  'Route Master',
  'Cognitive Architect',
  'Palace Scholar',
  'Palace Master',
]

function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}

const ACHIEVEMENTS = [
  { id: 'first-correct', emoji: '🎯', name: 'First Step', desc: 'Get your first answer correct' },
  { id: 'first-log', emoji: '✏️', name: 'Thought Logged', desc: 'Add your first idea to the journal' },
  { id: 'route-finder', emoji: '🗺', name: 'Route Finder', desc: 'Get 5 correct answers total' },
  { id: 'streak-hunter', emoji: '🔥', name: 'Streak Hunter', desc: 'Reach a 5-answer streak' },
  { id: 'archivist', emoji: '📦', name: 'Archivist', desc: 'Get 10 correct answers in total' },
  { id: 'journal-keeper', emoji: '📓', name: 'Journal Keeper', desc: 'Log 10 ideas to the journal' },
  { id: 'palace-scholar', emoji: '🎓', name: 'Palace Scholar', desc: 'Reach Level 3' },
  { id: 'architect', emoji: '🏛', name: 'Cognitive Architect', desc: 'Reach Level 5' },
  { id: 'perfect-round', emoji: '🏆', name: 'Perfect Round', desc: 'Complete a Route-It round with 100% accuracy' },
]

export default function ProgressPanel() {
  const { progress, journalEntries, resetProgress } = useProgress()
  const [confirmReset, setConfirmReset] = useState(false)

  const xpInLevel = progress.xp % 100
  const accuracy = progress.totalAttempts > 0
    ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
    : 0

  const unlockedIds = new Set([
    ...progress.achievements,
    ...(progress.level >= 3 ? ['palace-scholar'] : []),
    ...(progress.level >= 5 ? ['architect'] : []),
  ])

  async function handleReset() {
    await resetProgress()
    setConfirmReset(false)
  }

  return (
    <div className="progress-panel">
      <h2 className="section-title">📊 Progress</h2>
      <p className="section-subtitle">Your cognitive architecture journey</p>

      <div className="level-hero">
        <div className="hero-level">{progress.level}</div>
        <div className="hero-title">{getLevelTitle(progress.level)}</div>
        <div className="hero-xp-bar">
          <div className="hero-xp-fill" style={{ width: `${xpInLevel}%` }} />
        </div>
        <div className="hero-xp-text">
          {xpInLevel} / 100 XP to next level · {progress.xp} total XP
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{progress.xp}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.totalCorrect}</div>
          <div className="stat-label">Correct Answers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.bestStreak}</div>
          <div className="stat-label">Best Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{journalEntries.length}</div>
          <div className="stat-label">Ideas Logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.totalAttempts}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
      </div>

      <div className="achievements-title">🏅 Achievements</div>
      <div className="achievements-grid">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedIds.has(a.id)
          return (
            <div key={a.id} className={`achievement ${unlocked ? 'unlocked' : 'locked'}`}>
              <span className="achievement-icon">{a.emoji}</span>
              <div>
                <div className="achievement-name">{a.name}</div>
                <div className="achievement-desc">{a.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="reset-section">
        {!confirmReset ? (
          <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>
            Reset Progress
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '.88rem', color: 'var(--text-mid)' }}>Are you sure?</span>
            <button className="btn btn-danger" onClick={handleReset}>Yes, reset</button>
            <button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        )}
        <div className="reset-note">This will clear all XP, progress, and journal entries.</div>
      </div>
    </div>
  )
}
