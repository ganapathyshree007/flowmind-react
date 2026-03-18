import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('flowmind_token')
    const savedUser = localStorage.getItem('flowmind_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function logout() {
    localStorage.removeItem('flowmind_token')
    localStorage.removeItem('flowmind_user')
    setUser(null)
    navigate('/login')
  }

  function getToken() {
    return localStorage.getItem('flowmind_token')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, getToken, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
