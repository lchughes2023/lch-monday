import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePalace } from '../../contexts/PalaceContext'
import AddRoomModal from './AddRoomModal'
import ConfirmDialog from '../ui/ConfirmDialog'

const ZONE_COLORS = ['#20c060', '#e07040', '#c060d0', '#4090ff', '#60d030', '#e0c030', '#ff6090', '#40d0d0']

export default function RoomEditor({ zone, onChanged }) {
  const { rooms, palace, refreshPalace } = usePalace()
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [deleteRoomId, setDeleteRoomId] = useState(null)
  const [editingZoneName, setEditingZoneName] = useState(false)
  const [zoneName, setZoneName] = useState(zone.name)

  const zoneRooms = rooms.filter((r) => r.zone_id === zone.id).sort((a, b) => a.sort_order - b.sort_order)

  async function saveZoneName() {
    if (zoneName.trim() === zone.name) { setEditingZoneName(false); return }
    await supabase.from('palace_zones').update({ name: zoneName.trim() }).eq('id', zone.id)
    setEditingZoneName(false)
    await refreshPalace()
    onChanged?.()
  }

  async function saveZoneColor(color) {
    await supabase.from('palace_zones').update({ color }).eq('id', zone.id)
    await refreshPalace()
    onChanged?.()
  }

  async function deleteZone() {
    await supabase.from('palace_zones').delete().eq('id', zone.id)
    await refreshPalace()
    onChanged?.()
  }

  async function updateRoom(roomId, fields) {
    await supabase.from('palace_rooms').update(fields).eq('id', roomId)
    await refreshPalace()
    onChanged?.()
  }

  async function addRoom({ name, emoji, theme, description }) {
    const maxOrder = zoneRooms.length ? Math.max(...zoneRooms.map((r) => r.sort_order)) + 1 : 0
    await supabase.from('palace_rooms').insert({
      palace_id: palace.id,
      zone_id: zone.id,
      name,
      emoji,
      theme: theme || null,
      description: description || null,
      sort_order: maxOrder,
    })
    setShowAddRoom(false)
    await refreshPalace()
    onChanged?.()
  }

  async function deleteRoom(roomId) {
    await supabase.from('palace_rooms').delete().eq('id', roomId)
    setDeleteRoomId(null)
    await refreshPalace()
    onChanged?.()
  }

  return (
    <div className="room-editor" style={{ borderColor: zone.color + '66' }}>
      {/* Zone header */}
      <div className="zone-editor-header">
        <div className="zone-color-strip" style={{ background: zone.color }} />
        {editingZoneName ? (
          <input
            className="input zone-name-input"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            onBlur={saveZoneName}
            onKeyDown={(e) => { if (e.key === 'Enter') saveZoneName() }}
            autoFocus
          />
        ) : (
          <span className="zone-label" style={{ color: zone.color }} onClick={() => setEditingZoneName(true)}>
            {zone.name}
          </span>
        )}
        <div className="zone-color-picker">
          {ZONE_COLORS.map((c) => (
            <button
              key={c}
              className="color-dot"
              style={{ background: c, outline: c === zone.color ? '2px solid white' : 'none' }}
              onClick={() => saveZoneColor(c)}
              title={c}
            />
          ))}
        </div>
        <button className="btn btn-sm btn-danger" onClick={deleteZone} title="Delete zone">
          Delete Zone
        </button>
      </div>

      {/* Rooms in this zone */}
      <div className="zone-rooms-list">
        {zoneRooms.map((room) => (
          <RoomRow key={room.id} room={room} onUpdate={updateRoom} onDelete={() => setDeleteRoomId(room.id)} />
        ))}
      </div>

      <button className="btn btn-sm" onClick={() => setShowAddRoom(true)}>
        + Add Room
      </button>

      {showAddRoom && (
        <AddRoomModal onAdd={addRoom} onCancel={() => setShowAddRoom(false)} />
      )}

      {deleteRoomId && (
        <ConfirmDialog
          message="Delete this room? Journal entries routed here will show as 'Deleted Room'."
          onConfirm={() => deleteRoom(deleteRoomId)}
          onCancel={() => setDeleteRoomId(null)}
        />
      )}
    </div>
  )
}

function RoomRow({ room, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(room.name)
  const [emoji, setEmoji] = useState(room.emoji)
  const [theme, setTheme] = useState(room.theme || '')
  const [description, setDescription] = useState(room.description || '')
  const [routeWhen, setRouteWhen] = useState(room.route_when || '')

  function save(fields) {
    onUpdate(room.id, fields)
  }

  return (
    <div className="room-row-edit">
      <div className="room-row-compact">
        <input
          className="input-small emoji-input"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          onBlur={() => save({ emoji })}
          maxLength={4}
        />
        <input
          className="input room-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => save({ name })}
        />
        <button className="btn btn-sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '▲' : '▼'}
        </button>
        <button className="btn btn-sm btn-danger" onClick={onDelete} title="Delete room">
          ✕
        </button>
      </div>

      {expanded && (
        <div className="room-row-expanded">
          <label>Cognitive Theme</label>
          <input
            className="input"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            onBlur={() => save({ theme: theme || null })}
            placeholder="e.g. Deep Focus Work"
          />
          <label>Description</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => save({ description: description || null })}
            placeholder="What kind of thoughts belong here?"
            rows={2}
          />
          <label>Route here when…</label>
          <textarea
            className="input"
            value={routeWhen}
            onChange={(e) => setRouteWhen(e.target.value)}
            onBlur={() => save({ route_when: routeWhen || null })}
            placeholder="Describe when to route thoughts to this room"
            rows={2}
          />
        </div>
      )}
    </div>
  )
}
