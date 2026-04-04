import { useState } from 'react'
import { usePalace } from '../../contexts/PalaceContext'

function BlueprintRoom({ room, zoneColor, x, y, w, h, isSelected, isHovered, onSelect, onHover, onUnhover }) {
  const cx = x + w / 2
  const cy = y + h / 2
  const isSmall = h < 72

  const fill = isSelected ? zoneColor + '50' : isHovered ? zoneColor + '30' : zoneColor + '16'
  const stroke = isSelected || isHovered ? zoneColor : zoneColor + 'bb'
  const strokeWidth = isSelected ? 2.5 : 1.5

  return (
    <g
      onClick={() => onSelect(room.id)}
      onMouseEnter={() => onHover(room.id)}
      onMouseLeave={onUnhover}
      style={{ cursor: 'pointer' }}
    >
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} rx={3} />
      {isSelected && (
        <rect
          x={x + 4} y={y + 4} width={w - 8} height={h - 8}
          fill="none" stroke={zoneColor} strokeWidth={1}
          strokeDasharray="5 3" opacity={0.55} rx={2}
        />
      )}
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
      {!isSmall && (
        <text
          x={cx} y={cy + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fill={isSelected || isHovered ? zoneColor : zoneColor + 'cc'}
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1.5"
          style={{ userSelect: 'none' }}
        >
          {room.name.toUpperCase()}
        </text>
      )}
      {isSmall && (isHovered || isSelected) && (
        <text
          x={cx} y={y + h + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={8}
          fill={zoneColor}
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

export default function BlueprintView({ selectedId, onSelect }) {
  const [hoverId, setHoverId] = useState(null)
  const { rooms, zones } = usePalace()

  // Only rooms with blueprint coordinates
  const bpRooms = rooms.filter((r) => r.bp_x != null && r.bp_y != null)

  // Build zone color map
  const zoneColorById = {}
  zones.forEach((z) => { zoneColorById[z.id] = z.color })

  if (bpRooms.length === 0) {
    return (
      <div className="blueprint-wrap">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-mid)' }}>
          No blueprint layout available for this palace. Use Zone View or List View.
        </div>
      </div>
    )
  }

  // Calculate viewBox from room bounds
  const allX = bpRooms.flatMap((r) => [r.bp_x, r.bp_x + r.bp_w])
  const allY = bpRooms.flatMap((r) => [r.bp_y, r.bp_y + r.bp_h])
  const vbW = Math.max(...allX) + 10
  const vbH = Math.max(...allY) + 10

  return (
    <div className="blueprint-wrap">
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="blueprint-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="bpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162d4a" strokeWidth={0.6} />
          </pattern>
        </defs>
        <rect width={vbW} height={vbH} fill="#091522" rx={8} />
        <rect width={vbW} height={vbH} fill="url(#bpGrid)" rx={8} />

        {bpRooms.map((room) => (
          <BlueprintRoom
            key={room.id}
            room={room}
            zoneColor={zoneColorById[room.zone_id] || '#64b4ff'}
            x={room.bp_x}
            y={room.bp_y}
            w={room.bp_w}
            h={room.bp_h}
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
