import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ProgressContext = createContext(null)

const INITIAL_PROGRESS = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  achievements: [],
}

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(INITIAL_PROGRESS)
  const [journalEntries, setJournalEntries] = useState([])
  const [synced, setSynced] = useState(false)
  const [xpPopup, setXpPopup] = useState(null)
  const saveTimerRef = useRef(null)

  // Load from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setProgress(INITIAL_PROGRESS)
      setJournalEntries([])
      setSynced(false)
      return
    }
    setSynced(false)

    async function load() {
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
        })
      } else {
        setProgress(INITIAL_PROGRESS)
      }

      setJournalEntries(
        (journalData || []).map((e) => ({
          id: e.id,
          text: e.text,
          roomId: e.room_id,
          ts: e.ts,
        }))
      )
      setSynced(true)
    }

    load()
  }, [user])

  // Debounced save to Supabase
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

  const unlockAchievement = useCallback((id) => {
    setProgress((prev) => {
      if (prev.achievements.includes(id)) return prev
      return { ...prev, achievements: [...prev.achievements, id] }
    })
  }, [])

  const addJournalEntry = useCallback(async (entry) => {
    setJournalEntries((prev) => [entry, ...prev])
    setProgress((prev) => {
      const achievements = [...prev.achievements]
      if (!achievements.includes('first-log')) achievements.push('first-log')
      const newCount = journalEntries.length + 1
      if (newCount >= 10 && !achievements.includes('journal-keeper')) {
        achievements.push('journal-keeper')
      }
      return { ...prev, achievements }
    })
    await supabase.from('journal_entries').insert({
      id: String(entry.id),
      user_id: user.id,
      text: entry.text,
      room_id: entry.roomId,
      ts: entry.ts,
    })
  }, [user, journalEntries.length])

  const deleteJournalEntry = useCallback(async (id) => {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id))
    await supabase.from('journal_entries').delete().eq('id', String(id)).eq('user_id', user.id)
  }, [user])

  const resetProgress = useCallback(async () => {
    setProgress(INITIAL_PROGRESS)
    setJournalEntries([])
    await Promise.all([
      supabase.from('user_progress').upsert({
        user_id: user.id,
        xp: 0,
        level: 1,
        streak: 0,
        best_streak: 0,
        total_correct: 0,
        total_attempts: 0,
        achievements: [],
        updated_at: new Date().toISOString(),
      }),
      supabase.from('journal_entries').delete().eq('user_id', user.id),
    ])
  }, [user])

  return (
    <ProgressContext.Provider value={{
      progress,
      setProgress,
      journalEntries,
      xpPopup,
      addXP,
      unlockAchievement,
      addJournalEntry,
      deleteJournalEntry,
      resetProgress,
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  return useContext(ProgressContext)
}
