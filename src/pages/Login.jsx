import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('flowmind_token', data.token)
        localStorage.setItem('flowmind_user', 
          JSON.stringify(data.user))
        fetch('/api/get-location')
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              sessionStorage.setItem(
                'flowmind_location',
                JSON.stringify(data)
              )
              console.log('Login from:', data.city, data.country)
            }
          })
        navigate('/dashboard')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Connection error. Is the server running?')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#111118',
          border: '1px solid #1e1e2e',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            ⚡ FlowMind
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: '#1a0a0a',
              border: '1px solid #7f1d1d',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              color: '#9ca3af', 
              fontSize: '13px', 
              display: 'block',
              marginBottom: '6px' 
            }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '10px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              color: '#9ca3af', 
              fontSize: '13px',
              display: 'block',
              marginBottom: '6px' 
            }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                background: '#0a0a0f',
                border: '1px solid #2a2a3e',
                borderRadius: '10px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </motion.button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: '#9ca3af',
          fontSize: '13px'
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#7C3AED' }}>
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
