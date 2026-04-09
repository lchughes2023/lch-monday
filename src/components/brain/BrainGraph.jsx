import { useState, useEffect, useRef, useMemo } from 'react'
import { usePalace } from '../../contexts/PalaceContext'

const W = 700
const H = 440

// Anchor points across the two brain hemispheres (up to 8 zones)
const ZONE_ANCHORS = [
  { x: 192, y: 138 }, // left frontal
  { x: 508, y: 138 }, // right frontal
  { x: 148, y: 238 }, // left temporal
  { x: 552, y: 238 }, // right temporal
  { x: 210, y: 328 }, // left parietal
  { x: 490, y: 328 }, // right parietal
  { x: 350, y: 115 }, // top center
  { x: 350, y: 345 }, // bottom center
]

// Distribute rooms in a ring around their zone anchor
function roomPos(roomIndex, totalInZone, anchor) {
  if (totalInZone === 1) return { x: anchor.x, y: anchor.y }
  const angle = (roomIndex / totalInZone) * Math.PI * 2 - Math.PI / 2
  const r = Math.min(58, 22 + totalInZone * 9)
  return {
    x: anchor.x + Math.cos(angle) * r,
    y: anchor.y + Math.sin(angle) * r,
  }
}

// ── Brain silhouette ─────────────────────────────────────────
function BrainSilhouette({ tick }) {
  const pulse = 0.5 + 0.5 * Math.sin(tick * 0.007)
  const glowOp = 0.06 + pulse * 0.06

  const sulciLeft = [
    'M 152 128 C 186 146, 198 178, 180 220',
    'M 122 204 C 156 198, 180 210, 196 242',
    'M 170 284 C 196 276, 224 288, 240 304',
    'M 196 148 C 226 154, 246 166, 256 188',
  ]
  const sulciRight = [
    'M 548 128 C 514 146, 502 178, 520 220',
    'M 578 204 C 544 198, 520 210, 504 242',
    'M 530 284 C 504 276, 476 288, 460 304',
    'M 504 148 C 474 154, 454 166, 444 188',
  ]

  return (
    <g>
      {/* Hemisphere fills */}
      <ellipse cx={248} cy={218} rx={177} ry={163} fill="#050d1e" opacity={0.95} />
      <ellipse cx={452} cy={218} rx={177} ry={163} fill="#050d1e" opacity={0.95} />

      {/* Hemisphere outlines */}
      <ellipse cx={248} cy={218} rx={177} ry={163}
        fill="none" stroke="#1b3560" strokeWidth={1.5} opacity={0.7} />
      <ellipse cx={452} cy={218} rx={177} ry={163}
        fill="none" stroke="#1b3560" strokeWidth={1.5} opacity={0.7} />

      {/* Breathing glow */}
      <ellipse cx={248} cy={218} rx={177} ry={163}
        fill="none" stroke="#2a5090" strokeWidth={10} opacity={glowOp} />
      <ellipse cx={452} cy={218} rx={177} ry={163}
        fill="none" stroke="#2a5090" strokeWidth={10} opacity={glowOp} />

      {/* Central fissure */}
      <path d="M 350 60 C 344 132, 356 212, 350 376"
        stroke="#030a16" strokeWidth={11} fill="none" />
      <path d="M 350 60 C 344 132, 356 212, 350 376"
        stroke="#1b3560" strokeWidth={1.5} fill="none" opacity={0.55} />

      {/* Sulci */}
      {sulciLeft.map((d, i) => (
        <path key={`sl${i}`} d={d} fill="none" stroke="#1b3560" strokeWidth={1} opacity={0.35} />
      ))}
      {sulciRight.map((d, i) => (
        <path key={`sr${i}`} d={d} fill="none" stroke="#1b3560" strokeWidth={1} opacity={0.35} />
      ))}
    </g>
  )
}

// ── Edge with travelling pulse ───────────────────────────────
function EdgeLine({ edge, from, to, tick }) {
  const speed = edge.type === 'scenario' ? 0.006 : 0.005
  const offset = (from.x * 0.03 + from.y * 0.02) % 1
  const phase1 = ((tick * speed + offset) % 1 + 1) % 1
  const phase2 = (phase1 + 0.5) % 1

  const p1x = from.x + (to.x - from.x) * phase1
  const p1y = from.y + (to.y - from.y) * phase1
  const p2x = from.x + (to.x - from.x) * phase2
  const p2y = from.y + (to.y - from.y) * phase2

  const sinFade = (p) => Math.sin(p * Math.PI)

  return (
    <g>
      <line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={edge.color}
        strokeWidth={edge.type === 'scenario' ? 0.9 : 0.75}
        opacity={edge.weight}
        strokeDasharray={edge.type === 'scenario' ? '5 5' : undefined}
      />
      <circle cx={p1x} cy={p1y} r={2.8} fill={edge.color} opacity={sinFade(phase1) * 0.95} />
      <circle cx={p2x} cy={p2y} r={1.8} fill={edge.color} opacity={sinFade(phase2) * 0.65} />
    </g>
  )
}

// ── Room node ────────────────────────────────────────────────
function BrainNode({ room, pos, color, isSelected, isHovered, tick, onSelect, onHover, onUnhover }) {
  const breathe = 0.5 + 0.5 * Math.sin(tick * 0.035 + pos.x * 0.08 + pos.y * 0.05)
  const r = isSelected ? 21 : isHovered ? 19 : 15
  const glowOp = isSelected ? 0.65 : isHovered ? 0.45 : 0.12 + breathe * 0.12

  return (
    <g
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow */}
      <circle cx={pos.x} cy={pos.y} r={r + 10} fill={color} opacity={glowOp} />

      {/* Ring */}
      <circle
        cx={pos.x} cy={pos.y} r={r}
        fill={isSelected ? color + '35' : '#07101e'}
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        opacity={isSelected ? 1 : 0.9}
      />

      {/* Emoji */}
      <text
        x={pos.x} y={pos.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isSelected || isHovered ? 14 : 11}
        style={{ userSelect: 'none' }}
      >
        {room.emoji}
      </text>

      {/* Name label on hover/select */}
      {(isSelected || isHovered) && (
        <>
          <rect
            x={pos.x - 48} y={pos.y + r + 3}
            width={96} height={13}
            rx={3} fill="#030a16" opacity={0.9}
          />
          <text
            x={pos.x} y={pos.y + r + 10}
            textAnchor="middle"
            fontSize={7}
            fill={color}
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing={1}
            style={{ userSelect: 'none' }}
          >
            {room.name.toUpperCase()}
          </text>
        </>
      )}
    </g>
  )
}

// ── Legend ───────────────────────────────────────────────────
function Legend({ zones }) {
  return (
    <div className="brain-legend">
      {zones.map((z) => (
        <span key={z.id} className="brain-legend-item">
          <span className="brain-legend-dot" style={{ background: z.color }} />
          <span className="brain-legend-label">{z.name}</span>
        </span>
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────
export default function BrainGraph({ selectedId, onSelect }) {
  const { rooms, zones, scenarios } = usePalace()
  const [tick, setTick] = useState(0)
  const [hoverId, setHoverId] = useState(null)
  const rafRef = useRef(null)

  useEffect(() => {
    let t = 0
    const loop = () => { t++; setTick(t); rafRef.current = requestAnimationFrame(loop) }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Node positions
  const nodePositions = useMemo(() => {
    const map = {}
    zones.forEach((zone, zi) => {
      const anchor = ZONE_ANCHORS[zi % ZONE_ANCHORS.length]
      const zoneRooms = rooms.filter((r) => r.zone_id === zone.id)
      zoneRooms.forEach((room, ri) => {
        map[room.id] = roomPos(ri, zoneRooms.length, anchor)
      })
    })
    return map
  }, [rooms, zones])

  // Edges: within-zone connections + scenario semantic links
  const edges = useMemo(() => {
    const list = []

    // Zone chains
    zones.forEach((zone) => {
      const zr = rooms.filter((r) => r.zone_id === zone.id)
      for (let i = 0; i < zr.length - 1; i++) {
        list.push({
          id: `z-${zr[i].id}-${zr[i + 1].id}`,
          from: zr[i].id,
          to: zr[i + 1].id,
          color: zone.color,
          type: 'zone',
          weight: 0.38,
        })
      }
      // Close the ring for zones with 3+ rooms
      if (zr.length >= 3) {
        list.push({
          id: `z-ring-${zone.id}`,
          from: zr[zr.length - 1].id,
          to: zr[0].id,
          color: zone.color,
          type: 'zone',
          weight: 0.22,
        })
      }
    })

    // Scenario semantic edges (cross-room connections)
    const seen = new Set()
    scenarios.forEach((s, i) => {
      if (!s.correctRoom) return
      const next = scenarios[i + 1]
      if (!next?.correctRoom) return
      if (s.correctRoom.id === next.correctRoom.id) return
      const key = [s.correctRoom.id, next.correctRoom.id].sort().join('|')
      if (seen.has(key)) return
      seen.add(key)
      list.push({
        id: `sc-${key}`,
        from: s.correctRoom.id,
        to: next.correctRoom.id,
        color: '#a78bfa',
        type: 'scenario',
        weight: 0.22,
      })
    })

    return list
  }, [rooms, zones, scenarios])

  return (
    <div className="brain-graph-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="brain-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#040c1a" rx={14} />

        {/* Brain outline */}
        <BrainSilhouette tick={tick} />

        {/* Edges */}
        {edges.map((edge) => {
          const from = nodePositions[edge.from]
          const to = nodePositions[edge.to]
          if (!from || !to) return null
          return <EdgeLine key={edge.id} edge={edge} from={from} to={to} tick={tick} />
        })}

        {/* Zone cluster labels */}
        {zones.map((zone, zi) => {
          const anchor = ZONE_ANCHORS[zi % ZONE_ANCHORS.length]
          const zoneRooms = rooms.filter((r) => r.zone_id === zone.id)
          if (!zoneRooms.length) return null
          return (
            <text
              key={zone.id}
              x={anchor.x}
              y={anchor.y - 68}
              textAnchor="middle"
              fill={zone.color}
              fontSize={7.5}
              fontFamily="monospace"
              letterSpacing={2}
              opacity={0.55}
              style={{ userSelect: 'none' }}
            >
              {zone.name.toUpperCase()}
            </text>
          )
        })}

        {/* Nodes */}
        {rooms.map((room) => {
          const pos = nodePositions[room.id]
          if (!pos) return null
          const zone = zones.find((z) => z.id === room.zone_id)
          const color = zone?.color || '#64b4ff'
          return (
            <BrainNode
              key={room.id}
              room={room}
              pos={pos}
              color={color}
              isSelected={selectedId === room.id}
              isHovered={hoverId === room.id}
              tick={tick}
              onSelect={() => onSelect(selectedId === room.id ? null : room.id)}
              onHover={() => setHoverId(room.id)}
              onUnhover={() => setHoverId(null)}
            />
          )
        })}

        {/* Node count watermark */}
        <text x={W - 10} y={H - 8} textAnchor="end"
          fontSize={7} fill="#1b3560" fontFamily="monospace" letterSpacing={1}
          style={{ userSelect: 'none' }}>
          {rooms.length} NODES · {edges.length} CONNECTIONS
        </text>
      </svg>

      <Legend zones={zones} />
    </div>
  )
}
