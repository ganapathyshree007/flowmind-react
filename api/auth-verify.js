import db from './db.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'flowmind-secret-key-2024'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare(
      'SELECT id, name, email, created_at FROM users WHERE id = ?'
    ).get(decoded.userId)

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.status(200).json({ success: true, user })
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
