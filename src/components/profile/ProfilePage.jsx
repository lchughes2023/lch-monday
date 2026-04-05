import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../contexts/ProgressContext'
import { supabase } from '../../lib/supabase'
import ConfirmDialog from '../ui/ConfirmDialog'

// Derive a stable avatar colour from any string (user id)
function avatarColor(str) {
  const colors = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#db2777','#0891b2','#65a30d']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ProfilePage({ onBack }) {
  const { user, signOut } = useAuth()
  const { progress } = useProgress()

  const [displayName, setDisplayName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const emailFallback = user?.email?.split('@')[0] ?? 'User'
  const color = avatarColor(user?.id ?? 'default')

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single()

      const name = data?.display_name || emailFallback
      setDisplayName(name)
      setNameInput(name)
      setLoading(false)
    }
    if (user) loadProfile()
  }, [user, emailFallback])

  async function saveName() {
    if (!nameInput.trim() || nameInput.trim() === displayName) {
      setEditingName(false)
      setNameInput(displayName)
      return
    }
    setSaving(true)
    const name = nameInput.trim()
    await supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: name,
      updated_at: new Date().toISOString(),
    })
    setDisplayName(name)
    setEditingName(false)
    setSaving(false)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    // Delete all user data; palace cascade handles zones/rooms/scenarios
    await Promise.all([
      supabase.from('journal_entries').delete().eq('user_id', user.id),
      supabase.from('user_progress').delete().eq('user_id', user.id),
      supabase.from('profiles').delete().eq('user_id', user.id),
    ])
    await supabase.from('palaces').delete().eq('user_id', user.id)
    await signOut()
  }

  const xpInLevel = progress.xp % 100

  return (
    <div className="profile-page">
      <button className="btn profile-back-btn" onClick={onBack}>
        ← Back
      </button>

      {loading ? (
        <p style={{ color: 'var(--text-mid)', textAlign: 'center', marginTop: '2rem' }}>Loading…</p>
      ) : (
        <>
          {/* Avatar + identity */}
          <div className="profile-identity">
            <div className="profile-avatar" style={{ background: color }}>
              {initials(displayName)}
            </div>

            {editingName ? (
              <div className="profile-name-edit">
                <input
                  className="input profile-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
                  autoFocus
                  disabled={saving}
                />
              </div>
            ) : (
              <div className="profile-name-row" onClick={() => setEditingName(true)}>
                <span className="profile-display-name">{displayName}</span>
                <span className="edit-hint">✏️ edit</span>
              </div>
            )}

            <span className="profile-email">{user?.email}</span>
          </div>

          {/* Stats */}
          <div className="profile-section">
            <h3 className="section-label">Stats</h3>
            <div className="profile-stats-grid">
              <div className="profile-stat">
                <span className="profile-stat-value">Lvl {progress.level}</span>
                <span className="profile-stat-label">Level</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{progress.xp}</span>
                <span className="profile-stat-label">Total XP</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">🔥 {progress.streak}</span>
                <span className="profile-stat-label">Streak</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{progress.bestStreak}</span>
                <span className="profile-stat-label">Best Streak</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{progress.totalCorrect}</span>
                <span className="profile-stat-label">Correct</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">
                  {progress.totalAttempts > 0
                    ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100) + '%'
                    : '—'}
                </span>
                <span className="profile-stat-label">Accuracy</span>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="profile-xp-row">
              <span className="profile-xp-label">Level {progress.level} → {progress.level + 1}</span>
              <div className="xp-bar-wrap" style={{ flex: 1 }}>
                <div className="xp-bar">
                  <div className="xp-fill" style={{ width: `${xpInLevel}%` }} />
                </div>
              </div>
              <span className="profile-xp-label">{xpInLevel}/100 XP</span>
            </div>
          </div>

          {/* Achievements */}
          {progress.achievements.length > 0 && (
            <div className="profile-section">
              <h3 className="section-label">Achievements</h3>
              <div className="profile-achievements">
                {progress.achievements.map((a) => (
                  <span key={a} className="achievement-chip">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={signOut}>
              Sign Out
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete your account? This permanently removes all your palaces, journal entries, and progress. This cannot be undone."
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
