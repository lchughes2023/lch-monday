import { useState } from 'react'
import { usePalace } from '../../contexts/PalaceContext'
import { useProgress } from '../../contexts/ProgressContext'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function IdeaJournal() {
  const { rooms, zones, roomsById } = usePalace()
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useProgress()

  const [text, setText] = useState('')
  const [roomId, setRoomId] = useState('')
  const [filter, setFilter] = useState('all')

  // Default to first room if not set
  const selectedRoomId = roomId || (rooms[0]?.id ?? '')

  function handleAdd() {
    if (!text.trim() || !selectedRoomId) return
    const entry = {
      id: String(Date.now()),
      text: text.trim(),
      roomId: selectedRoomId,
      ts: Date.now(),
    }
    addJournalEntry(entry)
    setText('')
  }

  const filtered = filter === 'all'
    ? journalEntries
    : journalEntries.filter((e) => {
        const room = roomsById[e.roomId]
        if (!room) return false
        const zone = zones.find((z) => z.id === room.zone_id)
        return zone?.id === filter
      })

  return (
    <div className="idea-journal">
      <h2 className="section-title">📓 Idea Log</h2>
      <p className="section-subtitle">
        Log a thought and route it to its room — {journalEntries.length} idea{journalEntries.length !== 1 ? 's' : ''} stored
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
            value={selectedRoomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.emoji} {room.name}
              </option>
            ))}
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
            {journalEntries.length === 0
              ? 'Your palace is empty. Start routing your thoughts.'
              : 'No ideas in this zone yet.'}
          </div>
        </div>
      ) : (
        <div className="journal-list">
          {filtered.map((entry) => {
            const room = roomsById[entry.roomId]
            return (
              <div key={entry.id} className="journal-entry">
                <span className="entry-icon">{room?.emoji ?? '💭'}</span>
                <div className="entry-body">
                  <div className="entry-text">{entry.text}</div>
                  <div className="entry-meta">
                    <span className="entry-room">{room?.name ?? 'Deleted Room'}</span>
                    <span className="entry-time">{timeAgo(entry.ts)}</span>
                  </div>
                </div>
                <button className="entry-delete" onClick={() => deleteJournalEntry(entry.id)} title="Delete">
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
