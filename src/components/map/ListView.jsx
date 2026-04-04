import { usePalace } from '../../contexts/PalaceContext'

export default function ListView({ selectedId, onSelect }) {
  const { rooms, zones } = usePalace()

  const zoneById = {}
  zones.forEach((z) => { zoneById[z.id] = z })

  return (
    <div className="room-list">
      {rooms.map((room) => {
        const zone = zoneById[room.zone_id]
        const color = zone?.color || '#64b4ff'
        return (
          <div
            key={room.id}
            className={`room-row ${selectedId === room.id ? 'selected' : ''}`}
            onClick={() => onSelect(selectedId === room.id ? null : room.id)}
            style={selectedId === room.id ? { borderColor: color } : {}}
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
  )
}
