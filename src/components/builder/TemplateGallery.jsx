import { useState } from 'react'
import { TEMPLATES } from '../../data/templates'
import { seedPalaceFromTemplate } from '../../lib/seedPalace'
import { useAuth } from '../../contexts/AuthContext'
import { usePalace } from '../../contexts/PalaceContext'

export default function TemplateGallery({ onCreated }) {
  const { user } = useAuth()
  const { activatePalace } = usePalace()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSelect(template) {
    setLoading(true)
    setError(null)
    try {
      const palace = await seedPalaceFromTemplate(user.id, template)
      await activatePalace(palace.id)
      onCreated()
    } catch (err) {
      console.error(err)
      setError('Something went wrong creating your palace. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="template-gallery">
      <h2 className="section-title">🏗 Build Your Palace</h2>
      <p className="section-subtitle">
        Choose a template to start from. You can customize everything afterward.
      </p>

      {error && <div className="error-msg">{error}</div>}

      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            className="template-card"
            onClick={() => handleSelect(t)}
            disabled={loading}
          >
            <div className="template-emoji">{t.emoji}</div>
            <div className="template-name">{t.name}</div>
            <div className="template-preview">{t.preview}</div>
            <div className="template-desc">{t.description}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-msg">Creating your palace…</div>
      )}
    </div>
  )
}
