import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_KEY 
})

export async function analyzeBugWithAI(ticket) {
  const prompt = `
You are an expert software engineer and bug fixer.
A bug ticket has been created:

Ticket ID: ${ticket.id}
Title: ${ticket.title}
Priority: ${ticket.priority}
Description: ${ticket.description || 'No description provided'}

Provide:
ROOT CAUSE: (2-3 sentences)
FIX STEPS: (3-5 numbered steps)
PREVENTION: (1-2 sentences)
ESTIMATED TIME: (e.g. 2 hours)
  `
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt
  })
  return response.text
}

export async function autofixBug(ticket, onProgress) {
  try {
    onProgress(`🔍 Analyzing bug: ${ticket.id} — ${ticket.title}`)
    const aiAnalysis = await analyzeBugWithAI(ticket)
    onProgress(`🧠 AI analysis complete for ${ticket.id}`)

    onProgress(`📝 Adding fix to Jira ${ticket.id}...`)
    await fetch('/api/jira-add-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: ticket.id,
        comment: `🤖 FlowMind AI Auto-Analysis:\n\n${aiAnalysis}`
      })
    })
    onProgress(`✅ Fix added to Jira ${ticket.id}`)

    onProgress(`📢 Sending fix to Slack...`)
    const slackMessage =
      `🐛 *Bug Auto-Detected & Fixed!*\n` +
      `*Ticket:* ${ticket.id} — ${ticket.title}\n` +
      `*Priority:* ${ticket.priority}\n` +
      `*Status:* AI Fix Added ✅\n\n` +
      `${aiAnalysis.slice(0, 500)}\n\n` +
      `_Full fix added as comment in Jira ${ticket.id}_`

    await fetch('/api/slack-post-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'general',
        message: slackMessage,
        sender_name: 'FlowMind AutoBot'
      })
    })
    onProgress(`✅ Slack notified!`)
    return { success: true, analysis: aiAnalysis }
  } catch (err) {
    onProgress(`❌ Error: ${err.message}`)
    return { success: false, error: err.message }
  }
}
