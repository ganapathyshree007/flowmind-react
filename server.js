import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(express.json())

import jiraGetTickets from './api/jira-get-tickets.js'
import jiraCreateTicket from './api/jira-create-ticket.js'
import jiraGetNew from './api/jira-get-new-tickets.js'
import jiraAddComment from './api/jira-add-comment.js'
import slackPost from './api/slack-post-message.js'

app.all('/api/jira-get-tickets', jiraGetTickets)
app.all('/api/jira-create-ticket', jiraCreateTicket)
app.all('/api/jira-get-new-tickets', jiraGetNew)
app.all('/api/jira-add-comment', jiraAddComment)
app.all('/api/slack-post-message', slackPost)

app.listen(3001, () => {
  console.log('API server running on port 3001')
})
