import { useState } from 'react'
import { rooms, zones, roomOrder, getRoomZone, getRoomColor } from '../data/rooms'

const zoneEmoji = {
  intake:      '🌱',
  social:      '👥',
  refinement:  '🔄',
  archival:    '📦',
  governance:  '🎯',
  innovation:  '🚀',
}

export default function PalaceMap() {
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('zone')

  const selected = selectedId ? rooms[selectedId] : null

  function toggle(id) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="palace-map">
      <h2 className="section-title">🏠 Palace Map</h2>
      <p className="section-subtitle">
        16 rooms · 6 cognitive zones — click any room to explore
      </p>

      <div className="map-toolbar">
        <button
          className={`btn ${view === 'zone' ? 'btn-primary' : ''}`}
          onClick={() => setView('zone')}
        >
          Zone View
        </button>
        <button
          className={`btn ${view === 'list' ? 'btn-primary' : ''}`}
          onClick={() => setView('list')}
        >
          Room List
        </button>
      </div>

      {view === 'zone' && (
        <div className="zone-grid">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="zone-card"
              style={{
                borderColor: zone.color + '88',
                background: zone.color + '14',
              }}
            >
              <div className="zone-header">
                <span className="zone-emoji">{zoneEmoji[zone.id]}</span>
                <span className="zone-name" style={{ color: zone.color }}>
                  {zone.name}
                </span>
              </div>
              <div className="zone-rooms">
                {zone.rooms.map((id) => {
                  const room = rooms[id]
                  return (
                    <div
                      key={id}
                      className={`room-chip ${selectedId === id ? 'selected' : ''}`}
                      onClick={() => toggle(id)}
                    >
                      <span>{room.emoji}</span>
                      <span>{room.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'list' && (
        <div className="room-list">
          {roomOrder.map((id) => {
            const room = rooms[id]
            const zone = getRoomZone(id)
            const color = getRoomColor(id)
            return (
              <div
                key={id}
                className={`room-row ${selectedId === id ? 'selected' : ''}`}
                onClick={() => toggle(id)}
                style={selectedId === id ? { borderColor: color } : {}}
              >
                <span className="room-row-emoji">{room.emoji}</span>
                <div className="room-row-info">
                  <div className="room-row-name">{room.name}</div>
                  <div className="room-row-zone" style={{ color }}>
                    {zone?.name}
                  </div>
                </div>
                <span className="room-row-theme">{room.theme}</span>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="room-detail animate-in">
          <button className="detail-close" onClick={() => setSelectedId(null)}>
            ✕
          </button>
          <div className="detail-emoji">{selected.emoji}</div>
          <div className="detail-name">{selected.name}</div>
          <div
            className="detail-zone-tag"
            style={{ color: getRoomColor(selected.id) }}
          >
            {getRoomZone(selected.id)?.name}
          </div>
          <div className="detail-theme">"{selected.theme}"</div>
          <p className="detail-desc">{selected.description}</p>
          <div className="detail-rule">
            <strong>Route here when:</strong> {selected.routeWhen}
          </div>
        </div>
      )}

      <div className="route-summary">
        <h3>The Stable Route</h3>
        <div className="route-path">
          {roomOrder.map((id, i) => (
            <span key={id}>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedId(id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                {rooms[id].emoji} {rooms[id].name}
              </span>
              {i < roomOrder.length - 1 && (
                <span className="route-arrow"> → </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
