// Mock data for FlowMind — all fake, realistic-looking enterprise data

export const initialJira = [
  { id: 'FLW-101', title: 'Login page crashes on mobile Safari', priority: 'P1', assignee: 'Arjun K', status: 'open', created: '2 hours ago' },
  { id: 'FLW-102', title: 'Dashboard widget load time > 8s', priority: 'P2', assignee: 'Priya S', status: 'open', created: '4 hours ago' },
  { id: 'FLW-103', title: 'Dark mode toggle not persisting across sessions', priority: 'P3', assignee: 'Rohit M', status: 'open', created: 'Yesterday' },
  { id: 'FLW-104', title: 'CSV export corrupts special characters', priority: 'P2', assignee: 'Meena R', status: 'open', created: 'Yesterday' },
  { id: 'FLW-105', title: 'Push notification delay on Android 14', priority: 'P3', assignee: 'Dev T', status: 'open', created: '2 days ago' },
];

export const initialSlack = [
  { user: 'Arjun Kumar', init: 'AK', color: '#00d4aa', msg: 'Hey team — has anyone seen the login crash on iOS? Getting reports from 400+ users.', time: '9:31 AM', channel: '#dev-alerts' },
  { user: 'Priya Sharma', init: 'PS', color: '#4da6ff', msg: 'Yeah I can reproduce it. Same issue on Safari 17. Seems like a JWT expiry handling bug.', time: '9:33 AM', channel: '#dev-alerts' },
  { user: 'Rohit Mehta', init: 'RM', color: '#f0b429', msg: 'Should we escalate to P1? Looks like 400+ users affected based on Sentry.', time: '9:35 AM', channel: '#dev-alerts' },
  { user: 'FlowMind AI', init: 'FM', color: '#ff4f6d', msg: 'Escalation in progress. Creating P1 Jira ticket and notifying on-call team.', time: '9:36 AM', channel: '#dev-alerts' },
];

export const initialNotion = {
  title: 'Engineering — Incident & Operations Log',
  body: 'All production incidents are tracked here automatically by FlowMind AI. Each entry includes a timestamp, affected user count, severity classification, assigned engineer, and resolution timeline.',
};

export const workflowDemos = {
  bug: `We have a critical login crash affecting 400+ users on mobile Safari. Create a P1 Jira ticket assigned to Arjun K, post an urgent alert on Slack #dev-alerts, and create a Notion incident report with full details.`,
  sprint: `It's Friday — please create a sprint review Jira ticket, post the weekly engineering digest on Slack #general, and update the Notion sprint board with this week's completed items and velocity.`,
  onboard: `New engineer joins Monday — Priya Nair, Frontend Developer. Create a Jira onboarding ticket with P2 priority, send a welcome message on Slack #team-general, and create a Notion onboarding page.`,
  incident: `Production is down! Payment service returning 500 errors for 10+ minutes. P1 escalation: create Jira ticket, page on-call team on Slack #incidents, create Notion post-mortem template immediately.`,
  feedback: `We received 50 negative reviews about slow dashboard load time this week. Create a P2 Jira ticket, share the feedback summary on Slack #product, update the Notion customer feedback log.`,
};

export const workflowSteps = {
  bug: [
    { tool: 'get_jira_tickets', title: 'Fetching current Jira board', desc: 'Reading all open tickets to understand priority context before creating a new one.', delay: 600 },
    { tool: 'analyze_severity', title: 'Analysing issue severity', desc: '400+ affected users + mobile Safari crash = critical P1. Assigning to Arjun K (mobile specialist).', delay: 1000 },
    { tool: 'create_jira_ticket', title: 'Creating P1 Jira ticket', desc: 'Ticket FLW-106 created: "Critical login crash — Safari mobile, 400+ users affected"', delay: 900,
      action: (state, setState) => { setState(s => ({ ...s, jira: [...s.jira, { id: 'FLW-106', title: 'Critical login crash — Safari mobile, 400+ users', priority: 'P1', assignee: 'Arjun K', status: 'open', created: 'Just now' }] })); }
    },
    { tool: 'post_slack_message', title: 'Alerting team on Slack', desc: 'Posting P1 alert in #dev-alerts with ticket link and tagging on-call engineer.', delay: 800,
      action: (state, setState) => { setState(s => ({ ...s, slack: [...s.slack, { user: 'FlowMind AI', init: 'FM', color: '#ff4f6d', msg: '🚨 P1 ALERT: Login crash on mobile Safari — 400+ users. Ticket FLW-106 created. @Arjun K investigate immediately!', time: now(), channel: '#dev-alerts' }] })); }
    },
    { tool: 'create_notion_page', title: 'Writing incident report in Notion', desc: 'Incident log entry created with timestamp, severity, platform details, and investigation timeline.', delay: 1000,
      action: (state, setState) => { setState(s => ({ ...s, notion: { title: '🚨 Incident: Login Crash — ' + today(), body: 'Severity: P1 | Affected: 400+ users | Platform: Safari iOS 17+\nStatus: Under investigation by Arjun K.\nTimeline: First report 9:31 AM. FlowMind escalated at 9:36 AM.' } })); }
    },
  ],
  sprint: [
    { tool: 'get_jira_tickets', title: 'Pulling sprint tickets', desc: 'Reading all closed tickets from Sprint 23 to compile the digest.', delay: 700 },
    { tool: 'create_jira_ticket', title: 'Creating Sprint Review ticket', desc: 'Sprint 23 review & retrospective ticket created with all completed work items.', delay: 900,
      action: (state, setState) => { setState(s => ({ ...s, jira: [...s.jira, { id: 'FLW-107', title: 'Sprint 23 Review & Retrospective', priority: 'P3', assignee: 'Team', status: 'open', created: 'Just now' }] })); }
    },
    { tool: 'post_slack_message', title: 'Posting weekly digest to Slack', desc: 'Sending formatted sprint summary to #general with highlights and velocity stats.', delay: 800,
      action: (state, setState) => { setState(s => ({ ...s, slack: [...s.slack, { user: 'FlowMind AI', init: 'FM', color: '#ff4f6d', msg: '📊 Sprint 23 Digest: 12 tickets closed ✅ | Velocity: 48pts | 2 carried over | Great work team! 🎉', time: now(), channel: '#general' }] })); }
    },
    { tool: 'create_notion_page', title: 'Updating Notion sprint board', desc: 'Sprint 23 retrospective page created with velocity, highlights, and team notes.', delay: 900,
      action: (state, setState) => { setState(s => ({ ...s, notion: { title: 'Sprint 23 — Review Board', body: 'Completed: 12 items | Velocity: 48pts | Carryover: 2 stories\nHighlights: Login performance +40%, dark mode shipped.\nRetro note: Need earlier QA involvement next sprint.' } })); }
    },
  ],
  onboard: [
    { tool: 'get_jira_tickets', title: 'Checking onboarding template', desc: 'Fetching standard new-hire onboarding template from the Jira project.', delay: 600 },
    { tool: 'create_jira_ticket', title: 'Creating onboarding Jira ticket', desc: 'Ticket FLW-108 created for Priya Nair — Frontend Developer starting Monday.', delay: 900,
      action: (state, setState) => { setState(s => ({ ...s, jira: [...s.jira, { id: 'FLW-108', title: 'Onboarding: Priya Nair — Frontend Developer', priority: 'P2', assignee: 'HR Team', status: 'open', created: 'Just now' }] })); }
    },
    { tool: 'post_slack_message', title: 'Sending welcome message on Slack', desc: 'Warm welcome posted to #team-general with her start date and role details.', delay: 800,
      action: (state, setState) => { setState(s => ({ ...s, slack: [...s.slack, { user: 'FlowMind AI', init: 'FM', color: '#ff4f6d', msg: '👋 Welcome to the team, Priya Nair! She joins us Monday as Frontend Developer. Give her a warm welcome! 🎉', time: now(), channel: '#team-general' }] })); }
    },
    { tool: 'create_notion_page', title: 'Creating Notion onboarding page', desc: 'Page created with role details, start date, mentor, and first-week checklist.', delay: 1000,
      action: (state, setState) => { setState(s => ({ ...s, notion: { title: 'Onboarding: Priya Nair', body: 'Role: Frontend Developer | Start: Monday\nMentor: Arjun K | Team: Frontend Platform\nWeek 1: ☐ Dev setup ☐ Codebase tour ☐ Meet team ☐ First PR' } })); }
    },
  ],
  incident: [
    { tool: 'get_jira_tickets', title: 'Checking for related incidents', desc: 'Scanning Jira board for any open tickets related to payment service.', delay: 500 },
    { tool: 'create_jira_ticket', title: 'Creating P1 outage ticket', desc: 'Ticket FLW-109: "OUTAGE — Payment service 500 errors, production" created.', delay: 800,
      action: (state, setState) => { setState(s => ({ ...s, jira: [...s.jira, { id: 'FLW-109', title: 'OUTAGE: Payment service 500 errors — production', priority: 'P1', assignee: 'On-Call', status: 'open', created: 'Just now' }] })); }
    },
    { tool: 'post_slack_message', title: 'Paging on-call team', desc: 'CRITICAL alert posted to #incidents with all details, severity and ticket link.', delay: 700,
      action: (state, setState) => { setState(s => ({ ...s, slack: [...s.slack, { user: 'FlowMind AI', init: 'FM', color: '#ff4f6d', msg: '🔴 PRODUCTION DOWN: Payment 500s for 10min. ~2000 users blocked. FLW-109 created. @channel to war room NOW.', time: now(), channel: '#incidents' }] })); }
    },
    { tool: 'create_notion_page', title: 'Creating post-mortem template', desc: 'Notion incident page created with timeline, impact stats, and action item checklist.', delay: 900,
      action: (state, setState) => { setState(s => ({ ...s, notion: { title: '🔴 Post-Mortem: Payment Outage — ' + today(), body: 'Detected: ' + now() + ' | Severity: P1 | Impact: ~2000 users\nRoot cause: Under investigation.\nActions: ☐ Identify root cause ☐ Deploy fix ☐ Status updates every 15min' } })); }
    },
  ],
  feedback: [
    { tool: 'get_jira_tickets', title: 'Checking for existing performance tickets', desc: 'Looking for any duplicate performance issues before creating a new one.', delay: 700 },
    { tool: 'create_jira_ticket', title: 'Creating P2 performance ticket', desc: 'FLW-110: Dashboard load time issue created with customer feedback summary.', delay: 900,
      action: (state, setState) => { setState(s => ({ ...s, jira: [...s.jira, { id: 'FLW-110', title: 'Performance: Dashboard load >8s — 50 user complaints', priority: 'P2', assignee: 'Priya S', status: 'open', created: 'Just now' }] })); }
    },
    { tool: 'post_slack_message', title: 'Sharing feedback with product team', desc: 'Summary with key stats and sentiment analysis posted to #product.', delay: 800,
      action: (state, setState) => { setState(s => ({ ...s, slack: [...s.slack, { user: 'FlowMind AI', init: 'FM', color: '#ff4f6d', msg: '📊 Feedback Alert: 50 users flagged slow dashboard this week. Avg: 8.3s load vs 2s target. FLW-110 created. @Priya S to investigate.', time: now(), channel: '#product' }] })); }
    },
    { tool: 'create_notion_page', title: 'Logging in Notion feedback tracker', desc: 'Feedback log updated with trend analysis and priority recommendation.', delay: 900,
      action: (state, setState) => { setState(s => ({ ...s, notion: { title: 'Customer Feedback — Week ' + getWeek(), body: 'Top Issue: Dashboard slow load (50 complaints, 35% negative sentiment)\nSeverity: High — P2 ticket created.\nTrend: Performance complaints +40% vs last week.' } })); }
    },
  ],
};

// ── Alias exports (used by geminiAgent / new imports) ───────────────────────
export const initialJiraTickets  = initialJira;
export const initialSlackMessages = initialSlack;
export const initialNotionPage   = initialNotion;

// Helpers
function now() {
  const d = new Date();
  const h = d.getHours(), m = d.getMinutes();
  return `${h}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}
function today() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
function getWeek() {
  const d = new Date();
  return `${Math.ceil(d.getDate()/7)}/${d.getMonth()+1}`;
}
