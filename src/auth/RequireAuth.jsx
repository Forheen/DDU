import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export function RequireAuth({ portal, children }) {
  const { currentUser, portal: activePortal, ready } = useAuth()

  if (!ready) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (portal && activePortal !== portal) return <Navigate to="/login" replace />
  return children
}
