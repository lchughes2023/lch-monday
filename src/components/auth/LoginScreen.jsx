import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="login-screen">
        <div className="login-card animate-in">
          <div className="login-icon">📬</div>
          <h2 className="login-title">Check your email</h2>
          <p className="login-text">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="login-hint">Click the link to sign in — no password needed.</p>
          <button className="btn" onClick={() => setSent(false)}>
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <div className="login-card animate-in">
        <div className="login-icon">🏠</div>
        <h1 className="login-title">Memory Palace OS</h1>
        <p className="login-subtitle">Cognitive Architecture Trainer</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            className="login-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading || !email.trim()}
          >
            {loading ? 'Sending…' : 'Send Magic Link →'}
          </button>
        </form>
      </div>
    </div>
  )
}
