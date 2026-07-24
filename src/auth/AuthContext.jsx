import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getUser } from '../services/userRepository.js'
import { ROLES, PORTAL } from '../models/index.js'

const SESSION_KEY = 'aja-ddu-builder:session:v1'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeRole, setActiveRole] = useState(null)
  const [portal, setPortal] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      setReady(true)
      return
    }
    try {
      const { userId, role, portal: p } = JSON.parse(raw)
      getUser(userId).then((u) => {
        if (u) {
          setCurrentUser(u)
          setActiveRole(role)
          setPortal(p)
        }
        setReady(true)
      })
    } catch {
      setReady(true)
    }
  }, [])

  const login = useCallback(async (userId, role) => {
    const u = await getUser(userId)
    if (!u) throw new Error('Unknown user')
    const p = role === ROLES.ADMIN ? PORTAL.ADMIN : PORTAL.FIELD
    setCurrentUser(u)
    setActiveRole(role)
    setPortal(p)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, role, portal: p }))
    return u
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setActiveRole(null)
    setPortal(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const switchRole = useCallback(
    (role) => {
      if (!currentUser) return
      const p = role === ROLES.ADMIN ? PORTAL.ADMIN : PORTAL.FIELD
      setActiveRole(role)
      setPortal(p)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: currentUser.id, role, portal: p }))
    },
    [currentUser],
  )

  return (
    <AuthContext.Provider value={{ currentUser, activeRole, portal, ready, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
