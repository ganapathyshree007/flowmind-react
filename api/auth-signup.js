import db from './db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'flowmind-secret-key-2024'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ 
      error: 'Name, email and password are required' 
    })
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters' 
    })
  }

  try {
    const existing = db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(email)
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name, email, hashedPassword)

    const token = jwt.sign(
      { userId: result.lastInsertRowid, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    db.prepare(
      'INSERT INTO sessions (user_id, token) VALUES (?, ?)'
    ).run(result.lastInsertRowid, token)

    res.status(200).json({ 
      success: true,
      token,
      user: { 
        id: result.lastInsertRowid, 
        name, 
        email 
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
