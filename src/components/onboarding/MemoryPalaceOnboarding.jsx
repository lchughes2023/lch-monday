import { useState, useEffect, useRef } from 'react'

const slides = [
  {
    id: 0,
    bg: '#0f0820',
    headline: 'your mind has a home',
    caption: 'a memory palace turns any space into a thinking system',
    headlineBg: '#4c1d95',
    headlineColor: '#ede9fe',
    captionColor: '#c4b5fd',
    render: ({ tick }) => (
      <svg viewBox="0 0 640 380" width="100%" xmlns="http://www.w3.org/2000/svg">
        {[...Array(28)].map((_, i) => {
          const x = ((i * 73 + 40) % 620) + 10
          const y = ((i * 53 + 20) % 320) + 20
          const sz = (i % 3) + 1
          const op = 0.3 + 0.6 * Math.abs(Math.sin(tick * 0.04 + i))
          return <circle key={i} cx={x} cy={y} r={sz} fill="white" opacity={op} />
        })}
        <g transform={`translate(0, ${Math.sin(tick * 0.05) * 6})`}>
          <circle cx="320" cy="62" r="34" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2.5" />
          <path d="M304 57 Q310 48 318 57 Q326 66 334 57 Q341 50 339 61 Q343 69 334 71 Q326 76 318 67 Q310 58 303 67 Q297 73 301 62 Z"
            fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
          <line x1="318" y1="57" x2="318" y2="74" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x="320" y="113" textAnchor="middle" fill="#e9d5ff" fontSize="10" fontFamily="sans-serif" opacity="0.8">your brain</text>
        </g>
        <text x="320" y="133" textAnchor="middle" fill="#a78bfa" fontSize="20" fontWeight="700" fontFamily="sans-serif"
          opacity={0.7 + 0.3 * Math.sin(tick * 0.07)}>+</text>
        <g transform={`translate(0, ${Math.sin(tick * 0.04 + 1) * 5})`}>
          <rect x="200" y="175" width="240" height="160" rx="8" fill="#2d1b69" stroke="#7c3aed" strokeWidth="2.5" />
          <polygon points="182,180 320,100 458,180" fill="#4c1d95" stroke="#7c3aed" strokeWidth="2.5" />
          <polygon points="188,180 320,108 452,180" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
          <rect x="288" y="270" width="64" height="65" rx="6" fill="#1e0f50" stroke="#7c3aed" strokeWidth="2" />
          <circle cx="342" cy="306" r="4" fill="#a78bfa" />
          <rect x="218" y="202" width="52" height="42" rx="5" fill="#1e1042" stroke="#7c3aed" strokeWidth="1.5" />
          <rect x="370" y="202" width="52" height="42" rx="5" fill="#1e1042" stroke="#7c3aed" strokeWidth="1.5" />
          <rect x="220" y="204" width="48" height="38" rx="4" fill="#fbbf24"
            opacity={0.2 + 0.2 * Math.sin(tick * 0.06)} />
          <rect x="372" y="204" width="48" height="38" rx="4" fill="#fbbf24"
            opacity={0.2 + 0.2 * Math.sin(tick * 0.06 + 1)} />
          <line x1="244" y1="202" x2="244" y2="244" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="218" y1="223" x2="270" y2="223" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="396" y1="202" x2="396" y2="244" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="370" y1="223" x2="422" y2="223" stroke="#7c3aed" strokeWidth="1.5" />
          <text x="320" y="158" textAnchor="middle" fill="#e9d5ff" fontSize="10" fontFamily="sans-serif" opacity="0.8">a place you know</text>
        </g>
      </svg>
    ),
  },
  {
    id: 1,
    bg: '#051209',
    headline: 'every room has a purpose',
    caption: 'each space holds a different type of thinking',
    headlineBg: '#14532d',
    headlineColor: '#bbf7d0',
    captionColor: '#86efac',
    render: ({ tick }) => {
      const rooms = [
        { x: 90, y: 55, w: 135, h: 118, fill: '#14532d', stroke: '#4ade80', emoji: '💡', label: 'IDEAS', sub: 'front garden', tc: '#bbf7d0', sc: '#4ade80' },
        { x: 248, y: 55, w: 135, h: 118, fill: '#1e3a5f', stroke: '#60a5fa', emoji: '🤝', label: 'PEOPLE', sub: 'living room', tc: '#bfdbfe', sc: '#60a5fa' },
        { x: 406, y: 55, w: 135, h: 118, fill: '#451a03', stroke: '#fb923c', emoji: '📦', label: 'ARCHIVE', sub: 'bathroom', tc: '#fed7aa', sc: '#fb923c' },
        { x: 90, y: 192, w: 135, h: 118, fill: '#2e1065', stroke: '#a78bfa', emoji: '🧪', label: 'EXPERIMENTS', sub: 'backyard sandbox', tc: '#ede9fe', sc: '#a78bfa' },
        { x: 248, y: 192, w: 135, h: 118, fill: '#4a0f20', stroke: '#f472b6', emoji: '🪞', label: 'IDENTITY', sub: 'your room', tc: '#fce7f3', sc: '#f472b6' },
        { x: 406, y: 192, w: 135, h: 118, fill: '#3b2200', stroke: '#fbbf24', emoji: '🧺', label: 'CLEAN UP', sub: 'laundry room', tc: '#fef3c7', sc: '#fbbf24' },
      ]
      return (
        <svg viewBox="0 0 640 340" width="100%" xmlns="http://www.w3.org/2000/svg">
          <rect x="74" y="38" width="483" height="285" rx="14" fill="#0a1f0d" stroke="#22c55e" strokeWidth="2" />
          <rect x="238" y="166" width="155" height="22" rx="5" fill="#111" stroke="#333" strokeWidth="1" />
          <text x="316" y="181" textAnchor="middle" fill="#666" fontSize="9" fontFamily="sans-serif">hallway — the router</text>
          {rooms.map((r, i) => {
            const bob = Math.sin(tick * 0.04 + i * 0.8) * 3
            return (
              <g key={i} transform={`translate(0, ${bob})`}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="7" fill={r.fill} stroke={r.stroke} strokeWidth="1.5" />
                <text x={r.x + r.w / 2} y={r.y + 52} textAnchor="middle" fontSize="22" fontFamily="sans-serif">{r.emoji}</text>
                <text x={r.x + r.w / 2} y={r.y + 75} textAnchor="middle" fontSize="10" fontWeight="700" fill={r.tc} fontFamily="sans-serif">{r.label}</text>
                <text x={r.x + r.w / 2} y={r.y + 92} textAnchor="middle" fontSize="9" fill={r.sc} fontFamily="sans-serif">{r.sub}</text>
              </g>
            )
          })}
        </svg>
      )
    },
  },
  {
    id: 2,
    bg: '#1a0808',
    headline: 'walk the palace, find any thought',
    caption: 'every thought has a room · every room has a role · nothing gets lost',
    headlineBg: '#7f1d1d',
    headlineColor: '#fecaca',
    captionColor: '#fca5a5',
    render: ({ tick }) => {
      const steps = [
        { cx: 110, cy: 290, fill: '#7f1d1d', stroke: '#f87171', emoji: '🚪', label: 'triage it', sub: 'porch' },
        { cx: 265, cy: 228, fill: '#1e3a5f', stroke: '#60a5fa', emoji: '🛋️', label: 'file it', sub: 'living room' },
        { cx: 406, cy: 176, fill: '#2e1065', stroke: '#a78bfa', emoji: '🏖️', label: 'build it', sub: 'sandbox' },
        { cx: 530, cy: 128, fill: '#451a03', stroke: '#fb923c', emoji: '📦', label: 'store it', sub: 'archive' },
      ]
      const t = (Math.sin(tick * 0.025) + 1) / 2
      const px = 80 + t * 490
      const py = 310 - t * 200
      const personBob = Math.sin(tick * 0.15) * 4
      return (
        <svg viewBox="0 0 640 340" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrowR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          <path d="M110 290 Q185 250 265 228 Q340 208 406 176 Q470 148 530 128"
            fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="8,5" opacity="0.5" />
          {steps.slice(0, -1).map((s, i) => {
            const n = steps[i + 1]
            return (
              <line key={i} x1={s.cx + 30} y1={s.cy - 5} x2={n.cx - 30} y2={n.cy + 5}
                stroke="#f87171" strokeWidth="1.5" markerEnd="url(#arrowR)" opacity="0.7" />
            )
          })}
          {steps.map((s, i) => {
            const bob = Math.sin(tick * 0.04 + i) * 4
            return (
              <g key={i} transform={`translate(0, ${bob})`}>
                <circle cx={s.cx} cy={s.cy} r="29" fill={s.fill} stroke={s.stroke} strokeWidth="2" />
                <text x={s.cx} y={s.cy + 7} textAnchor="middle" fontSize="18" fontFamily="sans-serif">{s.emoji}</text>
                <text x={s.cx} y={s.cy + 48} textAnchor="middle" fontSize="9" fill={s.stroke} fontFamily="sans-serif">{s.sub}</text>
                <text x={s.cx} y={s.cy + 62} textAnchor="middle" fontSize="11" fontWeight="700" fill={s.stroke} fontFamily="sans-serif">{s.label}</text>
              </g>
            )
          })}
          <g transform={`translate(${px}, ${py + personBob})`}>
            <circle cx={0} cy={-44} r="15" fill="#fef9c3" stroke="#fbbf24" strokeWidth="1.5" opacity="0.9" />
            <text x={0} y={-38} textAnchor="middle" fontSize="12" fontFamily="sans-serif">💬</text>
            <line x1={0} y1={-29} x2={0} y2={-22} stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx={0} cy={-16} r="12" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx={-4} cy={-17} r="1.5" fill="#92400e" />
            <circle cx={4} cy={-17} r="1.5" fill="#92400e" />
            <path d="M-3 -11 Q0 -8 3 -11" fill="none" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
            <rect x={-9} y={-4} width="18" height="16" rx="4" fill="#7c3aed" />
            <line x1={-4} y1={12} x2={-7 + Math.sin(tick * 0.2) * 3} y2={26} stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
            <line x1={4} y1={12} x2={7 - Math.sin(tick * 0.2) * 3} y2={26} stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
            <line x1={-9} y1={0} x2={-18 + Math.sin(tick * 0.2) * 3} y2={10} stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={9} y1={0} x2={18 - Math.sin(tick * 0.2) * 3} y2={10} stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
  },
]

export default function MemoryPalaceOnboarding({ onDone }) {
  const [cur, setCur] = useState(0)
  const [tick, setTick] = useState(0)
  const rafRef = useRef(null)
  const isLast = cur === slides.length - 1

  useEffect(() => {
    let t = 0
    const loop = () => {
      t++
      setTick(t)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const slide = slides[cur]

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card" style={{ background: slide.bg, transition: 'background 0.5s ease' }}>
        {/* Headline */}
        <div className="onboarding-headline-bar" style={{ background: slide.headlineBg }}>
          <span style={{ color: slide.headlineColor }}>{slide.headline}</span>
        </div>

        {/* Animation */}
        <div className="onboarding-visual">
          {slide.render({ tick })}
        </div>

        {/* Caption */}
        <div className="onboarding-caption">
          <span style={{ color: slide.captionColor }}>{slide.caption}</span>
        </div>
      </div>

      {/* Nav */}
      <div className="onboarding-nav">
        <button
          className="btn"
          onClick={() => setCur((cur - 1 + slides.length) % slides.length)}
        >
          ← back
        </button>

        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`onboarding-dot ${i === cur ? 'onboarding-dot--active' : ''}`}
              onClick={() => setCur(i)}
            />
          ))}
        </div>

        {isLast ? (
          <button className="btn btn-primary" onClick={onDone}>
            Choose Your Palace →
          </button>
        ) : (
          <button className="btn" onClick={() => setCur(cur + 1)}>
            next →
          </button>
        )}
      </div>

      <p className="onboarding-counter">slide {cur + 1} of {slides.length}</p>
    </div>
  )
}
