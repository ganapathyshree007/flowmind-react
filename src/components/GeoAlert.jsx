import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GeoAlert({ userEmail }) {
  const [location, setLocation] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    async function getLocation() {
      try {
        const cached = sessionStorage.getItem('flowmind_geo')
        if (cached) {
          setLocation(JSON.parse(cached))
          setShow(true)
          setTimeout(() => setShow(false), 7000)
          return
        }

        const res = await fetch('/api/get-location')
        const data = await res.json()

        if (data.success) {
          sessionStorage.setItem(
            'flowmind_geo',
            JSON.stringify(data)
          )
          setLocation(data)
          setShow(true)
          setTimeout(() => setShow(false), 7000)
        }
      } catch (err) {
        console.log('GeoAlert error:', err.message)
      }
    }

    if (userEmail) getLocation()
  }, [userEmail])

  return (
    <AnimatePresence>
      {show && location && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          style={{
            position: 'fixed',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#111118',
            border: '1px solid #7C3AED',
            borderRadius: '14px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(124,58,237,0.25)',
            minWidth: '320px',
            maxWidth: '480px'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(124,58,237,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0
          }}>
            📍
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '500',
              color: 'white',
              marginBottom: '3px'
            }}>
              Login detected from {location.city}, {location.region}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {location.flag && (
                <img
                  src={location.flag}
                  alt={location.country}
                  style={{ 
                    borderRadius: '2px',
                    width: '16px',
                    height: '12px'
                  }}
                />
              )}
              <span>{location.isp}</span>
              <span style={{ color: '#333' }}>·</span>
              <span>{location.timezone}</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            flexShrink: 0
          }}>
            <span style={{
              fontSize: '11px',
              background: 'rgba(124,58,237,0.2)',
              color: '#a78bfa',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: '500'
            }}>
              🔐 Secure Login
            </span>
            <button
              onClick={() => setShow(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#555',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: 0
              }}
            >×</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
