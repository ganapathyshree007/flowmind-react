import db from './db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'flowmind-secret-key-2024'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password required' 
    })
  }

  try {
    const user = db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).get(email)

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    db.prepare(
      'INSERT INTO sessions (user_id, token) VALUES (?, ?)'
    ).run(user.id, token)

    res.status(200).json({ 
      success: true,
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
