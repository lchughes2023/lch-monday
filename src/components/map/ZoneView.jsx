import { usePalace } from '../../contexts/PalaceContext'

export default function ZoneView({ selectedId, onSelect }) {
  const { zones, rooms } = usePalace()

  return (
    <div className="zone-grid">
      {zones.map((zone) => {
        const zoneRooms = rooms.filter((r) => r.zone_id === zone.id)
        return (
          <div
            key={zone.id}
            className="zone-card"
            style={{ borderColor: zone.color + '88', background: zone.color + '14' }}
          >
            <div className="zone-header">
              <span className="zone-name" style={{ color: zone.color }}>{zone.name}</span>
            </div>
            <div className="zone-rooms">
              {zoneRooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-chip ${selectedId === room.id ? 'selected' : ''}`}
                  onClick={() => onSelect(selectedId === room.id ? null : room.id)}
                >
                  <span>{room.emoji}</span>
                  <span>{room.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
