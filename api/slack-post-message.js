export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const { channel, message, sender_name } = req.body
  const token = process.env.SLACK_BOT_TOKEN
  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: `#${channel}`,
        text: `*${sender_name || 'FlowMind AI'}*: ${message}`,
        username: 'FlowMind',
        icon_emoji: ':zap:'
      })
    })
    const data = await response.json()
    if (!data.ok) throw new Error(data.error)
    res.status(200).json({ success: true, ts: data.ts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
