import { useState, useEffect, useRef, useMemo } from 'react'
import { usePalace } from '../../contexts/PalaceContext'

const W = 700
const H = 420
const MARGIN = 40

// Physics constants
const REPULSION  = 5000
const SPRING_K   = 0.025
const SPRING_LEN = 145
const DAMPING    = 0.78
const CENTER_G   = 0.010
const WALL       = 0.10

// Starting anchor positions (physics takes over immediately)
const ZONE_ANCHORS = [
  { x: 190, y: 135 }, { x: 510, y: 135 },
  { x: 150, y: 235 }, { x: 550, y: 235 },
  { x: 210, y: 325 }, { x: 490, y: 325 },
  { x: 350, y: 112 }, { x: 350, y: 340 },
]

function initPos(roomIndex, totalInZone, anchor) {
  if (totalInZone === 1) return { x: anchor.x, y: anchor.y }
  const angle = (roomIndex / totalInZone) * Math.PI * 2
  const r = 48 + totalInZone * 5
  return {
    x: anchor.x + Math.cos(angle) * r,
    y: anchor.y + Math.sin(angle) * r,
  }
}

function stepPhysics(nodes, pairs) {
  for (const n of nodes) { n.fx = 0; n.fy = 0 }

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]
      const dx = b.x - a.x, dy = b.y - a.y
      const d2 = dx * dx + dy * dy + 1
      const d  = Math.sqrt(d2)
      const f  = REPULSION / d2
      const fx = (dx / d) * f, fy = (dy / d) * f
      a.fx -= fx; a.fy -= fy
      b.fx += fx; b.fy += fy
    }
  }

  // Spring
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]))
  for (const [aid, bid] of pairs) {
    const a = byId[aid], b = byId[bid]
    if (!a || !b) continue
    const dx = b.x - a.x, dy = b.y - a.y
    const d  = Math.sqrt(dx * dx + dy * dy) + 0.001
    const f  = SPRING_K * (d - SPRING_LEN)
    const fx = (dx / d) * f, fy = (dy / d) * f
    a.fx += fx; a.fy += fy
    b.fx -= fx; b.fy -= fy
  }

  // Center + walls
  for (const n of nodes) {
    n.fx += (W / 2 - n.x) * CENTER_G
    n.fy += (H / 2 - n.y) * CENTER_G
    if (n.x < MARGIN)     n.fx += WALL * (MARGIN - n.x)
    if (n.x > W - MARGIN) n.fx -= WALL * (n.x - W + MARGIN)
    if (n.y < MARGIN)     n.fy += WALL * (MARGIN - n.y)
    if (n.y > H - MARGIN) n.fy -= WALL * (n.y - H + MARGIN)
  }

  // Integrate
  for (const n of nodes) {
    if (n.pinned) continue
    n.vx = (n.vx + n.fx) * DAMPING
    n.vy = (n.vy + n.fy) * DAMPING
    n.x += n.vx
    n.y += n.vy
  }
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

// ── Main ─────────────────────────────────────────────────────
export default function BrainGraph({ selectedId, onSelect }) {
  const { rooms, zones, scenarios } = usePalace()
  const [, forceRender] = useState(0)
  const svgRef    = useRef(null)
  const nodesRef  = useRef([])
  const dragRef   = useRef(null)  // { id, startX, startY, moved }
  const tickRef   = useRef(0)
  const rafRef    = useRef(null)

  // Build edge list (pairs of ids)
  const { edges, pairs } = useMemo(() => {
    const edges = []
    const pairs = []
    zones.forEach((zone) => {
      const zr = rooms.filter(r => r.zone_id === zone.id)
      for (let i = 0; i < zr.length - 1; i++) {
        edges.push({ id: `z-${zr[i].id}-${zr[i+1].id}`, from: zr[i].id, to: zr[i+1].id, color: zone.color, dashed: false, w: 0.40 })
        pairs.push([zr[i].id, zr[i+1].id])
      }
      if (zr.length >= 3) {
        edges.push({ id: `zr-${zone.id}`, from: zr[zr.length-1].id, to: zr[0].id, color: zone.color, dashed: false, w: 0.22 })
        pairs.push([zr[zr.length-1].id, zr[0].id])
      }
    })
    const seen = new Set()
    scenarios.forEach((s, i) => {
      const next = scenarios[i+1]
      if (!s.correctRoom || !next?.correctRoom) return
      if (s.correctRoom.id === next.correctRoom.id) return
      const key = [s.correctRoom.id, next.correctRoom.id].sort().join('|')
      if (seen.has(key)) return
      seen.add(key)
      edges.push({ id: `sc-${key}`, from: s.correctRoom.id, to: next.correctRoom.id, color: '#a78bfa', dashed: true, w: 0.20 })
      pairs.push([s.correctRoom.id, next.correctRoom.id])
    })
    return { edges, pairs }
  }, [rooms, zones, scenarios])

  // Initialise / re-initialise nodes when rooms change
  useEffect(() => {
    const existing = Object.fromEntries(nodesRef.current.map(n => [n.id, n]))
    nodesRef.current = rooms.map((room, i) => {
      if (existing[room.id]) return existing[room.id] // keep physics state
      const zi = zones.findIndex(z => z.id === room.zone_id)
      const anchor = ZONE_ANCHORS[Math.max(0, zi) % ZONE_ANCHORS.length]
      const zoneRooms = rooms.filter(r => r.zone_id === room.zone_id)
      const ri = zoneRooms.findIndex(r => r.id === room.id)
      const pos = initPos(ri, zoneRooms.length, anchor)
      return { id: room.id, x: pos.x, y: pos.y, vx: 0, vy: 0, pinned: false }
    })
  }, [rooms, zones])

  // Physics + render loop
  useEffect(() => {
    const loop = () => {
      tickRef.current++
      stepPhysics(nodesRef.current, pairs)
      forceRender(n => n + 1)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [pairs])

  // Pointer-to-SVG coord conversion
  function svgPt(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width)  * W,
      y: ((clientY - rect.top)  / rect.height) * H,
    }
  }

  function onNodeDown(e, nodeId) {
    e.stopPropagation()
    const cl = e.touches ? e.touches[0] : e
    const pt = svgPt(cl.clientX, cl.clientY)
    dragRef.current = { id: nodeId, startX: pt.x, startY: pt.y, moved: false }
    const node = nodesRef.current.find(n => n.id === nodeId)
    if (node) node.pinned = true
    if (e.pointerId != null) e.target.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragRef.current) return
    const cl = e.touches ? e.touches[0] : e
    const pt = svgPt(cl.clientX, cl.clientY)
    const dx = pt.x - dragRef.current.startX
    const dy = pt.y - dragRef.current.startY
    if (Math.sqrt(dx*dx + dy*dy) > 4) dragRef.current.moved = true
    const node = nodesRef.current.find(n => n.id === dragRef.current.id)
    if (node) { node.x = pt.x; node.y = pt.y; node.vx = 0; node.vy = 0 }
  }

  function onPointerUp(e) {
    if (!dragRef.current) return
    const node = nodesRef.current.find(n => n.id === dragRef.current.id)
    if (node) node.pinned = false
    if (!dragRef.current.moved) {
      const id = dragRef.current.id
      onSelect(selectedId === id ? null : id)
    }
    dragRef.current = null
  }

  // Snapshot positions for render
  const byId = Object.fromEntries(nodesRef.current.map(n => [n.id, n]))
  const tick  = tickRef.current

  return (
    <div className="brain-graph-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="brain-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{ touchAction: 'none', userSelect: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor="#081428" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#bgGrad)" rx={14} />

        {/* Edges */}
        {edges.map(edge => {
          const a = byId[edge.from], b = byId[edge.to]
          if (!a || !b) return null

          const speed  = 0.006
          const offset = ((a.x * 0.03 + a.y * 0.02) % 1 + 1) % 1
          const ph1    = ((tick * speed + offset) % 1 + 1) % 1
          const ph2    = (ph1 + 0.5) % 1
          const p1x    = a.x + (b.x - a.x) * ph1
          const p1y    = a.y + (b.y - a.y) * ph1
          const p2x    = a.x + (b.x - a.x) * ph2
          const p2y    = a.y + (b.y - a.y) * ph2
          const fade   = p => Math.sin(p * Math.PI)

          return (
            <g key={edge.id}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={edge.color} strokeWidth={edge.dashed ? 0.8 : 0.7}
                opacity={edge.w}
                strokeDasharray={edge.dashed ? '5 5' : undefined}
              />
              <circle cx={p1x} cy={p1y} r={2.8} fill={edge.color} opacity={fade(ph1) * 0.95} />
              <circle cx={p2x} cy={p2y} r={1.8} fill={edge.color} opacity={fade(ph2) * 0.6} />
            </g>
          )
        })}

        {/* Zone cluster labels */}
        {zones.map((zone, zi) => {
          const anchor  = ZONE_ANCHORS[zi % ZONE_ANCHORS.length]
          const zr      = rooms.filter(r => r.zone_id === zone.id)
          if (!zr.length) return null
          const avgX = zr.reduce((s, r) => s + (byId[r.id]?.x ?? anchor.x), 0) / zr.length
          const avgY = zr.reduce((s, r) => s + (byId[r.id]?.y ?? anchor.y), 0) / zr.length - 52
          return (
            <text key={zone.id}
              x={avgX} y={Math.max(12, avgY)}
              textAnchor="middle" fill={zone.color}
              fontSize={7.5} fontFamily="monospace" letterSpacing={2} opacity={0.5}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {zone.name.toUpperCase()}
            </text>
          )
        })}

        {/* Nodes */}
        {rooms.map(room => {
          const n = byId[room.id]
          if (!n) return null
          const zone  = zones.find(z => z.id === room.zone_id)
          const color = zone?.color || '#64b4ff'
          const isSel = selectedId === room.id
          const isDrag = dragRef.current?.id === room.id
          const breathe = 0.5 + 0.5 * Math.sin(tick * 0.032 + n.x * 0.07 + n.y * 0.05)
          const r     = isSel ? 22 : 16
          const glowOp = isSel ? 0.70 : (isDrag ? 0.55 : 0.14 + breathe * 0.12)
          const cursor  = isDrag ? 'grabbing' : 'grab'

          return (
            <g key={room.id}
              onPointerDown={e => onNodeDown(e, room.id)}
              style={{ cursor }}
            >
              {/* Glow */}
              <circle cx={n.x} cy={n.y} r={r + 11} fill={color} opacity={glowOp} filter="url(#glow)" />
              {/* Ring */}
              <circle cx={n.x} cy={n.y} r={r}
                fill={isSel ? color + '30' : '#07101e'}
                stroke={color} strokeWidth={isSel ? 2.5 : 1.8} />
              {/* Emoji */}
              <text x={n.x} y={n.y + 1}
                textAnchor="middle" dominantBaseline="central"
                fontSize={isSel ? 15 : 12}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {room.emoji}
              </text>
              {/* Name on select */}
              {isSel && (
                <>
                  <rect x={n.x - 50} y={n.y + r + 3} width={100} height={13} rx={3}
                    fill="#030a16" opacity={0.9} />
                  <text x={n.x} y={n.y + r + 11}
                    textAnchor="middle" fontSize={7} fill={color}
                    fontFamily="monospace" fontWeight="bold" letterSpacing={1}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {room.name.toUpperCase()}
                  </text>
                </>
              )}
            </g>
          )
        })}

        {/* Stats watermark */}
        <text x={W - 10} y={H - 8} textAnchor="end"
          fontSize={7} fill="#1b3560" fontFamily="monospace" letterSpacing={1}
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {rooms.length} NODES · {edges.length} CONNECTIONS
        </text>
      </svg>

      <Legend zones={zones} />
    </div>
  )
}
