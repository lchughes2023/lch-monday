import { useState } from 'react'
import { usePalace } from '../../contexts/PalaceContext'
import BrainGraph from '../brain/BrainGraph'
import BlueprintView from './BlueprintView'
import ZoneView from './ZoneView'
import ListView from './ListView'
import RoomDetail from './RoomDetail'

export default function PalaceMap() {
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('neural')
  const { rooms, zones, roomsById, palace } = usePalace()

  const selected = selectedId ? roomsById[selectedId] : null
  const selectedZone = selected ? zones.find((z) => z.id === selected.zone_id) : null

  return (
    <div className="palace-map">
      <h2 className="section-title">🏠 {palace?.name || 'Palace Map'}</h2>
      <p className="section-subtitle">
        {rooms.length} rooms · {zones.length} cognitive zones — click any node to explore
      </p>

      <div className="map-toolbar">
        <button
          className={`btn btn-sm ${view === 'neural' ? 'btn-primary' : ''}`}
          onClick={() => setView('neural')}
        >
          🧠 Neural
        </button>
        <button
          className={`btn btn-sm ${view === 'blueprint' ? 'btn-primary' : ''}`}
          onClick={() => setView('blueprint')}
        >
          🏗 Blueprint
        </button>
        <button
          className={`btn btn-sm ${view === 'zone' ? 'btn-primary' : ''}`}
          onClick={() => setView('zone')}
        >
          Zones
        </button>
        <button
          className={`btn btn-sm ${view === 'list' ? 'btn-primary' : ''}`}
          onClick={() => setView('list')}
        >
          List
        </button>
      </div>

      {view === 'neural' && (
        <BrainGraph selectedId={selectedId} onSelect={setSelectedId} />
      )}
      {view === 'blueprint' && (
        <BlueprintView selectedId={selectedId} onSelect={setSelectedId} />
      )}
      {view === 'zone' && (
        <ZoneView selectedId={selectedId} onSelect={setSelectedId} />
      )}
      {view === 'list' && (
        <ListView selectedId={selectedId} onSelect={setSelectedId} />
      )}

      {selected && (
        <RoomDetail
          room={selected}
          zoneColor={selectedZone?.color || '#64b4ff'}
          zoneName={selectedZone?.name || ''}
          onClose={() => setSelectedId(null)}
        />
      )}

      <div className="route-summary">
        <h3>The Stable Route</h3>
        <div className="route-path">
          {rooms.map((room, i) => (
            <span key={room.id}>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedId(room.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                {room.emoji} {room.name}
              </span>
              {i < rooms.length - 1 && <span className="route-arrow"> → </span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
