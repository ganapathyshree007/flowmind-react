import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GeoAlert({ userEmail }) {
  const [location, setLocation] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    async function fetchLocation() {
      try {
        const cached = sessionStorage.getItem('flowmind_location')
        if (cached) {
          setLocation(JSON.parse(cached))
          setShow(true)
          return
        }

        const res = await fetch('/api/get-location')
        const data = await res.json()

        if (data.success) {
          sessionStorage.setItem(
            'flowmind_location', 
            JSON.stringify(data)
          )
          setLocation(data)
          setShow(true)

          setTimeout(() => setShow(false), 6000)
        }
      } catch (err) {
        console.log('Location fetch failed:', err.message)
      }
    }

    if (userEmail) fetchLocation()
  }, [userEmail])

  return (
    <AnimatePresence>
      {show && location && (
        <motion.div
          initial={{ opacity: 0, y: -60, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -60, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            zIndex: 9999,
            background: '#111118',
            border: '1px solid #7C3AED',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
            minWidth: '300px'
          }}
        >
          <span style={{ fontSize: '20px' }}>📍</span>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '500',
              color: 'white' 
            }}>
              Login detected from {location.city}, {location.country}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#9ca3af',
              marginTop: '2px'
            }}>
              {location.isp} · {location.timezone}
            </div>
          </div>
          {location.flag && (
            <img 
              src={location.flag} 
              alt={location.country}
              style={{ borderRadius: '2px' }}
            />
          )}
          <button
            onClick={() => setShow(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px'
            }}
          >×</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
