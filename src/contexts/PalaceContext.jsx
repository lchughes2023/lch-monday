import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { migrateLegacyUser } from '../lib/migrateLegacyUser'

const PalaceContext = createContext(null)

export function PalaceProvider({ children }) {
  const { user } = useAuth()
  const [palace, setPalace] = useState(null)
  const [zones, setZones] = useState([])
  const [rooms, setRooms] = useState([])
  const [scenarios, setScenarios] = useState([])
  const [palaceLoading, setPalaceLoading] = useState(true)
  const [hasPalace, setHasPalace] = useState(false)

  const loadPalace = useCallback(async (userId) => {
    setPalaceLoading(true)

    // Check user_progress for active_palace_id
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('active_palace_id')
      .eq('user_id', userId)
      .single()

    let palaceId = progressData?.active_palace_id

    // If no palace, check if legacy migration needed (has journal entries)
    if (!palaceId) {
      const { data: journalCheck } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (journalCheck && journalCheck.length > 0) {
        // Legacy user: run migration
        try {
          palaceId = await migrateLegacyUser(userId)
        } catch (err) {
          console.error('Migration failed:', err)
        }
      }
    }

    if (!palaceId) {
      // Brand new user with no palace yet
      setHasPalace(false)
      setPalaceLoading(false)
      return
    }

    // Load palace data
    const [
      { data: palaceData },
      { data: zonesData },
      { data: roomsData },
      { data: scenariosData },
    ] = await Promise.all([
      supabase.from('palaces').select('*').eq('id', palaceId).single(),
      supabase.from('palace_zones').select('*').eq('palace_id', palaceId).order('sort_order'),
      supabase.from('palace_rooms').select('*').eq('palace_id', palaceId).order('sort_order'),
      supabase
        .from('palace_scenarios')
        .select('*, correct_room:palace_rooms!correct_room_id(*)')
        .eq('palace_id', palaceId)
        .order('sort_order'),
    ])

    setPalace(palaceData)
    setZones(zonesData || [])
    setRooms(roomsData || [])
    setScenarios(
      (scenariosData || []).map((s) => ({
        id: s.id,
        prompt: s.prompt,
        correctRoom: s.correct_room,
        explanation: s.explanation,
      }))
    )
    setHasPalace(true)
    setPalaceLoading(false)
  }, [])

  useEffect(() => {
    if (!user) {
      setPalace(null)
      setZones([])
      setRooms([])
      setScenarios([])
      setHasPalace(false)
      setPalaceLoading(false)
      return
    }
    loadPalace(user.id)
  }, [user, loadPalace])

  const refreshPalace = useCallback(() => {
    if (user) return loadPalace(user.id)
  }, [user, loadPalace])

  const activatePalace = useCallback(async (palaceId) => {
    await supabase
      .from('user_progress')
      .upsert({ user_id: user.id, active_palace_id: palaceId, updated_at: new Date().toISOString() })
    await loadPalace(user.id)
  }, [user, loadPalace])

  // Derived: O(1) room lookup map
  const roomsById = {}
  rooms.forEach((r) => { roomsById[r.id] = r })

  return (
    <PalaceContext.Provider value={{
      palace,
      zones,
      rooms,
      scenarios,
      roomsById,
      palaceLoading,
      hasPalace,
      refreshPalace,
      activatePalace,
    }}>
      {children}
    </PalaceContext.Provider>
  )
}

export function usePalace() {
  return useContext(PalaceContext)
}
