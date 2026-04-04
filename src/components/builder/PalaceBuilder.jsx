import { useState } from 'react'
import { usePalace } from '../../contexts/PalaceContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import TemplateGallery from './TemplateGallery'
import RoomEditor from './RoomEditor'

export default function PalaceBuilder({ onComplete }) {
  const { user } = useAuth()
  const { palace, zones, hasPalace, palaceLoading, refreshPalace } = usePalace()
  const [showAddZone, setShowAddZone] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')

  if (palaceLoading) {
    return <div className="palace-builder"><p style={{ color: 'var(--text-mid)' }}>Loading…</p></div>
  }

  if (!hasPalace) {
    return <TemplateGallery onCreated={onComplete} />
  }

  async function addZone() {
    if (!newZoneName.trim()) return
    const maxOrder = zones.length ? Math.max(...zones.map((z) => z.sort_order)) + 1 : 0
    await supabase.from('palace_zones').insert({
      palace_id: palace.id,
      name: newZoneName.trim(),
      color: '#64b4ff',
      sort_order: maxOrder,
    })
    setNewZoneName('')
    setShowAddZone(false)
    await refreshPalace()
  }

  return (
    <div className="palace-builder">
      <div className="builder-header">
        <div>
          <h2 className="section-title">🏗 Palace Builder</h2>
          <p className="section-subtitle">
            Customize your palace — rename rooms, adjust zones, add new spaces.
          </p>
        </div>
        {onComplete && (
          <button className="btn btn-primary" onClick={onComplete}>
            Done →
          </button>
        )}
      </div>

      <div className="palace-name-row">
        <PalaceNameEditor palace={palace} onSaved={refreshPalace} />
      </div>

      <div className="zones-list">
        {zones.map((zone) => (
          <RoomEditor key={zone.id} zone={zone} />
        ))}
      </div>

      {showAddZone ? (
        <div className="add-zone-form">
          <input
            className="input"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder="Zone name (e.g. Creative Space)"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') addZone() }}
          />
          <button className="btn btn-primary" onClick={addZone} disabled={!newZoneName.trim()}>
            Create Zone
          </button>
          <button className="btn" onClick={() => { setShowAddZone(false); setNewZoneName('') }}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="btn" onClick={() => setShowAddZone(true)}>
          + Add Zone
        </button>
      )}
    </div>
  )
}

function PalaceNameEditor({ palace, onSaved }) {
  const [name, setName] = useState(palace?.name || '')
  const [editing, setEditing] = useState(false)

  async function save() {
    if (name.trim() === palace.name) { setEditing(false); return }
    await supabase.from('palaces').update({ name: name.trim() }).eq('id', palace.id)
    setEditing(false)
    onSaved?.()
  }

  if (!editing) {
    return (
      <div className="palace-name" onClick={() => setEditing(true)}>
        <span className="palace-name-text">{palace?.name}</span>
        <span className="edit-hint">✏️ rename</span>
      </div>
    )
  }

  return (
    <input
      className="input palace-name-input"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => { if (e.key === 'Enter') save() }}
      autoFocus
    />
  )
}
