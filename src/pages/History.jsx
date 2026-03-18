import { useState, useEffect } from 'react';
import styles from './History.module.css';

const appColors = { Jira: '#4da6ff', Slack: '#f0b429', Notion: '#00d4aa', Internal: '#a78bfa' };

export default function History() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [undone, setUndone] = useState(new Set());
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('flowmind_token')
    if (!token) return
    fetch('/api/save-workflow', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      // Map the DB structure to the UI structure if needed
      const mapped = (data.history || []).map(h => ({
        time: new Date(h.created_at).toLocaleTimeString(),
        tool: 'workflow_run',
        workflow: 'Custom Workflow',
        desc: h.prompt,
        app: JSON.parse(h.apps_updated || '[]').join(', '),
        status: 'success'
      }));
      setHistory(mapped);
    })
  }, []);

  const apps = ['All', 'Jira', 'Slack', 'Notion'];
  const filtered = history
    .filter(h => filter === 'All' || h.app.includes(filter))
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
          <div className={styles.summaryNum}>{history.length}</div>
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
