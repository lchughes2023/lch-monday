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

// SVG coordinate layout for the house blueprint
const BLUEPRINT = [
  // ── Outdoor front ──────────────────────────────────────────
  { id: 'front-garden', x: 10,  y: 10,  w: 760, h: 78 },
  { id: 'porch',        x: 305, y: 93,  w: 170, h: 58 },

  // ── Ground Floor ───────────────────────────────────────────
  { id: 'living-room',          x: 10,  y: 178, w: 220, h: 292 },
  { id: 'hallway',              x: 230, y: 178, w: 140, h: 292 },
  { id: 'kindergarten',         x: 370, y: 178, w: 140, h: 146 },
  { id: 'quiet-room',           x: 510, y: 178, w: 260, h: 146 },
  { id: 'kitchen',              x: 370, y: 324, w: 140, h: 146 },
  { id: 'laundry',              x: 510, y: 324, w: 130, h: 146 },
  { id: 'downstairs-bathroom',  x: 640, y: 324, w: 130, h: 146 },

  // ── Upper Floor ────────────────────────────────────────────
  { id: 'my-room',             x: 10,  y: 498, w: 230, h: 155 },
  { id: 'stairs',              x: 240, y: 498, w: 140, h: 155 },
  { id: 'parents-room',        x: 380, y: 498, w: 200, h: 155 },
  { id: 'upstairs-bathroom',   x: 580, y: 498, w: 190, h: 155 },

  // ── Outdoor back / Innovation ──────────────────────────────
  { id: 'treehouse',  x: 10,  y: 678, w: 250, h: 112 },
  { id: 'sandbox',    x: 260, y: 678, w: 250, h: 112 },
  { id: 'playground', x: 510, y: 678, w: 260, h: 112 },
]

function BlueprintRoom({ id, x, y, w, h, isSelected, isHovered, onSelect, onHover, onUnhover }) {
  const room = rooms[id]
  const color = getRoomColor(id)
  const cx = x + w / 2
  const cy = y + h / 2
  const isSmall = h < 72

  const fill = isSelected
    ? color + '50'
    : isHovered
    ? color + '30'
    : color + '16'

  const stroke = isSelected || isHovered ? color : color + 'bb'
  const strokeWidth = isSelected ? 2.5 : 1.5

  return (
    <g
      onClick={() => onSelect(id)}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={onUnhover}
      style={{ cursor: 'pointer' }}
    >
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} rx={3} />
      {isSelected && (
        <rect
          x={x + 4} y={y + 4} width={w - 8} height={h - 8}
          fill="none" stroke={color} strokeWidth={1}
          strokeDasharray="5 3" opacity={0.55} rx={2}
        />
      )}
      {/* Emoji */}
      <text
        x={cx}
        y={isSmall ? cy : cy - 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isSmall ? 20 : 26}
        style={{ userSelect: 'none' }}
      >
        {room.emoji}
      </text>
      {/* Room name */}
      {!isSmall && (
        <text
          x={cx} y={cy + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fill={isSelected || isHovered ? color : color + 'cc'}
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1.5"
          style={{ userSelect: 'none' }}
        >
          {room.name.toUpperCase()}
        </text>
      )}
      {/* Small room name — only on hover/select */}
      {isSmall && (isHovered || isSelected) && (
        <text
          x={cx} y={y + h + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={8}
          fill={color}
          fontFamily="monospace"
          fontWeight="bold"
          style={{ userSelect: 'none' }}
        >
          {room.name.toUpperCase()}
        </text>
      )}
    </g>
  )
}

function SectionLabel({ x, y, label }) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle"
      fill="#4a7fa8"
      fontSize={9}
      fontFamily="monospace"
      letterSpacing={3}
      fontWeight="bold"
      style={{ userSelect: 'none' }}
    >
      — {label} —
    </text>
  )
}

function BlueprintView({ selectedId, onSelect }) {
  const [hoverId, setHoverId] = useState(null)

  return (
    <div className="blueprint-wrap">
      <svg
        viewBox="0 0 780 805"
        className="blueprint-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="bpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162d4a" strokeWidth={0.6} />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="780" height="805" fill="#091522" rx={8} />
        <rect width="780" height="805" fill="url(#bpGrid)" rx={8} />

        {/* Section labels */}
        <SectionLabel x={390} y={166} label="GROUND FLOOR" />
        <SectionLabel x={390} y={486} label="UPPER FLOOR" />
        <SectionLabel x={390} y={666} label="OUTDOOR · INNOVATION" />

        {/* Rooms */}
        {BLUEPRINT.map((room) => (
          <BlueprintRoom
            key={room.id}
            {...room}
            isSelected={selectedId === room.id}
            isHovered={hoverId === room.id}
            onSelect={(id) => onSelect(selectedId === id ? null : id)}
            onHover={setHoverId}
            onUnhover={() => setHoverId(null)}
          />
        ))}
      </svg>
    </div>
  )
}

export default function PalaceMap() {
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('blueprint')

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
          className={`btn ${view === 'blueprint' ? 'btn-primary' : ''}`}
          onClick={() => setView('blueprint')}
        >
          🏗 Blueprint
        </button>
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

      {view === 'blueprint' && (
        <BlueprintView selectedId={selectedId} onSelect={setSelectedId} />
      )}

      {view === 'zone' && (
        <div className="zone-grid">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="zone-card"
              style={{ borderColor: zone.color + '88', background: zone.color + '14' }}
            >
              <div className="zone-header">
                <span className="zone-emoji">{zoneEmoji[zone.id]}</span>
                <span className="zone-name" style={{ color: zone.color }}>{zone.name}</span>
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
                  <div className="room-row-zone" style={{ color }}>{zone?.name}</div>
                </div>
                <span className="room-row-theme">{room.theme}</span>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="room-detail animate-in">
          <button className="detail-close" onClick={() => setSelectedId(null)}>✕</button>
          <div className="detail-emoji">{selected.emoji}</div>
          <div className="detail-name">{selected.name}</div>
          <div className="detail-zone-tag" style={{ color: getRoomColor(selected.id) }}>
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
              {i < roomOrder.length - 1 && <span className="route-arrow"> → </span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
