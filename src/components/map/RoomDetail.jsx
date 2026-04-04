export default function RoomDetail({ room, zoneColor, zoneName, onClose }) {
  return (
    <div className="room-detail animate-in">
      <button className="detail-close" onClick={onClose}>✕</button>
      <div className="detail-emoji">{room.emoji}</div>
      <div className="detail-name">{room.name}</div>
      <div className="detail-zone-tag" style={{ color: zoneColor }}>{zoneName}</div>
      <div className="detail-theme">"{room.theme}"</div>
      <p className="detail-desc">{room.description}</p>
      <div className="detail-rule">
        <strong>Route here when:</strong> {room.route_when}
      </div>
    </div>
  )
}
