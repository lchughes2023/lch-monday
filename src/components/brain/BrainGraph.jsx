import { useState, useEffect, useRef, useMemo } from 'react'
import { usePalace } from '../../contexts/PalaceContext'
import { useProgress } from '../../contexts/ProgressContext'

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

// Node radius scales with memory count: 12 base + up to 18 extra
function nodeRadius(memCount) {
  return 12 + Math.min(Math.sqrt(memCount || 0) * 3, 18)
}

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
  const { journalEntries } = useProgress()
  const [, forceRender] = useState(0)
  const svgRef    = useRef(null)
  const nodesRef  = useRef([])
  const dragRef   = useRef(null)  // { id, startX, startY, moved }
  const tickRef   = useRef(0)
  const rafRef    = useRef(null)

  // Count journal entries per room — drives node sizing
  const memoriesByRoom = useMemo(() => {
    const m = {}
    journalEntries.forEach(e => {
      if (e.roomId) m[e.roomId] = (m[e.roomId] || 0) + 1
    })
    return m
  }, [journalEntries])

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

  // L1 = directly connected to selected; L2 = one hop further
  const { l1Set, l2Set } = useMemo(() => {
    if (!selectedId) return { l1Set: new Set(), l2Set: new Set() }
    const l1Set = new Set()
    for (const [a, b] of pairs) {
      if (a === selectedId) l1Set.add(b)
      else if (b === selectedId) l1Set.add(a)
    }
    const l2Set = new Set()
    for (const [a, b] of pairs) {
      if (l1Set.has(a) && b !== selectedId && !l1Set.has(b)) l2Set.add(b)
      else if (l1Set.has(b) && a !== selectedId && !l1Set.has(a)) l2Set.add(a)
    }
    return { l1Set, l2Set }
  }, [selectedId, pairs])

  // Top-10 most-recent memories for the selected room (for tooltip)
  const selectedMemories = useMemo(() => {
    if (!selectedId) return []
    return journalEntries.filter(e => e.roomId === selectedId).slice(0, 10)
  }, [selectedId, journalEntries])

  // Initialise / re-initialise nodes when rooms change
  useEffect(() => {
    const existing = Object.fromEntries(nodesRef.current.map(n => [n.id, n]))
    nodesRef.current = rooms.map((room) => {
      if (existing[room.id]) return existing[room.id]
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

  // Returns { op, sw, ps } — opacity, stroke-width, pulse-scale — for each edge
  function edgeStyle(edge) {
    if (!selectedId) return { op: edge.w, sw: edge.dashed ? 0.8 : 0.7, ps: 1.0 }
    const isPrimary   = edge.from === selectedId || edge.to === selectedId
    if (isPrimary)    return { op: Math.min(edge.w * 5, 0.88), sw: edge.dashed ? 2.2 : 2.0, ps: 1.8 }
    const isSecondary = l1Set.has(edge.from) || l1Set.has(edge.to)
    if (isSecondary)  return { op: edge.w * 1.6, sw: edge.dashed ? 1.2 : 1.0, ps: 1.0 }
    return { op: edge.w * 0.15, sw: edge.dashed ? 0.4 : 0.35, ps: 0.3 }
  }

  // Snapshot positions for render
  const byId = Object.fromEntries(nodesRef.current.map(n => [n.id, n]))
  const tick  = tickRef.current

  // Tooltip dimensions + position (in SVG-space units)
  const TP_W      = 215
  const TP_LINE_H = 22
  const TP_H      = selectedMemories.length > 0
    ? Math.min(selectedMemories.length * TP_LINE_H + 48, 274)
    : 0
  const selectedNode = selectedId ? byId[selectedId] : null
  let tooltipX = 0, tooltipY = 0
  if (selectedNode && TP_H > 0) {
    const selR = nodeRadius(memoriesByRoom[selectedId] || 0) + 6
    tooltipX = selectedNode.x + selR + 14
    if (tooltipX + TP_W > W - 8) tooltipX = selectedNode.x - selR - 14 - TP_W
    tooltipX = Math.max(8, tooltipX)
    tooltipY = selectedNode.y - TP_H / 2
    tooltipY = Math.max(8, Math.min(tooltipY, H - TP_H - 8))
  }

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

          const { op, sw, ps } = edgeStyle(edge)
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
                stroke={edge.color} strokeWidth={sw}
                opacity={op}
                strokeDasharray={edge.dashed ? '5 5' : undefined}
              />
              <circle cx={p1x} cy={p1y} r={2.8 * ps} fill={edge.color} opacity={fade(ph1) * 0.95 * Math.min(ps, 1)} />
              <circle cx={p2x} cy={p2y} r={1.8 * ps} fill={edge.color} opacity={fade(ph2) * 0.60 * Math.min(ps, 1)} />
            </g>
          )
        })}

        {/* Zone cluster labels */}
        {zones.map((zone, zi) => {
          const anchor  = ZONE_ANCHORS[zi % ZONE_ANCHORS.length]
          const zr      = rooms.filter(r => r.zone_id === zone.id)
          if (!zr.length) return null
          const avgX    = zr.reduce((s, r) => s + (byId[r.id]?.x ?? anchor.x), 0) / zr.length
          const avgY    = zr.reduce((s, r) => s + (byId[r.id]?.y ?? anchor.y), 0) / zr.length - 52
          return (
            <text key={zone.id}
              x={avgX} y={Math.max(12, avgY)}
              textAnchor="middle" fill={zone.color}
              fontSize={7.5} fontFamily="monospace" letterSpacing={2}
              opacity={selectedId ? 0.18 : 0.50}
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
          const zone     = zones.find(z => z.id === room.zone_id)
          const color    = zone?.color || '#64b4ff'
          const isSel    = selectedId === room.id
          const isL1     = l1Set.has(room.id)
          const isL2     = l2Set.has(room.id)
          const isDrag   = dragRef.current?.id === room.id
          const memCount = memoriesByRoom[room.id] || 0
          const baseR    = nodeRadius(memCount)
          const r        = isSel ? baseR + 6 : baseR

          // Glow: full breathe when nothing selected; tiered when something is
          let glowOp
          if (isDrag) {
            glowOp = 0.55
          } else if (isSel) {
            glowOp = 0.80
          } else if (selectedId) {
            if (isL1)      glowOp = 0.50
            else if (isL2) glowOp = 0.22
            else           glowOp = 0.04
          } else {
            const breathe = 0.5 + 0.5 * Math.sin(tick * 0.032 + n.x * 0.07 + n.y * 0.05)
            glowOp = 0.14 + breathe * 0.12
          }

          const ringOp = selectedId && !isSel && !isL1 && !isL2 ? 0.25 : 1.0
          const cursor = isDrag ? 'grabbing' : 'grab'

          return (
            <g key={room.id}
              onPointerDown={e => onNodeDown(e, room.id)}
              style={{ cursor }}
            >
              {/* Glow halo */}
              <circle cx={n.x} cy={n.y} r={r + 11} fill={color} opacity={glowOp} filter="url(#glow)" />
              {/* Ring */}
              <circle cx={n.x} cy={n.y} r={r}
                fill={isSel ? color + '30' : '#07101e'}
                stroke={color} strokeWidth={isSel ? 2.5 : 1.8}
                opacity={ringOp}
              />
              {/* Memory count badge */}
              {memCount > 0 && !isSel && (
                <text
                  x={n.x + r * 0.68} y={n.y - r * 0.68}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={5.5} fill={color} fontFamily="monospace" fontWeight="bold"
                  opacity={ringOp * 0.75}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {memCount > 99 ? '99+' : memCount}
                </text>
              )}
              {/* Emoji */}
              <text x={n.x} y={n.y + 1}
                textAnchor="middle" dominantBaseline="central"
                fontSize={isSel ? Math.max(15, baseR * 0.85) : Math.max(12, baseR * 0.75)}
                opacity={ringOp}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {room.emoji}
              </text>
              {/* Name label when selected */}
              {isSel && (
                <>
                  <rect x={n.x - 52} y={n.y + r + 3} width={104} height={13} rx={3}
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

        {/* Memory tooltip — appears beside selected node if it has journal entries */}
        {selectedNode && TP_H > 0 && (
          <foreignObject x={tooltipX} y={tooltipY} width={TP_W} height={TP_H} style={{ overflow: 'visible' }}>
            <div className="brain-tooltip">
              <div className="brain-tooltip-header">
                📝 {selectedMemories.length} memor{selectedMemories.length === 1 ? 'y' : 'ies'}
              </div>
              <ul className="brain-tooltip-list">
                {selectedMemories.map((e) => (
                  <li key={e.id} className="brain-tooltip-item">
                    {e.text.length > 58 ? e.text.slice(0, 58) + '…' : e.text}
                  </li>
                ))}
              </ul>
            </div>
          </foreignObject>
        )}

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
