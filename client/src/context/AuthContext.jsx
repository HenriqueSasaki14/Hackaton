import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Tenta recuperar o usuário atual ao montar (token persistido)
  useEffect(() => {
    const token = localStorage.getItem('poussin_token')
    if (!token) { setLoading(false); return }

    authApi.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('poussin_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('poussin_token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password)
    localStorage.setItem('poussin_token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('poussin_token')
    setUser(null)
  }, [])

  // Atualiza dados do usuário localmente (após completar atividade, etc.)
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('poussin_token')
    if (!token) return
    try {
      const fresh = await authApi.me()
      setUser(fresh)
    } catch { /* silencioso */ }
  }, [])

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
