import styles from './MockPanels.module.css';

export function JiraPanel({ tickets, isFlashing }) {
  return (
    <div className={`${styles.panel} ${isFlashing ? styles.flash : ''}`}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>📋</span>
        <span className={styles.headerTitle}>Jira — FLW Project</span>
        <span className={styles.headerCount}>{tickets.length} tickets</span>
      </div>
      <div className={styles.body}>
        {tickets.slice(-5).map(t => (
          <div key={t.id} className={styles.jiraRow}>
            <span className={`p${t.priority.charAt(1)}`}>{t.priority}</span>
            <span className={styles.ticketId}>{t.id}</span>
            <span className={styles.ticketTitle}>{t.title}</span>
            <span className={styles.ticketAssignee}>{t.assignee}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SlackPanel({ messages, isFlashing }) {
  return (
    <div className={`${styles.panel} ${isFlashing ? styles.flash : ''}`}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>💬</span>
        <span className={styles.headerTitle}>Slack — #dev-alerts</span>
      </div>
      <div className={styles.body}>
        {messages.slice(-4).map((m, i) => (
          <div key={i} className={styles.slackRow}>
            <div className={styles.avatar} style={{ background: m.color + '25', color: m.color }}>{m.init}</div>
            <div className={styles.slackContent}>
              <div className={styles.slackMeta}>
                <span className={styles.slackName}>{m.user}</span>
                <span className={styles.slackTime}>{m.time}</span>
              </div>
              <div className={styles.slackMsg}>{m.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotionPanel({ page, isFlashing }) {
  return (
    <div className={`${styles.panel} ${isFlashing ? styles.flash : ''}`}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>📝</span>
        <span className={styles.headerTitle}>Notion — Workspace</span>
      </div>
      <div className={styles.notionBody}>
        <div className={styles.notionTitle}>{page.title}</div>
        <div className={styles.notionText}>{page.body}</div>
      </div>
    </div>
  );
}
