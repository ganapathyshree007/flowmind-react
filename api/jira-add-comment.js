export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const { ticketId, comment } = req.body
  const base = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const token = process.env.JIRA_API_TOKEN
  const auth = Buffer.from(`${email}:${token}`).toString('base64')
  try {
    const response = await fetch(
      `${base}/rest/api/3/issue/${ticketId}/comment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: {
            type: 'doc', version: 1,
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: comment }]
            }]
          }
        })
      }
    )
    const data = await response.json()
    res.status(200).json({ success: true, commentId: data.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
