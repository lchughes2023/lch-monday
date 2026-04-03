import { useState, useEffect, useCallback, useRef } from 'react'
import PalaceMap from './components/PalaceMap'
import RouteGame from './components/RouteGame'
import QuizMode from './components/QuizMode'
import IdeaJournal from './components/IdeaJournal'
import ProgressPanel from './components/ProgressPanel'
import { supabase, getUserId } from './lib/supabase'
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
  const [synced, setSynced] = useState(false)
  const saveTimerRef = useRef(null)

  // Load from Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      const userId = getUserId()
      const [{ data: progressData }, { data: journalData }] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', userId).single(),
        supabase.from('journal_entries').select('*').eq('user_id', userId).order('ts', { ascending: false }),
      ])

      if (progressData) {
        setProgress(() => ({
          xp: progressData.xp,
          level: progressData.level,
          streak: progressData.streak,
          bestStreak: progressData.best_streak,
          totalCorrect: progressData.total_correct,
          totalAttempts: progressData.total_attempts,
          achievements: progressData.achievements || [],
          journalEntries: (journalData || []).map((e) => ({
            id: Number(e.id),
            text: e.text,
            roomId: e.room_id,
            ts: e.ts,
          })),
        }))
      }
      setSynced(true)
    }
    loadFromSupabase()
  }, [])

  // Save progress to localStorage + Supabase (debounced)
  useEffect(() => {
    localStorage.setItem('memoryPalaceProgress', JSON.stringify(progress))

    if (!synced) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      const userId = getUserId()
      await supabase.from('user_progress').upsert({
        user_id: userId,
        xp: progress.xp,
        level: progress.level,
        streak: progress.streak,
        best_streak: progress.bestStreak,
        total_correct: progress.totalCorrect,
        total_attempts: progress.totalAttempts,
        achievements: progress.achievements,
        updated_at: new Date().toISOString(),
      })
    }, 1000)
  }, [progress, synced])

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

  const addJournalEntry = useCallback(async (entry) => {
    setProgress((prev) => {
      const journalEntries = [entry, ...prev.journalEntries]
      const achievements = [...prev.achievements]
      if (!achievements.includes('first-log')) achievements.push('first-log')
      if (journalEntries.length >= 10 && !achievements.includes('journal-keeper')) {
        achievements.push('journal-keeper')
      }
      return { ...prev, journalEntries, achievements }
    })
    const userId = getUserId()
    await supabase.from('journal_entries').insert({
      id: String(entry.id),
      user_id: userId,
      text: entry.text,
      room_id: entry.roomId,
      ts: entry.ts,
    })
  }, [])

  const deleteJournalEntry = useCallback(async (id) => {
    setProgress((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((e) => e.id !== id),
    }))
    const userId = getUserId()
    await supabase.from('journal_entries').delete().eq('id', String(id)).eq('user_id', userId)
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
          <IdeaJournal
            progress={progress}
            onAdd={addJournalEntry}
            onDelete={deleteJournalEntry}
          />
        )}
        {screen === 'progress' && <ProgressPanel progress={progress} setProgress={setProgress} />}
      </main>

      {xpPopup && <XpPopup amount={xpPopup.amount} id={xpPopup.id} />}
    </div>
  )
}
