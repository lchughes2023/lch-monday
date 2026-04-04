const TABS = [
  { id: 'map', label: '🗺 Palace Map' },
  { id: 'route', label: '🎮 Route-It' },
  { id: 'quiz', label: '🧠 Quiz' },
  { id: 'journal', label: '📓 Idea Log' },
  { id: 'progress', label: '📊 Progress' },
  { id: 'builder', label: '🏗 Builder' },
]

export default function NavTabs({ screen, setScreen }) {
  return (
    <nav className="app-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${screen === tab.id ? 'active' : ''}`}
          onClick={() => setScreen(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
