import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { PalaceProvider } from './contexts/PalaceContext'
import AppShell from './components/layout/AppShell'
import LoginScreen from './components/auth/LoginScreen'
import './App.css'

function AppContent() {
  const { user, authLoading } = useAuth()

  if (authLoading) return null
  if (!user) return <LoginScreen />

  return (
    <ProgressProvider>
      <PalaceProvider>
        <div className="app">
          <AppShell />
        </div>
      </PalaceProvider>
    </ProgressProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
