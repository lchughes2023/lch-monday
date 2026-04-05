const TABS = [
  { id: 'map',      emoji: '🗺',  label: 'Map'     },
  { id: 'route',    emoji: '🎮',  label: 'Route'   },
  { id: 'quiz',     emoji: '🧠',  label: 'Quiz'    },
  { id: 'journal',  emoji: '📓',  label: 'Log'     },
  { id: 'progress', emoji: '📊',  label: 'Stats'   },
  { id: 'builder',  emoji: '🏗',  label: 'Build'   },
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
          <span className="tab-emoji">{tab.emoji}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
