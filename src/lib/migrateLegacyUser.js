import { supabase } from './supabase'
import { seedPalaceFromTemplate } from './seedPalace'
import { getTemplate } from '../data/templates'

/**
 * Runs once for existing users who have journal entries with legacy slug-based room_ids
 * but no active palace yet.
 *
 * 1. Seeds the house template as their palace
 * 2. Builds a slug → UUID map from the seeded rooms
 * 3. Updates their journal entries to use the new UUIDs
 * 4. Sets active_palace_id on user_progress
 *
 * @param {string} userId
 * @returns {Promise<string>} The new palace ID
 */
export async function migrateLegacyUser(userId) {
  const houseTemplate = getTemplate('house')
  const palace = await seedPalaceFromTemplate(userId, houseTemplate)

  // Fetch the rooms we just created to build slug → UUID map
  const { data: rooms, error: roomError } = await supabase
    .from('palace_rooms')
    .select('id, legacy_slug')
    .eq('palace_id', palace.id)
    .not('legacy_slug', 'is', null)

  if (roomError) throw roomError

  const slugToUUID = {}
  rooms.forEach((r) => { slugToUUID[r.legacy_slug] = r.id })

  // Fetch existing journal entries for this user
  const { data: entries, error: entryError } = await supabase
    .from('journal_entries')
    .select('id, room_id')
    .eq('user_id', userId)

  if (entryError) throw entryError

  // Update entries whose room_id is a known legacy slug
  const updates = (entries || []).filter((e) => slugToUUID[e.room_id])
  for (const entry of updates) {
    await supabase
      .from('journal_entries')
      .update({ room_id: slugToUUID[entry.room_id] })
      .eq('id', entry.id)
  }

  // Set active_palace_id on user_progress
  await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      active_palace_id: palace.id,
      updated_at: new Date().toISOString(),
    })

  return palace.id
}
