export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const base = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const token = process.env.JIRA_API_TOKEN
  const project = process.env.JIRA_PROJECT_KEY
  const auth = Buffer.from(`${email}:${token}`).toString('base64')
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      .toISOString().slice(0, 16).replace('T', ' ')
    const response = await fetch(
      `${base}/rest/api/3/search/jql?jql=project=${project} AND created>="${fiveMinutesAgo}" ORDER BY created DESC&fields=summary,status,priority,description&maxResults=5`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }
    )
    const data = await response.json()
    const tickets = (data.issues || []).map(issue => ({
      id: issue.key,
      title: issue.fields.summary,
      priority: issue.fields.priority?.name || 'Medium',
      status: issue.fields.status?.name || 'Open',
      description: issue.fields.description?.content?.[0]
        ?.content?.[0]?.text || ''
    }))
    res.status(200).json({ tickets })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
