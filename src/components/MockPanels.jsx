import { motion, AnimatePresence } from 'framer-motion';
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
        <AnimatePresence>
          {tickets.slice(-5).map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, backgroundColor: 'rgba(124,58,237,0.2)' }}
              animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
              transition={{ duration: 0.8 }}
              className={styles.jiraRow}
            >
              <PriorityBadge priority={t.priority} />
              <span className={styles.ticketId}>{t.id}</span>
              <span className={styles.ticketTitle}>{t.title}</span>
              <span className={styles.ticketAssignee}>{t.assignee}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const pNum = priority?.charAt(1);
  const styles_map = {
    '1': { background: '#7f1d1d', color: '#fca5a5', dot: true },
    '2': { background: '#7c2d12', color: '#fdba74', dot: false },
    '3': { background: '#1e3a5f', color: '#93c5fd', dot: false },
  };
  const s = styles_map[pNum] || { background: 'var(--bg4)', color: 'var(--text2)', dot: false };

  return (
    <span style={{
      background: s.background,
      color: s.color,
      borderRadius: '4px',
      padding: '2px 7px',
      fontSize: '.68rem',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
    }}>
      {s.dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#fca5a5',
          animation: 'pulseDot 1s infinite',
          display: 'inline-block',
        }} />
      )}
      {priority}
    </span>
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
        <AnimatePresence>
          {messages.slice(-4).map((m, i) => {
            const isAI = m.user === 'FlowMind AI' || m.init === 'AI' || m.init === 'FM';
            return (
              <motion.div
                key={m.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={styles.slackRow}
              >
                <div
                  className={styles.avatar}
                  style={{
                    background: m.color + '25',
                    color: m.color,
                    ...(isAI ? {
                      boxShadow: '0 0 0 2px #7C3AED, 0 0 12px rgba(124,58,237,0.4)',
                    } : {}),
                  }}
                >
                  {m.init}
                </div>
                <div className={styles.slackContent}>
                  <div className={styles.slackMeta}>
                    <span className={styles.slackName}>{m.user}</span>
                    <span className={styles.slackTime}>{m.time}</span>
                  </div>
                  <div className={styles.slackMsg}>{m.msg}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
