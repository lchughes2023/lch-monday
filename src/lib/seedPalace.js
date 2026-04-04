import { supabase } from './supabase'

/**
 * Seeds a new palace from a template into the database.
 * Returns the newly created palace row.
 *
 * @param {string} userId
 * @param {import('../data/templates').TEMPLATES[0]} template
 * @returns {Promise<{id: string, name: string, template_id: string}>}
 */
export async function seedPalaceFromTemplate(userId, template) {
  // 1. Create the palace
  const { data: palace, error: palaceError } = await supabase
    .from('palaces')
    .insert({
      user_id: userId,
      name: template.name,
      template_id: template.id,
    })
    .select()
    .single()

  if (palaceError) throw palaceError

  // For blank template, just return the palace
  if (!template.zones || template.zones.length === 0) {
    return palace
  }

  // 2. Map: templateZoneId → DB zone UUID
  const zoneIdMap = {}
  // 3. Map: templateRoomId → DB room UUID
  const roomIdMap = {}

  // Insert all zones
  const zoneInserts = template.zones.map((z) => ({
    palace_id: palace.id,
    name: z.name,
    color: z.color,
    sort_order: z.sortOrder,
  }))

  const { data: zones, error: zoneError } = await supabase
    .from('palace_zones')
    .insert(zoneInserts)
    .select()

  if (zoneError) throw zoneError

  // Build zone map by matching sort_order
  template.zones.forEach((tz, i) => {
    zoneIdMap[tz.templateZoneId] = zones[i].id
  })

  // Insert all rooms across all zones
  const roomInserts = []
  for (const tz of template.zones) {
    const zoneId = zoneIdMap[tz.templateZoneId]
    for (const tr of tz.rooms) {
      roomInserts.push({
        palace_id: palace.id,
        zone_id: zoneId,
        name: tr.name,
        emoji: tr.emoji,
        theme: tr.theme,
        description: tr.description,
        route_when: tr.routeWhen,
        sort_order: tr.sortOrder,
        legacy_slug: tr.templateRoomId,
        bp_x: tr.bp?.x ?? null,
        bp_y: tr.bp?.y ?? null,
        bp_w: tr.bp?.w ?? null,
        bp_h: tr.bp?.h ?? null,
      })
    }
  }

  const { data: rooms, error: roomError } = await supabase
    .from('palace_rooms')
    .insert(roomInserts)
    .select()

  if (roomError) throw roomError

  // Build room map by matching legacy_slug
  rooms.forEach((r) => {
    if (r.legacy_slug) roomIdMap[r.legacy_slug] = r.id
  })

  // Insert scenarios if any
  if (template.scenarios && template.scenarios.length > 0) {
    const scenarioInserts = template.scenarios
      .filter((s) => roomIdMap[s.correctRoomTemplateId])
      .map((s, i) => ({
        palace_id: palace.id,
        prompt: s.prompt,
        correct_room_id: roomIdMap[s.correctRoomTemplateId],
        explanation: s.explanation,
        sort_order: i,
      }))

    if (scenarioInserts.length > 0) {
      const { error: scenarioError } = await supabase
        .from('palace_scenarios')
        .insert(scenarioInserts)

      if (scenarioError) throw scenarioError
    }
  }

  return palace
}
