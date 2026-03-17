import { GoogleGenAI } from '@google/genai';
import { workflowSteps } from './data/mockData';

const API_KEY = import.meta.env.VITE_GEMINI_KEY;
const API_BASE = import.meta.env.VITE_API_BASE || '';

// ── Tool declarations ───────────────────────────────────────────────────────

const toolDeclarations = [
  {
    name: 'get_jira_tickets',
    description:
      'Fetch all current open Jira tickets from the board to understand the existing work and priority context before creating new ones.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_jira_ticket',
    description: 'Create a new Jira ticket on the board with a title, priority, and assignee.',
    parameters: {
      type: 'object',
      properties: {
        title:    { type: 'string', description: 'The title/summary of the Jira ticket.' },
        priority: { type: 'string', enum: ['P1','P2','P3'], description: 'Ticket priority.' },
        assignee: { type: 'string', description: 'Person or team to assign the ticket to.' },
      },
      required: ['title','priority','assignee'],
    },
  },
  {
    name: 'post_slack_message',
    description: 'Post a message to a Slack channel on behalf of a sender.',
    parameters: {
      type: 'object',
      properties: {
        channel:     { type: 'string', description: 'Slack channel, e.g. #dev-alerts' },
        message:     { type: 'string', description: 'Full text of the message.' },
        sender_name: { type: 'string', description: 'Display name of sender.' },
      },
      required: ['channel','message','sender_name'],
    },
  },
  {
    name: 'create_notion_page',
    description: 'Create or update a Notion page with a title and body content.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Page title.' },
        body:  { type: 'string', description: 'Page body content.' },
      },
      required: ['title','body'],
    },
  },
  {
    name: 'send_email',
    description: 'Send an email to a recipient with a subject and body.',
    parameters: {
      type: 'object',
      properties: {
        to:      { type: 'string', description: 'Recipient email address.' },
        subject: { type: 'string', description: 'Subject line.' },
        body:    { type: 'string', description: 'Email body.' },
      },
      required: ['to','subject','body'],
    },
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function nowTime() {
  const d = new Date();
  const h = d.getHours(), m = d.getMinutes();
  return `${h}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function initials(name) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function nextTicketId(jira) {
  const nums = jira.map(t => parseInt(t.id.replace(/\D/g,''),10)).filter(n => !isNaN(n));
  return `KAN-${(nums.length ? Math.max(...nums) : 5) + 1}`;
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Real API tool executor ───────────────────────────────────────────────────

async function executeTool(toolName, toolArgs, currentState) {
  if (toolName === 'get_jira_tickets') {
    try {
      const res = await fetch(`${API_BASE}/api/jira-get-tickets`)
      const data = await res.json()
      const tickets = data.tickets || []
      const updatedState = { ...currentState, jira: tickets, jiraTickets: tickets }
      const list = tickets.map(t => `${t.id} [${t.priority}] "${t.title}" — ${t.assignee}`).join('\n')
      return { result: `Open tickets (${tickets.length}):\n${list}`, updatedState }
    } catch (err) {
      console.error('[FlowMind] get_jira_tickets failed:', err);
      return { result: 'Failed to fetch Jira tickets.', updatedState: null };
    }
  }

  if (toolName === 'create_jira_ticket') {
    try {
      const res = await fetch(`${API_BASE}/api/jira-create-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolArgs),
      });
      const data = await res.json();
      const newTicket = data.ticket;
      const updatedState = { ...currentState, jira: [newTicket, ...currentState.jira] };
      return {
        result: `Ticket ${newTicket.id} created: "${newTicket.title}" [${newTicket.priority}] → ${newTicket.assignee}`,
        updatedState,
      };
    } catch (err) {
      console.error('[FlowMind] create_jira_ticket failed:', err);
      return { result: 'Failed to create Jira ticket.', updatedState: null };
    }
  }

  if (toolName === 'post_slack_message') {
    try {
      await fetch(`${API_BASE}/api/slack-post-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolArgs),
      });
      const newMsg = {
        user: toolArgs.sender_name || 'FlowMind AI',
        init: initials(toolArgs.sender_name || 'FlowMind AI'),
        color: ['#00d4aa','#4da6ff','#f0b429','#ff4f6d','#a78bfa'][Math.floor(Math.random() * 5)],
        msg: toolArgs.message,
        time: nowTime(),
        channel: toolArgs.channel,
      };
      const updatedState = { ...currentState, slack: [...currentState.slack, newMsg] };
      return {
        result: `Message posted to ${toolArgs.channel} by ${toolArgs.sender_name}.`,
        updatedState,
      };
    } catch (err) {
      console.error('[FlowMind] post_slack_message failed:', err);
      return { result: 'Failed to post Slack message.', updatedState: null };
    }
  }

  if (toolName === 'create_notion_page') {
    return { result: `Notion page "${toolArgs.title}" created.`, updatedState: { ...currentState, notion: { title: toolArgs.title, body: toolArgs.body } } };
  }

  if (toolName === 'send_email') {
    return { result: `Email sent to ${toolArgs.to} — Subject: "${toolArgs.subject}".`, updatedState: null };
  }

  return { result: `Unknown tool: ${toolName}`, updatedState: null };
}

const TOOL_META = {
  get_jira_tickets:   { title: 'Fetching Jira board',   emoji: '📋' },
  create_jira_ticket: { title: 'Creating Jira ticket',   emoji: '🎫' },
  post_slack_message: { title: 'Posting to Slack',       emoji: '💬' },
  create_notion_page: { title: 'Writing Notion page',    emoji: '📝' },
  send_email:         { title: 'Sending email',          emoji: '📧' },
};

// ── Scenario detector for fallback ──────────────────────────────────────────

function detectScenario(input) {
  const t = input.toLowerCase();
  if (t.includes('bug') || t.includes('crash') || t.includes('login')) return 'bug';
  if (t.includes('sprint') || t.includes('review') || t.includes('digest')) return 'sprint';
  if (t.includes('onboard') || t.includes('new engineer') || t.includes('priya')) return 'onboard';
  if (t.includes('down') || t.includes('outage') || t.includes('payment') || t.includes('incident')) return 'incident';
  if (t.includes('feedback') || t.includes('complaint') || t.includes('slow')) return 'feedback';
  return 'bug';
}

// ── Fallback: scripted mock run ──────────────────────────────────────────────

async function runFallback(userPrompt, currentState, onStepUpdate, onStateChange) {
  const scenario = detectScenario(userPrompt);
  const steps = workflowSteps[scenario] || workflowSteps.bug;
  let liveState = { ...currentState };

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    onStepUpdate({ id: i, tool: s.tool, title: s.title, desc: s.desc, status: 'thinking' });
    await delay(s.delay || 800);

    if (s.action) {
      // Adapt old action(state, setState) signature to our pattern
      s.action(liveState, (updater) => {
        const next = typeof updater === 'function' ? updater(liveState) : updater;
        const partial = {};
        if (next.jira !== liveState.jira)     partial.jira   = next.jira;
        if (next.slack !== liveState.slack)    partial.slack  = next.slack;
        if (next.notion !== liveState.notion)  partial.notion = next.notion;
        liveState = next;
        if (Object.keys(partial).length) onStateChange(partial);
      });
    }

    onStepUpdate({ id: i, tool: s.tool, title: s.title, desc: s.desc, status: 'done' });
  }

  return `Workflow complete — ${steps.length} steps executed for "${scenario}" scenario.`;
}

// ── Main agent function ──────────────────────────────────────────────────────

/**
 * runAgent — tries the real Gemini API first; falls back to scripted mock on quota/network errors.
 */
export async function runAgent(userPrompt, currentState, onStepUpdate, onStateChange) {
  if (!API_KEY || API_KEY.includes('PASTE_YOUR_KEY')) {
    return runFallback(userPrompt, currentState, onStepUpdate, onStateChange);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemInstruction =
    'You are FlowMind, an AI workflow automation agent. ' +
    'Break tasks into steps, call tools in sequence, and explain each step before calling it. ' +
    'Only use tools from the provided list. ' +
    'Always call get_jira_tickets before creating any new Jira ticket. ' +
    'Be concise but informative in your reasoning. ' +
    'After all tools are done, write a short success summary for the user.';

  const contents = [{ role: 'user', parts: [{ text: userPrompt }] }];

  let liveState = {
    jira:   [...currentState.jira],
    slack:  [...currentState.slack],
    notion: { ...currentState.notion },
  };

  let stepIndex = 0;

  try {
    for (let turn = 0; turn < 20; turn++) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: toolDeclarations }],
          maxOutputTokens: 1024,
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error('No candidate returned from Gemini.');

      const parts = candidate.content?.parts ?? [];
      contents.push({ role: 'model', parts });

      const fnCalls = parts.filter(p => p.functionCall);

      if (fnCalls.length === 0) {
        return parts.map(p => p.text ?? '').join('').trim();
      }

      const functionResponses = [];

      for (const part of fnCalls) {
        const { name, args } = part.functionCall;
        const meta = TOOL_META[name] ?? { title: name, emoji: '⚙️' };
        const stepId = stepIndex++;

        onStepUpdate({ id: stepId, tool: name, title: `${meta.emoji} ${meta.title}`, desc: `Calling ${name}…`, status: 'thinking' });
        await delay(700);

        const { result, updatedState } = await executeTool(name, args, liveState);
        if (updatedState) { liveState = { ...liveState, ...updatedState }; onStateChange(updatedState); }

        onStepUpdate({ id: stepId, tool: name, title: `${meta.emoji} ${meta.title}`, desc: result, status: 'done' });
        functionResponses.push({ functionResponse: { name, response: { result } } });
      }

      contents.push({ role: 'user', parts: functionResponses });
    }

    return 'Workflow completed.';

  } catch (err) {
    // On quota exhaustion or any API error → fall back to scripted demo
    const isQuota = err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota');
    const is404   = err?.message?.includes('NOT_FOUND') || err?.message?.includes('404');

    if (isQuota || is404) {
      console.warn('[FlowMind] API quota/model issue — switching to demo mode:', err.message);
      // Show a notice step then run the scripted fallback
      onStepUpdate({
        id: stepIndex++,
        tool: 'info',
        title: '⚡ Demo Mode',
        desc: 'API quota reached — running scripted demo to show the full workflow.',
        status: 'done',
      });
      await delay(400);
      return runFallback(userPrompt, currentState, onStepUpdate, onStateChange);
    }

    throw err; // re-throw unexpected errors
  }
}
