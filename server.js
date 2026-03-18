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
import authSignup from './api/auth-signup.js'
import authLogin from './api/auth-login.js'
import authVerify from './api/auth-verify.js'
import saveWorkflow from './api/save-workflow.js'
import getLocation from './api/get-location.js'
import getNews from './api/get-news.js'

app.all('/api/jira-get-tickets', jiraGetTickets)
app.all('/api/jira-create-ticket', jiraCreateTicket)
app.all('/api/jira-get-new-tickets', jiraGetNew)
app.all('/api/jira-add-comment', jiraAddComment)
app.all('/api/slack-post-message', slackPost)
app.all('/api/auth-signup', authSignup)
app.all('/api/auth-login', authLogin)
app.all('/api/auth-verify', authVerify)
app.all('/api/save-workflow', saveWorkflow)
app.all('/api/get-location', getLocation)
app.all('/api/get-news', getNews)

app.listen(3001, () => {
  console.log('API server running on port 3001')
})
