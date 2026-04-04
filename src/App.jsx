import { useState, useEffect, useCallback, useRef } from 'react'
import PalaceMap from './components/PalaceMap'
import RouteGame from './components/RouteGame'
import QuizMode from './components/QuizMode'
import IdeaJournal from './components/IdeaJournal'
import ProgressPanel from './components/ProgressPanel'
import LoginScreen from './components/LoginScreen'
import { supabase } from './lib/supabase'
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
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [screen, setScreen] = useState('map')
  const [progress, setProgress] = useState(INITIAL_PROGRESS)
  const [xpPopup, setXpPopup] = useState(null)
  const [synced, setSynced] = useState(false)
  const saveTimerRef = useRef(null)

  // Auth state — detect session on load and listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load progress from Supabase when user is known
  useEffect(() => {
    if (!user) return
    setSynced(false)

    async function loadFromSupabase() {
      const [{ data: progressData }, { data: journalData }] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('ts', { ascending: false }),
      ])

      if (progressData) {
        setProgress({
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
        })
      } else {
        setProgress(INITIAL_PROGRESS)
      }
      setSynced(true)
    }

    loadFromSupabase()
  }, [user])

  // Save progress to Supabase (debounced)
  useEffect(() => {
    if (!user || !synced) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
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
  }, [progress, user, synced])

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
    await supabase.from('journal_entries').insert({
      id: String(entry.id),
      user_id: user.id,
      text: entry.text,
      room_id: entry.roomId,
      ts: entry.ts,
    })
  }, [user])

  const deleteJournalEntry = useCallback(async (id) => {
    setProgress((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((e) => e.id !== id),
    }))
    await supabase.from('journal_entries').delete().eq('id', String(id)).eq('user_id', user.id)
  }, [user])

  // Show nothing while checking auth
  if (authLoading) return null

  // Show login if not signed in
  if (!user) return <LoginScreen />

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
          <button
            className="btn sign-out-btn"
            onClick={() => supabase.auth.signOut()}
            title="Sign out"
          >
            Sign out
          </button>
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
