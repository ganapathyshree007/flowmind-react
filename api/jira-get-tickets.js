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
    const response = await fetch(
      `${base}/rest/api/3/search/jql?jql=project=${project} ORDER BY created DESC&maxResults=10&fields=summary,status,priority,assignee`,
      { headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' } }
    )
    const data = await response.json()
    const tickets = data.issues.map(issue => ({
      id: issue.key,
      title: issue.fields.summary,
      priority: issue.fields.priority?.name || 'Medium',
      status: issue.fields.status?.name || 'Open',
      assignee: issue.fields.assignee?.displayName || 'Unassigned'
    }))
    res.status(200).json({ tickets })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
