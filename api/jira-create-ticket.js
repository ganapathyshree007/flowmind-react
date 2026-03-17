export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const { title, priority, assignee } = req.body
  const base = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const token = process.env.JIRA_API_TOKEN
  const project = process.env.JIRA_PROJECT_KEY
  const auth = Buffer.from(`${email}:${token}`).toString('base64')
  const priorityMap = {
    'P1':'Highest','P2':'High','P3':'Medium','P4':'Low','P5':'Lowest'
  }
  try {
    const response = await fetch(`${base}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          project: { key: project },
          summary: title,
          issuetype: { name: 'Task' },
          priority: { name: priorityMap[priority] || 'Medium' },
          description: {
            type: 'doc', version: 1,
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', 
              text: `Created by FlowMind AI. Assignee: ${assignee}` }]
            }]
          }
        }
      })
    })
    const data = await response.json()
    res.status(200).json({ 
      ticket: { id: data.key, title, priority, assignee, status: 'Open' } 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
