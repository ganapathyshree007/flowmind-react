import db from './db.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'flowmind-secret-key-2024'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (req.method === 'POST') {
      const { prompt, stepsCount, appsUpdated, timeSaved } = req.body
      db.prepare(`
        INSERT INTO workflow_history 
        (user_id, prompt, steps_count, apps_updated, time_saved) 
        VALUES (?, ?, ?, ?, ?)
      `).run(
        decoded.userId, 
        prompt, 
        stepsCount || 0,
        JSON.stringify(appsUpdated || []),
        timeSaved || 0
      )
      return res.status(200).json({ success: true })
    }

    if (req.method === 'GET') {
      const history = db.prepare(`
        SELECT * FROM workflow_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      `).all(decoded.userId)
      return res.status(200).json({ history })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
