import { useState } from 'react';
import styles from './History.module.css';

const SAMPLE_HISTORY = [
  { time: '14:31:02', tool: 'create_jira_ticket', workflow: 'Bug Escalation', desc: 'Created P1 ticket FLW-106 for Safari login crash', app: 'Jira', status: 'success' },
  { time: '14:31:01', tool: 'analyze_severity', workflow: 'Bug Escalation', desc: 'Classified as P1 based on 400+ affected users', app: 'Internal', status: 'success' },
  { time: '14:30:58', tool: 'get_jira_tickets', workflow: 'Bug Escalation', desc: 'Fetched 5 open tickets from FLW project board', app: 'Jira', status: 'success' },
  { time: '13:05:44', tool: 'create_notion_page', workflow: 'Sprint Review', desc: 'Created Sprint 23 retrospective page in Notion', app: 'Notion', status: 'success' },
  { time: '13:05:40', tool: 'post_slack_message', workflow: 'Sprint Review', desc: 'Posted Sprint 23 digest to #general channel', app: 'Slack', status: 'success' },
  { time: '13:05:35', tool: 'create_jira_ticket', workflow: 'Sprint Review', desc: 'Created Sprint 23 review ticket with velocity stats', app: 'Jira', status: 'success' },
  { time: '11:42:17', tool: 'create_notion_page', workflow: 'Onboarding', desc: 'Created onboarding page for Priya Nair', app: 'Notion', status: 'success' },
  { time: '11:42:12', tool: 'post_slack_message', workflow: 'Onboarding', desc: 'Sent welcome message to #team-general for Priya Nair', app: 'Slack', status: 'success' },
  { time: '11:42:08', tool: 'create_jira_ticket', workflow: 'Onboarding', desc: 'Created P2 onboarding ticket for Priya Nair — Frontend Dev', app: 'Jira', status: 'success' },
  { time: '10:18:33', tool: 'create_notion_page', workflow: 'Incident Response', desc: 'Created post-mortem template for payment outage', app: 'Notion', status: 'success' },
  { time: '10:18:28', tool: 'post_slack_message', workflow: 'Incident Response', desc: 'Paged on-call team in #incidents with critical alert', app: 'Slack', status: 'success' },
  { time: '10:18:22', tool: 'create_jira_ticket', workflow: 'Incident Response', desc: 'Created P1 OUTAGE ticket for payment service 500 errors', app: 'Jira', status: 'success' },
];

const appColors = { Jira: '#4da6ff', Slack: '#f0b429', Notion: '#00d4aa', Internal: '#a78bfa' };

export default function History() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [undone, setUndone] = useState(new Set());

  const apps = ['All', 'Jira', 'Slack', 'Notion'];
  const filtered = SAMPLE_HISTORY
    .filter(h => filter === 'All' || h.app === filter)
    .filter(h => !search || h.desc.toLowerCase().includes(search.toLowerCase()) || h.tool.includes(search.toLowerCase()));

  const handleUndo = (i) => setUndone(s => new Set([...s, i]));

  const grouped = {};
  filtered.forEach((h, i) => {
    const wf = h.workflow;
    if (!grouped[wf]) grouped[wf] = [];
    grouped[wf].push({ ...h, origIdx: i });
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className="section-label">Audit Trail</div>
          <h1 className={styles.pageTitle}>Action <span className="grad-text">History</span></h1>
          <p className={styles.pageSub}>Every tool call logged. One-click undo. Enterprise-grade accountability.</p>
        </div>
        <div className={styles.summaryStat}>
          <div className={styles.summaryNum}>{SAMPLE_HISTORY.length}</div>
          <div className={styles.summaryLabel}>Total actions</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {apps.map(a => (
            <button
              key={a}
              className={`${styles.filterBtn} ${filter === a ? styles.filterActive : ''}`}
              onClick={() => setFilter(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <input
          className={`${styles.search} input`}
          placeholder="Search actions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '240px' }}
        />
      </div>

      {/* Grouped history */}
      {Object.entries(grouped).map(([workflow, items]) => (
        <div key={workflow} className={styles.group}>
          <div className={styles.groupHeader}>
            <span className={styles.groupName}>{workflow}</span>
            <span className="badge badge-teal">{items.length} actions</span>
          </div>
          <div className={`${styles.table} card`}>
            {items.map((h, i) => (
              <div key={i} className={`${styles.row} ${undone.has(h.origIdx) ? styles.undone : ''}`}>
                <div className={styles.timeCol}>
                  <span className={styles.time}>{h.time}</span>
                </div>
                <div className={styles.toolCol}>
                  <span className={styles.toolName}>{h.tool}()</span>
                </div>
                <div className={styles.descCol}>
                  <span className={styles.desc}>{h.desc}</span>
                </div>
                <div className={styles.appCol}>
                  <span className="badge" style={{ background: appColors[h.app] + '20', color: appColors[h.app], border: `1px solid ${appColors[h.app]}40` }}>
                    {h.app}
                  </span>
                </div>
                <div className={styles.actionCol}>
                  {undone.has(h.origIdx) ? (
                    <span className={styles.undoneLabel}>↩ Undone</span>
                  ) : (
                    <button className={styles.undoBtn} onClick={() => handleUndo(h.origIdx)}>↩ Undo</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <p>No actions match your filter.</p>
        </div>
      )}
    </div>
  );
}
