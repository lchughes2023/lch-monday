export default function XpPopup({ amount, id }) {
  return (
    <div key={id} className="xp-popup">
      +{amount} XP
    </div>
  )
}
