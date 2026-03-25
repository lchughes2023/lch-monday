import { useState } from 'react'
import { rooms, roomOrder, zones } from '../data/rooms'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function IdeaJournal({ progress, setProgress }) {
  const [text, setText] = useState('')
  const [roomId, setRoomId] = useState('front-garden')
  const [filter, setFilter] = useState('all')

  function handleAdd() {
    if (!text.trim()) return
    const entry = {
      id: Date.now(),
      text: text.trim(),
      roomId,
      ts: Date.now(),
    }
    setProgress((prev) => {
      const journalEntries = [entry, ...prev.journalEntries]
      const achievements = [...prev.achievements]
      if (!achievements.includes('first-log')) achievements.push('first-log')
      if (journalEntries.length >= 10 && !achievements.includes('journal-keeper')) {
        achievements.push('journal-keeper')
      }
      return { ...prev, journalEntries, achievements }
    })
    setText('')
  }

  function handleDelete(id) {
    setProgress((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((e) => e.id !== id),
    }))
  }

  const entries = progress.journalEntries || []

  const filtered = filter === 'all'
    ? entries
    : entries.filter((e) => {
        const zone = zones.find((z) => z.rooms.includes(e.roomId))
        return zone?.id === filter
      })

  return (
    <div className="idea-journal">
      <h2 className="section-title">📓 Idea Log</h2>
      <p className="section-subtitle">
        Log a thought and route it to its room — {entries.length} idea{entries.length !== 1 ? 's' : ''} stored
      </p>

      <div className="journal-form">
        <textarea
          className="journal-input"
          placeholder="What's on your mind? Describe the idea, thought, or situation..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd()
          }}
        />
        <div className="journal-row">
          <select
            className="room-select"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            {roomOrder.map((id) => {
              const room = rooms[id]
              return (
                <option key={id} value={id}>
                  {room.emoji} {room.name}
                </option>
              )
            })}
          </select>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!text.trim()}>
            Route It →
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {zones.map((zone) => (
          <button
            key={zone.id}
            className={`filter-btn ${filter === zone.id ? 'active' : ''}`}
            onClick={() => setFilter(zone.id)}
            style={filter === zone.id ? { background: zone.color + '44', borderColor: zone.color } : {}}
          >
            {zone.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <div>
            {entries.length === 0
              ? 'Your palace is empty. Start routing your thoughts.'
              : 'No ideas in this zone yet.'}
          </div>
        </div>
      ) : (
        <div className="journal-list">
          {filtered.map((entry) => {
            const room = rooms[entry.roomId]
            return (
              <div key={entry.id} className="journal-entry">
                <span className="entry-icon">{room?.emoji ?? '💭'}</span>
                <div className="entry-body">
                  <div className="entry-text">{entry.text}</div>
                  <div className="entry-meta">
                    <span className="entry-room">{room?.name}</span>
                    <span className="entry-time">{timeAgo(entry.ts)}</span>
                  </div>
                </div>
                <button className="entry-delete" onClick={() => handleDelete(entry.id)} title="Delete">
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
