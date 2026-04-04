import { useState } from 'react'

export default function AddRoomModal({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🏠')
  const [theme, setTheme] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), emoji, theme: theme.trim(), description: description.trim() })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Add Room</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row">
            <label>Emoji</label>
            <input
              className="input-small"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
            />
          </div>
          <div className="modal-row">
            <label>Room Name *</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study Room"
              autoFocus
              required
            />
          </div>
          <div className="modal-row">
            <label>Cognitive Theme</label>
            <input
              className="input"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Deep Focus Work"
            />
          </div>
          <div className="modal-row">
            <label>Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of thoughts belong here?"
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Add Room
            </button>
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
