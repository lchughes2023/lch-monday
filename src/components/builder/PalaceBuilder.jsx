import { useState } from 'react'
import { usePalace } from '../../contexts/PalaceContext'
import { supabase } from '../../lib/supabase'
import TemplateGallery from './TemplateGallery'
import RoomEditor from './RoomEditor'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function PalaceBuilder({ onComplete }) {
  const {
    palace, zones, hasPalace, palaceLoading, refreshPalace,
    allPalaces, activatePalace, deletePalace,
  } = usePalace()

  const [showAddZone, setShowAddZone] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [switching, setSwitching] = useState(null)

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

  async function handleSwitch(palaceId) {
    setSwitching(palaceId)
    await activatePalace(palaceId)
    setSwitching(null)
  }

  async function handleDelete(palaceId) {
    await deletePalace(palaceId)
    setConfirmDeleteId(null)
  }

  return (
    <div className="palace-builder">
      {/* My Palaces section */}
      {allPalaces.length > 0 && (
        <div className="my-palaces-section">
          <div className="my-palaces-header">
            <h3 className="section-label">My Palaces</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? '✕ Cancel' : '+ New Palace'}
            </button>
          </div>

          {showCreate && (
            <div className="create-palace-inline">
              <TemplateGallery onCreated={() => setShowCreate(false)} />
            </div>
          )}

          <div className="palace-cards">
            {allPalaces.map((p) => {
              const isActive = p.id === palace?.id
              return (
                <div key={p.id} className={`palace-card ${isActive ? 'palace-card--active' : ''}`}>
                  <div className="palace-card-info">
                    <span className="palace-card-name">{p.name}</span>
                    {isActive && <span className="badge-active">Active</span>}
                  </div>
                  <div className="palace-card-actions">
                    {!isActive && (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleSwitch(p.id)}
                        disabled={switching === p.id}
                      >
                        {switching === p.id ? '…' : 'Switch'}
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setConfirmDeleteId(p.id)}
                      disabled={allPalaces.length <= 1}
                      title={allPalaces.length <= 1 ? "Can't delete your only palace" : 'Delete palace'}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

      {confirmDeleteId && (
        <ConfirmDialog
          message={
            confirmDeleteId === palace?.id
              ? 'Delete the active palace? All rooms, zones and scenarios will be lost. Another palace will be activated.'
              : 'Delete this palace? All rooms, zones and scenarios will be lost permanently.'
          }
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
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
